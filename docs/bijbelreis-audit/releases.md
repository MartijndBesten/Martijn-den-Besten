# Bijbelreis: releases en herstelpunten

Deploy: embedded Worker vanaf `origin/main`:

```
npm run build && node scripts/embed-assets.mjs && npx wrangler deploy -c wrangler.embedded.jsonc
```

Terugdraaien naar het vorige herstelpunt:

```
npx wrangler rollback <versie-id> -c wrangler.embedded.jsonc
```

Dat zet alleen de code terug. De voortgang van gebruikers staat in hun eigen browser (localStorage) en verandert daardoor niet.

| Versie | Datum | Commit op `main` | Worker-versie | Herstelpunt (vorige versie) | Controle na publicatie |
|---|---|---|---|---|---|
| 3.0 + afronding | 25-10-2026 | `6a3bc77` | `d5b8af16-ca11-466e-b060-5da3fe5de375` | zie OPLEVERING-3.md | zie OPLEVERING-3.md |
| 3.1 ontdekkingsatlas | 26-10-2026 | `960c31b` (PR #7) | `177476eb-5e8c-42b4-9739-565f2eb9ce5a` | `d5b8af16-ca11-466e-b060-5da3fe5de375` | live-assets byte-gelijk aan de build; `/api/health` 200; e2e tegen productie: 106 geslaagd, 2 overgeslagen, 0 mislukt |
| 3.1 + 2 Kronieken 20 (Josafat) | 04-11-2026 | `d86e003` (PR #8) | `3a428225-59ba-4280-967d-4c067d7fce10` | `177476eb-5e8c-42b4-9739-565f2eb9ce5a` | live-assets byte-gelijk aan de build; `/api/health` 200; e2e tegen productie (2 Kronieken 20, diepe link, stempels, verhalen): 12 geslaagd, 0 mislukt |
| 4.0 reisniveaus | 04-11-2026 | `a1b9896` (PR #9) | `5f10d02c-0a4b-413e-b467-8637d1523c2c` | `3a428225-59ba-4280-967d-4c067d7fce10` | live-assets byte-gelijk aan de build (o.a. niveaus/a, b, c); `/api/health` 200; oude Bijbeltekst niet meer bereikbaar (404, zoals bedoeld); volledige e2e Bijbelreis tegen productie: 139 geslaagd, 0 mislukt, 2 overgeslagen |
| Hoogeind 30 (`/hoogeind`, geen Bijbelreis-wijziging) | 13-11-2026 | `d65c210` (PR #11) + fix `scripts/embed-assets.mjs` (`.jpg` en ontbrekende map `worker/generated`) | `c263d074-a12f-440a-8a5f-5c312ff56f69` | `5f10d02c-0a4b-413e-b467-8637d1523c2c` | `/hoogeind` 200 met `X-Robots-Tag: noindex, nofollow`; `luchtfoto.jpg` 200 `image/jpeg`; Playwright desktop + telefoon: 3D-canvas geladen, `#bNieuw` werkt, 0 consolefouten; `/`, `/bijbelreis`, `/api/health` 200 |
| Hoogeind: woning volgens Vilaro-plattegrond, namen standaard uit | 13-11-2026 | `0dfbb20` (PR #13) + fix `scripts/embed-assets.mjs` (PR #12) | `f86466ae-b6aa-4827-8760-fed9caa96b9d` | `c263d074-a12f-440a-8a5f-5c312ff56f69` | live `hoogeind/app.js` byte-gelijk aan `main`; `/hoogeind` 200 met `noindex, nofollow`; Playwright desktop + telefoon: model geladen, namen standaard uit, `#bNieuw` werkt, 0 consolefouten; `/`, `/bijbelreis`, `/api/health` 200 |
| Hoogeind: indeling, rondlopen, voorgevel, buitendetaillering | 13-11-2026 | `2cb2f30` (PR #14) | `c13d3017-76ba-4d9f-8ea6-765e5a62bc8e` | `f86466ae-b6aa-4827-8760-fed9caa96b9d` | live `hoogeind/app.js` en `hoogeind.css` byte-gelijk aan `main`; `/hoogeind` 200 met `noindex, nofollow`; Playwright desktop + telefoon: model geladen, `#bNieuw`, `#tIndeling` en `#bRoute` werken, 0 consolefouten; `/`, `/bijbelreis`, `/api/health` 200 |
