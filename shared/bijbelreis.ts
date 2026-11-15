// De Bijbelreis staat op een eigen adres: https://bijbelreis.nl (Worker ‘bijbelreis’, worker/bijbelreis.ts).
//
// Zet BIJBELREIS_VERHUISD pas op true als bijbelreis.nl werkt. Vanaf dan toont martijndenbesten.com/bijbelreis de
// verhuispagina (public/bijbelreis-verhuisd.html), die de voortgang uit de browser meeneemt naar het nieuwe adres
// (public/bijbelreis/verhuis.js). Lokaal en in de tests (localhost) blijft de atlas op /bijbelreis staan.
export const BIJBELREIS_VERHUISD = false;
export const BIJBELREIS_OUD_PAD = /^\/bijbelreis(\.html|\/)?$/;
export const verwijstDoor = (hostname: string, pathname: string, actief: boolean = BIJBELREIS_VERHUISD): boolean =>
  actief && hostname === "martijndenbesten.com" && BIJBELREIS_OUD_PAD.test(pathname);
