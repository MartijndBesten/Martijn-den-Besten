import { expect, test, type Page } from "@playwright/test";
import { zonderVoorscherm } from "./voorscherm";

zonderVoorscherm(test);

// Het deel ‘Jakob bij de Jabbok’ (Genesis 32, vers voor vers): opent via een diepe link, heeft twaalf stappen met vaste
// titels (bij elke stap hoort een tafereel), zoomt in op het gebied van de Jabbok en laat het deel Jakob ongemoeid.
// Hulpjes overgenomen uit e2e/bijbelreis.spec.ts.

// Volledige weergave (Verdiepen), zoals in de andere Bijbelreis-tests.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { if (localStorage.getItem("bijbelreis:niveau") === null) localStorage.setItem("bijbelreis:niveau", JSON.stringify("c")); } catch { /* about:blank heeft geen opslag */ } });
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

// Telefoon en tablet (tot 900 px): in de reis is de kaart het scherm en staat alles van de stap in het stapblad. Kort
// toont het alleen de titel en twee regels; één tik op ‘Lees meer’ opent het. Op de desktop doet dit niets.
async function bladOpen(page: Page) {
  const knop = page.locator("#bladBtn");
  if (!(await knop.isVisible())) return;
  await expect(page.locator("#sTitle")).not.toBeEmpty();
  await expect(async () => { if ((await knop.getAttribute("aria-expanded")) !== "true") await knop.click(); await page.waitForTimeout(120); expect(await knop.getAttribute("aria-expanded")).toBe("true"); }).toPass();
}

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
  // Veel verder ingezoomd dan een gewone stap (9): Mahanaïm en Pniël liggen maar een halve kilometer uit elkaar. Niet verder
  // dan de bovengrens van de kaart (telefoon en tablet 11,5, groot scherm 12; telefoon.md §4.10), zodat de streek erbij blijft.
  expect(zoom).toBeGreaterThanOrEqual(11.5);
  expect(zoom).toBeLessThanOrEqual(12);
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

test("Jakob: ‘Om over na te denken’ staat bij de intro en de laatste stap, ingeklapt, niet bij een tussenstap", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#jakob-jabbok");
  const denk = page.locator("#sDenk");
  await bladOpen(page);
  await expect(denk).toBeVisible();
  await expect(denk).not.toHaveAttribute("open", "");
  await denk.locator("summary").click();
  await expect(denk.locator("li")).toHaveCount(4);
  await expect(denk.locator("li").first()).toContainText("Genesis 31:3");
  await page.goto("/bijbelreis#jakob-jabbok/7");
  await expect(page.locator("#sTitle")).toHaveText(/^7\. /);
  await bladOpen(page);
  await expect(page.locator("#sText")).toBeVisible();
  await expect(denk).toBeHidden();
  await page.goto("/bijbelreis#jakob-jabbok/12");
  await expect(page.locator("#sTitle")).toContainText("Sukkoth");
  await bladOpen(page);
  await expect(denk).toBeVisible();
  await page.goto("/bijbelreis#jakob");
  await expect(denk.locator("li")).toHaveCount(3);
  expect(errors).toEqual([]);
});

test("Jakob: bij Voorlezen geen vragen om over na te denken", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bijbelreis:niveau", JSON.stringify("a")));
  await page.goto("/bijbelreis#jakob-jabbok");
  await expect(page.locator("#sDenk")).toBeHidden();
});

// Opmerking van Martijn (16-11-2026): “Waar vind ik die extra plaatjes van Genesis 32? Ik had die bij Jakob verwacht.”
// De drie stappen van Jakob over Genesis 32–33 tonen daarom zelf een tekening uit de reeks, en op de telefoon staat de
// ingang naar de hele reeks als knop op de kaart, direct boven het korte stapblad.
test("Jakob: de stappen over Genesis 32–33 tonen een tekening uit de reeks", async ({ page }) => {
  const errors = watchErrors(page);
  for (const [stap, tf] of [[6, "jabbok-gebed"], [7, "jabbok-nacht"], [8, "jabbok-ezau"]] as const) {
    await page.goto("about:blank");
    await page.goto(`/bijbelreis#jakob/${stap}`);
    await expect(page.locator("#sTitle")).toHaveText(new RegExp(`^${stap}\\. `));
    const knop = page.locator("#bladBtn");
    if (await knop.isVisible()) await expect(async () => { if ((await knop.getAttribute("aria-expanded")) !== "true") await knop.click(); expect(await knop.getAttribute("aria-expanded")).toBe("true"); }).toPass();
    await expect(page.locator("#p-reis .stapkaart .tafereel")).toHaveAttribute("data-tf", tf);
    await expect(page.locator("#p-reis .stapkaart .tafereel figcaption")).toContainText(/Genesis 3[23]:/);
  }
  expect(errors).toEqual([]);
});

test("Jakob op de telefoon: ‘Van dichtbij’ staat als knop op de kaart, boven het korte blad, en opent de reeks", async ({ page, isMobile }) => {
  test.skip(!isMobile, "alleen op de telefoon; op de desktop staat de ingang in het reisboek");
  const errors = watchErrors(page);
  await page.goto("about:blank");
  await page.goto("/bijbelreis#jakob/7");
  await expect(page.locator("#sTitle")).toHaveText(/^7\. /);
  const knop = page.locator("#dichtbijBtn");
  await expect(knop).toBeVisible();
  await expect(knop).toContainText("Jakob bij de Jabbok");
  await expect(knop).toContainText("12 stappen");
  // Boven het blad, niet eroverheen; binnen het scherm; een tikdoel van minstens 44 px.
  const maat = await page.evaluate(() => { const k = document.getElementById("dichtbijBtn")!.getBoundingClientRect(), b = document.getElementById("reisboek")!.getBoundingClientRect(); return { boven: b.top - k.bottom, h: k.height, links: k.left, rechts: innerWidth - k.right }; });
  expect(maat.boven).toBeGreaterThanOrEqual(4);
  expect(maat.boven).toBeLessThan(24);
  expect(maat.h).toBeGreaterThanOrEqual(44);
  expect(maat.links).toBeGreaterThanOrEqual(8);
  expect(maat.rechts).toBeGreaterThanOrEqual(8);
  // Met het blad open is de knop weg: daar staat de ingang in het blad zelf.
  await page.locator("#bladBtn").click();
  await expect(knop).toBeHidden();
  await expect(page.locator("#sVerdiep .verdiep-in")).toHaveCount(1);
  await page.locator("#bladBtn").click();
  await expect(knop).toBeVisible();
  // Een stap zonder verdiepend deel heeft de knop niet.
  await page.goto("about:blank");
  await page.goto("/bijbelreis#jakob/2");
  await expect(page.locator("#sTitle")).toHaveText(/^2\. /);
  await expect(knop).toBeHidden();
  // Tik: de reeks opent bij haar begin, en daar staat de knop niet (je bent er al).
  await page.goto("about:blank");
  await page.goto("/bijbelreis#jakob");
  await expect(knop).toBeVisible();
  await knop.click();
  await expect(page).toHaveURL(/#jakob-jabbok$/);
  await expect(page.locator("#sTitle")).toHaveText("Jakob bij de Jabbok");
  await expect(knop).toBeHidden();
  expect(errors).toEqual([]);
});
