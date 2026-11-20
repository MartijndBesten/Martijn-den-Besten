import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Het voorscherm: welkom bij het openen zonder link (Martijn, 17-11-2026). Eén keer per bezoek, niet bij een diepe link,
// niet bij herladen; ‘Verder met’ als er voortgang is, anders ‘Begin de reis’.
const scherm = (page: import("@playwright/test").Page) => page.locator("#voorscherm");

test("nieuw bezoek: welkom met ‘Begin de reis’, onderdelen, de atlas eronder is onbereikbaar tot je kiest", async ({ page }) => {
  await page.goto("/bijbelreis");
  await expect(scherm(page)).toBeVisible();
  await expect(scherm(page).getByRole("heading", { level: 2 })).toHaveText("Op reis door de Bijbel");
  await expect(scherm(page).locator(".vs-hoofd")).toContainText("Begin de reis");
  await expect(scherm(page).locator(".vs-deel")).toHaveCount(6);
  // De atlas eronder is inert (geen focus, niet aanklikbaar).
  expect(await page.evaluate(() => (document.querySelector(".kop") as HTMLElement).inert)).toBe(true);
  const axe = await new AxeBuilder({ page }).include("#voorscherm").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  // Begin de reis: de eerste stap van Abraham.
  await scherm(page).locator(".vs-hoofd").click();
  await expect(scherm(page)).toBeHidden();
  await expect(page).toHaveURL(/#abraham\/1$/);
  expect(await page.evaluate(() => (document.querySelector(".kop") as HTMLElement).inert)).toBe(false);
  // Herladen: geen welkom meer (zelfde bezoek).
  await page.goto("/bijbelreis");
  await expect(page.locator("#t-verhalen")).toBeVisible();
  await expect(scherm(page)).toBeHidden();
});

test("terugkomen: ‘Verder met’ de laatste geschiedenis; een onderdeel kiezen opent dat onderdeel; Escape sluit", async ({ page }) => {
  await page.addInitScript(() => { try { if (!sessionStorage.getItem("t")) { localStorage.setItem("bijbelreis:huidig", JSON.stringify({ v: 32 })); sessionStorage.setItem("t", "1"); } } catch { /* about:blank */ } });
  await page.goto("/bijbelreis");
  await expect(scherm(page).locator(".vs-hoofd")).toContainText("Verder met:");
  await expect(scherm(page).locator(".vs-hoofd")).toContainText("De Grote Verzoendag");
  await scherm(page).locator("#vs-tijd").click();
  await expect(scherm(page)).toBeHidden();
  await expect(page.locator("#t-tijd")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#t-tijd")).toBeFocused();
  // Nieuw bezoek (nieuw tabblad = nieuwe sessionStorage): weer welkom; Escape gaat naar de atlas.
  const p2 = await page.context().newPage();
  await p2.goto("/bijbelreis");
  await expect(scherm(p2)).toBeVisible();
  await p2.keyboard.press("Escape");
  await expect(scherm(p2)).toBeHidden();
  await expect(p2.locator("#t-verhalen")).toHaveAttribute("aria-selected", "true");
  // ‘Verder met’ in de lijst staat er nog gewoon.
  await expect(p2.locator("#welkom .verdermet")).toContainText("De Grote Verzoendag");
});

test("een link naar een verhaal of stap opent meteen, zonder welkom", async ({ page }) => {
  await page.goto("/bijbelreis#v26");
  await expect(page.locator("#vTitel")).toHaveText("Droog door de Schelfzee");
  await expect(scherm(page)).toBeHidden();
  const p2 = await page.context().newPage();
  await p2.goto("/bijbelreis#abraham/4");
  await expect(p2.locator("#t-reis")).toHaveAttribute("aria-selected", "true");
  await expect(scherm(p2)).toBeHidden();
});
