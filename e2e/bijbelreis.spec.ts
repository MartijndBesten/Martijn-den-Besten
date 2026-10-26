import { expect, test, type Page } from "@playwright/test";

// De Bijbelreis is een statische pagina (public/bijbelreis.html) met eigen JavaScript; deze tests lopen de
// belangrijkste routes door: diepe links, voortgang bewaren, tabbladen, Bijbeltekst, speurtocht en de kaart.

// Reisniveaus: de bestaande tests beschrijven de volledige weergave (Verder ontdekken, gelijk aan 3.1). Een test die
// een ander niveau of het eerste bezoek test, zet of wist bijbelreis:niveau zelf (zijn init-script draait hierna).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (localStorage.getItem("bijbelreis:niveau") === null) localStorage.setItem("bijbelreis:niveau", JSON.stringify("c")); });
});
// Alleen bij de eerste keer laden: een herladen moet laten zien wat de app zelf onthoudt.
const zetNiveau = (page: Page, n: "a" | "b" | "c" | null) => page.addInitScript((x) => { if (sessionStorage.getItem("niveauGezet")) return; sessionStorage.setItem("niveauGezet", "1"); if (x === null) localStorage.removeItem("bijbelreis:niveau"); else localStorage.setItem("bijbelreis:niveau", JSON.stringify(x)); }, n);

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

// Alleen voor de test: de Leaflet-kaart zichtbaar maken als window.__kaart (via een haak bij het laden van Leaflet), zodat
// de test weet op welke schermpixel een plaats ligt en zoom en midden kan aflezen. De app zelf verandert niet.
async function kaartHaak(page: Page) {
  await page.addInitScript(() => {
    let echt: unknown;
    Object.defineProperty(window, "L", { configurable: true, get: () => echt, set: (v: { Map: { addInitHook: (f: () => void) => void } }) => { echt = v; v.Map.addInitHook(function (this: unknown) { (window as unknown as { __kaart: unknown }).__kaart = this; }); } });
  });
}
type Kaart = { getZoom: () => number; getCenter: () => { lat: number; lng: number }; latLngToContainerPoint: (ll: [number, number]) => { x: number; y: number } };
const kaart = (page: Page) => ({
  zoom: () => page.evaluate(() => (window as unknown as { __kaart: Kaart }).__kaart.getZoom()),
  midden: () => page.evaluate(() => { const c = (window as unknown as { __kaart: Kaart }).__kaart.getCenter(); return [c.lat, c.lng] as [number, number]; }),
});
// Vaste volgorde: met Math.random vlak onder 1 laat het schudden (Fisher–Yates) alles staan. De speurtocht stelt dan eerst
// de kaartvragen, dan meerkeuze, dan volgorde, elk in de volgorde van de gegevens.
async function vasteVolgorde(page: Page) {
  await page.addInitScript(() => { Math.random = () => 0.999999; });
}
// Alleen in de browser van de test: vragen van een soort weghalen, zodat een andere soort als eerste komt.
async function zonderVragen(page: Page, soorten: ("tap" | "mc")[]) {
  await page.route(/\/bijbelreis\/app\.js/, async (route) => {
    const r = await route.fetch();
    const voor = `BR.boeken.forEach((b) => b.delen.forEach((d) => { if (d.quiz) { ${soorten.map((x) => `d.quiz.${x} = [];`).join(" ")} } }));\n`;
    await route.fulfill({ response: r, body: voor + (await r.text()) });
  });
}
// Wacht tot de pagina niet meer scrolt en de kaart stilstaat. Een kind tikt pas als de kaart in beeld is; tijdens het
// scrollen naar de kaart (telefoon) zouden schermcoördinaten nog verschuiven.
async function wachtTotKaartStil(page: Page) {
  const stand = () => page.evaluate(() => { const k = (window as unknown as { __kaart?: Kaart }).__kaart, r = document.getElementById("map")!.getBoundingClientRect(); return JSON.stringify([Math.round(r.top), Math.round(r.left), k ? k.getZoom() : 0, k ? k.getCenter() : 0]); });
  let vorige = await stand();
  await expect.poll(async () => { await page.waitForTimeout(250); const nu = await stand(); const gelijk = nu === vorige; vorige = nu; return gelijk; }, { timeout: 10_000 }).toBe(true);
}
// Schermpunt van een plaats (lat, lng) op de kaart.
async function schermpunt(page: Page, ll: [number, number]) {
  return page.evaluate((p) => { const r = document.getElementById("map")!.getBoundingClientRect(), q = (window as unknown as { __kaart: Kaart }).__kaart.latLngToContainerPoint(p); return { x: r.left + q.x, y: r.top + q.y }; }, ll);
}
// Tik (touch: echte aanraking via touchstart/touchend, zoals Chrome op een telefoon) of klik (desktop) op een schermpunt.
async function tik(page: Page, hasTouch: boolean, pt: { x: number; y: number }) {
  const vp = page.viewportSize()!;
  expect(pt.x > 0 && pt.y > 0 && pt.x < vp.width && pt.y < vp.height, `punt ${pt.x},${pt.y} ligt in beeld`).toBe(true);
  if (hasTouch) await page.touchscreen.tap(pt.x, pt.y);
  else await page.mouse.click(pt.x, pt.y);
}
async function tikOpPlaats(page: Page, hasTouch: boolean, ll: [number, number]) {
  await wachtTotKaartStil(page);
  await tik(page, hasTouch, await schermpunt(page, ll));
}
// Een punt op de kaart zo ver mogelijk van een doel (voor een bewuste misser), buiten de knoppen.
async function verWeg(page: Page, ll: [number, number]) {
  await wachtTotKaartStil(page);
  const doel = await schermpunt(page, ll), r = (await page.locator("#map").boundingBox())!, vp = page.viewportSize()!;
  const kandidaten = [];
  for (const fx of [0.15, 0.3, 0.5, 0.7, 0.85]) for (const fy of [0.3, 0.5, 0.7]) kandidaten.push({ x: r.x + r.width * fx, y: Math.min(r.y + r.height * fy, vp.height - 30) });
  // Alleen punten waar echt de kaart ligt (niet het reisboek, een knop of een marker).
  const vrij = await page.evaluate((ps) => ps.map((p) => { const e = document.elementFromPoint(p.x, p.y); return !!e && !!e.closest("#map") && !e.closest(".leaflet-control, .leaflet-marker-icon, .maptools, .mapbar, .legend"); }), kandidaten);
  return kandidaten.filter((_, i) => vrij[i]).sort((a, b) => Math.hypot(b.x - doel.x, b.y - doel.y) - Math.hypot(a.x - doel.x, a.y - doel.y))[0];
}
// Aanraakgebaren via het Chrome DevTools-protocol (één of twee vingers), zoals Playwright ze zelf niet aanbiedt.
async function veeg(page: Page, punten: { van: [number, number]; naar: [number, number] }[]) {
  const cdp = await page.context().newCDPSession(page);
  const op = (t: number) => punten.map((p, i) => ({ x: p.van[0] + (p.naar[0] - p.van[0]) * t, y: p.van[1] + (p.naar[1] - p.van[1]) * t, id: i + 1 }));
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: op(0) });
  for (let i = 1; i <= 12; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: op(i / 12) }); await page.waitForTimeout(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

// Markers zijn 0×0 px (de pin steekt eruit); Playwright noemt die altijd ‘hidden’. Daarom de echte CSS-zichtbaarheid.
const zichtbarePlaatsen = (page: Page) => page.evaluate(() => [...document.querySelectorAll("#map .plaats")].filter((e) => getComputedStyle(e).visibility === "visible").length);

test("diepe link naar een stap opent die stap en het kruimelpad", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#jozef/4");
  await expect(page.locator("#sTitle")).toHaveText(/^4\. /);
  await expect(page.locator("#sCrumb")).toContainText("Stap 4 van");
  await expect(page.locator("#leesBtn")).toBeVisible();
  await expect(page.locator("#leesRef")).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test("bestaande stempels uit de vorige versie blijven bewaard en nieuwe worden opgeslagen", async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("gezet")) {
      localStorage.setItem("bijbelreis:gezien", JSON.stringify(["genesis:abraham:0", "exodus:mozes:2"]));
      localStorage.setItem("bijbelreis:best:genesis:alles", "7");
      localStorage.setItem("bijbelreis:verhalen", JSON.stringify({ 3: { g: 1, q: 4 }, 81: { g: 1 } }));
      sessionStorage.setItem("gezet", "1");
    }
  });
  await page.goto("/bijbelreis#abraham");
  await page.locator("#next2").click();
  await page.locator("#next2").click();
  await expect(page.locator("#sCrumb")).toContainText("Stap 2 van");
  await page.reload();
  const seen = await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien") || "[]"));
  expect(seen).toEqual(expect.arrayContaining(["genesis:abraham:0", "genesis:abraham:1", "exodus:mozes:2"]));
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect(page.locator("#pasText")).toContainText("Je hebt 3 van de");
  await expect(page.locator("#bestText")).toContainText("7/10");
  // Stempels van de 150 geschiedenissen (sinds 3.0) staan ernaast en blijven ook bewaard.
  await expect(page.locator("#vGrid .vcel.klaar")).toHaveText(["3"]);
  await expect(page.locator("#vGrid .vcel.gezien")).toHaveText(["81"]);
  const verhalen = await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:verhalen") || "{}"));
  expect(verhalen).toEqual({ 3: { g: 1, q: 4 }, 81: { g: 1 } });
});

test("tabbladen: tijdlijn, wie is wie, hoe ver en boekenkast", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#jakob");
  await page.getByRole("tab", { name: "Tijdlijn" }).click();
  await expect(page.locator("#p-tijd")).toContainText("Genesis 1–11 krijgt geen jaartal");
  await expect(page.locator("#p-tijd .tl-item.cur")).toContainText("Jakob");
  await page.getByRole("tab", { name: "Wie is wie" }).click();
  await expect(page.locator("#wieInfo")).not.toBeEmpty();
  await page.getByRole("tab", { name: "Reis" }).click();
  await page.getByRole("button", { name: "Hoe ver?" }).click();
  await expect(page.locator("#tripKm")).toContainText("km");
  await page.getByRole("tab", { name: "Reis" }).click();
  await page.getByRole("button", { name: "Alle 66 boeken" }).click();
  const kast = page.getByRole("dialog", { name: "De Bijbel: 66 boeken" });
  await expect(kast).toBeVisible();
  await expect(kast.locator(".kb")).toHaveCount(66);
  await kast.getByRole("button", { name: /Exodus/ }).click();
  await expect(kast).toBeHidden();
  await expect(page.locator("#sRef")).toContainText("Exodus");
  expect(errors).toEqual([]);
});

test("de Bijbelreis staat naast de eigen Bijbel: verwijzingen als tekst, geen Bijbeltekst in de app", async ({ page }) => {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  await page.goto("/bijbelreis#ruth/1");
  await expect(page.locator("#leesBtn")).toContainText("Lees in je Bijbel: Ruth 1");
  await page.goto("/bijbelreis#v26");
  await expect(page.locator(".verhaal .leesbijbel")).toContainText("Exodus 14:1–15:21");
  await expect(page.locator("[data-ref]")).toHaveCount(0);
  expect(urls.filter((u) => u.includes("/bijbelreis/bijbel/"))).toEqual([]);
});

// De speurtocht in vaste volgorde, per soort vraag apart: willekeur kan zo geen fouten verbergen.
type Vragen = { tap: { id: string; q: string }[]; mc: { q: string; a: string[]; why: string }[]; ord: { q: string; items: string[] }[] };
const ruthVragen = (page: Page) => page.evaluate(() => (window as unknown as { BR: { boeken: { id: string; delen: { quiz: unknown }[] }[] } }).BR.boeken.find((b) => b.id === "ruth")!.delen[0].quiz as Vragen);
async function startSpeurtocht(page: Page) {
  await page.goto("/bijbelreis#ruth");
  await page.getByRole("tab", { name: "Speurtocht" }).click();
  await page.locator("#qGo").click();
}

test("speurtocht, kaartvraag: tik op de goede plek is raak, ver weg is mis", async ({ page, hasTouch }) => {
  const errors = watchErrors(page);
  await kaartHaak(page); await vasteVolgorde(page);
  await startSpeurtocht(page);
  const v = await ruthVragen(page);
  const plek = (id: string) => page.evaluate((x) => { const B = (window as unknown as { BR: { plaatsen: Record<string, { ll: [number, number] }>; W: Record<string, [number, number]> } }).BR; return B.plaatsen[x] ? B.plaatsen[x].ll : B.W[x]; }, id);
  await expect(page.locator(".qtext")).toHaveText(v.tap[0].q);
  await expect(page.locator(".tapcall")).toBeVisible();
  await tikOpPlaats(page, hasTouch, await plek(v.tap[0].id));
  await expect(page.locator("#qRes .feedback.ok")).toContainText("Raak!");
  await page.locator("#qNext").click();
  await expect(page.locator(".qtext")).toHaveText(v.tap[1].q);
  await tik(page, hasTouch, await verWeg(page, await plek(v.tap[1].id)));
  await expect(page.locator("#qRes .feedback.no")).toContainText("Mis.");
  await expect(page.locator("#qRes .feedback.no")).toContainText("km ernaast");
  await expect(page.locator(".qhead")).toContainText("Vraag 2 van");
  expect(errors).toEqual([]);
});

test("speurtocht, meerkeuzevraag: goed antwoord, fout antwoord en de verwijzing", async ({ page }) => {
  const errors = watchErrors(page);
  await vasteVolgorde(page); await zonderVragen(page, ["tap"]);
  await startSpeurtocht(page);
  const v = await ruthVragen(page);
  expect(v.tap).toEqual([]);
  await expect(page.locator(".tapcall")).toHaveCount(0);
  await expect(page.locator(".qtext")).toHaveText(v.mc[0].q);
  await page.locator(".opt").filter({ hasText: new RegExp(`^${v.mc[0].a[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }).click();
  await expect(page.locator("#qRes .feedback.ok")).toContainText("Goed zo!");
  await expect(page.locator("#qRes .feedback.ok")).toContainText(`Lees maar na in ${v.mc[0].why}`);
  await page.locator("#qNext").click();
  await expect(page.locator(".qtext")).toHaveText(v.mc[1].q);
  await page.locator(".opt").filter({ hasText: new RegExp(`^${v.mc[1].a[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }).click();
  await expect(page.locator("#qRes .feedback.no")).toContainText("Helaas.");
  await expect(page.locator("#qRes .feedback.no")).toContainText(`Het goede antwoord: ${v.mc[1].a[0]}`);
  await expect(page.locator(".qhead")).toContainText("Punten: 1");
  expect(errors).toEqual([]);
});

test("speurtocht, volgordevraag: in de goede volgorde aantikken", async ({ page }) => {
  const errors = watchErrors(page);
  await vasteVolgorde(page); await zonderVragen(page, ["tap", "mc"]);
  await startSpeurtocht(page);
  const v = await ruthVragen(page);
  await expect(page.locator(".qtext")).toHaveText(v.ord[0].q);
  for (const item of v.ord[0].items) await page.locator(".opt").filter({ hasText: item }).first().click();
  await expect(page.locator("#qRes .feedback.ok")).toContainText("Helemaal goed!");
  expect(errors).toEqual([]);
});

test("kaartbediening: zoomknoppen, slepen of vegen, knijpen en een plaats aantikken", async ({ page, hasTouch }) => {
  const errors = watchErrors(page);
  await kaartHaak(page);
  await page.goto("/bijbelreis#abraham/4");
  const k = kaart(page);
  await wachtTotKaartStil(page);
  // Een plaats aantikken opent het venster met de zekerheid van de ligging.
  const bethel = page.locator(".leaflet-marker-icon[title='Bethel']");
  const bb = (await bethel.boundingBox())!;
  await tik(page, hasTouch, { x: bb.x, y: bb.y });
  await expect(page.locator(".leaflet-popup")).toContainText(/Identificeerbaar|Waarschijnlijk|Betwist|Onbekend/);
  await page.locator(".leaflet-popup-close-button").click();
  await wachtTotKaartStil(page);
  // Zoomknoppen (+ en −), getikt of geklikt.
  const z0 = await k.zoom();
  const knop = async (sel: string) => { const b = (await page.locator(sel).boundingBox())!; await tik(page, hasTouch, { x: b.x + b.width / 2, y: b.y + b.height / 2 }); await wachtTotKaartStil(page); };
  await knop(".leaflet-control-zoom-in");
  expect(await k.zoom()).toBe(z0 + 0.5);
  await knop(".leaflet-control-zoom-out");
  expect(await k.zoom()).toBe(z0);
  const r = (await page.locator("#map").boundingBox())!, mx = r.x + r.width / 2, my = r.y + r.height / 2;
  const verschoven = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  if (!hasTouch) {
    // Desktop: slepen met de muis verschuift de kaart, het muiswiel zoomt.
    const c0 = await k.midden();
    await page.mouse.move(mx, my); await page.mouse.down(); await page.mouse.move(mx - 160, my - 90, { steps: 12 }); await page.mouse.up();
    await wachtTotKaartStil(page);
    expect(verschoven(await k.midden(), c0)).toBeGreaterThan(0.1);
    const z1 = await k.zoom();
    await page.mouse.move(mx, my); await page.mouse.wheel(0, -400);
    await wachtTotKaartStil(page);
    expect(await k.zoom()).toBeGreaterThan(z1);
  } else {
    // Telefoon/tablet in het reisboek: één vinger scrolt de pagina (kaart blijft staan, met een hint), twee vingers knijpen.
    const c0 = await k.midden();
    await veeg(page, [{ van: [mx, my], naar: [mx - 120, my - 60] }]);
    await expect(page.locator("#gesture")).toBeVisible();
    await wachtTotKaartStil(page);
    expect(verschoven(await k.midden(), c0)).toBeLessThan(0.01);
    const z1 = await k.zoom();
    await veeg(page, [{ van: [mx - 20, my], naar: [mx - 110, my] }, { van: [mx + 20, my], naar: [mx + 110, my] }]);
    await wachtTotKaartStil(page);
    expect(await k.zoom()).toBeGreaterThan(z1);
    // Op de grote kaart verschuift één vinger de kaart wél.
    await knop("#fullBtn");
    await expect(page.locator("body")).toHaveClass(/mapfull/);
    const g = (await page.locator("#map").boundingBox())!, gx = g.x + g.width / 2, gy = g.y + g.height / 2;
    const c1 = await k.midden();
    await veeg(page, [{ van: [gx, gy], naar: [gx - 120, gy - 60] }]);
    await wachtTotKaartStil(page);
    expect(verschoven(await k.midden(), c1)).toBeGreaterThan(0.01);
    await knop("#fullBtn");
    await expect(page.locator("body")).not.toHaveClass(/mapfull/);
  }
  expect(errors).toEqual([]);
});

test("kaart: Toen/Nu, legenda en een plaats met zekerheid", async ({ page, isMobile }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#abraham/4");
  await page.locator("#nuBtn").click();
  await expect(page.locator(".border").first()).toBeAttached();
  await page.locator("#toenBtn").click();
  await page.locator("#legendBtn").click();
  await expect(page.locator("#legend")).toContainText("Identificeerbaar");
  await expect(page.locator("#legend")).toContainText("Onbekend");
  await page.locator("#legendBtn").click();
  if (isMobile) {
    await page.locator("#fullBtn").click();
    await expect(page.locator("body")).toHaveClass(/mapfull/);
    await page.locator("#fullBtn").click();
    await expect(page.locator("body")).not.toHaveClass(/mapfull/);
  }
  // Via het toetsenbord (focus + Enter): werkt ook als de kaart nog beweegt na het wisselen van grote kaart.
  const bethel = page.locator(".leaflet-marker-icon[title='Bethel']");
  await bethel.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".leaflet-popup")).toContainText(/Identificeerbaar|Waarschijnlijk|Betwist|Onbekend/);
  expect(errors).toEqual([]);
});

test("verhalen: overzicht, zoeken, een geschiedenis openen en de vragen maken", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis");
  await expect(page.getByRole("tab", { name: "Verhalen" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#p-verhalen")).toContainText("150");
  await page.locator("#vZoek").fill("Jona");
  await expect(page.locator("#vLijst .vitem").first()).toBeVisible();
  const first = page.locator("#vLijst button.vitem").first();
  if (await first.count()) {
    await first.click();
    await expect(page.locator("#p-verhalen .verhaal")).toBeVisible();
    await page.locator("#vqStart").click();
    for (let i = 0; i < 5; i++) {
      await page.locator("#vQuiz .opt").first().click();
      await page.locator("#vqVolgende").click();
      if (await page.locator("#vQuiz").getByText(/Klaar:/).count()) break;
    }
    await expect(page.locator("#vQuiz")).toContainText("Klaar:");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:verhalen") || "{}"));
    expect(Object.keys(stored).length).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

// Elke soort ontdekking één keer echt doorlopen (goed oplossen) op elk apparaat.
type Ontdek = { soort: string; items?: unknown[][]; paren?: string[][]; rijen?: unknown[][]; beelden?: string[][] };
async function ontdekVan(page: Page, nr: number): Promise<Ontdek> {
  return page.evaluate((n) => (window as unknown as { BR: { geschiedenissen: { nr: number; ontdek: Ontdek }[] } }).BR.geschiedenissen.find((g) => g.nr === n)!.ontdek, nr);
}
const VOORBEELD: Record<string, number> = { koppel: 1, onthul: 2, wiezei: 3, stamboom: 4, volgorde: 6, kaart: 7, verbanden: 8, symbolen: 73, gelijkenis: 92 };
for (const [soort, nr] of Object.entries(VOORBEELD)) {
  test(`ontdekken: ${soort} (geschiedenis ${nr}) werkt`, async ({ page, hasTouch }) => {
    const errors = watchErrors(page);
    await kaartHaak(page);
    await page.goto(`/bijbelreis#v${nr}`);
    const box = page.locator("#vOntdek .ontdek");
    await expect(box).toBeVisible();
    const o = await ontdekVan(page, nr);
    expect(o.soort).toBe(soort);
    if (soort === "koppel") {
      for (const [i, [, r]] of o.paren!.entries()) {
        await box.locator(`.l[data-i="${i}"]`).click();
        await box.locator(".r").filter({ hasText: new RegExp(`^${r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }).click();
      }
      await expect(box).toContainText("Alles goed gekoppeld!");
    } else if (soort === "volgorde") {
      for (const v of o.items as unknown as string[]) await box.locator(".opt").filter({ hasText: v }).first().click();
      await expect(box).toContainText("Helemaal goed!");
    } else if (soort === "wiezei") {
      const items = o.items as [string, string, string[]][];
      for (const [i, [, goed]] of items.entries()) await box.locator(`.wiezei[data-i="${i}"] button`).filter({ hasText: goed }).first().click();
      await expect(box.locator(".feedback.ok")).toHaveCount(items.length);
    } else if (["onthul", "symbolen", "gelijkenis"].includes(soort)) {
      const kaart = box.locator(".day").first();
      await kaart.click();
      await expect(kaart).toHaveAttribute("aria-expanded", "true");
      await expect(kaart.locator("span")).not.toHaveText(/^\?$|Wat betekent|Wat zegt/);
    } else if (soort === "verbanden") {
      await box.locator(".verbanden .btn").first().click();
      await expect(box.locator(".vb2").first()).toBeVisible();
    } else if (soort === "stamboom") {
      const p = box.locator("[data-mens]").first();
      await expect(p).toBeVisible();
      const naam = (await p.textContent())!.trim();
      await p.click();
      await expect(page.locator("#wieInfo h3")).toHaveText(naam);
    } else if (soort === "kaart") {
      await box.locator(".btn").click();
      await expect(page.locator("#map")).toHaveClass(/quizmode/);
      const ll = await page.evaluate((id) => (window as unknown as { BR: { plaatsen: Record<string, { ll: [number, number] }> } }).BR.plaatsen[id].ll, (o as { id: string }).id);
      await tikOpPlaats(page, hasTouch, ll);
      await expect(box.locator(".feedback.ok")).toContainText("Raak!");
    }
    expect(errors).toEqual([]);
  });
}

test("naamgenoten worden niet samengevoegd: Jozef (Genesis / Lukas) en Johannes (apostel / Patmos)", async ({ page }) => {
  const errors = watchErrors(page);
  const kort = (id: string) => page.evaluate((i) => (window as unknown as { BR: { mensen: Record<string, { kort?: string }> } }).BR.mensen[i].kort || "", id);
  for (const [nr, naam, id] of [[19, "Jozef", "jozef"], [81, "Jozef", "jozef_nt"], [98, "Johannes", "johannes"], [149, "Johannes", "johannes_patmos"]] as const) {
    await page.goto(`/bijbelreis#v${nr}`);
    await page.locator("#vOntdek").waitFor();
    const chip = page.locator(".verhaal .chips [data-mens]").filter({ hasText: new RegExp(`^${naam[0]}${naam}`) });
    await expect(chip).toHaveAttribute("data-mens", id);
    await chip.click();
    await expect(page.locator("#wieInfo")).toContainText((await kort(id)).slice(0, 40));
  }
  expect(errors).toEqual([]);
});

test("personenkaart: afgeleide band en overlevering staan apart van wat de Bijbel letterlijk zegt", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#v89");
  await page.locator(".verhaal .chips [data-mens='andreas']").click();
  await page.locator("#wieInfo details.grond summary").click();
  await expect(page.locator("#wieInfo details.grond")).toContainText("Vader: Jonas");
  await expect(page.locator("#wieInfo details.grond")).toContainText("Afgeleid");
  await expect(page.locator("#wieInfo .overlevering")).toHaveCount(0);
  await page.goto("/bijbelreis#v149");
  await page.locator(".verhaal .chips [data-mens='johannes_patmos']").click();
  await expect(page.locator("#wieInfo .overlevering")).toContainText("Niet uit de Bijbel");
  await expect(page.locator("#wieInfo dl.fam")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("alle kaart-ontdekkingen: een tik op de juiste plek is raak (plaatsen verborgen tijdens de vraag)", async ({ page, hasTouch }) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await kaartHaak(page);
  await page.goto("/bijbelreis#verhalen");
  const lijst = await page.evaluate(() => (window as unknown as { BR: { geschiedenissen: { nr: number; ontdek: { soort: string; id?: string } }[]; plaatsen: Record<string, { ll: [number, number] }> } }).BR.geschiedenissen.filter((g) => g.ontdek.soort === "kaart").map((g) => ({ nr: g.nr, ll: (window as unknown as { BR: { plaatsen: Record<string, { ll: [number, number] }> } }).BR.plaatsen[g.ontdek.id!].ll })));
  expect(lijst.length).toBe(15);
  for (const { nr, ll } of lijst) {
    await page.goto(`/bijbelreis#v${nr}`);
    const box = page.locator("#vOntdek .ontdek");
    await box.locator(".btn").click();
    await expect(page.locator("#map")).toHaveClass(/quizmode/);
    await expect.poll(() => zichtbarePlaatsen(page), { message: `plaatsen verborgen bij geschiedenis ${nr}` }).toBe(0);
    await tikOpPlaats(page, hasTouch, ll);
    await expect(box.locator(".feedback.ok"), `geschiedenis ${nr}`).toContainText("Raak!");
    await expect(page.locator("#map")).not.toHaveClass(/quizmode/);
  }
  expect(errors).toEqual([]);
});

test("een open kaartvraag vervalt als je naar een andere geschiedenis gaat", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/bijbelreis#v7");
  expect(await zichtbarePlaatsen(page)).toBeGreaterThan(0);
  await page.locator("#vOntdek .ontdek .btn").click();
  await expect(page.locator("#map")).toHaveClass(/quizmode/);
  expect(await zichtbarePlaatsen(page)).toBe(0);
  await page.locator(".navrow [data-v='8']").click();
  await expect(page.locator("#vTitel")).toBeVisible();
  await expect(page.locator(".verhaal .top b")).toContainText("Geschiedenis 8");
  await expect(page.locator("#map")).not.toHaveClass(/quizmode/);
  await expect.poll(() => zichtbarePlaatsen(page)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

// ---------- 3.1: lay-out, voortgang en kaartbediening ----------
test("3.1: de zes onderdelen zijn altijd bereikbaar, groot genoeg en zonder horizontale overloop", async ({ page, isMobile }) => {
  await page.goto("/bijbelreis#ruth");
  const vp = page.viewportSize()!;
  for (const naam of ["Verhalen", "Reis", "Wie is wie", "Tijdlijn", "Speurtocht", "Paspoort"]) {
    const b = (await page.getByRole("tab", { name: naam }).boundingBox())!;
    expect(b.width, naam).toBeGreaterThanOrEqual(44);
    expect(b.height, naam).toBeGreaterThanOrEqual(44);
    expect(b.x >= 0 && b.x + b.width <= vp.width + 1, `${naam} in beeld`).toBe(true);
    if (isMobile) expect(b.y + b.height, `${naam} onderaan`).toBeGreaterThan(vp.height - 80);
  }
  // Na scrollen blijft de onderbalk staan.
  await page.mouse.wheel(0, 1500);
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect(page.locator("#p-pas")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("3.1: compacte voortgang met de naam, de stap en ‘Ga verder’", async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem("gezet")) { localStorage.setItem("bijbelreis:laatst", JSON.stringify("ezra:terugkeer:4")); sessionStorage.setItem("gezet", "1"); } });
  await page.goto("/bijbelreis");
  const v = page.locator("#welkom .verder");
  await expect(v).toContainText("Verder waar je was");
  await expect(v).toContainText("Terugkeer en tempel");
  await expect(v).toContainText("stap 5 van 7");
  // Reisetiket met etappelijn: nog steeds compact.
  expect((await v.boundingBox())!.height).toBeLessThan(230);
  await v.getByRole("button", { name: "Ga verder" }).click();
  await expect(page.locator("#sCrumb")).toContainText("Stap 5 van 7");
  const opgeslagen = await page.evaluate(() => localStorage.getItem("bijbelreis:laatst"));
  expect(JSON.parse(opgeslagen!)).toBe("ezra:terugkeer:4");
});

test("3.1: ‘Hele reis’ gaat terug naar de volledige route, in de reis en bij een geschiedenis", async ({ page }) => {
  await page.goto("/bijbelreis#abraham/4");
  await expect(page.locator("#heleBtn")).toBeVisible();
  await page.locator("#heleBtn").click();
  await expect(page.locator("#sCrumb")).not.toContainText("Stap");
  await expect(page.locator("#heleBtn")).toBeHidden();
  await page.goto("/bijbelreis#v8");
  await expect(page.locator("#heleBtn")).toBeVisible();
  await page.locator("#vTerug").click();
  await expect(page.locator("#heleBtn")).toBeHidden();
  await page.getByRole("tab", { name: "Tijdlijn" }).click();
  await expect(page.locator("#heleBtn")).toBeHidden();
});

test("3.1: legenda met ‘Waar ligt dit?’ opent, past in beeld en sluit weer", async ({ page }) => {
  await page.goto("/bijbelreis#abraham/4");
  await page.locator("#legendBtn").click();
  const lg = page.locator("#legend");
  await expect(lg).toBeVisible();
  const b = (await lg.boundingBox())!, vp = page.viewportSize()!;
  expect(b.y >= 0 && b.y + b.height <= vp.height + 1 && b.x >= 0 && b.x + b.width <= vp.width + 1).toBe(true);
  await page.locator("#insetBtn").click();
  await expect(page.locator("#inset")).toBeVisible();
  await page.locator("#legendSluit").click();
  await expect(lg).toBeHidden();
  await expect(page.locator("#legendBtn")).toHaveAttribute("aria-expanded", "false");
});

test("3.1: kaartgegevens komen met versienummer (geen oude versie uit de cache)", async ({ page }) => {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  await page.goto("/bijbelreis#ruth/1");
  await expect(page.locator("#sTitle")).toBeVisible();
  await expect.poll(() => urls.filter((u) => /geo\.json|relief\.json/.test(u)).length).toBeGreaterThanOrEqual(2);
  for (const naam of ["geo.json", "relief.json"]) {
    const u = urls.find((x) => x.includes("/bijbelreis/" + naam));
    expect(u, naam).toBeTruthy();
    expect(u, naam).toMatch(/\?v=[0-9a-f]{10}/);
  }
});

test("3.1: het site-thema (Blauwdruk) maakt de atlas niet blauw", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mdb:uiterlijk", JSON.stringify("blauwdruk")));
  await page.goto("/bijbelreis");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(245, 240, 229)");
  expect(await page.evaluate(() => getComputedStyle(document.getElementById("map")!).backgroundColor)).toBe("rgb(195, 214, 216)");
});

test("3.1: Rachab is volgens Mattheüs 1:5 de moeder van Boaz; of zij Rachab uit Jericho is, staat er apart bij", async ({ page }) => {
  await page.goto("/bijbelreis#v47");
  await page.locator(".verhaal .chips [data-mens='boaz']").click();
  await page.locator("#wieInfo details.grond summary").click();
  const g = page.locator("#wieInfo details.grond li").filter({ hasText: "Moeder: Rachab" });
  await expect(g).toContainText("Staat zo in de Bijbel");
  await expect(g).toContainText("Mattheüs 1:5");
  await expect(g).toContainText("Jericho");
});

test("3.1: een ander onderdeel kiezen begint bovenaan (ook als je ver naar beneden was)", async ({ page, isMobile }) => {
  test.skip(!isMobile, "alleen op de telefoon: daar is de pagina zelf de scrollcontainer");
  await page.goto("/bijbelreis#ruth");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("#pasStats")).toBeInViewport();
});

// Namen die nu echt op de kaart staan (niet uit, niet weggevallen bij een botsing).
const kaartNamen = (page: Page) => page.evaluate(() => [...document.querySelectorAll("#map .plaats .lab")].filter((e) => !e.classList.contains("off") && !e.classList.contains("clash") && getComputedStyle(e.closest(".plaats")!).visibility === "visible").map((e) => e.firstChild!.textContent!.trim()));

test("3.1: de startkaart toont de geschiedenis van nu; de hele Bijbelwereld is apart bereikbaar", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(() => { if (!sessionStorage.getItem("gezet")) { localStorage.setItem("bijbelreis:verhalen", JSON.stringify({ 26: { g: 1 }, 76: { g: 1 } })); localStorage.setItem("bijbelreis:huidig", JSON.stringify({ v: 76 })); sessionStorage.setItem("gezet", "1"); } });
  await page.goto("/bijbelreis");
  const etiket = page.locator("#welkom .reiskaart");
  await expect(etiket).toContainText("Je reis nu");
  await expect(etiket).toContainText("76");
  await expect(etiket).toContainText("Etappe 9 van 16");
  await expect(etiket).toContainText("Babel → Jeruzalem");
  await expect.poll(() => kaartNamen(page)).toEqual(expect.arrayContaining(["Babel", "Jeruzalem"]));
  // Hele Bijbelwereld: ankerplaatsen van Ur tot Efeze; daarna terug naar je eigen reis.
  await page.locator("#wereldBtn").click();
  await expect(page.locator("#wereldBtn")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => kaartNamen(page)).toEqual(expect.arrayContaining(["Jeruzalem", "Haran", "Efeze"]));
  await page.locator("#wereldBtn").click();
  await expect(page.locator("#wereldBtn")).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => kaartNamen(page)).toEqual(expect.arrayContaining(["Babel", "Jeruzalem"]));
  await etiket.getByRole("button", { name: "Ga verder" }).click();
  await expect(page.locator("#vTitel")).toContainText("Terug naar Jeruzalem");
  // Een nieuwe geschiedenis openen wordt de nieuwe ‘nu’.
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:huidig")!))).toEqual({ v: 76 });
  expect(errors).toEqual([]);
});

test("3.1: een nieuwe reiziger begint bij geschiedenis 1, met de hele Bijbelwereld op de kaart", async ({ page }) => {
  await zetNiveau(page, "b");
  await page.goto("/bijbelreis");
  const etiket = page.locator("#welkom .reiskaart");
  await expect(etiket).toContainText("Je reis begint hier");
  await expect(etiket).toContainText("Etappe 1 van 16");
  await expect(page.locator("#wereldBtn")).toHaveAttribute("aria-pressed", "true");
  await etiket.getByRole("button", { name: "Begin" }).click();
  await expect(page.locator("#vTitel")).toContainText("God schept hemel en aarde");
});

test("3.1: een lange geschiedenis leest in onderdelen met tussenkoppen; alle tekst blijft staan", async ({ page }) => {
  await page.goto("/bijbelreis#v26");
  await expect(page.locator(".verhaal .vkop")).toHaveText(["Klem tussen zee en leger", "Een weg door de zee", "Het lied van Mozes en Mirjam"]);
  const { tekst, uitleg } = await page.evaluate(() => ({
    tekst: [...document.querySelectorAll(".verhaal .vdeel p")].map((p) => p.textContent).join(" "),
    uitleg: (window as unknown as { BR: { geschiedenissen: { nr: number; uitleg: string }[] } }).BR.geschiedenissen.find((g) => g.nr === 26)!.uitleg,
  }));
  expect(tekst.replace(/\s+/g, " ").trim()).toBe(uitleg.replace(/\s+/g, " ").trim());
  // Ontdekmoment: alleen die stap op de kaart, ‘Hele reis’ brengt de hele geschiedenis terug.
  const moment = page.locator("[data-stapkaart]").nth(1);
  await moment.click();
  await expect(moment).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#vTitel")).toBeVisible();
  await expect.poll(() => kaartNamen(page)).toContain("Schelfzee");
  await page.locator("#heleBtn").click();
  await expect(moment).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => kaartNamen(page)).toEqual(expect.arrayContaining(["Pi-Hachiroth", "Schelfzee"]));
});

test("3.1: een jaartal staat nooit als vaststaand feit: Bijbelse tijdrekening, historische reconstructie en onzeker", async ({ page }) => {
  await page.goto("/bijbelreis#v26");
  const w = page.locator(".verhaal details.wanneer");
  await expect(w.locator("summary")).toContainText("ca. 1446 v.Chr.");
  await expect(w.locator(".dt")).toHaveText(["Bijbelse tijdrekening", "onzeker"]);
  await w.locator("summary").click();
  await expect(w).toContainText("1 Koningen 6:1");
  await expect(w).toContainText("13e eeuw");
  await page.goto("/bijbelreis#v71");
  await expect(page.locator(".verhaal details.wanneer .dt")).toHaveText(["Historische reconstructie"]);
  await page.goto("/bijbelreis#v126");
  await expect(page.locator(".verhaal details.wanneer .dt")).toHaveText(["Historische reconstructie", "onzeker"]);
  await page.goto("/bijbelreis#v1");
  await expect(page.locator(".verhaal details.wanneer .dt")).toHaveText(["geen jaartal"]);
  // Ook in de reis en op de tijdlijn.
  await page.goto("/bijbelreis#uittocht");
  await expect(page.locator("#sTijd .dt")).toHaveText(["Bijbelse tijdrekening", "onzeker"]);
  await expect(page.locator(".boek[data-boek='exodus'] small")).toContainText("berekend, onzeker");
  await page.getByRole("tab", { name: "Tijdlijn" }).click();
  await expect(page.locator("#p-tijd .tl-item.cur .tl-when .dt")).toHaveText(["Bijbelse tijdrekening", "onzeker"]);
});

test("3.1: kaartbediening op een kleine telefoon (320 px): knoppen groot genoeg, met naam, niet over elkaar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "alleen op de telefoon");
  await page.setViewportSize({ width: 320, height: 568 });
  for (const url of ["/bijbelreis", "/bijbelreis#v26", "/bijbelreis#abraham/4"]) {
    await page.goto(url);
    await page.waitForTimeout(600);
    const knoppen = page.locator(".maptools button:visible, .mapacties button:visible, .leaflet-control-zoom a");
    const n = await knoppen.count();
    const vakken = [];
    for (let i = 0; i < n; i++) {
      const k = knoppen.nth(i), b = (await k.boundingBox())!;
      const naam = (await k.getAttribute("aria-label")) || (await k.getAttribute("title")) || (await k.innerText()).trim();
      expect(naam, `${url}: knop ${i} heeft een naam`).toBeTruthy();
      expect(b.height, `${url}: ${naam} hoogte`).toBeGreaterThanOrEqual(38);
      expect(b.width, `${url}: ${naam} breedte`).toBeGreaterThanOrEqual(38);
      expect(b.x >= 0 && b.x + b.width <= 321, `${url}: ${naam} in beeld`).toBe(true);
      vakken.push({ naam, ...b });
    }
    for (const a of vakken) for (const b of vakken) if (a !== b && a.naam !== b.naam) {
      const over = a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;
      expect(over, `${url}: ${a.naam} overlapt ${b.naam}`).toBe(false);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

// ---------- reisniveaus (proef) ----------
const opslag = (page: Page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:")).map((k) => [k, localStorage.getItem(k)])));

test("niveaus: bij het eerste bezoek een rustige keuze; daarna onthouden en niet opnieuw gevraagd", async ({ page }) => {
  const errors = watchErrors(page);
  await zetNiveau(page, null);
  await page.goto("/bijbelreis");
  const kaart = page.locator("#welkom .keuzekaart");
  await expect(kaart).toContainText("Hoe wil je op reis?");
  await expect(kaart.locator(".nivopt")).toHaveCount(3);
  await kaart.getByRole("button", { name: /Samen ontdekken/ }).click();
  await expect(page.locator("#welkom .keuzekaart")).toHaveCount(0);
  await expect(page.locator("#niveauNaam")).toHaveText("Samen ontdekken");
  expect(JSON.parse((await opslag(page))["bijbelreis:niveau"]!)).toBe("a");
  // Alleen de keuze; geen naam, leeftijd of andere gegevens.
  expect(Object.keys(await opslag(page)).sort()).toEqual(["bijbelreis:niveau"]);
  await page.reload();
  await expect(page.locator("#welkom .keuzekaart")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("niveaus: wie al onderweg was, krijgt geen keuzescherm en houdt de volledige inhoud", async ({ page }) => {
  await zetNiveau(page, null);
  await page.addInitScript(() => { if (!sessionStorage.getItem("gezet")) { localStorage.setItem("bijbelreis:gezien", JSON.stringify(["exodus:uittocht:4"])); localStorage.setItem("bijbelreis:laatst", JSON.stringify("exodus:uittocht:4")); sessionStorage.setItem("gezet", "1"); } });
  await page.goto("/bijbelreis");
  await expect(page.locator("#welkom .keuzekaart")).toHaveCount(0);
  await expect(page.locator("#niveauNaam")).toHaveText("Verder ontdekken");
  await expect(page.locator("#welkom .rk-tip")).toContainText("reisniveaus");
  await page.goto("/bijbelreis#v26");
  await expect(page.locator(".verhaal details.wanneer .dt")).toHaveText(["Bijbelse tijdrekening", "onzeker"]);
});

test("niveaus: wisselen via de knop bovenin wist en verdubbelt geen voortgang", async ({ page }) => {
  await zetNiveau(page, "b");
  await page.addInitScript(() => { if (!sessionStorage.getItem("gezet")) { localStorage.setItem("bijbelreis:gezien", JSON.stringify(["exodus:uittocht:4", "genesis:abraham:0"])); localStorage.setItem("bijbelreis:verhalen", JSON.stringify({ 26: { g: 1, q: 3 }, 8: { g: 1 } })); localStorage.setItem("bijbelreis:best:ruth:alles", "8"); sessionStorage.setItem("gezet", "1"); } });
  await page.goto("/bijbelreis#v26");
  const voor = await opslag(page);
  for (const [n, naam] of [["a", "Samen ontdekken"], ["c", "Verder ontdekken"], ["b", "Zelf op reis"]] as const) {
    await page.locator("#niveauBtn").click();
    await expect(page.locator("#niveauKeuze")).toBeVisible();
    await page.locator(`#niveauKeuze [data-niveau="${n}"]`).click();
    await expect(page.locator("#niveauKeuze")).toBeHidden();
    await expect(page.locator("#niveauNaam")).toHaveText(naam);
  }
  const na = await opslag(page);
  for (const k of ["bijbelreis:gezien", "bijbelreis:verhalen", "bijbelreis:best:ruth:alles"]) expect(na[k], k).toBe(voor[k]);
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect(page.locator("#pasStats")).toContainText("van 150 geschiedenissen gestempeld");
  // Escape sluit het keuzevenster en de focus gaat terug naar de knop.
  await page.locator("#niveauBtn").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#niveauKeuze")).toBeHidden();
  await expect(page.locator("#niveauBtn")).toBeFocused();
});

test("niveaus: Samen ontdekken vertelt in korte stappen, toont alleen de belangrijkste plaatsen en vraagt met twee antwoorden", async ({ page }) => {
  await kaartHaak(page);
  await zetNiveau(page, "a");
  await page.goto("/bijbelreis#v26");
  const art = page.locator(".verhaal.samen");
  // Gecontroleerde teksten hebben geen proefmarkering meer.
  await expect(art.locator(".conceptlabel")).toHaveCount(0);
  await expect(art.locator(".a-tekst")).toContainText("Nu staan ze bij de zee.");
  await expect(art.locator(".a-stippen i")).toHaveCount(7);
  // Geen jaartallen, geen kernwoord, geen kruisverwijzingen in de standaardweergave.
  await expect(art).not.toContainText("1446");
  await expect(art.locator(".xrefs, .kernwoord, .wanneer")).toHaveCount(0);
  await expect.poll(() => kaartNamen(page)).toEqual(["Pi-Hachiroth"]);
  for (let i = 0; i < 3; i++) await page.locator("#aVerder").click();
  await expect(art.locator(".a-tekst")).toContainText("droge weg");
  await expect.poll(async () => (await kaartNamen(page)).sort()).toEqual(["Pi-Hachiroth", "Schelfzee"]);
  for (let i = 0; i < 4; i++) await page.locator("#aVerder").click();
  // De vragen: steeds twee antwoorden.
  for (let i = 0; i < 3; i++) {
    await expect(page.locator("#vQuiz .opt")).toHaveCount(2);
    await page.locator("#vQuiz .opt").first().click();
    await page.locator("#vqVolgende").click();
  }
  await expect(page.locator("#vQuiz")).toContainText("Klaar:");
  const v = JSON.parse((await opslag(page))["bijbelreis:verhalen"]!);
  expect(v["26"].q).not.toBeNull();
  expect(v["26"].lv.a).toBeGreaterThanOrEqual(0);
});

test("niveaus: kan een niveau niet laden, dan geen moeilijke tekst alsof die past, maar een eerlijke melding en een uitweg", async ({ page }) => {
  await page.route("**/bijbelreis/niveaus/a.js*", (r) => r.abort());
  await zetNiveau(page, "a");
  await page.goto("/bijbelreis#v76");
  const art = page.locator(".verhaal.samen");
  await expect(art).toContainText("konden niet worden geladen");
  await expect(art).not.toContainText("Kores");
  await art.getByRole("button", { name: "Lees de vertelling voor 7–10 jaar" }).click();
  await expect(page.locator("#niveauNaam")).toHaveText("Zelf op reis");
  await expect(page.locator(".verhaal h2")).toHaveText("Terug naar Jeruzalem: de tempel herbouwd");
  await expect(page.locator(".verhaal #vVertelling")).not.toBeEmpty();
});

test("niveaus: Zelf op reis en Verder ontdekken verschillen echt in tekst, tijd, verdieping en vragen", async ({ page }) => {
  await zetNiveau(page, "b");
  await page.goto("/bijbelreis#v26");
  let art = page.locator(".verhaal");
  await expect(art.locator(".conceptlabel")).toHaveCount(0);
  await expect(art).toContainText("Dat betekent: wees niet bang");
  await expect(art.locator("details.wanneer summary")).toContainText("Mozes en de uittocht");
  await expect(art.locator("details.wanneer summary")).not.toContainText("1446");
  await expect(art.locator("details.meer")).not.toHaveAttribute("open", "");
  await page.locator("#vqStart").click();
  await expect(page.locator("#vQuiz .opt")).toHaveCount(3);
  await expect(page.locator("#vQuiz .label")).toContainText("van 4");

  await page.locator("#niveauBtn").click();
  await page.locator('#niveauKeuze [data-niveau="c"]').click();
  art = page.locator(".verhaal");
  await expect(art).not.toContainText("Dat betekent: wees niet bang");
  await expect(art.locator("details.wanneer summary")).toContainText("ca. 1446 v.Chr.");
  const verdieping = art.locator("details.blok", { hasText: "Verdieping" });
  await verdieping.locator("summary").click();
  await expect(verdieping).toContainText("Bittermeren");
  await expect(verdieping).toContainText("1 Koningen 9:26");
  await page.locator("#vqStart").click();
  await expect(page.locator("#vQuiz .label")).toContainText("van 7");
});

test("niveaus: Samen speuren stelt vragen met twee antwoorden; tijdlijn zonder jaartallen; wie is wie met de personen van het verhaal", async ({ page }) => {
  await zetNiveau(page, "a");
  await page.goto("/bijbelreis#v26");
  await page.getByRole("tab", { name: "Speurtocht" }).click();
  await expect(page.locator("#p-quiz")).toContainText("Samen speuren");
  await page.locator("#qGo").click();
  await expect(page.locator("#p-quiz .opt")).toHaveCount(2);
  await page.getByRole("tab", { name: "Tijdlijn" }).click();
  await expect(page.locator("#p-tijd .samentijd li")).toHaveCount(16);
  await expect(page.locator("#p-tijd")).not.toContainText("v.Chr.");
  await page.getByRole("tab", { name: "Wie is wie" }).click();
  await expect(page.locator("#p-wie .wiekaart")).toHaveCount(2);
  await expect(page.locator("#p-wie")).toContainText("Mirjam");
});

// ---------- 4.0 ----------
// Opslag zoals 3.1 die achterliet: stempels, scores, gelezen geschiedenissen, waar je was; nog geen reisniveau.
const OPSLAG_31: Record<string, string> = {
  "bijbelreis:gezien": JSON.stringify(["exodus:uittocht:0", "exodus:uittocht:1", "exodus:uittocht:2", "exodus:uittocht:3", "exodus:uittocht:4", "exodus:uittocht:5", "genesis:begin:0", "genesis:abraham:0"]),
  "bijbelreis:best:exodus:uittocht": "7",
  "bijbelreis:best:genesis:alles": "9",
  "bijbelreis:verhalen": JSON.stringify({ 1: { g: 1, q: 3 }, 26: { g: 1, q: 2 }, 83: { g: 1 } }),
  "bijbelreis:laatst": JSON.stringify("exodus:uittocht:5"),
  "bijbelreis:huidig": JSON.stringify({ k: "exodus:uittocht:5" }),
  "bijbelreis:legenda": "true",
};
const zetOpslag = (page: Page, st: Record<string, string>) => page.addInitScript((st) => { if (sessionStorage.getItem("opslagGezet")) return; sessionStorage.setItem("opslagGezet", "1"); localStorage.clear(); for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v); }, st);

test("4.0: opslag van 3.1 blijft heel; nieuwe scores per niveau komen ernaast en niets telt dubbel", async ({ page }) => {
  const errors = watchErrors(page);
  await zetOpslag(page, OPSLAG_31);
  await page.goto("/bijbelreis");
  await expect(page.locator("#niveauNaam")).toHaveText("Verder ontdekken");
  const na = await opslag(page);
  for (const [k, v] of Object.entries(OPSLAG_31)) if (k !== "bijbelreis:huidig") expect(na[k], k).toBe(v);
  expect(JSON.parse(na["bijbelreis:niveau"]!)).toBe("c");
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect(page.locator("#pasStats")).toContainText("8");
  await expect(page.locator("#pasStats")).toContainText("2van 150 geschiedenissen gestempeld");
  await expect(page.locator("#bestText")).toContainText("7/10");
  await expect(page.locator("#bestText")).toContainText("9/10");

  // Samen speuren over hetzelfde deel: een eigen score, de score van Verder ontdekken blijft staan.
  await page.locator("#niveauBtn").click();
  await page.locator('#niveauKeuze [data-niveau="a"]').click();
  await page.getByRole("tab", { name: "Speurtocht" }).click();
  await expect(page.locator("#p-quiz")).toContainText("Samen speuren");
  await page.locator('#p-quiz [data-q="uittocht"]').click();
  await page.locator("#qGo").click();
  for (let i = 0; i < 6; i++) {
    const opts = page.locator("#p-quiz .opt");
    if (!(await opts.count())) break;
    await expect(opts).toHaveCount(2);
    await opts.first().click();
    await page.locator("#qNext").click();
  }
  await expect(page.locator("#p-quiz")).toContainText("Klaar!");
  const daarna = await opslag(page);
  expect(daarna["bijbelreis:best:exodus:uittocht"]).toBe("7");
  expect(daarna["bijbelreis:samen:exodus:uittocht"]).toBeDefined();
  expect(daarna["bijbelreis:verhalen"]).toBe(OPSLAG_31["bijbelreis:verhalen"]);
  expect(daarna["bijbelreis:gezien"]).toBe(OPSLAG_31["bijbelreis:gezien"]);

  // Terug naar Verder ontdekken: het deel telt één keer als gedaan speurtocht, met beide scores erbij.
  await page.locator("#niveauBtn").click();
  await page.locator('#niveauKeuze [data-niveau="c"]').click();
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect(page.locator("#pasStats")).toContainText("2speurtochten gedaan");
  await expect(page.locator("#bestText")).toContainText("(Samen ontdekken)");
  expect(errors).toEqual([]);
});

test("4.0: vragen bij een geschiedenis op een ander niveau: één stempel, de beste score blijft, de score per niveau komt erbij", async ({ page }) => {
  await zetOpslag(page, { ...OPSLAG_31, "bijbelreis:niveau": JSON.stringify("a") });
  await page.goto("/bijbelreis#v26");
  const art = page.locator(".verhaal.samen");
  for (let i = 0; i < 12 && (await page.locator("#aVerder").count()); i++) await page.locator("#aVerder").click();
  for (let i = 0; i < 6 && (await page.locator("#vqVolgende, #vQuiz .opt").count()); i++) {
    if (!(await page.locator("#vQuiz .opt").count())) break;
    await page.locator("#vQuiz .opt").last().click();
    await page.locator("#vqVolgende").click();
  }
  await expect(art.locator("#vQuiz")).toContainText("Klaar:");
  const v = JSON.parse((await opslag(page))["bijbelreis:verhalen"]!);
  expect(v["26"].q).toBeGreaterThanOrEqual(2);
  expect(v["26"].lv.a).toBeGreaterThanOrEqual(0);
  expect(Object.keys(v).sort()).toEqual(["1", "26", "83"]);
  expect(v["83"].q).toBeUndefined();
});

test("4.0: Samen ontdekken in de reis: één zin per stap, de weg naar het verhaal, geen jaartallen en geen extra's", async ({ page }) => {
  await zetNiveau(page, "a");
  await page.goto("/bijbelreis#uittocht/6");
  const kaartje = page.locator(".stapkaart");
  await expect(kaartje.locator("#sTitle")).toContainText("Door de Schelfzee");
  await expect(kaartje.locator("#sTijd")).toBeHidden();
  await expect(kaartje.locator("#sFact")).toBeHidden();
  await expect(page.locator("#chapters")).toBeHidden();
  const tekst = (await kaartje.locator("#sText").innerText()).split("\n")[0];
  expect((tekst.match(/[.!?](\s|$)/g) || []).length).toBeLessThanOrEqual(1);
  await kaartje.getByRole("button", { name: /Lees samen: Droog door de Schelfzee/ }).click();
  await expect(page.locator(".verhaal.samen h2")).toHaveText("Droog door de Schelfzee");
});
