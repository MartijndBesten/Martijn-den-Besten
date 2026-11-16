# Foto’s van de plaatsen (‘Zo ziet het er nu uit’)

Bij 30 Bijbelse plaatsen staat een foto van hoe de plek er nu uitziet. Aanleiding: ouders lieten weten dat kinderen een
plaat bij de plaats of gebeurtenis prachtig vinden. Gekozen is voor **foto’s van de plaatsen nu**, niet voor geschilderde
platen (zie ‘Bewust niet gedaan’).

Code: `public/bijbelreis/fotos.js` (gegevens `BR.fotos` en de weergave `BR.foto`), bestanden in
`public/bijbelreis/fotos/`, opmaak onderaan `bijbelreis.css`. Controle: `tests/bijbelreis-fotos.test.ts` en
`e2e/bijbelreis-fotos.spec.ts`.

## 1. Waar de foto staat

- **Stap in de reis:** in het geopende stapblad (telefoon) of de stapkaart (desktop), onder de tekst en onder een
  eventueel tafereel, met het kopje ‘Zo ziet het er nu uit’, een kort bijschrift en de bronregel
  ‘Foto: maker, licentie · Wikimedia Commons’ (beide als link). Niet in het korte stapblad.
- Welke plaats: alleen een plaats die in de titel of de tekst van de stap genoemd wordt (zie ‘Welke stap welke foto krijgt’
  onderaan).
- **Geen foto** waar de stap bewust geen beeld heeft (`BR.beelden[key].t === ""`, bijvoorbeeld kerst, de geboorte in de
  stal).
- **Ballon van een plaats op de kaart:** een lage strook (112 px hoog, bijgesneden) met de bronregel, zodat de ballon
  op de telefoon in de kaart past.
- **Geschiedenis:** één foto, na de vertelling (en na ‘Lees verder’), van de eerste stap met een foto.
- Afbeeldingen: `<plaats>-480.webp` als `src`, `srcset` met de 960-versie, `width`/`height`, `loading="lazy"`
  (niet in de ballon), alt-tekst die beschrijft wat je ziet.
- Alles staat op de eigen site; er gaat geen verzoek naar Wikimedia. De CSP is niet veranderd.

## 2. Regels voor een foto

1. **Bron:** alleen Wikimedia Commons.
2. **Licentie:** publiek domein, CC0, CC BY of CC BY-SA vanaf 2.0. Niet: NC, ND, ‘fair use’, alleen GFDL, of onduidelijk.
   Licentie en maker worden van de bestandspagina zelf gelezen, nooit aangenomen.
3. **Vastleggen per foto:** Commons-bestandsnaam (in `bron`), maker, licentie met link, ophaaldatum.
4. **Inhoud:** landschap, stad of opgraving. Geen herkenbare mensen op de voorgrond; geen kunstwerken met God, de Heere
   Jezus of engelen; liefst geen kerkinterieurs. Politiek neutraal: geen vlaggen, militairen, muren of controleposten,
   demonstraties of politieke borden.
5. **Plaats:** alleen plaatsen waarvan de ligging bekend is (`c`: v of r). Bij `w` (waarschijnlijk) zegt het bijschrift
   dat de plek zo ‘wordt aangewezen’. Namen van nu volgens het veld `nu`.
6. **Bijschrift:** kort en eerlijk over wat je ziet (‘een herbouwd stuk van de stadsmuur’, ‘van boven gezien’).
7. **Gewicht:** 960 en 480 breed, samen ≤ 150 kB per foto (nu ≤ 100 kB, twee drukke luchtfoto’s ±115 kB);
   alles samen ≤ 3,0 MB (nu 2,3 MB). Verhouding tussen 4:3 en 2:1.
8. Elke foto is met het oog gecontroleerd vóór opname.

## 3. Een foto toevoegen

1. Zoek op Commons (MediaSearch) naar de plaats; kies een landschap of opgraving volgens §2.
2. Open de bestandspagina; noteer bestandsnaam, maker (‘Author’) en licentie (de licentiesjabloon onderaan).
   Twijfel over licentie of maker: niet gebruiken.
3. Haal de 1280px-miniatuur die de bestandspagina aanbiedt en zet hem om met sharp:
   bijsnijden tot 4:3–2:1, `resize({ width: 960 })` en `480`, `webp({ quality: 64 → 50, effort: 6, smartSubsample: true })`;
   is het paar dan nog > 100 kB, een lichte ontruising (`blur(0.7–1.1)`) vóór het omzetten.
4. Zet de bestanden in `public/bijbelreis/fotos/` (naam = Nederlandse plaatsnaam, kleine letters) en een regel in
   `BR.fotos` met `f, t, alt, b: 960, h, maker, licentie, licentieUrl, bron, opgehaald`. Meerdere plaatsen mogen
   hetzelfde bestand gebruiken (Jeruzalem en de tempel).
5. Vul de tabel hieronder aan en draai `npx vitest run tests/bijbelreis-fotos.test.ts`.

## 4. Alle foto’s (opgehaald 16 november 2026)

| Plaats | Bestand | Commons-bestand | Maker | Licentie |
| --- | --- | --- | --- | --- |
| Jeruzalem (`salem`) | `jeruzalem` | [File:JERUSALEM OLD CITY WALLS.JPG](https://commons.wikimedia.org/wiki/File:JERUSALEM_OLD_CITY_WALLS.JPG) | AVRAHAM GRAICER | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Nazareth (`nt_nazareth`) | `nazareth` | [File:Nazareth 09.08.2011 12-51-25.JPG](https://commons.wikimedia.org/wiki/File:Nazareth_09.08.2011_12-51-25.JPG) | Rudko | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Haran (`haran`) | `haran` | [File:Historical Harran University.jpg](https://commons.wikimedia.org/wiki/File:Historical_Harran_University.jpg) | Mehmetkrckrc | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Berseba (`berseba`) | `berseba` | [File:A well of living water - panoramio.jpg](https://commons.wikimedia.org/wiki/File:A_well_of_living_water_-_panoramio.jpg) | Mujaddara | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Babel (`babelst`) | `babylon` | [File:001125-Babylon-Iraq-IMG 8057-2.jpg](https://commons.wikimedia.org/wiki/File:001125-Babylon-Iraq-IMG_8057-2.jpg) | Safa.daneshvar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Jericho (`jericho`) | `jericho` | [File:Tell es-sultan.jpg](https://commons.wikimedia.org/wiki/File:Tell_es-sultan.jpg) | Fullo88 (Italiaanse Wikipedia) | [Publiek domein](https://creativecommons.org/publicdomain/mark/1.0/) |
| Sichem (`sichem`) | `sichem` | [File:Tell Balata.jpg](https://commons.wikimedia.org/wiki/File:Tell_Balata.jpg) | TrickyH | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Silo (`silo`) | `silo` | [File:Tel Shiloh (biblical site) 2017.jpg](https://commons.wikimedia.org/wiki/File:Tel_Shiloh_(biblical_site)_2017.jpg) | Deg777 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Efeze (`nt_efeze`) | `efeze` | [File:Library of Celsus 6243.jpg](https://commons.wikimedia.org/wiki/File:Library_of_Celsus_6243.jpg) | Herbert Weber | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Kapernaüm (`nt_kapernaum`) | `kapernaum` | [File:Kefar Nahum Capernaum Talhum.jpg](https://commons.wikimedia.org/wiki/File:Kefar_Nahum_Capernaum_Talhum.jpg) | Ruby1619 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Caesarea (`nt_caesarea`) | `caesarea` | [File:Caesarea Maritima aqueduct.jpg](https://commons.wikimedia.org/wiki/File:Caesarea_Maritima_aqueduct.jpg) | Mark87 (Engelse Wikipedia) | [Publiek domein](https://creativecommons.org/publicdomain/mark/1.0/) |
| Ninevé (`ninivest`) | `ninive` | [File:Mosul Wall-Nineveh 01.jpg](https://commons.wikimedia.org/wiki/File:Mosul_Wall-Nineveh_01.jpg) | Abdulsalam Al Dabbagh | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Korinthe (`nt_korinthe`) | `korinthe` | [File:Ancient Corinth. Temple of Apollo.jpg](https://commons.wikimedia.org/wiki/File:Ancient_Corinth._Temple_of_Apollo.jpg) | Chris Oxford | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Samaria (`samaria`) | `samaria` | [File:Sebastia-410.jpg](https://commons.wikimedia.org/wiki/File:Sebastia-410.jpg) | Bukvoed | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| Rome (`nt_rome`) | `rome` | [File:Forum romanum 6k (5760x2097).jpg](https://commons.wikimedia.org/wiki/File:Forum_romanum_6k_(5760x2097).jpg) | BeBo86 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Megiddo (`megiddo`) | `megiddo` | [File:Tel Megiddo 32.jpg](https://commons.wikimedia.org/wiki/File:Tel_Megiddo_32.jpg) | Immanuel Giel | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Beek Arnon (`arnon`) | `arnon` | [File:Wadi Mujib-06-2010-gje.jpg](https://commons.wikimedia.org/wiki/File:Wadi_Mujib-06-2010-gje.jpg) | Gerd Eichmann | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Berg Nebo (`nebo`) | `nebo` | [File:Mount Nebo-1.JPG](https://commons.wikimedia.org/wiki/File:Mount_Nebo-1.JPG) | Faris knight | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Olijfberg (`nt_olijfberg`) | `olijfberg` | [File:2013-Aerial-Mount of Olives.jpg](https://commons.wikimedia.org/wiki/File:2013-Aerial-Mount_of_Olives.jpg) | Godot13 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Athene (`nt_athene`) | `athene` | [File:Areopagus from the Acropolis.jpg](https://commons.wikimedia.org/wiki/File:Areopagus_from_the_Acropolis.jpg) | ajbear (KiltBear) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| Patmos (`nt_patmos`) | `patmos` | [File:Patmos2005.jpg](https://commons.wikimedia.org/wiki/File:Patmos2005.jpg) | Orthodox33 | [Publiek domein](https://creativecommons.org/publicdomain/mark/1.0/) |
| Ur (`ur`) | `ur` | [File:Ziggarat of Ur 001.jpg](https://commons.wikimedia.org/wiki/File:Ziggarat_of_Ur_001.jpg) | Tla2006 (Engelse Wikipedia) | [Publiek domein](https://creativecommons.org/publicdomain/mark/1.0/) |
| Filippi (`nt_filippi`) | `filippi` | [File:Ancient Theater, Philippi Archaeological Site, June 2019.jpg](https://commons.wikimedia.org/wiki/File:Ancient_Theater,_Philippi_Archaeological_Site,_June_2019.jpg) | Mathieu Chollet - MChollet | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Susan (`susan`) | `susan` | [File:Palace of Darius in Susa2.jpg](https://commons.wikimedia.org/wiki/File:Palace_of_Darius_in_Susa2.jpg) | Saeedhamedian | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Tarsus (`nt_tarsus`) | `tarsus` | [File:Tarsus 17.jpg](https://commons.wikimedia.org/wiki/File:Tarsus_17.jpg) | Leon petrosyan | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Bethlehem (`efrath`) | `bethlehem` | [File:Manger Square.jpg](https://commons.wikimedia.org/wiki/File:Manger_Square.jpg) | Alexey Goral | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Hebron · Mamre (`mamre`) | `hebron` | [File:Hebron old city 0029.jpg](https://commons.wikimedia.org/wiki/File:Hebron_old_city_0029.jpg) | Baraa Zm | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Berg Karmel (`karmel`) | `karmel` | [File:MountCarmel1.JPG](https://commons.wikimedia.org/wiki/File:MountCarmel1.JPG) | netanel_h | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Berg Tabor (`ri_tabor`) | `tabor` | [File:View North from Har Tavor.jpg](https://commons.wikimedia.org/wiki/File:View_North_from_Har_Tavor.jpg) | Ephraim Harel Herer | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Tempel (`nt_tempel`) | `jeruzalem` | [File:JERUSALEM OLD CITY WALLS.JPG](https://commons.wikimedia.org/wiki/File:JERUSALEM_OLD_CITY_WALLS.JPG) | AVRAHAM GRAICER | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

Bewerkingen: alle foto’s zijn verkleind en naar WebP omgezet; sommige zijn bijgesneden tot hoogstens 2:1. Nazareth is
bijgesneden zonder het reclamebord linksonder. Bij een deel van de foto’s is licht ontruisd om het gewicht te beperken (sterkst bij de luchtfoto’s van Jeruzalem en Jericho).
Voor CC BY-SA geldt dat deze bewerkte versies onder dezelfde licentie vallen.

**Afgekeurd** (niet opgenomen): Damascus (vlag op een gebouw); het meer van Galilea (licentie WTFPL, niet in de lijst);
Jizreël (licentie onduidelijk: ‘Attribution’ zonder versie); eerdere kandidaten met de verkeerde plaats (Bethlehem en
Hebron in de VS, Damascuspoort in Jeruzalem in plaats van Damascus), met beelden van de Heere Jezus of een kruis
(Olijfberg, Nebo), een kerkinterieur (Nebo), militairen (Ur), toeristen op de voorgrond (Kapernaüm), een reclamebord met
herdenking (Nazareth) en een schildering op een spandoek (Babylon).

## 5. Bewust niet gedaan

- **Geen geschilderde platen met personen.** De vaste regel van de Bijbelreis is dat God, de Heere Jezus en engelen niet
  worden afgebeeld en dat mensen alleen klein en zonder gezicht voorkomen. Bestaande Bijbelplaten (zoals die van
  GospelImages) beelden juist personen groot uit, en kosten bovendien geld per gebruik. Foto’s van de plaatsen nu laten
  kinderen zien dat het om echte plekken gaat, zonder die regel te raken. Eigen tekeningen blijven de taferelen
  (`../bijbelreis-taferelen/README.md`).
- Geen foto’s die rechtstreeks van Wikimedia worden geladen (privacy en CSP).
- Geen foto bij plaatsen waarvan de ligging betwist of onbekend is.

## Welke stap welke foto krijgt (besluit 16-11-2026)

Alleen een foto van een plaats die **in de titel of de tekst van de stap genoemd wordt** (`BR.foto.van` in `fotos.js`).
Eerst een plaats uit de titel (bij een reis de laatste: daar komt de reis aan, zoals Bethlehem bij ‘Van Nazareth naar
Bethlehem’); anders, bij een stap zonder reis, de eerste plaats als de tekst die noemt. Zo komt er geen foto van Rome bij ‘De
mantel in Troas’. Martijn viel eerder over een tekening die niets met de tekst te maken had; voor foto’s geldt hetzelfde.
Gevolg: 135 stappen hebben een foto (bij de eerste opzet 272). Een geschiedenis over de geboorte en de kribbe of over Golgotha krijgt geen
foto (`GEEN_IN_VERHAAL` in `fotos.js`; vaste regel: geen beeld bij de kribbe of Golgotha). Een unittest bewaakt de eerste
regel, een e2e-test de tweede.
