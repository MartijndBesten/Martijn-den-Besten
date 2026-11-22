// Strooizout voor de buurt: bestellen op de homepage als echte gebruiker (desktop en telefoon), de QR-route aan de weg,
// het beheer (afhalen op code, voorraad, betaalverzoek, CSV) en toegankelijkheid. Draait tegen de lokale Worker met een
// eigen D1 (playwright.config.ts). Tests die bestellingen aanmaken, slaan zichzelf over tegen productie (E2E_BASE_URL).

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const TOKEN = "e2e-admin-token-0123456789abcdef";
const schrijvend = !process.env.E2E_BASE_URL;

async function voorbereiden(request: APIRequestContext, baseURL: string) {
  const headers = { Authorization: `Bearer ${TOKEN}`, Origin: baseURL };
  const r = await request.get("/api/strooizout/beheer/rondes", { headers });
  const { rondes } = await r.json();
  if (!rondes.some((x: { status: string }) => x.status === "open")) {
    expect((await request.post("/api/strooizout/beheer/rondes", { headers, data: { naam: "E2E-ronde" } })).status()).toBe(201);
  }
  // Ruime verwachte voorraad, zodat herhaalde testruns niet uitverkopen; de voorraadregels zelf zitten in de unit-tests.
  const v = (await (await request.get("/api/strooizout/beheer/voorraad", { headers })).json()).voorraad.find((x: { id: number }) => x.id === 1);
  if ((v?.verwacht ?? 0) < 1000) await request.post("/api/strooizout/beheer/voorraad/1", { headers, data: { verwacht: 1000 } });
}

async function ontvang(request: APIRequestContext, baseURL: string, n: number) {
  const r = await request.post("/api/strooizout/beheer/voorraad/1", { headers: { Authorization: `Bearer ${TOKEN}`, Origin: baseURL }, data: { ontvangen_erbij: n } });
  expect(r.status()).toBe(200);
}

async function axe(page: Page) {
  const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  return res.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
}

test.describe("Strooizout voor de buurt", () => {
  test.beforeEach(async ({ request, baseURL }) => {
    test.skip(!schrijvend, "maakt bestellingen aan; niet tegen productie");
    await voorbereiden(request, baseURL!);
  });

  test("strooizout: bestellen op de homepage, staffel, bezorgen vanaf 2 zakken, afhaalcode", async ({ page, request, baseURL }) => {
    const headers = { Authorization: `Bearer ${TOKEN}`, Origin: baseURL! };
    await page.goto("/strooizout");
    await expect(page.getByRole("heading", { level: 1, name: "Strooizout uit je eigen buurt." })).toBeVisible();
    await expect(page.getByText("Hou je buurt veilig. Strooi bewust.").first()).toBeVisible();
    await expect(page.getByText("Geen aparte rit naar de bouwmarkt.", { exact: false }).first()).toBeVisible();
    const kaart = page.locator(".sz-bestelkaart");
    await expect(kaart.getByRole("heading", { name: "25 kg strooizout" })).toBeVisible();
    await expect(kaart.locator(".sz-bestelkaart__staffel")).toContainText(/1\szak\s€\s10,49.*2–3\s€\s9,49.*vanaf\s4\s€\s8,99/);
    await expect(kaart.locator(".sz-beschikbaar")).toContainText("Op voorraad");
    await expect(page.getByText("Strooi ook eens bij een buur die dat zelf niet kan.")).toBeVisible();
    await expect(page.getByText("Neem er eentje mee voor je buren.")).toBeVisible();
    // de emmer van 5 kg is zichtbaar maar niet te bestellen; delen en gebruikstip staan op de pagina
    await expect(page.locator(".sz-binnenkort")).toContainText("Binnenkort");
    await expect(page.locator(".sz-binnenkort")).toContainText("€ 7,49");
    await expect(page.getByRole("button", { name: "Deel met je buren" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Strooi bewust" })).toBeVisible();

    // standaard 2 zakken (voordelige keuze): € 18,98, je bespaart € 2,00
    await expect(kaart.getByRole("radio", { name: /2 zakken/ })).toBeChecked();
    await expect(kaart.locator(".sz-bestelkaart__totaal strong")).toHaveText("€ 18,98");
    await expect(kaart.locator(".sz-bestelkaart__totaal small")).toContainText("je bespaart € 2,00");
    // 1 zak: € 10,49, bezorgen kan niet
    await kaart.locator(".sz-aantalkeuze", { hasText: "1 zak" }).click();
    await expect(kaart.locator(".sz-bestelkaart__totaal strong")).toHaveText("€ 10,49");
    await expect(kaart.getByRole("radio", { name: "Bezorgen" })).toBeDisabled();
    await expect(kaart.getByText(/Bezorgen kan vanaf 2 zakken/)).toBeVisible();
    // ieder aantal: 3 zakken € 9,49 per zak
    const meer = kaart.getByRole("button", { name: /Eén meer/ });
    await meer.click();
    await meer.click();
    await expect(kaart.locator(".sz-bestelkaart__totaal strong")).toHaveText("€ 28,47");
    await expect(kaart.getByRole("radio", { name: "Bezorgen" })).toBeEnabled();
    // 4 zakken: € 8,99 voor alle zakken, je bespaart € 6,00
    await kaart.locator(".sz-aantalkeuze", { hasText: "4 zakken" }).click();
    await expect(kaart.locator(".sz-bestelkaart__totaal strong")).toHaveText("€ 35,96");
    await expect(kaart.locator(".sz-bestelkaart__totaal small")).toContainText("je bespaart € 6,00");
    // bezorgen: € 2,00 per bezorging erbij
    await kaart.locator(".sz-segment label", { hasText: "Bezorgen" }).click();
    await expect(kaart.locator(".sz-bestelkaart__totaal strong")).toHaveText("€ 37,96");

    // Bestellen: gegevens op dezelfde pagina; adresvelden alleen bij bezorgen
    await kaart.getByRole("button", { name: "Bestellen", exact: true }).click();
    await expect(kaart.getByLabel("Straat")).toBeVisible();
    await kaart.getByRole("button", { name: /Reservering plaatsen/ }).click();
    await expect(kaart.getByText("Vul je naam in.")).toBeVisible();
    await expect(kaart.getByText("Vul je mobiele nummer in.")).toBeVisible();
    await kaart.getByLabel("Postcode").fill("3511 AA");
    await expect(kaart.getByText(/alleen binnen de rondweg van Houten/)).toBeVisible();
    await kaart.getByLabel("Postcode").fill("3991 CD");
    await expect(kaart.getByText(/alleen binnen de rondweg van Houten/)).toBeVisible();
    await kaart.getByLabel("Postcode").fill("3992 KT");
    await kaart.getByLabel("Huisnummer").fill("3");
    await kaart.getByLabel("Straat").fill("Proefstraat");
    await kaart.getByLabel("Naam").fill("Proef Klant");
    await kaart.getByLabel("Mobiel nummer").fill("030 1234567");
    await page.waitForTimeout(2600); // minimale invultijd (spambescherming)
    await kaart.getByRole("button", { name: /Reservering plaatsen/ }).click();
    await expect(kaart.getByText(/Vul een Nederlands mobiel nummer in/)).toBeVisible();
    const mobiel = `+31 6 ${String(Date.now()).slice(-8, -4)} ${String(Date.now()).slice(-4)}`;
    await kaart.getByLabel("Mobiel nummer").fill(mobiel);
    // dubbel klikken: precies één bestelling
    await kaart.getByRole("button", { name: "Reservering plaatsen · € 37,96" }).dblclick();

    await expect(page.getByRole("heading", { name: /Bedankt, Proef! Je reservering is geplaatst/ })).toBeVisible();
    const code = (await page.locator(".sz-codekaart__code").textContent())!.trim();
    expect(code).toMatch(/^H-\d{4,5}$/);
    await expect(page.getByRole("button", { name: /Kopieer code/ })).toBeVisible();
    const lijst = await (await request.get(`/api/strooizout/beheer/bestellingen?ronde=alle&zoek=${encodeURIComponent(mobiel)}`, { headers })).json();
    expect(lijst.bestellingen).toHaveLength(1);
    expect(lijst.bestellingen[0]).toMatchObject({ afhaalcode: code, totaal_cent: 3796, stuks: 4, levering: "bezorgen", kanaal: "web" });

    // bestelpagina blijft werken na herladen; homepage linkt naar de laatste bestelling
    await page.reload();
    await expect(page.locator(".sz-codekaart__code")).toHaveText(code);
    await page.goto("/strooizout");
    await expect(page.getByRole("link", { name: new RegExp(`Je bestelling ${code} bekijken`) })).toBeVisible();
  });

  test("strooizout: 1 zak ophalen op de telefoon en annuleren door de klant", async ({ page }) => {
    await page.goto("/strooizout");
    const kaart = page.locator(".sz-bestelkaart");
    await kaart.locator(".sz-aantalkeuze", { hasText: "1 zak" }).click();
    await kaart.getByRole("button", { name: "Bestellen", exact: true }).click();
    await expect(kaart.getByLabel("Straat")).toHaveCount(0);
    await kaart.getByLabel("Naam").fill("Mobiel Test");
    await kaart.getByLabel("Mobiel nummer").fill("06 1111 2222");
    await page.waitForTimeout(2600);
    await kaart.getByRole("button", { name: "Reservering plaatsen · € 10,49" }).click();
    await expect(page.locator(".sz-codekaart__code")).toHaveText(/^H-\d{4,5}$/);
    await expect(page.getByText("Het adres verschijnt hier zodra je reservering is bevestigd.")).toBeVisible();
    await page.getByRole("button", { name: "Reservering annuleren" }).click();
    await page.getByRole("button", { name: "Ja, annuleren" }).click();
    await expect(page.getByRole("heading", { name: "Je reservering is geannuleerd" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("strooizout: QR aan de weg geeft een code; uitgifte pas na bevestiging door de verkoper", async ({ page, request, baseURL }) => {
    await ontvang(request, baseURL!, 4);
    await page.goto("/strooizout/aan-de-weg");
    await expect(page.getByRole("heading", { name: "Strooizout — 25 kg" })).toBeVisible();
    await page.getByRole("button", { name: /Eén meer/ }).click();
    await expect(page.locator(".sz-straat__totaal strong")).toHaveText("€ 18,98");
    await page.getByRole("button", { name: "Code ophalen" }).click();
    await expect(page.getByText("Vul je mobiele nummer in, bijvoorbeeld 06 1234 5678.")).toBeVisible();
    await page.getByLabel("Mobiel nummer").fill("06 5555 4444");
    await page.getByRole("button", { name: "Code ophalen" }).click();
    await expect(page.locator(".sz-codekaart__code")).toHaveText(/^H-\d{4,5}$/);
    await expect(page.getByText(/Laat deze code zien aan de verkoper en betaal € 18,98/)).toBeVisible();
    const code = (await page.locator(".sz-codekaart__code").textContent())!.trim();
    // niet automatisch betaald of uitgegeven
    const b = await (await request.get(`/api/strooizout/beheer/afhalen/${code}`, { headers: { Authorization: `Bearer ${TOKEN}` } })).json();
    expect(b.bestelling).toMatchObject({ betaalstatus: "open", uitgegeven: false, zakken: 2 });
  });

  test("strooizout: beheer alleen met token; voorraad, afhalen op code, betaalverzoek en CSV", async ({ page, request, baseURL }) => {
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

    // Voorraad: ontvangst bevestigen
    await page.getByRole("tab", { name: "Voorraad" }).click();
    await page.getByLabel("Ontvangst bevestigen").first().fill("3");
    await page.getByRole("button", { name: "Bevestigen" }).first().click();
    await expect(page.getByText("3 ontvangen")).toBeVisible();

    // Afhalen: code zonder H-, zakken en status direct zichtbaar, één keer uitgeven
    await page.getByRole("tab", { name: "Afhalen" }).click();
    await page.getByLabel("Afhaalcode").fill(eerste.afhaalcode.slice(2));
    await page.getByRole("button", { name: "Zoeken" }).click();
    const kaart = page.locator(".bh-uitgifte");
    await expect(kaart.locator(".bh-uitgifte__code")).toHaveText(eerste.afhaalcode);
    await expect(kaart.locator(".bh-uitgifte__cijfers strong")).toHaveText("1");
    await expect(kaart.locator(".bh-pil", { hasText: "Openstaand" })).toBeVisible();
    await kaart.getByRole("button", { name: /€ 10,49 ontvangen en uitgeven/ }).click();
    await expect(kaart.getByText(/Al uitgegeven op/)).toBeVisible();
    await expect(kaart.locator(".bh-pil", { hasText: "Betaald" })).toBeVisible();
    await expect(kaart.getByRole("button", { name: /uitgeven/i })).toHaveCount(0);

    // Bestellingen: zoeken op code, betaalverzoek markeren, betaling registreren
    await page.getByRole("combobox", { name: "Bestelronde" }).selectOption("alle");
    await page.getByRole("tab", { name: "Bestellingen" }).click();
    await page.getByRole("searchbox", { name: "Zoeken" }).fill(tweede.afhaalcode);
    await page.getByRole("button", { name: `Bestelling ${tweede.afhaalcode} openen` }).click();
    const paneel = page.getByRole("dialog");
    await expect(paneel.locator(".bh-kopieer", { hasText: "06 1234 1202" })).toBeVisible();
    await paneel.getByRole("button", { name: "Markeer: betaalverzoek verstuurd" }).click();
    await expect(paneel.locator(".bh-pil", { hasText: "Betaalverzoek verstuurd" })).toBeVisible();
    await paneel.getByLabel("Het geld is echt ontvangen").check();
    await paneel.getByRole("button", { name: "Registreren", exact: true }).click();
    await expect(paneel.locator(".bh-pil", { hasText: "Betaald" })).toBeVisible();
    await paneel.getByRole("button", { name: "Sluiten" }).click();

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "CSV bestellingen" }).click()]);
    const { readFileSync } = await import("node:fs");
    const inhoud = readFileSync((await download.path())!, "utf8");
    expect(inhoud.split("\r\n")[0]).toContain("Bestelnummer;Afhaalcode;Datum;Ronde;Status");
    expect(inhoud).toContain(tweede.afhaalcode);

    for (const tab of ["Bezorgroute", "Producten", "Bestelrondes", "Financiën", "Instellingen", "Flyer en delen"]) {
      await page.getByRole("tab", { name: tab }).click();
      await expect(page.getByRole("heading", { level: 1, name: tab })).toBeVisible();
    }
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

for (const pad of ["/strooizout", "/strooizout/aan-de-weg", "/strooizout/privacy", "/strooizout/voorwaarden", "/strooizout/beheer"]) {
  test(`toegankelijkheid strooizout ${pad}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(pad);
    await page.waitForTimeout(700);
    expect(await axe(page)).toEqual([]);
  });
}
