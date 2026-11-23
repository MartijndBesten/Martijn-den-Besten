// Strooizout voor de buurt: inloggen op het beheer met een code per e-mail, en de e-mail na een bestelling.
// Met echte SQL (node:sqlite) en een nagemaakte e-mailbinding; er gaat geen echte mail uit.

import { beforeEach, describe, expect, it } from "vitest";
import { handleApi, type Env } from "../worker/index";
import { createD1 } from "./d1-shim";

const ORIGIN = "https://strooizouthouten.nl";
const ADMIN = "test-admin-token-0123456789abcdef";
const BEHEERDER = "beheerder@example.com";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type J = any;
type Bericht = { to: string; subject: string; text: string; html: string; from: { email: string; name: string }; replyTo?: string };

let env: Env;
let db: ReturnType<typeof createD1>;
let verstuurd: Bericht[];
let wachtend: Promise<unknown>[];
const ctx = { waitUntil: (p: Promise<unknown>) => wachtend.push(p), passThroughOnException: () => {} } as unknown as ExecutionContext;

function req(path: string, init: RequestInit & { ip?: string; token?: string } = {}) {
  const headers = new Headers(init.headers);
  headers.set("CF-Connecting-IP", init.ip ?? "203.0.113.9");
  if (init.body) headers.set("Content-Type", "application/json");
  if (init.method && init.method !== "GET") headers.set("Origin", ORIGIN);
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);
  return handleApi(new Request(ORIGIN + path, { ...init, headers }), env, ctx);
}
const post = (path: string, body: unknown, extra: { ip?: string; token?: string } = {}) => req(`/api/strooizout${path}`, { method: "POST", body: JSON.stringify(body), ...extra });
const jsonVan = async (r: Response | Promise<Response>) => (await (await r).json()) as J;
const codeUit = (b: Bericht) => b.text.match(/(\d{3}) (\d{3})/)!.slice(1).join("");

beforeEach(() => {
  db = createD1();
  verstuurd = [];
  wachtend = [];
  env = {
    DB: db as unknown as D1Database,
    ASSETS: {} as Fetcher,
    ADMIN_TOKEN: ADMIN,
    HASH_SECRET: "geheim",
    SZ_MAIL: { send: async (b: unknown) => void verstuurd.push(b as Bericht) },
    STROOIZOUT_MAIL: "aan",
    STROOIZOUT_BEHEER_EMAILS: `${BEHEERDER}, tweede@example.com`,
  };
  db.raw.prepare("UPDATE sz_product SET voorraad = NULL, voorraad_verwacht = NULL WHERE id = 1").run();
});

describe("inloggen op het beheer met een code per e-mail", () => {
  it("adres → code per mail → sessie; uitloggen maakt de sessie ongeldig", async () => {
    expect(await jsonVan(req("/api/strooizout/beheer/inlog"))).toMatchObject({ met_mail: true, met_code: true });
    const r = await post("/beheer/inlog/code", { email: "  Beheerder@Example.com " });
    expect(r.status).toBe(200);
    expect(verstuurd).toHaveLength(1);
    expect(verstuurd[0]).toMatchObject({ to: BEHEERDER, from: { email: "bestelling@strooizouthouten.nl" } });
    expect(verstuurd[0].subject).toMatch(/^Inlogcode voor het beheer: \d{3} \d{3}$/);
    const code = codeUit(verstuurd[0]);
    // de code staat niet leesbaar in de database, het adres ook niet
    const rij = db.raw.prepare("SELECT * FROM sz_inlogcode").get() as J;
    expect(JSON.stringify(rij)).not.toContain(code);
    expect(JSON.stringify(rij)).not.toContain("example.com");

    const inlog = await post("/beheer/inlog", { email: BEHEERDER, code: `${code.slice(0, 3)} ${code.slice(3)}` });
    expect(inlog.status).toBe(200);
    const { token } = await jsonVan(inlog);
    expect(token).toMatch(/^s_[A-Za-z0-9_-]{40,50}$/);
    expect(JSON.stringify(db.raw.prepare("SELECT * FROM sz_beheersessie").all())).not.toContain(token);
    expect((await req("/api/strooizout/beheer/overzicht", { token })).status).toBe(200);
    // dezelfde code werkt geen tweede keer
    expect((await post("/beheer/inlog", { email: BEHEERDER, code })).status).toBe(401);
    // uitloggen
    expect((await post("/beheer/uitloggen", {}, { token })).status).toBe(200);
    expect((await req("/api/strooizout/beheer/overzicht", { token })).status).toBe(401);
    // het vaste beheertoken blijft werken
    expect((await req("/api/strooizout/beheer/overzicht", { token: ADMIN })).status).toBe(200);
  });

  it("een onbekend adres krijgt hetzelfde antwoord maar geen mail, en kan niet inloggen", async () => {
    const bekend = await jsonVan(post("/beheer/inlog/code", { email: BEHEERDER }));
    const onbekend = await post("/beheer/inlog/code", { email: "iemand@example.org" }, { ip: "203.0.113.50" });
    expect(onbekend.status).toBe(200);
    expect(await jsonVan(onbekend)).toEqual(bekend);
    expect(verstuurd).toHaveLength(1);
    expect((await post("/beheer/inlog", { email: "iemand@example.org", code: "123456" })).status).toBe(401);
  });

  it("een verkeerde code telt als poging; na vijf missers werkt ook de goede code niet meer", async () => {
    await post("/beheer/inlog/code", { email: BEHEERDER });
    const goed = codeUit(verstuurd[0]);
    const fout = goed === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++) expect((await post("/beheer/inlog", { email: BEHEERDER, code: fout })).status).toBe(401);
    expect((await post("/beheer/inlog", { email: BEHEERDER, code: goed })).status).toBe(401);
    // een nieuwe code vervangt de oude
    await post("/beheer/inlog/code", { email: BEHEERDER });
    expect((await post("/beheer/inlog", { email: BEHEERDER, code: codeUit(verstuurd[1]) })).status).toBe(200);
  });

  it("een verlopen code of een verlopen sessie werkt niet", async () => {
    await post("/beheer/inlog/code", { email: BEHEERDER });
    db.raw.prepare("UPDATE sz_inlogcode SET verloopt = 1").run();
    expect((await post("/beheer/inlog", { email: BEHEERDER, code: codeUit(verstuurd[0]) })).status).toBe(401);
    await post("/beheer/inlog/code", { email: BEHEERDER });
    const { token } = await jsonVan(post("/beheer/inlog", { email: BEHEERDER, code: codeUit(verstuurd[1]) }));
    db.raw.prepare("UPDATE sz_beheersessie SET verloopt = 1").run();
    expect((await req("/api/strooizout/beheer/overzicht", { token })).status).toBe(401);
  });

  it("wordt een adres uit de lijst gehaald, dan vervalt de sessie van dat adres", async () => {
    await post("/beheer/inlog/code", { email: BEHEERDER });
    const { token } = await jsonVan(post("/beheer/inlog", { email: BEHEERDER, code: codeUit(verstuurd[0]) }));
    env.STROOIZOUT_BEHEER_EMAILS = "tweede@example.com";
    expect((await req("/api/strooizout/beheer/overzicht", { token })).status).toBe(401);
  });

  it("begrensd per adres: na vijf aanvragen in een uur gaat er geen mail meer uit", async () => {
    for (let i = 0; i < 7; i++) expect((await post("/beheer/inlog/code", { email: BEHEERDER }, { ip: `203.0.113.${60 + i}` })).status).toBe(200);
    expect(verstuurd).toHaveLength(5);
  });

  it("zonder mailvoorziening, schakelaar of beheeradres is deze inlog er niet", async () => {
    for (const weg of ["SZ_MAIL", "STROOIZOUT_MAIL", "STROOIZOUT_BEHEER_EMAILS"] as const) {
      const zonder = { ...env, [weg]: undefined };
      const r = await handleApi(new Request(`${ORIGIN}/api/strooizout/beheer/inlog`), zonder as Env, ctx);
      expect((await r.json()) as J).toMatchObject({ met_mail: false });
      const c = await handleApi(new Request(`${ORIGIN}/api/strooizout/beheer/inlog/code`, { method: "POST", headers: { "Content-Type": "application/json", Origin: ORIGIN }, body: JSON.stringify({ email: BEHEERDER }) }), zonder as Env, ctx);
      expect(c.status).toBe(503);
    }
    expect(verstuurd).toHaveLength(0);
  });
});

describe("e-mail na een bestelling", () => {
  const KLANT = { naam: "Anna de Vries", email: "anna@example.com", telefoon: "06 12345678" };
  let teller = 0;
  const bestel = (extra: Record<string, unknown> = {}) =>
    post("/bestelling", { idempotentie: `mail-${++teller}-abcdefghijklmnop`, regels: [{ product_id: 1, aantal: 2 }], levering: "ophalen", betaalwijze: "tikkie", klant: KLANT, akkoord: true, bedrijf_extra: "", invultijd_ms: 8000, ...extra });
  beforeEach(async () => {
    await req("/api/strooizout/beheer/rondes", { method: "POST", body: JSON.stringify({ naam: "Winter test", sluit_op: null }), token: ADMIN, headers: { Origin: ORIGIN } });
  });

  it("de klant krijgt de afhaalcode, de bestelling en de link naar de bestelpagina", async () => {
    expect((await jsonVan(req("/api/strooizout/winkel"))).mail).toBe(true);
    const r = await bestel();
    expect(r.status).toBe(201);
    const { bestelling } = await jsonVan(r);
    await Promise.all(wachtend);
    expect(verstuurd.map((m) => m.to)).toEqual(["anna@example.com", BEHEERDER, "tweede@example.com"]);
    const mail = verstuurd[0];
    expect(mail.to).toBe("anna@example.com");
    expect(mail.subject).toBe(`Je bestelling ${bestelling.afhaalcode} bij Strooizout voor de buurt`);
    expect(mail.text).toContain(bestelling.afhaalcode);
    expect(mail.text).toContain("2 × Strooizout 25 kg");
    expect(mail.text).toContain("Totaal: € 18,98");
    expect(mail.text).toContain("We sturen je een Tikkie op je mobiel. Daarna kun je je bestelling komen ophalen.");
    expect(mail.text).toContain(`https://strooizouthouten.nl/bestelling#${bestelling.code}`);
    expect(mail.html).toContain(bestelling.afhaalcode);
    expect(mail.text + mail.html).not.toMatch(/reserver|contant/i);
    // zonder afhaaladres in de instellingen: de verwijzing naar de bestelpagina
    expect(mail.text).toContain("Het adres en de afhaalmomenten staan op je bestelpagina");

    // de beheerder krijgt een melding, zonder gegevens van de klant
    const melding = verstuurd[1];
    expect(melding.subject).toBe(`Nieuwe bestelling ${bestelling.afhaalcode}: € 18,98, afhalen`);
    expect(melding.text).toContain(`${bestelling.nummer} · afhaalcode ${bestelling.afhaalcode}`);
    expect(melding.text).toContain("2 × Strooizout 25 kg");
    expect(melding.text).toContain("Stuur de klant een Tikkie");
    expect(melding.text).toContain("Beheer: https://strooizouthouten.nl/beheer");
    expect(melding.text + melding.html).not.toMatch(/Anna|de Vries|anna@example\.com|12345678/);
  });

  it("met afhaaladres en mobiel nummer in de instellingen: het adres, appen of bellen en een WhatsApp-link met de afhaalcode", async () => {
    await req("/api/strooizout/beheer/instellingen", { method: "PUT", body: JSON.stringify({ afhaal_adres: "Voorbeeldstraat 1, Houten", contact_telefoon: "06 00 00 00 00" }), token: ADMIN, headers: { Origin: ORIGIN } });
    const { bestelling } = await jsonVan(bestel());
    await Promise.all(wachtend);
    const mail = verstuurd[0];
    expect(mail.text).toContain("Afhalen: Voorbeeldstraat 1, Houten\nApp of bel even om af te spreken wanneer je langskomt: 06 00 00 00 00.\nNeem je afhaalcode mee.");
    expect(mail.text).toContain("Stuur een appje: https://wa.me/31600000000?text=");
    expect(decodeURIComponent(mail.text.match(/wa\.me\/31600000000\?text=(\S+)/)![1])).toBe(`Hoi, ik wil mijn strooizout komen afhalen (afhaalcode ${bestelling.afhaalcode}). Wanneer kan ik langskomen?`);
    expect(mail.html).toContain("<strong>Afhalen: Voorbeeldstraat 1, Houten</strong>");
    expect(mail.html).toContain(">Stuur een appje via WhatsApp</a>");
    // een vast nummer: wel bellen, geen WhatsApp-link
    await req("/api/strooizout/beheer/instellingen", { method: "PUT", body: JSON.stringify({ contact_telefoon: "030 000 00 00" }), token: ADMIN, headers: { Origin: ORIGIN } });
    verstuurd.length = 0;
    await bestel();
    await Promise.all(wachtend);
    expect(verstuurd[0].text).toContain("\nBel even om af te spreken wanneer je langskomt: 030 000 00 00.");
    expect(verstuurd[0].text).not.toContain("wa.me");
  });

  it("met mail is het e-mailadres verplicht; zonder mail blijft het optioneel en gaat er niets uit", async () => {
    const zonderAdres = await bestel({ klant: { ...KLANT, email: "" } });
    expect(zonderAdres.status).toBe(422);
    expect((await jsonVan(zonderAdres)).velden.email).toMatch(/e-mailadres/);
    env.STROOIZOUT_MAIL = undefined;
    expect((await jsonVan(req("/api/strooizout/winkel"))).mail).toBe(false);
    expect((await bestel({ klant: { ...KLANT, email: "" } })).status).toBe(201);
    expect((await bestel()).status).toBe(201);
    await Promise.all(wachtend);
    expect(verstuurd).toHaveLength(0);
  });

  it("mislukt het versturen, dan staat de bestelling er gewoon", async () => {
    env.SZ_MAIL = { send: async () => Promise.reject(new Error("storing")) };
    const r = await bestel();
    expect(r.status).toBe(201);
    await Promise.all(wachtend);
    expect(db.raw.prepare("SELECT COUNT(*) AS n FROM sz_bestelling").get()).toMatchObject({ n: 1 });
  });

  it("aan de weg (QR) is geen e-mailadres nodig", async () => {
    db.raw.prepare("UPDATE sz_product SET voorraad = 10, voorraad_verwacht = 10 WHERE id = 1").run();
    const r = await bestel({ kanaal: "straat", betaalwijze: "bij_ontvangst", klant: { naam: "", telefoon: "06 12345678" } });
    expect([201, 409]).toContain(r.status);
    await Promise.all(wachtend);
    expect(verstuurd).toHaveLength(0);
  });
});
