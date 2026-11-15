// Eigen taferelen bij het Nieuwe Testament. Motor, bouwstenen (BR.tfTeken) en standaardbeelden: taferelen.js.
// Regels en tekenafspraken: docs/bijbelreis-taferelen/README.md. Bij elk tafereel staat de tekst waarmee het is gecontroleerd
// (Statenvertaling: node scripts/sv.mjs "<verwijzing>"). De Heere Jezus, God de Vader, de Heilige Geest en engelen worden
// niet afgebeeld, ook niet als silhouet, hand, schaduw of licht in mensvorm; in deze reeks staat geen enkel mens.
// Getekend is de plek: het veld, het huis, het schip, de hof, het graf. Welke stap welk beeld krijgt: taferelen-koppeling-nt.js.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.taferelen = BR.taferelen || {};
(function () {
  const K = BR.tfTeken;
  // Nacht: nachtlucht erachter, het land in gewone kleuren, daaroverheen een sluier; lichten en sterren komen ná de sluier.
  const nacht = `<path class="k-nacht" d="M0 0h320v140H0z"/>`, sluier = `<path class="k-sluier" d="M0 0h320v140H0z"/>`;
  const sterren = (p) => `<path class="k-okerz" d="${p.map(([x, y, r = 0.9]) => `M${x} ${y}a${r} ${r} 0 1 0 .1 0`).join("")}"/>`;
  // Olijfboom: een korte, gedraaide stam en een brede, zilvergroene kruin.
  const olijf = (x, y, s = 1) => `<g ${K.op(x, y, s)}><path class="k-hout2" d="M-5 0q3-6-1-11l-6-5 2-3 6 4q1-4-1-8l4-1q1 3 2 7l6-7 3 2-6 8q-2 6 2 14z"/><ellipse class="k-salie2" cx="-9" cy="-20" rx="11" ry="7"/><ellipse class="k-salie2" cx="9" cy="-21" rx="11" ry="7.5"/><ellipse class="k-salie2" cy="-27" rx="10" ry="6"/><ellipse class="k-salie" cx="-4" cy="-28" rx="6" ry="2.5"/><ellipse class="k-salie" cx="10" cy="-23" rx="5" ry="2"/></g>`;
  // Vissersschip (Markus 1:19; 4:36): houten romp, mast, ra met het opgebonden zeil. (x, y) is het midden van de kiel.
  const schip = (x, y, s = 1) => `<g ${K.op(x, y, s)}><path class="l-zand2" d="M2-40-32-12M2-40 34-15"/><path class="l-hout2 dik" d="M2-8v-33"/><path class="k-duin o2" d="M-13-36q15 7 30 0z"/><path class="l-hout2" d="M-14-36h32"/><path class="k-hout o" d="M-34-12Q0-4 36-15 30 0 18 0h-38q-10 0-14-12z"/><path class="l-hout2" d="M-31-8Q0 0 32-10"/></g>`;
  // Een net: een doorschijnend vlak met mazen en een rij drijvers langs de rand; p is de omtrek, m de mazen, d de drijvers.
  const net = (p, m, d) => `<path class="k-stof o2" d="${p}"/><path class="l-zand2" d="${m}"/>` + d.map(([x, y]) => `<circle class="k-terra" cx="${x}" cy="${y}" r="1.5"/>`).join("");
  const vis = (x, y) => `<path class="k-zee2 o" d="M${x} ${y}q9-8 20 0-11 8-20 0zm20 0 6-5v10z"/><circle class="k-hout2" cx="${x + 4.5}" cy="${y - 1}" r="1"/>`;
  const brood = (x, y) => `<ellipse class="k-zand o" cx="${x}" cy="${y}" rx="10.5" ry="6.5"/><path class="l-hout2" d="M${x - 6} ${y - 2}l2 3.5M${x - 1.5} ${y - 3}l2 4M${x + 3} ${y - 2}l2 3.5"/>`;
  const korf = (x, y) => `<path class="k-zand o2" d="M${x - 8} ${y - 11}q2-6 5-4 2-4 5-1 3-3 6 5z"/><path class="k-hout o" d="M${x - 9} ${y - 11}h18l-2.5 11h-13z"/><path class="l-hout2" d="M${x - 8} ${y - 7}h16M${x - 7.5} ${y - 3.5}h15"/>`;
  // Een kleed en een tak op de weg (Mattheüs 21:8): een vierhoek, en een nerf met blaadjes.
  const kleed = (p, k) => `<path class="${k} o2" d="${p}z"/>`;
  const tak = (x, y, s = 1) => `<g ${K.op(x, y, s)}><path class="l-salie2 dik" d="M0 0q9-6 20-3"/><path class="l-salie2" d="M4-2l1-5M9-4l1-5M14-4l2-4M5-1l3 3M10-3l3 3M15-3l3 2"/></g>`;
  // Het graf (Mattheüs 27:60; Johannes 19:41): in een steenrots uitgehouwen, in een hof, met een grote steen; open = afgewenteld.
  const graf = (open) => `<path class="k-groen" d="M0 104q80-12 170-6t150-4v46H0z"/><path class="k-zand o" d="M112 124l6-26 18-12 4-22 28-10 12-14 42-6 26 10 30-2 18 18 16 6 8 22v38z"/><path class="k-schaduw" d="M278 54l18 18 16 6 8 22v24h-34l-4-40z"/>` +
    `<path class="l-zand2" d="M136 86l14 4M168 54l10 8M222 32l-4 12M282 96l-10 6M130 108l10-2"/><path class="k-duin o" d="M180 122V92q4-16 30-16t30 16v30z"/><path class="k-hout2" d="M197 122V98a13 13 0 0 1 26 0v24z"/><path class="k-duin" d="M186 122h48l24 18h-96z"/>` +
    `<circle class="k-steen o" cx="${open ? 166 : 210}" cy="103" r="19"/><path class="l-zand2" d="M${open ? 155 : 199} 97q7-6 14-2M${open ? 160 : 204} 112q7 3 14-2"/>` +
    olijf(50, 122, 1.7) + olijf(92, 108, 1) + K.struik(126, 132, 1.2) + K.struik(282, 132, 1.3) + K.struik(20, 132) + `<path class="l-salie2" d="M300 128v-10M306 130v-14M312 130v-9"/>`;
  // Kandelaar (Openbaring 1:12): voet, steel met knoop en een schaal; goud. De vlam komt er los bovenop.
  const kandelaar = (x, y, s, w) => `<g ${K.op(x, y, s)}><path class="k-oker o" d="M-9 0q0-5 7-6h4q7 1 7 6zM-2-6v-20h4v20zM-8-33h16q-1 7-8 7t-8-7z"/><ellipse class="k-oker o" cy="-16" rx="4.5" ry="2.5"/><path class="l-licht" d="M-5-31h5M-0.5-9v-3M-0.5-21v-3"/>${K.vlam(0, -33, 0.6, w)}</g>`;
  // Schakels van een keten, van (x, y) naar beneden.
  const keten = (x, y, n) => `<path class="l-hout2" d="${Array.from({ length: n }, (_, i) => `M${x} ${y + i * 5.5}a2 3 0 1 0 .1 0`).join("")}"/>`;
  // Het meer van Galilea met de heuvels aan de overkant.
  const meer = `<path class="k-berg2" d="M0 56q50-20 110-10t100-8 110 14v14H0z"/><path class="k-groen" d="M0 60q60-8 120-3t200-2v8H0z"/><path class="k-zee" d="M0 62h320v78H0z"/>`;

  Object.assign(BR.taferelen, {
    // Lukas 2:8–9: herders in het veld hielden de nachtwacht over hun kudde; de heerlijkheid des Heeren omscheen hen.
    // De engel en de herders zijn niet getekend; het licht is geen gestalte maar een schijnsel over het veld. Negen schapen: de tekst noemt geen aantal.
    "herders-veld": { n: "Het veld van de herders",
      label: "Het is nacht in het veld bij Bethlehem. Een kudde schapen staat in het gras. In de verte liggen de huizen van Bethlehem. Over het veld valt een helder licht uit de hemel.",
      svg: nacht + `<path class="k-berg2" d="M0 76q50-22 110-8t100-12 110 8v76H0z"/><path class="k-duin o2" d="M232 60v-8h10v8zM244 60V48h9v12zM255 60v-9h11v9zM268 60v-6h9v6z"/><path class="k-groen" d="M0 88q80-16 170-8t150-10v70H0z"/><path class="k-salie" d="M0 118q100-14 200-4t120-8v34H0z"/>` + sluier +
        sterren([[20, 14], [52, 30, 0.7], [84, 10], [112, 34, 0.7], [236, 12, 0.7], [270, 28], [300, 10, 0.8], [206, 22, 0.7], [38, 50, 0.6], [290, 44, 0.6]]) + `<path class="k-okerz" d="M247 51h2v3h-2zM259 54h2v3h-2z"/>` +
        `<g class="tf-e-in tf-w2"><path class="k-licht" d="M112 0h76l68 100H56z"/><path class="k-licht tf-l-gloed" d="M134 0h32l48 100H98z"/><ellipse class="k-licht" cx="156" cy="106" rx="104" ry="22"/></g>` +
        K.schaap(96, 104, 1.5) + K.schaap(132, 96, 1.3) + K.schaap(176, 102, 1.5) + K.schaap(214, 96, 1.2) + K.schaap(150, 116, 1.7) + K.schaap(200, 118, 1.6) + K.schaap(112, 122, 1.6) + K.schaap(238, 110, 1.4) + K.schaap(66, 114, 1.4) },
    // Mattheüs 2:9–11: de ster ging hun voor, totdat zij kwam en stond boven de plaats waar het Kindeken was; ‘in het huis gekomen zijnde’.
    // Geen aantal wijzen, geen kamelen (de tekst noemt ze niet), en het Kind is niet getekend: alleen het huis en de ster.
    "ster-bethlehem": { n: "De ster boven Bethlehem",
      label: "Het is donker in Bethlehem. Tussen de huizen staat één huis met licht in de deur en het venster. Een heldere ster komt aan de hemel aan en blijft recht boven dat huis staan.",
      svg: nacht + K.verte + `<path class="k-land" d="M0 104q80-14 160-8t160-8v52H0z"/>` + K.huis(40, 76, 26, 26) + K.huis(68, 66, 22, 36, "k-wit") + K.huis(92, 80, 26, 22) + K.huis(120, 72, 22, 30, "k-wit") +
        K.huis(206, 70, 24, 30) + K.huis(232, 80, 26, 20, "k-wit") + K.huis(260, 72, 22, 28) + `<path class="k-wit o" d="M148 102V62h52v40z"/><path class="l-zand2" d="M148 68h52"/><path class="k-duin" d="M166 102h14l24 38h-66z"/>` +
        K.palm(24, 108, 1.1) + olijf(298, 112, 0.9) + K.struik(96, 126) + sluier +
        sterren([[18, 20], [46, 40, 0.7], [74, 12, 0.7], [104, 32], [136, 14, 0.6], [228, 18, 0.7], [258, 40, 0.8], [292, 14], [306, 52, 0.6]]) +
        `<path class="k-licht" d="M166 102h14l16 26h-48z"/><path class="k-okerz" d="M166 102V86a7 7 0 0 1 14 0v16zM186 72h6v7h-6z"/>` +
        `<g class="tf-e-kom"><circle class="k-licht tf-l-gloed" cx="173" cy="30" r="17"/><circle class="k-licht" cx="173" cy="30" r="9"/><path class="k-okerz" d="M173 16l1 11.5 3.5-2-2 3.5 11.5 1-11.5 1 2 3.5-3.5-2-1 11.5-1-11.5-3.5 2 2-3.5-11.5-1 11.5-1-2-3.5 3.5 2z"/></g>` },
    // Markus 1:16–20 en Lukas 5:2: twee schepen aan de oever; de vissers waren eruit gegaan en spoelden de netten; ‘hun netten verlatende’.
    vissersboot: { n: "Schepen aan het meer",
      label: "Aan de oever van het meer van Galilea liggen twee vissersschepen, één op het strand en één in het water. Op het zand liggen netten te drogen. Het water golft zacht.",
      svg: meer + `<path class="k-zee2" d="M0 88q80-8 160 0t160-4v56H0z"/><g class="tf-l-golf">${K.golf(30, 72) + K.golf(112, 70) + K.golf(262, 74) + K.golf(150, 82, 16) + K.golf(290, 96, 16)}</g>` + schip(222, 98, 1.25) +
        `<g class="tf-l-golf tf-w5">${K.golf(184, 99, 16) + K.golf(214, 101, 16) + K.golf(244, 99, 16)}</g><path class="k-zand" d="M0 100q60-10 120 2t90 14 110 4v20H0z"/>` + schip(70, 118, 1.35) + `<path class="k-zand" d="M22 118q50-5 100 0v6H22z"/>` +
        net("M140 134q-4-12 10-15 6-10 22-6 14-8 28 0 16-2 20 8 12 2 10 13z", "M148 132l12-14M162 133l14-18M178 133l14-18M194 133l14-16M210 133l12-12M146 122l14 11M158 116l20 17M174 112l22 20M192 112l22 20M210 117l16 15", [[142, 124], [152, 118], [163, 114], [176, 112], [189, 111], [201, 113], [213, 117], [222, 122]]) +
        `<path class="l-salie2" d="M300 128v-14M305 130v-18M310 130v-12"/>` },
    // Markus 4:37–39: een grote storm van wind, de baren sloegen over in het schip; ‘Zwijg, wees stil!’ En de wind ging liggen en er werd grote stilte.
    "storm-stil": { n: "De storm op het meer wordt stil",
      label: "Een schip op het meer van Galilea. Eerst is de lucht donker, de golven zijn hoog en het schip slingert heen en weer. Dan trekt de storm weg: het water wordt glad, de lucht licht, en het schip ligt stil.",
      svg: `<g class="tf-l-drijf">${K.wolk(252, 26, 0.9)}</g>` + meer + `<g class="tf-l-golf">${K.golf(40, 76) + K.golf(120, 72) + K.golf(244, 76) + K.golf(292, 88)}</g>` +
        `<g class="tf-e-dooft tf-w3"><path class="k-donker" d="M0 0h320v70H0z"/><g class="k-donker2"><path d="M0 62q50-22 110-12t100-8 110 14v14H0z"/><circle cx="12" cy="6" r="20"/><circle cx="44" cy="14" r="19"/><circle cx="78" cy="6" r="22"/><circle cx="112" cy="16" r="19"/><circle cx="146" cy="6" r="22"/><circle cx="180" cy="15" r="20"/><circle cx="214" cy="6" r="22"/><circle cx="248" cy="16" r="19"/><circle cx="282" cy="7" r="22"/><circle cx="312" cy="14" r="18"/></g>` +
        `<path class="k-water2" d="M0 58h320v82H0z"/><path class="k-water" d="M0 82q20-16 40-2t40 0 40 0 40 0 40 0 40 0 40 0 40 0v60H0z"/></g>` +
        `<g class="tf-e-deint">${schip(160, 104, 1.6)}</g><path class="k-zee2" d="M0 100q80-6 160 2t160-4v42H0z"/><g class="tf-l-golf tf-w5">${K.golf(60, 112, 16) + K.golf(150, 120, 16) + K.golf(226, 110, 16) + K.golf(276, 126, 16)}</g>` +
        `<g class="tf-e-dooft tf-w3"><path class="k-water2" d="M0 104q24-22 48-4t46 2 46-4 46 4 46-2 46 0 42 0v44H0z"/><path class="l-wit" d="M10 98q14-10 26-4M100 100q14-10 26-4M196 98q14-10 26-4M284 98q14-10 26-4M56 122q12-6 22 0M150 126q12-6 22 0M240 122q12-6 22 0"/></g>` },
    // Johannes 6:9–13: vijf gerstebroden en twee visjes; er was veel gras in die plaats; twaalf korven met brokken die overgeschoten waren.
    "broden-vissen": { n: "Vijf broden, twee vissen, twaalf korven",
      label: "Op het groene gras bij het meer liggen vijf gerstebroden en twee visjes. Daarnaast komen er twaalf korven bij te staan, in twee rijen van zes, vol met de brokken die overgebleven zijn.",
      svg: `<path class="k-berg2" d="M0 50q60-18 130-8t190-10v26H0z"/><path class="k-zee" d="M0 54h320v24H0z"/>${K.golf(40, 62) + K.golf(150, 60) + K.golf(250, 64)}<path class="k-groen" d="M0 76q70-16 150-10t170-8v82H0z"/><path class="k-salie" d="M0 106q90-14 190-6t130-8v48H0z"/>` +
        brood(36, 110) + brood(62, 102) + brood(88, 110) + brood(48, 125) + brood(76, 125) + vis(108, 100) + vis(102, 124) +
        [[162, 98, 2], [162, 122, 6]].map(([x, y, w]) => [0, 1].map((h) => `<g class="tf-e-in tf-w${w + h * 2}">${[0, 1, 2].map((i) => korf(x + (h * 3 + i) * 25, y)).join("")}</g>`).join("")).join("") },
    // Mattheüs 3:1–6: Johannes predikte in de woestijn van Judea; zij werden van hem gedoopt in de Jordaan.
    "jordaan-woestijn": { n: "De Jordaan in de woestijn",
      label: "Een kaal, droog bergland: de woestijn van Judea. Door het dal stroomt de Jordaan, met riet en struiken langs het water. Een pad loopt door het zand naar de oever.",
      svg: `<path class="k-berg2" d="M0 60 38 40l32 16 36-26 40 28 36-18 50 24 40-20 48 20v40H0z"/><path class="k-zand" d="M0 74q34-16 64-6t52-10 60 12 60-8 84 6v30H0z"/><path class="l-zand2" d="M44 66l-5 12M116 60l5 13M178 70l-3 9M240 64l4 11M290 70l-4 9"/>` +
        `<path class="k-land" d="M0 82q90-8 180-2t140-6v66H0z"/><path class="k-groen" d="M0 88q80-10 170 0t150-8v34q-60 12-150 4T0 120z"/>` + K.palm(206, 90, 0.9) + K.palm(54, 92, 0.8) + K.palm(70, 90, 0.6) + K.struik(140, 90, 0.9) + K.struik(292, 86, 0.9) +
        `<path class="l-salie2" d="M20 96v-11M25 96v-15M30 96v-9M100 94v-10M105 94v-14M256 92v-11M261 92v-15M266 92v-9"/><path class="k-zee" d="M0 96q80-10 170 0t150-8v22q-60 12-150 4T0 116z"/><path class="k-zee2" d="M0 106q80-8 170 2t150-8v10q-60 12-150 4T0 116z"/>` +
        `<g class="tf-l-golf">${K.golf(36, 101) + K.golf(120, 100) + K.golf(214, 103) + K.golf(284, 96) + K.golf(70, 110, 16) + K.golf(240, 108, 16)}</g><path class="k-zand" d="M0 116q80 8 170 2t150-8v30H0z"/><path class="k-duin" d="M250 140q-34-10-76-22h30q44 8 86 22z"/>` +
        `<path class="l-salie2" d="M56 120v-12M61 122v-16M66 122v-10M132 124v-11M137 125v-15M286 118v-12M291 119v-16M296 119v-10"/>` + K.struik(108, 126, 1.1) + K.steen("M30 136l-1-6 5-4 8 1 3 5-3 4") + K.steen("M222 136l-2-6 6-4 8 1 3 5-2 4", "k-steen") },
    // Johannes 4:5–6, 11, 28, 35: Sichar, de fontein Jakobs; ‘de put is diep’; de vrouw verliet haar watervat; de velden wit om te oogsten.
    jakobsput: { n: "De put van Jakob bij Sichar",
      label: "De put van Jakob: een brede rand van stenen om een diepe, donkere put. Ernaast staat een waterkruik die is blijven staan. Verderop liggen korenvelden en de stad Sichar, onder aan een berg.",
      svg: `<g class="tf-l-drijf">${K.wolk(250, 26, 0.9)}</g><path class="k-berg2" d="M0 86 54 56l34 14 52-42 46 36 30-12 104 42v20H0z"/>` + K.stad(64, 88, 0.36) + `<path class="k-okerz" d="M0 90q90-10 180-5t140-5v22H0z"/><path class="l-oker" d="${[16, 34, 104, 122, 140, 214, 232, 250, 286, 304].map((x) => `M${x} 99v-6m4 7v-6m4 5v-6`).join("")}"/>` +
        `<path class="k-land" d="M0 102q90-10 180-4t140-6v48H0z"/><path class="k-zand" d="M0 124q100-12 200-2t120-6v24H0z"/><path class="k-zand" d="M140 108q-40-6-70-18h7q28 10 72 16z"/>` + olijf(270, 118, 1.7) +
        `<path class="k-zand o" d="M118 100v18a34 9.5 0 0 0 68 0v-18z"/><path class="l-zand2" d="M119 110q33 9.5 66 0M134 110v14M152 112v15M170 110v14M143 103v8M161 103v8"/><ellipse class="k-duin o" cx="152" cy="100" rx="34" ry="9.5"/><ellipse class="k-hout2" cx="152" cy="100.5" rx="25" ry="6"/>` +
        `<path class="l-hout2" d="M209 106q-8-1-7 9M223 106q8-1 7 9"/><path class="k-terra o" d="M212 132c-11-6-12-19-4-25v-6h16v6c8 6 7 19-4 25z"/><path class="l-hout2" d="M208 107h16"/>` + K.struik(40, 128, 1.1) + K.struik(96, 132, 0.8) },
    // Lukas 19:1–4: Jericho; hij klom op een wilde vijgenboom, want Hij zou door die weg voorbijgaan. Zonder figuren: de boom en de weg.
    vijgenboom: { n: "De wilde vijgenboom in Jericho",
      label: "Langs de weg door Jericho staat een grote wilde vijgenboom, met een korte, dikke stam, lage takken en een brede kruin. Erachter de huizen van de stad en palmbomen. Er drijft langzaam een wolk voorbij.",
      svg: `<g class="tf-l-drijf">${K.wolk(250, 24)}</g>` + K.verte + `<path class="k-land" d="M0 96q90-12 180-4t140-6v54H0z"/>` + K.huis(186, 72, 22, 24) + K.huis(210, 62, 18, 34, "k-wit") + K.huis(230, 74, 24, 22) + K.huis(256, 66, 20, 30, "k-wit") + K.palm(294, 102, 1.1) + K.palm(172, 100, 0.8) +
        `<path class="k-zand" d="M0 110q90-8 170 0t150-8v22q-70 10-150 6T0 136z"/>` +
        `<path class="k-hout o" d="M92 128q7-12 4-25L72 86l5-8 23 13q2-12-5-24l10-4q7 12 8 24l19-21 7 6-19 25q-5 16 2 31z"/>` +
        `<g class="k-salie2"><circle cx="64" cy="70" r="17"/><circle cx="92" cy="52" r="21"/><circle cx="128" cy="52" r="20"/><circle cx="154" cy="70" r="16"/><circle cx="110" cy="68" r="15"/><circle cx="80" cy="80" r="9"/><circle cx="140" cy="82" r="8"/></g><g class="k-salie"><ellipse cx="88" cy="40" rx="9" ry="4"/><ellipse cx="130" cy="41" rx="7" ry="3"/><ellipse cx="60" cy="60" rx="5" ry="2.5"/><ellipse cx="154" cy="62" rx="4" ry="2"/></g>` +
        `<g class="k-terra"><circle cx="100" cy="62" r="1.8"/><circle cx="74" cy="74" r="1.8"/><circle cx="120" cy="60" r="1.8"/><circle cx="142" cy="68" r="1.8"/><circle cx="110" cy="48" r="1.8"/><circle cx="84" cy="60" r="1.8"/></g>` + K.struik(232, 130, 1.1) + K.struik(28, 100, 0.9) },
    // Mattheüs 21:8 en Johannes 12:13: zij spreidden hun klederen op de weg, anderen hieuwen takken van de bomen; takken van palmbomen.
    // De Heere Jezus en het rijdier zijn niet getekend: alleen de weg van de Olijfberg naar de stad.
    "intocht-weg": { n: "De weg naar Jeruzalem",
      label: "Een weg loopt van de Olijfberg naar de poort van Jeruzalem, de stad op de heuvel. Op de weg komen één voor één kleden en groene takken te liggen, tot aan de stad toe.",
      svg: K.verte + `<path class="k-land" d="M96 104q60-44 136-38t88 22v52H96z"/>` + K.stad(236, 74, 0.55) + `<path class="k-groen" d="M0 84q60-18 120-2t200 26v32H0z"/><path class="k-duin" d="M232 74h8q-14 22-50 32t-18 34H44q12-36 84-48t104-18z"/>` +
        olijf(34, 104, 1.2) + olijf(84, 94, 0.8) + olijf(288, 128, 1.3) + K.struik(250, 112, 0.9) + K.struik(18, 128, 1.1) +
        `<g class="tf-e-in tf-w1">${kleed("M66 126l40-5 9 10-42 6", "k-terra") + tak(124, 124, 1.2)}</g><g class="tf-e-in tf-w2">${kleed("M100 114l32-5 7 8-33 5", "k-oker") + tak(74, 120, 1.1)}</g>` +
        `<g class="tf-e-in tf-w3">${kleed("M128 104l26-5 7 6-27 5", "k-zee2") + tak(146, 114, 0.9)}</g><g class="tf-e-in tf-w4">${kleed("M160 97l20-4 6 5-21 4", "k-terra") + tak(128, 100, 0.8)}</g>` +
        `<g class="tf-e-in tf-w5">${kleed("M186 91l15-3 5 4-16 3", "k-wit") + tak(168, 92, 0.7)}</g><g class="tf-e-in tf-w6">${kleed("M207 85l11-2 4 3-12 2", "k-oker") + tak(196, 86, 0.5)}</g>` },
    // Mattheüs 26:36 en Johannes 18:1: een plaats genaamd Gethsémané; over de beek Kedron, waar een hof was. Sober: alleen de hof in de nacht.
    gethsemane: { n: "De hof van Gethsémané",
      label: "Het is nacht. Een stille hof met oude olijfbomen aan de voet van de Olijfberg. Erachter stroomt de beek Kedron en op de heuvel aan de overkant ligt de muur van Jeruzalem. Er is niemand te zien.",
      svg: nacht + `<path class="k-berg2" d="M0 60q70-16 150-6t170 8v78H0z"/>` + K.muur(-4, 34, 138, 16) + K.toren(38, 26, 14, 24) + K.toren(96, 26, 14, 24) + `<path class="k-land" d="M0 66q80-12 160-2t160 2v74H0z"/><path class="k-zee" d="M0 78q60-8 110 0t100-6 110 2v7q-60-4-110 4T110 87 0 87z"/>` +
        `<path class="k-groen" d="M0 88q80-12 170-4t150-8v64H0z"/><path class="k-salie" d="M0 120q100-14 200-4t120-8v32H0z"/>` +
        olijf(296, 98, 0.9) + olijf(100, 100, 1.1) + olijf(204, 102, 1.2) + olijf(40, 122, 1.6) + olijf(150, 126, 1.8) + olijf(260, 122, 1.7) + sluier +
        sterren([[150, 12], [176, 30, 0.7], [208, 14, 0.7], [236, 34], [262, 12, 0.6], [290, 28, 0.8], [306, 48, 0.6], [16, 12, 0.7], [70, 16, 0.6]]) + `<circle class="k-okerz tf-l-gloed" cx="196" cy="44" r="1.3"/><circle class="k-okerz tf-l-gloed tf-w4" cx="278" cy="50" r="1.3"/>` },
    // Mattheüs 27:60 en Johannes 19:41–42: een nieuw graf in een hof, in een steenrots uitgehouwen; een grote steen tegen de deur gewenteld.
    "graf-dicht": { n: "Het graf in de hof",
      label: "In een hof met olijfbomen is een graf uitgehouwen in de rots. Voor de ingang ligt een grote, ronde steen: het graf is dicht. Er drijft langzaam een wolk voorbij.",
      svg: `<g class="tf-l-drijf">${K.wolk(60, 30, 0.9, "k-rook")}</g><path class="k-berg2" d="M0 76q40-16 90-8t70-8v50H0z"/>` + graf(false) },
    // Markus 16:2–4 en Johannes 20:1: zeer vroeg, als het nog duister was, als de zon opging; de steen was afgewenteld, want hij was zeer groot.
    "graf-open": { n: "De steen is afgewenteld",
      label: "Vroeg in de morgen in de hof. Het is eerst nog donker; dan komt de zon op achter de heuvels. De grote, ronde steen ligt naast het graf: de ingang in de rots is open en het graf is leeg.",
      svg: `<path class="k-okerz" d="M0 44h320v40H0z"/><g class="tf-e-rijs"><circle class="k-licht" cx="130" cy="62" r="24"/><circle class="k-oker" cx="130" cy="62" r="11"/></g><path class="k-berg2" d="M0 76q40-16 90-8t70-8v50H0z"/>` + graf(true) + `<g class="tf-e-dooft tf-w2">${sluier}</g>` },
    // Handelingen 1:9–12: een wolk nam Hem weg van hun ogen; de berg die genaamd wordt de Olijfberg, nabij Jeruzalem.
    // Alleen de berg en de wolk; de Heere Jezus, de discipelen en de twee mannen in witte kleding zijn niet getekend.
    "olijfberg-wolk": { n: "De Olijfberg en de wolk",
      label: "De Olijfberg, een groene heuvel met olijfbomen en een pad naar boven. In de verte ligt Jeruzalem. Boven de top van de berg stijgt een witte wolk langzaam omhoog.",
      svg: K.verte + `<path class="k-land" d="M0 96q50-22 110-8t50 52H0z"/>` + K.stad(52, 92, 0.42) + `<g class="tf-e-rijs">${K.wolk(196, 32, 1.6)}</g><path class="k-groen" d="M64 140q26-82 122-86t134 56v30z"/><path class="k-salie" d="M40 140q60-30 140-26t140 4v22z"/><path class="k-duin" d="M150 140q30-20 22-40t14-46h4q-14 26-6 46t-10 40z"/>` +
        olijf(216, 78, 0.7) + olijf(146, 84, 0.8) + olijf(254, 98, 1) + olijf(222, 120, 1.3) + olijf(100, 126, 1.4) + K.struik(22, 126, 1.1) + K.struik(256, 132) },
    // Handelingen 1:13 en 2:1–3: de opperzaal; uit de hemel een geluid als van een geweldige, gedreven wind, dat het gehele huis vervulde;
    // verdeelde tongen als van vuur. Geen mensen en geen duif: het huis, het licht in de bovenzaal en lijnen voor het geluid als van wind.
    pinksterhuis: { n: "Het huis op de Pinksterdag",
      label: "Een huis in Jeruzalem met een bovenzaal en een trap aan de buitenkant. Uit de hemel komen lijnen als van een sterke wind op het huis af. Daarna gloeit in de vensters van de bovenzaal een licht als van vuur.",
      svg: K.verte + `<path class="k-land" d="M0 100q160-10 320 0v40H0z"/>` + K.huis(8, 76, 30, 30) + K.huis(40, 66, 24, 40, "k-wit") + K.huis(66, 80, 28, 26) + K.huis(232, 78, 28, 28) + K.huis(262, 64, 24, 42, "k-wit") + K.huis(288, 80, 30, 26) +
        `<g class="tf-e-in tf-w6"><circle class="k-gloed tf-l-gloed" cx="160" cy="62" r="50"/><circle class="k-gloed tf-l-gloed" cx="160" cy="62" r="34"/></g><path class="k-duin o" d="M104 124V82h112v42z"/><path class="k-wit o" d="M120 82V44h80v38z"/><path class="l-zand2" d="M104 88h112M120 50h80"/>` +
        `<path class="k-hout2" d="M127 78V63a5 5 0 0 1 10 0v15zM146 78V63a5 5 0 0 1 10 0v15zM165 78V63a5 5 0 0 1 10 0v15zM184 78V63a5 5 0 0 1 10 0v15zM120 124v-20a8 8 0 0 1 16 0v20zM176 104h8v8h-8z"/><path class="k-zand o" d="M216 124V82h-10v8h-8v8h-8v8h-8v8h-8v10z"/>` +
        `<g class="tf-e-in tf-w6"><path class="k-oker" d="M127 78V63a5 5 0 0 1 10 0v15zM146 78V63a5 5 0 0 1 10 0v15zM165 78V63a5 5 0 0 1 10 0v15zM184 78V63a5 5 0 0 1 10 0v15z"/><path class="k-okerz tf-l-gloed" d="M129.5 78V65a2.5 2.5 0 0 1 5 0v13zM148.5 78V65a2.5 2.5 0 0 1 5 0v13zM167.5 78V65a2.5 2.5 0 0 1 5 0v13zM186.5 78V65a2.5 2.5 0 0 1 5 0v13z"/></g>` +
        `<path class="l-water tf-e-teken" pathLength="1" d="M-4 10q84-10 124 12t38 22"/><path class="l-water tf-e-teken tf-w1" pathLength="1" d="M40-4q70 0 96 18t30 30"/><path class="l-water tf-e-teken tf-w2" pathLength="1" d="M-4 34q60-12 100 0t44 16"/>` + K.palm(86, 126, 1) + K.struik(250, 130) },
    // Handelingen 9:3: als hij nabij Damaskus kwam, omscheen hem snellijk een licht van de hemel. Alleen de weg, de stad en het licht.
    "damascus-licht": { n: "Het licht op de weg naar Damascus",
      label: "Een weg loopt door een droog land naar de stad Damascus, die tussen het groen in de verte ligt. Plotseling valt er uit de hemel een helder licht op de weg.",
      svg: K.verte + `<path class="k-groen" d="M150 92q60-14 170-8v20H150z"/>` + K.stad(246, 90, 0.5) + K.palm(196, 94, 0.7) + K.palm(298, 96, 0.8) + `<path class="k-land" d="M0 96q90-12 180-4t140-4v52H0z"/><path class="k-zand" d="M243 90h6q-10 16-60 24T96 140H10q40-30 110-36t123-14z"/>` +
        K.struik(40, 112, 1.1) + K.struik(250, 124, 1.1) + K.steen("M286 134l-2-7 6-5 9 1 4 6-3 5", "k-steen") +
        `<g class="tf-e-in tf-w3"><path class="k-licht" d="M60 0h92l40 126H22z"/><path class="k-licht" d="M82 0h48l30 126H56z"/><path class="k-licht tf-l-gloed" d="M96 0h20l22 126H78z"/><ellipse class="k-okerz" cx="107" cy="124" rx="56" ry="9"/><path class="l-licht" d="M72 0 44 110M140 0l30 110M106 0v104"/></g>` },
    // Handelingen 16:24–26: de binnenste kerker, hun voeten in de stok; een grote aardbeving; al de deuren werden geopend en de banden van allen werden los.
    "gevangenis-filippi": { n: "De gevangenis van Filippi",
      label: "De binnenste kerker, met dikke muren van steen. De aarde beeft. Dan staat de deur wijd open naar de nacht, het blok voor de voeten staat open en de ketens hangen los aan de muur. Er is niemand te zien.",
      svg: `<g class="tf-e-beef"><path class="k-berg2" d="M-6-6h332v120H-6z"/><path class="l-zand2" d="M-6 28h332M-6 56h332M-6 84h332M40-6v34M120-6v34M200-6v34M280-6v34M80 28v28M160 28v28M300 28v28M30 56v28M110 56v28M190 56v28M70 84v28M150 84v28"/><path class="k-zand" d="M-6 112h332v34H-6z"/><path class="l-zand2" d="M-6 112h332"/>` +
        `<path class="k-nacht o" d="M26 22h34v26H26z"/><path class="l-hout2 dik" d="M35 22v26M43 22v26M51 22v26"/><path class="k-nacht o" d="M214 112V54a24 24 0 0 1 48 0v58z"/>` + sterren([[228, 50], [244, 66, 0.7], [236, 84, 0.6], [250, 44, 0.6]]) +
        `<g class="tf-e-in tf-w4"><path class="k-hout o" d="M262 112V40l34 12v72z"/><path class="l-hout2" d="M273 45v70M284 49v70M262 64l34 10M262 96l34 12"/></g>` +
        `<g class="tf-e-uit tf-w4"><path class="k-hout o" d="M214 112V54a24 24 0 0 1 48 0v58z"/><path class="l-hout2" d="M226 36v76M238 30v82M250 36v76"/><path class="l-hout2 dik" d="M214 64h48M214 94h48"/></g>` +
        keten(96, 40, 9) + keten(140, 40, 9) + `<path class="l-hout2 dik" d="M90 93a6 6 0 1 0 10-3M134 93a6 6 0 1 0 10-3"/><circle class="k-hout2" cx="96" cy="38" r="2.5"/><circle class="k-hout2" cx="140" cy="38" r="2.5"/>` +
        `<path class="k-hout o" d="M70 122h110v10H70z"/><path class="k-hout2" d="M86 122a5 5 0 0 0 10 0zM108 122a5 5 0 0 0 10 0zM136 122a5 5 0 0 0 10 0zM158 122a5 5 0 0 0 10 0z"/><g class="tf-e-in tf-w4"><path class="k-hout o" d="M70 122l104-30 3 9-104 30z"/></g>` +
        `<g class="tf-e-uit tf-w4"><path class="k-hout o" d="M70 112h110v10H70z"/><path class="k-hout2" d="M86 122a5 5 0 0 1 10 0zM108 122a5 5 0 0 1 10 0zM136 122a5 5 0 0 1 10 0zM158 122a5 5 0 0 1 10 0z"/></g></g>` },
    // Handelingen 27:39–41: een inham die een oever had; een plaats die de zee aan beide zijden had; het voorschip bleef onbeweeglijk, het achterschip brak.
    "malta-schip": { n: "Het schip strandt bij Malta",
      label: "Een groot schip is vastgelopen op een zandbank voor de kust van Malta. De voorkant zit vast, de achterkant is afgebroken door de golven en er drijven planken in het water. De lucht is donker en de zee is wild.",
      svg: `<path class="k-rook" d="M0 0h320v78H0z"/><g class="tf-l-drijf">${K.wolk(60, 20, 1.5, "k-donker") + K.wolk(170, 14, 1.3, "k-donker2") + K.wolk(270, 24, 1.5, "k-donker")}</g><path class="k-berg2" d="M0 64q40-22 100-12t80 10 60 4v12H0z"/><path class="k-land" d="M0 72q50-10 100-4t60 8H0z"/><path class="k-zand" d="M0 78q60-8 120-2l10 6H0z"/>` +
        `<path class="k-water" d="M0 76h320v64H0z"/><g class="tf-l-golf">${K.golf(30, 86) + K.golf(96, 90) + K.golf(250, 84) + K.golf(292, 94)}</g>` +
        `<g transform="translate(150 104) rotate(-5)"><path class="l-zand2" d="M-18-60-48-18M-18-60 8-13M-56-40l10 24"/><path class="l-hout2 dik" d="M-14-12-18-60M-42-14-56-40"/><path class="k-duin o2" d="M-58-38l14-6 5 12-13 6z"/><path class="l-hout2" d="M-38-52 4-54"/><path class="k-duin o2" d="M-36-52q20 8 38-2z"/><path class="k-hout o" d="M-54-26h5q-1 10 6 14h58l-4 5 5 4-5 4 3 5h-52q-14-6-16-32z"/><path class="l-hout2" d="M-44-6h54"/></g><path class="k-zand" d="M76 118q30-18 84-10 16 4 8 10z"/><path class="k-duin" d="M96 110q24-8 56-4-30 0-56 4z"/>` +
        `<g transform="translate(200 110) rotate(16)"><path class="k-hout o" d="M-12-10h20q5-8 5-18h5q2 16-6 28-3 6-10 6h-11l-4-5 5-4-5-4z"/><path class="l-hout2" d="M-8-4h22"/></g>` +
        `<path class="k-water2" d="M0 116q24-12 48-2t46 4 46-2 46 2 46-4 46 0 42 0v30H0z"/><path class="l-wit" d="M10 110q14-8 26-3M176 112q14-9 26-3M232 106q12-8 24-2M284 110q14-8 26-3M60 128q12-6 22 0M150 130q12-6 22 0"/>` +
        `<g class="tf-l-golf tf-w5"><path class="k-hout o2" d="M230 122l16-3 1 3-16 3zM258 130l12 2-1 3-12-2zM214 132l10-4 1 3-10 4z"/></g>` },
    // Handelingen 28:1–3: het eiland Melite; een groot vuur om de regen en om de koude; een hoop rijzen op het vuur; een adder kwam eruit door de hitte.
    "malta-vuur": { n: "Het vuur op Malta",
      label: "Op het strand van Malta brandt een groot vuur; er stijgt rook op en het regent. Naast het vuur ligt een bos takken, en daar kruipt een adder uit. In zee ligt het gebroken schip.",
      svg: `<path class="k-rook" d="M0 0h320v64H0z"/><g class="tf-l-drijf">${K.wolk(70, 18, 1.4, "k-donker") + K.wolk(250, 22, 1.5, "k-donker")}</g><path class="k-water" d="M0 60h320v30H0z"/>${K.golf(40, 70) + K.golf(120, 76) + K.golf(280, 72)}` +
        `<g transform="translate(232 76) rotate(-6) scale(.42)"><path class="l-hout2 dik" d="M-14-12-18-60"/><path class="k-hout o" d="M-54-26h5q-1 10 6 14h58l-4 5 5 4-5 4 3 5h-52q-14-6-16-32z"/></g><path class="k-land" d="M0 86q90-12 180-4t140-6v64H0z"/><path class="k-zand" d="M0 118q100-12 200-2t120-6v30H0z"/>` +
        `<path class="l-zee" d="${[[20, 8], [52, 30], [96, 12], [130, 44], [168, 20], [206, 50], [226, 8], [262, 40], [298, 16], [34, 66], [80, 96], [270, 98], [300, 70], [12, 110], [240, 122], [112, 74]].map(([x, y]) => `M${x} ${y}l-3 9`).join("")}"/>` +
        `<circle class="k-gloed tf-l-gloed" cx="140" cy="100" r="44"/><circle class="k-gloed tf-l-gloed" cx="140" cy="100" r="28"/>` + K.rook(140, 52, 2.2) + `<path class="l-hout2 dik" d="M110 122l56-10M112 110l54 14M122 124l34-18"/>` + K.vlam(124, 116, 1.5, 3) + K.vlam(158, 116, 1.6, 5) + K.vlam(140, 114, 2.4, 1) +
        `<path class="l-hout2" d="M196 128l44-12M198 124l42-4M198 120l40 2M200 131l40-6M202 117l34-2"/><path class="l-hout dik" d="M214 114v18"/><path class="l-salie2 dik" d="M236 122q5-7 10-1t10-1 9-3"/><circle class="k-salie2" cx="266" cy="116.500" r="2.2"/>` + K.steen("M40 132l-2-7 6-5 9 1 4 6-3 5", "k-steen") + K.struik(292, 110, 1.1) },
    // Openbaring 1:12, 20: ‘ik zag zeven gouden kandelaren’; de zeven kandelaren zijn de zeven gemeenten. De Gestalte van vers 13 is niet getekend.
    kandelaren: { n: "Zeven gouden kandelaren",
      label: "Zeven gouden kandelaren staan in een boog naast elkaar. Op elke kandelaar brandt een vlam, die zacht beweegt. Er is verder niets en niemand getekend.",
      svg: `<path class="k-land" d="M0 104q160-22 320 0v36H0z"/><ellipse class="k-gloed tf-l-gloed" cx="160" cy="62" rx="150" ry="40"/>` + [[160, 106, 1.3, 0], [118, 109, 1.4, 3], [202, 109, 1.4, 5], [76, 115, 1.5, 2], [244, 115, 1.5, 6], [34, 124, 1.65, 4], [286, 124, 1.65, 1]].map((a) => kandelaar(...a)).join("") },
    // Johannes 21:9–11: een kolenvuur, en vis daarop liggen, en brood; het net op het land, vol grote vissen; het scheurde niet.
    "net-vol": { n: "Het net vol vissen",
      label: "Vroeg in de morgen aan de oever van het meer. Op het strand ligt een net vol grote vissen. Ernaast gloeit een kolenvuur met een vis erop, en er ligt een brood bij. Het schip ligt vlak voor de oever.",
      svg: meer + `<path class="k-zee2" d="M0 86q80-8 160 0t160-4v58H0z"/><g class="tf-l-golf">${K.golf(30, 72) + K.golf(112, 70) + K.golf(150, 80, 16) + K.golf(60, 92, 16)}</g>` + schip(246, 94, 1.2) + `<g class="tf-l-golf tf-w5">${K.golf(212, 96, 16) + K.golf(244, 98, 16) + K.golf(274, 96, 16)}</g>` +
        `<path class="k-zand" d="M0 100q80-10 160 0t160 2v38H0z"/><path class="l-zand2" d="M210 104q20 8 26-8"/>` +
        [[150, 112], [172, 108], [196, 112], [160, 122], [184, 120], [208, 122], [146, 130], [170, 131], [194, 130], [216, 132], [222, 114]].map(([x, y]) => vis(x, y)).join("") +
        net("M136 136q-6-18 10-26 14-12 40-10 30-6 48 6 18 8 14 30z", "M146 134l20-30M164 135l22-34M184 135l22-33M204 135l20-27M224 135l16-20M140 122l20 13M146 110l36 25M164 103l40 32M190 101l38 33M214 104l30 28", [[138, 118], [150, 108], [166, 102], [184, 100], [204, 100], [222, 104], [238, 112]]) +
        `<ellipse class="k-hout2 o" cx="64" cy="124" rx="24" ry="7"/><path class="k-terra tf-l-gloed" d="M46 123l5-2 4 3-5 2zM60 127l5-2 4 3-5 2zM72 121l5-2 4 3-5 2zM56 120l4-2 3 2-4 2z"/>` + vis(54, 118) + brood(106, 128) + K.rook(70, 106, 0.9) },
  });
})();
