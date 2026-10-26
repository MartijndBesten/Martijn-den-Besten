// Reisniveaus: één geschiedenis, meerdere redactioneel gecontroleerde vertelversies.
//
//   a  Samen ontdekken (4–6 jaar): korte verhaalstappen, één gedachte per scherm, voor kind en begeleider samen.
//   b  Zelf op reis   (7–10 jaar): een zelfstandig leesbare vertelling in een paar onderdelen.
//   c  Verder ontdekken (11+):     de bestaande vertelling (geschiedenissen/*.js) met verdieping.
//
// De basis blijft de bestaande geschiedenis (uitleg, quiz, cross, tijdNoot, stappen). Een versie hier voegt toe; ze
// vervangt niets. Ontbreekt een versie, dan valt de app terug zoals in docs/bijbelreis-niveaus/inhoudsmodel.md staat;
// een ontbrekende ‘Samen ontdekken’-versie wordt nooit vervangen door een moeilijkere tekst alsof die passend is.
//
// status: "concept" = nieuw geschreven, wacht op redactionele beoordeling (zichtbaar gemarkeerd);
//         "goedgekeurd" = beoordeeld door de redactie (Martijn). Alleen dan verdwijnt de markering.
// Citaten tussen ‘ ’ zijn letterlijk Statenvertaling; een unittest controleert dat tegen bijbel/*.json.
// Vragen: het eerste antwoord is het goede. Niveau a heeft precies twee antwoorden, b en c drie.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.niveaus = {
  soorten: {
    a: { n: "Samen ontdekken", leeftijd: "4–6 jaar", uitleg: "Korte stukjes om samen te lezen, met eenvoudige vragen." },
    b: { n: "Zelf op reis", leeftijd: "7–10 jaar", uitleg: "Verhalen om zelf te lezen, met de kaart en afwisselende vragen." },
    c: { n: "Verder ontdekken", leeftijd: "11+", uitleg: "De volledige vertelling met achtergrond, verbanden en verwijzingen." },
  },
  verhalen: {
    1: {
      a: {
        status: "concept",
        delen: [
          { t: "In het begin maakt God de hemel en de aarde. Het is nog donker en leeg." },
          { t: "God spreekt: ‘Daar zij licht!’ En het wordt licht. Dat is de eerste dag." },
          { t: "Op de tweede dag maakt God de lucht, hoog boven de aarde." },
          { t: "Op de derde dag maakt God het droge land en de zee. Op het land laat Hij gras, planten en bomen groeien." },
          { t: "Op de vierde dag maakt God de zon, de maan en de sterren." },
          { t: "Op de vijfde dag maakt God de vissen in de zee en de vogels in de lucht." },
          { t: "Op de zesde dag maakt God de dieren op het land. En Hij maakt de mens: een man en een vrouw." },
          { t: "God kijkt naar alles wat Hij gemaakt heeft. Het is zeer goed. Op de zevende dag rust God." },
        ],
        samen: "Wijs bij elke dag iets aan dat je om je heen ziet: het licht, de lucht, een plant, de zon, een vogel, een dier. Zo wordt het verhaal herkenbaar.",
        vragen: [
          { q: "Wie heeft alles gemaakt?", a: ["God", "De mensen"], why: "Genesis 1:1" },
          { q: "Wat maakt God als eerste?", a: ["Het licht", "De dieren"], why: "Genesis 1:3" },
          { q: "Wat doet God op de zevende dag?", a: ["Hij rust", "Hij maakt de zon"], why: "Genesis 2:2" },
        ],
      },
      b: {
        status: "concept",
        delen: [
          { kop: "Het begin", t: "In het begin schept God de hemel en de aarde. De aarde is nog woest en leeg, en het is donker. Dan spreekt God: ‘Daar zij licht!’ En er is licht. God noemt het licht dag en de duisternis nacht. Dat is de eerste dag." },
          { kop: "Zes dagen", t: "Op de tweede dag maakt God het uitspansel: de hemel boven de aarde. Op de derde dag verzamelt Hij het water in zeeën, zodat het droge land te zien is, en Hij laat planten en bomen groeien. Op de vierde dag maakt Hij de zon, de maan en de sterren. Op de vijfde dag de vissen en de vogels. Op de zesde dag de dieren op het land, en als laatste de mens." },
          { kop: "Naar Gods beeld", t: "God maakt de mens naar Zijn beeld: man en vrouw. Hij zegent hen en zegt dat ze mogen heersen over de vissen, de vogels en alle dieren. God ziet alles wat Hij gemaakt heeft, en het is zeer goed. Op de zevende dag rust God van al Zijn werk. Hij zegent die dag en heiligt hem." },
        ],
        vragen: [
          { q: "Hoe maakt God het licht?", a: ["Hij spreekt, en het is er", "Hij steekt een vuur aan", "Hij gebruikt de zon"], why: "Genesis 1:3" },
          { q: "Wat is bijzonder aan de mens?", a: ["God maakt hem naar Zijn beeld", "Hij is gemaakt op de eerste dag", "Hij kan vliegen zoals de vogels"], why: "Genesis 1:27" },
          { q: "Wat zegt God over alles wat Hij gemaakt heeft?", a: ["Het is zeer goed", "Het is nog niet af", "Het moet nog groeien"], why: "Genesis 1:31" },
          { q: "Waarom is de zevende dag bijzonder?", a: ["God rust en zegent die dag", "God maakt dan de mens", "Dan wordt het voor het eerst licht"], why: "Genesis 2:2–3" },
        ],
      },
      c: {
        status: "concept",
        verdieping: [
          { kop: "Hoe Genesis 1 vertelt", t: "Steeds komt hetzelfde terug: God spreekt, ‘en het was alzo’, en ‘God zag, dat het goed was’. Elke dag sluit af met ‘Toen was het avond geweest, en het was morgen geweest’. In de eerste drie dagen maakt God scheiding: licht en duisternis, wateren en wateren, zee en droog land. In de volgende drie dagen vult Hij wat Hij gemaakt heeft: met lichten, met vissen en vogels, met dieren en mensen. Die indeling staat niet letterlijk in de tekst; veel uitleggers wijzen erop." },
          { kop: "Elders in de Bijbel", t: "Psalm 33 zegt: ‘Want Hij spreekt, en het is er; Hij gebiedt, en het staat er.’ Johannes schrijft over het Woord: ‘Alle dingen zijn door Hetzelve gemaakt’ (Johannes 1:3). Hebreeën 11:3 zegt dat wij door het geloof verstaan ‘dat de wereld door het woord Gods is toebereid’. En het vierde gebod wijst terug naar de rustdag: ‘Want in zes dagen heeft de HEERE den hemel en de aarde gemaakt’ (Exodus 20:11).", refs: ["Psalm 33:9", "Johannes 1:1–3", "Hebreeën 11:3", "Exodus 20:8–11"] },
          { kop: "Wanneer en waar?", t: "De Bijbel noemt geen jaartal voor de schepping, en de kaart heeft hier geen plaats om aan te wijzen. Wie de leeftijden in Genesis 5 en 11 optelt, komt tot een berekening, maar uitleggers verschillen over hoe je die optelt. Daarom staat de schepping in de Bijbelreis zonder jaartal." },
        ],
        vragen: [
          { q: "Welke woorden komen na bijna elke scheppingsdag terug?", a: ["God zag, dat het goed was", "God rustte van Zijn werk", "De mens zag het en was blij"], why: "Genesis 1:10, 12, 18, 21, 25" },
          { q: "Wat zegt Johannes 1 over de schepping?", a: ["Alle dingen zijn door het Woord gemaakt", "De wereld is vanzelf ontstaan", "Alleen de mensen zijn door het Woord gemaakt"], why: "Johannes 1:3" },
          { q: "Welk gebod wijst terug naar de zes dagen en de rustdag?", a: ["Het vierde gebod, over de sabbat", "Het eerste gebod", "Het tiende gebod"], why: "Exodus 20:8–11" },
        ],
      },
    },
    26: {
      a: {
        status: "concept",
        plaatsen: ["pihachiroth", "schelfzee"],
        delen: [
          { t: "God heeft Zijn volk Israël uit Egypte geleid. Nu staan ze bij de zee.", stap: "exodus:uittocht:4" },
          { t: "Dan zien ze het leger van de farao komen, met heel veel wagens. Het volk is erg bang.", stap: "exodus:uittocht:4" },
          { t: "Mozes zegt tegen het volk dat ze niet bang hoeven te zijn. God zal voor hen strijden." },
          { t: "Mozes strekt zijn hand uit over de zee. De hele nacht waait er een sterke wind. Er komt een droge weg dwars door de zee.", stap: "exodus:uittocht:5" },
          { t: "Het water staat als een muur aan beide kanten. Het volk loopt over de droge bodem naar de overkant.", stap: "exodus:uittocht:5" },
          { t: "De Egyptenaren gaan erachteraan. Dan komt het water terug. Van het leger van de farao blijft niemand over." },
          { t: "Zo heeft God Zijn volk gered. Het volk zingt een lied voor God, en Mirjam slaat op een trommel.", stap: "exodus:uittocht:6" },
        ],
        samen: "Dit verhaal vertelt ook dat het leger van de farao in de zee omkwam (Exodus 14:28). Kinderen kunnen daarover vragen stellen. De Bijbel vertelt het als de redding van Israël uit de hand van de Egyptenaren (Exodus 14:30). Neem de tijd voor vragen en houd het bij wat de Bijbel zegt.",
        vragen: [
          { q: "Waarom is het volk bang?", a: ["Het leger van de farao komt eraan", "Ze hebben geen eten"], why: "Exodus 14:10" },
          { q: "Wat maakt God in de zee?", a: ["Een droge weg", "Een grote boot"], why: "Exodus 14:21–22" },
          { q: "Wat doet het volk aan de overkant?", a: ["Ze zingen een lied voor God", "Ze gaan terug naar Egypte"], why: "Exodus 15:1" },
        ],
      },
      b: {
        status: "concept",
        delen: [
          { kop: "Klem tussen zee en leger", stap: "exodus:uittocht:4", t: "God laat Israël kamperen bij Pi-Hachiroth, aan de zee. Dan krijgt de farao spijt dat hij het volk heeft laten gaan. Hij jaagt hen na met zeshonderd uitgelezen wagens. Het volk ziet de Egyptenaren komen en wordt erg bang. Maar Mozes zegt: ‘Vreest niet, staat vast, en ziet het heil des HEEREN’. Dat betekent: wees niet bang, blijf staan en kijk hoe de HEERE jullie redt." },
          { kop: "Een weg door de zee", stap: "exodus:uittocht:5", t: "Mozes strekt zijn hand uit over de zee, en de HEERE laat de hele nacht een sterke oostenwind waaien. Het water staat als een muur rechts en links, en Israël loopt over de droge bodem naar de overkant. De Egyptenaren gaan erachteraan. Als Mozes zijn hand opnieuw uitstrekt, komt het water terug. Van het leger van de farao blijft niemand over." },
          { kop: "Een lied voor de HEERE", stap: "exodus:uittocht:6", t: "Zo verlost de HEERE Israël. Het volk vreest de HEERE en gelooft in Hem. Mozes en het volk zingen een lied: ‘Het paard en zijn ruiter heeft Hij in de zee geworpen.’ Mirjam, de zus van Aäron, neemt een trommel, en alle vrouwen gaan met haar mee." },
        ],
        vragen: [
          { q: "Waarom kon het volk niet verder?", a: ["De zee lag voor hen en het leger kwam achter hen", "Ze waren de weg kwijt", "Mozes wilde uitrusten"], why: "Exodus 14:9–10" },
          { q: "Wat gebeurde er toen Mozes zijn hand opnieuw uitstrekte?", a: ["Het water kwam terug", "Er kwam een tweede weg", "Het werd ineens dag"], why: "Exodus 14:26–28" },
          { q: "Hoe maakte God de zee droog?", a: ["Met een sterke oostenwind, de hele nacht", "Met de warmte van de zon", "Met een aardbeving"], why: "Exodus 14:21" },
          { q: "Wat deed het volk na de redding?", a: ["Ze vreesden de HEERE en zongen een lied", "Ze gingen terug naar Egypte", "Ze bouwden een stad aan de zee"], why: "Exodus 14:31–15:1" },
        ],
      },
      c: {
        status: "concept",
        verdieping: [
          { kop: "Waar was de doortocht?", t: "De Bijbel noemt Pi-Hachiroth, Migdol en Baäl-Zefon (Exodus 14:2), maar die plaatsen zijn niet met zekerheid teruggevonden. Het woord dat de Statenvertaling met Schelfzee vertaalt, wordt in de Bijbel ook gebruikt voor de golf bij Ezeon-Geber, de Golf van Akaba (1 Koningen 9:26). Op de kaart staat de doortocht bij de noordpunt van de Golf van Suez. Andere voorstellen zijn de Bittermeren, het Timsahmeer en de Ballahmeren; die staan als andere mogelijke plek op de kaart.", refs: ["Exodus 14:2", "1 Koningen 9:26"] },
          { kop: "Wanneer?", t: "Gerekend met 1 Koningen 6:1, dat de tempelbouw in het vierhonderd en tachtigste jaar na de uittocht plaatst, komt de uittocht rond 1446 v.Chr. Veel onderzoekers dateren de uittocht in de 13e eeuw v.Chr. Het jaartal is dus onzeker; de volgorde van de gebeurtenissen staat in de Bijbel.", refs: ["1 Koningen 6:1"] },
          { kop: "Verbanden", t: "Deze redding wordt in de Bijbel vaak genoemd. Psalm 136 zingt: ‘Dien, Die de Schelfzee in delen deelde; want Zijn goedertierenheid is in der eeuwigheid.’ Hebreeën 11:29 zegt dat ze ‘door het geloof’ door de zee gingen. Paulus schrijft dat zij ‘allen in Mozes gedoopt zijn in de wolk en in de zee’ (1 Korinthe 10:2). En in Openbaring 15:3 zingen de overwinnaars ‘het gezang van Mozes’ en ‘het gezang des Lams’.", refs: ["Psalm 136:13–15", "Hebreeën 11:29", "1 Korinthe 10:1–2", "Openbaring 15:3"] },
        ],
        vragen: [
          { q: "Wat weten we zeker over de plaats van de doortocht?", a: ["De Bijbel noemt plaatsnamen, maar die zijn niet met zekerheid teruggevonden", "Het was zeker bij de Bittermeren", "Het was zeker in de Golf van Akaba"], why: "Exodus 14:2" },
          { q: "Waarom staat het jaartal van de uittocht als onzeker op de tijdlijn?", a: ["Het is uitgerekend met 1 Koningen 6:1, en onderzoekers komen tot verschillende jaartallen", "De Bijbel noemt het jaartal letterlijk", "Het staat op een Egyptische steen"], why: "1 Koningen 6:1" },
          { q: "Wat zegt Hebreeën 11:29 over de doortocht?", a: ["Ze gingen door het geloof door de zee", "Ze gingen door de zee omdat het eb was", "Alleen Mozes ging door de zee"], why: "Hebreeën 11:29" },
        ],
      },
    },
    83: {
      a: {
        status: "concept",
        plaatsen: ["nt_nazareth", "efrath"],
        delen: [
          { t: "Maria en Jozef wonen in Nazareth. Maria verwacht een kindje." },
          { t: "De keizer wil dat alle mensen worden opgeschreven, ieder in zijn eigen stad." },
          { t: "Jozef moet daarvoor naar Bethlehem, de stad van koning David. Maria gaat met hem mee.", stap: "jezus-1:nt-geboorte:5" },
          { t: "In Bethlehem wordt de Zoon van Maria geboren. Ze wikkelt Hem in doeken.", stap: "jezus-1:nt-geboorte:5" },
          { t: "Er is geen plaats voor hen in de herberg. Daarom legt Maria het Kind in een kribbe: een voerbak voor dieren." },
          { t: "Het Kind krijgt de naam Jezus, zoals de engel gezegd had. Hij is de Zoon van God." },
        ],
        samen: "Lukas 2 noemt een kribbe en een herberg (Lukas 2:7). Een stal, een os en een ezel worden in dit gedeelte niet genoemd; die komen uit de traditie en uit prentenboeken. De herders bij de kribbe zijn de volgende geschiedenis (84).",
        vragen: [
          { q: "Waarom gaan Jozef en Maria op reis?", a: ["Ze moeten zich laten opschrijven in Bethlehem", "Ze gaan op bezoek bij familie"], why: "Lukas 2:1–5" },
          { q: "Waar legt Maria het Kind neer?", a: ["In een kribbe", "In een bedje"], why: "Lukas 2:7" },
          { q: "Welke naam krijgt het Kind?", a: ["Jezus", "David"], why: "Lukas 2:21" },
        ],
      },
      b: {
        status: "concept",
        delen: [
          { kop: "Een bevel van de keizer", stap: "jezus-1:nt-geboorte:5", t: "Keizer Augustus beveelt dat iedereen zich moet laten inschrijven, ieder in zijn eigen stad. Jozef woont in Nazareth in Galilea, maar hij is uit het huis en geslacht van David. Daarom gaat hij naar Bethlehem in Judea, de stad van David. Maria, met wie hij ondertrouwd is, gaat met hem mee. Ze is zwanger." },
          { kop: "Geboren in Bethlehem", t: "Terwijl ze in Bethlehem zijn, wordt Maria’s eerstgeboren Zoon geboren. Ze wikkelt Hem in doeken en legt Hem in een kribbe, omdat er voor hen geen plaats is in de herberg. Op de achtste dag krijgt het Kind de naam Jezus. Die naam had de engel al aan Jozef gegeven, met de reden erbij: ‘want Hij zal Zijn volk zalig maken van hun zonden’ (Mattheüs 1:21)." },
          { kop: "Zoals God beloofd had", t: "Lang daarvoor had de profeet Micha al gezegd dat er uit Bethlehem een Heerser zou komen (Micha 5:1). Zo gebeurt het: de Zoon van God wordt geboren in de stad van David." },
        ],
        vragen: [
          { q: "Waarom ging Jozef naar Bethlehem?", a: ["Hij was uit het huis en geslacht van David", "Hij had daar werk gevonden", "Maria wilde daar wonen"], why: "Lukas 2:4" },
          { q: "Waarom lag het Kind in een kribbe?", a: ["Er was geen plaats in de herberg", "Het was er warmer", "Dat was zo de gewoonte"], why: "Lukas 2:7" },
          { q: "Waarom moest het Kind Jezus heten, volgens de engel?", a: ["Hij zal Zijn volk zalig maken van hun zonden", "Hij zal een machtige koning op aarde worden", "Hij zal de keizer verslaan"], why: "Mattheüs 1:21" },
          { q: "Welke profeet had al over Bethlehem gesproken?", a: ["Micha", "Jona", "Elia"], why: "Micha 5:1" },
        ],
      },
      c: {
        status: "concept",
        verdieping: [
          { kop: "Keizer, stadhouder en jaartal", t: "Lukas noemt keizer Augustus en zegt dat deze eerste inschrijving plaatsvond ‘als Cyrenius over Syrië stadhouder was’ (Lukas 2:2). Uit de geschiedschrijver Josephus is een inschrijving onder Quirinius (Cyrenius) bekend rond 6 n.Chr., terwijl de Heere Jezus geboren werd ‘in de dagen van den koning Herodes’ (Mattheüs 2:1), die rond 4 v.Chr. stierf. Hoe die gegevens precies samengaan, is onder onderzoekers niet opgelost. Daarom staat hier ca. 6–4 v.Chr. met het label onzeker.", refs: ["Lukas 2:1–2", "Mattheüs 2:1"] },
          { kop: "Van Nazareth naar Bethlehem", t: "Nazareth ligt in Galilea, Bethlehem in Judea, ruim honderd kilometer verder naar het zuiden. Hoe Jozef en Maria reisden en hoe lang ze erover deden, vertelt de Bijbel niet; de route op de kaart is een reconstructie. Een kribbe is een voerbak voor dieren. Een stal, een os en een ezel worden in Lukas 2 niet genoemd. Het woord dat in de Statenvertaling herberg heet, kan ook een gastenkamer betekenen; uitleggers verschillen over wat hier bedoeld is." },
          { kop: "Elders in de Bijbel", t: "Micha 5:1: ‘En gij, Bethlehem Efratha!’ … ‘Uit u zal Mij voortkomen, Die een Heerser zal zijn in Israël’. Mattheüs 2:5–6 haalt deze profetie aan. Jesaja 9:5: ‘Want een Kind is ons geboren, een Zoon is ons gegeven’. Galaten 4:4: God heeft Zijn Zoon uitgezonden ‘wanneer de volheid des tijds gekomen is’. Johannes 1:14: ‘En het Woord is vlees geworden, en heeft onder ons gewoond’.", refs: ["Micha 5:1", "Mattheüs 2:5–6", "Jesaja 9:5", "Galaten 4:4", "Johannes 1:14"] },
        ],
        vragen: [
          { q: "Welke stadhouder noemt Lukas bij de inschrijving?", a: ["Cyrenius, over Syrië", "Pontius Pilatus, over Judea", "Herodes, over Galilea"], why: "Lukas 2:2" },
          { q: "Waarom is het geboortejaar van de Heere Jezus onzeker?", a: ["De gegevens over Herodes en de inschrijving zijn moeilijk precies te combineren", "De Bijbel noemt geen enkele koning of keizer", "Lukas noemt een jaartal dat niet bestaat"], why: "Lukas 2:1–2; Mattheüs 2:1" },
          { q: "Welke profetie over Bethlehem haalt Mattheüs 2:5–6 aan?", a: ["Micha 5:1", "Jesaja 7:14", "Psalm 23:1"], why: "Mattheüs 2:5–6" },
        ],
      },
    },
  },
};
