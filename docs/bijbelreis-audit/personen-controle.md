# Onafhankelijke controle personen: grondslag, naamgenoten en koppeling (25 oktober 2026)

Gewijzigd: `public/bijbelreis/personen.js`, `scripts/bijbelreis-personen-check.mjs` en `scripts/bijbel-controle/personen.txt`.
Inhoud, geschiedenissen, `app.js` en tests zijn niet door deze controle gewijzigd. Alle teksten zijn opnieuw nagelezen in de
Statenvertaling (editie 1888, SV-nummering) in `public/bijbelreis/bijbel/`. Het werk van de vorige makers is niet als
uitgangspunt genomen.

## Uitkomst in getallen

| | aantal |
| --- | --- |
| personen in `BR.mensen` | 281 (266 in de reis, 15 alleen voor de familie) |
| personen met een familieband (en dus een veld `basis`) | 134 (was 135) |
| familiebanden (partners per kant geteld) | 197 (was 198): 100 vader, 37 moeder, 60 partner |
| grondslag **b** (expliciet in de Bijbel) | 184: 95 vader, 35 moeder, 54 partner |
| grondslag **a** (afgeleid, met redenering) | 13: 5 vader, 2 moeder, 6 partner |
| overleveringen (veld `overlevering`) | 2 (`johannes_patmos`, `johannes`) |
| verwijderde familiebanden | 1 (Zeruja `v: isai`) |
| gecorrigeerde personen | 1 naam (Nahor de opa), daarnaast 6 teksten in `kort`/`elders` verzuiverd (zie onder) |
| gesplitste personen | 0 (zie ‘Abimelech’ en ‘Achis’ bij de twijfelpunten) |
| controleregels `personen.txt` | 1.223 (was 1.094; +129), `bijbel-check.py` → **0 mis** |
| `node scripts/bijbelreis-personen-check.mjs` | **geen fouten, 0 waarschuwingen**; 2 bekende inhoudsfouten buiten personen.js (met `--streng` exitcode 1) |
| `npx vitest run tests/bijbelreis.test.ts` | 19 geslaagd, 1 overgeslagen (ook ‘personen met dezelfde naam delen nooit een boek’) |

## Hoe de grondslag is vastgelegd

```js
basis: { v: ["b", "Mattheüs 4:21"], m: ["a", "Genesis 4:1; 4:25", "redenering"], p: { sara: ["b", "Genesis 11:29"] } }
overlevering: [["tekst", "toelichting dat dit niet in de Bijbel staat"]]
```

- **b**: één tekst of één doorlopend gedeelte noemt de band letterlijk, met de personen in datzelfde gedeelte bij naam
  (bijv. ‘Laban had twee dochters: … Lea; … Rachel’, Genesis 29:16). Een optioneel derde element is een toelichting als een
  andere tekst iets anders zegt (Laban, Abjathar, Jochebed, Jerobeam II, Jojachin, Zedekia, Joseba/Jojada, Belsazar,
  Zerubbabel, Petrus, Herodes Antipas).
- **a**: volgt pas uit het combineren van teksten; het derde element geeft de redenering. Verwijzingen staan in één boek
  (meer delen met ‘; ’), zodat `parseRef` van de app en van de tests ze kan lezen.
- Elke b/a-verwijzing heeft een eigen regel in `personen.txt` met een regex die de band zelf laat zien
  (bijv. `Johannes 1:41–43 | Andreas, de broeder van Simon Petrus.*Simon, de zoon van Jonas`).
- Kerkelijke overlevering staat nooit in `v`/`m`/`p`. Er was geen band die alléén op overlevering rustte; wel één band die op
  een onhoudbare afleiding rustte (Zeruja, zie onder).

De 13 afgeleide banden: Abel–Adam (Genesis 4:1–2), Seth–Eva (Genesis 4:1; 4:25), Sara–Terach (Genesis 11:26; 20:12, Abrahams
eigen woorden), Zippora–Jethro (Exodus 2:18–21; 18:1–2, Jethro = Rehuël), Rachab–Salmon en Salmon–Rachab (Mattheüs 1:5),
Boaz–Rachab (Mattheüs 1:5: de naam is letterlijk, de gelijkstelling met de Rachab uit Jericho niet), Ahasveros–Vasthi en
Ahasveros–Esther, beide kanten (Esther 1:9–12; 2:16–17: ‘koningin’, niet ‘vrouw’), Sealthiël–Jojachin (Mattheüs 1:12:
‘Jechonias’; Jechonia = Jojachin volgens Jeremia 24:1), Andreas–Jonas (Johannes 1:41–43).

## De drie specifieke gevallen

1. **Andreas en Jonas.** `v: "jonas"` blijft, maar als **a**: `["a", "Johannes 1:41–43", "Andreas is ‘de broeder van Simon
   Petrus’ (1:41) en Simon is ‘de zoon van Jonas’ (1:43). Dat Andreas ook een zoon van Jonas is, volgt uit ‘broeder’, maar staat
   nergens letterlijk."]`. Let op de SV-nummering: ‘Simon, de zoon van Jonas’ staat in Johannes **1:43** (niet 1:42). Petrus
   zelf: **b**, Johannes 1:43 (ook 21:15; Mattheüs 16:17 ‘Bar-jona’). De app toont Andreas daardoor als afgeleid kind van Jonas.
2. **Jozef, de man van Maria.** De SV-spelling in Lukas 3:23 is **‘Heli’**: ‘zijnde (alzo men meende) de zoon van Jozef, den
   zoon van Heli’. Mattheüs 1:16: ‘En Jakob gewon Jozef, den man van Maria’. Er is **geen `v`** gezet en geen keuze gemaakt:
   `kort` noemt beide teksten en zegt dat de Bijbel niet uitlegt hoe de twee geslachtsregisters samenhangen; `elders` heeft nu
   Mattheüs 1:16 én Lukas 3:23. Maria–Jozef: **b**, Mattheüs 1:16 (‘Jozef, den man van Maria’). Jezus: `m: maria` (**b**,
   Mattheüs 1:16), geen `v`.
3. **Johannes van Patmos.** Aparte persoon `johannes_patmos`, zonder familie. De zin ‘volgens de oude overlevering is het de
   apostel Johannes’ is uit `kort` gehaald (nu: ‘Welke Johannes dit is, zegt de Bijbel niet.’) en staat als
   `overlevering: [["Hij is de apostel Johannes, de zoon van Zebedeüs.", "Kerkelijke overlevering vanaf de tweede eeuw (onder
   anderen Justinus Martyr en Irenaeus). De Bijbel zegt het niet: …"]]`. Bij de apostel (`johannes`) staat de spiegel daarvan,
   plus de overlevering dat hij ‘de discipel, dien Jezus liefhad’ is (Johannes 21:20, 24 noemen geen naam). ‘Johannes’ in
   Openbaring (stappen, wie-lijst, geschiedenissen 149 en 150) koppelt aan `johannes_patmos`; in de evangeliën en Handelingen aan
   de apostel.

## Andere ‘zoon van’ / ‘dochter van’ waar teksten verschillen

| persoon | wat er staat | besluit |
| --- | --- | --- |
| **Zeruja** | 1 Kronieken 2:16 ‘hun zusters waren Zeruja en Abigaïl’ (de zusters van de zonen van Isaï); 2 Samuël 17:25 ‘Abigaïl, dochter van Nahas, zuster van Zeruja’ | **`v: isai` verwijderd**: Isaï als vader is niet af te leiden (halfzusters kunnen). Beide teksten staan nu in `elders`; `kort`: ‘Wie haar vader was, zegt de Bijbel niet eenduidig.’ Joab en Abisaï houden `m: zeruja` (**b**, 2 Samuël 2:18). |
| Zerubbabel | Ezra 3:2, Haggaï 1:1, Mattheüs 1:12: zoon van Sealthiël; 1 Kronieken 3:19 bij ‘de kinderen van Pedaja’ | `v: sealthiel` **b** met toelichting; geen keuze verder. |
| Sealthiël | Mattheüs 1:12 ‘Jechonias gewon Salathiël’; 1 Kronieken 3:17 ‘Assir; zijn zoon was Sealthiël’ (dubbelzinnig) | **a** (via Jeremia 24:1). |
| Jojachin | 2 Koningen 24:6 zoon van Jojakim; Mattheüs 1:11 ‘Josias gewon Jechonias’ | **b** met toelichting (Josia is grootvader). Leeftijd 18 (2 Koningen 24:8) tegenover 8 (2 Kronieken 36:9) was al vermeld. |
| Zedekia | Jeremia 1:3 ‘zoon van Josia’; 2 Koningen 24:17 ‘oom’; 2 Kronieken 36:10 ‘zijn broeder’; 1 Kronieken 3:16 nog een Zedekia | **b** (Jeremia 1:3) met toelichting. |
| Laban | Genesis 28:5 ‘zoon van Bethuël’; 29:5 ‘zoon van Nahor’ | **b** met toelichting (kleinzoon). |
| Abjathar | 1 Samuël 22:20 zoon van Achimelech; 2 Samuël 8:17 ‘Achimelech, zoon van Abjathar’ | **b** met toelichting. |
| Belsazar | Daniël 5:2, 11, 18 ‘zijn/uw vader Nebukadnezar’ | **b** met toelichting (‘vader’ kan voorvader zijn; buiten de Bijbel zoon van Nabonidus). |
| Ahazia van Juda | 2 Koningen 8:24 zoon van Joram; 8:25 spelt de SV ‘Jeroham’ | **b** op 8:24. |
| Abia/Abiam | 1 Koningen 15:2 tegenover 2 Kronieken 13:2 (moeder) | niet van toepassing: Abiam staat niet in `BR.mensen`. |
| Athalia, Jeremia, Zacharia (profeet), Darius de Meder | ‘dochter van Omri’/‘van Achab’; ‘Hilkia’; ‘zoon van Iddo’/‘van Berechja’; ‘zoon van Ahasveros’ | ongewijzigd zonder `v` (de vorige keuze is juist: geen gelijkstelling die de Bijbel niet maakt). |

## Zelfde naam, verschillende personen

Namen die bij meer dan één persoon horen (n of alias), na de correctie van Nahor:

| naam | personen → boek |
| --- | --- |
| Simeon | `simeon` → genesis · `simeon_nt` → jezus-1 |
| Gad | `gad` → genesis · `gad_ziener` → 2samuel |
| Jozef | `jozef` → genesis, jozua · `jozef_nt` → jezus-1 (Jozef van Arimathea heeft een eigen naam) |
| Manasse | `manasse` → genesis · `manasse_juda` → geen boek |
| Jozua | `jozua` → exodus, numeri, jozua · `jesua` (alias Jozua, Haggaï 1:1) → ezra |
| Hosea | `jozua` (alias Hosea) → exodus, numeri, jozua · `hosea` (koning) → 2koningen |
| Jabin | `jabin_jozua` → jozua · `jabin_richteren` → richteren |
| Joas | `joas_abiezriet` → richteren · `joas_israel` → 2koningen (`joas_juda` heet ‘Joas van Juda’) |
| Jerobeam | `jerobeam_1` → 1koningen · `jerobeam_2` → jona |
| Darius | `darius_meder` → daniel · `darius_pers` → ezra |
| Maria | `maria` → jezus-1, jezus-3 · `maria_bethanie` (alias) → jezus-2 (Maria Magdalena heeft een eigen naam) |
| Herodes | `herodes` → jezus-1 · `herodes_agrippa` → handelingen (‘Herodes Antipas’ heeft een eigen naam) |
| Johannes | `johannes` → jezus-1/2/3, handelingen · `johannes_patmos` → openbaring (‘Johannes de Doper’, ‘Johannes Markus’ eigen namen) |
| Filippus | `filippus` → jezus-1, jezus-2 · `filippus_evangelist` (alias) → handelingen |

Geen enkel boek bevat nog twee personen met dezelfde naam. Ook nagelopen en eenduidig: Ananias (`ananias` en `ananias_damascus`
‘Ananias van Damascus’), Simon (alleen alias van Petrus; Simon de Farizeeër, van Cyrene en de tovenaar hebben eigen namen),
Jakobus (alleen de zoon van Zebedeüs; Alfeüs alleen in `kort`), Judas (alleen Judas Iskariot), Zacharia (profeet) tegenover
Zacharias (priester, Lukas 1), Ahasveros (één persoon; de Ahasveros van Daniël 9:1 is niet gekoppeld).

**Correctie Nahor (ook op verzoek van de hoofdagent).** `nahor_serug` en `nahor` hadden beide n ‘Nahor’ en boek genesis; de app
koppelde elke ‘Nahor’ in Genesis aan de laatste. ‘Nahor’ staat in Genesis alleen in de stamboom-rij (de broer van Abram) en
niet in een stap; de opa staat in de leeftijdenlijst als ‘Nahor (opa)’. Daarom: `nahor_serug` heeft nu **n ‘Nahor (opa)’ en
geen alias**; `nahor` (de broer) is de enige ‘Nahor’. De vitest-regel ‘personen met dezelfde naam delen nooit een boek’ is groen.

**Teksten verzuiverd** (geen familiebanden): `jozef_nt` (kort + Lukas 3:23 in elders), `johannes_patmos` (overlevering uit
kort), `johannes` (Galaten 2:9: ‘een Johannes … vermoedelijk deze apostel’), `ahasveros` (Ezra 4:6: ‘een koning Ahasveros …
niet met zoveel woorden dezelfde’), `rachab` (Mattheüs 1:5: ‘vermoedelijk deze Rachab’), `zeruja` (kort en elders).

## Koppeling met de site: de nieuwe check

`scripts/bijbelreis-personen-check.mjs` volgt nu precies de huidige `app.js` (na de wijziging van de hoofdagent): per boek één
persoon per naam (`boek|naam`), en alleen bij geschiedenissen en ontdek-stambomen een terugval op een naam die maar één persoon
heeft (`mensIn`). Het controleert:

- (a) elke naam in `who` van stappen en deel-intro's (strikt per boek; de app splitst `who` niet, een samengestelde naam is
  daar een fout), in de wie-lijsten (gesplitst op ‘ en ’, ‘, ’, ‘ / ’), in de Genesis-stamboom en leeftijdenlijst, en in `wie`
  van elke geschiedenis (boek van de eerste bestaande stap, anders globaal);
- (b) elke naam in een ontdek-stamboom (`soort: "stamboom"`, beide vormen) wordt gekoppeld of staat in `ONGEKOPPELD` met reden
  (13: ‘Adam en Eva’, ‘Henoch (een andere Henoch dan in Genesis 5)’, ‘Bilha (slavin van Rachel)’, ‘Zilpa (slavin van Lea)’,
  ‘Benjamin (later geboren, 35:18)’, Perez, Hezron, Ram, Amminadab, Nahesson, Amazia, ‘Jonas (vader)’, ‘Zebedeüs (vader)’);
- (c) elke `basis`-regel: soort b of a, a met redenering, leesbare verwijzing gedekt door `personen.txt`, geen grondslag zonder
  band, partners aan beide kanten met dezelfde soort;
- (d) overlevering nooit in v/m/p (soort ‘o’ of ‘overlevering’ is een fout), `overlevering` alleen als [tekst, toelichting];
- naamgenoten: voor elke naam die bij meer personen hoort of die in de Bijbel meer mensen aanduidt (35 namen in
  `NAAMGENOTEN`) moet per plek in `VERWACHT` staan wie bedoeld is; de koppeling moet precies die persoon geven. Met `--toon`
  ziet u alle 260 plekken; 258 kloppen, 2 zijn bekende inhoudsfouten (onder).

Exitcode 1 bij fouten; met `--streng` tellen de bekende inhoudsfouten mee. Getest met opzettelijke fouten (soort ‘o’,
ontbrekende grondslag, a zonder redenering, onbekende sleutel, lege overlevering, twee personen met dezelfde naam in één boek):
alle gemeld, exitcode 1.

### Steekproef: koppeling naar de juiste persoon (42 namen, stap- en verhaaltekst nagelezen)

| plek | naam | gekoppeld aan | klopt omdat |
| --- | --- | --- | --- |
| jezus-3 nt-lijden:6 | Maria | `maria` | Johannes 19:25–27, de moeder bij het kruis |
| geschiedenis 126 | Maria | `maria` | Johannes 19:25 (Maria Magdalena staat er apart) |
| geschiedenis 133 | Maria | `maria` | Handelingen 1:14 ‘Maria, de moeder van Jezus’ |
| jezus-1 nt-begin:4 | Maria | `maria` | Kana: ‘de moeder van de Heere Jezus’ |
| jezus-1 nt-geboorte:1 | Maria | `maria` | Gabriël bij Maria |
| jezus-2 wie ‘Martha en Maria’ | Maria | `maria_bethanie` | zus van Martha |
| geschiedenis 110 | Maria van Bethanië | `maria_bethanie` | Lukas 10:38–42 |
| geschiedenis 128 | Maria Magdalena | `maria_magdalena` | Mattheüs 28:1 |
| jezus-1 nt-geboorte:8 | Herodes | `herodes` | Mattheüs 2, Herodes de Grote |
| geschiedenis 85 | Herodes | `herodes` | Mattheüs 2 |
| geschiedenis 100 | Herodes Antipas | `herodes_antipas` | Markus 6:14–29 |
| handelingen wie | Herodes | `herodes_agrippa` | Handelingen 12 |
| geschiedenis 142 | Herodes (Agrippa I) | `herodes_agrippa` | Handelingen 12 |
| openbaring nt-openbaring:0 | Johannes | `johannes_patmos` | Openbaring 1:9 |
| geschiedenis 149 en 150 | Johannes | `johannes_patmos` | Openbaring |
| jezus-1 nt-galilea:1 | Johannes | `johannes` | Markus 1:19–20, zoon van Zebedeüs |
| jezus-3 nt-lijdensweek:5 | Johannes | `johannes` | Lukas 22:8, met Petrus |
| handelingen nt-gemeente:2 | Johannes | `johannes` | Handelingen 3:1 |
| geschiedenis 87 | Johannes de Doper | `johannes_doper` | Mattheüs 3 |
| genesis jozef:0 | Jozef | `jozef` | Genesis 37 |
| jozua land:7 | Jozef | `jozef` | Jozua 24:32, zijn beenderen |
| jezus-1 nt-geboorte:2 | Jozef | `jozef_nt` | Mattheüs 1:18–25 |
| geschiedenis 127 | Jozef van Arimathea | `jozef_arimathea` | Johannes 19:38 |
| genesis geschiedenis 20 | Simeon | `simeon` | zoon van Jakob (Genesis 42–45) |
| jezus-1 nt-geboorte:7 | Simeon | `simeon_nt` | Lukas 2:25 |
| 2samuel david:10 | Gad | `gad_ziener` | 2 Samuël 24:11 |
| genesis stamboom | Gad | `gad` | zoon van Jakob |
| richteren wie | Joas | `joas_abiezriet` | vader van Gideon |
| 2koningen elisa:8 | Joas | `joas_israel` | 2 Koningen 13:14, koning van Israël |
| geschiedenis 65 wie | Joas van Juda | `joas_juda` | 2 Koningen 11–12 |
| 1koningen salomo:7 | Jerobeam | `jerobeam_1` | 1 Koningen 11:29–31 |
| jona wie | Jerobeam | `jerobeam_2` | 2 Koningen 14:23–25 |
| daniel daniel:7 | Darius | `darius_meder` | Daniël 6 |
| ezra terugkeer:5 | Darius | `darius_pers` | Ezra 5–6 |
| jozua land:3 | Jabin | `jabin_jozua` | Jozua 11 |
| richteren debora:1 | Jabin | `jabin_richteren` | Richteren 4 |
| handelingen nt-gemeente:3 | Ananias | `ananias` | Handelingen 5:1–5 |
| geschiedenis 143 | Ananias van Damascus | `ananias_damascus` | Handelingen 9:10–17 |
| jezus-1 nt-begin:3 | Filippus | `filippus` | Johannes 1:44, de apostel |
| geschiedenis 139 | Filippus de evangelist | `filippus_evangelist` | Handelingen 8 |
| genesis stamboom | Nahor | `nahor` | broer van Abram (rij van de kinderen van Terach) |
| 2koningen ballingschap:0 | Hosea | `hosea` | 2 Koningen 17:1, de koning |

## Open twijfelpunten en bekende fouten buiten personen.js

1. **Geschiedenis 65, ontdek-stamboom, ‘Joas’** koppelt aan `joas_israel` (koning van Israël), bedoeld is Joas van Juda. Niet
   op te lossen in personen.js: in 2 Koningen is ‘Joas’ al `joas_israel` (stap elisa:8). Oplossing in
   `geschiedenissen/ot-3.js`: de rij ‘Joas’ → ‘Joas van Juda’. Staat in `BEKEND` van de check.
2. **Handelingen, wie-lijst ‘Ananias’** (rol ‘drie mannen met dezelfde naam’) toont de persoonskaart van de man van Saffira.
   Oplossing in `inhoud/nt-handelingen.js`: het item een eigen naam geven of splitsen. Staat in `BEKEND`.
3. **jezus-1, wie ‘Simon Petrus en Andreas’**: ‘Zonen van Jonas … (Johannes 1:43, 45)’ stelt de afleiding als feit. Voorstel:
   ‘Simon is de zoon van Jonas (Johannes 1:43); Andreas is zijn broer (1:41).’
4. **Rachab**: dat de moeder van Boaz (Mattheüs 1:5) de Rachab uit Jericho is, is als **a** vastgelegd (naam en tijd: Ruth 4:20;
   Numeri 2:3; Jozua 6:25). Wie dat te zwak vindt, haalt `boaz.m` en het partnerpaar Salmon–Rachab weg en maakt een aparte
   ‘Rachab (Mattheüs 1:5)’; de wie-tekst van Boaz zegt al ‘meestal wordt aangenomen’.
5. **Abimelech** (Genesis 20–21 en 26) en **Achis** (1 Samuël 21 en 27) zijn elk één record; de Bijbel zegt niet of het
   telkens dezelfde koning is. Splitsen kan alleen als de inhoud de tweede een andere naam geeft (anders voegt de app ze in
   hetzelfde boek alsnog samen). `kort` van Abimelech zegt al ‘een koning Abimelech’.
6. **Vasthi en Esther**: ‘koningin’ is als **a** (vrouw van Ahasveros) vastgelegd, omdat ‘vrouw’ er niet letterlijk staat.
7. **Zoeken bij de geschiedenissen** is tekst-zoeken op de namen in `wie` (`g.zoek`), geen persoonskoppeling: ‘Jozef’ vindt
   de geschiedenissen van beide Jozefs en ‘Johannes’ die van de apostel, de Doper en Patmos. Dat voegt geen personen samen,
   maar de zoekresultaten maken het onderscheid niet zichtbaar.
8. `kort` van Abel (‘zoon van Adam en Eva’) en Zippora (‘dochter van Jethro’) noemt een afgeleide band zonder voorbehoud; de
   app toont die band met * (afgeleid) en de redenering, dus niet aangepast.
