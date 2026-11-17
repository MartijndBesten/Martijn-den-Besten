import { expect, test, type Page } from "@playwright/test";

// De telefoonopzet van de Bijbelreis (tot 900 px; docs/bijbelreis-audit/telefoon.md §4, ‘Kaart voorop’): in het onderdeel
// Reis is de kaart het scherm, met één stapblad eroverheen. Kort: waar je bent, de titel, hooguit twee regels tekst, ◀ en
// Verder. Open: het blad schuift omhoog en scrolt binnenin, met alles wat bij de stap hoort. De telefoontests draaien één
// keer, in het project ‘mobiel’, op het zichtbare venster van een echte telefoonbrowser mét browserbalken (390×664 is een
// iPhone 13 in Safari). De tests voor verdiepende delen draaien op elk formaat.

// Elke pagina wordt vers geopend (eerst about:blank): zo test je het laden van een diepe link, niet een hashwissel.
const open = async (page: Page, hash = "") => { await page.goto("about:blank"); await page.goto("/bijbelreis" + (hash ? "#" + hash : "")); };
const zetNiveau = (page: Page, n: "a" | "b" | "c") => page.addInitScript((x) => {
  try {
    if (sessionStorage.getItem("niveauGezet")) return;
    sessionStorage.setItem("niveauGezet", "1");
    localStorage.setItem("bijbelreis:niveau", JSON.stringify(x));
  } catch { /* about:blank heeft geen opslag */ }
}, n);
const kiesNiveau = async (page: Page, n: "a" | "b" | "c") => { await page.goto("/bijbelreis"); await page.evaluate((n) => localStorage.setItem("bijbelreis:niveau", JSON.stringify(n)), n); };
const geenHorizontaalScrollen = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
// Klik de knop ‘Verder’ die er is: op de telefoon onderaan het stapblad, op de desktop in de stapkaart.
const verder = async (page: Page) => page.locator((await page.locator("#next2").isVisible()) ? "#next2" : "#next");
// Tot 900 px staat in de reis alles van de stap in het stapblad: open het eerst (één tik op ‘Lees meer’).
async function bladOpen(page: Page) {
  const knop = page.locator("#bladBtn");
  if (!(await knop.isVisible())) return;
  await expect(page.locator("#sTitle")).not.toBeEmpty();
  await expect(async () => { if ((await knop.getAttribute("aria-expanded")) !== "true") await knop.click(); await page.waitForTimeout(120); expect(await knop.getAttribute("aria-expanded")).toBe("true"); }).toPass();
}
const bladIsOpen = (page: Page) => page.locator("#bladBtn").getAttribute("aria-expanded").then((v) => v === "true");
// Alleen voor de test: de Leaflet-kaart als window.__kaart, zodat de test weet op welke schermpixel een plaats ligt.
async function kaartHaak(page: Page) {
  await page.addInitScript(() => {
    let echt: unknown;
    Object.defineProperty(window, "L", { configurable: true, get: () => echt, set: (v: { Map: { addInitHook: (f: () => void) => void } }) => { echt = v; v.Map.addInitHook(function (this: unknown) { (window as unknown as { __kaart: unknown }).__kaart = this; }); } });
  });
}
// De maten van het scherm: kop, kaart, stapblad en onderbalk (punt 8 van de opdracht).
const meet = (page: Page) => page.evaluate(() => {
  const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
  const kop = r(".kop"), tabs = r(".tabs"), blad = r("#reisboek"), kaart = r("#map"), vh = innerHeight;
  const vrij = Math.min(blad.top, kaart.bottom) - Math.max(kop.bottom, kaart.top);
  return { vh, vw: innerWidth, kopOnder: kop.bottom, tabsBoven: tabs.top, tabsHoog: tabs.height, kaartBoven: kaart.top, kaartOnder: kaart.bottom, bladBoven: blad.top, bladOnder: blad.bottom, bladHoog: blad.height, vrij,
    scrolt: document.documentElement.scrollHeight > vh + 1 || document.body.scrollHeight > vh + 1 || scrollY !== 0 };
});
// Vegen met één vinger (CDP), van (x, y) over (dx, dy).
async function veeg(page: Page, x: number, y: number, dx: number, dy: number) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= 8; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + (dx * i) / 8, y: y + (dy * i) / 8 }] }); await page.waitForTimeout(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
// Waar liggen de route, de plaatsen, de reiziger en de namen van een stap (of van het overzicht van een deel) op het
// scherm, ten opzichte van de kaartknoppen bovenaan en het stapblad onderaan?
const routeOpScherm = (page: Page, hash: string) => page.evaluate(([id, stap]) => {
    type Route = { w: string; pts: [number, number][] }; type Stap = { r?: Route[]; at: string[] };
    const BR = (window as unknown as { BR: { plaatsen: Record<string, { ll: [number, number]; k?: boolean }>; boeken: { delen: { id: string; steps: Stap[] }[] }[] } }).BR, P = BR.plaatsen;
    const k = (window as unknown as { __kaart: { latLngToContainerPoint: (ll: [number, number]) => { x: number; y: number } } }).__kaart;
    const d = BR.boeken.flatMap((b) => b.delen).find((x) => x.id === id)!;
    // Een stap: zijn routes en plaatsen. Het overzicht van een deel: alle routes van de hoofdpersoon en alle plaatsen.
    const pts = stap ? (d.steps[+stap - 1].r || []).flatMap((x) => x.pts).concat(d.steps[+stap - 1].at.map((p) => P[p].ll))
      : d.steps.flatMap((s) => (s.r || []).filter((x) => x.w !== "rood").flatMap((x) => x.pts).concat(s.at.filter((p) => P[p] && !P[p].k).map((p) => P[p].ll)));
    const kaart = document.getElementById("map")!.getBoundingClientRect(), blad = document.getElementById("reisboek")!.getBoundingClientRect();
    const knoppen = Math.max(...[...document.querySelectorAll(".leaflet-control-zoom, #heleBtn, #kaartBtn")].filter((e) => e.getClientRects().length).map((e) => e.getBoundingClientRect().bottom)) - kaart.top;
    const px = pts.map((ll) => k.latLngToContainerPoint(ll));
    const kameel = document.querySelector(".camel:not(.gone)"), kr = kameel && (kameel.classList.contains("nt") ? kameel.querySelector(".walker")! : kameel).getBoundingClientRect();
    const namen = [...document.querySelectorAll("#map .plaats .lab.on")].filter((e) => getComputedStyle(e).display !== "none").map((e) => ({ t: e.firstChild!.textContent, r: e.getBoundingClientRect() }));
    return { n: px.length, vrijOnder: blad.top - kaart.top, breed: kaart.width, knoppen,
      minX: Math.min(...px.map((p) => p.x)), maxX: Math.max(...px.map((p) => p.x)), minY: Math.min(...px.map((p) => p.y)), maxY: Math.max(...px.map((p) => p.y)),
      kameel: kr ? { boven: kr.top - kaart.top, onder: kr.bottom - kaart.top, links: kr.left, rechts: kr.right } : null,
      namenBuiten: namen.filter((x) => x.r.bottom > blad.top + 1 || x.r.left < -1 || x.r.right > kaart.width + 1 || x.r.top < kaart.top - 1).map((x) => x.t) };
  }, hash.split("/"));
type OpScherm = Awaited<ReturnType<typeof routeOpScherm>>;
function verwachtInVrijeDeel(r: OpScherm, hash: string, stap = /\/\d/.test(hash)) {
  expect(r.n, `${hash}: punten`).toBeGreaterThan(0);
  // Route en plaatsen: binnen de kaart, onder de rij kaartknoppen en boven het korte blad (met een marge).
  expect(r.minX, `${hash}: links binnen beeld`).toBeGreaterThanOrEqual(12);
  expect(r.maxX, `${hash}: rechts binnen beeld`).toBeLessThanOrEqual(r.breed - 12);
  expect(r.minY, `${hash}: onder de kaartknoppen`).toBeGreaterThanOrEqual(r.knoppen + 8);
  expect(r.maxY, `${hash}: boven het blad`).toBeLessThanOrEqual(r.vrijOnder - 16);
  if (r.kameel) {
    expect(r.kameel.onder, `${hash}: de reiziger staat boven het blad`).toBeLessThanOrEqual(r.vrijOnder - 4);
    expect(r.kameel.boven, `${hash}: de reiziger staat in de kaart`).toBeGreaterThanOrEqual(r.knoppen);
    expect(r.kameel.links >= 0 && r.kameel.rechts <= r.breed, `${hash}: de reiziger staat binnen beeld`).toBe(true);
  }
  // De namen van de plaatsen van een stap staan helemaal in het vrije deel (in het overzicht van een deel zijn het er te veel).
  if (stap) expect(r.namenBuiten, `${hash}: namen van de stap buiten het vrije deel`).toEqual([]);
}
const STAPPEN = ["izak/1", "abraham/2", "jakob", "jakob-jabbok/7", "uittocht/6", "sinai/3", "nt-paulusrome/5"];

// Het zichtbare venster van een telefoonbrowser mét browserbalken: iPhone 13 in Safari (390×664), een kleine Android
// (360×640), een iPhone SE in Safari (375×553) en een grote iPhone (430×739).
for (const [w, h] of [[390, 664], [360, 640], [375, 553], [430, 739]] as const) {
  test.describe(`kaart voorop ${w}×${h}`, () => {
    test.use({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "reduce" });
    test.beforeEach(({}, ti) => { test.skip(ti.project.name !== "mobiel", "telefoontests één keer, in het project mobiel"); });

    test("de kaart is het scherm: minstens 60 % van het venster is vrije kaart; het korte blad is hooguit 27 %", async ({ page }) => {
      const errors = watchErrors(page);
      for (const niveau of ["a", "b", "c"] as const) {
        await kiesNiveau(page, niveau);
        for (const hash of STAPPEN) {
          await open(page, hash);
          await expect(page.locator("#sTitle"), hash).not.toBeEmpty();
          await page.waitForTimeout(250);
          const wie = `${niveau} #${hash}`, m = await meet(page);
          // De pagina scrolt niet; de kaart vult alles tussen de kop en de onderbalk.
          expect(m.scrolt, `${wie}: de pagina scrolt niet`).toBe(false);
          expect(Math.abs(m.kaartBoven - m.kopOnder), `${wie}: kaart direct onder de kop`).toBeLessThanOrEqual(1);
          expect(Math.abs(m.kaartOnder - m.tabsBoven), `${wie}: kaart tot aan de onderbalk`).toBeLessThanOrEqual(1);
          expect(Math.abs(m.bladOnder - m.tabsBoven), `${wie}: blad op de onderbalk`).toBeLessThanOrEqual(1);
          expect(m.kopOnder, `${wie}: lage kop`).toBeLessThanOrEqual(44);
          expect(m.tabsHoog, `${wie}: onderbalk met tikdoelen van 44 px`).toBeGreaterThanOrEqual(44);
          // Punt 8: de maten.
          expect(m.vrij / m.vh, `${wie}: vrije kaart ≥ 60 % van het venster`).toBeGreaterThanOrEqual(0.6);
          expect(m.vrij / (m.tabsBoven - m.kopOnder), `${wie}: vrije kaart ≥ 70 % van de ruimte tussen kop en onderbalk`).toBeGreaterThanOrEqual(0.7);
          expect(m.bladHoog / m.vh, `${wie}: kort blad ≤ 27 % van het venster`).toBeLessThanOrEqual(0.27);
          // Het korte blad: waar je bent, de titel, hooguit twee regels tekst, ◀ en Verder. Verder niets.
          for (const sel of ["#kiesBtn", "#bladBtn", "#sTitle", "#prev", "#next"]) await expect(page.locator(sel), `${wie}: ${sel}`).toBeInViewport({ ratio: 1 });
          await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
          await expect(page.locator("#bladBtn")).toHaveText("Lees meer");
          await expect(page.locator("#next"), wie).toHaveText(/\d/.test(hash) ? "Verder ▶" : "Start ▶");
          for (const sel of ["#sText", "#sWho", "#leesBtn", "#sMeer", "#sFact", "#sVer", "#sTijd", "#chapters", "#boeken", "#delen", ".stapkaart .tafereel", "details.parents", "#fullBtn"]) await expect(page.locator(sel).first(), `${wie}: ${sel} niet in het korte blad`).toBeHidden();
          const t = await page.evaluate(([id, stap]) => {
            const d = (window as unknown as { BR: { boeken: { delen: { id: string; intro: string; steps: { txt: string }[] }[] }[] } }).BR.boeken.flatMap((b) => b.delen).find((x) => x.id === id)!;
            const kort = document.getElementById("sKort")!, titel = document.getElementById("sTitle")!, sk = getComputedStyle(kort), st = getComputedStyle(titel);
            const regels = (e: HTMLElement, s: CSSStyleDeclaration) => (e.hidden ? 0 : Math.round(e.getBoundingClientRect().height / parseFloat(s.lineHeight)));
            return { bron: stap ? d.steps[+stap - 1].txt : d.intro, kort: kort.textContent || "", verborgen: kort.hidden, regelsKort: regels(kort, sk), regelsTitel: regels(titel, st), px: parseFloat(sk.fontSize), titelPx: parseFloat(st.fontSize), regelPx: parseFloat(getComputedStyle(document.getElementById("kiesBtn")!).fontSize), afgekapt: titel.scrollHeight > titel.clientHeight + 2 };
          }, hash.split("/"));
          expect(t.regelsKort, `${wie}: hooguit twee regels tekst`).toBeLessThanOrEqual(h < 600 ? 1 : 2);
          expect(t.regelsKort + t.regelsTitel, `${wie}: titel en tekst samen altijd even hoog`).toBe(h < 600 ? 2 : 3);
          expect(t.afgekapt, `${wie}: de titel staat er helemaal`).toBe(false);
          if (!t.verborgen) {
            expect(t.kort.length, `${wie}: er staat tekst`).toBeGreaterThan(10);
            expect(t.bron.startsWith(t.kort), `${wie}: de korte tekst is het begin van de staptekst`).toBe(true);
            expect(t.px, `${wie}: tekst minstens 16 px`).toBeGreaterThanOrEqual(16);
          }
          expect(t.titelPx, `${wie}: titel leesbaar`).toBeGreaterThanOrEqual(18);
          expect(t.regelPx, `${wie}: de kleine regel minstens 13 px`).toBeGreaterThanOrEqual(13);
          expect(await geenHorizontaalScrollen(page), wie).toBe(true);
        }
      }
      expect(errors).toEqual([]);
    });

    test("de route past in het vrije deel van de kaart: niets ligt onder het blad of onder de kaartknoppen", async ({ page }) => {
      await kaartHaak(page);
      await zetNiveau(page, "b");
      for (const hash of ["izak/1", "abraham/2", "jakob", "jakob-jabbok/7", "uittocht/6", "sinai/3", "nt-paulusrome/5", "abraham/7", "nt-paulus2/4"]) {
        await open(page, hash);
        await expect(page.locator("#sTitle"), hash).not.toBeEmpty();
        await page.waitForTimeout(500);
        const r = await routeOpScherm(page, hash);
        verwachtInVrijeDeel(r, hash);
      }
    });

    test("de ballon van een plaats ligt vrij: boven het blad en niet onder kaartknoppen", async ({ page }) => {
      await zetNiveau(page, "c");
      await open(page, "sinai/3");
      await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
      await page.waitForTimeout(600);
      const knoppenZichtbaar = () => page.evaluate(() => [...document.querySelectorAll(".maptools > *, .mapacties > *, .leaflet-control-zoom")].filter((e) => (e as HTMLElement).offsetParent && getComputedStyle(e).visibility !== "hidden").length);
      expect(await knoppenZichtbaar()).toBeGreaterThan(0);
      for (const plaats of ["Berg Sinaï", "Rafidim"]) {
        await page.evaluate((p) => { const m = [...document.querySelectorAll(".leaflet-marker-icon")].find((e) => (e.textContent || "").includes(p)); m!.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, plaats);
        const ballon = page.locator(".leaflet-popup-content-wrapper");
        await expect(ballon).toBeVisible();
        await expect(ballon).toContainText(plaats);
        await page.waitForTimeout(600);
        const r = await page.evaluate(() => {
          const p = document.querySelector(".leaflet-popup-content-wrapper")!.getBoundingClientRect(), tip = document.querySelector(".leaflet-popup-tip-container")!.getBoundingClientRect(), k = document.getElementById("map")!.getBoundingClientRect(), blad = document.getElementById("reisboek")!.getBoundingClientRect();
          const over = [...document.querySelectorAll(".maptools > *, .mapacties > *, .leaflet-control-zoom, #reisboek, .tabs, .kop")].filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden").map((e) => e.getBoundingClientRect());
          return { bedekt: over.filter((b) => b.left < p.right && b.right > p.left && b.top < p.bottom && b.bottom > p.top).length, inKaart: p.top >= k.top - 1 && p.left >= k.left - 1 && p.right <= k.right + 1, punt: tip.bottom, bladBoven: blad.top };
        });
        expect(r.bedekt, `${plaats}: knoppen of het blad over de ballon`).toBe(0);
        expect(r.inKaart, `${plaats}: ballon past in de kaart`).toBe(true);
        expect(r.punt, `${plaats}: de punt van de ballon (de plaats zelf) ligt boven het blad`).toBeLessThanOrEqual(r.bladBoven);
        await page.locator(".leaflet-popup-close-button").click();
        await expect(ballon).toBeHidden();
        expect(await knoppenZichtbaar(), "na sluiten zijn de knoppen terug").toBeGreaterThan(0);
      }
    });

    test("doorklikken: Verder en ◀ houden het blad kort en op dezelfde plek; vegen kan ook; de kaart sleep je met één vinger", async ({ page }) => {
      await kaartHaak(page);
      await zetNiveau(page, "c");
      await open(page, "abraham");
      await expect(page.locator("#next")).toHaveText("Start ▶");
      const plek = async () => ({ blad: (await page.locator("#reisboek").boundingBox())!, knop: (await page.locator("#next").boundingBox())! });
      const begin = await plek();
      for (let i = 1; i <= 6; i++) {
        await page.locator("#next").click();
        await expect(page.locator("#sTitle")).toHaveText(new RegExp(`^${i}\\. `));
        await expect(page.locator("#kiesBtn")).toContainText(`${i} van 25`);
        await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
        const nu = await plek();
        expect(Math.abs(nu.blad.y - begin.blad.y), `stap ${i}: het blad blijft even hoog`).toBeLessThanOrEqual(2);
        expect(Math.abs(nu.knop.y - begin.knop.y), `stap ${i}: Verder blijft op zijn plek`).toBeLessThanOrEqual(2);
        expect((await meet(page)).scrolt).toBe(false);
      }
      await page.locator("#prev").click();
      await expect(page.locator("#sTitle")).toHaveText(/^5\. /);
      await expect(page).toHaveURL(/#abraham\/5$/);
      // Vegen (één vinger, horizontaal) over het korte blad.
      const blad = (await page.locator("#sTitle").boundingBox())!;
      await veeg(page, w / 2 + 80, blad.y + 12, -160, 0);
      await expect(page.locator("#sTitle")).toHaveText(/^6\. /);
      await veeg(page, w / 2 - 80, blad.y + 12, 160, 0);
      await expect(page.locator("#sTitle")).toHaveText(/^5\. /);
      // De kaart: geen twee-vingers-hint, slepen met één vinger verschuift de kaart en wisselt niet van stap.
      await expect(page.locator("#map")).not.toHaveClass(/embed/);
      await page.waitForTimeout(400);
      type K = { getCenter: () => { lng: number }; dragging: { enabled: () => boolean } };
      expect(await page.evaluate(() => (window as unknown as { __kaart: K }).__kaart.dragging.enabled())).toBe(true);
      const lng = () => page.evaluate(() => (window as unknown as { __kaart: K }).__kaart.getCenter().lng);
      const voor = await lng();
      await veeg(page, w / 2 + 60, 260, -140, 0);
      await page.waitForTimeout(500);
      expect(Math.abs((await lng()) - voor), "de kaart is verschoven").toBeGreaterThan(0.01);
      await expect(page.locator("#gesture")).toBeHidden();
      await expect(page.locator("#sTitle")).toHaveText(/^5\. /);
    });

    test("open: het blad schuift omhoog met alles van de stap; ◀ en Verder blijven staan; kaart, greep, Escape en omlaag vegen sluiten", async ({ page }) => {
      const errors = watchErrors(page);
      await zetNiveau(page, "c");
      await open(page, "jakob-jabbok/7");
      await expect(page.locator("#sTitle")).toHaveText(/^7\. /);
      const kort = await meet(page), knopKort = (await page.locator("#next").boundingBox())!;
      await page.locator("#bladBtn").click();
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("#bladBtn")).toHaveText("Sluiten");
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-controls", "reisboek");
      const m = await meet(page);
      // Ongeveer driekwart van het venster (op een laag scherm blijft er een strook kaart met de knoppen boven).
      expect(m.bladHoog / m.vh, "open blad: ongeveer driekwart van het venster").toBeGreaterThanOrEqual(0.7);
      expect(m.bladHoog / m.vh).toBeLessThanOrEqual(0.76);
      expect(m.bladBoven - m.kopOnder, "er blijft kaart zichtbaar").toBeGreaterThanOrEqual(50);
      expect(m.scrolt, "de pagina scrolt niet").toBe(false);
      expect(Math.abs(m.bladOnder - kort.bladOnder)).toBeLessThanOrEqual(1);
      const knopOpen = (await page.locator("#next").boundingBox())!;
      expect(Math.abs(knopOpen.y - knopKort.y), "Verder staat op dezelfde plek").toBeLessThanOrEqual(1);
      // Eerst het tafereel, dan de hele tekst; de korte tekst is weg.
      await expect(page.locator("#sKort")).toBeHidden();
      await expect(page.locator(".stapkaart .tafereel")).toBeVisible();
      await expect(page.locator("#sText")).toBeVisible();
      const volgorde = await page.evaluate(() => ["#sTitle", ".stapkaart .tafereel", "#sText", "#sWho", "#leesBtn", "#sMeer", "details.parents", ".maker"].map((s) => { const e = document.querySelector(s)!; return e.getBoundingClientRect().top + document.getElementById("reisboek")!.scrollTop; }));
      expect(volgorde, "volgorde in het open blad").toEqual([...volgorde].sort((a, b) => a - b));
      expect(await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById("sText")!).fontSize))).toBeGreaterThanOrEqual(16);
      // Het blad scrolt binnenin; ◀ en Verder blijven onderaan staan, de regel met ‘Sluiten’ bovenaan.
      expect(await page.evaluate(() => { const b = document.getElementById("reisboek")!; return b.scrollHeight > b.clientHeight + 40; })).toBe(true);
      await page.evaluate(() => document.getElementById("reisboek")!.scrollTo(0, 9999));
      await expect(page.locator("#next")).toBeInViewport({ ratio: 1 });
      await expect(page.locator("#bladBtn")).toBeInViewport({ ratio: 1 });
      await expect(page.locator(".maker img")).toBeInViewport();
      expect(Math.abs((await page.locator("#next").boundingBox())!.y - knopKort.y)).toBeLessThanOrEqual(1);
      expect((await meet(page)).scrolt).toBe(false);
      // Wat achter de knoppen staat, is met één tik te zien (en dicht met nog een tik).
      const knoppen = page.locator("#sMeer [data-meer]:visible");
      await expect(knoppen).toHaveText(["Wist je dat?", "Wanneer?", "Alle stappen (12)"]);
      for (const b of await knoppen.all()) {
        const doel = page.locator("#" + (await b.getAttribute("aria-controls")));
        await expect(doel).toBeHidden();
        await b.click();
        await expect(b).toHaveAttribute("aria-expanded", "true");
        await expect(doel).toBeVisible();
        await expect(doel).not.toBeEmpty();
        await b.click();
        await expect(doel).toBeHidden();
      }
      // ‘Terug naar Jakob’ (verdiepend deel) staat in het open blad.
      await expect(page.getByRole("button", { name: "← Terug naar Jakob" })).toBeVisible();
      // Sluiten: met de knop, met Escape, met een tik op de kaart en met omlaag vegen aan de greep.
      await page.locator("#bladBtn").click();
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#sText")).toBeHidden();
      expect(Math.abs((await meet(page)).bladHoog - kort.bladHoog)).toBeLessThanOrEqual(1);
      await page.locator("#bladBtn").click();
      await page.keyboard.press("Escape");
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#bladBtn")).toBeFocused();
      // Een tik op de titel of de korte tekst opent het blad ook.
      await page.locator("#sKort").or(page.locator("#sTitle")).first().click();
      expect(await bladIsOpen(page)).toBe(true);
      await page.touchscreen.tap(232, kort.kopOnder + 30);
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
      // Omhoog vegen over het korte blad opent het; omlaag vegen aan de greep sluit het.
      const titel = (await page.locator("#sTitle").boundingBox())!;
      await veeg(page, w / 2, titel.y + 10, 0, -90);
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "true");
      const greep = (await page.locator("#bladBalk").boundingBox())!;
      await veeg(page, w / 2, greep.y + 8, 0, 110);
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
      // Verder vanuit het open blad: de volgende stap, en het blad is weer kort.
      await page.locator("#bladBtn").click();
      await page.locator("#next").click();
      await expect(page.locator("#sTitle")).toHaveText(/^8\. /);
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
      expect(errors).toEqual([]);
    });

    test("alles blijft bereikbaar op elk niveau: weetje, afstand, jaartal, elders, alle stappen, van dichtbij, om over na te denken", async ({ page }) => {
      await kiesNiveau(page, "c");
      for (const [hash, namen] of [["abraham", ["Wist je dat?", "Wanneer?", "Elders in de Bijbel", "Alle stappen (25)"]], ["abraham/2", ["Wist je dat?", "Hoe ver?", "Wanneer?", "Alle stappen (25)"]]] as const) {
        await open(page, hash);
        await bladOpen(page);
        await expect(page.locator("#sMeer [data-meer]:visible")).toHaveText([...namen]);
        await expect(page.locator("#sVerdiep .verdiep-in")).toBeVisible();
        await expect(page.locator("#sVerdiep .verdiep-in")).toContainText("Van Ur naar Kanaän");
        for (const b of await page.locator("#sMeer [data-meer]:visible").all()) { await b.click(); await expect(page.locator("#" + (await b.getAttribute("aria-controls")))).toBeVisible(); }
        await expect(page.locator("#deelActies #whole")).toBeVisible();
      }
      // Het weetje blijft open bij de volgende stap (als je het blad weer opent); de stappenlijst niet.
      await page.locator("#next").click();
      await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
      await bladOpen(page);
      await expect(page.locator("#sFact")).toBeVisible();
      await expect(page.locator("#stappenBlok")).toBeHidden();
      // De stappenlijst werkt: een bolletje kiest die stap, en het blad gaat terug naar kort (je ziet de kaart).
      await page.getByRole("button", { name: "Alle stappen (25)" }).click();
      await page.locator('#chapters .dot[data-step="5"]').click();
      await expect(page.locator("#sTitle")).toHaveText(/^6\. /);
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
      // ‘Laat dit hele deel zien’ en ‘Hoe ver?’ (met Nederland op de kaart) blijven werken.
      await bladOpen(page);
      await page.getByRole("button", { name: "Alle stappen (25)" }).click();
      await page.locator("#whole").click();
      await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
      await bladOpen(page);
      await page.locator('#deelActies [data-tab="ver"]').click();
      await expect(page.locator("#verTitel")).toBeVisible();
      await page.getByRole("button", { name: "← Terug naar de reis" }).click();
      await expect(page.locator("#sTitle")).toBeVisible();
      expect((await meet(page)).scrolt).toBe(false);
      // Om over na te denken (laatste stap van een deel met vragen) en een spel in de stap.
      await open(page, "jakob-jabbok/12");
      await bladOpen(page);
      await expect(page.locator("#sDenk")).toBeVisible();
      await page.locator("#sDenk summary").click();
      await expect(page.locator("#sDenkLijst li").first()).toBeVisible();
      // Zelf op reis en Samen ontdekken: dezelfde stap met wat bij dat niveau hoort.
      await kiesNiveau(page, "b"); await open(page, "abraham/2"); await bladOpen(page);
      await expect(page.locator("#sText")).toBeVisible();
      await expect(page.locator("#sMeer [data-meer]:visible").first()).toBeVisible();
      await expect(page.locator("#leesBtn")).toContainText("Genesis 12:1–5");
      await kiesNiveau(page, "a"); await open(page, "abraham/2");
      await expect(page.locator("#sKort")).toBeVisible();
      await expect(page.locator("#kaartBtn")).toBeHidden();
      await bladOpen(page);
      await expect(page.locator("#sText .a-reisverhaal")).toBeVisible();
      await expect(page.locator("#sMeer")).toBeHidden();
      await expect(page.locator("#next")).toBeInViewport({ ratio: 1 });
    });

    test("kiezen: de kleine regel opent ‘Kies een reis’; de overzichten staan daar ook", async ({ page }) => {
      const errors = watchErrors(page);
      await zetNiveau(page, "b");
      for (const [hash, deel, stap] of [["abraham/2", "Abraham", "2 van 25"], ["ur-kanaan/3", "Van Ur naar Kanaän", "3 van 8"], ["jakob-jabbok/6", "Jakob bij de Jabbok", "6 van 12"], ["nt-paulusrome/5", "Naar Rome", "5 van 9"], ["nt-galilea/7", "Galilea", "7 van 11"]] as const) {
        await open(page, hash);
        const regel = page.locator("#kiesBtn");
        await expect(regel).toBeVisible();
        await expect(regel).toContainText(deel);
        await expect(regel).toContainText(stap);
        // De naam van het deel en de stap staan er helemaal (het boek valt weg als het niet past); de regel loopt niet over ‘Lees meer’ heen.
        const r = await page.evaluate(() => { const k = document.getElementById("kiesBtn")!, b = k.querySelector(".kr-pad b") as HTMLElement, s = k.querySelector(".kr-stap") as HTMLElement, lm = document.getElementById("bladBtn")!.querySelector("span")!.getBoundingClientRect(); return { deel: b.scrollWidth <= b.clientWidth + 1, stap: s.getBoundingClientRect().right <= k.getBoundingClientRect().right + 1, vrij: k.getBoundingClientRect().right <= lm.left + 1 }; });
        expect(r, hash).toEqual({ deel: true, stap: true, vrij: true });
        for (const sel of ["#boeken", "#delen"]) await expect(page.locator(sel), `${hash}: ${sel} niet in het blad`).toBeHidden();
      }
      await open(page, "abraham/2");
      for (const sel of ["#kastBtn", "#reizenBtn", "#plaatsenBtn", "#vandaagLijstBtn"]) await expect(page.locator(sel), sel).toBeHidden();
      await page.locator("#kiesBtn").click();
      const blad = page.getByRole("dialog", { name: "Kies een reis" });
      await expect(blad).toBeVisible();
      await blad.locator('.boek[data-boek="exodus"]').click();
      await expect(blad).toBeVisible();
      // Zonder afgesneden of overlopende kaarten.
      const fout = await page.evaluate(() => {
        const box = document.querySelector("#kiesLade .lade__box")!, b = box.getBoundingClientRect(), uit: string[] = [];
        if (box.scrollWidth > box.clientWidth + 1) uit.push("blad schuift opzij");
        document.querySelectorAll("#kiesLade .boek, #kiesLade .deel, #kiesLade .overz button").forEach((e) => { const r = e.getBoundingClientRect(); if (r.left < b.left - 1 || r.right > b.right + 1) uit.push(`${e.textContent} steekt uit het blad`); if (e.scrollWidth > e.clientWidth + 1) uit.push(`${e.textContent} loopt over`); });
        return uit;
      });
      expect(fout).toEqual([]);
      await expect(blad.locator(".deel").first()).toBeInViewport();
      await blad.locator('.deel[data-deel="uittocht"]').click();
      await expect(blad).toBeHidden();
      await expect(page.locator("#sTitle")).toHaveText("De uittocht");
      await expect(page.locator("#kiesBtn")).toContainText("Exodus");
      await expect(page.locator("#kiesBtn")).toContainText("8 stappen");
      await expect(page).toHaveURL(/#uittocht$/);
      await expect(page.locator("#kiesBtn")).toBeFocused();
      // Een overzicht uit het blad; sluiten brengt je terug in het blad.
      await page.locator("#kiesBtn").click();
      await blad.getByRole("button", { name: "Alle plaatsen", exact: true }).click();
      const plaatsen = page.getByRole("dialog", { name: "Plaatsen in de Bijbel" });
      await expect(plaatsen).toBeVisible();
      await expect(blad).toBeHidden();
      await page.keyboard.press("Escape");
      await expect(plaatsen).toBeHidden();
      await expect(blad).toBeVisible();
      await expect(blad.getByRole("button", { name: "Alle plaatsen", exact: true })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(blad).toBeHidden();
      await expect(page.locator("#kiesBtn")).toBeFocused();
      for (const naam of ["Alle 66 boeken", "Alle reizen", "Vandaag"]) {
        await page.locator("#kiesBtn").click();
        await blad.getByRole("button", { name: naam, exact: true }).click();
        await expect(page.locator(".lade:not([hidden])")).toHaveCount(1);
        await expect(blad).toBeHidden();
        await page.keyboard.press("Escape"); await page.keyboard.press("Escape");
        await expect(page.locator(".lade:not([hidden])")).toHaveCount(0);
      }
      expect(errors).toEqual([]);
    });

    test("de kaart: zoom, ‘Hele reis’ en ‘Kaart’ in één rij; Toen/Nu, Vandaag, Bijbelwereld en Legenda achter ‘Kaart’; geen ‘Groot’", async ({ page }) => {
      await zetNiveau(page, "c");
      await open(page, "abraham/2");
      const zichtbaar = () => page.evaluate(() => [...document.querySelectorAll(".maptools > *, .mapacties > *, .leaflet-control-zoom, .leaflet-control-scale")].filter((e) => (e as HTMLElement).offsetParent && getComputedStyle(e).visibility !== "hidden").map((e) => e.id || e.className.split(" ")[0]));
      expect((await zichtbaar()).sort()).toEqual(["heleBtn", "kaartBtn", "leaflet-control-zoom"]);
      // Eén rij bovenaan de kaart, zonder overlap; niets onderaan (daar ligt het blad).
      const rij = await page.evaluate(() => { const k = document.getElementById("map")!.getBoundingClientRect(); return [...document.querySelectorAll(".leaflet-control-zoom, #heleBtn, #kaartBtn")].map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top - k.top, b: r.bottom - k.top }; }).sort((a, b) => a.l - b.l); });
      for (const [i, r] of rij.entries()) { expect(r.t).toBeGreaterThanOrEqual(6); expect(r.b).toBeLessThanOrEqual(54); if (i) expect(r.l, "knoppen overlappen niet").toBeGreaterThanOrEqual(rij[i - 1].r + 4); }
      await page.locator("#kaartBtn").click();
      await expect(page.locator("#kaartBtn")).toHaveAttribute("aria-expanded", "true");
      for (const sel of ["#toenBtn", "#nuBtn", "#wereldBtn", "#legendBtn"]) await expect(page.locator(sel), sel).toBeVisible();
      await expect(page.locator("#vandaagBtn")).toBeHidden();
      // Het paneel past in het vrije deel van de kaart.
      const paneel = (await page.locator("#kaartPaneel").boundingBox())!;
      expect(paneel.y + paneel.height).toBeLessThanOrEqual((await meet(page)).bladBoven);
      await page.locator("#nuBtn").click();
      await expect(page.locator("#vandaagBtn")).toBeVisible();
      await expect(page.locator("#kaartBtn")).toContainText("nu");
      // De legenda ligt boven het blad, met haar knop ‘Sluiten’ in beeld.
      await page.locator("#legendBtn").click();
      await expect(page.locator("#legend")).toBeVisible();
      expect(await page.evaluate(() => { const r = document.getElementById("legendSluit")!.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!e && !!e.closest("#legend"); })).toBe(true);
      await page.locator("#legendSluit").click();
      await expect(page.locator("#legend")).toBeHidden();
      // Een tik naast het paneel sluit het.
      await page.locator("#next").click();
      await expect(page.locator("#kaartBtn")).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#nuBtn")).toBeHidden();
      // ‘Hele reis’ brengt je naar het overzicht van het deel; daar is de knop niet nodig.
      await page.locator("#heleBtn").click();
      await expect(page.locator("#sTitle")).toHaveText("Abraham");
      await expect(page.locator("#heleBtn")).toBeHidden();
    });

    test("stand Nu: in het overzicht van een deel geen moderne naam onder elke plaats", async ({ page }) => {
      await zetNiveau(page, "c");
      await open(page, "abraham");
      await page.locator("#kaartBtn").click();
      await page.locator("#nuBtn").click();
      await page.waitForTimeout(800);
      const nuNamen = () => page.evaluate(() => [...document.querySelectorAll("#map .lab .nu")].filter((e) => getComputedStyle(e).display !== "none" && getComputedStyle(e.closest(".lab")!).display !== "none").length);
      expect(await nuNamen()).toBe(0);
      await page.locator("#next").click(); await page.locator("#next").click(); await page.locator("#next").click(); await page.locator("#next").click();
      await expect(page.locator("#sTitle")).toHaveText(/^4\. /);
      await page.waitForTimeout(800);
      expect(await nuNamen()).toBeGreaterThan(0);
    });

    test("tikdoelen: ◀, Verder, de kaartknoppen, de onderbalk en alles in het open blad zijn minstens 44 px", async ({ page }) => {
      await zetNiveau(page, "c");
      const klein = (sel: string, min = 43.5) => page.evaluate(([sel, min]) => [...document.querySelectorAll(sel as string)].filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden").map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => r.width < (min as number) || r.height < (min as number)).map(({ e, r }) => `${(e.getAttribute("aria-label") || e.textContent || e.className).trim().slice(0, 40)} ${Math.round(r.width)}×${Math.round(r.height)}`), [sel, min] as const);
      const DOELEN = ".stapkaart button:not(#kiesBtn):not(#bladBtn), .stapkaart a[href], .stapkaart summary, #stappenBlok button, #deelActies button, .mapbar button, #kaartPaneel button, .mapacties button, .leaflet-control-zoom a, .tabs button";
      for (const hash of ["abraham", "abraham/2", "jozef/4"]) {
        await open(page, hash);
        expect(await klein(DOELEN), `${hash} kort`).toEqual([]);
        await bladOpen(page);
        for (const b of await page.locator("#sMeer [data-meer]:visible").all()) await b.click();
        expect(await klein(DOELEN), `${hash} open`).toEqual([]);
      }
      // De kleine regel bovenaan het blad is laag gehouden (de ruimte is voor de kaart): 26 px hoog, wel breed. Het blad
      // opent ook met een tik op de titel of de tekst.
      await open(page, "abraham/2");
      expect(await klein("#kiesBtn, #bladBtn", 24)).toEqual([]);
      for (const sel of ["#kiesBtn", "#bladBtn"]) expect((await page.locator(sel).boundingBox())!.width, sel).toBeGreaterThanOrEqual(88);
      await page.locator("#kaartBtn").click();
      expect(await klein(DOELEN), "kaartpaneel open").toEqual([]);
      await page.locator("#kiesBtn").click();
      expect(await klein("#kiesLade button"), "keuzeblad").toEqual([]);
    });

    test("de kop is één lage regel en de melding ‘Nieuwe stempel’ valt niet over de kop of over het blad", async ({ page }) => {
      for (const niveau of ["a", "b", "c"] as const) {
        await kiesNiveau(page, niveau);
        await open(page, "izak/1");
        await expect(page.locator("#sTitle")).toHaveText(/^1\. /);
        await page.evaluate(() => document.fonts.ready);
        const kop = await page.evaluate(() => { const h = document.querySelector(".kop h1")!, k = document.querySelector(".kop")!.getBoundingClientRect(), n = document.getElementById("niveauBtn")!.getBoundingClientRect(), e = document.elementFromPoint(innerWidth / 2, 1); return { hoog: k.height, boven: k.top, titelPast: h.scrollWidth <= h.clientWidth, niveauIn: n.right <= innerWidth - 4 && n.top >= k.top && n.bottom <= k.bottom, inKop: !!e && !!e.closest(".kop") }; });
        expect(kop, niveau).toEqual({ hoog: h < 600 ? 40 : 44, boven: 0, titelPast: true, niveauIn: true, inKop: true });
      }
      // De melding staat onder de rij kaartknoppen: niet over de kop, niet over het blad.
      await page.locator("#next").click();
      const melding = page.locator("#toast");
      await expect(melding).toHaveClass(/show/);
      await expect(melding).toContainText("Nieuwe stempel");
      await page.waitForTimeout(350);
      const r = await page.evaluate(() => { const t = document.getElementById("toast")!.getBoundingClientRect(), k = document.querySelector(".kop")!.getBoundingClientRect(), b = document.getElementById("reisboek")!.getBoundingClientRect(); return { onderKop: t.top >= k.bottom, bovenBlad: t.bottom <= b.top, binnen: t.left >= 0 && t.right <= innerWidth }; });
      expect(r).toEqual({ onderKop: true, bovenBlad: true, binnen: true });
      // De kop houdt rekening met de notch (viewport-fit=cover): de bovenrand gebruikt safe-area-inset-top.
      const css = await page.evaluate(() => [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; } }).join("\n"));
      expect(css).toMatch(/\.kop \{[^}]*padding: env\(safe-area-inset-top/);
      // In de andere onderdelen scrolt de pagina weer, en de kop blijft bovenaan staan.
      await open(page, "v26");
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, 700));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
      const boven = await page.evaluate(() => { const k = document.querySelector(".kop")!.getBoundingClientRect(), e = document.elementFromPoint(innerWidth / 2, 1); return { top: k.top, inKop: !!e && !!e.closest(".kop") }; });
      expect(boven).toEqual({ top: 0, inKop: true });
    });

    test("de andere onderdelen blijven zoals ze zijn: een kaart met de pagina eronder (niet in Tijdlijn, Speurtocht en Paspoort); ‘Op de kaart’ en de kaartvraag werken", async ({ page }) => {
      const errors = watchErrors(page);
      await zetNiveau(page, "c");
      await page.addInitScript(() => { Math.random = () => 0.999999; });
      await open(page, "abraham/2");
      for (const tab of ["Verhalen", "Wie is wie", "Tijdlijn", "Speurtocht", "Paspoort"]) {
        await page.getByRole("tab", { name: tab }).click();
        await page.waitForTimeout(250);
        const m = await page.evaluate(() => { const k = document.getElementById("map")!.getBoundingClientRect(), p = document.getElementById("reisboek")!.getBoundingClientRect(); return { kaart: k.height, onderKaart: p.top >= k.bottom - 1, positie: getComputedStyle(document.getElementById("reisboek")!).position, scrolt: document.documentElement.scrollHeight > innerHeight, vh: innerHeight, mapbar: !!document.getElementById("mapbar")!.getClientRects().length }; });
        expect(m.positie, `${tab}: het reisboek is geen blad over de kaart`).toBe("static");
        // Paspoort, Tijdlijn en de speurtocht (buiten een kaartvraag) hebben geen kaart: die voegt daar niets toe (§4.10).
        if (["Tijdlijn", "Speurtocht", "Paspoort"].includes(tab)) expect(m.kaart, `${tab}: geen kaart`).toBe(0);
        else expect(m.onderKaart, `${tab}: de pagina staat onder de kaart`).toBe(true);
        expect(m.kaart, `${tab}: kaart`).toBeLessThan(0.5 * m.vh);
        expect(m.mapbar, `${tab}: geen ◀ en Verder`).toBe(false);
        expect(await geenHorizontaalScrollen(page), tab).toBe(true);
        await expect(page.locator("#map")).toHaveClass(/embed/);
      }
      // Terug naar de reis: weer de kaart als scherm, met het korte blad.
      await page.getByRole("tab", { name: "Reis" }).click();
      await expect(page.locator("#next")).toBeInViewport({ ratio: 1 });
      expect((await meet(page)).scrolt).toBe(false);
      expect((await meet(page)).vrij / h).toBeGreaterThanOrEqual(0.6);
      // ‘Op de kaart’ vanuit een verhaal.
      await open(page, "v26");
      await expect(page.locator("#vTitel")).toHaveText("Droog door de Schelfzee");
      const opKaart = page.locator("#p-verhalen [data-stapkaart]").first();
      if (await opKaart.count()) {
        if (!(await opKaart.isVisible())) await page.getByRole("button", { name: /Lees verder/ }).click();
        await opKaart.click();
        await expect(opKaart).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator("#p-verhalen")).toBeVisible();
      }
      // Een kaartvraag in de speurtocht: de kaart komt in beeld en een tik geeft antwoord.
      await open(page, "abraham");
      await page.getByRole("tab", { name: "Speurtocht" }).click();
      await page.locator("#qGo").click();
      await expect(page.locator(".tapcall")).toBeVisible();
      await page.waitForTimeout(900);
      const kaart = (await page.locator("#map").boundingBox())!;
      expect(kaart.y).toBeGreaterThanOrEqual(0);
      await page.touchscreen.tap(kaart.x + kaart.width / 2, kaart.y + kaart.height / 2 + 20);
      await expect(page.locator("#qRes .feedback")).toBeVisible();
      expect(errors).toEqual([]);
    });
  });
}

test.describe("telefoon: toegankelijkheid en uitersten", () => {
  test.use({ viewport: { width: 390, height: 664 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== "mobiel", "telefoontests één keer, in het project mobiel"); });

  test("het blad is een gebied met een knop (aria-expanded); de focus loopt logisch; alles kan zonder vegen", async ({ page }) => {
    await zetNiveau(page, "c");
    await open(page, "abraham/2");
    const gebied = page.getByRole("complementary", { name: "Reisboek" });
    await expect(gebied).toBeVisible();
    await expect(gebied.getByRole("button", { name: "Lees meer" })).toHaveAttribute("aria-expanded", "false");
    await expect(gebied.getByRole("button", { name: /^Kies een reis\. Nu: Genesis Abraham stap\W*2 van 25$/ })).toBeVisible();
    await expect(gebied.getByRole("heading", { name: "2. God zegt: ga!" })).toBeVisible();
    await expect(gebied.getByRole("button", { name: "Vorige stap" })).toBeVisible();
    await expect(gebied.getByRole("button", { name: "Verder ▶" })).toBeVisible();
    // Kort: de regel, ‘Lees meer’, ◀, Verder — in die volgorde; daarna de onderdelen niet meer in het blad.
    await page.locator("#kiesBtn").focus();
    const volgende = async () => { await page.keyboard.press("Tab"); return page.evaluate(() => document.activeElement!.id); };
    expect([await volgende(), await volgende(), await volgende()]).toEqual(["bladBtn", "prev", "next"]);
    // Open met Enter; de inhoud staat tussen ‘Sluiten’ en ◀ / Verder.
    await page.locator("#bladBtn").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#bladBtn")).toBeFocused();
    const rij: string[] = [];
    for (let i = 0; i < 30; i++) {
      const f = await page.evaluate(() => { const a = document.activeElement as HTMLElement; return { id: a.id || a.className || a.tagName, inBlad: !!a.closest("#reisboek"), zichtbaar: a.getClientRects().length > 0 }; });
      expect(f.inBlad && f.zichtbaar, `${f.id}: de focus blijft in het blad, op iets zichtbaars`).toBe(true);
      rij.push(f.id); if (f.id === "next") break; await page.keyboard.press("Tab");
    }
    expect(rij[0]).toBe("bladBtn");
    expect(rij.slice(-2)).toEqual(["prev", "next"]);
    expect(rij.length, "de inhoud van het blad zit in de tabvolgorde").toBeGreaterThan(6);
    // Pijltjestoetsen gaan naar de volgende stap; het blad is dan weer kort.
    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
    await expect(page.locator("#where")).toHaveText("Abraham · 3 van 25");
  });

  test("met beweging: na de vlucht van de kaart staat de route in het vrije deel, ook bij een lange zeereis en snel doorklikken", async ({ page }) => {
    await kaartHaak(page);
    await zetNiveau(page, "c");
    type K = { getZoom: () => number; getCenter: () => { lat: number; lng: number } };
    const stil = async () => {
      const stand = () => page.evaluate(() => { const k = (window as unknown as { __kaart: K }).__kaart; return JSON.stringify([k.getZoom(), k.getCenter()]); });
      let vorige = await stand();
      await expect.poll(async () => { await page.waitForTimeout(300); const nu = await stand(); const gelijk = nu === vorige; vorige = nu; return gelijk; }, { timeout: 12_000 }).toBe(true);
    };
    // Een hoog scherm (Pixel 7): de kaart is daar hoger dan de ondergrond op een lage zoom.
    for (const [w, h] of [[390, 664], [412, 839]] as const) {
      await page.setViewportSize({ width: w, height: h });
      for (const hash of ["nt-paulusrome/6", "abraham/2", "nt-paulusrome", "esther/2"]) {
        await open(page, hash);
        await expect(page.locator("#sTitle")).not.toBeEmpty();
        await stil();
        verwachtInVrijeDeel(await routeOpScherm(page, hash), `${w}×${h} ${hash}`);
      }
      // Snel doorklikken: de laatste stap wint en staat goed in beeld.
      await open(page, "nt-paulusrome/2");
      for (let i = 0; i < 4; i++) { await page.locator("#next").click(); await page.waitForTimeout(i % 2 ? 350 : 120); }
      await expect(page.locator("#sTitle")).toHaveText(/^6\. /);
      await stil();
      verwachtInVrijeDeel(await routeOpScherm(page, "nt-paulusrome/6"), `${w}×${h} na doorklikken`);
    }
  });

  test("minder beweging: het blad staat er meteen, zonder animatie", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await zetNiveau(page, "b");
    await open(page, "izak/1");
    await page.locator("#bladBtn").click();
    expect(await page.evaluate(() => document.getElementById("reisboek")!.getAnimations().length)).toBe(0);
    expect((await meet(page)).bladHoog / 664).toBeGreaterThan(0.7);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await open(page, "izak/1");
    await page.locator("#bladBtn").click();
    expect(await page.evaluate(() => document.getElementById("reisboek")!.getAnimations().length)).toBe(1);
    await expect.poll(() => page.evaluate(() => document.getElementById("reisboek")!.getAnimations().length)).toBe(0);
    expect((await meet(page)).bladHoog / 664).toBeGreaterThan(0.7);
  });

  test("diepe links openen de juiste stap, het juiste verhaal en het juiste deel; de opslag blijft gelijk", async ({ page }) => {
    await zetNiveau(page, "c");
    await open(page, "jozef/4");
    await expect(page.locator("#sTitle")).toHaveText(/^4\. /);
    await expect(page.locator("#kiesBtn")).toContainText("Jozef");
    await expect(page.locator("#kiesBtn")).toContainText("4 van");
    expect(await page.evaluate(() => [JSON.parse(localStorage.getItem("bijbelreis:laatst")!), JSON.parse(localStorage.getItem("bijbelreis:gezien")!), JSON.parse(localStorage.getItem("bijbelreis:huidig")!)])).toEqual(["genesis:jozef:3", ["genesis:jozef:3"], { k: "genesis:jozef:3" }]);
    await open(page, "ur-kanaan/5");
    await expect(page.locator("#sTitle")).toHaveText("5. De HEERE roept Abram");
    await expect(page.locator("#kiesBtn")).toContainText("Van Ur naar Kanaän");
    await page.locator("#next").click();
    await expect(page).toHaveURL(/#ur-kanaan\/6$/);
    await open(page, "v26");
    await expect(page.locator("#vTitel")).toHaveText("Droog door de Schelfzee");
    // Een boek als diepe link (bij het laden van de pagina).
    await open(page, "exodus");
    await expect(page.locator("#kiesBtn")).toContainText("Exodus");
    await expect(page.locator("#sTitle")).not.toHaveText(/^\d+\. /);
    await expect(page.locator("#next")).toHaveText("Start ▶");
    // Een hashwissel zonder herladen (een link in de pagina of terug in de browser) opent de stap ook.
    await page.evaluate(() => { location.hash = "izak/3"; });
    await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
    await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
  });

  test("een lange titel krijgt twee regels en de tekst één; het blad blijft even hoog", async ({ page }) => {
    await zetNiveau(page, "b");
    await open(page, "davids-rijk/3");
    await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
    const gewoon = (await meet(page)).bladHoog;
    await page.locator("#next").click();
    await expect(page.locator("#sTitle")).toHaveText("4. Hadadezer van Zoba en de Syriërs van Damascus");
    const r = await page.evaluate(() => { const t = document.getElementById("sTitle")!, k = document.getElementById("sKort")!; return { titel: Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight)), tekst: Math.round(k.getBoundingClientRect().height / parseFloat(getComputedStyle(k).lineHeight)), heel: t.scrollHeight <= t.clientHeight + 2 }; });
    expect(r).toEqual({ titel: 2, tekst: 1, heel: true });
    expect(Math.abs((await meet(page)).bladHoog - gewoon)).toBeLessThanOrEqual(2);
  });

  test("200 % tekst (inzoomen tot 200 %): niets valt weg en er is geen horizontaal scrollen", async ({ page }) => {
    // 200 % zoom op een telefoon van 412×915 geeft een beeld van 206×457 CSS-pixels.
    await page.setViewportSize({ width: 206, height: 457 });
    await zetNiveau(page, "c");
    for (const hash of ["abraham/2", "uittocht/6", "abraham", "v26"]) {
      await open(page, hash);
      await page.waitForTimeout(400);
      expect(await geenHorizontaalScrollen(page), hash).toBe(true);
    }
    await open(page, "abraham/2");
    await expect(page.locator("#next")).toBeInViewport({ ratio: 1 });
    await expect(page.locator("#sTitle")).toBeInViewport({ ratio: 1 });
    await page.locator("#next").click();
    await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
    await page.locator("#bladBtn").click();
    await expect(page.locator("#sText")).toBeVisible();
    await page.locator("#bladBtn").click();
    await page.locator("#kiesBtn").click();
    const blad = page.getByRole("dialog", { name: "Kies een reis" });
    await expect(blad.getByRole("button", { name: "Sluiten" })).toBeInViewport();
    expect(await geenHorizontaalScrollen(page)).toBe(true);
    await page.keyboard.press("Escape");
    // De kaartknoppen overlappen niet, ook niet op deze breedte.
    const rij = await page.evaluate(() => [...document.querySelectorAll(".leaflet-control-zoom, #heleBtn, #kaartBtn")].map((e) => e.getBoundingClientRect()).map((r) => [r.left, r.top, r.right, r.bottom]));
    for (const [i, a] of rij.entries()) for (const b of rij.slice(i + 1)) expect(a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3], "kaartknoppen overlappen").toBe(false);
    await page.locator("#kaartBtn").click();
    await expect(page.locator("#nuBtn")).toBeVisible();
  });

  test("geen horizontaal scrollen, op alle onderdelen en niveaus", async ({ page }) => {
    for (const niveau of ["a", "b", "c"] as const) {
      await kiesNiveau(page, niveau);
      for (const hash of ["", "abraham", "abraham/2", "uittocht/6", "v26", "ur-kanaan/3"]) {
        await open(page, hash);
        await expect(page.locator("#map")).toBeVisible();
        expect(await geenHorizontaalScrollen(page), `${niveau} ${hash}`).toBe(true);
      }
      for (const tab of ["Wie is wie", "Tijdlijn", "Speurtocht", "Paspoort", "Reis"]) {
        await page.getByRole("tab", { name: tab }).click();
        expect(await geenHorizontaalScrollen(page), `${niveau} ${tab}`).toBe(true);
      }
      await bladOpen(page);
      expect(await geenHorizontaalScrollen(page), `${niveau} open blad`).toBe(true);
    }
  });

  test("de drie niveaus houden hun verschillen", async ({ page }) => {
    // Samen ontdekken: één zin, de weg naar het verhaal, geen extra's en geen kaartpaneel.
    await kiesNiveau(page, "a"); await open(page, "abraham/2");
    await expect(page.locator("#sKort")).toHaveText("God zegt tegen Abram: “Ga uit je land en van je familie, naar het land dat Ik je wijzen zal.");
    await bladOpen(page);
    await expect(page.locator("#sText .a-reisverhaal")).toBeVisible();
    await expect(page.locator("#sMeer")).toBeHidden();
    await expect(page.locator("#kaartBtn")).toBeHidden();
    await expect(page.locator("#next")).toBeVisible();
    // Zelf op reis: het verhaal begint met het eerste stuk en ‘Lees verder’.
    await kiesNiveau(page, "b"); await open(page, "v26");
    const stukken = page.locator("#vVertelling .vdeel");
    const n = await stukken.count();
    expect(n).toBeGreaterThan(1);
    await expect(stukken.nth(1)).toBeHidden();
    await page.getByRole("button", { name: /Lees verder/ }).click();
    for (let i = 0; i < n; i++) await expect(stukken.nth(i)).toBeVisible();
    // Verder ontdekken: dezelfde stap met weetje, afstand en jaartal achter de knoppen in het open blad.
    await kiesNiveau(page, "c"); await open(page, "abraham/2");
    await bladOpen(page);
    await expect(page.locator("#sMeer [data-meer]:visible")).toHaveCount(4);
    await open(page, "v26");
    await expect(page.getByRole("button", { name: /Lees verder/ })).toBeVisible();
  });
});

// Verdiepende delen (bij: "<hoofddeel>"): geen eigen knop, maar onder het hoofddeel. Op desktop, tablet en telefoon. Tot
// 900 px staat de ingang ‘Van dichtbij’ in het open stapblad.
test.describe("verdiepende delen", () => {
  test.beforeEach(async ({ page }) => { await zetNiveau(page, "c"); });

  test("Van Ur naar Kanaän staat onder Abraham: ingang, kruimelpad, terug en verder", async ({ page }) => {
    const errors = watchErrors(page);
    await open(page, "abraham");
    await expect(page.locator('#delen .deel[data-deel="ur-kanaan"]')).toHaveCount(0);
    await expect(page.locator('#delen .deel[data-deel="abraham"]')).toHaveCount(1);
    const ingang = page.locator("#sVerdiep .verdiep-in");
    await expect(ingang).toHaveCount(1);
    await expect(ingang).toContainText("Van dichtbij");
    await expect(ingang).toContainText("Van Ur naar Kanaän");
    await expect(ingang).toContainText("Genesis 11:27–12:5");
    // Ook bij de stappen van Abraham over hetzelfde gedeelte (Genesis 11:27–32 en 12:1–5), niet bij de andere.
    await open(page, "abraham/1"); await bladOpen(page);
    await expect(page.locator("#sVerdiep .verdiep-in")).toContainText("Van Ur naar Kanaän");
    await expect(page.locator("#sVerdiep .verdiep-in")).toBeVisible();
    await open(page, "abraham/2"); await bladOpen(page);
    await expect(page.locator("#sVerdiep .verdiep-in")).toContainText("Van Ur naar Kanaän");
    await open(page, "abraham/3"); await bladOpen(page);
    await expect(page.locator("#sText")).toBeVisible();
    await expect(page.locator("#sVerdiep")).toBeHidden();
    await open(page, "abraham"); await bladOpen(page);
    await page.locator("#sVerdiep .verdiep-in").click();
    await expect(page).toHaveURL(/#ur-kanaan$/);
    await expect(page.locator("#sTitle")).toHaveText("Van Ur naar Kanaän");
    // Het hoofddeel blijft gemarkeerd; het kruimelpad loopt via Abraham.
    await expect(page.locator('#delen .deel[data-deel="abraham"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#sCrumb")).toHaveText(/^Genesis\s*›\s*Abraham\s*›\s*Van Ur naar Kanaän/);
    const regel = page.locator((await page.locator("#kiesBtn").isVisible()) ? "#kiesBtn" : "#sCrumb");
    await expect(regel).toContainText("Abraham");
    await expect(regel).toContainText("Van Ur naar Kanaän");
    // Terug naar het hoofddeel.
    await bladOpen(page);
    await page.getByRole("button", { name: "← Terug naar Abraham" }).click();
    await expect(page).toHaveURL(/#abraham$/);
    // Na de laatste stap gaat Verder naar Abraham, verder na dit gedeelte (stap 3).
    await open(page, "ur-kanaan/8");
    const knop = await verder(page);
    await expect(knop).toHaveText("Verder met Abraham ▶");
    await knop.click();
    await expect(page).toHaveURL(/#abraham\/3$/);
    // Vorige vanaf de intro gaat ook naar het hoofddeel, niet naar ‘Het begin’.
    await open(page, "ur-kanaan");
    await page.locator((await page.locator("#prev2").isVisible()) ? "#prev2" : "#prev").click();
    await expect(page).toHaveURL(/#abraham$/);
    // Vanaf het einde van ‘Het begin’ gaat Verder naar Abraham, niet naar het verdiepende deel.
    await open(page, "begin");
    const n = await page.evaluate(() => (window as unknown as { BR: { boeken: { id: string; delen: { id: string; steps: unknown[] }[] }[] } }).BR.boeken[0].delen[0].steps.length);
    await open(page, `begin/${n}`);
    await (await verder(page)).click();
    await expect(page).toHaveURL(/#abraham$/);
    // De stapsleutels blijven die van het deel zelf.
    await open(page, "ur-kanaan/2");
    await expect(page.locator("#sTitle")).toHaveText(/^2\. /);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien") || "[]"))).toContain("genesis:ur-kanaan:1");
    expect(errors).toEqual([]);
  });

  test("Kies dan het leven staat onder In Moab", async ({ page }) => {
    await open(page, "moab");
    await expect(page.locator('#delen .deel[data-deel="kies-het-leven"]')).toHaveCount(0);
    await expect(page.locator("#sVerdiep .verdiep-in")).toContainText("Kies dan het leven");
    // De stap over de hele rede (Deuteronomium 1–33) wijst ook naar dit gedeelte.
    await open(page, "moab/4");
    await expect(page.locator("#sVerdiep .verdiep-in")).toContainText("Deuteronomium 30:11–20");
    await open(page, "kies-het-leven/7");
    const knop = await verder(page);
    await expect(knop).toHaveText("Verder met Moab ▶");
    // De lange knoptekst past in de knop (op de telefoon naast ◀).
    expect(await knop.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
    await knop.click();
    await expect(page).toHaveURL(/#moab\/5$/);
  });

  test("elk deel met bij heeft geen eigen knop, is bereikbaar vanuit zijn hoofddeel en houdt diepe link en opslag", async ({ page }) => {
    const errors = watchErrors(page);
    for (const [id, hoofd, naam] of [["jakob-jabbok", "jakob", "Jakob bij de Jabbok"], ["ur-kanaan", "abraham", "Van Ur naar Kanaän"], ["kies-het-leven", "moab", "Kies dan het leven"]] as const) {
      await open(page, hoofd);
      await expect(page.locator("#sTitle")).not.toHaveText(/^\d+\. /);
      // Geen eigen knop: niet in de delenrij (desktop) en niet in het keuzeblad (telefoon); die delenrij is hetzelfde element.
      await expect(page.locator(`#delen .deel[data-deel="${id}"]`), id).toHaveCount(0);
      await expect(page.locator(`#delen .deel[data-deel="${hoofd}"]`), hoofd).toHaveCount(1);
      // Bereikbaar vanuit het hoofddeel: ‘Van dichtbij: …’ (tot 900 px in het open stapblad).
      await bladOpen(page);
      const ingang = page.locator("#sVerdiep .verdiep-in").filter({ hasText: naam });
      await expect(ingang).toBeVisible();
      await expect(ingang).toContainText("Van dichtbij");
      await ingang.click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator("#sTitle")).toHaveText(naam);
      // De diepe link naar een stap werkt, en de stapsleutel blijft die van het deel zelf.
      await open(page, `${id}/2`);
      await expect(page.locator("#sTitle")).toHaveText(/^2\. /);
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien") || "[]"))).toContainEqual(expect.stringMatching(new RegExp(`^[a-z0-9-]+:${id}:1$`)));
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:laatst") || "null"))).toMatch(new RegExp(`:${id}:1$`));
    }
    expect(errors).toEqual([]);
  });

  test("in tijdlijn, alle reizen, speurtocht en paspoort onder het hoofddeel", async ({ page }) => {
    await open(page, "ur-kanaan");
    await page.getByRole("tab", { name: "Tijdlijn" }).click();
    const abraham = page.locator("#p-tijd .tl-item").filter({ has: page.locator('.tl-go[data-go="genesis:abraham:-1"]') });
    await expect(abraham.locator(".tl-sub")).toContainText("Van Ur naar Kanaän");
    await expect(abraham).toHaveClass(/cur/);
    await expect(page.locator('#p-tijd .tl-go[data-go="genesis:ur-kanaan:-1"]')).toHaveCount(0);
    await abraham.locator(".tl-sub").click();
    await expect(page).toHaveURL(/#ur-kanaan$/);

    await page.getByRole("tab", { name: "Speurtocht" }).click();
    const opties = await page.locator("#p-quiz [data-q]").evaluateAll((l) => l.map((b) => (b as HTMLElement).dataset.q));
    expect(opties.indexOf("ur-kanaan")).toBe(opties.indexOf("abraham") + 1);
    // Sinds 16-11-2026 (bijbelreis-bediening.spec.ts): in de speurtocht heet een verdiepend deel ‘Van dichtbij: …’, direct na
    // zijn hoofddeel; ‘Abraham › …’ was niet duidelijk. In het paspoort en Alle reizen blijft de notatie met ›.
    await expect(page.locator('#p-quiz [data-q="ur-kanaan"]')).toHaveText("Van dichtbij: Van Ur naar Kanaän");

    await page.getByRole("tab", { name: "Paspoort" }).click();
    await expect(page.locator("#stamps .pas-sub .label").first()).toContainText("Abraham › Van Ur naar Kanaän");

    await page.getByRole("tab", { name: "Reis" }).click();
    if (await page.locator("#kiesBtn").isVisible()) await page.locator("#kiesBtn").click();
    await page.getByRole("button", { name: "Alle reizen" }).click();
    const rijen = page.locator("#reizenLijst .olijst li");
    const teksten = await rijen.allTextContents();
    const eersteUr = teksten.findIndex((t) => t.includes("Van Ur naar Kanaän"));
    expect(eersteUr).toBeGreaterThan(0);
    expect(teksten[eersteUr]).toContain("Abraham › Van Ur naar Kanaän");
    expect(teksten[eersteUr - 1]).toMatch(/Abraham ·|Van Ur naar Kanaän/);
    await expect(rijen.nth(eersteUr)).toHaveClass(/sub/);
  });
});

test("‘Verder met’ staat alleen bij Verhalen, niet in de reis", async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem("bijbelreis:niveau", JSON.stringify("b")); localStorage.setItem("bijbelreis:laatst", JSON.stringify("genesis:jakob:8")); localStorage.setItem("bijbelreis:gezien", JSON.stringify(["genesis:jakob:8"])); } catch { /* about:blank */ } });
  await open(page);
  await expect(page.locator("#welkom")).toBeVisible();
  await expect(page.locator("#welkom")).toContainText("Verder met");
  await page.getByRole("tab", { name: "Reis" }).click();
  await expect(page.locator("#welkom")).toBeHidden();
  await page.getByRole("tab", { name: "Verhalen" }).click();
  await expect(page.locator("#welkom")).toBeVisible();
});
