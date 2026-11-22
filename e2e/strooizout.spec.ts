// Strooizout voor de buurt: de bestelroute als echte gebruiker (desktop en telefoon), het beheer, de CSV-export en
// toegankelijkheid. Draait tegen de lokale Worker met een eigen D1 (playwright.config.ts). De tests die bestellingen of
// rondes aanmaken, slaan zichzelf over tegen productie (E2E_BASE_URL).

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const TOKEN = "e2e-admin-token-0123456789abcdef";
const schrijvend = !process.env.E2E_BASE_URL;

async function zorgVoorOpenRonde(request: APIRequestContext, baseURL: string) {
  const headers = { Authorization: `Bearer ${TOKEN}`, Origin: baseURL };
  const r = await request.get("/api/strooizout/beheer/rondes", { headers });
  const { rondes } = await r.json();
  if (!rondes.some((x: { status: string }) => x.status === "open")) {
    const n = await request.post("/api/strooizout/beheer/rondes", { headers, data: { naam: "E2E-ronde" } });
    expect(n.status()).toBe(201);
  }
}

async function axe(page: Page) {
  const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  return res.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
}

test.describe("Strooizout voor de buurt", () => {
  test.beforeEach(async ({ request, baseURL }) => {
    test.skip(!schrijvend, "maakt bestellingen aan; niet tegen productie");
    await zorgVoorOpenRonde(request, baseURL!);
  });

  test("strooizout: bestellen met twee producten, bezorgen en bevestiging", async ({ page, request, baseURL }) => {
    // Een tweede product (fictief) zodat er meerdere producten in één bestelling komen.
    const headers = { Authorization: `Bearer ${TOKEN}`, Origin: baseURL! };
    const naam = `IJskrabber e2e ${Date.now()}`;
    const p = await request.post("/api/strooizout/beheer/producten", {
      headers,
      data: { naam, status: "actief", prijs_cent: 250, beschrijving: "Testproduct.", afbeelding: "/strooizout/beeld/sneeuwschep.webp", gewicht_gram: 100 },
    });
    expect(p.status()).toBe(201);

    await page.goto("/strooizout");
    await expect(page.getByRole("heading", { level: 1, name: "Strooizout voor de buurt" })).toBeVisible();
    await expect(page.getByText("Bestellen kan nu")).toBeVisible();

    const zout = page.locator(".sz-product", { hasText: "Strooizout 25 kg" });
    await zout.getByRole("button", { name: /Eén meer/ }).click();
    await zout.getByRole("button", { name: "In mandje" }).click();
    const krabber = page.locator(".sz-product", { hasText: naam });
    await krabber.getByRole("button", { name: "In mandje" }).click();

    // Mandje: aantal aanpassen, product verwijderen en terugzetten, totaal direct zichtbaar.
    await page.locator(".sz-mandknop").click();
    const lade = page.getByRole("dialog", { name: "Je mandje" });
    await expect(lade.locator(".sz-totaal")).toContainText("€ 20,48"); // 2 × 8,99 + 2,50
    await lade.getByRole("button", { name: `Eén meer ${naam}` }).click();
    await expect(lade.locator(".sz-totaal")).toContainText("€ 22,98");
    await lade.locator(".sz-regel", { hasText: naam }).getByRole("button", { name: "Verwijderen" }).click();
    await expect(lade.locator(".sz-totaal")).toContainText("€ 17,98");
    await page.keyboard.press("Escape");
    await krabber.getByRole("button", { name: "In mandje" }).click();
    await page.locator(".sz-mandknop").click();
    await lade.getByRole("button", { name: "Verder naar bestellen" }).click();

    // Formuliervalidatie: leeg versturen geeft meldingen per veld.
    await expect(page.getByRole("heading", { name: "Bestellen" })).toBeVisible();
    await page.getByRole("button", { name: "Controleer je bestelling" }).click();
    await expect(page.getByText("Vul je naam in.")).toBeVisible();
    await expect(page.getByText("Vul een geldig e-mailadres in.")).toBeVisible();
    await expect(page.getByText("Ga akkoord met de voorwaarden.")).toBeVisible();

    // Bezorgen: + € 0,50 per zak strooizout (standaardtarief, ook voor het testproduct).
    await page.getByLabel(/Bezorgen/).check();
    await page.getByLabel("Naam").fill("Proef Klant");
    const email = `proef+${Date.now()}@example.com`;
    await page.getByLabel("E-mailadres").fill(email);
    await page.getByLabel("Telefoonnummer").fill("06 98765432");
    await page.getByLabel("Postcode").fill("3511 AA");
    await page.getByLabel("Huisnummer").fill("3");
    await expect(page.getByText("Op deze postcode bezorgen we helaas niet")).toBeVisible();
    await page.getByLabel("Postcode").fill("3992 AB");
    await page.getByLabel("Straat").fill("Proefstraat");
    await page.getByRole("checkbox", { name: /akkoord/ }).check();
    const overzicht = page.getByRole("complementary", { name: "Overzicht" });
    await expect(overzicht.getByText("€ 1,50")).toBeVisible();
    await expect(overzicht.getByText("€ 21,98")).toBeVisible();
    await page.waitForTimeout(2600); // minimale invultijd (spambescherming)
    await page.getByRole("button", { name: "Controleer je bestelling" }).click();

    // Controleren en dubbel klikken: precies één bestelling.
    await expect(page.getByRole("heading", { name: "Controleer je reservering" })).toBeVisible();
    await expect(page.getByText("Proefstraat 3, 3992 AB Houten")).toBeVisible();
    const knop = page.getByRole("button", { name: /Definitief reserveren/ });
    await knop.dblclick();
    await expect(page.getByRole("heading", { name: /Bedankt, Proef! Je reservering is geplaatst/ })).toBeVisible();
    const nummer = (await page.locator(".sz-nummer").textContent())!.trim();
    expect(nummer).toMatch(/^SZ-\d{4}$/);
    await expect(page.getByText("Totaal")).toBeVisible();

    const lijst = await (await request.get(`/api/strooizout/beheer/bestellingen?ronde=alle&zoek=${nummer}`, { headers })).json();
    expect(lijst.bestellingen).toHaveLength(1);
    expect(lijst.bestellingen[0]).toMatchObject({ totaal_cent: 2198, stuks: 3, levering: "bezorgen" });
    const alleVanKlant = await (await request.get(`/api/strooizout/beheer/bestellingen?ronde=alle&zoek=${encodeURIComponent(email)}`, { headers })).json();
    expect(alleVanKlant.bestellingen).toHaveLength(1);

    // De bestelpagina blijft werken na herladen (code in het fragment) en het mandje is leeg.
    await page.reload();
    await expect(page.getByRole("heading", { name: /Je bestelling, Proef/ })).toBeVisible();
    await expect(page.locator(".sz-mandknop__aantal")).toHaveText("0");

    // Testproduct opruimen (gearchiveerd, want besteld).
    await request.delete(`/api/strooizout/beheer/producten/${(await p.json()).id}`, { headers });
  });

  test("strooizout: ophalen op de telefoon en annuleren door de klant", async ({ page }) => {
    await page.goto("/strooizout");
    await page.locator(".sz-product", { hasText: "Strooizout 25 kg" }).getByRole("button", { name: "In mandje" }).click();
    await page.locator(".sz-mandknop").click();
    await page.getByRole("button", { name: "Verder naar bestellen" }).click();
    await expect(page.getByRole("heading", { name: "Bestellen" })).toBeVisible();
    await page.getByLabel("Naam").fill("Mobiel Test");
    await page.getByLabel("E-mailadres").fill("mobiel@example.com");
    await page.getByLabel("Telefoonnummer").fill("0611112222");
    await page.getByRole("checkbox", { name: /akkoord/ }).check();
    await page.waitForTimeout(2600);
    await page.getByRole("button", { name: "Controleer je bestelling" }).click();
    await page.getByRole("button", { name: /Definitief reserveren/ }).click();
    await expect(page.getByText("Het adres verschijnt hier zodra je reservering is bevestigd.")).toBeVisible();
    await page.getByRole("button", { name: "Reservering annuleren" }).click();
    await page.getByRole("button", { name: "Ja, annuleren" }).click();
    await expect(page.getByRole("heading", { name: "Je reservering is geannuleerd" })).toBeVisible();
    // geen horizontale scroll op de telefoon
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("strooizout: beheer alleen met token; status, betaling en CSV-export", async ({ page, request, baseURL }) => {
    // Eigen testbestelling, zodat deze test niet afhangt van de andere.
    const r = await request.post("/api/strooizout/bestelling", {
      headers: { Origin: baseURL! },
      data: {
        idempotentie: `e2e-beheer-${Date.now()}-abcdefgh`,
        regels: [{ product_id: 1, aantal: 1 }],
        levering: "ophalen",
        betaalwijze: "bij_ontvangst",
        klant: { naam: "Beheer Test", email: "beheer@example.com", telefoon: "0612121212" },
        akkoord: true,
        bedrijf_extra: "",
        invultijd_ms: 9000,
      },
    });
    expect(r.status()).toBe(201);
    const { bestelling } = await r.json();
    await page.goto("/strooizout/beheer");
    await page.getByLabel("Beheercode").fill("verkeerde-code-0123456789");
    await page.getByRole("button", { name: "Inloggen" }).click();
    await expect(page.getByRole("alert")).toContainText("Geen toegang");
    await page.getByLabel("Beheercode").fill(TOKEN);
    await page.getByRole("button", { name: "Inloggen" }).click();
    await expect(page.getByText("Zakken verkocht")).toBeVisible();

    await page.getByRole("combobox", { name: "Bestelronde" }).selectOption("alle");
    await page.getByRole("tab", { name: "Bestellingen" }).click();
    await page.getByRole("searchbox", { name: "Zoeken" }).fill(bestelling.nummer);
    await page.getByRole("button", { name: bestelling.nummer }).click();
    const paneel = page.getByRole("dialog");
    await paneel.getByRole("button", { name: "Bevestigen", exact: true }).click();
    await expect(paneel.locator(".bh-pil", { hasText: "Bevestigd" })).toBeVisible();
    await paneel.getByLabel("Het geld is echt ontvangen").check();
    await paneel.getByRole("button", { name: "Registreren", exact: true }).click();
    await expect(paneel.locator(".bh-pil", { hasText: "Betaald" })).toBeVisible();
    await paneel.getByRole("button", { name: "Sluiten" }).click();

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "CSV bestellingen" }).click()]);
    const pad = await download.path();
    const { readFileSync } = await import("node:fs");
    const inhoud = readFileSync(pad!, "utf8");
    expect(inhoud.split("\r\n")[0]).toContain("Bestelnummer;Datum;Ronde;Status");
    expect(inhoud).toMatch(/SZ-\d{4};/);

    for (const tab of ["Bezorgroute", "Producten", "Bestelrondes", "Financiën", "Instellingen", "Flyer en delen"]) {
      await page.getByRole("tab", { name: tab }).click();
      await expect(page.getByRole("heading", { level: 1, name: tab === "Flyer en delen" ? "Flyer en delen" : tab })).toBeVisible();
    }

    // Uitloggen sluit de toegang weer af.
    await page.getByRole("button", { name: "Uitloggen" }).click();
    await expect(page.getByLabel("Beheercode")).toBeVisible();
  });
});

test("strooizout: beheer-API weigert zonder token", async ({ request }) => {
  expect((await request.get("/api/strooizout/beheer/overzicht")).status()).toBe(401);
  expect((await request.get("/api/strooizout/beheer/export/bestellingen.csv")).status()).toBe(401);
});

test("strooizout: korte link en beheerpagina niet geïndexeerd", async ({ request }) => {
  const kort = await request.get("/zout", { maxRedirects: 0 });
  expect(kort.status()).toBe(301);
  expect(kort.headers().location).toMatch(/\/strooizout$/);
  const beheer = await request.get("/strooizout/beheer");
  expect(beheer.headers()["x-robots-tag"]).toContain("noindex");
});

for (const pad of ["/strooizout", "/strooizout/bestellen", "/strooizout/privacy", "/strooizout/voorwaarden", "/strooizout/beheer"]) {
  test(`toegankelijkheid strooizout ${pad}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(pad);
    await page.waitForTimeout(700);
    expect(await axe(page)).toEqual([]);
  });
}
