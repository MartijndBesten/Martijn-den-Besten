// Variant van de Worker die de site zelf serveert in plaats van via Workers Static Assets.
// Gedrag (routes, 404, headers, caching) is gelijk aan de Static Assets-configuratie.

import { handleApi, type Env } from "./index";
import { FILES, HEADER_RULES } from "./generated/files";

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
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, ctx);
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Methode niet toegestaan", { status: 405, headers: { Allow: "GET, HEAD" } });

    // Gelijk aan html_handling "auto-trailing-slash": /pagina.html en /pagina/ worden /pagina.
    if (url.pathname !== "/" && (url.pathname.endsWith(".html") || url.pathname.endsWith("/"))) {
      const target = url.pathname.replace(/\/+$/, "").replace(/\.html$/, "").replace(/^\/index$/, "/") || "/";
      if (target !== url.pathname && resolve(target)) return Response.redirect(new URL(target + url.search, url).toString(), 307);
    }

    const file = resolve(url.pathname);
    if (file) return serve(request, file);
    return serve(request, "/404.html", 404);
  },
} satisfies ExportedHandler<Env>;
