import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// UX-ronde 17-11-2026 (docs/bijbelreis-audit/telefoon.md §4.10): de gebruikersreizen ‘eerste bezoek → verhaal’,
// ‘geschiedenis → kaart → verder’ en ‘delen’ doorgelopen op telefoon, tablet en desktop. Wat daarbij aantoonbaar mis was
// en is opgelost, staat hier vast:
// 1. op de telefoon geen kaart waar hij niets toevoegt (Paspoort, Tijdlijn, speurtocht zonder kaartvraag);
// 2. de kaart zoomt zelf nooit zo ver in dat de stad of streek eromheen wegvalt (Golgotha stond op zoom 13);
// 3. geen ‘Verder met …’ boven een geopende geschiedenis;
// 4. de zoektoets van het telefoontoetsenbord sluit het toetsenbord;
// 5. hoofdbediening in Verhalen en een geschiedenis is minstens 44 px hoog;
// 6. ‘Kies een reis’ toont een verdiepend deel als eigen regel ‘Van dichtbij’, en waar je bent als je erin zit;
// 7. in het overzicht van een deel staan geen namen meer over elkaar (groot scherm);
// 8. een onbekende # opent de start; na herladen blijf je in hetzelfde onderdeel.
// En: ‘Begin de reis’ legt het begin van de route (Ur) niet meer onder de knop ‘Van dichtbij’; de zichtbare tekst van
// ‘3 van 25’ en van de stappen in ‘Kies een reis’ staat in de naam voor de schermlezer (WCAG 2.5.3); een plaats op de kaart
// die niet te zien is, krijgt geen toetsenbordfocus (WCAG 2.4.11).

test.use({ reducedMotion: "reduce" });

const open = async (page: Page, hash = "") => { await page.goto("about:blank"); await page.goto("/bijbelreis" + (hash ? "#" + hash : "")); await expect(page.locator("#map .land").first()).toBeAttached(); };
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
// Alleen voor de test: de Leaflet-kaart als window.__kaart, zodat de test zoom en schermpunten kan aflezen.
type Kaart = { getZoom: () => number; latLngToContainerPoint: (ll: [number, number]) => { x: number; y: number } };
async function kaartHaak(page: Page) {
  await page.addInitScript(() => {
    let echt: unknown;
    Object.defineProperty(window, "L", { configurable: true, get: () => echt, set: (v: { Map: { addInitHook: (f: () => void) => void } }) => { echt = v; v.Map.addInitHook(function (this: unknown) { (window as unknown as { __kaart: unknown }).__kaart = this; }); } });
  });
}
const zoom = (page: Page) => page.evaluate(() => (window as unknown as { __kaart: Kaart }).__kaart.getZoom());
const tab = (page: Page, naam: string) => page.locator(".tabs").getByRole("tab", { name: naam });
const kaartHoog = (page: Page) => page.evaluate(() => document.querySelector(".mapwrap")!.getBoundingClientRect().height);

test.describe("telefoon", () => {
  test.use({ viewport: { width: 390, height: 664 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== "mobiel", "telefoontests één keer, in het project mobiel"); });

  test("1. geen kaart in Paspoort, Tijdlijn en de speurtocht zonder kaartvraag; wel bij een kaartvraag en in Wie is wie", async ({ page }) => {
    const errors = watchErrors(page);
    await kaartHaak(page);
    await open(page, "ruth/2");
    for (const t of ["Paspoort", "Tijdlijn"]) {
      await tab(page, t).click();
      expect(await kaartHoog(page), t).toBe(0);
      // De inhoud staat direct onder de kop.
      const boven = await page.locator("#reisboek [role=tabpanel]:not([hidden])").evaluate((e) => e.getBoundingClientRect().top);
      expect(boven, t).toBeLessThan(80);
    }
    await tab(page, "Wie is wie").click();
    expect(await kaartHoog(page)).toBeGreaterThan(150);
    // Speurtocht: eerst geen kaart; een kaartvraag zet hem terug, met een bruikbare uitsnede, en een tik geeft antwoord.
    await tab(page, "Speurtocht").click();
    expect(await kaartHoog(page)).toBe(0);
    await page.locator("#qGo").click();
    for (let i = 0; i < 10 && !(await page.locator(".tapcall").count()); i++) {
      if (await page.locator(".opt").count()) {
        expect(await kaartHoog(page), "meerkeuze- of volgordevraag: geen kaart").toBe(0);
        for (const o of await page.locator(".opt").all()) { if (await page.locator("#qNext").count()) break; await o.click(); }
        await page.locator("#qNext").click();
      }
    }
    await expect(page.locator(".tapcall")).toBeVisible();
    expect(await kaartHoog(page)).toBeGreaterThan(200);
    const z = await zoom(page);
    expect(z).toBeGreaterThanOrEqual(5);
    expect(z).toBeLessThanOrEqual(9);
    // De kaart staat helemaal onder de kop, met de zoomknoppen in beeld.
    await page.waitForTimeout(300);
    const kop = await page.locator(".kop").evaluate((e) => e.getBoundingClientRect().bottom);
    expect(await page.locator(".leaflet-control-zoom").evaluate((e) => e.getBoundingClientRect().top)).toBeGreaterThanOrEqual(kop - 1);
    const kaart = (await page.locator("#map").boundingBox())!;
    await page.touchscreen.tap(kaart.x + kaart.width / 2, kaart.y + kaart.height / 2 + 20);
    await expect(page.locator("#qRes .feedback")).toBeVisible();
    // Terug naar de reis: de kaart is weer het scherm.
    await tab(page, "Reis").click();
    await expect(page.locator("#next")).toBeInViewport({ ratio: 1 });
    expect(await kaartHoog(page)).toBeGreaterThan(500);
    expect(errors).toEqual([]);
  });

  test("2. Golgotha en de Jabbok: hooguit zoom 11,5, met Jeruzalem erbij en Mahanaïm en Pniël los", async ({ page }) => {
    await kaartHaak(page);
    await open(page, "nt-lijden/7");
    await expect(page.locator("#sTitle")).toHaveText("7. Gekruisigd op Golgotha");
    expect(await zoom(page)).toBe(11.5);
    // De stad eromheen staat erbij (bij zoom 13 alleen vage ondergrond).
    const jeruzalem = page.locator("#map .plaats .lab:not(.off):not(.clash)", { hasText: /^Jeruzalem/ });
    await expect(jeruzalem).toBeVisible();
    await open(page, "jakob-jabbok/6");
    expect(await zoom(page)).toBe(11.5);
    for (const n of ["Mahanaïm", "Pniël"]) await expect(page.locator("#map .plaats .lab.on", { hasText: n })).toBeVisible();
    // Zelf inzoomen kan nog wel.
    await expect(page.locator(".leaflet-control-zoom-in")).not.toHaveClass(/disabled/);
  });

  test("3. geen ‘Verder met’ boven een geopende geschiedenis; terug in de lijst staat hij er weer", async ({ page }) => {
    const errors = watchErrors(page);
    await open(page, "abraham/2");
    await open(page);
    await expect(page.locator("#welkom .verdermet")).toHaveText(/^Verder met: Abraham/);
    await page.locator('#vLijst [data-v="5"]').click();
    await expect(page.locator("#vTitel")).toHaveText("Noach bouwt de ark");
    await expect(page.locator("#welkom")).toBeHidden();
    await expect(page.locator(".verdermet")).toHaveCount(0);
    await page.locator("#vTerug").click();
    await expect(page.locator("#welkom .verdermet")).toHaveText(/^Verder met: Noach bouwt de ark/);
    expect(errors).toEqual([]);
  });

  test("4. zoeken: zoektoets op het toetsenbord, en Enter sluit het toetsenbord", async ({ page }) => {
    await open(page, "verhalen");
    for (const id of ["vZoek", "plZoek", "vdZoek"]) {
      await expect(page.locator("#" + id)).toHaveAttribute("type", "search");
      await expect(page.locator("#" + id)).toHaveAttribute("enterkeyhint", "search");
    }
    await page.locator("#vZoek").fill("Jozef");
    await page.locator("#vZoek").press("Enter");
    expect(await page.evaluate(() => document.activeElement && document.activeElement.id)).not.toBe("vZoek");
    await expect(page.locator("#vLijst [role=status]")).toHaveText(/gevonden/);
  });

  test("5. hoofdbediening in Verhalen en een geschiedenis is minstens 44 px hoog; het reisniveau heeft een tikvlak van 44 px", async ({ page }) => {
    await open(page, "verhalen");
    for (const b of await page.locator("#p-verhalen .pick button").all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await open(page, "v26");
    await expect(page.locator("#vTitel")).toHaveText("Droog door de Schelfzee");
    const knoppen = page.locator("#vTerug, #p-verhalen .verhaal details > summary, #p-verhalen .golist .linkbtn, #p-verhalen .kaartmoment");
    expect(await knoppen.count()).toBeGreaterThan(3);
    for (const k of await knoppen.all()) {
      if (!(await k.isVisible())) continue;
      expect((await k.boundingBox())!.height, (await k.textContent())!.slice(0, 30)).toBeGreaterThanOrEqual(44);
    }
    // Het reisniveau in de kop: 32 px te zien, maar een tik net boven of onder de knop telt mee (de kop is 44 px).
    const r = (await page.locator("#niveauBtn").boundingBox())!;
    const raak = await page.evaluate(([x, y1, y2]) => [y1, y2].map((y) => !!document.elementFromPoint(x, y)!.closest("#niveauBtn")), [r.x + r.width / 2, r.y - 5, r.y + r.height + 5]);
    expect(raak).toEqual([true, true]);
  });

  test("6. ‘Kies een reis’: het verdiepende deel staat als eigen regel ‘Van dichtbij’ na de stappen over hetzelfde gedeelte", async ({ page }) => {
    const errors = watchErrors(page);
    await open(page, "jakob/3");
    await page.locator("#kiesBtn").click();
    const lijst = page.locator("#kiesStappenLijst");
    await expect(page.locator("#kiesStappenLabel")).toHaveText("Stappen van Jakob");
    const dichtbij = lijst.locator(".ks-verdiep");
    await expect(dichtbij).toHaveCount(1);
    await expect(dichtbij).toContainText("Van dichtbij");
    await expect(dichtbij).toContainText("Jakob bij de Jabbok · 12 stappen");
    // Direct na stap 8 (‘Broers weer samen’, Genesis 33), vóór stap 9; en anders van vorm dan een stap.
    const volgorde = await lijst.locator("li").evaluateAll((li) => li.map((x) => x.textContent!.trim().slice(0, 22)));
    const i = volgorde.findIndex((t) => t.startsWith("Van dichtbij"));
    expect(volgorde[i - 1]).toMatch(/^8Broers weer samen/);
    expect(volgorde[i + 1]).toMatch(/^9Terug in Bethel/);
    expect(await dichtbij.evaluate((e) => getComputedStyle(e).borderTopStyle)).toBe("dashed");
    expect((await dichtbij.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await dichtbij.click();
    await expect(page.getByRole("dialog", { name: "Kies een reis" })).toBeHidden();
    await expect(page).toHaveURL(/#jakob-jabbok$/);
    await expect(page.locator("#sTitle")).toHaveText("Jakob bij de Jabbok");
    // In het verdiepende deel: de naam zegt dat het ‘van dichtbij’ is, met de weg terug naar de hoofdreis.
    await page.locator("#kiesBtn").click();
    await expect(page.locator("#kiesStappenLabel")).toHaveText("Van dichtbij: Jakob bij de Jabbok");
    await expect(page.locator('#delen .deel[aria-pressed="true"]')).toContainText("Jakob");
    await lijst.locator(".ks-terug").click();
    await expect(page).toHaveURL(/#jakob$/);
    expect(errors).toEqual([]);
  });

  test("8. een onbekende # opent de start; na herladen blijf je in hetzelfde onderdeel", async ({ page }) => {
    const errors = watchErrors(page);
    for (const h of ["onzin", "v999"]) {
      await open(page, h);
      await expect(tab(page, "Verhalen")).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#welkom .st-knop")).toBeVisible();
      await expect(page).toHaveURL(/\/bijbelreis$/);
    }
    await open(page, "abraham/2");
    for (const t of ["Wie is wie", "Tijdlijn", "Verhalen"]) {
      await tab(page, t).click();
      await page.reload();
      await expect(tab(page, t)).toHaveAttribute("aria-selected", "true");
      await expect(page).toHaveURL(/#abraham\/2$/);
    }
    // Een gedeelde link opent zoals altijd zijn eigen plek.
    await open(page, "abraham/3");
    await expect(tab(page, "Reis")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#sTitle")).toHaveText("3. Het eerste altaar");
    expect(errors).toEqual([]);
  });
});

// ‘Begin de reis’ vanaf de start: stap 1 (Weg uit Ur) heeft de knop ‘Van dichtbij’ op de kaart. De uitsnede werd gekozen
// vóórdat die knop er stond, waardoor Ur onder de knop lag (375×553, 360×640, 390×664).
for (const [w, h] of [[390, 664], [375, 553], [360, 640], [430, 739]] as const) {
  test.describe(`begin de reis ${w}×${h}`, () => {
    test.use({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    test.beforeEach(({}, ti) => { test.skip(ti.project.name !== "mobiel", "telefoontests één keer, in het project mobiel"); });
    test("de route van stap 1 ligt niet onder de knop ‘Van dichtbij’", async ({ page }) => {
      await kaartHaak(page);
      await open(page);
      await page.locator("#welkom .st-knop").click();
      await expect(page.locator("#sTitle")).toHaveText("1. Weg uit Ur");
      await expect(page.locator("#dichtbijBtn")).toBeVisible();
      const onder = await page.evaluate(() => {
        type Stap = { r?: { pts: [number, number][] }[]; at: string[] };
        const BR = (window as unknown as { BR: { plaatsen: Record<string, { ll: [number, number] }>; boeken: { delen: { id: string; steps: Stap[] }[] }[] } }).BR;
        const k = (window as unknown as { __kaart: Kaart }).__kaart;
        const s = BR.boeken.flatMap((b) => b.delen).find((d) => d.id === "abraham")!.steps[0];
        const pts = (s.r || []).flatMap((r) => r.pts).concat(s.at.map((a) => BR.plaatsen[a].ll));
        const knop = document.getElementById("dichtbijBtn")!.getBoundingClientRect(), kaart = document.getElementById("map")!.getBoundingClientRect(), blad = document.getElementById("reisboek")!.getBoundingClientRect();
        return pts.map((ll) => k.latLngToContainerPoint(ll)).map((p) => ({ x: p.x + kaart.left, y: p.y + kaart.top }))
          .filter((p) => (p.x >= knop.left - 6 && p.x <= knop.right + 6 && p.y >= knop.top - 6) || p.y > blad.top).length;
      });
      expect(onder).toBe(0);
    });
  });
}

test.describe("groot scherm", () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== "desktop", "alleen op de desktop"); });

  test("2. de kaart zoomt zelf hooguit tot 12 (Golgotha stond op 13)", async ({ page }) => {
    await kaartHaak(page);
    for (const h of ["nt-lijden/7", "nt-lijdensweek/1", "jakob-jabbok/7"]) {
      await open(page, h);
      await expect(page.locator("#sTitle")).toHaveText(/^\d+\. /);
      expect(await zoom(page), h).toBeLessThanOrEqual(12);
      expect(await zoom(page), h).toBeGreaterThanOrEqual(11);
    }
  });

  test("4. Enter in een zoekveld laat op de computer de focus staan", async ({ page }) => {
    await open(page, "verhalen");
    await page.locator("#vZoek").fill("Jozef");
    await page.locator("#vZoek").press("Enter");
    await expect(page.locator("#vZoek")).toBeFocused();
  });

  test("7. overzicht van een deel: geen namen over elkaar (Davids rijk, Saul en David, Jeremia naar Egypte)", async ({ page }) => {
    await kaartHaak(page);
    for (const h of ["davids-rijk", "saul-david", "jeremia-egypte", "nt-lijdensweek"]) {
      await open(page, h);
      await page.waitForTimeout(200);
      const paren = await page.evaluate(() => {
        const kaart = document.getElementById("map")!.getBoundingClientRect();
        const labs = [...document.querySelectorAll<HTMLElement>("#map .pl .lab")].filter((e) => !e.classList.contains("off") && !e.classList.contains("clash") && getComputedStyle(e).display !== "none")
          .map((e) => ({ t: e.firstChild!.textContent, r: e.getBoundingClientRect() })).filter((x) => x.r.width && x.r.right > kaart.left && x.r.left < kaart.right && x.r.bottom > kaart.top && x.r.top < kaart.bottom);
        const uit: string[] = [];
        labs.forEach((a, i) => labs.slice(i + 1).forEach((b) => { const ov = Math.max(0, Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)) * Math.max(0, Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top)); if (ov > 20) uit.push(`${a.t} × ${b.t}`); }));
        return uit;
      });
      expect(paren, h).toEqual([]);
      // Begin en eind van het deel houden hun naam.
      await expect(page.locator("#map .plaats .lab.on:not(.clash)").first()).toBeVisible();
    }
  });
});

// Een plaats op de kaart met toetsenbordfocus ligt in beeld: binnen de kaart en niet onder een knop of het stapblad.
const focusPlaatsen = (page: Page) => page.evaluate(() => {
  const kaart = document.getElementById("map")!.getBoundingClientRect();
  const bedek = [...document.querySelectorAll("#reisboek, #mapbar, #dichtbijBtn, .maptools > *, .mapacties > *, .leaflet-control-zoom")].filter((e) => e.getClientRects().length && getComputedStyle(e).position !== "static").map((e) => e.getBoundingClientRect());
  const f = [...document.querySelectorAll<HTMLElement>(".leaflet-marker-icon")].filter((e) => e.tabIndex >= 0);
  const weg = f.filter((e) => { const q = e.getBoundingClientRect(); return q.left < kaart.left || q.left > kaart.right || q.top < kaart.top || q.top > kaart.bottom || bedek.some((c) => q.left >= c.left && q.left <= c.right && q.top >= c.top && q.top <= c.bottom); }).map((e) => e.title);
  return { n: f.length, weg };
});

test("toegankelijk: zichtbare tekst in de naam (2.5.3) en geen focus op plaatsen buiten beeld (2.4.11)", async ({ page, isMobile }) => {
  await open(page, "abraham/2");
  for (const h of ["abraham/2", "nt-paulusrome/5"]) {
    await open(page, h);
    await page.waitForTimeout(300);
    const r = await focusPlaatsen(page);
    expect(r.weg, h).toEqual([]);
    expect(r.n, h).toBeGreaterThan(0);
  }
  if (!isMobile) return;
  await open(page, "abraham/2");
  const naam = async () => (await new AxeBuilder({ page }).withRules(["label-content-name-mismatch"]).analyze()).violations.flatMap((v) => v.nodes.map((n) => n.target.join(" ")));
  expect(await naam()).toEqual([]);
  await page.locator("#kiesBtn").click();
  await expect(page.locator("#kiesStappenLijst .ks-stap").first()).toBeVisible();
  expect(await naam()).toEqual([]);
  await expect(page.getByRole("button", { name: "Stap 2: God zegt: ga!" })).toBeVisible();
});
