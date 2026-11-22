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

  test("strooizout: bestellen met twee producten, bezorgen, afhaalcode en bevestiging", async ({ page, request, baseURL }) => {
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
    await expect(zout.getByText("Bestel 4 zakken en bespaar € 2,00!")).toBeVisible();
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

    // Eén scherm. Leeg versturen: meldingen per veld (naam en mobiel nummer verplicht, e-mail niet).
    await expect(page.getByRole("heading", { name: "Bestellen" })).toBeVisible();
    await expect(page.getByLabel("Straat")).toHaveCount(0); // adres alleen bij bezorgen
    await page.getByRole("button", { name: /Reservering plaatsen/ }).click();
    await expect(page.getByText("Vul je naam in.")).toBeVisible();
    await expect(page.getByText("Vul je mobiele nummer in.")).toBeVisible();
    await expect(page.getByText("Vul een geldig e-mailadres in.")).toHaveCount(0);

    await page.getByLabel(/Bezorgen/).check();
    await page.getByLabel("Naam").fill("Proef Klant");
    await page.getByLabel("Mobiel nummer").fill("030 1234567");
    await page.getByLabel("Postcode").fill("3511 AA");
    await page.getByLabel("Huisnummer").fill("3");
    await expect(page.getByText("Op deze postcode bezorgen we helaas niet")).toBeVisible();
    await page.getByLabel("Postcode").fill("3992 AB");
    await page.getByLabel("Straat").fill("Proefstraat");
    await page.waitForTimeout(2600); // minimale invultijd (spambescherming)
    await page.getByRole("button", { name: /Reservering plaatsen/ }).click();
    await expect(page.getByText(/Vul een Nederlands mobiel nummer in/)).toBeVisible();
    const mobiel = `+31 6 ${String(Date.now()).slice(-8, -4)} ${String(Date.now()).slice(-4)}`;
    await page.getByLabel("Mobiel nummer").fill(mobiel);
    // Controle staat direct boven de knop; bezorgkosten € 0,50 per artikel.
    const controle = page.locator(".sz-controlelijst");
    await expect(controle).toContainText("Totaal € 21,98");
    await expect(controle).toContainText("Proefstraat 3, 3992 AB");

    // Dubbel klikken: precies één bestelling.
    await page.getByRole("button", { name: /Reservering plaatsen/ }).dblclick();
    await expect(page.getByRole("heading", { name: /Bedankt, Proef! Je reservering is geplaatst/ })).toBeVisible();
    const code = (await page.locator(".sz-codekaart__code").textContent())!.trim();
    expect(code).toMatch(/^H-\d{4,5}$/);
    await expect(page.getByRole("button", { name: /Kopieer code/ })).toBeVisible();

    const lijst = await (await request.get(`/api/strooizout/beheer/bestellingen?ronde=alle&zoek=${code}`, { headers })).json();
    expect(lijst.bestellingen).toHaveLength(1);
    expect(lijst.bestellingen[0]).toMatchObject({ totaal_cent: 2198, stuks: 3, levering: "bezorgen", afhaalcode: code });
    const opNummer = await (await request.get(`/api/strooizout/beheer/bestellingen?ronde=alle&zoek=${encodeURIComponent(mobiel)}`, { headers })).json();
    expect(opNummer.bestellingen).toHaveLength(1);

    // De bestelpagina blijft werken na herladen (code in het fragment) en het mandje is leeg.
    await page.reload();
    await expect(page.getByRole("heading", { name: /Je bestelling, Proef/ })).toBeVisible();
    await expect(page.locator(".sz-codekaart__code")).toHaveText(code);
    await expect(page.locator(".sz-mandknop__aantal")).toHaveText("0");
    // Terug in de webshop: link naar de laatste bestelling met code.
    await page.goto("/strooizout");
    await expect(page.getByRole("link", { name: new RegExp(`Je bestelling ${code} bekijken`) })).toBeVisible();

    await request.delete(`/api/strooizout/beheer/producten/${(await p.json()).id}`, { headers });
  });

  test("strooizout: staffelkorting bij 4 zakken, direct zichtbaar", async ({ page }) => {
    await page.goto("/strooizout");
    const zout = page.locator(".sz-product", { hasText: "Strooizout 25 kg" });
    await zout.getByRole("button", { name: /Eén meer/ }).click();
    await zout.getByRole("button", { name: /Eén meer/ }).click();
    await zout.getByRole("button", { name: "In mandje" }).click();
    await page.locator(".sz-mandknop").click();
    const lade = page.getByRole("dialog", { name: "Je mandje" });
    await expect(lade.locator(".sz-totaal")).toContainText("€ 26,97");
    await expect(lade.getByText("Bestel 4 zakken en bespaar € 2,00!")).toBeVisible();
    await lade.getByRole("button", { name: "Maak er 4 van" }).click();
    await expect(lade.locator(".sz-totaal")).toContainText("€ 33,96");
    await expect(lade.locator(".sz-korting")).toContainText("Staffelkorting");
    await expect(lade.locator(".sz-korting")).toContainText("€ 2,00");
    await expect(lade.getByText("Bestel 4 zakken")).toHaveCount(0);
    await lade.getByRole("button", { name: "Eén meer Strooizout 25 kg" }).click(); // 5 × 8,49
    await expect(lade.locator(".sz-totaal")).toContainText("€ 42,45");
    await lade.locator(".sz-regel").getByRole("button", { name: "Verwijderen" }).click();
  });

  test("strooizout: ophalen op de telefoon en annuleren door de klant", async ({ page }) => {
    await page.goto("/strooizout");
    await page.locator(".sz-product", { hasText: "Strooizout 25 kg" }).getByRole("button", { name: "In mandje" }).click();
    await page.locator(".sz-mandknop").click();
    await page.getByRole("button", { name: "Verder naar bestellen" }).click();
    await expect(page.getByRole("heading", { name: "Bestellen" })).toBeVisible();
    await page.getByLabel("Naam").fill("Mobiel Test");
    await page.getByLabel("Mobiel nummer").fill("06 1111 2222");
    await page.waitForTimeout(2600);
    await page.getByRole("button", { name: /Reservering plaatsen/ }).click();
    await expect(page.locator(".sz-codekaart__code")).toHaveText(/^H-\d{4,5}$/);
    await expect(page.getByText("Het adres verschijnt hier zodra je reservering is bevestigd.")).toBeVisible();
    await page.getByRole("button", { name: "Reservering annuleren" }).click();
    await page.getByRole("button", { name: "Ja, annuleren" }).click();
    await expect(page.getByRole("heading", { name: "Je reservering is geannuleerd" })).toBeVisible();
    // geen horizontale scroll op de telefoon
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("strooizout: beheer alleen met token; afhalen op code, betaalverzoek, status en CSV-export", async ({ page, request, baseURL }) => {
    // Eigen testbestellingen, zodat deze test niet afhangt van de andere.
    const plaats = async (nr: string) => {
      const r = await request.post("/api/strooizout/bestelling", {
        headers: { Origin: baseURL! },
        data: {
          idempotentie: `e2e-beheer-${nr}-${Date.now()}-abcdefgh`,
          regels: [{ product_id: 1, aantal: 1 }],
          levering: "ophalen",
          betaalwijze: "tikkie",
          klant: { naam: `Beheer Test ${nr}`, telefoon: `06123412${nr}` },
          akkoord: true,
          bedrijf_extra: "",
          invultijd_ms: 9000,
        },
      });
      expect(r.status()).toBe(201);
      return (await r.json()).bestelling;
    };
    const eerste = await plaats("01");
    const tweede = await plaats("02");

    await page.goto("/strooizout/beheer");
    await page.getByLabel("Beheercode").fill("verkeerde-code-0123456789");
    await page.getByRole("button", { name: "Inloggen" }).click();
    await expect(page.getByRole("alert")).toContainText("Geen toegang");
    await page.getByLabel("Beheercode").fill(TOKEN);
    await page.getByRole("button", { name: "Inloggen" }).click();
    await expect(page.getByText("Zakken verkocht")).toBeVisible();

    // Afhalen: code intikken (zonder H-), zakken en status direct zichtbaar, één keer uitgeven.
    await page.getByRole("tab", { name: "Afhalen" }).click();
    await page.getByLabel("Afhaalcode").fill(eerste.afhaalcode.slice(2));
    await page.getByRole("button", { name: "Zoeken" }).click();
    const kaart = page.locator(".bh-uitgifte");
    await expect(kaart.locator(".bh-uitgifte__code")).toHaveText(eerste.afhaalcode);
    await expect(kaart.getByText("Zakken")).toBeVisible();
    await expect(kaart.locator(".bh-uitgifte__cijfers strong")).toHaveText("1");
    await expect(kaart.locator(".bh-pil", { hasText: "Openstaand" })).toBeVisible();
    await kaart.getByRole("button", { name: /€ 8,99 ontvangen en uitgeven/ }).click();
    await expect(kaart.getByText(/Al uitgegeven op/)).toBeVisible();
    await expect(kaart.locator(".bh-pil", { hasText: "Betaald" })).toBeVisible();
    await expect(kaart.getByRole("button", { name: /uitgeven/i })).toHaveCount(0);
    // Nog eens zoeken: blijft ‘al uitgegeven’.
    await page.getByRole("button", { name: "Zoeken" }).click();
    await expect(page.locator(".bh-uitgifte").getByText(/Al uitgegeven op/)).toBeVisible();

    // Bestellingen: zoeken op code, betaalverzoek (kopiëren en markeren).
    await page.getByRole("combobox", { name: "Bestelronde" }).selectOption("alle");
    await page.getByRole("tab", { name: "Bestellingen" }).click();
    await page.getByRole("searchbox", { name: "Zoeken" }).fill(tweede.afhaalcode);
    await page.getByRole("button", { name: `Bestelling ${tweede.afhaalcode} openen` }).click();
    const paneel = page.getByRole("dialog");
    await expect(paneel.getByText("Openstaand bedrag")).toBeVisible();
    await expect(paneel.getByText("06 1234 1202")).toBeVisible();
    await paneel.getByRole("button", { name: "Markeer: betaalverzoek verstuurd" }).click();
    await expect(paneel.locator(".bh-pil", { hasText: "Betaalverzoek verstuurd" })).toBeVisible();
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
    expect(inhoud.split("\r\n")[0]).toContain("Bestelnummer;Afhaalcode;Datum;Ronde;Status");
    expect(inhoud).toContain(tweede.afhaalcode);

    for (const tab of ["Bezorgroute", "Producten", "Bestelrondes", "Financiën", "Instellingen", "Flyer en delen"]) {
      await page.getByRole("tab", { name: tab }).click();
      await expect(page.getByRole("heading", { level: 1, name: tab })).toBeVisible();
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
