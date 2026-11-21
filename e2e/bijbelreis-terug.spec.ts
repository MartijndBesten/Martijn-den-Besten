import { expect, test, type Page } from "@playwright/test";
import { zonderVoorscherm } from "./voorscherm";

zonderVoorscherm(test);

// ‘Terug’ op de telefoon (telefoontest op een Samsung A15, 16-11-2026). Elke stap, elk onderdeel en elk venster verving
// het adres, dus de terugknop of terugveeg van de telefoon haalde je altijd de Bijbelreis uit. Nu:
// - een ander onderdeel, deel of geschiedenis is een nieuwe plek: ‘terug’ gaat daarheen terug;
// - een andere stap in hetzelfde deel niet (daarvoor zijn ◀ en Verder);
// - een venster (Kies een reis, Lees meer, Voor wie, Mis je iets) sluit bij ‘terug’, en de plek blijft staan.
// Ook getest: ‘Begin de reis’ start bij stap 1, een tik op ‘3 van 25’ toont de stappen, een persoon begint bij de naam.

test.use({ reducedMotion: "reduce" });
test.skip(({ isMobile }) => !isMobile, "alleen op de telefoon (project ‘mobiel’)");

const open = async (page: Page, hash = "") => { await page.goto("about:blank"); await page.goto("/bijbelreis" + (hash ? "#" + hash : "")); await expect(page.locator("#map .land").first()).toBeAttached(); };
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
const tab = (page: Page, naam: string) => page.locator(".tabs").getByRole("tab", { name: naam });
const verder = async (page: Page) => (await page.locator("#next2").isVisible() ? page.locator("#next2") : page.locator("#next")).click();
const terug = async (page: Page) => { await page.goBack({ waitUntil: "commit" }).catch(() => {}); await page.waitForTimeout(150); };

test("terug gaat door de plekken in de Bijbelreis, niet de site uit", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  await page.locator("#welkom .st-knop").click();
  await expect(page).toHaveURL(/#abraham\/1$/);
  await expect(page.locator("#sTitle")).toHaveText("1. Weg uit Ur");
  // Twee stappen verder: dat is dezelfde plek.
  await verder(page); await verder(page);
  await expect(page).toHaveURL(/#abraham\/3$/);
  await tab(page, "Wie is wie").click();
  await expect(tab(page, "Wie is wie")).toHaveAttribute("aria-selected", "true");
  await terug(page);
  await expect(tab(page, "Reis")).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/#abraham\/3$/);
  await expect(page.locator("#sTitle")).toHaveText("3. Het eerste altaar");
  await terug(page);
  await expect(page).toHaveURL(/\/bijbelreis$/);
  await expect(tab(page, "Verhalen")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#vLijst [data-v]").first()).toBeVisible();
  // En weer vooruit.
  await page.goForward(); await page.waitForTimeout(150);
  await expect(tab(page, "Reis")).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/#abraham\/3$/);
  expect(errors).toEqual([]);
});

test("terug sluit eerst een open venster; de plek blijft staan", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "abraham/2");
  const blad = page.getByRole("dialog", { name: "Kies een reis" });
  await page.locator("#kiesBtn").click();
  await expect(blad).toBeVisible();
  await terug(page);
  await expect(blad).toBeHidden();
  await expect(page).toHaveURL(/#abraham\/2$/);
  // Lees meer
  await page.locator("#bladBtn").click();
  await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "true");
  await terug(page);
  await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/#abraham\/2$/);
  // Reisniveau
  await page.locator("#niveauBtn").click();
  await expect(page.locator("#niveauKeuze")).toBeVisible();
  await terug(page);
  await expect(page.locator("#niveauKeuze")).toBeHidden();
  await expect(page).toHaveURL(/#abraham\/2$/);
  // Een venster dat met de eigen knop dicht gaat, laat geen extra plek achter: Verder werkt gewoon door.
  await page.locator("#bladBtn").click();
  await page.locator("#bladBtn").click();
  await expect(page.locator("#bladBtn")).toHaveAttribute("aria-expanded", "false");
  await verder(page);
  await expect(page).toHaveURL(/#abraham\/3$/);
  expect(errors).toEqual([]);
});

test("een geschiedenis openen en terug naar de lijst", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  await page.locator("#vLijst [data-v]").first().click();
  await expect(page).toHaveURL(/#v1$/);
  await terug(page);
  await expect(page).toHaveURL(/\/bijbelreis$/);
  await expect(page.locator("#vLijst [data-v]").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("‘3 van 25’ toont de stappen van het deel; een stap kiezen sluit het blad", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "abraham/3");
  await page.locator("#kiesBtn").click();
  const blad = page.getByRole("dialog", { name: "Kies een reis" });
  await expect(blad.locator("#kiesStappenLabel")).toHaveText("Stappen van Abraham");
  await expect(blad.locator(".ks-stap")).toHaveCount(25);
  await expect(blad.locator('.ks-stap[aria-current="step"]')).toContainText("Het eerste altaar");
  await expect(blad.locator('.ks-stap[aria-current="step"]')).toBeInViewport();
  await blad.locator('.ks-stap[data-ks="5"]').click();
  await expect(blad).toBeHidden();
  await expect(page).toHaveURL(/#abraham\/6$/);
  await expect(page.locator("#sTitle")).toHaveText(/^6\. /);
  // Het blad is dicht en laat geen plek achter: terug gaat niet terug naar het blad.
  await terug(page);
  await expect(blad).toBeHidden();
  expect(errors).toEqual([]);
});

test("een persoon openen begint bij de naam, onder de kop", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "abraham/1");
  await page.locator("#bladBtn").click();
  await page.locator("#sWho").getByRole("button", { name: /Abram/ }).click();
  await expect(tab(page, "Wie is wie")).toHaveAttribute("aria-selected", "true");
  const kop = page.locator("#wieInfo h3");
  await expect(kop).toHaveText("Abraham");
  await page.waitForTimeout(300);
  const { top, kopOnder } = await page.evaluate(() => ({ top: document.querySelector("#wieInfo h3")!.getBoundingClientRect().top, kopOnder: document.querySelector(".kop")!.getBoundingClientRect().bottom }));
  expect(top).toBeGreaterThanOrEqual(kopOnder);
  await expect(kop).toBeInViewport();
  // En terug naar de stap.
  await terug(page);
  await expect(tab(page, "Reis")).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/#abraham\/1$/);
  expect(errors).toEqual([]);
});
