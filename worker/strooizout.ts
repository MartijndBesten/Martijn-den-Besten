// Strooizout voor de buurt: publieke API van de webshop (/api/strooizout/*) en doorverwijzing naar het beheer.
// Bron van waarheid voor prijzen, voorraad en bezorgkosten; de browser stuurt alleen product-ID's en aantallen.
// Zie docs/strooizout/README.md.

import { rateLimit } from "./begrenzing";
import {
  BESTEL_STATUS,
  GRENZEN,
  bereken,
  bestelnummer,
  betaalstatus,
  BETAAL_STATUS,
  controleerKlant,
  maakAfhaalcode,
  zakkenIn,
  type Betaalwijze,
  type BestelStatus,
  type Levering,
  type PubliekMoment,
  type Winkel,
} from "../shared/strooizout";
import {
  alsPrijs,
  beschikbaar,
  bestelStatements,
  fout,
  laadMagazijn,
  zakkenPerStuk,
  geheim,
  hmacHex,
  json,
  klantCode,
  laadCatalogus,
  laadInstellingen,
  leesJson,
  leesKlantCode,
  logStmt,
  nuIso,
  openRonde,
  publiek,
  sameOrigin,
  teKoop,
  voorraadEffect,
  vrijgeefStatements,
  type SzEnv,
} from "./strooizout-basis";
import { handleBeheer } from "./strooizout-beheer";

const UUR = 3600;
const DAG = 86400;

async function bezoeker(request: Request, env: SzEnv, nu: number): Promise<string> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "onbekend";
  return (await hmacHex(geheim(env), `strooizout|${ip}|${new Date(nu * 1000).toISOString().slice(0, 10)}`)).slice(0, 32);
}

// ---------- Catalogus ----------

type MomentRij = { id: number; soort: Levering; datum: string; van: string; tot: string; omschrijving: string; max_bestellingen: number | null; bezet: number };

/** Datum (JJJJ-MM-DD) en tijd (UU:MM) in Nederlandse tijd. */
export function amsterdam(iso: string): { datum: string; tijd: string } {
  const delen = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
  const [datum, tijd] = delen.split(" ");
  return { datum, tijd };
}

async function momentenVoor(db: D1Database, rondeId: number | null, nu: string): Promise<PubliekMoment[]> {
  // Alleen momenten die nog niet voorbij zijn, in Nederlandse tijd (vandaag: alleen als de eindtijd nog moet komen).
  const { datum: vandaag, tijd } = amsterdam(nu);
  const { results } = await db
    .prepare(
      `SELECT m.id, m.soort, m.datum, m.van, m.tot, m.omschrijving, m.max_bestellingen,
              (SELECT COUNT(*) FROM sz_bestelling b WHERE b.moment_id = m.id AND b.status != 'geannuleerd') AS bezet
       FROM sz_moment m
       WHERE m.actief = 1 AND (m.datum > ?1 OR (m.datum = ?1 AND m.tot > ?3)) AND (m.ronde_id IS NULL OR m.ronde_id = ?2)
       ORDER BY m.datum, m.van`,
    )
    .bind(vandaag, rondeId, tijd)
    .all<MomentRij>();
  return results.map((m) => ({ id: m.id, soort: m.soort, datum: m.datum, van: m.van, tot: m.tot, omschrijving: m.omschrijving, vol: m.max_bestellingen !== null && m.bezet >= m.max_bestellingen }));
}

async function winkel(env: SzEnv): Promise<Response> {
  const nu = nuIso();
  const [inst, cat, ronde, cats, magazijn] = await Promise.all([
    laadInstellingen(env.DB),
    laadCatalogus(env.DB),
    openRonde(env.DB, nu),
    env.DB.prepare("SELECT slug, naam FROM sz_categorie ORDER BY volgorde, id").all<{ slug: string; naam: string }>(),
    laadMagazijn(env.DB),
  ]);
  const open = inst.winkel_open && ronde !== null && (inst.afhalen_aan || inst.bezorgen_aan);
  const melding = !inst.winkel_open
    ? inst.gesloten_melding
    : !ronde
      ? "Er is op dit moment geen bestelronde open. Zodra de volgende ronde start, kun je hier weer bestellen."
      : "";
  const data: Winkel = {
    open,
    melding,
    ronde: ronde ? { id: ronde.id, naam: ronde.naam, sluit_op: ronde.sluit_op } : null,
    producten: cat.producten.filter(teKoop).map((p) => publiek(cat, p, inst.bezorg_per_stuk_cent, magazijn)),
    categorieen: cats.results,
    momenten: ronde ? await momentenVoor(env.DB, ronde.id, nu) : [],
    instellingen: {
      afhalen_aan: inst.afhalen_aan,
      afhaal_plek: inst.afhaal_plek,
      bezorgen_aan: inst.bezorgen_aan,
      bezorg_postcodes: inst.bezorg_postcodes,
      bezorg_methode: inst.bezorg_methode,
      bezorg_per_stuk_cent: inst.bezorg_per_stuk_cent,
      bezorg_per_kg_cent: inst.bezorg_per_kg_cent,
      bezorg_uitleg: inst.bezorg_uitleg,
      tikkie_aan: inst.tikkie_aan,
      contact_naam: inst.contact_naam,
      contact_email: inst.contact_email,
      contact_telefoon: inst.contact_telefoon,
      voorwaarden: inst.voorwaarden,
      btw_modus: inst.btw_modus,
      btw_tarief: inst.btw_tarief,
      bewaartermijn_maanden: inst.bewaartermijn_maanden,
      bezorg_min_zakken: inst.bezorg_min_zakken,
      beschikbaar_vanaf: inst.beschikbaar_vanaf,
      verkoper_naam: inst.verkoper_naam,
      verkoper_adres: inst.verkoper_adres,
      verkoper_kvk: inst.verkoper_kvk,
      verkoper_btw: inst.verkoper_btw,
      verkoper_email: inst.verkoper_email,
    },
    nu,
  };
  return json({ ok: true, ...data });
}

// ---------- Bestellen ----------

const IDEMPOTENTIE = /^[A-Za-z0-9-]{16,64}$/;

async function bestaandAntwoord(env: SzEnv, id: number): Promise<Response> {
  return json({ ok: true, herhaald: true, ...(await klantWeergave(env, id)) }, 200);
}

async function plaatsBestelling(request: Request, env: SzEnv, nuSec: number): Promise<Response> {
  if (!sameOrigin(request)) return fout("Bestellen kan alleen via de webshop.", 403);
  const body = await leesJson(request);
  if (body instanceof Response) return body;

  // Honeypot en invultijd: een verborgen veld dat mensen niet zien, en geen inzending binnen een paar seconden.
  if ((typeof body.bedrijf_extra === "string" && body.bedrijf_extra.trim() !== "") || typeof body.invultijd_ms !== "number" || body.invultijd_ms < GRENZEN.minInvultijdMs) {
    return fout("Controleer je gegevens en probeer het nog een keer.", 400);
  }

  const idem = body.idempotentie;
  if (typeof idem !== "string" || !IDEMPOTENTIE.test(idem)) return fout("Herlaad de pagina en probeer het opnieuw.", 400);

  // Dubbel klikken of opnieuw versturen: dezelfde bestelling teruggeven, nooit een tweede maken.
  const al = await env.DB.prepare("SELECT id FROM sz_bestelling WHERE idempotentie = ?1").bind(idem).first<{ id: number }>();
  if (al) return bestaandAntwoord(env, al.id);

  // Pogingen (ook met fouten) ruim begrenzen; geplaatste bestellingen strenger, pas vlak voor het opslaan. De grenzen zijn
  // bewust niet krap: op mobiele netwerken delen veel buren één IP-adres (CGNAT).
  const wie = await bezoeker(request, env, nuSec);
  if (!(await rateLimit(env.DB, "sz-poging", wie, 80, UUR, nuSec))) return fout("Te veel pogingen. Probeer het over een uur opnieuw of neem contact op.", 429, {}, { "Retry-After": "3600" });

  const nu = nuIso();
  const [inst, cat, ronde] = await Promise.all([laadInstellingen(env.DB), laadCatalogus(env.DB), openRonde(env.DB, nu)]);
  if (!inst.winkel_open) return fout(inst.gesloten_melding, 409, { code: "gesloten" });
  const isStraat = body.kanaal === "straat";
  if (!ronde && !isStraat) return fout("De bestelronde is gesloten. Je kunt nu niet bestellen.", 409, { code: "gesloten" });

  // Kanaal: de webshop, of de QR-route aan de weg (alleen ophalen ter plekke, naam niet nodig).
  const kanaal = body.kanaal === "straat" ? "straat" : "web";
  const levering = kanaal === "straat" ? "ophalen" : body.levering;
  if (levering !== "ophalen" && levering !== "bezorgen") return fout("Kies ophalen of bezorgen.", 422, { veld: "levering" });
  if (levering === "ophalen" && !inst.afhalen_aan && kanaal === "web") return fout("Ophalen is op dit moment niet mogelijk.", 422, { veld: "levering" });
  if (levering === "bezorgen" && !inst.bezorgen_aan) return fout("Bezorgen is op dit moment niet mogelijk. Je kunt je bestelling wel ophalen.", 422, { veld: "levering" });

  const betaalwijze = body.betaalwijze;
  if (betaalwijze !== "bij_ontvangst" && betaalwijze !== "tikkie") return fout("Kies hoe je wilt betalen.", 422, { veld: "betaalwijze" });
  if (betaalwijze === "tikkie" && !inst.tikkie_aan) return fout("Betalen via Tikkie is op dit moment niet mogelijk.", 422, { veld: "betaalwijze" });
  if (body.akkoord !== true) return fout("Ga akkoord met de voorwaarden om je reservering te plaatsen.", 422, { veld: "akkoord" });

  // Regels: alleen product-ID en aantal tellen. Prijzen uit de browser worden genegeerd.
  const ruw = Array.isArray(body.regels) ? body.regels : [];
  if (ruw.length === 0) return fout("Je winkelmandje is leeg.", 422, { veld: "regels" });
  if (ruw.length > GRENZEN.maxRegels) return fout("Te veel verschillende producten in één bestelling.", 422, { veld: "regels" });
  const regels: { product: ReturnType<typeof alsPrijs>; aantal: number; rij: (typeof cat.producten)[number] }[] = [];
  const gezien = new Set<number>();
  for (const r of ruw as { product_id?: unknown; aantal?: unknown }[]) {
    const id = r?.product_id;
    const aantal = r?.aantal;
    if (typeof id !== "number" || !Number.isInteger(id) || gezien.has(id)) return fout("Je winkelmandje klopt niet. Herlaad de pagina.", 422, { veld: "regels" });
    gezien.add(id);
    const p = cat.perId.get(id);
    if (!p || !teKoop(p)) return fout("Een product in je mandje is niet meer te bestellen. Herlaad de pagina.", 409, { veld: "regels", code: "product" });
    if (typeof aantal !== "number" || !Number.isInteger(aantal) || aantal < 1) return fout(`Kies een geldig aantal voor ${p.naam}.`, 422, { veld: "regels" });
    if (aantal > p.max_per_bestelling) return fout(`Je kunt maximaal ${p.max_per_bestelling} × ${p.naam} per bestelling reserveren.`, 422, { veld: "regels" });
    const vrij = beschikbaar(cat, p);
    if (vrij !== null && aantal > vrij) return fout(vrij === 0 ? `${p.naam} is uitverkocht.` : `Er zijn nog ${vrij} × ${p.naam} beschikbaar.`, 409, { veld: "regels", code: "voorraad" });
    regels.push({ product: alsPrijs(cat, p, inst.bezorg_per_stuk_cent), aantal, rij: p });
  }
  if (levering === "bezorgen" && inst.bezorg_min_zakken > 0 && zakkenIn(regels.map((r) => ({ aantal: r.aantal, zakken_per_stuk: zakkenPerStuk(cat, r.rij) }))) < inst.bezorg_min_zakken) {
    return fout(`Bezorgen kan vanaf ${inst.bezorg_min_zakken} zakken. Je kunt je bestelling wel gratis ophalen.`, 422, { veld: "levering" });
  }
  if (regels.reduce((s, r) => s + r.aantal, 0) > GRENZEN.maxStuksPerBestelling) return fout("Dat is meer dan we in één bestelling kunnen verwerken. Neem contact op.", 422, { veld: "regels" });

  // Moment: verplicht als er voor deze leveringswijze momenten zijn (niet aan de weg: daar haal je direct op).
  const momenten = kanaal === "straat" || !ronde ? [] : (await momentenVoor(env.DB, ronde.id, nu)).filter((m) => m.soort === levering);
  let momentId: number | null = null;
  if (momenten.length) {
    const gekozen = momenten.find((m) => m.id === body.moment_id);
    if (!gekozen) return fout(levering === "bezorgen" ? "Kies een bezorgmoment." : "Kies een ophaalmoment.", 422, { veld: "moment" });
    if (gekozen.vol) return fout("Dit moment is vol. Kies een ander moment.", 409, { veld: "moment" });
    momentId = gekozen.id;
  }

  const klantInvoer = { ...((body.klant ?? {}) as Record<string, unknown>) };
  if (kanaal === "straat" && (typeof klantInvoer.naam !== "string" || klantInvoer.naam.trim().length < 2)) klantInvoer.naam = "Aan de weg";
  const klant = controleerKlant(klantInvoer, levering as Levering, inst.bezorg_postcodes);
  if (!klant.ok) return fout("Controleer de gemarkeerde velden.", 422, { velden: klant.fouten });
  const k = klant.waarde;

  const perUur = await rateLimit(env.DB, "sz-bestel-u", wie, 20, UUR, nuSec);
  const perDag = perUur && (await rateLimit(env.DB, "sz-bestel-d", wie, 60, DAG, nuSec));
  if (!perUur || !perDag) return fout("Er zijn vanaf dit adres al veel bestellingen geplaatst. Probeer het later opnieuw of neem contact op.", 429, {}, { "Retry-After": "3600" });

  const som = bereken(regels.map((r) => ({ product: r.product, aantal: r.aantal })), levering as Levering, inst, nu);

  // Voorraad: alles in één batch (D1 = één transactie). De CHECK (voorraad >= 0) laat de hele batch mislukken bij te weinig.
  const effect = new Map<number, number>();
  for (const r of regels) voorraadEffect(cat, r.rij, r.aantal, effect);
  // Aan de weg koop je wat er ligt: alleen uit werkelijk ontvangen voorraad.
  if (kanaal === "straat") {
    const magazijn = await laadMagazijn(env.DB);
    for (const [pid, n] of effect) {
      if ((magazijn.get(pid) ?? 0) < n) return fout("Er ligt op dit moment niet genoeg op voorraad. Bestel via de webshop of probeer het later.", 409, { code: "voorraad" });
    }
  }

  const db = env.DB;
  const maakStatements = (afhaalcode: string) =>
    bestelStatements(db, { idempotentie: idem, afhaalcode, rondeId: ronde?.id ?? null, kanaal, levering: levering as Levering, momentId, klant: k, betaalwijze: betaalwijze as Betaalwijze, som, effect, nu });

  // Unieke afhaalcode: willekeurig, de UNIQUE-index bewaakt botsingen (ook bij gelijktijdige bestellingen); bij een botsing
  // opnieuw met een andere code. Na een paar pogingen een cijfer langer (H-12345).
  for (let poging = 0; poging < 12; poging++) {
    let code = maakAfhaalcode(poging < 6 ? 4 : 5);
    for (let i = 0; i < 5 && (await db.prepare("SELECT 1 FROM sz_bestelling WHERE afhaalcode = ?1").bind(code).first()); i++) code = maakAfhaalcode(poging < 6 ? 4 : 5);
    try {
      await db.batch(maakStatements(code));
      const nieuw = await db.prepare("SELECT id FROM sz_bestelling WHERE idempotentie = ?1").bind(idem).first<{ id: number }>();
      return json({ ok: true, herhaald: false, ...(await klantWeergave(env, nieuw!.id)) }, 201);
    } catch (e) {
      const tekst = String((e as Error)?.message ?? e);
      if (/UNIQUE/i.test(tekst) && /idempotentie/i.test(tekst)) {
        const zelfde = await db.prepare("SELECT id FROM sz_bestelling WHERE idempotentie = ?1").bind(idem).first<{ id: number }>();
        if (zelfde) return bestaandAntwoord(env, zelfde.id);
      }
      if (/UNIQUE/i.test(tekst) && /afhaalcode/i.test(tekst)) continue;
      if (/NOT NULL/i.test(tekst) && /bestelling_id/i.test(tekst) && momentId !== null) return fout("Dit moment is net vol geraakt. Kies een ander moment.", 409, { veld: "moment" });
      if (/CHECK/i.test(tekst)) return fout("Iemand was je net voor: er is niet genoeg voorraad meer. Pas het aantal aan.", 409, { code: "voorraad" });
      throw e;
    }
  }
  throw new Error("geen vrije afhaalcode gevonden");
}

// ---------- Bestelpagina van de klant ----------

type BestellingRij = {
  id: number;
  status: BestelStatus;
  levering: Levering;
  moment_id: number | null;
  naam: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  betaalwijze: Betaalwijze;
  subtotaal_cent: number;
  korting_cent: number;
  bezorg_cent: number;
  totaal_cent: number;
  aangemaakt: string;
  geanonimiseerd_op: string | null;
  afhaalcode: string | null;
  betaalverzoek_op: string | null;
  kanaal: "web" | "straat" | "beheer";
};

/** Wat de klant over de eigen bestelling ziet. Het volledige afhaaladres pas na bevestiging. */
async function klantWeergave(env: SzEnv, id: number) {
  const db = env.DB;
  const [b, regels, moment, betaald, inst] = await Promise.all([
    db.prepare("SELECT * FROM sz_bestelling WHERE id = ?1").bind(id).first<BestellingRij>(),
    db.prepare("SELECT naam, aantal, stukprijs_cent, normaalprijs_cent, aanbieding FROM sz_bestelregel WHERE bestelling_id = ?1 ORDER BY id").bind(id).all(),
    db.prepare("SELECT m.soort, m.datum, m.van, m.tot, m.omschrijving FROM sz_moment m JOIN sz_bestelling b ON b.moment_id = m.id WHERE b.id = ?1").bind(id).first(),
    db.prepare("SELECT COALESCE(SUM(bedrag_cent), 0) AS som, COALESCE(SUM(CASE WHEN bedrag_cent > 0 THEN bedrag_cent END), 0) AS ontvangen FROM sz_betaling WHERE bestelling_id = ?1").bind(id).first<{ som: number; ontvangen: number }>(),
    laadInstellingen(db),
  ]);
  if (!b) throw new Error("bestelling verdwenen");
  const bevestigd = ["bevestigd", "klaar", "afgehaald"].includes(b.status);
  const bs = betaalstatus({ totaal_cent: b.totaal_cent, betaald_cent: betaald?.som ?? 0, ontvangen_cent: betaald?.ontvangen ?? 0, betaalverzoek_op: b.betaalverzoek_op });
  return {
    bestelling: {
      nummer: bestelnummer(b.id),
      afhaalcode: b.afhaalcode ?? "",
      kanaal: b.kanaal,
      betaalstatus: bs,
      betaalstatus_tekst: BETAAL_STATUS[bs],
      code: await klantCode(env, b.id),
      status: b.status,
      status_tekst: BESTEL_STATUS[b.status],
      levering: b.levering,
      moment,
      voornaam: b.naam.split(" ")[0],
      adres: b.levering === "bezorgen" ? `${b.straat} ${b.huisnummer}, ${b.postcode} ${b.plaats}`.trim() : "",
      betaalwijze: b.betaalwijze,
      regels: regels.results,
      subtotaal_cent: b.subtotaal_cent,
      korting_cent: b.korting_cent,
      bezorg_cent: b.bezorg_cent,
      totaal_cent: b.totaal_cent,
      betaald_cent: betaald?.som ?? 0,
      aangemaakt: b.aangemaakt,
      kan_annuleren: ["nieuw", "bevestigd", "klaar"].includes(b.status),
      afhaal_plek: inst.afhaal_plek,
      afhaal_adres: b.levering === "ophalen" && bevestigd ? inst.afhaal_adres : "",
      afhaal_instructie: b.levering === "ophalen" && bevestigd ? inst.afhaal_instructie : "",
      bevestiging_tekst: inst.bevestiging_tekst,
      contact: { naam: inst.contact_naam, email: inst.contact_email, telefoon: inst.contact_telefoon },
    },
  };
}

async function bekijk(request: Request, env: SzEnv): Promise<Response> {
  if (!sameOrigin(request)) return fout("Alleen via de webshop.", 403);
  const body = await leesJson(request, 1024);
  if (body instanceof Response) return body;
  const id = await leesKlantCode(env, body.code);
  if (id === null) return fout("Deze bestelling bestaat niet, of de link is niet compleet.", 404);
  const bestaat = await env.DB.prepare("SELECT geanonimiseerd_op FROM sz_bestelling WHERE id = ?1").bind(id).first<{ geanonimiseerd_op: string | null }>();
  if (!bestaat) return fout("Deze bestelling bestaat niet (meer).", 404);
  if (bestaat.geanonimiseerd_op) return fout("Deze bestelling is afgerond en de gegevens zijn na de bewaartermijn gewist.", 410);
  return json({ ok: true, ...(await klantWeergave(env, id)) });
}

async function annuleerDoorKlant(request: Request, env: SzEnv): Promise<Response> {
  if (!sameOrigin(request)) return fout("Alleen via de webshop.", 403);
  const body = await leesJson(request, 1024);
  if (body instanceof Response) return body;
  const id = await leesKlantCode(env, body.code);
  if (id === null) return fout("Deze bestelling bestaat niet, of de link is niet compleet.", 404);
  const b = await env.DB.prepare("SELECT status FROM sz_bestelling WHERE id = ?1 AND geanonimiseerd_op IS NULL").bind(id).first<{ status: BestelStatus }>();
  if (!b) return fout("Deze bestelling bestaat niet (meer).", 404);
  if (b.status === "geannuleerd") return json({ ok: true, ...(await klantWeergave(env, id)) });
  if (!["nieuw", "bevestigd", "klaar"].includes(b.status)) return fout("Deze bestelling is al afgehaald of bezorgd en kan niet meer geannuleerd worden.", 409);
  const nu = nuIso();
  const db = env.DB;
  const res = await db.batch([
    db.prepare("UPDATE sz_bestelling SET status = 'geannuleerd', gewijzigd = ?2, afgerond_op = ?2 WHERE id = ?1 AND status = ?3").bind(id, nu, b.status),
    ...vrijgeefStatements(db, id),
    logStmt(db, id, "geannuleerd door klant", `was ${b.status}`),
  ]);
  if ((res[0].meta?.changes ?? 0) === 0) return fout("De bestelling is net gewijzigd. Herlaad de pagina.", 409);
  return json({ ok: true, ...(await klantWeergave(env, id)) });
}

// ---------- Afbeeldingen ----------

async function afbeelding(env: SzEnv, id: number, hash: string, request: Request): Promise<Response> {
  const rij = await env.DB.prepare("SELECT type, data, hash FROM sz_afbeelding WHERE id = ?1").bind(id).first<{ type: string; data: ArrayBuffer | number[]; hash: string }>();
  if (!rij || rij.hash !== hash) return new Response("Niet gevonden", { status: 404, headers: { "Cache-Control": "no-store" } });
  const etag = `"${rij.hash}"`;
  const headers = {
    "Content-Type": rij.type,
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
  if (request.headers.get("If-None-Match") === etag) return new Response(null, { status: 304, headers });
  const data = rij.data instanceof ArrayBuffer ? new Uint8Array(rij.data) : new Uint8Array(rij.data);
  return new Response(data, { headers });
}

// ---------- Router ----------

export async function handleStrooizout(request: Request, env: SzEnv, ctx: ExecutionContext, nuSec: number): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method.toUpperCase();
  if (!path.startsWith("/api/strooizout")) return null;

  if (path === "/api/strooizout/winkel" && method === "GET") return winkel(env);
  // Zonder HASH_SECRET zijn de persoonlijke bestellinks te raden: dan niet bestellen of bekijken (fail closed).
  if (path.startsWith("/api/strooizout/bestelling") && !env.HASH_SECRET) {
    console.error("Strooizout: HASH_SECRET ontbreekt; bestellen staat uit");
    return fout("Bestellen is tijdelijk niet mogelijk. Probeer het later opnieuw.", 503);
  }
  if (path === "/api/strooizout/bestelling" && method === "POST") return plaatsBestelling(request, env, nuSec);
  if (path === "/api/strooizout/bestelling/bekijk" && method === "POST") return bekijk(request, env);
  if (path === "/api/strooizout/bestelling/annuleer" && method === "POST") return annuleerDoorKlant(request, env);
  const beeld = path.match(/^\/api\/strooizout\/afbeelding\/(\d{1,9})-([0-9a-f]{16})$/);
  if (beeld && (method === "GET" || method === "HEAD")) return afbeelding(env, Number(beeld[1]), beeld[2], request);
  if (path.startsWith("/api/strooizout/beheer")) return handleBeheer(request, env, ctx, nuSec, path.slice("/api/strooizout/beheer".length), method);
  return fout("Onbekend adres.", 404);
}
