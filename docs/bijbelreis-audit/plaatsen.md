# Audit plaatsen Bijbelreis (`public/bijbelreis/plaatsen.js`)

Datum: 25 oktober 2026. Gecontroleerd: alle 152 plaatsen in `BR.plaatsen` en alle 81 tussenpunten in `BR.W`. Geen id of W-sleutel is hernoemd of verwijderd. `s` en `z` zijn niet gewijzigd. `node --check public/bijbelreis/plaatsen.js` slaagt.

## Werkwijze

1. **Data ophalen.** Alle data zijn als JSON gedumpt met het dumpscript, met per plaats de stappen die haar gebruiken.
2. **Koppelen aan OpenBible.** Elke plaats is gekoppeld aan de juiste plaats in OpenBible.info *Bible Geocoding Data* (`data/ancient.jsonl` en `data/modern.jsonl`, branch `main`). Bij dubbele namen is op Bijbelvers gekozen, bijv. Gilgal 1 (Jozua 4) en niet Gilgal 2 (2 Koningen 2).
3. **Coördinaten vergelijken.** Per plaats is gekeken naar alle identificaties, met de zekerheidsscore van OpenBible (`time_total`, 0–1000) en de afstand tot het huidige punt. De coördinaten van de moderne plekken komen in OpenBible meestal uit Wikidata. Bij elke plek staat de bron vermeld (Wikidata-Q-nummer, DAAHL, MegaJordan, GeoNames of OSM).
4. **Steekproef in Pleiades.** Ter controle zijn enkele plaatsen opgezocht in Pleiades: Mari, Dothan, Pitom/Heroonpolis en Harran.
5. **Land of water.** Elk punt is getoetst aan de ondergrond van de kaart (`geo.json`: land, meren). Daarbij is gecontroleerd of het punt in zee of in een meer ligt.
6. **Teksten nagelopen.** Elke uitleg `d` is nagelopen tegen de Statenvertaling in `public/bijbelreis/bijbel/*.json`.

Wikipedia en Wikidata waren vanuit deze sessie niet rechtstreeks bereikbaar (HTTP 429, limiet bereikt). Wikidata-coördinaten zijn daarom alleen gebruikt zoals OpenBible ze overneemt.

**Regels voor de zekerheid `c`**

| `c` | Wanneer gekozen |
| --- | --- |
| `v` | De naam bleef bewaard, of de tell is algemeen aanvaard. In OpenBible geldt dat ongeveer bij een score van 800 of hoger zonder serieuze tegenkandidaat. |
| `w` | Er is een duidelijke meerderheidsidentificatie (ongeveer 500–800), of er zijn bekende bezwaren. |
| `b` | Er zijn twee of meer serieuze kandidaten die verder dan ongeveer 3 km uit elkaar liggen. Deze krijgen `alt`. |
| `o` | Alleen de streek is bekend, of er zijn alleen zwakke voorstellen. Het punt is illustratief en ligt bij het best ondersteunde voorstel of op de route. |
| `r` | Streek, gebergte of land. |

Eden staat op `o` en Ararat op `r`.

## Verdeling van de zekerheid

| `c` | vóór | na |
| --- | ---: | ---: |
| v (identificeerbaar) | 46 | 56 |
| w (waarschijnlijk) | 37 | 34 |
| b (betwist, met `alt`) | 0 | 13 |
| o (onbekend) | 48 | 29 |
| r (gebied) | 16 | 15 |
| contextlabels (`ctx`, geen `c`) | 5 | 5 |

**Gewijzigde zekerheid**

- **o → w:** Zoar, Rehoboth, Mahanaïm, Pniël, El-Paran, Elim, Punon, Gilgal, Timnath-Serah, Abel-Mehola, Rivier Kebar, Pethor, Dal Achor.
- **o → b:** Sodom, Pitom, berg Hor, Ai, Ziklag, Eglon.
- **w → v:** Dothan (2×), Jeruzalem (`salem`), Hebron/Mamre, Kirjath-Jearim, Gath, Zora, Timna, Eikdal, Afek, Kehila.
- **w → b:** berg Sinaï, Horeb, Ezeon-Geber, Rama, Jabes in Gilead, Kedes-Naftali.
- **r → b:** Schelfzee.
- **v → w:** Hesbon. Bij Tell Hesban zijn geen resten uit de tijd van Sihon gevonden.

Alle plaatsen hebben nu `nu` en `bron`. De vijf contextlabels hebben alleen `nu` en `bron`, zonder `c`.

## Gecorrigeerde coördinaten

De afstand is de verschuiving in km. Coördinaten staan als lat, lng.

| id | was | wordt | km | c | bron (gekozen identificatie) |
| --- | --- | --- | ---: | --- | --- |
| `dothan` | 32.43, 35.2 | 32.4135, 35.2399 | 4.2 | v | Tel Dothan (OpenBible 877; Wikidata Q2916407; Pleiades 857932175) |
| `dothanelisa` | 32.43, 35.2 | 32.4135, 35.2399 | 4.2 | v | idem |
| `bethel` | 31.93, 35.226 | 31.9228, 35.2414 | 1.7 | w | Beitin (716; Q3876767) |
| `mamre` | 31.54, 35.1 | 31.5251, 35.1022 | 1.7 | v | Hebron, Tel Rumeida (Q13577875); Mamre/Ramat el-Khalil 3 km N in `bron` |
| `sodom` | 31.255, 35.535 | 31.2487, 35.523 | 1.3 | b | Bab edh-Dhra (MegaJordan); alt Tall el-Hammam |
| `zoar` | 31.03, 35.47 | 31.0369, 35.4877 | 1.9 | w | es-Safi (347; Q27125336) |
| `rehoboth` | 31.03, 34.63 | 31.0311, 34.5658 | 6.1 | w | Ruheibeh (556; Q26768940) |
| `mahanaim` | 32.27, 35.73 | 32.1857, 35.6867 | 10.2 | w | Tell edh-Dhahab el-Gharbi (654; Q27124634) |
| `pniel` | 32.17, 35.7 | 32.187, 35.6921 | 2.0 | w | Tell edh-Dhahab esh-Sherqiyeh (694; MegaJordan) |
| `asterot` | 32.8, 36.01 | 32.8042, 36.0158 | 0.7 | w | Tell Ashtara (833; Q21582562) |
| `elparan` | 29.56, 34.96 | 29.5307, 35.0 | 5.1 | w | = Elath, Akaba (645) |
| `kades` | 30.63, 34.42 | 30.6483, 34.4222 | 2.0 | w | Ain el-Qudeirat (864; Q954599) |
| `kadesbarnea` | 30.63, 34.42 | 30.6483, 34.4222 | 2.0 | w | idem |
| `pithom` | 30.55, 32.1 | 30.5475, 31.9636 | 13.1 | b | Tell er-Retaba (419; Q19717027); alt Tell el-Maskhuta (171; Pleiades 727124 noemt Maskhuta Pithom) |
| `sukkotheg` | 30.58, 32.25 | 30.5527, 32.099 | 14.8 | o | bij Tell el-Maskhuta (206; Q121773) |
| `pihachiroth` | 30.2, 32.55 | 30.2252, 32.4695 | 8.2 | o | lag **in het Bittermeer**; nu vlakte bij Jebel Geneifa (103) |
| `mara` | 29.4, 32.9 | 29.346, 32.9428 | 7.3 | o | Ain Hawara (384; GeoNames 356019) |
| `elim` | 29.17, 32.98 | 29.2547, 32.9158 | 11.3 | w | Wadi Gharandal (533; Q23951432); lag op de kaart **in zee** |
| `sinai` | 28.54, 33.98 | 28.5397, 33.9733 | 0.7 | b | Jebel Musa (465; Q377485) |
| `horeb` | 28.54, 33.98 | 28.5397, 33.9733 | 0.7 | b | idem |
| `kibroth` | 29.1, 34.2 | 28.7887, 34.2754 | 35.4 | o | Erweis el-Ebeirig (405) |
| `hazeroth` | 29.3, 34.4 | 28.8969, 34.4217 | 44.9 | o | Ain Khadra (481; Q23950724) |
| `ezeongeber` | 29.53, 34.95 | 29.5472, 34.9803 | 3.5 | b | Tell el-Kheleifeh (Q2402239); lag **in zee**; alt Jezirat Fara‘un |
| `hor` | 30.32, 35.4 | 30.8321, 35.0569 | 65.7 | b | Har Zin (336; Q26763722); alt Jebel Harun (traditie, −87) |
| `punon` | 30.62, 35.5 | 30.6277, 35.4936 | 1.1 | w | Khirbet Feinan (755; Q28408071) |
| `sittim` | 31.85, 35.63 | 31.8402, 35.6737 | 4.3 | w | Tall el-Hammam (671; Q55634648) |
| `gilgal` | 31.87, 35.5 | 31.8819, 35.46 | 4.0 | w | Khirbet el-Mefjir (556; Q2456319) |
| `timnath` | 32.05, 35.15 | 32.0081, 35.1073 | 6.2 | w | Khirbet Tibnah (809; DAAHL 353204932) |
| `rama` | 31.84, 35.23 | 31.8543, 35.2316 | 1.6 | b | ar-Ram (DAAHL 353103858); alt Beit Rima, Rentis |
| `mizpa` | 31.88, 35.18 | 31.8851, 35.2164 | 3.5 | w | Tell en-Nasbeh (781; Q7697543) |
| `kirjathjearim` | 31.8, 35.1 | 31.809, 35.1038 | 1.1 | v | Deir el-Azar (1000; Q3303084) |
| `timna` | 31.78, 34.92 | 31.7848, 34.9103 | 1.1 | v | Tel Batash (836; Q6903336) |
| `adullam` | 31.65, 34.98 | 31.6517, 35.0017 | 2.1 | w | Kh. esh-Sheikh Madhkur (737; Q26770962) |
| `ziklag` | 31.38, 34.87 | 31.3912, 34.6816 | 17.9 | b | Tel Sera‘/Tell esh-Sharia (531; Q578876); alt Tel Halif, Kh. a-Ra‘i |
| `jabes` | 32.45, 35.62 | 32.4024, 35.6823 | 7.9 | b | Tell el-Maqlub (698; Q27122570); alt Tell Abu el-Kharaz |
| `kerith` | 32.3, 35.62 | 32.3947, 35.5914 | 10.9 | o | Wadi al-Yabis (335; Q49773648) |
| `sarfath` | 33.45, 35.3 | 33.4642, 35.2951 | 1.6 | v | Sarafand/Sarepta (1000; OSM-node 3199142544) |
| `sareptaw` | 33.45, 35.3 | 33.4642, 35.2951 | 1.6 | ctx | idem |
| `abelmehola` | 32.37, 35.52 | 32.3743, 35.5609 | 3.9 | w | Tell Abu Sus (656; Q31493247) |
| `pethor` | 36.75, 38.05 | 36.68, 38.08 | 8.2 | w | Pitru, tussen Til Barsip (Q176458) en Tell Aushariye (Q7199033) (998) |
| `jo_achor` | 31.83, 35.4 | 31.7167, 35.3833 | 12.7 | w | el-Buqei‘a (604; GeoNames 285104) |
| `jo_eglon` | 31.55, 34.78 | 31.4918, 34.9281 | 15.5 | b | Tel ‘Eton (574; Q49004219); alt Tel Hesi |
| `jo_debir` | 31.42, 34.98 | 31.4321, 35.0149 | 3.6 | w | Khirbet Rabud (775; DAAHL 353107382) |
| `ri_kedes` | 33.11, 35.53 | 33.1116, 35.5295 | 0.2 | b | Tel Kedesh (Q2585161); alt Kh. Qedish |
| `ri_more` | 32.61, 35.38 | 32.6176, 35.3487 | 3.1 | w | Givat HaMoreh (770; Q1092415) |
| `sam_bezek` | 32.39, 35.4 | 32.3688, 35.3974 | 2.4 | w | Khirbet Ibziq (753; Q49354325) |
| `sam_kehila` | 31.615, 34.97 | 31.6137, 35.0036 | 3.2 | v | Khirbet Qila (815; DAAHL 353102584) |
| `sam_zif` | 31.49, 35.13 | 31.4748, 35.1351 | 1.8 | w | Tell Zif (760; Q31247748) |
| `jona_verdek` | 36.33, 43.42 | 36.36, 43.2 | 20.0 | o | lag 24 km van Ninevé; nu net ten oosten van de stadsmuur (Jona 4:5) |

**Tussenpunten (`BR.W`)**

| sleutel | was | wordt | km | reden |
| --- | --- | --- | ---: | --- |
| `timsah` | 30.58, 32.3 | 30.61, 32.28 | 3.8 | Lag midden in het Timsahmeer (het meer staat niet in `geo.json`). Nu op land aan de noordoever, bij Ismailia, op de overgang tussen Wadi Tumilat en de Weg naar Sur. |
| `lisan` | 31.5, 35.47 | 31.28, 35.5 | 24.6 | Lag midden in de Dode Zee. Nu op het schiereiland el-Lisan, de bekende doorgang tussen Moab en Juda. |
| `wadimusa` | 30.2, 35.5 | 30.32, 35.48 | 13.5 | Lag 13 km ten zuiden van Wadi Musa. Niet gebruikt in routes. |
| `opis` | 33.5, 44.4 | 33.18, 44.7 | 45.2 | Opis ligt aan de Tigris (OpenBible/Wikidata Q1287526). Niet gebruikt in routes. |

Alle andere tussenpunten liggen op land en op een plausibele route: Eufraatroute, Koningsweg, bergrug, kustweg, Weg naar Sur en Sinaï-routes. De bewuste uitzondering is `siddim` (31.2, 35.45): dat punt ligt in het zuidelijke bekken van de Dode Zee. Dat is juist, want de Bijbel zegt ‘het dal Siddim, dat is de Zoutzee’ (Genesis 14:3).

Afwijkingen kleiner dan ongeveer 1 km zijn niet aangepast. Voorbeelden: Haran, Sichem, Jeruzalem, Bethlehem, Berseba, Gerar, Jericho, Hazor, Silo en de Filistijnse steden. Die liggen binnen 0,1–0,8 km van de bron.

## Water en zee

**Na correctie bewust in het water:**
- **Schelfzee:** de noordpunt van de Golf van Suez.
- **De pijl ‘Naar Tarsis →’:** die ligt midden in de Middellandse Zee en wijst alleen de richting.
- **Tussenpunt `siddim`:** zie hierboven.
- **`alt`-ringen van de Schelfzee:** de Bittermeren (in `geo.json`), het Timsahmeer en de Ballahmeren.
- **`alt`-ring Jezirat Fara‘un:** een eilandje voor de kust, dat op de grove ondergrond in zee valt.

**Aan de kust, maar op land:** Askelon, Sidon, Tyrus, Joppe, Zarfath, El-Paran/Akaba en Ezeon-Geber liggen binnen 1 km van de kustlijn van de ondergrond, maar op land. En-Gedi en het tussenpunt `hazezon` liggen 0,8 km van de Dode Zee, ook op land.

## Betwiste plaatsen (`c: "b"`) en kandidaten

| id | hoofdpunt | `alt` | toelichting |
| --- | --- | --- | --- |
| `sodom` | Bab edh-Dhra (zuid) | Tall el-Hammam (noord) | OpenBible: zuidelijk bekken 386 + Bab edh-Dhra 135; noord 115 + Tall el-Hammam 30. Tall el-Hammam is ook de beste kandidaat voor Sittim. |
| `pithom` | Tell er-Retaba | Tell el-Maskhuta | 419 tegen 171; Pleiades noemt Maskhuta ‘Pithom/Heroonpolis’. |
| `schelfzee` | Golf van Suez | Bittermeren, Timsahmeer, Ballahmeren | 369 / 304 / 128 / 100. De Golf van Akaba (62, met netto negatieve stemmen) is **niet** als alt opgenomen. |
| `sinai`, `horeb` | Jebel Musa | Jebel Serbal, Har Karkom | 465 / 54 / 103 (ook Jebel Sin Bishar 89). **Jebel al-Lawz komt in de bronnen van OpenBible niet voor** en is daarom niet opgenomen. |
| `ezeongeber` | Tell el-Kheleifeh | Jezirat Fara‘un | Stemtotaal 442 tegen 208, maar de recente score keert om (239 tegen 360). |
| `hor` | Har Zin (bij Kades) | Jebel Harun (bij Petra) | Numeri 20:22–23: ‘aan de pale van het land van Edom’, vanuit Kades. De traditie bij Petra scoort −87. |
| `ai` | et-Tell | Kh. el-Maqatir, Kh. Nisya | 522 / 75 / 28. Et-Tell heeft geen bewoning uit de Late Bronstijd. De kandidaten liggen 1–4 km uit elkaar. |
| `rama` | ar-Ram | Beit Rima, Rentis | Samuëls Rama = Ramathaïm-Zofim ‘van het gebergte van Efraïm’ (1 Samuël 1:1). |
| `ziklag` | Tel Sera‘ | Tel Halif, Kh. a-Ra‘i | 531 / 107 / 28. Kh. a-Ra‘i is een recent voorstel (opgraving Garfinkel). |
| `jabes` | Tell el-Maqlub | Tell Abu el-Kharaz | 698 / 158. |
| `jo_eglon` | Tel ‘Eton | Tel Hesi | 574 / 24. Tel Hesi is de oudere identificatie, met een stemtotaal van 334. |
| `ri_kedes` | Tel Kedesh | Kh. Qedish | Voor Richteren 4 kiezen veel onderzoekers Kh. Qedish (365) in plaats van Tel Kedesh (271 + 119). |

**Bewust níet op `b` gezet**

- **Kades / Kades-Barnea (`w`).** Ain el-Qudeirat scoort 864. Het oude voorstel Ain Qedeis scoort −93 en ligt maar 8 km verder; dat staat in `bron`. Er is geen tweede kandidaat die even serieus is.
- **Gilgal (`w`).** De voorstellen bij Jericho (Kh. el-Mefjir, Tell el-Jurn, Suwwanet eth-Thaniya) liggen allemaal binnen 1 km van elkaar. De ‘voet’-omheiningen van Zertal (Bedhat esh-Sha‘ab, el-Unuq) scoren 20 en 14 en zijn te zwak voor een alt.
- **Zoar (`w`).** Zoar volgt de keuze voor Sodom; in `bron` staat dat de twee samenhangen.

## Belangrijkste inhoudelijke correcties in `d`

| Plaats | Wat er stond | Nu |
| --- | --- | --- |
| Silo | ‘Hier stond de tabernakel ruim 300 jaar’. Dat getal staat niet in de Bijbel. | ‘vanaf de tijd van Jozua (Jozua 18:1)’ |
| Kades-Barnea | ‘De oase waar het volk bijna 38 jaar rondtrok’. Dat staat er niet. | De 38 jaar zijn ‘van Kades-Barnea tot de beek Zered’ (Deuteronomium 2:14). |
| Bethlehem | ‘Hier werd Rachel begraven’ | ‘aan de weg naar Efrath’ (Genesis 35:19) |
| Bethlehem | ‘David wordt hier geboren’ | ‘David kwam hier vandaan’ (1 Samuël 16). Zijn geboorte daar staat niet letterlijk in de tekst. |
| Ararat | ‘Een heel gebergte in Turkije met een top van ruim 5100 m’. Dat suggereerde dat het die top was. | ‘op de bergen van Ararat’ (Genesis 8:4); welke berg het was, zegt de Bijbel niet. |
| Etham | ‘Aan de rand van de woestijn’, als citaat | ‘Aan het einde der woestijn’, het citaat uit de Statenvertaling (Exodus 13:20) |
| Punon | Gekoppeld aan de koperen slang | De Bijbel noemt de plek van de koperen slang niet. |
| Arnon | — | ‘de landpale van Moab, tussen Moab en de Amorieten’ (Numeri 21:13) |
| Ezeon-Geber | ‘aan de Rode Zee’ | ‘bij Eloth, aan de oever der Schelfzee’ (1 Koningen 9:26) |
| Zarfath | — | ‘bij Sidon’ |
| Anathoth | ‘Geboorteplaats van Jeremia’ | ‘uit een familie van priesters in Anathoth’ (Jeremia 1:1) |
| Zora | ‘Geboorteplaats van Simson’ | ‘woonplaats van Manoach’ (Richteren 13:2) |
| Damascus | ‘Hier woonde Naäman’ | ‘de rivieren van Damascus’ (2 Koningen 5:12) |
| Tisbe | ‘Woonplaats van Elia’ | ‘de Thisbiet, van de inwoners van Gilead’ (1 Koningen 17:1) |
| Ekbatana | — | De Bijbelse naam Achmetha en de rol van Kores (Ezra 6:2–3) |
| Halah | ‘de tien stammen’ | De tekst van 2 Koningen 17:6 |
| Scheba | 1500 km | De afstand van de pijl tot Saba (Marib) is ongeveer 1400 km. |
| Jona’s verdek | Lag 24 km van de stad | Nu vlak buiten de stad (Jona 4:5) |
| Kon. Jordaan/Naäman | ‘dichtstbijzijnde oversteekplaats vanaf Samaria’. Dat is niet te controleren. | Weggehaald |
| Hesbon, Ai, Gilgal, Sinaï, Hor, Rama, Ziklag, Jabes, Kedes, Eglon | — | De onzekerheid staat nu in `d` of in `bron`. |

## Gebruikte bronnen (geraadpleegd 25 oktober 2026)

- **OpenBible.info, *Bible Geocoding Data*.** Licentie: **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/). Gebruikt: identificaties, zekerheidsscores en coördinaten.
  - https://github.com/openbibleinfo/Bible-Geocoding-Data, branch `main`. Bestanden: `data/ancient.jsonl`, `data/modern.jsonl`, `readme.md` en `license.txt`, via raw.githubusercontent.com.
  - De coördinaten in OpenBible komen grotendeels uit Wikidata (CC0). Enkele komen uit DAAHL, MegaJordan, GeoNames (CC BY) en één uit OpenStreetMap (ODbL): Sarafand, OSM-node 3199142544.
- **Pleiades**, https://pleiades.stoa.org. Licentie: CC BY 3.0. Alleen gebruikt als controle van Mari (286681704), Dothan (857932175), Heroonpolis/Pithom (727124) en Harran (658427). Er zijn geen gegevens overgenomen.
- **Statenvertaling** in `public/bijbelreis/bijbel/*.json` (publiek domein), voor alle citaten en verwijzingen in `d`.
- **Ondergrond** `public/bijbelreis/geo.json` (Natural Earth), voor de controle op land en water.
- Gangbare Bijbelatlassen zijn **niet** geraadpleegd. Wikipedia was niet bereikbaar (HTTP 429).

### Naamsvermelding voor de pagina (verplicht door CC BY 4.0)

> Ligging van Bijbelse plaatsen mede gebaseerd op OpenBible.info Bible Geocoding Data (https://github.com/openbibleinfo/Bible-Geocoding-Data), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Bewerkt: eigen keuze van identificaties, zekerheidsklassen en teksten.

## Open punten voor de hoofdagent en de inhoudsagenten

1. **Routes via de berg Sinaï naar Egypte.** In 4 routes staat `"sinai"` (de Jebel Musa, diep in Zuid-Sinaï) tussen `nitz` en `sur`, op de weg van Juda naar Egypte. Daar hoort het tussenpunt `"sinaiw"` (Noord-Sinaï). Het gaat om:
   - `1koningen:salomo:7` (`inhoud/1koningen.js` r. 74)
   - `1koningen:salomo:8` (r. 79)
   - `2koningen:ballingschap:8` (`inhoud/2koningen.js` r. 157)
   - `esther:esther:7` (`inhoud/esther.js` r. 60)

   Dezelfde fout is eerder in Genesis hersteld (zie het commitbericht van c6a769c).
2. **Numeri 20, route naar de berg Hor.** Hor staat nu bij Kades (Har Zin). Het inline-tussenpunt `[30.45, 34.95]` in de route `kadesbarnea → … → hor` (`inhoud/numeri.js` r. 68) maakt daardoor een omweg naar het zuiden. Dat punt kan weg.
3. **Overlappende punten.**
   - Mahanaïm en Pniël liggen nu 0,5 km uit elkaar: de twee heuvels van Tulul edh-Dhahab.
   - Gilgal ligt 1,9 km van Jericho.
   - Sukkoth (Egypte) valt samen met de alt-ring van Pitom (Tell el-Maskhuta).
   - Sittim valt samen met de alt-ring van Sodom (Tall el-Hammam).

   Dit moet de automatische labelplaatsing opvangen.
4. **De term ‘tabernakel’.** De Statenvertaling zegt bij Silo ‘de tent der samenkomst’; die term staat nu in `d`. Als de inhoudsbestanden ‘tabernakel’ gebruiken, kan dat zo blijven.
5. **Niet onafhankelijk controleerbaar.** De volgende plaatsen hangen alleen af van de scores in OpenBible. Een atlas of Wikipedia kan later als extra controle dienen.
   - Kibroth-Taäva, Hazeroth, Mara, Rafidim, Etham en Pi-Hachiroth (alle `o`, punten illustratief)
   - Lodebar, Tisbe, Ofra, Lechi en Makkeda (`o`)
   - Chebar (`w`)
6. **Nieuwe velden in de pop-up.** `nu` verschijnt als klein label op de kaart en `bron` in de pop-up (‘Ligging: …’). De teksten zijn kort gehouden. Als `nu` op de kaart te druk wordt, kan de hoofdagent het daar verbergen.
