// De Bijbelreis als installeerbare app (docs/bijbelreis-pwa/README.md): na de build
//   1. krijgt elk eigen script en stijlbestand in bijbelreis.html, bijbelreis/boekje.html en bijbelreis/lessen.html een inhoudshash in het adres
//      (?v=…), en staan de hashes van de gegevens die de scripts zelf ophalen in de meta-tag bijbelreis-data;
//   2. krijgt bijbelreis.html een versienummer (meta bijbelreis-versie) en wordt bijbelreis-sw.js (de service worker)
//      ingevuld met die versie, de lijst bestanden van de app-schil met hun hash, en de hashes van de afbeeldingen.
// Beide stappen kunnen opnieuw over een al gebouwde map lopen (bestaande ?v= en meta-tags worden vervangen); de
// e2e-test (e2e/bijbelreis-pwa.spec.ts) gebruikt dat om een nieuwe versie na te bootsen.
// Gebruik: node scripts/bijbelreis-pwa.mjs [map]   (standaard dist/client; postbuild.mjs roept het zelf aan)

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const hash = (buf, n) => createHash("sha256").update(buf).digest("hex").slice(0, n);
const lees = (dist, pad) => readFileSync(join(dist, pad.replace(/^\//, "")));

// Gegevens die de scripts zelf ophalen: app.js (ondergrond, reliëf, grenzen, landschap van toen) en niveaus.js (de
// teksten per niveau). Ze krijgen hun hash via de meta-tag, want de CSP staat geen inline script toe.
const DATA = ["geo.json", "toen.json", "relief.json", "grenzen.json", "relief-regio.webp", "relief-kanaan.webp", "niveaus/a.js", "niveaus/b.js", "niveaus/c.js"];

export function stempel(dist) {
  for (const pagina of ["bijbelreis.html", "bijbelreis/boekje.html", "bijbelreis/lessen.html"]) {
    const file = join(dist, pagina);
    let html = readFileSync(file, "utf8").replace(/((?:src|href)=")(\/bijbelreis\/[^"?]+\.(?:js|css))(?:\?v=[0-9a-f]+)?"/g, (m, attr, url) => `${attr}${url}?v=${hash(lees(dist, url), 10)}"`);
    const data = Object.fromEntries(DATA.map((p) => [p, hash(lees(dist, "bijbelreis/" + p), 10)]));
    const meta = `<meta name="bijbelreis-data" content='${JSON.stringify(data)}' />`;
    html = /<meta name="bijbelreis-data" [^>]*\/>/.test(html) ? html.replace(/<meta name="bijbelreis-data" [^>]*\/>/, meta) : html.replace("</head>", `    ${meta}\n  </head>`);
    writeFileSync(file, html);
  }
}

function bestanden(dir) {
  return readdirSync(dir).flatMap((naam) => {
    const vol = join(dir, naam);
    return statSync(vol).isDirectory() ? bestanden(vol) : [vol];
  });
}

export function maakPwa(dist) {
  const htmlPad = join(dist, "bijbelreis.html");
  const html = readFileSync(htmlPad, "utf8").replace(/\s*<meta name="bijbelreis-versie" [^>]*\/>/, "");
  const schil = new Map();
  // Alles met een inhoudshash in het adres in de pagina: scripts en stijlen.
  for (const [, pad, v] of html.matchAll(/(?:src|href)="(\/bijbelreis\/[^"?]+)\?v=([0-9a-f]+)"/g)) schil.set(`${pad}?v=${v}`, v);
  // De gegevens uit de meta-tag (app.js en niveaus.js zetten die hash achter het adres).
  const data = JSON.parse(html.match(/<meta name="bijbelreis-data" content='([^']+)'/)[1]);
  for (const [p, v] of Object.entries(data)) schil.set(`/bijbelreis/${p}?v=${v}`, v);
  // Lettertypen uit de stijlen, het pictogram en het manifest: vaste adressen, de hash staat alleen hier.
  const css = [...schil.keys()].filter((p) => p.includes(".css?")).map((p) => lees(dist, p.split("?")[0]).toString("utf8")).join("\n");
  const vast = new Set([...css.matchAll(/url\("?(\/fonts\/[^")]+)"?\)/g)].map((m) => m[1]));
  for (const [, pad] of html.matchAll(/<link rel="(?:icon|manifest)" href="(\/bijbelreis\/[^"?]+)"/g)) vast.add(pad);
  for (const pad of vast) schil.set(pad, hash(lees(dist, pad), 16));
  for (const pad of schil.keys()) {
    const v = schil.get(pad);
    if (!hash(lees(dist, pad.split("?")[0]), v.length).startsWith(v)) throw new Error(`bijbelreis-pwa: hash klopt niet voor ${pad}`);
  }
  // Afbeeldingen (foto's, pictogrammen): niet vooraf, wel bewaard zodra ze bekeken zijn. Met hash, zodat een vervangen
  // foto niet uit de oude bewaarplaats komt.
  const beelden = {};
  for (const vol of bestanden(join(dist, "bijbelreis"))) {
    const pad = "/" + relative(dist, vol).split("\\").join("/");
    if (/\.(webp|png|jpe?g|svg)$/.test(pad) && ![...schil.keys()].some((k) => k.split("?")[0] === pad)) beelden[pad] = hash(readFileSync(vol), 12);
  }
  const lijst = [...schil.entries()].sort(([a], [b]) => a.localeCompare(b));
  const versie = hash(JSON.stringify({ html: hash(html, 64), lijst, beelden }), 12);
  writeFileSync(htmlPad, html.replace("</head>", `    <meta name="bijbelreis-versie" content="${versie}" />\n  </head>`));

  const swPad = join(dist, "bijbelreis-sw.js");
  const bouw = `/* BOUW:BEGIN — dit blok vult scripts/bijbelreis-pwa.mjs bij elke build in; niet met de hand bewerken. */\nconst BOUW = ${JSON.stringify({ versie, schil: lijst, beelden })};\n/* BOUW:EIND */`;
  const sw = readFileSync(swPad, "utf8");
  if (!/\/\* BOUW:BEGIN[\s\S]*?BOUW:EIND \*\//.test(sw)) throw new Error("bijbelreis-pwa: blok BOUW ontbreekt in bijbelreis-sw.js");
  writeFileSync(swPad, sw.replace(/\/\* BOUW:BEGIN[\s\S]*?BOUW:EIND \*\//, () => bouw));
  const groot = lijst.reduce((n, [p]) => n + statSync(join(dist, p.split("?")[0])).size, 0);
  return { versie, bestanden: lijst.length, kB: Math.round(groot / 1024), beelden: Object.keys(beelden).length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dist = process.argv[2] || "dist/client";
  stempel(dist);
  const r = maakPwa(dist);
  console.log(`bijbelreis-pwa: versie ${r.versie}, schil ${r.bestanden} bestanden (${r.kB} kB), ${r.beelden} afbeeldingen`);
}
