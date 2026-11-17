import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

for (const path of ["/", "/control-center", "/museum", "/over", "/loket", "/bureau", "/certificaat", "/bijbelreis"]) {
  test(`toegankelijkheid ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForTimeout(600);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  });
}

// Bijbelreis: de hoofdschermen (elk tabblad, een geschiedenis, een reisstap, de boekenkast) op telefoon én desktop
// (project ‘mobiel’ en ‘desktop’), met de regels van WCAG 2.2 AA. Bevindingen en uitleg: docs/bijbelreis-a11y/README.md.
const BIJBELREIS: [string, string, string?][] = [
  ["Verhalen", "#verhalen", "#t-verhalen"],
  ["geschiedenis 26", "#v26"],
  ["reisstap", "#abraham/2"],
  ["Wie is wie", "#abraham/2", "#t-wie"],
  ["Tijdlijn", "#abraham/2", "#t-tijd"],
  ["Speurtocht", "#abraham/2", "#t-quiz"],
  ["Paspoort", "#abraham/2", "#t-pas"],
];
// Bekend en doorgegeven (spoor Leren, 17-11-2026): in het paspoort heeft de kop van een deel met kleur ‘oker’ te weinig
// contrast (var(--oker-deep) bestaat niet, 2,5:1; WCAG 1.4.3) en staat de tekst in een stempel niet in de naam van de
// knop (WCAG 2.5.3). Haal deze uitzondering weg zodra dat is opgelost.
const BEKEND: Record<string, string[]> = { Paspoort: ["#stamps"] };
async function bijbelreisAxe(page: Page, ookUit: string[] = []) {
  let axe = new AxeBuilder({ page });
  for (const sel of ookUit) axe = axe.exclude(sel);
  const results = await axe
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    // Bekend en doorgegeven (spoor Reis, 17-11-2026): de zichtbare tekst van de keuzeregel boven het stapblad op de
    // telefoon staat niet in de toegankelijke naam (WCAG 2.5.3). Haal deze uitzondering weg zodra dat is opgelost.
    .exclude("#kiesBtn")
    .exclude("#kiesLade")
    .analyze();
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
}
for (const [naam, hash, tab] of BIJBELREIS) {
  test(`toegankelijkheid Bijbelreis: ${naam}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/bijbelreis" + hash);
    await expect(page.locator("#map .land").first()).toBeAttached();
    if (tab) await page.locator(tab).click();
    await page.waitForTimeout(600);
    expect(await bijbelreisAxe(page, BEKEND[naam])).toEqual([]);
  });
}
test("toegankelijkheid Bijbelreis: boekenkast", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1440) <= 900, "op de telefoon zit de boekenkast achter het keuzeblad");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/bijbelreis#abraham/2");
  await page.locator("#kastBtn").click();
  await expect(page.locator("#kast")).toBeVisible();
  expect(await bijbelreisAxe(page)).toEqual([]);
});

test("Bijbelreis met het toetsenbord: tabbladen, één hoofdgebied en focus nooit onder de vaste balken", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/bijbelreis#v26");
  await expect(page.locator("#vTitel")).toHaveText("Droog door de Schelfzee");
  await expect(page.getByRole("main")).toHaveCount(1);
  // Tabbladen: pijltjes, Home en End (ARIA-patroon).
  await page.locator('[role="tab"][aria-selected="true"]').focus();
  await page.keyboard.press("End");
  await expect(page.locator("#t-pas")).toBeFocused();
  await expect(page.locator("#t-pas")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(page.locator("#t-verhalen")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#t-reis")).toBeFocused();
  // Terug naar de geschiedenis en dan met Tab door de inhoud: elk element met focus is (deels) te zien en niet
  // helemaal bedekt door de vaste kop of de onderbalk op de telefoon (WCAG 2.4.11).
  await page.goto("about:blank");
  await page.goto("/bijbelreis#v26");
  await expect(page.locator("#vTitel")).toBeVisible();
  await page.locator("#vTitel").evaluate((el) => (document.activeElement as HTMLElement | null)?.blur());
  const verborgen: string[] = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press("Tab");
    const r = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body || el.closest("#map")) return null;
      const rc = el.getBoundingClientRect();
      const pts = [[rc.left + rc.width / 2, rc.top + rc.height / 2], [rc.left + 2, rc.top + 2], [rc.right - 2, rc.bottom - 2]];
      const vrij = pts.some(([x, y]) => { const t = document.elementFromPoint(x, y); return !!t && (el.contains(t) || t.contains(el)); });
      return vrij ? null : `${el.tagName.toLowerCase()}#${el.id} «${(el.textContent || "").trim().slice(0, 30)}»`;
    });
    if (r) verborgen.push(r);
  }
  expect(verborgen).toEqual([]);
});

test("certificaat kan als PNG gedownload worden", async ({ page }) => {
  await page.goto("/certificaat");
  await page.getByLabel("Naam op het certificaat").fill("Test Bezoeker");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download als afbeelding/ }).click()]);
  expect(download.suggestedFilename()).toMatch(/^certificaat-MdB-\d+\.png$/);
});
