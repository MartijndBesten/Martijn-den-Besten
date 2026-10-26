// Reisniveau b. Zelf op reis (7–10 jaar): een zelfstandig leesbare vertelling in een paar onderdelen, vragen met drie antwoorden.
// Niet met de hand bewerken: bron is docs/bijbelreis-niveaus/werk/uit/batch-*.json (node scripts/niveaus/samenvoegen.mjs).
// Regels: docs/bijbelreis-niveaus/schrijfwijzer.md. Controle: node scripts/niveaus-controle.mjs
BR.niveaus.voegToe("b", {
  1: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Het begin",
        t: "In het begin schept God de hemel en de aarde. De aarde is nog woest en leeg, en het is donker. Dan spreekt God: ‘Daar zij licht!’ En er is licht. God noemt het licht dag en de duisternis nacht. Dat is de eerste dag.",
      },
      {
        kop: "Zes dagen",
        t: "Op de tweede dag maakt God het uitspansel: de hemel boven de aarde. Op de derde dag verzamelt Hij het water in zeeën, zodat het droge land te zien is, en Hij laat planten en bomen groeien. Op de vierde dag maakt Hij de zon, de maan en de sterren. Op de vijfde dag de vissen en de vogels. Op de zesde dag de dieren op het land, en als laatste de mens.",
      },
      {
        kop: "Naar Gods beeld",
        t: "God maakt de mens naar Zijn beeld: man en vrouw. Hij zegent hen en zegt dat ze mogen heersen over de vissen, de vogels en alle dieren. God ziet alles wat Hij gemaakt heeft, en het is zeer goed. Op de zevende dag rust God van al Zijn werk. Hij zegent die dag en heiligt hem. Dat betekent: Hij maakt die dag apart en bijzonder.",
      },
    ],
    vragen: [
      {
        q: "Hoe maakt God het licht?",
        a: ["Hij spreekt, en het is er", "Hij steekt een vuur aan", "Hij gebruikt de zon"],
        why: "Genesis 1:3",
      },
      {
        q: "Wat is bijzonder aan de mens?",
        a: ["God maakt hem naar Zijn beeld", "Hij is gemaakt op de eerste dag", "Hij is gemaakt vóór de dieren"],
        why: "Genesis 1:27",
      },
      {
        q: "Wat zegt God over alles wat Hij gemaakt heeft?",
        a: ["Het is zeer goed", "Het is nog niet af", "Het moet nog groeien"],
        why: "Genesis 1:31",
      },
      {
        q: "Waarom is de zevende dag bijzonder?",
        a: ["God rust en zegent die dag", "God maakt dan de mens", "Dan wordt het voor het eerst licht"],
        why: "Genesis 2:2–3",
      },
    ],
  },
  2: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Uit het stof van de aarde",
        stap: "genesis:begin:1",
        t: "De HEERE God formeert de mens uit het stof van de aarde. Formeren betekent: vormen. Dan blaast Hij de adem van het leven in zijn neusgaten, en zo wordt de mens een levende ziel. God plant een hof in Eden, in het oosten. Een hof is een grote tuin. Daar zet Hij de mens, om de hof te bewerken en te bewaren.",
      },
      {
        kop: "Eén boom is verboden",
        t: "In de hof groeien mooie bomen met goede vruchten. In het midden staan de boom des levens en de boom der kennis des goeds en des kwaads. De mens mag van alle bomen eten, maar niet van de boom der kennis. God zegt: ‘ten dage, als gij daarvan eet, zult gij den dood sterven.’ Ten dage betekent: op de dag.",
      },
      {
        kop: "Een hulp die bij hem past",
        t: "God zegt: ‘Het is niet goed, dat de mens alleen zij’. Adam geeft alle dieren een naam, maar er is geen hulp die bij hem past. Dan laat God Adam diep slapen. Hij neemt een van zijn ribben en bouwt daaruit een vrouw. Als God haar bij Adam brengt, zegt Adam: ‘Deze is ditmaal been van mijn benen, en vlees van mijn vlees!’",
      },
    ],
    vragen: [
      {
        q: "Hoe wordt de mens een levende ziel?",
        a: [
          "God blaast de adem des levens in zijn neusgaten",
          "Hij eet een vrucht van de boom des levens",
          "Hij drinkt water uit de rivier van Eden",
        ],
        why: "Genesis 2:7",
      },
      {
        q: "Welke taak geeft God de mens in de hof?",
        a: ["De hof bewerken en bewaren", "Een stad bouwen naast de hof", "De rivieren een naam geven"],
        why: "Genesis 2:15",
      },
      {
        q: "Waarom maakt God een vrouw voor Adam?",
        a: ["Het is niet goed dat de mens alleen is", "Adam is te moe om alleen te werken", "De dieren hebben een verzorger nodig"],
        why: "Genesis 2:18",
      },
      {
        q: "Wat doet Adam voordat God de vrouw maakt?",
        a: ["Hij geeft de dieren een naam", "Hij bouwt een altaar voor God", "Hij plant een tweede hof"],
        why: "Genesis 2:19–22",
      },
    ],
  },
  3: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een listige vraag",
        stap: "genesis:begin:1",
        t: "De slang is listiger dan alle dieren. Ze vraagt de vrouw of God gezegd heeft dat ze van geen enkele boom mogen eten. De vrouw zegt dat ze alleen van de boom in het midden niet mogen eten, anders sterven ze. De slang zegt: ‘Gijlieden zult den dood niet sterven’.",
      },
      {
        kop: "Ongehoorzaam aan God",
        t: "De vrouw ziet dat de boom goed is om van te eten en begeerlijk om verstandig te maken. Ze eet van de vrucht en geeft ook haar man, en hij eet. Dan merken ze dat ze naakt zijn. Ze maken schorten van vijgenbladeren en verbergen zich. God roept: ‘Waar zijt gij?’ Adam is bang, want hij is naakt. Adam geeft de vrouw de schuld, en de vrouw zegt: ‘De slang heeft mij bedrogen’.",
      },
      {
        kop: "Straf en een belofte",
        t: "God vervloekt de slang. Hij zegt dat het zaad van de vrouw de slang de kop zal vermorzelen. Zaad betekent: nakomeling; vermorzelen: verpletteren. De vrouw zal met pijn kinderen krijgen. Adam zal hard werken voor zijn brood, tot hij sterft en weer stof wordt. God maakt hun kleren van vellen en drijft hen uit de hof. Cherubim bewaken de weg naar de boom des levens.",
      },
    ],
    vragen: [
      {
        q: "Wat zegt de slang tegen de vrouw?",
        a: ["Jullie zullen niet sterven", "Jullie mogen alleen van deze boom eten", "God heeft deze boom voor jullie geplant"],
        why: "Genesis 3:4",
      },
      {
        q: "Waarom verbergt Adam zich voor God?",
        a: ["Hij is bang, omdat hij naakt is", "Hij wil God verrassen", "Hij is de weg in de hof kwijt"],
        why: "Genesis 3:10",
      },
      { q: "Aan wie geeft Adam de schuld?", a: ["De vrouw", "De slang", "De dieren"], why: "Genesis 3:12" },
      {
        q: "Wat gebeurt er het eerst?",
        a: ["Ze maken schorten van vijgenbladeren", "God vervloekt de slang", "God maakt kleren van vellen"],
        why: "Genesis 3:7, 14, 21",
      },
      {
        q: "Wat bewaken de cherubim?",
        a: ["De weg naar de boom des levens", "De boom der kennis", "De rivier uit Eden"],
        why: "Genesis 3:24",
      },
    ],
  },
  4: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Twee broers, twee offers",
        stap: "genesis:begin:2",
        t: "Adam en Eva krijgen twee zonen. Kaïn wordt landbouwer, Abel schaapherder. Kaïn brengt de HEERE een offer van de vrucht van het land. Een offer is een gave aan God. Abel offert van de eerstgeborenen van zijn schapen. De HEERE ziet Abel en zijn offer aan, maar Kaïn en zijn offer niet. Dan wordt Kaïn woedend.",
      },
      {
        kop: "De zonde ligt aan de deur",
        t: "God waarschuwt Kaïn: als hij niet goed doet, ‘de zonde ligt aan de deur’. Toch slaat Kaïn zijn broer dood als ze in het veld zijn. God vraagt waar Abel is. Kaïn antwoordt: ‘Ik weet het niet; ben ik mijns broeders hoeder?’ Een hoeder is iemand die op een ander past. Maar God zegt dat het bloed van Abel tot Hem roept.",
      },
      {
        kop: "Een zwerver met een teken",
        t: "God vervloekt Kaïn: hij zal zwervend rondtrekken op de aarde. Maar God stelt een teken aan Kaïn, zodat niemand hem doodslaat. Kaïn woont in het land Nod. Later krijgt Eva weer een zoon: Seth. In de tijd van Seths zoon Enos begint men de Naam van de HEERE aan te roepen.",
      },
    ],
    vragen: [
      {
        q: "Waarom wordt Kaïn woedend?",
        a: [
          "God ziet zijn offer niet aan, maar dat van Abel wel",
          "Abel heeft zijn akker vertrapt met zijn schapen",
          "God stuurt hem weg uit het veld",
        ],
        why: "Genesis 4:4–5",
      },
      {
        q: "Wat zegt God over het bloed van Abel?",
        a: ["Het roept tot Hem van de aardbodem", "Het moet onder een steen bedekt worden", "Het wordt door de regen weggespoeld"],
        why: "Genesis 4:10",
      },
      {
        q: "Waarom stelt God een teken aan Kaïn?",
        a: ["Zodat niemand hem doodslaat", "Zodat hij de weg terug vindt", "Zodat iedereen ziet dat hij landbouwer is"],
        why: "Genesis 4:15",
      },
      {
        q: "Wanneer begint men de Naam van de HEERE aan te roepen?",
        a: ["In de tijd van Enos, de zoon van Seth", "In de tijd van Henoch, de zoon van Kaïn", "In de tijd van Jabal, de zoon van Ada"],
        why: "Genesis 4:26",
      },
    ],
  },
  5: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Boosheid op aarde",
        t: "De HEERE ziet dat de boosheid van de mensen groot is. Alles wat ze in hun hart bedenken, is altijd alleen maar slecht. Het smart de HEERE in Zijn hart dat Hij de mens gemaakt heeft. Hij besluit de mensen te verdelgen: weg te doen van de aarde. Maar Noach vindt genade in de ogen van de HEERE. Noach is rechtvaardig en wandelt met God.",
      },
      {
        kop: "Een ark van goferhout",
        t: "God geeft Noach opdracht: ‘Maak u een ark van goferhout’. Een ark is een groot houten vaartuig, met kamers en drie verdiepingen. Want God zal een watervloed over de aarde brengen. Maar Hij belooft: ‘met u zal Ik Mijn verbond oprichten’. Een verbond is een vaste afspraak die God Zelf maakt en houdt. Noach doet alles wat God hem gebiedt.",
      },
      {
        kop: "De HEERE sluit de deur",
        t: "Noach gaat de ark in met zijn vrouw, met Sem, Cham en Jafeth en hun vrouwen. Ook de dieren komen in de ark. Dan sluit de HEERE achter hem toe. Het regent veertig dagen en veertig nachten, tot zelfs de hoge bergen onder water staan. Alles wat op het droge leeft, sterft. Alleen Noach blijft over, met wie bij hem in de ark is.",
      },
    ],
    vragen: [
      {
        q: "Waarom brengt God de vloed?",
        a: ["De boosheid van de mensen is groot", "De mensen hebben geen eten meer", "De dieren zijn te talrijk geworden"],
        why: "Genesis 6:5–7, 13",
      },
      {
        q: "Wat zegt de Bijbel over Noach?",
        a: ["Hij vindt genade in de ogen van de HEERE", "Hij is de sterkste man op aarde", "Hij is koning over de hele aarde"],
        why: "Genesis 6:8–9",
      },
      {
        q: "Wat doet Noach met Gods opdracht?",
        a: ["Hij doet alles wat God hem gebiedt", "Hij bouwt een kleinere ark dan God zegt", "Hij wacht tot hij de regen ziet komen"],
        why: "Genesis 6:22",
      },
      {
        q: "Wat gebeurt er als Noach in de ark is gegaan?",
        a: ["De HEERE sluit achter hem toe", "Noach doet zelf de deur dicht", "De dieren gaan weer naar buiten"],
        why: "Genesis 7:16",
      },
      {
        q: "Hoe hoog komt het water?",
        a: ["Tot boven de hoge bergen", "Tot aan de daken van de huizen", "Tot aan de deur van de ark"],
        why: "Genesis 7:19–20",
      },
    ],
  },
  6: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een duif met een olijfblad",
        stap: "genesis:begin:3",
        t: "God denkt aan Noach en aan de dieren in de ark. Hij laat een wind over de aarde gaan, en het water neemt af. In de zevende maand rust de ark op de bergen van Ararat. Noach laat een raaf uit, en daarna een duif. De duif vindt geen rustplaats en komt terug. Zeven dagen later laat Noach haar weer uit. Tegen de avond komt ze terug met een afgebroken olijfblad. Zo merkt Noach dat het water gezakt is.",
      },
      {
        kop: "Een altaar en een belofte",
        stap: "genesis:begin:4",
        t: "Als de aarde droog is, zegt God: ‘Ga uit de ark’. Noach bouwt een altaar en brengt brandoffers aan de HEERE. Een brandoffer wordt op het altaar verbrand. God belooft dat zaaien en oogsten, zomer en winter, dag en nacht niet zullen ophouden zolang de aarde bestaat.",
      },
      {
        kop: "De boog in de wolken",
        stap: "genesis:begin:4",
        t: "God sluit een verbond met Noach, met zijn nakomelingen en met alle dieren. Een verbond is een vaste afspraak die God Zelf maakt en houdt. Er komt geen vloed meer ‘om de aarde te verderven’. Als teken zet God Zijn boog in de wolken.",
      },
    ],
    vragen: [
      {
        q: "Waarom komt de duif de eerste keer terug?",
        a: ["Ze vindt geen rustplaats, want overal is water", "Ze is bang voor de raaf", "Noach roept haar terug in de ark"],
        why: "Genesis 8:9",
      },
      {
        q: "Hoe merkt Noach dat het water gezakt is?",
        a: ["De duif komt terug met een olijfblad", "De raaf brengt hem een takje", "Hij hoort dat de regen ophoudt"],
        why: "Genesis 8:11",
      },
      {
        q: "Met wie sluit God Zijn verbond?",
        a: ["Met Noach, zijn nakomelingen en alle dieren", "Alleen met Noach zelf", "Alleen met de zonen van Noach"],
        why: "Genesis 9:9–10",
      },
      {
        q: "Wat gebeurt er het eerst?",
        a: ["Noach bouwt een altaar", "God zegent Noach en zijn zonen", "God zet Zijn boog in de wolken"],
        why: "Genesis 8:20; Genesis 9:1; Genesis 9:13",
      },
    ],
  },
  7: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Eén taal en één plan",
        stap: "genesis:begin:5",
        t: "Alle mensen op aarde spreken dezelfde taal. Ze vinden een laagte in het land Sinear en gaan daar wonen. Ze bakken tichelstenen, en tussen de stenen gebruiken ze lijm: een soort aardpek. Dan zeggen ze: ‘laat ons voor ons een stad bouwen, en een toren, welks opperste in den hemel zij’. Het opperste is de top.",
      },
      {
        kop: "Een naam voor zichzelf",
        t: "Ze willen ‘een naam voor ons maken’. Dat betekent: zelf groot en beroemd worden. En ze willen niet over de hele aarde verstrooid worden. Verstrooid betekent: uit elkaar, verspreid.",
      },
      {
        kop: "De HEERE verwart de taal",
        t: "De HEERE komt neer om de stad en de toren te zien. Hij zegt: ‘laat Ons hun spraak aldaar verwarren’. Dan verstaan de mensen elkaar niet meer. Zo verstrooit de HEERE hen over de hele aarde, en ze houden op met het bouwen van de stad. Daarom heet die stad Babel: daar verwarde de HEERE de spraak van de hele aarde.",
      },
    ],
    vragen: [
      { q: "Wat willen de mensen voor zichzelf maken?", a: ["Een naam", "Een altaar voor de HEERE", "Een ark"], why: "Genesis 11:4" },
      {
        q: "Waarom verstaan de mensen elkaar ineens niet meer?",
        a: ["De HEERE verwart hun spraak", "Ze krijgen ruzie over de toren", "Het lawaai van het bouwen is te groot"],
        why: "Genesis 11:7",
      },
      {
        q: "Waar wonen de mensen als ze gaan bouwen?",
        a: ["In een laagte in het land Sinear", "Op de bergen van Ararat", "In de hof van Eden"],
        why: "Genesis 11:2",
      },
      {
        q: "Wat gebeurt er als de HEERE hen verstrooit?",
        a: ["Ze houden op met het bouwen van de stad", "Ze bouwen de toren nog hoger", "Ze gaan samen terug naar Eden"],
        why: "Genesis 11:8",
      },
      {
        q: "Waarom heet de stad Babel?",
        a: [
          "Daar verwarde de HEERE de spraak van de hele aarde",
          "Daar stond de hoogste toren van de hele wereld",
          "Daar stroomde de grootste rivier van de aarde",
        ],
        why: "Genesis 11:9",
      },
    ],
  },
  8: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Van Ur naar Haran",
        stap: "genesis:abraham:0",
        t: "Abram woont in Ur der Chaldeeën. Zijn vrouw Sarai heeft geen kinderen. Terach, de vader van Abram, trekt weg uit Ur met Abram, Sarai en Lot, de zoon van Abrams overleden broer. Ze willen naar Kanaän, maar in Haran blijven ze wonen. Daar sterft Terach.",
      },
      {
        kop: "Op weg naar het beloofde land",
        stap: "genesis:abraham:1",
        t: "De HEERE zegt tegen Abram dat hij moet gaan ‘naar het land, dat Ik u wijzen zal’. God belooft dat Hij hem tot een groot volk zal maken en hem zal zegenen. Abram is vijfenzeventig jaar. Hij gaat met Sarai, Lot en al hun bezit. Bij Sichem zegt de HEERE: ‘Aan uw zaad zal Ik dit land geven.’ Zaad betekent: nakomelingen. Abram bouwt daar een altaar, en ook tussen Bethel en Ai.",
      },
      {
        kop: "Honger en angst in Egypte",
        stap: "genesis:abraham:4",
        t: "Er komt een zware honger, en Abram trekt naar Egypte. Hij is bang dat de Egyptenaren hem zullen doden om zijn mooie vrouw. Daarom vraagt hij Sarai te zeggen dat ze zijn zuster is. De farao neemt Sarai in zijn huis. Maar de HEERE plaagt de farao met grote plagen. De farao zegt tegen Abram: ‘Wat is dit, dat gij mij gedaan hebt?’ Hij geeft Sarai terug en laat hen wegbrengen.",
      },
    ],
    vragen: [
      {
        q: "Wat belooft God aan Abram?",
        a: [
          "Hij zal hem tot een groot volk maken en zegenen",
          "Hij zal hem koning maken over Egypte",
          "Hij zal hem een stad in Haran geven",
        ],
        why: "Genesis 12:2",
      },
      { q: "Wie gaan er met Abram mee uit Haran?", a: ["Sarai en Lot", "Terach en Nahor", "Nahor en Milka"], why: "Genesis 12:4–5" },
      {
        q: "Waarom moet Sarai zeggen dat ze Abrams zuster is?",
        a: ["Abram is bang dat hij anders gedood wordt", "Sarai wil graag bij de farao wonen", "De farao heeft dat zo bevolen"],
        why: "Genesis 12:12–13",
      },
      {
        q: "Waarom stuurt de farao Abram weg?",
        a: ["De HEERE plaagt hem vanwege Sarai", "De honger in Egypte wordt te groot", "Abram heeft te veel vee bij zich"],
        why: "Genesis 12:17–20",
      },
      {
        q: "Waar bouwt Abram zijn eerste altaar in Kanaän?",
        a: ["Bij Sichem", "Tussen Bethel en Ai", "Bij Berseba"],
        why: "Genesis 12:6–8",
      },
    ],
  },
  9: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Tien jaar wachten",
        t: "Abram woont al tien jaar in Kanaän, maar Sarai krijgt geen kinderen. Ze heeft een Egyptische dienstmaagd, Hagar: een slavin die voor haar werkt. Sarai geeft Hagar aan Abram als vrouw, in de hoop zo toch een kind te krijgen. Hagar wordt zwanger. Dan kijkt ze neer op Sarai. Sarai vernedert haar, en Hagar vlucht weg.",
      },
      {
        kop: "De Engel bij de bron",
        stap: "genesis:abraham:13",
        t: "Bij een waterbron in de woestijn, op de weg naar Sur, vindt de Engel van de HEERE haar. Hij vraagt: ‘van waar komt gij, en waar zult gij heengaan?’ Hij zegt dat ze terug moet gaan naar Sarai. Ze zal een zoon krijgen en hem Ismaël noemen, ‘omdat de HEERE uw verdrukking aangehoord heeft’. Verdrukking betekent: nood en ellende.",
      },
      {
        kop: "De God Die mij ziet",
        t: "Hagar noemt de HEERE ‘God des aanziens’: de God Die haar ziet. Daarom heet de put daar Lachai-roi. Hagar baart Abram een zoon, en Abram noemt hem Ismaël. Abram is dan zesentachtig jaar.",
      },
    ],
    vragen: [
      {
        q: "Waarom geeft Sarai Hagar aan Abram?",
        a: ["Ze krijgt zelf geen kinderen", "Ze wil Hagar terugsturen naar Egypte", "Abram heeft erom gevraagd"],
        why: "Genesis 16:1–3",
      },
      {
        q: "Waarom vlucht Hagar weg?",
        a: ["Sarai vernedert haar", "Er is honger in het land", "Ze wil haar familie in Egypte zien"],
        why: "Genesis 16:6",
      },
      {
        q: "Waarom moet de zoon Ismaël heten?",
        a: ["De HEERE heeft Hagars verdrukking gehoord", "Het is de naam van Hagars vader", "Het is de naam van een koning van Egypte"],
        why: "Genesis 16:11",
      },
      {
        q: "Hoe noemt Hagar de HEERE?",
        a: ["God des aanziens: de God Die haar ziet", "God de Almachtige: de God Die alles kan", "God de Allerhoogste: de God boven alles"],
        why: "Genesis 16:13",
      },
    ],
  },
  10: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Lot mag kiezen",
        stap: "genesis:abraham:6",
        t: "Abram en Lot hebben te veel vee om samen te wonen. Hun herders krijgen ruzie. Abram zegt: ‘Laat toch geen twisting zijn tussen mij en tussen u’, en laat Lot kiezen. Lot kiest de Jordaanvlakte, waar overal water is, en woont tot bij Sodom. Maar de mannen daar zijn ‘grote zondaars tegen den HEERE’. God belooft Abram al het land dat hij ziet.",
      },
      {
        kop: "Abraham pleit voor Sodom",
        stap: "genesis:abraham:15",
        t: "Later heet Abram: Abraham. Bij Mamre krijgt hij bezoek van drie mannen. De HEERE belooft Sara een zoon, en zegt dat de zonde van Sodom zeer zwaar is. Abraham vraagt of God de stad spaart als er vijftig rechtvaardigen zijn: mensen die doen wat recht is. Steeds vraagt hij minder, tot tien. God zegt: om tien zal Ik haar niet verderven.",
      },
      {
        kop: "Gered uit Sodom",
        stap: "genesis:abraham:16",
        t: "Twee engelen komen in Sodom. De mannen van de stad willen hun kwaad doen, maar de engelen slaan hen met blindheid. Bij dageraad trekken ze Lot, zijn vrouw en twee dochters aan de hand de stad uit. Lot vlucht naar Zoar. De HEERE laat zwavel en vuur regenen op Sodom en Gomorra. Lots vrouw kijkt om en wordt een zoutpilaar.",
      },
    ],
    vragen: [
      {
        q: "Waarom koos Lot de Jordaanvlakte?",
        a: ["Hij zag dat er overal water was", "Abram had hem die vlakte gewezen", "Daar woonde familie van hem"],
        why: "Genesis 13:10–11",
      },
      {
        q: "Wat beloofde God aan Abram nadat Lot weg was?",
        a: ["Al het land dat hij kon zien", "Een grote stad aan de Jordaan", "Een nieuwe kudde vee"],
        why: "Genesis 13:14–15",
      },
      {
        q: "Wat deden de engelen met de mannen van Sodom?",
        a: ["Ze sloegen hen met blindheid", "Ze riepen vuur uit de hemel", "Ze vluchtten over het dak"],
        why: "Genesis 19:9–11",
      },
      {
        q: "Waarom moest Lot de stad uit?",
        a: ["De HEERE ging de stad verderven", "De mannen van Sodom joegen hem weg", "Hij wilde weer bij Abraham wonen"],
        why: "Genesis 19:13–15",
      },
      {
        q: "Wat vroeg Abraham aan God?",
        a: ["Of Hij Sodom wilde sparen om de rechtvaardigen", "Of Lot weer bij hem mocht komen wonen", "Of Hij Sodom snel wilde verwoesten"],
        why: "Genesis 18:23–26",
      },
    ],
  },
  11: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Tel de sterren",
        stap: "genesis:abraham:12",
        t: "Abram zegt tegen de HEERE dat hij geen kinderen heeft; Eliëzer uit Damaskus, die zijn huis beheert, zal alles erven. Maar de HEERE zegt dat een eigen zoon zijn erfgenaam wordt. Hij neemt Abram mee naar buiten: ‘tel de sterren, indien gij ze tellen kunt’. Zo veel nakomelingen krijgt Abram. Abram gelooft de HEERE, en God rekent het hem tot gerechtigheid: God ziet hem aan als rechtvaardig.",
      },
      {
        kop: "Nieuwe namen",
        stap: "genesis:abraham:14",
        t: "Als Abram negenennegentig is, verschijnt God weer. Abram heet voortaan Abraham, ‘want Ik heb u gesteld tot een vader van menigte der volken’. Sarai heet nu Sara. God belooft Abraham dat Hij zijn God zal zijn en die van zijn nakomelingen. Dat is Gods verbond; de besnijdenis is er het teken van. Sara zal een zoon krijgen. Abraham lacht en denkt: kan een man van honderd nog vader worden?",
      },
      {
        kop: "Izak wordt geboren",
        stap: "genesis:abraham:18",
        t: "De HEERE doet wat Hij gezegd heeft: op de genoemde tijd krijgt Sara een zoon. Abraham is dan honderd. Hij noemt zijn zoon Izak, en als Izak acht dagen oud is, besnijdt hij hem. Sara zegt: ‘God heeft mij een lachen gemaakt’.",
      },
    ],
    vragen: [
      {
        q: "Wat deed Abram toen God zei dat zijn nakomelingen zo talrijk als de sterren zouden zijn?",
        a: ["Hij geloofde de HEERE", "Hij zei dat het niet kon", "Hij ging terug naar Haran"],
        why: "Genesis 15:5–6",
      },
      {
        q: "Waarom kreeg Abram de naam Abraham?",
        a: ["God stelde hem tot vader van veel volken", "Hij was toen negenennegentig jaar", "Sara wilde hem zo noemen"],
        why: "Genesis 17:5",
      },
      {
        q: "Wat werd het teken van het verbond tussen God en Abraham?",
        a: ["De besnijdenis", "De regenboog", "Een altaar van stenen"],
        why: "Genesis 17:10–11",
      },
      {
        q: "Wanneer besneed Abraham zijn zoon Izak?",
        a: ["Toen Izak acht dagen oud was", "Op de dag dat Izak geboren werd", "Toen Izak gespeend werd"],
        why: "Genesis 21:4",
      },
    ],
  },
  12: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een feest en een spotter",
        t: "Izak wordt gespeend: hij drinkt niet meer bij zijn moeder. Abraham geeft een grote maaltijd. Dan ziet Sara dat Ismaël spot. Hij is de zoon van Hagar, de Egyptische dienstmaagd: een dienares van Sara. Sara zegt: ‘Drijf deze dienstmaagd en haar zoon uit’, want Ismaël zal niet samen met Izak erven. Abraham vindt dat heel erg. Maar God zegt: ‘in Izak zal uw zaad genoemd worden’. Dat betekent: de belofte gaat verder via Izak. Ook van Ismaël zal God een volk maken.",
      },
      {
        kop: "Zonder water in de woestijn",
        stap: "genesis:abraham:19",
        t: "Vroeg in de morgen geeft Abraham Hagar brood en een fles water, en stuurt hij haar met de jongen weg. Ze dwaalt in de woestijn van Berseba. Als het water op is, legt ze de jongen onder een struik. Ze gaat een eind verderop zitten, want ze wil het kind niet zien sterven. Ze huilt.",
      },
      {
        kop: "God hoort",
        stap: "genesis:abraham:19",
        t: "God hoort de stem van de jongen. De Engel van God roept Hagar uit de hemel toe: ‘Vrees niet’. God opent haar ogen, en ze ziet een waterput. God is met Ismaël. Hij woont in de woestijn Paran en wordt een boogschutter.",
      },
    ],
    vragen: [
      {
        q: "Waarom wilde Sara dat Hagar en Ismaël weggingen?",
        a: ["Ismaël mocht niet samen met Izak erven", "Er was te weinig eten in de tent", "Hagar wilde terug naar Egypte"],
        why: "Genesis 21:9–10",
      },
      {
        q: "Waarom vond Abraham het zo erg?",
        a: ["Ismaël was ook zijn zoon", "Hij had Hagar nodig bij het vee", "Hij moest zelf ook weggaan"],
        why: "Genesis 21:11",
      },
      {
        q: "Waar dwaalde Hagar rond?",
        a: ["In de woestijn van Berseba", "Bij de eikenbossen van Mamre", "Aan de oever van de Jordaan"],
        why: "Genesis 21:14",
      },
      {
        q: "Wat beloofde God over Ismaël?",
        a: ["Hij zou een groot volk worden", "Hij zou koning van Egypte worden", "Hij zou de erfgenaam van Abraham zijn"],
        why: "Genesis 21:13, 18",
      },
    ],
  },
  13: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een zware opdracht",
        stap: "genesis:abraham:21",
        t: "God stelt Abraham op de proef: ‘Neem nu uw zoon, uw enige, dien gij liefhebt, Izak’. Hij moet hem offeren als brandoffer op een berg in het land Moria. Een brandoffer wordt helemaal verbrand. Vroeg in de morgen gaat Abraham op weg, met Izak, twee knechten, een ezel en hout.",
      },
      {
        kop: "Waar is het lam",
        t: "Op de derde dag ziet hij de plaats van verre. Tegen de knechten zegt hij: ‘als wij aangebeden zullen hebben, dan zullen wij tot u wederkeren.’ Izak draagt het hout en vraagt waar het lam is. Abraham antwoordt: ‘God zal Zichzelven een lam ten brandoffer voorzien, mijn zoon!’ Voorzien betekent hier: zorgen voor.",
      },
      {
        kop: "De Heere zal het voorzien",
        t: "Op de berg bouwt Abraham een altaar en bindt Izak. Als hij het mes neemt, roept de Engel van de HEERE: ‘Strek uw hand niet uit aan den jongen … want nu weet Ik, dat gij God vrezende zijt’. Dan ziet Abraham een ram, met zijn horens vast in de struiken. Hij offert de ram in plaats van Izak, en noemt die plaats: ‘De Heere zal het voorzien!’ Daarna belooft God: in Abrahams zaad worden alle volken gezegend.",
      },
    ],
    vragen: [
      {
        q: "Wat zei Abraham tegen de knechten?",
        a: [
          "Dat hij en de jongen zouden terugkomen",
          "Dat ze alvast naar Berseba moesten gaan",
          "Dat ze het hout naar boven moesten dragen",
        ],
        why: "Genesis 22:5",
      },
      {
        q: "Waarom zei de Engel dat Abraham God vreesde?",
        a: [
          "Abraham hield zijn enige zoon niet voor God achter",
          "Abraham had een groot altaar gebouwd",
          "Abraham was drie dagen onderweg geweest",
        ],
        why: "Genesis 22:12",
      },
      {
        q: "Waar zat de ram vast?",
        a: ["Met zijn horens in de struiken", "Met zijn poot tussen de stenen", "In een kuil naast het altaar"],
        why: "Genesis 22:13",
      },
      {
        q: "Welke belofte gaf God daarna opnieuw?",
        a: ["In zijn zaad worden alle volken gezegend", "Hij zou koning worden over Moria", "Hij zou nooit meer hoeven te reizen"],
        why: "Genesis 22:17–18",
      },
    ],
  },
  14: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een eed en een lange reis",
        stap: "genesis:abraham:23",
        t: "Abraham is oud. Hij laat zijn oudste knecht zweren dat die voor Izak geen vrouw zal nemen uit de Kanaänieten, maar uit Abrahams eigen familie. Zweren is plechtig beloven. Abraham vertrouwt erop dat God Zijn Engel mee zal sturen. De knecht neemt tien kamelen en reist naar Mesopotamië, naar de stad van Nahor.",
      },
      {
        kop: "Een gebed bij de waterput",
        t: "’s Avonds laat de knecht de kamelen knielen bij een waterput. Hij bidt: laat het meisje dat zegt ‘Drink, en ik zal ook uw kemelen drenken’, de vrouw zijn die U voor Izak hebt bestemd. Nog voordat hij klaar is, komt Rebekka, een kleindochter van Nahor, de broer van Abraham. Ze doet precies wat de knecht had gevraagd. Dan buigt hij zich en aanbidt de HEERE.",
      },
      {
        kop: "Ik zal trekken",
        t: "Rebekka’s broer Laban en haar vader Bethuël zeggen: ‘Van den HEERE is deze zaak voortgekomen’. Als ze Rebekka vragen of ze meegaat, zegt ze: ‘Ik zal trekken.’ ’s Avonds is Izak in het veld om te bidden, en hij ziet de kamelen komen. Hij trouwt met Rebekka en heeft haar lief. Zo wordt hij getroost na de dood van zijn moeder.",
      },
    ],
    vragen: [
      {
        q: "Wat moest de knecht aan Abraham zweren?",
        a: ["Izak zou geen vrouw uit de Kanaänieten krijgen", "Izak zou zelf naar Mesopotamië gaan", "Hij zou nooit meer terugkomen"],
        why: "Genesis 24:3–6",
      },
      {
        q: "Hoe wist de knecht dat Rebekka de goede vrouw was?",
        a: ["Ze gaf ook zijn kamelen te drinken", "Ze droeg al een gouden ring", "Ze groette hem als eerste"],
        why: "Genesis 24:14, 18–21",
      },
      {
        q: "Wie was Rebekka in de familie van Abraham?",
        a: ["Een kleindochter van zijn broer Nahor", "Een dochter van Lot", "Een zus van Sara"],
        why: "Genesis 24:15",
      },
      {
        q: "Wat zeiden Laban en Bethuël tegen de knecht?",
        a: ["Deze zaak is van de HEERE gekomen", "Wij willen eerst Izak zelf zien", "Abraham moet zelf komen"],
        why: "Genesis 24:50",
      },
    ],
  },
  15: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een tweeling",
        stap: "genesis:izak:0",
        t: "Rebekka krijgt geen kinderen, maar Izak bidt en de HEERE verhoort hem. Voor de geboorte zegt de HEERE tegen Rebekka dat de oudste de jongste zal dienen. Eerst komt Ezau, rood en harig, dan Jakob, die de hiel van zijn broer vasthoudt. Ezau wordt een jager, Jakob woont in tenten. Op een dag verkoopt Ezau zijn eerstgeboorte, het recht van de oudste zoon, voor brood en linzensoep.",
      },
      {
        kop: "Een zegen met bedrog",
        stap: "genesis:izak:5",
        t: "Izak is oud en kan niet meer zien. Hij wil Ezau zegenen. Rebekka bedenkt een list: ze trekt Jakob de kleren van Ezau aan, met geitenvel over handen en hals. Jakob zegt: ‘Ik ben Ezau uw eerstgeborene’. Zo krijgt hij de zegen. Izak zegt tegen Ezau: ‘Uw broeder is gekomen met bedrog’. Ezau haat Jakob en wil hem doden.",
      },
      {
        kop: "Een ladder tot aan de hemel",
        stap: "genesis:jakob:0",
        t: "Jakob vlucht naar Laban, de broer van zijn moeder, in Haran. Onderweg slaapt hij met een steen als kussen. Hij droomt van een ladder tot aan de hemel, met engelen die op en neer gaan. De HEERE belooft: ‘Ik ben met u, en Ik zal u behoeden’. Jakob noemt de plaats Bethel. Dat betekent: huis van God.",
      },
    ],
    vragen: [
      { q: "Wie werd als eerste geboren?", a: ["Ezau", "Jakob", "Ze kwamen precies tegelijk"], why: "Genesis 25:25–26" },
      {
        q: "Waarom kon Jakob zijn vader bedriegen?",
        a: ["Izak kon niet meer zien", "Izak was op reis", "Ezau was al naar Haran"],
        why: "Genesis 27:1",
      },
      {
        q: "Waarom moest Jakob vluchten?",
        a: ["Ezau wilde hem doden", "Er was geen eten meer thuis", "Izak stuurde hem op jacht"],
        why: "Genesis 27:41–43",
      },
      {
        q: "Wat beloofde de HEERE aan Jakob in de droom?",
        a: ["Dat Hij met hem zou zijn", "Dat hij koning zou worden in Haran", "Dat hij de kudde van Laban zou krijgen"],
        why: "Genesis 28:15",
      },
    ],
  },
  16: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Bij de put in het veld",
        stap: "genesis:jakob:1",
        t: "Jakob reist naar het land in het oosten. Bij een put in het veld liggen kudden schapen. De herders komen uit Haran en kennen Laban, de broer van Jakobs moeder. Dan komt Rachel, de dochter van Laban, met de schapen. Jakob rolt de grote steen van de put en geeft de schapen water. Hij kust Rachel en huilt. Laban haalt hem in huis.",
      },
      {
        kop: "Zeven jaar, en nog eens zeven",
        stap: "genesis:jakob:2",
        t: "Jakob heeft Rachel lief. Hij werkt zeven jaar voor Laban om met haar te trouwen. Die jaren zijn in zijn ogen ‘als enige dagen’: als een paar dagen. Maar na het bruiloftsmaal blijkt dat Laban hem Lea heeft gegeven, de oudste dochter. ‘Waarom hebt gij mij dan bedrogen?’ vraagt Jakob. Een week later krijgt hij ook Rachel. Daarvoor werkt hij nog zeven jaar.",
      },
      {
        kop: "Elf zonen en een dochter",
        stap: "genesis:jakob:3",
        t: "De HEERE ziet dat Lea minder geliefd is, en Hij geeft haar zonen. Rachel krijgt geen kinderen en is jaloers op haar zus. Ook hun slavinnen Bilha en Zilpa krijgen zonen van Jakob. Als laatste denkt God aan Rachel, en zij krijgt Jozef. Zo heeft Jakob in Haran elf zonen en een dochter, Dina.",
      },
    ],
    vragen: [
      { q: "Waar komen de herders bij de put vandaan?", a: ["Uit Haran", "Uit Bethel", "Uit Sichem"], why: "Genesis 29:4" },
      {
        q: "Waarom lijken de zeven jaren voor Jakob maar een paar dagen?",
        a: ["Omdat hij Rachel liefheeft", "Omdat het werk heel licht is", "Omdat Laban hem veel betaalt"],
        why: "Genesis 29:20",
      },
      {
        q: "Wat gebeurt er een week na de bruiloft van Jakob en Lea?",
        a: ["Jakob krijgt ook Rachel als vrouw", "Jakob vlucht weg uit Haran", "Laban stuurt Lea terug naar huis"],
        why: "Genesis 29:27–28",
      },
      {
        q: "Wie zijn Bilha en Zilpa?",
        a: ["De slavinnen van Rachel en Lea", "De zussen van Laban", "De dochters van Jakob"],
        why: "Genesis 29:24, 29",
      },
      { q: "Wie is de moeder van Jozef?", a: ["Rachel", "Lea", "Bilha"], why: "Genesis 30:22–24" },
    ],
  },
  17: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Terug naar het land van je vaderen",
        stap: "genesis:jakob:4",
        t: "Jakob is twintig jaar bij Laban geweest. Laban is tegen hem niet meer zoals vroeger. Dan zegt de HEERE: ‘Keer weder tot het land uwer vaderen, en tot uw maagschap, en Ik zal met u zijn.’ Maagschap betekent familie. Jakob vertrekt met zijn gezin en zijn vee, zonder het Laban te zeggen.",
      },
      {
        kop: "Een steenhoop als getuige",
        stap: "genesis:jakob:4",
        t: "Laban jaagt hen achterna en haalt hen in op het gebergte Gilead. Maar God waarschuwt hem in een droom. Jakob en Laban maken een hoop stenen als getuige: ze zullen elkaar geen kwaad doen.",
      },
      {
        kop: "Bang voor Ezau",
        stap: "genesis:jakob:5",
        t: "Bij Mahanaïm ontmoeten engelen van God Jakob. Dan hoort hij dat Ezau eraan komt met vierhonderd man. Jakob is erg bang. Hij bidt: ‘Ruk mij toch uit mijns broeders hand’. Dat is: red mij van mijn broer. Hij stuurt een groot geschenk van vee vooruit.",
      },
      {
        kop: "Worstelen in de nacht",
        stap: "genesis:jakob:6",
        t: "’s Nachts blijft Jakob alleen achter bij de beek de Jabbok. Een Man worstelt met hem tot het licht wordt en raakt zijn heup aan. Jakob zegt: ‘Ik zal U niet laten gaan, tenzij dat Gij mij zegent.’ Hij krijgt de naam Israël. Jakob noemt de plaats Pniël, want hij heeft God gezien.",
      },
    ],
    vragen: [
      {
        q: "Waarom gaat Jakob terug naar het land van zijn vaderen?",
        a: ["De HEERE zegt dat hij terug moet gaan", "Laban stuurt hem weg", "Er is honger in Haran"],
        why: "Genesis 31:3",
      },
      { q: "Waar haalt Laban Jakob in?", a: ["Op het gebergte Gilead", "Bij de beek de Jabbok", "In Bethel"], why: "Genesis 31:23" },
      {
        q: "Wat doet Jakob als hij hoort dat Ezau eraan komt?",
        a: ["Hij bidt en stuurt een geschenk vooruit", "Hij keert terug naar Laban", "Hij verstopt zich in de bergen"],
        why: "Genesis 32:9–21",
      },
      {
        q: "Wat gebeurt er als eerste?",
        a: ["Jakob en Laban maken een steenhoop", "Jakob hoort dat Ezau eraan komt", "Jakob worstelt bij de Jabbok"],
        why: "Genesis 31:46; Genesis 32:6; Genesis 32:24",
      },
      {
        q: "Waarom noemt Jakob de plaats Pniël?",
        a: ["Hij heeft God gezien van aangezicht tot aangezicht", "Hij heeft daar een put gevonden", "Hij heeft daar Ezau ontmoet"],
        why: "Genesis 32:30",
      },
    ],
  },
  18: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een rok en twee dromen",
        stap: "genesis:jozef:0",
        t: "Jozef is zeventien jaar en past met zijn broers op de kudde. Jakob heeft hem het liefst. Hij maakt Jozef een veelkleurige rok. Daarom haten de broers hem. Jozef droomt dat hun schoven (bossen graan) buigen voor zijn schoof. Daarna droomt hij dat de zon, de maan en elf sterren voor hem buigen. De broers worden jaloers.",
      },
      {
        kop: "In de kuil bij Dothan",
        stap: "genesis:jozef:2",
        t: "Jakob stuurt Jozef naar zijn broers bij Sichem. Hij vindt hen pas bij Dothan. Als ze hem zien, zeggen ze: ‘Ziet, daar komt die meesterdromer aan!’ Ze willen hem doden. Maar Ruben zegt: ‘Vergiet geen bloed’. Hij wil Jozef later terugbrengen naar zijn vader. Ze trekken Jozef zijn rok uit en gooien hem in een lege kuil.",
      },
      {
        kop: "Verkocht naar Egypte",
        stap: "genesis:jozef:3",
        t: "Dan komen kooplieden langs, op weg naar Egypte. Juda zegt: laten we hem niet doden, maar verkopen, want hij is onze broer. Ze verkopen Jozef voor twintig zilverlingen. De rok dopen ze in het bloed van een geitenbok. Jakob denkt dat een wild dier Jozef verscheurd heeft, en hij rouwt lang. In Egypte wordt Jozef verkocht aan Potifar, een hoge dienaar van de farao.",
      },
    ],
    vragen: [
      {
        q: "Waarom haten de broers Jozef?",
        a: ["Hun vader heeft hem het liefst", "Jozef heeft hun schapen weggenomen", "Jozef is de oudste zoon"],
        why: "Genesis 37:4",
      },
      {
        q: "Waar zoekt Jozef zijn broers eerst, voordat hij naar Dothan gaat?",
        a: ["Bij Sichem", "Bij Bethel", "Bij Haran"],
        why: "Genesis 37:12–17",
      },
      {
        q: "Wat zegt Ruben tegen zijn broers?",
        a: ["Vergiet geen bloed", "Laten we hem verkopen", "Laten we naar huis gaan"],
        why: "Genesis 37:22",
      },
      {
        q: "Waarom wil Juda Jozef liever verkopen dan doden?",
        a: ["Hij is hun broer, hun eigen vlees", "Ze hebben geld nodig voor brood", "De kooplieden vragen om een slaaf"],
        why: "Genesis 37:26–27",
      },
      {
        q: "Wat denkt Jakob als hij de rok met bloed ziet?",
        a: ["Een wild dier heeft Jozef opgegeten", "Jozef is naar Egypte gegaan", "Jozef is verdwaald in het veld"],
        why: "Genesis 37:33",
      },
    ],
  },
  19: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Trouw in het huis van Potifar",
        stap: "genesis:jozef:4",
        t: "Potifar, een hoge dienaar van de farao, koopt Jozef in Egypte. De HEERE is met Jozef, en alles wat hij doet, gaat goed. Potifar stelt hem over zijn hele huis. Dan wil Potifars vrouw dat Jozef met haar zondigt. Jozef weigert, want hij wil niet ‘zondigen tegen God’. Hij vlucht. Zij liegt over hem, en Potifar zet Jozef in de gevangenis.",
      },
      {
        kop: "Dromen in de gevangenis",
        stap: "genesis:jozef:5",
        t: "Ook in de gevangenis is de HEERE met Jozef. Daar zitten ook de schenker en de bakker van de farao. Een schenker schenkt wijn voor de koning. Ze dromen allebei. Jozef legt de dromen uit: binnen drie dagen krijgt de schenker zijn werk terug, en de bakker wordt opgehangen. Zo gebeurt het. Maar de schenker vergeet Jozef.",
      },
      {
        kop: "Jozef staat voor de farao",
        stap: "genesis:jozef:6",
        t: "Twee jaar later droomt de farao van zeven vette en zeven magere koeien, en van zeven volle en zeven dunne aren. Dan denkt de schenker aan Jozef. Jozef zegt: ‘Het is buiten mij!’ Dat is: niet ik, maar God geeft het antwoord. Jozef legt uit: er komen zeven jaren overvloed en daarna zeven jaren honger. De farao stelt Jozef over heel Egypte.",
      },
    ],
    vragen: [
      {
        q: "Waarom gaat alles goed wat Jozef doet bij Potifar?",
        a: ["De HEERE is met hem", "Potifar helpt hem steeds", "Hij heeft veel geld meegenomen"],
        why: "Genesis 39:2–3",
      },
      {
        q: "Waarom wil Jozef niet doen wat de vrouw van Potifar vraagt?",
        a: ["Hij wil niet zondigen tegen God", "Hij is bang voor de farao", "Hij wil liever naar huis"],
        why: "Genesis 39:9",
      },
      {
        q: "Wat gebeurt er met de schenker na drie dagen?",
        a: ["Hij krijgt zijn werk terug", "Hij wordt opgehangen", "Hij mag terug naar zijn land"],
        why: "Genesis 40:20–21",
      },
      { q: "Wie vertelt de farao over Jozef?", a: ["De schenker", "De bakker", "Potifar"], why: "Genesis 41:9–13" },
      {
        q: "Wat komt er na de zeven jaren van overvloed?",
        a: ["Zeven jaren honger", "Zeven jaren oorlog", "Zeven jaren regen"],
        why: "Genesis 41:29–30",
      },
    ],
  },
  20: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Koren kopen in Egypte",
        stap: "genesis:jozef:7",
        t: "Ook in Kanaän is honger. Jakob stuurt tien zonen naar Egypte om koren, graan, te kopen; Benjamin blijft thuis. De broers buigen voor Jozef met hun gezicht naar de grond, zoals hij gedroomd had. Zij herkennen hem niet. Jozef noemt hen verspieders, dat zijn spionnen, en houdt Simeon gevangen.",
      },
      {
        kop: "Juda staat borg voor Benjamin",
        stap: "genesis:jozef:8",
        t: "De tweede keer moet Benjamin mee. Juda zegt tegen zijn vader: ‘Ik zal borg voor hem zijn’. Dat betekent: ik sta ervoor in. Jozef laat zijn zilveren beker in de zak van Benjamin leggen. Als de beker gevonden is, vraagt Juda of hij zelf slaaf mag blijven in plaats van Benjamin.",
      },
      {
        kop: "Jozef maakt zich bekend",
        stap: "genesis:jozef:9",
        t: "Nu huilt Jozef en zegt: ‘Ik ben Jozef!’ De broers schrikken. Maar Jozef zegt dat God hem vooruit gestuurd heeft, om hen in leven te houden.",
      },
      {
        kop: "Naar Gosen",
        stap: "genesis:jakob:12",
        t: "Jakob trekt met de hele familie naar Egypte. In Berseba zegt God tegen hem: ‘vrees niet van af te trekken naar Egypte’. In Gosen valt Jozef zijn vader om de hals en huilt lang.",
      },
    ],
    vragen: [
      {
        q: "Waarom gingen de broers naar Egypte?",
        a: ["Om koren te kopen tegen de honger", "Om hun broer Jozef te zoeken", "Om voor de farao te werken"],
        why: "Genesis 42:2–5",
      },
      { q: "Wie bood aan slaaf te blijven in plaats van Benjamin?", a: ["Juda", "Ruben", "Simeon"], why: "Genesis 44:33" },
      {
        q: "Waarom was Jozef in Egypte, volgens wat hij zelf zei?",
        a: ["God had hem gezonden om hen in leven te houden", "Hij was zelf uit Kanaän weggevlucht", "De farao had hem uit Kanaän gehaald"],
        why: "Genesis 45:5–8",
      },
      {
        q: "Wat gebeurde er het eerst?",
        a: ["Simeon werd gevangen gehouden", "De beker werd gevonden", "Jakob kwam in Gosen"],
        why: "Genesis 42:24; Genesis 44:12; Genesis 46:29",
      },
      { q: "Waar sprak God in de nacht tot Jakob?", a: ["In Berseba", "In Gosen", "In Sichem"], why: "Genesis 46:1–2" },
    ],
  },
  21: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een volk dat steeds groter wordt",
        stap: "exodus:mozes:0",
        t: "In Egypte wordt de familie van Jakob een groot volk. Dan komt er een nieuwe koning, die Jozef niet gekend heeft. Hij vindt Israël te machtig. De Israëlieten moeten voor de farao de steden Pitom en Raämses bouwen. Maar hoe slechter ze behandeld worden, hoe meer het volk groeit.",
      },
      {
        kop: "Vroedvrouwen die God vrezen",
        t: "De koning zegt tegen Sifra en Pua, vroedvrouwen die helpen bij een geboorte, dat ze de jongetjes moeten doden. Maar zij vrezen God en laten de jongetjes leven. Dan beveelt de farao: alle zonen die geboren worden, moeten in de rivier geworpen worden.",
      },
      {
        kop: "Een kistje van biezen",
        stap: "exodus:mozes:1",
        t: "Een vrouw uit het huis van Levi verbergt haar zoon drie maanden. Dan legt ze hem in een kistje van biezen, dichtgemaakt met lijm en pek, aan de oever van de rivier. Zijn zus kijkt van een afstand toe. De dochter van de farao vindt het kistje en krijgt medelijden met het huilende kind. De zus haalt de eigen moeder om het kind te voeden. Later wordt hij de zoon van de dochter van de farao. Zij noemt hem Mozes: ‘Want ik heb hem uit het water getogen’, dat is: getrokken.",
      },
    ],
    vragen: [
      {
        q: "Waarom liet de nieuwe koning de Israëlieten zo zwaar werken?",
        a: ["Hij vond het volk te machtig", "Ze hadden hem geld afgepakt", "Jozef had dat zo bevolen"],
        why: "Exodus 1:9–11",
      },
      {
        q: "Waarom lieten de vroedvrouwen de jongetjes leven?",
        a: ["Ze vreesden God", "De koning had het gevraagd", "De moeders betaalden hen"],
        why: "Exodus 1:17",
      },
      { q: "Wie keek van een afstand wat er met het kistje gebeurde?", a: ["Zijn zus", "Zijn vader", "Een vroedvrouw"], why: "Exodus 2:4" },
      { q: "Wie mocht het kind voeden?", a: ["Zijn eigen moeder", "Een Egyptische vrouw", "Een vroedvrouw"], why: "Exodus 2:8–9" },
    ],
  },
  22: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Mozes gaat naar zijn broeders",
        stap: "exodus:mozes:2",
        t: "Mozes is de zoon geworden van de dochter van de farao. Als hij groot is, gaat hij naar zijn broeders, de Hebreeën: zijn eigen volk. Hij ziet dat een Egyptenaar een Hebreeuwse man slaat. Mozes kijkt om zich heen, en als er niemand is, slaat hij de Egyptenaar dood en verbergt hem in het zand.",
      },
      {
        kop: "Op de vlucht",
        stap: "exodus:mozes:2",
        t: "De volgende dag ziet hij twee Hebreeën vechten. Een van hen zegt: ‘Wie heeft u tot een overste en rechter over ons gezet?’ Nu weet Mozes dat het bekend is. De farao wil hem doden, en Mozes vlucht naar het land Midian.",
      },
      {
        kop: "Bij de waterput in Midian",
        stap: "exodus:mozes:3",
        t: "Herders jagen de zeven dochters van de priester van Midian weg bij de put, maar Mozes helpt hen. Hun vader Rehuël nodigt hem uit. Mozes trouwt met zijn dochter Zippora. Hun zoon heet Gersom, want Mozes zegt: ‘Ik ben een vreemdeling geworden in een vreemd land.’",
      },
      {
        kop: "God hoort Zijn volk",
        t: "Na lange tijd sterft de koning van Egypte. De Israëlieten zuchten en roepen om het zware werk. God hoort hen en denkt aan Zijn verbond met Abraham, Izak en Jakob. Een verbond is een plechtige belofte die God gedaan heeft.",
      },
    ],
    vragen: [
      {
        q: "Waarom moest Mozes vluchten?",
        a: ["De farao wilde hem doden", "Er was honger in Egypte", "Hij zocht een vrouw"],
        why: "Exodus 2:15",
      },
      { q: "Hoe heette de vrouw van Mozes?", a: ["Zippora", "Mirjam", "Jochebed"], why: "Exodus 2:21" },
      {
        q: "Waarom noemde Mozes zijn zoon Gersom?",
        a: ["Hij was een vreemdeling in een vreemd land", "Hij was blij dat hij gered was", "Zo heette zijn schoonvader"],
        why: "Exodus 2:22",
      },
      {
        q: "Wat gebeurde er het eerst?",
        a: ["Mozes verborg de Egyptenaar in het zand", "Mozes hielp de zeven dochters", "Mozes trouwde met Zippora"],
        why: "Exodus 2:12; Exodus 2:17; Exodus 2:21",
      },
    ],
  },
  23: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een braambos dat niet verbrandt",
        stap: "exodus:mozes:4",
        t: "Mozes hoedt de kudde van zijn schoonvader Jethro. Bij Horeb, de berg van God, ziet hij een braambos dat brandt, maar niet verteerd wordt. God roept hem: ‘Mozes, Mozes!’ Hij moet zijn schoenen uittrekken, want de plaats waar hij staat, is heilig land.",
      },
      {
        kop: "Ik zal met u zijn",
        stap: "exodus:mozes:4",
        t: "God heeft gezien hoe Zijn volk verdrukt wordt. Hij stuurt Mozes naar de farao om Israël uit Egypte te leiden. Mozes vraagt: ‘Wie ben ik?’ God antwoordt: ‘Ik zal voorzeker met u zijn.’ God noemt ook Zijn Naam: ‘IK ZAL ZIJN, Die IK ZIJN ZAL’.",
      },
      {
        kop: "Tekenen en een helper",
        stap: "exodus:mozes:5",
        t: "Mozes zegt dat het volk hem niet zal geloven. Daarom geeft God hem tekenen: zijn staf wordt een slang, en zijn hand wordt ‘melaats, wit als sneeuw’ en weer gezond. Mozes zegt dat hij niet goed kan spreken, en vraagt God iemand anders te sturen. Dan wordt de HEERE toornig: boos. Toch geeft Hij Aäron, de broer van Mozes, om voor hem te spreken.",
      },
      {
        kop: "Het volk gelooft",
        stap: "exodus:mozes:6",
        t: "Mozes gaat terug naar Egypte, met de staf van God in zijn hand. Aäron komt hem tegemoet. Aäron spreekt tot de oudsten en doet de tekenen. Het volk gelooft en aanbidt.",
      },
    ],
    vragen: [
      {
        q: "Waarom moest Mozes zijn schoenen uittrekken?",
        a: ["Hij stond op heilig land", "Hij had een lange tocht gemaakt", "Het vuur was te heet"],
        why: "Exodus 3:5",
      },
      {
        q: "Waarom gaf God Mozes tekenen?",
        a: ["Zodat het volk hem zou geloven", "Zodat Jethro hem liet gaan", "Zodat de herders hem volgden"],
        why: "Exodus 4:1–5",
      },
      {
        q: "Wat gebeurde er met de staf op de grond?",
        a: ["Hij werd een slang", "Hij begon te bloeien", "Hij brak in tweeën"],
        why: "Exodus 4:3",
      },
      { q: "Wie kwam Mozes tegemoet bij de berg van God?", a: ["Aäron", "Jethro", "Zippora"], why: "Exodus 4:27" },
      {
        q: "Wat deed het volk toen Aäron de tekenen deed?",
        a: ["Het geloofde en aanbad", "Het lachte Mozes uit", "Het trok meteen weg"],
        why: "Exodus 4:30–31",
      },
    ],
  },
  24: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "De farao zegt nee",
        stap: "exodus:uittocht:0",
        t: "Mozes en Aäron brengen de farao een boodschap van de HEERE: ‘Laat Mijn volk trekken’. Maar de farao zegt: ‘Wie is de HEERE, Wiens stem ik gehoorzamen zou?’ Hij geeft de Israëlieten geen stro meer voor de tichelstenen (bakstenen), maar ze moeten er evenveel maken. Toch belooft God dat Hij hen zal verlossen.",
      },
      {
        kop: "Plaag na plaag",
        stap: "exodus:uittocht:1",
        t: "Dan stuurt God plagen over Egypte. Het water in de rivier wordt bloed. Daarna komen er kikvorsen, luizen en ongedierte. Het vee van de Egyptenaren sterft, en mensen en dieren krijgen zweren. Hagel slaat alles op het veld kapot, en sprinkhanen eten op wat over is. Dan is het drie dagen dik duister. Maar in Gosen, waar Israël woont, komt geen ongedierte en geen hagel, en bij Israël is het licht.",
      },
      {
        kop: "Een hart dat hard blijft",
        t: "Soms belooft de farao dat het volk mag gaan. Bij de hagel zegt hij zelfs: ‘Ik heb mij ditmaal verzondigd’. Maar daarna verzwaart hij zijn hart weer: hij maakt het hard. Er staat ook dat de HEERE zijn hart verstokte. Met de plagen laat God weten ‘dat er niemand is gelijk Ik, op de ganse aarde’.",
      },
    ],
    vragen: [
      { q: "Wat kregen de Israëlieten niet meer om tichelstenen te maken?", a: ["Stro", "Klei", "Water"], why: "Exodus 5:7" },
      { q: "Wat gebeurde er met het water in de rivier?", a: ["Het werd bloed", "Het werd zout", "Het droogde op"], why: "Exodus 7:20" },
      {
        q: "Waarom viel er in Gosen geen hagel?",
        a: ["Daar woonde Israël, Gods volk", "Daar was het te warm voor hagel", "Daar woonde de farao"],
        why: "Exodus 8:22; Exodus 9:26",
      },
      {
        q: "Wat deed de farao als een plaag voorbij was?",
        a: ["Hij verzwaarde zijn hart weer", "Hij liet het volk meteen gaan", "Hij bedankte Mozes en Aäron"],
        why: "Exodus 8:15; Exodus 9:34",
      },
    ],
  },
  25: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Het lam en het bloed",
        stap: "exodus:uittocht:2",
        t: "God zegt tegen Mozes: ‘Ik zal nog een plaag over Farao, en over Egypte brengen’. Elk gezin slacht een lam zonder gebrek. Met een bosje hysop (een plant) strijken ze het bloed aan de deurposten en de bovendorpel: de balk boven de deur. God zegt: ‘wanneer Ik het bloed zie, zal Ik ulieden voorbijgaan’.",
      },
      {
        kop: "Een maaltijd met haast",
        stap: "exodus:uittocht:2",
        t: "Ze eten het vlees aan het vuur gebraden, met ongezuurde broden en bittere saus. Ongezuurd brood is brood zonder zuurdesem. Ze eten met de schoenen aan en de staf in de hand: ‘het is des HEEREN pascha’. Pascha betekent voorbijgaan. Elk jaar houdt Israël dit feest, en de ouders vertellen hun kinderen wat het betekent.",
      },
      {
        kop: "Weg uit Egypte",
        stap: "exodus:uittocht:3",
        t: "Om middernacht slaat de HEERE alle eerstgeborenen in Egypte. Er is geen huis zonder dode. Nog in de nacht stuurt de farao het volk weg. Ze nemen het deeg mee voordat het gerezen is, en trekken van Raämses naar Sukkoth. God leidt hen niet door het land van de Filistijnen, want dan zouden ze strijd zien en terug willen. De HEERE gaat voor hen uit, in een wolkkolom en een vuurkolom.",
      },
    ],
    vragen: [
      {
        q: "Waarom moest het bloed aan de deur?",
        a: [
          "Het was een teken, zodat God dat huis voorbijging",
          "Zo konden de Egyptenaren de huizen vinden",
          "Zo bleef het ongedierte buiten",
        ],
        why: "Exodus 12:13",
      },
      {
        q: "Wat moesten ouders doen als hun kinderen naar het pascha vroegen?",
        a: ["Vertellen dat de HEERE hun huizen voorbijging", "Zeggen dat het een oud gebruik was", "Hen naar Mozes sturen"],
        why: "Exodus 12:26–27",
      },
      {
        q: "Waarom was het deeg nog niet gerezen?",
        a: ["Ze werden weggestuurd en konden niet wachten", "Ze hadden geen meel meer", "Het was te koud in de nacht"],
        why: "Exodus 12:34, 39",
      },
      {
        q: "Waarom ging God niet langs het land van de Filistijnen?",
        a: ["Het volk zou de strijd zien en terug willen", "Die weg was veel langer", "Daar was geen water"],
        why: "Exodus 13:17",
      },
    ],
  },
  26: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Klem tussen zee en leger",
        stap: "exodus:uittocht:4",
        t: "God laat Israël kamperen bij Pi-Hachiroth, aan de zee. Dan krijgt de farao spijt dat hij het volk heeft laten gaan. Hij jaagt hen na met zeshonderd uitgekozen wagens, en zelfs met alle wagens van Egypte. Het volk ziet de Egyptenaren komen en wordt erg bang. Maar Mozes zegt: ‘Vreest niet, staat vast, en ziet het heil des HEEREN’. Dat betekent: wees niet bang, blijf staan en kijk hoe de HEERE jullie redt.",
      },
      {
        kop: "Een weg door de zee",
        stap: "exodus:uittocht:5",
        t: "Mozes strekt zijn hand uit over de zee, en de HEERE laat de hele nacht een sterke oostenwind waaien. Het water staat als een muur rechts en links, en Israël loopt over de droge bodem naar de overkant. De Egyptenaren gaan erachteraan. Als Mozes zijn hand opnieuw uitstrekt, komt het water terug. Van het leger van de farao blijft niemand over.",
      },
      {
        kop: "Een lied voor de HEERE",
        stap: "exodus:uittocht:6",
        t: "Zo verlost de HEERE Israël. Het volk vreest de HEERE en gelooft in Hem. Mozes en het volk zingen een lied: ‘Het paard en zijn ruiter heeft Hij in de zee geworpen.’ Mirjam, de zus van Aäron, neemt een trommel, en alle vrouwen gaan met haar mee.",
      },
    ],
    vragen: [
      {
        q: "Waarom werd het volk bij de zee erg bang?",
        a: [
          "Ze zagen het leger van de farao achter zich aan komen",
          "Er stak een zware storm op boven de zee",
          "Mozes was teruggegaan naar het land Egypte",
        ],
        why: "Exodus 14:10",
      },
      {
        q: "Wat gebeurde er toen Mozes zijn hand opnieuw uitstrekte?",
        a: ["Het water kwam terug", "Er kwam een tweede weg", "Het leger ging terug naar Egypte"],
        why: "Exodus 14:26–28",
      },
      {
        q: "Hoe maakte God de zee droog?",
        a: ["Met een sterke oostenwind, de hele nacht", "Met de warmte van de zon", "Met een aardbeving"],
        why: "Exodus 14:21",
      },
      {
        q: "Wat deed het volk na de redding?",
        a: ["Ze vreesden de HEERE en zongen een lied", "Ze gingen terug naar Egypte", "Ze bouwden een stad aan de zee"],
        why: "Exodus 14:31–15:1",
      },
    ],
  },
  27: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Bitter water wordt zoet",
        stap: "exodus:uittocht:7",
        t: "Drie dagen vindt Israël geen water in de woestijn Sur. In Mara is het water bitter. Het volk murmureert (moppert) tegen Mozes. De HEERE wijst Mozes een hout. Hij werpt het in het water, en het wordt zoet. God zegt: ‘Ik ben de HEERE, uw Heelmeester!’ Een heelmeester is iemand die geneest.",
      },
      {
        kop: "Brood uit de hemel",
        stap: "exodus:sinai:0",
        t: "In de woestijn Sin zegt het volk dat ze liever in Egypte waren gestorven, bij de vleespotten. ’s Avonds geeft God kwartels. ’s Morgens ligt er iets kleins en ronds op de grond. ‘Het is Man’, zeggen ze, want ze weten niet wat het is.",
      },
      {
        kop: "Genoeg voor elke dag",
        t: "Wie veel verzamelt, heeft niets over, en wie weinig verzamelt, komt niets tekort. Wat ze tot de morgen bewaren, krijgt wormen en stinkt. Maar op de zesde dag rapen ze dubbel, en dat blijft goed voor de sabbat, de rustdag.",
      },
      {
        kop: "Water uit de rots",
        stap: "exodus:sinai:1",
        t: "In Rafidim twist het volk met Mozes om water. Op Gods bevel slaat Mozes met zijn staf op de rots bij Horeb, en er komt water uit. Hij noemt de plaats Massa en Meriba: verzoeking en twist. Want het volk vroeg: ‘Is de HEERE in het midden van ons, of niet?’",
      },
    ],
    vragen: [
      {
        q: "Waarom konden ze het water van Mara eerst niet drinken?",
        a: ["Het was bitter", "Het was vies van de modder", "Het was te warm"],
        why: "Exodus 15:23",
      },
      {
        q: "Wat gebeurde er met manna dat tot de morgen werd bewaard?",
        a: ["Er kwamen wormen in en het stonk", "Het werd hard als steen", "Het werd vanzelf meer"],
        why: "Exodus 16:20",
      },
      {
        q: "Waarom rapen ze op de zesde dag dubbel?",
        a: ["Op de sabbat is er geen manna", "Ze hebben dan meer honger", "Dan komen er gasten"],
        why: "Exodus 16:23–26",
      },
      {
        q: "Waarom heet de plaats Massa en Meriba?",
        a: ["Het volk twistte en verzocht de HEERE", "Er kwam veel water uit de rots", "Er stonden veel palmbomen"],
        why: "Exodus 17:7",
      },
    ],
  },
  28: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Amalek valt aan",
        stap: "exodus:sinai:2",
        t: "Terwijl Israël in Rafidim is, komt Amalek en strijdt tegen Israël. Mozes zegt tegen Jozua: ‘Kies ons mannen, en trek uit, strijd tegen Amalek’. Zelf zal hij de volgende dag op de heuvel staan, met de staf van God in zijn hand. Later wordt Jozua de opvolger van Mozes.",
      },
      {
        kop: "Handen omhoog",
        t: "Mozes, Aäron en Hur klimmen op de heuvel. Zolang Mozes zijn hand opheft, is Israël de sterkste. Laat hij zijn hand zakken, dan is Amalek de sterkste. Als de handen van Mozes zwaar worden, leggen Aäron en Hur een steen neer, en Mozes gaat erop zitten. Zij ondersteunen zijn handen, de een aan de ene kant en de ander aan de andere kant, tot de zon ondergaat.",
      },
      {
        kop: "De HEERE is mijn Banier",
        t: "Zo verslaat Jozua Amalek met het zwaard. De HEERE zegt tegen Mozes dat hij dit moet opschrijven in een boek, om het te onthouden. Ook zegt God dat Hij Amalek helemaal zal laten verdwijnen. Mozes bouwt een altaar en noemt het: ‘De HEERE is mijn Banier!’ Een banier is een vaandel dat hoog wordt opgestoken. De naam wordt vaak zo uitgelegd: de overwinning komt van de HEERE.",
      },
    ],
    vragen: [
      { q: "Wat had Mozes in zijn hand op de heuvel?", a: ["De staf van God", "Een zwaard", "Een boekrol"], why: "Exodus 17:9" },
      {
        q: "Waarom legden Aäron en Hur een steen onder Mozes?",
        a: ["Zijn handen werden zwaar", "Hij wilde er een altaar van bouwen", "Hij moest hoger staan"],
        why: "Exodus 17:12",
      },
      {
        q: "Hoe lang hielden Aäron en Hur zijn handen omhoog?",
        a: ["Tot de zon onderging", "Drie dagen lang", "Tot de volgende morgen"],
        why: "Exodus 17:12",
      },
      {
        q: "Waarom moest Mozes dit opschrijven in een boek?",
        a: ["Om het te onthouden", "Omdat de farao het moest lezen", "Omdat Aäron erom vroeg"],
        why: "Exodus 17:14",
      },
    ],
  },
  29: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Aangekomen bij de Sinaï",
        stap: "exodus:sinai:4",
        t: "In de derde maand na de uittocht zet Israël de tenten op tegenover de berg Sinaï. God zegt dat Hij hen ‘op vleugelen der arenden gedragen’ heeft. Als ze Zijn verbond houden, zijn ze Zijn eigen volk. Een verbond is een vaste band met beloften. Het volk antwoordt: ‘Al wat de HEERE gesproken heeft, zullen wij doen!’",
      },
      {
        kop: "God spreekt vanaf de berg",
        stap: "exodus:sinai:5",
        t: "Op de derde dag dondert en bliksemt het. Er klinkt een zeer sterke bazuin. De berg rookt en beeft, want de HEERE daalt erop neer in vuur. Dan spreekt God: ‘Ik ben de HEERE uw God, Die u uit Egypteland, uit het diensthuis, uitgeleid heb.’ Het diensthuis is het slavenhuis. Daarna geeft Hij Zijn geboden. Het volk is bang en blijft van verre staan. Maar Mozes gaat naar de donkerheid waar God is.",
      },
      {
        kop: "Het bloed van het verbond",
        stap: "exodus:sinai:6",
        t: "Mozes schrijft de woorden van de HEERE op. Hij bouwt een altaar onder aan de berg en zet twaalf kolommen neer, voor de twaalf stammen. Na de offers sprenkelt hij het bloed op het altaar en op het volk. Daarna gaat hij de berg op, de wolk in. Hij blijft er veertig dagen en veertig nachten.",
      },
    ],
    vragen: [
      {
        q: "Wat beloofde het volk toen Mozes Gods woorden doorgaf?",
        a: ["Alles wat de HEERE zegt, zullen we doen", "We willen eerst rustig nadenken", "We gaan liever terug naar huis"],
        why: "Exodus 19:7–8",
      },
      {
        q: "Waarom rookte de hele berg?",
        a: ["De HEERE daalde erop neer in vuur", "Er brandde een groot bos op de berg", "Het volk verbrandde er offers"],
        why: "Exodus 19:18",
      },
      {
        q: "Wat zegt God over Zichzelf voordat Hij de geboden geeft?",
        a: ["Dat Hij hen uit Egypte heeft geleid", "Dat Hij de berg Sinaï heeft gemaakt", "Dat Hij hun een land met een stad geeft"],
        why: "Exodus 20:2",
      },
      {
        q: "Waarom bleef het volk van verre staan?",
        a: ["Ze waren bang voor de donder, de bazuin en de rook", "Ze moesten op hun vee passen", "Ze konden de berg niet goed zien"],
        why: "Exodus 20:18–19",
      },
      {
        q: "Wat deed Mozes met het bloed van het verbond?",
        a: ["Hij sprenkelde het op het altaar en op het volk", "Hij goot het uit in de beek", "Hij bewaarde het in zijn tent"],
        why: "Exodus 24:6–8",
      },
    ],
  },
  30: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een kalf van goud",
        stap: "exodus:sinai:7",
        t: "Mozes blijft lang weg. Het volk zegt tegen Aäron: ‘Maak ons goden, die voor ons aangezicht gaan’. Ze weten niet wat Mozes is overkomen. Van hun gouden oorringen maakt Aäron een gegoten kalf. Het volk roept: ‘Dit zijn uw goden, Israël!’ Ze offeren, eten, drinken en dansen. Maar God had gezegd: maak geen gesneden beeld (20:4).",
      },
      {
        kop: "Mozes breekt de tafelen",
        t: "God vertelt Mozes over het kalf. Mozes smeekt voor het volk, en God vernietigt hen niet. Mozes gaat naar beneden met de stenen tafelen. Als hij het kalf ziet, werpt hij de tafelen neer en ze breken. Hij verbrandt het kalf en maalt het fijn. Op bevel van de HEERE doden de Levieten drieduizend man. Mozes zegt: ‘Gijlieden hebt een grote zonde gezondigd’. De HEERE plaagt het volk om het kalf.",
      },
      {
        kop: "Barmhartig en genadig",
        t: "Mozes hakt twee nieuwe stenen tafelen uit en gaat weer de berg op. De HEERE gaat aan hem voorbij en roept: ‘HEERE, HEERE, God, barmhartig en genadig’. Dat betekent: vol medelijden, en goed voor wie het niet verdient. Hij vergeeft zonde. Als Mozes terugkomt, glinstert zijn gezicht.",
      },
    ],
    vragen: [
      {
        q: "Waarom wilde het volk dat Aäron goden maakte?",
        a: ["Ze wisten niet wat er met Mozes gebeurd was", "Aäron had hun dat zelf beloofd", "Ze hadden geen water meer"],
        why: "Exodus 32:1",
      },
      {
        q: "Waarom vernietigde de HEERE het volk niet?",
        a: ["Mozes smeekte voor het volk", "Het volk had al spijt", "Aäron vroeg om vergeving"],
        why: "Exodus 32:11–14; Psalm 106:23",
      },
      {
        q: "Wat deed Mozes met het kalf?",
        a: ["Hij verbrandde het en maalde het fijn", "Hij nam het mee de berg op", "Hij gaf het goud terug aan het volk"],
        why: "Exodus 32:20",
      },
      {
        q: "Wat riep de HEERE toen Hij aan Mozes voorbijging?",
        a: ["HEERE, HEERE, God, barmhartig en genadig", "Dit volk is niet meer Mijn volk", "Ga weg van deze heilige berg"],
        why: "Exodus 34:6",
      },
      {
        q: "Waarom durfde het volk eerst niet bij Mozes te komen?",
        a: ["Het vel van zijn gezicht glinsterde", "Hij was nog boos op hen", "Hij had de tafelen weer gebroken"],
        why: "Exodus 34:30",
      },
    ],
  },
  31: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Gekozen om te bouwen",
        t: "God roept Bezaleël uit de stam Juda bij zijn naam. Hij vervult hem met de Geest van God, met wijsheid en verstand. Zo kan hij werken met goud, zilver, koper, stenen en hout. Aholiab uit de stam Dan helpt hem, en ook anderen die wijs van hart zijn. Samen maken ze de tabernakel: de tent waar God wil wonen, midden tussen Zijn volk.",
      },
      {
        kop: "Meer dan genoeg",
        t: "Mozes vraagt om gaven voor de HEERE. Ieder ‘wiens hart vrijwillig is’, mag iets brengen. Ze brengen goud, zilver, koper, stoffen, vellen en hout. Elke morgen komt er meer. Dan zeggen de werklieden: ‘Het volk brengt te veel’. Mozes laat omroepen: breng niets meer.",
      },
      {
        kop: "De wolk op de tent",
        stap: "exodus:sinai:8",
        t: "Bezaleël maakt de ark: een kist met goud overtrokken. Op het gouden deksel, het verzoendeksel, staan twee cherubs met vleugels. Ook komen er een tafel, een gouden kandelaar, twee altaren en een koperen wasvat. Op de eerste dag van de eerste maand, in het tweede jaar, richt Mozes de tabernakel op. Dan bedekt de wolk de tent, en de heerlijkheid van de HEERE vult de tabernakel. Zelfs Mozes kan er niet in.",
      },
    ],
    vragen: [
      {
        q: "Waardoor kon Bezaleël zulk kunstig werk maken?",
        a: ["God had hem vervuld met Zijn Geest en wijsheid", "Hij was een broer van Mozes", "Hij was een zoon van Aäron"],
        why: "Exodus 31:2–5",
      },
      { q: "Uit welke stam kwam Aholiab?", a: ["Dan", "Juda", "Levi"], why: "Exodus 31:6" },
      {
        q: "Wie mochten er gaven voor de tabernakel brengen?",
        a: ["Ieder die het vrijwillig wilde", "Alleen de oversten van het volk", "Alleen de priesters en Levieten"],
        why: "Exodus 35:5, 21–22",
      },
      {
        q: "Waarom kon Mozes de tent niet ingaan?",
        a: ["De wolk bleef erop en Gods heerlijkheid vulde hem", "De deur van de tent was nog dicht", "Alleen Bezaleël mocht naar binnen"],
        why: "Exodus 40:35",
      },
    ],
  },
  32: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Aäron wordt priester",
        stap: "leviticus:verzoendag:0",
        t: "Bij de berg Sinaï wast Mozes Aäron en zijn zonen met water. Hij doet Aäron de priesterkleren aan en zalft hem met olie. Zo wordt Aäron geheiligd: apart gezet om God te dienen. Op de achtste dag brengt Aäron zelf de offers. Dan gaat er vuur uit van de HEERE en verteert het offer op het altaar. Het volk juicht en buigt zich met het gezicht naar de grond.",
      },
      {
        kop: "Vreemd vuur",
        stap: "leviticus:verzoendag:2",
        t: "Maar Nadab en Abihu, zonen van Aäron, brengen ‘vreemd vuur’ voor de HEERE: vuur dat Hij niet geboden had. Er gaat vuur uit van de HEERE, en ze sterven. Mozes zegt dat God geheiligd wil worden door wie dicht bij Hem komen. Dat betekent: God is heilig, en wie bij Hem komt, doet wat Hij zegt. Aäron zwijgt.",
      },
      {
        kop: "Eén dag in het jaar",
        stap: "leviticus:verzoendag:3",
        t: "Aäron mag niet zomaar achter het voorhangsel komen, bij de ark. Dat mag alleen op de tiende dag van de zevende maand. Dan sprenkelt hij daar bloed van een jonge stier en van een bok. Daarna belijdt hij alle zonden van Israël over een tweede, levende bok. Belijden is: zonden eerlijk noemen voor God. Een man brengt die bok de woestijn in.",
      },
    ],
    vragen: [
      {
        q: "Wat gebeurde er nadat Aäron de eerste offers had gebracht?",
        a: ["Vuur van de HEERE verteerde het offer", "Het begon hard te regenen", "Het altaar stortte in"],
        why: "Leviticus 9:22–24",
      },
      {
        q: "Waarom stierven Nadab en Abihu?",
        a: ["Ze brachten vuur dat God niet geboden had", "Ze hadden het volk niet gezegend", "Ze hadden geen priesterkleren aan"],
        why: "Leviticus 10:1–2",
      },
      {
        q: "Hoe vaak mocht Aäron achter het voorhangsel komen?",
        a: ["Eenmaal per jaar", "Elke sabbat", "Elke morgen"],
        why: "Leviticus 16:2, 34",
      },
      {
        q: "Waarom legde Aäron zijn handen op de kop van de levende bok?",
        a: ["Om de zonden van het volk op de bok te leggen", "Om de bok te zegenen voor de reis", "Om te zien of de bok gezond was"],
        why: "Leviticus 16:21",
      },
    ],
  },
  33: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Twaalf verspieders",
        stap: "numeri:woestijn:3",
        t: "Vanuit de woestijn Paran stuurt Mozes op Gods bevel twaalf mannen naar Kanaän, uit elke stam één. Ze moeten het land verspieden: ongemerkt gaan kijken hoe het is. Kaleb is erbij, en ook Hosea, die Mozes Jozua noemt. Veertig dagen trekken ze rond, tot Rechob in het noorden. In het dal Eskol snijden ze een tros druiven af, die ze met z’n tweeën aan een draagstok dragen.",
      },
      {
        kop: "Een goed land, een bang volk",
        stap: "numeri:woestijn:3",
        t: "Terug in Kades laten ze de vruchten zien. Het land ‘is van melk en honig vloeiende’: het is rijk en vruchtbaar. Maar het volk daar is sterk, de steden zijn groot, en ze zagen reuzen. Kaleb zegt: we kunnen het zeker innemen! De anderen zeggen: dat volk is sterker dan wij.",
      },
      {
        kop: "Veertig jaar in de woestijn",
        stap: "numeri:woestijn:4",
        t: "Het volk huilt die nacht en wil terug naar Egypte. Jozua en Kaleb zeggen: ‘de HEERE is met ons; vreest hen niet!’ Maar het volk wil hen stenigen. Mozes bidt voor het volk, en God vergeeft. Toch zegt Hij: wie twintig jaar of ouder is, zal in de woestijn sterven, behalve Kaleb en Jozua. Veertig jaar blijft het volk in de woestijn: een jaar voor elke dag.",
      },
    ],
    vragen: [
      {
        q: "Wat moesten de verspieders in Kanaän bekijken?",
        a: ["Het land, het volk en de steden", "Alleen de rivieren en de bergen", "Alleen het paleis van de koning"],
        why: "Numeri 13:18–20",
      },
      { q: "Welke nieuwe naam gaf Mozes aan Hosea?", a: ["Jozua", "Kaleb", "Eleazar"], why: "Numeri 13:16" },
      {
        q: "Waarom wilde het volk het land niet in?",
        a: ["Ze waren bang voor het sterke volk daar", "Ze hadden geen eten meer", "Mozes had het verboden"],
        why: "Numeri 13:31; Numeri 14:1–4",
      },
      {
        q: "Waarom moest het volk juist veertig jaar in de woestijn blijven?",
        a: [
          "Een jaar voor elke dag dat ze het land verspied hadden",
          "Omdat de weg naar Kanaän zo lang was",
          "Omdat Edom hen niet doorliet",
        ],
        why: "Numeri 14:34",
      },
      {
        q: "Waar kwamen de verspieders terug bij Mozes en het volk?",
        a: ["In Kades, in de woestijn Paran", "In Hebron, bij de kinderen van Enak", "In Egypte, bij de farao"],
        why: "Numeri 13:26",
      },
    ],
  },
  34: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Water uit de rots",
        stap: "numeri:woestijn:5",
        t: "Het volk is weer in Kades. Daar sterft Mirjam. Er is geen water, en het volk twist met Mozes en Aäron. God zegt: spreek tegen de rots, dan geeft hij water. Maar Mozes roept: ‘Hoort toch, gij wederspannigen’, en slaat twee keer met zijn staf op de rots. Wederspannigen zijn mensen die tegen God ingaan. Er komt veel water. Toch zegt God: omdat jullie Mij niet geloofd hebben, zullen jullie dit volk niet in het land brengen.",
      },
      {
        kop: "Aäron sterft op de berg Hor",
        stap: "numeri:woestijn:6",
        t: "Edom laat Israël niet door zijn land. Op de berg Hor trekt Mozes Aäron zijn priesterkleren uit en doet ze zijn zoon Eleazar aan. Aäron sterft op de top van de berg. Heel Israël beweent hem dertig dagen.",
      },
      {
        kop: "Kijken en leven",
        stap: "numeri:woestijn:7",
        t: "Op de lange weg om Edom heen wordt het volk moedeloos. Ze spreken tegen God en Mozes en walgen van ‘dit zeer lichte brood’: het manna. Dan stuurt de HEERE vurige slangen, en veel mensen sterven. Het volk zegt: ‘Wij hebben gezondigd’, en Mozes bidt. God zegt: maak een slang en zet hem op een paal. Mozes maakt een koperen slang. Wie gebeten is en ernaar kijkt, blijft leven.",
      },
    ],
    vragen: [
      {
        q: "Wat deed Mozes bij de rots?",
        a: ["Hij sloeg twee keer met zijn staf op de rots", "Hij groef een put naast de rots", "Hij bad de hele nacht bij de rots"],
        why: "Numeri 20:11",
      },
      {
        q: "Waarom mochten Mozes en Aäron het volk niet in het land brengen?",
        a: ["Ze hadden God niet geloofd en niet geheiligd", "Ze waren te oud geworden", "Het volk wilde een andere leider"],
        why: "Numeri 20:12",
      },
      {
        q: "Wie kreeg de priesterkleren van Aäron?",
        a: ["Eleazar, zijn zoon", "Jozua, de dienaar van Mozes", "Kaleb, de verspieder"],
        why: "Numeri 20:26–28",
      },
      {
        q: "Waarom moest het volk om Edom heen trekken?",
        a: ["Edom liet hen niet door zijn land", "De weg door Edom was te droog", "Er woonden reuzen in Edom"],
        why: "Numeri 20:18–21",
      },
      {
        q: "Waarom stuurde de HEERE de vurige slangen?",
        a: ["Het volk sprak tegen God en tegen Mozes", "Mozes had op de rots geslagen", "Het volk had geen offers gebracht"],
        why: "Numeri 21:5–7",
      },
    ],
  },
  35: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Balak roept Bileam",
        stap: "numeri:moab:0",
        t: "Israël kampeert in de vlakten van Moab, tegenover Jericho. Balak, de koning van Moab, ziet wat Israël met de Amorieten gedaan heeft en is bang. Hij stuurt boden met loon naar Bileam in Pethor: kom en vervloek dit volk. Vervloeken betekent: onheil over iemand uitspreken. Maar God zegt: ‘gij zult dat volk niet vloeken, want het is gezegend.’ Later zegt God: ga mee, maar doe alleen wat Ik tot u spreek.",
      },
      {
        kop: "De ezelin ziet de Engel",
        t: "Onderweg staat de Engel van de HEERE op de weg, met een getrokken zwaard. De ezelin ziet Hem en wijkt uit: het veld in, tegen een muur, en ten slotte gaat ze liggen. Drie keer slaat Bileam haar. Dan opent de HEERE de mond van de ezelin: ‘Wat heb ik u gedaan, dat gij mij nu driemaal geslagen hebt?’ Dan ziet ook Bileam de Engel.",
      },
      {
        kop: "Zegen in plaats van vloek",
        t: "Balak neemt Bileam mee naar hoge plaatsen, vanwaar ze Israël zien. Telkens worden er zeven altaren gebouwd. Maar Bileam zegent Israël: ‘Hoe goed zijn uw tenten, Jakob!’ Balak wordt boos: hij heeft Bileam geroepen om te vloeken, en nu heeft hij drie keer gezegend.",
      },
    ],
    vragen: [
      {
        q: "Waarom was Balak bang voor Israël?",
        a: ["Hij zag wat Israël met de Amorieten had gedaan", "Israël had zijn stad al ingenomen", "Mozes had hem met oorlog gedreigd"],
        why: "Numeri 22:2–3",
      },
      {
        q: "Wat zei God toen Bileam vertelde wat Balak wilde?",
        a: ["Ga niet mee, want dat volk is gezegend", "Ga mee en vervloek het volk", "Wacht tot Mozes je roept"],
        why: "Numeri 22:12",
      },
      {
        q: "Waarom ging de ezelin van de weg af?",
        a: ["Ze zag de Engel van de HEERE staan", "Ze was moe van de lange reis", "Ze was bang voor een leeuw"],
        why: "Numeri 22:23",
      },
      { q: "Wie opende de mond van de ezelin?", a: ["De HEERE", "Bileam", "Balak"], why: "Numeri 22:28" },
    ],
  },
  36: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Laatste woorden in Moab",
        stap: "numeri:moab:3",
        t: "Het volk Israël is in de vlakten van Moab, vlak bij de Jordaan. Daar spreekt Mozes het volk toe. Hij zet zegen en vloek voor hen: zegen als ze naar de HEERE luisteren, vloek als ze dat niet doen. Hij zegt: ‘Kiest dan het leven’. Dat betekent: heb de HEERE lief en wees Hem gehoorzaam.",
      },
      {
        kop: "Jozua wordt de nieuwe leider",
        t: "Mozes is honderdtwintig jaar oud. Hij mag de Jordaan niet over, omdat hij God bij het water van Kades niet geheiligd had. Dat betekent: hij had God daar voor het volk niet als heilig geëerd. Mozes roept Jozua. Voor de ogen van heel Israël zegt hij: ‘Wees sterk en heb goeden moed’. Mozes schrijft de wet op en geeft die aan de priesters. Voor zijn dood zegent hij de stammen van Israël.",
      },
      {
        kop: "Mozes op de berg Nebo",
        stap: "numeri:moab:4",
        t: "Dan klimt Mozes de berg Nebo op, tegenover Jericho. De HEERE laat hem het hele land zien dat Hij aan Abraham, Izak en Jakob beloofd heeft. Mozes mag het zien, maar er niet heen gaan. Daar sterft Mozes, ‘de knecht des HEEREN’. God begraaft hem in een dal in Moab. Niemand weet waar zijn graf is. Israël rouwt dertig dagen om hem.",
      },
    ],
    vragen: [
      {
        q: "Waarom mocht Mozes de Jordaan niet over?",
        a: ["Hij had God bij Kades niet geheiligd", "Hij wilde liever in Moab blijven", "Het volk wilde hem niet mee"],
        why: "Deuteronomium 32:51–52",
      },
      {
        q: "Wat geeft Mozes aan de priesters?",
        a: ["De wet die hij opgeschreven heeft", "De staf waarmee hij wonderen deed", "Twaalf stenen uit de Jordaan"],
        why: "Deuteronomium 31:9",
      },
      {
        q: "Wat gebeurt er eerst?",
        a: ["Mozes zegent de stammen", "Mozes sterft op de berg", "Israël rouwt dertig dagen"],
        why: "Deuteronomium 33:1; Deuteronomium 34:5–8",
      },
      {
        q: "Wat zegt de HEERE op de berg tegen Mozes?",
        a: ["Je mag het land zien, maar er niet heen gaan", "Je mag morgen als eerste het land in", "Je moet terug naar de berg Sinaï"],
        why: "Deuteronomium 34:4",
      },
    ],
  },
  37: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Jozua krijgt de leiding",
        stap: "jozua:intocht:0",
        t: "Na de dood van Mozes spreekt de HEERE tot Jozua: trek met het volk over de Jordaan, naar het land dat Ik hun geef. Overdenk het wetboek dag en nacht. Drie keer zegt God: ‘wees sterk en heb goeden moed’. Hij belooft: ‘Ik zal u niet begeven, en zal u niet verlaten.’ Dat betekent: Ik laat je niet alleen.",
      },
      {
        kop: "Twee verspieders in Jericho",
        stap: "jozua:intocht:1",
        t: "Vanuit Sittim stuurt Jozua in het geheim twee verspieders naar Jericho, om het land te verkennen. Ze komen bij Rachab, die op de stadsmuur woont. De koning laat zeggen: ‘Breng de mannen uit’. Maar Rachab heeft hen op het dak verborgen, onder het vlas. Ze zegt dat ze al weg zijn. De achtervolgers zoeken hen op de weg naar de Jordaan.",
      },
      {
        kop: "Een rood koord aan het venster",
        t: "Rachab zegt: ‘Ik weet, dat de HEERE u dit land gegeven heeft.’ Ze heeft gehoord dat Hij de Schelfzee droog maakte. Omdat ze hen geholpen heeft, vraagt ze of ze haar familie willen sparen. Ze laat hen met een touw door het venster zakken. Bindt ze daar een rood koord aan, dan wordt iedereen in haar huis gespaard. Na drie dagen in het gebergte gaan ze naar Jozua.",
      },
    ],
    vragen: [
      {
        q: "Wat moet Jozua dag en nacht overdenken?",
        a: ["Het boek van de wet", "De kaart van het land", "De namen van de stammen"],
        why: "Jozua 1:8",
      },
      {
        q: "Waarom jagen de mannen van de koning de verspieders achterna?",
        a: ["Rachab zegt dat ze al weg zijn", "Ze hebben hen op het dak gezien", "Rachab stuurt hen naar het gebergte"],
        why: "Jozua 2:4–7; Jozua 2:22",
      },
      {
        q: "Wat heeft Rachab over Israël gehoord?",
        a: ["Dat de HEERE de Schelfzee droog maakte", "Dat Israël de Jordaan al over was", "Dat Mozes koning van Egypte was"],
        why: "Jozua 2:10",
      },
      {
        q: "Waarom beloven de verspieders Rachab en haar familie te sparen?",
        a: ["Zij heeft de verspieders geholpen", "Zij is familie van Jozua", "Zij heeft de koning gewaarschuwd"],
        why: "Jozua 2:12–14",
      },
    ],
  },
  38: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "De ark gaat voorop",
        stap: "jozua:intocht:2",
        t: "Het volk trekt van Sittim naar de Jordaan. Ze moeten de ark van het verbond volgen, de kist van de HEERE, op tweeduizend el afstand: bijna een kilometer. Zo weten ze de weg, want die zijn ze nooit gegaan. Jozua zegt: ‘Heiligt u! want morgen zal de HEERE wonderheden in het midden van ulieden doen.’ Dat betekent: maak je klaar voor de HEERE. Dan dragen de priesters de ark voorop.",
      },
      {
        kop: "Droog door de volle rivier",
        t: "Het is oogsttijd, en de Jordaan staat tot aan de oevers vol. Zodra de voeten van de priesters in het water komen, blijft het water van boven staan, als een hoop, heel ver weg. De priesters staan met de ark midden in de Jordaan op het droge. Zo trekt heel Israël over, tegenover Jericho.",
      },
      {
        kop: "Twaalf stenen in Gilgal",
        stap: "jozua:intocht:3",
        t: "Uit elke stam neemt één man een steen uit de rivier, waar de priesters staan. Als de priesters uit de Jordaan komen, stroomt het water weer zoals eerst. In Gilgal zet Jozua de twaalf stenen neer. Als kinderen later vragen wat die stenen betekenen, moeten de ouders vertellen: ‘Op het droge is Israël door deze Jordaan gegaan.’",
      },
    ],
    vragen: [
      {
        q: "Waarom moest het volk de ark volgen?",
        a: ["Ze waren die weg nog nooit gegaan", "De ark was te zwaar voor de priesters", "Ze moesten de priesters beschermen"],
        why: "Jozua 3:3–4",
      },
      {
        q: "Wie mochten een steen uit de rivier halen?",
        a: ["Uit elke stam één man", "Alleen de priesters", "Alleen Jozua en Kaleb"],
        why: "Jozua 4:2–5",
      },
      {
        q: "Wanneer begon de Jordaan weer te stromen?",
        a: ["Toen de priesters uit de rivier kwamen", "Toen Jozua de stenen neerzette", "Toen het weer begon te regenen"],
        why: "Jozua 4:18",
      },
      {
        q: "Waarom moesten de stenen in Gilgal staan?",
        a: ["Zodat kinderen later horen wat God deed", "Om er een huis van te bouwen", "Om de weg naar Jericho te wijzen"],
        why: "Jozua 4:21–22",
      },
    ],
  },
  39: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Pascha in Gilgal",
        stap: "jozua:intocht:3",
        t: "Israël is door de Jordaan getrokken en heeft zijn kamp in Gilgal, bij Jericho. Daar vieren ze het Pascha. Ze eten van het koren van het land, en de volgende dag houdt het manna op.",
      },
      {
        kop: "De Vorst van het leger",
        stap: "jozua:intocht:4",
        t: "Bij Jericho ziet Jozua een Man met een getrokken zwaard. Hij zegt: ‘Ik ben de Vorst van het heir des HEEREN’. Dat betekent: de Aanvoerder van het leger van de HEERE. Jozua valt op zijn gezicht en aanbidt. Hij moet zijn schoenen uittrekken: de plaats is heilig.",
      },
      {
        kop: "Zeven dagen om de stad",
        t: "Zes dagen lang trekt het leger één keer om Jericho. Zeven priesters gaan voor de ark uit en blazen op ramsbazuinen: trompetten van ramshoorn. Het volk zwijgt. Op de zevende dag gaan ze zeven keer rond. Dan roept Jozua: ‘Juicht, want de HEERE heeft ulieden de stad gegeven!’ Het volk juicht, en de muur valt.",
      },
      {
        kop: "Rachab blijft leven",
        t: "Israël neemt de stad in. Alle mensen en dieren worden gedood, zoals Jozua gezegd had. De stad wordt verbrand. Het zilver en goud gaan naar de schat van de HEERE. Alleen Rachab en haar familie blijven leven, omdat zij de verspieders verborgen had.",
      },
    ],
    vragen: [
      { q: "Waar vierde het volk het Pascha?", a: ["In Gilgal", "In de stad Jericho", "Aan de oostkant van de Jordaan"], why: "Jozua 5:10" },
      {
        q: "Waarom moest Jozua zijn schoenen uittrekken?",
        a: ["De plaats waar hij stond was heilig", "Zijn schoenen waren versleten", "Hij moest door een rivier lopen"],
        why: "Jozua 5:15",
      },
      {
        q: "Wie gingen er met ramsbazuinen voor de ark uit?",
        a: ["Zeven priesters", "Twaalf oudsten", "Jozua en Kaleb"],
        why: "Jozua 6:4, 8",
      },
      {
        q: "Hoe vaak gingen ze in totaal om de stad, alle zeven dagen samen?",
        a: ["Dertien keer", "Zeven keer", "Veertien keer"],
        why: "Jozua 6:14–15",
      },
      {
        q: "Waarom bleef Rachab leven?",
        a: ["Zij had de verspieders verborgen", "Zij woonde buiten de stad", "Zij was familie van Jozua"],
        why: "Jozua 6:17, 25",
      },
    ],
  },
  40: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Gestolen uit Jericho",
        stap: "jozua:intocht:5",
        t: "Niemand mocht iets nemen van wat in Jericho ‘verbannen’ was: dat was voor de HEERE. Maar Achan uit de stam Juda neemt er toch iets van. Dan gaan ongeveer drieduizend man naar Ai. Ze vluchten; ongeveer zesendertig van hen sterven.",
      },
      {
        kop: "De HEERE wijst Achan aan",
        stap: "jozua:intocht:5",
        t: "Jozua scheurt zijn kleren en ligt tot de avond voor de ark. De HEERE zegt: ‘Israël heeft gezondigd’. De HEERE wijst eerst de stam Juda aan, dan een familie en dan Achan. Achan bekent: hij zag een mooie mantel, zilver en een staaf goud, kreeg er lust toe en nam ze. In het dal Achor stenigt Israël hem.",
      },
      {
        kop: "Een hinderlaag bij Ai",
        stap: "jozua:intocht:6",
        t: "Nu zegt de HEERE: ‘Vrees niet’. Soldaten verstoppen zich tussen Bethel en Ai: een hinderlaag. Jozua doet alsof hij vlucht, en de mannen van Ai jagen hem na. Jozua steekt op Gods bevel zijn speer uit. Dan neemt de hinderlaag de stad in en steekt haar in brand. Alle inwoners van Ai worden gedood.",
      },
      {
        kop: "De wet op de berg Ebal",
        stap: "jozua:intocht:7",
        t: "Op de berg Ebal bouwt Jozua een altaar, zoals Mozes geboden had. Hij leest de hele wet voor, de zegen en de vloek. Ook de vrouwen, de kinderen en de vreemdelingen luisteren.",
      },
    ],
    vragen: [
      {
        q: "Waarom moest Israël de eerste keer vluchten voor Ai?",
        a: ["Israël had gezondigd: er was gestolen", "Ai had hogere muren dan Jericho", "De priesters hadden niet geblazen"],
        why: "Jozua 7:11–12",
      },
      {
        q: "Hoe wees de HEERE aan wie het gedaan had?",
        a: ["Eerst de stam, dan de familie en ten slotte Achan", "Achan meldde zich meteen zelf", "Een verspieder had Achan gezien"],
        why: "Jozua 7:16–18",
      },
      {
        q: "Hoe begon het bij Achan, volgens zijn eigen woorden?",
        a: ["Hij zag het en kreeg er lust toe", "Iemand anders gaf het hem", "Jozua zei dat hij het mocht houden"],
        why: "Jozua 7:21",
      },
      { q: "Waar lag de hinderlaag?", a: ["Tussen Bethel en Ai", "Bij de Jordaan", "In de stad Jericho"], why: "Jozua 8:9, 12" },
      {
        q: "Wie hoorden de wet voorlezen op de berg Ebal?",
        a: ["Het hele volk, ook vrouwen en kinderen", "Alleen de priesters", "Alleen de oudsten"],
        why: "Jozua 8:35",
      },
    ],
  },
  41: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een list met oud brood",
        stap: "jozua:land:0",
        t: "De inwoners van Gibeon horen wat Jozua met Jericho en Ai gedaan heeft. Ze bedenken een list. Met oude kleren, versleten schoenen en droog, beschimmeld brood komen ze in Gilgal. Ze zeggen dat ze uit een ver land komen. Israël vraagt de HEERE niet om raad, en Jozua sluit vrede met hen. Drie dagen later blijkt dat ze vlakbij wonen. Toch blijven ze leven, want de leiders hebben gezworen bij de HEERE. Wel moeten ze hout hakken en water putten.",
      },
      {
        kop: "De zon staat stil",
        stap: "jozua:land:1",
        t: "Vijf koningen van de Amorieten vallen Gibeon aan. Jozua trekt de hele nacht door om te helpen. De HEERE werpt grote hagelstenen op de vijanden. Dan zegt Jozua: ‘Zon, sta stil te Gibeon’. De zon blijft bijna een hele dag staan, want de HEERE strijdt voor Israël.",
      },
      {
        kop: "Kies wie u dienen zult",
        stap: "jozua:land:6",
        t: "Later roept Jozua alle stammen bij elkaar in Sichem. Hij zegt: ‘kiest u heden, wien gij dienen zult’. Dat betekent: kies vandaag wie je wilt dienen. En: ‘aangaande mij, en mijn huis, wij zullen den HEERE dienen!’ Het volk belooft de HEERE te dienen. Jozua sterft als hij honderdtien jaar oud is.",
      },
    ],
    vragen: [
      {
        q: "Waarom lieten de Israëlieten de Gibeonieten toch leven?",
        a: [
          "De leiders hadden het bij de HEERE gezworen",
          "De Gibeonieten waren familie van Jozua",
          "De Gibeonieten hadden de verspieders verborgen",
        ],
        why: "Jozua 9:18–20",
      },
      {
        q: "Hoe kwamen de Israëlieten erachter dat ze bedrogen waren?",
        a: ["Na drie dagen hoorden ze dat Gibeon vlakbij lag", "De HEERE zei het meteen tegen Jozua", "Het brood bleek toch vers te zijn"],
        why: "Jozua 9:16",
      },
      { q: "Wie vielen Gibeon aan?", a: ["Vijf koningen van de Amorieten", "De Filistijnen", "De koning van Egypte"], why: "Jozua 10:5" },
      {
        q: "Wat moesten de Gibeonieten voortaan doen?",
        a: ["Hout hakken en water putten", "Het leger van Israël leiden", "De ark van de HEERE dragen"],
        why: "Jozua 9:21, 27",
      },
      { q: "Waar riep Jozua alle stammen bij elkaar?", a: ["In Sichem", "In Gilgal", "In Jericho"], why: "Jozua 24:1" },
    ],
  },
  42: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Onderdrukt door Jabin",
        stap: "richteren:debora:1",
        t: "Israël doet weer wat kwaad is in de ogen van de HEERE. Daarom geeft Hij hen in de hand van Jabin, koning in Hazor. Zijn legeroverste Sisera heeft negenhonderd ijzeren wagens. Twintig jaar lang wordt Israël onderdrukt. Dan roepen ze tot de HEERE. Debora is dan richter en profetes: God spreekt door haar. Ze spreekt recht onder een palmboom tussen Rama en Bethel.",
      },
      {
        kop: "Barak en de berg Tabor",
        stap: "richteren:debora:2",
        t: "Debora roept Barak uit Kedes-Naftali. De HEERE wil dat hij met tienduizend man van Naftali en Zebulon naar de berg Tabor gaat. Barak wil alleen gaan als zij meegaat. Ze gaat mee, maar zegt: de eer is niet voor jou, want de HEERE zal Sisera in de hand van een vrouw geven.",
      },
      {
        kop: "De slag bij de beek Kison",
        stap: "richteren:debora:3",
        t: "Sisera komt met zijn wagens naar de beek Kison. Barak trekt de berg af. De HEERE verslaat Sisera en zijn hele leger.",
      },
      {
        kop: "In de tent van Jaël",
        stap: "richteren:debora:4",
        t: "Sisera klimt van zijn wagen en vlucht te voet naar de tent van Jaël, de vrouw van Heber de Keniet. Zij geeft hem melk. Als hij slaapt, doodt ze hem met een tentpin. Debora en Barak zingen een lied voor de HEERE, en het land heeft veertig jaar rust.",
      },
    ],
    vragen: [
      {
        q: "Waarom gaf de HEERE Israël in de hand van Jabin?",
        a: ["Ze deden wat kwaad was in Zijn ogen", "Ze hadden Jabin eerst aangevallen", "Ze waren met te weinig mensen"],
        why: "Richteren 4:1–2",
      },
      {
        q: "Waarom zou de eer niet voor Barak zijn, volgens Debora?",
        a: ["De HEERE zou Sisera in de hand van een vrouw geven", "Barak zou de strijd verliezen", "Sisera zou ontsnappen naar Hazor"],
        why: "Richteren 4:9",
      },
      {
        q: "Uit welke stammen kwamen de tienduizend man?",
        a: ["Naftali en Zebulon", "Ruben en Gad", "Juda en Simeon"],
        why: "Richteren 4:6, 10",
      },
      { q: "Bij welke beek werd Sisera verslagen?", a: ["De beek Kison", "De beek Krith", "De beek Kidron"], why: "Richteren 4:13–15" },
      { q: "Wie was Jaël?", a: ["De vrouw van Heber de Keniet", "De zus van Debora", "Een dochter van Jabin"], why: "Richteren 4:17" },
    ],
  },
  43: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een held bij de pers",
        stap: "richteren:debora:5",
        t: "Israël doet kwaad in de ogen van de HEERE. Daarom geeft Hij hen zeven jaar in de hand van de Midianieten. Die komen zo talrijk als sprinkhanen en eten alles op. In Ofra dorst Gideon tarwe bij de pers, verstopt voor hen. De Engel van de HEERE zegt: ‘De HEERE is met u, gij, strijdbare held!’ Strijdbaar betekent: dapper in de strijd. Gideon moet Israël verlossen.",
      },
      {
        kop: "Te veel soldaten",
        stap: "richteren:debora:7",
        t: "In opdracht van God breekt Gideon ’s nachts het altaar van de afgod Baäl af. Met het wollen vlies geeft God hem twee keer een teken. Dan zegt God: ‘Des volks is te veel’. Israël mag later niet denken dat het zichzelf verlost heeft. Wie bang is, gaat naar huis. Bij het water houdt God er driehonderd over.",
      },
      {
        kop: "Bazuinen, kruiken en fakkels",
        stap: "richteren:debora:8",
        t: "’s Nachts staan de driehonderd rondom het kamp. Ze blazen op de bazuinen, breken de kruiken met de fakkels in hun linkerhand. Ze roepen: ‘Het zwaard van den HEERE, en van Gideon!’ De HEERE laat de vijanden elkaar aanvallen, en ze vluchten. Later wil Israël Gideon als koning. Maar hij zegt: ‘de HEERE zal over u heersen.’",
      },
    ],
    vragen: [
      { q: "In welke plaats komt de Engel bij Gideon?", a: ["Ofra", "Harod", "Gaza"], why: "Richteren 6:11" },
      {
        q: "Waarom dorst Gideon de tarwe bij de pers?",
        a: ["Om die te verbergen voor de Midianieten", "Omdat het daar het droogst was", "Omdat zijn vader dat had gevraagd"],
        why: "Richteren 6:11",
      },
      {
        q: "Waarom stuurt God de meeste soldaten naar huis?",
        a: [
          "Israël mag niet zeggen dat het zichzelf verlost heeft",
          "Er is niet genoeg eten voor zoveel soldaten",
          "De vijand is al weggevlucht",
        ],
        why: "Richteren 7:2",
      },
      {
        q: "Wat gebeurt er eerst?",
        a: ["Gideon breekt het altaar van Baäl af", "De driehonderd breken hun kruiken", "Israël wil Gideon als koning"],
        why: "Richteren 6:27–28",
      },
      {
        q: "Wat zegt Gideon als Israël hem koning wil maken?",
        a: ["De HEERE zal over u heersen", "Mijn zoon zal over u heersen", "Ik zal veertig jaar over u heersen"],
        why: "Richteren 8:22–23",
      },
    ],
  },
  44: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een belofte in Zora",
        stap: "richteren:simson:0",
        t: "Israël doet weer kwaad, en veertig jaar heersen de Filistijnen. In Zora woont Manoach. Zijn vrouw krijgt geen kinderen. De Engel van de HEERE zegt haar dat ze een zoon krijgt. Er mag nooit een scheermes op zijn hoofd komen, want hij is een nazireeër: apart gezet voor God. Ook zegt Hij: ‘hij zal beginnen Israël te verlossen uit der Filistijnen hand.’ Ze noemt hem Simson.",
      },
      {
        kop: "De leeuw bij Timna",
        stap: "richteren:simson:1",
        t: "Simson wil trouwen met een Filistijnse vrouw uit Timna. Zijn ouders vragen of er geen vrouw bij hun eigen volk is. Zij weten niet ‘dat dit van den HEERE was’. Bij Timna komt een jonge leeuw brullend op hem af. De Geest van de HEERE komt over Simson, en hij scheurt de leeuw uiteen.",
      },
      {
        kop: "Een raadsel op de bruiloft",
        stap: "richteren:simson:2",
        t: "Later vindt hij honing in de dode leeuw. Op de bruiloft geeft hij dertig Filistijnen een raadsel: ‘Spijze ging uit van den eter, en zoetigheid ging uit van den sterke.’ Ze dreigen zijn vrouw. Zij dringt aan tot hij het haar vertelt, en verraadt het antwoord. Simson doodt dertig man in Askelon en betaalt met hun kleren.",
      },
    ],
    vragen: [
      { q: "In welke plaats woonden Manoach en zijn vrouw?", a: ["Zora", "Timna", "Askelon"], why: "Richteren 13:2" },
      {
        q: "Waarom mocht er nooit een scheermes op Simsons hoofd komen?",
        a: ["Hij zou een nazireeër van God zijn", "Zijn moeder wilde dat hij lang haar had", "Dat was een gewoonte van de Filistijnen"],
        why: "Richteren 13:5",
      },
      {
        q: "Wat vroegen Simsons ouders toen hij met een Filistijnse wilde trouwen?",
        a: ["Of er geen vrouw bij hun eigen volk was", "Of ze uit een rijke familie kwam", "Of ze wel in Zora wilde wonen"],
        why: "Richteren 14:3",
      },
      {
        q: "Wat is het antwoord op het raadsel?",
        a: ["Honing uit een leeuw", "Brood uit een oven", "Melk van een geit"],
        why: "Richteren 14:8–9, 14, 18",
      },
    ],
  },
  45: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Driehonderd vossen",
        stap: "richteren:simson:2",
        t: "Simson wil naar zijn vrouw in Timna. Maar haar vader heeft haar aan een andere man gegeven. Simson vangt driehonderd vossen en zet telkens een fakkel tussen twee staarten. De vossen rennen door het koren van de Filistijnen, en alles brandt af, tot de wijngaarden en olijfbomen toe. Dan verbranden de Filistijnen Simsons vrouw en haar vader. Simson neemt wraak en gaat wonen op de rots Etam.",
      },
      {
        kop: "Gebonden door Juda",
        stap: "richteren:simson:3",
        t: "Een leger van de Filistijnen komt naar Juda om Simson te binden. Drieduizend mannen van Juda gaan naar hem toe. Ze willen hem binden en aan de Filistijnen overgeven. Simson laat zich binden met twee nieuwe touwen. Zo brengen ze hem naar Lechi.",
      },
      {
        kop: "Een ezelskaak en een bron",
        stap: "richteren:simson:3",
        t: "De Filistijnen juichen. Maar de Geest van de HEERE komt over Simson, en de touwen worden als verbrande draden. Met een verse ezelskaak verslaat hij duizend man. Daarna heeft hij grote dorst en roept tot de HEERE: ‘zou ik dan nu van dorst sterven’? God laat water komen uit een holle plaats in Lechi. Twintig jaar is Simson richter: hij leidt Israël.",
      },
    ],
    vragen: [
      {
        q: "Wat was er gebeurd voordat Simson de vossen ving?",
        a: ["Zijn vrouw was aan een ander gegeven", "De Filistijnen hadden zijn huis verbrand", "Zijn ouders waren gestorven"],
        why: "Richteren 15:1–4",
      },
      {
        q: "Waarom kwamen de mannen van Juda naar Simson?",
        a: ["Om hem te binden en aan de Filistijnen te geven", "Om hem te vragen hun koning te worden", "Om hem eten en water te brengen"],
        why: "Richteren 15:10–12",
      },
      {
        q: "Wat gebeurde er met de touwen bij Lechi?",
        a: ["Ze werden als verbrande draden", "Ze werden nog strakker vastgebonden", "De Filistijnen sneden ze los"],
        why: "Richteren 15:14",
      },
      {
        q: "Waar liet God water uit komen?",
        a: ["Uit een holle plaats in Lechi", "Uit de rots Etam", "Uit de beek bij Timna"],
        why: "Richteren 15:19",
      },
    ],
  },
  46: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "De poort van Gaza",
        stap: "richteren:simson:4",
        t: "Simson is in de Filistijnse stad Gaza. De mannen van Gaza wachten de hele nacht bij de poort om hem ’s morgens te doden. Om middernacht neemt Simson de poortdeuren weg, met de posten. Hij draagt ze op zijn schouders een berg op, tegenover Hebron.",
      },
      {
        kop: "Het geheim van Simson",
        stap: "richteren:simson:5",
        t: "Later krijgt Simson Delila lief, aan de beek Sorek. Elke Filistijnse vorst belooft haar elfhonderd zilverlingen als ze ontdekt waar zijn kracht in zit. Drie keer liegt hij. Ze dringt elke dag aan, tot hij zegt: ‘Er is nooit een scheermes op mijn hoofd gekomen’. Als hij slaapt, laat ze zijn haar scheren. Hij weet niet dat de HEERE van hem geweken is. De Filistijnen steken zijn ogen uit. In Gaza moet hij malen in de gevangenis.",
      },
      {
        kop: "Een laatste gebed",
        stap: "richteren:simson:6",
        t: "De Filistijnen vieren feest voor hun god Dagon. Simson moet voor hen spelen. Hij bidt tot de HEERE: ‘sterk mij toch alleenlijk ditmaal’. Dat is: geef mij nog één keer kracht. Hij pakt de twee middelste pilaren en buigt zich met kracht. Het huis stort in. Bij zijn dood sterven meer Filistijnen dan hij in zijn leven doodde.",
      },
    ],
    vragen: [
      {
        q: "Waarom wachtten de mannen van Gaza bij de stadspoort?",
        a: ["Ze wilden Simson ’s morgens doden", "Ze moesten de poort repareren", "Ze wachtten op hun koning"],
        why: "Richteren 16:2",
      },
      {
        q: "Waarom kwamen de vorsten van de Filistijnen bij Delila?",
        a: [
          "Ze moest ontdekken waar Simsons kracht in zat",
          "Ze moest Simson naar Gaza brengen",
          "Ze moest de deuren van de poort terughalen",
        ],
        why: "Richteren 16:5",
      },
      {
        q: "Wat wist Simson niet toen hij wakker werd?",
        a: ["Dat de HEERE van hem geweken was", "Dat Delila was weggegaan", "Dat het al middag was"],
        why: "Richteren 16:20",
      },
      {
        q: "Waar bad Simson om in het huis van Dagon?",
        a: ["Om nog één keer kracht", "Om zijn ogen terug te krijgen", "Om vrij naar huis te mogen"],
        why: "Richteren 16:28",
      },
    ],
  },
  47: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Van Bethlehem naar Moab",
        stap: "ruth:ruth:0",
        t: "In de tijd van de richters is er honger. Elimelech uit Bethlehem trekt met zijn vrouw Naomi en twee zonen naar Moab. Daar sterft Elimelech. De zonen trouwen met Orpa en Ruth, twee Moabitische vrouwen. Ze wonen er ongeveer tien jaar. Dan sterven ook de zonen.",
      },
      {
        kop: "Uw God is mijn God",
        stap: "ruth:ruth:1",
        t: "Naomi hoort dat de HEERE Zijn volk weer brood geeft, en gaat terug. Orpa keert terug naar haar volk, maar Ruth zegt: ‘uw volk is mijn volk, en uw God mijn God.’ Aan het begin van de gersteoogst komen ze in Bethlehem.",
      },
      {
        kop: "Aren rapen bij Boaz",
        stap: "ruth:ruth:3",
        t: "Ruth raapt de aren op die achter de maaiers blijven liggen. Ze komt op het veld van Boaz, familie van Elimelech. Boaz zorgt dat ze veilig kan werken en genoeg krijgt. Naomi zegt: ‘hij is een van onze lossers.’ Een losser is een familielid dat land en naam van de familie mag redden.",
      },
      {
        kop: "Boaz lost",
        stap: "ruth:ruth:5",
        t: "Er is nog een losser, die meer familie is. In de poort, met tien oudsten als getuigen, ziet hij ervan af. Dan neemt Boaz het land over en trouwt met Ruth. De HEERE geeft hun een zoon: Obed, de vader van Isaï, de vader van David.",
      },
    ],
    vragen: [
      {
        q: "Waarom ging Elimelech met zijn gezin naar Moab?",
        a: ["Er was honger in het land", "Er was oorlog in Bethlehem", "Hij had land gekocht in Moab"],
        why: "Ruth 1:1",
      },
      {
        q: "Waarom ging Naomi terug naar Bethlehem?",
        a: ["Ze hoorde dat de HEERE weer brood gaf", "Haar zonen wilden graag terug", "Boaz had haar laten roepen"],
        why: "Ruth 1:6",
      },
      {
        q: "Wat is een losser?",
        a: ["Een familielid dat land en naam mag redden", "Een knecht die het koren maait", "Een oudste die in de poort zit"],
        why: "Ruth 4:4–10; Leviticus 25:25",
      },
      {
        q: "Wat gebeurt er eerst?",
        a: ["Ruth raapt aren op het veld van Boaz", "Boaz trouwt met Ruth", "Obed wordt geboren"],
        why: "Ruth 2:3; Ruth 4:13",
      },
      { q: "Wie wordt de grootvader van koning David?", a: ["Obed", "Boaz", "Elimelech"], why: "Ruth 4:17" },
    ],
  },
  48: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een gebed in Silo",
        stap: "1samuel:samuel:0",
        t: "Elk jaar gaat Elkana met zijn gezin naar Silo om de HEERE te aanbidden en te offeren. Zijn vrouw Hanna heeft geen kinderen, en Peninna, zijn andere vrouw, plaagt haar daarom. Daar bidt Hanna huilend. Ze belooft: als de HEERE haar een zoon geeft, geeft ze hem aan de HEERE, zijn hele leven. Priester Eli ziet alleen haar lippen bewegen en denkt dat ze dronken is. Maar ze bidt. Eli zegt: ‘Ga heen in vrede.’",
      },
      {
        kop: "Van de HEERE gebeden",
        t: "De HEERE denkt aan Hanna. Ze krijgt een zoon en noemt hem Samuël, want ze zegt: ‘ik heb hem van den HEERE gebeden.’ Als hij gespeend is (geen moedermelk meer drinkt), brengt ze hem naar Eli in Silo.",
      },
      {
        kop: "Spreek, want Uw knecht hoort",
        stap: "1samuel:samuel:1",
        t: "In die tijd spreekt de HEERE zelden. Op een nacht roept Hij Samuël. Samuël denkt dat Eli roept. Na drie keer begrijpt Eli dat de HEERE roept. De volgende keer zegt Samuël: ‘Spreek, want Uw knecht hoort.’ De HEERE zegt dat Hij het huis van Eli zal straffen, omdat Eli’s zonen kwaad doen en Eli hen niet tegenhoudt. Later weet heel Israël: Samuël is een profeet, iemand door wie de HEERE spreekt.",
      },
    ],
    vragen: [
      {
        q: "Waarom gaat Elkana elk jaar naar Silo?",
        a: ["Om de HEERE te aanbidden en te offeren", "Om daar op de markt te verkopen", "Om de familie van Hanna te bezoeken"],
        why: "1 Samuël 1:3",
      },
      {
        q: "Waarom noemt Hanna haar zoon Samuël?",
        a: ["Ze heeft hem van de HEERE gebeden", "Zo heette de vader van Elkana", "Eli heeft die naam gekozen"],
        why: "1 Samuël 1:1, 20",
      },
      {
        q: "Waarom loopt Samuël in de nacht naar Eli?",
        a: ["Hij denkt dat Eli hem roept", "Eli heeft hem gevraagd te komen", "Hij moet de lamp aansteken"],
        why: "1 Samuël 3:4–5",
      },
      {
        q: "Waarom zal de HEERE het huis van Eli straffen?",
        a: [
          "Eli’s zonen doen kwaad en Eli houdt hen niet tegen",
          "Eli is te oud om nog priester te zijn",
          "Eli heeft Samuël in Silo laten wonen",
        ],
        why: "1 Samuël 3:13",
      },
      {
        q: "Wat weet heel Israël later over Samuël?",
        a: ["Dat hij een profeet van de HEERE is", "Dat hij de nieuwe koning wordt", "Dat hij een sterke soldaat is"],
        why: "1 Samuël 3:20",
      },
    ],
  },
  49: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "De ark mee de strijd in",
        stap: "1samuel:samuel:2",
        t: "Israël verliest van de Filistijnen. De oudsten laten de ark, de heilige kist van het verbond, uit Silo halen. Die zal hen redden, denken ze. Maar Israël verliest opnieuw. Eli’s zonen Hofni en Pinehas sterven en de ark wordt meegenomen. Eli hoort het, valt van zijn stoel en sterft.",
      },
      {
        kop: "Dagon valt voor de ark",
        stap: "1samuel:samuel:3",
        t: "In Asdod zetten ze de ark bij hun god Dagon. Twee morgens na elkaar ligt Dagon voorover voor de ark, de tweede keer zonder hoofd en handen. De HEERE slaat Asdod, Gath en Ekron met bulten. Na zeven maanden sturen ze de ark terug op een nieuwe wagen. Twee koeien lopen loeiend recht naar Beth-Semes. Daar kijken mannen in de ark; de HEERE slaat hen.",
      },
      {
        kop: "Een steen van hulp",
        stap: "1samuel:samuel:4",
        t: "De ark gaat naar Kirjath-Jearim. Twintig jaar later doet het volk op Samuëls woord de vreemde goden weg en dient de HEERE alleen. In Mizpa zeggen ze: ‘Wij hebben tegen den HEERE gezondigd.’ Samuël bidt, en als de Filistijnen aanvallen, laat de HEERE het hard donderen. Zo verslaat Hij hen. Samuël zet een steen neer, Eben-Haëzer: ‘Tot hiertoe heeft de HEERE ons geholpen.’",
      },
    ],
    vragen: [
      {
        q: "Wat gebeurt er met Eli als hij hoort dat de ark genomen is?",
        a: ["Hij valt van zijn stoel en sterft", "Hij gaat zelf naar het slagveld", "Hij vlucht naar Rama"],
        why: "1 Samuël 4:18",
      },
      { q: "In welke stad staat het huis van Dagon waar de ark komt?", a: ["Asdod", "Beth-Semes", "Silo"], why: "1 Samuël 5:1–2" },
      { q: "Waar lopen de koeien met de wagen naartoe?", a: ["Naar Beth-Semes", "Naar Silo", "Naar Mizpa"], why: "1 Samuël 6:12" },
      {
        q: "Wat moet het volk doen voordat de HEERE hen helpt?",
        a: ["De vreemde goden wegdoen en de HEERE alleen dienen", "Een nieuwe tent bouwen in Silo", "De ark terugbrengen naar het slagveld"],
        why: "1 Samuël 7:3–4",
      },
      {
        q: "Hoe verslaat de HEERE de Filistijnen bij Mizpa?",
        a: ["Hij laat het hard donderen", "Hij laat de zon stilstaan", "Hij stuurt een grote storm op zee"],
        why: "1 Samuël 7:10",
      },
    ],
  },
  50: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Wij willen een koning",
        stap: "1samuel:samuel:5",
        t: "Samuël is oud. Zijn zonen zijn rechters in Berseba, maar ze nemen geschenken aan en spreken oneerlijk recht. Daarom komen de oudsten naar Rama. Ze willen een koning, ‘gelijk al de volken hebben.’ Samuël vindt dat kwaad. Maar de HEERE zegt: ‘zij hebben u niet verworpen, maar zij hebben Mij verworpen’. Samuël waarschuwt wat een koning van hen zal nemen, maar het volk wil toch een koning.",
      },
      {
        kop: "Op zoek naar ezelinnen",
        stap: "1samuel:samuel:6",
        t: "Saul, de zoon van Kis, komt uit de stam Benjamin. Met hoofd en schouders steekt hij boven iedereen uit. Met een knecht zoekt hij de ezelinnen van zijn vader. Zo komen ze bij Samuël, de ziener: zo noemde men vroeger een profeet. De HEERE had Samuël al gezegd dat Hij een man uit Benjamin zou sturen. Samuël giet olie op Sauls hoofd: de HEERE heeft hem gezalfd tot voorganger (leider) over Zijn volk.",
      },
      {
        kop: "Leve de koning",
        stap: "1samuel:samuel:7",
        t: "In Mizpa wordt eerst de stam Benjamin aangewezen, dan de familie van Matri, en dan Saul. Maar hij heeft zich verstopt tussen de bagage. Het volk juicht: ‘de koning leve!’ Saul gaat naar huis in Gibea.",
      },
    ],
    vragen: [
      {
        q: "Wat doen de zonen van Samuël verkeerd?",
        a: ["Ze nemen geschenken aan en buigen het recht", "Ze weigeren om rechter te zijn", "Ze verliezen een oorlog tegen de Filistijnen"],
        why: "1 Samuël 8:3",
      },
      {
        q: "Wie verwerpt het volk volgens de HEERE, als het om een koning vraagt?",
        a: ["De HEERE Zelf", "Alleen Samuël", "De zonen van Samuël"],
        why: "1 Samuël 8:7",
      },
      {
        q: "Hoe komt Saul bij Samuël terecht?",
        a: ["Hij zoekt de ezelinnen van zijn vader", "Samuël stuurt een bode naar Gibea", "Kis brengt hem naar de stad"],
        why: "1 Samuël 9:3–10",
      },
      { q: "Hoe noemde men een profeet vroeger in Israël?", a: ["Een ziener", "Een richter", "Een priester"], why: "1 Samuël 9:9" },
      {
        q: "Waar gaat Saul naartoe als het volk naar huis gaat?",
        a: ["Naar zijn huis in Gibea", "Naar Samuël in Rama", "Naar de tempel in Silo"],
        why: "1 Samuël 10:26",
      },
    ],
  },
  51: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Saul wacht niet tot Samuël komt",
        stap: "1samuel:saul-david:0",
        t: "Saul wacht in Gilgal zeven dagen op Samuël. Het volk loopt weg; Saul brengt zelf het brandoffer. Net daarna komt Samuël. Hij zegt: Saul heeft het gebod van de HEERE niet gehouden; zijn koningschap zal niet blijven.",
      },
      {
        kop: "Gehoorzamen is beter",
        stap: "1samuel:saul-david:1",
        t: "Later moet Saul Amalek verbannen: helemaal vernietigen. Toch spaart hij koning Agag en de beste dieren, om te offeren, zegt hij. Samuël antwoordt: ‘gehoorzamen is beter dan slachtoffer’ (een offer van een dier). Saul heeft het woord van de HEERE verworpen; daarom verwerpt de HEERE hem als koning.",
      },
      {
        kop: "De jongste zoon van Isaï",
        stap: "1samuel:saul-david:2",
        t: "God stuurt Samuël naar Isaï in Bethlehem. Samuël ziet Eliab en denkt: dit is hem. Maar de HEERE zegt: ‘de HEERE ziet het hart aan.’ Zeven zonen gaan voorbij. De jongste, David, wordt van de schapen gehaald. Samuël zalft hem tot koning. Vanaf die dag komt de Geest van de HEERE over David.",
      },
      {
        kop: "Harp voor de koning",
        stap: "1samuel:saul-david:3",
        t: "De Geest van de HEERE wijkt van Saul, en een boze geest van de HEERE maakt hem bang. Zijn knechten zoeken iemand die goed harp speelt. Zo komt David bij Saul. Als hij speelt, wordt het beter met Saul.",
      },
    ],
    vragen: [
      {
        q: "Waarom zei Samuël dat het koningschap van Saul niet zou blijven?",
        a: [
          "Saul had het gebod van de HEERE niet gehouden",
          "Saul had de strijd tegen de Filistijnen verloren",
          "Saul was te oud geworden om koning te zijn",
        ],
        why: "1 Samuël 13:13–14",
      },
      {
        q: "Wie spaarde Saul, terwijl hij alles moest verbannen?",
        a: ["Agag, de koning van Amalek", "Goliath, de Filistijn uit Gath", "Eliab, de zoon van Isaï"],
        why: "1 Samuël 15:8–9",
      },
      {
        q: "Waar was David toen Samuël in Bethlehem kwam?",
        a: ["Bij de schapen", "In het leger van Saul", "Bij Samuël in Rama"],
        why: "1 Samuël 16:11",
      },
      {
        q: "Wat gebeurde er toen Samuël David zalfde?",
        a: ["De Geest van de HEERE kwam over David", "Saul nam David mee naar Gibea", "Saul gaf David zijn mantel"],
        why: "1 Samuël 16:13",
      },
      {
        q: "Waarom kwam David bij koning Saul?",
        a: ["Hij kon goed op de harp spelen", "Hij had Goliath al verslagen", "Samuël had hem daarheen gestuurd"],
        why: "1 Samuël 16:16–19",
      },
    ],
  },
  52: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een kampvechter uit Gath",
        stap: "1samuel:saul-david:4",
        t: "De Filistijnen en Israël staan op twee bergen, met het eikendal ertussen. Goliath uit Gath komt naar voren. Hij is een kampvechter: hij wil in zijn eentje vechten voor zijn hele leger. Hij is zes ellen en een span lang. Veertig dagen lang roept hij: ‘Geeft mij een man, dat wij te zamen strijden!’ Saul en heel Israël zijn erg bang.",
      },
      {
        kop: "David hoort de Filistijn",
        t: "Isaï stuurt David met eten naar zijn broers in het leger. Daar hoort David Goliath roepen. Hij zegt tegen Saul: de HEERE, Die mij gered heeft van de leeuw en de beer, zal mij ook redden van deze Filistijn.",
      },
      {
        kop: "In de Naam van de HEERE",
        t: "David doet het harnas van Saul weer uit; hij is het niet gewend. Met zijn staf, zijn slinger en vijf gladde stenen uit de beek gaat hij op Goliath af. Hij zegt: ‘ik kom tot u in den Naam van den HEERE der heirscharen’. Heirscharen zijn legers. Hij zegt ook: ‘de ganse aarde zal weten, dat Israël een God heeft.’ David slingert een steen, die Goliath in zijn voorhoofd treft. Goliath valt, en David doodt hem met diens eigen zwaard. Dan vluchten de Filistijnen.",
      },
    ],
    vragen: [
      {
        q: "Waarom durfde David tegen Goliath te strijden?",
        a: ["De HEERE had hem gered van de leeuw en de beer", "Hij was groter dan Goliath", "Hij droeg het harnas van Saul"],
        why: "1 Samuël 17:37",
      },
      {
        q: "Waarom was David bij het leger?",
        a: ["Hij bracht eten voor zijn broers", "Saul had hem geroepen als soldaat", "Hij zocht een weggelopen schaap"],
        why: "1 Samuël 17:17–18",
      },
      { q: "Uit welke stad kwam Goliath?", a: ["Uit Gath", "Uit Bethlehem", "Uit Jericho"], why: "1 Samuël 17:4" },
      {
        q: "Wat zou de hele aarde weten, volgens David?",
        a: ["Dat Israël een God heeft", "Dat David de sterkste man is", "Dat Saul een goede koning is"],
        why: "1 Samuël 17:46",
      },
    ],
  },
  53: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Op handen en voeten omhoog",
        stap: "1samuel:saul-david:0",
        t: "De Filistijnen liggen bij Michmas. Jonathan, de zoon van koning Saul, gaat erheen zonder het zijn vader te vertellen. Alleen zijn wapendrager, die zijn wapens draagt, gaat mee. Jonathan zegt: ‘bij den HEERE is geen verhindering, om te verlossen door velen of door weinigen.’ Dat betekent: de HEERE kan redden, met veel of met weinig mensen. Op handen en voeten klimmen ze omhoog en verslaan ongeveer twintig man. Dan laat God het leger van de Filistijnen beven. Zo verlost de HEERE Israël.",
      },
      {
        kop: "Een verbond van vriendschap",
        stap: "1samuel:saul-david:5",
        t: "Als David Goliath verslagen heeft, heeft Jonathan hem lief als zichzelf. Ze sluiten een verbond: een plechtige belofte. Jonathan geeft David zijn mantel, zijn kleren, zijn zwaard, zijn boog en zijn gordel.",
      },
      {
        kop: "Saul wordt jaloers",
        t: "De vrouwen zingen: ‘Saul heeft zijn duizenden verslagen, maar David zijn tienduizenden!’ Saul wordt kwaad en houdt David vanaf die dag in de gaten. Als David muziek voor hem maakt, gooit Saul zijn spies (een speer) naar hem, maar David ontwijkt hem. Saul wordt bang voor David, want de HEERE is met David.",
      },
    ],
    vragen: [
      {
        q: "Waarom durfde Jonathan met alleen zijn wapendrager te gaan?",
        a: [
          "Bij de HEERE maakt het niet uit of het velen of weinigen zijn",
          "De Filistijnen sliepen allemaal",
          "Saul kwam met een groot leger achter hem aan",
        ],
        why: "1 Samuël 14:6",
      },
      {
        q: "Hoe kwamen Jonathan en zijn wapendrager boven bij de Filistijnen?",
        a: ["Ze klommen op handen en voeten omhoog", "Ze liepen over een brug", "Ze reden op paarden de berg op"],
        why: "1 Samuël 14:13",
      },
      {
        q: "Wat sloten Jonathan en David met elkaar?",
        a: ["Een verbond", "Een koop van schapen", "Een vrede met de Filistijnen"],
        why: "1 Samuël 18:3",
      },
      {
        q: "Waarom werd Saul bang voor David?",
        a: ["De HEERE was met David", "David had een groter leger dan Saul", "David had Saul met een spies bedreigd"],
        why: "1 Samuël 18:12",
      },
    ],
  },
  54: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een vriend en een vijand",
        stap: "1samuel:saul-david:5",
        t: "Jonathan, de zoon van Saul, houdt van David als van zichzelf. Ze sluiten een verbond: een plechtige belofte van trouw. Maar de vrouwen zingen dat David meer vijanden versloeg dan Saul. Saul wordt woedend, gooit zijn speer naar David en wil hem laten doden. Michal, Davids vrouw, laat hem ’s nachts door een venster ontsnappen.",
      },
      {
        kop: "Op de vlucht",
        stap: "1samuel:saul-david:6",
        t: "Jonathan waarschuwt David met een pijl: hij moet vluchten. In Nob geeft de priester Achimelech hem heilig brood en het zwaard van Goliath. Doëg, een knecht van Saul, ziet het. David verbergt zich in de spelonk (grot) van Adullam, en ongeveer vierhonderd mannen komen bij hem. Doëg verraadt het aan Saul, en Saul laat de priesters doden. Alleen Abjathar ontkomt.",
      },
      {
        kop: "David spaart Saul",
        stap: "1samuel:saul-david:7",
        t: "Saul jaagt David na tot bij En-Gedi en gaat een spelonk in waar David zit. David snijdt stilletjes een slip van Sauls mantel af, maar doodt hem niet. Hij zegt: Saul is ‘de gezalfde des HEEREN’, door God als koning aangewezen. Buiten laat David de slip zien. Saul huilt en zegt: ‘Gij zijt rechtvaardiger dan ik’.",
      },
    ],
    vragen: [
      {
        q: "Waarom wordt Saul zo boos op David?",
        a: [
          "De vrouwen zingen dat David meer verslagen heeft",
          "David wil niet tegen de Filistijnen strijden",
          "David wil niet meer voor hem spelen",
        ],
        why: "1 Samuël 18:7–8",
      },
      { q: "Wie ziet David in Nob en vertelt het aan Saul?", a: ["Doëg", "Abjathar", "Jonathan"], why: "1 Samuël 22:9–10" },
      {
        q: "Wat gebeurt er het eerst?",
        a: ["Jonathan schiet een pijl in het veld", "David krijgt het zwaard van Goliath", "David verbergt zich in Adullam"],
        why: "1 Samuël 20:35–42; 1 Samuël 21:9–10; 1 Samuël 22:1",
      },
      {
        q: "Waarom doodt David Saul niet in de spelonk?",
        a: ["Saul is de gezalfde van de HEERE", "Hij ziet Saul niet in het donker", "Zijn mannen houden hem tegen"],
        why: "1 Samuël 24:7",
      },
    ],
  },
  55: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Weer spaart David Saul",
        stap: "1samuel:saul-david:7",
        t: "Saul zoekt David met drieduizend man in de woestijn Zif. ’s Nachts sluipt David met Abisaï het kamp binnen. Niemand merkt het, want de HEERE heeft een diepe slaap op hen laten vallen. Abisaï wil Saul doden, maar David zegt: wie kan ‘den gezalfde des HEEREN’ iets aandoen en onschuldig blijven? Hij neemt alleen de spies en de waterfles mee.",
      },
      {
        kop: "Geen antwoord meer",
        stap: "1samuel:saul-david:10",
        t: "De Filistijnen legeren zich bij Sunem, Saul op de Gilboa. Saul is erg bang. Hij vraagt de HEERE om raad, maar krijgt geen antwoord. Dan gaat hij verkleed naar een vrouw in Endor die waarzegt. Dat had God verboden, en Saul had zelf de waarzeggers weggedaan. Daar hoort hij van Samuël dat de HEERE het koninkrijk aan David gegeven heeft.",
      },
      {
        kop: "Hoe zijn de helden gevallen",
        stap: "2samuel:david:0",
        t: "Op de berg Gilboa verliest Israël. Jonathan en twee broers sneuvelen. De boogschutters komen op Saul af, en hij is erg bang. Dan valt hij in zijn eigen zwaard. In Ziklag hoort David het nieuws. Hij scheurt zijn kleren, huilt en vast tot de avond. Hij maakt een klaaglied over Saul en Jonathan: ‘hoe zijn de helden gevallen!’",
      },
    ],
    vragen: [
      { q: "Wie gaat met David mee het kamp van Saul in?", a: ["Abisaï", "Jonathan", "Abner"], why: "1 Samuël 26:6–7" },
      {
        q: "Waarom merkt niemand in het kamp David op?",
        a: [
          "De HEERE had een diepe slaap op hen laten vallen",
          "De wachters waren die nacht weggelopen",
          "David had zich als soldaat van Saul verkleed",
        ],
        why: "1 Samuël 26:12",
      },
      {
        q: "Waarom gaat Saul naar de vrouw in Endor?",
        a: ["De HEERE antwoordt hem niet meer", "Hij wil weten waar David zich verbergt", "Samuël heeft hem daarheen gestuurd"],
        why: "1 Samuël 28:6–7, 15",
      },
      { q: "Waar is David als hij hoort dat Saul dood is?", a: ["In Ziklag", "In Hebron", "In En-Gedi"], why: "2 Samuël 1:1–4" },
      {
        q: "Wat doet David als hij het nieuws hoort?",
        a: ["Hij rouwt en maakt een klaaglied", "Hij laat zich meteen tot koning zalven", "Hij trekt op tegen de Filistijnen"],
        why: "2 Samuël 1:11–12, 17",
      },
    ],
  },
  56: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Twee koningen",
        stap: "2samuel:david:1",
        t: "Na de dood van Saul vraagt David de HEERE of hij naar een stad in Juda moet gaan. Het antwoord is: naar Hebron. Daar zalven de mannen van Juda hem tot koning. Maar Abner, de legeroverste van Saul, maakt Isboseth, een zoon van Saul, koning over de rest van Israël, in Mahanaïm. Er komt een lange strijd, en David wordt steeds sterker.",
      },
      {
        kop: "Koning over heel Israël",
        stap: "2samuel:david:2",
        t: "Dan komen alle stammen van Israël naar Hebron. Ze zeggen tegen David dat de HEERE tegen hem gezegd heeft: ‘Gij zult Mijn volk Israël weiden’. Weiden is zorgen voor het volk, zoals een herder voor zijn schapen. De oudsten zalven David tot koning over heel Israël. Hij is dan dertig jaar.",
      },
      {
        kop: "De stad van David",
        stap: "2samuel:david:3",
        t: "David trekt op naar Jeruzalem, waar de Jebusieten wonen. Ze zeggen dat hij er niet in zal komen, maar David neemt de burcht Sion in: de stad van David. Koning Hiram van Tyrus stuurt cederhout en bouwers. Twee keer vallen de Filistijnen aan. Steeds vraagt David eerst de HEERE, en hij verslaat hen.",
      },
    ],
    vragen: [
      {
        q: "Waarom gaat David naar Hebron?",
        a: ["De HEERE zegt dat hij daarheen moet", "Abner heeft hem daarheen gestuurd", "Hiram heeft hem daar een huis gegeven"],
        why: "2 Samuël 2:1",
      },
      { q: "Wie is Isboseth?", a: ["Een zoon van Saul", "Een broer van David", "De legeroverste van Saul"], why: "2 Samuël 2:8" },
      {
        q: "Wat gebeurt er het eerst?",
        a: ["David wordt koning over Juda", "Alle stammen komen naar Hebron", "David neemt de burcht Sion in"],
        why: "2 Samuël 2:4; 2 Samuël 5:1–3; 2 Samuël 5:7",
      },
      {
        q: "Waarom komen de stammen van Israël naar David in Hebron?",
        a: [
          "De HEERE had gezegd dat David Zijn volk zou weiden",
          "Hiram van Tyrus had het hun gevraagd",
          "David had hen met zijn leger gedwongen",
        ],
        why: "2 Samuël 5:1–3",
      },
      {
        q: "Wat doet David steeds voordat hij tegen de Filistijnen optrekt?",
        a: ["Hij vraagt de HEERE om raad", "Hij vraagt Hiram om hulp", "Hij stuurt Abner vooruit"],
        why: "2 Samuël 5:19, 23",
      },
    ],
  },
  57: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "De ark op een nieuwe wagen",
        stap: "2samuel:david:4",
        t: "David wil de ark van God, de heilige kist, naar Jeruzalem halen. Ze halen hem uit het huis van Abinadab in Kirjath-Jearim, op een nieuwe wagen, en spelen muziek voor de HEERE. Dan struikelen de runderen. Uza houdt de ark vast, en God slaat hem; hij sterft bij de ark. David is bang voor de HEERE. Drie maanden blijft de ark in het huis van Obed-Edom, en de HEERE zegent dat huis.",
      },
      {
        kop: "David danst voor de HEERE",
        t: "Dan haalt David de ark toch, met vreugde. Nu wordt de ark gedragen. David danst met alle macht voor de HEERE. Michal, de dochter van Saul, ziet het door het venster en veracht hem: ze kijkt op hem neer. De ark krijgt een plaats in een tent.",
      },
      {
        kop: "Een huis voor David",
        stap: "2samuel:david:5",
        t: "David woont in een huis van cederhout, maar de ark staat in een tent. Hij wil een huis voor God bouwen. Maar God zegt door Nathan, de profeet die Gods woorden doorgeeft, dat Davids zoon dat huis zal bouwen. En God belooft: ‘uw huis zal bestendig zijn’. Dat betekent: Davids koningshuis blijft altijd bestaan. David bidt: ‘Wie ben ik, Heere HEERE?’",
      },
    ],
    vragen: [
      {
        q: "Waarom bracht David de ark eerst niet naar zijn stad?",
        a: ["Hij was bang na de dood van Uza", "De wagen was gebroken", "Nathan had het hem verboden"],
        why: "2 Samuël 6:9–10",
      },
      {
        q: "Wat gebeurde er met Obed-Edom toen de ark bij hem stond?",
        a: ["De HEERE zegende hem en zijn huis", "Hij werd ziek en stierf", "Hij moest het land uit"],
        why: "2 Samuël 6:11–12",
      },
      {
        q: "Hoe werd de ark de tweede keer vervoerd?",
        a: ["Hij werd gedragen", "Op een nieuwe wagen", "Op een ezel"],
        why: "2 Samuël 6:13",
      },
      {
        q: "Waarom wilde David een huis voor God bouwen?",
        a: [
          "Hij woonde zelf in cederhout en de ark in een tent",
          "Het oude huis van God was afgebrand",
          "De priesters hadden erom gevraagd",
        ],
        why: "2 Samuël 7:2",
      },
      {
        q: "Wat beloofde God aan David?",
        a: ["Zijn koninkrijk blijft tot in eeuwigheid", "Hij zal zelf het huis van God bouwen", "Hij zal nooit sterven"],
        why: "2 Samuël 7:12–16",
      },
    ],
  },
  58: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "David blijft in Jeruzalem",
        stap: "2samuel:david:7",
        t: "Het leger van Israël vecht tegen Rabba, de stad van de Ammonieten. Koning David blijft in Jeruzalem. Vanaf het dak van zijn paleis ziet hij een mooie vrouw: Bathseba, de vrouw van Uria de Hethiet. David laat haar halen en neemt haar, terwijl ze met Uria getrouwd is. Daarna is Bathseba zwanger.",
      },
      {
        kop: "Een brief voor Joab",
        t: "David laat Uria uit het leger komen en stuurt hem naar huis. Maar Uria gaat niet, want de ark en het leger zijn ook in tenten en op het veld. Dan geeft David hem een brief mee voor Joab: zet Uria vooraan in de zwaarste strijd, zodat hij sterft. Uria sneuvelt, en David trouwt met Bathseba. ‘Doch deze zaak, die David gedaan had, was kwaad in de ogen des HEEREN.’",
      },
      {
        kop: "Gij zijt die man",
        t: "God stuurt de profeet Nathan. Hij vertelt over een rijke man die het enige lammetje van een arme man pakt. David wordt woedend. Dan zegt Nathan: ‘Gij zijt die man!’ Dus: u bent die man. David zegt: ‘Ik heb gezondigd tegen den HEERE!’ De HEERE neemt zijn zonde weg, maar het kind sterft. Later wordt Salomo geboren, en de HEERE heeft hem lief.",
      },
    ],
    vragen: [
      { q: "Waar bleef David toen zijn leger naar Rabba trok?", a: ["In Jeruzalem", "In Hebron", "In Bethlehem"], why: "2 Samuël 11:1" },
      {
        q: "Waarom wilde Uria niet naar zijn huis gaan?",
        a: ["Het leger lag ook in tenten en op het veld", "Hij was ziek geworden", "Hij was bang voor zijn vrouw"],
        why: "2 Samuël 11:11",
      },
      {
        q: "Waarom vertelde Nathan het verhaal van de arme man?",
        a: [
          "Om David te laten zien wat hij zelf had gedaan",
          "Om David te leren hoe je schapen hoedt",
          "Om de rijke man uit de stad te laten zetten",
        ],
        why: "2 Samuël 12:7–9",
      },
      {
        q: "Wat zei Nathan nadat David zijn zonde had beleden?",
        a: ["De HEERE heeft uw zonde weggenomen", "U bent geen koning meer", "U moet Jeruzalem verlaten"],
        why: "2 Samuël 12:13",
      },
    ],
  },
  59: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Absalom wil koning worden",
        stap: "2samuel:david:8",
        t: "Absalom, een zoon van David, staat elke morgen bij de poort. Tegen ieder met een rechtszaak zegt hij: was ik maar rechter in het land! ‘Alzo stal Absalom het hart der mannen van Israël.’ De mensen gaan hem volgen. In Hebron laat hij zich tot koning uitroepen. Ook Achitofel, Davids raadsman, kiest zijn kant.",
      },
      {
        kop: "David op de vlucht",
        stap: "2samuel:david:8",
        t: "David vlucht uit Jeruzalem, over de beek Kidron. De ark stuurt hij terug naar de stad. Huilend en op blote voeten gaat hij de Olijfberg op. Zijn vriend Husai stuurt hij naar Absalom, om de raad van Achitofel te laten mislukken. Bij Bahurim vervloekt Simeï, uit de familie van Saul, David en gooit met stenen. David laat hem begaan. Over de Jordaan komt David in Mahanaïm.",
      },
      {
        kop: "Mijn zoon Absalom",
        stap: "2samuel:david:9",
        t: "David beveelt zijn legeroversten: ‘Handelt mij zachtkens met den jongeling’. Dus: wees zacht voor Absalom. In het woud van Efraïm wordt het leger van Absalom verslagen. Absalom blijft met zijn hoofd in een eik hangen, en Joab en zijn wapendragers doden hem. David huilt: ‘Mijn zoon Absalom, mijn zoon, mijn zoon Absalom!’",
      },
    ],
    vragen: [
      { q: "Waar liet Absalom zich tot koning uitroepen?", a: ["In Hebron", "In Bethlehem", "In Mahanaïm"], why: "2 Samuël 15:10" },
      {
        q: "Waarom stuurde David zijn vriend Husai naar Absalom?",
        a: ["Om de raad van Achitofel te laten mislukken", "Om de ark van God te bewaken", "Om vrede te sluiten met Absalom"],
        why: "2 Samuël 15:34",
      },
      {
        q: "Waarom liet David Simeï begaan?",
        a: ["Hij zei dat de HEERE het Simeï gezegd had", "Hij hoorde niet wat Simeï riep", "Simeï was een broer van David"],
        why: "2 Samuël 16:10–11",
      },
      {
        q: "Wat gebeurde er eerst?",
        a: ["David ging over de Jordaan", "Absalom bleef in een eik hangen", "David huilde om Absalom"],
        why: "2 Samuël 17:22; 2 Samuël 18:9; 2 Samuël 18:33",
      },
      {
        q: "Waar werd het leger van Absalom verslagen?",
        a: ["In het woud van Efraïm", "Bij de beek Kidron", "Op de Olijfberg"],
        why: "2 Samuël 18:6–7",
      },
    ],
  },
  60: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een droom in Gibeon",
        stap: "1koningen:salomo:1",
        t: "Salomo is koning in de plaats van zijn vader David. In Gibeon offert hij duizend brandoffers: dieren die op het altaar worden verbrand. ’s Nachts zegt de HEERE in een droom: ‘Begeer wat Ik u geven zal.’ Begeer is: vraag. Salomo vraagt ‘een verstandig hart, om Uw volk te richten’: om recht te spreken en goed en kwaad te onderscheiden. Dat is goed in de ogen van de HEERE. Hij geeft Salomo een wijs hart, en ook rijkdom en eer.",
      },
      {
        kop: "Twee moeders en één kind",
        stap: "1koningen:salomo:2",
        t: "Twee vrouwen uit één huis staan voor de koning. Het kind van de een is gestorven; nu zeggen ze allebei dat het levende kind van haar is. Salomo laat een zwaard halen en zegt dat het kind in tweeën moet. De echte moeder zegt: geef het haar, en dood het niet! Dan zegt Salomo: zij is de moeder. Heel Israël ziet dat de wijsheid van God in hem is.",
      },
      {
        kop: "Bezoek uit Scheba",
        stap: "1koningen:salomo:5",
        t: "De koningin van Scheba komt met raadsels naar Jeruzalem, en Salomo legt alles uit. Ze zegt: ‘de helft is mij niet aangezegd’. Dus: het is meer dan ik hoorde. Ze looft de HEERE en geeft Salomo goud, specerijen en edelstenen.",
      },
    ],
    vragen: [
      {
        q: "Waarom ging Salomo naar Gibeon?",
        a: ["Om daar te offeren", "Om daar tegen vijanden te strijden", "Om daar een paleis te bouwen"],
        why: "1 Koningen 3:4",
      },
      {
        q: "Waarom vroeg Salomo om een verstandig hart?",
        a: ["Om het volk goed te kunnen richten", "Om rijker te worden dan andere koningen", "Om heel lang te mogen leven"],
        why: "1 Koningen 3:9",
      },
      {
        q: "Wat zei de echte moeder tegen de koning?",
        a: ["Geef haar het kind, en dood het niet", "Het kind is van geen van ons beiden", "Doorsnijd het kind maar"],
        why: "1 Koningen 3:26",
      },
      {
        q: "Wat zag heel Israël na dit oordeel?",
        a: ["Dat de wijsheid van God in Salomo was", "Dat Salomo het zwaard graag gebruikte", "Dat de vrouwen de koning bedrogen hadden"],
        why: "1 Koningen 3:28",
      },
      {
        q: "Wat gaf de koningin van Scheba aan Salomo?",
        a: ["Goud, specerijen en edelstenen", "Paarden en strijdwagens", "Schepen en zeilen"],
        why: "1 Koningen 10:10",
      },
    ],
  },
  61: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Hout uit de Libanon",
        stap: "1koningen:salomo:3",
        t: "David kon geen huis voor de HEERE bouwen, vanwege de oorlogen. Nu heeft God Salomo rust gegeven. Hij vraagt koning Hiram van Tyrus om hout uit de Libanon. Hiram stuurt ceder- en dennenhout op vlotten over de zee. Heel veel mannen hakken hout en brengen grote stenen.",
      },
      {
        kop: "Een huis vol goud",
        stap: "1koningen:salomo:4",
        t: "In zijn vierde jaar als koning begint Salomo te bouwen. De stenen zijn al klaargemaakt, dus er klinkt geen hamer of bijl. Van binnen wordt alles met goud bekleed. Na zeven jaar is het huis klaar.",
      },
      {
        kop: "De wolk en het gebed",
        stap: "1koningen:salomo:4",
        t: "De priesters brengen de ark in het heilige der heiligen, de binnenste ruimte. Dan vult een wolk het huis: de heerlijkheid van de HEERE. Salomo bidt: ‘zou God op de aarde wonen?’ Zelfs de hemel is te klein voor Hem. Toch vraagt Salomo: wil God horen en vergeven als er in dit huis gebeden wordt?",
      },
      {
        kop: "Een belofte en een waarschuwing",
        t: "Later verschijnt de HEERE weer aan Salomo. Hij heeft het gebed gehoord. Wandelt Salomo zoals David, dan bevestigt Hij zijn troon. Maar dienen Salomo en zijn kinderen andere goden, dan zal Hij Israël uit het land uitroeien en dit huis wegwerpen.",
      },
    ],
    vragen: [
      {
        q: "Waarom had David het huis van de HEERE niet gebouwd?",
        a: ["Door de oorlogen om hem heen", "Omdat hij geen goud had", "Omdat Hiram niet wilde helpen"],
        why: "1 Koningen 5:3",
      },
      {
        q: "Hoe kwam het hout uit de Libanon bij Salomo?",
        a: ["Op vlotten over de zee", "Op wagens door de woestijn", "Over de rivier de Jordaan"],
        why: "1 Koningen 5:9",
      },
      {
        q: "Hoe kwamen de stenen bij het huis aan?",
        a: ["Al helemaal klaargemaakt", "Als ruwe rotsblokken", "Als losse kiezelstenen"],
        why: "1 Koningen 6:7",
      },
      {
        q: "Wat vroeg Salomo in zijn gebed?",
        a: [
          "Dat God hoort als er in dit huis gebeden wordt",
          "Dat God hem nog meer goud en zilver geeft",
          "Dat God hem een heel lang leven geeft",
        ],
        why: "1 Koningen 8:28–30",
      },
      {
        q: "Wat zei de HEERE toen Hij Salomo opnieuw verscheen?",
        a: [
          "Als ze andere goden dienen, werpt Hij dit huis weg",
          "Salomo moet nog een tweede huis bouwen",
          "Het huis is nog niet groot genoeg",
        ],
        why: "1 Koningen 9:2–7",
      },
    ],
  },
  62: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Salomo’s hart gaat van God af",
        stap: "1koningen:salomo:7",
        t: "Salomo heeft veel buitenlandse vrouwen lief. Als hij oud is, trekken zij zijn hart naar hun goden, zoals God gezegd had. Hij bouwt bij Jeruzalem een hoogte (offerplaats) voor Kamos en Molech. Dat is ‘kwaad … in de ogen des HEEREN’. De HEERE zal het rijk uit de hand van Salomo’s zoon scheuren. Eén stam blijft, om David en om Jeruzalem.",
      },
      {
        kop: "Een kleed in twaalf stukken",
        t: "Jerobeam is een knecht van Salomo. De profeet Ahia scheurt een nieuw kleed in twaalf stukken en zegt namens God: ‘Neem u tien stukken’. Jerobeam zal tien stammen krijgen. Salomo wil hem doden; hij vlucht naar Egypte.",
      },
      {
        kop: "Een hard antwoord in Sichem",
        stap: "1koningen:salomo:8",
        t: "Na Salomo’s dood vraagt het volk in Sichem aan zijn zoon Rehabeam: maak de harde dienst, het zware juk, lichter. Rehabeam volgt de jonge mannen en zegt dat hij het juk nog zwaarder maakt. Israël maakt Jerobeam koning; alleen Juda blijft bij het huis van David.",
      },
      {
        kop: "Twee gouden kalveren",
        stap: "1koningen:salomo:8",
        t: "Jerobeam is bang: als het volk in Jeruzalem offert, keert het terug naar Rehabeam. Daarom maakt hij twee gouden kalveren, in Bethel en in Dan. De Bijbel zegt: ‘deze zaak werd tot zonde’.",
      },
    ],
    vragen: [
      {
        q: "Waarom ging Salomo’s hart van de HEERE af?",
        a: ["Zijn vrouwen trokken zijn hart naar andere goden", "Hij was boos dat hij oud werd", "Ahia had hem slechte raad gegeven"],
        why: "1 Koningen 11:3–4",
      },
      {
        q: "Wat betekenden de tien stukken van het kleed?",
        a: ["Tien stammen voor Jerobeam", "Tien jaar koning voor Jerobeam", "Tien steden voor Ahia"],
        why: "1 Koningen 11:31",
      },
      {
        q: "Waarom bleef er één stam voor de zoon van Salomo?",
        a: ["Om David en om Jeruzalem", "Omdat Rehabeam zo wijs was", "Omdat Jerobeam dat zo wilde"],
        why: "1 Koningen 11:13",
      },
      {
        q: "Waar vroeg het volk aan Rehabeam om het juk lichter te maken?",
        a: ["In Sichem", "In Bethel", "In Hebron"],
        why: "1 Koningen 12:1–4",
      },
      {
        q: "Waarom maakte Jerobeam gouden kalveren?",
        a: [
          "Hij was bang dat het volk naar Rehabeam terug zou gaan",
          "Het volk had zelf om nieuwe goden gevraagd",
          "De profeet Ahia had het hem opgedragen",
        ],
        why: "1 Koningen 12:26–28",
      },
    ],
  },
  63: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Geen regen in Israël",
        stap: "1koningen:elia:1",
        t: "Koning Achab trouwt met Izebel en dient de afgod Baäl. De profeet Elia zegt tegen hem dat er geen dauw of regen zal komen, tenzij op zijn woord. Bij de beek Krith brengen raven Elia eten. Later zorgt een weduwe in Zarfath voor hem. Bij haar raken het meel en de olie niet op.",
      },
      {
        kop: "De God Die met vuur antwoordt",
        stap: "1koningen:elia:3",
        t: "In het derde jaar komt heel Israël op de berg Karmel, met vierhonderdvijftig profeten van Baäl. Elia vraagt: ‘Hoe lang hinkt gij op twee gedachten?’ Hij bedoelt: hoe lang gaan jullie nog heen en weer tussen de HEERE en Baäl? Elia zegt: de God Die met vuur antwoordt, Die is God. Het volk vindt dat goed. De profeten van Baäl roepen urenlang, maar er komt geen antwoord.",
      },
      {
        kop: "Vuur en regen",
        stap: "1koningen:elia:4",
        t: "Elia bouwt het altaar van de HEERE op met twaalf stenen en laat drie keer water over het offer gieten. Hij bidt, en het vuur van de HEERE verteert alles, zelfs het water. Het volk roept: ‘De HEERE is God, de HEERE is God!’ Elia laat de profeten van Baäl grijpen en doodt hen bij de beek Kison. Daarna komt er een grote regen.",
      },
    ],
    vragen: [
      {
        q: "Waarom droogde de beek Krith op?",
        a: ["Er was geen regen in het land geweest", "De raven hadden alle water gedronken", "Achab had de beek laten afdammen"],
        why: "1 Koningen 17:7",
      },
      {
        q: "Waar woonde de weduwe die voor Elia zorgde?",
        a: ["In Zarfath, bij Sidon", "In Samaria, bij Achab", "In Jizreël, bij de Karmel"],
        why: "1 Koningen 17:9–10",
      },
      {
        q: "Hoe zou het volk weten wie God is?",
        a: ["De God Die met vuur antwoordt, is God", "De God met het grootste altaar is God", "De God met de meeste profeten is God"],
        why: "1 Koningen 18:24",
      },
      {
        q: "Wat bedoelde Elia met: ‘Hoe lang hinkt gij op twee gedachten?’",
        a: ["Jullie gaan heen en weer tussen de HEERE en Baäl", "Jullie lopen mank na de lange reis", "Jullie brengen twee offers tegelijk"],
        why: "1 Koningen 18:21",
      },
    ],
  },
  64: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een meisje weet raad",
        stap: "2koningen:elisa:4",
        t: "Naäman is legeroverste van de koning van Syrië en een dapper held, maar hij is melaats. Dat is een ernstige huidziekte. In zijn huis dient een klein meisje uit Israël, dat als gevangene is meegenomen. Zij zegt tegen de vrouw van Naäman: was mijn heer maar bij de profeet in Samaria, dan zou die hem genezen.",
      },
      {
        kop: "Zeven keer in de Jordaan",
        t: "Met een brief van zijn koning en veel zilver en goud reist Naäman naar Israël. Hij stopt bij het huis van de profeet Elisa. Elisa stuurt een bode: ‘Ga heen en was u zevenmaal in de Jordaan’. Naäman wordt kwaad. Hij had gedacht dat Elisa zelf naar buiten zou komen. Maar zijn knechten overtuigen hem. Na de zevende keer is zijn huid als die van een kleine jongen.",
      },
      {
        kop: "Geen geschenk voor Elisa",
        t: "Naäman gaat terug en zegt: ‘nu weet ik, dat er geen God is op de ganse aarde, dan in Israël!’ Elisa wil geen geschenk aannemen. Maar Gehazi, de knecht van Elisa, loopt Naäman achterna. Hij liegt en krijgt zilver en kleren. Daarom wordt hij zelf melaats, ‘wit als de sneeuw’.",
      },
    ],
    vragen: [
      {
        q: "Waar kwam het meisje in het huis van Naäman vandaan?",
        a: ["Uit het land Israël", "Uit de stad Damascus", "Uit het land Egypte"],
        why: "2 Koningen 5:2",
      },
      {
        q: "Waarom werd Naäman eerst kwaad?",
        a: [
          "Hij had gedacht dat Elisa zelf naar buiten zou komen",
          "Elisa vroeg heel veel zilver en goud van hem",
          "De Jordaan lag te ver weg van zijn wagen",
        ],
        why: "2 Koningen 5:11",
      },
      {
        q: "Hoe was de huid van Naäman na de zevende keer?",
        a: ["Als die van een kleine jongen", "Nog steeds een beetje ziek", "Wit als de sneeuw"],
        why: "2 Koningen 5:14",
      },
      {
        q: "Waarom werd Gehazi melaats?",
        a: ["Hij had gelogen om zilver te krijgen", "Hij had Naäman aangeraakt", "Hij was niet in de Jordaan geweest"],
        why: "2 Koningen 5:22–27",
      },
    ],
  },
  65: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Verborgen in de tempel",
        stap: "2koningen:joas:0",
        t: "Als koning Ahazia van Juda gestorven is, laat zijn moeder Athalia de hele koninklijke familie ombrengen. Maar Joseba, de zus van Ahazia, haalt zijn zoon Joas weg tussen de prinsen die gedood worden. Zes jaar blijft Joas met zijn voedster verborgen in het huis van de HEERE in Jeruzalem. Een voedster is een vrouw die een klein kind voedt en verzorgt.",
      },
      {
        kop: "Een koning van zeven jaar",
        stap: "2koningen:joas:1",
        t: "In het zevende jaar laat de priester Jojada de oversten en de lijfwacht zweren in de tempel. Hij geeft hun de speren en schilden van koning David en zet Joas de kroon op. Joas is dan zeven jaar. Het volk klapt in de handen: ‘De koning leve!’ Athalia roept: ‘Verraad, verraad!’ Ze wordt buiten de tempel gedood.",
      },
      {
        kop: "Een kist bij het altaar",
        stap: "2koningen:joas:2",
        t: "Zolang Jojada hem onderwijst, doet Joas wat recht is. Met het geld uit een kist bij het altaar wordt de tempel hersteld. Maar als Hazaël, de koning van Syrië, dreigt, stuurt Joas hem het goud van de tempel. Later doden zijn eigen knechten hem.",
      },
    ],
    vragen: [
      {
        q: "Wie haalde Joas weg toen Athalia de koninklijke familie ombracht?",
        a: ["Joseba, de zus van Ahazia", "Mattan, de priester van Baäl", "Hazaël, de koning van Syrië"],
        why: "2 Koningen 11:2",
      },
      {
        q: "Wat gaf Jojada aan de oversten in de tempel?",
        a: ["De speren en schilden van koning David", "De kroon en de mantel van Athalia", "Het goud uit de kist bij het altaar"],
        why: "2 Koningen 11:10",
      },
      {
        q: "Hoe lang deed Joas wat recht was in de ogen van de HEERE?",
        a: ["Zolang de priester Jojada hem onderwees", "Alleen in zijn eerste jaar als koning", "Pas nadat Hazaël was weggetrokken"],
        why: "2 Koningen 12:2",
      },
      {
        q: "Waarvoor was het geld in de kist?",
        a: ["Om het huis van de HEERE te herstellen", "Om nieuwe gouden schalen te maken", "Om een nieuw paleis te bouwen"],
        why: "2 Koningen 12:9–14",
      },
    ],
  },
  66: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Koning Hosea zoekt hulp in Egypte",
        stap: "2koningen:ballingschap:0",
        t: "Hosea is koning van Israël in Samaria. Hij doet wat kwaad is in de ogen van de HEERE. Hij is de knecht van Salmaneser, de koning van Assyrië, en moet hem elk jaar een geschenk geven, een soort belasting. Maar Hosea stuurt boden naar So, de koning van Egypte, en stopt met betalen. Daarom zet de koning van Assyrië hem gevangen.",
      },
      {
        kop: "Samaria valt",
        t: "Het leger van Assyrië belegert Samaria drie jaar. Belegeren betekent: een stad insluiten, zodat niemand erin of eruit kan. In het negende jaar van Hosea wordt de stad ingenomen. De Israëlieten worden weggevoerd naar Halah, naar Habor aan de rivier Gozan en naar de steden van de Meden. In hun steden komen mensen uit Babel en andere landen wonen.",
      },
      {
        kop: "Waarom dit gebeurde",
        t: "Israël had gezondigd tegen de HEERE, Die hen uit Egypte had gehaald. Ze maakten twee gegoten kalveren en dienden Baäl. Steeds weer zei God door Zijn profeten: ‘Bekeert u van uw boze wegen’. Maar ‘zij verhardden hun nek’: ze wilden niet luisteren. Alleen de stam Juda bleef over.",
      },
    ],
    vragen: [
      {
        q: "Waarom zette de koning van Assyrië Hosea gevangen?",
        a: [
          "Hosea zocht hulp in Egypte en betaalde niet meer",
          "Hosea had geprobeerd Ninevé aan te vallen",
          "Hosea had alle profeten laten doden",
        ],
        why: "2 Koningen 17:4",
      },
      {
        q: "Waar werden de Israëlieten heen gebracht?",
        a: ["Naar Assyrië, onder andere naar Halah", "Naar Egypte, naar de koning So", "Naar Juda, naar de stad Jeruzalem"],
        why: "2 Koningen 17:6",
      },
      {
        q: "Wat bedoelt de Bijbel met ‘zij verhardden hun nek’?",
        a: ["Ze wilden niet naar God luisteren", "Ze moesten zwaar werk doen", "Ze waren sterk in de oorlog"],
        why: "2 Koningen 17:14",
      },
      {
        q: "Wie kwamen er in de steden van Samaria wonen?",
        a: ["Mensen uit Babel en andere landen", "Mensen uit Juda en Benjamin", "Mensen uit Egypte en Cusch"],
        why: "2 Koningen 17:24",
      },
    ],
  },
  67: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een koning die op de HEERE vertrouwt",
        stap: "2koningen:ballingschap:1",
        t: "Hizkia is vijfentwintig als hij koning van Juda wordt. Geen koning van Juda vertrouwde zo op de HEERE als hij. Hij haalt de offerhoogten (offerplaatsen buiten de tempel) weg en verbrijzelt zelfs de koperen slang van Mozes, omdat het volk daarvoor reukwerk brandde.",
      },
      {
        kop: "Een brief voor de HEERE",
        stap: "2koningen:ballingschap:2",
        t: "Sanherib, de koning van Assyrië, valt Juda binnen. Zijn dienaar Rabsake roept bij de muur van Jeruzalem dat de HEERE de stad niet zal redden. Dan stuurt Sanherib een dreigbrief. Hizkia spreidt de brief uit in het huis van de HEERE en bidt: ‘Gij alleen zijt de God van alle koninkrijken der aarde’.",
      },
      {
        kop: "Gods antwoord",
        stap: "2koningen:ballingschap:3",
        t: "Door de profeet Jesaja zegt God dat Hij het gebed gehoord heeft. Die nacht slaat de Engel van de HEERE in het leger van Assyrië honderdvijfentachtigduizend man. Sanherib gaat terug naar Ninevé.",
      },
      {
        kop: "Vijftien jaar erbij",
        t: "In die dagen wordt Hizkia doodziek. Hij bidt en huilt, en God geeft hem nog vijftien jaar. Als teken gaat de schaduw tien graden terug. Maar Hizkia toont gezanten uit Babel al zijn schatten. Jesaja zegt: alles zal naar Babel weggevoerd worden.",
      },
    ],
    vragen: [
      {
        q: "Waarom verbrijzelde Hizkia de koperen slang van Mozes?",
        a: ["Het volk brandde er reukwerk voor", "Hij was oud en kapotgegaan", "Sanherib wilde hem meenemen"],
        why: "2 Koningen 18:4",
      },
      {
        q: "Wat deed Hizkia met de brief van Sanherib?",
        a: [
          "Hij spreidde hem uit voor de HEERE en bad",
          "Hij scheurde hem en stuurde hem terug",
          "Hij las hem voor aan het volk op de muur",
        ],
        why: "2 Koningen 19:14–15",
      },
      {
        q: "Waarom vroeg Hizkia God om redding?",
        a: [
          "Zodat alle koninkrijken weten dat de HEERE alleen God is",
          "Zodat hij zelf beroemd zou worden onder de volken",
          "Zodat hij daarna Ninevé kon innemen",
        ],
        why: "2 Koningen 19:19",
      },
      {
        q: "Welk teken kreeg Hizkia toen hij ziek was?",
        a: ["De schaduw ging tien graden terug", "Er viel vuur uit de hemel", "Er kwam een wolkje uit de zee"],
        why: "2 Koningen 20:9–11",
      },
    ],
  },
  68: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een boek in het huis van de HEERE",
        stap: "2koningen:ballingschap:4",
        t: "Josia is acht jaar als hij koning wordt in Jeruzalem, en hij doet wat recht is in de ogen van de HEERE. In zijn achttiende jaar laat hij de tempel herstellen. Dan vindt de hogepriester Hilkia het wetboek: het boek met Gods wet. De schrijver Safan leest het voor aan de koning. Josia scheurt zijn kleren. Hij zegt: de HEERE is toornig, omdat onze vaderen niet naar dit boek gehoord hebben.",
      },
      {
        kop: "Het antwoord van Hulda",
        t: "Josia laat de HEERE vragen bij de profetes Hulda. Een profetes is een vrouw die Gods woord doorgeeft. Zij zegt: het kwaad uit het boek komt over Jeruzalem, omdat het volk andere goden vereerd heeft. Maar Josia zal het niet zien, omdat hij zich voor de HEERE vernederd heeft.",
      },
      {
        kop: "Een verbond bij de pilaar",
        t: "Josia leest het boek voor aan het hele volk. Bij de pilaar sluit hij een verbond: een plechtige belofte om de HEERE te volgen met heel zijn hart. Hij ruimt de afgoden op, tot in Bethel toe, en viert het Pascha. Later wordt hij bij Megiddo gedood door farao Necho van Egypte.",
      },
    ],
    vragen: [
      {
        q: "Waar werd het wetboek gevonden?",
        a: ["In het huis van de HEERE", "In het paleis van de koning", "In de stad Bethel"],
        why: "2 Koningen 22:8",
      },
      {
        q: "Waarom was de HEERE toornig, volgens Josia?",
        a: ["Hun vaderen hadden niet naar het boek gehoord", "Het geld voor de tempel was gestolen", "De tempel was nog niet hersteld"],
        why: "2 Koningen 22:13",
      },
      {
        q: "Wat deed Josia nadat hij het boek aan het volk had voorgelezen?",
        a: ["Hij sloot een verbond bij de pilaar", "Hij verbrandde het boek", "Hij stuurde het boek naar Babel"],
        why: "2 Koningen 23:2–3",
      },
      { q: "In welke stad brak Josia het altaar van Jerobeam af?", a: ["Bethel", "Jericho", "Hebron"], why: "2 Koningen 23:15" },
      {
        q: "Wat gebeurde er als eerste?",
        a: ["Hilkia vond het wetboek", "Het volk vierde het Pascha", "Josia sloot een verbond bij de pilaar"],
        why: "2 Koningen 22:8; 2 Koningen 23:3; 2 Koningen 23:21–23",
      },
    ],
  },
  69: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Weg van de HEERE",
        stap: "jona:jona:1",
        t: "De HEERE zegt tegen Jona: ga naar de grote stad Ninevé en preek tegen haar, want hun boosheid is tot bij Mij gekomen. Maar Jona vlucht naar Tarsis, ‘van het aangezicht des HEEREN’: weg van de HEERE. In Jafo vindt hij een schip. Hij betaalt de reis en gaat aan boord.",
      },
      {
        kop: "Storm op zee",
        stap: "jona:jona:2",
        t: "De HEERE werpt een grote wind op de zee. De zeelieden roepen tot hun goden en gooien de lading overboord. Jona slaapt. Ze werpen het lot, en het valt op Jona. Hij zegt dat hij de HEERE vreest, Die de zee en het droge gemaakt heeft. ‘Neemt mij op, en werpt mij in de zee’, zegt hij. Eerst roeien de mannen nog, maar het lukt niet. Dan bidden ze tot de HEERE en werpen Jona in zee. De zee wordt stil.",
      },
      {
        kop: "In de buik van de vis",
        stap: "jona:jona:3",
        t: "De HEERE beschikt een grote vis: Hij laat hem komen om Jona in te slokken. Drie dagen en drie nachten zit Jona in de vis. Daar bidt hij, en hij eindigt met: ‘Het heil is des HEEREN.’ Dat betekent: redding komt van de HEERE. Dan spreekt de HEERE tot de vis, en die spuwt Jona uit op het droge.",
      },
    ],
    vragen: [
      { q: "Waar wilde Jona met het schip naartoe?", a: ["Naar Tarsis", "Naar Ninevé", "Naar Jeruzalem"], why: "Jona 1:3" },
      {
        q: "Waarom gooiden de zeelieden de lading in zee?",
        a: ["Om het schip lichter te maken", "Om de vissen te voeren", "Omdat Jona dat vroeg"],
        why: "Jona 1:5",
      },
      {
        q: "Waarom wierpen de zeelieden het lot?",
        a: ["Om te weten door wie het kwaad hen overkwam", "Om te kiezen wie moest roeien", "Om te weten welke kant ze op moesten"],
        why: "Jona 1:7",
      },
      {
        q: "Wat deden de mannen voordat ze Jona in zee wierpen?",
        a: ["Ze probeerden naar het land te roeien", "Ze sprongen zelf in het water", "Ze voeren terug naar Jafo"],
        why: "Jona 1:13",
      },
      {
        q: "Waar bad Jona tot de HEERE?",
        a: ["In het ingewand van de vis", "Op het dek van het schip", "Op het strand bij Jafo"],
        why: "Jona 2:1",
      },
    ],
  },
  70: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Nog veertig dagen",
        stap: "jona:jona:4",
        t: "Voor de tweede keer zegt de HEERE tegen Jona: ga naar Ninevé. Nu gaat hij. Ninevé is een grote stad, ‘van drie dagreizen’. Een dagreis is wat je op één dag loopt. Jona gaat een dag de stad in en roept: ‘Nog veertig dagen, dan zal Nineve worden omgekeerd.’ Dat betekent: dan wordt de stad verwoest.",
      },
      {
        kop: "Een stad in rouw",
        stap: "jona:jona:5",
        t: "De mensen van Ninevé geloven God. Ze vasten en trekken zakken aan: ruwe rouwkleren. De koning staat op van zijn troon en gaat in de as zitten. Hij beveelt: mens en dier eten en drinken niet, en iedereen moet zich bekeren van zijn boze weg. God ziet het, en Hij doet het kwaad niet dat Hij gezegd had.",
      },
      {
        kop: "Jona en de wonderboom",
        stap: "jona:jona:6",
        t: "Jona wordt heel boos. Hij zegt: ik wist dat U een genadig en barmhartig God bent; daarom vluchtte ik. Aan de oostkant van de stad wacht hij af. God laat een wonderboom opschieten voor schaduw. Maar de volgende morgen laat God een worm de boom steken, en hij verdort. Dan zegt God: jij hebt medelijden met die boom. ‘En Ik zou die grote stad Nineve niet verschonen?’ Verschonen betekent: sparen.",
      },
    ],
    vragen: [
      {
        q: "Hoe vaak kreeg Jona de opdracht om naar Ninevé te gaan?",
        a: ["Twee keer", "Eén keer", "Drie keer"],
        why: "Jona 1:2; Jona 3:1–2",
      },
      {
        q: "Wat deed de koning toen hij hoorde wat Jona preekte?",
        a: ["Hij trok een zak aan en zat in de as", "Hij liet Jona gevangennemen", "Hij vluchtte uit de stad"],
        why: "Jona 3:6",
      },
      {
        q: "Waarom deed God het kwaad niet?",
        a: ["Hij zag dat ze zich bekeerden van hun boze weg", "Jona had voor de stad gebeden", "De koning had God goud beloofd"],
        why: "Jona 3:10",
      },
      {
        q: "Wat gebeurde er met de wonderboom?",
        a: ["Een worm stak hem, zodat hij verdorde", "De wind blies hem omver", "Jona hakte hem om"],
        why: "Jona 4:7",
      },
    ],
  },
  71: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Jeruzalem valt",
        stap: "2koningen:ballingschap:7",
        t: "In het negende jaar van koning Zedekia belegert Nebukadnezar Jeruzalem: zijn leger ligt rondom de stad. In het elfde jaar is er geen brood meer. De muur wordt doorgebroken en Zedekia vlucht ’s nachts, maar bij Jericho wordt hij ingehaald. In Ribla worden zijn zonen voor zijn ogen gedood. Daarna wordt hij blind gemaakt en in koperen ketenen naar Babel gebracht.",
      },
      {
        kop: "Het huis van de HEERE verbrand",
        t: "Nebuzaradan, de overste van de lijfwacht, verbrandt het huis van de HEERE, het paleis en alle huizen. Het volk wordt naar Babel weggevoerd. Een paar van de armsten blijven, voor de wijngaarden en akkers. Later zegt Nebuzaradan tegen Jeremia waarom: ‘gijlieden hebt gezondigd tegen den HEERE’.",
      },
      {
        kop: "Jeremia en Ebed-Melech",
        stap: "profeten:jeremia:2",
        t: "Nebukadnezar heeft bevolen: doe Jeremia niets kwaads. In Rama maakt Nebuzaradan zijn ketenen los, en Jeremia gaat wonen bij Gedalja in Mizpa. Al eerder kreeg Ebed-Melech, die Jeremia uit de kuil had gehaald, een belofte: hij wordt gered, ‘omdat gij op Mij vertrouwd hebt’. En in Babel laat koning Evilmerodach na 37 jaar koning Jojachin vrij.",
      },
    ],
    vragen: [
      { q: "Wie verbrandde het huis van de HEERE?", a: ["Nebuzaradan", "Gedalja", "Zedekia"], why: "2 Koningen 25:8–9" },
      {
        q: "Waarom kwam dit kwaad over Jeruzalem, volgens Nebuzaradan?",
        a: ["Het volk had tegen de HEERE gezondigd", "Zedekia had te weinig soldaten", "Jeremia had de stad verraden"],
        why: "Jeremia 40:2–3",
      },
      {
        q: "Waarom zou Ebed-Melech gered worden?",
        a: ["Hij had op de HEERE vertrouwd", "Hij was een vriend van Nebukadnezar", "Hij had de poort voor Babel geopend"],
        why: "Jeremia 39:18",
      },
      {
        q: "Bij wie ging Jeremia wonen?",
        a: ["Bij Gedalja in Mizpa", "Bij Nebuzaradan in Babel", "Bij Zedekia in Ribla"],
        why: "Jeremia 40:6",
      },
      {
        q: "Wat gebeurde er als eerste?",
        a: ["De muur van Jeruzalem werd doorgebroken", "Jeremia ging naar Mizpa", "Jojachin kwam uit de gevangenis"],
        why: "Jeremia 39:2; Jeremia 40:6; 2 Koningen 25:27",
      },
    ],
  },
  72: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Troost, troost Mijn volk",
        stap: "profeten:jesaja-troost:0",
        t: "Jesaja heeft koning Hizkia gezegd dat alles naar Babel zal worden weggevoerd. Daarna klinkt: ‘Troost, troost Mijn volk, zal ulieder God zeggen.’ Ulieder betekent: jullie. Een stem roept dat de weg voor de HEERE klaargemaakt moet worden. Mensen zijn als gras, ‘maar het Woord onzes Gods bestaat in der eeuwigheid’. God zal Zijn kudde weiden als een herder.",
      },
      {
        kop: "Niemand is aan God gelijk",
        stap: "profeten:jesaja-troost:1",
        t: "Voor God zijn de volken als een druppel aan een emmer. Mensen maken beelden van goud en hout, maar: ‘Bij wien dan zult gij God vergelijken?’ God roept de sterren bij hun naam en wordt nooit moe. Wie de HEERE verwacht, krijgt nieuwe kracht, ‘gelijk de arenden’. Verwachten betekent hier: op Hem hopen en wachten.",
      },
      {
        kop: "Vrees niet",
        stap: "profeten:jesaja-troost:4",
        t: "God zegt tegen Zijn volk: ‘Vrees niet, want Ik ben met u.’ Hij kondigt Zijn Knecht aan, op Wie Hij Zijn Geest geeft. Die breekt ‘het gekrookte riet’ niet af: een geknakt riet. En God zegt: ‘Ik heb u bij uw naam geroepen, gij zijt Mijn.’",
      },
    ],
    vragen: [
      {
        q: "Wat had Jesaja vlak daarvoor tegen koning Hizkia gezegd?",
        a: [
          "Dat alles naar Babel weggevoerd zou worden",
          "Dat Jeruzalem nooit meer belegerd zou worden",
          "Dat Hizkia naar Egypte moest vluchten",
        ],
        why: "Jesaja 39:6–7",
      },
      {
        q: "Waarmee vergelijkt Jesaja de volken?",
        a: ["Met een druppel van een emmer", "Met de sterren aan de hemel", "Met het zand aan de zee"],
        why: "Jesaja 40:15",
      },
      {
        q: "Wat gebeurt er met wie de HEERE verwachten?",
        a: ["Ze krijgen nieuwe kracht", "Ze worden moe en mat", "Ze vallen in een diepe slaap"],
        why: "Jesaja 40:31",
      },
      {
        q: "Waarom hoeft Gods volk niet bang te zijn?",
        a: ["God is met hen", "Ze hebben een sterk leger", "Babel is heel ver weg"],
        why: "Jesaja 41:10",
      },
      {
        q: "Wat doet de Knecht met het gekrookte riet?",
        a: ["Hij breekt het niet", "Hij gooit het weg", "Hij plant het opnieuw"],
        why: "Jesaja 42:3",
      },
    ],
  },
  73: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Van Jeruzalem naar Babel",
        stap: "daniel:daniel:1",
        t: "Nebukadnezar, de koning van Babel, belegert Jeruzalem. Hij laat jongens uit de koninklijke familie naar Babel brengen. Drie jaar leren ze de taal en de boeken van Babel. Daniël, Hananja, Misaël en Azarja zijn erbij. Ze krijgen nieuwe namen: Beltsazar, Sadrach, Mesach en Abed-Nego.",
      },
      {
        kop: "Groente en water",
        stap: "daniel:daniel:2",
        t: "Daniël wil zich niet onrein maken met het eten en de wijn van de koning. Hij vraagt om tien dagen groente en water. Daarna zien de vier er beter uit dan de anderen. God geeft hun kennis en wijsheid, en Daniël verstand van dromen.",
      },
      {
        kop: "Een droom die niemand weet",
        stap: "daniel:daniel:3",
        t: "De koning wil dat zijn wijzen de droom én de uitleg vertellen. Niemand kan het. Dan wil hij alle wijzen doden, ook Daniël en zijn vrienden. Ze bidden tot God, en in de nacht maakt God de droom aan Daniël bekend.",
      },
      {
        kop: "Een steen wordt een berg",
        t: "Daniël zegt: ‘er is een God in den hemel, Die verborgenheden openbaart’ (geheimen bekendmaakt). De koning zag een groot beeld van goud, zilver, koper, ijzer en leem. Een steen sloeg het kapot en werd een grote berg. Daniël legt uit: God richt een Koninkrijk op dat nooit vergaat.",
      },
    ],
    vragen: [
      {
        q: "Waarom vraagt Daniël om groente en water?",
        a: ["Hij wil zich niet onrein maken", "Hij is ziek geworden", "De koning heeft dat bevolen"],
        why: "Daniël 1:8",
      },
      {
        q: "Wie geeft de vier jongens kennis en wijsheid?",
        a: ["God", "De opzichter van de jongens", "Koning Nebukadnezar"],
        why: "Daniël 1:17",
      },
      {
        q: "Wat moeten de wijzen aan de koning vertellen?",
        a: ["De droom én de uitleg", "Alleen de uitleg", "Hoe lang hij koning blijft"],
        why: "Daniël 2:5–6",
      },
      {
        q: "Wat doet Daniël als God hem de droom bekendmaakt?",
        a: ["Hij looft de God van de hemel", "Hij gaat terug naar Jeruzalem", "Hij schrijft het op een rol"],
        why: "Daniël 2:19",
      },
      {
        q: "Wat betekent de steen die een berg wordt?",
        a: ["Gods Koninkrijk dat eeuwig blijft", "Het rijk van Nebukadnezar", "Een nieuwe tempel in Babel"],
        why: "Daniël 2:44–45",
      },
    ],
  },
  74: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een beeld van goud",
        stap: "daniel:daniel:4",
        t: "Koning Nebukadnezar laat een beeld van goud maken, zestig el hoog. Een el is ongeveer een halve meter. Hij zet het in het dal Dura, in het landschap van Babel. Een heraut, een omroeper van de koning, roept: als de muziek klinkt, moet iedereen neervallen en het beeld aanbidden. Wie dat niet doet, wordt in een brandende oven geworpen.",
      },
      {
        kop: "Wij aanbidden het beeld niet",
        t: "Sadrach, Mesach en Abed-Nego buigen niet. Chaldeeuwse mannen klagen hen aan. De woedende koning vraagt welke God hen uit zijn handen zou kunnen verlossen. Ze antwoorden: ‘onze God, Dien wij eren, is machtig ons te verlossen’. En ook als Hij het niet doet, zullen ze het beeld niet aanbidden.",
      },
      {
        kop: "Vier mannen in het vuur",
        t: "De oven wordt zeven keer heter gemaakt. De drie worden vastgebonden en erin geworpen. De mannen die hen erin werpen, worden zelf door het vuur gedood. Dan ziet de koning vier mannen los rondlopen in het vuur. Hij roept de drie naar buiten. Hun haar is niet verbrand en ze ruiken niet naar rook. Nebukadnezar looft hun God, Die Zijn engel gezonden heeft.",
      },
    ],
    vragen: [
      {
        q: "Wat moest iedereen doen als de muziek klonk?",
        a: ["Neervallen en het beeld aanbidden", "Naar huis gaan en feestvieren", "Een lied zingen voor de koning"],
        why: "Daniël 3:5",
      },
      {
        q: "Waarom aanbaden de drie vrienden het beeld niet?",
        a: ["Ze wilden alleen hun eigen God eren", "Ze hadden de muziek niet gehoord", "Ze waren te laat in het dal"],
        why: "Daniël 3:18; Daniël 3:28",
      },
      {
        q: "Wie vertelden de koning dat de drie niet bogen?",
        a: ["Chaldeeuwse mannen", "Daniël en zijn knechten", "De heraut van de koning"],
        why: "Daniël 3:8–12",
      },
      {
        q: "Wat zouden de vrienden doen als God hen niet zou redden?",
        a: ["Het beeld toch niet aanbidden", "Dan toch voor het beeld buigen", "Naar Jeruzalem vluchten"],
        why: "Daniël 3:18",
      },
      {
        q: "Wie heeft volgens Nebukadnezar de drie gered?",
        a: ["God, door Zijn engel", "De soldaten bij de oven", "De wijzen van Babel"],
        why: "Daniël 3:28",
      },
    ],
  },
  75: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Niets om Daniël aan te klagen",
        stap: "daniel:daniel:7",
        t: "Darius de Meder is koning geworden. Hij zet honderdtwintig stadhouders (bestuurders) over zijn rijk, met drie vorsten boven hen. Daniël is de eerste. De anderen zoeken iets om hem aan te klagen. Maar ze vinden niets, want Daniël is trouw.",
      },
      {
        kop: "Een wet van dertig dagen",
        t: "Ze laten de koning een wet tekenen: wie dertig dagen iets vraagt aan een god of een mens, behalve aan de koning, wordt in de leeuwenkuil geworpen. Zo’n wet van de Meden en Perzen mag niet veranderd worden. Daniël weet het. Toch knielt hij drie keer per dag en bidt tot zijn God, net als altijd, met de vensters open naar Jeruzalem.",
      },
      {
        kop: "Een engel in de leeuwenkuil",
        t: "De mannen vinden Daniël biddend en klagen hem aan. De koning is erg bedroefd, maar Daniël wordt toch in de kuil geworpen. ’s Morgens vroeg roept de koning bij de kuil. Daniël antwoordt: ‘Mijn God heeft Zijn engel gezonden, en Hij heeft den muil der leeuwen toegesloten’. Een muil is een bek. Daniël is niet gewond, want hij geloofde in zijn God. Zijn aanklagers worden daarna zelf met hun gezinnen in de kuil geworpen en gedood.",
      },
    ],
    vragen: [
      {
        q: "Waarom konden de vorsten niets vinden om Daniël aan te klagen?",
        a: ["Hij was trouw en deed niets verkeerd", "Hij woonde ver weg van het paleis", "De koning verborg zijn fouten"],
        why: "Daniël 6:5",
      },
      {
        q: "Wat stond er in de nieuwe wet?",
        a: [
          "Dertig dagen alleen iets vragen aan de koning",
          "Niemand mag nog naar Jeruzalem reizen",
          "Iedereen moet voor een gouden beeld buigen",
        ],
        why: "Daniël 6:8",
      },
      {
        q: "Naar welke stad stonden de vensters open als Daniël bad?",
        a: ["Naar Jeruzalem", "Naar Babel", "Naar Bethlehem"],
        why: "Daniël 6:11",
      },
      {
        q: "Waarom kon de koning de wet niet terugdraaien?",
        a: [
          "Een wet van de Meden en Perzen mocht niet veranderen",
          "Daniël wilde zelf niet gered worden",
          "De vorsten hadden de wet verstopt",
        ],
        why: "Daniël 6:16",
      },
      {
        q: "Waarom hadden de leeuwen Daniël niets gedaan?",
        a: ["God had Zijn engel gezonden", "De leeuwen sliepen die nacht", "De koning had ze eten gegeven"],
        why: "Daniël 6:23",
      },
    ],
  },
  76: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Kores laat het volk gaan",
        stap: "ezra:terugkeer:0",
        t: "In het eerste jaar van Kores, de koning van Perzië, wekt de HEERE zijn geest op. Dat betekent: de HEERE maakt dat Kores dit wil. Zo gebeurt wat God door Jeremia zei. Kores laat bekendmaken: wie bij Gods volk hoort, mag naar Jeruzalem gaan om het huis van de HEERE te bouwen. Hij geeft ook de vaten terug die Nebukadnezar uit de tempel had weggehaald.",
      },
      {
        kop: "Juichen en huilen",
        stap: "ezra:terugkeer:3",
        t: "Een grote groep keert terug met Zerubbabel en Jesua. Eerst bouwen ze het altaar voor brandoffers. In het tweede jaar leggen ze het fundament, de onderkant, van de tempel. Ze loven de HEERE, dat Hij goed is, en het volk juicht. Maar oude mannen die de eerste tempel nog gezien hebben, huilen hardop.",
      },
      {
        kop: "Stilgelegd en toch klaar",
        stap: "ezra:terugkeer:5",
        t: "Tegenstanders ontmoedigen het volk, en het werk ligt stil tot het tweede jaar van koning Darius. Dan profeteren Haggaï en Zacharia, en het volk bouwt verder. In Achmetha wordt het bevel van Kores teruggevonden, en Darius zegt: laat hen bouwen. In het zesde jaar van Darius is de tempel klaar. Het volk viert met blijdschap de inwijding en het Pascha.",
      },
    ],
    vragen: [
      {
        q: "Waarom liet Kores het volk gaan?",
        a: ["De HEERE had zijn geest opgewekt", "Het volk had hem goud gegeven", "Hij was bang voor Jeruzalem"],
        why: "Ezra 1:1",
      },
      {
        q: "Wie bouwden het altaar?",
        a: ["Jesua en Zerubbabel met hun broeders", "Haggaï en Zacharia", "Kores en Darius"],
        why: "Ezra 3:2",
      },
      {
        q: "Wat gebeurde er eerst?",
        a: ["Het altaar werd gebouwd", "Het fundament werd gelegd", "De tempel werd ingewijd"],
        why: "Ezra 3:2–10",
      },
      {
        q: "Waarom lag het werk aan de tempel stil?",
        a: ["Tegenstanders hielden het bouwen tegen", "Er was geen hout meer", "Het volk ging terug naar Babel"],
        why: "Ezra 4:4–5; Ezra 4:24",
      },
      {
        q: "Wat werd er in Achmetha gevonden?",
        a: ["Een rol met het bevel van Kores", "De vaten van de tempel", "Een brief van Jeremia"],
        why: "Ezra 6:2–3",
      },
    ],
  },
  77: {
    status: "concept",
    delen: [
      {
        kop: "Een feest in de burcht Susan",
        stap: "esther:esther:0",
        t: "Koning Ahasveros regeert vanuit de burcht Susan over honderdzevenentwintig landschappen. In zijn derde jaar geeft hij een groot feestmaal. Op de zevende dag laat hij koningin Vasthi roepen, om haar schoonheid te laten zien. Maar Vasthi weigert te komen. Daarom besluit de koning dat zij geen koningin meer mag zijn.",
      },
      {
        kop: "Esther wordt koningin",
        stap: "esther:esther:1",
        t: "Uit het hele rijk worden jonge vrouwen naar Susan gebracht, ook Esther. Zij is Joods en heeft geen vader en moeder meer. Haar neef Mordechai heeft haar als zijn dochter opgevoed. Op zijn bevel vertelt ze niet uit welk volk ze komt. De koning houdt meer van Esther dan van alle anderen en zet haar de kroon op.",
      },
      {
        kop: "Haman en het lot",
        stap: "esther:esther:2",
        t: "Mordechai hoort dat twee kamerlingen (dienaren van de koning) hem willen doden. Dat wordt opgeschreven in de kronieken. Daarna maakt de koning Haman de hoogste van alle vorsten. Mordechai buigt niet voor hem. Daarom wil Haman alle Joden laten doden. Het lot, het Pur, wijst een dag aan: de dertiende van de maand Adar.",
      },
    ],
    vragen: [
      {
        q: "Waarom mocht Vasthi geen koningin meer zijn?",
        a: ["Ze weigerde te komen toen de koning haar riep", "Ze was naar een ander land vertrokken", "Ze wilde de koning laten doden"],
        why: "Esther 1:12–19",
      },
      { q: "Wie had Esther opgevoed?", a: ["Mordechai, haar neef", "Hegai, de kamerling", "Haman, de vorst"], why: "Esther 2:7" },
      {
        q: "Waarom vertelde Esther niet dat ze Joods was?",
        a: ["Mordechai had het haar geboden", "Ze wist het zelf niet", "De koning had het verboden"],
        why: "Esther 2:10",
      },
      {
        q: "Wat werd er gedaan nadat de zaak was onderzocht?",
        a: ["Het werd in de kronieken opgeschreven", "Mordechai werd meteen een vorst", "Mordechai werd uit de poort gestuurd"],
        why: "Esther 2:22–23",
      },
      {
        q: "Waarvoor werd het lot, het Pur, geworpen?",
        a: ["Om een dag te kiezen", "Om een koningin te kiezen", "Om een vorst te kiezen"],
        why: "Esther 3:7, 13",
      },
    ],
  },
  78: {
    status: "concept",
    delen: [
      {
        kop: "Voor zulk een tijd als deze",
        stap: "esther:esther:3",
        t: "Als Mordechai het bevel van Haman hoort, scheurt hij zijn kleren. Hij vraagt Esther om bij de koning te smeken voor haar volk. Maar wie ongeroepen bij de koning komt, wordt gedood, tenzij de koning de gouden scepter uitsteekt. Mordechai laat zeggen: misschien ben je juist voor deze tijd koningin geworden. Esther laat de Joden drie dagen vasten en zegt: ‘Wanneer ik dan omkome, zo kom ik om.’",
      },
      {
        kop: "Een nacht zonder slaap",
        stap: "esther:esther:5",
        t: "De koning steekt de scepter naar Esther uit. Ze nodigt hem en Haman uit voor een maaltijd. Haman laat een galg maken voor Mordechai. Maar die nacht kan de koning niet slapen. Uit de kronieken hoort hij dat Mordechai hem gered heeft. Nu moet Haman zelf Mordechai eren.",
      },
      {
        kop: "Alles draait om",
        stap: "esther:esther:6",
        t: "Bij de tweede maaltijd zegt Esther dat Haman haar volk wil uitroeien. Haman wordt opgehangen aan de galg die hij voor Mordechai had gemaakt. Een bevel met de ring van de koning kan niet worden ingetrokken. Daarom krijgen de Joden met een nieuw bevel het recht om voor hun leven op te komen.",
      },
    ],
    vragen: [
      {
        q: "Waarom was het gevaarlijk voor Esther om naar de koning te gaan?",
        a: ["Wie ongeroepen kwam, werd gedood", "De koning was ziek en wilde niemand zien", "Haman bewaakte de deur van de koning"],
        why: "Esther 4:11",
      },
      {
        q: "Wat vroeg Esther aan de Joden in Susan?",
        a: ["Drie dagen voor haar vasten", "Een galg voor Haman bouwen", "Samen de stad uit vluchten"],
        why: "Esther 4:16",
      },
      {
        q: "Hoe hoorde de koning dat Mordechai hem gered had?",
        a: ["Uit de kronieken die werden voorgelezen", "Mordechai kwam het hem zelf zeggen", "Haman vertelde het hem"],
        why: "Esther 6:1–2",
      },
      {
        q: "Wat gebeurde er met Haman?",
        a: ["Hij werd opgehangen aan zijn eigen galg", "Hij werd naar Babel gestuurd", "Hij werd de tweede na de koning"],
        why: "Esther 7:9–10",
      },
      {
        q: "Waarom kwam er een nieuw bevel in plaats van het oude in te trekken?",
        a: [
          "Wat met de ring van de koning verzegeld was, kon niet herroepen worden",
          "Haman had het oude bevel meegenomen",
          "De koning was het oude bevel vergeten",
        ],
        why: "Esther 8:8",
      },
    ],
  },
  79: {
    status: "concept",
    delen: [
      {
        kop: "Keert weder tot Mij",
        stap: "profeten:zacharia-maleachi:0",
        t: "In het tweede jaar van koning Darius spreekt God door de profeet Zacharia. God roept: ‘Keert weder tot Mij … zo zal Ik weder tot ulieden keren.’ Dat betekent: kom terug bij Mij, dan kom Ik terug bij jullie. Wees niet als jullie vaders, die niet luisterden naar de profeten.",
      },
      {
        kop: "Een Koning op een ezel",
        stap: "profeten:zacharia-maleachi:2",
        t: "Zacharia roept Jeruzalem op om te juichen: ‘Ziet, uw Koning zal u komen, rechtvaardig, en Hij is een Heiland’. Een Heiland is iemand die redt. Deze Koning is arm en rijdt op een ezel. Hij spreekt vrede tot de volken.",
      },
      {
        kop: "Een bode en de profeet Elia",
        stap: "profeten:zacharia-maleachi:4",
        t: "In Maleachi, het laatste boek van het Oude Testament, zegt God: ‘Ziet, Ik zende Mijn engel, die voor Mijn aangezicht den weg bereiden zal’. Engel betekent hier: bode. Daarna komt de Heere naar Zijn tempel. Vóór de grote dag van de HEERE stuurt God de profeet Elia. De Heere Jezus zegt later dat Johannes de Doper die bode is (Mattheüs 11:10).",
      },
    ],
    vragen: [
      {
        q: "Waarom moest het volk niet doen zoals hun vaders?",
        a: ["Hun vaders luisterden niet naar de profeten", "Hun vaders waren in Egypte gebleven", "Hun vaders hadden de tempel gebouwd"],
        why: "Zacharia 1:4",
      },
      {
        q: "Hoe komt de Koning naar Jeruzalem, volgens Zacharia?",
        a: ["Arm, en rijdend op een ezel", "Met strijdwagens en paarden", "Met een groot leger soldaten"],
        why: "Zacharia 9:9",
      },
      {
        q: "Wat zal de bode uit Maleachi 3 doen?",
        a: ["De weg bereiden voor de Heere", "De tempel opnieuw opbouwen", "Het volk naar Babel brengen"],
        why: "Maleachi 3:1",
      },
      {
        q: "Wie stuurt God vóór de grote dag van de HEERE?",
        a: ["De profeet Elia", "De profeet Zacharia", "Koning David"],
        why: "Maleachi 4:5",
      },
    ],
  },
  80: {
    status: "concept",
    delen: [
      {
        kop: "Een priester en zijn vrouw",
        t: "In de tijd van koning Herodes leeft er een priester, Zacharias. Een priester doet de dienst voor God in de tempel. Hij en zijn vrouw Elisabeth zijn rechtvaardig voor God en leven naar al Zijn geboden. Maar ze hebben geen kind, want Elisabeth is onvruchtbaar: ze kan geen kinderen krijgen. En ze zijn allebei al oud.",
      },
      {
        kop: "Een engel bij het altaar",
        stap: "jezus-1:nt-geboorte:0",
        t: "Het lot wijst Zacharias aan om in de tempel het reukoffer te brengen. Buiten bidt het volk. Dan staat er een engel rechts van het altaar. Zacharias schrikt. De engel zegt: ‘Vrees niet, Zacharias! want uw gebed is verhoord’. Elisabeth krijgt een zoon, en hij moet Johannes heten.",
      },
      {
        kop: "Stil tot het gebeurt",
        t: "Zacharias vraagt waaraan hij dat kan weten, want hij is oud. De engel zegt: ‘Ik ben Gabriël, die voor God sta’. Omdat Zacharias het niet gelooft, zal hij niet kunnen spreken tot alles gebeurd is. Als hij naar buiten komt, kan hij alleen gebaren maken. Na zijn dienst gaat hij naar huis, en Elisabeth wordt zwanger.",
      },
    ],
    vragen: [
      {
        q: "Hoe werd Zacharias gekozen om het reukoffer te brengen?",
        a: ["Het lot viel op hem", "Hij had het zelf gevraagd", "Koning Herodes had het bevolen"],
        why: "Lukas 1:9",
      },
      {
        q: "Wat deed het volk terwijl Zacharias in de tempel was?",
        a: ["Het bad buiten", "Het ging naar huis", "Het bracht offers binnen"],
        why: "Lukas 1:10",
      },
      {
        q: "Waarom kon Zacharias niet meer spreken?",
        a: ["Hij had de woorden van de engel niet geloofd", "Hij was ziek geworden in de tempel", "Hij had beloofd om te zwijgen"],
        why: "Lukas 1:20",
      },
      { q: "Hoe heette de engel?", a: ["Gabriël", "Michaël", "Johannes"], why: "Lukas 1:19" },
    ],
  },
  81: {
    status: "concept",
    delen: [
      {
        kop: "Gabriël in Nazareth",
        stap: "jezus-1:nt-geboorte:1",
        t: "God stuurt de engel Gabriël naar Nazareth, naar Maria. Zij is ondertrouwd met Jozef uit het huis van David: ze hebben beloofd met elkaar te trouwen. De engel zegt dat Maria een Zoon zal krijgen, Die Jezus moet heten. Hij zal de Zoon van de Allerhoogste genoemd worden, en aan Zijn Koninkrijk komt geen einde.",
      },
      {
        kop: "Mij geschiede naar uw woord",
        t: "Maria vraagt hoe dat kan. De engel zegt dat de Heilige Geest over haar zal komen. Ook Elisabeth, die onvruchtbaar heette, verwacht een zoon, ‘want geen ding zal bij God onmogelijk zijn.’ Maria antwoordt: ‘Zie, de dienstmaagd des Heeren; mij geschiede naar uw woord.’ Dat betekent: ik ben de dienares van de Heere; laat het zo gebeuren.",
      },
      {
        kop: "Bij Elisabeth",
        stap: "jezus-1:nt-geboorte:3",
        t: "Maria reist haastig naar Elisabeth, in het bergland van Juda. Als Elisabeth haar groet hoort, springt het kindje op in haar buik. Maria looft God en blijft ongeveer drie maanden.",
      },
      {
        kop: "De droom van Jozef",
        stap: "jezus-1:nt-geboorte:2",
        t: "Jozef wil Maria eerst in stilte verlaten. Maar een engel zegt hem in een droom dat het Kind uit de Heilige Geest is. Jozef doet wat de engel zegt en neemt Maria als zijn vrouw.",
      },
    ],
    vragen: [
      {
        q: "Met wie was Maria ondertrouwd?",
        a: ["Met Jozef, uit het huis van David", "Met Zacharias, de priester", "Met een herder uit Bethlehem"],
        why: "Lukas 1:27",
      },
      {
        q: "Welk nieuws over Elisabeth vertelde de engel aan Maria?",
        a: ["Dat zij in haar ouderdom zwanger was", "Dat zij naar Nazareth zou komen", "Dat zij een dochter zou krijgen"],
        why: "Lukas 1:36",
      },
      {
        q: "Wat gebeurde er toen Elisabeth de groet van Maria hoorde?",
        a: ["Het kindje sprong op in haar buik", "Zacharias kon weer spreken", "Er kwam een engel binnen"],
        why: "Lukas 1:41",
      },
      {
        q: "Wat deed Jozef toen hij wakker werd?",
        a: ["Hij nam Maria als zijn vrouw", "Hij vertrok meteen naar Egypte", "Hij ging naar de tempel"],
        why: "Mattheüs 1:24",
      },
    ],
  },
  82: {
    status: "concept",
    delen: [
      {
        kop: "Johannes is zijn naam",
        stap: "jezus-1:nt-geboorte:4",
        t: "Elisabeth krijgt een zoon, en haar buren en familie zijn blij met haar. Op de achtste dag wordt het kind besneden. Dat is het teken van Gods verbond met Abraham (Genesis 17:11–12). De familie wil hem Zacharias noemen, naar zijn vader. Maar Elisabeth zegt: ‘Niet alzo, maar hij zal Johannes heten.’ Niemand in de familie heet zo. Daarom vragen ze het met gebaren aan Zacharias. Hij schrijft op een schrijftafeltje: ‘Johannes is zijn naam.’",
      },
      {
        kop: "Zacharias spreekt weer",
        t: "Meteen kan Zacharias weer spreken, en hij looft God. In het hele bergland van Judea praten de mensen erover. Vervuld met de Heilige Geest profeteert Zacharias: God brengt verlossing voor Zijn volk, in het huis van David, zoals Hij aan Abraham beloofd had.",
      },
      {
        kop: "Een profeet in de woestijn",
        t: "Tegen zijn zoon zegt Zacharias: ‘En gij, kindeken, zult een profeet des Allerhoogsten genaamd worden’. Johannes zal voor de Heere uit gaan om Zijn wegen te bereiden. Het kind groeit op en is in de woestijn, tot de dag dat hij aan Israël bekend wordt.",
      },
    ],
    vragen: [
      {
        q: "Waarom vond de familie de naam Johannes vreemd?",
        a: ["Niemand in de familie heette zo", "Het was de naam van een koning", "Zacharias wilde een andere naam"],
        why: "Lukas 1:61",
      },
      { q: "Hoe vroegen ze Zacharias naar de naam?", a: ["Met gebaren", "Met een brief", "Via een andere priester"], why: "Lukas 1:62" },
      {
        q: "Waarom kon Zacharias juist toen weer spreken?",
        a: ["Wat de engel gezegd had, was nu gebeurd", "Hij was eindelijk beter geworden", "Elisabeth had het hem gevraagd"],
        why: "Lukas 1:20, 64",
      },
      {
        q: "Wat zal Johannes doen volgens Zacharias?",
        a: [
          "Voor de Heere uit gaan om Zijn wegen te bereiden",
          "De tempel in Jeruzalem opnieuw bouwen",
          "Koning worden in het huis van David",
        ],
        why: "Lukas 1:76",
      },
    ],
  },
  83: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een bevel van de keizer",
        stap: "jezus-1:nt-geboorte:5",
        t: "Keizer Augustus beveelt dat iedereen zich moet laten inschrijven, ieder in zijn eigen stad. Jozef woont in Nazareth in Galilea, maar hij is uit het huis en geslacht van David. Daarom gaat hij naar Bethlehem in Judea, de stad van David. Maria, met wie hij ondertrouwd is, gaat met hem mee. Ondertrouwd betekent: ze hebben beloofd met elkaar te trouwen. Maria is zwanger.",
      },
      {
        kop: "Geboren in Bethlehem",
        t: "Terwijl ze in Bethlehem zijn, wordt Maria’s eerstgeboren Zoon geboren. Ze wikkelt Hem in doeken en legt Hem in een kribbe, een voerbak voor dieren, omdat er voor hen geen plaats is in de herberg. Op de achtste dag krijgt het Kind de naam Jezus. Die naam had de engel al genoemd, aan Maria en later ook aan Jozef. Tegen Jozef zei de engel erbij waarom: ‘want Hij zal Zijn volk zalig maken van hun zonden’ (Mattheüs 1:21). Zalig maken betekent hier: redden.",
      },
      {
        kop: "Zoals God beloofd had",
        t: "Lang daarvoor had de profeet Micha al gezegd dat er uit Bethlehem een Heerser zou komen (Micha 5:1). Zo gebeurt het: de Zoon van God wordt geboren in de stad van David.",
      },
    ],
    vragen: [
      {
        q: "Waarom ging Jozef naar Bethlehem?",
        a: ["Hij was uit het huis en geslacht van David", "Hij had daar werk gevonden", "Maria wilde daar wonen"],
        why: "Lukas 2:4",
      },
      {
        q: "Waarom lag het Kind in een kribbe?",
        a: ["Er was geen plaats in de herberg", "Het was er warmer", "Dat was zo de gewoonte"],
        why: "Lukas 2:7",
      },
      {
        q: "Waarom moest het Kind Jezus heten, volgens de engel?",
        a: ["Hij zal Zijn volk zalig maken van hun zonden", "Hij zal in de stad van David gaan wonen", "Hij zal de keizer verslaan"],
        why: "Mattheüs 1:21",
      },
      { q: "Welke profeet had al over Bethlehem gesproken?", a: ["Micha", "Jona", "Elia"], why: "Micha 5:1" },
    ],
  },
  84: {
    status: "concept",
    delen: [
      {
        kop: "Een engel in de nacht",
        stap: "jezus-1:nt-geboorte:6",
        t: "In de buurt van Bethlehem houden herders ’s nachts de wacht bij hun kudde. Opeens staat er een engel van de Heere bij hen, en de heerlijkheid van de Heere schijnt om hen heen. Ze worden heel bang. Maar de engel zegt: ‘Vreest niet, want, ziet, ik verkondig u grote blijdschap’. Vandaag is in de stad van David de Zaligmaker geboren: Christus, de Heere. Zaligmaker betekent: Redder.",
      },
      {
        kop: "Het teken en de engelen",
        t: "Het teken is een Kindje in doeken, liggend in een kribbe. Dan is er bij de engel een menigte van het hemelse leger. Ze prijzen God en zeggen: ‘Ere zij God in de hoogste hemelen, en vrede op aarde, in de mensen een welbehagen.’",
      },
      {
        kop: "Haastig naar Bethlehem",
        stap: "jezus-1:nt-geboorte:6",
        t: "De herders gaan haastig naar Bethlehem en vinden Maria, Jozef en het Kindje in de kribbe. Ze vertellen overal wat er over dit Kind gezegd is, en iedereen verwondert zich. Maria bewaart al deze woorden in haar hart. De herders gaan terug en prijzen God.",
      },
    ],
    vragen: [
      {
        q: "Wat was het teken voor de herders?",
        a: ["Een Kindje in doeken, in een kribbe", "Een ster boven het huis", "Een engel bij de stadspoort"],
        why: "Lukas 2:12",
      },
      {
        q: "Waarom gingen de herders naar Bethlehem?",
        a: ["Ze wilden zien wat de Heere hun verkondigd had", "Ze moesten zich laten inschrijven", "Ze zochten een verdwaald dier"],
        why: "Lukas 2:15",
      },
      {
        q: "Wie prezen God samen met de engel?",
        a: ["Een menigte van het hemelse leger", "De mensen uit Bethlehem", "Maria en Jozef"],
        why: "Lukas 2:13",
      },
      {
        q: "Wat deden de herders nadat ze het Kind gezien hadden?",
        a: ["Ze vertelden overal wat hun gezegd was", "Ze bleven bij de kribbe wonen", "Ze gingen naar de tempel"],
        why: "Lukas 2:17",
      },
    ],
  },
  85: {
    status: "concept",
    delen: [
      {
        kop: "Wijzen zoeken een Koning",
        stap: "jezus-1:nt-geboorte:8",
        t: "Wijzen uit het oosten komen in Jeruzalem en vragen: ‘Waar is de geboren Koning der Joden?’ Ze hebben Zijn ster gezien. Koning Herodes schrikt. De schriftgeleerden zeggen: in Bethlehem, want dat heeft de profeet geschreven. Herodes stuurt de wijzen erheen en zegt dat hij het Kind ook wil aanbidden.",
      },
      {
        kop: "Goud, wierook en mirre",
        t: "De ster gaat voor de wijzen uit tot boven de plaats waar het Kind is. In het huis vallen ze neer, aanbidden Hem en geven goud, wierook en mirre. In een droom waarschuwt God hen. Ze gaan niet terug naar Herodes, maar langs een andere weg naar huis.",
      },
      {
        kop: "Vluchten en terugkeren",
        stap: "jezus-1:nt-geboorte:9",
        t: "Een engel zegt Jozef in een droom te vluchten naar Egypte, want Herodes zoekt het Kind om Het te doden. Herodes laat in Bethlehem en omgeving alle kinderen van twee jaar en jonger doden. Na de dood van Herodes gaat Jozef terug, en hij gaat wonen in Nazareth in Galilea.",
      },
    ],
    vragen: [
      {
        q: "Hoe wisten de schriftgeleerden dat de Christus in Bethlehem geboren zou worden?",
        a: ["Een profeet had het geschreven", "De wijzen hadden het verteld", "Herodes had het bepaald"],
        why: "Mattheüs 2:5–6",
      },
      {
        q: "Waar vonden de wijzen het Kind?",
        a: ["In een huis, bij Maria", "In de tempel in Jeruzalem", "In het paleis van Herodes"],
        why: "Mattheüs 2:11",
      },
      {
        q: "Waarom gingen de wijzen niet terug naar Herodes?",
        a: ["God waarschuwde hen in een droom", "Ze waren de weg kwijtgeraakt", "Herodes was al gestorven"],
        why: "Mattheüs 2:12",
      },
      {
        q: "Waarom moest Jozef met het Kind vluchten?",
        a: ["Herodes zocht het Kind om Het te doden", "Er was honger in Bethlehem", "De keizer had het bevolen"],
        why: "Mattheüs 2:13",
      },
    ],
  },
  86: {
    status: "concept",
    delen: [
      {
        kop: "Elk jaar naar het Pascha",
        stap: "jezus-1:nt-geboorte:11",
        t: "Jozef en Maria wonen in Nazareth. Elk jaar reizen ze naar Jeruzalem voor het feest van het Pascha. Als de Heere Jezus twaalf jaar is, gaan ze weer. Na de feestdagen gaan ze terug naar huis. Maar het Kind Jezus blijft in Jeruzalem, en Zijn ouders weten het niet.",
      },
      {
        kop: "Drie dagen zoeken",
        t: "Ze denken dat Hij ergens in het reisgezelschap is: de groep mensen die samen reist. Na een dagreis zoeken ze Hem bij familie en bekenden. Hij is er niet. Daarom gaan ze terug naar Jeruzalem. Na drie dagen vinden ze Hem in de tempel. Hij zit midden tussen de leraars, luistert naar hen en stelt hun vragen. Iedereen is verbaasd over Zijn verstand en Zijn antwoorden.",
      },
      {
        kop: "In de dingen van Zijn Vader",
        t: "Maria zegt: ‘Zie, Uw vader en ik hebben U met angst gezocht.’ Hij antwoordt: ‘Wist gij niet, dat Ik moet zijn in de dingen Mijns Vaders?’ Met Zijn Vader bedoelt Hij God. Jozef en Maria begrijpen het niet. Hij gaat met hen mee naar Nazareth en is hun onderdanig: Hij gehoorzaamt hen. Maria bewaart al deze dingen in haar hart.",
      },
    ],
    vragen: [
      {
        q: "Waarom liepen Jozef en Maria eerst een dag door zonder Hem?",
        a: [
          "Ze dachten dat Hij in het reisgezelschap was",
          "Ze wisten dat Hij in de tempel was gebleven",
          "Hij had gezegd dat Hij later zou komen",
        ],
        why: "Lukas 2:43–44",
      },
      { q: "Na hoeveel dagen vonden ze Hem?", a: ["Na drie dagen", "Na één dag", "Na zeven dagen"], why: "Lukas 2:46" },
      {
        q: "Waarover waren alle mensen die Hem hoorden verbaasd?",
        a: ["Over Zijn verstand en antwoorden", "Over Zijn wonderen en tekenen", "Over Zijn kleding en afkomst"],
        why: "Lukas 2:47",
      },
      { q: "Wie bedoelde de Heere Jezus met ‘Mijns Vaders’?", a: ["God", "Jozef", "Koning David"], why: "Lukas 2:48–49" },
      {
        q: "Wat deed Maria met al deze dingen?",
        a: ["Ze bewaarde ze in haar hart", "Ze vertelde ze aan de leraars", "Ze schreef ze op een rol"],
        why: "Lukas 2:51",
      },
    ],
  },
  87: {
    status: "concept",
    delen: [
      {
        kop: "Een stem in de woestijn",
        stap: "jezus-1:nt-begin:0",
        t: "Johannes de Doper preekt in de woestijn van Judea: ‘Bekeert u; want het Koninkrijk der hemelen is nabij gekomen.’ Hij draagt kleding van kemelshaar en een leren gordel, en hij eet sprinkhanen en wilde honing. Uit Jeruzalem, Judea en de streek rond de Jordaan komen mensen naar hem toe. Ze belijden hun zonden en laten zich dopen in de Jordaan.",
      },
      {
        kop: "Iemand Die sterker is",
        stap: "jezus-1:nt-begin:1",
        t: "Johannes zegt: ‘Die na mij komt, is sterker dan ik’. Dan komt de Heere Jezus van Galilea naar de Jordaan om gedoopt te worden. Johannes weigert eerst: ‘Mij is nodig van U gedoopt te worden, en komt Gij tot mij?’ Maar de Heere Jezus zegt: ‘Laat nu af’. Dat betekent: houd Mij niet tegen. Zo hoort het, zegt Hij, om alle gerechtigheid te vervullen.",
      },
      {
        kop: "De hemelen gaan open",
        t: "Als de Heere Jezus gedoopt is, komt Hij meteen uit het water. De hemelen gaan open, en de Geest van God daalt als een duif op Hem neer. Een stem uit de hemel zegt: ‘Deze is Mijn Zoon, Mijn Geliefde, in Denwelken Ik Mijn welbehagen heb!’ Welbehagen betekent: vreugde en goedkeuring.",
      },
    ],
    vragen: [
      {
        q: "Wat at Johannes de Doper?",
        a: ["Sprinkhanen en wilde honing", "Brood en gebakken vis", "Manna en kwakkels"],
        why: "Mattheüs 3:4",
      },
      {
        q: "Wat zei Johannes over Hem Die na hem kwam?",
        a: ["Hij is sterker dan ik", "Hij is jonger dan ik", "Hij is mijn leerling"],
        why: "Mattheüs 3:11",
      },
      {
        q: "Waarom wilde Johannes de Heere Jezus eerst niet dopen?",
        a: [
          "Hij vond dat hij zelf door Hem gedoopt moest worden",
          "Hij moest eerst de Farizeeën nog dopen",
          "Hij vond de Jordaan te diep om te dopen",
        ],
        why: "Mattheüs 3:14",
      },
      {
        q: "Waar kwam de Heere Jezus vandaan toen Hij naar de Jordaan ging?",
        a: ["Uit Galilea", "Uit Egypte", "Uit Samaria"],
        why: "Mattheüs 3:13",
      },
      {
        q: "Wat gebeurde er toen de Heere Jezus uit het water kwam?",
        a: ["De hemelen werden geopend", "Het begon hard te regenen", "De Jordaan stond stil"],
        why: "Mattheüs 3:16",
      },
    ],
  },
  88: {
    status: "concept",
    delen: [
      {
        kop: "Veertig dagen zonder eten",
        stap: "jezus-1:nt-begin:2",
        t: "Na Zijn doop wordt de Heere Jezus door de Geest naar de woestijn geleid. Daar zal de duivel Hem verzoeken: proberen Hem tot zonde te brengen. Veertig dagen en nachten vast Hij: Hij eet niets. Dan heeft Hij honger. De duivel zegt: ‘Indiën Gij Gods Zoon zijt, zeg, dat deze stenen broden worden.’ Maar Hij antwoordt: ‘Er is geschreven: De mens zal bij brood alleen niet leven’.",
      },
      {
        kop: "Op de tinne van de tempel",
        t: "Dan neemt de duivel Hem mee naar Jeruzalem, de heilige stad. Hij zet Hem op de tinne van de tempel, een hoog punt van het gebouw. Hij zegt dat Hij naar beneden moet springen, en haalt zelf een Bijbeltekst aan: engelen zullen U op de handen nemen. De Heere Jezus zegt: ‘Gij zult den Heere, uw God, niet verzoeken.’",
      },
      {
        kop: "Ga weg, satan",
        t: "Op een zeer hoge berg toont de duivel Hem alle koninkrijken van de wereld. ‘Al deze dingen zal ik U geven, indien Gij, nedervallende, mij zult aanbidden.’ De Heere Jezus zegt: ‘Ga weg, satan’. Alleen God moet je aanbidden en dienen. Dan gaat de duivel weg, en engelen komen en dienen Hem.",
      },
    ],
    vragen: [
      {
        q: "Wat deed de Heere Jezus veertig dagen en veertig nachten?",
        a: ["Hij vastte", "Hij preekte", "Hij doopte"],
        why: "Mattheüs 4:2",
      },
      {
        q: "Wanneer kwam de duivel met de stenen?",
        a: ["Toen de Heere Jezus honger had", "Toen de Heere Jezus in de tempel leerde", "Toen de Heere Jezus in Nazareth was"],
        why: "Mattheüs 4:2–3",
      },
      {
        q: "Waarmee antwoordde de Heere Jezus de duivel steeds?",
        a: ["Met wat er in de Schrift geschreven staat", "Met een droom die Hij gehad had", "Met een teken uit de hemel"],
        why: "Mattheüs 4:4, 7, 10",
      },
      {
        q: "Wie haalde ook een Bijbeltekst aan, maar om te verleiden?",
        a: ["De duivel", "Johannes de Doper", "De engelen"],
        why: "Mattheüs 4:6",
      },
      {
        q: "Wat beloofde de duivel op de zeer hoge berg?",
        a: ["Alle koninkrijken van de wereld", "Brood voor veertig dagen", "Een plaats in de tempel"],
        why: "Mattheüs 4:8–9",
      },
    ],
  },
  89: {
    status: "concept",
    delen: [
      {
        kop: "Ziet, het Lam Gods",
        stap: "jezus-1:nt-begin:3",
        t: "Johannes de Doper doopt in Bethabara, aan de overkant van de Jordaan. Daar staat hij met twee van zijn discipelen, dat zijn leerlingen. Als hij de Heere Jezus ziet lopen, zegt hij: ‘Ziet, het Lam Gods!’ De twee gaan achter de Heere Jezus aan. ‘Komt en ziet!’ zegt Hij. Ze blijven die dag bij Hem.",
      },
      {
        kop: "Vertellen aan een ander",
        t: "Een van de twee is Andreas. Hij zoekt eerst zijn broer Simon op: ‘Wij hebben gevonden den Messias’. Messias betekent: Christus. De Heere Jezus zegt dat Simon Cefas genoemd zal worden, dat is Petrus. De volgende dag roept Hij Filippus uit Bethsaida. Filippus vertelt het aan Nathanaël. Die vraagt eerst: ‘Kan uit Nazareth iets goeds zijn?’",
      },
      {
        kop: "Vissers van mensen",
        stap: "jezus-1:nt-galilea:1",
        t: "Later, aan het meer van Galilea, ziet de Heere Jezus Simon en Andreas hun net uitwerpen. Hij zegt: ‘Volgt Mij na, en Ik zal maken, dat gij vissers der mensen zult worden.’ Meteen laten ze hun netten liggen. Ook Jakobus en Johannes, de zonen van Zebedeüs, laten hun vader en de knechten in het schip achter en volgen Hem.",
      },
    ],
    vragen: [
      {
        q: "Wat deed Andreas eerst nadat hij bij de Heere Jezus was geweest?",
        a: ["Hij zocht zijn broer Simon op", "Hij ging terug naar Johannes", "Hij ging vissen op het meer"],
        why: "Johannes 1:42",
      },
      { q: "Uit welke stad kwam Filippus?", a: ["Uit Bethsaida", "Uit Nazareth", "Uit Jeruzalem"], why: "Johannes 1:45" },
      { q: "Wie vertelde het aan Nathanaël?", a: ["Filippus", "Andreas", "Simon"], why: "Johannes 1:46" },
      {
        q: "Waarom twijfelde Nathanaël eerst?",
        a: [
          "Hij dacht dat uit Nazareth niets goeds kon komen",
          "Hij had nooit van Mozes en de profeten gehoord",
          "Hij vond Filippus te jong om dat te weten",
        ],
        why: "Johannes 1:47",
      },
      {
        q: "Wat deden Jakobus en Johannes toen de Heere Jezus hen zag?",
        a: ["Ze herstelden hun netten in het schip", "Ze verkochten vis op de markt", "Ze trokken hun schip aan land"],
        why: "Markus 1:19",
      },
    ],
  },
  90: {
    status: "concept",
    delen: [
      {
        kop: "Geen wijn meer",
        stap: "jezus-1:nt-begin:4",
        t: "Op de derde dag is er een bruiloft in Kana in Galilea. Maria is er, en de Heere Jezus en Zijn discipelen zijn ook uitgenodigd. Dan is de wijn op. Maria zegt tegen Hem: ‘Zij hebben geen wijn.’ Hij antwoordt: ‘Vrouw, wat heb Ik met u te doen? Mijn ure is nog niet gekomen.’ Maria zegt tegen de dienaren: ‘Zo wat Hij ulieden zal zeggen, doet dat.’",
      },
      {
        kop: "Zes stenen watervaten",
        t: "Er staan zes stenen watervaten, voor de reiniging van de Joden: daarmee wasten zij zich volgens hun gebruik. De Heere Jezus zegt: ‘Vult de watervaten met water.’ De dienaren vullen ze tot boven toe. Dan zegt Hij: ‘Schept nu, en draagt het tot den hofmeester’. De hofmeester is de man die het feest leidt.",
      },
      {
        kop: "Het eerste teken",
        t: "De hofmeester proeft het water dat wijn geworden is. Hij weet niet waar de wijn vandaan komt, maar de dienaren wel. Hij zegt tegen de bruidegom: ‘gij hebt den goeden wijn tot nu toe bewaard.’ Dit is het eerste teken van de Heere Jezus. Een teken wijst naar Wie Hij is. Zo openbaart Hij Zijn heerlijkheid, en Zijn discipelen geloven in Hem.",
      },
    ],
    vragen: [
      { q: "Wanneer was de bruiloft in Kana?", a: ["Op de derde dag", "Op de achtste dag", "Op de veertigste dag"], why: "Johannes 2:1" },
      {
        q: "Wat zei Maria tegen de dienaren?",
        a: ["Doe wat Hij jullie zegt", "Haal nieuwe wijn op de markt", "Vraag het aan de bruidegom"],
        why: "Johannes 2:5",
      },
      {
        q: "Waarvoor waren de stenen watervaten bedoeld?",
        a: ["Voor de reiniging van de Joden", "Om wijn in te bewaren", "Om vis in te zouten"],
        why: "Johannes 2:6",
      },
      {
        q: "Wat vond de hofmeester bijzonder?",
        a: ["Dat de goede wijn tot nu toe bewaard was", "Dat de wijn uit Jeruzalem kwam", "Dat de wijn in stenen vaten zat"],
        why: "Johannes 2:10",
      },
      {
        q: "Wat openbaarde de Heere Jezus met dit teken?",
        a: ["Zijn heerlijkheid", "Zijn koninkrijk op aarde", "Zijn wijsheid als leraar"],
        why: "Johannes 2:11",
      },
    ],
  },
  91: {
    status: "concept",
    delen: [
      {
        kop: "Een sabbat in Kapernaüm",
        stap: "jezus-1:nt-galilea:2",
        t: "Op de sabbat leert de Heere Jezus in de synagoge van Kapernaüm. Hij leert met macht, niet zoals de schriftgeleerden. Een man met een onreine geest roept: ‘Ik ken U, wie Gij zijt, namelijk de Heilige Gods.’ De Heere Jezus zegt: ‘Zwijg stil, en ga uit van hem.’ De geest gaat uit de man weg. Iedereen is verbaasd.",
      },
      {
        kop: "Koorts en melaatsheid",
        t: "Simons schoonmoeder ligt met koorts. De Heere Jezus pakt haar hand en richt haar op, en de koorts verlaat haar. Als de zon ondergaat, geneest Hij velen. Later smeekt een melaatse: ‘Indiën Gij wilt, Gij kunt mij reinigen.’ Hij raakt hem aan, en de man wordt rein.",
      },
      {
        kop: "Door het dak",
        stap: "jezus-1:nt-galilea:3",
        t: "Na een paar dagen is het huis zo vol, dat vier mannen met een verlamde niet bij Hem kunnen komen. Ze maken een opening in het dak en laten het bed zakken. De Heere Jezus zegt: ‘Zoon, uw zonden zijn u vergeven.’ Sommige schriftgeleerden denken: alleen God kan zonden vergeven. Om te laten zien dat Hij macht heeft om zonden te vergeven, zegt Hij tegen de man dat hij moet opstaan. Hij staat op, en allen verheerlijken God.",
      },
    ],
    vragen: [
      {
        q: "Wat riep de man met de onreine geest?",
        a: ["Ik ken U, wie Gij zijt", "Help mij, Meester", "Waar woont Gij?"],
        why: "Markus 1:24",
      },
      {
        q: "Wanneer brachten ze veel zieken bij Hem?",
        a: ["Toen de zon onderging", "Midden op de dag", "Vroeg in de morgen"],
        why: "Markus 1:32",
      },
      {
        q: "Waarom lieten de mannen de verlamde door het dak zakken?",
        a: ["Ze konden door de menigte niet bij Hem komen", "De deur van het huis was op slot", "De verlamde wilde niet gezien worden"],
        why: "Markus 2:4",
      },
      {
        q: "Waarom vonden sommige schriftgeleerden het verkeerd dat Hij zonden vergaf?",
        a: ["Ze dachten: alleen God kan zonden vergeven", "Ze wilden de man zelf genezen", "Ze dachten dat de man niet ziek was"],
        why: "Markus 2:6–7",
      },
      {
        q: "Hoe liet de Heere Jezus zien dat Hij zonden mag vergeven?",
        a: ["De verlamde stond op en ging weg", "Er kwam vuur uit de hemel", "Het dak was ineens weer heel"],
        why: "Markus 2:10–12",
      },
    ],
  },
  92: {
    status: "concept",
    delen: [
      {
        kop: "Zalig zijn",
        stap: "jezus-1:nt-galilea:4",
        t: "Als de Heere Jezus de menigte ziet, klimt Hij een berg op en gaat zitten. Zijn discipelen komen bij Hem, en Hij leert hen. Hij begint met wie zalig zijn: ‘Zalig zijn de armen van geest; want hunner is het Koninkrijk der hemelen.’ Hij noemt ook de zachtmoedigen, de barmhartigen, de reinen van hart en de vreedzamen.",
      },
      {
        kop: "Wat de Vader in het verborgen ziet",
        t: "Geven aan armen, bidden en vasten moet je niet doen om door mensen gezien te worden. De Vader ziet in het verborgen. Hij leert hen bidden: ‘Onze Vader, Die in de hemelen zijt!’ Ze hoeven niet bezorgd te zijn: de Vader voedt de vogels en kleedt de leliën. ‘Zoekt eerst het Koninkrijk Gods en Zijn gerechtigheid’.",
      },
      {
        kop: "Twee bouwers",
        t: "Aan het eind vertelt Hij een vergelijking. Wie Zijn woorden hoort en doet, is als een voorzichtig (wijs) man die op een steenrots bouwt. Dat huis blijft staan in regen en wind. Wie ze hoort en niet doet, is als een dwaze man die op het zand bouwt. Dat huis valt, ‘en zijn val was groot.’ De mensen zijn verbaasd, want Hij leert met macht.",
      },
    ],
    vragen: [
      {
        q: "Wie zijn volgens de Heere Jezus zalig?",
        a: ["De reinen van hart", "De rijken en machtigen", "De sterken en snellen"],
        why: "Mattheüs 5:8",
      },
      {
        q: "Waarom hoef je niet te bidden om door mensen gezien te worden?",
        a: ["De Vader ziet in het verborgen", "God hoort alleen gebeden in de tempel", "Bidden mag alleen op de sabbat"],
        why: "Mattheüs 6:5–6",
      },
      {
        q: "Waarmee laat de Heere Jezus zien dat je niet bezorgd hoeft te zijn?",
        a: ["Met de vogels en de leliën", "Met de zon en de maan", "Met de vissen in het meer"],
        why: "Mattheüs 6:26–30",
      },
      {
        q: "Wat is het verschil tussen de twee bouwers?",
        a: ["De een doet wat hij hoort, de ander niet", "De een heeft meer geld dan de ander", "De een bouwt sneller dan de ander"],
        why: "Mattheüs 7:24–26",
      },
      {
        q: "Waarom waren de mensen verbaasd?",
        a: ["Hij leerde hen als macht hebbende", "Hij sprak in een vreemde taal", "Hij las voor uit een boekrol"],
        why: "Mattheüs 7:28–29",
      },
    ],
  },
  93: {
    status: "concept",
    delen: [
      {
        kop: "Een bezoek in de nacht",
        stap: "jezus-1:nt-begin:5",
        t: "Bij het Pascha is de Heere Jezus in Jeruzalem. Daar komt Nicodemus ’s nachts bij Hem. Hij is een Farizeeër en een overste, dat is een leider, van de Joden. Hij zegt: ‘Rabbi, wij weten, dat Gij zijt een Leraar van God gekomen’. Rabbi betekent meester. Niemand kan zulke tekenen doen, zegt hij, als God niet met hem is.",
      },
      {
        kop: "Opnieuw geboren",
        t: "De Heere Jezus antwoordt: ‘Tenzij dat iemand wederom geboren worde, hij kan het Koninkrijk Gods niet zien.’ Nicodemus vraagt: ‘Hoe kan een mens geboren worden, nu oud zijnde?’ De Heere Jezus zegt dat het gaat om geboren worden uit water en Geest. Het is als met de wind: je hoort hem, maar je weet niet waar hij vandaan komt en waar hij heen gaat.",
      },
      {
        kop: "Zo lief heeft God de wereld",
        t: "Hij herinnert aan Mozes, die in de woestijn een slang omhoog hief. Wie gebeten was en ernaar keek, bleef leven. Zo moet de Zoon des mensen verhoogd worden. ‘Want alzo lief heeft God de wereld gehad, dat Hij Zijn eniggeboren Zoon gegeven heeft, opdat een iegelijk die in Hem gelooft, niet verderve, maar het eeuwige leven hebbe.’",
      },
    ],
    vragen: [
      {
        q: "Waarom dacht Nicodemus dat de Heere Jezus van God gekomen was?",
        a: ["Door de tekenen die Hij deed", "Omdat de hogepriester het zei", "Omdat Hij in de tempel woonde"],
        why: "Johannes 3:2",
      },
      {
        q: "Wat begreep Nicodemus niet?",
        a: ["Hoe een oud mens opnieuw geboren kan worden", "Waarom hij naar Jeruzalem moest komen", "Wie de profeet Mozes was"],
        why: "Johannes 3:4",
      },
      {
        q: "Wat gebeurde er met wie gebeten was en naar de koperen slang keek?",
        a: ["Hij bleef leven", "Hij werd blind", "Hij moest het land uit"],
        why: "Numeri 21:8–9",
      },
      {
        q: "Waarom heeft God Zijn Zoon gegeven?",
        a: ["Omdat Hij de wereld zo liefhad", "Omdat de mensen erom vroegen", "Omdat Nicodemus het vroeg"],
        why: "Johannes 3:16",
      },
    ],
  },
  94: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Naar de overkant",
        stap: "jezus-1:nt-galilea:8",
        t: "Die dag heeft de Heere Jezus bij het meer veel gelijkenissen verteld. Als het avond is, zegt Hij: ‘Laat ons overvaren aan de andere zijde.’ Dat betekent: laten we naar de overkant varen. De discipelen nemen Hem mee in het schip. Er varen nog andere scheepjes mee.",
      },
      {
        kop: "Storm op het meer",
        t: "Er komt een grote storm. De golven slaan over in het schip, zodat het vol water loopt. De Heere Jezus slaapt achter in het schip op een kussen. De discipelen maken Hem wakker: ‘Meester, bekommert het U niet, dat wij vergaan?’ Ze bedoelen: kan het U niet schelen dat we omkomen?",
      },
      {
        kop: "Wind en zee gehoorzamen Hem",
        t: "Hij staat op, bestraft de wind en zegt tegen de zee: ‘Zwijg, wees stil!’ De wind gaat liggen en het wordt helemaal stil. Dan vraagt Hij: ‘Wat zijt gij zo vreesachtig? Hebt gij geen geloof?’ De discipelen worden heel erg bang. Ze vragen elkaar: ‘Wie is toch Deze, dat ook de wind en de zee Hem gehoorzaam zijn?’",
      },
    ],
    vragen: [
      {
        q: "Wanneer gingen ze naar de overkant varen?",
        a: ["’s Avonds, op de dag van de gelijkenissen", "’s Morgens vroeg, na het ontbijt", "Midden in de nacht, na de sabbat"],
        why: "Markus 4:35",
      },
      {
        q: "Waarom maakten de discipelen de Heere Jezus wakker?",
        a: ["Ze waren bang dat ze zouden vergaan", "Ze hadden honger gekregen", "Ze waren de weg kwijtgeraakt"],
        why: "Markus 4:38",
      },
      {
        q: "Wat deed de Heere Jezus toen Hij wakker was?",
        a: ["Hij bestrafte de wind en sprak tot de zee", "Hij schepte het water uit het schip", "Hij stuurde het schip terug naar de kant"],
        why: "Markus 4:39",
      },
      {
        q: "Wat vroegen de discipelen elkaar na de storm?",
        a: ["Wie is toch Deze?", "Waar zijn de andere scheepjes?", "Wanneer zijn we aan land?"],
        why: "Markus 4:41",
      },
    ],
  },
  95: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een man uit de graven",
        stap: "jezus-1:nt-galilea:9",
        t: "Aan de overkant van het meer, in het land van de Gadarenen, komt een man uit de graven op de Heere Jezus af. Hij heeft een onreine geest: hij is bezeten. Niemand kan hem binden, zelfs niet met ketenen. Dag en nacht roept hij en slaat hij zichzelf met stenen.",
      },
      {
        kop: "Mijn naam is Legio",
        t: "Hij valt voor de Heere Jezus neer en roept: ‘Wat heb ik met U te doen, Jezus, Gij Zone Gods, des Allerhoogsten?’ Zo noemt hij Hem de Zoon van de allerhoogste God. De Heere Jezus vraagt zijn naam. ‘Mijn naam is Legio; want wij zijn velen.’ Een legioen is een grote afdeling van een leger. De boze geesten vragen of ze in een kudde varkens mogen gaan. Hij laat het toe, en ongeveer tweeduizend varkens storten zich in de zee.",
      },
      {
        kop: "Vertel het thuis",
        t: "De mensen komen kijken. Ze zien de man zitten, gekleed en bij zijn verstand, en worden bang. Ze vragen de Heere Jezus om weg te gaan. De man wil met Hem mee. Maar Hij zegt: ‘Ga heen naar uw huis tot de uwen, en boodschap hun, wat grote dingen u de Heere gedaan heeft’. Dat vertelt de man in heel Dekapolis.",
      },
    ],
    vragen: [
      {
        q: "Waarom kon niemand de man binden?",
        a: ["Hij trok zelfs ketenen in stukken", "Hij rende altijd te snel weg", "Hij verstopte zich in een grot"],
        why: "Markus 5:3–4",
      },
      {
        q: "Hoe noemde de man de Heere Jezus?",
        a: ["De Zoon van de allerhoogste God", "Een goede Meester uit Galilea", "Een profeet uit Nazareth"],
        why: "Markus 5:7",
      },
      {
        q: "Wat gebeurde er met de kudde varkens?",
        a: ["Ze stortten in de zee en verdronken", "Ze renden weg, de bergen in", "Ze werden aan de man gegeven"],
        why: "Markus 5:13",
      },
      {
        q: "Wat moest de man doen, in plaats van met de Heere Jezus mee te gaan?",
        a: ["Thuis vertellen wat de Heere gedaan had", "In het schip op de Heere Jezus wachten", "In de graven blijven wonen"],
        why: "Markus 5:18–19",
      },
    ],
  },
  96: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een zieke knecht",
        stap: "jezus-1:nt-galilea:5",
        t: "De Heere Jezus komt in Kapernaüm. Daar woont een hoofdman over honderd: een officier met soldaten onder zich. Zijn knecht, die hem heel dierbaar is, ligt op sterven. De hoofdman stuurt oudsten van de Joden naar de Heere Jezus. Zij vragen dringend of Hij wil komen. ‘Hij is waardig’, zeggen ze. Dat betekent: hij verdient het. Want hij heeft hun volk lief en heeft de synagoge gebouwd.",
      },
      {
        kop: "Zeg het met een woord",
        t: "De Heere Jezus gaat met hen mee. Dicht bij het huis komen vrienden van de hoofdman. Hij laat zeggen: ‘ik ben niet waardig, dat Gij onder mijn dak zoudt inkomen’. Hij weet wat gezag is. Als hij tegen een soldaat zegt dat hij moet gaan, dan gaat die. Daarom vraagt hij: ‘zeg het met een woord, en mijn knecht zal genezen worden.’",
      },
      {
        kop: "Zo’n groot geloof",
        t: "De Heere Jezus verwondert Zich. Hij keert Zich om naar de mensen die Hem volgen en zegt: ‘Ik heb zo groot een geloof zelfs in Israël niet gevonden.’ Als de vrienden terugkomen in het huis, is de knecht gezond.",
      },
    ],
    vragen: [
      {
        q: "Waarom vonden de oudsten dat de Heere Jezus de hoofdman moest helpen?",
        a: ["Hij had hun volk lief en de synagoge gebouwd", "Hij was de rijkste man van de stad", "Hij was familie van de hogepriester"],
        why: "Lukas 7:4–5",
      },
      {
        q: "Waarom hoefde de Heere Jezus volgens de hoofdman niet in zijn huis te komen?",
        a: ["Hij vond zichzelf niet waardig", "Zijn huis was te klein", "De knecht was al beter"],
        why: "Lukas 7:6–7",
      },
      {
        q: "Wat wist de hoofdman over gezag?",
        a: [
          "Als hij een bevel gaf, deden zijn soldaten het",
          "Alleen de keizer mocht bevelen geven",
          "Zijn soldaten luisterden nooit naar hem",
        ],
        why: "Lukas 7:8",
      },
      {
        q: "Waar was de Heere Jezus toen de vrienden kwamen?",
        a: ["Niet ver van het huis", "Nog in Jeruzalem", "Al binnen in het huis"],
        why: "Lukas 7:6",
      },
    ],
  },
  97: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een vrouw bij de maaltijd",
        t: "Een Farizeeër vraagt de Heere Jezus om bij hem te eten. Farizeeërs letten nauw op de wet. Een vrouw uit de stad, een zondares, hoort dat Hij daar is. Ze komt met een albasten fles met zalf. Huilend staat ze bij Zijn voeten en maakt ze nat met haar tranen. Ze droogt ze af met haar haren, kust ze en zalft ze.",
      },
      {
        kop: "Twee schuldenaars",
        t: "De Farizeeër, Simon, denkt: als Hij een profeet was, wist Hij dat zij een zondares is. De Heere Jezus vertelt over twee mensen met een schuld. De een moet vijfhonderd penningen betalen, de ander vijftig. Ze kunnen niet betalen. De schuldheer scheldt het allebei kwijt. Hij vraagt: wie zal hem nu het meest liefhebben? Simon zegt: hij die het meeste kwijtgescholden is.",
      },
      {
        kop: "Haar zonden zijn vergeven",
        t: "Dan wijst Hij op de vrouw. Simon gaf Hem geen water voor Zijn voeten, geen kus en geen olie. Zij deed veel meer. ‘Haar zonden zijn haar vergeven, die vele waren; want zij heeft veel liefgehad.’ De gasten denken: ‘Wie is Deze, Die ook de zonden vergeeft?’ Tegen haar zegt Hij: ‘Uw geloof heeft u behouden; ga heen in vrede.’",
      },
    ],
    vragen: [
      {
        q: "Wat had de vrouw bij zich?",
        a: ["Een albasten fles met zalf", "Een mand met verse broden", "Een kruik met koel water"],
        why: "Lukas 7:37",
      },
      {
        q: "Wat dacht Simon toen hij de vrouw zag?",
        a: ["Als Hij een profeet was, wist Hij wie zij is", "Wat heeft deze vrouw een mooie zalf", "Deze vrouw hoort bij mijn familie"],
        why: "Lukas 7:39",
      },
      {
        q: "Wie heeft volgens Simon de schuldheer het meest lief?",
        a: ["Hij die het meest kwijtgescholden is", "Hij die het minst schuldig was", "Allebei precies even veel"],
        why: "Lukas 7:43",
      },
      {
        q: "Wat vroegen de andere gasten zich af?",
        a: ["Wie is Deze, Die ook de zonden vergeeft?", "Waarom is er geen wijn bij de maaltijd?", "Hoe heet de vrouw met de zalf?"],
        why: "Lukas 7:49",
      },
    ],
  },
  98: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Jaïrus vraagt om hulp",
        stap: "jezus-1:nt-galilea:10",
        t: "Als de Heere Jezus terugkomt over het meer, wacht een grote menigte op Hem. Jaïrus, een overste van de synagoge, valt aan Zijn voeten. Een overste van de synagoge zorgt voor de samenkomsten in de synagoge. Jaïrus smeekt de Heere Jezus om mee te komen, want zijn enige dochter van ongeveer twaalf jaar ligt op sterven.",
      },
      {
        kop: "Een vrouw raakt Hem aan",
        t: "Onderweg verdringen de mensen Hem. Een vrouw die al twaalf jaar ziek is, raakt van achteren de zoom van Zijn kleed aan. Meteen is ze genezen. ‘Wie is het, die Mij heeft aangeraakt?’ vraagt de Heere Jezus. Bevend vertelt de vrouw alles. Hij zegt: ‘Dochter, wees welgemoed, uw geloof heeft u behouden; ga heen in vrede.’",
      },
      {
        kop: "Kind, sta op",
        t: "Dan komt het bericht: ‘Uw dochter is gestorven’. Maar de Heere Jezus zegt: ‘Vrees niet, geloof alleenlijk, en zij zal behouden worden.’ In huis huilt iedereen. Als Hij zegt dat ze slaapt, lachen ze Hem uit. Hij pakt haar hand en roept: ‘Kind, sta op!’ Haar geest keert terug, en ze staat meteen op.",
      },
    ],
    vragen: [
      {
        q: "Waarom vroeg Jaïrus de Heere Jezus om te komen?",
        a: ["Zijn enige dochter lag op sterven", "Hij wilde Hem uitnodigen om te eten", "Zijn knecht was erg ziek geworden"],
        why: "Lukas 8:41–42",
      },
      { q: "Wat raakte de vrouw aan?", a: ["De zoom van Zijn kleed", "De hand van Petrus", "Zijn voeten"], why: "Lukas 8:44" },
      {
        q: "Wat zei de Heere Jezus toen het bericht kwam dat het meisje gestorven was?",
        a: ["Vrees niet, geloof alleenlijk", "Dan is het nu te laat", "Ik kom morgen naar het huis"],
        why: "Lukas 8:50",
      },
      {
        q: "Waarom lachten de mensen in het huis Hem uit?",
        a: ["Ze wisten dat het meisje gestorven was", "Hij zei dat ze een feest moesten geven", "Hij kwam zonder Zijn discipelen"],
        why: "Lukas 8:52–53",
      },
    ],
  },
  99: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een zaaier gaat zaaien",
        stap: "jezus-1:nt-galilea:7",
        t: "De Heere Jezus zit bij het meer van Galilea. Er komen zoveel mensen dat Hij in een schip gaat zitten, terwijl de menigte op de oever staat. Hij vertelt hun veel door gelijkenissen: verhalen uit het gewone leven waarmee Hij iets zegt over het Koninkrijk der hemelen. ‘Ziet, een zaaier ging uit om te zaaien.’",
      },
      {
        kop: "Vier soorten grond",
        t: "Een deel van het zaad valt bij de weg, en de vogels eten het op. Een deel valt op steenachtige plaatsen. Het komt snel op, maar verdort in de zon, omdat het geen wortel heeft. Een deel valt tussen de doornen en wordt verstikt. En een deel valt in de goede aarde en geeft vrucht: honderd, zestig of dertig keer zoveel.",
      },
      {
        kop: "De uitleg",
        t: "Later legt Hij het uit aan Zijn discipelen. Het zaad is het Woord van het Koninkrijk. Bij de weg: iemand hoort het, maar verstaat het niet, en de boze rukt het weg. Op de stenen: iemand is eerst blij, maar haakt af als het moeilijk wordt. Tussen de doornen: zorgen en rijkdom verstikken het Woord. De goede aarde is wie het Woord hoort en verstaat, en vrucht draagt.",
      },
    ],
    vragen: [
      {
        q: "Waarom verdorde het zaad op de steenachtige plaatsen?",
        a: ["Het had geen wortel", "De vogels aten het op", "Het kreeg te veel water"],
        why: "Mattheüs 13:5–6",
      },
      {
        q: "Wat gebeurde er met het zaad tussen de doornen?",
        a: ["De doornen verstikten het", "Het groeide het hoogst van alles", "De zaaier raapte het weer op"],
        why: "Mattheüs 13:7",
      },
      {
        q: "Wat is volgens de uitleg het zaad?",
        a: ["Het Woord van het Koninkrijk", "Het geld van de rijke mensen", "Het brood voor de arme mensen"],
        why: "Mattheüs 13:19",
      },
      {
        q: "Wat verstikt volgens de uitleg het Woord bij de doornen?",
        a: ["De zorgen en de rijkdom", "De vogels en de zon", "De stenen en de wind"],
        why: "Mattheüs 13:22",
      },
    ],
  },
  100: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Herodes hoort over de Heere Jezus",
        t: "Koning Herodes hoort over de wonderen die de Heere Jezus doet. Sommigen zeggen: Hij is Elias. Anderen zeggen: Hij is een profeet. Maar Herodes zegt: ‘Deze is Johannes, dien ik onthoofd heb; die is van de doden opgewekt.’ Markus vertelt dan hoe dat kwam.",
      },
      {
        kop: "Johannes in de gevangenis",
        stap: "jezus-2:nt-brood-en-berg:0",
        t: "Herodes was getrouwd met Herodias, de vrouw van zijn broer Filippus. Johannes zei tegen hem: ‘Het is u niet geoorloofd de huisvrouw uws broeders te hebben.’ Dat betekent: het mag niet volgens Gods wet. Daarom zette Herodes hem gevangen. Herodias wilde Johannes doden, maar Herodes wist dat hij een rechtvaardig en heilig man was.",
      },
      {
        kop: "Een eed op het feest",
        t: "Op zijn verjaardag geeft Herodes een maaltijd. De dochter van Herodias danst, en de koning zweert haar te geven wat ze vraagt, tot de helft van zijn koninkrijk. Haar moeder zegt dat ze het hoofd van Johannes de Doper moet vragen. Ze vraagt het de koning. De koning wordt zeer bedroefd, maar vanwege zijn eden en zijn gasten laat hij Johannes onthoofden. De discipelen van Johannes leggen hem in een graf.",
      },
    ],
    vragen: [
      {
        q: "Wie dachten sommige mensen dat de Heere Jezus was?",
        a: ["Elias of een profeet", "Mozes of Abraham", "Een zoon van Herodes"],
        why: "Markus 6:15",
      },
      {
        q: "Waarom liet Herodes Johannes gevangennemen?",
        a: [
          "Johannes zei dat zijn huwelijk met Herodias niet mocht",
          "Johannes had geld uit de tempel gestolen",
          "Johannes wilde zelf koning worden",
        ],
        why: "Markus 6:17–18",
      },
      {
        q: "Wie zei tegen het meisje wat ze moest vragen?",
        a: ["Haar moeder Herodias", "Koning Herodes", "Een van de gasten"],
        why: "Markus 6:24",
      },
      {
        q: "Wat deden de discipelen van Johannes?",
        a: ["Ze legden zijn lichaam in een graf", "Ze vluchtten naar Egypte", "Ze gingen naar de koning toe"],
        why: "Markus 6:29",
      },
    ],
  },
  101: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een grote menigte",
        stap: "jezus-2:nt-brood-en-berg:1",
        t: "De Heere Jezus gaat over de zee van Galilea, die ook de zee van Tiberias heet. Een grote menigte volgt Hem, omdat ze de tekenen gezien hebben: de wonderen die Hij bij de zieken deed. Het is kort voor het Pascha, het feest van de Joden. Hij gaat met Zijn discipelen op een berg zitten.",
      },
      {
        kop: "Vijf broden en twee visjes",
        t: "Hij vraagt Filippus: ‘Van waar zullen wij broden kopen, opdat deze eten mogen?’ Hij wil Filippus op de proef stellen, want Hij weet Zelf al wat Hij gaat doen. Filippus rekent: zelfs voor tweehonderd penningen brood is het niet genoeg. Andreas wijst op een jongen met vijf gerstebroden en twee visjes, ‘maar wat zijn deze onder zo velen?’",
      },
      {
        kop: "Twaalf korven over",
        t: "Ongeveer vijfduizend mannen gaan zitten in het gras. De Heere Jezus dankt en laat brood en vis uitdelen, zoveel als ze willen. Daarna worden de brokken verzameld, ‘opdat er niets verloren ga’. Ze vullen twaalf korven. De mensen zeggen: ‘Deze is waarlijk de Profeet, Die in de wereld komen zou.’ Ze willen Hem met geweld koning maken, maar Hij gaat alleen de berg op.",
      },
    ],
    vragen: [
      {
        q: "Waarom stelde de Heere Jezus Filippus de vraag over brood?",
        a: ["Om hem op de proef te stellen", "Omdat Hij zelf niet wist wat te doen", "Omdat Filippus het geld bewaarde"],
        why: "Johannes 6:5–6",
      },
      { q: "Wie wees op de jongen met de broden?", a: ["Andreas", "Petrus", "Filippus"], why: "Johannes 6:8–9" },
      { q: "Hoeveel korven met brokken bleven er over?", a: ["Twaalf", "Vijf", "Zeven"], why: "Johannes 6:13" },
      {
        q: "Wat zeiden de mensen na het teken?",
        a: ["Deze is waarlijk de Profeet", "Deze is Johannes de Doper", "Deze is een vriend van Herodes"],
        why: "Johannes 6:14",
      },
    ],
  },
  102: {
    status: "concept",
    delen: [
      {
        kop: "Wachten bij het badwater",
        stap: "jezus-2:nt-feesten-jeruzalem:0",
        t: "Voor een feest van de Joden gaat de Heere Jezus naar Jeruzalem. Bij de Schaapspoort is een badwater, een bad met water, dat Bethesda heet. Het heeft vijf zalen. Daar liggen veel zieken, blinden en kreupelen. Ze wachten tot het water bewogen wordt. Want wie daarna als eerste in het water komt, wordt gezond.",
      },
      {
        kop: "Sta op en wandel",
        t: "Er ligt een man die al achtendertig jaar ziek is. De Heere Jezus vraagt: ‘Wilt gij gezond worden?’ De man zegt dat hij niemand heeft die hem in het water helpt. Dan zegt de Heere Jezus: ‘Sta op, neem uw beddeken op, en wandel.’ Meteen is de man gezond. Hij pakt zijn beddeken (zijn matje) op en loopt.",
      },
      {
        kop: "Genezen op de sabbat",
        stap: "jezus-2:nt-feesten-jeruzalem:1",
        t: "Het is sabbat, de rustdag. De Joden zeggen dat de man zijn bed niet mag dragen. Later vindt de Heere Jezus hem in de tempel en zegt: ‘zondig niet meer’. Dan vertelt de man aan de Joden wie hem genezen heeft. Zij willen de Heere Jezus doden, omdat Hij dit op de sabbat doet en God Zijn eigen Vader noemt.",
      },
    ],
    vragen: [
      {
        q: "Waarop wachten de zieken bij Bethesda?",
        a: ["Tot het water bewogen wordt", "Tot de priester bij hen komt", "Tot het feest voorbij is"],
        why: "Johannes 5:3–4",
      },
      {
        q: "Waarom komt de man zelf niet in het water?",
        a: ["Hij heeft niemand die hem helpt", "Hij is bang voor het diepe water", "Het water is hem te koud"],
        why: "Johannes 5:7",
      },
      {
        q: "Waarom mag de man volgens de Joden zijn bed niet dragen?",
        a: ["Het is sabbat", "Het bed is niet van hem", "Hij is nog te zwak"],
        why: "Johannes 5:10",
      },
      {
        q: "Wat doet de man nadat de Heere Jezus hem in de tempel gevonden heeft?",
        a: ["Hij vertelt de Joden wie hem genezen heeft", "Hij gaat terug naar het badwater", "Hij wordt een discipel van de Heere Jezus"],
        why: "Johannes 5:14–15",
      },
    ],
  },
  103: {
    status: "concept",
    delen: [
      {
        kop: "Blind vanaf de geboorte",
        t: "De Heere Jezus ziet een man die blind geboren is. Zijn discipelen vragen of hij zelf gezondigd heeft of zijn ouders. De Heere Jezus antwoordt: geen van beiden. Het is gebeurd zodat Gods werken in hem zichtbaar worden. ‘Zolang Ik in de wereld ben, zo ben Ik het Licht der wereld.’",
      },
      {
        kop: "Wassen in Siloam",
        stap: "jezus-2:nt-feesten-jeruzalem:2",
        t: "Dan spuugt Hij op de grond en maakt slijk (modder). Dat strijkt Hij op de ogen van de blinde. Hij zegt: ‘Ga heen, was u in het badwater Siloam.’ De man gaat, wast zich en komt terug. Hij kan zien!",
      },
      {
        kop: "Eén ding weet ik",
        stap: "jezus-2:nt-feesten-jeruzalem:3",
        t: "Het is sabbat. De Farizeeën ondervragen de man en ook zijn ouders. De ouders zijn bang om uit de synagoge gezet te worden. De man zegt: ‘een ding weet ik, dat ik blind was, en nu zie.’ Ten slotte werpen ze hem uit. De Heere Jezus vindt hem en vraagt: ‘Gelooft gij in den Zoon van God?’ De man zegt: ‘Ik geloof, Heere!’ En hij aanbidt Hem.",
      },
    ],
    vragen: [
      {
        q: "Wat vroegen de discipelen toen ze de blinde man zagen?",
        a: ["Wie er gezondigd had, hij of zijn ouders", "Of de Heere Jezus hem wilde genezen", "Waarom hij bij de weg zat te bedelen"],
        why: "Johannes 9:2",
      },
      {
        q: "Waarom zeiden de ouders: ‘Hij heeft zijn ouderdom, vraagt hemzelven’?",
        a: ["Ze waren bang voor de Joden", "Ze wisten niet dat hij blind was geweest", "Ze waren boos op hun zoon"],
        why: "Johannes 9:22–23",
      },
      {
        q: "Waar waste de man zijn ogen?",
        a: ["In het badwater Siloam", "In de rivier de Jordaan", "In het badwater Bethesda"],
        why: "Johannes 9:7",
      },
      {
        q: "Wat gebeurde er het eerst?",
        a: ["De man wast zich in Siloam", "De Farizeeën ondervragen de ouders", "De man aanbidt de Heere Jezus"],
        why: "Johannes 9:7, 18, 38",
      },
    ],
  },
  104: {
    status: "concept",
    delen: [
      {
        kop: "De herder en de dief",
        stap: "jezus-2:nt-feesten-jeruzalem:4",
        t: "De Heere Jezus vertelt de Farizeeën een gelijkenis, een vergelijking. Wie niet door de deur in de schaapskooi gaat, maar ergens anders inklimt, is een dief. De herder gaat door de deur. Hij roept zijn schapen bij hun naam en gaat voor ze uit. Ze volgen hem, want ze kennen zijn stem. Een vreemde volgen ze niet. De Farizeeën begrijpen niet wat Hij bedoelt.",
      },
      {
        kop: "Ik ben de goede Herder",
        t: "Dan zegt de Heere Jezus: ‘Ik ben de Deur der schapen.’ En: ‘Ik ben de goede Herder; de goede herder stelt zijn leven voor de schapen.’ Dat betekent: Hij geeft Zijn leven voor hen. Een huurling, die alleen voor geld op de schapen past, vlucht als de wolf komt.",
      },
      {
        kop: "Niemand rukt ze uit Zijn hand",
        stap: "jezus-2:nt-feesten-jeruzalem:5",
        t: "Het is winter, het feest van de vernieuwing van de tempel. De Joden vragen of Hij de Christus is. Hij zegt: ‘Mijn schapen horen Mijn stem, en Ik ken dezelve, en zij volgen Mij.’ Hij geeft hun het eeuwige leven, en niemand zal ze uit Zijn hand rukken.",
      },
    ],
    vragen: [
      {
        q: "Hoe noemt de Heere Jezus iemand die niet door de deur de schaapskooi in gaat?",
        a: ["Een dief en moordenaar", "Een huurling", "Een deurwachter"],
        why: "Johannes 10:1",
      },
      {
        q: "Waarom volgen de schapen een vreemde niet?",
        a: ["Ze kennen zijn stem niet", "Hij heeft geen herdersstaf", "Hij komt te laat"],
        why: "Johannes 10:5",
      },
      {
        q: "Wat bedoelt de Heere Jezus met: de goede herder stelt zijn leven voor de schapen?",
        a: ["Hij geeft Zijn leven voor hen", "Hij telt Zijn schapen elke dag", "Hij brengt ze elke avond in de stal"],
        why: "Johannes 10:11, 15",
      },
      {
        q: "In welk jaargetijde was het feest van de vernieuwing?",
        a: ["In de winter", "In de zomer", "In de lente"],
        why: "Johannes 10:22",
      },
    ],
  },
  105: {
    status: "concept",
    delen: [
      {
        kop: "Een vraag bij Caesarea Filippi",
        stap: "jezus-2:nt-brood-en-berg:4",
        t: "In de streek van Caesarea Filippi, in het noorden, vraagt de Heere Jezus Zijn discipelen wie de mensen zeggen dat Hij is. Sommigen zeggen Johannes de Doper, anderen Elia, en anderen Jeremia of een van de profeten. Dan vraagt Hij: ‘Maar gij, wie zegt gij, dat Ik ben?’",
      },
      {
        kop: "Gij zijt de Christus",
        t: "Simon Petrus antwoordt: ‘Gij zijt de Christus, de Zoon des levenden Gods.’ Christus betekent Gezalfde: Hij is de Beloofde van God. De Heere Jezus noemt Petrus zalig (gezegend), want niet mensen hebben hem dit laten zien, maar de Vader in de hemel. Hij verbiedt de discipelen om aan iemand te vertellen dat Hij de Christus is.",
      },
      {
        kop: "Lijden, sterven en opstaan",
        stap: "jezus-2:nt-brood-en-berg:5",
        t: "Daarna vertelt de Heere Jezus dat Hij naar Jeruzalem moet. Daar zal Hij veel lijden en gedood worden, en op de derde dag opgewekt worden. Petrus zegt: ‘dit zal U geenszins geschieden’. Dat betekent: dit mag U nooit overkomen. Maar de Heere Jezus zegt: ‘Ga weg achter Mij, satanas!’ Petrus denkt niet aan wat God wil, maar aan wat mensen willen.",
      },
    ],
    vragen: [
      {
        q: "Waar stelde de Heere Jezus de vraag: ‘Maar gij, wie zegt gij, dat Ik ben?’",
        a: ["In de streek van Caesarea Filippi", "In de synagoge van Kapernaüm", "In de tempel van Jeruzalem"],
        why: "Mattheüs 16:13–15",
      },
      {
        q: "Waarom noemt de Heere Jezus Petrus zalig?",
        a: ["De Vader in de hemel heeft het hem geopenbaard", "Petrus had het zelf bedacht", "Petrus had het van Johannes de Doper gehoord"],
        why: "Mattheüs 16:17",
      },
      {
        q: "Wat begint de Heere Jezus na dit gesprek aan Zijn discipelen te vertellen?",
        a: ["Dat Hij in Jeruzalem moet lijden en sterven", "Dat Hij koning wordt in Jeruzalem", "Dat ze naar huis mogen gaan"],
        why: "Mattheüs 16:21",
      },
      {
        q: "Wat wil Petrus tegenhouden?",
        a: ["Dat de Heere Jezus moet lijden en sterven", "Dat de discipelen naar huis gaan", "Dat de mensen bij Hem komen"],
        why: "Mattheüs 16:21–22",
      },
    ],
  },
  106: {
    status: "concept",
    delen: [
      {
        kop: "Bidden op de berg",
        stap: "jezus-2:nt-brood-en-berg:6",
        t: "Ongeveer acht dagen na de belijdenis van Petrus neemt de Heere Jezus Petrus, Johannes en Jakobus mee een berg op om te bidden. Terwijl Hij bidt, verandert Zijn gezicht, en Zijn kleren worden wit en zeer blinkend. Twee mannen spreken met Hem: Mozes en Elia. Ze verschijnen in heerlijkheid en spreken over Zijn uitgang, die Hij in Jeruzalem zou volbrengen. Dat wordt meestal uitgelegd als Zijn sterven in Jeruzalem.",
      },
      {
        kop: "Drie tenten",
        t: "De discipelen zijn zwaar van de slaap. Als ze wakker worden, zien ze Zijn heerlijkheid en de twee mannen. Als Mozes en Elia weggaan, zegt Petrus: ‘Meester, het is goed, dat wij hier zijn’. Hij wil drie tenten maken, voor elk één. Maar hij weet niet wat hij zegt.",
      },
      {
        kop: "Een stem uit de wolk",
        t: "Dan komt er een wolk die hen overschaduwt, en de discipelen worden bang. Uit de wolk klinkt een stem: ‘Deze is Mijn geliefde Zoon; hoort Hem!’ Daarna is de Heere Jezus weer alleen. De discipelen zwijgen en vertellen in die dagen niemand wat ze gezien hebben.",
      },
    ],
    vragen: [
      {
        q: "Wat gebeurde er met de Heere Jezus terwijl Hij bad?",
        a: ["Zijn gezicht veranderde en Zijn kleren werden wit", "Hij viel in een diepe slaap", "Er kwam vuur uit de hemel"],
        why: "Lukas 9:29",
      },
      {
        q: "Hoe waren de discipelen eraan toe voordat ze Zijn heerlijkheid zagen?",
        a: ["Ze waren zwaar van de slaap", "Ze hadden grote honger", "Ze waren de weg kwijt"],
        why: "Lukas 9:32",
      },
      {
        q: "Wanneer zei Petrus dat hij drie tenten wilde maken?",
        a: ["Toen Mozes en Elia weggingen", "Toen ze de berg op klommen", "Toen de stem had gesproken"],
        why: "Lukas 9:33",
      },
      {
        q: "Wie is de Heere Jezus volgens de stem uit de wolk?",
        a: ["Gods geliefde Zoon", "Een engel uit de hemel", "Een leerling van Mozes"],
        why: "Lukas 9:35",
      },
    ],
  },
  107: {
    status: "concept",
    delen: [
      {
        kop: "Laat de kinderen komen",
        stap: "jezus-2:nt-reis-naar-jeruzalem:7",
        t: "Mensen brengen kleine kinderen bij de Heere Jezus, zodat Hij ze zou aanraken. De discipelen bestraffen die mensen, maar de Heere Jezus neemt dat zeer kwalijk. Hij zegt: ‘Laat de kinderkens tot Mij komen, en verhindert ze niet; want derzulken is het Koninkrijk Gods.’ Hij neemt ze in Zijn armen, legt hun de handen op en zegent ze.",
      },
      {
        kop: "Eén ding ontbreekt",
        stap: "jezus-2:nt-reis-naar-jeruzalem:8",
        t: "Dan valt een man voor Hem op de knieën. Hij vraagt hoe hij het eeuwige leven kan beërven (krijgen als erfenis). De Heere Jezus noemt de geboden. De man zegt dat hij die van jongs af gehouden heeft. De Heere Jezus kijkt hem aan, heeft hem lief en zegt: ‘Een ding ontbreekt u’. Hij moet alles verkopen, het aan de armen geven en Hem volgen. De man gaat bedroefd weg, want hij heeft veel bezittingen.",
      },
      {
        kop: "Bij God is alles mogelijk",
        t: "De Heere Jezus zegt: voor rijken is het heel moeilijk om in Gods Koninkrijk te komen. Een kemel (kameel) gaat nog makkelijker door het oog van een naald. De discipelen schrikken: wie kan dan zalig worden? Hij antwoordt: ‘Bij de mensen is het onmogelijk, maar niet bij God’.",
      },
    ],
    vragen: [
      {
        q: "Waarom brachten de mensen kinderen bij de Heere Jezus?",
        a: ["Zodat Hij ze zou aanraken", "Zodat Hij ze zou leren lezen", "Zodat ze eten zouden krijgen"],
        why: "Markus 10:13",
      },
      {
        q: "Welk gebod noemde de Heere Jezus aan de man?",
        a: ["Eer uw vader en uw moeder", "Gij zult geen gesneden beeld maken", "Gedenk den sabbatdag"],
        why: "Markus 10:19",
      },
      {
        q: "Waarom ging de man bedroefd weg?",
        a: ["Hij had vele goederen", "Hij was de geboden vergeten", "Hij moest snel naar huis"],
        why: "Markus 10:22",
      },
      {
        q: "Wat vroegen de discipelen na de woorden over de kemel?",
        a: ["Wie kan dan zalig worden?", "Waar vinden we zo’n naald?", "Mogen wij nog wel iets bezitten?"],
        why: "Markus 10:26",
      },
    ],
  },
  108: {
    status: "concept",
    delen: [
      {
        kop: "Op weg naar Jeruzalem",
        stap: "jezus-2:nt-reis-naar-jeruzalem:9",
        t: "De Heere Jezus loopt voor Zijn discipelen uit naar Jeruzalem. Zij zijn verbaasd en bang. Opnieuw vertelt Hij de twaalf wat er gaat gebeuren. Hij zal overgeleverd worden aan de overpriesters en de Schriftgeleerden. Ze zullen Hem bespotten, geselen, bespuwen en doden. Maar op de derde dag zal Hij weer opstaan.",
      },
      {
        kop: "Een vraag om de beste plaatsen",
        t: "Dan vragen Jakobus en Johannes, de zonen van Zebedeüs, of ze in Zijn heerlijkheid naast Hem mogen zitten, rechts en links. De Heere Jezus zegt: ‘Gij weet niet, wat gij begeert.’ Hij vraagt of ze de drinkbeker kunnen drinken die Hij drinkt. Dat wordt meestal uitgelegd als het lijden dat Hem wacht. ‘Wij kunnen’, zeggen ze.",
      },
      {
        kop: "Wie groot wil zijn",
        t: "De andere tien worden boos op de twee broers. De Heere Jezus zegt: wie groot wil worden, moet dienaar zijn. ‘Want ook de Zoon des mensen is niet gekomen om gediend te worden, maar om te dienen, en Zijn ziel te geven tot een rantsoen voor velen.’ Een rantsoen is een losprijs.",
      },
    ],
    vragen: [
      {
        q: "Hoe voelden de discipelen zich toen de Heere Jezus voor hen uit liep?",
        a: ["Verbaasd en bang", "Blij en vrolijk", "Moe en hongerig"],
        why: "Markus 10:32",
      },
      {
        q: "Aan wie zou de Zoon des mensen overgeleverd worden?",
        a: ["Aan de overpriesters en de Schriftgeleerden", "Aan de koning van Syrië", "Aan de Samaritanen"],
        why: "Markus 10:33",
      },
      {
        q: "Wat vroeg de Heere Jezus aan Jakobus en Johannes?",
        a: ["Of ze de drinkbeker konden drinken die Hij drinkt", "Of ze Hem altijd zouden volgen", "Of ze de wet goed kenden"],
        why: "Markus 10:38",
      },
      {
        q: "Waarom moet wie groot wil zijn een dienaar worden?",
        a: ["Ook de Zoon des mensen kwam om te dienen", "Dan houden de anderen meer van hem", "Dan worden de anderen niet boos"],
        why: "Markus 10:43–45",
      },
    ],
  },
  109: {
    status: "concept",
    delen: [
      {
        kop: "De vraag van de wetgeleerde",
        t: "Een wetgeleerde, een kenner van Gods wet, wil de Heere Jezus op de proef stellen. Hij vraagt hoe hij het eeuwige leven beërft. Hij zegt zelf wat in de wet staat: God liefhebben met heel je hart, ziel, kracht en verstand, en je naaste als jezelf. ‘Doe dat, en gij zult leven’, zegt de Heere Jezus. Maar de man wil zichzelf rechtvaardigen en vraagt: ‘En wie is mijn naaste?’",
      },
      {
        kop: "Een man langs de weg",
        t: "De Heere Jezus vertelt een gelijkenis. Een man gaat van Jeruzalem naar Jericho. Hij wordt overvallen, uitgekleed en geslagen, en blijft half dood liggen. Een priester ziet hem en loopt aan de overkant voorbij. Een Leviet, een helper in de tempel, doet hetzelfde.",
      },
      {
        kop: "De Samaritaan helpt",
        t: "Dan komt een Samaritaan. Als hij de man ziet, krijgt hij medelijden. Hij verbindt zijn wonden met olie en wijn, zet hem op zijn eigen rijdier en brengt hem naar een herberg. De volgende dag geeft hij de waard twee penningen. Wie was de naaste? ‘Die barmhartigheid aan hem gedaan heeft’, zegt de wetgeleerde. De Heere Jezus zegt: ‘Ga heen, en doe gij desgelijks.’",
      },
    ],
    vragen: [
      {
        q: "Waarom stelde de wetgeleerde zijn vraag aan de Heere Jezus?",
        a: ["Hij wilde Hem op de proef stellen", "Hij was ziek en zocht hulp", "Hij wilde een discipel worden"],
        why: "Lukas 10:25",
      },
      {
        q: "Wat deden de priester en de Leviet toen ze de man zagen?",
        a: ["Ze gingen aan de overkant voorbij", "Ze haalden hulp uit Jericho", "Ze gaven hem wat water"],
        why: "Lukas 10:31–32",
      },
      {
        q: "Wat deed de Samaritaan het eerst?",
        a: ["Hij verbond de wonden van de man", "Hij gaf de waard twee penningen", "Hij bracht de man naar de herberg"],
        why: "Lukas 10:34–35",
      },
      {
        q: "Wie was volgens de wetgeleerde de naaste van de gewonde man?",
        a: ["Die barmhartig voor hem was", "De priester, want die diende God", "De waard van de herberg"],
        why: "Lukas 10:36–37",
      },
    ],
  },
  110: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een gast in het huis van Martha",
        stap: "jezus-2:nt-reis-naar-jeruzalem:2",
        t: "De Heere Jezus is op reis naar Jeruzalem. Hij komt in een dorp, en een vrouw die Martha heet, ontvangt Hem in haar huis. Martha heeft een zuster, Maria. Maria gaat aan de voeten van de Heere Jezus zitten en hoort Zijn woord.",
      },
      {
        kop: "Druk met dienen",
        t: "Martha is heel druk met het vele werk. De Bijbel noemt dat ‘dienen’: zorgen voor de gasten. Ze komt naar de Heere Jezus en zegt: ‘Heere, trekt Gij U dat niet aan, dat mijn zuster mij alleen laat dienen?’ Dat betekent: kan het U niet schelen? ‘Zeg dan haar, dat zij mij helpe.’",
      },
      {
        kop: "Eén ding is nodig",
        t: "De Heere Jezus antwoordt: ‘Martha, Martha, gij bekommert en ontrust u over vele dingen’. Martha maakt zich dus zorgen en is onrustig over veel dingen. ‘Maar een ding is nodig’, zegt Hij. Maria heeft het goede deel gekozen, en dat zal niet van haar weggenomen worden.",
      },
    ],
    vragen: [
      {
        q: "Wat doet Maria terwijl Martha bezig is?",
        a: ["Ze zit aan Zijn voeten en hoort Zijn woord", "Ze haalt water bij de put", "Ze gaat de buren uitnodigen"],
        why: "Lukas 10:39",
      },
      {
        q: "Waarom komt Martha naar de Heere Jezus?",
        a: ["Ze wil dat Maria haar komt helpen", "Ze wil dat Hij verder reist", "Ze wil weten waar Hij heen gaat"],
        why: "Lukas 10:40",
      },
      {
        q: "Wat bedoelt de Heere Jezus met ‘gij bekommert en ontrust u’?",
        a: ["Martha maakt zich zorgen en is onrustig", "Martha werkt veel te langzaam", "Martha moet nog harder werken"],
        why: "Lukas 10:41",
      },
      {
        q: "Wat zegt de Heere Jezus over het deel dat Maria koos?",
        a: ["Het zal niet van haar weggenomen worden", "Ze moet het met Martha delen", "Ze krijgt het pas later"],
        why: "Lukas 10:42",
      },
    ],
  },
  111: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Aan tafel bij een Farizeeër",
        t: "Op een sabbat eet de Heere Jezus in het huis van een van de oversten van de Farizeeën. Daar geneest Hij een zieke man. Dan zegt een van de gasten: ‘Zalig is hij, die brood eet in het Koninkrijk Gods.’ Zalig betekent: heel gelukkig. De Heere Jezus antwoordt met een gelijkenis.",
      },
      {
        kop: "Iedereen heeft een excuus",
        t: "Een man maakt een groot avondmaal klaar en nodigt veel mensen uit. Als alles klaar is, stuurt hij zijn knecht: ‘Komt, want alle dingen zijn nu gereed.’ Maar ze verontschuldigen zich allemaal. De een heeft een akker gekocht, de ander vijf juk ossen. Een derde is net getrouwd.",
      },
      {
        kop: "Een vol huis",
        t: "Dan wordt de heer van het huis toornig: hij wordt heel boos. Hij stuurt de knecht snel de stad in om armen, verminkten, kreupelen en blinden te halen. Er is nog plaats. Daarom moet de knecht ook naar de wegen en heggen, zodat het huis vol wordt. Maar niemand van de eerste genodigden zal van het avondmaal proeven.",
      },
    ],
    vragen: [
      {
        q: "Op welke dag eet de Heere Jezus bij de Farizeeër?",
        a: ["Op een sabbat", "Op de eerste dag van het Pascha", "Op de dag van een bruiloft"],
        why: "Lukas 14:1",
      },
      {
        q: "Waarom vertelt de Heere Jezus deze gelijkenis?",
        a: [
          "Een gast spreekt over eten in het Koninkrijk van God",
          "De discipelen vragen wat het Koninkrijk is",
          "Een zieke man vraagt om genezing",
        ],
        why: "Lukas 14:15–16",
      },
      { q: "Wat heeft de tweede genodigde gekocht?", a: ["Vijf juk ossen", "Een akker", "Een huis in de stad"], why: "Lukas 14:19" },
      {
        q: "Wie haalt de knecht eerst uit de stad?",
        a: ["Armen, verminkten, kreupelen en blinden", "Vrienden, broeders en rijke buren", "Farizeeën en schriftgeleerden"],
        why: "Lukas 14:21",
      },
      {
        q: "Waarom stuurt de heer de knecht ook naar de wegen en heggen?",
        a: ["Er is nog plaats, en zijn huis moet vol worden", "De mensen uit de stad wilden niet komen", "Hij zoekt de eerste genodigden"],
        why: "Lukas 14:22–23",
      },
    ],
  },
  112: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Waarom de Heere Jezus dit vertelt",
        t: "Tollenaars en zondaars komen naar de Heere Jezus om Hem te horen. De Farizeeën en schriftgeleerden mopperen: ‘Deze ontvangt de zondaars, en eet met hen.’ Daarom vertelt Hij gelijkenissen.",
      },
      {
        kop: "Ver weg van huis",
        t: "Een vader heeft twee zonen. De jongste vraagt zijn deel van de bezittingen en reist naar een ver land. Daar geeft hij alles uit. Als er hongersnood komt, moet hij zwijnen hoeden. Hij zou graag hun voer eten, maar niemand geeft het hem. Dan komt hij tot zichzelf: ik ga terug en zeg tegen mijn vader dat ik gezondigd heb.",
      },
      {
        kop: "Verloren en gevonden",
        t: "De vader ziet hem al van ver. Hij krijgt medelijden, loopt naar hem toe en kust hem. Hij laat het beste kleed, een ring en schoenen brengen en het gemeste kalf slachten. ‘Want deze mijn zoon was dood, en is weder levend geworden; en hij was verloren, en is gevonden!’",
      },
      {
        kop: "De oudste zoon",
        t: "De oudste zoon komt van het veld en hoort het gezang. Hij wordt boos en wil niet naar binnen. De vader gaat naar buiten en smeekt hem. De vader zegt: ‘Kind, gij zijt altijd bij mij, en al het mijne is uwe.’",
      },
    ],
    vragen: [
      {
        q: "Wat vraagt de jongste zoon aan zijn vader?",
        a: ["Zijn deel van de bezittingen", "Werk op het land van zijn vader", "Een paard voor de reis"],
        why: "Lukas 15:12",
      },
      {
        q: "Waarom besluit de zoon terug te gaan?",
        a: [
          "De huurlingen van zijn vader hebben brood genoeg, en hij heeft honger",
          "Hij heeft weer veel geld verdiend",
          "Zijn vader heeft hem een bericht gestuurd",
        ],
        why: "Lukas 15:17–18",
      },
      {
        q: "Wat zegt de vader over zijn jongste zoon?",
        a: ["Hij was dood en is weer levend geworden", "Hij moet eerst als knecht werken", "Hij mag niet meer binnenkomen"],
        why: "Lukas 15:24",
      },
      {
        q: "Waarom vertelt de Heere Jezus deze gelijkenis?",
        a: ["De Farizeeën mopperen dat Hij zondaars ontvangt", "Een vader vraagt Hem om raad", "De discipelen hebben ruzie over geld"],
        why: "Lukas 15:1–3",
      },
      {
        q: "Wat doet de vader als de oudste zoon niet naar binnen wil?",
        a: ["Hij gaat naar buiten en smeekt hem", "Hij stuurt hem weg van huis", "Hij laat een knecht hem halen"],
        why: "Lukas 15:28",
      },
    ],
  },
  113: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Tien melaatse mannen",
        stap: "jezus-2:nt-reis-naar-jeruzalem:5",
        t: "De Heere Jezus reist naar Jeruzalem, door het midden van Samaria en Galilea. Bij een dorp komen tien melaatse mannen Hem tegemoet. Melaatsheid is een ernstige ziekte. Wie melaats was, was onrein en moest apart wonen. Daarom blijven ze van verre staan en roepen: ‘Jezus, Meester! ontferm U onzer!’ Dat betekent: heb medelijden met ons.",
      },
      {
        kop: "Onderweg gereinigd",
        t: "De Heere Jezus zegt: ‘Gaat heen en vertoont uzelven den priesteren.’ Een priester moest bekijken of een melaatse genezen was. Terwijl de tien mannen op weg zijn, worden ze rein.",
      },
      {
        kop: "Eén komt terug",
        t: "Eén van hen ziet dat hij genezen is. Hij keert terug, eert God met luide stem en valt voor de voeten van de Heere Jezus om Hem te danken. Die man is een Samaritaan. De Heere Jezus vraagt: ‘Zijn niet de tien gereinigd geworden, en waar zijn de negen?’ Tegen de man zegt Hij: ‘Sta op, en ga heen; uw geloof heeft u behouden.’",
      },
    ],
    vragen: [
      {
        q: "Waarom keert de Samaritaan terug?",
        a: ["Om God te eren en de Heere Jezus te danken", "Omdat hij nog niet genezen is", "Omdat de priesters hem wegsturen"],
        why: "Lukas 17:15–18",
      },
      {
        q: "Wat zegt de Heere Jezus tegen de tien mannen?",
        a: [
          "Dat ze zich aan de priesters moeten laten zien",
          "Dat ze zich zeven keer in de Jordaan moeten wassen",
          "Dat ze morgen terug moeten komen",
        ],
        why: "Lukas 17:14",
      },
      {
        q: "Wanneer worden de mannen rein?",
        a: ["Terwijl ze op weg zijn", "Als de Heere Jezus hen aanraakt", "Als ze terugkomen bij Hem"],
        why: "Lukas 17:14",
      },
      {
        q: "Wat is bijzonder aan de man die terugkomt?",
        a: ["Hij is een Samaritaan, een vreemdeling", "Hij is een priester", "Hij is de enige die genezen is"],
        why: "Lukas 17:16–18",
      },
    ],
  },
  114: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Twee mannen in de tempel",
        t: "De Heere Jezus vertelt deze gelijkenis aan mensen die op zichzelf vertrouwen dat ze rechtvaardig zijn: goed in Gods ogen. De anderen vinden ze niets waard. Twee mannen gaan naar de tempel om te bidden. De een is een Farizeeër, de ander een tollenaar.",
      },
      {
        kop: "Het gebed van de Farizeeër",
        t: "De Farizeeër staat en bidt: ‘O God! ik dank U, dat ik niet ben gelijk de andere mensen’. Hij noemt rovers, onrechtvaardigen en overspelers, en ook deze tollenaar. ‘Ik vast tweemaal per week; ik geef tienden van alles, wat ik bezit.’ Vasten is een tijd niet eten. Een tiende is één deel van elke tien.",
      },
      {
        kop: "Het gebed van de tollenaar",
        t: "De tollenaar blijft van verre staan en wil zijn ogen niet eens opheffen naar de hemel. Hij slaat op zijn borst en bidt: ‘O God! wees mij zondaar genadig!’ De Heere Jezus zegt: deze man gaat gerechtvaardigd naar huis, de Farizeeër niet. Gerechtvaardigd betekent: rechtvaardig voor God. Want wie zichzelf verhoogt, zal vernederd worden, en wie zichzelf vernedert, zal verhoogd worden.",
      },
    ],
    vragen: [
      {
        q: "Waarom vertelt de Heere Jezus deze gelijkenis?",
        a: [
          "Sommigen vertrouwen op zichzelf en achten anderen niets",
          "De discipelen vragen hoe ze moeten vasten",
          "Een tollenaar vraagt Hem om raad",
        ],
        why: "Lukas 18:9",
      },
      {
        q: "Waarvoor dankt de Farizeeër God?",
        a: ["Dat hij niet is zoals de andere mensen", "Dat God hem zijn zonden vergeeft", "Dat de tollenaar ook in de tempel is"],
        why: "Lukas 18:11",
      },
      { q: "Waar staat de tollenaar als hij bidt?", a: ["Van verre", "Vooraan bij het altaar", "Naast de Farizeeër"], why: "Lukas 18:13" },
      {
        q: "Wat bidt de tollenaar?",
        a: ["God, wees mij zondaar genadig", "God, ik dank U voor mijn vasten", "God, maak mij zoals de Farizeeër"],
        why: "Lukas 18:13",
      },
      {
        q: "Wat gebeurt er met wie zichzelf verhoogt?",
        a: ["Hij zal vernederd worden", "Hij zal verhoogd worden", "Hij zal rijk worden"],
        why: "Lukas 18:14",
      },
    ],
  },
  115: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een bericht uit Bethanië",
        stap: "jezus-2:nt-feesten-jeruzalem:6",
        t: "Lazarus woont in Bethanië. Hij is de broer van Martha en Maria, en de Heere Jezus heeft hen lief. Als Lazarus ziek wordt, laten de zusters het de Heere Jezus weten. Hij zegt dat deze ziekte is ‘ter heerlijkheid Gods’. Hij blijft nog twee dagen waar Hij is. Dan zegt Hij: ‘Lazarus is gestorven.’",
      },
      {
        kop: "De Opstanding en het Leven",
        stap: "jezus-2:nt-feesten-jeruzalem:7",
        t: "Als de Heere Jezus komt, ligt Lazarus al vier dagen in het graf. Martha gaat Hem tegemoet. Hij zegt: ‘Ik ben de Opstanding en het Leven’. Maria valt aan Zijn voeten. Als Hij haar en de anderen ziet huilen, staat er: ‘Jezus weende.’",
      },
      {
        kop: "Uit het graf",
        t: "Het graf is een grot met een steen ervoor. De Heere Jezus laat de steen wegnemen en dankt Zijn Vader. Dan roept Hij: ‘Lazarus, kom uit!’ De gestorvene komt naar buiten, met grafdoeken om handen en voeten. Veel mensen die het zien, geloven in de Heere Jezus. Maar sommigen gaan het aan de Farizeeën vertellen.",
      },
    ],
    vragen: [
      {
        q: "Wat laten de zusters de Heere Jezus weten?",
        a: ["Dat Lazarus ziek is", "Dat Lazarus op reis is", "Dat ze naar Jeruzalem gaan"],
        why: "Johannes 11:3",
      },
      {
        q: "Waarvoor is deze ziekte, volgens de Heere Jezus?",
        a: ["Ter heerlijkheid van God", "Als straf voor een zonde van Lazarus", "Om de zusters te leren wachten"],
        why: "Johannes 11:4",
      },
      {
        q: "Hoe lang ligt Lazarus al in het graf als de Heere Jezus komt?",
        a: ["Vier dagen", "Twee dagen", "Een week"],
        why: "Johannes 11:17",
      },
      {
        q: "Wat doet de Heere Jezus vlak voordat Hij Lazarus roept?",
        a: ["Hij dankt Zijn Vader", "Hij wast Zijn handen", "Hij zalft het graf"],
        why: "Johannes 11:41–43",
      },
      {
        q: "Wat doen veel mensen die het wonder zien?",
        a: ["Ze geloven in de Heere Jezus", "Ze leggen de steen terug", "Ze gaan naar de tempel om te offeren"],
        why: "Johannes 11:45",
      },
    ],
  },
  116: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een blinde langs de weg",
        stap: "jezus-2:nt-reis-naar-jeruzalem:10",
        t: "De Heere Jezus is met Zijn discipelen op weg naar Jeruzalem. Ze komen in Jericho. Als ze de stad weer uitgaan, gaat er een grote menigte mee. Langs de weg zit Bartimeüs, de zoon van Timeüs. Hij is blind en bedelt: hij vraagt voorbijgangers om een gift.",
      },
      {
        kop: "Hij blijft roepen",
        t: "Bartimeüs hoort dat het Jezus van Nazareth is. Hij roept: ‘Jezus, Gij Zone Davids! ontferm U mijner.’ Zoon van David is een naam voor de beloofde Koning uit het huis van David. Veel mensen bestraffen hem: hij moet zwijgen. Maar hij roept nog veel harder.",
      },
      {
        kop: "Bartimeüs kan zien",
        t: "De Heere Jezus blijft staan en laat hem bij Zich roepen. Bartimeüs gooit zijn mantel af en komt bij Hem. ‘Wat wilt gij, dat Ik u doen zal?’ vraagt de Heere Jezus. Bartimeüs zegt: ‘Rabboni! dat ik ziende mag worden.’ Rabboni betekent: Meester. ‘Ga heen, uw geloof heeft u behouden.’ Meteen kan hij zien, en hij volgt de Heere Jezus op de weg.",
      },
    ],
    vragen: [
      {
        q: "Waar zit Bartimeüs?",
        a: ["Langs de weg bij Jericho", "Bij de poort van Jeruzalem", "Aan de oever van de Jordaan"],
        why: "Markus 10:46",
      },
      {
        q: "Wat zeggen veel mensen tegen Bartimeüs?",
        a: ["Dat hij moet zwijgen", "Dat hij naar huis moet gaan", "Dat hij geld moet geven"],
        why: "Markus 10:48",
      },
      {
        q: "Wat doet Bartimeüs voordat hij bij de Heere Jezus komt?",
        a: ["Hij gooit zijn mantel af", "Hij wast zijn ogen", "Hij pakt zijn stok"],
        why: "Markus 10:50",
      },
      {
        q: "Wat vraagt Bartimeüs aan de Heere Jezus?",
        a: ["Dat hij kan zien", "Dat hij geld krijgt", "Dat hij mee mag naar Jeruzalem"],
        why: "Markus 10:51",
      },
      {
        q: "Waardoor is Bartimeüs behouden, volgens de Heere Jezus?",
        a: ["Door zijn geloof", "Door zijn harde roepen", "Door zijn lange wachten"],
        why: "Markus 10:52",
      },
    ],
  },
  117: {
    status: "gecontroleerd",
    delen: [
      {
        kop: "Een rijke tollenaar in Jericho",
        stap: "jezus-2:nt-reis-naar-jeruzalem:11",
        t: "De Heere Jezus gaat door Jericho. Daar woont Zacheüs, een overste van de tollenaars, en hij is rijk. Tollenaars halen tol en belasting op. Zacheüs wil graag zien wie Jezus is, maar hij is klein en de menigte staat ervoor. Daarom rent hij vooruit en klimt in een wilde vijgenboom langs de weg.",
      },
      {
        kop: "Vandaag in jouw huis",
        t: "Als de Heere Jezus daar komt, kijkt Hij omhoog en zegt: ‘Zacheüs! haast u, en kom af; want Ik moet heden in uw huis blijven.’ Heden betekent vandaag. Zacheüs komt snel naar beneden en ontvangt Hem met blijdschap. Maar alle mensen die het zien, mopperen dat Hij bij een zondaar gaat logeren.",
      },
      {
        kop: "Zaligheid in dit huis",
        t: "Zacheüs zegt: ‘Zie, de helft van mijn goederen, Heere, geef ik den armen’. En als hij iemand door bedrog iets heeft afgenomen, geeft hij het vier keer terug. De Heere Jezus zegt: ‘Heden is dezen huize zaligheid geschied’. Zaligheid is redding. ‘Want de Zoon des mensen is gekomen, om te zoeken en zalig te maken, dat verloren was.’",
      },
    ],
    vragen: [
      {
        q: "Waarom klimt Zacheüs in de boom?",
        a: ["Hij is klein en de menigte staat ervoor", "Hij wil zich voor de mensen verstoppen", "Hij wil vijgen plukken voor de gasten"],
        why: "Lukas 19:3–4",
      },
      {
        q: "Wat zegt de Heere Jezus als Hij bij de boom komt?",
        a: ["Zacheüs, kom snel naar beneden", "Zacheüs, blijf daar maar zitten", "Zacheüs, kom morgen bij Mij"],
        why: "Lukas 19:5",
      },
      {
        q: "Waarom mopperen de mensen?",
        a: ["De Heere Jezus gaat logeren bij een zondaar", "Zacheüs klimt in een boom", "De Heere Jezus gaat niet naar de tempel"],
        why: "Lukas 19:7",
      },
      {
        q: "Wat geeft Zacheüs aan de armen?",
        a: ["De helft van zijn goederen", "Al zijn geld", "Een tiende van zijn goederen"],
        why: "Lukas 19:8",
      },
      {
        q: "Waarvoor is de Zoon des mensen gekomen?",
        a: ["Om te zoeken en zalig te maken wat verloren was", "Om de rijken te straffen voor hun bedrog", "Om koning te worden in Jericho"],
        why: "Lukas 19:10",
      },
    ],
  },
  118: {
    status: "concept",
    delen: [
      {
        kop: "Een ezelin en haar veulen",
        stap: "jezus-3:nt-lijdensweek:0",
        t: "De Heere Jezus is met Zijn discipelen bijna in Jeruzalem. Bij Bethfagé, aan de Olijfberg, stuurt Hij twee discipelen naar het dorp tegenover hen. Daar vinden ze een ezelin met haar veulen, een jong ezeltje. Als iemand iets vraagt, moeten ze zeggen dat de Heere ze nodig heeft. Ze leggen hun kleren op de dieren en zetten de Heere Jezus erop.",
      },
      {
        kop: "Zoals de profeet gezegd had",
        t: "Zo komt uit wat de profeet had gezegd: ‘Zie, uw Koning komt tot u, zachtmoedig en gezeten op een ezelin’. Zachtmoedig betekent: zacht en nederig.",
      },
      {
        kop: "Hosanna voor de Zoon van David",
        t: "Heel veel mensen spreiden hun kleren op de weg. Anderen hakken takken van de bomen. De scharen voor Hem en achter Hem roepen: ‘Hosanna den Zone Davids! Gezegend is Hij, Die komt in den Naam des Heeren!’",
      },
      {
        kop: "De stad vraagt wie Hij is",
        stap: "jezus-3:nt-lijdensweek:0",
        t: "Als de Heere Jezus Jeruzalem binnenkomt, raakt de hele stad in beroering. De mensen vragen: ‘Wie is Deze?’ De scharen antwoorden: ‘Deze is Jezus, de Profeet van Nazareth in Galilea.’",
      },
    ],
    vragen: [
      {
        q: "Wat vinden de twee discipelen in het dorp?",
        a: ["Een ezelin met haar veulen", "Een paard met een wagen", "Twee kamelen bij een put"],
        why: "Mattheüs 21:2",
      },
      {
        q: "Waarom rijdt de Heere Jezus zo Jeruzalem binnen?",
        a: ["Zo komt uit wat de profeet had gezegd", "De discipelen hadden dat zelf bedacht", "Hij wil ongemerkt de stad in"],
        why: "Mattheüs 21:4–5",
      },
      {
        q: "Wat roepen de scharen?",
        a: ["Hosanna den Zone Davids!", "Leve de keizer in Rome!", "Weg met de Farizeeën!"],
        why: "Mattheüs 21:9",
      },
      {
        q: "Wat vraagt de stad als de Heere Jezus binnenkomt?",
        a: ["Wie is Deze?", "Wanneer begint het feest?", "Waar gaat Hij slapen?"],
        why: "Mattheüs 21:10",
      },
      {
        q: "Wie is Hij volgens de scharen?",
        a: ["Jezus, de Profeet van Nazareth", "De nieuwe hogepriester", "Een koning uit Egypte"],
        why: "Mattheüs 21:11",
      },
    ],
  },
  119: {
    status: "concept",
    delen: [
      {
        kop: "Kopen en verkopen in de tempel",
        stap: "jezus-3:nt-lijdensweek:1",
        t: "De Heere Jezus gaat de tempel van God binnen. Daar wordt gekocht en verkocht. Hij drijft iedereen naar buiten die daar koopt en verkoopt. Hij gooit de tafels van de geldwisselaars om, en de stoelen van de duivenverkopers.",
      },
      {
        kop: "Een huis des gebeds",
        t: "Hij zegt: ‘Er is geschreven: Mijn huis zal een huis des gebeds genaamd worden; maar gij hebt dat tot een moordenaarskuil gemaakt.’ Een huis des gebeds is een huis om te bidden. Een moordenaarskuil is een schuilplaats voor misdadigers. Dan komen er blinden en kreupelen bij Hem in de tempel, en Hij geneest hen.",
      },
      {
        kop: "Kinderen roepen Hosanna",
        t: "Kinderen roepen in de tempel: ‘Hosanna den Zone Davids!’ De overpriesters en schriftgeleerden zien de wonderen en horen de kinderen. Ze nemen het zeer kwalijk. Maar de Heere Jezus wijst op de Schrift: uit de mond van jonge kinderen en zuigelingen heeft God Zich lof bereid. Zuigelingen zijn baby’s. Daarna gaat Hij de stad uit naar Bethanië en overnacht daar.",
      },
    ],
    vragen: [
      {
        q: "Wiens tafels gooit de Heere Jezus om?",
        a: ["Van de geldwisselaars", "Van de priesters", "Van de schriftgeleerden"],
        why: "Mattheüs 21:12",
      },
      {
        q: "Hoe moet Gods huis genoemd worden, zegt de Heere Jezus?",
        a: ["Een huis des gebeds", "Een huis van koophandel", "Een huis van de koning"],
        why: "Mattheüs 21:13",
      },
      {
        q: "Wie komen er daarna bij Hem in de tempel?",
        a: ["Blinden en kreupelen", "Melaatsen en doven", "Soldaten en tollenaars"],
        why: "Mattheüs 21:14",
      },
      {
        q: "Waarom nemen de overpriesters het zeer kwalijk?",
        a: [
          "Ze zien Zijn wonderen en horen de kinderen roepen",
          "De Heere Jezus is de tempel uitgegaan",
          "De kinderen roepen de naam van de keizer",
        ],
        why: "Mattheüs 21:15",
      },
      { q: "Waar gaat de Heere Jezus daarna heen?", a: ["Naar Bethanië", "Naar Nazareth", "Naar Jericho"], why: "Mattheüs 21:17" },
    ],
  },
  120: {
    status: "concept",
    delen: [
      {
        kop: "Vragen in de tempel",
        stap: "jezus-3:nt-lijdensweek:2",
        t: "De Heere Jezus leert in de tempel. De Farizeeën willen Hem met Zijn woorden vangen. Ze laten vragen of je belasting aan de keizer mag geven. Hij laat een munt brengen met het beeld van de keizer en zegt: ‘Geeft dan den keizer, dat des keizers is, en Gode, dat Gods is.’ Een wetgeleerde vraagt naar het grote gebod: God liefhebben met heel je hart, ziel en verstand, en je naaste als jezelf.",
      },
      {
        kop: "Niemand weet de dag",
        stap: "jezus-3:nt-lijdensweek:3",
        t: "Op de Olijfberg zegt Hij dat de Zoon des mensen zal komen op de wolken van de hemel. Die dag en dat uur weet niemand, alleen de Vader. Hij vertelt over tien maagden. De vijf dwaze nemen geen olie mee voor hun lampen. Als de bruidegom om middernacht komt, gaan alleen de vijf wijze mee, en de deur gaat dicht. ‘Zo waakt dan’, zegt de Heere Jezus.",
      },
      {
        kop: "Talenten, schapen en bokken",
        t: "Een heer geeft zijn dienstknechten talenten: veel geld. Twee knechten handelen ermee en winnen erbij. De derde verbergt zijn talent in de aarde. Ook vertelt Hij hoe de Koning alle volken zal scheiden, zoals een herder de schapen van de bokken scheidt.",
      },
    ],
    vragen: [
      {
        q: "Waarom laten de Farizeeën hun vraag over de belasting stellen?",
        a: ["Ze willen Hem met Zijn woorden vangen", "Ze willen weten hoeveel ze moeten betalen", "Ze willen Hem helpen tegen de keizer"],
        why: "Mattheüs 22:15",
      },
      { q: "Wiens beeld staat er op de munt?", a: ["Van de keizer", "Van koning David", "Van de hogepriester"], why: "Mattheüs 22:20–21" },
      {
        q: "Wat hebben de wijze maagden bij zich?",
        a: ["Olie in hun vaten", "Een extra lamp", "Brood voor onderweg"],
        why: "Mattheüs 25:4",
      },
      {
        q: "Waarom zegt de Heere Jezus: ‘Zo waakt dan’?",
        a: ["Niemand weet de dag of het uur", "Het is al bijna ochtend", "De bruidegom is al binnen"],
        why: "Mattheüs 25:13",
      },
      {
        q: "Hoe zal de Koning de volken scheiden?",
        a: [
          "Zoals een herder de schapen van de bokken",
          "Zoals een boer het koren van het kaf",
          "Zoals een visser de goede vissen van de slechte",
        ],
        why: "Mattheüs 25:32",
      },
    ],
  },
  121: {
    status: "concept",
    delen: [
      {
        kop: "Lief tot het einde",
        stap: "jezus-3:nt-lijdensweek:5",
        t: "Het is vlak voor het feest van het pascha. De Heere Jezus weet dat Zijn uur gekomen is: Hij gaat uit de wereld naar de Vader. Hij heeft de Zijnen lief tot het einde. Hij staat op van de maaltijd, legt Zijn kleren af en bindt een linnen doek om. Hij giet water in een bekken: een kom. Dan begint Hij de voeten van de discipelen te wassen.",
      },
      {
        kop: "Petrus wil het niet",
        t: "Petrus zegt: ‘Gij zult mijn voeten niet wassen in der eeuwigheid!’ De Heere Jezus antwoordt: ‘Indiën Ik u niet wasse, gij hebt geen deel met Mij.’ Dat betekent: dan hoor je niet bij Mij. Dan wil Petrus ook handen en hoofd gewassen hebben.",
      },
      {
        kop: "Een voorbeeld",
        t: "Als Hij weer zit, zegt Hij: jullie noemen Mij Meester en Heere, en dat ben Ik ook. Als Ik jullie voeten gewassen heb, moeten jullie ook elkaars voeten wassen. ‘Want Ik heb u een voorbeeld gegeven’.",
      },
      {
        kop: "Twist over de grootste",
        t: "Lukas vertelt: de discipelen twisten over wie de grootste is. De Heere Jezus zegt: koningen heersen over hun volk, ‘doch gij niet alzo’. De grootste moet zijn als de minste. ‘Maar Ik ben in het midden van u, als een die dient.’",
      },
    ],
    vragen: [
      {
        q: "Wat doet de Heere Jezus om voordat Hij de voeten wast?",
        a: ["Een linnen doek", "Een mantel van purper", "Een gordel van leer"],
        why: "Johannes 13:4",
      },
      {
        q: "Waarom wil Petrus het daarna toch?",
        a: ["Anders heeft hij geen deel met de Heere Jezus", "Zijn voeten zijn erg vies geworden", "De andere discipelen lachen hem uit"],
        why: "Johannes 13:8–9",
      },
      {
        q: "Waarom wast de Heere Jezus de voeten, zegt Hij Zelf?",
        a: ["Als voorbeeld, zodat zij ook zo doen", "Omdat Petrus Hem erom vroeg", "Omdat er geen dienaar was"],
        why: "Johannes 13:15",
      },
      {
        q: "Waarover twisten de discipelen?",
        a: ["Wie van hen de grootste is", "Wie naast de Heere Jezus mag zitten", "Wie het pascha moet betalen"],
        why: "Lukas 22:24",
      },
      {
        q: "Hoe is de Heere Jezus in het midden van de discipelen?",
        a: ["Als een die dient", "Als een koning die heerst", "Als een die aanzit en wacht"],
        why: "Lukas 22:27",
      },
    ],
  },
  122: {
    status: "concept",
    delen: [
      {
        kop: "Het pascha klaarmaken",
        stap: "jezus-3:nt-lijdensweek:6",
        t: "Het is de dag van de ongehevelde broden: broden zonder zuurdesem. Op die dag moet het paaslam geslacht worden. De Heere Jezus stuurt Petrus en Johannes vooruit. In de stad zien ze een man met een kruik water. Ze volgen hem naar een huis. Daar wijst de huisvader hun een grote opperzaal: een zaal boven in het huis. Alles is zoals de Heere Jezus gezegd had.",
      },
      {
        kop: "Brood en beker",
        t: "Als het uur gekomen is, zit Hij aan tafel met de twaalf apostelen. Hij neemt brood, dankt, breekt het en geeft het hun: ‘Dat is Mijn lichaam, hetwelk voor u gegeven wordt; doet dat tot Mijn gedachtenis.’ Na het avondmaal neemt Hij de beker: ‘Deze drinkbeker is het nieuwe testament in Mijn bloed, hetwelk voor u vergoten wordt.’ Een testament is hier een verbond.",
      },
      {
        kop: "Een verrader aan tafel",
        t: "Dan zegt de Heere Jezus: ‘Doch ziet, de hand desgenen, die Mij verraadt, is met Mij aan de tafel.’ De Zoon des mensen gaat heen zoals besloten is. Maar wee de mens die Hem verraadt! De discipelen vragen elkaar wie van hen dat zou kunnen zijn.",
      },
    ],
    vragen: [
      {
        q: "Hoe vinden Petrus en Johannes het huis?",
        a: ["Ze volgen een man met een kruik water", "Ze vragen het aan een priester", "Een engel wijst hun de weg"],
        why: "Lukas 22:10",
      },
      {
        q: "Waar maken ze het pascha klaar?",
        a: ["In een grote opperzaal", "In de voorhof van de tempel", "In een huis in Bethanië"],
        why: "Lukas 22:12–13",
      },
      {
        q: "Wat zegt de Heere Jezus als Hij het brood geeft?",
        a: ["Dat is Mijn lichaam, voor u gegeven", "Dat is het brood van de tempel", "Dat is het manna uit de woestijn"],
        why: "Lukas 22:19",
      },
      {
        q: "Waarom moeten de discipelen dit doen?",
        a: ["Tot Zijn gedachtenis", "Om het feest af te sluiten", "Om de priesters te eren"],
        why: "Lukas 22:19",
      },
      {
        q: "Wie zit er volgens de Heere Jezus met Hem aan tafel?",
        a: ["Degene die Hem verraadt", "Een engel uit de hemel", "De hogepriester"],
        why: "Lukas 22:21",
      },
    ],
  },
  123: {
    status: "concept",
    delen: [
      {
        kop: "Judas gaat naar de overpriesters",
        t: "Judas Iskariot is een van de twaalf discipelen. Hij gaat naar de overpriesters om de Heere Jezus aan hen over te leveren. Zij zijn blij en beloven hem geld. Vanaf dan zoekt Judas een goede gelegenheid.",
      },
      {
        kop: "Bidden in Gethsémané",
        stap: "jezus-3:nt-lijdensweek:7",
        t: "Na de lofzang gaat de Heere Jezus naar de Olijfberg, naar een plaats die Gethsémané heet. Hij neemt Petrus, Jakobus en Johannes mee. Hij is diep bedroefd. Hij valt op de grond en bidt: ‘Abba, Vader! alle dingen zijn U mogelijk; neem dezen drinkbeker van Mij weg, doch niet wat Ik wil, maar wat Gij wilt.’ Abba betekent Vader. De drinkbeker wordt meestal uitgelegd als het lijden dat komt. Steeds als Hij terugkomt, slapen de discipelen.",
      },
      {
        kop: "Verraden met een kus",
        stap: "jezus-3:nt-lijdensweek:8",
        t: "Dan komt Judas met een grote schare met zwaarden en stokken. Judas zegt: ‘Rabbi’, en kust Hem; dat was het afgesproken teken. Ze grijpen de Heere Jezus. Iemand slaat met een zwaard een oor af van de dienstknecht van de hogepriester. De Heere Jezus zegt dat dit gebeurt ‘opdat de Schriften vervuld zouden worden’. Dan verlaten alle discipelen Hem en vluchten.",
      },
    ],
    vragen: [
      {
        q: "Waarom gaat Judas naar de overpriesters?",
        a: ["Om de Heere Jezus aan hen over te leveren", "Om een offer te brengen in de tempel", "Om de Heere Jezus te waarschuwen"],
        why: "Markus 14:10",
      },
      {
        q: "Wie neemt de Heere Jezus mee als Hij gaat bidden?",
        a: ["Petrus, Jakobus en Johannes", "Judas, Thomas en Andreas", "Mattheüs, Filippus en Bartholomeüs"],
        why: "Markus 14:33",
      },
      {
        q: "Hoe eindigt het gebed van de Heere Jezus?",
        a: ["Niet wat Ik wil, maar wat Gij wilt", "Laat Mijn discipelen wakker blijven", "Stuur Judas weg van deze plaats"],
        why: "Markus 14:36",
      },
      {
        q: "Waarom kust Judas de Heere Jezus?",
        a: ["Het is het afgesproken teken", "Hij wil afscheid van Hem nemen", "Hij wil Hem bedanken voor alles"],
        why: "Markus 14:44–45",
      },
      {
        q: "Wat doen de discipelen aan het eind?",
        a: ["Ze verlaten Hem en vluchten", "Ze gaan met Hem mee naar de stad", "Ze vechten tot de morgen"],
        why: "Markus 14:50",
      },
    ],
  },
  124: {
    status: "concept",
    delen: [
      {
        kop: "Ik nooit",
        t: "Op weg naar de Olijfberg zegt de Heere Jezus dat alle discipelen die nacht aan Hem geërgerd zullen worden: ze zullen Hem in de steek laten. Petrus zegt: ‘Al werden zij ook allen aan U geërgerd, ik zal nimmermeer geërgerd worden.’ Maar de Heere Jezus zegt dat Petrus Hem die nacht, voordat de haan kraait, driemaal zal verloochenen: zeggen dat hij Hem niet kent.",
      },
      {
        kop: "Bij de hogepriester",
        stap: "jezus-3:nt-lijden:0",
        t: "Na de gevangenneming brengen ze de Heere Jezus naar de hogepriester Kajafas. Petrus volgt van ver en gaat bij de dienaren zitten. De hogepriester vraagt of Hij de Christus is, de Zoon van God. De Heere Jezus antwoordt: ‘Gij hebt het gezegd.’ Dan zeggen ze: ‘Hij is des doods schuldig.’",
      },
      {
        kop: "Driemaal, en dan de haan",
        stap: "jezus-3:nt-lijden:1",
        t: "Een dienstmaagd zegt tegen Petrus: ‘Gij waart ook met Jezus, den Galileër.’ Petrus ontkent het. Een andere dienstmaagd zegt het ook, en hij zweert: ‘Ik ken den Mens niet.’ Even later zeggen omstanders dat zijn spraak hem verraadt. Weer zweert Petrus. Meteen kraait de haan. Petrus denkt aan het woord van de Heere Jezus, gaat naar buiten en huilt bitter.",
      },
    ],
    vragen: [
      {
        q: "Wat zegt Petrus als de Heere Jezus zegt dat ze Hem allemaal zullen verlaten?",
        a: ["Ik zal nimmermeer geërgerd worden", "Ik ga alvast terug naar Galilea", "Ik wil eerst gaan slapen"],
        why: "Mattheüs 26:33",
      },
      {
        q: "Wat vraagt de hogepriester aan de Heere Jezus?",
        a: ["Of Hij de Christus is, de Zoon van God", "Of Hij belasting betaalt aan de keizer", "Waarom Hij in Nazareth woont"],
        why: "Mattheüs 26:63",
      },
      {
        q: "Wie zegt als eerste tegen Petrus dat hij bij de Heere Jezus hoorde?",
        a: ["Een dienstmaagd", "Een soldaat", "De hogepriester"],
        why: "Mattheüs 26:69",
      },
      {
        q: "Waaraan horen de omstanders dat Petrus erbij hoort?",
        a: ["Aan zijn spraak", "Aan zijn kleren", "Aan zijn zwaard"],
        why: "Mattheüs 26:73",
      },
      {
        q: "Waarom huilt Petrus bitter?",
        a: ["Hij denkt aan het woord van de Heere Jezus", "Hij heeft het erg koud", "Hij wordt gevangengenomen"],
        why: "Mattheüs 26:75",
      },
    ],
  },
  125: {
    status: "concept",
    delen: [
      {
        kop: "Voor de raad en voor Pilatus",
        stap: "jezus-3:nt-lijden:3",
        t: "Als het dag wordt, staat de Heere Jezus voor de raad. Ze vragen: ‘Zijt Gij dan de Zoon Gods?’ Hij antwoordt: ‘Gij zegt, dat Ik het ben.’ Dan brengen ze Hem naar Pilatus, de stadhouder. Ze beschuldigen Hem: Hij zegt dat Hij Christus, de Koning, is. Pilatus ondervraagt Hem en zegt: ‘Ik vind geen schuld in dezen Mens.’",
      },
      {
        kop: "Naar Herodes en terug",
        stap: "jezus-3:nt-lijden:4",
        t: "Pilatus hoort dat de Heere Jezus uit Galilea komt. Daarom stuurt hij Hem naar Herodes, die over Galilea regeert. Herodes is blij: hij hoopt een teken te zien. Maar de Heere Jezus antwoordt hem niets. Herodes en zijn soldaten bespotten Hem en sturen Hem terug. Die dag worden Pilatus en Herodes vrienden.",
      },
      {
        kop: "Barabbas of de Heere Jezus",
        stap: "jezus-3:nt-lijden:5",
        t: "Pilatus wil Hem laten kastijden (slaan) en loslaten. Maar de menigte roept: ‘Weg met Dezen, en laat ons Bar-abbas los.’ Barabbas zit gevangen om oproer en doodslag. Dan roepen ze: ‘Kruis Hem, kruis Hem!’ Driemaal zegt Pilatus dat hij geen schuld in Hem vindt, maar hun geroep wordt steeds harder. Dan laat Pilatus Barabbas vrij en geeft de Heere Jezus over aan hun wil.",
      },
    ],
    vragen: [
      {
        q: "Waarvan beschuldigen ze de Heere Jezus bij Pilatus?",
        a: ["Dat Hij zegt dat Hij Christus, de Koning, is", "Dat Hij geld uit de tempel heeft gestolen", "Dat Hij een soldaat heeft gedood"],
        why: "Lukas 23:2",
      },
      {
        q: "Waarom stuurt Pilatus Hem naar Herodes?",
        a: ["Hij komt uit het gebied van Herodes", "Herodes is de hogepriester", "Herodes is de baas van Pilatus"],
        why: "Lukas 23:6–7",
      },
      {
        q: "Waarom is Herodes blij als hij de Heere Jezus ziet?",
        a: ["Hij hoopt een teken van Hem te zien", "Hij wil Hem helpen ontsnappen", "Hij wil Zijn discipel worden"],
        why: "Lukas 23:8",
      },
      { q: "Wie wil de menigte vrij hebben?", a: ["Barabbas", "Petrus", "Judas"], why: "Lukas 23:18" },
      {
        q: "Wat roept de menigte over de Heere Jezus?",
        a: ["Kruis Hem, kruis Hem!", "Laat Hem vrij!", "Stuur Hem naar Rome!"],
        why: "Lukas 23:21",
      },
    ],
  },
  126: {
    status: "concept",
    delen: [
      {
        kop: "Naar Golgotha",
        stap: "jezus-3:nt-lijden:6",
        t: "Pilatus geeft de Heere Jezus over om gekruisigd te worden. De Heere Jezus draagt Zijn kruis naar een plaats dicht bij de stad. In het Hebreeuws heet die plaats Golgotha: Hoofdschedelplaats. Daar kruisigen de soldaten Hem, met twee anderen: aan elke kant één, en de Heere Jezus in het midden. Pilatus zet een opschrift op het kruis: ‘JEZUS, DE NAZARENER, DE KONING DER JODEN’.",
      },
      {
        kop: "Zie, uw moeder",
        t: "Bij het kruis staan Zijn moeder, Maria Magdalena en andere vrouwen. Ook de discipel die de Heere Jezus liefheeft, staat erbij. Tegen Zijn moeder zegt de Heere Jezus: ‘Vrouw, zie, uw zoon.’ En tegen de discipel: ‘Zie, uw moeder.’ Vanaf dat uur neemt die discipel haar in zijn huis.",
      },
      {
        kop: "Het is volbracht",
        stap: "jezus-3:nt-lijden:7",
        t: "Dan zegt de Heere Jezus: ‘Mij dorst.’ Zo wordt de Schrift vervuld. Ze geven Hem edik, een zure drank, met een spons. Dan zegt Hij: ‘Het is volbracht!’ Hij buigt Zijn hoofd en geeft de geest: Hij sterft. Petrus schrijft later waarom: Hij heeft ‘onze zonden in Zijn lichaam gedragen’ (1 Petrus 2:24).",
      },
    ],
    vragen: [
      { q: "Waar kruisigen de soldaten de Heere Jezus?", a: ["Op Golgotha", "Op de Olijfberg", "Bij de Jordaan"], why: "Johannes 19:17–18" },
      {
        q: "Waarom zegt de Heere Jezus: ‘Mij dorst’?",
        a: ["Opdat de Schrift vervuld zou worden", "Omdat Zijn moeder erom vroeg", "Omdat de soldaten het wilden horen"],
        why: "Johannes 19:28",
      },
      {
        q: "Wat doet de discipel die de Heere Jezus liefheeft voor Zijn moeder?",
        a: ["Hij neemt haar in zijn huis", "Hij brengt haar naar Nazareth", "Hij brengt haar naar Petrus"],
        why: "Johannes 19:27",
      },
      {
        q: "Wat zegt de Heere Jezus als laatste, voordat Hij de geest geeft?",
        a: ["Het is volbracht!", "Mij dorst.", "Zie, uw moeder."],
        why: "Johannes 19:26–30",
      },
    ],
  },
  127: {
    status: "concept",
    delen: [
      {
        kop: "Voor de grote sabbat",
        stap: "jezus-3:nt-lijden:8",
        t: "Het is de dag van de voorbereiding, en de sabbat die volgt is een grote dag. De Joden willen niet dat de lichamen op de sabbat aan het kruis blijven. De soldaten breken de benen van de twee anderen. Maar de Heere Jezus is al gestorven, en daarom breken ze Zijn benen niet. Wel steekt een soldaat een speer in Zijn zijde, en meteen komt er bloed en water uit. Zo wordt de Schrift vervuld: ‘Geen been van Hem zal verbroken worden.’",
      },
      {
        kop: "Jozef en Nicodemus",
        t: "Jozef van Arimathea is een discipel van de Heere Jezus, maar in het geheim, omdat hij bang is voor de Joden. Hij vraagt Pilatus om het lichaam, en Pilatus staat het toe. Ook Nicodemus komt, met ongeveer honderd pond mirre en aloë: geurige specerijen. Samen wikkelen ze het lichaam met de specerijen in linnen doeken, zoals de Joden gewend zijn bij een begrafenis.",
      },
      {
        kop: "Een nieuw graf in een hof",
        stap: "jezus-3:nt-lijden:8",
        t: "Bij de plaats van de kruisiging is een hof, een tuin, met een nieuw graf. Daar heeft nog nooit iemand in gelegen. Omdat het graf dichtbij is en de sabbat bijna begint, leggen ze de Heere Jezus daar.",
      },
    ],
    vragen: [
      {
        q: "Waarom wilden de Joden dat de lichamen werden weggehaald?",
        a: ["Ze mochten op de sabbat niet aan het kruis blijven", "Pilatus had dat zo bevolen", "De soldaten wilden naar huis"],
        why: "Johannes 19:31",
      },
      {
        q: "Welk Schriftwoord werd vervuld doordat ze Zijn benen niet braken?",
        a: ["Geen been van Hem zal verbroken worden", "Zij delen Mijn klederen onder zich", "Mijn God, waarom hebt Gij Mij verlaten"],
        why: "Johannes 19:36",
      },
      {
        q: "Wat bracht Nicodemus mee?",
        a: ["Ongeveer honderd pond mirre en aloë", "Een grote steen voor het graf", "Brood en wijn voor de sabbat"],
        why: "Johannes 19:39",
      },
      {
        q: "Waarom legden ze de Heere Jezus juist in dit graf?",
        a: ["Het was dichtbij en de sabbat begon bijna", "Het was het graf van Zijn familie", "Pilatus had het graf aangewezen"],
        why: "Johannes 19:42",
      },
    ],
  },
  128: {
    status: "concept",
    delen: [
      {
        kop: "Vroeg naar het graf",
        stap: "jezus-3:nt-opstanding:0",
        t: "Na de sabbat, als het licht begint te worden op de eerste dag van de week, gaan Maria Magdalena en de andere Maria het graf bekijken. Het graf wordt bewaakt. De overpriesters hebben de steen laten verzegelen en er een wacht bij gezet, zodat de discipelen het lichaam niet kunnen stelen (Mattheüs 27:62–66).",
      },
      {
        kop: "Een engel op de steen",
        t: "Dan komt er een grote aardbeving. Een engel van de Heere daalt uit de hemel neer. Hij rolt de steen van de ingang weg en gaat erop zitten. Hij ziet eruit als een bliksem, en zijn kleding is wit als sneeuw. De wachters worden zo bang dat ze als doden zijn.",
      },
      {
        kop: "Hij is opgestaan",
        t: "De engel zegt tegen de vrouwen: ‘Vreest gijlieden niet’. Dat betekent: wees niet bang. ‘Hij is hier niet; want Hij is opgestaan, gelijk Hij gezegd heeft.’ Hij laat hun de plaats zien waar de Heere gelegen heeft. Ze moeten het snel aan de discipelen vertellen: de Heere Jezus gaat hen voor naar Galilea. Met vrees en grote blijdschap lopen de vrouwen weg.",
      },
    ],
    vragen: [
      {
        q: "Waarom stond er een wacht bij het graf?",
        a: [
          "De overpriesters wilden niet dat het lichaam gestolen werd",
          "De vrouwen hadden erom gevraagd",
          "Jozef wilde zijn graf laten bewaken",
        ],
        why: "Mattheüs 27:62–66",
      },
      {
        q: "Wat deed de engel nadat hij de steen had weggerold?",
        a: ["Hij ging erop zitten", "Hij brak hem in stukken", "Hij zette hem weer terug"],
        why: "Mattheüs 28:2",
      },
      {
        q: "Waarom hoefden de vrouwen niet bang te zijn?",
        a: ["De Heere Jezus was opgestaan", "De wachters waren weggelopen", "Pilatus had het graf laten openen"],
        why: "Mattheüs 28:5–6",
      },
      {
        q: "Hoe liepen de vrouwen weg van het graf?",
        a: ["Haastig, met vrees en grote blijdschap", "Langzaam en heel verdrietig", "Boos, omdat het graf leeg was"],
        why: "Mattheüs 28:8",
      },
    ],
  },
  129: {
    status: "concept",
    delen: [
      {
        kop: "De vrouwen ontmoeten Hem",
        stap: "jezus-3:nt-opstanding:0",
        t: "Mattheüs vertelt: als de vrouwen van het graf weggaan, komt de Heere Jezus hen tegemoet. ‘Weest gegroet!’ zegt Hij. Ze grijpen Zijn voeten en aanbidden Hem. Hij stuurt hen naar Zijn broeders: die moeten naar Galilea gaan, daar zullen ze Hem zien.",
      },
      {
        kop: "Het graf is leeg",
        stap: "jezus-3:nt-opstanding:1",
        t: "Johannes vertelt over Maria Magdalena. Vroeg, als het nog donker is, ziet ze dat de steen van het graf weg is. Ze rent naar Simon Petrus en de andere discipel. Die twee rennen naar het graf. Ze zien de linnen doeken liggen, en de zweetdoek apart opgerold.",
      },
      {
        kop: "Hij noemt haar naam",
        t: "Maria blijft huilend bij het graf staan. Dan ziet ze de Heere Jezus, maar ze herkent Hem niet. Ze denkt dat Hij de hovenier is, de tuinman. Dan zegt Hij: ‘Maria!’ Zij zegt: ‘Rabbouni’, dat betekent: Meester. Ze gaat naar de discipelen en vertelt dat ze de Heere gezien heeft.",
      },
      {
        kop: "Geld voor de soldaten",
        t: "Intussen vertellen soldaten van de wacht aan de overpriesters wat er gebeurd is. Die geven hun veel geld. Ze moeten zeggen dat de discipelen het lichaam ’s nachts gestolen hebben, terwijl zij sliepen.",
      },
    ],
    vragen: [
      {
        q: "Wat zei de Heere Jezus toen Hij de vrouwen tegemoet kwam?",
        a: ["Weest gegroet!", "Vrede zij ulieden!", "Raak Mij niet aan!"],
        why: "Mattheüs 28:9",
      },
      {
        q: "Waarom huilde Maria bij het graf?",
        a: ["Ze dacht dat iemand de Heere had weggenomen", "De engelen hadden haar weggestuurd", "Petrus wilde haar niet meenemen"],
        why: "Johannes 20:13",
      },
      {
        q: "Wanneer herkende Maria de Heere Jezus?",
        a: ["Toen Hij haar naam noemde", "Toen ze de engelen zag", "Toen Hij het brood brak"],
        why: "Johannes 20:16",
      },
      {
        q: "Waarom gaven de overpriesters de soldaten veel geld?",
        a: [
          "Ze moesten zeggen dat het lichaam gestolen was",
          "Ze moesten het graf langer bewaken",
          "Ze moesten de discipelen gevangennemen",
        ],
        why: "Mattheüs 28:12–13",
      },
    ],
  },
  130: {
    status: "concept",
    delen: [
      {
        kop: "Verdrietig onderweg",
        stap: "jezus-3:nt-opstanding:2",
        t: "Op dezelfde dag lopen twee discipelen van Jeruzalem naar het dorp Emmaüs. Onderweg komt de Heere Jezus Zelf bij hen lopen. Maar hun ogen worden gehouden: ze herkennen Hem niet. Kleopas vertelt Hem over Jezus van Nazareth, Die gekruisigd is. ‘En wij hoopten, dat Hij was Degene, Die Israël verlossen zou.’ Nu zeggen vrouwen dat ze engelen gezien hebben, die zeggen dat Hij leeft.",
      },
      {
        kop: "De Schriften geopend",
        t: "De Heere Jezus zegt: ‘Moest de Christus niet deze dingen lijden, en alzo in Zijn heerlijkheid ingaan?’ Hij begint bij Mozes en alle profeten, en legt uit wat er in de Schriften over Hem geschreven staat.",
      },
      {
        kop: "Het brood gebroken",
        stap: "jezus-3:nt-opstanding:2",
        t: "Bij Emmaüs vragen ze: ‘Blijf met ons; want het is bij den avond.’ Aan tafel neemt Hij het brood, zegent het, breekt het en geeft het hun. Dan gaan hun ogen open en herkennen ze Hem, en Hij verdwijnt uit hun gezicht. Meteen gaan ze terug naar Jeruzalem. Daar horen ze van de elf: ‘De Heere is waarlijk opgestaan, en is van Simon gezien.’",
      },
    ],
    vragen: [
      {
        q: "Waarom herkenden de twee de Heere Jezus eerst niet?",
        a: ["Hun ogen werden gehouden", "Het was al te donker", "Hij liep ver voor hen uit"],
        why: "Lukas 24:16",
      },
      {
        q: "Wat hadden de twee gehoopt?",
        a: ["Dat Hij Israël zou verlossen", "Dat Hij in Emmaüs zou wonen", "Dat Hij hen naar huis zou brengen"],
        why: "Lukas 24:21",
      },
      {
        q: "Wat deed de Heere Jezus aan tafel?",
        a: ["Hij nam het brood, zegende het en brak het", "Hij schonk voor iedereen wijn in", "Hij waste hun de voeten"],
        why: "Lukas 24:30",
      },
      {
        q: "Wat hoorden de twee in Jeruzalem van de elf?",
        a: ["De Heere is opgestaan en door Simon gezien", "Thomas had de Heere al gezien", "Het graf was weer gesloten"],
        why: "Lukas 24:33–34",
      },
    ],
  },
  131: {
    status: "concept",
    delen: [
      {
        kop: "Vrede zij ulieden",
        stap: "jezus-3:nt-opstanding:3",
        t: "Op de avond van de eerste dag van de week zijn de discipelen bij elkaar. De deuren zijn dicht, want ze zijn bang voor de Joden. Dan komt de Heere Jezus en staat in hun midden: ‘Vrede zij ulieden!’ Hij laat Zijn handen en Zijn zijde zien, en de discipelen worden blij. Hij blaast op hen en zegt: ‘Ontvangt den Heiligen Geest.’",
      },
      {
        kop: "Thomas wil het zien",
        stap: "jezus-3:nt-opstanding:4",
        t: "Thomas, een van de twaalf, is er niet bij. De anderen zeggen: ‘Wij hebben den Heere gezien.’ Maar Thomas wil het teken van de nagels in Zijn handen zien, en zijn vinger erin steken, en zijn hand in Zijn zijde. Anders zal hij het niet geloven.",
      },
      {
        kop: "Mijn Heere en mijn God",
        t: "Acht dagen later is Thomas erbij. De Heere Jezus staat weer in hun midden en zegt tegen Thomas: ‘zijt niet ongelovig, maar gelovig.’ Thomas antwoordt: ‘Mijn Heere en mijn God!’ Dan zegt de Heere Jezus: ‘zalig zijn zij, die niet zullen gezien hebben, en nochtans zullen geloofd hebben.’ Johannes schrijft dit op, ‘opdat gij gelooft, dat Jezus is de Christus, de Zone Gods’.",
      },
    ],
    vragen: [
      {
        q: "Wat zei de Heere Jezus toen Hij op de discipelen blies?",
        a: ["Ontvangt den Heiligen Geest", "Werpt het net aan de rechterzijde", "Blijf met ons, want het is avond"],
        why: "Johannes 20:22",
      },
      {
        q: "Wat wilde Thomas eerst zien en voelen?",
        a: ["Het teken van de nagels in Zijn handen", "Het lege graf in de hof", "De engelen in witte klederen"],
        why: "Johannes 20:25",
      },
      {
        q: "Wat zei Thomas toen hij de Heere Jezus zag?",
        a: ["Mijn Heere en mijn God!", "Rabbouni!", "Het is de Heere!"],
        why: "Johannes 20:28",
      },
      {
        q: "Waarom heeft Johannes dit opgeschreven?",
        a: ["Opdat wij geloven dat Jezus de Christus is", "Opdat niemand Thomas zou vergeten", "Omdat Thomas hem dat gevraagd had"],
        why: "Johannes 20:31",
      },
    ],
  },
  132: {
    status: "concept",
    delen: [
      {
        kop: "Een nacht zonder vis",
        stap: "jezus-3:nt-opstanding:5",
        t: "Daarna laat de Heere Jezus Zich weer zien aan de zee van Tiberias. Simon Petrus is daar met zes andere discipelen, onder wie Thomas en Nathanaël. ‘Ik ga vissen’, zegt Petrus, en de anderen gaan mee. Maar die nacht vangen ze niets.",
      },
      {
        kop: "Het is de Heere",
        t: "’s Morgens staat de Heere Jezus op de oever, maar ze weten niet dat Hij het is. Hij zegt dat ze het net aan de rechterzijde van het schip moeten werpen. Nu kunnen ze het net niet meer binnenhalen, zoveel vis zit erin. De discipel die de Heere Jezus liefheeft, zegt: ‘Het is de Heere!’ Petrus springt in het water. Op de oever ligt een kolenvuur met vis en brood. In het net zitten honderddrieënvijftig grote vissen, en toch scheurt het niet.",
      },
      {
        kop: "Hebt gij Mij lief",
        stap: "jezus-3:nt-opstanding:6",
        t: "Na de maaltijd vraagt de Heere Jezus drie keer aan Petrus of hij Hem liefheeft. De derde keer wordt Petrus bedroefd: ‘Heere! Gij weet alle dingen, Gij weet, dat ik U liefheb.’ Elke keer krijgt Petrus de opdracht om voor Zijn lammeren en schapen te zorgen, als een herder. Dan zegt de Heere Jezus: ‘Volg Mij.’",
      },
    ],
    vragen: [
      {
        q: "Wat moesten de discipelen van de Heere Jezus doen?",
        a: ["Het net aan de rechterzijde van het schip werpen", "Naar huis gaan en gaan slapen", "Verder de zee op varen"],
        why: "Johannes 21:6",
      },
      {
        q: "Hoeveel grote vissen zaten er in het net?",
        a: ["Honderddrieënvijftig", "Honderdtwintig", "Tweehonderd"],
        why: "Johannes 21:11",
      },
      {
        q: "Waarom werd Petrus bedroefd?",
        a: ["Omdat de Heere het hem voor de derde keer vroeg", "Omdat ze die nacht niets gevangen hadden", "Omdat het net was gescheurd"],
        why: "Johannes 21:17",
      },
      {
        q: "Wat zei de Heere Jezus aan het eind tegen Petrus?",
        a: ["Volg Mij", "Ga terug naar uw netten", "Blijf in Jeruzalem"],
        why: "Johannes 21:19",
      },
    ],
  },
  133: {
    status: "concept",
    delen: [
      {
        kop: "Veertig dagen",
        t: "Na Zijn lijden laat de Heere Jezus Zich veertig dagen lang levend zien aan de apostelen. Hij spreekt met hen over het Koninkrijk van God. Ze moeten in Jeruzalem blijven en wachten op de belofte van de Vader: ze zullen met de Heilige Geest gedoopt worden.",
      },
      {
        kop: "Mijn getuigen",
        stap: "jezus-3:nt-opstanding:8",
        t: "Ze vragen of Hij nu het koninkrijk voor Israël zal herstellen. Hij antwoordt dat het niet aan hen is om de tijden te weten die de Vader in Zijn macht heeft. Ze zullen de kracht van de Heilige Geest ontvangen: ‘gij zult Mijn getuigen zijn, zo te Jeruzalem, als in geheel Judea en Samaria, en tot aan het uiterste der aarde.’ Een getuige vertelt wat hij gezien heeft.",
      },
      {
        kop: "Opgenomen in de hemel",
        stap: "jezus-3:nt-opstanding:8",
        t: "Terwijl ze kijken, wordt Hij opgenomen, en een wolk neemt Hem weg. Dan staan er twee mannen in witte kleding bij hen. Zij zeggen dat deze Jezus op dezelfde manier zal terugkomen. Ze gaan van de Olijfberg terug naar Jeruzalem, naar de opperzaal, een bovenkamer. Daar blijven ze eensgezind bidden, met de vrouwen, met Maria, de moeder van de Heere Jezus, en met Zijn broers.",
      },
    ],
    vragen: [
      {
        q: "Hoe lang liet de Heere Jezus Zich na Zijn lijden levend zien?",
        a: ["Veertig dagen", "Zeven dagen", "Een heel jaar"],
        why: "Handelingen 1:3",
      },
      {
        q: "Wat vroegen de apostelen aan de Heere Jezus?",
        a: [
          "Of Hij nu het koninkrijk voor Israël zou herstellen",
          "Of zij met Hem mee mochten naar de hemel",
          "Of zij terug moesten gaan naar Galilea",
        ],
        why: "Handelingen 1:6",
      },
      {
        q: "Waarom moesten de apostelen in Jeruzalem blijven?",
        a: ["Ze moesten wachten op de belofte van de Vader", "Ze moesten de tempel weer opbouwen", "Ze moesten eerst nog naar Pilatus"],
        why: "Handelingen 1:4–5",
      },
      {
        q: "Wat deden ze in de opperzaal?",
        a: ["Ze bleven eensgezind bidden", "Ze kozen een nieuwe koning", "Ze schreven het evangelie op"],
        why: "Handelingen 1:13–14",
      },
    ],
  },
  134: {
    status: "concept",
    delen: [
      {
        kop: "Wachten in Jeruzalem",
        stap: "handelingen:nt-gemeente:0",
        t: "De Heere Jezus had gezegd dat de discipelen in Jeruzalem moesten wachten op de belofte van de Vader (Handelingen 1:4). Dan is het de dag van het Pinksterfeest. Dat feest valt vijftig dagen na het Pascha. De discipelen zijn allemaal eensgezind bij elkaar.",
      },
      {
        kop: "Wind en vuur",
        t: "Plotseling komt er uit de hemel een geluid als van een harde, stormachtige wind. Het vult het hele huis waar ze zitten. Ze zien tongen als van vuur, die zich verdelen en op ieder van hen komen. Ze worden allemaal vervuld met de Heilige Geest. Ze beginnen te spreken in andere talen, zoals de Geest het hun geeft.",
      },
      {
        kop: "Ieder in zijn eigen taal",
        t: "In Jeruzalem wonen godvrezende Joden uit veel landen, van Parthië en Egypte tot Rome, Kreta en Arabië. Ze komen erop af en horen de discipelen in hun eigen taal spreken over ‘de grote werken Gods’. Ze zijn verbaasd: zijn dit niet allemaal Galileërs? Maar anderen spotten: ‘Zij zijn vol zoeten wijns.’ Daarmee bedoelen ze: ze zijn dronken.",
      },
    ],
    vragen: [
      {
        q: "Wie geeft de discipelen de woorden die ze spreken?",
        a: ["De Heilige Geest", "Petrus", "De mensen uit Rome"],
        why: "Handelingen 2:4",
      },
      {
        q: "Waarom zijn de mensen uit al die landen zo verbaasd?",
        a: ["Ieder hoort hen in zijn eigen taal", "De discipelen zingen in de tempel", "Er staat een engel bij het huis"],
        why: "Handelingen 2:6–8",
      },
      {
        q: "Wat gebeurt er eerst?",
        a: ["Een geluid als van wind", "Spreken in andere talen", "De menigte komt samen"],
        why: "Handelingen 2:2–6",
      },
      {
        q: "Wat bedoelen de spotters met ‘vol zoeten wijns’?",
        a: ["Dat de discipelen dronken zijn", "Dat de discipelen honger hebben", "Dat de discipelen moe zijn"],
        why: "Handelingen 2:13, 15",
      },
    ],
  },
  135: {
    status: "concept",
    delen: [
      {
        kop: "Niet dronken",
        stap: "handelingen:nt-gemeente:1",
        t: "Petrus gaat staan met de elf andere apostelen en spreekt de menigte toe. ‘Deze zijn niet dronken’, zegt hij, ‘want het is eerst de derde ure van de dag.’ Dat is in de ochtend. Wat hier gebeurt, had God beloofd door de profeet Joël: Hij zou Zijn Geest uitstorten op alle vlees.",
      },
      {
        kop: "God heeft Hem opgewekt",
        t: "Dan spreekt Petrus over Jezus van Nazareth, door Wie God krachten, wonderen en tekenen deed. Petrus zegt: jullie hebben Hem aan het kruis laten doden. Maar ‘Dezen Jezus heeft God opgewekt; waarvan wij allen getuigen zijn.’ Een getuige is iemand die het zelf gezien heeft. Nu is Hij door God verhoogd, en Hij heeft de Heilige Geest uitgestort.",
      },
      {
        kop: "Geraakt in het hart",
        t: "De mensen worden verslagen in het hart en vragen: ‘Wat zullen wij doen mannen broeders?’ Petrus antwoordt: ‘Bekeert u, en een iegelijk van u worde gedoopt in den Naam van Jezus Christus, tot vergeving der zonden’. Die dag worden ongeveer drieduizend mensen gedoopt. Ze blijven bij de leer van de apostelen, de gemeenschap, het breken van het brood en de gebeden.",
      },
    ],
    vragen: [
      {
        q: "Welke reden geeft Petrus dat de discipelen niet dronken zijn?",
        a: ["Het is pas het derde uur van de dag", "Ze hebben alleen water gedronken", "Ze komen net uit de tempel"],
        why: "Handelingen 2:15",
      },
      {
        q: "Wat zegt Petrus dat God met de Heere Jezus gedaan heeft?",
        a: ["Hem opgewekt uit de doden", "Hem naar Galilea gestuurd", "Hem in de tempel laten wonen"],
        why: "Handelingen 2:24, 32",
      },
      {
        q: "Waarom vragen de mensen wat ze moeten doen?",
        a: ["De woorden van Petrus raken hun hart", "Ze willen ook in talen spreken", "Ze zijn bang voor de Romeinen"],
        why: "Handelingen 2:37",
      },
      {
        q: "Wat gebeurt er met wie het woord van Petrus aanneemt?",
        a: ["Ze worden gedoopt", "Ze gaan terug naar huis", "Ze worden apostel"],
        why: "Handelingen 2:41",
      },
    ],
  },
  136: {
    status: "concept",
    delen: [
      {
        kop: "Bij de Schone Poort",
        stap: "handelingen:nt-gemeente:2",
        t: "Petrus en Johannes gaan naar de tempel om te bidden. Bij de poort die de Schone heet, zit een man die vanaf zijn geboorte kreupel is. Hij vraagt om een aalmoes, een gift. Petrus zegt: ‘Zilver en goud heb ik niet, maar hetgeen ik heb, dat geve ik u; in den Naam van Jezus Christus, den Nazarener, sta op en wandel!’ De man springt op en gaat de tempel in, God lovend.",
      },
      {
        kop: "Voor de raad",
        t: "Petrus zegt tegen het volk: niet hun eigen kracht maakte de man gezond, maar het geloof in de Naam van de Heere Jezus. Petrus en Johannes worden gevangengezet. De raad verbiedt hun nog in die Naam te spreken. Maar ze antwoorden: ‘wij kunnen niet laten te spreken, hetgeen wij gezien en gehoord hebben.’",
      },
      {
        kop: "De schaduw van Petrus",
        stap: "handelingen:nt-gemeente:4",
        t: "Zieken worden op straat gelegd, zodat de schaduw van Petrus op hen valt. Weer worden de apostelen gevangengezet, maar ’s nachts opent een engel van de Heere de deuren. Voor de raad zegt Petrus: ‘Men moet Gode meer gehoorzaam zijn, dan den mensen.’ Op raad van Gamaliël laten ze hen gaan, maar eerst worden ze met de zweep geslagen.",
      },
    ],
    vragen: [
      {
        q: "Hoe lang was de man al kreupel?",
        a: ["Vanaf zijn geboorte", "Sinds een paar weken", "Sinds een val bij de tempel"],
        why: "Handelingen 3:2",
      },
      {
        q: "Waardoor is de man volgens Petrus gezond geworden?",
        a: [
          "Door geloof in de Naam van de Heere Jezus",
          "Door de eigen kracht van Petrus en Johannes",
          "Door het geld dat hij die dag kreeg",
        ],
        why: "Handelingen 3:12, 16",
      },
      {
        q: "Waarom worden zieken op de straat gelegd?",
        a: ["Zodat de schaduw van Petrus op hen valt", "Omdat de tempel te vol is", "Omdat ze de stad niet in mogen"],
        why: "Handelingen 5:15",
      },
      { q: "Wie zegt in de raad dat ze de apostelen moeten laten gaan?", a: ["Gamaliël", "Kajafas", "Annas"], why: "Handelingen 5:34–39" },
    ],
  },
  137: {
    status: "concept",
    delen: [
      {
        kop: "Eén van hart en ziel",
        stap: "handelingen:nt-gemeente:3",
        t: "De gelovigen in Jeruzalem zijn één van hart en ziel. Niemand zegt dat iets alleen van hem is. Wie land of een huis heeft, verkoopt het en legt het geld aan de voeten van de apostelen. Daarvan krijgt ieder wat hij nodig heeft. Zo doet ook Joses, een Leviet uit Cyprus. De apostelen noemen hem Barnabas: zoon der vertroosting.",
      },
      {
        kop: "Een deel achtergehouden",
        t: "Ook Ananias en zijn vrouw Saffira verkopen een stuk land. Maar met medeweten van zijn vrouw houdt Ananias een deel van het geld achter. De rest legt hij aan de voeten van de apostelen. Petrus vraagt waarom de satan zijn hart zo vervuld heeft dat hij tegen de Heilige Geest liegt. Het land was van hem, en het geld ook. ‘Gij hebt den mensen niet gelogen, maar Gode.’ Ananias valt neer en sterft.",
      },
      {
        kop: "Grote vrees",
        t: "Ongeveer drie uur later komt Saffira binnen. Ze weet niet wat er gebeurd is. Petrus vraagt of ze het land voor zoveel verkocht hebben. Ze zegt: ‘Ja, voor zoveel.’ Ook zij valt neer en sterft. Over de hele gemeente komt grote vrees.",
      },
    ],
    vragen: [
      { q: "Wat betekent de naam Barnabas?", a: ["Zoon der vertroosting", "Zoon van de wet", "Man van de vrede"], why: "Handelingen 4:36" },
      {
        q: "Wat zegt Petrus over het land en het geld?",
        a: ["Het was van Ananias zelf", "Het hoorde bij de apostelen", "Het was van de tempel"],
        why: "Handelingen 5:4",
      },
      {
        q: "Waarom is wat Ananias deed zo ernstig?",
        a: ["Hij loog tegen de Heilige Geest, tegen God", "Hij gaf minder geld dan de anderen", "Hij kwam te laat bij de apostelen"],
        why: "Handelingen 5:3–4",
      },
      {
        q: "Wat gebeurt er eerst?",
        a: ["Barnabas verkoopt zijn akker", "Ananias valt neer", "Saffira komt binnen"],
        why: "Handelingen 4:36–5:7",
      },
    ],
  },
  138: {
    status: "concept",
    delen: [
      {
        kop: "Zeven mannen om te dienen",
        stap: "handelingen:nt-gemeente:5",
        t: "De gemeente groeit, maar er komt gemopper. De weduwen van de Griekssprekende gelovigen worden vergeten bij het dagelijkse uitdelen. De apostelen willen blijven bij het gebed en het Woord. Daarom kiest de gemeente zeven mannen, vol van de Heilige Geest en wijsheid. Een van hen is Stefanus.",
      },
      {
        kop: "Valse getuigen",
        stap: "handelingen:nt-gemeente:6",
        t: "Stefanus doet grote wonderen. Sommigen twisten met hem, maar ze kunnen niet op tegen de wijsheid en de Geest waarmee hij spreekt. Dan zoeken ze valse getuigen. Die zeggen dat hij lastert: kwaad spreekt over de tempel en de wet. Stefanus moet voor de raad komen. Hij vertelt de geschiedenis van Israël, van Abraham tot Salomo.",
      },
      {
        kop: "De hemel geopend",
        t: "Dan ziet Stefanus de hemel geopend en de Heere Jezus staan aan de rechterhand van God. Ze stoppen hun oren dicht, werpen hem de stad uit en stenigen hem. De getuigen leggen hun kleren aan de voeten van een jongeman, Saulus. Stefanus bidt: ‘Heere Jezus, ontvang mijn geest.’ Op zijn knieën roept hij: ‘Heere, reken hun deze zonde niet toe!’ Dan ontslaapt hij: hij sterft.",
      },
    ],
    vragen: [
      {
        q: "Waarom willen de apostelen het uitdelen niet zelf doen?",
        a: ["Ze willen bij het gebed en het Woord blijven", "Ze hebben geen geld meer om uit te delen", "Ze moeten op reis naar Samaria"],
        why: "Handelingen 6:2–4",
      },
      {
        q: "Wat zeggen de valse getuigen over Stefanus?",
        a: ["Dat hij lastert tegen de tempel en de wet", "Dat hij geld van de weduwen steelt", "Dat hij een soldaat van de keizer is"],
        why: "Handelingen 6:13",
      },
      {
        q: "Waar ziet Stefanus de Heere Jezus staan?",
        a: ["Aan de rechterhand van God", "Bij de poort van Jeruzalem", "Op de Olijfberg"],
        why: "Handelingen 7:55–56",
      },
      { q: "Bij wie leggen de getuigen hun kleren neer?", a: ["Bij Saulus", "Bij Gamaliël", "Bij Filippus"], why: "Handelingen 7:58" },
    ],
  },
  139: {
    status: "concept",
    delen: [
      {
        kop: "Grote blijdschap in Samaria",
        stap: "handelingen:nt-gemeente:7",
        t: "Na de dood van Stefanus worden de gelovigen verstrooid. Filippus, een van de zeven, gaat naar de stad Samaria en predikt daar Christus. Zieken worden genezen, en er is grote blijdschap. Ook de tovenaar Simon laat zich dopen. Maar als hij de gave van God met geld wil kopen, zegt Petrus dat zijn hart niet recht is voor God.",
      },
      {
        kop: "Een kamerling op een wagen",
        stap: "handelingen:nt-gemeente:8",
        t: "Een engel stuurt Filippus naar de weg van Jeruzalem naar Gaza. Daar rijdt een kamerling: een hoge dienaar van Candace, de koningin der Moren. Hij was in Jeruzalem om te aanbidden en leest nu de profeet Jesaja: ‘Hij is gelijk een schaap ter slachting geleid’. Filippus vraagt: ‘Verstaat gij ook, hetgeen gij leest?’",
      },
      {
        kop: "Gedoopt onderweg",
        t: "Filippus begint bij die Schrift en verkondigt hem de Heere Jezus. Bij water zegt de kamerling: ‘Ik geloof, dat Jezus Christus de Zoon van God is.’ Filippus doopt hem. Dan neemt de Geest van de Heere Filippus weg, en de kamerling reist met blijdschap verder. Filippus komt in Azote (Asdod) en predikt in alle steden, tot hij in Caesarea komt.",
      },
    ],
    vragen: [
      {
        q: "Waarom heeft Simon geen deel aan dit woord, zegt Petrus?",
        a: ["Zijn hart is niet recht voor God", "Hij komt niet uit Jeruzalem", "Hij is nog niet gedoopt"],
        why: "Handelingen 8:13, 21",
      },
      {
        q: "Wie stuurt Filippus naar de weg naar Gaza?",
        a: ["Een engel van de Heere", "Petrus en Johannes", "De kamerling zelf"],
        why: "Handelingen 8:26",
      },
      {
        q: "Waarom was de kamerling in Jeruzalem geweest?",
        a: ["Om te aanbidden", "Om koren te kopen", "Om de koning te spreken"],
        why: "Handelingen 8:27",
      },
      {
        q: "Over Wie gaat de tekst uit Jesaja, volgens Filippus?",
        a: ["Over de Heere Jezus", "Over Jesaja zelf", "Over koning David"],
        why: "Handelingen 8:34–35",
      },
    ],
  },
  140: {
    status: "concept",
    delen: [
      {
        kop: "Eneas in Lydda",
        stap: "handelingen:nt-gemeente:9",
        t: "Petrus reist rond en komt bij de gelovigen in Lydda. Daar ligt Eneas, die verlamd is, al acht jaar op bed. Petrus zegt: ‘Eneas! Jezus Christus maakt u gezond; sta op en spreid uzelven het bed.’ Meteen staat hij op. Iedereen in Lydda en Sarona ziet het, en ze bekeren zich tot de Heere.",
      },
      {
        kop: "Tabitha in Joppe",
        stap: "handelingen:nt-gemeente:10",
        t: "In Joppe, vlak bij Lydda, woont een discipelin: een vrouw die de Heere Jezus volgt. Ze heet Tabitha, in het Grieks Dorkas. Ze doet veel goede werken en geeft veel aalmoezen. Dan wordt ze ziek en sterft. Ze wassen haar en leggen haar in de opperzaal, een kamer boven in het huis. De discipelen sturen twee mannen naar Petrus: kom zonder uitstel.",
      },
      {
        kop: "Tabitha, sta op",
        t: "Als Petrus komt, staan alle weduwen te huilen. Ze laten de rokken en kleren zien die Dorkas gemaakt heeft. Petrus stuurt hen allemaal naar buiten, knielt en bidt. Dan zegt hij: ‘Tabitha, sta op!’ Ze doet haar ogen open en gaat overeind zitten. Petrus laat haar levend zien aan de gelovigen en de weduwen. In heel Joppe wordt het bekend, en velen geloven in de Heere.",
      },
    ],
    vragen: [
      { q: "Wie maakt Eneas gezond, zegt Petrus?", a: ["Jezus Christus", "Petrus zelf", "De gelovigen in Lydda"], why: "Handelingen 9:34" },
      {
        q: "Waarom sturen de discipelen twee mannen naar Lydda?",
        a: ["Petrus is daar, vlak bij Joppe", "Daar wonen de weduwen", "Daar willen ze kleren verkopen"],
        why: "Handelingen 9:38",
      },
      {
        q: "Wat laten de weduwen aan Petrus zien?",
        a: ["Rokken en kleren die Dorkas maakte", "Het geld dat ze van haar kregen", "Een brief die Dorkas schreef"],
        why: "Handelingen 9:39",
      },
      {
        q: "Wat gebeurt er nadat Tabitha weer leeft?",
        a: ["Velen in Joppe gaan geloven", "Petrus vertrekt meteen naar Jeruzalem", "De weduwen verlaten Joppe"],
        why: "Handelingen 9:42–43",
      },
    ],
  },
  141: {
    status: "concept",
    delen: [
      {
        kop: "Een hoofdman in Caesarea",
        stap: "handelingen:nt-gemeente:11",
        t: "In Caesarea woont Cornelius, een hoofdman over honderd soldaten. Hij vreest God, geeft veel aalmoezen en bidt steeds. Een engel zegt: ‘Uw gebeden en uw aalmoezen zijn tot gedachtenis opgekomen voor God.’ Cornelius moet Simon Petrus uit Joppe laten halen.",
      },
      {
        kop: "Een laken uit de hemel",
        t: "Intussen bidt Petrus op het dak in Joppe. Hij ziet iets als een groot linnen laken uit de hemel neerdalen, vol dieren en vogels. Een stem zegt: ‘Sta op, Petrus! slacht en eet.’ Petrus weigert: hij heeft nooit iets onreins gegeten. De stem zegt: ‘Hetgeen God gereinigd heeft, zult gij niet gemeen maken.’ Dit gebeurt drie keer. Dan staan de mannen van Cornelius aan de poort.",
      },
      {
        kop: "Ook voor de heidenen",
        t: "In Caesarea zegt Petrus: ‘Ik verneem in der waarheid, dat God geen aannemer des persoons is’. Dat wil zeggen: God trekt niemand voor. Terwijl hij nog over de Heere Jezus spreekt, valt de Heilige Geest op allen die luisteren. Ze worden gedoopt. In Jeruzalem zeggen de gelovigen: ‘Zo heeft dan God ook den heidenen de bekering gegeven ten leven!’ Heidenen zijn niet-Joden.",
      },
    ],
    vragen: [
      {
        q: "Waarom laat Cornelius Petrus halen?",
        a: ["Een engel heeft het hem gezegd", "Petrus is familie van hem", "Hij wil een huis kopen in Joppe"],
        why: "Handelingen 10:3–5",
      },
      {
        q: "Waarom weigert Petrus te slachten en te eten?",
        a: ["Hij heeft nooit iets onreins gegeten", "Hij heeft net al gegeten", "Hij wil eerst naar huis"],
        why: "Handelingen 10:10, 14",
      },
      {
        q: "Wat betekent: God is geen aannemer des persoons?",
        a: ["God trekt niemand voor", "God neemt geen mensen aan", "God kent de mensen niet"],
        why: "Handelingen 10:34–35",
      },
      {
        q: "Wat gebeurt er eerst?",
        a: ["Cornelius ziet een engel", "Petrus ziet het laken", "De mannen staan aan de poort"],
        why: "Handelingen 10:3–17",
      },
    ],
  },
  142: {
    status: "concept",
    delen: [
      {
        kop: "Petrus in de gevangenis",
        stap: "handelingen:nt-gemeente:13",
        t: "Koning Herodes laat Jakobus, de broer van Johannes, doden met het zwaard. Omdat de Joden dat goed vinden, laat hij ook Petrus gevangennemen. Vier wachten van elk vier soldaten bewaken hem. Maar de gemeente bidt steeds tot God voor hem.",
      },
      {
        kop: "Een engel in de nacht",
        t: "In de nacht slaapt Petrus tussen twee soldaten, gebonden met twee kettingen. Dan staat er een engel van de Heere, en er schijnt licht. De engel stoot hem aan: ‘Sta haastelijk op.’ De kettingen vallen af. De ijzeren poort gaat vanzelf voor hen open. Petrus denkt eerst dat hij een gezicht ziet. Maar op straat weet hij zeker: de Heere heeft hem verlost.",
      },
      {
        kop: "Rhode aan de deur",
        t: "Petrus klopt aan bij het huis van Maria, de moeder van Johannes Markus. Daar bidden veel mensen. Rhode herkent zijn stem, maar van blijdschap doet ze niet open. Binnen geloven ze haar niet. Pas als ze opendoen, zien ze Petrus.",
      },
      {
        kop: "Herodes geeft God de eer niet",
        stap: "handelingen:nt-gemeente:14",
        t: "Later laat Herodes zich in Caesarea toejuichen als een god. Meteen slaat een engel van de Heere hem, omdat hij God de eer niet geeft, en hij sterft. Maar het Woord van God groeit.",
      },
    ],
    vragen: [
      {
        q: "Waarom liet Herodes ook Petrus gevangennemen?",
        a: ["Hij zag dat de Joden het goed vonden", "Petrus had de soldaten aangevallen", "Petrus wilde uit Jeruzalem vluchten"],
        why: "Handelingen 12:3",
      },
      {
        q: "Wat dacht Petrus eerst toen de engel hem wegleidde?",
        a: ["Dat hij een gezicht zag", "Dat het een soldaat was", "Dat Herodes hem vrijliet"],
        why: "Handelingen 12:9",
      },
      {
        q: "Hoe ging de ijzeren poort naar de stad open?",
        a: ["Vanzelf", "Met een sleutel van de engel", "Een soldaat deed hem open"],
        why: "Handelingen 12:10",
      },
      {
        q: "Waarom sloeg de engel van de Heere koning Herodes?",
        a: ["Hij gaf God de eer niet", "Hij had Petrus laten ontsnappen", "Hij wilde geen vrede sluiten"],
        why: "Handelingen 12:23",
      },
    ],
  },
  143: {
    status: "concept",
    delen: [
      {
        kop: "Een licht op de weg",
        stap: "handelingen:nt-paulus:0",
        t: "Saulus wil de discipelen van de Heere gevangennemen. Hij vraagt de hogepriester om brieven voor de synagogen in Damascus: gebedshuizen van de Joden. Vlak bij de stad schijnt er een licht uit de hemel om hem heen. Hij valt op de grond en hoort: ‘Saul, Saul! wat vervolgt gij Mij?’ Vervolgen is: achternazitten en kwaad doen. Hij vraagt: ‘Wie zijt Gij, Heere?’ ‘Ik ben Jezus, Dien gij vervolgt.’",
      },
      {
        kop: "Drie dagen blind",
        t: "Saulus staat op, maar hij ziet niets. Hij wordt Damascus binnengeleid. Drie dagen eet en drinkt hij niet.",
      },
      {
        kop: "Saul, broeder",
        stap: "handelingen:nt-paulus:1",
        t: "De Heere stuurt Ananias naar hem toe, ‘want zie, hij bidt’. Ananias weet wat Saulus gedaan heeft. Maar de Heere heeft Saulus uitgekozen om Zijn Naam bekend te maken, ook aan de heidenen, de niet-Joden. Ananias legt hem de handen op. Er valt iets als schubben van zijn ogen; hij ziet weer en wordt gedoopt.",
      },
      {
        kop: "Van vervolger tot prediker",
        t: "Meteen predikt Saulus in de synagogen dat Jezus de Zoon van God is. Iedereen is verbaasd. Later willen de Joden hem doden. Maar de discipelen laten hem ’s nachts in een mand langs de muur zakken.",
      },
    ],
    vragen: [
      {
        q: "Waarom wilde Saulus naar Damascus?",
        a: ["Om gelovigen gebonden naar Jeruzalem te brengen", "Om daar in de synagogen te preken", "Om de discipel Ananias te bezoeken"],
        why: "Handelingen 9:2",
      },
      {
        q: "Wat zei de Heere tegen Ananias over Saulus?",
        a: ["Dat Hij hem had uitgekozen", "Dat Ananias hem moest binden", "Dat Saulus terug moest naar Jeruzalem"],
        why: "Handelingen 9:15",
      },
      {
        q: "Wat deed Saulus in de drie dagen in Damascus?",
        a: ["Hij at en dronk niet en bad", "Hij preekte in de synagogen", "Hij reisde terug naar Jeruzalem"],
        why: "Handelingen 9:9, 11",
      },
      {
        q: "Waarom waren de mensen in de synagogen zo verbaasd?",
        a: ["Saulus had de gelovigen eerst vervolgd", "Saulus sprak in een vreemde taal", "Saulus was nog steeds blind"],
        why: "Handelingen 9:21",
      },
    ],
  },
  144: {
    status: "concept",
    delen: [
      {
        kop: "Barnabas neemt het voor Saulus op",
        stap: "handelingen:nt-paulus:2",
        t: "In Jeruzalem zijn de discipelen bang voor Saulus. Barnabas neemt hem mee naar de apostelen. Later haalt Barnabas hem uit Tarsus naar Antiochië. Daar worden de discipelen voor het eerst christenen genoemd.",
      },
      {
        kop: "Uitgezonden naar Cyprus",
        stap: "handelingen:nt-paulus:4",
        t: "De Heilige Geest zegt: ‘Zondert Mij af beiden Barnabas en Saulus’. Afzonderen is: apart zetten voor een taak. Ze varen naar Cyprus. In Pafos werkt de tovenaar Elymas hen tegen. Hij wordt een tijd blind, en de stadhouder gaat geloven.",
      },
      {
        kop: "Goden of mensen",
        stap: "handelingen:nt-paulus:6",
        t: "In Antiochië in Pisidië en Ikonium geloven velen, maar er komt ook vervolging. In Lystre geneest Paulus een man die nog nooit gelopen heeft. De mensen denken dat de twee goden zijn en willen hun offeren. Maar die roepen: ‘Wij zijn ook mensen’. Dan komen er Joden uit andere steden. Paulus wordt gestenigd: met stenen bekogeld, tot men denkt dat hij dood is. Maar hij staat op.",
      },
      {
        kop: "De deur van het geloof",
        stap: "handelingen:nt-paulus:7",
        t: "Toch gaan ze terug langs dezelfde steden en versterken de gelovigen. In Antiochië vertellen ze dat God voor de heidenen, de niet-Joden, de deur van het geloof heeft geopend.",
      },
    ],
    vragen: [
      {
        q: "Waarom waren de discipelen in Jeruzalem bang voor Saulus?",
        a: ["Ze geloofden niet dat hij een discipel was", "Hij was met soldaten gekomen", "Hij had een tovenaar bij zich"],
        why: "Handelingen 9:26",
      },
      {
        q: "Wie stuurde Barnabas en Saulus op reis?",
        a: ["De Heilige Geest", "De keizer in Rome", "De stadhouder van Cyprus"],
        why: "Handelingen 13:2–4",
      },
      {
        q: "Wat gebeurde er met de tovenaar Elymas?",
        a: ["Hij werd voor een tijd blind", "Hij ging met hen mee op reis", "Hij werd de nieuwe stadhouder"],
        why: "Handelingen 13:11",
      },
      {
        q: "Waarom dachten de mensen in Lystre dat Paulus en Barnabas goden waren?",
        a: ["Paulus had een kreupele man genezen", "Ze droegen koninklijke kleren", "Ze kwamen met een schip uit Cyprus"],
        why: "Handelingen 14:8–11",
      },
    ],
  },
  145: {
    status: "concept",
    delen: [
      {
        kop: "Een man uit Macedonië",
        stap: "handelingen:nt-paulus:8",
        t: "Paulus wil de gemeenten van de eerste reis bezoeken. Barnabas wil Johannes Markus meenemen, maar Paulus niet, omdat die hen eerder verlaten had. Ze gaan uit elkaar. Paulus reist met Silas, en in Lystre gaat Timotheüs mee. De Heilige Geest laat hen niet in Asia prediken. In Troas ziet Paulus ’s nachts een Macedonische man die smeekt: ‘Kom over in Macedonië, en help ons.’",
      },
      {
        kop: "Lydia bij de rivier",
        stap: "handelingen:nt-paulus:9",
        t: "Ze varen naar Filippi in Macedonië. Op de sabbat gaan ze naar de rivier, waar gebeden wordt, en spreken met de vrouwen daar. Lydia verkoopt purper, dure paarsrode stof. De Heere opent haar hart, en ze wordt gedoopt met haar huis.",
      },
      {
        kop: "Lofzangen in de nacht",
        stap: "handelingen:nt-paulus:10",
        t: "Paulus drijft een waarzeggende geest uit een slavin. Haar bazen zijn hun winst kwijt. Paulus en Silas worden gegeseld en met hun voeten in het blok gezet. Om middernacht bidden en zingen ze. Een aardbeving opent alle deuren. De bewaker vraagt: ‘wat moet ik doen, opdat ik zalig worde?’ ‘Geloof in den Heere Jezus Christus’, zeggen ze. Nog die nacht wordt hij gedoopt, met al de zijnen.",
      },
    ],
    vragen: [
      {
        q: "Waarom gingen Paulus en Barnabas uit elkaar?",
        a: ["Ze waren het oneens over Johannes Markus", "Barnabas werd ziek in Antiochië", "Paulus wilde liever naar Rome"],
        why: "Handelingen 15:37–39",
      },
      {
        q: "Waarom gingen ze naar Macedonië?",
        a: ["Paulus zag een Macedonische man die om hulp vroeg", "Lydia had hen uitgenodigd", "Ze vluchtten voor een storm"],
        why: "Handelingen 16:9–10",
      },
      {
        q: "Waar spraken ze Lydia voor het eerst?",
        a: ["Bij de rivier buiten de stad", "In de synagoge van Troas", "Op de markt van Filippi"],
        why: "Handelingen 16:13–14",
      },
      {
        q: "Wat dacht de bewaker toen hij de deuren open zag?",
        a: ["Dat de gevangenen gevlucht waren", "Dat er een engel gekomen was", "Dat het al ochtend was"],
        why: "Handelingen 16:27",
      },
    ],
  },
  146: {
    status: "concept",
    delen: [
      {
        kop: "Een profeet met een gordel",
        stap: "handelingen:nt-paulusrome:0",
        t: "Paulus reist per schip naar Tyrus en dan naar Caesarea, naar het huis van Filippus de evangelist. Daar bindt de profeet Agabus zijn eigen handen en voeten met de gordel van Paulus. Zo zullen de Joden in Jeruzalem Paulus binden, zegt hij. Iedereen smeekt Paulus niet te gaan. Maar hij is bereid ‘ook te sterven te Jeruzalem voor den Naam van den Heere Jezus’.",
      },
      {
        kop: "Opschudding in de tempel",
        stap: "handelingen:nt-paulusrome:1",
        t: "In de tempel zien Joden uit Asia Paulus. Ze roepen dat hij Grieken in de tempel heeft gebracht. Ze slepen hem naar buiten en willen hem doden. Dan grijpt de Romeinse overste met soldaten in. Op de trappen vertelt Paulus het volk hoe de Heere hem op de weg naar Damascus geroepen heeft.",
      },
      {
        kop: "Moed in de nacht",
        stap: "handelingen:nt-paulusrome:2",
        t: "’s Nachts staat de Heere bij hem: ‘Heb goeden moed, Paulus’. Hij moet ook in Rome getuigen. Meer dan veertig mannen zweren niets te eten of te drinken voordat ze Paulus gedood hebben. Maar een neef van Paulus, de zoon van zijn zus, hoort het en waarschuwt. De overste stuurt Paulus ’s nachts met veel soldaten naar stadhouder Felix in Caesarea.",
      },
    ],
    vragen: [
      {
        q: "Wat betekende het dat Agabus zich bond met de gordel van Paulus?",
        a: ["Paulus zou in Jeruzalem gebonden worden", "Paulus moest in Caesarea blijven wonen", "Agabus wilde met Paulus meereizen"],
        why: "Handelingen 21:11",
      },
      {
        q: "Wie redde Paulus bij de tempel uit de handen van de menigte?",
        a: ["De Romeinse overste met soldaten", "Jakobus en de ouderlingen", "Filippus de evangelist"],
        why: "Handelingen 21:31–33",
      },
      {
        q: "Wat zei de Heere ’s nachts tegen Paulus?",
        a: ["Dat hij ook in Rome moest getuigen", "Dat hij naar Tarsus terug moest", "Dat hij in Jeruzalem moest blijven"],
        why: "Handelingen 23:11",
      },
      {
        q: "Hoe hoorde Paulus van het plan om hem te doden?",
        a: ["Via de zoon van zijn zus", "Via een engel in een droom", "Via de hogepriester"],
        why: "Handelingen 23:16",
      },
    ],
  },
  147: {
    status: "concept",
    delen: [
      {
        kop: "Een beroep op de keizer",
        stap: "handelingen:nt-paulusrome:3",
        t: "Paulus zit al twee jaar gevangen in Caesarea. Dan komt er een nieuwe stadhouder, Festus. De leiders van de Joden willen Paulus naar Jeruzalem laten komen om hem onderweg te doden. Festus vraagt of Paulus in Jeruzalem berecht wil worden. Maar Paulus zegt: ‘Ik beroep mij op den keizer.’ Dat betekent: de keizer moet over mijn zaak oordelen.",
      },
      {
        kop: "Storm op zee",
        stap: "handelingen:nt-paulusrome:4",
        t: "Met andere gevangenen gaat Paulus aan boord, onder Julius, een hoofdman over honderd soldaten. Ze komen in Schone Havens op Kreta. Paulus waarschuwt dat de reis grote schade zal geven. Maar de hoofdman gelooft de stuurman en de schipper meer. Dan slaat een stormwind tegen het schip. Vele dagen zien ze zon noch sterren. Paulus zegt: een engel van God heeft gezegd dat niemand zijn leven zal verliezen.",
      },
      {
        kop: "Allemaal behouden aan land",
        stap: "handelingen:nt-paulusrome:5",
        t: "In de veertiende nacht komen ze dicht bij land. Paulus dankt God voor het brood en eet, en dan eten ze allemaal. Het schip loopt vast en breekt. Wie kan zwemmen, springt overboord; de anderen drijven op planken. Zo komen ze ‘allen behouden aan het land’.",
      },
    ],
    vragen: [
      {
        q: "Waarom wilden de Joodse leiders dat Paulus naar Jeruzalem kwam?",
        a: ["Ze wilden hem onderweg doden", "Ze wilden hem vrijlaten", "Ze wilden hem in de tempel horen"],
        why: "Handelingen 25:2–3",
      },
      {
        q: "Waarom voeren ze toch verder van Schone Havens?",
        a: ["De hoofdman geloofde de stuurman meer dan Paulus", "Paulus wilde snel naar de keizer", "De storm was al voorbij"],
        why: "Handelingen 27:10–13",
      },
      {
        q: "Waarom kon Paulus de mensen moed inspreken?",
        a: ["Een engel had gezegd dat niemand zou omkomen", "Hij zag het land al liggen", "De stuurman had gezegd dat het goed kwam"],
        why: "Handelingen 27:22–25",
      },
      {
        q: "Wat deden de anderen nadat Paulus God gedankt had en begon te eten?",
        a: ["Ze kregen moed en aten ook", "Ze sprongen meteen overboord", "Ze gooiden het brood in zee"],
        why: "Handelingen 27:35–36",
      },
    ],
  },
  148: {
    status: "concept",
    delen: [
      {
        kop: "Een adder op Melite",
        stap: "handelingen:nt-paulusrome:6",
        t: "Na de schipbreuk komen Paulus en de anderen aan land op Melite, waarschijnlijk Malta. Het regent en is koud; de bewoners maken een groot vuur. Als Paulus takken op het vuur legt, komt er een adder uit, die aan zijn hand hangt. De bewoners denken dat hij een moordenaar is. Maar Paulus schudt de slang af in het vuur, en er gebeurt hem niets. Dan zeggen ze dat hij een god is.",
      },
      {
        kop: "Zieken worden genezen",
        t: "Publius is de voornaamste van het eiland. Zijn vader ligt met koorts in bed. Paulus bidt, legt hem de handen op en maakt hem gezond. Daarna worden ook andere zieken genezen.",
      },
      {
        kop: "Op weg naar Rome",
        stap: "handelingen:nt-paulusrome:7",
        t: "Na drie maanden varen ze via Syrakuse en Regium naar Puteoli. Broeders uit Rome komen hen tegemoet tot Appiusmarkt en Drie Tabernen. Paulus dankt God en grijpt moed.",
      },
      {
        kop: "Twee jaar in Rome",
        stap: "handelingen:nt-paulusrome:8",
        t: "In Rome woont Paulus apart, met een soldaat als bewaker. Hij spreekt met de Joden over de Heere Jezus. Sommigen geloven, anderen niet. Twee hele jaren woont hij in een gehuurd huis. Hij preekt ‘met alle vrijmoedigheid, onverhinderd’: vrijuit, zonder dat iemand hem tegenhoudt.",
      },
    ],
    vragen: [
      {
        q: "Waarom dachten de bewoners dat Paulus een moordenaar was?",
        a: ["Er hing een adder aan zijn hand", "Hij had het vuur aangestoken", "Hij had het schip laten vergaan"],
        why: "Handelingen 28:4",
      },
      {
        q: "Wie was Publius?",
        a: ["De voornaamste van het eiland", "De kapitein van het schip", "Een broeder uit Rome"],
        why: "Handelingen 28:7",
      },
      {
        q: "Waar kwamen de broeders uit Rome hen tegemoet?",
        a: ["Tot Appiusmarkt en Drie Tabernen", "Tot in Puteoli", "Tot in Syrakuse"],
        why: "Handelingen 28:15",
      },
      {
        q: "Wat deed Paulus toen hij de broeders uit Rome zag?",
        a: ["Hij dankte God en greep moed", "Hij vroeg hen hem te bevrijden", "Hij ging met hen terug naar Puteoli"],
        why: "Handelingen 28:15",
      },
      {
        q: "Hoe lang woonde Paulus in zijn gehuurde woning in Rome?",
        a: ["Twee gehele jaren", "Drie maanden", "Zeven dagen"],
        why: "Handelingen 28:30",
      },
    ],
  },
  149: {
    status: "concept",
    delen: [
      {
        kop: "Een stem als een bazuin",
        stap: "openbaring:nt-openbaring:0",
        t: "Johannes is op het eiland Patmos, ‘om het Woord Gods’. Op de dag des Heeren hoort hij achter zich een grote stem. Hij kijkt om en ziet zeven gouden kandelaren. In het midden is Iemand als de Zoon des mensen, met ogen als een vlam vuurs. Johannes valt als dood neer. Maar Hij zegt: ‘Vrees niet; Ik ben de Eerste en de Laatste’.",
      },
      {
        kop: "Zeven brieven",
        stap: "openbaring:nt-openbaring:1",
        t: "Johannes moet schrijven aan zeven gemeenten in Asia, zoals Efeze, Smyrna en Laodicea. In elke brief staat: ‘Ik weet uw werken’. Elke brief belooft iets aan wie overwint.",
      },
      {
        kop: "Het boek en het Lam",
        t: "Daarna ziet Johannes een deur open in de hemel, en een troon. Hij Die op de troon zit, heeft een boek met zeven zegels. Niemand kan het openen; Johannes huilt. Een ouderling zegt: de Leeuw uit de stam van Juda heeft overwonnen. Johannes ziet een Lam, ‘staande als geslacht’. Het Lam neemt het boek.",
      },
      {
        kop: "De draak en de witte troon",
        t: "Michaël en zijn engelen strijden tegen de grote draak, ‘de oude slang’. De draak wordt uit de hemel geworpen. Aan het eind ziet Johannes een grote witte troon. De doden worden geoordeeld naar hun werken.",
      },
    ],
    vragen: [
      {
        q: "Waarom was Johannes op Patmos?",
        a: ["Om het Woord Gods", "Omdat zijn schip daar was vergaan", "Om er een gemeente te beginnen"],
        why: "Openbaring 1:9",
      },
      {
        q: "Wat zijn volgens de Bijbel zelf de zeven gouden kandelaren?",
        a: ["De zeven gemeenten", "De zeven engelen", "De zeven geesten Gods"],
        why: "Openbaring 1:20",
      },
      {
        q: "Waarom weende Johannes?",
        a: ["Niemand kon het boek openen", "Hij was bang voor de ouderlingen", "Hij moest alleen op Patmos blijven"],
        why: "Openbaring 5:3–4",
      },
      {
        q: "Wat zag Johannes toen de ouderling over de Leeuw sprak?",
        a: ["Een Lam, staande als geslacht", "Een leeuw met zeven hoornen", "Een draak met zeven hoofden"],
        why: "Openbaring 5:5–6",
      },
      {
        q: "Wie streden in de hemel tegen de draak?",
        a: ["Michaël en zijn engelen", "De vierentwintig ouderlingen", "De vier dieren"],
        why: "Openbaring 12:7",
      },
    ],
  },
  150: {
    status: "concept",
    delen: [
      {
        kop: "Een Rijsje uit de tronk van Isaï",
        t: "Jesaja zegt: ‘Want er zal een Rijsje voortkomen uit den afgehouwen tronk van Isaï’. Een tronk is de stronk van een omgehakte boom; een rijsje is een jong takje. Isaï is de vader van koning David. Op Hem, het Rijsje, zal de Geest des HEEREN rusten, en Hij zal de armen met gerechtigheid richten.",
      },
      {
        kop: "De wolf bij het lam",
        t: "Dan zal de wolf bij het lam wonen; een klein kind zal ze drijven. De leeuw zal stro eten, net als de os. Niemand zal nog kwaad doen, ‘want de aarde zal vol van kennis des HEEREN zijn’.",
      },
      {
        kop: "Alle dingen nieuw",
        stap: "openbaring:nt-openbaring:0",
        t: "Veel later ziet Johannes een nieuwe hemel en een nieuwe aarde, en het nieuwe Jeruzalem dat uit de hemel neerdaalt. God zal alle tranen van hun ogen afwissen. Er is geen dood meer, geen rouw en geen moeite. Hij Die op de troon zit, zegt: ‘Ziet, Ik maak alle dingen nieuw.’",
      },
      {
        kop: "De stad met de boom des levens",
        t: "De poorten zijn parels. Er is geen tempel, want God en het Lam zijn haar tempel. Er is geen nacht. Uit de troon stroomt de rivier van het water des levens, met aan beide kanten de boom des levens. Het laatste gebed is: ‘Ja, kom, Heere Jezus!’",
      },
    ],
    vragen: [
      {
        q: "Wie is Isaï?",
        a: ["De vader van koning David", "De vader van de profeet Jesaja", "Een zoon van koning David"],
        why: "Ruth 4:22; Jesaja 1:1",
      },
      {
        q: "Wat zal er volgens Jesaja op het Rijsje rusten?",
        a: ["De Geest des HEEREN", "Een gouden kroon", "Een witte wolk"],
        why: "Jesaja 11:2",
      },
      {
        q: "Waarom zal men nergens leed doen op Gods heilige berg?",
        a: ["De aarde zal vol zijn van kennis des HEEREN", "Alle wilde dieren zijn weggejaagd", "Er staat een hoge muur omheen"],
        why: "Jesaja 11:9",
      },
      {
        q: "Wat ziet Johannes van God uit de hemel neerdalen?",
        a: ["Het nieuwe Jeruzalem", "Een gouden tempel", "Een grote ark"],
        why: "Openbaring 21:2",
      },
      {
        q: "Waarom heeft de stad geen zon nodig?",
        a: ["De heerlijkheid van God verlicht haar", "Er branden overal lampen", "Het is er altijd zomer"],
        why: "Openbaring 21:23",
      },
    ],
  },
});
