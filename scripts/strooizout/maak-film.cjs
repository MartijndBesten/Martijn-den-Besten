// Maakt het verticale promotiefilmpje (1080 × 1920, mp4) van scripts/strooizout/film/film.html: de pagina tekent
// zichzelf per tijdstip, Chromium legt elk beeld vast en ffmpeg zet de beelden achter elkaar.
// Gebruik: node scripts/strooizout/maak-film.cjs            → docs/strooizout/film/strooizout-film.mp4 (+ voorbeeld)
//          node scripts/strooizout/maak-film.cjs --stil 2,6.5,14 [map]   → losse beelden om te bekijken
// Vereist ffmpeg op het pad. De film komt bewust niet in public/: die map gaat mee in de uitrolbundel.
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const hier = __dirname;
const FPS = 30;
const uit = path.join(hier, "../../docs/strooizout/film");

function pagina() {
  const font = fs.readFileSync(path.join(hier, "../../public/fonts/geist.woff2")).toString("base64");
  const zak = fs.readFileSync(path.join(hier, "film/zak.svg"), "utf8");
  return fs
    .readFileSync(path.join(hier, "film/film.html"), "utf8")
    .replace("/*LETTER*/", `@font-face{font-family:Geist;src:url(data:font/woff2;base64,${font}) format("woff2-variations");font-weight:100 900}`)
    .replace("<!--ZAK-->", zak)
    .replace('"use strict";', '"use strict";window.STIL=true;');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const fouten = [];
  page.on("pageerror", (e) => fouten.push(String(e)));
  await page.setContent(pagina());
  await page.evaluate(() => document.fonts.ready);
  const duur = await page.evaluate(() => window.DUUR);

  const stil = process.argv.indexOf("--stil");
  if (stil > -1) {
    const map = process.argv[stil + 2] || os.tmpdir();
    fs.mkdirSync(map, { recursive: true });
    for (const t of process.argv[stil + 1].split(",").map(Number)) {
      await page.evaluate((t) => window.teken(t), t);
      await page.screenshot({ path: path.join(map, `film-${t.toFixed(2)}.png`) });
    }
    console.log("beelden in", map, fouten.length ? fouten : "");
    await browser.close();
    return;
  }

  const beelden = fs.mkdtempSync(path.join(os.tmpdir(), "strooifilm-"));
  const aantal = Math.round(duur * FPS);
  for (let i = 0; i < aantal; i++) {
    await page.evaluate((t) => window.teken(t), i / FPS);
    await page.screenshot({ path: path.join(beelden, `b${String(i).padStart(5, "0")}.png`) });
    if (i % 60 === 0) console.log(`beeld ${i} van ${aantal}`);
  }
  await browser.close();
  if (fouten.length) throw new Error(fouten.join("\n"));

  fs.mkdirSync(uit, { recursive: true });
  const film = path.join(uit, "strooizout-film.mp4");
  // H.264 + stille geluidssporen: zo speelt hij overal af (WhatsApp, Instagram, Facebook, TikTok).
  execFileSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(beelden, "b%05d.png"), "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-shortest", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "64k", film],
    { stdio: "inherit" },
  );
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(beelden, `b${String(aantal - 1).padStart(5, "0")}.png`), "-q:v", "3", path.join(uit, "strooizout-film-voorbeeld.jpg")], { stdio: "inherit" });
  fs.rmSync(beelden, { recursive: true, force: true });
  console.log("gemaakt:", film, fs.statSync(film).size, "bytes");
})();
