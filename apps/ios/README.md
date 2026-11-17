# Bijbelreis voor iOS (Capacitor)

De Bijbelreis als app voor iPhone en iPad. Het besluit staat in `docs/bijbelreis-ios/BESLUIT.md`; **wat Martijn zelf doet
(Xcode, App Store Connect, teksten, leeftijd, privacylabel, Kids) staat in `docs/bijbelreis-ios/APPSTORE.md`.**

Deze map staat los van de website: eigen `package.json`, eigen `node_modules`. De root (`vitest`, `tsc`, `playwright`,
`npm run build`, de worker en de uitrol) kijkt er niet in. Eén uitzondering, met opzet: de root-unittest
`tests/bijbelreis-app-webmap.test.ts` draait `scripts/maak-webmap.mjs` (alleen Node, geen Capacitor), zodat een
websitewijziging die de app breekt, in CI rood wordt.

## Hoe het werkt

```
public/bijbelreis.html            ─┐
public/bijbelreis/**               ├─ scripts/maak-webmap.mjs ─→ www/ ─ npx cap sync ios ─→ ios/App/App/public/
public/fonts/**                    │                                  (in de app, offline)
app-laag/**  (adressen, app-laag) ─┘
```

**`scripts/maak-webmap.mjs`** kopieert de atlas naar `www/`:

- Pagina’s in de app: `index.html` (de atlas), `bijbelreis/lessen.html`, `bijbelreis/privacy.html`,
  `bijbelreis/hulp.html`. Elk krijgt `data-app="ios"`, een CSP-meta (zelfde beleid als `public/_headers`, zonder
  Cloudflare en zonder formulierverzending) en de app-laag als eerste script.
- Niet mee: de bezoekmeting (`bezoek.js`), presentatie en boekje (`boekje*`), `verhuis.js`, en de installeerbare website
  (`pwa.js`, manifest, PWA-pictogrammen, de apple-/web-app-meta). **Geen service worker in de app:** WKWebView met het
  schema `capacitor://` kent geen service worker, en alles staat al in de app.
- De privacytekst onder ‘Voor ouders en leiders’ wordt die van de app (met een link naar de privacypagina in de app).
- **Hard falen** (met een lijst van wat niet past) bij: een vervanging die niet meer past; een nieuwe pagina; een nieuwe
  `/api`-aanroep; een nieuwe netwerkaanroep (`fetch`, `sendBeacon`, `XMLHttpRequest`, `WebSocket`, `import()` …,
  per bestand geteld); een script, afbeelding, stijl of formulier van buiten; een service worker of manifest;
  navigeren per script (`location.href =`, `window.open`); een eigen adres zonder bestemming in de app.

**`app-laag/adressen.js`** zegt waar een adres van de website in de app heen gaat (gedeeld met `maak-webmap.mjs`). In de
app geeft elk adres zonder extensie `index.html` (de router van Capacitor), dus zonder deze laag zou
`/bijbelreis/lessen` stil de atlas openen.

| Adres op de website | In de app |
|---|---|
| `/`, `/bijbelreis`, `/bijbelreis.html` (+ `#…`) | de atlas, zelfde fragment |
| `/bijbelreis/lessen#…` | `bijbelreis/lessen.html#…` |
| `/privacy`, `/hulp` (ook `/bijbelreis/…`) | de pagina in de app |
| `/verhaal/26-…`, `/verhalen` | de atlas op `#v26`, `#verhalen` |
| `/bijbelreis/boekje#…` (presentatie, boekje) | via de ouderpoort naar bijbelreis.nl in Safari (downloaden en printen werken niet in de webview) |
| elk ander adres zonder extensie | via de ouderpoort naar bijbelreis.nl (niets loopt dood) |

**`app-laag/app-laag.js`** draait alleen in de app:

- **Voortgang:** een kopie van alle sleutels `bijbelreis:*` in Capacitor Preferences (UserDefaults). Is `localStorage`
  bij de start leeg terwijl er een kopie is, dan zet de laag die terug en laadt één keer opnieuw.
- **Ouderpoort** (Kids-categorie): een rekensom in woorden voor links naar buiten, Delen, mailen, en op de lesroutes
  Presentatie, Boekje en Afdrukken.
- **Delen** via het deelmenu van iOS (alleen de knop ‘Deel’; de knoppen van de delen van een reis hebben ook `data-deel`
  en blijven gewoon werken).
- **‘Mis je iets?’** opent na de poort de mail van de ouder in plaats van het formulier (dat zou een e-mailadres naar de
  server sturen).
- **Adressen** van de website naar de juiste pagina in de app (tabel hierboven).
- De licentie van Leaflet opent in een venster.

**`ios/`** is het Xcode-project (`npx cap add ios --packagemanager SPM`: Swift Package Manager, geen CocoaPods), daarna
aangepast: `BijbelreisViewController` (terug vegen), `Info.plist` (naam ‘Bijbelreis’, taal nl, lichte statusbalk,
`ITSAppUsesNonExemptEncryption = NO`, alleen arm64, iPhone staand/liggend, iPad alle standen),
`PrivacyInfo.xcprivacy` (UserDefaults, CA92.1), bundle-ID `nl.bijbelreis.app`, versie 1.0.0 (build 1), automatische
signing met een leeg team, minimaal iOS 16.4, iPhone en iPad. Pictogram en opstartscherm: voorlopig de kameel.

Versies: Capacitor 8.6.0, @capacitor/preferences 8.0.1, @capacitor/share 8.0.3; voor de controles plist 3.1.1,
xcode 4.0.0 en xml2js 0.6.2 (dezelfde als in @capacitor/cli). Allemaal vast.

**`store/`**: de App Store-teksten (`metadata.nl.json`) en de schermafbeeldingen (`screenshots/`).

## Scripts

```sh
cd apps/ios
npm ci
npm run webmap        # maak-webmap: public/ → www/ (faalt als iets niet past)
npm run sync          # webmap + cap sync ios (werkt ook op Linux)
npm run test:web      # test-webmap.mjs in Chromium op iPhone-maat (Playwright uit de root: npm ci in de root)
BROWSER=webkit npm run test:web   # zelfde test in Playwright-WebKit (dichter bij WKWebView)
npm run controleer    # Xcode-project, plists, pictogram en teksten (zonder Mac)
npm run screenshots   # schermafbeeldingen voor de App Store → store/screenshots/
npm run open          # alleen op de Mac: opent Xcode
```

`test-webmap.mjs` start een statische server op `www/` die zich gedraagt als de router van Capacitor (adres zonder
extensie → `index.html`) en bootst Capacitor Preferences en Share na. Het controleert o.a.: geen service worker, geen
`/api`, geen verzoek naar buiten, geen fouten; voortgang en herstel; ouderpoort; delen; lesroutes heen en terug;
presentatie en afdrukken via de poort; de digibordstand; De wereld in die tijd; privacy en hulp in de app; een
verhaaladres van de website. **Dit is niet de echte iOS-webview (WKWebView)**; dat doet de simulator-test hieronder.

## In GitHub Actions (zonder Mac)

`.github/workflows/ios.yml` bouwt en test de app op een Mac van GitHub bij elke wijziging aan `apps/ios/`,
`public/bijbelreis*` of `public/fonts/`, en uploadt hem met de hand naar TestFlight. Wat Martijn daarvoor instelt en hoe
een nieuwe versie gaat: `docs/bijbelreis-ios/TESTFLIGHT.md`.

- **`scripts/simulator-test.mjs`** (alleen op een Mac): start de Release-build in de simulator, daarna de Debug-build
  met de testloper, en loopt de scenario’s uit **`scripts/simulator-scenario.mjs`** af op iPhone 17 Pro Max, iPad Pro
  13-inch (M5) en iPhone 17 Pro. Maakt schermafbeeldingen met `xcrun simctl io … screenshot` (ook de App
  Store-beelden in de juiste maten) en controleert elk beeld op een wit of leeg scherm.
- **`ios/App/App/BijbelreisTest.swift`**: de testloper in de app. Staat helemaal binnen `#if DEBUG` (de Release-build
  bevat hem niet; de workflow controleert dat) en doet alleen iets als de app met `BIJBELREIS_TEST=<scenario>` in de
  omgeving start. Hij voert JavaScript-stappen uit in de echte WKWebView, `webView.goBack()` voor ‘terug vegen’, en
  schrijft de uitkomst naar `Documents/test/` in de app-container, waar de test hem leest.
- Een stap toevoegen: in `simulator-scenario.mjs` (`js`, `terug`, `wacht`, `foto`). Proberen kan zonder Mac niet; de
  JavaScript van de stappen kun je wel in Playwright tegen `www/` uitproberen.
- `App.xcodeproj/xcshareddata/xcschemes/App.xcscheme`: gedeeld schema, zodat `xcodebuild -scheme App` en `archive`
  op een schone runner werken.

Met een eigen Mac bouwen en naar TestFlight kan ook: `docs/bijbelreis-ios/APPSTORE.md` §1–2.
