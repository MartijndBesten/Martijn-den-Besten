# De wereld in die tijd (17-11-2026)

Een interactieve, geanimeerde laag in de Bijbelreis: **levenslijnen** (wie leefde tegelijk, en hoe lang?), een
**kaart die met de tijd meebeweegt** (rijken die groeien en verdwijnen) en **wat er tegelijk gebeurde**. De perioden:

| Periode | Bestand | Wat |
| --- | --- | --- |
| Van Adam tot Noach | `public/bijbelreis/wereld/perioden/adam-noach.json` | Genesis 5 (+ 7, 9, 11): dertien levenslijnen in jaren na de schepping, berekend uit de Masoretische tekst (= Statenvertaling). Geen kaart, met uitleg waarom. |
| Daniël en Babylon | `public/bijbelreis/wereld/perioden/daniel-babylon.json` | 627–515 v.Chr.: zeven rijken met 36 sleutels, 14 personen, 12 gebeurtenissen, 13 steden. Bronnen en keuzes: [`daniel-bronnen.md`](daniel-bronnen.md). |
| David en Salomo | `public/bijbelreis/wereld/perioden/david-salomo.json` | ca. 1050–920 v.Chr. (reconstructie, as ‘bij benadering’): Israël en de buurvolken, 10 gebieden met 27 sleutels, 9 personen, 10 gebeurtenissen, 12 steden; v50–v62. Bronnen en keuzes: [`david-salomo-bronnen.md`](david-salomo-bronnen.md). |
| Israël, Juda en Assyrië | `public/bijbelreis/wereld/perioden/israel-assyrie.json` | 880–681 v.Chr.: Assyrië groeit, Israël tot 722, Aram tot 732; 6 gebieden met 34 sleutels, 13 personen, 9 gebeurtenissen, 9 steden; v63–v67, v69, v70, v72. Bronnen en keuzes: [`israel-assyrie-bronnen.md`](israel-assyrie-bronnen.md). |

De vlag staat **aan** (zie §4): de uitnodiging staat bij de gekoppelde verhalen.

## 1. Architectuur

```
bijbelreis.html ── wereld/ingang.js   (altijd geladen, ca. 9 kB: vlag, register, uitnodiging, openen/sluiten, adres)
                      │  bij openen:
                      ├─ wereld/wereld.css
                      ├─ wereld/kern.js     (rekenkern zonder scherm: tijdas, overlap, gebieden interpoleren, controle)
                      ├─ wereld/wereld.js   (de laag: SVG-levenslijnen, Leaflet-kaart, lijst, bediening)
                      └─ wereld/perioden/<id>.json
app.js ── BR.laag (laagOpen/laagDicht), BR.ondergrond (dezelfde kaartondergrond), BR.atlas (verhaal openen)
```

**Waarom een laag in de atlas en geen eigen pagina** (zoals `lessen.html`): Leaflet, de ondergrond (`geo.json`,
`toen.json`, reliëf), de plaatsen, personen en geschiedenissen zijn al geladen; ‘terug’ moet exact in het verhaal
uitkomen (zelfde scroll, niveau, voortgang); en offline werkt het meteen mee in dezelfde app-schil. Een eigen pagina had
alles dubbel geladen en een eigen route in de Worker nodig gehad.

- **Openen en sluiten** gaan via de bestaande geschiedenis-mechaniek van `app.js` (`laagOpen`/`laagDicht`/`popstate`):
  de laag is een ‘venster’ met een eigen plek in de browsergeschiedenis. Terug (knop, Escape, terugveeg of browserknop)
  sluit de laag; het verhaal eronder is nooit weggeweest, dus scroll, niveau en voortgang blijven precies gelijk.
  `laagBoven`/`laagSluit` kennen het venster `wereld`.
- **Adres**: `#wereld/<periode>/<jaar>` (het jaar zoals op de as, bij v.Chr. zonder min), bijv.
  `https://bijbelreis.nl/#wereld/adam-noach/987` of `#wereld/daniel-babylon/539`. Het jaar in het adres loopt mee
  (vervangen, geen nieuwe plek) als je pauzeert of springt. Bij herladen of een gedeelde link opent de atlas eronder
  (de geschiedenis waaruit je kwam, bewaard in `history.state.wereldTerug`, of de start) en de laag eroverheen.
- **De rest van de pagina** is `inert` zolang de laag open is (toetsenbord en schermlezer blijven in de laag); de pagina
  eronder scrolt niet (`html.wt-open`). Toetsen in de laag gaan niet door naar de atlas.
- **Kaart**: een tweede Leaflet-kaart in de laag; `BR.ondergrond(kaart)` tekent hetzelfde landschap van toen (land,
  meren, rivieren, reliëf) en geeft de rand van de ondergrond terug. Daarbuiten ligt papier met een kaderlijn (zoals de
  atlas op de telefoon); gebieden worden op die rand afgeknipt (`kern.knip`), met een label ‘… loopt verder naar het
  oosten →’. Nodig voor Perzië: `geo.json` reikt tot 57° O. Namen op de kaart overlappen nooit (`schikLabels`): plaatsnamen
  gaan voor (naar links als ze rechts niet passen, anders korter of weg; ook de klikvlakken van twee plaatsen mogen
  elkaar niet bedekken, WCAG 2.5.8: een plaats zonder naam houdt zijn stip, maar zonder knop als die op de knop van een
  andere plaats valt), gebiedsnamen zoeken een vrije plek binnen het
  gebied (anders kleiner, anders even niet); gemeten 0 overlap en 0 afgekapt op 390, 1440 en 2560 px breed in 605, 586,
  539 en 525 v.Chr. (vóór deze ronde: 22 overlappend, 25 afgekapt). De legenda staat standaard dicht.
- **Animatie**: `requestAnimationFrame`, alleen zolang er afgespeeld of gesprongen wordt. Per beeld worden alleen
  attributen bijgewerkt (breedte van een lijn, positie van de kop, een paar klassen); opbouw (`layout`) alleen bij
  formaat, zoom of schuiven. Gemeten: 61 beeldjes per seconde tijdens afspelen (Chromium, desktop en telefoonmaat).
  Pauze bij `visibilitychange`. Nooit vanzelf afspelen. Rond belangrijke gebeurtenissen loopt de tijd even langzamer.
- **Minder beweging** (`prefers-reduced-motion`): geen overgangen of animaties; afspelen springt van moment naar moment
  (geboorte, einde, gebeurtenis), elke 1,6 s.
- **CSP** blijft `default-src 'self'`: alleen eigen scripts, geen inline script; de laag gebruikt alleen inline stijlen
  (zoals de rest van de atlas, `style-src 'unsafe-inline'` stond al).
- **Offline en versies** (`scripts/bijbelreis-pwa.mjs`): `ingang.js` staat als script in de pagina en krijgt zijn hash
  daar; `kern.js`, `wereld.js`, `wereld.css` en alle `perioden/*.json` krijgen een hash in de meta-tag
  `bijbelreis-data` en zitten in de app-schil (precache, ca. 210 kB onverpakt; gecomprimeerd veel minder). Zo werkt de laag zonder internet en komt hij
  nooit van een andere versie. Getest in `e2e/bijbelreis-wereld.spec.ts` (offline) en `tests/bijbelreis-wereld.test.ts`.

## 2. Wat je ziet en kunt doen

- **Telefoon**: kop (terug · titel · ‘Over deze tijdlijn’), groot jaartal met status, schakelaar
  **Levenslijnen / Kaart / Gebeurtenissen** (één tegelijk), het vlak, en onderin binnen duimbereik: een regel met wat er
  net gebeurde, de tijdschuif (44 px hoog, duim 28 px) met merkjes voor de gebeurtenissen, vorig/volgend moment,
  afspelen en de snelheid **Rustig/Normaal/Snel** (onthouden op dit apparaat, `bijbelreis:wereldSnelheid`). Informatie
  komt als blad van onderen (omlaag vegen, ×, Escape of tik ernaast sluit). De naamkolom staat vast; alleen de tijd
  schuift (slepen, knijpen, − en +). De pagina schuift nooit opzij.
- **Groot scherm** (vanaf 1024 px): het vlak groot in het midden, rechts een zijkolom (‘In 987’: wie er leven, wat er
  laatst gebeurde, wat hierna komt; of de informatiekaart). Vanaf 1180 px staan levenslijnen en kaart naast elkaar als
  de periode een kaart heeft.
- **Levenslijnen**: een lijn verschijnt bij de geboorte en groeit mee; de leeftijd loopt mee aan de kop van de lijn en
  in de naamkolom. Een dun lijntje van ouder naar kind. Einde: een streepje (stierf), Henoch een eigen teken (ring met
  pijl omhoog, ‘God nam hem weg’), een onbekend einde vervaagt, een lijn die na de as doorloopt eindigt in ›. Een begin
  bij benadering vervaagt; een `marge` (bijv. 587 of 586) is een zachte band. Lijnen die geen leven zijn (een regering,
  de tijd in Babel, een profeet) tonen geen leeftijd maar ‘koning’, ‘in Babel’, ‘profeet’.
- **Persoon kiezen** (naam of lijn): afspelen pauzeert; kaartje met relatie (zoon van, vader van), begin en einde met
  status en bron, leeftijd nu, toelichting, **wie er tegelijk leefden en hoe lang** (uitgerekend, `kern.overlap`), wie niet
  (en hoeveel jaar ertussen), gebeurtenissen (springen), ‘Lees in je Bijbel’ en een link naar het verhaal. Kies iemand
  uit ‘tegelijk met’ om te **vergelijken**: het gemeenschappelijke stuk wordt een gemarkeerd vlak tussen beide lijnen
  (‘243 jaar tegelijk’) en een zin (‘Methusalach en Adam leefden 243 jaar tegelijk: van jaar 687 tot jaar 930.’).
- **Kaart**: gebieden in hun kleur, met gestippelde rand als de grens bij benadering is (legenda), namen op het
  zwaartepunt, hoofdsteden als vierkantje zolang hun rijk bestaat, kleinere plaatsen pas met naam als je inzoomt, een
  gebeurtenis op haar plek licht op als ze bereikt wordt (de kaart beweegt er rustig heen als ze buiten beeld ligt).
  Naamsvermelding van CC BY-bronnen (Pleiades) in de legenda.
- **Toetsenbord**: ← → één jaar (met Shift tien), Page Up/Down vorig/volgend moment, Home/End, spatie afspelen/pauzeren,
  + en − zoomen, Escape sluit (eerst een open kaartje). De schuif is een gewone `input type=range` met
  `aria-valuetext` (‘jaar 987 na de schepping’).
- **Schermlezer**: het SVG-vlak is verborgen; de namen zijn knoppen, er is een tabel met dezelfde gegevens per persoon,
  en een `aria-live`-regel die alleen spreekt als de tijd stilstaat of als er tijdens afspelen iets gebeurt (hooguit eens
  per 2 s).

## 3. Datamodel

Eén JSON-bestand per periode, `public/bijbelreis/wereld/perioden/<id>.json` (bestandsnaam = `id`). Het model uit de
gedeelde specificatie, met deze aanvullingen (alle optioneel):

| Veld | Waar | Betekenis |
| --- | --- | --- |
| `as.status`, `as.uitleg` | as | status en uitleg van de tijdrekening (bij het grote jaartal en in ‘Over’) |
| `kaartUitleg` | periode | tekst in de Kaart-weergave als de periode geen kaart heeft (geen gebieden, steden of plaatsen) |
| `info` | periode | `[{ kop, tekst, status, bron }]`: compacte bron-info in ‘Over deze tijdlijn’ (bijv. Septuagint, Ussher) |
| `van.vaderLeeftijd` | persoon | leeftijd van de vader bij de geboorte (de unittest rekent ermee na) |
| `tot.leeftijd`, `tot.leeftijdStatus` | persoon | leeftijd bij het einde, standaard ‘staat in de Bijbel’ |
| `van.begin`, `lijn` | persoon | waar de lijn begint (`geboorte`, `regering`, `weggevoerd`, `roeping`) en wat hij toont (`leven`, `regering`, `in Babel`, `profeet`) |
| `marge` | van, tot, gebeurtenis | `[vroegst, laatst]` op de as, bijv. `[587, 586]` |
| `opmerking` | overal | korte toelichting op grondslag of onzekerheid |
| `kleur` | gebeurtenis | kleur van de band (token uit de huisstijl, bijv. `water` voor de zondvloed) |
| `tot`, `status`, `opmerking` | koppeling | een verhaal dat een tijdvak beslaat: in de laag een zachte band en de toelichting |

- Een persoon mag vóór de as beginnen of erna doorlopen; de lijn wordt afgekapt (Darius I). `ref` mag leeg zijn voor
  iemand die niet in de Bijbel staat (Nabonidus); `bron` is dan een bron-id.
- `bron` is één string of een lijst: een id uit `bronnen` of een Bijbelverwijzing zoals de atlas ze schrijft
  (`Genesis 5:3`, niet `Gen. 5:3`).
- Gebieden: elke sleutel is een `Polygon` of `MultiPolygon` (`[lng, lat]`). De engine herbemonstert elke ring naar 72
  punten (tegen de klok in, gelijk verdeeld), draait de volgende sleutel zo dat de punten bij elkaar horen, en mengt
  met een vloeiende overgang. Een deel zonder partner groeit uit of krimpt naar zijn eigen midden. Van de eerste tot de
  laatste sleutel staat een gebied er helemaal; het komt in de laatste ~2 % van de as ervóór op en vervaagt even lang
  erna. Een rijk dat in één jaar veranderde: zet het jaar ervoor een sleutel met de oude vorm.
- `betrouwbaarheid`: `historisch` = doorgetrokken rand; `benaderd` of `gereconstrueerd` = gestippeld.

## 4. De vlag

In `public/bijbelreis/wereld/ingang.js`: `const AAN = true;` (aan sinds 17-11-2026, besluit Martijn). Dan staat de
uitnodiging ‘De wereld in die tijd’ bij elke geschiedenis met een koppeling. Op één apparaat anders, om te testen:
`?wereld=0` in het adres zet hem uit, `?wereld=1` aan (`bijbelreis:wereld` in `localStorage`). Een diepe link
`#wereld/…` werkt altijd. Uitzetten voor iedereen: `AAN = false`.

De uitnodiging staat in de geschiedenis onder ‘Wanneer?’ (niveau Zelf op reis en Verder ontdekken; niet bij Samen
ontdekken, 4–6 jaar). Niet in het korte stapblad van de reis: daar hoort een stap, geen geschiedenis, bij de koppeling.

## 5. Een periode toevoegen

1. Maak `public/bijbelreis/wereld/perioden/<id>.json` volgens §3. Gebruik de namen zoals in `personen.js`
   (`personenId`), plaatsen uit `plaatsen.js` (`plaatsId`, `plaats`) en geschiedenissen als `vNN`.
2. Zet alle getallen en letterlijke citaten in een controlebestand `scripts/bijbel-controle/wereld-<id>.txt` en draai
   `python3 scripts/bijbel-check.py scripts/bijbel-controle/wereld-<id>.txt`.
3. Werk het register in `ingang.js` bij: `node scripts/bijbelreis-wereld.mjs` (de test faalt als je het vergeet).
4. `npx vitest run tests/bijbelreis-wereld.test.ts`: elke persoon en gebeurtenis heeft status en bron, elke verwijzing
   (Bijbel, plaats, persoon, geschiedenis) bestaat, geometrie is geldig. Voeg rekentests toe zoals voor Genesis 5.
5. `npm run build` (de PWA-stap neemt het nieuwe bestand vanzelf op in de schil) en bekijk `#wereld/<id>` op telefoon
   en desktop; `npx playwright test e2e/bijbelreis-wereld.spec.ts`.

## 6. Tests

- `tests/bijbelreis-wereld.test.ts`: controle van alle periodebestanden en de testdata; Genesis 5 nagerekend (elk
  geboortejaar = vader + leeftijd bij de geboorte; zondvloed 1656 = Noach + 600; Methusalach sterft 1656; Henoch
  weggenomen 987; Noach sterft 2006; Sem 1558–2158); overlap (Adam–Methusalach 243, Adam–Noach niet, 126 jaar ertussen);
  SV-controleregels; citaten letterlijk; Septuagint en Samaritaanse Pentateuch nagerekend (2242/2262, 1307); tijdas;
  herbemonsteren, uitlijnen en interpoleren van gebieden; plaats in de app-schil.
- `tests/bijbelreis-wereld-daniel.test.ts` (spoor Daniël): de gegevens van demo 2.
- `tests/bijbelreis-wereld-koningen.test.ts`: de gegevens van `david-salomo` en `israel-assyrie` (gebouwd door
  `scripts/bijbelreis-wereld-koningen.py`): status en bron, verwijzingen, ringen, steden per jaar in het juiste rijk,
  de Bijbelse getallen nagerekend (David 30 + 40, Rehabeam 41 + 17, Sisak in het 5e jaar, Hizkia 14e jaar = 701, Jehu
  841 en Achab 853), citaten letterlijk SV. In de e2e: openen vanuit v66 en v61, kaart, afspelen, Jona, Elia, terug, axe.
- `tests/fixtures/wereld/test-kaart.json`: **testdata** (verzonnen vormen) voor de kaartengine.
- `e2e/bijbelreis-wereld.spec.ts` (desktop, mobiel, tablet): openen vanuit een verhaal en exact terug, afspelen en
  pauzeren, spoelen, gebeurtenis, persoon, vergelijken (243), Henoch, toetsenbord, minder beweging, Daniël met kaart en
  rand, kaartanimatie met testdata, kapotte/ontbrekende gegevens, telefoonmaten zonder horizontaal schuiven, axe, offline.

## 7. Bekende onzekerheden en open punten

- **Genesis 5**: jaartallen in hele jaren; een jaar verschil is mogelijk (wanneer in het jaar iemand geboren werd).
  Jaar 0 = het jaar van Adams schepping (een keuze van de telling). Sem: 1558 uit Genesis 11:10, niet 1556 uit 5:32 (in
  ‘Over’ uitgelegd). Cham en Jafeth: geboortejaar bij benadering (rond 1556), einde onbekend. Methusalach sterft
  uitgerekend in het jaar van de vloed; de Bijbel zegt niet hoe (zo staat het er ook). Namen volgens de Bijbelreis:
  **Methusalach** (SV), niet ‘Methusalem’.
- **Septuagint/Samaritaanse Pentateuch**: getallen uit secundaire bronnen (Wikipedia-tabel, artikel van H. B. Smith),
  niet uit een tekstuitgave nagekeken. Ussher alleen als ‘traditioneel’.
- **Daniël**: zie `daniel-bronnen.md` (o.a. 605 als derde jaar van Jojakim, 587/586, Darius de Meder, Sardis 547–540).
- Sinds de bredere ondergrond (4–57° O, PR #51) ligt Pasargadae binnen de kaart; Perzië loopt na 539 nog verder
  oostwaarts dan 57° en wordt daar afgeknipt (‘loopt verder naar het oosten’).
- **David en Salomo / Israël–Assyrië**: zie de twee bronnenbestanden (§3 daar: wat een mens moet nalezen). Het
  label ‘bij benadering’ (status `benaderd`) had te weinig contrast (3,9:1); de tekstkleur is nu iets donkerder (5,1:1).
- Niet getest op een echte iPhone of Android, alleen Chromium (desktop-, telefoon- en tabletmaten).
- De visuele referentiebeelden (`e2e/bijbelreis-visueel.spec.ts`) tonen geschiedenis 26 en de reis; daar staat geen
  uitnodiging, dus de laag verandert ze niet.
