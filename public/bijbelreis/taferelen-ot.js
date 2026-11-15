// Eigen taferelen bij het Oude Testament. Motor, bouwstenen (BR.tfTeken) en standaardbeelden: taferelen.js.
// Regels en tekenafspraken: docs/bijbelreis-taferelen/README.md. Bij elk tafereel staat de tekst waarmee het is gecontroleerd
// (Statenvertaling: node scripts/sv.mjs "<verwijzing>"). God, de Heere Jezus en engelen worden niet afgebeeld.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.taferelen = BR.taferelen || {};
(function () {
  const K = BR.tfTeken;
  // De ark (Genesis 6:14–16): een lange kist van hout, bepekt, met een deur in de zijde, een venster en drie verdiepingen.
  const ark = (x, y) => `<g ${K.op(x, y)}><path class="k-hout2 o" d="M-58-12l7-6h102l7 6z"/><path class="k-hout o" d="M-56 0v-12H56V0z"/><path class="l-hout2" d="M-56-8h112M-56-4h112"/><path class="k-hout2" d="M10 0v-9h8v9z"/><path class="k-okerz" d="M-30-16.5h7v2.5h-7z"/></g>`;
  // De bergen van Ararat: een breed bergland; de ark ligt op de rug van de voorste berg.
  const ararat = `<path class="k-berg2" d="M0 106 34 72l30 24 34-40 36 30 46-40 44 44 40-32 56 38v38H0z"/><path class="k-berg" d="M10 140 52 100l14 6 24-28 16-11h108l14 9 22 26 14-5 44 43z"/><path class="k-schaduw" d="M214 67l14 9 22 26 14-5 44 43H200l-10-42z"/>`;
  // Eén laag tichelstenen van de toren: donkere ondergrond (het lijm) met twee rijen stenen.
  const laag = (x, y, w, extra = "") => `<g${extra ? ` class="${extra}"` : ""}><path class="k-hout2" d="M${x} ${y}h${w}v11h-${w}z"/><path class="steen" d="M${x + 1} ${y + 3}h${w - 2}"/><path class="steen s2" d="M${x + 1} ${y + 8}h${w - 2}"/></g>`;

  Object.assign(BR.taferelen, {
    // Genesis 8:3–5: de wateren nemen af, de ark rust op de bergen van Ararat, de toppen van de bergen worden gezien.
    "ararat-ark": { n: "De ark op de bergen van Ararat",
      label: "De ark, een lange houten kist met een deur in de zijkant, ligt op de bergen van Ararat. Rondom staat nog water. Het water zakt en de bergen komen tevoorschijn.",
      svg: `<g class="tf-l-drijf">${K.wolk(64, 26, 1.1, "k-rook") + K.wolk(250, 20, 0.9, "k-rook")}</g>` + ararat + ark(160, 67) +
        `<g class="tf-e-zak"><path class="k-zee2" d="M-10 110q42-5 84 0t84 0 84 0 88 0v60H-10z"/><path class="k-zee" d="M-10 124q42-5 84 0t84 0 84 0 88 0v46H-10z"/><g class="tf-l-golf">${K.golf(40, 118) + K.golf(128, 116) + K.golf(214, 119) + K.golf(280, 116) + K.golf(84, 132, 16) + K.golf(180, 134, 16) + K.golf(256, 131, 16)}</g></g>` },
    // Genesis 9:13–16: ‘Mijn boog heb Ik gegeven in de wolken.’ De Bijbel noemt geen kleuren; de banden zijn kleuren van de atlas.
    "ararat-boog": { n: "De boog in de wolken",
      label: "De ark ligt op de bergen van Ararat; het land eronder is droog en groen. In de wolken verschijnt een grote boog.",
      svg: ["l-terra", "l-oker", "l-salie", "l-water", "l-lila"].map((k, i) => `<path class="boog ${k} tf-e-teken" pathLength="1" d="M${38 + i * 3.2} 140a${122 - i * 3.2} ${122 - i * 3.2} 0 0 1 ${244 - i * 6.4} 0"/>`).join("") +
        `<g class="tf-l-drijf">${K.wolk(52, 74, 1.5) + K.wolk(274, 60, 1.4) + K.wolk(200, 20, 0.9)}</g>` + ararat + ark(160, 67) +
        `<path class="k-groen" d="M0 122q70-14 150-6t170-8v32H0z"/><path class="k-land" d="M0 134q90-10 180-4t140-4v14H0z"/>` + K.struik(60, 128) + K.struik(238, 124, 1.1) + K.boom(280, 128, 0.8) },
    // Genesis 11:2–8: een laagte in Sinear; tichelen strijken en doorbranden; lijm voor leem; een stad en een toren; zij hielden op te bouwen.
    babel: { n: "De toren van Babel",
      label: "In een vlak land staat een brede toren van tichelstenen, nog in aanbouw: laag na laag komt erbij, maar de top is niet af. Ernaast een oven waar stenen worden gebakken, een stapel stenen en een paar huizen.",
      svg: `<path class="k-berg2" d="M0 92q160-8 320 0v10H0z"/><path class="k-land" d="M0 96h320v44H0z"/><path class="k-zand" d="M0 122q100-8 200-2t120-4v24H0z"/>` +
        K.huis(246, 80, 20, 20, "k-terra") + K.huis(266, 74, 18, 26) + K.huis(284, 84, 22, 16, "k-terra") +
        `<path class="l-hout2 tf-e-in tf-w4" d="M200 100V40M214 100V52M196 64h22M196 52h22M196 76h22M200 76l14-12M200 64l14-12"/>` +
        laag(104, 89, 122) + laag(111, 78, 108) + laag(118, 67, 94, "tf-e-in tf-w1") + laag(125, 56, 80, "tf-e-in tf-w3") + laag(132, 45, 66, "tf-e-in tf-w5") + laag(132, 34, 30, "tf-e-in tf-w7") +
        `<path class="k-hout2" d="M158 100V90a7 7 0 0 1 14 0v10z"/>` +
        `<path class="k-terra2 o" d="M30 104a17 17 0 0 1 34 0z"/><path class="k-oker tf-l-gloed" d="M42 104a5 6 0 0 1 10 0z"/>` + K.rook(47, 86, 1.2) + laag(70, 100, 20) + laag(74, 89, 12) },
    // Exodus 3:1–5: bij de berg Gods, Horeb; het braambos brandde in het vuur en werd niet verteerd; ‘trek uw schoenen uit’.
    braamstruik: { n: "De brandende braamstruik",
      label: "In de woestijn bij de berg Horeb staat een braamstruik in brand. De vlammen bewegen, maar de struik blijft groen en verbrandt niet. Verderop grazen schapen; vooraan staat een paar sandalen.",
      svg: `<path class="k-berg2" d="M110 100 214 28l26 24 16-12 64 50v10z"/><path class="k-berg" d="M168 100 240 40l20 18 12-9 48 40v11z"/><path class="k-land" d="M0 94q80-10 170-2t150-4v52H0z"/><path class="k-zand" d="M0 122q110-14 200-2t120-8v28H0z"/>` +
        K.schaap(246, 104) + K.schaap(270, 110) + K.schaap(290, 102, 0.9) + K.struik(214, 116, 0.9) +
        `<circle class="k-gloed tf-l-gloed" cx="110" cy="88" r="48"/><circle class="k-gloed tf-l-gloed" cx="110" cy="88" r="30"/>` + K.vlam(92, 90, 1.4, 3) + K.vlam(128, 90, 1.5, 5) +
        `<path class="l-hout2 dik" d="M110 120q-2-14-18-28M110 120q4-16 20-28M110 120q-14-6-32-8M110 120q14-6 32-10M110 114q1-14-2-32"/><path class="l-hout2" d="M98 102l-9-2M102 98l-2-9M124 102l9-4M119 96l1-10M88 110l-7-6M134 108l7-6M108 96l-7-5"/>` +
        [[80, 110, 5], [92, 90, 6], [108, 82, 6], [130, 90, 6], [144, 108, 5], [88, 100, 4.5], [121, 100, 5], [102, 106, 5], [136, 100, 4.5], [116, 110, 4.5], [99, 94, 4]].map(([x, y, r]) => `<circle class="k-salie2" cx="${x}" cy="${y}" r="${r}"/>`).join("") + `<circle class="k-salie" cx="106" cy="81" r="3"/><circle class="k-salie" cx="129" cy="89" r="2.5"/><circle class="k-salie" cx="91" cy="89" r="2.5"/>` +
        K.vlam(110, 90, 1.9, 1) + K.vlam(98, 108, 0.9, 6) + K.vlam(124, 110, 0.9, 2) + K.vlam(140, 104, 0.8, 4) + K.vlam(84, 106, 0.8, 7) +
        `<g transform="translate(170 132) rotate(14)"><path class="k-duin o" d="M0 0c-3 0-4-4-3-8 1-5 0-8 2-11 2-2 5-1 6 2 1 4-1 7 0 11 1 4-1 6-5 6zM13 2c-3 0-4-4-3-8 1-5 0-8 2-11 2-2 5-1 6 2 1 4-1 7 0 11 1 4-1 6-5 6z"/><path class="l-hout2" d="M-2-14l4 4 3-5M-3-5h8M11-12l4 4 3-5M10-3h8"/></g>` },
    // Exodus 14:21–22: de HEERE deed de zee weggaan, die ganse nacht; op het droge; de wateren een muur rechts en links.
    schelfzee: { n: "De doortocht door de Schelfzee",
      label: "Het is nacht. De zee wijkt naar links en naar rechts en blijft aan beide kanten staan als een hoge muur van water. Ertussen ligt een droog pad van zand naar de overkant.",
      svg: `<path class="k-nacht" d="M0 0h320v140H0z"/><path class="k-berg" d="M112 58q48-16 96 0z"/><path class="k-zand" d="M150 58h20l48 82H102z"/><path class="k-zand2" d="M150 58h3l-44 82h-7zM170 58h-3l44 82h7z"/><path class="k-duin" d="M152 110h9l2 3h-12zM170 126h10l2 3h-13zM158 84h5l1 2h-7z"/>` +
        `<g class="tf-e-wijk-l"><path class="k-water2" d="M-70-12H88l62 56v14l-48 82H-70z"/><path class="k-water" d="M-70-12H88l62 56-24 8z"/><path class="l-zee" d="M20 44q40 14 70 50M-6 78q46 8 80 44M52 30q36 12 70 40"/><path class="l-wit" d="M88-12l62 56"/></g>` +
        `<g class="tf-e-wijk-r"><path class="k-water2" d="M390-12H232l-62 56v14l48 82h172z"/><path class="k-water" d="M390-12H232l-62 56 24 8z"/><path class="l-zee" d="M300 44q-40 14-70 50M326 78q-46 8-80 44M268 30q-36 12-70 40"/><path class="l-wit" d="M232-12l-62 56"/></g>` +
        `<g class="tf-e-uit"><path class="k-nacht" d="M0 0h320v60H0z"/><path class="k-berg" d="M112 58q48-16 96 0z"/><path class="k-water2" d="M0 58h320v82H0z"/><path class="k-water" d="M0 58h320v14H0z"/>${K.golf(40, 84) + K.golf(120, 96, 16) + K.golf(214, 82) + K.golf(262, 110, 16) + K.golf(70, 120, 16) + K.golf(168, 124, 16)}</g>` },
    // Exodus 19:16–18 en 20:18: donderen en bliksemen, een zware wolk; de berg rookte, want de HEERE kwam neder in vuur; het volk aan het onderste van de berg.
    sinai: { n: "De Sinaï in wolk en vuur",
      label: "Op de berg Sinaï ligt een zware, donkere wolk. Bovenop brandt vuur, er stijgt rook op als uit een oven en het bliksemt. Onderaan de berg staan de tenten van het volk.",
      svg: `<path class="k-berg2" d="M0 104 50 70l30 22 30-30 40 34 60-30 50 36 60-26v60H0z"/><path class="k-berg" d="M34 128 108 66l20 10 32-42 34 40 18-9 74 67z"/><path class="k-schaduw" d="M160 34l34 40 18-9 74 67H182l-10-50z"/>` +
        K.rook(112, 60, 2) + K.rook(210, 58, 2) + `<circle class="k-gloed tf-l-gloed" cx="160" cy="44" r="34"/><circle class="k-gloed tf-l-gloed" cx="160" cy="44" r="20"/>` + K.vlam(146, 52, 1.2, 2) + K.vlam(174, 54, 1.1, 5) + K.vlam(160, 47, 1.7) +
        `<g class="k-donker2"><circle cx="112" cy="30" r="11"/><circle cx="136" cy="33" r="12"/><circle cx="162" cy="34" r="12"/><circle cx="188" cy="33" r="12"/><circle cx="212" cy="30" r="11"/></g><g class="k-donker"><circle cx="96" cy="24" r="12"/><circle cx="120" cy="17" r="17"/><circle cx="150" cy="12" r="20"/><circle cx="182" cy="13" r="19"/><circle cx="210" cy="19" r="16"/><circle cx="230" cy="26" r="11"/></g>` +
        `<path class="l-oker dik tf-l-flits" d="M124 42l-9 15h8l-11 20"/><path class="l-oker dik tf-l-flits tf-w6" d="M204 42l8 14h-7l10 19"/>` +
        `<path class="k-land" d="M0 116q80-12 160-4t160-8v36H0z"/><path class="k-zand" d="M0 132q90-10 180-4t140-4v16H0z"/>` +
        [28, 58, 88, 232, 262, 292].map((x, i) => K.tentje(x, 124 - (i % 2) * 3, i % 2 ? "k-zand" : "k-hout")).join("") + K.tent(10, 137, 0.7) + K.tent(308, 137, 0.7, "k-hout") },
    // Jozua 6:20: ‘en de muur viel onder zich’. Jericho, de palmstad (Deuteronomium 34:3).
    jericho: { n: "De muren van Jericho vallen",
      label: "De stad Jericho, met palmbomen eromheen. De muur en de torens rond de stad storten in en blijven als puin liggen. De huizen van de stad staan er nog.",
      svg: K.verte + `<path class="k-land" d="M0 112q60-26 160-26t160 24v30H0z"/>` + K.huis(104, 58, 22, 30) + K.huis(128, 50, 18, 38, "k-wit") + K.huis(148, 56, 24, 32) + K.huis(174, 48, 20, 40, "k-wit") + K.huis(196, 60, 22, 28) +
        `<path class="k-zand o" d="M78 103l6-9 9 2 5-7 10 3 6-5 9 4 8-6 9 5 7-4 9 5 8-5 9 5 7-3 8 5 6-2 8 6 5 6z"/><path class="k-duin o2 tf-e-in tf-w6" d="M92 104l7-3 3 5-7 3zM118 106l8-1 1 5-8 1zM150 104l6-4 4 5-6 4zM184 106l8-2 2 5-8 2zM212 104l7 1-1 5-7-1zM136 97l6-2 2 4-6 2zM170 96l6 1-1 4-6-1z"/>` +
        `<g class="tf-e-stort tf-w2">${K.toren(84, 60, 16, 42)}</g><g class="tf-e-stort tf-w4">${K.muur(100, 74, 42, 28)}</g><g class="tf-e-stort tf-w3">${K.toren(138, 62, 12, 40) + K.toren(170, 62, 12, 40)}<path class="k-zand o" d="M150 102V74h20v28z"/><path class="k-hout2" d="M153 102V88a7 7 0 0 1 14 0v14z"/></g><g class="tf-e-stort tf-w5">${K.muur(182, 74, 42, 28)}</g><g class="tf-e-stort tf-w3">${K.toren(220, 60, 16, 42)}</g>` +
        `<g class="k-stof"><circle class="tf-e-stof tf-w4" cx="96" cy="92" r="12"/><circle class="tf-e-stof tf-w5" cx="134" cy="90" r="14"/><circle class="tf-e-stof tf-w5" cx="166" cy="88" r="13"/><circle class="tf-e-stof tf-w6" cx="200" cy="90" r="14"/><circle class="tf-e-stof tf-w6" cx="228" cy="92" r="11"/></g>` +
        K.palm(40, 114, 1.3) + K.palm(60, 120, 1) + K.palm(272, 114, 1.2) + K.palm(292, 122, 0.9) + K.struik(120, 128) },
    // Numeri 22:1 en Deuteronomium 34:1–3: de vlakke velden van Moab, aan de Jordaan tegenover Jericho, de palmstad.
    moab: { n: "De velden van Moab",
      label: "Vooraan het kamp van Israël: rijen tenten in de vlakke velden van Moab, met een vuurtje. Daarachter stroomt de Jordaan. Aan de overkant ligt het beloofde land, groen, met de stad Jericho tussen de palmbomen.",
      svg: `<path class="k-berg2" d="M0 50q60-20 130-8t190-8v32H0z"/><path class="k-groen" d="M0 60q100-12 200-4t120-6v26H0z"/><path class="k-salie" d="M0 70q80-8 160 0t160-4v8H0z"/>` + `<path class="k-wit o2" d="M201 60v-6h7v6zM211 60v-9h6v9zM220 60v-5h7v5z"/><path class="k-zand o2" d="M196 67v-7h36v7zM193 67V56h4v11zM231 67V56h4v11z"/>` + K.palm(190, 68, 0.5) + K.palm(238, 69, 0.55) + K.palm(248, 67, 0.45) + K.palm(180, 70, 0.4) + K.boom(70, 66, 0.5) + K.boom(120, 64, 0.45) +
        `<path class="k-zee" d="M0 74q80-8 160 0t160-4v14q-80 8-160 2T0 92z"/><g class="tf-l-golf">${K.golf(36, 80) + K.golf(110, 83) + K.golf(196, 80) + K.golf(270, 82)}</g>` +
        `<path class="k-land" d="M0 86q80 8 160 2t160-6v58H0z"/><path class="k-zand" d="M0 122q100-8 200-2t120-4v24H0z"/>` +
        [22, 62, 102, 142, 182, 222, 262, 302].map((x, i) => K.tentje(x, 106, i % 2 ? "k-zand" : "k-hout")).join("") + [-2, 54, 110, 204, 260, 316].map((x, i) => K.tent(x, 132, 1, i % 2 ? "k-hout" : "k-zand")).join("") +
        `<path class="k-steen o2" d="M148 131q0-3 4-3h10q4 0 4 3z"/>` + K.vlam(157, 129, 0.6) + K.rook(157, 118) },
    // Genesis 11:28, 31 en Jozua 24:2–3: Ur der Chaldeeën en Haran; ‘over gene zijde der rivier hebben uw vaders vanouds gewoond’.
    "stad-rivier": { n: "Een stad aan de rivier",
      label: "Een stad met een muur en een poort in een vlak land aan een brede rivier. Langs het water liggen groene akkers en staan palmbomen.",
      svg: `<path class="k-berg2" d="M0 62q160-10 320 0v12H0z"/><path class="k-land" d="M0 68h320v72H0z"/><path class="k-groen" d="M0 96q90-10 190-4t130-8v20q-70 6-130 0T0 112z"/>` + K.stad(166, 94, 0.85) + K.palm(70, 98, 1) + K.palm(86, 102, 0.75) + K.palm(262, 96, 1) + K.palm(280, 100, 0.7) +
        `<path class="k-zee" d="M0 110q90-10 180-2t140-8v40H0z"/><path class="k-zee2" d="M0 128q90-8 180-2t140-6v20H0z"/><g class="tf-l-golf">${K.golf(40, 118) + K.golf(128, 116) + K.golf(214, 114) + K.golf(280, 112) + K.golf(84, 134, 16) + K.golf(196, 132, 16)}</g>` +
        `<path class="l-salie2" d="M18 114v-14M23 116v-18M28 116v-12M300 106v-12M305 108v-16"/>` },
  });
})();
