import { expect, test } from "@playwright/test";

const PAGES = [
  ["/", /Martijn/],
  ["/control-center", /Martijn Control Center/],
  ["/museum", /Museum van Onafgemaakte Ideeën/],
  ["/over", /Over Martijn/],
  ["/loket", /Aanvraag tot het hebben van een idee/],
  ["/bureau", /Oplossingen voor problemen/],
  ["/certificaat", /Uw officiële certificaat/],
  ["/bijbelreis", /Op reis door de Bijbel/],
] as const;

for (const [path, heading] of PAGES) {
  test(`pagina ${path} laadt zonder fouten`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    await expect(page).toHaveTitle(/Martijn den Besten|Martijn/);
    expect(errors).toEqual([]);
  });
}

test("onbekende pagina geeft een echte 404 met eigen pagina", async ({ page }) => {
  const res = await page.goto("/deze-pagina-bestaat-niet");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("nog niet afgemaakt");
});

test("navigatie tussen afdelingen werkt", async ({ page, isMobile }) => {
  await page.goto("/");
  for (const name of ["Control Center", "Museum", "Over Martijn", "Hoofdkwartier"]) {
    if (isMobile) {
      await page.getByRole("button", { name: "Menu openen" }).click();
      await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name }).click();
    } else {
      await page.getByRole("navigation", { name: "Hoofdnavigatie" }).getByRole("link", { name }).click();
    }
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await expect(page).toHaveURL(/\/$/);
});

test("meta-informatie per route staat in de HTML", async ({ request }) => {
  const html = await (await request.get("/museum")).text();
  expect(html).toContain("<title>Museum van Onafgemaakte Ideeën");
  expect(html).toContain('rel="canonical" href="https://martijndenbesten.com/museum"');
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://martijndenbesten.com/control-center");
});
