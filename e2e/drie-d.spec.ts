import { expect, test, type Locator, type Page } from "@playwright/test";

// De 3D-suite: draait mét WebGL en controleert dat de ruimtelijke machines echt verschijnen,
// pixels tekenen en op bediening reageren. (SwiftShader is traag, vandaar de ruime tijden.)
test.describe.configure({ timeout: 120_000 });

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    // 502/404 van de lokale API horen hier niet bij; alleen echte scriptfouten tellen
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  return errors;
}

/** Fotografeert alleen de 3D-canvas (zonder poster, achtergrond en HTML-laag) en meet hoeveel er getekend is. */
async function paintedBytes(page: Page, stage: Locator, canvas: Locator): Promise<number> {
  await stage.evaluate((el) => {
    el.setAttribute("data-test-canvas-only", "");
    const style = document.createElement("style");
    style.id = "canvas-only";
    style.textContent =
      "[data-test-canvas-only]{background:none!important}[data-test-canvas-only] > :not(canvas){visibility:hidden!important}[data-test-canvas-only]::before,[data-test-canvas-only]::after{display:none!important}";
    document.head.append(style);
  });
  const png = await canvas.screenshot({ omitBackground: true });
  await page.evaluate(() => document.getElementById("canvas-only")?.remove());
  return png.length;
}

async function wake(page: Page, mobile: boolean) {
  if (mobile) await page.touchscreen.tap(4, 140);
  else await page.mouse.move(240, 240);
}

test("ideeënmachine: de 3D-scène laadt na interactie, tekent en reageert", async ({ page, isMobile }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await expect(page.locator(".machine__poster")).toBeVisible();
  await page.locator(".machine").scrollIntoViewIfNeeded();
  await wake(page, isMobile);
  await expect(page.locator(".machine")).toHaveClass(/machine--live/, { timeout: 60_000 });
  const canvas = page.locator(".machine__canvas");
  await expect(canvas).toBeVisible();
  expect(await paintedBytes(page, page.locator(".machine__stage"), canvas)).toBeGreaterThan(20_000);

  await page.getByRole("button", { name: /Ideeënmachine: maak/ }).click({ position: { x: 30, y: 60 } });
  await expect(page.locator(".plate__foot")).not.toContainText("tik op de machine", { timeout: 30_000 });
  await expect(page.locator(".invention__name")).not.toBeEmpty();
  // de uitleg-callouts liggen op de 3D-onderdelen en werken
  await page.getByRole("button", { name: /Onderdeel \d: Stempelpers/ }).click();
  await expect(page.locator("#machine-uitleg")).toContainText("octrooikaart");
  expect(errors).toEqual([]);
});

test("Control Center: de installatie laadt in 3D en de bediening stuurt de machine", async ({ page, isMobile }) => {
  const errors = watchErrors(page);
  await page.goto("/control-center");
  await expect(page.locator(".cc-poster")).toBeVisible();
  await page.locator(".console").scrollIntoViewIfNeeded();
  await wake(page, isMobile);
  await expect(page.locator(".console")).toHaveClass(/console--live/, { timeout: 60_000 });
  const canvas = page.locator(".cc-canvas");
  await expect(canvas).toBeVisible();
  expect(await paintedBytes(page, page.locator(".cc-stage"), canvas)).toBeGreaterThan(20_000);

  await page.getByRole("button", { name: "Nieuw idee starten" }).click();
  await expect(page.locator(".screen__output")).not.toContainText("Systeem gereed", { timeout: 20_000 });
  await page.getByRole("button", { name: "Trek aan de hendel voor een nieuw plan" }).click();
  await expect(page.getByRole("button", { name: "Gesloten capsule openen" })).toHaveCount(1, { timeout: 20_000 });
  const knob = page.getByRole("slider", { name: "Creativiteit" });
  await knob.focus();
  await page.keyboard.press("End");
  await expect(page.locator(".console")).toHaveAttribute("data-lamps", "10");
  if (isMobile) await page.getByRole("button", { name: /Bedieningslade/ }).click();
  await page.getByRole("button", { name: "Nog een domeinnaam kopen" }).click();
  await expect(page.locator(".receipt")).toHaveCount(1, { timeout: 20_000 });
  expect(errors).toEqual([]);
});

test("museum: de vooraf gerenderde 3D-objecten laden in alle zalen", async ({ page }) => {
  await page.goto("/museum");
  for (const sel of [".turntable img", ".almost__art img", ".archive img", ".mini img", ".kinetic__stage img", ".room__planet"]) {
    const img = page.locator(sel).first();
    // sommige objecten bewegen (planeet, installatie): niet wachten tot ze stilstaan
    await img.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(img).toBeVisible();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { timeout: 20_000 }).toBe(true);
  }
});
