// Eigen taferelen bij het Oude Testament, tweede reeks. Motor, bouwstenen (BR.tfTeken) en standaardbeelden: taferelen.js.
// Regels en tekenafspraken: docs/bijbelreis-taferelen/README.md. Bij elk tafereel staat de tekst waarmee het is gecontroleerd
// (Statenvertaling: node scripts/sv.mjs "<verwijzing>"). God, de Heere Jezus en engelen worden niet afgebeeld; mensen ook niet.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.taferelen = BR.taferelen || {};
(function () {
  const K = BR.tfTeken;
  const h = (n) => Math.round(n * 2) / 2;
  const rij = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");
  // ---------- bouwstenen van deze reeks ----------
  // Een rij kleine tenten in één pad (licht in gewicht); l = [[x, y], …].
  const tentjes = (l, k = "k-zand") => `<path class="${k} o2" d="${l.map(([x, y]) => `M${x - 10} ${y}l10-10 10 10z`).join("")}"/><path class="k-hout2" d="${l.map(([x, y]) => `M${x - 2} ${y}l2-5 2 5z`).join("")}"/>`;
  // Riet of biezen: stengels [[x, y, hoogte, buiging], …]; pluim zet er een donkere aar op.
  const riet = (l, k = "l-salie2") => `<path class="${k}" d="${l.map(([x, y, g, b = 0]) => `M${x} ${y}q${b}-${g / 2} ${b * 2}-${g}`).join("")}"/>`;
  const pluim = (l) => l.map(([x, y, g, b = 0]) => `<ellipse class="k-hout2" cx="${x + b * 2}" cy="${y - g - 3}" rx="1.6" ry="4"/>`).join("");
  // Eén ruwe steen (linksonder op x, y) en een stapel in rijen van onder naar boven: twaalf stenen = [5, 4, 3] of [4, 4, 4].
  const KL = ["k-zand", "k-steen", "k-duin"];
  const st = (x, y, w, g, k) => `<path class="${k} o" d="M${h(x)} ${y}l${h(-0.08 * w)} ${h(-0.55 * g)} ${h(0.3 * w)} ${h(-0.45 * g)} ${h(0.55 * w)} ${h(0.05 * g)} ${h(0.3 * w)} ${h(0.4 * g)} ${h(-0.07 * w)} ${h(0.55 * g)}z"/>`;
  const stapel = (x, y, rijen, w = 11, g = 9) => rijen.map((n, r) => rij(n, (i) => st(x + (i - n / 2) * w, y - r * (g - 1), w - 0.5, g, KL[(i + r * 2) % 3]))).join("");
  // Een kruik van aardewerk, de voet op (x, y).
  const kruik = (x, y, s = 1) => `<path class="k-terra o" ${K.op(x, y, s)} d="M0 0c-7-4-7-13-2-16v-4h9v4c5 3 5 12-2 16z"/>`;
  // Een stad in de verte: drie huizen achter een muur met een poort; (x, y) is de voet van de muur.
  const stadje = (x, y, s = 1) => `<g ${K.op(x, y, s)}><path class="k-wit o2" d="M-13-8v-13h8v13zM-3-8v-17h7v17zM6-8v-12h8v12z"/><path class="k-zand o2" d="M-20 0v-9h40v9zM-24 0v-13h5V0zM19 0v-13h5V0z"/><path class="k-hout2" d="M-2 0v-4a2 2 0 0 1 4 0v4z"/></g>`;
  // Scheve projectie voor een bouwwerk: (x = breedte, z = diepte, y = hoogte) in ellen naar het tekenvlak.
  const proj = (ox, oy, s, zx, zy) => (x, z, y = 0) => `${h(ox + s * x + zx * z)} ${h(oy + zy * z - s * y)}`;
  const vlakker = (P) => (k, ...p) => `<path class="${k}" d="M${p.map((q) => P(...q)).join("L")}z"/>`;
  // Een schip met een mast, een zeil en riemen (Jona 1:13: de mannen roeiden); (x, y) is de waterlijn midscheeps.
  const schip = (x, y, s = 1) => `<g ${K.op(x, y, s)}><path class="l-hout2" d="M-18 2l-7 11M-6 2l-7 11M6 2l-7 11M18 2l-7 11"/><path class="l-hout2 dik" d="M0-4v-36"/><path class="k-duin o" d="M-16-37h32q4 13 0 26h-32q4-13 0-26z"/><path class="k-hout o" d="M-38-13q4 19 17 19h38q14 0 21-21-7 10-15 10h-46q-9 0-15-8z"/><path class="l-hout2" d="M-27 1h54"/></g>`;
  // Een leeuw die rustig ligt (naar rechts); eenvoudig en zonder bek of tanden.
  const leeuw = (x, y, s = 1, om = 1) => `<g transform="translate(${x} ${y}) scale(${om * s} ${s})"><path class="l-hout2 dik" d="M-22-4q-8-1-7-10"/><circle class="k-hout2" cx="-29" cy="-15" r="2"/><path class="k-oker o2" d="M-24 0q-3-13 9-13h14q8 0 8 13z"/><path class="l-hout2" d="M-14 0q-4-7 3-9"/>` +
    `<circle class="k-hout o2" cx="9" cy="-11" r="9"/><circle class="k-oker o2" cx="4.5" cy="-15.5" r="2"/><circle class="k-oker o2" cx="13.5" cy="-15.5" r="2"/><circle class="k-oker o2" cx="9" cy="-10" r="5.5"/><path class="l-hout2" d="M6.5-11h.1M11.5-11h.1"/><path class="k-hout2" d="M7.5-8.5h3l-1.5 2z"/><path class="k-oker o2" d="M1 0q0-4 4-4h10q3 0 3 4z"/></g>`;

  // Een wervelwind als één lijn die zich omhoog schroeft en breder wordt (n windingen vanaf cx, y0).
  const wervel = (cx, y0, n) => { let d = `M${cx - 5} ${y0}`; for (let k = 0; k < n; k++) { const y = y0 - 13 * k, w = 5 + 7 * k, c = cx + 2 * k; d += `Q${c} ${h(y + 0.5 * w)} ${c + w} ${y - 4}Q${c + 2} ${h(y - 9 - 0.35 * w)} ${c - 10 - 7 * k} ${y - 13}`; } return d; };
  // Een groot blad met de punt op (x, y), r graden gedraaid.
  const blad = (x, y, s, r, k = "k-salie2") => `<path class="${k}" transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M0 0c-9-5-11-13-5-16 3-1 5 1 5 3 0-2 2-4 5-3 6 3 4 11-5 16z"/>`;

  // De tabernakel (Exodus 26–27; 40): de voorhof van honderd bij vijftig el met wit linnen, vijf el hoog; de poort van twintig el in
  // hemelsblauw, purper en scharlaken aan vier pilaren (27:16); de tent van dertig bij tien el met dekkleden van vellen (26:14).
  const P = proj(168, 122, 1.5, -1.1, -0.44), V = vlakker(P);
  const palen = (l) => `<path class="o2" d="${l.map(([x, z]) => `M${P(x, z)}L${P(x, z, 6)}`).join("")}"/>`;
  const band = (k, x1, x2, z, y) => `<path class="${k}" d="M${P(x1, z, y)}L${P(x2, z, y)}"/>`;
  const tabernakel = V("k-zand", [0, 0], [50, 0], [50, 100], [0, 100]) +
    V("k-wit o2", [0, 100], [50, 100], [50, 100, 5], [0, 100, 5]) + palen(Array.from({ length: 10 }, (_, i) => [i * 50 / 9, 100])) +
    V("k-wit o2", [50, 0], [50, 100], [50, 100, 5], [50, 0, 5]) + palen(Array.from({ length: 20 }, (_, i) => [50, i * 100 / 19])) +
    // het brandofferaltaar (27:1–2: vijf bij vijf el, drie hoog, met hoornen, van koper) en het wasvat (30:18)
    V("k-terra2 o2", [22.5, 20], [22.5, 20, 3], [22.5, 25, 3], [22.5, 25]) + V("k-terra o2", [22.5, 20], [27.5, 20], [27.5, 20, 3], [22.5, 20, 3]) + V("k-terra2 o2", [22.5, 20, 3], [27.5, 20, 3], [27.5, 25, 3], [22.5, 25, 3]) +
    `<path class="o2" d="${[[22.5, 20], [27.5, 20], [27.5, 25], [22.5, 25]].map(([x, z]) => `M${P(x, z, 3)}L${P(x, z, 4.4)}`).join("")}"/>` + K.rook(181, 104, 0.7) +
    `<path class="o2" d="M163.5 105.5v-3"/><ellipse class="k-terra o2" cx="163.5" cy="102" rx="3.5" ry="1.7"/><ellipse class="k-zee" cx="163.5" cy="102" rx="2.2" ry="0.9"/>` +
    // de tent: dekkleden over de zijden, vooraan het deksel in drie kleuren aan vijf pilaren met goud (26:36–37)
    V("k-hout o2", [20, 50], [20, 50, 10], [20, 80, 10], [20, 80]) + V("k-hout2 o2", [20, 50, 10], [30, 50, 10], [30, 80, 10], [20, 80, 10]) + V("k-duin", [20, 50], [30, 50], [30, 50, 10], [20, 50, 10]) +
    band("l-water breed", 21.7, 28.3, 50, 8.3) + band("l-lila breed", 21.7, 28.3, 50, 5) + band("l-terra breed", 21.7, 28.3, 50, 1.7) +
    `<path class="l-oker" d="${[20, 22.5, 25, 27.5, 30].map((x) => `M${P(x, 50)}L${P(x, 50, 10)}`).join("")}"/>` +
    V("k-wit o2", [0, 0], [0, 100], [0, 100, 5], [0, 0, 5]) + palen(Array.from({ length: 20 }, (_, i) => [0, i * 100 / 19])) +
    V("k-wit o2", [0, 0], [15, 0], [15, 0, 5], [0, 0, 5]) + V("k-wit o2", [35, 0], [50, 0], [50, 0, 5], [35, 0, 5]) +
    band("l-water dik", 15.8, 34.2, 0, 4.1) + band("l-lila dik", 15.8, 34.2, 0, 2.5) + band("l-terra dik", 15.8, 34.2, 0, 0.9) + palen([0, 5, 10, 15, 21.7, 28.3, 35, 40, 45, 50].map((x) => [x, 0]));

  // De tempel van Salomo (1 Koningen 6:2–10; 7:15–21): zestig el lang, twintig breed, dertig hoog; het voorhuis tien el diep;
  // zijkamers in drie verdiepingen van vijf el; vensters; twee koperen pilaren van achttien el met kapitelen van vijf el.
  const Q = proj(206, 118, 1.9, -1.3, -0.45), W = vlakker(Q);
  const tempel = W("k-zand o", [0, 0], [0, 0, 30], [0, 70, 30], [0, 70]) + W("k-hout o", [0, 0, 30], [20, 0, 30], [20, 70, 30], [0, 70, 30]) + W("k-duin o", [0, 0], [20, 0], [20, 0, 30], [0, 0, 30]) +
    `<path class="l-zand2" d="M${Q(0, 10)}L${Q(0, 10, 30)}"/>` + rij(5, (i) => W("k-hout2", [0, 18 + i * 11, 20], [0, 18 + i * 11, 25], [0, 21 + i * 11, 25], [0, 21 + i * 11, 20])) +
    W("k-hout2", [6, 0], [14, 0], [14, 0, 20], [6, 0, 20]) +
    W("k-zand o", [-6, 10], [-6, 10, 15], [-6, 70, 15], [-6, 70]) + W("k-hout o", [-6, 10, 15], [0, 10, 15], [0, 70, 15], [-6, 70, 15]) + W("k-duin o", [-6, 10], [0, 10], [0, 10, 15], [-6, 10, 15]) +
    `<path class="l-zand2" d="M${Q(-6, 10, 5)}L${Q(-6, 70, 5)}M${Q(-6, 10, 10)}L${Q(-6, 70, 10)}"/>` +
    [1.1, 15.1].map((x) => W("k-terra o", [x, -4], [x + 3.8, -4], [x + 3.8, -4, 18], [x, -4, 18]) + W("k-terra2 o", [x - 0.6, -4, 18], [x + 4.4, -4, 18], [x + 5, -4, 23], [x - 1.2, -4, 23])).join("");

  // Jeruzalem op de berg, met weinig huizen (Nehemia 7:4); de muur ligt in puin of wordt herbouwd.
  // Een stuk muur van g hoog met de voet op y = 106, met voegen; kl = extra klassen (om het te laten verschijnen).
  const voegen = (x, w, g) => { let d = ""; for (let j = 0; j * 7 < g; j++) { if (j) d += `M${x + 1} ${106 - 7 * j}h${w - 2}`; for (let u = x + 7 + (j % 2) * 6; u < x + w - 3; u += 12) d += `M${u} ${106 - 7 * j}v-${Math.min(7, g - 7 * j)}`; } return `<path class="l-zand2" d="${d}"/>`; };
  const muurdeel = (x, w, g, kl = "") => `<g${kl ? ` class="${kl}"` : ""}><path class="k-zand o" d="M${x} 106v-${g}h${w}v${g}z"/>${voegen(x, w, g)}</g>`;
  const jeruzalem = (bouw) => K.verte + `<path class="k-land" d="M0 116q60-30 160-30t160 28v26H0z"/>` + K.huis(92, 66, 20, 26) + K.huis(128, 58, 18, 34, "k-wit") + K.huis(176, 62, 22, 30) + K.huis(214, 70, 18, 22, "k-wit") +
    (bouw
      ? muurdeel(30, 44, 22, "tf-e-in tf-w2") + muurdeel(30, 44, 15) + muurdeel(74, 40, 25) + muurdeel(190, 30, 28, "tf-e-in tf-w4") + muurdeel(162, 58, 21) + muurdeel(246, 30, 21, "tf-e-in tf-w6") + muurdeel(220, 70, 14) +
        // de poort: posten en een balk, nog zonder deuren (Nehemia 6:1)
        `<path class="k-duin" d="M130 106h20l8 34h-36z"/>` + muurdeel(114, 13, 31) + muurdeel(149, 13, 31) + `<path class="k-hout o" d="M111 75h54v-5h-54z"/>` +
        // steigerhout en een ladder; stenen die klaarliggen; spies en schild bij het werk (Nehemia 4:16–18)
        `<path class="l-hout2" d="M254 106V74M272 106V74M251 84h24M251 76h24M200 106l7-34M208 106l7-34M202 98h8M204 90h8M206 82h8"/>` +
        st(18, 124, 12, 9, "k-duin") + st(29, 124, 12, 9, "k-steen") + st(24, 116, 11, 8, "k-zand") + st(284, 126, 12, 9, "k-steen") + st(295, 126, 11, 8, "k-duin") +
        `<path class="l-hout2" d="M86 106l5-38"/><path class="k-steen o2" d="M89.5 69l2-8 2 8z"/><circle class="k-terra o" cx="100" cy="97" r="8"/><circle class="k-oker" cx="100" cy="97" r="2.5"/>`
      : `<path class="k-zand o" d="M34 108V92l6 2 3-8 8 3 2-5 7 5v6l8-2 4 7 9 1 7 7zM160 108l1-15 7-3 4 6 7-9 7 3 1 8 9 2 6 8zM214 108V97l6-7 6 5 6-10 8 2 3 9 10 1 4 6 13 5z"/>` +
        `<path class="l-zand2" d="M36 100h34M36 94h20M162 100h34M216 100h44M222 93h22"/>` +
        `<path class="k-duin o2" d="M52 116l7-3 3 5-7 3zM88 112l8-1 1 5-8 1zM100 120l6-4 4 5-6 4zM178 116l8-2 2 5-8 2zM226 118l7 1-1 5-7-1zM270 112l6-3 3 5-6 3zM284 120l6 1-1 4-6-1z"/>` +
        // de poorten zijn met vuur verteerd (Nehemia 2:13): twee zwartgeblakerde posten
        `<path class="k-duin" d="M130 106h20l8 34h-36z"/><path class="k-donker2 o2" d="M120 106l1-22 7-3 2 25zM148 106l1-16 6-2 3 18z"/>`);

  Object.assign(BR.taferelen, {
    // Exodus 2:3: een kistje van biezen, belijmd met lijm en pek, in de biezen aan de oever der rivier. Het kistje is dicht.
    kistje: { n: "Het kistje in het riet",
      label: "Aan de oever van de rivier in Egypte staat hoog riet. Tussen het riet drijft een kistje van biezen, donker van het pek en met het deksel dicht. Het kistje wiegt zacht op het water.",
      svg: `<path class="k-berg2" d="M0 50q70-14 150-6t170-8v24H0z"/><path class="k-groen" d="M0 56q80-8 170-3t150-4v14H0z"/>` + K.palm(238, 60, 0.6) + K.palm(252, 62, 0.5) + K.palm(58, 60, 0.55) +
        `<path class="k-zee" d="M0 62h320v78H0z"/><path class="k-zee2" d="M0 100q80-8 160 0t160-4v44H0z"/><g class="tf-l-golf">${K.golf(204, 74) + K.golf(270, 84) + K.golf(20, 74) + K.golf(240, 106, 16) + K.golf(288, 124, 16) + K.golf(212, 130, 16)}</g>` +
        `<path class="k-groen" d="M0 88q50-6 80 12t36 40H0z"/><path class="k-zand" d="M0 110q36-4 56 8t24 22H0z"/>` +
        riet([[92, 110, 52, 2], [100, 112, 62, -1], [108, 112, 48, 3], [118, 110, 66, 1], [128, 108, 54, -2], [138, 108, 70, 2], [148, 106, 58, -1], [158, 106, 72, 1], [168, 108, 56, 3], [178, 110, 64, -2], [188, 112, 50, 2], [198, 114, 60, -1], [208, 116, 44, 2]]) +
        pluim([[100, 112, 62, -1], [118, 110, 66, 1], [138, 108, 70, 2], [158, 106, 72, 1], [178, 110, 64, -2], [198, 114, 60, -1]]) + riet([[112, 110, 40, -3], [144, 108, 44, 3], [172, 108, 42, -3], [192, 112, 38, 3]], "l-salie") +
        `<g class="tf-l-wieg"><g transform="translate(152 112)"><path class="k-hout2 o" d="M-25-3q1 12 9 12h32q8 0 9-12z"/><path class="k-hout o" d="M-27-3q4-11 27-11t27 11z"/><path class="l-hout2" d="M-18-9l4 6M-8-12l2 9M2-13v10M12-12l-2 9M21-9l-4 6M-22-6q22-6 44 0"/></g></g>` +
        `<path class="k-zee2" d="M122 120q7-3 14 0t14 0 14 0 18 0v8h-60z"/>` + K.golf(118, 121, 14) + K.golf(170, 122, 14) +
        riet([[120, 132, 46, -2], [128, 136, 58, 1], [136, 138, 40, 2], [176, 136, 50, -1], [184, 138, 62, 2], [192, 138, 42, -2], [70, 126, 44, 2], [78, 130, 56, -1], [86, 134, 38, 2]]) + pluim([[128, 136, 58, 1], [184, 138, 62, 2], [78, 130, 56, -1]]) },

    // Exodus 16:13–15, 31: ’s morgens lag de dauw rondom het leger; toen die was opgetrokken, lag er een klein rond ding, wit, klein als de rijp.
    manna: { n: "Manna in de morgen",
      label: "Het kamp van Israël in de woestijn, vroeg in de morgen. De dauw trekt op en dan ligt de grond rondom de tenten vol met kleine, ronde, witte korrels: het manna. Vooraan staat een schaal die ermee gevuld is.",
      svg: K.verte + `<path class="k-land" d="M0 80q90-8 180-3t140-4v67H0z"/>` + tentjes([[26, 91], [112, 89], [198, 91], [284, 88]], "k-hout") + tentjes([[68, 88], [154, 91], [242, 89]]) +
        `<path class="k-zand" d="M0 96q100-8 200-2t120-5v51H0z"/>` +
        `<g class="tf-e-in tf-w3"><path class="korrel" d="M-2 100q40-4 80 0t80 0 80-1 84-2M4 111q40 4 80 0t80 1 80-2 76 0M-4 122q42-4 84 0t84 0 84-1 80 0M0 133q40 4 80 0t80 0 80 0 84 0"/><path class="korrel s2" d="M2 105.5q40 4 80 0t80 0 80 0 80-2M0 116.5q40-4 80 0t80 0 80 0 84 0M6 127.5q60-4 120 0t190-2M-2 138q60 3 120 0t200 0"/>` +
        `<path class="k-terra o" d="M146 124q1 11 11 11h10q10 0 11-11z"/><path class="k-wit o2" d="M147 124q15-11 30 0z"/></g>` + K.tent(46, 114, 1.2, "k-hout") + K.tent(248, 112, 1.1) +
        `<g class="k-wolk tf-e-uit"><ellipse cx="60" cy="102" rx="70" ry="7"/><ellipse cx="190" cy="99" rx="80" ry="7"/><ellipse cx="290" cy="104" rx="60" ry="7"/><ellipse cx="120" cy="118" rx="90" ry="8"/><ellipse cx="270" cy="122" rx="80" ry="8"/><ellipse cx="20" cy="130" rx="50" ry="8"/><ellipse cx="180" cy="134" rx="80" ry="7"/></g>` },

    // Exodus 17:6: op de rotssteen in Horeb slaan, zo zal er water uitgaan. Numeri 20:11: er kwam veel water uit de steenrots.
    rots: { n: "Water uit de rots",
      label: "In de droge woestijn staat een grote, kale rots. Uit een spleet in de rots stroomt water naar beneden; het loopt als een beek over het zand. In de verte staan de tenten van het volk.",
      svg: K.verte + `<path class="k-land" d="M0 94q90-10 180-4t140-6v56H0z"/>` + tentjes([[24, 104], [70, 100]], "k-hout") + tentjes([[46, 108], [96, 106]]) + `<path class="k-zand" d="M0 124q100-10 200-2t120-6v24H0z"/>` +
        `<path class="k-berg o" d="M146 120l-6-36 14-28 24-18 36-6 32 14 22 30 8 36-6 8z"/><path class="k-schaduw" d="M214 32l32 14 22 30 8 36-6 8h-50l10-44z"/><path class="l-hout2" d="M178 38l10 18-4 12M214 32l-4 22 12 18M246 46l-10 24M140 84l16 6"/><path class="k-hout2" d="M178 72l9-5 6 7-9 7z"/>` +
        `<g class="tf-e-in tf-w3"><path class="k-zee o2" d="M160 116q22-6 36 2 2 8-24 12t-56 10H44q34-12 72-14t44-10z"/><g class="tf-l-golf">${K.golf(150, 123, 10) + K.golf(112, 130, 12) + K.golf(78, 136, 12) + K.golf(172, 119, 8)}</g></g>` +
        `<path class="l-water breed tf-e-teken" pathLength="1" d="M186 74q-12 16-14 44"/><path class="l-water breed tf-e-teken tf-w1" pathLength="1" d="M189 76q-2 18-4 42"/><path class="l-wit tf-e-teken tf-w2" pathLength="1" d="M185 78q-9 16-11 38M189 82q-1 16-3 34"/>` +
        K.struik(292, 128, 1.1) + K.struik(22, 132, 0.9) },

    // Exodus 40:34–38: de wolk bedekte de tent der samenkomst; de wolk van de HEERE was op de tabernakel bij dag. Numeri 2:2: de stammen legeren zich eromheen.
    tabernakel: { n: "De tabernakel in het kamp",
      label: "Midden in het kamp staat de tabernakel: een voorhof met een omheining van wit linnen en een poort in blauw, purper en rood. In de voorhof staan het koperen brandofferaltaar, het wasvat en de tent, met dekkleden van vellen. Boven de tent staat de wolk. Rondom staan de tenten van het volk, met de berg Sinaï erachter.",
      svg: `<path class="k-berg2" d="M0 86 36 56l28 18 46-52 42 40 30-16 48 32 42-22 48 30v20H0z"/><path class="k-land" d="M0 72q90-8 180-3t140-5v76H0z"/>` +
        tentjes([[14, 82], [70, 112], [186, 82], [234, 80], [282, 83], [222, 96], [270, 98], [258, 114]], "k-hout") + tentjes([[38, 80], [20, 98], [48, 96], [16, 114], [44, 116], [162, 80], [210, 82], [258, 80], [306, 81], [246, 96], [294, 96], [286, 114]]) +
        tabernakel + K.wolk(133, 74, 1.2) + `<g class="tf-l-drijf">${K.wolk(139, 56, 1) + K.wolk(132, 40, 0.85) + K.wolk(138, 26, 0.65)}</g>` + K.tent(36, 139, 1.1) + K.tent(292, 139, 1.1, "k-hout") },

    // Numeri 21:8–9: Mozes maakte een koperen slang en stelde ze op een stang; wie haar aanzag, bleef leven.
    slang: { n: "De koperen slang",
      label: "Midden in het kamp in de woestijn staat een hoge stang. Om de stang kronkelt een slang van koper, met de kop omhoog. Rondom staan de tenten van het volk; er drijven langzaam wolken voorbij.",
      svg: `<g class="tf-l-drijf">${K.wolk(62, 30) + K.wolk(262, 22, 0.8)}</g>` + K.verte + `<path class="k-land" d="M0 92q90-10 180-4t140-6v58H0z"/>` + tentjes([[22, 104], [66, 100], [250, 100], [296, 104]], "k-hout") + tentjes([[44, 108], [92, 106], [226, 106], [274, 108]]) +
        `<path class="k-zand" d="M0 126q60-6 100-6 60-22 120 0 40 0 100-4v24H0z"/>` +
        `<path class="l-hout2 rand" d="M160 124V26"/><path class="l-hout breed" d="M160 124V26"/>` +
        `<path class="l-hout2 rand" d="M144 96c20 4 32-8 18-16s-28-13-8-21 20-12 10-21"/><path class="l-terra breed" d="M144 96c20 4 32-8 18-16s-28-13-8-21 20-12 10-21"/><g transform="translate(166 35) rotate(-40)"><path class="k-terra o" d="M-5 0q0-5 7-5 9 1 10 5-1 4-10 5-7 0-7-5z"/><circle class="k-hout2" cx="6" cy="-1.5" r="1"/></g>` +
        K.tent(34, 136, 1.1) + K.tent(288, 136, 1.1, "k-hout") + K.struik(118, 132, 0.8) },

    // Jozua 3:16–17 en 4:9: het water van boven rees op een hoop, zeer ver; het volk ging over op het droge; twaalf stenen opgericht midden in de Jordaan.
    jordaan: { n: "De Jordaan staat stil",
      label: "De Jordaan stroomt vol tussen groene oevers. Dan blijft het water ver weg op een hoop staan en valt de bedding droog. Midden in de droge bedding staan twaalf stenen opgestapeld. Aan de overkant ligt Jericho tussen de palmbomen.",
      svg: `<path class="k-berg2" d="M0 60q70-16 150-8t170-6v22H0z"/><path class="k-land" d="M0 66h320v74H0z"/>` + stadje(236, 70, 0.7) + K.palm(212, 72, 0.5) + K.palm(262, 73, 0.55) + K.palm(274, 70, 0.45) +
        `<g class="tf-e-in tf-w2"><path class="k-zee o2" d="M106 68q2-17 13-21 5-9 19-8 15-4 23 6 13 4 15 23z"/><path class="l-water" d="M116 60q8-6 16 0t16 0 16-1M124 51q7-5 14 0t14 0M134 44q5-3 10 0"/><path class="l-wit" d="M120 48q4-3 8 0M150 46q5-3 9 1"/></g>` +
        `<path class="k-groen" d="M112 66c34 20-84 32-56 74h202c-44-32 34-58-66-74z"/><path class="k-zand" d="M130 66c26 20-66 34-34 74h116c-38-34 22-56-54-74z"/><path class="k-duin" d="M140 80q10 3 16 0-4 6-16 0zM120 104q14 4 24 0-8 8-24 0zM160 130q16 4 30 0-10 8-30 0zM150 92q8 2 14 0-5 5-14 0z"/>` +
        `<g class="tf-e-in tf-w5"><g transform="translate(152 124) scale(0.8)">${stapel(0, 0, [5, 4, 3])}</g></g>` +
        `<g class="tf-e-uit tf-w1"><path class="k-zee" d="M130 66c26 20-66 34-34 74h116c-38-34 22-56-54-74z"/>${K.golf(140, 82, 10) + K.golf(128, 102, 14) + K.golf(160, 96, 12) + K.golf(120, 126, 16) + K.golf(166, 120, 16)}</g>` +
        riet([[92, 110, 13], [97, 112, 17], [102, 113, 11], [222, 104, 12], [227, 106, 16], [232, 106, 10]]) + K.palm(56, 108, 1.1) + K.struik(286, 122) + K.struik(28, 128, 0.9) },

    // Jozua 4:19–20: zij legerden zich te Gilgal; Jozua richtte die twaalf stenen te Gilgal op, die zij uit de Jordaan genomen hadden.
    "twaalf-stenen": { n: "Twaalf stenen in Gilgal",
      label: "Twaalf grote stenen staan opgestapeld bij het kamp van Israël in Gilgal. Erachter stroomt de Jordaan weer, tussen groene oevers.",
      svg: `<path class="k-berg2" d="M0 56q60-18 130-8t190-8v26H0z"/><path class="k-groen" d="M0 62q100-8 200-3t120-5v16H0z"/><path class="k-zee" d="M0 70q80-6 160 0t160-3v14q-80 6-160 2T0 86z"/><g class="tf-l-golf">${K.golf(40, 77) + K.golf(120, 79) + K.golf(210, 76) + K.golf(280, 78)}</g>` +
        `<path class="k-land" d="M0 82q80 8 160 2t160-5v61H0z"/>` + K.palm(34, 92, 0.7) + K.palm(292, 90, 0.75) + tentjes([[62, 104], [258, 102]], "k-hout") + tentjes([[92, 100], [228, 100], [20, 108], [300, 108]]) +
        `<path class="k-zand" d="M0 124q100-10 200-2t120-6v24H0z"/>` + K.tent(40, 134, 1.2) + K.tent(284, 134, 1.2, "k-hout") + stapel(160, 130, [5, 4, 3], 15, 13) + K.struik(96, 134, 0.8) },

    // Richteren 7:16–22: driehonderd man in drie hopen, elk een bazuin, een lege kruik en een fakkel in de kruik; rondom het leger braken zij de kruiken.
    gideon: { n: "Fakkels rondom het kamp",
      label: "Het is nacht. In het dal liggen de tenten van Midian. Op de hoogten rondom het kamp verschijnen in drie groepen de lichten van de fakkels. Vooraan liggen een gebroken kruik, een brandende fakkel en een bazuin van een ramshoorn.",
      svg: `<path class="k-nacht" d="M0 0h320v140H0z"/><path class="l-licht" d="M30 14h.1M72 30h.1M118 10h.1M160 26h.1M204 12h.1M246 28h.1M290 14h.1M52 44h.1M270 46h.1M140 40h.1"/>` +
        `<path class="k-water2" d="M0 76q50-30 110-22t100-10 110 22v74H0z"/><path class="k-hout2" d="M0 96q70-14 160-10t160 8v46H0z"/>` + tentjes([[92, 100], [132, 97], [172, 99], [212, 97], [112, 110], [152, 108], [192, 110], [232, 108], [72, 112]], "k-berg") + tentjes([[112, 98], [152, 96], [192, 98], [132, 109], [172, 108], [212, 109]], "k-donker") +
        [[[20, 92], [36, 80], [54, 70], [74, 64], [8, 106]], [[112, 68], [136, 70], [160, 70], [184, 68], [208, 62]], [[246, 58], [266, 62], [284, 70], [300, 82], [312, 100]]].map((g, i) => `<g class="tf-e-in tf-w${i * 2 + 1}"><path class="k-oker" d="${g.map(([x, y]) => `M${x} ${y}c-3.5-2-3-6 0-10 3 4 3.5 8 0 10z`).join("")}"/><path class="l-licht" d="${g.map(([x, y]) => `M${x} ${y - 3}h.1`).join("")}"/></g>`).join("") +
        `<path class="k-berg" d="M0 126q70-10 150-5t170-7v26H0z"/>` +
        `<path class="k-terra o" d="M104 134q-5-10 3-15l5 4 4-6 5 6 5-4q7 6 2 15z"/><path class="k-terra o2" d="M134 134l5-7 5 6zM92 132l4-6 4 6zM146 127l5-3 1 5z"/>` +
        K.steen("M178 136l-2-8 7-5 9 2 2 8-3 3", "k-steen") + `<path class="l-hout dik" d="M158 136l13-24"/><g class="tf-e-in tf-w1"><circle class="k-gloed" cx="172" cy="106" r="20"/>${K.vlam(172, 111, 0.85)}</g>` +
        `<path class="k-duin o" d="M206 134q12 1 20-7 6-7 5-15l6 1q2 10-6 19-10 9-25 7z"/>` },

    // Ruth 1:22; 2:3–9, 15–16: te Bethlehem in het begin van de gersteoogst; aren oplezen achter de maaiers, tussen de garven; de vaten om uit te drinken.
    "ruth-veld": { n: "Het veld bij Bethlehem",
      label: "Een gersteveld bij Bethlehem in de oogsttijd. Een deel van de gerst staat nog; op het gemaaide deel staan garven en liggen losse aren. Onder een boom staan kruiken met water. In de verte ligt Bethlehem op de heuvel.",
      svg: `<g class="tf-l-drijf">${K.wolk(246, 24) + K.wolk(40, 20, 0.7)}</g><path class="k-berg2" d="M0 64q60-20 130-10t190-10v40H0z"/><path class="k-groen" d="M0 78q50-22 110-16t80 20v10H0z"/>` + stadje(92, 66, 0.9) + K.boom(40, 74, 0.6) + K.boom(146, 76, 0.55) +
        `<path class="k-zand" d="M0 86q90-8 180-3t140-5v62H0z"/><path class="k-oker" d="M136 84q90-8 184-6v32q-100 4-170-2z"/><path class="l-hout" d="${rij(24, (i) => `M${h(140 + i * 7.7)} ${h(108 - (i % 3))}v-${6 + (i % 2) * 2}`)}"/><path class="l-licht" d="${rij(23, (i) => `M${h(144 + i * 7.7)} ${h(96 - (i % 2) * 3)}v-5`)}"/>` +
        `<path class="l-zand2" d="${rij(16, (i) => `M${h(8 + i * 17 + (i % 3) * 4)} ${h(120 + (i % 4) * 5)}v-3`)}"/>` +
        [[52, 112, 0.9], [84, 120, 1], [118, 110, 0.9], [34, 132, 1.15], [142, 130, 1.15], [196, 128, 1.1]].map(([x, y, s]) => `<g ${K.op(x, y, s)}><path class="k-oker o" d="M-6 0q3-5 2.5-10l-6-7 3-2 2 3 2-5 2.5 4 2.5-4 2 5 2-3 3 2-6 7q-.5 5 2.5 10z"/><path class="l-hout2" d="M-3.5-10h7M-1.5-9l-1.5 8M1.5-9l1.5 8"/></g>`).join("") +
        `<path class="l-oker" d="M66 130l6-2M100 134l6-1M162 122l5-2M12 118l5-2M112 124l5 1M176 136l6-1"/>` + K.boom(284, 128, 1.9) + kruik(254, 132, 0.6) + kruik(264, 135, 0.7) },

    // 1 Samuël 17:2–3, 40: Israël en de Filistijnen elk aan een berg, het dal ertussen; vijf gladde stenen uit de beek, de herderstas, de staf, de slinger.
    eikdal: { n: "De beek in het Eikdal",
      label: "Het Eikdal: een dal met eikenbomen tussen twee heuvels. Op de ene heuvel staan de tenten van Israël, op de andere die van de Filistijnen. Door het dal stroomt een beek met gladde stenen. Vooraan liggen een herderstas, een staf, een slinger en vijf gladde stenen.",
      svg: `<path class="k-berg2" d="M0 70q60-18 130-6t190-12v30H0z"/><path class="k-groen" d="M0 46q64-2 104 26t56 40H0z"/><path class="k-groen" d="M320 42q-64 0-104 28t-56 42h160z"/>` + tentjes([[22, 66], [52, 74], [30, 88], [70, 92]]) + tentjes([[298, 62], [268, 72], [292, 86], [250, 90]], "k-hout") +
        `<path class="k-land" d="M0 104q80-14 160-8t160-6v50H0z"/>` + K.eik(104, 108, 0.85) + K.eik(226, 104, 0.95) + K.eik(262, 112, 0.6) +
        `<path class="k-zee o2" d="M166 96c14 8-22 14-10 22s44 8 46 22h66c-10-16-60-18-72-26s14-12-18-18z"/><g class="tf-l-golf">${K.golf(166, 104, 8) + K.golf(176, 118, 10) + K.golf(214, 128, 12) + K.golf(232, 136, 12)}</g>` +
        `<path class="k-duin o2" d="M182 110q4-2 7 0t0 3q-4 2-7 0t0-3zM196 124q5-2 8 0t0 4q-5 2-8 0t0-4zM224 132q4-2 7 0t0 3q-4 2-7 0t0-3zM164 114q3-2 6 0t0 3q-3 1-6 0t0-3zM244 134q4-2 7 0t0 3q-4 2-7 0t0-3zM172 102q3-1 5 0t0 2q-3 1-5 0t0-2zM206 130q3-2 6 0t0 3q-3 1-6 0t0-3zM186 119q3-1 5 0t0 2q-3 1-5 0t0-2z"/>` +
        `<path class="l-hout2 dik" d="M16 138L84 110"/><path class="l-hout2" d="M54 120q8-14 16 0"/><path class="k-hout o" d="M46 136q-4-13 6-16h20q10 3 6 16z"/><path class="k-hout2" d="M51 121q11 9 22 0z"/>` +
        `<path class="l-hout2" d="M86 121q6 10 14 10M111 131q9-1 12-11"/><circle class="l-hout2" cx="85" cy="119" r="2.2"/><path class="k-hout o2" d="M98 131l7-4 7 4-7 4z"/>` +
        [[130, 134], [140, 131], [150, 135], [160, 132], [170, 136]].map(([x, y]) => `<ellipse class="k-steen o2" cx="${x}" cy="${y}" rx="3.6" ry="2.6"/>`).join("") },

    // 1 Koningen 6:2–10; 7:15–21 (zie boven bij de bouwtekening). De hoogte van het voorhuis en van de deur noemt Koningen niet.
    tempel: { n: "De tempel van Salomo",
      label: "De tempel van Salomo op de berg: een lang, hoog huis van steen, zestig el lang, twintig breed en dertig hoog, met een dak van cederhout en vensters. Langs de zijkant zijn de zijkamers in drie verdiepingen. Vooraan is het voorhuis, met ervoor twee hoge koperen pilaren. Er drijft langzaam een wolk voorbij.",
      svg: `<g class="tf-l-drijf">${K.wolk(60, 28) + K.wolk(286, 22, 0.75)}</g>` + K.verte + K.huis(8, 80, 20, 26) + K.huis(30, 72, 16, 30, "k-wit") + K.huis(276, 78, 18, 26, "k-wit") + K.huis(296, 84, 22, 22) +
        `<path class="k-land" d="M0 104q60-30 150-30t170 26v40H0z"/><path class="k-duin" d="M0 132q90-14 180-6t140-8v22H0z"/>` + tempel + K.struik(40, 124, 0.9) + K.struik(286, 122, 1.1) },

    // 1 Koningen 18:31–38: twaalf stenen; een groeve rondom het altaar; hout; vier kruiken water, driemaal; het vuur des HEEREN viel.
    karmel: { n: "Het vuur op de Karmel",
      label: "Op de berg Karmel, met de zee in de verte, staat een altaar van twaalf stenen met hout erop. Eromheen is een groeve vol water gegraven; ernaast staan vier kruiken. Uit de hemel valt vuur op het altaar en het brandt fel.",
      svg: `<path class="k-zee" d="M0 54h170v24H0z"/><g class="tf-l-golf">${K.golf(24, 62) + K.golf(84, 66) + K.golf(128, 60)}</g><path class="k-berg2" d="M150 78q60-30 170-26v30z"/><path class="k-land" d="M0 82q80-22 170-16t150 10v64H0z"/><path class="k-zand" d="M0 128q100-10 200-2t120-6v20H0z"/>` + K.struik(52, 102) + K.struik(292, 96, 1.1) +
        `<ellipse class="k-zand2" cx="160" cy="114" rx="78" ry="12"/><ellipse class="k-zee" cx="160" cy="114" rx="75" ry="10"/><ellipse class="k-land" cx="160" cy="113" rx="60" ry="6.5"/>` +
        `<g class="tf-e-val"><path class="k-gloed" d="M128 0h64l-14 88h-36z"/><path class="k-terra" d="M142 0q6 28-1 48t19 40q26-20 19-40t-1-48z"/><path class="k-oker" d="M150 0q4 30-1 50t11 34q16-14 11-34t-1-50z"/><path class="k-okerz" d="M157 0q2 30-1 50t4 30q7-10 4-30t-1-50z"/></g>` +
        stapel(160, 115, [4, 4, 4], 13, 9) + `<path class="l-hout2 dik" d="M136 88h48M142 84h36"/>` +
        `<circle class="k-gloed tf-l-gloed" cx="160" cy="76" r="34"/><g class="tf-e-in tf-w2">${K.vlam(146, 84, 1.2, 2) + K.vlam(174, 84, 1.2, 5) + K.vlam(160, 83, 1.8)}</g>` +
        kruik(20, 132, 0.7) + kruik(32, 134, 0.7) + kruik(44, 132, 0.7) + kruik(56, 134, 0.7) },

    // 2 Koningen 2:11–13: een vurige wagen met vurige paarden; Elia voer met een onweder ten hemel; zijn mantel viel van hem af. Alleen vuur en wind getekend.
    elia: { n: "Vuur en storm bij de Jordaan",
      label: "Aan de overkant van de Jordaan schroeft een wervelwind zich omhoog. In de wind is vuur te zien, hoog in de lucht. Een wagen, paarden of mensen zijn niet getekend. Op de grond ligt de mantel van Elia.",
      svg: `<path class="k-berg2" d="M0 66q70-16 150-8t170-6v22H0z"/><path class="k-groen" d="M0 72q80-6 160-2t160-4v14H0z"/><path class="k-zee" d="M0 80q80-6 160 0t160-3v16q-80 6-160 2T0 98z"/><g class="tf-l-golf">${K.golf(36, 87) + K.golf(104, 90) + K.golf(250, 86) + K.golf(296, 89)}</g>` +
        `<path class="k-land" d="M0 94q80 8 160 2t160-5v49H0z"/><path class="k-zand" d="M0 126q100-10 200-2t120-6v22H0z"/>` + riet([[20, 100, 12], [25, 102, 16], [30, 102, 10], [282, 98, 12], [287, 100, 16]]) +
        `<circle class="k-gloed tf-l-gloed" cx="196" cy="42" r="46"/><circle class="k-gloed tf-l-gloed" cx="196" cy="42" r="28"/>` +
        `<path class="l-zand2 dik tf-e-teken" pathLength="1" d="${wervel(196, 118, 7)}"/>` +
        `<g class="tf-e-in tf-w4">${K.vlam(176, 60, 1.3, 3) + K.vlam(218, 56, 1.4, 5) + K.vlam(196, 62, 2.1) + K.vlam(182, 34, 1, 2) + K.vlam(212, 30, 1.1, 6)}</g>` +
        `<g class="tf-e-in tf-w8"><path class="k-hout o" d="M70 133l20-17h13q7 6 14 0h13l22 15q-6 5-14 2-8 4-15 0-8 4-14 0-8 4-15 0-8 4-14 0-6 3-10 0z"/><path class="l-hout2" d="M110 119v15M92 118l-6 14M128 118l8 14"/></g>` + K.struik(286, 130) },

    // Nehemia 2:13, 17: de muren van Jeruzalem waren verscheurd en haar poorten met vuur verteerd. Nehemia bezag ze bij nacht.
    "muur-puin": { n: "De muur van Jeruzalem in puin",
      label: "Het is nacht. Jeruzalem ligt op de berg, met een paar huizen. De muur om de stad is afgebroken: er staan nog brokken, en overal ligt puin. Van de poort staan alleen twee zwartgeblakerde posten.",
      svg: `<path class="k-nacht" d="M0 0h320v140H0z"/><path class="l-licht" d="M30 14h.1M72 30h.1M118 10h.1M204 12h.1M246 28h.1M290 14h.1M270 46h.1M160 24h.1"/>` + jeruzalem(false) + `<path class="k-schaduw" d="M0 0h320v140H0z"/>` },

    // Nehemia 4:6, 16–18; 6:1, 15: de muur samengevoegd tot zijn helft toe; met de ene hand aan het werk, de andere hield het wapen; de deuren nog niet in de poorten; klaar in tweeënvijftig dagen.
    "muur-herbouw": { n: "De muur wordt herbouwd",
      label: "Jeruzalem op de berg. De muur om de stad wordt herbouwd: hij is al half zo hoog en er komen lagen bij. In de poort hangen nog geen deuren. Er staan steigers en een ladder, er liggen stenen klaar, en tegen de muur staan een spies en een schild.",
      svg: jeruzalem(true) },

    // Daniël 3:1, 19–26: een beeld van goud, zestig el hoog en zes breed, in het dal Dura; de oven zevenmaal heter; de deur van de oven. De mannen zijn niet getekend.
    oven: { n: "De vurige oven",
      label: "In het dal Dura staat een grote oven van steen. Hij is heel heet gestookt: uit de bovenkant slaan vlammen en vonken en door de deur zie je het vuur. In de verte staat het hoge, smalle beeld van goud. Mensen zijn niet getekend.",
      svg: `<path class="k-berg2" d="M0 86q160-8 320 0v10H0z"/><path class="k-land" d="M0 90h320v50H0z"/><path class="k-zand" d="M0 124q100-8 200-2t120-4v22H0z"/><path class="k-oker o2" d="M58 96V38q3-3 6 0v58z"/>` + K.palm(28, 100, 0.8) + K.palm(92, 98, 0.6) +
        `<circle class="k-gloed tf-l-gloed" cx="196" cy="62" r="64"/><circle class="k-gloed tf-l-gloed" cx="196" cy="56" r="40"/>` + K.vlam(180, 56, 1.6, 2) + K.vlam(212, 56, 1.5, 5) + K.vlam(196, 54, 2.3) +
        `<path class="k-hout2 o" d="M148 124V88q0-38 48-38t48 38v36z"/>` + [[152, 88, 119], [152, 88, 113.5], [152, 88, 108], [152, 88, 102.5], [152, 88, 97], [153, 86, 91.5], [154, 84, 86], [156, 80, 80.5], [159, 74, 75], [163, 66, 69.5], [168, 56, 64], [176, 40, 58.5]].map(([x, w, y], i) => `<path class="steen${i % 2 ? " s2" : ""}" d="M${x} ${y}h${w}"/>`).join("") +
        `<path class="k-hout2 o" d="M180 124v-22a16 16 0 0 1 32 0v22z"/><path class="k-oker tf-l-gloed" d="M184 124v-21a12 12 0 0 1 24 0v21z"/>` + K.vlam(190, 124, 0.9, 4) + K.vlam(202, 124, 1, 1) + K.vlam(196, 124, 1.4, 6) +
        `<path class="l-oker" d="M166 40h.1M228 36h.1M176 22h.1M220 18h.1M158 58h.1M236 56h.1M204 8h.1"/>` },

    // Daniël 6:17–24: een steen op de mond van de kuil, verzegeld met de ring van de koning en van zijn geweldigen; in de vroege morgen ging de koning naar de kuil;
    // God had de muil van de leeuwen toegesloten. Daniël en de engel zijn niet getekend.
    leeuwenkuil: { n: "De leeuwenkuil",
      label: "Een doorsnede van de leeuwenkuil in de nacht. Bovenop de opening ligt een grote steen, met een koord eroverheen en twee zegels. Beneden in de donkere kuil liggen de leeuwen rustig, met de bek dicht. Aan de horizon begint het licht te worden. Daniël is niet getekend.",
      svg: `<path class="k-nacht" d="M0 0h320v60H0z"/><path class="l-licht" d="M30 14h.1M72 30h.1M118 10h.1M204 12h.1M246 28h.1M290 14h.1M160 22h.1"/><g class="tf-e-in tf-w3"><ellipse class="k-water2" cx="56" cy="58" rx="124" ry="28"/><ellipse class="k-water" cx="56" cy="58" rx="88" ry="16"/><ellipse class="k-okerz" cx="56" cy="58" rx="48" ry="6"/></g>` +
        `<path class="k-berg" d="M0 56h320v84H0z"/><path class="k-zand2" d="M0 56h320v5H0z"/><path class="k-hout2" d="M66 134q-14-6-10-32t22-30h58V56h48v16h58q18 4 22 30t-10 32z"/><path class="k-berg" d="M66 134q94-8 188 0z"/>` +
        `<path class="k-steen o" d="M124 57q-2-13 14-16l42-2q20 2 22 18z"/><path class="l-hout2" d="M116 57q44-30 94 0"/><circle class="k-terra o2" cx="150" cy="43" r="3.5"/><circle class="k-terra o2" cx="178" cy="42" r="3.5"/>` +
        leeuw(110, 131, 1.3) + leeuw(214, 131, 1.3, -1) + leeuw(160, 120, 0.8, -1) },

    // Jona 1:4–5, 13: de HEERE wierp een grote wind op de zee; het schip dacht te breken; zij wierpen de vaten in de zee; de mannen roeiden.
    "jona-storm": { n: "Het schip in de storm",
      label: "Een schip met een mast, een zeil en riemen op een woeste zee onder donkere wolken. Hoge golven slaan tegen het schip, dat heen en weer wiegt. In het water drijven vaten die overboord zijn gegooid.",
      svg: `<g class="tf-l-drijf"><path class="k-donker2" d="M-10 0h340v24${"a16 11 0 0 1-32 0".repeat(11)}z"/><path class="k-donker" d="M-10 0h340v12${"a22 12 0 0 1-44 0".repeat(8)}z"/></g>` +
        `<path class="k-zee2" d="M0 74q20-12 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0v66H0z"/><path class="k-water" d="M-10 92q25-14 50 0t50 0 50 0 50 0 50 0 50 0 50 0v48H-10z"/>` +
        `<g class="tf-l-wieg"><g transform="rotate(-7 160 104)">${schip(160, 104, 1.15)}</g></g>` +
        `<g class="tf-l-golf"><path class="k-water2" d="M-20 114q30-16 60 0t60 0 60 0 60 0 60 0 60 0v26H-20z"/><path class="l-wit" d="M-10 109q20-9 38-1M50 109q20-9 38-1M110 109q20-9 38-1M170 109q20-9 38-1M230 109q20-9 38-1M290 109q20-9 38-1"/></g>` +
        `<path class="l-wit" d="M4 88q14-8 26-1M104 88q14-8 26-1M204 88q14-8 26-1M254 88q14-8 26-1M24 70q12-7 22-1M184 70q12-7 22-1M264 70q12-7 22-1"/>` +
        `<g transform="translate(66 118) rotate(-24)">${kruik(0, 0, 0.55)}</g><g transform="translate(262 122) rotate(30)">${kruik(0, 0, 0.5)}</g>` },

    // Jona 1:15, 17; 2:10: de zee stond stil; de HEERE beschikte een grote vis; drie dagen en drie nachten; de vis spuwde Jona uit op het droge.
    "jona-vis": { n: "De grote vis",
      label: "De zee is weer stil. Onder water zwemt langzaam een heel grote vis. In de verte vaart het schip verder; rechts ligt het droge land. Jona is niet getekend.",
      svg: `<g class="tf-l-drijf">${K.wolk(230, 24, 0.9)}</g><path class="k-zee" d="M0 50h320v90H0z"/>` + schip(56, 50, 0.4) + `<path class="k-zee2" d="M0 70q80-6 160 0t160-4v74H0z"/><g class="tf-l-golf">${K.golf(30, 60) + K.golf(120, 58) + K.golf(196, 62) + K.golf(60, 82, 16) + K.golf(214, 80, 16)}</g>` +
        `<path class="k-land" d="M320 44q-34 4-40 22t-16 30 4 44h52z"/><path class="k-zand" d="M320 60q-22 6-26 22t-10 24 6 34h30z"/>` + K.palm(304, 62, 0.8) +
        `<g class="tf-l-drijf"><g transform="translate(150 108)"><path class="k-water o" d="M-58 0l-26-18q8 18 0 36z"/><path class="k-water o" d="M-10-19q8-14 24-10l-4 12z"/><path class="k-water o" d="M-62 0q24-24 62-21 34 2 54 21-20 19-54 21-38 3-62-21z"/><path class="l-zee" d="M30-13q-8 13 0 26M4 6q8 8 18 2"/><circle class="k-wit o2" cx="40" cy="-5" r="3"/><circle class="k-hout2" cx="40.5" cy="-5" r="1.3"/></g></g>` +
        `<g class="tf-l-golf tf-w5">${K.golf(40, 124, 16) + K.golf(232, 128, 16) + K.golf(120, 136, 16)}</g>` },

    // Jona 4:5–8: Jona zette zich tegen het oosten der stad en maakte zich een verdek; God beschikte een wonderboom en deed hem opschieten, voor schaduw.
    wonderboom: { n: "De wonderboom bij Ninevé",
      label: "Ten oosten van de grote stad Ninevé staat op een heuvel een verdek: een afdak van takken op palen. Ernaast schiet een wonderboom op, met grote groene bladeren die schaduw geven over het verdek. De zon staat fel aan de hemel. Jona is niet getekend.",
      svg: `<circle class="k-gloed tf-l-gloed" cx="282" cy="26" r="24"/><circle class="k-okerz o2" cx="282" cy="26" r="10"/><path class="k-berg2" d="M0 70q70-16 150-8t170-6v30H0z"/><path class="k-land" d="M0 86q80-8 160-4t160-4v62H0z"/>` + `<path class="k-wit o2" d="M12 78V66h8v12zM24 78V61h7v17zM38 78V67h9v11zM54 78V59h8v19zM68 78V65h8v13zM84 78V62h7v16zM98 78V67h9v11zM114 78V64h8v14z"/><path class="k-zand o2" d="M4 88V78h132v10zM0 88V72h6v16zM44 88V72h6v16zM90 88V72h6v16zM134 88V72h6v16z"/><path class="k-hout2" d="M22 88v-5a2.5 2.5 0 0 1 5 0v5zM112 88v-5a2.5 2.5 0 0 1 5 0v5z"/>` + K.palm(162, 92, 0.6) +
        `<path class="k-zand" d="M110 140q30-34 110-36t100 14v22z"/>` + K.struik(40, 124, 1.1) + K.struik(132, 126, 0.8) +
        `<path class="k-schaduw" d="M186 120l10-6h56l10 6z"/><path class="l-hout2" d="M204 112V84M246 112V84"/><path class="l-hout2 dik" d="M194 120V86M258 120V86"/><path class="k-hout o" d="M186 88l14-10h52l14 10z"/><path class="l-hout2" d="M198 84h56M206 80l-8 7M220 79l-6 8M236 79l4 8M248 80l8 7"/>` +
        `<g class="tf-e-groei"><path class="l-salie2 dik" d="M270 122q6-22-2-40t-26-18M268 96q10-4 16-12M266 76q-2-10 6-16"/>` + [[212, 86, 1.2, 20], [232, 80, 1.3, -10], [252, 80, 1.4, 12], [274, 74, 1.2, -24], [292, 96, 1.2, -40], [262, 62, 1.1, 0], [240, 64, 1, 24], [286, 64, 1, -50]].map((b) => blad(...b)).join("") + blad(222, 76, 0.8, 10, "k-salie") + blad(270, 60, 0.7, -14, "k-salie") + blad(250, 68, 0.8, 0, "k-salie") + `</g>` },
  });
})();
