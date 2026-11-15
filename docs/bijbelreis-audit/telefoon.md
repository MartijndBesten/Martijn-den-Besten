# Bijbelreis op de telefoon

Opdracht van Martijn (november 2026): *“Zorg dat de site ook speciaal voor telefoon gemaakt wordt. Nu is het veel te veel
info en werkt het eigenlijk vooral op groter scherm. Met name het visuele dus.”* Daarbij een tweede eis, voor telefoon én
desktop: *“Ur–Kanaän integreren in een persoon”* (verdiepende delen onder hun hoofddeel).

Dit verslag heeft drie delen: wat er mis was (gemeten), wat er gebouwd is, en wat er na de bouw gemeten en gecontroleerd is.

## 1. Vóór: wat er mis was

Gemeten op 360×740, 390×844 (iPhone 13, zichtbaar 390×664) en 412×915, op alle drie de reisniveaus, met een servertje
op `public/` (zie §4). Schermen: de start, een deel-intro (`#abraham`), een stap met reis (`#abraham/2`), stappen zonder
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

## 4. Werkwijze en bestanden

- Servertje (buiten de repo): `mobiel-server-8820.mjs` in de scratchmap van deze sessie, poort 8820, `public/` met
  `/bijbelreis` → `bijbelreis.html`.
- Schermafbeeldingen en metingen: `mobiel-schermen.cjs <voor|na>` (telefoon) en `mobiel-desktop.cjs <voor|na>` (desktop).
- Na de bouw: `telefoon-shots.cjs` (de schermen van de opdracht op 360/390/412 en 1440) en `desktop-vergelijk.cjs`
  (pixelvergelijking desktop tegen commit cba74d3 op een tweede servertje, poort 8821); de e2e-tests draaiden tegen de
  gebouwde site (`npm run build`, `dist/client`) op poort 8820.
