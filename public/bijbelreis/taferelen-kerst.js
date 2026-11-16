// Taferelen bij het thema Kerst (boek `kerst`, inhoud/kerst-1.js tot en met kerst-3.js). Motor, bouwstenen (BR.tfTeken) en
// standaardbeelden: taferelen.js; mensen als pictogram en sterren: taferelen-jakob.js. Regels: docs/bijbelreis-taferelen/README.md.
// Bij elk tafereel staat de tekst waarmee het is gecontroleerd (Statenvertaling: node scripts/sv.mjs "<verwijzing>").
// God en de Heere Jezus worden niet afgebeeld: niet als Kind, niet in doeken, niet als jongen van twaalf, niet als licht in
// mensvorm. Engelen ook niet; het licht over het veld van de herders (Lukas 2:9) is een schijnsel, geen gestalte. De kribbe
// heeft geen beeld. Geen overlevering: geen os en ezel, geen kronen, geen kamelen bij de wijzen en geen aantal wijzen.
// Eigen toon van deze reeks: veel avond en nacht, een diepblauwe lucht (k-avond) met een lichtere band aan de einder
// (k-avond2), een lichtere sluier (k-schemer) zodat het land warm blijft, en steeds warm licht in een venster of van een
// olielamp (k-venster, k-schijn). De ster staat alleen in Mattheüs 2, en dan alleen zij. Koppelingen: taferelen-koppeling-kerst.js.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.taferelen = BR.taferelen || {};
(function () {
  const K = BR.tfTeken, { mensen, vrouwen, sterren, cirkel, rij } = K;
  const VOL = "M0 0h320v140H0z";
  // Lucht: avond (diepblauw met een lichtere band aan de einder) of nacht (alleen diepblauw). Sluier: schemer of nacht.
  const avond = `<path class="k-avond" d="${VOL}"/><path class="k-avond2" d="M0 50h320v90H0z"/>`, nacht = `<path class="k-avond" d="${VOL}"/>`;
  const schemer = `<path class="k-schemer" d="${VOL}"/>`, sluier = `<path class="k-sluier" d="${VOL}"/>`;
  // Huizen met platte daken: l = [[x, boven, breed], …]; ze lopen door tot y = onder (de heuvel ervoor dekt de voet af).
  const huizen = (l, k = "k-duin", onder = 0) => `<path class="${k} o" d="${rij(l, (x, y, b) => `M${x} ${onder}V${y}h${b}V${onder}z`)}"/>`;
  // Vensters met licht, l = [[x, y], …], met een zachte schijn eromheen die traag ademt.
  const vensters = (l) => `<path class="k-schijn tf-l-gloed" d="${rij(l, (x, y) => cirkel(x + 1.5, y + 2, 6))}"/><path class="k-venster" d="${rij(l, (x, y) => `M${x} ${y}h3v4h-3z`)}"/>`;
  // Een stadje op een heuvel, (x, y) de voet van de heuvel: [huizen en heuvel, de lichten]. De lichten komen ná de sluier.
  const stadje = (d, x, y, s) => [`<g ${K.op(x, y, s)}>${huizen(d.a)}${huizen(d.b, "k-wit")}<path class="k-land" d="${d.h}"/>${d.x || ""}</g>`, `<g ${K.op(x, y, s)}>${vensters(d.l)}</g>`];
  const BETHLEHEM = { h: "M-80 0C-56-30 56-30 80 0z", a: [[-50, -28, 13], [-20, -44, 16], [12, -38, 14], [38, -30, 13]],
    b: [[-62, -20, 12], [-36, -36, 14], [-4, -46, 15], [26, -34, 12], [50, -22, 12]], l: [[-33, -31], [-16, -39], [2, -41], [16, -33], [42, -26]] };
  // Nazareth: ‘de top des bergs, op denwelken hun stad gebouwd was’, met een steile rand (Lukas 4:29).
  const NAZARETH = { h: "M-90 0C-70-20-40-40 0-44 20-46 40-44 52-40L60 0z", a: [[-62, -36, 12], [-36, -50, 14], [-8, -58, 14], [22, -58, 12]],
    b: [[-48, -44, 12], [-22, -55, 14], [8, -60, 14], [34, -55, 12]], l: [[-58, -31], [-44, -40], [-32, -46], [-4, -53], [12, -56], [37, -50]],
    x: `<path class="k-berg" d="M52-40 60 0H46l2-22z"/><path class="l-zand2" d="M53-32l3 10M50-18l4 8"/>` };
  const bethlehem = (x, y, s) => stadje(BETHLEHEM, x, y, s), nazareth = (x, y, s) => stadje(NAZARETH, x, y, s);
  // Olielamp van aardewerk, de pit rechts; (x, y) is de voet. Met een warme schijn eromheen.
  const lamp = (x, y, s = 1) => `<circle class="k-schijn tf-l-gloed" cx="${x + 8 * s}" cy="${y - 10 * s}" r="${34 * s}"/><circle class="k-schijn" cx="${x + 8 * s}" cy="${y - 10 * s}" r="${18 * s}"/>` +
    `<g ${K.op(x, y, s)}><path class="k-terra o" d="M-9-2q0-5 9-5h4l6-3q1 2-1 4l-4 4q-1 2-4 2H-6q-3 0-3-2z"/><path class="k-hout2" d="M-3-6.5h5v1.5h-5z"/>${K.vlam(9, -9, 0.42, 3)}</g>`;
  // De ster van Mattheüs 2: één ster met een krans van licht.
  const ster = (x, y, s = 1) => `<g ${K.op(x, y, s)}><circle class="k-licht tf-l-gloed" r="17"/><circle class="k-licht" r="9"/><path class="k-okerz" d="M0-14l1 11.5 3.5-2-2 3.5 11.5 1-11.5 1 2 3.5-3.5-2-1 11.5-1-11.5-3.5 2 2-3.5-11.5-1 11.5-1-2-3.5 3.5 2z"/></g>`;
  // Binnen: een muur van steen met een tafel ervoor; een venster met een boog (x, breedte) dat uitkijkt op de avond.
  const kamer = (vx, vb) => `<path class="k-zand" d="M0 0h320v112H0z"/><path class="l-zand2" d="M0 28h320M0 56h320M0 84h320M70 0v28M200 0v28M130 28v28M270 28v28M40 56v28M180 56v28M100 84v28M240 84v28"/>` +
    `<path class="k-avond o" d="M${vx} 66V${32}a${vb / 2} ${vb / 2} 0 0 1 ${vb} 0v34z"/><path class="k-avond2" d="M${vx + 0.6} 54h${vb - 1.2}v11.4h-${vb - 1.2}z"/><path class="k-hout" d="M0 112h320v28H0z"/><path class="l-hout2" d="M0 112h320"/>`;
  // Een groepje reizigers in kleurige kleren (de wijzen: Mattheüs noemt geen aantal), de voeten op (x, y).
  const reizigers = (x, y, s) => ((p) => mensen(p([[0, 0], [17, 2]]), "k-lila") + mensen(p([[8, -3]]), "k-water2") + mensen(p([[-9, 1]]), "k-terra") + mensen(p([[25, -1]]), "k-oker"))((l) => l.map(([a, b]) => [x + a * s, y + b * s, s]));
  // Jozef (een lang kleed) en Maria (met een doek over het hoofd), de voeten op (x, y).
  const jozefMaria = (x, y, s) => mensen([[x, y, s]]) + vrouwen([[x + 9 * s, y + s, s * 0.95]], "k-terra");

  Object.assign(BR.taferelen, {
    // Mattheüs 1:1, 17: ‘Het boek des geslachts’; ‘van Abraham tot David, zijn veertien geslachten; en van David tot de
    // Babylonische overvoering, zijn veertien geslachten; en van de Babylonische overvoering tot Christus, zijn veertien geslachten.’
    // Een rol met drie kolommen van veertien regels; geen namen in letters (geen lettertype), wel het aantal.
    "kerst-geslacht": { n: "Driemaal veertien geslachten",
      label: "Op een tafel ligt een opengerolde boekrol bij het licht van een olielamp. Op de rol staan drie kolommen van elk veertien regels, die een voor een verschijnen. Door het venster is het avond.",
      svg: kamer(250, 40) + schemer + lamp(44, 112, 1.6) + sterren([[262, 40], [278, 34]]) +
        `<path class="k-duin o" d="M92 74h164v36H92z"/><path class="k-hout o" d="M84 70h9v44h-9zM255 70h9v44h-9z"/>` +
        [100, 152, 204].map((x, k) => `<path class="l-zand2 tf-e-teken tf-w${k * 3 + 1}" pathLength="1" d="${Array.from({ length: 14 }, (_, i) => `M${x} ${78 + i * 2.2}h${30 + ((i * 7 + k * 5) % 15)}`).join("")}"/>`).join("") },

    // Jozua 2:15, 18, 21: ‘haar huis was op den stadsmuur’; ‘dit snoer van scharlakendraad aan het venster binden’;
    // ‘en zij bond het scharlakensnoer aan het venster’. De verspieders kwamen ’s avonds (2:2, 5). Jericho is de palmstad (Deuteronomium 34:3).
    "kerst-rachab": { n: "Het rode koord in het venster",
      label: "Jericho in de avond: een lange stadsmuur met palmbomen en huizen erachter. Op de muur staat een huis met licht achter het venster. Uit dat venster hangt een rood koord van scharlaken langs de muur naar beneden.",
      svg: avond + K.verte + K.palm(54, 62, 1.2) + K.palm(276, 64, 1.1) + huizen([[70, 46, 22], [98, 52, 18], [196, 44, 24], [226, 50, 20]], "k-wit", 70) +
        K.muur(20, 66, 280, 48) + `<path class="l-zand2" d="M20 80h280M20 96h280M60 66v14M120 66v14M210 66v14M260 66v14M90 80v16M190 80v16M240 80v16M50 96v18M150 96v18M280 96v18"/>` +
        huizen([[138, 38, 34]], "k-duin", 64) + `<path class="k-land" d="M0 112q160-6 320 0v28H0z"/><path class="l-duin breed" d="M0 128q120-10 320-4"/>` + K.struik(40, 124) + K.struik(250, 130, 1.2) +
        schemer + vensters([[80, 54], [204, 52], [232, 58]]) + `<path class="k-schijn" d="${cirkel(155, 51, 12)}"/><path class="k-venster o2" d="M151 46h8v10h-8z"/>` +
        `<path class="l-rood dik tf-e-teken tf-w2" pathLength="1" d="M155 55q-2 26 1 54"/>` },

    // 2 Samuël 7:2, 4: ‘Zie toch, ik woon in een cederen huis, en de ark Gods woont in het midden der gordijnen.’ ‘Maar het gebeurde
    // in denzelfden nacht, dat het woord des HEEREN tot Nathan geschiedde.’ De ark zelf is niet getekend: zij staat in de tent.
    "kerst-cederhuis": { n: "Het huis van cederhout en de tent",
      label: "Het is nacht in Jeruzalem. Op de berg staat een huis van cederhout, met licht achter de vensters. Ernaast staat een tent van gordijnen. Erboven fonkelen de sterren.",
      svg: nacht + `<path class="k-berg2" d="M0 86q60-26 140-14t180-12v80H0z"/><path class="k-land" d="M20 140q30-60 140-60t160 30v30z"/>` +
        huizen([[40, 92, 18], [252, 86, 16], [272, 92, 18]], "k-duin", 120) + huizen([[60, 98, 14], [232, 90, 18]], "k-wit", 120) +
        `<path class="l-hout2" d="M96 104l-8 6M144 104l8 6"/><path class="k-wit o" d="M98 106V82l22-12 22 12v24z"/><path class="l-zand2" d="M106 106V78M114 106V74M126 106V74M134 106V78"/><path class="k-hout2" d="M116 106V90h8v16z"/>` +
        `<path class="k-hout o" d="M156 106V60h70v46z"/><path class="k-hout2" d="M152 58h78v4h-78z"/><path class="l-hout2" d="M156 74h70M156 90h70M174 62v44M208 62v44"/><path class="k-hout2" d="M186 106V92h10v14z"/>` +
        K.boom(76, 112, 1.1) + K.boom(254, 116, 1.2) + `<path class="k-groen" d="M0 118q160-14 320 0v22H0z"/>` + K.struik(150, 128, 1.2) + sluier +
        sterren([[20, 14], [60, 30], [96, 10], [140, 26], [176, 8], [220, 22], [262, 12], [300, 34]]) + sterren([[38, 46], [200, 40]], 1) +
        `<circle class="k-okerz tf-l-gloed" cx="122" cy="18" r="1.3"/><circle class="k-okerz tf-l-gloed tf-w4" cx="286" cy="22" r="1.3"/>` +
        vensters([[162, 66], [215, 66], [162, 80], [215, 80], [46, 98], [276, 98]]) },

    // Jesaja 11:1: ‘Want er zal een Rijsje voortkomen uit den afgehouwen tronk van Isaï, en een Scheut uit zijn wortelen zal Vrucht voortbrengen.’
    "kerst-tronk": { n: "Een Rijsje uit de tronk",
      label: "In de avond staat een afgehouwen boomstronk met zijn wortels in de grond. Uit de tronk schiet een dun, jong takje op met een paar groene blaadjes.",
      svg: avond + K.verte + `<path class="k-land" d="M0 104q90-12 180-4t140-6v46H0z"/><path class="k-groen" d="M0 122q100-10 200-2t120-6v26H0z"/>` + K.boom(268, 104, 0.9) + K.struik(40, 112) +
        `<path class="l-hout2 breed" d="M112 118q-12 2-20 8M150 118q12 2 20 8M120 120q-4 6-12 12M142 120q4 6 12 11"/><path class="k-hout o" d="M108 120c5-10 5-28 2-38h42c-3 10-3 28 2 38z"/>` +
        `<path class="l-hout2" d="M116 116q2-14-1-28M132 118v-30M144 116q-2-14 1-28"/><ellipse class="k-duin o" cx="131" cy="82" rx="21" ry="5"/><path class="l-zand2" d="M117 82a14 3 0 1 0 28 0a14 3 0 1 0-28 0M125 82a6 1.4 0 1 0 12 0a6 1.4 0 1 0-12 0"/>` +
        schemer + `<g transform="translate(-72 -42) scale(1.5)"><g class="tf-e-groei tf-w2"><path class="l-salie2 dik" d="M144 84q2-14 10-26M150 70q-8-3-12-10"/><path class="k-salie o2" d="M154 58q4-9 11-8-3 8-11 8zM151 66q7-4 12 0-6 4-12 0zM138 60q-2-7 3-10 2 7-3 10zM146 76q5-4 10-1-5 4-10 1z"/></g></g>` },

    // Micha 5:1: ‘En gij, Bethlehem Efratha! zijt gij klein om te wezen onder de duizenden van Juda?’ 1 Samuël 16:11: ‘hij weidt de
    // schapen’. Mattheüs 2:5: ‘Te Bethlehem, in Judea gelegen’. Geen muur: de tekst noemt Bethlehem een stad en een vlek (Johannes 7:42).
    "kerst-bethlehem": { n: "Bethlehem, klein onder de duizenden",
      label: "Bethlehem in de avond: een klein stadje met platte daken op een heuvel tussen de bergen van Juda. In een paar huizen brandt licht en uit één huis stijgt rook op. Op de helling eronder graast een kudde schapen.",
      svg: avond + `<path class="k-berg2" d="M0 78q40-22 90-12t80-6 70 10 80-8v78H0z"/>` + ((b) => b[0] + K.rook(184, 50, 0.9) +
        `<path class="k-groen" d="M0 104q60-16 150-6t170-4v46H0z"/><path class="l-salie2" d="M10 112q50-8 110-2M30 124q60-8 130 0M200 118q50-6 110 0M180 130q60-6 140-2"/>` +
        K.boom(36, 106, 0.9) + K.boom(290, 108, 1) + [[80, 116], [98, 112], [116, 118], [64, 126], [92, 128], [130, 126], [150, 132]].map(([x, y]) => K.schaap(x, y, 1.3)).join("") +
        schemer + b[1])(bethlehem(196, 96, 1.2)) },

    // Lukas 1:26: ‘een stad van Galilea, genaamd Nazareth’; 4:29: ‘den top des bergs, op denwelken hun stad gebouwd was … van de steilte’.
    "kerst-nazareth": { n: "Nazareth in Galilea",
      label: "Nazareth in de avond: een stadje met platte daken, gebouwd tegen een berg in Galilea, met een steile rand aan één kant. Achter een paar vensters brandt licht; uit één huis stijgt rook op. Om de berg liggen groene heuvels.",
      svg: avond + ((b) => `<path class="k-berg2" d="M0 72q50-20 110-6t110-10 100 8v76H0z"/>` + b[0] + K.rook(150, 34, 0.9) + `<path class="k-groen" d="M0 112q80-16 170-6t150-8v42H0z"/><path class="k-salie" d="M0 128q100-8 200-2t120-4v18H0z"/>` +
        K.boom(250, 112, 1.2) + K.boom(274, 118, 0.9) + K.boom(46, 122, 1) + K.struik(210, 128) + schemer + b[1])(nazareth(150, 108, 1.25)) },

    // Mattheüs 1:20, 24: ‘de engel des Heeren is hem in den droom verschenen’; ‘Jozef dan, opgewekt zijnde van den slaap’. Geen engel en
    // geen slapende man: Nazareth in de nacht, één venster met licht.
    "kerst-droom": { n: "Nazareth in de nacht",
      label: "Nazareth in de nacht. Het stadje tegen de berg is donker en stil; alleen achter één venster brandt een klein licht. Boven de heuvels van Galilea staan de sterren.",
      svg: nacht + `<path class="k-berg2" d="M0 72q50-20 110-6t110-10 100 8v76H0z"/>` + nazareth(150, 108, 1.25)[0] + `<path class="k-groen" d="M0 112q80-16 170-6t150-8v42H0z"/><path class="k-salie" d="M0 128q100-8 200-2t120-4v18H0z"/>` +
        K.boom(250, 112, 1.2) + K.boom(274, 118, 0.9) + K.boom(46, 122, 1) + sluier + sterren([[20, 12], [52, 30], [84, 8], [126, 18], [206, 10], [236, 28], [272, 14], [306, 30]]) + sterren([[40, 50], [290, 50]], 1) +
        `<circle class="k-okerz tf-l-gloed" cx="180" cy="22" r="1.3"/><g ${K.op(150, 108, 1.25)}>${vensters([[-4, -53]])}</g>` },

    // Lukas 1:9–11: ‘om te reukofferen’; ‘ter rechter zijde van het altaar des reukoffers’. Exodus 30:1–8: het reukaltaar vierkant, één el
    // lang en breed en twee el hoog, met hoornen en een krans van goud, vóór de voorhang, aangestoken als de lampen worden aangestoken.
    // Exodus 25:37 en 26:31, 35: de kandelaar met zeven lampen; de voorhang van hemelsblauw, purper en scharlaken. Geen engel, geen priester.
    "kerst-reukaltaar": { n: "Het reukofferaltaar",
      label: "In het heilige van de tempel, bij het licht van de kandelaar met zeven lampen. Voor het voorhangsel van blauw, purper en scharlaken staat het gouden reukofferaltaar, met hoornen op de hoeken. Van het altaar stijgt de rook van het reukwerk op.",
      svg: `<path class="k-wit" d="M0 0h320v108H0z"/><path class="l-zand2" d="M0 26h320M0 52h320M0 80h320M40 0v26M280 0v26M20 26v26M300 26v26M50 52v28M270 52v28M30 80v28M290 80v28"/>` +
        `<path class="k-water2" d="M92 0h18v108H92zM146 0h18v108h-18zM200 0h18v108h-18z"/><path class="k-lila" d="M110 0h18v108h-18zM164 0h18v108h-18z"/><path class="k-terra2" d="M128 0h18v108h-18zM182 0h18v108h-18z"/><path class="l-hout2" d="M92 0v108M218 0v108"/>` +
        `<path class="k-zand" d="M0 108h320v32H0z"/><path class="l-zand2" d="M0 108h320M0 122h320M60 108l-12 32M140 108l-4 32M200 108l6 32M270 108l14 32"/>` + schemer +
        `<ellipse class="k-schijn tf-l-gloed" cx="62" cy="76" rx="56" ry="44"/><ellipse class="k-schijn" cx="160" cy="84" rx="40" ry="44"/>` +
        `<path class="l-oker dik" d="M62 120V72M62 104q-24 0-24-32M62 104q24 0 24-32M62 96q-16 0-16-24M62 96q16 0 16-24M62 88q-8 0-8-16M62 88q8 0 8-16"/><path class="k-oker o" d="M52 124q0-5 10-6 10 1 10 6z"/>` +
        `<path class="k-okerz tf-l-vlam" d="${rij([[38, 72], [54, 72], [70, 72], [86, 72]], (x, y) => `M${x} ${y}q-3-4 0-9 3 5 0 9z`)}"/><path class="k-okerz tf-l-vlam tf-w3" d="${rij([[46, 72], [62, 72], [78, 72]], (x, y) => `M${x} ${y}q-3-4 0-9 3 5 0 9z`)}"/>` +
        K.rook(160, 62, 1.1) + `<path class="k-oker o" d="M148 124V80h24v44zM146 76h28v5h-28zM147 76l1-5 3 5zM173 76l-1-5-3 5z"/><path class="l-oker" d="M152 86h16M152 118h16"/>` },

    // Lukas 1:39–40: ‘reisde met haast naar het gebergte, in een stad van Juda; en kwam in het huis van Zacharias’.
    "kerst-bergland": { n: "Een stad in het bergland van Juda",
      label: "Het bergland van Juda in de avond: heuvels met terrassen en bomen. Een pad slingert omhoog naar een kleine stad op de helling, waar achter een paar vensters licht brandt.",
      svg: avond + `<path class="k-berg2" d="M0 66q40-20 90-8t70-14 80 8 80-6v94H0z"/>` + ((b) => b[0] + `<path class="k-land" d="M0 92q70-22 150-10t170-6v64H0z"/><path class="l-zand2" d="M0 100q60-14 120-6M10 112q70-14 150-4M190 92q60-8 130-4M170 106q70-8 150-2M0 126q90-10 180-2"/>` +
        `<path class="l-duin breed" d="M90 140q20-14 0-24t30-20 48-14 36-16"/>` + K.boom(40, 104, 0.9) + K.boom(60, 100, 0.7) + K.boom(150, 120, 1) + K.boom(260, 104, 0.9) + K.boom(286, 112, 1.1) + K.boom(214, 128, 1.2) + schemer + b[1])(
        stadje({ h: "M-60 0C-40-26 30-34 60-10V0z", a: [[-36, -26, 12], [8, -36, 14]], b: [[-24, -32, 14], [22, -30, 12], [-48, -18, 12]], l: [[-21, -27], [11, -31], [25, -25]] }, 232, 76, 1)) },

    // Lukas 1:63: ‘als hij een schrijftafeltje geëist had, schreef hij, zeggende: Johannes is zijn naam.’ Een houten tafeltje met was en een griffel.
    "kerst-tafeltje": { n: "Het schrijftafeltje",
      label: "Op een tafel ligt een houten schrijftafeltje met een laagje was. Er worden woorden in geschreven; de griffel ligt ernaast. Er brandt een olielamp, en door het venster is het avond.",
      svg: kamer(34, 40) + schemer + lamp(236, 112, 1.5) + `<path class="k-hout2 o" d="M110 118l10-22h92l10 22z"/><path class="k-okerz" d="M120 114l6-14h80l6 14z"/>` +
        `<path class="l-hout2 tf-e-teken tf-w1" pathLength="1" d="M134 104q2-3 4 0t4 0 4 0m4 0q2-3 4 0t4 0m6 0q2-3 4 0t4 0 4 0 4 0M140 110q2-3 4 0t4 0m6 0q2-3 4 0t4 0 4 0m6 0q2-3 4 0t4 0"/>` +
        `<path class="l-hout2 dik" d="M200 132l40-12"/>` },

    // Lukas 2:4–5: ‘Jozef ging ook op van Galilea, uit de stad Nazareth, naar Judea, tot de stad Davids, die Bethlehem genaamd wordt …
    // met Maria, zijn ondertrouwde vrouw’. Geen rijdier: de tekst noemt er geen.
    "kerst-op-weg": { n: "Op weg naar Bethlehem",
      label: "Een weg loopt in de avond door het heuvelland naar Bethlehem, dat op een heuvel ligt en waar al licht brandt. Over de weg gaan twee kleine figuren naar de stad toe: Jozef en Maria.",
      svg: avond + `<path class="k-berg2" d="M0 76q50-20 100-8t90-12 130 10v74H0z"/>` + ((b) => b[0] + `<path class="k-land" d="M0 96q80-14 170-6t150-8v58H0z"/><path class="k-zand" d="M0 124q100-12 200-2t120-6v24H0z"/>` +
        `<path class="l-duin breed" d="M0 132q60-6 110-10t90-14 60-20"/>` + K.boom(40, 108) + K.struik(150, 110, 1.1) + K.struik(300, 116) + K.boom(212, 126, 1.2) + schemer + b[1])(bethlehem(268, 86, 0.6)) +
        `<g class="tf-e-kom">${jozefMaria(126, 122, 1.6)}</g>` },

    // Lukas 2:8–9: ‘herders … hielden de nachtwacht over hun kudde. En ziet, een engel des Heeren stond bij hen, en de heerlijkheid des
    // Heeren omscheen hen’. De engel is niet getekend; het licht is een schijnsel uit de hemel. ‘Herders’: een paar, zonder aantal in de tekst.
    "kerst-herders": { n: "De herders in het veld",
      label: "Het is nacht in het veld bij Bethlehem. Een kudde schapen ligt in het gras en een paar herders houden de wacht. In de verte brandt licht in Bethlehem. Dan valt er een helder licht uit de hemel over het veld.",
      svg: nacht + `<path class="k-berg2" d="M0 78q50-20 110-8t100-12 110 8v74H0z"/>` + ((b) => b[0] + `<path class="k-groen" d="M0 90q80-16 170-8t150-10v68H0z"/><path class="k-salie" d="M0 118q100-14 200-4t120-8v34H0z"/>` +
        sluier + sterren([[20, 14], [52, 30], [84, 10], [228, 14], [262, 30], [300, 12]]) + sterren([[110, 34], [290, 44]], 1) + b[1])(bethlehem(262, 76, 0.5)) +
        `<g class="tf-e-in tf-w2"><path class="k-licht" d="M104 0h80l64 104H48z"/><path class="k-licht tf-l-gloed" d="M128 0h32l44 104H92z"/><ellipse class="k-licht" cx="148" cy="108" rx="108" ry="22"/></g>` +
        [[70, 112, 1.4], [104, 104, 1.3], [146, 102, 1.4], [188, 106, 1.3], [128, 118, 1.6], [168, 120, 1.6], [92, 126, 1.6], [214, 118, 1.4]].map((a) => K.schaap(...a)).join("") +
        mensen([[48, 116, 1.7], [236, 108, 1.5]]) + mensen([[248, 112, 1.6], [116, 100, 1.4]], "k-zand") },

    // Lukas 2:15–16: ‘Laat ons dan heengaan naar Bethlehem’; ‘En zij kwamen met haast’. Hoeveel herders, zegt de tekst niet.
    "kerst-herders-gaan": { n: "De herders gaan naar Bethlehem",
      label: "Het is nog nacht. Over het pad gaan de herders met haast omhoog naar Bethlehem, waar achter de vensters licht brandt. Achter hen in het veld liggen schapen.",
      svg: nacht + `<path class="k-berg2" d="M0 76q50-20 110-8t100-12 110 8v76H0z"/>` + ((b) => b[0] + `<path class="k-groen" d="M0 100q80-14 160-6t160-10v56H0z"/><path class="k-salie" d="M0 124q100-10 200-2t120-6v24H0z"/>` +
        `<path class="l-duin breed" d="M30 140q30-14 90-18t80-14 40-18"/>` + [[30, 112], [50, 118], [24, 126], [66, 128]].map(([x, y]) => K.schaap(x, y, 1.3)).join("") +
        sluier + sterren([[20, 16], [60, 30], [96, 10], [140, 22], [176, 36], [300, 14]]) + sterren([[40, 46], [118, 40]], 1) + b[1])(bethlehem(236, 94, 1.15)) +
        `<g class="tf-e-kom">${mensen([[150, 118, 1.5], [172, 114, 1.5]]) + mensen([[162, 120, 1.5], [184, 110, 1.4]], "k-zand")}</g>` },

    // Lukas 2:22–24: zij brachten Hem te Jeruzalem; ‘een paar tortelduiven, of twee jonge duiven’. Twee duiven in een mand.
    "kerst-duiven": { n: "Twee duiven",
      label: "Op de weg naar Jeruzalem. In de verte ligt de stad op de berg, met de tempel. Vooraan staat een gevlochten mand met twee duiven erin.",
      svg: K.verte + `<path class="k-land" d="M140 96q60-36 120-34t60 8v70H140z"/>` + `<path class="k-wit o" d="M236 62V34h28v28z"/><path class="k-hout2" d="M247 54v-9h6v9z"/><path class="l-oker" d="M236 37h28"/>` + K.stad(250, 78, 0.5) +
        `<path class="k-land" d="M0 98q90-12 180-4t140-6v52H0z"/><path class="k-zand" d="M0 124q100-12 200-2t120-6v24H0z"/><path class="l-duin breed" d="M150 140q20-20 60-30t40-26"/>` + K.boom(30, 106) + K.struik(290, 116) +
        `<g transform="translate(-34 -52) scale(1.55)"><path class="k-wit o2" d="${rij([[62, 104], [88, 106]], (x, y) => `M${x - 8} ${y}q-2-8 6-9 3-5 7-4 3 1 3 4l3 1-3 1q0 6-8 7z`)}"/>` +
        `<path class="k-steen" d="M56 100q5-5 11-2-5 4-11 2zM82 102q5-5 11-2-5 4-11 2z"/><path class="k-hout2" d="M70 93.5h1v1h-1zM96 95.5h1v1h-1z"/>` +
        `<path class="k-zand o" d="M46 104h64l-6 20H52z"/><path class="l-zand2" d="M48 110h60M50 117h56M58 104l2 20M70 104l1 20M82 104v20M94 104l-1 20M104 104l-2 20"/></g>` },

    // Lukas 2:27, 37, 46: Simeon en Anna in de tempel; ‘in den tempel, zittende in het midden der leraars’. Johannes 10:23: ‘in de voorhal
    // van Salomo’. Hoe de tempel eruitzag, beschrijft het Nieuwe Testament niet; dit is een algemene tekening: het huis en een zuilengang.
    "kerst-tempel": { n: "De tempel in Jeruzalem",
      label: "De tempel in Jeruzalem in de avond: het hoge, witte huis op de tempelberg, met ervoor een lange zuilengang. Tussen de zuilen brandt licht; voor het huis stijgt rook op.",
      svg: avond + `<path class="k-berg2" d="M0 84q60-18 130-8t190-6v70H0z"/><path class="k-wit o" d="M130 92V34h60v58z"/><path class="k-wit o" d="M116 92V54h88v38z"/><path class="k-hout2" d="M152 92V64h16v28z"/><path class="l-oker" d="M130 40h60M116 58h88"/>` +
        K.rook(110, 70, 1) + `<path class="k-zand o" d="M10 140V96h300v44z"/><path class="l-zand2" d="M10 110h300M10 124h300M40 96v14M100 96v14M170 96v14M240 96v14M290 96v14M70 110v14M140 110v14M210 110v14M270 110v14"/>` +
        `<path class="k-duin o" d="M36 98V84h248v14z"/><path class="k-duin o" d="M40 84V74h240v10z"/>` + schemer +
        `<path class="k-schijn tf-l-gloed" d="M40 84h240v14H40z"/><path class="k-venster" d="${Array.from({ length: 11 }, (_, i) => `M${46 + i * 21.5} 86h12v10h-12z`).join("")}"/>` },

    // Mattheüs 2:1–2: ‘zie, enige wijzen van het oosten zijn te Jeruzalem aangekomen, zeggende: Waar is de geboren Koning der Joden?’
    // Een groepje zonder vast aantal, geen kamelen, geen kronen. Geen ster: die zien zij pas weer als zij naar Bethlehem gaan (2:9–10).
    "kerst-poort": { n: "Reizigers uit het oosten bij Jeruzalem",
      label: "Jeruzalem in de avond: de muur met een poort, en achter de muur huizen met licht in de vensters. Over de weg uit het oosten komt een groepje reizigers in kleurige kleren naar de poort toe.",
      svg: avond + K.verte + huizen([[30, 54, 20], [74, 46, 18], [120, 52, 22]], "k-duin", 80) + huizen([[52, 50, 18], [96, 42, 16], [144, 56, 16]], "k-wit", 80) +
        K.muur(10, 70, 170, 40) + K.toren(70, 60, 20, 50) + `<path class="k-hout2" d="M73 110V96a7 7 0 0 1 14 0v14z"/><path class="k-land" d="M0 108q160-8 320-2v34H0z"/><path class="l-duin breed" d="M80 112q80 8 140 2t100 4"/>` +
        K.palm(238, 104) + K.struik(286, 128, 1.1) + K.struik(30, 126) + schemer + vensters([[35, 60], [78, 52], [100, 48], [126, 58], [148, 62]]) +
        `<g class="tf-e-kom-r">${reizigers(170, 124, 1.5)}</g>` },

    // Mattheüs 2:9–10: ‘en ziet, de ster, die zij in het oosten gezien hadden, ging hun voor, totdat zij kwam en stond boven de plaats,
    // waar het Kindeken was. Als zij nu de ster zagen, verheugden zij zich met zeer grote vreugde.’ Eén ster; verder geen sterren.
    "kerst-ster-weg": { n: "De ster gaat hun voor",
      label: "Het is nacht. Op de weg van Jeruzalem naar Bethlehem gaat een groepje reizigers. Eén heldere ster komt aan de hemel en blijft staan boven Bethlehem, waar licht brandt.",
      svg: nacht + `<path class="k-berg2" d="M0 84q50-20 110-6t100-12 110 8v66H0z"/>` + K.muur(-10, 76, 50, 18) + K.toren(14, 70, 12, 24) + ((b) => b[0] +
        `<path class="k-land" d="M0 98q80-10 170-4t150-6v52H0z"/><path class="k-zand" d="M0 126q100-10 200-2t120-6v22H0z"/><path class="l-duin breed" d="M0 104q60 2 110 10t110-8 40-10"/>` +
        K.boom(60, 128, 1.1) + K.struik(200, 130) + sluier + b[1])(bethlehem(244, 94, 0.9)) + `<g class="tf-e-kom">${ster(244, 26, 0.9)}</g>` + `<g class="tf-e-kom">${reizigers(118, 118, 1.3)}</g>` },

    // Mattheüs 2:11: ‘en hun schatten opengedaan hebbende, brachten zij Hem geschenken: goud en wierook, en mirre.’ De ster (2:9) door
    // het venster. Alleen de geschenken: geen mensen.
    "kerst-geschenken": { n: "Goud, wierook en mirre",
      label: "In een huis, bij het licht van een olielamp: een geopend kistje met goud, een schaal met wierook en een kruikje met mirre. Door het venster is de ster te zien.",
      svg: kamer(234, 52) + schemer + ster(260, 36, 0.62) + lamp(36, 112, 1.5) + `<path class="k-terra2 o" d="M80 112l6-10h150l6 10z"/>` +
        `<path class="k-hout o" d="M98 80l4-20h38l-4 20z"/><path class="k-oker o" d="M97 88q6-14 16-8 6-10 14-4 8-2 11 12z"/><path class="l-wit dik" d="M106 82h.1M114 84h.1M121 79h.1M130 83h.1"/><path class="k-hout o" d="M96 86h42v20H96z"/><path class="l-hout2" d="M96 92h42M117 86v20"/>` +
        `<path class="k-terra o" d="M154 98q0 8 18 8t18-8z"/><path class="k-duin o2" d="M156 98q4-6 16-6t16 6z"/><path class="l-licht" d="M162 96h1M168 94h1M176 95h1M182 97h1"/>` +
        `<path class="k-wit o" d="M210 106q-8 0-8-12t5-14v-5h6v5q5 2 5 14t-8 12z"/><path class="k-hout o2" d="M206 72h8v4h-8z"/>` },

    // Mattheüs 2:13–14: ‘vlied in Egypte’; ‘Hij dan opgestaan zijnde, nam het Kindeken en Zijn moeder tot zich in den nacht, en vertrok
    // naar Egypte’. Jozef en Maria als twee kleine figuren, van ver; het Kind is niet getekend.
    "kerst-vlucht": { n: "In de nacht naar Egypte",
      label: "Het is nacht. Een weg loopt van Bethlehem weg, het donkere heuvelland in, naar het zuidwesten. Over de weg gaan twee kleine figuren weg, in de richting van Egypte. Boven de heuvels staan sterren.",
      svg: nacht + `<path class="k-berg2" d="M0 74q60-24 120-10t110-12 90 10v78H0z"/>` + bethlehem(250, 84, 0.75)[0] + `<path class="k-land" d="M0 94q90-14 180-6t140-6v58H0z"/><path class="k-zand" d="M0 124q100-12 200-2t120-6v24H0z"/>` +
        `<path class="l-duin breed" d="M250 86q-30 14-80 22T50 126 0 132"/>` + K.boom(290, 104, 1) + K.struik(40, 112) + K.struik(200, 128, 1.1) + sluier +
        sterren([[18, 12], [50, 28], [90, 10], [130, 24], [176, 12], [214, 30], [264, 14], [304, 26]]) + sterren([[70, 44], [240, 44]], 1) +
        `<g class="tf-e-kom-r">${jozefMaria(110, 122, 1.5)}</g>` },

    // Lukas 2:41–44: ‘zijn ouders reisden alle jaren naar Jeruzalem, op het feest van het pascha’; ‘in het gezelschap op den weg’;
    // ‘onder de magen, en onder de bekenden’. De weg klimt van het Jordaandal naar Jeruzalem (‘zij opgegaan waren’, 2:42).
    "kerst-pascha": { n: "Op weg naar het Pascha",
      label: "Over de weg door het bergland trekt een groot reisgezelschap: families, buren en bekenden. De weg klimt omhoog naar Jeruzalem, dat bovenop de berg ligt, met de tempel. Beneden in het dal staan palmbomen.",
      svg: `<g class="tf-l-drijf">${K.wolk(70, 26, 0.9)}</g>` + `<path class="k-berg2" d="M0 76q40-18 90-6t90-8 140 4v74H0z"/><path class="k-berg" d="M120 140q40-80 120-92t80 2v90z"/>` + `<path class="k-wit o" d="M244 40V18h24v22z"/><path class="l-oker" d="M244 21h24"/>` + K.stad(256, 56, 0.45) +
        `<path class="k-land" d="M0 104q90-12 170-2t150-4v42H0z"/><path class="k-zand" d="M0 128q100-8 200-2t120-4v18H0z"/>` +
        `<path class="l-duin breed" d="M0 122q90-4 150-14t70-30 30-22"/>` + K.palm(30, 112, 1.1) + K.palm(52, 118, 0.9) + K.struik(290, 124) +
        `<g class="tf-e-kom"><path class="menigte" d="M60 116h70M150 106h30"/><path class="menigte m2" d="M70 112h60M154 102h22M188 92h10"/><path class="menigte kop" d="M61.5 111.5h70M71.5 107.5h60M151.5 101.5h30M155.5 97.5h22M189.5 87.5h10"/>` +
        mensen([[136, 116, 1.2], [140, 112, 1]]) + vrouwen([[146, 114, 1.1]], "k-salie") + mensen([[52, 120, 0.9]], "k-zand") + `</g>` },
  });
})();
