import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

// Presentatie en boekje (/bijbelreis/boekje): diavoorstelling, afdrukbaar boekje, los bestand en delen.
// Uitleg: docs/bijbelreis-boekje/README.md. Draaien tegen een server die public/ serveert en /bijbelreis/boekje naar
// bijbelreis/boekje.html stuurt:
//   E2E_BASE_URL=http://127.0.0.1:8824 npx playwright test e2e/bijbelreis-boekje.spec.ts --trace off

test.use({ reducedMotion: "reduce" });

function fouten(page: Page) {
  const lijst: string[] = [];
  page.on("pageerror", (e) => lijst.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") lijst.push(m.text()); });
  return lijst;
}
const dia = (page: Page) => page.locator(".bk-dia");
// Elke keer een verse pagina (een ander fragment op dezelfde pagina is anders maar een hashchange).
const open = async (page: Page, hash: string) => { if (page.url() !== "about:blank") await page.goto("about:blank"); await page.goto("/bijbelreis/boekje" + hash); await expect(dia(page)).toBeVisible(); };
const nummer = (page: Page) => dia(page).getAttribute("data-nr").then(Number);
const stappenVan = (page: Page, boek: string, deel: string) => page.evaluate(([b, d]) => BR.boeken.find((x: { id: string }) => x.id === b).delen.find((x: { id: string }) => x.id === d).steps.map((s: { t: string; ref: string; txt: string }) => ({ t: s.t, ref: s.ref, txt: s.txt })), [boek, deel]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const BR: any;

test("een deel opent als diavoorstelling en volgt de stappen in de goede volgorde", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#ur-kanaan&niveau=c");
  await expect(dia(page).locator(".bk-titel")).toHaveText("Van Ur naar Kanaän");
  await expect(dia(page).locator(".bk-lees")).toContainText("Lees in je Bijbel: Genesis 11:27–12:5");
  const stappen = await stappenVan(page, "genesis", "ur-kanaan");
  for (let i = 0; i < stappen.length; i++) {
    await page.locator('[data-actie="volgende"]').click();
    await expect(dia(page).locator(".bk-kop")).toHaveText(`Stap ${i + 1} van ${stappen.length}`);
    await expect(dia(page).locator(".bk-titel")).toHaveText(stappen[i].t);
    await expect(dia(page).locator(".bk-ref")).toContainText(stappen[i].ref);
    await expect(dia(page).locator(".bk-txt > p").first()).toHaveText(stappen[i].txt);
  }
  // Daarna de vragen en de slotdia met de bronnen en de maker.
  // Op Verder ontdekken eerst ‘Elders in de Bijbel’, dan de vragen.
  await page.locator('[data-actie="volgende"]').click();
  await expect(dia(page)).toHaveAttribute("data-soort", "tekst");
  await expect(dia(page)).toContainText("Elders in de Bijbel");
  await page.locator('[data-actie="volgende"]').click();
  await expect(dia(page)).toHaveAttribute("data-soort", "vraag");
  await page.keyboard.press("End");
  await expect(dia(page)).toHaveAttribute("data-soort", "slot");
  await expect(dia(page)).toContainText("Statenvertaling");
  await expect(dia(page)).toContainText("OpenBible.info");
  await expect(dia(page)).toContainText("Open Database License");
  await expect(dia(page).getByRole("img", { name: "Denckh" })).toHaveAttribute("src", "/bijbelreis/denckh-logo-signature.svg");
  await expect(dia(page).getByRole("link", { name: "bijbelreis.nl" })).toBeVisible();
  // Raadkoord staat bij de maker onderaan de pagina, niet in de diavoorstelling.
  await expect(dia(page)).not.toContainText("Raadkoord");
  await expect(page.locator(".bk-voet").getByRole("link", { name: "Raadkoord" })).toHaveAttribute("href", "https://raadkoord.nl/");
  await expect(page.locator(".bk-voet").getByRole("link", { name: "Raadkoord" })).toHaveAttribute("rel", "noopener");
  expect(f).toEqual([]);
});

test("een heel boek, een geschiedenis en een bereik van stappen", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#boek=jona");
  await expect(dia(page).locator(".bk-titel")).toHaveText("Jona");
  const nJona = await page.evaluate(() => BR.boeken.find((b: { id: string }) => b.id === "jona").delen.reduce((n: number, d: { steps: unknown[] }) => n + d.steps.length, 0));
  expect(await page.evaluate(() => BR.boekjePagina.pakket.dias.filter((d: { s: string }) => d.s === "stap").length)).toBe(nJona);

  await open(page, "#v26&niveau=b");
  await expect(dia(page).locator(".bk-kop")).toHaveText("Geschiedenis 26");
  await expect(dia(page).locator(".bk-titel")).toHaveText("Droog door de Schelfzee");
  await page.keyboard.press("ArrowRight");
  const b = await page.evaluate(() => BR.niveaus.verhalen[26].b.delen[0]);
  await expect(dia(page).locator(".bk-titel")).toHaveText(b.kop);
  await expect(dia(page).locator(".bk-txt > p").first()).toHaveText(b.t);

  await open(page, "#abraham/3-5");
  await expect(dia(page).locator(".bk-ref")).toContainText("stap 3–5 van 25");
  const stappen = await stappenVan(page, "genesis", "abraham");
  for (const i of [2, 3, 4]) { await page.keyboard.press("ArrowRight"); await expect(dia(page).locator(".bk-titel")).toHaveText(stappen[i].t); await expect(dia(page).locator(".bk-kop")).toHaveText(`Stap ${i + 1} van 25`); }
  await page.keyboard.press("ArrowRight");
  await expect(dia(page)).toHaveAttribute("data-soort", "vraag");
  expect(f).toEqual([]);
});

test("de kaart toont de plaatsen en de route van de stap, met namen die niet over elkaar of over de lijn liggen", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#ur-kanaan&niveau=b");
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  const kaart = dia(page).locator("svg.bk-kaart");
  await expect(kaart).toHaveAttribute("aria-label", /Ur.*Haran.*Route van Ur naar Haran \(reconstructie\)/);
  await expect(kaart.locator('[data-plaats="ur"]')).toHaveCount(1);
  await expect(kaart.locator('[data-plaats="haran"]')).toHaveCount(1);
  await expect(kaart.locator(".bk-route.recon")).toHaveCount(1);
  await expect(kaart.locator("[data-begin]")).toHaveCount(1);
  await expect(kaart.locator("[data-kop]")).toHaveCount(1);
  await expect(kaart.locator(".bk-sleutel")).toContainText("reconstructie");
  await expect(kaart.locator(".bk-schaal")).toContainText("km");
  const maat = await kaart.evaluate((svg) => {
    const k = svg.getBoundingClientRect(), route = svg.querySelector(".bk-route .bk-lijn")!.getBoundingClientRect();
    const namen = [...svg.querySelectorAll("text.bk-naam")].map((t) => t.getBoundingClientRect());
    const over = namen.some((a, i) => namen.some((b, j) => j > i && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1));
    return { binnen: route.left >= k.left - 1 && route.right <= k.right + 1 && route.top >= k.top - 1 && route.bottom <= k.bottom + 1, over, ur: !!svg.querySelector('[data-naam="ur"]'), haran: !!svg.querySelector('[data-naam="haran"]') };
  });
  expect(maat).toEqual({ binnen: true, over: false, ur: true, haran: true });
  expect(f).toEqual([]);
});

test("een stap met een tafereel toont het, met een naam voor schermlezers", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#intocht");
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
  await expect(dia(page).locator(".bk-titel")).toHaveText("De muren van Jericho");
  await expect(dia(page).locator('figure[data-tf="jericho"]')).toBeVisible();
  await expect(dia(page).locator('figure[data-tf="jericho"]').getByRole("img", { name: /Jericho/ })).toBeVisible();
  await expect(dia(page).locator('figure[data-tf="jericho"] figcaption')).toContainText("Jozua 6:20");
  expect(f).toEqual([]);
});

test("vooruit en terug met toetsen, een presentatieklikker, tikken en vegen", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#jakob");
  expect(await nummer(page)).toBe(0);
  await page.keyboard.press("ArrowRight"); expect(await nummer(page)).toBe(1);
  await page.keyboard.press("PageDown"); expect(await nummer(page)).toBe(2);
  await page.locator(".bk-titel").click(); expect(await nummer(page)).toBe(3);
  await page.keyboard.press("ArrowLeft"); expect(await nummer(page)).toBe(2);
  await page.keyboard.press("PageUp"); expect(await nummer(page)).toBe(1);
  await page.keyboard.press("Home"); expect(await nummer(page)).toBe(0);
  // Spatie op de pagina zelf (niet op een knop) is ook ‘volgende’.
  await page.locator(".bk-titel").click(); await page.keyboard.press("ArrowLeft");
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.keyboard.press(" "); expect(await nummer(page)).toBe(1);
  // Vegen naar links: volgende.
  const box = (await page.locator(".bk-dias").boundingBox())!;
  await page.locator(".bk-dias").dispatchEvent("pointerdown", { clientX: box.x + box.width * 0.7, clientY: box.y + 100 });
  await page.locator(".bk-dias").dispatchEvent("pointerup", { clientX: box.x + box.width * 0.2, clientY: box.y + 110 });
  expect(await nummer(page)).toBe(2);
  await expect(page.locator(".bk-teller")).toHaveText(/^3 \/ \d+$/);
  // Een vraag: ‘volgende’ laat eerst het antwoord zien.
  await page.keyboard.press("End"); await page.keyboard.press("ArrowLeft");
  while ((await dia(page).getAttribute("data-soort")) !== "vraag") await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await expect(dia(page).locator(".bk-antwoord")).toBeVisible();
  await expect(dia(page).locator(".bk-optie.goed")).toHaveCount(1);
  expect(f).toEqual([]);
});

test.describe("vanzelf afspelen", () => {
  test.use({ reducedMotion: "no-preference" });
  test("loopt in het gekozen tempo, pauzeert en tekent de route", async ({ page }) => {
    const f = fouten(page);
    await page.clock.install();
    await open(page, "#ur-kanaan");
    await page.locator("[data-tempo]").selectOption("vlot");
    await page.locator('[data-actie="speel"]').click();
    await expect(page.locator('[data-actie="speel"]')).toHaveAttribute("aria-pressed", "true");
    await page.clock.fastForward(16000);
    const na = await nummer(page);
    expect(na).toBeGreaterThan(0);
    await page.locator('[data-actie="speel"]').click();
    await expect(page.locator('[data-actie="speel"]')).toHaveAttribute("aria-pressed", "false");
    await page.clock.fastForward(60000);
    expect(await nummer(page)).toBe(na);
    // In de presentatie tekent de route zich (een masker langs de lijn), en loopt de beweging.
    await page.evaluate(() => BR.boekjePagina.speler.naar(3));
    await page.clock.runFor(100);
    await expect(dia(page)).toHaveClass(/bk-loopt/);
    await expect(dia(page).locator("mask .bk-maskpad")).toHaveCount(1);
    expect(f).toEqual([]);
  });
});

test("het boekje heeft alle stappen en wordt afgedrukt als A4", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#uittocht&niveau=b");
  await page.getByRole("button", { name: "Boekje" }).click();
  await expect(page.locator(".bk-boekje")).toBeVisible();
  await expect(page.locator(".bk-podium")).toBeHidden();
  const stappen = await stappenVan(page, "exodus", "uittocht");
  await expect(page.locator(".bk-b-stap")).toHaveCount(stappen.length);
  await expect(page.locator(".bk-b-stap h3")).toHaveText(stappen.map((s: { t: string }) => s.t));
  await expect(page.locator(".bk-b-stap svg.bk-kaart")).toHaveCount(stappen.length);
  await expect(page.locator(".bk-b-vragen li > p").first()).toBeVisible();
  await expect(page.locator(".bk-b-slot")).toContainText("Statenvertaling");
  expect(page.url()).toContain("toon=boekje");
  // In de afdrukweergave staat alleen het boekje; de knoppen en de voet (met Raadkoord) niet.
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".bk-balk")).toBeHidden();
  await expect(page.locator(".bk-voet")).toBeHidden();
  await expect(page.locator(".bk-b-stap").first()).toBeVisible();
  const pdf = await page.pdf({ format: "A4", preferCSSPageSize: true, printBackground: true });
  expect(pdf.length).toBeGreaterThan(20000);
  await page.emulateMedia({ media: "screen" });
  // De knop opent het afdrukvenster (hier nagebootst).
  await page.evaluate(() => { (window as unknown as { gedrukt: number }).gedrukt = 0; window.print = () => { (window as unknown as { gedrukt: number }).gedrukt++; }; });
  await page.getByRole("button", { name: "Afdrukken of opslaan als PDF" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { gedrukt: number }).gedrukt)).toBe(1);
  expect(f).toEqual([]);
});

test("het losse bestand bevat de gekozen stappen en werkt zonder internet", async ({ page, browser }, info) => {
  const f = fouten(page);
  await open(page, "#abraham/3-5&niveau=b");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download als bestand" }).click()]);
  expect(download.suggestedFilename()).toBe("bijbelreis-abraham-stap-3-5-niveau-b.html");
  const pad = info.outputPath("los.html");
  await download.saveAs(pad);
  const html = readFileSync(pad, "utf8");
  const stappen = await stappenVan(page, "genesis", "abraham");
  for (const i of [2, 3, 4]) expect(html).toContain(JSON.stringify(stappen[i].t).slice(1, -1));
  expect(html).not.toContain(JSON.stringify(stappen[5].t).slice(1, -1));
  expect(html.length).toBeLessThan(400_000);
  expect(html).not.toMatch(/<script[^>]+src=|<link[^>]+href=/);
  expect(html).not.toContain("Raadkoord");
  // Openen zonder server: geen verzoeken naar buiten, wel de dia’s en de kaart.
  const los = await (await browser.newContext({ reducedMotion: "reduce" })).newPage();
  const fl = fouten(los), buiten: string[] = [];
  los.on("request", (r) => { if (!/^(file|data|blob):/.test(r.url())) buiten.push(r.url()); });
  await los.goto("file://" + pad);
  await expect(los.locator(".bk-dia")).toBeVisible();
  await los.keyboard.press("ArrowRight");
  await expect(los.locator(".bk-dia .bk-titel")).toHaveText(stappen[2].t);
  await expect(los.locator(".bk-dia svg.bk-kaart .bk-land")).toHaveCount(1);
  await los.getByRole("button", { name: "Boekje" }).click();
  await expect(los.locator(".bk-b-stap")).toHaveCount(3);
  expect(buiten).toEqual([]);
  expect(fl).toEqual([]);
  expect(f).toEqual([]);
});

test("de deelknop geeft het adres van precies deze presentatie", async ({ page, context, browserName }) => {
  const f = fouten(page);
  await page.addInitScript(() => { (navigator as unknown as { share: (d: unknown) => Promise<void> }).share = (d) => { (window as unknown as { gedeeld: unknown }).gedeeld = d; return Promise.resolve(); }; });
  await open(page, "#abraham/3-5&niveau=a");
  await page.getByRole("button", { name: "Deel de link" }).click();
  const d = await page.evaluate(() => (window as unknown as { gedeeld: { url: string; title: string } }).gedeeld);
  expect(d.url).toMatch(/\/bijbelreis\/boekje#abraham\/3-5&niveau=a$/);
  expect(d.title).toContain("Abraham");
  // Zonder Web Share: naar het klembord.
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.evaluate(() => { delete (navigator as unknown as { share?: unknown }).share; Object.defineProperty(navigator, "share", { value: undefined, configurable: true }); });
    await page.getByRole("button", { name: "Boekje" }).click();
    await page.getByRole("button", { name: "Deel de link" }).click();
    await expect(page.locator("#toast")).toContainText("gekopieerd");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/bijbelreis\/boekje#abraham\/3-5&niveau=a&toon=boekje$/);
  }
  expect(f).toEqual([]);
});

test("de drie niveaus verschillen", async ({ page }) => {
  const f = fouten(page);
  const stap1 = async (n: string) => { await open(page, `#uittocht&niveau=${n}`); await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); return { txt: await dia(page).locator(".bk-txt > p").first().textContent(), weetje: await dia(page).locator(".bk-weetje").count(), niveau: await page.locator(".bk-niveau").count(), opties: await page.evaluate(() => BR.boekjePagina.pakket.dias.find((d: { s: string }) => d.s === "vraag").a.length), wie: await dia(page).locator(".bk-wie").count() }; };
  const a = await stap1("a"), b = await stap1("b"), c = await stap1("c");
  const bron = (await stappenVan(page, "exodus", "uittocht"))[1].txt;
  expect(b.txt).toBe(bron); expect(c.txt).toBe(bron);
  expect(a.txt!.length).toBeLessThan(bron.length); expect(bron.startsWith(a.txt!)).toBe(true);
  expect([a.weetje, b.weetje, c.weetje]).toEqual([0, 1, 1]);
  expect([a.wie, b.wie, c.wie]).toEqual([0, 0, 1]);
  expect([a.opties, b.opties, c.opties]).toEqual([2, 3, 3]);
  await page.keyboard.press("Home");
  await expect(page.locator(".bk-niveau")).toContainText("Verder ontdekken");
  expect(f).toEqual([]);
});

test("kiezen zonder adres: het keuzescherm onthoudt alleen de eigen instelling", async ({ page }) => {
  const f = fouten(page);
  await page.addInitScript(() => { if (!sessionStorage.getItem("gezet")) { sessionStorage.setItem("gezet", "1"); localStorage.setItem("bijbelreis:niveau", JSON.stringify("c")); localStorage.setItem("bijbelreis:gezien", "[]"); } });
  await page.goto("/bijbelreis/boekje");
  await expect(page.getByRole("heading", { name: /Maak een presentatie/ })).toBeVisible();
  await page.getByLabel("Bijbelboek", { exact: true }).selectOption("exodus");
  await page.getByLabel("Deel", { exact: true }).selectOption("uittocht");
  await page.getByLabel("Van stap").selectOption("4");
  await page.getByLabel("Tot en met stap").selectOption("6");
  await page.getByText("Samen ontdekken").click();
  await page.getByRole("button", { name: "Maak de presentatie" }).click();
  await expect(dia(page)).toBeVisible();
  expect(new URL(page.url()).hash).toBe("#uittocht/4-6&niveau=a");
  const opslag = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
  expect(JSON.parse(opslag["bijbelreis:boekje"]!)).toMatchObject({ niveau: "a" });
  expect(opslag["bijbelreis:niveau"]).toBe(JSON.stringify("c"));
  expect(opslag["bijbelreis:gezien"]).toBe("[]");
  expect(Object.keys(opslag).sort()).toEqual(["bijbelreis:boekje", "bijbelreis:gezien", "bijbelreis:niveau"]);
  // Een geschiedenis kiezen.
  await page.getByRole("link", { name: "Iets anders kiezen" }).click();
  await page.getByText("Een geschiedenis", { exact: false }).first().click();
  await page.getByLabel("Geschiedenis", { exact: true }).selectOption("26");
  await page.getByRole("button", { name: "Maak de presentatie" }).click();
  await expect(dia(page).locator(".bk-titel")).toHaveText("Droog door de Schelfzee");
  // Een adres dat niet bestaat: terug naar het keuzescherm, met uitleg.
  await page.goto("/bijbelreis/boekje#v999");
  await expect(page.getByRole("alert")).toContainText("bestaat niet");
  expect(f).toEqual([]);
});

test("volledig scherm en een telefoon die je doorgeeft", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#nt-paulusrome");
  await page.locator('[data-actie="vol"]').click();
  await expect(page.locator('[data-actie="vol"]')).toHaveAttribute("aria-pressed", "true");
  const vol = await page.locator(".bk-podium").boundingBox();
  const vp = page.viewportSize()!;
  expect(Math.round(vol!.width)).toBe(vp.width);
  await page.keyboard.press("ArrowRight");
  await expect(dia(page).locator(".bk-titel")).toHaveText("Op weg naar Jeruzalem");
  // Geen horizontaal schuiven, en de knoppen zijn groot genoeg om te tikken.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const knop = await page.locator('[data-actie="volgende"]').boundingBox();
  expect(knop!.height).toBeGreaterThanOrEqual(40);
  await page.locator('[data-actie="vol"]').click();
  await expect(page.locator('[data-actie="vol"]')).toHaveAttribute("aria-pressed", "false");
  expect(f).toEqual([]);
});

for (const [naam, hash] of [["keuzescherm", ""], ["presentatie", "#ur-kanaan"], ["vraag", "#ur-kanaan&dia=9"], ["boekje", "#v26&niveau=c&toon=boekje"]] as const) {
  test(`toegankelijkheid: ${naam}`, async ({ page }) => {
    const f = fouten(page);
    await page.goto("/bijbelreis/boekje" + hash);
    await page.waitForSelector(hash ? (hash.includes("boekje") ? ".bk-b-stap" : ".bk-dia") : "#kiesForm");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const ernstig = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(ernstig.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    expect(f).toEqual([]);
  });
}
