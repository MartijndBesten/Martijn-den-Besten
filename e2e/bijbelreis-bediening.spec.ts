import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Duidelijke bediening (16-11-2026). Martijn, bij een schermbeeld van de desktop op het tabblad Speurtocht: ‘het is niet
// heel duidelijk wat die knoppen bovenaan zijn.’ Daarom:
// - elk tabblad heeft een korte uitleg (aria-describedby): op brede schermen als tweede regel, op desktop en tablet bij
//   aanwijzen en toetsenbordfocus, op de telefoon alleen voor de schermlezer (de onderbalk blijft één woord);
// - Toen | Nu heeft op de desktop het label ‘Kaart van’ en een uitleg per knop;
// - de speurtocht zegt over welk boek de vragen gaan (te kiezen), noemt de keuze ‘Waar gaan de vragen over?’ en zegt in
//   één zin wat er gebeurt; een verdiepend deel staat als ‘Van dichtbij: …’ direct na zijn hoofddeel.
// Elke pagina wordt vers geopend (eerst about:blank, dan het adres).

test.use({ reducedMotion: "reduce" });

const UITLEG: Record<string, RegExp> = {
  verhalen: /^\d+ geschiedenissen$/,
  reis: /^route op de kaart$/,
  wie: /^personen, families$/,
  tijd: /^wanneer het gebeurde$/,
  quiz: /^vragen en zoeken$/,
  pas: /^jouw stempels$/,
};

function fouten(page: Page) {
  const f: string[] = [];
  page.on("pageerror", (e) => f.push(String(e)));
  page.on("console", (m) => m.type() === "error" && f.push(m.text()));
  return f;
}
async function open(page: Page, hash: string) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("bijbelreis:niveau", JSON.stringify("b"));
      localStorage.setItem("bijbelreis:laatst", JSON.stringify("genesis:jakob:2"));
    } catch { /* about:blank heeft geen opslag */ }
  });
  await page.goto("about:blank");
  await page.goto("/bijbelreis" + hash);
  await expect(page.locator("#sTitle")).not.toBeEmpty();
}
const breed = (page: Page) => page.evaluate(() => innerWidth);

test("tabbladen: elk tabblad heeft een naam en een korte uitleg voor de schermlezer", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#jakob/3");
  for (const [id, tekst] of Object.entries(UITLEG)) {
    const tab = page.locator(`#t-${id}`);
    await expect(tab).toHaveAttribute("aria-describedby", `tu-${id}`);
    await expect(tab).toHaveAccessibleDescription(tekst);
  }
  // De naam blijft het ene woord: de uitleg (aria-hidden, alleen als beschrijving gebruikt) hoort niet in de naam.
  await expect(page.getByRole("tab", { name: "Verhalen", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Wie is wie", exact: true })).toBeVisible();
  // Het aantal geschiedenissen komt uit de inhoud, niet uit een vast getal.
  const n = await page.evaluate(() => (window as unknown as { BR: { geschiedenissen: unknown[] } }).BR.geschiedenissen.length);
  await expect(page.locator("#t-verhalen")).toHaveAccessibleDescription(`${n} geschiedenissen`);
  expect(f).toEqual([]);
});

test("tabbladen op de desktop: uitleg bij aanwijzen en bij toetsenbordfocus; op brede schermen als tweede regel, kop even hoog", async ({ page }) => {
  test.skip((await page.evaluate(() => innerWidth)) < 1000, "alleen op desktop en tablet in de breedte");
  await page.setViewportSize({ width: 1180, height: 820 });
  await open(page, "#jakob/3");
  const uitleg = (id: string) => page.locator(`#tu-${id}`);
  await expect(uitleg("tijd")).toBeHidden();
  await page.locator("#t-tijd").hover();
  await expect(uitleg("tijd")).toBeVisible();
  await page.mouse.move(5, 600);
  await expect(uitleg("tijd")).toBeHidden();
  await page.locator("#t-reis").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#t-wie")).toBeFocused();
  await expect(uitleg("wie")).toBeVisible();
  // De uitleg valt binnen het scherm.
  const box = await uitleg("wie").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(1180);
  // Breed: de uitleg staat er altijd, onder het woord, en de kop blijft 64 px hoog.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.mouse.move(5, 600);
  await page.locator("#map").focus();
  for (const id of Object.keys(UITLEG)) {
    await expect(uitleg(id)).toBeVisible();
    const [t, u] = await Promise.all([page.locator(`#t-${id}`).boundingBox(), uitleg(id).boundingBox()]);
    expect(u!.x).toBeGreaterThanOrEqual(t!.x - 1);
    expect(u!.x + u!.width).toBeLessThanOrEqual(t!.x + t!.width + 1);
  }
  expect(await page.evaluate(() => Math.round(document.querySelector(".kop")!.getBoundingClientRect().height))).toBeLessThanOrEqual(64);
});

test("tabbladen op de telefoon: de onderbalk blijft één woord en 48 px hoog; het korte stapblad blijft gelijk", async ({ page, isMobile }) => {
  test.skip(!isMobile, "alleen op de telefoon");
  await open(page, "#jakob/3");
  // De uitleg is er alleen voor de schermlezer: niet te zien (hooguit 1 px, buiten beeld geknipt).
  for (const id of Object.keys(UITLEG)) {
    const b = await page.locator(`#tu-${id}`).boundingBox();
    expect(b === null || (b.width <= 1 && b.height <= 1), id).toBe(true);
  }
  const m = await page.evaluate(() => ({
    balk: Math.round(document.querySelector(".tabs")!.getBoundingClientRect().height),
    tab: Math.round(document.getElementById("t-tijd")!.getBoundingClientRect().height),
    vrij: (document.getElementById("reisboek")!.getBoundingClientRect().top - document.getElementById("map")!.getBoundingClientRect().top) / innerHeight,
    breed: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(m.balk).toBeLessThanOrEqual(48 + 1);
  expect(m.tab).toBeLessThanOrEqual(48);
  expect(m.vrij).toBeGreaterThanOrEqual(0.6);
  expect(m.breed).toBeLessThanOrEqual(0);
});

test("Toen | Nu: een begrijpelijke naam en uitleg per knop; op de desktop met het label ‘Kaart van’", async ({ page }) => {
  await open(page, "#jakob/3");
  // Op de telefoon en de smalle tablet zit Toen | Nu in het kaartpaneel achter de knop ‘Kaart’.
  if (await page.locator("#kaartBtn").isVisible() && !(await page.locator("#toenBtn").isVisible())) await page.locator("#kaartBtn").click();
  await expect(page.locator(".seg")).toHaveAttribute("aria-label", "Kaart van toen of van nu");
  await expect(page.locator("#toenBtn")).toHaveAccessibleDescription("Het land zoals in de Bijbelse tijd");
  await expect(page.locator("#nuBtn")).toHaveAccessibleDescription("Landen en plaatsnamen van nu");
  await expect(page.locator("#toenBtn")).toHaveAccessibleName("Toen");
  if ((await breed(page)) > 900) {
    await expect(page.locator(".seg .seglabel")).toHaveText("Kaart van");
    await expect(page.locator(".seg .seglabel")).toBeVisible();
    // De knoppen blijven even hoog als zonder label (raakbaar).
    for (const id of ["#toenBtn", "#nuBtn"]) expect((await page.locator(id).boundingBox())!.height).toBeGreaterThanOrEqual(32);
    // De uitleg verschijnt bij aanwijzen.
    await page.locator("#nuBtn").hover();
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.getElementById("nuBtn")!, "::after").visibility)).toBe("visible");
  } else {
    await expect(page.locator(".seg .seglabel")).toBeHidden();
  }
});

test("speurtocht: het boek is zichtbaar en te kiezen, ‘Waar gaan de vragen over?’, en een andere keuze start over dat deel", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#jakob/3");
  await page.locator("#t-quiz").click();
  const box = page.locator("#p-quiz");
  await expect(box.getByText("Waar gaan de vragen over?")).toBeVisible();
  await expect(box.getByText("Over wie?")).toHaveCount(0);
  await expect(page.locator("#qBoek")).toHaveValue("genesis");
  await expect(page.locator('label[for="qBoek"]')).toHaveText("Boek");
  // De knoppen: ‘Heel Genesis’, de delen met hun gewone naam, en ‘Van dichtbij: …’ direct na het hoofddeel.
  const knoppen = await box.locator("[data-q]").allTextContents();
  expect(knoppen[0]).toBe("Heel Genesis");
  expect(knoppen).toContain("Jakob");
  expect(knoppen.indexOf("Van dichtbij: Jakob bij de Jabbok")).toBe(knoppen.indexOf("Jakob") + 1);
  expect(knoppen.indexOf("Van dichtbij: Van Ur naar Kanaän")).toBe(knoppen.indexOf("Abraham") + 1);
  expect(knoppen.some((k) => k.includes("›") || k.startsWith("Alles uit"))).toBe(false);
  await expect(box.locator(".qwat")).toContainText("Tien vragen over Genesis.");
  // Een deel kiezen: de zin noemt het deel; starten geeft vraag 1.
  await box.getByRole("button", { name: "Jakob", exact: true }).click();
  await expect(box.getByRole("button", { name: "Jakob", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(box.locator(".qwat")).toContainText("Tien vragen over Jakob.");
  await box.getByRole("button", { name: "Start de speurtocht" }).click();
  await expect(box).toContainText("Vraag 1 van");
  expect(f).toEqual([]);
});

test("speurtocht: een ander boek kiezen verandert de vragen, niet de plek in de reis", async ({ page }) => {
  const f = fouten(page);
  await open(page, "#jakob/3");
  await page.locator("#t-quiz").click();
  await page.locator("#qBoek").selectOption("exodus");
  const box = page.locator("#p-quiz");
  await expect(box.locator("[data-q]").first()).toHaveText("Heel Exodus");
  await expect(box.locator(".qwat")).toContainText("Tien vragen over Exodus.");
  await expect(page.locator("#qBoek")).toBeFocused();
  // De reis blijft waar hij was.
  await page.locator("#t-reis").click();
  await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
  await expect(page).toHaveURL(/#jakob\/3$/);
  // Terug naar de speurtocht: die volgt weer het boek van de reis.
  await page.locator("#t-quiz").click();
  await expect(page.locator("#qBoek")).toHaveValue("genesis");
  // De thema’s staan apart in de keuzelijst.
  await expect(page.locator('#qBoek optgroup[label="Thema’s"] option')).not.toHaveCount(0);
  expect(f).toEqual([]);
});

test("bediening: geen toegankelijkheidsfouten in de kop, de speurtochtkeuze en de kaartschakelaar", async ({ page }) => {
  await open(page, "#jakob/3");
  await page.locator("#t-quiz").click();
  await expect(page.locator("#qBoek")).toBeVisible();
  const axe = await new AxeBuilder({ page }).include(".kop").include("#p-quiz").include(".seg").analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
});
