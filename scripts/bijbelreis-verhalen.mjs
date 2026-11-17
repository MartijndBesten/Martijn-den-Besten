// Vindbaarheid van de Bijbelreis: per geschiedenis een lichte, gewone HTML-pagina die zoekmachines kunnen lezen.
// De atlas zelf toont alles achter een #-fragment (#v26) met JavaScript; zo'n fragment is voor een zoekmachine geen
// eigen pagina. Deze pagina's komen tijdens `npm run build` (scripts/postbuild.mjs) uit DEZELFDE gegevens die de atlas
// laadt (public/bijbelreis/geschiedenissen/*.js en indeling.js); er staat dus niets dubbel in de repository.
// Inhoud: titel, de korte vertelling in eigen woorden (het veld `uitleg`, met de tussenkoppen uit indeling.js),
// de uitleg (`betekenis`), wie erin voorkomen, de Bijbelverwijzing en een knop naar de geschiedenis in de atlas.
// Geen Bijbeltekst behalve de korte Statenvertaling-citaten die al in die velden staan.
// Uitleg: docs/bijbelreis-vindbaar/README.md. Getest in tests/bijbelreis-verhalen.test.ts.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

export const ORIGIN = "https://bijbelreis.nl";
// Bestanden in de build (dist/client); bijbelreis.nl serveert ze op /verhaal/<nr>-<slug> en /verhalen (worker/bijbelreis-app.ts).
export const MAP = "bijbelreis/verhaal";
export const OVERZICHT = "bijbelreis/verhalen.html";

/** Laadt de geschiedenissen, de indeling en de secties precies zoals de atlas ze laadt. */
export function laadGegevens(pub = "public") {
  const html = readFileSync(join(pub, "bijbelreis.html"), "utf8");
  const scripts = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => /^(geschiedenissen\/|indeling\.js$)/.test(s));
  const ctx = { window: {} };
  for (const s of scripts) runInNewContext(readFileSync(join(pub, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
  const BR = ctx.window.BR;
  // De indeling in secties staat in app.js (en het boekje); hier gelezen, niet overgetypt.
  const app = readFileSync(join(pub, "bijbelreis", "app.js"), "utf8");
  const m = /const SECTIES = (\[[\s\S]*?\]);/.exec(app);
  const secties = m ? runInNewContext(m[1]) : [];
  return { geschiedenissen: (BR.geschiedenissen || []).slice().sort((a, b) => a.nr - b.nr), indeling: BR.indeling || {}, secties };
}

/** ‘Droog door de Schelfzee’ → ‘droog-door-de-schelfzee’ (zonder accenten, alleen a–z, 0–9 en streepjes). */
export function slug(t) {
  return String(t)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'‘]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}
export const naam = (g) => `${g.nr}-${slug(g.t)}`;
export const pad = (g) => `/verhaal/${naam(g)}`;

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** De vertelling in onderdelen met tussenkop, zoals de atlas (app.js: vertelling) ze toont. */
export function onderdelen(g, indeling) {
  const delen = indeling[g.nr], tekst = g.uitleg || "";
  if (!delen || delen.length < 2) return [{ kop: null, t: tekst }];
  const begin = delen.map(([, b], i) => (i === 0 ? 0 : tekst.indexOf(b)));
  if (begin.some((x, i) => x < 0 || (i && x <= begin[i - 1]))) return [{ kop: null, t: tekst }];
  return delen.map(([kop], i) => ({ kop, t: tekst.slice(begin[i], begin[i + 1]).trim() }));
}

/** Korte beschrijving voor zoekresultaten: de eerste zinnen van de vertelling, hooguit ongeveer 160 tekens. */
export function beschrijving(g) {
  const tekst = (g.uitleg || "").replace(/\s+/g, " ").trim();
  const zinnen = tekst.match(/[^.!?]+[.!?]+(?:[’”)]+)?\s*/g) || [tekst];
  let uit = "";
  for (const z of zinnen) {
    if (uit && (uit + z).trim().length > 160) break;
    uit += z;
  }
  uit = uit.trim();
  if (uit.length > 165) uit = uit.slice(0, 157).replace(/\s+\S*$/, "") + " …";
  return uit;
}

const sectieVan = (secties, nr) => (secties.find(([, a, b]) => nr >= a && nr <= b) || [""])[0];

function kop({ titel, beschrijving: besch, url, css, type = "article" }) {
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(titel)}</title>
    <meta name="description" content="${esc(besch)}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#243d70" />
    <meta property="og:type" content="${type}" />
    <meta property="og:locale" content="nl_NL" />
    <meta property="og:site_name" content="Bijbelreis" />
    <meta property="og:title" content="${esc(titel)}" />
    <meta property="og:description" content="${esc(besch)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${ORIGIN}/bijbelreis/og.jpg" />
    <meta property="og:image:alt" content="Op reis door de Bijbel: de reiskaart van Abraham van Ur naar Kanaän" />
    <link rel="icon" href="/bijbelreis/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/bijbelreis/apple-touch-icon.png" />
    <link rel="stylesheet" href="/bijbelreis/verhaal.css?v=${css}" />
  </head>`;
}

const VOET = `<footer class="voet">
      <p>De Bijbelreis is een hulpmiddel náást de eigen Bijbel of kinderbijbel. De geschiedenissen zijn eigen navertellingen, gecontroleerd aan de Statenvertaling; lees ze zelf na in je Bijbel.</p>
    </footer>`;

/** Eén pagina per geschiedenis. Links zijn relatief (../#v26), zodat ze op bijbelreis.nl (/verhaal/…) én lokaal (/bijbelreis/verhaal/…) kloppen. */
export function verhaalPagina(g, { indeling, secties, css, vorige, volgende, totaal }) {
  const url = ORIGIN + pad(g);
  const sectie = sectieVan(secties, g.nr);
  const delen = onderdelen(g, indeling);
  const wie = (g.wie || []).filter(Boolean);
  const knop = `<a class="knop" href="../#v${g.nr}">Open deze geschiedenis in de Bijbelreis</a>`;
  return `${kop({ titel: `${g.t} — Bijbelreis`, beschrijving: beschrijving(g), url, css })}
  <body>
    <header class="kop"><a class="merk" href="../">Op reis door de <em>Bijbel</em></a></header>
    <main id="inhoud">
      <nav class="kruimel" aria-label="Waar ben je"><a href="../verhalen">Alle geschiedenissen</a>${sectie ? ` <span aria-hidden="true">›</span> <span>${esc(sectie)}</span>` : ""}</nav>
      <article aria-labelledby="titel">
        <p class="nr">Geschiedenis ${g.nr} van ${totaal}</p>
        <h1 id="titel">${esc(g.t)}</h1>
        <p class="lees">Lees in je Bijbel: <b>${esc(g.ref)}</b></p>
        <p class="actie">${knop}<span class="actie-uitleg">Met de kaart en vragen om te ontdekken.</span></p>
        <h2>Wat de Bijbel vertelt</h2>
        ${delen.map(({ kop: k, t }) => `${k ? `<h3>${esc(k)}</h3>\n        ` : ""}<p>${esc(t)}</p>`).join("\n        ")}
        ${g.betekenis ? `<h2>Uitleg</h2>\n        <p>${esc(g.betekenis)}</p>` : ""}
        ${wie.length ? `<h2>Wie komen erin voor?</h2>\n        <p>${wie.map(esc).join(", ")}</p>` : ""}
        <p class="actie">${knop}</p>
      </article>
      <nav class="buren" aria-label="Andere geschiedenissen">
        ${vorige ? `<a rel="prev" href="${naam(vorige)}"><span>Vorige</span>${vorige.nr}. ${esc(vorige.t)}</a>` : "<span></span>"}
        ${volgende ? `<a rel="next" href="${naam(volgende)}"><span>Volgende</span>${volgende.nr}. ${esc(volgende.t)}</a>` : "<span></span>"}
      </nav>
    </main>
    ${VOET}
  </body>
</html>
`;
}

/** Overzicht van alle geschiedenissen (/verhalen), per sectie, met een link naar elke pagina. */
export function overzichtPagina(geschiedenissen, { secties, css }) {
  const groepen = secties.map(([n, a, b]) => [n, geschiedenissen.filter((g) => g.nr >= a && g.nr <= b)]).filter(([, gs]) => gs.length);
  const rest = geschiedenissen.filter((g) => !secties.some(([, a, b]) => g.nr >= a && g.nr <= b));
  if (rest.length) groepen.push(["Overig", rest]);
  return `${kop({ titel: `Alle ${geschiedenissen.length} geschiedenissen uit de Bijbel — Bijbelreis`, beschrijving: `De ${geschiedenissen.length} geschiedenissen van de Bijbelreis, van de schepping tot Openbaring: per geschiedenis een korte navertelling, de Bijbelverwijzing en een link naar de kaart.`, url: ORIGIN + "/verhalen", css, type: "website" })}
  <body>
    <header class="kop"><a class="merk" href="./">Op reis door de <em>Bijbel</em></a></header>
    <main id="inhoud">
      <h1>Alle geschiedenissen</h1>
      <p class="intro">Van de schepping tot Openbaring. Kies een geschiedenis om te lezen waar ze in de Bijbel staat en wat er gebeurt, of <a href="./">open de Bijbelreis</a> om de reis op de kaart te volgen.</p>
      ${groepen
        .map(([n, gs]) => `<section aria-labelledby="s${gs[0].nr}">
        <h2 id="s${gs[0].nr}">${esc(n)}</h2>
        <ol class="lijst" start="${gs[0].nr}">
          ${gs.map((g) => `<li value="${g.nr}"><a href="verhaal/${naam(g)}">${esc(g.t)}</a> <span class="ref">${esc(g.ref)}</span></li>`).join("\n          ")}
        </ol>
      </section>`)
        .join("\n      ")}
    </main>
    ${VOET}
  </body>
</html>
`;
}

/** Alle pagina's: { "bijbelreis/verhaal/26-droog-door-de-schelfzee.html": "<!doctype html>…", … }. */
export function maakPaginas(gegevens, cssTekst) {
  const { geschiedenissen: G, indeling, secties } = gegevens;
  const css = createHash("sha256").update(cssTekst).digest("hex").slice(0, 10);
  const uit = {};
  G.forEach((g, i) => {
    uit[`${MAP}/${naam(g)}.html`] = verhaalPagina(g, { indeling, secties, css, vorige: G[i - 1], volgende: G[i + 1], totaal: G.length });
  });
  uit[OVERZICHT] = overzichtPagina(G, { secties, css });
  return uit;
}
