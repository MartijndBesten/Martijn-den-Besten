// Aanvragen van bezoekers van de Bijbelreis (bijbelreis.nl): ‘Mis je iets? Vraag het aan.’
// Een bezoeker kan vragen om een Bijbelgedeelte, verhaal of reis die er nog niet is, om iets voor school, club of kerk,
// of een fout melden. Wat er wel en niet bewaard wordt: docs/bijbelreis-aanvraag/README.md.
// Deze module wordt door beide Workers gebruikt: worker/bijbelreis-app.ts (bijbelreis.nl) en worker/index.ts (de lokale
// testopstelling serveert de atlas via de hoofd-Worker; het beheer van de aanvragen staat ook daar).

import { hmac, vanEigenSite } from "./bezoek";
import { rateLimit, ruimBegrenzingOp } from "./begrenzing";

export interface AanvraagEnv {
  DB?: D1Database;
  HASH_SECRET?: string;
  /** De e-mailbinding van de Worker `bijbelreis` (wrangler.bijbelreis.jsonc, `send_email`). Ontbreekt hij, dan gaat er geen melding uit. */
  MAIL?: SendEmail;
}
/** De klasse EmailMessage uit `cloudflare:email`. Alleen worker/bijbelreis.ts geeft hem mee: die module bestaat alleen in de Worker-omgeving. */
export type EmailMessageKlasse = new (from: string, to: string, raw: ReadableStream | string) => EmailMessage;
export type Diensten = { EmailMessage?: EmailMessageKlasse };

const MAX_BYTES = 4096;
const MIN_TEKST = 10;
const MAX_TEKST = 600;
const MAX_EMAIL = 120;
const PER_UUR = 3;
const PER_DAG = 8;
const TOTAAL_PER_DAG = 200; // hoeveel aanvragen de tabel per etmaal aanneemt, wie ze ook stuurt
const BEWAAR_DAGEN = 400;
const UUR = 3600;
const DAG = 86400;
export const SOORTEN = ["gemist", "groep", "fout", "anders"] as const;
export type Soort = (typeof SOORTEN)[number];
const VELDEN = ["soort", "tekst", "email", "context", "website"];
// Eenvoudig en streng: één @, geen spaties, een punt in het domein. Geen poging om elk geldig adres te herkennen.
const EMAIL = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
// Het adres binnen de atlas op het moment van aanvragen: #jakob/7, #v26, #boek=exodus, #kerst-geboorte/2.
const CONTEXT = /^#[A-Za-z0-9][A-Za-z0-9/=&_-]{0,78}$/;

const KOPPEN: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};
const json = (data: unknown, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(data), { status, headers: { ...KOPPEN, ...extra } });
const fout = (melding: string, status: number, veld = "", extra: Record<string, string> = {}) => json({ ok: false, error: melding, ...(veld ? { veld } : {}) }, status, extra);

const encoder = new TextEncoder();
const lengte = (s: string) => [...s].length;

export type Aanvraag = { soort: Soort; tekst: string; email: string; context: string };
export type Gelezen = { ok: true; waarde: Aanvraag; lok: boolean } | { ok: false; melding: string; veld: string };

/** Controleert een ingezonden aanvraag. De tekst blijft platte tekst: regeleinden mogen, andere stuurtekens niet. */
export function leesAanvraag(invoer: unknown): Gelezen {
  if (!invoer || typeof invoer !== "object" || Array.isArray(invoer)) return { ok: false, melding: "Het formulier was onleesbaar.", veld: "" };
  const o = invoer as Record<string, unknown>;
  if (Object.keys(o).some((k) => !VELDEN.includes(k))) return { ok: false, melding: "Het formulier was onleesbaar.", veld: "" };
  const lok = typeof o.website === "string" ? o.website.trim() !== "" : o.website !== undefined;
  if (typeof o.soort !== "string" || !(SOORTEN as readonly string[]).includes(o.soort)) return { ok: false, melding: "Kies waar je aanvraag over gaat.", veld: "soort" };
  if (typeof o.tekst !== "string") return { ok: false, melding: "Schrijf wat je wilt vragen.", veld: "tekst" };
  // Regeleinden gelijk trekken, stuurtekens weg, lege regels en spaties aan de randen weg.
  const tekst = o.tekst
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F\u200B-\u200F\u2028-\u202E\u2066-\u2069\uFEFF]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (lengte(tekst) < MIN_TEKST) return { ok: false, melding: `Schrijf iets meer: minstens ${MIN_TEKST} tekens.`, veld: "tekst" };
  if (lengte(tekst) > MAX_TEKST) return { ok: false, melding: `Je tekst is te lang: hooguit ${MAX_TEKST} tekens.`, veld: "tekst" };
  if (o.email !== undefined && typeof o.email !== "string") return { ok: false, melding: "Dit e-mailadres klopt niet.", veld: "email" };
  const email = (o.email ?? "").trim();
  if (email !== "" && (email.length > MAX_EMAIL || !EMAIL.test(email))) return { ok: false, melding: "Dit e-mailadres klopt niet. Kijk het na, of laat het veld leeg.", veld: "email" };
  // De context is bijzaak: klopt hij niet, dan vervalt hij; de aanvraag zelf gaat door.
  const context = typeof o.context === "string" && CONTEXT.test(o.context) ? o.context : "";
  return { ok: true, waarde: { soort: o.soort as Soort, tekst, email, context }, lok };
}

/** Leest de inhoud tot de grens; een grotere inhoud wordt afgebroken zonder hem helemaal in te lezen. */
async function leesBegrensd(request: Request): Promise<string | null> {
  if (Number(request.headers.get("Content-Length") ?? "0") > MAX_BYTES) return null;
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

// Zonder geheime sleutel is er geen vaste hash om bezoekers te begrenzen: dan geldt een willekeurig zout van deze
// Worker-instantie. De begrenzing is dan minder sluitend, maar er komt geen voorspelbare hash van een IP-adres in D1.
let zout = "";
async function bezoeker(request: Request, env: AanvraagEnv, now: number): Promise<string> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "onbekend";
  if (!env.HASH_SECRET && !zout) zout = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hmac(env.HASH_SECRET || zout, `aanvraag|${ip}|${new Date(now * 1000).toISOString().slice(0, 10)}`);
}

// ---------- melding per e-mail aan de maker ----------
// Elke opgeslagen aanvraag gaat ook als e-mail naar info@denckh.nl (besluit van Martijn, 16-11-2026), zodat hij niet in
// het beheer hoeft te kijken. De melding is bijzaak: ontbreekt de binding of mislukt het verzenden, dan blijft de
// aanvraag gewoon staan en merkt de bezoeker er niets van. Wat ervoor nodig is: docs/bijbelreis-aanvraag/README.md §6.

export const MAIL_VAN = "aanvraag@bijbelreis.nl";
export const MAIL_NAAM = "Bijbelreis";
export const MAIL_AAN = "info@denckh.nl";
const SITE = "https://bijbelreis.nl";
const BEHEER = "https://martijndenbesten.com/beheer";
// Vaste woorden voor het onderwerp en de tekst: er komt nooit invoer van de bezoeker in een kopregel.
const SOORT_KORT: Record<Soort, string> = { gemist: "gemist gedeelte", groep: "school, club of kerk", fout: "fout of verbetering", anders: "iets anders" };
const SOORT_LANG: Record<Soort, string> = { gemist: "Een Bijbelgedeelte of verhaal dat ik mis", groep: "Voor school, club of kerk", fout: "Een fout of verbetering", anders: "Iets anders" };
const NL_TIJD = new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export type Bericht = { onderwerp: string; tekst: string; replyTo: string };

/** Onderwerp, platte tekst en antwoordadres van de melding. Het antwoordadres is leeg als de bezoeker er geen opgaf. */
export function maakBericht(id: number, a: Aanvraag, now: number): Bericht {
  const nummer = Number.isInteger(id) && id > 0 ? id : 0;
  // Het adres is al streng gecontroleerd (leesAanvraag); hier nog eens, omdat het in een kopregel komt.
  const replyTo = a.email.length <= MAX_EMAIL && EMAIL.test(a.email) ? a.email : "";
  const regels = [
    `Nieuwe aanvraag bij de Bijbelreis (#${nummer})`,
    "",
    `Soort: ${SOORT_LANG[a.soort]}`,
    `Wanneer: ${NL_TIJD.format(new Date(now * 1000))} (Nederlandse tijd)`,
    `Waar: ${CONTEXT.test(a.context) ? `${SITE}/${a.context}` : "niet bekend"}`,
    replyTo ? `Antwoorden naar: ${replyTo}` : "Geen e-mailadres opgegeven",
    "",
    "Wat er gevraagd wordt:",
    a.tekst,
    "",
    "-- ",
    `Afhandelen: ${BEHEER} (Aanvragen bijbelreis.nl)`,
  ];
  return { onderwerp: `Bijbelreis: ${SOORT_KORT[a.soort]} (#${nummer})`, tekst: regels.join("\n"), replyTo };
}

const base64 = (bytes: Uint8Array) => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
// Een kopregel mag geen regeleinde of stuurteken bevatten; wat geen gewone ASCII is, gaat als ‘encoded-word’ (RFC 2047).
const schoon = (s: string) => s.replace(/[\u0000-\u001F\u007F]+/g, " ").trim();
const kopwoord = (s: string) => (/^[\x20-\x7E]*$/.test(s) ? s : `=?UTF-8?B?${base64(encoder.encode(s))}?=`);

/**
 * De melding als ruw bericht (RFC 5322), voor de klasse EmailMessage. Zo klein als kan: platte tekst in UTF-8, als
 * base64 in regels van 76 tekens, zodat geen enkele regel te lang is en er niets met regeleinden mis kan gaan.
 */
export function bouwMime(b: Bericht, opties: { datum: Date; berichtId: string }): string {
  const lijf = (base64(encoder.encode(b.tekst.replace(/\r\n?/g, "\n").replace(/\n/g, "\r\n"))).match(/.{1,76}/g) ?? []).join("\r\n");
  const koppen = [
    `From: ${kopwoord(MAIL_NAAM)} <${MAIL_VAN}>`,
    `To: <${MAIL_AAN}>`,
    ...(b.replyTo && EMAIL.test(b.replyTo) ? [`Reply-To: <${b.replyTo}>`] : []),
    `Subject: ${kopwoord(schoon(b.onderwerp))}`,
    `Date: ${opties.datum.toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${schoon(opties.berichtId).replace(/[^A-Za-z0-9.-]/g, "")}@bijbelreis.nl>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "Auto-Submitted: auto-generated",
  ];
  return koppen.join("\r\n") + "\r\n\r\n" + lijf + "\r\n";
}

/**
 * Stuurt de melding. Eerst op de manier die de documentatie van Cloudflare nu aanraadt (velden, zonder ruw bericht);
 * lukt dat niet en is de klasse EmailMessage er, dan als ruw bericht (de oudere manier, die bij een domein met alleen
 * Email Routing al langer werkt). Geeft terug hoe het is verstuurd, of "" als er niets is verstuurd. Gooit nooit.
 */
export async function naAanvraag(env: AanvraagEnv, id: number, aanvraag: Aanvraag, now: number, diensten: Diensten = {}): Promise<"velden" | "ruw" | ""> {
  if (!env.MAIL) return "";
  const b = maakBericht(id, aanvraag, now);
  try {
    await env.MAIL.send({ from: { email: MAIL_VAN, name: MAIL_NAAM }, to: MAIL_AAN, subject: b.onderwerp, text: b.tekst, ...(b.replyTo ? { replyTo: b.replyTo } : {}) });
    return "velden";
  } catch (err) {
    console.error("Melding van aanvraag (velden) mislukt", (err as { code?: string })?.code ?? "", err);
  }
  if (!diensten.EmailMessage) return "";
  try {
    const berichtId = `aanvraag-${id}.${[...crypto.getRandomValues(new Uint8Array(8))].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
    await env.MAIL.send(new diensten.EmailMessage(MAIL_VAN, MAIL_AAN, bouwMime(b, { datum: new Date(now * 1000), berichtId })));
    return "ruw";
  } catch (err) {
    console.error("Melding van aanvraag (ruw bericht) mislukt", (err as { code?: string })?.code ?? "", err);
    return "";
  }
}

/** Verwijdert aanvragen ouder dan de bewaartermijn (400 dagen) en verlopen tellers van de begrenzing. */
export async function ruimOp(db: D1Database, now: number): Promise<void> {
  await db.prepare("DELETE FROM aanvraag WHERE COALESCE(afgehandeld_op, tijd) < ?1").bind(now - BEWAAR_DAGEN * DAG).run();
  await ruimBegrenzingOp(db, now);
}

/**
 * POST /api/aanvraag. Anders dan de bezoekmeting geeft dit een duidelijk antwoord: de bezoeker moet weten of de aanvraag
 * is aangekomen, en zo niet, wat er mis is. 200 { ok: true } of een fout met een Nederlandse melding (en het veld).
 */
export async function meldAanvraag(request: Request, env: AanvraagEnv, ctx: Pick<ExecutionContext, "waitUntil">, now: number, diensten: Diensten = {}): Promise<Response> {
  if (request.method !== "POST") return fout("Methode niet toegestaan.", 405, "", { Allow: "POST" });
  try {
    if (!env.DB) return fout("Aanvragen kan hier niet. Mail naar info@denckh.nl.", 503);
    if (!vanEigenSite(request)) return fout("Aanvragen kan alleen via het formulier op de website.", 403);
    if (!(request.headers.get("Content-Type") ?? "").toLowerCase().startsWith("application/json")) return fout("Het formulier was onleesbaar.", 415);
    const tekst = await leesBegrensd(request);
    if (tekst === null || encoder.encode(tekst).length > MAX_BYTES) return fout("Je aanvraag is te groot.", 413);
    let invoer: unknown;
    try { invoer = JSON.parse(tekst); } catch { return fout("Het formulier was onleesbaar.", 400); }
    const gelezen = leesAanvraag(invoer);
    if (!gelezen.ok) return fout(gelezen.melding, 422, gelezen.veld);
    // Het lokveld is voor mensen onzichtbaar; wie het invult is een robot. Die krijgt hetzelfde antwoord als ieder
    // ander, maar er wordt niets bewaard en niets geteld.
    if (gelezen.lok) return json({ ok: true });

    const wie = await bezoeker(request, env, now);
    const perUur = await rateLimit(env.DB, "aanvraag-u", wie, PER_UUR, UUR, now);
    const perDag = perUur && (await rateLimit(env.DB, "aanvraag-d", wie, PER_DAG, DAG, now));
    if (!perUur || !perDag) return fout("Je hebt al een paar aanvragen gestuurd. Probeer het later nog eens, of mail naar info@denckh.nl.", 429, "", { "Retry-After": "3600" });
    const vandaag = await env.DB.prepare("SELECT COUNT(*) AS n FROM aanvraag WHERE tijd > ?1").bind(now - DAG).first<{ n: number }>();
    if ((vandaag?.n ?? 0) >= TOTAAL_PER_DAG) return fout("Er zijn vandaag al heel veel aanvragen binnengekomen. Probeer het morgen nog eens, of mail naar info@denckh.nl.", 503, "", { "Retry-After": "3600" });

    const a = gelezen.waarde;
    const rij = await env.DB.prepare("INSERT INTO aanvraag (tijd, soort, tekst, email, context, status) VALUES (?1, ?2, ?3, ?4, ?5, 'nieuw') RETURNING id")
      .bind(now, a.soort, a.tekst, a.email, a.context)
      .first<{ id: number }>();
    // De melding wacht niet op de bezoeker en kan de aanvraag niet meer raken: die staat al in de database.
    ctx.waitUntil(naAanvraag(env, rij?.id ?? 0, a, now, diensten).catch((err) => console.error("Melding van aanvraag", err)));
    if (Math.random() < 0.1) ctx.waitUntil(ruimOp(env.DB, now).catch((err) => console.error("Opruimen aanvragen", err)));
    return json({ ok: true });
  } catch (err) {
    console.error("Aanvraag", err);
    return fout("Het versturen lukte niet. Probeer het later nog eens, of mail naar info@denckh.nl.", 500);
  }
}

// ---------- beheer ----------

export type AanvraagRij = { id: number; tijd: number; soort: Soort; tekst: string; email: string; context: string; status: "nieuw" | "afgehandeld"; afgehandeld_op: number | null };

/** De aanvragen met een status (nieuwste eerst, hooguit 200) en het aantal nieuwe. */
export async function aanvragenLijst(db: D1Database, status: string): Promise<{ aanvragen: AanvraagRij[]; nieuw: number } | null> {
  if (status !== "nieuw" && status !== "afgehandeld") return null;
  const { results } = await db
    .prepare("SELECT id, tijd, soort, tekst, email, context, status, afgehandeld_op FROM aanvraag WHERE status = ?1 ORDER BY tijd DESC, id DESC LIMIT 200")
    .bind(status)
    .all<AanvraagRij>();
  const n = await db.prepare("SELECT COUNT(*) AS n FROM aanvraag WHERE status = 'nieuw'").first<{ n: number }>();
  return { aanvragen: results, nieuw: n?.n ?? 0 };
}

/**
 * Een aanvraag afhandelen of verwijderen. Bij afhandelen wordt het e-mailadres gewist: het was er alleen om te
 * antwoorden. Geeft "onbekend" bij een actie die niet bestaat en "weg" als de aanvraag er niet (meer) is.
 */
export async function aanvraagBeheer(db: D1Database, id: number, actie: unknown, now: number): Promise<"ok" | "onbekend" | "weg"> {
  if (actie === "verwijder") {
    const r = await db.prepare("DELETE FROM aanvraag WHERE id = ?1").bind(id).run();
    return (r.meta.changes ?? 0) > 0 ? "ok" : "weg";
  }
  if (actie !== "afgehandeld") return "onbekend";
  const r = await db.prepare("UPDATE aanvraag SET status = 'afgehandeld', afgehandeld_op = ?1, email = '' WHERE id = ?2 AND status = 'nieuw'").bind(now, id).run();
  return (r.meta.changes ?? 0) > 0 ? "ok" : "weg";
}
