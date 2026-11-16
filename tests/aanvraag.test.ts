import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleApi, type Env } from "../worker/index";
import { aanvraagBeheer, aanvragenLijst, bouwMime, leesAanvraag, maakBericht, meldAanvraag, naAanvraag, ruimOp, MAIL_AAN, MAIL_VAN, type Aanvraag, type AanvraagEnv, type Diensten } from "../worker/aanvraag";
import { maakBijbelreisWorker } from "../worker/bijbelreis-app";
import { createD1 } from "./d1-shim";

// Aanvragen van bezoekers van de Bijbelreis (worker/aanvraag.ts): wat de server aanneemt, wat hij bewaart, wat het beheer
// ziet en welke e-mail er naar de maker gaat. Alle gegevens hier zijn verzonnen.

const SITE = "https://bijbelreis.nl";
const ADMIN = "test-admin-token-0123456789abcdef";
const NU = Math.floor(Date.UTC(2026, 10, 16, 9, 0, 0) / 1000); // maandag 16 november 2026, 10:00 in Nederland
const UUR = 3600;
const DAG = 86400;

let db: ReturnType<typeof createD1>;
let env: AanvraagEnv;
const wacht: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => void wacht.push(p), passThroughOnException: () => {} } as unknown as ExecutionContext;
const goed = (extra: Record<string, unknown> = {}) => ({ soort: "gemist", tekst: "Ik mis het verhaal van Hizkia.", email: "", context: "#jakob/7", website: "", ...extra });
type Opties = { ip?: string; koppen?: Record<string, string>; method?: string; ruw?: string; now?: number; diensten?: Diensten };
function stuur(body: Record<string, unknown> | null, o: Opties = {}) {
  const headers = new Headers({ "CF-Connecting-IP": o.ip ?? "203.0.113.7", "Sec-Fetch-Site": "same-origin", Origin: SITE, "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (iPhone) Safari/604.1", ...(o.koppen ?? {}) });
  for (const [k, v] of Object.entries(o.koppen ?? {})) if (v === "") headers.delete(k);
  const method = o.method ?? "POST";
  return meldAanvraag(new Request(SITE + "/api/aanvraag", { method, headers, body: method === "POST" ? o.ruw ?? JSON.stringify(body) : undefined }), env, ctx, o.now ?? NU, o.diensten);
}
type Rij = { id: number; tijd: number; soort: string; tekst: string; email: string; context: string; status: string; afgehandeld_op: number | null };
const rijen = () => db.raw.prepare("SELECT * FROM aanvraag ORDER BY id").all() as unknown as Rij[];
const antwoord = async (r: Response) => ({ status: r.status, ...((await r.json()) as { ok: boolean; error?: string; veld?: string }) });

beforeEach(() => {
  db = createD1();
  env = { DB: db as unknown as D1Database, HASH_SECRET: "geheim-voor-de-test" };
  wacht.length = 0;
});

describe("aanvraag: aannemen en bewaren", () => {
  it("een geldige aanvraag geeft { ok: true } en één rij, zonder IP-adres of user-agent", async () => {
    const r = await stuur(goed({ email: "ouder@voorbeeld.example" }));
    expect(await antwoord(r)).toEqual({ status: 200, ok: true });
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    expect(r.headers.get("Content-Type")).toContain("application/json");
    const [rij, ...rest] = rijen();
    expect(rest).toEqual([]);
    expect(rij).toMatchObject({ id: 1, tijd: NU, soort: "gemist", tekst: "Ik mis het verhaal van Hizkia.", email: "ouder@voorbeeld.example", context: "#jakob/7", status: "nieuw", afgehandeld_op: null });
    expect(Object.keys(rij).sort()).toEqual(["afgehandeld_op", "context", "email", "id", "soort", "status", "tekst", "tijd"]);
    const dump = JSON.stringify(db.raw.prepare("SELECT * FROM aanvraag").all()) + JSON.stringify(db.raw.prepare("SELECT * FROM rate_limits").all());
    expect(dump).not.toContain("203.0.113.7");
    expect(dump).not.toContain("iPhone");
  });

  it("de tekst blijft platte tekst: regeleinden mogen, stuurtekens en onzichtbare tekens niet; opmaak wordt niet uitgevoerd", async () => {
    await stuur(goed({ tekst: "  Regel één\r\nRegel twee\u0000\u200B \n\n\n\n<b>vet</b> <script>alert(1)</script>  " }));
    expect(rijen()[0].tekst).toBe("Regel één\nRegel twee\n\n<b>vet</b> <script>alert(1)</script>");
  });

  it("elke soort wordt aangenomen; een onbekende niet", async () => {
    for (const [i, soort] of ["gemist", "groep", "fout", "anders"].entries()) expect((await stuur(goed({ soort }), { ip: `198.51.100.${i}` })).status).toBe(200);
    expect(await antwoord(await stuur(goed({ soort: "reclame" })))).toMatchObject({ status: 422, ok: false, veld: "soort" });
    expect(await antwoord(await stuur(goed({ soort: undefined })))).toMatchObject({ status: 422, veld: "soort" });
    expect(rijen().map((r) => r.soort)).toEqual(["gemist", "groep", "fout", "anders"]);
  });

  it("de tekst moet 10 tot 600 tekens zijn; de melding zegt wat er mis is en bij welk veld", async () => {
    expect(await antwoord(await stuur(goed({ tekst: "te kort" })))).toEqual({ status: 422, ok: false, error: "Schrijf iets meer: minstens 10 tekens.", veld: "tekst" });
    expect(await antwoord(await stuur(goed({ tekst: "          a          " })))).toMatchObject({ status: 422, veld: "tekst" });
    expect(await antwoord(await stuur(goed({ tekst: "a".repeat(601) })))).toEqual({ status: 422, ok: false, error: "Je tekst is te lang: hooguit 600 tekens.", veld: "tekst" });
    expect(await antwoord(await stuur(goed({ tekst: 12345678901 })))).toMatchObject({ status: 422, veld: "tekst" });
    expect((await stuur(goed({ tekst: "é".repeat(600) }))).status).toBe(200); // tekens, geen bytes
    expect(rijen().length).toBe(1);
  });

  it("het e-mailadres is leeg of geldig en hooguit 120 tekens", async () => {
    for (const email of ["geen-adres", "a@b", "a b@voorbeeld.example", "a@voorbeeld.example\r\nBcc: x@y.example", "a@@voorbeeld.example", `${"a".repeat(64)}@${"b".repeat(60)}.example`, 5]) {
      expect(await antwoord(await stuur(goed({ email }))), String(email)).toMatchObject({ status: 422, ok: false, veld: "email" });
    }
    expect((await stuur(goed({ email: "  jan.jansen+bijbel@voorbeeld.example  " }))).status).toBe(200);
    expect((await stuur(goed({ email: undefined }), { ip: "198.51.100.1" })).status).toBe(200);
    expect(rijen().map((r) => r.email)).toEqual(["jan.jansen+bijbel@voorbeeld.example", ""]);
  });

  it("de context is bijzaak: klopt hij niet, dan vervalt hij en gaat de aanvraag door", async () => {
    const fout = ["jakob/7", "#", "#<script>", "#jakob/7 onzin", "#" + "a".repeat(80), "https://voorbeeld.example/#x", 7, undefined];
    for (const [i, context] of fout.entries()) expect((await stuur(goed({ context }), { ip: `198.51.100.${i}` })).status).toBe(200);
    for (const [i, context] of ["#v26", "#boek=exodus", "#kerst-geboorte/2", "#abraham/3-8&niveau=b"].entries()) expect((await stuur(goed({ context }), { ip: `192.0.2.${i}` })).status).toBe(200);
    expect(rijen().map((r) => r.context)).toEqual([...fout.map(() => ""), "#v26", "#boek=exodus", "#kerst-geboorte/2", "#abraham/3-8&niveau=b"]);
  });

  it("onbekende velden, geen JSON, een verkeerd inhoudstype en een te grote inhoud worden geweigerd zonder rij", async () => {
    expect(await antwoord(await stuur(goed({ extra: "x" })))).toMatchObject({ status: 422, ok: false });
    expect((await stuur(null, { ruw: "geen json" })).status).toBe(400);
    expect((await stuur(null, { ruw: "[]" })).status).toBe(422);
    expect((await stuur(goed(), { koppen: { "Content-Type": "text/plain" } })).status).toBe(415);
    expect((await stuur(null, { ruw: JSON.stringify(goed({ tekst: "a".repeat(5000) })) })).status).toBe(413);
    expect((await stuur(goed(), { koppen: { "Content-Length": "99999" } })).status).toBe(413);
    expect(rijen()).toEqual([]);
  });

  it("alleen POST, en alleen van de eigen site", async () => {
    const get = await stuur(null, { method: "GET" });
    expect(get.status).toBe(405);
    expect(get.headers.get("Allow")).toBe("POST");
    expect(await antwoord(await stuur(goed(), { koppen: { "Sec-Fetch-Site": "cross-site" } }))).toMatchObject({ status: 403, ok: false });
    expect((await stuur(goed(), { koppen: { "Sec-Fetch-Site": "", Origin: "https://kwaad.example" } })).status).toBe(403);
    expect((await stuur(goed(), { koppen: { "Sec-Fetch-Site": "", Origin: "" } })).status).toBe(403);
    expect((await stuur(goed(), { koppen: { "Sec-Fetch-Site": "" } })).status).toBe(200); // oudere browser: alleen Origin
    expect(rijen().length).toBe(1);
  });

  it("het lokveld: wie het invult krijgt ‘gelukt’, maar er wordt niets bewaard en niets geteld", async () => {
    expect(await antwoord(await stuur(goed({ website: "https://reclame.example" })))).toEqual({ status: 200, ok: true });
    expect(await antwoord(await stuur(goed({ website: 1 })))).toEqual({ status: 200, ok: true });
    expect(rijen()).toEqual([]);
    expect(db.raw.prepare("SELECT COUNT(*) AS n FROM rate_limits").get()).toEqual({ n: 0 });
  });

  it("zonder database een duidelijke melding met het e-mailadres", async () => {
    env = {};
    expect(await antwoord(await stuur(goed()))).toEqual({ status: 503, ok: false, error: "Aanvragen kan hier niet. Mail naar info@denckh.nl." });
  });
});

describe("aanvraag: begrenzing", () => {
  it("hooguit 3 per uur per bezoeker; een andere bezoeker en het volgende uur mogen weer", async () => {
    for (let i = 0; i < 3; i++) expect((await stuur(goed())).status).toBe(200);
    const vierde = await stuur(goed());
    expect(await antwoord(vierde)).toMatchObject({ status: 429, ok: false });
    expect(vierde.headers.get("Retry-After")).toBe("3600");
    expect((await stuur(goed(), { ip: "198.51.100.9" })).status).toBe(200);
    expect((await stuur(goed(), { now: NU + UUR })).status).toBe(200);
    expect(rijen().length).toBe(5);
  });

  it("hooguit 8 per dag per bezoeker", async () => {
    const begin = Math.floor(NU / DAG) * DAG;
    let gelukt = 0;
    for (let uur = 0; uur < 6; uur++) for (let i = 0; i < 2; i++) if ((await stuur(goed(), { now: begin + uur * UUR + i })).status === 200) gelukt++;
    expect(gelukt).toBe(8);
    expect((await stuur(goed(), { now: begin + 7 * UUR })).status).toBe(429);
    expect((await stuur(goed(), { now: begin + DAG + 5 })).status).toBe(200);
  });

  it("hooguit 200 aanvragen per etmaal in totaal, wie ze ook stuurt", async () => {
    const ins = db.raw.prepare("INSERT INTO aanvraag (tijd, soort, tekst) VALUES (?, 'anders', 'verzonnen aanvraag')");
    for (let i = 0; i < 199; i++) ins.run(NU - 100 - i);
    expect((await stuur(goed())).status).toBe(200);
    expect(await antwoord(await stuur(goed(), { ip: "198.51.100.3" }))).toMatchObject({ status: 503, ok: false });
    expect(rijen().length).toBe(200);
    expect((await stuur(goed(), { ip: "198.51.100.3", now: NU + DAG + 10 })).status).toBe(200); // een etmaal later
  });

  it("zonder geheime sleutel werkt de begrenzing nog steeds, zonder vaste hash", async () => {
    env = { DB: env.DB };
    for (let i = 0; i < 3; i++) expect((await stuur(goed())).status).toBe(200);
    expect((await stuur(goed())).status).toBe(429);
  });
});

describe("aanvraag: opruimen", () => {
  it("aanvragen ouder dan 400 dagen verdwijnen (afgehandelde vanaf het afhandelen); verlopen tellers ook", async () => {
    const ins = db.raw.prepare("INSERT INTO aanvraag (tijd, soort, tekst, status, afgehandeld_op) VALUES (?, 'anders', ?, ?, ?)");
    ins.run(NU - 401 * DAG, "oud en nieuw gebleven", "nieuw", null);
    ins.run(NU - 399 * DAG, "jonger dan de termijn", "nieuw", null);
    ins.run(NU - 500 * DAG, "oud, lang geleden afgehandeld", "afgehandeld", NU - 401 * DAG);
    ins.run(NU - 500 * DAG, "oud, pas kort afgehandeld", "afgehandeld", NU - 10 * DAG);
    db.raw.prepare("INSERT INTO rate_limits (key, count, window_start) VALUES ('oud', 1, ?), ('vers', 1, ?)").run(NU - 3 * DAG, NU);
    await ruimOp(env.DB!, NU);
    expect(rijen().map((r) => r.tekst)).toEqual(["jonger dan de termijn", "oud, pas kort afgehandeld"]);
    expect(db.raw.prepare("SELECT key FROM rate_limits").all()).toEqual([{ key: "vers" }]);
  });
});

describe("aanvraag: lezen", () => {
  it("leesAanvraag geeft de opgeschoonde waarde of de melding met het veld", () => {
    expect(leesAanvraag(goed({ tekst: "  Een nette aanvraag.  ", email: " a@voorbeeld.example " }))).toEqual({ ok: true, lok: false, waarde: { soort: "gemist", tekst: "Een nette aanvraag.", email: "a@voorbeeld.example", context: "#jakob/7" } });
    expect(leesAanvraag("tekst")).toMatchObject({ ok: false, veld: "" });
    expect(leesAanvraag(null)).toMatchObject({ ok: false });
  });
});

// ---------- e-mail naar de maker ----------

const aanvraag = (extra: Partial<Aanvraag> = {}): Aanvraag => ({ soort: "gemist", tekst: "Ik mis het verhaal van Hizkia.", email: "", context: "#jakob/7", ...extra });
function nepMail(opties: { faalt?: (bericht: unknown) => boolean } = {}) {
  const verstuurd: unknown[] = [];
  const MAIL = { send: async (bericht: unknown) => { if (opties.faalt?.(bericht)) throw Object.assign(new Error("verzenden mislukt"), { code: "E_SENDER_NOT_VERIFIED" }); verstuurd.push(bericht); return { messageId: "nep" }; } } as unknown as SendEmail;
  return { MAIL, verstuurd };
}
class NepEmailMessage { constructor(public from: string, public to: string, public raw: string) {} }
const diensten = { EmailMessage: NepEmailMessage as unknown as Diensten["EmailMessage"] };
const koppen = (mime: string) => mime.split("\r\n\r\n")[0].split("\r\n");
// De delen van het ruwe bericht (multipart/alternative): per deel de kopregels en de gedecodeerde inhoud.
function delen(mime: string) {
  const grens = /boundary="([^"]+)"/.exec(koppen(mime).find((k) => k.startsWith("Content-Type"))!)![1];
  const stukken = mime.slice(mime.indexOf("\r\n\r\n") + 4).split(`--${grens}`);
  expect(stukken[0]).toBe(""); // niets vóór het eerste deel
  expect(stukken[stukken.length - 1]).toBe("--\r\n"); // de afsluitende grens, en daarna niets
  return stukken.slice(1, -1).map((d) => {
    const [kop, inhoud] = d.replace(/^\r\n/, "").split("\r\n\r\n");
    return { grens, koppen: kop.split("\r\n"), tekst: Buffer.from(inhoud.replace(/\r\n/g, ""), "base64").toString("utf8") };
  });
}
const lijf = (mime: string) => delen(mime)[0].tekst;

describe("aanvraag: het bericht voor de maker", () => {
  it("onderwerp uit vaste woorden en het nummer; tekst met soort, tijd in Nederland, volledige link en het antwoordadres", () => {
    const b = maakBericht(12, aanvraag({ email: "ouder@voorbeeld.example" }), NU);
    expect(b.onderwerp).toBe("Aanvraag #12 - gemist gedeelte");
    expect(b.replyTo).toBe("ouder@voorbeeld.example");
    expect(b.tekst.split("\n")).toEqual([
      "Nieuwe aanvraag bij de Bijbelreis (#12)",
      "",
      "Soort: Een Bijbelgedeelte of verhaal dat ik mis",
      "Wanneer: maandag 16 november 2026 om 10:00 (Nederlandse tijd)",
      "Waar: https://bijbelreis.nl/#jakob/7",
      "Antwoorden naar: ouder@voorbeeld.example",
      "",
      "Wat er gevraagd wordt:",
      "Ik mis het verhaal van Hizkia.",
      "",
      "-- ",
      "Afhandelen: https://martijndenbesten.com/beheer (Aanvragen bijbelreis.nl)",
    ]);
    expect(maakBericht(3, aanvraag({ soort: "groep", context: "" }), NU)).toMatchObject({ onderwerp: "Aanvraag #3 - school, club of kerk", replyTo: "" });
    expect(maakBericht(3, aanvraag({ context: "" }), NU).tekst).toContain("Waar: niet bekend\nGeen e-mailadres opgegeven");
    expect(maakBericht(4, aanvraag({ soort: "fout" }), NU).onderwerp).toBe("Aanvraag #4 - fout of verbetering");
    expect(maakBericht(5, aanvraag({ soort: "anders" }), NU).onderwerp).toBe("Aanvraag #5 - iets anders");
  });

  it("een ongeldig adres komt nooit in het antwoordadres, ook niet als het langs de eerste controle zou komen", () => {
    for (const email of ["a@voorbeeld.example\r\nBcc: kwaad@voorbeeld.example", "geen-adres", "a@voorbeeld.example\nSubject: x", `${"a".repeat(64)}@${"b".repeat(60)}.example`]) {
      const b = maakBericht(1, aanvraag({ email }), NU);
      expect(b.replyTo, email).toBe("");
      expect(b.tekst).toContain("Geen e-mailadres opgegeven");
    }
  });

  it("het ruwe bericht: vaste kopregels, Reply-To alleen bij een adres, en twee versies (platte tekst, dan HTML) in UTF-8 als base64", () => {
    const b = maakBericht(12, aanvraag({ email: "ouder@voorbeeld.example", tekst: "Staat Psalm 23 er ook in?\nGroeten, een vader — met ‘aanhalingstekens’ en ë." }), NU);
    const mime = bouwMime(b, { datum: new Date(NU * 1000), berichtId: "aanvraag-12.0123456789abcdef" });
    expect(koppen(mime)).toEqual([
      `From: Bijbelreis <${MAIL_VAN}>`,
      `To: <${MAIL_AAN}>`,
      "Reply-To: <ouder@voorbeeld.example>",
      "Subject: Aanvraag #12 - gemist gedeelte",
      "Date: Mon, 16 Nov 2026 09:00:00 +0000",
      "Message-ID: <aanvraag-12.0123456789abcdef@bijbelreis.nl>",
      "MIME-Version: 1.0",
      'Content-Type: multipart/alternative; boundary="=_br_nvraag120123456789abcdef"',
      "Auto-Submitted: auto-generated",
    ]);
    const [plat, html] = delen(mime);
    expect(delen(mime)).toHaveLength(2);
    // Eerst de platte tekst (de terugval), daarna de HTML: een mailprogramma toont het laatste deel dat het aankan.
    expect(plat.koppen).toEqual(["Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64"]);
    expect(html.koppen).toEqual(["Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: base64"]);
    expect(plat.tekst).toBe(b.tekst.replace(/\n/g, "\r\n"));
    expect(plat.tekst).toContain("een vader — met ‘aanhalingstekens’ en ë.");
    expect(html.tekst).toBe(b.html.replace(/\n/g, "\r\n"));
    expect(html.tekst).toContain("een vader — met ‘aanhalingstekens’ en ë.");
    // De grens komt in geen van beide delen voor (base64 bevat geen ‘=_’ aan het begin van een regel en geen ‘_’).
    expect(mime.split(`--${plat.grens}`).length).toBe(4);
    for (const regel of mime.split("\r\n")) expect(regel.length).toBeLessThanOrEqual(78);
    expect(mime).toMatch(/^[\x00-\x7F]*$/); // alles buiten ASCII zit in de base64
    expect(mime.endsWith("\r\n")).toBe(true);
    expect(koppen(bouwMime(maakBericht(1, aanvraag(), NU), { datum: new Date(NU * 1000), berichtId: "x" })).some((k) => k.startsWith("Reply-To"))).toBe(false);
  });

  it("geen injectie: regeleinden in de tekst, het adres, het onderwerp of het bericht-id maken nooit een extra kopregel of een extra deel", () => {
    const kwaad = aanvraag({ tekst: "Hallo\r\nBcc: kwaad@voorbeeld.example\r\n\r\nSubject: nep\r\n--=_br_x--", email: "a@voorbeeld.example\r\nBcc: kwaad@voorbeeld.example" });
    const b = maakBericht(7, kwaad, NU);
    const mime = bouwMime({ ...b, onderwerp: b.onderwerp + "\r\nBcc: kwaad@voorbeeld.example", replyTo: "a@voorbeeld.example\r\nBcc: kwaad@voorbeeld.example" }, { datum: new Date(NU * 1000), berichtId: "x\r\nBcc: kwaad@voorbeeld.example" });
    const k = koppen(mime);
    expect(k.map((r) => r.split(":")[0])).toEqual(["From", "To", "Subject", "Date", "Message-ID", "MIME-Version", "Content-Type", "Auto-Submitted"]);
    expect(k.find((r) => r.startsWith("Subject"))).toBe("Subject: Aanvraag #7 - gemist gedeelte Bcc: kwaad@voorbeeld.example");
    expect(k.find((r) => r.startsWith("Message-ID"))).toBe("Message-ID: <xBcckwaadvoorbeeld.example@bijbelreis.nl>");
    expect(k.find((r) => r.startsWith("Content-Type"))).toBe('Content-Type: multipart/alternative; boundary="=_br_Bcckwaadvoorbeeldexample"');
    expect(delen(mime)).toHaveLength(2); // precies twee delen, wat er ook in de tekst staat
    expect(lijf(mime)).toContain("Hallo\r\nBcc: kwaad@voorbeeld.example"); // als gewone tekst, in de inhoud
  });

  it("een onderwerp met andere tekens dan ASCII wordt een ‘encoded-word’", () => {
    const mime = bouwMime({ onderwerp: "Bijbelreis: ideeën", tekst: "x", html: "<p>x</p>", replyTo: "" }, { datum: new Date(NU * 1000), berichtId: "x" });
    expect(koppen(mime).find((r) => r.startsWith("Subject"))).toBe(`Subject: =?UTF-8?B?${Buffer.from("Bijbelreis: ideeën").toString("base64")}?=`);
  });
});

describe("aanvraag: de melding versturen", () => {
  it("met de binding gaat er één e-mail uit, van het vaste adres naar de maker, met het antwoordadres van de bezoeker", async () => {
    const { MAIL, verstuurd } = nepMail();
    env.MAIL = MAIL;
    expect((await stuur(goed({ email: "ouder@voorbeeld.example" }), { diensten })).status).toBe(200);
    await Promise.all(wacht);
    expect(verstuurd).toEqual([
      { from: { email: "aanvraag@bijbelreis.nl", name: "Bijbelreis" }, to: "info@denckh.nl", subject: "Aanvraag #1 - gemist gedeelte", text: maakBericht(1, aanvraag({ email: "ouder@voorbeeld.example" }), NU).tekst, html: maakBericht(1, aanvraag({ email: "ouder@voorbeeld.example" }), NU).html, replyTo: "ouder@voorbeeld.example" },
    ]);
  });

  it("zonder e-mailadres van de bezoeker geen antwoordadres", async () => {
    const { MAIL, verstuurd } = nepMail();
    expect(await naAanvraag({ MAIL }, 2, aanvraag(), NU)).toBe("velden");
    expect(verstuurd[0]).not.toHaveProperty("replyTo");
    // Beide versies gaan mee: de platte tekst als terugval en de HTML.
    expect(verstuurd[0]).toMatchObject({ text: expect.stringContaining("Nieuwe aanvraag bij de Bijbelreis (#2)"), html: expect.stringContaining("<!DOCTYPE html>") });
  });

  it("lukt de eerste manier niet, dan gaat het als ruw bericht; lukt dat ook niet, dan blijft het daarbij", async () => {
    const stil = vi.spyOn(console, "error").mockImplementation(() => {});
    const eerst = nepMail({ faalt: (b) => !(b instanceof NepEmailMessage) });
    expect(await naAanvraag({ MAIL: eerst.MAIL }, 9, aanvraag({ email: "ouder@voorbeeld.example" }), NU, diensten)).toBe("ruw");
    const [ruw] = eerst.verstuurd as NepEmailMessage[];
    expect([ruw.from, ruw.to]).toEqual(["aanvraag@bijbelreis.nl", "info@denckh.nl"]);
    expect(koppen(ruw.raw)).toContain("Reply-To: <ouder@voorbeeld.example>");
    expect(koppen(ruw.raw).find((k) => k.startsWith("Message-ID"))).toMatch(/^Message-ID: <aanvraag-9\.[0-9a-f]{16}@bijbelreis\.nl>$/);
    expect(await naAanvraag({ MAIL: eerst.MAIL }, 9, aanvraag(), NU)).toBe(""); // zonder de klasse EmailMessage geen tweede poging
    expect(await naAanvraag({ MAIL: nepMail({ faalt: () => true }).MAIL }, 9, aanvraag(), NU, diensten)).toBe("");
    expect(stil).toHaveBeenCalled();
    stil.mockRestore();
  });

  it("een ontbrekende of falende binding raakt de opslag en het antwoord niet", async () => {
    const stil = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await naAanvraag({}, 1, aanvraag(), NU, diensten)).toBe("");
    expect(await antwoord(await stuur(goed()))).toEqual({ status: 200, ok: true }); // geen binding
    env.MAIL = nepMail({ faalt: () => true }).MAIL;
    expect(await antwoord(await stuur(goed({ tekst: "Tweede aanvraag, de e-mail mislukt." }), { diensten }))).toEqual({ status: 200, ok: true });
    env.MAIL = { send: () => { throw new Error("stuk"); } } as unknown as SendEmail;
    expect(await antwoord(await stuur(goed({ tekst: "Derde aanvraag, de binding gooit meteen." }), { diensten }))).toEqual({ status: 200, ok: true });
    await Promise.all(wacht);
    expect(rijen().map((r) => r.status)).toEqual(["nieuw", "nieuw", "nieuw"]);
    stil.mockRestore();
  });

  it("een afgewezen aanvraag en het lokveld geven geen e-mail", async () => {
    const { MAIL, verstuurd } = nepMail();
    env.MAIL = MAIL;
    await stuur(goed({ tekst: "kort" }), { diensten });
    await stuur(goed({ website: "x" }), { diensten });
    await stuur(goed(), { diensten, koppen: { "Sec-Fetch-Site": "cross-site" } });
    await Promise.all(wacht);
    expect(verstuurd).toEqual([]);
  });
});

// ---------- de twee Workers ----------

describe("aanvraag: de Worker van bijbelreis.nl", () => {
  const worker = maakBijbelreisWorker({ "/bijbelreis.html": ["text/html; charset=utf-8", "etag", btoa("<!doctype html><title>Bijbelreis</title>")] }, []);
  const post = (body: unknown, koppen: Record<string, string> = {}) =>
    worker.fetch!(new Request(SITE + "/api/aanvraag", { method: "POST", headers: { "Sec-Fetch-Site": "same-origin", "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.7", ...koppen }, body: JSON.stringify(body) }) as never, env as never, ctx);

  it("neemt een aanvraag aan en bewaart hem; GET geeft 405; de atlas zelf blijft werken", async () => {
    expect(await antwoord(await post(goed()))).toEqual({ status: 200, ok: true });
    expect(rijen().length).toBe(1);
    const get = await worker.fetch!(new Request(SITE + "/api/aanvraag") as never, env as never, ctx);
    expect(get.status).toBe(405);
    expect((await worker.fetch!(new Request(SITE + "/") as never, env as never, ctx)).status).toBe(200);
  });

  it("zonder database (binding ontbreekt) geen crash maar een duidelijke melding", async () => {
    const r = await worker.fetch!(new Request(SITE + "/api/aanvraag", { method: "POST", headers: { "Sec-Fetch-Site": "same-origin", "Content-Type": "application/json" }, body: JSON.stringify(goed()) }) as never, {} as never, ctx);
    expect(r.status).toBe(503);
  });
});

describe("aanvraag: de hoofd-Worker en het beheer", () => {
  const hoofd = (extra: Partial<Env> = {}): Env => ({ DB: env.DB!, ASSETS: {} as Fetcher, ADMIN_TOKEN: ADMIN, HASH_SECRET: "geheim-voor-de-test", ...extra });
  const api = (pad: string, init: RequestInit = {}, e: Env = hoofd()) => handleApi(new Request("https://martijndenbesten.com" + pad, init), e, ctx);
  const metToken = (init: RequestInit = {}) => ({ ...init, headers: { Authorization: `Bearer ${ADMIN}`, ...(init.body ? { "Content-Type": "application/json" } : {}), ...(init.headers ?? {}) } });
  const stuurHoofd = (e: Env) => api("/api/aanvraag", { method: "POST", headers: { "Sec-Fetch-Site": "same-origin", "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.7" }, body: JSON.stringify(goed()) }, e);

  it("in productie neemt de hoofdsite geen aanvragen aan; in de lokale testopstelling wel", async () => {
    expect((await stuurHoofd(hoofd())).status).toBe(404);
    expect(rijen()).toEqual([]);
    expect(await antwoord(await stuurHoofd(hoofd({ BIJBELREIS_VERHUISD: "uit" })))).toEqual({ status: 200, ok: true });
    expect(rijen().length).toBe(1);
  });

  it("de lijst en het afhandelen vragen het beheertoken", async () => {
    expect((await api("/api/admin/aanvragen")).status).toBe(401);
    expect((await api("/api/admin/aanvragen", { headers: { Authorization: "Bearer verkeerd-token-0123456789abcdef" } })).status).toBe(401);
    expect((await api("/api/admin/aanvragen/1", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actie: "afgehandeld" }) })).status).toBe(401);
  });

  it("de lijst toont nieuw of afgehandeld, nieuwste eerst, met het aantal nieuwe", async () => {
    await stuur(goed({ tekst: "Eerste aanvraag, de oudste.", email: "ouder@voorbeeld.example" }));
    await stuur(goed({ soort: "fout", tekst: "Tweede aanvraag, de nieuwste." }), { now: NU + 60 });
    const r = (await (await api("/api/admin/aanvragen?status=nieuw", metToken())).json()) as { ok: boolean; nieuw: number; aanvragen: Rij[] };
    expect(r.ok).toBe(true);
    expect(r.nieuw).toBe(2);
    expect(r.aanvragen.map((a) => a.tekst)).toEqual(["Tweede aanvraag, de nieuwste.", "Eerste aanvraag, de oudste."]);
    expect(r.aanvragen[1]).toEqual({ id: 1, tijd: NU, soort: "gemist", tekst: "Eerste aanvraag, de oudste.", email: "ouder@voorbeeld.example", context: "#jakob/7", status: "nieuw", afgehandeld_op: null });
    const leeg = (await (await api("/api/admin/aanvragen?status=afgehandeld", metToken())).json()) as { nieuw: number; aanvragen: Rij[] };
    expect(leeg).toMatchObject({ nieuw: 2, aanvragen: [] });
    expect((await api("/api/admin/aanvragen", metToken())).status).toBe(200); // zonder status: nieuw
    expect((await api("/api/admin/aanvragen?status=alles", metToken())).status).toBe(400);
  });

  it("afhandelen zet de status, bewaart het moment en wist het e-mailadres; verwijderen haalt de rij weg", async () => {
    await stuur(goed({ email: "ouder@voorbeeld.example" }));
    await stuur(goed({ tekst: "Reclame, mag weg uit de lijst." }), { ip: "198.51.100.2" });
    const doe = (id: number, actie: string) => api(`/api/admin/aanvragen/${id}`, metToken({ method: "POST", body: JSON.stringify({ actie }) }));
    expect((await doe(1, "afgehandeld")).status).toBe(200);
    expect(rijen()[0]).toMatchObject({ id: 1, status: "afgehandeld", email: "" });
    expect(rijen()[0].afgehandeld_op).toBeGreaterThan(NU - 10);
    expect((await doe(1, "afgehandeld")).status).toBe(404); // al afgehandeld
    expect((await doe(2, "onzin")).status).toBe(400);
    expect((await doe(2, "verwijder")).status).toBe(200);
    expect((await doe(2, "verwijder")).status).toBe(404);
    expect((await doe(99, "afgehandeld")).status).toBe(404);
    expect(rijen().map((r) => r.id)).toEqual([1]);
    expect(await aanvragenLijst(env.DB!, "nieuw")).toEqual({ aanvragen: [], nieuw: 0 });
    expect(await aanvragenLijst(env.DB!, "x")).toBeNull();
    expect(await aanvraagBeheer(env.DB!, 1, undefined, NU)).toBe("onbekend");
  });
});
