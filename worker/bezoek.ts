// Bezoekmeting van de Bijbelreis (bijbelreis.nl): hoeveel bezoeken er zijn en hoe lang ze duren.
// Eigen meting, zonder cookies en zonder externe dienst. Wat er wel en niet bewaard wordt: docs/bijbelreis-bezoek/README.md.
// Deze module wordt door beide Workers gebruikt: worker/bijbelreis-app.ts (bijbelreis.nl) en worker/index.ts (de lokale
// testopstelling serveert de atlas via de hoofd-Worker; het beheeroverzicht staat ook daar).

export interface BezoekEnv {
  DB?: D1Database;
  HASH_SECRET?: string;
}

const MAX_BYTES = 300;
const MAX_DUUR = 4 * 3600; // de server kapt een bezoek af op vier uur
const MAX_STAPPEN = 2000;
const BEWAAR_DAGEN = 400;
const VENSTER = 600; // seconden
const PER_IP = 300; // meldingen per IP per venster
const TOTAAL = 3000; // meldingen per venster voor deze Worker-instantie, wie ze ook stuurt
const ID = /^[0-9a-f]{32}$/;
const HOST = /^(?=.{1,80}$)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*$/;
const PAGINAS = ["atlas", "boekje"];
const APPARATEN = ["telefoon", "tablet", "desktop"];
const VELDEN = ["i", "p", "a", "h", "d", "s"];
// Geen mensen: zoekmachines, linkvoorbeelden van berichtenapps, bewaking, scripts.
const GEEN_MENS = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|scrapy|httpclient|go-http|okhttp|java\/|facebookexternalhit|whatsapp|telegram|embedly|phantom|puppeteer|playwright/i;

const encoder = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(value))).slice(0, 32);
}

const DAG = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" });
/** De kalenderdag in Nederland (JJJJ-MM-DD) bij een tijdstip in seconden. */
export function dagVan(now: number): string {
  return DAG.format(new Date(now * 1000));
}
/** Een dag eerder of later, als JJJJ-MM-DD. */
function dagPlus(dag: string, n: number): string {
  const d = new Date(dag + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ---------- begrenzing in het geheugen ----------
// De route is openbaar en schrijft naar dezelfde gratis D1 als de hoofdsite (stemmen, ideeën). Deze teller houdt een
// stortvloed tegen vóórdat er iets naar de database gaat. Hij leeft in het geheugen van één Worker-instantie: genoeg om
// de schrijflimiet te beschermen, geen sluitende boekhouding.
let zout = "";
let venster = 0;
let totaal = 0;
const perIp = new Map<string, number>();

async function magMelden(ip: string, now: number): Promise<boolean> {
  const v = Math.floor(now / VENSTER);
  if (v !== venster) { venster = v; totaal = 0; perIp.clear(); }
  if (totaal >= TOTAAL) return false;
  // Het IP-adres staat ook hier niet leesbaar in het geheugen: alleen een hash met een willekeurig zout van deze instantie.
  if (!zout) zout = hex(crypto.getRandomValues(new Uint8Array(16)).buffer as ArrayBuffer);
  const sleutel = hex(await crypto.subtle.digest("SHA-256", encoder.encode(zout + "|" + ip))).slice(0, 24);
  const n = (perIp.get(sleutel) ?? 0) + 1;
  if (perIp.size > 20000 && !perIp.has(sleutel)) return false;
  perIp.set(sleutel, n);
  if (n > PER_IP) return false;
  totaal++;
  return true;
}
/** Alleen voor tests: de tellers in het geheugen leegmaken. */
export function resetBegrenzing(): void {
  venster = 0; totaal = 0; perIp.clear();
}

// ---------- melding van de browser ----------

export type Melding = { id: string; pagina: string; apparaat: string; herkomst: string; duur: number; stappen: number };

/** Leest en controleert een melding. Geeft null bij alles wat niet precies klopt. */
export function leesMelding(tekst: string, eigenHost: string): Melding | null {
  if (encoder.encode(tekst).length > MAX_BYTES) return null;
  let m: unknown;
  try { m = JSON.parse(tekst); } catch { return null; }
  if (!m || typeof m !== "object" || Array.isArray(m)) return null;
  const o = m as Record<string, unknown>;
  if (Object.keys(o).some((k) => !VELDEN.includes(k))) return null;
  const heel = (x: unknown): x is number => typeof x === "number" && Number.isInteger(x) && x >= 0;
  if (typeof o.i !== "string" || !ID.test(o.i)) return null;
  if (typeof o.p !== "string" || !PAGINAS.includes(o.p)) return null;
  if (typeof o.a !== "string" || !APPARATEN.includes(o.a)) return null;
  if (!heel(o.d) || !heel(o.s)) return null;
  if (typeof o.h !== "string") return null;
  const h = o.h.toLowerCase();
  if (h !== "" && !HOST.test(h)) return null;
  const eigen = eigenHost.toLowerCase().replace(/:\d+$/, "");
  const herkomst = h === "" || h === eigen || h === "www." + eigen || "www." + h === eigen ? "direct" : h;
  return { id: o.i, pagina: o.p, apparaat: o.a, herkomst, duur: Math.min(o.d, MAX_DUUR), stappen: Math.min(o.s, MAX_STAPPEN) };
}

/**
 * Komt dit verzoek van een pagina op hetzelfde adres? Een browser zet zelf Sec-Fetch-Site (een script kan die kop niet
 * vervalsen); oudere browsers hebben hem niet, dan telt de kop Origin. Een programma buiten de browser kan beide
 * verzinnen: daartegen helpen de validatie en de begrenzing, niet deze controle.
 */
function vanEigenSite(request: Request): boolean {
  const site = request.headers.get("Sec-Fetch-Site");
  if (site) return site === "same-origin";
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

/** Leest de inhoud tot de grens; een grotere inhoud wordt afgebroken zonder hem helemaal in te lezen. */
async function leesBegrensd(request: Request): Promise<string | null> {
  if (!request.body) return "";
  const lezer = request.body.getReader();
  const delen: Uint8Array[] = [];
  let n = 0;
  for (;;) {
    const { done, value } = await lezer.read();
    if (done) break;
    n += value.byteLength;
    if (n > MAX_BYTES) { await lezer.cancel().catch(() => {}); return null; }
    delen.push(value);
  }
  const alles = new Uint8Array(n);
  let plek = 0;
  for (const d of delen) { alles.set(d, plek); plek += d.byteLength; }
  return new TextDecoder().decode(alles);
}

const LEEG = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

/**
 * POST /api/bezoek. Antwoordt altijd 204 zonder inhoud, ook als de melding wordt afgewezen: wie de route aftast, leert
 * niets. Alleen een goedgekeurde melding leidt tot één schrijfactie.
 */
export async function meldBezoek(request: Request, env: BezoekEnv, ctx: Pick<ExecutionContext, "waitUntil">, now: number): Promise<Response> {
  try {
    if (request.method !== "POST" || !env.DB || !vanEigenSite(request)) return LEEG();
    const ua = request.headers.get("User-Agent") ?? "";
    if (!ua || GEEN_MENS.test(ua)) return LEEG();
    if (Number(request.headers.get("Content-Length") ?? "0") > MAX_BYTES) return LEEG();
    const tekst = await leesBegrensd(request);
    const melding = tekst === null ? null : leesMelding(tekst, new URL(request.url).host);
    if (!melding) return LEEG();
    const ip = request.headers.get("CF-Connecting-IP") ?? "onbekend";
    if (!(await magMelden(ip, now))) return LEEG();

    const dag = dagVan(now);
    // Per dag wisselend en niet terug te rekenen; zonder geheime sleutel blijft het veld leeg (geen schatting van unieke
    // bezoekers) in plaats van een voorspelbare hash.
    const bezoeker = env.HASH_SECRET ? await hmac(env.HASH_SECRET, `bezoek|${ip}|${ua}|${dag}`) : "";
    await env.DB.prepare(
      "INSERT INTO bezoek (id, dag, begin, duur, bezoeker, pagina, apparaat, herkomst, stappen) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9) " +
        "ON CONFLICT(id) DO UPDATE SET duur = MAX(duur, excluded.duur), stappen = MAX(stappen, excluded.stappen)",
    )
      .bind(melding.id, dag, now, melding.duur, bezoeker, melding.pagina, melding.apparaat, melding.herkomst, melding.stappen)
      .run();
    if (Math.random() < 0.02) ctx.waitUntil(ruimOp(env.DB, now));
  } catch (err) {
    console.error("Bezoekmeting", err);
  }
  return LEEG();
}

/** Verwijdert bezoeken ouder dan de bewaartermijn (400 dagen). */
export async function ruimOp(db: D1Database, now: number): Promise<void> {
  await db.prepare("DELETE FROM bezoek WHERE dag < ?1").bind(dagPlus(dagVan(now), -BEWAAR_DAGEN)).run();
}

// ---------- overzicht voor het beheer ----------

export type Cijfers = {
  bezoeken: number;
  /** Geschat: het aantal verschillende bezoekers per dag, over de dagen opgeteld. null als er geen sleutel was om ze te onderscheiden. */
  bezoekers: number | null;
  gemiddeld: number;
  mediaan: number;
  /** Bezoeken korter dan 10 seconden. */
  kort: number;
  telefoon: number;
  tablet: number;
  desktop: number;
};
export type DagCijfers = Cijfers & { dag: string };
export type Overzicht = { vandaag: string; dagen: DagCijfers[]; totalen: { d7: Cijfers; d30: Cijfers }; herkomst: { herkomst: string; bezoeken: number }[] };

type Rij = { dag: string; bezoeken: number; bezoekers: number; zonder: number; gemiddeld: number | null; kort: number; telefoon: number; tablet: number; desktop: number };
const NUL: Cijfers = { bezoeken: 0, bezoekers: 0, gemiddeld: 0, mediaan: 0, kort: 0, telefoon: 0, tablet: 0, desktop: 0 };
// De middelste waarde (bij een even aantal: het gemiddelde van de twee middelste), per dag of over de hele periode.
const MEDIAAN = (per: string) =>
  `SELECT ${per ? "dag, " : ""}AVG(duur) AS mediaan FROM (SELECT dag, duur, ROW_NUMBER() OVER (${per ? "PARTITION BY dag " : ""}ORDER BY duur) AS rn, COUNT(*) OVER (${per ? "PARTITION BY dag" : ""}) AS n FROM bezoek WHERE dag >= ?1 AND dag <= ?2) WHERE rn IN ((n + 1) / 2, (n + 2) / 2)${per ? " GROUP BY dag" : ""}`;

async function periode(db: D1Database, van: string, tot: string, perDag: Rij[]): Promise<Cijfers> {
  const rijen = perDag.filter((r) => r.dag >= van && r.dag <= tot);
  const bezoeken = rijen.reduce((n, r) => n + r.bezoeken, 0);
  if (!bezoeken) return { ...NUL };
  const som = (k: "kort" | "telefoon" | "tablet" | "desktop" | "bezoekers" | "zonder") => rijen.reduce((n, r) => n + r[k], 0);
  const m = await db.prepare(MEDIAAN("")).bind(van, tot).first<{ mediaan: number | null }>();
  return {
    bezoeken,
    bezoekers: som("zonder") === bezoeken ? null : som("bezoekers"),
    gemiddeld: Math.round(rijen.reduce((n, r) => n + (r.gemiddeld ?? 0) * r.bezoeken, 0) / bezoeken),
    mediaan: Math.round(m?.mediaan ?? 0),
    kort: som("kort"), telefoon: som("telefoon"), tablet: som("tablet"), desktop: som("desktop"),
  };
}

/** De cijfers per dag over de laatste `dagen` dagen (vandaag eerst), de totalen over 7 en 30 dagen en waar bezoekers vandaan komen. */
export async function bezoekOverzicht(db: D1Database, dagen: number, now: number): Promise<Overzicht> {
  const vandaag = dagVan(now);
  const n = Math.max(1, Math.min(BEWAAR_DAGEN, Math.floor(dagen) || 30));
  const van = dagPlus(vandaag, -(Math.max(n, 30) - 1));
  const { results } = await db
    .prepare(
      "SELECT dag, COUNT(*) AS bezoeken, COUNT(DISTINCT NULLIF(bezoeker, '')) AS bezoekers, SUM(bezoeker = '') AS zonder, AVG(duur) AS gemiddeld, SUM(duur < 10) AS kort, " +
        "SUM(apparaat = 'telefoon') AS telefoon, SUM(apparaat = 'tablet') AS tablet, SUM(apparaat = 'desktop') AS desktop FROM bezoek WHERE dag >= ?1 AND dag <= ?2 GROUP BY dag",
    )
    .bind(van, vandaag)
    .all<Rij>();
  const medianen = new Map((await db.prepare(MEDIAAN("dag")).bind(van, vandaag).all<{ dag: string; mediaan: number }>()).results.map((r) => [r.dag, r.mediaan]));
  const perDag = new Map(results.map((r) => [r.dag, r]));
  const lijst: DagCijfers[] = [];
  for (let i = 0; i < n; i++) {
    const dag = dagPlus(vandaag, -i), r = perDag.get(dag);
    lijst.push(
      r
        ? { dag, bezoeken: r.bezoeken, bezoekers: r.zonder === r.bezoeken ? null : r.bezoekers, gemiddeld: Math.round(r.gemiddeld ?? 0), mediaan: Math.round(medianen.get(dag) ?? 0), kort: r.kort, telefoon: r.telefoon, tablet: r.tablet, desktop: r.desktop }
        : { dag, ...NUL },
    );
  }
  const herkomst = await db
    .prepare("SELECT herkomst, COUNT(*) AS bezoeken FROM bezoek WHERE dag >= ?1 AND dag <= ?2 GROUP BY herkomst ORDER BY bezoeken DESC, herkomst LIMIT 10")
    .bind(dagPlus(vandaag, -(n - 1)), vandaag)
    .all<{ herkomst: string; bezoeken: number }>();
  return {
    vandaag,
    dagen: lijst,
    totalen: { d7: await periode(db, dagPlus(vandaag, -6), vandaag, results), d30: await periode(db, dagPlus(vandaag, -29), vandaag, results) },
    herkomst: herkomst.results,
  };
}
