# Kaartcontrole Bijbelreis 3.0 (NT-plaatsen, nieuwe routes, leesbaarheid)

Datum: 25 oktober 2026. Opdracht: “Controleer de verbeterde kaart op leesbaarheid, juiste locaties en historische onzekerheden.”
Gewijzigd: alleen `public/bijbelreis/plaatsen.js` en de velden `r`, `at`, `ctx` en `zoom` in `inhoud/nt-jezus-1.js`,
`nt-jezus-2.js`, `nt-jezus-3.js` en `nt-handelingen.js`. Geen id hernoemd of verwijderd, geen stap verplaatst, geen tekstveld
(`txt`, `fact`, quiz) aangepast. `node --check` op alle bestanden, `npx vitest run tests/bijbelreis.test.ts` (19 geslaagd,
1 overgeslagen) en `node scripts/bijbelreis-check.mjs desktop|telefoon` (“Geen problemen gevonden”) slagen.

## Omvang

| Onderdeel | Aantal |
| --- | ---: |
| Nieuwe NT-plaatsen gecontroleerd (`nt_*`, `nt1_*` … `nt4_*`) | 74 |
| Nieuwe plaats toegevoegd (`nt_antipatris`) | 1 |
| NT-tussenpunten (`BR.W`, `nt_*`) | 11 |
| OT-plaatsen nagelopen omdat nieuwe routes ze gebruiken (Rama, Mizpa, Damascus, Gath, Gaza, Tyrus, Sidon …) | 14 |
| Routes in leviticus (0), profeten (2), 2koningen/joas (2), NT (67) | 71 routes, 267 segmenten |
| waarvan `recon: 1` / door de Bijbel genoemde plaatsen | 59 / 12 |
| Geschiedenissen op de kaart bekeken (desktop 1440×900 én iPhone 13) | 23 (46 + 8 herhaalde schermafbeeldingen) |

Sinds 2.0 zijn er in `plaatsen.js` geen nieuwe OT-plaatsen bijgekomen; alleen `dan_medie` kreeg de verwijzing Daniël 6:1
(SV-nummering 1888, klopt). De nieuwe OT-delen (Leviticus, Profeten, Joas) gebruiken bestaande plaatsen.

## Werkwijze

1. **Coördinaten:** elke NT-plaats gekoppeld aan OpenBible.info *Bible Geocoding Data* (`ancient.jsonl`, CC BY 4.0), met
   alle identificaties, score (`time_total`, 0–1000) en afstand tot het huidige punt. Van de 67 plaatsen met een
   OpenBible-ingang (Lydda en Azote via Lod en Ashdod) liggen er na correctie 63 binnen 0,8 km van de best scorende
   identificatie. De vier andere wijken bewust af:
   - Gadarenen: Kursi/Gergesa, niet de stad Gadara.
   - Klauda: 0,8 km.
   - Samaria als streek: een middelpunt.
   - Kos: de havenstad, niet het eiland.

   Zonder OpenBible-ingang (7): Tempel, Woestijn van Juda, Machérus, Stad in het bergland van Juda, Bergrede, Een dorp
   (tien melaatsen) en Over de Jordaan. Die zijn gebied, buitenbijbels of illustratief, en zo gemarkeerd.
2. **Namen:** gecontroleerd tegen de HSV op herzienestatenvertaling.nl (raadpleging 25-10-2026; per hoofdstuk alleen de
   HSV-tekst, niet de SV-kolom) en tegen de Statenvertaling in `public/bijbelreis/bijbel/*.json`.
3. **Citaten in `d`:** alle ‘…’-citaten in de NT-plaatsen automatisch gezocht in de SV-tekst; drie waren niet letterlijk.
4. **Land/water:** elk punt en elk routesegment (bemonsterd per 0,3–0,5 km) getoetst aan `geo.json` (land, meren) met
   shapely.
5. **Leesbaarheid:** Playwright (Chromium), lokale server op poort 8898, `#v<nr>`, 2,5 s wachten; desktop 1440×900 en
   iPhone 13 (alleen het kaartvak). Telling van actieve en weggevallen labels per beeld.

Tweede bron: alleen de HSV-site (namen). Wikipedia/atlassen zijn niet geraadpleegd; waar een tweede bron voor een
coördinaat ontbreekt, staat dat onder Open punten.

## Correcties aan plaatsen

| id | was | wordt | reden / bron |
| --- | --- | --- | --- |
| `nt_doopplaats` | n “Bethanië over de Jordaan”; alt “Enon bij Salim” | n **“Bethabara”**; alt **Batanea (Basan)** [32.852, 36.199] | SV én HSV Johannes 1:28: ‘Bethabara’. Enon (Joh. 3:23) is een andere doopplaats, geen kandidaat voor Bethabara. OpenBible: Al-Maghtas 320, Batanea 192. |
| `nt_golgotha` | c `w` (alt werd niet getoond, want alt alleen bij `b`) | c **`b`**, alt Tuingraf | Grafkerk 426, Gordon’s Calvary −24 (OpenBible). In `d`: ‘nabij de stad’ en ‘buiten de poort’ (Joh. 19:20; Hebr. 13:12). |
| `nt_berg` (verheerlijking) | c `o` (alt Hermon onzichtbaar) | c **`b`**, alt Hermon | Bijbel noemt geen naam (Matth. 17:1 ‘een hogen berg’); Tabor (traditie) of Hermon (bij Caesarea Filippi). |
| `nt1_bergrede` | c `o`, [32.8808, 35.5558] (lag op de ondergrond in het meer) | c **`b`**, [32.8835, 35.5545], alt **Hoorns van Hattin** [32.80, 35.447] | Traditie Tabgha-heuvel; oudere traditie Hattin. 0,3 km verschoven, blijft op de heuvel. |
| `nt_machaerus` | c `o` (vage ‘?’: “niemand weet waar dit lag”) | c **`w`** | De vesting is bekend (Mukawir); onzeker is alleen of Johannes hier zat (Josephus, niet de Bijbel). |
| `nt_lystre` | n “Lystra”, c `w` | n **“Lystre”**, c **`v`** | SV en HSV: Lystre. Inscriptie met de stadsnaam (1885), OpenBible 1000. |
| `nt_azote` | n “Azote”, [31.7975, 34.6464] | n **“Asdod”**, **[31.7572, 34.6578]** (4,6 km) | HSV Hand. 8:40 ‘Asdod’ (SV ‘Azôte’). Punt stond in het centrum van de moderne stad; nu Tel Asdod (OpenBible 1000). |
| `nt4_kos` | [36.8153, 27.1103] (midden van het eiland), t `gebied` | **[36.893, 27.288]**, t `stad` (19 km) | De haven/stad Kos ligt aan de noordoostpunt; de route liep anders dwars over het eiland. |
| `nt_samothrace` | “Samothrace” | **“Samothrake”** | HSV Hand. 16:11. |
| `nt_forumappius` | “Forum van Appius” | **“Appiusmarkt”** | SV én HSV Hand. 28:15. |
| `nt4_pergamus` | “Pergamum” | **“Pergamus”** | SV én HSV Openb. 1:11; 2:12. |
| `nt4_rhodus` | “Rhodus” | **“Rhodos”** | HSV Hand. 21:1 (SV: Rhodus, staat nu in `d`). |
| `nt3_gabbatha` | n “Gabbatha (rechthuis van Pilatus)”, alt “Burcht Antonia (klooster van de Zusters van Sion)” | n **“Gabbatha”**, alt **“Burcht Antonia”** | Te lange labels in de drukke binnenstad; uitleg staat in `d`/`bron`. |
| `nt_emmaus` | alt “Emmaus-Nicopolis” [31.839, 34.99], “el-Qubeibeh” [31.835, 35.134] | “Nicopolis” [31.8393, 34.9895], “el-Qubeibeh” [31.8399, 35.1369] | OpenBible-coördinaten (0,5 km); kortere naam: labels overlapten (desk-v130). |
| `nt_rome`, `nt_efeze` | z 6 / 6.5 | z **4** | Als `ctx` stonden ze in de Paulusreizen als naamloze stip. Alleen NT-delen tonen ze. |
| **nieuw** `nt_antipatris` | (route en `at` gebruikten `sam_afek`, label ‘Afek’) | “Antipatris”, [32.105, 34.93], c `v` | HSV/SV Hand. 23:31. Zelfde punt als Afek; het OT-label ‘Afek’ was in Handelingen verwarrend. |

Inhoudelijke correcties in `d`/`bron` (geen coördinaten):

- **Ikonium:** “Stad in Lykaonië-Frygië” → stad in Frygië, vlak bij Lykaonië; Hand. 14:6 laat zien dat ze vandaar ‘naar de steden van Lykaonië’ vluchtten.
- **Magdala:** “Maria Magdalena kwam hiervandaan” → de naam wijst erop dat ze hiervandaan kwam; met Matth. 15:39 (variant ‘Magadan’).
- **Land van de Gadarenen:** Matth. 8:28 heeft ‘Gergesenen’, en dat staat nu in `d`.
- **Citaten letterlijk gemaakt (SV):**
  - Patmos: ‘om het Woord Gods’.
  - Sardis: ‘dat gij den naam hebt, dat gij leeft, en gij zijt dood’.
  - De berg in Galilea: ‘naar den berg, waar Jezus hen bescheiden had’.
- **`bron` toegevoegd waar die ontbrak (14×):** meer van Galilea, Woestijn van Juda (ook `nu`), Samothrake, Knidus, Salmone, Klauda, Syracuse, Regium, Puteoli, Appiusmarkt, Drie Tabernen, Rome, Patmos en Efeze.
- **OpenBible-scores in `bron` gezet:** Kana, Bethsaïda, Derbe, Emmaüs, Gabbatha, Golgotha en de doopplaats.
- **Rama** (OT-plaats, nu ook gebruikt in Jeremia 40): ‘Welk Rama … weten we niet zeker’ gold alleen voor Samuël. Toegevoegd: Jeremia’s Rama is Rama in Benjamin (ar-Ram), waar de stip staat.
- **Mizpa:** Gedalja en Jeremia toegevoegd (Jer. 40:6).

Bewust **niet** gewijzigd:

- **Kana** (`b`, alt Kafr Kanna), **Bethsaïda** (`b`, alt el-Araj) en **Emmaüs** (`b`): de zekerheid was al eerlijk.
- **Gabbatha** (`b`), **Gethsémané** en **Bethfagé** (`w`), **Sichar** (`w`, Askar tegenover Sichem) en **Malta** (`w`, Melite; Mljet in `bron`).
- **Derbe** (`w`): Devri Şehri ligt 4 km verder en is zwak (49).
- **Salmone** (`w`) en **Drie Tabernen** (`w`).
- **Kapernaüm** (`v`, Tell Hum): het punt klopt. Dat het op de kaart in het meer ligt, komt door de ondergrond (zie Open punten).

## Zekerheidsverdeling NT-plaatsen

| `c` | vóór | na |
| --- | ---: | ---: |
| v (identificeerbaar) | 47 | 49 |
| w (waarschijnlijk) | 11 | 10 |
| b (betwist, met `alt`) | 5 | 8 |
| o (onbekend, punt illustratief) | 7 | 4 |
| r (gebied) | 4 | 4 |
| totaal | 74 | 75 |

**Betwist (`b`), met kandidaten:**

- Kana (Kafr Kanna)
- Bethsaïda (el-Araj)
- Een hoge berg (Tabor; Hermon)
- Golgotha (Tuingraf)
- Emmaüs (Nicopolis, el-Qubeibeh)
- Bethabara (Batanea)
- Berg van de Bergrede (Hoorns van Hattin)
- Gabbatha (Burcht Antonia)

**Onbekend (`o`):**

- Land van de Gadarenen
- Stad in het bergland van Juda
- Een dorp (tien melaatsen)
- De berg in Galilea

## Routes

Alle 71 routes zijn per segment gemeten. Fout was alleen een route over land die door het water liep. Er waren geen
zeereizen over land, afgezien van de laatste paar km naar havensteden die nu landinwaarts liggen: Milete, Perge, Tarsus
en Myra. Dat klopt historisch.

| stap (boek:deel:index) | was | wordt |
| --- | --- | --- |
| `jezus-1:nt-geboorte:9` vlucht naar Egypte | Gaza → el-Arish **69 % over zee**, el-Arish → Pelusium 23 % | via Rafia [31.28, 34.25], [31.12, 33.95] en [31.0, 33.2]: 100 % land |
| `jezus-1:nt-geboorte:10` terug naar Nazareth | idem, omgekeerd | idem |
| `jezus-1:nt-begin:5` Kana → Kapernaüm → Jeruzalem | Kapernaüm → Jordaandal **31 % (13 km) dwars over het meer** | langs de westoever: [32.875, 35.54], [32.855, 35.512], [32.8, 35.5], [32.73, 35.56] |
| `jezus-1:nt-galilea:0` Nazareth → Kapernaüm | 32 % meer | via [32.875, 35.54] |
| `jezus-2:nt-reis-naar-jeruzalem:7` Kapernaüm → over de Jordaan | 31 % meer | langs de westoever, als hierboven |
| `jezus-3:nt-opstanding:5` en `:8` | route eindigde/begon midden in het meer (`nt_meer`) | eind-/beginpunt aan de zuidoever [32.712, 35.585]; `at` blijft `nt_meer` |
| `handelingen:nt-paulusrome:0` Ptolemaïs → Caesarea | over zee om de Karmel | **over land** langs de kust (6 punten): de SV zegt ‘de scheepvaart volbracht hebbende … kwamen aan te Ptolemaïs’ (Hand. 21:7), daarna ‘gingen van daar’ (21:8) |
| `handelingen:nt-paulusrome:0` Milete → Kos → Rhodos | liep over het eiland Kos en het schiereiland Datça | via de haven van Kos en om Knidus heen: 0–5 % land |
| `handelingen:nt-paulusrome:7` Puteoli → Appiusmarkt | Sinuessa → Formiae **93 % over zee** (Golf van Gaeta) | Via Appia over land: [41.17, 13.88], [41.24, 13.77], [41.29, 13.66] |
| 4 routes en 1 `at` in Handelingen 9, 12, 21 en 23 | `sam_afek` (label ‘Afek’) | `nt_antipatris` (label ‘Antipatris’) |

Verder gecontroleerd en in orde:

- `recon` staat alleen waar de Bijbel alleen begin en eind noemt.
- De twaalf routes zonder `recon` (onder andere Hand. 13:4; 14:1–25; 16:11; 21:1–8; 23:31–33; 27:1–8; 28:11–15; Hand. 1:12) gaan alleen langs plaatsen die de tekst noemt. Hun pop-up zegt: ‘De Bijbel noemt de plaatsen langs deze route’.
- Inline-punten en `W` zijn geen tussenstations: ze krijgen geen marker.
- Gelijkenissen hebben geen route: v99, v104, v109, v111, v112, v114 en v120 gebruiken `view` of geen `at`.
- Openbaring heeft geen routes en geen visioenplaatsen, alleen Patmos en de zeven steden.
- Joas: Damascus → Gath → Jeruzalem is `recon` en `rood`. Profeten: Jeruzalem → Rama → Mizpa is `recon`. Leviticus heeft geen routes.

## Leesbaarheid

Schermafbeeldingen vóór de correcties staan in
`/tmp/claude-0/-home-user/1a96ab2f-b674-5904-88da-115d3ba6eb1f/scratchpad/k3/shots/`. Die erna staan in
`/tmp/claude-0/-home-user/1a96ab2f-b674-5904-88da-115d3ba6eb1f/scratchpad/k3/shots-na/`, als `desk-v<nr>.png` en
`ios-v<nr>.png`. Bekeken zijn v8, v26, v33, v38, v65, v83, v85, v87, v89, v92, v94, v106, v118, v123, v126, v130, v139,
v144, v145, v146, v147, v148 en v149. Ze staan niet in de repository.

### Opgelost in de data

| beeld | probleem | oplossing |
| --- | --- | --- |
| v94 storm (desk/ios) | Route van naamloos punt naar naamloos punt. Kapernaüm en de Gadarenen stonden niet in `at`/`ctx`. Route 10 km = 40 px. | `ctx` nt-galilea + `nt_kapernaum`; stap 8 `at` + `nt_gadara`; `zoom: 10` op stap 8 en 10 |
| v146 Milete → Jeruzalem | Milete, Kos, Rhodos en Patara stonden nooit in een `at`: route zonder namen. ‘Afek’ in Handelingen. | `at` stap 0 + 4 plaatsen; Antipatris |
| v147 storm op zee | Sidon, Knidus en Salmone (in de tekst genoemd) niet zichtbaar | `at` stap 4 + 3 plaatsen |
| v148 naar Rome | Regium, Appiusmarkt en Drie Tabernen (route ‘De Bijbel noemt …’) niet zichtbaar | `at` stap 7 + 3 plaatsen |
| v118, v123, v126 (Jeruzalem) | Zoom 9–10: Bethfagé, Olijfberg, Jeruzalem en tempel over elkaar heen; route van 1,5 km onzichtbaar | `zoom` 10 → 11 (het maximum van de kaart) in 21 stappen van nt-jezus-3, Bethesda en Siloam; intocht `zoom: 11` |
| v92 Bergrede | Stip in het meer; drukke ctx-labels op zoom 9 | punt op land, `zoom: 10` |
| v130 Emmaüs | Alt-labels ‘Emmaus-Nicopolis’ en ‘el-Qubeibeh’ overlapten | kortere alt-naam, `zoom: 10` |
| v147, v148, v145 | Rome en Efeze (`ctx`) als naamloze stip | `z: 4` |
| v89, v87 | Alt-ring ‘Enon bij Salim’ was inhoudelijk fout | alt Batanea |

### In `app.js` nodig (niet zelf gewijzigd)

1. **Maximale zoom 11 is te laag voor Jeruzalem** (r. 55, `maxZoom: 11`).
   - Tempel, Bethesda, Siloam, Golgotha, Gabbatha, Gethsémané en Olijfberg liggen 0,3–1,5 km uit elkaar. Op zoom 11 is dat 5–23 px.
   - Voorbeelden: `desk-v126.png` (Golgotha is een stipje in een lege kaart) en `ios-v118.png`.
   - Voorstel: `maxZoom` 13 en een eenvoudige stadsplattegrond van Jeruzalem (muur, tempelberg, Kidron) vanaf zoom 12. De `zoom` van de stappen kan dan naar 13.
2. **Alt-labels doen niet mee in de botsingscontrole** (r. ~168: altijd `s-r`, geen item in `refreshLabels`).
   - Voorbeelden: ‘el-Araj’ over ‘Bethsaïda’ (`desk-v92.png`), ‘Tuingraf’ over het bergje ‘Olijfberg’ (`desk-v126.png`) en ‘Batanea (Basan)’ onder de knop ‘Waar?’ (`ios-v87.png`).
   - Voorstel: alt-labels als items met `pr` 0,8 toevoegen en bij botsing verbergen (de ring blijft staan).
   - In `focusStory` (r. ~812) alt-ringen alleen tonen voor `focus.at`, niet voor `ctx`. Nu verschijnen Kafr Kanna, el-Araj en Hattin ook bij verhalen die er niets mee te maken hebben.
3. **Actieve labels kunnen buiten beeld vallen.** ‘Sid(on)’ is afgesneden in `ios-v147.png`. `labelRect` controleert de kaartrand alleen voor streken. Voorstel: voor gewone labels eerst de kanten proberen die binnen `size` vallen.
4. **Telefoon: te weinig ruimte in `fit()`.**
   - Het kaartvak op een iPhone 13 is ca. 306 px hoog. `paddingTopLeft` [60, 56] plus `paddingBottomRight` [24, 90] laat ca. 160 px over.
   - Paulus’ eerste reis (v144) komt daardoor op zoom ~4,5, met 12 actieve labels door elkaar. ‘Antiochië’ staat bij Seleucië, ‘Derbe’ onder ‘Tarsus’ (`ios-v144.png`).
   - Voorstel: op smalle schermen onder 24 px en boven 48 px padding. Bij meer dan ca. 6 actieve labels alleen begin, eind en de huidige stap benoemen; de rest krijgt nummers of verschijnt pas bij inzoomen.
5. **De ‘stip’ (NT-kameel) staat precies op de plaatsmarker** bij plek-verhalen. Het zekerheidsicoon is dan onzichtbaar (`desk-v126.png`, `ios-v106.png`, `ios-v146.png`: Tyrus). Voorstel: bij `vorm: "plek"` of zonder route geen stip, of de stip 12 px verschuiven.
6. **Ctx-markers zonder label** (label onder drempel `z`) verschijnen als naamloze stip. Voorstel: in de focusmodus ctx-labels altijd tonen of de ctx-marker weglaten als zijn label `off` is.
7. **Route-eindpunten buiten `at`/`ctx` zijn onzichtbaar** in de focusmodus. In de data is dat nu voor vier stappen opgelost. Generieke oplossing: plaats-id’s die begin of eind van een actieve route zijn, als marker (prioriteit 2) tonen.

## Open punten

1. **Namen in de teksten gelijktrekken met de kaart (HSV).** Buiten deze opdracht: tekstvelden. Te vervangen:
   - ‘Lystra’ → ‘Lystre’: nt-handelingen.js r. 28, 133, 136, 171 (ook `stamp`), 174, 175, 180, 186, 206; geschiedenissen/nt-4.js r. 210, 214, 217, 228; personen.js r. 924.
   - ‘Azote’ → ‘Asdod’ (of ‘Asdod (SV: Azote)’): nt-handelingen.js r. 80; nt-4.js r. 116.
   - ‘Rhodus’ → ‘Rhodos’: nt-handelingen.js r. 232.
   - ‘Forum van Appius’ → ‘Appiusmarkt’: nt-handelingen.js r. 267, 268.
   - ‘Pergamum’ → ‘Pergamus’: nt-openbaring.js r. 13, 30, 40 (ook `t`/`stamp`), 42, 43, 71; personen.js r. 947.
   - ‘Samothrace’ en ‘Bethanië over de Jordaan’ komen in de teksten niet voor; nt-jezus-1.js r. 117 noemt Bethabara al goed.
2. **Ondergrond, meer van Galilea** (`geo.json`, 18 hoekpunten). De noordoever ligt ca. 1 km te ver naar het noorden.
   - Kapernaüm (Tell Hum, juist punt) ligt daardoor 0,9 km ‘in het meer’. De laatste 3 km van routes naar Kapernaüm lopen over water.
   - De Jordaan-lijn loopt dwars door het meer (`ios-v92.png`).
   - Voorstel: een fijnere meerpolygoon (Natural Earth 10m lakes of OSM, vereenvoudigd).
3. **Kustplaatsen 0,1–1,0 km in zee** op de grove kustlijn. Het gaat om Caesarea, Salamis, Pafos, Attalia, Neapolis, Salmone, Schone Havens, Syracuse en Patara. De coördinaten zijn juist (OpenBible); op de gebruikte zoom is dat minder dan 2 px. Daarom niet verschoven.
4. **OT-routes met dezelfde fout als de vlucht naar Egypte** (Gaza → el-Arish 69 % over zee), buiten deze opdracht:
   - `genesis.js` r. 425 (Jozef naar Egypte) en r. 460 (`later`)
   - `2koningen.js` r. 187 (ballingschap)

   Dezelfde oplossing: [31.28, 34.25], [31.12, 33.95] tussen `gaza` en `arish`, en [31.0, 33.2] tussen `arish` en `pelusium`.
5. **Ongebruikte NT-plaatsen:** `nt_nain` en `nt_sichar` staan in geen enkele `at`/`ctx` en zijn dus nergens zichtbaar. Laten staan, of koppelen zodra er een verhaal bij komt.
6. **Tweede bron voor coördinaten:** behalve OpenBible (dat zelf meestal Wikidata gebruikt) is geen onafhankelijke atlas geraadpleegd. Een steekproef in een atlas of Pleiades wordt aanbevolen voor:
   - Kos (stad; punt uit eigen kennis, 36.893/27.288)
   - Hoorns van Hattin
   - Batanea
   - de inline-routepunten bij Rafia, de Via Appia en de Karmelkust
7. **`ctx` van nt-galilea** bevat nu 5 plaatsen (Nazareth, Kapernaüm, Bethsaïda, Magdala, Kana). Op de telefoon vallen Magdala en Kapernaüm bij sommige verhalen weg door botsingen (v92). Dat is acceptabel, maar kan beter met codepunt 2/4.
8. **Labelkant (`s`)** is niet aangepast. De automatische plaatsing kiest bij botsing zelf een andere kant, en een vaste kant hielp in geen enkel bekeken beeld meer dan de code-punten hierboven.

## Bronnen (geraadpleegd 25 oktober 2026)

- OpenBible.info, *Bible Geocoding Data*, `ancient.jsonl`, CC BY 4.0 (https://github.com/openbibleinfo/Bible-Geocoding-Data).
- Herziene Statenvertaling, https://herzienestatenvertaling.nl/teksten/ (Mattheüs 2, 4, 8, 15, 16, 21, 26; Markus 5; Lukas 1, 7, 9, 17, 24; Johannes 1–5, 9, 11, 19; Handelingen 8, 9, 11, 13, 14, 16, 20, 21, 23, 27, 28; Openbaring 1, 2) — alleen voor spelling van plaatsnamen.
- Statenvertaling (editie 1888) in `public/bijbelreis/bijbel/*.json`, voor citaten en verwijzingen.
- `public/bijbelreis/geo.json` (Natural Earth), voor land/water.

## Verwerkt na deze controle (25 oktober 2026)

Codepunten in `app.js`:

| # | Punt | Verwerkt |
| --- | --- | --- |
| 1 | maxZoom te laag voor Jeruzalem | `maxZoom` 13. Stappen in Jeruzalem met meer plaatsen of een korte route: `zoom` 13; met één plaats: 12. **Geen stadsplattegrond**: de loop van de muren in de 1e eeuw is deels onzeker en wordt niet verzonnen. |
| 2 | Alt-labels zonder botsingscontrole | Alt-labels doen mee met voorrang 0,8; bij een botsing verdwijnt het label en blijft de ring staan. In een geschiedenis verschijnen alt-ringen alleen bij plaatsen van die geschiedenis, niet bij de vaste context van het deel. |
| 3 | Labels buiten beeld | Eerst worden kanten geprobeerd die binnen de kaart vallen. Actieve labels kiezen bij een botsing de kant met de minste overlap binnen de kaart. |
| 4 | Telefoon: te weinig ruimte | Marge in `fit()` op smalle schermen 50/44 (links/boven) en 16/34 (rechts/onder, zonder stappenbalk). Bij meer dan 6 actieve namen op een smal scherm houden alleen begin en eind voorrang; de rest wijkt bij botsing en verschijnt bij inzoomen of op de grote kaart. |
| 5 | Reisstip op de plaatsmarker | Zonder route geen reisstip. |
| 6 | Naamloze contextstippen | In een geschiedenis wordt een contextplaats zonder zichtbaar label helemaal verborgen (`.pl.stil`). |
| 7 | Route-eindpunten onzichtbaar | Begin en eind van elke niet-rode route van de geschiedenis tellen als plaats van de geschiedenis (marker en label). |

Open punten:

| # | Punt | Verwerkt |
| --- | --- | --- |
| 1 | Namen in de teksten | Lystra → Lystre; Forum van Appius → Appiusmarkt; Pergamum → Pergamus (zo spelt de SV ze ook); Rhodus → Rhodos; Samothrace → Samothrake. Azote → ‘Asdod (Statenvertaling: Azote)’. Citaten uit de SV zijn niet gewijzigd. In totaal 33 regels. |
| 2 | Meer van Galilea | Noordoever in `geo.json` gecorrigeerd: Tabgha 32,870 N, Kapernaüm-oever 32,8785, monding Jordaan 32,884. Kapernaüm, Tabgha, Magdala en de Bergrede liggen op land. De Jordaan wordt niet meer door het meer getekend. De correctie zit ook in `scripts/bijbelreis-geo.py`, zodat ze bij opnieuw genereren niet verloren gaat. |
| 4 | OT-routes over zee | Tussenpunten op land gevonden met een zoekroutine (segment voor segment 100 % land), toegepast op: Gaza–el-Arish–Pelusium (Jozef, Genesis 50 ‘later’, Josia), Akaba–Nuweiba (Mozes heen en terug), Hazeroth–Ezeon-Geber, Elim–Sin, Sarfath–Tyrus–kust (Elia), Jordaanvlakte–Lisan en Lisan–Jericho (via het hoogland ten oosten van de Dode Zee) en Sodom–Zoar (oostoever). |

Na deze correcties gaan over water nog alleen:
- de bedoelde zeereizen en de tochten over het meer;
- de doortocht door de Schelfzee;
- Mara en Elim: de route begint midden in de zee, op het eindpunt van de doortocht;
- Op weg naar Jeruzalem (Handelingen 21): een deel van deze reis gaat per schip;
- randgevallen van 1–3 % langs de grove kustlijn.

Nog open: punt 3 (kustplaatsen tot 1 km in zee op de grove kustlijn), 5 (Naïn en Sichar ongebruikt), 6 (tweede bron voor enkele coördinaten), 7 en 8.
