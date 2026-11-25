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

type BeheerProduct = { id: number; slug: string };
const TIEN_KILO = ["strooizout-10-kg-eigen-emmer", "strooizout-10-kg-met-emmer"];

/** De varianten van 10 kg op ‘binnenkort’ (zoals ze starten) of ‘actief’ zetten. */
async function zetTienKilo(request: APIRequestContext, baseURL: string, status: "binnenkort" | "actief") {
  const headers = { Authorization: `Bearer ${TOKEN}`, Origin: baseURL };
  const { producten } = (await (await request.get("/api/strooizout/beheer/producten", { headers })).json()) as { producten: BeheerProduct[] };
  for (const p of producten.filter((x) => TIEN_KILO.includes(x.slug))) {
    expect((await request.put(`/api/strooizout/beheer/producten/${p.id}/status`, { headers, data: { status } })).status()).toBe(200);
  }
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
    await expect(page.getByText("Hou je buurt veilig.", { exact: true })).toBeVisible();
    await expect(page.locator(".wn-vanaf")).toContainText("€ 8,99");
    const kaart = page.locator(".sz-bestelkaart");
    await expect(kaart.getByRole("heading", { name: "25 kg strooizout" })).toBeVisible();
    // prijstreden in één rail: 1 zak, 2–3 zakken, 4 of meer
    const trede = (naam: RegExp) => kaart.getByRole("button", { name: naam });
    await expect(trede(/1 zak\s*€ 9,99 per zak/)).toHaveAttribute("aria-pressed", "true");
    await expect(trede(/2–3 zakken\s*€ 9,49 per zak/)).toBeVisible();
    await expect(trede(/4 of meer\s*€ 8,99 per zak/)).toBeVisible();
    await expect(kaart.locator(".sz-beschikbaar")).toContainText("Op voorraad");
    await expect(page.getByRole("heading", { name: "Een beetje zout. Een beetje aandacht." })).toBeVisible();
    await expect(page.getByText("Strooi ook bij een buur die dat zelf niet kan. En zwaai eens naar elkaar!")).toBeVisible();
    await expect(page.locator(".wn-stappen__lijst li")).toHaveText(["Bestel online", "Ontvang je bevestiging", "Haal op met je afhaalcode of laat bezorgen"]);
    // betalen gaat met een betaalverzoek; contant betalen wordt nergens genoemd
    await expect(page.getByText(/contant/i)).toHaveCount(0);
    // delen en de gebruikstip staan op de pagina
    await expect(page.getByRole("button", { name: "Deel met je buren" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Strooi bewust" })).toBeVisible();
    // de kop staat niet vast: hij schuift nooit over de inhoud
    expect(await page.locator(".sz-kop").evaluate((el) => getComputedStyle(el).position)).not.toMatch(/sticky|fixed/);

    // standaard 1 zak (besluit Martijn): € 9,99; het totaal staat er precies één keer
    const totaal = kaart.locator(".sz-bestelkaart__totaal strong");
    await expect(totaal).toHaveText("€ 9,99");
    await expect(kaart.locator(".sz-bestelkaart__totaal")).toHaveCount(1);
    // 2 zakken via de staffel: € 18,98, je bespaart € 1,00
    await trede(/^2–3 zakken/).click();
    await expect(totaal).toHaveText("€ 18,98");
    await expect(kaart.locator(".sz-bestelkaart__totaal .wn-bespaar")).toContainText("je bespaart € 1,00");
    // terug naar 1 zak: bezorgen kan niet; geen zetje bij 1 (de staffel staat erboven)
    await trede(/^1 zak/).click();
    await expect(totaal).toHaveText("€ 9,99");
    await expect(kaart.getByRole("radio", { name: /Bezorgen/ })).toBeDisabled();
    await expect(kaart.locator(".wn-lever")).toContainText("vanaf 2 zakken");
    await expect(kaart.locator(".wn-tip")).toHaveAttribute("data-aan", "false");
    // ieder aantal: 3 zakken € 9,49 per zak, zetje naar 4
    const meer = kaart.getByRole("button", { name: /Eén meer/ });
    await meer.click();
    await meer.click();
    await expect(totaal).toHaveText("€ 28,47");
    await expect(kaart.getByRole("radio", { name: /Bezorgen/ })).toBeEnabled();
    // 4 zakken: € 8,99 voor alle zakken, je bespaart € 4,00
    await kaart.getByRole("button", { name: "Maak er 4 van" }).click();
    await expect(trede(/4 of meer/)).toHaveAttribute("aria-pressed", "true");
    await expect(totaal).toHaveText("€ 35,96");
    await expect(kaart.locator(".sz-bestelkaart__totaal .wn-bespaar")).toContainText("je bespaart € 4,00");
    // bezorgen: vanaf 4 zakken gratis (besluit Martijn 25-11-2026), dus het totaal blijft € 35,96
    await kaart.locator(".wn-lever label", { hasText: "Bezorgen" }).click();
    await expect(totaal).toHaveText("€ 35,96");
    await expect(kaart.getByText("We bezorgen binnen de rondweg van Houten.")).toBeVisible();

    // Bestellen: gegevens op dezelfde pagina; adresvelden alleen bij bezorgen
    await kaart.getByRole("button", { name: "Bestellen", exact: true }).click();
    // in stap 2 is er één bestelknop: geen balk onderin
    await expect(page.locator(".wn-plakbalk")).toBeHidden();
    await expect(kaart.getByLabel("Straat")).toBeVisible();
    await kaart.getByRole("button", { name: /Bestellen met betalingsverplichting/ }).click();
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
    await kaart.getByRole("button", { name: /Bestellen met betalingsverplichting/ }).click();
    await expect(kaart.getByText(/Vul een Nederlands mobiel nummer in/)).toBeVisible();
    const mobiel = `+31 6 ${String(Date.now()).slice(-8, -4)} ${String(Date.now()).slice(-4)}`;
    await kaart.getByLabel("Mobiel nummer").fill(mobiel);
    // dubbel klikken: precies één bestelling
    await expect(kaart.locator(".sz-bestelkaart__totaal")).toHaveCount(1);
    await expect(kaart.locator(".sz-bestelkaart__totaal strong")).toHaveText("€ 35,96");
    await kaart.getByRole("button", { name: "Bestellen met betalingsverplichting", exact: true }).dblclick();

    await expect(page.getByRole("heading", { name: /Bedankt, Proef! Je bestelling is geplaatst/ })).toBeVisible();
    const code = (await page.locator(".sz-codekaart__code").textContent())!.trim();
    expect(code).toMatch(/^H-\d{4,5}$/);
    await expect(page.getByRole("button", { name: /Kopieer code/ })).toBeVisible();
    const lijst = await (await request.get(`/api/strooizout/beheer/bestellingen?ronde=alle&zoek=${encodeURIComponent(mobiel)}`, { headers })).json();
    expect(lijst.bestellingen).toHaveLength(1);
    expect(lijst.bestellingen[0]).toMatchObject({ afhaalcode: code, totaal_cent: 3596, stuks: 4, levering: "bezorgen", kanaal: "web" });

    // bestelpagina blijft werken na herladen; homepage linkt naar de laatste bestelling
    await page.reload();
    await expect(page.locator(".sz-codekaart__code")).toHaveText(code);
    await page.goto("/strooizout");
    await expect(page.getByRole("link", { name: new RegExp(`Je bestelling ${code} bekijken`) })).toBeVisible();
  });

  test("strooizout: een variant die in het beheer op ‘binnenkort’ staat, toont prijs en uitleg maar geen bestelknop", async ({ page, request, baseURL }) => {
    await zetTienKilo(request, baseURL!, "binnenkort");
    try {
    await page.goto("/strooizout");
    const kaart = page.locator(".sz-bestelkaart");
    const keuzes = kaart.getByRole("radiogroup", { name: "Kies je verpakking" });
    await expect(keuzes.getByRole("radio")).toHaveCount(3);
    await expect(keuzes.locator(".wn-keuze__optie")).toHaveText([/25\skg\s*zak\s*vanaf € 8,99/, /10\skg\s*in je eigen emmer\s*€ 5,49\s*Binnenkort/, /10\skg\s*met emmer\s*€ 6,49\s*Binnenkort/]);
    await expect(keuzes.getByRole("radio", { name: /25\skg/ })).toBeChecked();
    // de variant kiezen toont de informatie, maar bestellen kan niet
    await keuzes.locator(".wn-keuze__optie", { hasText: "eigen emmer" }).click();
    await expect(kaart.getByRole("heading", { name: "10 kg strooizout in je eigen emmer" })).toBeVisible();
    await expect(kaart.locator(".sz-beschikbaar")).toHaveText("Binnenkort te bestellen");
    await expect(kaart.getByText("Neem je eigen emmer mee: we wegen 10 kg voor je af.")).toBeVisible();
    await expect(kaart.locator(".wn-straks__prijs")).toHaveText(/€ 5,49 per 10\skg · alleen afhalen/);
    await expect(kaart.getByText("Nog niet te bestellen. Zodra het klaarstaat, bestel je het hier.")).toBeVisible();
    await expect(kaart.getByRole("button", { name: "Bestellen", exact: true })).toHaveCount(0);
    await expect(kaart.locator(".wn-teller")).toHaveCount(0);
    await expect(page.locator(".wn-scene")).toHaveAttribute("data-soort", "emmer-open");
    await keuzes.locator(".wn-keuze__optie", { hasText: "met emmer" }).click();
    await expect(kaart.getByRole("heading", { name: "10 kg strooizout met emmer" })).toBeVisible();
    await expect(kaart.locator(".wn-straks__prijs")).toHaveText(/€ 6,49 per 10\skg$/);
    await expect(page.locator(".wn-scene")).toHaveAttribute("data-soort", "emmer");
    expect(await axe(page)).toEqual([]);
    // terug naar de zak: de bestaande bestelkaart met staffel
    await kaart.getByRole("button", { name: /Bestel nu 25\skg/ }).click();
    await expect(kaart.getByRole("heading", { name: "25 kg strooizout" })).toBeVisible();
    await expect(kaart.locator(".sz-bestelkaart__totaal strong")).toHaveText("€ 9,99");
    await expect(kaart.getByRole("button", { name: "Meer producten in één bestelling" })).toHaveCount(0);
    // de server weigert de varianten ook rechtstreeks
    const w = await (await request.get("/api/strooizout/winkel")).json();
    expect(w.binnenkort.map((x: { slug: string }) => x.slug)).toEqual(["strooizout-10-kg-eigen-emmer", "strooizout-10-kg-met-emmer"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    } finally {
      await zetTienKilo(request, baseURL!, "actief"); // zoals ze in de webshop staan
    }
  });

  test("strooizout: 10 kg bestellen uit de zakvoorraad: eigen emmer alleen afhalen, en zak met emmer in één bestelling", async ({ page, request, baseURL }) => {
    const headers = { Authorization: `Bearer ${TOKEN}`, Origin: baseURL! };
    {
      await page.goto("/strooizout");
      const kaart = page.locator(".sz-bestelkaart");
      // alle drie te bestellen: geen ‘Binnenkort’ meer in de keuze
      await expect(kaart.locator(".wn-keuze__optie")).toHaveText([/25\skg\s*zak\s*vanaf € 8,99$/, /10\skg\s*in je eigen emmer\s*€ 5,49$/, /10\skg\s*met emmer\s*€ 6,49$/]);
      await kaart.locator(".wn-keuze__optie", { hasText: "eigen emmer" }).click();
      await expect(kaart.getByRole("heading", { name: "10 kg strooizout in je eigen emmer" })).toBeVisible();
      await expect(kaart.locator(".sz-beschikbaar")).toContainText("Op voorraad");
      await expect(kaart.locator(".wn-teller__getal")).toHaveText(/1\s*× 10\skg/);
      await expect(kaart.getByRole("radio", { name: /Bezorgen/ })).toBeDisabled();
      await expect(kaart.locator(".wn-lever")).toContainText("alleen afhalen");
      await expect(kaart.getByText("Neem een schone, droge en stevige emmer mee. We wegen 10 kg voor je af.")).toBeVisible();
      const totaal = kaart.locator(".sz-bestelkaart__totaal strong");
      await expect(totaal).toHaveText("€ 5,49");
      await kaart.getByRole("button", { name: /Eén meer/ }).click();
      await expect(totaal).toHaveText("€ 10,98");
      expect(await axe(page)).toEqual([]);
      await kaart.getByRole("button", { name: "Bestellen", exact: true }).click();
      await expect(kaart.getByLabel("Straat")).toHaveCount(0);
      await kaart.getByLabel("Naam").fill("Emmer Test");
      const mobiel = `+31 6 ${String(Date.now()).slice(-8, -4)} ${String(Date.now()).slice(-4)}`;
      await kaart.getByLabel("Mobiel nummer").fill(mobiel);
      await page.waitForTimeout(2600);
      await kaart.getByRole("button", { name: "Bestellen met betalingsverplichting", exact: true }).click();
      // Lukt het plaatsen niet, dan staat de reden in de melding (en dus in het testverslag).
      const melding = kaart.getByRole("alert");
      await expect(page.locator(".sz-codekaart__code").or(melding).first()).toBeVisible({ timeout: 15_000 });
      expect((await melding.count()) ? await melding.first().innerText() : "").toBe("");
      await expect(page.locator(".sz-codekaart__code")).toHaveText(/^H-\d{4,5}$/);
      await expect(page.getByText("Neem een schone, droge en stevige emmer mee. We wegen 10 kg voor je af.")).toBeVisible();
      await expect(page.getByText("2× Strooizout 10 kg in je eigen emmer")).toBeVisible();
      const lijst = await (await request.get(`/api/strooizout/beheer/bestellingen?ronde=alle&zoek=${encodeURIComponent(mobiel)}`, { headers })).json();
      expect(lijst.bestellingen[0]).toMatchObject({ totaal_cent: 1098, stuks: 2, levering: "ophalen" });
      // annuleren door de klant geeft de porties terug
      const voor = (await (await request.get("/api/strooizout/winkel")).json()).producten.find((x: { slug: string }) => x.slug === "strooizout-10-kg-eigen-emmer").voorraad;
      await page.getByRole("button", { name: "Bestelling annuleren" }).click();
      await page.getByRole("button", { name: "Ja, annuleren" }).click();
      await expect(page.getByRole("heading", { name: "Je bestelling is geannuleerd" })).toBeVisible();
      const na = (await (await request.get("/api/strooizout/winkel")).json()).producten.find((x: { slug: string }) => x.slug === "strooizout-10-kg-eigen-emmer").voorraad;
      expect(na).toBe(voor + 2);

      // gemengd: 2 zakken en een emmer met deksel; daarna ook de eigen emmer erbij, dan kan bezorgen niet meer
      await page.goto("/strooizout");
      await kaart.getByRole("button", { name: /^2–3 zakken/ }).click();
      await kaart.getByRole("button", { name: "Meer producten in één bestelling" }).click();
      await expect(page.getByRole("heading", { level: 1, name: "Bestellen" })).toBeVisible();
      // elke knop die de bestelling plaatst, noemt de betalingsverplichting (art. 6:230v lid 3 BW)
      for (const t of await page.locator('button[type="submit"], button[form="sz-bestelformulier"]').allTextContents()) expect(t).toMatch(/Bestellen met betalingsverplichting|Bezig/);
      await page.locator(".sz-erbij__knop", { hasText: "met emmer" }).click();
      await expect(page.locator(".sz-regel")).toHaveCount(2);
      const bezorgen = page.getByRole("radio", { name: /Bezorgen/ });
      await expect(bezorgen).toBeEnabled();
      await page.locator(".sz-erbij__knop", { hasText: "eigen emmer" }).click();
      await expect(page.locator(".sz-regel")).toHaveCount(3);
      await expect(bezorgen).toBeDisabled();
      await expect(page.locator(".sz-keuze", { hasText: "Bezorgen" })).toContainText("Strooizout 10 kg in je eigen emmer kun je alleen afhalen.");
      await expect(page.locator(".sz-regelmelding")).toHaveText("Neem een schone, droge en stevige emmer mee. We wegen 10 kg voor je af.");
      expect(await axe(page)).toEqual([]);
      await page.getByLabel("Naam").fill("Gemengd Test");
      const mobiel2 = `+31 6 ${String(Date.now() + 7).slice(-8, -4)} ${String(Date.now() + 7).slice(-4)}`;
      await page.getByLabel("Mobiel nummer").fill(mobiel2);
      await page.waitForTimeout(2600);
      await page.locator("#sz-bestelformulier").getByRole("button", { name: /Bestellen met betalingsverplichting/ }).first().click();
      await expect(page.locator(".sz-codekaart__code")).toHaveText(/^H-\d{4,5}$/);
      const gemengd = await (await request.get(`/api/strooizout/beheer/bestellingen?ronde=alle&zoek=${encodeURIComponent(mobiel2)}`, { headers })).json();
      expect(gemengd.bestellingen[0]).toMatchObject({ totaal_cent: 2 * 949 + 649 + 549, stuks: 4, levering: "ophalen" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    }
  });

  test("strooizout: de WhatsApp-knop staat bovenaan, direct onder de pay-off, compact en zonder scrollen zichtbaar", async ({ page, request, baseURL }) => {
    const headers = { Authorization: `Bearer ${TOKEN}`, Origin: baseURL! };
    const zet = (contact_telefoon: string) => request.put("/api/strooizout/beheer/instellingen", { headers, data: { contact_telefoon } });
    expect((await zet("06 00 00 00 00")).status()).toBe(200);
    try {
      await page.emulateMedia({ reducedMotion: "reduce" }); // geen infaden: we meten de eindtoestand
      for (const [breed, hoog] of [[390, 844], [375, 667], [390, 664]]) {
        await page.setViewportSize({ width: breed, height: hoog });
        await page.goto("/strooizout");
        const knop = page.locator(".wn-hero").getByRole("link", { name: "Vragen? App ons" });
        await expect(knop).toBeVisible();
        // precies één WhatsApp-knop op de homepage (verplaatst, niet dubbel), met de bestaande link
        await expect(page.locator(".wn-app, .sz-wa")).toHaveCount(1);
        await expect(knop).toHaveAttribute("href", /^https:\/\/wa\.me\/31600000000\?text=/);
        const k = (await knop.boundingBox())!;
        const payoff = (await page.locator(".wn-payoff").boundingBox())!;
        const bestel = (await page.locator(".sz-bestelkaart").getByRole("button", { name: "Bestellen", exact: true }).boundingBox())!;
        // direct onder de pay-off, binnen het eerste scherm, en duidelijk kleiner dan de bestelknop
        expect(k.y).toBeGreaterThanOrEqual(payoff.y + payoff.height);
        expect(k.y - (payoff.y + payoff.height)).toBeLessThanOrEqual(16);
        expect(k.y + k.height).toBeLessThanOrEqual(hoog);
        expect(k.height).toBeGreaterThanOrEqual(34);
        expect(k.height).toBeLessThan(bestel.height);
        expect(k.width).toBeLessThan(bestel.width * 0.7);
        // de bestelknop blijft helemaal in het eerste scherm
        expect(bestel.y + bestel.height).toBeLessThanOrEqual(hoog);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      }
      await page.waitForTimeout(700);
      expect(await axe(page)).toEqual([]);
      // onderaan de site een gewone link, geen tweede knop
      await expect(page.locator(".sz-voet").getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", /wa\.me\/31600000000/);
    } finally {
      await zet("");
    }
    // zonder nummer: geen knop
    await page.reload();
    await expect(page.locator(".wn-app")).toHaveCount(0);
  });

  test("strooizout: het totaal is overal hetzelfde en staat er meteen exact (2 zakken bezorgd: € 20,98)", async ({ page }) => {
    await page.goto("/strooizout");
    const kaart = page.locator(".sz-bestelkaart");
    const totaal = kaart.locator(".sz-bestelkaart__totaal strong");
    await kaart.getByRole("button", { name: /Eén meer/ }).click();
    expect(await totaal.textContent()).toBe("€ 18,98"); // direct na de klik: geen tussenbedrag
    await kaart.locator(".wn-lever label", { hasText: "Bezorgen" }).click();
    expect(await totaal.textContent()).toBe("€ 20,98");
    // tijdens de eerste halve seconde nooit iets anders dan het juiste bedrag
    const gezien = await page.evaluate(async () => {
      const el = document.querySelector(".sz-bestelkaart__totaal strong")!;
      const uit = new Set<string>();
      const eind = performance.now() + 500;
      while (performance.now() < eind) {
        uit.add(el.textContent ?? "");
        await new Promise((r) => requestAnimationFrame(r));
      }
      return [...uit];
    });
    expect(gezien).toEqual(["€ 20,98"]);
    await expect(kaart.locator(".wn-totaal__label small")).toHaveText(/2 × € 9,49 \+ € 2,00 bezorgen/);
    // het mandje (via ‘Meer producten in één bestelling’) en de bestelpagina nemen bezorgen over: zelfde totaal
    await kaart.getByRole("button", { name: "Meer producten in één bestelling" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Bestellen" })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Bezorgen/ })).toBeChecked();
    await expect(page.locator(".sz-totaal dd").first()).toHaveText("€ 20,98");
    await page.locator(".sz-mandknop").click();
    await expect(page.locator(".sz-lade .sz-totaal dd")).toHaveText("€ 20,98");
  });

  test("strooizout: de straat speelt vanzelf af en begint opnieuw; er loopt geen lijn meer over de pagina", async ({ page }) => {
    await page.goto("/strooizout");
    await expect(page.locator(".wn-tocht__svg")).toHaveCount(0);
    const straat = page.locator(".wn-straat");
    const ramenAan = () => page.locator(".wn-straat__raam").evaluateAll((els) => els.filter((el) => Number(getComputedStyle(el).opacity) > 0.9).length);
    // buiten beeld staat de animatie aan het begin: alle ramen zijn uit
    await expect.poll(() => straat.evaluate((el) => (el as unknown as SVGElement).style.getPropertyValue("--straat"))).toBe("0.0000");
    expect(await ramenAan()).toBe(0);
    // in beeld loopt de route vanzelf: waar gestrooid is gaat het licht aan
    await straat.scrollIntoViewIfNeeded();
    await expect.poll(ramenAan, { timeout: 30_000 }).toBeGreaterThanOrEqual(4);
    // daarna dooft het uit en begint het opnieuw
    await expect.poll(ramenAan, { timeout: 30_000 }).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("strooizout: het filmpje laadt pas na een tik en speelt dan in de pagina", async ({ page, request }) => {
    const video: string[] = [];
    page.on("request", (r) => r.url().endsWith(".mp4") && video.push(r.url()));
    await page.goto("/strooizout");
    const start = page.getByRole("button", { name: /Speel het filmpje af/ });
    await start.scrollIntoViewIfNeeded();
    await expect(start).toBeVisible();
    await expect(page.locator(".wn-film video")).toHaveCount(0);
    expect(video).toHaveLength(0); // nog niets van de video geladen
    await start.click();
    const speler = page.locator(".wn-film video");
    await expect(speler).toBeVisible();
    await expect(speler).toHaveAttribute("src", "/strooizout/film/fiets.mp4");
    await expect(speler).toHaveAttribute("playsinline", "");
    // het bestand bestaat, is een video en is klein genoeg voor de uitrolbundel (deelverzoeken: tests/bereik.test.ts)
    const film = await request.get("/strooizout/film/fiets.mp4");
    expect(film.status()).toBe(200);
    expect(film.headers()["content-type"]).toContain("video/mp4");
    expect((await film.body()).length).toBeLessThan(700_000);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("strooizout: 1 zak ophalen op de telefoon en annuleren door de klant", async ({ page }) => {
    await page.goto("/strooizout");
    const kaart = page.locator(".sz-bestelkaart");
    await kaart.getByRole("button", { name: /^1 zak\s*€/ }).click();
    await kaart.getByRole("button", { name: "Bestellen", exact: true }).click();
    await expect(kaart.getByLabel("Straat")).toHaveCount(0);
    // in stap 2 is de kaart zelf het bestelformulier: geen balk onderaan die eroverheen schuift
    await expect(page.locator(".wn-plakbalk")).toBeHidden();
    await kaart.getByLabel("Naam").fill("Mobiel Test");
    await kaart.getByLabel("Mobiel nummer").fill("06 1111 2222");
    await page.waitForTimeout(2600);
    await expect(kaart.locator(".sz-bestelkaart__totaal strong")).toHaveText("€ 9,99");
    await kaart.getByRole("button", { name: "Bestellen met betalingsverplichting", exact: true }).click();
    await expect(page.locator(".sz-codekaart__code")).toHaveText(/^H-\d{4,5}$/);
    await expect(page.getByText("Het adres verschijnt hier zodra je bestelling is bevestigd.")).toBeVisible();
    // geen verouderde teksten meer: er wordt wel een e-mail gestuurd en de bestelronde is voor de klant geen onderwerp
    await expect(page.getByText(/geen automatische e-mail/)).toHaveCount(0);
    await expect(page.getByText(/bestelronde/i)).toHaveCount(0);
    await expect(page.getByText("Bedankt voor je bestelling. Je krijgt een e-mail met je bevestiging en we sturen je een Tikkie op je mobiel.")).toBeVisible();
    await page.getByRole("button", { name: "Bestelling annuleren" }).click();
    await page.getByRole("button", { name: "Ja, annuleren" }).click();
    await expect(page.getByRole("heading", { name: "Je bestelling is geannuleerd" })).toBeVisible();
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
    await kaart.getByRole("button", { name: /€ 9,99 ontvangen en uitgeven/ }).click();
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

test("strooizout: op een lage telefoon (390×664) valt ‘Bestellen’ helemaal in het eerste scherm", async ({ page, request, baseURL }) => {
  // eigen start: open bestelronde en voorraad (alleen tegen de lokale Worker)
  if (schrijvend) await voorbereiden(request, baseURL!);
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto("/strooizout");
  const knop = page.locator(".sz-bestelkaart").getByRole("button", { name: "Bestellen", exact: true });
  await expect(knop).toBeVisible();
  const onder = await knop.evaluate((e) => e.getBoundingClientRect().bottom);
  expect(onder).toBeLessThanOrEqual(664);
  expect((await knop.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test("strooizout: de balk onderin verschijnt alleen als ‘Bestellen’ uit beeld is en volgt de bestelkaart", async ({ page, request, baseURL }) => {
  // eigen start: open bestelronde en voorraad (alleen tegen de lokale Worker)
  if (schrijvend) await voorbereiden(request, baseURL!);
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto("/strooizout");
  const kaart = page.locator(".sz-bestelkaart");
  await expect(kaart.getByRole("button", { name: "Bestellen", exact: true })).toBeVisible();
  const balk = page.locator(".wn-plakbalk");
  await expect(balk).toHaveCount(0);
  // 2 zakken kiezen en wegscrollen: de balk toont wat in de kaart staat
  await kaart.getByRole("button", { name: /^2–3 zakken/ }).click();
  await page.evaluate(() => window.scrollTo(0, document.querySelector(".wn-stappen__lijst")!.getBoundingClientRect().top + window.scrollY));
  await expect(balk).toBeVisible();
  await expect(balk).toContainText("€ 18,98");
  await expect(balk).toContainText("2 zakken");
  // echt onderin het scherm (niet ergens buiten beeld door een voorouder met transform)
  const vak = (await balk.boundingBox())!;
  expect(vak.height).toBeLessThanOrEqual(64);
  expect(Math.round(vak.y + vak.height)).toBe(664);
  // terug naar de kaart: balk weg; via de balk naar stap 2: balk weg
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(balk).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, document.querySelector(".wn-stappen__lijst")!.getBoundingClientRect().top + window.scrollY));
  await balk.getByRole("button", { name: "Bestellen" }).click();
  await expect(kaart.getByLabel("Naam")).toBeVisible();
  await expect(balk).toHaveCount(0);
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
