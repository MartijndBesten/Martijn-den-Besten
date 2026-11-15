import { expect, test, type Page } from "@playwright/test";

// De reiziger op de kaart van de Bijbelreis (een kameel; in het Nieuwe Testament een wandelaar). Deze tests meten per
// beeldje waar hij staat en controleren de regels uit docs/BIJBELREIS.md (‘De reiziger op de kaart’): hij volgt de lijn
// van de route, de duur past bij de lengte op het scherm, de kaart staat stil terwijl hij loopt, hij springt niet
// zichtbaar door de kaart, er loopt nooit meer dan één reis en hij eindigt precies op de bestemming.

type Beeld = { t: number; x: number; y: number; w: number; h: number; lat: number; lng: number; z: number; clat: number; clng: number; walk: boolean; flip: boolean; gone: boolean; nt: boolean; op: number; hash: string; p: [number, number] };
type Opname = { rec: Beeld[]; routes: [number, number][][]; eind: [number, number] | null; onaf: number; stap: string };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("bijbelreis:niveau") === null) localStorage.setItem("bijbelreis:niveau", JSON.stringify("c"));
    localStorage.setItem("bijbelreis:welkomWeg", "true");
    // Alleen voor de test: de kaart en de marker van de reiziger opvangen bij het laden van Leaflet en elk beeldje
    // vastleggen waar de reiziger staat. De app zelf verandert niet.
    type W = { __kaart?: any; __kameel?: any; __rec: unknown[] };
    const w = window as unknown as W;
    let echt: any;
    Object.defineProperty(window, "L", { configurable: true, get: () => echt, set: (v) => {
      echt = v;
      v.Map.addInitHook(function (this: unknown) { w.__kaart = this; });
      v.Marker.addInitHook(function (this: any) { const h = this.options.icon && this.options.icon.options && this.options.icon.options.html; if (typeof h === "string" && h.includes('class="camel"')) w.__kameel = this; });
    } });
    w.__rec = [];
    const tik = (now: number) => {
      const m = w.__kaart, k = w.__kameel, c = document.querySelector(".camel");
      if (m && k && c && m._loaded) {
        const box = m.getContainer().getBoundingClientRect(), r = c.closest(".leaflet-marker-icon")!.getBoundingClientRect();
        const ll = k.getLatLng(), mid = m.getCenter();
        w.__rec.push({ t: now, x: r.left - box.left, y: r.top - box.top, w: box.width, h: box.height, lat: ll.lat, lng: ll.lng, z: m.getZoom(), clat: mid.lat, clng: mid.lng,
          walk: c.classList.contains("walk"), flip: c.classList.contains("flip"), gone: c.classList.contains("gone") || !m.hasLayer(k), nt: c.classList.contains("nt"), op: +getComputedStyle(c).opacity, hash: location.hash });
      }
      requestAnimationFrame(tik);
    };
    requestAnimationFrame(tik);
  });
});

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
async function open(page: Page, hash: string) {
  await page.goto("/bijbelreis#" + hash);
  await page.waitForFunction(() => ((window as unknown as { __rec?: unknown[] }).__rec || []).length > 5);
}
// De opname leegmaken, op het laatste beeldje na: zo is ook te zien wat er op het moment van de klik zelf gebeurt.
const wis = (page: Page) => page.evaluate(() => { const r = (window as unknown as { __rec: unknown[] }).__rec; r.splice(0, r.length - 1); });
// Wacht tot de reiziger en de kaart een tijd (ms) stilstaan en de reiziger niet meer loopt of vervaagt.
async function rust(page: Page, stil = 600) {
  await page.waitForFunction((stil) => {
    const r = (window as unknown as { __rec: any[] }).__rec; if (r.length < 10) return false;
    const l = r[r.length - 1]; if (l.walk) return false;
    for (let i = r.length - 1; i >= 0; i--) {
      const s = r[i];
      if (l.t - s.t > stil) return true;
      if (s.walk || s.x !== l.x || s.y !== l.y || s.z !== l.z || s.clat !== l.clat || s.clng !== l.clng || s.op !== l.op) return false;
    }
    return false;
  }, stil, { timeout: 20_000, polling: 100 });
}
// De opname, omgerekend naar pixels bij de eindstand van de kaart, met de routes van de stap die nu open is.
async function opname(page: Page): Promise<Opname> {
  return page.evaluate(() => {
    const w = window as unknown as { __kaart: any; __rec: any[]; BR: any };
    const m = w.__kaart, Z = m.getZoom(), org = m.getPixelOrigin(), pane = m._getMapPanePos();
    const px = (ll: [number, number]) => { const p = m.project(ll, Z); return [p.x - org.x + pane.x, p.y - org.y + pane.y] as [number, number]; };
    const [hid, hst] = decodeURIComponent(location.hash.slice(1)).split("/");
    let deel: any = null; w.BR.boeken.forEach((b: any) => b.delen.forEach((d: any) => { if (d.id === hid) deel = d; }));
    const s = deel && hst ? deel.steps[+hst - 1] : null;
    const routes = s && s.r ? s.r.map((r: any) => r.pts.map(px)) : [];
    const eind = !s ? null : routes.length ? routes[routes.length - 1].slice(-1)[0] : s.at.length ? px(w.BR.plaatsen[s.at[0]].ll) : null;
    // Elke lijn van het deel moet na afloop helemaal getekend zijn (geen halve lijn van een afgebroken reis).
    let onaf = 0;
    if (deel) deel.steps.forEach((t: any) => (t.r || []).forEach((r: any) => { const g = r.line.getLatLngs(), a = g[g.length - 1], b = r.pts[r.pts.length - 1]; if (g.length !== r.pts.length || Math.abs(a.lat - b[0]) > 1e-9 || Math.abs(a.lng - b[1]) > 1e-9) onaf++; }));
    return { rec: w.__rec.map((q) => ({ ...q, p: px([q.lat, q.lng]) })), routes, eind, onaf, stap: location.hash };
  });
}
const afstand = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function totSegment(p: [number, number], a: [number, number], b: [number, number]) {
  const vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vy);
}
const totRoutes = (p: [number, number], routes: [number, number][][]) => Math.min(...routes.flatMap((r) => r.slice(1).map((q, i) => totSegment(p, r[i], q))));
const lengte = (r: [number, number][]) => r.slice(1).reduce((a, q, i) => a + afstand(r[i], q), 0);

// Kerncijfers van één opname.
function cijfers(o: Opname) {
  const rec = o.rec, laatste = rec[rec.length - 1], loop = rec.filter((q) => q.walk);
  const c = { px: o.routes.reduce((a, r) => a + lengte(r), 0), duur: 0, vanLijn: 0, kaartBewoog: 0, buitenBeeld: 0, sprong: 0, piek: 0, achteruit: 0, gekeken: 0,
    eindFout: o.eind ? afstand(laatste.p, o.eind) : 0, staatStil: !laatste.walk && !laatste.gone && laatste.op === 1 };
  // Zichtbare sprong: een verplaatsing in één beeldje terwijl de reiziger te zien is.
  for (let i = 1; i < rec.length; i++) if (Math.min(rec[i - 1].op, rec[i].op) > 0.2 && !rec[i].gone && !rec[i - 1].gone) c.sprong = Math.max(c.sprong, afstand(rec[i].p, rec[i - 1].p));
  if (loop.length < 2) return c;
  c.duur = loop[loop.length - 1].t - loop[0].t;
  for (const q of loop) {
    if (o.routes.length) c.vanLijn = Math.max(c.vanLijn, totRoutes(q.p, o.routes));
    if (q.z !== laatste.z || Math.abs(q.clat - laatste.clat) > 1e-7 || Math.abs(q.clng - laatste.clng) > 1e-7) c.kaartBewoog++;
    if (q.x < 0 || q.y < 0 || q.x > q.w || q.y > q.h) c.buitenBeeld++;
  }
  // Snelheid over vensters van ca. 150 ms (een gemist beeldje telt zo niet als versnelling) en de kijkrichting: wie
  // duidelijk naar links loopt, kijkt naar links.
  for (let i = 0, j = 0; i < loop.length; i++) {
    while (loop[i].t - loop[j].t > 150) j++;
    const dt = loop[i].t - loop[j].t; if (dt < 100) continue;
    let d = 0; for (let k = j + 1; k <= i; k++) d += afstand(loop[k].p, loop[k - 1].p);
    c.piek = Math.max(c.piek, (d / dt) * 1000);
    const dx = loop[i].p[0] - loop[j].p[0];
    if (Math.abs(dx) > 12 && Math.abs(dx) > 0.6 * d && !loop[i].nt) { c.gekeken++; if (dx < 0 !== loop[i].flip) c.achteruit++; }
  }
  return c;
}
// Een stap openen via het bolletje (werkt op elk schermformaat, ook als het bolletje buiten beeld staat).
const bolletje = (page: Page, n: number) => page.evaluate((n) => (document.querySelector(`#chapters .dot[data-step="${n - 1}"]`) as HTMLElement).click(), n);

const GRENS = { vanLijn: 2.5, eind: 0.6, sprong: 60, minDuur: 900, maxDuur: 8000, maxSnelheid: 330 };

for (const [hash, wat] of [
  ["abraham/1", "een lange route met tussenpunten (Ur naar Haran)"],
  ["abraham/5", "een middellange route (Kanaän naar Egypte)"],
  ["abraham/4", "een kort stukje (Sichem naar Bethel)"],
  ["debora/3", "twee routes die op elkaar aansluiten"],
  ["nt-paulusrome/6", "een zeereis in het Nieuwe Testament (de wandelaar)"],
] as const) {
  test(`de reiziger volgt de lijn en eindigt op de bestemming: ${wat}`, async ({ page }) => {
    const errors = watchErrors(page);
    await open(page, hash);
    await rust(page);
    const o = await opname(page), c = cijfers(o);
    expect(o.routes.length, "de stap heeft een route").toBeGreaterThan(0);
    expect(c.duur, "hij heeft gelopen").toBeGreaterThan(0);
    expect(c.vanLijn, "grootste afstand tot de lijn (px)").toBeLessThanOrEqual(GRENS.vanLijn);
    expect(c.kaartBewoog, "beeldjes waarin de kaart nog bewoog terwijl hij liep").toBe(0);
    expect(c.buitenBeeld, "beeldjes buiten de kaart").toBe(0);
    expect(c.sprong, "grootste zichtbare sprong (px)").toBeLessThanOrEqual(GRENS.sprong);
    expect(c.achteruit, `beeldjes waarin hij achteruit liep (van ${c.gekeken})`).toBeLessThanOrEqual(Math.ceil(c.gekeken * 0.05));
    expect(c.eindFout, "afstand tot de bestemming aan het eind (px)").toBeLessThanOrEqual(GRENS.eind);
    expect(c.staatStil, "hij staat stil en is zichtbaar").toBe(true);
    expect(o.onaf, "lijnen die niet af zijn").toBe(0);
    // Duur binnen de grenzen, en een gelijkmatige snelheid: de piek ligt dicht bij het gemiddelde.
    expect(c.duur).toBeGreaterThanOrEqual(GRENS.minDuur);
    expect(c.duur).toBeLessThanOrEqual(GRENS.maxDuur);
    const gemiddeld = (c.px / c.duur) * 1000;
    expect(gemiddeld, "gemiddelde snelheid (px/s)").toBeLessThanOrEqual(GRENS.maxSnelheid);
    if (o.routes.length === 1 && c.px > 150) expect(c.piek / gemiddeld, "piek gedeeld door gemiddelde snelheid").toBeLessThanOrEqual(1.7);
    expect(errors).toEqual([]);
  });
}

test("de duur van de reis schaalt met de lengte van de lijn op het scherm", async ({ page }) => {
  const metingen: { hash: string; px: number; duur: number }[] = [];
  for (const hash of ["abraham/4", "abraham/9", "abraham/7", "abraham/12", "abraham/1"]) {
    await open(page, hash);
    await rust(page);
    const c = cijfers(await opname(page));
    metingen.push({ hash, px: Math.round(c.px), duur: Math.round(c.duur) });
    await page.goto("about:blank");
  }
  metingen.sort((a, b) => a.px - b.px);
  const tekst = JSON.stringify(metingen);
  for (const m of metingen) {
    expect(m.duur, tekst).toBeGreaterThanOrEqual(GRENS.minDuur);
    expect(m.duur, tekst).toBeLessThanOrEqual(GRENS.maxDuur);
    expect((m.px / m.duur) * 1000, tekst).toBeLessThanOrEqual(GRENS.maxSnelheid);
  }
  // Langer op het scherm duurt nooit korter (met wat speling voor de beeldjes), en de langste duurt echt langer dan de kortste.
  for (let i = 1; i < metingen.length; i++) expect(metingen[i].duur, tekst).toBeGreaterThanOrEqual(metingen[i - 1].duur - 120);
  const kort = metingen[0], lang = metingen[metingen.length - 1];
  if (lang.px > kort.px + 150) expect(lang.duur, tekst).toBeGreaterThan(kort.duur + 300);
});

test("sluit een stap niet aan, dan verdwijnt de reiziger en verschijnt hij op het nieuwe begin", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "abraham/2");
  await rust(page);
  // Van stap 2 naar stap 12 en terug naar stap 1: beide beginnen ver van waar de reiziger op dat moment staat.
  for (const n of [12, 1]) {
    await wis(page);
    await bolletje(page, n);
    await expect(page.locator("#sTitle")).toHaveText(new RegExp(`^${n}\\. `));
    await page.waitForTimeout(400);
    await rust(page);
    const o = await opname(page), c = cijfers(o);
    expect(c.sprong, `stap ${n}: grootste zichtbare sprong (px)`).toBeLessThanOrEqual(GRENS.sprong);
    expect(c.vanLijn, `stap ${n}: afstand tot de lijn (px)`).toBeLessThanOrEqual(GRENS.vanLijn);
    expect(c.kaartBewoog, `stap ${n}: kaart bewoog tijdens het lopen`).toBe(0);
    expect(c.eindFout, `stap ${n}: afstand tot de bestemming (px)`).toBeLessThanOrEqual(GRENS.eind);
    expect(c.staatStil).toBe(true);
    // Hij is tussendoor echt weg geweest.
    expect(o.rec.some((q) => q.op < 0.05), `stap ${n}: even onzichtbaar`).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("een tweede route die ergens anders begint: de reiziger verdwijnt en verschijnt daar, zonder sprong", async ({ page }) => {
  // Exodus 14: het volk loopt naar Pi-Hachiroth; daarna komt het leger van de farao uit Ramses.
  await open(page, "uittocht/5");
  await rust(page);
  const o = await opname(page), c = cijfers(o);
  expect(o.routes.length).toBe(2);
  expect(afstand(o.routes[0][o.routes[0].length - 1], o.routes[1][0]), "de tweede route begint ergens anders").toBeGreaterThan(30);
  expect(c.sprong, "grootste zichtbare sprong (px)").toBeLessThanOrEqual(GRENS.sprong);
  expect(c.vanLijn).toBeLessThanOrEqual(GRENS.vanLijn);
  expect(c.eindFout).toBeLessThanOrEqual(GRENS.eind);
  expect(c.staatStil).toBe(true);
  expect(o.onaf).toBe(0);
});

test("snel achter elkaar op Verder: één reis tegelijk, geen halve lijnen, geen fouten", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "abraham");
  await rust(page);
  await wis(page);
  for (let i = 0; i < 5; i++) { await page.locator("#next").click(); await page.waitForTimeout(i % 2 ? 450 : 180); }
  await expect(page.locator("#sTitle")).toHaveText(/^5\. /);
  await page.waitForTimeout(400);
  await rust(page);
  const o = await opname(page), c = cijfers(o);
  expect(o.stap).toBe("#abraham/5");
  // Alles wat hij gelopen heeft, ligt op de route van de laatste stap: de eerdere reizen zijn niet meer begonnen.
  expect(c.vanLijn, "afstand tot de lijn van de laatste stap (px)").toBeLessThanOrEqual(GRENS.vanLijn);
  expect(c.sprong, "grootste zichtbare sprong (px)").toBeLessThanOrEqual(GRENS.sprong);
  expect(c.kaartBewoog, "kaart bewoog tijdens het lopen").toBe(0);
  expect(c.eindFout).toBeLessThanOrEqual(GRENS.eind);
  expect(c.staatStil).toBe(true);
  expect(o.onaf, "lijnen die niet af zijn").toBe(0);
  // Eén aaneengesloten loop, niet een die stopt en opnieuw begint.
  let lopen = 0; o.rec.forEach((q, i) => { if (q.walk && !(i && o.rec[i - 1].walk)) lopen++; });
  expect(lopen, "aantal keren dat hij begon te lopen").toBe(1);
  expect(errors).toEqual([]);
});

test("terug naar het overzicht of ‘Laat dit hele deel zien’ breekt de reis netjes af", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "abraham");
  await rust(page);
  const begin = (await opname(page)).rec.slice(-1)[0];
  // Start en meteen terug: de reis die nog op de kaart wachtte, begint niet meer.
  await wis(page);
  await page.locator("#next").click();
  await page.waitForTimeout(250);
  await page.locator("#prev").click();
  await page.waitForTimeout(2500);
  await rust(page);
  let o = await opname(page);
  expect(o.stap).toBe("#abraham");
  expect(o.rec.filter((q) => q.walk).length, "beeldjes waarin hij nog liep").toBe(0);
  expect(o.onaf).toBe(0);
  const nu = o.rec[o.rec.length - 1];
  expect(Math.abs(nu.lat - begin.lat) + Math.abs(nu.lng - begin.lng), "hij staat weer op het begin van het deel").toBeLessThan(1e-6);
  // Midden in een lange reis het hele deel tonen: hij stopt met lopen, de lijnen zijn af en hij staat op de bestemming.
  await page.locator("#next").click();
  await expect.poll(async () => (await opname(page)).rec.filter((q) => q.walk).length, { timeout: 10_000 }).toBeGreaterThan(20);
  await wis(page);
  await page.evaluate(() => document.getElementById("whole")!.click());
  await page.waitForTimeout(400);
  await rust(page);
  o = await opname(page);
  const na = o.rec.filter((q) => q.t - o.rec[0].t > 200);
  expect(na.filter((q) => q.walk).length, "beeldjes waarin hij nog liep na ‘hele deel’").toBe(0);
  expect(o.onaf).toBe(0);
  const c = cijfers(o);
  expect(c.eindFout, "afstand tot de bestemming van de stap (px)").toBeLessThanOrEqual(GRENS.eind);
  expect(c.sprong, "grootste zichtbare sprong (px)").toBeLessThanOrEqual(GRENS.sprong);
  expect(errors).toEqual([]);
});

test("van deel wisselen tijdens het lopen: de oude reis stopt en de reiziger staat bij het nieuwe deel", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page, "abraham/1");
  await expect.poll(async () => (await opname(page)).rec.filter((q) => q.walk).length, { timeout: 10_000 }).toBeGreaterThan(20);
  await wis(page);
  await page.evaluate(() => (document.querySelector('#delen [data-deel="jozef"]') as HTMLElement).click());
  await expect(page.locator("#sTitle")).toHaveText("Jozef");
  await page.waitForTimeout(400);
  await rust(page);
  const o = await opname(page), c = cijfers(o);
  expect(o.rec.filter((q) => q.walk && q.t - o.rec[0].t > 200).length, "beeldjes waarin hij nog liep").toBe(0);
  expect(c.sprong, "grootste zichtbare sprong (px)").toBeLessThanOrEqual(GRENS.sprong);
  expect(c.staatStil).toBe(true);
  expect(errors).toEqual([]);
});

test("minder beweging: de reiziger staat meteen op de bestemming en de lijn is af", async ({ page }) => {
  const errors = watchErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "abraham");
  await rust(page, 300);
  for (const n of [1, 2, 3, 4]) {
    await wis(page);
    await page.locator("#next").click();
    await expect(page.locator("#sTitle")).toHaveText(new RegExp(`^${n}\\. `));
    await page.waitForTimeout(500);
    const o = await opname(page), c = cijfers(o);
    expect(o.rec.filter((q) => q.walk).length, `stap ${n}: hij loopt niet`).toBe(0);
    expect(c.eindFout, `stap ${n}: afstand tot de bestemming (px)`).toBeLessThanOrEqual(GRENS.eind);
    expect(c.staatStil, `stap ${n}`).toBe(true);
    expect(o.onaf, `stap ${n}: lijnen die niet af zijn`).toBe(0);
    // Binnen een paar beeldjes na de klik staat hij er al.
    const eerste = o.rec.find((q) => o.eind && afstand(q.p, o.eind) <= GRENS.eind);
    expect(eerste && eerste.t - o.rec[0].t, `stap ${n}: tijd tot hij op de bestemming staat (ms)`).toBeLessThan(250);
  }
  expect(errors).toEqual([]);
});
