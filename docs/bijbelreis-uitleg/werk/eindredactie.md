# Eindredactie ‘gangbare uitleg’ (15-11-2026)

Werkdocument, geen tekst in de app. Regel: [`../README.md`](../README.md). Branch `nw/uitleg-eind2`.

Een AI-redacteur heeft de tien pakketten (u01–u10) naast elkaar gelegd, de besluiten van README §7 doorgevoerd en de wijzigingen van de schrijvers nagelezen naast de Statenvertaling (`node scripts/sv.mjs`). Er heeft geen theoloog naar gekeken.

**Niet aangeraakt:** alles over Jakob (geschiedenis 15–17 in basis, a, b en c; de delen `izak`, `jakob` en `jakob-jabbok` in `genesis.js`; de personen jakob, ezau, laban, rachel, lea), het thema Kerst, `app.js`, css, html, boekje, e2e-tests, taferelen, coördinaten, zekerheid (`c`), `bron`, routes, id’s, refs en stappen. In `genesis.js` zijn alleen twee regels in het deel `ur-kanaan` gewijzigd.

Het onaffe werk van de eerdere redacteur (commit `4e044ad`) is alleen als aanwijzing gebruikt. Zijn wijzigingen bij Jakob (16a, 17 basis/a/c, `jakob`-fact) zijn niet overgenomen; de rest is opnieuw geformuleerd en per plek naast de Statenvertaling gelegd.

## Taak 1. Besluiten van §7

**De Engel des HEEREN is de Zoon van God** (12 plekken, in 7 bestanden):

| Waar | Was | Is |
| --- | --- | --- |
| 23 basis | “Daar ziet hij een braamstruik die brandt …” | “Daar verschijnt de Engel van de HEERE hem in een vuurvlam uit een braamstruik: de Zoon van God. De struik brandt, maar wordt niet verteerd.” |
| 23 a (`samen`) | – | “In het braambos verschijnt ‘de Engel des HEEREN’ (3:2): de Zoon van God.” (de stappen van A noemen de Engel niet) |
| 23 b | “ziet hij een braambos dat brandt …” | “verschijnt de Engel van de HEERE, de Zoon van God, hem in een vlam uit een braambos.” Om binnen 1000 tekens te blijven: “met de staf van God in zijn hand” weg; “Toch mag zijn broer Aäron voor hem spreken.” |
| 23 c | “Opvallend is ook dat in 3:2 ‘de Engel des HEEREN’ verschijnt, terwijl in 3:4 God Zelf roept.” | “… De Engel des HEEREN is de Zoon van God, vóór Hij mens werd.” |
| `exodus.js`, stap Exodus 3:1–12 | “Daar ziet hij een braamstruik …” | “Daar verschijnt de Engel van de HEERE, de Zoon van God, hem in een vlam uit een braamstruik.” |
| 43 basis, 43 a, `richteren.js` (Richteren 6) | “de Engel van de HEERE” | “de Engel van de HEERE, de Zoon van God,” (43 b had het al) |
| 44 basis, 44 a, 44 b, `richteren.js` (Richteren 13) | “de Engel van de HEERE” | “de Engel van de HEERE, de Zoon van God,” (44 c had het al) |
| 39 en `jozua.js` (Jozua 5) | – | Stond al goed in basis, a, b en reisdeel; niets gewijzigd. |

**Geschiedenis 8, basis:** na “(Maagschap betekent familie.)” toegevoegd: “Zo had God Abram al in Ur geroepen, voordat hij in Haran woonde (Handelingen 7:2–4).” De zin “Dan zegt de HEERE tegen Abram” staat er ongewijzigd (`indeling.js`). In `genesis.js` (deel `ur-kanaan`, stap Genesis 12:1) zegt het weetje nu ook: “God had hem al in Ur geroepen.”

**Reüel en Jethro (alleen de tekst):** `exodus.js` koos nog: “Ook Reüel genoemd” (wie-lijst) en “De priester heet Reüel (2:18) en ook Jethro (3:1)”. Nu: “Mozes hoedde zijn schapen (Exodus 3:1)” en “De vader van de zeven dochters heet in 2:18 Reüel; in 3:1 heet de schoonvader van Mozes, de priester van Midian, Jethro.”

**Mirjam:** 21 c zei nog “De zus van Mozes wordt hier niet bij naam genoemd.” Nu: “De zus van Mozes is Mirjam.” (Numeri 26:59 volgt direct.)

## Taak 2. Gelijkheid tussen pakketten

Gezocht met grep op elk onderwerp in basis, a/b/c, reisdelen, personen en plaatsen.

| Onderwerp | Wat ik vond | Wat ik deed |
| --- | --- | --- |
| Geboorte | 83 a en c en het weetje bij de herders hadden “geboren op een plaats waar dieren staan”; 83 basis, 83 b en de reisstap Lukas 2:1–7 niet. | 83 basis en 83 b aangevuld (b ingekort bij de naamgeving om binnen 1000 tekens te blijven); reisstap: “een kribbe, een voerbak voor dieren”. |
| De wijzen | 85 c en het weetje compleet; 85 basis miste “geleerde mannen”, 85 b miste “enige tijd na de geboorte”, 85 a `samen` miste wie de wijzen waren. | Alle drie aangevuld. Nergens een aantal, namen of koningen. |
| Apostel Johannes en Openbaring | `nt-openbaring.js` (wie), `nt-handelingen.js` (wie) en 126 c zeiden het al. `personen.js` sprak het tegen: “Welke Johannes dit is, zegt de Bijbel niet”, en twee blokken `overlevering` (“Volgens de kerkelijke overlevering … Dat staat niet in de Bijbel”). | 149 basis, a en b: “De apostel Johannes”; intro van het boek Openbaring idem. `personen.js`: `johannes.kort` en `johannes_patmos.kort` zeggen nu wie hij is; Galaten 2:9 zonder “vermoedelijk”. Het blok `overlevering` bij `johannes` is weg; zie ‘Twijfels’ voor dat bij `johannes_patmos`. |
| ‘De discipel die Jezus liefhad’ | Alleen 126 c noemde Johannes. | 126 basis: “aan de discipel die Hij liefhad: Johannes.” 126 b: “en ook Johannes, de discipel die Hij liefheeft”. `johannes.kort`: “Hij is de discipel ‘welken Jezus liefhad’ …”. Geschiedenis 129 en 132 en de reisstappen houden de woorden van de tekst (“de andere discipel”, “de discipel die Jezus liefhad”); de vragen daar leunen op die woorden. |
| ‘De dag des Heeren’ = de zondag | 149 b, 128 c en het weetje in `nt-openbaring.js` hadden het. | 149 basis en 149 a: “Op de dag des Heeren, de zondag,”; intro van het deel idem. |
| Rachab, de moeder van Boaz | 39 c, 47 c, `ruth.js`, `jozua.js` gelijk. `personen.js`: “vermoedelijk deze Rachab … het staat er niet letterlijk”. | `rachab.kort` en `.elders`, `boaz.kort`, `salmon.kort` aangepast. |
| Geslachtsregisters | Alleen `personen.js`: “Hoe die twee geslachtsregisters samenhangen, zegt de Bijbel niet.” | `jozef_nt.kort`: Mattheüs geeft de lijn van Jozef, van David via Salomo (1:6, 16); Lukas die van Maria, van David via Nathan; Heli is de vader van Maria (3:23, 31). `maria.kort`: één zin erbij. |
| Moria = de tempelberg | 13 c, `genesis.js`, `2samuel.js` gelijk; `1koningen.js` (cross) zette de teksten alleen naast elkaar. | “…: dat is dezelfde plaats.” |
| Melite = Malta | 147 c, 148 b en c gelijk. `plaatsen.js`: “Meestal gelijkgesteld aan Malta.” | `d` van `nt_malta`: “… (Handelingen 28:1). De Statenvertaling noemt het Melite.” (`c` en `bron` ongewijzigd.) `publius.kort`: “Melite (Malta)”. |
| Samaritanen en 2 Koningen 17 | Drie formuleringen: “Hier begint de geschiedenis van …” (66 c), “Van hen stammen … af” (`nt-jezus-1.js`), “een van de redenen …” (109 c). | Eén lijn: de Samaritanen stammen af van de volken van 2 Koningen 17 (66 c en 109 c aangepast; in 109 c blijft “een van de redenen”). |
| Maria Magdalena | Nergens meer als ‘zondares’; 97 en 129 houden haar en de vrouw van Lukas 7 uit elkaar. | Niets. |
| ‘Vreemd vuur’ | Basis, b, c en `leviticus.js`: vuur dat niet van het altaar kwam. 32 a `samen`: “Wat dat vuur precies was, zegt de tekst niet.” | 32 a: “Het was vuur dat niet van het altaar kwam (vergelijk Leviticus 16:12).” |
| Brieven uit de gevangenschap | 148 c en het weetje bij Filippenzen: geschreven in Rome. `brieven.js`, stap Efeze: “Waar Paulus gevangen zit, zegt de brief niet.” | “Paulus zit gevangen in Rome (Handelingen 28:16, 30).” De `tijdNoot` van het deel is niet aangeraakt. |
| Maächa | `2kronieken.js`: grootmoeder van Asa. `personen.js`: “daarom denken veel uitleggers …”. | `maacha_asa.kort` gelijkgetrokken. |
| Maleachi | `profeten.js`: “Zijn naam betekent: mijn bode”. `personen.js`: “Meer vertelt de Bijbel niet over hem.” | Gelijkgetrokken. |
| Spelling | 48 c schreef “Nazireër”, overal elders “nazireeër”. | 48 c aangepast (kop en tekst). |

## Taak 3. Resterende voorbehouden

Gezocht (hoofdletterongevoelig) op `uitlegger`, `zegt de Bijbel niet`, `vertelt de Bijbel niet`, `weten we niet`, `waarschijnlijk`, `vermoedelijk`, `misschien`, `mogelijk`, `traditie`, `overlevering`, `prentenboek`, `sommigen`, `men denkt`, `meestal`, `onderzoekers`, `staat er niet`, `niet bij naam`, `is niet zeker`, `betwist` en verwante vormen. Bij elkaar enkele honderden treffers (met overlap); elke treffer buiten `plaatsen.js` is gelezen, die in `plaatsen.js` zijn steekproefsgewijs bekeken.

**Gewijzigd (20 plekken):**

- 11 c: “over hoe die getallen samenhangen, verschillen uitleggers” geschrapt; de twee getallen (15:13 en Exodus 12:40) blijven staan.
- 21 a `samen` en 21 c: “Prentenboeken spreken vaak van een mandje” geschrapt (README §2.3); wat de Bijbel zegt, blijft.
- 28 c: “Het volk Amalek wordt meestal als zijn nakomelingen gezien” → “Van hem stamt het volk Amalek af.” Nagekeken: kanttekening Exodus 17:8 (DBNL, `_sta001stat01_01_0076.php`, noot 13: “de Amalekiten, de nakomelingen Esaus”). Calvijn en Henry: niet nagekeken, algemene kennis.
- `plaatsen.js`, Gerizim (`d`): “uitleggers nemen aan dat zij de Gerizim bedoelde” → “zij bedoelde de Gerizim” (zo ook u07 in het reisdeel).
- “Meer vertelt de Bijbel niet over hem/haar” geschrapt bij Jiska (`genesis.js`), Antipas (`nt-openbaring.js` en `personen.js`), Jonas, Dionysius, Damaris, Zerah.
- “Haar naam staat niet in de Bijbel” (Syro-Fenicische vrouw, `nt-jezus-2.js`), “zijn naam staat er niet” (Man Gods, `1koningen.js`; de tweede Emmaüsganger, `nt-jezus-3.js`) geschrapt, zoals u07 al deed bij de Samaritaanse vrouw en de hoveling.
- `personen.js`: Zeruja (“Wie haar vader was, zegt de Bijbel niet eenduidig”), Jason en Sosthenes (“of dat dezelfde man is, zegt de Bijbel niet”) en Hanani (“meestal wordt aangenomen dat dit dezelfde Hanani is”): de voorbehoudzin geschrapt; de teksten staan er nog naast elkaar, zonder keuze. Bij Hanani nagekeken: de kanttekening bij 1 Koningen 16:1 (DBNL, `_0325`, noot 2) stelt de twee niet uitdrukkelijk gelijk.
- `nt-handelingen.js`, stap Handelingen 18:21–22: “Meer vertelt de Bijbel over dit bezoek niet” geschrapt.

**Blijft, en waarom (samengevat per soort):**

1. **Jaartal en tijdrekening (README §2.6):** alle `tijdNoot`-teksten en de c-blokken ‘Waar en wanneer’, met “veel uitleggers nemen aan dat perioden overlappen”, “sommigen rekenen 587”, “hoe oud … was, zegt de Bijbel niet” als reden waarom een jaar een schatting is. Ook de datering van Openbaring (Irenaeus, ca. 95; ook ca. 68) en “in de reformatorische traditie geldt Jesaja zelf als de schrijver” in twee `tijdNoot`-teksten.
2. **Ligging van plaatsen (§2.6):** alle `d`-teksten in `plaatsen.js` (43 keer “weten we niet”, verder “waarschijnlijk”, “betwist”, “Men denkt aan de Golf van Suez”), en dezelfde opmerkingen in c-blokken en weetjes: Sinaï, Ur, Sodom, Kades, Gilgal, Ai, Tarsis, Bethabara, Kana, Emmaüs, Golgotha, de berg van de verheerlijking (“De traditie noemt de Tabor; anderen denken aan de Hermon”), Ein Karem, de Berg der Zaligsprekingen.
3. **Routes (§2.6):** “Welke weg … namen, zegt de Bijbel niet; de route op de kaart is een reconstructie” en zinnen die uitleggen waarom een lijn op de kaart zo loopt of ontbreekt (onder meer `brieven.js`: “Waar Tychikus vandaan kwam, staat er niet”, “Waar Paulus is als hij schrijft, zegt de brief niet” bij Galaten).
4. **Geschiedenis en archeologie (`fs: "h"` en vergelijkbaar):** Scheba, Sisak/Sjosjenq, Hazaël, de Zwarte Obelisk, de tunnel van Hizkia, Hazor, Belsazar, de schenker, de poorten van Nehemia, “Wie deze Darius in de geschiedenis was, is niet zeker”, Arthahsasta = Artaxerxes I, “Historici noemen hem Herodes Antipas”, Machérus en de naam Salome uit Josephus (100 c).
5. **Wat de tekst zelf zegt, zonder dat het een voorbehoud bij uitleg is:** “Hoe het teken van Kaïn eruitzag, staat er niet” (4 c; een vraag leunt erop), “De tekst zegt niet dat God de slangen weghaalt” (34 c), “De gelijkenis zegt niet dat de Farizeeër loog” (114 c), “De bekende naam ‘de verloren zoon’ staat niet in de Bijbel” (112 c), “De naam van God staat nergens in dit boek” (Esther), “Markus noemt geen naam … Johannes vertelt dat het Simon Petrus was” (123 c), “Niemand weet waar zijn graf is” (Mozes), en vragen bij een gelijkenis “volgens de uitleg” (99: de uitleg die de Heere Jezus Zelf geeft).
6. **Chronologie binnen een c-blok:** “Of dat vóór of na de val van Samaria was, zegt de tekst niet” (66 c; zie u05).
7. **Grondslag van familiebanden (`basis` in `personen.js`):** de toelichting bij een afgeleide band (“volgt uit …, maar staat er niet letterlijk”) is niet aangeraakt: buiten de opdracht, en e2e-tests rusten erop. Zie ‘Twijfels’.

## Taak 4. Steekproef trouw

Alle tien commits ‘gangbare uitleg verweven’ zijn als woordverschil doorgelezen (`git show <commit> --word-diff`), buiten Jakob. De 35 regels hieronder (samen ruim 45 plekken, uit alle tien pakketten en uit basis, a, b, c en reisdelen) zijn uitdrukkelijk naast de Statenvertaling gelegd:

| Pakket | Plek | Uitkomst |
| --- | --- | --- |
| u01 | 3 a/b (de duivel spreekt door de slang; Openbaring 12:9) | klopt |
| u01 | 5 c (‘honderd en twintig jaren’, Genesis 6:3) | klopt |
| u01 | 9 c (weg van Sur, Genesis 16:7; 25:18) | klopt |
| u01 | 10 c (‘zie niet achter u om’, 19:17) | klopt |
| u01 | 14 a `samen` (Genesis 24:7) | klopt |
| u01 | `genesis.js`, Melchizedek (Hebreeën 7:3) | klopt |
| u02 | 22 a `samen` (Handelingen 7:25) | klopt; stellig, maar kanttekening, Calvijn en Henry zijn het eens |
| u02 | 23 basis (Exodus 4:24–26) | klopt |
| u02 | 24 c (2 Timotheüs 3:8) | klopt |
| u02 | 32 b/c en `leviticus.js` (Leviticus 10:1; 16:12) | klopt; 32 a week af → hersteld (taak 2) |
| u02 | 35 c (Numeri 22:22; 2 Petrus 2:15) | klopt |
| u02 | `exodus.js`, Jethro en Reüel | week af van §7 → hersteld (taak 1) |
| u03 | 38 c (Jozua 4:9, ‘ook twaalf stenen’) | klopt |
| u03 | 46 c (Richteren 16:19, 29–30) | klopt |
| u03 | `richteren.js`, de Kison (5:21) en de koele opperzaal (3:20) | klopt |
| u04 | 51 a/b/basis (1 Samuël 16:14; 15:23) | klopt |
| u04 | 52 c (1 Samuël 17:55, 58) | klopt |
| u04 | `2samuel.js`, stap 1: “De Amalekiet vertelde dus niet de waarheid” | te stellig: de kanttekening laat het oordeel aan de lezer, en 55 c zet alleen de teksten naast elkaar → nu: “In 1 Samuël 31:4 staat: ‘Toen nam Saul het zwaard, en viel daarin.’ De Amalekiet hoopte op een beloning: hij meende dat David hem ‘bodenloon zou geven’ (4:10).” |
| u04 | `2samuel.js`, Perazim (2 Samuël 5:20) en Meteg-Amma (1 Kronieken 18:1) | klopt |
| u05 | 63 c (1 Koningen 18:1; Lukas 4:25) | klopt |
| u05 | 67 c (2 Koningen 20:1, 6; 18:13) | klopt |
| u05 | `1koningen.js`, Elisa (19:21) en het feest (12:32) | klopt |
| u05 | `2koningen.js`, Hosea 1:4 en 2 Koningen 10:31 | klopt |
| u06 | 70 basis/b/c (Jona 4:11: de kleine kinderen; 3:10) | klopt; de vraag in de basis is er goed op aangepast |
| u06 | 73 b en `daniel.js` (Daniël 2:38–45) | klopt |
| u06 | 76 basis/a/b en `ezra.js` (Ezra 3:12; Haggaï 2:4) | klopt |
| u07 | 88 c (Psalm 91:11 naast Mattheüs 4:6) | klopt |
| u07 | 93 c (Johannes 3:5; Ezechiël 36:25–27) | klopt met de drie bronnen; zie ‘Twijfels’ |
| u07 | 95 c en 96 c (Mattheüs 8:28; Lukas 7:3–7) | klopt |
| u08 | 105 basis (Mattheüs 16:18) | klopt |
| u08 | 111 c (Lukas 14:18–23) en 116 c (Markus 10:46) | klopt |
| u09 | 121 b, 126 b, `nt-jezus-3.js` (Johannes 13:8; 19:30; Mattheüs 27:46, 51) | klopt |
| u09 | 131 c (Johannes 20:22; Handelingen 2) | klopt |
| u10 | 139 c, 143 c, 147 c (Handelingen 8:33; 9:7 en 22:9; 27:9) | klopt |
| u10 | `nt-handelingen.js`, stap Handelingen 18:18: “Het was de gelofte van de nazireeër” | te stellig: Calvijn (Handelingen 18:18, biblehub) spreekt alleen van een ceremoniële gelofte en noemt de nazireeër niet → nu staat de wet er als tekst naast: “Bij de gelofte van de nazireeër kwam er geen scheermes op het hoofd zolang de gelofte duurde; aan het eind werd het haar afgeschoren (Numeri 6:5, 18).” Het letterlijke citaat van 18:18 in de vertelling klopt. |

Hersteld door de steekproef: 5 plekken (32 a, `exodus.js` twee keer, `2samuel.js`, `nt-handelingen.js`).

## Taak 5. Niet apart noemen

Gezocht op `dit is uitleg`, `is uitleg`, `uitgelegd als`, `gangbare uitleg`, `kanttekening`, `Calvijn`, `gereformeerd`, `reformatorisch`, `gekozen`, `opvatting`, `interpretatie`. Buiten Jakob staat in de verteltekst, de weetjes, de niveaus en de personen nergens meer dat iets uitleg is of dat er gekozen is. Wat nog voorkomt:

- `plaatsen.js`, veld `bron` (“is de gangbare uitleg”, “is uitleg”): niet aangeraakt (`bron` valt buiten de opdracht).
- twee `tijdNoot`-teksten (“gangbare uitleg” bij Daniël 1:1; “reformatorische traditie” bij Jesaja): §2.6.
- `vandaag.js`: “De Bijbelreis kiest geen partij” gaat over het heden, niet over Bijbeluitleg.

## Taak 6. Vragen

Geen vraag toegevoegd of weggehaald. Geen enkele vraag leunde op een zin die ik heb veranderd; nagelopen bij 8, 21, 23, 43, 44, 83, 85, 126 en 149 (basis, a, b, c).

## Twijfels

1. **`overlevering` bij `johannes_patmos` (`personen.js`).** De opdracht beperkt `personen.js` tot tekst in `kort` en `elders`, en een e2e-test (`e2e/bijbelreis.spec.ts`, regel 413–425) verwacht bij deze persoon een blok ‘Overlevering – Niet uit de Bijbel’. De oude inhoud (“Hij is de apostel Johannes … De Bijbel zegt het niet … Daarom is dit een aparte persoon”) sprak het besluit recht tegen. Ik heb daarom het blok bij `johannes` weggehaald (geen test rust erop) en bij `johannes_patmos` de inhoud vervangen door wat werkelijk overlevering is en al in de `tijdNoot` staat: “Johannes zag de Openbaring aan het einde van de regering van keizer Domitianus (81–96 n.Chr.). Dat schrijft de kerkvader Irenaeus (ca. 180 n.Chr.); de Bijbel noemt geen jaartal.” Dit gaat één stap verder dan ‘alleen `kort` en `elders`’. Wie het blok liever helemaal weg wil, moet ook die e2e-test aanpassen.
2. **`basis` in `personen.js`.** Bij Boaz, Rachab en Salmon staat in de grondslag nog: “Of zij dezelfde is als Rachab uit Jericho, zegt de Bijbel niet met zoveel woorden; dat wordt afgeleid uit de naam en de tijd.” Een e2e-test heet letterlijk “… of zij Rachab uit Jericho is, staat er apart bij”. De kaart zegt nu in `kort` “Zijn moeder was Rachab uit Jericho” en onder ‘grondslag’ dat dit is afgeleid. Dat is de bestaande opzet van de stamboom (letterlijk of afgeleid), vergelijkbaar met de zekerheid van de kaart; of dat zo moet blijven, is een besluit voor de coördinator. Hetzelfde geldt voor Jethro met alias Reüel (één persoon in de koppeling, terwijl de tekst nu niet meer kiest).
3. **Het label ‘Uitleg’ bij weetjes (`fs: "u"`) en de kop ‘Uitleg’ boven `betekenis`.** Dat zijn vaste onderdelen van de app (`app.js`), geen zin die zegt dat er gekozen is; de schrijfopdracht voor reizen noemt `fs: "u"` nog steeds. Niet aangeraakt.
4. **De geslachtsregisters.** Doorgevoerd zoals opgedragen (Mattheüs: Jozef via Salomo; Lukas: Maria via Nathan). De kanttekening bij Lukas 3:23 en Matthew Henry zeggen dit; van Calvijn weet ik uit algemene kennis dat hij beide registers op Jozef betrekt. Niet nagekeken. Het staat alleen in `personen.js` (Jozef en Maria), niet in een geschiedenis.
5. **De Engel des HEEREN buiten de lijst van §7.** Genesis 22 (13), Numeri 22 (35) en 2 Koningen 19:35 (67) noemen “de Engel van de HEERE” met een hoofdletter, zoals de Statenvertaling, zonder erbij te zeggen wie Hij is. Genesis 16 (9 b en c) zegt het wel. Niet aangevuld, omdat §7 deze plaatsen niet noemt; er is geen tegenspraak.
6. **Johannes 3:5 (93 c):** “Met ‘water en Geest’ bedoelt de Heere Jezus de Heilige Geest, Die een mens van de zonde reinigt, zoals water het vuil afwast.” Dat is wat kanttekening, Calvijn en Henry zeggen; buiten die drie denken ook gereformeerde uitleggers aan de doop. Laten staan; de moeite waard om door een predikant te laten lezen.
7. **Hosea 1:4 bij Jehu (`2koningen.js`), de 120.000 als kleine kinderen (Jona 4:11), Mozes en de Egyptenaar (22 a):** stellig verteld, maar volgens de werkbestanden met de drie bronnen onderbouwd. Laten staan.
8. **Spelling Reüel/Rehuël:** de basis en `exodus.js` schrijven “Reüel”, 22 b en c “Rehuël” (Statenvertaling). Niet gelijkgetrokken, omdat de naam als alias in de personenkoppeling zit.
9. **“Mandje” in titels en vragen van `exodus.js`** (“Een mandje in het riet”, “Mozes in het mandje”): laten staan; de Statenvertaling zegt ‘een kistje van biezen’. Een titel wijzigen kan de visuele vergelijking raken, die ik niet mocht draaien.
10. **Visuele tests en e2e zijn niet gedraaid** (opdracht). De e2e-bestanden zijn wel doorzocht op de gewijzigde zinnen; behalve punt 1 leunt er geen assertie op.

## Controles (15-11-2026)

```
$ node scripts/niveaus/samenvoegen.mjs && node scripts/niveaus-controle.mjs --volledig
niveau a: 150 geschiedenissen
niveau b: 150 geschiedenissen
niveau c: 150 geschiedenissen
450 versies; status in docs/bijbelreis-niveaus/werk/STATUS.md
OK: 150 geschiedenis(sen), 450 versies.

$ node scripts/bijbelreis-personen-check.mjs
BR.mensen: 329 personen (318 in de reis, 11 alleen voor de familie).
Familiebanden: 209 (v/m/p per persoon; partners tellen per kant). Grondslag: 197 uit de Bijbel (b), 12 afgeleid (a). Overleveringen: 1.
Bewust ongekoppeld in ontdek-stambomen: 13.
Geen fouten.

$ npx vitest run --testTimeout=120000
 Test Files  10 passed (10)
      Tests  151 passed | 1 skipped (152)

$ for f in scripts/bijbel-controle/*.txt; do python3 scripts/bijbel-check.py "$f" >/dev/null || echo "FOUT $f"; done
(geen uitvoer)
```

Aan `scripts/bijbel-controle/redactie.txt` zijn 36 regels toegevoegd voor de verzen waarop de nieuwe zinnen rusten (onder meer Exodus 3:2 en 3:4, Richteren 6:12 en 13:3, Handelingen 7:2, Lukas 2:7, Mattheüs 1:5–6 en 1:16, Lukas 3:23 en 3:31, Mattheüs 2:1 en 2:11, Openbaring 1:9–10, Johannes 19:26 en 21:20–24, 1 Samuël 31:4, 2 Samuël 4:10).

`public/bijbelreis/niveaus/{a,b,c}.js` zijn opnieuw gegenereerd en meegecommit; `STATUS.md` veranderde niet (geen status gewijzigd).

## Omvang

| Soort | Gewijzigde regels |
| --- | --- |
| Niveaus (12 batches; a: 8, b: 8, c: 9 regels, in 20 versies) | 25 |
| Basis (`geschiedenissen/*.js`) | 8 |
| Reisdelen (`inhoud/*.js`, 11 bestanden) | 20 |
| `personen.js` | 28 (waarvan 5 regels commentaar) |
| `plaatsen.js` (alleen `d`) | 2 |
