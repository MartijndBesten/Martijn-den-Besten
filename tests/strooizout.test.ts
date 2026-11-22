// Strooizout voor de buurt: prijsregels, validatie en de API (bestellen, beheer, exports) met echte SQL (node:sqlite).

import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleApi, korteLink, type Env } from "../worker/index";
import {
  bereken,
  betaalstatus,
  binnenBezorggebied,
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

const KLANT = { naam: "Anna de Vries", email: "anna@example.com", telefoon: "06 12345678", straat: "Testlaan", huisnummer: "12a", postcode: "3992ab", plaats: "Houten" };
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
    expect(ok.ok && ok.waarde.postcode).toBe("3992 AB");
    expect(ok.ok && ok.waarde.telefoon).toBe("0612345678");
    const buiten = controleerKlant({ ...KLANT, postcode: "3511 AA" }, "bezorgen", "3991, 3992");
    expect(!buiten.ok && buiten.fouten.postcode).toMatch(/bezorgen we helaas niet/);
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
    expect(w.producten.map((p: J) => p.naam)).toEqual(["Strooizout 25 kg"]);
    expect(w.producten[0]).not.toHaveProperty("inkoop_cent");
    expect(w.producten[0]).not.toHaveProperty("notitie");
    expect(JSON.stringify(w)).not.toContain("afhaal_adres");
    expect((await bestel()).status).toBe(409);
  });

  it("plaatst een bestelling met prijzen van de server, niet van de browser", async () => {
    await startRonde();
    const r = await bestel({ regels: [{ product_id: 1, aantal: 2, prijs_cent: 1 }], totaal_cent: 1, levering: "bezorgen" });
    expect(r.status).toBe(201);
    const b = (await r.json() as J).bestelling;
    expect(b.nummer).toBe("SZ-0001");
    expect(b.subtotaal_cent).toBe(1798);
    expect(b.bezorg_cent).toBe(100);
    expect(b.totaal_cent).toBe(1898);
    expect(b.code).toMatch(/^1-[0-9a-f]{24}$/);
    const rij = db.raw.prepare("SELECT * FROM sz_bestelling").get() as J;
    expect(rij.totaal_cent).toBe(1898);
    expect(rij.postcode).toBe("3992 AB");
    expect(db.raw.prepare("SELECT aantal, stukprijs_cent FROM sz_bestelregel").all()).toEqual([{ aantal: 2, stukprijs_cent: 899 }]);
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

  it("klantpagina: alleen met de juiste code, afhaaladres pas na bevestiging, annuleren kan", async () => {
    await startRonde();
    await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ afhaal_adres: "Geheimstraat 1, Houten" }) });
    const { bestelling } = await jsonVan(bestel());
    const kijk = (code: string) => req("/api/strooizout/bestelling/bekijk", { method: "POST", body: JSON.stringify({ code }) });
    expect((await kijk("1-000000000000000000000000")).status).toBe(404);
    const eerst = await jsonVan(kijk(bestelling.code));
    expect(eerst.bestelling.afhaal_adres).toBe("");
    expect(JSON.stringify(eerst)).not.toContain("Geheimstraat");
    await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "bevestigd" }) });
    expect((await jsonVan(kijk(bestelling.code))).bestelling.afhaal_adres).toBe("Geheimstraat 1, Houten");
    const weg = await jsonVan(req("/api/strooizout/bestelling/annuleer", { method: "POST", body: JSON.stringify({ code: bestelling.code }) }));
    expect(weg.bestelling.status).toBe("geannuleerd");
    expect(weg.bestelling.afhaal_adres).toBe("");
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
    await bestel({ regels: [{ product_id: 1, aantal: 2 }] }); // 17,98 ophalen
    await bestel({ regels: [{ product_id: 1, aantal: 3 }], levering: "bezorgen" }); // 26,97 + 1,50
    await bestel({ regels: [{ product_id: 1, aantal: 1 }] }); // wordt geannuleerd

    expect((await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "bezorgd" }) })).status).toBe(409); // ophalen
    expect((await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "afgehaald", van: "bevestigd" }) })).status).toBe(409); // verouderd
    expect((await beheer("/bestellingen/1/status", { method: "POST", body: JSON.stringify({ status: "afgehaald", van: "nieuw" }) })).status).toBe(200);
    expect((await beheer("/bestellingen/3/status", { method: "POST", body: JSON.stringify({ status: "geannuleerd" }) })).status).toBe(200);
    expect((await beheer("/bestellingen/3/status", { method: "POST", body: JSON.stringify({ status: "nieuw" }) })).status).toBe(409);

    expect((await beheer("/bestellingen/1/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1798, wijze: "contant" }) })).status).toBe(422); // niet bevestigd
    expect((await beheer("/bestellingen/1/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1798, wijze: "contant", ontvangen: true }) })).status).toBe(200);
    expect((await beheer("/bestellingen/2/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1000, wijze: "tikkie", ontvangen: true }) })).status).toBe(200);

    const o = (await jsonVan(beheer("/overzicht"))).cijfers;
    expect(o).toMatchObject({
      bestellingen: 2,
      geannuleerd: 1,
      zakken: 5,
      gewicht_gram: 125000,
      omzet_cent: 1798 + 2847,
      bezorg_cent: 150,
      inkoop_cent: 3000,
      brutowinst_cent: 1798 + 2847 - 3000,
      ontvangen_cent: 2798,
      openstaand_cent: 2847 - 1000,
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
    expect(detail.bestelling.klant_link).toMatch(/\/strooizout\/bestelling#2-[0-9a-f]{24}$/);
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
    expect(nieuw.id).toBe(3);

    // pakket: 2 zakken zout + strooiwagen, voorraad via de onderdelen
    db.raw.prepare("UPDATE sz_product SET status = 'actief', voorraad = 10, prijs_cent = 2500, inkoop_cent = 1500, beschrijving = 'x', afbeelding = '/strooizout/beeld/strooizout-25kg.webp' WHERE id = 3").run();
    db.raw.prepare("UPDATE sz_product SET voorraad = 5, inkoop_cent = 600 WHERE id = 1").run();
    const pakket = await jsonVan(
      beheer("/producten", {
        method: "POST",
        body: JSON.stringify({ naam: "Winterpakket", status: "actief", prijs_cent: 3999, beschrijving: "Twee zakken en een strooiwagen.", afbeelding: "/strooizout/beeld/strooizout-25kg.webp", onderdelen: [{ product_id: 1, aantal: 2 }, { product_id: 3, aantal: 1 }], aanbiedingen: [{ naam: "Actie", vanaf_aantal: 1, prijs_cent: 3499 }] }),
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
    expect((await beheer("/producten/3", { method: "DELETE" })).status).toBe(409);
    expect((await jsonVan(beheer(`/producten/${pakket.id}`, { method: "DELETE" }))).verwijderd).toBe("gearchiveerd");
    const los = await jsonVan(beheer("/producten", { method: "POST", body: JSON.stringify({ naam: "Ijskrabber", status: "concept" }) }));
    expect((await jsonVan(beheer(`/producten/${los.id}`, { method: "DELETE" }))).verwijderd).toBe("definitief");

    // verbergen haalt het uit de winkel
    const ip = await productInvoer(1);
    await beheer("/producten/1", { method: "PUT", body: JSON.stringify({ ...ip, status: "verborgen" }) });
    expect((await jsonVan(req("/api/strooizout/winkel"))).producten).toHaveLength(1); // alleen strooiwagen
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
    expect(b.inkoop[0]).toMatchObject({ naam: "Strooizout 25 kg", nodig: 10, gewicht_gram: 250000, verwachte_inkoop_cent: null });
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
    expect(rij).toMatchObject({ naam: "Gewist", email: "", telefoon: "", straat: "", postcode: "3992", totaal_cent: 1898 });
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
    const uitgifte = () => beheer(`/afhalen/${code}/uitgeven`, { method: "POST", body: JSON.stringify({ betaling: { wijze: "contant", bedrag_cent: 1798, ontvangen: true } }) });
    const [a, b] = await Promise.all([uitgifte(), uitgifte()]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);
    const tweede = [a, b].find((x) => x.status === 409)!;
    expect(((await tweede.json()) as J).error).toMatch(/al uitgegeven/);
    // precies één betaling geboekt, status afgehaald
    expect((db.raw.prepare("SELECT COUNT(*) AS n, SUM(bedrag_cent) AS som FROM sz_betaling").get() as J)).toEqual({ n: 1, som: 1798 });
    const na = await jsonVan(beheer(`/afhalen/${code}`));
    expect(na.bestelling).toMatchObject({ uitgegeven: true, betaalstatus: "betaald", status: "afgehaald" });
    // ook als beide verzoeken in dezelfde milliseconde vallen: precies één betaling
    const derde = (await (await bestel()).json()) as J;
    const vast = vi.spyOn(Date.prototype, "toISOString").mockReturnValue("2026-12-01T10:00:00.000Z");
    const u = () => beheer(`/afhalen/${derde.bestelling.afhaalcode}/uitgeven`, { method: "POST", body: JSON.stringify({ betaling: { wijze: "contant", bedrag_cent: 1798, ontvangen: true } }) });
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
    await beheer("/bestellingen/1/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1798, wijze: "tikkie", ontvangen: true }) });
    expect(await st()).toBe("betaald");
    await beheer("/bestellingen/1/betaling", { method: "POST", body: JSON.stringify({ bedrag_cent: 1798, wijze: "terugbetaling", ontvangen: true }) });
    expect(await st()).toBe("terugbetaald");
    const lijst = await jsonVan(beheer("/bestellingen?betaal=terugbetaald"));
    expect(lijst.bestellingen).toHaveLength(1);
  });
});

describe("staffelkorting", () => {
  const nu = "2026-12-01T12:00:00.000Z";
  const zout: PrijsProduct = { id: 1, naam: "Strooizout 25 kg", prijs_cent: 899, inkoop_cent: 600, bezorg_cent: null, gewicht_gram: 25000, aanbiedingen: [{ id: 1, naam: "Staffelkorting", vanaf_aantal: 4, prijs_cent: 849, start: null, eind: null, actief: true }] };
  const inst = { bezorg_methode: "per_stuk" as const, bezorg_per_stuk_cent: 50, bezorg_per_kg_cent: 2 };

  it("1–3 zakken € 8,99; vanaf 4 € 8,49 op alle zakken; bezorgkosten apart € 0,50 per zak", () => {
    const drie = bereken([{ product: zout, aantal: 3 }], "bezorgen", inst, nu);
    expect(drie).toMatchObject({ subtotaal_cent: 2697, korting_cent: 0, bezorg_cent: 150, totaal_cent: 2847 });
    const vier = bereken([{ product: zout, aantal: 4 }], "bezorgen", inst, nu);
    expect(vier).toMatchObject({ subtotaal_cent: 3396, korting_cent: 200, bezorg_cent: 200, totaal_cent: 3596 });
    expect(vier.regels[0]).toMatchObject({ stukprijs_cent: 849, normaalprijs_cent: 899, aanbieding: "Staffelkorting" });
    expect(bereken([{ product: zout, aantal: 10 }], "ophalen", inst, nu)).toMatchObject({ subtotaal_cent: 8490, korting_cent: 500, totaal_cent: 8490 });
    expect(bereken([{ product: zout, aantal: 20 }], "bezorgen", inst, nu)).toMatchObject({ subtotaal_cent: 16980, korting_cent: 1000, bezorg_cent: 1000, totaal_cent: 17980 });
  });

  it("melding ‘Bestel 4 zakken en bespaar € 2,00!’ bij 1–3 zakken, niet vanaf 4", () => {
    for (const n of [1, 2, 3]) expect(volgendeStaffel(zout, n, nu)).toEqual({ naam: "Staffelkorting", vanaf: 4, prijs_cent: 849, besparing_cent: 200 });
    expect(volgendeStaffel(zout, 4, nu)).toBeNull();
    expect(volgendeStaffel(zout, 12, nu)).toBeNull();
  });

  it("server-side: staffel staat standaard aan, korting wordt opgeslagen en komt in financiën", async () => {
    await startRonde();
    const w = await jsonVan(req("/api/strooizout/winkel"));
    expect(w.producten[0].aanbiedingen).toMatchObject([{ naam: "Staffelkorting", vanaf_aantal: 4, prijs_cent: 849 }]);
    const r3 = ((await (await bestel({ regels: [{ product_id: 1, aantal: 3, prijs_cent: 1 }] })).json()) as J).bestelling;
    expect(r3).toMatchObject({ subtotaal_cent: 2697, korting_cent: 0, totaal_cent: 2697 });
    const r4 = ((await (await bestel({ regels: [{ product_id: 1, aantal: 4 }], levering: "bezorgen" })).json()) as J).bestelling;
    expect(r4).toMatchObject({ subtotaal_cent: 3396, korting_cent: 200, bezorg_cent: 200, totaal_cent: 3596 });
    expect(db.raw.prepare("SELECT korting_cent FROM sz_bestelling WHERE id = 2").get()).toEqual({ korting_cent: 200 });
    expect(db.raw.prepare("SELECT stukprijs_cent, normaalprijs_cent, aanbieding FROM sz_bestelregel WHERE bestelling_id = 2").get()).toEqual({ stukprijs_cent: 849, normaalprijs_cent: 899, aanbieding: "Staffelkorting" });
    const r10 = ((await (await bestel({ regels: [{ product_id: 1, aantal: 10 }] })).json()) as J).bestelling;
    expect(r10).toMatchObject({ subtotaal_cent: 8490, korting_cent: 500 });
    const f = (await jsonVan(beheer("/financien"))).cijfers;
    expect(f).toMatchObject({ korting_cent: 700, product_omzet_cent: 2697 + 3396 + 8490, bezorg_cent: 200 });
    const fin = await (await beheer("/export/financien.csv")).text();
    expect(fin.split("\r\n")[0]).toContain("Producten normale prijs;Korting;Omzet producten");
    expect(fin).toContain(";35,96;2,00;33,96;");
  });

  it("staffel is in het beheer aan te passen (grens en prijs)", async () => {
    const p = await productInvoer(1);
    await beheer("/producten/1", { method: "PUT", body: JSON.stringify({ ...p, aanbiedingen: [{ naam: "Staffelkorting", vanaf_aantal: 5, prijs_cent: 799 }] }) });
    await startRonde();
    expect(((await (await bestel({ regels: [{ product_id: 1, aantal: 4 }] })).json()) as J).bestelling.totaal_cent).toBe(3596);
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
    expect(twee).toMatchObject({ subtotaal_cent: 1798, bezorg_cent: 100, totaal_cent: 1898 });
  });

  it("btw 21% inclusief over producten én bezorgkosten, ook met staffelkorting", async () => {
    db.raw.prepare("INSERT INTO sz_instelling (sleutel, waarde) VALUES ('btw_modus', '\"inclusief\"')").run();
    await startRonde();
    await bestel({ regels: [{ product_id: 1, aantal: 4 }], levering: "bezorgen" }); // 33,96 + 2,00 = 35,96
    const f = (await jsonVan(beheer("/financien"))).cijfers;
    expect(f.omzet_cent).toBe(3596);
    expect(f.btw_cent).toBe(Math.round((3596 * 21) / 121)); // 624
    expect(f.btw_cent).toBe(624);
    const csvTekst = await (await beheer("/export/financien.csv")).text();
    expect(csvTekst).toContain(";6,24;");
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
    expect(b).toMatchObject({ levering: "ophalen", status: "nieuw", betaalstatus: "open", totaal_cent: 1798 });
    expect(db.raw.prepare("SELECT kanaal, naam FROM sz_bestelling").get()).toEqual({ kanaal: "straat", naam: "Aan de weg" });
    expect((await straat({ klant: {} })).status).toBe(422); // mobiel nummer verplicht
    // de verkoper bevestigt betaling en uitgifte in één stap; nooit automatisch betaald
    const u = await beheer(`/afhalen/${b.afhaalcode}/uitgeven`, { method: "POST", body: JSON.stringify({ betaling: { wijze: "contant", bedrag_cent: 1798, ontvangen: true } }) });
    expect(((await u.json()) as J).bestelling).toMatchObject({ betaalstatus: "betaald", uitgegeven: true });
  });

  it("straatverkoop registreren in het beheer: voorraad, uitgifte en betaling in één keer, idempotent, met staffel", async () => {
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ verwacht: 40 }) });
    const verkoop = (extra: Record<string, unknown> = {}) => beheer("/straatverkoop", { method: "POST", body: JSON.stringify({ idempotentie: "straat-0001-abcdefghijkl", aantal: 4, wijze: "contant", ontvangen: true, ...extra }) });
    expect((await verkoop()).status).toBe(409); // nog niets ontvangen
    await beheer("/voorraad/1", { method: "POST", body: JSON.stringify({ ontvangen_erbij: 10 }) });
    const a = await jsonVan(verkoop());
    expect(a).toMatchObject({ herhaald: false, totaal_cent: 3396, korting_cent: 200 });
    expect((await jsonVan(verkoop())).herhaald).toBe(true); // dubbel klikken
    expect((await verkoop({ idempotentie: "straat-0002-abcdefghijkl", ontvangen: false })).status).toBe(422);
    expect((db.raw.prepare("SELECT COUNT(*) AS n FROM sz_bestelling").get() as J).n).toBe(1);
    expect(db.raw.prepare("SELECT kanaal, status FROM sz_bestelling").get()).toEqual({ kanaal: "beheer", status: "afgehaald" });
    expect((db.raw.prepare("SELECT SUM(bedrag_cent) AS s FROM sz_betaling").get() as J).s).toBe(3396);
    const v = (await jsonVan(beheer("/voorraad"))).voorraad.find((r: J) => r.id === 1);
    expect(v).toMatchObject({ gereserveerd: 4, uitgegeven: 4, in_magazijn: 6, beschikbaar: 36 });
    const o = (await jsonVan(beheer("/overzicht"))).cijfers;
    expect(o.per_kanaal.beheer).toEqual({ bestellingen: 1, omzet_cent: 3396 });
    // te veel: niet meer dan er ligt
    expect((await verkoop({ idempotentie: "straat-0003-abcdefghijkl", aantal: 7 })).status).toBe(409);
  });

  it("verkopergegevens: alleen geldige KvK- en btw-nummers worden opgeslagen", async () => {
    expect((await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ verkoper_kvk: "1234" }) })).status).toBe(422);
    expect((await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ verkoper_btw: "123" }) })).status).toBe(422);
    expect((await beheer("/instellingen", { method: "PUT", body: JSON.stringify({ beschikbaar_vanaf: "26-11-2026" }) })).status).toBe(422);
  });
});
