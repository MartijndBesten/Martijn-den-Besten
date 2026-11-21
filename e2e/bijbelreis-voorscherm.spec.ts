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

// De kersttijd (eerste adventszondag tot en met 6 januari; public/bijbelreis/seizoen.js): op het welkom staat het deel van
// deze week van de kerstreis, met dezelfde knop als de seizoenskaart (‘Lees deel 2’). De datum komt van het apparaat.
test("kersttijd: het welkom wijst het deel van deze week aan; vóór advent en na 6 januari niet", async ({ browser }) => {
  for (const [tijd, verwacht] of [
    ["2026-11-28T21:00:00", null],
    ["2026-11-29T00:05:00", "Lees deel 1: De belofte: van Adam tot David"],
    ["2026-12-25T10:00:00", "Lees deel 4: De geboorte in Bethlehem"],
    ["2027-01-07T08:00:00", null],
  ] as const) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.clock.install({ time: new Date(tijd) });
    await page.goto("/bijbelreis");
    await expect(scherm(page).locator(".vs-hoofd")).toContainText("Begin de reis");
    const knop = scherm(page).locator(".vs-seizoen");
    if (!verwacht) { await expect(knop, tijd).toHaveCount(0); await ctx.close(); continue; }
    await expect(knop, tijd).toContainText("Advent en Kerst · deze week");
    await expect(knop.locator("b"), tijd).toHaveText(verwacht);
    // Op een telefoon onder de grote knop, vóór ‘Kies een geschiedenis’.
    expect(await scherm(page).locator(".vs-knoppen > button").evaluateAll((bs) => bs.map((b) => b.className))).toEqual([expect.stringContaining("vs-hoofd"), expect.stringContaining("vs-seizoen"), "btn vs-tweede"]);
    await knop.click();
    await expect(scherm(page)).toBeHidden();
    await expect(page).toHaveURL(tijd.startsWith("2026-11") ? /#kerst-belofte$/ : /#kerst-geboorte$/);
    await expect(page.locator("body")).toHaveAttribute("data-thema", "kerst");
    await ctx.close();
  }
});

test("kersttijd: wie in de kerstreis bezig was, krijgt ‘Verder met’ daarheen; geen twee knoppen naar dezelfde stap", async ({ browser }) => {
  const open = async (opslag: Record<string, unknown>) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.clock.install({ time: new Date("2026-12-06T10:00:00") });
    await page.addInitScript((o) => { try { if (!sessionStorage.getItem("t")) { sessionStorage.setItem("t", "1"); Object.entries(o).forEach(([k, v]) => localStorage.setItem("bijbelreis:" + k, JSON.stringify(v))); } } catch { /* about:blank */ } }, opslag);
    await page.goto("/bijbelreis");
    await expect(scherm(page)).toBeVisible();
    return { ctx, page };
  };
  // Vorige week deel 1 gelezen: verder waar je was, en het deel van deze week.
  const a = await open({ gezien: ["kerst:kerst-belofte:0", "kerst:kerst-belofte:1"], laatst: "kerst:kerst-belofte:1", huidig: { k: "kerst:kerst-belofte:1" } });
  await expect(scherm(a.page).locator(".vs-hoofd")).toContainText("Verder met:");
  await expect(scherm(a.page).locator(".vs-hoofd")).toContainText("De belofte: van Adam tot David –");
  await expect(scherm(a.page).locator(".vs-seizoen b")).toHaveText("Lees deel 2: Van David tot Jozef");
  const axe = await new AxeBuilder({ page: a.page }).include("#voorscherm").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  await a.ctx.close();
  // Bezig in het deel van deze week: ‘Verder met’ gaat al daarheen, dus geen tweede knop.
  const b = await open({ verhalen: { 30: { g: 1 } }, gezien: ["kerst:kerst-koningen:0"], laatst: "kerst:kerst-koningen:0", huidig: { k: "kerst:kerst-koningen:0" } });
  await expect(scherm(b.page).locator(".vs-hoofd")).toContainText("Van David tot Jozef –");
  await expect(scherm(b.page).locator(".vs-seizoen")).toHaveCount(0);
  await scherm(b.page).locator(".vs-hoofd").click();
  await expect(b.page).toHaveURL(/#kerst-koningen\/1$/);
  await b.ctx.close();
});
