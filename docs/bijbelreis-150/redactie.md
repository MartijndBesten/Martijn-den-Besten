# Redactieronde: de 150 geschiedenissen

Eindredactie van alle 150 records in `public/bijbelreis/geschiedenissen/{ot-1,ot-2,ot-3,nt-1,nt-2,nt-3,nt-4}.js`, getoetst aan de Statenvertaling (editie 1888, `public/bijbelreis/bijbel/`). Gewijzigd zijn alleen `uitleg`, `betekenis`, `quiz`, `ontdek` en `cross`-toelichtingen; `nr`, `ref`, `stappen`, `kw`, `vorm`, `tl`/`tijd`/`tijdNoot` en de kernwoord-records zijn ongemoeid gelaten (de kernwoorden zijn gelezen en in orde bevonden).

## Werkwijze en controle

- Alle 150 records en alle 47 kernwoorden volledig gelezen; per record gecontroleerd op leesbaarheid (8–14 jaar), toon, inhoud tegen de genoemde Bijbeltekst, vragen, herhaling en kernwoord.
- Elke gewijzigde of nieuwe feitelijke claim, elk nieuw of aangepast citaat en elke nieuwe verwijzing staat in `scripts/bijbel-controle/redactie.txt` (483 regels). `python3 scripts/bijbel-check.py scripts/bijbel-controle/redactie.txt` → **483 gecontroleerd, 0 mis**. De bestaande groepscontroles (`ot-1.txt` … `nt-4.txt`) blijven 0 mis.
- `npx vitest run tests/bijbelreis.test.ts` slaagt (16 + de 150-test met `BIJBELREIS_150=1`: 17/17). `node --check` op alle zeven bestanden: geen fouten.
- Les uit deze ronde: veel citaten ‘uit het hoofd’ wijken af van de 1888-tekst (bijv. Genesis 3:19 ‘want gij zijt stof’, Numeri 13:33, Numeri 21:5). Daarom is elk citaat dat in deze ronde is aangeraakt, letterlijk tegen de JSON-tekst gecontroleerd.

## Wat er in het algemeen veranderde

1. **Leesbaarheid.** De grootste zwakte was zinslengte: ongeveer 300 zinnen van meer dan 25 woorden (ruwe telling), sommige van 40–65 woorden (vooral ot-1, ot-2, nt-4). Die zijn in korte zinnen gesplitst, zonder inhoud weg te laten. Moeilijke woorden zijn kort uitgelegd waar ze voor het eerst voorkomen (maagschap, vroedvrouwen, verstokken, volkomen lam, bovendorpel, gomer, diensthuis, losser, tergen, zottelijk, verbannen, week hart, verontreinigen, slijk, ooilam). Over zijn nog 24 zinnen van 26–36 woorden; dat zijn bijna allemaal `betekenis`-zinnen met een verwijzing tussen haakjes of een opsomming (de Tien Geboden), bewust zo gelaten.
2. **Toon.** Hoofdletters bij God en de Heere Jezus waren al consequent (geautomatiseerd nagelopen: geen fouten). Enkele platte woorden vervangen: ‘stiekem’, ‘voor de gek houden’, ‘de baas over de tollenaars’, ‘wordt daar boos om’ (bij de Heere Jezus → ‘neemt het zeer kwalijk’, SV), ‘zijn mond houden’, ‘ruzie’. Waar de auteurstekst ‘Jezus’ los gebruikte, staat nu ‘de Heere Jezus’ (namen als ‘Jezus van Nazareth’ en citaten niet). Moraliserende ‘jij moet’-zinnen kwamen niet voor.
3. **Inhoud.** Eén echte fout en een handvol onnauwkeurigheden hersteld (zie per verhaal; gemarkeerd met INHOUD of FOUT HERSTELD). Twee `betekenis`-teksten waren theologisch te stellig of te eigen geformuleerd (70 genade ‘als hij zich bekeert’; 55 ‘geen nieuwe kans’).
4. **Vragen.** De vragen zijn over het algemeen goed: ondubbelzinnig, gevarieerd van vorm (‘Wie zei…’ komt maar enkele keren voor als vraag; de wie-zei-oefeningen zitten in `ontdek`) en met kloppende `why`. Het grootste probleem was dat het goede antwoord vaak veel langer en preciezer was dan de foute, waardoor kinderen het ‘langste antwoord’ leren kiezen (de app schudt de volgorde, maar niet de lengte). Bij 53 vragen zijn de foute antwoorden langer en plausibeler gemaakt; drie foute antwoorden waren dubbelzinnig of een strikvraag (15, 61, 73) en één was jolig (60 ‘hardloopwedstrijd’).
5. **Herhaling.** Weinig: geen dubbele zinnen tussen verhalen. Twee dubbele kruisverwijzingen vervangen (46, 116). De herhaalde samenvatting van het grote gebod (29, 109, 110, 120) en Johannes 1:29 bij 13, 25 en 87 zijn inhoudelijk telkens op hun plaats en bewust gebleven.

## Per verhaal

### ot-1 (1–31)

- **1** — lange opsommingszin van de scheppingsdagen in drieën gesplitst.
- **2** — uitleg in kortere zinnen (hof, bomen, rib). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 3.
- **3** — uitleg gesplitst; vonnis over de man aangevuld met het letterlijke SV-citaat ‘want gij zijt stof, en gij zult tot stof wederkeren’ (3:19).
- **4** — uitleg gesplitst (offers, moord, teken, Nod); Lamech als ‘ook uit die familie’ verduidelijkt.
- **5** — zin over ark/dieren gesplitst.
- **6** — geen wijziging (goed leesbaar, inhoud klopt).
- **7** — ‘stoppen met bouwen’ → ‘houden op met bouwen’ (minder plat).
- **8** — uitleg gesplitst; ‘maagschap’ uitgelegd; altaren bij Sichem en tussen Bethel en Ai apart. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 3.
- **9** — geen wijziging.
- **10** — lange uitleg (13 zinsdelen) in korte zinnen; ‘gasten zijn engelen’ apart; Lots dochters feitelijk maar kort (zie twijfelpunten). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1, vraag 4.
- **11** — uitleg gesplitst (Eliëzer, sterren, verbond, naamgeving). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **12** — zin over Hagar onder de struik gesplitst.
- **13** — altaar/ram-zin gesplitst.
- **14** — gebed bij de put en slotzin gesplitst.
- **15** — INHOUD: ‘Jakob woont liever in de tenten’ (eigen invulling) → ‘is een oprecht man en woont in tenten’ (25:27); bedrog-zin gesplitst, ‘blinde’ → ‘kan niet meer zien’ (27:1). QUIZ vraag 3: fout antwoord ‘Jij bent zeker Ezau’ lag te dicht bij wat Izak werkelijk vroeg (27:24: ‘Zijt gij mijn zoon Ezau zelf?’) en is vervangen.
- **16** — uitleg gesplitst; ‘gehaat’ uitgelegd als ‘minder bemind’ en ‘Jakob heeft Rachel meer lief dan Lea’ (29:30) toegevoegd. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 4.
- **17** — uitleg gesplitst; ‘stiekem’ → ‘zonder het Laban te zeggen’ (31:20); ‘raakt Hij’ met hoofdletter (de Man bij de Jabbok).
- **18** — uitleg gesplitst (dromen, put, verkoop, rok).
- **19** — uitleg gesplitst.
- **20** — uitleg gesplitst (beker, Juda, bekendmaking).
- **21** — uitleg gesplitst; ‘vroedvrouwen’ uitgelegd.
- **22** — uitleg gesplitst.
- **23** — uitleg gesplitst; INHOUD: ‘God laat Aäron voor hem spreken’ preciezer: Mozes vraagt iemand anders te zenden, de HEERE wordt toornig en geeft Aäron (4:13–14).
- **24** — uitleg gesplitst; plagenlijst in twee zinnen; ‘verstokken’ uitgelegd.
- **25** — uitleg gesplitst; ‘volkomen lam’ en ‘bovendorpel’ uitgelegd. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1.
- **26** — uitleg gesplitst; lied letterlijk volgens SV (‘het paard en zijn ruiter heeft Hij in de zee geworpen’).
- **27** — uitleg gesplitst; ‘gomer’ uitgelegd; sabbatsregel preciezer (dubbel verzamelen, bederft niet: 16:24). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 4.
- **28** — zin over Aäron en Hur gesplitst.
- **29** — uitleg gesplitst; ‘diensthuis’ uitgelegd. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 5.
- **30** — uitleg gesplitst; ‘gooit kapot’ → ‘werpt neer, en ze breken’ (32:19); ‘reien’ → ‘het dansen’.
- **31** — uitleg gesplitst (Bezaleël, gaven, voorwerpen, wolk).

### ot-2 (32–64)

- **32** — geen wijziging. betekenis in twee zinnen gesplitst.
- **33** — sprinkhanen-zin als letterlijk SV-citaat (13:33).
- **34** — INHOUD: niet alleen Mozes maar ‘Mozes en Aäron’ mogen het volk niet inbrengen, ‘omdat ze Hem niet geloofd hebben’ (20:12); niet-letterlijk citaat ‘Wij walgen van dit lichte brood!’ vervangen door SV ‘onze ziel walgt over dit zeer lichte brood’ (21:5); zinnen gesplitst.
- **35** — twee lange zinnen gesplitst.
- **36** — slotzin gesplitst.
- **37** — slotzinnen gesplitst.
- **38** — zin over het water bij Adam gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1, vraag 4.
- **39** — zin over de opdracht bij Jericho herschreven.
- **40** — bekentenis van Achan gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **41** — uitleg gesplitst.
- **42** — uitleg gesplitst.
- **43** — INHOUD/leesbaarheid: ‘die verstopt tarwe dorst’ → ‘dorst tarwe bij de wijnpers, om het te verbergen voor de Midianieten’ (6:11). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 3, vraag 5.
- **44** — zin over Timna gesplitst.
- **45** — slotzin gesplitst.
- **46** — ‘houdt haar voor de gek’ → ‘misleidt haar’ (16:10); zinnen gesplitst. cross: dubbele verwijzing ‘Hebreeën 11:32 – Simson bij de gelovigen’ (stond ook bij 44) vervangen door Richteren 13:5. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1.
- **47** — ‘losser’ uitgelegd (Ruth 2:20; 4:5).
- **48** — ‘tergt’ uitgelegd; ‘rent’ → ‘loopt’ (3:5).
- **49** — uitleg gesplitst; INHOUD betekenis: de verwijzing ‘(4:3, 10–11)’ bewees niet dat het volk andere goden diende; nu 4:3 + 7:3–4.
- **50** — zin over Saul gesplitst.
- **51** — ‘zottelijk’ en ‘verbannen’ uitgelegd; INHOUD: ‘gekweld door een boze geest’ → ‘verschrikt door een boze geest van de HEERE’ (16:14, niets afgezwakt). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 4.
- **52** — harnas-zin gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **53** — geen wijziging. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2, vraag 3.
- **54** — Gath/Adullam gesplitst.
- **55** — uitleg gesplitst; betekenis: eigen conclusie ‘na de dood komt er geen nieuwe kans’ vervangen door het citaat zelf (Hebreeën 9:27). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **56** — zin over Isboseth gesplitst.
- **57** — zin over Obed-Edom gesplitst.
- **58** — INHOUD: ‘laat haar halen’ → ‘laat haar halen en doet overspel met haar’ (11:4; anders klopte ‘als zij zwanger blijkt’ niet voor kinderen); ‘ooilam’ uitgelegd. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1, vraag 3.
- **59** — INHOUD: ‘Joab doodt hem’ → Joab steekt drie pijlen in zijn hart, zijn wapendragers doden hem (18:14–15); vraag 4 aangepast (‘Wie stak drie pijlen…’) en fout antwoord David → Abisaï.
- **60** — zwaard-zin aangevuld met ‘in tweeën delen’ (3:25); vraag 4: jolig fout antwoord ‘hardloopwedstrijd’ en dubbelzinnig ‘met een leger’ (10:2: ‘met een zeer zwaar heir’) vervangen.
- **61** — twee zinnen gesplitst. QUIZ vraag 4: fout antwoord ‘Vuur’ was dubbelzinnig (2 Kronieken 7:1: vuur viel uit de hemel bij de inwijding) en is vervangen; vraag 2: foute antwoorden langer/plausibeler gemaakt.
- **62** — uitleg gesplitst.
- **63** — zin over Krith/Zarfath gesplitst.
- **64** — twee lange zinnen gesplitst.

### ot-3 (65–79)

- **65** — uitleg gesplitst (kroning, tempelherstel, Hazaël).
- **66** — twee lange zinnen gesplitst.
- **67** — uitleg gesplitst (Rabsake, gebed, 185.000, ziekte, gezanten).
- **68** — ‘week’ uitgelegd; Hulda/verbond-zinnen gesplitst.
- **69** — ‘Joppe’ → ‘Jafo (Joppe)’, zoals de SV in Jona 1:3; vis-zin gesplitst.
- **70** — zinnen gesplitst; THEOLOGIE betekenis: ‘Genade is dat God spaart wie straf verdient, als hij zich bekeert’ maakte genade voorwaardelijk; nu ‘Genade is dat God spaart wie straf verdient’ + Jona 4:2.
- **71** — uitleg gesplitst (Zedekia, Jeremia, Ebed-Melech, Jojachin). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1, vraag 2.
- **72** — geen wijziging.
- **73** — ‘verontreinigen’ uitgelegd; zinnen over droom en beeld gesplitst. QUIZ vraag 5: fout antwoord ‘Stof dat wegwaaide’ was een strikvraag (zo verging het beeld, Daniël 2:35) en is vervangen.
- **74** — uitleg gesplitst; ‘en zelfs als Hij dat niet doet’ los gezet (3:18). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 3.
- **75** — uitleg gesplitst; de straf voor de aanklagers met vrouwen en kinderen blijft (6:25; zie twijfelpunten).
- **76** — uitleg gesplitst.
- **77** — zin over Esther en Mordechai gesplitst; ‘Pur’ tussen haakjes.
- **78** — zeer lange uitleg (zinnen van 40+ woorden) volledig in korte zinnen.
- **79** — zin over Koning op de ezel gesplitst.

### nt-1 (80–99)

- **80** — zin over Gabriël gesplitst; reden van het zwijgen expliciet (‘omdat Zacharias het niet gelooft’, 1:20).
- **81** — uitleg gesplitst (Gabriël, naam, Koninkrijk, droom van Jozef).
- **82** — profetie van Zacharias in twee zinnen.
- **83** — geen wijziging.
- **84** — geen wijziging.
- **85** — ster/aanbidding gesplitst; ‘vallen neer’ toegevoegd (2:11).
- **86** — ‘gehoorzaam’ → ‘onderdanig’ (SV 2:51); slotzin gesplitst.
- **87** — geen wijziging.
- **88** — derde verzoeking gesplitst.
- **89** — geen wijziging.
- **90** — geen wijziging. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 3.
- **91** — geen wijziging.
- **92** — uitleg in korte zinnen (geven/bidden, zorgen, twee bouwers). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 3.
- **93** — uitleg gesplitst.
- **94** — geen wijziging.
- **95** — uitleg gesplitst.
- **96** — geen wijziging. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **97** — gelijkenis van de twee schuldenaars gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 4.
- **98** — lange zinnen over Jaïrus en de zieke vrouw gesplitst.
- **99** — de vier soorten grond elk in een eigen zin; tikfout ‘maar maar’ in fout antwoord vraag 4 hersteld.

### nt-2 (100–117)

- **100** — twee lange zinnen gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **101** — uitleg gesplitst.
- **102** — zieke man/vraag gesplitst.
- **103** — uitleg gesplitst; ‘slijk’ uitgelegd.
- **104** — uitleg gesplitst; ‘Zij begrijpen niet’ → ‘De Farizeeën begrijpen niet’ (wie ‘zij’ waren was onduidelijk).
- **105** — lijdensaankondiging in eigen zinnen. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 4.
- **106** — Petrus-zin en slotzin gesplitst. ontdek: ‘God over Jezus’ → ‘over de Heere Jezus’.
- **107** — ‘wordt daar boos om’ → ‘neemt hun dat zeer kwalijk’ (SV 10:14, eerbiediger); uitleg gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **108** — lijdensaankondiging en antwoord over de plaatsen gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 3, vraag 4.
- **109** — gelijkenis in korte zinnen.
- **110** — geen wijziging. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **111** — uitleg gesplitst; ‘boos’ → ‘toornig’ (14:21). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1.
- **112** — uitleg gesplitst; betekenis: ‘lijkt op de Farizeeën’ → ‘doet denken aan’ (voorzichtiger; de tekst legt dat verband niet letterlijk).
- **113** — zin over de Samaritaan gesplitst; ontdek: ‘aan Jezus’ voeten’ → ‘aan de voeten van de Heere Jezus’ (eerbiedige vorm, consequent).
- **114** — geen wijziging. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1.
- **115** — twee lange zinnen gesplitst.
- **116** — ‘willen dat hij zijn mond houdt’ (plat) → ‘bestraffen hem: hij moet zwijgen’ (10:48); slotzin gesplitst. cross: Jesaja 35:5 (stond ook bij 103) vervangen door Psalm 146:8.
- **117** — ‘de baas over de tollenaars’ → ‘de overste van de tollenaars’ (19:2); ‘wat hij fout deed’ → ‘wat hij verkeerd gedaan had’.

### nt-3 (118–133)

- **118** — opdracht voor de ezelin gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 4.
- **119** — ‘zijn daar boos over’ → ‘nemen dat zeer kwalijk’ (21:15).
- **120** — uitleg gesplitst; ‘vragen waarmee ze Hem willen vangen’ helderder.
- **121** — voetwassing in korte zinnen; Petrus’ antwoord letterlijker (‘niet alleen mijn voeten’, 13:9). betekenis: lange parafrase van Markus 10:45 vervangen door het letterlijke citaat. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **122** — slotzin gesplitst.
- **123** — INHOUD: ‘iemand slaat met een zwaard een oor af’ → ‘de dienstknecht van de hogepriester een oor af’ (14:47); ‘laten Hem in de steek’ → ‘verlaten Hem’ (14:50).
- **124** — geen wijziging. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1.
- **125** — uitleg gesplitst; ‘brengt het volk in de war’ → ‘op een verkeerde weg’ (23:2 ‘verkeert’). fout antwoord vraag 2: ‘Jezus’ → ‘de Heere Jezus’.
- **126** — FOUT HERSTELD: ‘met twee anderen aan elke kant’ (las als vier) → ‘met twee anderen, aan elke kant één’ (19:18); uitleg gesplitst.
- **127** — uitleg gesplitst (benen, speer, Jozef, Nicodemus).
- **128** — aardbeving/engel en slotzin gesplitst.
- **129** — zin over het lege graf gesplitst.
- **130** — uitleg gesplitst.
- **131** — zending en Thomas-zinnen gesplitst.
- **132** — uitleg gesplitst.
- **133** — uitleg gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2, vraag 4.

### nt-4 (134–150)

- **134** — geen wijziging.
- **135** — ‘Jullie hebben Hem…’ als losse indirecte rede ingeleid (‘Hij zegt tegen de mensen’); betekenis: dubbel ‘de belofte is ‘u komt de belofte toe’’ opgeschoond. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 4.
- **136** — uitleg gesplitst; ‘Petrus' schaduw’ → ‘de schaduw van Petrus’. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 3.
- **137** — uitleg gesplitst (medeweten van Saffira apart); cross: ‘stiekem’ → ‘in het geheim’.
- **138** — uitleg gesplitst. fout antwoord vraag 3 en uitleg: ‘Jezus’ → ‘de Heere Jezus’. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 1, vraag 3.
- **139** — uitleg gesplitst.
- **140** — uitleg gesplitst.
- **141** — uitleg gesplitst; ‘Petrus' verhaal’ → ‘het verhaal van Petrus’. ‘over Jezus’ → ‘over de Heere Jezus’.
- **142** — uitleg gesplitst. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 3.
- **143** — uitleg gesplitst; INHOUD: ‘ontsnapt hij in een mand’ → ‘laten de discipelen hem in een mand langs de muur zakken’ (9:25). QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 2.
- **144** — uitleg gesplitst.
- **145** — uitleg gesplitst.
- **146** — uitleg gesplitst; ‘ruzie’ → ‘onenigheid’ (23:7 ‘tweedracht’); ‘Paulus' zus’ → ‘de zus van Paulus’.
- **147** — uitleg gesplitst (storm, engel, schipbreuk).
- **148** — uitleg gesplitst.
- **149** — uitleg gesplitst. cross: ‘wees op Jezus’ → ‘wees op de Heere Jezus’. QUIZ: te zwakke of verraderlijk korte foute antwoorden vervangen bij vraag 4.
- **150** — uitleg gesplitst.

## Twijfelpunten voor Martijn

1. **Hoe expliciet bij gevoelige geschiedenissen?** De lijn is nu: feitelijk en kort benoemen wat de tekst zegt, zonder uit te weiden. Het betreft vooral: 10 (Lots dochters worden zwanger van hun vader), 19 (vrouw van Potifar: ‘wil dat Jozef met haar zondigt’), 58 (nieuw: ‘doet overspel met haar’ – eerder stond er alleen ‘laat haar halen’, waardoor ‘als zij zwanger blijkt’ voor kinderen onbegrijpelijk was), 37 en Hebreeën 11:31 (‘Rachab, de hoer’ in een SV-citaat), 40 (Achan ‘met zijn kinderen’ gestenigd en verbrand), 71 (zonen van Zedekia voor zijn ogen gedood, blind gemaakt), 75 (aanklagers met vrouwen en kinderen in de kuil), 46 (ogen uitgestoken), 23 (Exodus 4:24–26), 100 (onthoofding), 137 (Ananias en Saffira). Wil je bij 10 en 58 voor 8-jarigen een mildere omschrijving, of juist zo laten omdat niets afgezwakt mag worden?
2. **Endor (55).** De uitleg zegt, met de tekst: ‘Samuël zegt tegen hem…’ (1 Samuël 28:15–16). Een deel van de uitleggers, ook in de reformatorische traditie, leest dit als een verschijning door de duivel in de gedaante van Samuël, niet als Samuël zelf (graag zelf nagaan in de Kanttekeningen). Moet de uitleg dat verschil noemen (bijvoorbeeld ‘een gestalte die Samuël genoemd wordt’) of de tekst volgen zoals nu?
3. **Kernwoord ‘geloof’.** ‘Het geloof zelf is een gave van God’ steunt op Efeze 2:8; uitleggers verschillen of ‘dat’ daar op het geloof of op de zaligheid slaat. Voor de reformatorische doelgroep klopt de uitspraak met de belijdenis; wil je er Filippenzen 1:29 bij als duidelijker bewijstekst?
4. **Kernwoord ‘sabbat’.** Er staat feitelijk dat de eerste christenen samenkwamen op de eerste dag van de week. Of de zondag ‘de christelijke sabbat’ is, wordt niet gezegd; wil je dat (confessioneel) wél, of bewust neutraal laten voor de bredere doelgroep?
5. **Mattheüs 16:18 (105).** ‘Op deze petra zal Ik Mijn gemeente bouwen’ staat er zonder uitleg. Ouders kunnen vragen wat ‘deze petra’ is (Petrus zelf of zijn belijdenis); een korte neutrale toelichting toevoegen of niet?
6. **Lengte van `uitleg`.** Het schema vraagt 5–9 zinnen. Door het splitsen hebben veel verhalen nu 10–16 korte zinnen, met dezelfde inhoud. Inkorten kan alleen door inhoud weg te laten (bijv. 10, 29, 30, 78, 144 bevatten twee of drie hoofdstukken). Liever korte zinnen en volledige inhoud (huidige keuze), of per verhaal schrappen?
7. **Tijdnoten (niet bewerkt, buiten opdracht).** Bij 72 staat dat ‘veel bijbelwetenschappers’ Jesaja 40–43 later dateren; bij 42–47 en 32–41 wordt steeds de alternatieve 13e-eeuwse uittocht genoemd. Inhoudelijk eerlijk, maar wil je dat in een kinderatlas zo vaak terugkomt?
8. **Vragen met getallen.** ‘Hoe lang/Hoe oud/Hoeveel’ maakt ongeveer een kwart van de vragen uit. Voor 8–14 is dat goed te toetsen, maar het vraagt veel feitenkennis; wil je dat aandeel omlaag ten gunste van ‘waarom’-vragen?

## Eindoordeel per groep

| Groep | Oordeel | Reden |
| --- | --- | --- |
| ot-1 (1–31) | **sterk** | Inhoudelijk zorgvuldig, rijke en correcte SV-citaten, `betekenis` steeds met Bijbelverwijzing. Leesbaarheid was zwak (zinnen tot 67 woorden) en is nu op niveau; één eigen invulling (15) hersteld. |
| ot-2 (32–64) | **sterk** | Compact en helder, goede vragen. Enkele onnauwkeurigheden (34 Mozes én Aäron; 59 Absalom; niet-letterlijk citaat bij 34) en één jolig fout antwoord (60) hersteld. |
| ot-3 (65–79) | **sterk** | Goede verbanden-oefeningen en eerlijke tijdnoten; 78 was te dicht (zinnen van 40+ woorden), nu opgeknipt. Eén betekenis (70) theologisch scherper gemaakt. |
| nt-1 (80–99) | **sterk** | Al goed leesbaar, eerbiedig, vragen gevarieerd. Alleen zinsbouw en één tikfout. |
| nt-2 (100–117) | **sterk** | Gelijkenissen worden uitgelegd met de eigen woorden van de Heere Jezus; enkele platte formuleringen vervangen. |
| nt-3 (118–133) | **sterk** | Eerbiedig en citaatvast; één echte fout (126: ‘twee anderen aan elke kant’) en enkele vage zinnen hersteld. |
| nt-4 (134–150) | **voldoende** | Inhoud klopt en vragen zijn goed, maar de records zijn zeer vol (Handelingen 9–14 in één verhaal, Openbaring 1–20 in één) en de uitleg was in lange reeksen geschreven. Na het splitsen leesbaar, maar voor 8-jarigen nog stevig; zie twijfelpunt 6. |
