// Strooizout voor de buurt: gedeelde hulpfuncties van de Worker (HTTP, instellingen, producten, tijd).

import { STANDAARD_INSTELLINGEN, type Aanbieding, type Berekening, type Instellingen, type Klantgegevens, type PrijsProduct, type PubliekProduct } from "../shared/strooizout";

export interface SzEnv {
  DB: D1Database;
  ADMIN_TOKEN?: string;
  /** Optioneel apart beheertoken voor alleen de webshop (min. 24 tekens). */
  STROOIZOUT_TOKEN?: string;
  HASH_SECRET?: string;
  /** De e-mailbinding (`send_email`); zonder gaat er geen mail uit (worker/strooizout-mail.ts). */
  SZ_MAIL?: { send(bericht: unknown): Promise<unknown> };
  /** Alleen met de waarde "aan" wordt er mail verstuurd. */
  STROOIZOUT_MAIL?: string;
  /** Wie met een e-mailcode op het beheer mag inloggen: adressen gescheiden door komma's (Worker-geheim). */
  STROOIZOUT_BEHEER_EMAILS?: string;
}

export const encoder = new TextEncoder();

const API_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

export function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...API_HEADERS, ...extra } });
}

export function fout(melding: string, status: number, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}): Response {
  return json({ ok: false, error: melding, ...extra }, status, headers);
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function leesJson(request: Request, maxBytes = 8192): Promise<Record<string, unknown> | Response> {
  if (!(request.headers.get("Content-Type") ?? "").toLowerCase().startsWith("application/json")) return fout("Alleen JSON wordt aangenomen.", 415);
  const lengte = Number(request.headers.get("Content-Length") ?? "0");
  if (lengte > maxBytes) return fout("Het verzoek is te groot.", 413);
  const tekst = await request.text();
  if (encoder.encode(tekst).length > maxBytes) return fout("Het verzoek is te groot.", 413);
  try {
    const data = JSON.parse(tekst);
    if (!data || typeof data !== "object" || Array.isArray(data)) return fout("Het formulier was onleesbaar.", 400);
    return data as Record<string, unknown>;
  } catch {
    return fout("Het formulier was onleesbaar.", 400);
  }
}

export async function hmacHex(geheim: string, waarde: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(geheim), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(waarde));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function gelijk(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export function geheim(env: SzEnv): string {
  // De publieke bestelroutes weigeren al zonder HASH_SECRET (worker/strooizout.ts); dit is alleen nog een vangnet.
  if (!env.HASH_SECRET) throw new Error("HASH_SECRET ontbreekt");
  return env.HASH_SECRET;
}

/**
 * Persoonlijke code voor de bestelpagina van de klant: de cijfers van de (willekeurige) afhaalcode plus een HMAC, zodat
 * niemand andermans bestelling kan raden. Er zit bewust geen volgnummer in: een klant kan nergens aan zien hoeveel
 * bestellingen er zijn. Alleen een bestelling zonder afhaalcode krijgt nog de oude vorm (volgnummer plus HMAC).
 */
export async function klantCode(env: SzEnv, b: { id: number; afhaalcode?: string | null }): Promise<string> {
  const mac = (await hmacHex(geheim(env), `strooizout-bestelling|${b.id}`)).slice(0, 24);
  const cijfers = /^H-(\d{4,5})$/.exec(b.afhaalcode ?? "")?.[1];
  return cijfers ? `h${cijfers}-${mac}` : `${b.id}-${mac}`;
}

export async function leesKlantCode(env: SzEnv, code: unknown): Promise<number | null> {
  if (typeof code !== "string") return null;
  const nieuw = /^h(\d{4,5})-[0-9a-f]{24}$/.exec(code);
  if (nieuw) {
    const rij = await env.DB.prepare("SELECT id, afhaalcode FROM sz_bestelling WHERE afhaalcode = ?1").bind(`H-${nieuw[1]}`).first<{ id: number; afhaalcode: string }>();
    return rij && gelijk(await klantCode(env, rij), code) ? rij.id : null;
  }
  // de oude vorm blijft leesbaar (links die al zijn verstuurd)
  if (!/^[0-9]{1,9}-[0-9a-f]{24}$/.test(code)) return null;
  const id = Number(code.split("-")[0]);
  return gelijk(await klantCode(env, { id }), code) ? id : null;
}

export function nuIso(): string {
  return new Date().toISOString();
}

// ---------- Instellingen ----------

export async function laadInstellingen(db: D1Database): Promise<Instellingen> {
  const { results } = await db.prepare("SELECT sleutel, waarde FROM sz_instelling").all<{ sleutel: string; waarde: string }>();
  const inst = { ...STANDAARD_INSTELLINGEN } as Record<string, unknown>;
  for (const r of results) {
    if (!(r.sleutel in STANDAARD_INSTELLINGEN)) continue;
    try {
      inst[r.sleutel] = JSON.parse(r.waarde);
    } catch {
      /* beschadigde waarde: standaard houden */
    }
  }
  return inst as Instellingen;
}

// ---------- Producten ----------

export type ProductRij = {
  id: number;
  slug: string;
  naam: string;
  categorie_id: number | null;
  categorie: string | null;
  status: string;
  kort: string;
  beschrijving: string;
  specificaties: string;
  prijs_cent: number | null;
  inkoop_cent: number | null;
  bezorg_cent: number | null;
  gewicht_gram: number;
  eenheid: string;
  voorraad: number | null;
  voorraad_verwacht: number | null;
  voorraad_ontvangen: number;
  max_per_bestelling: number;
  afbeelding: string;
  afbeelding_alt: string;
  notitie: string;
  volgorde: number;
  /** 1 = dit product kan alleen worden afgehaald (bijvoorbeeld zout dat ter plekke wordt afgewogen). */
  alleen_afhalen: number;
  /** Korte melding voor de klant die dit product bestelt (bestelkaart, bestelpagina, bevestigingsmail). */
  klant_melding: string;
  /** Het product (de zak) waar dit product uit wordt gevuld of afgewogen; null = eigen voorraad. */
  vult_uit: number | null;
  aangemaakt: string;
  gewijzigd: string;
};

export type Onderdeel = { pakket_id: number; product_id: number; aantal: number };
export type AanbiedingRij = { id: number; product_id: number; naam: string; vanaf_aantal: number; prijs_cent: number; start: string | null; eind: string | null; actief: number };

export type Catalogus = {
  producten: ProductRij[];
  perId: Map<number, ProductRij>;
  onderdelen: Map<number, Onderdeel[]>;
  aanbiedingen: Map<number, Aanbieding[]>;
  /** Los zout van aangebroken zakken, in grammen (telt mee voor producten die uit zakken worden gevuld). */
  losGram: number;
};

export async function laadCatalogus(db: D1Database, { ookVerwijderd = false } = {}): Promise<Catalogus> {
  const [p, o, a, l] = await db.batch([
    db.prepare(
      `SELECT p.*, c.slug AS categorie FROM sz_product p LEFT JOIN sz_categorie c ON c.id = p.categorie_id
       ${ookVerwijderd ? "" : "WHERE p.status != 'verwijderd'"} ORDER BY p.volgorde, p.id`,
    ),
    db.prepare("SELECT pakket_id, product_id, aantal FROM sz_pakket_onderdeel"),
    db.prepare("SELECT * FROM sz_aanbieding ORDER BY vanaf_aantal, id"),
    db.prepare("SELECT gram FROM sz_los_zout WHERE id = 1"),
  ]);
  const producten = (p.results ?? []) as ProductRij[];
  const onderdelen = new Map<number, Onderdeel[]>();
  for (const r of (o.results ?? []) as Onderdeel[]) onderdelen.set(r.pakket_id, [...(onderdelen.get(r.pakket_id) ?? []), r]);
  const aanbiedingen = new Map<number, Aanbieding[]>();
  for (const r of (a.results ?? []) as AanbiedingRij[]) {
    aanbiedingen.set(r.product_id, [...(aanbiedingen.get(r.product_id) ?? []), { id: r.id, naam: r.naam, vanaf_aantal: r.vanaf_aantal, prijs_cent: r.prijs_cent, start: r.start, eind: r.eind, actief: !!r.actief }]);
  }
  return { producten, perId: new Map(producten.map((x) => [x.id, x])), onderdelen, aanbiedingen, losGram: ((l.results ?? []) as { gram: number }[])[0]?.gram ?? 0 };
}

/** Inkoop per stuk: eigen inkoopprijs, of bij een pakket de som van de onderdelen. null als iets onbekend is. */
export function inkoopVan(cat: Catalogus, p: ProductRij): number | null {
  if (p.inkoop_cent !== null) return p.inkoop_cent;
  const delen = cat.onderdelen.get(p.id);
  if (!delen?.length) return null;
  let som = 0;
  for (const d of delen) {
    const deel = cat.perId.get(d.product_id);
    if (!deel || deel.inkoop_cent === null) return null;
    som += deel.inkoop_cent * d.aantal;
  }
  return som;
}

/** Gewicht per stuk: eigen gewicht, of bij een pakket zonder eigen gewicht de som van de onderdelen. */
export function gewichtVan(cat: Catalogus, p: ProductRij): number {
  if (p.gewicht_gram > 0) return p.gewicht_gram;
  return (cat.onderdelen.get(p.id) ?? []).reduce((s, d) => s + (cat.perId.get(d.product_id)?.gewicht_gram ?? 0) * d.aantal, 0);
}

/** Bezorgkosten per stuk: eigen tarief, bij een pakket de som van de onderdelen, anders standaard (null). */
export function bezorgVan(cat: Catalogus, p: ProductRij, standaard: number): number | null {
  if (p.bezorg_cent !== null) return p.bezorg_cent;
  const delen = cat.onderdelen.get(p.id);
  if (!delen?.length) return null;
  return delen.reduce((s, d) => s + (cat.perId.get(d.product_id)?.bezorg_cent ?? standaard) * d.aantal, 0);
}

/** De zak waar dit product uit wordt gevuld of afgewogen, als dat is ingesteld en beide een gewicht hebben. */
export function bronVan(cat: Catalogus, p: ProductRij): ProductRij | null {
  const bron = p.vult_uit ? cat.perId.get(p.vult_uit) : undefined;
  return bron && bron.id !== p.id && p.gewicht_gram > 0 && bron.gewicht_gram > 0 ? bron : null;
}

/**
 * Zout toewijzen aan producten die uit zakken worden gevuld (10 kg in een emmer): staat er voor een bestelling niet
 * genoeg klaar, dan komt het tekort uit het losse zout en anders uit een zak. Die zak gaat van de zakvoorraad af
 * (verwacht en te bestellen; ook ‘ontvangen’ als alles al binnen is), de rest wordt los zout, en de porties komen bij
 * het product als verwachte voorraad. ‘Ontvangen’ van het product verandert niet: dat bevestigt de beheerder pas als
 * het zout echt is afgevuld of klaargezet. De statements horen in dezelfde batch als de bestelling, vóór het afboeken:
 * alle wijzigingen zijn relatief en de CHECK’s (nooit onder nul) laten de hele batch mislukken als een ander net voor was.
 */
export function omzetting(db: D1Database, cat: Catalogus, effect: Map<number, number>, kenmerk: string, nu: string): D1PreparedStatement[] {
  const uit: D1PreparedStatement[] = [];
  let los = cat.losGram;
  for (const [productId, aantal] of effect) {
    const p = cat.perId.get(productId);
    const bron = p ? bronVan(cat, p) : null;
    if (!p || !bron || p.voorraad === null) continue;
    const tekort = aantal - p.voorraad;
    if (tekort <= 0) continue;
    const erbijProduct = db.prepare("UPDATE sz_product SET voorraad = voorraad + ?2, voorraad_verwacht = COALESCE(voorraad_verwacht, 0) + ?2, gewijzigd = ?3 WHERE id = ?1").bind(p.id, tekort, nu);
    // Zakken zonder voorraadgrens (per ronde ingekocht): er valt niets af te boeken, alleen de porties bij te houden.
    if (bron.voorraad === null) {
      uit.push(erbijProduct);
      continue;
    }
    const nodig = tekort * p.gewicht_gram;
    const zakken = Math.max(0, Math.ceil((nodig - los) / bron.gewicht_gram));
    const erbij = zakken * bron.gewicht_gram - nodig;
    los += erbij;
    if (zakken > 0) {
      uit.push(
        db
          .prepare(
            `UPDATE sz_product SET voorraad = voorraad - ?2,
               voorraad_ontvangen = CASE WHEN voorraad_verwacht IS NOT NULL AND voorraad_ontvangen >= voorraad_verwacht THEN voorraad_ontvangen - ?2 ELSE voorraad_ontvangen END,
               voorraad_verwacht = CASE WHEN voorraad_verwacht IS NULL THEN NULL ELSE voorraad_verwacht - ?2 END, gewijzigd = ?3
             WHERE id = ?1`,
          )
          .bind(bron.id, zakken, nu),
      );
    }
    uit.push(
      db.prepare("UPDATE sz_los_zout SET gram = gram + ?1, laatste = ?2 WHERE id = 1").bind(erbij, kenmerk),
      erbijProduct,
      db.prepare("INSERT INTO sz_log (bestelling_id, actie, details, op) VALUES (NULL, 'zout toegewezen', ?1, ?2)").bind(`${tekort} × #${p.id} uit ${zakken} × #${bron.id}; los zout ${erbij >= 0 ? "+" : "−"}${Math.abs(erbij) / 1000} kg`, nu),
    );
  }
  return uit;
}

/** Wat er van de voorraad af moet bij `aantal` stuks van dit product (een pakket haalt van zijn onderdelen af). */
export function voorraadEffect(cat: Catalogus, p: ProductRij, aantal: number, uit = new Map<number, number>()): Map<number, number> {
  if (p.voorraad !== null) uit.set(p.id, (uit.get(p.id) ?? 0) + aantal);
  for (const d of cat.onderdelen.get(p.id) ?? []) {
    const deel = cat.perId.get(d.product_id);
    if (deel && deel.voorraad !== null) uit.set(deel.id, (uit.get(deel.id) ?? 0) + aantal * d.aantal);
  }
  return uit;
}

/** Beschikbare voorraad voor de klant: eigen voorraad en/of wat de onderdelen toelaten. null = geen voorraadgrens. */
export function beschikbaar(cat: Catalogus, p: ProductRij): number | null {
  let grens: number | null = p.voorraad;
  // Wordt dit product uit zakken gevuld of afgewogen, dan is er naast wat al klaarstaat ook te bestellen wat het losse
  // zout en de nog niet bestelde zakken opleveren. Bij het bestellen gaat dat zout van de zakvoorraad af (`omzetting`).
  const bron = bronVan(cat, p);
  if (bron && grens !== null) {
    if (bron.voorraad === null) return null;
    grens += Math.floor((cat.losGram + bron.voorraad * bron.gewicht_gram) / p.gewicht_gram);
  }
  for (const d of cat.onderdelen.get(p.id) ?? []) {
    const deel = cat.perId.get(d.product_id);
    if (!deel || deel.voorraad === null) continue;
    const kan = Math.floor(deel.voorraad / d.aantal);
    grens = grens === null ? kan : Math.min(grens, kan);
  }
  return grens;
}

export function alsPrijs(cat: Catalogus, p: ProductRij, standaardBezorg: number): PrijsProduct {
  return {
    id: p.id,
    naam: p.naam,
    prijs_cent: p.prijs_cent ?? 0,
    inkoop_cent: inkoopVan(cat, p),
    bezorg_cent: bezorgVan(cat, p, standaardBezorg),
    gewicht_gram: gewichtVan(cat, p),
    aanbiedingen: cat.aanbiedingen.get(p.id) ?? [],
  };
}

export function specs(json: string): { label: string; waarde: string }[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x) => x && typeof x.label === "string" && typeof x.waarde === "string") : [];
  } catch {
    return [];
  }
}

/** Een product is te koop als het actief is en een prijs heeft. */
export function teKoop(p: ProductRij): boolean {
  return p.status === "actief" && p.prijs_cent !== null && p.prijs_cent > 0;
}

/** Zakken per stuk: 1 voor een product met eenheid ‘zak’, bij een pakket het aantal zakken erin, anders 0. */
export function zakkenPerStuk(cat: Catalogus, p: ProductRij): number {
  if (p.eenheid === "zak") return 1;
  return (cat.onderdelen.get(p.id) ?? []).reduce((s, d) => s + (cat.perId.get(d.product_id)?.eenheid === "zak" ? d.aantal : 0), 0);
}

/** Werkelijk in het magazijn per product: ontvangen min wat al is uitgegeven (afgehaald of bezorgd). */
export async function laadMagazijn(db: D1Database): Promise<Map<number, number>> {
  const { results } = await db
    .prepare(
      `SELECT p.id, p.voorraad_ontvangen - COALESCE((SELECT SUM(m.aantal) FROM sz_voorraad_mutatie m JOIN sz_bestelling b ON b.id = m.bestelling_id
                                                     WHERE m.product_id = p.id AND b.status IN ('afgehaald', 'bezorgd')), 0) AS in_magazijn
       FROM sz_product p`,
    )
    .all<{ id: number; in_magazijn: number }>();
  return new Map(results.map((r) => [r.id, r.in_magazijn]));
}

/** Ligt er werkelijk voorraad voor dit product (of al zijn onderdelen)? null = geen voorraadbeheer. */
export function opVoorraad(cat: Catalogus, p: ProductRij, magazijn: Map<number, number>): boolean | null {
  const delen = cat.onderdelen.get(p.id) ?? [];
  const gevolgd = [p, ...delen.map((d) => cat.perId.get(d.product_id)!)].filter((x) => x && x.voorraad !== null);
  if (!gevolgd.length) return null;
  if (p.voorraad !== null && (magazijn.get(p.id) ?? 0) < 1) return false;
  return delen.every((d) => {
    const deel = cat.perId.get(d.product_id);
    return !deel || deel.voorraad === null || (magazijn.get(deel.id) ?? 0) >= d.aantal;
  });
}

export function publiek(cat: Catalogus, p: ProductRij, standaardBezorg: number, magazijn: Map<number, number> = new Map()): PubliekProduct {
  return {
    id: p.id,
    slug: p.slug,
    naam: p.naam,
    categorie: p.categorie ?? "",
    kort: p.kort,
    beschrijving: p.beschrijving,
    specificaties: specs(p.specificaties),
    prijs_cent: p.prijs_cent ?? 0,
    bezorg_cent: bezorgVan(cat, p, standaardBezorg),
    gewicht_gram: gewichtVan(cat, p),
    eenheid: p.eenheid,
    voorraad: beschikbaar(cat, p),
    op_voorraad: opVoorraad(cat, p, magazijn),
    zakken_per_stuk: zakkenPerStuk(cat, p),
    alleen_afhalen: !!p.alleen_afhalen,
    melding: p.klant_melding ?? "",
    max_per_bestelling: p.max_per_bestelling,
    afbeelding: p.afbeelding,
    afbeelding_alt: p.afbeelding_alt,
    pakket: (cat.onderdelen.get(p.id) ?? []).map((d) => ({ naam: cat.perId.get(d.product_id)?.naam ?? "", aantal: d.aantal })),
    aanbiedingen: (cat.aanbiedingen.get(p.id) ?? []).filter((a) => a.actief),
  };
}

// ---------- Bestelronde ----------

export type RondeRij = {
  id: number;
  naam: string;
  status: string;
  sluit_op: string | null;
  notitie: string;
  leverancier: string;
  inkoop_datum: string | null;
  inkoop_bedrag_cent: number | null;
  inkoop_notitie: string;
  levering_datum: string | null;
  aangemaakt: string;
  gesloten_op: string | null;
};

/** De ronde waarin nu besteld kan worden: status open en de sluitdatum nog niet voorbij. */
export async function openRonde(db: D1Database, nu: string): Promise<RondeRij | null> {
  return db
    .prepare("SELECT * FROM sz_ronde WHERE status = 'open' AND (sluit_op IS NULL OR sluit_op > ?1) ORDER BY id DESC LIMIT 1")
    .bind(nu)
    .first<RondeRij>();
}

export async function log(db: D1Database, bestellingId: number | null, actie: string, details = ""): Promise<void> {
  await db.prepare("INSERT INTO sz_log (bestelling_id, actie, details, op) VALUES (?1, ?2, ?3, ?4)").bind(bestellingId, actie, details.slice(0, 300), nuIso()).run();
}

export function logStmt(db: D1Database, bestellingId: number | null, actie: string, details = ""): D1PreparedStatement {
  return db.prepare("INSERT INTO sz_log (bestelling_id, actie, details, op) VALUES (?1, ?2, ?3, ?4)").bind(bestellingId, actie, details.slice(0, 300), nuIso());
}

/**
 * Statements die de voorraad van een geannuleerde bestelling precies één keer teruggeven. Zet ze in dezelfde batch ná de
 * statuswijziging: ze doen alleen iets als de bestelling dan echt geannuleerd is en de voorraad nog niet terug is.
 */
export function vrijgeefStatements(db: D1Database, id: number): D1PreparedStatement[] {
  return [
    db
      .prepare(
        `UPDATE sz_product SET voorraad = voorraad + (SELECT m.aantal FROM sz_voorraad_mutatie m WHERE m.bestelling_id = ?1 AND m.product_id = sz_product.id)
         WHERE voorraad IS NOT NULL
           AND id IN (SELECT product_id FROM sz_voorraad_mutatie WHERE bestelling_id = ?1)
           AND EXISTS (SELECT 1 FROM sz_bestelling WHERE id = ?1 AND status = 'geannuleerd' AND voorraad_vrijgegeven = 0)`,
      )
      .bind(id),
    db.prepare("UPDATE sz_bestelling SET voorraad_vrijgegeven = 1 WHERE id = ?1 AND status = 'geannuleerd'").bind(id),
  ];
}

// ---------- Bestelling opslaan (webshop, QR aan de weg en straatverkoop in het beheer) ----------

export type NieuweBestelling = {
  idempotentie: string;
  afhaalcode: string;
  rondeId: number | null;
  kanaal: "web" | "straat" | "beheer";
  levering: "ophalen" | "bezorgen";
  momentId: number | null;
  klant: Klantgegevens;
  betaalwijze: "bij_ontvangst" | "tikkie";
  som: Berekening;
  /** Wat er van de voorraad af moet (ook pakketonderdelen). */
  effect: Map<number, number>;
  /** Zout toewijzen uit zakken voor producten die daaruit worden gevuld (zie `omzetting`); vóór het afboeken. */
  omzet?: D1PreparedStatement[];
  /** Geplaatst terwijl de voorraad er nog niet (genoeg) lag. */
  voorbestelling: boolean;
  /** Herkomst (?via=… of verwijzende site), zonder persoonsgegevens. */
  bron?: string;
  nu: string;
};

/**
 * Alle statements van één bestelling, voor één `db.batch` (= één transactie). De bestelling wordt alleen ingevoegd als
 * het gekozen moment niet intussen vol is; voegt die niets in, dan faalt de eerste bestelregel op bestelling_id NOT NULL
 * en draait de hele batch terug. De CHECK (voorraad >= 0) voorkomt oververkoop, ook bij gelijktijdige bestellingen.
 */
export function bestelStatements(db: D1Database, o: NieuweBestelling): D1PreparedStatement[] {
  const k = o.klant;
  const idSub = "(SELECT id FROM sz_bestelling WHERE idempotentie = ?1)";
  return [
    db
      .prepare(
        `INSERT INTO sz_bestelling (idempotentie, afhaalcode, ronde_id, status, levering, moment_id, naam, email, telefoon, straat, huisnummer, postcode, plaats, opmerking,
           betaalwijze, subtotaal_cent, korting_cent, bezorg_cent, totaal_cent, gewicht_gram, aangemaakt, gewijzigd, kanaal, voorbestelling, bron)
         SELECT ?1, ?20, ?2, 'nieuw', ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?19, ?21, ?22, ?23
         WHERE ?4 IS NULL OR (SELECT COUNT(*) FROM sz_bestelling WHERE moment_id = ?4 AND status != 'geannuleerd')
               < COALESCE((SELECT max_bestellingen FROM sz_moment WHERE id = ?4), 1000000000)`,
      )
      .bind(o.idempotentie, o.rondeId, o.levering, o.momentId, k.naam, k.email, k.telefoon, k.straat, k.huisnummer, k.postcode, k.plaats, k.opmerking, o.betaalwijze, o.som.subtotaal_cent, o.som.korting_cent, o.som.bezorg_cent, o.som.totaal_cent, o.som.gewicht_gram, o.nu, o.afhaalcode, o.kanaal, o.voorbestelling ? 1 : 0, o.bron ?? ""),
    ...o.som.regels.map((r) =>
      db
        .prepare(
          `INSERT INTO sz_bestelregel (bestelling_id, product_id, naam, aantal, stukprijs_cent, normaalprijs_cent, inkoop_cent, bezorg_cent, gewicht_gram, aanbieding)
           VALUES (${idSub}, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
        )
        .bind(o.idempotentie, r.product_id, r.naam, r.aantal, r.stukprijs_cent, r.normaalprijs_cent, r.inkoop_cent, r.bezorg_cent, r.gewicht_gram, r.aanbieding),
    ),
    ...(o.omzet ?? []),
    ...[...o.effect].flatMap(([productId, aantal]) => [
      db.prepare("UPDATE sz_product SET voorraad = voorraad - ?2 WHERE id = ?1 AND voorraad IS NOT NULL").bind(productId, aantal),
      db.prepare(`INSERT INTO sz_voorraad_mutatie (bestelling_id, product_id, aantal) VALUES (${idSub}, ?2, ?3)`).bind(o.idempotentie, productId, aantal),
    ]),
    db.prepare(`INSERT INTO sz_log (bestelling_id, actie, details, op) VALUES (${idSub}, 'aangemaakt', ?2, ?3)`).bind(o.idempotentie, `${o.kanaal}, ${o.levering}, ${o.som.aantal_stuks} stuks`, o.nu),
  ];
}

/** Is er genoeg ontvangen voorraad om deze bestelling uit te geven? Geeft een melding bij een tekort, anders null. */
export async function tekortBijUitgifte(db: D1Database, bestellingId: number): Promise<string | null> {
  const [mut, magazijn] = await Promise.all([
    db.prepare("SELECT m.product_id, m.aantal, p.naam FROM sz_voorraad_mutatie m JOIN sz_product p ON p.id = m.product_id WHERE m.bestelling_id = ?1").bind(bestellingId).all<{ product_id: number; aantal: number; naam: string }>(),
    laadMagazijn(db),
  ]);
  for (const m of mut.results) {
    const er = magazijn.get(m.product_id) ?? 0;
    if (er < m.aantal) return `Nog niet genoeg ${m.naam} ontvangen (in voorraad: ${Math.max(0, er)}, nodig: ${m.aantal}). Bevestig eerst de ontvangst bij Voorraad.`;
  }
  return null;
}
