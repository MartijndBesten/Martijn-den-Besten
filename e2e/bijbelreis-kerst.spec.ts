import { expect, test, type Page } from "@playwright/test";
import { zonderVoorscherm } from "./voorscherm";

zonderVoorscherm(test);

// Het thema Kerst in de Bijbelreis (docs/bijbelreis-kerst/README.md): een thema is geen Bijbelboek, in het seizoen (van
// de eerste adventszondag tot en met 6 januari) staat het extra in beeld, binnen het thema heeft de atlas een eigen
// uiterlijk, en de zes delen zijn één doorlopende reis. De datum komt van het apparaat: elke test zet een vaste klok.
// Elke pagina wordt vers geopend (eerst about:blank, dan het adres), nooit met een hashwissel en herladen.
const IN_SEIZOEN = "2026-12-10T10:00:00", BUITEN_SEIZOEN = "2027-03-01T10:00:00";
const DELEN = [
  ["kerst-belofte", "De belofte: van Adam tot David", "Belofte", 10],
  ["kerst-koningen", "Van David tot Jozef", "David–Jozef", 10],
  ["kerst-aankondiging", "De aankondiging", "Aankondiging", 10],
  ["kerst-geboorte", "De geboorte in Bethlehem", "Bethlehem", 10],
  ["kerst-wijzen", "De wijzen, Egypte en Nazareth", "Wijzen", 10],
  ["kerst-twaalf", "Twaalf jaar: in het huis van Zijn Vader", "Twaalf jaar", 9],
] as const;
const RAADKOORD = "https://raadkoord.nl/kerst";

test.use({ reducedMotion: "reduce" });

type Opties = { niveau?: "a" | "b" | "c"; opslag?: Record<string, unknown>; wacht?: string };
const klaar = new WeakSet<Page>();
async function open(page: Page, tijd: string, pad: string, o: Opties = {}) {
  // De klok en de beginopslag één keer per test; daarna alleen nog een vers geopende pagina.
  if (!klaar.has(page)) await page.clock.install({ time: new Date(tijd) });
  if (!klaar.has(page)) await page.addInitScript((x) => {
    try {
      if (sessionStorage.getItem("kerstGezet")) return;
      sessionStorage.setItem("kerstGezet", "1");
      localStorage.setItem("bijbelreis:niveau", JSON.stringify(x.niveau || "b"));
      Object.entries(x.opslag || {}).forEach(([k, v]) => localStorage.setItem("bijbelreis:" + k, JSON.stringify(v)));
    } catch { /* about:blank heeft geen opslag */ }
  }, o);
  klaar.add(page);
  await page.goto("about:blank");
  await page.goto(pad);
  await expect(page.locator(o.wacht || "#map .land").first()).toBeAttached();
}
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
const smal = (page: Page) => (page.viewportSize()?.width ?? 1440) <= 900;
// Op de telefoon en de tablet is de kaart het scherm en ligt de stap in een kort stapblad over de kaart: wat verder
// in de stap staat (de rij met delen, de slotzin, de verwijzing), zie je na ‘Lees meer’.
async function bladOpen(page: Page) {
  const knop = page.locator("#bladBtn");
  if (!smal(page) || !(await knop.isVisible())) return;
  await expect(page.locator("#sTitle")).not.toBeEmpty();
  await expect(async () => { if ((await knop.getAttribute("aria-expanded")) !== "true") await knop.click(); await page.waitForTimeout(120); expect(await knop.getAttribute("aria-expanded")).toBe("true"); }).toPass();
}
// De knop ‘Verder’ die er is: op de telefoon onderaan het stapblad, op de desktop in de stapkaart.
const verder = async (page: Page) => page.locator((await page.locator("#next2").isVisible()) ? "#next2" : "#next");
// De keuze van boek en thema: op de desktop boven de stap, op de telefoon in het blad ‘Kies een reis’.
async function openKeuze(page: Page) { if (smal(page)) { await page.locator("#kiesBtn").click(); await expect(page.locator("#kiesLade")).toBeVisible(); } }
const boven = async (page: Page, a: string, b: string) => (await page.locator(a).first().boundingBox())!.y < (await page.locator(b).first().boundingBox())!.y;
// Contrast volgens WCAG tussen twee kleuren zoals de browser ze teruggeeft (rgb of rgba zonder doorzichtigheid).
function contrast(a: string, b: string) {
  const lum = (k: string) => { const [r, g, bl] = k.match(/[\d.]+/g)!.slice(0, 3).map((v) => { const c = +v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// Sinds 16-11-2026 heeft de ingang een weekritme (elke week één deel; e2e/bijbelreis-start.spec.ts test de weken) en ziet
// een nieuwe bezoeker erboven de zin van de startkaart. IN_SEIZOEN is 10 december 2026: de week van deel 2.
test("kerst: in het seizoen staat er één rustige ingang bovenaan Verhalen; die wijst het deel van deze week aan", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, IN_SEIZOEN, "/bijbelreis");
  await expect(page.locator("body")).toHaveAttribute("data-seizoen", "kerst");
  const ingang = page.locator("#seizoen");
  await expect(ingang).toBeVisible();
  await expect(ingang.locator("h2")).toHaveText("Kerst: van Adam tot Bethlehem");
  await expect(ingang.locator(".sz-week span")).toHaveText("Deze week · deel 2 van 6");
  await expect(ingang.locator(".sz-week b")).toHaveText("Van David tot Jozef");
  await expect(ingang.locator(".sz-knop")).toHaveText(/^Lees deel 2/);
  await expect(ingang.locator(".sz-tweede")).toHaveText("Begin bij deel 1");
  await expect(ingang.locator("a, img")).toHaveCount(0);
  // Een nieuwe bezoeker heeft geen ‘Verder met’: boven de ingang staat de zin van de startkaart (die zegt wat de atlas
  // is; de eigen zin van het thema staat er dan niet ook nog). De ingang staat boven de lijst en verandert die niet.
  await expect(page.locator("#welkom .verdermet")).toHaveCount(0);
  await expect(page.locator("#welkom .st-zin")).toBeVisible();
  await expect(ingang.locator(".sz-zin")).toHaveCount(0);
  expect(await boven(page, "#welkom .st-zin", "#seizoen")).toBe(true);
  expect(await boven(page, "#seizoen", "#p-verhalen h2")).toBe(true);
  await expect(page.locator("#vLijst [data-v]")).toHaveCount(150);
  // Buiten het thema is het uiterlijk van de atlas gewoon.
  await expect(page.locator("body")).not.toHaveAttribute("data-thema", /./);
  const knop = await ingang.locator(".sz-knop").evaluate((e) => { const s = getComputedStyle(e); return [s.color, s.backgroundColor, e.getBoundingClientRect().height] as const; });
  expect(contrast(knop[0], knop[1])).toBeGreaterThanOrEqual(4.5);
  expect(knop[2]).toBeGreaterThanOrEqual(44);
  expect((await ingang.locator(".sz-tweede").boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await ingang.locator(".sz-tweede").click();
  await expect(page.locator("#sTitle")).toHaveText("De belofte: van Adam tot David");
  await expect(page).toHaveURL(/#kerst-belofte$/);
  await expect(page.locator("body")).toHaveAttribute("data-thema", "kerst");
  await expect(ingang).toBeHidden();
  // Terug bij Verhalen staat de ingang er weer; bij een geopende geschiedenis niet.
  await page.getByRole("tab", { name: "Verhalen" }).click();
  await expect(ingang).toBeVisible();
  await expect(page.locator("body")).not.toHaveAttribute("data-thema", /./);
  await page.locator('#vLijst [data-v="1"]').click();
  await expect(page.locator("#vTitel")).toContainText("God schept hemel en aarde");
  await expect(ingang).toBeHidden();
  expect(errors).toEqual([]);
});

test("kerst: met voortgang biedt de ingang ‘Verder waar je was’, naar de laatst geopende stap", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, IN_SEIZOEN, "/bijbelreis", { opslag: { gezien: ["kerst:kerst-belofte:0", "kerst:kerst-belofte:1", "kerst:kerst-aankondiging:2"], laatst: "kerst:kerst-aankondiging:2", huidig: { k: "kerst:kerst-aankondiging:2" } } });
  const ingang = page.locator("#seizoen");
  await expect(ingang.locator(".sz-knop")).toHaveText(/^Lees deel 2/);
  await expect(ingang.locator(".sz-tweede")).toHaveText("Verder waar je was: deel 3");
  // In het seizoen doet de ingang dit; er staat geen tweede knop ‘Verder met’ naar dezelfde stap, en geen startkaart.
  await expect(page.locator("#welkom .verdermet")).toHaveCount(0);
  await expect(page.locator(".startkaart")).toHaveCount(0);
  await ingang.locator(".sz-tweede").click();
  await expect(page).toHaveURL(/#kerst-aankondiging\/3$/);
  await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
  // De opslag is niet veranderd: dezelfde sleutels, dezelfde stempels.
  expect(await page.evaluate(() => [JSON.parse(localStorage.getItem("bijbelreis:laatst")!), JSON.parse(localStorage.getItem("bijbelreis:gezien")!).sort()])).toEqual(["kerst:kerst-aankondiging:2", ["kerst:kerst-aankondiging:2", "kerst:kerst-belofte:0", "kerst:kerst-belofte:1"]]);
  expect(errors).toEqual([]);
});

test("kerst: Voorlezen heeft de ingang ook, met een eenvoudige zin en zonder de knop Deel", async ({ page }) => {
  const errors = watchErrors(page);
  // Een gezin dat al een geschiedenis las: dan staat de zin van het thema op de kaart.
  await open(page, IN_SEIZOEN, "/bijbelreis", { niveau: "a", opslag: { verhalen: { 1: { g: 1 } }, huidig: { v: 1 } } });
  const ingang = page.locator("#seizoen");
  await expect(ingang).toBeVisible();
  await expect(ingang.locator(".sz-zin")).toHaveText("Van Adam tot de geboorte van de Heere Jezus in Bethlehem.");
  await expect(ingang.locator(".sz-knop")).toHaveText(/^Lees deel 2/);
  await expect(ingang.locator(".deelknop")).toHaveCount(0);
  await ingang.locator(".sz-knop").click();
  await expect(page.locator("#sTitle")).toHaveText("Van David tot Jozef");
  expect(errors).toEqual([]);
});

test("kerst: buiten het seizoen geen ingang op de start; het thema blijft bereikbaar onder ‘Thema’s’", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, BUITEN_SEIZOEN, "/bijbelreis");
  await expect(page.locator("body")).not.toHaveAttribute("data-seizoen", /./);
  await expect(page.locator("#seizoen")).toBeHidden();
  await expect(page.locator("#seizoen")).toBeEmpty();
  // Een nieuwe bezoeker ziet de gewone startkaart (Abraham), zonder iets van Kerst.
  await expect(page.locator("#welkom .st-knop")).toContainText("Begin de reis");
  await expect(page.locator("#welkom")).not.toContainText(/kerst/i);
  await expect(page.locator("#welkomNa")).toBeHidden();
  await expect(page.locator("#p-verhalen")).not.toContainText("kerstreis");
  // Via Reis en ‘Thema’s’ kom je er wel.
  await page.getByRole("tab", { name: "Reis" }).click();
  await openKeuze(page);
  await page.locator('#themas .boek[data-boek="kerst"]').click();
  await expect(page.locator("#delen .deel")).toHaveCount(6);
  if (smal(page)) await page.locator('#delen .deel[data-deel="kerst-belofte"]').click();
  await expect(page.locator("#sTitle")).toHaveText("De belofte: van Adam tot David");
  await expect(page).toHaveURL(/#kerst-belofte$/);
  expect(errors).toEqual([]);
});

test("kerst: buiten het seizoen gaat ‘Verder met’ naar de stap van het thema waar je was", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, BUITEN_SEIZOEN, "/bijbelreis", { opslag: { gezien: ["kerst:kerst-geboorte:3"], laatst: "kerst:kerst-geboorte:3", huidig: { k: "kerst:kerst-geboorte:3" } } });
  await expect(page.locator("#seizoen")).toBeHidden();
  const v = page.locator("#welkom .verdermet");
  await expect(v).toHaveText(/^Verder met: De geboorte in Bethlehem – Herders in het veld/);
  await v.click();
  await expect(page).toHaveURL(/#kerst-geboorte\/4$/);
  expect(errors).toEqual([]);
});

for (const [naam, tijd] of [["in het seizoen", IN_SEIZOEN], ["buiten het seizoen", BUITEN_SEIZOEN]] as const) {
  test(`kerst: ${naam} staat het thema onder ‘Thema’s’, niet tussen de Bijbelboeken (boekenrij, keuzeblad, boekenkast)`, async ({ page }) => {
    const errors = watchErrors(page);
    const seizoen = tijd === IN_SEIZOEN;
    await open(page, tijd, "/bijbelreis#abraham/2");
    await openKeuze(page);
    // De boekenrij: alleen Bijbelboeken, van Genesis tot Openbaring.
    const boeken = await page.locator("#boeken .boek").evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.boek));
    expect(boeken).not.toContain("kerst");
    expect(boeken[0]).toBe("genesis");
    expect(boeken[boeken.length - 1]).toBe("openbaring");
    expect(await page.evaluate(() => (window as unknown as { BR: { boeken: { thema?: string }[] } }).BR.boeken.filter((b) => !b.thema).length)).toBe(boeken.length);
    // Thema’s: een eigen groep met een eigen kopje en precies één thema.
    await expect(page.locator("#themaLabel")).toHaveText("Thema’s");
    await expect(page.locator("#themaLabel")).toBeVisible();
    const thema = page.locator("#themas .boek");
    await expect(thema).toHaveCount(1);
    await expect(thema).toHaveText("Kerst: van Adam tot Bethlehem");
    await expect(thema).toHaveAttribute("aria-pressed", "false");
    expect((await thema.boundingBox())!.height).toBeGreaterThanOrEqual(smal(page) ? 44 : 34);
    // In het seizoen staat het thema vóór de Bijbelboeken, met een eigen accent; daarbuiten erna, zonder.
    expect(await boven(page, "#themas", "#boeken")).toBe(seizoen);
    const kleur = await thema.evaluate((e) => { const s = getComputedStyle(e); return [s.color, s.backgroundColor] as const; });
    expect(contrast(kleur[0], kleur[1])).toBeGreaterThanOrEqual(4.5);
    expect(kleur[1] === "rgb(27, 43, 85)").toBe(seizoen);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    // De boekenkast: 66 boeken, en het thema daarbuiten in een eigen groep.
    await page.locator("#kastBtn").click();
    const kast = page.locator("#kast");
    await expect(kast).toBeVisible();
    await expect(kast.locator(".kb")).toHaveCount(66);
    await expect(kast.locator(".kb", { hasText: "Kerst" })).toHaveCount(0);
    await expect(kast.locator(".kastthemas .label")).toHaveText("Thema’s");
    await expect(kast.locator(".kthema")).toHaveCount(1);
    await expect(kast.locator(".kthema")).toContainText("Kerst");
    await expect(kast.locator(".kthema")).toContainText("6 delen · 59 stappen");
    expect(await kast.locator("#kastLijst > *").first().evaluate((e) => e.classList.contains("kastthemas"))).toBe(seizoen);
    expect(await kast.locator("#kastLijst > *").last().evaluate((e) => e.classList.contains("kastthemas"))).toBe(!seizoen);
    await kast.locator(".kthema").click();
    await expect(kast).toBeHidden();
    await expect(page.locator("#sTitle")).toHaveText("De belofte: van Adam tot David");
    // Nu is het thema gekozen en geen Bijbelboek.
    await expect(page.locator('#boeken .boek[aria-pressed="true"]')).toHaveCount(0);
    await expect(page.locator('#themas .boek[aria-pressed="true"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

test("kerst: de diepe link #kerst-geboorte/3 opent de geboorte, zonder tafereel; de stap van de herders heeft er wel een", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, BUITEN_SEIZOEN, "/bijbelreis#kerst-geboorte/3");
  await expect(page.locator("#sTitle")).toHaveText("3. De geboorte");
  await expect(page.locator(smal(page) ? "#leesRef" : "#sRef")).toHaveText("Lukas 2:6–7");
  await expect(page.locator("#sText")).toContainText("kribbe");
  await expect(page).toHaveURL(/#kerst-geboorte\/3$/);
  // Geen beeld bij de geboorte: de Heere Jezus wordt niet afgebeeld, ook niet als Kind.
  await expect(page.locator("#p-reis .tafereel")).toHaveCount(0);
  await expect(page.locator("#p-reis svg.tf-svg")).toHaveCount(0);
  // De stempel hangt aan de bestaande stapsleutel.
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien")!))).toContain("kerst:kerst-geboorte:2");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:laatst")!))).toBe("kerst:kerst-geboorte:2");
  // In dit deel (Nieuwe Testament) is de reiziger een stip, geen kameel.
  await expect(page.locator("#map .camel")).toHaveClass(/\bnt\b/);
  if (smal(page)) await expect(page.locator("#kiesBtn")).toContainText("Kerst");
  else await expect(page.locator("#sCrumb")).toContainText("Kerst");
  // De volgende stap, de herders in het veld, heeft wel een tafereel.
  await (await verder(page)).click();
  await expect(page.locator("#sTitle")).toHaveText("4. Herders in het veld");
  await expect(page).toHaveURL(/#kerst-geboorte\/4$/);
  await expect(page.locator("#p-reis .stapkaart .tafereel")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("kerst: het boek en de andere delen openen via hun eigen adres; de eerste delen spelen in het Oude Testament", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, BUITEN_SEIZOEN, "/bijbelreis#kerst");
  await expect(page.locator("#sTitle")).toHaveText("De belofte: van Adam tot David");
  // Van Adam tot David reist de kameel van het Oude Testament.
  await expect(page.locator("#map .camel")).not.toHaveClass(/\bnt\b/);
  await page.goto("about:blank");
  await page.goto("/bijbelreis#kerst-wijzen/5");
  await expect(page.locator("#sTitle")).toHaveText("5. In het huis: goud, wierook en mirre");
  await expect(page.locator("#map .camel")).toHaveClass(/\bnt\b/);
  expect(errors).toEqual([]);
});

test("kerst: binnen het thema heeft de atlas een eigen uiterlijk, daarbuiten verandert er niets", async ({ page }) => {
  const errors = watchErrors(page);
  const stijl = () => page.evaluate(() => {
    const cs = (sel: string) => getComputedStyle(document.querySelector(sel)!);
    const knop = cs(document.querySelector("#next2")!.getClientRects().length ? "#next2" : "#next");
    return {
      thema: document.body.dataset.thema || "", nacht: cs("body").getPropertyValue("--nacht").trim(), kaartNacht: cs("#map").getPropertyValue("--nacht").trim(),
      kop: cs(".kop").backgroundImage, kopKleur: cs(".kop").backgroundColor, rand: cs(".stapkaart").borderTopWidth,
      // De strook avondlucht: op de desktop boven de stapkaart, op de telefoon bovenaan het stapblad (achter de greep).
      kaartBg: cs(innerWidth <= 900 ? ".bladbalk" : ".stapkaart").backgroundImage, blad: document.getElementById("reisboek")!.getBoundingClientRect().height,
      // De ster in de kop: op de desktop achter de titel, op de telefoon klein boven de kameel.
      titel: cs("#sTitle").color, knop: [knop.color, knop.backgroundColor], ster: innerWidth <= 900 ? getComputedStyle(document.querySelector(".kop-titel")!, "::before").content : getComputedStyle(document.querySelector(".kop h1")!, "::after").content,
      bladknop: innerWidth <= 900 ? [cs("#bladBtn").color, cs("#kaartBtn").color] : [],
      statusbalk: document.querySelector('meta[name="theme-color"]')!.getAttribute("content"), zee: cs("#map").backgroundColor,
    };
  });
  // Buiten Kerst: de gewone atlas.
  await open(page, IN_SEIZOEN, "/bijbelreis#abraham/2");
  const gewoon = await stijl();
  expect(gewoon.thema).toBe("");
  expect(gewoon.kop).toBe("none");
  if (!smal(page)) expect(gewoon.rand).toBe("4px");
  expect(gewoon.kaartBg).toBe("none");
  expect(gewoon.ster).toBe("none");
  expect(gewoon.statusbalk).toBe("#f5f0e5");
  expect(gewoon.kopKleur).toBe("rgb(245, 240, 229)"); // lichte kop (21-11-2026)
  // Binnen Kerst: nachtblauw en lamplicht, de ster, een strook avondlucht boven de stap.
  await page.goto("about:blank");
  await page.goto("/bijbelreis#kerst-geboorte/4");
  await expect(page.locator("body")).toHaveAttribute("data-thema", "kerst");
  const kerst = await stijl();
  expect(kerst.kop).toContain("gradient");
  if (!smal(page)) expect(kerst.rand).toBe("0px");
  expect(kerst.kaartBg).toContain("gradient");
  expect(kerst.ster).not.toBe("none");
  expect(kerst.statusbalk).toBe("#14213f");
  expect(kerst.nacht).not.toBe(gewoon.nacht);
  expect(kerst.titel).not.toBe(gewoon.titel);
  expect(kerst.knop).not.toEqual(gewoon.knop);
  // Leesbaar (AA): de hoofdknop en de titel van de stap op wit.
  expect(contrast(kerst.knop[0], kerst.knop[1])).toBeGreaterThanOrEqual(4.5);
  expect(contrast(kerst.titel, "rgb(255, 252, 246)")).toBeGreaterThanOrEqual(7);
  if (smal(page)) {
    // Kaart voorop: het stapblad is in het thema niet hoger dan daarbuiten (de strook ligt achter de greep), en
    // ‘Lees meer’ en de kaartknop zijn leesbaar op wit.
    expect(Math.abs(kerst.blad - gewoon.blad)).toBeLessThanOrEqual(0.5);
    for (const k of kerst.bladknop) expect(contrast(k, "rgb(255, 252, 246)")).toBeGreaterThanOrEqual(7);
    expect(await page.locator("#kiesBtn .kster").count()).toBe(1);
  }
  // De kaart en de tekeningen houden hun eigen kleuren: routes en taferelen veranderen niet.
  expect(kerst.kaartNacht).toBe("#243d70");
  expect(kerst.zee).toBe(gewoon.zee);
  expect(await page.locator(".stapkaart .tf-svg").evaluate((e) => getComputedStyle(e).getPropertyValue("--nacht").trim())).toBe("#243d70");
  // Minder beweging: de ster in de kop staat stil.
  const adem = () => page.evaluate(() => (innerWidth <= 900 ? getComputedStyle(document.querySelector(".kop-titel")!, "::before") : getComputedStyle(document.querySelector(".kop h1")!, "::after")).animationName);
  expect(await adem()).toBe("none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await adem()).toBe("kerst-adem");
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Het uiterlijk hoort bij het thema, niet bij de hele atlas: bij Verhalen en het paspoort is het uit, bij Wie is wie
  // (de personen van Kerst) aan, en terug in de reis weer aan.
  await page.getByRole("tab", { name: "Verhalen" }).click();
  await expect(page.locator("body")).not.toHaveAttribute("data-thema", /./);
  expect(await page.evaluate(() => document.querySelector('meta[name="theme-color"]')!.getAttribute("content"))).toBe("#f5f0e5");
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect(page.locator("body")).not.toHaveAttribute("data-thema", /./);
  await page.getByRole("tab", { name: "Wie is wie" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-thema", "kerst");
  await page.getByRole("tab", { name: "Reis" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-thema", "kerst");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // Een ander boek kiezen zet het uit.
  await openKeuze(page);
  await page.locator('#boeken .boek[data-boek="ruth"]').click();
  await expect(page.locator("body")).not.toHaveAttribute("data-thema", /./);
  expect(errors).toEqual([]);
});

test("kerst: in de intro van elk deel staat waar je bent, met de zes delen op een rij", async ({ page }) => {
  const errors = watchErrors(page);
  for (const [i, [id, titel, kort]] of DELEN.entries()) {
    await page.goto("about:blank");
    await open(page, BUITEN_SEIZOEN, `/bijbelreis#${id}`);
    await expect(page.locator("#sTitle")).toHaveText(titel);
    // Op de telefoon zegt de kleine regel van het korte blad al waar je bent; de rij met delen staat in het open blad.
    if (smal(page)) await expect(page.locator("#kiesBtn .kr-stap")).toHaveText(`deel ${i + 1} van 6`);
    await bladOpen(page);
    const pad = page.locator("#sThema");
    await expect(pad).toBeVisible();
    await expect(pad.locator(".tp-kop")).toHaveText(`Kerst · deel ${i + 1} van 6`);
    await expect(pad.locator(".tp-deel")).toHaveCount(6);
    expect(await pad.locator(".tp-deel span").allTextContents()).toEqual(DELEN.map((d) => d[2]));
    await expect(pad.locator('.tp-deel[aria-current="step"]')).toHaveCount(1);
    await expect(pad.locator('.tp-deel[aria-current="step"] span')).toHaveText(kort);
    // Niets afgekapt of buiten het vak, en groot genoeg om te tikken.
    const maten = await pad.locator(".tp-deel").evaluateAll((l) => { const p = document.getElementById("sThema")!.getBoundingClientRect(); return l.map((e) => { const r = e.getBoundingClientRect(), s = e.querySelector("span")!; return { binnen: r.left >= p.left - 0.5 && r.right <= p.right + 0.5, h: r.height, past: s.scrollWidth <= s.clientWidth + 1 }; }); });
    for (const m of maten) { expect(m.binnen).toBe(true); expect(m.past).toBe(true); expect(m.h).toBeGreaterThanOrEqual(smal(page) ? 44 : 34); }
  }
  // Bij een stap staat de rij er niet: daar gaat het om de stap zelf. Buiten een thema bestaat hij niet.
  await page.goto("about:blank");
  await page.goto("/bijbelreis#kerst-geboorte/4");
  await expect(page.locator("#sTitle")).toHaveText("4. Herders in het veld");
  if (smal(page)) await expect(page.locator("#kiesBtn")).toHaveText(/Kerst.*Bethlehem.*4 van 10/);
  await bladOpen(page);
  await expect(page.locator("#sThema")).toBeHidden();
  await page.goto("about:blank");
  await page.goto("/bijbelreis#abraham");
  await expect(page.locator("#sTitle")).toHaveText("Abraham");
  await bladOpen(page);
  await expect(page.locator("#sThema")).toBeHidden();
  // Een tik op een deel in de rij opent dat deel.
  await page.goto("about:blank");
  await page.goto("/bijbelreis#kerst-belofte");
  await expect(page.locator("#sTitle")).toHaveText("De belofte: van Adam tot David");
  await bladOpen(page);
  await page.locator("#sThema .tp-deel").nth(4).click();
  await expect(page.locator("#sTitle")).toHaveText("De wijzen, Egypte en Nazareth");
  await expect(page).toHaveURL(/#kerst-wijzen$/);
  expect(errors).toEqual([]);
});

test("kerst: de zes delen lopen in elkaar door: na de laatste stap gaat ‘Verder’ naar het volgende deel", async ({ page }) => {
  const errors = watchErrors(page);
  for (const [i, [id, , , n]] of DELEN.entries()) {
    await page.goto("about:blank");
    await open(page, BUITEN_SEIZOEN, `/bijbelreis#${id}/${n}`);
    await expect(page.locator("#sTitle")).toHaveText(new RegExp(`^${n}\\. `));
    const knop = await verder(page), volgend = DELEN[i + 1];
    if (!volgend) {
      // Het einde van de reis: geen sprong naar een Bijbelboek, wel een slotzin.
      await expect(knop).toBeDisabled();
      await expect(knop).toHaveText("Einde van de kerstreis");
      await bladOpen(page);
      await expect(page.locator("#sSlot")).toBeVisible();
      await expect(page.locator("#sSlot")).toContainText("Hier eindigt de kerstreis");
      continue;
    }
    await expect(knop).toHaveText(`Naar ${volgend[2]} ▶`);
    await expect(page.locator("#sSlot")).toBeHidden();
    await knop.click();
    await expect(page.locator("#sTitle")).toHaveText(volgend[1]);
    await expect(page).toHaveURL(new RegExp(`#${volgend[0]}$`));
    await expect(page.locator("#sThema .tp-kop")).toHaveText(`Kerst · deel ${i + 2} van 6`);
    // Het deel dat je net uit hebt, is afgevinkt als je alle stappen gezien hebt (hier alleen de laatste: dus niet).
    await expect(page.locator("#sThema .tp-deel.af")).toHaveCount(0);
    // En terug: ‘Vorige’ vanaf de intro gaat naar de laatste stap van het vorige deel.
    await page.locator(smal(page) ? "#prev" : "#prev2").click();
    await expect(page).toHaveURL(new RegExp(`#${id}/${n}$`));
  }
  // De reis begint bij het eerste deel: daar is ‘Vorige’ uit, en de Bijbelboeken lopen niet door in het thema.
  await page.goto("about:blank");
  await page.goto("/bijbelreis#kerst-belofte");
  await expect(page.locator(smal(page) ? "#prev" : "#prev2")).toBeDisabled();
  await expect(await verder(page)).toHaveText("Start ▶");
  const slot = await page.evaluate(() => { const br = (window as unknown as { BR: { boeken: { id: string; thema?: string; delen: { id: string; bij?: string; steps: unknown[] }[] }[] } }).BR; const b = br.boeken.filter((x) => !x.thema).pop()!, d = b.delen.filter((x) => !x.bij).pop()!; return `${d.id}/${d.steps.length}`; });
  await page.goto("about:blank");
  await page.goto(`/bijbelreis#${slot}`);
  await expect(page).toHaveURL(new RegExp(`#${slot}$`));
  await expect(await verder(page)).toBeDisabled();
  await expect(await verder(page)).toHaveText("Verder ▶");
  expect(errors).toEqual([]);
});

test("kerst: wie alle stappen van een deel gezien heeft, ziet dat deel afgevinkt in de rij", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, BUITEN_SEIZOEN, "/bijbelreis#kerst-koningen", { opslag: { gezien: Array.from({ length: 10 }, (_, i) => `kerst:kerst-belofte:${i}`) } });
  const af = page.locator("#sThema .tp-deel.af");
  await expect(af).toHaveCount(1);
  await expect(af.locator("span")).toHaveText("Belofte");
  await expect(af).toHaveAttribute("aria-label", "Deel 1: De belofte: van Adam tot David, alle stappen gezien");
  expect(errors).toEqual([]);
});

test("kerst: één bescheiden verwijzing naar Raadkoord Kerst, alleen in het thema: in de intro van het eerste deel en na de laatste stap", async ({ page }) => {
  const errors = watchErrors(page);
  const link = page.locator(`a[href="${RAADKOORD}"]`);
  await open(page, IN_SEIZOEN, "/bijbelreis#kerst-belofte");
  await expect(link).toHaveCount(1);
  await bladOpen(page);
  await expect(link).toBeVisible();
  await expect(link).toHaveText("Kerstliederen samen raden? Raadkoord Kerst, ook van Denckh");
  await expect(link).toHaveAttribute("rel", "noopener");
  expect(await link.getAttribute("target")).toBeNull();
  await expect(page.locator("#sOok img, #sOok svg")).toHaveCount(0);
  expect(await link.evaluate((e) => !!e.closest(".stapkaart"))).toBe(true);
  // Niet bij een stap of in de intro van een ander deel.
  await (await verder(page)).click();
  await expect(page.locator("#sTitle")).toHaveText(/^1\. /);
  await expect(link).toHaveCount(0);
  await page.goto("about:blank");
  await page.goto("/bijbelreis#kerst-geboorte");
  await expect(page.locator("#sTitle")).toHaveText("De geboorte in Bethlehem");
  await expect(link).toHaveCount(0);
  // Wel na de laatste stap van het laatste deel.
  await page.goto("about:blank");
  await page.goto("/bijbelreis#kerst-twaalf/9");
  await expect(page.locator("#sTitle")).toHaveText(/^9\. /);
  await expect(link).toHaveCount(1);
  await bladOpen(page);
  await expect(link).toBeVisible();
  // Op de telefoon staat de algemene regel ‘Ook van Denckh: Raadkoord’ er dan niet nog eens onder.
  if (smal(page)) await expect(page.locator(".panel > .ook")).toBeHidden();
  // Buiten het thema nergens: niet op de start in het seizoen, niet in een Bijbelboek.
  await page.goto("about:blank");
  await page.goto("/bijbelreis");
  await expect(page.locator("#seizoen")).toBeVisible();
  await expect(link).toHaveCount(0);
  await page.goto("about:blank");
  await page.goto("/bijbelreis#abraham");
  await expect(page.locator("#sTitle")).toHaveText("Abraham");
  await expect(link).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("kerst: tijdlijn, alle reizen en paspoort tonen het thema onder een eigen kopje; de stempels tellen mee", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, BUITEN_SEIZOEN, "/bijbelreis#kerst-geboorte/4", { niveau: "c" });
  await expect(page.locator("#sTitle")).toHaveText("4. Herders in het veld");
  // Tijdlijn: de delen van Kerst staan niet tussen de Bijbelboeken, maar eronder.
  await page.getByRole("tab", { name: "Tijdlijn" }).click();
  const tijd = page.locator("#p-tijd");
  await expect(tijd.locator(".tl-thema")).toHaveCount(1);
  await expect(tijd.locator(".tl-thema")).toContainText("Thema: Kerst");
  expect(await tijd.locator('.tijdlijn:not(.tl-themalijn) [data-go^="kerst:"]').count()).toBe(0);
  expect(await tijd.locator(".tl-themalijn .tl-go b").allTextContents()).toEqual(DELEN.map((d) => d[1]));
  await expect(tijd.locator(".tl-themalijn .tl-item.cur")).toContainText("De geboorte in Bethlehem");
  expect(await boven(page, "#p-tijd .tijdlijn:not(.tl-themalijn)", "#p-tijd .tl-thema")).toBe(true);
  // Paspoort: het thema onder ‘Thema’s’, na de Bijbelboeken; de stempel van zojuist telt gewoon mee.
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect(page.locator("#stamps .pas-themas")).toHaveText("Thema’s");
  expect(await page.locator("#stamps > *").evaluateAll((l) => { const i = l.findIndex((e) => e.classList.contains("pas-themas")); return [i === l.length - 2, l[l.length - 1].querySelector("summary b")!.textContent, l[l.length - 1].querySelector("summary span")!.textContent]; })).toEqual([true, "Kerst: van Adam tot Bethlehem", "1 van 59"]);
  const totaal = await page.evaluate(() => (window as unknown as { BR: { boeken: { delen: { steps: unknown[] }[] }[] } }).BR.boeken.reduce((a, b) => a + b.delen.reduce((x, d) => x + d.steps.length, 0), 0));
  await expect(page.locator("#pasStats")).toContainText(`van ${totaal.toLocaleString("nl-NL")} reisstempels`);
  await expect(page.locator("#pasStats div").first().locator("b")).toHaveText("1");
  // Alle reizen: per Bijbelboek, en het thema onder ‘Thema: Kerst’.
  await page.getByRole("tab", { name: "Reis" }).click();
  await openKeuze(page);
  await page.locator("#reizenBtn").click();
  const koppen = await page.locator("#reizenLijst .o-kop").allTextContents();
  expect(koppen).toContain("Thema: Kerst");
  expect(koppen.filter((k) => /kerst/i.test(k))).toEqual(["Thema: Kerst"]);
  expect(koppen[koppen.length - 1]).toBe("Thema: Kerst");
  expect(errors).toEqual([]);
});

test("kerst: het boekje heeft Kerst onder ‘Thema’s’ in het keuzescherm, en #boek=kerst en #kerst-geboorte werken", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, IN_SEIZOEN, "/bijbelreis/boekje", { wacht: "#kBoek" });
  const keuze = page.locator("#kBoek");
  await expect(keuze).toBeVisible();
  expect(await keuze.locator("optgroup").evaluateAll((l) => l.map((g) => (g as HTMLOptGroupElement).label))).toEqual(["Bijbelboeken", "Thema’s"]);
  expect(await keuze.locator('optgroup[label="Thema’s"] option').evaluateAll((l) => l.map((o) => (o as HTMLOptionElement).value))).toEqual(["kerst"]);
  expect(await keuze.locator('optgroup[label="Bijbelboeken"] option').evaluateAll((l) => l.map((o) => (o as HTMLOptionElement).value))).not.toContain("kerst");
  await expect(keuze).toHaveValue("genesis");
  await keuze.selectOption("kerst");
  await expect(page.locator("#kDeel option")).toHaveCount(7);
  await page.goto("about:blank");
  await page.goto("/bijbelreis/boekje#boek=kerst");
  await expect(page.locator("#bekijk")).toBeVisible();
  await expect(page).toHaveTitle(/^Kerst: van Adam tot Bethlehem · presentatie en boekje/);
  await page.goto("about:blank");
  await page.goto("/bijbelreis/boekje#kerst-geboorte");
  await expect(page.locator("#bekijk")).toBeVisible();
  await expect(page).toHaveTitle(/^De geboorte in Bethlehem · presentatie en boekje/);
  expect(await page.evaluate(() => { const pk = (window as unknown as { BR: { boekjePagina: { pakket: { nt: boolean; dias: { s: string }[] } } } }).BR.boekjePagina.pakket; return [pk.nt, pk.dias.filter((d) => d.s === "stap").length]; })).toEqual([true, 10]);
  expect(errors).toEqual([]);
});
