import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// De eerste tien seconden, advent als ritme en delen (16-11-2026; docs/bijbelreis-audit/telefoon.md §4.7 en
// docs/bijbelreis-kerst/README.md). Aanleiding: op de eerste ochtend van de bezoekmeting waren 16 van de 40 bezoekers
// binnen tien seconden weg en openden er maar 7 een reisstap. Een nieuwe bezoeker ziet nu één zin die zegt wat dit is en
// één grote knop die meteen begint; in de kersttijd wijst de seizoenskaart elke week één deel van de kerstreis aan
// (niets zit op slot); en een verhaal of reis is met één knop door te sturen.
// Elke pagina wordt vers geopend (eerst about:blank, dan het adres). De datum komt van het apparaat: elke test zet een
// klok die doorloopt (een stilstaande klok laat de kaart niet aankomen).
const BUITEN = "2026-09-01T10:00:00";
const ZIN = "Volg de reizen uit de Bijbel op de kaart, stap voor stap. Voor naast je eigen Bijbel.";
const DELEN = [
  ["kerst-belofte", "De belofte: van Adam tot David"],
  ["kerst-koningen", "Van David tot Jozef"],
  ["kerst-aankondiging", "De aankondiging"],
  ["kerst-geboorte", "De geboorte in Bethlehem"],
  ["kerst-wijzen", "De wijzen, Egypte en Nazareth"],
  ["kerst-twaalf", "Twaalf jaar: in het huis van Zijn Vader"],
] as const;

test.use({ reducedMotion: "reduce" });

type Opties = { tijd?: string; opslag?: Record<string, unknown> };
const klaar = new WeakSet<Page>();
async function open(page: Page, pad = "", o: Opties = {}) {
  if (!klaar.has(page)) {
    await page.clock.install({ time: new Date(o.tijd || BUITEN) });
    await page.addInitScript((x) => {
      try {
        if (sessionStorage.getItem("startGezet")) return;
        sessionStorage.setItem("startGezet", "1");
        Object.entries(x).forEach(([k, v]) => localStorage.setItem("bijbelreis:" + k, JSON.stringify(v)));
      } catch { /* about:blank heeft geen opslag */ }
    }, o.opslag || {});
    klaar.add(page);
  }
  await page.goto("about:blank");
  await page.goto("/bijbelreis" + pad);
  await expect(page.locator("#map .land").first()).toBeAttached();
}
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
const smal = (page: Page) => (page.viewportSize()?.width ?? 1440) <= 900;
async function bladOpen(page: Page) {
  const knop = page.locator("#bladBtn");
  if (!smal(page) || !(await knop.isVisible())) return;
  await expect(page.locator("#sTitle")).not.toBeEmpty();
  await expect(async () => { if ((await knop.getAttribute("aria-expanded")) !== "true") await knop.click(); await page.waitForTimeout(120); expect(await knop.getAttribute("aria-expanded")).toBe("true"); }).toPass();
}
const sleutels = (page: Page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:")).map((k) => [k, localStorage.getItem(k)])));
// Het deelmenu van het toestel nagebootst: wat de pagina zou delen, komt in window.__gedeeld.
const metDelen = (page: Page) => page.addInitScript(() => {
  (window as unknown as { __gedeeld: unknown[] }).__gedeeld = [];
  Object.defineProperty(Navigator.prototype, "share", { configurable: true, value: (d: unknown) => { (window as unknown as { __gedeeld: unknown[] }).__gedeeld.push(d); return Promise.resolve(); } });
});
// Geen deelmenu (zoals op de meeste computers); het klembord werkt, of juist niet.
const zonderDelen = (page: Page, klembord: boolean) => page.addInitScript((werkt) => {
  Object.defineProperty(Navigator.prototype, "share", { configurable: true, value: undefined });
  (window as unknown as { __gekopieerd: string[] }).__gekopieerd = [];
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (t: string) => (werkt ? ((window as unknown as { __gekopieerd: string[] }).__gekopieerd.push(t), Promise.resolve()) : Promise.reject(new Error("geen klembord"))) } });
}, klembord);
const gedeeld = (page: Page) => page.evaluate(() => (window as unknown as { __gedeeld: { title: string; text: string; url: string }[] }).__gedeeld);

// ---------- 1. de eerste tien seconden ----------

// Het zichtbare venster van een telefoonbrowser mét browserbalken: iPhone 13 in Safari, iPhone SE in Safari, kleine Android.
for (const [w, h] of [[390, 664], [375, 553], [360, 640]] as const) {
  test.describe(`eerste bezoek ${w}×${h}`, () => {
    test.use({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    test.beforeEach(({}, ti) => { test.skip(ti.project.name !== "mobiel", "telefoonmaten één keer, in het project mobiel"); });

    test("de zin en de startknop staan zonder scrollen in het eerste scherm; een tik begint de reis van Abraham", async ({ page }) => {
      const errors = watchErrors(page);
      await open(page);
      await expect(page.locator("#welkom .st-zin")).toHaveText(ZIN);
      const knop = page.locator("#welkom .st-knop");
      await expect(knop).toContainText("Begin de reis");
      await expect(knop).toContainText("Abraham · van Ur naar Kanaän");
      const m = await page.evaluate(() => {
        const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        return { zinTop: r(".st-zin").top, knopOnder: r(".st-knop").bottom, knopH: r(".st-knop").height, balk: r(".tabs").top, kaartOnder: r(".mapwrap").bottom, kaartH: r(".mapwrap").height, scrollY, breed: document.documentElement.scrollWidth <= innerWidth };
      });
      expect(m.scrollY).toBe(0);
      expect(m.zinTop).toBeGreaterThanOrEqual(m.kaartOnder); // onder de kaart, die er nog gewoon staat
      expect(m.kaartH).toBeGreaterThanOrEqual(180);
      expect(m.knopOnder).toBeLessThanOrEqual(m.balk); // niet onder de onderbalk
      expect(m.knopH).toBeGreaterThanOrEqual(56);
      expect(m.breed).toBe(true);
      await knop.tap();
      await expect(page).toHaveURL(/#abraham$/);
      await expect(page.locator("body")).toHaveAttribute("data-modus", "reis");
      await expect(page.locator("#sTitle")).toHaveText("Abraham");
      // De route staat in beeld, boven het korte stapblad: Ur en Haran zijn op de kaart te lezen.
      await expect.poll(() => page.evaluate(() => {
        const blad = document.getElementById("reisboek")!.getBoundingClientRect().top;
        return [...document.querySelectorAll("#map .plaats .lab")].filter((e) => !e.classList.contains("off") && !e.classList.contains("clash")).filter((e) => { const r = e.getBoundingClientRect(); return r.top > 44 && r.bottom < blad && r.left >= 0 && r.right <= innerWidth; }).map((e) => ((e.firstChild && e.firstChild.textContent) || "").trim());
      })).toEqual(expect.arrayContaining(["Ur", "Haran"]));
      // Het korte stapblad is niet hoger geworden: de knop Deel staat alleen in het open blad.
      const blad = await page.evaluate(() => document.getElementById("reisboek")!.getBoundingClientRect().height / innerHeight);
      expect(blad).toBeLessThanOrEqual(0.27);
      await expect(page.locator("#sDeel .deelknop")).toBeHidden();
      expect(errors).toEqual([]);
    });

    test("in de kersttijd staat de knop van de kerstreis in het eerste scherm, met de zin erboven en Abraham eronder", async ({ page }) => {
      const errors = watchErrors(page);
      await open(page, "", { tijd: "2026-12-08T10:00:00" });
      await expect(page.locator("#welkom .st-zin")).toHaveText(ZIN);
      await expect(page.locator("#welkom .st-knop")).toHaveCount(0);
      const knop = page.locator("#seizoen .sz-knop");
      await expect(knop).toHaveText(/^Lees deel 2/);
      const m = await page.evaluate(() => { const r = (s: string) => document.querySelector(s)!.getBoundingClientRect(); return { zin: r(".st-zin").top, kaart: r("#seizoen").top, knopOnder: r(".sz-knop").bottom, balk: r(".tabs").top, na: r("#welkomNa").top, kaartOnder: r("#seizoen").bottom }; });
      expect(m.zin).toBeLessThan(m.kaart);
      expect(m.knopOnder).toBeLessThanOrEqual(m.balk);
      expect(m.na).toBeGreaterThanOrEqual(m.kaartOnder);
      await expect(page.locator("#welkomNa .st-tweede")).toHaveText(/^Of begin bij Abraham · van Ur naar Kanaän/);
      await expect(page.locator("#welkomNa .st-nivopt")).toHaveCount(3);
      expect(errors).toEqual([]);
    });
  });
}

test("eerste bezoek: één zin, één startknop, klein de keuze voor wie; alleen de standaardkeuze wordt bewaard", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  const kaart = page.locator("#welkom .startkaart");
  await expect(kaart).toBeVisible();
  await expect(kaart.locator(".st-zin")).toHaveText(ZIN);
  await expect(kaart.locator(".st-knop")).toHaveCount(1);
  await expect(kaart.locator(".st-of")).toHaveText("Of kies hieronder zelf een verhaal.");
  await expect(kaart).not.toContainText("Hoe wil je op reis?");
  // Niemand hoeft te kiezen: ‘Zelf op reis’ staat al aan, in de kaart en bovenin.
  await expect(kaart.locator(".st-nivopt")).toHaveCount(3);
  await expect(kaart.locator('.st-nivopt[aria-pressed="true"]')).toHaveText(/7–10 jaar\s*Zelf op reis/);
  await expect(page.locator("#niveauNaam")).toHaveText("Zelf op reis");
  expect(await sleutels(page)).toEqual({ "bijbelreis:niveau": '"b"' });
  // De lijst staat er gewoon onder.
  await expect(page.locator("#vLijst [data-v]")).toHaveCount(150);
  await expect(page.locator("#welkomNa")).toBeHidden();
  const axe = await new AxeBuilder({ page }).include("#welkom").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  // De startknop begint meteen bij de eerste stap van Abraham in Reis (geen tussenscherm met nog een knop ‘Start’).
  await kaart.locator(".st-knop").click();
  await expect(page).toHaveURL(/#abraham\/1$/);
  await expect(page.locator("#sTitle")).toHaveText("1. Weg uit Ur");
  expect(errors).toEqual([]);
});

test("eerste bezoek: het niveau wisselen kan op de startkaart; de kaart blijft staan en de keuze wordt onthouden", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  const kaart = page.locator("#welkom .startkaart");
  await kaart.getByRole("button", { name: /Samen ontdekken/ }).click();
  await expect(page.locator("#niveauNaam")).toHaveText("Samen ontdekken");
  await expect(kaart.locator('.st-nivopt[aria-pressed="true"]')).toHaveText(/4–6 jaar\s*Samen ontdekken/);
  await expect(kaart.locator(".st-knop")).toContainText("Begin de reis");
  await expect(page.locator("#p-verhalen h2")).toHaveText("Samen ontdekken");
  expect(JSON.parse((await sleutels(page))["bijbelreis:niveau"]!)).toBe("a");
  await kaart.getByRole("button", { name: /Verder ontdekken/ }).click();
  await expect(page.locator("#niveauNaam")).toHaveText("Verder ontdekken");
  await expect(kaart.locator('.st-nivopt[aria-pressed="true"]')).toHaveText(/11\+\s*Verder ontdekken/);
  // Wie het niveau koos maar nog niets opende, ziet bij het volgende bezoek nog steeds de startknop.
  await open(page);
  await expect(page.locator("#welkom .st-knop")).toBeVisible();
  await expect(page.locator("#niveauNaam")).toHaveText("Verder ontdekken");
  await expect(page.locator('#welkom .st-nivopt[aria-pressed="true"]')).toHaveText(/11\+/);
  expect(errors).toEqual([]);
});

test("zodra er voortgang is, staat er ‘Verder met’ en geen startkaart; het niveau verspringt niet", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  await expect(page.locator("#welkom .startkaart")).toBeVisible();
  // Een geschiedenis openen vanaf de lijst: de startkaart hoort daar niet boven.
  await page.locator('#vLijst [data-v="1"]').click();
  await expect(page.locator("#vTitel")).toContainText("God schept hemel en aarde");
  await expect(page.locator(".startkaart")).toHaveCount(0);
  await page.locator("#vTerug").click();
  await expect(page.locator("#welkom .verdermet")).toHaveText(/^Verder met: /);
  await expect(page.locator(".startkaart")).toHaveCount(0);
  // Volgend bezoek: nog steeds ‘Zelf op reis’ (niet de volledige inhoud van wie al onderweg was), en ‘Verder met’.
  await open(page);
  await expect(page.locator("#welkom .verdermet")).toHaveCount(1);
  await expect(page.locator(".startkaart")).toHaveCount(0);
  await expect(page.locator("#niveauNaam")).toHaveText("Zelf op reis");
  await expect(page.locator("#welkom .rk-tip")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveClass(/eerste/);
  expect(errors).toEqual([]);
});

test("een gedeelde link opent het verhaal of het deel meteen, zonder startkaart ertussen", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "#v26");
  await expect(page.locator("#vTitel")).toContainText("Droog door de Schelfzee");
  await expect(page.locator(".startkaart")).toHaveCount(0);
  await expect(page.locator("#welkom")).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/eerste/);
  expect(errors).toEqual([]);
});

test("een gedeelde link naar een deel opent de reis, zonder startkaart", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "#jakob");
  await expect(page.locator("#sTitle")).toHaveText("Jakob");
  await expect(page.locator("body")).toHaveAttribute("data-modus", "reis");
  await expect(page.locator(".startkaart")).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ---------- 2. advent als ritme ----------

for (const [dag, tijd, nr, volgende] of [
  ["zondag 29 november", "2026-11-29T10:00:00", 1, "Volgende zondag: deel 2 – Van David tot Jozef"],
  ["zaterdag 5 december", "2026-12-05T22:00:00", 1, "Volgende zondag: deel 2 – Van David tot Jozef"],
  ["zondag 13 december", "2026-12-13T08:00:00", 3, "Volgende zondag: deel 4 – De geboorte in Bethlehem"],
  ["eerste kerstdag", "2026-12-25T10:00:00", 4, "Volgende zondag: deel 5 – De wijzen, Egypte en Nazareth"],
  ["zondag 27 december", "2026-12-27T10:00:00", 5, "Volgende zondag: deel 6 – Twaalf jaar: in het huis van Zijn Vader"],
  ["maandag 4 januari", "2027-01-04T10:00:00", 6, ""],
] as const) {
  test(`advent: op ${dag} is deel ${nr} van de kerstreis aan de beurt; niets zit op slot`, async ({ page }) => {
    const errors = watchErrors(page);
    // Een terugkerende bezoeker (één geschiedenis gelezen) die nog niet aan de kerstreis begon.
    await open(page, "", { tijd, opslag: { niveau: "b", verhalen: { 1: { g: 1 } }, huidig: { v: 1 } } });
    const kaart = page.locator("#seizoen");
    await expect(kaart).toBeVisible();
    await expect(kaart.locator("h2")).toHaveText("Kerst: van Adam tot Bethlehem");
    await expect(kaart.locator(".sz-zin")).toContainText("de Heere Jezus");
    await expect(kaart.locator(".sz-week span")).toHaveText(`Deze week · deel ${nr} van 6`);
    await expect(kaart.locator(".sz-week b")).toHaveText(DELEN[nr - 1][1]);
    await expect(kaart.locator(".sz-knop")).toHaveText(new RegExp(`^Lees deel ${nr}`));
    // Zes merktekens: het deel van deze week is aangewezen, de andere zijn gewoon knoppen.
    const merk = kaart.locator(".sz-merk");
    await expect(merk).toHaveCount(6);
    await expect(kaart.locator('.sz-merk[aria-current="true"]')).toHaveCount(1);
    await expect(merk.nth(nr - 1)).toHaveAttribute("aria-current", "true");
    await expect(merk.nth(nr - 1)).toHaveAttribute("aria-label", `Deel ${nr}: ${DELEN[nr - 1][1]}, deze week`);
    expect(await merk.evaluateAll((els) => els.every((e) => !(e as HTMLButtonElement).disabled))).toBe(true);
    if (volgende) await expect(kaart.locator(".sz-volgende")).toHaveText(volgende); else await expect(kaart.locator(".sz-volgende")).toHaveCount(0);
    // Wie later instapt, kan bij deel 1 beginnen.
    if (nr > 1) await expect(kaart.locator(".sz-tweede")).toHaveText("Begin bij deel 1"); else await expect(kaart.locator(".sz-tweede")).toHaveCount(0);
    await expect(kaart.locator("a, img")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).include("#seizoen").analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
    // De hoofdknop opent het deel van deze week.
    await kaart.locator(".sz-knop").click();
    await expect(page).toHaveURL(new RegExp(`#${DELEN[nr - 1][0]}$`));
    await expect(page.locator("#sTitle")).toHaveText(DELEN[nr - 1][1]);
    // Niets op slot: ook het laatste deel opent gewoon, in elke week.
    await page.getByRole("tab", { name: "Verhalen" }).click();
    await kaart.locator(".sz-merk").nth(5).click();
    await expect(page).toHaveURL(/#kerst-twaalf$/);
    await expect(page.locator("#sTitle")).toHaveText(DELEN[5][1]);
    expect(errors).toEqual([]);
  });
}

test("advent: wie in een eerder deel bezig is, kan daar verder; een gelezen deel is afgevinkt", async ({ page }) => {
  const errors = watchErrors(page);
  const gezien = Array.from({ length: 10 }, (_, i) => `kerst:kerst-belofte:${i}`).concat(["kerst:kerst-koningen:0", "kerst:kerst-koningen:1"]);
  await open(page, "", { tijd: "2026-12-13T10:00:00", opslag: { niveau: "b", gezien, laatst: "kerst:kerst-koningen:1", huidig: { k: "kerst:kerst-koningen:1" } } });
  const kaart = page.locator("#seizoen");
  await expect(kaart.locator(".sz-week span")).toHaveText("Deze week · deel 3 van 6");
  await expect(kaart.locator(".sz-knop")).toHaveText(/^Lees deel 3/);
  await expect(kaart.locator(".sz-tweede")).toHaveText("Verder waar je was: deel 2");
  await expect(kaart.locator(".sz-merk.gelezen")).toHaveCount(1);
  await expect(kaart.locator(".sz-merk").nth(0)).toHaveAttribute("aria-label", "Deel 1: De belofte: van Adam tot David, gelezen");
  // Wie al begonnen is, heeft de uitleg van het thema niet meer nodig; en er staat geen tweede ‘Verder met’ naar dezelfde stap.
  await expect(kaart.locator(".sz-zin")).toHaveCount(0);
  await expect(page.locator("#welkom .verdermet")).toHaveCount(0);
  await expect(page.locator(".startkaart")).toHaveCount(0);
  await kaart.locator(".sz-tweede").click();
  await expect(page).toHaveURL(/#kerst-koningen\/2$/);
  // De opslag is niet veranderd: dezelfde sleutels, dezelfde stempels.
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien")!).length)).toBe(12);
  expect(errors).toEqual([]);
});

test("advent: wie in het deel van deze week bezig is, gaat daar verder; is het uit, dan kan het nog eens", async ({ page, browser }) => {
  const errors = watchErrors(page);
  await open(page, "", { tijd: "2026-12-08T10:00:00", opslag: { niveau: "b", gezien: ["kerst:kerst-koningen:0", "kerst:kerst-koningen:1", "kerst:kerst-koningen:2"], laatst: "kerst:kerst-koningen:2" } });
  await expect(page.locator("#seizoen .sz-knop")).toHaveText(/^Verder met deel 2/);
  await expect(page.locator("#seizoen .sz-tweede")).toHaveCount(0);
  await page.locator("#seizoen .sz-knop").click();
  await expect(page).toHaveURL(/#kerst-koningen\/3$/);
  expect(errors).toEqual([]);
  const ctx = await browser.newContext({ viewport: page.viewportSize() ?? undefined, baseURL: new URL(page.url()).origin });
  const p2 = await ctx.newPage();
  await open(p2, "", { tijd: "2026-12-08T10:00:00", opslag: { niveau: "b", gezien: Array.from({ length: 10 }, (_, i) => `kerst:kerst-koningen:${i}`), laatst: "kerst:kerst-koningen:9" } });
  await expect(p2.locator("#seizoen .sz-knop")).toHaveText(/^Lees deel 2 nog eens/);
  await expect(p2.locator("#seizoen .sz-merk").nth(1)).toHaveAttribute("aria-label", "Deel 2: Van David tot Jozef, deze week, gelezen");
  await ctx.close();
});

test("advent: buiten het seizoen staat er geen seizoenskaart en is de startknop gewoon Abraham", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "", { tijd: "2027-01-07T10:00:00" });
  await expect(page.locator("body")).not.toHaveAttribute("data-seizoen", /./);
  await expect(page.locator("#seizoen")).toBeHidden();
  await expect(page.locator("#seizoen")).toBeEmpty();
  await expect(page.locator("#welkom .st-knop")).toContainText("Begin de reis");
  await expect(page.locator("#welkomNa")).toBeHidden();
  await expect(page.locator("#p-verhalen")).not.toContainText("kerstreis");
  expect(errors).toEqual([]);
});

// ---------- 3. delen ----------

test("delen: een geschiedenis heeft de knop Deel bij de titel en onderaan; gedeeld wordt alleen het adres op bijbelreis.nl", async ({ page }) => {
  const errors = watchErrors(page);
  await metDelen(page);
  await open(page, "#v26", { opslag: { niveau: "b", verhalen: { 26: { g: 1 } }, gezien: ["exodus:uittocht:5"], laatst: "exodus:uittocht:5" } });
  await expect(page.locator("#vTitel")).toContainText("Droog door de Schelfzee");
  const knoppen = page.locator("#p-verhalen .deelknop");
  await expect(knoppen).toHaveCount(2);
  await expect(knoppen.nth(0)).toHaveText("Deel");
  await expect(knoppen.nth(1)).toHaveText("Deel deze geschiedenis");
  expect((await knoppen.nth(0).boundingBox())!.height).toBeGreaterThanOrEqual(smal(page) ? 44 : 36);
  await knoppen.nth(0).click();
  await knoppen.nth(1).click();
  const g = await gedeeld(page);
  expect(g).toHaveLength(2);
  expect(g[0]).toEqual({ title: "Droog door de Schelfzee", text: "Droog door de Schelfzee – Op reis door de Bijbel", url: "https://bijbelreis.nl/#v26" });
  expect(g[1]).toEqual(g[0]);
  // Geen reisniveau, geen voortgang en niets van de bezoeker in wat gedeeld wordt.
  expect(JSON.stringify(g)).not.toMatch(/niveau|gezien|laatst|exodus:/);
  const axe = await new AxeBuilder({ page }).include("#p-verhalen .tijd").include("#p-verhalen .deelrij").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  expect(errors).toEqual([]);
});

test("delen: in de reis staat Deel bij de intro en de laatste stap van een deel, niet bij een tussenstap en niet in het korte stapblad", async ({ page }) => {
  const errors = watchErrors(page);
  await metDelen(page);
  await open(page, "#jakob", { opslag: { niveau: "c" } });
  await expect(page.locator("#sTitle")).toHaveText("Jakob");
  const knop = page.locator("#sDeel .deelknop");
  if (smal(page)) await expect(knop).toBeHidden(); // kort stapblad: alleen titel, twee regels en Verder
  await bladOpen(page);
  await expect(knop).toBeVisible();
  await expect(knop).toHaveText("Deel deze reis");
  await knop.click();
  expect(await gedeeld(page)).toEqual([{ title: "Jakob", text: "Jakob – Op reis door de Bijbel", url: "https://bijbelreis.nl/#jakob" }]);
  await open(page, "#jakob/3");
  await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
  await bladOpen(page);
  await expect(page.locator("#sDeel")).toBeHidden();
  await open(page, "#jakob/15");
  await expect(page.locator("#sTitle")).toHaveText(/^15\. /);
  await bladOpen(page);
  await expect(page.locator("#sDeel .deelknop")).toBeVisible();
  await page.locator("#sDeel .deelknop").click();
  expect((await gedeeld(page)).pop()!.url).toBe("https://bijbelreis.nl/#jakob");
  expect(errors).toEqual([]);
});

test("delen: de seizoenskaart heeft ‘Deel de kerstreis’", async ({ page }) => {
  const errors = watchErrors(page);
  await metDelen(page);
  await open(page, "", { tijd: "2026-12-08T10:00:00", opslag: { niveau: "b", verhalen: { 1: { g: 1 } } } });
  const knop = page.locator("#seizoen .deelknop");
  await expect(knop).toHaveText("Deel de kerstreis");
  await knop.click();
  expect(await gedeeld(page)).toEqual([{ title: "Kerst: van Adam tot Bethlehem", text: "Kerst: van Adam tot Bethlehem – Op reis door de Bijbel", url: "https://bijbelreis.nl/#kerst-belofte" }]);
  expect(errors).toEqual([]);
});

test("delen zonder deelmenu: de link wordt gekopieerd, met de melding ‘Link gekopieerd’", async ({ page }) => {
  const errors = watchErrors(page);
  await zonderDelen(page, true);
  await open(page, "#v26", { opslag: { niveau: "b" } });
  await page.locator("#p-verhalen .tijd .deelknop").click();
  await expect(page.locator("#toast")).toHaveText("Link gekopieerd");
  await expect(page.locator("#toast")).toHaveClass(/show/);
  expect(await page.evaluate(() => (window as unknown as { __gekopieerd: string[] }).__gekopieerd)).toEqual(["https://bijbelreis.nl/#v26"]);
  await expect(page.locator(".deelveld")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("delen zonder deelmenu en zonder klembord: de link staat in een veld, geselecteerd om te kopiëren", async ({ page }) => {
  const errors = watchErrors(page);
  await zonderDelen(page, false);
  await open(page, "#v26", { opslag: { niveau: "b" } });
  const knop = page.locator("#p-verhalen .tijd .deelknop");
  await knop.click();
  const veld = page.locator("#p-verhalen .tijd .deelveld input");
  await expect(veld).toHaveValue("https://bijbelreis.nl/#v26");
  await expect(veld).toBeFocused();
  await expect(veld).toHaveAttribute("readonly", "");
  expect(await veld.evaluate((e: HTMLInputElement) => e.selectionEnd! - e.selectionStart!)).toBe("https://bijbelreis.nl/#v26".length);
  // Nog een tik maakt geen tweede veld.
  await knop.click();
  await expect(page.locator(".deelveld")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).include("#p-verhalen .tijd").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  expect(errors).toEqual([]);
});

test("delen: niet bij Samen ontdekken", async ({ page }) => {
  const errors = watchErrors(page);
  await metDelen(page);
  await open(page, "#v26", { opslag: { niveau: "a" } });
  await expect(page.locator("#p-verhalen")).toContainText("Droog door de Schelfzee");
  await expect(page.locator(".deelknop")).toHaveCount(0);
  await open(page, "#jakob");
  await expect(page.locator("#sTitle")).toHaveText("Jakob");
  await bladOpen(page);
  await expect(page.locator(".deelknop")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("delen: het deelvoorbeeld van de pagina wijst naar bijbelreis.nl", async ({ page }) => {
  await open(page);
  const og = (p: string) => page.locator(`meta[property="og:${p}"]`).getAttribute("content");
  expect(await og("url")).toBe("https://bijbelreis.nl/");
  expect(await og("image")).toBe("https://bijbelreis.nl/bijbelreis/og.png");
  expect(await og("title")).toContain("Bijbelreis");
});
