import { expect, test, type Page } from "@playwright/test";

// Bezoekmeting van de Bijbelreis (public/bijbelreis/bezoek.js, worker/bezoek.ts; docs/bijbelreis-bezoek/README.md).
// Een geautomatiseerde browser wordt niet geteld (navigator.webdriver): daarom doet deze test alsof hij een gewone
// browser is, en vangt hij de meldingen zelf op. Zo komt er uit de tests nooit iets in de cijfers.

const ADMIN = "e2e-admin-token-0123456789abcdef";
type Melding = { i: string; p: string; a: string; h: string; d: number; s: number };

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
// Een gewone browser: navigator.webdriver uit. Met `extra` kan een test ‘niet volgen’ aanzetten.
async function gewoneBrowser(page: Page, extra: "" | "dnt" | "gpc" = "") {
  await page.addInitScript((extra) => {
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false, configurable: true });
    if (extra === "dnt") Object.defineProperty(Navigator.prototype, "doNotTrack", { get: () => "1", configurable: true });
    if (extra === "gpc") Object.defineProperty(Navigator.prototype, "globalPrivacyControl", { get: () => true, configurable: true });
  }, extra);
}
// Vangt de meldingen op (en beantwoordt ze zoals de server: 204 zonder inhoud).
async function vangMeldingen(page: Page) {
  const meldingen: Melding[] = [];
  const andere: string[] = [];
  await page.route("**/api/bezoek", async (route) => {
    const r = route.request();
    if (r.method() === "POST") meldingen.push(JSON.parse(r.postData() || "{}"));
    else andere.push(r.method());
    await route.fulfill({ status: 204, body: "" });
  });
  return { meldingen, andere };
}
// De pagina verbergen zoals een tabbladwissel dat doet.
const verberg = (page: Page) => page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });

test("bezoek: bij het laden gaat er één melding uit; bij het verbergen een tweede met de duur en het aantal stappen", async ({ page }) => {
  const errors = watchErrors(page);
  await gewoneBrowser(page);
  const { meldingen, andere } = await vangMeldingen(page);
  await page.goto("/bijbelreis#izak/1");
  await expect(page.locator("#sTitle")).toHaveText(/^1\. /);
  await expect.poll(() => meldingen.length).toBe(1);
  const begin = meldingen[0];
  expect(Object.keys(begin).sort()).toEqual(["a", "d", "h", "i", "p", "s"]);
  expect(begin.i).toMatch(/^[0-9a-f]{32}$/);
  expect(begin.p).toBe("atlas");
  const breed = page.viewportSize()!.width;
  expect(begin.a).toBe(breed < 700 ? "telefoon" : breed < 1100 ? "tablet" : "desktop");
  expect(begin.h).toBe("");
  expect(begin.d).toBeLessThanOrEqual(2);

  // Twee stappen verder, één keer terug naar een stap die al geopend was: drie verschillende stappen.
  // (Met de knoppen van de pagina zelf: op de telefoon onderaan het stapblad, op de desktop in de stapkaart.)
  const klik = async (ids: string[]) => { for (const id of ids) { const k = page.locator("#" + id); if (await k.isVisible()) return k.click(); } throw new Error("geen knop zichtbaar: " + ids.join(", ")); };
  for (const [knoppen, stap] of [[["next", "next2"], 2], [["next", "next2"], 3], [["prev", "prev2"], 2]] as const) {
    await klik([...knoppen]);
    await expect(page.locator("#sTitle")).toHaveText(new RegExp(`^${stap}\\. `));
  }
  await page.waitForTimeout(1200);
  await verberg(page);
  await expect.poll(() => meldingen.length).toBe(2);
  const eind = meldingen[1];
  expect(eind.i).toBe(begin.i);
  expect(eind.p).toBe("atlas");
  expect(eind.s).toBe(3);
  expect(eind.d).toBeGreaterThanOrEqual(1);
  expect(eind.d).toBeLessThan(60);
  expect(andere).toEqual([]);

  // Geen cookie en niets in de opslag van de browser: het id staat alleen in het geheugen van de pagina.
  expect(await page.context().cookies()).toEqual([]);
  const opslag = await page.evaluate(() => JSON.stringify([document.cookie, { ...localStorage }, { ...sessionStorage }]));
  expect(opslag).not.toContain(begin.i);
  expect(await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter((k) => /bezoek/i.test(k)))).toEqual([]);
  expect(errors).toEqual([]);
});

test("bezoek: een nieuwe paginalading is een nieuw bezoek met een ander id; het boekje telt als ‘boekje’", async ({ page }) => {
  const errors = watchErrors(page);
  await gewoneBrowser(page);
  const { meldingen } = await vangMeldingen(page);
  await page.goto("/bijbelreis");
  await expect.poll(() => meldingen.length).toBe(1);
  await page.goto("/bijbelreis/boekje#jakob");
  await expect.poll(() => meldingen.filter((m) => m.p === "boekje").length).toBeGreaterThanOrEqual(1);
  const boekje = meldingen.find((m) => m.p === "boekje")!;
  expect(boekje.i).not.toBe(meldingen[0].i);
  expect(boekje.s).toBe(0);
  // Van de atlas naar het boekje is binnen de eigen site: geen herkomst.
  expect(boekje.h).toBe("");
  expect(errors).toEqual([]);
});

for (const [naam, extra] of [["Do Not Track", "dnt"], ["Global Privacy Control", "gpc"]] as const) {
  test(`bezoek: met ‘niet volgen’ aan (${naam}) gaat er niets uit`, async ({ page }) => {
    await gewoneBrowser(page, extra);
    const { meldingen } = await vangMeldingen(page);
    await page.goto("/bijbelreis#izak/1");
    await expect(page.locator("#sTitle")).toHaveText(/^1\. /);
    await page.waitForTimeout(800);
    await verberg(page);
    await page.waitForTimeout(400);
    expect(meldingen).toEqual([]);
  });
}

test("bezoek: een geautomatiseerde browser (zoals deze tests) wordt niet geteld", async ({ page }) => {
  const errors = watchErrors(page);
  const { meldingen } = await vangMeldingen(page);
  await page.goto("/bijbelreis#izak/1");
  await expect(page.locator("#sTitle")).toHaveText(/^1\. /);
  await page.waitForTimeout(800);
  await verberg(page);
  await page.waitForTimeout(400);
  expect(meldingen).toEqual([]);
  expect(errors).toEqual([]);
});

// Tegen de echte lokale Worker met D1 (niet onder `vite preview`, daar bestaat de API niet).
test.describe("bezoek: de echte Worker", () => {
  test.skip(!!process.env.E2E_BASE_URL, "alleen tegen de lokale Worker met database");

  test("een melding uit de browser komt aan, antwoordt 204 en staat in het beheer", async ({ page, request, baseURL }) => {
    const errors = watchErrors(page);
    await gewoneBrowser(page);
    const antwoorden: number[] = [];
    page.on("response", (r) => { if (new URL(r.url()).pathname === "/api/bezoek") antwoorden.push(r.status()); });
    const kop = { Authorization: `Bearer ${ADMIN}` };
    const voor = (await (await request.get("/api/admin/bezoek?dagen=1", { headers: kop })).json()).dagen[0].bezoeken as number;
    await page.goto("/bijbelreis#izak/1");
    await expect(page.locator("#sTitle")).toHaveText(/^1\. /);
    await page.waitForTimeout(1100);
    await verberg(page);
    await expect.poll(async () => (await (await request.get("/api/admin/bezoek?dagen=1", { headers: kop })).json()).dagen[0].bezoeken).toBe(voor + 1);
    expect(antwoorden.every((s) => s === 204)).toBe(true);
    // De route geeft niets prijs: 204 zonder inhoud, ook bij onzin; GET is niet toegestaan.
    const onzin = await request.post("/api/bezoek", { data: "geen json", headers: { "Content-Type": "text/plain", Origin: baseURL! } });
    expect(onzin.status()).toBe(204);
    expect(await onzin.text()).toBe("");
    expect((await request.get("/api/bezoek")).status()).toBe(405);
    expect((await request.get("/api/admin/bezoek")).status()).toBe(401);
    expect(errors).toEqual([]);
  });

  test("het beheer toont ‘Bezoek bijbelreis.nl’: totalen bovenaan en een tabel per dag", async ({ page }) => {
    await page.goto("/beheer");
    await page.getByLabel("Beheertoken").fill(ADMIN);
    await page.getByRole("button", { name: "Inloggen" }).click();
    await page.getByRole("button", { name: "Bezoek bijbelreis.nl" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bezoek bijbelreis.nl");
    await expect(page.locator(".bezoek__totaal")).toHaveCount(2);
    await expect(page.locator(".bezoek__tabel tbody tr")).toHaveCount(30);
    await page.getByRole("button", { name: "7 dagen" }).click();
    await expect(page.locator(".bezoek__tabel tbody tr")).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
