import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/control-center");
});

const screen = (page: import("@playwright/test").Page) => page.locator(".screen__output");

test("nieuw idee starten", async ({ page }) => {
  await page.getByRole("button", { name: "Nieuw idee starten" }).click();
  await expect(screen(page)).not.toContainText("Systeem gereed");
});

test("project afronden blijft op 99% en levert drie projecten op", async ({ page }) => {
  await page.getByRole("button", { name: "Project afronden" }).click();
  await expect(page.getByRole("progressbar", { name: "Voortgang project" })).toHaveAttribute("aria-valuenow", "99", { timeout: 10000 });
  await expect(screen(page)).toContainText("Gefeliciteerd. Dit project heeft drie nieuwe projecten opgeleverd.", { timeout: 10000 });
});

test("even niets doen geeft fout 404 en verandert na drie keer van functie", async ({ page }) => {
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Even niets doen" }).click();
    await expect(page.getByRole("alertdialog")).toContainText("Fout 404: rustmoment niet gevonden.");
    await page.getByRole("button", { name: "OK" }).click();
  }
  await page.getByRole("button", { name: "Toch maar iets doen" }).click();
  await expect(screen(page)).toContainText("Goed bezig!");
});

test("domeinnaam kopen print een bonnetje zonder echte registratie", async ({ page }) => {
  await page.getByRole("button", { name: "Nog een domeinnaam kopen" }).click();
  await expect(page.locator(".receipt")).toHaveCount(1);
  await expect(screen(page)).toContainText("niet echt");
});

test("draaiknop werkt met toetsenbord, haalt 10 en gaat tot 11", async ({ page }) => {
  const knob = page.getByRole("slider", { name: "Creativiteit" });
  await knob.focus();
  await page.keyboard.press("End");
  await expect(knob).toHaveAttribute("aria-valuenow", "10");
  await expect(page.locator(".console")).toHaveClass(/level-10/);
  await page.keyboard.press("ArrowUp");
  await expect(page.getByText("Verrassing: Tot 11")).toBeVisible();
  await page.keyboard.press("Home");
  await expect(knob).toHaveAttribute("aria-valuenow", "0");
});

test("serieuze modus opent en sluit met Escape", async ({ page }) => {
  await page.getByRole("switch", { name: "Serieuze modus" }).click();
  const serious = page.getByRole("dialog", { name: "Serieuze modus" });
  await expect(serious).toContainText("schaalbare, toekomstbestendige");
  await page.keyboard.press("Escape");
  await expect(serious).toBeHidden();
});

test("noodstop: eerst kapje, dan stop, daarna herstel", async ({ page }) => {
  await page.getByRole("button", { name: "Open het beschermkapje van de noodstop" }).click();
  await page.getByRole("button", { name: "Druk op de officiële noodstop" }).click();
  await expect(page.locator(".emergency-banner")).toBeVisible();
  await expect(screen(page)).toContainText("Systeem hersteld", { timeout: 9000 });
});

test("hendel laat capsules met plannen rollen", async ({ page }) => {
  await page.getByRole("button", { name: "Trek aan de hendel voor een nieuw plan" }).click();
  const cap = page.getByRole("button", { name: "Gesloten capsule openen" });
  await expect(cap).toHaveCount(1);
  await cap.click();
  await expect(page.getByRole("button", { name: /^Plan: / })).toBeVisible();
});

test("geheime schakelaarcombinatie ontgrendelt de geheime zaal", async ({ page }) => {
  await page.getByRole("switch", { name: "koffie" }).click();
  await page.getByRole("switch", { name: "ambitie" }).click();
  await page.getByRole("switch", { name: "realisme" }).click();
  await expect(screen(page)).toContainText("Combinatie geaccepteerd");
  await page.getByRole("link", { name: /Naar de geheime zaal/ }).click();
  await expect(page.getByRole("heading", { name: "De Geheime Zaal" })).toBeVisible();
});

test("te veel drukken laat de machine vastlopen", async ({ page }) => {
  const btn = page.getByRole("button", { name: "Nieuw idee starten" });
  for (let i = 0; i < 12; i++) {
    if (await btn.isDisabled()) break;
    await btn.click();
  }
  await expect(page.getByRole("alert").getByText("MACHINE VASTGELOPEN")).toBeVisible();
  await page.getByRole("button", { name: "Tik tegen de machine" }).click();
  await expect(screen(page)).toContainText("Machine draait weer");
});
