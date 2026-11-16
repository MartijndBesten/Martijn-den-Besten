# Notities bij Kerst B: `kerst-aankondiging` en `kerst-geboorte`

Boek: `kerst` (het lege boek staat in `public/bijbelreis/inhoud/kerst.js`). Bestand: `public/bijbelreis/inhoud/kerst-2.js`; het
voegt twee delen toe aan `kerst.delen` en negen regels aan `kerst.wie`. Scriptregel in `public/bijbelreis.html` direct na
`inhoud/kerst.js` (de collega van deel 1 zet daar `kerst-1.js` tussen; volgorde regelt de integrator).
Geschreven naast de Statenvertaling (`node scripts/sv.mjs "Lukas 1:5–80" "Mattheüs 1:18–25" "Lukas 2:1–40"`).
Controle: `scripts/bijbel-controle/kerst-2.txt` (225 regels, 0 mis).

Afgestemd op `jezus-1:nt-geboorte`: dezelfde plaatsen (`nt_tempel`, `nt_nazareth`, `nt1_judagebergte`, `efrath`, `salem`),
dezelfde personen (`maria`, `jozef_nt`, `zacharias`, `elisabeth`, `johannes_doper`, `gabriel`, `simeon_nt`, `anna`, `jezus`) en
dezelfde datering (vóór de dood van Herodes, ca. 6–4 v.Chr.; Zacharias ruim een jaar eerder).

## Stappen

### De aankondiging (`kerst-aankondiging`, kleur `lila`, ca. 7–5 v.Chr.)

| # | Verwijzing | Titel | Plek (`at`) | Route |
| --- | --- | --- | --- | --- |
| 1 | Lukas 1:5–10 | Een priester in de tempel | `nt_tempel` | – |
| 2 | Lukas 1:11–17 | De engel bij het altaar | `nt_tempel` | – |
| 3 | Lukas 1:18–25 | Zacharias kan niet spreken | `nt_tempel`, `nt1_judagebergte` | tempel → bergland van Juda, ca. 7 km (recon) |
| 4 | Lukas 1:26–33 | Gabriël gezonden naar Nazareth | `nt_nazareth` | – |
| 5 | Lukas 1:34–38 | Bij God is niets onmogelijk | `nt_nazareth` | – |
| 6 | Lukas 1:39–45 | Maria gaat naar Elisabeth | `nt1_judagebergte` | Nazareth → bergland van Juda, ca. 110 km (recon, over de bergrug) |
| 7 | Lukas 1:46–56 | De lofzang van Maria | `nt1_judagebergte` | stippellijn ‘na drie maanden naar huis’ (1:56) |
| 8 | Lukas 1:57–66 | Johannes is zijn naam | `nt1_judagebergte` | – |
| 9 | Lukas 1:67–80 | De lofzang van Zacharias | `nt1_judagebergte` | – |
| 10 | Mattheüs 1:18–25 | De droom van Jozef | `nt_nazareth` | – |

`onthul` in stap 2 (wat de engel over Johannes zegt), 7 (lofzang van Maria), 9 (lofzang van Zacharias) en 10 (de namen JEZUS,
Emmanuël, Christus). De droom van Jozef staat als laatste stap: Mattheüs vertelt hem na het zwanger bevonden worden, en Lukas en
Mattheüs geven samen geen nauwere volgorde; de stap staat op Nazareth omdat Jozef daar woonde (Lukas 2:4).

### De geboorte in Bethlehem (`kerst-geboorte`, kleur `boter`, ca. 6–4 v.Chr.)

| # | Verwijzing | Titel | Plek (`at`) | Route |
| --- | --- | --- | --- | --- |
| 1 | Lukas 2:1–3 | Het gebod van keizer Augustus | `nt_rome`, `nt_nazareth` | – (Rome alleen als plaats van de keizer) |
| 2 | Lukas 2:4–5 | Van Nazareth naar Bethlehem | `nt_nazareth`, `efrath` | Nazareth → Bethlehem, ca. 115 km (recon) |
| 3 | Lukas 2:6–7 | De geboorte | `efrath` | – |
| 4 | Lukas 2:8–12 | Herders in het veld | `kb_herdersveld`, `efrath` | – |
| 5 | Lukas 2:13–14 | Het hemelse leger | `kb_herdersveld`, `efrath` | – |
| 6 | Lukas 2:15–20 | De herders gaan naar Bethlehem | `efrath`, `kb_herdersveld` | velden → Bethlehem, ca. 3 km (recon) |
| 7 | Lukas 2:21 | De achtste dag: de naam JEZUS | `efrath` | – |
| 8 | Lukas 2:22–24 | Naar de tempel in Jeruzalem | `nt_tempel`, `efrath` | Bethlehem → tempel, ca. 9 km (recon) |
| 9 | Lukas 2:25–35 | Simeon | `nt_tempel` | – |
| 10 | Lukas 2:36–38 | Anna | `nt_tempel` | – |

`onthul` in stap 3 (eerstgeboren, doeken, kribbe, herberg), 5 (de drie regels van de engelenzang) en 9 (lofzang van Simeon).
Lukas 2:39 (terug naar Nazareth) staat alleen in de `fact` van stap 10; het deel van Kerst C vertelt verder.

## Plaatsen

Nieuw (blok aan het eind van `plaatsen.js`):

| Sleutel | Naam | `c` | Punt | Score | Grond |
| --- | --- | --- | --- | --- | --- |
| `kb_herdersveld` | Velden bij Bethlehem | r (gebied) | [31.7073, 35.2301] | 632 | Lukas 2:8 zegt alleen ‘in diezelfde landstreek, zich houdende in het veld’: geen punt maar een gebied. Het midden ligt op Khirbet Siyar el-Ghanam bij Beit Sahour, ca. 3 km ten oosten van Bethlehem; OpenBible geeft dat punt bij Eder / Migdal-Eder (Genesis 35:21), score 632. Als gebied (`r`) verschijnt geen stip of zekerheidsclaim. |

Hergebruikt: `nt_tempel`, `salem`, `nt_nazareth`, `nt1_judagebergte` (c `o`; de stad van Zacharias wordt niet genoemd, het
bestaande illustratieve punt is gebruikt, geen nieuw punt), `efrath` (Bethlehem), `nt_rome`.
Tussenpunten (bestaand, `BR.W`): `nt_galilea_zuid`, `dothanw`, `ridge`, `nt_samariaweg`, `jeruz`. Geen nieuwe tussenpunten.

Niet als punt op de kaart: Syrië (Lukas 2:2; de app toont het als streeklabel), Galilea en Judea (streeklabels), ‘het gebergte
van Judea’ (1:65; het bestaande punt `nt1_judagebergte` staat ervoor), de woestijnen waar Johannes opgroeide (1:80; geen plaats
genoemd), de herberg en de kribbe (geen plaatsen).

`python3 -I scripts/bijbelreis-toen.py --alleen-controle`: geen van de nieuwe routes loopt door water van toen of nu.

## Wat reconstructie is

- Alle routes (`recon: 1`): de Bijbel noemt alleen begin en eind. Nazareth → Bethlehem en Nazareth → bergland van Juda volgen
  de weg over de bergrug (Jizreëlvlakte, Dothan, Samaria, Jeruzalem), net als `nt-geboorte`. De andere gebruikelijke weg (door
  het Jordaandal, om Samaria heen) wordt niet als feit genoemd of gekozen in de tekst; de kaart toont één lijn.
- De stad van Zacharias: het punt `nt1_judagebergte` is illustratief (c `o`). In de tekst staat alleen wat Lukas zegt.
- Het veld van de herders: gebied, geen punt.
- Datering: `tijd`/`tl`/`tijdNoot` als historische reconstructie, onzeker (`dateringen.js`: beide delen `["historie", true]`).
  Geen jaartal als feit; in de tijdNoot geen ‘men verschilt’ (redactieregel).

## Meeverteld als gangbare uitleg (redactieregel van de eigenaar)

Volgens de nieuwe regel staat de algemeen aanvaarde uitleg in de lopende tekst, zonder voorbehoud. Per geval:

| Wat | Waar | Grond |
| --- | --- | --- |
| Kribbe = voederbak; het Kind wordt geboren in een stal | geboorte stap 3 (`txt` en `onthul`) | Lukas 2:7, 12, 16; kanttekeningen SV bij Lukas 2:7 (kribbe = beestenstal/voederbak), Calvijn en Matthew Henry vertellen het zo. Geen os, ezel of herbergier. |
| De herberg was vol door de beschrijving | geboorte stap 3 `onthul` | Lukas 2:1–7: allen gingen naar hun eigen stad; zo uitgelegd door Calvijn en Henry. |
| Doeken = windsels zoals voor elk pasgeboren kind | geboorte stap 3 `onthul` | Ezechiël 16:4. |
| Arm geboren | geboorte stap 3 `fact` | 2 Korinthe 8:9; Johannes 1:14 (Bijbeltekst, geen eigen toepassing). |
| Het offer van twee duiven is het offer van wie arm is | geboorte stap 8 `fact` | Leviticus 12:8 met Lukas 2:24. |
| Veertig dagen tussen geboorte en tempel | geboorte stap 8 `fact`, tijdNoot | Leviticus 12:2–4 (7 + 33 dagen) met Lukas 2:22. |
| ‘De gehele wereld’ = het Romeinse rijk; beschrijving = inschrijving voor de belasting | geboorte stap 1 `fact` | gangbare uitleg (kanttekeningen SV bij Lukas 2:1); Augustus 27 v.Chr.–14 n.Chr. is historie. |
| Herders bij Bethlehem, zoals David | geboorte stap 4 `fact` | 1 Samuël 17:15. |
| Heirleger = leger; de engelen zijn Gods leger | geboorte stap 5 `fact` | Psalm 103:21. |
| Welbehagen = Gods goedheid en genade voor mensen | geboorte stap 5 `onthul` | gangbare gereformeerde lezing van de SV-tekst (‘in de mensen een welbehagen’); de andere lezing (‘mensen van het welbehagen’) is niet genoemd. |
| Vertroosting van Israël = de beloofde Verlosser | geboorte stap 9 `fact` | Lukas 2:25–26 (‘den Christus des Heeren’). |
| Het zwaard = verdriet om haar Zoon, bij het kruis | geboorte stap 9 `fact` | Lukas 2:35 met Johannes 19:25; zo bij Calvijn en Henry. |
| Dagorde = een van de 24 groepen priesters | aankondiging stap 1 `fact` | 1 Kronieken 24:10, 18–19. |
| Het reukofferaltaar stond in het heilige; het reukoffer morgen en avond, terwijl het volk bad | aankondiging stap 1 `fact` | Exodus 30:6–8; Lukas 1:10; Psalm 141:2. |
| Elias = Elia; Johannes is de beloofde bode | aankondiging stap 2 `fact` | Maleachi 4:5–6 met Lukas 1:17. |
| Zacharias en Elisabeth woonden in het bergland van Juda | aankondiging stap 3 `fact` | Lukas 1:39–40. |
| Geen kind hebben was een smaad | aankondiging stap 3 `fact` | Lukas 1:25; Genesis 30:23. |
| De zesde maand = sinds Elisabeth zwanger was | aankondiging stap 4 `fact` | Lukas 1:36. |
| Het Kind heeft geen aardse vader | aankondiging stap 5 `fact` | Lukas 1:34–35; Mattheüs 1:18, 20. |
| Dienstmaagd = dienares | aankondiging stap 5 `fact` | woorduitleg. |
| Elisabeth weet door de Heilige Geest Wie het Kind is | aankondiging stap 6 `fact` | Lukas 1:41–43. |
| Lofzang van Maria lijkt op die van Hanna | aankondiging stap 7 `fact` | 1 Samuël 2:1–8; algemeen opgemerkt. |
| Johannes = de HEERE is genadig | aankondiging stap 8 `fact`, wie | algemeen aanvaarde naamuitleg (Hebreeuws Jochanan). |
| Besnijdenis en naamgeving op de achtste dag | aankondiging stap 8, geboorte stap 7 | Genesis 17:12; Lukas 1:59; 2:21. |
| Hoorn = kracht; de Opgang uit de hoogte = het Licht van de Zaligmaker | aankondiging stap 9 `fact` | Lukas 1:69, 78; Maleachi 4:2 (kanttekeningen SV). |
| Ondertrouwd = al man en vrouw, nog niet samenwonend | aankondiging stap 10 `fact` | Mattheüs 1:19–20. |
| JEZUS = de HEERE maakt zalig (Griekse vorm van Jozua); Christus = Gezalfde = Messias | aankondiging stap 10 `onthul`, geboorte stap 7 `fact` | Mattheüs 1:21; Johannes 1:42 (Messias = Christus). |
| Door Jozef hoort het Kind bij het huis van David | aankondiging stap 10 `fact` | Mattheüs 1:20 (‘gij zone Davids’), 1:25 (Jozef geeft de naam); zo bij Calvijn en Henry. |

Bewust niet meeverteld (geen algemeen aanvaarde uitleg of volkstraditie): de tijd van het jaar, 25 december, winter of sneeuw;
os en ezel; een herbergier; een grot; hoe Maria reisde (geen ezel); de naam van de stad van Zacharias (Ein Karem staat alleen
in de bestaande plaatsbeschrijving van `nt1_judagebergte`); het precieze jaar; welke weg Jozef en Maria namen.
Bij Mattheüs 1:25 staat alleen wat de tekst zegt (‘Hij leeft niet met haar als man en vrouw, totdat …’), zonder iets te zeggen
over de tijd daarna.

## Personen

- `"kerst"` als laatste toegevoegd aan de `boek`-lijst van: `jezus`, `maria`, `jozef_nt`, `zacharias`, `elisabeth`,
  `johannes_doper`, `gabriel`, `simeon_nt`, `anna`.
- Nieuw (eind van `personen.js`): `augustus` (Lukas 2:1) en `cyrenius` (Lukas 2:2). Regels in `personen.txt` onder
  `# --- Kerst B`.
- Rollen en groepen in `who`: `Engel` (rol; de engel bij Zacharias, de engel van de Heere bij Jozef en bij de herders), `Engelen`,
  `Herders`, `Volk`, `Familie`. Geen nieuwe groepen.
- Naamgenoten: in `scripts/bijbelreis-personen-check.mjs` (VERWACHT) vier regels toegevoegd: `kerst|Maria` → `maria`,
  `kerst|Jozef` → `jozef_nt`, `kerst|Zacharias` → `zacharias`, `kerst|Simeon` → `simeon_nt`. Zonder die regels faalt de check
  zodra deze namen in het boek `kerst` staan. Als de collega van deel 1 Jozef de zoon van Jakob of Zacharia de profeet in het
  boek `kerst` opneemt, botsen die namen; dan moet daar een onderscheidende naam staan.
- `Johannes de Doper` staat in `who` als ‘Johannes de Doper’ (niet ‘Johannes’), zodat hij niet botst met andere Johannessen.
- Herodes staat niet in `who` van deze delen (alleen in de tijdNoot en de tekst van stap 1); hij hoort bij het deel van de wijzen.
- `kerst.wie` heeft negen regels van dit bestand. Ook ‘Maria’, ‘Jozef’ en ‘Jezus’ kunnen door de andere schrijvers in `wie`
  worden gezet; de integrator moet dubbelingen samenvoegen. Kleuren: `Augustus` en `Cyrenius` grijs (de rest bestond al).

## Twijfelpunten

1. **Volgorde van de droom van Jozef.** Mattheüs zegt niet wanneer precies; de stap staat na Lukas 1 (na de terugkeer van Maria,
   1:56: ‘zwanger bevonden’). Gangbaar, maar niet uit de tekst te bewijzen.
2. **Rome in stap 1 van de geboorte.** De kaart zoomt daardoor ver uit (Rome tot Nazareth). Bedoeld om te laten zien hoe ver het
   bevel kwam; wie dat te druk vindt, kan `at` terugbrengen tot `nt_nazareth`.
3. **Velden bij Bethlehem als gebied.** Het midden ligt bij de traditionele herdersvelden van Beit Sahour; omdat het een gebied is
   (`r`), wordt geen stip gesuggereerd.
4. **Welbehagen** (Lukas 2:14): uitgelegd als Gods goedheid en genade voor mensen (de lezing van de SV-tekst). De andere lezing
   is niet genoemd, volgens de redactieregel.
5. Het **reukoffer** ‘elke morgen en elke avond’ staat in de `fact` uit Exodus 30:7–8; dat Zacharias het in de middag of avond
   bracht staat er niet.

## Voor de tekenaar (geen afbeelding van God, de Heere Jezus, ook niet als Kind, of engelen)

### De aankondiging
1. **Een priester in de tempel**: de tempel in Jeruzalem van buiten, met een menigte biddende mensen op de voorhof; boven het
   heiligdom een dun sliertje rook. Eventueel de deur van het heilige, half open.
2. **De engel bij het altaar**: het reukofferaltaar (klein, vierkant, met hoorns aan de hoeken) met opstijgende rook, en een sterk
   licht aan de rechterkant; geen gestalte. Een priestergewaad dat terugwijkt aan de rand van het beeld.
3. **Zacharias kan niet spreken**: de tempeltrap met wachtend volk; een oude priester die met zijn handen gebaart (van achteren
   of van opzij gezien). Daarna een weg het bergland in.
4. **Gabriël naar Nazareth**: een klein dorp tegen een heuvel in Galilea, platte daken, een open deur met licht dat naar binnen
   valt. Geen engel.
5. **Bij God is niets onmogelijk**: een eenvoudig huisinterieur, een kruik en een weefgetouw; het licht in de deuropening dat
   wegtrekt.
6. **Maria gaat naar Elisabeth**: een smalle weg door het heuvelland, terrassen met olijfbomen; in de verte een dorp op een helling.
7. **De lofzang van Maria**: twee vrouwen in een binnenhof onder een olijfboom, van achteren of van ver gezien; avondlicht over de
   heuvels van Juda.
8. **Johannes is zijn naam**: een klein schrijftafeltje (een houten plankje met was) met de naam Johannes in Hebreeuwse letters;
   buren en familie in de deuropening.
9. **De lofzang van Zacharias**: een oude man met opgeheven handen op een dak of binnenhof; de opgaande zon boven de heuvels
   (‘de Opgang uit de hoogte’) als beeld, zonder iemand af te beelden.
10. **De droom van Jozef**: een timmermanswerkplaats in de nacht, gereedschap aan de wand, een slapende man op een mat; een
   streep licht door het raam.

### De geboorte in Bethlehem
1. **Het gebod van keizer Augustus**: een Romeinse munt of een stenen tafel met Latijnse letters; een bode die een rol voorleest
   op een dorpsplein.
2. **Van Nazareth naar Bethlehem**: een weg over de bergrug, mensen met bundels op weg; geen ezel nodig (de Bijbel noemt geen
   rijdier). Bethlehem op een heuvel in de verte.
3. **De geboorte**: een stal met een stenen of houten voederbak (kribbe) met stro en een paar witte doeken; een olielampje.
   Het Kind niet afbeelden: de kribbe van opzij of van achteren, of alleen de doeken op de rand. Geen os en ezel.
4. **Herders in het veld**: een kudde schapen op de heuvels in de nacht, een vuurtje, herders met staven; een groot licht dat
   over de velden valt. Geen engelgestalte.
5. **Het hemelse leger**: een sterrenhemel vol licht boven de velden, de herders klein en neergebogen op de voorgrond.
6. **De herders gaan naar Bethlehem**: herders die haastig een pad naar het stadje oplopen; later dezelfde herders die in de straat
   aan mensen vertellen.
7. **De achtste dag**: een eenvoudig huis in Bethlehem; op tafel een rol met de naam JEZUS in Hebreeuwse letters.
8. **Naar de tempel**: de weg van Bethlehem naar Jeruzalem; de tempel in de verte; een man met een klein kooitje met twee duiven.
9. **Simeon**: een oude man in de tempelhof, van achteren gezien, met de armen gevouwen alsof hij een bundel draagt (de bundel
   van achteren, geen gezicht); zuilengangen.
10. **Anna**: een oude vrouw in de zuilengang van de tempel, biddend; mensen om haar heen die luisteren.

## Controles

- `node --check` op `kerst-2.js`, `plaatsen.js`, `personen.js`, `dateringen.js`: in orde.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/kerst-2.txt`: 225 gecontroleerd, 0 mis.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt`: 1462 gecontroleerd, 0 mis.
- `node scripts/bijbelreis-personen-check.mjs`: Geen fouten.
- `npx vitest run tests/bijbelreis.test.ts`: 29 geslaagd, 1 overgeslagen (al zo).
- `node scripts/bijbelreis-check.mjs desktop`: Geen problemen gevonden.
- Kaart bekeken (eigen server op poort 8822, niveau c): stappen 2, 5, 6 van de aankondiging en 0, 1, 3, 5, 7 van de geboorte;
  geen consolefouten; routes en labels op de goede plek.
