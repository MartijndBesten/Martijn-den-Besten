# Strooizout voor de buurt

> **Samen veilig de winter door.** Mini-webshop voor inwoners van Houten op **https://martijndenbesten.com/strooizout**, met beheer op **/strooizout/beheer**.

Zelfde Worker, zelfde D1-database en zelfde uitrolroute als de rest van martijndenbesten.com. Geen aparte hosting, geen betaalde diensten, geen externe scripts of CDN's.

## Wat het doet

| Onderdeel | Adres | Toelichting |
| --- | --- | --- |
| Webshop | `/strooizout` | Producten, mandje, hoe het werkt, ophalen/bezorgen/betalen, veelgestelde vragen |
| Bestellen | `/strooizout/bestellen` | Mandje → ophalen of bezorgen (+ moment) → gegevens → betalen → controleren → definitief reserveren |
| Bestelpagina klant | `/strooizout/bestelling#<code>` | Status, details, afhaaladres **pas na bevestiging**, annuleren. De code staat in het fragment (gaat niet naar server of statistiek) |
| Privacy en voorwaarden | `/strooizout/privacy`, `/strooizout/voorwaarden` | Voorwaarden zijn in het beheer aan te passen |
| Flyer en deelbeelden | `/strooizout/flyer` | A5-flyer (afdrukken), deelbeelden, WhatsApp-tekst; prijzen live uit de webshop |
| Korte link | `/zout` | 301 naar `/strooizout` |
| Beheer | `/strooizout/beheer` | Overzicht, bestellingen, bezorgroute, producten, bestelrondes, financiën, instellingen, flyer en delen |

Statische bestanden in `public/strooizout/`: `flyer-a5.pdf`, `delen-1080.jpg` (WhatsApp/buurt-app), `delen-1200x630.jpg` (linkvoorvertoning), productillustraties in `beeld/`, icoon.

## Werking in het kort

- **Bestelrondes.** Bestellen kan alleen als er een ronde *open* staat en de sluitdatum niet voorbij is (én de webshop niet tijdelijk gesloten is). Na de migratie staat er **geen** ronde open: de webshop is dus dicht tot de beheerder een ronde start.
- **Reservering, geen betaling.** Een bestelling is een reservering. Betalen bij afhalen/bezorgen of via een handmatige Tikkie; de beheerder registreert betalingen (verplicht vinkje ‘echt ontvangen’). Geen bankgegevens of betaalgeheimen.
- **Server rekent.** De browser stuurt alleen product-ID's en aantallen. Prijs, aanbiedingen, bezorgkosten, voorraad en bezorggebied worden op de server opnieuw bepaald (`shared/strooizout.ts` › `bereken`, `worker/strooizout.ts`).
- **Eén transactie.** Bestelling, regels, voorraadmutaties en logregel in één D1-batch. Voorraad kan nooit onder nul (`CHECK`), ook niet bij gelijktijdige bestellingen. Annuleren geeft voorraad precies één keer terug (B70-recept).
- **Geen dubbele bestellingen.** Elke bestelsessie heeft een idempotentiesleutel (`UNIQUE`); dubbel klikken of opnieuw versturen geeft dezelfde bestelling terug. De knop is ook uitgeschakeld tijdens het versturen.
- **Spam en misbruik.** Alleen vanaf de eigen site (Origin), verborgen veld, minimale invultijd, max. 8 kB per verzoek, begrenzing per (gehasht) IP: 80 pogingen/uur, 20 bestellingen/uur en 60/dag (ruim, omdat buren op mobiel internet vaak één IP-adres delen). Beheer: na 20 mislukte inlogpogingen per uur geblokkeerd.
- **Combinatiepakketten en aanbiedingen zonder programmeren.** Een product met onderdelen is een pakket (voorraad, inkoop, gewicht en bezorgkosten volgen uit de onderdelen). Aanbiedingen: actieprijs per stuk, optioneel vanaf een aantal (staffel) en binnen een periode; de laagste geldige prijs telt.
- **Bezorgen.** Aan/uit, postcodegebied (4 cijfers), tarief per stuk (per product aan te passen, standaard € 0,50) of per kg, meerdere bezorg- en ophaalmomenten met optioneel maximum. Route per wijk/postcode met Google Maps-routelinks (max. 10 adressen per link), Apple Kaarten en Waze per adres, afdrukbare lijst. Geen betaalde route-API.
- **Contact zonder automatische mail.** Er wordt geen e-mail verstuurd. De klant krijgt direct een bevestiging met persoonlijke link; de beheerder kan per bestelling een WhatsApp- of mailbericht met die link openen en zelf versturen.

## Privacy

- Alleen naam, e-mail, telefoon, (bij bezorgen) adres en een optionele opmerking.
- Persoonsgegevens worden **na de bewaartermijn** (standaard 6 maanden na afgehaald/bezorgd/geannuleerd; uiterlijk 12 maanden na de laatste wijziging) gewist; bedragen, aantallen en het postcodegebied blijven voor de administratie. Dat gebeurt bij het openen van het beheeroverzicht, of met *Instellingen › Nu opschonen*.
- Geen persoonsgegevens in logs: het logboek bevat alleen acties en bedragen; foutmeldingen bevatten geen invoer. Getest in `tests/strooizout.test.ts`.
- Het volledige afhaaladres staat alleen in de instellingen en is pas zichtbaar op de bestelpagina van een klant nadat de beheerder de bestelling heeft bevestigd.
- Het mandje staat in de browser (localStorage), het beheertoken alleen in de sessie (sessionStorage).

## Configuratie en secrets

| Naam | Soort | Nodig | Waarvoor |
| --- | --- | --- | --- |
| `ADMIN_TOKEN` | Worker-secret (bestaat al) | ja | Algemeen beheertoken van de site; geeft ook toegang tot het Strooizout-beheer |
| `STROOIZOUT_TOKEN` | Worker-secret (nieuw, optioneel) | nee | Apart beheertoken (min. 24 tekens) voor alleen de webshop, bijvoorbeeld als een buur meehelpt. Zet met `npx wrangler secret put STROOIZOUT_TOKEN -c wrangler.embedded.jsonc` (of in het Cloudflare-dashboard) |
| `HASH_SECRET` | Worker-secret (bestaat al) | ja | HMAC voor de persoonlijke bestelcode en het pseudonimiseren van IP-adressen. **Niet wijzigen** zolang er lopende bestellingen zijn: bestaande klantlinks werken dan niet meer |
| D1 `martijndenbesten` | binding `DB` (bestaat al) | ja | Migratie `migrations/0004_strooizout.sql` (tabellen `sz_*`) |

Alle overige instellingen (afhaaladres, bezorggebied, tarieven, contact, teksten, voorwaarden, btw, bewaartermijn, open/dicht) staan in de database en zijn in het beheer aan te passen.

**Aanbevolen extra slot:** zet `/strooizout/beheer` en `/api/strooizout/beheer` achter Cloudflare Access (gratis, zie [DEPLOYMENT.md](../DEPLOYMENT.md), stap 4; voeg de twee paden toe aan dezelfde applicatie).

## Livegang (checklist)

1. **Migratie** op productie: `npx wrangler d1 migrations apply martijndenbesten --remote`, daarna controleren dat de tabel er is: `npx wrangler d1 execute martijndenbesten --remote --command "SELECT COUNT(*) FROM sz_product"` (les uit de uitrol van 16-11: eerst de tabel controleren, dan uitrollen).
2. **Uitrollen** via de bestaande route (zie [DEPLOYMENT.md](../DEPLOYMENT.md); op dit moment de ingebedde variant: `npm run deploy:embedded`). Herstelpunt noteren (`npx wrangler deployments list`).
3. **Rooktest**: `/strooizout` 200, `/zout` 301, `/api/strooizout/winkel` 200 met `open: false`, `/api/strooizout/beheer/overzicht` zonder token 401, `/strooizout/beheer` met `X-Robots-Tag: noindex`.
4. **In het beheer**: inloggen → *Instellingen*: afhaaladres (privé), plek (publiek, bijv. ‘Houten’), contactgegevens, bezorggebied controleren, btw-keuze; *Producten*: inkoopprijs strooizout invullen, eventueel echte productfoto uploaden; *Bestelrondes*: ronde starten met sluitdatum; eventueel momenten toevoegen.
5. **Eén eigen proefbestelling** plaatsen en daarna in het beheer annuleren (komt niet in de omzet). Geen bestellingen namens anderen.
6. Flyer printen (`/strooizout/flyer` of `flyer-a5.pdf`) en de deelafbeelding met tekst delen.

Terugdraaien: `npx wrangler rollback <versie-id> -c wrangler.embedded.jsonc`. De `sz_*`-tabellen mogen blijven staan; een oudere versie gebruikt ze niet.

## Bestanden

```
migrations/0004_strooizout.sql        schema + startgegevens (categorieën, strooizout 25 kg actief, sneeuwschep als concept)
shared/strooizout.ts                  prijsregels, validatie, instellingen, statussen (worker én webshop)
worker/strooizout.ts                  publieke API: winkel, bestellen, bestelpagina, annuleren, afbeeldingen
worker/strooizout-beheer.ts           beheer-API: overzicht, bestellingen, route, producten, rondes, momenten, instellingen, CSV, opschonen
worker/strooizout-basis.ts            gedeelde hulp (HTTP, catalogus, pakketten, voorraad, tokens)
strooizout.html + src/strooizout/     eigen Vite-ingang en React-app (eigen uiterlijk, los van de hoofdsite)
src/strooizout/beheer/                beheerdashboard (per tabblad een bestand, lazy geladen)
scripts/postbuild.mjs                 maakt de HTML per route (noindex voor beheer/bestelling/flyer) en de sitemap-regels
scripts/strooizout/                   bron-SVG's van de productillustraties en scripts voor beelden, flyer-PDF en deelbeelden
tests/strooizout.test.ts              31 tests: prijsregels, validatie, API, gelijktijdigheid, rechten, CSV, privacy
e2e/strooizout.spec.ts                bestelroute desktop en telefoon, beheer, CSV, toegankelijkheid (axe)
```

## Beelden en flyer opnieuw maken

```bash
node scripts/strooizout/maak-beelden.cjs                  # productillustraties (SVG → WebP) en icoon
npm run build && npx wrangler dev --local --port 8790 ... # site lokaal, ronde/instellingen naar wens
node scripts/strooizout/maak-flyer.cjs http://localhost:8790   # flyer-a5.pdf en deelbeelden
```

De productafbeeldingen zijn **eigen illustraties**, geen foto's. Upload een echte productfoto via *Producten › Bewerken › Foto uploaden* (in de browser verkleind tot max. 1400 px, opgeslagen in D1, max. 900 kB).

## Mollie (voorbereid, niet actief)

Er is geen betaalprovider gekoppeld. Voorbereid: de betaaltabel `sz_betaling` heeft de velden `provider` en `provider_ref` en de wijze `provider`, de betaalstatus wordt al uitsluitend afgeleid uit geregistreerde betalingen. Een koppeling vraagt: een Mollie-account (kosten per transactie), een secret `MOLLIE_API_KEY`, een endpoint dat een betaling aanmaakt en een webhook die de status bij Mollie opvraagt (nooit de webhookinhoud vertrouwen) en dan een regel in `sz_betaling` schrijft. Niet bouwen zonder kostenakkoord.

## Bekende grenzen

- Geen automatische e-mail of sms; contact loopt via de bestelpagina en handmatige WhatsApp/mail.
- De route is een volgorde op postcode en huisnummer, geen geoptimaliseerde route.
- De btw-instelling is een weergavekeuze; of btw van toepassing is, moet de eigenaar zelf vaststellen.
- De conceptsneeuwschep is niet zichtbaar tot leverancier, prijs, productgegevens en beschikbaarheid bevestigd en ingevuld zijn.
