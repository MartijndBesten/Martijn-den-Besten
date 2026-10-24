import { expect, test } from "@playwright/test";

const ADMIN = "e2e-admin-token-0123456789abcdef";

test("loket weigert links en accepteert een net idee", async ({ page }) => {
  await page.goto("/loket");
  await page.getByLabel("Titel van uw idee").fill("Kijk op www.spam.nl");
  await page.getByLabel(/Ik begrijp dat dit idee/).check();
  await page.getByRole("button", { name: "Idee indienen bij het loket" }).click();
  await expect(page.getByText(/Links zijn niet toegestaan/)).toBeVisible();
});

test("moderatieflow: inzending pas zichtbaar na goedkeuring", async ({ page, request, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const sub = await request.post("/api/ideas", {
    headers: { Origin: origin, "Content-Type": "application/json" },
    data: { title: "Een fietsbel die applaudisseert", description: "", category: "onnodig", website: "", elapsedMs: 4000 },
  });
  expect(sub.status()).toBe(201);
  expect((await (await request.get("/api/ideas")).json()).ideas.some((i: { title: string }) => i.title.includes("fietsbel"))).toBe(false);

  await page.goto("/beheer");
  await page.getByLabel("Beheertoken").fill(ADMIN);
  await page.getByRole("button", { name: "Inloggen" }).click();
  const item = page.locator(".beheer__list li", { hasText: "Een fietsbel die applaudisseert" });
  await item.getByRole("button", { name: "Goedkeuren" }).click();
  await expect(page.getByText("Bijgewerkt.")).toBeVisible();

  await page.goto("/museum");
  await expect(page.locator(".public-card", { hasText: "Een fietsbel die applaudisseert" })).toBeVisible();
});

test("API-beveiliging: headers, origin en beheer", async ({ request }) => {
  const h = await request.get("/api/health");
  expect(h.headers()["x-content-type-options"]).toBe("nosniff");
  expect(h.headers()["cache-control"]).toBe("no-store");
  const bad = await request.post("/api/votes", { headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, data: { itemId: "uitstel-app" } });
  expect(bad.status()).toBe(403);
  expect((await request.get("/api/admin/ideas")).status()).toBe(401);
});

test("statische pagina's hebben beveiligingsheaders", async ({ request }) => {
  const r = await request.get("/");
  expect(r.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(r.headers()["x-frame-options"]).toBe("DENY");
});
