# Bijbelreis naar TestFlight zonder Mac

Voor Martijn, 17 november 2026. De app wordt gebouwd, getest en (als jij hem start) geüpload door GitHub Actions op
een Mac van GitHub: `.github/workflows/ios.yml`. De repository is openbaar, dus de macOS-runners kosten niets. Er is
niets betaald, aangeschaft of ingediend. Wat je in App Store Connect invult (teksten, leeftijd 13+, privacy): zie
`APPSTORE.md`.

## Gekozen route

**GitHub Actions + automatische ondertekening via App Store Connect (cloud) met een API-sleutel.** Geen fastlane, geen
fastlane match, geen certificaten of profielen in GitHub: Xcode vraagt met de API-sleutel zelf een
distributiecertificaat in de cloud en een profiel aan (`xcodebuild -allowProvisioningUpdates -authenticationKey…`).

| | GitHub Actions (gekozen) | Xcode Cloud |
|---|---|---|
| Kosten | Gratis (openbare repository, standaard macOS-runner) | 25 rekenuren per maand inbegrepen bij het Developer Program; meer kost geld (vanaf US$ 49,99 per maand voor 100 uur) |
| Mac nodig om op te zetten | Nee | **Ja**: de eerste workflow stel je in **in Xcode** (‘configure a workflow in Xcode’); daarna kun je workflows op het web in App Store Connect beheren en starten |
| GitHub | Draait in de repository zelf | Koppelt aan GitHub via de autorisatie van Xcode Cloud (ook github.com) |
| Testen in de simulator | Ja, eigen scenario (hieronder) | Ja, maar dan met XCTest-tests in het project |
| Ondertekening | Cloud-ondertekening met API-sleutel (Admin) | Door Apple, zonder sleutel |

Bronnen (geraadpleegd 17-11-2026): developer.apple.com/xcode-cloud (25 uur, prijzen, ‘configure a workflow in Xcode’);
developer.apple.com/documentation/xcode/configuring-your-first-xcode-cloud-workflow en
…/source-code-management-setup (Xcode zoekt de Git-aanbieder en vraagt toegang). Omdat je voor dit werk geen Mac hebt,
valt Xcode Cloud af.

## Wat jij doet (eenmalig, ± 20 minuten)

1. **App Store Connect API-sleutel maken (rol Admin).**
   https://appstoreconnect.apple.com → **Gebruikers en toegang** (Users and Access) → tabblad **Integraties**
   (Integrations) → links **App Store Connect API** → tabblad **Teamsleutels** (Team Keys) → **API-sleutel genereren**
   of **+** → naam `GitHub Actions Bijbelreis` → toegang **Admin** → **Genereren**.
   - Noteer de **Key ID** (10 tekens) en bovenaan de **Issuer ID** (een lange code met streepjes).
   - Klik **API-sleutel downloaden**: je krijgt `AuthKey_<Key ID>.p8`. **Dat kan maar één keer**; Apple bewaart hem niet.
   - Waarom Admin: een **teamsleutel** is nodig (een persoonlijke sleutel kan geen ‘Provisioning’ doen). Volgens Apple’s
     rollentabel hebben Account Holder en Admin volledige toegang tot distributiecertificaten, cloud-beheerde
     certificaten, profielen en identifiers; App Manager alleen met extra toegang tot ‘Certificates, Identifiers &
     Profiles’, die je per gebruiker geeft (bij een teamsleutel kies je alleen de rol). Bronnen:
     developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api en
     developer.apple.com/help/account/access/roles (17-11-2026). Behandel de sleutel als een wachtwoord; is hij
     uitgelekt: in hetzelfde scherm **Intrekken**.
2. **Team ID opzoeken.** https://developer.apple.com/account → **Membership details** (Lidmaatschap): **Team ID**
   (10 tekens, hoofdletters en cijfers).
3. **Environment en geheimen in GitHub.** De repository op github.com → **Settings** → **Environments** → **New
   environment** → naam `testflight` → Configure. Zet onder **Deployment protection rules** eventueel ‘Required
   reviewers’ aan met jezelf (dan vraagt GitHub bij elke upload nog om jouw klik). Voeg daar onder **Environment
   secrets** → **Add environment secret** deze vier toe:

   | Naam | Waarde |
   |---|---|
   | `APP_STORE_CONNECT_KEY_ID` | de Key ID uit stap 1 |
   | `APP_STORE_CONNECT_ISSUER_ID` | de Issuer ID uit stap 1 |
   | `APP_STORE_CONNECT_KEY_P8` | de **hele inhoud** van `AuthKey_….p8` (open hem in Teksteditor/Kladblok, alles kopiëren, ook de regels `-----BEGIN PRIVATE KEY-----` en `-----END PRIVATE KEY-----`); base64 mag ook |
   | `APPLE_TEAM_ID` | de Team ID uit stap 2 |

   (Ze mogen ook bij **Settings → Secrets and variables → Actions** als repository-geheim staan; in de Environment is
   veiliger, want alleen de upload-job kan ze dan lezen.) Gooi het `.p8`-bestand daarna niet weg maar bewaar het veilig,
   of maak later gewoon een nieuwe sleutel.
4. **App in App Store Connect: bestaat al** (Bijbelreis, Apple ID 6835958573, bundel-ID `nl.bijbelreis.app`, SKU
   `BIJBELREIS-IOS-2026`; de repository noemde eerder `BIJBELREIS-IOS`, maar App Store Connect is leidend en een SKU is
   niet te wijzigen). Een app aanmaken kan de API ook niet: het onderdeel `apps` van de App Store Connect API heeft
   alleen ophalen en wijzigen (developer.apple.com/documentation/appstoreconnectapi/apps, 17-11-2026). Controleer alleen
   of `nl.bijbelreis.app` onder developer.apple.com/account → **Certificates, Identifiers & Profiles** → **Identifiers**
   staat; zo niet, dan registreert de eerste ondertekende build hem.
5. **Workflow starten.** github.com → tabblad **Actions** → links **iOS-app** → **Run workflow** → branch `main` →
   vink **Ook archiveren en uploaden naar TestFlight** aan → **Run workflow**. Na de bouw en de tests (± 30–40 min)
   start de job ‘Archiveren en uploaden naar TestFlight’ (met ‘Required reviewers’: eerst **Review deployments** →
   Approve).
6. **TestFlight.** Na 10–30 minuten staat de build in App Store Connect → je app → **TestFlight**. Vraagt hij om
   exportcompliance: die staat al in de app (`ITSAppUsesNonExemptEncryption = NO`). Voeg onder **Interne tests** in de groep
   **Bijbelreis intern** jezelf en wie je wilt toe (alleen mensen met een rol in je team, tot 100), en installeer
   via de app **TestFlight** op je iPhone of iPad. Interne tests hebben geen beoordeling van Apple nodig. Loop daarna de
   testlijst van `APPSTORE.md` §1 af op je eigen toestel.

**Ontbreekt een geheim**, dan stopt de upload-job meteen met een melding welke, en wordt er niets gebouwd of geüpload.

## Wat de workflow automatisch doet

**Bij elke wijziging aan `apps/ios/`, `public/bijbelreis*` of `public/fonts/`** (push naar main of een pull request),
en met de hand:

- **bouw** (macOS 26, Xcode 26.6 vast): `npm ci`, webmap maken + `cap sync ios`, `npm run controleer`, Swift-pakketten
  ophalen, **Release-build voor de simulator én voor `generic/platform=iOS`** (zonder ondertekening), Debug-build met
  testloper, controle dat de Release-build de testloper niet bevat.
- **Simulator-test** (`apps/ios/scripts/simulator-test.mjs`) op iPhone 17 Pro Max (6,9"), iPad Pro 13-inch (M5) en
  iPhone 17 Pro (6,3"):
  1. de Release-build start en toont de atlas;
  2. in de Debug-build loopt een testloper (`BijbelreisTest.swift`, alleen in DEBUG en alleen als de test hem
     aanzet) door de echte WKWebView: eerste start, een verhaal, een reis, een venster openen en **terug** (dezelfde
     actie als de rand-veeg), de **tijdlijn**, **De wereld in die tijd** en terug, de **ouderpoort** (fout antwoord,
     sluiten), de reservekopie van de voortgang, de **lesroutes** met de **digibordstand**, ‘Presentatie’ via de poort,
     ‘In de atlas’ en terug, **privacy**, geen verzoek dat de app uit gaat, geen fouten in de pagina, en **veilige
     zones** (niets onder statusbalk, notch of Dynamic Island, niets vast boven de thuisstreep);
  3. app afsluiten en opnieuw starten: de voortgang is er nog;
  4. de App Store-schermafbeeldingen in de echte iOS-weergave (met statusbalk 9:41).
  Elke schermafbeelding wordt gecontroleerd op een wit of leeg scherm. Alles komt in het artefact
  **simulator-schermafbeeldingen** (Actions → de run → onderaan Artifacts), met `appstore/` als JPEG in de juiste maten.
- **webkit** (Linux): dezelfde webmaptest als `npm run test:web`, in Playwright-WebKit op iPhone-maat.

**Alleen met de hand en het vinkje** (job **testflight**, Environment `testflight`): archiveren met automatische
ondertekening via de API-sleutel (`DEVELOPMENT_TEAM` = jouw Team ID, buildnummer = het runnummer van de workflow),
exporteren met `method app-store-connect` en `destination upload`. De sleutel staat alleen tijdens de job in
`$RUNNER_TEMP`, wordt gemaskeerd in de logboeken en daarna verwijderd. Pull requests (ook van forks) krijgen nooit
geheimen: de job draait daar niet.

## Een nieuwe versie uitbrengen

1. Werk aan de website (`public/`) of `apps/ios/` gaat zoals altijd via een pull request; de bouw-job moet groen zijn.
2. Alleen een nieuwe **build** van dezelfde versie (bijv. een fout herstellen tijdens TestFlight): niets aanpassen;
   start de workflow met het vinkje. Het buildnummer gaat vanzelf omhoog (runnummer).
3. Een nieuwe **versie** voor de App Store (1.0.1, 1.1.0): zet `MARKETING_VERSION` in
   `apps/ios/ios/App/App.xcodeproj/project.pbxproj` (Debug en Release) en de verwachting in
   `apps/ios/scripts/controleer-ios.mjs` op het nieuwe nummer, en `watIsErNieuw` in `apps/ios/store/metadata.nl.json`.
   Na de merge: workflow met het vinkje starten.
4. In App Store Connect: nieuwe versie aanmaken (+ bij iOS-app), ‘Wat is er nieuw’ invullen, de build kiezen,
   **Ter beoordeling indienen**. Dat laatste doe jij; de workflow dient nooit iets in.

## Als het misgaat

| Melding | Wat te doen |
|---|---|
| `Geheimen ontbreken: …` | Stap 3: naam precies zo, in de Environment `testflight` |
| `No profiles for 'nl.bijbelreis.app' were found` / `Cloud signing permission error` | Sleutel heeft niet de rol Admin, of is een persoonlijke sleutel: maak een teamsleutel met Admin (stap 1) |
| `No suitable application records were found` | De bundel-ID van de build verschilt van die in App Store Connect (`nl.bijbelreis.app`) |
| `The bundle version must be higher than the previously uploaded version` | Gebeurt alleen als iemand met de hand een hoger buildnummer uploadde: zet in de workflow `BUILDNUMMER` tijdelijk hoger |
| `Xcode 26.6 staat niet (meer) op deze runner` | GitHub heeft een patchversie vervangen: kies in `XCODE_VERSIE` een versie uit de lijst in de melding |
| De job ‘Bouwen en testen in de simulator’ staat lang op ‘Queued’ en wordt na 15 minuten ‘Cancelled’ | Drukte op de gratis Macs van GitHub (gezien op 17-11-2026, drie keer achter elkaar). Niets aan de app: in de run rechtsboven **Re-run jobs → Re-run failed jobs**, of later opnieuw starten |
