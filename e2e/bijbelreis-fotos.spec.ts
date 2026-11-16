import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Foto’s van de plaatsen zoals ze er nu uitzien (fotos.js, public/bijbelreis/fotos/). Regels en bronnen:
// docs/bijbelreis-fotos/README.md. Draaien tegen een server die public/ serveert:
//   E2E_BASE_URL=http://127.0.0.1:8895 npx playwright test e2e/bijbelreis-fotos.spec.ts --trace off

test.use({ reducedMotion: "reduce" });
const zetNiveau = (page: Page, n: "a" | "b" | "c") => page.addInitScript((x) => { if (sessionStorage.getItem("niveauGezet")) return; sessionStorage.setItem("niveauGezet", "1"); localStorage.setItem("bijbelreis:niveau", JSON.stringify(x)); localStorage.setItem("bijbelreis:welkomWeg", "true"); }, n);
test.beforeEach(async ({ page }) => { await zetNiveau(page, "c"); });

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
// Alle foto’s staan op de eigen site: geen enkel verzoek naar Wikimedia of een andere buitenstaander.
function watchExtern(page: Page, baseURL: string | undefined) {
  const extern: string[] = [];
  const eigen = new URL(baseURL || "http://127.0.0.1").host;
  page.on("request", (r) => { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol) && u.host !== eigen) extern.push(r.url()); });
  return extern;
}
const kortBlad = async (page: Page) => (await page.locator("#bladBtn").isVisible()) && (await page.locator("#bladBtn").getAttribute("aria-expanded")) !== "true";
async function bladOpen(page: Page) {
  const knop = page.locator("#bladBtn");
  if (!(await knop.isVisible())) return;
  await expect(async () => { if ((await knop.getAttribute("aria-expanded")) !== "true") await knop.click(); await page.waitForTimeout(120); expect(await knop.getAttribute("aria-expanded")).toBe("true"); }).toPass();
}
const foto = (page: Page) => page.locator("#p-reis .stapkaart .plaatsfoto");

test("een stap met een plaats toont een foto van nu, met bijschrift, maker, licentie en alt-tekst", async ({ page, baseURL }) => {
  const errors = watchErrors(page), extern = watchExtern(page, baseURL);
  // De muren van Jericho: eigen tafereel én een foto; de foto staat onder de tekst en onder het tafereel.
  await page.goto("/bijbelreis#intocht/5");
  await expect(page.locator("#sTitle")).toHaveText(/^5\. /);
  // In het korte blad (telefoon) staat geen foto en wordt het blad er niet hoger van.
  if (await kortBlad(page)) {
    await expect(foto(page)).toBeHidden();
    const h = (await page.locator("#reisboek").boundingBox())!.height;
    expect(h / page.viewportSize()!.height).toBeLessThanOrEqual(0.27);
  }
  await bladOpen(page);
  const f = foto(page);
  await expect(f).toHaveCount(1);
  await expect(f).toHaveAttribute("data-foto", "jericho");
  await f.scrollIntoViewIfNeeded();
  await expect(f).toBeVisible();
  await expect(f.locator(".pf-kop")).toHaveText(/Zo ziet het er nu uit/i);
  const img = f.locator("img");
  // De alt-tekst beschrijft wat je ziet; het bijschrift eronder noemt de plaats.
  await expect(img).toHaveAttribute("alt", /^.{20,}$/);
  await expect(img).toHaveAttribute("src", "/bijbelreis/fotos/jericho-480.webp");
  await expect(img).toHaveAttribute("srcset", /jericho\.webp 960w/);
  await expect(img).toHaveAttribute("width", "960");
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await expect(f.locator("figcaption")).toContainText("Tell es-Sultan");
  await expect(f.locator(".pf-bron")).toContainText(/^Foto: .+, (Publiek domein|CC0 1\.0|CC BY(-SA)? \d\.\d) · Wikimedia Commons$/);
  await expect(f.locator(".pf-bron a").last()).toHaveAttribute("href", /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  // Volgorde: tekst, dan tafereel, dan foto. De foto past in de kaart of het blad, zonder horizontaal schuiven.
  const plek = await page.evaluate(() => {
    const t = document.getElementById("sText")!, taf = document.querySelector(".stapkaart > .tafereel"), fo = document.querySelector(".stapkaart > .plaatsfoto")!;
    const kaartje = document.querySelector(".stapkaart")!, r = fo.getBoundingClientRect(), k = (kaartje.getClientRects().length ? kaartje : document.getElementById("reisboek")!).getBoundingClientRect();
    return {
      naTekst: !!(t.compareDocumentPosition(fo) & Node.DOCUMENT_POSITION_FOLLOWING),
      naTafereel: !taf || !!(taf.compareDocumentPosition(fo) & Node.DOCUMENT_POSITION_FOLLOWING),
      onderTafereel: !taf || taf.getBoundingClientRect().bottom <= r.top + 1,
      binnen: r.left >= k.left - 1 && r.right <= k.right + 1,
      breed: document.documentElement.scrollWidth <= innerWidth,
    };
  });
  expect(plek).toEqual({ naTekst: true, naTafereel: true, onderTafereel: true, binnen: true, breed: true });
  const axe = await new AxeBuilder({ page }).include(".stapkaart .plaatsfoto").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  // Een volgende stap zonder foto ruimt de vorige op.
  await page.goto("/bijbelreis#kerst-geboorte/3");
  await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
  await bladOpen(page);
  await expect(page.locator(".plaatsfoto")).toHaveCount(0);
  expect(extern).toEqual([]);
  expect(errors).toEqual([]);
});

test("de geboorte in de stal (kerst, stap 3) heeft bewust geen beeld, dus ook geen foto", async ({ page, baseURL }) => {
  const errors = watchErrors(page), extern = watchExtern(page, baseURL);
  await page.goto("/bijbelreis#kerst-geboorte/3");
  await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
  await bladOpen(page);
  await expect(page.locator(".plaatsfoto")).toHaveCount(0);
  await expect(page.locator(".stapkaart .tafereel")).toHaveCount(0);
  expect(extern).toEqual([]);
  expect(errors).toEqual([]);
});

test("de ballon van Bethlehem toont de foto met de bronregel", async ({ page, baseURL }) => {
  const errors = watchErrors(page), extern = watchExtern(page, baseURL);
  await page.goto("/bijbelreis#ruth/3");
  await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
  await page.waitForTimeout(600);
  await page.evaluate(() => { const m = [...document.querySelectorAll(".leaflet-marker-icon")].find((e) => e.getAttribute("title") === "Bethlehem" || (e.textContent || "").includes("Bethlehem")); m!.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  const ballon = page.locator(".leaflet-popup .pop");
  await expect(ballon).toBeVisible();
  await expect(ballon.locator("h3")).toContainText("Bethlehem");
  const f = ballon.locator(".pf-ballon");
  await expect(f).toHaveAttribute("data-foto", "efrath");
  await expect(f.locator("img")).toHaveAttribute("alt", /^.{20,}$/);
  await expect(f.locator("img")).toHaveAttribute("src", "/bijbelreis/fotos/bethlehem-480.webp");
  await expect.poll(() => f.locator("img").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await expect(f.locator(".pf-bron")).toContainText("Wikimedia Commons");
  // De ballon blijft binnen de kaart.
  // De ballon (met foto) past in de kaart, ook op de telefoon (na het meeschuiven van de kaart).
  await expect.poll(() => page.evaluate(() => { const p = document.querySelector(".leaflet-popup-content-wrapper")!.getBoundingClientRect(), k = document.getElementById("map")!.getBoundingClientRect(); return p.left >= k.left - 1 && p.right <= k.right + 1 && p.top >= k.top - 1 && p.bottom <= k.bottom + 1; }), { timeout: 5000 }).toBe(true);
  // heading-order: de ballon heeft al een h3 zonder h2 erboven (ook bij plaatsen zonder foto); dat staat los van de foto.
  const axe = await new AxeBuilder({ page }).include(".leaflet-popup").disableRules(["heading-order"]).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  expect(extern).toEqual([]);
  expect(errors).toEqual([]);
});

test("een geschiedenis heeft één foto, na de vertelling", async ({ page, baseURL }) => {
  const errors = watchErrors(page), extern = watchExtern(page, baseURL);
  await page.goto("/bijbelreis#v76");
  await expect(page.locator(".verhaal #vVertelling")).not.toBeEmpty();
  const f = page.locator(".verhaal .plaatsfoto");
  await expect(f).toHaveCount(1);
  await expect(f.locator("img")).toHaveAttribute("alt", /.+/);
  await expect(f.locator(".pf-bron")).toContainText(/^Foto: .+ · Wikimedia Commons$/);
  expect(await page.evaluate(() => !!(document.getElementById("vVertelling")!.compareDocumentPosition(document.querySelector(".verhaal .plaatsfoto")!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  expect(extern).toEqual([]);
  expect(errors).toEqual([]);
});

test("alleen een foto van een plaats die in de stap genoemd wordt; de geboorte krijgt ook in Verhalen geen foto", async ({ page }) => {
  const errors = watchErrors(page);
  // ‘De mantel in Troas’ eindigt in Rome, maar noemt Rome niet: geen foto (een foto zonder verband met de tekst hoort er niet).
  await page.goto("about:blank");
  await page.goto("/bijbelreis#v83");
  await expect(page.locator(".verhaal #vVertelling")).not.toBeEmpty();
  await expect(page.locator(".verhaal .plaatsfoto")).toHaveCount(0);
  expect(errors).toEqual([]);
});
