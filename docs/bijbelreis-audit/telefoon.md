# Bijbelreis op de telefoon

Opdracht van Martijn (november 2026): *“Zorg dat de site ook speciaal voor telefoon gemaakt wordt. Nu is het veel te veel
info en werkt het eigenlijk vooral op groter scherm. Met name het visuele dus.”* Daarbij een tweede eis, voor telefoon én
desktop: *“Ur–Kanaän integreren in een persoon”* (verdiepende delen onder hun hoofddeel).

Dit verslag heeft vier delen: wat er mis was (gemeten), wat er gebouwd is, wat er na de bouw gemeten en gecontroleerd is,
en (§4) de herziening ‘Kaart voorop’. **§4 vervangt voor het onderdeel Reis de punten 2.2, 2.3 en 2.4 en keuze 3.1**: de
kaart is daar geen blok van 46 % met een pagina eronder meer, maar het scherm zelf, met één stapblad eroverheen. De rest
(het keuzeblad, de verdiepende delen, ‘Verder met’, Lezen) geldt nog.

## 1. Vóór: wat er mis was

Gemeten op 360×740, 390×844 (iPhone 13, zichtbaar 390×664) en 412×915, op alle drie de reisniveaus, met een servertje
op `public/` (zie §5). Schermen: de start, een deel-intro (`#abraham`), een stap met reis (`#abraham/2`), stappen zonder
reis met tafereel (`#uittocht/6`, `#kies-het-leven/3`), een zeereis (`#nt-paulusrome/5`), een verhaal (`#v26`), de tabs
Wie is wie, Tijdlijn, Speurtocht (kaartvraag) en Paspoort, de stand Nu met de laag Vandaag, en de vier laden.

| Meting (telefoon, Reis) | Samen ontdekken (a) | Zelf op reis / Verder ontdekken (b, c) |
| --- | --- | --- |
| Waar begint de tekst van een stap? | na 1,02–1,28 schermhoogte | na 1,12–1,42 schermhoogte |
| Lengte van de pagina bij een stap | 1,9–3,0 schermen | 3,1–4,4 schermen |
| Lengte bij een deel-intro | 1,7–2,3 schermen | 3,9–5,3 schermen |
| Lengte bij een verhaal (`#v26`) | 1,5–1,9 schermen | 4,1–6,1 schermen |
| Knop ‘Verder’ onder de stap | op 1.022–1.429 px | op 1.501–2.076 px |
| Kaart bedekt door bediening | 5,2–5,9 % (3 elementen) | 16,6–19,8 % (7 elementen) |
| Tikdoelen kleiner dan 44 px (Reis) | 18–21 | 34–55 (Paspoort: 188) |
| Horizontaal scrollen van de pagina | nee | nee (wel twee rijen die zelf opzij schuiven) |

Wat je ziet (schermafbeeldingen in `docs/bijbelreis-audit/screenshots/telefoon/`, `voor-*.jpg`):

1. **De tekst staat nooit in het eerste scherm.** Onder de kaart komen eerst de stappenbalk, de rij ‘Bijbelboek’ met vier
   overzichtslinks op twee regels, een rij boeken die halverwege een woord wordt afgesneden, de rij delen, en dan pas de
   stapkaart met kruimelpad, voortgang, verwijzing, jaartal met labels en ‘Hoe weten we dat?’, personen, en daarna de tekst.
2. **Alles staat tegelijk open.** Na de tekst: ‘Lees in je Bijbel’, een weetje, ‘Hoe ver?’, de knoppen Terug/Verder, alle
   25 stappenbolletjes per hoofdstuk, ‘Laat dit hele deel zien’, ‘Hoe ver?’, ‘Voor ouders en leiders’, het colofon en de
   makersvermelding. Een stap van Abraham is ruim vier schermen lang.
3. **Dubbele informatie.** De naam van het deel staat vier keer in beeld: in de delenrij, in het kruimelpad, in de
   stappenbalk (‘Abraham · 2 van 25’) en boven de stappenlijst (‘Alle stappen: Abraham’). Ook ‘Hoe ver?’ staat er twee keer.
4. **Vooruit en terug.** ‘Verder’ staat onder de kaart (verdwijnt zodra je leest) en onder de stap (twee schermen verder).
   Met één duim door een reis lopen betekent steeds op en neer scrollen.
5. **De kaart is vol knoppen.** Zeven bedieningselementen (zoom, Toen/Nu, Legenda, Vandaag, Bijbelwereld, Hele reis, Groot)
   en de schaalbalk bedekken bijna een vijfde van een kaart van 278–383 px hoog.
6. **Labels in de stand Nu.** In het overzicht van een deel krijgt elke plaats haar moderne naam eronder; die vallen over
   elkaar en over de landnamen (‘Hebron · Mamre’ / ‘Hebron (al-Khalil)’ / ‘Westelijke Jordaanoever’ in `voor-kaart.jpg`).
7. **Het tafereel staat twee schermen diep**, 288×126 px, ná de hele tekst; het knopje ‘nog een keer’ staat over de tekening.
8. **Verdiepende delen als losse knop.** ‘Ur–Kanaän’ staat in de delenrij tussen ‘Begin’ en ‘Abraham’, ‘Kies het leven’
   naast ‘Moab’, terwijl ze een uitwerking van een stuk van dat hoofddeel zijn.

Wat goed is en blijft: de vaste onderbalk met de zes onderdelen, de grote kaart (‘Groot’) met één-vinger-slepen, de
twee-vingers-hint, de kop, de kleuren en lettertypen, Samen ontdekken in korte stappen.

## 2. Wat er gebouwd wordt

Alles hieronder geldt tot en met 900 px breed (`isNarrow()`, het bestaande blok `@media (max-width: 900px)`), behalve §2.6.

1. **Eén regel om te kiezen.** Boven de stap staat één regel ‘Genesis › Abraham · 2 van 25’ (bij een verdiepend deel
   ‘Jakob › Jakob bij de Jabbok · 6 van 10’; een te lange regel loopt door op een tweede regel, er wordt niets afgekapt).
   Een tik opent het blad ‘Kies een reis’ van onderen: bovenaan de delen van het gekozen boek, dan de boeken als compacte
   knoppen (zonder jaartal) en de vier overzichten (Alle 66 boeken, Alle reizen, Alle plaatsen, Vandaag). Het zijn dezelfde knoppen als op de desktop; ze verhuizen op de telefoon naar het blad.
2. **Een stap is één scherm.** Volgorde: kiesregel, titel, tekst, tafereel (op volle breedte), personen, ‘Lees in je
   Bijbel’ (met de verwijzing). Het label ‘Wat de Bijbel vertelt’ en de regel met de afstand vallen op de telefoon weg. Wat niet nodig is om de stap te volgen, staat één tik verder achter knoppen met
   een duidelijke naam: **Wist je dat?**, **Hoe ver?**, **Wanneer?** (jaartal en grond), **Elders in de Bijbel**
   (deel-intro) en **Alle stappen** (stappenlijst, ‘Laat dit hele deel zien’ en ‘Hoe ver?’). Het colofon staat onder
   ‘Voor ouders en leiders’.
3. **Vooruit en terug met de duim.** De stappenbalk staat vast onderaan, boven de onderdelen: ◀ · ‘2 van 25’ · Verder ▶.
   Vegen naar links of rechts op de stapkaart gaat ook naar de volgende of vorige stap (niet op de kaart).
4. **Rustige kaart.** Op de kaart blijven zoom, één knop **Kaart** (Toen/Nu, Vandaag, Bijbelwereld en Legenda in één
   paneel), ‘Hele reis’ en ‘Groot’. De schaalbalk staat alleen op de grote kaart. De kaart is in de reis 46 % van de
   schermhoogte (was 42 %) en blijft bij elke stap even hoog. Een open ballon van een plaats ligt vrij: zolang hij open
   is, wijken de zwevende knoppen, en hij past in de kaart. De kop blijft bovenaan staan, zodat er niets onder de
   statusbalk van de telefoon doorschuift. In de stand Nu staat de moderne naam alleen bij de
   plaatsen van de stap (hooguit drie), niet bij alle plaatsen van een deel; actieve namen wijken eerder uit.
5. **Lezen.** Het verhaal (niveau b en c) begint met het eerste onderdeel en een knop **Lees verder**.
6. **Verdiepende delen (ook desktop).** Een deel met `bij: "<hoofddeel>"` heeft geen eigen knop in de delenrij of het
   keuzeblad. In de intro van het hoofddeel staat de ingang ‘Van dichtbij: Van Ur naar Kanaän · Genesis 11:27–12:5’, en
   ook bij de stappen van het hoofddeel die binnen die verwijzing vallen. Open je het, dan blijft het hoofddeel in de
   delenrij gemarkeerd, is het kruimelpad ‘Genesis › Abraham › Van Ur naar Kanaän’, staat er ‘← Terug naar Abraham’, en
   gaat ‘Verder’ na de laatste stap naar het hoofddeel. In Alle reizen, Hoe ver?, de tijdlijn, de speurtocht en het paspoort
   staat het onder zijn hoofddeel. Diepe links en opslag blijven gelijk.

7. **Verder met (ook desktop).** Bovenaan Verhalen staat geen reisetiket meer (etappe, nummer, routeregel, ‘Ergens anders
   beginnen’), maar alleen als er voortgang is één knop ‘Verder met: Terug naar Jeruzalem’ of, na een reisstap, ‘Verder
   met: Jakob – Bedrogen!’. Een nieuwe bezoeker ziet niets; de keuze van het reisniveau bij het eerste bezoek blijft.

Niets wordt weggehaald: elk onderdeel is op elk niveau nog bereikbaar, met dezelfde verschillen tussen de niveaus.

## 3. Na: metingen en keuzes

Gemeten op dezelfde manier en dezelfde schermen als in §1 (360×740, 390×844 als iPhone 13 met zichtbaar 390×664, en
412×915; alle drie de niveaus).

| Meting (telefoon, Reis) | Samen ontdekken (a) vóór → na | Zelf op reis / Verder ontdekken (b, c) vóór → na |
| --- | --- | --- |
| Waar begint de tekst van een stap? | 1,02–1,28 → **0,64–0,70** schermhoogte | 1,12–1,42 → **0,64–0,71** schermhoogte |
| Lengte van de pagina bij een stap | 1,9–3,0 → **1,4–2,1** schermen | 3,1–4,4 → **1,6–2,7** schermen |
| Lengte bij een deel-intro | 1,7–2,3 → **1,2–1,5** schermen | 3,9–5,3 → **1,5–2,0** schermen |
| Lengte bij een verhaal (`#v26`) | 1,5–1,9 → **1,1–1,5** schermen | 4,1–6,1 → **2,7–4,1** schermen (met ‘Lees verder’) |
| Knop ‘Verder’ | op 1.022–1.429 px → **vast in beeld** (551–802 px, boven de onderdelen) | op 1.501–2.076 px → **vast in beeld** (551–802 px) |
| Hoogte van de kaart (Reis) | 278–383 px (42 %) → **305–421 px (46 %)** | 278–383 px (42 %) → **305–421 px (46 %)** |
| Kaart bedekt door bediening | 5,2–5,9 % (3 elementen) → **4,2–4,8 % (2)** | 16,6–19,8 % (7 elementen) → **8,8–9,3 % (4)** |
| Tikdoelen kleiner dan 44 px (Reis) | 18–21 → **4** | 34–55 → **4** (Paspoort: 188 → 176) |
| Horizontaal scrollen van de pagina | nee → nee | nee → nee (de twee schuivende rijen zijn weg) |

Op de drie formaten van de opdracht (360×740, 390×844, 412×915, niveau b) staan de titel en de eerste 3–7 regels van
de hoofdtekst (16,6 px) samen met de kaart (340, 388 en 421 px hoog) in het eerste scherm, ook bij `#jakob-jabbok/6`,
`#uittocht/6` en `#sinai/3`. De open ballon van Berg Sinaï past in de kaart en wordt door geen knop bedekt. De vier
resterende kleine tikdoelen zijn de skiplink, de niveauknop in de kop (24 px hoog), ‘Voor ouders en leiders’ en de
makersvermelding onderaan.

Keuzes tijdens de bouw, na de schermafbeeldingen van Martijn (*“niet zo’n klein kaartje … die hoofdtekst moet goed
duidelijk blijven”*):

1. **De kaart is groter en blijft even groot.** In de reis 46 % van de schermhoogte (was 42 %). Het plan om de kaart bij
   een stap met tafereel te verlagen is vervallen: het tafereel staat nu direct ná de tekst, zodat titel en tekst altijd in
   het eerste scherm staan. Het label ‘Wat de Bijbel vertelt’ en de regel met de afstand vallen op de telefoon weg (de
   afstand staat onder ‘Hoe ver?’, de verwijzing bij ‘Lees in je Bijbel’); ‘← Terug naar …’ staat onder de tekst.
2. **Ballon vrij.** Zolang een ballon open is, wijken zoom, ‘Kaart’, ‘Hele reis’ en ‘Groot’; de ballon krijgt kleine
   marges en een eigen schuifbalk als hij hoger is dan de kaart. Boven 900 px gelden de oude instellingen.
3. **Keuzeblad zonder afgesneden kaarten.** Bovenaan ‘Deel uit Genesis’ met de delen, daarna de boeken als compacte
   knoppen in een raster en de overzichten. Alles breekt binnen het blad af; na de keuze van een boek schuift het blad
   terug naar de delen. Bij Samen ontdekken staat alleen ‘Alle 66 boeken’ in het blad, zoals op de desktop.
4. **Statusbalk.** De kop blijft op de telefoon bovenaan staan (`position: sticky`, met `safe-area-inset-top` voor de
   notch); er schuift dus niets meer onder de statusbalk door. `viewport-fit=cover` blijft.
5. **Verder met.** Het reisetiket bovenaan Verhalen (‘Verder waar je was’, ‘Etappe 9 van 16’, nummer, routeregel,
   ‘Ergens anders beginnen’) is vervangen door één knop ‘Verder met: …’, alleen bij voortgang; op alle niveaus en ook op
   de desktop. De opslagsleutels (`welkomWeg`, `laatst`, `huidig`) blijven ongemoeid; `welkomWeg` wordt niet meer gelezen.
6. **Desktop.** Naast ‘Verder met’ verandert alleen het `bij`-mechanisme: geen knop meer voor Ur–Kanaän en Jabbok in de
   delenrij, de ingang ‘Van dichtbij’ bij het hoofddeel, en de verdiepende delen onder hun hoofddeel in de tijdlijn, Alle
   reizen, de speurtocht en het paspoort. Gecontroleerd met een pixelvergelijking op 1440×900 tegen de stand vóór de
   telefoonopzet: kaart, stappenbalk, laden, legenda, Wie is wie en verhalen zijn gelijk.

Schermafbeeldingen vóór en na: `voor-na-stappen-360.jpg`, `voor-na-niveaus-390-412.jpg`, `voor-na-tabs-laden-360.jpg`.

Nog te verbeteren: de boekenrij op de desktop is nog steeds afgesneden (bewust niet aangeraakt, eis: desktop gelijk);
op een iPhone in Safari (zichtbaar 390×664) staan bij een stap ongeveer drie regels tekst boven de balk; het paspoort
heeft nog veel kleine stempelknoppen.

## 4. Kaart voorop (november 2026)

Aanleiding: Martijn, met een schermafbeelding van zijn eigen iPhone (Safari): *“Ja, maar dit scherm op de telefoon is toch
niet af zo? Superveel tekst en informatie. Je ziet de kaart half niet. Dit moet echt duidelijk verbeterd worden. Denk goed
na hoe je dit nog op een veel betere manier kan doen. Drie vierde van het scherm moet wel echt kaart zijn en dan moet je
gewoon door kunnen klikken en een kort stukje tekst zien of zo. Dit is nog steeds veel tekst met plaatjes die ik nu als
laatste zie hier.”* Eerder: *“De routes moeten duidelijk zijn. Overzichtelijk.”* en *“Nu is het veel te veel info … Met name
het visuele dus.”*

De opzet van §2 bleef een kaart met een pagina tekst eronder. Daarom is het onderdeel Reis op de telefoon (tot 900 px,
`isNarrow()`) opnieuw opgezet. De desktop en de andere onderdelen (Verhalen, Wie is wie, Tijdlijn, Speurtocht, Paspoort)
houden hun opzet: een kaart met de pagina eronder.

### 4.1 Hoe het werkt

1. **De kaart is het scherm.** In de reis scrolt de pagina niet. Onder de kop ligt de kaart tot aan de onderbalk met de zes
   onderdelen; je sleept hem met één vinger en zoomt met twee vingers of met − en +. De knop ‘Groot’ en de
   twee-vingers-hint zijn er in de reis niet meer (in de andere onderdelen wel).
2. **Het stapblad, kort.** Eén blad onderaan, over de kaart: een kleine regel waar je bent (‘Genesis › Izak · 1 van 8’; tik:
   ‘Kies een reis’), de titel, hooguit twee regels tekst en de knoppen ◀ en Verder (in het overzicht van een deel: Start).
   Daartussen een rustige streep: zo ver ben je in dit deel. De tekst is het begin van de staptekst: eindigt die na hele
   zinnen op de tweede regel, dan stopt hij daar; anders kapt de opmaak hem af met ‘…’. Samen ontdekken toont de ene zin
   die er al stond, groter. Titel en tekst zijn samen altijd drie regels (een lange titel krijgt er twee, de tekst dan
   één; op een laag scherm samen twee), zodat het blad en de knop Verder bij elke stap op dezelfde plek staan.
3. **Het stapblad, open.** ‘Lees meer’ (of een tik op de titel of de tekst, of omhoog vegen) schuift het blad omhoog tot
   driekwart van het venster; het scrolt binnenin. Eerst het tafereel, dan de hele tekst, personen, ‘Lees in je Bijbel’,
   ‘Van dichtbij’, ‘Om over na te denken’, en achter de knoppen ‘Wist je dat?’, ‘Hoe ver?’, ‘Wanneer?’, ‘Elders in de
   Bijbel’ en ‘Alle stappen’; daaronder ‘Voor ouders en leiders’ en de makersvermelding. De regel met ‘Sluiten’ blijft
   bovenaan staan, ◀ en Verder onderaan. Sluiten: de knop, Escape, een tik op de kaart of omlaag vegen. Niets is weggehaald,
   op geen van de drie niveaus.
4. **Doorklikken.** Verder en ◀ (ook: naar links of rechts vegen over het blad, of de pijltjestoetsen) gaan naar de
   volgende stap; de kaart vliegt ernaartoe, de reiziger loopt, het blad blijft kort. Ook na een keuze uit ‘Alle stappen’
   of ‘Laat dit hele deel zien’ is het blad weer kort.
5. **De route past in het vrije deel.** Elke uitsnede (`fit`) houdt ruimte vrij: boven de rij kaartknoppen plus de hoogte
   van de kameel, opzij 44 px, onder de hoogte van het korte blad plus 30 px. Een stap op één plek staat in het midden
   van het vrije deel. Een ballon van een plaats blijft boven het blad (de kaartknoppen wijken zolang hij open is). Namen
   van plaatsen komen niet onder het blad; de naam van een plaats van de stap die aan de rand aan geen kant past, schuift
   onder of boven de plaats naar binnen.
6. **Weinig knoppen, in één rij bovenaan.** Links − en +, daarnaast ‘Hele reis’; rechts ‘Kaart’ (Toen/Nu, Vandaag,
   Bijbelwereld, Legenda). Onderaan de kaart staat niets meer: daar ligt het blad. De legenda ligt als paneel boven het blad.
7. **Kop en onderbalk lager.** De kop is één regel van 44 px (titel links, reisniveau rechts; 40 px op een laag scherm),
   de onderbalk 48 px. In elk onderdeel even hoog, zodat er bij het wisselen niets verspringt. De melding ‘Nieuwe
   stempel’ staat onder de rij kaartknoppen: niet over de kop, niet over het blad.
8. **De kaartplaat.** De hoge kaart reikt bij het overzicht van een lange reis (Paulus naar Rome, 22 lengtegraden op een
   scherm van 390 px breed) verder dan de ondergrond. Daar ligt nu papier met een kaderlijn, als een kaart in een atlas,
   in plaats van een zee waar het land recht is afgesneden. Onder het korte blad mag de uitsnede voorbij de zuidrand van
   de ondergrond reiken (daar zie je de kaart toch niet); Leaflet houdt de kaart verder binnen de ondergrond. Dat
   terugschuiven wacht tijdens een vlucht naar de volgende stap tot de kaart er is: op een hoge kaart brak het de vlucht
   anders halverwege af en stond de route buiten beeld (gevonden met de kameeltest op 412×839).
9. **Toegankelijk.** Het blad is een gebied (‘Reisboek’) met een knop met `aria-expanded`; de volgorde is de regel, ‘Lees
   meer’, de inhoud, ◀, Verder. Alles kan zonder vegen. Bij ‘minder beweging’ staat het blad er meteen. Tekst in het blad
   is minstens 16 px (de kleine regel 13 px, etiketten en jaartallabels blijven klein). Veilige randen (notch,
   thuisbalk) via `safe-area-inset`.
10. **Liggend en tablet.** Op een liggende telefoon staat het blad links onderin en blijft de kaart ernaast vrij; op een
    tablet in portretstand is het blad 560 px breed, in het midden.

Diepe links (`#deel/stap`) en opslag (`bijbelreis:*`) zijn ongewijzigd.

### 4.2 Metingen

Gemeten op het zichtbare venster van een telefoonbrowser mét browserbalken (`isMobile`, `hasTouch`), in de korte stand, op
`#izak/1`, `#abraham/2`, `#jakob`, `#jakob-jabbok/7`, `#uittocht/6`, `#sinai/3` en `#nt-paulusrome/5`; het blad is bij elke
stap even hoog. Eis: vrije kaart minstens 60 % van het venster (streven 65 %) en minstens 70 % van de ruimte tussen kop
en onderbalk; kort blad hooguit 27 % van het venster.

| Venster | Kop | Onderbalk | Kort blad | Vrije kaart | % van het venster | % tussen kop en onderbalk | Blad % van het venster |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 390×664 (iPhone 13, Safari) | 44 | 48 | 155 px | 417 px | **62,7 %** | 72,8 % | 23,4 % |
| 360×640 | 44 | 48 | 155 px | 393 px | **61,4 %** | 71,7 % | 24,3 % |
| 375×553 (kleine iPhone, Safari) | 40 | 48 | 130 px (één regel tekst) | 335 px | **60,6 %** | 72,1 % | 23,4 % |
| 430×739 | 44 | 48 | 155 px | 492 px | **66,5 %** | 76,0 % | 21,0 % |
| 390×844 (volle scherm) | 44 | 48 | 155 px | 597 px | **70,7 %** | 79,3 % | 18,4 % |

Samen ontdekken (de zin staat er groter): 159 px blad, dus 62,2 %, 60,7 %, 60,6 % en 66,0 %. Vóór deze herziening was de
kaart op 390×664 305 px hoog (46 % van het venster), met knoppen erin; nu is 417 px vrij.

Het streven van 65 % is op 390×664 niet gehaald. Het blad is 155 px: 26 (de kleine regel) + 23 (titel) + 2 + 43 (twee
regels) + 61 (streep, ◀ en Verder van 44 px hoog, randen). Voor 65 % moet het blad 140 px zijn; dat kan alleen door de
tekst naar één regel te brengen of de kleine regel weg te halen. Twee regels tekst en ‘waar je bent’ zijn hier zwaarder
gewogen dan de laatste 2 %. Van de ruimte tussen kop en onderbalk is 73 % kaart: de ‘drie vierde’ van de aanleiding.

### 4.3 Bewust anders dan het ontwerp

1. **Kop en onderbalk zijn in álle onderdelen lager**, niet alleen in de reis (44 en 48 px, waren 52 en 62). Een balk die
   bij het wisselen van onderdeel van hoogte verandert, verspringt onder je duim.
2. **De kleine regel bovenaan is 26 px hoog**, geen 44: elke pixel daar gaat van de kaart af. Hij is wel breed, en het blad
   opent ook met een tik op de titel of de tekst. ◀, Verder, de kaartknoppen, de onderbalk en alles in het open blad zijn
   44 px of meer.
3. **Het boek valt uit de kleine regel als hij niet past** (‘Naar Rome · 5 van 9’ in plaats van ‘Handelingen › Naar Rome ·
   5 van 9’); in het overzicht van een deel staat het boek met het aantal stappen, omdat de naam van het deel de titel is.
4. **Geen titel van de stap als label op de kaart.** De namen van de plaatsen van de stap staan er al vet bij; een tweede
   label botst op een smal scherm met die namen en met de reiziger.
5. **De ‘+’ en ‘−’ zijn niet klein** maar 44 px, naast elkaar in de rij bovenaan.
6. **De kaartplaat (4.1.8)** stond niet in het ontwerp; ze volgt uit ‘de kaart is het scherm’ op een hoog scherm.

### 4.4 Wat er nog zwak is

- Op een echte iPhone telt de statusbalk mee in het venster (de kop loopt eronder door): van het hele glas is dan minder
  dan 62 % kaart, van de ruimte tussen kop en onderbalk nog steeds ruim 70 %. De maten hierboven zijn in Chromium gemeten,
  niet op een iPhone; `100dvh`, het vegen en het meeveren van Safari zijn niet op een echt toestel geprobeerd.
- Het blad volgt de vinger niet: omhoog of omlaag vegen opent of sluit het pas bij het loslaten.
- Het overzicht van een heel lange reis (Paulus naar Rome) is op een smal scherm klein: de kaartplaat vult daar ongeveer de
  helft van het vrije deel.
- In het overzicht van een deel staan veel namen dicht op elkaar (bestond al); op de grotere kaart valt dat meer op.
- Op een liggende telefoon is de kaart laag (de kop en de onderbalk blijven staan); bruikbaar, niet fraai.
- De referentiebeelden van de visuele test voor telefoon en tablet (`e2e/bijbelreis-visueel.spec.ts-snapshots/*-mobiel-*`
  en `*-tablet-*`) horen bij de oude opzet en moeten in het vaste Playwright-image opnieuw gemaakt en bekeken worden.

### 4.5 Tests

`e2e/bijbelreis-telefoon.spec.ts` is herschreven: per venstermaat (390×664, 360×640, 375×553, 430×739) de maten van 4.2,
de route in het vrije deel, de ballon, doorklikken en slepen, het open blad, bereikbaarheid op elk niveau, kiezen, de
kaartknoppen, tikdoelen, kop en melding, en de andere onderdelen; daarnaast toegankelijkheid, beweging, diepe links, een
lange titel en 200 % zoom. In de andere specs is aangepast wat op de telefoon bewust anders gaat: het stapblad eerst
openen (`bladOpen`) waar een test iets van de stap wil zien, en de kaartbediening (één vinger sleept in de reis; de hint
en ‘Groot’ horen bij de andere onderdelen).

Daarnaast, met losse scripts buiten de repo:

- **Rondgang langs alle 622 stappen en overzichten** (minder beweging): liggen de route, de plaatsen, de reiziger en de
  namen van de stap in het vrije deel? 390×664: 0 afwijkingen; 412×839: 0; 375×553: 1 (de naam ‘Lachis’ steekt 4 px over
  de linkerrand).
- **Toegankelijkheid (axe, WCAG 2.1 A en AA)**: het korte en het open blad op `#abraham/2`, `#jakob` en
  `#jakob-jabbok/7`, op de drie niveaus (390×664): geen overtredingen.
- **Desktop ongewijzigd**: 22 schermen op 1440×900 en 1000×800 (stappen, overzichten, ballon, Verhalen, een verhaal,
  Tijdlijn, Wie is wie, Paspoort) zijn pixel voor pixel gelijk aan de stand vóór deze herziening.

Los hiervan gevonden, niet gewijzigd: bij een hashwissel zonder herladen (het adres met de hand aanpassen) opent de goede
stap, maar loopt het adres in de adresbalk één stap achter (`setMode("reis")` schrijft eerst het oude adres terug).

### 4.6 Na de eerste dag live (16-11-2026)

Twee opmerkingen van Martijn op zijn iPhone, beide verwerkt:

1. **“Wat heeft de afbeelding met de tekst te maken?”** (bij Jozef, ‘Twee dromen in de cel’: een rivier met palmen). In
   het open blad staat het beeld bovenaan, en bij 171 van de 560 stappen was dat een automatische ‘algemene tekening’ van
   de plaats. Die automatische tekeningen zijn uitgezet: er staat alleen nog een beeld als het aan die stap gekoppeld is
   (`docs/bijbelreis-taferelen/README.md` §1).
2. **“Waar vind ik die extra plaatjes van Genesis 32? Ik had die bij Jakob verwacht.”** De ingang ‘Van dichtbij’ stond
   alleen in het open blad, onder de tekst. Nu:
   - de drie stappen van Jakob over Genesis 32–33 (‘Bang voor Ezau’, ‘Worstelen in de nacht’, ‘Broers weer samen’) tonen
     zelf een tekening uit de reeks;
   - bij de intro van een hoofddeel en bij de stappen over hetzelfde gedeelte staat op de kaart, direct boven het korte
     blad, één knop ‘Van dichtbij · Jakob bij de Jabbok · 12 stappen’ (`#dichtbijBtn`). De uitsnede van de kaart houdt
     die ruimte vrij. De knop is weg zolang het blad, een ballon of het kaartpaneel open is. Hetzelfde geldt voor
     Abraham (Van Ur naar Kanaän) en Moab (Kies dan het leven).

### 4.7 De eerste tien seconden, en delen (16-11-2026)

**Cijfers van de eerste ochtend van de bezoekmeting** (40 bezoeken, 34 op de telefoon, alle herkomst ‘direct’, dus een
doorgestuurde link of een getypt adres; kleine steekproef, met de bezoeken van de maker erbij): 16 bezoeken korter dan 10
seconden, 11 langer dan een minuut, 7 met minstens één geopende reisstap.

**Wat een nieuwe bezoeker zag:** een kaart met stippen en daaronder de vraag ‘Hoe wil je op reis?’ met drie leeftijden.
Nergens stond wat dit is of waar je begint, en je moest eerst kiezen.

**Wat er nu staat** (`renderWelkom` in `app.js`, `.startkaart`), bij een bezoeker die nog niets geopend heeft:

1. Eén zin: “Volg de reizen uit de Bijbel op de kaart, stap voor stap. Voor naast je eigen Bijbel.”
2. Eén grote knop die meteen begint: **Begin de reis ▶** met eronder ‘Abraham · van Ur naar Kanaän’. Hij opent `#abraham`:
   de reis met de kaart voorop, het overzicht van de route en de knop Start.
3. Klein: ‘Voor wie?’ met drie knoppen (4–6 jaar, 7–10 jaar, 11+). ‘Zelf op reis’ staat al aan; kiezen is niet nodig.
   De standaard wordt bij het eerste bezoek meteen bewaard (`bijbelreis:niveau` = `b`); vroeger gebeurde dat pas bij het
   kiezen, waardoor wie niet koos bij het tweede bezoek voor ‘al onderweg’ doorging en de volledige inhoud kreeg.
4. ‘Of kies hieronder zelf een verhaal.’ De lijst staat er gewoon onder.

In de kersttijd is de seizoenskaart de hoofdingang: dan staat alleen de zin erboven, en ‘Of begin bij Abraham’ met ‘Voor
wie?’ eronder (`#welkomNa`). Zodra er voortgang is, staat er alleen ‘Verder met: …’, zoals voorheen. Wie een niveau koos
maar nog niets opende, houdt de startknop. Een gedeelde link (`#v26`, `#jakob`) opent meteen het verhaal of het deel; de
startkaart komt er niet tussen.

Op de telefoon is de kaart bij dit eerste bezoek lager (32 % van de schermhoogte, minstens 180 px, in plaats van 42 %;
`body.eerste`), zodat de zin en de knop in het eerste scherm staan. Gemeten op het zichtbare venster (isMobile, hasTouch):

| Venster | Kaart | Onderkant startknop | Bovenkant onderbalk | Hele startkaart in beeld |
| --- | --- | --- | --- | --- |
| 390×664 | 212 px | 426 px | 616 px | ja (564 px) |
| 375×553 | 180 px | 390 px | 505 px | nee, ‘Voor wie?’ deels (528 px) |
| 360×640 | 205 px | 419 px | 592 px | ja (556 px) |
| 390×664, kersttijd | 212 px | 524 px (‘Lees deel 2’) | 616 px | n.v.t. |
| 375×553, kersttijd | 180 px | 488 px | 505 px | n.v.t. |
| 360×640, kersttijd | 205 px | 540 px | 592 px | n.v.t. |

**Delen.** Alle bezoekers kwamen via een doorgestuurde link. Eén knop **Deel** (`deelLink` in `app.js`) staat bij een
geschiedenis (bij de titel en onderaan), bij de intro en de laatste stap van een deel (in het open stapblad of de
stapkaart; niet in het korte stapblad, dat is even hoog gebleven) en op de seizoenskaart. Op de telefoon opent hij het
deelmenu van het toestel (`navigator.share`; WhatsApp staat daar vanzelf bij). Is dat er niet, dan wordt de link
gekopieerd met de melding ‘Link gekopieerd’; lukt ook dat niet, dan staat de link in een veld. Gedeeld wordt alleen de
titel, ‘Op reis door de Bijbel’ en het adres op `https://bijbelreis.nl/` (`#v26`, `#jakob`, `#kerst-belofte`): geen
reisniveau, geen voortgang, niets van de bezoeker. Niet bij Samen ontdekken. Geen extern script en geen wa.me-link; de
CSP is ongewijzigd. Het deelvoorbeeld (og-tags, `og.png`) is voor elke link hetzelfde, omdat het deel achter de `#` niet
naar de server gaat.

Tests: `e2e/bijbelreis-start.spec.ts`, `tests/bijbelreis-kerst.test.ts` (het weekritme).

### 4.8 Terug, de start, de stappen en een persoon (telefoontest 16-11-2026)

Doorgelopen op een echte telefoon (Samsung Galaxy A15, Chrome, 384×699 CSS-pixels) via ADB, met echte tikken en de
terugknop van Android. Vier punten opgelost:

- **Terug ging de site uit.** Elke stap, elk onderdeel en elk venster verving het adres (`history.replaceState`), dus de
  geschiedenis bleef één plek lang. Nu (`navZet`, `laagOpen`/`laagDicht` en `popstate` in `app.js`): een ander
  onderdeel, deel of geschiedenis is een nieuwe plek; een andere stap in hetzelfde deel niet (daarvoor zijn ◀ en Verder);
  wat binnen één tik gebeurt telt als één plek. Een venster (Kies een reis, Lees meer, Voor wie, Mis je iets en de andere
  lades, de grote kaart) krijgt een eigen plek: terug sluit eerst het venster. Gaat een venster met de eigen knop dicht,
  dan wordt die plek met `history.back()` opgeruimd. Een zelf ingetypt adres met `#` werkt zoals voorheen.
- **‘Begin de reis’ start bij stap 1** (`#abraham/1`), niet bij de intro met nog een knop ‘Start’.
- **‘3 van 25’ toont de stappen.** Bovenaan ‘Kies een reis’ staan de stappen van het deel (gezien ✓, huidige stap
  gemarkeerd en in beeld); daaronder zoals voorheen deel en boek.
- **Een persoon begint bij de naam.** Na een tik op een persoon staat de kaart in Wie is wie met de naam net onder de kop
  (`scroll-margin-top`), niet halverwege.

Tests: `e2e/bijbelreis-terug.spec.ts` (project ‘mobiel’), `e2e/bijbelreis-start.spec.ts`.

Nog open uit dezelfde test (niet in deze wijziging): de kaart op tabbladen waar hij niets toevoegt en maximaal ingezoomd
bij Golgotha, ‘Verder met’ boven een geopende geschiedenis, punten pas bij de volgende vraag, de vraag over ‘de put’
zonder context, het paspoort met 619 stempels, Sara als vrouw én zus bij Abraham, de zoektoets die het toetsenbord niet
sluit, en tikvlakken van 30 px.
### 4.9 Duidelijke bediening (16-11-2026)

Martijn, bij een schermbeeld van de desktop op het tabblad Speurtocht: *“het is niet heel duidelijk wat die knoppen
bovenaan zijn.”* Niet zeker welke knoppen; alle drie aangepakt, zonder de opzet te veranderen.

1. **Tabbladen.** Elk tabblad heeft een korte uitleg (`.tabuitleg`, via `aria-describedby`; de naam blijft het ene
   woord): Verhalen ‘150 geschiedenissen’ (het aantal komt uit de inhoud), Reis ‘route op de kaart’, Wie is wie ‘personen,
   families’, Tijdlijn ‘wanneer het gebeurde’, Speurtocht ‘vragen en zoeken’, Paspoort ‘jouw stempels’.
   - Vanaf 1360 px staat de uitleg als tweede regel onder het woord; de tabbladen krijgen daarvoor meer breedte en de kop
     blijft 64 px hoog.
   - Van 901 tot 1360 px verschijnt de uitleg bij aanwijzen en bij toetsenbordfocus (pijltjestoetsen in de tabbalk).
   - Op de telefoon blijft de onderbalk één woord en 48 px hoog; de uitleg is er alleen voor de schermlezer.
2. **Toen | Nu.** Op de desktop staat er ‘Kaart van’ voor, en elke knop heeft een uitleg bij aanwijzen en focus: ‘Het
   land zoals in de Bijbelse tijd’ en ‘Landen en plaatsnamen van nu’ (ook als beschrijving voor de schermlezer). Op de
   telefoon staat de schakelaar al onder de kop ‘Kaart’ in het kaartpaneel: daar geen label.
3. **Speurtocht.** Boven de keuze staat het boek als keuzelijst (‘Boek’, met de thema’s apart). Een ander boek kiezen
   verandert alleen de vragen, niet de plek in de reis; bij het openen van het tabblad volgt de speurtocht weer het boek van
   de reis. ‘Over wie?’ heet nu ‘Waar gaan de vragen over?’, ‘Alles uit Genesis’ heet ‘Heel Genesis’, en een verdiepend
   deel staat als kleinere, gestippelde knop ‘Van dichtbij: Jakob bij de Jabbok’ direct na zijn hoofddeel (het heeft eigen
   vragen die niet in het hoofddeel zitten, dus weglaten zou vragen onbereikbaar maken). Eén zin zegt wat er gebeurt:
   ‘Tien vragen over Jakob. Een goed antwoord geeft een punt, bijna goed een half punt; aan het eind zie je je score en tot
   drie sterren.’ Bij Samen ontdekken: ‘Zes vragen over …’.

Test: `e2e/bijbelreis-bediening.spec.ts`.

### 4.10 UX-ronde 17-11-2026

Doel: een kind van 6, een kind van 10 en een ouder begrijpen de Bijbelreis zelfstandig. Geen nieuwe functies; alleen wat
bij het doorlopen aantoonbaar misging. Drie gebruikersreizen zijn met Playwright doorgelopen op 390×664, 375×553, 360×640
en 430×739 (isMobile, hasTouch), 820×1180 (tablet) en 1440×900, met schermafbeeldingen en metingen vóór en na:
(a) eerste bezoek → ‘Begin de reis’ → doorklikken; (b) Verhalen → een geschiedenis → ‘Volg het op de kaart’ → tafereel →
terug → de volgende geschiedenis; (c) delen. Daarnaast een rondgang langs alle 687 stappen en overzichten (zoom, botsende
namen) op 390×664, 375×553 en 1440×900. De vóórmetingen zijn tegen `main` (57e32c6) gedaan, de nametingen tegen deze
wijziging.

**Wat goed ging en zo bleef.** De startkaart staat op 390, 360 en 430 px hoog helemaal in het eerste scherm (op 375×553
valt ‘Voor wie?’ deels weg, zie 4.7); ‘Begin de reis’ opent stap 1; Verder, ◀, ‘Volg het op de kaart’ en ‘terug’ doen wat
je verwacht. Delen (c): Chromium op Linux heeft geen `navigator.share`; met toestemming voor het klembord komt ‘Link
gekopieerd’ en staat `https://bijbelreis.nl/#v3` op het klembord, zonder toestemming verschijnt het veld met de link,
geselecteerd en met de focus erin. Geen fouten in de console. De taferelen bij de doorlopen stappen en geschiedenissen
(o.a. de zondeval, Jakob bij de Jabbok) passen bij de tekst; aan de illustraties is niets veranderd.

| # | Punt | Vóór (gemeten) | Na | Wat er veranderd is |
| --- | --- | --- | --- | --- |
| 1 | Kaart waar hij niets toevoegt (telefoon, tablet) | Paspoort en Tijdlijn: kaart 199 px (35 % van de ruimte tussen kop en onderbalk), inhoud begint op 257 px; Speurtocht: kaart 279 px (49 %) bij elke vraag, ook bij meerkeuze en volgorde. Geen van de drie gebruikt de kaart (geen plaats, geen uitsnede). | Paspoort, Tijdlijn en de speurtocht zonder kaartvraag: geen kaart, inhoud op 58 px. Bij ‘Tik op de kaart’ staat hij er (279 px), helemaal onder de kop met de zoomknoppen in beeld. Wie is wie houdt de kaart (de plaatsen van een persoon). | CSS (`body[data-modus]`, `:has(#p-quiz .tapcall)`); `fit()` slaat een verborgen kaart over en neemt eerst de echte maat als hij terugkomt; `scroll-margin-top` op de kaart. |
| 2 | Te ver ingezoomd | 10 stappen op zoom 13 (het maximum; ‘+’ uit): Jabbok 6–8, Lijdensweek 1, 2, 4, 6, 8, Lijden 1 en 7 (Golgotha); 23 op 12. Bij Golgotha alleen vage ondergrond, geen ‘Jeruzalem’. | Telefoon en tablet hooguit 11,5, groot scherm hooguit 12. Golgotha toont ‘Jeruzalem’ erbij; Mahanaïm en Pniël liggen los. Zelf inzoomen kan tot 13. | `zoomStap()` in `app.js`, in `fit()` en bij een stap op één plek. De velden `zoom` in de inhoud zijn niet veranderd. |
| 3 | ‘Verder met …’ boven een geopende geschiedenis | Na ‘Verder met: Abraham – God zegt: ga!’ en dan Noach openen: de knop bleef boven Noach staan (desktop op 82 px, boven de titel op 236 px). | Weg zolang een geschiedenis open is; terug in de lijst staat ‘Verder met: Noach bouwt de ark’. | `renderWelkom`. |
| 4 | Zoektoets sluit het toetsenbord niet | `type="search"`, maar geen `enterkeyhint`; Enter liet de focus (en dus het toetsenbord) in het veld. | `enterkeyhint="search"` op de drie zoekvelden; Enter sluit op een aanraakscherm het toetsenbord (blur). Op een computer blijft de focus staan. | `app.js`, `bijbelreis.html`. |
| 5 | Tikvlakken < 44 px | Geen tikvlak onder 24 px (WCAG 2.2 AA gehaald). Onder 44 px in de hoofdbediening: reisniveau in de kop 32, ‘← Alle geschiedenissen’ 25, Alles/OT/NT 37, ‘Wanneer?’ 32 en ‘Meer weten’ 40, ‘Volg het op de kaart’-regels 30, ‘Op de kaart’ 40, ‘Voor ouders en leiders’ 28. | Allemaal 44 px; het reisniveau via een onzichtbaar randje (de kop blijft 44 px). | CSS. Bewust niet: ‘3 van 25’ en ‘Lees meer’ (26 px, keuze 4.3.2: elke pixel daar gaat van de kaart af; titel en tekst openen het blad ook), kernwoorden (30), ‘Wanneer was dat?’ in de tijdlijn (28), en Wie is wie, Speurtocht en Paspoort (ander spoor). |
| 6 | Hoofdreis en verdiepende reis | ‘Kies een reis’ toonde alleen de stappen en de delen; een verdiepend deel stond er niet in, in Jakob was ‘Jakob bij de Jabbok’ hier onvindbaar. In de delenrij staat het hoofddeel al gekozen als je in een verdiepend deel bent. | Na stap 8 van Jakob een eigen regel ‘Van dichtbij · Jakob bij de Jabbok · 12 stappen’: ingesprongen, gestippeld, oker (zoals de knop op de kaart). In het verdiepende deel heet de lijst ‘Van dichtbij: …’ met onderaan ‘Terug naar Jakob’. Zo ook Abraham (Van Ur naar Kanaän) en Moab. | `kiesStappen` in `app.js`; `BIJBELREIS.md`. |
| 7 | Namen over elkaar | Rondgang 687 stappen en overzichten: 390×664 1 botsing, 375×553 2, 1440×900 32 (waarvan 22 overzichten van een deel, o.a. Davids rijk met Gibeon, Baäl-Perazim, Gath en Dal Refaïm op één plek). | 1440×900: 11 (alleen stappen waar twee plaatsen van de stap zelf vlak bij elkaar liggen, zoals Jericho en Ai); van de overzichten nog 1. Telefoon gelijk. | In het overzicht van een deel met meer dan vier namen wijken op een groot scherm de namen behalve begin en eind bij botsing, zoals op de telefoon al gebeurde; ze komen terug bij inzoomen. Routelijnen niet veranderd: het contrast was niet aantoonbaar slecht. |
| 8 | Terug en diepe links | `#deel`, `#deel/n`, `#boek`, `#vNN`, `#verhalen` en terug werken (4.8). Wel mis: een onbekende `#` (`#onzin`, `#v999`) opende stil ‘Het begin’ in de reis en schreef `#begin` in het adres; na herladen in Wie is wie, Tijdlijn, Paspoort, Speurtocht of Verhalen stond je in de reis (5 van 5). Een telefoon die een tabblad op de achtergrond weggooit, laadt ook opnieuw. | Een onbekende `#` opent de start (zoals zonder `#`) en het adres wordt `/bijbelreis`; na herladen blijf je in hetzelfde onderdeel (de browser bewaart het in de geschiedenis). Personen en onderdelen hebben geen eigen diepe link; dat is zo gelaten. | `begin()` in `app.js`. |
| – | Toegankelijkheid (melding spoor vindbaar) | WCAG 2.5.3: de naam van ‘3 van 25’ (`aria-label` ‘Kies een reis. Nu: Genesis, Abraham, stap 2 van 25’) en van de stappen in ‘Kies een reis’ bevatte de zichtbare tekst niet (axe: 1 + 11 knoppen). WCAG 2.4.11: plaatsen buiten beeld of onder knoppen/het stapblad kregen toetsenbordfocus (`#abraham/2`: 5 van de 17 op de telefoon, 6 op de desktop; `#nt-paulusrome/5`: 5 en 7). | axe: 0. Alleen plaatsen die te zien zijn, zitten in de tabvolgorde (`#abraham/2` telefoon 12, desktop 11; geen enkele buiten beeld). | De naam is nu de zichtbare tekst met verborgen ‘Kies een reis. Nu:’ ervoor (geen `aria-label`); `tabIndex` van de plaatsen na elke kaartbeweging (`refreshLabels`). De kop van ‘Kies een reis’ met ‘Sluiten’ blijft staan als de lijst naar de huidige stap scrolt (bij 200 % tekst viel hij anders weg door de extra regel ‘Van dichtbij’). |
| – | ‘Begin de reis’ legt Ur onder ‘Van dichtbij’ | Stap 1 ‘Weg uit Ur’: de uitsnede werd gekozen vóórdat de knop ‘Van dichtbij’ verscheen. Routepunten onder de knop: 390×664 2, 375×553 3, 360×640 2, 430×739 0. Ur (begin van de route) was niet te zien. | 0 op alle vier. | In `select()` staat de knop er nu vóór de uitsnede. |

**Tests.** `e2e/bijbelreis-ux-reis.spec.ts` legt alles hierboven vast (tegen `main` faalden 13 van de 15 tests op telefoon
en desktop; de twee die slaagden, gaan over wat al goed was: 430×739 en Enter op de computer). Aangepast:
`e2e/bijbelreis-jakob-jabbok.spec.ts` (zoom bij de worsteling 11,5 tot 12 in plaats van minstens 12),
`e2e/bijbelreis-telefoon.spec.ts` (geen kaart in Tijdlijn, Speurtocht en Paspoort; de naam van ‘3 van 25’) en
`e2e/bijbelreis.spec.ts` (de proeven met één vinger en ‘Groot’ in een ander onderdeel lopen nu in Wie is wie). De visuele
referentiebeelden `paspoort-mobiel`, `paspoort-tablet` (geen kaart meer) en mogelijk `verhaal-mobiel`/`-tablet` (44 px)
moeten in het vaste Playwright-image opnieuw gemaakt worden.

**Nog open.** Het overzicht van een heel lange reis blijft op een smal scherm klein (4.4; daarvoor is een andere opzet van
de kaart nodig, geen kleine aanpassing). ‘3 van 25’ en ‘Lees meer’ blijven 26 px hoog (4.3.2). Op 375×553 valt ‘Voor wie?’
op de startkaart deels onder de onderbalk (4.7). Niet op een echt toestel geprobeerd; alles is in Chromium gemeten.
Schermafbeeldingen en metingen: de scratchmap van de sessie, `ux-reis/voor` en `ux-reis/na` (scripts `meet.cjs`,
`rondgang.cjs`, `dichtbij2.cjs`, `herlaad.cjs`).

## 5. Werkwijze en bestanden

- Servertje (buiten de repo): `mobiel-server-8820.mjs` in de scratchmap van deze sessie, poort 8820, `public/` met
  `/bijbelreis` → `bijbelreis.html`.
- Schermafbeeldingen en metingen: `mobiel-schermen.cjs <voor|na>` (telefoon) en `mobiel-desktop.cjs <voor|na>` (desktop).
- Na de bouw: `telefoon-shots.cjs` (de schermen van de opdracht op 360/390/412 en 1440) en `desktop-vergelijk.cjs`
  (pixelvergelijking desktop tegen commit cba74d3 op een tweede servertje, poort 8821); de e2e-tests draaiden tegen de
  gebouwde site (`npm run build`, `dist/client`) op poort 8820.
- Kaart voorop (§4): de gebouwde site via `npx vite preview --port 8828`; schermafbeeldingen en metingen met `shots.cjs`
  (vier venstermaten) en `extra.cjs` (tablet, liggend, lange titel, legenda, desktop), de rondgang langs alle stappen met
  `veeg-alles.cjs`, in de scratchmap van de sessie (`kaartvoorop/`).
