import { expect, test, type Page } from "@playwright/test";

// Het landschap van toen (public/bijbelreis/toen.json): in de stand Toen staan de oude baaien, meren en Nijlarmen op de
// kaart en zijn de meren en stuwmeren van nu weg; in de stand Nu is het omgekeerd. Zie docs/bijbelreis-audit/ondergrond.md.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("bijbelreis:niveau", JSON.stringify("c"));
    localStorage.setItem("bijbelreis:welkomWeg", "true");
    // Alleen voor de test: de Leaflet-kaart als window.__kaart, zodat de test kan inzoomen en schermpunten kan uitrekenen.
    let echt: unknown;
    Object.defineProperty(window, "L", { configurable: true, get: () => echt, set: (v: { Map: { addInitHook: (f: () => void) => void } }) => { echt = v; v.Map.addInitHook(function (this: unknown) { (window as unknown as { __kaart: unknown }).__kaart = this; }); } });
  });
});

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

type Feature = { properties: { n: string; vast?: number } };
type Toen = { zee: Feature[]; kust: Feature[]; meren: Feature[]; onzeker: Feature[]; rand: Feature[]; rivieren: Feature[]; nu: Feature[]; weg: string[]; wegRivier: string[] };
type Geo = { lakes: Feature[]; rivers: Feature[] };

async function open(page: Page) {
  await page.goto("/bijbelreis#genesis");
  await expect(page.locator("#map.toen-geladen")).toBeVisible();
}
// Aantal getekende lijnen en vlakken van een klasse, en hoeveel daarvan zichtbaar zijn (display is niet 'none').
const tel = (page: Page, klasse: string) => page.evaluate((k) => { const els = [...document.querySelectorAll(`#map path.${k}`)]; return { alle: els.length, zichtbaar: els.filter((e) => getComputedStyle(e).display !== "none").length }; }, klasse);
// Ligt een punt op de kaart binnen een zichtbaar vlak met deze klasse? (SVG rekent het zelf uit met isPointInFill.)
const inVlak = (page: Page, klasse: string, ll: [number, number], zoom: number) => page.evaluate(async ([k, p, z]) => {
  const kaart = (window as unknown as { __kaart: { setView: (ll: [number, number], z: number, o: object) => void; latLngToContainerPoint: (ll: [number, number]) => { x: number; y: number }; getContainer: () => HTMLElement } }).__kaart;
  kaart.setView(p as [number, number], z as number, { animate: false });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const pt = kaart.latLngToContainerPoint(p as [number, number]), box = kaart.getContainer().getBoundingClientRect();
  return [...document.querySelectorAll<SVGPathElement>(`#map path.${k}`)].some((el) => {
    if (getComputedStyle(el).display === "none") return false;
    const m = el.getScreenCTM();
    if (!m) return false;
    const q = new DOMPoint(pt.x + box.left, pt.y + box.top).matrixTransform(m.inverse());
    return el.isPointInFill(q);
  });
}, [klasse, ll, zoom] as const);

test("landschap: Toen toont het oude landschap, Nu het moderne", async ({ page, request }) => {
  const errors = watchErrors(page);
  const toen = (await (await request.get("/bijbelreis/toen.json")).json()) as Toen;
  const geo = (await (await request.get("/bijbelreis/geo.json")).json()) as Geo;
  // Wat erin moet zitten: de punten uit de opdracht die getekend zijn.
  expect(toen.zee.map((f) => f.properties.n)).toEqual(expect.arrayContaining(["Haven van Efeze", "Golf van Latmus (Milete)", "Thermaïsche Golf"]));
  expect(toen.meren.map((f) => f.properties.n)).toEqual(expect.arrayContaining(["Hulameer", "Dode Zee (Zoutzee)"]));
  expect(toen.onzeker.map((f) => f.properties.n)).toEqual(expect.arrayContaining(["Kop van de Perzische Golf", "Dode Zee, zuidelijk bekken", "Bittermeren"]));
  expect(toen.rivieren.map((f) => f.properties.n)).toContain("Pelusische Nijlarm");
  expect(toen.nu.length).toBeGreaterThanOrEqual(5);
  const nToen = toen.zee.length + toen.kust.length + toen.meren.length + toen.onzeker.length + toen.rand.length + toen.rivieren.length;
  const nNu = toen.nu.length + geo.lakes.filter((f) => toen.weg.includes(f.properties.n)).length + geo.rivers.filter((f) => toen.wegRivier.includes(f.properties.n)).length;

  await open(page);
  await expect(page.locator("#toenBtn")).toHaveAttribute("aria-pressed", "true");
  expect(await tel(page, "alleen-toen")).toEqual({ alle: nToen, zichtbaar: nToen });
  expect(await tel(page, "alleen-nu")).toEqual({ alle: nNu, zichtbaar: 0 });
  await expect(page.locator("#lgToen")).not.toHaveAttribute("hidden", "");
  await expect(page.locator("#lgNu")).toHaveAttribute("hidden", "");

  await page.locator("#nuBtn").click();
  await expect(page.locator("#map")).toHaveClass(/\bnu\b/);
  expect(await tel(page, "alleen-toen")).toEqual({ alle: nToen, zichtbaar: 0 });
  expect(await tel(page, "alleen-nu")).toEqual({ alle: nNu, zichtbaar: nNu });
  await expect(page.locator("#lgToen")).toHaveAttribute("hidden", "");
  await expect(page.locator("#lgNu")).not.toHaveAttribute("hidden", "");
  await expect(page.locator("#lgNu")).toContainText("stuwmeren");

  await page.locator("#toenBtn").click();
  await expect(page.locator("#map")).not.toHaveClass(/\bnu\b/);
  expect(await tel(page, "alleen-nu")).toEqual({ alle: nNu, zichtbaar: 0 });
  expect(errors).toEqual([]);
});

test("landschap: het Hulameer, de haven van Efeze en de stuwmeren liggen op de goede plek en in de goede stand", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  const hula: [number, number] = [33.07, 35.625], havenEfeze: [number, number] = [37.975, 27.31], assad: [number, number] = [36.0, 38.2];
  const zuidbekken: [number, number] = [31.15, 35.45], golf: [number, number] = [30.75, 47.6];
  // Toen: het Hulameer is een meer, bij Efeze ligt een baai, het zuiden van de Dode Zee en de kop van de Golf zijn onzeker.
  expect(await inVlak(page, "toen-meer", hula, 10)).toBe(true);
  expect(await inVlak(page, "toen-zee", havenEfeze, 10)).toBe(true);
  expect(await inVlak(page, "toen-onzeker", zuidbekken, 9)).toBe(true);
  expect(await inVlak(page, "toen-onzeker", golf, 7)).toBe(true);
  expect(await inVlak(page, "alleen-nu", assad, 8)).toBe(false);
  await page.evaluate(() => (window as unknown as { __kaart: { setView: (ll: [number, number], z: number, o: object) => void } }).__kaart.setView([33.07, 35.625], 10, { animate: false }));
  await expect(page.locator(".region.toen", { hasText: "Hulameer" })).toBeVisible();
  // Nu: het Hulameer en de baai zijn weg, het Assadmeer (stuwmeer in de Eufraat) staat er.
  await page.locator("#nuBtn").click();
  await expect(page.locator(".region.toen", { hasText: "Hulameer" })).toBeHidden();
  expect(await inVlak(page, "toen-meer", hula, 10)).toBe(false);
  expect(await inVlak(page, "toen-zee", havenEfeze, 10)).toBe(false);
  expect(await inVlak(page, "toen-onzeker", golf, 7)).toBe(false);
  expect(await inVlak(page, "alleen-nu", assad, 8)).toBe(true);
  // Efeze zelf blijft in beide standen op het land liggen (geen plaats in zee).
  const efeze = await page.evaluate(() => (window as unknown as { BR: { plaatsen: Record<string, { ll: [number, number] }> } }).BR.plaatsen.nt_efeze.ll);
  await page.locator("#toenBtn").click();
  expect(await inVlak(page, "toen-zee", efeze, 10)).toBe(false);
  expect(errors).toEqual([]);
});

test("landschap: vaak omschakelen en een ontbrekend toen.json geven geen fouten", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  for (let i = 0; i < 6; i++) await page.locator(i % 2 ? "#toenBtn" : "#nuBtn").click();
  await expect(page.locator("#toenBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#map path.land")).toHaveCount(1);
  expect(errors).toEqual([]);

  // Zonder toen.json blijft de kaart werken: in beide standen het landschap van nu, geen fout in de pagina.
  const pagefouten: string[] = [];
  page.on("pageerror", (e) => pagefouten.push(String(e)));
  await page.route("**/bijbelreis/toen.json*", (r) => r.fulfill({ status: 404, body: "weg" }));
  await page.reload();
  await expect(page.locator("#map path.lake").first()).toBeAttached();
  await expect(page.locator("#map.toen-geladen")).toHaveCount(0);
  expect((await tel(page, "alleen-toen")).alle).toBe(0);
  const meren = await tel(page, "lake");
  expect(meren.zichtbaar).toBe(meren.alle);
  await page.locator("#nuBtn").click();
  await expect(page.locator("#map")).toHaveClass(/\bnu\b/);
  await page.locator("#toenBtn").click();
  expect(pagefouten).toEqual([]);
});
