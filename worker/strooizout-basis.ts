// Strooizout voor de buurt: gedeelde hulpfuncties van de Worker (HTTP, instellingen, producten, tijd).

import { STANDAARD_INSTELLINGEN, type Aanbieding, type Instellingen, type PrijsProduct, type PubliekProduct } from "../shared/strooizout";

export interface SzEnv {
  DB: D1Database;
  ADMIN_TOKEN?: string;
  /** Optioneel apart beheertoken voor alleen de webshop (min. 24 tekens). */
  STROOIZOUT_TOKEN?: string;
  HASH_SECRET?: string;
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

/** Persoonlijke code voor de bestelpagina van de klant: ID plus HMAC, zodat niemand andermans bestelling kan raden. */
export async function klantCode(env: SzEnv, id: number): Promise<string> {
  return `${id}-${(await hmacHex(geheim(env), `strooizout-bestelling|${id}`)).slice(0, 24)}`;
}

export async function leesKlantCode(env: SzEnv, code: unknown): Promise<number | null> {
  if (typeof code !== "string" || !/^[0-9]{1,9}-[0-9a-f]{24}$/.test(code)) return null;
  const id = Number(code.split("-")[0]);
  return gelijk(await klantCode(env, id), code) ? id : null;
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
  max_per_bestelling: number;
  afbeelding: string;
  afbeelding_alt: string;
  notitie: string;
  volgorde: number;
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
};

export async function laadCatalogus(db: D1Database, { ookVerwijderd = false } = {}): Promise<Catalogus> {
  const [p, o, a] = await db.batch([
    db.prepare(
      `SELECT p.*, c.slug AS categorie FROM sz_product p LEFT JOIN sz_categorie c ON c.id = p.categorie_id
       ${ookVerwijderd ? "" : "WHERE p.status != 'verwijderd'"} ORDER BY p.volgorde, p.id`,
    ),
    db.prepare("SELECT pakket_id, product_id, aantal FROM sz_pakket_onderdeel"),
    db.prepare("SELECT * FROM sz_aanbieding ORDER BY vanaf_aantal, id"),
  ]);
  const producten = (p.results ?? []) as ProductRij[];
  const onderdelen = new Map<number, Onderdeel[]>();
  for (const r of (o.results ?? []) as Onderdeel[]) onderdelen.set(r.pakket_id, [...(onderdelen.get(r.pakket_id) ?? []), r]);
  const aanbiedingen = new Map<number, Aanbieding[]>();
  for (const r of (a.results ?? []) as AanbiedingRij[]) {
    aanbiedingen.set(r.product_id, [...(aanbiedingen.get(r.product_id) ?? []), { id: r.id, naam: r.naam, vanaf_aantal: r.vanaf_aantal, prijs_cent: r.prijs_cent, start: r.start, eind: r.eind, actief: !!r.actief }]);
  }
  return { producten, perId: new Map(producten.map((x) => [x.id, x])), onderdelen, aanbiedingen };
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

export function publiek(cat: Catalogus, p: ProductRij, standaardBezorg: number): PubliekProduct {
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
