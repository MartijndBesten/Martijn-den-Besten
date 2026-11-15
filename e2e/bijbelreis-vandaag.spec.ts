import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// De kaart van nu (duidelijke landen, omstreden grenzen als eigen lijnsoort) en de laag ‘Vandaag’ met haar lijst.
// Regels en maatstaf: docs/bijbelreis-vandaag/README.md. Draaien tegen een server die public/ serveert:
//   E2E_BASE_URL=http://127.0.0.1:8813 npx playwright test e2e/bijbelreis-vandaag.spec.ts --trace off

test.use({ reducedMotion: "reduce" });
const zetNiveau = (page: Page, n: "a" | "b" | "c") => page.addInitScript((x) => { if (sessionStorage.getItem("niveauGezet")) return; sessionStorage.setItem("niveauGezet", "1"); localStorage.setItem("bijbelreis:niveau", JSON.stringify(x)); localStorage.setItem("bijbelreis:welkomWeg", "true"); }, n);
test.beforeEach(async ({ page }) => { await zetNiveau(page, "c"); });

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
// Alleen voor de test: de Leaflet-kaart als window.__kaart (haak bij het laden van Leaflet). De app zelf verandert niet.
type Kaart = { getZoom: () => number; fitBounds: (b: [[number, number], [number, number]], o?: object) => void; setView: (ll: [number, number], z: number, o?: object) => void };
async function kaartHaak(page: Page) {
  await page.addInitScript(() => {
    let echt: unknown;
    Object.defineProperty(window, "L", { configurable: true, get: () => echt, set: (v: { Map: { addInitHook: (f: () => void) => void } }) => { echt = v; v.Map.addInitHook(function (this: unknown) { (window as unknown as { __kaart: unknown }).__kaart = this; }); } });
  });
}
const uitsnede = async (page: Page, b: [[number, number], [number, number]]) => { await page.evaluate((b) => (window as unknown as { __kaart: Kaart }).__kaart.fitBounds(b, { animate: false }), b); await page.waitForTimeout(250); };
const REGIO: [[number, number], [number, number]] = [[29.0, 30.5], [38.6, 47.6]];
const opslag = (page: Page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:")).map((k) => [k, localStorage.getItem(k)])));
const zichtbareNamen = (page: Page, sel: string) => page.evaluate((sel) => [...document.querySelectorAll("#map " + sel)].filter((e) => getComputedStyle(e).display !== "none").map((e) => e.textContent!.trim()), sel);
const breed = (page: Page) => page.viewportSize()!.width > 900;
// Het venster van een plek: op een breed scherm een ballon op de kaart, anders een blad van onderen.
const venster = (page: Page) => (breed(page) ? page.locator(".leaflet-popup .vdpop") : page.locator("#vandaagVenster"));

test("stand Nu: landnamen, gebiedsnamen en twee soorten lijnen", async ({ page }) => {
  const errors = watchErrors(page);
  await kaartHaak(page);
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("#map .land").first()).toBeAttached();
  // Toen: geen moderne grenzen, namen of knop.
  await expect(page.locator("#map .border")).toHaveCount(0);
  await expect(page.locator("#vandaagBtn")).toBeHidden();
  await page.locator("#nuBtn").click();
  await expect(page.locator("#map .border").first()).toBeAttached();
  // Een erkende landsgrens (doorgetrokken, met band) en een bestandslijn of omstreden grens (gestippeld) zijn eigen lijnsoorten.
  await expect(page.locator("#map path.border.band").first()).toBeAttached();
  await expect(page.locator("#map path.border.omstreden").first()).toBeAttached();
  const stijl = await page.evaluate(() => { const s = (q: string) => getComputedStyle(document.querySelector("#map path.border" + q)!).strokeDasharray; return { vast: s(":not(.band):not(.omstreden):not(.fijn)"), omstreden: s(".omstreden") }; });
  expect(stijl.vast).toBe("none");
  expect(stijl.omstreden).not.toBe("none");
  await uitsnede(page, REGIO);
  await expect.poll(() => zichtbareNamen(page, ".country")).toEqual(expect.arrayContaining(["Syrië", "Irak", "Turkije", "Jordanië", "Israël"]));
  const alle = await page.evaluate(() => [...document.querySelectorAll("#map .country, #map .gebied")].map((e) => e.textContent!.trim()));
  // Maatstaf: alleen landen die Nederland erkent krijgen een landnaam.
  for (const n of ["Noord-Cyprus", "Palestina", "Palestijnse gebieden"]) expect(alle, n).not.toContain(n);
  expect(alle).toEqual(expect.arrayContaining(["Kosovo", "Cyprus", "Malta"]));
  // Dichtbij staan de omstreden gebieden er met hun gangbare naam, als gebied (schuin), niet als land.
  for (const [naam, ll] of [["Westelijke Jordaanoever", [32.0, 35.2]], ["Gazastrook", [31.4, 34.4]], ["Golanhoogten", [33.0, 35.7]]] as [string, [number, number]][]) {
    await page.evaluate((ll) => (window as unknown as { __kaart: Kaart }).__kaart.setView(ll, 8, { animate: false }), ll);
    await expect.poll(() => zichtbareNamen(page, ".gebied"), naam).toContain(naam);
  }
  await page.evaluate(() => (window as unknown as { __kaart: Kaart }).__kaart.setView([31.6, 35.2], 8, { animate: false }));
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("#map .gebied")!).fontStyle)).toBe("italic");
  await expect.poll(() => zichtbareNamen(page, ".country")).toEqual(expect.arrayContaining(["Israël", "Jordanië"]));
  // Namen botsen niet met elkaar.
  const botsing = await page.evaluate(() => {
    const r = [...document.querySelectorAll("#map .country, #map .gebied")].filter((e) => getComputedStyle(e).display !== "none").map((e) => e.getBoundingClientRect());
    return r.some((a, i) => r.some((b, j) => j > i && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom));
  });
  expect(botsing).toBe(false);
  // De legenda legt de lijnen uit.
  await page.locator("#legendBtn").click();
  await expect(page.locator("#legend")).toContainText("Landsgrens");
  await expect(page.locator("#legend")).toContainText("bestandslijn of omstreden grens");
  await expect(page.locator("#legend")).toContainText("alleen landen die Nederland erkent");
  await expect(page.locator("#legend")).toContainText("vaste maatstaf, geen oordeel van de atlas");
  await expect(page.locator("#legend")).toContainText("gebied waarover de partijen het niet eens zijn");
  await page.locator("#legendSluit").click();
  // Terug naar Toen: alles van nu is weg.
  await page.locator("#toenBtn").click();
  await expect(page.locator("#map .border")).toHaveCount(0);
  await expect(page.locator("#map .country")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("laag Vandaag: standaard uit, aan en uit te zetten, keuze wordt onthouden", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("#map .land").first()).toBeAttached();
  const voor = await opslag(page);
  expect(voor["bijbelreis:vandaag"]).toBeUndefined();
  await page.locator("#nuBtn").click();
  const knop = page.locator("#vandaagBtn");
  await expect(knop).toBeVisible();
  await expect(knop).toHaveAttribute("aria-pressed", "false");
  await expect(knop).toHaveAccessibleName(/Vandaag/);
  await expect(page.locator("#map .vandaag")).toHaveCount(0);
  await knop.click();
  await expect(knop).toHaveAttribute("aria-pressed", "true");
  const n = await page.evaluate(() => (window as unknown as { BR: { vandaag: { plekken: unknown[] } } }).BR.vandaag.plekken.length);
  await expect(page.locator("#map .leaflet-marker-icon.vandaag")).toHaveCount(n);
  await expect(page.locator("#toast")).toContainText(`${n} plekken`);
  // Alleen de eigen sleutel komt erbij; de rest van de opslag blijft zoals het was.
  const na = await opslag(page);
  expect(na["bijbelreis:vandaag"]).toBe("true");
  const { "bijbelreis:vandaag": _nieuw, ...rest } = na;
  expect(rest).toEqual(voor);
  // In de stand Toen is de laag weg; terug in Nu staat ze er weer.
  await page.locator("#toenBtn").click();
  await expect(page.locator("#map .vandaag")).toHaveCount(0);
  await expect(knop).toBeHidden();
  // Na herladen: onthouden, maar pas zichtbaar in de stand Nu.
  await page.reload();
  await expect(page.locator("#map .land").first()).toBeAttached();
  await expect(page.locator("#map .vandaag")).toHaveCount(0);
  await page.locator("#nuBtn").click();
  await expect(page.locator("#map .leaflet-marker-icon.vandaag")).toHaveCount(n);
  await expect(knop).toHaveAttribute("aria-pressed", "true");
  await knop.click();
  await expect(page.locator("#map .vandaag")).toHaveCount(0);
  expect((await opslag(page))["bijbelreis:vandaag"]).toBe("false");
  expect(errors).toEqual([]);
});

test("laag Vandaag: een plek openen met het toetsenbord en door naar de Bijbelse plaats", async ({ page }) => {
  const errors = watchErrors(page);
  await kaartHaak(page);
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("#map .land").first()).toBeAttached();
  await page.locator("#nuBtn").click();
  await page.locator("#vandaagBtn").click();
  await uitsnede(page, [[31.2, 34.6], [32.4, 35.9]]);
  const bord = page.locator('#map .leaflet-marker-icon.vandaag[title="Vandaag: Hebron"]');
  await expect(bord.locator(".vd-bord")).toBeVisible(); // het kaartteken zelf is 0×0 (Leaflet); het bordje is wat je ziet
  await expect(bord).toHaveAttribute("role", "button");
  await expect(bord).toHaveAttribute("aria-label", "Vandaag: Hebron, Westelijke Jordaanoever");
  // Het bordje is een eigen teken, geen stip van een Bijbelse plaats.
  await expect(bord.locator(".vd-bord svg")).toBeVisible();
  await expect(bord.locator(".pin")).toHaveCount(0);
  await bord.focus();
  await page.keyboard.press("Enter");
  const v = venster(page);
  await expect(v).toBeVisible();
  await expect(v).toContainText("Hebron");
  await expect(v).toContainText("Westelijke Jordaanoever");
  await expect(v.locator(".label")).toHaveText(["Vandaag", "In de Bijbel"]);
  await expect(v).toContainText("Lees in je Bijbel: Genesis 23:17–20");
  await expect(v).toContainText("Peildatum: 15 november 2026");
  await expect(v).toContainText("kiest geen partij");
  // Beide namen van de plek die elke groep anders noemt.
  await expect(v).toContainText("Ibrahimi-moskee");
  await expect(v).toContainText("Graf van de Aartsvaders");
  // Verder ontdekken: de bronnen staan erbij.
  await expect(v.locator(".st a").first()).toHaveAttribute("href", /^https:\/\//);
  // De knop gaat naar de Bijbelse plaats, met ‘Hier in de reis’.
  await v.getByRole("button", { name: "Hebron · Mamre in de Bijbelreis" }).click();
  const plaats = page.locator(".leaflet-popup .pop:not(.vdpop)");
  await expect(plaats).toBeVisible();
  await expect(plaats.locator("h3")).toHaveText("Hebron · Mamre");
  await expect(plaats).toContainText("Hier in de reis");
  await expect(page.locator("#vandaagVenster")).toBeHidden();
  expect(errors).toEqual([]);
});

test("lijst Vandaag: peildatum, vaste zin, zoeken en naar de kaart", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("#map .land").first()).toBeAttached();
  const open = page.locator("#vandaagLijstBtn");
  await open.click();
  const lade = page.locator("#vandaagLade");
  await expect(lade).toBeVisible();
  await expect(lade).toHaveAttribute("role", "dialog");
  await expect(lade.getByRole("heading", { name: "Vandaag in de landen van de Bijbel" })).toBeVisible();
  await expect(page.locator("#vdPeil")).toHaveText("Peildatum: 15 november 2026.");
  await expect(page.locator("#vdToelichting")).toHaveText("De Bijbelreis kiest geen partij: hier staat alleen wat er op een plek is en wat de betrokken partijen er zelf over zeggen.");
  const n = await page.evaluate(() => (window as unknown as { BR: { vandaag: { plekken: unknown[] } } }).BR.vandaag.plekken.length);
  await expect(lade.locator("[data-vandaag]")).toHaveCount(n);
  await expect(page.locator("#vdAantal")).toContainText(`${n} plekken`);
  // Per streek, het hele gebied.
  await expect(lade.locator(".o-kop")).toHaveText(["Israël en de Palestijnse gebieden", "Libanon, Syrië en de Golanhoogten", "Jordanië", "Egypte", "Irak en Iran", "Turkije", "Griekenland", "Cyprus, Malta en Italië"]);
  // Zoeken op land en op naam (ook de Bijbelse naam).
  await page.locator("#vdZoek").fill("irak");
  await expect(lade.locator("[data-vandaag] b")).toHaveText(["Bagdad", "Mosul (Ninevé)", "Babylon (Babel)", "Ur"]);
  await page.locator("#vdZoek").fill("joppe");
  await expect(lade.locator("[data-vandaag] b")).toHaveText(["Tel Aviv-Jaffa (Joppe)"]);
  await page.locator("#vdZoek").fill("qqq");
  await expect(lade).toContainText("Niets gevonden");
  // Escape sluit en zet de focus terug.
  await page.keyboard.press("Escape");
  await expect(lade).toBeHidden();
  await expect(open).toBeFocused();
  // Een plek kiezen zet de kaart op Nu, de laag aan en opent het venster.
  await open.click();
  await page.locator("#vdZoek").fill("athene");
  await lade.locator('[data-vandaag="athene"]').click();
  await expect(lade).toBeHidden();
  await expect(page.locator("#nuBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#vandaagBtn")).toHaveAttribute("aria-pressed", "true");
  const v = venster(page);
  await expect(v).toBeVisible();
  await expect(v).toContainText("Akropolis");
  await expect(v).toContainText("Handelingen 17:16–34");
  expect((await opslag(page))["bijbelreis:vandaag"]).toBe("true");
  // De lijst is ook vanuit de legenda te openen.
  if (!breed(page)) await page.locator("#vandaagVenster .lade__head button").click();
  await page.locator("#legendBtn").click();
  await page.locator("#vandaagLegendaBtn").click();
  await expect(lade).toBeVisible();
  expect(errors).toEqual([]);
});

test("laag Vandaag: een plek zonder Bijbelse plaats heeft geen knop, een gevoelige plek noemt beide partijen", async ({ page }) => {
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("#map .land").first()).toBeAttached();
  await page.locator("#vandaagLijstBtn").click();
  await page.locator('#vandaagLade [data-vandaag="beiroet"]').click();
  const v = venster(page);
  await expect(v).toContainText("Beiroet zelf komt in de Bijbel niet voor");
  await expect(v.locator("[data-place]")).toHaveCount(0);
  if (!breed(page)) await page.locator("#vandaagVenster .lade__head button").click();
  await page.locator("#vandaagLijstBtn").click();
  await page.locator('#vandaagLade [data-vandaag="jeruzalem"]').click();
  await expect(v).toContainText("Israël bestuurt sinds 1967 de hele stad en noemt haar zijn hoofdstad; de Palestijnen willen dat Oost-Jeruzalem de hoofdstad van hun staat wordt.");
  await expect(v).toContainText("Jeroesjalajim");
  await expect(v).toContainText("Al-Quds");
});

test("Samen ontdekken (4–6 jaar): geen laag Vandaag, ook niet als ze eerder aan stond", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(() => { localStorage.setItem("bijbelreis:niveau", JSON.stringify("a")); localStorage.setItem("bijbelreis:vandaag", "true"); });
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("body")).toHaveAttribute("data-niveau", "a");
  await expect(page.locator("#map .land").first()).toBeAttached();
  await expect(page.locator("#vandaagLijstBtn")).toBeHidden();
  await expect(page.locator("#vandaagBtn")).toBeHidden();
  await expect(page.locator("#map .vandaag")).toHaveCount(0);
  // De keuze zelf blijft bewaard voor wie later een ander niveau kiest.
  expect((await opslag(page))["bijbelreis:vandaag"]).toBe("true");
  expect(errors).toEqual([]);
});

test("wisselen naar Samen ontdekken haalt de laag weg; terug komt ze weer", async ({ page }) => {
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("#map .land").first()).toBeAttached();
  await page.locator("#nuBtn").click();
  await page.locator("#vandaagBtn").click();
  await expect(page.locator("#map .leaflet-marker-icon.vandaag").first()).toBeAttached();
  await page.locator("#niveauBtn").click();
  await page.locator('#niveauOpties [data-niveau="a"]').click();
  await expect(page.locator("#map .vandaag")).toHaveCount(0);
  await page.locator("#niveauBtn").click();
  await page.locator('#niveauOpties [data-niveau="b"]').click();
  await expect(page.locator("#map .leaflet-marker-icon.vandaag").first()).toBeAttached();
  // Zelf op reis: het venster zonder bronnenregel.
  await page.locator("#vandaagLijstBtn").click();
  await page.locator('#vandaagLade [data-vandaag="rome"]').click();
  const v = venster(page);
  await expect(v).toContainText("Rome is de hoofdstad van Italië");
  await expect(v.locator(".st a")).toHaveCount(0);
});

test("op elk scherm passen de kaartknoppen en het venster binnen beeld", async ({ page }) => {
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("#map .land").first()).toBeAttached();
  await page.locator("#nuBtn").click();
  await page.locator("#vandaagBtn").click();
  const vp = page.viewportSize()!;
  for (const id of ["#toenBtn", "#nuBtn", "#legendBtn", "#vandaagBtn"]) {
    const r = (await page.locator(id).boundingBox())!;
    expect(r.x >= 0 && r.x + r.width <= vp.width, `${id} binnen beeld`).toBe(true);
    expect(r.height, `${id} groot genoeg om te raken`).toBeGreaterThanOrEqual(32);
  }
  // De knoppen overlappen de zoomknoppen niet.
  const zoom = (await page.locator(".leaflet-control-zoom").boundingBox())!, seg = (await page.locator(".maptools .seg").boundingBox())!;
  expect(seg.x >= zoom.x + zoom.width || seg.y >= zoom.y + zoom.height).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator("#vandaagLijstBtn").click();
  await page.locator('#vandaagLade [data-vandaag="gaza"]').click();
  const v = venster(page);
  await expect(v).toBeVisible();
  await expect(v).toContainText("Gazastrook");
  const r = (await (breed(page) ? page.locator(".leaflet-popup") : page.locator("#vandaagVenster .lade__box")).boundingBox())!;
  expect(r.x >= 0 && r.x + r.width <= vp.width + 1).toBe(true);
  // De lange tekst is te lezen: het venster kan schuiven en de sluitknop is bereikbaar.
  if (!breed(page)) await expect(page.locator("#vandaagVenster .lade__head button")).toBeVisible();
  else await expect(page.locator(".leaflet-popup-close-button")).toBeVisible();
});

test("toegankelijkheid: kaart van nu met de laag, het venster en de lijst", async ({ page }) => {
  const ernstig = async () => (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("#map .land").first()).toBeAttached();
  await page.locator("#nuBtn").click();
  await page.locator("#vandaagBtn").click();
  await page.locator("#legendBtn").click();
  await expect(page.locator("#lgNu")).toBeVisible();
  await page.waitForTimeout(400);
  expect(await ernstig(), "kaart van nu met legenda").toEqual([]);
  await page.locator("#legendSluit").click();
  await page.locator("#vandaagLijstBtn").click();
  await expect(page.locator("#vandaagLade")).toBeVisible();
  expect(await ernstig(), "lijst").toEqual([]);
  await page.locator('#vandaagLade [data-vandaag="hebron"]').click();
  await expect(venster(page)).toBeVisible();
  await page.waitForTimeout(300);
  expect(await ernstig(), "venster").toEqual([]);
});
