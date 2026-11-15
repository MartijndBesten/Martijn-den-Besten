# Notities bij het deel `nt-paulus2` (Handelingen 17:1–18:22)

Boek: Handelingen (`public/bijbelreis/inhoud/nt-handelingen.js`). Titel: ‘Paulus: van Thessalonica tot Antiochië’, 9 stappen, kleur `teal`, `short: "Korinthe"`, `init: "K"`. Sluit aan op `nt-paulus` (eindigt in Filippi) en stopt bij 18:22; 18:23 en verder hoort bij `nt-paulus3`.

Bronnen: Statenvertaling via `node scripts/sv.mjs`, OpenBible.info Bible Geocoding Data (`plaats-zoek.py --exact`), en voor land of zee de ondergrond van de kaart zelf (`public/bijbelreis/geo.json`).

## Stappen

| # | ref | titel | stempel | plaatsen (`at`) | route |
| --- | --- | --- | --- | --- | --- |
| 1 | 17:1–9 | Drie sabbatten in Thessalonica | Jason | Amfipolis, Apollonia, Thessalonica | Filippi → Amfipolis → Apollonia → Thessalonica (ca. 125 km; plaatsen uit de tekst, geen `recon`) |
| 2 | 17:10–13 | Berea onderzoekt de Schriften | Berea | Berea | Thessalonica → Berea (ca. 69 km, `recon`) |
| 3 | 17:14–21 | Alleen in Athene | Athene | Athene | Berea → kust → over zee → Athene (ca. 517 km, `recon`) |
| 4 | 17:22–34 | De onbekende God | Areopagus | Areopagus | geen |
| 5 | 18:1–4 | Tentenmakers in Korinthe | Tenten | Korinthe | Athene → Korinthe over land (ca. 82 km, `recon`) |
| 6 | 18:5–11 | Veel volk in deze stad | Korinthe | Korinthe | geen |
| 7 | 18:12–17 | Voor de rechterstoel van Gallio | Gallio | Korinthe | geen |
| 8 | 18:18–21 | Over zee naar Efeze | Gelofte | Kenchreeën, Efeze | Korinthe → Kenchreeën (11 km, `recon`); Kenchreeën → Efeze over zee (ca. 436 km, `recon`) |
| 9 | 18:21–22 | Via Jeruzalem naar Antiochië | Antiochië | Caesarea, Jeruzalem, Antiochië | Efeze → Caesarea over zee (ca. 1.042 km, `recon`); Caesarea → Jeruzalem (91 km, `recon`); Jeruzalem → Antiochië langs de kust (ca. 548 km, `recon`) |

Alle routes samen: ca. 2.900 km.

## Nieuwe plaatsen

| sleutel | naam | `c` | punt (lat, lng) | score OpenBible | grond |
| --- | --- | --- | --- | --- | --- |
| `p2_amfipolis` | Amfipolis | v | 40.8202, 23.8472 | 1000 | Opgegraven stad Amphipolis; punt in zichtbare resten. Geen tegenkandidaat. |
| `p2_apollonia` | Apollonia | w | 40.6237, 23.4697 | 1000 | De identificatie (Apollonia in Mygdonië, ten zuiden van het Volvimeer; Pleiades 491526) is de enige, maar OpenBible geeft een nauwkeurigheid van 5 km en zegt dat de precieze plek niet duidelijk is. Daarom `w` en niet `v`. |
| `p2_areopagus` | Areopagus | v | 37.9722, 23.7236 | 1000 | Heuvel Areios Pagos naast de Akropolis; punt in zichtbare resten. De heuvel staat vast; onzeker is alleen of Paulus op de heuvel sprak of voor de raad (zie twijfelpunten). |

Hergebruikt: `nt_filippi`, `nt_thessalonica`, `nt_berea`, `nt_athene`, `nt_korinthe`, `nt_kenchreeen`, `nt_efeze`, `nt_caesarea`, `nt_antipatris` (alleen als wegpunt), `salem`, `nt_antiochie`, en als context `nt_macedonie` en `nt_achaje`.

De Areopagus ligt ca. 280 m van het punt van Athene. Bij weinig zoom vallen de twee stippen over elkaar (net als Tempel en Jeruzalem). Het label van de Areopagus verschijnt pas vanaf zoom 10, behalve in stap 4.

## Tussenpunten (`BR.W`)

`p2_pydnakust` (kust ten oosten van Berea), `p2_thermaisch` (Thermaïsche Golf), `p2_kafireus` (straat tussen Euboea en Andros), `p2_sounion` (zuidpunt van Attica), `p2_piraeus` (haven van Athene), `p2_isthmus` (landengte bij Korinthe), `p2_saronisch` (Saronische Golf), `p2_cycladen` (ten zuiden van Mykonos), `p2_samosstraat` (straat tussen Samos en het vasteland), `p2_cyprus_zuid` (ten zuiden van Cyprus). Geen van deze namen staat in de tekst; het zijn alleen hulppunten. Elke zeeroute is punt voor punt getoetst aan `geo.json`: geen enkel stuk loopt over land, behalve de laatste kilometers naar Athene en Efeze (die steden liggen niet aan zee) en het begin bij Berea.

## Plaatsen uit de tekst die niet op de kaart staan

| plaats | vers | reden |
| --- | --- | --- |
| Pontus | 18:2 | Streek aan de Zwarte Zee (OpenBible 1000, punt in gebied 40.68, 37.83). Alleen de geboortestreek van Aquila; ligt ver buiten het reisgebied en zou de kaart onnodig wijd trekken. |
| Italië, Rome | 18:2 | Alleen genoemd als herkomst van Aquila en Priscilla. `nt_rome` bestaat, maar hoort niet bij deze reis. |
| Syrië | 18:18 | Land; Paulus ‘scheepte naar Syrië’. Het doel van de reis staat op de kaart als Caesarea, Jeruzalem en Antiochië. |
| Macedonië, Achaje | 18:5, 18:12 | Staan er wel, als bestaande gebieden (`ctx`). |
| De markt en de synagoge van Athene | 17:17 | Geen eigen punt; vallen binnen Athene. |
| De rechterstoel in Korinthe | 18:12 | Geen eigen punt. In Korinthe is een spreekgestoelte (bema) opgegraven dat vaak hiermee verbonden wordt; dat staat niet in de tekst en ook niet in de app. |

## Personen

Nieuw in `BR.mensen` (allemaal `boek: ["handelingen"]`): `jason`, `dionysius`, `damaris`, `aquila`, `priscilla` (alias Priska), `justus`, `crispus` (alias Krispus), `gallio`, `sosthenes`. Aquila en Priscilla zijn als echtpaar gekoppeld (`p`, grondslag `b`: Handelingen 18:2). Bestaande personen hergebruikt: Paulus, Silas, Timotheüs.

Geen nieuwe groepsnamen. Gebruikt zijn de bestaande groepen `Joden`, `Mannen` en `Gemeente`. Let op: de app toont bij een groep alleen de tweede waarde als label. Daarom staat er `["Joden", "Joden van Efeze"]` en `["Mannen", "mannen van Athene"]`, niet alleen ‘van Efeze’.

**Voor de integrator:** `nt-paulus3` (18:23–20:38) heeft Aquila en Priscilla waarschijnlijk ook nodig (18:26). Staan ze daar ook als nieuwe persoon, dan moeten de twee invoeren worden samengevoegd; anders overschrijft de laatste de eerste, of delen twee personen met dezelfde naam het boek. Mijn sleutels zijn `aquila` en `priscilla`. Hetzelfde kan gelden voor de kleurregels (`Aquila`, `Priscilla`).

## Datering

`tijd: "ca. 50–52 n.Chr."`, `tl: [50, 52]`, grond `historie`, niet als onzeker gemarkeerd (zoals `nt-paulus`). Het vaste punt is de Gallio-inscriptie uit Delphi (ca. 51–52 n.Chr.), samen met ‘een jaar en zes maanden’ (18:11) en ‘nog vele dagen’ (18:18). Het jaar 49 voor het bevel van Claudius is in `tijdNoot` als minder zeker genoemd: het jaartal komt van de late schrijver Orosius; Suetonius noemt het bevel zonder jaar.

`nt-paulus` loopt tot 50 en dit deel begint bij 50. Als `nt-paulus3` ook bij 52 begint, sluiten de drie op elkaar aan.

## Twijfelpunten

1. **18:22, ‘ging hij op naar Jeruzalem’.** In de Griekse tekst staat alleen dat Paulus opging en de gemeente groette. De Statenvertaling vult aan ‘naar Jeruzalem’; de controletekst heeft die woorden ook. De vertelling volgt de Statenvertaling (‘gaat hij op naar Jeruzalem en groet de gemeente’) en zegt erbij: ‘Meer vertelt de Bijbel over dit bezoek niet.’ Het weetje legt uit dat de woorden een aanvulling zijn en dat de meeste uitleggers het zo lezen. Of de gemeente in Jeruzalem bedoeld is en niet die van Caesarea, is dus uitleg, al is het de gangbare. Het groepslabel in die stap is daarom alleen ‘de gemeente’.
2. **De weg van Jeruzalem naar Antiochië** staat niet in de tekst. Getekend is de kustweg (Caesarea, de Fenicische kust, Laodicea), als reconstructie. Even goed mogelijk: over zee van Caesarea naar Seleucië, of door het binnenland via Damascus. De lijn gebruikt geen sleutels van Tyrus, Sidon of Ptolemaïs, om niet te suggereren dat de tekst die steden noemt.
3. **Van Berea naar Athene: over zee of over land?** De tekst zegt alleen ‘als naar de zee’ (17:14) en dat zijn begeleiders hem ‘tot Athene toe’ brachten. Getekend is een zeeroute, als reconstructie, met een weetje dat dit niet in de Bijbel staat. De route loopt buiten Euboea om; ook dat is een keuze.
4. **Wie deed de gelofte in Kenchreeën (18:18)?** De zin kan grammaticaal op Paulus of op Aquila slaan. De vertelling volgt de meeste uitleggers (Paulus); het weetje noemt de andere mogelijkheid. Dat het een nazireeërgelofte was, staat er niet; het weetje zegt dat uitleggers daaraan denken.
5. **De Areopagus: heuvel of raad?** ‘De plaats, genaamd Areopagus’ (17:19, 22) kan de heuvel zijn of de raad die zo heette en die mogelijk bij de markt vergaderde. Het punt staat op de heuvel; de beschrijving van de plaats zegt ‘hier, of voor die raad’.
6. **Apollonia** staat op `w` ondanks score 1000 (zie de tabel).
7. **Via Egnatia tussen Filippi en Amfipolis.** De lijn is recht getrokken; of de weg ten noorden of ten zuiden van het Pangaiongebergte liep, is op deze schaal niet te zien.
8. **Sosthenes en Jason elders.** ‘Sosthenes, de broeder’ (1 Korinthe 1:1) en Jason (Romeinen 16:21) kunnen dezelfde mannen zijn; de Bijbel zegt het niet. Zo staat het ook in `personen.js`.
9. **18:17, ‘al de Grieken’.** Zo de Statenvertaling; andere handschriften hebben alleen ‘allen’. De vertelling volgt de Statenvertaling.
10. **18:21, ‘Ik moet ganselijk het toekomende feest te Jeruzalem houden’.** Staat in de Statenvertaling; in andere handschriften ontbreekt de zin. Letterlijk geciteerd, zonder aantekening.
11. **‘Hem horende’ (18:8).** Kan op Paulus of op Crispus slaan; de vertelling laat het open (‘die hem horen’).

## Bewust weggelaten

- De dichter Aratus is wel genoemd (weetje bij stap 4), maar niet Cleanthes, bij wie bijna dezelfde woorden staan.
- Dat Gallio een broer was van de wijsgeer Seneca.
- Dat Paulus uit Korinthe waarschijnlijk de brieven aan de Thessalonicenzen schreef (1 Thessalonicenzen 1:1; 3:6). Aannemelijk, maar uitleg; alleen de kruisverwijzingen naar 1 Thessalonicenzen staan erin.
- De twee havens van Korinthe (Lechaeum en Kenchreeën) en het opgegraven spreekgestoelte.
- Uit de rede op de Areopagus: ‘de tijden te voren geordineerd, en de bepalingen van hun woning’ (17:26) en vers 29 (de Godheid is niet aan goud, zilver of steen gelijk), om de stap binnen zeven zinnen te houden.
- 17:8 (de schare en de oversten raken in beroering) en 17:21 (de Atheners willen steeds iets nieuws horen).

## Citaten

Alle tekst tussen ‘ ’ is letterlijk Statenvertaling en staat met een regel in `scripts/bijbel-controle/nt-paulus2.txt` (106 regels). Uitspraken in eigen woorden staan tussen “ ”. Losse woorden tussen ‘ ’ (‘klapper’) vallen buiten de citaattest.

## Controles

- `node --check` op de vier bestanden: geen fouten.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/nt-paulus2.txt`: 0 mis.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt`: 0 mis.
- `node scripts/bijbelreis-personen-check.mjs`: Geen fouten.
- `npx vitest run tests/bijbelreis.test.ts`: 29 geslaagd, 1 overgeslagen (die laatste hoort zo). Bij een eerdere run, toen de machine zwaar belast was, liepen twee tests over de reisniveaus (niet over dit deel) over hun limiet van 5 seconden; bij de volgende runs slaagden ze.
- Visueel: de negen stappen bekeken in de pagina zelf (lokale server, Chromium). Routes lopen niet over land of eilanden, labels botsen niet, geen meldingen in de console.
