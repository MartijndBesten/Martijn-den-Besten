# Deployment en hosting

## Overzicht

| Onderdeel | Waarde |
| --- | --- |
| Cloudflare-account | `M.denbesten@live.nl's Account` (`c5472db2163a42a463916a6a525d8353`) |
| Zone | `martijndenbesten.com` (Free plan, geregistreerd via Cloudflare Registrar) |
| Worker hoofdsite | `martijndenbesten` → custom domain `martijndenbesten.com` |
| Worker www | `martijndenbesten-www` → custom domain `www.martijndenbesten.com` (301 naar hoofddomein) |
| D1-database | `martijndenbesten` (`d348e383-bcf1-4e08-b742-f85abe8fef2c`, regio WEUR) |
| Worker-secrets | `ADMIN_TOKEN` (moderatie), `HASH_SECRET` (pseudonimisering voor stemmen/rate limits) |
| Certificaten | Automatisch beheerd door Cloudflare (custom domains) |
| Kosten | € 0 — alles binnen het gratis Workers/D1-plan |
| Certificaat | Google Trust Services (WR1), dekt `martijndenbesten.com` en `www.`, automatisch verlengd |

Custom domains maken zelf de benodigde DNS-records en certificaten aan. Er zijn geen andere DNS-records gewijzigd. `leren.martijndenbesten.com` (Worker `energie-trainer-h3`) is niet aangeraakt.

### Waarom Workers Static Assets?

- Eén Worker voor statische site én API, zonder Pages-project ernaast.
- Statische bestanden worden gratis en zonder Worker-aanroep geserveerd; alleen `/api/*` start de Worker (`run_worker_first`).
- `not_found_handling: "404-page"` geeft echte 404-statuscodes; elke route heeft een eigen HTML-bestand met de juiste titel en beschrijving (gegenereerd door `scripts/postbuild.mjs`).
- Beveiligingsheaders (CSP, HSTS, X-Frame-Options, …) staan in `public/_headers`.

## Twee deploy-varianten

| Variant | Config | Wanneer |
| --- | --- | --- |
| **Static Assets** (standaard) | `wrangler.jsonc` | GitHub Actions en lokaal met een eigen token. Statische bestanden komen niet langs de Worker: gratis, gecachet aan de rand. |
| **Ingebed** | `wrangler.embedded.jsonc` + `worker/embedded.ts` | Omgevingen waar de asset-upload niet kan. De gebouwde site zit als data in de Worker; de Worker serveert alles zelf, met dezelfde routes, 404's, headers en caching, plus een HTTP→HTTPS-doorverwijzing. |

De eerste livegang (25 oktober 2026) is gedaan met de **ingebedde** variant. De omgeving waarin de site is gebouwd liep via een proxy die het tijdelijke upload-token van Cloudflare vervangt, waardoor `wrangler deploy` met Static Assets een 401 gaf. Beide varianten gebruiken dezelfde Worker-naam, database en secrets: de eerste geslaagde GitHub Actions-deploy vervangt de ingebedde versie automatisch door de Static Assets-versie.

Let op: de ingebedde variant laat élk verzoek door de Worker lopen (gratis tot 100.000 per dag). Voor een persoonlijke site is dat ruim voldoende, maar Static Assets is de betere eindsituatie.

```bash
npm run deploy:embedded   # build + inbedden + migraties + beide Workers
```

## Aanbevolen zone-instellingen (niet door de bouwer aan te passen)

Het API-token van de bouwomgeving had geen rechten op zone-instellingen. Zet deze zelf aan in het Cloudflare-dashboard voor `martijndenbesten.com`:

1. **SSL/TLS → Edge Certificates → Always Use HTTPS: aan.** Nodig zodra de Static Assets-variant draait (de ingebedde variant verwijst zelf door).
2. **SSL/TLS → Edge Certificates → Minimum TLS Version: 1.2.** SSL Labs geeft nu een B omdat TLS 1.0/1.1 nog zijn toegestaan; met 1.2 wordt het een A.
3. Optioneel: **Web Analytics** staat aan en injecteert een cookieloos script. De CSP staat dat toe. Wil je het niet, zet het dan uit en verwijder `static.cloudflareinsights.com` en `cloudflareinsights.com` uit `public/_headers`.

## Automatische deployment via GitHub Actions

`.github/workflows/ci.yml` doet bij elke push en pull request: typecheck → unit-tests → build → e2e-tests. Bij een push naar `main` volgt daarna de deploy-job: D1-migraties, deploy van beide Workers en een rooktest op productie.

**Eenmalig nodig:** een Cloudflare API-token als GitHub-secret.

1. Ga in Cloudflare naar *My Profile → API Tokens → Create Token* en kies de template **Edit Cloudflare Workers**.
2. Voeg bij *Permissions* toe: *Account → D1 → Edit*.
3. Beperk *Account Resources* tot dit account en *Zone Resources* tot `martijndenbesten.com`.
4. Kopieer het token en zet het in GitHub: *Settings → Secrets and variables → Actions → New repository secret*, naam `CLOUDFLARE_API_TOKEN`.

Zonder dit secret slaat de deploy-job zichzelf netjes over (met een waarschuwing); de checks draaien wel.

## Handmatig deployen

```bash
export CLOUDFLARE_API_TOKEN=...   # of: npx wrangler login
npm run deploy                    # build + migraties + beide Workers
```

## Secrets vervangen

```bash
npx wrangler secret put ADMIN_TOKEN    # minimaal 24 tekens
npx wrangler secret put HASH_SECRET
```

## Terugdraaien

```bash
npx wrangler deployments list
npx wrangler rollback <versie-id>
```
