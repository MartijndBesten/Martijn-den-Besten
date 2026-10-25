import { expect, test, type Page } from "@playwright/test";

// De Bijbelreis is een statische pagina (public/bijbelreis.html) met eigen JavaScript; deze tests lopen de
// belangrijkste routes door: diepe links, voortgang bewaren, tabbladen, Bijbeltekst, speurtocht en de kaart.

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

test("Bijbeltekst opent als venster, Escape sluit en de focus keert terug", async ({ page }) => {
  await page.goto("/bijbelreis#ruth/1");
  await page.locator("#leesBtn").click();
  const lade = page.getByRole("dialog");
  await expect(lade).toBeVisible();
  await expect(page.locator("#verzen")).toContainText("Ruth");
  await page.keyboard.press("Escape");
  await expect(lade).toBeHidden();
  await expect(page.locator("#leesBtn")).toBeFocused();
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
