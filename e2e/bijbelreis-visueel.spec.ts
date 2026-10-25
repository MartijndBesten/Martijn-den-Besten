import { expect, test, type Page } from "@playwright/test";

// Visuele regressietest van de Bijbelreis (3.1): de belangrijkste schermen op desktop, telefoon en tablet.
// Vaste voortgang, vaste volgorde, geen animaties. Nieuwe referentiebeelden na een bewuste ontwerpwijziging:
//   npx playwright test bijbelreis-visueel --update-snapshots
test.use({ reducedMotion: "reduce" });

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

const SCHERMEN: [string, string, string?][] = [
  ["start", "/bijbelreis"],
  ["reis", "/bijbelreis#terugkeer/4"],
  ["verhaal", "/bijbelreis#v26"],
  ["paspoort", "/bijbelreis#ruth", "Paspoort"],
];
for (const [naam, url, tab] of SCHERMEN) {
  test(`visueel: ${naam}`, async ({ page }) => {
    await voorbereid(page);
    await page.goto(url);
    if (tab) await page.getByRole("tab", { name: tab }).click();
    await stil(page);
    await expect(page).toHaveScreenshot(`${naam}.png`, OPTIES);
  });
}
