// Strooizout voor de buurt: e-mail versturen via de e-mailbinding van de Worker (`send_email`, naam SZ_MAIL).
// Zonder binding gaat er niets uit en werkt de rest gewoon door: mail is hier een extra, nooit een voorwaarde.
// Er komt geen e-mailadres of inhoud in de logs.

import { euro } from "../shared/strooizout";
import { STROOIZOUT_DOMEIN } from "./strooizout-domein";

export const MAIL_VAN = "bestelling@strooizouthouten.nl";
export const MAIL_NAAM = "Strooizout voor de buurt";

export type MailBinding = { send(bericht: unknown): Promise<unknown> };
export interface MailEnv {
  /** De e-mailbinding van de Worker. Ontbreekt hij (tests, lokaal, nog niet ingesteld), dan gaat er geen mail uit. */
  SZ_MAIL?: MailBinding;
  /** Schakelaar: alleen met de waarde "aan" wordt er mail verstuurd (en is het e-mailadres bij bestellen verplicht). */
  STROOIZOUT_MAIL?: string;
}
export type Mail = { aan: string; onderwerp: string; tekst: string; html: string; antwoordAan?: string };

export const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
export const heeftMail = (env: MailEnv): boolean => !!env.SZ_MAIL && env.STROOIZOUT_MAIL === "aan";

const veilig = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Eenvoudige opgemaakte versie: een kop, alinea's, eventueel één uitgelichte regel (de code) en een knop. */
export function mailHtml(o: { kop: string; alineas: string[]; uitgelicht?: string; knop?: { tekst: string; url: string }; voet?: string }): string {
  const alinea = (t: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.5;color:#22364d">${veilig(t).replace(/\n/g, "<br>")}</p>`;
  return [
    `<div style="background:#f6fafd;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">`,
    `<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px 24px;border:1px solid #d7e8f5">`,
    `<p style="margin:0 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#1f5a94;font-weight:bold">Strooizout voor de buurt</p>`,
    `<h1 style="margin:0 0 18px;font-size:24px;line-height:1.2;color:#0b2340">${veilig(o.kop)}</h1>`,
    ...o.alineas.slice(0, 1).map(alinea),
    o.uitgelicht ? `<p style="margin:6px 0 20px;padding:16px;border-radius:12px;background:#0b2340;color:#ffffff;font-size:30px;font-weight:bold;letter-spacing:.12em;text-align:center">${veilig(o.uitgelicht)}</p>` : "",
    ...o.alineas.slice(1).map(alinea),
    o.knop ? `<p style="margin:20px 0 6px"><a href="${veilig(o.knop.url)}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#ffb547;color:#0b2340;font-weight:bold;font-size:16px;text-decoration:none">${veilig(o.knop.tekst)}</a></p>` : "",
    `<p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:#5b7088">${veilig(o.voet ?? "Strooizout voor de buurt is een initiatief van Denckh in Houten.")}</p>`,
    `</div></div>`,
  ].join("");
}

/** Verstuurt een bericht. Geeft terug of het gelukt is; gooit nooit. */
export async function stuurMail(env: MailEnv, mail: Mail): Promise<boolean> {
  if (!env.SZ_MAIL || !heeftMail(env) || !EMAIL.test(mail.aan)) return false;
  try {
    await env.SZ_MAIL.send({
      from: { email: MAIL_VAN, name: MAIL_NAAM },
      to: mail.aan,
      subject: mail.onderwerp.replace(/[\u0000-\u001f\u007f]+/g, " ").trim(),
      text: mail.tekst,
      html: mail.html,
      ...(mail.antwoordAan && EMAIL.test(mail.antwoordAan) ? { replyTo: mail.antwoordAan } : {}),
    });
    return true;
  } catch (err) {
    console.error("Strooizout: e-mail versturen mislukt", (err as { code?: string })?.code ?? "", (err as Error)?.name ?? "");
    return false;
  }
}

// ---------- Bevestiging van een bestelling ----------

type BevestigdeBestelling = {
  nummer: string;
  afhaalcode: string;
  code: string;
  voornaam: string;
  levering: "ophalen" | "bezorgen";
  adres: string;
  betaalwijze: string;
  regels: unknown[];
  meldingen?: string[];
  korting_cent: number;
  bezorg_cent: number;
  totaal_cent: number;
};

/** De e-mail die een klant na het bestellen krijgt: de afhaalcode, wat er besteld is en hoe het verder gaat. */
export function bevestigingsmail(b: BevestigdeBestelling, site: URL, aan: string, antwoordAan = ""): Mail {
  const link = `${site.origin}${site.hostname === STROOIZOUT_DOMEIN ? "" : "/strooizout"}/bestelling#${b.code}`;
  const regels = (b.regels as { naam: string; aantal: number; stukprijs_cent: number }[]).map((r) => `${r.aantal} × ${r.naam} (${euro(r.stukprijs_cent)} per stuk)`);
  const bedragen = [...(b.bezorg_cent > 0 ? [`Bezorgen: ${euro(b.bezorg_cent)}`] : []), `Totaal: ${euro(b.totaal_cent)}`];
  const besteld = [...regels, ...bedragen].join("\n");
  const tikkie = b.betaalwijze === "tikkie";
  const verder = b.levering === "bezorgen"
    ? `${tikkie ? "We sturen je een Tikkie op je mobiel. Daarna bezorgen we" : "We bezorgen"} je bestelling${b.adres ? ` op ${b.adres}` : ""}; je hoort van ons wanneer.${tikkie ? "" : " Je betaalt bij het bezorgen met een betaalverzoek."}`
    : `${tikkie ? "We sturen je een Tikkie op je mobiel. Daarna kun je" : "Je kunt"} je bestelling komen ophalen. Het adres en de afhaalmomenten staan op je bestelpagina. Neem je afhaalcode mee.${tikkie ? "" : " Je betaalt bij het afhalen met een betaalverzoek."}`;
  const neemMee = (b.meldingen ?? []).join(" ");
  const sluit = "Heb je je bestelling toch niet nodig? Annuleren kan kosteloos via je bestelpagina.";
  const aanhef = `Hoi ${b.voornaam}, bedankt voor je bestelling. Dit is je afhaalcode:`;
  return {
    aan,
    antwoordAan,
    onderwerp: `Je bestelling ${b.afhaalcode} bij Strooizout voor de buurt`,
    tekst: [aanhef, "", b.afhaalcode, "", "Je bestelling:", besteld, "", ...(neemMee ? [neemMee, ""] : []), verder, "", `Je bestelpagina: ${link}`, "", sluit, "", "Strooizout voor de buurt, een initiatief van Denckh in Houten"].join("\n"),
    html: mailHtml({ kop: `Je bestelling ${b.nummer}`, alineas: [aanhef, besteld, ...(neemMee ? [neemMee] : []), verder, sluit], uitgelicht: b.afhaalcode, knop: { tekst: "Bekijk je bestelling", url: link } }),
  };
}
