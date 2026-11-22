// Maakt de verticale promotiefilmpjes (1080 × 1920, mp4) van de pagina's in scripts/strooizout/film/: de pagina
// tekent zichzelf per tijdstip, Chromium legt elk beeld vast en ffmpeg zet de beelden achter elkaar, met de eigen
// muziek uit film/muziek.cjs eronder.
// Gebruik: node scripts/strooizout/maak-film.cjs [buurt|fiets]      → docs/strooizout/film/<naam>.mp4 (+ voorbeeld)
//          node scripts/strooizout/maak-film.cjs fiets --stil 2,6.5,14 [map]   → losse beelden om te bekijken
// Vereist ffmpeg op het pad. De films komen bewust niet in public/: die map gaat mee in de uitrolbundel.
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const hier = __dirname;
const FPS = 30;
const uit = path.join(hier, "../../docs/strooizout/film");
const { maakMuziek } = require("./film/muziek.cjs");

// De films: buurt (strooien bij de buren) en fiets (fietsers die uitglijden tot er gestrooid is).
const FILMS = { buurt: { bron: "film.html", naam: "strooizout-film" }, fiets: { bron: "fiets.html", naam: "strooizout-film-fiets" } };
const welke = FILMS[process.argv[2]] ? process.argv[2] : "buurt";
const FILM = FILMS[welke];

function pagina() {
  const font = fs.readFileSync(path.join(hier, "../../public/fonts/geist.woff2")).toString("base64");
  const zak = fs.readFileSync(path.join(hier, "film/zak.svg"), "utf8");
  return fs
    .readFileSync(path.join(hier, "film", FILM.bron), "utf8")
    .replace("/*LETTER*/", `@font-face{font-family:Geist;src:url(data:font/woff2;base64,${font}) format("woff2-variations");font-weight:100 900}`)
    .replace("<!--ZAK-->", zak)
    .replace("../../../public/bijbelreis/denckh-logo-signature.svg", `data:image/svg+xml;base64,${fs.readFileSync(path.join(hier, "../../public/bijbelreis/denckh-logo-signature.svg")).toString("base64")}`)
    .replace('"use strict";', '"use strict";window.STIL=true;');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const fouten = [];
  page.on("pageerror", (e) => fouten.push(String(e)));
  await page.setContent(pagina());
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
  const duur = await page.evaluate(() => window.DUUR);

  const stil = process.argv.indexOf("--stil");
  const soloMuziek = process.argv.indexOf("--muziek");
  if (soloMuziek > -1) {
    // alleen de muziek opnieuw onder een bestaande film zetten (zonder de beelden opnieuw te maken)
    await browser.close();
    const film = path.join(uit, `${FILM.naam}.mp4`);
    const tijdelijk = fs.mkdtempSync(path.join(os.tmpdir(), "strooimuziek-"));
    const muziek = maakMuziek(welke, duur, path.join(tijdelijk, "muziek.wav"));
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", film, "-i", muziek, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", path.join(tijdelijk, "uit.mp4")], { stdio: "inherit" });
    fs.copyFileSync(path.join(tijdelijk, "uit.mp4"), film);
    fs.rmSync(tijdelijk, { recursive: true, force: true });
    console.log("muziek vervangen in:", film);
    return;
  }
  if (stil > -1) {
    const map = process.argv[stil + 2] || os.tmpdir();
    fs.mkdirSync(map, { recursive: true });
    for (const t of process.argv[stil + 1].split(",").map(Number)) {
      await page.evaluate((t) => window.teken(t), t);
      await page.screenshot({ path: path.join(map, `${welke}-${t.toFixed(2)}.png`) });
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
  const film = path.join(uit, `${FILM.naam}.mp4`);
  const muziek = maakMuziek(welke, duur, path.join(beelden, "muziek.wav"));
  // H.264 met AAC-geluid: zo speelt hij overal af (WhatsApp, Instagram, Facebook, TikTok).
  execFileSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(beelden, "b%05d.png"), "-i", muziek, "-shortest", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", film],
    { stdio: "inherit" },
  );
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(beelden, `b${String(aantal - 1).padStart(5, "0")}.png`), "-q:v", "3", path.join(uit, `${FILM.naam}-voorbeeld.jpg`)], { stdio: "inherit" });
  fs.rmSync(beelden, { recursive: true, force: true });
  console.log("gemaakt:", film, fs.statSync(film).size, "bytes");
})();
