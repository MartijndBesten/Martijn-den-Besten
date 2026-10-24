import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/control-center", "/museum", "/over", "/loket", "/bureau", "/certificaat"]) {
  test(`toegankelijkheid ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForTimeout(600);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  });
}

test("certificaat kan als PNG gedownload worden", async ({ page }) => {
  await page.goto("/certificaat");
  await page.getByLabel("Naam op het certificaat").fill("Test Bezoeker");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download als afbeelding/ }).click()]);
  expect(download.suggestedFilename()).toMatch(/^certificaat-MdB-\d+\.png$/);
});
