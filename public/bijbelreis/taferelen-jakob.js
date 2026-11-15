// Beeldverhaal bij Genesis 32 en 33:1–4: Jakob bij de Jabbok, in tien taferelen (één bij elke stap van het deel
// genesis:jakob-jabbok). Motor, bouwstenen (BR.tfTeken) en standaardbeelden: taferelen.js. Regels en tekenafspraken:
// docs/bijbelreis-taferelen/README.md. Elk tafereel is gecontroleerd met de Statenvertaling (node scripts/sv.mjs "Genesis 32").
// God wordt niet afgebeeld, en de Man Die met Jakob worstelt dus ook niet (32:30: ‘ik heb God gezien van aangezicht tot
// aangezicht’); de engelen van 32:1 evenmin. Mensen staan er wel: klein, als pictogram en zonder gezicht. Jakob herken je
// aan zijn staf (32:10), zijn witte kleed en zijn blauwe hoofddoek. Het is steeds hetzelfde dal: links de ronde berg, in
// het midden de kloof waar de Jabbok uit komt, rechts de vlakke berg; de eik staat bij het veer. Het verhaal gaat van
// links (het kamp) naar rechts (de overkant, waar Ezau vandaan komt). Welke stap welk beeld krijgt: taferelen-koppeling-jakob.js.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.taferelen = BR.taferelen || {};
(function () {
  const K = BR.tfTeken;
  const h = (n) => Math.round(n * 2) / 2;
  // Een cirkel als deel van een pad (één boog die bijna rond is); middelpunt (x, y).
  const cirkel = (x, y, r) => `M${h(x)} ${h(y - r)}a${r} ${r} 0 1 0 .1 0`;
  // Een vorm uit een sjabloon (M absoluut, de rest relatief, zonder bogen) op (x, y), s keer zo groot.
  const vorm = (d, x, y, s) => d.replace(/([a-zA-Z])([^a-zA-Z]*)/g, (_, c, n) => c + (n.match(/-?\d*\.?\d+/g) || []).map((g, i) => h(g * s + (c === "M" ? (i ? y : x) : 0))).join(" ")).replace(/ -/g, "-");
  const rij = (l, f) => l.map((a) => f(...a)).join("");

  // ---------- het dal van de Jabbok ----------
  // Eén landschap, breder dan het beeld (x van -90 tot 480); elk tafereel kijkt door een eigen venster (verschuiving en
  // vergroting). De rug in de verte dient ook als omtrek voor de sluier bij de dageraad.
  const RUG = "M-90 62Q-60 50-30 54T20 46Q50 20 82 46 110 64 140 60 160 70 178 60 200 44 226 44H296Q318 44 336 54T400 56 480 50V140H-90z";
  const dal = (venster) => `<g${venster ? ` transform="${venster}"` : ""}><path class="k-berg2" d="${RUG}"/>` +
    `<path class="k-groen" d="M-90 80Q-40 62 10 72T100 76Q140 70 160 80 190 66 240 70T340 74 480 66V140H-90z"/><path class="l-salie2 rand" d="M-34 68h.1M-22 70h.1M26 68h.1M224 66h.1M236 68h.1M316 68h.1M392 67h.1M404 69h.1"/>` +
    `<path class="k-land" d="M-90 92Q-20 82 60 88T160 90 280 86 480 88V140H-90z"/><path class="k-zand" d="M-90 128Q0 118 100 126T300 122 480 126V140H-90z"/>` +
    // de weg: door het kamp naar het veer, en aan de overkant het land in, naar het zuiden
    `<path class="l-duin breed" d="M-90 112Q-20 102 60 108T152 111M184 113Q230 117 270 105T352 89"/><path class="l-duin dik" d="M356 86Q384 80 402 68"/>` +
    // de beek met groen langs het water, en het veer
    `<path class="k-zee oever" d="M161 67C165 72 170 76 168 80S150 88 150 96 156 108 153 116 147 132 146 140H192C190 132 186 124 182 116S164 104 164 96 178 88 176 80 167 72 164 67z"/>` +
    `<path class="l-wit tf-l-golf" d="M153 100q2-2.5 4 0t4 0M159 113q2.5-2.5 5 0t5 0M156 130q3-2.5 6 0t6 0M172 124q2.5-2.5 5 0t5 0"/>` +
    // de eik bij het veer, de rots aan de overkant en een paar struiken
    `<path class="l-hout2 breed" d="M118 102V90"/><path class="k-salie2" d="${cirkel(110, 82, 8) + cirkel(126, 82, 8) + cirkel(118, 75, 10)}"/><path class="k-salie" d="${cirkel(114, 73, 4.5)}"/>` +
    K.steen("M226 99l-3-8 6-6 10 1 5 7-2 6", "k-steen") + `<path class="k-salie" d="${rij([[136, 116], [198, 106], [66, 96], [300, 96]], (x, y) => `M${x} ${y}q-3-5 3-5 1-4 5-2 4-1 4 3 2 2 0 4z`)}"/></g>`;
  // Vensters: A het kamp op de linkeroever (de beek rechts in beeld), geen venster: het veer in het midden, C dichtbij op
  // de linkeroever, D dichtbij bij het veer met de kloof erboven, E de overkant (de beek links in beeld).
  const A = "translate(76 0)", C = "translate(-15 -28) scale(1.25)", D = "translate(-71 -28) scale(1.25)", E = "translate(-150 0)";
  // Nacht (zie de README): nachtlucht erachter, het land in gewone kleuren, daaroverheen de sluier, de sterren erna.
  const nacht = `<path class="k-nacht" d="M0 0h320v140H0z"/>`, sluier = `<path class="k-sluier" d="M0 0h320v140H0z"/>`;
  // Sterren: kleine stippen, en met g = 1 een paar grotere.
  const sterren = (p, g) => `<path class="l-licht${g ? " dik" : ""}" d="${rij(p, (x, y) => `M${x} ${y}h.1`)}"/>`;

  // ---------- mensen: klein, als pictogram, zonder gezicht ----------
  // Een lang kleed en een hoofd. l = [[x, y, schaal], …], de voeten op (x, y). Een vrouw heeft een doek over het hoofd,
  // in de kleur van haar kleed.
  const LIJF = "M-3 0l1-8.5q2-1.5 4 0l1 8.5z";
  const mensen = (l, k = "k-hout") => `<path class="${k} o2" d="${rij(l, (x, y, s = 1) => vorm(LIJF, x, y, s))}${k === "k-hout" ? "" : `"/><path class="k-hout o2" d="`}${rij(l, (x, y, s = 1) => cirkel(x, y - 11 * s, h(2.2 * s)))}"/>`;
  const vrouwen = (l, k) => `<path class="${k} o2" d="${rij(l, (x, y, s = 1) => vorm(LIJF + "M-2.5-8q-.5-5.5 2.5-5.5t2.5 5.5z", x, y, s))}"/>`;
  // Jakob: wit kleed, blauwe gordel en hoofddoek, de staf in de hand (Genesis 32:10). stand: "" staat, "k" knielt, "l" leunt op de staf.
  const KLEED = `<path class="k-wit o2" d="${LIJF}"/><path class="k-water2" d="M-2.5-5.5h5v1.5h-5z"/>`;
  const KOP = `<circle class="k-hout o2" cy="-11" r="2.2"/><path class="k-water2" d="M-2.5-11a2.5 2.5 0 0 1 5 0z"/>`;
  const STAF = (x) => `<path class="l-hout2" d="M${x} 0v-15q0-2.5-2.5-2.5"/>`;
  const jakob = (x, y, s = 1, stand = "") => `<g ${K.op(x, y, s)}>` + (stand === "k"
    ? STAF(6) + `<path class="k-wit o2" d="M-6 0h9l-.5-7.5q-2-1.5-4 0l-.5 4.5q-4 .5-4 3z"/><path class="k-water2" d="M-2-4.5h4.5v1.5H-2z"/><g transform="translate(.5 1)">${KOP}</g><path class="l-hout2" d="M2.5-6.5l3.5-1.5"/>`
    : stand === "l" ? STAF(7.5) + `<g transform="rotate(10)">${KLEED + KOP}<path class="l-hout2" d="M2-7l3.5-2"/></g>`
    : STAF(5.5) + KLEED + KOP + `<path class="l-hout2" d="M2.5-7l3-1"/>`) + "</g>";

  // ---------- dieren (alle naar rechts, de poten op y); l = [[x, y, schaal], …] ----------
  // Elke soort geeft [de poten, de lijven]; vee(soort, soort, …) zet alle poten van een tafereel in één lijn.
  const vee = (...l) => `<path class="l-hout2" d="${l.map((a) => a[0]).join("")}"/>` + l.map((a) => a[1]).join("");
  const soort = (poten, lijf, k) => (l, kleur = k) => [rij(l, (x, y, s = 1) => vorm(poten, x, y, s)), `<path class="${kleur}" d="${rij(l, (x, y, s = 1) => vorm(lijf, x, y, s))}"/>`];
  const bol = (x, y, rx, ry) => `M${h(x)} ${h(y - ry)}a${h(rx)} ${h(ry)} 0 1 0 .1 0`;
  const kop = (x, y, s = 1) => cirkel(x + 5 * s, y - 7.5 * s, h(1.8 * s));
  // Schapen: wit, met een donkere kop. Geiten: donker, met horens.
  const schapen = (l) => [rij(l, (x, y, s = 1) => vorm("M-2.5-4v4m5-4v4", x, y, s)), `<path class="k-wit o2" d="${rij(l, (x, y, s = 1) => bol(x, y - 6 * s, 5.5 * s, 3.5 * s))}"/><path class="k-hout2" d="${rij(l, kop)}"/>`];
  const geiten = (l) => [rij(l, (x, y, s = 1) => vorm("M-2.5-4v4m5-4v4M5-9l-2-3M6.5-9l-.5-3.5M-5-6.5l-1.5-2", x, y, s)), `<path class="k-hout2" d="${rij(l, (x, y, s = 1) => bol(x, y - 5.5 * s, 5 * s, 3 * s) + kop(x, y, s))}"/>`];
  // De kameel van de atlas (de vorm van de reiziger op de kaart, vereenvoudigd en zonder zadel); een veulen is een kleine kameel.
  const kamelen = soort("M-5-3.5v3.5m2.5-3.5v3.5m6-3.5v3.5m2.5-3.5v3.5", "M-7.5-5.5q0-3.5 3.5-3.5 1-3 3.5-3t3.5 3q2.5-.5 3 2l1.5-5.5q.5-2 3-1.5l1.5.5-.5 1.5h-2l-1.5 7q-.5 2-2.5 2h-11q-2.5 0-2.5-2z", "k-hout o2");
  // Runderen (met horens en een staart) en ezels (grijs, met lange oren).
  const runderen = soort("M-6-4v4m2.5-4v4m6.5-4v4m2.5-4v4M-8-9.5q-1.5 2-1 5M7.5-11.5q-.5-2.5 2-3", "M-8-4.5v-4q0-2 2-2h10.5l1-1h3.5q1.5 0 1.5 1.5v2q0 1.5-1.5 1.5h-3v2.5q0 2-2 2z", "k-terra o2");
  const ezels = soort("M-4.5-3.5v3.5m2-3.5v3.5m5-3.5v3.5m2-3.5v3.5M6.5-11.5l-1-4M8-11.5l.5-4M-6.5-8q-1.5 1.5-1 4", "M-6.5-4v-3q0-2 2-2h8l2-2.5h3l1.5 4-1.5 1.5h-3v2q0 2-2 2z", "k-steen o2");
  // Tenten in de verte: alleen een driehoek met een opening.
  const tentjes = (l, k = "k-zand") => `<path class="${k} o2" d="${rij(l, (x, y) => `M${x - 10} ${y}l10-10 10 10z`)}"/><path class="k-hout2" d="${rij(l, (x, y) => `M${x - 2} ${y}l2-5 2 5z`)}"/>`;

  // Het gezin van Jakob (Genesis 32:22): twee vrouwen (oker), twee dienstmaagden (groen) en elf kinderen. p = de plaatsen,
  // in die volgorde: [vrouw, vrouw, dienstmaagd, dienstmaagd, elf kinderen].
  const gezin = (p, m = 1.15) => ((p) => vrouwen(p.slice(0, 2), "k-oker") + vrouwen(p.slice(2, 4), "k-salie") + mensen(p.slice(4, 10), "k-zand") + mensen(p.slice(10, 15), "k-terra"))(p.map(([x, y, s]) => [x, y, s * m]));

  Object.assign(BR.taferelen, {
    // Genesis 32:1–2: ‘Jakob toog ook zijns weegs; en de engelen Gods ontmoetten hem.’ Getekend is de stoet op weg door Gilead
    // (31:17–18: zijn zonen, zijn vrouwen, zijn vee) en Jakob die stilstaat. De engelen zijn niet getekend: de weg vóór hem is leeg.
    "jabbok-mahanaim": { n: "Jakob trekt verder",
      label: "Het bergland van Gilead, met rechts in het dal de beek Jabbok. Over de weg komt een stoet aan: voorop Jakob met zijn staf, achter hem kamelen, zijn vrouwen en kinderen, en schapen. Jakob staat stil; de weg vóór hem is leeg.",
      svg: `<g class="tf-l-drijf">${K.wolk(250, 22, 0.9)}</g>` + dal(A) + `<g class="tf-e-kom">` + vee(kamelen([[128, 112, 1.15], [102, 114, 1.15]]), schapen([[114, 124, 1.1], [130, 128, 1.1], [100, 130, 1.1], [118, 134, 1.1]])) +
        gezin([[76, 116, 1.1], [64, 113, 1.1], [46, 115, 1.1], [32, 112, 1.1], [86, 121, 0.7], [70, 122, 0.8], [56, 121, 0.6], [40, 120, 0.75], [24, 118, 0.85], [80, 127, 0.6], [52, 127, 0.7], [18, 124, 0.65], [34, 127, 0.55], [66, 129, 0.65], [10, 115, 0.9]]) +
        jakob(176, 116, 1.3) + `</g>` },
    // Genesis 32:3–6: boden naar Ezau in het land Seïr; zij komen terug: ‘ook trekt hij u tegemoet, en vierhonderd mannen met hem’.
    "jabbok-boden": { n: "De boden komen terug",
      label: "Het kamp van Jakob staat op de linkeroever van de Jabbok: tenten, met een vuurtje. Over de weg van de overkant komen de boden terug door het veer; Jakob wacht hen op met zijn staf in de hand.",
      svg: `<g class="tf-l-drijf">${K.wolk(60, 20, 0.9)}</g>` + dal() + tentjes([[14, 100], [58, 98], [92, 101]], "k-hout") + K.tent(34, 110, 0.9) + K.tent(78, 108, 0.8, "k-hout") + K.tent(14, 126, 1.1, "k-hout") + K.tent(62, 128, 1.1) +
        `<path class="k-steen o2" d="M92 133q0-3 4-3h8q4 0 4 3z"/>` + K.vlam(100, 131, 0.6) + K.rook(100, 120, 0.9) + jakob(112, 119, 1.3) +
        `<g class="tf-e-kom-r">${mensen([[131, 121, 1.15], [140, 118, 1.15]]) + mensen([[149, 122, 1.15]], "k-zand")}</g>` },
    // Genesis 32:7–8: ‘hij verdeelde het volk, dat met hem was, en de schapen, en de runderen, en de kemels, in twee heiren’.
    "jabbok-heiren": { n: "Twee heiren",
      label: "Jakob staat met zijn staf in het midden. Links en rechts van hem wijkt het kamp uit elkaar tot twee groepen, met ruimte ertussen: in elke groep tenten, mensen, schapen, runderen en een kameel.",
      svg: dal(A) + [0, 1].map((i) => `<g class="tf-e-wijk-${i ? "r" : "l"}">` + ((d) => tentjes([[22 + d, 102], [60 + d, 100]], i ? "k-zand" : "k-hout") + tentjes([[41 + d, 110]], i ? "k-hout" : "k-zand") +
        mensen([[14 + d, 118, 1.1], [60 + d, 121, 1.1]]) + mensen([[26 + d, 122, 1.1]], "k-zand") + vee(kamelen([[80 + d, 114, 1.1]]), runderen([[40 + d, 130, 1.1]]), runderen([[18 + d, 135, 1.1]], "k-zand2 o2"), schapen([[62 + d, 134, 1.1], [78 + d, 130, 1.1]])))(i * 138) + `</g>`).join("") + jakob(118, 126, 1.4) },
    // Genesis 32:9–12: Jakob bidt. ‘Ik ben met mijn staf over deze Jordaan gegaan, en nu ben ik tot twee heiren geworden!’
    // Dat hij knielt, staat er niet; het is gekozen om te laten zien dat hij bidt.
    "jabbok-gebed": { n: "Jakob bidt",
      label: "Jakob knielt alleen bij de beek, zijn staf in de hand. Achter hem, verderop op de oever, staan de twee kampen, elk met een vuurtje waar rook van opstijgt.",
      svg: `<g class="tf-l-drijf">${K.wolk(70, 24, 0.9)}</g>` + dal(A) + tentjes([[14, 104], [34, 100], [54, 104]], "k-hout") + tentjes([[112, 104], [132, 100], [152, 104]]) + K.vlam(36, 110, 0.5) + K.rook(36, 100, 0.8) + K.vlam(132, 110, 0.5, 3) + K.rook(132, 100, 0.8) +
        vee(schapen([[66, 112, 0.8], [76, 110, 0.8], [98, 112, 0.8]])) + jakob(200, 128, 2, "k") },
    // Genesis 32:13–21: het geschenk voor Ezau. ‘Elke kudde bijzonder … stelt ruimte tussen kudde en tussen kudde.’ De soorten in de
    // volgorde van 32:14–15, de eerste voorop (rechts): geiten, schapen, kamelen met hun veulens, runderen, ezels. Geen aantallen.
    "jabbok-geschenk": { n: "Het geschenk gaat vooruit",
      label: "Over de weg en door het veer trekken vijf kudden achter elkaar naar de overkant, met ruimte ertussen: voorop de geiten, dan de schapen, de kamelen met hun veulens, de runderen en als laatste de ezels. Achter elke kudde loopt een knecht. Jakob blijft met zijn staf bij het kamp staan.",
      svg: dal() + tentjes([[14, 99], [38, 97]], "k-hout") + jakob(62, 103, 1.2) + `<g class="tf-e-trek">` +
        mensen([[262, 108, 0.9], [136, 117], [12, 113]]) + mensen([[198, 118], [72, 115]], "k-zand") +
        vee(geiten([[274, 105, 0.9], [294, 100, 0.9], [285, 108, 0.9]]), schapen([[212, 115], [234, 112], [224, 120]]), kamelen([[151, 115], [176, 116], [163, 122, 0.6], [188, 122, 0.6]]),
          runderen([[90, 113, 0.9], [110, 114, 0.9]]), runderen([[100, 121, 0.9]], "k-zand2 o2"), ezels([[26, 113], [40, 117], [50, 112, 0.7]])) + `</g>` },
    // Genesis 32:22–23: ‘in dienzelfden nacht … zijn twee vrouwen, en zijn twee dienstmaagden, en zijn elf kinderen, en hij toog over
    // het veer van de Jabbok … en hij deed overtrekken hetgeen hij had.’
    "jabbok-veer": { n: "Over het veer van de Jabbok",
      label: "Het is nacht. Door het veer van de Jabbok trekt het gezin van Jakob naar de overkant: twee vrouwen, twee dienstmaagden en elf kinderen. Aan de overkant staan al een kameel en schapen. Jakob staat met zijn staf op de linkeroever en blijft achter.",
      svg: nacht + dal() + `<g class="tf-e-kom">` + vee(kamelen([[286, 108]]), schapen([[262, 112, 0.9], [272, 107, 0.9], [300, 112, 0.9]])) +
        gezin([[236, 118, 1.1], [176, 122, 1.1], [208, 116, 1.1], [150, 118, 1.1], [246, 121, 0.8], [226, 122, 0.65], [218, 120, 0.75], [198, 121, 0.6], [186, 124, 0.8], [166, 125, 0.7], [158, 122, 0.55], [140, 121, 0.75], [130, 118, 0.85], [120, 121, 0.65], [112, 117, 0.9]]) + `</g>` +
        jakob(96, 122, 1.3) + sluier + sterren([[48, 28], [96, 10], [176, 14], [214, 26], [286, 24], [306, 12]]) + sterren([[20, 12], [130, 30], [250, 10]], 1) },
    // Genesis 32:24–26: ‘Doch Jakob bleef alleen over; en een man worstelde met hem, totdat de dageraad opging.’ De worsteling is niet
    // getekend en de Man ook niet: alleen de nacht, de beek en Jakob, alleen.
    "jabbok-nacht": { n: "Jakob blijft alleen over",
      label: "Het is diep in de nacht. Bij de eik aan de Jabbok staat Jakob, helemaal alleen, met zijn staf. De overkant is leeg en donker. Het water stroomt; boven de bergen staan de sterren.",
      svg: nacht + dal(C) + jakob(158, 120, 1.8) + sluier +
        sterren([[44, 22], [118, 8], [186, 34], [206, 10], [262, 8], [308, 6], [224, 30]]) + sterren([[18, 10], [150, 20], [234, 14], [290, 18]], 1) +
        `<circle class="k-okerz tf-l-gloed" cx="170" cy="12" r="1.3"/><circle class="k-okerz tf-l-gloed tf-w4" cx="276" cy="30" r="1.3"/>` },
    // Genesis 32:26–29: ‘de dageraad is opgegaan’; ‘Uw naam zal voortaan niet Jakob heten, maar Israël’; ‘en Hij zegende hem aldaar’.
    // Alleen Jakob en het eerste licht achter de bergen. Dat hij knielt, staat er niet (vergelijk Hosea 12:5: ‘hij weende en smeekte Hem’).
    "jabbok-dageraad": { n: "De dageraad gaat op",
      label: "Nog is het donker in het dal, maar achter de bergen, boven de kloof waar de beek uit komt, komt het eerste licht van de dageraad op en de sterren verbleken. Jakob knielt bij de eik aan de Jabbok, zijn staf in de hand. Er is niemand anders te zien.",
      svg: nacht + sluier + `<g class="tf-e-rijs"><ellipse class="k-morgen" cx="185" cy="60" rx="150" ry="40"/><ellipse class="k-morgen" cx="185" cy="60" rx="104" ry="27"/><ellipse class="k-licht" cx="185" cy="60" rx="70" ry="17"/><ellipse class="k-okerz" cx="185" cy="60" rx="46" ry="10"/></g>` +
        dal(C) + jakob(158, 121, 1.8, "k") + `<path class="k-sluier" transform="${C}" d="${RUG}"/>` +
        sterren([[18, 10], [44, 22], [290, 14]]) + `<g class="tf-e-uit tf-w3">${sterren([[118, 8], [206, 10], [262, 8], [308, 6]]) + sterren([[150, 16], [234, 14]], 1)}</g>` },
    // Genesis 32:30–31: ‘En de zon rees hem op, als hij door Pniël gegaan was; en hij was hinkende aan zijn heup.’
    "jabbok-pniel": { n: "De zon gaat op over Pniël",
      label: "Het is eerst nog donker; dan komt de zon op boven de kloof in de bergen en wordt het dag in het dal. Jakob is door het veer gegaan en loopt aan de overkant verder, hinkend, leunend op zijn staf.",
      svg: `<path class="k-okerz" d="M0 30h320v40H0z"/><g class="tf-e-rijs"><circle class="k-licht" cx="129" cy="40" r="26"/><circle class="k-oker" cx="129" cy="40" r="11"/></g>` + dal(D) +
        `<g class="tf-e-hink">${jakob(190, 126, 2.2, "l")}</g><g class="tf-e-dooft tf-w2">${sluier}</g>` },
    // Genesis 33:1–4: ‘Ezau kwam, en vierhonderd mannen met hem’; de dienstmaagden en haar kinderen vooraan, Lea en haar kinderen meer
    // achterwaarts, Rachel en Jozef de achterste; ‘hij boog zich zeven malen ter aarde’; ‘toen liep Ezau hem tegemoet, en nam hem in den
    // arm, en viel hem aan den hals, en kuste hem; en zij weenden’. De vierhonderd zijn een menigte die buiten het beeld doorloopt.
    "jabbok-ezau": { n: "Ezau loopt Jakob tegemoet",
      label: "Het is dag, aan de overkant van de Jabbok. Rechts komt een grote menigte de weg af: de mannen van Ezau. Links staat het gezin van Jakob in drie groepen achter elkaar. Jakob buigt zich zeven keer naar de aarde; dan loopt Ezau, in het rood, naar hem toe en slaat zijn arm om hem heen.",
      svg: `<g class="tf-l-drijf">${K.wolk(120, 20, 0.9)}</g>` + dal(E) +
        `<path class="menigte" d="M262 100h70M238 116h94M258 132h74"/><path class="menigte m2" d="M248 108h84M244 124h88"/><path class="menigte kop" d="M263.5 95.5h70M249.5 103.5h84M239.5 111.5h94M245.5 119.5h88M259.5 127.5h74"/>` +
        gezin([[66, 117, 1.1], [34, 121, 1.1], [124, 119, 1.1], [138, 122, 1.1], [44, 123, 0.6], [78, 119, 0.9], [88, 122, 0.8], [58, 122, 0.75], [72, 125, 0.7], [82, 128, 0.6], [96, 125, 0.65], [132, 126, 0.7], [118, 125, 0.6], [146, 126, 0.75], [128, 130, 0.55]]) +
        `<g ${K.op(178, 124, 1.5)}>${STAF(-5.5)}<path class="k-wit o2" d="M-3 0l.5-5h5l.5 5z"/><g class="tf-e-buig"><path class="k-wit o2" d="M-2.5-4.5l.5-4q2-1.5 4 0l.5 4z"/>${KOP}</g><path class="k-water2" d="M-2.5-5.5h5v1.5h-5z"/></g>` +
        `<g class="tf-e-kom-r tf-w9"><g ${K.op(187, 124, 1.5)}><path class="k-terra2 o2" d="${LIJF}"/><circle class="k-hout o2" cy="-11" r="2.2"/><path class="l-terra dik" d="M-1-7.5l-5.5-1"/></g></g>` },
  });
  // Bouwstenen die ook andere reeksen gebruiken (taferelen-kerst.js): mensen als pictogram, sterren, en de hulpjes voor paden.
  Object.assign(K, { mensen, vrouwen, sterren, cirkel, vorm, rij });
})();
