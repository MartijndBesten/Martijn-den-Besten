import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Gebruikersreis ‘Als ouder of leerkracht een verhaal gebruiken om samen de Bijbel te ontdekken’: vanaf de start de
// lesroutes vinden, een les kiezen, de presentatie of het verhaal openen, de vragen stellen en printen.
// Pagina: /bijbelreis/lessen (lessen.html, lessen.js, lessen-data.js). Uitleg: docs/bijbelreis-samen/README.md.
// De gegevens zelf (bestaande geschiedenissen, verwijzingen, Statenvertaling) test tests/bijbelreis-lessen.test.ts.

test.use({ reducedMotion: "reduce" });

function fouten(page: Page) {
  const lijst: string[] = [];
  page.on("pageerror", (e) => lijst.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") lijst.push(m.text()); });
  return lijst;
}
// Elke keer een verse pagina (een ander fragment op dezelfde pagina is anders maar een hashchange).
const open = async (page: Page, pad: string) => { if (page.url() !== "about:blank") await page.goto("about:blank"); await page.goto(pad); };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const BR: any;

test("een ouder vindt vanaf de start de lesroutes, opent een les en komt bij het verhaal", async ({ page }) => {
  const f = fouten(page);
  await open(page, "/bijbelreis");
  await expect(page.locator("#map .land").first()).toBeAttached();
  // De ingang staat in Verhalen, het onderdeel waarmee de atlas opent, direct onder de uitleg.
  const ingang = page.locator("#p-verhalen").getByRole("link", { name: /Lesroutes met presentatie en vragen/ });
  await expect(ingang).toBeVisible();
  await ingang.click();
  await expect(page).toHaveURL(/\/bijbelreis\/lessen$/);
  await expect(page.getByRole("heading", { level: 2, name: "Samen de Bijbel ontdekken" })).toBeVisible();
  const routes = await page.evaluate(() => BR.lessen.map((r: { id: string; n: string }) => r.n));
  await expect(page.locator(".ls-route")).toHaveCount(routes.length);

  // Een route: elke les met het gedeelte om samen te lezen, presentatie, atlas en vragen met verwijzing.
  await page.getByRole("link", { name: /De aartsvaders in vier weken/ }).click();
  await expect(page).toHaveURL(/#aartsvaders$/);
  await expect(page.getByRole("heading", { level: 2, name: "De aartsvaders in vier weken" })).toBeFocused();
  const les2 = page.locator("#les-2");
  await expect(les2.getByRole("heading", { level: 3 })).toHaveText("Abraham moet Izak offeren");
  await expect(les2.locator(".ls-lees")).toContainText("Lees samen: Genesis 22:1–19");
  await expect(les2.getByRole("link", { name: "Presentatie van Abraham moet Izak offeren" })).toHaveAttribute("href", /^\/bijbelreis\/boekje#v13&niveau=[abc]$/);
  await expect(les2.locator(".ls-zoek").first()).toHaveText("Zoek op: Genesis 22:2");
  // De antwoorden staan eerst verborgen (de pagina kan zo op het digibord), en komen met één knop tevoorschijn.
  const antwoord = les2.locator(".ls-a").first();
  await expect(antwoord).toBeHidden();
  await page.getByRole("button", { name: "Toon de antwoorden" }).click();
  await expect(antwoord).toBeVisible();
  await expect(antwoord).toContainText("Naar het land Moria.");
  await expect(page.getByRole("button", { name: "Verberg de antwoorden" })).toHaveAttribute("aria-pressed", "true");

  // Naar het verhaal in de atlas.
  await les2.getByRole("link", { name: "Abraham moet Izak offeren in de atlas" }).click();
  await expect(page).toHaveURL(/\/bijbelreis#v13$/);
  await expect(page.locator("#vTitel")).toHaveText("Abraham moet Izak offeren");
  expect(f).toEqual([]);
});

test("de presentatie van een les opent op het gekozen niveau", async ({ page }) => {
  const f = fouten(page);
  await open(page, "/bijbelreis/lessen#advent-kerst");
  // De leeftijd van de groep verandert alleen de links naar de presentatie, en wordt onthouden.
  await page.getByRole("button", { name: "4–6 jaar" }).click();
  await expect(page.getByRole("button", { name: "4–6 jaar" })).toHaveAttribute("aria-pressed", "true");
  const pres = page.locator("#les-4").getByRole("link", { name: /^Presentatie van/ });
  await expect(pres).toHaveAttribute("href", "/bijbelreis/boekje#v84&niveau=a");
  await expect(page.locator("#les-4").getByRole("link", { name: /^Boekje van/ })).toHaveAttribute("href", "/bijbelreis/boekje#v84&niveau=a&toon=boekje");
  expect(await page.evaluate(() => localStorage.getItem("bijbelreis:lessen"))).toBe('{"niveau":"a"}');
  await pres.click();
  await expect(page.locator(".bk-dia")).toBeVisible();
  await expect(page.locator(".bk-dia .bk-titel")).toHaveText("De herders bij de kribbe");
  // Extra bij Kerst: de kerstreis in de atlas.
  await open(page, "/bijbelreis/lessen#advent-kerst");
  await expect(page.getByRole("link", { name: /kerstreis in zes delen/ })).toHaveAttribute("href", "/bijbelreis#kerst-belofte");
  expect(f).toEqual([]);
});

test("een link naar één les zet die les in beeld; een onbekende route toont het overzicht", async ({ page }) => {
  await open(page, "/bijbelreis/lessen#jozef/2");
  await expect(page.locator("#les-2")).toBeFocused();
  await expect(page.locator("#les-2").getByRole("heading", { level: 3 })).toHaveText("Jozef blijft trouw in Egypte");
  expect(await page.locator("#les-2").evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(80);
  await page.getByRole("link", { name: "← Alle lesroutes" }).click();
  await expect(page.locator(".ls-route").first()).toBeVisible();
  await open(page, "/bijbelreis/lessen#bestaat-niet");
  await expect(page.locator(".ls-route").first()).toBeVisible();
});

test("afdrukken: voor de leiding met antwoorden, als werkblad zonder; alleen de route", async ({ page }) => {
  await open(page, "/bijbelreis/lessen#paulus");
  await page.emulateMedia({ media: "print" });
  const zet = (soort: string) => page.evaluate((s) => { document.body.dataset.print = s; document.body.classList.toggle("ls-met-antwoorden", s === "leiding"); }, soort);
  await zet("leiding");
  await expect(page.locator(".ls-les").first()).toBeVisible();
  await expect(page.locator(".ls-a").first()).toBeVisible();
  for (const weg of [".bk-kopbalk", ".bk-voet", ".ls-bediening", ".ls-knoppen >> nth=0", ".ls-terug"]) await expect(page.locator(weg)).toBeHidden();
  await expect(page.locator(".ls-print-bron")).toContainText("bijbelreis.nl/bijbelreis/lessen#paulus");
  await zet("kinderen");
  await expect(page.locator(".ls-a").first()).toBeHidden();
  await expect(page.locator(".ls-zoek").first()).toBeVisible();
  // Het boekje-stijlblad verbergt bij afdrukken alles behalve een boekje; hier moet de tekst juist zichtbaar zijn.
  expect(await page.locator(".ls-q").first().evaluate((el) => getComputedStyle(el).visibility)).toBe("visible");
  const pdf = await page.pdf({ format: "A4" });
  expect(pdf.byteLength).toBeGreaterThan(10_000);
  await page.emulateMedia({ media: "screen" });
  // De knoppen roepen het afdrukvenster van de browser aan, en zetten daarna terug hoe het stond.
  await page.evaluate(() => { (window as unknown as { __print: number }).__print = 0; window.print = () => { (window as unknown as { __print: number }).__print++; window.dispatchEvent(new Event("afterprint")); }; });
  await page.getByRole("button", { name: "Afdrukken voor de leiding" }).click();
  expect(await page.evaluate(() => (window as unknown as { __print: number }).__print)).toBe(1);
  await expect(page.locator(".ls-a").first()).toBeHidden();
  await expect(page.locator("body")).not.toHaveAttribute("data-print", /./);
});

test("toegankelijkheid van een route met antwoorden", async ({ page }) => {
  await open(page, "/bijbelreis/lessen#egypte-kanaan");
  await page.getByRole("button", { name: "Toon de antwoorden" }).click();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  // Geen horizontaal schuiven, ook niet op de telefoon.
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});
