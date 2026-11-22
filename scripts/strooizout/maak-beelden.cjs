// Zet de eigen productillustraties (SVG) om naar WebP/PNG met de vooraf geïnstalleerde Chromium.
// Gebruik: node scripts/strooizout/maak-beelden.cjs   (uitvoer in public/strooizout/)
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const hier = __dirname;
const uit = path.join(hier, "../../public/strooizout");
const font = fs.readFileSync(path.join(hier, "../../public/fonts/geist.woff2")).toString("base64");

async function render(page, svgBestand, breed, hoog, type, doel) {
  const svg = fs.readFileSync(path.join(hier, svgBestand), "utf8");
  await page.setViewportSize({ width: breed, height: hoog });
  await page.setContent(`<!doctype html><style>@font-face{font-family:Geist;src:url(data:font/woff2;base64,${font}) format("woff2-variations");font-weight:100 900}html,body{margin:0}svg{display:block;width:${breed}px;height:${hoog}px}</style>${svg}`);
  await page.evaluate(() => document.fonts.ready);
  const data = await page.evaluate(async ({ breed, hoog, type }) => {
    const svg = document.querySelector("svg");
    const xml = new XMLSerializer().serializeToString(svg);
    const css = document.querySelector("style").textContent;
    const metFont = xml.replace(/<defs>/, `<defs><style>${css.replace(/html,body.*$/, "")}</style>`);
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(metFont)));
    await img.decode();
    const c = document.createElement("canvas");
    c.width = breed;
    c.height = hoog;
    c.getContext("2d").drawImage(img, 0, 0, breed, hoog);
    return c.toDataURL(type, 0.86);
  }, { breed, hoog, type });
  fs.writeFileSync(path.join(uit, doel), Buffer.from(data.split(",")[1], "base64"));
  console.log("gemaakt:", doel, fs.statSync(path.join(uit, doel)).size, "bytes");
}

(async () => {
  fs.mkdirSync(path.join(uit, "beeld"), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await render(page, "zak.svg", 940, 940, "image/webp", "beeld/strooizout-25kg.webp");
  await render(page, "schep.svg", 940, 940, "image/webp", "beeld/sneeuwschep.webp");
  await render(page, "../../public/strooizout/logo/merk.svg", 180, 180, "image/png", "icoon-180.png");
  await render(page, "../../public/strooizout/logo/merk.svg", 512, 512, "image/png", "icoon-512.png");
  await render(page, "../../public/strooizout/logo/logo-licht.svg", 1320, 288, "image/png", "logo/logo-licht.png");
  await render(page, "../../public/strooizout/logo/logo-donker.svg", 1320, 288, "image/png", "logo/logo-donker.png");
  await browser.close();
})();
