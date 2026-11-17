# Bijbelreis in andere talen

Besluit van Martijn (17-11-2026): de Bijbelreis wordt meertalig, Engels eerst. De King James Version (KJV, publiek
domein) is voor het Engels wat de Statenvertaling voor het Nederlands is: de basis voor korte letterlijke citaten en de
controle van verwijzingen.

Stand nu: **fase 0 (fundament) en fase 1 (Engelse proef met 10 geschiedenissen)**. Alle Engelse tekst heeft status
`concept`: een reviewconcept, nog niet door een mens gecontroleerd. De proef is niet vindbaar (zie [Proefstatus](#proefstatus)).

## Adressen

| Adres | Wat |
| --- | --- |
| `https://bijbelreis.nl/en/` | de atlas in het Engels (lokaal: `/bijbelreis/en/`) |
| `/en/verhalen` | overzicht van de geschiedenissen (alleen de vertaalde) |
| `/en/verhaal/<nr>-<slug>` | één geschiedenis, bijv. `/en/verhaal/26-dry-through-the-red-sea`; `/en/verhaal/26` en een oude slug geven een 301 naar het goede adres |
| `/en`, `/bijbelreis/en/…` | 301 naar `/en/` |
| `/en/bijbelreis/lessen` | bestaat niet: de lesroutes zijn er nog niet in het Engels (404) |

Diepe links werken zoals in het Nederlands: `/en/#v26`, `/en/#uittocht/6`, `/en/#daniel/8`.

## Hoe het werkt

**Het Nederlands blijft de bron en blijft ongewijzigd.** De Nederlandse pagina, gegevens en service worker zijn
hetzelfde als vóór de talen (gecontroleerd met de bestaande tests en de visuele referentietest). Een andere taal is een
laag over de Nederlandse gegevens; de sleutels zijn de Nederlandse sleutels (`boek:deel:index`, geschiedenisnummer,
plaats-id).

| Onderdeel | Bestand | Wat het doet |
| --- | --- | --- |
| Vlag | `shared/bijbelreis.ts` → `BIJBELREIS_TALEN` | welke talen er zijn en of ze openbaar zijn. **De enige plek** voor de proefstatus. |
| Tekstboek | `public/bijbelreis/taal/<taal>.js` | `BR.taalBoek.<taal>`: locale (`en-GB`), paginakop, de proefmelding, het woordenboek van de vaste teksten (sleutel = de Nederlandse tekst, zoals gettext), patronen voor teksten met een getal of naam erin, teksten die afhangen van de plek (`binnen`), en welke scripts en onderdelen er in deze taal (nog) niet zijn (`zonder`). |
| Vertaler | `public/bijbelreis/taal/taal.js` | `BR.taal.t(tekst, waarden)` en een `MutationObserver` die zichtbare tekst en `aria-label`/`title`/`placeholder`/`alt`/`data-tip` vertaalt. Op de Nederlandse pagina doet hij niets behalve de taallinks. |
| Inhoud | `public/bijbelreis/taal/<taal>/*.js` | `BR.vertaling.<taal>`: boeknamen, plaatsen, personen, delen, stappen, geschiedenissen; per niveau `taal/<taal>/niveaus/{a,b,c}.js`. |
| Laag | `public/bijbelreis/taal/laag.js` | legt de vertaling over de Nederlandse gegevens vóór `app.js` start. Wat niet vertaald is, verdwijnt (geschiedenissen staan in de lijst als ‘Not yet available in English’; een niet vertaalde stap in een vertaald deel krijgt een Engelse titel en de tekst `nogNiet`). Er komt nooit Nederlandse inhoud op een Engelse pagina. |
| Stijl | `public/bijbelreis/taal/taal.css` | proefmelding, taalkeuze, en verbergt in een andere taal wat nog niet bestaat (Vandaag, lesroutes, ander werk van de maker). |
| Bouw | `scripts/bijbelreis-talen.mjs` | maakt bij `npm run build` (via `scripts/postbuild.mjs`) `dist/client/bijbelreis/<taal>/index.html` uit `public/bijbelreis.html`: `lang`, titel, beschrijving, canonical, `hreflang`, `robots`, manifest, de vaste HTML-teksten vooraf vertaald. Meldt welke teksten nog geen vertaling hebben. |
| Verhaalpagina's | `scripts/bijbelreis-verhalen.mjs` | ook `bijbelreis/<taal>/verhaal/<nr>-<slug>.html` en `bijbelreis/<taal>/verhalen.html`, met `lang`, canonical en `hreflang` naar de Nederlandse pagina. |
| Worker | `worker/bijbelreis-app.ts` | de routes hierboven; `X-Robots-Tag: noindex, nofollow` en geen sitemap-regels zolang de taal niet openbaar is. |
| Inbedden | `scripts/embed-assets.mjs` | neemt `bijbelreis/<taal>/`, `bijbelreis/taal/` en `bijbelreis-sw-<taal>.js` mee in de worker. |

Kleine haken in bestaande code (gedrag in het Nederlands byte voor byte gelijk): `app.js` gebruikt `BR.taal.locale`
voor datums en getallen, `tt()` voor drie deelteksten, `BR.taal.startDeel`/`site`/`groepen` waar die bestaan, en het
paspoort telt met `G[i].nr` (was `i + 1`, wat alleen klopt als alle geschiedenissen er zijn); `niveaus.js` laadt de
niveauteksten uit `BR.taal.niveaus`; `pwa.js` registreert per taal een eigen service worker.

**Voortgang is gedeeld.** `localStorage` `bijbelreis:*` is voor alle talen dezelfde: stempels, niveau en gelezen
geschiedenissen gaan mee als je wisselt. De taalkeuze is een gewone link (NL | EN) die het `#…`-deel meeneemt; er is
geen automatische doorverwijzing op browsertaal.

### App en offline: een eigen set per taal

Gekozen: **een eigen service worker per taal** (`/bijbelreis-sw-en.js`, scope `/en/`, caches `bijbelreis-en-schil-<versie>`
en `bijbelreis-en-beelden`), gemaakt uit hetzelfde sjabloon als de Nederlandse (`scripts/bijbelreis-pwa.mjs`, `BOUW.taal`).
Waarom niet één gedeelde schil:

- de Nederlandse versie (en dus de update-melding in de Nederlandse app) verandert niet als er Engelse tekst bijkomt,
  en andersom;
- een set hoort altijd bij één versie van één taal: er kan nooit een Engelse pagina met Nederlandse niveauteksten (of
  omgekeerd) uit de cache komen;
- de Engelse set laat weg wat er in het Engels niet is (taferelen, foto's, Vandaag, Kerst) en is daardoor kleiner;
- de Nederlandse service worker (`/bijbelreis-sw.js`, scope `/`) is precies dezelfde als vóór de talen.

Nadeel: wie beide talen gebruikt, heeft twee caches (Leaflet en de kaart staan dan dubbel; enkele MB's). Een
geïnstalleerde app is per taal: het Engelse manifest heeft `start_url` en `scope` `/en/`.

## Proefstatus

In `shared/bijbelreis.ts`:

```ts
export const BIJBELREIS_TALEN = { en: { naam: "English", openbaar: false } };
```

Zolang `openbaar: false`:

- de Engelse pagina's hebben `<meta name="robots" content="noindex, nofollow">` en de worker stuurt `X-Robots-Tag: noindex, nofollow`;
- `/sitemap.xml` heeft geen `/en/`-adressen;
- de Nederlandse pagina is onveranderd: geen taalkeuze, geen `hreflang` naar het Engels. De Engelse pagina is alleen
  bereikbaar via het adres zelf;
- bovenaan de Engelse pagina staat een melding dat het een reviewconcept is, met een link naar de Nederlandse versie.

Na akkoord van Martijn: `openbaar: true` zetten (één regel). Dan krijgt de Nederlandse pagina de taalkeuze NL | EN en
`hreflang`-links, verdwijnt `noindex` en komen de Engelse adressen in de sitemap. De proefmelding blijft tot de review
klaar is (`melding` in `taal/en.js`).

## De KJV

| | |
| --- | --- |
| Bron | eBible.org, ‘King James Version + Apocrypha’, id `eng-kjv`, USFM: <https://ebible.org/Scriptures/eng-kjv_usfm.zip> (pagina: <https://ebible.org/Scriptures/details.php?id=eng-kjv>) |
| Licentie | publiek domein (de gestandaardiseerde tekst van 1769). In het Verenigd Koninkrijk geldt voor drukken van de KJV nog het Kroonrecht (letters patent); dat gaat over drukken en uitgeven in het VK, niet over korte citaten in een website. |
| Versie | het zipbestand van 17-11-2026, sha256 `9d37aa78180ceefd5e4aeeaedceccf16f21484e5eb17d5662e8beff31bc3d8a5` (eBible: ‘Last updated 2026-11-15’) |
| Omvang | 66 boeken, 31.102 verzen, in `data/kjv/<boek>.json` (zelfde vorm als `data/statenvertaling/`) |
| Import | `python3 -I scripts/bijbelreis-kjv.py <pad naar eng-kjv_usfm.zip>` |
| Niet gekozen | de KJV-bestanden van scrollmapper/bible_databases en de KJVPCE: daarin staat ‘Lord’ waar de gedrukte KJV ‘LORD’ heeft (de Godsnaam), en de herkomst is minder duidelijk. |

De KJV staat alleen in `data/kjv/` voor de controle; hij zit niet in de app (zoals de Statenvertaling in
`data/statenvertaling/`; de Bijbeltekst-lade is er in het Engels nog niet).

### Controle

```sh
node scripts/bijbelreis-talen-controle.mjs en      # alle Engelse inhoud: sleutels, geen Nederlands, verwijzingen, citaten
node scripts/bijbelreis-kjv.mjs "Exodus 14:13–14"   # verzen opzoeken
```

De controle (ook in `tests/bijbelreis-talen.test.ts`) eist:

- elke vertaalde stap, elk deel en elke geschiedenis bestaat in de Nederlandse gegevens; een vertaalde geschiedenis heeft alle drie de niveaus;
- geen Nederlands in vertaalde velden (`scripts/bijbelreis-talen-woorden.mjs`: een woord is Nederlands als het in de Nederlandse bronnen staat en niet in de KJV of de Engelse bestanden);
- elke verwijzing bestaat in de KJV (KJV-nummering);
- elk citaat tussen ‘…’ staat letterlijk in de KJV, in de verzen van de eigen verwijzing (of een verwijzing in dezelfde tekst). Hoofdletter aan het begin en leestekens aan het eind mogen afwijken, weglatingen met ‘…’.

Stand 17-11-2026: 10 geschiedenissen, 10 delen, 19 volledige stappen, 657 verwijzingen, 302 citaten, 311 plaatsen, 15 personen, **0 fouten**.

### Versnummering: Statenvertaling ↔ KJV

De Engelse tekst gebruikt KJV-nummering. Bij het vertalen van een verwijzing dus niet blind overnemen. Verschillen
(uitgerekend uit `data/statenvertaling/` en `data/kjv/`):

- **Psalmen met een opschrift** (62 psalmen): de Statenvertaling telt het opschrift als vers 1, de KJV niet. Psalm 77:20–21 SV = 77:19–20 KJV, 83:10–12 = 83:9–11, 89:10 = 89:9, 65:3 = 65:2, 20:8 = 20:7, 42:8 = 42:7, 3:9 = 3:8. Bij Psalm 34, 57 en 142 heeft het opschrift in de KJV geen nummer.
- **Daniël 5/6**: SV Daniël 6:1 = KJV 5:31; SV 6:x = KJV 6:(x−1).
- **Jesaja 8/9**: SV 9:1 = KJV 9:2, 9:5 = KJV 9:6.
- **Micha 4/5**: SV Micha 5:1 = KJV 5:2.
- Verder andere grenzen bij Exodus 5/6, 1 Samuël 23/24, 1 Koningen 22, Nehemia 8, Job 38–41, Prediker 4/5, Hosea 1/2 en 11–14, Haggaï 1/2, Johannes 1 (SV 52 verzen, KJV 51), Romeinen 7, 3 Johannes, Openbaring 12.

## Namen en schrijfwijze (Engels)

- Brits Engels (`en-GB`): colour, honour, travelled; datums als ‘17 November 2026’.
- Namen van personen, plaatsen en boeken zoals in de KJV.
- Over God eerbiedig: ‘the LORD’ (waar de KJV dat heeft), ‘God’, ‘the Lord Jesus’; in eigen zinnen He/His/Him met
  hoofdletter voor God en de Heere Jezus. In citaten precies de KJV (daar staan ze met kleine letter).
- Citaten: letterlijk KJV, tussen ‘enkele aanhalingstekens’, met verwijzing.

Een selectie (de volledige lijsten staan in `taal/en.js` en `taal/en/inhoud.js`):

| Nederlands (HSV/SV) | Engels (KJV) |
| --- | --- |
| Mozes, Mirjam, Jozua | Moses, Miriam, Joshua |
| Debora, Pura | Deborah, Phurah |
| Jona, Daniël, Noach | Jonah, Daniel, Noah |
| Nebukadnezar, Farao, Herodes | Nebuchadnezzar, Pharaoh, Herod |
| Petrus, Johannes, Saulus | Peter, John, Saul |
| de HEERE / de Heere Jezus | the LORD / the Lord Jesus |
| Richteren, 1 Samuël, Mattheüs, Handelingen | Judges, 1 Samuel, Matthew, Acts |
| Jesaja, Ezechiël | Isaiah, Ezekiel |
| Schelfzee | Red Sea |
| Berseba, Sichem, Sukkoth, Pniël | Beer-sheba, Shechem, Succoth, Peniel |
| Kades-Barnea, Raämses, Pi-Hachiroth | Kadesh-barnea, Rameses, Pi-hahiroth |
| Silo, Rama, Mizpa, Gibea | Shiloh, Ramah, Mizpeh, Gibeah |
| Eikdal, Sidon, Tyrus, Joppe | Valley of Elah, Zidon, Tyre, Joppa |
| Babel, Susan, Ekbatana | Babylon, Shushan, Achmetha (Ecbatana) |
| Kapernaüm, Bethanië, Olijfberg | Capernaum, Bethany, Mount of Olives |
| Efeze, Korinthe, Athene | Ephesus, Corinth, Athens |
| Malta, Schone Havens, Appiusmarkt | Melita (Malta), Fair Havens, Appii forum |

Alle 311 plaatsnamen zijn vertaald (214 wijken af van het Nederlands).

## De proef: wat er in het Engels is

Tien geschiedenissen, verspreid over OT en NT en over de soorten (schepping, wonder, gelijkenis, bekering, held, profeet):

| Nr | Engels | Deel op de kaart |
| --- | --- | --- |
| 1 | God creates heaven and earth | Genesis · The beginning |
| 26 | Dry through the Red Sea | Exodus · The exodus |
| 43 | Gideon and the three hundred | Judges · Deborah and Gideon |
| 52 | David and Goliath | 1 Samuel · Saul and David |
| 69 | Jonah flees from the LORD | Jonah |
| 75 | Daniel in the lions’ den | Daniel |
| 83 | The birth of the Lord Jesus in Bethlehem | The Lord Jesus · Birth and childhood |
| 94 | The Lord Jesus calms the storm | The Lord Jesus · Around the Sea of Galilee |
| 112 | The lost son | The Lord Jesus · On the way to Jerusalem |
| 143 | Saul on the road to Damascus | Acts · Paul: from Damascus to Philippi |

Per geschiedenis: de basistekst, de drie niveaus
(Discover together / On my own / Explore further) met vragen, de verhaalpagina, de kernwoorden. Op de kaart: de tien
delen met intro, ‘Wie is wie’, speurtocht-vragen en alle staptitels; 19 stappen volledig (de stappen waar de
geschiedenissen naar wijzen), de andere 77 stappen tonen ‘This part of the journey is not yet available in English’.
Verder: alle plaatsnamen (25 plaatsen met uitleg), 15 personen, de hele interface (tabbladen, paspoort, tijdlijn,
speurtocht, Hoe ver?, instellingen, hulpteksten).

**Nog niet in het Engels** (verborgen of weggelaten, niet half Nederlands): Vandaag, de taferelen (tekeningen bij
stappen), foto's, seizoen, de wereldkaart-ingang, Kerst, de lesroutes, de Bijbeltekst-lade, de andere 140
geschiedenissen en de andere 58 delen, de hulp- en privacypagina, de aanvraagmail.

## Een vertaling toevoegen of uitbreiden

1. **Een geschiedenis**: voeg in `taal/en/verhalen.js` een item toe met het Nederlandse nummer (`nr`), en in
   `taal/en/niveaus/{a,b,c}.js` de drie niveaus. Vertaal de stappen waar de geschiedenis naar wijst in
   `taal/en/stappen.js` (sleutel `boek:deel`, stap op index; nooit herordenen).
2. **Een deel van de kaart**: in `taal/en/stappen.js` het deel (`n`, `short`, `intro`, `who`, `quiz`, `trips`) en de
   stappen. Plaatsen met uitleg en personen in `taal/en/inhoud.js`.
3. **Vaste tekst in de interface**: nieuwe Nederlandse tekst in `app.js` of de HTML krijgt een regel in `woorden` of
   `patronen` van `taal/en.js`. `npm run build` meldt teksten zonder vertaling.
4. Status `concept` laten staan tot een mens het heeft gereviewd; dan per geschiedenis `status: "gecontroleerd"`.
5. Controleren: `node scripts/bijbelreis-talen-controle.mjs en`, `npx vitest run tests/bijbelreis-talen.test.ts`, en
   `e2e/bijbelreis-engels.spec.ts`.

**Een nieuwe taal** (bijv. `de`): een regel in `BIJBELREIS_TALEN` (`openbaar: false`), `taal/de.js` (kopie van de
structuur van `taal/en.js`), `taal/de/…` voor de inhoud, een controletekst in `data/<bijbel>/` met een eigen
`refFout`/`citaatKlopt` (nu KJV-specifiek in `scripts/bijbelreis-kjv.mjs`), en de routes werken vanzelf (`/de/…`).

## Checklist voor de reviewer

Per geschiedenis (status `concept` → `gecontroleerd`):

- [ ] Klopt de inhoud met de Nederlandse tekst? Niets toegevoegd, niets weggelaten, geen eigen details.
- [ ] Eerbiedig: ‘the LORD’, ‘the Lord Jesus’, He/His met hoofdletter in eigen zinnen; geen grapjes.
- [ ] Citaten letterlijk KJV (de controle doet dit automatisch; kijk of het citaat bij de zin past).
- [ ] Verwijzingen in KJV-nummering (Psalmen met opschrift, Daniël 6, Jesaja 9, Micha 5).
- [ ] Namen in KJV-spelling, overal hetzelfde.
- [ ] Niveau a (4–6 jaar, samen lezen): heel korte zinnen, gewone woorden. Niveau b (zelf lezen): duidelijk voor 8–10. Niveau c: voor 10–14, mag moeilijker.
- [ ] Vragen: één goed antwoord, de foute antwoorden zijn echt fout, de uitleg verwijst naar de juiste tekst.
- [ ] Brits Engels, natuurlijke zinnen (een moedertaalspreker leest mee).
- [ ] Bijzonder: de vergelijking met Nederland in ‘Hoe ver?’ (een Engelse lezer kent Nederland niet), de merknaam ‘Bible Journey’.

## Schatting: de hele Bijbelreis in het Engels

Gemeten (woorden in de bronbestanden, 17-11-2026):

| Inhoud | Nederlands, totaal | In de proef |
| --- | --- | --- |
| Geschiedenissen (basistekst) | 150 · 65.800 woorden | 10 · 4.300 NL → 4.400 EN |
| Niveaus a, b, c | 3 × 150 · 133.000 woorden | 3 × 10 · 8.800 NL → 9.400 EN |
| Stappen op de kaart | 619 · 99.300 woorden | 19 volledig + 96 titels · 3.700 EN |
| Delen (intro, wie, speurtocht) | 68 · 36.500 woorden | 10 · 5.200 EN |
| Boeken, personen, plaatsen | 11.300 + 15.500 + 12.500 | 8 boeken, 15 personen, 311 namen + 25 uitleg · 3.500 EN |
| Interface (eenmalig) | — | 3.300 EN (af) |
| Kerst, Vandaag, taferelen, foto's, lessen | ca. 40.000 (ruw, incl. code) | — |

Totaal Engels in de proef: **ca. 30.500 woorden** (incl. de eenmalige interface). Wat er nog moet: **ca. 350.000
Nederlandse woorden** voor de atlas, plus ca. 30–40.000 voor Kerst, Vandaag, taferelen en lessen. De proef is dus
ongeveer 8 % van het geheel.

Uren (dit zijn vuistregels uit het vertaalvak, niet gemeten; alleen de woordaantallen zijn gemeten):

- **Conceptvertaling door AI** zoals in deze proef: ca. 12–15 sessies van de omvang van deze proef, elk met de
  automatische KJV-controle. Dat is het kleinste deel van het werk.
- **Menselijke review** (Nederlands naast Engels, inhoud en toon, ca. 600–1.000 woorden per uur): 350–600 uur.
- **Moedertaalcontrole** (vlot en natuurlijk Engels, ca. 1.500–2.000 woorden per uur): 175–250 uur.
- Ter vergelijking: helemaal door een mens vertalen (300–400 woorden per uur) is 900–1.200 uur.
- Alleen de proef reviewen: 30.000 woorden ≈ 40–60 uur.

Verstandige volgorde: eerst de proef laten reviewen (leert hoeveel er aan de AI-concepten verandert), dan per Bijbelboek
uitbreiden: geschiedenissen + niveaus + de stappen waar ze naar wijzen; de overige stappen daarna.

## Volgende talen: welke Bijbel (publiek domein)

Gecontroleerd op 17-11-2026 in de lijst van eBible.org (<https://ebible.org/Scriptures/copyright.php>) en bij Project Gutenberg:

| Taal | Bijbel | Status | Machineleesbaar |
| --- | --- | --- | --- |
| Duits | **Lutherbibel 1912** | publiek domein (eBible `deu1912`) | ja, USFM bij eBible |
| Duits | Schlachter 1951 | **niet** publiek domein: eBible noemt de Genfer Bibelgesellschaft als rechthebbende (`deu1951`). Alleen met toestemming. | — |
| Duits | (alternatief) Unrevidierte Elberfelder 1905 | publiek domein (eBible `deuelo`) | ja |
| Spaans | **Reina-Valera 1909** | publiek domein (eBible `spaRV1909`) | ja |
| Frans | **Louis Segond 1910** | publiek domein (eBible `fraLSG`) | ja |
| Portugees | **Almeida, Edição Revista e Corrigida, Lissabon 1911** (eerste druk 1900, Depósito das Escripturas Sagradas) | Project Gutenberg #62383 (<https://www.gutenberg.org/ebooks/62383>) geeft ‘public domain in the USA’. Uitgave van een bijbelgenootschap van meer dan 100 jaar oud, Almeida overleden 1691; voor de EU waarschijnlijk ook vrij, maar laten bevestigen. | alleen platte tekst (oude spelling: ‘portuguez’, ‘Psalmos’); zelf omzetten naar verzen |
| Portugees | Bíblia Livre (eBible `porbr2018`, op basis van Almeida 1819) | **geen** publiek domein: CC BY 4.0 (2018) | ja |

eBible heeft geen Almeida-uitgave als publiek domein; de 1911-tekst bij Project Gutenberg is de enige die we
aantoonbaar vrij vonden. Voor de reformatorische doelgroep in het Duits is de Schlachter gangbaar, maar daar is
toestemming voor nodig; de Luther 1912 is de vrije keuze.

## Open punten

- **Review** van alle Engelse tekst (status `concept`), door iemand die het Nederlands en de KJV kent, en een moedertaalspreker.
- **Merknaam**: de Engelse pagina heet nu ‘Journey through the Bible’ / ‘Bible Journey’. Besluit van Martijn nodig.
- **Openbaar maken**: `openbaar: true` in `shared/bijbelreis.ts`, pas na akkoord van Martijn.
- ‘Hoe ver?’ vergelijkt afstanden met Nederland; voor Engelse lezers is een andere vergelijking misschien beter.
- Niet in het Engels: Vandaag, taferelen, foto's, wereldkaart, Kerst, lesroutes, de Bijbeltekst-lade, hulp, privacy, aanvraagmail.
- `/en/` deelt het domein met de Nederlandse site; een eigen domein is een infrastructuurkeuze (niet gedaan).
