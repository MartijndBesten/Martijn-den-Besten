import { expect, test, type Page } from "@playwright/test";
// @ts-expect-error -- gewoon JavaScript-bestand zonder typen
import { nederlandseWoorden } from "../scripts/bijbelreis-talen-woorden.mjs";

// De Engelse proef van de Bijbelreis (docs/bijbelreis-talen/README.md): de atlas op /en/ (lokaal /bijbelreis/en/).
// Lokaal: npm run build && npx vite preview --port 8995 --strictPort, dan
//   E2E_BASE_URL=http://localhost:8995 npx playwright test e2e/bijbelreis-engels.spec.ts --trace off
const EN = "/bijbelreis/en/";

function fouten(page: Page) {
  const f: string[] = [];
  page.on("pageerror", (e) => f.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) f.push(m.text()); });
  return f;
}
const zetNiveau = (page: Page, n: "a" | "b" | "c") => page.addInitScript((x) => localStorage.setItem("bijbelreis:niveau", JSON.stringify(x)), n);
// Alle zichtbare tekst en de namen van knoppen (aria-label, title, placeholder, alt), zonder wat expliciet Nederlands is
// (lang="nl": de link terug naar de Nederlandse site).
async function zichtbareTekst(page: Page) {
  return page.evaluate(() => {
    const uit: string[] = [];
    const zichtbaar = (el: Element | null) => {
      for (let e = el; e; e = e.parentElement) {
        if ((e as HTMLElement).hidden || e.getAttribute("lang") === "nl") return false;
        const cs = getComputedStyle(e);
        if (cs.display === "none" || cs.visibility === "hidden") return false;
      }
      return true;
    };
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = w.nextNode())) { const t = (n.nodeValue || "").trim(); if (t && !["SCRIPT", "STYLE"].includes(n.parentElement!.tagName) && zichtbaar(n.parentElement)) uit.push(t); }
    document.querySelectorAll("[aria-label],[title],[placeholder],[alt]").forEach((e) => { if (zichtbaar(e)) ["aria-label", "title", "placeholder", "alt"].forEach((a) => { const v = e.getAttribute(a); if (v) uit.push(v); }); });
    return uit;
  });
}
async function geenNederlands(page: Page, waar: string) {
  const nl = (await zichtbareTekst(page)).map((t) => [t, nederlandseWoorden(t)] as const).filter(([, w]) => w.length).map(([t, w]) => `${w.join(",")}: ${t.slice(0, 90)}`);
  expect(nl, waar).toEqual([]);
}

test.describe("de Engelse proef", () => {
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); });

  test("de start is Engels, met de proefmelding, noindex en de weg terug", async ({ page }) => {
    const f = fouten(page);
    await page.goto(EN);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("Journey through the Bible");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    await expect(page.locator('link[rel="alternate"][hreflang="nl"]')).toHaveAttribute("href", "https://bijbelreis.nl/");
    await expect(page.locator(".taal-proef")).toContainText("Review draft");
    await expect(page.locator("#p-verhalen")).toContainText("10 histories");
    await expect(page.locator(".startkaart")).toContainText("Begin the journey");
    await geenNederlands(page, "start");
    // Niet vertaalde onderdelen staan er in het Engels niet.
    await expect(page.locator("#vandaagLijstBtn")).toBeHidden();
    expect(f).toEqual([]);
  });

  for (const niv of ["a", "b", "c"] as const) {
    test(`geschiedenis 26 op niveau ${niv}`, async ({ page }) => {
      const f = fouten(page);
      await zetNiveau(page, niv);
      await page.goto(EN + "#v26");
      await expect(page.locator("#vTitel")).toHaveText("Dry through the Red Sea");
      if (niv === "a") {
        await expect(page.locator(".a-tekst")).toContainText("God has led His people Israel out of Egypt");
        await expect(page.locator(".conceptlabel")).toContainText("Review draft for Discover together");
        for (let i = 0; i < 8 && (await page.locator("#aVerder").count()); i++) await page.locator("#aVerder").click();
        await expect(page.locator("#vQuiz .qtext")).toBeVisible();
      } else if (niv === "b") {
        await expect(page.locator("#vVertelling")).toContainText("Fear ye not, stand still, and see the salvation of the LORD");
        await expect(page.locator(".conceptlabel")).toContainText("Review draft for On my own");
        await expect(page.locator(".citaatnoot")).toContainText("King James Version");
      } else {
        await page.locator("details.blok summary", { hasText: "Going deeper" }).click();
        const verdieping = page.locator(".blok-in").filter({ hasText: "Where was the crossing?" });
        await expect(verdieping).toContainText("To him which divided the Red sea into parts");
      }
      await geenNederlands(page, `v26 niveau ${niv}`);
      expect(f).toEqual([]);
    });
  }

  test("een vraag bij de geschiedenis", async ({ page }) => {
    await zetNiveau(page, "b");
    await page.goto(EN + "#v52");
    await expect(page.locator("#vTitel")).toHaveText("David and Goliath");
    await page.locator("#vqStart").click();
    await expect(page.locator("#vQuiz .qtext")).toBeVisible();
    await page.locator("#vQuiz .opt").first().click();
    await expect(page.locator("#vQuiz .feedback")).toContainText(/Right!|Not quite\./);
    await expect(page.locator("#vQuiz .feedback")).toContainText("The right answer:");
    await geenNederlands(page, "vraag");
  });

  test("een stap op de kaart, en een stap die nog niet vertaald is", async ({ page }) => {
    const f = fouten(page);
    await zetNiveau(page, "c");
    await page.goto(EN + "#uittocht/6");
    await expect(page.locator("#sTitle")).toHaveText("6. Through the Red Sea");
    await expect(page.locator("#sText")).toContainText("strong east wind");
    await expect(page.locator("#sRef")).toHaveText("Exodus 14:21–31");
    await expect(page.locator("#map .lab", { hasText: "Red Sea" }).first()).toBeAttached();
    await geenNederlands(page, "reisstap");
    await page.goto(EN + "#uittocht/1");
    await expect(page.locator("#sText")).toContainText("not yet available in English");
    await expect(page.locator("#sTitle")).toHaveText("1. Let My people go!");
    await geenNederlands(page, "niet vertaalde stap");
    expect(f).toEqual([]);
  });

  test("de andere tabbladen", async ({ page }, ti) => {
    test.skip(ti.project.name === "tablet", "desktop en telefoon zijn genoeg");
    await zetNiveau(page, "c");
    await page.goto(EN + "#daniel/8");
    for (const tab of ["wie", "tijd", "quiz", "pas", "verhalen"]) {
      await page.locator("#t-" + tab).click();
      await page.waitForTimeout(400);
      await geenNederlands(page, "tab " + tab);
    }
    await page.locator("#t-quiz").click();
    await page.locator("#qGo").click();
    await expect(page.locator("#p-quiz .qhead")).toContainText("Question 1 of");
    await geenNederlands(page, "speurtocht");
  });

  test("terug naar het Nederlands op dezelfde plek, met dezelfde voortgang", async ({ page }) => {
    await zetNiveau(page, "c");
    // Een stap in de reis geeft een stempel; daarna een geschiedenis, en vandaar naar het Nederlands.
    await page.goto(EN + "#uittocht/5");
    await expect(page.locator("#sTitle")).toHaveText("5. Trapped at the sea");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien") || "[]"))).toContain("exodus:uittocht:4");
    await page.goto(EN + "#v26");
    await expect(page.locator("#vTitel")).toHaveText("Dry through the Red Sea");
    await page.locator(".taal-proef a[data-taal='nl']").click();
    await page.waitForURL(/\/bijbelreis#v26$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
    await expect(page.locator("#vTitel")).toHaveText("Droog door de Schelfzee");
    // Dezelfde stempels: de voortgang is voor alle talen dezelfde (localStorage bijbelreis:*).
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien") || "[]"))).toContain("exodus:uittocht:4");
    await page.locator("#t-pas").click();
    await expect(page.locator("#pasStats")).toContainText("reisstempels");
  });

  test("de Engelse verhaalpagina", async ({ page }) => {
    await page.goto("/bijbelreis/en/verhaal/26-dry-through-the-red-sea");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText("Dry through the Red Sea");
    await geenNederlands(page, "verhaalpagina");
    await page.locator("a.knop").first().click();
    await expect(page.locator("#vTitel")).toHaveText("Dry through the Red Sea");
  });
});

test.describe("app en offline: Engels en Nederlands nooit gemengd", () => {
  test.use({ serviceWorkers: "allow", reducedMotion: "reduce" });
  test("de Engelse pagina heeft een eigen service worker, scope en cache", async ({ page, baseURL }, ti) => {
    test.skip(ti.project.name !== "desktop", "één keer, in het project desktop");
    test.skip(!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(baseURL || ""), "alleen lokaal");
    await page.goto(EN);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 }).catch(() => {});
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 });
    const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return { scope: r!.scope, script: navigator.serviceWorker.controller!.scriptURL }; });
    expect(new URL(sw.scope).pathname).toBe("/bijbelreis/en/");
    expect(new URL(sw.script).pathname).toBe("/bijbelreis-sw-en.js");
    const versie = await page.locator('meta[name="bijbelreis-versie"]').getAttribute("content");
    const caches_ = await page.evaluate(async () => Object.fromEntries(await Promise.all((await caches.keys()).map(async (k) => [k, (await (await caches.open(k)).keys()).map((r) => { const u = new URL(r.url); return u.pathname + u.search; })] as const))));
    const schillen = Object.keys(caches_).filter((k) => /schil/.test(k));
    expect(schillen).toEqual([`bijbelreis-en-schil-${versie}`]);
    const inhoud = caches_[schillen[0]];
    expect(inhoud).toContain("/bijbelreis/en/");
    expect(inhoud.some((u) => u.startsWith("/bijbelreis/taal/en/niveaus/b.js?v="))).toBe(true);
    // Geen Nederlandse teksten per niveau in de Engelse set, en geen Nederlandse pagina.
    expect(inhoud.some((u) => u.startsWith("/bijbelreis/niveaus/"))).toBe(false);
    expect(inhoud).not.toContain("/bijbelreis");
    // Elk geladen script hoort bij deze versie van de Engelse set.
    const geladen = await page.evaluate(() => performance.getEntriesByType("resource").map((e) => new URL(e.name)).filter((u) => u.origin === location.origin && /^\/bijbelreis\/.+\.(js|css)$/.test(u.pathname) && u.search).map((u) => u.pathname + u.search));
    for (const u of geladen) expect(inhoud, u).toContain(u);
  });
});
