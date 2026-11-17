# Bijbelreis als iOS-app: besluit

> **Stand 17-11-2026 (later):** de app staat in `apps/ios/` (branch `claude/bijbelreis-ios-app`, via een PR naar `main`), bijgewerkt
> voor de huidige atlas (lesroutes, geen service worker, privacy en hulp in de app). De stappen voor Xcode en App Store
> Connect, de teksten, de leeftijdsvragenlijst en het privacylabel staan in **`APPSTORE.md`**. De privacy- en
> support-URL zijn `https://bijbelreis.nl/privacy` en `https://bijbelreis.nl/hulp` (in plaats van `/privacy-app`).

17 november 2026. Vraag van Martijn: Bijbelreis moet ook in de Apple App Store. Vergeleken zijn (1) alleen een PWA, (2) de bestaande website via Capacitor als iOS-app en (3) een volledig native SwiftUI-app.

## Besluit in het kort

**Capacitor, met de bestaande atlas als code.** De app krijgt alle bestanden van de atlas in de app zelf, laadt niets van internet en voegt een dunne app-laag toe: voortgang ook in de opslag van iOS, een ouderpoort voor alles wat de app uit gaat, delen via het deelmenu van iOS, ‘terug vegen’ en geen bezoekmeting of aanvraagformulier. Het prototype staat op de branch `claude/bijbelreis-ios-prototype` (map `apps/ios/`) en is op Linux getest, niet op een iPhone.

**Kids-categorie: advies ja**, met een ouderpoort. Dit is een blijvende keuze, zie §4.

## 1. Vergelijking

| | 1. Alleen PWA | 2. Capacitor (advies) | 3. Native SwiftUI |
|---|---|---|---|
| In de App Store | Nee. Een PWA zet je via Safari op het beginscherm. | Ja | Ja |
| Hergebruik van de code | Volledig | Volledig: dezelfde `public/bijbelreis*`, plus een app-laag van ongeveer 250 regels | Geen. App.js (2.828 regels), de CSS en 2,7 MB aan inhoud in JS zouden opnieuw moeten. De kaart met Leaflet zou native opnieuw moeten (MapKit of MapLibre). |
| Werk tot TestFlight | Gedaan: manifest en service worker staan er sinds PR #47 (17-11-2026), zie `docs/bijbelreis-pwa/README.md` | Klein tot middel: het prototype staat er, daarna testen op een Mac | Maanden |
| Onderhoud | Eén codebasis | Eén codebasis. Elke nieuwe versie van de inhoud vraagt wel een nieuwe app-build en een review. | Twee codebases die uit elkaar gaan lopen |
| Risico 4.2 (‘alleen een website’) | n.v.t. | Aanwezig, maar beperkt: de app laadt geen website. Alles staat in de app, werkt offline en gebruikt iOS-functies (zie §3). | Klein |
| Offline | Eerder bekeken verhalen, kaart en foto’s (service worker sinds PR #47) | Volledig, vanaf de eerste start. 6,8 MB in de app. | Volledig |
| Voortgang duurzaam | ‘Best effort’: WebKit kan de opslag van een site opruimen | Ja: kopie in Preferences (UserDefaults) | Ja |
| Kids-categorie mogelijk | n.v.t. | Ja, met de app-laag | Ja |
| Kaart en animaties | Safari | WebKit, net als Safari. Verwachting: gelijk aan Safari op dezelfde iPhone. Nog niet gemeten. | Native, maar alles moet opnieuw |
| Kosten | Geen | Apple Developer Program, 99 USD per jaar, plus een Mac met Xcode 26 | Zelfde als 2, plus veel meer bouwtijd |

**Conclusie.** Een PWA komt niet in de App Store en valt daarmee af als antwoord op de vraag. Een PWA blijft wel een goedkope verbetering voor de website zelf, los van dit besluit; die is inmiddels gebouwd (PR #47). SwiftUI kost een herbouw van alles wat nu goed werkt, zonder duidelijke winst voor kinderen of ouders. Capacitor gebruikt de bestaande atlas en maakt de app-specifieke zaken (ouderpoort, opslag, delen) los van de website.

## 2. Wat Apple vraagt (bronnen in §9)

- **4.2 Minimum functionality:** een app moet ‘elevate it beyond a repackaged website’ en ‘lasting entertainment value or adequate utility’ hebben. **4.2.2:** geen ‘web clippings, content aggregators, or a collection of links’. **4.2.3:** de app moet zelfstandig werken. Moet hij bij de eerste start iets downloaden, dan eerst de grootte melden en het vragen.
- **2.5.2:** de app moet ‘self-contained’ zijn en mag geen code downloaden die functies verandert. Daarom staat de atlas ín de app, niet op afstand (geen `server.url`).
- **1.3 Kids Category:** ‘must not include links out of the app, purchasing opportunities, or other distractions to kids unless reserved for a designated area behind a parental gate’. Geen analytics of reclame van derden. Geen persoonlijke of apparaatgegevens naar derden. Kies je de categorie, dan ‘it will need to continue to meet these guidelines in subsequent updates, even if you decide to deselect the category’.
- **5.1.4 Kids:** let op COPPA, de AVG en andere wetten. Een app in de Kids-categorie heeft een privacybeleid nodig. Een ouderpoort is niet hetzelfde als toestemming van ouders voor gegevensverwerking. **2.3.8:** ‘For Kids’ en ‘For Children’ in de metadata mag alleen in de Kids-categorie. Een app buiten die categorie mag in naam, ondertitel, pictogram, schermafbeeldingen en beschrijving niet laten blijken dat kinderen de hoofddoelgroep zijn.
- **Ouderpoort:** Apple noemt het ‘adult-level tasks’, met als voorbeelden een rekensom of een vraag. Leeftijdsbanden voor de Kids-categorie: 5 en jonger, 6–8 en 9–11.
- **Leeftijdsclassificatie:** sinds 2025 zijn er de classificaties 4+, 9+, 13+, 16+ en 18+, met een nieuwe vragenlijst (in-app controls, capabilities, medische onderwerpen, geweld). Sinds 31 januari 2026 moet je die invullen voordat je updates kunt indienen. Vanaf september 2026 zijn er ook verplichte vragen over sociale functies. De Kids-categorie kan alleen bij een berekende classificatie van 4+ of 9+.
- **Privacylabel:** ‘collect’ betekent dat gegevens het apparaat verlaten en langer bewaard worden dan nodig is om het verzoek af te handelen. Dat geldt ook voor de eigen server.
- **Bouwen:** sinds 28 april 2026 moet een upload gebouwd zijn met Xcode 26 of nieuwer en de iOS 26 SDK. Capacitor 8 vraagt ook Xcode 26 of nieuwer, en macOS.

## 3. Wat de app meer geeft dan de website (4.2)

1. **Alles in de app, volledig offline.** Geen enkel netwerkverzoek, ook niet bij de eerste start. Op reis, in de kerk of op school werkt alles.
2. **Voortgang die blijft.** Stempels, scores en waar je was gaan ook naar Preferences (UserDefaults). Capacitor zelf waarschuwt dat iOS de opslag van webviews kan opruimen als het geheugen vol raakt. Ruimt iOS die op, dan zet de app de voortgang bij de volgende start terug.
3. **Delen via het deelmenu van iOS** (Capacitor Share), na de ouderpoort.
4. **Terug vegen** vanaf de rand van het scherm. Dat gebruikt de bestaande ‘terug’-logica van de atlas: eerst het open venster, daarna de vorige plek.
5. **Een app-ervaring:** geen adresbalk, eigen pictogram en opstartscherm, statusbalk in de kleur van de kop, ook voor de iPad.
6. **Veilig voor kinderen:** niets gaat de app uit zonder ouderpoort, er is geen telling en er gaan geen gegevens naar een server.

**Haptics (trillen):** niet toegevoegd. De Bijbelreis kiest voor rust (geen geluid standaard). Een korte tik bij een nieuwe stempel is mogelijk via de app-laag, maar voegt weinig toe.

**Eerlijk risico:** de inhoud is dezelfde als op bijbelreis.nl. Een reviewer kan toch 4.2 geven. Zet de punten hierboven daarom in de notities voor de review, per tabblad. Volgens meldingen op het Apple-forum helpt dat. Dat is gebruikerservaring, geen garantie.

## 4. Kids-categorie en privacy

**Advies: ja, Kids-categorie.** De Bijbelreis is duidelijk voor kinderen gemaakt (reisniveaus 4–6, 7–10 en 11+). Buiten de Kids-categorie verbiedt 2.3.8 dat de App Store-pagina dat zegt. De wet (COPPA, AVG) kijkt bovendien naar de doelgroep, niet naar de categorie. De voorwaarden passen bij wat de Bijbelreis al wil: geen account, geen tracking, rust.

**Nadelen:** de keuze is blijvend, ook als je de categorie later uitzet. Elke update moet aan de regels blijven voldoen. Delen en links kosten ouders één extra stap. De hoogste band is 9–11, terwijl de app tot 14 jaar en voor ouders bedoeld is. De band bepaalt alleen waar de app in de Kids-categorie staat: de app blijft voor iedereen te downloaden.

**Wat de website doet dat in de app anders moet (en hoe het prototype dat oplost, zonder de website te wijzigen):**

| Op de website | Probleem in de Kids-categorie | In de app |
|---|---|---|
| Bezoekmeting (`public/bijbelreis/bezoek.js` → `POST /api/bezoek`, `worker/bezoek.ts`) | Wordt bewaard, dus ‘collect’ (privacylabel). Gebruiksgegevens van kinderen. | Weggelaten. `bezoek.js` gaat niet mee en de scripttag is weg. Ook zonder dat zou hij niets versturen: hij meldt alleen bij `http(s):`, en de app draait op `capacitor://`. |
| Aanvraagformulier met e-mailveld (`worker/aanvraag.ts`) | Persoonsgegevens (e-mail) van mogelijk een kind onder 13 of 16. COPPA vraagt dan in principe verifieerbare toestemming van ouders. | Geen formulier. ‘Mis je iets?’ opent na de ouderpoort de mail van de ouder (`mailto:info@denckh.nl`). De app zelf verstuurt niets. |
| Externe links (Wikimedia-bronnen bij foto’s, licenties, GitHub, Denckh, Raadkoord, Raadkoord Kerst) | ‘Links out of the app’ | Achter de ouderpoort, daarna in Safari |
| Deelknop | Opent andere apps (berichten, WhatsApp) | Achter de ouderpoort, daarna het deelmenu van iOS |
| Privacytekst noemt telling en formulier | Klopt niet voor de app | De app krijgt een eigen privacytekst: ‘de app verstuurt niets’ |

**Privacylabel:** waarschijnlijk ‘Geen gegevens verzameld’. De app verstuurt zelf niets. Een mail die een ouder zelf vanuit Mail stuurt, gaat niet via de app. Controleer dit bij het invullen tegen de definities van Apple.

**Nodig voor App Store Connect:** een URL naar het privacybeleid (bij de Kids-categorie verplicht) en een support-URL. Advies: een korte pagina op bijbelreis.nl, bijvoorbeeld `/privacy-app`. Dat is een kleine, aparte wijziging aan de website.

**AVG:** de AVG (artikel 8) laat lidstaten een leeftijd tussen 13 en 16 jaar kiezen voor toestemming bij online diensten. Nederland houdt 16 jaar aan (artikel 5 UAVG; volgens secundaire bronnen, niet in de wettekst nagelezen). Omdat de app geen persoonsgegevens verwerkt, is er niets om toestemming voor te vragen.

## 5. Opslag, navigatie, prestaties

- **Opslag:** de atlas schrijft gewoon naar `localStorage` (`bijbelreis:*`, stap-sleutels ongewijzigd). De app-laag houdt bij elke wijziging een kopie in Preferences bij (één sleutel `bijbelreis-voortgang`). Is `localStorage` bij de start leeg terwijl er een kopie is, dan zet de laag die terug en laadt de pagina één keer opnieuw. Een volledige overstap op Preferences zou de atlas asynchroon maken (grote refactor) en is daarom niet gekozen.
- **Voortgang van de website meenemen:** dat kan niet vanzelf, want de website (bijbelreis.nl in Safari) en de app hebben elk hun eigen opslag. Er is al een verhuismechanisme (`#verhuis=…`, `verhuis.js` en `verhuisIn()` in app.js). **Voorstel voor later:** een knop ‘Neem je voortgang mee naar de app’ op de website, met een eigen URL-schema of universal link naar de app. De app hoeft dan niets nieuws te doen, want app.js leest `#verhuis=` al. Dat vraagt een kleine wijziging aan de website en is een productkeuze, dus niet gedaan.
- **Terug vegen:** `allowsBackForwardNavigationGestures` staat aan op de webview (`BijbelreisViewController`). **Risico:** een veeg vanaf de linkerrand van de kaart kan als ‘terug’ werken in plaats van schuiven. Test dit op een iPhone. Stoort het, zet de veeg dan uit zolang de kaart op ‘Groot’ staat.
- **Kaart en animaties:** de app gebruikt WebKit, dezelfde engine als Safari op iOS. Leaflet zou dus net zo moeten werken als op bijbelreis.nl in Safari. Niet gemeten, want er is geen Mac. Op Linux in Chromium was de kaart na ongeveer 0,6–1,1 s klaar. Dat zegt niets over een iPhone.
- **Minimale iOS-versie: 16.4.** De CSS gebruikt `color-mix()` (Safari 16.2 en nieuwer) en `:has()`. Onder iOS 16.4 zou de opmaak niet kloppen.

## 6. Risico’s

1. **4.2-afwijzing.** Beperken met de notities voor de review (§3). Komt er toch een afwijzing, kijk dan wat de reviewer noemt. Geen meldingen of andere onrust toevoegen om erdoorheen te komen.
2. **Niet getest op een iPhone of in de simulator.** Er is geen Mac. Zie de testlijst in `apps/ios/README.md`.
3. **Updates gaan trager.** Nieuwe inhoud op de website staat pas in de app na een nieuwe build en review. Inhoud op afstand laden is geen goed idee (2.5.2 en het risico van ‘alleen een website’).
4. **De Kids-categorie is blijvend.** Nieuwe links of serveraanroepen in de website komen ook in de app. Daar helpen twee dingen. Het kopieerscript `maak-webmap.mjs` stopt bij een nieuwe `/api/`-aanroep of als de privacytekst niet meer te vervangen is. De ouderpoort vangt alle links naar buiten op (`a[href]`). Een link die de website via script opent, ziet de poort niet. Voorstel: in de app later ook native elke navigatie naar buiten blokkeren die niet via de poort gaat.
5. **Pictogram en opstartscherm zijn voorlopig:** de kameel uit de favicon. Laat ze ontwerpen vóór de publicatie.
6. **De bundle-ID (`nl.bijbelreis.app`) ligt vast na de eerste upload.** Kies hem bewust.

## 7. Wat Martijn zelf moet doen

1. **Apple Developer Program** (99 USD per jaar, prijs in euro bij het aanmelden). Dit vraagt jouw kostenakkoord. Er is niets aangeschaft. Kies ook hoe je je aanmeldt:
   - **Als persoon (ook een eenmanszaak):** je eigen naam staat als verkoper in de App Store.
   - **Als organisatie:** dan staat bijvoorbeeld ‘Denckh’ als verkoper. Dat vraagt een rechtspersoon met een D-U-N-S-nummer. Handelsnamen worden niet geaccepteerd.
   - In beide gevallen heb je een Apple-account met tweestapsverificatie nodig.
2. **Een Mac met Xcode 26 of nieuwer.** Een gehuurde Mac in de cloud kan ook, maar kost geld en vraagt dus eerst akkoord.
3. **App Store Connect:**
   - Een app aanmaken met de bundle-ID, de naam (‘Bijbelreis’?), de categorie (Onderwijs) en Kids ja/nee met de leeftijdsband.
   - De leeftijdsvragenlijst invullen. De geschiedenissen beschrijven ook geweld, zonder beelden. Vul eerlijk in: alleen 4+ of 9+ past in de Kids-categorie.
   - Het privacylabel, de privacy-URL en de support-URL invullen, met schermafbeeldingen.
   - Je **handelaarsstatus (DSA)** opgeven. Dat moet ook als je niet in de EU verspreidt. Als handelaar moet je contactgegevens opgeven en laten controleren. Die staan daarna op de App Store-pagina in de EU: volgens ontwikkelaars adres, telefoon en e-mail.
4. **Besluiten:** Kids-categorie ja/nee en de leeftijdsband (advies 9–11, waar ‘Zelf op reis’ (7–10) het meest overlapt), de bundle-ID, de app-naam en het pictogram.

## 8. Stappenplan naar TestFlight

1. Op de Mac: de branch `claude/bijbelreis-ios-prototype` ophalen, dan `cd apps/ios && npm ci && npm run sync`.
2. `npm run open` (of `npx cap open ios`). Xcode haalt de Swift-pakketten op (Capacitor via GitHub).
3. In Xcode, onder Signing & Capabilities: je team kiezen en de bundle-ID controleren.
4. In de simulator en op je eigen iPhone draaien. Werk de testlijst in `apps/ios/README.md` af.
5. Product → Archive → Distribute App → App Store Connect → Upload.
6. In App Store Connect onder TestFlight:
   - **Interne testers** (tot 100, met een rol in je team): direct testen.
   - **Externe testers** (tot 10.000, bijvoorbeeld gezinnen): eerst een korte beta-review door Apple.
7. Daarna metadata en schermafbeeldingen invullen en indienen voor de review, met de notities uit §3.

## 9. Bronnen (allemaal geraadpleegd op 17-11-2026)

- Apple, App Review Guidelines (1.3, 2.3.8, 2.5.2, 4.2, 4.2.2, 4.2.3, 4.7, 5.1.4): https://developer.apple.com/app-store/review/guidelines/
- Apple, Kids apps en ouderpoorten: https://developer.apple.com/app-store/kids-apps/
- Apple, Set an app age rating: https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating
- Apple News, Updated age ratings in App Store Connect (24-07-2025): https://developer.apple.com/news/?id=ks775ehf
- Apple News, vragen over sociale functies in de leeftijdsvragenlijst (09-07-2026): https://developer.apple.com/news?id=tlur8uvi
- Apple, Upcoming requirements (Xcode 26/iOS 26 SDK sinds 28-04-2026; DSA-handelaarsstatus): https://developer.apple.com/news/upcoming-requirements/
- Apple, EU Digital Services Act: handelaarsgegevens op de App Store-pagina: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements
- Apple, App privacy details (definitie van ‘collect’): https://developer.apple.com/app-store/app-privacy-details/
- Apple, Enrollment (99 USD, persoon of organisatie, D-U-N-S): https://developer.apple.com/programs/enroll/
- Apple, TestFlight: https://developer.apple.com/testflight/
- Apple, WKWebView `allowsBackForwardNavigationGestures`: https://developer.apple.com/documentation/webkit/wkwebview/allowsbackforwardnavigationgestures
- WebKit, Updates to Storage Policy (10-08-2023; ‘best-effort mode’, opruimen): https://webkit.org/blog/14403/updates-to-storage-policy/
- WebKit, News from WWDC25 (09-06-2025; vanaf iOS 26 opent elke beginschermsite als web-app): https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
- Capacitor, iOS (v8; iOS 15+, Xcode 26+): https://capacitorjs.com/docs/ios
- Capacitor, Environment setup (macOS nodig, SPM aanbevolen, Node 22+): https://capacitorjs.com/docs/getting-started/environment-setup
- Capacitor, Swift Package Manager: https://capacitorjs.com/docs/ios/spm
- Capacitor, Storage (iOS kan localStorage en IndexedDB van webviews opruimen): https://capacitorjs.com/docs/guides/storage
- Capacitor, Preferences (UserDefaults): https://capacitorjs.com/docs/apis/preferences
- Capacitor, Share: https://capacitorjs.com/docs/apis/share
- Capacitor, Config (iosScheme `capacitor`, allowNavigation): https://capacitorjs.com/docs/config
- Capacitor, Custom view controller: https://capacitorjs.com/docs/ios/viewcontroller
- Capacitor, Privacy manifest (Preferences → UserDefaults, CA92.1): https://capacitorjs.com/docs/ios/privacy-manifest
- FTC COPPA-wijzigingen, naleving vanaf 22-04-2026 (secundair, advocatenkantoor): https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches
- AVG artikel 8 (leeftijd voor toestemming, lidstaten 13–16): https://gdpr-text.com/nl/read/article-8/
- Ervaringen met 4.2-afwijzingen (gebruikerservaring, geen harde bron): https://developer.apple.com/forums/thread/121570 en https://medium.com/@webvify.app/how-to-solve-apple-4-2-minimum-functionality-rejection-for-webview-apps-d8fce020c0f3
