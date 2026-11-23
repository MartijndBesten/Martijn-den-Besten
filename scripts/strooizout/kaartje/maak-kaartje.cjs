// A6-kaartje ‘Strooizout voor de buurt’: hangkaartje aan emmer of zak én flyer voor in de buurt.
// Maakt uit één tekening (SVG, in millimeters) de beoordelings-pdf (105 × 148 mm), de drukklare pdf met 3 mm afloop
// (111 × 154 mm) en een afbeelding. Gebruik: node maak-kaartje.cjs
const path = require("node:path");
const fs = require("node:fs");
const REPO = path.join(__dirname, "../../..");
const { chromium } = require(path.join(REPO, "node_modules/playwright"));
const qrcode = require(path.join(REPO, "node_modules/qrcode-generator"));

const UIT = path.join(REPO, "docs/strooizout/kaartje");
// Optioneel (`--prijs`): een prijsbolletje rechtsboven, alleen voor het deelbeeld voor WhatsApp (JPEG). De gedrukte versie
// heeft bewust geen prijs, zodat het kaartje niet veroudert. De prijs hieronder is de prijs van één zak (zie de webshop).
const METPRIJS = process.argv.includes("--prijs");
const PRIJSBOLLETJE = { regel1: "Zak 25 kilo", regel2: "vanaf", regel3: "€ 9,99" };
// Optioneel (`--zonder-qr`): het deelbeeld voor WhatsApp zonder QR-code (een QR scan je niet op je eigen scherm): in plaats
// daarvan staat het adres groot in beeld. Alleen voor het deelbeeld, samen met `--prijs`.
const ZONDERQR = process.argv.includes("--zonder-qr");
const URL_QR = "https://strooizouthouten.nl/?via=kaartje";
const A = 3; // afloop in mm; alle maten hieronder zijn in mm vanaf de snijlijn (0,0 = linkerbovenhoek van het kaartje)
const B = 105;
const H = 148;

const font = fs.readFileSync(path.join(REPO, "public/fonts/geist.woff2")).toString("base64");
const denckh = fs.readFileSync(path.join(REPO, "public/bijbelreis/denckh-logo-signature.svg")).toString("base64");
const logo = fs
  .readFileSync(path.join(REPO, "public/strooizout/logo/logo-donker.svg"), "utf8")
  .replace(/<\?xml[^>]*>/, "")
  .replace(/<title>.*?<\/title>/, "")
  .replace(/id="szl"/g, 'id="kaart-logo"')
  .replace(/url\(#szl\)/g, "url(#kaart-logo)");

function qr(tekst) {
  const q = qrcode(0, "M");
  q.addData(tekst);
  q.make();
  const n = q.getModuleCount();
  let pad = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) pad += `M${c} ${r}h1v1h-1z`;
  return { pad, n };
}

// ---------- De straat ----------
const GROND = 96;
// [x, breedte, hoogte, verlichte ramen, kleur]
const HUIZEN = [
  [-9, 25, 17, [1, 0, 0, 1], "#143a66"],
  [21, 27, 21, [1, 1, 0, 1], "#123461"], // jouw huis
  [56, 27, 19, [1, 1, 1, 0], "#0f2d52"], // de buur
  [89, 25, 22, [0, 1, 1, 0], "#143a66"],
];
function huis([x, w, h, aan, kleur], nr) {
  const top = GROND - h;
  const nok = top - w * 0.3;
  const mid = x + w / 2;
  const ramen = aan.map((licht, i) => ({ licht, x: x + 3.4 + (i % 2) * (w - 11.6), y: top + 3 + Math.floor(i / 2) * 7.4 }));
  const buur = nr === 2;
  const jij = nr === 1;
  return `
  <g>
    ${ramen.filter((r) => r.licht).map((r) => `${gloed(r.x + 2.4, r.y + 2.2, 6, "#ffb547", 0.5, 10)}`).join("")}
    <path d="M${x} ${GROND} V${top} L${mid} ${nok} L${x + w} ${top} V${GROND} Z" fill="${kleur}"/>
    <path d="M${x - 0.8} ${top + 0.6} L${mid} ${nok - 0.4} L${x + w + 0.8} ${top + 0.6}" fill="none" stroke="#f1f8fd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="${mid + w * 0.2}" y="${nok + w * 0.06}" width="2.6" height="${w * 0.2}" fill="${kleur}"/>
    <path d="M${mid + w * 0.2 - 0.4} ${nok + w * 0.06} h3.4" stroke="#f1f8fd" stroke-width="1.1" stroke-linecap="round"/>
    ${ramen.map((r) => `<rect x="${r.x}" y="${r.y}" width="4.8" height="4.4" rx="0.6" fill="${r.licht ? "#ffc266" : "#1f4f86"}" ${r.licht ? "" : 'opacity="0.75"'}/>${r.licht ? `<path d="M${r.x + 2.4} ${r.y} v4.4 M${r.x} ${r.y + 2.2} h4.8" stroke="#c98a2b" stroke-width="0.35"/>` : ""}`).join("")}
    <rect x="${mid - 2.1}" y="${GROND - 7.6}" width="4.2" height="7.6" rx="0.6" fill="${jij || buur ? "#ffb547" : "#071a31"}"/>
    ${jij ? `<circle cx="${mid + 1.2}" cy="${GROND - 3.6}" r="0.35" fill="#0b2340"/>` : ""}
    ${
      buur
        ? `<g fill="#0b2340">
             <circle cx="${mid - 0.3}" cy="${GROND - 5}" r="0.95"/>
             <path d="M${mid - 1.6} ${GROND} v-2.4 a1.3 1.3 0 0 1 2.6 0 V${GROND} Z"/>
             <path d="M${mid + 0.8} ${GROND - 3.1} L${mid + 1.9} ${GROND - 5.7}" fill="none" stroke="#0b2340" stroke-width="0.7" stroke-linecap="round"/>
           </g>
           <path transform="translate(${mid} ${GROND - 11.4})" d="M0 1.6 C -2.5 -0.4, -1.6 -2.5, 0 -1.1 C 1.6 -2.5, 2.5 -0.4, 0 1.6 Z" fill="#ffb547"/>`
        : ""
    }
  </g>`;
}
const DEUR_JIJ = 21 + 27 / 2;
const DEUR_BUUR = 56 + 27 / 2;
const STOEP = 101.6;
// Het gestrooide pad: van jouw voordeur de stoep op, langs de straat en bij de buur weer naar de deur.
const PAD = `M${DEUR_JIJ} ${GROND + 0.6} C ${DEUR_JIJ} ${STOEP - 1.5}, ${DEUR_JIJ + 3} ${STOEP}, ${DEUR_JIJ + 8} ${STOEP} H${DEUR_BUUR - 8} C ${DEUR_BUUR - 3} ${STOEP}, ${DEUR_BUUR} ${STOEP - 1.5}, ${DEUR_BUUR} ${GROND + 0.6}`;

// Iemand die strooit, halverwege het pad: winterjas, sjaal en muts, een emmer zout in de ene hand en met de andere
// hand strooiend, op weg naar de buur. Getekend in een vak van 60 × 100 (voeten op y = 100) en daarna verkleind.
function strooier(x, y, hoogte = 11.5) {
  const k = hoogte / 100;
  return `
  <g transform="translate(${x} ${y}) scale(${k}) translate(-30 -100)" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="32" cy="100.4" rx="19" ry="2.8" fill="#020a14" opacity="0.38"/>
    <!-- achterste arm met de emmer -->
    <path d="M25 47 Q19 56 17 66" fill="none" stroke="#6fb0de" stroke-width="7.4"/>
    <path d="M9.6 72.5 Q16.8 60.5 24 72.5" fill="none" stroke="#dfeaf3" stroke-width="1.5"/>
    <path d="M8.2 72 H25.4 L23.2 87 Q16.8 89 10.4 87 Z" fill="#f4f9fd"/>
    <path d="M8.2 72 H25.4" stroke="#bcd3e4" stroke-width="1.6"/>
    <path d="M10.6 71.4 Q16.8 66.8 23 71.4 Z" fill="#ffffff"/>
    <path d="M9.4 79.5 Q16.8 81.3 24.2 79.5" fill="none" stroke="#ffb547" stroke-width="1.7"/>
    <circle cx="16.8" cy="66.6" r="4" fill="#ffb547"/>
    <!-- benen en laarzen (in de loop) -->
    <path d="M27.5 72 L22.5 93" fill="none" stroke="#14325a" stroke-width="8"/>
    <path d="M17.6 91.6 h8.6 v3.6 h3.2 a3 3 0 0 1 3 3 v1.8 h-14.8 Z" fill="#0b2340"/>
    <path d="M34 72 L40.5 93" fill="none" stroke="#1b3f6e" stroke-width="8"/>
    <path d="M36 91.6 h8.6 v3.6 h3.2 a3 3 0 0 1 3 3 v1.8 h-14.8 Z" fill="#0b2340"/>
    <path d="M17.6 100 h14.8 M36 100 h14.8" stroke="#eaf5fc" stroke-width="1.2"/>
    <!-- jas -->
    <path d="M19.5 49 C19.5 40.5 25.5 36.5 31 36.5 C36.5 36.5 42.5 40.5 42.5 49 L45 74.5 Q31 80 17 74.5 Z" fill="#8fc4ea"/>
    <path d="M17 74.5 Q31 80 45 74.5 L44.6 70.5 Q31 76 17.4 70.5 Z" fill="#6fb0de"/>
    <path d="M31.4 41 V77" stroke="#6aa7d4" stroke-width="1.3"/>
    <path d="M36.5 60.5 h4.5" stroke="#6aa7d4" stroke-width="1.3"/>
    <!-- sjaal -->
    <path d="M24 42 Q16 44.5 13.5 53" fill="none" stroke="#f0a136" stroke-width="4.6"/>
    <path d="M22.5 39.3 Q31 44.3 39.5 39.3" fill="none" stroke="#ffb547" stroke-width="5.8"/>
    <!-- hoofd -->
    <circle cx="31" cy="27" r="9.6" fill="#f6d7b8"/>
    <circle cx="36.2" cy="30.4" r="2.1" fill="#f1a48a" opacity="0.75"/>
    <circle cx="29" cy="27" r="1.15" fill="#0b2340"/>
    <circle cx="35" cy="27" r="1.15" fill="#0b2340"/>
    <path d="M29.6 31.3 Q32.2 33.7 35 31.3" fill="none" stroke="#0b2340" stroke-width="1.15"/>
    <!-- muts met pompon -->
    <path d="M21.1 24.6 C21.1 11.8 40.9 11.8 40.9 24.6 Z" fill="#ffb547"/>
    <rect x="20.2" y="21.6" width="21.6" height="4.8" rx="2.4" fill="#ffd08a"/>
    <circle cx="31" cy="12.8" r="3.6" fill="#ffffff"/>
    <!-- voorste arm strooit -->
    <path d="M37.5 47.5 Q45 53.5 52.5 47.5" fill="none" stroke="#a9d4f1" stroke-width="7.4"/>
    <circle cx="53.8" cy="46.6" r="4" fill="#ffb547"/>
    <g fill="#ffffff">
      <circle cx="58" cy="51.5" r="1.5"/><circle cx="61.5" cy="56" r="1.35"/><circle cx="57" cy="58.5" r="1.2"/>
      <circle cx="63.5" cy="62.5" r="1.4"/><circle cx="59" cy="66" r="1.2"/><circle cx="65" cy="70" r="1.3"/><circle cx="61" cy="74.5" r="1.15"/>
    </g>
    <g fill="#ffb547"><circle cx="62" cy="67.5" r="1.35"/><circle cx="57.5" cy="72" r="1.2"/><circle cx="60.5" cy="60.5" r="1.1"/></g>
  </g>`;
}

// Sneeuw in de lucht: vaste plekken (geen toeval, zodat elke afdruk gelijk is); niet over de tekst.
const VLOKKEN = [
  [9, 9, 0.5], [22, 5, 0.32], [33, 12, 0.4], [76, 6, 0.42], [90, 12, 0.34], [98, 4, 0.5], [6, 24, 0.32], [100, 24, 0.4],
  [4, 44, 0.36], [101, 40, 0.3], [7, 62, 0.42], [99, 58, 0.36], [16, 70, 0.3], [50, 68.5, 0.28], [86, 69, 0.34], [3, 78, 0.3],
  [53, 76, 0.34], [102, 73, 0.4], [41, 4, 0.28], [66, 12, 0.3], [-1, 34, 0.4], [106, 50, 0.4], [28, 67.5, 0.26], [72, 66.5, 0.3],
];

// Hulplijnen voor de controleafbeelding: snijlijn, veilige marge (4 mm) en het gaatje (Ø 5 mm, midden 10 mm onder de rand).
const GIDS = `
  <rect x="0" y="0" width="${B}" height="${H}" fill="none" stroke="#ff3b6b" stroke-width="0.25"/>
  <rect x="4" y="4" width="${B - 8}" height="${H - 8}" fill="none" stroke="#2bd4a0" stroke-width="0.25" stroke-dasharray="1.2 1"/>
  <circle cx="${B / 2}" cy="10" r="2.5" fill="none" stroke="#ff3b6b" stroke-width="0.3"/>
  <path d="M${B / 2 - 1.2} 10 h2.4 M${B / 2} 8.8 v2.4" stroke="#ff3b6b" stroke-width="0.2"/>`;

// Kleurverlopen als smalle vectorbanden en gloed als doorschijnende ringen. Zo bevat de drukversie geen
// rasterbeelden (een verloop wordt bij de omzetting naar CMYK anders een plaatje op lage resolutie).
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const meng = (a, b, t) => "#" + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * t).toString(16).padStart(2, "0")).join("");
function kleurOp(stops, t) {
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return meng(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  return stops[stops.length - 1][1];
}
/** Verticaal verloop: elke band loopt door tot onderaan, zodat er nooit een naadje tussen twee banden zit. */
function banden(x, y, w, h, stops, stap = 0.5) {
  let uit = "";
  const n = Math.ceil(h / stap);
  for (let i = 0; i < n; i++) uit += `<rect x="${x}" y="${(y + i * stap).toFixed(2)}" width="${w}" height="${(h - i * stap).toFixed(2)}" fill="${kleurOp(stops, n === 1 ? 0 : i / (n - 1))}"/>`;
  return uit;
}
/** Zachte gloed: ringen van buiten naar binnen, elk een klein beetje dekkend. */
function gloed(cx, cy, r, kleur, dekking, ringen = 14) {
  let uit = "";
  for (let i = 0; i < ringen; i++) uit += `<circle cx="${cx}" cy="${cy}" r="${(r * (1 - i / ringen)).toFixed(2)}" fill="${kleur}" fill-opacity="${(dekking / ringen).toFixed(4)}"/>`;
  return uit;
}

function tekening(gids = false) {
  const { pad, n } = qr(URL_QR);
  const QR = { x: 8, y: 111, maat: 28, rand: 2 }; // wit vlak van 28 mm; de code zelf heeft 2 mm witruimte rondom
  const mod = (QR.maat - QR.rand * 2) / n;
  const K = 41; // linkerkant van de tekstkolom naast de QR-code
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-A} ${-A} ${B + A * 2} ${H + A * 2}" width="${B + A * 2}mm" height="${H + A * 2}mm" font-family="Geist, Arial, sans-serif">
  <defs>
  </defs>

  <!-- lucht, tot in de afloop -->
  ${banden(-A, -A, B + A * 2, H + A * 2, [[0, "#061a33"], [0.55, "#0b2340"], [1, "#143a66"]], 0.5)}
  <g fill="#dceefa">${VLOKKEN.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" opacity="0.75"/>`).join("")}</g>

  <!-- de maan: hier kan het gaatje of het nietje doorheen (midden 10 mm onder de bovenrand) -->
  ${gloed(B / 2, 10, 11, "#cfe6f6", 0.34, 16)}
  <circle cx="${B / 2}" cy="10" r="5" fill="#e6f1f9"/>
  <circle cx="${B / 2 - 1.5}" cy="8.6" r="0.9" fill="#cfdfec"/><circle cx="${B / 2 + 1.7}" cy="11.4" r="0.6" fill="#cfdfec"/>

  <!-- merk -->
  <svg x="${(B - 44) / 2}" y="18.4" width="44" height="${(44 * 72) / 330}" viewBox="0 0 330 72">${logo.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")}</svg>

  <!-- kop en ondersteunende tekst -->
  <text x="${B / 2}" y="42.6" text-anchor="middle" font-size="7.9" font-weight="800" letter-spacing="-0.24" fill="#ffffff">Strooizout bestellen</text>
  <text x="${B / 2}" y="52" text-anchor="middle" font-size="7.9" font-weight="800" letter-spacing="-0.24" fill="#bfe0f7">in Houten.</text>
  <text x="${B / 2}" y="59.4" text-anchor="middle" font-size="3.45" font-weight="500" fill="#dceefa">Strooi ook even bij de buren:</text>
  <text x="${B / 2}" y="64.2" text-anchor="middle" font-size="3.45" font-weight="500" fill="#dceefa">juist voor wie dat zelf niet kan.</text>

  <!-- de straat -->
  ${HUIZEN.map(huis).join("")}
  ${banden(-A, GROND, B + A * 2, 16, [[0, "#1b4877"], [1, "#0d2a4d"]], 0.25)}
  <path d="M${-A} ${GROND + 0.2} H${B + A}" stroke="#9fc9e8" stroke-opacity="0.4" stroke-width="0.4"/>
  <g fill="#eaf5fc" opacity="0.9">
    <path d="M${-A} ${GROND + 0.3} Q 2 ${GROND - 1.5} 7 ${GROND + 0.3} Z"/>
    <path d="M17 ${GROND + 0.3} Q 22 ${GROND - 1.7} 27 ${GROND + 0.3} Z"/>
    <path d="M41 ${GROND + 0.3} Q 46.5 ${GROND - 1.4} 50 ${GROND + 0.3} Z"/>
    <path d="M76 ${GROND + 0.3} Q 82 ${GROND - 1.8} 88.5 ${GROND + 0.3} Z"/>
    <path d="M99 ${GROND + 0.3} Q 104 ${GROND - 1.3} ${B + A} ${GROND + 0.3} Z"/>
  </g>
  <g stroke="#cfe6f6" stroke-opacity="0.16" stroke-width="0.6" stroke-linecap="round"><path d="M3 99.4 h12 M84 104.6 h16 M6 105 h9 M88 99 h12"/></g>
  <!-- het gestrooide pad van deur tot deur -->
  <path d="${PAD}" fill="none" stroke="#cfe6f6" stroke-opacity="0.34" stroke-width="3.6" stroke-linecap="round"/>
  <path d="${PAD}" fill="none" stroke="#ffffff" stroke-width="0.62" stroke-linecap="round" stroke-dasharray="0.01 1.9" opacity="0.95"/>
  <path d="${PAD}" fill="none" stroke="#ffb547" stroke-width="0.85" stroke-linecap="round" stroke-dasharray="0.01 5.7" stroke-dashoffset="-1"/>
  ${strooier(51.4, STOEP + 1.3, 13.2)}

  <!-- licht vlak met de QR-code -->
  <clipPath id="paneelvorm"><path d="M${-A} ${H + A} V113 Q${-A} 107 ${3} 107 H${B - 3} Q${B + A} 107 ${B + A} 113 V${H + A} Z"/></clipPath>
  <g clip-path="url(#paneelvorm)">${banden(-A, 107, B + A * 2, H + A - 107, [[0, "#ffffff"], [1, "#e6f1f9"]], 1)}</g>
  ${
    ZONDERQR
      ? `<text x="${B / 2}" y="118.6" text-anchor="middle" font-size="5.3" font-weight="800" letter-spacing="-0.14" fill="#0b2340">Bestel online op</text>
  <rect x="${(B - 76) / 2}" y="122" width="76" height="11" rx="5.5" fill="#ffb547"/>
  <text x="${B / 2}" y="129.4" text-anchor="middle" font-size="6.1" font-weight="750" letter-spacing="-0.1" fill="#0b2340">strooizouthouten.nl</text>
  <text x="${B / 2}" y="138.4" text-anchor="middle" font-size="3.15" font-weight="500" fill="#1f5a94">Afhalen of bezorgd binnen de rondweg van Houten</text>`
      : `<rect x="${QR.x}" y="${QR.y}" width="${QR.maat}" height="${QR.maat}" rx="2" fill="#ffffff" stroke="#c3d6e5" stroke-width="0.3"/>
  <g transform="translate(${QR.x + QR.rand} ${QR.y + QR.rand}) scale(${mod})" shape-rendering="crispEdges"><path d="${pad}" fill="#0b2340"/></g>

  <text x="${K}" y="118.2" font-size="5.3" font-weight="800" letter-spacing="-0.14" fill="#0b2340">Scan om te bestellen</text>
  <rect x="${K}" y="121.4" width="56" height="8.6" rx="4.3" fill="#ffb547"/>
  <text x="${K + 28}" y="127.25" text-anchor="middle" font-size="4.35" font-weight="750" letter-spacing="-0.06" fill="#0b2340">strooizouthouten.nl</text>
  <text x="${K}" y="134.5" font-size="2.9" font-weight="500" fill="#1f5a94">Afhalen of bezorgd</text>
  <text x="${K}" y="138.3" font-size="2.9" font-weight="500" fill="#1f5a94">binnen de rondweg van Houten</text>`
  }

  ${
    METPRIJS
      ? `<g transform="translate(86 22) rotate(-8)">
    <circle r="12.6" fill="#020a14" opacity="0.28" transform="translate(0.5 0.9)"/>
    <circle r="12.4" fill="#ffb547"/>
    <circle r="11.2" fill="none" stroke="#0b2340" stroke-opacity="0.22" stroke-width="0.35" stroke-dasharray="0.9 0.9"/>
    <text y="-5.6" text-anchor="middle" font-size="2.9" font-weight="750" fill="#0b2340">${PRIJSBOLLETJE.regel1}</text>
    <text y="-2.1" text-anchor="middle" font-size="2.6" font-weight="600" fill="#0b2340">${PRIJSBOLLETJE.regel2}</text>
    <text y="4.4" text-anchor="middle" font-size="6.2" font-weight="800" letter-spacing="-0.2" fill="#0b2340">${PRIJSBOLLETJE.regel3}</text>
  </g>`
      : ""
  }
  <!-- afzender: officiële Denckh-signatuur (ongewijzigd bestand), klein en onderaan -->
  <text x="${ZONDERQR ? (B - 32) / 2 : K}" y="${ZONDERQR ? 144.2 : 143.1}" font-size="2.2" font-weight="500" fill="#45607a">Een initiatief van</text>
  <image x="${(ZONDERQR ? (B - 32) / 2 : K) + 18.2}" y="${ZONDERQR ? 141.3 : 140.2}" width="${(3.8 * 1008.93) / 305.09}" height="3.8" href="data:image/svg+xml;base64,${denckh}"/>
  ${gids ? GIDS : ""}
</svg>`;
}

function pagina(metAfloop, gids = false) {
  const b = B + (metAfloop ? A * 2 : 0);
  const h = H + (metAfloop ? A * 2 : 0);
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Strooizout voor de buurt – A6-kaartje</title><style>
    @font-face{font-family:Geist;src:url(data:font/woff2;base64,${font}) format("woff2-variations");font-weight:100 900}
    @page{size:${b}mm ${h}mm;margin:0}
    html,body{margin:0;padding:0;background:#fff}
    .vel{width:${b}mm;height:${h}mm;overflow:hidden;position:relative}
    .vel svg{display:block;position:absolute;left:${metAfloop ? 0 : -A}mm;top:${metAfloop ? 0 : -A}mm}
  </style></head><body><div class="vel">${tekening(gids)}</div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const klaar = async (page) => {
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => null)))));
  };
  if (METPRIJS) {
    // alleen het deelbeeld met prijs (300 dpi op A6); de pdf's en de drukversie blijven ongemoeid
    const mm = 96 / 25.4;
    const page = await browser.newPage({ viewport: { width: Math.round(B * mm), height: Math.round(H * mm) }, deviceScaleFactor: 1240 / Math.round(B * mm) });
    await page.setContent(pagina(false));
    await klaar(page);
    const doel = ZONDERQR ? "strooizout-kaartje-a6-prijs-zonder-qr.png" : "strooizout-kaartje-a6-prijs.png";
    await page.locator(".vel").screenshot({ path: path.join(UIT, doel) });
    await browser.close();
    console.log("gemaakt:", doel);
    return;
  }
  for (const [metAfloop, bestand] of [[false, "strooizout-kaartje-a6.pdf"], [true, "strooizout-kaartje-a6-drukklaar.pdf"]]) {
    const page = await browser.newPage();
    await page.setContent(pagina(metAfloop));
    await klaar(page);
    await page.pdf({ path: path.join(UIT, bestand), printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    await page.close();
    console.log("gemaakt:", bestand, fs.statSync(path.join(UIT, bestand)).size, "bytes");
  }
  // controle: elke tekst en elk beeldmerk blijft minstens 4 mm binnen de snijlijn
  {
    const meet = await browser.newPage();
    await meet.setContent(pagina(true));
    await klaar(meet);
    const vakken = await meet.evaluate(() => {
      const svg = document.querySelector(".vel > svg");
      const naarMm = (r) => { const m = svg.getScreenCTM().inverse(); const p = (x, y) => new DOMPoint(x, y).matrixTransform(m); const a = p(r.left, r.top), b = p(r.right, r.bottom); return [a.x, a.y, b.x, b.y].map((n) => Math.round(n * 10) / 10); };
      return [...svg.querySelectorAll(":scope > text, :scope > image, :scope > svg")].map((e) => [(e.textContent || e.tagName).trim().slice(0, 28), ...naarMm(e.getBoundingClientRect())]);
    });
    const fout = vakken.filter(([, x0, y0, x1, y1]) => x0 < 4 || y0 < 4 || x1 > B - 4 || y1 > H - 4);
    console.log("teksten en beeldmerken (mm vanaf de snijlijn):");
    for (const [naam, x0, y0, x1, y1] of vakken) console.log(`  ${naam.padEnd(30)} x ${x0}–${x1}  y ${y0}–${y1}`);
    console.log(fout.length ? "BUITEN DE VEILIGE MARGE: " + JSON.stringify(fout) : "alles binnen 4 mm van de snijlijn: in orde");
    await meet.close();
  }
  // afbeelding om te bekijken: 300 dpi op A6 (1240 × 1748 px)
  const mm = 96 / 25.4;
  const page = await browser.newPage({ viewport: { width: Math.round(B * mm), height: Math.round(H * mm) }, deviceScaleFactor: 1240 / Math.round(B * mm) });
  await page.setContent(pagina(false));
  await klaar(page);
  await page.locator(".vel").screenshot({ path: path.join(UIT, "strooizout-kaartje-a6.png") });
  console.log("gemaakt: strooizout-kaartje-a6.png");
  // controleafbeelding met afloop, snijlijn (rood), veilige marge (groen, 4 mm) en het gaatje
  const mmA = Math.round((B + A * 2) * mm);
  const gids = await browser.newPage({ viewport: { width: mmA, height: Math.round((H + A * 2) * mm) }, deviceScaleFactor: 2.6 });
  await gids.setContent(pagina(true, true));
  await klaar(gids);
  await gids.locator(".vel").screenshot({ path: path.join(UIT, "strooizout-kaartje-a6-controle-marges.png") });
  console.log("gemaakt: strooizout-kaartje-a6-controle-marges.png");
  await browser.close();
  require("node:child_process").execFileSync("python3", ["-I", path.join(__dirname, "paginamaat.py")], { cwd: UIT, stdio: "inherit" });
})();
