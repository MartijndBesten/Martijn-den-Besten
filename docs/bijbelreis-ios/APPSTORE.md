# Bijbelreis in de App Store: stap voor stap

Voor Martijn, 17 november 2026. Alles wat zonder Mac kon, is klaar in `apps/ios/` (zie `apps/ios/README.md`).
Het besluit (Capacitor, Kids-categorie) staat in `BESLUIT.md`. Dit document zegt wat je zelf doet, in deze volgorde:

1. [Op de Mac: bouwen en testen](#1-op-de-mac-bouwen-en-testen) (± 1 uur)
2. [App Store Connect: app aanmaken en TestFlight](#2-app-store-connect-app-aanmaken-en-testflight)
3. [Teksten invullen](#3-teksten-kopieerklaar) (kopieer uit §3)
4. [Leeftijdsclassificatie](#4-leeftijdsclassificatie) (**let op: hier valt de beslissing over de Kids-categorie**)
5. [Privacylabel](#5-privacylabel-app-privacy)
6. [Kids-categorie](#6-kids-categorie-wat-het-betekent)
7. [Notities voor de reviewer](#7-notities-voor-de-reviewer-engels)
8. [Exportcompliance en DSA](#8-exportcompliance-en-dsa-handelaarsstatus)
9. [Schermafbeeldingen](#9-schermafbeeldingen) en indienen

Er is niets gepubliceerd, aangeschaft of aangemaakt. Niet getest: bouwen in Xcode, de simulator, een echte iPhone of
iPad. Wat wel getest is: §10.

## Vaste keuzes (al ingesteld)

| | Waarde | Waar |
|---|---|---|
| Bundle-ID | `nl.bijbelreis.app` (ligt vast na de eerste upload) | Xcode → target App → General |
| Naam op het beginscherm | Bijbelreis | `Info.plist` (`CFBundleDisplayName`) |
| Versie / build | 1.0.0 / 1 | Xcode → General → Identity |
| Signing | Automatisch, **team leeg**: jij kiest je team | Xcode → Signing & Capabilities |
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

## 1. Op de Mac: bouwen en testen

Nodig: macOS met **Xcode 26 of nieuwer** (Apple eist sinds 28 april 2026 de iOS 26 SDK) en **Node 22 of nieuwer**.

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

## 2. App Store Connect: app aanmaken en TestFlight

1. https://appstoreconnect.apple.com → **Apps** → **+** → **Nieuwe app**:
   - Platforms: **iOS**
   - Naam: **Bijbelreis** (moet uniek zijn in de App Store; is hij bezet, zie de alternatieven in §3)
   - Primaire taal: **Nederlands**
   - Bundel-ID: **nl.bijbelreis.app** (staat in de lijst zodra Xcode hem heeft aangemaakt, stap 1.2; anders eerst
     op developer.apple.com → Certificates, IDs & Profiles → Identifiers → +)
   - SKU (alleen voor jezelf): **BIJBELREIS-IOS**
   - Gebruikerstoegang: Volledige toegang
2. **Uploaden** (in Xcode): kies bovenin **Any iOS Device (arm64)** → **Product → Archive** → in de Organizer
   **Distribute App** → **TestFlight & App Store** (in oudere Xcode: App Store Connect → Upload) → volg de stappen.
   Bij elke volgende upload eerst de **Build** ophogen (General → Identity: 2, 3, …); de versie (1.0.0) pas bij een
   nieuwe release.
3. **TestFlight, intern:** na 10–30 minuten staat de build onder TestFlight. Voeg jezelf (en wie je wilt, met een rol in
   je team, tot 100) toe aan een interne groep; installeer via de app TestFlight op je iPhone. Interne tests hebben
   geen review nodig. Werk de testlijst van §1 nog eens af op deze build.
4. **Prijs en beschikbaarheid:** Gratis. Landen: advies **Nederland en België** (de app is alleen Nederlandstalig);
   alle landen mag ook.
5. Daarna §3 tot en met §9 invullen, de build kiezen bij de versie, en **Ter beoordeling indienen**.

## 3. Teksten (kopieerklaar)

De teksten staan ook in `apps/ios/store/metadata.nl.json`; `npm run controleer` telt de tekens tegen de limieten.

| Veld | Tekst | Tekens |
|---|---|---|
| Naam (≤ 30) | `Bijbelreis` | 10 |
| Ondertitel (≤ 30) | `Op reis door de Bijbel` | 22 |
| Promotietekst (≤ 170) | `150 geschiedenissen van de schepping tot Openbaring op de kaart. Met reizen, Wie is wie, tijdlijn, speurtocht en een paspoort vol stempels. Werkt zonder internet.` | 162 |
| Trefwoorden (≤ 100) | `bijbel,atlas,kinderbijbel,bijbelverhalen,kaart,statenvertaling,zondagsschool,catechisatie,gezin` | 95 |
| Wat is er nieuw | `De eerste versie van de Bijbelreis als app: alles staat erin en werkt zonder internet.` (bij versie 1.0 vraagt App Store Connect hier meestal niet om) | 86 |
| Copyright | `2026 Denckh` (of je eigen naam, als je je als persoon aanmeldt) | |
| Support-URL | `https://bijbelreis.nl/hulp` | |
| Marketing-URL (optioneel) | `https://bijbelreis.nl/` | |
| Privacybeleid-URL | `https://bijbelreis.nl/privacy` | |
| Categorie | Primair **Onderwijs**, geen secundaire; Kids: zie §4 en §6 | |

Is de naam bezet: `Bijbelreis – Bijbelatlas` (24) of `Bijbelreis: op reis` (19).

**Beschrijving** (1.627 van 4.000 tekens):

```
De Bijbelreis is een Bijbelatlas voor kinderen en hun ouders. Reis mee met Abraham, Mozes, David, de Heere Jezus en Paulus, en zie op de kaart waar het gebeurde.

WAT ER IN STAAT
• 150 geschiedenissen van de schepping tot Openbaring, met bij elke geschiedenis waar het in de Bijbel staat
• Reizen stap voor stap op de kaart, met eigen tekeningen bij bekende geschiedenissen
• Wie is wie: personen en families, zoals de familie van Abraham
• Tijdlijn: wanneer het gebeurde, en hoe we dat weten
• Speurtocht: vragen over wat je las, met het antwoord en de Bijbelplaats erbij
• Paspoort: verzamel stempels op je reis
• De kaart van toen en van nu: het land in de tijd van de Bijbel, en hoe het er vandaag uitziet

VOOR ELKE LEEFTIJD
Kies een reisniveau: Samen ontdekken (4–6 jaar, om voor te lezen), Zelf op reis (7–10 jaar) of Verder ontdekken (11+). Wisselen kan altijd; je stempels blijven bewaard.

NAAST JE EIGEN BIJBEL
De geschiedenissen zijn eigen navertellingen in woorden die kinderen begrijpen, gecontroleerd aan de Statenvertaling. De Bijbelreis is een hulpmiddel náást de eigen Bijbel of kinderbijbel: bij elke geschiedenis staat waar je het zelf leest.

VOOR OUDERS EN LEIDERS
Lesroutes voor thuis, zondagsschool, club, catechisatie en de klas: vaste reeksen geschiedenissen met het Bijbelgedeelte om samen te lezen en vragen om in de Bijbel op te zoeken.

RUSTIG EN VEILIG
• Werkt helemaal zonder internet, ook de eerste keer
• Geen account, geen advertenties, geen aankopen
• De app verzamelt en verstuurt geen gegevens
• Een website openen, delen of mailen kan pas na een vraag voor een ouder

Gemaakt door Denckh.
```

‘Voor kinderen’ in de teksten mag alleen in de Kids-categorie (richtlijn 2.3.8). Kies je géén Kids-categorie, vervang
dan de eerste zin door ‘De Bijbelreis is een Bijbelatlas voor het hele gezin.’

**Na de goedkeuring:** zet op `public/bijbelreis/hulp.html` ‘Er komt ook een app voor iPhone en iPad’ om naar ‘De
Bijbelreis is er ook als app voor iPhone en iPad’ (kleine websitewijziging).

## 4. Leeftijdsclassificatie

Bron: Apple, *Age ratings values and definitions* en *Set an app age rating* (developer.apple.com, geraadpleegd
17-11-2026); Apple News 24-07-2025 (nieuwe classificaties 4+/9+/13+/16+/18+) en 09-07-2026 (vragen over sociale
media, verplicht sinds september 2026). Waar: App Store Connect → je app → **App-informatie** → **Leeftijdsclassificatie**
→ Instellen. De Kids-categorie kan alleen bij een berekende classificatie van **4+ of 9+**, en ligt vast na de eerste
goedkeuring.

**Eerlijk vooraf: dit is de echte beslissing.** De geschiedenissen gaan ook over oorlog, doden, zwaarden, straf,
wijn en dronkenschap. In de app staat dat alleen als korte tekst, verteld zoals in een kinderbijbel, en de tekeningen
tonen nooit bloed of doden (mensen zijn kleine figuurtjes zonder gezicht; `docs/bijbelreis-taferelen/README.md`, regel
3). Apple’s definities zijn geschreven voor wat je **ziet en speelt**: ‘Realistic Violence’ is ‘aggressive physical
conflict or harm involving humans in lifelike situations’ (voorbeelden: een bloedneus, een vuurgevecht, gevechten tussen
personages). Wie die vraag letterlijk op de tekst toepast (‘David doodt Goliath’), komt op **‘Infrequent’ → 13+**, en dan
kan de Kids-categorie niet. Een kinderbijbel-app als *Bible App for Kids* (OneHope/YouVersion) staat in de App Store als
**4+, ‘Made for Ages 6–8’, zonder inhoudswaarschuwingen** (apps.apple.com, 17-11-2026). Dat is geen garantie voor
deze app, wel een aanwijzing hoe Apple navertelde Bijbelgeschiedenissen voor kinderen behandelt.

Mijn voorstel: vul in zoals hieronder. Oorlog, dood en straf vallen dan onder ‘Mature Themes’ (Apple noemt daar zelf ‘war
or political strife’) en ‘Guns or Other Weapons’ (zwaarden), allebei ‘Infrequent’ → **9+**. Vind je bij het invullen dat
‘Realistic Violence’ of ‘Alcohol … References’ toch ‘Infrequent’ moet zijn, vul dat dan zo in: dan wordt het 13+ en
kies je bij §6 ‘geen Kids-categorie’. Vul niets in om de categorie te halen; liever 13+ dan een afwijzing om richtlijn
2.3.6 (‘answer the age rating questions honestly’). Let op: met 13+ kunnen kinderen met schermtijdbeperking onder de 13
de app niet zelf installeren.

| Stap / vraag (Engels in App Store Connect) | Antwoord | Waarom |
|---|---|---|
| **In-App Controls:** Parental Controls | No | De ouderpoort is een poort voor links naar buiten, geen instellingen waarmee ouders inhoud beperken of meekijken |
| Age Assurance | No | Er wordt geen leeftijd gevraagd of gecontroleerd |
| **Capabilities:** Unrestricted Web Access | No | Geen browser in de app; links gaan (na de poort) naar Safari, buiten de app |
| User-Generated Content | No | Niemand plaatst iets; er is geen account |
| Social Media (en ‘disabled for users under 13’) | No | Geen feed, niets van anderen te zien of te delen in de app |
| Messaging and Chat | No | Geen contact tussen gebruikers |
| Advertising | No | Geen reclame |
| **Mature Themes:** Profanity or Crude Humor | None | |
| Horror/Fear Themes | Infrequent | Zondvloed, plagen, dood; rustig verteld, maar eerlijk: soms spannend of verdrietig |
| Alcohol, Tobacco, or Drug Use or References | None (zie hierboven) | Wijn komt voor (Kana, ‘dronken’ als misverstand bij Hanna en Pinksteren), zonder gebruik in beeld of aanprijzing |
| **Medical or Wellness:** Medical or Treatment Information | None | Genezingen zijn Bijbelgeschiedenis, geen medisch advies |
| Health or Wellness Topics | No | |
| **Sexuality or Nudity:** Mature or Suggestive Themes | Infrequent | Oorlog en straf in de geschiedenissen, de laag ‘Vandaag’ over conflicten nu (‘war or political strife’) |
| Sexual Content or Nudity | None | |
| Graphic Sexual Content and Nudity | None | |
| **Violence:** Cartoon or Fantasy Violence | None | Geen tekenfilmgeweld, geen spelgeweld |
| Realistic Violence | None (zie hierboven) | Alleen korte tekst, geen afbeelding of spel; zie de afweging hierboven |
| Prolonged Graphic or Sadistic Realistic Violence | None | |
| Guns or Other Weapons | Infrequent | Zwaarden en speren worden genoemd (Goliath, Jericho); nooit getekend als wapen in gebruik |
| **Chance-Based Activities:** Gambling | No | |
| Simulated Gambling | None | |
| Contests | Infrequent | De Speurtocht is een quiz met een eigen score, zonder ranglijst of prijzen en zonder andere spelers. Apple noemt ‘trivia quizzes’ als voorbeeld |
| Loot Boxes | No | |
| **Age Suitability URL** (optioneel) | `https://bijbelreis.nl/hulp#leeftijd` | Daar staat voor ouders hoe oorlog, dood en straf verteld worden |
| **Age Categories and Override** | **Made for Kids → Ages 9–11** | Zie §6. (Geen Kids: ‘Not Applicable’) |

**Verwachte uitkomst: 9+**, met in de App Store de beschrijvingen ‘Infrequent Mature or Suggestive Themes’, ‘Infrequent
Horror/Fear Themes’, ‘Infrequent Guns or Other Weapons’ en ‘Infrequent Contests’. Neem de echte vragen in App Store
Connect over als de schermen afwijken: Apple past de lijst geregeld aan.

**Leeftijdsband 9–11, niet 6–8:** bij een classificatie van 9+ past de band 9–11; ‘Zelf op reis’ (7–10) en ‘Verder
ontdekken’ (11+) vallen er grotendeels in. De band bepaalt alleen waar de app ín de Kids-categorie staat; iedereen kan
hem downloaden, ook ouders en kinderen van 6–8. Lukt het om op 4+ uit te komen (alles hierboven ‘None’), dan kan 6–8
ook; dat vraagt dat je ook ‘Mature Themes’, ‘Fear’ en ‘Weapons’ als ‘None’ beoordeelt, en dat vind ik voor deze inhoud
niet eerlijk.

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
opgeven (gekoppeld aan de gebruiker, voor ‘App-functionaliteit’, niet voor tracking). Dat past minder goed bij de
Kids-categorie en is volgens mij niet nodig.

## 6. Kids-categorie: wat het betekent

Bronnen: App Review Guidelines 1.3, 2.3.8, 5.1.1(i) en 5.1.4; Apple, *Kids apps* (developer.apple.com/app-store/kids-apps,
geraadpleegd 17-11-2026).

| Eis | Voor de Bijbelreis | Stand |
|---|---|---|
| Geen links naar buiten, aankopen of afleiding, behalve achter een **ouderpoort** (‘adult-level task’, bijv. een som) | Elke link naar buiten, Delen, mailen, presentatie/boekje en afdrukken gaan via een rekensom in woorden (‘hoeveel is zesentwintig keer drie?’). Geen aankopen. | Klaar, getest in Chromium |
| Geen analytics of reclame van derden; geen persoonlijke of apparaatgegevens naar derden | Er is niets van derden en de app verstuurt niets | Klaar |
| Privacybeleid in de metadata én in de app | `https://bijbelreis.nl/privacy`; in de app onder Voor ouders en leiders → Privacy, als pagina in de app zelf | Klaar (live na de merge) |
| Leeftijdsband kiezen (5 en jonger, 6–8, 9–11) | Advies 9–11 (§4) | Jouw keuze |
| Elke update moet blijven voldoen, **ook als je de categorie later uitzet**; de keuze ‘Made for Kids’ kan na goedkeuring niet meer veranderen | Nieuwe links of serveraanroepen op de website komen in de app. `maak-webmap.mjs` (en de unittest in CI) laten een nieuwe `/api`, netwerkaanroep, bron van buiten of adres zonder bestemming meteen falen; de ouderpoort vangt elke link op | Geregeld, blijvende aandacht |
| Ouderpoort is niet hetzelfde als ouderlijke toestemming voor gegevens (5.1.4) | Er worden geen gegevens verzameld, dus er is niets om toestemming voor te vragen | n.v.t. |

**Wat lastig blijft:** (1) de leeftijdsclassificatie (§4): alleen 4+ of 9+ mag in Kids, en dat hangt af van hoe je de
geweldvragen beoordeelt; (2) de keuze is blijvend; (3) een reviewer kan streng zijn over links op de lesroutes of in de
fotobronnen, maar die zitten allemaal achter de poort. Een link die de website ooit **per script** opent (niet via een
gewone link), ziet de poort niet: het kopieerscript laat zoiets falen.

**Conclusie voor Martijn (3 regels):**
Technisch is alles voor de Kids-categorie geregeld: ouderpoort, geen gegevens, geen derden, privacybeleid in app en op de site.
Het enige echte punt is de leeftijdsvragenlijst: alleen bij 9+ (of 4+) mag Kids, en de geweldvraag is een eerlijke afweging (§4).
Advies: Kids ja, band 9–11, als jij de antwoorden van §4 eerlijk vindt; anders geen Kids en 13+ — de app werkt verder hetzelfde.

## 7. Notities voor de reviewer (Engels)

App Store Connect → je versie → **App Review Information** → Notes. Inloggegevens: **niet nodig** (vink ‘Sign-in
required’ uit).

```
Bijbelreis ("Bible Journey") is a Dutch-language interactive Bible atlas for children and their parents. It retells 150 Bible histories, from Creation to Revelation, and follows the journeys step by step on a map: Abraham, Moses, David, Jesus, Paul.

No account is needed. The app collects no data and makes no network requests: all content (texts, map, drawings, photos) is bundled in the app and works fully offline, also on first launch.

What the app adds beyond our website (bijbelreis.nl):
- Everything is inside the app and works without internet (on trips, in church, at school).
- Progress (stamps, quiz scores, where you were) is kept on the device and backed up in the app's own storage (UserDefaults), so it survives when iOS clears web storage.
- Sharing uses the iOS share sheet; swiping back from the screen edge closes an open panel first and then returns to the previous place.
- No tracking, no analytics, no ads, no purchases, no visit counter and no web form (these exist on the website only).

Suggested path for review: open "Verhalen" (stories) and tap a story; tap "Reis" (journey) and use "Verder" to follow a journey on the map; try "Wie is wie" (who is who), "Tijdlijn" (timeline), "Speurtocht" (quiz) and "Paspoort" (passport with stamps).

Parental gate (Kids Category): every link out of the app (websites, mail), the Share button, "Mis je iets?" (send a request by e-mail) and the print/presentation buttons on the lesson pages first show an adult task: a multiplication written in Dutch words, for example "hoeveel is zesentwintig keer drie?" (twenty-six times three = 78). A wrong answer gives a new question; "Sluiten" cancels. Only after a correct answer does Safari, Mail or the share sheet open.

Content note: the Bible histories include war, death and judgment. They are told briefly in words, as in a children's Bible, without graphic detail. Drawings never show blood, the dead or violence; people are small faceless pictograms. God, Jesus and angels are never depicted.

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

Klaar in `apps/ios/store/screenshots/` (JPEG, zonder transparantie), vijf per maat, in deze volgorde:
1 een geschiedenis (Droog door de Schelfzee), 2 een reis op de kaart met tekening, 3 Wie is wie, 4 Speurtocht met
‘Goed zo!’, 5 Paspoort met ‘Hier was je’. De voortgang is verzonnen (het script loopt zelf een paar reizen door).

| Map | App Store Connect | Maat |
|---|---|---|
| `iphone-6.9/` | iPhone 6,9" (Dynamic Island, groot) | 1320×2868 |
| `iphone-6.3/` | iPhone 6,3" (Dynamic Island, middel; Apple noemt deze verplicht) | 1206×2622 |
| `ipad-13/` | iPad 13" (verplicht als de app op iPad draait) | 2064×2752 |

**Eerlijk:** dit zijn browserweergaven (Chromium) van precies dezelfde app-inhoud, zonder statusbalk en notch. Ziet iets
er in de Simulator anders uit, maak ze dan daar: Simulator → iPhone 17 Pro Max / iPhone 17 Pro / iPad Pro 13" →
**Cmd+S** (bewaart op het bureaublad in de juiste maat). Opnieuw maken op Linux of de Mac:
`cd apps/ios && npm run webmap && npm run screenshots`.

## 10. Wat al getest is (zonder Mac)

- `npm run webmap` (maak-webmap) slaagt op de huidige website; de unittest `tests/bijbelreis-app-webmap.test.ts` (in
  de gewone CI) draait het bij elke websitewijziging, plus acht gevallen die moeten falen.
- `npm run test:web` (19 stappen in Chromium op iPhone-maat, met nagebootste Capacitor): start, geen service worker,
  verhaal en reis, reservekopie, een deel kiezen zonder poort, ouderpoort (fout, sluiten, goed), mail, delen, licentie,
  terug, lesroutes heen en terug, presentatie en afdrukken via de poort, privacy en hulp in de app, verhaal-adres,
  herstel na lege opslag, geen `/api`, geen verzoek naar buiten, geen fouten.
- `npm run controleer` (59 controles): plists en storyboards met een XML-parser, `project.pbxproj` met de parser van
  Capacitor (`xcode`), bundle-ID, versie, team leeg, iPhone + iPad, standen, pictogram zonder alfa, teksten binnen de
  limieten.
- `npx cap sync ios` werkt op Linux (Package.swift ongewijzigd).
- **Niet getest:** bouwen in Xcode, de simulator, een echte iPhone/iPad, de echte WKWebView, het ophalen van de
  Swift-pakketten.
