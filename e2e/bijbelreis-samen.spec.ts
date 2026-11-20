import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { zonderVoorscherm } from "./voorscherm";

zonderVoorscherm(test);

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

// Digibordstand (#<route>/<n>/bord): één scherm per stap, groot genoeg om achter in de klas te lezen. Beoordeling en
// metingen: docs/bijbelreis-samen/BEOORDELING.md.
test("digibord: begin, één vraag per scherm (de clicker toont eerst het antwoord), afronding en terug", async ({ page }) => {
  const f = fouten(page);
  await open(page, "/bijbelreis/lessen#profeten/4");
  const les = page.locator("#les-4");
  // Het lesverloop van 20 minuten staat bij de route; bij de les de leestijd en wat de presentatie meer vertelt.
  await expect(page.getByRole("heading", { name: "Een les van ongeveer 20 minuten" })).toBeVisible();
  await expect(les.locator(".ls-lees")).toContainText("Daniël 6:11–24 · 14 verzen, ca. 4 min voorlezen");
  await expect(les.locator(".ls-meer")).toContainText("De presentatie vertelt de hele geschiedenis (Daniël 6)");
  await les.getByRole("link", { name: "Vragen op het digibord: Daniël in de leeuwenkuil" }).click();
  await expect(page).toHaveURL(/#profeten\/4\/bord$/);
  // Begin: wat lezen we. Kop en voet van de pagina zijn weg; niets schuift (ook niet op de telefoon).
  await expect(page.locator("#lbKop")).toHaveText("Daniël in de leeuwenkuil");
  await expect(page.locator(".lb-lees")).toHaveText("Daniël 6:11–24");
  await expect(page.locator(".bk-kopbalk")).toBeHidden();
  const schuift = () => page.evaluate(() => [document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight - innerHeight]);
  expect(await schuift()).toEqual([0, 0]);
  await page.getByRole("button", { name: /Naar de vragen/ }).click();
  await expect(page.locator("#lbKop")).toHaveText("Hoe vaak per dag bad Daniël, en naar welke stad stonden zijn vensters open?");
  await expect(page.locator(".lb-zoek")).toHaveText("Zoek op: Daniël 6:11");
  await expect(page.locator(".lb-antwoord")).toHaveCount(0);
  // Een presentatieclicker stuurt PageDown: eerst het antwoord, dan de volgende vraag.
  await page.keyboard.press("PageDown");
  await expect(page.locator(".lb-antwoord")).toContainText("Drie keer per dag");
  await expect(page).toHaveURL(/#profeten\/4\/bord\/1$/);
  await page.keyboard.press("PageDown");
  await expect(page.locator("#lbKop")).toHaveText("Wat stond er in het gebod dat de koning getekend had?");
  await page.getByRole("button", { name: "Toon het antwoord" }).click();
  await expect(page.locator(".lb-antwoord q")).toHaveText("in den kuil der leeuwen");
  await page.keyboard.press("PageUp");
  await expect(page.locator(".lb-zoek")).toHaveText("Zoek op: Daniël 6:11");
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight"); // antwoord 1, vraag 2, antwoord 2, vraag 3, antwoord 3, afronding
  await expect(page.locator("#lbKop")).toHaveText("Wat hebben we gezien?");
  await expect(page.locator(".lb-thuis")).toHaveText("Thuis nalezen: bijbelreis.nl/#v75");
  await expect(page.getByRole("link", { name: "Presentatie van Daniël in de leeuwenkuil" })).toHaveAttribute("href", /^\/bijbelreis\/boekje#v75&niveau=[abc]$/);
  expect(await schuift()).toEqual([0, 0]);
  // Een link naar een scherm (na de presentatie terug) opent dat scherm; Escape gaat terug naar de les.
  await open(page, "/bijbelreis/lessen#profeten/4/bord/4");
  await expect(page.locator("#lbKop")).toHaveText("Wat hebben we gezien?");
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/#profeten\/4$/);
  await expect(page.locator("#les-4")).toBeFocused();
  await expect(page.locator(".bk-kopbalk")).toBeVisible();
  // ‘Direct naar de inhoud’ blijft op de route (#inhoud is geen route).
  await page.locator(".bk-skip").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#profeten\/4$/);
  await expect(page.locator("#inhoud")).toBeFocused();
  expect(f).toEqual([]);
});

test("digibord op 1920×1080: de vraag is op afstand leesbaar en past op één scherm", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "het formaat van een digibord");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open(page, "/bijbelreis/lessen#jozef/2/bord/2");
  await page.getByRole("button", { name: "Toon het antwoord" }).click();
  const px = (sel: string) => page.locator(sel).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(await px("#lbKop")).toBeGreaterThanOrEqual(56);
  expect(await px(".lb-zoek")).toBeGreaterThanOrEqual(40);
  expect(await px(".lb-antwoord")).toBeGreaterThanOrEqual(40);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(0);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
});

test("alleen deze les printen: werkblad met naam en schrijfruimte op één A4, de andere lessen niet", async ({ page }) => {
  await open(page, "/bijbelreis/lessen#profeten");
  // De knop zet de les klaar en roept het afdrukvenster aan; daarna staat alles weer zoals het was.
  await page.evaluate(() => { (window as unknown as { __print: string }).__print = ""; window.print = () => { (window as unknown as { __print: string }).__print = `${document.body.dataset.print}/${document.body.dataset.printLes}/${document.querySelectorAll(".ls-print-deze").length}`; window.dispatchEvent(new Event("afterprint")); }; });
  await page.getByRole("button", { name: "Werkblad van les 4" }).click();
  expect(await page.evaluate(() => (window as unknown as { __print: string }).__print)).toBe("kinderen/4/1");
  await expect(page.locator(".ls-print-deze")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveAttribute("data-print-les", /./);
  // Zo ziet de afdruk eruit.
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => { document.body.dataset.print = "kinderen"; document.body.dataset.printLes = "4"; document.getElementById("les-4")!.classList.add("ls-print-deze"); });
  await expect(page.locator("#les-4")).toBeVisible();
  for (const n of [1, 2, 3]) await expect(page.locator(`#les-${n}`)).toBeHidden();
  await expect(page.locator(".ls-naam")).toBeVisible();
  for (const weg of [".ls-verloop", ".ls-a >> nth=0", ".ls-meer >> nth=0", ".ls-lesprint >> nth=0"]) await expect(page.locator(weg)).toBeHidden();
  const pdf = await page.pdf({ format: "A4" });
  expect((pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length).toBe(1);
  // Voor de leiding: met antwoorden en het lesverloop.
  await page.evaluate(() => { document.body.dataset.print = "leiding"; document.body.classList.add("ls-met-antwoorden"); });
  await expect(page.locator("#les-4 .ls-a").first()).toBeVisible();
  await expect(page.locator(".ls-verloop")).toBeVisible();
  await expect(page.locator(".ls-naam")).toBeHidden();
});
