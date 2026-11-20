import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { zonderVoorscherm } from "./voorscherm";

zonderVoorscherm(test);

// Speurtocht, paspoort en personen (17-11-2026, docs/bijbelreis-audit/telefoon.md §4.11): de onderdelen moeten helpen de
// geschiedenis te begrijpen en te onthouden, niet alleen punten verzamelen.
// - Speurtocht: de punten kloppen meteen na het antwoord; bij elke vraag staat uit welk verhaal (of deel) hij komt; na
//   een antwoord ‘Lees het in je Bijbel: …’; op het eindscherm hoe de score is opgebouwd en ‘Lees nog eens na’.
// - Paspoort: ‘Hier was je’ met de laatste stempel en een knop naar de volgende stap; per deel ingeklapt met ‘5 van 7’;
//   alleen het boek en deel waar je was staan open; de stempels komen er bij het openklappen.
// - Wie is wie: Sara staat bij Abraham één keer (‘Getrouwd met’, ook zijn halfzuster, Genesis 20:12), niet ook bij
//   ‘Broers en zussen’.

test.use({ reducedMotion: "reduce" });

type Vraag = { q: string; a: string[]; why?: string };
type Venster = { BR: { niveaus: { verhalen: Record<string, Record<string, { vragen?: Vraag[] }>> }; boeken: { id: string; delen: { id: string; steps: { t: string }[] }[] }[] } };

function fouten(page: Page) {
  const f: string[] = [];
  page.on("pageerror", (e) => f.push(String(e)));
  page.on("console", (m) => m.type() === "error" && f.push(m.text()));
  return f;
}
async function open(page: Page, hash: string, niveau: "a" | "b" | "c", extra: Record<string, unknown> = {}) {
  await page.addInitScript(([n, x]) => {
    try {
      localStorage.setItem("bijbelreis:niveau", JSON.stringify(n));
      for (const [k, v] of Object.entries(x)) localStorage.setItem("bijbelreis:" + k, JSON.stringify(v));
    } catch { /* about:blank heeft geen opslag */ }
  }, [niveau, extra] as const);
  await page.goto("about:blank");
  await page.goto("/bijbelreis" + hash);
}
// Het goede antwoord van de vraag die nu in beeld staat (uit de vragen van de reisniveaus).
const goedAntwoord = (page: Page, q: string) => page.evaluate((q) => {
  const V = (window as unknown as Venster).BR.niveaus.verhalen;
  for (const lv of Object.values(V)) for (const v of Object.values(lv || {})) for (const x of v?.vragen || []) if (x.q === q) return x.a[0];
  return null;
}, q);

test("speurtocht: punten meteen bijgewerkt, bron bij de vraag, Bijbelplaats en ‘Lees nog eens na’", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#abraham", "a");
  await page.getByRole("tab", { name: "Speurtocht" }).click();
  await page.locator("#qGo").click();
  let punten = 0;
  const fout: string[] = [];
  for (let i = 0; i < 6; i++) {
    const q = (await page.locator(".qtext").textContent())!.trim();
    // Elke vraag zegt uit welk verhaal hij komt.
    await expect(page.locator(".qbron")).toHaveText(/^Uit: .+/);
    const goed = await goedAntwoord(page, q);
    expect(goed, q).toBeTruthy();
    const kies = i % 2 === 0;
    const opts = page.locator(".opt");
    const teksten = (await opts.allTextContents()).map((t) => t.trim());
    await opts.nth(kies ? teksten.indexOf(goed!) : teksten.findIndex((t) => t !== goed)).click();
    if (kies) punten++; else fout.push(q);
    // Meteen, nog vóór ‘Volgende vraag’: het oordeel, het goede antwoord, de Bijbelplaats en de punten.
    await expect(page.locator("#qRes .feedback")).toHaveClass(kies ? /ok/ : /no/);
    await expect(page.locator("#qRes .feedback")).toContainText(`Het goede antwoord: ${goed}`);
    await expect(page.locator("#qRes .feedback")).toContainText("Lees het in je Bijbel:");
    await expect(page.locator("#qRes .feedback .bref")).toHaveCount(1);
    await expect(page.locator("#qPunten")).toHaveText(`Punten: ${punten}`);
    await expect(page.locator("#qRes")).toHaveAttribute("aria-live", "polite");
    expect(await page.locator("#qRes .feedback").textContent()).not.toMatch(/[.!?]\.\s/);
    await page.locator("#qNext").click();
  }
  await expect(page.locator("#p-quiz .big")).toContainText(`${punten}`);
  await expect(page.locator(".qopbouw")).toHaveText(`${punten} goed · ${6 - punten} fout`);
  await expect(page.locator(".nalezen .label")).toHaveText("Lees samen nog eens na");
  expect(await page.locator(".nalezen .nl-v").allTextContents()).toEqual(fout);
  await expect(page.locator(".nalezen .bref")).toHaveCount(fout.length);
  expect(f).toEqual([]);
});

test("speurtocht: vragen uit meer delen zeggen over welk deel ze gaan", async ({ page }) => {
  const f = fouten(page);
  await page.addInitScript(() => { Math.random = () => 0.999999; });
  await open(page, "#abraham", "c");
  await page.getByRole("tab", { name: "Speurtocht" }).click();
  await page.locator('#p-quiz [data-q="alles"]').click();
  await page.locator("#qGo").click();
  let metBron = 0;
  for (let i = 0; i < 10; i++) {
    const bron = page.locator(".qbron");
    if (await bron.count()) { await expect(bron).toHaveText(/^(Uit|Over): .+/); metBron++; }
    if (await page.locator(".tapcall").isVisible()) break; // een kaartvraag: hier niet verder nodig
    if (await page.locator("#qUndo").count()) { const n = await page.locator(".opt").count(); for (let j = 0; j < n; j++) await page.locator(".opt").nth(j).click(); }
    else await page.locator(".opt").first().click();
    await page.locator("#qNext").click();
  }
  expect(metBron).toBeGreaterThan(0);
  expect(f).toEqual([]);
});

test("paspoort: hier was je, verder naar de volgende stap, per deel ingeklapt", async ({ page }) => {
  const f = fouten(page);
  await page.goto("about:blank");
  const sleutels = await (async () => {
    await page.goto("/bijbelreis");
    return page.evaluate(() => (window as unknown as Venster).BR.boeken.flatMap((b) => b.delen.flatMap((d) => d.steps.map((_, i) => `${b.id}:${d.id}:${i}`))));
  })();
  const gezien = sleutels.filter((k) => k.startsWith("genesis:abraham:")).concat(["exodus:mozes:0", "exodus:mozes:1", "exodus:mozes:2", "exodus:mozes:3", "exodus:mozes:4"]);
  await open(page, "", "b", { gezien, laatst: "exodus:mozes:4", huidig: { k: "exodus:mozes:4" } });
  // Na herladen: de start gaat verder waar je was.
  await expect(page.locator(".verdermet")).toContainText("Verder met:");
  await page.getByRole("tab", { name: "Paspoort" }).click();
  const titels = await page.evaluate(() => { const d = (window as unknown as Venster).BR.boeken.find((b) => b.id === "exodus")!.delen.find((x) => x.id === "mozes")!; return d.steps.map((s) => s.t); });
  const pv = page.locator("#pasVerder");
  await expect(pv).toBeVisible();
  await expect(pv).toContainText(`stap 5: ${titels[4]}`);
  await expect(pv.locator(".pv-stempel svg")).toHaveCount(1);
  // Alleen Exodus en daarin Mozes staan open; de andere delen zijn ingeklapt en nog zonder stempels.
  await expect(page.locator("#stamps details.pasboek[open]")).toHaveCount(1);
  await expect(page.locator("#stamps details.pasboek[open] > summary b")).toHaveText("Exodus");
  await expect(page.locator("#stamps details.pasdeel[open]")).toHaveCount(1);
  await expect(page.locator('#stamps details.pasdeel[open][data-deel="exodus:mozes"] > summary')).toContainText(`5 van ${titels.length}`);
  await expect(page.locator("#stamps .stamp")).toHaveCount(titels.length);
  await expect(page.locator("#stamps .stamp:not(.no)")).toHaveCount(5);
  // Een ingeklapt deel krijgt zijn stempels bij het openklappen.
  const abraham = page.locator('#stamps details.pasdeel[data-deel="genesis:abraham"]');
  await page.locator("#stamps details.pasboek", { hasText: "Genesis" }).first().locator("> summary").click();
  await expect(abraham.locator("> summary")).toContainText(/Abraham · (\d+) van \1/);
  await abraham.locator("> summary").click();
  await expect(abraham.locator(".stamp:not(.no)").first()).toBeVisible();
  // Tikvlak van een deelregel.
  expect((await abraham.locator("> summary").boundingBox())!.height).toBeGreaterThanOrEqual(40);
  // Verder: naar de eerstvolgende stap zonder stempel.
  await pv.getByRole("button", { name: new RegExp(`Verder: stap 6`) }).click();
  await expect(page.locator("#sTitle")).toContainText(titels[5]);
  // De betekenis van de stempels is niet veranderd: de stap is nu ook gestempeld.
  const na = await page.evaluate(() => JSON.parse(localStorage.getItem("bijbelreis:gezien") || "[]"));
  expect(na).toEqual(expect.arrayContaining([...gezien, "exodus:mozes:5"]));
  expect(f).toEqual([]);
});

test("paspoort zonder voortgang: geen ‘Hier was je’, toegankelijk", async ({ page }) => {
  const f = fouten(page);
  await open(page, "", "b");
  await page.getByRole("tab", { name: "Paspoort" }).click();
  await expect(page.locator("#pasVerder")).toBeHidden();
  await expect(page.locator("#stamps details.pasboek[open]")).toHaveCount(0);
  const r = await new AxeBuilder({ page }).include("#p-pas").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(r.violations.map((v) => v.id)).toEqual([]);
  expect(f).toEqual([]);
});

test("wie is wie: Sara staat bij Abraham één keer, met ‘ook zijn halfzuster’ en Genesis 20:12", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#abraham/2", "c");
  await page.getByRole("tab", { name: "Wie is wie" }).click();
  await page.locator('#p-wie .person[data-n="Abraham"]').first().click();
  const info = page.locator("#wieInfo");
  await expect(info.locator("h3")).toHaveText("Abraham");
  await expect(info.locator('dl.fam .chip[data-mens="sara"]')).toHaveCount(1);
  await expect(info.locator('dl.fam .chip[data-mens="sara"]')).toContainText("ook zijn halfzuster");
  const broers = info.locator("dl.fam dt", { hasText: "Broers en zussen" }).locator("xpath=following-sibling::dd[1]");
  await expect(broers.locator(".chip")).toHaveText([/Nahor/, /Haran/]);
  await expect(info.locator("details.grond")).toContainText("Ook zijn halfzuster:");
  await expect(info.locator("details.grond")).toContainText("Genesis 20:12");
  // Andersom bij Sara.
  await info.locator('dl.fam .chip[data-mens="sara"]').click();
  await expect(info.locator("h3")).toHaveText("Sara");
  await expect(info.locator('dl.fam .chip[data-mens="abraham"]')).toHaveCount(1);
  await expect(info.locator('dl.fam .chip[data-mens="abraham"]')).toContainText("ook haar halfbroer");
  const r = await new AxeBuilder({ page }).include("#wieInfo").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(r.violations.map((v) => v.id)).toEqual([]);
  expect(f).toEqual([]);
});

// Toegankelijkheid (WCAG 2.1.1 en 2.4.3): een kaartvraag kan ook zonder kaart, met het toetsenbord; na het starten en na
// ‘Volgende vraag’ staat de focus op de vraag, niet op de pagina.
async function alleenKaartvragen(page: Page) {
  await page.route(/\/bijbelreis\/app\.js/, async (route) => {
    const r = await route.fetch();
    await route.fulfill({ response: r, body: "BR.boeken.forEach((b) => { b.ordAlles = []; b.delen.forEach((d) => { if (d.quiz) { d.quiz.mc = []; d.quiz.ord = []; } }); });\n" + (await r.text()) });
  });
  await page.route(/\/bijbelreis\/niveaus\/[abc]\.js/, async (route) => {
    const r = await route.fetch();
    await route.fulfill({ response: r, body: "const __v = BR.niveaus.voegToe.bind(BR.niveaus); BR.niveaus.voegToe = (n, vs) => { Object.values(vs).forEach((v) => { v.vragen = []; }); return __v(n, vs); };\n" + (await r.text()) });
  });
}
test("speurtocht met het toetsenbord: focus op de vraag, kaartvraag via de lijst met plaatsen", async ({ page }) => {
  const f = fouten(page);
  await alleenKaartvragen(page);
  await open(page, "#abraham", "c");
  await page.getByRole("tab", { name: "Speurtocht" }).click();
  await page.locator("#qGo").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".qtext")).toBeFocused();
  await expect(page.locator(".tapcall")).toBeVisible();
  const q = (await page.locator(".qtext").textContent())!;
  // Het goede antwoord: de plaats van deze vraag (uit de gegevens).
  const id = await page.evaluate((q) => { const B = (window as unknown as { BR: { boeken: { delen: { quiz?: { tap?: { id: string; q: string }[] } }[] }[] } }).BR; return B.boeken.flatMap((b) => b.delen.flatMap((d) => d.quiz?.tap || [])).find((x) => x.q === q)!.id; }, q);
  await page.keyboard.press("Tab");
  await expect(page.locator(".tapkeuze > summary")).toBeFocused();
  await page.keyboard.press("Enter");
  const knoppen = page.locator(".tapkeuze .plaatsopt");
  const n = await knoppen.count();
  expect(n).toBeGreaterThanOrEqual(2);
  // Op de kaart evenveel genummerde plekken; de knoppen noemen alleen het nummer, niet de plaats.
  await expect(page.locator(".plekpin")).toHaveCount(n);
  expect(await knoppen.allTextContents()).toEqual(Array.from({ length: n }, (_, i) => `Plek ${i + 1}`));
  const goed = knoppen.and(page.locator(`[data-plaats="${id}"]`));
  await expect(goed).toHaveCount(1);
  await goed.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#qRes .feedback.ok")).toContainText("Raak!");
  await expect(page.locator("#qPunten")).toHaveText("Punten: 1");
  await expect(page.locator(".tapkeuze")).toBeHidden();
  await expect(page.locator("#qNext")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".qtext")).toBeFocused();
  expect(f).toEqual([]);
});

test("vragen bij een geschiedenis: na ‘Begin met de vragen’ en ‘Volgende vraag’ staat de focus op de vraag", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#v26", "c");
  const start = page.locator("#vqStart");
  await start.scrollIntoViewIfNeeded();
  await start.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#vQuiz .qtext")).toBeFocused();
  await expect(page.locator("#vQuiz .res")).toHaveAttribute("aria-live", "polite");
  await page.locator("#vQuiz .opt").first().click();
  await page.locator("#vqVolgende").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#vQuiz .qtext")).toBeFocused();
  expect(f).toEqual([]);
});

test("paspoort: deelnamen zijn leesbaar (contrast) en een stempel noemt zijn zichtbare woord", async ({ page }) => {
  const f = fouten(page);
  // Van Ur naar Kanaän heeft kleur oker: als tekst de donkere variant.
  await open(page, "", "b", { gezien: ["genesis:ur-kanaan:0", "genesis:ur-kanaan:1"], laatst: "genesis:ur-kanaan:1" });
  await page.getByRole("tab", { name: "Paspoort" }).click();
  const label = page.locator('#stamps details.pasdeel[data-deel="genesis:ur-kanaan"] > summary > span').first();
  await expect(label).toHaveCSS("color", "rgb(124, 90, 18)");
  const stempel = page.locator('#stamps details.pasdeel[data-deel="genesis:ur-kanaan"] .stamp').first();
  const woord = await stempel.locator("svg text").nth(1).textContent();
  expect(await stempel.getAttribute("aria-label")).toContain(woord!);
  const r = await new AxeBuilder({ page }).include("#stamps").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(r.violations.map((v) => v.id)).toEqual([]);
  expect(f).toEqual([]);
});
