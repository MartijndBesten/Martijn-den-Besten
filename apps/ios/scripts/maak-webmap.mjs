// Maakt de webmap van de iOS-app (apps/ios/www) uit de bestanden van de website. Niets in public/ wordt gewijzigd.
//
//   public/bijbelreis.html              -> www/index.html                (atlas: met app-laag, zonder telling en service worker)
//   public/bijbelreis/lessen.html       -> www/bijbelreis/lessen.html    (lesroutes, met app-laag)
//   public/bijbelreis/privacy|hulp.html -> www/bijbelreis/…              (met app-laag)
//   public/bijbelreis/**                -> www/bijbelreis/               (zonder bezoek.js, boekje, verhuis.js, pwa.js, manifest)
//   public/fonts/**                     -> www/fonts/
//   apps/ios/app-laag/**                -> www/app/
//
// De paden in de atlas zijn absoluut (/bijbelreis/…, /fonts/…). In de app is de webmap de wortel (capacitor://localhost/),
// dus die paden kloppen zonder worker. Adressen zonder extensie (/bijbelreis/lessen, /verhaal/26-…) vangt de app-laag op
// (app-laag/adressen.js).
//
// Elke vervanging MOET lukken en elke controle MOET slagen. Verandert de website zo dat iets niet meer past (een nieuwe
// pagina, een nieuwe /api-aanroep of andere netwerkaanroep, een bron van buiten, een adres zonder bestemming in de app),
// dan stopt dit script met een fout in plaats van stilletjes een app te bouwen die iets verstuurt of doodloopt.
// tests/bijbelreis-app-webmap.test.ts (in de root) draait dit script op elke wijziging van de website.
//
//   node scripts/maak-webmap.mjs [uitmap]
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";

const hier = dirname(fileURLToPath(import.meta.url));
const APP = join(hier, "..");
const REPO = join(APP, "..", "..");

// Bestanden van de website die niet in de app horen.
//  bezoek.js: bezoekmeting (POST /api/bezoek). boekje*: presentatie en boekje (downloaden en afdrukken werken niet in de
//  webview; de app verwijst naar de website). verhuis.js: alleen voor de verhuizing van martijndenbesten.com.
//  pwa.js, manifest en icoon-*.png: de installeerbare website (service worker); WKWebView met capacitor:// kent geen
//  service worker, en de app heeft zijn eigen pictogram.
export const NIET_MEE = new Set([
  "bezoek.js", "boekje.html", "boekje.js", "boekje-inhoud.js", "boekje-kaart.js", "boekje-speler.js",
  "verhuis.js", "pwa.js", "manifest.webmanifest", "icoon-192.png", "icoon-512.png", "icoon-maskable-192.png", "icoon-maskable-512.png",
]);
// boekje.css gaat wél mee: de lesroutes, privacy en hulp gebruiken de kopbalk en voet daaruit.

// De pagina's in de app. Elke andere .html in de webmap laat het script falen.
const PAGINAS = { "index.html": "bijbelreis.html", "bijbelreis/lessen.html": "bijbelreis/lessen.html", "bijbelreis/privacy.html": "bijbelreis/privacy.html", "bijbelreis/hulp.html": "bijbelreis/hulp.html" };

// Zelfde beleid als public/_headers, zonder Cloudflare-meting en zonder formulierverzending: alles komt uit de app zelf.
// frame-ancestors werkt niet in een meta-tag; in de app is er geen omringende pagina.
export const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";

// Netwerkaanroepen die bekend en gecontroleerd zijn, per bestand. Komt er één bij, dan faalt het script: kijk dan of de
// aanroep in de app werkt (alleen eigen bestanden, offline) en werk deze lijst bij.
//  app.js: geo/toen/reliëf/grenzen (eigen bestanden) en /api/aanvraag (het formulier, dat de app-laag nooit laat openen).
//  app-laag.js: de licentie van Leaflet uit de app zelf.
const NETWERK = { "bijbelreis/app.js": 5, "app/app-laag.js": 1 };
const API_TOEGESTAAN = new Set(["bijbelreis/app.js:/api/aanvraag"]);
// Adressen die niet in de app staan en (na de ouderpoort) naar bijbelreis.nl gaan. Een nieuw adres zonder bestemming laat
// het script falen.
const NAAR_SITE = new Set(["/bijbelreis/boekje"]);

function laadAdressen() {
  const ctx = { window: {} };
  runInNewContext(readFileSync(join(APP, "app-laag", "adressen.js"), "utf8"), ctx);
  if (typeof ctx.window.bijbelreisAdres !== "function") throw new Error("maak-webmap: app-laag/adressen.js zet window.bijbelreisAdres niet");
  return ctx.window.bijbelreisAdres;
}

function alleBestanden(map) {
  return readdirSync(map).flatMap((n) => { const p = join(map, n); return statSync(p).isDirectory() ? alleBestanden(p) : [p]; });
}

export function maakWebmap({ uit = join(APP, "www"), pub = join(REPO, "public"), stil = false } = {}) {
  uit = resolve(uit);
  const adres = laadAdressen();
  const fouten = [];
  const fout = (t) => fouten.push(t);

  rmSync(uit, { recursive: true, force: true });
  mkdirSync(uit, { recursive: true });
  const bron = join(pub, "bijbelreis");
  cpSync(bron, join(uit, "bijbelreis"), { recursive: true, filter: (p) => !NIET_MEE.has(relative(bron, p)) });
  cpSync(join(pub, "fonts"), join(uit, "fonts"), { recursive: true });
  cpSync(join(APP, "app-laag"), join(uit, "app"), { recursive: true });

  // ---------- pagina's ----------
  for (const [doel, van] of Object.entries(PAGINAS)) {
    let html = readFileSync(join(pub, van), "utf8");
    const vervang = (naam, zoek, door, minstens = 1) => {
      let n = 0;
      html = html.replace(zoek, (...m) => { n++; return typeof door === "function" ? door(...m) : door.replace(/\$(\d)/g, (_, i) => m[+i]); });
      if (n < minstens) throw new Error(`maak-webmap: vervanging ‘${naam}’ past niet meer op public/${van}. Pas het script aan.`);
    };
    // Herkenbaar als app (voor de CSS van de app-laag), eigen CSP, en de app-laag als eerste script.
    vervang("html-kenmerk", /<html lang="nl"/, '<html lang="nl" data-app="ios"');
    vervang("csp", /<meta charset="UTF-8" \/>/, `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`);
    vervang("app-laag", /\n?\s*<\/head>/, '\n    <link rel="stylesheet" href="/app/app-laag.css" />\n    <script src="/app/adressen.js"></script>\n    <script src="/app/app-laag.js"></script>\n  </head>');

    if (doel === "index.html") {
      // Geen installeerbare website in de app: geen manifest, geen apple-/web-app-meta, geen service worker.
      vervang("manifest", /\s*<link rel="manifest" [^>]*>/, "");
      vervang("web-app-meta", /\s*<meta name="(?:mobile-web-app-capable|apple-mobile-web-app-[a-z-]+)" [^>]*>/g, "", 4);
      vervang("pwa.js", /\s*<script src="\/bijbelreis\/pwa\.js"><\/script>/, "");
      // Geen bezoekmeting in de app.
      vervang("bezoekmeting", /\s*<script src="\/bijbelreis\/bezoek\.js"><\/script>/, "");
      // Privacytekst voor de app: er gaat niets naar een server.
      vervang("privacy", /(<dt>Privacy<\/dt>\s*<dd>)[\s\S]*?(<\/dd>)/,
        "$1Stempels, scores en waar je was, worden alleen op dit apparaat bewaard. Geen account, geen cookies en geen telling: de app verstuurt niets. Wil je iets vragen of delen, of een website openen? Dan vraagt de app eerst om een ouder (de ouderpoort) en gaat het via je eigen mail, deelmenu of browser. <a href=\"/bijbelreis/privacy\">Lees de privacyverklaring</a>$2");
    }
    // De app-laag moet vóór elk ander script staan (voortgang veiligstellen, klikken naar buiten opvangen).
    const eerste = /<script src="([^"]+)"/.exec(html);
    if (!eerste || eerste[1] !== "/app/adressen.js") fout(`${doel}: de app-laag is niet het eerste script`);
    mkdirSync(dirname(join(uit, doel)), { recursive: true });
    writeFileSync(join(uit, doel), html);
  }
  // public/bijbelreis.html staat als index.html in de app; geen tweede kopie.
  rmSync(join(uit, "bijbelreis.html"), { force: true });

  // ---------- controles over de hele webmap ----------
  const bestaat = (pad) => { const p = join(uit, decodeURIComponent(pad === "/" ? "/index.html" : pad)); return p.startsWith(uit + sep) && existsSync(p); };
  const map = (pad) => { const p = join(uit, pad); return existsSync(p) && statSync(p).isDirectory(); };
  // Een adres binnen de app (zonder fragment en query) moet een bestemming hebben.
  function controleerAdres(rel, ruw) {
    const kaal = ruw.split("${")[0].split("#")[0].split("?")[0];
    if (!kaal || kaal === "/" ) return;
    if (kaal.endsWith("/")) { if (!map(kaal) && adres(kaal).soort !== "app") fout(`${rel}: map ${kaal} bestaat niet in de app`); return; }
    const b = adres(kaal);
    if (b.soort === "app") { if (!bestaat(b.url.split("#")[0])) fout(`${rel}: ${kaal} → ${b.url}, maar die pagina staat niet in de app`); }
    else if (b.soort === "bestand") { if (!bestaat(kaal)) fout(`${rel}: ${kaal} staat niet in de app`); }
    else if (!NAAR_SITE.has(kaal)) fout(`${rel}: adres ${kaal} heeft geen bestemming in de app (voeg het toe aan app-laag/adressen.js of aan NAAR_SITE)`);
  }

  const lijst = alleBestanden(uit);
  let bytes = 0;
  for (const pad of lijst) {
    bytes += statSync(pad).size;
    const rel = relative(uit, pad).split(sep).join("/");
    if (/\.html$/.test(rel) && !PAGINAS[rel]) fout(`${rel}: nieuwe pagina; zet hem in PAGINAS (met app-laag) of in NIET_MEE`);
    if (!/\.(js|html|css|json)$/.test(rel)) continue;
    const t = readFileSync(pad, "utf8");

    // 1. Geen serveraanroepen behalve het (in de app nooit geopende) aanvraagformulier.
    for (const m of t.matchAll(/\/api\/[a-z-]+/g)) if (!API_TOEGESTAAN.has(`${rel}:${m[0]}`)) fout(`${rel}: serveraanroep ${m[0]}`);
    if (/\.json$/.test(rel)) continue;

    // 2. Netwerkaanroepen: alleen de bekende.
    const n = (t.match(/\bfetch\(|sendBeacon|XMLHttpRequest|new WebSocket|new EventSource|importScripts|new (?:Shared)?Worker\(|\bimport\(/g) || []).length;
    if (n !== (NETWERK[rel] || 0)) fout(`${rel}: ${n} netwerkaanroep(en), bekend: ${NETWERK[rel] || 0}. Controleer ze en werk NETWERK bij`);
    // 3. Geen service worker en geen installeerbare website.
    if (/serviceWorker/.test(t) && rel !== "bijbelreis/leaflet.js") fout(`${rel}: noemt serviceWorker`);
    if (/\.html$/.test(rel) && /rel="manifest"|apple-mobile-web-app|pwa\.js|bezoek\.js/.test(t)) fout(`${rel}: manifest, web-app-meta, pwa.js of bezoek.js staat er nog in`);
    // 4. Niets van buiten laden. Links naar buiten (a href) mogen: die gaan via de ouderpoort.
    if (/\.css$/.test(rel) && /url\(\s*["']?(?:https?:)?\/\//.test(t)) fout(`${rel}: CSS laadt iets van buiten`);
    if (/\.html$/.test(rel)) {
      for (const m of t.matchAll(/<(script|img|iframe|source|video|audio|embed|object)\b[^>]*\s(?:src|data)="((?:https?:)?\/\/[^"]+)"/g)) fout(`${rel}: <${m[1]}> van buiten: ${m[2]}`);
      for (const m of t.matchAll(/<link\b[^>]*href="((?:https?:)?\/\/[^"]+)"[^>]*>/g)) if (!/rel="canonical"/.test(m[0])) fout(`${rel}: <link> van buiten: ${m[1]}`);
      for (const m of t.matchAll(/<form\b[^>]*action="([^"]+)"/g)) fout(`${rel}: formulier naar ${m[1]}`);
      if (/http-equiv="refresh"/i.test(t)) fout(`${rel}: meta refresh`);
    }
    if (/\.js$/.test(rel) && rel !== "bijbelreis/leaflet.js" && /(?:\.src\s*=\s*|\bsrc=\\?["'`]?)["'`]?https?:\/\//.test(t)) fout(`${rel}: zet een bron (src) van buiten`);
    // 5. Geen navigatie per script buiten de app-laag om (die ziet de ouderpoort niet).
    if (/\.js$/.test(rel) && !rel.startsWith("app/") && rel !== "bijbelreis/leaflet.js") {
      for (const m of t.matchAll(/location\.(?:href\s*=(?!=)|assign\(|replace\()|window\.open\(/g)) fout(`${rel}: navigeert per script (${m[0]})`);
    }
    // 6. Elk eigen adres heeft een bestemming in de app.
    if (/\.html$/.test(rel)) for (const m of t.matchAll(/\s(?:href|src)="(\/(?!\/)[^"]*)"/g)) controleerAdres(rel, m[1]);
    if (/\.css$/.test(rel)) for (const m of t.matchAll(/url\(\s*["']?(\/(?!\/)[^"')]+)/g)) controleerAdres(rel, m[1]);
    if (/\.js$/.test(rel) && !rel.startsWith("app/")) for (const m of t.matchAll(/["'`](\/(?:bijbelreis|verhaal|verhalen|privacy|hulp|lessen|fonts|index)\b[^"'`\s<>\\]*)/g)) controleerAdres(rel, m[1]);
  }
  if (fouten.length) throw new Error("maak-webmap: de webmap past niet bij de app:\n  " + fouten.join("\n  "));
  const uitkomst = { uit, bestanden: lijst.length, bytes };
  if (!stil) console.log(`webmap klaar: ${relative(process.cwd(), uit) || uit} (${lijst.length} bestanden, ${(bytes / 1048576).toFixed(1)} MB)`);
  return uitkomst;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { maakWebmap(process.argv[2] ? { uit: process.argv[2] } : {}); }
  catch (e) { console.error(e.message); process.exit(1); }
}
