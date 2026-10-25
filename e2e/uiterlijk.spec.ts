import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("uiterlijk kiezen en onthouden", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ivoor");
  if (isMobile) {
    await page.getByRole("button", { name: "Menu openen" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("radio", { name: /Blauwdruk/ }).click();
    await page.getByRole("button", { name: "Menu sluiten" }).click();
  } else {
    await page.getByRole("button", { name: /Uiterlijk kiezen/ }).click();
    await page.getByRole("radio", { name: /Blauwdruk/ }).click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "blauwdruk");
  await page.reload();
  // Het vroege script zet het thema al vóór React laadt.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "blauwdruk");
  if (!isMobile) {
    await page.getByRole("button", { name: /Uiterlijk kiezen, nu: Blauwdruk/ }).click();
    await expect(page.getByRole("radio", { name: /Blauwdruk/ })).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("radiogroup", { name: "Uiterlijk van de website" })).toBeHidden();
  }
});

for (const theme of ["blauwdruk", "nacht"] as const) {
  for (const path of ["/", "/control-center", "/museum"]) {
    test(`toegankelijkheid ${path} in ${theme}`, async ({ page }) => {
      await page.addInitScript((t) => window.localStorage.setItem("mdb:uiterlijk", JSON.stringify(t)), theme);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await page.waitForTimeout(500);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    });
  }
}
