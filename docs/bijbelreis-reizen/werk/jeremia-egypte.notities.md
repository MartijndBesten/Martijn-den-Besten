# Notities bij het deel `jeremia-egypte` (Profeten, Jeremia 41–44)

Vervolg op het deel `jeremia` (dat eindigt bij Jeremia 40:16). Tien stappen, van de dood van Gedalja in Mizpa tot het woord
van Jeremia 44 in Egypte. Geschreven naast de Statenvertaling (`node scripts/sv.mjs "Jeremia 41:1–44:30"`).

## Nieuwe plaatsen

Ligging uit OpenBible.info Bible Geocoding Data (`plaats-zoek.py --exact`).

| sleutel | naam | `c` | punt | score | grond |
| --- | --- | --- | --- | ---: | --- |
| `je_tachpanhes` | Tachpanhes | v | 30.8606, 32.1714 | 1000 | Tahpanhes = Tell Defenneh (punt op de tell); enige identificatie. |
| `je_migdol` | Migdol | o | 30.9648, 32.4929 | 227 | Migdol 2 (Jeremia 44:1; 46:14): Tell el-Herr 227, Tell Qedua 102 (2,6 km verder), Tell el-Borg 21, Tell Ahmar 16. Alleen zwakke voorstellen, dus `o`; het punt staat op het best ondersteunde voorstel. Geen `b`: de twee beste kandidaten liggen minder dan 3 km uit elkaar. |
| `je_nof` | Nof (Memphis) | v | 29.8488, 31.2530 | 1000 | Memphis (punt in de zichtbare resten); enige identificatie. |
| `je_on` | On (Beth-Semes) | v | 30.1294, 31.3075 | 1000 | OpenBible rekent Jeremia 43:13 bij Heliopolis (Ain Shams, Tell el-Hisn), samen met Genesis 41:45 (On). |
| `je_pathros` | Pathros | r | 24.1, 32.7 | 1000 | Opper-Egypte; OpenBible geeft één ‘punt in de streek’ (bij Aswan). Gebied, geen stip. |

Geen nieuwe tussenpunten in `BR.W`. De route naar Egypte gebruikt bestaande punten (`hebron`, `lachisw`, `gaza`, `arish`,
`pelusium`) en dezelfde twee losse coördinaten langs de kust als de bestaande routes in Genesis en 2 Koningen.

Hergebruikt: `mizpa`, `gibeon`, `efrath` (Bethlehem), `sichem`, `silo`, `samaria`, `bethel`, `jericho`, `rabba`, `salem`, `egypte`.

## Plaatsen uit de tekst die niet (als eigen punt) op de kaart staan

- **Geruth Chimham** (41:17): OpenBible geeft alleen ‘binnen 5 km van Bethlehem’ (geen eigen punt). Daarom licht `efrath`
  op; het weetje van stap 4 zegt dat erbij.
- **Het grote water bij Gibeon** (41:12): geen eigen punt; `gibeon` licht op.
- **De put van Asa in Mizpa** (41:9): in de stad zelf; `mizpa` licht op.
- **Het land van de Ammonieten** (41:10, 15): de tekst noemt geen plaats. De rode lijn van Ismaël (stap 3) loopt van Gibeon
  via Jericho en de Jordaan naar `rabba`, de hoofdstad; Rabba licht niet op en staat alleen als context op de kaart. Wie dat
  te stellig vindt, kan de lijn laten eindigen bij `jordanford`.
- **Babel** en **Juda/Jeruzalem** worden alleen genoemd; Jeruzalem staat als context (`ctx`).

## Keuzes en twijfelpunten

1. **Ismaël als persoon.** In `BR.mensen` staat al `ismael` (zoon van Abraham, boek genesis). Een tweede persoon met
   `n: "Ismaël"` maakt de naam een naamgenoot, en dan eist `bijbelreis-personen-check.mjs` regels in `VERWACHT`
   (`genesis|Ismaël`, `profeten|Ismaël`). Die lijst heeft geen markering en mocht ik niet wijzigen. Daarom heet de nieuwe
   persoon **“Ismaël (zoon van Nethanja)”** (`ismael_nethanja`), ook in `who`, de wie-lijst en de kleuren. Alternatief voor
   de integrator: `n: "Ismaël"` met in `who` `["Ismaël", "zoon van Nethanja"]`, plus twee regels in `VERWACHT`.
2. **Namen.** HSV-spelling waar ik die kon nagaan (herzienestatenvertaling.nl): Azaria, Jezanja, Hosaja, Kareah, Neria
   (SV: Nerija), Geruth Chimham (SV: Geruth-chimham; de opdracht schreef Geruth-Chimham), Tachpanhes, Nof, Pathros, Migdol,
   Hofra. De koning van Babel heet in de lopende tekst **Nebukadnezar**, zoals de bestaande persoon en het deel `jeremia`;
   Jeremia 43–44 schrijft Nebukadrezar (ook in de HSV). Het weetje van stap 8 noemt dat.
3. **Beth-Semes (43:13).** De Statenvertaling heeft de naam Beth-semes; de HSV vertaalt hier ‘de zonnetempel’. De tekst
   van stap 8 volgt de Statenvertaling; de plaats heet op de kaart ‘On (Beth-Semes)’ en de uitleg staat in `d`.
4. **De stenen in Tachpanhes (43:9).** SV: ‘in de klei in den ticheloven’; de HSV heeft ‘in het leem’ met een tegelvloer
   in plaats van een steenoven. De tekst zegt daarom alleen ‘in de klei … bij de deur van het huis van Farao’; de
   speurvraag vraagt alleen naar de stenen.
5. **‘Melecheth des hemels’ (44:17).** Als citaat uit de Statenvertaling, met erbij ‘de koningin van de hemel’ (zo de HSV).
6. **Route naar Egypte (stap 7).** De Bijbel noemt alleen Geruth Chimham bij Bethlehem en Tachpanhes (`recon: 1`). Gekozen
   is de kustweg (Hebron, Lachis, Gaza, el-Arish, Pelusium), omdat Tachpanhes aan die weg ligt, bij de oostrand van de
   delta. De bestaande stap in 2 Koningen 25:22–30 tekent dezelfde vlucht over de weg van Sur naar het gebied `egypte`. Dat
   verschil is bewust niet gelijkgetrokken (ander bestand); beide zijn reconstructies.
7. **De tachtig mannen (stap 2).** Grijze lijn Samaria–Sichem–Silo–Bethel–Mizpa over de bergrug (`recon: 1`); de tekst
   noemt alleen de drie plaatsen van herkomst. Weggelaten: dat zij ‘zichzelven gesneden’ hadden (41:5).
8. **Waar was Jeremia in hoofdstuk 41?** De tekst zegt het niet. Het weetje van stap 5 zegt dat en geeft de gangbare
   afleiding uit 40:6 als uitleg (`fs: "u"`).
9. **Datering.** `tl: [-586, -570]`, `["historie", false]`. Het jaar van de moord op Gedalja staat niet in de tekst (alleen
   de zevende maand); Jeremia 44 heeft geen datum. De bovengrens is het einde van de regering van Hofra (Apriës) in de
   gangbare chronologie. Niet genoemd in de noot: dat sommigen de moord verbinden met de wegvoering van Jeremia 52:30.
10. **Historische weetjes (`fs: "h"`).** Stap 8: het Babylonische kleitablet over de veldtocht van Nebukadnezar tegen
    Egypte in zijn 37e jaar (ca. 568/567 v.Chr., onder Amasis; BM 33041). Stap 10: Herodotus (Historiën II, 161–169) over
    Apriës en Amasis. Beide zijn als buitenbijbels gemarkeerd; de tekst zegt dat de Bijbel de afloop niet vertelt. Graag
    nalezen door de redactie.
11. **Niet opgenomen als persoon:** Azaria en Jezanja (alleen in de tekst), Farao Hofra (alleen in de profetie; staat wel
    in de speurtocht), Nebukadnezar en Baälis (niet in `who`). Bestaande personen zijn niet gewijzigd.
12. **Tikvraag Tachpanhes:** eigen kaartuitsnede van de oostelijke delta, met `loose: 1` (raak binnen 30 km; Migdol ligt
    op 33 km).

## Nieuwe personen

`ismael_nethanja` (“Ismaël (zoon van Nethanja)”) en `baruch` (“Baruch”), beide `boek: ["profeten"]`. Geen nieuwe
groepsnamen: `Volk`, `Mannen`, `Vrouwen` en `Joden` bestonden al.

## Controles

`node --check` (vier bestanden), `bijbel-check.py` voor `jeremia-egypte.txt` en `personen.txt`,
`bijbelreis-personen-check.mjs`, `vitest run tests/bijbelreis.test.ts`: alle geslaagd. Daarnaast
`node scripts/bijbelreis-check.mjs desktop` (geen problemen) en schermafbeeldingen van de stappen 3, 4, 7, 8, 9 en 10
bekeken (labels, routes).
