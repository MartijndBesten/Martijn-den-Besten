# Verslag groep ot-2: geschiedenissen 32–64 (Leviticus t/m 2 Koningen 5)

Datum: 25 oktober 2026. Status: alle 33 geschiedenissen uitgewerkt en gecontroleerd.

## Bestanden

| Bestand | Wat |
| --- | --- |
| `public/bijbelreis/geschiedenissen/ot-2.js` | 33 records (nr. 32–64) en 8 kernwoorden: offeren, leven, volharding, god, eeuwigheid, wijsheid, tempel, getuigen |
| `public/bijbelreis/inhoud/leviticus.js` | nieuw boek `leviticus` met één deel `verzoendag` (5 stappen, speurtocht 2 tap / 8 mc / 1 ord) |
| `public/bijbelreis/plaatsen/ot-2.js` | geen nieuwe plaatsen nodig (alleen een opmerking) |
| `scripts/bijbel-controle/ot-2.txt` | 742 controleregels tegen de Statenvertaling, **0 mis** |

## Controles

- `python3 scripts/bijbel-check.py scripts/bijbel-controle/ot-2.txt`: 742 gecontroleerd, 0 mis. Elke quizvraag (`why`), elke
  kruisverwijzing, elke verwijzing in `verbanden` en in de kernwoorden heeft een eigen regel; ook de getallen en citaten in de
  uitleg en in de stappen van Leviticus. De tellingen in `stat` (13× ‘verzoening’, 7× ‘verzoendeksel’ in Leviticus 16) zijn met een regex geteld.
- `node --check` op alle vier de JS-bestanden: in orde. `dump.cjs` loopt zonder fouten.
- Eigen controle (BR.parseRef + bijbel-JSON): alle 498 verwijzingen bestaan; alle `stappen`-sleutels bestaan; alle plaats-ids
  (stappen, tap, kaart-ontdekkingen, ctx) bestaan; meerkeuzeantwoorden zijn uniek; 3–5 vragen per geschiedenis.
- `npx vitest run tests/bijbelreis.test.ts`: 16 geslaagd (1 overgeslagen). `node scripts/bijbelreis-check.mjs`: geen problemen.
- `node scripts/bijbelreis-personen-check.mjs`: meldt dat de namen in `leviticus` niet aan `BR.mensen` gekoppeld zijn (zie
  twijfelpunt 1; `personen.js` valt buiten deze groep).

## Per geschiedenis

| nr | titel (eigen) | vorm | stappen | kw | ontdek |
| --- | --- | --- | --- | --- | --- |
| 32 | De Grote Verzoendag | plek | leviticus:verzoendag:0–4 (**nieuw**) | offeren | verbanden |
| 33 | Twaalf verspieders in Kanaän | route | numeri:woestijn:3, 4 | | kaart (Kades) |
| 34 | De koperen slang | route | numeri:woestijn:5–9 | leven | verbanden |
| 35 | Bileam en zijn ezelin | route | numeri:moab:0 | | wiezei |
| 36 | Mozes neemt afscheid en sterft | plek | numeri:moab:3, 4, 5 | | volgorde |
| 37 | Jozua krijgt de leiding; Rachab verbergt de verspieders | route | jozua:intocht:0, 1 | | wiezei |
| 38 | Door de Jordaan | route | jozua:intocht:2, 3 | | onthul |
| 39 | De muren van Jericho | plek | jozua:intocht:3, 4 | volharding | volgorde |
| 40 | Achan en de stad Ai | plek | jozua:intocht:5, 6, 7 | | koppel |
| 41 | De list van de Gibeonieten en het afscheid van Jozua | route | jozua:land:0, 1, 2, 6, 7 | | kaart (Gibeon) |
| 42 | Debora en Barak | route | richteren:debora:1–4 | | wiezei |
| 43 | Gideon en de driehonderd | route | richteren:debora:5–8 | | volgorde |
| 44 | Simson wordt geboren; de leeuw bij Timna | plek | richteren:simson:0, 1, 2 | | onthul |
| 45 | Vossen, fakkels en een ezelskaak | plek | richteren:simson:2, 3 | | koppel |
| 46 | Simson en Delila | plek | richteren:simson:4, 5, 6 | | wiezei |
| 47 | Naomi en Ruth | stamboom | ruth:ruth:0–6 | god | stamboom |
| 48 | Hanna bidt; God roept Samuël | plek | 1samuel:samuel:0, 1 | | wiezei |
| 49 | De ark weggevoerd en teruggebracht | route | 1samuel:samuel:2, 3, 4 | | volgorde |
| 50 | Israël wil een koning; Saul wordt gezalfd | route | 1samuel:samuel:5, 6, 7 | | onthul |
| 51 | Saul verworpen, David gezalfd (+ Psalm 23) | plek | 1samuel:saul-david:0–3 | | onthul (David de herder, met Psalm 23) |
| 52 | David en Goliath | plek | 1samuel:saul-david:4 | | wiezei |
| 53 | Jonathan en David | plek | 1samuel:saul-david:0, 5 | | koppel |
| 54 | David op de vlucht voor Saul | route | 1samuel:saul-david:5, 6, 7 | | kaart (En-Gedi) |
| 55 | Sauls laatste nacht en zijn dood op de Gilboa | plek | 1samuel:saul-david:7, 10; 2samuel:david:0 | eeuwigheid | volgorde |
| 56 | David koning in Hebron en Jeruzalem | plek | 2samuel:david:1, 2, 3 | | onthul |
| 57 | De ark naar Jeruzalem; Gods belofte aan David | route | 2samuel:david:4, 5 | | verbanden |
| 58 | David en Bathseba | plek | 2samuel:david:7 | | wiezei |
| 59 | Absalom in opstand | route | 2samuel:david:8, 9 | | volgorde |
| 60 | Salomo vraagt om wijsheid | plek | 1koningen:salomo:1, 2, 5, 6 | wijsheid | koppel |
| 61 | Salomo bouwt de tempel | plek | 1koningen:salomo:3, 4 | tempel | onthul |
| 62 | Salomo’s afval en het gescheurde rijk | plek | 1koningen:salomo:7, 8 | | wiezei |
| 63 | Elia en de profeten van Baäl | route | 1koningen:elia:0–4 | | kaart (Karmel) |
| 64 | Naäman wordt genezen | route | 2koningen:elisa:4 | getuigen | volgorde |

Elke geschiedenis heeft: eigen beschrijvende titel, SV-verwijzing, sectie (32–36 woestijn, 37–41 kanaan, 42–47 richters,
48–62 koningen, 63–64 profeten), uitleg (5–9 zinnen), betekenis met Bijbelverwijzing, wie, ontdekking, 4–5 quizvragen
(eerste antwoord goed, `why` = SV-verwijzing), 2–3 kruisverwijzingen en `tl`/`tijd`/`tijdNoot` als reconstructie.

**Nieuwe stappen:** alleen bij 32: `leviticus:verzoendag:0–4` (Leviticus 8; 9; 10:1–7; 16:1–19; 16:20–34), alle bij de berg
Sinaï (`sinai`, betwist). Geen routes en daarom geen `trips` (Leviticus speelt helemaal bij de Sinaï, Leviticus 7:38; 27:34).
Nadab en Abihu (10:1–3) staan er onverzacht in; Hebreeën 9:7 en 9:11–12 zijn cross bij het deel én bij geschiedenis 32.
**Nieuwe plaatsen:** geen.

## Verfijning van de eerste koppeling (`ot-dekking.json`)

- 61 (1 Koningen 5–9): `1koningen:salomo:6` weggelaten. Die stap gaat over goud, schepen en paarden (9:26–28; 10:14–29) en
  hoort inhoudelijk bij 60 (1 Koningen 10), waar hij wel staat.
- Verder de voorgestelde koppeling aangehouden. Bewust gedeelde stappen: 38/39 (`jozua:intocht:3`: Gilgal, Jozua 4:19–5:12),
  44/45 (`richteren:simson:2`: 14:10–15:8), 51/53 (`1samuel:saul-david:0`: Jonathan bij Michmas, 1 Samuël 13–14),
  53/54 (`saul-david:5`), 54/55 (`saul-david:7`: die stap omvat 1 Samuël 23–24 én 26).
- 34 koppelt ook `numeri:woestijn:8, 9` (Numeri 21:10–35), omdat de leidraad Numeri 20–21 noemt; de uitleg richt zich op 20:1–21:9.

## Twijfelpunten en punten voor de hoofdagent / Martijn

1. **Personen (buiten deze groep):** `personen.js` kent geen Nadab, Abihu en Ithamar, en bij `aaron`, `mozes` en `eleazar`
   ontbreekt `leviticus` in `boek`. Daardoor koppelt de personencheck de namen in Leviticus niet. Voorstel voor wie `personen.js`
   samenvoegt: `nadab`, `abihu`, `ithamar` (v: `aaron`; Exodus 28:1; Numeri 3:2–4; dood van Nadab en Abihu: Leviticus 10:2) en
   `leviticus` toevoegen aan `boek` van Aäron, Mozes en Eleazar. Kleuren voor Nadab, Abihu en Ithamar staan al in `leviticus.js`.
2. **Deelgrootte:** het deel `verzoendag` heeft 5 stappen (opdracht: 3–5), terwijl het algemene schema 6–15 noemt.
3. **Leviticus 16 is een voorschrift:** de stappen 3 en 4 vertellen wat God gebiedt (‘God zegt hoe het moet’), niet een
   verslag van een bepaalde eerste Verzoendag; de Bijbel noemt die eerste keer niet. `tijdNoot` zegt dat ook.
4. **Vorm 47 (Ruth):** gekozen voor `stamboom` (Ruth 4:18–22, met ontdekking `stamboom`), hoewel de stappen ook een reis
   tonen. Als de app bij `stamboom` geen kaart toont, is `route` een alternatief.
5. **Dateringen 48–59** zijn ruwe schattingen binnen de bestaande delen (gemarkeerd ‘onzeker’/‘ruwe schatting’); de Bijbel geeft
   daar geen jaartallen. 2 Samuël 15:7 (‘ten einde nu van veertig jaren’) wordt in `tijdNoot` bij 59 als onzeker genoemd.
6. **SV-versnummering:** bij de psalmen telt het opschrift als vers 1 (Psalm 3:1–2, 51:3–4, 57:1, 142:1; Psalm 23:1 bevat
   opschrift én eerste zin). Jesaja 9:4 (SV) = 9:3 in sommige andere vertalingen; Psalm 83:10 (SV).
7. **Mogelijke tekstfout in de bijbel-JSON:** `bijbel/1korinthe.json` 10:9 leest ‘werden van de slagen vernield’; vermoedelijk
   moet dat ‘slangen’ zijn. Daarom niet als kruisverwijzing bij 34 gebruikt. Graag nakijken tegen een gedrukte SV.
8. **Kleine naamkeuzes:** Timna (HSV) waar de SV ‘Thimnath’ heeft; Kidron (SV 2 Samuël 15:23) en Kedron (Johannes 18:1) samen genoemd
   bij 59. In de wiezei van 52 staat ‘Eliab, de oudste broer van David’ als antwoord; Eliab staat niet in `BR.mensen`.

## Bibliotheek

Geen nieuwe CODE/PATROON-bouwsteen: alleen inhoud volgens het bestaande schema.
