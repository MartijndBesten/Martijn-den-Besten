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
| Certificaat | Google Trust Services (WR1), dekt `martijndenbesten.com` en `www.`, automatisch verlengd |
| Kosten | € 0 — alles binnen het gratis Workers/D1-plan |

Custom domains maken zelf de benodigde DNS-records en certificaten aan. Er zijn geen andere DNS-records gewijzigd. `leren.martijndenbesten.com` (Worker `energie-trainer-h3`) is niet aangeraakt.

## Eenmalige handelingen voor de eigenaar

Deze vier stappen kunnen alleen met de rechten van de accounteigenaar. Samen duren ze ongeveer tien minuten.

### 1. Deploy-token voor GitHub Actions

1. Open <https://dash.cloudflare.com/profile/api-tokens> → **Create Token**.
2. Kies bij de template **Edit Cloudflare Workers** op **Use template**.
3. Voeg onder *Permissions* een regel toe: **Account → D1 → Edit**.
4. *Account Resources*: **Include → M.denbesten@live.nl's Account**.
5. *Zone Resources*: **Include → Specific zone → martijndenbesten.com**.
6. Optioneel: *TTL* leeg laten (geen verloopdatum) of een datum ver in de toekomst.
7. **Continue to summary → Create Token**. Kopieer het token (het wordt maar één keer getoond).
8. Open <https://github.com/MartijndBesten/Martijn-den-Besten/settings/secrets/actions> → **New repository secret**.
   - Name: `CLOUDFLARE_API_TOKEN`
   - Secret: het gekopieerde token → **Add secret**.
9. Start de eerste deploy: <https://github.com/MartijndBesten/Martijn-den-Besten/actions/workflows/ci.yml> → **Run workflow** → branch `main` → **Run workflow**.

Plak het token nergens anders (niet in chat, niet in de code). Het staat daarna alleen versleuteld in GitHub.

### 2. HTTPS en TLS in de zone

Open <https://dash.cloudflare.com> → `martijndenbesten.com` → **SSL/TLS** → **Edge Certificates**:

- **Always Use HTTPS**: aan.
- **Minimum TLS Version**: **TLS 1.2**.
- (Al standaard aan: **TLS 1.3** en **Automatic HTTPS Rewrites**; laat zo.)

Doe dit vóór of direct na stap 1. De ingebedde variant verwees zelf door naar HTTPS; bij Static Assets doet de zone dat.

### 3. Eigen beheertoken instellen

Het huidige `ADMIN_TOKEN` is tijdens de bouw willekeurig gegenereerd. Vervang het door een eigen waarde die alleen jij kent:

1. Maak in je wachtwoordbeheerder een nieuw wachtwoord van minimaal 32 tekens (letters en cijfers).
2. Open <https://dash.cloudflare.com> → **Workers & Pages** → `martijndenbesten` → **Settings** → **Variables and Secrets**.
3. Bij `ADMIN_TOKEN` → **Edit** → plak het nieuwe wachtwoord → **Deploy**.
4. Test: <https://martijndenbesten.com/beheer> → inloggen met het nieuwe token.

Het token staat alleen als versleuteld Worker-secret bij Cloudflare. Het staat niet in GitHub, niet in de code en niet in de GitHub Actions-configuratie, en blijft behouden bij elke deploy.

### 4. (Aanbevolen, optioneel) Beheer achter Cloudflare Access

Extra slot op de deur, gratis tot 50 gebruikers: alleen jouw e-mailadres komt nog bij `/beheer` en de beheer-API.

1. Open <https://one.dash.cloudflare.com> en kies (indien gevraagd) een teamnaam en het **Free**-plan.
2. **Settings → Authentication → Login methods → Add new → One-time PIN**.
3. **Access → Applications → Add an application → Self-hosted**:
   - Application name: `MdB beheer`
   - Public hostname: `martijndenbesten.com`, path `beheer`. Voeg een tweede hostname toe: `martijndenbesten.com`, path `api/admin`.
   - Policy: *Allow* → *Include* → *Emails* → `m.denbesten@live.nl`.
4. Opslaan. Bij `/beheer` vraagt Cloudflare nu eerst om een code per e-mail; daarna werkt het beheertoken zoals voorheen.

## Twee deploy-varianten

> **Stand 25 oktober 2026:** de deploy-job in GitHub Actions wordt nog steeds overgeslagen omdat het secret `CLOUDFLARE_API_TOKEN` niet is ingesteld (stap 1 hierboven); de workflow meldt dat als waarschuwing, niet als fout. De site draait daarom nog op de **ingebedde** variant, voor het laatst uitgerold vanuit een Claude-cloudsessie met `npm run build && node scripts/embed-assets.mjs && npx wrangler deploy -c wrangler.embedded.jsonc` (versie `1e9d3cbc`, met Bijbelreis). De ingebedde Worker is nu 3,7 MB gecomprimeerd (door de Bijbelteksten en 3D-beelden); zodra het secret is ingesteld en één deploy via Actions is geslaagd, is die grens niet meer van belang.

| Variant | Config | Wanneer |
| --- | --- | --- |
| **Static Assets** (standaard) | `wrangler.jsonc` | GitHub Actions en lokaal met een eigen token. Statische bestanden komen niet langs de Worker: gratis, gecachet aan de rand. |
| **Ingebed** (noodvariant) | `wrangler.embedded.jsonc` + `worker/embedded.ts` | Alleen voor omgevingen waar de asset-upload niet kan. De Worker serveert alles zelf, met dezelfde routes, 404's, headers en caching, plus een HTTP→HTTPS-doorverwijzing. |

De livegang is gedaan met de ingebedde variant: de bouwomgeving liep via een proxy die het tijdelijke upload-token van Cloudflare vervangt, waardoor Static Assets een 401 gaf. Beide varianten gebruiken dezelfde Worker-naam, database en secrets. **De eerste geslaagde GitHub Actions-deploy vervangt de ingebedde versie automatisch door Static Assets**; daarna is de ingebedde variant niet meer nodig.

## Wat de pipeline doet

`.github/workflows/ci.yml`:

1. **Checks** (elke push en pull request): typecheck → unit- en API-tests → build → end-to-end tests tegen een lokale Worker met D1.
2. **Deploy** (push naar `main` of handmatig via *Run workflow*), alleen als de checks slagen:
   - controle van het token (`wrangler whoami`);
   - D1-migraties;
   - deploy van de hoofdsite (Static Assets) en de www-doorverwijzing;
   - rooktest: health, 200 op `/`, echte 404, www-doorverwijzing;
   - **de volledige e2e-suite tegen https://martijndenbesten.com** (zonder tests die echte stemmen of inzendingen aanmaken).

Zonder secret slaat de deploy-job zichzelf over met een waarschuwing.

## Handmatig deployen (eigen computer)

```bash
npx wrangler login
npm run deploy        # build + migraties + beide Workers (Static Assets)
```

## Terugdraaien

```bash
npx wrangler deployments list
npx wrangler rollback <versie-id>
```

Of in het dashboard: **Workers & Pages → martijndenbesten → Deployments → … → Rollback**.
