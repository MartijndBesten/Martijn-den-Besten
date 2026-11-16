# Kerst: tweede lezing (15-11-2026)

Eindredactie van de zes Kerst-delen (`inhoud/kerst-1.js`, `kerst-2.js`, `kerst-3.js`, het boek `kerst.js`) en de nieuwe of
gewijzigde Kerst-personen en -plaatsen, zin voor zin naast de Statenvertaling (`node scripts/sv.mjs`). Maatstaf: de regels van
het thema (`docs/bijbelreis-kerst/README.md`), de schrijfopdracht, de schrijfwijzer en de nieuwe, leidende uitlegregel
(`docs/bijbelreis-uitleg/README.md`, branch `claude/bijbelreis-uitleg`): algemeen aanvaarde uitleg zonder voorbehoud meevertellen,
bij echt verschil alleen de tekst, geen overlevering, ook niet om te weerleggen.

Geen stappen toegevoegd, verwijderd of verplaatst; geen id's, ref's, coördinaten, routes, `at`, `zoom` of kleuren gewijzigd.

**Eerlijk over de bronnen:** de toets ‘algemeen aanvaard’ heb ik gedaan uit algemene kennis van de kanttekeningen, Calvijn en
Matthew Henry; ik heb die bronnen hier niet ingezien. Waar ik twijfelde of iets algemeen aanvaard is, heb ik het volgens §1 van de
uitlegregel als níet algemeen behandeld en alleen de tekst laten staan. Juist die punten staan onder ‘Twijfels’.

## Overzicht

| Deel | Herstellingen |
| --- | --- |
| `kerst-belofte` (en het boek) | 4 |
| `kerst-koningen` | 5 |
| `kerst-aankondiging` | 2 |
| `kerst-geboorte` | 1 |
| `kerst-wijzen` | 8 |
| `kerst-twaalf` | 11 |
| personen en plaatsen | 3 |
| documentatie | 3 regels in `docs/bijbelreis-kerst/README.md` |

## kerst-belofte (kerst-1.js) en het boek

1. **Datering, `tijd`** — was: `"van het begin tot ca. 1010 v.Chr."` → is: `"Oergeschiedenis · ca. 2091–1010 v.Chr."`.
   Reden (opdracht punt 9): `genesis:begin` heeft `tijd: null, tl: null` en geen regel in `dateringen.js`; het boek Genesis
   schrijft `"Oergeschiedenis · aartsvaders ca. 2166–1805 v.Chr."`. Dit deel begint in Genesis 1–11 en loopt door tot David.
   Daarom blijft `tl: null` (het staat net als `begin` bovenaan de tijdlijn, bij de delen zonder jaartal), maar de tekst volgt nu
   de vorm van het boek Genesis: oergeschiedenis zonder jaartal, en vanaf Abraham (ca. 2091, Genesis 12:4, zoals `ur-kanaan`)
   Bijbelse tijdrekening. De regel `["bijbel", true]` in `dateringen.js` blijft (de unittest eist een soort bij elk deel met
   `tijd`); het commentaar daar en bovenaan `dateringen.js` legt de uitzondering nu uit. Volledig als `begin` (`tijd: null`) zou
   de tijdlijn ‘Oergeschiedenis · geen jaartal’ tonen voor een deel dat bij David eindigt; dat is onjuist.
2. **Boek `kerst.js`, `tijd`** — was: `"van het begin tot ca. 8 n.Chr."` → is: `"Oergeschiedenis · ca. 2091 v.Chr. – 9 n.Chr."`.
   Zelfde vorm; eindjaar gelijk aan `kerst-twaalf` (`tl: [7, 9]`).
3. **tijdNoot** — was: “… voordat David op zijn dertigste koning werd (2 Samuël 5:4), in de gangbare chronologie ca. 1010
   v.Chr.” → is: “…(2 Samuël 5:4); dat was in de gangbare chronologie ca. 1010 v.Chr.” Reden: 1010 is het jaar dat David koning
   werd, niet het jaar van de zalving; zo staat het niet meer dubbelzinnig.
4. **Stap 1, onthul Henoch** — was: “Van hem staat er niet dat hij stierf: ‘want God nam hem weg’” → is: “Hij stierf niet: ‘God nam
   hem weg’ (5:24), ‘opdat hij den dood niet zou zien’ (Hebreeën 11:5).” Reden: uitlegregel §3, zeg wat er wél staat; Hebreeën
   11:5 geeft het antwoord zelf. Controleregel toegevoegd in `kerst-1.txt`.

Bewust laten staan:
- Stap 1 `txt` “Bij Henoch staat dat niet”: beschrijft het patroon van Genesis 5 (‘en hij stierf’), geen voorbehoud.
- Stap 0 (het Zaad is Christus), stap 4 (Moria = tempelberg), stap 6 (Silo is de Messias), stap 7 (Rachab uit Jericho is de
  moeder van Boaz): algemeen aanvaard, zonder voorbehoud verteld. Zo hoort het.
- tijdNoot “Er bestaan ook andere dateringen” en “In welk jaar David gezalfd werd, zegt de Bijbel niet”: uitlegregel §2.6
  (tijdlijn houdt haar zekerheid).

## kerst-koningen (kerst-1.js)

1. **Quiz** “Wat belooft God aan David?” — fout antwoord was: “Hij zal nooit meer oorlog hebben” → is: “Zijn zonen worden priesters
   in de tempel”. Reden: 2 Samuël 7:1 en 7:11 zeggen ‘u heb Ik rust gegeven van al uw vijanden’; het oude foute antwoord lag te
   dicht bij de tekst.
2. **Stap 4 (Micha), fact** — was: de hele vervulling bij Herodes (‘Te Bethlehem, in Judea gelegen …’, Mattheüs 2:5), die
   `kerst-wijzen` stap 2 opnieuw vertelt → is: “Eeuwen na Micha halen de overpriesters en schriftgeleerden dit woord aan, als
   koning Herodes vraagt waar de Christus geboren zou worden; dat staat verderop in dit thema, bij de wijzen (Mattheüs 2:4–6).”
   Johannes 7:42 blijft. Reden: dubbeling tussen delen (opdracht punt 8).
3. **Stap 5 (Jechonia), txt** — was: “Na drie maanden staat het leger van Nebukadnezar … voor Jeruzalem.” → is: “Hij regeert maar
   drie maanden: in die tijd belegert het leger van Nebukadnezar, de koning van Babel, Jeruzalem.” Reden: 2 Koningen 24:8, 10:
   ‘regeerde drie maanden’, ‘Te dier tijd … de stad werd belegerd’; het beleg kwam niet ná drie maanden. Controleregel
   toegevoegd.
4. **Stap 7, txt** — was: “Wat deze mannen deden en waar zij woonden, staat er niet bij.” → is: “Van deze mannen geeft de Bijbel
   alleen de namen.” Reden: §3, zeg wat er wél staat.
5. **Stap 8, txt** — was: “Er staat niet dat Jozef Jezus gewon: de Heere Jezus is de Zoon van God, geboren uit Maria.” → is: “Bij
   Jozef wisselen de woorden: niet ‘gewon’, zoals bij alle namen ervoor, maar ‘uit welke geboren is’. De Heere Jezus is de Zoon van
   God, geboren uit Maria.” Reden: geen voorbehoud maar de tekst zelf (Mattheüs 1:16); nu ook zo verteld.

Bewust laten staan:
- Stap 1 en 8: Mattheüs de lijn van Jozef (via Salomo), Lukas de lijn van Maria (via Nathan), Heli de vader van Maria: de
  gangbare lezing, zonder voorbehoud. `personen.js` is daarop aangepast (zie onder).
- Stap 2: ‘gewon’ betekent ook ‘was de voorvader van’ (vergelijking met 1 Kronieken 3): de tekst zelf.
- Stap 5 “In Babel wordt Sealthiël geboren”, stap 6 “Zerubbabel, de kleinzoon van koning Jechonia”: volgt Mattheüs 1:12;
  1 Kronieken 3:19 blijft in `personen.js` (basis) staan, niet in de vertelling.
- tijdNoot “in welk jaar daarvan God hem de belofte gaf, staat er niet”: §2.6.

## kerst-aankondiging (kerst-2.js)

1. **Stap 3, eerste zin** — was: “Zacharias vraagt de engel waaraan hij dit zal weten, want hij is oud en zijn vrouw ook.” → is:
   “Zacharias gelooft de engel niet, en daarom kan hij niet meer spreken. Hij vraagt waaraan hij dit zal weten, …” Reden: jonge
   kinderen zien alleen de eerste zin; ‘dit’ was zonder de vorige stap niet te begrijpen.
2. **Stap 5, eerste zin** — was: “Maria vraagt de engel hoe dit zal gebeuren, want zij is een maagd.” → is: “Maria vraagt de engel
   hoe zij een Kind zal krijgen, want zij is een maagd.” Zelfde reden (Lukas 1:34).

Bewust laten staan:
- Stap 7 fact “Maria kent de Schriften en zingt met de woorden ervan”: volgt uit de gelijkenis met 1 Samuël 2, algemeen opgemerkt.
- Stap 8 fact “daarom houden Elisabeth en Zacharias eraan vast”: de naam komt van de engel (1:13); gangbaar.
- Stap 10 “Ook Jozef krijgt een boodschap van God”: eerste zin is op zichzelf te begrijpen.

## kerst-geboorte (kerst-2.js)

1. **Stap 1, fact** — was: “… naar Bethlehem, de stad die de profeet Micha genoemd had (Micha 5:1).” → is: “… naar Bethlehem.”
   Reden: stap 2 citeert Micha 5:1 direct daarna; nu staat het één keer (opdracht punt 8).

Bewust laten staan:
- Stap 3 “Zo wordt Hij geboren in een stal” en onthul ‘Kribbe’ (voederbak, stal): algemeen aanvaarde uitleg van de kribbe
  (kanttekeningen, Calvijn, Henry). De oudere themaregel ‘geen stal als de tekst die niet noemt’ is door de uitlegregel
  vervangen; `docs/bijbelreis-kerst/README.md` is daarop aangepast. Geen os, ezel, herbergier, grot of seizoen.
- Onthul ‘Herberg’ (vol door de beschrijving) en ‘welbehagen = Gods goedheid en genade’: gangbaar, zonder voorbehoud.
- Stap 8 fact “Jozef en Maria zijn arm”: Leviticus 12:8 met Lukas 2:24.
- Stap 6 fact verwijst naar Lukas 2:51; in `kerst-twaalf` is de terugverwijzing naar 2:19 in de fact van stap 8 daarom
  geschrapt (de `cross` naar Lukas 2:19 blijft daar).

## kerst-wijzen (kerst-3.js)

1. **Wie-lijst ‘Wijzen’** — was: “… goud, wierook en mirre (2:11). Hoeveel het er waren en hoe zij heetten, zegt de Bijbel niet.” →
   is: “… goud, wierook en mirre (2:11).” Reden: §3; zonder de zin denkt een kind niets wat de tekst tegenspreekt, en de zin
   verwees alleen naar de overlevering (§2.3: ook niet noemen om te weerleggen). Wat er wél staat (drie geschenken) staat er al.
2. **Stap 1, fact** — was: “uit het land ten oosten van Israël, uit de streek van Babel en Perzië. Zij kennen de sterren. Ook
   Daniël stond eens aan het hoofd van zulke mannen …” → is: “uit de landen ten oosten van Israël, die de sterren kennen. Zulke
   wijzen waren er ook in Babel; Daniël stond eens aan het hoofd van hen …” Reden: over het land lopen de uitleggers uiteen (Perzië,
   Chaldea, Arabië; de schrijver noteerde dat zelf); dan alleen de tekst. Nu ook gelijk aan de wie-lijst.
3. **Stap 1, fact** — geschrapt: “Hoeveel wijzen er zijn en hoe zij heten, zegt Mattheüs niet.” Reden: als 1.
4. **Stap 2, fact** — was: “de profeet die zij aanhalen is Micha (Micha 5:1).” → is: “de profeet die zij aanhalen is Micha. Zijn
   woord over Bethlehem staat eerder in dit thema, bij de profeet Micha zelf (Micha 5:1).” Reden: punt 8, verwijzen in plaats van
   herhalen (`kerst-koningen` stap 4 vertelt Micha 5:1 voluit).
5. **Stap 5, fact** — geschrapt: “Er is sinds de geboorte enige tijd voorbijgegaan: Jozef en Maria wonen nu in een huis in
   Bethlehem.” Reden: wanneer de wijzen kwamen en of het gezin al ‘woonde’, daarover lopen de uitleggers uiteen (vóór of na de
   reiniging); de `txt` zegt wat er staat: ‘in het huis’ (2:11).
6. **Stap 6, eerste zin** — was: “Als de wijzen vertrokken zijn, verschijnt de engel van de Heere aan Jozef in een droom.” → is: “Een
   engel waarschuwt Jozef in een droom: hij moet met het Kind en Zijn moeder naar Egypte vluchten. Dat is als de wijzen vertrokken
   zijn.” Reden: de eerste zin moet de kern van de stap dragen (de vlucht).
7. **Stap 7, fact** — geschrapt: “Hoeveel kinderen het waren, zegt de Bijbel niet.” Reden: §3 (opdracht noemt dit geval). De stap
   blijft sober: geen getal, geen details.
8. **Stap 10, fact (Nazarener)** — was: de profeten zeggen dat Hij veracht zal zijn (Jesaja 53:3) en noemen Hem de Scheut,
   *netser*, die in de naam Nazareth klinkt (Jesaja 11:1; Jeremia 23:5) → is: “Mattheüs schrijft ‘de profeten’, in het meervoud:
   hier noemt hij niet één profeet bij name, zoals bij Jeremia. Nazareth was een plaats waar men op neerkeek: ‘Kan uit Nazareth iets
   goeds zijn?’, vraagt Nathanaël later (Johannes 1:46–47). Toch draagt de Heere Jezus die naam, tot op het kruis: … (Johannes
   19:19).” Reden: hoe Mattheüs 2:23 aan de profeten verbonden is, daarover geven de gezaghebbende uitleggers verschillende
   antwoorden naast elkaar (de Scheut van Jesaja 11:1, de verachting, de nazireeër); dan geen keuze, alleen de tekst. Controleregel
   voor Johannes 1:47 aangescherpt.

Bewust laten staan:
- Stap 1 “daar verwachten zij de Koning van de Joden te vinden”; stap 2 Herodes “vreest voor zijn troon”; stap 3 “hij meent het
  niet … heimelijk”: gangbaar en door Mattheüs 2:13, 16 gedragen.
- Stap 4 “de schriftgeleerden … gaan niet mee”: de tekst noemt hen niet bij Bethlehem; zo bij Calvijn en Henry. Zie twijfels.
- Stap 7: Jeremia 31:15 over de wegvoering, Rachel als moeder van het volk, troost in 31:16–17: gangbaar.
- Stap 9 (`fs: "h"`): Josephus over Archelaüs met eerlijke bronvermelding, §3 laatste rij.
- tijdNoot “Hoe lang Jozef in Egypte bleef, zegt de Bijbel niet” en “Er bestaan ook dateringen …”: §2.6.

## kerst-twaalf (kerst-3.js)

1. **stat** — was: “de eerste woorden van de Heere Jezus die in de Bijbel staan” → is: “de vroegste woorden …”. Reden: in de
   volgorde van de Bijbel staan er eerder woorden (Mattheüs 3:15); bedoeld is: in de tijd (twijfelpunt van de schrijver).
2. **Stap 1, fact** — was: “Lukas slaat hier over wat Mattheüs vertelt … Daarna woont het gezin weer in Nazareth” → is: “Over de
   wijzen, de vlucht naar Egypte en de terugkeer vertelt Mattheüs (Mattheüs 2). Lukas en Mattheüs komen allebei uit in Nazareth
   (Lukas 2:39; Mattheüs 2:23).” Reden: hoe Lukas 2:39 en Mattheüs 2 in de tijd passen, verschilt per harmonie; nu staat er alleen
   wat beide teksten zeggen.
3. **Stap 3, eerste zin** — was: “Als de dagen van het feest voorbij zijn, gaan Jozef en Maria terug naar huis. Maar het Kind Jezus
   blijft in Jeruzalem.” → is: “Na het feest gaan Jozef en Maria terug naar huis, maar het Kind Jezus blijft in Jeruzalem.” Reden:
   de kern moet in de eerste zin.
4. **Stap 4, fact** — geschrapt: “Pas als het gezelschap aan het eind van de dag halt houdt, blijkt dat Hij er niet is.” Reden:
   detail dat de tekst niet geeft (§2.4).
5. **Stap 5, eerste zin** — was: “Na drie dagen vinden Jozef en Maria Hem in de tempel.” → is: “… vinden Jozef en Maria de Heere
   Jezus in de tempel.” Reden: op zichzelf te begrijpen.
6. **Stap 5, fact** — geschrapt: “De drie dagen zijn: één dag heen, één dag terug, en op de derde dag vinden zij Hem.” Reden: hoe de
   drie dagen geteld worden, is niet eenduidig (vanaf het vertrek, of drie dagen zoeken in Jeruzalem); alleen de tekst ‘na drie
   dagen’.
7. **Stap 6, eerste zin** — was: “Als Jozef en Maria Hem daar zien, zijn zij verslagen.” → is: “Als Jozef en Maria de Heere Jezus
   in de tempel zien, zijn zij verslagen.” Reden: op zichzelf te begrijpen.
8. **Stap 8, fact** — geschrapt: “Ook na het bezoek van de herders bewaarde zij alles in haar hart (Lukas 2:19).” Reden: staat al
   in de `cross` van dit deel, en `kerst-geboorte` stap 6 verwijst al vooruit naar 2:51.
9. **Stap 9, fact** — was: Samuël-vergelijking (1 Samuël 2:26) en “Hierna vertelt de Bijbel niets meer over Hem tot …” → is: “Lukas
   spreekt hier over de Heere Jezus als mens. Over het kleine Kind schreef hij al dat Het vervuld werd met wijsheid en dat ‘de
   genade Gods’ over Hem was (Lukas 2:40). Nu staat er ook ‘in grootte’, en de genade is ‘bij God en de mensen’. Lukas gaat verder
   als Hij ‘omtrent dertig jaren oud’ is (Lukas 3:23).” Reden: de Samuël-zin stond bijna letterlijk ook in de `cross`; “de
   Bijbel vertelt niets meer” is een ‘zegt niet’-zin.
10. **Quiz** “Wat deed Hij in het midden van de leraren?” — fout antwoord was: “Hij sliep” → is: “Hij zat stil en zei niets”.
    Reden: niet belachelijk, wel aantoonbaar fout (Lukas 2:46–47).
11. **Quiz** — was: “Wat zei de Heere Jezus tegen Jozef en Maria?” met als foute antwoorden verzonnen woorden in Zijn mond (“Ik was
    de weg kwijt.”) → is: “Waar moest de Heere Jezus zijn, zei Hij tegen Jozef en Maria?” — “In de dingen van Zijn Vader” / “Bij de
    familie in het reisgezelschap” / “Bij de herders in Bethlehem”. Reden: eerbied; geen verzonnen uitspraken van de Heere Jezus,
    ook niet als fout antwoord.

Bewust laten staan:
- Stap 7 `txt` “Zijn Vader is God, en de tempel is het huis van Zijn Vader” (twijfelpunt van de schrijver): algemeen aanvaard
  (Johannes 2:16) en voor kinderen nodig om 2:49 te begrijpen; volgens de uitlegregel mag het in de vertelling.
- Stap 2 “Maria gaat elk jaar mee”, “opgaan”; stap 4 reisgezelschap uit één streek; stap 8 vijfde gebod: gangbaar.
- Stap 6 fact Lukas 3:23 ‘alzo men meende’ staat ook in `kerst-koningen` stap 8, maar in een ander verband (Maria zegt ‘Uw vader’);
  geen herhaling van dezelfde uitleg.

## Personen en plaatsen

1. **`personen.js`, `jozef_nt.kort`** — was: “Mattheüs noemt Jakob als zijn vader (Mattheüs 1:16); in het geslachtsregister van
   Lukas staat na Jozef ‘den zoon van Heli’ (Lukas 3:23). Hoe die twee geslachtsregisters samenhangen, zegt de Bijbel niet.” → is:
   “Mattheüs geeft zijn geslachtsregister: de lijn van de koningen, via Salomo, met Jakob als zijn vader (Mattheüs 1:16). Lukas
   geeft de lijn van Maria, via Nathan; Heli is de vader van Maria en de schoonvader van Jozef (Lukas 3:23).” Het commentaar erboven
   is aangepast. Geen `v` toegevoegd (Jakob, de vader van Jozef, is geen persoon in de app). Consistent met `kerst-koningen`.
   `nt-geboorte` (`nt-jezus-1.js`) is nagelezen: daar staat niets over de twee registers; de stat “Lukas vertelt over de geboorte
   vanuit Maria, Mattheüs vanuit Jozef” sluit er juist bij aan. Niets aangepast.
2. **`personen.js`, `rachab.elders` (Mattheüs 1:5)** — was: “… heet de moeder van Boaz Rachab; dat is vermoedelijk deze Rachab (dat
   volgt uit de naam en de tijd, het staat er niet letterlijk).” → is: “In het geslachtsregister van de Heere Jezus is zij de moeder
   van Boaz: ‘Salmon gewon Booz bij Rachab’.” Reden: Rachab heeft nu het boek `kerst`, en `kerst-belofte` stap 7 vertelt het als
   gangbare lezing; ‘vermoedelijk’ botste daarmee. De `basis`-velden (grondslag van de stamboomlijn, ‘a’ = afgeleid) bij `rachab` en
   `salmon` blijven: dat is verantwoording zoals de zekerheid op de kaart (§2.6), geen vertelling.
3. **`plaatsen.js`, `kb_herdersveld.d`** — was: “Ook David weidde hier de schapen van zijn vader (1 Samuël 17:15).” → is: “… weidde
   bij Bethlehem …”. Reden: 1 Samuël 17:15 zegt ‘te Bethlehem’, niet dit veld.

Nagelezen zonder wijziging: `thamar`, `perez`, `achaz`, `micha`, `augustus`, `cyrenius`, `archelaus`, `ka_moreseth`, `kc_rama`.

## Documentatie

`docs/bijbelreis-kerst/README.md`: de themaregels ‘geen stal als de tekst die niet noemt’ en ‘twee geslachtsregisters … zonder
te kiezen’ in lijn gebracht met de leidende uitlegregel; bij stap 5 van de werkwijze een verwijzing naar dit verslag.

## Twijfels (voor de eigenaar of een predikant)

1. **Geschrapte uitleg** (wijzen 5 ‘enige tijd na de geboorte, in een huis’; wijzen 10 *netser*/veracht; twaalf 5 telling van de
   drie dagen; twaalf 1 ‘Lukas slaat over’). Ik schrapte omdat ik twijfelde of de uitleg algemeen is (§1: dan is het dat niet). Wie
   bij de kanttekeningen nagaat dat ze eenduidig zijn, kan ze terugzetten; de oude tekst staat in de diff van deze commit.
2. **Stal** (geboorte 3): bewust laten staan als algemeen aanvaard; de oude themaregel zei het tegendeel. Niet bij de bron nagekeken.
3. **Schriftgeleerden gaan niet mee** (wijzen 4): argument uit stilte, maar bij Calvijn en Henry zo; laten staan.
4. **Datering `kerst-belofte`**: gekozen voor `tl: null` met een tijd die met ‘Oergeschiedenis’ begint, naar het boek Genesis.
   Het alternatief (geheel als `begin`) zou de tijdlijn ‘Oergeschiedenis · geen jaartal’ laten tonen voor een deel tot David.
5. **Buiten Kerst gezien, niet aangepast:** `nt-geboorte` (pakket u07) heeft nog “De Bijbel zegt niet hoeveel wijzen er waren, en
   ook niet uit welk land ze kwamen” en twee keer “zegt de Bijbel niet; de route is een reconstructie”. Dat hoort bij de
   uitlegronde van u07.
6. De notities van de schrijvers (`kerst-*.notities.md`) noemen de geschrapte punten nog als ‘meeverteld’; ik heb die
   werkdocumenten niet herschreven, dit verslag is leidend.

## Controles

```
kerst-1.txt     274 gecontroleerd, 0 mis
kerst-2.txt     225 gecontroleerd, 0 mis
kerst-3.txt     126 gecontroleerd, 0 mis
personen.txt   1483 gecontroleerd, 0 mis
bijbelreis-personen-check.mjs   Geen fouten.
npx vitest run                  9 bestanden geslaagd; 128 geslaagd, 1 overgeslagen
bijbelreis-check.mjs desktop    Geen problemen gevonden.
```
