# Kerst C: de wijzen tot en met de twaalfjarige Jezus (notities)

Bestand: `public/bijbelreis/inhoud/kerst-3.js`, twee delen in het boek `kerst`:

- `kerst-wijzen`, “De wijzen, Egypte en Nazareth” (Mattheüs 2), kleur `oker`, 10 stappen;
- `kerst-twaalf`, “Twaalf jaar: in het huis van Zijn Vader” (Lukas 2:39–52), kleur `teal`, 9 stappen.

Verder: drie regels in `kerst.wie` (Wijzen, Herodes, Archelaüs), kleuren voor Archelaüs, Schriftgeleerden en Leraren,
één nieuwe plaats (`kc_rama`), één nieuwe persoon (`archelaus`), `"kerst"` achteraan bij `jezus`, `maria`, `jozef_nt`
en `herodes`, twee regels in `dateringen.js`, controlebestand `scripts/bijbel-controle/kerst-3.txt`.

## Stappen

### kerst-wijzen

| # | Verwijzing | Titel | Plaats (`at`) | Route |
| --- | --- | --- | --- | --- |
| 1 | Mattheüs 2:1–2 | Wijzen van het Oosten | `salem` | geen (herkomst onbekend) |
| 2 | Mattheüs 2:3–6 | Waar zou de Christus geboren worden? | `salem`, `efrath` | geen |
| 3 | Mattheüs 2:7–8 | Herodes roept de wijzen heimelijk | `salem` | geen |
| 4 | Mattheüs 2:9–10 | De ster gaat hun voor | `efrath` | Jeruzalem → Bethlehem, `recon: 1` (ca. 9 km) |
| 5 | Mattheüs 2:11–12 | In het huis: goud, wierook en mirre | `efrath` | geen (terugweg “door een anderen weg” onbekend) |
| 6 | Mattheüs 2:13–15 | De vlucht naar Egypte | `egypte` (gebied) | Bethlehem → Hebron → Gaza → kustweg → Pelusium, `recon: 1`; houdt op aan de rand van Egypte |
| 7 | Mattheüs 2:16–18 | Rachel beweent haar kinderen | `efrath`, `kc_rama` | geen |
| 8 | Mattheüs 2:19–21 | Sta op en ga terug | `egypte` | geen |
| 9 | Mattheüs 2:22 | Niet naar Judea, maar naar Galilea | `nt_nazareth` | Pelusium → kustweg → Megiddo → Nazareth, `recon: 1` (ca. 355 km) |
| 10 | Mattheüs 2:23 | Wonen in Nazareth | `nt_nazareth` | geen |

### kerst-twaalf

| # | Verwijzing | Titel | Plaats (`at`) | Route |
| --- | --- | --- | --- | --- |
| 1 | Lukas 2:39–40 | Het Kind groeit op in Nazareth | `nt_nazareth` | geen |
| 2 | Lukas 2:41–42 | Naar het Pascha in Jeruzalem | `salem` | Nazareth → Jordaandal → Jericho → Jeruzalem, `recon: 1` (ca. 130 km), dezelfde weg als in `nt-geboorte` |
| 3 | Lukas 2:43 | Het Kind Jezus blijft in Jeruzalem | `salem` | geen |
| 4 | Lukas 2:44–45 | Een dagreis, en weer terug | `salem` | geen: hoe ver de dagreis was en waarheen, zegt de tekst niet |
| 5 | Lukas 2:46–47 | In het midden van de leraren | `nt_tempel` | geen |
| 6 | Lukas 2:48 | ‘Kind! waarom hebt Gij ons zo gedaan?’ | `nt_tempel` | geen |
| 7 | Lukas 2:49–50 | In de dingen van Zijn Vader | `nt_tempel` | geen |
| 8 | Lukas 2:51 | Terug naar Nazareth: Hij was hun onderdanig | `nt_nazareth` | omgekeerde weg van stap 2, `recon: 1` |
| 9 | Lukas 2:52 | Wijsheid, grootte en genade | `nt_nazareth` | geen |

Extra’s: `onthul` bij de geschenken (wijzen 5), bij de vier vervullingen (wijzen 10) en bij wat we later over Nazareth lezen
(twaalf 9). Elk deel heeft 2–3 kaartvragen, 9 meerkeuzevragen en 1 volgordevraag.

## Plaatsen

| Sleutel | Naam | `c` | Punt | Score | Grond |
| --- | --- | --- | --- | --- | --- |
| `kc_rama` | Rama | w | [31.8543, 35.2316] | 723 | OpenBible “Ramah 1” (Jeremia 31:15; Mattheüs 2:18): Er Ram / ar-Ram, in Benjamin (Jozua 18:25). Zelfde punt als de bestaande `rama`, maar die heeft `c: "b"` met alternatieven (Rentis, Beit Rima) voor het Rama van Samuël; die horen niet bij Jeremia 31:15. Daarom een eigen sleutel, zoals `babel`/`babelst`. |

Hergebruikt: `salem`, `efrath`, `nt_tempel`, `nt_nazareth`, `egypte` (gebied, `c: "r"`), tussenpunten `hebron`, `lachisw`,
`gaza`, `arish`, `pelusium`, `jaffa`, `coast1`, `megiddo`, `nt_galilea_zuid`, `jvalley`, `nt_jordaanvallei`, `jericho`
(dezelfde wegen als `nt-geboorte` en `jeremia-egypte`). De watercontrole (`bijbelreis-toen.py --alleen-controle`) meldt
geen van deze routes.

Bewust niet op de kaart:

- **Het Oosten** (2:1, 2, 9) en **hun land** (2:12): geen punt en geen lijn. OpenBible heeft “East” alleen als streek
  (“not necessarily depicting a specific location”). De wijzen beginnen op de kaart in Jeruzalem; hun terugweg is niet getekend.
- **De woonplaats in Egypte**: de Bijbel noemt geen stad. De lijn houdt op bij Pelusium, aan de rand van Egypte; `at` is het
  gebied `egypte`. Daar wordt in de tekst niet over uitgeweid.
- **Galilea** als streek: de ondergrond toont al het streeklabel GALILEA. Een eigen gebiedspunt (`kc_galilea`, OpenBible
  “Galilee 1”, 1000) gaf een dubbel label en is weer weggehaald; stap 9 eindigt bij Nazareth.
- **De dagreis** (Lukas 2:44): geen punt; de tekst zegt niet waar zij na één dag waren.

## Personen

- Nieuw: `archelaus` (“Archelaüs”, `v: "herodes"`, grondslag `b` Mattheüs 2:22, ‘in de plaats van zijn vader Herodes’);
  regel in `scripts/bijbel-controle/personen.txt` onder `# --- Kerst C`.
- `"kerst"` als laatste toegevoegd aan `boek` van `jezus`, `maria`, `jozef_nt` en `herodes`. Geen naamgenoot met boek
  `kerst`: `jozef` (Genesis), `herodes_antipas` en `herodes_agrippa` hebben het boek niet. In `scripts/bijbelreis-personen-check.mjs`
  staat in `VERWACHT`: `kerst|Jozef → jozef_nt`, `kerst|Maria → maria`, `kerst|Herodes → herodes`. **Let op bij samenvoegen:**
  de andere schrijvers voegen bij dezelfde personen ook `"kerst"` toe (en mogelijk dezelfde VERWACHT-regels); het boek mag
  er maar één keer in staan. Bij `jezus` heb ik `"kerst"` ook toegevoegd.
- Nieuwe groepen in `GROEPEN` (personen-check): **`Schriftgeleerden`** (Mattheüs 2:4) en **`Leraren`** (Lukas 2:46).
  Die moeten ook in `GROUPS` in `app.js` (integrator); tot dan toont de app ze als naam met hoofdletter in plaats van als groep.
- Verder gebruikt: groepen `Wijzen`, `Overpriesters`, `Reisgenoten`, `Familie`; rol `Engel`.

## Datering

`"kerst:kerst-wijzen": ["historie", true]` (tl −6 tot −4) en `"kerst:kerst-twaalf": ["historie", true]` (tl 7 tot 9).
Zelfde grond als `nt-geboorte`: geboorte vóór de dood van Herodes de Grote (ca. 4 v.Chr. volgens Josephus), twaalf jaar later
ca. 7–9 n.Chr. (geen jaar 0). De `tijdNoot` noemt ook de latere datering (ca. 3–2 v.Chr.).

## Meeverteld als gangbare uitleg (redactieregel van de eigenaar)

Waar de tekst iets openlaat en er een algemeen aanvaarde uitleg is, staat die gewoon in de vertelling (txt of fact), zonder
“uitleggers verschillen”. Per geval, met de grond:

| Waar | Meeverteld | Grond |
| --- | --- | --- |
| wijzen 1 | Wijzen zijn geleerden uit de streek van Babel en Perzië die de sterren kennen | Daniël 2:2, 48 (‘wijzen van Babel’, ‘sterrekijkers’); kanttekeningen SV bij Mattheüs 2:1; Calvijn; M. Henry |
| wijzen 1 | Zij gaan naar Jeruzalem omdat zij daar de Koning verwachten | M. Henry; Calvijn |
| wijzen 2 | Deze Herodes is Herodes de Grote, door Rome koning gemaakt, niet uit David, vreest voor zijn troon | Josephus; algemeen in de kanttekeningen en commentaren |
| wijzen 3 | Herodes meent het aanbidden niet; heimelijk om zijn plan verborgen te houden | Mattheüs 2:13 zelf; M. Henry |
| wijzen 4 | De ster verschijnt opnieuw en wijst de weg; de schriftgeleerden kennen de plaats maar gaan niet mee | Calvijn; M. Henry |
| wijzen 5 | Enige tijd na de geboorte; Jozef en Maria wonen in een huis in Bethlehem (‘in het huis’, 2:11; ‘twee jaren oud en daaronder’, 2:16) | kanttekeningen SV; gangbare harmonie van Mattheüs en Lukas |
| wijzen 5 | Neerbuigen en geschenken zoals men in het Oosten een koning eert; de wijzen als eerstelingen uit de heidenen | Calvijn; M. Henry |
| wijzen 6 | Hosea 11:1 zegt het van Israël en wordt in Christus, Gods Zoon, vervuld | kanttekeningen SV bij Mattheüs 2:15; Calvijn |
| wijzen 7 | Jeremia 31:15 sprak over de wegvoering; Rachel als moeder van het volk weent; troost in 31:16–17 | Jeremia 40:1 (Rama en de wegvoering); Calvijn; M. Henry |
| wijzen 9 | Archelaüs regeert hard en wordt na ongeveer tien jaar afgezet; het rijk onder drie zonen verdeeld | Josephus (historisch, `fs: "h"`) |
| wijzen 10 | ‘Nazarener’: de profeten samen; de verachting (Jesaja 53:3; Johannes 1:46) en de Spruit/Scheut, netser (Jesaja 11:1) | kanttekeningen SV bij Mattheüs 2:23; Calvijn; M. Henry |
| twaalf 1 | Lukas slaat Mattheüs 2 over; daarna woont het gezin weer in Nazareth | gangbare harmonie |
| twaalf 2 | Maria gaat mee hoewel het gebod de mannen noemt; ‘opgaan’ omdat Jeruzalem hoog ligt | M. Henry |
| twaalf 3 | ‘De dagen’ zijn de zeven dagen van het feest | Leviticus 23:5–6 |
| twaalf 4 | Men reist in een groot gezelschap uit één streek; daarom wordt Hij de eerste dag niet gemist; een dagreis is wat zo’n gezelschap op een dag aflegt | M. Henry; kanttekeningen SV bij Lukas 2:44 |
| twaalf 5 | Drie dagen: één heen, één terug, op de derde gevonden; de leraren zijn schriftgeleerden die de wet uitleggen | Calvijn; M. Henry; Lukas 5:17 |
| twaalf 7 | ‘De dingen Mijns Vaders’: het huis en het werk van Zijn Vader; de tempel als het huis van de Vader (in txt verweven) | kanttekeningen SV; Johannes 2:16 |
| twaalf 8 | Onderdanigheid als het houden van het vijfde gebod | Exodus 20:12; M. Henry |
| twaalf 9 | Hij deed ook het werk van timmerman | Markus 6:3 |

Bewust **niet** meeverteld (geen algemeen aanvaarde uitleg, of volkstraditie): wat de ster precies was; aantal en namen van
de wijzen; ‘drie koningen’; de wijzen bij de kribbe; waar in Egypte Jozef woonde; hoeveel kinderen in Bethlehem omkwamen
(de tekst zegt alleen dat het er niet staat); hoe ver de dagreis was; een bar mitswa of andere latere gebruiken op twaalfjarige
leeftijd; Jozefs latere leven.

Wel bewaard in de tekst: “Hoeveel wijzen er zijn en hoe zij heten, zegt Mattheüs niet” en “Hoeveel kinderen het waren, zegt de
Bijbel niet”. Dat zijn geen opmerkingen over verschil tussen uitleggers, maar zeggen wat de tekst niet geeft, tegen de
gangbare volkstraditie in (‘drie koningen’, getallen voor de kindermoord).

## Twijfelpunten

- **Twaalf 7, txt**: “Zijn Vader is God, en de tempel is het huis van Zijn Vader” staat volgens de nieuwe redactieregel in de
  `txt` zelf. Liever alleen in `fact`? Dan is de zin in txt eenvoudig te schrappen.
- **Wijzen 1, fact**: “uit de streek van Babel en Perzië”. Calvijn en de kanttekeningen houden het bij ‘het Oosten’/Perzië en
  Chaldea; Arabië wordt ook genoemd (Jesaja 60:6). Ik koos de formulering uit de opdracht.
- **Wijzen 6**: Hosea 11:1 staat in de controletekst als 11:1; in sommige uitgaven nummert Hosea anders. Gecontroleerd tegen
  de controletekst.
- **Stat twaalf**: ‘eerste woorden van de Heere Jezus die in de Bijbel staan’ bedoelt: de eerste in tijdsvolgorde.
- `kc_rama` deelt het punt met `rama`; in het overzicht ‘Alle plaatsen’ staat Rama daardoor twee keer. Alternatief: bij `rama`
  de alternatieven alleen voor Samuël tonen (vraagt een wijziging in `app.js`).
- Kleur `teal` voor `kerst-twaalf` en `oker` voor `kerst-wijzen`: afstemmen met kerst-1 en kerst-2 als het thema een eigen palet krijgt.

## Voor de tekenaar (per stap)

Geen afbeelding van God, van de Heere Jezus (ook niet als Kind of als jongen van twaalf) en van engelen. Het Kind en de
twaalfjarige kunnen hoogstens worden aangeduid door wat erom heen is (een deur, een lege plek in de kring, een kind van achteren
is óók een afbeelding en valt dus af). Geen kribbe, os en ezel, stal, sneeuw of kroontjes.

### kerst-wijzen

1. **Wijzen van het Oosten**: een stadspoort van Jeruzalem in de avond; mannen in Oosterse reiskleding met lastdieren (kamelen
   of ezels; het aantal mannen open laten, liever een groep zonder telbaar aantal); één ster aan de hemel.
2. **Waar zou de Christus geboren worden?**: een zaal in het paleis van Herodes; mannen met boekrollen; een opengerolde rol op
   tafel; Herodes op een zetel, gespannen houding.
3. **Herodes roept de wijzen heimelijk**: een kleine, half verlichte kamer, een gordijn, Herodes die naar voren leunt; de wijzen
   staand.
4. **De ster gaat hun voor**: de weg van Jeruzalem naar Bethlehem in de nacht, heuvels, een kleine groep reizigers van achteren,
   één heldere ster vóór hen boven de huizen van Bethlehem.
5. **In het huis**: buitenkant van een eenvoudig stenen huis in Bethlehem met open deur en lamplicht; vóór de deur drie
   geopende kistjes of buidels (goud, wierook, mirre); de wijzen buigend bij de drempel, het binnenste niet zichtbaar.
   Of alleen de drie geschenken als stilleven.
6. **De vlucht naar Egypte**: nacht; een man met een lastdier en een vrouw met een in een doek gewikkeld bundeltje
   (gezicht niet zichtbaar), op een weg naar het zuidwesten; de kust in de verte.
7. **Rachel beweent haar kinderen**: geen geweld tonen. Een heuvel bij Rama of Bethlehem in grauw licht; een lege wieg of
   een gedenksteen (Rachels graf aan de weg, Genesis 35:20); eventueel een vrouw in rouw van achteren.
8. **Sta op en ga terug**: de Nijl met palmen en een Egyptisch dorp in de ochtend; een man die bepakt staat om te vertrekken.
9. **Niet naar Judea, maar naar Galilea**: een splitsing van wegen; een wegwijzersteen of heuvels: links naar het bergland van
   Judea (Jeruzalem in de verte), rechts naar het groene noorden.
10. **Wonen in Nazareth**: een klein dorp op een helling in Galilea; eenvoudige huizen; een timmermanswerkplaats met gereedschap
    en hout bij een huis.

### kerst-twaalf

1. **Het Kind groeit op in Nazareth**: Nazareth in de lente; huizen tegen de helling, een waterput, olijfbomen.
2. **Naar het Pascha in Jeruzalem**: een lange stoet reizigers met ezels door het Jordaandal, palmen bij Jericho, de weg die
   omhoog klimt naar Jeruzalem.
3. **Het Kind Jezus blijft in Jeruzalem**: de stad met de tempel bij ochtendlicht; de stoet trekt de poort uit, van achteren gezien.
4. **Een dagreis, en weer terug**: een kampplaats bij avond met tenten en vuurtjes; een man en een vrouw met een lamp die
   tussen de groepen zoeken.
5. **In het midden van de leraren**: een zuilengang van de tempel; oudere mannen met rollen in een kring op een stenen trede,
   allen kijkend naar het midden (het midden zelf buiten beeld of door een zuil bedekt).
6. **‘Kind! waarom hebt Gij ons zo gedaan?’**: Jozef en Maria in de zuilengang, opgelucht en ontdaan; de kring van leraren op de achtergrond.
7. **In de dingen van Zijn Vader**: de tempel zelf, de voorhof met het altaar en de rook van het offer; geen personen nodig.
8. **Terug naar Nazareth**: de weg naar beneden uit Jeruzalem; een gezin dat samen reist, van ver en van achteren.
9. **Wijsheid, grootte en genade**: de werkplaats in Nazareth: schaafkrullen, een werkbank, een boekrol op een plank (de
   synagoge, Lukas 4:16), avondlicht door het venster.

## Controles

```
node --check (kerst-3.js, plaatsen.js, personen.js, dateringen.js)        ok
python3 scripts/bijbel-check.py scripts/bijbel-controle/kerst-3.txt        0 mis
python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt       0 mis
node scripts/bijbelreis-personen-check.mjs                                 Geen fouten.
npx vitest run tests/bijbelreis.test.ts                                    alles geslaagd
node scripts/bijbelreis-check.mjs desktop                                  Geen problemen gevonden.
python3 -I scripts/bijbelreis-toen.py --alleen-controle                    geen kerst-routes gemeld
```
Alle 19 stappen bekeken op de kaart (poort 8823, niveau c).
