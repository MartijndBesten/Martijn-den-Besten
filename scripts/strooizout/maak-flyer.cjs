// Maakt de flyer (A5-PDF) en de deelbeelden (JPEG) uit de flyerpagina van een draaiende webshop.
// Gebruik: start eerst de site lokaal (npx wrangler dev ...), dan: node scripts/strooizout/maak-flyer.cjs [basis-URL]
// Prijs en bezorgtarief komen uit die webshop; uitvoer in public/strooizout/.
const { chromium } = require("playwright");
const path = require("node:path");

const basis = process.argv[2] ?? "http://localhost:8790";
const uit = path.join(__dirname, "../../public/strooizout");

(async () => {
  const browser = await chromium.launch();
  const klaar = async (page) => {
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => null)))));
  };
  for (const [vorm, b, h, bestand] of [["vierkant", 1080, 1080, "delen-1080.jpg"], ["breed", 1200, 630, "delen-1200x630.jpg"]]) {
    const page = await browser.newPage({ viewport: { width: b, height: h }, deviceScaleFactor: 1 });
    await page.goto(`${basis}/strooizout/flyer?alleen=${vorm}`);
    await klaar(page);
    await page.screenshot({ path: path.join(uit, bestand), type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: b, height: h } });
    console.log("gemaakt:", bestand);
    await page.close();
  }
  for (const [deel, formaat, bestand, breed, hoog] of [["a5", "A5", "flyer-a5.pdf", 560, 794], ["bord", "A4", "bord-a4.pdf", 794, 1123]]) {
    const page = await browser.newPage({ viewport: { width: breed, height: hoog } });
    await page.goto(`${basis}/strooizout/flyer?alleen=${deel}`);
    await klaar(page);
    await page.pdf({ path: path.join(uit, bestand), format: formaat, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    
    console.log("gemaakt:", bestand);
    await page.close();
  }
  await browser.close();
})();
