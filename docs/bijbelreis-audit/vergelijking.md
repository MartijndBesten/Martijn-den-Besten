# Bijbelreis 2.0: vergelijking met verwante producten

*Webonderzoek, 25 oktober 2026. Alle bronnen zijn op die datum geraadpleegd (zie [Bronnen](#bronnen)).*

## Leeswijzer en beperkingen

- **Methode.** De live Bijbelreis is opgehaald en gelezen (`/bijbelreis`, `/bijbelreis/app.js`, `/bijbelreis/inhoud/genesis.js`, `/bijbelreis/plaatsen.js`, `/bijbelreis/bijbelreis.css`). Voor de andere producten zijn de officiële websites, winkelvermeldingen, documentatie en, waar te vinden, onafhankelijke recensies gebruikt. Apps zijn **niet** geïnstalleerd of op een echt toestel getest. Wat hieronder over telefoongebruik staat, komt dus uit documentatie en broncode en niet uit eigen testen.
- **Feit, analyse en advies lopen door elkaar**, maar zijn te herkennen: feiten hebben een bron, en zinnen met "advies" of "principe" zijn analyse.
- **Reviews zijn schaars.** Voor The World Bible, BibleLine en Bible Terra zijn geen onafhankelijke recensies of gebruikersbesprekingen gevonden. Alle drie zijn kleine, recente webprojecten (© 2026). Hun eigen claims zijn dus niet onafhankelijk bevestigd.
- **Productnamen.** Niet elke genoemde naam bestaat als los product. "Bible Kids Explorers" is een onderdeel van *Bible Kids* van BCC Media en geen losse app. "The World Bible", "BibleLine" en "Bible Terra" bestaan wel (theworldbible.com, bibleline.app, bibleterra.com). BibleProject heeft **geen** interactieve kaart. Er is ook geen Smithsonian-product gevonden dat als interactieve historische kinderkaart vergelijkbaar is (zie §3.7).
- **Beschermd materiaal.** Hieronder staan alleen **principes**. Er is geen vormgeving, tekst, illustratie of code overgenomen. Korte citaten dienen alleen als bronvermelding.

---

## 1. Uitgangspunt: wat de Bijbelreis nu is

Live gecontroleerd op 25 oktober 2026.

**Wat er is**

- Een Leaflet-kaart met een eigen ondergrond (Natural Earth) zonder kaarttegels van derden, met geanimeerde routes per stap (een kameel loopt mee).
- Een reisboek per Bijbelboek, deel en stap. Elke stap heeft een Bijbelverwijzing, een navertelling, de personen als chips en een "Wist je dat?". Soms is er een mini-activiteit: "onthul", een vergelijkingsbalk of sterren tellen.
- Een "Lees het zelf in de Bijbel"-lade met de Statenvertaling, met de opmerking "Oude spelling: lees het samen met een volwassene".
- *Wie is wie*: een stamboom met levensleeftijden voor Genesis en personenlijsten voor de andere boeken.
- *Speurtocht*: 10 vragen per ronde, gemengd uit tikken op de kaart, meerkeuze en volgorde zetten. Je verdient sterren en ziet een persoonlijk record.
- *Hoe ver?*: afstanden omgerekend naar schapen, lopen, fietsen en auto, en de vorm van Nederland op ware grootte op de kaart.
- *Paspoort*: een stempel per bekeken stap, bewaard in `localStorage`.
- Een uitklapblok "Voor ouders en leiders" met het uitgangspunt, de bron, de routes als reconstructie en de onzekere plaatsen.
- Geen cookies of trackers. Wel toetsenbordbediening, `prefers-reduced-motion`, een skip-link en ARIA-tabs.

**Sterke punten** (ook na de vergelijking):

- De Bijbelreis is al eerlijker over onzekerheid dan de meeste Bijbelkaarten. Het onderscheid recon/gestreept is daar het voorbeeld van, net als `c: v/w/o/r` per plaats en de verantwoording voor ouders.
- Elke stap is via de Statenvertaling controleerbaar. Het verifyscript staat beschreven in `docs/BIJBELREIS.md`.
- De Nederlandse maat bij "Hoe ver?" komt in geen enkel vergeleken product voor en is precies wat kinderen van 8–14 houvast geeft.
- Er zijn geen afbeeldingen van Bijbelse personen. Dat past bij de doelgroep (zie §5).

**Zwakke plekken** (observaties uit de code en CSS, niet uit gebruikerstests):

1. **Op telefoons verdwijnt de legenda** (`@media (max-width: 900px) { .legend { display: none; } }`). Juist de uitleg over "gestreept" en "ligging onzeker" is dan onzichtbaar.
2. **De kaart neemt op een telefoon 54% van de schermhoogte in** (`54svh`), met het reisboek eronder. Een volledig-schermstand ontbreekt. Wie leest, ziet de kaart niet, en wie naar de kaart kijkt, ziet de tekst niet.
3. **Een stempel volgt al op alleen bekijken.** In `select()` krijg je bij iedere nieuwe stap meteen "Nieuwe stempel". Doordoorklikken levert dus het hele paspoort op.
4. **Diepe links bestaan alleen per deel** (`#abraham`) en niet per stap. Een ouder of leider kan niet naar "Genesis 22, Moria" verwijzen.
5. **Zekerheidsniveaus.** Live zijn er vier niveaus (`v/w/o/r`), en de legenda toont alleen "Ligging onzeker". Het fijnere Schema 2.0 uit `docs/BIJBELREIS.md` (`b` = betwist met kandidaten, `nu`, `bron`, `tl`/`tijdNoot`, `fs`-soort weetje, `BR.mensen`) is op de live site **nog niet** zichtbaar: `/bijbelreis/personen.js` geeft 404.
6. **"Wist je dat?" mengt soorten.** Een ander Bijbelvers, een uitleg en archeologie staan in hetzelfde blok zonder label. Voorbeeld: "In Babel en andere steden stonden echte trap-torens…" staat direct naast "Genesis 1 zegt zeven keer…".
7. **Tijd is alleen tekst** ("ca. 2100–1800 v.Chr." bij de boekknop). Een tijdas waarop je personen en gebeurtenissen kunt plaatsen ontbreekt.

---

## 2. Bijbelse producten

### 2.1 Bible Kids / "Explorers" (BCC Media, Noorwegen)

| | |
|---|---|
| **Wat** | Gratis, reclamevrije app en website met animatiefilms en -series van Bijbelverhalen. **Explorers** (6–11 jaar) is daarbinnen een "tijdreis"-concept voor de zondagsschool: filmfragmenten, met tussendoor vier opdrachten (twee op de computer, twee fysiek, voorbereid door een begeleider). Daarnaast zijn er *Juniors* (3–6) en *Tweens* (12+). |
| **Doelgroep** | Kinderen 3–12+, kinderwerk en zondagsschool, gezinnen. Een Spaanse katholieke bron (SOBICAIN) noemt Explorers voor 9–11 jaar, met puzzels en uitdagingen. De leeftijdsgrenzen verschillen per bron. |
| **Goed** | Een duidelijke leeftijdsindeling in drie lagen, zodat 12+ geen "kinderachtige" laag krijgt. Er zijn **fysieke opdrachten met een begeleider** en geen schermtijd alleen. De maker meldt dat groepen terugkwamen en dat de band met begeleiders sterker werd (eigen claim, niet onafhankelijk onderzocht). |
| **Minder goed** | Geen kaart, tijdlijn of bronverantwoording op de site. Het is film-gedreven, dus kijken in plaats van zelf ontdekken. Geen onafhankelijke reviews gevonden. |
| **Onzekerheid / tekst-uitleg** | Niet zichtbaar. Het is navertelling in film en de Bijbeltekst staat er niet apart naast. |
| **Terugkomen** | Via een jaarlijks nieuw thema en via het groepsritueel, niet via punten. |
| **Telefoon** | Een app met video. Er is geen kaart om te beoordelen. |
| **Context** | BCC Media is een stichting binnen de Brunstad Christian Church (BCC). Volgens Wikipedia leert BCC onder meer dat Jezus "net als ieder mens" verzocht werd tot zonde en dat Zijn overwinning op de zonde de basis is voor de heiliging van de gelovige. Een NRK-documentaire (2020) stelde de vraag of BCC een sekte is. BCC ontkent dat en spreekt van een desinformatiecampagne. |
| **Overneembaar principe** | **Een ouder of leider als medespeler**: een paar korte opdrachten die je samen doet en die een kind terugsturen naar de tekst. Daarnaast een **leeftijdslaag voor 12+** die niet kinderachtig is. |
| **Niet overnemen** | De inhoud zelf, en geen links of embeds. De leeropvattingen van BCC wijken af van de gereformeerde belijdenis, en daarmee is de inhoud ongeschikt voor de reformatorische doelgroep. |

### 2.2 Bible App for Kids / Bijbel App voor Kinderen (YouVersion/Life.Church met OneHope)

| | |
|---|---|
| **Wat** | Gratis app zonder reclame met geanimeerde, interactieve Bijbelverhalen. Volgens een artikel uit 2023 zijn het 41 kernverhalen. Er zijn aanraakanimaties, weetjes, activiteiten en "uitdagingen waarmee kinderen beloningen verdienen". Er is een Nederlandse versie. |
| **Doelgroep** | Jonge kinderen. De App Store noemt "Made for Ages 6–8". |
| **Omvang** | Volgens het artikel uit 2023 100 miljoen downloads. Google Play: 4,3★ uit ca. 384.000 reviews (via een derde partij), App Store (VS): 4,7★ uit 9.500 beoordelingen. |
| **Goed** | Navigatie voor kinderen met grote plaatjes en weinig tekst. Elke pagina heeft een kleine interactie, zodat lezen actief blijft. Het is altijd gratis en zonder reclame, en daar zijn recensenten het sterkst over te spreken. |
| **Minder goed** | Een recensent klaagt dat de verzamelde beloningen (edelstenen) na een update verdwenen. De beloning was blijkbaar belangrijk geworden. Gebruikers vragen om meer verhalen en een herhaalknop voor het voorlezen, en melden crashes op sommige telefoons. Het privacylabel noemt e-mail en gebruiksgegevens voor analyse en marketing. |
| **Onzekerheid / tekst-uitleg** | Geen kaart en geen bronverantwoording. Navertelling en Bijbeltekst zijn niet zichtbaar gescheiden. |
| **Koppeling** | Per verhaal, zonder netwerk van personen en plaatsen. |
| **Terugkomen** | Beloningen en uitdagingen, en een vast aanbod waarin je per verhaal vooruitgaat. |
| **Telefoon** | Een app die voor touch ontworpen is, en dat is de kern ervan. |
| **Overneembaar principe** | **Een kleine, betekenisvolle interactie per stap** (de Bijbelreis heeft dat al met "onthul" en vergelijken) en **nooit reclame of tracking**. |
| **Niet overnemen** | Een verzamel-economie (edelstenen) waarvan kinderen afhankelijk worden. Daarnaast tekenfiguren van Bijbelse personen in geanimeerde scènes (zie §5). In de grote YouVersion-app werden sociale functies door sommige jongeren als "schaduw-sociale media" gebruikt (ChurchLeaders 2023), dus de Bijbelreis krijgt geen sociale laag. |

### 2.3 The World Bible (theworldbible.com, Nils Glenn, 2026)

| | |
|---|---|
| **Wat** | Een interactieve 3D-terreinkaart van de Bijbelse wereld, "from Creation to Revelation". Een **tijdlijnbalk** kun je afspelen of verslepen. Er zijn routes per reiziger met richtingspijlen en koninkrijken als gekleurde vlakken die met de tijd meebewegen; ook de **namen veranderen mee** (Kanaän wordt Israël en Juda). Gouden markers openen 3D-reconstructies. Verder is er een "film"-modus, korte reizen, zoeken met `/` en een link die de kaart op precies dat moment opent. Te installeren via "Add to your home screen". |
| **Doelgroep** | Niet vermeld. De toon is algemeen en Engelstalig. |
| **Goed** | (1) **Een tijdas als tweede navigatie-as**, waarmee de kaart verandert. (2) **Camera volgt het verhaal, maar je kunt die uitzetten** ("Follow"). (3) **Een deelbare link per moment.** (4) **Een eerlijke noot over data en plaatsen**: traditionele chronologie (Exodus ca. 1446 v.Chr.), *geen jaartallen vóór Abraham omdat Genesis die niet geeft*, betwiste plaatsen (Eden, Sinaï, de doortocht door de zee) op de traditionele plek "and tells you when it's doing that", grenzen "drawn roughly" en 3D als "reconstructions". (5) **Expliciete gebaren voor telefoon**: één vinger slepen, knijpen om te zoomen, twee vingers om te draaien en kantelen, tikken voor het verhaal. (6) In de bron komen ARIA-attributen en `prefers-reduced-motion` voor. |
| **Minder goed** | Het is zwaar: de HTML alleen is ca. 2,1 MB, en daar komen 3D en terreinhoogtes bij. Desktopbediening met WASD/vrije vlucht is een gimmick. Bijbelcitaten (ESV) worden volgens de site zelf "sometimes shortened". Bijbeltekst en navertelling staan door elkaar in hetzelfde verhaalpaneel. Er zijn gezichten bij markers ("tap a marker or a face"). Geen onafhankelijke reviews gevonden. |
| **Overneembaar principe** | Een tijdbalk die de kaart stuurt, een "Volg"-schakelaar, een link per moment, een onzekerheidsnoot die zegt *wanneer* de kaart een traditionele keuze maakt, en geen jaartallen vóór Abraham. |
| **Niet overnemen** | Verkorte Bijbeltekst, 3D-gezichten en reconstructies van personen, vrije vlucht en de zwaarte. |

### 2.4 BibleProject (VS; Nederlandstalige video's)

| | |
|---|---|
| **Wat** | Animatievideo's per Bijbelboek. De Nederlandse site telt 41 OT- en 32 NT-video's, die volgens BibleProject "de structuur en het ontwerp van dat boek" schetsen en laten zien hoe het boek in het geheel past. Daarnaast thema-video's, posters, leesplannen via YouVersion (18 in het Nederlands), podcasts en lessen. De app is alleen in het Engels. **Geen interactieve kaart of tijdlijn gevonden.** |
| **Doelgroep** | Volwassenen, jongeren, gemeenten, onderwijs. |
| **Goed** | (1) **Eerst het overzicht van het boek, dan lezen**: het leesplan zet vóór elk nieuw Bijbelboek een overzichtsvideo (volgens een kerkelijke beschrijving). (2) Het hele boek als **één visueel schema** met de opbouw. (3) **Thema's door de hele Bijbel volgen** "vanaf de eerste keer dat ze genoemd worden". Dat lijkt op de `cross`-lijst "Elders in de Bijbel" in de Bijbelreis. |
| **Minder goed / kritiek** | Uit gereformeerde en evangelicale hoek komt inhoudelijke kritiek op onder meer de verzoeningsleer en de visie op toorn en hel. Voorbeelden zijn Servants of Grace, The Dissenter, TGC Australia ("Brilliant but Flawed") en Puritanboard ("they disagree with Reformed distinctives"). Een deel van die bronnen is polemisch, maar de strekking is consistent. Daarnaast ligt de nadruk op literair-thematische lezing, minder op historie en geografie. |
| **Onzekerheid / tekst-uitleg** | De video *is* uitleg. De Bijbeltekst staat apart in het leesplan. Die scheiding (uitleg vóór het lezen, daarna de tekst zelf) is helder. |
| **Overneembaar principe** | **Een overzicht vóór de reis**: één beeld per deel dat laat zien waar het verhaal begint, waar het eindigt en wat er tussen ligt, vóórdat het kind stap 1 opent. Daarnaast **visuele eenvoud**: weinig elementen en één idee per beeld. |
| **Niet overnemen** | De theologische invalshoek en uitleg (zie §5), en hun beeldtaal en illustraties (beschermd). |

### 2.5 BibleLine (bibleline.app)

| | |
|---|---|
| **Wat** | Een gratis webapp zonder account: "Every person in the Bible, on one family tree", met 3.065 personen en 2.129 familiebanden. Er zijn persoonspagina's met *Dating*, *Record*, *Family*, *Events* en *Verses*, en links "See on tree" en "See on timeline". De tijdlijn heeft 8 tijdvakken. De data komt van Theographic Bible Metadata (CC BY-SA 4.0), de verzen uit BSB/KJV/WEB/ASV. |
| **Doelgroep** | Volwassen (evangelicale) Bijbellezers. Dat staat er expliciet: men wijst de kritisch-wetenschappelijke datering af omdat die "narrows the audience of evangelical readers we're built for". |
| **Goed** | **De beste uitwerking van onzekere dateringen in deze vergelijking.** Een vaste datum staat er zonder markering. Bij een betwiste datum staat de hoofddatum met een uitklap naar alternatieven, elk met de bron erbij. Voorbeeld bij Abraham: 2166 v.Chr. "disputed", met als alternatieven Ussher (1996 v.Chr.) en Kitchen (1900 v.Chr.). **Vóór Abraham** staat er geen jaartal maar een badge "relative ordering". Elk tijdvak heeft het label "firm" of "disputed". Verder: één stamboom voor de hele Bijbel, wederzijdse links tussen persoon, boom en tijdlijn, een skip-link en een licht/donker-thema. |
| **Minder goed** | Geen kaart. Volwassen informatiedichtheid. Over gedrag op de telefoon zegt de site niets; er is een "Menu"-knop. Geen reviews gevonden. |
| **Overneembaar principe** | **Datering in drie standen**: vast, betwist (met uitklap en bron), en vóór Abraham alleen een relatieve volgorde. Daarnaast **"bekijk in stamboom / op tijdlijn / op kaart"** als vaste knoppen per persoon. |
| **Niet overnemen** | De dichtheid. Kinderen hebben de alternatieven niet nodig, die horen in de ouderlaag. |

### 2.6 Bible Terra (bibleterra.com, Fredrik Bjurhager)

| | |
|---|---|
| **Wat** | Een gratis, onafhankelijke "interactive atlas for Bible study". Er zijn pagina's voor personen, plaatsen, gebeurtenissen, reizen, relaties en verhalen, plus een kaart, een tijdlijn, studieplannen, quizzen op vier niveaus en een volledige Bijbel met gelinkte namen. De Bijbeltekst is de **Catholic Public Domain Version** en er is een "Faith"-sectie met katholieke geloofsleer. |
| **Doelgroep** | Bijbelstudenten. De oriëntatie is katholiek (afgeleid uit vertaling en inhoud). |
| **Goed** | (1) **Rolbenoemde koppelingen**: plaatsen bij een persoon met de rol erbij (woonplaats, bezocht, geboorteplaats, begraven, ontmoeting) en personen met de relatie (vader, echtgenoot, bondgenoot). (2) Een uitgesproken bronbeleid: "I do not invent locations, events or relationships", geen coördinaten verzinnen "to make the map appear more complete", liever een sectie weglaten dan gokken, en een knop **"Report incorrect data"**. (3) De Bijbeltekst wordt "verbatim" bewaard en de navertellingen worden expliciet "retellings written for Bible Terra" genoemd. (4) De tijdlijn werkt met tijdvakken en verhaalvolgorde, zonder exacte jaartallen. |
| **Minder goed** | Reizen zijn lijsten van plaatsassociaties en geen chronologische routes. Kanaän komt meerdere keren voor bij Abraham, en "Mount Sinai" en "Sinai" staan los van elkaar bij Mozes. Hoe onzekere plaatsen getoond worden is niet zichtbaar. De kaartpagina gaf bij raadpleging een fout (503). Het eigen bronbeleid zegt dat onzekerheid gecommuniceerd moet worden, maar een vorm daarvoor is niet zichtbaar. Geen reviews gevonden. |
| **Overneembaar principe** | **Elke koppeling krijgt een rol** ("Abraham – Hebron: begraven", "Jakob – Bethel: droom/altaar"), en er komt een **"Meld een fout"-route** voor ouders en leiders. |
| **Niet overnemen** | De CPDV en katholieke inhoud. Bible Terra is ook geen databron voor de Bijbelreis zonder eigen controle, want de canon (inclusief deuterocanonieke boeken) en de vertaling verschillen. |

### 2.7 Aanvullend Bijbels: OpenBible.info Bible Geocoding

Het genoemde rijtje vroeg hier niet om, maar deze dataset is direct relevant voor onzekere plaatsen.

- **Wat:** Een open dataset (CC BY 4.0, op GitHub) die per Bijbelse plaats meerdere moderne identificaties geeft, elk met een **betrouwbaarheidsscore** op basis van "stemmen" uit de wetenschappelijke literatuur. Er zijn speciale waarden zoals `unknown_place` (bijv. Eden), `multiple_locations` en `nonspecific_place`. De score wordt ook in de tijd gevolgd, zodat te zien is of de consensus groeit of afneemt. De site zegt zelf: "There are almost certainly errors."
- **Overneembaar principe:** Bij een betwiste plaats komen de **kandidaten als aparte punten met relatief gewicht**, en "onbekend" is **een eigen categorie** en geen gok die als punt verschijnt. Schema 2.0 (`b` + `alt`, `o`) gaat al die kant op. OpenBible kan dienen als **controlebron** voor `bron`-velden, maar alleen met naamsvermelding, en niet zonder eigen toetsing de scores overnemen.

---

## 3. Voorbeelden buiten het Bijbeldomein

### 3.1 ORBIS (Stanford): afstanden als model

- **Wat:** Een netwerkmodel van het Romeinse Rijk rond 200 n.Chr. (Scheidel en Meeks). Je kiest begin en eind, maand of seizoen, prioriteit (snelst, goedkoopst of kortst), netwerk (weg, kust, rivier, open zee) en vervoer (ezel, wagen, te voet, militair of civiel). Het resultaat is reistijd, afstand en kosten.
- **Goed:** **De aannames zijn de bedieningsknoppen.** Wie de uitkomst ziet, ziet ook waarop die berust. Volgens de recensies is de parameterkeuze uitgebreid gedocumenteerd ("Building ORBIS").
- **Minder goed:** Een Heidelbergse recensie vindt de invoer te dun voor betrouwbare reistijden (weinig windmeetpunten, statische prijzen). Het project is afgerond. De site noemt alleen "modern browsers" en zegt niets over telefoons. De tutorial bevat bij raadpleging nog opvultekst.
- **Principe voor de Bijbelreis:** Bij "Hoe ver?" komen de **aannames zichtbaar naast de uitkomst**: hemelsbreed langs de getekende lijn, km per dag. Daarnaast komen **Bijbelse ijkpunten** waar de Bijbel zelf een reisduur geeft, zoals de reis van Ezra van Babel naar Jeruzalem (Ezra 7:9) en "op den derden dag" naar Moria (Gen. 22:4). Getallen moeten eerst met het verifyscript gecontroleerd worden. Geen schijnprecisie zoals "17,3 dagen".

### 3.2 Pleiades (oude geografie): plaats ≠ punt

- **Wat:** Een gazetteer van de antieke wereld. Een **plaats** is een begrip zonder eigen coördinaten. **Locaties** (coördinaten) en **namen** hangen er los aan, elk met hun eigen periode en zekerheid ("certain" of "less certain"). Een plaats zonder bekende ligging heeft **nul locaties maar wel namen**. Het uitdrukkelijke doel: "avoid giving the false appearance of exactitude while maintaining ease of use". In de Barrington Atlas, waarop Pleiades voortbouwt, krijgt een minder zekere naam een vraagteken.
- **Principe:** Een plek die de Bijbel noemt maar die niemand kan aanwijzen, **hoeft geen punt op de kaart te krijgen**. Dan volstaat een gebied of een vermelding "ligging onbekend". **Naam en ligging zijn twee dingen**: de Bijbelse naam blijft, en "nu" (bijv. Tell Dothan) staat er apart bij. Het vraagteken achter een naam is een bekende, korte notatie; de Bijbelreis gebruikt dat al bij "Eden?".

### 3.3 OldMapsOnline: tijdschuif boven een moderne kaart

- **Wat:** Een portaal met meer dan 500.000 gescande oude kaarten. Je zoekt op plaats of door te pannen, en filtert met een **tijdschuif**. Volgens de site zelf kun je een oude kaart over de moderne heen leggen met een **transparantieschuif**. Dat is een eigen claim en niet geverifieerd, want de site gaf 403 bij directe raadpleging.
- **Principe:** **Toen en nu als schuif in plaats van als twee aparte kaarten**: "Bijbelse namen ↔ huidige namen/landen". Voor kinderen is "Ur ligt nu in Irak" de brug naar het journaal en de atlas op school.

### 3.4 Our World in Data: gelaagde uitleg

- **Wat:** Een datapagina begint met een korte beschrijving en de kerngegevens (bron, eenheid, periode, laatst bijgewerkt). Daarna volgt een **ingeklapt "meer"-blok**, en helemaal onderaan de volledige bronverantwoording, een citeerwijze en downloads. Elke grafiek is te bekijken als grafiek, kaart of tabel, met alleen de knoppen die bij die weergave horen. Er is volledig scherm en een **deelbare link die precies de huidige weergave toont**. In 2023 noemde OWID een betere mobiele ervaring nog als toekomstig werk.
- **Principe:** **Uitleg in drie lagen**: (1) wat een kind moet weten, (2) "hoe weten we dat?" voor de nieuwsgierige 12-jarige, (3) de verantwoording voor ouders en leiders. **Alleen de knoppen die op dit scherm nodig zijn.**

### 3.5 National Geographic MapMaker (Esri): meten en vergelijken in de klas

- **Wat:** Een kaartomgeving voor groep 5 tot en met het voortgezet onderwijs ("grades 3–12+") met lagen, een **swipe-schuif** om met en zonder laag te vergelijken, transparantie, tekenen, een meetlat (afstand en oppervlakte) en 3D. Opslaan vraagt een account; leerlingaccounts lopen via scholen. Volgens de Franse FAQ van Esri worden "niet alle elementen" ondersteund op smartphones.
- **Principe:** **Zelf meten** ("Hoe ver is Haran van Kanaän? Trek een lijn") kan een sterke opdracht zijn, maar dan als losse, begrensde handeling en niet als gereedschapskist. **Geen account nodig.** De Bijbelreis houdt voortgang lokaal.
- **Valkuil:** Een volledige GIS-gereedschapskist is te veel voor 8–14 jaar en werkt slecht op een telefoon.

### 3.6 British Museum: "The Museum of the World" (met Google Arts & Culture)

- **Wat:** Een tijdlijn van 2 miljoen jaar geleden tot nu, met **sporen per werelddeel**. Elk object is een stip. Een klik geeft beeld, tekst, audio (een curator vertelt), een kaartje en "gerelateerde objecten".
- **Recensie (Internet Archaeology, 2017):** De parallelle sporen en de audio worden gewaardeerd. Kritiek is dat de verbanden "decoratief" zijn en onverklaard blijven ("varies between objects"). Verder ontbreekt een verhaallijn, zijn er gaten in de tijd en is het "interactive in a basic sense". Het is **alleen voor desktop** (WebGL).
- **Principe:** **Parallelle sporen** maken gelijktijdigheid zichtbaar, bijvoorbeeld "terwijl Jozef in Egypte is, …" of de koningen van Israël en Juda naast de profeten. Elke getekende verbinding moet **zeggen waarom** ze er is (de rol uit §2.6).
- **Valkuil:** Een verzameling losse "greatest hits" zonder verhaal. Daarom blijft de Bijbelreis verhaalgestuurd.

### 3.7 Rijksmuseum-app en Smithsonian

- **Rijksmuseum-app:** Gratis, met audiotours inclusief interviews, een navigatie- en plattegrondfunctie ("from one gallery to the next"), een **eigen route samenstellen**, en favorieten opslaan in een eigen verzameling. Er zijn veel talen en ook een tour in Nederlandse Gebarentaal. Een aparte kinder- of familietour in de app is in de huidige bronnen niet bevestigd.
  **Principe:** **"Mijn route"**: een kind kiest een persoon en volgt alleen diens stappen ("alles van Jozef"), en kan plekken bewaren. Gebaren- en voorleesvarianten laten zien dat toegankelijkheid bij een publiek product hoort.
- **Smithsonian:** Er is geen interactieve historische kinderkaart gevonden die vergelijkbaar is. Het *Smithsonian Learning Lab* is een platform waarop docenten lessen bouwen met bronnen, annotaties en quizvragen (klas 4–12) en is geen kaartproduct. Daarom wordt het hier niet verder vergeleken.

---

## 4. Dwarsdoorsnede: de vijf aandachtspunten

### 4.1 Hoe tonen ze onzekerheid?

| Product | Plaatsen | Data | Routes / reconstructies |
|---|---|---|---|
| **Bijbelreis (live)** | `v/w/o/r` met stippelrondje; uitleg in ouderblok; **legenda verdwijnt op telefoon** | alleen tekst ("ca.") | gestreept = de Bijbel noemt alleen begin en eind |
| The World Bible | traditionele plek, "says when it's doing that" | traditionele chronologie; geen jaartallen vóór Abraham | "reconstructions", grenzen "drawn roughly" |
| BibleLine | n.v.t. | **vast / betwist met uitklap en bron / relatieve volgorde vóór Abraham** | n.v.t. |
| Bible Terra | beleid: niets verzinnen, liever weglaten; vorm niet zichtbaar | tijdvakken, geen jaartallen | niet gemarkeerd |
| OpenBible.info | **meerdere kandidaten met score; "onbekend" als eigen waarde** | n.v.t. | n.v.t. |
| Pleiades | **plaats zonder locatie toegestaan; "certain"/"less certain"; vraagteken** | periode per naam en locatie | n.v.t. |
| ORBIS | n.v.t. | n.v.t. | **model met zichtbare parameters** |
| Bible App for Kids, Bible Kids, BibleProject | niet getoond | niet getoond | niet getoond |

**Conclusie:** Geen enkel product combineert kaart, tijd en onzekerheid in een vorm voor kinderen. De Bijbelreis staat er al goed voor. De stap naar 2.0 is: (a) onzekerheid **op elk scherm zichtbaar** maken, ook op de telefoon, (b) **betwist** onderscheiden van **onbekend** (dat staat al in Schema 2.0), en (c) datering **in standen** tonen zoals BibleLine.

**Toon voor deze doelgroep:** De onzekerheid zit in *onze kennis van de kaart*, niet in de Bijbel. Een formulering als "De Bijbel noemt deze plaats; wij weten niet precies meer waar hij lag" houdt dat onderscheid zuiver. Het huidige ouderblok doet dat al.

### 4.2 Hoe scheiden ze Bijbeltekst van uitleg?

- **Goed:** Bible Terra houdt de tekst "verbatim" en noemt de navertellingen expliciet zo. Bij BibleProject staat de uitleg (video) vóór de tekst (leesplan). BibleLine toont de verzen in een apart blok met vertalingskeuze.
- **Zwak:** The World Bible verkort citaten ("sometimes shortened") en mengt ze met het verhaal. De kinder-apps (Bible App for Kids, Bible Kids) tonen alleen navertelling.
- **Bijbelreis:** De SV-lade staat al los van de navertelling, en dat is een sterk punt. Verbeterpunten: (1) "Wist je dat?" krijgt een **soortlabel** (Bijbel / uitleg / achtergrond), zoals `fs` in Schema 2.0 al voorziet. (2) Typografie: Bijbeltekst altijd in **één herkenbare stijl** (serif, versnummers) en nergens anders gebruiken. (3) **Nooit verkorten zonder het te markeren** (…).

### 4.3 Hoe koppelen ze personen, plaatsen en gebeurtenissen?

- Bible Terra: een netwerk met **rollen**.
- BibleLine: stamboom ↔ tijdlijn ↔ persoon, met **wederzijdse knoppen**.
- The World Bible: een persoon volgen over de kaart ("click a name … to follow").
- British Museum: getekende verbanden, maar zonder uitleg, en daarom bekritiseerd.
- **Bijbelreis:** De chips in een stap, de stamboom en "Bekijk de reis van …" bestaan al, maar je kunt nog niet **van een plaats naar alle stappen die daar spelen** (bijv. Bethel: Abraham, Jakob, later Jerobeam). Dat is het meest leerzame verband voor 10–14 jaar. Het centrale `BR.mensen` uit Schema 2.0 is daar de basis voor.

### 4.4 Wat laat kinderen terugkomen zonder spelletjesverzameling?

- **Werkt (en past):**
  - Een **verhaal dat doorloopt** (de reis zelf, met "Naar Izak ▶").
  - **Verzamelen dat aan de inhoud vastzit** (het paspoort als kaart van waar je geweest bent).
  - **Persoonlijk record** in plaats van een ranglijst.
  - **Samen met een ouder of leider** (Explorers).
  - **Nieuwe inhoud in vaste porties** (Bible Kids: jaarlijks thema).
- **Werkt maar past slecht:** Een valuta die los staat van de inhoud (edelstenen). Die wordt een doel op zich, en als ze verdwijnt, reageren gebruikers boos (App Store-review). Ook streaks, meldingen, geluiden bij elke tik en ranglijsten passen slecht.
- **Bijbelreis-specifiek:** Een stempel per **bekeken** stap beloont doorklikken. Beter is een stempel na een kleine handeling die aan de tekst vastzit, zoals "Lees het zelf" geopend of één vraag over déze stap. Of een stempel per afgerond deel met een korte terugblik. Houd de drempel laag voor 8-jarigen.

### 4.5 Hoe werkt hun kaart op een telefoon?

| Product | Telefoon |
|---|---|
| The World Bible | **Uitgewerkt**: één vinger slepen, knijpen om te zoomen, twee vingers om te draaien en kantelen, tikken voor het verhaal; camera "Follow" aan of uit; toe te voegen aan het beginscherm. Zwaar (3D). |
| NatGeo MapMaker | Volgens Esri worden niet alle onderdelen ondersteund op smartphones. |
| Museum of the World | Alleen desktop. |
| ORBIS | Geen informatie over telefoons ("modern browsers"). |
| OWID | Volledig scherm per grafiek; mobiele optimalisatie in 2023 nog als toekomstig werk genoemd. |
| BibleLine, Bible Terra | Geen kaart (BibleLine) of geen informatie (Bible Terra). |
| **Bijbelreis** | De kaart neemt 54% van de schermhoogte in, het reisboek staat eronder en de legenda is verborgen. Leaflet ondersteunt slepen en knijpen. Er is geen volledig-schermstand en geen "volg"-schakelaar. |

**Conclusie:** Alleen The World Bible neemt de telefoon serieus, en dan met zware 3D. Voor de Bijbelreis volstaat 2D: **een volledig-schermkaart met het reisboek als uitschuifbare onderlade** (drie standen: ingeklapt met alleen titel en knoppen, half, en volledig), plus een **"Volg het verhaal"-schakelaar**. Pas op voor het conflict tussen het scrollen van de pagina en het pannen van de kaart.

---

## 5. Wat NIET past bij de Bijbelreis en deze doelgroep

1. **Afbeeldingen van God en van de Heere Jezus, en in het algemeen geanimeerde of 3D-figuren van Bijbelse personen** (Bible App for Kids, Bible Kids, BibleProject, 3D-gezichten in The World Bible). De Heidelbergse Catechismus, zondag 35 (vr./antw. 97–98), stelt dat God "op generlei wijze" afgebeeld kan of mag worden en dat Zijn volk door de prediking van het Woord geleerd moet worden en niet door beelden. Bij het uitgeven van kinderbijbels is in deze kring juist de afbeelding van Christus een terugkerende vraag (Refoweb, 2024). De huidige keuze (een kameel, chips met namen, plaatsen en routes) is daarom niet alleen veilig maar ook passend. Behoud die.
2. **Theologische uitleg uit andere tradities als inhoud**: de thematisch-literaire uitleg van BibleProject (kritiek uit gereformeerde hoek op onder meer de verzoeningsleer), de katholieke inhoud en CPDV van Bible Terra, en de inhoud van BCC Media. Neem alleen **vormprincipes** over, nooit uitleg, teksten of data zonder eigen toetsing aan de Statenvertaling.
3. **Kritisch-late datering als hoofdlijn**, en evenmin een geforceerd jaartal vóór Abraham. Het beste werkt de lijn die The World Bible en BibleLine elk zelfstandig kozen: **geen jaartallen vóór Abraham**, daarna een datering op basis van de Bijbelse gegevens (bijv. 1 Kon. 6:1 voor de uittocht), met de alternatieven alleen in de ouderlaag. Wijkt de Bijbelreis daarvan af, dan moet dat bewust en verantwoord gebeuren.
4. **Een verzamel-economie, streaks, ranglijsten, meldingen en geluidjes bij elke tik.** Beloning moet uit de inhoud volgen (een stempel van een plek waar je echt "geweest" bent). Geen valuta en geen dagelijkse dwang. Dat past ook bij gebruik op zondag.
5. **Een spelletjesverzameling.** Elke nieuwe activiteit moet aan één stap en één Bijbelverwijzing vastzitten. Een minigame die ook zonder het verhaal werkt, hoort er niet in.
6. **Sociale functies, accounts en tracking** (YouVersion als "schaduw-sociale media", accounts bij MapMaker). De Bijbelreis houdt "geen cookies, geen trackers" en bewaart alles lokaal.
7. **Verkorte of samengevoegde Bijbeltekst** (The World Bible) en navertelling zonder duidelijke markering. De SV blijft onverkort, en waar een fragment wordt geciteerd, gebeurt dat met beletselteken en verwijzing.
8. **3D, vrije vlucht en film-modus.** Dat is zwaar op oudere telefoons, het leidt af van het lezen en het suggereert reconstructies van mensen en gebouwen die niet controleerbaar zijn.
9. **AI-gegenereerde navertellingen of ongecontroleerde datasets** als bron. Bible Terra geeft zelf toe dat "mistakes still happen", en Theographic en OpenBible zijn bruikbaar als controle maar niet als waarheid.

---

## 6. Geprioriteerde principes voor de Bijbelreis 2.0

De volgorde is bepaald door de verhouding tussen doelgroepwaarde, risico en werk. Nummer 1 tot en met 4 versterken wat de Bijbelreis onderscheidt (eerlijkheid en Bijbelgetrouwheid). Nummer 5 tot en met 8 lossen gebruiksproblemen op. Nummer 9 tot en met 12 zijn verrijking.

| # | Principe | Waar gezien | Waarom passend voor deze doelgroep | Risico / valkuil |
|---|---|---|---|---|
| 1 | **Onzekerheid altijd zichtbaar, ook op de telefoon**: een korte legenda of tikbare "?"-uitleg per plaats, en **betwist** (kandidaten als kleine ringen) gescheiden van **onbekend** (geen punt, alleen gebied of "ligging onbekend"). | Pleiades (plaats zonder locatie, vraagteken), OpenBible.info (kandidaten met gewicht, `unknown_place`), The World Bible ("says when") | Ouders en leiders willen weten wat zeker is. Kinderen leren onderscheid maken tussen *de Bijbel zegt* en *wij weten niet meer waar*, en dat beschermt het vertrouwen in de tekst. | Te veel symbolen voor een 8-jarige. Houd het bij drie categorieën. Vermijd de indruk dat "onzeker" over de geschiedenis zelf gaat. |
| 2 | **Bijbeltekst strikt gescheiden van navertelling en weetjes**: één vaste stijl voor SV-tekst, nooit verkort zonder markering, en elk weetje met een label *Bijbel / uitleg / achtergrond*. | Bible Terra ("verbatim", "retellings"); tegenvoorbeeld The World Bible ("sometimes shortened") | Sluit aan bij "De Bijbel is Gods Woord en bepaalt wat er verteld wordt". Ouders kunnen zien wat tekst is en wat toelichting. | Labels maken het druk. Gebruik een klein icoon met tooltip in plaats van een woord per blok. |
| 3 | **Datering in standen**: vóór Abraham alleen volgorde, daarna "ca." met een uitklap "hoe is dit berekend?" (Bijbelse gegevens). Alternatieve dateringen alleen in de ouderlaag. | BibleLine (vast / betwist / relatieve volgorde), The World Bible (geen jaartallen vóór Abraham) | Geeft houvast zonder schijnzekerheid en volgt de Bijbelse chronologie als uitgangspunt. | Wetenschappelijke alternatieven kunnen verontrusten. Formuleer ze neutraal en houd ze in de ouderlaag. Elke berekening moet herleidbaar zijn tot een vers. |
| 4 | **Eén netwerk personen ↔ plaatsen ↔ gebeurtenissen met rollen, in beide richtingen**: vanaf een plaats alle stappen die daar spelen ("Bethel: Abraham, Jakob, …"), en vanaf een persoon de knoppen "op kaart / in stamboom / op tijdlijn". | Bible Terra (rollen), BibleLine ("See on tree/timeline"), The World Bible (persoon volgen) | Verbanden leggen is voor 10–14 jaar het leerzaamste (doorlopende geschiedenis in plaats van losse verhalen) en is ook voor ouders verrassend. | Datafouten vermenigvuldigen zich in een netwerk (vgl. dubbele Kanaän/Sinaï bij Bible Terra). Elke koppeling moet een `ref` hebben en door het controlescript. |
| 5 | **Volledig-schermkaart op de telefoon met het reisboek als onderlade** (drie standen) en een schakelaar **"Volg het verhaal"**. | The World Bible (gebaren, Follow), OWID (volledig scherm) | De meeste gezinnen gebruiken een telefoon of tablet. Nu kun je lezen en kijken niet tegelijk. | Conflict tussen scrollen en pannen, en vastzitten in volledig scherm. Zorg voor een duidelijke sluitknop, Esc en toetsenbord, en test met Playwright op een telefoonviewport. |
| 6 | **Uitleg in drie lagen**: (1) voor het kind, (2) "Hoe weten we dat?" voor de nieuwsgierige, (3) verantwoording en bronnen (`bron`-veld) voor ouders en leiders. | Our World in Data (kort → "meer" → bronnen) | Eén pagina werkt voor 8, 14 en 40 jaar. 14-jarigen krijgen diepgang zonder dat het kinderachtig wordt. | Laag 2 groeit uit tot een essay. Houd een woordlimiet aan en gebruik geen jargon. |
| 7 | **Tijdbalk als tweede navigatie-as**, met parallelle sporen waar dat helpt (Israël, Juda, profeten, grootmachten) en Bijbelse namen die per periode meeveranderen. | The World Bible (tijdlijn stuurt kaart, namen veranderen), Museum of the World (sporen), OldMapsOnline (tijdschuif) | Maakt gelijktijdigheid zichtbaar (Elia tijdens Achab, Daniël in Babel). Het besef van volgorde blijft hangen. | Schijnprecisie op de as. Gebruik brede banden en "ca.", en geen tijdbalk voor Genesis 1–11. Zwaarte op oude telefoons. |
| 8 | **Beloning volgt uit de inhoud**: een stempel na een kleine tekstgebonden handeling (stap gelezen en "Lees het zelf" geopend, of één vraag over déze stap) of per afgerond deel. Persoonlijk record, geen ranglijst, geen streaks. | Bible App for Kids (uitdagingen, en de klacht over verdwenen edelstenen), het eigen paspoort | Houdt de motivatie bij de Bijbel in plaats van bij punten. Past bij rustig gebruik, ook op zondag. | Een te hoge drempel ontmoedigt 8-jarigen, en de bestaande stempels moeten blijven (stapsleutels niet wijzigen). Laat het geen toets worden. |
| 9 | **Afstanden als model met zichtbare aannames en Bijbelse ijkpunten** (de reisduur die de Bijbel zelf noemt naast de berekende), naast de bestaande Nederland-vergelijking. | ORBIS (aannames als knoppen), MapMaker (meten) | Kinderen begrijpen "drie dagen lopen" beter dan "80 km". Het laat zien dat de Bijbel concreet en geografisch is. | Schijnprecisie. Rond af, noem "ongeveer" en controleer elk getal met het verifyscript. Geen GIS-gereedschapskist. |
| 10 | **Een diepe link per stap**: "deel deze stap", die opent op precies die kaartweergave. | The World Bible (link naar moment), OWID (deelbare weergave) | Ouders, juffen en catechiseermeesters kunnen gericht verwijzen ("kijk thuis naar Genesis 22"). | Stapsleutels moeten stabiel blijven (al vastgelegd in `BIJBELREIS.md`). Oude links moeten na een herindeling niet breken. |
| 11 | **Samen-modus voor ouder en kind**: per deel een korte reisbrief (afdrukbaar) met een paar vragen die terugwijzen naar de tekst (wie, wat, waar, hoe ver), plus "Mijn route": één persoon volgen en plekken bewaren. | Bible Kids Explorers (opdrachten met begeleider), Rijksmuseum-app (eigen route, favorieten), Bible App for Kids (materiaal voor ouders) | Ouders spelen mee in plaats van toe te kijken. Het past bij huisgodsdienst, de zondagsschool en het onderwijs. | Het mag niet preken en geen toepassingsvragen als goed/fout stellen. De rol van ouder of kerk blijft die van de ouder of kerk. Houd het licht en optioneel. |
| 12 | **Rust, toegankelijkheid en zelfstandigheid**: geen geluid standaard, `reduced motion`, volledig toetsenbord, grote tikdoelen, offline te gebruiken na het eerste bezoek (beginscherm), geen account, en een "meld een fout"-route. | The World Bible (beginscherm, service worker, ARIA), Bible Terra ("Report incorrect data"), Rijksmuseum (gebarentaal-tour) | Gezinnen die internet beperken of op zondag geen apps willen, kunnen het offline gebruiken. Foutmeldingen van leiders verhogen de betrouwbaarheid. | Een offline cache kan verouderen, dus versie-busting is nodig. Het meldformulier mag geen persoonsgegevens verzamelen, of het moet ontbreken en dan volstaat een e-mailadres. |

**Bewust níet in de lijst** (zie §5): 3D-reconstructies en figuren van personen, een valuta of streaks, sociale functies, en theologische uitleg uit BibleProject, Bible Terra of BCC.

---

## Bronnen

Alle bronnen zijn geraadpleegd op **25 oktober 2026**.

**Bijbelreis (eigen site)**
- https://martijndenbesten.com/bijbelreis
- https://martijndenbesten.com/bijbelreis/app.js
- https://martijndenbesten.com/bijbelreis/inhoud/genesis.js
- https://martijndenbesten.com/bijbelreis/plaatsen.js
- https://martijndenbesten.com/bijbelreis/bijbelreis.css
- https://martijndenbesten.com/bijbelreis/personen.js (404, Schema 2.0 nog niet live)
- `docs/BIJBELREIS.md` in deze repository (schema en stand)

**Bible Kids / Explorers**
- https://biblekids.io/en/
- https://sobicain.org/en/pastoral/from-bible-kids-to-gate-zero-the-bible-for-children/
- https://faith.tools/app/bible-kids-app
- https://bcc.no/en/press/
- https://en.wikipedia.org/wiki/Brunstad_Christian_Church

**Bible App for Kids (YouVersion/OneHope)**
- https://apps.apple.com/us/app/bible-app-for-kids/id668692393
- https://www.bible.com/nl/kids
- https://bibleappforkids.com/
- https://apppricinglab.com/app/google_play/com.bible.kids (Google Play-cijfers, derde partij)
- https://churchleaders.com/news/449862-bible-app-for-kids-100-million-downloads.html (25 april 2023)
- https://network.crcna.org/sunday-school/new-bible-app-kids
- https://justuseapp.com/en/app/668692393/bible-app-for-kids/reviews (aggregator, aanvullend)

**The World Bible**
- https://theworldbible.com/ (inclusief "How to read the map" en "A note on dates and places")

**BibleProject**
- https://bibleproject.com/app/
- https://bibleproject.com/nl/
- https://www.newcraigs.co.uk/the-bible-project (beschrijving van het leesplan, derde partij)
- https://acl.asn.au/review-the-bible-project-brilliant-but-flawed/
- https://servantsofgrace.org/the-bible-project-theological-drift/
- https://puritanboard.com/threads/thoughts-on-the-bible-project.101530/ (forum, alleen als gebruikerservaring)
- https://www.christiancourier.ca/making-better-bible-readers/

**BibleLine**
- https://www.bibleline.app/
- https://www.bibleline.app/about/chronology
- https://www.bibleline.app/people/abraham

**Bible Terra**
- https://bibleterra.com/
- https://bibleterra.com/about
- https://bibleterra.com/sources
- https://bibleterra.com/person/abraham
- https://bibleterra.com/journeys
- https://bibleterra.com/timeline
- https://bibleterra.com/map (503 bij raadpleging)

**OpenBible.info**
- https://www.openbible.info/geo/
- https://github.com/openbibleinfo/Bible-Geocoding-Data

**Buiten het Bijbeldomein**
- ORBIS: https://orbis.stanford.edu/ en https://journals.ub.uni-heidelberg.de/index.php/dco/article/view/73389/67080 (recensie)
- Pleiades: https://pleiades.stoa.org/help/conceptual-overview en https://pleiades.stoa.org/help/uncertainty
- OldMapsOnline: https://www.oldmapsonline.org/it/maps/about-oldmapsonline en https://www.oldmapsonline.org/blog/2012/02/old-maps-online-launched (de hoofdpagina gaf 403)
- Our World in Data: https://ourworldindata.org/about, https://ourworldindata.org/redesigning-our-interactive-data-visualizations (18 oktober 2023) en https://ourworldindata.org/grapher/life-expectancy
- National Geographic MapMaker: https://education.nationalgeographic.org/resource/mapmaker-4-0-frequently-asked-questions en https://www.esri.com/en-us/industries/k-12-education/mapmaker
- British Museum / Google: https://experiments.withgoogle.com/the-museum-of-the-world en https://intarch.ac.uk/journal/issue44/13 (recensie, 4 mei 2017)
- Rijksmuseum: https://rijksmuseum.nl/en/app en https://rijksmuseum.nl/en/tours
- Smithsonian Learning Lab: https://www.educationworld.com/news-review-online-resource-smithsonian-learning-lab-9089898 en https://teachersfirst.org/single.cfm?id=17247

**Doelgroep en beeldgebruik**
- Heidelbergse Catechismus, zondag 35: https://www.creeds.net/Heidelberg/hdlb35.htm
- Refoweb, "Jezus afbeelden op schilderij" (april 2024): https://refoweb.substack.com/p/het-beste-van-refowebnl-van-de-afgelopen-1a5
- Radboud Universiteit, "Beeldverbod voor protestanten?" (14 september 2021): https://www.ru.nl/onderzoek/onderzoeksnieuws/beeldverbod-voor-protestanten
