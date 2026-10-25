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

const today = new Date().toISOString().slice(0, 10);
const indexable = ROUTES.filter((r) => !["/beheer", "/einde"].includes(r.path));
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
    .map((r) => `  <url><loc>${SITE.url}${r.path === "/" ? "/" : r.path}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`,
);
console.log(`postbuild: ${ROUTES.length} routes + 404.html + sitemap.xml`);
