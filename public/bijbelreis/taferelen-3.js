// Derde reeks taferelen (november 2026): eigen tekeningen bij bekende geschiedenissen die nog geen beeld hadden, uit het
// Oude en het Nieuwe Testament. Aanleiding: een gebruiker mist ‘platen bij de plaats of gebeurtenis’. We tekenen zelf, in
// de stijl van de atlas; we nemen geen bestaande platen over of na. Motor en bouwstenen: taferelen.js; mensen als
// pictogram en sterren: taferelen-jakob.js. Regels: docs/bijbelreis-taferelen/README.md (§1). Koppelingen:
// taferelen-koppeling-3.js. Bij elk tafereel staat de tekst waarmee het is gecontroleerd (node scripts/sv.mjs "<verwijzing>").
// God, de Heere Jezus en engelen worden niet afgebeeld (ook niet de Engel des HEEREN bij Bileam, en niet de Heere Jezus
// in Kana, bij de haan of in de gelijkenissen). Mensen alleen klein, als pictogram zonder gezicht. Wat de Bijbel telt,
// klopt in de tekening; waar de Bijbel geen aantal noemt, is het aantal willekeurig en noemt het label geen getal.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.taferelen = BR.taferelen || {};
(function () {
  const K = BR.tfTeken, { mensen, vrouwen, sterren, cirkel, vorm, rij } = K;
  const h = (n) => Math.round(n * 2) / 2;
  const VOL = "M0 0h320v140H0z";
  const nacht = `<path class="k-nacht" d="${VOL}"/>`, sluier = `<path class="k-sluier" d="${VOL}"/>`;
  // Vaste ‘willekeurige’ plekken (voor sterren): steeds dezelfde uitkomst, zodat het beeld niet verspringt.
  const veld = (n, zaad, x0, x1, y0, y1) => { let s = zaad; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); return Array.from({ length: n }, () => [Math.round(x0 + r() * (x1 - x0)), Math.round(y0 + r() * (y1 - y0))]); };

  // ---------- dieren (naar rechts, de poten op y); zie taferelen-jakob.js ----------
  const soort = (poten, lijf, k) => (l, kleur = k) => [rij(l, (x, y, s = 1) => vorm(poten, x, y, s)), `<path class="${kleur}" d="${rij(l, (x, y, s = 1) => vorm(lijf, x, y, s))}"/>`];
  const vee = (...l) => `<path class="l-hout2" d="${l.map((a) => a[0]).join("")}"/>` + l.map((a) => a[1]).join("");
  const KAMEEL = "M-7.5-5.5q0-3.5 3.5-3.5 1-3 3.5-3t3.5 3q2.5-.5 3 2l1.5-5.5q.5-2 3-1.5l1.5.5-.5 1.5h-2l-1.5 7q-.5 2-2.5 2h-11q-2.5 0-2.5-2z";
  const kamelen = soort("M-5-3.5v3.5m2.5-3.5v3.5m6-3.5v3.5m2.5-3.5v3.5", KAMEEL, "k-hout o2");
  // Een knielende kameel: het lijf op de grond, de poten gevouwen eronder. Elke kameel een eigen vorm, zodat je ze kunt tellen.
  const kameelKniel = (x, y, s = 1) => `<path class="k-hout o2" d="${vorm(KAMEEL, x, y + 3.5 * s, s)}"/>`;
  const RUND = "M-8-4.5v-4q0-2 2-2h10.5l1-1h3.5q1.5 0 1.5 1.5v2q0 1.5-1.5 1.5h-3v2.5q0 2-2 2z";
  const runderen = soort("M-6-4v4m2.5-4v4m6.5-4v4m2.5-4v4M-8-9.5q-1.5 2-1 5M7.5-11.5q-.5-2.5 2-3", RUND, "k-terra o2");
  // Magere koeien: smal lijf, hoge poten, de ribben te zien.
  const mager = soort("M-5.5-5v5m2-5v5m6-5v5m2-5v5M-7-9.5q-1.5 2-1 5M7.5-12.5q-.5-2.5 2-3", "M-7-5v-3.5q0-1.5 1.5-1.5h9.5l1-1.5h3q1.5 0 1.5 1.5v2q0 1.5-1.5 1.5h-2.5v1.5q0 1-1 1h-10q-1.5 0-1.5-1z", "k-steen o2");
  const EZEL = "M-6.5-4v-3q0-2 2-2h8l2-2.5h3l1.5 4-1.5 1.5h-3v2q0 2-2 2z";
  const ezels = soort("M-4.5-3.5v3.5m2-3.5v3.5m5-3.5v3.5m2-3.5v3.5M6.5-11.5l-1-4M8-11.5l.5-4M-6.5-8q-1.5 1.5-1 4", EZEL, "k-steen o2");
  const PAARD = "M-8-5v-3.5q0-2 2-2h10l2.5-4.5q1-1.5 2.5-1l2 1.5-1 2h-2l-1.5 4v3.5q0 1.5-1.5 1.5h-11.5q-1.5 0-1.5-1.5z";
  const paarden = soort("M-6-5v5m2.5-5v5m7.5-5v5m2.5-5v5M-8-9q-2.5 2-2 6M7.5-15l-1-2.5", PAARD, "k-hout o2");
  const VARKEN = "M-7-3q-2-1-2-4t3-5h9q4 0 5 3l2 1v2.5l-2 .5q-1 3-5 3z";
  const varkens = soort("M-5-3v3m3-3v3m5-3v3m3-3v3M-9-7q-2-1-1-3", VARKEN, "k-varken o2");
  // Een stad of een huis in doorsnede: platte huizen in een rij, l = [[x, boven, breed], …], tot y = onder.
  const huizen = (l, k = "k-duin", onder = 140) => `<path class="${k} o" d="${rij(l, (x, y, b) => `M${x} ${onder}V${y}h${b}V${onder}z`)}"/>`;
  // Een aar als lens van (x0, y0) aan de halm tot de punt (x1, y1), w breed.
  const aar = (x0, y0, x1, y1, w) => { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, l = Math.hypot(x1 - x0, y1 - y0), px = (-(y1 - y0) / l) * w, py = ((x1 - x0) / l) * w;
    return `M${x0} ${y0}Q${h(mx + px)} ${h(my + py)} ${x1} ${y1}Q${h(mx - px)} ${h(my - py)} ${x0} ${y0}z`; };
  const deuren = (l) => `<path class="k-hout2" d="${rij(l, (x, y) => `M${x} ${y}h3v5h-3z`)}"/>`;

  Object.assign(BR.taferelen, {
    // Genesis 1:14–21: de lichten aan het uitspansel tot scheiding van dag en nacht, de zon, de maan en de sterren; de
    // wateren vol levende zielen en de grote vissen; het gevogelte boven de aarde. (1:11–12: het gras en de bomen.)
    schepping: { n: "God maakt alles",
      label: "Links de nacht met de maan en de sterren, rechts komt de zon op. In de zee zwemmen vissen en een grote vis; op het land groeien bomen en planten, en er verschijnen vogels in de lucht.",
      svg: `<path class="k-nacht" d="M0 0h104q22 40 0 84H0z"/>` + sterren(veld(26, 7, 6, 100, 6, 78)) + sterren([[18, 20], [70, 12], [88, 50]], 1) +
        `<path class="k-okerz" d="M52 16a11 11 0 1 0 10 17 9 9 0 1 1-10-17z"/>` +
        `<g class="tf-e-rijs"><circle class="k-gloed" cx="258" cy="34" r="24"/><circle class="k-licht" cx="258" cy="34" r="16"/><circle class="k-oker" cx="258" cy="34" r="10"/></g>` +
        `<path class="l-hout2 tf-e-in tf-w4" d="M166 36q3-3 6 0 3-3 6 0M188 22q2.5-2.5 5 0 2.5-2.5 5 0M212 48q2-2 4 0 2-2 4 0M142 54q2-2 4 0 2-2 4 0"/>` +
        `<path class="k-zee" d="M0 84h320v56H0z"/><path class="k-zee2" d="M0 116q60-6 120 0t90-2v26H0z"/>` +
        `<path class="k-groen" d="M152 140q8-34 46-50t122-10v60z"/><path class="k-land" d="M200 140q10-22 46-30t74-4v34z"/>` +
        K.eik(232, 104, 1) + K.palm(294, 100, 1) + K.boom(206, 112, 0.9) + K.struik(262, 126) + K.struik(178, 122, 0.8) +
        `<path class="k-water2" d="${rij([[22, 96], [48, 104], [96, 94], [118, 106], [30, 112]], (x, y) => `M${x} ${y}q5-4 10 0-5 4-10 0zm10 0l4-3v6z`)}"/>` +
        `<path class="k-water o2" d="M50 128q18-9 40-2l7-5v14l-7-5q-22 7-40-2z"/>` +
        `<g class="tf-l-golf">${K.golf(70, 90) + K.golf(124, 96) + K.golf(140, 128, 14) + K.golf(14, 124, 14)}</g>` },

    // Genesis 2:8–10: een hof in Eden, alle geboomte begeerlijk voor het gezicht en goed tot spijze, de boom des levens en
    // de boom der kennis in het midden; een rivier gaat uit Eden en wordt verdeeld tot vier hoofden.
    eden: { n: "De hof in Eden",
      label: "Een hof vol bomen, met in het midden twee bomen met vruchten. Uit Eden stroomt een rivier die de hof bewatert; verderop verdeelt hij zich in vier rivieren. Het water beweegt zacht.",
      svg: `<g class="tf-l-drijf">${K.wolk(58, 24, 0.8) + K.wolk(258, 18, 0.7)}</g>` + K.verte + `<path class="k-groen" d="M0 72q80-14 160-8t160-4v80H0z"/><path class="k-salie" d="M0 114q90-10 170-2t150-6v34H0z"/>` +
        `<ellipse class="k-zee" cx="160" cy="62" rx="9" ry="3"/><path class="l-water breed" d="M160 62V90M160 90Q110 104 46 140M160 90Q142 114 130 140M160 90Q178 114 192 140M160 90Q212 104 280 140"/>` +
        `<path class="l-wit tf-l-golf" d="M157 76q2-2 4 0M100 112q2-2 4 0M135 124q2-2 4 0M183 124q2-2 4 0M228 116q2-2 4 0"/>` +
        K.eik(126, 92, 1.25) + K.eik(196, 92, 1.25) + `<path class="k-terra" d="${rij([[118, 64], [130, 58], [136, 70], [188, 62], [202, 58], [206, 70], [120, 74], [194, 74]], (x, y) => cirkel(x, y, 1.6))}"/>` +
        K.boom(42, 98, 1.1) + K.palm(80, 94, 1) + K.boom(250, 96, 1.1) + K.palm(290, 92, 1) + K.boom(20, 118, 0.9) + K.eik(300, 126, 0.8) + K.struik(86, 122) + K.struik(236, 128, 0.9) },

    // Genesis 15:5: ‘Toen leidde Hij hem uit naar buiten, en zeide: Zie nu op naar den hemel, en tel de sterren, indien gij
    // ze tellen kunt.’ Abram staat buiten bij zijn tent; de sterren komen er steeds meer bij.
    sterren: { n: "Tel de sterren",
      label: "Nacht. Abram staat buiten bij zijn tent en kijkt omhoog. Steeds meer sterren verschijnen aan de hemel, meer dan je kunt tellen.",
      svg: nacht + `<path class="k-berg2" d="M0 98q60-18 120-8t110-6 90 8v48H0z"/><path class="k-land" d="M0 114q90-10 180-4t140-4v34H0z"/>` + K.tent(214, 120, 1.4, "k-hout") +
        mensen([[150, 128, 2.2]], "k-wit") + sluier +
        `<g class="tf-e-in">${sterren(veld(18, 11, 4, 316, 4, 86)) + sterren([[40, 22], [200, 14], [282, 40]], 1)}</g>` +
        `<g class="tf-e-in tf-w3">${sterren(veld(26, 23, 4, 316, 4, 88))}</g><g class="tf-e-in tf-w5">${sterren(veld(34, 37, 4, 316, 4, 90)) + sterren([[120, 30], [250, 62]], 1)}</g>` +
        `<g class="tf-e-in tf-w7">${sterren(veld(44, 53, 4, 316, 2, 92))}</g><g class="tf-e-in tf-w9">${sterren(veld(52, 71, 2, 318, 2, 94))}</g>` },

    // Genesis 24:10–11, 15: tien kemelen, buiten de stad van Nahor bij een waterput, des avondtijds; Rebekka komt uit met
    // haar kruik op haar schouder. (24:20: de drinkbak.)
    "put-nahor": { n: "Bij de put van Nahor",
      label: "Avond bij de waterput buiten de stad van Nahor. De tien kamelen van Abrahams knecht knielen bij de put, naast de drinkbak. Uit de stad komt een jonge vrouw met haar kruik op de schouder.",
      svg: `<path class="k-morgen" d="M0 46q160-14 320 0v44H0z"/>` + K.verte + K.stad(262, 88, 0.5) + `<path class="k-land" d="M0 92q90-10 180-4t140-6v58H0z"/><path class="k-zand" d="M0 124q100-10 200-2t120-6v24H0z"/>` +
        `<g transform="translate(142 18) scale(.8)"><path class="k-zand o" d="M128 96v17a32 9 0 0 0 64 0V96z"/><path class="l-zand2" d="M129 105q31 9 62 0M144 105v13M160 107v14M176 105v13"/><ellipse class="k-duin o" cx="160" cy="96" rx="32" ry="9"/><ellipse class="k-water2" cx="160" cy="96.5" rx="23" ry="5.5"/></g>` +
        `<path class="k-zand o" d="M190 106h34l-3 8h-28z"/><path class="k-zee" d="M193 108h28l-1 2.5h-26z"/>` +
        `<path class="l-hout2" d="${rij([[22, 106, 1.3], [50, 104, 1.3], [78, 106, 1.3], [106, 104, 1.3], [134, 106, 1.3], [16, 130, 1.6], [50, 128, 1.6], [84, 130, 1.6], [118, 128, 1.6], [152, 130, 1.6]], (x, y, s) => vorm("M-6 0h4.5m4 0h4.5", x, y, s))}"/>` +
        rij([[22, 106, 1.3], [50, 104, 1.3], [78, 106, 1.3], [106, 104, 1.3], [134, 106, 1.3], [16, 130, 1.6], [50, 128, 1.6], [84, 130, 1.6], [118, 128, 1.6], [152, 130, 1.6]], kameelKniel) +
        `<g class="tf-e-kom-r">${vrouwen([[244, 118, 1.6]], "k-oker")}<path class="k-terra o2" d="M248 96q-3 0-3 3.5t3 3.5 3-3.5-3-3.5z"/></g>` },

    // Genesis 37:24–25: ‘de kuil was ledig; er was geen water in’; een reisgezelschap van Ismaëlieten kwam uit Gilead, en
    // hun kemelen droegen specerijen, balsem en mirre, om dat af te brengen naar Egypte. Gilead ligt in het oosten (rechts).
    "kuil-karavaan": { n: "De kuil en de karavaan",
      label: "Bij Dothan is een kuil in de grond, leeg en zonder water. Over de weg komt een karavaan met kamelen uit Gilead, beladen met specerijen, balsem en mirre, op weg naar Egypte.",
      svg: `<path class="k-berg2" d="M0 76q60-14 120-6t110-14 90-4v88H0z"/><path class="k-berg" d="M220 82q30-30 56-26t44 10v30z"/>` +
        `<path class="k-land" d="M0 90q90-10 180-4t140-6v60H0z"/><path class="k-zand" d="M0 124q100-10 200-2t120-6v24H0z"/><path class="l-duin breed" d="M0 104q70 0 140 4t180-12"/>` +
        `<ellipse class="k-steen o" cx="74" cy="122" rx="24" ry="8"/><ellipse class="k-hout2" cx="74" cy="122" rx="17" ry="5"/><path class="l-zand2" d="M64 122l3 2M80 121l3 2M72 125h4"/>` +
        K.struik(30, 118) + K.struik(116, 128, 0.9) + K.boom(140, 96, 0.9) +
        `<g class="tf-e-kom-r"><g transform="translate(468 0) scale(-1 1)">` + vee(kamelen([[214, 104, 2], [248, 102, 2], [282, 100, 2]])) +
        `<path class="k-oker o2" d="${rij([[214, 104], [248, 102], [282, 100]], (x, y) => vorm("M-6-16h7v4h-7zM1-15h5v3h-5z", x, y, 2))}"/>` + mensen([[188, 106, 1.7], [306, 100, 1.7]], "k-wit") + `</g></g>` },

    // Genesis 41:1–7: aan de rivier zeven koeien, schoon van aanzien en vet; zeven andere, lelijk en dun, aan den oever;
    // zeven aren in één halm, vet en goed, en zeven dunne en van den oostenwind verzengde aren.
    "farao-droom": { n: "De dromen van de farao",
      label: "Aan de rivier weiden zeven vette koeien in het gras; zeven magere koeien staan aan de oever. Rechts zeven volle aren aan één halm en zeven dunne, verschroeide aren.",
      svg: K.verte + `<path class="k-groen" d="M0 78q100-12 214-6v68H0z"/><path class="k-land" d="M214 72q60-4 106 2v66H214z"/>` +
        `<path class="k-zee" d="M0 118q60-8 120-2t94 8v16H0z"/><g class="tf-l-golf">${K.golf(20, 128) + K.golf(84, 126) + K.golf(150, 132)}</g>` + K.palm(206, 80, 0.9) +
        vee(runderen([[20, 98, 1.25], [46, 96, 1.25], [72, 98, 1.25], [98, 96, 1.25], [124, 98, 1.25], [150, 96, 1.25], [176, 98, 1.25]]), mager([[18, 116], [42, 114], [66, 116], [90, 114], [114, 116], [138, 114], [162, 116]])) +
        `<path class="l-oker dik" d="M244 132V52"/>` + [[244, 52, 0], [244, 64, -1], [244, 64, 1], [244, 78, -1], [244, 78, 1], [244, 92, -1], [244, 92, 1]].map(([x, y, k]) => `<path class="k-oker o2" d="${aar(x, y, x + 8 * k, y - (k ? 12 : 14), 4)}"/>`).join("") +
        `<path class="l-zand2 dik" d="M286 132q-2-40 0-74"/>` + [[286, 58, 0], [286, 68, -1], [286, 68, 1], [286, 80, -1], [286, 80, 1], [286, 92, -1], [286, 92, 1]].map(([x, y, k]) => `<path class="k-zand2 o2" d="${aar(x, y, x + 9 * k + (k ? 0 : 2), y - (k ? 9 : 12), 1.6)}"/>`).join("") },

    // Exodus 10:21–23: een dikke duisternis in het ganse Egypteland, drie dagen; ‘zij zagen de een den ander niet … maar bij
    // al de kinderen Israëls was het licht in hun woningen.’ Gosen ligt in het oosten van de Nijldelta (rechts).
    duisternis: { n: "Duisternis over Egypte",
      label: "Links Egypte: een dikke duisternis valt over het land, drie dagen lang, zodat niemand de ander kan zien. Rechts Gosen: bij de Israëlieten is het licht in hun huizen.",
      svg: K.verte + `<path class="k-land" d="M0 88q90-10 180-4t140-6v62H0z"/><path class="k-zand" d="M0 122q100-10 200-2t120-6v26H0z"/>` +
        huizen([[20, 74, 18], [40, 64, 22], [64, 70, 16], [84, 60, 24], [110, 72, 20], [132, 66, 18], [152, 74, 20]], "k-wit", 100) + deuren([[27, 95], [49, 95], [94, 95], [118, 95], [158, 95]]) +
        K.palm(8, 112, 1) + K.palm(176, 108, 1.1) + K.struik(70, 120) + K.struik(140, 126, 0.9) +
        huizen([[222, 86, 18], [244, 80, 22], [270, 88, 18], [292, 82, 20]], "k-duin", 108) + deuren([[229, 103], [253, 103], [277, 103], [300, 103]]) +
        `<path class="k-venster" d="${rij([[226, 90], [248, 86], [262, 86], [274, 92], [296, 88]], (x, y) => `M${x} ${y}h3v4h-3z`)}"/>` + K.schaap(234, 124) + K.schaap(262, 128) + K.schaap(288, 124) +
        `<g class="tf-e-in"><path class="k-sluier" d="M0 0h196q-14 70 6 140H0z"/><path class="k-sluier" d="M0 0h196q-14 70 6 140H0z"/><path class="k-sluier" d="M0 0h190q-14 70 6 140H0z"/></g>` },

    // Exodus 32:4–5, 19: een gegoten kalf, met een altaar ervoor; Mozes ‘wierp de tafelen uit zijn handen, en verbrak ze
    // beneden aan den berg.’ Geen reien en geen mensen.
    "gouden-kalf": { n: "Het gouden kalf",
      label: "In het kamp onder de berg staat het gegoten kalf van goud op een voetstuk, met een altaar ervoor. Beneden aan de berg liggen de twee stenen tafelen, gebroken.",
      svg: `<path class="k-berg2" d="M0 80q60-20 110-10t80-12 130 6v76H0z"/><path class="k-berg" d="M168 96 236 18l26 30 14-8 44 56z"/><path class="k-schaduw" d="M236 18l26 30 14-8 44 56h-70l-6-40z"/>` +
        `<path class="k-land" d="M0 96q90-10 180-4t140-6v54H0z"/><path class="k-zand" d="M0 126q100-10 200-2t120-6v22H0z"/>` +
        rij([[20, 100], [52, 98], [86, 100], [16, 120], [196, 102]], (x, y) => K.tentje(x, y)) +
        `<circle class="k-gloed tf-l-gloed" cx="120" cy="80" r="26"/><path class="k-zand2 o" d="M104 104V92h32v12z"/>` +
        `<g transform="translate(118 92) scale(2.2)"><path class="l-hout2" d="M-8-5v5m3-5v5m8-5v5m3-5v5M-10-10q-3 1-2 6"/><path class="k-oker o" d="M-10-11h17q2 0 3-2l3-1q3 0 3 3v3q0 2-2 2h-2l-3 2q0 1-2 1h-14q-3 0-3-3z"/><path class="l-hout2" d="M12.5-14q0-2 2-3M15-14q1-2 3-2M10-11.5l-3-1.5"/></g>` +
        K.steen("M108 126l-1-8 6-4 8 1 2 7-3 4", "k-duin") + K.steen("M124 126l0-8 7-3 8 2 1 6-4 3") + K.steen("M115 114l0-6 6-3 8 1 1 6-4 2", "k-duin") +
        `<path class="k-steen o" d="M226 126l2-14 9 1-1 6 2 4-2 3z"/><path class="k-steen o" d="M240 127l1-7 3-2 2-6 7 1-2 14z"/><path class="k-steen o" d="M262 130l3-13 8 2-2 5 1 6z"/><path class="k-steen o" d="M275 132l2-7 2-1 1-5 8 2-3 11z"/>` },

    // Numeri 13:23: in het dal Eskol ‘sneden zij van daar een rank af met een tros wijndruiven, dien zij droegen met tweeën,
    // op een draagstok; ook van de granaatappelen en van de vijgen.’
    druiventros: { n: "De tros uit Eskol",
      label: "Het dal Eskol, met wijngaarden. Twee mannen dragen samen op een draagstok een rank met een grote tros druiven. Vooraan liggen granaatappels en vijgen.",
      svg: K.verte + `<path class="k-groen" d="M0 80q90-12 180-4t140-8v72H0z"/><path class="k-land" d="M0 112q90-8 180-2t140-4v34H0z"/>` +
        `<path class="l-salie2 dik" d="M10 92q40-3 80 0M120 90q40-3 80 0M220 88q44-3 92 0M20 102q50-2 100 0M150 100q60-2 150 0"/>` +
        `<path class="k-salie" d="${rij(veld(16, 5, 12, 308, 86, 100), (x, y) => cirkel(x, y, 2))}"/>` +
        `<g class="tf-e-kom">` + mensen([[116, 134, 2.6]], "k-wit") + mensen([[212, 134, 2.6]], "k-terra") + `<path class="l-hout dik" d="M106 102h116"/>` +
        `<path class="l-salie2" d="M164 102v8"/><path class="k-lila o2" d="${rij([[158, 112], [164, 112], [170, 112], [155, 117], [161, 117], [167, 117], [173, 117], [158, 122], [164, 122], [170, 122], [161, 127], [167, 127], [164, 132]], (x, y) => cirkel(x, y, 3))}"/>` +
        `<path class="k-salie2" d="M168 108q8-4 12 2-6 2-12-2z"/></g>` +
        `<path class="k-hout o" d="M34 134q0-10 4-10h26q4 0 4 10z"/><path class="k-terra2 o2" d="${cirkel(44, 122, 4) + cirkel(55, 121, 4)}"/><path class="l-hout2" d="M44 118v-2M55 117v-2"/>` +
        `<path class="k-hout2 o2" d="M74 132q-4-1-3-5 2-3 5-1 2 3-2 6zM84 134q-4-1-3-5 2-3 5-1 2 3-2 6z"/>` },

    // Numeri 22:24–27: een pad der wijngaarden, ‘zijnde een muur aan deze, en een muur aan gene zijde’; de ezelin ‘leide zich
    // neder onder Bileam’. De Engel des HEEREN die op het pad stond, wordt niet afgebeeld.
    ezelin: { n: "De ezelin van Bileam",
      label: "Een smal pad tussen de wijngaarden, met aan weerszijden een muur. De ezelin is op het pad gaan liggen, met Bileam op haar rug; verder kan ze niet.",
      svg: K.verte + `<path class="k-groen" d="M0 70h320v70H0z"/><path class="k-duin" d="M138 140 156 76h8l18 64z"/>` +
        `<path class="l-salie2 dik" d="M8 80q40-3 80 0M14 90q40-3 80 0M230 80q40-3 80 0M226 90q40-3 80 0"/><path class="k-salie" d="${rij(veld(14, 3, 10, 310, 74, 94), (x, y) => cirkel(x, y, 2))}"/>` +
        `<path class="k-duin" d="M60 140 150 76h20l90 64z"/>` +
        `<path class="k-zand o" d="M0 104 152 72v4L58 140H0z"/><path class="k-zand o" d="M320 104 168 72v4l94 64h58z"/>` +
        `<path class="l-zand2" d="M0 118l146-40M0 130l136-46M320 118 174 78M320 130 184 84M30 100v36M74 92v26M110 84v14M290 100v36M246 92v26M210 84v14"/>` +
        `<g transform="translate(160 134) scale(3.2)"><path class="l-hout2" d="M-6 0h4m5 0h4M6.5-11.5l-1-4M8-11.5l.5-4"/><path class="k-steen o2" d="${vorm(EZEL, 0, 2.5, 1)}"/></g>` +
        mensen([[154, 112, 2]], "k-terra") },

    // 1 Samuël 3:3: ‘En Samuël zich ook nedergelegd had, eer de lampe Gods uitgedaan werd, in den tempel des HEEREN, waar de
    // ark Gods was.’ Het huis is opengewerkt; de ark wordt niet getekend.
    "lamp-silo": { n: "De lamp in Silo",
      label: "Nacht in Silo, in het huis van de HEERE; de voorkant is weggelaten zodat je naar binnen kijkt. De lamp van God brandt nog; Samuël ligt te slapen.",
      svg: nacht + `<path class="k-berg2" d="M0 96q60-18 120-8t110-8 90 6v54H0z"/><path class="k-land" d="M0 116q90-8 180-4t140-4v32H0z"/>` + K.boom(36, 112, 1.1) + K.boom(286, 110, 1) + sluier +
        sterren(veld(30, 19, 4, 316, 4, 70)) +
        `<path class="k-duin o" d="M86 124V58l74-20 74 20v66z"/><path class="k-zand2" d="M96 120V64l64-16 64 16v56z"/><path class="k-schijn tf-l-gloed" d="${cirkel(190, 84, 30)}"/>` +
        `<path class="k-hout o2" d="M186 120v-26h8v26zM182 94h16v-3h-16z"/>` + K.vlam(190, 91, 0.55) +
        `<path class="k-terra o2" d="M108 120v-4h52v4z"/><g transform="translate(118 116) rotate(-90)">${mensen([[0, 0, 1.6]], "k-wit")}</g>` },

    // 2 Koningen 5:9, 14: Naäman kwam met zijn paarden en met zijn wagen; ‘Zo klom hij af, en doopte zich in de Jordaan
    // zevenmaal, naar het woord van den man Gods; en zijn vlees kwam weder.’ De zeven kringen tellen het onderdompelen.
    naaman: { n: "Naäman in de Jordaan",
      label: "De Jordaan. Op de oever staan de paarden en de wagen van Naäman. Naäman staat in het water; om hem heen verschijnen een voor een zeven kringen: zeven keer gaat hij onder water.",
      svg: `<path class="k-berg2" d="M0 66q70-18 150-8t170-4v86H0z"/><path class="k-groen" d="M0 82q80-6 160-2t160-2v62H0z"/>` +
        `<path class="k-zee oever" d="M0 98q80-6 160 0t160 0v20q-80 6-160 0T0 118z"/>` + `<path class="k-land" d="M0 124q80-4 160 0t160 0v16H0z"/>` +
        K.palm(250, 90, 1) + K.struik(294, 88) + K.struik(12, 90) +
        vee(paarden([[36, 94, 1.7], [58, 96, 1.7]])) + `<path class="k-hout o" d="M74 88h28v-10H74z"/><circle class="k-hout2 o2" cx="86" cy="91" r="6"/><path class="l-hout2" d="M74 84H62"/>` +
        [10, 14, 18, 22, 26, 30, 34].map((r, i) => `<ellipse class="l-wit tf-e-in tf-w${i + 1}" cx="170" cy="110" rx="${r}" ry="${h(r * 0.28)}"/>`).join("") +
        `<path class="k-wit o2" d="M162 112q0-9 8-9t8 9z"/><circle class="k-hout o2" cx="170" cy="98" r="3.4"/>` },

    // 2 Koningen 20:20: Hizkia maakte ‘den vijver en den watergang, en heeft water in de stad gebracht’; 2 Kronieken 32:30:
    // hij ‘stopte den opperuitgang der wateren van Gihon, en leidde ze recht af beneden naar het westen der stad Davids’.
    watergang: { n: "De watergang van Hizkia",
      label: "Doorsnede van de stad van David. Rechts in het dal ontspringt de bron Gihon. Onder de stad door loopt een gang naar het westen, naar een vijver in de stad; het water stroomt erdoorheen.",
      svg: `<path class="k-land" d="M0 66q40-16 90-16t110 2 80 26 40 18v44H0z"/><path class="k-zand2" d="M0 86q60-8 140-6t130 16 50 16v28H0z"/>` +
        `<path class="l-zand2" d="M0 104q80-6 160 0t160 4M0 122q80-4 160 0t160 2"/>` +
        huizen([[60, 34, 18], [80, 28, 22], [104, 34, 16], [122, 26, 24], [148, 34, 18], [168, 30, 20]], "k-duin", 52) + deuren([[66, 47], [90, 47], [130, 47], [175, 47]]) + K.muur(30, 40, 172, 14) +
        `<path class="k-zee o" d="M38 64h30l-3 10H41z"/><path class="k-steen o" d="M270 96l12-6 18 4 2 12-14 4-16-4z"/><ellipse class="k-zee" cx="286" cy="100" rx="9" ry="4"/>` +
        `<path class="l-hout2 breed" d="M282 100C250 112 226 92 200 102S150 118 122 104 72 92 54 74"/>` +
        `<path class="l-water dik tf-e-teken" pathLength="1" d="M282 100C250 112 226 92 200 102S150 118 122 104 72 92 54 74"/>` },

    // Daniël 2:31–35: een groot beeld, het hoofd van goed goud, de borst en de armen van zilver, de buik en de dijen van
    // koper, de schenkelen van ijzer, de voeten eensdeels van ijzer en eensdeels van leem; ‘een steen afgehouwen zonder
    // handen, die sloeg dat beeld aan zijn voeten.’ Het beeld heeft geen gezicht.
    "beeld-droom": { n: "Het beeld uit de droom",
      label: "Een groot beeld: het hoofd van goud, de borst en de armen van zilver, de buik en de dijen van koper, de schenkels van ijzer en de voeten deels van ijzer en deels van leem. Een steen, niet door handen afgehouwen, komt aan en slaat tegen de voeten.",
      svg: `<path class="k-berg2" d="M0 96q70-14 150-8t170-4v56H0z"/><path class="k-land" d="M0 118q90-8 180-4t140-4v30H0z"/><circle class="k-gloed tf-l-gloed" cx="150" cy="64" r="56"/>` +
        `<path class="k-oker o" d="M144 22q0-9 6-9t6 9v4q0 5-6 5t-6-5z"/>` +
        `<path class="k-steen o" d="M136 33h28l2 22h-32zM135 34l-9 24h5l6-14zM165 34l9 24h-5l-6-14z"/><path class="l-wit" d="M140 38l2 14M158 38l-2 14"/>` +
        `<path class="k-terra o" d="M134 55h32l-2 27h-28z"/><path class="k-donker o" d="M137 82h10l-1 30h-8zM153 82h10l-1 30h-8z"/>` +
        `<path class="k-donker o" d="M136 112h11v8h-13zM153 112h11l2 8h-13z"/><path class="k-zand2" d="M140 114h4v6h-5zM157 114h4l1 6h-5z"/>` +
        `<g class="tf-e-kom-r"><path class="k-steen o" d="M176 120l3-9 10-3 9 5 1 8-6 3h-13z"/></g>` },

    // Johannes 2:6–9: ‘zes stenen watervaten, … elk houdende twee of drie metreten’; ‘zij vulden ze tot boven toe’; het water
    // werd wijn. De Heere Jezus wordt niet afgebeeld; ook niet de dienaren of de hofmeester.
    kana: { n: "Zes stenen watervaten",
      label: "Zes stenen watervaten staan klaar, tot boven toe met water gevuld. Het water wordt wijn.",
      svg: `<path class="k-duin" d="M0 0h320v96H0z"/><path class="k-hout2" d="M138 96V40a22 22 0 0 1 44 0v56z"/><path class="l-zand2" d="M0 30h130M190 30h130M0 62h130M190 62h130"/>` +
        `<path class="k-zand" d="M0 96h320v44H0z"/><path class="l-zand2" d="M0 110h320"/>` +
        [30, 82, 134, 186, 238, 290].map((x) => `<path class="k-steen o" d="${vorm("M-10 0q-6-12-5-24 1-6 6-8h18q5 2 6 8 1 12-5 24zM-9-32v-3h18v3z", x, 132, 1)}"/>`).join("") +
        `<path class="k-wijn" d="${[30, 82, 134, 186, 238, 290].map((x) => `M${x - 9} 97.5q9 3.5 18 0-9-3.5-18 0z`).join("")}"/>` +
        `<path class="k-water tf-e-uit tf-w5" d="${[30, 82, 134, 186, 238, 290].map((x) => `M${x - 9} 97.5q9 3.5 18 0-9-3.5-18 0z`).join("")}"/>` },

    // Mattheüs 7:24–27: het huis op de steenrots ‘is niet gevallen’; het huis op het zand ‘is gevallen, en zijn val was groot.’
    // Er is slagregen, er zijn waterstromen en winden.
    "rots-zand": { n: "Op de rots en op het zand",
      label: "Slagregen, waterstromen en wind. Het huis links staat op de rots en blijft staan. Het huis rechts staat op het zand en valt.",
      svg: K.wolk(60, 20, 1.3, "k-donker") + K.wolk(180, 14, 1.5, "k-donker2") + K.wolk(276, 24, 1.2, "k-donker") +
        `<path class="l-water tf-l-golf" d="${rij(veld(26, 13, 10, 310, 34, 80), (x, y) => `M${x} ${y}l-4 10`)}"/><path class="l-wit tf-l-golf tf-w3" d="M120 52q20-6 34 2M140 64q16-4 26 2M30 50q14-4 24 2"/>` +
        `<path class="k-land" d="M0 104q90-8 180-4t140-4v44H0z"/><path class="k-steen o" d="M24 140l6-34 16-12 30-2 18 10 8 38z"/><path class="k-zand" d="M180 140q20-34 60-36t80 6v30z"/>` +
        `<path class="k-zee" d="M98 140q20-14 40-12t50 4 30 8z"/><g class="tf-l-golf">${K.golf(120, 136) + K.golf(156, 134)}</g>` +
        K.huis(40, 66, 40, 28, "k-wit") + `<path class="k-terra o" d="M36 66h48l-4-6H40z"/>` +
        K.steen("M210 112l-2-6 6-4 9 1 3 6-3 4", "k-duin") + K.steen("M226 112l1-7 8-3 8 3 0 6-5 2", "k-wit") + K.steen("M244 114l-1-6 6-4 9 2 2 6-4 3", "k-duin") + K.steen("M216 104l1-5 6-2 6 2 0 4-4 2", "k-wit") + `<path class="l-hout dik" d="M234 102l14-6"/>` +
        `<g class="tf-e-stort">${K.huis(210, 70, 40, 34, "k-wit")}<path class="k-terra o" d="M206 70h48l-4-6h-40z"/></g>` },

    // Johannes 5:2–3: te Jeruzalem aan de Schaapspoort een badwater, Bethesda, ‘hebbende vijf zalen. In dezelve lag een grote
    // menigte van kranken … wachtende op de roering des waters.’
    bethesda: { n: "Het badwater Bethesda",
      label: "Het badwater Bethesda bij de Schaapspoort in Jeruzalem, met vijf zalen. Daarin liggen veel zieken die wachten tot het water in beweging komt.",
      svg: K.muur(0, 22, 320, 26) + K.toren(18, 10, 22, 38) + `<path class="k-hout2" d="M25 48v-12a4 4 0 0 1 8 0v12z"/>` +
        `<path class="k-zand" d="M0 48h320v92H0z"/>` +
        [30, 92, 154, 216, 278].map((x) => `<path class="k-terra o" d="M${x - 28} 54h56l-4-6h-48z"/>`).join("") +
        `<path class="k-schaduw" d="${[30, 92, 154, 216, 278].map((x) => `M${x - 26} 54h52v24h-52z`).join("")}"/><path class="k-wit o2" d="${[30, 92, 154, 216, 278].map((x) => [-24, -8, 8, 22].map((d) => `M${x + d} 54h3v24h-3z`).join("")).join("")}"/>` +
        `<path class="k-wit o2" d="${rij([[16, 76], [40, 75], [76, 76], [104, 75], [140, 76], [168, 75], [204, 76], [228, 75], [264, 76], [290, 75]], (x, y) => `M${x} ${y}h10a2 2 0 0 1 0 4h-10z`)}"/><path class="k-hout o2" d="${rij([[14, 77], [38, 76], [74, 77], [102, 76], [138, 77], [166, 76], [202, 77], [226, 76], [262, 77], [288, 76]], (x, y) => cirkel(x, y, 2))}"/>` +
        `<path class="k-zee o" d="M24 92h272l-10 38H34z"/><path class="k-zee2" d="M40 116h240l-6 14H46z"/><g class="tf-l-golf">${K.golf(70, 102, 16) + K.golf(150, 108, 16) + K.golf(230, 100, 16) + K.golf(110, 122, 16)}</g>` },

    // Lukas 10:30–35: de weg van Jeruzalem naar Jericho; de Samaritaan zette de gewonde ‘op zijn eigen beest, voerde hem in
    // de herberg’; de volgende dag ‘langde hij twee penningen uit, en gaf ze den waard.’
    herberg: { n: "De herberg aan de weg",
      label: "De weg van Jeruzalem naar Jericho slingert door kale heuvels naar beneden. Langs de weg staat de herberg; bij de deur staat het rijdier van de Samaritaan, en op de bank liggen twee penningen voor de waard.",
      svg: `<path class="k-berg2" d="M0 50q50-20 100-10t90-14 130 12v102H0z"/><path class="k-berg" d="M0 70q60-24 120-12t80 4v78H0z"/><path class="k-zand" d="M0 96q90-20 180-8t140 0v52H0z"/>` +
        `<path class="l-duin breed" d="M10 54q40 8 30 22t40 18 70 4 60 20 110 22"/>` + K.struik(54, 100) + K.struik(268, 98) + K.struik(116, 126, 0.9) +
        `<path class="k-duin o" d="M184 104V80h54v24z"/><path class="k-wit o" d="M206 104V70h40v34z"/><path class="k-hout2" d="M224 104v-12h8v12zM212 80h5v4h-5z"/><path class="l-hout2" d="M180 80h60M202 70h48"/>` +
        `<path class="k-hout o2" d="M236 106h14v-3h-14z"/><path class="k-oker o2" d="${cirkel(240, 101, 2) + cirkel(246, 101, 2)}"/>` +
        vee(ezels([[262, 108, 1.6]])) },

    // Lukas 15:15–16: de jongste zoon ‘ging heen, en voegde zich bij een van de burgers deszelven lands; en die zond hem op
    // zijn land om de zwijnen te weiden. En hij begeerde zijn buik te vullen met den draf, dien de zwijnen aten.’
    zwijnen: { n: "Bij de zwijnen",
      label: "Ver weg, in een ander land, zit de jongste zoon bij de zwijnen die hij moet weiden. Ze eten draf uit een bak; hij heeft honger.",
      svg: K.verte + `<path class="k-land" d="M0 84q90-10 180-4t140-6v66H0z"/><path class="k-zand" d="M0 118q100-10 200-2t120-6v30H0z"/><path class="l-duin breed" d="M320 92q-60 0-100-8t-60-10"/>` +
        `<path class="l-hout2" d="M0 104h140M8 98v12M40 98v12M72 98v12M104 98v12M136 98v12"/>` + K.boom(286, 92, 1.1) +
        vee(varkens([[160, 118, 1.5], [192, 120, 1.5], [226, 116, 1.5], [40, 128, 1.4], [256, 128, 1.4]])) +
        `<path class="k-hout o" d="M120 128h44v-7h-44z"/><path class="k-hout2" d="${rij([[126, 123], [134, 122], [142, 123], [150, 122], [158, 123]], (x, y) => `M${x} ${y}q3-2 5 0-3 1-5 0z`)}"/>` +
        K.steen("M74 132l-2-7 6-4 10 1 3 6-3 4", "k-steen") + mensen([[83, 122, 1.5]], "k-terra") },

    // Lukas 22:55, 60: ‘als zij vuur ontstoken hadden in het midden van de zaal (de binnenplaats), en zij te zamen
    // nederzaten’; ‘En terstond, als hij nog sprak, kraaide de haan.’ De Heere Jezus wordt niet afgebeeld.
    haan: { n: "De haan kraait",
      label: "Nacht op de binnenplaats van het huis van de hogepriester. Rond het vuur in het midden zitten mensen zich te warmen. Op de muur kraait een haan; het wordt morgen.",
      svg: nacht + `<path class="k-morgen tf-e-in tf-w3" d="M0 40q160-20 320 0v36H0z"/>` + huizen([[0, 30, 70], [250, 26, 70]], "k-duin", 140) + K.muur(70, 50, 180, 36) +
        `<path class="k-hout2" d="M150 86V66a10 10 0 0 1 20 0v20z"/><path class="k-zand" d="M0 86h320v54H0z"/>` + sluier +
        `<circle class="k-gloed tf-l-gloed" cx="160" cy="116" r="34"/><path class="k-steen o2" d="M146 124q0-4 5-4h18q5 0 5 4z"/>` + K.vlam(154, 121, 0.8, 3) + K.vlam(164, 121, 1) +
        mensen([[122, 124, 1.4], [138, 130, 1.4], [184, 130, 1.4], [200, 124, 1.4]], "k-wit") +
        `<g transform="translate(230 50)"><path class="l-hout2" d="M-1 0v-4M2 0v-4"/><path class="k-terra o2" d="M-6-6q-2-6 3-8l1-6q2-3 5 0l1 3 3 1-3 1v3q5 2 4 6-3 3-10 1z"/><path class="k-terra2" d="M0-21q1-3 3-1-1 0-1 2z"/></g>` +
        `<path class="l-licht tf-e-in tf-w5" d="M243 34q4 2 4 6M248 30q6 4 6 10"/>` },
  });
})();
