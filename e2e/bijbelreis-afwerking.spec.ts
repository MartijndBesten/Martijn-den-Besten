import { expect, test, type Page } from "@playwright/test";

// Afwerking 17-11-2026: tijdlijn (Samen ontdekken) met aanklikbare onderwerpen, uitleg over ‘enkele aanhalingstekens’ bij
// een verhaal, de boekenrij die de naam nooit half wegschuift, de kaart die tot de rand land toont, en de verantwoording.
const zetNiveau = (page: Page, n: "a" | "b" | "c") =>
  page.addInitScript((x) => { try { if (sessionStorage.getItem("niveauGezet")) return; sessionStorage.setItem("niveauGezet", "1"); localStorage.setItem("bijbelreis:niveau", JSON.stringify(x)); localStorage.setItem("bijbelreis:welkomWeg", "true"); } catch {} }, n);
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

test("tijdlijn bij Samen ontdekken: elk onderwerp klapt open en een geschiedenis daarin opent", async ({ page }) => {
  const errors = watchErrors(page);
  await zetNiveau(page, "a");
  await page.goto("/bijbelreis#v26");
  await page.getByRole("tab", { name: "Tijdlijn" }).click();
  const items = page.locator("#p-tijd .samentijd > li");
  await expect(items).toHaveCount(16);
  // Het onderwerp waar je bent staat open; een ander onderwerp is dicht en gaat open met een tik.
  await expect(page.locator("#p-tijd .samentijd details[open]")).toHaveCount(1);
  const dicht = await page.locator("#p-tijd .samentijd > li").evaluateAll((l) => l.findIndex((li) => !li.querySelector("details")!.open));
  const ander = items.nth(dicht).locator("details");
  const naam = (await ander.locator("summary b").innerText()).trim();
  await ander.locator("summary").click();
  await expect(ander).toHaveAttribute("open", "");
  const eerste = ander.locator(".st-lijst [data-v]").first();
  await expect(eerste).toBeVisible();
  const titel = (await eerste.innerText()).trim();
  await eerste.click();
  await expect(page.locator(".verhaal h2, .verhaal h1").first()).toContainText(titel);
  expect(naam.length).toBeGreaterThan(2);
  expect(errors).toEqual([]);
});

test("bij een verhaal met een letterlijk citaat staat wat de enkele aanhalingstekens betekenen", async ({ page }) => {
  await zetNiveau(page, "c");
  await page.goto("/bijbelreis#v26");
  await expect(page.locator(".verhaal #vVertelling")).toContainText("‘");
  await expect(page.locator(".verhaal .citaatnoot")).toBeVisible();
  await expect(page.locator(".verhaal .citaatnoot")).toContainText("letterlijk zo in de Statenvertaling");
});

test("verantwoording: korte uitleg van de kaart met de peildatum, het lange stuk achter een knopje", async ({ page }) => {
  await zetNiveau(page, "b");
  await page.goto("/bijbelreis#v26");
  const ouders = page.locator("details.parents").first();
  await ouders.locator("> summary").click();
  await expect(ouders).toContainText("peildatum 15 november 2026");
  await expect(ouders).toContainText("De Bijbelse boodschap wordt niet veranderd");
  await expect(ouders).toContainText("niet de werkelijke lengte van de reis");
  await expect(ouders).toContainText("je IP-adres wordt niet opgeslagen");
  const meer = ouders.locator("details.meerinfo");
  await expect(meer.locator("p")).toBeHidden();
  await meer.locator("> summary").click();
  await expect(meer.locator("p")).toBeVisible();
  await expect(meer).toContainText("Nederland op de peildatum, 15 november 2026, niet");
});

test("boekenrij op een breed scherm: de gekozen boeknaam staat helemaal in beeld", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "alleen het brede scherm");
  await page.setViewportSize({ width: 1919, height: 945 });
  await zetNiveau(page, "b");
  await page.goto("/bijbelreis#begin");
  const rij = page.locator("#boeken");
  await expect(rij.locator('[aria-pressed="true"]')).toBeVisible();
  const [r, b] = await Promise.all([rij.boundingBox(), rij.locator('[aria-pressed="true"]').boundingBox()]);
  expect(b!.x).toBeGreaterThanOrEqual(r!.x - 1);
  expect(b!.x + b!.width).toBeLessThanOrEqual(r!.x + r!.width + 1);
});

test("Samen ontdekken: Vorige/Verder staan bij elke stap van een geschiedenis op dezelfde plek", async ({ page }) => {
  await zetNiveau(page, "a");
  await page.goto("/bijbelreis#v34");
  const verder = page.locator("#aVerder");
  await expect(verder).toBeVisible();
  const posities: number[] = [];
  for (let k = 0; k < 12; k++) {
    const b = await verder.boundingBox();
    posities.push(Math.round(b!.y));
    // De knop staat altijd in het scherm (telefoon: vast boven de onderbalk).
    expect(b!.y + b!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    if ((await verder.innerText()).includes("vragen")) break;
    await verder.click();
    await expect(page.locator("#aStap")).toBeVisible();
  }
  expect(posities.length).toBeGreaterThan(3);
  expect(Math.max(...posities) - Math.min(...posities)).toBeLessThanOrEqual(2);
});
