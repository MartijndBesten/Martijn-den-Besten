// Taferelen van de Bijbelreis: getekende, licht bewegende beelden bij een stap waar op de kaart niets beweegt.
// Dit bestand bevat de motor (BR.tafereel), de tekenbouwstenen (BR.tfTeken) en de standaardbeelden per soort plaats.
// Eigen taferelen staan in taferelen-ot.js (later ook taferelen-nt.js); welke stap welk beeld krijgt in taferelen-koppeling.js.
// Regels (wat wel en niet getekend wordt) en tekenafspraken: docs/bijbelreis-taferelen/README.md. Overzicht van alle
// beelden: node scripts/taferelen-overzicht.mjs.
//
// Register: BR.taferelen["<id>"] = { n: korte naam, label: wat je ziet (voor schermlezers), svg: inhoud van de tekening,
//   bij: (alleen standaardbeelden) één zin onder het beeld }.
// svg is de inhoud bínnen <svg viewBox="0 0 320 140">; de motor zet de svg-tag, de rol en het label er zelf omheen.
// De tekening is de eindstand. Beweging komt alleen uit de klassen tf-l-… (trage lus) en tf-e-… (eenmalig) in bijbelreis.css.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.taferelen = BR.taferelen || {};
(function () {
  // ---------- tekenbouwstenen (ook voor taferelen-ot.js en latere bestanden) ----------
  const op = (x, y, s) => `transform="translate(${x} ${y})${s && s !== 1 ? ` scale(${s})` : ""}"`;
  const kantelen = (w) => "h2" + "v-3h4v3h4".repeat(Math.floor((w - 2) / 8)) + ((w - 2) % 8 ? `h${(w - 2) % 8}` : "");
  const K = (BR.tfTeken = {
    op,
    // Rook die opstijgt vanaf (x, y): drie wolkjes na elkaar uit hetzelfde punt (in stilstand staan ze boven elkaar; zie de css).
    rook: (x, y, s = 1) => `<g class="k-rook" ${op(x, y, s)}><circle class="tf-l-rook" r="2.7"/><circle class="tf-l-rook tf-w4" r="2.7"/><circle class="tf-l-rook tf-w8" r="2.7"/></g>`,
    // Vlam met de voet op (x, y); w = wachtklasse (0–9) zodat vlammen niet gelijk bewegen.
    vlam: (x, y, s = 1, w = 0) => `<g ${op(x, y, s)}><g class="tf-l-vlam${w ? " tf-w" + w : ""}"><path class="k-terra" d="M0 0c-8-5-4-12-2-19 2 4 4 5 5 2 5 6 5 13-3 17z"/><path class="k-oker" d="M0 0c-5-4-2-8-1-12 4 4 6 8 1 12z"/><path class="k-okerz" d="M0 0c-2-2-1-4 0-6 2 2 2 4 0 6z"/></g></g>`,
    wolk: (x, y, s = 1, k = "k-wolk") => `<g class="${k}" ${op(x, y, s)}><ellipse rx="17" ry="6"/><circle cx="-7" cy="-4" r="7"/><circle cx="5" cy="-7" r="9"/></g>`,
    // Golfje (lijn) vanaf (x, y), b breed.
    golf: (x, y, b = 12) => `<path class="l-wit" d="M${x} ${y}q${b / 4}-2.4 ${b / 2} 0t${b / 2} 0"/>`,
    tent: (x, y, s = 1, k = "k-zand") => `<g ${op(x, y, s)}><path class="${k} o" d="M-18 0Q-7-6 0-17 7-6 18 0z"/><path class="k-hout2" d="M-4 0 0-9l4 9z"/><path class="l-hout2" d="M0-17v-4"/></g>`,
    boom: (x, y, s = 1) => `<g ${op(x, y, s)}><path class="l-hout2 dik" d="M0 0v-8M0-5l-6-7M0-6l6-6"/><ellipse class="k-salie2" cy="-15" rx="13" ry="6"/><ellipse class="k-salie2" cx="-4" cy="-19" rx="8" ry="4.5"/><ellipse class="k-salie" cx="-4" cy="-18" rx="5" ry="2"/></g>`,
    // Klein tentje voor in de verte (licht in gewicht).
    tentje: (x, y, k = "k-zand") => `<path class="${k} o2" d="M${x - 10} ${y}l10-10 10 10z"/><path class="k-hout2" d="M${x - 2} ${y}l2-5 2 5z"/>`,
    // Ruwe steen: een hoekige vorm met ronde hoeken; p is het pad vanaf het beginpunt.
    steen: (p, k = "k-zand") => `<path class="${k} o" d="${p}z"/>`,
    eik: (x, y, s = 1) => `<g ${op(x, y, s)}><path class="l-hout2 breed" d="M0 0v-12M0-9l-7-7M0-10l7-6"/><circle class="k-salie2" cx="-9" cy="-20" r="8"/><circle class="k-salie2" cx="9" cy="-20" r="8"/><circle class="k-salie2" cy="-27" r="10"/><circle class="k-salie" cx="-4" cy="-29" r="5"/><circle class="k-salie" cx="9" cy="-22" r="3.5"/></g>`,
    palm: (x, y, s = 1) => `<g ${op(x, y, s)}><path class="l-hout2 dik" d="M0 0q-2-10 1-20"/><path class="l-salie2 dik" d="M1-20q-9-5-14 1M1-20q-7-9-13-7M1-20q0-8-1-11M1-20q7-9 13-6M1-20q9-4 14 2"/></g>`,
    struik: (x, y, s = 1) => `<path class="k-salie" ${op(x, y, s)} d="M-7 0q-3-6 3-6 1-5 6-2 5-1 4 4 3 2 0 4z"/>`,
    schaap: (x, y, s = 1) => `<g ${op(x, y, s)}><path class="l-hout2" d="M-2.5 2v4M2.5 2v4"/><ellipse class="k-wit o2" rx="5" ry="3.4"/><circle class="k-hout2" cx="5" cy="-1.5" r="1.8"/></g>`,
    // Muur met kantelen, linksonder op (x, y + h).
    muur: (x, y, w, h, k = "k-zand") => `<path class="${k} o" d="M${x} ${y + h}v-${h}${kantelen(w)}v${h}z"/>`,
    toren: (x, y, w, h, k = "k-zand") => K.muur(x, y, w, h, k) + `<path class="k-hout2" d="M${x + w / 2 - 1} ${y + 7}h2v6h-2z"/>`,
    huis: (x, y, w, h, k = "k-duin") => `<path class="${k} o" d="M${x} ${y + h}v-${h}h${w}v${h}z"/><path class="k-hout2" d="M${x + w / 2 - 1.5} ${y + 5}h3v4h-3z"/>`,
    // Ommuurde stad met poort; (x, y) is de drempel van de poort.
    stad: (x, y, s = 1) => `<g ${op(x, y, s)}>` + K.huis(-58, -46, 22, 22) + K.huis(-34, -54, 18, 30, "k-wit") + K.huis(-12, -49, 24, 24) + K.huis(16, -57, 20, 32, "k-wit") + K.huis(38, -44, 22, 20) +
      K.muur(-62, -27, 124, 27) + `<path class="l-zand2" d="M-60-13h38M22-13h38M-60-20h38M22-20h38"/>` + K.toren(-76, -39, 16, 39) + K.toren(60, -39, 16, 39) + K.toren(-22, -37, 12, 37) + K.toren(10, -37, 12, 37) +
      `<path class="k-hout2" d="M-7 0v-13a7 7 0 0 1 14 0V0z"/></g>`,
    // Heuvels in de verte.
    verte: `<path class="k-berg2" d="M0 80q42-24 86-9t78-10 70 12 86-10v62H0z"/>`,
  });

  // ---------- standaardbeelden per soort plaats ----------
  // De ids stad, berg, water, put, kamp, altaar, tent en gebied horen bij het veld t van een plaats (plaatsen.js);
  // rivier wordt alleen via BR.beeldSoort of een koppeling gekozen. Deze ids zijn gereserveerd.
  Object.assign(BR.taferelen, {
    stad: { n: "Een stad", bij: "Zo zag een stad er toen vaak uit: een muur eromheen en een poort.",
      label: "Tekening van een stad op een heuvel, met een muur eromheen, torens en een poort. Uit twee huizen stijgt rook op.",
      svg: K.verte + `<path class="k-land" d="M0 112q60-28 160-28t160 26v30H0z"/>` + K.stad(160, 101) + `<path class="k-duin" d="M153 101h14l18 39h-50z"/>` +
        K.boom(52, 116, 1.1) + K.boom(34, 122, 0.8) + K.palm(268, 116, 1.1) + K.struik(96, 124) + K.struik(232, 128, 0.8) + K.rook(135, 45) + K.rook(186, 42) },
    berg: { n: "Een berg", bij: "Een hoge berg in een droog land.",
      label: "Tekening van een hoge, kale berg met lagere bergen erachter. Er drijft langzaam een wolk voorbij.",
      svg: `<path class="k-berg2" d="M0 98 44 64l26 20 40-40 34 36 40-26 50 44 40-28 46 30v40H0z"/><path class="k-berg" d="M48 126 150 20l30 34 16-12 86 84z"/><path class="k-schaduw" d="M150 20l30 34 16-12 86 84H180l-10-46z"/>` +
        `<g class="tf-l-drijf">${K.wolk(222, 40)}</g><path class="k-land" d="M0 118q80-14 160-6t160-8v36H0z"/><path class="k-zand" d="M0 132q90-12 180-4t140-6v18H0z"/>` + K.struik(40, 124) + K.struik(252, 120, 1.2) + K.struik(284, 130, 0.8) },
    water: { n: "Water", bij: "Een groot water met het land aan de overkant.",
      label: "Tekening van een groot water met zachte golven. Aan de overkant liggen heuvels; vooraan een strand met riet.",
      svg: `<path class="k-berg2" d="M0 58q50-20 110-10t100-8 110 14v12H0z"/><path class="k-groen" d="M0 62q60-8 120-3t200-2v8H0z"/><path class="k-zee" d="M0 64h320v76H0z"/><path class="k-zee2" d="M0 98q80-8 160 0t160-4v46H0z"/>` +
        `<g class="tf-l-golf">${K.golf(30, 76) + K.golf(104, 72) + K.golf(176, 80) + K.golf(244, 74) + K.golf(292, 86)}</g><g class="tf-l-golf tf-w5">${K.golf(60, 106, 16) + K.golf(150, 114, 16) + K.golf(226, 104, 16) + K.golf(276, 122, 16)}</g>` +
        `<path class="k-zand" d="M0 120q50-12 96 2t64 18H0z"/><path class="l-salie2" d="M20 122v-15M25 124v-20M30 124v-13M118 136v-13M124 138v-9"/>` },
    rivier: { n: "Een rivier", bij: "Water dat door het land stroomt. Langs het water is het groen.",
      label: "Tekening van een rivier die door een droog land naar voren stroomt. Langs het water groeien riet en palmbomen.",
      svg: `<path class="k-berg2" d="M0 64q70-16 150-8t170-6v22H0z"/><path class="k-land" d="M0 70h320v70H0z"/><path class="k-groen" d="M112 70c34 20-84 32-56 70h202c-44-32 34-58-66-70z"/><path class="k-zee" d="M130 70c26 20-66 34-34 70h116c-38-34 22-56-54-70z"/>` +
        `<g class="tf-l-golf">${K.golf(140, 84, 10) + K.golf(128, 104, 14) + K.golf(160, 96, 12) + K.golf(120, 126, 16) + K.golf(166, 120, 16)}</g>` +
        `<path class="l-salie2" d="M92 110v-13M97 112v-17M102 113v-11M222 104v-12M227 106v-16M232 106v-10"/>` + K.palm(58, 108, 1.2) + K.palm(76, 114, 0.9) + K.palm(262, 100, 1) + K.struik(286, 122) + K.struik(30, 128, 0.9) },
    put: { n: "Een put", bij: "Een put met water. In een droog land is dat een kostbare plek.",
      label: "Tekening van een put met een rand van stenen. Ernaast staan een kruik en een drinkbak met water; verderop een boom.",
      svg: K.verte + `<path class="k-land" d="M0 94q90-12 180-4t140-6v56H0z"/><path class="k-zand" d="M0 120q100-12 200-2t120-6v28H0z"/>` + K.boom(256, 112, 1.9) +
        `<path class="k-zand o" d="M128 96v17a32 9 0 0 0 64 0V96z"/><path class="l-zand2" d="M129 105q31 9 62 0M144 105v13M160 107v14M176 105v13M152 99v7M168 99v7"/><ellipse class="k-duin o" cx="160" cy="96" rx="32" ry="9"/><ellipse class="k-water2" cx="160" cy="96.5" rx="23" ry="5.5"/>` +
        `<path class="l-hout2" d="M212 104q-6-1-5 5"/><path class="k-terra o" d="M212 122c-7-4-7-13-2-16v-4h9v4c5 3 5 12-2 16z"/>` +
        `<path class="k-zand o" d="M62 112h46l-4 11H66z"/><path class="k-zee" d="M65.5 114h39l-1 3h-37z"/><g class="tf-l-golf">${K.golf(74, 116, 8) + K.golf(88, 116, 8)}</g>` + K.struik(32, 126) },
    kamp: { n: "Een kamp", bij: "Een kamp: tenten die je weer kunt afbreken om verder te trekken.",
      label: "Tekening van een kamp met tenten in een vlak, droog land. In het midden brandt een vuurtje waar rook van opstijgt.",
      svg: K.verte + `<path class="k-land" d="M0 90q90-10 180-4t140-4v58H0z"/><path class="k-zand" d="M0 120q100-10 200-2t120-6v28H0z"/>` +
        [30, 76, 122, 164, 206, 252, 298].map((x, i) => K.tentje(x, 100 - (i % 2) * 3, i % 2 ? "k-zand" : "k-hout")).join("") +
        K.tent(96, 114, 0.85) + K.tent(214, 113, 0.85, "k-hout") + K.tent(292, 116, 0.8) + K.tent(22, 116, 0.8, "k-hout") + K.tent(58, 134, 1.25, "k-hout") + K.tent(256, 134, 1.3) +
        `<path class="k-steen o2" d="M144 131q0-4 5-4h14q5 0 5 4z"/>` + K.vlam(152, 128, 0.7, 3) + K.vlam(160, 128, 0.9) + K.rook(157, 111, 1.1) },
    altaar: { n: "Een altaar", bij: "Een altaar van stenen. Daar werd een offer gebracht en de Naam van de HEERE aangeroepen.",
      label: "Tekening van een altaar van opgestapelde, ruwe stenen op een heuvel. Er ligt hout op; er brandt een vuur en er stijgt rook op.",
      svg: K.verte + `<path class="k-land" d="M0 120q70-14 160-14t160 12v22H0z"/>` + K.boom(56, 116, 1.3) + K.struik(254, 120, 1.1) + K.struik(92, 128, 0.8) +
        K.steen("M118 114l-3-9 7-7 12 1 5 8-3 7") + K.steen("M137 114l1-12 9-4 10 3 1 10-4 3", "k-steen") + K.steen("M158 114l-2-11 8-5 12 2 3 10-3 4", "k-duin") + K.steen("M180 114l-1-10 8-5 11 3 4 8-4 4") +
        K.steen("M127 98l-1-9 7-5 12 2 2 9-5 4", "k-duin") + K.steen("M148 97l-1-10 8-4 11 2 2 10-6 3") + K.steen("M169 98l0-9 7-5 11 3 2 8-5 3", "k-steen") + K.steen("M138 84l0-8 7-4 10 2 1 8-4 2", "k-steen") + K.steen("M157 83l-1-8 8-4 11 3 0 7-5 3", "k-duin") +
        `<path class="l-hout dik" d="M140 72h36M146 68h25"/>` + K.vlam(152, 67, 0.9, 2) + K.vlam(165, 67, 1.2) + K.rook(160, 47, 1.4) },
    tent: { n: "Een tent", bij: "Een tent bij de bomen. Wie in tenten woont, kan verder trekken.",
      label: "Tekening van een grote tent met scheerlijnen, onder eikenbomen. Erachter heuvels; er drijft langzaam een wolk voorbij.",
      svg: K.verte + `<g class="tf-l-drijf">${K.wolk(236, 30)}</g><path class="k-land" d="M0 96q90-12 180-4t140-6v54H0z"/><path class="k-zand" d="M0 124q100-10 200-2t120-6v24H0z"/>` + K.eik(62, 116, 1.55) + K.eik(110, 106, 1.05) + K.tent(282, 106, 0.7) +
        `<path class="l-hout2" d="M150 126l-14 4M252 126l14 4M200 82v-6"/><path class="k-hout o" d="M146 126q34-12 54-44 20 32 54 44z"/><path class="l-hout2" d="M172 110q16-10 28-28M228 110q-16-10-28-28"/><path class="k-hout2" d="M190 126l10-26 10 26z"/>` + K.struik(300, 130, 0.9) },
    gebied: { n: "Een landstreek", bij: "Een landstreek: heuvels, dalen en een weg.",
      label: "Tekening van een heuvelachtig land met een weg, een paar bomen en struiken. Er drijven langzaam wolken voorbij.",
      svg: `<g class="tf-l-drijf">${K.wolk(76, 30) + K.wolk(238, 22, 0.8)}</g><path class="k-berg2" d="M0 72q50-24 100-10t90-12 130 10v80H0z"/><path class="k-groen" d="M0 90q70-20 150-8t170-10v68H0z"/><path class="k-land" d="M0 108q90-18 180-6t140-8v46H0z"/><path class="k-zand" d="M0 128q100-14 190-4t130-8v24H0z"/>` +
        `<path class="l-duin breed" d="M146 142c8-16 62-22 44-38s-44-10-34-24"/>` + K.boom(70, 100, 1.1) + K.boom(90, 104, 0.8) + K.boom(254, 98, 1) + K.struik(222, 112) + K.struik(36, 122, 1.1) + K.struik(288, 124, 0.9) },
  });

  // ---------- motor ----------
  const SOORTEN = ["stad", "berg", "water", "put", "kamp", "altaar", "tent"];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const OPNIEUW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v5h5"/></svg>';
  // Welk beeld hoort bij deze stap? Geeft { id, tf, tekst } of null.
  // Alleen een eigen koppeling (BR.beelden) geeft een beeld; t: "" betekent bewust geen beeld.
  // Tot 16-11-2026 kreeg een stap zonder reis en zonder koppeling het standaardbeeld van de soort van zijn eerste plaats
  // (‘Algemene tekening’). Dat is uitgezet: zo'n tekening zei niets over wat de tekst vertelt (een rivier bij ‘Twee dromen
  // in de cel’). De standaardbeelden blijven in het register; koppel er bewust een als het bij de tekst van de stap past.
  function van(s) {
    if (!s) return null;
    const T = BR.taferelen, k = (BR.beelden || {})[s.key];
    return k && T[k.t] ? { id: k.t, tf: T[k.t], tekst: k.tekst || "" } : null;
  }
  // Beweging loopt alleen zolang het beeld in beeld is.
  let kijker = null;
  const gevolgd = [];
  function volg(f) {
    if (!("IntersectionObserver" in window)) { f.classList.add("tf-loopt"); return; }
    kijker = kijker || new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("tf-loopt", e.isIntersecting)), { threshold: 0.35 });
    for (let i = gevolgd.length - 1; i >= 0; i--) if (!gevolgd[i].isConnected) { kijker.unobserve(gevolgd[i]); gevolgd.splice(i, 1); }
    gevolgd.push(f); kijker.observe(f);
  }
  function maak(b) {
    const f = document.createElement("figure"), tf = b.tf;
    const eens = /class="[^"]*\btf-e-/.test(tf.svg) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    f.className = "tafereel" + (b.algemeen ? " algemeen" : ""); f.dataset.tf = b.id;
    f.innerHTML = `<div class="tf-kader"><svg class="tf-svg" viewBox="0 0 320 140" role="img" aria-label="${esc(tf.label)}" focusable="false">${tf.svg}</svg>` +
      (eens ? `<button type="button" class="tf-opnieuw" aria-label="Laat de beweging nog een keer zien" title="Nog een keer">${OPNIEUW}</button>` : "") + "</div>" +
      `<figcaption>${b.algemeen ? `<b>${esc(b.plaats)}</b> ${esc(tf.bij || tf.n)} <small>Algemene tekening</small>` : `<b>${esc(tf.n)}</b> ${esc(b.tekst)}`}</figcaption>`;
    // Een eenmalige beweging opnieuw zien: de tekening vervangen door een kopie start de beweging opnieuw.
    if (eens) f.querySelector(".tf-kader").addEventListener("click", () => { const svg = f.querySelector(".tf-svg"); svg.replaceWith(svg.cloneNode(true)); });
    volg(f);
    return f;
  }
  BR.tafereel = {
    van, maak,
    // Stapkaart en Voorlezen: het beeld direct ná het anker (de tekst); een vorig beeld verdwijnt.
    bijStap(anker, s) {
      if (!anker) return;
      const oud = anker.nextElementSibling;
      if (oud && oud.classList.contains("tafereel")) oud.remove();
      const b = van(s);
      if (b) anker.after(maak(b));
    },
    // Verhaalweergave: bij elk onderdeel met een kaartstap het beeld van die stap (elk beeld één keer);
    // heeft de vertelling geen onderdelen, dan het eerste beeld van de stappen onder de vertelling.
    inVerhaal(box, steps, stapVan) {
      const gehad = new Set();
      box.querySelectorAll(".vdeel [data-stapkaart]").forEach((knop) => {
        const b = van(stapVan(knop.dataset.stapkaart));
        if (b && !gehad.has(b.id)) { gehad.add(b.id); knop.before(maak(b)); }
      });
      const v = box.querySelector("#vVertelling"), b = !gehad.size && v && steps.map(van).find(Boolean);
      if (b) v.after(maak(b));
    },
  };
})();
