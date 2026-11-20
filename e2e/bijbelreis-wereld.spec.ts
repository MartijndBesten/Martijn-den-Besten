import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

// ‘De wereld in die tijd’ (docs/bijbelreis-wereld/README.md): de laag met levenslijnen, kaart en gebeurtenissen.
// Draait in de projecten desktop, mobiel en tablet. Lokaal:
//   npm run build && npx vite preview --port 8930 --strictPort
//   E2E_BASE_URL=http://localhost:8930 npx playwright test e2e/bijbelreis-wereld.spec.ts --trace off

type Staat = { periode: string; t: number; jaar: number; speelt: boolean; venster: [number, number]; gekozen: string | null; vergelijk: string | null; weergave: string };
const staat = (page: Page) => page.evaluate(() => (window as unknown as { BR: { wereldLaag: { staat: () => unknown } } }).BR.wereldLaag.staat() as Staat);
const laag = (page: Page) => page.locator("#wtLaag");
function fouten(page: Page) {
  const f: string[] = [];
  page.on("pageerror", (e) => f.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(m.text())) f.push(m.text()); });
  return f;
}
// Niveau en startkaart vast, zodat elke test hetzelfde verhaal ziet.
async function begin(page: Page) {
  await page.addInitScript(() => {
    try {
      if (location.protocol === "about:" || sessionStorage.getItem("wtGezet")) return;
      sessionStorage.setItem("wtGezet", "1");
      localStorage.setItem("bijbelreis:niveau", JSON.stringify("b"));
      localStorage.setItem("bijbelreis:welkomWeg", "true");
    } catch { /* about:blank */ }
  });
}
async function openLaag(page: Page, hash: string) {
  await page.goto("about:blank");
  await page.goto("/bijbelreis#" + hash);
  await expect(laag(page)).toBeVisible();
  await expect(page.locator(".wt-app .wt-svg .wt-balk").first()).toBeAttached();
}
const naarJaar = (page: Page, t: number) => page.evaluate((t) => { const s = document.querySelector<HTMLInputElement>("#wtSchuif")!; s.value = String(t); s.dispatchEvent(new Event("input", { bubbles: true })); s.dispatchEvent(new Event("change", { bubbles: true })); }, t);
const getekend = async (page: Page, sel: string) => { const d = await page.locator(sel).getAttribute("d"); return !!d && d !== "M0 0"; };
const FIXTURE = readFileSync(join(process.cwd(), "tests", "fixtures", "wereld", "test-kaart.json"), "utf8");

test.describe("De wereld in die tijd", () => {
  test.beforeEach(async ({ page }) => { await begin(page); });

  test("uit een verhaal openen, afspelen en pauzeren; sluiten en terug brengen je exact terug in het verhaal", async ({ page }) => {
    const f = fouten(page);
    await page.goto("/bijbelreis?wereld=1#v5");
    const ingang = page.locator(".wt-ingang");
    await expect(ingang).toBeVisible();
    await expect(ingang).toContainText("De wereld in die tijd");
    await ingang.scrollIntoViewIfNeeded();
    const voor = await page.evaluate(() => [window.scrollY, document.getElementById("reisboek")!.scrollTop]);
    await ingang.click();
    await expect(laag(page)).toBeVisible();
    await expect(page).toHaveURL(/#wereld\/adam-noach\/1656$/);
    await expect(page.locator("#wtJaar")).toHaveText("1656");
    await expect(page.locator(".wt-terug")).toHaveAttribute("aria-label", /Noach bouwt de ark/);
    // Nooit vanzelf afspelen.
    await page.waitForTimeout(400);
    expect((await staat(page)).speelt).toBe(false);
    await naarJaar(page, 900);
    await page.locator(".wt-speel").click();
    await expect.poll(async () => (await staat(page)).t, { timeout: 4000 }).toBeGreaterThan(905);
    await page.locator(".wt-speel").click();
    const stil = (await staat(page)).t;
    expect((await staat(page)).speelt).toBe(false);
    await page.waitForTimeout(400);
    expect((await staat(page)).t).toBe(stil);
    await expect(page).toHaveURL(new RegExp(`#wereld/adam-noach/${Math.round(stil)}$`));
    // Sluiten met de knop: terug in hetzelfde verhaal, op dezelfde plek, focus op de uitnodiging.
    await page.locator(".wt-terug").click();
    await expect(laag(page)).toBeHidden();
    await expect(page).toHaveURL(/#v5$/);
    await expect(page.locator("#vTitel")).toHaveText("Noach bouwt de ark");
    expect(await page.evaluate(() => [window.scrollY, document.getElementById("reisboek")!.scrollTop])).toEqual(voor);
    await expect(ingang).toBeFocused();
    // Nog een keer, nu met ‘terug’ van de browser.
    await ingang.click();
    await expect(laag(page)).toBeVisible();
    await page.goBack();
    await expect(laag(page)).toBeHidden();
    await expect(page).toHaveURL(/#v5$/);
    await expect(page.locator("#vTitel")).toHaveText("Noach bouwt de ark");
    expect(f).toEqual([]);
  });

  test("de uitnodiging staat alleen bij verhalen met een koppeling; ?wereld=0 zet hem uit op dit apparaat, ?wereld=1 weer aan", async ({ page }) => {
    await page.goto("/bijbelreis#v5");
    await expect(page.locator("#vTitel")).toHaveText("Noach bouwt de ark");
    await expect(page.locator(".wt-ingang")).toHaveCount(1);
    await page.goto("/bijbelreis#v1");
    await expect(page.locator("#vTitel")).toBeVisible();
    await expect(page.locator(".wt-ingang")).toHaveCount(0); // geschiedenis 1 heeft geen koppeling
    await page.goto("/bijbelreis?wereld=0#v5");
    await expect(page.locator("#vTitel")).toHaveText("Noach bouwt de ark");
    await expect(page.locator(".wt-ingang")).toHaveCount(0);
    await page.goto("/bijbelreis?wereld=1#v5");
    await expect(page.locator(".wt-ingang")).toHaveCount(1);
  });

  test("spoelen, naar een gebeurtenis springen, een persoon kiezen en vergelijken (Adam en Methusalach: 243 jaar)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const f = fouten(page);
    await openLaag(page, "wereld/adam-noach/0");
    expect((await staat(page)).t).toBe(0);
    // Volgend moment: de geboorte van Seth.
    await page.getByRole("button", { name: "Volgend moment" }).click();
    await expect.poll(async () => (await staat(page)).t).toBe(130);
    await page.getByRole("button", { name: "Vorig moment" }).click();
    await expect.poll(async () => (await staat(page)).t).toBe(0);
    // De schuif.
    await page.locator("#wtSchuif").focus();
    await page.keyboard.press("End");
    await expect.poll(async () => (await staat(page)).t).toBe(2200);
    await expect(page.locator("#wtSchuif")).toHaveAttribute("aria-valuetext", "jaar 2200 na de schepping");
    // Gebeurtenissen: naar ‘God neemt Henoch weg’.
    await page.getByRole("tab", { name: "Gebeurtenissen" }).click();
    await page.locator(".wt-momenten").getByRole("button", { name: "God neemt Henoch weg" }).click();
    await expect.poll(async () => (await staat(page)).t).toBe(987);
    // Op de telefoon ga je daarna vanzelf naar de levenslijnen; op een groot scherm blijft de lijst staan.
    if (await page.locator(".wt-p-lijnen").isHidden()) await page.getByRole("tab", { name: "Levenslijnen" }).click();
    // Henoch: geen ‘stierf’, maar een eigen markering.
    const henoch = page.locator('.wt-l[data-p="henoch"]');
    await expect(henoch).toHaveClass(/voorbij/);
    await expect(henoch.locator(".wt-eind.weg")).toBeAttached();
    await expect(henoch.locator(".wt-eind.stierf, .wt-eind:not(.weg)")).toHaveCount(0);
    await expect(page.locator("#wtSub-henoch")).toHaveText("weggenomen");
    // Persoon kiezen pauzeert en toont de kaart.
    await page.locator('.wt-naam[data-p="methusalach"]').click();
    const kaart = page.locator(".wt-kaartje").filter({ hasText: "Methusalach" });
    await expect(kaart).toBeVisible();
    await expect(kaart).toContainText("zoon van Henoch");
    await expect(kaart).toContainText("969 jaar oud");
    await expect(kaart).toContainText("Genesis 5:27");
    expect((await staat(page)).speelt).toBe(false);
    await kaart.locator('[data-vergelijk="adam"]').first().click();
    await expect(kaart.locator(".wt-vergelijking")).toContainText("Methusalach en Adam leefden 243 jaar tegelijk: van jaar 687 tot jaar 930.");
    await expect(page.locator(".wt-verg-label")).toHaveText("243 jaar tegelijk");
    // Adam en Noach: niet tegelijk.
    await page.keyboard.press("Escape");
    await expect(kaart).toBeHidden();
    await page.locator('.wt-naam[data-p="adam"]').click();
    const adam = page.locator(".wt-kaartje").filter({ hasText: "De eerste mens" });
    await adam.locator('.wt-niet [data-vergelijk="noach"]').click();
    await expect(adam.locator(".wt-vergelijking")).toContainText("Adam en Noach leefden niet tegelijk. Noach werd 126 jaar na de dood van Adam geboren.");
    expect(f).toEqual([]);
  });

  test("afspelen pauzeert vanzelf als je een persoon opent; de tijd loopt tijdens afspelen", async ({ page }) => {
    await openLaag(page, "wereld/adam-noach/600");
    await page.locator(".wt-speel").click();
    await expect.poll(async () => (await staat(page)).t, { timeout: 4000 }).toBeGreaterThan(620);
    expect((await staat(page)).speelt).toBe(true);
    await page.locator('.wt-naam[data-p="lamech"]').click();
    expect((await staat(page)).speelt).toBe(false);
    await expect(page.locator(".wt-kaartje").filter({ hasText: "Lamech" })).toBeVisible();
  });

  test("toetsenbord: pijltjes voor de tijd, spatie speelt en pauzeert, Page Down naar het volgende moment, Escape sluit", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openLaag(page, "wereld/adam-noach/100");
    await laag(page).focus();
    await page.keyboard.press("ArrowRight");
    expect((await staat(page)).t).toBe(101);
    await page.keyboard.press("Shift+ArrowLeft");
    expect((await staat(page)).t).toBe(91);
    await page.keyboard.press("PageDown");
    await expect.poll(async () => (await staat(page)).t).toBe(130);
    await page.keyboard.press(" ");
    expect((await staat(page)).speelt).toBe(true);
    await page.keyboard.press(" ");
    expect((await staat(page)).speelt).toBe(false);
    // Focus is zichtbaar op knoppen.
    await page.locator(".wt-speel").focus();
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
    expect(outline).not.toBe("none");
    await page.keyboard.press("Escape");
    await expect(laag(page)).toBeHidden();
  });

  test("minder beweging: nooit vanzelf bewegen; afspelen springt van moment naar moment", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openLaag(page, "wereld/adam-noach/0");
    await page.waitForTimeout(800);
    expect((await staat(page)).t).toBe(0);
    await page.locator(".wt-speel").click();
    await expect.poll(async () => (await staat(page)).t).toBe(130);
    await page.waitForTimeout(500);
    expect((await staat(page)).t).toBe(130); // geen tussenbeelden
    await page.locator(".wt-speel").click();
  });

  test("Daniël en Babylon: geopend vanuit het verhaal over de leeuwenkuil, met de kaart van 539 v.Chr.", async ({ page }) => {
    const f = fouten(page);
    await page.goto("/bijbelreis?wereld=1#v75");
    await page.locator(".wt-ingang").click();
    await expect(page).toHaveURL(/#wereld\/daniel-babylon\/539$/);
    await expect(page.locator("#wtJaar")).toHaveText("539 v.Chr.");
    if (!(await page.locator(".wt-kaartvlak").isVisible())) await page.getByRole("tab", { name: "Kaart" }).click();
    await expect(page.locator(".wt-kaartvlak")).toBeVisible();
    await expect.poll(() => getekend(page, "path.wt-gebied-perzie")).toBe(true);
    await expect(page.locator(".wt-legenda")).toContainText("Perzische rijk");
    await expect(page.locator(".wt-legenda")).toContainText("Pleiades");
    // Babel valt: het Nieuw-Babylonische rijk verdwijnt kort daarna; Perzië loopt verder dan de ondergrond.
    await naarJaar(page, -530);
    await expect.poll(() => getekend(page, "path.wt-gebied-babylonie")).toBe(false);
    await expect(page.locator(".wt-verder")).toContainText("loopt verder naar het oosten");
    // Daniël: geen geboortejaar.
    await page.getByRole("tab", { name: "Levenslijnen" }).click();
    await page.locator('.wt-naam[data-p="daniel"]').click();
    await expect(page.locator(".wt-kaartje").filter({ hasText: "Daniël" })).toContainText("de lijn begint bij de wegvoering");
    expect(f).toEqual([]);
  });

  test("Perzië: geopend vanuit Esther, kaart met Perzië en de Griekse steden, afspelen, Esther als koningin, terug", async ({ page }) => {
    const f = fouten(page);
    await page.goto("/bijbelreis?wereld=1#v77");
    await expect(page.locator(".wt-ingang")).toContainText("Perzië: Esther, Ezra en Nehemia");
    await page.locator(".wt-ingang").click();
    await expect(page).toHaveURL(/#wereld\/perzie\/483$/);
    await expect(page.locator("#wtJaar")).toHaveText("483 v.Chr.");
    await page.locator(".wt-speel").click();
    await expect.poll(async () => (await staat(page)).t, { timeout: 4000 }).toBeGreaterThan(-482);
    await page.locator(".wt-speel").click();
    if (!(await page.locator(".wt-kaartvlak").isVisible())) await page.getByRole("tab", { name: "Kaart" }).click();
    await expect.poll(() => getekend(page, "path.wt-gebied-perzie")).toBe(true);
    await expect.poll(() => getekend(page, "path.wt-gebied-grieken")).toBe(true);
    await expect(page.locator(".wt-legenda")).toContainText("Griekse steden");
    await expect(page.locator(".wt-legenda")).toContainText("Pleiades");
    // Thracië hoort tussen 513 en 480 bij Perzië: de vorm van 445 is anders dan die van 490.
    await naarJaar(page, -490);
    await expect.poll(() => getekend(page, "path.wt-gebied-perzie")).toBe(true);
    const d490 = await page.locator("path.wt-gebied-perzie").getAttribute("d");
    await naarJaar(page, -445);
    await expect.poll(() => page.locator("path.wt-gebied-perzie").getAttribute("d")).not.toBe(d490);
    if (await page.getByRole("tab", { name: "Levenslijnen" }).isVisible()) await page.getByRole("tab", { name: "Levenslijnen" }).click();
    await page.locator('.wt-naam[data-p="esther"]').click();
    const k = page.locator(".wt-kaartje").filter({ hasText: "Esther" });
    await expect(k).toContainText("Koningin vanaf");
    await expect(k).toContainText("479 v.Chr.");
    await page.keyboard.press("Escape");
    await page.locator(".wt-terug").click();
    await expect(laag(page)).toBeHidden();
    await expect(page).toHaveURL(/#v77$/);
    expect(f).toEqual([]);
  });

  test("Herodes en de keizers van Rome: v.Chr. en n.Chr. op één as, geen lijn voor de Heere Jezus, het rijk van Herodes valt uiteen", async ({ page }) => {
    const f = fouten(page);
    await page.goto("/bijbelreis?wereld=1#v83");
    await expect(page.locator(".wt-ingang")).toContainText("Herodes en de keizers van Rome");
    await page.locator(".wt-ingang").click();
    await expect(page).toHaveURL(/#wereld\/geboorte-jezus\/-6$/);
    await expect(page.locator("#wtJaar")).toHaveText("6 v.Chr.");
    // Geen levenslijn, naam of figuur voor de Heere Jezus; Zijn geboorte staat als gebeurtenis in de lijst.
    await expect(page.locator(".wt-naam")).toHaveCount(10);
    await expect(page.locator(".wt-naam").filter({ hasText: /Jezus/ })).toHaveCount(0);
    await expect(page.locator(".wt-momenten")).toContainText("De geboorte van de Heere Jezus");
    // De as telt over het begin van de jaartelling heen, zonder jaar 0.
    await expect(page.locator(".wt-as-ticks text").filter({ hasText: "v.Chr." }).first()).toBeAttached();
    await expect(page.locator(".wt-as-ticks text").filter({ hasText: "n.Chr." }).first()).toBeAttached();
    await page.locator(".wt-speel").click();
    await expect.poll(async () => (await staat(page)).jaar, { timeout: 6000 }).toBeGreaterThan(0.5);
    await page.locator(".wt-speel").click();
    await expect(page.locator("#wtJaar")).toHaveText(/^\d+ n\.Chr\.$/);
    await expect(page).toHaveURL(/#wereld\/geboorte-jezus\/\d+$/);
    // Kaart: in 6 v.Chr. het rijk van Herodes; in 4 v.Chr. Archelaüs, Antipas en Filippus.
    await naarJaar(page, -5);
    if (!(await page.locator(".wt-kaartvlak").isVisible())) await page.getByRole("tab", { name: "Kaart" }).click();
    await expect.poll(() => getekend(page, "path.wt-gebied-herodes")).toBe(true);
    expect(await getekend(page, "path.wt-gebied-archelaus")).toBe(false);
    await naarJaar(page, 1);
    for (const g of ["archelaus", "antipas", "filippus", "rome", "nabatea", "decapolis"]) await expect.poll(() => getekend(page, `path.wt-gebied-${g}`), { message: g }).toBe(true);
    await expect.poll(() => getekend(page, "path.wt-gebied-herodes")).toBe(false);
    if (await page.getByRole("tab", { name: "Levenslijnen" }).isVisible()) await page.getByRole("tab", { name: "Levenslijnen" }).click();
    await page.locator('.wt-naam[data-p="pilatus"]').click();
    const k = page.locator(".wt-kaartje").filter({ hasText: "Pilatus" });
    await expect(k).toContainText("Stadhouder vanaf");
    await expect(k).toContainText("Afgezet");
    await expect(k).toContainText("36 n.Chr.");
    await page.keyboard.press("Escape");
    await page.locator(".wt-terug").click();
    await expect(laag(page)).toBeHidden();
    await expect(page).toHaveURL(/#v83$/);
    await expect(page.locator("#vTitel")).toHaveText("De geboorte van de Heere Jezus in Bethlehem");
    // Een gedeelde link met een jaar v.Chr. als negatief getal.
    await openLaag(page, "wereld/geboorte-jezus/-4");
    await expect(page.locator("#wtJaar")).toHaveText("4 v.Chr.");
    expect(f).toEqual([]);
  });

  test("Israël, Juda en Assyrië: vanuit ‘Samaria valt’ (v66) naar 722 v.Chr., kaart, afspelen, Jona, Elia, en exact terug", async ({ page }) => {
    const f = fouten(page);
    await page.goto("/bijbelreis?wereld=1#v66");
    const ingang = page.locator(".wt-ingang");
    await ingang.scrollIntoViewIfNeeded();
    const voor = await page.evaluate(() => [window.scrollY, document.getElementById("reisboek")!.scrollTop]);
    await ingang.click();
    await expect(page).toHaveURL(/#wereld\/israel-assyrie\/722$/);
    await expect(page.locator("#wtJaar")).toHaveText("722 v.Chr.");
    if (!(await page.locator(".wt-kaartvlak").isVisible())) await page.getByRole("tab", { name: "Kaart" }).click();
    for (const g of ["assyrie", "israel", "juda"]) await expect.poll(() => getekend(page, `path.wt-gebied-${g}`), { message: g }).toBe(true);
    await expect(page.locator(".wt-legenda")).toContainText("Pleiades");
    // Na de val van Samaria verdwijnt het noordrijk; Juda blijft.
    await naarJaar(page, -712);
    await expect.poll(() => getekend(page, "path.wt-gebied-israel")).toBe(false);
    expect(await getekend(page, "path.wt-gebied-juda")).toBe(true);
    // Afspelen en pauzeren.
    await page.locator(".wt-speel").click();
    await expect.poll(async () => (await staat(page)).t, { timeout: 4000 }).toBeGreaterThan(-711);
    await page.locator(".wt-speel").click();
    expect((await staat(page)).speelt).toBe(false);
    // Jona: een tijdvak, geen jaartal.
    await page.getByRole("tab", { name: "Gebeurtenissen" }).click();
    await page.locator(".wt-momenten").getByRole("button", { name: "Jona in Ninevé" }).click();
    await expect.poll(async () => (await staat(page)).t).toBe(-793);
    if (await page.locator(".wt-p-lijnen").isHidden()) await page.getByRole("tab", { name: "Levenslijnen" }).click();
    // Elia: weggenomen, niet gestorven.
    await expect(page.locator('.wt-l[data-p="elia"] .wt-eind.weg')).toBeAttached();
    await page.locator('.wt-naam[data-p="jehu"]').click();
    await expect(page.locator(".wt-kaartje").filter({ hasText: "Jehu" })).toContainText("2 Koningen 10:36");
    await page.keyboard.press("Escape");
    await page.locator(".wt-terug").click();
    await expect(laag(page)).toBeHidden();
    await expect(page).toHaveURL(/#v66$/);
    await expect(page.locator("#vTitel")).toHaveText("Samaria valt en Israël wordt weggevoerd");
    expect(await page.evaluate(() => [window.scrollY, document.getElementById("reisboek")!.scrollTop])).toEqual(voor);
    expect(f).toEqual([]);
  });

  test("David en Salomo: vanuit ‘Salomo bouwt de tempel’ (v61) naar 966 v.Chr.; buurvolken en de scheuring op de kaart", async ({ page }) => {
    const f = fouten(page);
    await page.goto("/bijbelreis?wereld=1#v61");
    await page.locator(".wt-ingang").click();
    await expect(page).toHaveURL(/#wereld\/david-salomo\/966$/);
    await expect(page.locator("#wtJaar")).toHaveText("966 v.Chr.");
    await expect(page.locator(".wt-jaar")).toContainText(/bij benadering/i);
    if (!(await page.locator(".wt-kaartvlak").isVisible())) await page.getByRole("tab", { name: "Kaart" }).click();
    for (const g of ["israel", "onder-david", "filistea", "moab", "edom"]) await expect.poll(() => getekend(page, `path.wt-gebied-${g}`), { message: g }).toBe(true);
    expect(await getekend(page, "path.wt-gebied-juda")).toBe(false);
    await expect(page.locator(".wt-legenda")).toContainText("grens bij benadering");
    // Na de scheuring: Juda apart, het gezag over de buurvolken is voorbij.
    await naarJaar(page, -924);
    await expect.poll(() => getekend(page, "path.wt-gebied-juda")).toBe(true);
    await expect.poll(() => getekend(page, "path.wt-gebied-onder-david")).toBe(false);
    // David: dertig jaar bij zijn troonsbestijging, veertig jaar koning; het geboortejaar is omgerekend.
    if (await page.locator(".wt-p-lijnen").isHidden()) await page.getByRole("tab", { name: "Levenslijnen" }).click();
    await page.locator('.wt-naam[data-p="david"]').click();
    const kaart = page.locator(".wt-kaartje").filter({ hasText: "David" });
    await expect(kaart).toContainText("2 Samuël 5:4");
    await page.keyboard.press("Escape");
    await page.locator(".wt-terug").click();
    await expect(page).toHaveURL(/#v61$/);
    await expect(page.locator("#vTitel")).toHaveText("Salomo bouwt de tempel");
    expect(f).toEqual([]);
  });

  test("Mozes: geopend vanuit ‘Droog door de Schelfzee’, as in levensjaren, de reis loopt mee over de kaart", async ({ page }) => {
    const f = fouten(page);
    await page.goto("/bijbelreis?wereld=1#v26");
    await page.locator(".wt-ingang").click();
    await expect(page).toHaveURL(/#wereld\/mozes\/80$/);
    await expect(page.locator("#wtJaar")).toHaveText("80");
    await expect(page.locator(".wt-jaar")).toContainText("jaar in het leven van Mozes");
    await expect(page.locator(".wt-jaar")).not.toContainText("v.Chr.");
    await expect(page.locator(".wt-onderschrift")).toContainText("Droog door de Schelfzee");
    if (!(await page.locator(".wt-kaartvlak").isVisible())) await page.getByRole("tab", { name: "Kaart" }).click();
    await expect(page.locator(".wt-kaartvlak")).toBeVisible();
    // Landstreken zonder grens; de route uit de reizen van de atlas; de reiziger staat bij de Schelfzee.
    await expect.poll(() => getekend(page, "path.wt-gebied-egypte")).toBe(true);
    await expect(page.locator("path.wt-gebied:not(.streek)")).toHaveCount(0);
    await page.locator(".wt-legenda summary").click();
    await expect(page.locator(".wt-legenda")).toContainText("Landstreken bij benadering, zonder grenzen");
    await expect(page.locator(".wt-legenda")).toContainText("reconstructie");
    await expect(page.locator(".wt-reiziger")).toHaveCount(1);
    await expect(page.locator(".wt-alt").first()).toBeAttached();
    const plek = () => page.locator(".wt-reiziger").evaluate((el) => (el as HTMLElement).style.transform);
    const bijZee = await plek();
    const getrokken = () => page.locator("path.wt-reis-lijn").evaluateAll((ps) => ps.filter((p) => { const d = p.getAttribute("d"); return !!d && d !== "M0 0"; }).length);
    const voor = await getrokken();
    // Snel afspelen: de reiziger loopt verder (naar Mara en Elim) en de afgelegde route groeit.
    await page.locator('[data-snel="snel"]').click();
    await page.locator(".wt-speel").click();
    await expect.poll(async () => (await staat(page)).t, { timeout: 15_000 }).toBeGreaterThan(80.27);
    await page.locator(".wt-speel").click();
    expect(await plek()).not.toBe(bijZee);
    expect(await getrokken()).toBeGreaterThan(voor);
    // Een onzekere plaats: het kaartje noemt de andere mogelijke plekken.
    await page.locator(".wt-legenda summary").click(); // legenda weer dicht
    await page.locator('.wt-stad button[data-stad="sinai"]').evaluate((b) => (b as HTMLButtonElement).click());
    await expect(page.locator(".wt-kaartje").filter({ hasText: "Berg Sinaï" })).toContainText("Andere mogelijke plekken");
    await page.keyboard.press("Escape");
    // Aäron: drie jaar ouder, 123 jaar oud.
    await page.getByRole("tab", { name: "Levenslijnen" }).click();
    await page.locator('.wt-naam[data-p="aaron"]').click();
    const aaron = page.locator(".wt-kaartje").filter({ hasText: "Aäron" });
    await expect(aaron).toContainText("3 jaar vóór de geboorte van Mozes");
    await expect(aaron).toContainText("123 jaar oud");
    await page.keyboard.press("Escape");
    // Waarom geen jaartallen: beide dateringen, geen farao.
    await page.locator("[data-wt-over]").click();
    await expect(page.locator(".wt-over")).toContainText("1446");
    await expect(page.locator(".wt-over")).toContainText("13e eeuw");
    await page.keyboard.press("Escape");
    // Terug in het verhaal.
    await page.locator(".wt-terug").click();
    await expect(laag(page)).toBeHidden();
    await expect(page).toHaveURL(/#v26$/);
    await expect(page.locator("#vTitel")).toHaveText("Droog door de Schelfzee");
    expect(f).toEqual([]);
  });

  test("kaartengine met testdata: de grens verandert tussen twee jaren, een gebied verschijnt", async ({ page }) => {
    await page.route("**/bijbelreis/wereld/perioden/test-kaart.json*", (r) => r.fulfill({ status: 200, contentType: "application/json", body: FIXTURE }));
    await openLaag(page, "wereld/test-kaart/600");
    if (!(await page.locator(".wt-kaartvlak").isVisible())) await page.getByRole("tab", { name: "Kaart" }).click();
    const a = page.locator("path.wt-gebied-test-a"), b = page.locator("path.wt-gebied-test-b");
    await expect.poll(() => getekend(page, "path.wt-gebied-test-a")).toBe(true);
    const d600 = await a.getAttribute("d");
    expect(await getekend(page, "path.wt-gebied-test-b")).toBe(false);
    await expect(a).toHaveClass(/benaderd/);
    await naarJaar(page, -570);
    await expect.poll(() => a.getAttribute("d")).not.toBe(d600);
    expect(await getekend(page, "path.wt-gebied-test-b")).toBe(true);
    await naarJaar(page, -560);
    await expect(a).not.toHaveClass(/benaderd/); // de sleutel van 560 is ‘historisch’
    await expect(page.locator(".wt-legenda")).toContainText("grens bij benadering");
    // De gebeurtenis op haar plek licht op zodra ze bereikt is.
    await expect(page.locator(".wt-plek")).toHaveCount(1);
  });

  test("ontbrekende of kapotte gegevens: een nette melding, geen leeg scherm", async ({ page }) => {
    await page.route("**/bijbelreis/wereld/perioden/adam-noach.json*", (r) => r.fulfill({ status: 404, body: "weg" }));
    await page.goto("/bijbelreis#wereld/adam-noach/987");
    await expect(laag(page)).toContainText("Deze tijdlijn kon niet worden geladen.");
    await page.unroute("**/bijbelreis/wereld/perioden/adam-noach.json*");
    await page.route("**/bijbelreis/wereld/perioden/adam-noach.json*", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{kapot" }));
    await page.getByRole("button", { name: "Opnieuw proberen" }).click();
    await expect(laag(page)).toContainText("Deze tijdlijn kon niet worden geladen.");
    await page.unroute("**/bijbelreis/wereld/perioden/adam-noach.json*");
    await page.getByRole("button", { name: "Opnieuw proberen" }).click();
    await expect(page.locator(".wt-app .wt-svg .wt-balk").first()).toBeAttached();
    await page.goto("/bijbelreis#wereld/bestaat-niet/1");
    await expect(laag(page)).toContainText("Deze tijdlijn kon niet worden geladen.");
    await page.getByRole("button", { name: "Terug naar de Bijbelreis" }).click();
    await expect(laag(page)).toBeHidden();
  });

  test("geen horizontaal scrollen van de pagina; bediening binnen beeld", async ({ page, isMobile }) => {
    const maten = isMobile ? [[390, 664], [375, 553], [360, 640], [430, 739]] : [[page.viewportSize()!.width, page.viewportSize()!.height]];
    for (const [w, h] of maten) {
      await page.setViewportSize({ width: w, height: h });
      for (const p of ["adam-noach/987", "daniel-babylon/560", "mozes/80", "israel-assyrie/722", "david-salomo/990", "perzie/479", "geboorte-jezus/-4"]) {
        await openLaag(page, "wereld/" + p);
        const m = await page.evaluate(() => ({ dicht: getComputedStyle(document.documentElement).overflowX === "hidden" ? 0 : document.documentElement.scrollWidth, laag: document.getElementById("wtLaag")!.scrollWidth, w: window.innerWidth, h: window.innerHeight, speel: document.querySelector(".wt-speel")!.getBoundingClientRect().bottom, schuif: document.querySelector("#wtSchuif")!.getBoundingClientRect().width }));
        // Zolang de laag open is, staat de pagina eronder vast (overflow hidden); de laag zelf schuift niet opzij.
        expect(m.dicht, `${w}×${h} ${p}: pagina eronder vast`).toBe(0);
        expect(m.laag, `${w}×${h} ${p}`).toBeLessThanOrEqual(m.w);
        expect(m.speel, `${w}×${h} ${p}: afspeelknop in beeld`).toBeLessThanOrEqual(m.h);
        expect(m.schuif).toBeGreaterThan(Math.min(w * 0.5 - 40, 300));
        // Namen blijven in beeld als je in de tijd schuift (vaste naamkolom).
        await page.locator('[data-zoom="in"]').click();
        await page.locator('[data-zoom="in"]').click();
        await expect(page.locator(".wt-naam").first()).toBeInViewport();
      }
    }
  });

  test("toegankelijkheid: geen axe-overtredingen in de laag (ook met een open persoon)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openLaag(page, "wereld/adam-noach/987");
    const axe = async () => (await new AxeBuilder({ page }).include("#wtLaag").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze()).violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
    expect(await axe()).toEqual([]);
    await page.locator('.wt-naam[data-p="henoch"]').click();
    await expect(page.locator(".wt-kaartje")).toBeVisible();
    expect(await axe()).toEqual([]);
    await openLaag(page, "wereld/daniel-babylon/586");
    expect(await axe()).toEqual([]);
    await openLaag(page, "wereld/perzie/445");
    expect(await axe()).toEqual([]);
    await openLaag(page, "wereld/geboorte-jezus/28");
    expect(await axe()).toEqual([]);
    await page.locator('.wt-naam[data-p="cyrenius"]').click();
    await expect(page.locator(".wt-kaartje")).toBeVisible();
    expect(await axe()).toEqual([]);
    await page.keyboard.press("Escape");
    for (const p of ["israel-assyrie/722", "david-salomo/966"]) {
      await openLaag(page, "wereld/" + p);
      expect(await axe(), p).toEqual([]);
    }
    await openLaag(page, "wereld/mozes/100");
    expect(await axe()).toEqual([]);
    if (!(await page.locator(".wt-kaartvlak").isVisible())) await page.getByRole("tab", { name: "Kaart" }).click();
    await expect(page.locator(".wt-reiziger")).toHaveCount(1);
    expect(await axe()).toEqual([]);
    // Tekstueel alternatief voor de visualisatie.
    await expect(page.locator("#wtLaag table caption")).toContainText("Levenslijnen");
    await expect(page.locator("#wtLive")).toHaveAttribute("aria-live", "polite");
  });
});

test.describe("De wereld in die tijd offline", () => {
  test.use({ serviceWorkers: "allow" });
  test.skip(({ isMobile }) => isMobile, "één keer is genoeg");
  test("na een bezoek werkt de laag ook zonder internet", async ({ page, context }) => {
    await begin(page);
    await page.goto("/bijbelreis");
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 });
    await page.waitForFunction(async () => (await caches.keys()).some((k) => k.startsWith("bijbelreis-schil-")) && (await (await caches.open((await caches.keys()).find((k) => k.startsWith("bijbelreis-schil-"))!)).keys()).some((r) => r.url.includes("/wereld/perioden/adam-noach.json")), null, { timeout: 30_000 });
    await context.setOffline(true);
    await page.goto("/bijbelreis#wereld/adam-noach/987");
    await expect(laag(page)).toBeVisible();
    await expect(page.locator(".wt-app .wt-svg .wt-balk").first()).toBeAttached();
    await expect(page.locator("#wtJaar")).toHaveText("987");
    await context.setOffline(false);
  });
});
