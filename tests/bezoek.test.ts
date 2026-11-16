import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { handleApi, type Env } from "../worker/index";
import { bezoekOverzicht, dagVan, leesMelding, meldBezoek, resetBegrenzing, ruimOp } from "../worker/bezoek";
import { maakBijbelreisWorker } from "../worker/bijbelreis-app";
import { createD1 } from "./d1-shim";

// Bezoekmeting van de Bijbelreis (worker/bezoek.ts): wat de server aanneemt, wat hij bewaart en wat het beheer te zien
// krijgt. Alle gegevens hier zijn verzonnen.

const SITE = "https://bijbelreis.nl";
const ADMIN = "test-admin-token-0123456789abcdef";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const NU = Math.floor(Date.UTC(2026, 10, 16, 9, 0, 0) / 1000); // maandag 16 november 2026, 10:00 in Nederland
const DAG = 86400;

let db: ReturnType<typeof createD1>;
let env: { DB: D1Database; HASH_SECRET?: string };
const wacht: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => void wacht.push(p), passThroughOnException: () => {} } as unknown as ExecutionContext;
const id = (n: number) => n.toString(16).padStart(32, "0");
const melding = (extra: Record<string, unknown> = {}) => ({ i: id(1), p: "atlas", a: "telefoon", h: "", d: 0, s: 0, ...extra });
type Opties = { ip?: string; ua?: string | null; koppen?: Record<string, string>; method?: string; ruw?: string; site?: string; now?: number };
function meld(body: Record<string, unknown> | null, o: Opties = {}) {
  const headers = new Headers({ "CF-Connecting-IP": o.ip ?? "203.0.113.7", "Sec-Fetch-Site": "same-origin", Origin: o.site ?? SITE, "Content-Type": "text/plain;charset=UTF-8", ...(o.koppen ?? {}) });
  if (o.ua !== null) headers.set("User-Agent", o.ua ?? UA);
  for (const [k, v] of Object.entries(o.koppen ?? {})) if (v === "") headers.delete(k);
  const method = o.method ?? "POST";
  return meldBezoek(new Request((o.site ?? SITE) + "/api/bezoek", { method, headers, body: method === "POST" ? o.ruw ?? JSON.stringify(body) : undefined }), env, ctx, o.now ?? NU);
}
type Rij = { id: string; dag: string; begin: number; duur: number; bezoeker: string; pagina: string; apparaat: string; herkomst: string; stappen: number };
const rijen = () => db.raw.prepare("SELECT * FROM bezoek ORDER BY begin, id").all() as unknown as Rij[];

beforeEach(() => {
  db = createD1();
  env = { DB: db as unknown as D1Database, HASH_SECRET: "geheim-voor-de-test" };
  resetBegrenzing();
  wacht.length = 0;
});

describe("bezoek: een melding aannemen", () => {
  it("het begin van een bezoek geeft één rij, zonder IP-adres of user-agent", async () => {
    const r = await meld(melding({ h: "www.google.com" }));
    expect(r.status).toBe(204);
    expect(await r.text()).toBe("");
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    const [rij, ...rest] = rijen();
    expect(rest).toEqual([]);
    expect(rij).toMatchObject({ id: id(1), dag: "2026-11-16", begin: NU, duur: 0, pagina: "atlas", apparaat: "telefoon", herkomst: "www.google.com", stappen: 0 });
    expect(rij.bezoeker).toMatch(/^[0-9a-f]{32}$/);
    const dump = JSON.stringify(rijen());
    expect(dump).not.toContain("203.0.113.7");
    expect(dump).not.toContain("iPhone");
    expect(Object.keys(rij).sort()).toEqual(["apparaat", "begin", "bezoeker", "dag", "duur", "herkomst", "id", "pagina", "stappen"]);
  });

  it("een latere melding werkt dezelfde rij bij en houdt het hoogste van duur en stappen; begin en dag blijven", async () => {
    await meld(melding());
    await meld(melding({ d: 95, s: 4 }), { now: NU + 95 });
    await meld(melding({ d: 40, s: 2 }), { now: NU + 130 }); // een oudere melding die later aankomt
    expect(rijen()).toHaveLength(1);
    expect(rijen()[0]).toMatchObject({ begin: NU, dag: "2026-11-16", duur: 95, stappen: 4 });
    // Ook als het begin nooit aankwam, telt de latere melding.
    await meld(melding({ i: id(2), d: 30, s: 1, p: "boekje", a: "desktop" }), { now: NU + 200 });
    expect(rijen()[1]).toMatchObject({ id: id(2), begin: NU + 200, duur: 30, stappen: 1, pagina: "boekje", apparaat: "desktop" });
  });

  it("de duur wordt afgekapt op vier uur", async () => {
    await meld(melding({ d: 99999, s: 999999 }));
    expect(rijen()[0]).toMatchObject({ duur: 4 * 3600, stappen: 2000 });
  });

  it("de dag is de kalenderdag in Nederland, ook rond middernacht en in de zomertijd", () => {
    expect(dagVan(Date.UTC(2026, 10, 16, 22, 59) / 1000)).toBe("2026-11-16");
    expect(dagVan(Date.UTC(2026, 10, 16, 23, 0) / 1000)).toBe("2026-11-17");
    expect(dagVan(Date.UTC(2026, 6, 1, 21, 59) / 1000)).toBe("2026-07-01");
    expect(dagVan(Date.UTC(2026, 6, 1, 22, 0) / 1000)).toBe("2026-07-02");
  });

  it("de eigen site telt als ‘direct’; een andere site alleen met zijn hostnaam", () => {
    expect(leesMelding(JSON.stringify(melding({ h: "" })), "bijbelreis.nl")!.herkomst).toBe("direct");
    expect(leesMelding(JSON.stringify(melding({ h: "bijbelreis.nl" })), "bijbelreis.nl")!.herkomst).toBe("direct");
    expect(leesMelding(JSON.stringify(melding({ h: "www.bijbelreis.nl" })), "bijbelreis.nl")!.herkomst).toBe("direct");
    expect(leesMelding(JSON.stringify(melding({ h: "Refoweb.NL" })), "bijbelreis.nl")!.herkomst).toBe("refoweb.nl");
  });

  it("de bezoekershash wisselt per dag en verschilt per IP-adres en per browser", async () => {
    await meld(melding({ i: id(1) }));
    await meld(melding({ i: id(2) })); // zelfde bezoeker, tweede pagina
    await meld(melding({ i: id(3) }), { ip: "198.51.100.9" });
    await meld(melding({ i: id(4) }), { ua: UA.replace("17_0", "18_1") });
    await meld(melding({ i: id(5) }), { now: NU + DAG });
    const [a, b, c, d, e] = rijen().map((r) => r.bezoeker);
    expect(b).toBe(a);
    expect(new Set([a, c, d, e]).size).toBe(4);
  });

  it("zonder geheime sleutel blijft de bezoekershash leeg (geen voorspelbare hash)", async () => {
    env = { DB: db as unknown as D1Database };
    await meld(melding());
    expect(rijen()[0].bezoeker).toBe("");
  });
});

describe("bezoek: wat wordt afgewezen (altijd 204, nooit een rij)", () => {
  const geenRij = async (r: Promise<Response>) => { const a = await r; expect(a.status).toBe(204); expect(await a.text()).toBe(""); expect(rijen()).toEqual([]); };

  it("ongeldige invoer", async () => {
    for (const fout of [
      { i: "kort" }, { i: id(0xabcdef).toUpperCase() }, { i: 12 }, { p: "museum" }, { a: "horloge" }, { d: -1 }, { d: 1.5 }, { d: "60" }, { s: -3 }, { s: null },
      { h: "https://voorbeeld.nl/pad" }, { h: "met spatie.nl" }, { h: 5 }, { h: "a".repeat(90) + ".nl" }, { extra: 1 }, { niveau: "b" },
    ]) await geenRij(meld(melding(fout)));
    for (const ruw of ["", "geen json", "[]", "null", "42", '"tekst"', JSON.stringify({ ...melding(), vulling: "x".repeat(300) })]) await geenRij(meld(null, { ruw }));
    const zonder = melding() as Record<string, unknown>;
    delete zonder.p;
    await geenRij(meld(zonder));
  });

  it("te groot (meer dan 300 bytes), ook als Content-Length klein lijkt", async () => {
    await geenRij(meld(null, { ruw: JSON.stringify(melding()) + " ".repeat(400) }));
    await geenRij(meld(melding(), { koppen: { "Content-Length": "5000" } }));
  });

  it("robots, linkvoorbeelden, scripts en verzoeken zonder user-agent", async () => {
    for (const ua of ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "WhatsApp/2.23.20 A", "curl/8.4.0", "python-requests/2.31", "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/153.0.0.0", "facebookexternalhit/1.1", "Slackbot-LinkExpanding 1.0", "Mozilla/5.0 Chrome-Lighthouse"])
      await geenRij(meld(melding(), { ua }));
    await geenRij(meld(melding(), { ua: null }));
  });

  it("een andere site of een andere methode", async () => {
    await geenRij(meld(melding(), { koppen: { "Sec-Fetch-Site": "cross-site" } }));
    await geenRij(meld(melding(), { koppen: { "Sec-Fetch-Site": "same-site" } }));
    await geenRij(meld(melding(), { koppen: { "Sec-Fetch-Site": "", Origin: "https://kwaad.example" } }));
    await geenRij(meld(melding(), { koppen: { "Sec-Fetch-Site": "", Origin: "" } }));
    await geenRij(meld(null, { method: "GET" }));
  });

  it("een oudere browser zonder Sec-Fetch-Site telt mee als Origin de eigen site is", async () => {
    await meld(melding(), { koppen: { "Sec-Fetch-Site": "" } });
    expect(rijen()).toHaveLength(1);
  });

  it("zonder database gebeurt er niets, en een databasefout raakt het antwoord niet", async () => {
    const zonder = await meldBezoek(new Request(SITE + "/api/bezoek", { method: "POST", headers: { "Sec-Fetch-Site": "same-origin", "User-Agent": UA }, body: JSON.stringify(melding()) }), {}, ctx, NU);
    expect(zonder.status).toBe(204);
    const stuk = { prepare: () => { throw new Error("D1 is weg"); } } as unknown as D1Database;
    const fout = await meldBezoek(new Request(SITE + "/api/bezoek", { method: "POST", headers: { "Sec-Fetch-Site": "same-origin", "User-Agent": UA }, body: JSON.stringify(melding()) }), { DB: stuk }, ctx, NU);
    expect(fout.status).toBe(204);
    expect(rijen()).toEqual([]);
  });
});

describe("bezoek: begrenzing in het geheugen", () => {
  it("na 300 meldingen van één IP-adres in tien minuten komt er niets meer bij; een ander adres en het volgende venster wel", async () => {
    for (let n = 1; n <= 320; n++) await meld(melding({ i: id(n) }));
    expect(rijen()).toHaveLength(300);
    await meld(melding({ i: id(900) }), { ip: "198.51.100.44" });
    expect(rijen()).toHaveLength(301);
    await meld(melding({ i: id(901) }), { now: NU + 600 });
    expect(rijen()).toHaveLength(302);
  });

  it("afgewezen invoer telt niet mee voor de begrenzing en schrijft niets", async () => {
    for (let n = 0; n < 400; n++) await meld(melding({ p: "onzin" }));
    await meld(melding());
    expect(rijen()).toHaveLength(1);
  });

  it("er is ook een grens voor alle adressen samen (3000 per tien minuten)", async () => {
    for (let n = 1; n <= 3010; n++) await meld(melding({ i: id(n) }), { ip: `10.${Math.floor(n / 250)}.${n % 250}.1` });
    expect(rijen()).toHaveLength(3000);
  });
});

describe("bezoek: opruimen", () => {
  it("bezoeken ouder dan 400 dagen verdwijnen, jongere blijven", async () => {
    await meld(melding({ i: id(1) }), { now: NU - 401 * DAG });
    await meld(melding({ i: id(2) }), { now: NU - 399 * DAG });
    await meld(melding({ i: id(3) }));
    await ruimOp(db as unknown as D1Database, NU);
    expect(rijen().map((r) => r.id)).toEqual([id(2), id(3)]);
  });
});

describe("bezoek: overzicht voor het beheer", () => {
  // Verzonnen bezoeken: vandaag vier (drie bezoekers), gisteren twee, acht dagen geleden één, veertig dagen geleden één.
  async function vul() {
    await meld(melding({ i: id(1), d: 5, a: "telefoon", h: "www.google.com" }), { ip: "10.0.0.1" });
    await meld(melding({ i: id(2), d: 60, a: "telefoon" }), { ip: "10.0.0.1" });
    await meld(melding({ i: id(3), d: 200, a: "desktop", h: "refoweb.nl" }), { ip: "10.0.0.2" });
    await meld(melding({ i: id(4), d: 1000, a: "tablet", h: "www.google.com" }), { ip: "10.0.0.3" });
    await meld(melding({ i: id(5), d: 30, a: "telefoon" }), { ip: "10.0.0.1", now: NU - DAG });
    await meld(melding({ i: id(6), d: 90, a: "desktop" }), { ip: "10.0.0.2", now: NU - DAG });
    await meld(melding({ i: id(7), d: 600, a: "desktop" }), { ip: "10.0.0.2", now: NU - 8 * DAG });
    await meld(melding({ i: id(8), d: 45, a: "telefoon", h: "duckduckgo.com" }), { ip: "10.0.0.9", now: NU - 40 * DAG });
  }

  it("per dag: bezoeken, bezoekers, gemiddelde, mediaan, korte bezoeken en apparaten; lege dagen staan er als nul", async () => {
    await vul();
    const o = await bezoekOverzicht(db as unknown as D1Database, 30, NU);
    expect(o.vandaag).toBe("2026-11-16");
    expect(o.dagen).toHaveLength(30);
    expect(o.dagen.map((d) => d.dag).slice(0, 3)).toEqual(["2026-11-16", "2026-11-15", "2026-11-14"]);
    expect(o.dagen[0]).toEqual({ dag: "2026-11-16", bezoeken: 4, bezoekers: 3, gemiddeld: 316, mediaan: 130, kort: 1, telefoon: 2, tablet: 1, desktop: 1 });
    expect(o.dagen[1]).toEqual({ dag: "2026-11-15", bezoeken: 2, bezoekers: 2, gemiddeld: 60, mediaan: 60, kort: 0, telefoon: 1, tablet: 0, desktop: 1 });
    expect(o.dagen[2]).toEqual({ dag: "2026-11-14", bezoeken: 0, bezoekers: 0, gemiddeld: 0, mediaan: 0, kort: 0, telefoon: 0, tablet: 0, desktop: 0 });
    expect(o.dagen[8]).toMatchObject({ dag: "2026-11-08", bezoeken: 1, mediaan: 600 });
  });

  it("totalen over 7 en 30 dagen, en de herkomst over de gevraagde periode", async () => {
    await vul();
    const o = await bezoekOverzicht(db as unknown as D1Database, 30, NU);
    // 7 dagen: 5, 30, 60, 90, 200, 1000 → gemiddeld 231 (afgerond), mediaan (60 + 90) / 2 = 75.
    expect(o.totalen.d7).toEqual({ bezoeken: 6, bezoekers: 5, gemiddeld: 231, mediaan: 75, kort: 1, telefoon: 3, tablet: 1, desktop: 2 });
    // 30 dagen: daarbij 600 → mediaan 90.
    expect(o.totalen.d30).toEqual({ bezoeken: 7, bezoekers: 6, gemiddeld: 284, mediaan: 90, kort: 1, telefoon: 3, tablet: 1, desktop: 3 });
    expect(o.herkomst).toEqual([{ herkomst: "direct", bezoeken: 4 }, { herkomst: "www.google.com", bezoeken: 2 }, { herkomst: "refoweb.nl", bezoeken: 1 }]);
    // Een kortere of langere periode verandert de lijst en de herkomst, niet de totalen.
    const kort = await bezoekOverzicht(db as unknown as D1Database, 1, NU);
    expect(kort.dagen).toHaveLength(1);
    expect(kort.herkomst).toEqual([{ herkomst: "www.google.com", bezoeken: 2 }, { herkomst: "direct", bezoeken: 1 }, { herkomst: "refoweb.nl", bezoeken: 1 }]);
    expect(kort.totalen).toEqual(o.totalen);
    const lang = await bezoekOverzicht(db as unknown as D1Database, 60, NU);
    expect(lang.dagen).toHaveLength(60);
    expect(lang.dagen[40]).toMatchObject({ dag: "2026-10-07", bezoeken: 1 });
    expect(lang.herkomst.find((h) => h.herkomst === "duckduckgo.com")).toEqual({ herkomst: "duckduckgo.com", bezoeken: 1 });
    expect(lang.totalen).toEqual(o.totalen);
  });

  it("zonder bezoeken is alles nul; zonder bezoekershash is het aantal bezoekers onbekend (null)", async () => {
    const leeg = await bezoekOverzicht(db as unknown as D1Database, 7, NU);
    expect(leeg.dagen.every((d) => d.bezoeken === 0)).toBe(true);
    expect(leeg.totalen.d7).toEqual({ bezoeken: 0, bezoekers: 0, gemiddeld: 0, mediaan: 0, kort: 0, telefoon: 0, tablet: 0, desktop: 0 });
    expect(leeg.herkomst).toEqual([]);
    env = { DB: db as unknown as D1Database };
    await meld(melding({ d: 12 }));
    const o = await bezoekOverzicht(db as unknown as D1Database, 7, NU);
    expect(o.dagen[0]).toMatchObject({ bezoeken: 1, bezoekers: null });
    expect(o.totalen.d7.bezoekers).toBeNull();
  });
});

describe("bezoek: de routes van de twee Workers", () => {
  const hoofd = (extra: Partial<Env> = {}): Env => ({ DB: db as unknown as D1Database, ASSETS: {} as Fetcher, ADMIN_TOKEN: ADMIN, HASH_SECRET: "geheim", ...extra });
  const post = (basis: string) => new Request(basis + "/api/bezoek", { method: "POST", headers: { "Sec-Fetch-Site": "same-origin", Origin: basis, "User-Agent": UA, "CF-Connecting-IP": "203.0.113.7" }, body: JSON.stringify(melding()) });

  it("bijbelreis.nl: POST /api/bezoek schrijft één rij; GET geeft 405; de atlas zelf blijft GET", async () => {
    const w = maakBijbelreisWorker({}, []) as unknown as { fetch: (r: Request, e: unknown, c: unknown) => Promise<Response> };
    const r = await w.fetch(post(SITE), env, ctx);
    expect(r.status).toBe(204);
    expect(rijen()).toHaveLength(1);
    const get = await w.fetch(new Request(SITE + "/api/bezoek"), env, ctx);
    expect(get.status).toBe(405);
    expect(get.headers.get("Allow")).toBe("POST");
    expect((await w.fetch(new Request(SITE + "/", { method: "POST" }), env, ctx)).status).toBe(405);
    // Zonder database (bijvoorbeeld een verkeerd ingestelde Worker) blijft de site gewoon werken.
    expect((await w.fetch(post(SITE), undefined, ctx)).status).toBe(204);
  });

  it("hoofdsite: neemt alleen meldingen aan als hij de atlas zelf serveert (lokale tests), anders 204 zonder rij", async () => {
    const basis = "https://martijndenbesten.com";
    expect((await handleApi(post(basis), hoofd(), ctx)).status).toBe(204);
    expect(rijen()).toEqual([]);
    expect((await handleApi(post(basis), hoofd({ BIJBELREIS_VERHUISD: "uit" }), ctx)).status).toBe(204);
    expect(rijen()).toHaveLength(1);
    expect((await handleApi(new Request(basis + "/api/bezoek"), hoofd(), ctx)).status).toBe(405);
  });

  it("beheer: het overzicht vraagt het beheertoken en geeft de cijfers", async () => {
    await meld(melding({ d: 75 }), { now: Math.floor(Date.now() / 1000) });
    const basis = "https://martijndenbesten.com/api/admin/bezoek";
    expect((await handleApi(new Request(basis), hoofd(), ctx)).status).toBe(401);
    expect((await handleApi(new Request(basis, { headers: { Authorization: "Bearer fout-token-0123456789abcdefgh" } }), hoofd(), ctx)).status).toBe(401);
    const goed = { headers: { Authorization: `Bearer ${ADMIN}` } };
    const r = await handleApi(new Request(basis + "?dagen=7", goed), hoofd(), ctx);
    expect(r.status).toBe(200);
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    const o = (await r.json()) as { ok: boolean; dagen: { bezoeken: number; gemiddeld: number }[]; totalen: { d7: { bezoeken: number } }; herkomst: unknown[] };
    expect(o.ok).toBe(true);
    expect(o.dagen).toHaveLength(7);
    expect(o.dagen[0]).toMatchObject({ bezoeken: 1, gemiddeld: 75 });
    expect(o.totalen.d7.bezoeken).toBe(1);
    expect(((await (await handleApi(new Request(basis, goed), hoofd(), ctx)).json()) as { dagen: unknown[] }).dagen).toHaveLength(30);
    for (const fout of ["0", "401", "abc", "7.5", "-3"]) expect((await handleApi(new Request(`${basis}?dagen=${fout}`, goed), hoofd(), ctx)).status, fout).toBe(400);
  });
});

describe("bezoek: de pagina's en de configuratie", () => {
  const lees = (p: string) => readFileSync(p, "utf8");

  it("atlas en boekje laden bezoek.js vóór hun eigen programma (zodat ook de eerste stap telt); het script gebruikt geen cookie en geen opslag", () => {
    for (const [f, programma] of [["public/bijbelreis.html", "/bijbelreis/app.js"], ["public/bijbelreis/boekje.html", "/bijbelreis/boekje-kaart.js"]]) {
      const scripts = [...lees(f).matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
      expect(scripts.filter((s) => s === "/bijbelreis/bezoek.js"), f).toHaveLength(1);
      expect(scripts[scripts.indexOf(programma) - 1], f).toBe("/bijbelreis/bezoek.js");
    }
    const js = lees("public/bijbelreis/bezoek.js").replace(/^\s*\/\/.*$/gm, "");
    expect(js).not.toMatch(/document\.cookie|localStorage|sessionStorage|indexedDB/);
    expect(js).not.toMatch(/https?:\/\//);
    expect(js).toMatch(/navigator|nav\.webdriver/);
    expect(js).toMatch(/doNotTrack/);
    expect(js).toMatch(/globalPrivacyControl/);
    expect(js).toContain('"/api/bezoek"');
  });

  it("de privacytekst in de atlas zegt wat er geteld wordt", () => {
    const html = lees("public/bijbelreis.html");
    expect(html).not.toContain("geen trackers");
    expect(html).toContain("Geen account en geen cookies.");
    expect(html).toContain("hoeveel bezoeken er zijn en hoe lang ze duren");
    expect(html).toContain("dan word je niet geteld");
  });

  it("de Worker van bijbelreis.nl heeft dezelfde database als de hoofdsite, en de migratie maakt de tabel", () => {
    const dbId = (f: string) => lees(f).match(/"database_id":\s*"([0-9a-f-]{36})"/)?.[1];
    expect(dbId("wrangler.bijbelreis.jsonc")).toBeTruthy();
    expect(dbId("wrangler.bijbelreis.jsonc")).toBe(dbId("wrangler.embedded.jsonc"));
    expect(lees("wrangler.bijbelreis.jsonc")).toMatch(/"binding":\s*"DB"/);
    expect(lees("migrations/0002_bezoek.sql")).toContain("CREATE TABLE IF NOT EXISTS bezoek");
    // De kolommen: precies deze negen, dus geen IP-adres, user-agent, land of niveau.
    const kolommen = [...lees("migrations/0002_bezoek.sql").replace(/--.*$/gm, "").match(/CREATE TABLE IF NOT EXISTS bezoek \(([\s\S]*?)\n\);/)![1].matchAll(/^\s*([a-z_]+) (?:TEXT|INTEGER)/gm)].map((m) => m[1]);
    expect(kolommen).toEqual(["id", "dag", "begin", "duur", "bezoeker", "pagina", "apparaat", "herkomst", "stappen"]);
  });
});
