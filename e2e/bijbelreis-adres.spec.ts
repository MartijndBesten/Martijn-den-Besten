import { expect, test } from "@playwright/test";
import { zonderVoorscherm } from "./voorscherm";

zonderVoorscherm(test);

// Ongeldige adressen (audit 22-11-2026). Een kapotte %-codering (#%E0%A4%A) gaf een URIError waardoor de app vastliep;
// een onbekend adres of een ongeldig stapnummer bleef in de adresbalk staan. Nu:
// - bij het openen: een bekend adres in een andere schrijfwijze wordt het nette adres (#v0012 → #v12, #nt-begin/abc →
//   #nt-begin), een onbekend of kapot adres opent de start zonder #;
// - in de open app: een onbekend of kapot adres laat je waar je was, met het vorige adres; een ongeldige stap wordt het
//   deel zelf. Er komt geen extra plek in de geschiedenis bij, en de voortgang blijft staan.

const fouten: string[] = [];
test.beforeEach(async ({ page }) => {
  fouten.length = 0;
  page.on("pageerror", (e) => fouten.push(String(e)));
});

const BIJ_OPENEN: [string, string][] = [
  ["#nt-begin/abc", "#nt-begin"],
  ["#nt-begin/-1", "#nt-begin"],
  ["#nt-begin/0", "#nt-begin"],
  ["#nt-begin/99999999999999999999", "#nt-begin"],
  ["#nt-begin/1e3", "#nt-begin"],
  ["#nt-begin/01", "#nt-begin/1"],
  ["#nt-begin/3", "#nt-begin/3"],
  ["#v0012", "#v12"],
  ["#v26", "#v26"],
  ["#v999", ""],
  ["#bestaat-niet", ""],
  ["#%E0%A4%A", ""],
  ["#nt-begin/%ZZ", ""],
];

for (const [adres, netjes] of BIJ_OPENEN) {
  test(`bij openen: ${adres} → ${netjes || "(start)"}`, async ({ page }) => {
    await page.goto("/bijbelreis" + adres);
    await expect.poll(() => page.evaluate(() => location.hash)).toBe(netjes);
    await expect(page.locator("#p-verhalen, #reisboek").first()).toBeAttached();
    expect(fouten).toEqual([]);
  });
}

test("in de open app: ongeldige adressen worden netjes, onbekende laten je waar je was; terug en voortgang blijven werken", async ({ page }) => {
  await page.goto("/bijbelreis#v26");
  await expect(page.locator("#p-verhalen h1, #p-verhalen h2").first()).toBeVisible();
  const voortgang = await page.evaluate(() => localStorage.getItem("bijbelreis:verhalen"));
  const zet = async (h: string) => { await page.evaluate((x) => { location.hash = x; }, h); await page.waitForTimeout(400); return page.evaluate(() => location.hash); };
  expect(await zet("#nt-begin/abc")).toBe("#nt-begin");
  expect(await zet("#nt-begin/3")).toBe("#nt-begin/3");
  expect(await zet("#nt-begin/99999999999999999999")).toBe("#nt-begin");
  expect(await zet("#%E0%A4%A")).toBe("#nt-begin");
  expect(await zet("#v0012")).toBe("#v12");
  expect(await zet("#bestaat-niet")).toBe("#v12");
  expect(await zet("#v999")).toBe("#v12");
  // De geldige plekken staan nog in de geschiedenis: terug gaat naar een bestaand adres, niet naar een kapot adres.
  await page.goBack();
  await expect.poll(() => page.evaluate(() => location.hash)).toMatch(/^#(v12|nt-begin(\/3)?)$/);
  // Niets van de voortgang gaat verloren (geschiedenis 12 komt er als ‘gezien’ bij, want die is geopend).
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem("bijbelreis:verhalen"))) || "{}")).toMatchObject(JSON.parse(voortgang || "{}"));
  expect(fouten).toEqual([]);
});
