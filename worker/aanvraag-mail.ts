// De HTML-versie van de aanvraagmail aan de maker (info@denckh.nl). Het sjabloon is van Martijn (16-11-2026) en staat
// hier letterlijk, met zijn plaatshouders. De platte tekst blijft daarnaast bestaan als terugval (multipart/alternative).
//
// Afspraken:
// - Elke waarde wordt ge-escaped voordat ze in het sjabloon komt; er komt nooit ruwe invoer van een bezoeker in de HTML.
// - De regel ‘Waar’ vervalt als er geen plaats in de atlas bekend is.
// - De knop ‘Antwoorden’ en de regel ‘Antwoord naar’ vervallen allebei als de bezoeker geen e-mailadres opgaf.
// - Geen afbeeldingen, geen scripts, geen lettertypen of adressen van buiten: de mail laadt niets.
//
// De drie onderdelen die kunnen vervallen, staan als eigen stuk onder het sjabloon; samen met het sjabloon vormen ze
// precies de HTML die Martijn aanleverde (een unittest vergelijkt dat teken voor teken, op witruimte na).

export const KNOP_ANTWOORD =
  `<a href="mailto:{{ANTWOORD_HREF}}" class="ink" style="display:inline-block;color:#1c3d5a;text-decoration:none;font-size:15px;font-weight:600;padding:12px 14px;">Antwoorden</a>`;
export const REGEL_WAAR = `<br> <strong class="ink" style="color:#4a443c;font-weight:600;">Waar</strong>&nbsp; {{WAAR}}`;
export const REGEL_ANTWOORD =
  `<br> <strong class="ink" style="color:#4a443c;font-weight:600;">Antwoord naar</strong>&nbsp; <a href="mailto:{{ANTWOORD_HREF}}" class="lnk" style="color:#1c3d5a;">{{ANTWOORD}}</a>`;

export const SJABLOON = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Nieuwe aanvraag bij de Bijbelreis</title>
<style>
:root { color-scheme: light dark; }
body { margin:0; padding:0; background:#f3ece0; }
a { color:#1c3d5a; }
@media (prefers-color-scheme: dark) {
body { background:#14191f !important; }
.card { background:#1b2129 !important; border-color:#2b333d !important; }
.ink { color:#e8eaed !important; }
.muted { color:#a3acb8 !important; }
.rule { border-color:#2b333d !important; }
.quote { background:#222a33 !important; color:#e8eaed !important; }
.bg { background:#14191f !important; }
.lnk { color:#8fbce8 !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background:#f3ece0;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{VRAAG_KORT}}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:#f3ece0;">
<tr>
<td align="center" class="bg" style="padding:24px 12px;background:#f3ece0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="card" style="max-width:560px;background:#ffffff;border:1px solid #e3d9c6;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<tr>
<td style="background:#1c3d5a;padding:16px 22px;">
<span style="color:#ffffff;font-size:15px;font-weight:600;letter-spacing:.2px;">Bijbelreis</span>
<span style="color:#a9c4da;font-size:13px;"> &middot; nieuwe aanvraag</span>
<span style="float:right;color:#a9c4da;font-size:13px;">#{{NUMMER}}</span>
</td>
</tr>
<tr>
<td style="padding:24px 22px 8px 22px;">
<p class="muted" style="margin:0 0 6px 0;color:#7a7266;font-size:12px;letter-spacing:.6px;text-transform:uppercase;">{{SOORT}}</p>
<div class="quote" style="background:#f7f2e8;border-left:3px solid #c9a227;border-radius:6px;padding:14px 16px;color:#1f2a37;font-size:17px;line-height:1.5;">
{{VRAAG}}
</div>
</td>
</tr>
<tr>
<td style="padding:18px 22px 4px 22px;">
<a href="https://martijndenbesten.com/beheer" style="display:inline-block;background:#1c3d5a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:9px;">Afhandelen in beheer</a>
{{KNOP_ANTWOORD}}
</td>
</tr>
<tr>
<td style="padding:14px 22px 22px 22px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="rule" style="border-top:1px solid #ece5d7;">
<tr><td style="height:12px;"></td></tr>
<tr>
<td class="muted" style="color:#7a7266;font-size:13px;line-height:1.7;">
<strong class="ink" style="color:#4a443c;font-weight:600;">Wanneer</strong>&nbsp; {{WANNEER}}{{REGEL_WAAR}}{{REGEL_ANTWOORD}}
</td>
</tr>
</table>
</td>
</tr>
</table>
<p class="muted" style="max-width:560px;margin:14px auto 0 auto;color:#8c8578;font-size:12px;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
Verstuurd door bijbelreis.nl omdat je beheerder bent.
</p>
</td>
</tr>
</table>
</body>
</html>
`;

const TEKENS: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
/** Maakt een waarde veilig voor HTML, ook binnen een attribuut. */
export const escHtml = (s: string) => s.replace(/[&<>"']/g, (c) => TEKENS[c]);

/** Het begin van de vraag op één regel (ongeveer honderd tekens, op een woordgrens), voor de voorvertoning in de inbox. */
export function kort(tekst: string, max = 100): string {
  const plat = tekst.replace(/\s+/g, " ").trim();
  const tekens = [...plat];
  if (tekens.length <= max) return plat;
  const deel = tekens.slice(0, max).join("");
  const spatie = deel.lastIndexOf(" ");
  return (spatie > max * 0.6 ? deel.slice(0, spatie) : deel).replace(/[\s,;:.–-]+$/, "") + "…";
}

export type MailVelden = {
  nummer: number;
  /** De soort aanvraag in gewone taal; alleen vaste woorden, nooit invoer. */
  soort: string;
  vraag: string;
  wanneer: string;
  /** De plaats in de atlas, of leeg: dan vervalt de regel. */
  waar: string;
  /** Het e-mailadres van de aanvrager, of leeg: dan vervallen de knop en de regel. */
  antwoord: string;
};

/** Vult het sjabloon. Alle waarden worden hier ge-escaped; regeleinden in de vraag worden een nieuwe regel. */
export function maakHtml(v: MailVelden): string {
  const antwoord = escHtml(v.antwoord);
  // In een mailto-adres: procent-codering (een % of + in het adres blijft dan wat het is), met een leesbare @.
  const href = escHtml(encodeURIComponent(v.antwoord).replace(/%40/g, "@"));
  const waarden: Record<string, string> = {
    NUMMER: escHtml(String(v.nummer)),
    SOORT: escHtml(v.soort),
    VRAAG: escHtml(v.vraag).replace(/\r\n?|\n/g, "<br>\n"),
    VRAAG_KORT: escHtml(kort(v.vraag)),
    WANNEER: escHtml(v.wanneer),
    WAAR: escHtml(v.waar),
    ANTWOORD: antwoord,
    ANTWOORD_HREF: href,
  };
  // Eerst de stukken die kunnen vervallen, daarna de waarden: in één doorgang, zodat een waarde die zelf op een
  // plaatshouder lijkt (‘{{WAAR}}’ in de vraag) nooit opnieuw wordt ingevuld.
  const opbouw = SJABLOON.replace("{{KNOP_ANTWOORD}}", v.antwoord ? KNOP_ANTWOORD : "")
    .replace("{{REGEL_WAAR}}", v.waar ? REGEL_WAAR : "")
    .replace("{{REGEL_ANTWOORD}}", v.antwoord ? REGEL_ANTWOORD : "");
  return opbouw.replace(/\{\{([A-Z_]+)\}\}/g, (heel, naam: string) => (naam in waarden ? waarden[naam] : heel));
}
