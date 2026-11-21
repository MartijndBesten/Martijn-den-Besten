# Bijbelreis – de kaart van nu en de laag ‘Vandaag’

Status: gemaakt en gecontroleerd op 15-11-2026; dezelfde dag nagelezen door een onafhankelijke tweede lezer, zie
[review.md](review.md) (wat er veranderd is, de feitencontrole met bron en datum, en wat een mens nog moet beslissen).
**Peildatum van de teksten: 15 november 2026.**

Dit document legt vast hoe de stand **Nu** van de kaart de landen toont, welke maatstaf er geldt voor namen en omstreden
grenzen, welke regels er gelden voor de laag **Vandaag**, welke bronnen er per plek zijn gebruikt en hoe iemand dit later
bijwerkt. De atlas is een hulpmiddel naast de eigen Bijbel. Hij wil laten zien waar iets nu ligt en wat daar nu is. Hij
kiest geen partij en legt geen verband tussen Bijbelse beloften en de politiek van vandaag: daarover denken christenen
verschillend.

## Bestanden

| bestand | wat |
|---|---|
| `public/bijbelreis/grenzen.json` | landsgrenzen (lijnen), landnamen en gebiedsnamen (punten met ankers); gemaakt door `scripts/bijbelreis-ondergrond.py --alleen grenzen` |
| `public/bijbelreis/vandaag.js` | `BR.vandaag`: peildatum, vaste zin en de plekken van de laag ‘Vandaag’ |
| `public/bijbelreis/app.js` | `loadModern` (stand Nu), het blok ‘laag Vandaag’, `renderVandaag` (de lijst), `setNu`/`syncVandaag`; in `refreshLabels` de takken `land` en `vd` |
| `public/bijbelreis/bijbelreis.css` | de regels onder ‘Stand Nu’ en ‘Laag Vandaag’ |
| `public/bijbelreis.html` | knop `#vandaagBtn`, legendablok `#lgNu`, link `#vandaagLijstBtn`, laden `#vandaagLade` en `#vandaagVenster`, scriptregel |
| `tests/bijbelreis-vandaag.test.ts` | gegevenscontrole (bronnen, verwijzingen, coördinaten, woordenlijst, maatstaf van `grenzen.json`) |
| `e2e/bijbelreis-vandaag.spec.ts` | schermtests op desktop, telefoon en tablet |

## Deel A: de landen van nu

### Wat er veranderd is

- **Grenzen.** Een erkende landsgrens is een doorgetrokken lijn met een zachte band erachter, zoals in een schoolatlas. Een
  bestandslijn of omstreden grens is een eigen lijnsoort: gestippeld, zonder band. In de legenda staan beide.
- **Landnamen.** Kapitalen met ruime spatiëring en een lichte rand in de papierkleur, zonder vakje erachter. Grote landen
  iets groter. De grootte loopt mee met het zoomniveau (drie trappen).
- **Plaatsing.** Elke landnaam heeft in `grenzen.json` een rij *ankers* (`[breedte, lengte, straal]`), van grof naar fijn. De
  kaart kiest per uitsnede het eerste anker dat in beeld ligt, waar de naam in het land past en niets raakt. Zo staat er op
  elk zoomniveau een naam in beeld en schuift ‘Turkije’ mee als je naar Efeze inzoomt. Is een land op de overzichtskaart
  smaller dan zijn naam (Israël, Libanon), dan staat de naam in zee voor de kust (anker met straal -1). Landnamen krijgen
  hun plek vóór de plaatsnamen; die wijken ervoor uit.
- **Gebieden.** De Westelijke Jordaanoever, de Gazastrook en de Golanhoogten staan er met hun gangbare Nederlandse naam,
  schuin gedrukt en kleiner: als gebied, niet als land. Ze verschijnen vanaf zoom 7 (Golan 7,25).
- **Kleur.** Eén ingetogen pruimkleur voor lijnen en namen van nu (`--nu-lijn`, `--nu-naam`, `--nu-band` op `#map`). Dat is
  niet de inktkleur van de Bijbelse plaatsen en niet het terracotta van de routes. Geen kleurvlak per land: daarvoor zijn
  landvlakken nodig die precies op de kustlijn van `geo.json` passen, en dat zou het bestand verdubbelen. De band langs
  de grens doet hetzelfde werk.
- **Hoofdsteden** staan niet als aparte laag op de kaart van nu. Welke stad de hoofdstad van Israël is, is zelf deel van
  het conflict; een ster bij de ene stad en niet bij de andere zou een standpunt zijn. De grote steden van nu zitten in de
  laag ‘Vandaag’, waar in woorden staat wat elke partij zegt.
- De kaart van **Toen** is niet veranderd.

### Maatstaf voor namen en grenzen

Eén vaste, controleerbare maatstaf: **het standpunt van Nederland**.

1. **Een landnaam** krijgen alleen staten die Nederland erkent.
2. **Lijnen** volgen de Nederlandse zienswijze in Natural Earth (veld `FCLASS_NL`); waar dat veld leeg is, de
   standaardweergave (`FEATURECLA`). Wat Nederland als landsgrens ziet, is een doorgetrokken lijn (`grens`, en `onbepaald`
   voor grenzen die erkend maar niet precies afgepaald zijn). Een bestandslijn (`bestandslijn`) of omstreden grens
   (`betwist`) is gestippeld. Niet getekend: lijnen die Nederland niet erkent, VN-bufferzones en de grenzen van
   afgescheiden gebieden die Nederland niet erkent.
3. **Gebieden waarover de partijen het niet eens zijn** krijgen hun gangbare neutrale Nederlandse naam als gebied. De kaart
   toont geen claim van een partij als feit. In de legenda staat ‘gebied waarover de partijen het niet eens zijn’ en niet
   ‘omstreden gebied’ of ‘betwist gebied’: dat laatste is het woord van de Israëlische regering voor wat Nederland en de VN
   ‘bezet gebied’ noemen.

De maatstaf is een keuze om niet zelf te hoeven kiezen, geen oordeel. Dat staat ook zo in de app: in de legenda (‘Dat is een
vaste maatstaf, geen oordeel van de atlas’) en onder ‘Waar ligt dit?’ → ‘Kaart’, waar ook staat wat het gevolg is (geen
landnaam bij de Westelijke Jordaanoever en de Gazastrook, terwijl de meeste landen van de wereld een Palestijnse staat
erkennen; geen landnaam in het noorden van Cyprus).

Wat dat op de kaart betekent:

| waar | op de kaart | waarom |
|---|---|---|
| Israël | landnaam | door Nederland erkend |
| Westelijke Jordaanoever, Gazastrook | gebiedsnaam (schuin); geen landnaam ‘Palestina’ of ‘Palestijnse gebieden’; de lijn van vóór 1967 gestippeld | Nederland erkent de Palestijnse staat op de peildatum niet (nagegaan op 15-11-2026 op de beleidspagina van de Rijksoverheid); de meeste VN-lidstaten doen dat wel; de naam is die van de Rijksoverheid (‘Westelijke Jordaanoever’, ‘Gazastrook’) |
| Golanhoogten | gebiedsnaam; de grens van vóór 1967 doorgetrokken, de bestandslijn van 1974 gestippeld | Nederland en de VN zien de Golan als Syrisch gebied dat Israël bestuurt; Buitenlandse Zaken schrijft ‘de bezette Golanhoogten’ |
| Noord-Cyprus | geen landnaam; de bestandslijn gestippeld | ‘wordt alleen door Turkije erkend’ (reisadvies Cyprus) |
| Kosovo | landnaam | door Nederland erkend; Nederland heeft een ambassade in Pristina |
| Krim | geen eigen naam; de lijn bij de landengte gestippeld | Nederlandse zienswijze in Natural Earth (`Claim boundary`) |
| Abchazië, Zuid-Ossetië, Transnistrië | niets getekend | niet door Nederland erkend |

Bronnen voor de maatstaf, geraadpleegd op 15-11-2026:

- Rijksoverheid, ‘Nederlands beleid over Israël en Palestijnse Gebieden’:
  <https://www.rijksoverheid.nl/themas/internationale-samenwerking/israel-en-de-palestijnse-gebieden/nederlands-beleid-israel-en-palestijnse-gebieden>.
  Erkenning van de Palestijnse staat ‘moet voor het kabinet dienstbaar zijn aan het politieke proces’; uitgangspunt zijn
  ‘de grenzen zoals die op 4 juni 1967 … zijn vastgesteld’. Nederland heeft de Palestijnse staat dus niet erkend.
- Ministerie van Buitenlandse Zaken, reisadvies Israël (laatst gewijzigd 24-09-2026): ‘de bezette Golanhoogten’:
  <https://www.nederlandwereldwijd.nl/reisadvies/israel>.
- Ministerie van Buitenlandse Zaken, reisadvies Palestijnse Gebieden (laatst gewijzigd 24-09-2026): namen ‘Westelijke
  Jordaanoever’ en ‘Gazastrook’; staakt-het-vuren van 10 oktober 2025: <https://www.nederlandwereldwijd.nl/reisadvies/palestijnse-gebieden>.
- Ministerie van Buitenlandse Zaken, reisadvies Cyprus: het noorden ‘wordt alleen door Turkije erkend’:
  <https://www.nederlandwereldwijd.nl/reisadvies/cyprus>.
- Nederlandse ambassade in Pristina, Kosovo: <https://www.nederlandwereldwijd.nl/contact/ambassades-consulaten-generaal/kosovo>;
  ‘Nederlandse vertegenwoordiging in de Palestijnse Gebieden’ (geen ambassade):
  <https://www.nederlandwereldwijd.nl/contact/ambassades-consulaten-generaal/palestijnse-gebieden>.
- Verenigde Naties, Veiligheidsraad over de Golan (resolutie 497, 1981): het Israëlische besluit is ‘null and void’:
  <https://www.un.org/unispal/document/auto-insert-179120/>; VN-waarnemers (UNDOF) sinds 1974:
  <https://peacekeeping.un.org/en/mission/undof>.
- Natural Earth 1:10m, versie 5.2.0-pre (publiek domein), bestanden `ne_10m_admin_0_boundary_lines_land`,
  `ne_10m_admin_0_boundary_lines_disputed_areas`, `ne_10m_admin_0_countries`, `ne_10m_admin_0_disputed_areas`:
  <https://github.com/nvkelso/natural-earth-vector>.

**Als Nederland de Palestijnse staat erkent**, verandert de maatstaf niet maar de uitkomst wel: haal `PSX` uit
`GEEN_LANDNAAM` in `scripts/bijbelreis-ondergrond.py`, beslis of de gebiedsnamen blijven, draai het script, pas de tabel
hierboven en de test `tests/bijbelreis-vandaag.test.ts` aan en leg het besluit hier vast. Dit is een keuze voor de eigenaar.

### grenzen.json opnieuw maken

```sh
python3 -I scripts/bijbelreis-ondergrond.py --cache /pad/buiten/de/repo --alleen grenzen
```

Het script haalt de vier Natural Earth-bestanden op, past de maatstaf toe en rekent de ankers uit. De ankers van landnamen
liggen binnen het land (zonder de omstreden gebieden die Natural Earth erbij tekent, zoals de Golan bij Israël en de Krim
bij Rusland) en binnen het stuk kaart waar `geo.json` land tekent. Verandert de omvang van `geo.json`, draai het script
dan opnieuw. Uitkomst op 15-11-2026: 120 lijnen (108 `grens`, 3 `onbepaald`, 3 `bestandslijn`, 6 `betwist`), 33 landnamen
en 3 gebieden, 74 KB.

## Deel B: de laag ‘Vandaag’

In de stand **Nu** kan de laag ‘Vandaag’ aan. Ze staat standaard uit; de keuze wordt onthouden in `localStorage` onder
`bijbelreis:vandaag` (andere sleutels blijven ongemoeid). Elke plek heeft een nachtblauw bordje boven de plek (geen stip,
zoals de Bijbelse plaatsen) en een venster met ‘Vandaag’, ‘In de Bijbel’, ‘Lees in je Bijbel: …’ en een knop naar de
Bijbelse plaats, waar ‘Hier in de reis’ staat. Op een breed scherm is het venster een tekstballon op de kaart, op een
telefoon of tablet een blad van onderen. De lijst ‘Vandaag’ (link bij ‘Alle plaatsen’ en in de legenda) toont alle plekken
per streek, met de peildatum en de vaste zin dat de atlas geen partij kiest; zoeken kan op naam en land. Bij
Voorlezen is de laag er niet. Bij Verdiepen staan de bronnen onder de tekst.

### Regels voor de inhoud

1. **Geen partij kiezen.** Niet voor of tegen Israël, niet voor of tegen de Palestijnen, en ook niet in andere conflicten
   (Libanon, Syrië, Irak, Iran, Cyprus …). Beschrijf wat er is en wat partijen zelf zeggen, met gelijke toon en ongeveer
   gelijke lengte. Geen schuldvraag, geen bijvoeglijke naamwoorden met een oordeel, geen woorden die één partij als de
   hare herkent. Noemen partijen een plek anders, noem dan beide namen en zeg wie welke naam gebruikt.
   - **Gelijke werkwoorden.** Wat de een doet en wat de ander doet, staat in dezelfde vorm: ‘viel Hamas Israël aan’ en ‘viel
     het Israëlische leger Gaza aan’. Niet de een bedrijvend met naam en de ander lijdend zonder dader.
   - **Geen oorzaak en gevolg.** Geen ‘na … volgde …’, ‘als reactie op’, ‘vergelding’: zo'n zin beantwoordt de schuldvraag.
     Gebeurtenissen staan er met hun datum, zonder voegwoord dat de een tot oorzaak van de ander maakt.
   - **Het leed aan beide kanten, of aan geen van beide.** Staat er dat in Gaza of Zuid-Libanon mensen omkwamen of hun huis
     moesten verlaten, dan staat er ook wat er in Israël gebeurde, en omgekeerd.
   - **Wie het met wie eens is, aan beide kanten.** Bij de Golan staan de VN en Nederland (met Syrië) én de Verenigde Staten
     (met Israël).
2. **Feitelijk en controleerbaar.** Elke bewering over vandaag heeft een bron: Rijksoverheid/Buitenlandse Zaken,
   VN-organisaties, NOS of een naslagwerk. Staat iets niet in een bron, dan staat het niet in de tekst.
3. **Alleen wat blijft.** Geen frontlijnen, geen aantallen slachtoffers, niet wie op dit moment waar de macht heeft, geen
   reisadvies (dat verandert het snelst) en geen VN-missie zonder jaartal (de opdracht van UNIFIL loopt eind 2026 af). Wel:
   ‘in de laatste jaren is hier oorlog gevoerd’, ‘over het bestuur is geen overeenstemming’, en gebeurtenissen met een
   datum die vaststaat. De peildatum staat in de lijst en in elk venster.
4. **Voor kinderen en hun ouders.** Sober en rustig, zonder gruwelijke details en zonder angst aan te jagen, maar ook niet
   verhullend: ‘kwamen om’, niet ‘het blijft onrustig’. Twee tot vier zinnen ‘Vandaag’ (hooguit 620 tekens; alleen Gaza
   en Hebron komen boven de 500), een of twee zinnen ‘In de Bijbel’ met verwijzing.
5. **Geen toepassing.** Geen profetie-uitleg over het heden en geen verband tussen Bijbelse beloften en de politiek van
   nu. Daarom verwijst Nablus naar Genesis 12:6 (Abram komt bij Sichem) en niet naar vers 7. Onder ‘In de Bijbel’ staat
   ‘het volk Israël’ waar een kind anders aan het land van nu kan denken (Jericho, de Sinaï), en bij Gaza staan de
   Filistijnen niet in de tekst (wel in Richteren 16): naast een tekst over de oorlog van nu leest een kind daar
   gemakkelijk ‘Palestijnen’ in.
6. **Bijbelverwijzingen kloppen.** Gecontroleerd met `node scripts/sv.mjs "…"` (Statenvertaling); namen volgens de
   Herziene Statenvertaling zoals elders in de app. Enkele aanhalingstekens betekenen in de Bijbelreis letterlijk
   Statenvertaling; ze komen in deze teksten niet voor.
7. **Elke plek heeft een band met de Bijbelreis.** Waar de stad van nu zelf niet in de Bijbel staat (Beiroet, Bagdad,
   Ankara), staat dat er eerlijk bij, met de streek of rivier die er wel in staat.
8. **Niets wat de schepping of de Bijbelse tijdrekening tegenspreekt.** Geen dateringen van ‘tienduizend jaar geleden’;
   bij Jericho staat ‘een heel oude stad’.

### Woorden die niet in de teksten staan

`tests/bijbelreis-vandaag.test.ts` houdt een woordenlijst bij (`VERBODEN` en `BELOFTE`). Het is een vangnet, geen
vervanging van het nalezen.

| soort | voorbeelden | waarom |
|---|---|---|
| oordeel of schuld | terrorist, terreur, misdaad, wreed, laf, bloedbad, genocide, apartheid, onschuldig, schuld, helaas, gelukkig, terecht, held, regime, dictator, extremist | de atlas beschrijft, hij beoordeelt niet |
| partijwoord | bezet, bezetting, kolonist, nederzetting, bevrijd, herenigd, ingelijfd, invasie, verzetsbeweging, zionist, jihad, intifada, nakba, Palestina (als landnaam), illegaal, onrechtmatig, annexatie, militant, betwist of omstreden gebied | de andere partij gebruikt voor hetzelfde een ander woord; in plaats daarvan: ‘bestuurt’, ‘heeft het gezag’, ‘rekent tot’, ‘veroverde’, ‘Joodse Israëliërs’, ‘gewapende beweging’ (voor Hamas en Hezbollah allebei) |
| oorzaak en gevolg | vergelding, wraak, als reactie op, in antwoord op, sloeg terug, uitgelokt, provocatie, zelfverdediging, ‘na een aanval … volgde’, leidde tot | zo'n zin wijst een schuldige aan |
| gruwel en angst | gruwelijk, onthoofd, lijken, bloed, vreselijk | het is voor kinderen |
| vluchtig | aantallen doden of gewonden, frontlijn, op dit moment, momenteel, onlangs, reisadvies (eigen controle in de test) | morgen anders |
| belofte en profetie (alleen onder ‘Vandaag’) | beloofde land, belofte, profetie, vervuld, eindtijd | geen verband tussen Bijbelse beloften en de politiek van nu |

Bronnen gebruiken deze woorden soms wel (de VN en de Rijksoverheid schrijven ‘bezet’, de NOS ‘kolonisten’). In de
verantwoording hierboven staan ze dan als citaat; in de teksten voor kinderen niet.

### De gekozen formuleringen bij gevoelige plekken

| plek | formulering | toelichting |
|---|---|---|
| Jeruzalem | ‘de Westelijke Muur (Klaagmuur), de Heilig Grafkerk en de Rotskoepel’; ‘Israël bestuurt sinds 1967 de hele stad en noemt haar zijn hoofdstad; de Palestijnen willen dat Oost-Jeruzalem de hoofdstad van hun staat wordt. Daarover is geen overeenstemming; Nederland heeft zijn ambassade in Tel Aviv.’ | beide standpunten in één zin, even lang; het jaartal 1967 zoals bij de Golan; beide namen (Jeroesjalajim, Al-Quds) en de naam die Joden zelf gebruiken naast de Nederlandse; land: ‘Israël en de Palestijnse gebieden’ |
| Hebron | ‘Sinds 1997 bestuurt de Palestijnse Autoriteit het grootste deel van de stad; in een kleiner deel, met het oude centrum, heeft het Israëlische leger het gezag, en daar wonen tienduizenden Palestijnen en enkele honderden Joodse Israëliërs.’ En: ‘voor moslims de Ibrahimi-moskee, voor Joden het Graf van de Aartsvaders. Moslims en Joden bidden er allebei, gescheiden van elkaar.’ | beide namen van stad (Al-Khalil, Chevron) en gebouw; beide groepen bewoners van het deel onder Israëlisch gezag; geen ‘kolonisten’ of ‘nederzetting’ |
| Nablus | ‘De Palestijnse Autoriteit bestuurt de stad; over de Westelijke Jordaanoever als geheel heeft het Israëlische leger sinds 1967 het gezag. De Israëlische regering noemt de Westelijke Jordaanoever Judea en Samaria; de Palestijnen willen dat het gebied bij hun staat hoort. Daarover is geen overeenstemming.’ | dit is de ene plek waar staat hoe het met de Westelijke Jordaanoever als geheel zit; de naam van de ene partij staat er alleen samen met wat de andere wil; de Hebreeuwse naam van de stad (Sjechem) staat erbij |
| Gaza | ‘Op 7 oktober 2023 viel Hamas, de gewapende beweging die Gaza bestuurde, Israël aan; daar kwamen veel mensen om en werden mensen als gijzelaar meegenomen. In de oorlog tussen Israël en Hamas viel het Israëlische leger Gaza aan; daar kwamen zeer veel mensen om, de meeste inwoners moesten hun huis verlaten en een groot deel van de stad is verwoest. In oktober 2025 is een staakt-het-vuren afgesproken; het geweld is niet helemaal gestopt en over het bestuur van het gebied is geen overeenstemming.’ | twee zinnen met dezelfde bouw en hetzelfde werkwoord; het leed aan beide kanten; geen ‘na … volgde’; geen aantallen (‘veel’ en ‘zeer veel’ geven de verhouding); geen etiket voor Hamas behalve ‘gewapende beweging’ |
| Tel Aviv-Jaffa | ‘In de oorlog tussen Israël en Iran zijn ook hier raketten ingeslagen.’ | anders staat de oorlog alleen bij de buurlanden en lijkt Israël er zelf buiten te staan |
| Golanhoogten | ‘Israël veroverde het gebied in 1967 op Syrië, bestuurt het sindsdien en rekent het sinds 1981 tot Israël. Syrië zegt dat het Syrisch gebied is, en de Verenigde Naties en de meeste landen, ook Nederland, zien dat ook zo; de Verenigde Staten erkennen het sinds 2019 als Israëlisch gebied.’ | wat elke partij zegt, en wie het met wie eens is, aan beide kanten |
| Beiroet | ‘oorlog gevoerd tussen Israël en de Libanese gewapende beweging Hezbollah; ook Beiroet is daarbij getroffen’ | dezelfde aanduiding als voor Hamas |
| Tyrus en Sidon | ‘Door de oorlog tussen Israël en Hezbollah moesten in de laatste jaren aan beide kanten van de grens veel mensen hun huis verlaten; het zuiden van Libanon is zwaar getroffen. Sinds 1978 houden VN-militairen toezicht in het grensgebied; in 2025 is besloten dat hun opdracht eind 2026 afloopt.’ | beide kanten van de grens; de VN-missie met jaartallen, zodat de zin na 31-12-2026 niet onwaar wordt |
| Damascus | ‘In december 2024 werd president Assad verdreven; daarna kreeg het land een overgangsregering.’ | geen oordeel over de oude of de nieuwe regering |
| Susa (Iran) | ‘In 2025 en 2026 is er oorlog gevoerd tussen Iran aan de ene kant en Israël en de Verenigde Staten aan de andere kant; daarbij zijn steden in Iran en in Israël getroffen.’ | geen aanleiding of schuld; voltooide tijd, omdat op de peildatum geen vrede is gesloten |
| Mosul | ‘de gewapende groep IS’ | feitelijke aanduiding |
| Cyprus | ‘in het zuiden wonen vooral Grieks-Cyprioten, in het noorden vooral Turks-Cyprioten … De Republiek Cyprus, lid van de Europese Unie, bestuurt het zuiden; het noorden heeft een eigen bestuur en noemt zich een eigen republiek, die alleen Turkije erkent.’ | beide besturen met hetzelfde woord; geen ‘bezet’, geen ‘invasie’ |

### Plekken en bronnen

Alle bronnen zijn geraadpleegd op **15-11-2026**. ‘Eigen punt’ betekent dat het bordje niet op de Bijbelse plaats staat
maar op de stad of het gebied van nu.

| Plek | Land of gebied | Bijbelse plaats (sleutel) | Bronnen |
|---|---|---|---|
| Jeruzalem | Israël en de Palestijnse gebieden | Jeruzalem (`salem`) | <https://whc.unesco.org/en/list/148><br><https://www.rijksoverheid.nl/themas/internationale-samenwerking/israel-en-de-palestijnse-gebieden/nederlands-beleid-israel-en-palestijnse-gebieden><br><https://www.nederlandwereldwijd.nl/contact/ambassades-consulaten-generaal/israel><br><https://www.un.org/unispal/history/> |
| Bethlehem | Westelijke Jordaanoever | Bethlehem (`efrath`) | <https://whc.unesco.org/en/list/1433><br><https://www.nederlandwereldwijd.nl/reisadvies/palestijnse-gebieden> |
| Hebron | Westelijke Jordaanoever | Hebron · Mamre (`mamre`) | <https://whc.unesco.org/en/list/1565><br><https://www.ochaopt.org/content/isolation-palestinians-israeli-controlled-area-hebron-city-continues><br><https://www.un.org/unispal/wp-content/uploads/2019/06/OCHAHEBRONRPT_240419.pdf> |
| Nablus (Sichem) | Westelijke Jordaanoever | Sichem (`sichem`) | <https://www.nederlandwereldwijd.nl/reisadvies/palestijnse-gebieden><br><https://www.rijksoverheid.nl/themas/internationale-samenwerking/israel-en-de-palestijnse-gebieden/nederlands-beleid-israel-en-palestijnse-gebieden><br><https://www.un.org/unispal/history/><br><https://nos.nl/artikel/2602733-israelische-uitbreiding-van-gezag-op-westoever-is-nieuwe-stap-richting-annexatie> |
| Jericho | Westelijke Jordaanoever | Jericho (`jericho`) | <https://whc.unesco.org/en/list/1687> |
| Gaza | Gazastrook | Gaza (`gaza`) | <https://www.unrwa.org/where-we-work/our-locations/gaza-strip><br><https://www.un.org/unispal/history/><br><https://nos.nl/artikel/2493241-bijlezen-dit-gebeurde-er-tot-nu-toe-na-de-massale-aanval-van-hamas-op-israel><br><https://www.nederlandwereldwijd.nl/reisadvies/palestijnse-gebieden> |
| Tel Aviv-Jaffa (Joppe) | Israël | Joppe (`joppe`) | <https://whc.unesco.org/en/list/1096><br><https://www.nederlandwereldwijd.nl/contact/ambassades-consulaten-generaal/israel><br><https://nos.nl/collectie/14015/artikel/2604567-twee-dagen-oorlog-dit-weten-we-over-slachtoffers-in-iran-israel-en-de-regio> |
| Haifa en de Karmel | Israël | Berg Karmel (`karmel`) | <https://whc.unesco.org/en/list/1220> |
| Nazareth | Israël | Nazareth (`nt_nazareth`) | <https://www.vaticannews.va/en/church/news/2026-03/where-the-word-became-flesh-fr-francesco-patton.html> |
| Meer van Galilea | Israël | Meer van Galilea (`nt_meer`) | <https://www.jpl.nasa.gov/images/pia24130-sea-of-galilee-israel/> |
| Golanhoogten | Golanhoogten | Basan (`jh_basan`); eigen punt 32.958, 35.744 | <https://peacekeeping.un.org/en/mission/undof><br><https://www.un.org/unispal/document/auto-insert-179120/><br><https://www.nederlandwereldwijd.nl/reisadvies/israel><br><https://nos.nl/l/2277567> |
| Beiroet | Libanon | –; eigen punt 33.874, 35.508 | <https://nos.nl/l/2342864><br><https://www.nederlandwereldwijd.nl/reisadvies/libanon> |
| Tyrus en Sidon | Libanon | Tyrus (`tyrus`) | <https://whc.unesco.org/en/list/299><br><https://peacekeeping.un.org/en/mission/unifil><br><https://peacekeeping.un.org/en/security-council-un-peacekeeping-mission-lebanon-extended-final-time-1><br><https://nos.nl/l/2527602><br><https://www.nederlandwereldwijd.nl/reisadvies/libanon> |
| Damascus | Syrië | Damascus (`damascusst`) | <https://whc.unesco.org/en/list/20><br><https://nos.nl/l/2561617><br><https://www.nederlandwereldwijd.nl/reisadvies/syrie> |
| Amman (Rabba) | Jordanië | Rabba (`rabba`) | <https://www.livius.org/articles/place/philadelphia-amman/><br><https://www.nederlandwereldwijd.nl/reisadvies/jordanie> |
| Petra | Jordanië | Seïr (Edom) (`seir`); eigen punt 30.3306, 35.4433 | <https://whc.unesco.org/en/list/326> |
| De Sinaï | Egypte | Berg Sinaï (`sinai`) | <https://whc.unesco.org/en/list/954> |
| Caïro | Egypte | On (Beth-Semes) (`je_on`); eigen punt 30.052, 31.248 | <https://whc.unesco.org/en/list/89><br><https://whc.unesco.org/en/list/86> |
| Alexandrië | Egypte | Alexandrië (`p3_alexandrie`) | <https://www.livius.org/articles/place/alexandria/> |
| Bagdad | Irak | –; eigen punt 33.341, 44.392 | <https://www.nederlandwereldwijd.nl/reisadvies/irak><br><https://www.unesco.org/en/revive-mosul> |
| Mosul (Ninevé) | Irak | Ninevé (`ninivest`) | <https://www.unesco.org/en/revive-mosul> |
| Babylon (Babel) | Irak | Babel (`babelst`) | <https://whc.unesco.org/en/list/278> |
| Ur | Irak | Ur (`ur`) | <https://whc.unesco.org/en/list/1481><br><https://www.livius.org/articles/place/ur/> |
| Susa (Susan) | Iran | Susan (`susan`) | <https://whc.unesco.org/en/list/1455><br><https://www.rijksoverheid.nl/actueel/weblogs/bzers-wereldwijd/2025/conflict-israel-iran-nieuws><br><https://nos.nl/l/2618619><br><https://nos.nl/collectie/14015/artikel/2604567-twee-dagen-oorlog-dit-weten-we-over-slachtoffers-in-iran-israel-en-de-regio> |
| Antakya (Antiochië) | Turkije | Antiochië (`nt_antiochie`) | <https://nos.nl/l/2464447><br><https://www.livius.org/articles/place/antioch-antakya/> |
| Efeze | Turkije | Efeze (`nt_efeze`) | <https://whc.unesco.org/en/list/1018> |
| Ankara | Turkije | –; eigen punt 39.929, 32.862 | <https://www.livius.org/articles/place/ancyra-ankara/> |
| Athene | Griekenland | Athene (`nt_athene`) | <https://whc.unesco.org/en/list/404> |
| Thessaloniki (Thessalonica) | Griekenland | Thessalonica (`nt_thessalonica`) | <https://whc.unesco.org/en/list/456> |
| Korinthe | Griekenland | Korinthe (`nt_korinthe`) | <https://www.livius.org/articles/place/corinth/> |
| Patmos | Griekenland | Patmos (`nt_patmos`) | <https://whc.unesco.org/en/list/942> |
| Cyprus | Cyprus | Pafos (`nt_pafos`); eigen punt 35.167, 33.367 | <https://unficyp.unmissions.org/en/about-buffer-zone><br><https://www.nederlandwereldwijd.nl/reisadvies/cyprus><br><https://european-union.europa.eu/principles-countries-history/eu-countries/cyprus_nl> |
| Malta | Malta | Malta (`nt_malta`) | <https://european-union.europa.eu/principles-countries-history/eu-countries/malta_nl><br><https://whc.unesco.org/en/list/131> |
| Rome | Italië | Rome (`nt_rome`) | <https://whc.unesco.org/en/list/91> |

Coördinaten van eigen punten: Beiroet, Caïro, Bagdad, Ankara en Nicosia uit Natural Earth
(`ne_50m_populated_places_simple`, publiek domein); Petra uit de UNESCO-werelderfgoedlijst; de Golanhoogten het
labelpunt uit `grenzen.json`. Alle andere plekken gebruiken de coördinaten van de Bijbelse plaats in `plaatsen.js`.

Welke bron waarvoor:

- **UNESCO-werelderfgoedlijst** (`whc.unesco.org/en/list/<nummer>`): wat er op een plek te zien is, het jaar van
  inschrijving en of de plek op de lijst van werelderfgoed in gevaar staat (Jeruzalem 1982, Damascus 2013, Hebron 2017,
  Tyrus 2026). De pagina's zelf weigeren geautomatiseerd ophalen (HTTP 403); de gegevens zijn daarom nagelezen in
  dezelfde lijst via de open data van UNESCO: <https://data.unesco.org/explore/dataset/whc001/>.
- **Ministerie van Buitenlandse Zaken** (reisadviezen op nederlandwereldwijd.nl): wie een stad bestuurt
  (Bethlehem en Nablus: Palestijnse Autoriteit), waar het onveilig is, het staakt-het-vuren in Gaza, Noord-Cyprus. Een
  reisadvies verandert; het adres blijft, en wie wil weten hoe het er vandaag voor staat, kijkt daar.
- **VN**: UNRWA (Gazastrook), OCHA (Hebron: de verdeling van 1997, ‘over 40,000 Palestinians’ en ‘a few hundred Israeli
  settlers’ in het deel onder Israëlisch gezag, de gescheiden toegang), UNDOF (Golan), UNIFIL (Zuid-Libanon sinds 1978;
  resolutie 2790 van 28-08-2025: opdracht tot en met 31-12-2026), UNFICYP (bufferzone op Cyprus), ‘History of the Question
  of Palestine’ (1967, Oost-Jeruzalem, de Westelijke Jordaanoever, Hamas in Gaza sinds 2007), UNESCO ‘Revive the Spirit of
  Mosul’.
- **NOS**: de aanval van 7 oktober 2023 en de gijzelaars, de ontploffing in Beiroet (2020), de aardbevingen van februari
  2023, de overgangsregering in Syrië (maart 2025), de oorlog met Iran (inslagen in Tel Aviv en in Iraanse steden, maart
  2026; de afspraken tussen de Verenigde Staten en Iran, juni 2026), het gebruik van ‘Judea en Samaria’ door de Israëlische
  regering, de erkenning van de Golan door de Verenigde Staten (25-03-2019), de mensen die aan beide kanten van de grens
  tussen Israël en Libanon hun huis moesten verlaten (05-07-2024).
- **Rijksoverheid**: het Nederlandse beleid (ook: de Westelijke Jordaanoever en de Gazastrook als gebied van de toekomstige
  Palestijnse staat), de ambassade in Tel Aviv, het liveblog over Israël en Iran (juni 2025).
- **Europese Unie**: Malta en Cyprus als lidstaat.
- **Livius.org** (naslagwerk over de oudheid): Amman, Alexandrië, Antiochië, Ancyra, Korinthe, Ur.
- **NASA/JPL**: het Meer van Galilea. **Vatican News**: Nazareth (grootste Arabische stad van Israël, een derde christen).
- **Natural Earth**: welke stad hoofdstad is en de volgorde in grootte (Alexandrië na Caïro, Thessaloniki na Athene).

### Wat niet te verifiëren was, en wat daarom is weggelaten

- De pagina's van whc.unesco.org en britannica.com waren niet geautomatiseerd te lezen. UNESCO is via de eigen open data
  nagelezen; Britannica is niet gebruikt.
- Weggelaten omdat er geen bron bij de hand was die aan de regels voldoet: de Samaritanen op de Gerizim en de kerk bij de
  Jakobsbron (Nablus), de gemengde bevolking van Haifa, het kanaal van Korinthe, de berg Nebo, Hama en Aleppo, de
  vluchtelingen in Jordanië, de afscheiding tussen Jeruzalem en Bethlehem.
- Niet opgenomen: Istanboel en Teheran (geen band met de Bijbelreis; Ankara en Susa staan er wel), Aleppo (idem).
- Bewust niet beschreven, omdat het snel verandert: of een staakt-het-vuren standhoudt, wie waar troepen heeft, hoe het
  bestuur van Gaza of Syrië er nu precies uitziet, en reisadviezen (bij de Sinaï en Bagdad stonden ze er eerst wel; bij
  de tweede lezing zijn ze weggehaald, ook omdat ze bij Libanon, Syrië, Iran en Gaza niet stonden). In 2026 is er opnieuw
  oorlog geweest in Libanon en met Iran; de teksten zeggen daarom ‘in de laatste jaren’ en ‘meermalen’.
- Niet in een bron gevonden die aan de regels voldoet, en daarom niet toegevoegd: de christenen van Bethlehem. Van
  Nazareth staat ‘de meeste anderen zijn moslim’ niet letterlijk in de bron (Vatican News noemt alleen het derde deel
  christenen).
- Van enkele gewone aardrijkskundige feiten is de bron de kaart zelf: dat Nablus tussen de Ebal en de Gerizim ligt
  (`PEAKS` in `app.js`), dat Haifa bij de Karmel ligt en dat Tel Aviv-Jaffa de stad van het oude Joppe is (`plaatsen.js`).

## Bijwerken

Kijk de laag minstens **twee keer per jaar** na, en direct als er iets groots gebeurt in een van deze landen.

1. Lees per plek de bronnen opnieuw (de tabel hierboven). Begin bij de reisadviezen van Buitenlandse Zaken en de NOS.
2. Pas in `public/bijbelreis/vandaag.js` alleen aan wat niet meer klopt. Houd je aan de regels hierboven. Schrijf niets op
   wat volgende maand anders kan zijn.
3. Controleer nieuwe Bijbelverwijzingen met `node scripts/sv.mjs "Genesis 12:6"`.
4. Zet `peil` op de datum van vandaag, ook als er niets veranderd is, en werk de datum in dit document bij.
5. Lees elke gewijzigde tekst nog één keer als iemand van elke betrokken partij: zou die zich eerlijk beschreven voelen?
6. Draai de controles:

   ```sh
   node --check public/bijbelreis/vandaag.js
   npx vitest run tests/bijbelreis.test.ts tests/bijbelreis-vandaag.test.ts
   node scripts/bijbelreis-check.mjs desktop
   E2E_BASE_URL=http://127.0.0.1:8813 npx playwright test e2e/bijbelreis-vandaag.spec.ts --trace off
   ```

   De e2e-tests en `tests/bijbelreis-vandaag.test.ts` noemen de peildatum en enkele zinnen letterlijk (Jeruzalem, Gaza,
   Tyrus, Susa, Tel Aviv, de Golan, Cyprus, de legenda); pas die mee aan. Voor de e2e-tests moet er een server
   draaien die `public/` serveert en `/bijbelreis` naar `bijbelreis.html` stuurt (zie het servertje in
   `scripts/bijbelreis-check.mjs`).
7. Een nieuwe plek: voeg een object toe aan `plekken` (velden staan bovenin `vandaag.js`). Verwijs met `plaats` naar de
   bestaande Bijbelse plaats, zodat de coördinaten maar op één plek staan; geef alleen `ll` als het bordje ergens anders
   moet staan, en noem dan hier de bron van de coördinaten. Vul de tabel met bronnen aan.
8. Verandert de erkenning van een staat of de status van een grens, werk dan eerst de maatstaf-tabel bij en maak
   `grenzen.json` opnieuw (zie hierboven).

## Keuzes die de eigenaar zelf moet bekijken

De uitgebreide lijst, met wat de tweede lezer erbij heeft opgemerkt, staat in [review.md](review.md).

- **De maatstaf.** ‘Wat Nederland erkent’ is controleerbaar, maar het is een keuze. Het gevolg is dat er geen landnaam
  ‘Palestina’ staat en wel ‘Israël’, terwijl de meeste landen van de wereld een Palestijnse staat erkennen, en dat de
  grens langs de Golan de lijn van vóór 1967 is. De app zegt dat nu zelf, onder ‘Waar ligt dit?’.
- **Geen hoofdsteden** op de kaart van nu (zie hierboven).
- **De woorden** ‘bestuurt’, ‘heeft het gezag’, ‘rekent tot’ en ‘veroverde’ in plaats van ‘bezet’ en ‘annexeerde’,
  ‘Joodse Israëliërs’ in plaats van ‘kolonisten’, en ‘gewapende beweging’ voor Hamas en Hezbollah (Nederland en de EU
  noemen Hamas een terroristische organisatie). De Rijksoverheid en de VN gebruiken de tweede reeks wel. De maatstaf van de
  kaart (‘wat Nederland erkent’) geldt dus niet voor de woorden in de teksten.
- **De Joodse dorpen en steden op de Westelijke Jordaanoever** staan nergens, behalve de enkele honderden Joodse
  Israëliërs in Hebron. Het is een kern van het conflict; het is weggelaten omdat elk woord ervoor een partijwoord is.
- **De keuze van plekken.** 34 plekken, waarvan 10 in Israël en de Palestijnse gebieden (4 in Israël, 4 op de Westelijke
  Jordaanoever, Gaza en Jeruzalem). Istanboel, Teheran en Aleppo ontbreken omdat ze geen band met de Bijbelreis hebben.
- **De laag staat standaard uit** en is er niet bij Voorlezen. Bij Zelf lezen is ze er wel.
- **Landnamen gaan in de stand Nu vóór plaatsnamen.** Op een heel volle kaart (Bijbelwereld) mag een landnaam over de stip
  van een plaats heen staan. Met de laag ‘Vandaag’ aan vallen op de overzichtskaart de landnamen Israël en Libanon weg
  (de bordjes gaan voor); Syrië en Jordanië blijven staan.
- **Bijbelse streeknamen in de stand Nu.** De vage streeknamen van toen (Filistijnen, Moab, Edom, Basan) blijven in de
  stand Nu staan. ‘Filistijnen’ staat dan vlak onder ‘Gazastrook’.
