import { expect, test, type Page } from "@playwright/test";
import { zonderVoorscherm } from "./voorscherm";

zonderVoorscherm(test);

// De routes op de kaart: de schijnwerper (docs/bijbelreis-audit/routes.md, keuze van Martijn op 21-11-2026). In een stap
// staat de lijn van de stap in kleur met een witte rand en een gloed, met genummerde haltes ernaast; de rest van de reis is
// grijs. Deze test bewaakt wat een gezin het eerst zou merken: de nummers kloppen (1, 2, 3 … tot het eind, begin en eind
// staan er), een bordje ligt nooit over een plaatsnaam, een plaatsteken, de reiziger of een ander bordje, en de lijn
// haalt ≥ 3 : 1 tegen haar witte rand, ook in oker (thema Kerst). Draait op telefoon, tablet en desktop.
// Met ‘minder beweging’: dan staat de reiziger meteen aan het eind (en mag er op de kaart niets bewegen).

const open = async (page: Page, hash: string) => { await page.goto("about:blank"); await page.goto("/bijbelreis#" + hash); };

type Meting = { nummers: number[]; zichtbaar: number[]; fouten: string[]; contrast: number[]; rand: number[]; rust: boolean; gloed: number; bewegend: number };
const meet = (page: Page) => page.evaluate((): Meting => {
  const zichtbaarEl = (e: Element) => { const s = getComputedStyle(e); return s.display !== "none" && s.visibility !== "hidden" && +s.opacity > 0.05; };
  const R = (e: Element) => e.getBoundingClientRect();
  const raak = (a: DOMRect, b: DOMRect) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const namen = [...document.querySelectorAll("#map .lab")].filter((l) => zichtbaarEl(l) && !l.classList.contains("off") && !l.classList.contains("clash")).map((l) => ({ t: l.firstChild?.textContent ?? "", r: R(l) }));
  const tekens = [...document.querySelectorAll("#map .plaats > .pin, #map .plaats > .fuzz, #map .plaats > .altpin")].filter(zichtbaarEl).map((e) => ({ t: e.parentElement?.querySelector(".lab")?.firstChild?.textContent ?? "", r: R(e) }));
  const kameel = document.querySelector("#map .camel:not(.gone)");
  const reiziger = kameel ? R(kameel.classList.contains("nt") ? kameel.querySelector(".walker")! : kameel) : null;
  const bordjes = [...document.querySelectorAll("#map .halte")].map((e) => ({ n: (e.textContent ?? "").split(" · ").map(Number), aan: !e.classList.contains("off"), r: R(e) }));
  const fouten: string[] = [];
  const aan = bordjes.filter((b) => b.aan);
  aan.forEach((b, i) => {
    namen.forEach((l) => raak(b.r, l.r) && fouten.push(`bordje ${b.n} over de naam ${l.t}`));
    tekens.forEach((l) => raak(b.r, l.r) && fouten.push(`bordje ${b.n} over het teken van ${l.t}`));
    if (reiziger && raak(b.r, reiziger)) fouten.push(`bordje ${b.n} onder de reiziger`);
    aan.slice(i + 1).forEach((c) => raak(b.r, c.r) && fouten.push(`bordje ${b.n} over bordje ${c.n}`));
    const k = document.getElementById("map")!.getBoundingClientRect();
    if (b.r.left < k.left || b.r.right > k.right || b.r.top < k.top || b.r.bottom > k.bottom) fouten.push(`bordje ${b.n} buiten de kaart`);
  });
  // Contrast van de lijn van de stap tegen haar witte rand (WCAG 1.4.11), en de breedte van die rand.
  const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const lum = (c: string) => { const [r, g, b] = rgb(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const cr = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const contrast: number[] = [], rand: number[] = [];
  const omrand = [...document.querySelectorAll("#map path.rt-casing.active")];
  document.querySelectorAll("#map path.rt.active:not(.rt-casing)").forEach((l) => {
    const c = omrand.find((x) => x.getAttribute("d") === l.getAttribute("d")); if (!c) return;
    const sl = getComputedStyle(l), sc = getComputedStyle(c);
    if (+sc.strokeOpacity < 1) return; // rustig: de rand is een eigen lijn (.rt-rand)
    contrast.push(cr(sl.stroke, sc.stroke));
    rand.push((parseFloat(sc.strokeWidth) - parseFloat(sl.strokeWidth)) / 2);
  });
  const nummers = bordjes.flatMap((b) => b.n).sort((a, b) => a - b);
  const bewegend = document.getAnimations().filter((a) => a.playState === "running" && a.effect instanceof KeyframeEffect && a.effect.target instanceof Element && a.effect.target.closest("#map")).length;
  return { nummers, zichtbaar: aan.flatMap((b) => b.n), fouten, contrast, rand, rust: document.getElementById("map")!.classList.contains("rt-rust"), gloed: document.querySelectorAll("#map .rt-gloed").length, bewegend };
});

async function stapKlaar(page: Page) {
  await page.waitForSelector("#map .land", { state: "attached" });
  await expect(page.locator("#sTitle")).not.toBeEmpty();
  await page.waitForTimeout(900); // uitsnede en namen (één beeld later)
}

// Paulus 9: zeven haltes, Lystre en Derbe dicht bij elkaar. Abraham 10: de koningen, met een onbekende plek (?).
// Uittocht 5: het leger van Farao als zijroute. Kerst · wijzen 9: oker in het thema Kerst.
for (const [hash, aantal] of [["nt-paulus/9", 7], ["abraham/10", 6], ["uittocht/5", 2], ["kerst-wijzen/9", 0]] as const) {
  test(`routes: haltes en lijn bij #${hash}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, hash);
    await stapKlaar(page);
    const m = await meet(page);
    expect(m.rust, "in een stap is de kaart niet ‘rustig’").toBe(false);
    expect(m.gloed, "de stap heeft een gloed").toBeGreaterThan(0);
    if (aantal) {
      // De nummers lopen van 1 tot het eind zonder gat (een plaats die twee keer langskomt heeft één bordje ‘1 · 5’).
      expect(m.nummers).toEqual(Array.from({ length: aantal }, (_, i) => i + 1));
      expect(m.zichtbaar, "begin en eind staan altijd op de kaart").toEqual(expect.arrayContaining([1, aantal]));
    } else expect(m.nummers).toEqual([]);
    expect(m.fouten).toEqual([]);
    expect(m.contrast.length).toBeGreaterThan(0);
    for (const c of m.contrast) expect(c, "lijn tegen haar witte rand").toBeGreaterThanOrEqual(3);
    for (const r of m.rand) expect(r, "witte rand aan elke kant").toBeGreaterThanOrEqual(1.5);
    expect(m.bewegend, "minder beweging: niets beweegt op de kaart").toBe(0);
    if (hash.startsWith("kerst")) await expect(page.locator("body")).toHaveAttribute("data-thema", "kerst");
  });
}

test("routes: inzoomen bij Paulus 9: een bordje dat wegviel komt terug, en ligt nog steeds nergens over", async ({ page }) => {
  // Alleen voor de test: de Leaflet-kaart als window.__kaart (zoals in e2e/bijbelreis-landschap.spec.ts).
  await page.addInitScript(() => {
    let echt: unknown;
    Object.defineProperty(window, "L", { configurable: true, get: () => echt, set: (v: { Map: { addInitHook: (f: () => void) => void } }) => { echt = v; v.Map.addInitHook(function (this: unknown) { (window as unknown as { __kaart: unknown }).__kaart = this; }); } });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "nt-paulus/9");
  await stapKlaar(page);
  // Inzoomen op Lystre (halte 4), naast Ikonium (5) en Derbe (3): daar staan de bordjes het dichtst op elkaar.
  await page.evaluate(() => { const k = (window as unknown as { __kaart: { setView: (ll: [number, number], z: number, o: object) => void; getZoom: () => number } }).__kaart; k.setView([37.6017, 32.3384], k.getZoom() + 2, { animate: false }); });
  await page.waitForTimeout(900);
  const m = await meet(page);
  expect(m.fouten).toEqual([]);
  expect(m.zichtbaar, "ingezoomd staan 3, 4 en 5 er allemaal").toEqual(expect.arrayContaining([3, 4, 5]));
});

test("routes: het overzicht van een deel en een geschiedenis zijn rustig — geen nummers, geen gloed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "nt-paulus");
  await page.waitForSelector("#map .land", { state: "attached" });
  await page.waitForTimeout(900);
  let m = await meet(page);
  expect(m.rust).toBe(true);
  expect(m.nummers).toEqual([]);
  expect(m.gloed).toBe(0);
  expect(await page.locator("#map .rt-rand").count(), "elke lijn heeft een witte rand").toBeGreaterThan(5);
  await open(page, "v26"); // Droog door de Schelfzee: met het leger van Farao
  await page.waitForSelector("#map .land", { state: "attached" });
  await page.waitForTimeout(900);
  m = await meet(page);
  expect(m.rust).toBe(true);
  expect(m.nummers).toEqual([]);
  expect(m.gloed).toBe(0);
});
