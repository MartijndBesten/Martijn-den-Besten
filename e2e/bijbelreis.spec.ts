import { expect, test, type Page } from "@playwright/test";

// De Bijbelreis is een statische pagina (public/bijbelreis.html) met eigen JavaScript; deze tests lopen de
// belangrijkste routes door: diepe links, voortgang bewaren, tabbladen, Bijbeltekst, speurtocht en de kaart.

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

// Tik midden op de kaart zoals een kind dat doet: wacht tot de pagina en de kaart stilstaan (Leaflet negeert tikken
// tijdens het bewegen) en gebruik op tablet en telefoon een echte aanraking (een muisklik geeft daar geen Leaflet-klik).
async function tikOpKaart(page: Page, hasTouch: boolean) {
  let m = await page.locator("#map").boundingBox();
  await expect.poll(async () => {
    const vorige = JSON.stringify(m); await page.waitForTimeout(300);
    m = await page.locator("#map").boundingBox();
    return JSON.stringify(m) === vorige && !(await page.locator("#map .leaflet-zoom-anim, #map.leaflet-pan-anim").count());
  }, { timeout: 10_000 }).toBe(true);
  await page.waitForTimeout(400);
  if (hasTouch) await page.touchscreen.tap(m!.x + m!.width / 2, m!.y + m!.height / 2);
  else await page.mouse.click(m!.x + m!.width / 2, m!.y + m!.height / 2);
}

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

test("speurtocht: een meerkeuzevraag beantwoorden geeft uitleg met verwijzing", async ({ page, hasTouch }) => {
  await page.goto("/bijbelreis#ruth");
  await page.getByRole("tab", { name: "Speurtocht" }).click();
  await page.locator("#qGo").click();
  for (let i = 0; i < 10; i++) {
    if (await page.locator(".opt").count()) break;
    await tikOpKaart(page, hasTouch);
    await page.locator("#qNext").click();
  }
  // Meerkeuze: één klik; volgorde: alle items aantikken.
  const n = (await page.locator("#qUndo").count()) ? await page.locator(".opt").count() : 1;
  for (let i = 0; i < n; i++) await page.locator(".opt:not(:has(.num))").first().click();
  await expect(page.locator(".feedback")).toBeVisible();
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
      await tikOpKaart(page, hasTouch);
      await expect(box.locator(".feedback")).toBeVisible();
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
