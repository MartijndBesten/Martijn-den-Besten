# Bijbelreis: bezoekmeting (november 2026)

Opdracht van Martijn (16-11-2026): “Hou bij hoeveel mensen er op de site komen en voor hoelang.”

De Bijbelreis telt dat zelf, zonder externe dienst en zonder cookies. Dit document zegt wat er gemeten wordt, wat bewust
niet, hoe je de cijfers inziet en hoe het live gaat. Wie verder bouwt (Claude, Codex of een mens) houdt de grenzen van §2
aan: de site is voor kinderen en gezinnen.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/bezoek.js` | Het script in de pagina (atlas en boekje): meldt het begin, de duur en het aantal stappen |
| `worker/bezoek.ts` | Neemt de meldingen aan (`POST /api/bezoek`), begrenst ze en maakt het overzicht voor het beheer |
| `worker/bijbelreis-app.ts` | De Worker van bijbelreis.nl: geeft `/api/bezoek` door aan `worker/bezoek.ts` |
| `worker/index.ts` | De hoofdsite: `/api/admin/bezoek` voor het beheer; `/api/bezoek` alleen in de lokale testopstelling |
| `migrations/0002_bezoek.sql` | De tabel `bezoek` |
| `src/pages/Beheer.tsx` | Het onderdeel **Bezoek bijbelreis.nl** in het beheer van martijndenbesten.com |
| `tests/bezoek.test.ts`, `e2e/bijbelreis-bezoek.spec.ts` | De tests |

## 1. Wat er gemeten wordt

Eén rij per geladen pagina (een ‘bezoek’). Meer staat er niet in:

| Kolom | Inhoud |
|---|---|
| `id` | Een willekeurig getal dat de browser bij het laden maakt. Het staat alleen in het geheugen van die pagina; bij herladen is er een nieuw. |
| `dag` | De kalenderdag in Nederland |
| `begin` | Het tijdstip van de eerste melding (klok van de server) |
| `duur` | De seconden dat de pagina **in beeld** was (een tabblad op de achtergrond telt niet). Hooguit vier uur. |
| `bezoeker` | Een hash om het aantal verschillende bezoekers per dag te schatten, zie hieronder |
| `pagina` | `atlas` of `boekje` |
| `apparaat` | `telefoon` (smaller dan 700 px), `tablet` (smaller dan 1100 px) of `desktop` |
| `herkomst` | Alleen de hostnaam van de site waar de bezoeker vandaan kwam (`www.google.com`), of `direct` |
| `stappen` | Hoeveel verschillende reisstappen in dit bezoek zijn geopend. Niet welke. |

**De bezoekershash.** De server rekent uit: HMAC-SHA256 van IP-adres + browserkenmerk (user-agent) + de dag, met de geheime
sleutel `HASH_SECRET`. Alleen de uitkomst wordt bewaard. Die is niet terug te rekenen naar een IP-adres en is elke dag
anders, dus iemand is niet van dag tot dag te volgen. Heeft de Worker geen `HASH_SECRET`, dan blijft het veld leeg en toont
het beheer ‘onbekend’ bij bezoekers; de code valt nooit terug op een bekende sleutel.

**Verloop.** Bij het laden gaat er één melding uit. Daarna bij het verbergen van de pagina (tabbladwissel, telefoon op
slot), bij het verlaten, en zolang de pagina in beeld is elke twee minuten. De server werkt steeds dezelfde rij bij en
houdt het hoogste van duur en stappen.

## 2. Wat er bewust niet gebeurt

- **Geen cookie en niets in de opslag van de browser** voor de meting. (De stempels en scores van de atlas zelf staan wel in
  de browser, zoals altijd; die gaan nergens heen.)
- **Geen IP-adres en geen user-agent** in de database, ook niet in het geheugen van de Worker (daar alleen een gezouten hash
  voor de begrenzing).
- **Geen externe dienst**, geen script van buiten; de CSP is niet verruimd.
- **Geen land, geen niveau, geen welke-stap, geen zoekwoorden, geen volledige verwijzer.**
- **Wie ‘niet volgen’ aan heeft staan** (Do Not Track of Global Privacy Control) wordt niet geteld.
- **Robots en tests** worden niet geteld: de browser meldt niets als hij geautomatiseerd is (`navigator.webdriver`), en de
  server slaat verzoeken over van zoekmachines, linkvoorbeelden (WhatsApp, Slack), bewaking en scripts.
- **Bewaartermijn 400 dagen.** Oudere rijen worden bij gelegenheid opgeruimd (bij ongeveer één op de vijftig meldingen).

De tekst onder ‘Voor ouders en leiders’ → Privacy in `public/bijbelreis.html` zegt dit in gewone woorden. Verandert de
meting, pas dan ook die tekst aan; een test bewaakt dat de oude belofte ‘geen trackers’ er niet meer staat.

## 3. Inzien

`https://martijndenbesten.com/beheer` → inloggen met het beheertoken → **Bezoek bijbelreis.nl**.

- Bovenaan de totalen over de laatste 7 en 30 dagen: bezoeken, bezoekers (geschat), gemiddelde en middelste duur
  (mediaan), bezoeken korter dan 10 seconden, en de verdeling telefoon, tablet en desktop.
- Daaronder een tabel per dag (7, 30 of 90 dagen), met dagen zonder bezoek als 0.
- Onderaan waar bezoekers vandaan komen (hooguit tien regels).

Hoe je de cijfers leest:

- De **mediaan** zegt meer dan het gemiddelde: één tabblad dat een uur open blijft, trekt het gemiddelde omhoog.
- **Bezoekers** is een schatting per dag. Wie op twee dagen komt, telt twee keer. Een gezin op één apparaat telt als één;
  een klas achter één schooladres met dezelfde browser ook. Twee browsers op één computer tellen als twee.
- **Korter dan 10 seconden** zijn bezoeken die meteen weer weg waren (of waarvan de laatste melding niet aankwam).

Rechtstreeks: `GET /api/admin/bezoek?dagen=30` met `Authorization: Bearer <beheertoken>`.

## 4. Misbruik en de gedeelde database

`POST /api/bezoek` is openbaar en schrijft naar dezelfde gratis D1-database als de hoofdsite (stemmen en ideeën). Daarom:

- Het antwoord is altijd `204` zonder inhoud, ook bij afgewezen invoer.
- De melding mag hooguit 300 bytes zijn en bevat alleen de zes bekende velden met geldige waarden.
- Alleen van de eigen site (`Sec-Fetch-Site: same-origin`, of bij oudere browsers de kop `Origin`).
- Een teller in het geheugen van de Worker laat per IP-adres 300 en in totaal 3000 meldingen per tien minuten door. Wat
  daarboven komt, bereikt de database niet. De teller geldt per Worker-instantie; het is een rem, geen sluitende telling.
- Een afgewezen melding leidt tot geen enkele schrijfactie.

Wie buiten een browser om verzoeken stuurt, kan de koppen namaken en dus valse bezoeken toevoegen (binnen de rem). De
cijfers zijn een indicatie, geen boekhouding.

## 5. Live zetten

Volgorde (de coördinator doet dit; de migratie is alleen een nieuwe tabel en raakt niets bestaands):

1. Migratie op productie: `npx wrangler d1 migrations apply martijndenbesten --remote -c wrangler.embedded.jsonc`
2. Het secret voor de bezoekershash op de Worker `bijbelreis` (die had tot nu toe geen secrets; de waarde hoeft niet
   gelijk te zijn aan die van de hoofdsite en hoeft nergens bewaard te worden):
   `openssl rand -hex 32 | npx wrangler secret put HASH_SECRET -c wrangler.bijbelreis.jsonc`
3. De Worker `bijbelreis` uitrollen (krijgt de D1-binding en de route), daarna de hoofdsite (beheer en `/api/admin/bezoek`).
4. Controleren: bijbelreis.nl openen in een gewone browser, even wachten, tabblad wisselen; in het beheer staat er dan één
   bezoek bij vandaag. `curl -i https://bijbelreis.nl/api/bezoek` geeft `405`.

Terugdraaien: de vorige versie van beide Workers terugzetten (`wrangler rollback`). De tabel mag blijven staan.

## 6. Bekende zwaktes

- **Het einde van een bezoek komt niet altijd aan.** Safari stuurt bij het wegvegen van een tabblad soms niets meer. De
  melding om de twee minuten vangt dat op, dus de duur kan tot twee minuten te laag zijn; een bezoek van onder de twee
  minuten kan dan als 0 seconden staan.
- **Een bezoek is een paginalading, geen persoon.** Herladen, of van de atlas naar het boekje gaan, is een nieuw bezoek.
- **Bezoekers is een schatting** (zie §3).
- **Gedeelde database** met de hoofdsite: bij een stortvloed beschermt alleen de rem in het geheugen de schrijflimiet van
  D1 (100.000 per dag op het gratis plan). Een eigen database voor de Bijbelreis zou dat scheiden; dat is een nieuw
  onderdeel in het Cloudflare-account en dus een besluit van Martijn.
- **Advertentieblokkers** kunnen `/api/bezoek` tegenhouden; die bezoekers ontbreken.
- **De klok van de duur** staat in de browser. Een telefoon die de pagina bevriest zonder iets te melden, telt de tijd tot
  het bevriezen niet altijd mee.
- Niet op een echte iPhone geprobeerd; alleen Chromium.
