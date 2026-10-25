import { expect, test } from "@playwright/test";

test("ideeënmachine produceert ideeën en loopt vast", async ({ page }) => {
  await page.goto("/");
  const machine = page.getByRole("button", { name: /Ideeënmachine/ });
  await machine.click();
  await expect(page.locator(".belt-card").first()).toBeAttached();
  await expect(page.locator(".plate__foot")).not.toContainText("tik op de machine");
  // De octrooikaart toont naam, octrooinummer, illustratie en status.
  const card = page.locator(".invention");
  await expect(card.locator(".invention__name")).not.toBeEmpty();
  await expect(card).toContainText(/Octrooi NL-20\d\d\/\d{4}/);
  await expect(card.getByRole("img", { name: /Tekening van/ })).toBeVisible();
  await expect(card.locator(".invention__status")).not.toBeEmpty();
  for (let i = 0; i < 11; i++) await machine.click();
  await expect(page.getByRole("button", { name: /Herstart de vastgelopen/ })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Storingsrapport");
  await expect(page.getByRole("status").getByText("Missie voltooid")).toBeVisible();
  await page.getByRole("button", { name: /Herstart de vastgelopen/ }).click();
  await expect(page.getByRole("button", { name: /maak een nieuwe uitvinding/ })).toBeVisible();
});

test("onderdelen van de machine leggen zichzelf uit", async ({ page }) => {
  await page.goto("/");
  const part = page.getByRole("button", { name: /Onderdeel \d: Ideeënmeter/ });
  await part.click();
  await expect(part).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#machine-uitleg")).toContainText("veel te veel");
});

test("de windvaan zet de gouden modus aan", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Windvaan op de machine" }).click();
  await expect(page.getByText("Verrassing: Gouden modus")).toBeVisible();
  await expect(page.locator(".plate__foot")).toContainText("Gouden modus");
  await page.getByRole("button", { name: /maak een nieuwe uitvinding/ }).click();
  await expect(page.locator(".invention")).toContainText("Officieel geniaal");
});

test("mededelingen blijven staan zolang de bezoeker leest", async ({ page }) => {
  await page.goto("/");
  const board = page.locator(".board");
  await board.hover();
  const msg = page.locator(".board__msg p");
  const first = await msg.textContent();
  await page.waitForTimeout(8000);
  await expect(msg).toHaveText(first ?? "");
});

test("mededelingen wisselen via de knoppen", async ({ page }) => {
  await page.goto("/");
  const msg = page.locator(".board__msg p");
  const first = await msg.textContent();
  await page.getByRole("button", { name: "Volgende mededeling" }).click();
  await expect(msg).not.toHaveText(first ?? "");
  await page.getByRole("button", { name: "Pauzeren" }).click();
  await expect(page.getByRole("button", { name: "Hervatten" })).toBeVisible();
});

test("statistieken tellen op tot fictieve waarden", async ({ page }) => {
  await page.goto("/");
  await page.locator(".report").scrollIntoViewIfNeeded();
  await expect(page.locator(".stat__badge .counter")).toHaveText("3", { timeout: 5000 });
  await expect(page.locator(".ledger__row")).toHaveCount(3);
});

test("verrassingen: koffie, Konami-code, tijd en zegel", async ({ page }) => {
  await page.goto("/");
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.type("koffie");
  await expect(page.getByText("Verrassing: Koffiepauze")).toBeVisible();
  for (const k of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) await page.keyboard.press(k);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "nacht");
  await page.getByRole("button", { name: "tijd", exact: true }).click();
  await expect(page.getByText("Verrassing: Tijd is op")).toBeVisible();
  const seal = page.getByRole("button", { name: "Officieel zegel van het instituut" });
  for (let i = 0; i < 5; i++) await seal.click();
  await expect(page.getByText("Verrassing: Zelfcertificering")).toBeVisible();
});

test("missiepaspoort toont voortgang en onthoudt die", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Verborgen knop" }).click();
  await page.getByRole("button", { name: /Missies/ }).click();
  const dialog = page.getByRole("dialog", { name: "Uw missiepaspoort" });
  await expect(dialog).toContainText("Verrassingen gevonden: 1");
  await page.reload();
  await page.getByRole("button", { name: /Missies/ }).click();
  await expect(page.getByRole("dialog", { name: "Uw missiepaspoort" })).toContainText("Verrassingen gevonden: 1");
});

test("einde van de website", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /toch verder/ }).click();
  await expect(page.getByRole("heading", { name: "Het einde." })).toBeVisible();
  await expect(page.getByText(/O, u bent er nog/)).toBeVisible({ timeout: 9000 });
});

const progress = (eggs: string[], missions: string[] = []) => (page: import("@playwright/test").Page) =>
  page.addInitScript(
    ([e, m]) => window.localStorage.setItem("mdb:voortgang:v1", JSON.stringify({ eggs: e, missions: m, secret: false, coffee: 0 })),
    [eggs, missions] as const,
  );

test("koffie bijschenken telt mee", async ({ page }) => {
  await page.goto("/");
  const cup = page.getByRole("button", { name: "Schenk een kopje koffie in" });
  await cup.click();
  await cup.click();
  await expect(page.locator(".coffee")).toContainText("Waarvan 2 van u.");
});

test("een voltooide missie krijgt een stempel en een rang", async ({ page }) => {
  await page.goto("/");
  const machine = page.getByRole("button", { name: /Ideeënmachine/ });
  for (let i = 0; i < 12; i++) await machine.click();
  await expect(page.getByRole("button", { name: /Herstart de vastgelopen/ })).toBeVisible();
  const card = page.locator(".stampcard");
  await expect(card.locator(".stampcard__slot.is-done")).toHaveCount(1);
  await expect(card.locator(".stampcard__slot.is-done")).toContainText("Laat de machine vastlopen");
  await expect(card.locator(".stampcard__rank")).toContainText("Bezoeker");
});

test("de website reageert op ontdekkingen", async ({ page }) => {
  await progress(["koffie", "tijd", "logo"])(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ontdekt", "1");
  await expect(page.getByRole("button", { name: "Een gouden sleutel" })).toHaveCount(0);
});

test("na vijf ontdekkingen ligt er een gouden sleutel klaar", async ({ page }) => {
  await progress(["koffie", "tijd", "logo", "board", "rust"])(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ontdekt", "2");
  await page.getByRole("button", { name: "Een gouden sleutel" }).click();
  await expect(page.getByText("Verrassing: Sleutel van het instituut")).toBeVisible();
});

test("na acht ontdekkingen staat u in het ontdekkersregister", async ({ page }) => {
  await progress(["koffie", "tijd", "logo", "board", "rust", "end", "tab", "idle"])(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ontdekt", "3");
  await expect(page.getByText(/ontdekkersregister, onder nummer 8/)).toBeVisible();
});

test("alle missies voltooid geeft een gouden certificaat", async ({ page }) => {
  await progress([], ["hidden-buttons", "jam", "creativity-10", "secret-room", "emergency", "project-99", "vote", "eggs-10"])(page);
  await page.goto("/certificaat");
  await expect(page.getByText(/gouden certificaat als Opperbezoeker/)).toBeVisible();
  await expect(page.getByRole("radio", { name: /Opperbezoeker/ })).toBeChecked();
});

test("zonder beweging levert de machine direct een uitvinding", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: /Ideeënmachine/ }).click();
  await expect(page.locator(".invention__name")).not.toBeEmpty({ timeout: 500 });
});
