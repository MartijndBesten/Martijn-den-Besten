# Bijbelreis als app: installeren, offline en updates (17-11-2026)

De Bijbelreis (https://bijbelreis.nl) is een installeerbare webapp. Op een telefoon of tablet kun je hem op het
beginscherm zetten (Android/Chrome: ‘App installeren’; iPhone/iPad: Deel → ‘Zet op beginscherm’). Hij opent dan als
‘Bijbelreis’, zonder adresbalk. Wat je eerder hebt bekeken, werkt ook zonder internet. Een nieuwe versie komt in één keer
binnen en wordt nooit gemengd met de oude.

## 1. Bestanden

| Bestand | Wat |
| --- | --- |
| `public/bijbelreis/manifest.webmanifest` | naam ‘Op reis door de Bijbel’, korte naam ‘Bijbelreis’, `nl`, `start_url` en `scope` `/`, `display: standalone`, kleuren uit `bijbelreis.css` (`--papier` #f5f0e5 als achtergrond, `--nacht` #243d70 als themakleur, gelijk aan `meta theme-color`) |
| `public/bijbelreis/icoon-192.png`, `icoon-512.png` | pictogram ‘any’: de afgeronde tegel en kameel van `favicon.svg`, met de kameel in het midden |
| `public/bijbelreis/icoon-maskable-192.png`, `icoon-maskable-512.png` | pictogram ‘maskable’: volle tegel, kameel op 66 % zodat hij binnen de veilige cirkel (80 %) valt |
| `scripts/bijbelreis-iconen.mjs` | maakt die vier PNG's met sharp uit `favicon.svg` (alleen opnieuw draaien als het beeldmerk verandert) |
| `public/bijbelreis-sw.js` | de service worker (sjabloon; het blok `BOUW` wordt bij de build ingevuld) |
| `public/bijbelreis/pwa.js` | meldt de service worker aan, toont de meldingen ‘nieuwe versie’ en ‘geen internet’ |
| `scripts/bijbelreis-pwa.mjs` | na de build: inhoudshashes (`?v=`), versienummer en de lijst bestanden in de service worker (`postbuild.mjs` roept het aan) |
| `e2e/bijbelreis-pwa.spec.ts`, `tests/bijbelreis-pwa.test.ts` | de tests (zie §6) |

In `bijbelreis.html` staan erbij: `link rel="manifest"`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`,
`apple-mobile-web-app-title` (‘Bijbelreis’) en `apple-mobile-web-app-status-bar-style` = `black-translucent`. De bestaande
`apple-touch-icon.png` (180 px) bleef zoals hij was.

**Scope.** De atlas staat op `/` van bijbelreis.nl; de service worker staat daarom in de root (`/bijbelreis-sw.js`) en
heeft scope `/`. Lokaal en in de tests staat de atlas op `/bijbelreis`; `pwa.js` geeft dat adres mee
(`/bijbelreis-sw.js?schil=/bijbelreis`). Op martijndenbesten.com staat alleen de verhuispagina: die laadt `pwa.js` niet en
meldt geen service worker aan. Het **boekje** (`/bijbelreis/boekje`) hoort niet bij de app: het wordt niet vooraf bewaard
en laadt `pwa.js` niet. Het valt wel binnen de scope: zonder internet krijg je een eigen, rustige pagina (‘Even geen
internet’, met een link naar de atlas) in plaats van de foutpagina van de browser.

## 2. Hoe de versie werkt

1. `npm run build` → `scripts/postbuild.mjs` → `scripts/bijbelreis-pwa.mjs`:
   - elk eigen script en stijlbestand in `bijbelreis.html` en `boekje.html` krijgt `?v=<sha256, 10 tekens>`;
   - de gegevens die scripts zelf ophalen (geo/toen/reliëf/grenzen en nu ook `niveaus/a|b|c.js`) krijgen hun hash in de
     meta-tag `bijbelreis-data`. `niveaus.js` zet die hash nu ook achter het adres (dat was nog het enige eigen bestand
     zonder versie);
   - de **schil** = de pagina + alle bestanden met `?v=` + de lettertypen uit de stijlen + favicon en manifest
     (nu 78 bestanden, ca. 4,5 MB onverpakt; over het netwerk gecomprimeerd een stuk minder). Uit die lijst en de pagina
     volgt één **versie** (12 tekens), die in `<meta name="bijbelreis-versie">` en in de service worker komt.
2. De browser vergelijkt `bijbelreis-sw.js` bij elk bezoek byte voor byte. Een nieuwe build = een ander bestand = update.
   De Worker serveert het met `Cache-Control: public, max-age=0, must-revalidate` (`worker/bijbelreis-app.ts`).
3. **Installeren is alles of niets.** De nieuwe service worker haalt de hele schil op (`cache: no-cache`, zes tegelijk),
   controleert van elk bestand de SHA-256 tegen de hash in de lijst, en van de pagina het versienummer in de meta-tag.
   Pas als alles klopt, zet hij de set in de cache `bijbelreis-schil-<versie>`. Mislukt er één (netwerk, of tijdens een
   uitrol al een nieuwere versie op de server), dan wordt de half gevulde cache weggegooid en blijft de oude versie in
   gebruik; de browser probeert het bij een volgend bezoek opnieuw.
4. **Wisselen.** De nieuwe versie wacht. De app toont onderin (telefoon: onder de kop) ‘Er is een nieuwe versie van de
   Bijbelreis.’ met **Vernieuwen**. Tikken → de nieuwe versie neemt het over, oude schillen worden verwijderd, de pagina
   laadt opnieuw op dezelfde plek (adres en voortgang blijven). Wie niet tikt, krijgt de nieuwe versie vanzelf zodra
   alle vensters van de Bijbelreis dicht zijn geweest. Staat de app lang open, dan kijkt hij bij terugkomen in beeld
   (hooguit eens per half uur) of er iets nieuws is.
5. **Nooit mengen.** Een verzoek met `?v=<hash>` dat niet in de schil staat (bijv. een nieuwere pagina van het netwerk, of
   een ander tabblad dat nog op de oude versie draait) gaat naar het netwerk, en het antwoord wordt alleen doorgegeven als
   de inhoud bij de hash past; anders volgt een 503. Een oud script met nieuwe inhoud (of andersom) kan dus niet.
6. De **pagina zelf**: eerst het netwerk (zo zie je online altijd de nieuwste versie); geen antwoord binnen 6 seconden of
   geen verbinding → de bewaarde pagina uit de schil, die alleen naar bestanden uit diezelfde schil verwijst.

## 3. Wat wel en niet offline werkt

| Werkt offline | Werkt niet offline |
| --- | --- |
| de hele atlas: alle 150 geschiedenissen, alle reizen, Wie is wie, Tijdlijn, Speurtocht, Paspoort, alle drie de niveaus | foto's die nog niet eerder bekeken zijn: in plaats van een leeg vlak staat er ‘Deze foto kun je zien als je weer internet hebt.’ (komt het internet terug, dan laadt de foto alsnog) |
| de kaart: ondergrond, landschap van toen, reliëf, grenzen (staan allemaal in de schil) | het aanvraagformulier: ‘Je bent nu niet verbonden met internet. Versturen kan nu niet. Je tekst blijft staan: probeer het straks nog eens.’ |
| foto's (en andere afbeeldingen onder `/bijbelreis/`) die al eens bekeken zijn: bewaard in `bijbelreis-beelden`, hooguit 160 stuks (alle 116 fotobestanden passen erin, ca. 2,4 MB); de oudste gaan eruit | de bezoekmeting: die verstuurt dan niets en zegt niets (de meting is nooit belangrijker dan de site) |
| de voortgang (stempels, gelezen verhalen): staat in `localStorage` `bijbelreis:*`, los van de service worker | het boekje en de presentatie (`/bijbelreis/boekje`): rustige pagina ‘Even geen internet’ |

Bij het offline gaan meldt de app kort (10 seconden, of tot je hem sluit): ‘Je hebt nu geen internet. Wat je eerder
hebt bekeken, kun je gewoon gebruiken.’

**Nooit bewaard:** `/api/*` (bezoekmeting, aanvragen), `/beheer`, verzoeken die geen GET zijn, en alles van een andere
site. De service worker roept voor die verzoeken `respondWith` niet aan; ze gaan rechtstreeks naar het netwerk. Een
afbeelding wordt bewaard onder haar adres plus de hash uit de build (`?h=`): een vervangen foto komt dus nooit uit de
oude bewaarplaats, en bij een nieuwe versie gaan bewaarde foto's die niet meer bestaan of veranderd zijn eruit.

**Opslag vasthouden.** `pwa.js` vraagt `navigator.storage.persist()` alleen in de geïnstalleerde app (display-mode
standalone) en niet in Firefox. Chrome laat nooit een vraag zien (toekennen gaat op gebruik/installatie). Firefox toont
wél een toestemmingsvraag; die zou kinderen verwarren, daarom daar niet. Safari laat geen vraag zien; volgens WebKit
(‘Updates to Storage Policy’, Safari 17) wordt persistentie toegekend op grond van o.a. ‘geopend als app op het
beginscherm’, maar er zijn meldingen dat `persist()` in Safari altijd `false` geeft. Belangrijker voor iOS: een app op het
beginscherm valt niet onder Safari's opruimregel van 7 dagen voor sitegegevens. Niet op een echt toestel gecontroleerd.

## 4. Beveiliging en caching

- De CSP blijft `default-src 'self'`; `worker-src` en `manifest-src` vallen daarop terug (eigen bestanden). Er is niets
  aan de CSP of de andere koppen veranderd. De service worker krijgt dezelfde koppen als elk ander bestand (`/*`).
- De bewaarde pagina is het antwoord van de server, mét CSP en X-Frame-Options. De zelfgemaakte pagina ‘Even geen
  internet’ heeft een eigen strenge CSP (`default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'`).
- Cachekoppen van de Worker zijn ongewijzigd: de pagina `public, max-age=0, must-revalidate` met ETag, `/bijbelreis/*`
  `max-age=3600, stale-while-revalidate=86400`, `/fonts/*` immutable. Alleen een route is erbij: `/bijbelreis-sw.js`
  (gewone ETag + `max-age=0, must-revalidate`). `scripts/embed-assets.mjs` neemt dat bestand mee in de Worker van
  bijbelreis.nl.

## 5. Een update testen

Automatisch: `e2e/bijbelreis-pwa.spec.ts`, test ‘een nieuwe versie …’. Die kopieert `dist/client` naar een tijdelijke
map, start er een klein servertje op, opent de atlas, verandert dan één bestand (`indeling.js`) en draait
`node scripts/bijbelreis-pwa.mjs <map>` (dezelfde stap als de build). Hij controleert: de melding verschijnt; de nieuwe
schil is compleet vóór de wissel; na Vernieuwen staat alleen de nieuwe schil er en komt elk geladen script/stijl/
gegevensbestand daaruit; het oude adres geeft geen nieuwe inhoud (503); de `bijbelreis:*`-sleutels zijn gelijk; offline
opent de nieuwe versie.

Met de hand (lokaal):

```sh
npm run build && npx vite preview --port 8901 --strictPort
# open http://localhost:8901/bijbelreis, kijk in DevTools → Application → Service workers / Cache storage
# wijzig iets in dist/client/bijbelreis/indeling.js en draai:
node scripts/bijbelreis-pwa.mjs dist/client
# herstart vite preview (die onthoudt de bestandslijst), en laad de atlas: de melding ‘Er is een nieuwe versie’ verschijnt
```

Na een uitrol op bijbelreis.nl: open de site in een venster waar hij al eerder openstond → de melding verschijnt (of
DevTools → Application → Service workers → ‘Update’). Offline testen: DevTools → Network → Offline, pagina vernieuwen.

## 6. Tests

- `e2e/bijbelreis-pwa.spec.ts` (project desktop, plus de telefoonmaat in project mobiel): manifest geldig en gekoppeld,
  pictogrammen echte PNG's van de juiste maat, Chromium meldt geen manifestfouten en geen installatiebezwaren
  (`Page.getAppManifest`, `Page.getInstallabilityErrors`); service worker met scope `/`; schil compleet, nooit `/api`;
  offline: geschiedenis 26 met kaart en reliëf, de eerder bekeken foto van geschiedenis 76, de zin bij een niet bekeken
  foto, het aanvraagformulier, het boekje; de update (§5); veilige zones (§7). Alleen tegen een lokale server
  (productie draait de atlas op bijbelreis.nl, niet op de testserver).
- `playwright.config.ts`: `serviceWorkers: "block"` voor alle andere specs (een service worker zou daar `page.route`
  omzeilen); de pwa-spec zet ze aan.
- `tests/bijbelreis-pwa.test.ts`: de route `/bijbelreis-sw.js` op de Worker (koppen, 304, alleen GET/HEAD) en de
  versieberekening (hashes, idempotent, één gewijzigd bestand → nieuwe versie).

## 7. Veilige zones (iPhone/iPad als app)

Met `black-translucent` ligt de statusbalk over de kop; de kop is donkerblauw, dus de witte statusbalktekst blijft goed
leesbaar en de kop loopt door tot de rand. Daarvoor moet alles wat aan de rand ligt `env(safe-area-inset-*)` optellen
(`viewport-fit=cover` stond er al).

Gemeten met Playwright door de stijlen te laden met vaste waarden voor `env(safe-area-inset-*)` (een echte inzet is in
Chromium niet na te bootsen):

| | vóór | na |
| --- | --- | --- |
| telefoon 390×844, boven 47 / onder 34 | kop, onderbalk, blad en Verder al goed; **niveaukeuze begon 41 px te hoog, over de kop** (top 50, kop tot 91) | niveaukeuze onder de kop (top 97) |
| iPad liggend 1180×820, boven 24 / onder 20 | **titel en tabbladen onder de statusbalk** (top 4 / 0); **Vorige/Verder in de thuisbalk** (onder 806 > 800) | kop begint op 24; Vorige/Verder eindigt op 786 |

Aangepast in `bijbelreis.css`: op brede schermen (> 900 px) telt de kop de bovenste inzet op (hoogte blijft 64 px plus
inzet), en de kaartknoppen onderin en het reisboek de onderste; de niveaukeuze telt overal de bovenste inzet op. In een
gewone browser zijn de inzetten 0 en verandert er niets (de visuele snapshots blijven gelijk).

**Niet getest op een echte iPhone of iPad** (geen toestel beschikbaar): de echte statusbalkhoogte, het gedrag van
`black-translucent` in iOS 18/26, het opstartscherm en of Safari `persist()` toekent. Ook niet op een echt
Android-toestel; Chromium op de computer meldt geen installatiebezwaren.

## 8. Risico's en aandachtspunten

- **Eerste bezoek kost wat extra data**: na het laden haalt de service worker de schil op. Wat de pagina al geladen had,
  is dan een korte controle (304); nieuw zijn vooral de twee niveaus die je niet gebruikt (ca. 0,7 MB onverpakt).
- **Een uitrol halverwege**: past een bestand niet bij de lijst, dan installeert de nieuwe versie niet en blijft de oude
  werken; bij een volgend bezoek gaat het goed. Een stuk HTML dat Cloudflare zelf aanpast (zoals Web Analytics) maakt
  niets uit: van de pagina wordt alleen het versienummer gecontroleerd, niet de hash.
- **Een fout in de service worker zelf** kan bezoekers op een oude versie houden. Noodrem: een nieuwe build met een
  service worker die zichzelf afmeldt (`self.registration.unregister()` in `activate`) en de caches leegt; die komt
  binnen omdat het bestand altijd opnieuw wordt gecontroleerd. Een `wrangler rollback` alleen helpt niet als de oude
  service worker het probleem is.
- **Opslag kan door de browser worden opgeruimd** (vooral zonder installatie). Dan haalt de service worker alles weer
  van het netwerk, met dezelfde hashcontrole; offline werkt het dan pas na een nieuw bezoek. De voortgang staat in
  `localStorage` en hangt daar niet van af.
- **Lokaal (vite preview, `wrangler dev`) heeft de service worker scope `/`** en dus ook de pagina's van
  martijndenbesten.com op localhost; hij laat alles buiten de Bijbelreis met rust (geen `respondWith`). Wie lokaal de
  hoofdsite test na de atlas, kan in DevTools de service worker afmelden.
- **Nieuwe bestanden die de atlas zelf ophaalt** moeten een hash krijgen: zet ze in `DATA` in `scripts/bijbelreis-pwa.mjs`
  en lees de hash uit de meta-tag (zoals `dataUrl` in `app.js`). Anders staan ze niet in de schil en werken ze niet offline.
