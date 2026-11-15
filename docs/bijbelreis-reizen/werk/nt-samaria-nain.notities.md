# Notities bij het deel `nt-samaria-nain` (Samaria, Nazareth en Naïn)

Boek: `jezus-1` (`public/bijbelreis/inhoud/nt-jezus-1.js`). Bijbelgedeelte: Johannes 4:1–54; Lukas 4:16–30; Lukas 7:11–17.
Acht stappen, tussen de delen `nt-begin` en `nt-galilea`. Geschreven naast de Statenvertaling (`node scripts/sv.mjs`).

## Stappen

| # | Verwijzing | Titel | Plek | Route |
| --- | --- | --- | --- | --- |
| 1 | Johannes 4:1–6 | Door Samaria naar Sichar | `nt_sichar` | Jeruzalem → Sichar, ca. 49 km (reconstructie) |
| 2 | Johannes 4:7–15 | Levend water | `nt_sichar` | – |
| 3 | Johannes 4:16–26 | Aanbidden in geest en waarheid | `nt_sichar`, `sn_gerizim` | – |
| 4 | Johannes 4:27–42 | De Zaligmaker der wereld | `nt_sichar` | – |
| 5 | Johannes 4:43–54 | Uw zoon leeft | `nt_kana`, `nt_kapernaum`, `nt_sichar` | Sichar → Kana, ca. 69 km; de hoveling Kapernaüm → Kana, ca. 26 km (grijs) |
| 6 | Lukas 4:16–22 | In de synagoge van Nazareth | `nt_nazareth` | geen (herkomst niet genoemd) |
| 7 | Lukas 4:23–30 | Uit de stad geworpen | `nt_nazareth` | stippellijn “naar Kapernaüm” (Lukas 4:31) |
| 8 | Lukas 7:11–17 | De jongeman van Naïn | `nt_nain` | Kapernaüm → Naïn, ca. 39 km (reconstructie) |

## Nieuwe plaatsen

| Sleutel | Naam | `c` | Punt | Score | Grond |
| --- | --- | --- | --- | --- | --- |
| `sn_gerizim` | Berg Gerizim | v | [32.1994, 35.2728] | 1000 | OpenBible “Mount Gerizim” = Jabal at Tur; OpenBible noemt Johannes 4:20 bij deze berg. De naam bleef in gebruik. |

`z: 9.5`: het label verschijnt pas bij inzoomen of als de stap de berg aanwijst (stap 3). Zo verdringt het in het overzicht niet
het label van Sichar. De app heeft daarnaast al een toplabel “Gerizim” (`PEAKS` in `app.js`), net als bij de Ebal en de Tabor.

Hergebruikt (ongewijzigd): `nt_sichar` (w; OpenBible Askar 620, tegenover “= Sichem/Tell Balata” 224, ruim 800 m verderop),
`nt_kana` (b), `nt_kapernaum` (v, 842), `nt_nazareth` (v, 1000), `nt_nain` (v, 1000), `salem`, `sunem` (context).

Nieuwe tussenpunten in `BR.W` (alleen voor de lijn van een route, geen plaatsen):

| Sleutel | Punt | Waarvoor |
| --- | --- | --- |
| `sn_vlakte` | [32.61, 35.27] | vlakte van Jizreël, ten westen van Sunem en Naïn (Sichar → Kana) |
| `sn_nazarethpas` | [32.72, 35.335] | heuvels ten oosten van Nazareth (Sichar → Kana) |
| `sn_kanaweg` | [32.84, 35.4] | dal tussen Kana en het meer (weg van de hoveling); zelfde punt als in de bestaande route Kana → Kapernaüm |
| `sn_meer_nw` | [32.875, 35.54] | noordwestoever bij Tabgha; zelfde punt als in de bestaande routes |
| `sn_ginosar` | [32.855, 35.512] | vlakte van Gennesareth; houdt de lijn naar Naïn van het meer af |
| `sn_taborweg` | [32.7, 35.45] | ten oosten van de Tabor (Kapernaüm → Naïn) |

Bestaande tussenpunten gebruikt: `nt_samariaweg`, `ridge`, `dothanw`, `galil`. `nt_galilea_zuid` (bij Jizreël) is bekeken maar niet
gebruikt: de lijn Sichar → Kana liep daarmee vlak langs Sunem en Naïn, alsof de Heere Jezus daar toen al kwam.
De routes zijn met `geo.json` nagerekend: geen enkele lijn loopt door het meer van Galilea.

## Plaatsen uit de tekst die niet (apart) op de kaart staan

- **De bron van Jakob** (Johannes 4:6). OpenBible heeft geen eigen identificatie voor de bron; daarom geen eigen punt. Ze hoort bij
  `nt_sichar` (de beschrijving daar noemt de Jakobsbron al). De traditionele put ligt ongeveer een kilometer ten zuiden van Askar.
- **Het stuk land dat Jakob aan Jozef gaf** (Johannes 4:5; Genesis 33:19; 48:22; Jozua 24:32). Geen punt; genoemd in `cross`.
  `sichem` stond eerst als contextplaats in het deel, maar het label verdrong op een telefoon dat van Sichar; weggelaten.
- **Judea, Samaria, Galilea**: streken. De app toont die namen al als streeklabels (`REGIONS` in `app.js`); geen nieuwe plaatsen.
- **De top van de berg bij Nazareth** (Lukas 4:29). Lukas noemt geen naam; geen punt (staat ook zo in het weetje).
- **Zarfath/Sarepta en Sidon** (Lukas 4:26) en **Syrië** (4:27): alleen genoemd in de toespraak; niet opgelicht. `sarfath` bestaat.
- **Enon bij Salim** (Johannes 3:23): valt buiten het gedeelte; betwist in OpenBible (276/226); niet gebruikt.

## Personen

Geen nieuwe personen in `BR.mensen` en dus geen nieuwe regels in `personen.txt`: alle hoofdpersonen naast de Heere Jezus zijn in
de tekst naamloos. In `who` staan alleen bestaande namen, groepen en rollen: Jezus, Discipelen, Vrouw, Volk, Mannen, Zoon,
Knechten, Schare, Weduwe. Geen nieuwe kleuren nodig (de markering `kleuren` is leeg gebleven).

Voor ‘Wie is wie’ zijn drie regels toegevoegd met een omschrijvende naam: **De Samaritaanse vrouw**, **De koninklijke
hoveling**, **De weduwe van Naïn**. Die drie namen staan bij de markering in `GROEPEN` van `bijbelreis-personen-check.mjs`,
anders keurt de controle de wie-lijst af. Het zijn eigenlijk rollen (zoals “De Sunamitische” in `ROLLEN`), geen groepen. Ze komen
niet in `who` voor; in `GROUPS` van `app.js` zijn ze daarom niet nodig. De integrator kan ze desgewenst naar `ROLLEN` verplaatsen.

## Twijfelpunten en keuzes

1. **Volgorde en datering.** Het deel voegt Johannes en Lukas samen. Johannes 4 volgt op het eerste Pascha en de tijd in Judea.
   Lukas zet Nazareth aan het begin van het werk in Galilea; of dit hetzelfde bezoek is als Mattheüs 13:54–58 / Markus 6:1–6,
   daarover verschillen uitleggers (zo gezegd in `tijdNoot`). **Naïn valt later**: de dag na de hoofdman van Kapernaüm
   (Lukas 7:1–11), dus midden in de tijd van het deel `nt-galilea`. De `tijdNoot` zegt dat uitdrukkelijk; de volgordevraag zegt
   “zoals dit deel het vertelt”. `tl: [28, 29]`, datering `["historie", false]` zoals `nt-begin` en `nt-galilea`.
2. **Begin van de route in stap 1.** Johannes zegt alleen “Judea” (3:22; 4:3). De lijn begint bij Jeruzalem; het weetje zegt dat.
3. **Geen route naar Nazareth** (stap 6): Lukas noemt niet waar de Heere Jezus vandaan kwam. Wel een stippellijn in stap 7 naar
   Kapernaüm (Lukas 4:31; Mattheüs 4:13), die aansluit op stap 1 van `nt-galilea`.
4. **Route naar Naïn** vanuit Kapernaüm rust op ‘op den volgenden dag’ (Lukas 7:11, Statenvertaling) na Lukas 7:1–10. Andere
   handschriften lezen “daarna”; dan is het vertrekpunt minder zeker. Als reconstructie gemarkeerd.
5. **De weg van de hoveling** (Kapernaüm → Kana) is als tweede, grijze route getekend en telt niet mee in “Alle reizen van de
   Heere Jezus”. Kana is betwist (`b`): beide afstanden hangen af van Chirbet Qana.
6. **Het zesde uur** (Johannes 4:6): meestal twaalf uur ’s middags; enkele uitleggers zes uur ’s avonds. Beide genoemd.
7. **‘Dezen berg’** (Johannes 4:20): Johannes noemt de naam niet. Gerizim staat als uitleg in het weetje en in de plaats, niet in `txt`.
8. **Niet uit de Bijbel** (weetjes met `fs: "h"`/`"u"`): de Samaritaanse tempel op de Gerizim en de verwoesting ervan (Josephus,
   Joodse Oudheden 11.8 en 13.9.1; uit het hoofd, niet opnieuw nageslagen); de hoogte van het meer (ruim 200 m onder zeeniveau, zoals
   elders in de app); de hoveling “waarschijnlijk van Herodes de viervorst”. De herkomst van de Samaritanen uit 2 Koningen 17
   staat als gangbare uitleg in `cross`, niet als feit.
9. **Lukas 4:26**: de Statenvertaling heeft ‘Sarepta Sidonis’; in de tekst “Zarfath (Sarepta) bij Sidon”, zoals elders in de app.
10. **Johannes 4:16–18** (vijf mannen): sober, alleen wat de tekst zegt.
11. **Ingekort**: Johannes 4:32–33 (de spijs die de discipelen niet kennen), 4:36–38 (zaaier en maaier), de hongersnood in
    Lukas 4:25, en ‘van waar hebt Gij dan het levend water?’ (4:11). Niets daarvan is anders voorgesteld.
12. **Stap 5 licht ook Sichar op** (`at`), omdat de reis daar begint (4:43) en het label anders op een telefoon wegvalt.

## Controle

- `node --check` op het boekbestand, `plaatsen.js`, `personen.js`, `dateringen.js`: in orde.
- `scripts/bijbel-controle/nt-samaria-nain.txt`: 132 regels, 0 mis. `personen.txt`: 0 mis.
- `node scripts/bijbelreis-personen-check.mjs`: geen fouten. `npx vitest run tests/bijbelreis.test.ts`: geslaagd.
- Visueel bekeken (Chromium, desktop 1440×900 en telefoon 412×915): alle acht stappen, labels en routes; geen consolefouten.
