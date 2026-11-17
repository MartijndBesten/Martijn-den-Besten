// Lesroutes (/bijbelreis/lessen): een paar vaste reeksen geschiedenissen om samen de Bijbel te ontdekken, thuis, op de
// zondagsschool of club, bij catechisatie en in de klas. Uitleg, keuzes en bronnen: docs/bijbelreis-samen/README.md.
//
// Hier staat geen verhaal: een les wijst met `v` naar een van de 150 geschiedenissen (geschiedenissen/*.js). Titel,
// vertelling, kaart, presentatie en de vragen in de app komen daarvandaan. Wat hier wel staat:
//   lees    het Bijbelgedeelte om samen te lezen (binnen de verwijzing van de geschiedenis);
//   verzen  het aantal verzen van `lees`, en min de voorleestijd in minuten (woorden / 120, afgerond); de unittest
//           rekent beide na met de Statenvertaling;
//   vragen  drie zoekvragen voor de leiding, in de volgorde van de tekst: q = de vraag (die op zichzelf staat, want op
//           het digibord en het werkblad staat hij los), ref = waar het antwoord staat (binnen `lees`), a = het antwoord.
//           Alleen feiten die in de tekst staan; geen vragen naar een persoonlijke toepassing of een geloofsoordeel.
//           Tekst tussen ‘enkele aanhalingstekens’ staat letterlijk zo in de Statenvertaling (ook in een vraag).
//   extra   (optioneel) een deel van de atlas dat bij de route past: { t, deel }.
// Elke vraag is gecontroleerd tegen de Statenvertaling: scripts/bijbel-controle/lessen.txt (één regel per vraag, in
// dezelfde volgorde) en tests/bijbelreis-lessen.test.ts. Versnummers volgen de Statenvertaling. Eindredactie en wat
// een mens nog moet nalezen: docs/bijbelreis-samen/BEOORDELING.md.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.lessen = [
  {
    id: "aartsvaders", n: "De aartsvaders in vier weken", bereik: "Genesis 12–33",
    kort: "Abraham, Izak en Jakob: van Haran naar Kanaän, de berg in het land Moria, de droom bij Bethel en de nacht bij de Jabbok.",
    lessen: [
      { v: 8, lees: "Genesis 12:1–9", verzen: 9, min: 2, vragen: [
        { q: "Hoe oud was Abram toen hij uit Haran ging?", ref: "Genesis 12:4", a: "75 jaar: ‘vijf en zeventig jaren oud’." },
        { q: "Wie gingen er met Abram mee naar het land Kanaän?", ref: "Genesis 12:5", a: "Sarai, zijn vrouw, en Lot, de zoon van zijn broer; ze namen hun bezit en hun mensen mee." },
        { q: "Wat bouwde Abram bij Sichem, waar de HEERE aan hem verscheen?", ref: "Genesis 12:7", a: "Een altaar voor de HEERE." },
      ] },
      { v: 13, lees: "Genesis 22:1–19", verzen: 19, min: 4, vragen: [
        { q: "Naar welk land moest Abraham gaan?", ref: "Genesis 22:2", a: "Naar het land Moria." },
        { q: "Wat vroeg Izak onderweg aan zijn vader?", ref: "Genesis 22:7", a: "Hij zei: ‘Zie het vuur en het hout; maar waar is het lam tot het brandoffer?’" },
        { q: "Wat offerde Abraham in de plaats van zijn zoon?", ref: "Genesis 22:13", a: "Een ram, die met zijn hoornen vastzat in de struiken." },
      ] },
      { v: 15, lees: "Genesis 25:27–34; 28:10–22", verzen: 21, min: 4, vragen: [
        { q: "Wat gaf Jakob aan Ezau voor zijn eerstgeboorterecht?", ref: "Genesis 25:34", a: "Brood en ‘het linzenkooksel’." },
        { q: "Wat zag Jakob in zijn droom?", ref: "Genesis 28:12", a: "Een ladder op de aarde die tot aan de hemel reikte, en de engelen Gods klommen op en neer." },
        { q: "Welke naam gaf Jakob aan de plaats waar hij gedroomd had?", ref: "Genesis 28:19", a: "Bethel (de stad heette eerst Luz)." },
      ] },
      { v: 17, lees: "Genesis 32:22–32; 33:1–4", verzen: 15, min: 3, vragen: [
        { q: "Welke nieuwe naam kreeg Jakob?", ref: "Genesis 32:28", a: "Israël." },
        { q: "Hoe noemde Jakob de plaats waar hij geworsteld had, en waarom?", ref: "Genesis 32:30", a: "Pniël, want hij zei: ‘ik heb God gezien van aangezicht tot aangezicht’." },
        { q: "Wat deed Ezau toen hij Jakob zag?", ref: "Genesis 33:4", a: "Hij liep hem tegemoet, omarmde hem, viel hem om de hals en kuste hem; en ze huilden." },
      ] },
    ],
  },
  {
    id: "jozef", n: "Jozef in drie weken", bereik: "Genesis 37–45",
    kort: "Verkocht door zijn broers, trouw in Egypte en onderkoning: Jozef en zijn broers weer samen.",
    lessen: [
      { v: 18, lees: "Genesis 37", verzen: 36, min: 8, vragen: [
        { q: "Hoe oud was Jozef toen hij met zijn broers de kudde weidde?", ref: "Genesis 37:2", a: "Zeventien jaar." },
        { q: "Wat maakte Jakob (Israël) voor Jozef?", ref: "Genesis 37:3", a: "‘een veelvervigen rok’: een kleurige mantel." },
        { q: "Voor hoeveel zilverlingen werd Jozef verkocht?", ref: "Genesis 37:28", a: "Twintig zilverlingen." },
      ] },
      { v: 19, lees: "Genesis 39:1–6; 41:14–46", verzen: 39, min: 8, vragen: [
        { q: "Waarom ging alles goed wat Jozef deed in het huis van Potifar?", ref: "Genesis 39:2–3", a: "De HEERE was met Jozef." },
        { q: "Wat antwoordde Jozef toen de farao zei dat Jozef dromen kon uitleggen?", ref: "Genesis 41:16", a: "‘Het is buiten mij! God zal Farao’s welstand aanzeggen.’" },
        { q: "Hoe oud was Jozef toen hij voor de farao stond?", ref: "Genesis 41:46", a: "Dertig jaar." },
      ] },
      { v: 20, lees: "Genesis 45:1–15", verzen: 15, min: 3, vragen: [
        { q: "Wat zei Jozef toen hij zich bekendmaakte aan zijn broers?", ref: "Genesis 45:3", a: "‘Ik ben Jozef! leeft mijn vader nog?’" },
        { q: "Wie had Jozef naar Egypte gezonden, volgens Jozef zelf?", ref: "Genesis 45:5–8", a: "God, om hen in leven te houden: ‘gij hebt mij herwaarts niet gezonden, maar God Zelf’." },
        { q: "Hoeveel jaren honger zouden er nog komen?", ref: "Genesis 45:6", a: "Nog vijf jaar (twee jaren honger waren al voorbij)." },
      ] },
    ],
  },
  {
    id: "egypte-kanaan", n: "Van Egypte naar Kanaän", bereik: "Exodus 2 – Jozua 4",
    kort: "Mozes in het kistje, het Pascha, droog door de zee, de Tien Geboden bij de Sinaï en door de Jordaan het land in.",
    lessen: [
      { v: 21, lees: "Exodus 2:1–10", verzen: 10, min: 2, vragen: [
        { q: "Hoe lang verborg de moeder haar zoontje?", ref: "Exodus 2:2", a: "Drie maanden." },
        { q: "Wie bleef van een afstand kijken wat er met het kistje gebeurde?", ref: "Exodus 2:4", a: "Zijn zus." },
        { q: "Waarom noemde de dochter van de farao hem Mozes?", ref: "Exodus 2:10", a: "Ze zei: ‘Want ik heb hem uit het water getogen.’" },
      ] },
      { v: 25, lees: "Exodus 12:1–14, 21–28", verzen: 22, min: 5, vragen: [
        { q: "Waar moesten de Israëlieten het bloed van het lam strijken?", ref: "Exodus 12:7", a: "Aan de twee zijposten en aan de bovendorpel van de deur." },
        { q: "Wat zou de HEERE doen als Hij het bloed zag?", ref: "Exodus 12:13", a: "Het huis voorbijgaan: ‘wanneer Ik het bloed zie, zal Ik ulieden voorbijgaan’." },
        { q: "Wat moesten ouders zeggen als hun kinderen vroegen wat deze dienst van het Pascha betekende?", ref: "Exodus 12:26–27", a: "Dat het een paasoffer voor de HEERE is, Die in Egypte de huizen van Israël voorbijging." },
      ] },
      { v: 26, lees: "Exodus 14:10–31", verzen: 22, min: 6, vragen: [
        { q: "Waarmee maakte de HEERE de zee droog, en hoe lang?", ref: "Exodus 14:21", a: "Met een sterke oostenwind, de hele nacht." },
        { q: "Hoe stond het water toen het volk door de zee ging?", ref: "Exodus 14:22", a: "Als een muur aan hun rechterhand en aan hun linkerhand." },
        { q: "Hoeveel bleven er over van het leger van de farao dat hen de zee in was gevolgd?", ref: "Exodus 14:28", a: "Niet één: ‘er bleef niet een van hen over’." },
      ] },
      { v: 29, lees: "Exodus 20:1–17", verzen: 17, min: 3, vragen: [
        { q: "Wat zegt God over Zichzelf voordat Hij de geboden geeft?", ref: "Exodus 20:2", a: "‘Ik ben de HEERE uw God, Die u uit Egypteland, uit het diensthuis, uitgeleid heb.’" },
        { q: "Hoeveel dagen zul je werken, en wat is de zevende dag?", ref: "Exodus 20:9–10", a: "Zes dagen; ‘de zevende dag is de sabbat des HEEREN uws Gods’." },
        { q: "Welke belofte staat bij het gebod om je vader en moeder te eren?", ref: "Exodus 20:12", a: "‘opdat uw dagen verlengd worden in het land, dat u de HEERE uw God geeft’." },
      ] },
      { v: 38, lees: "Jozua 3:14–4:9", verzen: 13, min: 4, vragen: [
        { q: "Hoe stond de Jordaan erbij toen de priesters met de ark erin stapten?", ref: "Jozua 3:15", a: "Vol, tot over de oevers; het was de tijd van de oogst: ‘de Jordaan nu was vol al de dagen des oogstes aan al haar oevers’." },
        { q: "Wat gebeurde er toen de voeten van de priesters met de ark in het water kwamen?", ref: "Jozua 3:15–16", a: "Het water dat van boven kwam, bleef staan als een hoop; het volk trok over, tegenover Jericho." },
        { q: "Hoeveel stenen haalden ze uit de Jordaan, en waarom zoveel?", ref: "Jozua 4:8", a: "Twaalf, naar het getal van de stammen van Israël." },
      ] },
    ],
  },
  {
    id: "david", n: "David: van herdersjongen tot koning", bereik: "1 Samuël 16 – 2 Samuël 7",
    kort: "David gezalfd in Bethlehem, tegen Goliath, op de vlucht voor Saul en Gods belofte aan David.",
    lessen: [
      { v: 51, lees: "1 Samuël 16:1–13", verzen: 13, min: 4, vragen: [
        { q: "Waar kijkt de HEERE naar, zei Hij tegen Samuël?", ref: "1 Samuël 16:7", a: "‘de HEERE ziet het hart aan’; de mens ziet aan wat voor ogen is." },
        { q: "Waar was David toen Samuël bij Isaï kwam?", ref: "1 Samuël 16:11", a: "Hij was de kleinste en weidde de schapen." },
        { q: "Wat gebeurde er toen Samuël David zalfde?", ref: "1 Samuël 16:13", a: "De Geest van de HEERE kwam over David, van die dag af." },
      ] },
      { v: 52, lees: "1 Samuël 17:32–51", verzen: 20, min: 5, vragen: [
        { q: "Waarom durfde David tegen Goliath te gaan?", ref: "1 Samuël 17:37", a: "De HEERE had hem gered van de leeuw en de beer; Die zou hem ook redden van de Filistijn." },
        { q: "Hoeveel stenen koos David uit de beek?", ref: "1 Samuël 17:40", a: "Vijf gladde stenen." },
        { q: "Waar trof de steen Goliath?", ref: "1 Samuël 17:49", a: "In zijn voorhoofd." },
      ] },
      { v: 54, lees: "1 Samuël 24:1–8", verzen: 8, min: 2, vragen: [
        { q: "Met hoeveel mannen ging Saul David zoeken?", ref: "1 Samuël 24:3", a: "Met drieduizend uitgelezen mannen uit heel Israël." },
        { q: "Wat sneed David stilletjes af in de spelonk?", ref: "1 Samuël 24:5", a: "Een slip van Sauls mantel." },
        { q: "Waarom wilde David Saul niets doen?", ref: "1 Samuël 24:7", a: "Saul was ‘de gezalfde des HEEREN’." },
      ] },
      { v: 57, lees: "2 Samuël 7:1–17", verzen: 17, min: 4, vragen: [
        { q: "Waarom wilde David een huis voor God bouwen?", ref: "2 Samuël 7:2", a: "Hij woonde zelf in een huis van cederhout, en de ark van God stond in een tent (‘in het midden der gordijnen’)." },
        { q: "Door welke profeet sprak de HEERE tot David?", ref: "2 Samuël 7:4–5", a: "Door Nathan." },
        { q: "Wat beloofde God over het koninkrijk van David?", ref: "2 Samuël 7:16", a: "Dat het tot in eeuwigheid zou blijven: ‘uw koninkrijk tot in eeuwigheid’." },
      ] },
    ],
  },
  {
    id: "profeten", n: "Profeten: Elia, Elisa, Jona en Daniël", bereik: "1 Koningen 18 – Daniël 6",
    kort: "Vuur op de Karmel, Naäman in de Jordaan, Jona en de grote vis en Daniël in de leeuwenkuil.",
    lessen: [
      { v: 63, lees: "1 Koningen 18:20–39", verzen: 20, min: 5, vragen: [
        { q: "Hoeveel profeten van Baäl waren er op de Karmel?", ref: "1 Koningen 18:22", a: "Vierhonderdvijftig." },
        { q: "Hoe vaak liet Elia water over het offer gieten?", ref: "1 Koningen 18:34", a: "Drie keer." },
        { q: "Wat riep het volk toen het vuur van de HEERE viel?", ref: "1 Koningen 18:39", a: "‘De HEERE is God, de HEERE is God!’" },
      ] },
      { v: 64, lees: "2 Koningen 5:1–14", verzen: 14, min: 4, vragen: [
        { q: "Wie vertelde dat de profeet in Samaria Naäman kon genezen?", ref: "2 Koningen 5:2–3", a: "Een klein meisje uit het land Israël, dat bij de vrouw van Naäman diende." },
        { q: "Hoe vaak moest Naäman zich wassen in de Jordaan?", ref: "2 Koningen 5:10", a: "Zeven keer." },
        { q: "Hoe werd Naämans huid nadat hij zich in de Jordaan had gewassen?", ref: "2 Koningen 5:14", a: "Zijn vlees werd weer ‘gelijk het vlees van een kleinen jongen’; hij was rein." },
      ] },
      { v: 69, lees: "Jona 1:1–17", verzen: 17, min: 4, vragen: [
        { q: "Waar wilde Jona met het schip naartoe?", ref: "Jona 1:3", a: "Naar Tarsis." },
        { q: "Wat deed Jona in het schip toen het stormde?", ref: "Jona 1:5", a: "Hij sliep: hij lag neer en ‘was met een diepen slaap bevangen’." },
        { q: "Wie beschikte de grote vis, en hoe lang was Jona erin?", ref: "Jona 1:17", a: "De HEERE; drie dagen en drie nachten." },
      ] },
      { v: 75, lees: "Daniël 6:11–24", verzen: 14, min: 4, vragen: [
        { q: "Hoe vaak per dag bad Daniël, en naar welke stad stonden zijn vensters open?", ref: "Daniël 6:11", a: "Drie keer per dag; de vensters stonden open naar Jeruzalem." },
        { q: "Wat stond er in het gebod dat de koning getekend had?", ref: "Daniël 6:13", a: "Wie in dertig dagen iets zou vragen van een god of een mens, behalve van de koning, zou ‘in den kuil der leeuwen’ geworpen worden." },
        { q: "Wat zei Daniël uit de kuil tegen de koning?", ref: "Daniël 6:23", a: "‘Mijn God heeft Zijn engel gezonden, en Hij heeft den muil der leeuwen toegesloten’." },
      ] },
    ],
  },
  {
    id: "advent-kerst", n: "Advent en Kerst", bereik: "Lukas 1–2; Mattheüs 2",
    kort: "Zacharias in de tempel, de engel bij Maria, de geboorte in Bethlehem, de herders en de wijzen.",
    extra: { t: "Ook in de atlas: de kerstreis in zes delen, één per week", deel: "kerst-belofte" },
    lessen: [
      { v: 80, lees: "Lukas 1:5–25", verzen: 21, min: 4, vragen: [
        { q: "Wat mocht Zacharias in de tempel doen?", ref: "Lukas 1:9", a: "Het reukoffer brengen; het lot was op hem gevallen." },
        { q: "Hoe heette de engel die bij Zacharias kwam?", ref: "Lukas 1:19", a: "Gabriël." },
        { q: "Waarom kon Zacharias niet meer spreken?", ref: "Lukas 1:20", a: "Hij had de woorden van de engel niet geloofd." },
      ] },
      { v: 81, lees: "Lukas 1:26–38", verzen: 13, min: 2, vragen: [
        { q: "In welke stad woonde Maria?", ref: "Lukas 1:26–27", a: "In Nazareth, in Galilea." },
        { q: "Welke naam moest het Kind krijgen?", ref: "Lukas 1:31", a: "JEZUS." },
        { q: "Wat zei Maria aan het eind tegen de engel?", ref: "Lukas 1:38", a: "‘Zie, de dienstmaagd des Heeren; mij geschiede naar uw woord.’" },
      ] },
      { v: 83, lees: "Lukas 2:1–7", verzen: 7, min: 1, vragen: [
        { q: "Welke keizer gaf het bevel dat iedereen ingeschreven moest worden?", ref: "Lukas 2:1", a: "Keizer Augustus." },
        { q: "Waarom ging Jozef juist naar Bethlehem om zich te laten inschrijven?", ref: "Lukas 2:3–4", a: "Iedereen ging naar zijn eigen stad, en Jozef was uit het huis en geslacht van David; Bethlehem is ‘de stad Davids’." },
        { q: "Waarom legde Maria het Kind in een kribbe?", ref: "Lukas 2:7", a: "Er was voor hen geen plaats in de herberg." },
      ] },
      { v: 84, lees: "Lukas 2:8–20", verzen: 13, min: 2, vragen: [
        { q: "Wat was het teken voor de herders?", ref: "Lukas 2:12", a: "Een Kindje in doeken gewonden, liggend in de kribbe." },
        { q: "Wat zong de menigte van het hemelse leger?", ref: "Lukas 2:14", a: "‘Ere zij God in de hoogste hemelen, en vrede op aarde, in de mensen een welbehagen.’" },
        { q: "Wat deed Maria met alles wat er gezegd werd?", ref: "Lukas 2:19", a: "Ze bewaarde het allemaal en dacht erover na in haar hart." },
      ] },
      { v: 85, lees: "Mattheüs 2:1–12", verzen: 12, min: 2, vragen: [
        { q: "Wat vroegen de wijzen in Jeruzalem?", ref: "Mattheüs 2:2", a: "‘Waar is de geboren Koning der Joden?’" },
        { q: "Welke geschenken brachten de wijzen?", ref: "Mattheüs 2:11", a: "Goud, wierook en mirre." },
        { q: "Waarom gingen de wijzen niet terug naar Herodes?", ref: "Mattheüs 2:12", a: "God waarschuwde hen in een droom; ze gingen langs een andere weg terug naar hun land." },
      ] },
    ],
  },
  {
    id: "pasen-pinksteren", n: "Van Palmzondag tot Pinksteren", bereik: "Mattheüs 21 – Handelingen 2",
    kort: "De intocht in Jeruzalem, het avondmaal, Golgotha, het lege graf en de uitstorting van de Heilige Geest.",
    lessen: [
      { v: 118, lees: "Mattheüs 21:1–11", verzen: 11, min: 2, vragen: [
        { q: "Wat vonden de twee discipelen in het dorp?", ref: "Mattheüs 21:2", a: "Een ezelin die vastgebonden stond, met een veulen." },
        { q: "Wat riepen de scharen?", ref: "Mattheüs 21:9", a: "‘Hosanna den Zone Davids! Gezegend is Hij, Die komt in den Naam des Heeren!’" },
        { q: "De mensen in Jeruzalem vroegen: ‘Wie is Deze?’ Wat zeiden de scharen?", ref: "Mattheüs 21:10–11", a: "‘Deze is Jezus, de Profeet van Nazareth in Galilea.’" },
      ] },
      { v: 122, lees: "Lukas 22:7–20", verzen: 14, min: 2, vragen: [
        { q: "Welke twee discipelen moesten het pascha klaarmaken?", ref: "Lukas 22:8", a: "Petrus en Johannes." },
        { q: "Wie moesten Petrus en Johannes volgen om het huis te vinden?", ref: "Lukas 22:10", a: "Een man die een kruik water droeg." },
        { q: "Wat zei de Heere Jezus dat de discipelen moesten doen, toen Hij het brood gaf?", ref: "Lukas 22:19", a: "‘doet dat tot Mijn gedachtenis’." },
      ] },
      { v: 126, lees: "Johannes 19:16–30", verzen: 15, min: 3, vragen: [
        { q: "Hoe heette de plaats waar de Heere Jezus gekruisigd werd, en wat betekent die naam?", ref: "Johannes 19:17", a: "Golgotha: ‘Hoofdschedelplaats’." },
        { q: "In welke talen stond het opschrift boven het kruis?", ref: "Johannes 19:20", a: "In het Hebreeuws, het Grieks en het Latijn." },
        { q: "Wat zei de Heere Jezus voordat Hij de geest gaf?", ref: "Johannes 19:30", a: "‘Het is volbracht!’" },
      ] },
      { v: 129, lees: "Johannes 20:1–18", verzen: 18, min: 3, vragen: [
        { q: "Wie kwam het eerst bij het graf, Petrus of de andere discipel?", ref: "Johannes 20:4", a: "De andere discipel; hij liep sneller dan Petrus." },
        { q: "Voor wie hield Maria de Heere Jezus eerst?", ref: "Johannes 20:15", a: "Voor de hovenier (de tuinman): ‘menende, dat het de hovenier was’." },
        { q: "Wanneer herkende Maria de Heere Jezus, en wat zei ze?", ref: "Johannes 20:16", a: "Toen Hij haar naam noemde: ‘Maria!’ Zij zei: ‘Rabbouni’, dat betekent: Meester." },
      ] },
      { v: 134, lees: "Handelingen 2:1–13", verzen: 13, min: 2, vragen: [
        { q: "Op welk feest waren de discipelen allen eendrachtelijk bijeen?", ref: "Handelingen 2:1", a: "Op het Pinksterfeest." },
        { q: "Wat zagen de discipelen op ieder van hen komen?", ref: "Handelingen 2:3", a: "‘verdeelde tongen als van vuur’." },
        { q: "Waarom waren de mensen uit al die landen zo verbaasd?", ref: "Handelingen 2:6", a: "Ieder hoorde hen spreken in zijn eigen taal." },
      ] },
    ],
  },
  {
    id: "paulus", n: "De reizen van Paulus", bereik: "Handelingen 9–28",
    kort: "Op weg naar Damascus, de eerste zendingsreis, Filippi, de storm op zee en Paulus in Rome.",
    lessen: [
      { v: 143, lees: "Handelingen 9:1–19", verzen: 19, min: 4, vragen: [
        { q: "Wat vroeg Saulus aan de hogepriester?", ref: "Handelingen 9:2", a: "Brieven voor de synagogen in Damascus, om gelovigen gebonden naar Jeruzalem te brengen." },
        { q: "Wat zei de stem die Saulus hoorde?", ref: "Handelingen 9:4", a: "‘Saul, Saul! wat vervolgt gij Mij?’" },
        { q: "In welke straat moest Ananias Saulus zoeken?", ref: "Handelingen 9:11", a: "In de straat die de Rechte heet, in het huis van Judas." },
      ] },
      { v: 144, lees: "Handelingen 13:1–4; 14:8–18", verzen: 15, min: 3, vragen: [
        { q: "Wie zond Barnabas en Saulus op reis?", ref: "Handelingen 13:2–4", a: "De Heilige Geest." },
        { q: "Hoe noemden de mensen in Lystre Barnabas en Paulus?", ref: "Handelingen 14:12", a: "Barnabas noemden ze Jupiter en Paulus Mercurius." },
        { q: "Wat deden Barnabas en Paulus toen de mensen hun wilden offeren?", ref: "Handelingen 14:14", a: "Ze scheurden hun kleren en sprongen tussen de mensen." },
      ] },
      { v: 145, lees: "Handelingen 16:9–34", verzen: 26, min: 5, vragen: [
        { q: "Wat vroeg de Macedonische man in het gezicht?", ref: "Handelingen 16:9", a: "‘Kom over in Macedonië, en help ons.’" },
        { q: "Wat verkocht Lydia, en uit welke stad kwam ze?", ref: "Handelingen 16:14", a: "Purper; ze kwam uit Thyatira." },
        { q: "Wat deden Paulus en Silas rond middernacht in de gevangenis?", ref: "Handelingen 16:25", a: "Ze baden en zongen lofzangen voor God; de gevangenen luisterden." },
      ] },
      { v: 147, lees: "Handelingen 27:13–44", verzen: 32, min: 6, vragen: [
        { q: "Hoe heette de stormwind?", ref: "Handelingen 27:14", a: "Euroklydon." },
        { q: "Wat zei de engel van God in de nacht tegen Paulus?", ref: "Handelingen 27:23–24", a: "‘Vrees niet, Paulus’: hij moest voor de keizer komen, en God had hem allen gegeven die met hem voeren." },
        { q: "Hoeveel mensen waren er op het schip?", ref: "Handelingen 27:37", a: "276: ‘tweehonderd zes en zeventig zielen’." },
      ] },
      { v: 148, lees: "Handelingen 28:1–16, 30–31", verzen: 18, min: 4, vragen: [
        { q: "Wat kwam er uit het vuur en greep Paulus’ hand?", ref: "Handelingen 28:3", a: "Een adder." },
        { q: "Wat deed Paulus toen hij de broeders uit Rome zag?", ref: "Handelingen 28:15", a: "Hij dankte God en greep moed." },
        { q: "Hoe lang bleef Paulus in zijn eigen gehuurde woning in Rome?", ref: "Handelingen 28:30", a: "Twee hele jaren." },
      ] },
    ],
  },
];
