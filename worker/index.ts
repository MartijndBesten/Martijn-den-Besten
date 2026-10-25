// API van het Instituut Martijn den Besten.
// Alleen /api/* komt hier binnen; al het andere wordt direct als statisch bestand geserveerd.

import { isVotableId } from "../shared/museum";
import { validateIdea, LIMITS } from "../shared/validation";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ADMIN_TOKEN?: string;
  HASH_SECRET?: string;
}

const MAX_BODY_BYTES = 4096;
const HOUR = 3600;
const DAY = 86400;

const API_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...API_HEADERS, ...extra } });
}

function error(message: string, status: number, extra: Record<string, string> = {}): Response {
  return json({ ok: false, error: message }, status, extra);
}

const encoder = new TextEncoder();

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

function today(now: number): string {
  return new Date(now * 1000).toISOString().slice(0, 10);
}

/** Pseudonieme, per dag wisselende bezoekers-ID. Het IP-adres zelf wordt nergens opgeslagen. */
async function visitorHash(request: Request, env: Env, now: number): Promise<string> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "onbekend";
  return hmac(env.HASH_SECRET || "lokale-ontwikkelsleutel", `${ip}|${today(now)}`);
}

/** Vast-venster rate limit in D1. Geeft true terug als het verzoek mag. */
export async function rateLimit(db: D1Database, bucket: string, visitor: string, limit: number, windowSeconds: number, now: number): Promise<boolean> {
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  const key = `${bucket}:${visitor}:${windowStart}`;
  const row = await db
    .prepare(
      "INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count",
    )
    .bind(key, windowStart)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= limit;
}

async function cleanup(db: D1Database, now: number): Promise<void> {
  await db.prepare("DELETE FROM rate_limits WHERE window_start < ?1").bind(now - 2 * DAY).run();
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function readJson(request: Request): Promise<unknown | Response> {
  if (!(request.headers.get("Content-Type") ?? "").toLowerCase().startsWith("application/json")) {
    return error("Alleen JSON wordt aan het loket aangenomen.", 415);
  }
  const length = Number(request.headers.get("Content-Length") ?? "0");
  if (length > MAX_BODY_BYTES) return error("Dit idee is te groot voor het loket.", 413);
  const text = await request.text();
  if (encoder.encode(text).length > MAX_BODY_BYTES) return error("Dit idee is te groot voor het loket.", 413);
  try {
    return JSON.parse(text);
  } catch {
    return error("Het formulier was onleesbaar.", 400);
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function isAdmin(request: Request, env: Env): boolean {
  const token = env.ADMIN_TOKEN;
  if (!token || token.length < 24) return false;
  const header = request.headers.get("Authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  return timingSafeEqual(header.slice(7), token);
}

// ---------- Stemmen ----------

async function getVotes(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT item_id, COUNT(*) AS n FROM votes GROUP BY item_id").all<{ item_id: string; n: number }>();
  const counts: Record<string, number> = {};
  for (const r of results) counts[r.item_id] = r.n;
  return json({ ok: true, counts }, 200, { "Cache-Control": "public, max-age=15" });
}

const VOTER_CODE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

async function postVote(request: Request, env: Env, ctx: ExecutionContext, now: number): Promise<Response> {
  if (!sameOrigin(request)) return error("Stemmen kan alleen via de website.", 403);
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const itemId = (body as { itemId?: unknown })?.itemId;
  if (typeof itemId !== "string" || !isVotableId(itemId)) return error("Op dit object kan niet gestemd worden.", 400);

  if (itemId.startsWith("inzending-")) {
    const id = Number(itemId.slice("inzending-".length));
    const exists = await env.DB.prepare("SELECT 1 FROM ideas WHERE id = ?1 AND status = 'approved'").bind(id).first();
    if (!exists) return error("Deze inzending bestaat niet (of nog niet).", 404);
  }

  const visitor = await visitorHash(request, env, now);
  if (!(await rateLimit(env.DB, "vote", visitor, 40, HOUR, now))) {
    return error("U heeft wel heel enthousiast gestemd. Probeer het over een uur opnieuw.", 429, { "Retry-After": "3600" });
  }

  // Eén stem per bezoeker per object per dag. De browser stuurt een willekeurige, anonieme code mee;
  // die wordt per dag gehasht. Zonder code valt de telling terug op het (gehashte) IP-adres.
  // Zo tellen bezoekers achter een gedeeld IP-adres apart, en wisselende IP-adressen niet dubbel.
  const voterCode = (body as { voter?: unknown })?.voter;
  const voter =
    typeof voterCode === "string" && VOTER_CODE.test(voterCode) ? await hmac(env.HASH_SECRET || "lokale-ontwikkelsleutel", `stemmer|${voterCode}|${today(now)}`) : visitor;

  const result = await env.DB.prepare("INSERT OR IGNORE INTO votes (item_id, voter_hash, day, created_at) VALUES (?1, ?2, ?3, ?4)")
    .bind(itemId, voter, today(now), now)
    .run();
  const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM votes WHERE item_id = ?1").bind(itemId).first<{ n: number }>();
  if (Math.random() < 0.05) ctx.waitUntil(cleanup(env.DB, now));
  return json({ ok: true, count: row?.n ?? 0, counted: (result.meta.changes ?? 0) > 0 });
}

// ---------- Ideeën ----------

async function getIdeas(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT id, title, description, category, created_at FROM ideas WHERE status = 'approved' ORDER BY created_at DESC LIMIT 60",
  ).all();
  return json({ ok: true, ideas: results }, 200, { "Cache-Control": "public, max-age=30" });
}

async function postIdea(request: Request, env: Env, ctx: ExecutionContext, now: number): Promise<Response> {
  if (!sameOrigin(request)) return error("Ideeën kunnen alleen via het loket op de website worden ingediend.", 403);
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const data = (body ?? {}) as Record<string, unknown>;

  // Honeypot en invultijd: bots vullen alles in en hebben haast.
  const looksLikeBot =
    (typeof data.website === "string" && data.website.trim() !== "") ||
    typeof data.elapsedMs !== "number" ||
    data.elapsedMs < LIMITS.minFillMs;
  if (looksLikeBot) {
    // Doe alsof het gelukt is, zodat bots niets leren.
    return json({ ok: true, ticket: Math.floor(10000 + Math.random() * 89999), message: "Uw idee is ontvangen." }, 202);
  }

  const result = validateIdea(data);
  if (!result.ok) return error(result.error, 422);
  const { title, description, category } = result.value;

  const visitor = await visitorHash(request, env, now);
  const perHour = await rateLimit(env.DB, "idea-h", visitor, 3, HOUR, now);
  const perDay = perHour && (await rateLimit(env.DB, "idea-d", visitor, 8, DAY, now));
  if (!perHour || !perDay) {
    return error("Het loket heeft genoeg ideeën van u ontvangen voor nu. Probeer het later opnieuw.", 429, { "Retry-After": "3600" });
  }

  const pending = await env.DB.prepare("SELECT COUNT(*) AS n FROM ideas WHERE status = 'pending'").first<{ n: number }>();
  if ((pending?.n ?? 0) >= 500) return error("De wachtrij van het loket is vol. De directie is achter met lezen.", 503);

  const row = await env.DB.prepare(
    "INSERT INTO ideas (title, description, category, status, created_at) VALUES (?1, ?2, ?3, 'pending', ?4) RETURNING id",
  )
    .bind(title, description, category, now)
    .first<{ id: number }>();
  if (Math.random() < 0.1) ctx.waitUntil(cleanup(env.DB, now));
  return json({ ok: true, ticket: 10000 + (row?.id ?? 0), message: "Uw idee is ontvangen en wacht op beoordeling door de directie." }, 201);
}

// ---------- Beheer ----------

async function adminList(request: Request, env: Env): Promise<Response> {
  const status = new URL(request.url).searchParams.get("status") ?? "pending";
  if (!["pending", "approved", "rejected"].includes(status)) return error("Onbekende status.", 400);
  const { results } = await env.DB.prepare(
    "SELECT id, title, description, category, status, created_at, moderated_at FROM ideas WHERE status = ?1 ORDER BY created_at DESC LIMIT 200",
  )
    .bind(status)
    .all();
  return json({ ok: true, ideas: results });
}

async function adminModerate(request: Request, env: Env, id: number, now: number): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const action = (body as { action?: unknown })?.action;
  if (action === "delete") {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM ideas WHERE id = ?1").bind(id),
      env.DB.prepare("DELETE FROM votes WHERE item_id = ?1").bind(`inzending-${id}`),
    ]);
    return json({ ok: true });
  }
  if (action !== "approve" && action !== "reject") return error("Onbekende actie.", 400);
  const status = action === "approve" ? "approved" : "rejected";
  const res = await env.DB.prepare("UPDATE ideas SET status = ?1, moderated_at = ?2 WHERE id = ?3").bind(status, now, id).run();
  if ((res.meta.changes ?? 0) === 0) return error("Inzending niet gevonden.", 404);
  return json({ ok: true });
}

// ---------- Router ----------

export async function handleApi(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method.toUpperCase();
  const now = Math.floor(Date.now() / 1000);

  // Let op: overal `return await`, anders vangt de catch hieronder geen databasefouten op.
  try {
    if (path === "/api/health" && method === "GET") return json({ ok: true, status: "Het instituut is open." });
    if (path === "/api/votes" && method === "GET") return await getVotes(env);
    if (path === "/api/votes" && method === "POST") return await postVote(request, env, ctx, now);
    if (path === "/api/ideas" && method === "GET") return await getIdeas(env);
    if (path === "/api/ideas" && method === "POST") return await postIdea(request, env, ctx, now);

    if (path.startsWith("/api/admin/")) {
      if (!isAdmin(request, env)) return error("Geen toegang tot de directiekamer.", 401, { "WWW-Authenticate": "Bearer" });
      if (path === "/api/admin/ideas" && method === "GET") return await adminList(request, env);
      const match = path.match(/^\/api\/admin\/ideas\/(\d{1,9})$/);
      if (match && method === "POST") return await adminModerate(request, env, Number(match[1]), now);
    }
    if (["/api/votes", "/api/ideas", "/api/health"].includes(path)) return error("Methode niet toegestaan.", 405, { Allow: "GET, POST" });
    return error("Deze afdeling bestaat niet.", 404);
  } catch (err) {
    console.error("API-fout", err);
    return error("Er ging iets mis in de machinekamer.", 500);
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
