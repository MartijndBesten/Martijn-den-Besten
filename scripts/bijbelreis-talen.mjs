// Talen van de Bijbelreis (docs/bijbelreis-talen/README.md). Na de Vite-build (scripts/postbuild.mjs):
//   1. per taal de atlas als eigen pagina: dist/client/bijbelreis/<taal>/index.html (op bijbelreis.nl: /<taal>/). Die komt
//      uit de Nederlandse pagina: zelfde opbouw, met de vaste teksten uit het woordenboek (public/bijbelreis/taal/<taal>.js),
//      eigen <html lang>, titel, beschrijving, canonical en hreflang, de laag met de inhoud van die taal en zonder de
//      onderdelen die (nog) niet in die taal bestaan;
//   2. per taal een eigen manifest (installeerbare app);
//   3. alleen als een taal openbaar is (shared/bijbelreis.ts, BIJBELREIS_TALEN): de taalkeuze en hreflang op de
//      Nederlandse pagina. Zolang een taal een proef is, blijft de Nederlandse pagina byte voor byte zoals hij was en
//      heeft de pagina in de andere taal noindex.
// De verhaalpagina's per taal maakt scripts/bijbelreis-verhalen.mjs (maakPaginas met een taal).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { BIJBELREIS_TALEN } from "../shared/bijbelreis.ts";

export const ORIGIN = "https://bijbelreis.nl";
export { BIJBELREIS_TALEN };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Het woordenboek van een taal (public/bijbelreis/taal/<taal>.js), zoals de browser het laadt. */
export function laadBoek(pub, taal) {
  const ctx = { window: {} };
  runInNewContext(readFileSync(join(pub, "bijbelreis", "taal", taal + ".js"), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
  const boek = ctx.window.BR.taalBoek[taal];
  if (!boek) throw new Error(`bijbelreis-talen: geen woordenboek voor ${taal}`);
  return boek;
}

/** Eén tekst vertalen, precies zoals taal/taal.js dat in de browser doet. */
export function vertaler(boek) {
  const W = boek.woorden || {}, P = boek.patronen || [];
  const een = (k) => {
    if (Object.prototype.hasOwnProperty.call(W, k)) return W[k];
    for (const [re, rep] of P) if (re.test(k)) return k.replace(re, rep);
    return null;
  };
  return (s) => {
    const tekst = String(s), k = tekst.trim();
    if (!k) return tekst;
    let u = een(k);
    if (u == null && k.indexOf(" · ") > 0) {
      let ander = false;
      const stukken = k.split(" · ").map((x) => { const v = een(x); if (v != null) { ander = true; return v; } return x; });
      if (ander) u = stukken.join(" · ");
    }
    return u == null ? tekst : tekst.replace(k, () => u);
  };
}

// Een element met al zijn inhoud vervangen (zelfde tagnaam mag erin genest zijn).
function vervangBlok(html, van, nieuw) {
  const i = html.indexOf(van);
  if (i < 0) return null;
  const tag = /^<([a-z0-9]+)/.exec(van)[1];
  const open = new RegExp(`<${tag}\\b|</${tag}>`, "g");
  open.lastIndex = i + 1;
  let diepte = 1, m;
  while ((m = open.exec(html))) {
    diepte += m[0].startsWith("</") ? -1 : 1;
    if (!diepte) return html.slice(0, i) + nieuw + html.slice(m.index + m[0].length);
  }
  return null;
}

const ATTR = ["aria-label", "title", "placeholder", "alt", "data-tip", "label"];
// Wat tussen deze twee merktekens staat, is al in de taal geschreven (blokken en de melding): niet nog eens vertalen.
const KLAAR = "<!--taal:klaar-->", KLAAR_EIND = "<!--/taal:klaar-->";
// Tekst die in elke taal gelijk is (tekens, afkortingen) en dus geen vertaling nodig heeft.
const NEUTRAAL = /^[\s\d\p{P}\p{S}×▶◀›‹→←·…–—]*$|^(NL|EN|km|Denckh|Raadkoord|info@denckh\.nl)$/u;

/** De body van een pagina vertalen: tekst tussen de tags en de attributen uit ATTR. Geeft ook terug wat niet vertaald kon worden. */
export function vertaalHtml(html, boek) {
  const v = vertaler(boek), ontbreekt = [];
  // Een woord dat in beide talen hetzelfde is (Routes, Start), staat ook in het woordenboek.
  const bekend = (x) => Object.prototype.hasOwnProperty.call(boek.woorden || {}, String(x).trim());
  for (const [van, nieuw] of boek.blokken || []) {
    const u = vervangBlok(html, van, KLAAR + nieuw + KLAAR_EIND);
    if (u == null) ontbreekt.push(`blok niet gevonden: ${van}`);
    else html = u;
  }
  const b = html.indexOf("<body"), e = html.lastIndexOf("</body>");
  const delen = html.slice(b, e).split(/(<[^>]+>)/);
  let inScript = false, klaar = false;
  const uit = delen.map((d) => {
    if (d === KLAAR || d === KLAAR_EIND) { klaar = d === KLAAR; return ""; }
    if (klaar) return d;
    if (d.startsWith("<")) {
      if (/^<(script|style)\b/i.test(d)) inScript = !/\/>$/.test(d) && !/<\/(script|style)>/i.test(d);
      if (/^<\/(script|style)>/i.test(d)) inScript = false;
      return d.replace(new RegExp(`\\s(${ATTR.join("|")})="([^"]*)"`, "g"), (m, a, w) => {
        const u = v(w);
        if (u === w && !NEUTRAAL.test(w) && !bekend(w)) ontbreekt.push(`${a}: ${w}`);
        return ` ${a}="${esc(u).replace(/&amp;(?=[a-z]+;|#\d+;)/g, "&")}"`;
      });
    }
    if (inScript || !d.trim()) return d;
    const u = v(d);
    if (u === d && !NEUTRAAL.test(d.trim()) && !bekend(d)) ontbreekt.push(d.trim());
    return u;
  });
  return { html: html.slice(0, b) + uit.join("") + html.slice(e), ontbreekt };
}

// De scripts die een taal niet laadt (onderdelen die nog niet vertaald zijn), en waar de taallaag tussen komt.
function scripts(html, taal, boek) {
  const weg = (boek.zonder || []).map((p) => new RegExp(`^/bijbelreis/${p.replace(/\./g, "\\.").replace(/\*/g, "[^\"?]*")}$`));
  html = html.replace(/\s*<script src="(\/bijbelreis\/[^"?]+)(?:\?v=[0-9a-f]+)?"><\/script>/g, (m, src) => (weg.some((re) => re.test(src)) ? "" : m));
  // Eerst het woordenboek en de helper (vóór alle andere scripts: niveaus.js leest BR.taal), dan vlak vóór app.js de
  // inhoud van de taal en de laag die hem toepast.
  html = html.replace(/(\s*)<script src="\/bijbelreis\/leaflet\.js/, `$1<script src="/bijbelreis/taal/${taal}.js"></script>$1<script src="/bijbelreis/taal/taal.js"></script>$1<script src="/bijbelreis/leaflet.js`);
  const inhoud = (boek.inhoud || ["inhoud.js"]).map((f) => `<script src="/bijbelreis/taal/${taal}/${f}"></script>`);
  html = html.replace(/(\s*)<script src="\/bijbelreis\/app\.js/, (m, ws) => `${inhoud.map((x) => ws + x).join("")}${ws}<script src="/bijbelreis/taal/laag.js"></script>${ws}<script src="/bijbelreis/app.js`);
  return html;
}

// hreflang: dezelfde atlas in elke taal; x-default is het Nederlands.
const alternatieven = (talen) => [`<link rel="alternate" hreflang="nl" href="${ORIGIN}/" />`, ...talen.map((t) => `<link rel="alternate" hreflang="${t}" href="${ORIGIN}/${t}/" />`), `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/" />`].join("\n    ");

/** De atlas in een andere taal, uit de (gebouwde) Nederlandse pagina. */
export function maakTaalPagina(nlHtml, taal, boek, { openbaar = false, talen = [taal] } = {}) {
  const k = boek.kop;
  let html = nlHtml
    .replace(/<html lang="nl"/, `<html lang="${taal}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(k.titel)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(k.beschrijving)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${ORIGIN}/${taal}/$2`)
    .replace(/(<meta name="robots" content=")[^"]*(")/, `$1${openbaar ? "index, follow" : "noindex, nofollow"}$2`)
    .replace(/(<meta property="og:locale" content=")[^"]*(" \/>)/, `$1${k.locale}$2\n    <meta property="og:locale:alternate" content="nl_NL" />`)
    .replace(/(<meta property="og:site_name" content=")[^"]*(")/, `$1${esc(k.naam)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(k.titel)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(k.ogBeschrijving || k.beschrijving)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${ORIGIN}/${taal}/$2`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${esc(k.ogAlt)}$2`)
    .replace(/(<link rel="manifest" href=")[^"]*(")/, `$1/bijbelreis/taal/${taal}/manifest.webmanifest$2`)
    .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*(")/, `$1${esc(k.kort)}$2`)
    .replace(/(<link rel="canonical"[^>]*>)/, `$1\n    ${alternatieven(talen)}`)
    .replace(/(<link rel="stylesheet" href="\/bijbelreis\/bijbelreis\.css[^"]*" \/>)/, `$1\n    <link rel="stylesheet" href="/bijbelreis/taal/taal.css" />`);
  // Geen versie van de Nederlandse build: die komen er voor deze pagina opnieuw in (scripts/bijbelreis-pwa.mjs).
  html = html.replace(/\s*<meta name="bijbelreis-(versie|data)" [^>]*\/>/g, "");
  html = scripts(html, taal, boek);
  // De proefmelding en de taalkeuze bovenaan het reisboek.
  html = html.replace(/(<main class="panel" id="reisboek"[^>]*>)/, `$1\n        ${KLAAR}${boek.melding}${KLAAR_EIND}`);
  const r = vertaalHtml(html, boek);
  return r;
}

/** De taalkeuze en hreflang op de Nederlandse pagina: alleen als er een openbare taal is. */
export function zetTaalkeuzeNl(nlHtml, talen) {
  if (!talen.length || nlHtml.includes('hreflang="x-default"')) return nlHtml;
  const keuze = `<p class="taal-nl"><span lang="en">Language:</span> <b aria-current="true">Nederlands</b>${talen.map((t) => ` · <a data-taal="${t}" href="/${t}/" hreflang="${t}" lang="${t}">${esc(BIJBELREIS_TALEN[t].naam)}</a>`).join("")}</p>`;
  return nlHtml
    .replace(/(<link rel="canonical"[^>]*>)/, `$1\n    ${alternatieven(talen)}`)
    .replace(/(<link rel="stylesheet" href="\/bijbelreis\/bijbelreis\.css[^"]*" \/>)/, `$1\n    <link rel="stylesheet" href="/bijbelreis/taal/taal.css" />`)
    .replace(/(\s*)<script src="\/bijbelreis\/leaflet\.js/, `$1<script src="/bijbelreis/taal/taal.js"></script>$1<script src="/bijbelreis/leaflet.js`)
    .replace(/(<details class="parents">)/, `${keuze}\n        $1`);
}

/** Alle talen met een woordenboek: [taal, openbaar]. */
export function talenMetBoek(pub = "public") {
  return Object.entries(BIJBELREIS_TALEN).filter(([t]) => existsSync(join(pub, "bijbelreis", "taal", t + ".js"))).map(([t, x]) => [t, x.openbaar]);
}

/** Na de build: de pagina's en manifesten per taal. Geeft per taal wat niet vertaald kon worden. */
export function maakTalen(dist, pub = "public") {
  const talen = talenMetBoek(pub);
  const nlPad = join(dist, "bijbelreis.html");
  const nl = readFileSync(nlPad, "utf8");
  const openbaar = talen.filter(([, o]) => o).map(([t]) => t);
  const verslag = {};
  for (const [taal, isOpen] of talen) {
    const boek = laadBoek(pub, taal);
    const { html, ontbreekt } = maakTaalPagina(nl, taal, boek, { openbaar: isOpen, talen: openbaar.includes(taal) ? openbaar : [taal] });
    mkdirSync(join(dist, "bijbelreis", taal), { recursive: true });
    writeFileSync(join(dist, "bijbelreis", taal, "index.html"), html);
    const m = JSON.parse(readFileSync(join(pub, "bijbelreis", "manifest.webmanifest"), "utf8"));
    Object.assign(m, { id: `/${taal}/`, name: boek.kop.titelKort || boek.kop.titel, short_name: boek.kop.kort, description: boek.kop.beschrijving, lang: taal, start_url: `/${taal}/`, scope: `/${taal}/` });
    mkdirSync(join(dist, "bijbelreis", "taal", taal), { recursive: true });
    writeFileSync(join(dist, "bijbelreis", "taal", taal, "manifest.webmanifest"), JSON.stringify(m, null, 2) + "\n");
    verslag[taal] = ontbreekt;
  }
  if (openbaar.length) writeFileSync(nlPad, zetTaalkeuzeNl(nl, openbaar));
  return verslag;
}
