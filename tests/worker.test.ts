import { beforeEach, describe, expect, it } from "vitest";
import { handleApi, type Env } from "../worker/index";
import { createD1 } from "./d1-shim";

const ORIGIN = "https://martijndenbesten.com";
const ADMIN = "test-admin-token-0123456789abcdef";

let env: Env;
let db: ReturnType<typeof createD1>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type J = any;
const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

function req(path: string, init: RequestInit & { ip?: string } = {}) {
  const headers = new Headers(init.headers);
  headers.set("CF-Connecting-IP", init.ip ?? "203.0.113.7");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (init.method === "POST" && !headers.has("Origin")) headers.set("Origin", ORIGIN);
  return handleApi(new Request(ORIGIN + path, { ...init, headers }), env, ctx);
}

const idea = (extra: Record<string, unknown> = {}) =>
  JSON.stringify({ title: "Een paraplu voor binnen", description: "Voor als het binnen regent.", category: "briljant", website: "", elapsedMs: 5000, ...extra });

beforeEach(() => {
  db = createD1();
  env = { DB: db as unknown as D1Database, ASSETS: {} as Fetcher, ADMIN_TOKEN: ADMIN, HASH_SECRET: "geheim" };
});

describe("stemmen", () => {
  it("telt één stem per bezoeker per object per dag", async () => {
    const a = await (await req("/api/votes", { method: "POST", body: JSON.stringify({ itemId: "uitstel-app" }) })).json() as J;
    expect(a).toMatchObject({ ok: true, count: 1, counted: true });
    const b = await (await req("/api/votes", { method: "POST", body: JSON.stringify({ itemId: "uitstel-app" }) })).json() as J;
    expect(b).toMatchObject({ ok: true, count: 1, counted: false });
    const c = await (await req("/api/votes", { method: "POST", body: JSON.stringify({ itemId: "uitstel-app" }), ip: "198.51.100.1" })).json() as J;
    expect(c.count).toBe(2);
    const counts = await (await req("/api/votes")).json() as J;
    expect(counts.counts["uitstel-app"]).toBe(2);
  });

  it("weigert onbekende objecten en stemmen zonder eigen origin", async () => {
    expect((await req("/api/votes", { method: "POST", body: JSON.stringify({ itemId: "bestaat-niet" }) })).status).toBe(400);
    expect((await req("/api/votes", { method: "POST", body: JSON.stringify({ itemId: "uitstel-app" }), headers: { Origin: "https://evil.example" } })).status).toBe(403);
    expect((await req("/api/votes", { method: "POST", body: JSON.stringify({ itemId: "inzending-999" }) })).status).toBe(404);
  });

  it("slaat geen IP-adressen op", async () => {
    await req("/api/votes", { method: "POST", body: JSON.stringify({ itemId: "schuurtje" }) });
    const dump = JSON.stringify(db.raw.prepare("SELECT * FROM votes").all()) + JSON.stringify(db.raw.prepare("SELECT * FROM rate_limits").all());
    expect(dump).not.toContain("203.0.113.7");
  });

  it("begrenst het aantal stemmen per uur", async () => {
    let last = 0;
    for (let i = 0; i < 41; i++) last = (await req("/api/votes", { method: "POST", body: JSON.stringify({ itemId: "schuurtje" }) })).status;
    expect(last).toBe(429);
  });
});

describe("ideeënloket", () => {
  it("bewaart een geldig idee als 'pending' en toont het niet publiek", async () => {
    const r = await req("/api/ideas", { method: "POST", body: idea() });
    expect(r.status).toBe(201);
    const pub = await (await req("/api/ideas")).json() as J;
    expect(pub.ideas).toHaveLength(0);
    const row = db.raw.prepare("SELECT status FROM ideas").get() as { status: string };
    expect(row.status).toBe("pending");
  });

  it("weigert links, e-mailadressen en te lange titels", async () => {
    expect((await req("/api/ideas", { method: "POST", body: idea({ title: "Kijk op https://spam.example" }) })).status).toBe(422);
    expect((await req("/api/ideas", { method: "POST", body: idea({ description: "mail me: a@b.nl" }) })).status).toBe(422);
    expect((await req("/api/ideas", { method: "POST", body: idea({ title: "x".repeat(81) }) })).status).toBe(422);
    expect((await req("/api/ideas", { method: "POST", body: idea({ category: "hack" }) })).status).toBe(422);
  });

  it("laat de honeypot stilletjes slagen zonder op te slaan", async () => {
    const r = await req("/api/ideas", { method: "POST", body: idea({ website: "http://bot" }) });
    expect(r.status).toBe(202);
    const r2 = await req("/api/ideas", { method: "POST", body: idea({ elapsedMs: 200 }) });
    expect(r2.status).toBe(202);
    expect((db.raw.prepare("SELECT COUNT(*) AS n FROM ideas").get() as { n: number }).n).toBe(0);
  });

  it("begrenst inzendingen tot 3 per uur", async () => {
    const codes = [];
    for (let i = 0; i < 4; i++) codes.push((await req("/api/ideas", { method: "POST", body: idea({ title: `Idee nummer ${i}` }) })).status);
    expect(codes).toEqual([201, 201, 201, 429]);
  });

  it("weigert te grote verzoeken en verkeerd content-type", async () => {
    expect((await req("/api/ideas", { method: "POST", body: idea({ description: "a ".repeat(3000) }) })).status).toBe(413);
    expect((await req("/api/ideas", { method: "POST", body: "titel=x", headers: { "Content-Type": "application/x-www-form-urlencoded" } })).status).toBe(415);
  });
});

describe("moderatie", () => {
  it("vereist een geldig token", async () => {
    expect((await req("/api/admin/ideas")).status).toBe(401);
    expect((await req("/api/admin/ideas", { headers: { Authorization: "Bearer fout" } })).status).toBe(401);
  });

  it("keurt goed, toont publiek en verwijdert inclusief stemmen", async () => {
    await req("/api/ideas", { method: "POST", body: idea() });
    const auth = { Authorization: `Bearer ${ADMIN}` };
    const list = await (await req("/api/admin/ideas?status=pending", { headers: auth })).json() as J;
    const id = list.ideas[0].id;
    expect((await req(`/api/admin/ideas/${id}`, { method: "POST", headers: auth, body: JSON.stringify({ action: "approve" }) })).status).toBe(200);
    const pub = await (await req("/api/ideas")).json() as J;
    expect(pub.ideas[0].title).toBe("Een paraplu voor binnen");
    expect((await req("/api/votes", { method: "POST", body: JSON.stringify({ itemId: `inzending-${id}` }) })).status).toBe(200);
    await req(`/api/admin/ideas/${id}`, { method: "POST", headers: auth, body: JSON.stringify({ action: "delete" }) });
    expect((await (await req("/api/ideas")).json() as J).ideas).toHaveLength(0);
    expect((db.raw.prepare("SELECT COUNT(*) AS n FROM votes").get() as { n: number }).n).toBe(0);
  });

  it("werkt niet zonder ingesteld token", async () => {
    env.ADMIN_TOKEN = undefined;
    expect((await req("/api/admin/ideas", { headers: { Authorization: "Bearer " } })).status).toBe(401);
  });
});

describe("router", () => {
  it("geeft 404 en 405 netjes als JSON", async () => {
    const r = await req("/api/onzin");
    expect(r.status).toBe(404);
    expect(r.headers.get("Content-Type")).toContain("application/json");
    expect((await req("/api/votes", { method: "DELETE" })).status).toBe(405);
  });
});
