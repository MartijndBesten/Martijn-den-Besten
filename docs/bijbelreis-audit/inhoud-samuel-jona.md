# Inhoudscontrole Bijbelreis 2.0 — groep `samuel-jona`

Boeken: 1 Samuël, 2 Samuël, 1 Koningen, 2 Koningen, Daniël, Esther, Ezra en Nehemia (`ezra.js`), Jona.
Maatstaf: Statenvertaling in `public/bijbelreis/bijbel/` (SV-versnummering). Datum: 25 oktober 2026.

## Werkwijze

- Elke stap (`ref`, `t`, `txt`, `who`, `fact`, routes, `onthul`/`vergelijk`/`later`), elke kruisverwijzing en elke speurtochtvraag
  gelezen en vergeleken met de SV-tekst. Twijfelpunten opgezocht in de SV en vastgelegd met een controleregel.
- `txt` alleen wat de Bijbel vertelt; uitleg, omrekening, archeologie en reconstructie naar `fact` met `fs` (`b`/`u`/`h`).
- Iedere `fact` heeft nu een `fs`. Ieder deel heeft `tijd`, `tl` en `tijdNoot`.
- Regel voor `recon`: `recon: 1` als de Bijbel voor die reis alleen begin en eind noemt; geen `recon` als de Bijbel de
  tussenstations noemt (de wegpunten uit `BR.W` tellen daarbij niet als station). Enkele routes met namen die niet te
  lokaliseren zijn (Joabs volkstelling) houden `recon`.
- Chronologie: gangbare conservatieve reconstructie (Thiele e.a.): Salomo ca. 970–930 (vierde jaar ca. 966, 1 Kon 6:1),
  scheuring 931/930, Samaria 722, Sanherib 701, Josia † 609, wegvoeringen 605/597/586, Kores 539/538. In elke `tijdNoot`
  staat dat het een reconstructie is en waarop die rust.
- Getallen in `stat` die tellingen zijn (aantal verzen/woorden) opnieuw geteld in de SV en waar nodig gecorrigeerd of
  gemarkeerd als ‘(Statenvertaling)’.

## Correcties per boek

### Jona (`jona.js`)

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Boek `tijd` | ca. 780 v.Chr. | 8e eeuw v.Chr. (ca. 790–750) | 2 Kon 14:23–25 noemt alleen de tijd van Jerobeam II |
| Deel jona | geen `tijd`/`tl`/`tijdNoot` | ca. 790–750, `tl` [-793, -753], noot (Thiele; Jerobeam 41 jaar) | 2 Kon 14:23 |
| Wie: Jona | ‘hij had gehoopt dat God Ninevé zou straffen’ | boos omdat God de stad spaart; daarom was hij gevlucht | Jona 4:1–2 |
| Wie: Nebukadnezar | Ninevé ‘werd verwoest (Nahum 3:7)’ | Nahum profeteerde de verwoesting; die gebeurde in 612 v.Chr. | Nahum 3:7 is profetie |
| Deel-intro | aanhalingstekens rond ‘de hoofdstad van de vijand’ | indirecte rede: ga naar Ninevé, de grote stad in Assyrië | Jona 1:2 |
| `stat` | ‘groot’ 16 keer | ‘in de Statenvertaling 16 keer’ (nageteld; klopt) | SV Jona 1–4 |
| `cross` | Nahum 1:1 + ‘die keer … wordt verwoest’ | Nahum 3:7 met SV-citaat | Nahum 3:7 |
| Stap 0 `txt` | ‘Ninevé is de hoofdstad van Assyrië’; ‘reis van vele weken’ | ‘ligt ver weg in Assyrië’; reisduur uit `txt` | Jona 1:2; Ninevé werd pas ca. 700 v.Chr. hoofdstad |
| Stap 0 `fact` | — | + Zebulon (Joz 19:13), noot over hoofdstad; `fs: "b"` | 2 Kon 14:25; Joz 19:13 |
| Stap 1 | uitleg oost/west in `txt`; ‘Tarsis lag waarschijnlijk in Spanje’ | uitleg naar `fact`; Tarsis onzeker (Tartessus, Sardinië, Tarsus); `fs: "h"` | Jona 1:3 |
| Stap 2 `fact` | ‘Het schip was pas net onderweg’ | afgeleid uit 1:13 (‘waarschijnlijk’); `fs: "u"` | Jona 1:13 |
| Stap 3 `fact` | ‘in het graf’ | ‘in het hart der aarde’; `fs: "b"` | Matth. 12:40 |
| Stap 4 `vergelijk` | 90 km als feit | ‘Schatting’; betekenis ‘drie dagreizen’ onzeker | Jona 3:3 |
| Stap 4 `fact` | ‘ruim 1000 km’ | ‘ongeveer 1000 km’; `fs: "h"` | reconstructie |
| Stap 5, 6 | geen `fs` | `fs: "b"` / `"u"` | Jona 3:7–8 |

### 1 Samuël (`1samuel.js`)

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Wie: Samuël | ‘De laatste richter’ | ‘de laatste grote richter vóór de koningen’ | Hand 13:20; ook zijn zonen waren richters (1 Sam 8:1) |
| Deel samuel | geen chronologie | ca. 1100–1050, noot (terugrekenen vanaf David; Saul 40 jaar volgens Hand 13:21; 1 Sam 13:1 geeft geen bruikbaar getal) | 2 Sam 5:4; Hand 13:21 |
| Deel saul-david | geen chronologie | ca. 1050–1010, noot | idem |
| `cross` Jeremia 7:12 | ‘Van Silo was niets meer over’ | weggelaten; SV-citaat | Jer 7:12 zegt dat niet |
| Stap 0 route | geen `recon` | `recon: 1` (Bijbel noemt alleen Rama en Silo) | 1 Sam 1:3, 19 |
| Stap 2 `txt` | ‘Maar de ark is geen toverdoos’ (commentaar) | ‘zodat die hen zou verlossen’ (4:3); uitleg naar `fact` | 1 Sam 4:3 |
| Stap 2 `fact` | ‘bijna blind’ | ‘zijn ogen stonden stijf; hij kon niet meer zien’ | 1 Sam 4:15 |
| Stap 3 route ark | `recon: 1` | geen `recon` (Asdod, Gath, Ekron genoemd) | 1 Sam 5:1–10 |
| Stap 3 `txt` | ‘zeventig van hen sterven’ | ‘de HEERE slaat velen van hen’; het SV-getal in `fact` | 1 Sam 6:19: ‘zeventig mannen, en vijftig duizend mannen’ (zie open punten) |
| Stap 3 `fact` | ‘één voor elke Filistijnse stad’ | ‘naar het getal van de vijf Filistijnse vorsten’ | 1 Sam 6:4, 17–18 |
| Stap 4 route | `recon: 1` | geen `recon` (Bethel, Gilgal, Mizpa, Rama genoemd) | 1 Sam 7:16–17 |
| Stap 6 `fact` | ‘Rama lag in het land Zuf’ (als feit) | ‘Veel uitleggers denken aan Rama …’; `fs: "u"` | 1 Sam 1:1; 9:5 |
| Stap 8 route | `recon: 1` | geen `recon` (Bezek, Jabes genoemd) | 1 Sam 11:8–11 |
| Stap 8 `txt` | ‘’s Nachts steken ze de Jordaan over’ | ‘De volgende dag … in drie groepen, in de morgenwake’ | 1 Sam 11:11 |
| Stap 8 `fact` | ‘Veertig jaar later’ | ‘Jaren later’ | niet te berekenen |
| Stap 11 route Michmas–Ajalon | geen `recon` | `recon: 1` | 1 Sam 14:31 |
| Stap 11 `fact` | Bozes en Sene ‘kun je nu nog zien’ | ‘Veel onderzoekers zoeken die in … Wadi Suweinit’; `fs: "h"` | 1 Sam 14:4–5 |
| Stap 12 `txt` | ‘ziet Saul daarna nooit meer’ | ‘ziet hij Saul niet meer tot de dag van zijn dood’ | 1 Sam 15:35 |
| Stap 13 `txt` | ‘een jongen met rood haar’ | ‘hij is roodachtig, met mooie ogen’ | 1 Sam 16:12 |
| Stap 13 `fact` | Bethlehem ‘10 km’ ten zuiden van Rama | ‘ongeveer 15 km’ | afstand tussen de kaartpunten (15,3 km) |
| Stap 13, 14 routes | geen `recon` | `recon: 1` (alleen begin en eind) | 1 Sam 16:4, 20 |
| Stap 14 `txt` | ‘een boze geest maakt hem bang en somber’ | ‘een boze geest van de HEERE maakt hem bang’ (niet afzwakken) | 1 Sam 16:14 |
| Stap 14 `fact` | ‘Op muntjes en tekeningen uit Israël’ | kinnor = waarschijnlijk lier; afbeelding o.a. ivoor uit Megiddo; `fs: "h"` | — |
| Stap 15 `txt` | ‘bijna drie meter … harnas van ruim vijftig kilo’ | ‘zes el en een span … vijfduizend sikkels koper’ (omrekening alleen in `vergelijk`/`fact`) | 1 Sam 17:4–5 |
| Stap 15 `txt` | ‘brood en kaas voor zijn broers’ | koren en brood voor de broers, kaas voor de bevelhebber | 1 Sam 17:17–18 |
| Stap 15 `txt` | ‘Sauls harnas past hem niet’ | ‘kan David niet lopen; hij is het niet gewend’ | 1 Sam 17:39 |
| Stap 15 `txt` | ‘De eerste steen’ | ‘De steen’ | 1 Sam 17:49 |
| Stap 15 `vergelijk`/`fact` | omrekening als feit | ‘schatting’; sikkel ca. 11,4 g; `fs: "u"` | — |
| Stap 15 route Eikdal–Ekron | geen `recon` | `recon: 1` | 1 Sam 17:52 |
| Stap 17 route vlucht | `recon: 1` | geen `recon` (Nob, Gath, Adullam genoemd) | 1 Sam 21–22 |
| Stap 17 `fact` | Psalm 57/142 ‘over de grot’ | ‘over David in een spelonk (welke grot, staat er niet bij)’ | Ps 57:1; 142:1 |
| Stap 18 `txt` | ‘Het is de laatste keer dat ze elkaar zien’ | ‘Daarna lezen we niet meer dat ze elkaar zagen’ | 1 Sam 23:18 |
| Stap 19 `txt` | ‘Ze knielt: Laat de koning …’ | ‘Ze valt aan zijn voeten: Laat mijn heer …’ | 1 Sam 25:24–31 |
| Stap 20 route Maon–Ziklag | `recon: 1` | geen `recon` (Gath, Ziklag genoemd) | 1 Sam 27:2–6 |
| Stap 21 `txt` | ‘raakt zwaargewond door de boogschutters’ | ‘De boogschutters treffen Saul; hij is erg bang’ | 1 Sam 31:3 (SV) |
| Stap 21 `txt` | ‘begraven ze onder een boom’ | ‘verbranden ze in Jabes en begraven de beenderen onder een boom’ (niets weglaten) | 1 Sam 31:12–13 |
| Stap 21 `fact` | ‘ongeveer veertig jaar nadat hij koning was geworden’ | ‘Paulus zegt dat Saul veertig jaar koning was’ | Hand 13:21 |
| Alle stappen met `fact` | geen `fs` | `fs` toegevoegd | — |

### 2 Samuël (`2samuel.js`)

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Wie: Joab | ‘Zoon van Davids zus Zeruja’ zonder bron; ‘won bijna alle oorlogen’ | + (1 Kron 2:16); ‘leidde veel van Davids oorlogen, zoals tegen Ammon’ | 1 Kron 2:16; 2 Sam 10–12 |
| Wie: Nathan | ‘Hij gaf Salomo de naam Jedid-Jah’ | ‘Via hem gaf de HEERE …’ | 2 Sam 12:24–25 (onderwerp is de HEERE) |
| Wie: Absalom | ‘stierf toen hij … bleef hangen’ | bleef hangen en werd door Joab en zijn mannen gedood | 2 Sam 18:14–15 |
| Deel david | geen chronologie | ca. 1010–970, noot | 2 Sam 5:4–5; 1 Kon 6:1 |
| Stap 0 `fact` | — | + ‘vergelijk 4:10’; `fs: "u"` | 2 Sam 4:10 |
| Stap 1 `txt` | ‘hij wil zo geen koning worden’ (motief ingevuld) | ‘zij hebben een rechtvaardige man in zijn eigen bed vermoord’ | 2 Sam 4:11 |
| Stap 3 route | geen `recon` | `recon: 1` | — |
| Stap 3 `txt` | geografie in `txt`; ‘neemt Sion in, via de watergang’ | geografie naar `fact`; Davids woorden over de watergoot (5:8), dan ‘neemt de burcht Sion in’ | 2 Sam 5:7–8 |
| Stap 3 `fact` | tunnel ‘misschien de watergang’ | ‘watergoot’ (SV), ‘niet zeker’; `fs: "h"` | 2 Sam 5:8 |
| Stap 7 `txt` | ‘In het voorjaar’ | ‘Op de tijd dat de koningen ten strijde trekken’ | 2 Sam 11:1 |
| Stap 8 route Hebron–Jeruzalem | geen `recon` | `recon: 1` | 2 Sam 15:10, 37 |
| Stap 8 `fact` | haar ‘ruim twee kilo’ als feit | ‘naar schatting’ | 2 Sam 14:26 |
| Stap 9 `txt` | alleen ‘Joab steekt drie pijlen in zijn hart’ | + ‘en Joabs wapendragers doden hem’ | 2 Sam 18:14–15 |
| Stap 9 `fact` | ‘want hij had geen zoon meer’ | citaat ‘Ik heb geen zoon’, vergelijk 14:27 | 2 Sam 18:18; 14:27 |
| Stap 10 `txt` | begint bij de telling | + ‘De toorn van de HEERE ontbrandt opnieuw tegen Israël, en Hij zet David tegen hen aan’ (niet weglaten) | 2 Sam 24:1 |
| Stap 10 route | via `samaria` | via `sichem` (Samaria bestond in Davids tijd nog niet, 1 Kon 16:24) | — |
| Stap 10 `fact` | ‘dezelfde berg Moria waar Abraham …’ (als feit) | 2 Kron 3:1 ‘berg Moria’; Gen 22:2 ‘land Moria’; ‘veel uitleggers denken …’; + 1 Kron 21:1 | 2 Kron 3:1; Gen 22:2; 1 Kron 21:1 |
| Alle stappen met `fact` | geen `fs` | `fs` toegevoegd | — |

### 1 Koningen (`1koningen.js`)

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Wie: Rehabeam | ‘Alleen Juda bleef over’ | ‘Alleen Juda, met Benjamin’ | 1 Kon 12:20–21 |
| Deel salomo | geen chronologie | ca. 970–930, noot (vierde jaar ca. 966; 480 jaar) | 1 Kon 6:1; 11:42 |
| Deel elia | geen chronologie | ca. 874–850, noot (Achab in het 38e jaar van Asa, 22 jaar) | 1 Kon 16:29 |
| `stat` Salomo / Elia | getallen zonder bron | nageteld (133/6 en 60 verzen), ‘(Statenvertaling)’ | SV |
| `cross` 2 Kron 3:1 | ‘waar Abraham ooit Izak moest offeren’ | Moria in 2 Kron 3:1; ‘land Moria’ in Gen 22:2 | Gen 22:2 |
| Stap 4 `vergelijk` | ‘een el is ongeveer een halve meter’ | + ‘schatting: 45 tot 52 cm’ | — |
| Stap 5 `fact` | ‘Scheba lag waarschijnlijk in Jemen, zo’n 2000 km’ | ‘veel onderzoekers denken aan Saba … ruim 2000 km … zeker is dat niet’; `fs: "h"` | — |
| Stap 6 `txt` | ‘ligt het zilver als stenen op straat’ | ‘is het zilver zo gewoon als stenen’ | 1 Kon 10:27 |
| Stap 6 `fact` | talent ‘ongeveer 30 kilo’ als feit | ‘naar schatting’ | — |
| Stap 8 routes Rehabeam | geen `recon` | `recon: 1` | 1 Kon 12:1, 18 |
| Stap 8 `fact` | ‘de offerplaats van Jerobeam opgegraven’ | Tel Dan: begin volgens de opgravers in Jerobeams tijd, grotendeels later verbouwd; `fs: "h"` | — |
| Stap 9 `ref` | 1 Kon 16:29–33 | 1 Kon 16:23–33; 18:3–4 (Omri en Obadja staan in de `txt`) | 1 Kon 16:24; 18:3–4 |
| Stap 9 `txt` | — | + synchronisme: in het 38e jaar van Asa; 22 jaar in Samaria | 1 Kon 16:29 |
| Stap 9 `fact` | ivoren als Achabs paleis | + ‘Of die stukjes uit de tijd van Achab zelf zijn, is niet zeker’ | — |
| Stap 13 route | geen `recon` | `recon: 1` | 1 Kon 18:45–46 |
| Stap 13 `fact` | ‘zo’n 30 km … sneller dan de paarden van de koning’ | ‘ongeveer 25 tot 30 km … voor de wagen van de koning uit’ | 1 Kon 18:46 (‘liep voor het aangezicht van Achab’) |
| Stap 15 `txt` | ‘Ik heb mijn best gedaan’ | ‘Ik heb zeer geijverd voor de HEERE’ | 1 Kon 19:10 |
| Stap 16 `txt` | ‘op het land bij Abel-Mehola’ | ‘uit Abel-Mehola’ (waar hij ploegde staat er niet) | 1 Kon 19:16, 19 |
| Stap 16 `fact` | ‘kwam uit een rijke boerenfamilie’ | ‘waarschijnlijk’ | afleiding |
| Stap 17 `fact` | — | + 1 Kon 21:23 als bron voor Izebel | 1 Kon 21:23 |
| Alle stappen met `fact` | geen `fs` | `fs` toegevoegd | — |

Gecontroleerd en correct: SV-nummering 1 Kon 4–5 (4:32, 4:34, 5:1–18 in SV-nummering), alle getallen in Salomo-stappen.

### 2 Koningen (`2koningen.js`)

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Boek `tijd` | ca. 850–586 | ca. 850–560 (het boek eindigt met Jojachin, ca. 561) | 2 Kon 25:27 |
| Wie: Sanherib | ‘belegerde Lachis’; ‘Thuis … gedood’ | ‘lag met zijn leger bij Lachis’; ‘Later … gedood’ | 2 Kon 18:14, 19:8, 19:37 |
| Wie: Nebukadnezar | ‘belegerde Jeruzalem twee keer’ | ‘kwam meer dan eens tegen Jeruzalem’; 8e en 19e jaar | Dan 1:1; 2 Kon 24:12; 25:8 |
| Deel elisa | geen chronologie | ca. 850–795, noot (sterft onder Joas, 13:10, 14) | 2 Kon 13:10 |
| Deel ballingschap | geen chronologie | ca. 725–560, noot (722, 701, 609, 597, 586/587, 561; probleem Hizkia-synchronismen) | 2 Kon 17:6; 18:1, 9–10, 13; 25:27 |
| `stat` Elisa | — | ‘(Statenvertaling)’, nageteld 49; Assyrië 41 / Babel 28 nageteld, klopt | SV |
| `cross` Hebr 11:35 | citaat niet volgens SV; ‘dat gebeurde bij …’ | SV-citaat; ‘Denk aan …’ | Hebr 11:35 |
| `cross` 2 Kron 32:30 | ‘dat is de tunnel’ | ‘Volgens de meeste onderzoekers …’ | — |
| Stap 3 routes | geen `recon` | `recon: 1` | 2 Kon 4:25 |
| Stap 5 `fact` | ‘er woonden er profetenzonen’ | taal hersteld; `fs: "u"` | 2 Kon 2:5 |
| Stap 9 `txt` | — | + synchronisme: Hosea koning in het 12e jaar van Achaz | 2 Kon 17:1 |
| Stap 9 `fact` | ‘ongeveer in 722’ | ‘volgens de meeste onderzoekers in 722’; Sargon II | — |
| Stap 10 `txt` | Gihon en ‘Zo kan Jeruzalem een belegering doorstaan’ in `txt` | naar `fact`/noot; + synchronisme ‘derde jaar van Hosea’ | 2 Kon 18:1; 20:20 |
| Stap 10 `vergelijk`/`fact` | tunnel = Hizkia als feit | ‘volgens de meeste onderzoekers’; inscriptie noemt Hizkia niet | 2 Kron 32:30 |
| Stap 12 `txt` | ‘Daar wordt hij … gedood’ | ‘Later wordt hij daar …’ (ca. 20 jaar later) | 2 Kon 19:37 |
| Stap 13 `ref` | 2 Kon 22:1–23:3, 21–27 | + 21:1, 16 (Manasse staat in de `txt`) | 2 Kon 21:1, 16 |
| Stap 13 `fact` | ‘als jongen van zestien’ | SV-citaat ‘toen hij nog een jongeling was’; ‘dus ongeveer zestien’ | 2 Kron 34:3 |
| Stap 14 `ref` | 2 Kon 23:29–30 | + 2 Kron 35:20–25 (boden, vermomming, schutters, klaaglied staan alleen daar) | 2 Kron 35:21–25 |
| Stap 14 `txt` | ‘langs de kust’ | weggelaten | niet in de tekst |
| Stap 14 `fact` | — | SV ‘tegen den koning van Assyrië’ tegenover de historische bronnen | 2 Kon 23:29 |
| Stap 15 `fact` | ‘Met Jojachin ging ook Ezechiël mee’ | ‘zat bij de weggevoerden van Jojachin’ | Ezech 1:2–3 |
| Stap 16 `fact` | ‘ongeveer in 586’ | ‘in 586 (sommigen rekenen 587)’ | — |
| Stap 17 `txt` | slotcommentaar ‘de zoon van David leeft nog’ in `txt` | naar `fact` | — |
| Stap 17 `fact` | ‘olie en graan … Dat is Jojachin!’ | ‘olie’ (de rantsoenlijsten noemen olie) | — |
| Alle stappen met `fact` | geen `fs` | `fs` toegevoegd | — |

### Daniël (`daniel.js`)

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Wie: Darius | geen leeftijd; geen voorbehoud | 62 jaar (5:31), ‘zoon van Ahasveros, uit de Meden’ (9:1); historische identificatie onzeker | Dan 5:31; 9:1 |
| Deel daniel | geen chronologie | ca. 605–539, noot (derde jaar Jojakim = 605 via Babylonische telling, vgl. Jer 25:1; val van Babel 539) | Dan 1:1; Jer 25:1 |
| `stat` | ‘koninkrijk’ 53 keer | ‘(ook ‘koninkrijken’) … (Statenvertaling)’ — 53 klopt alleen mét afgeleide vormen | SV |
| `cross` Hebr 11:33–34, Lukas 1:33 | citaten niet volgens SV; ‘Dat is het Koninkrijk uit de droom’ | SV-citaten; ‘Vergelijk …’ | Hebr 11:33–34; Luk 1:33 |
| Stap 0 `txt` | — | + ‘In het derde jaar van koning Jojakim’ | Dan 1:1 |
| Stap 0 `fact` | ‘ongeveer 605’ | ‘volgens de gangbare reconstructie 605’; ‘bijna twintig jaar later’ | — |
| Stap 1 `fact` | ‘ruim 1200 km’ | ‘ongeveer 1400 tot 1600 km’ (route op de kaart: ca. 1550 km) | — |
| Stap 2 `fact` | ‘ongeveer zeventig jaar later’ | ‘ruim zestig jaar later’ (605 → 539) | Dan 1:21 |
| Stap 3 `fact` | (2:28) | (2:27–28) | Dan 2:27 |
| Stap 6 `who` | Daniël ‘oude man’ | zonder leeftijd (niet in de tekst) | — |
| Stap 6 `fact` | ‘regeerde namens zijn vader’ | volgens de teksten oudste zoon van Nabonidus, bestuurde Babel tijdens diens afwezigheid | — |
| Stap 7 `ref` | Daniël 6 | Daniël 5:31–6:28 (SV: Darius ontvangt het rijk in 5:31) | SV-nummering |
| Stap 7 `who`/`txt` | Daniël ‘oude man’; geen leeftijd Darius | Darius ‘62’; ‘ontvangt het koninkrijk; hij is 62 jaar’ | Dan 5:31 |
| Alle stappen met `fact` | geen `fs` | `fs` toegevoegd | — |

Gecontroleerd en correct: SV-nummering Daniël 3 (30 verzen), 4 (37 verzen; 4:1–3 = proclamatie), 5:31, 6:1–28 in alle
verwijzingen en speurtochtvragen (4:33, 6:10, 6:22).

### Esther (`esther.js`)

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Boek `tijd` | ca. 480 v.Chr. | ca. 483–473 v.Chr. | Esther 1:3; 3:7 |
| Wie: Ahasveros | geen voorbehoud | ‘Veel onderzoekers denken … Xerxes I (486–465); helemaal zeker is dat niet’ | — |
| Deel esther | geen chronologie | ca. 483–473, noot (3e, 7e, 12e jaar) | Esther 1:3; 2:16; 3:7 |
| `stat` | ‘koning’ ruim 200 keer | ‘bijna 200 keer (… met ‘des konings’ erbij)’ — nageteld: koning 108, konings 86, koningen 1 | SV |
| `cross` Spr 16:33, 21:1 | citaten in modern Nederlands met aanhalingstekens | SV-citaten | SV |
| `cross` 1 Sam 15:8 | Agagiet = Agag als feit | ‘Veel uitleggers denken …’ | — |
| Stap 1, 2 `txt` | — | + ‘in het zevende jaar’, ‘in het twaalfde jaar’ | Esther 2:16; 3:7 |
| Stap 2 `fact` | ‘Mordechai kwam uit de familie van Kis, net als koning Saul’ | ‘een nakomeling van Kis … de vader van Saul heette ook Kis … Of het dezelfde Kis is, staat er niet’ | Esther 2:5; 1 Sam 9:1 |
| Stap 3 `fact` | ‘om God te laten zien hoe ernstig …’ | vasten = niet eten en drinken (4:16); elders hoort vasten bij smeken tot God (Ezra 8:23) | Esther 4:16; Ezra 8:23 |
| Stap 4 `fact` | 50 el = 22 m als feit | schatting gemarkeerd | — |
| Stap 7 `txt` | ‘cadeautjes voor elkaar’ | ‘porties eten voor elkaar’ (‘zending van delen’) | Esther 9:22 |
| Alle stappen met `fact` | geen `fs` | `fs` toegevoegd | — |

### Ezra en Nehemia (`ezra.js`)

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Wie: Arthahsasta | geen voorbehoud | meestal Artaxerxes I (465–424); sommigen dateren Ezra onder een latere Artaxerxes | — |
| Deel terugkeer | geen chronologie | ca. 538–515, noot (Kores 539/538; 6e jaar Darius I = 515) | Ezra 1:1; 6:15 |
| Deel nehemia | geen chronologie | ca. 458–430, noot (7e, 20e, 32e jaar van Arthahsasta = 458, 445, 433; alternatief 398 voor Ezra) | Ezra 7:7–8; Neh 2:1; 13:6 |
| `stat` terugkeer | ‘ruim zeventig verzen lang’ | ‘één lange lijst van 70 verzen’ | Ezra 2 heeft 70 verzen |
| `stat` nehemia | ‘poort’ 51 keer | ‘poort’ en ‘poorten’ (ook in namen) 41 keer — 51 telde ook ‘poortiers’ mee | SV |
| `cross` 2 Kron 36:22–23 | ‘precies dezelfde woorden’ | ‘bijna dezelfde woorden’ | 2 Kron 36:23; Ezra 1:3 |
| `cross` Ps 126, 137, 122, Spr 21:1 | citaten niet volgens SV | SV-citaten; Ps 126 ‘veel uitleggers lezen dit lied bij deze terugkeer’ | SV |
| `cross` Johannes 5:2 | ‘de Schaapspoort, die de priesters in Nehemia 3:1 bouwden’ | ‘Bij de Schaapspoort (vergelijk Nehemia 3:1)’ | — |
| `cross` Matth. 23:2 | ‘Ezra was de eerste schriftgeleerde van wie de Bijbel vertelt’ | ‘Ezra heet een vaardig schriftgeleerde (Ezra 7:6)’ | Jer 8:8 noemt al eerder schriftgeleerden |
| Stap 1 | ‘waarschijnlijk langs de Eufraat’ in `txt`; ‘stoet kilometers lang’ | route-uitleg naar `fact`; speculatie weg | Ezra 2 |
| Stap 4 `txt` | brief ‘Jeruzalem is een opstandige stad’ als oorzaak van de stilstand onder Kores | tegenwerking ‘de hele tijd van Kores tot Darius’; brieven ‘later, onder Ahasveros en Arthahsasta’ | Ezra 4:4–7, 24 |
| Stap 4 `fact` | ‘De brief kwam uit Samaria (4:17)’ | brief aan Arthahsasta (4:10, 17), later dan de tempelbouw | Ezra 4:7–23 |
| Stap 4 en Nehemia 3–4 route | geen `recon` | `recon: 1` | — |
| Stap 5 `fact` | ‘Daarom lag het bevel van Kores juist dáár’ | ‘Waarom … zegt de Bijbel niet’ | — |
| Stap 6 `fact` | ‘ongeveer twintig jaar’ | ‘ruim twintig jaar’ (538 → 515) | — |
| Nehemia stap 0, 1, 2 `txt` | — | + ‘zevende jaar’, ‘twintigste jaar’ | Ezra 7:7; Neh 1:1; 2:1 |
| Nehemia stap 1 `fact` | schenker ‘proefde hem eerst’ als feit | ‘Waarschijnlijk’ | — |
| Nehemia stap 3 `fact` | poorten aan de zuidkant als feit | ‘waarschijnlijk … precies weten we het niet’ | — |
| Nehemia stap 6 `fact` | (8:17) | (8:18) — SV-nummering | Neh 8:18 SV |
| Alle stappen met `fact` | geen `fs` | `fs` toegevoegd | — |

## Onzekere punten voor Martijn

1. **1 Samuël 6:19** — de SV leest ‘zeventig mannen, en vijftig duizend mannen’. Gekozen: in `txt` ‘de HEERE slaat velen
   van hen’ en het letterlijke SV-getal in `fact` met ‘uitleggers lezen dat getal verschillend’. Graag beslissen of het
   getal in de vertelling moet.
2. **2 Samuël 24:1** — toegevoegd dat de HEERE David ‘tegen hen aanzette’ (SV ‘porde’), met 1 Kronieken 21:1 (satan) in
   `fact`, zonder uitleg. Het is Bijbeltekst, maar theologisch gevoelig; graag bevestigen of dit zo mag blijven.
3. **Darius de Meder** (Daniël 5:31; 6) — historische identificatie onbekend; zo geformuleerd in ‘Wie is wie’ en
   `tijdNoot`.
4. **Ahasveros = Xerxes I** (Esther) en **Arthahsasta = Artaxerxes I** (Ezra/Nehemia) — als gangbaar, niet zeker
   geformuleerd. Bij Ezra bestaat ook de datering 398 v.Chr.
5. **Hizkia-chronologie** — 2 Koningen 18:1, 18:9–10 en 18:13 zijn niet eenvoudig te rijmen; de `tijdNoot` noemt dat.
   De `who`-leeftijd (25) en regeringsduur (29) staan letterlijk in 18:2.
6. **2 Koningen 23:29** — SV ‘tegen den koning van Assyrië’; historisch ging Necho Assyrië juist helpen. In de `txt`
   staat neutraal ‘naar de koning van Assyrië’, het verschil in `fact`.
7. **Moria** — dat de tempelberg dezelfde plek is als de berg van Genesis 22 is gangbare uitleg; overal als
   ‘veel uitleggers denken’ geformuleerd (2 Sam 24, 1 Kon `cross`).
8. **Saul 40 jaar** — alleen Handelingen 13:21; 1 Samuël 13:1 (SV ‘een jaar … het tweede jaar’) geeft geen bruikbaar
   getal. De datering van 1 Samuël rust daarom op Handelingen 13:21.
9. **Goliath** — SV ‘zes ellen en een span’ aangehouden; sommige oude handschriften lezen vier ellen. Niet vermeld in de
   inhoud; alleen de omrekening is als schatting gemarkeerd.
10. **Endor** (1 Sam 28) — de tekst zegt ‘Samuël’; zo verteld, zonder uitleg over de discussie.
11. **Jona: ‘groot’ 16 keer** — klopt in de SV; in het Hebreeuws telt men het woord meestal 14 keer. Nu als
    ‘in de Statenvertaling’ gemarkeerd.
12. **Exodusdatering** — alle jaartallen vóór Salomo hangen aan 1 Koningen 6:1 (480 jaar); in de Salomo-noot staat dat
    wie de uittocht in de 13e eeuw plaatst, de 480 jaar anders leest.

## Voor plaatsen/kaart

- **Gilgal** (`gilgal`, Jordaanvallei): bij 1 Samuël 7:16 en 2 Koningen 2:1–2 is niet zeker dat dit Gilgal bedoeld is.
  In 2 Koningen 2:2 ‘gingen zij af naar Bethel’; veel uitleggers denken daar aan een Gilgal in het bergland (Jiljilia).
  De Elia-route op de kaart begint nu bij Bethel; de `d`/`bron` van `gilgal` zou dit kunnen noemen.
- **Daniël 5:31–6:28** (`at: ["babelst", "dan_medie"]`): het verhaal speelt zich waarschijnlijk in Babel af; Medië licht
  op omdat Darius een Meder was. Overweeg alleen `babelst`.
- **2 Koningen 4:1–7 en 13:14–21** (`at: ["samaria"]`): de plaats staat er niet bij (de `fact` zegt dat). Een vage
  markering of geen marker zou eerlijker zijn.
- **Jona naar Ninevé** (stap 4): de reconstructie loopt via Tadmor en Deir ez-Zor door de woestijn. De gangbare
  karavaanweg ging noordelijker (Aleppo–Haran–Tigris). Mag zo blijven (`recon`), maar de noordroute is waarschijnlijker.
- **2 Samuël 24** (Joabs telling): de route liep via `samaria`, een stad die pas Omri bouwde (1 Kon 16:24); vervangen door
  `sichem` in de inhoud.
- **Eben-Haëzer**: 1 Samuël 4:1 (bij Afek) en 7:12 (tussen Mizpa en Sen) zijn waarschijnlijk twee verschillende plekken.
  `sam_ebenhaezer` beschrijft alleen 7:12; stap 2 (hoofdstuk 4) gebruikt terecht `sam_afek`.
- **Rama** (`rama`, `c: "b"`): voor 1 Samuël 1 en 9 (Ramathaim-Zofim) worden ook andere plaatsen voorgesteld; de
  afstand in de `fact` (‘ongeveer 15 km’) gaat uit van ar-Ram.

## Aantallen

| Boek | Stappen | Speurtochtvragen | Controleregels vóór → na | Script |
| --- | --- | --- | --- | --- |
| 1 Samuël | 21 | 35 | 292 → 345 | 0 mis |
| 2 Samuël | 11 | 16 | 213 → 242 | 0 mis |
| 1 Koningen | 19 | 26 | 216 → 241 | 0 mis |
| 2 Koningen | 18 | 27 | 211 → 255 | 0 mis |
| Daniël | 8 | 13 | 81 → 97 | 0 mis |
| Esther | 8 | 13 | 82 → 91 | 0 mis |
| Ezra en Nehemia | 14 | 24 | 143 → 175 | 0 mis |
| Jona | 7 | 14 | 47 → 58 | 0 mis |
| **Totaal** | **106** | **168** | **1.285 → 1.504 (+219)** | **0 mis** |

- Correcties (tabelregels hierboven): ca. 175, waarvan ca. 60 inhoudelijk in `txt`/`who`/`ref`/`cross`, ca. 25 routes
  (`recon`), 12 delen met nieuwe chronologie en `fs` bij alle 106 stappen met een weetje.
- Alle kruisverwijzingen (`cross`), inclusief het Nieuwe Testament, hebben nu een controleregel; alle verwijzingen zijn
  leesbaar voor `BR.parseRef` (ook de nieuwe, zoals ‘Daniël 5:31–6:28’ en ‘2 Koningen 23:29–30; 2 Kronieken 35:20–25’).
- `node --check` op alle acht inhoudsbestanden: in orde. `node scripts/bijbelreis-check.mjs`: geen problemen.
- Stappen niet herordend, ingevoegd of verwijderd; plaats- en deel-ids ongewijzigd.
