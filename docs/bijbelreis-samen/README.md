# Lesroutes: samen de Bijbel ontdekken (`/bijbelreis/lessen`)

Gebruikersreis: *als ouder of leerkracht een verhaal gebruiken om samen de Bijbel te ontdekken* — thuis, op de
zondagsschool of club, bij catechisatie en in de klas. Geen account, geen lesbeheersysteem.

## Wat er was, en wat ontbrak (meting 17-11-2026, vóór de wijziging)

Doorgelopen als ouder/leerkracht met Playwright op desktop 1440×900, tablet 820×1180 en telefoon 390×664
(isMobile + hasTouch). Vraag: kan ik binnen een minuut een verhaal kiezen dat bij mijn les past, het op een groot scherm
tonen, samen lezen, een paar vragen stellen en de kinderen het zelf laten nalezen?

| Onderdeel | Bevinding |
| --- | --- |
| ‘Voor ouders en leiders’ | Alleen uitleg (uitgangspunt, niveaus, jaartallen, privacy). Staat onderaan het reisboek, ná de 150 geschiedenissen: op y ≈ 11.000 px (desktop), 11.000 px (tablet), 12.000 px (telefoon). Niemand vindt het. |
| Presentatie en boekje (`/bijbelreis/boekje`) | Uitstekend voor digibord en printen, maar **geen enkele link** vanuit de atlas (0 links op desktop, tablet en telefoon). Alleen te vinden wie het adres kent. |
| Een verhaal kiezen bij een les | 150 geschiedenissen in een lange lijst met zoeken. Geen reeks voor ‘vier weken aartsvaders’ of ‘advent’; de kerstreis (thema Kerst) bestaat wel, met weekritme. |
| Samen lezen | Elke geschiedenis heeft ‘Lees in je Bijbel: …’. Goed. |
| Vragen stellen | Elke geschiedenis heeft meerkeuzevragen voor het kind zelf (onderaan het verhaal). Geen vragen voor de leiding om in de Bijbel te laten opzoeken, en geen antwoordblad. |
| Nalezen | Knop ‘Deel’ bij elk verhaal (niet bij Samen ontdekken). |
| Speurtocht | Per Bijbelboek of deel, niet per geschiedenis; geen eigen adres (deep link). Daarom geen speurtocht-link per les. |

Schermafbeeldingen vóór en ná: scratchpad van de sessie, map `samen/voor` en `samen/na` (niet in de repo).

## Wat er nu is

1. **Een pagina `/bijbelreis/lessen`** (`public/bijbelreis/lessen.html`, `lessen.js`, `lessen.css`) met acht lesroutes.
   Per les: de titel van de geschiedenis, **Lees samen: <Bijbelgedeelte>**, drie knoppen (**Presentatie** voor digibord of
   beamer, **In de atlas**, **Boekje** om te printen), twee of drie **vragen om op te zoeken** met ‘Zoek op: <vers>’ en
   een verborgen **antwoord voor de leiding**, en de korte link om **thuis na te lezen** (`bijbelreis.nl/#v13`).
2. **Bediening per route:** ‘Presentatie voor 4–6 jaar / 7–10 jaar / 11+’ (zet `&niveau=a|b|c` in de links naar het
   boekje; onthouden in `localStorage` onder `bijbelreis:lessen`, standaard het reisniveau van de atlas), ‘Toon de
   antwoorden’ (standaard verborgen, zodat de pagina zelf op het digibord kan), **Afdrukken voor de leiding** (A4, met
   antwoorden) en **Werkblad zonder antwoorden** (met een schrijfregel per vraag).
3. **Adressen:** `/bijbelreis/lessen` (overzicht), `#<route>` (één route), `#<route>/<n>` (les n in beeld). Een
   onbekende route toont het overzicht. bijbelreis.nl serveert de pagina zonder Worker-wijziging (`bijbelreisPagina`
   in `shared/bijbelreis.ts` doet elke `/bijbelreis/<naam>.html`); `scripts/postbuild.mjs` zet de versiehash erachter.
4. **Ingangen in de atlas:** onder de uitleg van **Verhalen** (het onderdeel waarmee de atlas opent, op alle drie
   niveaus) een blok ‘Samen lezen met kinderen of een groep? Lesroutes met presentatie en vragen →’, en bovenaan
   ‘Voor ouders en leiders’ een eigen kopje *Lesroutes*. De lesroutes geven zo ook de ontbrekende ingang naar het boekje.

Meting ná: de ingang staat in het eerste scherm op desktop (y = 473 van 900) en tablet (y = 777 van 1180); op de
telefoon net eronder (y = 692 van 664, één keer vegen). Van de start tot een geopende lesroute: drie tikken
(ingang → route → les), in de test ca. 1,7 s.

### Waarom zo (en niet anders)

- **Eigen pagina in plaats van een venster in de atlas.** Printen en digibord werken op een gewone pagina zonder de
  kaart; het adres is te delen (kerkapp, mail aan de leiding); en de gedeelde bestanden (`app.js`, `bijbelreis.html`,
  `bijbelreis.css`) veranderen maar een paar regels. Zelfde opzet als het boekje.
- **Geen tweede bron van verhalen.** Een les wijst met `v` naar een geschiedenis; titel, vertelling, kaart, presentatie
  en de meerkeuzevragen komen daarvandaan. `lessen-data.js` bevat alleen de reeks, het leesgedeelte en de zoekvragen.
- **Zoekvragen in plaats van nog meer meerkeuze.** De meerkeuzevragen staan al in het verhaal en in de presentatie.
  Wat ontbrak, is iets voor de leiding: een vraag met een vers erbij, zodat de kinderen zelf in de Bijbel zoeken. Elke
  vraag gaat over wat er staat; geen persoonlijke toepassing als toets, geen geloofsoordeel als goed/fout.
- **Hergebruik:** kop, knoppen en voet uit `boekje.css`, tokens uit `bijbelreis.css`; de vragen zijn grotendeels
  open versies van al gecontroleerde quizvragen van dezelfde geschiedenis (`geschiedenissen/*.js`, `niveaus/b.js`).
- **Acht routes, 35 lessen, 97 vragen.** Vier OT, drie NT en één rond Kerst; elke route 3–5 lessen (een maand of een
  periode). Alle 35 geschiedenissen hebben een versie voor alle drie de niveaus, dus de presentatie werkt ook voor 4–6.

## De routes en vragen (bronnen per vraag)

Elke vraag heeft een verwijzing (Statenvertaling-nummering) binnen het gedeelte dat je samen leest. Elk antwoord is
gecontroleerd met een regel in `scripts/bijbel-controle/lessen.txt` (`python3 scripts/bijbel-check.py
scripts/bijbel-controle/lessen.txt`: 97 gecontroleerd, 0 mis). Tekst tussen ‘…’ staat letterlijk in de Statenvertaling
(de unittest controleert dat); de rest is in eigen woorden.

### De aartsvaders in vier weken (`#aartsvaders`)

| Les | Geschiedenis | Lees samen | Vraag | Zoek op | Antwoord |
| --- | --- | --- | --- | --- | --- |
| 1 | 8. Abram gaat op weg naar Kanaän | Genesis 12:1–9 | Wie gingen er met Abram mee naar het land Kanaän? | Genesis 12:5 | Sarai, zijn vrouw, en Lot, de zoon van zijn broer; ze namen hun bezit en hun mensen mee. |
|  |  |  | Hoe oud was Abram toen hij uit Haran ging? | Genesis 12:4 | 75 jaar: ‘vijf en zeventig jaren oud’. |
|  |  |  | Wat bouwde Abram bij Sichem, waar de HEERE aan hem verscheen? | Genesis 12:7 | Een altaar voor de HEERE. |
| 2 | 13. Abraham moet Izak offeren | Genesis 22:1–19 | Naar welk land moest Abraham gaan? | Genesis 22:2 | Naar het land Moria. |
|  |  |  | Wat vroeg Izak onderweg aan zijn vader? | Genesis 22:7 | Hij zei: ‘Zie het vuur en het hout; maar waar is het lam tot het brandoffer?’ |
|  |  |  | Wat offerde Abraham in de plaats van zijn zoon? | Genesis 22:13 | Een ram, die met zijn hoornen vastzat in de struiken. |
| 3 | 15. Ezau en Jakob | Genesis 25:27–34; 28:10–22 | Wat gaf Jakob aan Ezau voor zijn eerstgeboorterecht? | Genesis 25:34 | Brood en ‘het linzenkooksel’. |
|  |  |  | Wat zag Jakob in zijn droom? | Genesis 28:12 | Een ladder op de aarde die tot aan de hemel reikte, en de engelen Gods klommen op en neer. |
|  |  |  | Welke naam gaf Jakob aan die plaats? | Genesis 28:19 | Bethel (de stad heette eerst Luz). |
| 4 | 17. Jakob keert terug en worstelt bij de Jabbok | Genesis 32:22–32; 33:1–4 | Welke nieuwe naam kreeg Jakob? | Genesis 32:28 | Israël. |
|  |  |  | Hoe noemde Jakob de plaats, en waarom? | Genesis 32:30 | Pniël, want hij zei: ‘ik heb God gezien van aangezicht tot aangezicht’. |
|  |  |  | Wat deed Ezau toen hij Jakob zag? | Genesis 33:4 | Hij liep hem tegemoet, omarmde hem, viel hem om de hals en kuste hem; en ze huilden. |

### Jozef in drie weken (`#jozef`)

| Les | Geschiedenis | Lees samen | Vraag | Zoek op | Antwoord |
| --- | --- | --- | --- | --- | --- |
| 1 | 18. Jozef wordt door zijn broers verkocht | Genesis 37 | Hoe oud was Jozef toen hij met zijn broers de kudde weidde? | Genesis 37:2 | Zeventien jaar. |
|  |  |  | Wat maakte Jakob (Israël) voor Jozef? | Genesis 37:3 | ‘een veelvervigen rok’: een kleurige mantel. |
|  |  |  | Voor hoeveel zilverlingen werd Jozef verkocht? | Genesis 37:28 | Twintig zilverlingen. |
| 2 | 19. Jozef blijft trouw in Egypte | Genesis 39:1–6; 41:14–46 | Waarom ging alles goed wat Jozef deed in het huis van Potifar? | Genesis 39:2–3 | De HEERE was met Jozef. |
|  |  |  | Wat zei Jozef tegen de farao toen die vroeg of hij dromen kon uitleggen? | Genesis 41:16 | ‘Het is buiten mij! God zal Farao’s welstand aanzeggen.’ |
|  |  |  | Hoe oud was Jozef toen hij voor de farao stond? | Genesis 41:46 | Dertig jaar. |
| 3 | 20. Jozef en zijn broers weer samen | Genesis 45:1–15 | Wat zei Jozef toen hij zich bekendmaakte aan zijn broers? | Genesis 45:3 | ‘Ik ben Jozef! leeft mijn vader nog?’ |
|  |  |  | Hoeveel jaren honger zouden er nog komen? | Genesis 45:6 | Nog vijf jaar (twee jaren honger waren al voorbij). |
|  |  |  | Wie had Jozef naar Egypte gezonden, volgens Jozef zelf? | Genesis 45:5–8 | God, om hen in leven te houden: ‘gij hebt mij herwaarts niet gezonden, maar God Zelf’. |

### Van Egypte naar Kanaän (`#egypte-kanaan`)

| Les | Geschiedenis | Lees samen | Vraag | Zoek op | Antwoord |
| --- | --- | --- | --- | --- | --- |
| 1 | 21. Mozes wordt gered uit het water | Exodus 2:1–10 | Hoe lang verborg de moeder haar zoontje? | Exodus 2:2 | Drie maanden. |
|  |  |  | Wie bleef van een afstand kijken wat er met het kistje gebeurde? | Exodus 2:4 | Zijn zus. |
|  |  |  | Waarom noemde de dochter van de farao hem Mozes? | Exodus 2:10 | Ze zei: ‘Want ik heb hem uit het water getogen.’ |
| 2 | 25. Het Pascha en de uittocht uit Egypte | Exodus 12:1–14, 21–28 | Waar moesten de Israëlieten het bloed van het lam strijken? | Exodus 12:7 | Aan de twee zijposten en aan de bovendorpel van de deur. |
|  |  |  | Wat zou de HEERE doen als Hij het bloed zag? | Exodus 12:13 | Het huis voorbijgaan: ‘wanneer Ik het bloed zie, zal Ik ulieden voorbijgaan’. |
|  |  |  | Wat moesten ouders zeggen als hun kinderen vroegen wat dit betekende? | Exodus 12:26–27 | Dat het een paasoffer voor de HEERE is, Die in Egypte de huizen van Israël voorbijging. |
| 3 | 26. Droog door de Schelfzee | Exodus 14:10–31 | Waarmee maakte de HEERE de zee droog, en hoe lang? | Exodus 14:21 | Met een sterke oostenwind, de hele nacht. |
|  |  |  | Hoe stond het water toen het volk door de zee ging? | Exodus 14:22 | Als een muur aan hun rechterhand en aan hun linkerhand. |
| 4 | 29. God geeft de Tien Geboden | Exodus 20:1–17 | Wat zegt God over Zichzelf voordat Hij de geboden geeft? | Exodus 20:2 | ‘Ik ben de HEERE uw God, Die u uit Egypteland, uit het diensthuis, uitgeleid heb.’ |
|  |  |  | Welke belofte staat bij het gebod om je vader en moeder te eren? | Exodus 20:12 | ‘opdat uw dagen verlengd worden in het land, dat u de HEERE uw God geeft’. |
| 5 | 38. Door de Jordaan | Jozua 3:14–4:9 | Wat gebeurde er toen de voeten van de priesters met de ark in het water kwamen? | Jozua 3:15–16 | Het water dat van boven kwam, bleef staan als een hoop; het volk trok over, tegenover Jericho. |
|  |  |  | Hoeveel stenen haalden ze uit de Jordaan, en waarom zoveel? | Jozua 4:8 | Twaalf, naar het getal van de stammen van Israël. |

### David: van herdersjongen tot koning (`#david`)

| Les | Geschiedenis | Lees samen | Vraag | Zoek op | Antwoord |
| --- | --- | --- | --- | --- | --- |
| 1 | 51. Saul verworpen, David gezalfd | 1 Samuël 16:1–13 | Waar kijkt de HEERE naar, zei Hij tegen Samuël? | 1 Samuël 16:7 | ‘de HEERE ziet het hart aan’; de mens ziet aan wat voor ogen is. |
|  |  |  | Waar was David toen Samuël bij Isaï kwam? | 1 Samuël 16:11 | Hij was de kleinste en weidde de schapen. |
|  |  |  | Wat gebeurde er toen Samuël David zalfde? | 1 Samuël 16:13 | De Geest van de HEERE kwam over David, van die dag af. |
| 2 | 52. David en Goliath | 1 Samuël 17:32–51 | Waarom durfde David tegen Goliath te gaan? | 1 Samuël 17:37 | De HEERE had hem gered van de leeuw en de beer; Die zou hem ook redden van de Filistijn. |
|  |  |  | Hoeveel stenen koos David uit de beek? | 1 Samuël 17:40 | Vijf gladde stenen. |
|  |  |  | Waar trof de steen Goliath? | 1 Samuël 17:49 | In zijn voorhoofd. |
| 3 | 54. David op de vlucht voor Saul | 1 Samuël 24:1–8 | Wat sneed David stilletjes af in de spelonk? | 1 Samuël 24:5 | Een slip van Sauls mantel. |
|  |  |  | Waarom wilde David Saul niets doen? | 1 Samuël 24:7 | Saul was ‘de gezalfde des HEEREN’. |
| 4 | 57. De ark naar Jeruzalem; Gods belofte aan David | 2 Samuël 7:1–17 | Waarom wilde David een huis voor God bouwen? | 2 Samuël 7:2 | Hij woonde zelf in een huis van cederhout, en de ark van God stond in een tent (‘in het midden der gordijnen’). |
|  |  |  | Door welke profeet sprak de HEERE tot David? | 2 Samuël 7:4–5 | Door Nathan. |
|  |  |  | Wat beloofde God over het koninkrijk van David? | 2 Samuël 7:16 | Dat het tot in eeuwigheid zou blijven: ‘uw koninkrijk tot in eeuwigheid’. |

### Profeten: Elia, Elisa, Jona en Daniël (`#profeten`)

| Les | Geschiedenis | Lees samen | Vraag | Zoek op | Antwoord |
| --- | --- | --- | --- | --- | --- |
| 1 | 63. Elia en de profeten van Baäl | 1 Koningen 18:20–39 | Hoeveel profeten van Baäl waren er op de Karmel? | 1 Koningen 18:22 | Vierhonderdvijftig. |
|  |  |  | Hoe vaak liet Elia water over het offer gieten? | 1 Koningen 18:34 | Drie keer. |
|  |  |  | Wat riep het volk toen het vuur van de HEERE viel? | 1 Koningen 18:39 | ‘De HEERE is God, de HEERE is God!’ |
| 2 | 64. Naäman wordt genezen | 2 Koningen 5:1–14 | Wie vertelde dat de profeet in Samaria Naäman kon genezen? | 2 Koningen 5:2–3 | Een klein meisje uit het land Israël, dat bij de vrouw van Naäman diende. |
|  |  |  | Hoe vaak moest Naäman zich wassen in de Jordaan? | 2 Koningen 5:10 | Zeven keer. |
|  |  |  | Hoe was zijn huid daarna? | 2 Koningen 5:14 | ‘gelijk het vlees van een kleinen jongen’; hij was rein. |
| 3 | 69. Jona vlucht voor de HEERE | Jona 1:1–17 | Waar wilde Jona met het schip naartoe? | Jona 1:3 | Naar Tarsis. |
|  |  |  | Wie beschikte de grote vis, en hoe lang was Jona erin? | Jona 1:17 | De HEERE; drie dagen en drie nachten. |
| 4 | 75. Daniël in de leeuwenkuil | Daniël 6:11–24 | Hoe vaak per dag bad Daniël, en naar welke stad stonden zijn vensters open? | Daniël 6:11 | Drie keer per dag; de vensters stonden open naar Jeruzalem. |
|  |  |  | Wat zei Daniël uit de kuil tegen de koning? | Daniël 6:23 | ‘Mijn God heeft Zijn engel gezonden, en Hij heeft den muil der leeuwen toegesloten’. |

### Advent en Kerst (`#advent-kerst`)

| Les | Geschiedenis | Lees samen | Vraag | Zoek op | Antwoord |
| --- | --- | --- | --- | --- | --- |
| 1 | 80. Zacharias en de engel in de tempel | Lukas 1:5–25 | Wat mocht Zacharias in de tempel doen? | Lukas 1:9 | Het reukoffer brengen; het lot was op hem gevallen. |
|  |  |  | Hoe heette de engel? | Lukas 1:19 | Gabriël. |
|  |  |  | Waarom kon Zacharias niet meer spreken? | Lukas 1:20 | Hij had de woorden van de engel niet geloofd. |
| 2 | 81. De engel bij Maria en de droom van Jozef | Lukas 1:26–38 | In welke stad woonde Maria? | Lukas 1:26–27 | In Nazareth, in Galilea. |
|  |  |  | Welke naam moest het Kind krijgen? | Lukas 1:31 | JEZUS. |
|  |  |  | Wat antwoordde Maria aan het eind? | Lukas 1:38 | ‘Zie, de dienstmaagd des Heeren; mij geschiede naar uw woord.’ |
| 3 | 83. De geboorte van de Heere Jezus in Bethlehem | Lukas 2:1–7 | Welke keizer gaf het bevel dat iedereen ingeschreven moest worden? | Lukas 2:1 | Keizer Augustus. |
|  |  |  | Waarom moest Jozef naar Bethlehem? | Lukas 2:4 | Hij was uit het huis en geslacht van David. |
|  |  |  | Waarom legde Maria het Kind in een kribbe? | Lukas 2:7 | Er was voor hen geen plaats in de herberg. |
| 4 | 84. De herders bij de kribbe | Lukas 2:8–20 | Wat was het teken voor de herders? | Lukas 2:12 | Een Kindje in doeken gewonden, liggend in de kribbe. |
|  |  |  | Wat zong de menigte van het hemelse leger? | Lukas 2:14 | ‘Ere zij God in de hoogste hemelen, en vrede op aarde, in de mensen een welbehagen.’ |
|  |  |  | Wat deed Maria met alles wat er gezegd werd? | Lukas 2:19 | Ze bewaarde het allemaal en dacht erover na in haar hart. |
| 5 | 85. De wijzen uit het oosten en de vlucht naar Egypte | Mattheüs 2:1–12 | Wat vroegen de wijzen in Jeruzalem? | Mattheüs 2:2 | ‘Waar is de geboren Koning der Joden?’ |
|  |  |  | Welke geschenken brachten de wijzen? | Mattheüs 2:11 | Goud, wierook en mirre. |
|  |  |  | Waarom gingen de wijzen niet terug naar Herodes? | Mattheüs 2:12 | God waarschuwde hen in een droom; ze gingen langs een andere weg terug naar hun land. |

### Van Palmzondag tot Pinksteren (`#pasen-pinksteren`)

| Les | Geschiedenis | Lees samen | Vraag | Zoek op | Antwoord |
| --- | --- | --- | --- | --- | --- |
| 1 | 118. De intocht in Jeruzalem | Mattheüs 21:1–11 | Wat vonden de twee discipelen in het dorp? | Mattheüs 21:2 | Een ezelin die vastgebonden stond, met een veulen. |
|  |  |  | Wat riepen de scharen? | Mattheüs 21:9 | ‘Hosanna den Zone Davids! Gezegend is Hij, Die komt in den Naam des Heeren!’ |
|  |  |  | Wie is Deze, zeiden de scharen? | Mattheüs 21:11 | ‘Deze is Jezus, de Profeet van Nazareth in Galilea.’ |
| 2 | 122. Het Heilig Avondmaal | Lukas 22:7–20 | Welke twee discipelen moesten het pascha klaarmaken? | Lukas 22:8 | Petrus en Johannes. |
|  |  |  | Hoe vonden zij het huis? | Lukas 22:10 | Ze volgden een man die een kruik water droeg. |
|  |  |  | Wat zei de Heere Jezus dat de discipelen moesten doen, toen Hij het brood gaf? | Lukas 22:19 | ‘doet dat tot Mijn gedachtenis’. |
| 3 | 126. Gekruisigd op Golgotha | Johannes 19:16–30 | Hoe heette de plaats waar de Heere Jezus gekruisigd werd, en wat betekent die naam? | Johannes 19:17 | Golgotha: ‘Hoofdschedelplaats’. |
|  |  |  | In welke talen stond het opschrift boven het kruis? | Johannes 19:20 | In het Hebreeuws, het Grieks en het Latijn. |
|  |  |  | Wat zei de Heere Jezus voordat Hij de geest gaf? | Johannes 19:30 | ‘Het is volbracht!’ |
| 4 | 129. De Heere is opgestaan | Johannes 20:1–18 | Wie kwam het eerst bij het graf, Petrus of de andere discipel? | Johannes 20:4 | De andere discipel; hij liep sneller dan Petrus. |
|  |  |  | Wanneer herkende Maria de Heere Jezus, en wat zei ze? | Johannes 20:16 | Toen Hij haar naam noemde: ‘Maria!’ Zij zei: ‘Rabbouni’, dat betekent: Meester. |
| 5 | 134. De Heilige Geest wordt uitgestort | Handelingen 2:1–13 | Op welk feest gebeurde dit? | Handelingen 2:1 | Op het Pinksterfeest. |
|  |  |  | Wat zagen de discipelen op ieder van hen komen? | Handelingen 2:3 | ‘verdeelde tongen als van vuur’. |
|  |  |  | Waarom waren de mensen uit al die landen zo verbaasd? | Handelingen 2:6 | Ieder hoorde hen spreken in zijn eigen taal. |

### De reizen van Paulus (`#paulus`)

| Les | Geschiedenis | Lees samen | Vraag | Zoek op | Antwoord |
| --- | --- | --- | --- | --- | --- |
| 1 | 143. Saulus op weg naar Damascus | Handelingen 9:1–19 | Wat vroeg Saulus aan de hogepriester? | Handelingen 9:2 | Brieven voor de synagogen in Damascus, om gelovigen gebonden naar Jeruzalem te brengen. |
|  |  |  | Wat zei de stem uit de hemel? | Handelingen 9:4 | ‘Saul, Saul! wat vervolgt gij Mij?’ |
|  |  |  | In welke straat moest Ananias Saulus zoeken? | Handelingen 9:11 | In de straat die de Rechte heet, in het huis van Judas. |
| 2 | 144. Paulus en Barnabas op reis | Handelingen 13:1–4; 14:8–18 | Wie zond Barnabas en Saulus op reis? | Handelingen 13:2–4 | De Heilige Geest. |
|  |  |  | Hoe noemden de mensen in Lystre Barnabas en Paulus? | Handelingen 14:12 | Barnabas noemden ze Jupiter en Paulus Mercurius. |
|  |  |  | Wat deden Barnabas en Paulus toen de mensen hun wilden offeren? | Handelingen 14:14 | Ze scheurden hun kleren en sprongen tussen de mensen. |
| 3 | 145. Paulus gaat naar Filippi | Handelingen 16:9–34 | Wat vroeg de Macedonische man in het gezicht? | Handelingen 16:9 | ‘Kom over in Macedonië, en help ons.’ |
|  |  |  | Wat verkocht Lydia, en uit welke stad kwam ze? | Handelingen 16:14 | Purper; ze kwam uit Thyatira. |
|  |  |  | Wat deden Paulus en Silas rond middernacht in de gevangenis? | Handelingen 16:25 | Ze baden en zongen lofzangen voor God; de gevangenen luisterden. |
| 4 | 147. Een ramp op zee | Handelingen 27:13–44 | Hoe heette de stormwind? | Handelingen 27:14 | Euroklydon. |
|  |  |  | Wat zei de engel van God in de nacht tegen Paulus? | Handelingen 27:23–24 | ‘Vrees niet, Paulus’: hij moest voor de keizer komen, en God had hem allen gegeven die met hem voeren. |
|  |  |  | Hoeveel mensen waren er op het schip? | Handelingen 27:37 | 276: ‘tweehonderd zes en zeventig zielen’. |
| 5 | 148. Paulus in Rome | Handelingen 28:1–16, 30–31 | Wat kwam er uit het vuur en greep Paulus’ hand? | Handelingen 28:3 | Een adder. |
|  |  |  | Hoe lang bleef Paulus in zijn eigen gehuurde woning in Rome? | Handelingen 28:30 | Twee hele jaren. |

## Wat een mens nog moet nalezen

Automatisch gecontroleerd: dat elke les naar een bestaande geschiedenis en bestaande reisstappen wijst, dat het
leesgedeelte binnen de geschiedenis valt, dat elke vraag een verwijzing binnen dat gedeelte heeft, dat elk citaat
letterlijk in de Statenvertaling staat en dat de controleregel van elk antwoord klopt. **Niet** gecontroleerd: of de
eigen woorden van een antwoord de tekst eerlijk weergeven, en of keuze en toon passen bij alle protestants-christelijke
lezers. Geen theoloog of leerkracht heeft meegelezen. Graag nalezen, vooral:

1. **2 Samuël 7:2** — ‘in het midden der gordijnen’ is in het antwoord uitgelegd als ‘in een tent’ (vgl. 2 Samuël 6:17).
2. **Genesis 37:3** — ‘een veelvervigen rok’ uitgelegd als ‘een kleurige mantel’; vertalingen verschillen hier.
3. **Lukas 22:19** (Heilig Avondmaal) — de vraag vraagt alleen wat de Heere Jezus zei dat de discipelen moesten doen
   (‘doet dat tot Mijn gedachtenis’); bewust geen vraag over de betekenis van brood en wijn.
4. **Johannes 19** (Golgotha) en **Johannes 20** — alleen feiten uit de tekst (naam, opschrift, laatste woord); nagaan of
   dat voor jonge kinderen de goede toon is. Er staat geen afbeelding op de pagina.
5. **Exodus 20:12** — de vraag noemt geen nummer van het gebod (de telling verschilt tussen tradities) en zegt niet dat
   dit ‘het’ gebod met een belofte is.
6. **Versnummers** volgen de Statenvertaling (o.a. Daniël 6:11 en 6:23, Jona 1:17). In een andere vertaling kan een
   versnummer afwijken; de pagina zegt dat onderaan. Nagaan of dat bij Daniël 6 en Jona 1–2 met de HSV het geval is
   en of er een tweede nummer bij moet.
7. **Lukas 2:4** — ‘Waarom moest Jozef naar Bethlehem?’ geeft als antwoord zijn afstamming van David; de aanleiding
   (de inschrijving) staat in Lukas 2:1–3.
8. **Namen en titels van routes** (‘Van Palmzondag tot Pinksteren’, ‘De aartsvaders’ zonder Jozef, die een eigen route
   heeft) en de keuze van de geschiedenissen per route.

## Bestanden en tests

| Bestand | Wat |
| --- | --- |
| `public/bijbelreis/lessen.html`, `lessen.js`, `lessen.css` | de pagina |
| `public/bijbelreis/lessen-data.js` | de acht routes (`BR.lessen`) |
| `public/bijbelreis/app.js`, `bijbelreis.html`, `bijbelreis.css` | de ingang in Verhalen en in ‘Voor ouders en leiders’ (een paar regels; CSS-blok onderaan) |
| `scripts/postbuild.mjs` | versiehash ook voor `lessen.html` |
| `scripts/bijbel-controle/lessen.txt` | één controleregel per vraag (Statenvertaling) |
| `tests/bijbelreis-lessen.test.ts` | bestaande geschiedenissen en stappen, verwijzingen binnen het leesgedeelte, citaten letterlijk, controleregels, adres op bijbelreis.nl |
| `e2e/bijbelreis-samen.spec.ts` | van de start naar een les en het verhaal, niveau en presentatie, link naar één les, afdrukken (leiding en werkblad), toegankelijkheid |
| `e2e/a11y.spec.ts` | `/bijbelreis/lessen` toegevoegd |

Een nieuwe route of vraag: voeg hem toe in `lessen-data.js`, zet een regel in `lessen.txt`, en draai
`python3 scripts/bijbel-check.py scripts/bijbel-controle/lessen.txt` en `npx vitest run tests/bijbelreis-lessen.test.ts`.

## Niet gedaan

- Geen speurtocht-link per les: de speurtocht heeft geen eigen adres per geschiedenis. De meerkeuzevragen van het
  verhaal staan wel onderaan het verhaal in de atlas en in de presentatie.
- De bezoekmeting (`bezoek.js`) telt deze pagina niet: de server kent alleen ‘atlas’ en ‘boekje’.
- Niet in de sitemap van bijbelreis.nl (daar staat alleen `/`); dat hoort bij het SEO-spoor.
- Geen nieuwe tekst voor kinderen en geen tekeningen: alles verwijst naar wat er al is.
