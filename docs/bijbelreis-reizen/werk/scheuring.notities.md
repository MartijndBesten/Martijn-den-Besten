# Notities bij het deel `scheuring` (1 Koningen 11:26–14:31)

Boek: 1 Koningen (`public/bijbelreis/inhoud/1koningen.js`), tussen `salomo` en `elia`. Negen stappen (index 0–8).
Bijbeltekst gelezen in de Statenvertaling (`node scripts/sv.mjs`), ook 2 Kronieken 10–12, 2 Koningen 17:21–23 en 23:15–20,
1 Koningen 15:25–33 en 16:8, 23–24. Elke bewering, elk getal en elk citaat heeft een regel in
`scripts/bijbel-controle/scheuring.txt` (155 regels).

## Nieuwe plaatsen

| sleutel | naam | `c` | punt | score OpenBible | grond |
| --- | --- | --- | --- | ---: | --- |
| `sc_tirza` | Tirza (SV: Thirza) | v | 32.2874, 35.3378 | 834 | Tell el-Far’ah (Noord), punt op de tell; geen tweede identificatie in OpenBible. |
| `sc_zereda` | Zereda | b | 32.0464, 35.0972 | 441 | Deir Ghassaneh. `alt`: Ain Seridah (32.0460, 35.0578; score 203), 3,7 km westelijker. Verder alleen zwakke voorstellen (Khirbet Banat Barr 21, Surdah 21). |

Geen nieuwe tussenpunten in `BR.W`. Routes gebruiken bestaande sleutels en enkele losse coördinaten (kustweg bij het
Bardawilmeer, zoals in 2 Koningen; twee punten in het Eikdal tussen Lachis en Jeruzalem).

Hergebruikt: `salem`, `sichem`, `bethel`, `dan`, `silo`, `egypte`, `pniel` (Penuël, 1 Koningen 12:25; score 694, `c: w`),
`gaza`, `sam_afek` en `sukkoth` (alleen als punt in een route).

## Plaatsen uit de tekst die niet op de kaart staan

| plaats | vers | reden |
| --- | --- | --- |
| Millo | 11:27 | Bouwwerk in Jeruzalem (OpenBible: in de Stad van David); geen eigen punt op deze schaal. Komt niet in de vertelling voor. |
| Juda | 13:1 e.a. | Land, geen punt. De man Gods komt ‘uit Juda’; de tekst noemt geen stad. In stap 5 staat daarom geen route maar een stippellijn (`later`) met het label ‘uit Juda’. Het beginpunt (31.83, 35.225) is geen plaats; het geeft alleen de richting aan. |
| Gebergte van Efraïm | 12:25 | Streek; niet als vlek toegevoegd. |
| Steden van Samaria | 13:32 | Streek (de stad Samaria bestond nog niet, 16:24); niet geplaatst en niet genoemd in de vertelling. |
| De eik en de plek van de leeuw | 13:14, 24 | Onbekend; alleen ‘op de weg’ vanuit Bethel. Geen punt, geen route. |
| ‘De rivier’ | 14:15 | De Eufraat (uitleg in het weetje); geen punt. |
| De stad van Sisak | 11:40; 14:25 | De Bijbel noemt alleen ‘Egypte’. De routes eindigen en beginnen bij het gebied `egypte`. |

## Routes (alle `recon: 1`)

- Stap 1, Jerobeam naar Egypte: gelijk aan de bestaande route in `salomo` stap 7 (Hebron, Berseba, weg naar Sur). De tekst noemt het vertrekpunt niet; 11:29 zegt alleen dat hij eerder ‘uit Jeruzalem uitging’.
- Stap 2: Rehabeam Jeruzalem → Sichem over de bergrug (kobalt). Jerobeam Egypte → Sichem langs de kustweg (Gaza, Afek). De bestaande stap `salomo:8` tekent deze terugreis via Hebron en Jeruzalem. Ik koos de kustweg zodat de twee lijnen in deze stap niet over elkaar vallen; beide zijn een reconstructie. De integrator kan dit gelijktrekken.
- Stap 4: Sichem → Pniël via het dal en de doorwaadplaats, als de bestaande Jakob-route in omgekeerde richting (12:25: ‘toog van daar uit’).
- Stap 7: Tirza → Silo → Tirza via Sichem (koraal). De tekst noemt Tirza pas bij de terugkeer (14:17); dat zij daar ook vertrok, volgt uit ‘ga naar uw huis’ (14:12).
- Stap 8: Sisak (rood) langs de kustweg tot Gaza en dan via Lachis en het Eikdal naar Jeruzalem. Koningen noemt alleen ‘Egypte’ en ‘Jeruzalem’; 2 Kronieken 12:4 zegt dat hij eerst de vaste steden van Juda innam (11:5–10 noemt o.a. Lachis, Azeka en Socho).
- ‘Alles wat Jerobeam reisde’ telt de routes in de kleur van het deel (teal): stap 1, stap 2 (tweede route) en stap 4.

## Personen

- Nieuw in `personen.js`: `sisak`, `semaja`, `adoram`, `abia_jerobeam` (vader `jerobeam_1`, grondslag 1 Koningen 14:1). Controleregels staan onder de markering in `personen.txt` (19 regels).
- Bestaand en ongewijzigd gebruikt: `jerobeam_1`, `rehabeam`, `ahia`, `salomo` (allen al met boek `1koningen`).
- Nieuwe naam voor de personencontrole: **`Man Gods`** (bij mijn markering in `GROEPEN`). Het is een rol voor één persoon zonder naam, zoals ‘Koningin’ of ‘Weduwe’. In `app.js` hoort hij **niet** in `GROUPS`: de chip toont dan ‘Man Gods · uit Juda’. Komt hij wel in `GROUPS`, dan toont de chip alleen ‘uit Juda’; verander `who` in dat geval in `["Man Gods", "man Gods uit Juda"]`.
- De oude profeet uit Bethel en zijn zonen hebben geen naam: zij staan in `who` als de bestaande groepen `Profeten` en `Zonen` met een omschrijving. De vrouw van Jerobeam staat als de bestaande rol `Vrouw`.
- `Abia`: als een ander deel (bijvoorbeeld `asa`) koning Abia van Juda toevoegt, worden het naamgenoten. De personencontrole vraagt dan een regel in `VERWACHT` (`"1koningen|Abia": "abia_jerobeam"`), en de kleur `Abia` in `BR.personen` wordt gedeeld.
- Niet opgenomen als persoon: Nebat en Zerua (ouders van Jerobeam, 11:26), Naäma de Ammonitische (moeder van Rehabeam, 14:21, 31), Nadab en Abiam (opvolgers). Naäma en Nebat zouden een `m`/`v` bij bestaande personen vragen; die regels mocht ik niet wijzigen. Nadab staat niet in `who`, omdat `nadab` al de zoon van Aäron is.
- Kleuren: `Rehabeam` en `Jerobeam` zijn in `plaatsen.js` beide grijs. Ik heb dat niet overschreven (het zou ook `salomo` veranderen). In dit deel is de route van Jerobeam teal en die van Rehabeam kobalt; voorstel: geef de chips dezelfde kleuren.

## Twijfelpunten

1. **Wiens kleed?** 11:29–30 zegt ‘hij’ en ‘dat aan hem was’. De vertelling houdt dat open (‘het nieuwe kleed dat hij aanheeft’). De bestaande tekst in `salomo` en de wie-lijst zeggen ‘zijn nieuwe mantel’ (van Ahia); ik gebruik het woord ‘kleed’ van de Statenvertaling.
2. **Het twaalfde stuk** (weetje stap 0, `fs: u`): tien stukken en één stam is elf. Benjamin (12:21) als uitleg, met ‘de meeste uitleggers’.
3. **Schatting** (12:18): de Statenvertaling heeft ‘schatting’, de HSV ‘herendienst’. In de tekst staat ‘schatting’ met tussen haakjes ‘het verplichte werk voor de koning’.
4. **Priesters** (12:31): Statenvertaling ‘van de geringsten des volks’, HSV anders. Alleen ‘niet uit de stam Levi’ overgenomen.
5. **Het feest** (weetje stap 4): dat ‘het feest, dat in Juda was’ het Loofhuttenfeest is, volgt uit de vijftiende dag (Leviticus 23:34); de tekst noemt de naam niet.
6. **Sisak = Sjosjenq I** en de lijst in Karnak (weetje stap 1, `fs: h`): gangbare gelijkstelling, niet uit de Bijbel. Dat Jeruzalem in het bewaarde deel van de lijst ontbreekt, staat erbij.
7. **Datering**: `tl: [-931, -910]` volgens Thiele. De stappen 0 en 1 spelen eerder, in de laatste jaren van Salomo (jaar onbekend); dat staat in `tijdNoot`. Het deel `salomo` loopt tot -930.
8. **Zereda `b`**: de beste score is 441, dus geen `w`; de twee voorstellen liggen 3,7 km uit elkaar. Wie dat te zwak vindt voor twee ‘serieuze’ kandidaten, kiest `o`.
9. **Tirza**: naam volgens de HSV; de Statenvertaling schrijft Thirza (staat in de beschrijving). Andere nieuwe delen (Baësa, Omri) kunnen dezelfde plaats onder een eigen sleutel toevoegen: samenvoegen bij de integratie.
10. **Lengte**: de stappen 2, 5, 6 en 7 hebben acht of negen zinnen in plaats van zeven; korter lukte niet zonder de lijn van de tekst te breken.
11. **Overlap met `salomo`**: de stappen 7 en 8 van `salomo` vertellen 1 Koningen 11–12 kort. Die zijn niet gewijzigd. De speurtocht van dit deel stelt andere vragen (niet opnieuw ‘in hoeveel stukken’ en ‘waar stonden de kalveren’).

## Bewust weggelaten uit de vertelling

- 11:27 (Millo en de breuk in de stad van David) en 11:28 ‘dapper held’.
- 12:17 (de Israëlieten in de steden van Juda), 12:30b (‘tot Dan toe’), 12:31 (het huis der hoogten).
- 13:2 ‘men zal mensenbeenderen op u verbranden’: niet in de vertelling, wel sober in het weetje (2 Koningen 23:16).
- 14:10–11 en 14:14–16: de bewoordingen van het oordeel over het huis van Jerobeam (honden, vogels) en de nieuwe koning. In de vertelling alleen ‘God brengt onheil over zijn huis’; de wegvoering staat in het weetje, Baësa bij de kruisverwijzingen.
- 14:24 (de schandjongens): niet genoemd; wel dat Juda deed wat kwaad was, met hoogten en beelden.
- De naam van de moeder van Rehabeam, Naäma de Ammonitische (14:21, 31).
