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
