import { expect, test } from "@playwright/test";

test("ideeënmachine produceert ideeën en loopt vast", async ({ page }) => {
  await page.goto("/");
  const machine = page.getByRole("button", { name: /Ideeënmachine/ });
  await machine.click();
  await expect(page.locator(".idea-bubble").first()).toBeVisible();
  for (let i = 0; i < 11; i++) await machine.click();
  await expect(page.getByRole("button", { name: /Herstart de vastgelopen/ })).toBeVisible();
  await expect(page.getByRole("status").getByText("Missie voltooid")).toBeVisible();
});

test("mededelingen wisselen via de knoppen", async ({ page }) => {
  await page.goto("/");
  const msg = page.locator(".board__msg p");
  const first = await msg.textContent();
  await page.getByRole("button", { name: "Volgende mededeling" }).click();
  await expect(msg).not.toHaveText(first ?? "");
  await page.getByRole("button", { name: "Pauzeren" }).click();
  await expect(page.getByRole("button", { name: "Hervatten" })).toBeVisible();
});

test("statistieken tellen op tot fictieve waarden", async ({ page }) => {
  await page.goto("/");
  await page.locator(".stats").scrollIntoViewIfNeeded();
  await expect(page.locator(".stat--3 .counter")).toHaveText("3", { timeout: 5000 });
});

test("verrassingen: koffie, Konami-code, tijd en zegel", async ({ page }) => {
  await page.goto("/");
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.type("koffie");
  await expect(page.getByText("Verrassing: Koffiepauze")).toBeVisible();
  for (const k of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) await page.keyboard.press(k);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "nacht");
  await page.getByRole("button", { name: "tijd", exact: true }).click();
  await expect(page.getByText("Verrassing: Tijd is op")).toBeVisible();
  const seal = page.getByRole("button", { name: "Officieel zegel van het instituut" });
  for (let i = 0; i < 5; i++) await seal.click();
  await expect(page.getByText("Verrassing: Zelfcertificering")).toBeVisible();
});

test("missiepaspoort toont voortgang en onthoudt die", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Verborgen knop" }).click();
  await page.getByRole("button", { name: /Missies/ }).click();
  const dialog = page.getByRole("dialog", { name: "Uw missiepaspoort" });
  await expect(dialog).toContainText("Verrassingen gevonden: 1");
  await page.reload();
  await page.getByRole("button", { name: /Missies/ }).click();
  await expect(page.getByRole("dialog", { name: "Uw missiepaspoort" })).toContainText("Verrassingen gevonden: 1");
});

test("einde van de website", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /toch verder/ }).click();
  await expect(page.getByRole("heading", { name: "Het einde." })).toBeVisible();
  await expect(page.getByText(/O, u bent er nog/)).toBeVisible({ timeout: 9000 });
});
