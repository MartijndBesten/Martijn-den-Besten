# Bijbelreis 3.1: een ontdekkingsatlas (ontwerp en oplevering ter beoordeling)

**Status:** gebouwd op branch `claude/bijbelreis-3.1`. **Niet gepubliceerd.** Martijn beoordeelt eerst de schermafbeeldingen.
Live staat 3.0 met de afrondingsreparatie: worker `d5b8af16-ca11-466e-b060-5da3fe5de375`, `main` @ `6a3bc77`.

## A. Audit (25 oktober 2026)

### Productie tegenover de broncode
- **Versie:** live staat 3.0 (plus de afronding). `app.js`, CSS en de gegevens zijn byte-gelijk aan `main`. De HTML laadt alle eigen scripts met een inhoudshash (`?v=`) en wordt met `must-revalidate` uitgeleverd, dus er is geen gemengde release.
- **Service worker en app-shell:** er is geen service worker (`/sw.js` en `/service-worker.js` geven 404) en er is geen verouderde app-shell. De metadata klopt (titel, beschrijving, canonical).
- **Cache (gevonden en opgelost):** `geo.json`, `relief.json`, `grenzen.json`, de reliëfbeelden en alle Bijbelteksten (`bijbel/*.json`) werden **zonder** versie opgehaald, met `max-age=3600, stale-while-revalidate=86400`. Een terugkerende bezoeker kon na een release tot een dag de oude kaart of de oude Bijbeltekst zien. Zie C6.
- **Zes onderdelen:** alle zes waren zichtbaar, maar op een smal toestel (320 px) waren ze krap: tabs van 43 px breed, ‘Wie is wie’ over drie regels en ‘Speurtocht’ tegen ‘Paspoort’ aan.

### Waarom was het ‘zo blauw’?
1. **Hoofdoorzaak: het site-thema ‘Blauwdruk’.** De site heeft een keuze voor het uiterlijk (Ivoor, Blauwdruk, Nachtdienst), die in de browser wordt onthouden (`mdb:uiterlijk`). De Bijbelreis volgde die keuze. In Blauwdruk zijn land, zee, kaarten en achtergrond allemaal blauw, waardoor kust en route wegvallen. Zie `screenshots/3.1/iphone-blauwdruk-voor-na.jpg`.
2. **Knoppen kregen de kleur van het Bijbelboek.** Paars bij Abraham, bordeaux bij Ezra, groen bij Ruth. Dat maakte het onrustig en dashboardachtig.
3. **Druk op mobiel:**
   - de kaart en zes losse pillen op de kaart (kaart 305 van 664 px);
   - de stappenbalk lag over de kaart;
   - een sitekop van ca. 120 px;
   - een welkomstkaart van 200–250 px;
   - de zes tabs midden in de inhoud.

   De eigenlijke inhoud begon daardoor pas onder de vouw.

## B. Ontwerprichting

**Principe:** een kind ontdekt een wereld en bedient geen dashboard. Daarom:
- warm papier en gebroken wit voor de inhoud;
- nachtblauw alleen voor de kop, de navigatie en de hoofdknop;
- de kaart als atlas.

### Kleurensysteem (tokens in `bijbelreis.css`)
| Token | Hex | Functie | Contrast |
| --- | --- | --- | --- |
| `--nacht` | #243D70 | kop, onderdelen, hoofdknop, koppen in de paspoortkaart | wit erop 10,6:1 |
| `--papier` | #F5F0E5 | achtergrond | tekst `--inkt` 13,7:1 |
| `--wit` | #FFFCF6 | kaarten en inhoud | `--inkt-3` 5,7:1 |
| `--zand` / `--land` | #D9C49D / #EDE3CB | woestijnstreken / land op de kaart | `--inkt` op land 12,2:1 |
| `--salie` / `-diep` | #A9BE9B / #4A6541 | ontdekkingen, goed, de speurtocht | diep op wit 6,4:1 |
| `--terra` / `-diep` | #B97756 / #8F4F31 | reisroute, voortgang, accent in koppen | diep op wit 6,2:1 |
| `--water` / `--zee` | #668E9B / #C3D6D8 | rivieren en kust / zee | zeenamen 5,4:1; kust tegen zee 2,3:1 |
| `--oker` | #C99A3B | weetjes, sterren, toetsenbordfocus | tekst `--oker-diep` op `--oker-zacht` 5,3:1 |

- De kleuren van reizigers en delen (gegevensnamen `kobalt`, `koraal`, `salie`, `lila`, `boter`, `terra` …) zijn omgezet naar een aards palet. Ze kleuren alleen nog de **route**, de **stappen** en de **tijdlijnstip** (`--rc`), niet meer de knoppen.
- **Typografie:** Geist (rustig, goed leesbaar) en Instrument Serif cursief als accent. Verhaaltekst 17 px met regelafstand 1,65. Geen nieuwe lettertypen, dus niets extra te laden.
- **Vorm:** hoeken van 8–16 px in plaats van pillen, geen harde onderranden, geen gradients en geen glans. Alleen schaduwen waar iets boven de kaart zweeft.
- **Site-thema:** de atlas volgt het site-thema bewust niet meer (`uiterlijk.js` niet geladen). Een atlas heeft vaste kaartkleuren nodig. Zie §F, vraag 1.

### Kaart
- **Land en water:** licht water met een duidelijke kustlijn en een zachte gloed langs de kust, tegenover zandkleurig land.
- **Reliëf:** zachter (34 % in plaats van 42 %). Woestijnen in zand, vruchtbare streken in saliegroen, bergen als zachte schaduw.
- **Routes:** in de kleur van de reiziger met een lichte rand. Gestreept bij een reconstructie.
- **Zekerheid:** ongewijzigd en nog steeds zichtbaar: vol (identificeerbaar), open (waarschijnlijk of betwist), ringen (andere mogelijke plekken), vage cirkel met ‘?’ (onbekend), vlek (gebied).
- **Labels:**
  - de reiziger (kameel of stip) wordt op zijn werkelijke grootte ontweken, met zware weging;
  - gebiedsnamen (bijv. ‘Meer van Galilea’) mogen omhoog, omlaag of opzij uitwijken;
  - actieve namen liggen boven routepijlen;
  - namen vallen niet buiten de kaart;
  - op een smal scherm met meer dan 6 actieve namen houden alleen begin en eind voorrang.
- **Geen locaties verplaatst.** Alle coördinaten en zekerheden zijn ongewijzigd.

### Kaartbediening
| Plek | Wat | Waarom |
| --- | --- | --- |
| Linksboven | in- en uitzoomen (40 × 40 px) | standaardplek, direct te vinden |
| Rechtsboven | Toen/Nu en ‘Legenda’ | de kaart lezen |
| In de legenda | ‘Waar ligt dit?’ (kaartje met Nederland) | een aanvulling op de uitleg, geen aparte knop meer |
| Rechtsonder | ‘Hele reis’ en ‘Groot’ | terug naar de volledige route; schermvullend (telefoon) |
| Onder de kaart (telefoon) | ◀ stap · ‘Verder ▶’ | de reisnavigatie overlapt de kaart niet meer |

- **Legenda op de telefoon:** een paneel boven de onderbalk met een eigen knop ‘Sluiten’, in plaats van een vak dat in de kleine kaart wordt geperst.
- **Aanraken:** echte aanrakingen, slepen, knijpen en scrollen werken zoals in 3.0 en zijn getest. Eén vinger scrolt de pagina; twee vingers of de grote kaart bewegen de kaart.

### Indeling op de telefoon
- **Kop:** 52 px nachtblauw met terugknop en titel. Het onderschrift staat alleen op desktop.
- **Zes onderdelen:** een vaste onderbalk, binnen bereik van de duim en boven de thuisbalk (`safe-area`).
  - Elk vlak is 52–67 px breed en 61 px hoog, ook op 320 px.
  - Het actieve onderdeel heeft een balk en een kleur. Labels en pictogrammen blijven.
  - De informatiestructuur is gelijk gebleven: zes onderdelen, niets verstopt.
- **Kaarthoogte per onderdeel:** Reis 42 % plus de stappenbalk, Verhalen 42 %, Wie is wie, Tijdlijn en Paspoort 30 %.
- **Wisselen:** een ander onderdeel begint bovenaan.
- **Voortgang:** ‘Verder waar je was’ is een compacte strook met de naam van het deel, het boek, ‘stap 5 van 7’, een voortgangsbalk, de knop ‘Ga verder’ en een rustige link ‘Ergens anders beginnen’. Hoogte: iPhone 143 px (was 200), iPhone SE 163 px (was 249).
- **Desktop:** één kopbalk met titel en onderdelen boven de kaart en het reisboek. Geen uitgerekte telefoonweergave.

### Eigen karakter per onderdeel
- **Verhalen:** een inhoudsopgave met hoofdstukken (zandkleurige lijn) en een lijst als in een boek. De verhaalpagina is een leesomgeving (17 px). Het kernwoord staat op zand, de ontdekking op salie en de vragen daaronder.
- **Reis:** de atlas centraal. De stapkaart heeft een bovenrand in de kleur van de reiziger; de stappen staan als genummerde stippen.
- **Wie is wie:** een personenkaart met nachtblauwe bovenrand, rustige kaarten per persoon en de familiebanden met hun grondslag.
- **Tijdlijn:** een uitleg bovenaan (de volgorde komt uit de Bijbel, het jaartal is een *reconstructie*, of *geen jaartal*) en per deel een label.
- **Speurtocht:** een vraagkaart met grote vraag en antwoordtegels, een saliegroene voortgang en okerkleurige sterren.
- **Paspoort:** een nachtblauw reisdocument met drie tellers (reisstempels, gestempelde geschiedenissen, speurtochten). Daaronder de 150 geschiedenissen en per Bijbelboek een uitklapbaar blad met stempels; boeken met stempels staan open.

## C. Wijzigingen in de code

1. **`public/bijbelreis.html`:**
   - kopbalk met de onderdelen;
   - kaartbediening opnieuw gegroepeerd;
   - ‘Waar ligt dit?’ in de legenda;
   - kaartvlak los van de stappenbalk;
   - paspoortindeling;
   - geen site-thema;
   - `theme-color` nachtblauw.
2. **`public/bijbelreis/bijbelreis.css`:** volledig herschreven met tokens. Alle selectors die de app gebruikt, zijn behouden.
3. **`public/bijbelreis/app.js`:**
   - deelkleur alleen voor route en stappen (`--rc`);
   - ‘Hele reis’;
   - compacte voortgang;
   - tijdlijnlabels;
   - paspoort per boek;
   - labels ontwijken de reiziger, gebiedsnamen wijken uit en actieve namen liggen bovenop;
   - nieuwe kaartmarges;
   - kaarthoogte per onderdeel;
   - bovenaan beginnen bij wisselen;
   - legenda sluiten;
   - gegevens met versie.
4. **`scripts/postbuild.mjs`:** een meta-tag met inhoudshashes van kaart, reliëf, grenzen en Bijbelteksten.
5. **Inhoud** (na controle in de Statenvertaling 1888):
   - **Rachab:** Mattheüs 1:5 (‘Salmon gewon Booz bij Rachab’) maakt haar **letterlijk** (b) de moeder van Boaz. Dat zij dezelfde is als Rachab uit Jericho (Jozua 2; 6:25), staat er nu apart bij als afleiding (naam en tijd).
   - **Simon, zoon van Jonas:** in de SV staat dit in **Johannes 1:43** (‘Gij zijt Simon, de zoon van Jonas’); 1:42 is ‘Deze vond eerst zijn broeder Simon…’. De SV deelt Johannes 1 anders in dan de HSV, waar het 1:42 is. De verwijzing blijft dus 1:43, met ‘(HSV: 1:42)’ erbij.
6. **Cache:** `app.js` haalt `geo.json`, `relief.json`, `grenzen.json`, de reliëfbeelden en `bijbel/*.json` op met `?v=<hash>`.

## D. Controle

| Test | Uitkomst |
| --- | --- |
| Typecheck, unit-tests (hele site) | 68 geslaagd, 0 mislukt |
| Bijbelreis-gegevens met alle 150 | 20/20 |
| Statenvertaling-controleregels | 9.574, 0 mis |
| Personencheck `--streng` | geen fouten |
| Doorklikken: alle delen en stappen en alle 150 geschiedenissen | desktop, telefoon, tablet: geen problemen |
| Volledige Playwright-suite zoals in CI (desktop 101, mobiel 62, tablet 35, 3D 6; incl. axe/WCAG 2.2 AA) | 203 geslaagd, 0 mislukt, 1 bewust overgeslagen (alleen-touch-test op desktop) |
| Visuele regressie (`e2e/bijbelreis-visueel.spec.ts`) | 4 schermen × 3 apparaten, stabiel bij herhaling |
| Voortgang uit echte 2.0 → 3.1 | 8 stempels, score 9/10 en geen sleutel verloren (desktop, Pixel 7, iPad) |
| Alle 252 sleutels van 2.0 | wijzen naar dezelfde stap |

**Nieuwe e2e-tests voor 3.1:**
- zes onderdelen bereikbaar (≥ 44 × 44 px), zonder horizontale overloop;
- compacte voortgang en ‘Ga verder’;
- ‘Hele reis’;
- legenda in beeld en sluiten;
- versienummer op kaart en Bijbeltekst;
- site-thema genegeerd;
- Rachab;
- bovenaan beginnen bij wisselen.

**Voor/na:** `screenshots/3.1/<apparaat>-voor-na.jpg` (iPhone 13, iPhone SE, Pixel 7, Galaxy S8, iPad, desktop) en `iphone-blauwdruk-voor-na.jpg`.

## E. Andere zwakke punten uit de audit

**Opgelost:**
- de cache van gegevens (C6);
- het antwoord werd verraden bij kaartvragen (3.0-afronding, live);
- de knop ‘Hele reis’ ontbrak;
- de legenda dekte de zoomknoppen op de telefoon af;
- een wissel van onderdeel kwam midden op de pagina uit.

**Bewust niet veranderd:**
- de zes onderdelen;
- de inhoud;
- de coördinaten;
- de animaties: die volgen ‘verminderde beweging’ nog steeds.

## F. Beslissingen voor Martijn

1. **Site-thema:** moet de atlas een eigen ‘avond’-variant krijgen voor wie Nachtdienst kiest? Nu is de atlas altijd licht. Advies: niet nu; een donkere atlas maakt land, water en routes slechter leesbaar.
2. **Stadsplattegrond van Jeruzalem** (zoom 13): bewust niet getekend. De loop van de muren in de 1e eeuw is deels onzeker.
3. Na goedkeuring van de schermafbeeldingen: PR, CI, merge en publicatie volgens de vaste route.
