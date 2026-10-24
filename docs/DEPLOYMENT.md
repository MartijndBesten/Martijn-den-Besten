# Deployment en hosting

## Overzicht

| Onderdeel | Waarde |
| --- | --- |
| Cloudflare-account | `M.denbesten@live.nl's Account` (`c5472db2163a42a463916a6a525d8353`) |
| Zone | `martijndenbesten.com` (Free plan, geregistreerd via Cloudflare Registrar) |
| Worker hoofdsite | `martijndenbesten` → custom domain `martijndenbesten.com` |
| Worker www | `martijndenbesten-www` → custom domain `www.martijndenbesten.com` (301 naar hoofddomein) |
| D1-database | `martijndenbesten` (`baee3882-6d6c-4807-8100-1661c04c1270`, regio WEUR) |
| Worker-secrets | `ADMIN_TOKEN` (moderatie), `HASH_SECRET` (pseudonimisering voor stemmen/rate limits) |
| Certificaten | Automatisch beheerd door Cloudflare (custom domains) |
| Kosten | € 0 — alles binnen het gratis Workers/D1-plan |

Custom domains maken zelf de benodigde DNS-records en certificaten aan. Er zijn geen andere DNS-records gewijzigd. `leren.martijndenbesten.com` (Worker `energie-trainer-h3`) is niet aangeraakt.

### Waarom Workers Static Assets?

- Eén Worker voor statische site én API, zonder Pages-project ernaast.
- Statische bestanden worden gratis en zonder Worker-aanroep geserveerd; alleen `/api/*` start de Worker (`run_worker_first`).
- `not_found_handling: "404-page"` geeft echte 404-statuscodes; elke route heeft een eigen HTML-bestand met de juiste titel en beschrijving (gegenereerd door `scripts/postbuild.mjs`).
- Beveiligingsheaders (CSP, HSTS, X-Frame-Options, …) staan in `public/_headers`.

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
