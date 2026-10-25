# Audit Bijbelreis 1.0 (live, 25 oktober 2026)

Uitgangspunt: https://martijndenbesten.com/bijbelreis, versie `1e9d3cbc` (embedded worker), broncode `main` @ `07d2288`.
Onderzocht: de live site op iPhone 13, Pixel 7, iPad en desktop 1440×900 (Playwright, screenshots in de opleverpagina);
axe-core (WCAG 2.0/2.1/2.2 A+AA); laadtijd en overdracht; alle 14 boeken, 27 delen en 252 stappen in een browser
(`scripts/bijbelreis-check.mjs`); de gegevens zelf (via `vm` in Node) en de broncode van `app.js`, css en html.

## Wat goed werkt

- Geen JavaScript-fouten op de vier apparaten. axe-core vond **0 overtredingen** (WCAG 2.2 AA-regels).
- Snel: 28 verzoeken en ca. 366 KB overdracht; eerste weergave na 0,6 s (telefoon) tot 1,4 s (desktop).
- De opzet met reisboek, stappen, Bijbeltekst (Statenvertaling) in een lade, speurtocht, afstanden en paspoort is
  begrijpelijk en werkt op alle tabbladen.
- 2.178 controleregels tegen de Statenvertaling slagen allemaal.

## Gevonden problemen (op ernst)

| # | Ernst | Probleem | Gevolg |
| --- | --- | --- | --- |
| 1 | hoog | Het tussenpunt `sinai` (een punt op de Weg naar Sur, 30,8 N) had dezelfde sleutel als de plaats **berg Sinaï** (Jebel Musa, 28,5 N). Plaatsen gaan voor tussenpunten, dus zes routes in Genesis liepen via de top van de Sinaï. | Abram naar Egypte en terug, de broers van Jozef (2×) en Jakob naar Gosen liepen op de kaart honderden kilometers om. |
| 2 | hoog | 9 verwijzingen konden niet worden gelezen (`17:1–6, 18–24`, `23–24:28`, `… en …`, twee boeken). | Bij die stappen ontbrak de knop ‘Lees het zelf in de Bijbel’. |
| 3 | hoog | Genesis had als tijd ‘ca. 2100–1800 v.Chr.’ voor het hele boek. | Suggereerde dat Genesis 1–11 in de tijd van de aartsvaders valt. |
| 4 | hoog | Kruisverwijzingen naar het Nieuwe Testament waren niet gecontroleerd (geen NT-tekst in de repo). | Mogelijk foute verwijzingen. |
| 5 | middel | Zekerheid van plaatsen: vier klassen in de data, maar in de legenda alleen ‘ligging onzeker’; Ararat stond als punt met een ring; betwiste plaatsen (Sinaï, Sodom) hadden geen alternatieven. | Kinderen en ouders zien niet wat zeker is en wat niet. |
| 6 | middel | Telefoon: kaart 54% van het scherm en met één vinger versleepbaar, dus wie de pagina wil scrollen, schuift de kaart; geen volledig scherm; legenda verborgen; schaalbalk over de stapknoppen. | Lastig te bedienen; uitleg van de kaart ontbreekt. |
| 7 | middel | Labels overlappen (Dothan/Sichem, Sinear/Ur/Eden/kameel), regiolabels over plaatsnamen. | Onleesbare kaart op sommige zoomniveaus. |
| 8 | middel | Plaatsen stonden in 11 bestanden; 5 plaatsen dubbel onder een andere sleutel (Babel, Dothan, Damascus, Ninevé, Zarfath). | Kans op tegenstrijdige gegevens. |
| 9 | middel | Geen diepe link per stap, geen ‘verder waar je was’, geen kruimelpad. | Ouders/leiders kunnen niet naar één stap verwijzen; kind weet niet waar het is. |
| 10 | middel | Personen zijn niet gekoppeld: ‘Wie is wie’ per boek, zonder familie, gebeurtenissen of plaatsen. | Verbanden (bijv. Jozef → Exodus 13:19 → Jozua 24:32) blijven onzichtbaar. |
| 11 | middel | Weetjes (‘Wist je dat?’) mengen Bijbeltekst, uitleg en historische reconstructie zonder label. | Reconstructie kan als Bijbels feit worden gelezen. |
| 12 | laag | Lade met Bijbeltekst: geen focusval, Escape gaf de focus niet terug; tabbladen zonder ‘roving tabindex’. | Toetsenbordgebruik minder prettig (WCAG 2.4.3). |
| 13 | laag | Eigen scripts 1 uur in de cache zonder versienummer. | Na een update kan kort een oude `app.js` met nieuwe inhoud draaien. |
| 14 | laag | Gebergten als ruwe vlakken, geen reliëf; geen moderne grenzen. | Minder ‘atlas’, lastiger om te zien waar het nu ligt. |
| 15 | laag | Een stempel volgt al op het openen van een stap. | Beloning niet aan lezen gekoppeld (zie vergelijking.md, principe 8). Bewust niet gewijzigd: bestaande voortgang blijft geldig. |

## Technische risico's

- **Publicatie:** de GitHub-workflow slaat de uitrol over omdat het geheim `CLOUDFLARE_API_TOKEN` ontbreekt; uitrol gaat
  handmatig via de ‘embedded’ worker (alle bestanden in de worker gebundeld, ca. 3,7 MB gzip). Elke nieuwe
  Bijbeltekst of afbeelding maakt de worker groter.
- **Voortgang** hangt aan de positie van een stap (`boek:deel:index`). Stappen herordenen wist stempels. Nu bewaakt door
  `tests/bijbelreis.test.ts` (alle 252 sleutels van 1.0 moeten blijven bestaan).
- **Geen build-stap** voor de Bijbelreis (bewust: geen framework). Kwaliteit hangt aan de controlescripts en tests.

## Bronnen voor de vergelijking en de inhoud

Zie `vergelijking.md` (andere Bijbel-apps en atlassen), `plaatsen.md` (coördinaten en zekerheid), `personen.md`,
`inhoud-*.md` (inhoudelijke correcties per boekengroep) en `ondergrond.md` (reliëf en grenzen).
