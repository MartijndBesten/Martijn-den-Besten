# Bijbelreis: toegankelijkheid, WCAG 2.2 AA (17 november 2026)

Gemeten op de build van `main` (57e32c6) met Playwright/Chromium, telefoon 390×664 (aanraking) en desktop 1440×900,
met en zonder ‘minder beweging’. Scripts en schermafbeeldingen staan in de scratchmap van de sessie, niet in git.

## 1. Wat gemeten is

| Controle | Hoe | Uitkomst vóór | Na |
|---|---|---|---|
| axe (wcag2a/aa, 21a/aa, 22aa) | Start, Verhalen, geschiedenis 26, reisstap, Wie is wie, Tijdlijn, Speurtocht, Paspoort, alle laden (niveau, legenda, boekenkast, reizen, plaatsen, Vandaag, keuzeblad, aanvraag, Bijbeltekst, Hoe ver?), niveau Samen en Verder, boekje | 3 soorten fouten (zie §2 en §3) | boekenkast opgelost; de rest doorgegeven |
| Toetsenbord: Tab door elk scherm (60–120 keer) | focus zichtbaar? element (deels) in beeld? niet helemaal onder een vaste balk? | telefoon: in een geschiedenis vielen 8 knoppen met focus helemaal onder de onderbalk of de kop (2.4.11) | 0 |
| Tabbladen | pijltjes, Home, End | pijltjes goed; Home/End deden niets | Home/End werken |
| Speurtocht met alleen toetsenbord | starten, vragen beantwoorden | kaartvraag niet te doen; focus kwijt na ‘Start’ | doorgegeven (§3) |
| Landmarks en koppen | axe best-practice, koppenlijst | geen `<main>`; koppen h1 → h2 → h3 in orde | het reisboek is `<main>` |
| Kleurcontrast | axe, alle schermen | boekenkast 2,7:1; paspoort 2,5:1 | boekenkast ≥ 4,5:1; paspoort doorgegeven |
| Donkere modus | — | de atlas heeft geen donkere modus (alleen het licht thema ‘ivoor’); de nieuwe verhaalpagina’s volgen `prefers-color-scheme` en zijn in beide getest | — |
| Reflow 320 px (1.4.10) | alle tabbladen en twee geschiedenissen op 320×640 en op 640×450 (= 200 % zoom op 1280) | geen horizontaal scrollen | idem |
| Tekst 200 % (1.4.4) | browserzoom 200 % (zie reflow) in orde. Extra, strenger: alleen de lettergrootte ×2 op 390 px | zoom: in orde. Alleen-tekst ×2: de onderbalk en de paspoorttellers lopen buiten beeld | doorgegeven (§3), geen WCAG-fout |
| Minder beweging | `document.getAnimations()` na 2,5 s bij reisstappen met tafereel, kerst, start | geen lopende animaties (zonder de instelling loopt de kameel wel: de controle werkt) | idem |

## 2. Opgelost in deze ronde

- **Focus niet verborgen (2.4.11), telefoon.** `html { scroll-padding-top/bottom }` in het telefoonblok van
  `bijbelreis.css`: bij Tab schuift de browser een element nu vrij van de vaste kop en de onderbalk. (De bestaande
  `scroll-margin-top` van `#wieInfo` is verlaagd zodat die net zo ver schuift als voorheen.)
- **Tabbladen:** Home en End gaan naar het eerste en het laatste onderdeel (`app.js`, toetsafhandeling van `.tabs`).
- **Eén hoofdgebied:** het reisboek is `<main>` in plaats van `<aside>`; de link ‘Direct naar het reisboek’ wijst ernaar.
- **Contrast boekenkast (1.4.3):** boeken die nog niet zijn uitgewerkt (`.kb.off`) waren met `opacity: .65` 2,7:1; nu
  zonder doorzichtigheid, met gestippelde rand en zachtere tekstkleur (≥ 4,5:1).
- `e2e/a11y.spec.ts` controleert nu alle hoofdschermen van de Bijbelreis op telefoon en desktop met WCAG 2.2 AA, en
  heeft een toetsenbordtest (tabbladen, één `main`, geen focus onder de vaste balken). Bekende fouten van andere
  onderdelen staan er als uitzondering in, met uitleg; haal ze weg als ze zijn opgelost.

## 3. Gevonden, niet opgelost (ander werkgebied)

| # | Scherm | Selector | WCAG | Wat | Voorstel |
|---|---|---|---|---|---|
| R1 | Reis, telefoon, stapblad | `#kiesBtn`, en in het keuzeblad `#kiesLade button[data-ks]` (11×) | 2.5.3 Label in naam (A) | De zichtbare tekst (‘Genesis › Abraham 2 van 25’) staat niet in de toegankelijke naam (‘Kies een reis. Nu: Genesis, Abraham, stap 2 van 25’). Spraakbediening (‘tik Abraham’) vindt de knop niet. | Laat de `aria-label` beginnen met de zichtbare tekst, of laat hem weg en zet ‘Kies een reis’ als visueel verborgen tekst achteraan. |
| R2 | Reis, telefoon en desktop | `.leaflet-marker-icon.pl` (alle plaatsen) | 2.4.11 Focus niet verborgen (AA) / 2.4.7 | Met Tab krijgen ook plaatsen buiten het zichtbare deel van de kaart focus, of plaatsen onder `#mapbar` / `#dichtbijBtn` (telefoon) of onder het reisboek (desktop). Op de telefoon zijn het ±17 tabstops vóór het stapblad. | Bij `focus` op een plaats `map.panInside(latlng, { padding })`; of alleen plaatsen binnen het beeld in de tabvolgorde. |
| L1 | Speurtocht, kaartvraag | `#p-quiz .tapcall` (‘Tik op de kaart’) | 2.1.1 Toetsenbord (A) | Een kaartvraag kan alleen met muis of vinger. Met het toetsenbord loopt de speurtocht vast bij de eerste kaartvraag. | Een alternatief: keuzelijst van plaatsen, of de plaatsen als knoppen (zonder naam te verraden: bijv. ‘plaats 1–5’ in de omgeving). |
| L2 | Speurtocht en vragen bij een geschiedenis | na ‘Start de speurtocht’ / ‘Begin met de vragen’ | 2.4.3 Focusvolgorde (A) | De knop verdwijnt en de focus valt terug op `<body>`; met Tab begin je weer bovenaan de pagina. | Focus op de vraag zetten (`.qtext` met `tabindex="-1"`). |
| L3 | Speurtocht (`#qRes`) en vragen bij een geschiedenis (`#vQuiz .res`) | feedback ‘Goed zo!’ / ‘Helaas.’ | 4.1.3 Statusberichten (AA) | Geen `role="status"`/`aria-live`. Bij meerkeuze gaat de focus naar ‘Volgende vraag’, zodat een schermlezer de uitslag overslaat. | `role="status"` op de feedbackhouder. |
| L4 | Paspoort | `#stamps .pas-sub > .label` (deel met kleur ‘oker’) | 1.4.3 Contrast (AA) | `color(d.c)` in `app.js` geeft `var(--oker-deep, var(--oker))`; `--oker-deep` bestaat niet (het token heet `--oker-diep`), dus 2,5:1. | Het token `--oker-deep` toevoegen (dan worden ook oker-routes op de kaart donkerder: afstemmen met spoor Reis), of in het paspoort een tekstkleur met genoeg contrast. |
| L5 | Paspoort, telefoon | `#stamps .stamp.no` | 2.5.3 Label in naam (A) | Tekst in het stempel staat niet in de `aria-label`. | Zichtbare tekst in de naam opnemen, of `aria-hidden` op de tekst in het SVG. |
| A1 | Onderbalk en paspoorttellers | `nav.tabs`, `#pasStats` | geen WCAG-fout | Alleen bij een tweemaal grotere lettergrootte zonder zoom (Android ‘tekstgrootte’) lopen ze buiten beeld op 320–390 px. | Later bekijken: tablabels laten afbreken of verkleinen bij grote tekst. |

## 4. Niet gecontroleerd

- Geen echte schermlezer (VoiceOver/TalkBack/NVDA); alleen de semantiek via axe en de toegankelijkheidsboom.
- Geen echte iPhone; iOS-tekstgrootte (Dynamic Type) heeft op deze site geen invloed (geen `-apple-system-body`).
- De kaart zelf (Leaflet) is grotendeels visueel; de reisstappen en plaatsen zijn ook als tekst en lijst te bereiken.
