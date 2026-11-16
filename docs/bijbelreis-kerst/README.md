# Bijbelreis: het thema Kerst

Opdracht van Martijn (15-11-2026): "Werk alles voor kerst uit. Vanaf Adam in grote stappen van de geslachtsregister naar Jozef. Dan geboorte van Jezus en stukje totdat Hij 12 jaar is. Zorg dat kerst dus een speciaal onderwerp wordt (kan zijn rond de kerstperiode), moet er ook enigszins anders uitzien. Besteed hier veel tijd aan. Veel details."

Dit bestand is de overdracht: wie verder werkt (Claude, Codex of een mens) begint hier.

## Besluiten van Martijn

| Onderwerp | Besluit | Datum |
| --- | --- | --- |
| Zichtbaarheid | **Extra zichtbaar vanaf Advent tot en met 6 januari. Daarna niet weg, maar op de achtergrond.** | 15-11-2026 |
| Uiterlijk | Het thema moet er "enigszins anders" uitzien dan de rest van de atlas. | 15-11-2026 |
| Raadkoord | "Verwijs als mogelijk en logisch is naar Raadkoord." Bij Kerst: één verwijzing naar het kerstspel van Raadkoord (ook van Denckh), `https://raadkoord.nl/kerst`, bijvoorbeeld onder de inleiding van het thema of na het laatste deel: “Kerstliederen samen raden: Raadkoord Kerst”. Gewone link, `rel="noopener"`, geen target, geen logo. | 15-11-2026 |

Uitwerking van de zichtbaarheid:

- **Advent** begint op de eerste adventszondag: de vierde zondag vóór 25 december, dus de zondag die op 27 november tot en met 3 december valt (2026: 29 november; 2027: 28 november). Bereken dat per jaar; zet geen vaste datum in de code.
- **Extra zichtbaar** (eerste adventszondag t/m 6 januari): een eigen ingang op de startpagina en bovenaan in de boekenkast.
- **Op de achtergrond** (de rest van het jaar): het thema blijft bereikbaar via de boekenkast (onder ‘Thema’s’) en via de diepe links (`#kerst-…`), zonder ingang op de startpagina.
- De datum komt van het apparaat van de bezoeker. Een test moet beide standen kunnen afdwingen (bijvoorbeeld met een vaste klok in Playwright).

## Opbouw

Een eigen boek `kerst` (`public/bijbelreis/inhoud/kerst.js`, `thema: "kerst"`), met de delen in eigen bestanden:

| Bestand | Deel-id | Inhoud |
| --- | --- | --- |
| `inhoud/kerst-1.js` | `kerst-belofte` | De belofte: van Adam tot David |
| `inhoud/kerst-1.js` | `kerst-koningen` | Van David tot Jozef |
| `inhoud/kerst-2.js` | `kerst-aankondiging` | De aankondiging (Lukas 1; Mattheüs 1:18–25) |
| `inhoud/kerst-2.js` | `kerst-geboorte` | De geboorte in Bethlehem (Lukas 2:1–38) |
| `inhoud/kerst-3.js` | `kerst-wijzen` | De wijzen, Egypte en Nazareth (Mattheüs 2) |
| `inhoud/kerst-3.js` | `kerst-twaalf` | Twaalf jaar (Lukas 2:39–52) |

## Vaste regels voor dit thema

- **Alleen wat de Bijbel zegt.** Geen kersttraditie als feit: geen os en ezel, geen drie koningen (de tekst noemt geen aantal en geen koningen), geen herbergier, geen winter of 25 december. De wijzen komen ‘in het huis’ (Mattheüs 2:11). Sinds de regel ‘de gangbare uitleg hoort bij het verhaal’ (`docs/bijbelreis-uitleg/README.md`, 15-11-2026) wordt algemeen aanvaarde uitleg wel meeverteld, zonder voorbehoud: de kribbe als voederbak in een stal (Lukas 2:7, zoals de kanttekeningen, Calvijn en Henry).
- **De Heere Jezus wordt niet afgebeeld**, ook niet als Kind in de kribbe of als jongen van twaalf; God en engelen ook niet. Wat de Bijbel als zichtbaar teken noemt (de ster, het licht), mag.
- **Twee geslachtsregisters** (Mattheüs 1 en Lukas 3): volgens de gangbare lezing (uitlegregel van 15-11-2026) geeft Mattheüs de lijn van Jozef (via Salomo, de koningen) en Lukas de lijn van Maria (via Nathan); Heli is de vader van Maria. Zo verteld in `kerst-koningen` en bij `jozef_nt` in `personen.js`.
- **Sober en eerbiedig**: het eigen uiterlijk is nachtblauw met warm licht en de ster; geen kerstboom, sneeuw, kerstman of versiering.
- Verder gelden de regels van `docs/bijbelreis-reizen/schrijfopdracht.md` en `docs/bijbelreis-taferelen/README.md`.

## Wat er gebouwd is (weergave)

Bestanden: `public/bijbelreis/seizoen.js` (nieuw), `app.js`, `bijbelreis.css` (blok ‘Thema’s en het thema Kerst’, vóór de
taferelen), `public/bijbelreis.html`, en voor het boekje `boekje.js`, `boekje-inhoud.js`, `boekje-speler.js`. De inhoud
(`inhoud/kerst*.js`, de taferelen) is niet aangeraakt. De vaste woorden van de bediening (de zin van de ingang, de
knopteksten, de slotzin, de verwijzing) staan op één plek: `THEMA_UI` bovenin `app.js`.

1. **Een thema is geen Bijbelboek.** Een boek met `thema` staat niet in de boekenrij en niet tussen de 66 boeken van de
   boekenkast, maar in een eigen groep ‘Thema’s’: op de desktop een regel onder de boekenrij, op de telefoon een eigen
   groep in het blad ‘Kies een reis’, in de boekenkast een eigen rij (`.kthema`, telt niet mee bij de 66). Op de
   tijdlijn staan de delen van een thema niet tussen de Bijbelboeken (ze vertellen dezelfde tijd nog eens) maar eronder,
   onder ‘Thema: Kerst’, in de volgorde van het thema. In ‘Alle reizen’ staat het thema als laatste groep onder
   ‘Thema: Kerst’, in het paspoort als laatste blad onder ‘Thema’s’. **Stempels van Kerst tellen gewoon mee** als
   reisstempels (het totaal is het aantal stappen van alle boeken en thema’s samen): elke stap geeft een stempel, en
   een stempel die niet meetelt zou onbegrijpelijker zijn dan een totaal dat 59 hoger is. In het boekje staat Kerst in
   het keuzescherm onder ‘Thema’s’ (`optgroup`), na de Bijbelboeken.
2. **Een thema is één eigen reis.** ‘Vorige’ en ‘Verder’ blijven binnen het thema (`reeks`, `volgendDeel`, `vorigDeel`
   in `app.js`): na de laatste stap van een deel gaat ‘Verder’ naar het volgende Kerst-deel (‘Naar Wijzen ▶’), na de
   laatste stap van het laatste deel staat er ‘Einde van de kerstreis’ met een slotzin. Openbaring loopt niet door in
   Kerst en Kerst begint niet na Openbaring. In de intro van elk deel staat ‘Kerst · deel 3 van 6’ met de zes delen op
   een rij (`#sThema`; een deel waarvan alle stappen gezien zijn, is afgevinkt). Op de telefoon: zie punt 6.
3. **Oude en Nieuwe Testament per deel.** In een thema bepaalt het veld `nt` van het deel de reiziger (kameel of stip)
   en de streeknamen (`ntNu` in `app.js`): `kerst-belofte` en `kerst-koningen` spelen in het Oude Testament, de vier
   latere delen in het Nieuwe. Het boekje doet hetzelfde (de kaarten van die twee delen zijn met `ot` gemerkt).
4. **Het eigen uiterlijk** (`body[data-thema="kerst"]`): aan zolang je in het thema bent (Reis, Hoe ver?, Wie is wie en
   de speurtocht van Kerst), uit bij Verhalen, Tijdlijn en Paspoort, die over de hele Bijbel gaan. Dieper nachtblauw in
   de kop met een paar sterren en één ster achter de titel (ademt traag; staat stil bij ‘minder beweging’), een smalle
   strook avondlucht boven de stapkaart in plaats van de gekleurde rand, lamplicht in de hoek van de kaart, de
   hoofdknop in nachtblauw met warm licht, de ster in het kruimelpad, de kiesregel en de stappenbalk. De kaart en de
   tekeningen houden hun eigen kleuren (`#map` en `.tf-svg` krijgen het gewone blauw terug), zodat routes en taferelen
   niet veranderen. Kleuren: `--kerst-nacht`, `--kerst-nacht-2`, `--kerst-schemer`, `--kerst-licht`,
   `--kerst-licht-zacht`, `--kerst-licht-diep`; de ster is `--kerst-ster` (CSS) en `STER` (`app.js`), geen afbeelding.
   Op de telefoon ziet het er anders uit: zie punt 6.
5. **De verwijzing naar Raadkoord** staat alleen in het thema, op twee plekken: in de intro van het eerste deel en na
   de laatste stap van het laatste deel (`#sOok`): “Kerstliederen samen raden? Raadkoord Kerst, ook van Denckh”, een
   gewone link naar `https://raadkoord.nl/kerst`, `rel="noopener"`, geen `target`, geen logo. Niet op de startpagina.
6. **Op de telefoon en de tablet (tot 900 px): Kerst in het stapblad.** In de reis is de kaart het scherm en ligt de
   stap in een stapblad over de onderkant van de kaart (‘Kaart voorop’, `docs/bijbelreis-audit/telefoon.md` §4). Kerst
   voegt daar niets aan toe wat hoogte kost: het korte blad is in het thema precies even hoog als daarbuiten (de test
   meet dat), dus de kaart blijft even groot.
   - **Korte stand.** De kleine regel bovenaan zegt waar je bent, met de ster ervoor: in een stap ‘★ Kerst › Bethlehem ·
     2 van 10’, in de intro van een deel ‘★ Kerst · deel 4 van 6’. Een tik opent ‘Kies een reis’, met de zes delen van
     Kerst. Past de regel niet, dan valt ‘Kerst ›’ weg, zoals bij een Bijbelboek; de ster blijft.
   - **Open stand** (‘Lees meer’). Stap: zoals elke stap (tafereel, tekst, personen, ‘Lees in je Bijbel’, de
     knoppen). Intro van een deel: de tekst, dan de rij met de zes delen (`#sThema`), dan personen en knoppen. Na de
     laatste stap van het laatste deel: onderaan de slotzin (`#sSlot`) en de verwijzing naar Raadkoord Kerst (`#sOok`);
     de algemene regel ‘Ook van Denckh: Raadkoord’ onder de makersvermelding valt dan weg, zodat er niet twee keer
     Raadkoord onder elkaar staat. In de intro van het eerste deel staat `#sOok` onder de knoppen.
   - **Uiterlijk.** Bovenaan het blad een smalle strook avondlucht met sterren en een lijn lamplicht (7 px, achter de
     greep; dezelfde strook als boven de stapkaart op de desktop); titel, ‘Lees meer’, de hoofdknop en de knoppen op de
     kaart (− +, ‘Hele reis’, ‘Kaart’) in het nachtblauw van het thema. De kop is één regel met rechts het reisniveau:
     daar staan geen losse sterren (ze vielen over de knop), en de ster staat niet achter de titel (dan paste ‘Samen
     ontdekken’ er niet meer naast) maar klein boven de kameel; onder 340 px breed is er in de kop geen ster. De kaart
     zelf blijft zoals ze is.
   - **Keuzeblad.** ‘Thema’s’ is een eigen groep: in het seizoen bovenaan, in nachtblauw met de ster; daarbuiten onder
     de Bijbelboeken, zonder accent.

## Hoe het seizoen werkt

- `seizoen.js` rekent alleen: `BR.seizoen.eersteAdvent(jaar)` (de vierde zondag vóór 25 december) en
  `BR.seizoen.kerstTijd(datum)`: waar van de eerste adventszondag 0:00 uur tot en met 6 januari, in de tijd van het
  apparaat. `app.js` vraagt het één keer bij het laden en zet dan `body[data-seizoen="kerst"]`.
- **In het seizoen**: bovenaan Verhalen (direct onder ‘Verder met’, of onder de keuze van het reisniveau bij een eerste
  bezoek) staat één kaart (`#seizoen`): de titel ‘Kerst: van Adam tot Bethlehem’, één zin en één knop. Zonder voortgang
  ‘Begin de kerstreis’ (naar de intro van het eerste deel); met voortgang ‘Verder met de kerstreis’ en de regel ‘Je bent
  bij deel 3 van 6: Aankondiging’ (naar de laatst geopende stap van het thema, anders de verste); alles gezien: ‘Bekijk
  de kerstreis nog eens’. Bij Samen ontdekken staat dezelfde kaart met een kortere zin. Verder staat ‘Thema’s’ dan
  vóór de Bijbelboeken (boekenrij, keuzeblad, boekenkast), met Kerst in nachtblauw met de ster.
- **Buiten het seizoen**: geen ingang op de start; ‘Thema’s’ staat ná de Bijbelboeken, zonder accent. De diepe links
  (`#kerst`, `#kerst-geboorte`, `#kerst-geboorte/3` …) werken altijd. Was een Kerst-stap het laatste wat je opende, dan
  gaat de gewone knop ‘Verder met: …’ daarheen (in het seizoen doet de ingang dat).
- De opslag is niet veranderd: stapsleutels `kerst:<deel>:<index>`, `gezien`, `laatst`, `huidig`. Er is geen nieuwe sleutel.

## Testen

- Unit: `npx vitest run --testTimeout=120000`; voor dit thema `tests/bijbelreis-kerst.test.ts` (de grenzen van het
  seizoen, de eerste adventszondag voor 2020–2080, thema niet tussen de Bijbelboeken, `nt` per deel, het boekje).
- E2E: `e2e/bijbelreis-kerst.spec.ts`, op desktop, mobiel en tablet. Elke test zet een vaste klok
  (`page.clock.install`, 10 december 2026 of 1 maart 2027) en opent elke pagina vers (eerst `about:blank`).
  `npm run build && npx vite preview --port 8827 --strictPort`, daarna
  `E2E_BASE_URL=http://localhost:8827 npx playwright test e2e/bijbelreis-kerst.spec.ts --trace off`.
- Met de hand een andere datum proberen: zet de klok van het apparaat, of in de console van de browser
  `BR.seizoen.kerstTijd(new Date(2026, 11, 10))`.
- **Referentiebeelden** (`e2e/bijbelreis-visueel.spec.ts`): die test rekent met een vaste datum buiten het seizoen
  (1 september 2026, `VASTE_DATUM`), zodat de beelden niet afhangen van de dag waarop ze gemaakt of vergeleken worden
  (in het seizoen staat op ‘start’ de ingang en staat ‘Thema’s’ boven de boekenrij). Alleen de datum verschuift
  (`Date` zonder argumenten en `Date.now`); de klok loopt door. Niet `page.clock.setFixedTime` gebruiken: bij een
  stilstaande klok komen de kaartvluchten van Leaflet nooit aan en blijft de kaart op het overzicht staan.
- Schermbeelden van Kerst op de telefoon (390×664 en drie andere maten, met metingen van het korte blad):
  het script `shots.cjs` van de bouw gebruikte `page.clock.install({ time })`, net als de e2e-test.

## Werkwijze en stand

1. Drie schrijvers, elk twee delen, met een controlebestand tegen de Statenvertaling en notities met voorstellen voor de tekenaar (`docs/bijbelreis-reizen/werk/kerst-*.notities.md`).
2. Samenvoegen; personen en plaatsen ontdubbelen.
3. Tekenaars: taferelen bij de stappen.
4. Het eigen uiterlijk en de ingang (zie de besluiten hierboven); het boek heeft delen uit het Oude én het Nieuwe Testament, dus de reiziger (kameel of stip) en de streeknamen moeten per deel kunnen verschillen (`nt` op het deel). **Gebouwd op 15-11-2026**, zie ‘Wat er gebouwd is’.
5. Tweede lezer over alle zes delen (verslag: `docs/bijbelreis-reizen/werk/kerst.review.md`).
6. Tests, referentiebeelden, PR, uitrol naar beide adressen, controle op productie, releaselog.
