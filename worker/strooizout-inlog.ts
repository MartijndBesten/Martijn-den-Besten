// Strooizout voor de buurt: inloggen op het beheer met een code per e-mail, zonder wachtwoord.
// Wie mag inloggen staat in het Worker-geheim STROOIZOUT_BEHEER_EMAILS (adressen gescheiden door komma's); het adres
// staat dus niet in de code of in de database. Verloop: adres invullen → code van zes cijfers per mail (tien minuten
// geldig, hooguit vijf pogingen) → sessietoken dat dertig dagen geldt. Van code en token wordt alleen een hash bewaard.

import { rateLimit } from "./begrenzing";
import { fout, gelijk, hmacHex, json, leesJson, type SzEnv } from "./strooizout-basis";
import { heeftMail, mailHtml, stuurMail } from "./strooizout-mail";

const CODE_GELDIG = 600;
const SESSIE_GELDIG = 30 * 86400;
const MAX_POGINGEN = 5;

const sleutel = (env: SzEnv) => env.HASH_SECRET || "strooizout-beheer";
const schoon = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase().slice(0, 200) : "");

export function beheerAdressen(env: SzEnv): string[] {
  return (env.STROOIZOUT_BEHEER_EMAILS ?? "")
    .split(/[,;\s]+/)
    .map((a) => a.trim().toLowerCase())
    .filter((a) => a.includes("@"));
}
/** Kan er met een e-mailcode worden ingelogd? Alleen als er een mailvoorziening is en er een beheeradres is ingesteld. */
export const kanMetMail = (env: SzEnv): boolean => heeftMail(env) && beheerAdressen(env).length > 0 && !!env.HASH_SECRET;

const wieVan = (env: SzEnv, email: string) => hmacHex(sleutel(env), `strooizout-beheerder|${email}`);
const codeHash = (env: SzEnv, wie: string, code: string) => hmacHex(sleutel(env), `strooizout-inlogcode|${wie}|${code}`);
const tokenHash = (env: SzEnv, token: string) => hmacHex(sleutel(env), `strooizout-beheersessie|${token}`);

function nieuweCode(): string {
  // zes cijfers, gelijk verdeeld (waarden boven de grens overslaan)
  const b = new Uint32Array(1);
  do crypto.getRandomValues(b);
  while (b[0] >= 4_294_000_000);
  return String(b[0] % 1_000_000).padStart(6, "0");
}
function nieuwToken(): string {
  const b = crypto.getRandomValues(new Uint8Array(32));
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return `s_${btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}
const bezoeker = async (request: Request, env: SzEnv) => (await hmacHex(sleutel(env), `strooizout-inlog|${request.headers.get("CF-Connecting-IP") ?? "onbekend"}`)).slice(0, 32);

/** POST /inlog/code { email }: stuurt een code als het adres toegang heeft. Het antwoord verraadt niet of dat zo is. */
export async function vraagInlogcode(request: Request, env: SzEnv, nuSec: number): Promise<Response> {
  if (!kanMetMail(env)) return fout("Inloggen met een e-mailcode is nog niet ingesteld.", 503);
  const body = await leesJson(request, 2000);
  if (body instanceof Response) return body;
  const email = schoon(body.email);
  if (!email.includes("@")) return fout("Vul je e-mailadres in.", 422, { veld: "email" });
  if (!(await rateLimit(env.DB, "sz-code-ip", await bezoeker(request, env), 10, 3600, nuSec))) return fout("Te veel aanvragen. Probeer het over een uur opnieuw.", 429, {}, { "Retry-After": "3600" });
  const klaar = json({ ok: true, melding: "Als dit adres toegang heeft, is er een code naar gestuurd. De code is tien minuten geldig." });
  if (!beheerAdressen(env).includes(email)) return klaar;
  const wie = await wieVan(env, email);
  if (!(await rateLimit(env.DB, "sz-code-wie", wie.slice(0, 32), 5, 3600, nuSec))) return klaar;
  const code = nieuweCode();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sz_inlogcode WHERE wie = ?1 OR verloopt < ?2").bind(wie, nuSec - 86400),
    env.DB.prepare("INSERT INTO sz_inlogcode (wie, code_hash, verloopt) VALUES (?1, ?2, ?3)").bind(wie, await codeHash(env, wie, code), nuSec + CODE_GELDIG),
  ]);
  const leesbaar = `${code.slice(0, 3)} ${code.slice(3)}`;
  await stuurMail(env, {
    aan: email,
    onderwerp: `Inlogcode voor het beheer: ${leesbaar}`,
    tekst: `Je inlogcode voor het beheer van Strooizout voor de buurt is:\n\n${leesbaar}\n\nDe code is tien minuten geldig. Heb je niet zelf geprobeerd in te loggen, dan hoef je niets te doen.`,
    html: mailHtml({ kop: "Je inlogcode", alineas: ["Met deze code log je in op het beheer van Strooizout voor de buurt.", "De code is tien minuten geldig. Heb je niet zelf geprobeerd in te loggen, dan hoef je niets te doen."], uitgelicht: leesbaar }),
  });
  return klaar;
}

/** POST /inlog { email, code }: wisselt een geldige code in voor een sessietoken. */
export async function logIn(request: Request, env: SzEnv, nuSec: number): Promise<Response> {
  if (!kanMetMail(env)) return fout("Inloggen met een e-mailcode is nog niet ingesteld.", 503);
  const body = await leesJson(request, 2000);
  if (body instanceof Response) return body;
  const email = schoon(body.email);
  const code = typeof body.code === "string" ? body.code.replace(/\D/g, "") : "";
  if (!(await rateLimit(env.DB, "sz-inlog-ip", await bezoeker(request, env), 20, 3600, nuSec))) return fout("Te veel pogingen. Probeer het over een uur opnieuw.", 429, {}, { "Retry-After": "3600" });
  const mis = () => fout("De code klopt niet of is verlopen. Vraag zo nodig een nieuwe aan.", 401);
  if (!email.includes("@") || code.length !== 6 || !beheerAdressen(env).includes(email)) return mis();
  const wie = await wieVan(env, email);
  const rij = await env.DB.prepare("SELECT id, code_hash, pogingen FROM sz_inlogcode WHERE wie = ?1 AND gebruikt = 0 AND verloopt > ?2 ORDER BY id DESC LIMIT 1").bind(wie, nuSec).first<{ id: number; code_hash: string; pogingen: number }>();
  if (!rij || rij.pogingen >= MAX_POGINGEN) return mis();
  if (!gelijk(rij.code_hash, await codeHash(env, wie, code))) {
    await env.DB.prepare("UPDATE sz_inlogcode SET pogingen = pogingen + 1 WHERE id = ?1").bind(rij.id).run();
    return mis();
  }
  // De code kan maar één keer worden ingewisseld, ook bij twee verzoeken tegelijk.
  const gebruikt = await env.DB.prepare("UPDATE sz_inlogcode SET gebruikt = 1 WHERE id = ?1 AND gebruikt = 0").bind(rij.id).run();
  if (!gebruikt.meta.changes) return mis();
  const token = nieuwToken();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sz_beheersessie WHERE verloopt < ?1").bind(nuSec),
    env.DB.prepare("INSERT INTO sz_beheersessie (token_hash, wie, aangemaakt, verloopt) VALUES (?1, ?2, ?3, ?4)").bind(await tokenHash(env, token), wie, nuSec, nuSec + SESSIE_GELDIG),
  ]);
  return json({ ok: true, token, geldig_tot: nuSec + SESSIE_GELDIG });
}

/** Is dit een geldig sessietoken (van een nog bestaand beheeradres)? */
export async function sessieGeldig(env: SzEnv, token: string, nuSec: number): Promise<boolean> {
  if (!/^s_[A-Za-z0-9_-]{40,50}$/.test(token)) return false;
  const rij = await env.DB.prepare("SELECT wie FROM sz_beheersessie WHERE token_hash = ?1 AND verloopt > ?2").bind(await tokenHash(env, token), nuSec).first<{ wie: string }>();
  if (!rij) return false;
  // Wordt een adres uit het geheim gehaald, dan vervallen ook de sessies van dat adres.
  for (const adres of beheerAdressen(env)) if (gelijk(await wieVan(env, adres), rij.wie)) return true;
  return false;
}

/** POST /uitloggen: maakt het sessietoken ongeldig. */
export async function logUit(request: Request, env: SzEnv): Promise<Response> {
  const token = (request.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
  if (token.startsWith("s_")) await env.DB.prepare("DELETE FROM sz_beheersessie WHERE token_hash = ?1").bind(await tokenHash(env, token)).run();
  return json({ ok: true });
}
