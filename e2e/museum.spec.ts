import { expect, test } from "@playwright/test";

test("stemmen telt echt en eenmalig per dag", async ({ page }) => {
  await page.goto("/museum");
  const vote = page.getByRole("button", { name: /^Stem op De Uitstel-app/ });
  await expect(vote).toContainText("0 stemmen");
  await vote.click();
  const voted = page.getByRole("button", { name: /U heeft vandaag op De Uitstel-app gestemd/ });
  await expect(voted).toContainText("1 stem");
  await page.reload();
  await expect(page.getByRole("button", { name: /U heeft vandaag op De Uitstel-app gestemd/ })).toContainText("1 stem");
});

test("bordje openen in een dialoog", async ({ page }) => {
  await page.goto("/museum");
  await page.getByRole("button", { name: "Bekijk Zelfvouwende was" }).click();
  const dialog = page.getByRole("dialog", { name: "Zelfvouwende was" });
  await expect(dialog).toContainText("wasmand");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("willekeurige rondleiding", async ({ page }) => {
  await page.goto("/museum");
  await page.getByRole("button", { name: "Start een willekeurige rondleiding" }).click();
  const guide = page.getByRole("dialog", { name: "Rondleiding" });
  await expect(guide).toContainText("Stop 1 van 5");
  await guide.getByRole("button", { name: "Volgende" }).click();
  await expect(guide).toContainText("Stop 2 van 5");
  await guide.getByRole("button", { name: "Stop" }).click();
  await expect(guide).toBeHidden();
});

test("bijna afgerond: afmaken lukt nooit", async ({ page }) => {
  await page.goto("/museum#zaal-2");
  const bar = page.getByRole("progressbar", { name: "Voortgang Het opgeruimde schuurtje" });
  await page.locator("#stuk-schuurtje").getByRole("button", { name: "Afmaken" }).click();
  await expect(bar).toHaveAttribute("aria-valuenow", "95", { timeout: 3000 });
  await expect(page.locator("#stuk-schuurtje .almost__msg")).not.toBeEmpty();
});

test("ideeëngenerator vult het loket en het loket accepteert de inzending", async ({ page }) => {
  await page.goto("/museum");
  await page.getByRole("button", { name: "Genereer een idee" }).click();
  await page.getByRole("button", { name: "Dien in bij het loket" }).click();
  const form = page.locator("#loket-balie");
  await expect(form.getByLabel("Titel van uw idee")).not.toHaveValue("");
  await form.getByLabel(/Ik begrijp dat dit idee/).check();
  await page.waitForTimeout(2600);
  await form.getByRole("button", { name: "Idee indienen bij het loket" }).click();
  await expect(form.getByText(/Uw volgnummer is \d+/)).toBeVisible();
});

test("geheime zaal via het barstje, met zaklamp-verrassing", async ({ page }) => {
  await page.goto("/museum");
  await page.getByRole("button", { name: "Een barstje in de muur" }).click();
  await expect(page.getByRole("heading", { name: "De Geheime Zaal" })).toBeVisible();
  await page.getByRole("button", { name: /Licht aan/ }).click();
  await page.getByRole("button", { name: "Het enige afgemaakte object" }).click();
  await expect(page.getByText("Status: af.")).toBeVisible();
  await expect(page.getByText("Missie voltooid").first()).toBeVisible();
});

test("domeinmolen en mist van morgen", async ({ page }) => {
  await page.goto("/museum");
  await page.getByRole("button", { name: "Draai aan de domeinmolen" }).click();
  await expect(page.locator(".mill__list li")).toHaveCount(1);
  const btn = page.getByRole("button", { name: "Wrijf de mist weg" }).first();
  await btn.click();
  await expect(page.locator(".future.is-clear").first()).toBeVisible();
});
