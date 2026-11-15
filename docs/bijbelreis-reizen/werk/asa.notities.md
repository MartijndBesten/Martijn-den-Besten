# Notities bij het reisdeel `asa` (2 Kronieken 14–16)

Boek: 2 Kronieken (`public/bijbelreis/inhoud/2kronieken.js`), deel-id `asa`, vóór het bestaande deel `josafat`.
10 stappen (sleutels `2kronieken:asa:0` t/m `2kronieken:asa:9`), speurtocht 3 kaartvragen / 8 meerkeuze / 1 volgorde.
Bronnen: Statenvertaling via `scripts/sv.mjs` (heel 2 Kronieken 14–16 en alle aangehaalde teksten gelezen), OpenBible.info
Bible Geocoding Data via `scripts/reizen/plaats-zoek.py`. Namen volgens de Herziene Statenvertaling.

## Nieuwe plaatsen

| sleutel | naam | `c` | punt | score OpenBible | grond |
| --- | --- | --- | --- | ---: | --- |
| `as_maresa` | Maresa | v | 31.593, 34.8982 | 1000 | Tel Maresha (Tell Sandahannah); geen tegenkandidaat. |
| `as_zefatha` | Dal Zefatha | o | 31.6106, 34.9531 | 488 | Wadi es-Safiyeh, het meest genoemde voorstel; andere voorstellen 75 en 63. Net onder de grens van 500, en de naam komt alleen in 2 Kronieken 14:10 voor (de Septuaginta leest “ten noorden van Maresa”). Daarom `o`: het punt is illustratief, alleen ‘bij Maresa’ is zeker. |
| `as_ijon` | Ijon | w | 33.3453, 35.59 | 661 | Tell ed-Dibbin bij Marjayoun (Libanon); tweede voorstel Marjayoun zelf (54), 2 km verder. |
| `as_abelmaim` | Abel-Maïm | w | 33.2581, 35.581 | 756 | Tel Abel Beth Maacah. OpenBible heeft geen eigen ingang ‘Abel-maim’: 2 Kronieken 16:4 staat onder Abel-beth-maacah (zo heet de stad in 1 Koningen 15:20). |
| `as_geba` | Geba | w | 31.8575, 35.2611 | 740 | Jaba (‘Geba 1’, waar 2 Kronieken 16:6 en 1 Koningen 15:22 bij horen). |

Tussenpunten (`BR.W`): `as_wpas` [33.57, 35.95] en `as_wtaym` [33.42, 35.7], alleen voor de lijn van Damascus naar Ijon
(ten noorden van de Hermon langs en door het dal naar Marjayoun), zodat de lijn niet over de top van de Hermon loopt.

Hergebruikt: `salem` (Jeruzalem), `efrath` (Bethlehem), `adullam`, `gerar` (w), `rama` (b), `mizpa` (w), `dan` (v),
`damascusst` (v), tussenpunt `lachisw`; als context `mamre`, `gaza`, `bethel`, `tyrus`.

## Plaatsen uit de tekst die niet op de kaart staan

- **Naftali** (‘alle schatsteden van Nafthali’, 16:4): OpenBible heeft geen ingang voor het stamgebied; welke steden bedoeld
  zijn, zegt de tekst niet. Niet als punt of gebied gezet. (Als het deel `stammen` een gebied Naftali toevoegt, kan dat in
  stap 7 bij `at`.)
- **Kinneroth** (‘het ganse Cinneroth’, alleen in 1 Koningen 15:20): alleen genoemd in het weetje bij stap 7.
- **De beek Kidron** (15:16): ligt in Jeruzalem; op deze schaal geen eigen punt (er bestaat al een tussenpunt `kidron`).
- **De steden op het gebergte van Efraïm** die Asa had ingenomen (15:8; 17:2): niet bij naam genoemd.
- **De steden rondom Gerar** (14:14): niet bij naam genoemd.
- **Tirza** (alleen in 1 Koningen 15:21): bestaat nog niet in `plaatsen.js`; alleen genoemd in het weetje bij stap 8.
- **De stad van David** (16:14): Jeruzalem (`salem`).

## Routes (alle `recon: 1`)

- Jeruzalem → Maresa (stap 2): via Bethlehem en Adullam; dat zijn vestingsteden van Rehabeam op deze weg
  (2 Kronieken 11:6–8), maar de tekst noemt de weg niet.
- Maresa → Gerar (stap 3): ‘tot Gerar toe’; lijn via het bestaande tussenpunt bij Lachis.
- Gerar → Jeruzalem (stap 4): de tekst zegt alleen ‘en kwamen weder te Jeruzalem’; dezelfde weg terug getekend.
- Damascus → Ijon → Dan → Abel-Maïm (stap 7, kleur rood, telt niet mee in ‘Alles’): de volgorde van de tekst. Dat het
  leger via het noorden (Bekavallei) kwam, is een reconstructie die bij die volgorde past; de Bijbel noemt de weg niet.
- Jeruzalem → Rama, Rama → Geba, Rama → Mizpa (stap 8): zeer korte lijnen (9, 3 en 4 km); `zoom: 11` zodat de drie
  plaatsen uit elkaar staan.
- **Niet getekend:** de weg van de boden met het zilver en goud naar Damascus (16:2). Begin en eind zijn bekend, maar
  Baësa sloot juist de weg naar het noorden af; elke lijn zou een gok zijn. Stap 7 licht wel Rama en Damascus op.

## Personen

Nieuw in `BR.mensen`: `asa`, `abia_juda` (boek: [], alleen als vader), `maacha_asa`, `zerah_cusjiet`, `azarja_oded`,
`baesa`, `benhadad_asa`, `hanani_ziener`. Bestaand aangepast: `josafat` kreeg `v: "asa"` met `basis` (2 Kronieken 17:1).
Geen nieuwe groepsnamen (gebruikt: Volk, Leger, Vijanden).

Naamgenoten, bewust met een onderscheidende naam (anders eist de personencontrole een regel in `VERWACHT`, en die lijst
mocht ik niet wijzigen):

- **“Benhadad van Syrië”** (`benhadad_asa`): ‘Benhadad’ staat in `NAAMGENOTEN` en is in 2 Koningen de koning uit de tijd
  van Elisa. Of dat dezelfde man is, zegt de Bijbel niet; meestal worden ze onderscheiden (zoon van Tabrimmon,
  1 Koningen 15:18). De toevoeging ‘van Syrië’ onderscheidt eigenlijk niet (beiden waren koning van Syrië). Wil de redactie
  gewoon ‘Benhadad’ tonen, dan is nodig: `n: "Benhadad"` en in `VERWACHT` de regel `"2kronieken|Benhadad": "benhadad_asa"`.
- **“Azarja (zoon van Oded)”** (`azarja_oded`): ‘Azarja’ is in Daniël de vriend van Daniël; een tweede persoon met precies
  die naam zou de bestaande koppeling in Daniël tot naamgenoot maken.
- **“Hanani de ziener”** (`hanani_ziener`): ‘Hanani’ is in Ezra/Nehemia de broer van Nehemia.
- **“Abia van Juda”** (`abia_juda`): in Koningen heet hij Abiam. Mocht het deel `scheuring` dezelfde koning ook toevoegen
  (als Abiam of Abia), dan moeten de twee worden samengevoegd.

## Twijfelpunten

1. **Het zesendertigste jaar (16:1).** Volgens 1 Koningen 15:33 en 16:8 stierf Baësa in het zesentwintigste jaar van Asa.
   De navertelling volgt de tekst van Kronieken (‘zes en dertigste jaar’); het verschil staat in `tijdNoot`, met de twee
   gangbare verklaringen (tellen vanaf de scheuring; overschrijffout), zonder te kiezen. Het staat niet in een stap-weetje;
   de redactie kan het daar desgewenst ook zetten.
2. **Maächa, ‘de moeder van den koning Asa’ (15:16).** Ook de moeder van Abia heet Maächa (1 Koningen 15:2;
   2 Kronieken 11:20), terwijl 2 Kronieken 13:2 haar Michaja noemt. De navertelling zegt ‘zijn moeder’ (zoals de tekst);
   het weetje meldt dat veel uitleggers aan de grootmoeder denken. In `BR.mensen` daarom geen `m` bij Asa.
3. **Zerah ‘de Moor’ / Cusjiet.** In de navertelling ‘de Cusjiet’ (Herziene Statenvertaling), met de Statenvertaling
   erbij. Het weetje zegt dat met Cusj meestal het land ten zuiden van Egypte bedoeld is; sommige uitleggers denken aan een
   Cusjitische groep dichter bij Gerar. Dat laatste heb ik niet genoemd. De tekst noemt Zerah geen koning; ik ook niet.
4. **Dal Zefatha op `o` of `w`.** Score 488 ligt net onder ‘ongeveer 500’. Gekozen voor `o` (voorzichtig). Bij `w` zou het
   punt hetzelfde blijven.
5. **Abel-Maïm op `w`** (756, net onder 800), hoewel de tell vrij algemeen aanvaard is.
6. **‘Bossen’ / gewijde palen en ‘opgerichte beelden’ (14:3).** De navertelling combineert: ‘opgerichte beelden’
   (Statenvertaling) en ‘gewijde palen’ (Herziene Statenvertaling), met uitleg in het weetje. In 15:16 staat ‘een afgrijselijken
   afgod in een bos’; daar heb ik alleen ‘een afschuwelijk afgodsbeeld’ geschreven en Asjera niet genoemd.
7. **De ‘branding’ (16:14).** Weergegeven als ‘ontsteken voor hem een heel groot vuur’, zonder uitleg. De tekst zegt dat
   Asa begraven werd; uitleggers denken aan het verbranden van specerijen (vergelijk Jeremia 34:5; 2 Kronieken 21:19).
8. **Azarja en ‘de profeet Oded’ (15:8).** De Statenvertaling heeft in 15:8 ‘de profetie van den profeet Oded’, terwijl in
   15:1 Azarja, de zoon van Oded, spreekt. De navertelling zegt alleen ‘deze woorden’ en noemt Azarja nergens ‘profeet’.
9. **Hanani en Jehu.** Dat de vader van de profeet Jehu (1 Koningen 16:1; 2 Kronieken 19:2) dezelfde Hanani is, staat er
   niet met zoveel woorden; in `kort` staat ‘meestal wordt aangenomen’. Geen familieband in `BR.mensen`.

## Bewust weggelaten

- De zonnebeelden (14:5), ‘kloeke helden’ (14:8), de plundering van de steden en de tenten van het vee (14:14–15).
- 15:5–6 (onrust in ‘die tijden’): uitleggers verschillen over welke tijd bedoeld is.
- ‘de steden, die hij van het gebergte van Efraïm genomen had’ (15:8).
- ‘van den kleine tot den grote, en van den man tot de vrouw toe’ (15:13): alleen ‘wie Hem niet zoekt, zal gedood worden’.
- ‘tussen mijn vader en tussen uw vader’ (16:3) en ‘naar apothekerskunst toebereid’ (16:14).
- 16:11 (het boek der koningen van Juda en Israël): stap 10 heeft daarom `ref` 16:12–14.

## Voor de integrator

- De boekregel van 2 Kronieken (`tijd: "ca. 853–848 v.Chr."` en de `intro` die alleen Josafat noemt) heb ik niet gewijzigd;
  met dit deel erbij loopt het boek vanaf ca. 911 v.Chr.
- `tests/bijbelreis-stappen.json` (momentopname van stapsleutels) is niet bijgewerkt; de tien nieuwe sleutels zijn
  `2kronieken:asa:0` … `2kronieken:asa:9`.
- Het weetje bij stap 10 zegt ‘over hem gaat de volgende reis’: klopt zolang `josafat` direct na `asa` staat.
- Controles: `node --check` (4 bestanden) goed; `asa.txt` 136 regels, 0 mis; `personen.txt` 0 mis;
  `bijbelreis-personen-check.mjs` ‘Geen fouten.’; `tests/bijbelreis.test.ts` geslaagd. Ook `scripts/bijbelreis-check.mjs`
  (desktop) gaf ‘Geen problemen gevonden’, en de stappen 1, 2, 4, 7 en 8 zijn op de kaart bekeken.
