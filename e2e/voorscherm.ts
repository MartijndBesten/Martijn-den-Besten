import type { TestType } from "@playwright/test";

// Het voorscherm van de Bijbelreis (welkom bij openen zonder link) staat één keer per bezoek (sessionStorage) over de
// atlas. De meeste tests openen /bijbelreis zonder # en gaan meteen verder in de atlas: voor hen is het welkom al
// ‘gezien’. Het voorscherm zelf wordt getest in e2e/bijbelreis-voorscherm.spec.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zonderVoorscherm(test: TestType<any, any>) {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { try { sessionStorage.setItem("bijbelreis:voorscherm", "1"); } catch { /* about:blank */ } });
  });
}
