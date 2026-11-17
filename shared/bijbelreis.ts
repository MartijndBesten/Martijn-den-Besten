// De Bijbelreis staat op een eigen adres: https://bijbelreis.nl (Worker ‘bijbelreis’, worker/bijbelreis.ts).
//
// Zet BIJBELREIS_VERHUISD pas op true als bijbelreis.nl werkt. Vanaf dan toont martijndenbesten.com/bijbelreis de
// verhuispagina (public/bijbelreis-verhuisd.html), die de voortgang uit de browser meeneemt naar het nieuwe adres
// (public/bijbelreis/verhuis.js). Lokaal en in de tests (localhost) blijft de atlas op /bijbelreis staan.
export const BIJBELREIS_VERHUISD = true; // aan sinds 15-11-2026: bijbelreis.nl werkt
export const BIJBELREIS_OUD_PAD = /^\/bijbelreis(\.html|\/)?$/;
export const verwijstDoor = (hostname: string, pathname: string, actief: boolean = BIJBELREIS_VERHUISD): boolean =>
  actief && hostname === "martijndenbesten.com" && BIJBELREIS_OUD_PAD.test(pathname);

// Pagina's onder /bijbelreis/ zonder .html in het adres (/bijbelreis/boekje), zoals de hoofdsite dat doet met
// html_handling "auto-trailing-slash": /bijbelreis/boekje.html en /bijbelreis/boekje/ verwijzen door naar /bijbelreis/boekje.
// bestaat(pad) zegt of er een bestand op dat pad staat. Geeft het bestand om te serveren, een doorverwijzing of niets.
export function bijbelreisPagina(pad: string, bestaat: (bestand: string) => boolean): { bestand: string } | { naar: string } | null {
  if (!pad.startsWith("/bijbelreis/")) return null;
  const kaal = pad.replace(/\/+$/, "").replace(/\.html$/, "");
  if (kaal === "/bijbelreis" || !/^\/bijbelreis\/[\w-]+(\/[\w-]+)*$/.test(kaal) || !bestaat(kaal + ".html")) return null;
  return kaal === pad ? { bestand: kaal + ".html" } : { naar: kaal };
}

// Talen (docs/bijbelreis-talen/README.md). Nederlands staat op ‘/’; elke andere taal op een eigen pad (/en/). Een taal
// met openbaar: false is een proef: de pagina's hebben noindex, staan niet in de sitemap, de Nederlandse site linkt er
// niet naar (geen taalkeuze, geen hreflang) en de Nederlandse pagina blijft byte voor byte zoals hij was. Alleen
// bereikbaar via het adres zelf. Zet openbaar pas op true na akkoord van Martijn: dit is de enige plek.
export const BIJBELREIS_TALEN: Record<string, { naam: string; openbaar: boolean }> = {
  en: { naam: "English", openbaar: false }, // proef sinds 17-11-2026: 10 geschiedenissen, status ‘concept’
};
