import { expect, test, type Page } from "@playwright/test";

// Het deel ‘Jakob bij de Jabbok’ (Genesis 32, vers voor vers): opent via een diepe link, heeft twaalf stappen met vaste
// titels (bij elke stap hoort een tafereel), zoomt in op het gebied van de Jabbok en laat het deel Jakob ongemoeid.
// Hulpjes overgenomen uit e2e/bijbelreis.spec.ts.

// Volledige weergave (Verder ontdekken), zoals in de andere Bijbelreis-tests.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (localStorage.getItem("bijbelreis:niveau") === null) localStorage.setItem("bijbelreis:niveau", JSON.stringify("c")); });
});

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

// Alleen voor de test: de Leaflet-kaart zichtbaar maken als window.__kaart, zodat de test het zoomniveau kan aflezen.
async function kaartHaak(page: Page) {
  await page.addInitScript(() => {
    let echt: unknown;
    Object.defineProperty(window, "L", { configurable: true, get: () => echt, set: (v: { Map: { addInitHook: (f: () => void) => void } }) => { echt = v; v.Map.addInitHook(function (this: unknown) { (window as unknown as { __kaart: unknown }).__kaart = this; }); } });
  });
}
type Kaart = { getZoom: () => number; getCenter: () => { lat: number; lng: number } };
// Wacht tot de kaart stilstaat (het inzoomen en het lopen van de kameel zijn klaar).
async function wachtTotKaartStil(page: Page) {
  const stand = () => page.evaluate(() => { const k = (window as unknown as { __kaart?: Kaart }).__kaart; return JSON.stringify([k ? k.getZoom() : 0, k ? k.getCenter() : 0]); });
  let vorige = await stand();
  await expect.poll(async () => { await page.waitForTimeout(250); const nu = await stand(); const gelijk = nu === vorige; vorige = nu; return gelijk; }, { timeout: 10_000 }).toBe(true);
}

type Deel = { id: string; steps: { t: string; ref: string }[] };
const delenVanGenesis = (page: Page) => page.evaluate(() => (window as unknown as { BR: { boeken: { id: string; delen: Deel[] }[] } }).BR.boeken.find((b) => b.id === "genesis")!.delen.map((d) => ({ id: d.id, steps: d.steps.map((s) => ({ t: s.t, ref: s.ref })) })));

const TITELS = ["Engelen bij Mahanaïm", "Boden naar Ezau", "Jakob vreest zeer", "Jakob bidt", "Een geschenk voor Ezau", "Over de Jabbok", "De worsteling", "Een nieuwe naam: Israël", "Pniël: de zon gaat op", "De ontmoeting met Ezau", "Als het aangezicht van God", "Sukkoth en Sichem: een altaar"];
const REFS = ["Genesis 32:1–2", "Genesis 32:3–6", "Genesis 32:7–8", "Genesis 32:9–12", "Genesis 32:13–21", "Genesis 32:22–23", "Genesis 32:24–26", "Genesis 32:27–29", "Genesis 32:30–32", "Genesis 33:1–4", "Genesis 33:5–11", "Genesis 33:12–20"];

test("Genesis 32: ‘Jakob bij de Jabbok’ opent als eigen deel met twaalf stappen", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#jakob-jabbok");
  await expect(page.locator("#p-reis")).toContainText("Jakob bij de Jabbok");
  await expect(page.locator("#p-reis")).toContainText("Genesis 32");
  await expect(page.locator(".dot")).toHaveCount(12);
  // De indeling ligt vast: bij elke stap hoort een tafereel. Het deel staat direct na Jakob en vóór Jozef.
  const delen = await delenVanGenesis(page);
  const ids = delen.map((d) => d.id);
  expect(ids.slice(ids.indexOf("jakob"), ids.indexOf("jakob") + 3)).toEqual(["jakob", "jakob-jabbok", "jozef"]);
  const deel = delen.find((d) => d.id === "jakob-jabbok")!;
  expect(deel.steps.map((s) => s.t)).toEqual(TITELS);
  expect(deel.steps.map((s) => s.ref)).toEqual(REFS);
  expect(errors).toEqual([]);
});

test("Genesis 32: de stappen van de worsteling tot de ontmoeting hebben de juiste titel en tekst", async ({ page }) => {
  const errors = watchErrors(page);
  // De link telt vanaf 1: #jakob-jabbok/7 is de zevende stap (index 6).
  await page.goto("/bijbelreis#jakob-jabbok/7");
  await expect(page.locator("#sTitle")).toHaveText("7. De worsteling");
  await expect(page.locator("#sText")).toContainText("Ik zal U niet laten gaan, tenzij dat Gij mij zegent");
  await expect(page.locator("#p-reis")).toContainText("Lees in je Bijbel: Genesis 32:24–26");
  await expect(page.locator("#map .plaats .lab", { hasText: "Pniël" })).toHaveCount(1);
  await page.goto("/bijbelreis#jakob-jabbok/8");
  await expect(page.locator("#sTitle")).toHaveText("8. Een nieuwe naam: Israël");
  await expect(page.locator("#sText")).toContainText("Uw naam zal voortaan niet Jakob heten, maar Israël");
  await page.goto("/bijbelreis#jakob-jabbok/9");
  await expect(page.locator("#sTitle")).toHaveText("9. Pniël: de zon gaat op");
  await expect(page.locator("#sText")).toContainText("ik heb God gezien van aangezicht tot aangezicht");
  await page.goto("/bijbelreis#jakob-jabbok/10");
  await expect(page.locator("#sTitle")).toHaveText("10. De ontmoeting met Ezau");
  await expect(page.locator("#p-reis")).toContainText("Lees in je Bijbel: Genesis 33:1–4");
  expect(errors).toEqual([]);
});

test("Genesis 32: de kaart zoomt in op de Jabbok, met Mahanaïm en Pniël in beeld", async ({ page }) => {
  await kaartHaak(page);
  await page.goto("/bijbelreis#jakob-jabbok/7");
  await expect(page.locator("#sTitle")).toHaveText("7. De worsteling");
  await wachtTotKaartStil(page);
  const { zoom, midden } = await page.evaluate(() => { const k = (window as unknown as { __kaart: Kaart }).__kaart, c = k.getCenter(); return { zoom: k.getZoom(), midden: [c.lat, c.lng] }; });
  // Veel verder ingezoomd dan een gewone stap (9): Mahanaïm en Pniël liggen maar een halve kilometer uit elkaar.
  expect(zoom).toBeGreaterThanOrEqual(12);
  expect(Math.abs(midden[0] - 32.187)).toBeLessThan(0.05);
  expect(Math.abs(midden[1] - 35.692)).toBeLessThan(0.05);
  await expect(page.locator("#map .plaats .lab", { hasText: "Mahanaïm" })).toHaveCount(1);
});

test("Genesis 32: het bestaande deel Jakob houdt zijn stappen", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#jakob/6");
  await expect(page.locator("#sTitle")).toHaveText("6. Bang voor Ezau");
  await page.goto("/bijbelreis#jakob/7");
  await expect(page.locator("#sTitle")).toHaveText("7. Worstelen in de nacht");
  await page.goto("/bijbelreis#jakob/8");
  await expect(page.locator("#sTitle")).toHaveText("8. Broers weer samen");
  // Geen stap erbij, eraf of verplaatst: de voortgang van gebruikers hangt aan boek:deel:index.
  const jakob = (await delenVanGenesis(page)).find((d) => d.id === "jakob")!;
  expect(jakob.steps).toHaveLength(15);
  expect(jakob.steps.map((s) => s.t)).toEqual(["De ladder naar de hemel", "Rachel bij de put", "Bedrogen!", "Een grote familie", "Stiekem weg", "Bang voor Ezau", "Worstelen in de nacht", "Broers weer samen",
    "Terug in Bethel", "Benjamin en Rachel", "Thuis bij Izak", "Jozef verdwenen", "Naar Egypte", "Jakob zegent", "Begraven in Machpela"]);
  expect(errors).toEqual([]);
});
