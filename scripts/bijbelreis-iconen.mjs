// Maakt de pictogrammen van de Bijbelreis als installeerbare app (docs/bijbelreis-pwa/README.md) uit het bestaande
// beeldmerk: de kameel uit public/bijbelreis/favicon.svg. Er komt niets nieuws bij; alleen de maten verschillen.
//   - icoon-192.png en icoon-512.png: het pictogram zoals de favicon (afgeronde tegel), voor ‘any’;
//   - icoon-maskable-192.png en icoon-maskable-512.png: dezelfde kameel kleiner op een volle tegel, zodat Android hem in
//     elke vorm (cirkel, druppel, vierkant) kan uitsnijden zonder dat er iets van de kameel wegvalt (veilige zone: 80 %).
// Eenmalig te draaien na een wijziging van het beeldmerk: node scripts/bijbelreis-iconen.mjs
import { readFileSync } from "node:fs";
import sharp from "sharp";

const map = "public/bijbelreis/";
const svg = readFileSync(map + "favicon.svg", "utf8");
const tegel = svg.match(/<rect[^>]*fill="([^"]+)"/)[1];
const kameel = svg.match(/<g[\s\S]*<\/g>/)[0];

// De kameel beslaat in het 48×48-vak x 5,3–48,7 en y 9,9–42,5 (met de translate(0 3); gemeten): in de favicon raakt de
// kop de rand. Hier staat hij in het midden (27 ; 26,2), met ruimte eromheen, zoals in apple-touch-icon.png.
const midden = (schaal) => `translate(24 24) scale(${schaal}) translate(-27 -26.2)`;
// Gewoon pictogram: de afgeronde tegel van de favicon, de kameel op 80 %.
const gewoon = svg.replace(/<g[\s\S]*<\/g>/, `<g transform="${midden(0.8)}">${kameel}</g>`);
// Maskable: volle tegel; op 66 % blijft de verste punt (halve diagonaal 27,1 × 0,66 ≈ 17,9) binnen de cirkel van 19,2 (80 %).
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="${tegel}"/><g transform="${midden(0.66)}">${kameel}</g></svg>`;

for (const maat of [192, 512]) {
  await sharp(Buffer.from(gewoon), { density: (72 * maat) / 48 }).resize(maat, maat).png({ compressionLevel: 9 }).toFile(`${map}icoon-${maat}.png`);
  await sharp(Buffer.from(maskable), { density: (72 * maat) / 48 }).resize(maat, maat).flatten({ background: tegel }).png({ compressionLevel: 9 }).toFile(`${map}icoon-maskable-${maat}.png`);
}
console.log("iconen: icoon-192/512 en icoon-maskable-192/512 in " + map);
