import { existsSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// Visuele regressietest van de Bijbelreis (3.1): de belangrijkste schermen op desktop, telefoon en tablet.
// Vaste voortgang, vaste volgorde, geen animaties.
//
// Vaste omgeving: deze test draait alleen in het Playwright-image dat in scripts/visueel.sh en in de CI-job
// ‘Visuele regressie’ op digest is vastgezet (Playwright 1.63.0, Chromium 153.0.8010.12, Ubuntu 24.04 met dezelfde
// systeemlettertypen). Buiten dat image slaat hij zichzelf over: een andere omgeving tekent tekens buiten de
// webfonts (▶, ✓, ‘ ’) met andere lettertypen en breekt regels dan net anders af.
//   npm run test:visueel                          vergelijken
//   npm run test:visueel -- --update-snapshots    nieuwe referentiebeelden
// Nieuwe referentiebeelden alleen na een bewuste ontwerpwijziging én nadat elk nieuw beeld inhoudelijk is bekeken
// (staat alles erop, klopt de tekst, niets afgesneden of overlappend). Leg die controle vast in
// docs/bijbelreis-audit/ontwerp-3.1.md. Nooit ‘actual’-beelden uit een mislukte CI-run overnemen zonder die controle.
const BEELD = "/ms-playwright/.docker-info";
const inVasteOmgeving = process.env.BIJBELREIS_VISUEEL === "1";
test.skip(!inVasteOmgeving, "Alleen in het vaste Playwright-image: npm run test:visueel");
test.use({ reducedMotion: "reduce" });
test.beforeAll(async ({ browser }) => {
  // Bewaakt de vaste omgeving: een ander image of een andere Chromium geeft andere pixels.
  expect(existsSync(BEELD) && readFileSync(BEELD, "utf8"), "draait niet in het Playwright-image").toContain("v1.63.0");
  expect(browser.version()).toBe("153.0.8010.12");
});

async function voorbereid(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0.999999;
    if (!sessionStorage.getItem("gezet")) {
      localStorage.setItem("bijbelreis:gezien", JSON.stringify(["ezra:terugkeer:0", "ezra:terugkeer:1", "ezra:terugkeer:2", "ezra:terugkeer:3", "ezra:terugkeer:4", "genesis:abraham:0"]));
      localStorage.setItem("bijbelreis:laatst", JSON.stringify("ezra:terugkeer:4"));
      localStorage.setItem("bijbelreis:verhalen", JSON.stringify({ 3: { g: 1, q: 4 }, 81: { g: 1 } }));
      localStorage.setItem("bijbelreis:best:ruth:alles", "8");
      sessionStorage.setItem("gezet", "1");
    }
  });
}
// Wacht tot lettertypen, ondergrond en reliëf geladen zijn en de kaart stilstaat.
async function stil(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#map .land").first()).toBeAttached();
  await page.waitForFunction(() => [...document.querySelectorAll("img.relief")].every((i) => (i as HTMLImageElement).complete));
  await page.waitForTimeout(900);
}
const OPTIES = { maxDiffPixelRatio: 0.02, animations: "disabled" as const };

const SCHERMEN: [string, string, ((p: Page) => Promise<void>)?][] = [
  ["start", "/bijbelreis"],
  ["wereld", "/bijbelreis", (p) => p.locator("#wereldBtn").click()],
  ["reis", "/bijbelreis#terugkeer/4"],
  ["verhaal", "/bijbelreis#v26"],
  ["paspoort", "/bijbelreis#ruth", (p) => p.getByRole("tab", { name: "Paspoort" }).click()],
];
for (const [naam, url, actie] of SCHERMEN) {
  test(`visueel: ${naam}`, async ({ page }) => {
    await voorbereid(page);
    await page.goto(url);
    if (actie) await actie(page);
    await stil(page);
    await expect(page).toHaveScreenshot(`${naam}.png`, OPTIES);
  });
}
