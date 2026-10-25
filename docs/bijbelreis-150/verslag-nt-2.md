# Verslag groep nt-2: geschiedenissen 100–117

Bijbelreis 3.0, 25 oktober 2026. Bereik: Markus 6 t/m Lukas 19.

## Bestanden

- `public/bijbelreis/inhoud/nt-jezus-2.js`: nieuw boek `jezus-2` ‘De Heere Jezus onderweg’ (`nt: true`, kleur teal) met drie delen en 28 stappen:
  - `nt-brood-en-berg` ‘Brood, belijdenis en berg’ (7 stappen; Markus 6, Johannes 6, Mattheüs 16, Lukas 9)
  - `nt-feesten-jeruzalem` ‘Op de feesten in Jeruzalem’ (9 stappen; Johannes 5, 9–11)
  - `nt-reis-naar-jeruzalem` ‘Op weg naar Jeruzalem’ (12 stappen; Lukas 9:51 – 19:10 en Markus 10)
  - Per deel: speurtocht (2–3 tikvragen, 8 meerkeuzevragen, 1 volgordevraag), `trips`, `tijd`/`tl`/`tijdNoot`. Boek: ‘Wie is wie’ (11 personen) en `ordAlles`.
  - Kleuren in `BR.personen`: eigen namen via `Object.assign`; namen die ook in `jezus-1`/`jezus-3` staan (Jezus, Petrus, Jakobus, Johannes, Discipelen, Herodes Antipas, Kajafas, Thomas, enz.) alleen als ze nog geen kleur hebben.
- `public/bijbelreis/geschiedenissen/nt-2.js`: 18 records (100–117) en de kernwoorden `sabbat` (103), `liefde` (110), `dankbaarheid` (113) en `evangelie` (117).
- `public/bijbelreis/plaatsen/nt-2.js`: 4 nieuwe plaatsen (zie onder).
- `scripts/bijbel-controle/nt-2.txt`: 531 controleregels (stappen, speurtocht, elke quizvraag, elke kruisverwijzing, kernwoorden). Resultaat: **531 gecontroleerd, 0 mis**.

Verder gecontroleerd: `node --check` op de drie JS-bestanden; `dump.cjs` loopt zonder fouten (21 boeken, 226 plaatsen); elke `stappen`-sleutel, elk plaats-id (`at`, routes, `ctx`, tikvragen, ontdek-kaart) en elke verwijzing (via `BR.parseRef`) bestaat; `npx vitest run tests/bijbelreis.test.ts`: 16 geslaagd, 1 overgeslagen (de 150-test die pas aan het eind aan gaat).

## Nieuwe plaatsen (`plaatsen/nt-2.js`)

| id | naam | c | toelichting |
| --- | --- | --- | --- |
| `nt2_efraim` | Efraïm | w | Johannes 11:54; bij et-Taiyibe (OpenBible Ephraim 2 = Ephraim 1). Gangbaar, niet zeker. |
| `nt2_samaria` | Samaria (streek) | r | Lukas 9:52–53; middelpunt bij benadering. |
| `nt2_vlek` | Een dorp (tien melaatsen) | o | Lukas 17:11–12 noemt geen naam; punt illustratief op de grens Galilea–Samaria. |
| `nt2_perea` | Over de Jordaan | r | Markus 10:1; ‘Perea’ is de naam bij Josephus, niet uit de Bijbel. |

Hergebruikt: `nt_machaerus` (alleen met de kanttekening uit Josephus), `nt_berg` (onbekend), `nt_bethsaida`, `nt_meer`, `nt_kapernaum`, `nt_kaesareafilippi`, `nt_bethesda`, `nt_siloam`, `nt_tempel`, `nt_doopplaats`, `nt_bethanie`, `salem`, `jericho`, en de tussenpunten `olijf`, `jordanford`, `jvalley`, `nt_jordaanvallei`.

## Per geschiedenis

Stapsleutels hieronder zonder het voorvoegsel `jezus-2:`. Status: alle 18 uitgewerkt en gecontroleerd tegen de Statenvertaling.

| nr | titel (eigen) | ref | vorm | stappen | kernwoord | ontdek |
| --- | --- | --- | --- | --- | --- | --- |
| 100 | Herodes en Johannes de Doper | Markus 6:14–29 | plek | nt-brood-en-berg:0 | | wiezei |
| 101 | Vijfduizend mannen eten | Johannes 6:1–15 | plek | nt-brood-en-berg:1, 2, 3 | | koppel |
| 102 | De zieke man bij Bethesda | Johannes 5:1–18 | plek | nt-feesten-jeruzalem:0, 1 | | onthul |
| 103 | De blindgeborene | Johannes 9 | plek | nt-feesten-jeruzalem:2, 3 | sabbat | wiezei |
| 104 | De goede Herder | Johannes 10:1–30 | gelijkenis | nt-feesten-jeruzalem:4, 5 | | gelijkenis |
| 105 | Petrus belijdt: Gij zijt de Christus | Mattheüs 16:13–28 | plek | nt-brood-en-berg:4, 5 | | kaart |
| 106 | De verheerlijking op de berg | Lukas 9:28–36 | plek | nt-brood-en-berg:6 | | verbanden |
| 107 | De kinderen en de rijke jongeman | Markus 10:13–31 | plek | nt-reis-naar-jeruzalem:7, 8 | | onthul |
| 108 | Jakobus en Johannes vragen de beste plaatsen | Markus 10:32–45 | plek | nt-reis-naar-jeruzalem:9 | | koppel |
| 109 | De barmhartige Samaritaan | Lukas 10:25–37 | gelijkenis | nt-reis-naar-jeruzalem:1 | | volgorde |
| 110 | Martha en Maria | Lukas 10:38–42 | plek | nt-reis-naar-jeruzalem:2 | liefde | onthul |
| 111 | Het grote avondmaal | Lukas 14:15–24 | gelijkenis | nt-reis-naar-jeruzalem:3 | | koppel |
| 112 | De verloren zoon | Lukas 15:11–32 | gelijkenis | nt-reis-naar-jeruzalem:4 | | gelijkenis |
| 113 | Tien melaatsen | Lukas 17:11–19 | plek | nt-reis-naar-jeruzalem:5 | dankbaarheid | volgorde |
| 114 | De Farizeeër en de tollenaar | Lukas 18:9–14 | gelijkenis | nt-reis-naar-jeruzalem:6 | | wiezei |
| 115 | Lazarus wordt opgewekt | Johannes 11:1–46 | route | nt-feesten-jeruzalem:6, 7, 8 | | volgorde |
| 116 | De blinde Bartimeüs | Markus 10:46–52 | plek | nt-reis-naar-jeruzalem:10 | | kaart |
| 117 | Zacheüs | Lukas 19:1–10 | plek | nt-reis-naar-jeruzalem:11 | evangelie | wiezei |

Niet aan een geschiedenis gekoppeld (wel nodig voor de reis): `nt-reis-naar-jeruzalem:0` (Lukas 9:51–56, het Samaritaanse dorp; staat als kruisverwijzing bij 108).

Gelijkenissen (104, 109, 111, 112, 114): in de tekst staat wie ze vertelt en waarom, zoals de Bijbel het zegt (Johannes 9:40–10:6; Lukas 10:29; 14:15; 15:1–2; 18:9). Geen route. De stappen 1, 3, 4 en 6 van `nt-reis-naar-jeruzalem` hebben `at: []` met `view: "kanaan"`, omdat Lukas niet zegt waar ze verteld zijn. Bij de goede Herder staat Jeruzalem (`salem`): Johannes 10 sluit aan op Johannes 9 en 10:22 in Jeruzalem.

## Twijfelpunten voor Martijn

1. **Machérus** (`nt_machaerus`, c `o`) is de plek van stap `nt-brood-en-berg:0`. De Bijbel noemt de gevangenis van Johannes niet; de stap legt uit dat de plaats van Josephus komt. Alternatief: geen plek (`at: []`).
2. **Herodes Antipas** als naam in `who`. De Bijbel zegt ‘Herodes (de viervorst)’. De naam is gekozen om hem te onderscheiden van Herodes in Mattheüs 2; `jezus-3` gebruikt dezelfde naam.
3. **Martha en Maria in Bethanië** (Lukas 10:38). Lukas zegt ‘een vlek’; Bethanië komt uit Johannes 11:1. Dat staat er zo bij.
4. **Gelijkenissen zonder kaartplek.** De weg Jeruzalem–Jericho uit de gelijkenis van de Samaritaan is niet getekend; de uitleg staat in het weetje. Moet de kaart bij een gelijkenis toch iets laten zien, bijvoorbeeld een gemarkeerde ‘verhaalweg’?
5. **Volgorde en indeling.** Deel 3 volgt eerst Lukas en daarna Markus 10; Lazarus staat in deel 2 (Johannes). Hoe Lukas 9–19, Johannes 10–11 en Markus 10 precies in de tijd samenvallen, is een reconstructie. De `tijdNoot` zegt dat.
6. **Johannes 5:4** (de engel die het water bewoog) staat in de Statenvertaling. De stap zegt alleen dat de zieken ‘wachten tot het water bewogen wordt’ (vers 3). Moet de engel uit vers 4 er uitdrukkelijk in?
7. **Sectie** van 107 en 108 is `galilea`, omdat de leidraad 87–108 zo indeelt. Inhoudelijk spelen ze zich aan de overkant van de Jordaan af.
8. **Kernwoord sabbat**: de uitleg eindigt met de eerste dag van de week, de dag van de opstanding (Johannes 20:1; Handelingen 20:7). Zo blijft de uitleg bij de Bijbeltekst; graag beoordelen of dit past bij hoe de doelgroep over de zondag spreekt.
9. **Jericho**: de kaart gebruikt het bestaande `jericho` (Tell es-Sultan, het Jericho van Jozua). Het Jericho uit de tijd van de Heere Jezus (Tell el-Alayiq) lag ongeveer 2 km zuidelijker. Op deze schaal is er geen aparte plaats toegevoegd.
10. **Spijziging bij Bethsaïda**: de plek volgt Lukas 9:10. Markus 6:45 laat de discipelen daarna ‘tegenover naar Bethsaïda’ varen, en uitleggers lossen dat verschillend op. Het weetje noemt Lukas als bron.
11. **Johannes 11:6**: ‘de plaats waar Hij was’ is opgevat als de plaats uit 10:40 (over de Jordaan). Daarom loopt de route `nt_doopplaats → Bethanië` (recon).
12. **Personen** (`personen.js`, `BR.mensen`): niet aangepast, want dat bestand hoort niet bij deze groep. Nieuwe namen in `who` die nog gekoppeld moeten worden: Lazarus, Martha, Maria van Bethanië, Herodias, Kajafas, Bartimeüs, Zacheüs, Thomas, Andreas, Filippus, Johannes de Doper, Herodes Antipas.
13. **Datering**: overal ‘ca. 28–30 n.Chr. (of 31–33)’, uitgaande van een kruisiging in ca. 30 en met 33 als alternatief. Johannes 5:1 zegt niet welk feest het was; Bethesda (102) staat daarom op ca. 28, met ‘onzeker’ erbij.
