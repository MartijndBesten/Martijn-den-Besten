// Vooraf gerenderde objecten (museum, afdelingen, hero-vormen). Zie scripts/render-3d.mjs.

const EXHIBITS = ["uitstel-app", "zelfvouwende-was", "gedachtenspiegel", "vergaderzandloper", "idee-rem"];
const UNFINISHED = ["schuurtje", "fotoalbum", "handleiding", "moestuin"];
const DEPTS = ["knop", "sokkel", "lamp", "ticket", "certificaat", "planeet"];
const SHAPES = ["bal", "ring", "ster", "pil", "kronkel"];

export default [
  // draaiplateau: 8 beelden naast elkaar in één strook
  ...EXHIBITS.map((id) => ({ name: `stuk-${id}`, query: `scene=stuk:${id}&frames=8`, w: 480, h: 544, out: [3840] })),
  ...UNFINISHED.map((id) => ({ name: `bijna-${id}`, query: `scene=bijna:${id}`, w: 960, h: 720, out: [480, 960] })),
  { name: "archief", query: "scene=archief", w: 1000, h: 800, out: [600, 1000], anchors: ["objects", "archief"] },
  { name: "mini", query: "scene=mini", w: 1000, h: 700, out: [600, 1000], anchors: ["objects", "mini"] },
  { name: "kinetisch-frame", query: "scene=kinetisch:frame", w: 900, h: 900, out: [500, 900], anchors: ["objects", "kinetisch"] },
  { name: "kinetisch-wheel", query: "scene=kinetisch:wheel", w: 900, h: 900, out: [500, 900] },
  { name: "kinetisch-pendulum", query: "scene=kinetisch:pendulum", w: 900, h: 900, out: [500, 900] },
  { name: "donker", query: "scene=donker", w: 1600, h: 860, out: [900, 1600], anchors: ["objects", "donker"] },
  ...DEPTS.map((k) => ({ name: `afd-${k}`, query: `scene=afd:${k}`, w: 400, h: 400, out: [400] })),
  ...SHAPES.map((k) => ({ name: `vorm-${k}`, query: `scene=afd:${k}`, w: 240, h: 240, out: [240] })),
];
