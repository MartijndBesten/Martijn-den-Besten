import { expect, test, type Page } from "@playwright/test";

// Privacy en Hulp (public/bijbelreis/privacy.html en hulp.html): op bijbelreis.nl /privacy en /hulp (de route zelf test
// tests/bijbelreis-info.test.ts), lokaal en op de hoofdsite /bijbelreis/privacy en /bijbelreis/hulp. App Store Connect
// vraagt een privacy-URL en een support-URL; zie docs/bijbelreis-ios/APPSTORE.md. Toegankelijkheid: e2e/a11y.spec.ts.

test.use({ reducedMotion: "reduce" });

function fouten(page: Page) {
  const lijst: string[] = [];
  page.on("pageerror", (e) => lijst.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") lijst.push(m.text()); });
  return lijst;
}

test("vanuit ‘Voor ouders en leiders’ naar de privacyverklaring en de hulp, en terug naar de atlas", async ({ page }) => {
  const f = fouten(page);
  await page.goto("/bijbelreis#v26");
  await expect(page.locator("#map .land").first()).toBeAttached();
  const ouders = page.locator("details.parents");
  await ouders.locator("summary").click();
  await ouders.getByRole("link", { name: "Lees de privacyverklaring" }).click();
  await expect(page).toHaveURL(/\/bijbelreis\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy");
  await expect(page.locator("main")).toContainText("De app verzamelt niets en verstuurt niets.");
  await expect(page.locator("main")).toContainText("Geen account, geen cookies en geen advertenties.");
  await expect(page.locator('main a[href="mailto:info@denckh.nl"]').first()).toBeVisible();

  await page.getByRole("link", { name: "Hulp en veelgestelde vragen" }).click();
  await expect(page).toHaveURL(/\/bijbelreis\/hulp$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hulp");
  // Veelgestelde vragen zijn uitklapbaar en per onderwerp te openen.
  const offline = page.locator("#offline");
  await expect(offline.locator("> div")).toBeHidden();
  await offline.locator("summary").click();
  await expect(offline).toContainText("ook de eerste keer");
  await page.locator(".bk-terug").click();
  await expect(page.locator("#map .land").first()).toBeAttached();
  expect(f).toEqual([]);
});

test("privacy en hulp: niets van buiten, één hoofdgebied, geen horizontaal scrollen op de telefoon", async ({ page, baseURL }) => {
  const eigen = new URL(baseURL!).origin, extern: string[] = [];
  page.on("request", (r) => { if (/^https?:/.test(r.url()) && !r.url().startsWith(eigen)) extern.push(r.url()); });
  for (const pad of ["/bijbelreis/privacy", "/bijbelreis/hulp"]) {
    await page.goto(pad);
    await expect(page.getByRole("main")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), pad).toBeLessThanOrEqual(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://bijbelreis.nl" + pad.replace("/bijbelreis", ""));
  }
  expect(extern).toEqual([]);
});

test("een deel van een reis kiezen deelt niets (alleen de knop ‘Deel’ deelt)", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __gedeeld: string[] }).__gedeeld = [];
    Object.defineProperty(navigator, "share", { configurable: true, value: async (o: { url: string }) => { (window as unknown as { __gedeeld: string[] }).__gedeeld.push(o.url); } });
  });
  await page.goto("/bijbelreis#abraham/2");
  await expect(page.locator("#map .land").first()).toBeAttached();
  await page.locator("#delen .deel").nth(1).evaluate((b: HTMLElement) => b.click());
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { __gedeeld: string[] }).__gedeeld)).toEqual([]);
  await expect(page.locator(".deelveld")).toHaveCount(0);
  // De knop ‘Deel’ bij een geschiedenis deelt nog wel.
  await page.goto("/bijbelreis#v26");
  await page.locator(".deelknop:visible").first().click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __gedeeld: string[] }).__gedeeld.length)).toBe(1);
});
