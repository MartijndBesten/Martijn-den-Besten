import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Vindbaarheid (docs/bijbelreis-vindbaar/README.md): per geschiedenis een gewone pagina die zoekmachines kunnen lezen,
// met een knop naar de geschiedenis in de atlas. Op bijbelreis.nl staan ze op /verhaal/<nr>-<slug>; lokaal en in de CI
// (hoofdsite-worker) op het pad in de build, /bijbelreis/verhaal/<nr>-<slug>. De worker van bijbelreis.nl is apart
// getest (tests/bijbelreis-verhalen.test.ts).
const NAAM = "26-droog-door-de-schelfzee";

test.use({ reducedMotion: "reduce" });

test("een verhaalpagina laadt zonder JavaScript-fouten en is toegankelijk", async ({ page }) => {
  const fouten: string[] = [];
  page.on("pageerror", (e) => fouten.push(String(e)));
  page.on("console", (m) => m.type() === "error" && fouten.push(m.text()));
  const r = await page.goto(`/bijbelreis/verhaal/${NAAM}`);
  expect(r?.status()).toBe(200);
  await expect(page).toHaveTitle("Droog door de Schelfzee — Bijbelreis");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Droog door de Schelfzee");
  await expect(page.getByText("Lees in je Bijbel: Exodus 14:1–15:21")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://bijbelreis.nl/verhaal/${NAAM}`);
  // Geen horizontaal schuiven, ook niet op 320 px breed (WCAG 1.4.10).
  await page.setViewportSize({ width: 320, height: 640 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  expect(fouten).toEqual([]);
});

test("de knop opent dezelfde geschiedenis in de atlas", async ({ page }) => {
  await page.goto(`/bijbelreis/verhaal/${NAAM}`);
  const knop = page.getByRole("link", { name: "Open deze geschiedenis in de Bijbelreis" }).first();
  const href = (await knop.getAttribute("href"))!;
  // Op bijbelreis.nl staat de atlas op /: de knop leidt daar naar /#v26.
  expect(new URL(href, `https://bijbelreis.nl/verhaal/${NAAM}`).href).toBe("https://bijbelreis.nl/#v26");
  // Lokaal staat dezelfde atlas op /bijbelreis; open hem met hetzelfde fragment.
  await page.goto("/bijbelreis" + new URL(href, "https://x/verhaal/").hash);
  await expect(page.locator("#vTitel")).toHaveText("Droog door de Schelfzee");
});

test("het overzicht linkt naar de verhaalpagina's", async ({ page }) => {
  await page.goto("/bijbelreis/verhalen");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Alle geschiedenissen");
  expect(await page.locator('a[href^="verhaal/"]').count()).toBeGreaterThanOrEqual(150);
  await page.getByRole("link", { name: "Droog door de Schelfzee" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Droog door de Schelfzee");
  await page.getByRole("link", { name: /Volgende/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Water, manna en kwartels in de woestijn");
});
