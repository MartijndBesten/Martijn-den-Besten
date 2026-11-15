import { expect, test, type Page } from "@playwright/test";

// De telefoonopzet van de Bijbelreis (tot 900 px; docs/bijbelreis-audit/telefoon.md): het beeld eerst, één regel om te
// kiezen, de rest één tik verder, en een vaste balk voor vooruit en terug. De telefoontests draaien één keer, in het
// project ‘mobiel’, op het kleinste formaat (360×740). De tests voor verdiepende delen draaien op elk formaat.

const zetNiveau = (page: Page, n: "a" | "b" | "c") => page.addInitScript((x) => {
  if (sessionStorage.getItem("niveauGezet")) return;
  sessionStorage.setItem("niveauGezet", "1");
  localStorage.setItem("bijbelreis:niveau", JSON.stringify(x));
  localStorage.setItem("bijbelreis:welkomWeg", "true");
}, n);
const geenHorizontaalScrollen = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
// Ligt het element helemaal in het eerste scherm (zonder te scrollen), en niet onder de vaste balken?
async function inEersteScherm(page: Page, sel: string) {
  return page.evaluate((sel) => {
    const e = document.querySelector(sel); if (!e || !(e as HTMLElement).offsetParent) return false;
    const r = e.getBoundingClientRect(), onder = Math.min(...[...document.querySelectorAll(".tabs, .mapbar")].filter((x) => (x as HTMLElement).offsetParent && getComputedStyle(x).position === "fixed").map((x) => x.getBoundingClientRect().top), window.innerHeight);
    return window.scrollY === 0 && r.top >= 0 && r.bottom <= window.innerHeight && (sel === "#next" || r.top < onder);
  }, sel);
}
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
// Klik de knop ‘Verder’ die er is: op de telefoon in de vaste balk, op de desktop in de stapkaart.
const verder = async (page: Page) => page.locator((await page.locator("#next2").isVisible()) ? "#next2" : "#next");

test.describe("telefoon (360×740)", () => {
  test.use({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== "mobiel", "telefoontests één keer, in het project mobiel"); });

  for (const niveau of ["a", "b", "c"] as const) {
    test(`niveau ${niveau}: bij een stap staan kaart of tafereel, titel en ‘Verder’ in het eerste scherm`, async ({ page }) => {
      const errors = watchErrors(page);
      await zetNiveau(page, niveau);
      for (const hash of ["abraham/2", "uittocht/6", "kies-het-leven/3", "nt-paulusrome/5"]) {
        await page.goto(`/bijbelreis#${hash}`);
        await expect(page.locator("#sTitle"), hash).toHaveText(/^\d+\. /);
        await page.waitForTimeout(300);
        const beeld = (await page.locator(".stapkaart > .tafereel").count()) ? ".stapkaart > .tafereel .tf-svg" : "#map";
        const kaart = (await page.locator("#map").boundingBox())!;
        expect(kaart.y, `${hash}: kaart bovenaan`).toBeLessThan(80);
        expect(kaart.height, `${hash}: kaart groot genoeg`).toBeGreaterThanOrEqual(110);
        expect(await inEersteScherm(page, beeld), `${hash}: ${beeld} in het eerste scherm`).toBe(true);
        expect(await inEersteScherm(page, "#sTitle"), `${hash}: titel in het eerste scherm`).toBe(true);
        expect(await inEersteScherm(page, "#next"), `${hash}: Verder in het eerste scherm`).toBe(true);
        expect(await geenHorizontaalScrollen(page), hash).toBe(true);
      }
      // Bij een stap met reis staan ook de eerste regels van de tekst in het eerste scherm.
      await page.goto("/bijbelreis#abraham/2");
      const tekst = (await page.locator("#sText").boundingBox())!, balk = (await page.locator(".mapbar").boundingBox())!;
      expect(balk.y - tekst.y, "minstens drie regels tekst boven de balk").toBeGreaterThan(3 * 26);
      expect(errors).toEqual([]);
    });
  }

  test("geen horizontaal scrollen, op alle onderdelen en niveaus", async ({ page }) => {
    for (const niveau of ["a", "b", "c"] as const) {
      await page.goto("/bijbelreis");
      await page.evaluate((n) => { localStorage.setItem("bijbelreis:niveau", JSON.stringify(n)); localStorage.setItem("bijbelreis:welkomWeg", "true"); }, niveau);
      for (const hash of ["", "#abraham", "#abraham/2", "#uittocht/6", "#v26", "#ur-kanaan/3"]) {
        await page.goto("/bijbelreis" + hash); await page.reload();
        await expect(page.locator("#map")).toBeVisible();
        expect(await geenHorizontaalScrollen(page), `${niveau} ${hash}`).toBe(true);
      }
      for (const tab of ["Wie is wie", "Tijdlijn", "Speurtocht", "Paspoort"]) {
        await page.getByRole("tab", { name: tab }).click();
        expect(await geenHorizontaalScrollen(page), `${niveau} ${tab}`).toBe(true);
      }
    }
  });

  test("tikdoelen in de stap, de balk, de kaart en het keuzeblad zijn minstens 44 px", async ({ page }) => {
    await zetNiveau(page, "c");
    const klein = (sel: string) => page.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => (e as HTMLElement).offsetParent).map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => r.width < 43.5 || r.height < 43.5).map(({ e, r }) => `${(e.getAttribute("aria-label") || e.textContent || e.className).trim().slice(0, 40)} ${Math.round(r.width)}×${Math.round(r.height)}`), sel);
    const DOELEN = ".stapkaart button, .stapkaart a[href], #stappenBlok button, #deelActies button, .mapbar button, #kaartPaneel button, .mapacties button, .leaflet-control-zoom a, .tabs button";
    for (const hash of ["abraham", "abraham/2", "jozef/4"]) {
      await page.goto(`/bijbelreis#${hash}`);
      for (const b of await page.locator("#sMeer [data-meer]:visible").all()) await b.click();
      expect(await klein(DOELEN), hash).toEqual([]);
    }
    await page.locator("#kaartBtn").click();
    expect(await klein(DOELEN), "kaartpaneel open").toEqual([]);
    await page.locator("#kiesBtn").click();
    expect(await klein("#kiesLade button"), "keuzeblad").toEqual([]);
  });

  test("wat achter ‘meer’ staat, is met één tik te zien (en dicht met nog een tik)", async ({ page }) => {
    await zetNiveau(page, "c");
    for (const [hash, namen] of [["abraham", ["Wist je dat?", "Wanneer?", "Elders in de Bijbel", "Alle stappen (25)"]], ["abraham/2", ["Wist je dat?", "Hoe ver?", "Wanneer?", "Alle stappen (25)"]]] as const) {
      await page.goto(`/bijbelreis#${hash}`);
      const knoppen = page.locator("#sMeer [data-meer]:visible");
      await expect(knoppen).toHaveText([...namen]);
      for (const b of await knoppen.all()) {
        const doel = page.locator("#" + (await b.getAttribute("aria-controls")));
        await expect(doel).toBeHidden();
        await b.click();
        await expect(b).toHaveAttribute("aria-expanded", "true");
        await expect(doel).toBeVisible();
        await expect(doel).not.toBeEmpty();
        await b.click();
        await expect(doel).toBeHidden();
      }
    }
    // Het weetje blijft open bij de volgende stap; de stappenlijst niet.
    await page.getByRole("button", { name: "Wist je dat?" }).click();
    await page.getByRole("button", { name: "Alle stappen (25)" }).click();
    await page.locator("#next").click();
    await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
    await expect(page.locator("#sFact")).toBeVisible();
    await expect(page.locator("#stappenBlok")).toBeHidden();
    // De stappenlijst werkt: een bolletje kiest die stap.
    await page.getByRole("button", { name: "Alle stappen (25)" }).click();
    await page.locator('#chapters .dot[data-step="5"]').click();
    await expect(page.locator("#sTitle")).toHaveText(/^6\. /);
  });

  test("boek en deel kiezen in één regel en één blad; de overzichten staan daar ook", async ({ page }) => {
    const errors = watchErrors(page);
    await zetNiveau(page, "b");
    await page.goto("/bijbelreis#abraham/2");
    await expect(page.locator("#kiesBtn")).toContainText("Genesis");
    await expect(page.locator("#kiesBtn")).toContainText("Abraham");
    await expect(page.locator("#kiesBtn")).toContainText("2 van 25");
    // Geen boekenrij, delenrij of vier losse links boven de stap.
    for (const sel of ["#boeken", "#delen", "#kastBtn", "#reizenBtn", "#plaatsenBtn", "#vandaagLijstBtn"]) await expect(page.locator(sel), sel).toBeHidden();
    await page.locator("#kiesBtn").click();
    const blad = page.getByRole("dialog", { name: "Kies een reis" });
    await expect(blad).toBeVisible();
    await blad.locator('.boek[data-boek="exodus"]').click();
    await expect(blad).toBeVisible();
    await blad.locator('.deel[data-deel="uittocht"]').click();
    await expect(blad).toBeHidden();
    await expect(page.locator("#kiesBtn")).toContainText("Exodus");
    await expect(page.locator("#kiesBtn")).toContainText("Uittocht");
    await expect(page).toHaveURL(/#uittocht$/);
    await expect(page.locator("#kiesBtn")).toBeFocused();
    // Een overzicht uit het blad; sluiten brengt je terug in het blad.
    await page.locator("#kiesBtn").click();
    await blad.getByRole("button", { name: "Alle plaatsen", exact: true }).click();
    const plaatsen = page.getByRole("dialog", { name: "Plaatsen in de Bijbel" });
    await expect(plaatsen).toBeVisible();
    await expect(blad).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(plaatsen).toBeHidden();
    await expect(blad).toBeVisible();
    await expect(blad.getByRole("button", { name: "Alle plaatsen", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(blad).toBeHidden();
    await expect(page.locator("#kiesBtn")).toBeFocused();
    for (const naam of ["Alle 66 boeken", "Alle reizen", "Vandaag"]) {
      await page.locator("#kiesBtn").click();
      await blad.getByRole("button", { name: naam, exact: true }).click();
      await expect(page.locator(".lade:not([hidden])")).toHaveCount(1);
      await expect(blad).toBeHidden();
      await page.keyboard.press("Escape"); await page.keyboard.press("Escape");
      await expect(page.locator(".lade:not([hidden])")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });

  test("vooruit en terug met de duim: vaste balk en vegen over de stapkaart (niet over de kaart)", async ({ page }) => {
    await zetNiveau(page, "c");
    await page.goto("/bijbelreis#abraham/2");
    const balk = (await page.locator(".mapbar").boundingBox())!, tabs = (await page.locator(".tabs").boundingBox())!;
    expect(Math.abs(balk.y + balk.height - tabs.y)).toBeLessThan(2);
    // Na scrollen blijft de balk staan; Verder begint de nieuwe stap bovenaan.
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    await expect(page.locator("#next")).toBeInViewport();
    await page.locator("#next").click();
    await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await page.locator("#prev").click();
    await expect(page.locator("#sTitle")).toHaveText(/^2\. /);
    // Vegen (één vinger, horizontaal) over de tekst van de stap.
    const veeg = async (sel: string, dx: number) => {
      const b = (await page.locator(sel).boundingBox())!, x = b.x + b.width / 2, y = b.y + Math.min(b.height / 2, 60);
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x - dx / 2, y }] });
      for (let i = 1; i <= 8; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - dx / 2 + (dx * i) / 8, y }] }); await page.waitForTimeout(16); }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await cdp.detach();
    };
    await veeg("#sText", -160);
    await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
    await veeg("#sText", 160);
    await expect(page.locator("#sTitle")).toHaveText(/^2\. /);
    await veeg("#map", -160);
    await page.waitForTimeout(400);
    await expect(page.locator("#sTitle")).toHaveText(/^2\. /);
  });

  test("de kaart: weinig knoppen, Toen/Nu, Vandaag, Bijbelwereld en Legenda achter ‘Kaart’", async ({ page }) => {
    await zetNiveau(page, "c");
    await page.goto("/bijbelreis#abraham/2");
    const zichtbaar = () => page.evaluate(() => [...document.querySelectorAll(".maptools > *, .mapacties > *, .leaflet-control-zoom, .leaflet-control-scale")].filter((e) => (e as HTMLElement).offsetParent).map((e) => e.id || e.className.split(" ")[0]));
    expect(await zichtbaar()).toEqual(["kaartBtn", "heleBtn", "fullBtn", "leaflet-control-zoom"]);
    await page.locator("#kaartBtn").click();
    await expect(page.locator("#kaartBtn")).toHaveAttribute("aria-expanded", "true");
    for (const sel of ["#toenBtn", "#nuBtn", "#wereldBtn", "#legendBtn"]) await expect(page.locator(sel), sel).toBeVisible();
    await expect(page.locator("#vandaagBtn")).toBeHidden();
    await page.locator("#nuBtn").click();
    await expect(page.locator("#vandaagBtn")).toBeVisible();
    await expect(page.locator("#kaartBtn")).toContainText("nu");
    await page.locator("#legendBtn").click();
    await expect(page.locator("#legend")).toBeVisible();
    await page.locator("#legendSluit").click();
    // Een tik naast het paneel sluit het.
    await page.locator("#sTitle").click();
    await expect(page.locator("#kaartBtn")).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#nuBtn")).toBeHidden();
    // Groot: de kaart over het hele scherm, met de schaalbalk.
    await page.locator("#fullBtn").click();
    await expect(page.locator("body")).toHaveClass(/mapfull/);
    await expect(page.locator(".leaflet-control-scale")).toBeVisible();
    await page.locator("#fullBtn").click();
    await expect(page.locator("body")).not.toHaveClass(/mapfull/);
  });

  test("stand Nu: in het overzicht van een deel geen moderne naam onder elke plaats", async ({ page }) => {
    await zetNiveau(page, "c");
    await page.goto("/bijbelreis#abraham");
    await page.locator("#kaartBtn").click();
    await page.locator("#nuBtn").click();
    await page.waitForTimeout(800);
    const nuNamen = () => page.evaluate(() => [...document.querySelectorAll("#map .lab .nu")].filter((e) => getComputedStyle(e).display !== "none" && getComputedStyle(e.closest(".lab")!).display !== "none").length);
    expect(await nuNamen()).toBe(0);
    await page.goto("/bijbelreis#abraham/4");
    await page.waitForTimeout(800);
    expect(await nuNamen()).toBeGreaterThan(0);
  });

  test("diepe links openen de juiste stap, het juiste verhaal en het juiste deel", async ({ page }) => {
    await zetNiveau(page, "c");
    await page.goto("/bijbelreis#jozef/4");
    await expect(page.locator("#sTitle")).toHaveText(/^4\. /);
    await expect(page.locator("#kiesBtn")).toContainText("Jozef");
    await expect(page.locator("#kiesBtn")).toContainText("4 van");
    await page.goto("/bijbelreis#ur-kanaan/5");
    await expect(page.locator("#sTitle")).toHaveText("5. De HEERE roept Abram");
    await expect(page.locator("#kiesBtn")).toContainText("Van Ur naar Kanaän");
    await page.goto("/bijbelreis#v26");
    await expect(page.locator("#vTitel")).toHaveText("Droog door de Schelfzee");
    await page.goto("/bijbelreis#exodus");
    await expect(page.locator("#kiesBtn")).toContainText("Exodus");
    await expect(page.locator("#sTitle")).not.toHaveText(/^\d+\. /);
  });

  test("de drie niveaus houden hun verschillen", async ({ page }) => {
    await page.goto("/bijbelreis");
    const zet = (n: string) => page.evaluate((n) => { localStorage.setItem("bijbelreis:niveau", JSON.stringify(n)); localStorage.setItem("bijbelreis:welkomWeg", "true"); }, n);
    // Samen ontdekken: één zin, de weg naar het verhaal, geen extra's en geen kaartpaneel.
    await zet("a"); await page.goto("/bijbelreis#abraham/2"); await page.reload();
    await expect(page.locator("#sText .a-reisverhaal")).toBeVisible();
    await expect(page.locator("#sMeer")).toBeHidden();
    await expect(page.locator("#kaartBtn")).toBeHidden();
    await expect(page.locator("#next")).toBeVisible();
    // Zelf op reis: het verhaal begint met het eerste stuk en ‘Lees verder’.
    await zet("b"); await page.goto("/bijbelreis#v26"); await page.reload();
    const stukken = page.locator("#vVertelling .vdeel");
    const n = await stukken.count();
    expect(n).toBeGreaterThan(1);
    await expect(stukken.nth(1)).toBeHidden();
    await page.getByRole("button", { name: /Lees verder/ }).click();
    for (let i = 0; i < n; i++) await expect(stukken.nth(i)).toBeVisible();
    // Verder ontdekken: dezelfde stap met weetje, afstand en jaartal achter ‘meer’.
    await zet("c"); await page.goto("/bijbelreis#abraham/2"); await page.reload();
    await expect(page.locator("#sMeer [data-meer]:visible")).toHaveCount(4);
    await page.goto("/bijbelreis#v26");
    await expect(page.getByRole("button", { name: /Lees verder/ })).toBeVisible();
  });

  test("200 % tekst (inzoomen tot 200 %): niets valt weg en er is geen horizontaal scrollen", async ({ page }) => {
    // 200 % zoom op een telefoon van 412×915 geeft een beeld van 206×457 CSS-pixels.
    await page.setViewportSize({ width: 206, height: 457 });
    await zetNiveau(page, "c");
    for (const hash of ["abraham/2", "uittocht/6", "abraham", "v26"]) {
      await page.goto(`/bijbelreis#${hash}`);
      await page.waitForTimeout(400);
      expect(await geenHorizontaalScrollen(page), hash).toBe(true);
    }
    await page.goto("/bijbelreis#abraham/2");
    await expect(page.locator("#next")).toBeInViewport();
    await expect(page.locator("#sTitle")).toBeVisible();
    await page.locator("#next").click();
    await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
    await page.locator("#kiesBtn").click();
    const blad = page.getByRole("dialog", { name: "Kies een reis" });
    await expect(blad.getByRole("button", { name: "Sluiten" })).toBeInViewport();
    expect(await geenHorizontaalScrollen(page)).toBe(true);
    await page.keyboard.press("Escape");
    await page.locator("#kaartBtn").click();
    await expect(page.locator("#nuBtn")).toBeVisible();
  });
});

// Verdiepende delen (bij: "<hoofddeel>"): geen eigen knop, maar onder het hoofddeel. Op desktop, tablet en telefoon.
test.describe("verdiepende delen", () => {
  test.beforeEach(async ({ page }) => { await zetNiveau(page, "c"); });

  test("Van Ur naar Kanaän staat onder Abraham: ingang, kruimelpad, terug en verder", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/bijbelreis#abraham");
    await expect(page.locator('#delen .deel[data-deel="ur-kanaan"]')).toHaveCount(0);
    await expect(page.locator('#delen .deel[data-deel="abraham"]')).toHaveCount(1);
    const ingang = page.locator("#sVerdiep .verdiep-in");
    await expect(ingang).toHaveCount(1);
    await expect(ingang).toContainText("Van dichtbij");
    await expect(ingang).toContainText("Van Ur naar Kanaän");
    await expect(ingang).toContainText("Genesis 11:27–12:5");
    // Ook bij de stappen van Abraham over hetzelfde gedeelte (Genesis 11:27–32 en 12:1–5), niet bij de andere.
    await page.goto("/bijbelreis#abraham/1");
    await expect(page.locator("#sVerdiep .verdiep-in")).toContainText("Van Ur naar Kanaän");
    await page.goto("/bijbelreis#abraham/2");
    await expect(page.locator("#sVerdiep .verdiep-in")).toContainText("Van Ur naar Kanaän");
    await page.goto("/bijbelreis#abraham/3");
    await expect(page.locator("#sVerdiep")).toBeHidden();
    await page.goto("/bijbelreis#abraham");
    await page.locator("#sVerdiep .verdiep-in").click();
    await expect(page).toHaveURL(/#ur-kanaan$/);
    await expect(page.locator("#sTitle")).toHaveText("Van Ur naar Kanaän");
    // Het hoofddeel blijft gemarkeerd; het kruimelpad loopt via Abraham.
    await expect(page.locator('#delen .deel[data-deel="abraham"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#sCrumb")).toHaveText(/^Genesis\s*›\s*Abraham\s*›\s*Van Ur naar Kanaän/);
    const regel = page.locator((await page.locator("#kiesBtn").isVisible()) ? "#kiesBtn" : "#sCrumb");
    await expect(regel).toContainText("Abraham");
    await expect(regel).toContainText("Van Ur naar Kanaän");
    // Terug naar het hoofddeel.
    await page.getByRole("button", { name: "← Terug naar Abraham" }).click();
    await expect(page).toHaveURL(/#abraham$/);
    // Na de laatste stap gaat Verder naar Abraham, verder na dit gedeelte (stap 3).
    await page.goto("/bijbelreis#ur-kanaan/8");
    const knop = await verder(page);
    await expect(knop).toHaveText("Verder met Abraham ▶");
    await knop.click();
    await expect(page).toHaveURL(/#abraham\/3$/);
    // Vorige vanaf de intro gaat ook naar het hoofddeel, niet naar ‘Het begin’.
    await page.goto("/bijbelreis#ur-kanaan");
    await page.locator((await page.locator("#prev2").isVisible()) ? "#prev2" : "#prev").click();
    await expect(page).toHaveURL(/#abraham$/);
    // Vanaf het einde van ‘Het begin’ gaat Verder naar Abraham, niet naar het verdiepende deel.
    await page.goto("/bijbelreis#begin");
    const n = await page.evaluate(() => (window as unknown as { BR: { boeken: { id: string; delen: { id: string; steps: unknown[] }[] }[] } }).BR.boeken[0].delen[0].steps.length);
    await page.goto(`/bijbelreis#begin/${n}`);
    await (await verder(page)).click();
    await expect(page).toHaveURL(/#abraham$/);
    // De stapsleutels blijven die van het deel zelf.
    await page.goto("/bijbelreis#ur-kanaan/2");
    await expect(page.locator("#sTitle")).toHaveText(/^2\. /);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien") || "[]"))).toContain("genesis:ur-kanaan:1");
    expect(errors).toEqual([]);
  });

  test("Kies dan het leven staat onder In Moab", async ({ page }) => {
    await page.goto("/bijbelreis#moab");
    await expect(page.locator('#delen .deel[data-deel="kies-het-leven"]')).toHaveCount(0);
    await expect(page.locator("#sVerdiep .verdiep-in")).toContainText("Kies dan het leven");
    // De stap over de hele rede (Deuteronomium 1–33) wijst ook naar dit gedeelte.
    await page.goto("/bijbelreis#moab/4");
    await expect(page.locator("#sVerdiep .verdiep-in")).toContainText("Deuteronomium 30:11–20");
    await page.goto("/bijbelreis#kies-het-leven/7");
    const knop = await verder(page);
    await expect(knop).toHaveText("Verder met Moab ▶");
    await knop.click();
    await expect(page).toHaveURL(/#moab\/5$/);
  });

  test("in tijdlijn, alle reizen, speurtocht en paspoort onder het hoofddeel", async ({ page }) => {
    await page.goto("/bijbelreis#ur-kanaan");
    await page.getByRole("tab", { name: "Tijdlijn" }).click();
    const abraham = page.locator("#p-tijd .tl-item").filter({ has: page.locator('.tl-go[data-go="genesis:abraham:-1"]') });
    await expect(abraham.locator(".tl-sub")).toContainText("Van Ur naar Kanaän");
    await expect(abraham).toHaveClass(/cur/);
    await expect(page.locator('#p-tijd .tl-go[data-go="genesis:ur-kanaan:-1"]')).toHaveCount(0);
    await abraham.locator(".tl-sub").click();
    await expect(page).toHaveURL(/#ur-kanaan$/);

    await page.getByRole("tab", { name: "Speurtocht" }).click();
    const opties = await page.locator("#p-quiz [data-q]").evaluateAll((l) => l.map((b) => (b as HTMLElement).dataset.q));
    expect(opties.indexOf("ur-kanaan")).toBe(opties.indexOf("abraham") + 1);
    await expect(page.locator('#p-quiz [data-q="ur-kanaan"]')).toHaveText("Abraham › Van Ur naar Kanaän");

    await page.getByRole("tab", { name: "Paspoort" }).click();
    await expect(page.locator("#stamps .pas-sub .label").first()).toContainText("Abraham › Van Ur naar Kanaän");

    await page.getByRole("tab", { name: "Reis" }).click();
    if (await page.locator("#kiesBtn").isVisible()) await page.locator("#kiesBtn").click();
    await page.getByRole("button", { name: "Alle reizen" }).click();
    const rijen = page.locator("#reizenLijst .olijst li");
    const teksten = await rijen.allTextContents();
    const eersteUr = teksten.findIndex((t) => t.includes("Van Ur naar Kanaän"));
    expect(eersteUr).toBeGreaterThan(0);
    expect(teksten[eersteUr]).toContain("Abraham › Van Ur naar Kanaän");
    expect(teksten[eersteUr - 1]).toMatch(/Abraham ·|Van Ur naar Kanaän/);
    await expect(rijen.nth(eersteUr)).toHaveClass(/sub/);
  });
});
