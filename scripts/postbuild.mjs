// Maakt na de Vite-build per route een eigen HTML-bestand met de juiste titel, beschrijving en canonical,
// plus een 404.html (echte 404-status voor onbekende pagina's) en de sitemap.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROUTES, SITE } from "../src/content/site.ts";

const dist = "dist/client";
const shell = readFileSync(join(dist, "index.html"), "utf8");
const manifest = JSON.parse(readFileSync(join(dist, ".vite/manifest.json"), "utf8"));

const PAGE_FILES = {
  "/control-center": "ControlCenter",
  "/museum": "Museum",
  "/over": "Over",
  "/loket": "Loket",
  "/bureau": "Bureau",
  "/certificaat": "Certificaat",
  "/einde": "Einde",
  "/beheer": "Beheer",
};

// Verzamelt JS- en CSS-bestanden van een pagina-chunk (inclusief gedeelde imports), zodat ze direct mee laden.
function preloadsFor(path) {
  const name = PAGE_FILES[path];
  if (!name) return "";
  const key = `src/pages/${name}.tsx`;
  const js = new Set();
  const css = new Set();
  const visit = (k) => {
    const entry = manifest[k];
    if (!entry || entry.isEntry) return;
    js.add(entry.file);
    (entry.css ?? []).forEach((c) => css.add(c));
    (entry.imports ?? []).forEach(visit);
  };
  visit(key);
  return [...css].map((c) => `<link rel="stylesheet" href="/${c}" />`).concat([...js].map((f) => `<link rel="modulepreload" href="/${f}" />`)).join("\n    ");
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function page({ path, title, description }, { noindex = false } = {}) {
  const url = SITE.url + (path === "/" ? "/" : path);
  let html = shell
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace("</head>", `  ${preloadsFor(path)}\n  </head>`);
  if (noindex) html = html.replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, nofollow" />');
  return html;
}

for (const r of ROUTES) {
  // Statische pagina's (bijv. /bijbelreis) staan al in public/ en krijgen geen React-schil.
  if (r.path === "/" || r.static) continue;
  const file = `${r.path.slice(1)}.html`;
  writeFileSync(join(dist, file), page(r, { noindex: r.path === "/beheer" }));
}
writeFileSync(join(dist, "index.html"), page(ROUTES[0]));
writeFileSync(
  join(dist, "404.html"),
  page({ path: "/404", title: "Fout 404: deze pagina is nog niet afgemaakt — Martijn den Besten", description: "Deze pagina bestaat (nog) niet." }, { noindex: true }),
);

// Strooizout voor de buurt: eigen Vite-ingang (strooizout.html). Elke route krijgt een eigen HTML-bestand met titel en
// canonical; beheer, bestelpagina en flyer staan op noindex. Zie docs/strooizout/README.md.
{
  const { mkdirSync } = await import("node:fs");
  const szShell = readFileSync(join(dist, "strooizout.html"), "utf8");
  // Canonical op het eigen domein (korte adressen, worker/strooizout-domein.ts).
  const SZ_DOMEIN = "https://strooizouthouten.nl";
  const SZ = [
    { pad: "bestellen", titel: "Bestellen — Strooizout voor de buurt", noindex: true },
    { pad: "bestelling", titel: "Je bestelling — Strooizout voor de buurt", noindex: true },
    { pad: "privacy", titel: "Privacy — Strooizout voor de buurt", noindex: false, beschrijving: "Welke gegevens Strooizout voor de buurt (Denckh, Houten) vraagt bij een bestelling, waarvoor en hoe lang. Geen cookies." },
    { pad: "voorwaarden", titel: "Voorwaarden — Strooizout voor de buurt", noindex: false, beschrijving: "Voorwaarden voor het bestellen van strooizout in Houten: prijzen, afhalen en bezorgen, betalen, annuleren en terugbrengen." },
    { pad: "flyer", titel: "Flyer en deelbeelden — Strooizout voor de buurt", noindex: true },
    { pad: "beheer", titel: "Beheer — Strooizout voor de buurt", noindex: true },
    { pad: "aan-de-weg", titel: "Strooizout aan de weg — Strooizout voor de buurt", noindex: true },
  ];
  mkdirSync(join(dist, "strooizout"), { recursive: true });
  for (const r of SZ) {
    let html = szShell
      .replace(/<title>.*?<\/title>/, `<title>${esc(r.titel)}</title>`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${SZ_DOMEIN}/${r.pad}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${SZ_DOMEIN}/${r.pad}$2`);
    if (r.beschrijving) html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(r.beschrijving)}$2`).replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(r.beschrijving)}$2`);
    if (r.noindex) html = html.replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, nofollow" />');
    writeFileSync(join(dist, "strooizout", `${r.pad}.html`), html);
  }
  console.log(`postbuild: Strooizout ${SZ.length + 1} pagina's`);
}

const today = new Date().toISOString().slice(0, 10);
const indexable = [
  ...ROUTES.filter((r) => !["/beheer", "/einde"].includes(r.path)),
];
// Strooizout staat in de sitemap van zijn eigen domein (strooizouthouten.nl/sitemap.xml, worker/strooizout-domein.ts).
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
    .map((r) => `  <url><loc>${SITE.url}${r.path === "/" ? "/" : r.path}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`,
);
console.log(`postbuild: ${ROUTES.length} routes + 404.html + sitemap.xml`);

// Bijbelreis: versienummer (inhoudshash) achter de eigen scripts en stijlen, zodat een nieuwe versie niet
// half uit de browsercache komt (oude app.js met nieuwe inhoud of andersom). Hetzelfde voor de pagina Presentatie en
// boekje (bijbelreis/boekje.html) en de Lesroutes (bijbelreis/lessen.html). Daarna de service worker met één vaste set bestanden per
// versie (installeerbare app, offline): scripts/bijbelreis-pwa.mjs en docs/bijbelreis-pwa/README.md.
// Eerst de atlas in de andere talen (scripts/bijbelreis-talen.mjs, docs/bijbelreis-talen/README.md): die krijgen daarna
// ook hun versienummers en een eigen service worker.
const { maakTalen } = await import("./bijbelreis-talen.mjs");
for (const [taal, ontbreekt] of Object.entries(maakTalen(dist))) {
  console.log(`postbuild: Bijbelreis in het ${taal}${ontbreekt.length ? `, ${ontbreekt.length} teksten nog niet vertaald: ${ontbreekt.slice(0, 8).join(" | ")}` : ""}`);
}
const { stempel, maakPwa, talen } = await import("./bijbelreis-pwa.mjs");
stempel(dist);
for (const taal of talen(dist)) {
  const pwa = maakPwa(dist, taal);
  console.log(`postbuild: Bijbelreis${taal === "nl" ? "" : ` (${taal})`} versie ${pwa.versie}, schil ${pwa.bestanden} bestanden (${pwa.kB} kB), ${pwa.beelden} afbeeldingen`);
}

// Bijbelreis: per geschiedenis een gewone HTML-pagina voor zoekmachines (/verhaal/<nr>-<slug> op bijbelreis.nl) en een
// overzicht (/verhalen), uit dezelfde gegevens als de atlas. Zie scripts/bijbelreis-verhalen.mjs.
{
  const { mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  const { laadGegevens, maakPaginas } = await import("./bijbelreis-verhalen.mjs");
  const { talenMetBoek } = await import("./bijbelreis-talen.mjs");
  const css = readFileSync(join(dist, "bijbelreis", "verhaal.css"));
  const paginas = maakPaginas(laadGegevens("public"), css);
  for (const [taal, openbaar] of talenMetBoek("public")) Object.assign(paginas, maakPaginas(laadGegevens("public", taal), css, { taal, openbaar }));
  for (const [p, html] of Object.entries(paginas)) {
    mkdirSync(dirname(join(dist, p)), { recursive: true });
    writeFileSync(join(dist, p), html);
  }
  console.log(`postbuild: Bijbelreis ${Object.keys(paginas).length} verhaalpagina's (inclusief overzicht)`);
}
