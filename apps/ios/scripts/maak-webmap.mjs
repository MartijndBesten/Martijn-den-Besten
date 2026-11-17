// Maakt de webmap van de iOS-app (apps/ios/www) uit de bestanden van de website. Niets in public/ wordt gewijzigd.
//
//   public/bijbelreis.html  -> www/index.html   (met de app-laag erin, zonder bezoekmeting)
//   public/bijbelreis/**    -> www/bijbelreis/  (zonder bezoek.js, boekje en verhuis.js)
//   public/fonts/**         -> www/fonts/
//   apps/ios/app-laag/**    -> www/app/
//
// De paden in de atlas zijn absoluut (/bijbelreis/..., /fonts/...). In de app is de webmap de wortel
// (capacitor://localhost/), dus die paden kloppen zonder worker. Elke vervanging in index.html MOET lukken:
// verandert de website zo dat een vervanging niet meer past, dan stopt dit script met een fout in plaats van
// stilletjes een app te bouwen met verkeerde privacytekst of een bezoekmeting.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const hier = dirname(fileURLToPath(import.meta.url));
const app = join(hier, "..");
const repo = join(app, "..", "..");
const pub = join(repo, "public");
const www = join(app, "www");

const NIET_MEE = new Set(["bezoek.js", "boekje.html", "boekje.js", "boekje.css", "boekje-inhoud.js", "boekje-kaart.js", "boekje-speler.js", "verhuis.js"]);

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
cpSync(join(pub, "bijbelreis"), join(www, "bijbelreis"), { recursive: true, filter: (bron) => !NIET_MEE.has(relative(join(pub, "bijbelreis"), bron)) });
cpSync(join(pub, "fonts"), join(www, "fonts"), { recursive: true });
cpSync(join(app, "app-laag"), join(www, "app"), { recursive: true });

let html = readFileSync(join(pub, "bijbelreis.html"), "utf8");
function vervang(naam, zoek, door) {
  const voor = html;
  html = html.replace(zoek, door);
  if (html === voor) throw new Error(`maak-webmap: vervanging ‘${naam}’ past niet meer op public/bijbelreis.html. Pas het script aan.`);
}

// 1. Herkenbaar als app (voor de CSS van de app-laag).
vervang("html-kenmerk", /<html lang="nl"/, '<html lang="nl" data-app="ios"');
// 2. Zelfde veiligheidsbeleid als de website (public/_headers), zonder Cloudflare-meting: alles komt uit de app zelf.
//    frame-ancestors werkt niet in een meta-tag; in de app is er geen omringende pagina.
vervang(
  "csp",
  /<meta charset="UTF-8" \/>/,
  `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'" />`,
);
// 3. De app-laag: vóór alle andere scripts, zodat hij de voortgang kan veiligstellen en klikken naar buiten kan opvangen.
vervang(
  "app-laag",
  /(<link rel="stylesheet" href="\/bijbelreis\/bijbelreis.css" \/>)/,
  `$1\n    <link rel="stylesheet" href="/app/app-laag.css" />\n    <script src="/app/app-laag.js"></script>`,
);
// 4. Geen bezoekmeting in de app.
vervang("bezoekmeting", /\s*<script src="\/bijbelreis\/bezoek\.js"><\/script>/, "");
// 5. Privacytekst voor de app: er gaat niets naar een server.
vervang(
  "privacy",
  /(<dt>Privacy<\/dt>\s*<dd>)[\s\S]*?(<\/dd>)/,
  "$1Stempels, scores en waar je was, worden alleen op dit apparaat bewaard. Geen account, geen cookies en geen telling: de app verstuurt niets. Wil je iets vragen of delen, of een website openen? Dan vraagt de app eerst om een ouder (de ouderpoort) en gaat het via je eigen mail, deelmenu of browser.$2",
);
vervang("colofon-telling", /Geen cookies; bezoeken worden naamloos geteld \(zie Privacy hierboven\)\./, "Geen cookies en geen telling (zie Privacy hierboven).");

writeFileSync(join(www, "index.html"), html);

// Controle: niets in de webmap mag nog naar /api/ wijzen, behalve het aanvraagformulier in app.js (dat de app-laag
// vervangt door mailen achter de ouderpoort). Zo valt een nieuwe serveraanroep in de website meteen op.
const TOEGESTAAN = new Set(["bijbelreis/app.js:/api/aanvraag"]);
const fouten = [];
(function loop(map) {
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) { loop(pad); continue; }
    if (!/\.(js|html|css|json)$/.test(naam)) continue;
    const rel = relative(www, pad);
    for (const m of readFileSync(pad, "utf8").matchAll(/\/api\/[a-z-]+/g)) if (!TOEGESTAAN.has(`${rel}:${m[0]}`)) fouten.push(`${rel}: ${m[0]}`);
  }
})(www);
if (fouten.length) throw new Error("maak-webmap: onverwachte serveraanroepen in de app:\n  " + fouten.join("\n  "));
if (existsSync(join(www, "bijbelreis", "bezoek.js")) || html.includes("bezoek.js")) throw new Error("maak-webmap: bezoekmeting zit nog in de app");

let bytes = 0, aantal = 0;
(function tel(map) { for (const n of readdirSync(map)) { const p = join(map, n); const s = statSync(p); if (s.isDirectory()) tel(p); else { bytes += s.size; aantal++; } } })(www);
console.log(`webmap klaar: ${relative(repo, www)} (${aantal} bestanden, ${(bytes / 1048576).toFixed(1)} MB)`);
