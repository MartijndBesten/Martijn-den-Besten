# martijndenbesten.com

> **Martijn den Besten.** Officiële website van een man met meer ideeën dan tijd.

Een speelse, kleurrijke website die drie concepten combineert:

1. **Het Hoofdkwartier** — een overdreven officiële homepage met een interactieve ideeënmachine, fictieve statistieken en 26 wisselende mededelingen.
2. **Het Martijn Control Center** — een bedieningsmachine met arcadeknop, sleutelknop, kussenknop, muntgleuf, draaiknop (0–10, en 11), serieuze modus, hendel, geheime schakelaars en een officiële noodstop.
3. **Het Museum van Onafgemaakte Ideeën** — zes zalen (waarvan één geheim), een rondleiding, een ideeëngenerator, echte stemmen en een gemodereerd ideeënloket.

Daarnaast: het Bureau voor Onnodige Innovatie, een certificaatgenerator (PNG/PDF), bezoekersmissies en 20 verborgen verrassingen.

**Live:** https://martijndenbesten.com

## Techniek in één oogopslag

| Onderdeel | Keuze |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite, eigen mini-router, CSS-animaties en inline SVG |
| Hosting | Cloudflare Workers met Static Assets (gratis plan) |
| API | Dezelfde Worker, alleen voor `/api/*` (`worker/index.ts`) |
| Opslag | Cloudflare D1 (`martijndenbesten`) voor stemmen, inzendingen en rate limiting |
| www | Aparte mini-Worker `martijndenbesten-www` die 301 doorverwijst naar het hoofddomein |
| Tests | Vitest (logica + API met echte SQL) en Playwright (e2e + axe-toegankelijkheid) |
| CI/CD | GitHub Actions: checks bij elke push, deploy naar Cloudflare op `main` |

Geen cookies, geen trackers, geen externe API's of CDN's. Lettertypen (Bricolage Grotesque, Instrument Sans, Space Mono; OFL) worden zelf gehost.

## Lokaal ontwikkelen

```bash
npm install
npm run build                 # bouwt naar dist/client
npm run db:migrate:local      # lokale D1-database
npx wrangler dev --local      # site + API op http://localhost:8787
```

Voor snelle frontend-iteratie: `npm run dev` (Vite op :5173, `/api` wordt doorgestuurd naar :8787).

Maak voor lokale beheerfuncties een `.dev.vars` (staat in `.gitignore`):

```
ADMIN_TOKEN=een-lang-willekeurig-token-van-minimaal-24-tekens
HASH_SECRET=nog-een-willekeurige-waarde
```

## Controles

```bash
npm run typecheck   # TypeScript (frontend + worker + tests)
npm test            # Vitest: generatoren, validatie, API, rate limits, moderatie
npm run test:e2e    # Playwright: alle pagina's, knoppen, museum, loket, a11y (start zelf een lokale Worker)
```

## Mappen

```
src/
  content/        ← alle teksten: mededelingen, statistieken, generatoren, missies (hier pas je inhoud aan)
  components/     ← header, footer, ideeënmachine, mededelingenbord, formulieren, verrassingen
  pages/          ← Home, ControlCenter, Museum, Over, Loket, Bureau, Certificaat, Einde, Beheer, NotFound
  state/          ← missies/verrassingen (localStorage) en stemtellers
  styles/         ← huisstijl (global.css) en per afdeling
shared/           ← museumcollectie en validatie, gedeeld door frontend en worker
worker/           ← API (stemmen, loket, moderatie)
www/              ← doorverwijzing www → hoofddomein
migrations/       ← D1-schema
scripts/          ← post-build (route-HTML, 404, sitemap) en OG-afbeelding
e2e/, tests/      ← Playwright en Vitest
docs/             ← inhoud wijzigen, deployment, moderatie, verrassingen
```

## Documentatie

- [Inhoud wijzigen](docs/INHOUD.md)
- [Deployment en hosting](docs/DEPLOYMENT.md)
- [Moderatie van ingezonden ideeën](docs/MODERATIE.md)
- [Verrassingen en missies (spoilers!)](docs/VERRASSINGEN.md)
- [Infrastructuur vóór livegang](docs/INFRA-NULMETING.md)
