# Bijbelreis: vindbaar in zoekmachines (17 november 2026)

## 1. Wat er was

Gemeten op productie (`curl https://bijbelreis.nl/…`, 17-11-2026):

| Wat | Stand vóór deze wijziging |
|---|---|
| `robots.txt` | `Allow: /` en een verwijzing naar de sitemap. In orde. |
| `sitemap.xml` | Eén adres: `https://bijbelreis.nl/`. |
| `/` | Goede `<title>`, `description`, `canonical`, Open Graph-afbeelding. De HTML bevat alleen de bediening (tabbladen, legenda, ‘Voor ouders’); **geen enkele geschiedenis**: die komen er met JavaScript in. |
| Geschiedenissen | Alleen bereikbaar achter een fragment (`/#v26`, `#abraham/2`). Een zoekmachine ziet een fragment niet als eigen pagina: voor Google bestond de hele site uit één pagina. |

Gevolg: wie zoekt op ‘Droog door de Schelfzee kinderen’ of ‘Jona kinderbijbel kaart’, kon de Bijbelreis niet vinden,
hoe goed de inhoud ook is.

## 2. Wat er nu is

Tijdens `npm run build` maakt `scripts/bijbelreis-verhalen.mjs` (aangeroepen door `scripts/postbuild.mjs`):

- **per geschiedenis één gewone HTML-pagina** (150 stuks), op bijbelreis.nl op `/verhaal/<nr>-<slug>`, bijvoorbeeld
  `https://bijbelreis.nl/verhaal/26-droog-door-de-schelfzee`;
- **een overzicht** op `/verhalen`, per sectie (dezelfde indeling als de Verhalenlijst in de atlas);
- en de Worker maakt de **sitemap** nu uit de ingebedde bestanden: `/`, `/verhalen` en alle 150 verhaalpagina’s.

Op elke verhaalpagina: titel, ‘Lees in je Bijbel: …’ (de verwijzing), de korte vertelling in eigen woorden (het veld
`uitleg`, met de tussenkoppen uit `indeling.js`), de uitleg (`betekenis`), wie erin voorkomen, vorige/volgende en twee
keer de knop **Open deze geschiedenis in de Bijbelreis** (`/#v26`). Eigen `title`, `description` (het begin van de
vertelling), `canonical` en Open Graph.

**Geen tweede bron.** Er staat geen enkele tekst dubbel in de repository: de pagina’s komen bij elke build uit
`public/bijbelreis/geschiedenissen/*.js` en `indeling.js`, precies zoals de atlas ze laadt; de secties worden uit
`app.js` gelezen. Wijzigt een geschiedenis, dan wijzigt de pagina bij de volgende uitrol mee. De bestanden staan alleen
in `dist/client/bijbelreis/verhaal/` (niet in git).

**Geen extra Bijbeltekst.** Alleen wat de atlas al toont: de eigen navertelling met de korte SV-citaten tussen ‘…’.

**Geen script, geen meting.** De pagina’s laden alleen `verhaal.css` en de eigen lettertypen. De bezoekmeting telt ze
niet (wie doorklikt naar de atlas, wordt daar geteld, met herkomst ‘direct’).

## 3. Adressen en de Worker

`worker/bijbelreis-app.ts`:

| Verzoek | Antwoord |
|---|---|
| `/verhaal/26-droog-door-de-schelfzee` | 200, de pagina (`/bijbelreis/verhaal/…html` uit de build), met de gewone beveiligingskoppen (CSP, X-Frame-Options) |
| `/verhaal/26`, `/verhaal/26-oude-titel`, `/verhaal/26-…/` | 301 naar het ene vaste adres. Gezocht wordt op **nummer**: verandert een titel, dan blijft een oude link werken. |
| `/bijbelreis/verhaal/…(.html)`, `/bijbelreis/verhalen` | 301 naar `/verhaal/…` en `/verhalen` (geen dubbele adressen) |
| `/verhaal/999` | 404 |
| `/sitemap.xml` | `/`, `/verhalen` en elke verhaalpagina |

De **hoofdsite** (martijndenbesten.com, ingebedde Worker) krijgt deze pagina’s niet mee (`scripts/embed-assets.mjs`).
Met Static Assets (`wrangler.jsonc`, ook de lokale tests en de CI) staan ze op `/bijbelreis/verhaal/…`; hun canonical
wijst altijd naar bijbelreis.nl. De links op de pagina’s zijn relatief (`../#v26`), zodat ze op beide adressen kloppen.

**Grootte:** de Worker `bijbelreis` wordt ongeveer 170 kB (gzip) groter; `wrangler deploy --dry-run` geeft
**4.858 KiB gzip** (grens 10 MB).

## 4. Tests

- `tests/bijbelreis-verhalen.test.ts`: elke geschiedenis krijgt precies één pagina met een uniek adres; titel,
  verwijzing, de volledige vertelling (letterlijk), uitleg en namen komen uit de gegevens; de knop leidt naar `/#vNN`;
  geen script en geen externe bronnen; de Worker serveert de pagina’s met de beveiligingskoppen, verwijst oude adressen
  door en zet alles in de sitemap.
- `e2e/bijbelreis-vindbaar.spec.ts` (desktop, telefoon, tablet): een pagina laadt zonder fouten, is toegankelijk (axe,
  WCAG 2.2 AA), schuift niet horizontaal op 320 px; de knop opent dezelfde geschiedenis in de atlas; het overzicht en
  ‘Volgende’ werken.
- Met de echte Worker lokaal (`wrangler dev -c wrangler.bijbelreis.jsonc`): overzicht → verhaal → knop → `/#v26` opent
  ‘Droog door de Schelfzee’, op 390 en 1440 px.

## 5. Nog te doen (niet in code)

- **Google Search Console** en **Bing Webmaster Tools**: bijbelreis.nl toevoegen en `https://bijbelreis.nl/sitemap.xml`
  indienen. Dat vraagt een persoonlijke login (en DNS-verificatie of een bestand); daarom niet gedaan. Pas dan is te zien
  óf en hoe snel de pagina’s gevonden worden.
- Eventueel later: in de atlas onder ‘Voor ouders en leiders’ een gewone link naar `/verhalen` (helpt zoekmachines en
  ouders die liever een lijst lezen). Niet gedaan om de atlas niet te wijzigen zonder vraag.
