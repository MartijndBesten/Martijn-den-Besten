// Variant van de Worker die de site zelf serveert in plaats van via Workers Static Assets.
// Gedrag (routes, 404, headers, caching) is gelijk aan de Static Assets-configuratie.

import { handleApi, korteLink, type Env } from "./index";
import { geplandOnderhoud } from "./strooizout-beheer";
import { strooizoutDomein } from "./strooizout-domein";
import { metProductGegevens } from "./strooizout-seo";
import { FILES, HEADER_RULES } from "./generated/files";
import { verwijstDoor } from "../shared/bijbelreis";
import { leesBereik } from "./bereik";

const decoded = new Map<string, Uint8Array>();

function body(path: string): Uint8Array {
  let b = decoded.get(path);
  if (!b) {
    const bin = atob(FILES[path][2]);
    b = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    decoded.set(path, b);
  }
  return b;
}

function matches(pattern: string, path: string): boolean {
  if (pattern.endsWith("*")) return path.startsWith(pattern.slice(0, -1));
  return pattern === path;
}

function resolve(pathname: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (path === "/") return "/index.html";
  if (FILES[path] && !path.endsWith(".html")) return path;
  const clean = path.replace(/\/+$/, "").replace(/\.html$/, "");
  if (clean !== "/index" && FILES[`${clean}.html`]) return `${clean}.html`;
  return null;
}

function serve(request: Request, file: string, status = 200): Response {
  const [type, etag] = FILES[file];
  const headers = new Headers({ "Content-Type": type, ETag: `"${etag}"`, "Cache-Control": "public, max-age=0, must-revalidate" });
  const urlPath = new URL(request.url).pathname;
  for (const rule of HEADER_RULES) {
    if (matches(rule.pattern, urlPath)) for (const [k, v] of Object.entries(rule.headers)) headers.set(k, v);
  }
  if (status === 200 && request.headers.get("If-None-Match") === `"${etag}"`) return new Response(null, { status: 304, headers });
  // Deelverzoeken, nodig om video op een iPhone af te spelen (zie bereik.ts).
  if (status === 200 && !file.endsWith(".html")) {
    headers.set("Accept-Ranges", "bytes");
    const alles = body(file);
    const bereik = leesBereik(request.headers.get("Range"), alles.length);
    if (bereik === "ongeldig") {
      headers.set("Content-Range", `bytes */${alles.length}`);
      return new Response(null, { status: 416, headers });
    }
    if (bereik) {
      headers.set("Content-Range", `bytes ${bereik.van}-${bereik.tot}/${alles.length}`);
      headers.set("Content-Length", String(bereik.tot - bereik.van + 1));
      return new Response(request.method === "HEAD" ? null : alles.subarray(bereik.van, bereik.tot + 1), { status: 206, headers });
    }
  }
  return new Response(request.method === "HEAD" ? null : body(file), { status, headers });
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    // De zone-instelling 'Always Use HTTPS' staat niet aan; daarom hier zelf doorverwijzen.
    if (url.protocol === "http:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    const domein = strooizoutDomein(url, env.STROOIZOUT_DOORVERWIJZEN === "ja");
    if (domein && "antwoord" in domein) return domein.antwoord;
    if (domein && "pad" in domein && (request.method === "GET" || request.method === "HEAD")) {
      const bestand = resolve(domein.pad);
      if (bestand) return domein.pad === "/strooizout" && request.method === "GET" ? metProductGegevens(serve(request, bestand), env) : serve(request, bestand);
    }
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, ctx);
    const kort = korteLink(url);
    if (kort) return kort;
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Methode niet toegestaan", { status: 405, headers: { Allow: "GET, HEAD" } });

    // De Bijbelreis heeft een eigen adres (shared/bijbelreis.ts): het oude pad toont de verhuispagina.
    if (verwijstDoor(url.hostname, url.pathname)) return serve(request, "/bijbelreis-verhuisd.html");

    // Gelijk aan html_handling "auto-trailing-slash": /pagina.html en /pagina/ worden /pagina.
    if (url.pathname !== "/" && (url.pathname.endsWith(".html") || url.pathname.endsWith("/"))) {
      const target = url.pathname.replace(/\/+$/, "").replace(/\.html$/, "").replace(/^\/index$/, "/") || "/";
      if (target !== url.pathname && resolve(target)) return Response.redirect(new URL(target + url.search, url).toString(), 307);
    }

    const file = resolve(url.pathname);
    if (file) return serve(request, file);
    return serve(request, "/404.html", 404);
  },
  async scheduled(_event, env, ctx): Promise<void> {
    ctx.waitUntil(geplandOnderhoud(env));
  },
} satisfies ExportedHandler<Env>;
