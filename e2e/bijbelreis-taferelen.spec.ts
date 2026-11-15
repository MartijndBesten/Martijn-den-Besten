import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Taferelen: getekende, licht bewegende beelden bij stappen zonder reis (taferelen*.js).
// Regels en tekenafspraken: docs/bijbelreis-taferelen/README.md. Draaien tegen een server die public/ serveert:
//   E2E_BASE_URL=http://127.0.0.1:8816 npx playwright test e2e/bijbelreis-taferelen.spec.ts --trace off

test.use({ reducedMotion: "reduce" });
const zetNiveau = (page: Page, n: "a" | "b" | "c") => page.addInitScript((x) => { if (sessionStorage.getItem("niveauGezet")) return; sessionStorage.setItem("niveauGezet", "1"); localStorage.setItem("bijbelreis:niveau", JSON.stringify(x)); localStorage.setItem("bijbelreis:welkomWeg", "true"); }, n);
test.beforeEach(async ({ page }) => { await zetNiveau(page, "c"); });

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
const beeld = (page: Page) => page.locator("#p-reis .stapkaart .tafereel");
const lopend = (page: Page, sel: string) => page.evaluate((sel) => document.querySelector(sel)!.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length, sel);

test("een stap zonder reis toont het standaardbeeld van de plaats, met een toegankelijke naam", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#esther/1");
  await expect(beeld(page)).toHaveCount(1);
  await expect(beeld(page)).toHaveAttribute("data-tf", "stad");
  await expect(beeld(page).getByRole("img", { name: /stad.*muur.*poort/i })).toBeVisible();
  await expect(beeld(page).locator("figcaption")).toContainText("Susan");
  await expect(beeld(page).locator("figcaption")).toContainText("Algemene tekening");
  // Het beeld staat bij de tekst: direct na de vertelling, en het past in de kaart (ook op een telefoon).
  expect(await page.evaluate(() => document.getElementById("sText")!.nextElementSibling!.classList.contains("tafereel"))).toBe(true);
  const maat = await page.evaluate(() => { const f = document.querySelector(".stapkaart .tafereel")!.getBoundingClientRect(), k = document.querySelector(".stapkaart")!.getBoundingClientRect(); return { binnen: f.left >= k.left - 1 && f.right <= k.right + 1, hoog: f.height, scherm: innerHeight, breed: document.documentElement.scrollWidth <= innerWidth }; });
  expect(maat.binnen).toBe(true);
  expect(maat.breed).toBe(true);
  expect(maat.hoog).toBeLessThan(maat.scherm * 0.6);
  const axe = await new AxeBuilder({ page }).include(".stapkaart .tafereel").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  expect(errors).toEqual([]);
});

test("een eigen koppeling gaat vóór het standaardbeeld, ook bij een stap met reis", async ({ page }) => {
  const errors = watchErrors(page);
  // Jericho is een stad (standaardbeeld), maar deze stap heeft een eigen tafereel.
  await page.goto("/bijbelreis#intocht/5");
  await expect(beeld(page)).toHaveAttribute("data-tf", "jericho");
  await expect(beeld(page).getByRole("img", { name: /Jericho/ })).toBeVisible();
  await expect(beeld(page).locator("figcaption")).toContainText("Jozua 6:20");
  await expect(beeld(page).locator("figcaption")).not.toContainText("Algemene tekening");
  // De doortocht door de Schelfzee is een stap mét reis: zonder koppeling stond hier geen beeld.
  await page.goto("/bijbelreis#uittocht/6");
  await expect(page.locator("#sKm")).toContainText("km");
  await expect(beeld(page)).toHaveAttribute("data-tf", "schelfzee");
  expect(errors).toEqual([]);
});

test("tweede reeks OT: de tabernakel bij een stap zonder reis en het vuur op de Karmel bij een stap met reis", async ({ page }) => {
  const errors = watchErrors(page);
  // De tabernakel hing eerst aan het standaardbeeld van de berg Sinaï.
  await page.goto("/bijbelreis#sinai/9");
  await expect(page.locator("#sTitle")).toContainText("De tabernakel");
  await expect(beeld(page)).toHaveAttribute("data-tf", "tabernakel");
  await expect(beeld(page).getByRole("img", { name: /tabernakel.*voorhof.*wolk/i })).toBeVisible();
  await expect(beeld(page).locator("figcaption")).toContainText("Exodus 40:34–38");
  await expect(beeld(page).locator("figcaption")).not.toContainText("Algemene tekening");
  // De tekening heeft echte afmetingen: ze vult het kader en loopt de kaart niet uit.
  const maat = await page.evaluate(() => { const f = document.querySelector(".stapkaart .tafereel .tf-svg")!.getBoundingClientRect(), k = document.querySelector(".stapkaart")!.getBoundingClientRect(); return { breed: f.width, hoog: f.height, binnen: f.left >= k.left - 1 && f.right <= k.right + 1, pagina: document.documentElement.scrollWidth <= innerWidth }; });
  expect(maat.breed).toBeGreaterThan(200);
  expect(maat.hoog / maat.breed).toBeCloseTo(7 / 16, 1);
  expect(maat.binnen && maat.pagina).toBe(true);
  // Het vuur op de Karmel is een stap mét reis; bij ‘minder beweging’ staat het vuur er al (eindstand) en is er geen knop.
  await page.goto("/bijbelreis#elia/4");
  await expect(page.locator("#sTitle")).toContainText("Karmel");
  await expect(page.locator("#sKm")).toContainText("km");
  await expect(beeld(page)).toHaveAttribute("data-tf", "karmel");
  await expect(beeld(page).getByRole("img", { name: /altaar van twaalf stenen/ })).toBeVisible();
  await expect(beeld(page).locator("figcaption")).toContainText("1 Koningen 18:38");
  expect(await page.evaluate(() => document.querySelector(".stapkaart .tafereel")!.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await page.evaluate(() => { const v = document.querySelector(".stapkaart .tafereel .tf-e-val")!; return getComputedStyle(v).opacity + " " + getComputedStyle(v).transform; })).toBe("1 none");
  await expect(beeld(page).locator(".tf-opnieuw")).toHaveCount(0);
  const axe = await new AxeBuilder({ page }).include(".stapkaart .tafereel").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  expect(errors).toEqual([]);
});

test("een stap met reis en zonder koppeling toont geen tafereel; het beeld wisselt met de stap", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#uittocht/4");
  await expect(page.locator("#sTitle")).toContainText("Weg uit Egypte");
  await expect(page.locator("#sKm")).toContainText("km");
  await expect(page.locator(".tafereel")).toHaveCount(0);
  // Twee stappen verder: de Schelfzee (eigen tafereel); daarna het lied (standaardbeeld water); het deelscherm heeft er geen.
  await page.evaluate(() => (document.querySelector('.dot[data-step="5"]') as HTMLElement).click());
  await expect(beeld(page)).toHaveAttribute("data-tf", "schelfzee");
  await page.evaluate(() => (document.querySelector('.dot[data-step="6"]') as HTMLElement).click());
  await expect(beeld(page)).toHaveCount(1);
  await expect(beeld(page)).toHaveAttribute("data-tf", "water");
  await page.goto("/bijbelreis#uittocht");
  await expect(page.locator("#sTitle")).not.toContainText("1.");
  await expect(page.locator(".tafereel")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("bij ‘minder beweging’ beweegt er niets en staat het beeld in de eindstand", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#intocht/5");
  await expect(beeld(page)).toHaveCount(1);
  await beeld(page).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.querySelector(".stapkaart .tafereel")!.getAnimations({ subtree: true }).length)).toBe(0);
  // Eindstand: de muur ligt om (onzichtbaar), het puin is te zien; er is geen knop om iets af te spelen.
  expect(await page.evaluate(() => [...document.querySelectorAll(".stapkaart .tafereel .tf-e-stort")].every((e) => getComputedStyle(e).opacity === "0"))).toBe(true);
  await expect(beeld(page).locator(".tf-opnieuw")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("Nieuwe Testament: het veld van de herders en het open graf; bij de kruisiging staat geen tafereel", async ({ page }) => {
  const errors = watchErrors(page);
  // Lukas 2:8–20: geen stad en geen figuren, maar het veld bij nacht, de kudde en het licht.
  await page.goto("/bijbelreis#nt-geboorte/7");
  await expect(page.locator("#sTitle")).toContainText("Herders in het veld");
  await expect(beeld(page)).toHaveAttribute("data-tf", "herders-veld");
  await expect(beeld(page).getByRole("img", { name: /nacht.*schapen.*licht/i })).toBeVisible();
  await expect(beeld(page).locator("figcaption")).toContainText("Lukas 2:8–9");
  await expect(beeld(page).locator("figcaption")).not.toContainText("Algemene tekening");
  expect(await page.evaluate(() => { const f = document.querySelector(".stapkaart .tafereel")!.getBoundingClientRect(), k = document.querySelector(".stapkaart")!.getBoundingClientRect(); return f.left >= k.left - 1 && f.right <= k.right + 1 && document.documentElement.scrollWidth <= innerWidth; })).toBe(true);
  const axe = await new AxeBuilder({ page }).include(".stapkaart .tafereel").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  // Markus 16:2–4: het graf in de hof met de afgewentelde steen. Eindstand: de duisternis is weg en niets beweegt.
  await page.goto("/bijbelreis#nt-opstanding/1");
  await expect(page.locator("#sTitle")).toContainText("De steen is weggerold");
  await expect(beeld(page)).toHaveAttribute("data-tf", "graf-open");
  await expect(beeld(page).getByRole("img", { name: /steen.*graf.*open/i })).toBeVisible();
  await expect(beeld(page).locator("figcaption")).toContainText("Markus 16:2–4");
  await beeld(page).scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.querySelector(".stapkaart .tafereel")!.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await page.evaluate(() => [...document.querySelectorAll(".stapkaart .tafereel .tf-e-dooft")].every((e) => getComputedStyle(e).opacity === "0"))).toBe(true);
  await expect(beeld(page).locator(".tf-opnieuw")).toHaveCount(0);
  // Golgotha: bij de kruisiging en het sterven staat bewust geen beeld.
  for (const [hash, titel] of [["#nt-lijden/7", "Gekruisigd op Golgotha"], ["#nt-lijden/8", "Het is volbracht"]]) {
    await page.goto("/bijbelreis" + hash);
    await expect(page.locator("#sTitle")).toContainText(titel);
    await expect(page.locator(".tafereel")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test.describe("met beweging", () => {
  test.use({ reducedMotion: "no-preference" });
  test("de beweging loopt alleen als het tafereel in beeld is en is opnieuw te zien", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/bijbelreis#intocht/5");
    await expect(beeld(page)).toHaveCount(1);
    await beeld(page).scrollIntoViewIfNeeded();
    await expect(beeld(page)).toHaveClass(/tf-loopt/);
    await expect.poll(() => lopend(page, ".stapkaart .tafereel")).toBeGreaterThan(0);
    // Zonder de klasse tf-loopt (buiten beeld) staat de beweging stil; met de klasse loopt ze weer.
    await page.evaluate(() => document.querySelector(".stapkaart .tafereel")!.classList.remove("tf-loopt"));
    expect(await lopend(page, ".stapkaart .tafereel")).toBe(0);
    await page.evaluate(() => document.querySelector(".stapkaart .tafereel")!.classList.add("tf-loopt"));
    await expect.poll(() => lopend(page, ".stapkaart .tafereel")).toBeGreaterThan(0);
    // De eenmalige beweging komt tot rust; daarna is ze opnieuw te zien met de knop.
    await expect.poll(() => lopend(page, ".stapkaart .tafereel"), { timeout: 12_000 }).toBe(0);
    const knop = beeld(page).getByRole("button", { name: "Laat de beweging nog een keer zien" });
    await expect(knop).toBeVisible();
    await knop.click();
    await expect.poll(() => lopend(page, ".stapkaart .tafereel")).toBeGreaterThan(0);
    // Een ander onderdeel openen: het tafereel is uit beeld en de beweging staat stil.
    await page.locator("#t-tijd").click();
    await expect(beeld(page)).not.toHaveClass(/tf-loopt/);
    expect(await lopend(page, ".stapkaart .tafereel")).toBe(0);
    expect(errors).toEqual([]);
  });
});

test("ook in de verhaalweergave staat het tafereel van de stap, één keer per beeld", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#v39");
  await expect(page.locator("#vTitel")).toContainText("Jericho");
  const f = page.locator('#p-verhalen .tafereel[data-tf="jericho"]');
  await expect(f).toHaveCount(1);
  // Op de telefoon begint het verhaal met het eerste stuk; het beeld kan in een volgend stuk staan, één tik verder.
  if (await page.locator("#vLeesVerder").isVisible()) await page.locator("#vLeesVerder").click();
  await expect(f.getByRole("img", { name: /Jericho/ })).toBeVisible();
  expect(await page.evaluate(() => { const ids = [...document.querySelectorAll("#p-verhalen .tafereel")].map((e) => (e as HTMLElement).dataset.tf); return new Set(ids).size === ids.length; })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("Samen ontdekken: het tafereel staat ook bij de stap en in het verhaal", async ({ page }) => {
  const errors = watchErrors(page);
  // Na het niveau uit beforeEach: één keer Samen ontdekken kiezen (init-scripts lopen in volgorde van aanmelden).
  await page.addInitScript(() => { if (sessionStorage.getItem("samenGezet")) return; sessionStorage.setItem("samenGezet", "1"); localStorage.setItem("bijbelreis:niveau", JSON.stringify("a")); });
  await page.goto("/bijbelreis#intocht/5");
  await expect(page.locator("body")).toHaveAttribute("data-niveau", "a");
  await expect(beeld(page)).toHaveAttribute("data-tf", "jericho");
  await expect(beeld(page).getByRole("img", { name: /Jericho/ })).toBeVisible();
  // In het verhaal: bij een verhaalstap die bij een kaartstap met een tafereel hoort, staat het beeld onder de tekst.
  await page.goto("/bijbelreis#v39");
  await expect(page.locator(".verhaal.samen")).toBeVisible();
  let gevonden = false;
  for (let i = 0; i < 12 && !gevonden; i++) {
    gevonden = (await page.locator("#p-verhalen .tafereel").count()) > 0;
    if (gevonden || !(await page.locator("#aVerder").count())) break;
    await page.locator("#aVerder").click();
  }
  if (await page.evaluate(() => !!document.querySelector(".verhaal.samen .a-stap, .verhaal.samen #vQuiz"))) expect(gevonden, "geen tafereel in het Samen-verhaal van Jericho").toBe(true);
  expect(errors).toEqual([]);
});
