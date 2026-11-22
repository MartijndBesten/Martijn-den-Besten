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
  const page = await browser.newPage({ viewport: { width: 560, height: 794 } });
  await page.goto(`${basis}/strooizout/flyer?alleen=a5`);
  await klaar(page);
  await page.pdf({ path: path.join(uit, "flyer-a5.pdf"), format: "A5", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  console.log("gemaakt: flyer-a5.pdf");
  await browser.close();
})();
