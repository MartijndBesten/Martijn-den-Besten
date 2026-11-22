// Maakt public/bijbelreis/og.jpg (deelplaatje, 1200 × 630) van de echte kaart op bijbelreis.nl.
// Gebruik: node scripts/bijbelreis-og.mjs uit.png  en daarna als JPEG (kwaliteit 86) opslaan als public/bijbelreis/og.jpg.
import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto("https://bijbelreis.nl/#abraham", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.dispatchEvent(new Event("resize")); });
await p.waitForTimeout(2500);
await p.addStyleTag({ content: `
  body > *:not(#og):not(main), header, .kop, .tabs, .leaflet-control-container, .kaartknoppen, .map-ctrl, #welkom, .reisbalk, .stapbalk, .panel, aside, nav, .legenda { visibility: hidden !important; }
  #map, #map * { visibility: visible !important; }
  #map { position: fixed !important; left: 340px !important; top: 0 !important; width: 860px !important; height: 630px !important; z-index: 9000 !important; }
  body { background: #1b2f58 !important; }
  #map .leaflet-control-container, #map .leaflet-control-container * { visibility: hidden !important; }
  #og { position: fixed; inset: 0; z-index: 99999; pointer-events: none; font-family: var(--font-sans); }
  #og .vlak { position: absolute; left: 0; top: 0; bottom: 0; width: 560px; background: linear-gradient(90deg, rgba(27,47,88,.97) 0, rgba(36,61,112,.93) 78%, rgba(36,61,112,0) 100%); }
  #og .tekst { position: absolute; left: 64px; top: 0; bottom: 0; width: 450px; display: flex; flex-direction: column; justify-content: center; color: #fffcf6; }
  #og .kameel { width: 96px; height: 96px; border-radius: 22px; margin-bottom: 30px; box-shadow: 0 6px 18px rgba(0,0,0,.25); }
  #og h1 { font-size: 64px; line-height: 1.02; letter-spacing: -0.035em; font-weight: 700; margin: 0; }
  #og h1 em { display: block; font-family: var(--font-serif); font-style: italic; font-weight: 400; letter-spacing: 0; color: #f0d9b5; font-size: 1.18em; }
  #og p { font-size: 25px; line-height: 1.35; color: #e4e9f2; margin: 26px 0 0; max-width: 420px; text-wrap: balance; }
  #og .url { margin-top: 30px; font-size: 22px; font-weight: 600; color: #f0d9b5; letter-spacing: .01em; }
`});
await p.evaluate(() => { const d = document.createElement("div"); d.id = "og"; d.innerHTML = `<div class="vlak"></div><div class="tekst"><img class="kameel" src="/bijbelreis/apple-touch-icon.png" alt=""><h1>Op reis door <em>de Bijbel</em></h1><p>166 geschiedenissen van de schepping tot Openbaring, op de kaart.</p><div class="url">bijbelreis.nl</div></div>`; document.body.append(d); });
await p.evaluate(() => window.dispatchEvent(new Event("resize"))); await p.waitForTimeout(1500); await p.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /Abraham/.test(x.textContent) && x.offsetParent); }); await p.waitForTimeout(800);
await p.screenshot({ path: process.argv[2] });
await b.close();
