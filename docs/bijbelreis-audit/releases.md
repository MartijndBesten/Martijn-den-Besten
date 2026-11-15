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
| Hoogeind: leger scherm, optiemenu sluit bij tik in beeld | 13-11-2026 | `f3342a4` (PR #16) | `90c3fcde-2c48-4de2-912b-b91e2b0f22de` | `c13d3017-76ba-4d9f-8ea6-765e5a62bc8e` | live `hoogeind/app.js` en `hoogeind.css` byte-gelijk aan `main`; `/hoogeind` 200 met `noindex, nofollow`; Playwright desktop + telefoon: model geladen, menu standaard dicht en sluit bij tik in beeld, `#bNieuw`, `#tIndeling` en `#bRoute` werken, 0 consolefouten; `/`, `/bijbelreis`, `/api/health` 200 |
| Losse reis Genesis 11:27–12:5 (`ur-kanaan`) | 15-11-2026 | `69bb487` (PR #19) | `ae62841f-b77e-4d03-b830-d7f2c92674e3` | `41d4104a-c842-48b0-b2d1-699e938a7cc9` | live-assets byte-gelijk aan de build (8 bestanden, o.a. `genesis.js`, `app.js`); `/api/health` 200; e2e tegen productie (nieuwe reis, Samen speuren, diepe link, stempels, Josafat): 18 geslaagd, 0 mislukt |
| Dertien nieuwe reizen, overzichten, losse kop met ‘Gemaakt door Denckh’; Worker `bijbelreis` voor bijbelreis.nl (doorverwijzing nog uit) | 15-11-2026 | `85e8371` (PR #20) | hoofdsite `54c76729-27ad-452b-b213-b4d501bc3785`; Worker `bijbelreis` `f8944af6-7ab3-4e89-aef9-6d28ca382f30` (voorlopig op workers.dev) | hoofdsite `ae62841f-b77e-4d03-b830-d7f2c92674e3`; `bijbelreis`: eerste versie | hoofdsite: 12 bestanden byte-gelijk aan de build, `/api/health` 200, sitemap zonder `/bijbelreis`, e2e tegen productie (Bijbelreis + navigatie): 183 geslaagd, 0 mislukt, 2 overgeslagen. Worker `bijbelreis`: 8 bestanden byte-gelijk, `/bijbelreis` → `/` (301), `/hoogeind` en `/api/health` 404 |
| Losse reis Deuteronomium 30:11–20 (`kies-het-leven`) | 15-11-2026 | `57456fe` (PR #21) | hoofdsite `80a48b82-080f-491f-bb45-55bff711e5e2`; Worker `bijbelreis` `0e8bf84c-8dca-46c3-887d-bee7eec328af` | hoofdsite `54c76729-27ad-452b-b213-b4d501bc3785`; `bijbelreis` `f8944af6-7ab3-4e89-aef9-6d28ca382f30` | beide adressen: `numeri.js`, `dateringen.js` en `app.js` byte-gelijk aan de build; `/api/health` 200; e2e tegen productie (nieuwe reis, Ur–Kanaän, nieuwe delen, diepe link, stempels, makersvermelding): 21 geslaagd, 0 mislukt. Eerder op 15-11: volledige Bijbelreis-suite tegen de Worker `bijbelreis` op workers.dev: 160 geslaagd, 0 mislukt, 2 overgeslagen |
