import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// ‘Mis je iets? Vraag het aan’ (public/bijbelreis/app.js, worker/aanvraag.ts; docs/bijbelreis-aanvraag/README.md).
// Een bezoeker vraagt om een Bijbelgedeelte, verhaal of reis die er nog niet is, om iets voor school, club of kerk, of
// meldt een fout. Onder `vite preview` bestaat de API niet: daar vangt de test het verzoek zelf op. De laatste groep
// draait tegen de echte lokale Worker met database. Alle gegevens zijn verzonnen.

const ADMIN = "e2e-admin-token-0123456789abcdef";
type Verzoek = { soort: string; tekst: string; email: string; context: string; website: string };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { if (localStorage.getItem("bijbelreis:niveau") === null) localStorage.setItem("bijbelreis:niveau", JSON.stringify("b")); } catch { /* about:blank heeft geen opslag */ } });
});

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}
// Vangt de aanvragen op en antwoordt zoals de server.
async function vangAanvragen(page: Page, antwoord: { status: number; body: unknown } | "geen-verbinding" = { status: 200, body: { ok: true } }) {
  const verzoeken: Verzoek[] = [];
  await page.route("**/api/aanvraag", async (route) => {
    verzoeken.push(JSON.parse(route.request().postData() || "{}"));
    if (antwoord === "geen-verbinding") await route.abort();
    else await route.fulfill({ status: antwoord.status, contentType: "application/json", body: JSON.stringify(antwoord.body) });
  });
  return verzoeken;
}
const open = async (page: Page, hash = "") => { await page.goto("about:blank"); await page.goto("/bijbelreis" + hash); };
// Zoeken zonder resultaat in Verhalen, en dan ‘Vraag dit aan’.
async function zoekEnVraag(page: Page, term = "Hizkia en de zonnewijzer") {
  await open(page);
  await page.locator("#vZoek").fill(term);
  await expect(page.locator("#vLijst")).toContainText(`Niets gevonden voor ‘${term}’`);
  await page.getByRole("button", { name: "Vraag dit aan" }).click();
  await expect(page.locator("#aanvraagLade")).toBeVisible();
}
// Het stapblad openen (telefoon en tablet); op de desktop doet dit niets.
async function bladOpen(page: Page) {
  const knop = page.locator("#bladBtn");
  if (!(await knop.isVisible())) return;
  await expect(async () => { if ((await knop.getAttribute("aria-expanded")) !== "true") await knop.click(); expect(await knop.getAttribute("aria-expanded")).toBe("true"); }).toPass();
}
const lade = (page: Page) => page.locator("#aanvraagLade");

test("aanvraag: zoeken zonder resultaat biedt ‘Vraag dit aan’, met de zoekterm al ingevuld", async ({ page }) => {
  const errors = watchErrors(page);
  await open(page);
  // Zonder zoeken staat onderaan de lijst de gewone regel.
  await expect(page.locator("#p-verhalen .misje .linkbtn")).toHaveText("Mis je iets? Vraag het aan");
  await page.locator("#vZoek").fill("Hizkia en de zonnewijzer");
  const knop = page.getByRole("button", { name: "Vraag dit aan" });
  await expect(knop).toBeVisible();
  // Eén ingang tegelijk: de regel onderaan wijkt zolang de knop er staat.
  await expect(page.locator("#p-verhalen > .misje")).toBeHidden();
  await knop.click();
  await expect(lade(page)).toBeVisible();
  await expect(lade(page).getByRole("heading", { name: "Mis je iets? Vraag het aan" })).toBeVisible();
  await expect(page.locator("#avTekst")).toHaveValue("Ik zoek ‘Hizkia en de zonnewijzer’ en kan het niet vinden.");
  await expect(page.locator("#avTeller")).toHaveText("58 van 600 tekens");
  await expect(page.locator('input[name="soort"][value="gemist"]')).toBeChecked();
  await expect(page.locator("#avMail")).toHaveValue("");
  await expect(lade(page).getByRole("link", { name: "info@denckh.nl" })).toHaveAttribute("href", "mailto:info@denckh.nl?subject=Bijbelreis");
  // De focus staat in het venster; Escape sluit het en de focus gaat terug naar de knop.
  expect(await page.evaluate(() => document.getElementById("aanvraagLade")!.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(lade(page)).toBeHidden();
  await expect(knop).toBeFocused();
  // Wie zoekt en wél iets vindt, krijgt de knop niet.
  await page.locator("#vZoek").fill("Jozef");
  await expect(knop).toHaveCount(0);
  await expect(page.locator("#p-verhalen > .misje")).toBeVisible();
  expect(errors).toEqual([]);
});

test("aanvraag: versturen stuurt soort, tekst, e-mail en waar je was; daarna een rustige bevestiging", async ({ page, context }) => {
  const errors = watchErrors(page);
  const verzoeken = await vangAanvragen(page);
  await open(page);
  const opslagVoor = await page.evaluate(() => [Object.keys(localStorage).sort(), Object.keys(sessionStorage).sort()]);
  await page.locator("#p-verhalen .misje .linkbtn").click();
  await expect(page.locator("#avTekst")).toHaveValue("");
  await page.getByText("Voor school, club of kerk").click();
  await page.locator("#avTekst").fill("  Kan de reis van Paulus ook als boekje voor de catechisatie?  ");
  await page.locator("#avMail").fill(" leider@voorbeeld.example ");
  await page.getByRole("button", { name: "Versturen" }).click();
  await expect(page.locator("#avKlaar")).toBeVisible();
  await expect(page.locator("#avKlaar")).toContainText("Bedankt. We lezen alles. Kom gerust terug om te kijken of het er staat.");
  await expect(page.locator("#avKlaar")).toBeFocused();
  await expect(page.locator("#avForm")).toBeHidden();
  expect(verzoeken).toEqual([{ soort: "groep", tekst: "Kan de reis van Paulus ook als boekje voor de catechisatie?", email: "leider@voorbeeld.example", context: "", website: "" }]);
  // Geen doorverwijzing, geen cookie en niets nieuws in de opslag van de browser.
  await expect(page).toHaveURL(/\/bijbelreis\/?$|\/bijbelreis#?$|\/$/);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => [Object.keys(localStorage).sort(), Object.keys(sessionStorage).sort()])).toEqual(opslagVoor);
  await page.getByRole("button", { name: "Terug naar de Bijbelreis" }).click();
  await expect(lade(page)).toBeHidden();
  // Opnieuw openen: een leeg formulier.
  await page.locator("#p-verhalen .misje .linkbtn").click();
  await expect(page.locator("#avForm")).toBeVisible();
  await expect(page.locator("#avTekst")).toHaveValue("");
  await expect(page.locator("#avMail")).toHaveValue("");
  await expect(page.locator('input[name="soort"][value="gemist"]')).toBeChecked();
  expect(errors).toEqual([]);
});

test("aanvraag: de foutmelding staat bij het veld, en er gaat niets weg zolang het niet klopt", async ({ page }) => {
  const errors = watchErrors(page);
  const verzoeken = await vangAanvragen(page);
  await open(page);
  await page.locator("#p-verhalen .misje .linkbtn").click();
  const stuur = page.getByRole("button", { name: "Versturen" });
  await stuur.click();
  await expect(page.locator("#avTekstFout")).toHaveText("Schrijf iets meer: minstens 10 tekens.");
  await expect(page.locator("#avTekst")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#avTekst")).toBeFocused();
  await page.locator("#avTekst").fill("Ik mis het verhaal van Hizkia.");
  await expect(page.locator("#avTekstFout")).toHaveText(""); // de melding verdwijnt zodra het klopt
  await page.locator("#avMail").fill("geen-adres");
  await stuur.click();
  await expect(page.locator("#avMailFout")).toHaveText("Dit e-mailadres klopt niet. Kijk het na, of laat het veld leeg.");
  await expect(page.locator("#avMail")).toBeFocused();
  expect(verzoeken).toEqual([]);
  await page.locator("#avMail").fill("");
  await stuur.click();
  await expect(page.locator("#avKlaar")).toBeVisible();
  expect(verzoeken.length).toBe(1);
  expect(errors).toEqual([]);
});

test("aanvraag: een melding van de server staat bij het goede veld; zonder verbinding een duidelijke melding met het e-mailadres", async ({ page }) => {
  const verzoeken = await vangAanvragen(page, { status: 429, body: { ok: false, error: "Je hebt al een paar aanvragen gestuurd. Probeer het later nog eens, of mail naar info@denckh.nl." } });
  await open(page);
  await page.locator("#p-verhalen .misje .linkbtn").click();
  await page.locator("#avTekst").fill("Ik mis het verhaal van Hizkia.");
  const stuur = page.getByRole("button", { name: "Versturen" });
  await stuur.click();
  await expect(page.locator("#avFout")).toHaveText("Je hebt al een paar aanvragen gestuurd. Probeer het later nog eens, of mail naar info@denckh.nl.");
  await expect(page.locator("#avForm")).toBeVisible(); // de tekst blijft staan
  await expect(page.locator("#avTekst")).toHaveValue("Ik mis het verhaal van Hizkia.");
  await expect(stuur).toBeEnabled();
  await page.unroute("**/api/aanvraag");
  await vangAanvragen(page, { status: 422, body: { ok: false, error: "Dit e-mailadres klopt niet. Kijk het na, of laat het veld leeg.", veld: "email" } });
  await stuur.click();
  await expect(page.locator("#avMailFout")).toHaveText("Dit e-mailadres klopt niet. Kijk het na, of laat het veld leeg.");
  await expect(page.locator("#avFout")).toHaveText("");
  await page.unroute("**/api/aanvraag");
  await vangAanvragen(page, "geen-verbinding");
  await stuur.click();
  await expect(page.locator("#avFout")).toHaveText("Het versturen lukte niet. Probeer het later nog eens, of mail naar info@denckh.nl.");
  await expect(page.locator("#avKlaar")).toBeHidden();
  expect(verzoeken.length).toBe(1);
});

test("aanvraag: aan het einde van een deel staat de regel, met waar je was; niet bij een tussenstap", async ({ page }) => {
  const errors = watchErrors(page);
  const verzoeken = await vangAanvragen(page);
  await open(page, "#izak/3");
  await expect(page.locator("#sTitle")).toHaveText(/^3\. /);
  await bladOpen(page);
  await expect(page.locator("#sMis")).toBeHidden();
  await open(page, "#izak/8");
  await expect(page.locator("#sTitle")).toHaveText(/^8\. /);
  // Het korte stapblad (telefoon) blijft zoals het was: de regel staat alleen in het open blad.
  if (await page.locator("#bladBtn").isVisible()) await expect(page.locator("#sMis")).toBeHidden();
  await bladOpen(page);
  await expect(page.locator("#sMis")).toBeVisible();
  await page.locator("#sMis button").click();
  await expect(lade(page)).toBeVisible();
  await page.locator("#avTekst").fill("Na Izak mis ik nog iets over Ezau.");
  await page.getByRole("button", { name: "Versturen" }).click();
  await expect(page.locator("#avKlaar")).toBeVisible();
  expect(verzoeken).toEqual([{ soort: "gemist", tekst: "Na Izak mis ik nog iets over Ezau.", email: "", context: "#izak/8", website: "" }]);
  // In de intro van een deel staat de regel niet.
  await page.keyboard.press("Escape");
  await open(page, "#izak");
  await bladOpen(page);
  await expect(page.locator("#sMis")).toBeHidden();
  expect(errors).toEqual([]);
});

test("aanvraag: niet bij Samen ontdekken, behalve onder ‘Voor ouders en leiders’", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(() => localStorage.setItem("bijbelreis:niveau", JSON.stringify("a")));
  await page.goto("/bijbelreis");
  await expect(page.locator("#p-verhalen h2")).toContainText("Samen");
  await expect(page.locator("#p-verhalen [data-aanvraag]")).toHaveCount(0);
  await page.goto("/bijbelreis#izak/8");
  await expect(page.locator("#sTitle")).toHaveText(/^8\. /);
  await bladOpen(page);
  await expect(page.locator("#sMis")).toBeHidden();
  // Voor ouders en leiders: daar staat de ingang altijd.
  await page.locator("details.parents > summary").click();
  const ingang = page.locator("details.parents [data-aanvraag]");
  await ingang.scrollIntoViewIfNeeded();
  await expect(ingang).toHaveText("Mis je iets? Vraag het aan");
  await expect(page.locator("details.parents")).toContainText("naar de maker gemaild");
  await ingang.click();
  await expect(lade(page)).toBeVisible();
  expect(errors).toEqual([]);
});

test("aanvraag: met het toetsenbord te bedienen; de focus blijft in het venster; geen toegankelijkheidsfouten", async ({ page }) => {
  await zoekEnVraag(page);
  // Tab loopt rond binnen het venster, ook langs het tekstveld; het lokveld doet niet mee.
  const gezien = new Set<string>();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const waar = await page.evaluate(() => { const a = document.activeElement as HTMLElement; return document.getElementById("aanvraagLade")!.contains(a) ? a.id || a.getAttribute("name") || a.tagName : "BUITEN"; });
    gezien.add(waar);
  }
  expect([...gezien]).not.toContain("BUITEN");
  expect([...gezien]).not.toContain("website");
  expect([...gezien]).toEqual(expect.arrayContaining(["avTekst", "avMail", "avStuur", "soort"]));
  // Het lokveld is voor mensen onzichtbaar en heeft geen plek op het scherm.
  expect(await page.evaluate(() => { const r = document.querySelector('#avForm input[name="website"]')!.getBoundingClientRect(); return r.right < 0 || r.width <= 1; })).toBe(true);
  const axe = await new AxeBuilder({ page }).include("#aanvraagLade").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  // Ook met foutmeldingen in beeld en na het versturen.
  await page.locator("#avTekst").fill("kort");
  await page.locator("#avMail").fill("geen-adres");
  await page.locator("#avStuur").click();
  expect((await new AxeBuilder({ page }).include("#aanvraagLade").analyze()).violations.map((v) => v.id)).toEqual([]);
});

test("aanvraag op de telefoon (390×664): het formulier past, Versturen is bereikbaar en niets schuift opzij", async ({ page, isMobile }) => {
  test.skip(!isMobile, "alleen op de telefoon");
  await page.setViewportSize({ width: 390, height: 664 });
  const errors = watchErrors(page);
  const verzoeken = await vangAanvragen(page);
  await zoekEnVraag(page);
  const maat = await page.evaluate(() => {
    const box = document.querySelector("#aanvraagLade .lade__box")!, r = box.getBoundingClientRect();
    const klein = [...box.querySelectorAll<HTMLElement>("button, .av-soort label, textarea, input:not([tabindex='-1']):not([type='radio']), .av-mail")].filter((e) => e.offsetParent && e.getBoundingClientRect().height < 44).map((e) => e.id || e.className || e.tagName);
    return { boven: r.top, onder: r.bottom, breed: r.width, scherm: [innerWidth, innerHeight], opzij: document.documentElement.scrollWidth <= innerWidth && box.scrollWidth <= box.clientWidth + 1, klein, lettergrootte: parseFloat(getComputedStyle(document.getElementById("avTekst")!).fontSize) };
  });
  expect(maat.boven).toBeGreaterThanOrEqual(0);
  expect(maat.onder).toBeLessThanOrEqual(maat.scherm[1] + 1);
  expect(maat.breed).toBe(390);
  expect(maat.opzij).toBe(true);
  expect(maat.klein).toEqual([]);
  expect(maat.lettergrootte).toBeGreaterThanOrEqual(16); // anders zoomt Safari in bij het typen
  // Versturen staat lager dan het scherm hoog is, maar is met één veeg bereikbaar en dan helemaal in beeld.
  await page.locator("#avStuur").scrollIntoViewIfNeeded();
  const knop = await page.locator("#avStuur").boundingBox();
  expect(knop!.y).toBeGreaterThanOrEqual(0);
  expect(knop!.y + knop!.height).toBeLessThanOrEqual(664);
  expect(knop!.width).toBeGreaterThan(300);
  await page.locator("#avStuur").tap();
  await expect(page.locator("#avKlaar")).toBeVisible();
  expect(verzoeken.length).toBe(1);
  expect(errors).toEqual([]);
});

// Tegen de echte lokale Worker met D1 (niet onder `vite preview`, daar bestaat de API niet).
test.describe("aanvraag: de echte Worker", () => {
  test.skip(!!process.env.E2E_BASE_URL, "alleen tegen de lokale Worker met database");
  const kop = { Authorization: `Bearer ${ADMIN}` };

  test("een aanvraag uit het formulier komt aan, staat in het beheer en is daar af te handelen", async ({ page, request }, testInfo) => {
    const errors = watchErrors(page);
    const tekst = `Ik mis het verhaal van Hizkia (${testInfo.project.name}, ${Date.now()}).`;
    await open(page, "#izak/8");
    await expect(page.locator("#sTitle")).toHaveText(/^8\. /);
    await bladOpen(page);
    await page.locator("#sMis button").click();
    await page.locator("#avTekst").fill(tekst);
    await page.locator("#avMail").fill("ouder@voorbeeld.example");
    const antwoord = page.waitForResponse((r) => new URL(r.url()).pathname === "/api/aanvraag");
    await page.getByRole("button", { name: "Versturen" }).click();
    expect((await antwoord).status()).toBe(200);
    await expect(page.locator("#avKlaar")).toBeVisible();
    expect(errors).toEqual([]);
    const lijst = (await (await request.get("/api/admin/aanvragen?status=nieuw", { headers: kop })).json()) as { nieuw: number; aanvragen: { id: number; tekst: string; email: string; context: string; soort: string }[] };
    const mijn = lijst.aanvragen.find((a) => a.tekst === tekst)!;
    expect(mijn).toMatchObject({ soort: "gemist", email: "ouder@voorbeeld.example", context: "#izak/8" });
    expect(lijst.nieuw).toBeGreaterThanOrEqual(1);

    // Het beheer: het aantal nieuwe staat op de knop; de aanvraag is te lezen en af te handelen.
    await page.goto("/beheer");
    await page.getByLabel("Beheertoken").fill(ADMIN);
    await page.getByRole("button", { name: "Inloggen" }).click();
    const onderdeel = page.getByRole("button", { name: /Aanvragen bijbelreis\.nl/ });
    await expect(onderdeel.locator(".aanvragen__teller")).toHaveText(/^\d+$/);
    await onderdeel.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Aanvragen bijbelreis.nl");
    const item = page.locator(".aanvragen__item", { hasText: tekst });
    await expect(item).toBeVisible();
    await expect(item.getByRole("link", { name: "ouder@voorbeeld.example" })).toHaveAttribute("href", /^mailto:ouder@voorbeeld\.example\?subject=Je%20aanvraag%20bij%20de%20Bijbelreis$/);
    await expect(item.getByRole("link", { name: "bijbelreis.nl/#izak/8" })).toHaveAttribute("href", "https://bijbelreis.nl/#izak/8");
    await item.getByRole("button", { name: "Afgehandeld" }).click();
    await expect(page.locator(".aanvragen__item", { hasText: tekst })).toHaveCount(0);
    await page.getByRole("button", { name: "Afgehandeld", exact: true }).first().click();
    const klaar = page.locator(".aanvragen__item", { hasText: tekst });
    await expect(klaar).toBeVisible();
    await expect(klaar).toContainText("e-mailadres gewist of niet opgegeven");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const na = (await (await request.get("/api/admin/aanvragen?status=afgehandeld", { headers: kop })).json()) as { aanvragen: { id: number; email: string }[] };
    expect(na.aanvragen.find((a) => a.id === mijn.id)).toMatchObject({ email: "" });
  });

  test("de route zelf: alleen POST van de eigen site, een duidelijke melding bij een fout, het beheer achter het token", async ({ request, baseURL }) => {
    expect((await request.get("/api/aanvraag")).status()).toBe(405);
    const vreemd = await request.post("/api/aanvraag", { data: { soort: "gemist", tekst: "Een aanvraag van een andere site." }, headers: { Origin: "https://kwaad.example" } });
    expect(vreemd.status()).toBe(403);
    const kort = await request.post("/api/aanvraag", { data: { soort: "gemist", tekst: "kort" }, headers: { Origin: baseURL!, "Sec-Fetch-Site": "same-origin" } });
    expect(kort.status()).toBe(422);
    expect(await kort.json()).toEqual({ ok: false, error: "Schrijf iets meer: minstens 10 tekens.", veld: "tekst" });
    expect((await request.get("/api/admin/aanvragen")).status()).toBe(401);
    expect((await request.post("/api/admin/aanvragen/1", { data: { actie: "afgehandeld" } })).status()).toBe(401);
  });
});
