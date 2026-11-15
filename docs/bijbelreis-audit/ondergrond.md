# Bijbelreis – ondergrond: reliëf en moderne grenzen

Status: gegenereerd en gecontroleerd op 25-10-2026. Alles is reproduceerbaar met
`python3 -I scripts/bijbelreis-ondergrond.py --cache <map buiten de repo>`. Het script haalt de bronnen
zelf op en slaat ze in de cache op. Daarna draait het de zelftest.

## Bestanden

| bestand | inhoud | grootte |
|---|---|---|
| `public/bijbelreis/relief-regio.webp` | hillshade van het hele kaartgebied, 1594 × 1216 px (zoom-6-raster, berekend uit zoom-7-tegels) | 160 146 B (156 KB) |
| `public/bijbelreis/relief-kanaan.webp` | hillshade van Kanaän, 1239 × 2032 px (zoom 9) | 177 658 B (173 KB) |
| `public/bijbelreis/relief.json` | `src` en exacte `bounds` per beeld, plus een `_info`-blok | 840 B |
| `public/bijbelreis/grenzen.json` | GeoJSON FeatureCollection: 71 grenslijnen en 30 landnamen | 42 126 B (41 KB) |
| `scripts/bijbelreis-ondergrond.py` | reproduceert alles hierboven, inclusief downloads en zelftest | – |

Reliëf samen: 337 804 B (≈ 330 KB), dus onder de grens van 450 KB.

### Bounds (`[[zuid, west], [noord, oost]]`, Leaflet-volgorde lat/lng)

| beeld | gevraagd | exact (op hele Mercator-pixels) |
|---|---|---|
| regio | maxBounds `[[22.5, 19], [44.5, 54]]` | `[[22.492257, 18.984375], [44.512176, 54.008789]]` |
| kanaan | ca. `[[29.4, 33.8], [33.6, 36.9]]` | `[[29.197726, 33.799438], [33.950195, 37.202454]]` |

Het kanaan-beeld is iets ruimer dan gevraagd: naar het noorden, oosten en zuiden is een rand van 0,35° toegevoegd. In die
rand loopt het beeld via het alfakanaal over in het regio-beeld (zie hieronder). Zo valt het hele kerngebied
`[[30.9, 34.2], [33.4, 36.4]]` in de scherpe zoom-9-zone, met de Hermon (33,41° N), de Golan, Moab/Edom en de noordelijke
Negev erbij.

## Hoe het reliëf eruitziet

- Grijswaarden met alfakanaal. Vlak land en hellingen die naar het licht gekeerd zijn worden wit. Schaduwkanten
  worden zacht grijs, nooit donkerder dan ongeveer 50 % (grijs 128).
- Het licht komt uit het noordwesten (azimut 315°) op 45° hoogte. Er is een kleine extra hellingscomponent (30 %), zodat
  steile berghellingen ook aan de zonkant als massief herkenbaar blijven. De hoogte is overdreven met factor 5,5 (regio)
  en 3,2 (kanaan). Die waarden zijn zo gekozen dat de gemiddelde schaduw van beide beelden in het overlapgebied gelijk
  is. Er is geen hoogtetinting.
- Zee en meren (Middellandse Zee, Rode Zee, Dode Zee, Meer van Galilea, Van, Urmia enz.) zijn wit en volledig
  transparant. Het masker komt uit `geo.json` (`land` min `lakes`) en wordt met 4× supersampling gerasterd, zodat het
  reliëf precies binnen de kustlijn valt die de kaart tekent. Hellingen van de zeebodem (ETOPO1) worden vóór de
  berekening vlakgemaakt, zodat de kust niet vertroebelt. Wordt `geo.json` aangepast, draai het script dan opnieuw.
- **Samenspel van de twee beelden:** `relief-regio` is overal volledig, ook onder Kanaän. `relief-kanaan` heeft in een
  rand van 0,35° een alfa die van 0 naar 1 oploopt (smoothstep). Leg beide in **dezelfde pane**, met kanaan erboven. Dan
  krijg je binnen de pane een gewone crossfade, zonder naad en zonder dubbele schaduw. Beide beelden kunnen dus altijd
  aan blijven, zonder zoomlogica. Wil je bandbreedte sparen, laad `relief-kanaan` dan pas vanaf zoom ≥ 6,5: regio is
  ook alleen compleet.

## Mercator-uitlijning: hoe die is gegarandeerd

Leaflet (CRS EPSG:3857) plaatst een `L.imageOverlay` door alleen de twee hoeken uit `bounds` te projecteren. Het beeld
wordt daartussen **lineair** uitgerekt. Een beeld dat lineair in breedtegraad loopt, zou dus verschuiven: op 31,5° N
over Kanaän al tientallen pixels. Daarom geldt het volgende:

1. Alles wordt berekend op het raster van de XYZ-tegels zelf. Wereldpixel `x = (lon + 180) / 360 · 256 · 2^z` en
   `y = (½ − ln((1 + sin φ)/(1 − sin φ)) / 4π) · 256 · 2^z`. Dat is per definitie lineair in Web-Mercator, met dezelfde
   sferische Mercator (R = 6 378 137 m) die Leaflet gebruikt.
2. Het uitsnijdkader wordt naar buiten afgerond op **hele pixels** van het uitvoerraster (`floor`/`ceil`). De bounds
   in `relief.json` worden teruggerekend met de inverse projectie van precies die pixelranden:
   `lon = x / (256 · 2^z) · 360 − 180` en `lat = atan(sinh(π · (1 − 2y / (256 · 2^z))))`.
3. Regio wordt op zoom 7 berekend en naar het zoom-6-raster verkleind met 2×2-blokgemiddelden. Het kader begint op
   een even zoom-7-pixel, dus de randen blijven identiek. Er wordt nergens opnieuw in breedtegraad bemonsterd.
4. Er wordt met 6 decimalen afgerond (≈ 0,1 m), dus verwaarloosbaar.

**Zelftest** (`--test`, draait ook automatisch na het genereren):

- De heen-en-terugprojectie klopt tot op 1e-9°.
- De bounds vallen op hele pixels (afwijking < 0,001 px) en de beeldmaat klopt exact.
- Kenmerken uit de hoogtedata vallen op dezelfde plek als in `geo.json`. Het script zoekt per kenmerk de verschuiving
  met de beste overlap (IoU):

  | beeld (bronzoom) | kust | Dode Zee (< −395 m) | Meer van Galilea (< −205 m) | gemiddeld |
  |---|---|---|---|---|
  | regio (z7, ≈ 1,04 km/px) | 0 / +1 px | 0 / 0 | 0 / 0 | 0,0 / +0,3 px |
  | kanaan (z9, ≈ 0,26 km/px) | +1 / +3 px | −2 / +1 | +2 / 0 | +0,3 / +1,3 px |

  De verschuivingen op zoom 9 wijzen per kenmerk een andere kant op en middelen uit. Ze komen door de vereenvoudigde
  `geo.json`-lijnen (afgerond op 0,001°; het Dode-Zee-polygoon van Natural Earth heeft maar 27 punten). Een
  projectiefout zou bij alle kenmerken dezelfde verschuiving geven. De toleranties zijn 1 px op z7 en 3 px op z9 per
  kenmerk, en 1,5 px gemiddeld.

**Visuele controle met Playwright.** De testpagina laadt `public/bijbelreis/leaflet.js`, `geo.json`, `relief.json`
en `grenzen.json` met dezelfde opbouw als hieronder aanbevolen. In de controle-opnamen ligt de kust/meer/rivierlijn
uit `geo.json` als magenta lijn over het reliëf:

- de westelijke klifwand van de Dode Zee ligt op de westoever van het meerpolygoon;
- de Jordaan loopt over de dalbodem;
- het Meer van Galilea ligt in zijn depressie;
- de Karmelrug begint aan de Baai van Haifa;
- de kust van de Golf van Suez en van de Nijldelta sluit aan;
- tussen regio en kanaan is geen naad zichtbaar.

Testpagina: `/tmp/claude-0/-home-user/1a96ab2f-b674-5904-88da-115d3ba6eb1f/scratchpad/pw/test.html`, opnamescript
`.../scratchpad/pw/shots.cjs`. Schermafbeeldingen staan in
`/tmp/claude-0/-home-user/1a96ab2f-b674-5904-88da-115d3ba6eb1f/scratchpad/shots/`:
`regio-z5.png`, `dodezee-z7.5.png`, `dodezee-z7.5-controle.png`, `dodezee-z9.png`, `dodezee-z9-controle.png`,
`galilea-z9-controle.png`, `nijldelta-z7-controle.png`, `overgang-z7.png`, `regio-z6.5-cyprus.png` en `nacht-z7.png`.
Deze staan buiten de repo, als tijdelijk bewijs.

## Aanbevolen integratie (pane, z-index, blend-mode, opacity)

**Belangrijk, in de test vastgesteld:** een Leaflet-pane met `z-index` is een eigen stacking context en daarmee een
*geïsoleerde* blend-groep. Zet je `mix-blend-mode: multiply` op de `<img>`, dan blendt het beeld alleen met de lege
pane. Het resultaat is een grijze waas zonder effect. Zet de blend-mode daarom **op de pane zelf**. De achtergrond
(het land-SVG) moet in een **lagere pane binnen dezelfde map-pane** liggen. De zeekleur is de achtergrond van `#map`
en valt buiten de groep. Daarom is de zee in de beelden transparant en niet alleen wit.

```js
// ondergrond: land, regio's en meren in een eigen pane ONDER het reliëf
map.createPane("grond").style.zIndex = 350;      // L.svg({ pane: "grond" }) als renderer voor land/landglow/regions/lakes
map.createPane("relief").style.zIndex = 380;     // relief-regio + relief-kanaan
map.createPane("grenzen").style.zIndex = 390;    // moderne grenzen (optioneel)
// rivieren en routes blijven in overlayPane (400), markers in markerPane (600)
fetch("/bijbelreis/relief.json").then((r) => r.json()).then((rel) => {
  ["regio", "kanaan"].forEach((k) =>             // volgorde telt: kanaan als laatste (bovenop)
    L.imageOverlay(rel[k].src, rel[k].bounds, { pane: "relief", interactive: false, alt: "" }).addTo(map));
});
```

```css
.leaflet-relief-pane { mix-blend-mode: multiply; pointer-events: none; }   /* op de pane, NIET op img */
/* sterkte desgewenst met opacity op de pane (bijv. 0.85); 1 is getest en subtiel genoeg */
:root[data-theme="nacht"] .leaflet-relief-pane,
:root[data-theme="blauwdruk"] .leaflet-relief-pane { filter: contrast(1.6); }  /* op donker land is multiply van nature zwak */
.leaflet-grenzen-pane path { stroke: #7a6a55; stroke-width: 1.1; stroke-opacity: .7; fill: none; }
```

Ligt het land in de `overlayPane` (400), zoals nu in `app.js`, dan moet de reliëf-pane boven 400 komen, bijvoorbeeld
op 450. Dan worden ook de routes in de `overlayPane` licht mee gedonkerd. Daarom raad ik de aparte `grond`-pane aan.
De `.landglow`-rand en de zeekleur blijven ongemoeid, omdat zee en meren transparant zijn. Getest is het lichte thema
(crème `#efe3cf`). In het nachtthema is het reliëf ook met `contrast(1.6)` heel subtiel (zie `nacht-z7.png`).

## grenzen.json

> **Bijgewerkt op 15-11-2026.** `grenzen.json` volgt sindsdien één vaste maatstaf: het standpunt van Nederland
> (`FCLASS_NL` in Natural Earth; een landnaam alleen voor staten die Nederland erkent). De lijnsoorten zijn `grens`,
> `onbepaald`, `bestandslijn` en `betwist` (`overlay` staat niet meer in het bestand), de punten hebben `soort: "land"` of
> `soort: "gebied"` en een rij `ankers`, en ‘Palestijnse gebieden’ en ‘Noord-Cyprus’ zijn geen landnaam meer. De actuele
> beschrijving, de maatstaf met bronnen en de aantallen staan in
> [`docs/bijbelreis-vandaag/README.md`](../bijbelreis-vandaag/README.md). De tekst hieronder beschrijft de eerste versie
> van 25-10-2026 en blijft staan als verantwoording van de bron en de vereenvoudiging.

Het bestand is één FeatureCollection, de projectie is WGS84. Het is uitgesneden op de maxBounds, vereenvoudigd met
Douglas-Peucker 0,01° en afgerond op 3 decimalen. Lijnstukken van dezelfde soort zijn samengevoegd.

- **Lijnen** (`LineString`, 71). Eigenschappen:
  - `soort`: afgeleid van de Natural Earth-klasse `FEATURECLA`:
    - `grens` = International boundary;
    - `betwist` = Disputed;
    - `onbepaald` = Indefinite of Indeterminant frontier;
    - `bestandslijn` = Line of control;
    - `overlay` = Overlay limit of Lease limit, zoals de VN-bufferzones op Cyprus en de Golan (UNDOF). Die hoef je
      niet te tekenen.
  - `minzoom`: de `MIN_ZOOM` van Natural Earth, 0 of 6. Zo komen de Britse basisgebieden op Cyprus pas vanaf zoom 6.
- **Punten** (`Point`, 30) met landnamen. Eigenschappen:
  - `naam`: Nederlandse naam;
  - `ne_naam`;
  - `a3`: de `ADM0_A3`-code van Natural Earth;
  - `ne_type`: het `TYPE` volgens Natural Earth;
  - `minzoom`: de `MIN_LABEL` van Natural Earth;
  - `rang`: de `LABELRANK` van Natural Earth.

  Het labelpunt is het eigen `LABEL_X`/`LABEL_Y` van Natural Earth als dat binnen het land en minstens 0,4° binnen de
  maxBounds ligt. Anders is het de *pole of inaccessibility* (polylabel) van het zichtbare deel. Dat geldt voor Iran,
  Libië, Rusland, Kazachstan, de VAE, Servië en Roemenië. Er krijgen alleen landen een label die helemaal in beeld
  zijn, of waarvan minstens 2 vierkante graden in beeld is.
  Landnamen: Egypte, Israël, Palestijnse gebieden, Jordanië, Libanon, Syrië, Irak, Iran, Turkije, Saoedi-Arabië,
  Cyprus, Noord-Cyprus, Koeweit, Bahrein, Qatar, Verenigde Arabische Emiraten, Griekenland, Bulgarije, Noord-Macedonië,
  Albanië, Kosovo, Servië, Roemenië, Georgië, Armenië, Azerbeidzjan, Rusland, Kazachstan, Turkmenistan en Libië.
  Gebruik `minzoom`/`rang` om labels op lage zoom uit te dunnen. Op zoom 5 overlappen „Israël” en „Jordanië”.

**Neutraliteit.** De lijnen en landen volgen de **standaardweergave van Natural Earth** (`FEATURECLA`/`featurecla`).
De point-of-view-varianten (`FCLASS_NL`, `FCLASS_ISO` enz.) zijn niet gebruikt, en er is niets toegevoegd of
weggelaten op grond van een eigen politiek oordeel. Uitgefilterd zijn alleen:
- lijnen met `FEATURECLA = "Unrecognized"`, die in de standaardweergave niet getekend worden;
- labels voor afhankelijke gebieden (Akrotiri, Dhekelia), de VN-bufferzone en Bir Tawil.

De naam „Palestijnse gebieden” is een neutrale Nederlandse benaming voor het Natural Earth-object `Palestine`
(Westelijke Jordaanoever en Gaza). Natural Earth zelf geeft `NAME_NL = "Palestina"`. Alle andere namen zijn
`NAME_NL` van Natural Earth.

Ter info voor een eventueel redactiebesluit:
- Natural Earth geeft Israël `ne_type` „Disputed”, de Palestijnse gebieden „Indeterminate” en Kosovo „Disputed”.
- „Noord-Cyprus” staat in de standaardweergave als eigen admin-0-eenheid. In de Nederlandse point-of-view van Natural
  Earth (`FCLASS_NL`) is die eenheid „Unrecognized”, en daar valt ook één grenssegment tussen Israël en Libanon weg.
- Wil de site de Nederlandse weergave volgen, filter dan op `a3 !== "CYN"`. Dat is een inhoudelijke keuze voor de
  hoofdredactie en is hier bewust niet gemaakt.

## Bronnen, licenties en naamsvermelding

**Hoogtedata: AWS Terrain Tiles.**
- Bron: Mapzen/Tilezen „Joerd”, AWS Open Data Registry, `s3://elevation-tiles-prod`, Terrarium-PNG's. De registry
  verwijst voor de licentie naar <https://github.com/tilezen/joerd/blob/master/docs/attribution.md>, geraadpleegd op
  25-10-2026.
- Volgens de header `x-imagery-sources` van de gebruikte tegels zijn hier de volgende bronnen gebruikt:
  - **SRTM** (NASA/NGA, verspreid door de USGS; publiek domein);
  - **GMTED2010** (USGS; publiek domein);
  - **ETOPO1** (NOAA NCEI; publiek domein, zeebodem, hier weggemaskeerd maar wel ingelezen).
- EU-DEM, NED en dergelijke vallen buiten dit gebied of buiten deze zoomniveaus.
- Het attributiedocument van Tilezen geeft de verplichte attributieregels per bron. Voor dit gebied zijn dat de
  regels voor SRTM, GMTED2010 en ETOPO1. De USGS vraagt „SRTM data courtesy of the U.S. Geological Survey” en
  „GMTED2010 data courtesy of the U.S. Geological Survey”. NOAA vraagt vermelding van NCEI.

**Grenzen, landnamen en kust/meren-masker: Natural Earth.**
- Bestanden: `ne_10m_admin_0_boundary_lines_land` en `ne_10m_admin_0_countries`, via
  <https://github.com/nvkelso/natural-earth-vector>, versie 5.2.0-pre, geraadpleegd op 25-10-2026.
- Het masker komt uit de bestaande `geo.json`.
- Natural Earth is publiek domein. Een vermelding is niet verplicht, maar wel gebruikelijk: „Made with Natural Earth”.

**Voorgestelde naamsvermelding voor de pagina** (bijvoorbeeld in het colofon of het bronnenblok; de kaart heeft
`attributionControl: false`):

> Kaart: Natural Earth (publiek domein). Reliëf: AWS Terrain Tiles (Mapzen/Tilezen) met hoogtedata van SRTM en GMTED2010
> (courtesy of the U.S. Geological Survey) en ETOPO1 (NOAA National Centers for Environmental Information).

## Reproduceren

```sh
python3 -I scripts/bijbelreis-ondergrond.py --cache /pad/buiten/de/repo     # alles + zelftest
python3 -I scripts/bijbelreis-ondergrond.py --cache ... --alleen grenzen    # alleen grenzen.json
python3 -I scripts/bijbelreis-ondergrond.py --cache ... --test              # alleen de zelftest
```

Vereist: Python 3.10+, numpy, Pillow met WebP en shapely 2. Er zijn geen npm-afhankelijkheden. De eerste run
downloadt ongeveer 13 MB aan tegels (z7 en z9) en 15 MB aan Natural Earth-data. Parameters (bounds, zoom,
WebP-kwaliteit, overdrijving, lichtrichting, maximale schaduw, overgangsbreedte) staan bovenin het script.

# Het landschap van toen

Status: gemaakt en gecontroleerd op 15-11-2026. Opdracht van de eigenaar: „Pas de kaart aan, aan hoe het er eerst
uitzag. Want wellicht is het in de loop van de bijbeltijd aangepast.”

Tot nu toe toonden de standen **Toen** en **Nu** dezelfde ondergrond (`geo.json`, Natural Earth: de wereld van
vandaag). Nu geldt:

- **Nu** = `geo.json` plus de stuwmeren van vandaag en de moderne grenzen en namen.
- **Toen** = `geo.json` met de verschillen uit `toen.json`: dichtgeslibde baaien zijn weer zee, verdwenen meren staan
  er weer, de oude Nijlarmen zijn getekend, en meren en stuwmeren die er toen niet (zo) waren, zijn weg.

De Bijbelse tijd duurt ruim tweeduizend jaar. Er is niet één landschap van toen. Bij elk punt staat daarom voor welke
tijd de tekening geldt. Twee stijlen maken het verschil in zekerheid zichtbaar, en beide staan in de legenda:

| stijl | betekenis | regel in de legenda |
|---|---|---|
| water met een **gestreepte** oever | reconstructie: er was water, de oever is ongeveer bekend | „Streepjes om water: hier lag de oever toen ongeveer” |
| **vaag** water met een **gestippelde** oever | onzeker: misschien stond hier water | „Vaag water met stippels: misschien stond hier water. Zeker is het niet” |

## Bestanden

| bestand | inhoud | grootte |
|---|---|---|
| `public/bijbelreis/toen.json` | de verschillen tussen toen en nu (zie de sleutels hieronder) | 54 619 B (53 kB), gezipt 11 312 B (11 kB) |
| `scripts/bijbelreis-toen.py` | maakt `toen.json` opnieuw uit de bronnen en controleert plaatsen en routes | – |
| `e2e/bijbelreis-landschap.spec.ts` | drie schermtests (desktop, telefoon, tablet) | – |

Sleutels in `toen.json` (GeoJSON-features, WGS84, afgerond op 0,001°):

- `zee`: vlakken die toen zee waren en nu land zijn. Ze lopen 0,02° door over de zee van nu, zodat de kustlijn van nu
  eronder verdwijnt.
- `kust`: de oever van die vlakken waar die nu in het land ligt (gestreept).
- `meren`: meren van toen (gestreepte oever).
- `onzeker` en `rand`: vlakken waar misschien water stond, en hun oever (gestippeld).
- `rivieren`: oude Nijlarmen (gestreept) en de Jordaan van toen (`vast: 1`, gewone rivierlijn).
- `weg`, `wegRivier`: namen van meren en rivieren uit `geo.json` die in de stand Toen niet getekend worden.
- `nu`: stuwmeren van vandaag, alleen in de stand Nu.

`app.js` (`drawToen`) geeft elk onderdeel de klasse `alleen-toen` of `alleen-nu`; `bijbelreis.css` verbergt de ene of
de andere met de klasse `nu` op `#map`. Laadt `toen.json` niet, dan toont de kaart in beide standen het landschap van
nu en werkt alles verder gewoon.

## Bronnen

| bron | licentie | gebruikt voor | geraadpleegd |
|---|---|---|---|
| **Ancient World Mapping Center (AWMC), geodata**, <https://github.com/AWMC/geodata>, commit `7ecf8bc` (22-04-2024), bestand `Physical Shapefiles Apr 2024.zip`. Volgens de README afgeleid van de *Barrington Atlas of the Greek and Roman World* en van OpenStreetMap, met bewerkingen van AWMC. | Open Database License (ODbL) 1.0 | baaien, meren, Dode Zee, Nijlarmen, bovenloop van de Jordaan | 15-11-2026 |
| **Forti e.a. 2022**, „The paleoenvironment and depositional context of the Sumerian site of Abu Tbeirah (Nasiriyah, southern Mesopotamia, Iraq)”, *Quaternary Research*, <https://doi.org/10.1017/qua.2022.22>; PDF via <https://iris.uniroma1.it/retrieve/e383532f-2729-15e8-e053-a505fe0a3de9/Forti_The-paleoenvironment_2022.pdf>. Figuur 14: „Suggested position of the Persian Gulf coastline between 5000–4000 years ago”. | CC BY 4.0 | kop van de Perzische Golf | 15-11-2026 |
| **Natural Earth 1:10m**, `ne_10m_lakes` (stuwmeren: `featurecla = Reservoir`) en de bestaande `geo.json` | publiek domein | stuwmeren in de stand Nu; omtrek van de Bittermeren | 15-11-2026 |

**Licentie van `toen.json`.** De ODbL staat hergebruik op een openbare website toe, met naamsvermelding. Een bestand
dat uit de AWMC-gegevens is afgeleid, valt zelf weer onder de ODbL („share-alike”). `toen.json` is zo’n afgeleid
bestand: het staat openbaar op de site, noemt in `_info` zijn bronnen en licentie, en mag onder dezelfde licentie
worden hergebruikt. De kaart zelf (het beeld) is een „produced work”: daarvoor volstaat de vermelding in het colofon.
`geo.json`, `grenzen.json` en het reliëf blijven wat ze waren (Natural Earth en hoogtedata, publiek domein).

**Voorgestelde aanvulling van het colofon** (de integrator plaatst die; `bijbelreis.html` is hier alleen in de
legenda gewijzigd):

> Het landschap van toen (oude kust, meren en Nijlarmen): Ancient World Mapping Center, geodata, naar de Barrington
> Atlas en © OpenStreetMap-bijdragers, Open Database License 1.0; het bestand /bijbelreis/toen.json is daarvan
> afgeleid en heeft dezelfde licentie. Kop van de Perzische Golf rond 3000–2000 v.Chr.: naar Forti e.a. 2022,
> Quaternary Research, figuur 14 (CC BY 4.0), bewerkt.

De regel onder **Kaart** in het blok „Over deze atlas” klopt niet meer („Moderne kustlijnen, rivieren en meren …
Rond 2000 v.Chr. stroomde de Eufraat vlak langs Ur en was de Dode Zee groter”). Voorstel:

> De stand ‘Toen’ toont het land zoals het in de Bijbelse tijd ongeveer was: baaien die later zijn dichtgeslibd
> (Efeze, Milete), het Hulameer en de oude armen van de Nijl. Een gestreepte oever is een reconstructie; vaag water
> is onzeker. Zo weet niemand precies hoe ver de zee in Abrahams tijd bij Ur kwam, en stond het zuiden van de Dode
> Zee alleen bij hoog water onder. De stand ‘Nu’ toont het land van vandaag, met stuwmeren, moderne grenzen en
> namen. Kustlijnen, rivieren en meren van nu: Natural Earth (publiek domein), met reliëf uit hoogtegegevens.

## Per punt: wat is er veranderd, voor welke tijd, hoe zeker

### 1. Stuwmeren en kanalen van nu

- **Stond er iets op de kaart van toen dat er niet hoorde?** Bijna niets. `geo.json` bevat negen meren en geen
  enkel stuwmeer in de rivieren; het landvlak van Natural Earth heeft geen Suezkanaal. Wel stonden erop: het Meer
  van Habbaniyah, het Hammarmeer, de Dode Zee in haar vorm van nu (twee stukken, het zuidelijke zijn
  verdampingsbekkens) en het Grote Bittermeer in zijn vorm van na 1869.
- **Besluit: getekend.** Die vier staan nu alleen in de stand Nu (`weg`). In de stand Nu zijn zeven stuwmeren
  toegevoegd uit Natural Earth (`featurecla = Reservoir`): Nassermeer (1970, alleen het stuk ten noorden van 23,5° N),
  Assadmeer (1974), Tharthar, Atatürk (1992), Keban (1974), Karakaya („Saksak Dagi”, 1987) en Mingəçevir (1953).
  De jaartallen zijn die van Natural Earth.
- **Habbaniyah:** Natural Earth noemt het een stuwmeer. Of er in de oudheid een (kleiner) meer in deze laagte lag,
  is hier niet uitgezocht. Het is daarom in de stand Toen **niet getekend**; dat is een keuze, geen vaststelling.
- **Hammarmeer:** ligt in het gebied dat Forti e.a. voor 3000–2000 v.Chr. als zee tekenen (zie 4). De omtrek in
  `geo.json` is die van de twintigste eeuw. In de stand Toen niet getekend.
- **Zekerheid:** dat de stuwmeren er toen niet waren, is zeker.
- **Niet geverifieerd:** het peil van het Meer van Galilea (nu geregeld met een dam) is niet met een bron
  onderzocht. De omtrek is in beide standen dezelfde gebleven.

### 2. Het Hulameer

- **Getekend** (gestreepte oever) als meer in de stand Toen, met het label „Hulameer” vanaf zoom 9,5. Omtrek:
  AWMC, „Semachonitis L.” (Barrington Atlas kaart 69, Pleiades 678385), 10 km².
- **Feiten:** vóór de drooglegging was het meer 5,3 km lang en 4,4 km breed (12–14 km²), met moeras eromheen. Het
  Joods Nationaal Fonds legde het droog van 1951 tot 1958. Josephus noemt het in de eerste eeuw Semechonitis.
  Bron: Wikipedia (Engels), „Hula Valley”, <https://en.wikipedia.org/wiki/Hula_Valley>, geraadpleegd 15-11-2026
  (een naslagbron; de cijfers zijn niet in een vakpublicatie nagekeken).
- **Tijd:** het meer bestond in elk geval van de eerste eeuw tot 1958. De omtrek is die van de Barrington Atlas; hoe
  groot het meer in de tijd van Jozua was, is niet bekend. Vandaar de gestreepte oever.
- **Wateren van Merom:** de kaart noemt het meer **niet** „Wateren van Merom”. Die plaats staat al op de kaart
  (`jo_merom`, ten westen van Hazor, als onbekend). Dat men Merom vroeger met het Hulameer gelijkstelde, is hier
  alleen genoteerd.
- **De Jordaan** loopt in de stand Toen door het meer: ten noorden van het Meer van Galilea vervangt de AWMC-lijn
  („Iordanes”, Pleiades 687932) de lijn van Natural Earth. De AWMC-lijn houdt op bij de noordoever zoals AWMC die
  tekent; het script trekt haar 2 km recht door tot de oever in `geo.json` (een aansluitstukje tussen twee bronnen).
- **Niet getekend:** het moeras ten noorden van het meer. AWMC heeft er een vlak voor, maar zonder naam en zonder
  herkomst in de gegevens.

### 3. De Dode Zee (Zoutzee)

- **Feiten:** de waterstand schommelde in de laatste vierduizend jaar tussen 390 en 415 m onder zeeniveau. Tussen
  het diepe noordelijke en het ondiepe zuidelijke bekken ligt een drempel op ongeveer 402 m onder zeeniveau. Het
  meer stond meestal onder die drempel en bleef dan beperkt tot het noordelijke bekken; hoge standen waren er onder
  meer in de tweede en eerste eeuw v.Chr. en in de vierde eeuw n.Chr. Bron: Bookman (Ken-Tor), Enzel, Agnon en
  Stein 2004, „Late Holocene lake levels of the Dead Sea”, *GSA Bulletin* 116, 555–571,
  <https://doi.org/10.1130/B25286.1>; samenvatting gelezen op
  <https://cris.huji.ac.il/en/publications/late-holocene-lake-levels-of-the-dead-sea/>, 15-11-2026. Het zuidelijke
  bekken zou nu droog liggen zonder de verdampingsbekkens.
- **Getekend:** het noordelijke bekken als meer (gestreepte oever). **Als onzeker getekend:** het zuidelijke
  bekken (vaag, gestippeld), want dat stond alleen bij hoog water onder.
- **Omtrek:** AWMC, „Mortuum Mare/Asphaltitis L.” (Barrington Atlas kaart 69, Pleiades 697709): één meer met het
  schiereiland Lisan, ongeveer de vorm van vóór de daling van de twintigste eeuw. Het script knipt dat vlak op de
  smalste plek van de zeestraat bij Lisan (31,260° N, 4,0 km breed). Die kniplijn is een indeling, geen oever.
- **Zekerheid:** de oever is een benadering. Bij 415 m onder zeeniveau was het noordelijke bekken iets kleiner dan
  getekend, bij 390 m iets groter.

### 4. De kust bij de monding van Eufraat en Tigris (Ur)

- **De discussie is niet beslist.** Heyvaert en Baeteman (2007) geven het overzicht: De Morgan (1900) liet de Golf
  ver landinwaarts reiken; Lees en Falcon (1952) verklaarden alles uit bodembeweging en zagen weinig verandering;
  Larsen, Evans en anderen wezen in de jaren zeventig weer op de zeespiegel; Sanlaville (1989, 2002) tekende de kust
  rond 4300 v.Chr. bij Nasiriyah, Amara en Ahwaz, zodat Ur en Eridu in het derde millennium dicht bij de kust lagen.
  Heyvaert en Baeteman zelf vinden in Zuidwest-Iran een getijdengebied dat na ca. 5500 jaar geleden min of meer op
  zijn plaats bleef en pas vanaf ca. 2500 jaar geleden zeewaarts opschoof, en geen bewijs dat de zee tot Ahwaz kwam.
  Bron: *Marine Geology* 242, 83–108, <https://doi.org/10.1016/j.margeo.2007.01.008>, gelezen via
  <https://www.ancientportsantiques.com/wp-content/uploads/Documents/PLACES/IndOc-Gulf/CharaxSpasinou-Heyvaert2007.pdf>,
  15-11-2026.
- Forti e.a. (2022) tekenen de kust tussen 5000 en 4000 jaar geleden (ca. 3000–2000 v.Chr.) vlak ten oosten van Ur:
  Abu Tbeirah, 16 km van Ur, lag „∼30 km inland from the Gulf coastline”, in een delta met moerassen en geulen.
  Volgens hen kreeg de Golf zijn vorm van nu waarschijnlijk pas rond 1000 n.Chr.
- **Als onzeker getekend** (vaag, gestippeld, met het label „zee rond 2000 v.Chr.?”): het stuk van figuur 14 van
  Forti e.a. dat nu land is (18 788 km²). **Tijd:** alleen de tijd van Abraham. Voor de tijd van Daniël en Ezra
  (zesde en vijfde eeuw v.Chr.) is er geen bruikbare tekening; de kust lag toen waarschijnlijk al zuidelijker.
- **Hoe de omtrek is overgenomen** (niet op het oog): het script haalt de figuur (875 × 623 px) uit de PDF, zoekt
  in het kader de graadstreepjes (46°30′ en 48°00′ O, 31°54′ en 30°48′ N; 210,7 px per graad in beide richtingen,
  dus een platte kaart in graden), neemt alle lichtblauwe pixels, dicht de letters in het blauw en zet de rand om
  naar graden. Controle: de rode stippen van Ur en Uruk in de figuur komen 0,4 en 0,6 km van hun bekende plek uit.
  Eén pixel is 0,53 km; de lijn is vereenvoudigd met 0,006°.
- **Grenzen van de bron:** de figuur houdt op bij 49,1° O en 29,7° N. Waar het vlak die rand raakt (kort, in het
  oosten), heeft het geen oever. Het losse stuk op het eiland Bubiyan, dat door de onderrand wordt afgesneden, is
  weggelaten.
- **Niet gebruikt:** het vlak „late open water” van AWMC bij de kop van de Golf. Het geldt voor de late oudheid en
  de gegevens zeggen niet waarop het berust.
- **Gevolg:** de plaats „Eden?” ligt in de stand Toen in het onzekere water (zie de controle hieronder).

### 5. De Nijldelta

- **Getekend** (gestreept): vijf oude armen uit AWMC (Barrington Atlas kaart 74, elk met een Pleiades-nummer):
  de Pelusische (727189), Tanitische (727240), Mendesische (727158), Sebennytische (727225) en Kanopische (727138)
  arm. De armen van Rosetta en Damiate staan al in `geo.json`.
- **Tijd:** de Griekse en Romeinse tijd (de „zeven mondingen”). De Pelusische arm bestond ook al in de tijd van
  Ramses: Pi-Ramesse (Qantir) lag eraan, en de lijn loopt op de kaart langs Raämses naar Pelusium. Hoe de armen in
  de tijd van Jozef en Mozes precies liepen, is niet bekend; vandaar de streepjes.
- **Niet getekend:** de kust en de lagunes van de delta in de oudheid. AWMC heeft daar alleen de vorm van nu
  (uit OpenStreetMap), en een betrouwbare tekening voor de Bijbelse tijd is niet gevonden.
- **Niet geverifieerd:** de bewering dat de Pelusische arm rond 1060 v.Chr. bij Pi-Ramesse begon te verzanden,
  komt uit een zoekresultaat (Wikipedia, „Pi-Ramesses”) en is niet in de vakliteratuur nagekeken. Ze staat nergens
  op de kaart.

### 6. De Bittermeren en het Suezkanaal

- **Feiten:** vóór de aanleg van het Suezkanaal (geopend in 1869) was het Grote Bittermeer een droge zoutlaagte
  (Wikipedia, „Great Bitter Lake”, met verwijzing naar NASA Earth Observatory 2009,
  <https://en.wikipedia.org/wiki/Great_Bitter_Lake>, 15-11-2026). In de oudheid lag er een meer of moeras: een
  kanaal van de Nijl naar de Bittermeren bestond vanaf ongeveer 600 v.Chr. en werd rond 100 n.Chr. hersteld (Stiros
  2007, *Méditerranée* 108, <https://doi.org/10.4000/mediterranee.162>, 15-11-2026). Of en hoe ver er water stond in
  de tijd van de uittocht, is niet vastgesteld.
- **Als onzeker getekend** met de omtrek van nu uit `geo.json` (Natural Earth). In de stand Nu staat het meer er
  gewoon. Het Suezkanaal zat niet in de ondergrond en is niet getekend.

### 7. Dichtgeslibde havens: Efeze, Milete, de Thermaïsche Golf en de Tiber

Methode voor alle vier, in een venster per baai: *zee volgens AWMC in de Romeinse tijd* (de zee die AWMC voor alle
perioden tekent, plus de vlakken „roman open water” en de Golf van Latmus met het Bafameer) **doorsneden met** *land
volgens Natural Earth nu*. Verschillen smaller dan ongeveer 600 m (twee keer 0,003°) en vlakken kleiner dan 2 km²
vervallen: dat is tekenverschil tussen de twee kustlijnen, geen oude baai.

| baai | was zee, is nu land | tijd | achtergrond |
|---|---|---|---|
| **Haven van Efeze** | 33 km² | eerste eeuw n.Chr. (Paulus) | De delta van de Kaystros (Küçük Menderes) schoof op; de stad moest haar haven meermalen naar het westen verleggen. Stock e.a. 2016, *Earth Surface Processes and Landforms*, <https://doi.org/10.1002/esp.3914> (alleen de samenvatting gezien). |
| **Golf van Latmus (Milete)** | 207 km² | eerste eeuw n.Chr. | De Meander (Büyük Menderes) vulde de golf; het Bafameer is het overblijfsel. Vanaf de middeleeuwen had Milete geen toegang meer tot de zee. Opgraving Milete, Universiteit Hamburg, <https://www.miletgrabung.uni-hamburg.de/en/milet/milet-landschaft.html>, 15-11-2026. |
| **Thermaïsche Golf** | 99 km² | Romeinse tijd | De delta van Axios en Haliakmon groeide. Daarnaast het **Meer van Loudias** (AWMC „Loudias L.”, Pleiades 491654, 153 km²), bij Pella; drooggelegd in 1928–1932. Ghilardi e.a., EGU 2008, <https://meetings.copernicus.org/www.cosis.net/abstracts/EGU2008/07503/EGU2008-A-07503.pdf>: Pella lag in de Griekse tijd aan een groot meer en was sinds de Romeinse tijd van het water afgesloten. |
| **Monding van de Tiber** | 41 km² | Romeinse tijd | Ostia ligt nu 4 km van de kust (Salomon e.a. 2018, *Earth-Science Reviews* 177, 265–283; alleen via een zoekresultaat gezien). |

- **Getekend** als zee met een gestreepte oever. Milete ligt in de stand Toen weer op een landtong aan de golf;
  bij Efeze reikt de baai tot ongeveer 1,5 km van het punt van de stad.
- **Tijd:** de kust van de Romeinse tijd. Eerder in de Bijbelse tijd reikten deze baaien verder landinwaarts (AWMC
  heeft grotere vlakken voor de archaïsche en klassieke tijd). Die zijn niet getekend: de reizen op de kaart die
  hier komen, zijn die van Paulus.
- **Zekerheid:** reconstructies uit de Barrington Atlas, die op boringen en opgravingen steunen; de oever kan
  honderden meters tot een kilometer afwijken.
- **Kanttekening Thessaloniki:** in het oosten van het venster, bij de stad zelf, komt een deel van het verschil
  niet door verlanding maar doordat de kustlijn van Natural Earth daar grof is. Het is ook nu water. Thessalonica
  zelf ligt in beide standen op land.
- **Niet getekend:** de Thermaïsche Golf van de klassieke tijd (tot bij Pella) en het eiland Tyrus van vóór
  Alexander de Grote (kleiner dan de kustlijn van `geo.json` kan tonen).

### 8. De loop van de Jordaan en van de Eufraat

- **Jordaan:** alleen de bovenloop is anders getekend (door het Hulameer, zie 2). Ten zuiden van het Meer van
  Galilea is de lijn dezelfde als in de stand Nu; het stuk dat in `geo.json` als hartlijn door de Dode Zee loopt,
  is in de stand Toen weggelaten. Dat de Jordaan nu veel minder water voert, is op de kaart niet te zien.
- **Eufraat:** **niet anders getekend, alleen hier uitgelegd.** Ur lag aan een arm van de Eufraat in een delta met
  veel geulen (Forti e.a. 2022); de rivier loopt nu kilometers verderop. Een bruikbaar bestand met de rivierlopen
  van het tweede millennium v.Chr. is niet gevonden, en AWMC geeft voor Zuid-Mesopotamië de lopen van de klassieke
  oudheid met vraagtekens. De rivierlijnen van `geo.json` lopen in de stand Toen daarom ook door het onzekere water.

## Controle van plaatsen en routes

`python3 -I scripts/bijbelreis-toen.py --alleen-controle` legt alle 308 plaatsen, 210 tussenpunten (198 vóór de
aanpassing van de routes), de andere mogelijke plekken (`alt`) en alle 374 routes (bemonsterd per 250 m) tegen het
water van toen en van nu. Het script verplaatst niets. Uitkomst op 15-11-2026:

**Geen enkele plaats komt door deze wijziging in zee of in een meer te liggen.** Vijf punten liggen in een vlak
van toen of veranderen van stand:

| punt | nu | toen | opmerking |
|---|---|---|---|
| plaats **Eden?** (`eden`, [31.05, 47.5]) | land | onzeker water (kop van de Perzische Golf) | Het punt is zelf al een gok bij de samenvloeiing van Tigris en Eufraat. Ter beoordeling: laten staan, of in de tekst noemen dat hier toen misschien zee was. |
| tussenpunt `siddim` ([31.2, 35.45]) | meer (verdampingsbekkens) | onzeker water (zuidelijk bekken) | Past bij Genesis 14:3 („het dal Siddim, dat is de Zoutzee”). |
| andere mogelijke plek van de **Schelfzee** ([30.3383, 32.3778]) | meer | onzeker water (Bittermeren) | Zo bedoeld. |
| tussenpunt `br_ostia` ([41.74, 12.23]) | zee | zee (monding van de Tiber) | Geen verandering. |
| tussenpunt `efeze_haven` ([37.958, 27.326]) | land | zee (haven van Efeze) | Zo bedoeld: hier komen de schepen binnen (zie „Routes aangepast aan het landschap van toen”). |

72 andere punten lagen al in het water en liggen daar nog (kustplaatsen op de grove kustlijn van `geo.json`, zoals
Caesarea, Pafos en Attalia; tussenpunten van zeereizen; plaatsen van de soort water). Dat komt niet door deze
wijziging.

**Routes: de stand vóór de aanpassing** (46 routes raakten een vlak). Deze lijst is de aanleiding voor de paragraaf
„Routes aangepast aan het landschap van toen” hieronder; daar staat wat er nu van over is (11 routes, alle met een
reden).

- **Hulameer, 2,3 km – 26 routes** over de grote weg Hazor–Damascus (onder meer `genesis:abraham:1:0`,
  `genesis:jakob:1:0`, `2koningen:ballingschap:*`, `jona:jona:4:0`, `ezra:*`, `daniel:daniel:1:0`,
  `jezus-2:nt-brood-en-berg:4:0`). De rechte lijn snijdt de zuidpunt van het meer. De weg stak de Jordaan even ten
  zuiden van het meer over; een tussenpunt daar lost het op.
- **Dode Zee, noordelijk bekken, 6–19 km:** `1samuel:saul-david:6:1` en `7:0` (bij En-Gedi), `genesis:abraham:6:0`,
  `9:0` en `9:1` (de veldtocht van de koningen). Deze lijnen liepen ook al langs of door het meer van nu.
- **Dode Zee, zuidelijk bekken (onzeker), 5–7 km:** `genesis:abraham:16:0` (Sodom–Zoar) en `genesis:abraham:9:0`.
- **Bittermeren (onzeker), 1,5–4,5 km:** `exodus:mozes:2:0`, `6:0` en `exodus:uittocht:4:0`, `4:1`. Onveranderd ten
  opzichte van het meer van nu.
- **Golf van Latmus, 4,8 km over water:** `handelingen:nt-paulus3:9:0`, de landreis van de ouderlingen van Efeze
  naar Milete. In de Romeinse tijd liep de weg om de golf heen, of men stak over per boot.
- **Zeereizen naar Efeze en Milete** lopen in de stand Toen korter over land: Milete 12,9 → 6,1 km
  (`nt-paulus3:8:2`), Efeze 6–18 → 5–16 km. Het laatste stuk naar Efeze loopt nog over land, omdat de lijn recht
  uit het westen komt en de baai ten noordwesten van de stad ligt.
- **Brieven:** `brieven:brieven:0:0` loopt door de monding van de Tiber en verder 38,6 km over land naar Rome.
- **Alleen in de stand Nu:** 12 routes langs de Eufraat lopen 9–16 km door het Meer van Habbaniyah. Dat was al zo.

Geen route loopt door een van de zeven nieuwe stuwmeren en geen landroute loopt door de kop van de Perzische Golf.

## Routes aangepast aan het landschap van toen

Status: gedaan en gecontroleerd op 15-11-2026. Regel: een **landreis loopt over land** en een **zeereis over water**,
op de kaart van Toen en zo mogelijk ook op de kaart van Nu. Geen plaats is verplaatst, geen stap is toegevoegd,
verwijderd of verplaatst en geen tekst is gewijzigd. Alleen tussenpunten (`BR.W` in `plaatsen.js`) en de lijsten `p`
van routes zijn aangepast: 43 van de 374 routes.

**Uitkomst van de controle** (`python3 -I scripts/bijbelreis-toen.py --alleen-controle`):

| | vóór | na |
|---|---|---|
| routes die een vlak van toen of een (stuw)meer van nu raken | 46 | 11 |
| landreizen door water dat op de kaart van toen zeker water is | 33 | 1 (de overtocht naar Milete, zo bedoeld) |
| landreizen die alleen onzeker water raken | 5 | 3 (dal Siddim; twee routes van de uittocht) |
| landreizen die alleen een meer van nu raken (Habbaniyah) | 2 | 0 |
| routes door het Meer van Habbaniyah in de stand Nu | 12 | 0 |
| zeereizen in de lijst | 6 | 7 (alle zeven varen nu door de baai van toen; zie „Bewust zo gelaten”) |

Het script noemt een zeereis ook als ze goed loopt: ze vaart dan door een baai van toen. Daarom blijft de lijst niet
leeg.

### Bronnen voor de wegen

| bron | gebruikt voor | geraadpleegd |
|---|---|---|
| **AWMC, geodata**, `Cultural-Data/roads/roads.geojson` en `Cultural-Data/canals/canals.geojson`, <https://github.com/AWMC/geodata>, commit `7ecf8bc` (22-04-2024), ODbL 1.0. De wegen en het kanaal van de *Barrington Atlas* (kaarten 56, 61, 69, 70/71, 74); bij elke weg staat of het tracé bekend of bij benadering is. | wegen bij het Hulameer, de Dode Zee, Efeze en Milete; het kanaal langs de Bittermeren | 15-11-2026 |
| Wikipedia (Engels), „Daughters of Jacob Bridge”, <https://en.wikipedia.org/wiki/Daughters_of_Jacob_Bridge>: „the last natural ford of the Jordan”, „used as a crossing point for thousands of years”, coördinaten 33°0′51″ N, 35°37′43″ O. „Via Maris”, <https://en.wikipedia.org/wiki/Via_Maris>: „From Hazor it crossed the northern River Jordan at what later became known as Jacob's Ford, then climbed sharply over the Golan Heights and wound its way northeast into Damascus.” Y. Ben-Arieh, „Gesher Benot Ya'akov”, *Encyclopaedia Judaica*, <https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/gesher-benot-yaakov>: „a natural ford of the Jordan … one of the most important links between Ereẓ Israel and Damascus via Galilee and the Golan”. | de voorde ten zuiden van het Hulameer | 15-11-2026 |
| Wikipedia (Engels), „Rapiqum”, <https://en.wikipedia.org/wiki/Rapiqum> (een droomreis „follows the Euphrates road from Sippar … to Ra-pi-qum to Id-da-an to Mari”, naar Oppenheim 1956 en Goetze 1957; „the most likely location is Tell Anbar”, naar Lacambre 2006) en „Anbar (town)”, <https://en.wikipedia.org/wiki/Anbar_(town)> (linkeroever van de Eufraat, „a major crossing point of the Euphrates”, 33°22,5′ N, 43°43′ O). Naslagbronnen; de vakliteratuur zelf is niet gelezen. | de weg langs de Eufraat tussen Sippar en Hit | 15-11-2026 |
| **M. Wilson 2013**, „The Ephesian elders come to Miletus: An Annaliste reading of Acts 20:15–18a”, *Verbum et Ecclesia* 34(1), art. 744, <https://doi.org/10.4102/ve.v34i1.744>, gelezen op <https://verbumetecclesia.org.za/index.php/ve/article/view/744/1757>. De ouderlingen gingen over land: door de Magnesische poort naar Magnesia aan de Meander (24 km), dan 31 km langs de voet van de Mycale naar Priene, en van de haven van Priene (ongeveer 6 km westelijker, bij het huidige Atburgazı) met een veerboot 11 km over de Golf van Latmus naar Milete; samen ongeveer 72 km, twee lange dagen. | de weg van Efeze naar Milete | 15-11-2026 |
| E.J. Banks, „Miletus”, *International Standard Bible Encyclopedia* (1915), gelezen op <https://biblehub.com/atlas/full/miletus.htm>: „in the days of Paul, Ephesus could be reached from Miletus by land only by making a long detour about the head of the gulf. To go directly from one of these cities to the other, one would have been obliged to cross the gulf by boat and then continue by land.” | idem | 15-11-2026 |
| **Pleiades**: Magnesia ad Maeandrum, <https://pleiades.stoa.org/places/599778>; Priene, <https://pleiades.stoa.org/places/599905> (CC BY). | ligging van Magnesia en Priene | 15-11-2026 |
| BiblePlaces.com, „1 Samuel 22”, <https://www.bibleplaces.com/1samuel22/> (alleen via een zoekresultaat gezien): David kan ook bij En-Gedi zijn afgedaald en bij het schiereiland Lisan zijn overgestoken, als het water laag stond. | de andere mogelijkheid voor Davids weg naar Moab | 15-11-2026 |

De punten hieronder die „hoekpunt van de Barrington Atlas” heten, zijn één op één een coördinaat uit het
wegenbestand van AWMC. Het zijn er vijf. Dat is geen wezenlijk deel van de databank; de naamsvermelding staat hier
en in het colofon (AWMC, ODbL).

### Nieuwe tussenpunten

| sleutel | ligging | reden | bron | routes |
|---|---|---|---|---|
| `jakobsvoorde` | [33.014, 35.629] | De grote weg Hazor–Damascus stak de Jordaan over bij de voorde 4 km ten zuiden van het Hulameer (later de Jakobsbrug, Gesher Bnot Ya'akov). De rechte lijn Hazor–Damascus liep 2,3 km door de zuidpunt van het meer. | Wikipedia „Daughters of Jacob Bridge” (coördinaten) en „Via Maris”; *Encyclopaedia Judaica* | 21 routes met `damw`–`hazor` (o.a. `genesis:abraham:1:0`, `genesis:jakob:1:0`, `2koningen:ballingschap:*`, `daniel:daniel:1:0`, `ezra:*`, `esther:esther:7:0`, `jona:jona:4:0`) en 4 routes van Damascus naar Samaria, waar het de plaats van `golan` inneemt (`2koningen:elisa:4:0`, `6:0`, `7:0`, `2koningen:joas:3:0`) |
| `hula_oost` | [33.09, 35.649] | De weg van Bethsaïda naar Caesarea Filippi liep langs de oostoever van het Hulameer. Vervangt het losse punt [33.08, 35.64], dat in het meer lag. | hoekpunt van de Barrington Atlas (kaart 69, AWMC-weg 3040, tracé bekend) | `jezus-2:nt-brood-en-berg:4:0` |
| `anbar` | [33.375, 43.717] | De weg langs de Eufraat van Sippar naar Hit liep over Rapiqum, waarschijnlijk Tell Anbar bij Fallujah, een bekende oversteekplaats op de linkeroever. De rechte lijn Sippar–Hit liep in de stand Nu 9 km door het Meer van Habbaniyah; de lijn volgt nu de rivier, ook in de stand Toen. | Wikipedia „Rapiqum” en „Anbar (town)” | 10 routes met `sippar`–`hit`; en `2koningen:ballingschap:6:1` en `7:2`, waar `euphmid`–`dura` is vervangen door `euphmid`–`hit`–`anbar`–`dura` |
| `dz_west_n` | [31.42, 35.368] | De weg langs de westoever van de Dode Zee, ten zuiden van En-Gedi. De lijn van de atlas valt daar op de getekende oever; het punt ligt 1 km landinwaarts. | Barrington Atlas (kaart 70/71, AWMC-weg 3010, tracé bij benadering), 1 km naar het westen gelegd | `genesis:abraham:9:0` |
| `dz_west_z` | [31.21, 35.345] | Waar de weg van Arad de Dode Zee bereikt. | Barrington Atlas (weg van Arad naar de westoever, tracé bij benadering); het punt ligt op die lijn | `genesis:abraham:9:0`, `1samuel:saul-david:6:1`, `7:0` |
| `dz_zuid` | [31.043, 35.369] | De weg langs de westkant van het zuidelijke bekken, bij de zuidpunt. | hoekpunt van de Barrington Atlas (AWMC-weg 3010) | `1samuel:saul-david:6:1`, `7:0` |
| `ghor_z` | [31.103, 35.537] | De weg door de Ghor langs de oostkant van het zuidelijke bekken, tussen Zoar en Bab edh-Dhra. | hoekpunt van de Barrington Atlas (kaart 71, AWMC-weg 3007, tracé bij benadering) | `genesis:abraham:16:0`, `1samuel:saul-david:6:1`, `7:0` |
| `ghor_n` | [31.179, 35.545] | Dezelfde weg, waar de weg naar Kerak (Charachmoba) omhooggaat. Samen met `ghor_z` vervangt dit het losse punt [31.138, 35.535]: dat lag wel op de weg, maar de rechte lijnen ernaartoe sneden het onzekere water. | hoekpunt van de Barrington Atlas (AWMC-weg 3006, tracé bekend) | idem |
| `efeze_haven` | [37.958, 27.326] | De zuidoosthoek van de baai van Efeze zoals `toen.json` die tekent, 2,5 km van het punt van de stad. Schepen komen via de baai binnen in plaats van recht uit het westen over land. | `toen.json` (AWMC, kust van de Romeinse tijd); zie punt 7 hierboven | `handelingen:nt-paulus2:7:1`, `8:0`, `nt-paulus3:1:0`, `5:0` |
| `efeze_noordweg` | [38.033, 27.43] | De hoofdweg van Efeze naar Smyrna liep eerst naar het noordoosten, om de baai en het dal van de Kaystros heen. De rechte lijn Efeze–Smyrna liep 2,5 km door de baai. | hoekpunt van de Barrington Atlas (kaart 56/61, AWMC-weg 642, hoofdweg, tracé bij benadering) | `brieven:brieven:1:0` |
| `magnesia` | [37.8505, 27.526] | Magnesia aan de Meander: eerste stad op de weg van de ouderlingen van Efeze naar Milete. | Wilson 2013; ligging Pleiades 599778; weg in de Barrington Atlas (AWMC-weg 614) | `handelingen:nt-paulus3:9:0` |
| `priene` | [37.6608, 27.2966] | Priene, aan de noordkant van de Golf van Latmus. | Wilson 2013; ligging Pleiades 599905; weg in de Barrington Atlas (AWMC-weg 620) | idem |
| `priene_haven` | [37.588, 27.25] | Waar de overtocht naar Milete begint: de noordoever van de golf zoals `toen.json` die tekent, recht ten zuiden van Atburgazı. | Wilson 2013 (haven bij Atburgazı); de oever uit `toen.json` | idem |

Vervallen: `lisan` ([31.28, 35.5], het schiereiland in de Dode Zee). Geen route gebruikt het nog.

### Per gebied

- **Hulameer (26 routes).** Opgelost met `jakobsvoorde` en `hula_oost`. Bij de routes van Naäman en van de Syrische
  legers (`damascusst`–`golan`–`galil`) is `golan` vervangen door `jakobsvoorde`: de grote weg liep van Damascus
  recht over de Golan naar de voorde, en `golan` ligt 19 km ten noorden daarvan, aan de voet van de Hermon. Zo
  volgen alle 25 routes tussen Damascus en Galilea dezelfde weg; deze vier worden 4 km korter. `golan` blijft in
  gebruik voor de weg van Dan naar Damascus. De weg van Saulus naar Damascus (`handelingen:nt-paulus:0:0` en
  `2:0`) had de voorde al als los punt [33.0, 35.63] en is niet gewijzigd.
- **Dode Zee, noordelijk bekken.**
  - *Lot* (`genesis:abraham:6:0`) en *de terugtocht van de koningen* (`9:1`): het punt `lisan` is uit de lijst gehaald.
    De lijn loopt nu van de hoogvlakte van Moab recht naar Sodom, oostelijk van de baai bij het schiereiland.
    Voorheen sneed ze die baai (7 km).
  - *De veldtocht van de koningen* (`9:0`): van Hazezon-Thamar (En-Gedi) langs de westoever (`dz_west_n`,
    `dz_west_z`) en dan het dal Siddim in. Voorheen 19 km dwars door het noordelijke bekken.
  - *David naar Mizpa in Moab en terug* (`1samuel:saul-david:6:1` en `7:0`): om de zuidkant van de Dode Zee heen:
    Arad – `dz_west_z` – `dz_zuid` – Zoar – `ghor_z` – `ghor_n` – `kerak` – Mizpa. Voorheen stak de lijn bij het
    schiereiland Lisan 6 km water over. De weg om het zuiden is de weg die de Barrington Atlas tekent en die ook
    de koningen van Israël, Juda en Edom namen toen ze Moab vanuit het zuiden aanvielen (2 Koningen 3:8–9). **Dit is
    een keuze.** De andere mogelijkheid is een oversteek bij Lisan (zie de bron BiblePlaces): bij laag water lag
    daar een doorwaadbare plaats, en volgens de bron bij punt 3 stond het water meestal onder de drempel. Op de
    kaart van toen is die zeestraat als water getekend; daarom volgt de route de oever. De reis wordt 46 km langer
    (109 → 155 km en 105 → 151 km).
- **Dode Zee, zuidelijk bekken (onzeker).** *Lot vlucht naar Zoar* (`genesis:abraham:16:0`) loopt nu over de weg
  door de Ghor (`ghor_n`, `ghor_z`) en raakt het onzekere water niet meer.
- **Efeze.** De vier zeereizen lopen nu `p3_zee_efeze` – `efeze_haven` – Efeze. Twee losse punten ([37.95, 27.15]
  en [37.93, 27.2]) zijn vervangen door het bestaande punt `p3_zee_efeze`, zodat alle schepen dezelfde vaarweg
  nemen. Over land bij Efeze in de stand Toen: 1,9 km (van de baai naar het punt van de stad); dat was 5 km. De
  16 km die de controle eerst bij `nt-paulus3:1:0` noemde, was voor 10,5 km de weg van Kenchreeën naar Korinthe.
- **Milete.**
  - *De ouderlingen van Efeze* (`handelingen:nt-paulus3:9:0`, Handelingen 20:17): Efeze – Magnesia – Priene –
    `priene_haven` en dan **met een boot** over de golf naar Milete. Dat is de weg die Wilson (2013) onderbouwt;
    volgens Banks (ISBE) was de weg helemaal over land een lange omweg om de kop van de golf. De route is en blijft
    een reconstructie (`recon: 1`). De lijn is 64 km (was 46 km; Wilson rekent 72 km over de weg). Op de kaart van
    toen is de overtocht 4,9 km water en niet de 11 km van Wilson: AWMC tekent de oever van de Romeinse tijd 5 km
    zuidelijker dan Atburgazı. De `fact` bij deze stap („hemelsbreed ruim 45 km; de lijn op de kaart is de weg van
    de ouderlingen, een reconstructie”) klopt nog en is niet gewijzigd. Dat het laatste stuk een overtocht is,
    staat niet in de tekst; dat kan de redactie toevoegen.
  - *Het vertrek uit Milete* (`handelingen:nt-paulusrome:0:0`) stond niet in de controle, maar liep 11 km over het
    schiereiland van Milete. De lijn gaat nu eerst door de golf naar het westen (los punt [37.53, 27.17], hetzelfde
    punt als bij de aankomst) en dan naar het zuiden.
  - *De aankomst in Milete* (`handelingen:nt-paulus3:8:2`) is niet gewijzigd. De 9,3 km die de controle noemt, is
    water van toen (de golf), geen land; over land is het daar 1,2 km (de landtong van de stad).
- **Bittermeren.** *Mozes vlucht* en *Terug naar Egypte* (`exodus:mozes:2:0` en `6:0`, reconstructies): het punt
  `etham` is uit de lijst gehaald. De lijn loopt nu van Sukkoth (Tell el-Maskhuta) recht naar de kop van de Golf
  van Suez en blijft ten westen van de meren. Dat is de streek waar ook het oude kanaal van de Nijl naar de Rode
  Zee liep (AWMC, `canals.geojson`). Etham is een halte van de uittocht en hoort niet bij de reis van Mozes.
- **Habbaniyah (alleen in de stand Nu).** Opgelost met `anbar`; de route volgt de Eufraat nu ook in de stand Toen
  beter. De twee routes van de ballingen naar Babel (`2koningen:ballingschap:6:1` en `7:2`) liepen van `euphmid`
  recht door de woestijn naar `dura` en gaan nu langs de rivier (`hit`, `anbar`); ze worden 15 km langer.
- **Efeze–Smyrna** (`brieven:brieven:1:0`): opgelost met `efeze_noordweg`.

### Bewust zo gelaten

- **Het dal Siddim** (`genesis:abraham:9:0`, tussenpunt `siddim`): 10,6 km door het onzekere water van het
  zuidelijke bekken. „Het dal Siddim, dat is de Zoutzee” (Genesis 14:3): de slag was op de plek waar later de zee
  stond. Het punt is niet verplaatst.
- **De uittocht langs de Bittermeren** (`exodus:uittocht:4:0` en `4:1`, Etham → Pi-Hachiroth): 4,5 km door het
  onzekere water, op de smalle plek tussen het Grote en het Kleine Bittermeer. Niet gewijzigd, om drie redenen.
  Etham en Pi-Hachiroth zijn onbekende plaatsen (`c: "o"`, „punt illustratief”). Het water is onzeker en heeft de
  omtrek van na 1869. En een weg om het meer heen is een keuze voor één reconstructie: de Bijbel zegt dat het volk
  moest „wederkeren” (Exodus 14:2), wat past bij een weg langs de westkant van de meren, maar daarvoor zijn drie
  punten op het oog nodig en de afstand verdubbelt (25 → ongeveer 49 km). De plek van de doortocht (`schelfzee`) en
  de route erdoorheen (`exodus:uittocht:5:0`) zijn niet aangeraakt. **Ter beslissing door de eigenaar.** Wie het
  toch wil: `etham` – [30.44, 32.29] – [30.34, 32.28] – [30.26, 32.37] – `pihachiroth` blijft overal ruim 1 km van
  het getekende water.
- **De overtocht naar Milete** (`handelingen:nt-paulus3:9:0`): een landreis met 4,9 km water. Zo bedoeld (zie
  boven).
- **Zeven zeereizen door een baai van toen**: `handelingen:nt-paulus2:7:1` en `8:0`, `nt-paulus3:1:0`, `5:0` en
  `8:2`, `nt-paulusrome:0:0` en `brieven:brieven:0:0`. In de stand Toen varen ze over water tot bij de stad. Het
  land dat de controle nog telt, is: de laatste 1,9 km naar het punt van Efeze en 1,2 km naar dat van Milete (de
  plaatsen zijn niet verplaatst), echte stukken over land (Kenchreeën–Korinthe–Lechaion, 14 km; Ostia–Rome, 23 km)
  en havens op de grove kustlijn van `geo.json` (Troas, Assus, Mitylene, Kos, Rhodos).
- **In de stand Nu** liggen Efeze en Milete 6 tot 8 km van zee. Een zeereis daarheen eindigt dan over land: bij
  Efeze 8,5 km (was 6 tot 7 km; de lijn buigt nu mee met de baai van toen), bij Milete 8 km (onveranderd). Dat is
  niet op te lossen zonder de plaatsen te verplaatsen. De overtocht van de ouderlingen loopt in de stand Nu over
  land.

### Afstanden

De afstand bij ‘Hoe ver?’ wordt uit de lijn berekend. Van de 43 gewijzigde routes veranderen er 33 minder dan 5 km.
Groter: David naar Moab en terug (+46 km), de ouderlingen naar Milete (+18 km), de ballingen naar Babel (+15 km),
Mozes (−11 km), de veldtocht van de koningen (+9 km), het vertrek uit Milete (+7 km), de brief via Smyrna (+7 km).
In geen tekst en in geen test staat een vast aantal kilometers dat hierdoor niet meer klopt („ongeveer 1400 tot
1600 km” bij Daniël: de lijn is 1557 km; „ongeveer 1000 km” bij Jona: 914 km, 2 km meer dan eerst).

### Kanttekeningen

- `dz_west_n`, `dz_west_z`, `dz_zuid` en `ghor_z` liggen op wegen die de Barrington Atlas alleen bij benadering
  tekent. De weg van de voorde over de Golan naar Damascus staat niet in de Barrington Atlas (die geeft de wegen
  van de Romeinse tijd); ze berust op de naslagbronnen bij `jakobsvoorde`, en de lijn is recht.
- De afdaling van de hoogvlakte van Moab naar Sodom (Lot, de koningen) is een rechte lijn tussen twee bestaande
  punten en volgt geen bekende weg. Dat was al zo; alleen het punt `lisan` is eruit.
- `anbar` = Rapiqum is waarschijnlijk, niet zeker; dat de weg langs de Eufraat liep, staat wel vast.
- De referentiebeelden van de schermtests kunnen een gewijzigde lijn bevatten (Dode Zee, Efeze, Milete).

### Gezien, niet aangepast (buiten de controle)

De controle noemt alleen routes die een vlak van toen of een meer van nu raken. Los daarvan lopen er routes over
water of land door de grove kustlijn van `geo.json` of doordat een bootreis als gewone route is getekend. Dat komt
niet door het landschap van toen en is hier niet gewijzigd:

- `exodus:uittocht:7:0` (Schelfzee → Mara) loopt 25 km over de Golf van Suez, en `exodus:uittocht:5:0` 7 km (de
  doortocht zelf).
- De overtochten over het Meer van Galilea (`jezus-1:nt-galilea:8:0` en `10:0`, `jezus-2:nt-over-de-grens:4:0` en
  `5:0`) zijn bootreizen.
- Kustplaatsen op de grove kustlijn: onder meer Tyrus, Sidon, Caesarea, Troas, Neapolis, Perge, Myra, Malta
  (0,3 tot 30 km per route).
- De lijn `later` bij `2kronieken:hizkia-josia` (Necho naar Karchemis, `hazor`–`riblah`) raakt de westoever van het
  Hulameer. Het is een verwijzende lijn, geen route.

## Wat de integrator nog moet doen

1. `scripts/postbuild.mjs`, regel 92: `"toen.json"` toevoegen aan de lijst met gegevensbestanden, zodat het bestand
   een versienummer in de URL krijgt. (Buiten de grenzen van deze opdracht gelaten.)
2. De twee teksten voor het colofon hierboven plaatsen.
3. De referentiebeelden bijwerken: de Dode Zee, het Hulameer en de kusten bij Efeze en Milete zien er in de stand
   Toen anders uit.
4. ~~De routes hierboven beoordelen.~~ Gedaan: zie „Routes aangepast aan het landschap van toen”. Nog te
   beslissen door de eigenaar: de twee routes van de uittocht langs de Bittermeren en de weg van David naar Moab
   (beide daar beschreven).
5. Het reliëf is niet opnieuw gemaakt. Het masker van het reliëf volgt `geo.json`; de vlakken van toen liggen er
   in een hogere laag overheen, dus dat is niet nodig.

## Reproduceren

```sh
python3 -I scripts/bijbelreis-toen.py --cache /pad/buiten/de/repo              # maakt toen.json
python3 -I scripts/bijbelreis-toen.py --cache ... --controle                   # en legt plaatsen en routes ertegen
python3 -I scripts/bijbelreis-toen.py --alleen-controle                        # alleen de controle
```

Vereist: Python 3.10+, numpy, Pillow en shapely 2; voor de controle ook node. De eerste run haalt 20 MB (AWMC),
2,3 MB (Forti e.a.) en 5 MB (Natural Earth) op. Shapefiles en de figuur uit de PDF leest het script zelf, zonder
extra pakketten. Wordt `geo.json` opnieuw gemaakt, draai dit script dan ook opnieuw: de baaien, de Bittermeren en
de Jordaan hangen ervan af. Vensters, drempels en namen staan bovenin het script.
