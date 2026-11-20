# Bijbelreis in de App Store: stap voor stap

Voor Martijn, 17 november 2026 (bijgewerkt na de eerste echte bouw in GitHub Actions). De app staat in `apps/ios/`
(zie `apps/ios/README.md`). **Je hebt geen Mac nodig:** GitHub Actions bouwt de app, test hem in de iOS-simulator en
uploadt hem (als jij hem start) naar TestFlight; wat je daarvoor eenmalig instelt, staat in **`TESTFLIGHT.md`**.
Het besluit over de techniek (Capacitor) staat in `BESLUIT.md`. **Stand in App Store Connect** (door Martijn opgegeven,
17-11-2026): de app bestaat al (Apple ID 6835958573), 13+, géén Kids-categorie, handmatig vrijgeven, interne
TestFlight-groep ‘Bijbelreis intern’; nog geen build en geen testers; de privacyantwoorden staan als concept.
Dit document zegt wat je zelf doet, in deze volgorde:

1. [Bouwen en testen](#1-bouwen-en-testen) (GitHub Actions; een Mac mag, hoeft niet)
2. [App Store Connect en TestFlight](#2-app-store-connect-en-testflight)
3. [Teksten invullen](#3-teksten-kopieerklaar) (kopieer uit §3)
4. [Leeftijdsclassificatie: 13+](#4-leeftijdsclassificatie-13)
5. [Privacylabel](#5-privacylabel-app-privacy)
6. [Geen Kids-categorie](#6-geen-kids-categorie-het-oude-advies-is-vervallen)
7. [Notities voor de reviewer](#7-notities-voor-de-reviewer-engels)
8. [Exportcompliance en DSA](#8-exportcompliance-en-dsa-handelaarsstatus)
9. [Schermafbeeldingen](#9-schermafbeeldingen) en indienen

Vanuit deze repository is niets gepubliceerd, aangeschaft, geüpload of ingediend. Wat getest is (ook in de echte iOS-simulator): §10. Nog niet
getest: ondertekenen en uploaden (daarvoor zijn jouw geheimen nodig) en een echte iPhone of iPad.

## Vaste keuzes (al ingesteld)

| | Waarde | Waar |
|---|---|---|
| App in App Store Connect | Bijbelreis, Apple ID **6835958573**, SKU **BIJBELREIS-IOS-2026** (de repository noemde eerder `BIJBELREIS-IOS`; App Store Connect is leidend, een SKU is niet te wijzigen) | App Store Connect → App-informatie |
| Categorie en leeftijd | Onderwijs; **13+**; **geen** Kids-categorie | §4 en §6 |
| Prijs en vrijgave | Gratis; **handmatig** vrijgeven na goedkeuring | Prijs en beschikbaarheid; Versie → Vrijgave |
| Bundle-ID | `nl.bijbelreis.app` (ligt vast na de eerste upload) | Xcode → target App → General |
| Naam op het beginscherm | Bijbelreis | `Info.plist` (`CFBundleDisplayName`) |
| Versie / build | 1.0.0 / 1 | Xcode → General → Identity |
| Signing | Automatisch, **team leeg** in het project; GitHub Actions vult jouw Team ID in (geheim `APPLE_TEAM_ID`) en laat Apple in de cloud ondertekenen | `TESTFLIGHT.md` (of Xcode → Signing & Capabilities) |
| Toestellen | **iPhone en iPad** | zie hieronder |
| Standen | iPhone staand en liggend; iPad alle vier | `Info.plist` |
| Minimaal | iOS 16.4 (de CSS gebruikt `color-mix()` en `:has()`) | Xcode → General → Minimum Deployments |
| Pictogram | 1024×1024, geen transparantie (gecontroleerd met sharp) — voorlopig de kameel | `Assets.xcassets/AppIcon` |
| Opstartscherm | kameel op papierkleur | `LaunchScreen.storyboard` + `Splash` |

**Waarom ook iPad.** De atlas heeft een eigen indeling voor brede schermen (kaart links, reisboek rechts), die al in de
tests zit (tablet 820×1180, desktop 1440×900). Gezinnen en scholen gebruiken vaak een iPad, en de lesroutes zijn voor
groepen. Gemeten in Chromium op iPad 13" staand (1032×1376) en liggend (1376×1032): geen horizontaal scrollen, kop,
kaart en reisboek passen. Kosten van de keuze: je moet ook iPad-schermafbeeldingen aanleveren (staan klaar) en in de
iPad-simulator testen. Liggend op de iPhone werkt ook (kaart met reisblad), daarom staat die stand aan.

## 1. Bouwen en testen

**Zonder Mac (zo gaat het nu):** bij elke wijziging aan de app of de atlas bouwt GitHub Actions de app en test hem in
de simulator op iPhone en iPad (`TESTFLIGHT.md`, ‘Wat de workflow automatisch doet’). Jij test daarna op je eigen
toestel via TestFlight met de testlijst hieronder.

**Met een Mac (mag, hoeft niet).** Nodig: macOS met **Xcode 26 of nieuwer** (Apple eist sinds 28 april 2026 de iOS 26 SDK) en **Node 22 of nieuwer**.

```sh
git clone https://github.com/MartijndBesten/Martijn-den-Besten.git bijbelreis-app   # of: git pull in je bestaande map
cd bijbelreis-app
npm ci                    # root: alleen nodig voor de tests op de Mac (Playwright, sharp)
cd apps/ios
npm ci                    # Capacitor 8.6.0 (vaste versies)
npm run sync              # maakt www/ uit public/ en zet die in het Xcode-project (cap sync ios)
npm run open              # opent ios/App/App.xcodeproj in Xcode
```

Na elke wijziging aan de website (`public/`) of `app-laag/`: opnieuw `npm run sync`. Het script stopt met een fout als
de website iets doet wat niet in de app past; dan eerst dat oplossen.

In Xcode:

1. **Wacht** tot de Swift-pakketten binnen zijn (links onder ‘Package Dependencies’; anders File → Packages → Resolve
   Package Versions).
2. **Team kiezen:** links het blauwe projectpictogram **App** → onder TARGETS **App** → tabblad **Signing &
   Capabilities** → laat ‘Automatically manage signing’ aan → kies bij **Team** jouw team (je naam of je organisatie,
   met ‘(Personal Team)’ alleen als je account geen betaald lidmaatschap heeft). Xcode maakt de App-ID
   `nl.bijbelreis.app` dan zelf aan.
3. **Simulator:** kies bovenin een iPhone 17 (of nieuwer) en daarna een iPad Pro 13" → ▶ (Cmd+R).
4. **Je eigen iPhone:** sluit hem aan (of zelfde wifi), kies hem bovenin, ▶. De eerste keer: op de iPhone
   Instellingen → Privacy en beveiliging → Ontwikkelaarsmodus aan, en vertrouw de ontwikkelaar onder Algemeen →
   VPN en apparaatbeheer.

### Testlijst op het toestel (en in de iPad-simulator)

- [ ] **Eerste start in vliegtuigmodus:** kaart, verhalen, foto’s, speurtocht, lesroutes, privacy en hulp werken.
- [ ] **Notch en veilige zones:** de donkere kop staat onder de statusbalk (witte klok en batterij goed leesbaar), de
      onderbalk is vrij van de thuisstreep. Ook op de lesroutes, privacy en hulp. iPad staand en liggend.
- [ ] **Terug vegen vs. kaart slepen:** veeg vanaf de linkerrand: eerst sluit een open venster, daarna de vorige plek.
      Sleep de kaart vanaf de linkerkant: die moet schuiven, niet ‘terug’ gaan. Stoort het, meld het: dan zetten we de
      veeg uit zolang de kaart groot staat.
- [ ] **Kaart en animaties:** vloeiend schuiven en zoomen; de reis-animatie loopt soepel. Vergelijk met bijbelreis.nl
      in Safari op hetzelfde toestel.
- [ ] **Voortgang na herstart:** haal een paar stempels, veeg de app helemaal weg (app-overzicht), open opnieuw: alles
      staat er nog. Ook na het toestel opnieuw opstarten.
- [ ] **Ouderpoort:** komt bij ‘Gemaakt door Denckh’, Raadkoord, een fotobron (Wikimedia), een licentie, **Deel**,
      ‘Mis je iets?’, mailen op de privacypagina, en op de lesroutes bij Presentatie, Boekje en Afdrukken. Fout antwoord
      → nieuwe som; Sluiten → er gebeurt niets; goed antwoord → Safari, Mail of het deelmenu opent.
- [ ] **Delen:** na de poort opent het deelmenu van iOS met een link naar `https://bijbelreis.nl/#…`.
- [ ] **Lesroutes:** Voor ouders en leiders → ‘Naar de lesroutes’ → een route → ‘In de atlas’ opent de geschiedenis;
      terug vegen brengt je terug bij de les. ‘Presentatie’ en ‘Afdrukken’ gaan (na de poort) naar bijbelreis.nl in
      Safari, want downloaden en printen werken niet in de app.
- [ ] **Een deel van een reis kiezen** (de knoppen Begin, Abraham, Izak …) opent géén ouderpoort.
- [ ] **Privacy en hulp** openen in de app zelf (Voor ouders en leiders → Privacy → ‘Lees de privacyverklaring’, en Hulp).
- [ ] **Donkere modus en grotere tekst** van iOS: alles blijft leesbaar. VoiceOver op de hoofdroute (Verhalen → een
      geschiedenis → Reis → Verder).
- [ ] **Geen netwerkverkeer:** in een debug-build Safari op de Mac → Ontwikkel → je iPhone → Bijbelreis → Netwerk:
      niets dat de app uit gaat.

## 2. App Store Connect en TestFlight

1. **De app bestaat al** in App Store Connect: Bijbelreis, Nederlands, bundel-ID `nl.bijbelreis.app`, SKU
   `BIJBELREIS-IOS-2026`, Apple ID 6835958573. Niets meer aanmaken.
2. **Uploaden:** zonder Mac met de workflow (`TESTFLIGHT.md`, stap 5; eerst de geheimen van stap 1–3). Met een Mac in
   Xcode: kies bovenin **Any iOS Device (arm64)** → **Product → Archive** → in de Organizer **Distribute App** →
   **TestFlight & App Store** → volg de stappen (dan zelf de **Build** ophogen; de workflow doet dat vanzelf).
3. **TestFlight, intern:** na 10–30 minuten staat de build onder TestFlight. Voeg jezelf (en wie je wilt, met een rol in
   je team, tot 100) toe aan de groep **Bijbelreis intern**; installeer via de app TestFlight op je iPhone. Interne
   tests hebben geen review nodig. Werk de testlijst van §1 af op deze build.
4. **Prijs en beschikbaarheid:** gratis (staat al). Landen: advies **Nederland en België** (de app is alleen
   Nederlandstalig); alle landen mag ook.
5. Daarna §3 tot en met §9 invullen, de build kiezen bij de versie, en zelf **Ter beoordeling indienen**. Met
   ‘handmatig vrijgeven’ komt de app na goedkeuring pas in de App Store als jij op Vrijgeven drukt.

## 3. Teksten (kopieerklaar)

Voor een breed publiek: gezinnen, wie zelf de Bijbel leest, zondagsschool, club, catechisatie en onderwijs. De
kindvriendelijke onderdelen (reisniveaus, ouderpoort) staan erin, maar de app wordt niet als kinderapp gepresenteerd:
zonder Kids-categorie is ‘voor kinderen’ in de teksten niet toegestaan (richtlijn 2.3.8). De teksten staan ook in
`apps/ios/store/metadata.nl.json`; `npm run controleer` telt de tekens (trefwoorden: bytes) tegen de limieten en
controleert dat ‘voor kinderen’ er niet in staat.

| Veld | Tekst | Lengte |
|---|---|---|
| Naam (≤ 30) | `Bijbelreis` | 10 |
| Ondertitel (≤ 30) | `Bijbelatlas voor jong en oud` | 28 |
| Promotietekst (≤ 170) | `150 geschiedenissen van de schepping tot Openbaring op de kaart. Voor thuis, alleen of samen, en voor zondagsschool, club, catechisatie en klas. Werkt zonder internet.` | 167 |
| Trefwoorden (≤ 100 bytes) | `bijbel,atlas,bijbelverhalen,tijdlijn,statenvertaling,zondagsschool,catechisatie,gezin,bijbelstudie` | 98 bytes |
| Wat is er nieuw (≤ 4000) | `De eerste versie van de Bijbelreis als app voor iPhone en iPad: alles staat erin en werkt zonder internet.` (bij versie 1.0 vraagt App Store Connect hier meestal niet om) | 106 |
| Copyright | `2026 Denckh` (of je eigen naam, als je je als persoon aanmeldt) | |
| Support-URL | `https://bijbelreis.nl/hulp` | |
| Marketing-URL (optioneel) | `https://bijbelreis.nl/` | |
| Privacybeleid-URL | `https://bijbelreis.nl/privacy` | |
| Categorie | Primair **Onderwijs**, geen secundaire, geen Kids-categorie | |

Is de naam bezet: `Bijbelreis – Bijbelatlas` (24) of `Bijbelreis: op reis` (19).

**Beschrijving** (1986 van 4.000 tekens):

```
De Bijbelreis is een Bijbelatlas voor jong en oud. Lees 150 geschiedenissen van de schepping tot Openbaring, reis mee met Abraham, Mozes, David, de Heere Jezus en Paulus, en zie op de kaart waar het gebeurde.

VOOR WIE
• Gezinnen die samen de Bijbel lezen
• Wie zelf de Bijbel leest en wil zien waar en wanneer het gebeurde
• Zondagsschool, club, catechisatie en onderwijs, met lesroutes

WAT ER IN STAAT
• 150 geschiedenissen, met bij elke geschiedenis waar het in de Bijbel staat
• Reizen stap voor stap op de kaart, met eigen tekeningen bij bekende geschiedenissen
• Wie is wie: personen en families, zoals de familie van Abraham
• Tijdlijn: wanneer het gebeurde, en hoe we dat weten
• De wereld in die tijd: wie tegelijk leefden en wat er rondom gebeurde, met een kaart die met de tijd meebeweegt (van Adam tot Noach, en Daniël en Babylon)
• Speurtocht: vragen over wat je las, met het antwoord en de Bijbelplaats erbij
• Paspoort: verzamel stempels op je reis
• De kaart van toen en van nu: het land in de tijd van de Bijbel, en hoe het er vandaag uitziet

DRIE REISNIVEAUS
Samen ontdekken (4–6 jaar, om voor te lezen), Zelf op reis (7–10 jaar) en Verder ontdekken (11+). Wisselen kan altijd; je stempels blijven bewaard.

NAAST JE EIGEN BIJBEL
De geschiedenissen zijn eigen navertellingen in eenvoudige woorden, gecontroleerd aan de Statenvertaling. De Bijbelreis is een hulpmiddel náást de eigen Bijbel: bij elke geschiedenis staat waar je het zelf leest.

LESROUTES
Voor thuis, zondagsschool, club, catechisatie en de klas: vaste reeksen geschiedenissen met het Bijbelgedeelte om samen te lezen en vragen om in de Bijbel op te zoeken, ook groot op het digibord.

RUSTIG EN VEILIG
• Werkt helemaal zonder internet, ook de eerste keer
• Geen account, geen advertenties, geen aankopen
• De app verzamelt en verstuurt geen gegevens
• Een website openen, delen of mailen gaat pas na een rekensom (de ouderpoort), zodat jonge kinderen niet zomaar de app uit gaan

Gemaakt door Denckh.
```

**Na de goedkeuring:** zet op `public/bijbelreis/hulp.html` ‘Er komt ook een app voor iPhone en iPad’ om naar ‘De
Bijbelreis is er ook als app voor iPhone en iPad’ (kleine websitewijziging).

## 4. Leeftijdsclassificatie: 13+

**Besluit (17-11-2026, zo ingesteld in App Store Connect door Martijn): 13+, geen Kids-categorie.** Het eerdere voorstel
in dit document (vragenlijst richting 9+, ‘Made for Kids’ met band 9–11) is **vervallen**.

Bron: Apple, *Age ratings values and definitions* (developer.apple.com/help/app-store-connect/reference/app-information/
age-ratings-values-and-definitions, geraadpleegd 20-11-2026). Waar: App Store Connect → je app → **App-informatie** →
**Leeftijdsclassificatie**.

Wat feitelijk meespeelt (zonder de inhoud zwaarder of lichter voor te stellen):

- **De inhoud.** De Bijbelse geschiedenissen vertellen ook over oorlog, doden, straf en geweld (bijvoorbeeld David en
  Goliath, de inname van Jericho, de verwoesting van Jeruzalem), en wijn komt voor (Kana). Dat staat er als historische
  vertelling in korte tekst. De tekeningen tonen mensen als kleine figuren zonder gezicht en geen bloed of doden
  (`docs/bijbelreis-taferelen/README.md`); de laag ‘Vandaag’ noemt conflicten van nu.
- **Apple’s tabel.** Volgens Apple kan een app met 13+ onder meer bevatten: ‘Infrequent realistic violence’, ‘Infrequent
  alcohol, tobacco, or drug use or references’, ‘Frequent guns or other weapons’, ‘Frequent horror or fear themes’ en
  ‘Frequent contests’. Wie bijvoorbeeld ‘Realistic Violence’ op ‘Infrequent’ zet (‘aggressive physical conflict or harm
  involving humans in lifelike situations’), komt op 13+. Welke antwoorden precies zijn ingevuld, staat in App Store
  Connect, niet in deze repository.
- **Wat níet meespeelt:** de app heeft geen ingebouwde browser. Links naar buiten openen (na de rekensom) in Safari,
  buiten de app; ‘Unrestricted Web Access’ (een embedded browser, volgens Apple 16+) is dus ‘No’. Geen account, geen
  chat, geen inhoud van gebruikers, geen reclame, geen aankopen.

**Wat 13+ betekent:** in de App Store staat ‘13+’. Bij Schermtijd met een leeftijdsgrens onder 13 kan een kind de app niet
zelf installeren; een ouder kan dat wel. De app werkt voor iedereen hetzelfde; de reisniveaus (4–6, 7–10, 11+) blijven.

## 5. Privacylabel (App Privacy)

Waar: je app → **App-privacy** → Aan de slag. Vraag: ‘Verzamelen jij of je externe partners gegevens van deze app?’
→ **Nee, we verzamelen geen gegevens van deze app.** Uitkomst op de App Store: **Geen gegevens verzameld** (‘Data Not
Collected’). Daarmee vervallen alle categorieën (contactgegevens, gezondheid, financiën, locatie, gevoelige info,
contacten, gebruikersinhoud, browsegeschiedenis, zoekgeschiedenis, ID’s, aankopen, gebruiksgegevens, diagnose,
omgeving, lichaam, overig): **niet verzameld**.

Waarom dat klopt (Apple: ‘collect’ = gegevens die het apparaat verlaten en langer bewaard worden dan nodig om het
verzoek meteen af te handelen):

- **Geen telling:** `bezoek.js` gaat niet mee in de app en de scripttag is weg (`maak-webmap.mjs`).
- **Geen formulier:** ‘Mis je iets?’ opent na de ouderpoort de eigen mail van de ouder; de app verstuurt zelf niets.
- **Geen `/api`, geen verzoek naar buiten:** `maak-webmap.mjs` faalt bij een nieuwe `/api`-aanroep, een nieuwe
  netwerkaanroep, een bron van buiten of een service worker; de CSP in de app staat alleen eigen bestanden toe;
  `test-webmap.mjs` controleert dat er bij het gebruik geen enkel verzoek de app uit gaat.
- **Geen derden:** alleen Capacitor (Preferences, Share), geen analytics, geen reclame, geen crashrapportage.
  `PrivacyInfo.xcprivacy`: geen tracking, geen verzamelde gegevens, alleen UserDefaults (reden CA92.1) voor de
  reservekopie van de voortgang op het toestel.
- **Crashrapporten van Apple zelf** (als de gebruiker die deelt) tellen niet mee: die verzamelt Apple, niet de app.

Eén randgeval, eerlijk: een mail die een ouder na de poort vanuit Mail stuurt, komt in de postbus info@denckh.nl. Die
mail gaat niet via de app maar via de mail-app van de ouder, net als een mail vanaf de website; daarom ‘niet verzameld’.
Wil je het heel voorzichtig doen, dan kun je ‘Gebruikersinhoud → Klantenservice’ en ‘Contactgegevens → E-mailadres’
opgeven (gekoppeld aan de gebruiker, voor ‘App-functionaliteit’, niet voor tracking). Volgens mij is dat niet nodig.

**Website en app zijn twee dingen.** De website bijbelreis.nl telt bezoeken (naamloos, zonder cookie; zie de
privacyverklaring) en heeft het aanvraagformulier. De bezoekersaantallen die je in het beheer ziet, horen bij de
**website**. De app telt niets: in de gebouwde webmap ontbreekt `bezoek.js` (en de scripttag), `app.js` stuurt alleen
een intern paginabericht (`bijbelreis:stap`) waar in de app niemand naar luistert, en het formulier (`/api/aanvraag`)
gaat in de app nooit open (‘Mis je iets?’ opent de mail). Gecontroleerd met `maak-webmap.mjs` (faalt bij `bezoek.js`,
een nieuwe `/api` of netwerkaanroep), `test-webmap.mjs` (geen `/api`, geen verzoek naar buiten, in Chromium en WebKit)
en de simulator-test (alle geladen bronnen komen van `capacitor://localhost`). Dit is een technische vaststelling, geen
juridisch oordeel.

**In App Store Connect staan de privacyantwoorden als concept.** Publiceren doe jij (App-privacy → Publiceren), met de
antwoorden hierboven.

## 6. Geen Kids-categorie (het oude advies is vervallen)

**Besluit (17-11-2026): geen Kids-categorie.** In App Store Connect is ‘Made for Kids’ niet geselecteerd; de app is er
voor kinderen, jongeren en volwassenen: gezinnen, wie zelf de Bijbel leest, catechisatie, zondagsschool, club en
onderwijs. Het eerdere advies (‘Kids ja, band 9–11’, in dit document en in `BESLUIT.md`) is vervallen. Kids is ook niet
mogelijk bij 13+ (alleen bij 4+ of 9+).

Wat dat betekent:

- **Teksten** mogen niet laten blijken dat de app vooral voor kinderen is; ‘For Kids’/‘For Children’ (‘voor
  kinderen’) is voorbehouden aan de Kids-categorie (richtlijn 2.3.8). De teksten van §3 zijn daarop herschreven;
  `npm run controleer` bewaakt het.
- **De ouderpoort blijft** (geen eis meer, wel nuttig: jonge kinderen gebruiken de app ook). Links naar buiten, Delen,
  mailen, presentatie, boekje en afdrukken vragen eerst een rekensom. Wil je hem later weg of anders, dan is dat een
  aparte keuze.
- **Privacy blijft hetzelfde:** geen analytics, geen reclame, geen gegevens naar derden (§5).

## 7. Notities voor de reviewer (Engels)

App Store Connect → je versie → **App Review Information** → Notes. Inloggegevens: **niet nodig** (vink ‘Sign-in
required’ uit).

```
Bijbelreis ("Bible Journey") is a Dutch-language interactive Bible atlas for all ages: families, individual readers, Sunday school, catechism classes, clubs and schools. It retells 150 Bible histories, from Creation to Revelation, and follows the journeys step by step on a map: Abraham, Moses, David, Jesus, Paul. Three reading levels (4-6, 7-10 and 11+) make it usable with young children as well as for adults.

No account is needed. The app collects no data and makes no network requests: all content (texts, map, drawings, photos) is bundled in the app and works fully offline, also on first launch.

What the app adds beyond our website (bijbelreis.nl):
- Everything is inside the app and works without internet (on trips, in church, at school).
- Progress (stamps, quiz scores, where you were) is kept on the device and backed up in the app's own storage (UserDefaults), so it survives when iOS clears web storage.
- Sharing uses the iOS share sheet; swiping back from the screen edge closes an open panel first and then returns to the previous place.
- No tracking, no analytics, no ads, no purchases, no visit counter and no web form (these exist on the website only).

Suggested path for review: open "Verhalen" (stories) and tap a story; tap "Reis" (journey) and use "Verder" to follow a journey on the map; try "Wie is wie" (who is who), "Tijdlijn" (timeline), "Speurtocht" (quiz) and "Paspoort" (passport with stamps). In story 5 ("Noach bouwt de ark") or 75 ("Daniël in de leeuwenkuil") the button "De wereld in die tijd" ("the world at that time") opens an animated timeline of who lived at the same time, with a map that changes over time. Parents and teachers find lesson routes under "Voor ouders en leiders"; "Vragen op het digibord" shows one question per screen for a classroom display.

Parental gate (the app is not in the Kids Category and is rated 13+, but young children use it with their parents): every link out of the app (websites, mail), the Share button, "Mis je iets?" (send a request by e-mail) and the print/presentation buttons on the lesson pages first show an adult task: a multiplication written in Dutch words, for example "hoeveel is zesentwintig keer drie?" (twenty-six times three = 78). A wrong answer gives a new question; "Sluiten" cancels. Only after a correct answer does Safari, Mail or the share sheet open.

Content note: the Bible histories include war, death and judgment. They are told briefly in words, as historical narrative, without graphic detail; this is why the app is rated 13+. Drawings never show blood, the dead or violence; people are small faceless pictograms. God, Jesus and angels are never depicted.

Privacy policy: https://bijbelreis.nl/privacy - Support: https://bijbelreis.nl/hulp
```

## 8. Exportcompliance en DSA-handelaarsstatus

**Exportcompliance:** `ITSAppUsesNonExemptEncryption = NO` staat in `Info.plist`. De app gebruikt geen eigen versleuteling
en maakt geen netwerkverbinding. App Store Connect stelt bij de upload dan geen vragen meer; vraagt hij het toch: ‘Geen
van de bovenstaande algoritmen’ / ‘None of the algorithms mentioned above’.

**DSA (Digital Services Act, EU):** Apple vraagt iedereen een handelaarsstatus op te geven, ook als je niet in de EU
verspreidt. Waar: **Zakelijk (Business) → Overeenkomsten → Compliance → Complete Compliance Requirements**, en per app
onder **App Compliance**. Jij beoordeelt zelf of je ‘handelaar’ bent (Apple bepaalt dat niet; dit is geen juridisch
advies):

- **Handelaar** (je handelt voor je bedrijf, bijvoorbeeld als Denckh): je geeft een adres (of postbus), telefoonnummer en
  e-mailadres op. Apple controleert telefoon en e-mail met een code en vraagt een document met bedrijfsnaam en adres.
  **Daarna staan adres, telefoon en e-mail op de App Store-pagina in de EU.** Bij een organisatie-account komt het adres
  van het D-U-N-S-nummer.
- **Geen handelaar:** je geeft geen contactgegevens op; EU-gebruikers zien dan dat consumentenrecht niet geldt voor
  een overeenkomst met jou. Voor een gratis app zonder aankopen is dat in de praktijk weinig.

Kies vóór het indienen; zonder status wordt de app niet in de EU verspreid.

## 9. Schermafbeeldingen

In `apps/ios/store/screenshots/` (JPEG, RGB zonder alfakanaal), vijf per maat, in deze volgorde:
1 een geschiedenis (Droog door de Schelfzee, met Bijbelplaats), 2 een reis op de kaart met tekening, 3 Wie is wie (de
familie van Abraham), 4 Speurtocht met ‘Goed zo!’ en de Bijbelplaats, 5 Paspoort met ‘Hier was je’. De voortgang is
verzonnen (de test loopt zelf een paar reizen door; reisniveau Zelf op reis).

| Map | App Store Connect (Screenshot specifications, 17-11-2026) | Maat | Verplicht? |
|---|---|---|---|
| `iphone-6.3/` | iPhone met Dynamic Island, middel (iPhone 17 Pro) | 1206×2622 | **Ja**: Apple vraagt ‘at least one screenshot for iPhone with Dynamic Island (medium display)’ |
| `iphone-6.9/` | iPhone met Dynamic Island, groot (iPhone 17 Pro Max) | 1320×2868 | Nee, wel aanbevolen (anders schaalt Apple) |
| `ipad-13/` | iPad 13-inch (iPad Pro 13-inch (M5)) | 2064×2752 | **Ja**, want de app draait op de iPad |

Een aparte 6,5"-set is niet nodig: met 6,9" (groot) en 6,3" (middel) schaalt App Store Connect zelf voor oudere
toestellen.

**Het zijn echte simulatorbeelden:** de app zelf in WKWebView in de iOS-simulator (iOS 26.5), met statusbalk (9:41,
volle batterij), Dynamic Island en de echte lettertypen, gemaakt door de workflow `iOS-app` (artefact
**simulator-schermafbeeldingen**, map `appstore/`); de bron-run staat in de commit die ze toevoegde. De vorige set waren
browserweergaven (Chromium, zonder statusbalk); die zijn vervangen. Nieuwe maken: workflow starten (Actions → iOS-app →
Run workflow), artefact downloaden, `appstore/<map>/*.jpg` over `apps/ios/store/screenshots/` zetten.

**Brede doelgroep:** de beelden tonen gewone onderdelen (een geschiedenis met Bijbelplaats, een reis, een stamboom, een
quiz, het paspoort) die voor elke leeftijd gelden; geen kinderthema. Wil je de lesroutes of ‘De wereld in die tijd’ ook
laten zien (tot 10 beelden per maat), dan staan echte simulatorbeelden daarvan in hetzelfde artefact (`07-lesroutes`,
`08-digibord`, `05-wereld`), maar zonder vaste App Store-opmaak: kies dan zelf.

## 10. Wat getest is

**In de iOS-simulator** (GitHub Actions, workflow `iOS-app`, job ‘Bouwen en testen in de simulator’; zie
`TESTFLIGHT.md`), bij elke wijziging:

- De app **compileert**: Release voor de simulator en voor `generic/platform=iOS` (zonder ondertekening), Debug met de
  testloper; Xcode 26.6, iOS 26 SDK. De Release-build bevat de testloper niet (gecontroleerd).
- De **Release-build start** en toont de atlas (iPhone 17 Pro Max, iPad Pro 13-inch (M5), iPhone 17 Pro).
- In de **echte WKWebView** (iPhone 17 Pro Max en iPad Pro 13"): eerste start; verhaal; reis; venster openen en
  **terug** met `webView.goBack()` (de actie van de rand-veeg; dat de veeg aan staat, wordt gecontroleerd); terug naar de
  vorige plek; **tijdlijn**; **De wereld in die tijd** openen vanuit een verhaal en terug; **ouderpoort** (fout antwoord,
  Sluiten); reservekopie in UserDefaults; **lesroutes**, een route, de **digibordstand** (geen poort) en terug,
  ‘Presentatie’ via de poort, ‘In de atlas’ en terug; **privacy** en **Bronnen en licenties** in de app; geen verzoek dat
  de app uit gaat; geen JavaScript-fouten; **veilige zones** op elk scherm. Daarna de app afsluiten en opnieuw starten:
  de voortgang is er nog. iPhone ook **liggend** (reis, verhaal, De wereld in die tijd).
- Elke schermafbeelding wordt gecontroleerd op een wit of leeg scherm.

**Gevonden en opgelost bij de eerste echte bouw** (17-11-2026; in een gewone browser verandert er niets, want daar zijn
de inzetten 0):

- Digibordstand van de lesroutes: ‘Volledig scherm’ en ‘Terug naar de les’ stonden onder de statusbalk en het Dynamic
  Island (`lessen.css`).
- De wereld in die tijd op de iPad: de afspeelknoppen kwamen net in de zone van de thuisstreep (`wereld/wereld.css`).
- iPhone liggend (breed scherm): het tabblad Paspoort en de zoomknoppen van de kaart stonden naast de rand onder het
  Dynamic Island en de ronde hoek (`bijbelreis.css`).
- De test van de webmap (`test-webmap.mjs`) was achterop geraakt bij de lesroutes (de hoofdknop is nu het digibord) en de
  bronvermelding (nu op Hulp); bijgewerkt en uitgebreid met het digibord en De wereld in die tijd.

**Zonder Mac** (Linux):

- `npm run webmap` (maak-webmap) slaagt op de huidige website, met De wereld in die tijd en de digibordstand; de
  unittest `tests/bijbelreis-app-webmap.test.ts` (in de gewone CI) draait het bij elke websitewijziging.
- `npm run test:web` (21 stappen, nagebootste Capacitor) in Chromium én in Playwright-WebKit (job ‘webkit’ in de
  workflow).
- `npm run controleer` (60 controles): plists, storyboards, `project.pbxproj`, bundle-ID, versie, pictogram, teksten.

**Niet getest:** ondertekenen en uploaden naar TestFlight (daarvoor zijn de geheimen van `TESTFLIGHT.md` nodig), een
echte iPhone of iPad (de testlijst van §1, via TestFlight), de rand-veeg met een echte vinger (de test roept dezelfde
actie aan), de iPad liggend in de simulator (iPadOS staat daar geen programmatisch draaien toe), VoiceOver.

## 11. Controle tegen de App Review Guidelines

Bron: App Review Guidelines, developer.apple.com/app-store/review/guidelines (‘Last Updated: October 16, 2026’,
geraadpleegd 17-11-2026), en App Store Connect Help, *Screenshot specifications* (zelfde datum).

| Richtlijn | Wat er staat (kort) | Bijbelreis | Stand |
|---|---|---|---|
| **4.2** Minimumfunctionaliteit | Meer dan een ‘repackaged website’; ‘app-like’, blijvende waarde. 4.2.2: geen ‘web clippings’ | Alles in de app en offline vanaf de eerste start; terug vegen; voortgang in UserDefaults die iOS niet opruimt; deelmenu van iOS; geen formulier, geen telling. Interactief: kaart, reizen, quiz, paspoort, tijdlijn, De wereld in die tijd, lesroutes met digibordstand. Het blijft een webview-app: de reviewernotitie (§7) zegt wat de app toevoegt | Verdedigbaar, blijvend risico |
| **4.2.3** | Werkt zonder andere app; niets downloaden bij de eerste start | Alles zit in de bundel | Klaar |
| **1.3** Kids | Alleen voor apps in de Kids-categorie | **n.v.t.: geen Kids-categorie** (13+). De ouderpoort blijft wel: links naar buiten, Delen, mailen, presentatie, boekje en afdrukken vragen eerst een rekensom (getest in de simulator) | n.v.t. |
| **5.1.1(i)** Privacybeleid | In de metadata en ‘within the app in an easily accessible manner’ | `https://bijbelreis.nl/privacy` en in de app onder Voor ouders en leiders → Privacy (getest in de simulator) | Klaar |
| **5.1.4** Kinderen en privacy | Zorg bij gegevens van kinderen (COPPA, AVG), ook buiten de Kids-categorie | De app verzamelt en verstuurt niets (geen verzoek buiten de app, getest in de simulator); geen analytics of reclame | Klaar |
| **2.3.3** Schermafbeeldingen | ‘show the app in use’, niet alleen titel, inlog of opstartscherm | Vijf schermen in gebruik (§9) | Klaar |
| **2.3.8** Metadata | Geschikt voor 4+, ook als de app hoger is; ‘For Kids’/‘For Children’ alleen in de Kids-categorie | Beelden zonder geweld; geen ‘voor kinderen’ in de teksten (§3, gecontroleerd door `npm run controleer`) | Klaar |
| **2.5.2** Zelfstandig | Geen code downloaden die functies toevoegt of wijzigt | Alle HTML, JavaScript en gegevens (ook `wereld/perioden/*.json`) zitten in de bundel; geen `server.url`; CSP `default-src 'self'`; `maak-webmap.mjs` faalt bij een nieuwe netwerkaanroep | Klaar |
| **2.5.6** WebKit | Web via het WebKit-framework | WKWebView (Capacitor) | Klaar |
| **2.5.1** Huidig besturingssysteem | Draait op het huidige iOS | Gebouwd met Xcode 26.6 (iOS 26 SDK), getest op iOS 26 in de simulator | Klaar |
| **2.1** Volledigheid | Geen tijdelijke inhoud, werkende links | Pictogram en opstartscherm zijn ‘voorlopig de kameel’: voor de review prima zolang het een afgewerkt beeld is | Jouw keuze |

**Wat er sinds de vorige versie van dit document bij kwam en is nagelopen:** ‘De wereld in die tijd’ (laag in de atlas,
gegevens uit de app zelf, terug vegen sluit de laag), de digibordstand van de lesroutes (in de app; ‘Volledig scherm’
verschijnt alleen waar WebKit dat toestaat), de nieuwe knoppen per les (Presentatie en Boekje gaan via de ouderpoort
naar bijbelreis.nl, net als afdrukken per les), en de aangescherpte verantwoording (alleen tekst). De beschrijving
(§3) en de reviewernotitie (§7) noemen De wereld in die tijd en het digibord nu ook.
