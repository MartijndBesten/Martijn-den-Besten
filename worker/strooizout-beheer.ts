// Strooizout voor de buurt: beheer-API (/api/strooizout/beheer/*). Alleen met een geldig beheertoken
// (Worker-secret STROOIZOUT_TOKEN, of het algemene ADMIN_TOKEN van de site). Persoonsgegevens komen niet in logs.

import { rateLimit } from "./begrenzing";
import {
  BESTEL_STATUS,
  BETAAL_STATUS,
  INSTELLING_VELDEN,
  RONDE_STATUS,
  STATUS_OVERGANG,
  betaalstatus,
  bestelnummer,
  btwDeel,
  bereken,
  controleerInstelling,
  maakAfhaalcode,
  normaliseerAfhaalcode,
  normaliseerMobiel,
  wijkVan,
  type BestelStatus,
  type Instellingen,
} from "../shared/strooizout";
import {
  alsPrijs,
  beschikbaar,
  bestelStatements,
  bezorgVan,
  laadMagazijn,
  tekortBijUitgifte,
  voorraadEffect,
  fout,
  gelijk,
  gewichtVan,
  hmacHex,
  inkoopVan,
  json,
  klantCode,
  laadCatalogus,
  laadInstellingen,
  leesJson,
  log,
  logStmt,
  nuIso,
  specs,
  vrijgeefStatements,
  type Catalogus,
  type ProductRij,
  type RondeRij,
  type SzEnv,
} from "./strooizout-basis";
import { STROOIZOUT_DOMEIN } from "./strooizout-domein";

const MAX_POGINGEN = 20;
const UUR = 3600;

// ---------- Toegang ----------

function tokens(env: SzEnv): string[] {
  return [env.STROOIZOUT_TOKEN, env.ADMIN_TOKEN].filter((t): t is string => typeof t === "string" && t.length >= 24);
}

async function toegang(request: Request, env: SzEnv, nuSec: number): Promise<Response | null> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "onbekend";
  const wie = (await hmacHex(env.HASH_SECRET || "strooizout-beheer", `strooizout-beheer|${ip}`)).slice(0, 32);
  const venster = Math.floor(nuSec / UUR) * UUR;
  const pogingen = await env.DB.prepare("SELECT count FROM rate_limits WHERE key = ?1").bind(`sz-login:${wie}:${venster}`).first<{ count: number }>();
  if ((pogingen?.count ?? 0) >= MAX_POGINGEN) return fout("Te veel mislukte pogingen. Probeer het over een uur opnieuw.", 429, {}, { "Retry-After": "3600" });
  const header = request.headers.get("Authorization") ?? "";
  const geldig = header.startsWith("Bearer ") && tokens(env).some((t) => gelijk(header.slice(7), t));
  if (geldig) return null;
  await rateLimit(env.DB, "sz-login", wie, MAX_POGINGEN, UUR, nuSec);
  return fout(tokens(env).length ? "Geen toegang. Controleer je beheercode." : "Het beheer is nog niet ingesteld (geen beheertoken).", 401, {}, { "WWW-Authenticate": "Bearer" });
}

// ---------- Hulp ----------

const tekst = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const t = v.replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  return t.length <= max ? t : null;
};
const centOfNull = (v: unknown, max = 1_000_000): number | null | undefined => {
  if (v === null || v === "" || v === undefined) return null;
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max ? v : undefined;
};
const geheel = (v: unknown, min: number, max: number): number | null => (typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : null);
const isoOfNull = (v: unknown): string | null | undefined => {
  if (v === null || v === "" || v === undefined) return null;
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};
const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const TIJD = /^([01]\d|2[0-3]):[0-5]\d$/;

function slugVan(naam: string): string {
  return (
    naam
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product"
  );
}

type BestellingVol = {
  id: number;
  ronde_id: number | null;
  status: BestelStatus;
  levering: "ophalen" | "bezorgen";
  moment_id: number | null;
  naam: string;
  email: string;
  telefoon: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  opmerking: string;
  beheer_notitie: string;
  betaalwijze: "bij_ontvangst" | "tikkie";
  subtotaal_cent: number;
  korting_cent: number;
  bezorg_cent: number;
  totaal_cent: number;
  gewicht_gram: number;
  aangemaakt: string;
  gewijzigd: string;
  afgerond_op: string | null;
  geanonimiseerd_op: string | null;
  afhaalcode: string | null;
  betaalverzoek_op: string | null;
  kanaal: "web" | "straat" | "beheer";
  voorbestelling: number;
  betaald_cent: number;
  ontvangen_cent: number;
};

type RegelVol = {
  id: number;
  bestelling_id: number;
  product_id: number;
  naam: string;
  aantal: number;
  stukprijs_cent: number;
  normaalprijs_cent: number;
  inkoop_cent: number | null;
  bezorg_cent: number;
  gewicht_gram: number;
  aanbieding: string;
};

const bs = (b: BestellingVol) => betaalstatus({ totaal_cent: b.totaal_cent, betaald_cent: b.betaald_cent, ontvangen_cent: b.ontvangen_cent, betaalverzoek_op: b.betaalverzoek_op });

/** Leest het rondefilter: een ID, 'alle', of leeg (= nieuwste ronde). */
async function rondeFilter(db: D1Database, waarde: string | null): Promise<number | null> {
  if (waarde === "alle") return null;
  if (waarde && /^\d{1,9}$/.test(waarde)) return Number(waarde);
  const laatste = await db.prepare("SELECT id FROM sz_ronde ORDER BY id DESC LIMIT 1").first<{ id: number }>();
  return laatste?.id ?? null;
}

async function laadBestellingen(db: D1Database, rondeId: number | null): Promise<{ bestellingen: BestellingVol[]; regels: RegelVol[] }> {
  const [b, r] = await db.batch([
    db
      .prepare(
        `SELECT b.*, (SELECT COALESCE(SUM(bedrag_cent), 0) FROM sz_betaling p WHERE p.bestelling_id = b.id) AS betaald_cent, (SELECT COALESCE(SUM(CASE WHEN bedrag_cent > 0 THEN bedrag_cent END), 0) FROM sz_betaling p WHERE p.bestelling_id = b.id) AS ontvangen_cent
         FROM sz_bestelling b WHERE (?1 IS NULL OR b.ronde_id = ?1) ORDER BY b.id DESC`,
      )
      .bind(rondeId),
    db
      .prepare(
        `SELECT r.* FROM sz_bestelregel r JOIN sz_bestelling b ON b.id = r.bestelling_id
         WHERE (?1 IS NULL OR b.ronde_id = ?1) ORDER BY r.id`,
      )
      .bind(rondeId),
  ]);
  return { bestellingen: (b.results ?? []) as BestellingVol[], regels: (r.results ?? []) as RegelVol[] };
}

/** Inkoop van een regel: vastgelegd bij bestellen, anders de huidige inkoopprijs van het product. null = onbekend. */
function regelInkoop(cat: Catalogus, r: RegelVol): number | null {
  if (r.inkoop_cent !== null) return r.inkoop_cent * r.aantal;
  const p = cat.perId.get(r.product_id);
  const nu = p ? inkoopVan(cat, p) : null;
  return nu === null ? null : nu * r.aantal;
}

function dubbelen(bestellingen: BestellingVol[]): Set<number> {
  const teller = new Map<string, number[]>();
  for (const b of bestellingen) {
    if (b.status === "geannuleerd" || b.geanonimiseerd_op) continue;
    for (const sleutel of [b.email ? `e:${b.ronde_id}:${b.email}` : "", `t:${b.ronde_id}:${b.telefoon}`].filter(Boolean)) teller.set(sleutel, [...(teller.get(sleutel) ?? []), b.id]);
  }
  const uit = new Set<number>();
  for (const ids of teller.values()) if (ids.length > 1) ids.forEach((i) => uit.add(i));
  return uit;
}

const OPEN_STATUS: BestelStatus[] = ["nieuw", "bevestigd", "klaar"];

// ---------- Overzicht en financiën ----------

/** Bedrag zonder btw als prijzen inclusief btw zijn ingesteld. */
const exBtw = (inst: Instellingen, cent: number) => (inst.btw_modus === "inclusief" ? cent - btwDeel(cent, inst.btw_tarief) : cent);

function cijfers(cat: Catalogus, inst: Instellingen, bestellingen: BestellingVol[], regels: RegelVol[]) {
  const geldig = bestellingen.filter((b) => b.status !== "geannuleerd");
  const geldigIds = new Set(geldig.map((b) => b.id));
  const geldigeRegels = regels.filter((r) => geldigIds.has(r.bestelling_id));

  const perProduct = new Map<number, { product_id: number; naam: string; eenheid: string; aantal: number; omzet_cent: number; inkoop_cent: number; inkoop_onbekend: boolean; gewicht_gram: number }>();
  let inkoop = 0;
  let inkoopOnbekend = false;
  for (const r of geldigeRegels) {
    const p = cat.perId.get(r.product_id);
    const rij = perProduct.get(r.product_id) ?? { product_id: r.product_id, naam: r.naam, eenheid: p?.eenheid ?? "stuk", aantal: 0, omzet_cent: 0, inkoop_cent: 0, inkoop_onbekend: false, gewicht_gram: 0 };
    rij.aantal += r.aantal;
    rij.omzet_cent += r.stukprijs_cent * r.aantal;
    rij.gewicht_gram += r.gewicht_gram * r.aantal;
    const ink = regelInkoop(cat, r);
    if (ink === null) {
      rij.inkoop_onbekend = true;
      inkoopOnbekend = true;
    } else {
      rij.inkoop_cent += ink;
      inkoop += ink;
    }
    perProduct.set(r.product_id, rij);
  }
  const omzet = geldig.reduce((s, b) => s + b.totaal_cent, 0);
  const productOmzet = geldig.reduce((s, b) => s + b.subtotaal_cent, 0);
  const bezorg = geldig.reduce((s, b) => s + b.bezorg_cent, 0);
  const korting = geldig.reduce((s, b) => s + b.korting_cent, 0);
  const ontvangen = bestellingen.reduce((s, b) => s + b.betaald_cent, 0);
  const statussen = { open: 0, verzoek: 0, betaald: 0, terugbetaald: 0 };
  let openstaand = 0;
  for (const b of geldig) {
    statussen[bs(b)]++;
    openstaand += Math.max(0, b.totaal_cent - b.betaald_cent);
  }
  const terugTeBetalen = bestellingen.filter((b) => b.status === "geannuleerd" && b.betaald_cent > 0).reduce((s, b) => s + b.betaald_cent, 0);
  const terugbetaald = bestellingen.reduce((s, b) => s + (b.ontvangen_cent - b.betaald_cent), 0);
  const zakken = [...perProduct.values()].filter((p) => p.eenheid === "zak").reduce((s, p) => s + p.aantal, 0);
  return {
    bestellingen: geldig.length,
    geannuleerd: bestellingen.length - geldig.length,
    stuks: geldigeRegels.reduce((s, r) => s + r.aantal, 0),
    zakken,
    gewicht_gram: geldig.reduce((s, b) => s + b.gewicht_gram, 0),
    omzet_cent: omzet,
    product_omzet_cent: productOmzet,
    bezorg_cent: bezorg,
    korting_cent: korting,
    inkoop_cent: inkoop,
    inkoop_onbekend: inkoopOnbekend,
    // Marge pas tonen als er ergens een inkoopprijs bekend is (besluit Martijn: inkoop mag leeg blijven en blokkeert niets).
    inkoop_bekend: geldigeRegels.some((r) => regelInkoop(cat, r) !== null) || cat.producten.some((p) => p.status === "actief" && inkoopVan(cat, p) !== null),
    brutowinst_cent: omzet - inkoop,
    // Marge exclusief btw: omzet en inkoop (incl. btw ingevoerd) allebei zonder btw. Denckh is btw-plichtig, dus de btw op
    // de inkoop is voorbelasting en geen kostprijs.
    marge_excl_cent: exBtw(inst, omzet) - exBtw(inst, inkoop),
    product_marge_excl_cent: exBtw(inst, productOmzet) - exBtw(inst, inkoop),
    btw_cent: inst.btw_modus === "inclusief" ? btwDeel(omzet, inst.btw_tarief) : null,
    ontvangen_cent: ontvangen,
    openstaand_cent: openstaand,
    terug_te_betalen_cent: terugTeBetalen,
    terugbetaald_cent: terugbetaald,
    betaalstatus: statussen,
    af_te_halen: geldig.filter((b) => b.levering === "ophalen" && OPEN_STATUS.includes(b.status)).length,
    te_bezorgen: geldig.filter((b) => b.levering === "bezorgen" && OPEN_STATUS.includes(b.status)).length,
    afgehaald: geldig.filter((b) => b.status === "afgehaald").length,
    bezorgd: geldig.filter((b) => b.status === "bezorgd").length,
    voorbestellingen: geldig.filter((b) => b.voorbestelling === 1 && OPEN_STATUS.includes(b.status)).length,
    per_kanaal: Object.fromEntries(
      (["web", "straat", "beheer"] as const).map((k) => [k, { bestellingen: geldig.filter((b) => b.kanaal === k).length, omzet_cent: geldig.filter((b) => b.kanaal === k).reduce((s, b) => s + b.totaal_cent, 0) }]),
    ),
    per_status: Object.fromEntries(Object.keys(BESTEL_STATUS).map((s) => [s, bestellingen.filter((b) => b.status === s).length])),
    per_product: [...perProduct.values()].map((p) => ({ ...p, marge_cent: p.inkoop_onbekend ? null : p.omzet_cent - p.inkoop_cent, marge_excl_cent: p.inkoop_onbekend ? null : exBtw(inst, p.omzet_cent) - exBtw(inst, p.inkoop_cent) })),
  };
}

async function werkelijkeInkoop(db: D1Database, rondeId: number | null): Promise<number | null> {
  // Per ronde: het factuurbedrag als dat is ingevuld, anders de som van de inkoopregels; daarna opgeteld.
  const r = await db
    .prepare(
      `SELECT SUM(COALESCE(r.inkoop_bedrag_cent, (SELECT SUM(i.aantal * i.stukprijs_cent) FROM sz_ronde_inkoop i WHERE i.ronde_id = r.id))) AS som
       FROM sz_ronde r WHERE (?1 IS NULL OR r.id = ?1)`,
    )
    .bind(rondeId)
    .first<{ som: number | null }>();
  return r?.som ?? null;
}

async function overzicht(request: Request, env: SzEnv, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const rondeId = await rondeFilter(env.DB, url.searchParams.get("ronde"));
  const [cat, inst, data, rondes] = await Promise.all([
    laadCatalogus(env.DB, { ookVerwijderd: true }),
    laadInstellingen(env.DB),
    laadBestellingen(env.DB, rondeId),
    rondeLijst(env.DB),
  ]);
  ctx.waitUntil(opschonen(env.DB, inst).catch(() => {}));
  const waarschuwingen: string[] = [];
  if (!inst.afhaal_adres && inst.afhalen_aan) waarschuwingen.push("Het afhaaladres is nog niet ingevuld (Instellingen).");
  if (!inst.contact_email && !inst.contact_telefoon) waarschuwingen.push("Er staan nog geen contactgegevens in de instellingen.");
  for (const p of cat.producten) {
    const vrij = p.status === "actief" ? beschikbaar(cat, p) : null;
    if (vrij !== null && vrij <= inst.lage_voorraad) waarschuwingen.push(vrij === 0 ? `${p.naam}: uitverkocht, er kan niets meer gereserveerd worden.` : `${p.naam}: nog ${vrij} te reserveren (Voorraad).`);
  }
  if (!rondes.some((r) => r.status === "open")) waarschuwingen.push("Er is geen open bestelronde: klanten kunnen nu niet bestellen.");
  return json({ ok: true, ronde_id: rondeId, rondes, cijfers: cijfers(cat, inst, data.bestellingen, data.regels), werkelijke_inkoop_cent: await werkelijkeInkoop(env.DB, rondeId), waarschuwingen, winkel_open: inst.winkel_open });
}

async function financien(request: Request, env: SzEnv): Promise<Response> {
  const url = new URL(request.url);
  const rondeId = await rondeFilter(env.DB, url.searchParams.get("ronde"));
  const [cat, inst, data] = await Promise.all([laadCatalogus(env.DB, { ookVerwijderd: true }), laadInstellingen(env.DB), laadBestellingen(env.DB, rondeId)]);
  const { results: betalingen } = await env.DB.prepare(
    `SELECT p.wijze, COUNT(*) AS n, SUM(p.bedrag_cent) AS som FROM sz_betaling p JOIN sz_bestelling b ON b.id = p.bestelling_id
     WHERE (?1 IS NULL OR b.ronde_id = ?1) GROUP BY p.wijze`,
  )
    .bind(rondeId)
    .all();
  return json({ ok: true, ronde_id: rondeId, cijfers: cijfers(cat, inst, data.bestellingen, data.regels), per_wijze: betalingen, werkelijke_inkoop_cent: await werkelijkeInkoop(env.DB, rondeId), btw_modus: inst.btw_modus, btw_tarief: inst.btw_tarief });
}

// ---------- Bestellingen ----------

async function regelsPer(regels: RegelVol[]): Promise<Map<number, RegelVol[]>> {
  const m = new Map<number, RegelVol[]>();
  for (const r of regels) m.set(r.bestelling_id, [...(m.get(r.bestelling_id) ?? []), r]);
  return m;
}

function lijstRij(b: BestellingVol, regels: RegelVol[], dubbel: boolean, wijken: string) {
  return {
    id: b.id,
    nummer: bestelnummer(b.id),
    afhaalcode: b.afhaalcode ?? "",
    kanaal: b.kanaal,
    voorbestelling: b.voorbestelling === 1,
    ronde_id: b.ronde_id,
    status: b.status,
    levering: b.levering,
    moment_id: b.moment_id,
    naam: b.naam,
    email: b.email,
    telefoon: b.telefoon,
    adres: b.levering === "bezorgen" ? `${b.straat} ${b.huisnummer}` : "",
    postcode: b.postcode,
    plaats: b.plaats,
    wijk: b.levering === "bezorgen" ? wijkVan(b.postcode, wijken) : "",
    opmerking: b.opmerking,
    betaalwijze: b.betaalwijze,
    totaal_cent: b.totaal_cent,
    betaald_cent: b.betaald_cent,
    betaalstatus: bs(b),
    betaalverzoek_op: b.betaalverzoek_op,
    stuks: regels.reduce((s, r) => s + r.aantal, 0),
    samenvatting: regels.map((r) => `${r.aantal}× ${r.naam}`).join(", "),
    aangemaakt: b.aangemaakt,
    mogelijk_dubbel: dubbel,
    geanonimiseerd: !!b.geanonimiseerd_op,
  };
}

async function bestellingen(request: Request, env: SzEnv): Promise<Response> {
  const url = new URL(request.url);
  const q = url.searchParams;
  const rondeId = await rondeFilter(env.DB, q.get("ronde"));
  const [inst, data] = await Promise.all([laadInstellingen(env.DB), laadBestellingen(env.DB, rondeId)]);
  const per = await regelsPer(data.regels);
  const dubbel = dubbelen(data.bestellingen);
  const zoek = (q.get("zoek") ?? "").trim().toLowerCase();
  const status = q.get("status") ?? "";
  const levering = q.get("levering") ?? "";
  const betaal = q.get("betaal") ?? "";
  const moment = q.get("moment") ?? "";
  const lijst = data.bestellingen
    .filter((b) => {
      if (status === "open" ? !OPEN_STATUS.includes(b.status) : status && b.status !== status) return false;
      if (levering && b.levering !== levering) return false;
      if (moment && String(b.moment_id ?? "") !== moment) return false;
      if (betaal) {
        const st = bs(b);
        if (betaal === "nietbetaald" ? st === "betaald" || st === "terugbetaald" : st !== betaal) return false;
      }
      if (zoek) {
        // Zoeken op bestelnummer, afhaalcode, naam of mobiel nummer (ook als +31 6… of met spaties ingetypt), e-mail of postcode.
        const code = normaliseerAfhaalcode(zoek);
        const mobiel = normaliseerMobiel(zoek) ?? (/^[\d\s+-]{4,}$/.test(zoek) ? zoek.replace(/\D/g, "").replace(/^(00)?31/, "0") : "");
        const hooi = [bestelnummer(b.id), b.afhaalcode ?? "", b.naam, b.email, b.telefoon, b.postcode, b.straat, b.opmerking].join(" ").toLowerCase();
        const raak = hooi.includes(zoek) || (code !== null && b.afhaalcode === code) || (mobiel !== "" && b.telefoon.includes(mobiel));
        if (!raak) return false;
      }
      return true;
    })
    .map((b) => lijstRij(b, per.get(b.id) ?? [], dubbel.has(b.id), inst.wijken));
  return json({ ok: true, ronde_id: rondeId, bestellingen: lijst, totaal: data.bestellingen.length });
}

async function bestelling(env: SzEnv, id: number, request: Request): Promise<Response> {
  const db = env.DB;
  const b = await db
    .prepare(`SELECT b.*, (SELECT COALESCE(SUM(bedrag_cent), 0) FROM sz_betaling p WHERE p.bestelling_id = b.id) AS betaald_cent, (SELECT COALESCE(SUM(CASE WHEN bedrag_cent > 0 THEN bedrag_cent END), 0) FROM sz_betaling p WHERE p.bestelling_id = b.id) AS ontvangen_cent FROM sz_bestelling b WHERE b.id = ?1`)
    .bind(id)
    .first<BestellingVol>();
  if (!b) return fout("Bestelling niet gevonden.", 404);
  const [regels, betalingen, logboek, moment, inst] = await Promise.all([
    db.prepare("SELECT * FROM sz_bestelregel WHERE bestelling_id = ?1 ORDER BY id").bind(id).all<RegelVol>(),
    db.prepare("SELECT id, bedrag_cent, wijze, notitie, op FROM sz_betaling WHERE bestelling_id = ?1 ORDER BY id").bind(id).all(),
    db.prepare("SELECT actie, details, op FROM sz_log WHERE bestelling_id = ?1 ORDER BY id DESC LIMIT 50").bind(id).all(),
    b.moment_id ? db.prepare("SELECT * FROM sz_moment WHERE id = ?1").bind(b.moment_id).first() : Promise.resolve(null),
    laadInstellingen(db),
  ]);
  const origin = new URL(request.url).origin;
  return json({
    ok: true,
    bestelling: {
      ...b,
      nummer: bestelnummer(b.id),
      wijk: b.levering === "bezorgen" ? wijkVan(b.postcode, inst.wijken) : "",
      betaalstatus: bs(b),
      klant_link: `${origin}${new URL(request.url).hostname === STROOIZOUT_DOMEIN ? "" : "/strooizout"}/bestelling#${await klantCode(env, b.id)}`,
      overgangen: STATUS_OVERGANG[b.status].filter((s) => !(s === "afgehaald" && b.levering !== "ophalen") && !(s === "bezorgd" && b.levering !== "bezorgen")),
    },
    regels: regels.results,
    betalingen: betalingen.results,
    log: logboek.results,
    moment,
  });
}

async function wijzigStatus(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const naar = body.status as BestelStatus;
  if (!(naar in BESTEL_STATUS)) return fout("Onbekende status.", 400);
  const b = await env.DB.prepare("SELECT status, levering FROM sz_bestelling WHERE id = ?1").bind(id).first<{ status: BestelStatus; levering: string }>();
  if (!b) return fout("Bestelling niet gevonden.", 404);
  if (typeof body.van === "string" && body.van !== b.status) return fout("De bestelling is intussen gewijzigd. Vernieuw het overzicht.", 409);
  if (b.status === naar) return json({ ok: true });
  if (!STATUS_OVERGANG[b.status].includes(naar)) return fout(`Van ‘${BESTEL_STATUS[b.status]}’ naar ‘${BESTEL_STATUS[naar]}’ kan niet.`, 409);
  if (naar === "afgehaald" && b.levering !== "ophalen") return fout("Deze bestelling wordt bezorgd, niet afgehaald.", 409);
  if (naar === "bezorgd" && b.levering !== "bezorgen") return fout("Deze bestelling wordt afgehaald, niet bezorgd.", 409);
  if (["klaar", "afgehaald", "bezorgd"].includes(naar) && !["klaar", "afgehaald", "bezorgd"].includes(b.status)) {
    const tekort = await tekortBijUitgifte(env.DB, id);
    if (tekort) return fout(tekort, 409, { code: "voorraad" });
  }
  const nu = nuIso();
  const eind = ["afgehaald", "bezorgd", "geannuleerd"].includes(naar);
  const db = env.DB;
  const res = await db.batch([
    db.prepare("UPDATE sz_bestelling SET status = ?2, gewijzigd = ?3, afgerond_op = ?4 WHERE id = ?1 AND status = ?5").bind(id, naar, nu, eind ? nu : null, b.status),
    ...(naar === "geannuleerd" ? vrijgeefStatements(db, id) : []),
    logStmt(db, id, "status", `${b.status} → ${naar}`),
  ]);
  if ((res[0].meta?.changes ?? 0) === 0) return fout("De bestelling is intussen gewijzigd. Vernieuw het overzicht.", 409);
  return json({ ok: true });
}

const WIJZEN = ["contant", "tikkie", "overboeking", "pin", "terugbetaling"] as const;

async function registreerBetaling(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  if (body.ontvangen !== true) return fout("Bevestig dat het geld echt is ontvangen (of terugbetaald).", 422);
  const wijze = body.wijze as (typeof WIJZEN)[number];
  if (!WIJZEN.includes(wijze)) return fout("Kies hoe er betaald is.", 422);
  const bedrag = geheel(body.bedrag_cent, 1, 1_000_000);
  if (bedrag === null) return fout("Vul een bedrag in.", 422);
  const notitie = tekst(body.notitie ?? "", 200);
  if (notitie === null) return fout("Notitie is te lang (max. 200 tekens).", 422);
  if (/\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7,}\b/i.test(notitie.replace(/\s/g, ""))) return fout("Zet geen rekeningnummers in de notitie.", 422);
  const b = await env.DB.prepare("SELECT id FROM sz_bestelling WHERE id = ?1").bind(id).first();
  if (!b) return fout("Bestelling niet gevonden.", 404);
  const bedragCent = wijze === "terugbetaling" ? -bedrag : bedrag;
  const nu = nuIso();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO sz_betaling (bestelling_id, bedrag_cent, wijze, notitie, op) VALUES (?1, ?2, ?3, ?4, ?5)").bind(id, bedragCent, wijze, notitie, nu),
    env.DB.prepare("UPDATE sz_bestelling SET gewijzigd = ?2 WHERE id = ?1").bind(id, nu),
    logStmt(env.DB, id, "betaling", `${wijze} ${bedragCent}`),
  ]);
  return json({ ok: true });
}

async function verwijderBetaling(env: SzEnv, betalingId: number): Promise<Response> {
  const p = await env.DB.prepare("SELECT bestelling_id, bedrag_cent, wijze FROM sz_betaling WHERE id = ?1").bind(betalingId).first<{ bestelling_id: number; bedrag_cent: number; wijze: string }>();
  if (!p) return fout("Betaling niet gevonden.", 404);
  await env.DB.batch([env.DB.prepare("DELETE FROM sz_betaling WHERE id = ?1").bind(betalingId), logStmt(env.DB, p.bestelling_id, "betaling verwijderd", `${p.wijze} ${p.bedrag_cent}`)]);
  return json({ ok: true });
}

async function bewerkBestelling(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const b = await env.DB.prepare("SELECT levering FROM sz_bestelling WHERE id = ?1").bind(id).first<{ levering: string }>();
  if (!b) return fout("Bestelling niet gevonden.", 404);
  const notitie = tekst(body.beheer_notitie ?? "", 1000);
  if (notitie === null) return fout("Notitie is te lang.", 422);
  let moment: number | null = null;
  if (body.moment_id !== null && body.moment_id !== undefined && body.moment_id !== "") {
    const m = await env.DB.prepare("SELECT id, soort FROM sz_moment WHERE id = ?1").bind(body.moment_id).first<{ id: number; soort: string }>();
    if (!m || m.soort !== b.levering) return fout("Dit moment past niet bij deze bestelling.", 422);
    moment = m.id;
  }
  await env.DB.batch([
    env.DB.prepare("UPDATE sz_bestelling SET beheer_notitie = ?2, moment_id = ?3, gewijzigd = ?4 WHERE id = ?1").bind(id, notitie, moment, nuIso()),
    logStmt(env.DB, id, "bewerkt", "notitie/moment"),
  ]);
  return json({ ok: true });
}

/** Handmatig betaalverzoek (bijv. Tikkie) als verstuurd markeren of terugzetten. Maakt een bestelling nooit ‘betaald’. */
async function betaalverzoek(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  if (typeof body.verstuurd !== "boolean") return fout("Geef aan of het betaalverzoek verstuurd is.", 422);
  const nu = nuIso();
  const res = await env.DB.batch([
    env.DB.prepare("UPDATE sz_bestelling SET betaalverzoek_op = ?2, gewijzigd = ?3 WHERE id = ?1 AND geanonimiseerd_op IS NULL").bind(id, body.verstuurd ? nu : null, nu),
    logStmt(env.DB, id, body.verstuurd ? "betaalverzoek verstuurd" : "betaalverzoek teruggezet"),
  ]);
  if ((res[0].meta?.changes ?? 0) === 0) return fout("Bestelling niet gevonden.", 404);
  return json({ ok: true });
}

// ---------- Afhalen (uitgifte op code) ----------

async function zoekOpAfhaalcode(env: SzEnv, ruw: string) {
  const code = normaliseerAfhaalcode(decodeURIComponent(ruw));
  if (!code) return null;
  const b = await env.DB.prepare(`SELECT b.*, ${"(SELECT COALESCE(SUM(bedrag_cent), 0) FROM sz_betaling p WHERE p.bestelling_id = b.id) AS betaald_cent, (SELECT COALESCE(SUM(CASE WHEN bedrag_cent > 0 THEN bedrag_cent END), 0) FROM sz_betaling p WHERE p.bestelling_id = b.id) AS ontvangen_cent"} FROM sz_bestelling b WHERE b.afhaalcode = ?1`)
    .bind(code)
    .first<BestellingVol>();
  return b ? { code, b } : { code, b: null };
}

async function afhaalWeergave(env: SzEnv, b: BestellingVol) {
  const [regels, moment] = await Promise.all([
    env.DB.prepare(
      `SELECT r.naam, r.aantal, p.eenheid,
              (SELECT COALESCE(SUM(o.aantal), 0) FROM sz_pakket_onderdeel o JOIN sz_product d ON d.id = o.product_id WHERE o.pakket_id = r.product_id AND d.eenheid = 'zak') AS zakken_per_stuk
       FROM sz_bestelregel r LEFT JOIN sz_product p ON p.id = r.product_id WHERE r.bestelling_id = ?1 ORDER BY r.id`,
    )
      .bind(b.id)
      .all<{ naam: string; aantal: number; eenheid: string | null; zakken_per_stuk: number }>(),
    b.moment_id ? env.DB.prepare("SELECT datum, van, tot FROM sz_moment WHERE id = ?1").bind(b.moment_id).first() : Promise.resolve(null),
  ]);
  const zakken = regels.results.reduce((s, r) => s + (r.eenheid === "zak" ? r.aantal : r.aantal * r.zakken_per_stuk), 0);
  return {
    id: b.id,
    nummer: bestelnummer(b.id),
    afhaalcode: b.afhaalcode,
    naam: b.naam,
    telefoon: b.telefoon,
    levering: b.levering,
    status: b.status,
    uitgegeven: b.status === "afgehaald" || b.status === "bezorgd",
    uitgegeven_op: b.status === "afgehaald" || b.status === "bezorgd" ? b.afgerond_op : null,
    geannuleerd: b.status === "geannuleerd",
    zakken,
    regels: regels.results.map((r) => ({ naam: r.naam, aantal: r.aantal })),
    totaal_cent: b.totaal_cent,
    betaald_cent: b.betaald_cent,
    open_cent: Math.max(0, b.totaal_cent - b.betaald_cent),
    betaalstatus: bs(b),
    moment,
    opmerking: b.opmerking,
  };
}

async function afhalenZoeken(env: SzEnv, ruw: string): Promise<Response> {
  const r = await zoekOpAfhaalcode(env, ruw);
  if (!r) return fout("Een afhaalcode ziet eruit als H-4827.", 422);
  if (!r.b) return fout(`Geen bestelling met code ${r.code}.`, 404);
  return json({ ok: true, bestelling: await afhaalWeergave(env, r.b) });
}

/**
 * Uitgeven (afgehaald of bezorgd) in één atomaire stap, optioneel met de ontvangen betaling erbij. Een tweede uitgifte
 * (ook gelijktijdig vanaf een andere telefoon) faalt: de statuswissel gebeurt alleen vanuit een open status, en de
 * betaling wordt alleen geboekt als déze wissel slaagde.
 */
async function uitgeven(request: Request, env: SzEnv, ruw: string): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const r = await zoekOpAfhaalcode(env, ruw);
  if (!r) return fout("Een afhaalcode ziet eruit als H-4827.", 422);
  if (!r.b) return fout(`Geen bestelling met code ${r.code}.`, 404);
  const b = r.b;
  let betaling: { wijze: string; bedrag: number } | null = null;
  if (body.betaling !== undefined && body.betaling !== null) {
    const p = body.betaling as Record<string, unknown>;
    if (p.ontvangen !== true) return fout("Bevestig dat het geld echt is ontvangen.", 422);
    const wijze = String(p.wijze ?? "");
    if (!["contant", "tikkie", "pin", "overboeking"].includes(wijze)) return fout("Kies hoe er betaald is.", 422);
    const bedragCent = geheel(p.bedrag_cent, 1, 1_000_000);
    if (bedragCent === null) return fout("Ongeldig bedrag.", 422);
    betaling = { wijze, bedrag: bedragCent };
  }
  const naar = b.levering === "bezorgen" ? "bezorgd" : "afgehaald";
  if (["nieuw", "bevestigd", "klaar"].includes(b.status)) {
    const tekort = await tekortBijUitgifte(env.DB, b.id);
    if (tekort) return fout(tekort, 409, { bestelling: await afhaalWeergave(env, b), code: "voorraad" });
  }
  const nu = nuIso();
  // Uniek kenmerk per uitgifte (niet de tijd: twee verzoeken in dezelfde milliseconde zouden anders dezelfde waarde hebben).
  const uitgifteId = crypto.randomUUID();
  const db = env.DB;
  const res = await db.batch([
    db.prepare(`UPDATE sz_bestelling SET status = ?2, afgerond_op = ?3, gewijzigd = ?3, uitgifte_id = ?4 WHERE id = ?1 AND status IN ('nieuw', 'bevestigd', 'klaar')`).bind(b.id, naar, nu, uitgifteId),
    ...(betaling
      ? [
          db.prepare(
            `INSERT INTO sz_betaling (bestelling_id, bedrag_cent, wijze, notitie, op)
             SELECT ?1, ?2, ?3, 'bij uitgifte', ?4 WHERE EXISTS (SELECT 1 FROM sz_bestelling WHERE id = ?1 AND uitgifte_id = ?5)`,
          ).bind(b.id, betaling.bedrag, betaling.wijze, nu, uitgifteId),
        ]
      : []),
    db.prepare(`INSERT INTO sz_log (bestelling_id, actie, details, op) SELECT ?1, 'uitgegeven', ?2, ?3 WHERE EXISTS (SELECT 1 FROM sz_bestelling WHERE id = ?1 AND uitgifte_id = ?4)`).bind(
      b.id,
      `${b.status} → ${naar}${betaling ? `, ${betaling.wijze} ${betaling.bedrag}` : ""}`,
      nu,
      uitgifteId,
    ),
  ]);
  if ((res[0].meta?.changes ?? 0) === 0) {
    const nuB = (await zoekOpAfhaalcode(env, ruw))!.b!;
    const w = await afhaalWeergave(env, nuB);
    if (w.uitgegeven) return fout(`Deze bestelling is al ${naar === "bezorgd" ? "bezorgd" : "uitgegeven"}.`, 409, { bestelling: w });
    return fout(w.geannuleerd ? "Deze bestelling is geannuleerd." : "Deze bestelling kan nu niet worden uitgegeven.", 409, { bestelling: w });
  }
  return json({ ok: true, bestelling: await afhaalWeergave(env, (await zoekOpAfhaalcode(env, ruw))!.b!) });
}

// ---------- Voorraad ----------

async function voorraadOverzicht(env: SzEnv) {
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.naam, p.eenheid, p.status, p.voorraad AS beschikbaar, p.voorraad_verwacht AS verwacht, p.voorraad_ontvangen AS ontvangen,
            COALESCE((SELECT SUM(m.aantal) FROM sz_voorraad_mutatie m JOIN sz_bestelling b ON b.id = m.bestelling_id
                      WHERE m.product_id = p.id AND b.status != 'geannuleerd' AND b.voorraad_vrijgegeven = 0), 0) AS gereserveerd,
            COALESCE((SELECT SUM(m.aantal) FROM sz_voorraad_mutatie m JOIN sz_bestelling b ON b.id = m.bestelling_id
                      WHERE m.product_id = p.id AND b.status IN ('afgehaald', 'bezorgd')), 0) AS uitgegeven
     FROM sz_product p WHERE p.status != 'verwijderd' ORDER BY p.volgorde, p.id`,
  ).all<{ id: number; naam: string; eenheid: string; status: string; beschikbaar: number | null; verwacht: number | null; ontvangen: number; gereserveerd: number; uitgegeven: number }>();
  return results.map((r) => ({ ...r, in_magazijn: r.ontvangen - r.uitgegeven, nog_uit_te_geven: r.gereserveerd - r.uitgegeven }));
}

/**
 * Emmers afvullen uit zakken: de gebruikte zakken gaan van de zakvoorraad af (ontvangen, verwacht én te reserveren),
 * de gevulde emmers komen erbij als ontvangen voorraad. Alleen uit zakken die er liggen én niet gereserveerd zijn.
 */
async function afvullen(request: Request, env: SzEnv): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const emmers = geheel(body.emmers, 1, 1000);
  const zakken = geheel(body.zakken, 1, 100);
  const emmerId = geheel(body.emmer_id, 1, 1e9);
  const zakId = geheel(body.zak_id, 1, 1e9);
  if (emmers === null || zakken === null || emmerId === null || zakId === null || emmerId === zakId) return fout("Vul het aantal emmers en gebruikte zakken in.", 422);
  const db = env.DB;
  const [emmer, zak] = await Promise.all(
    [emmerId, zakId].map((id) => db.prepare("SELECT id, naam, gewicht_gram, voorraad FROM sz_product WHERE id = ?1 AND status != 'verwijderd'").bind(id).first<{ id: number; naam: string; gewicht_gram: number; voorraad: number | null }>()),
  );
  if (!emmer || !zak) return fout("Product niet gevonden.", 404);
  if (!emmer.gewicht_gram || !zak.gewicht_gram) return fout("Vul eerst het gewicht van beide producten in (Producten).", 422);
  const nodig = emmers * emmer.gewicht_gram;
  const gebruikt = zakken * zak.gewicht_gram;
  if (nodig > gebruikt) return fout(`${emmers} emmers vragen ${nodig / 1000} kg; ${zakken} ${zakken === 1 ? "zak is" : "zakken zijn"} ${gebruikt / 1000} kg.`, 422);
  const z = (await voorraadOverzicht(env)).find((r) => r.id === zakId)!;
  if (z.in_magazijn < zakken) return fout(`Er liggen ${z.in_magazijn} zakken in voorraad; afvullen kan alleen uit ontvangen zakken.`, 409);
  if (z.beschikbaar !== null && z.beschikbaar < zakken) return fout(`Nog ${z.beschikbaar} zakken zijn niet gereserveerd. Gereserveerde zakken kunnen niet worden afgevuld.`, 409);
  const rest = gebruikt - nodig;
  try {
    const res = await db.batch([
      db
        .prepare(
          `UPDATE sz_product SET voorraad_ontvangen = voorraad_ontvangen - ?2, voorraad_verwacht = CASE WHEN voorraad_verwacht IS NULL THEN NULL ELSE voorraad_verwacht - ?2 END,
             voorraad = CASE WHEN voorraad IS NULL THEN NULL ELSE voorraad - ?2 END, gewijzigd = ?4 WHERE id = ?1 AND voorraad_ontvangen = ?3`,
        )
        .bind(zakId, zakken, z.ontvangen, nuIso()),
      db
        .prepare(
          `UPDATE sz_product SET voorraad_ontvangen = voorraad_ontvangen + ?2, voorraad_verwacht = COALESCE(voorraad_verwacht, 0) + ?2,
             voorraad = COALESCE(voorraad, 0) + ?2, gewijzigd = ?3
           WHERE id = ?1 AND (SELECT voorraad_ontvangen FROM sz_product WHERE id = ?4) = ?5`,
        )
        // Alleen als de zakken hierboven echt zijn afgeboekt (zelfde transactie).
        .bind(emmerId, emmers, nuIso(), zakId, z.ontvangen - zakken),
      logStmt(db, null, "afgevuld", `${emmers} × #${emmerId} uit ${zakken} × #${zakId}${rest ? `, rest ${rest / 1000} kg los` : ""}`),
    ]);
    if ((res[0]?.meta?.changes ?? 0) !== 1) return fout("De voorraad is intussen gewijzigd. Vernieuw en probeer opnieuw.", 409);
  } catch (e) {
    if (/CHECK/i.test(String((e as Error)?.message))) return fout("Niet genoeg voorraad om af te vullen.", 409);
    throw e;
  }
  return json({ ok: true, rest_gram: rest, voorraad: await voorraadOverzicht(env) });
}

/**
 * Voorraad aanpassen. `verwacht`: totaal verwacht/ingekocht; beschikbaar wordt verwacht − gereserveerd (nooit onder nul:
 * lager dan al gereserveerd kan niet). `ontvangen_erbij`: ontvangst bevestigen (of corrigeren met een negatief getal);
 * komt de ontvangst boven de verwachting uit, dan stijgt de verwachting mee.
 */
async function voorraadWijzigen(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const huidig = (await voorraadOverzicht(env)).find((r) => r.id === id);
  if (!huidig) return fout("Product niet gevonden.", 404);
  const db = env.DB;
  const gereserveerdSql = `(SELECT COALESCE(SUM(m.aantal), 0) FROM sz_voorraad_mutatie m JOIN sz_bestelling b ON b.id = m.bestelling_id
                             WHERE m.product_id = ?1 AND b.status != 'geannuleerd' AND b.voorraad_vrijgegeven = 0)`;
  if ("verwacht" in body) {
    if (body.verwacht === null) {
      await db.batch([db.prepare("UPDATE sz_product SET voorraad = NULL, voorraad_verwacht = NULL, gewijzigd = ?2 WHERE id = ?1").bind(id, nuIso()), logStmt(db, null, "voorraadbeheer uit", `#${id}`)]);
      return json({ ok: true, voorraad: (await voorraadOverzicht(env)).find((r) => r.id === id) });
    }
    const v = geheel(body.verwacht, 0, 100_000);
    if (v === null) return fout("Vul een aantal in.", 422);
    if (v < huidig.gereserveerd) return fout(`Er zijn al ${huidig.gereserveerd} gereserveerd; de verwachte voorraad kan niet lager zijn.`, 409);
    try {
      await db.batch([
        db.prepare(`UPDATE sz_product SET voorraad_verwacht = ?2, voorraad = ?2 - ${gereserveerdSql}, gewijzigd = ?3 WHERE id = ?1`).bind(id, v, nuIso()),
        logStmt(db, null, "voorraad verwacht", `#${id} ${huidig.verwacht ?? "-"} → ${v}`),
      ]);
    } catch (e) {
      if (/CHECK/i.test(String((e as Error)?.message))) return fout("Er is intussen meer gereserveerd. Vernieuw en probeer opnieuw.", 409);
      throw e;
    }
    return json({ ok: true, voorraad: (await voorraadOverzicht(env)).find((r) => r.id === id) });
  }
  if ("ontvangen_erbij" in body) {
    const n = geheel(body.ontvangen_erbij, -100_000, 100_000);
    if (n === null || n === 0) return fout("Vul het aantal ontvangen in.", 422);
    if (huidig.ontvangen + n < huidig.uitgegeven) return fout(`Er zijn al ${huidig.uitgegeven} uitgegeven; ontvangen kan niet lager worden.`, 409);
    const res = await db.batch([
      db
        .prepare(
          `UPDATE sz_product SET
             voorraad = CASE WHEN voorraad IS NOT NULL AND voorraad_ontvangen + ?2 > COALESCE(voorraad_verwacht, 0) THEN voorraad + (voorraad_ontvangen + ?2 - COALESCE(voorraad_verwacht, 0)) ELSE voorraad END,
             voorraad_verwacht = CASE WHEN voorraad_verwacht IS NOT NULL AND voorraad_ontvangen + ?2 > voorraad_verwacht THEN voorraad_ontvangen + ?2 ELSE voorraad_verwacht END,
             voorraad_ontvangen = voorraad_ontvangen + ?2,
             gewijzigd = ?4
           WHERE id = ?1 AND voorraad_ontvangen = ?3`,
        )
        .bind(id, n, huidig.ontvangen, nuIso()),
      logStmt(db, null, n > 0 ? "voorraad ontvangen" : "voorraad gecorrigeerd", `#${id} ${n > 0 ? "+" : ""}${n}`),
    ]);
    if ((res[0].meta?.changes ?? 0) === 0) return fout("De voorraad is intussen gewijzigd. Vernieuw en probeer opnieuw.", 409);
    return json({ ok: true, voorraad: (await voorraadOverzicht(env)).find((r) => r.id === id) });
  }
  return fout("Niets om aan te passen.", 422);
}

// ---------- Straatverkoop (verkoop aan de weg, door de beheerder geregistreerd) ----------

/**
 * Een verkoop ter plekke vastleggen: bestelling, voorraad, uitgifte en (als het geld er is) betaling in één transactie.
 * Alleen uit werkelijk ontvangen voorraad. Idempotent: dezelfde sleutel twee keer geeft één registratie.
 */
async function straatverkoop(request: Request, env: SzEnv): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const idem = body.idempotentie;
  if (typeof idem !== "string" || !/^[A-Za-z0-9-]{16,64}$/.test(idem)) return fout("Herlaad de pagina en probeer het opnieuw.", 400);
  const al = await env.DB.prepare("SELECT id FROM sz_bestelling WHERE idempotentie = ?1").bind(idem).first<{ id: number }>();
  if (al) return json({ ok: true, herhaald: true, id: al.id });
  const aantal = geheel(body.aantal, 1, 200);
  if (aantal === null) return fout("Kies een aantal.", 422);
  const wijze = String(body.wijze ?? "");
  if (!["contant", "tikkie", "pin", "nog_niet"].includes(wijze)) return fout("Kies hoe er betaald is.", 422);
  if (wijze !== "nog_niet" && body.ontvangen !== true) return fout("Bevestig dat het geld echt is ontvangen.", 422);
  const [inst, cat, magazijn, ronde] = await Promise.all([
    laadInstellingen(env.DB),
    laadCatalogus(env.DB),
    laadMagazijn(env.DB),
    env.DB.prepare("SELECT id FROM sz_ronde ORDER BY id DESC LIMIT 1").first<{ id: number }>(),
  ]);
  const productId = typeof body.product_id === "number" ? body.product_id : cat.producten.find((p) => p.slug === "strooizout-25-kg" && p.status !== "verwijderd")?.id;
  const p = productId ? cat.perId.get(productId) : undefined;
  if (!p || p.prijs_cent === null) return fout("Product niet gevonden.", 404);
  const effect = voorraadEffect(cat, p, aantal);
  for (const [pid, n] of effect) {
    if ((magazijn.get(pid) ?? 0) < n) return fout(`Niet genoeg op voorraad (ontvangen en nog niet uitgegeven: ${Math.max(0, magazijn.get(pid) ?? 0)}).`, 409, { code: "voorraad" });
  }
  const nu = nuIso();
  const som = bereken([{ product: alsPrijs(cat, p, inst.bezorg_per_stuk_cent), aantal }], "ophalen", inst, nu);
  const klant = { naam: "Straatverkoop", email: "", telefoon: "", straat: "", huisnummer: "", postcode: "", plaats: "", opmerking: "" };
  const uitgifteId = crypto.randomUUID();
  const db = env.DB;
  for (let poging = 0; poging < 12; poging++) {
    const code = maakAfhaalcode(poging < 6 ? 4 : 5);
    try {
      await db.batch([
        ...bestelStatements(db, { idempotentie: idem, afhaalcode: code, rondeId: ronde?.id ?? null, kanaal: "beheer", levering: "ophalen", momentId: null, klant, betaalwijze: "bij_ontvangst", som, effect, voorbestelling: false, nu }),
        db.prepare("UPDATE sz_bestelling SET status = 'afgehaald', afgerond_op = ?2, uitgifte_id = ?3 WHERE idempotentie = ?1").bind(idem, nu, uitgifteId),
        ...(wijze !== "nog_niet"
          ? [db.prepare("INSERT INTO sz_betaling (bestelling_id, bedrag_cent, wijze, notitie, op) SELECT id, ?2, ?3, 'straatverkoop', ?4 FROM sz_bestelling WHERE idempotentie = ?1 AND uitgifte_id = ?5").bind(idem, som.totaal_cent, wijze, nu, uitgifteId)]
          : []),
      ]);
      const rij = await db.prepare("SELECT id FROM sz_bestelling WHERE idempotentie = ?1").bind(idem).first<{ id: number }>();
      return json({ ok: true, herhaald: false, id: rij!.id, nummer: bestelnummer(rij!.id), totaal_cent: som.totaal_cent, korting_cent: som.korting_cent }, 201);
    } catch (e) {
      const t = String((e as Error)?.message ?? e);
      if (/UNIQUE/i.test(t) && /afhaalcode/i.test(t)) continue;
      if (/UNIQUE/i.test(t) && /idempotentie/i.test(t)) {
        const zelfde = await db.prepare("SELECT id FROM sz_bestelling WHERE idempotentie = ?1").bind(idem).first<{ id: number }>();
        if (zelfde) return json({ ok: true, herhaald: true, id: zelfde.id });
      }
      if (/CHECK/i.test(t)) return fout("Niet genoeg voorraad meer beschikbaar.", 409, { code: "voorraad" });
      throw e;
    }
  }
  throw new Error("geen vrije afhaalcode gevonden");
}

// ---------- Route ----------

async function route(request: Request, env: SzEnv): Promise<Response> {
  const q = new URL(request.url).searchParams;
  const rondeId = await rondeFilter(env.DB, q.get("ronde"));
  const moment = q.get("moment") ?? "";
  const alle = q.get("alle") === "1";
  const [inst, data, momenten] = await Promise.all([
    laadInstellingen(env.DB),
    laadBestellingen(env.DB, rondeId),
    env.DB.prepare("SELECT id, soort, datum, van, tot, omschrijving FROM sz_moment WHERE soort = 'bezorgen' ORDER BY datum, van").all(),
  ]);
  const per = await regelsPer(data.regels);
  const huisnr = (h: string) => Number((h.match(/^\d+/) ?? ["0"])[0]);
  const stops = data.bestellingen
    .filter((b) => b.levering === "bezorgen" && !b.geanonimiseerd_op && (alle ? b.status !== "geannuleerd" : OPEN_STATUS.includes(b.status)) && (!moment || String(b.moment_id ?? "") === moment))
    .sort((a, b) => a.postcode.localeCompare(b.postcode) || a.straat.localeCompare(b.straat) || huisnr(a.huisnummer) - huisnr(b.huisnummer) || a.huisnummer.localeCompare(b.huisnummer))
    .map((b) => ({ ...lijstRij(b, per.get(b.id) ?? [], false, inst.wijken), straat: b.straat, huisnummer: b.huisnummer, gewicht_gram: b.gewicht_gram }));
  const wijken = new Map<string, typeof stops>();
  for (const s of stops) wijken.set(s.wijk, [...(wijken.get(s.wijk) ?? []), s]);
  return json({ ok: true, ronde_id: rondeId, startadres: inst.afhaal_adres, wijken: [...wijken].map(([wijk, lijst]) => ({ wijk, stops: lijst })), momenten: momenten.results });
}

// ---------- Producten ----------

function productVoorBeheer(cat: Catalogus, p: ProductRij, standaard: number) {
  return {
    ...p,
    specificaties: specs(p.specificaties),
    onderdelen: (cat.onderdelen.get(p.id) ?? []).map((d) => ({ product_id: d.product_id, aantal: d.aantal })),
    aanbiedingen: cat.aanbiedingen.get(p.id) ?? [],
    berekend: { inkoop_cent: inkoopVan(cat, p), gewicht_gram: gewichtVan(cat, p), bezorg_cent: bezorgVan(cat, p, standaard), beschikbaar: beschikbaar(cat, p) },
  };
}

async function producten(env: SzEnv): Promise<Response> {
  const [cat, inst, cats, beelden] = await Promise.all([
    laadCatalogus(env.DB),
    laadInstellingen(env.DB),
    env.DB.prepare("SELECT id, slug, naam, volgorde FROM sz_categorie ORDER BY volgorde, id").all(),
    env.DB.prepare("SELECT id, hash, grootte, type, aangemaakt FROM sz_afbeelding ORDER BY id DESC LIMIT 100").all<{ id: number; hash: string; grootte: number; type: string; aangemaakt: string }>(),
  ]);
  return json({
    ok: true,
    producten: cat.producten.map((p) => productVoorBeheer(cat, p, inst.bezorg_per_stuk_cent)),
    categorieen: cats.results,
    afbeeldingen: beelden.results.map((b) => ({ ...b, url: `/api/strooizout/afbeelding/${b.id}-${b.hash}` })),
    standaard_bezorg_cent: inst.bezorg_per_stuk_cent,
  });
}

type ProductInvoer = {
  naam: string;
  categorie_id: number | null;
  status: "concept" | "binnenkort" | "actief" | "verborgen";
  kort: string;
  beschrijving: string;
  specificaties: string;
  prijs_cent: number | null;
  inkoop_cent: number | null;
  bezorg_cent: number | null;
  gewicht_gram: number;
  eenheid: string;
  voorraad: number | null;
  max_per_bestelling: number;
  afbeelding: string;
  afbeelding_alt: string;
  notitie: string;
  volgorde: number;
  onderdelen: { product_id: number; aantal: number }[];
  aanbiedingen: { naam: string; vanaf_aantal: number; prijs_cent: number; start: string | null; eind: string | null; actief: boolean }[];
};

const PRODUCT_STATUSSEN: readonly string[] = ["concept", "binnenkort", "actief", "verborgen"];

async function controleerProduct(db: D1Database, body: Record<string, unknown>, eigenId: number | null): Promise<{ ok: true; p: ProductInvoer } | { ok: false; fout: string }> {
  const naam = tekst(body.naam, 80);
  if (!naam || naam.length < 2) return { ok: false, fout: "Geef het product een naam (2 tot 80 tekens)." };
  const status = body.status as ProductInvoer["status"];
  if (!PRODUCT_STATUSSEN.includes(status)) return { ok: false, fout: "Kies een geldige status." };
  const kort = tekst(body.kort ?? "", 160);
  const beschrijving = tekst(body.beschrijving ?? "", 3000);
  const eenheid = tekst(body.eenheid ?? "stuk", 20);
  const alt = tekst(body.afbeelding_alt ?? "", 160);
  const notitie = tekst(body.notitie ?? "", 1000);
  if (kort === null || beschrijving === null || !eenheid || alt === null || notitie === null) return { ok: false, fout: "Een van de teksten is te lang." };
  const prijs = centOfNull(body.prijs_cent);
  const inkoop = centOfNull(body.inkoop_cent);
  const bezorg = centOfNull(body.bezorg_cent, 10_000);
  if (prijs === undefined || inkoop === undefined || bezorg === undefined) return { ok: false, fout: "Controleer de bedragen." };
  const gewicht = geheel(body.gewicht_gram ?? 0, 0, 100_000);
  const voorraad = body.voorraad === null || body.voorraad === "" || body.voorraad === undefined ? null : geheel(body.voorraad, 0, 100_000);
  const max = geheel(body.max_per_bestelling ?? 20, 1, 500);
  const volgorde = geheel(body.volgorde ?? 0, -1000, 1000);
  if (gewicht === null || max === null || volgorde === null || (body.voorraad !== null && body.voorraad !== "" && body.voorraad !== undefined && voorraad === null)) {
    return { ok: false, fout: "Controleer gewicht, voorraad en maximum per bestelling." };
  }
  const afbeelding = tekst(body.afbeelding ?? "", 200) ?? "";
  if (afbeelding && !/^\/strooizout\/beeld\/[a-z0-9-]+\.(webp|png|jpg|svg)$/.test(afbeelding) && !/^\/api\/strooizout\/afbeelding\/\d{1,9}-[0-9a-f]{16}$/.test(afbeelding)) {
    return { ok: false, fout: "Kies een afbeelding uit de webshop of upload er een." };
  }
  let categorie: number | null = null;
  if (body.categorie_id !== null && body.categorie_id !== undefined && body.categorie_id !== "") {
    const c = await db.prepare("SELECT id FROM sz_categorie WHERE id = ?1").bind(body.categorie_id).first<{ id: number }>();
    if (!c) return { ok: false, fout: "Onbekende categorie." };
    categorie = c.id;
  }
  const specRuw = Array.isArray(body.specificaties) ? body.specificaties : [];
  if (specRuw.length > 12) return { ok: false, fout: "Maximaal 12 specificaties." };
  const specLijst: { label: string; waarde: string }[] = [];
  for (const s of specRuw as { label?: unknown; waarde?: unknown }[]) {
    const label = tekst(s?.label, 40);
    const waarde = tekst(s?.waarde, 120);
    if (label === null || waarde === null) return { ok: false, fout: "Een specificatie is te lang." };
    if (label && waarde) specLijst.push({ label, waarde });
  }
  const onderdelenRuw = Array.isArray(body.onderdelen) ? body.onderdelen : [];
  if (onderdelenRuw.length > 10) return { ok: false, fout: "Een pakket heeft maximaal 10 onderdelen." };
  const onderdelen: ProductInvoer["onderdelen"] = [];
  for (const o of onderdelenRuw as { product_id?: unknown; aantal?: unknown }[]) {
    const pid = geheel(o?.product_id, 1, 1e9);
    const aantal = geheel(o?.aantal, 1, 100);
    if (pid === null || aantal === null) return { ok: false, fout: "Controleer de onderdelen van het pakket." };
    if (pid === eigenId) return { ok: false, fout: "Een pakket kan zichzelf niet bevatten." };
    if (onderdelen.some((x) => x.product_id === pid)) return { ok: false, fout: "Een onderdeel staat dubbel in het pakket." };
    const deel = await db.prepare("SELECT id, (SELECT COUNT(*) FROM sz_pakket_onderdeel WHERE pakket_id = sz_product.id) AS n FROM sz_product WHERE id = ?1 AND status != 'verwijderd'").bind(pid).first<{ id: number; n: number }>();
    if (!deel) return { ok: false, fout: "Een onderdeel van het pakket bestaat niet." };
    if (deel.n > 0) return { ok: false, fout: "Een pakket kan geen ander pakket bevatten." };
    onderdelen.push({ product_id: pid, aantal });
  }
  if (eigenId !== null && onderdelen.length) {
    const isDeel = await db.prepare("SELECT 1 FROM sz_pakket_onderdeel WHERE product_id = ?1").bind(eigenId).first();
    if (isDeel) return { ok: false, fout: "Dit product is zelf onderdeel van een pakket en kan dus geen pakket worden." };
  }
  const aanbRuw = Array.isArray(body.aanbiedingen) ? body.aanbiedingen : [];
  if (aanbRuw.length > 10) return { ok: false, fout: "Maximaal 10 aanbiedingen per product." };
  const aanbiedingen: ProductInvoer["aanbiedingen"] = [];
  for (const a of aanbRuw as Record<string, unknown>[]) {
    const an = tekst(a?.naam, 60);
    const vanaf = geheel(a?.vanaf_aantal ?? 1, 1, 500);
    const ap = centOfNull(a?.prijs_cent);
    const start = isoOfNull(a?.start);
    const eind = isoOfNull(a?.eind);
    if (!an || vanaf === null || ap === null || ap === undefined || start === undefined || eind === undefined) return { ok: false, fout: "Controleer de aanbiedingen (naam, vanaf aantal, prijs, periode)." };
    if (start && eind && eind <= start) return { ok: false, fout: `Aanbieding ‘${an}’: de einddatum ligt vóór de start.` };
    if (prijs !== null && ap >= prijs) return { ok: false, fout: `Aanbieding ‘${an}’: de actieprijs moet lager zijn dan de normale prijs.` };
    aanbiedingen.push({ naam: an, vanaf_aantal: vanaf, prijs_cent: ap, start, eind, actief: a?.actief !== false });
  }
  if (status === "actief") {
    const mist: string[] = [];
    if (!prijs) mist.push("verkoopprijs");
    if (!beschrijving) mist.push("beschrijving");
    if (!afbeelding) mist.push("afbeelding");
    if (mist.length) return { ok: false, fout: `Een product kan pas actief worden met: ${mist.join(", ")}.` };
  }
  return {
    ok: true,
    p: {
      naam,
      categorie_id: categorie,
      status,
      kort,
      beschrijving,
      specificaties: JSON.stringify(specLijst),
      prijs_cent: prijs,
      inkoop_cent: inkoop,
      bezorg_cent: bezorg,
      gewicht_gram: gewicht,
      eenheid,
      voorraad,
      max_per_bestelling: max,
      afbeelding,
      afbeelding_alt: alt,
      notitie,
      volgorde,
      onderdelen,
      aanbiedingen,
    },
  };
}

function bijbehorend(db: D1Database, id: number, p: ProductInvoer): D1PreparedStatement[] {
  return [
    db.prepare("DELETE FROM sz_pakket_onderdeel WHERE pakket_id = ?1").bind(id),
    ...p.onderdelen.map((o) => db.prepare("INSERT INTO sz_pakket_onderdeel (pakket_id, product_id, aantal) VALUES (?1, ?2, ?3)").bind(id, o.product_id, o.aantal)),
    db.prepare("DELETE FROM sz_aanbieding WHERE product_id = ?1").bind(id),
    ...p.aanbiedingen.map((a) =>
      db.prepare("INSERT INTO sz_aanbieding (product_id, naam, vanaf_aantal, prijs_cent, start, eind, actief) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)").bind(id, a.naam, a.vanaf_aantal, a.prijs_cent, a.start, a.eind, a.actief ? 1 : 0),
    ),
  ];
}

async function nieuwProduct(request: Request, env: SzEnv): Promise<Response> {
  const body = await leesJson(request, 32_768);
  if (body instanceof Response) return body;
  const c = await controleerProduct(env.DB, body, null);
  if (!c.ok) return fout(c.fout, 422);
  const p = c.p;
  let slug = slugVan(p.naam);
  for (let i = 2; await env.DB.prepare("SELECT 1 FROM sz_product WHERE slug = ?1").bind(slug).first(); i++) slug = `${slugVan(p.naam)}-${i}`;
  const nu = nuIso();
  const rij = await env.DB.prepare(
    `INSERT INTO sz_product (slug, naam, categorie_id, status, kort, beschrijving, specificaties, prijs_cent, inkoop_cent, bezorg_cent, gewicht_gram, eenheid, voorraad,
       max_per_bestelling, afbeelding, afbeelding_alt, notitie, volgorde, aangemaakt, gewijzigd)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?19) RETURNING id`,
  )
    .bind(slug, p.naam, p.categorie_id, p.status, p.kort, p.beschrijving, p.specificaties, p.prijs_cent, p.inkoop_cent, p.bezorg_cent, p.gewicht_gram, p.eenheid, p.voorraad, p.max_per_bestelling, p.afbeelding, p.afbeelding_alt, p.notitie, p.volgorde, nu)
    .first<{ id: number }>();
  await env.DB.batch([...bijbehorend(env.DB, rij!.id, p), logStmt(env.DB, null, "product toegevoegd", `#${rij!.id}`)]);
  return json({ ok: true, id: rij!.id }, 201);
}

async function wijzigProduct(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request, 32_768);
  if (body instanceof Response) return body;
  const bestaat = await env.DB.prepare("SELECT id, voorraad FROM sz_product WHERE id = ?1 AND status != 'verwijderd'").bind(id).first<{ id: number; voorraad: number | null }>();
  if (!bestaat) return fout("Product niet gevonden.", 404);
  const c = await controleerProduct(env.DB, body, id);
  if (!c.ok) return fout(c.fout, 422);
  const p = c.p;
  // Voorraad niet blind overschrijven: bestellingen kunnen hem intussen verlaagd hebben. Alleen wijzigen als de beheerder
  // hem echt aanpast én de stand nog gelijk is aan wat hij zag (voorraad_was). Zonder voorraad in het verzoek: ongewijzigd.
  const stuurtVoorraad = "voorraad" in body;
  const was = "voorraad_was" in body ? (body.voorraad_was as number | null) : bestaat.voorraad;
  if (stuurtVoorraad && p.voorraad !== bestaat.voorraad && was !== bestaat.voorraad) {
    return fout(`De voorraad is intussen gewijzigd door bestellingen (nu ${bestaat.voorraad ?? "geen limiet"}). Controleer en sla opnieuw op.`, 409, { voorraad: bestaat.voorraad });
  }
  const nieuweVoorraad = stuurtVoorraad ? p.voorraad : bestaat.voorraad;
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE sz_product SET naam = ?2, categorie_id = ?3, status = ?4, kort = ?5, beschrijving = ?6, specificaties = ?7, prijs_cent = ?8, inkoop_cent = ?9,
         bezorg_cent = ?10, gewicht_gram = ?11, eenheid = ?12, voorraad = CASE WHEN voorraad IS ?20 THEN ?13 ELSE voorraad END, max_per_bestelling = ?14, afbeelding = ?15, afbeelding_alt = ?16, notitie = ?17,
         volgorde = ?18, gewijzigd = ?19 WHERE id = ?1`,
    ).bind(id, p.naam, p.categorie_id, p.status, p.kort, p.beschrijving, p.specificaties, p.prijs_cent, p.inkoop_cent, p.bezorg_cent, p.gewicht_gram, p.eenheid, nieuweVoorraad, p.max_per_bestelling, p.afbeelding, p.afbeelding_alt, p.notitie, p.volgorde, nuIso(), bestaat.voorraad),
    ...bijbehorend(env.DB, id, p),
    logStmt(env.DB, null, "product gewijzigd", `#${id} ${p.status}`),
  ]);
  return json({ ok: true, id });
}

/** Alleen de status wisselen (concept/binnenkort/actief/verborgen), zonder de rest van het product mee te sturen. */
async function productStatus(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const status = body.status;
  if (typeof status !== "string" || !PRODUCT_STATUSSEN.includes(status)) return fout("Kies een geldige status.", 422);
  const p = await env.DB.prepare("SELECT prijs_cent, beschrijving, afbeelding FROM sz_product WHERE id = ?1 AND status != 'verwijderd'").bind(id).first<{ prijs_cent: number | null; beschrijving: string; afbeelding: string }>();
  if (!p) return fout("Product niet gevonden.", 404);
  if (status === "actief" && (!p.prijs_cent || !p.beschrijving || !p.afbeelding)) return fout("Een product kan pas actief worden met verkoopprijs, beschrijving en afbeelding.", 422);
  await env.DB.batch([env.DB.prepare("UPDATE sz_product SET status = ?2, gewijzigd = ?3 WHERE id = ?1").bind(id, status, nuIso()), logStmt(env.DB, null, "productstatus", `#${id} ${status}`)]);
  return json({ ok: true });
}

async function verwijderProduct(env: SzEnv, id: number): Promise<Response> {
  const p = await env.DB.prepare("SELECT id FROM sz_product WHERE id = ?1 AND status != 'verwijderd'").bind(id).first();
  if (!p) return fout("Product niet gevonden.", 404);
  const gebruikt = await env.DB.prepare(
    "SELECT (SELECT COUNT(*) FROM sz_bestelregel WHERE product_id = ?1) + (SELECT COUNT(*) FROM sz_pakket_onderdeel WHERE product_id = ?1) + (SELECT COUNT(*) FROM sz_ronde_inkoop WHERE product_id = ?1) + (SELECT COUNT(*) FROM sz_voorraad_mutatie WHERE product_id = ?1) AS n",
  )
    .bind(id)
    .first<{ n: number }>();
  if ((gebruikt?.n ?? 0) > 0) {
    const inPakket = await env.DB.prepare("SELECT 1 FROM sz_pakket_onderdeel o JOIN sz_product p ON p.id = o.pakket_id WHERE o.product_id = ?1 AND p.status != 'verwijderd'").bind(id).first();
    if (inPakket) return fout("Dit product zit in een pakket. Haal het eerst uit het pakket, of verberg het.", 409);
    await env.DB.batch([env.DB.prepare("UPDATE sz_product SET status = 'verwijderd', gewijzigd = ?2 WHERE id = ?1").bind(id, nuIso()), logStmt(env.DB, null, "product gearchiveerd", `#${id}`)]);
    return json({ ok: true, verwijderd: "gearchiveerd" });
  }
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sz_pakket_onderdeel WHERE pakket_id = ?1").bind(id),
    env.DB.prepare("DELETE FROM sz_aanbieding WHERE product_id = ?1").bind(id),
    env.DB.prepare("DELETE FROM sz_product WHERE id = ?1").bind(id),
    logStmt(env.DB, null, "product verwijderd", `#${id}`),
  ]);
  return json({ ok: true, verwijderd: "definitief" });
}

async function nieuweCategorie(request: Request, env: SzEnv): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const naam = tekst(body.naam, 60);
  if (!naam || naam.length < 2) return fout("Geef de categorie een naam.", 422);
  const slug = slugVan(naam);
  if (await env.DB.prepare("SELECT 1 FROM sz_categorie WHERE slug = ?1").bind(slug).first()) return fout("Deze categorie bestaat al.", 409);
  await env.DB.prepare("INSERT INTO sz_categorie (slug, naam, volgorde) VALUES (?1, ?2, (SELECT COALESCE(MAX(volgorde), 0) + 1 FROM sz_categorie))").bind(slug, naam).run();
  return json({ ok: true }, 201);
}

async function wijzigCategorie(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const naam = tekst(body.naam, 60);
  if (!naam || naam.length < 2) return fout("Geef de categorie een naam.", 422);
  const r = await env.DB.prepare("UPDATE sz_categorie SET naam = ?2 WHERE id = ?1").bind(id, naam).run();
  if ((r.meta?.changes ?? 0) === 0) return fout("Categorie niet gevonden.", 404);
  return json({ ok: true });
}

// ---------- Afbeeldingen ----------

const BEELD_TYPES: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
};
const MAX_BEELD = 900_000;

async function uploadAfbeelding(request: Request, env: SzEnv): Promise<Response> {
  const type = (request.headers.get("Content-Type") ?? "").split(";")[0].trim().toLowerCase();
  if (!BEELD_TYPES[type]) return fout("Alleen JPG, PNG of WebP.", 415);
  if (Number(request.headers.get("Content-Length") ?? "0") > MAX_BEELD) return fout("De afbeelding is te groot (max. 900 kB na verkleinen).", 413);
  const data = new Uint8Array(await request.arrayBuffer());
  if (data.length > MAX_BEELD) return fout("De afbeelding is te groot (max. 900 kB na verkleinen).", 413);
  if (data.length < 32 || !BEELD_TYPES[type](data)) return fout("Dit bestand is geen geldige afbeelding.", 415);
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", data))].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  const al = await env.DB.prepare("SELECT id FROM sz_afbeelding WHERE hash = ?1").bind(hash).first<{ id: number }>();
  if (al) return json({ ok: true, url: `/api/strooizout/afbeelding/${al.id}-${hash}` });
  const rij = await env.DB.prepare("INSERT INTO sz_afbeelding (type, data, grootte, hash, aangemaakt) VALUES (?1, ?2, ?3, ?4, ?5) RETURNING id").bind(type, data, data.length, hash, nuIso()).first<{ id: number }>();
  return json({ ok: true, url: `/api/strooizout/afbeelding/${rij!.id}-${hash}` }, 201);
}

async function verwijderAfbeelding(env: SzEnv, id: number): Promise<Response> {
  const b = await env.DB.prepare("SELECT hash FROM sz_afbeelding WHERE id = ?1").bind(id).first<{ hash: string }>();
  if (!b) return fout("Afbeelding niet gevonden.", 404);
  const url = `/api/strooizout/afbeelding/${id}-${b.hash}`;
  if (await env.DB.prepare("SELECT 1 FROM sz_product WHERE afbeelding = ?1").bind(url).first()) return fout("Deze afbeelding wordt nog gebruikt door een product.", 409);
  await env.DB.prepare("DELETE FROM sz_afbeelding WHERE id = ?1").bind(id).run();
  return json({ ok: true });
}

// ---------- Bestelrondes ----------

async function rondeLijst(db: D1Database) {
  const { results } = await db
    .prepare(
      `SELECT r.*, (SELECT COUNT(*) FROM sz_bestelling b WHERE b.ronde_id = r.id AND b.status != 'geannuleerd') AS bestellingen
       FROM sz_ronde r ORDER BY r.id DESC`,
    )
    .all<RondeRij & { bestellingen: number }>();
  return results;
}

async function rondes(env: SzEnv): Promise<Response> {
  const [lijst, momenten] = await Promise.all([
    rondeLijst(env.DB),
    env.DB.prepare(
      `SELECT m.*, (SELECT COUNT(*) FROM sz_bestelling b WHERE b.moment_id = m.id AND b.status != 'geannuleerd') AS bezet
       FROM sz_moment m ORDER BY m.datum DESC, m.van`,
    ).all(),
  ]);
  return json({ ok: true, rondes: lijst, momenten: momenten.results, statussen: RONDE_STATUS });
}

async function nieuweRonde(request: Request, env: SzEnv): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const naam = tekst(body.naam, 80);
  if (!naam || naam.length < 2) return fout("Geef de ronde een naam, bijvoorbeeld ‘Winter 2026 – ronde 1’.", 422);
  const sluit = isoOfNull(body.sluit_op);
  if (sluit === undefined) return fout("Ongeldige sluitdatum.", 422);
  if (sluit && sluit <= nuIso()) return fout("De sluitdatum ligt in het verleden.", 422);
  const open = await env.DB.prepare("SELECT naam FROM sz_ronde WHERE status = 'open'").first<{ naam: string }>();
  if (open) return fout(`Ronde ‘${open.naam}’ staat nog open. Sluit die eerst.`, 409);
  const rij = await env.DB.prepare("INSERT INTO sz_ronde (naam, status, sluit_op, notitie, aangemaakt) VALUES (?1, 'open', ?2, ?3, ?4) RETURNING id")
    .bind(naam, sluit, tekst(body.notitie ?? "", 1000) ?? "", nuIso())
    .first<{ id: number }>();
  await log(env.DB, null, "ronde gestart", `#${rij!.id}`);
  return json({ ok: true, id: rij!.id }, 201);
}

async function wijzigRonde(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request, 16_384);
  if (body instanceof Response) return body;
  const r = await env.DB.prepare("SELECT * FROM sz_ronde WHERE id = ?1").bind(id).first<RondeRij>();
  if (!r) return fout("Ronde niet gevonden.", 404);
  const naam = body.naam === undefined ? r.naam : tekst(body.naam, 80);
  const status = body.status === undefined ? r.status : body.status;
  const sluit = body.sluit_op === undefined ? r.sluit_op : isoOfNull(body.sluit_op);
  const leverancier = body.leverancier === undefined ? r.leverancier : tekst(body.leverancier, 120);
  const inkoopDatum = body.inkoop_datum === undefined ? r.inkoop_datum : isoOfNull(body.inkoop_datum);
  const leveringDatum = body.levering_datum === undefined ? r.levering_datum : isoOfNull(body.levering_datum);
  const inkoopBedrag = body.inkoop_bedrag_cent === undefined ? r.inkoop_bedrag_cent : centOfNull(body.inkoop_bedrag_cent, 10_000_000);
  const inkoopNotitie = body.inkoop_notitie === undefined ? r.inkoop_notitie : tekst(body.inkoop_notitie, 1000);
  const notitie = body.notitie === undefined ? r.notitie : tekst(body.notitie, 1000);
  if (!naam || naam.length < 2) return fout("Geef de ronde een naam.", 422);
  if (typeof status !== "string" || !(status in RONDE_STATUS)) return fout("Onbekende status.", 422);
  if (sluit === undefined || inkoopDatum === undefined || leveringDatum === undefined || inkoopBedrag === undefined) return fout("Controleer de datums en het inkoopbedrag.", 422);
  if (leverancier === null || inkoopNotitie === null || notitie === null) return fout("Een van de teksten is te lang.", 422);
  if (status === "open" && r.status !== "open") {
    const ander = await env.DB.prepare("SELECT naam FROM sz_ronde WHERE status = 'open' AND id != ?1").bind(id).first<{ naam: string }>();
    if (ander) return fout(`Ronde ‘${ander.naam}’ staat al open.`, 409);
  }
  const stmts: D1PreparedStatement[] = [
    env.DB.prepare(
      `UPDATE sz_ronde SET naam = ?2, status = ?3, sluit_op = ?4, leverancier = ?5, inkoop_datum = ?6, levering_datum = ?7, inkoop_bedrag_cent = ?8,
         inkoop_notitie = ?9, notitie = ?10, gesloten_op = CASE WHEN ?3 != 'open' AND gesloten_op IS NULL THEN ?11 WHEN ?3 = 'open' THEN NULL ELSE gesloten_op END
       WHERE id = ?1`,
    ).bind(id, naam, status, sluit, leverancier, inkoopDatum, leveringDatum, inkoopBedrag, inkoopNotitie, notitie, nuIso()),
  ];
  if (Array.isArray(body.inkoop)) {
    if (body.inkoop.length > 50) return fout("Te veel inkoopregels.", 422);
    stmts.push(env.DB.prepare("DELETE FROM sz_ronde_inkoop WHERE ronde_id = ?1").bind(id));
    for (const regel of body.inkoop as Record<string, unknown>[]) {
      const pid = geheel(regel?.product_id, 1, 1e9);
      const aantal = geheel(regel?.aantal, 0, 100_000);
      const prijs = geheel(regel?.stukprijs_cent, 0, 1_000_000);
      if (pid === null || aantal === null || prijs === null) return fout("Controleer de inkoopregels.", 422);
      if (!(await env.DB.prepare("SELECT 1 FROM sz_product WHERE id = ?1").bind(pid).first())) return fout("Onbekend product in de inkoop.", 422);
      if (aantal > 0) stmts.push(env.DB.prepare("INSERT OR REPLACE INTO sz_ronde_inkoop (ronde_id, product_id, aantal, stukprijs_cent) VALUES (?1, ?2, ?3, ?4)").bind(id, pid, aantal, prijs));
    }
  }
  stmts.push(logStmt(env.DB, null, "ronde gewijzigd", `#${id} ${r.status} → ${status}`));
  await env.DB.batch(stmts);
  return json({ ok: true });
}

/** Inkoopbehoefte van een ronde: besteld per product en, met pakketten uitgesplitst, wat er ingekocht moet worden. */
async function behoefte(env: SzEnv, id: number): Promise<Response> {
  const [cat, data, inkoop] = await Promise.all([
    laadCatalogus(env.DB, { ookVerwijderd: true }),
    laadBestellingen(env.DB, id),
    env.DB.prepare("SELECT product_id, aantal, stukprijs_cent FROM sz_ronde_inkoop WHERE ronde_id = ?1").bind(id).all<{ product_id: number; aantal: number; stukprijs_cent: number }>(),
  ]);
  const geldig = new Set(data.bestellingen.filter((b) => b.status !== "geannuleerd").map((b) => b.id));
  const besteld = new Map<number, number>();
  for (const r of data.regels) if (geldig.has(r.bestelling_id)) besteld.set(r.product_id, (besteld.get(r.product_id) ?? 0) + r.aantal);
  const nodig = new Map<number, number>();
  for (const [pid, aantal] of besteld) {
    const delen = cat.onderdelen.get(pid);
    if (delen?.length) for (const d of delen) nodig.set(d.product_id, (nodig.get(d.product_id) ?? 0) + d.aantal * aantal);
    else nodig.set(pid, (nodig.get(pid) ?? 0) + aantal);
  }
  const ingekocht = new Map(inkoop.results.map((i) => [i.product_id, i]));
  const regels = [...nodig].map(([pid, aantal]) => {
    const p = cat.perId.get(pid);
    const prijs = p?.inkoop_cent ?? null;
    return {
      product_id: pid,
      naam: p?.naam ?? `Product ${pid}`,
      eenheid: p?.eenheid ?? "stuk",
      nodig: aantal,
      voorraad: p?.voorraad ?? null,
      gewicht_gram: (p?.gewicht_gram ?? 0) * aantal,
      inkoopprijs_cent: prijs,
      verwachte_inkoop_cent: prijs === null ? null : prijs * aantal,
      ingekocht: ingekocht.get(pid)?.aantal ?? 0,
      ingekocht_stukprijs_cent: ingekocht.get(pid)?.stukprijs_cent ?? null,
    };
  });
  return json({
    ok: true,
    besteld: [...besteld].map(([pid, aantal]) => ({ product_id: pid, naam: cat.perId.get(pid)?.naam ?? `Product ${pid}`, aantal })),
    inkoop: regels,
    totaal_gewicht_gram: regels.reduce((s, r) => s + r.gewicht_gram, 0),
    verwachte_inkoop_cent: regels.some((r) => r.verwachte_inkoop_cent === null) ? null : regels.reduce((s, r) => s + (r.verwachte_inkoop_cent ?? 0), 0),
    bestellingen: geldig.size,
  });
}

// ---------- Momenten ----------

async function controleerMoment(db: D1Database, body: Record<string, unknown>) {
  const soort = body.soort;
  const datum = body.datum;
  const van = body.van;
  const tot = body.tot;
  if (soort !== "ophalen" && soort !== "bezorgen") return "Kies ophalen of bezorgen.";
  if (typeof datum !== "string" || !DATUM.test(datum)) return "Kies een datum.";
  if (typeof van !== "string" || !TIJD.test(van) || typeof tot !== "string" || !TIJD.test(tot) || tot <= van) return "Kies een begin- en eindtijd (eind na begin).";
  const omschrijving = tekst(body.omschrijving ?? "", 120);
  if (omschrijving === null) return "Omschrijving is te lang.";
  const max = body.max_bestellingen === null || body.max_bestellingen === "" || body.max_bestellingen === undefined ? null : geheel(body.max_bestellingen, 1, 1000);
  if (max === null && body.max_bestellingen !== null && body.max_bestellingen !== "" && body.max_bestellingen !== undefined) return "Maximum aantal bestellingen klopt niet.";
  let ronde: number | null = null;
  if (body.ronde_id !== null && body.ronde_id !== undefined && body.ronde_id !== "") {
    const r = await db.prepare("SELECT id FROM sz_ronde WHERE id = ?1").bind(body.ronde_id).first<{ id: number }>();
    if (!r) return "Onbekende ronde.";
    ronde = r.id;
  }
  return { soort, datum, van, tot, omschrijving, max, ronde, actief: body.actief === false ? 0 : 1 };
}

async function nieuwMoment(request: Request, env: SzEnv): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const m = await controleerMoment(env.DB, body);
  if (typeof m === "string") return fout(m, 422);
  await env.DB.prepare("INSERT INTO sz_moment (ronde_id, soort, datum, van, tot, omschrijving, max_bestellingen, actief) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)")
    .bind(m.ronde, m.soort, m.datum, m.van, m.tot, m.omschrijving, m.max, m.actief)
    .run();
  return json({ ok: true }, 201);
}

async function wijzigMoment(request: Request, env: SzEnv, id: number): Promise<Response> {
  const body = await leesJson(request);
  if (body instanceof Response) return body;
  const m = await controleerMoment(env.DB, body);
  if (typeof m === "string") return fout(m, 422);
  const r = await env.DB.prepare("UPDATE sz_moment SET ronde_id = ?2, soort = ?3, datum = ?4, van = ?5, tot = ?6, omschrijving = ?7, max_bestellingen = ?8, actief = ?9 WHERE id = ?1")
    .bind(id, m.ronde, m.soort, m.datum, m.van, m.tot, m.omschrijving, m.max, m.actief)
    .run();
  if ((r.meta?.changes ?? 0) === 0) return fout("Moment niet gevonden.", 404);
  return json({ ok: true });
}

async function verwijderMoment(env: SzEnv, id: number): Promise<Response> {
  const gebruikt = await env.DB.prepare("SELECT COUNT(*) AS n FROM sz_bestelling WHERE moment_id = ?1").bind(id).first<{ n: number }>();
  if ((gebruikt?.n ?? 0) > 0) {
    await env.DB.prepare("UPDATE sz_moment SET actief = 0 WHERE id = ?1").bind(id).run();
    return json({ ok: true, verwijderd: "uitgezet" });
  }
  await env.DB.prepare("DELETE FROM sz_moment WHERE id = ?1").bind(id).run();
  return json({ ok: true, verwijderd: "definitief" });
}

// ---------- Instellingen ----------

async function instellingen(env: SzEnv): Promise<Response> {
  return json({ ok: true, instellingen: await laadInstellingen(env.DB), apart_token: !!(env.STROOIZOUT_TOKEN && env.STROOIZOUT_TOKEN.length >= 24) });
}

async function bewaarInstellingen(request: Request, env: SzEnv): Promise<Response> {
  const body = await leesJson(request, 16_384);
  if (body instanceof Response) return body;
  const stmts: D1PreparedStatement[] = [];
  for (const [sleutel, waarde] of Object.entries(body)) {
    if (!(sleutel in INSTELLING_VELDEN)) return fout(`Onbekende instelling: ${sleutel}`, 422);
    const c = controleerInstelling(sleutel, waarde);
    if (!c.ok) return fout(c.fout, 422);
    stmts.push(env.DB.prepare("INSERT INTO sz_instelling (sleutel, waarde) VALUES (?1, ?2) ON CONFLICT(sleutel) DO UPDATE SET waarde = excluded.waarde").bind(sleutel, JSON.stringify(c.waarde)));
  }
  if (!stmts.length) return fout("Niets om op te slaan.", 422);
  stmts.push(logStmt(env.DB, null, "instellingen", Object.keys(body).join(", ")));
  await env.DB.batch(stmts);
  return json({ ok: true, instellingen: await laadInstellingen(env.DB) });
}

// ---------- Bewaartermijn ----------

/**
 * Bewaartermijn. (1) Bestellingen die al 12 maanden (of de bewaartermijn, als die langer is) niet zijn gewijzigd en nooit
 * zijn afgerond, worden eerst geannuleerd en hun voorraad teruggegeven. (2) Daarna worden van afgeronde bestellingen na de
 * bewaartermijn naam, contact, adres, opmerkingen en de afhaalcode gewist. Bedragen, aantallen en het postcodegebied blijven.
 */
export async function opschonen(db: D1Database, inst: Instellingen, nu = new Date()): Promise<number> {
  const grens = new Date(nu);
  grens.setUTCMonth(grens.getUTCMonth() - inst.bewaartermijn_maanden);
  const oud = new Date(nu);
  oud.setUTCMonth(oud.getUTCMonth() - Math.max(12, inst.bewaartermijn_maanden));
  const nuIsoTijd = nu.toISOString();
  const { results: verlaten } = await db
    .prepare("SELECT id, status FROM sz_bestelling WHERE geanonimiseerd_op IS NULL AND status IN ('nieuw', 'bevestigd', 'klaar') AND gewijzigd < ?1")
    .bind(oud.toISOString())
    .all<{ id: number; status: string }>();
  for (const b of verlaten) {
    await db.batch([
      db.prepare("UPDATE sz_bestelling SET status = 'geannuleerd', afgerond_op = ?2, gewijzigd = ?2 WHERE id = ?1 AND status = ?3").bind(b.id, nuIsoTijd, b.status),
      ...vrijgeefStatements(db, b.id),
      logStmt(db, b.id, "geannuleerd na bewaartermijn", `was ${b.status}`),
    ]);
  }
  const res = await db
    .prepare(
      `UPDATE sz_bestelling SET naam = 'Gewist', email = '', telefoon = '', straat = '', huisnummer = '', postcode = substr(postcode, 1, 4),
         opmerking = '', beheer_notitie = '', afhaalcode = NULL, geanonimiseerd_op = ?2
       WHERE geanonimiseerd_op IS NULL AND status IN ('afgehaald', 'bezorgd', 'geannuleerd') AND COALESCE(afgerond_op, gewijzigd) < ?1`,
    )
    .bind(grens.toISOString(), nuIsoTijd)
    .run();
  await db.prepare("UPDATE sz_betaling SET notitie = '' WHERE bestelling_id IN (SELECT id FROM sz_bestelling WHERE geanonimiseerd_op IS NOT NULL) AND notitie != ''").run();
  return res.meta?.changes ?? 0;
}

/** Dagelijks onderhoud (cron in wrangler.jsonc): bewaartermijn toepassen, ook als niemand het beheer opent. */
export async function geplandOnderhoud(env: SzEnv): Promise<void> {
  const gewist = await opschonen(env.DB, await laadInstellingen(env.DB));
  if (gewist) await log(env.DB, null, "bewaartermijn", `${gewist} bestellingen opgeschoond`);
}

// ---------- CSV ----------

/** Excel-NL: BOM, puntkomma, aanhalingstekens; cellen die met = + - @ beginnen worden onschadelijk gemaakt (formule-injectie). */
export function csvCel(v: unknown): string {
  let t = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(t) && !/^-?\d+(,\d+)?$/.test(t)) t = `'${t}`;
  return /[";\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}
export function csv(kop: string[], rijen: unknown[][]): string {
  return "﻿" + [kop, ...rijen].map((r) => r.map(csvCel).join(";")).join("\r\n") + "\r\n";
}
const bedrag = (c: number | null) => (c === null ? "" : (c / 100).toFixed(2).replace(".", ","));
const nlDatum = (iso: string | null) => (iso ? new Date(iso).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" }) : "");

function csvAntwoord(naam: string, inhoud: string): Response {
  return new Response(inhoud, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${naam}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function export_(request: Request, env: SzEnv, soort: string): Promise<Response> {
  const q = new URL(request.url).searchParams;
  const rondeId = await rondeFilter(env.DB, q.get("ronde"));
  const [cat, inst, data] = await Promise.all([laadCatalogus(env.DB, { ookVerwijderd: true }), laadInstellingen(env.DB), laadBestellingen(env.DB, rondeId)]);
  const per = await regelsPer(data.regels);
  const momenten = new Map(
    (await env.DB.prepare("SELECT id, datum, van, tot FROM sz_moment").all<{ id: number; datum: string; van: string; tot: string }>()).results.map((m) => [m.id, `${m.datum} ${m.van}-${m.tot}`]),
  );
  const achter = rondeId === null ? "alle" : `ronde-${rondeId}`;
  if (soort === "bestellingen") {
    const rijen = [...data.bestellingen].reverse().map((b) => {
      const regels = per.get(b.id) ?? [];
      return [
        bestelnummer(b.id), b.afhaalcode ?? "", nlDatum(b.aangemaakt), b.ronde_id ?? "", BESTEL_STATUS[b.status], b.levering, b.moment_id ? (momenten.get(b.moment_id) ?? "") : "",
        b.naam, b.email, b.telefoon, b.levering === "bezorgen" ? `${b.straat} ${b.huisnummer}` : "", b.postcode, b.plaats, b.levering === "bezorgen" ? wijkVan(b.postcode, inst.wijken) : "",
        regels.map((r) => `${r.aantal}x ${r.naam}`).join(", "), regels.reduce((s, r) => s + r.aantal, 0), (b.gewicht_gram / 1000).toString().replace(".", ","),
        bedrag(b.subtotaal_cent), bedrag(b.korting_cent), bedrag(b.bezorg_cent), bedrag(b.totaal_cent), b.betaalwijze === "tikkie" ? "Tikkie" : "Bij ontvangst",
        bedrag(b.betaald_cent), BETAAL_STATUS[bs(b)], b.opmerking,
      ];
    });
    return csvAntwoord(
      `strooizout-bestellingen-${achter}.csv`,
      csv(["Bestelnummer", "Afhaalcode", "Datum", "Ronde", "Status", "Levering", "Moment", "Naam", "E-mail", "Telefoon", "Adres", "Postcode", "Plaats", "Wijk", "Producten", "Stuks", "Gewicht (kg)", "Subtotaal", "Korting", "Bezorgkosten", "Totaal", "Betaalwijze", "Betaald", "Betaalstatus", "Opmerking"], rijen),
    );
  }
  if (soort === "financien") {
    const rijen = [...data.bestellingen].reverse().map((b) => {
      const regels = per.get(b.id) ?? [];
      const ink = regels.map((r) => regelInkoop(cat, r));
      const inkoop = ink.some((x) => x === null) ? null : ink.reduce<number>((s, x) => s + (x ?? 0), 0);
      const telt = b.status !== "geannuleerd";
      return [
        bestelnummer(b.id), nlDatum(b.aangemaakt), b.ronde_id ?? "", BESTEL_STATUS[b.status], b.levering,
        bedrag(telt ? b.subtotaal_cent + b.korting_cent : 0), bedrag(telt ? b.korting_cent : 0), bedrag(telt ? b.subtotaal_cent : 0), bedrag(telt ? b.bezorg_cent : 0), bedrag(telt ? b.totaal_cent : 0),
        inst.btw_modus === "inclusief" ? bedrag(telt ? btwDeel(b.totaal_cent, inst.btw_tarief) : 0) : "",
        bedrag(telt ? inkoop : 0), telt && inkoop !== null ? bedrag(b.totaal_cent - inkoop) : "", bedrag(b.betaald_cent),
        bedrag(telt ? Math.max(0, b.totaal_cent - b.betaald_cent) : 0), b.betaalwijze === "tikkie" ? "Tikkie" : "Bij ontvangst", BETAAL_STATUS[bs(b)],
      ];
    });
    return csvAntwoord(
      `strooizout-financien-${achter}.csv`,
      csv(["Bestelnummer", "Datum", "Ronde", "Status", "Levering", "Producten normale prijs", "Korting", "Omzet producten", "Bezorgopbrengst", "Totaal", "Waarvan btw", "Inkoop", "Brutowinst", "Ontvangen", "Openstaand", "Betaalwijze", "Betaalstatus"], rijen),
    );
  }
  if (soort === "producten") {
    const c = cijfers(cat, inst, data.bestellingen, data.regels);
    return csvAntwoord(
      `strooizout-marge-per-product-${achter}.csv`,
      csv(["Product", "Aantal", "Omzet incl. btw", "Inkoop incl. btw", "Marge incl. btw", "Marge excl. btw", "Gewicht (kg)"], c.per_product.map((p) => [p.naam, p.aantal, bedrag(p.omzet_cent), p.inkoop_onbekend ? "onbekend" : bedrag(p.inkoop_cent), bedrag(p.marge_cent), bedrag(p.marge_excl_cent), (p.gewicht_gram / 1000).toString().replace(".", ",")])),
    );
  }
  return fout("Onbekende export.", 404);
}

// ---------- Router ----------

export async function handleBeheer(request: Request, env: SzEnv, ctx: ExecutionContext, nuSec: number, pad: string, method: string): Promise<Response> {
  const geweigerd = await toegang(request, env, nuSec);
  if (geweigerd) return geweigerd;
  // Wijzigende verzoeken alleen vanaf de eigen site (aanvullend op het token).
  if (method !== "GET" && method !== "HEAD") {
    const origin = request.headers.get("Origin");
    if (origin && new URL(origin).host !== new URL(request.url).host) return fout("Alleen vanaf de eigen site.", 403);
  }
  const id = (re: RegExp) => {
    const m = pad.match(re);
    return m ? Number(m[1]) : null;
  };
  let n: number | null;
  if (pad === "/sessie" && method === "GET") return json({ ok: true });
  if (pad === "/overzicht" && method === "GET") return overzicht(request, env, ctx);
  if (pad === "/financien" && method === "GET") return financien(request, env);
  if (pad === "/bestellingen" && method === "GET") return bestellingen(request, env);
  if ((n = id(/^\/bestellingen\/(\d{1,9})$/)) !== null && method === "GET") return bestelling(env, n, request);
  if ((n = id(/^\/bestellingen\/(\d{1,9})$/)) !== null && method === "PUT") return bewerkBestelling(request, env, n);
  if ((n = id(/^\/bestellingen\/(\d{1,9})\/status$/)) !== null && method === "POST") return wijzigStatus(request, env, n);
  if ((n = id(/^\/bestellingen\/(\d{1,9})\/betaling$/)) !== null && method === "POST") return registreerBetaling(request, env, n);
  if ((n = id(/^\/bestellingen\/(\d{1,9})\/betaalverzoek$/)) !== null && method === "POST") return betaalverzoek(request, env, n);
  if ((n = id(/^\/betalingen\/(\d{1,9})$/)) !== null && method === "DELETE") return verwijderBetaling(env, n);
  const afh = pad.match(/^\/afhalen\/([^/]{1,20})(\/uitgeven)?$/);
  if (afh && !afh[2] && method === "GET") return afhalenZoeken(env, afh[1]);
  if (afh && afh[2] && method === "POST") return uitgeven(request, env, afh[1]);
  if (pad === "/route" && method === "GET") return route(request, env);
  if (pad === "/producten" && method === "GET") return producten(env);
  if (pad === "/producten" && method === "POST") return nieuwProduct(request, env);
  if ((n = id(/^\/producten\/(\d{1,9})$/)) !== null && method === "PUT") return wijzigProduct(request, env, n);
  if ((n = id(/^\/producten\/(\d{1,9})$/)) !== null && method === "DELETE") return verwijderProduct(env, n);
  if ((n = id(/^\/producten\/(\d{1,9})\/status$/)) !== null && method === "PUT") return productStatus(request, env, n);
  if (pad === "/categorieen" && method === "POST") return nieuweCategorie(request, env);
  if ((n = id(/^\/categorieen\/(\d{1,9})$/)) !== null && method === "PUT") return wijzigCategorie(request, env, n);
  if (pad === "/afbeeldingen" && method === "POST") return uploadAfbeelding(request, env);
  if ((n = id(/^\/afbeeldingen\/(\d{1,9})$/)) !== null && method === "DELETE") return verwijderAfbeelding(env, n);
  if (pad === "/voorraad" && method === "GET") return json({ ok: true, voorraad: await voorraadOverzicht(env) });
  if (pad === "/voorraad/afvullen" && method === "POST") return afvullen(request, env);
  if ((n = id(/^\/voorraad\/(\d{1,9})$/)) !== null && method === "POST") return voorraadWijzigen(request, env, n);
  if (pad === "/straatverkoop" && method === "POST") return straatverkoop(request, env);
  if (pad === "/rondes" && method === "GET") return rondes(env);
  if (pad === "/rondes" && method === "POST") return nieuweRonde(request, env);
  if ((n = id(/^\/rondes\/(\d{1,9})$/)) !== null && method === "PUT") return wijzigRonde(request, env, n);
  if ((n = id(/^\/rondes\/(\d{1,9})\/behoefte$/)) !== null && method === "GET") return behoefte(env, n);
  if (pad === "/momenten" && method === "POST") return nieuwMoment(request, env);
  if ((n = id(/^\/momenten\/(\d{1,9})$/)) !== null && method === "PUT") return wijzigMoment(request, env, n);
  if ((n = id(/^\/momenten\/(\d{1,9})$/)) !== null && method === "DELETE") return verwijderMoment(env, n);
  if (pad === "/instellingen" && method === "GET") return instellingen(env);
  if (pad === "/instellingen" && method === "PUT") return bewaarInstellingen(request, env);
  if (pad === "/opschonen" && method === "POST") return json({ ok: true, gewist: await opschonen(env.DB, await laadInstellingen(env.DB)) });
  const exp = pad.match(/^\/export\/(bestellingen|financien|producten)\.csv$/);
  if (exp && method === "GET") return export_(request, env, exp[1]);
  return fout("Onbekend beheeradres.", 404);
}
