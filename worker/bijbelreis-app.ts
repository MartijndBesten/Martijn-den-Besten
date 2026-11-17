// De Bijbelreis-worker zelf, los van de ingebedde bestanden (worker/bijbelreis.ts geeft die mee). Zo is hij te testen
// zonder eerst te bouwen (tests/bijbelreis-boekje.test.ts).
import { bijbelreisPagina } from "../shared/bijbelreis";
import { meldBezoek, type BezoekEnv } from "./bezoek";
import { meldAanvraag, type AanvraagEnv, type Diensten } from "./aanvraag";

export type Bestanden = Record<string, [type: string, etag: string, base64: string]>;
export type Kopregels = { pattern: string; headers: Record<string, string> }[];

export function maakBijbelreisWorker(FILES: Bestanden, HEADER_RULES: Kopregels, diensten: Diensten = {}): ExportedHandler<BezoekEnv & AanvraagEnv> {
  const ORIGIN = "https://bijbelreis.nl";
  const START = "/bijbelreis.html";
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

  function headersFor(urlPath: string, base: Record<string, string>): Headers {
    const headers = new Headers(base);
    for (const rule of HEADER_RULES) {
      if (matches(rule.pattern, urlPath)) for (const [k, v] of Object.entries(rule.headers)) headers.set(k, v);
    }
    return headers;
  }

  function serve(request: Request, urlPath: string, file: string): Response {
    const [type, etag] = FILES[file];
    const headers = headersFor(urlPath, { "Content-Type": type, ETag: `"${etag}"`, "Cache-Control": "public, max-age=0, must-revalidate" });
    if (request.headers.get("If-None-Match") === `"${etag}"`) return new Response(null, { status: 304, headers });
    return new Response(request.method === "HEAD" ? null : body(file), { headers });
  }

  function text(request: Request, urlPath: string, content: string, type: string, status = 200): Response {
    const headers = headersFor(urlPath, { "Content-Type": type, "Cache-Control": "public, max-age=3600" });
    return new Response(request.method === "HEAD" ? null : content, { status, headers });
  }

  // Geschiedenispagina's voor zoekmachines (scripts/bijbelreis-verhalen.mjs): in de build onder /bijbelreis/verhaal/,
  // op bijbelreis.nl op /verhaal/<nr>-<slug>. Opzoeken op nummer, zodat een oud adres (andere titel) blijft werken.
  const VERHALEN = new Map<number, string>();
  for (const p of Object.keys(FILES)) {
    const m = /^\/bijbelreis\/verhaal\/((\d+)-[a-z0-9-]+)\.html$/.exec(p);
    if (m) VERHALEN.set(+m[2], m[1]);
  }
  const OVERZICHT = "/bijbelreis/verhalen.html";
  // Losse tekstpagina's op een kort adres (App Store: privacybeleid en support-URL). In de build staan ze onder /bijbelreis/.
  const LOS = ["privacy", "hulp"].filter((n) => FILES[`/bijbelreis/${n}.html`]);
  const sitemap = () =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    ["/", ...(FILES[OVERZICHT] ? ["/verhalen"] : []), ...(FILES["/bijbelreis/lessen.html"] ? ["/bijbelreis/lessen"] : []), ...LOS.map((n) => `/${n}`), ...[...VERHALEN.keys()].sort((a, b) => a - b).map((nr) => `/verhaal/${VERHALEN.get(nr)}`)]
      .map((p) => `  <url><loc>${ORIGIN}${p}</loc></url>\n`)
      .join("") +
    `</urlset>\n`;

  const NIET_GEVONDEN = `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Niet gevonden — Bijbelreis</title><meta name="robots" content="noindex"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f0e5;color:#1f2a44;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:30rem;padding:2rem 1.5rem;text-align:center}h1{font-size:1.5rem;margin:0 0 .75rem}a{color:#243d70;font-weight:600}</style></head><body><main><h1>Deze pagina bestaat niet</h1><p><a href="/">Naar de Bijbelreis</a></p></main></body></html>`;

  return {
    async fetch(request, env, ctx): Promise<Response> {
      const url = new URL(request.url);
      const lokaal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if (url.protocol === "http:" && !lokaal) {
        url.protocol = "https:";
        return Response.redirect(url.toString(), 301);
      }
      if (url.hostname === "www.bijbelreis.nl") return Response.redirect(ORIGIN + url.pathname + url.search, 301);
      // Bezoekmeting (worker/bezoek.ts). Antwoordt altijd 204 zonder inhoud.
      if (url.pathname === "/api/bezoek") {
        if (request.method !== "POST") return new Response("Methode niet toegestaan", { status: 405, headers: { Allow: "POST" } });
        return meldBezoek(request, env ?? {}, ctx, Math.floor(Date.now() / 1000));
      }
      // Aanvragen van bezoekers (worker/aanvraag.ts): ‘Mis je iets? Vraag het aan.’ Antwoordt met JSON.
      if (url.pathname === "/api/aanvraag") return meldAanvraag(request, env ?? {}, ctx, Math.floor(Date.now() / 1000), diensten);
      if (request.method !== "GET" && request.method !== "HEAD") return new Response("Methode niet toegestaan", { status: 405, headers: { Allow: "GET, HEAD" } });

      let path: string;
      try {
        path = decodeURIComponent(url.pathname);
      } catch {
        return text(request, url.pathname, NIET_GEVONDEN, "text/html; charset=utf-8", 404);
      }
      if (path === "/") return serve(request, "/", START);
      // Het oude pad (martijndenbesten.com/bijbelreis) blijft werken: het fragment (#deel/stap) blijft bij een doorverwijzing staan.
      if (/^\/(bijbelreis(\.html|\/)?|index\.html)$/.test(path)) return Response.redirect(new URL("/" + url.search, url).toString(), 301);
      if (path === "/robots.txt") return text(request, path, `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`, "text/plain; charset=utf-8");
      if (path === "/sitemap.xml") return text(request, path, sitemap(), "application/xml; charset=utf-8");
      // Geschiedenissen als gewone pagina: /verhalen (overzicht) en /verhaal/<nr>-<slug>. Een ander of oud slug, een
      // slash erachter of het pad in de build (/bijbelreis/verhaal/…) verwijst door naar het ene vaste adres.
      if (/^\/(bijbelreis\/)?verhalen(\.html|\/)?$/.test(path) && FILES[OVERZICHT]) {
        if (path === "/verhalen") return serve(request, path, OVERZICHT);
        return Response.redirect(new URL("/verhalen" + url.search, url).toString(), 301);
      }
      const vm = /^\/(bijbelreis\/)?verhaal\/(\d+)(-[^/]*)?\/?$/.exec(path);
      if (vm && VERHALEN.has(+vm[2])) {
        const juist = "/verhaal/" + VERHALEN.get(+vm[2]);
        if (path === juist) return serve(request, path, `/bijbelreis${juist}.html`);
        return Response.redirect(new URL(juist + url.search, url).toString(), 301);
      }
      // Privacy en hulp: /privacy en /hulp. Het pad in de build (/bijbelreis/privacy, ook met .html of een slash) verwijst
      // daarheen; zo werken de links in de atlas zowel lokaal (/bijbelreis/privacy) als op bijbelreis.nl.
      const lm = /^\/(bijbelreis\/)?(privacy|hulp)(\.html|\/)?$/.exec(path);
      if (lm && LOS.includes(lm[2])) {
        if (path === `/${lm[2]}`) return serve(request, path, `/bijbelreis/${lm[2]}.html`);
        return Response.redirect(new URL(`/${lm[2]}` + url.search, url).toString(), 301);
      }
      if (path === "/favicon.ico") return Response.redirect(new URL("/bijbelreis/favicon.svg", url).toString(), 302);
      // Presentatie en boekje: /bijbelreis/boekje (zonder .html); /bijbelreis/boekje.html verwijst daarheen, het fragment
      // (#jakob, #v26) blijft daarbij staan.
      const pagina = bijbelreisPagina(path, (p) => !!FILES[p]);
      if (pagina && "naar" in pagina) return Response.redirect(new URL(pagina.naar + url.search, url).toString(), 301);
      if (pagina) return serve(request, path, pagina.bestand);
      if ((path.startsWith("/bijbelreis/") || path.startsWith("/fonts/")) && FILES[path]) return serve(request, path, path);
      // De service worker (installeerbare app, docs/bijbelreis-pwa/README.md) staat in de root, zodat hij de atlas op ‘/’
      // mag bedienen. Hij valt onder geen enkele cacheregel: max-age=0, must-revalidate, dus een nieuwe versie komt meteen.
      if (path === "/bijbelreis-sw.js" && FILES[path]) return serve(request, path, path);
      return text(request, path, NIET_GEVONDEN, "text/html; charset=utf-8", 404);
    },
  };
}
