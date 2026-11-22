# Bijbelreis (`/bijbelreis`)

Interactieve kaart voor kinderen (ca. 8–12 jaar) over het Oude Testament. Een statische pagina naast de React-site: `public/bijbelreis.html` + `public/bijbelreis/`. Geen framework, geen CDN (de CSP van de site staat alleen eigen bestanden toe), lettertypen uit `/fonts/`.

| Bestand | Inhoud |
| --- | --- |
| `public/bijbelreis.html` | de pagina (kaart links, reisboek rechts; op een telefoon een eigen opzet, zie `docs/bijbelreis-audit/telefoon.md`) |
| `public/bijbelreis/app.js` | de engine: kaart (Leaflet), reisboek, Wie is wie, speurtocht, Hoe ver?, paspoort, Bijbeltekst-lade |
| `public/bijbelreis/bijbelreis.css` | stijl, met de kleur- en lettertokens van de site; donkere uiterlijken via `data-theme` |
| `public/bijbelreis/plaatsen.js` | alle plaatsen (`BR.plaatsen`), tussenpunten (`BR.W`) en kleuren per persoon (`BR.personen`) |
| `public/bijbelreis/inhoud/<boek>.js` | de inhoud per bijbelboek (`BR.boeken.push({...})`); één bestand per boek, in volgorde geladen in de HTML |
| `public/bijbelreis/geo.json` | ondergrond: land, meren, rivieren, woestijnen/gebergten, inzetkaartje en de vorm van Nederland (Natural Earth, publiek domein) |
| `public/bijbelreis/bijbel/<boek>.json` | Statenvertaling per boek (publiek domein) voor ‘Lees het zelf in de Bijbel’ |
| `public/bijbelreis/leaflet.js`, `leaflet.css`, `LICENSE-leaflet.txt` | Leaflet 1.9.4 (BSD-2), lokaal |
| `public/bijbelreis/pwa.js`, `public/bijbelreis-sw.js`, `public/bijbelreis/manifest.webmanifest` | installeerbare app en offline gebruik: service worker met één vaste set bestanden per build (`scripts/bijbelreis-pwa.mjs`), zie `docs/bijbelreis-pwa/README.md` |

## Regels voor de inhoud

- **Doelgroep:** kinderen van 8–12 en hun ouders, reformatorisch en breder protestants-christelijk. Eerbiedig over God en de Bijbel; geen grapjes over de inhoud van de Bijbel. Korte zinnen, concrete beelden, geen moeilijke woorden zonder uitleg.
- **Namen** volgens de Herziene Statenvertaling: Izak, Rebekka, Ezau, Jozef, Mozes, Aäron, Jozua, Richteren, Samuël, Saul, David, Salomo, Elia, Elisa; plaatsen: Bethlehem, Berseba, Sichem, Sukkoth, Pniël, Kades-Barnea, Jericho, Silo, Gilgal, Hebron. Godsnaam: ‘de HEERE’ in citaten, verder ‘God’.
- **Alles controleerbaar.** Elke stap heeft een `ref` (bijv. `"Exodus 14:21–31"`). Getallen, leeftijden, aantallen en citaten moeten in de Statenvertaling staan: controleer ze met het verifyscript (zie onder) vóór je ze opschrijft. Niets verzinnen alsof het in de Bijbel staat; achtergrondweetjes (‘Wist je dat?’) mogen over archeologie, aardrijkskunde of een ander Bijbelvers gaan, maar niet over legendes.
- **De Bijbel bepaalt wat er verteld wordt.** Het is Gods Woord: vertel de geschiedenissen zoals ze in de Bijbel staan, ook de ernstige (zonde, straf, oorlog, dood), in woorden die een kind begrijpt. Niets weglaten of afzwakken omdat het ‘gevoelig’ zou zijn; wel zonder eigen uitweidingen die niet in de tekst staan.
- **Routes:** de Bijbel noemt plaatsen, geen wegen. Gebruik `recon: 1` als de Bijbel alleen begin en eind noemt. Volg bekende wegen (kustweg, bergrug, Koningsweg ten oosten van de Jordaan, Eufraatroute).
- **Plaatsen:** `c` eerlijk invullen (zie Schema 2.0). Coördinaten op de bekende tell of de gangbare identificatie; bij twijfel `w`, `b` of `o` en dat in `d` uitleggen.

## Schema van een boek

```js
BR.boeken.push({
  id: "exodus", n: "Exodus", tijd: "ca. 1450 v.Chr.", kleur: "boter",
  intro: "Eén zin voor de boekknop.",
  wie: [{ n: "Mozes", rol: "leider", i: "Twee of drie zinnen.", deel: "mozes" }],   // ‘Wie is wie’ (Genesis heeft een stamboom)
  delen: [ DEEL, DEEL ],
  ordAlles: [{ q: "…", items: ["eerst", "dan", "daarna", "laatst"] }],              // optioneel, voor de speurtocht ‘alles’
});
```

Een **deel** (één hoofdpersoon of één verhaallijn, 6–15 stappen):

```js
{ id: "mozes", n: "Mozes", short: "Mozes", ref: "Exodus 1–18", c: "boter", init: "M",
  intro: "Drie tot vijf zinnen.", who: [["Mozes", "120"], ["Aäron", "123"]],
  stat: "Eén weetje met een getal.", cross: [["Hebreeën 11:24–29", "Wat daar over Mozes staat."]],
  ctx: ["memfis"],                       // plaatsen die altijd zichtbaar zijn als context (ids uit BR.plaatsen)
  steps: [ STAP, STAP ],
  quiz: { tap: [{ id: "sinai", q: "Tik op de berg Sinaï.", v: "wide" | "kanaan" | [[zuid, west], [noord, oost]], name?: "…", loose?: 1 }],
          mc: [{ q: "…", a: ["GOED", "fout", "fout"], why: "Exodus 3:2" }],
          ord: [{ q: "…", items: ["eerst", "dan", "daarna", "laatst"] }] },     // ca. 3 tap, 6–8 mc, 1 ord
  trips: [{ n: "Ramses → Sinaï", s: 4 }, { n: "Alles wat Mozes reisde", s: "alles" }],  // s = stapindex, r = routeindex (optioneel)
  bij: "abraham",                        // optioneel: verdiepend deel; id van het hoofddeel in hetzelfde boek (zie onder)
}
```

**Verdiepende delen** (`bij`). Een deel dat een stuk van een ander deel van dichtbij volgt (zoals `ur-kanaan` bij
`abraham`, `kies-het-leven` bij `moab`), krijgt `bij: "<id van het hoofddeel>"`. Het heeft dan geen eigen knop in de
delenrij; in de intro van het hoofddeel en bij de stappen van het hoofddeel over hetzelfde Bijbelgedeelte (de ene
verwijzing valt binnen de andere) staat de ingang ‘Van dichtbij’. Het kruimelpad loopt via het hoofddeel, er is een knop
‘Terug naar …’, en na de laatste stap gaat ‘Verder’ naar de stap van het hoofddeel ná dat gedeelte (of naar de intro).
In Alle reizen, Hoe ver?, de tijdlijn, de speurtocht en het paspoort staat het direct onder het hoofddeel; in ‘Kies een
reis’ (telefoon) als eigen, gestippelde regel ‘Van dichtbij’ direct na de stappen over hetzelfde gedeelte. Diepe links
(`#ur-kanaan/5`) en stapsleutels (`genesis:ur-kanaan:4`) blijven die van het deel zelf.

Een **stap**:

```js
{ ref: "Exodus 14", t: "Door de zee", stamp: "Zee", at: ["pihachiroth"], zoom: 8,   // at: plaatsen die oplichten; zoom bij één plek
  r: [{ p: ["ramses", "sukkoth-eg", "etham", "pihachiroth"], recon: 1, w: "boter" }], // routes: ids uit BR.plaatsen/BR.W of [lat, lng]; w = kleur (standaard de kleur van het deel)
  who: [["Mozes", "80"], ["Volk", "600.000 mannen"]],
  txt: "Vier tot zes zinnen, in eigen woorden.", fact: "Wist je dat? Eén weetje.",
  // optioneel: rays4: "plaatsid" (vier windrichtingen) · look: ["van", "naar", "tekst"] (kijklijn) · later: { p: [...], lab: "…" } (stippellijn naar later)
  // optioneel: onthul: { titel, items: [["kop", "tekst"]] } · vergelijk: { titel, rijen: [["naam", getal, "label"]], noot } · sterren: 1
}
```

Kleuren (`c`/`w`): `kobalt`, `terra`, `lila`, `koraal`, `salie`, `boter`, `rood` (vijanden/legers), `bruin`, `olijf`, `teal`, `grijs`. Groepen zoals `Volk`, `Leger`, `Soldaten`, `Spionnen`, `Priesters`, `Profeten`, `Vijanden` krijgen in `who` een aantal als tweede waarde (`["Volk", "600.000 mannen"]`).

## Schema 2.0 (aanvullingen, oktober 2026)

**Plaatsen** (`plaatsen.js`, sinds 2.0 staan *alle* plaatsen daar; inhoudsbestanden definiëren geen plaatsen meer):

```js
dothan: { n: "Dothan", ll: [32.43, 35.2], c: "v", s: "l", z: 7, t: "stad", d: "Uitleg voor kinderen.",
  nu: "Tell Dothan (Westelijke Jordaanoever)",   // moderne naam/ligging, alleen voor de stand ‘Nu’
  bron: "Tell Dothan; identificatie algemeen aanvaard.",   // korte verantwoording van de ligging (niet voor kinderen)
  alt: [[29.0, 34.0, "Alternatief: …"]],         // alleen bij c: "b": andere serieuze kandidaten
}
```

Zekerheid `c` (legenda in drie groepen):

| `c` | betekenis | op de kaart | legenda |
| --- | --- | --- | --- |
| `v` | identificeerbaar: naam bleef in gebruik of de tell is algemeen aanvaard | volle stip | Identificeerbaar |
| `w` | waarschijnlijk: gangbare identificatie, maar niet zeker | stip met witte kern | Waarschijnlijk of betwist |
| `b` | betwist: meerdere serieuze kandidaten (`alt`) | stip met witte kern + kandidaten als kleine ringen | Waarschijnlijk of betwist |
| `o` | onbekend: alleen de streek is bekend; het punt is illustratief | vage cirkel met ‘?’ | Onbekend |
| `r` | gebied/streek/gebergte: geen punt | zachte vlek met naam | (gebied) |

Eden en Ararat zijn nooit een exacte plek (`o` resp. `r`).

**Deel** — tijd en chronologie:

```js
tijd: "ca. 1446 v.Chr.",         // korte tekst; bij Genesis 1–11: null
tl: [-1446, -1406],              // begin/eind als getal (negatief = v.Chr.) voor de tijdlijn; null = geen datering
tijdNoot: "Reconstructie: …",    // hoe de datum berekend is en dat het een reconstructie is
```

**Stap** — soort weetje: `fs: "b"` (uit een ander Bijbelgedeelte, met verwijzing), `"u"` (uitleg van woord, gewoonte of
achtergrond), `"h"` (historische/archeologische achtergrond of reconstructie, niet uit de Bijbel). `txt` bevat alleen wat
de Bijbel vertelt (in eigen woorden, met `ref`); uitleg en reconstructie horen in `fact`.

**Personen** (`personen.js`, `BR.mensen`): één centrale lijst die personen, plaatsen, gebeurtenissen en
Bijbelverwijzingen koppelt.

```js
jozef: { n: "Jozef", alias: ["Zafnath-Paneah"], v: "jakob", m: "rachel", p: ["asnath"], boek: ["genesis", "exodus"],
  kort: "Zoon van Jakob en Rachel; onderkoning van Egypte.", geb: "Genesis 30:22–24", dood: "Genesis 50:26",
  leeftijd: [[17, "Genesis 37:2"], [30, "Genesis 41:46"], [110, "Genesis 50:26"]],
  elders: [["Psalm 105:17–22", "…"], ["Handelingen 7:9–16", "…"], ["Hebreeën 11:22", "…"]],
  vervolg: [["Exodus 13:19", "Mozes neemt de beenderen van Jozef mee."], ["Jozua 24:32", "Begraven in Sichem."]] }
```

`v`/`m` (vader/moeder) en `p` (vrouwen/man) zijn ids; kinderen worden daaruit berekend. Namen in `who` van een stap
worden gekoppeld via `n` of `alias`, alleen binnen de boeken in `boek` (zo blijven ‘Darius’ of ‘Joas’ eenduidig).
Groepen (Volk, Leger, Broers) staan niet in `BR.mensen`.
Een partner die ook broer of zus is, staat één keer in de familie, bij ‘Getrouwd met’, met de uitleg uit het veld `ook`
(`ook: { sara: ["ook zijn halfzuster", "Genesis 20:12", toelichting] }`); alleen Abraham en Sara. Het controlescript
(`scripts/bijbelreis-personen-check.mjs`) eist dit veld bij elk zo’n paar.

**Stapsleutels** (`boek:deel:index`) zijn de sleutels van de voortgang in `localStorage` (`bijbelreis:gezien`). Stappen
dus nooit herordenen, invoegen of verwijderen; alleen aan het eind toevoegen.

## De reiziger op de kaart

De kameel (in het Nieuwe Testament een wandelaar) loopt bij elke stap langs de lijn van de route, door alle
tussenpunten (`reis()` in `app.js`, instellingen in `REIS`). Eerst komt de kaart tot rust, dan loopt hij; de lijn groeit
met hem mee. De duur volgt uit de lengte van de lijn **op het scherm**, niet uit de kilometers: per route 400 ms +
4,5 ms per pixel, minstens 0,6 s en hoogstens 5,5 s (op een lange route is dat ruim 200 pixels per seconde), met een
gelijkmatige snelheid en ongeveer 0,35 s versnellen en vertragen. Heeft een stap meer routes, dan loopt hij ze na elkaar.
Het lopen van één stap duurt samen minstens 1 s (een kort stukje flitst niet) en hoogstens 7 s (een lange reis duurt niet
eindeloos); daarbuiten worden alle routes van de stap evenveel vertraagd of versneld. Begint een route niet waar hij staat
(meer dan 3 pixels ervandaan: een andere stap gekozen, terug, of een tweede route die elders begint), dan verdwijnt hij in
0,3 s en verschijnt hij op het nieuwe begin; hij vliegt nooit zichtbaar door de kaart. Hij kijkt in de looprichting en staat aan het eind precies
op de bestemming (het laatste punt van de laatste route, of de eerste plaats van een stap zonder route). Er loopt nooit
meer dan één reis: een nieuwe stap, het overzicht, ‘Laat dit hele deel zien’, een ander deel of een geschiedenis breekt
de lopende of nog wachtende reis af (`animToken`). Bij `prefers-reduced-motion` staat hij meteen op de bestemming en is
de lijn meteen af. De tests staan in `e2e/bijbelreis-kameel.spec.ts`.

## Routes: schijnwerper (21-11-2026)

Keuze van Martijn uit drie proefweergaven ([bijbelreis-audit/routes.md](bijbelreis-audit/routes.md)): **C · Schijnwerper**
is de vaste weergave; de proefschakelaar `?routes=` en de varianten A en B zijn weg (`stapTeken()` en `plaatsHaltes()`
in `app.js`, de regels onder ‘Routes: de schijnwerper’ in `bijbelreis.css`).

- **In een stap:** de rest van de reis grijs en zwak (30 %); de lijn van de stap in de kleur van de reiziger, 5,5 px, met
  een witte rand van 1,75 px aan elke kant en een zachte gloed; bovenop de andere lijnen. Geen pijltjes meer.
- **Haltes:** genummerde bordjes 1, 2, 3 … bij de plaatsen waar de route van de stap langs komt (alleen plaatsen die al op
  de kaart staan; komt de reis twee keer langs, dan één bordje ‘1 · 5’; bij één plaats geen nummer). Een bordje staat
  **naast** het plaatsteken (links, boven, onder of rechts, zo nodig iets verder weg), nooit over een plaatsnaam, een
  plaatsteken, de reiziger, een knop of een ander bordje. Begin en eind krijgen als eerste een plek; het eindnummer staat
  naast de kameel, niet eronder. Past een bordje nergens (Lystre, Derbe en Ikonium op de telefoon), dan blijft het weg tot
  je inzoomt. Ligt de plaats buiten beeld of onder het stapblad, dan geen bordje.
- **Zijroute** (een ander onderweg in een stap waar de reiziger van het deel ook reist, zoals het leger van Farao): 3,2 px,
  zonder gloed, onder de lijn van de stap.
- **Overzicht van een deel (‘Hele reis’) en een geschiedenis:** rustig (`#map.rt-rust`): alle stappen even sterk in hun
  eigen kleur (3,5 px) met een witte rand, zonder gloed en zonder nummers. Het gaat daar om de hele weg, niet om één stap.
- **Kleur:** de lijn gebruikt de donkere variant (`tekstKleur`); daardoor haalt ook oker (de wijzen in het thema Kerst)
  4,8 : 1 of meer tegen de witte rand. De gloed en de kameel houden de gewone kleur.
- **Minder beweging:** op de kaart beweegt dan niets (de reiziger staat meteen op de bestemming).
- Legenda: ‘De stap van nu’, ‘Haltes van de stap, op volgorde’, ‘Grijs: al gereisd’, ‘Dun: een ander onderweg, zoals een
  leger’ en ‘Gestreept: reconstructie’.
- Test: `e2e/bijbelreis-routes.spec.ts` (nummering, geen bordje over een naam of teken, contrast, rustig overzicht; op
  telefoon, tablet en desktop).

## Controleren

- `node --check public/bijbelreis/inhoud/<boek>.js`; open de pagina lokaal (`npx vite preview` of `python3 -m http.server` in `public/`) en kijk in de console: `Bijbelreis: onbekende plaatsen…` betekent een id die niet bestaat.
- Bijbelverwijzingen en getallen: `python3 scripts/bijbel-check.py <controlebestand>` met regels `Exodus 12:37 | zeshonderd duizend` (regex, hoofdletterongevoelig; de Statenvertaling schrijft getallen voluit: ‘vijf en zeventig’, ‘honderd en dertig’).
- Vóór publicatie: `npm run check` (typecheck, tests, build) en `npx playwright test navigatie a11y`.

## Geschiedenissen 151–166 (22 november 2026)

De lijst Verhalen telde 150 geschiedenissen. Reisdelen die later zijn gemaakt, stonden daar niet in. Nu zijn het er 166.
De nieuwe geschiedenissen wijzen naar de stappen van een bestaand reisdeel. Hun bestanden zijn `geschiedenissen/ot-4.js`, `ot-5.js`, `ot-6.js`, `nt-5.js` en `nt-6.js`.

| nr | geschiedenis | reisdeel | na |
| --- | --- | --- | --- |
| 151 | Het land verdeeld en zes vrijsteden | `jozua:stammen` | 41 |
| 152 | Ehud en koning Eglon | `richteren:ehud-jefta` 0–3 | 41 |
| 153 | Jefta, de richter uit Gilead | `richteren:ehud-jefta` 4–9 | 43 |
| 154 | Davids rijk groeit | `2samuel:davids-rijk` | 57 |
| 155 | Asa steunt op de HEERE | `2kronieken:asa` | 62 |
| 156 | Josafat: de strijd is Gods | `2kronieken:josafat` | 63 |
| 157 | Hazaël en Jehu | `2koningen:jehu` | 64 |
| 158 | Manasse: naar Babel en terug | `2kronieken:hizkia-josia` 5 | 67 |
| 159 | Jeremia moet mee naar Egypte | `profeten:jeremia-egypte` | 71 |
| 160 | Ezra en Nehemia: de muur van Jeruzalem | `ezra:nehemia` | 78 |
| 161 | De Samaritaanse vrouw bij de put | `jezus-1:nt-samaria-nain` 0–4 | 93 |
| 162 | De Heere Jezus in de synagoge van Nazareth | `jezus-1:nt-samaria-nain` 5–6 | 93 |
| 163 | De jongeling van Naïn | `jezus-1:nt-samaria-nain` 7 | 96 |
| 164 | De Kananese vrouw en de dove man | `jezus-2:nt-over-de-grens` | 101 |
| 165 | Paulus in Thessalonica, Athene en Korinthe | `handelingen:nt-paulus2` | 145 |
| 166 | Paulus in Efeze en het afscheid in Milete | `handelingen:nt-paulus3` | 145 |

**Geen nieuwe geschiedenis gekregen:**
- `ur-kanaan`, `jakob-jabbok`, `kies-het-leven` en `scheuring`: die staan al in de 150 (8, 17, 36 en 62).
- De kerstdelen: die zijn al geschiedenis 80–86.
- `brieven`: dat is een overzicht, geen geschiedenis.

**Volgorde en secties** staan in `secties.js`:
- Elke geschiedenis hoort bij een sectie via `g.sectie`. De oude nummerreeksen in `app.js`, `boekje.js` en de verhaalpagina's zijn vervallen.
- De volgorde is het nummer. Een geschiedenis met `na: <nr>` staat direct na die geschiedenis. Staan er meer na hetzelfde nummer, dan bepaalt hun eigen nummer de volgorde.
- De nummers zelf blijven vast. Voortgang (`bijbelreis:verhalen`), deellinks (`#v26`), lesroutes en verhaalpagina's veranderen dus niet.
- De OT/NT-filter werkt per sectie: de eerste negen secties zijn het Oude Testament.

**Hoe ze zijn geschreven:** precies zoals de 150. Per batch (30–33, `docs/bijbelreis-niveaus/werk/`):
1. Een schrijver maakt het basisrecord, de indeling, de controle per vers (`scripts/bijbel-controle/{ot-4,ot-5,ot-6,nt-5,nt-6}.txt`) en de niveaus a, b en c.
2. Een aparte redacteur legt alles naast de Statenvertaling.
3. De verslagen staan in `werk/review/batch-30…33.verslag.md`. De redacteuren herstelden samen 29 fouten in de basisrecords en 73 in de niveaus.
4. Alle 48 nieuwe versies staan op `gecontroleerd`. Ook voor deze teksten geldt: geen menselijke eindredactie (zie `docs/bijbelreis-niveaus/README.md`).

**Dateringen:** grond in `dateringen.js` (151–166). Manasse (158) is als reconstructie gedateerd op ca. 697–642 v.Chr. Dat is afgeleid uit de tijdNoot van het reisdeel: Josia sterft ca. 609 v.Chr.; daarbij komen 31 jaar Josia, 2 jaar Amon en 55 jaar Manasse. De wegvoering naar Babel dateert de Bijbel niet.

**Tegelijk hersteld in reisdelen:**
- Richteren 3:18: Ehud ‘geleidde’ de dragers; er stond ‘stuurt weg’.
- Richteren 11:34, 39: ‘trommels’, en letterlijk ‘zij heeft geen man bekend’.
- Handelingen 19:19: ‘toverkunsten’ staat er nu als uitleg.
- Johannes 4:6: het zesde uur heeft nu het voorbehoud dat uitleggers verschillend rekenen.

## Niveaunamen (21-11-2026)

Besluit (Martijn): de drie reisniveaus heten **Voorlezen** (a), **Zelf lezen** (b) en **Verdiepen** (c); eerder Samen
ontdekken (4–6 jaar), Zelf op reis (7–10 jaar) en Verder ontdekken (11+). De leeftijden staan nergens meer in de app,
de website of de App Store-tekst. Reden: de Bijbelreis is voor jong en oud (gezinnen, wie zelf de Bijbel leest,
catechisatie, zondagsschool, club, onderwijs) en mag niet als alleen-kinderapp voelen. De namen zeggen hoe je leest, niet
hoe oud je bent.

- De inhoud van de niveaus is niet veranderd. De codes `a`/`b`/`c`, `localStorage` `bijbelreis:niveau`, de scoresleutels
  en de URL-parameter `niveau=a|b|c` (boekje, lesroutes) blijven gelijk.
- Uitleg per niveau (`NIV.soorten` in `niveaus.js`, zonder veld `leeftijd`): a ‘Korte stukjes om samen te lezen, met
  eenvoudige vragen.’, b ‘Verhalen om zelf te lezen, met de kaart en afwisselende vragen.’, c ‘De volledige vertelling met
  achtergrond, verbanden en verwijzingen.’
- Startkaart: ‘Hoe wil je lezen?’ met de drie namen. Lesroutes: ‘Niveau van de presentatie’ met de drie namen. Boekje:
  ‘Reisniveau: …’. De speurtocht bij Voorlezen heet nog steeds ‘Samen speuren’ (voorlezen doe je samen).
- Engels: Read aloud, Read yourself, Go deeper (`taal/en.js`, `taal/en/inhoud.js`).
- De leeftijden in `docs/bijbelreis-niveaus/schrijfwijzer.md` zijn alleen een schrijfrichtlijn.

## Lichte kop (21 november 2026)

Keuze van Martijn (‘licht, als app’, overal): de kop is papierkleurig met een dunne lijn eronder, de kameel staat in een
donkerblauw tegeltje, de merknaam is **Bijbelreis** (Engels: Bible Journey) en de niveauknop is donkerblauw. Op de
computer krijgen de tabbladen hun eigen kleur in de -diep-tint (contrast op licht). `theme-color` en het manifest zijn
`#f5f0e5`; `apple-mobile-web-app-status-bar-style` is `default` (donkere tekst). In de iOS-app is de statusbalktekst
donker (`UIStatusBarStyleDarkContent`). Het thema Kerst houdt op de website zijn sterrenhemel in de kop; in de app is ook
de kerstkop licht. CSS: blok ‘Lichte kop’ onderaan `bijbelreis.css`.

## Voorscherm bij het openen (20 november 2026)

Aanleiding (Martijn): wie bijbelreis.nl opende, kwam midden in de atlas op de laatst gelezen plek (bijv. alleen de Sinaï in
beeld) — geen begin. Nu staat er bij openen **zonder link** eerst een welkomstscherm (`#voorscherm`, `toonVoorscherm()` in
`app.js`): titel, de vaste zin, één grote knop (‘Verder met: …’ bij voortgang, anders ‘Begin de reis’ bij Abraham), ‘Kies
een geschiedenis’, de zes onderdelen in hun eigen kleur en de lesroutes (alleen Nederlands). Achtergrond: het reliëf van de
kaart (`relief-regio.webp`).

- Eén keer per bezoek: `sessionStorage` `bijbelreis:voorscherm`; niets extra in `localStorage`. Niet bij een diepe link
  (`#vNN`, `#boek/n`, `#wereld/…`, `#verhalen`), niet bij herladen of terug (history.state).
- Toegankelijk: `role="dialog"`, `aria-modal`; de rest van de pagina is `inert` zolang het open is; Escape en ‘Naar de
  atlas’ sluiten; focus op het scherm zelf, daarna op het gekozen onderdeel.
- ‘Verder met’ komt uit dezelfde functie als in de lijst (`verderDoel()`), dus beide wijzen naar hetzelfde. Eén verschil
  in de kersttijd: op het welkom telt ook een stap uit de kerstreis (`verderDoel(true)`); in de lijst doet de seizoenskaart dat.
- In de kersttijd (eerste adventszondag tot en met 6 januari) staat onder de grote knop het deel van deze week: ‘Advent en
  Kerst · deze week’ met ‘Lees deel 2: Van David tot Jozef ▶’ (of ‘Verder met deel 2’ / ‘… nog eens’), dezelfde knop als de
  seizoenskaart (`seizoenStand()`), rechtstreeks naar het deel. Gaat ‘Verder met’ al naar dezelfde stap, dan staat hij er
  niet twee keer. Getest met een vaste klok in `e2e/bijbelreis-voorscherm.spec.ts` (advent-controle 21-11-2026).
- Tests: `e2e/bijbelreis-voorscherm.spec.ts` (nieuw, terug, diepe link, axe). Andere specs zetten het welkom vooraf op
  ‘gezien’ via `e2e/voorscherm.ts`.

## Stand en overdracht (17 november 2026)

Dit is de actuele stand; de sectie over versie 2.0 hieronder is geschiedenis. Elke uitrol staat met versie-id’s,
herstelpunt en controle in [`bijbelreis-audit/releases.md`](bijbelreis-audit/releases.md).

**Live:** https://bijbelreis.nl/ (Worker `bijbelreis`, `wrangler.bijbelreis.jsonc`); martijndenbesten.com/bijbelreis
toont de verhuispagina. Uitrollen: eerst `bijbelreis`, dan de hoofdsite (`docs/DEPLOYMENT.md`). De Worker `bijbelreis`
heeft de D1-database `martijndenbesten` (migraties `0002_bezoek`, `0003_aanvraag`), het secret `HASH_SECRET` en de
e-mailbinding `MAIL` naar info@denckh.nl.

**Op 15 en 16 november live gezet** (PR #23–#40):

| Onderdeel | Documentatie |
| --- | --- |
| Telefoon ‘kaart voorop’: de kaart is het scherm, kort stapblad, ‘Lees meer’ | `bijbelreis-audit/telefoon.md` §4 |
| Jakob en Genesis 32 (twaalf taferelen, ‘Van dichtbij’ als knop op de kaart) | `bijbelreis-reizen/werk/jakob.verantwoording.md` |
| Gangbare uitleg verweven in de verhalen (uitzondering Jakob) | `bijbelreis-uitleg/README.md` |
| Thema Kerst, met advent per week (zes delen, niets op slot) | `bijbelreis-kerst/README.md` |
| Alleen nog een tekening die bij de stap hoort; twintig nieuwe tekeningen (reeks 3) | `bijbelreis-taferelen/README.md` |
| Startkaart ‘Begin de reis’, knop Deel, terugknop blijft in de site | `bijbelreis-audit/telefoon.md` §4.7–4.9 |
| Bezoekmeting zonder cookies, met overzicht in het beheer | `bijbelreis-bezoek/README.md` |
| Aanvraagformulier ‘Mis je iets? Vraag het aan’, met opgemaakte e-mail aan de maker | `bijbelreis-aanvraag/README.md` |
| Foto’s van 30 plaatsen (Wikimedia Commons, vrije licentie) | `bijbelreis-fotos/README.md` |

**Op 17 november live gezet** (PR #47, met #42–#46):

| Onderdeel | Documentatie |
| --- | --- |
| Lesroutes voor ouders, zondagsschool en klas (8 routes, 35 lessen, print en digibord) op `/bijbelreis/lessen` | `bijbelreis-samen/README.md` |
| Installeerbare app: manifest, service worker met één set per versie, offline voor bekeken verhalen | `bijbelreis-pwa/README.md` |
| Andere talen: Engelse proef op `/en/` (10 geschiedenissen, concept, `noindex`), KJV-controle, vlag `BIJBELREIS_TALEN` | `bijbelreis-talen/README.md` |
| 150 verhaalpagina’s (`/verhaal/<nr>-<slug>`, `/verhalen`) en sitemap, uit dezelfde gegevens | `bijbelreis-vindbaar/README.md` |
| Toegankelijkheid (WCAG 2.2 AA): focus niet verborgen, toetsenbord in de speurtocht, namen van knoppen | `bijbelreis-a11y/README.md` |
| Privacycontrole van bezoekmeting en aanvraagformulier | `bijbelreis-privacy/README.md` |
| Reis en kaart: geen kaart waar hij niets toevoegt (telefoon), zoomgrens, tikvlakken, ‘Van dichtbij’, deeplinks | `bijbelreis-audit/telefoon.md` §4.10 |
| Speurtocht, paspoort en personen: directe score, context bij vragen, ‘Hier was je’, Sara/Abraham | `bijbelreis-audit/telefoon.md` §4.11 |

**iOS-app:** besluit Capacitor, zie `bijbelreis-ios/BESLUIT.md`. De app staat in `apps/ios/` (eigen `package.json`;
de website-CI kijkt er niet in, behalve `tests/bijbelreis-app-webmap.test.ts`, die faalt als een websitewijziging de app
breekt). Stappen voor Xcode en App Store Connect, teksten, leeftijdsvragenlijst, privacylabel en Kids-categorie:
`bijbelreis-ios/APPSTORE.md`. Niet gebouwd of op een toestel getest (geen Mac). De privacyverklaring en de hulp staan op
`/privacy` en `/hulp` (`public/bijbelreis/privacy.html`, `hulp.html`; in de build onder `/bijbelreis/`).

**E-mail aan de maker werkt** (16-11-2026): Email Routing staat aan op de zone bijbelreis.nl (MX route1–3.mx.cloudflare.net,
SPF en DKIM), info@denckh.nl is bevestigd, en Martijn ontving zijn eigen proefaanvraag. Komt een mail niet aan, lees dan de
logboeken van de Worker (`npx wrangler tail -c wrangler.bijbelreis.jsonc`): `naAanvraag` schrijft daar de foutcode.

**Wacht op Martijn:**
- bijbelreis.nl aanmelden bij Google Search Console en Bing en de sitemap indienen (persoonlijke login).
- Inhoudelijk nalezen: de 97 lesvragen (`bijbelreis-samen/README.md`), de negen herschreven speurtochtvragen en ‘ook zijn
  halfzuster’ (`telefoon.md` §4.11).
- Privacyvoorstellen in `bijbelreis-privacy/README.md` (kortere bewaartermijn e-mail, CSP zonder cloudflareinsights).
- iOS: kostenakkoord Apple Developer Program, Kids-categorie ja/nee.

**Nieuw (PR #52):** ‘De wereld in die tijd’ (levenslijnen, kaart die met de tijd meebeweegt; Van Adam tot Noach en
Daniël en Babylon), met een uitnodiging bij de gekoppelde verhalen. Zie [`bijbelreis-wereld/README.md`](bijbelreis-wereld/README.md).

**Open, werk voor een volgende ronde:**
- Test op een echte iPhone (standalone-app, notch, offline) en Android; tot nu toe alleen Chromium.
- Het overzicht van een heel lange reis blijft klein op de telefoon; ‘3 van 25’ en ‘Lees meer’ zijn 26 px hoog.
- Nieuwe reisdelen ook als geschiedenis in de Verhalenlijst (drie niveaus).
- Ruim twee derde van de stappen heeft geen tekening; eigen tekeningen per verhaal volgens `bijbelreis-taferelen/README.md`.
- Bezoekcijfers van voor en na de startkaart vergelijken.

## Stand (versie 2.0, 25 oktober 2026)

14 boeken, 27 delen, 252 stappen (sleutels ongewijzigd t.o.v. 1.0), 152 plaatsen, 196 personen. Alles gecontroleerd tegen de
Statenvertaling: 3.067 regels in `scripts/bijbel-controle/<boek>.txt` plus 650 in `personen.txt`, alle geslaagd; ook de
kruisverwijzingen naar het Nieuwe Testament (NT-boeken staan nu in `public/bijbelreis/bijbel/`). Verslagen per onderdeel
in `docs/bijbelreis-audit/` (audit, vergelijking, plaatsen, personen, inhoud per boekengroep, ondergrond).

Nieuw in 2.0: reliëf (`relief-*.webp`, script `scripts/bijbelreis-ondergrond.py`), zekerheid per plaats met legenda,
Toen/Nu met moderne grenzen (`grenzen.json`), botsingsvrije labels, klikbare routes en plaatsen (‘Hier in de reis’),
grote kaart en tweevingerbediening op telefoons, tijdlijn, boekenkast (66 boeken met status), personenkaart met familie,
gebeurtenissen, plaatsen en verwijzingen (`personen.js`), kruimelpad, diepe link per stap (`#jozef/4`), ‘verder waar je
was’, soort weetje (Uit de Bijbel / Uitleg / Historische achtergrond), afstand per stap, één verwijzingslezer
(`verwijzing.js`), focusval in vensters, versiehash achter scripts (postbuild).

Vaste controles: `npm run check` (o.a. `tests/bijbelreis.test.ts`: verwijzingen, plaatsen, stapsleutels, chronologie,
personen), `python3 scripts/bijbel-check.py scripts/bijbel-controle/<boek>.txt`, `node scripts/bijbelreis-personen-check.mjs`,
`node scripts/bijbelreis-check.mjs` en `npx playwright test bijbelreis navigatie a11y`.

Nog niet gedaan: de overige bijbelboeken (in de boekenkast als ‘in ontwikkeling’), het Nieuwe Testament als reis.
Open inhoudelijke punten voor Martijn staan in de verslagen `docs/bijbelreis-audit/inhoud-*.md` en `personen.md`.

## Bibliotheek (martijn-ai-workbench)

Herbruikbaar als bouwsteen-kandidaat "Interactieve kinderkaart met reisboek uit inhoudsbestanden": Leaflet lokaal + Natural Earth-ondergrond, inhoud per boek in gewone JS-bestanden met een vast schema, geanimeerde routes, speurtocht met kaart-tikvragen, afstanden vergeleken met Nederland, stempelpaspoort in `localStorage`, Bijbeltekst-lade uit JSON, en twee controlescripts (bronverwijzingen tegen een tekstcorpus; pagina doorlopen in een browser). Hergebruikt uit de bibliotheek: B38 (visuele controle met Playwright), B99 (uitrol vanuit een cloudsessie via GitHub Actions; statische assets niet via de proxy), B53 (kindvriendelijke uitleg met oefenbeurt, als patroon). De kaart voor de bibliotheek is nog niet ingediend (daarvoor is schrijftoegang op `martijn-ai-workbench` nodig).

## De 150 geschiedenissen (versie 3.0)

Leidraad: een inhoudsopgave van 150 geschiedenissen (79 OT, 71 NT) met kernwoorden; transcriptie en controle in
`docs/bijbelreis-150/inhoudsopgave.tsv`. Alleen nummering, verwijzing en kernwoord zijn overgenomen als leidraad; alle
teksten, titels en vragen zijn eigen werk. Eén geschiedenis is een laag bóven de reisstappen: ze verwijst naar één of meer
stappen (kaart, routes, stempel) en voegt uitleg, kernwoord, ontdekking en vragen toe. Zo bestaat elk verhaal maar één keer.

Bestanden: `public/bijbelreis/geschiedenissen/<groep>.js` (records), nieuwe reisboeken in `public/bijbelreis/inhoud/`
(`leviticus.js`, `profeten.js`, `nt-jezus-1.js`, `nt-jezus-2.js`, `nt-jezus-3.js`, `nt-handelingen.js`, `nt-openbaring.js`),
nieuwe plaatsen staan (na samenvoegen) in `plaatsen.js`.

```js
BR.geschiedenissen.push({
  nr: 13,                                   // 1–150, volgorde van de leidraad
  t: "Abraham moet Izak offeren",           // eigen titel (beschrijvend)
  ref: "Genesis 22:1–19",                   // SV-nummering, zo precies mogelijk
  sectie: "aartsvaders",                    // zie lijst hieronder
  stappen: ["genesis:abraham:21"],          // reisstappen (boek:deel:index); bestaand of nieuw; [] alleen bij vorm symbool/thema zonder plek
  vorm: "route",                            // route | plek | stamboom | gelijkenis | thema | symbool
  uitleg: "5–9 zinnen: wat de Bijbel vertelt, in eigen woorden.",
  betekenis: "1–3 zinnen uitleg: wat dit in de Bijbel zelf laat zien (met verwijzing), geen subjectieve toepassing.",
  wie: ["Abraham", "Izak"],                 // namen zoals in `who` / BR.mensen
  kw: "geloof",                             // alleen bij de 47 geschiedenissen met een kernwoord
  ontdek: { soort: "volgorde", titel: "…", items: ["…"] },   // zie soorten hieronder
  quiz: [{ q: "…", a: ["GOED", "fout", "fout"], why: "Genesis 22:2" }],   // 3–5, eerste antwoord is goed
  cross: [["Hebreeën 11:17–19", "…"]],      // 1–4 verbanden met andere Bijbelgedeelten
  tl: [-2050, -2050], tijd: "ca. 2050 v.Chr.", tijdNoot: "Reconstructie: …",   // of tl: null bij geen verantwoorde datering
});
BR.kernwoorden.geloof = { n: "Geloof", uitleg: "3–5 zinnen, gebaseerd op de Bijbel.", refs: [["Hebreeën 11:1", "…"]] };
```

Ontdek-soorten: `koppel` ({ paren: [[a, b]] }), `volgorde` ({ items }), `onthul` ({ items: [[kop, tekst]] }),
`wiezei` ({ items: [[citaat, goed, [fout, fout]]] }), `gelijkenis` ({ beelden: [[beeld, betekenis, ref]] }),
`symbolen` ({ items: [[symbool, betekenis, ref]] } — alleen betekenissen die de Bijbel zelf geeft), `verbanden`
({ items: [[ref1, belofte, ref2, vervulling]] }), `kaart` ({ vraag, id, v }), `stamboom` ({ rijen: [[naam, …]] }).

Secties: OT `begin` (1–7), `aartsvaders` (8–20), `mozes` (21–31), `woestijn` (32–36), `kanaan` (37–41), `richters` (42–47),
`koningen` (48–62), `profeten` (63–75), `terugkeer` (76–79); NT `geboorte` (80–86), `galilea` (87–108), `onderweg` (109–117),
`pasen` (118–132), `gemeente` (133–142), `paulus` (143–148), `openbaring` (149–150).

Voortgang van geschiedenissen: `bijbelreis:verhalen` → `{ "<nr>": { g: 1, q: <beste score> } }` (los van de stapsleutels).
