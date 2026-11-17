# Bijbelreis voor iOS (Capacitor), prototype

Dit is de Bijbelreis als iOS-app. Het besluit en de onderbouwing staan in `docs/bijbelreis-ios/BESLUIT.md`. Deze map staat los van de website: hij heeft een eigen `package.json` en raakt de worker, de wrangler-configs, `npm run build` en de uitrol niet. Er staat ook niets in de root-`package.json`.

## Hoe het werkt

```
public/bijbelreis.html  ─┐
public/bijbelreis/**     ├─ scripts/maak-webmap.mjs ─→ www/  ─ npx cap sync ios ─→ ios/App/App/public/
public/fonts/**          │   (index.html + app-laag)         (in de app, offline)
app-laag/**             ─┘
```

- **`scripts/maak-webmap.mjs`** kopieert de atlas naar `www/`, met `bijbelreis.html` als `index.html`. Bij het kopiëren gebeurt dit:
  - de bezoekmeting gaat eruit (`bezoek.js` en de scripttag);
  - er komt een CSP-meta in, met hetzelfde beleid als `public/_headers` maar zonder Cloudflare-meting;
  - de app-laag wordt toegevoegd;
  - de privacytekst wordt die van de app.

  Het script stopt met een fout als een vervanging niet meer past, of als er een nieuwe `/api/`-aanroep in de atlas staat. De paden in de atlas zijn absoluut (`/bijbelreis/…`, `/fonts/…`). In de app is `www/` de wortel (`capacitor://localhost/`), dus die paden kloppen zonder worker. `boekje*` en `verhuis.js` gaan niet mee: de app gebruikt ze niet.
- **`app-laag/app-laag.js`** draait alleen in de app:
  - **Voortgang:** een kopie van alle sleutels `bijbelreis:*` in Capacitor Preferences. Is `localStorage` bij de start leeg terwijl er een kopie is, dan zet de laag die terug en laadt de pagina één keer opnieuw.
  - **Ouderpoort:** een rekensom in woorden, bijvoorbeeld ‘hoeveel is zesentwintig keer drie?’. Die staat voor links naar buiten, delen en mailen.
  - **Delen** via het deelmenu van iOS.
  - **‘Mis je iets?’** opent de mail van de ouder in plaats van het formulier.
  - **De licentie van Leaflet** opent in een venster.
- **`ios/`** is het Xcode-project, gemaakt met `npx cap add ios --packagemanager SPM`: Swift Package Manager, geen CocoaPods. Na het genereren is dit aangepast:
  - `SceneDelegate.swift`: de klasse `BijbelreisViewController`, die terug vegen aanzet (`allowsBackForwardNavigationGestures`);
  - `Main.storyboard`: verwijst naar die klasse;
  - `Info.plist`:
    - taal `nl`;
    - lichte statusbalk, op de donkere kop;
    - `ITSAppUsesNonExemptEncryption = false`: de app gebruikt geen eigen versleuteling en maakt geen netwerkverbinding;
  - `PrivacyInfo.xcprivacy`: UserDefaults met reden CA92.1, voor Preferences;
  - minimale iOS-versie 16.4, omdat de CSS `color-mix()` gebruikt;
  - pictogram en opstartscherm: voorlopig de kameel uit de favicon.

Versies: Capacitor 8.6.0, @capacitor/preferences 8.0.1 en @capacitor/share 8.0.3. Ze staan vast en zijn minstens twee weken oud.

## Op Linux (wat hier getest is)

```sh
cd apps/ios
npm ci
npm run sync          # maak-webmap + cap sync ios (werkt op Linux, ook met SPM)
node scripts/test-webmap.mjs 8906 /tmp/shots   # Playwright uit de root-node_modules (npm ci in de hoofdmap)
```

`scripts/test-webmap.mjs` start een statische server op `www/` en draait Chromium op iPhone-maat (390×664, touch). De test controleert:

- de start, de app-laag en de kaart;
- een verhaal en een reis;
- of de reservekopie in Preferences overeenkomt met `localStorage`;
- de ouderpoort: een fout antwoord, Sluiten en het juiste antwoord;
- ‘Mis je iets?’ (mailto en geen formulier) en delen (Share na de poort);
- de licentie in een venster en terug (eerst het venster dicht);
- dat er geen enkel `/api/`-verzoek of verzoek naar buiten gaat, en dat er geen fouten in de console staan;
- herstel na een lege `localStorage` (één herlaadbeurt);
- dat een eerste start zonder kopie niet opnieuw laadt.

Capacitor wordt daarbij nagebootst. **Dit is niet de echte iOS-webview.**

Niet te doen op Linux: bouwen, ondertekenen, de simulator, een echte iPhone en het ophalen van de Swift-pakketten.

## Op de Mac: bouwen en naar TestFlight

Nodig: macOS met Xcode 26 of nieuwer, Node 22 of nieuwer, en een Apple Developer-account (zie BESLUIT.md §7).

```sh
git fetch origin && git checkout claude/bijbelreis-ios-prototype
cd apps/ios
npm ci
npm run sync          # na elke wijziging aan public/ of app-laag/
npm run open          # opent ios/App/App.xcodeproj in Xcode
```

In Xcode:

1. **Wacht** tot de Swift-pakketten binnen zijn (File → Packages → Resolve Package Versions als dat niet vanzelf gaat).
2. **Target App → Signing & Capabilities:** kies je team. Laat ‘Automatically manage signing’ aan. Controleer de bundle-ID (`nl.bijbelreis.app`), want die ligt vast na de eerste upload.
3. **Draai in de simulator** (iPhone en iPad) en op je eigen iPhone. Werk daar de testlijst hieronder af.
4. **Verhoog per upload het buildnummer:** General → Identity → Build (`CURRENT_PROJECT_VERSION`). De versie (`MARKETING_VERSION`) verhoog je per release.
5. **Uploaden:** kies het apparaat ‘Any iOS Device (arm64)’, dan Product → Archive → Distribute App → App Store Connect → Upload.
6. **In App Store Connect onder TestFlight:** interne testers kunnen meteen testen. Externe testers kunnen pas na de beta-review van Apple.

## Testlijst op een iPhone (nog niet gedaan)

- [ ] Eerste start in vliegtuigmodus: alles werkt (kaart, verhalen, foto’s, speurtocht).
- [ ] De kaart schuift en zoomt vloeiend; de reis-animatie loopt soepel. Vergelijk met bijbelreis.nl in Safari op hetzelfde toestel.
- [ ] Terug vegen sluit eerst een venster, daarna de vorige plek. **Let op:** een veeg vanaf de linkerrand van de kaart mag het schuiven niet verstoren.
- [ ] Statusbalk, notch en home-indicator: de kop staat eronder en de onderbalk is vrij. Controleer de iPad liggend en staand.
- [ ] De ouderpoort komt bij: een fotobron (Wikimedia), een licentie, Denckh, Raadkoord, Raadkoord Kerst, Delen en ‘Mis je iets?’. Na het juiste antwoord openen Safari, Mail of het deelmenu.
- [ ] Voortgang: stempels halen, de app helemaal afsluiten en opnieuw openen. Alles staat er nog.
- [ ] Herstel: open in een debug-build de Web Inspector (Safari op de Mac → Ontwikkel → je iPhone). Voer `localStorage.clear()` uit en herlaad. De voortgang moet terugkomen.
- [ ] Donkere modus van iOS, grotere tekst (de webview volgt Dynamic Type niet vanzelf) en VoiceOver op de hoofdroute.
- [ ] Geen netwerkverkeer: in de Web Inspector staat onder Network niets dat de app uit gaat.
