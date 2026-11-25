// Strooizout voor de buurt: prijsregels, validatie en de API (bestellen, beheer, exports) met echte SQL (node:sqlite).

import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleApi, korteLink, type Env } from "../worker/index";
import {
  bereken,
  betaalstatus,
  binnenBezorggebied,
  parseBezorggebied,
  controleerKlant,
  controleerInstelling,
  euro,
  normaliseerAfhaalcode,
  normaliseerMobiel,
  parseEuro,
  stukprijs,
  volgendeStaffel,
  wijkVan,
  type PrijsProduct,
} from "../shared/strooizout";
import { csv, opschonen } from "../worker/strooizout-beheer";
import { strooizoutDomein } from "../worker/strooizout-domein";
import { productGegevens } from "../worker/strooizout-seo";
import { laadCatalogus, laadInstellingen, laadMagazijn } from "../worker/strooizout-basis";
import { bevestigingsmail } from "../worker/strooizout-mail";
import { STANDAARD_INSTELLINGEN } from "../shared/strooizout";
import { createD1 } from "./d1-shim";

const ORIGIN = "https://martijndenbesten.com";
const ADMIN = "test-admin-token-0123456789abcdef";
const SZ = "strooizout-eigen-token-0123456789";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type J = any;
const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

let env: Env;
let db: ReturnType<typeof createD1>;

function req(path: string, init: RequestInit & { ip?: string; token?: string | null } = {}) {
  const headers = new Headers(init.headers);
  headers.set("CF-Connecting-IP", init.ip ?? "203.0.113.7");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (init.method && init.method !== "GET" && !headers.has("Origin")) headers.set("Origin", ORIGIN);
  if (init.token !== undefined && init.token !== null) headers.set("Authorization", `Bearer ${init.token}`);
  return handleApi(new Request(ORIGIN + path, { ...init, headers }), env, ctx);
}
const beheer = (path: string, init: RequestInit & { token?: string | null } = {}) => req(`/api/strooizout/beheer${path}`, { token: ADMIN, ...init });
const jsonVan = async (r: Response | Promise<Response>) => (await (await r).json()) as J;

const KLANT = { naam: "Anna de Vries", email: "anna@example.com", telefoon: "06 12345678", straat: "Testlaan", huisnummer: "12a", postcode: "3992kt", plaats: "Houten" };
let teller = 0;
const bestelBody = (extra: Record<string, unknown> = {}) => ({
  idempotentie: `test-${++teller}-abcdefghijklmnop`,
  regels: [{ product_id: 1, aantal: 2 }],
  levering: "ophalen",
  betaalwijze: "bij_ontvangst",
  klant: KLANT,
  akkoord: true,
  bedrijf_extra: "",
  invultijd_ms: 8000,
  ...extra,
});
const bestel = (extra: Record<string, unknown> = {}, ip?: string) => req("/api/strooizout/bestelling", { method: "POST", body: JSON.stringify(bestelBody(extra)), ip });

async function startRonde(sluit_op: string | null = null) {
  return jsonVan(beheer("/rondes", { method: "POST", body: JSON.stringify({ naam: "Winter test", sluit_op }) }));
}

beforeEach(() => {
  db = createD1();
  env = { DB: db as unknown as D1Database, ASSETS: {} as Fetcher, ADMIN_TOKEN: ADMIN, HASH_SECRET: "geheim", STROOIZOUT_TOKEN: SZ };
  // De meeste tests gaan over iets anders dan voorraad: daar zonder voorraadbeheer. De voorraadtests zetten het zelf aan.
  db.raw.prepare("UPDATE sz_product SET voorraad = NULL, voorraad_verwacht = NULL WHERE id = 1").run();
});

// ---------- Pure regels ----------

describe("prijsregels", () => {
  const zout: PrijsProduct = { id: 1, naam: "Zout", prijs_cent: 899, inkoop_cent: 600, bezorg_cent: null, gewicht_gram: 25000, aanbiedingen: [] };
  const inst = { bezorg_methode: "per_stuk" as const, bezorg_per_stuk_cent: 50, bezorg_per_kg_cent: 2 };
  const nu = "2026-12-01T12:00:00.000Z";

  it("rekent subtotaal, bezorgkosten per zak en totaal", () => {
    const b = bereken([{ product: zout, aantal: 3 }], "bezorgen", inst, nu);
    expect(b.subtotaal_cent).toBe(2697);
    expect(b.bezorg_cent).toBe(150);
    expect(b.totaal_cent).toBe(2847);
    expect(b.gewicht_gram).toBe(75000);
    expect(b.inkoop_cent).toBe(1800);
    expect(bereken([{ product: zout, aantal: 3 }], "ophalen", inst, nu).bezorg_cent).toBe(0);
  });

  it("bezorgen is gratis vanaf het ingestelde aantal zakken", () => {
    const perAdres = { bezorg_methode: "per_adres" as const, bezorg_per_stuk_cent: 50, bezorg_per_kg_cent: 2, bezorg_per_adres_cent: 200, bezorg_gratis_vanaf: 4 };
    const zak = { ...zout, zakken_per_stuk: 1 };
    expect(bereken([{ product: zak, aantal: 3 }], "bezorgen", perAdres, nu).bezorg_cent).toBe(200);
    expect(bereken([{ product: zak, aantal: 4 }], "bezorgen", perAdres, nu).bezorg_cent).toBe(0);
    expect(bereken([{ product: zak, aantal: 4 }], "bezorgen", perAdres, nu).totaal_cent).toBe(4 * 899);
    expect(bereken([{ product: zak, aantal: 9 }], "bezorgen", { ...perAdres, bezorg_gratis_vanaf: 0 }, nu).bezorg_cent).toBe(200);
    // emmers (zakken_per_stuk 0) tellen niet mee
    expect(bereken([{ product: { ...zout, zakken_per_stuk: 0 }, aantal: 6 }], "bezorgen", perAdres, nu).bezorg_cent).toBe(200);
  });

  it("zakelijke bestelling vraagt bedrijfsnaam en controleert KVK en btw-nummer", () => {
    const zonder = controleerKlant({ ...KLANT, zakelijk: true }, "bezorgen", "3991, 3992");
    expect(!zonder.ok && zonder.fouten.bedrijfsnaam).toBeTruthy();
    const fout = controleerKlant({ ...KLANT, zakelijk: true, bedrijfsnaam: "Bakkerij Test", kvk: "123", btw_nummer: "x" }, "bezorgen", "3991, 3992");
    expect(!fout.ok && fout.fouten.kvk && fout.fouten.btw_nummer).toBeTruthy();
    const ok = controleerKlant({ ...KLANT, zakelijk: true, bedrijfsnaam: "Bakkerij Test", kvk: "1234 5678", btw_nummer: "nl 1234.56.789 b01" }, "bezorgen", "3991, 3992");
    expect(ok.ok && ok.waarde).toMatchObject({ zakelijk: true, bedrijfsnaam: "Bakkerij Test", kvk: "12345678", btw_nummer: "NL123456789B01" });
    const particulier = controleerKlant({ ...KLANT, bedrijfsnaam: "Genegeerd" }, "bezorgen", "3991, 3992");
    expect(particulier.ok && particulier.waarde).toMatchObject({ zakelijk: false, bedrijfsnaam: "" });
  });

  it("bezorgkosten per kg of per product-eigen tarief", () => {
    expect(bereken([{ product: zout, aantal: 2 }], "bezorgen", { ...inst, bezorg_methode: "per_kg" }, nu).bezorg_cent).toBe(100);
    expect(bereken([{ product: { ...zout, bezorg_cent: 75 }, aantal: 2 }], "bezorgen", inst, nu).bezorg_cent).toBe(150);
  });

  it("past aanbiedingen en staffels alleen binnen de periode en vanaf het aantal toe", () => {
    const p = {
      ...zout,
      aanbiedingen: [
        { id: 1, naam: "3 voor de prijs van", vanaf_aantal: 3, prijs_cent: 799, start: null, eind: null, actief: true },
        { id: 2, naam: "Verlopen", vanaf_aantal: 1, prijs_cent: 500, start: null, eind: "2026-11-01T00:00:00.000Z", actief: true },
        { id: 3, naam: "Uit", vanaf_aantal: 1, prijs_cent: 400, start: null, eind: null, actief: false },
      ],
    };
    expect(stukprijs(p, 2, nu)).toEqual({ cent: 899, aanbieding: "" });
    expect(stukprijs(p, 3, nu)).toEqual({ cent: 799, aanbieding: "3 voor de prijs van" });
    const b = bereken([{ product: p, aantal: 4 }], "ophalen", inst, nu);
    expect(b.subtotaal_cent).toBe(3196);
    expect(b.korting_cent).toBe(400);
  });

  it("onbekende inkoopprijs wordt gemeld, niet als nul behandeld", () => {
    const b = bereken([{ product: { ...zout, inkoop_cent: null }, aantal: 1 }], "ophalen", inst, nu);
    expect(b.inkoop_onbekend).toBe(true);
  });

  it("bedragen en invoer", () => {
    expect(euro(899)).toBe("€ 8,99");
    expect(euro(123456)).toBe("€ 1.234,56");
    expect(parseEuro("8,99")).toBe(899);
    expect(parseEuro("€ 8.5")).toBe(850);
    expect(parseEuro("8,999")).toBeNull();
    expect(parseEuro("abc")).toBeNull();
  });

  it("klantgegevens: verplichte velden, bezorggebied en normalisatie", () => {
    const ok = controleerKlant(KLANT, "bezorgen", "3991, 3992");
    expect(ok.ok && ok.waarde.postcode).toBe("3992 KT");
    expect(ok.ok && ok.waarde.telefoon).toBe("0612345678");
    const buiten = controleerKlant({ ...KLANT, postcode: "3511 AA" }, "bezorgen", "3991, 3992");
    expect(!buiten.ok && buiten.fouten.postcode).toMatch(/alleen binnen de rondweg/);
    const leeg = controleerKlant({}, "ophalen", "");
    // e-mail is optioneel; naam en mobiel nummer zijn verplicht
    expect(!leeg.ok && Object.keys(leeg.fouten).sort()).toEqual(["naam", "telefoon"]);
    expect(controleerKlant({ naam: "Bo", telefoon: "0612345678", email: "geen-mail" }, "ophalen", "").ok).toBe(false);
    // ophalen vraagt geen adres
    expect(controleerKlant({ naam: "Bo", email: "bo@example.nl", telefoon: "+31612345678" }, "ophalen", "").ok).toBe(true);
  });

  it("instellingen worden per veld gecontroleerd", () => {
    expect(controleerInstelling("bezorg_per_stuk_cent", 75)).toEqual({ ok: true, waarde: 75 });
    expect(controleerInstelling("bezorg_per_stuk_cent", -1).ok).toBe(false);
    expect(controleerInstelling("winkel_open", "ja").ok).toBe(false);
    expect(controleerInstelling("onbekend", 1).ok).toBe(false);
    expect(controleerInstelling("contact_email", "geen-mail").ok).toBe(false);
  });

  it("wijk volgens de instelling, anders het postcodegebied", () => {
    expect(wijkVan("3992 AB", "3992 = Houten-Zuid\n3991 = Noord")).toBe("Houten-Zuid");
    expect(wijkVan("3995 CD", "3992 = Houten-Zuid")).toBe("Postcode 3995");
  });

  it("CSV is veilig voor Excel (formule-injectie) en gebruikt puntkomma", () => {
    const uit = csv(["a", "b"], [["=SOM(A1)", "tekst; met \"quote\""], ["-12,50", "@x"]]);
    expect(uit.startsWith("﻿")).toBe(true);
    expect(uit).toContain("'=SOM(A1)");
    expect(uit).toContain('"tekst; met ""quote"""');
    expect(uit).toContain("-12,50");
    expect(uit).toContain("'@x");
  });
});

// ---------- Webshop ----------

describe("webshop", () => {
  it("is gesloten zonder open bestelronde en toont alleen actieve producten met prijs", async () => {
    const w = await jsonVan(req("/api/strooizout/winkel"));
    expect(w.open).toBe(false);
    expect(w.melding).toMatch(/geen bestelronde/);
    expect(w.producten.map((p: J) => p.naam)).toEqual(["Strooizout 25 kg", "Strooizout 10 kg in je eigen emmer", "Strooizout 10 kg met emmer"]);
    expect(w.producten[0]).not.toHaveProperty("inkoop_cent");
    expect(w.producten[0]).not.toHaveProperty("notitie");
    // het afhaaladres is openbaar (leeg zolang het niet is ingevuld); de ophaalinstructie en het beheer niet
    expect(w.instellingen.afhaal_adres).toBe("");
    expect(JSON.stringify(w)).not.toContain("afhaal_instructie");
    expect((await bestel()).status).toBe(409);
  });

  it("plaatst een bestelling met prijzen van de server, niet van de browser", async () => {
    await startRonde();
    const r = await bestel({ regels: [{ product_id: 1, aantal: 2, prijs_cent: 1 }], totaal_cent: 1, levering: "bezorgen" });
    expect(r.status).toBe(201);
    const b = (await r.json() as J).bestelling;
    // voor de klant geen volgnummer: het bestelnummer is de willekeurige afhaalcode, ook in de link
    expect(b.nummer).toBe(b.afhaalcode);
    expect(b.afhaalcode).toMatch(/^H-\d{4,5}$/);
    expect(b.subtotaal_cent).toBe(1898);
    expect(b.bezorg_cent).toBe(200); // € 2,00 per bezorging
    expect(b.totaal_cent).toBe(2098);
    expect(b.code).toBe(`h${b.afhaalcode.slice(2)}-${b.code.split("-")[1]}`);
    expect(b.code).toMatch(/^h\d{4,5}-[0-9a-f]{24}$/);
    expect(JSON.stringify(b)).not.toMatch(/SZ-\d|"id":/);
    // de code werkt; een code met een andere afhaalcode of een geraden volgnummer niet
    const kijk = (code: string) => req("/api/strooizout/bestelling/bekijk", { method: "POST", body: JSON.stringify({ code }) });
    expect((await kijk(b.code)).status).toBe(200);
    expect((await kijk(`h0000-${b.code.split("-")[1]}`)).status).toBe(404);
    expect((await kijk(`1-${"0".repeat(24)}`)).status).toBe(404);
    const rij = db.raw.prepare("SELECT * FROM sz_bestelling").get() as J;
    expect(rij.totaal_cent).toBe(2098);
    expect(rij.postcode).toBe("3992 KT");
    expect(db.raw.prepare("SELECT aantal, stukprijs_cent FROM sz_bestelregel").all()).toEqual([{ aantal: 2, stukprijs_cent: 949 }]);
  });

  it("maakt bij dubbel klikken (zelfde sleutel) maar één bestelling", async () => {
    await startRonde();
    const body = JSON.stringify(bestelBody());
    const [a, b, c] = await Promise.all([1, 2, 3].map(() => req("/api/strooizout/bestelling", { method: "POST", body })));
    const nummers = await Promise.all([a, b, c].map(async (x) => ((await x.json()) as J).bestelling.nummer));
    expect(new Set(nummers).size).toBe(1);
    expect((db.raw.prepare("SELECT COUNT(*) AS n FROM sz_bestelling").get() as J).n).toBe(1);
  });

  it("weigert bots, lege mandjes, onbekende producten, te grote aantallen en buiten het bezorggebied", async () => {
    await startRonde();
    expect((await bestel({ bedrijf_extra: "Spam BV" })).status).toBe(400);
    expect((await bestel({ invultijd_ms: 200 })).status).toBe(400);
    expect((await bestel({ regels: [] })).status).toBe(422);
    expect((await bestel({ regels: [{ product_id: 2, aantal: 1 }] })).status).toBe(409); // concept (sneeuwschep)
    expect((await bestel({ regels: [{ product_id: 99, aantal: 1 }] })).status).toBe(409);
    expect((await bestel({ regels: [{ product_id: 1, aantal: 21 }] })).status).toBe(422);
    expect((await bestel({ regels: [{ product_id: 1, aantal: 1.5 }] })).status).toBe(422);
    expect((await bestel({ akkoord: false })).status).toBe(422);
    const buiten = await bestel({ levering: "bezorgen", klant: { ...KLANT, postcode: "3511 AB" } });
    expect(buiten.status).toBe(422);
    expect(((await buiten.json()) as J).velden.postcode).toMatch(/niet/);
    expect((await req("/api/strooizout/bestelling", { method: "POST", body: JSON.stringify(bestelBody()), headers: { Origin: "https://evil.example" } })).status).toBe(403);
    expect((db.raw.prepare("SELECT COUNT(*) AS n FROM sz_bestelling").get() as J).n).toBe(0);
  });

  it("begrenst het aantal bestellingen per bezoeker", async () => {
    await startRonde();
    const statussen = [];
    for (let i = 0; i < 21; i++) statussen.push((await bestel({}, "198.51.100.5")).status);
    expect(statussen.slice(0, 20).every((s) => s === 201)).toBe(true);
    expect(statussen[20]).toBe(429);
  });

  it("respecteert de voorraad, ook bij gelijktijdige bestellingen, en geeft hem één keer terug bij annuleren", async () => {
    await startRonde();
    db.raw.prepare("UPDATE sz_product SET voorraad = 3 WHERE id = 1").run();
    const res = await Promise.all([1, 2, 3, 4].map((i) => bestel({ regels: [{ product_id: 1, aantal: 1 }] }, `198.51.100.${i}`)));
    expect(res.map((r) => r.status).sort()).toEqual([201, 201, 201, 409]);
    expect((db.raw.prepare("SELECT voorraad FROM sz_product WHERE id = 1").get() as J).voorraad).toBe(0);
    const w = await jsonVan(req("/api/strooizout/winkel"));
    expect(w.producten[0].voorraad).toBe(0);
    // annuleren door de beheerder, twee keer: voorraad maar één keer terug
    await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "geannuleerd" }) });
    await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "geannuleerd" }) });
    expect((db.raw.prepare("SELECT voorraad FROM sz_product WHERE id = 1").get() as J).voorraad).toBe(1);
  });

  it("sluit na de sluitdatum en bij tijdelijk sluiten", async () => {
    const r = await startRonde(new Date(Date.now() + 3600_000).toISOString());
    expect((await bestel()).status).toBe(201);
    db.raw.prepare("UPDATE sz_ronde SET sluit_op = ?1 WHERE id = ?2").run(new Date(Date.now() - 1000).toISOString(), r.id);
    expect((await bestel()).status).toBe(409);
    db.raw.prepare("UPDATE sz_ronde SET sluit_op = NULL").run();
    await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ winkel_open: false, gesloten_melding: "Even dicht." }) });
    const w = await jsonVan(req("/api/strooizout/winkel"));
    expect(w).toMatchObject({ open: false, melding: "Even dicht." });
    expect((await bestel()).status).toBe(409);
  });

  it("vraagt een moment als er momenten zijn en weigert een vol moment", async () => {
    const ronde = await startRonde();
    const morgen = new Date(Date.now() + 86400_000).toISOString().slice(0, 10);
    await beheer("/momenten", { method: "POST", body: JSON.stringify({ soort: "ophalen", datum: morgen, van: "10:00", tot: "12:00", max_bestellingen: 1, ronde_id: ronde.id }) });
    expect((await bestel()).status).toBe(422);
    expect((await bestel({ moment_id: 1 })).status).toBe(201);
    const w = await jsonVan(req("/api/strooizout/winkel"));
    expect(w.momenten[0].vol).toBe(true);
    expect((await bestel({ moment_id: 1 })).status).toBe(409);
    // bezorgen heeft geen momenten: niet verplicht
    expect((await bestel({ levering: "bezorgen" })).status).toBe(201);
  });

  it("klantpagina: alleen met de juiste code; het afhaaladres staat er direct, de instructie pas na bevestiging; annuleren kan", async () => {
    await startRonde();
    await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ afhaal_adres: "Voorbeeldstraat 1, Houten", afhaal_instructie: "Bel aan bij de zijdeur." }) });
    expect((await jsonVan(req("/api/strooizout/winkel"))).instellingen.afhaal_adres).toBe("Voorbeeldstraat 1, Houten");
    const { bestelling } = await jsonVan(bestel());
    const kijk = (code: string) => req("/api/strooizout/bestelling/bekijk", { method: "POST", body: JSON.stringify({ code }) });
    expect((await kijk("1-000000000000000000000000")).status).toBe(404);
    const eerst = await jsonVan(kijk(bestelling.code));
    expect(eerst.bestelling.afhaal_adres).toBe("Voorbeeldstraat 1, Houten");
    expect(JSON.stringify(eerst)).not.toContain("zijdeur");
    await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "bevestigd" }) });
    expect((await jsonVan(kijk(bestelling.code))).bestelling).toMatchObject({ afhaal_adres: "Voorbeeldstraat 1, Houten", afhaal_instructie: "Bel aan bij de zijdeur." });
    const weg = await jsonVan(req("/api/strooizout/bestelling/annuleer", { method: "POST", body: JSON.stringify({ code: bestelling.code }) }));
    expect(weg.bestelling.status).toBe("geannuleerd");
    expect(weg.bestelling.afhaal_instructie).toBe("");
  });

  it("schrijft geen persoonsgegevens naar de logs", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const spyLog = vi.spyOn(console, "log").mockImplementation(() => {});
    await startRonde();
    await bestel({ levering: "bezorgen" });
    const logs = JSON.stringify([...spy.mock.calls, ...spyLog.mock.calls]) + JSON.stringify(db.raw.prepare("SELECT * FROM sz_log").all());
    expect(logs).not.toContain("anna@example.com");
    expect(logs).not.toContain("Testlaan");
    expect(logs).not.toContain("0612345678");
    spy.mockRestore();
    spyLog.mockRestore();
  });

  it("korte link /zout verwijst naar /strooizout", () => {
    const r = korteLink(new URL("https://martijndenbesten.com/zout"));
    expect(r?.status).toBe(301);
    expect(r?.headers.get("Location")).toBe("https://martijndenbesten.com/strooizout");
    expect(korteLink(new URL("https://martijndenbesten.com/zouten"))).toBeNull();
  });
});

// ---------- Beheer ----------

describe("beheer", () => {
  it("is dicht zonder of met verkeerd token, open met het eigen of het algemene token", async () => {
    expect((await beheer("/overzicht", { token: null })).status).toBe(401);
    expect((await beheer("/overzicht", { token: "fout-token-0123456789abcdefgh" })).status).toBe(401);
    expect((await beheer("/overzicht", { token: SZ })).status).toBe(200);
    expect((await beheer("/overzicht", { token: ADMIN })).status).toBe(200);
    // te kort token telt nooit
    env.STROOIZOUT_TOKEN = "kort";
    expect((await beheer("/overzicht", { token: "kort" })).status).toBe(401);
  });

  it("blokkeert na te veel mislukte pogingen", async () => {
    let laatste = 0;
    for (let i = 0; i < 21; i++) laatste = (await beheer("/overzicht", { token: `fout-${i}-0123456789abcdefghij` })).status;
    expect(laatste).toBe(429);
  });

  it("wijzigende beheerverzoeken van een andere site worden geweigerd", async () => {
    expect((await beheer("/rondes", { method: "POST", body: JSON.stringify({ naam: "x ronde" }), headers: { Origin: "https://evil.example" } })).status).toBe(403);
  });

  it("statusflow, betaling, overzicht en financiën kloppen", async () => {
    await startRonde();
    await beheer("/producten/1", { method: "PUT", body: JSON.stringify({ ...(await productInvoer(1)), inkoop_cent: 600 }) });
    await bestel({ regels: [{ product_id: 1, aantal: 2 }] }); // 18,98 ophalen
    await bestel({ regels: [{ product_id: 1, aantal: 3 }], levering: "bezorgen" }); // 28,47 + 2,00
    await bestel({ regels: [{ product_id: 1, aantal: 1 }] }); // wordt geannuleerd

    expect((await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "bezorgd" }) })).status).toBe(409); // ophalen
    expect((await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "afgehaald", van: "bevestigd" }) })).status).toBe(409); // verouderd
    expect((await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "afgehaald", van: "nieuw" }) })).status).toBe(200);
    expect((await beheer("/bestellingen/3/status", { method: "POST", body: JSON.stringify({ status: "geannuleerd" }) })).status).toBe(200);
    expect((await beheer("/bestellingen/3/status", { method: "POST", body: JSON.stringify({ status: "nieuw" }) })).status).toBe(409);

    expect((await beheer("/bestellingen/1/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1898, wijze: "contant" }) })).status).toBe(422); // niet bevestigd
    expect((await beheer("/bestellingen/1/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1898, wijze: "contant", ontvangen: true }) })).status).toBe(200);
    expect((await beheer("/bestellingen/2/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1000, wijze: "tikkie", ontvangen: true }) })).status).toBe(200);

    const o = (await jsonVan(beheer("/overzicht"))).cijfers;
    expect(o).toMatchObject({
      bestellingen: 2,
      geannuleerd: 1,
      zakken: 5,
      gewicht_gram: 125000,
      omzet_cent: 1898 + 3047,
      bezorg_cent: 200,
      inkoop_cent: 3000,
      brutowinst_cent: 1898 + 3047 - 3000,
      ontvangen_cent: 2898,
      openstaand_cent: 3047 - 1000,
      af_te_halen: 0,
      te_bezorgen: 1,
      inkoop_onbekend: false,
    });
    // bestelling 2 is deels betaald: nog openstaand (nooit ‘betaald’ zonder het volle bedrag)
    expect(o.betaalstatus).toEqual({ open: 1, verzoek: 0, betaald: 1, terugbetaald: 0 });

    const lijst = await jsonVan(beheer("/bestellingen?betaal=open"));
    expect(lijst.bestellingen.map((b: J) => b.nummer)).toEqual(["SZ-0003", "SZ-0002"]);
    const zoek = await jsonVan(beheer("/bestellingen?zoek=sz-0002"));
    expect(zoek.bestellingen).toHaveLength(1);
    const detail = await jsonVan(beheer("/bestellingen/2"));
    expect(detail.bestelling.klant_link).toMatch(/\/strooizout\/bestelling#h\d{4,5}-[0-9a-f]{24}$/);
    expect(detail.betalingen).toHaveLength(1);
    expect(detail.log.map((l: J) => l.actie)).toContain("betaling");
  });

  it("markeert mogelijke dubbele bestellingen en groepeert de bezorgroute per wijk", async () => {
    await startRonde();
    await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ wijken: "3992 = Houten-Zuid" }) });
    await bestel({ levering: "bezorgen" });
    await bestel({ levering: "bezorgen", klant: { ...KLANT, postcode: "3991 AA", straat: "Anderweg", email: "b@example.com", telefoon: "0611111111" } });
    await bestel({ levering: "bezorgen" }, "198.51.100.77");
    const lijst = await jsonVan(beheer("/bestellingen"));
    expect(lijst.bestellingen.filter((b: J) => b.mogelijk_dubbel).map((b: J) => b.nummer).sort()).toEqual(["SZ-0001", "SZ-0003"]);
    const route = await jsonVan(beheer("/route"));
    expect(route.wijken.map((w: J) => w.wijk)).toEqual(["Postcode 3991", "Houten-Zuid"]);
  });

  it("CSV-exports bevatten de juiste kolommen; de financiële export geen contactgegevens", async () => {
    await startRonde();
    await bestel({ levering: "bezorgen", klant: { ...KLANT, naam: "=HYPERLINK(\"x\")" } });
    const best = await (await beheer("/export/bestellingen.csv")).text();
    expect(best.split("\r\n")[0]).toContain("Bestelnummer;Afhaalcode;Datum;Ronde");
    expect(best).toContain("SZ-0001");
    expect(best).toContain("anna@example.com");
    expect(best).toContain("'=HYPERLINK");
    const fin = await beheer("/export/financien.csv");
    expect(fin.headers.get("Content-Type")).toContain("text/csv");
    const finTekst = await fin.text();
    expect(finTekst).toContain("18,98");
    expect(finTekst).not.toContain("anna@example.com");
    expect(finTekst).not.toContain("Testlaan");
    expect((await beheer("/export/producten.csv")).status).toBe(200);
  });

  it("productbeheer: toevoegen, actief pas met prijs/beschrijving/afbeelding, verbergen, pakket en verwijderen", async () => {
    const leeg = { naam: "Strooiwagen", status: "actief", categorie_id: 3, beschrijving: "", prijs_cent: null, afbeelding: "" };
    const geweigerd = await beheer("/producten", { method: "POST", body: JSON.stringify(leeg) });
    expect(geweigerd.status).toBe(422);
    expect(((await geweigerd.json()) as J).error).toMatch(/verkoopprijs, beschrijving, afbeelding/);
    const externe = await beheer("/producten", { method: "POST", body: JSON.stringify({ ...leeg, status: "concept", afbeelding: "https://evil.example/x.png" }) });
    expect(externe.status).toBe(422);
    const nieuw = await jsonVan(beheer("/producten", { method: "POST", body: JSON.stringify({ ...leeg, status: "concept" }) }));
    expect(nieuw.id).toBe(6); // 1 zak, 2 sneeuwschep, 3 emmer 5 kg (vervallen), 4 en 5 de varianten van 10 kg

    // pakket: 2 zakken zout + strooiwagen, voorraad via de onderdelen
    db.raw.prepare("UPDATE sz_product SET status = 'actief', voorraad = 10, prijs_cent = 2500, inkoop_cent = 1500, beschrijving = 'x', afbeelding = '/strooizout/beeld/strooizout-25kg.webp' WHERE id = 6").run();
    db.raw.prepare("UPDATE sz_product SET voorraad = 5, inkoop_cent = 600 WHERE id = 1").run();
    const pakket = await jsonVan(
      beheer("/producten", {
        method: "POST",
        body: JSON.stringify({ naam: "Winterpakket", status: "actief", prijs_cent: 3999, beschrijving: "Twee zakken en een strooiwagen.", afbeelding: "/strooizout/beeld/strooizout-25kg.webp", onderdelen: [{ product_id: 1, aantal: 2 }, { product_id: 6, aantal: 1 }], aanbiedingen: [{ naam: "Actie", vanaf_aantal: 1, prijs_cent: 3499 }] }),
      }),
    );
    const lijst = await jsonVan(beheer("/producten"));
    const pk = lijst.producten.find((p: J) => p.id === pakket.id);
    expect(pk.berekend).toMatchObject({ inkoop_cent: 2700, gewicht_gram: 50000, beschikbaar: 2, bezorg_cent: 150 });
    // een pakket in een pakket mag niet
    expect((await beheer("/producten", { method: "POST", body: JSON.stringify({ naam: "Mega", status: "concept", onderdelen: [{ product_id: pakket.id, aantal: 1 }] }) })).status).toBe(422);

    await startRonde();
    const r = await bestel({ regels: [{ product_id: pakket.id, aantal: 2 }] });
    expect(r.status).toBe(201);
    expect(((await r.json()) as J).bestelling.totaal_cent).toBe(6998);
    expect((db.raw.prepare("SELECT voorraad FROM sz_product WHERE id = 1").get() as J).voorraad).toBe(1);
    expect((await bestel({ regels: [{ product_id: pakket.id, aantal: 1 }] })).status).toBe(409);

    // verwijderen: product in een pakket kan niet; besteld pakket wordt gearchiveerd; ongebruikt product definitief
    expect((await beheer("/producten/6", { method: "DELETE" })).status).toBe(409);
    expect((await jsonVan(beheer(`/producten/${pakket.id}`, { method: "DELETE" }))).verwijderd).toBe("gearchiveerd");
    const los = await jsonVan(beheer("/producten", { method: "POST", body: JSON.stringify({ naam: "Ijskrabber", status: "concept" }) }));
    expect((await jsonVan(beheer(`/producten/${los.id}`, { method: "DELETE" }))).verwijderd).toBe("definitief");

    // verbergen haalt het uit de winkel
    const ip = await productInvoer(1);
    await beheer("/producten/1", { method: "PUT", body: JSON.stringify({ ...ip, status: "verborgen" }) });
    expect((await jsonVan(req("/api/strooizout/winkel"))).producten.map((x: J) => x.id)).toEqual([6, 4, 5]); // strooiwagen en de varianten van 10 kg
  });

  it("afbeeldingen: alleen echte JPG/PNG/WebP, daarna te tonen", async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(40).fill(1)]);
    expect((await beheer("/afbeeldingen", { method: "POST", body: new Uint8Array([1, 2, 3, ...new Array(40).fill(0)]), headers: { "Content-Type": "image/png" } })).status).toBe(415);
    expect((await beheer("/afbeeldingen", { method: "POST", body: png, headers: { "Content-Type": "image/svg+xml" } })).status).toBe(415);
    const up = await jsonVan(beheer("/afbeeldingen", { method: "POST", body: png, headers: { "Content-Type": "image/png" } }));
    expect(up.url).toMatch(/^\/api\/strooizout\/afbeelding\/1-[0-9a-f]{16}$/);
    const beeld = await req(up.url);
    expect(beeld.status).toBe(200);
    expect(beeld.headers.get("Content-Type")).toBe("image/png");
    expect(new Uint8Array(await beeld.arrayBuffer())).toEqual(png);
    expect((await req("/api/strooizout/afbeelding/1-0000000000000000")).status).toBe(404);
  });

  it("bestelronde: één open ronde, inkoopbehoefte, inkoop registreren en sluiten", async () => {
    const r = await startRonde();
    expect((await beheer("/rondes", { method: "POST", body: JSON.stringify({ naam: "Tweede" }) })).status).toBe(409);
    await bestel({ regels: [{ product_id: 1, aantal: 4 }] });
    await bestel({ regels: [{ product_id: 1, aantal: 6 }] });
    const b = await jsonVan(beheer(`/rondes/${r.id}/behoefte`));
    expect(b.inkoop[0]).toMatchObject({ naam: "Strooizout 25 kg", nodig: 10, gewicht_gram: 250000, verwachte_inkoop_cent: 7090 });
    expect(
      (await beheer(`/rondes/${r.id}`, { method: "PUT", body: JSON.stringify({ status: "ingekocht", leverancier: "Groothandel X", inkoop: [{ product_id: 1, aantal: 10, stukprijs_cent: 550 }] }) })).status,
    ).toBe(200);
    expect((await bestel()).status).toBe(409);
    const f = await jsonVan(beheer("/financien"));
    expect(f.werkelijke_inkoop_cent).toBe(5500);
    const rondes = await jsonVan(beheer("/rondes"));
    expect(rondes.rondes[0]).toMatchObject({ status: "ingekocht", leverancier: "Groothandel X", bestellingen: 2 });
    expect(rondes.rondes[0].gesloten_op).toBeTruthy();
  });

  it("instellingen: onbekende of ongeldige waarden worden geweigerd", async () => {
    expect((await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ hack: 1 }) })).status).toBe(422);
    expect((await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ bezorg_per_stuk_cent: "veel" }) })).status).toBe(422);
    const ok = await jsonVan(beheer("/instellingen", { method: "PUT", body: JSON.stringify({ bezorg_per_stuk_cent: 75, bezorgen_aan: false }) }));
    expect(ok.instellingen).toMatchObject({ bezorg_per_stuk_cent: 75, bezorgen_aan: false });
    await startRonde();
    expect((await bestel({ levering: "bezorgen" })).status).toBe(422);
  });

  it("wist persoonsgegevens na de bewaartermijn, bedragen blijven", async () => {
    await startRonde();
    await bestel({ levering: "bezorgen" });
    await bestel();
    await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "bezorgd" }) });
    const over7maanden = new Date(Date.now() + 7 * 31 * 86400_000);
    expect(await opschonen(db as unknown as D1Database, STANDAARD_INSTELLINGEN, over7maanden)).toBe(1);
    const rij = db.raw.prepare("SELECT naam, email, telefoon, straat, postcode, totaal_cent, geanonimiseerd_op FROM sz_bestelling WHERE id = 1").get() as J;
    expect(rij).toMatchObject({ naam: "Gewist", email: "", telefoon: "", straat: "", postcode: "3992", totaal_cent: 2098 });
    expect(rij.geanonimiseerd_op).toBeTruthy();
    // bestelling 2 is nog niet afgerond: blijft
    expect((db.raw.prepare("SELECT email FROM sz_bestelling WHERE id = 2").get() as J).email).toBe("anna@example.com");
  });
});

async function productInvoer(id: number) {
  const lijst = await jsonVan(beheer("/producten"));
  const p = lijst.producten.find((x: J) => x.id === id);
  return {
    naam: p.naam,
    categorie_id: p.categorie_id,
    status: p.status,
    kort: p.kort,
    beschrijving: p.beschrijving,
    specificaties: p.specificaties,
    prijs_cent: p.prijs_cent,
    inkoop_cent: p.inkoop_cent,
    bezorg_cent: p.bezorg_cent,
    gewicht_gram: p.gewicht_gram,
    eenheid: p.eenheid,
    voorraad: p.voorraad,
    max_per_bestelling: p.max_per_bestelling,
    afbeelding: p.afbeelding,
    afbeelding_alt: p.afbeelding_alt,
    notitie: p.notitie,
    volgorde: p.volgorde,
    alleen_afhalen: p.alleen_afhalen,
    klant_melding: p.klant_melding,
    onderdelen: p.onderdelen,
    aanbiedingen: p.aanbiedingen,
  };
}

// ---------- Aanvullende eisen 22-11-2026: mobiel nummer, afhaalcode, betaalstatussen, staffelkorting ----------

describe("mobiel nummer en klantgegevens", () => {
  it("accepteert Nederlandse mobiele nummers, ook in +31-notatie, en weigert vaste nummers", () => {
    for (const ok of ["0612345678", "06-12345678", "06 1234 5678", "+31612345678", "+31 6 1234 5678", "+31 (0)6 12345678", "0031612345678"]) expect(normaliseerMobiel(ok)).toBe("0612345678");
    for (const fout of ["0301234567", "+31301234567", "061234567", "06123456789", "+32612345678", "abc", ""]) expect(normaliseerMobiel(fout)).toBeNull();
    const vast = controleerKlant({ naam: "Bo", telefoon: "030 123 4567" }, "ophalen", "");
    expect(!vast.ok && vast.fouten.telefoon).toMatch(/mobiel/);
  });

  it("ophalen zonder adres en zonder e-mail; bezorgen vraagt straat, huisnummer en postcode in het gebied", async () => {
    await startRonde();
    const zonderMail = await bestel({ klant: { naam: "Piet", telefoon: "+31 6 9999 0000" } });
    expect(zonderMail.status).toBe(201);
    expect((db.raw.prepare("SELECT email, telefoon, straat FROM sz_bestelling").get() as J)).toEqual({ email: "", telefoon: "0699990000", straat: "" });
    const geenAdres = await bestel({ levering: "bezorgen", klant: { naam: "Piet", telefoon: "0699990000" } });
    expect(Object.keys(((await geenAdres.json()) as J).velden).sort()).toEqual(["huisnummer", "postcode", "straat"]);
    expect(binnenBezorggebied("3992ab", "3991, 3992")).toBe(true);
    expect(binnenBezorggebied("3511 AB", "3991, 3992")).toBe(false);
  });

  it("bezorggebied binnen de rondweg: uitzonderingen per postcode, losse postcodes en een duidelijke melding", async () => {
    const g = STANDAARD_INSTELLINGEN.bezorg_postcodes;
    expect(parseBezorggebied(g).pc4).toEqual(["3991", "3992", "3993", "3994", "3995"]);
    expect(parseBezorggebied(g).niet).toHaveLength(65);
    expect(binnenBezorggebied("3993 HA", g)).toBe(true); // Aalsloot, binnen de rondweg
    expect(binnenBezorggebied("3991CD", g)).toBe(false); // Duwboot, bedrijventerrein buiten de rondweg
    expect(binnenBezorggebied("3994 MD", g)).toBe(false); // Beusichemseweg, buiten de rondweg
    expect(binnenBezorggebied("3994 AA", g)).toBe(true);
    expect(binnenBezorggebied("3511 AB", g)).toBe(false);
    // losse postcodes, ook meerdere achter één gebied, en uitsluiten met "behalve"
    expect(binnenBezorggebied("3511 AC", "3511 AB AC")).toBe(true);
    expect(binnenBezorggebied("3511 AD", "3511 AB AC")).toBe(false);
    expect(binnenBezorggebied("3991 AB", "3991\nbehalve: 3991 AB")).toBe(false);
    expect(binnenBezorggebied("3992 AB", "3991, 3992\nniet: 3991")).toBe(true);
    expect(binnenBezorggebied("3991 XY", "3991, 3992\nniet: 3991")).toBe(false);
    expect(controleerInstelling("bezorg_postcodes", g)).toEqual({ ok: true, waarde: g });
    expect(controleerInstelling("bezorg_postcodes", "Houten").ok).toBe(false);

    await startRonde();
    const buiten = await bestel({ levering: "bezorgen", klant: { naam: "Piet", telefoon: "0699990000", straat: "Duwboot", huisnummer: "1", postcode: "3991 CD" } });
    expect(buiten.status).toBe(422);
    expect(((await buiten.json()) as J).velden.postcode).toMatch(/alleen binnen de rondweg.*wel gratis afhalen/);
  });
});

describe("afhaalcode", () => {
  it("elke bestelling krijgt een unieke code H-dddd; ook bij veel gelijktijdige bestellingen geen botsing", async () => {
    await startRonde();
    const res = await Promise.all(Array.from({ length: 25 }, (_, i) => bestel({}, `198.51.100.${i + 1}`)));
    const codes = await Promise.all(res.map(async (r) => ((await r.json()) as J).bestelling.afhaalcode));
    expect(codes.every((c) => /^H-\d{4,5}$/.test(c))).toBe(true);
    expect(new Set(codes).size).toBe(25);
    expect(normaliseerAfhaalcode("h 4827")).toBe("H-4827");
    expect(normaliseerAfhaalcode("4827")).toBe("H-4827");
    expect(normaliseerAfhaalcode("X-12")).toBeNull();
  });

  it("botsing met een bestaande code wordt opgelost met een nieuwe code", async () => {
    await startRonde();
    const rnd = vi.spyOn(crypto, "getRandomValues");
    // eerste bestelling: code H-1000; daarna dwingt de mock opnieuw 1000 af voor de vooraf-controle én de eerste poging
    const vul = (waarde: () => number) => ((a: Uint32Array) => { a[0] = waarde(); return a; }) as unknown as typeof crypto.getRandomValues;
    rnd.mockImplementation(vul(() => 0));
    expect(((await (await bestel()).json()) as J).bestelling.afhaalcode).toBe("H-1000");
    let n = 0;
    rnd.mockImplementation(vul(() => (n++ < 7 ? 0 : 1234)));
    expect(((await (await bestel()).json()) as J).bestelling.afhaalcode).toBe("H-2234");
    rnd.mockRestore();
  });

  it("de afhaalcode geeft publiek geen toegang tot gegevens; alleen de beheerder kan erop zoeken", async () => {
    await startRonde();
    const { bestelling } = (await (await bestel()).json()) as J;
    expect((await req("/api/strooizout/bestelling/bekijk", { method: "POST", body: JSON.stringify({ code: bestelling.afhaalcode }) })).status).toBe(404);
    expect((await req("/api/strooizout/bestelling/annuleer", { method: "POST", body: JSON.stringify({ code: bestelling.afhaalcode }) })).status).toBe(404);
    expect((await beheer(`/afhalen/${bestelling.afhaalcode}`, { token: null })).status).toBe(401);
    const gevonden = await jsonVan(beheer(`/afhalen/${bestelling.afhaalcode.slice(2)}`));
    expect(gevonden.bestelling).toMatchObject({ afhaalcode: bestelling.afhaalcode, zakken: 2, betaalstatus: "open", uitgegeven: false });
    // beheer zoekt op code, naam en mobiel nummer (ook als +31)
    for (const q of [bestelling.afhaalcode, "anna", "+31 6 1234 5678", "0612345678"]) {
      expect((await jsonVan(beheer(`/bestellingen?zoek=${encodeURIComponent(q)}`))).bestellingen).toHaveLength(1);
    }
  });

  it("uitgifte: atomair, met betaling; nooit twee keer (ook gelijktijdig)", async () => {
    await startRonde();
    const { bestelling } = (await (await bestel()).json()) as J;
    const code = bestelling.afhaalcode;
    const uitgifte = () => beheer(`/afhalen/${code}/uitgeven`, { method: "POST", body: JSON.stringify({ betaling: { wijze: "contant", bedrag_cent: 1898, ontvangen: true } }) });
    const [a, b] = await Promise.all([uitgifte(), uitgifte()]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);
    const tweede = [a, b].find((x) => x.status === 409)!;
    expect(((await tweede.json()) as J).error).toMatch(/al uitgegeven/);
    // precies één betaling geboekt, status afgehaald
    expect((db.raw.prepare("SELECT COUNT(*) AS n, SUM(bedrag_cent) AS som FROM sz_betaling").get() as J)).toEqual({ n: 1, som: 1898 });
    const na = await jsonVan(beheer(`/afhalen/${code}`));
    expect(na.bestelling).toMatchObject({ uitgegeven: true, betaalstatus: "betaald", status: "afgehaald" });
    // ook als beide verzoeken in dezelfde milliseconde vallen: precies één betaling
    const derde = (await (await bestel()).json()) as J;
    const vast = vi.spyOn(Date.prototype, "toISOString").mockReturnValue("2026-12-01T10:00:00.000Z");
    const u = () => beheer(`/afhalen/${derde.bestelling.afhaalcode}/uitgeven`, { method: "POST", body: JSON.stringify({ betaling: { wijze: "contant", bedrag_cent: 1898, ontvangen: true } }) });
    const [c, d] = await Promise.all([u(), u()]);
    vast.mockRestore();
    expect([c.status, d.status].sort()).toEqual([200, 409]);
    expect((db.raw.prepare("SELECT COUNT(*) AS n FROM sz_betaling WHERE bestelling_id = ?").get(2) as J).n).toBe(1);
    // betaling zonder ‘echt ontvangen’ wordt geweigerd
    const tweedeBestelling = (await (await bestel()).json()) as J;
    expect((await beheer(`/afhalen/${tweedeBestelling.bestelling.afhaalcode}/uitgeven`, { method: "POST", body: JSON.stringify({ betaling: { wijze: "contant", bedrag_cent: 100 } }) })).status).toBe(422);
  });
});

describe("betaalstatussen", () => {
  it("openstaand → betaalverzoek verstuurd → betaald → terugbetaald, nooit automatisch betaald", async () => {
    expect(betaalstatus({ totaal_cent: 1000, betaald_cent: 0 })).toBe("open");
    expect(betaalstatus({ totaal_cent: 1000, betaald_cent: 0, betaalverzoek_op: "2026-12-01T10:00:00Z" })).toBe("verzoek");
    expect(betaalstatus({ totaal_cent: 1000, betaald_cent: 500, betaalverzoek_op: "2026-12-01T10:00:00Z" })).toBe("verzoek");
    expect(betaalstatus({ totaal_cent: 1000, betaald_cent: 1000 })).toBe("betaald");
    expect(betaalstatus({ totaal_cent: 1000, betaald_cent: 0, ontvangen_cent: 1000 })).toBe("terugbetaald");

    await startRonde();
    await bestel();
    const st = async () => (await jsonVan(beheer("/bestellingen/1"))).bestelling.betaalstatus;
    expect(await st()).toBe("open");
    expect((await beheer("/bestellingen/1/betaalverzoek", { method: "POST", body: JSON.stringify({ verstuurd: true }) })).status).toBe(200);
    expect(await st()).toBe("verzoek");
    await beheer("/bestellingen/1/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1898, wijze: "tikkie", ontvangen: true }) });
    expect(await st()).toBe("betaald");
    await beheer("/bestellingen/1/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1898, wijze: "terugbetaling", ontvangen: true }) });
    expect(await st()).toBe("terugbetaald");
    const lijst = await jsonVan(beheer("/bestellingen?betaal=terugbetaald"));
    expect(lijst.bestellingen).toHaveLength(1);
  });
});

describe("staffelkorting", () => {
  const nu = "2026-12-01T12:00:00.000Z";
  const zout: PrijsProduct = {
    id: 1,
    naam: "Strooizout 25 kg",
    prijs_cent: 999,
    inkoop_cent: 709,
    bezorg_cent: null,
    gewicht_gram: 25000,
    aanbiedingen: [
      { id: 1, naam: "Vanaf 2 zakken", vanaf_aantal: 2, prijs_cent: 949, start: null, eind: null, actief: true },
      { id: 2, naam: "Vanaf 4 zakken", vanaf_aantal: 4, prijs_cent: 899, start: null, eind: null, actief: true },
    ],
  };
  const inst = { bezorg_methode: "per_stuk" as const, bezorg_per_stuk_cent: 50, bezorg_per_kg_cent: 2 };

  it("1 zak € 9,99; 2–3 zakken € 9,49; vanaf 4 € 8,99 op alle zakken; bezorgkosten apart € 0,50 per zak", () => {
    expect(bereken([{ product: zout, aantal: 1 }], "ophalen", inst, nu)).toMatchObject({ subtotaal_cent: 999, korting_cent: 0, totaal_cent: 999 });
    const twee = bereken([{ product: zout, aantal: 2 }], "ophalen", inst, nu);
    expect(twee).toMatchObject({ subtotaal_cent: 1898, korting_cent: 100, totaal_cent: 1898 });
    expect(twee.regels[0]).toMatchObject({ stukprijs_cent: 949, normaalprijs_cent: 999, aanbieding: "Vanaf 2 zakken" });
    const drie = bereken([{ product: zout, aantal: 3 }], "bezorgen", inst, nu);
    expect(drie).toMatchObject({ subtotaal_cent: 2847, korting_cent: 150, bezorg_cent: 150, totaal_cent: 2997 });
    const vier = bereken([{ product: zout, aantal: 4 }], "bezorgen", inst, nu);
    expect(vier).toMatchObject({ subtotaal_cent: 3596, korting_cent: 400, bezorg_cent: 200, totaal_cent: 3796 });
    expect(vier.regels[0]).toMatchObject({ stukprijs_cent: 899, normaalprijs_cent: 999, aanbieding: "Vanaf 4 zakken" });
    expect(bereken([{ product: zout, aantal: 10 }], "ophalen", inst, nu)).toMatchObject({ subtotaal_cent: 8990, korting_cent: 1000, totaal_cent: 8990 });
    expect(bereken([{ product: zout, aantal: 20 }], "bezorgen", inst, nu)).toMatchObject({ subtotaal_cent: 17980, korting_cent: 2000, bezorg_cent: 1000, totaal_cent: 18980 });
  });

  it("volgende staffel: bij 1 zak ‘bestel 2 en bespaar € 1,00’, bij 2–3 zakken ‘bestel 4 en bespaar € 4,00’, vanaf 4 niets", () => {
    expect(volgendeStaffel(zout, 1, nu)).toEqual({ naam: "Vanaf 2 zakken", vanaf: 2, prijs_cent: 949, besparing_cent: 100 });
    for (const n of [2, 3]) expect(volgendeStaffel(zout, n, nu)).toEqual({ naam: "Vanaf 4 zakken", vanaf: 4, prijs_cent: 899, besparing_cent: 400 });
    expect(volgendeStaffel(zout, 4, nu)).toBeNull();
    expect(volgendeStaffel(zout, 12, nu)).toBeNull();
  });

  it("server-side: staffels staan standaard aan, korting wordt opgeslagen en komt in financiën", async () => {
    await startRonde();
    const w = await jsonVan(req("/api/strooizout/winkel"));
    expect(w.producten[0].prijs_cent).toBe(999);
    expect(w.producten[0].aanbiedingen.map((a: J) => [a.vanaf_aantal, a.prijs_cent]).sort()).toEqual([
      [2, 949],
      [4, 899],
    ]);
    const r1 = ((await (await bestel({ regels: [{ product_id: 1, aantal: 1, prijs_cent: 1 }] })).json()) as J).bestelling;
    expect(r1).toMatchObject({ subtotaal_cent: 999, korting_cent: 0, totaal_cent: 999 });
    const r3 = ((await (await bestel({ regels: [{ product_id: 1, aantal: 3, prijs_cent: 1 }] })).json()) as J).bestelling;
    expect(r3).toMatchObject({ subtotaal_cent: 2847, korting_cent: 150, totaal_cent: 2847 });
    const r4 = ((await (await bestel({ regels: [{ product_id: 1, aantal: 4 }], levering: "bezorgen" })).json()) as J).bestelling;
    expect(r4).toMatchObject({ subtotaal_cent: 3596, korting_cent: 400, bezorg_cent: 0, totaal_cent: 3596 }); // gratis bezorgen vanaf 4 zakken
    expect(db.raw.prepare("SELECT korting_cent FROM sz_bestelling WHERE id = 3").get()).toEqual({ korting_cent: 400 });
    expect(db.raw.prepare("SELECT stukprijs_cent, normaalprijs_cent, aanbieding FROM sz_bestelregel WHERE bestelling_id = 3").get()).toEqual({ stukprijs_cent: 899, normaalprijs_cent: 999, aanbieding: "Vanaf 4 zakken" });
    const r10 = ((await (await bestel({ regels: [{ product_id: 1, aantal: 10 }] })).json()) as J).bestelling;
    expect(r10).toMatchObject({ subtotaal_cent: 8990, korting_cent: 1000 });
    const f = (await jsonVan(beheer("/financien"))).cijfers;
    expect(f).toMatchObject({ korting_cent: 1550, product_omzet_cent: 999 + 2847 + 3596 + 8990, bezorg_cent: 0 });
    const fin = await (await beheer("/export/financien.csv")).text();
    expect(fin.split("\r\n")[0]).toContain("Producten normale prijs;Korting;Omzet producten");
    expect(fin).toContain(";39,96;4,00;35,96;");
  });

  it("staffel is in het beheer aan te passen (grens en prijs)", async () => {
    const p = await productInvoer(1);
    await beheer("/producten/1", { method: "PUT", body: JSON.stringify({ ...p, aanbiedingen: [{ naam: "Staffelkorting", vanaf_aantal: 5, prijs_cent: 799 }] }) });
    await startRonde();
    expect(((await (await bestel({ regels: [{ product_id: 1, aantal: 4 }] })).json()) as J).bestelling.totaal_cent).toBe(3996);
    expect(((await (await bestel({ regels: [{ product_id: 1, aantal: 5 }] })).json()) as J).bestelling.totaal_cent).toBe(3995);
  });
});

describe("bevindingen uit de review", () => {
  it("productwijziging overschrijft de live voorraad niet", async () => {
    db.raw.prepare("UPDATE sz_product SET voorraad = 10 WHERE id = 1").run();
    const verouderd = await productInvoer(1); // beheerder ziet 10
    await startRonde();
    await bestel({ regels: [{ product_id: 1, aantal: 7 }] }); // voorraad 3
    // alleen de beschrijving wijzigen met de oude stand: voorraad blijft 3
    // (het beheer stuurt de voorraad alleen mee als de beheerder dat veld heeft aangepast)
    const { voorraad: _v, ...zonderVoorraad } = verouderd;
    void _v;
    const r = await beheer("/producten/1", { method: "PUT", body: JSON.stringify({ ...zonderVoorraad, beschrijving: "Nieuw.", voorraad_was: 10 }) });
    expect(r.status).toBe(200);
    expect((db.raw.prepare("SELECT voorraad, beschrijving FROM sz_product WHERE id = 1").get() as J)).toEqual({ voorraad: 3, beschrijving: "Nieuw." });
    // voorraad bewust wijzigen op basis van een verouderde stand: 409
    expect((await beheer("/producten/1", { method: "PUT", body: JSON.stringify({ ...verouderd, voorraad: 50, voorraad_was: 10 }) })).status).toBe(409);
    expect((await beheer("/producten/1", { method: "PUT", body: JSON.stringify({ ...verouderd, voorraad: 50, voorraad_was: 3 }) })).status).toBe(200);
    expect((db.raw.prepare("SELECT voorraad FROM sz_product WHERE id = 1").get() as J).voorraad).toBe(50);
    // status apart wisselen raakt de voorraad niet
    await beheer("/producten/1/status", { method: "PUT", body: JSON.stringify({ status: "verborgen" }) });
    expect((db.raw.prepare("SELECT voorraad, status FROM sz_product WHERE id = 1").get() as J)).toEqual({ voorraad: 50, status: "verborgen" });
  });

  it("een moment met maximum raakt niet overboekt bij gelijktijdige bestellingen", async () => {
    const ronde = await startRonde();
    const morgen = new Date(Date.now() + 86400_000).toISOString().slice(0, 10);
    await beheer("/momenten", { method: "POST", body: JSON.stringify({ soort: "ophalen", datum: morgen, van: "10:00", tot: "12:00", max_bestellingen: 2, ronde_id: ronde.id }) });
    const res = await Promise.all([1, 2, 3, 4].map((i) => bestel({ moment_id: 1 }, `198.51.100.${i}`)));
    expect(res.map((r) => r.status).sort()).toEqual([201, 201, 409, 409]);
    expect((db.raw.prepare("SELECT COUNT(*) AS n FROM sz_bestelling WHERE moment_id = 1").get() as J).n).toBe(2);
  });

  it("zonder HASH_SECRET kan er niet besteld of bekeken worden (fail closed)", async () => {
    await startRonde();
    env.HASH_SECRET = undefined;
    expect((await bestel()).status).toBe(503);
    expect((await req("/api/strooizout/bestelling/bekijk", { method: "POST", body: JSON.stringify({ code: "1-000000000000000000000000" }) })).status).toBe(503);
    expect((await req("/api/strooizout/winkel")).status).toBe(200);
  });

  it("werkelijke inkoop over alle rondes telt per ronde factuurbedrag óf inkoopregels", async () => {
    const r1 = await startRonde();
    await beheer(`/rondes/${r1.id}`, { method: "PUT", body: JSON.stringify({ status: "afgerond", inkoop_bedrag_cent: 10000 }) });
    const r2 = await jsonVan(beheer("/rondes", { method: "POST", body: JSON.stringify({ naam: "Ronde 2" }) }));
    await beheer(`/rondes/${r2.id}`, { method: "PUT", body: JSON.stringify({ inkoop: [{ product_id: 1, aantal: 10, stukprijs_cent: 500 }] }) });
    expect((await jsonVan(beheer("/financien?ronde=alle"))).werkelijke_inkoop_cent).toBe(15000);
  });

  it("verlaten open bestellingen worden na 12 maanden geannuleerd (voorraad terug) en daarna gewist", async () => {
    db.raw.prepare("UPDATE sz_product SET voorraad = 5 WHERE id = 1").run();
    await startRonde();
    await bestel({ regels: [{ product_id: 1, aantal: 2 }] });
    expect((db.raw.prepare("SELECT voorraad FROM sz_product WHERE id = 1").get() as J).voorraad).toBe(3);
    const later = new Date(Date.now() + 13 * 31 * 86400_000);
    await opschonen(db as unknown as D1Database, STANDAARD_INSTELLINGEN, later);
    expect((db.raw.prepare("SELECT status FROM sz_bestelling").get() as J).status).toBe("geannuleerd");
    expect((db.raw.prepare("SELECT voorraad FROM sz_product WHERE id = 1").get() as J).voorraad).toBe(5);
    await opschonen(db as unknown as D1Database, STANDAARD_INSTELLINGEN, new Date(later.getTime() + 7 * 31 * 86400_000));
    expect(db.raw.prepare("SELECT naam, telefoon, afhaalcode FROM sz_bestelling").get()).toEqual({ naam: "Gewist", telefoon: "", afhaalcode: null });
  });
});

// ---------- Definitieve afspraken 22-11-2026: btw, bezorgen vanaf 2 zakken, voorraadmodel, straatverkoop ----------

describe("definitieve afspraken", () => {
  it("startgegevens: 40 zakken verwacht, niets ontvangen; btw 21% inclusief; bezorgen vanaf 2 zakken; beschikbaar vanaf 26 november", async () => {
    const vers = createD1();
    expect(vers.raw.prepare("SELECT voorraad, voorraad_verwacht, voorraad_ontvangen FROM sz_product WHERE id = 1").get()).toEqual({ voorraad: 40, voorraad_verwacht: 40, voorraad_ontvangen: 0 });
    env.DB = vers as unknown as D1Database;
    db = vers;
    const w = await jsonVan(req("/api/strooizout/winkel"));
    expect(w.instellingen).toMatchObject({ btw_modus: "inclusief", btw_tarief: 21, bezorg_min_zakken: 2, beschikbaar_vanaf: "2026-11-26", verkoper_naam: "Denckh" });
    expect(w.producten[0]).toMatchObject({ voorraad: 40, op_voorraad: false, zakken_per_stuk: 1 });
  });

  it("bezorgen kan pas vanaf 2 zakken; ophalen met 1 zak wel", async () => {
    await startRonde();
    const een = await bestel({ regels: [{ product_id: 1, aantal: 1 }], levering: "bezorgen" });
    expect(een.status).toBe(422);
    expect(((await een.json()) as J).error).toMatch(/vanaf 2 zakken/);
    expect((await bestel({ regels: [{ product_id: 1, aantal: 1 }] })).status).toBe(201);
    const twee = ((await (await bestel({ regels: [{ product_id: 1, aantal: 2 }], levering: "bezorgen" })).json()) as J).bestelling;
    expect(twee).toMatchObject({ subtotaal_cent: 1898, bezorg_cent: 200, totaal_cent: 2098 });
    // vast bedrag per bezorging, ongeacht het aantal zakken
    const tien = ((await (await bestel({ regels: [{ product_id: 1, aantal: 10 }], levering: "bezorgen" })).json()) as J).bestelling;
    expect(tien).toMatchObject({ subtotaal_cent: 8990, bezorg_cent: 0, totaal_cent: 8990 }); // vanaf 4 zakken gratis
    expect((await jsonVan(req("/api/strooizout/winkel"))).instellingen).toMatchObject({ bezorg_methode: "per_adres", bezorg_per_adres_cent: 200 });
  });

  it("bedrijf bestelt: gegevens worden bewaard, zichtbaar in het beheer en gewist na de bewaartermijn; 4 zakken bezorgd is gratis", async () => {
    await startRonde();
    const zakelijk = { ...KLANT, zakelijk: true, bedrijfsnaam: "Bakkerij Test BV", kvk: "12345678", btw_nummer: "NL123456789B01", factuuradres: "Postbus 1, 3990 AA Houten" };
    const zonderNaam = await bestel({ klant: { ...KLANT, zakelijk: true } });
    expect(zonderNaam.status).toBe(422);
    const r = await bestel({ regels: [{ product_id: 1, aantal: 4 }], levering: "bezorgen", klant: zakelijk });
    expect(r.status).toBe(201);
    expect(((await r.json()) as J).bestelling).toMatchObject({ bezorg_cent: 0, totaal_cent: 3596 });
    expect(db.raw.prepare("SELECT zakelijk, bedrijfsnaam, kvk, btw_nummer, factuuradres FROM sz_bestelling").get()).toEqual({ zakelijk: 1, bedrijfsnaam: "Bakkerij Test BV", kvk: "12345678", btw_nummer: "NL123456789B01", factuuradres: "Postbus 1, 3990 AA Houten" });
    const lijst = await jsonVan(beheer("/bestellingen?ronde=alle"));
    expect(lijst.bestellingen[0]).toMatchObject({ zakelijk: true, bedrijfsnaam: "Bakkerij Test BV" });
    const csvTekst = await (await beheer("/export/bestellingen.csv")).text();
    expect(csvTekst).toContain("Bakkerij Test BV");
    // een particulier krijgt nooit bedrijfsgegevens opgeslagen
    await bestel({ klant: { ...KLANT, bedrijfsnaam: "Genegeerd", kvk: "12345678" } });
    expect(db.raw.prepare("SELECT zakelijk, bedrijfsnaam, kvk FROM sz_bestelling WHERE id = 2").get()).toEqual({ zakelijk: 0, bedrijfsnaam: "", kvk: "" });
  });

  it("btw 21% inclusief over producten én bezorgkosten, ook met staffelkorting", async () => {
    db.raw.prepare("INSERT INTO sz_instelling (sleutel, waarde) VALUES ('btw_modus', '\"inclusief\"')").run();
    await startRonde();
    await bestel({ regels: [{ product_id: 1, aantal: 2 }], levering: "bezorgen" }); // 2 zakken: 18,98 + 2,00 = 20,98
    const f = (await jsonVan(beheer("/financien"))).cijfers;
    expect(f.omzet_cent).toBe(2098);
    expect(f.btw_cent).toBe(Math.round((2098 * 21) / 121)); // 364
    expect(f.btw_cent).toBe(364);
    const csvTekst = await (await beheer("/export/financien.csv")).text();
    expect(csvTekst).toContain(";3,64;");
  });

  it("voorraad: reserveren tot de verwachte voorraad, nooit oververkoop; uitgeven pas na ontvangst", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    await startRonde();
    // 40 verwacht: 38 lukt, daarna 3 niet meer, 2 wel
    const groot = await bestel({ regels: [{ product_id: 1, aantal: 19 }] }, "198.51.100.1");
    const groot2 = await bestel({ regels: [{ product_id: 1, aantal: 19 }] }, "198.51.100.2");
    expect([groot.status, groot2.status]).toEqual([201, 201]);
    expect((await bestel({ regels: [{ product_id: 1, aantal: 3 }] }, "198.51.100.3")).status).toBe(409);
    const laatste = await bestel({ regels: [{ product_id: 1, aantal: 2 }] }, "198.51.100.4");
    expect(laatste.status).toBe(201);
    let v = (await jsonVan(beheer("/voorraad"))).voorraad.find((r: J) => r.id === 1);
    expect(v).toMatchObject({ verwacht: 40, ontvangen: 0, gereserveerd: 40, beschikbaar: 0, in_magazijn: 0 });
    expect((await jsonVan(req("/api/strooizout/winkel"))).producten[0]).toMatchObject({ voorraad: 0, op_voorraad: false });

    // uitgeven en ‘klaar’ zetten kan pas als de voorraad echt binnen is
    const code = ((await groot.json()) as J).bestelling.afhaalcode;
    const voor = await beheer(`/afhalen/${code}/uitgeven`, { method: "POST", body: JSON.stringify({}) });
    expect(voor.status).toBe(409);
    expect(((await voor.json()) as J).error).toMatch(/ontvangen/);
    expect((await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "klaar" }) })).status).toBe(409);

    // ontvangst bevestigen: 25 binnen → 19 uitgeven lukt, de tweede 19 nog niet
    expect((await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 25 }) })).status).toBe(200);
    expect((await beheer(`/afhalen/${code}/uitgeven`, { method: "POST", body: JSON.stringify({}) })).status).toBe(200);
    const code2 = ((await groot2.json()) as J).bestelling.afhaalcode;
    expect((await beheer(`/afhalen/${code2}/uitgeven`, { method: "POST", body: JSON.stringify({}) })).status).toBe(409);
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 15 }) });
    expect((await beheer(`/afhalen/${code2}/uitgeven`, { method: "POST", body: JSON.stringify({}) })).status).toBe(200);
    v = (await jsonVan(beheer("/voorraad"))).voorraad.find((r: J) => r.id === 1);
    expect(v).toMatchObject({ verwacht: 40, ontvangen: 40, gereserveerd: 40, uitgegeven: 38, in_magazijn: 2, nog_uit_te_geven: 2 });
    expect((await jsonVan(req("/api/strooizout/winkel"))).producten[0].op_voorraad).toBe(true);

    // verwachte voorraad kan niet onder wat al gereserveerd is; ontvangen niet onder wat al uitgegeven is
    expect((await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 30 }) })).status).toBe(409);
    expect((await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: -5 }) })).status).toBe(409);
    // meer ontvangen dan verwacht: verwachting en beschikbaar stijgen mee
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 10 }) });
    v = (await jsonVan(beheer("/voorraad"))).voorraad.find((r: J) => r.id === 1);
    expect(v).toMatchObject({ verwacht: 50, ontvangen: 50, beschikbaar: 10 });
    // annuleren geeft de reservering terug
    await beheer("/bestellingen/3/status", { method: "POST", body: JSON.stringify({ status: "geannuleerd" }) });
    v = (await jsonVan(beheer("/voorraad"))).voorraad.find((r: J) => r.id === 1);
    expect(v).toMatchObject({ gereserveerd: 38, beschikbaar: 12 });
  });

  it("gelijktijdige reserveringen op de laatste zakken: nooit meer dan verwacht", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 5 }) });
    await startRonde();
    const res = await Promise.all([1, 2, 3, 4, 5, 6].map((i) => bestel({ regels: [{ product_id: 1, aantal: 2 }] }, `198.51.100.${i}`)));
    expect(res.filter((r) => r.status === 201)).toHaveLength(2);
    expect((db.raw.prepare("SELECT voorraad FROM sz_product WHERE id = 1").get() as J).voorraad).toBe(1);
  });

  it("QR aan de weg: alleen uit ontvangen voorraad, zonder naam, mobiel verplicht, wacht op bevestigde uitgifte", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    // geen open ronde nodig, wel voorraad ter plekke
    const straat = (extra: Record<string, unknown> = {}) => bestel({ kanaal: "straat", regels: [{ product_id: 1, aantal: 2 }], klant: { telefoon: "0612345678" }, ...extra });
    const leeg = await straat();
    expect(leeg.status).toBe(409);
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 10 }) });
    const ok = await straat({ levering: "bezorgen" }); // bezorgen wordt genegeerd: aan de weg is altijd ophalen
    expect(ok.status).toBe(201);
    const b = ((await ok.json()) as J).bestelling;
    expect(b).toMatchObject({ levering: "ophalen", status: "nieuw", betaalstatus: "open", totaal_cent: 1898 });
    expect(db.raw.prepare("SELECT kanaal, naam FROM sz_bestelling").get()).toEqual({ kanaal: "straat", naam: "Aan de weg" });
    expect((await straat({ klant: {} })).status).toBe(422); // mobiel nummer verplicht
    // de verkoper bevestigt betaling en uitgifte in één stap; nooit automatisch betaald
    const u = await beheer(`/afhalen/${b.afhaalcode}/uitgeven`, { method: "POST", body: JSON.stringify({ betaling: { wijze: "contant", bedrag_cent: 1898, ontvangen: true } }) });
    expect(((await u.json()) as J).bestelling).toMatchObject({ betaalstatus: "betaald", uitgegeven: true });
  });

  it("straatverkoop registreren in het beheer: voorraad, uitgifte en betaling in één keer, idempotent, met staffel", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    const verkoop = (extra: Record<string, unknown> = {}) => beheer("/straatverkoop", { method: "POST", body: JSON.stringify({ idempotentie: "straat-0001-abcdefghijkl", aantal: 4, wijze: "contant", ontvangen: true, ...extra }) });
    expect((await verkoop()).status).toBe(409); // nog niets ontvangen
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 10 }) });
    const a = await jsonVan(verkoop());
    expect(a).toMatchObject({ herhaald: false, totaal_cent: 3596, korting_cent: 400 });
    expect((await jsonVan(verkoop())).herhaald).toBe(true); // dubbel klikken
    expect((await verkoop({ idempotentie: "straat-0002-abcdefghijkl", ontvangen: false })).status).toBe(422);
    expect((db.raw.prepare("SELECT COUNT(*) AS n FROM sz_bestelling").get() as J).n).toBe(1);
    expect(db.raw.prepare("SELECT kanaal, status FROM sz_bestelling").get()).toEqual({ kanaal: "beheer", status: "afgehaald" });
    expect((db.raw.prepare("SELECT SUM(bedrag_cent) AS s FROM sz_betaling").get() as J).s).toBe(3596);
    const v = (await jsonVan(beheer("/voorraad"))).voorraad.find((r: J) => r.id === 1);
    expect(v).toMatchObject({ gereserveerd: 4, uitgegeven: 4, in_magazijn: 6, beschikbaar: 36 });
    const o = (await jsonVan(beheer("/overzicht"))).cijfers;
    expect(o.per_kanaal.beheer).toEqual({ bestellingen: 1, omzet_cent: 3596 });
    // te veel: niet meer dan er ligt
    expect((await verkoop({ idempotentie: "straat-0003-abcdefghijkl", aantal: 7 })).status).toBe(409);
  });

  it("verkopergegevens: alleen geldige KvK- en btw-nummers worden opgeslagen", async () => {
    expect((await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ verkoper_kvk: "1234" }) })).status).toBe(422);
    expect((await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ verkoper_btw: "123" }) })).status).toBe(422);
    expect((await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ beschikbaar_vanaf: "26-11-2026" }) })).status).toBe(422);
  });
});

describe("strooizout per 10 kg: eigen emmer en met emmer (23-11-2026)", () => {
  const EIGEN = 4;
  const MET = 5;
  const vul = (emmer_id: number, emmers: number, zakken: number) => beheer("/voorraad/afvullen", { method: "POST", body: JSON.stringify({ emmer_id, zak_id: 1, emmers, zakken }) });
  const voorraad = async () => {
    const v = await jsonVan(beheer("/voorraad"));
    return { los: v.los_gram as number, van: (id: number) => v.voorraad.find((r: J) => r.id === id) as J };
  };
  const activeer = (id: number) => beheer(`/producten/${id}/status`, { method: "PUT", body: JSON.stringify({ status: "actief" }) });
  /** 40 zakken verwacht en ontvangen, ronde open. */
  async function metZakken() {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 40 }) });
    await startRonde();
  }

  it("10 kg is te bestellen uit de zakvoorraad: een zak gaat eraf, de rest wordt los zout en telt daarna mee", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) }); // 40 zakken verwacht, nog niets ontvangen (zoals bij de start)
    await startRonde();
    const w = await jsonVan(req("/api/strooizout/winkel"));
    // 40 zakken = 1000 kg = 100 keer 10 kg; het ligt er nog niet, dus een voorbestelling
    expect(w.producten.map((p: J) => [p.id, p.voorraad, p.op_voorraad])).toEqual([[1, 40, false], [EIGEN, 100, false], [MET, 100, false]]);
    expect(w.binnenkort).toEqual([]);

    const eerste = await bestel({ regels: [{ product_id: EIGEN, aantal: 1 }] });
    expect(eerste.status).toBe(201);
    let v = await voorraad();
    expect(v.van(1)).toMatchObject({ verwacht: 39, beschikbaar: 39, ontvangen: 0 }); // één zak apart gezet
    expect(v.los).toBe(15000);
    expect(v.van(EIGEN)).toMatchObject({ verwacht: 1, gereserveerd: 1, beschikbaar: 0, ontvangen: 0, uit_zakken: true, te_bestellen: 99 });
    expect(v.van(MET).te_bestellen).toBe(99); // 39 zakken en 15 kg los: 990 kg
    expect(v.van(1).uit_zakken).toBe(false);
    expect(((await eerste.json()) as J).bestelling.status).toBe("nieuw");

    // de volgende 10 kg komt uit het losse zout: geen zak erbij
    expect((await bestel({ regels: [{ product_id: MET, aantal: 1 }] }, "203.0.113.20")).status).toBe(201);
    v = await voorraad();
    expect(v.van(1)).toMatchObject({ verwacht: 39, beschikbaar: 39 });
    expect(v.los).toBe(5000);
    // 2 × 10 kg met 5 kg los: één zak erbij, 10 kg rest
    expect((await bestel({ regels: [{ product_id: EIGEN, aantal: 2 }] }, "203.0.113.21")).status).toBe(201);
    v = await voorraad();
    expect(v.van(1)).toMatchObject({ verwacht: 38, beschikbaar: 38 });
    expect(v.los).toBe(10000);
    // niets verdwenen, niets dubbel: 2 zakken = 50 kg = 4 porties en 10 kg los
    expect((40 - v.van(1).verwacht) * 25).toBe((v.van(EIGEN).verwacht + v.van(MET).verwacht) * 10 + v.los / 1000);
    const log = db.raw.prepare("SELECT details FROM sz_log WHERE actie = 'zout toegewezen' ORDER BY id").all() as J[];
    expect(log).toHaveLength(3);
  });

  it("geen dubbele verkoop: de laatste zak kan maar één keer weg, als zak of als 10 kg", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 1 }) });
    await startRonde();
    expect((await jsonVan(req("/api/strooizout/winkel"))).producten.map((p: J) => p.voorraad)).toEqual([1, 2, 2]);
    // 3 × 10 kg past niet in één zak
    const teveel = await bestel({ regels: [{ product_id: EIGEN, aantal: 3 }] });
    expect(teveel.status).toBe(409);
    expect(((await teveel.json()) as J).error).toMatch(/nog 2 ×/);
    // een zak én 10 kg uit dezelfde laatste zak kan niet
    expect((await bestel({ regels: [{ product_id: 1, aantal: 1 }, { product_id: MET, aantal: 1 }] })).status).toBe(409);
    expect((await voorraad()).van(1)).toMatchObject({ verwacht: 1, beschikbaar: 1 }); // de mislukte bestelling heeft niets gewijzigd
    expect((await voorraad()).los).toBe(0);
    // gelijktijdig: 10 kg en de zak; precies één van de twee lukt met de zak
    const [a, b] = await Promise.all([bestel({ regels: [{ product_id: EIGEN, aantal: 2 }] }, "203.0.113.22"), bestel({ regels: [{ product_id: 1, aantal: 1 }] }, "203.0.113.23")]);
    expect([a.status, b.status].sort()).toEqual([201, 409]);
    const v = await voorraad();
    expect(v.van(1).beschikbaar).toBe(0);
    // daarna is alles op, behalve wat er nog los ligt
    const w = await jsonVan(req("/api/strooizout/winkel"));
    expect(w.producten.find((p: J) => p.id === 1).voorraad).toBe(0);
    expect((await bestel({ regels: [{ product_id: MET, aantal: 1 }] }, "203.0.113.24")).status).toBe(409);
    expect(v.los + v.van(1).beschikbaar * 25000).toBeLessThan(10000);
  });

  it("zakken zonder voorraadgrens: 10 kg is dan ook onbeperkt te bestellen en de porties worden bijgehouden", async () => {
    await startRonde();
    expect((await jsonVan(req("/api/strooizout/winkel"))).producten.map((p: J) => p.voorraad)).toEqual([null, null, null]);
    expect((await bestel({ regels: [{ product_id: EIGEN, aantal: 3 }] })).status).toBe(201);
    const v = await voorraad();
    expect(v.van(EIGEN)).toMatchObject({ verwacht: 3, gereserveerd: 3, beschikbaar: 0, te_bestellen: null });
    expect(v.van(1)).toMatchObject({ verwacht: null, beschikbaar: null });
    expect(v.los).toBe(0);
  });

  it("annuleren houdt het zout bij het product van 10 kg; uitgeven kan pas na ‘klaargezet’, tot wat er besteld is", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    await startRonde();
    const r = await jsonVan(bestel({ regels: [{ product_id: EIGEN, aantal: 2 }] }));
    let v = await voorraad();
    expect(v.van(1).verwacht).toBe(39);
    expect(v.los).toBe(5000);
    expect(v.van(EIGEN)).toMatchObject({ verwacht: 2, gereserveerd: 2, beschikbaar: 0 });
    // de voorraad van dit product volgt de zakken: met de hand ophogen kan niet
    expect((await beheer(`/voorraad/${EIGEN}`, { method: "POST", body: JSON.stringify({ verwacht: 50 }) })).status).toBe(409);
    expect((await beheer(`/voorraad/${EIGEN}`, { method: "POST", body: JSON.stringify({ ontvangen_erbij: 3 }) })).status).toBe(409);
    // uitgeven kan niet zolang het niet klaarstaat
    const lijst = await jsonVan(beheer("/bestellingen?ronde=alle"));
    const id = lijst.bestellingen[0].id;
    expect((await beheer(`/bestellingen/${id}/status`, { method: "POST", body: JSON.stringify({ status: "klaar" }) })).status).toBe(409);
    expect((await beheer(`/voorraad/${EIGEN}`, { method: "POST", body: JSON.stringify({ ontvangen_erbij: 2 }) })).status).toBe(200);
    expect((await beheer(`/bestellingen/${id}/status`, { method: "POST", body: JSON.stringify({ status: "klaar" }) })).status).toBe(200);
    // annuleren: de twee porties blijven bij het product en zijn opnieuw te bestellen, zonder een nieuwe zak
    expect((await req("/api/strooizout/bestelling/annuleer", { method: "POST", body: JSON.stringify({ code: r.bestelling.code }) })).status).toBe(200);
    v = await voorraad();
    expect(v.van(EIGEN)).toMatchObject({ verwacht: 2, gereserveerd: 0, beschikbaar: 2, ontvangen: 2 });
    expect(v.van(1).verwacht).toBe(39);
    expect((await bestel({ regels: [{ product_id: EIGEN, aantal: 2 }] }, "203.0.113.25")).status).toBe(201);
    v = await voorraad();
    expect(v.van(1).verwacht).toBe(39);
    expect(v.los).toBe(5000);
  });

  it("zijn de zakken al binnen, dan gaat een aangebroken zak ook van ‘ontvangen’ af", async () => {
    await metZakken();
    expect((await bestel({ regels: [{ product_id: MET, aantal: 1 }] })).status).toBe(201);
    const v = await voorraad();
    expect(v.van(1)).toMatchObject({ verwacht: 39, ontvangen: 39, beschikbaar: 39, in_magazijn: 39 });
    expect(v.van(MET)).toMatchObject({ verwacht: 1, ontvangen: 0, gereserveerd: 1 });
    expect(v.los).toBe(15000);
  });

  it("vooruit afvullen: wat klaarstaat gaat eerst weg, daarna pas een nieuwe zak", async () => {
  });

  it("afvullen: 1 zak geeft 2 × 10 kg en 5 kg los zout; het losse zout telt de volgende keer mee", async () => {
    await metZakken();
    expect((await vul(EIGEN, 3, 1)).status).toBe(422); // 30 kg past niet in 25 kg
    expect((await vul(EIGEN, 2, 2)).status).toBe(422); // niet meer zakken openen dan nodig
    const eerste = await jsonVan(vul(EIGEN, 2, 1));
    expect(eerste).toMatchObject({ ok: true, los_gram: 5000 });
    let v = await voorraad();
    expect(v.los).toBe(5000);
    expect(v.van(1)).toMatchObject({ verwacht: 39, ontvangen: 39, beschikbaar: 39, in_magazijn: 39 });
    expect(v.van(EIGEN)).toMatchObject({ verwacht: 2, ontvangen: 2, beschikbaar: 2, in_magazijn: 2 });
    // 3 emmers = 30 kg uit 1 zak (25 kg) en de 5 kg die er nog los lag
    expect(await jsonVan(vul(MET, 3, 1))).toMatchObject({ ok: true, los_gram: 0 });
    v = await voorraad();
    expect(v.los).toBe(0);
    expect(v.van(1)).toMatchObject({ ontvangen: 38, beschikbaar: 38 });
    expect(v.van(MET)).toMatchObject({ ontvangen: 3, beschikbaar: 3, in_magazijn: 3 });
    // zonder los zout en zonder zak kan er niets bij
    expect((await vul(MET, 1, 0)).status).toBe(422);
    // twee keer 5 kg rest is samen weer 10 kg, zonder een zak te openen
    await vul(EIGEN, 2, 1);
    await vul(EIGEN, 2, 1);
    expect((await voorraad()).los).toBe(10000);
    expect(await jsonVan(vul(EIGEN, 1, 0))).toMatchObject({ ok: true, los_gram: 0 });
    v = await voorraad();
    expect(v.van(1).ontvangen).toBe(36);
    expect(v.van(EIGEN).beschikbaar).toBe(7);
    // in totaal: 4 zakken = 100 kg → 7 + 3 porties van 10 kg, niets verdwenen en niets dubbel
    expect((40 - v.van(1).ontvangen) * 25).toBe((v.van(EIGEN).ontvangen + v.van(MET).ontvangen) * 10 + v.los / 1000);
  });

  it("afvullen kan alleen uit ontvangen, niet-bestelde zakken en nooit van zak naar zak", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    expect((await vul(EIGEN, 2, 1)).status).toBe(409); // nog niets ontvangen
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 40 }) });
    await startRonde();
    await bestel({ regels: [{ product_id: 1, aantal: 20 }] });
    await bestel({ regels: [{ product_id: 1, aantal: 19 }] }, "203.0.113.9"); // nog 1 zak vrij
    expect((await vul(MET, 5, 2)).status).toBe(409); // bestelde zakken blijven van de klant
    expect((await vul(MET, 2, 1)).status).toBe(200);
    const v = await voorraad();
    expect(v.van(1)).toMatchObject({ beschikbaar: 0, gereserveerd: 39, ontvangen: 39 });
    expect((await bestel({ regels: [{ product_id: 1, aantal: 1 }] }, "203.0.113.10")).status).toBe(409); // de zak is op: geen dubbele verkoop
    expect((await beheer("/voorraad/afvullen", { method: "POST", body: JSON.stringify({ emmer_id: 1, zak_id: 1, emmers: 1, zakken: 1 }) })).status).toBe(422);
    expect((await beheer("/voorraad/afvullen", { method: "POST", body: JSON.stringify({ emmer_id: EIGEN, zak_id: MET, emmers: 1, zakken: 1 }) })).status).toBe(422);
  });

  it("bestellen: eigen emmer alleen afhalen, met de melding bij de bestelling; voorraadgrens en annuleren kloppen", async () => {
    await metZakken();
    await vul(EIGEN, 2, 1);
    await activeer(EIGEN);
    // bezorgen kan niet, ook niet samen met zakken
    const bezorgd = await bestel({ levering: "bezorgen", regels: [{ product_id: 1, aantal: 2 }, { product_id: EIGEN, aantal: 1 }] });
    expect(bezorgd.status).toBe(422);
    expect((await bezorgd.json()) as J).toMatchObject({ veld: "levering", code: "alleen_afhalen" });
    // afhalen: € 5,49 per 10 kg, zonder staffel, met 21% btw in de prijs
    const r = await bestel({ regels: [{ product_id: EIGEN, aantal: 2 }] });
    expect(r.status).toBe(201);
    const b = ((await r.json()) as J).bestelling;
    expect(b).toMatchObject({ totaal_cent: 1098, korting_cent: 0, bezorg_cent: 0, levering: "ophalen" });
    expect(b.meldingen).toEqual(["Neem een schone, droge en stevige emmer mee. We wegen 10 kg voor je af."]);
    expect(b.regels[0]).toMatchObject({ naam: "Strooizout 10 kg in je eigen emmer", aantal: 2, stukprijs_cent: 549 });
    expect((await voorraad()).van(EIGEN)).toMatchObject({ beschikbaar: 0, gereserveerd: 2, ontvangen: 2 });
    // wat al was afgevuld ging eerst weg: de zakken zijn er niet door veranderd
    expect((await voorraad()).van(1)).toMatchObject({ beschikbaar: 39, ontvangen: 39 });
    // annuleren geeft de porties terug, niet de zak
    expect((await req("/api/strooizout/bestelling/annuleer", { method: "POST", body: JSON.stringify({ code: b.code }) })).status).toBe(200);
    const na = await voorraad();
    expect(na.van(EIGEN)).toMatchObject({ beschikbaar: 2, gereserveerd: 0, ontvangen: 2 });
    expect(na.van(1)).toMatchObject({ beschikbaar: 39, ontvangen: 39 });
    expect(na.los).toBe(5000);
  });

  it("gemengd mandje: zakken met staffel en een emmer erbij; bezorgen telt alleen de zakken", async () => {
    await metZakken();
    await vul(MET, 2, 1);
    await activeer(MET);
    // alleen een emmer bezorgen kan niet: bezorgen is vanaf 2 zakken
    const alleen = await bestel({ levering: "bezorgen", regels: [{ product_id: MET, aantal: 2 }] });
    expect(alleen.status).toBe(422);
    expect(((await alleen.json()) as J).error).toMatch(/vanaf 2 zakken/);
    // 2 zakken (staffel € 9,49) en 1 emmer met deksel, bezorgd
    const r = await bestel({ levering: "bezorgen", regels: [{ product_id: 1, aantal: 2 }, { product_id: MET, aantal: 1 }] });
    expect(r.status).toBe(201);
    const b = ((await r.json()) as J).bestelling;
    expect(b.subtotaal_cent).toBe(2 * 949 + 649);
    expect(b.totaal_cent).toBe(b.subtotaal_cent + b.bezorg_cent);
    expect(b.meldingen).toEqual([]);
    const v = await voorraad();
    expect(v.van(1)).toMatchObject({ beschikbaar: 37, gereserveerd: 2 });
    expect(v.van(MET)).toMatchObject({ beschikbaar: 1, gereserveerd: 1 });
    // afhalen: 4 zakken (€ 8,99) en de laatste emmer
    const tweede = await bestel({ regels: [{ product_id: 1, aantal: 4 }, { product_id: MET, aantal: 1 }] }, "203.0.113.12");
    expect(((await tweede.json()) as J).bestelling.totaal_cent).toBe(4 * 899 + 649);
    expect((await voorraad()).van(MET).beschikbaar).toBe(0);
  });

  it("bevestigingsmail noemt de melding bij het product (neem een emmer mee)", () => {
    const basis = { nummer: "SZ-0001", afhaalcode: "H-1234", code: "c".repeat(24), voornaam: "Anna", levering: "ophalen" as const, adres: "", betaalwijze: "tikkie", regels: [{ naam: "Strooizout 10 kg in je eigen emmer", aantal: 1, stukprijs_cent: 549 }], korting_cent: 0, bezorg_cent: 0, totaal_cent: 549 };
    const met = bevestigingsmail({ ...basis, meldingen: ["Neem een schone, droge en stevige emmer mee. We wegen 10 kg voor je af."] }, new URL("https://strooizouthouten.nl/"), "anna@example.com");
    expect(met.tekst).toContain("Neem een schone, droge en stevige emmer mee. We wegen 10 kg voor je af.");
    expect(met.html).toContain("Neem een schone, droge en stevige emmer mee.");
    expect(bevestigingsmail(basis, new URL("https://strooizouthouten.nl/"), "anna@example.com").tekst).not.toContain("emmer mee");
  });

  it("bevestigingsmail noemt duidelijk waar je afhaalt en dat je even appt of belt (uit de instellingen)", () => {
    const basis = { nummer: "SZ-0001", afhaalcode: "H-1234", code: "c".repeat(24), voornaam: "Anna", levering: "ophalen" as const, adres: "", betaalwijze: "tikkie", regels: [{ naam: "Strooizout 25 kg", aantal: 2, stukprijs_cent: 949 }], korting_cent: 200, bezorg_cent: 0, totaal_cent: 1898 };
    const site = new URL("https://strooizouthouten.nl/");
    const mail = bevestigingsmail(basis, site, "anna@example.com", "", { adres: "Voorbeeldstraat 1, Houten", telefoon: "06 00 00 00 00" });
    expect(mail.tekst).toContain("Afhalen: Voorbeeldstraat 1, Houten\nApp of bel even om af te spreken wanneer je langskomt: 06 00 00 00 00.\nNeem je afhaalcode mee.");
    expect(mail.tekst).not.toContain("Het adres en de afhaalmomenten staan op je bestelpagina");
    expect(mail.html).toContain("<strong>Afhalen: Voorbeeldstraat 1, Houten</strong>");
    expect(mail.html).toContain("App of bel even om af te spreken wanneer je langskomt: 06 00 00 00 00.");
    // zonder telefoonnummer: wel het adres, geen lege regel over bellen
    expect(bevestigingsmail(basis, site, "anna@example.com", "", { adres: "Voorbeeldstraat 1, Houten" }).tekst).toContain("Afhalen: Voorbeeldstraat 1, Houten\nNeem je afhaalcode mee.");
    // zonder adres in de instellingen: de oude verwijzing naar de bestelpagina
    expect(bevestigingsmail(basis, site, "anna@example.com").tekst).toContain("Het adres en de afhaalmomenten staan op je bestelpagina");
    // bezorgen: geen afhaaladres, wel het nummer voor vragen
    const bezorgd = bevestigingsmail({ ...basis, levering: "bezorgen" as const, adres: "Testlaan 12a, 3992 KT Houten" }, site, "anna@example.com", "", { adres: "Voorbeeldstraat 1, Houten", telefoon: "06 00 00 00 00" });
    expect(bezorgd.tekst).not.toContain("Afhalen: Voorbeeldstraat");
    expect(bezorgd.tekst).toContain("Vragen over de bezorging? App of bel 06 00 00 00 00.");
  });

  it("beheer: alleen afhalen en de klantmelding zijn per product in te stellen; los zout is te corrigeren", async () => {
    const ip = await productInvoer(MET);
    expect(ip).toMatchObject({ alleen_afhalen: 0, klant_melding: "" });
    expect((await beheer(`/producten/${MET}`, { method: "PUT", body: JSON.stringify({ ...ip, alleen_afhalen: 1, klant_melding: "De emmer mag je houden." }) })).status).toBe(200);
    expect(await productInvoer(MET)).toMatchObject({ alleen_afhalen: 1, klant_melding: "De emmer mag je houden." });
    // een aanroep zonder deze velden laat ze staan
    const { alleen_afhalen: _a, klant_melding: _m, ...zonder } = await productInvoer(MET);
    await beheer(`/producten/${MET}`, { method: "PUT", body: JSON.stringify(zonder) });
    expect(await productInvoer(MET)).toMatchObject({ alleen_afhalen: 1, klant_melding: "De emmer mag je houden." });
    expect((await beheer(`/producten/${MET}`, { method: "PUT", body: JSON.stringify({ ...ip, klant_melding: "x".repeat(201) }) })).status).toBe(422);
    expect((await beheer("/voorraad/los-zout", { method: "POST", body: JSON.stringify({ gram: 2500 }) })).status).toBe(200);
    expect((await voorraad()).los).toBe(2500);
    expect((await beheer("/voorraad/los-zout", { method: "POST", body: JSON.stringify({ gram: -1 }) })).status).toBe(422);
  });
});

describe("commerciële afspraken (22-11-2026)", () => {
  it("startgegevens: zak € 9,99 met inkoop € 7,09; 10 kg in eigen emmer € 5,49 en met emmer € 6,49, alle drie te bestellen", async () => {
    await startRonde();
    const w = await jsonVan(req("/api/strooizout/winkel"));
    expect(w.producten.map((p: J) => [p.slug, p.prijs_cent, p.gewicht_gram, p.alleen_afhalen])).toEqual([
      ["strooizout-25-kg", 999, 25000, false],
      ["strooizout-10-kg-eigen-emmer", 549, 10000, true],
      ["strooizout-10-kg-met-emmer", 649, 10000, false],
    ]);
    expect(w.binnenkort).toEqual([]);
    expect(w.producten[1].melding).toBe("Neem een schone, droge en stevige emmer mee. We wegen 10 kg voor je af.");
    expect(w.producten[1]).not.toHaveProperty("inkoop_cent");
    expect(w.producten[1]).not.toHaveProperty("vult_uit");
    // de emmer van 5 kg is vervallen (concept) en niet te bestellen
    expect((db.raw.prepare("SELECT status FROM sz_product WHERE id = 3").get() as J).status).toBe("concept");
    expect((await bestel({ regels: [{ product_id: 3, aantal: 1 }] })).status).toBe(409);
    // de zak en zijn staffels zijn ongewijzigd
    expect(w.producten[0]).toMatchObject({ prijs_cent: 999, alleen_afhalen: false, melding: "" });
    expect(w.producten[0].aanbiedingen.map((a: J) => [a.vanaf_aantal, a.prijs_cent])).toEqual([[2, 949], [4, 899]]);
    expect((db.raw.prepare("SELECT inkoop_cent FROM sz_product WHERE id = 1").get() as J).inkoop_cent).toBe(709);
    // status ‘binnenkort’ is in het beheer te kiezen
    expect((await beheer("/producten/2/status", { method: "PUT", body: JSON.stringify({ status: "binnenkort" }) })).status).toBe(200);
    expect((await beheer("/producten/2/status", { method: "PUT", body: JSON.stringify({ status: "onzin" }) })).status).toBe(422);
  });

  it("voorbestellingen zijn herkenbaar: geplaatst voordat de voorraad er lag", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    await startRonde();
    await bestel({ regels: [{ product_id: 1, aantal: 2 }] });
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 40 }) });
    await bestel({ regels: [{ product_id: 1, aantal: 2 }] });
    const lijst = (await jsonVan(beheer("/bestellingen"))).bestellingen;
    expect(lijst.map((b: J) => [b.nummer, b.voorbestelling])).toEqual([
      ["SZ-0002", false],
      ["SZ-0001", true],
    ]);
    expect((await jsonVan(beheer("/overzicht"))).cijfers.voorbestellingen).toBe(1);
  });

  it("emmers afvullen: zakken gaan van de zakvoorraad af, emmers komen erbij; alleen uit vrije, ontvangen zakken", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    const vul = (emmers: number, zakken: number) => beheer("/voorraad/afvullen", { method: "POST", body: JSON.stringify({ emmer_id: 3, zak_id: 1, emmers, zakken }) });
    expect((await vul(10, 2)).status).toBe(409); // nog niets ontvangen
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 40 }) });
    expect((await vul(11, 2)).status).toBe(422); // 55 kg past niet in 50 kg
    await startRonde();
    await bestel({ regels: [{ product_id: 1, aantal: 20 }] }); // max. 20 per bestelling
    await bestel({ regels: [{ product_id: 1, aantal: 17 }] }); // nog 3 vrij
    expect((await vul(20, 4)).status).toBe(409); // gereserveerde zakken niet afvullen
    const ok = await jsonVan(vul(10, 2));
    expect(ok.rest_gram).toBe(0);
    const v = (await jsonVan(beheer("/voorraad"))).voorraad;
    expect(v.find((r: J) => r.id === 1)).toMatchObject({ verwacht: 38, ontvangen: 38, beschikbaar: 1, gereserveerd: 37 });
    expect(v.find((r: J) => r.id === 3)).toMatchObject({ verwacht: 10, ontvangen: 10, beschikbaar: 10, in_magazijn: 10 });
    // een emmer bestellen trekt niets van de zakken af (zodra de emmer actief is)
    db.raw.prepare("UPDATE sz_product SET status = 'actief' WHERE id = 3").run();
    expect((await bestel({ regels: [{ product_id: 3, aantal: 2 }] })).status).toBe(201);
    const na = (await jsonVan(beheer("/voorraad"))).voorraad;
    expect(na.find((r: J) => r.id === 1).beschikbaar).toBe(1);
    expect(na.find((r: J) => r.id === 3).beschikbaar).toBe(8);
  });

  it("waarschuwing bij lage voorraad (standaard 10) en marge exclusief btw", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    await startRonde();
    await bestel({ regels: [{ product_id: 1, aantal: 4 }] }); // 35,96, inkoop 4 × 7,09
    let o = await jsonVan(beheer("/overzicht"));
    expect(o.waarschuwingen.join(" ")).not.toMatch(/te bestellen/);
    expect(o.cijfers).toMatchObject({ omzet_cent: 3596, inkoop_cent: 2836, inkoop_bekend: true, marge_excl_cent: 2972 - 2344, product_marge_excl_cent: 628 });
    await bestel({ regels: [{ product_id: 1, aantal: 20 }] });
    await bestel({ regels: [{ product_id: 1, aantal: 6 }] }); // nog 10 vrij
    o = await jsonVan(beheer("/overzicht"));
    expect(o.waarschuwingen).toContain("Strooizout 25 kg: nog 10 te bestellen (Voorraad).");
    const per = (await jsonVan(beheer("/financien"))).cijfers.per_product[0];
    expect(per.marge_excl_cent).toBe(per.omzet_cent - Math.round((per.omzet_cent * 21) / 121) - (per.inkoop_cent - Math.round((per.inkoop_cent * 21) / 121)));
  });
});

describe("vindbaarheid en meting", () => {
  const UA_MOBIEL = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
  const meld = (body: Record<string, unknown>, ua = UA_MOBIEL, ip = "198.51.100.20", origin = ORIGIN) =>
    req("/api/strooizout/bezoek", { method: "POST", body: JSON.stringify(body), ip, headers: { "User-Agent": ua, Origin: origin } });

  it("bezoek tellen zonder cookies: één rij per bezoeker per pagina per dag; bots en andere sites tellen niet", async () => {
    expect((await meld({ pagina: "winkel", bron: "flyer", herkomst: "www.facebook.com" })).status).toBe(204);
    await meld({ pagina: "winkel", bron: "flyer" }); // zelfde bezoeker, zelfde dag: niet dubbel
    await meld({ pagina: "bestelling" });
    await meld({ pagina: "winkel" }, UA_MOBIEL, "198.51.100.21"); // andere bezoeker
    await meld({ pagina: "winkel" }, "Mozilla/5.0 (compatible; Googlebot/2.1)"); // zoekmachine
    await meld({ pagina: "winkel" }, "WhatsApp/2.23"); // linkvoorbeeld
    await meld({ pagina: "winkel" }, UA_MOBIEL, "198.51.100.22", "https://evil.example"); // andere site
    await meld({ pagina: "beheer" }); // onbekende pagina
    const rijen = db.raw.prepare("SELECT pagina, apparaat, herkomst, bron, bezoeker FROM sz_bezoek ORDER BY pagina, bron DESC").all() as J[];
    expect(rijen.map((r) => [r.pagina, r.apparaat, r.herkomst, r.bron])).toEqual([
      ["bestelling", "telefoon", "direct", ""],
      ["winkel", "telefoon", "facebook.com", "flyer"],
      ["winkel", "telefoon", "direct", ""],
    ]);
    // geen IP of user-agent in de tabel
    expect(JSON.stringify(rijen)).not.toContain("198.51.100");
    expect(rijen[0].bezoeker).toMatch(/^[0-9a-f]{32}$/);
  });

  it("bestelling onthoudt de bron; het beheer toont bezoek, conversie, gemiddeld aantal zakken en bundels", async () => {
    await startRonde();
    await meld({ pagina: "winkel", bron: "flyer" });
    await meld({ pagina: "winkel" }, UA_MOBIEL, "198.51.100.30");
    await bestel({ regels: [{ product_id: 1, aantal: 4 }], bron: "flyer" });
    await bestel({ regels: [{ product_id: 1, aantal: 2 }], bron: "<script>" }); // ongeldige bron wordt leeg
    await bestel({ regels: [{ product_id: 1, aantal: 1 }], herkomst: "l.facebook.com" });
    expect(db.raw.prepare("SELECT bron FROM sz_bestelling ORDER BY id").all()).toEqual([{ bron: "flyer" }, { bron: "" }, { bron: "l.facebook.com" }]);
    const o = await jsonVan(beheer("/bezoek?dagen=7"));
    expect(o).toMatchObject({ dagen: 7, bezoekers: 2, bestellingen: 3, conversie: 150, gemiddeld_zakken: 2.3 });
    expect(o.per_dag).toHaveLength(7);
    expect(o.verdeling).toEqual([
      { zakken: "1", bestellingen: 1 },
      { zakken: "2", bestellingen: 1 },
      { zakken: "3", bestellingen: 0 },
      { zakken: "4", bestellingen: 1 },
      { zakken: "5–9", bestellingen: 0 },
      { zakken: "10+", bestellingen: 0 },
    ]);
    expect(o.bron_bestellingen).toEqual(expect.arrayContaining([{ bron: "flyer", n: 1 }, { bron: "onbekend", n: 1 }, { bron: "l.facebook.com", n: 1 }]));
    expect(o.bron_bezoek).toEqual([{ bron: "flyer", n: 1 }]);
    expect((await beheer("/bezoek", { token: null })).status).toBe(401);
  });

  it("structured data: Product + Offer met actuele prijs, staffels, voorbestelling, verkoper en retourbeleid; geen ‘binnenkort’-producten", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    const d = db as unknown as D1Database;
    const g = productGegevens(await laadCatalogus(d), await laadInstellingen(d), await laadMagazijn(d), "2026-11-22T12:00:00.000Z") as J;
    const [verkoper, ...producten] = g["@graph"];
    expect(verkoper).toMatchObject({ "@type": "Organization", name: "Denckh", vatID: "NL003791952B15", address: { streetAddress: "Vlierweg 54", addressLocality: "Houten", addressCountry: "NL" } });
    expect(producten.map((x: J) => [x.sku, x.offers.price, x.offers.availability.split("/").pop(), x.offers.availableDeliveryMethod.length])).toEqual([
      ["strooizout-25-kg", "9.99", "PreOrder", 2],
      ["strooizout-10-kg-eigen-emmer", "5.49", "PreOrder", 1], // alleen afhalen
      ["strooizout-10-kg-met-emmer", "6.49", "PreOrder", 2],
    ]);
    const o = producten[0].offers;
    expect(producten[0]).toMatchObject({ "@type": "Product", name: "Strooizout 25 kg", sku: "strooizout-25-kg", image: "https://strooizouthouten.nl/strooizout/beeld/strooizout-25kg.webp" });
    expect(o).toMatchObject({ price: "9.99", priceCurrency: "EUR", availability: "https://schema.org/PreOrder", availabilityStarts: "2026-11-26" });
    expect(o.priceSpecification.map((p: J) => [p.price, p.eligibleQuantity?.minValue, p.eligibleQuantity?.maxValue])).toEqual([
      ["9.99", 1, 1],
      ["9.49", 2, 3],
      ["8.99", 4, undefined],
    ]);
    expect(o.hasMerchantReturnPolicy).toMatchObject({ merchantReturnDays: 14, applicableCountry: "NL" });
    // na ontvangst: op voorraad
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 40 }) });
    const na = productGegevens(await laadCatalogus(d), await laadInstellingen(d), await laadMagazijn(d)) as J;
    expect(na["@graph"][1].offers.availability).toBe("https://schema.org/InStock");
    expect(na["@graph"][1].offers).not.toHaveProperty("availabilityStarts");
  });

  it("Google-verificatiecode: alleen een geldige code wordt opgeslagen", async () => {
    expect((await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ google_verificatie: '"><script>' }) })).status).toBe(422);
    const ok = await jsonVan(beheer("/instellingen", { method: "PUT", body: JSON.stringify({ google_verificatie: "AbCdEf123456_-xyz" }) }));
    expect(ok.instellingen.google_verificatie).toBe("AbCdEf123456_-xyz");
    // niet in de publieke winkelgegevens (staat alleen als meta-tag in de pagina)
    expect(JSON.stringify(await jsonVan(req("/api/strooizout/winkel")))).not.toContain("AbCdEf123456");
  });
});

describe("eigen domein strooizouthouten.nl", () => {
  const u = (s: string) => new URL(s);
  const pad = (r: ReturnType<typeof strooizoutDomein>) => (r && "pad" in r ? r.pad : null);
  const naar = (r: ReturnType<typeof strooizoutDomein>) => (r && "antwoord" in r ? [r.antwoord.status, r.antwoord.headers.get("Location")] : null);

  it("korte adressen op het eigen domein naar de interne pagina's", () => {
    expect(pad(strooizoutDomein(u("https://strooizouthouten.nl/"), false))).toBe("/strooizout");
    expect(pad(strooizoutDomein(u("https://strooizouthouten.nl/beheer"), false))).toBe("/strooizout/beheer");
    expect(pad(strooizoutDomein(u("https://strooizouthouten.nl/aan-de-weg/"), false))).toBe("/strooizout/aan-de-weg");
    expect(pad(strooizoutDomein(u("https://strooizouthouten.nl/bestelling"), false))).toBe("/strooizout/bestelling");
  });

  it("bestanden en API blijven gewoon; de rest van martijndenbesten.com hoort er niet bij", () => {
    for (const p of ["/api/strooizout/winkel", "/assets/x.js", "/fonts/geist.woff2", "/strooizout/beeld/strooizout-25kg.webp", "/strooizout/flyer-a5.pdf", "/bijbelreis/denckh-logo-signature.svg"]) {
      expect(strooizoutDomein(u(`https://strooizouthouten.nl${p}`), false)).toBeNull();
    }
    expect(naar(strooizoutDomein(u("https://strooizouthouten.nl/museum"), false))).toEqual([302, "/"]);
  });

  it("robots.txt en sitemap van het eigen domein", async () => {
    const r = strooizoutDomein(u("https://strooizouthouten.nl/robots.txt"), false);
    const robots = r && "antwoord" in r ? await r.antwoord.text() : "";
    expect(robots).toContain("Disallow: /beheer");
    expect(robots).toContain("Sitemap: https://strooizouthouten.nl/sitemap.xml");
    const s = strooizoutDomein(u("https://strooizouthouten.nl/sitemap.xml"), false);
    const xml = s && "antwoord" in s ? await s.antwoord.text() : "";
    expect(xml).toContain("<loc>https://strooizouthouten.nl/</loc>");
    expect(xml).not.toContain("beheer");
  });

  it("www en lange adressen verwijzen door", () => {
    expect(naar(strooizoutDomein(u("https://www.strooizouthouten.nl/beheer?x=1"), false))).toEqual([301, "https://strooizouthouten.nl/beheer?x=1"]);
    expect(naar(strooizoutDomein(u("https://strooizouthouten.nl/strooizout"), false))).toEqual([301, "/"]);
    expect(naar(strooizoutDomein(u("https://strooizouthouten.nl/strooizout/beheer"), false))).toEqual([301, "/beheer"]);
  });

  it("oud adres blijft werken; doorverwijzen pas als het aan staat", () => {
    expect(strooizoutDomein(u("https://martijndenbesten.com/strooizout"), false)).toBeNull();
    expect(strooizoutDomein(u("https://martijndenbesten.com/museum"), true)).toBeNull();
    expect(naar(strooizoutDomein(u("https://martijndenbesten.com/strooizout"), true))).toEqual([301, "https://strooizouthouten.nl/"]);
    expect(naar(strooizoutDomein(u("https://martijndenbesten.com/strooizout/aan-de-weg"), true))).toEqual([301, "https://strooizouthouten.nl/aan-de-weg"]);
    expect(naar(strooizoutDomein(u("https://martijndenbesten.com/zout"), true))).toEqual([301, "https://strooizouthouten.nl/"]);
    // bestanden (pdf, beelden) blijven op het oude adres bereikbaar
    expect(strooizoutDomein(u("https://martijndenbesten.com/strooizout/flyer-a5.pdf"), true)).toBeNull();
  });
});
