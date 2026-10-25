import { expect, test, type Page } from "@playwright/test";

// De Bijbelreis is een statische pagina (public/bijbelreis.html) met eigen JavaScript; deze tests lopen de
// belangrijkste routes door: diepe links, voortgang bewaren, tabbladen, Bijbeltekst, speurtocht en de kaart.

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test("diepe link naar een stap opent die stap en het kruimelpad", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#jozef/4");
  await expect(page.locator("#sTitle")).toHaveText(/^4\. /);
  await expect(page.locator("#sCrumb")).toContainText("Stap 4 van");
  await expect(page.locator("#leesBtn")).toBeVisible();
  expect(errors).toEqual([]);
});

test("bestaande stempels uit de vorige versie blijven bewaard en nieuwe worden opgeslagen", async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("gezet")) {
      localStorage.setItem("bijbelreis:gezien", JSON.stringify(["genesis:abraham:0", "exodus:mozes:2"]));
      localStorage.setItem("bijbelreis:best:genesis:alles", "7");
      sessionStorage.setItem("gezet", "1");
    }
  });
  await page.goto("/bijbelreis#abraham");
  await page.locator("#next2").click();
  await page.locator("#next2").click();
  await expect(page.locator("#sCrumb")).toContainText("Stap 2 van");
  await page.reload();
  const seen = await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien") || "[]"));
  expect(seen).toEqual(expect.arrayContaining(["genesis:abraham:0", "genesis:abraham:1", "exodus:mozes:2"]));
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect(page.locator("#pasText")).toContainText("Je hebt 3 van de");
  await expect(page.locator("#bestText")).toContainText("7/10");
});

test("tabbladen: tijdlijn, wie is wie, hoe ver en boekenkast", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#jakob");
  await page.getByRole("tab", { name: "Tijdlijn" }).click();
  await expect(page.locator("#p-tijd")).toContainText("Genesis 1–11 krijgt geen jaartal");
  await expect(page.locator("#p-tijd .tl-item.cur")).toContainText("Jakob");
  await page.getByRole("tab", { name: "Wie is wie" }).click();
  await expect(page.locator("#wieInfo")).not.toBeEmpty();
  await page.getByRole("tab", { name: "Reis" }).click();
  await page.getByRole("button", { name: "Hoe ver?" }).click();
  await expect(page.locator("#tripKm")).toContainText("km");
  await page.getByRole("tab", { name: "Reis" }).click();
  await page.getByRole("button", { name: "Alle 66 boeken" }).click();
  const kast = page.getByRole("dialog", { name: "De Bijbel: 66 boeken" });
  await expect(kast).toBeVisible();
  await expect(kast.locator(".kb")).toHaveCount(66);
  await kast.getByRole("button", { name: /Exodus/ }).click();
  await expect(kast).toBeHidden();
  await expect(page.locator("#sRef")).toContainText("Exodus");
  expect(errors).toEqual([]);
});

test("Bijbeltekst opent als venster, Escape sluit en de focus keert terug", async ({ page }) => {
  await page.goto("/bijbelreis#ruth/1");
  await page.locator("#leesBtn").click();
  const lade = page.getByRole("dialog");
  await expect(lade).toBeVisible();
  await expect(page.locator("#verzen")).toContainText("Ruth");
  await page.keyboard.press("Escape");
  await expect(lade).toBeHidden();
  await expect(page.locator("#leesBtn")).toBeFocused();
});

test("speurtocht: een meerkeuzevraag beantwoorden geeft uitleg met verwijzing", async ({ page }) => {
  await page.goto("/bijbelreis#ruth");
  await page.getByRole("tab", { name: "Speurtocht" }).click();
  await page.locator("#qGo").click();
  for (let i = 0; i < 10; i++) {
    if (await page.locator(".opt").count()) break;
    await page.mouse.click(300, 300);
    await page.locator("#qNext").click();
  }
  // Meerkeuze: één klik; volgorde: alle items aantikken.
  const n = (await page.locator("#qUndo").count()) ? await page.locator(".opt").count() : 1;
  for (let i = 0; i < n; i++) await page.locator(".opt:not(:has(.num))").first().click();
  await expect(page.locator(".feedback")).toBeVisible();
});

test("kaart: Toen/Nu, legenda en een plaats met zekerheid", async ({ page, isMobile }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#abraham/4");
  await page.locator("#nuBtn").click();
  await expect(page.locator(".border").first()).toBeAttached();
  await page.locator("#toenBtn").click();
  await page.locator("#legendBtn").click();
  await expect(page.locator("#legend")).toContainText("Identificeerbaar");
  await expect(page.locator("#legend")).toContainText("Onbekend");
  await page.locator("#legendBtn").click();
  if (isMobile) {
    await page.locator("#fullBtn").click();
    await expect(page.locator("body")).toHaveClass(/mapfull/);
    await page.locator("#fullBtn").click();
    await expect(page.locator("body")).not.toHaveClass(/mapfull/);
  }
  // Via het toetsenbord (focus + Enter): werkt ook als de kaart nog beweegt na het wisselen van grote kaart.
  const bethel = page.locator(".leaflet-marker-icon[title='Bethel']");
  await bethel.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".leaflet-popup")).toContainText(/Identificeerbaar|Waarschijnlijk|Betwist|Onbekend/);
  expect(errors).toEqual([]);
});

test("verhalen: overzicht, zoeken, een geschiedenis openen en de vragen maken", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis");
  await expect(page.getByRole("tab", { name: "Verhalen" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#p-verhalen")).toContainText("150");
  await page.locator("#vZoek").fill("Jona");
  await expect(page.locator("#vLijst .vitem").first()).toBeVisible();
  const first = page.locator("#vLijst button.vitem").first();
  if (await first.count()) {
    await first.click();
    await expect(page.locator("#p-verhalen .verhaal")).toBeVisible();
    await page.locator("#vqStart").click();
    for (let i = 0; i < 5; i++) {
      await page.locator("#vQuiz .opt").first().click();
      await page.locator("#vqVolgende").click();
      if (await page.locator("#vQuiz").getByText(/Klaar:/).count()) break;
    }
    await expect(page.locator("#vQuiz")).toContainText("Klaar:");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:verhalen") || "{}"));
    expect(Object.keys(stored).length).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});
