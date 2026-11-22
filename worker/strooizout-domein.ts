// Strooizout voor de buurt op een eigen domein (strooizouthouten.nl) in dezelfde Worker.
// Op het eigen domein heeft de webshop korte adressen (/ , /beheer, /aan-de-weg …); intern blijven de bestanden onder
// /strooizout staan. www verwijst door naar het hoofddomein. Op martijndenbesten.com blijft /strooizout werken; met
// STROOIZOUT_DOORVERWIJZEN = "ja" gaat het oude adres permanent naar het eigen domein (pas aanzetten als dat domein werkt).

export const STROOIZOUT_DOMEIN = "strooizouthouten.nl";
const PAGINAS = new Set(["bestellen", "bestelling", "privacy", "voorwaarden", "flyer", "beheer", "aan-de-weg"]);

export type DomeinUitkomst = { antwoord: Response } | { pad: string } | null;

const doorverwijzing = (doel: string, status = 301) => new Response(null, { status, headers: { Location: doel, "Cache-Control": "public, max-age=3600" } });

const tekst = (inhoud: string, type: string) => new Response(inhoud, { headers: { "Content-Type": `${type}; charset=utf-8`, "Cache-Control": "public, max-age=3600" } });
const ROBOTS = `User-agent: *\nAllow: /\nDisallow: /beheer\nDisallow: /bestelling\nDisallow: /api/\n\nSitemap: https://${STROOIZOUT_DOMEIN}/sitemap.xml\n`;
const sitemap = () =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["/", "/voorwaarden", "/privacy"]
    .map((p) => `  <url><loc>https://${STROOIZOUT_DOMEIN}${p}</loc></url>`)
    .join("\n")}\n</urlset>\n`;

/**
 * Bepaalt wat er met een verzoek moet gebeuren voor de Strooizout-domeinen.
 * - `{ antwoord }`: een doorverwijzing;
 * - `{ pad }`: serveer dit (interne) pad;
 * - `null`: niets bijzonders, gewone afhandeling.
 */
export function strooizoutDomein(url: URL, doorverwijzen: boolean): DomeinUitkomst {
  const host = url.hostname.toLowerCase();
  if (host === `www.${STROOIZOUT_DOMEIN}`) return { antwoord: doorverwijzing(`https://${STROOIZOUT_DOMEIN}${url.pathname}${url.search}`) };

  if (host === STROOIZOUT_DOMEIN) {
    const p = url.pathname.replace(/\/+$/, "") || "/";
    if (p === "/") return { pad: "/strooizout" };
    const deel = p.slice(1).replace(/\.html$/, "");
    if (PAGINAS.has(deel)) return { pad: `/strooizout/${deel}` };
    // Oude, lange adressen op het eigen domein: naar de korte vorm.
    if (p === "/strooizout") return { antwoord: doorverwijzing(`/${url.search}`) };
    const lang = p.match(/^\/strooizout\/([a-z-]+)$/);
    if (lang && PAGINAS.has(lang[1])) return { antwoord: doorverwijzing(`/${lang[1]}${url.search}`) };
    if (p === "/robots.txt") return { antwoord: tekst(ROBOTS, "text/plain") };
    if (p === "/sitemap.xml") return { antwoord: tekst(sitemap(), "application/xml") };
    if (p === "/favicon.ico") return { antwoord: doorverwijzing("/strooizout/icoon.svg") };
    // Bestanden die de webshop gebruikt, en de API.
    if (/^\/(api|assets|fonts|strooizout)\//.test(p) || p === "/bijbelreis/denckh-logo-signature.svg" || p === "/zout") return null;
    // Al het andere (de rest van martijndenbesten.com) hoort niet bij dit domein.
    return { antwoord: doorverwijzing("/", 302) };
  }

  if (doorverwijzen && (url.pathname === "/strooizout" || url.pathname.startsWith("/strooizout/") || url.pathname.replace(/\/+$/, "").toLowerCase() === "/zout")) {
    const p = url.pathname.replace(/\/+$/, "");
    const rest = p === "/strooizout" || p.toLowerCase() === "/zout" ? "/" : p.slice("/strooizout".length);
    // Alleen pagina's verwijzen; bestanden (afbeeldingen, pdf) blijven ook op het oude adres bereikbaar.
    if (rest === "/" || PAGINAS.has(rest.slice(1))) return { antwoord: doorverwijzing(`https://${STROOIZOUT_DOMEIN}${rest}${url.search}`) };
  }
  return null;
}
