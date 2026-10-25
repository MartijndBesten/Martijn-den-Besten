# Bijbelreis (`/bijbelreis`)

Interactieve kaart voor kinderen (ca. 8–12 jaar) over het Oude Testament. Een statische pagina naast de React-site: `public/bijbelreis.html` + `public/bijbelreis/`. Geen framework, geen CDN (de CSP van de site staat alleen eigen bestanden toe), lettertypen uit `/fonts/`.

| Bestand | Inhoud |
| --- | --- |
| `public/bijbelreis.html` | de pagina (kaart links, reisboek rechts; op een telefoon onder elkaar) |
| `public/bijbelreis/app.js` | de engine: kaart (Leaflet), reisboek, Wie is wie, speurtocht, Hoe ver?, paspoort, Bijbeltekst-lade |
| `public/bijbelreis/bijbelreis.css` | stijl, met de kleur- en lettertokens van de site; donkere uiterlijken via `data-theme` |
| `public/bijbelreis/plaatsen.js` | alle plaatsen (`BR.plaatsen`), tussenpunten (`BR.W`) en kleuren per persoon (`BR.personen`) |
| `public/bijbelreis/inhoud/<boek>.js` | de inhoud per bijbelboek (`BR.boeken.push({...})`); één bestand per boek, in volgorde geladen in de HTML |
| `public/bijbelreis/geo.json` | ondergrond: land, meren, rivieren, woestijnen/gebergten, inzetkaartje en de vorm van Nederland (Natural Earth, publiek domein) |
| `public/bijbelreis/bijbel/<boek>.json` | Statenvertaling per boek (publiek domein) voor ‘Lees het zelf in de Bijbel’ |
| `public/bijbelreis/leaflet.js`, `leaflet.css`, `LICENSE-leaflet.txt` | Leaflet 1.9.4 (BSD-2), lokaal |

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
}
```

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

**Stapsleutels** (`boek:deel:index`) zijn de sleutels van de voortgang in `localStorage` (`bijbelreis:gezien`). Stappen
dus nooit herordenen, invoegen of verwijderen; alleen aan het eind toevoegen.

## Controleren

- `node --check public/bijbelreis/inhoud/<boek>.js`; open de pagina lokaal (`npx vite preview` of `python3 -m http.server` in `public/`) en kijk in de console: `Bijbelreis: onbekende plaatsen…` betekent een id die niet bestaat.
- Bijbelverwijzingen en getallen: `python3 scripts/bijbel-check.py <controlebestand>` met regels `Exodus 12:37 | zeshonderd duizend` (regex, hoofdletterongevoelig; de Statenvertaling schrijft getallen voluit: ‘vijf en zeventig’, ‘honderd en dertig’).
- Vóór publicatie: `npm run check` (typecheck, tests, build) en `npx playwright test navigatie a11y`.

## Stand (25 oktober 2026)

14 boeken, 27 delen, 252 stappen, 152 plaatsen en 375 speurtochtvragen: Genesis (Het begin, Abraham, Izak, Jakob, Jozef), Exodus (Mozes, Uittocht, Sinaï), Numeri en Deuteronomium (Woestijn, Moab), Jozua (Intocht, Het land), Richteren (Debora en Gideon, Simson), Ruth, 1 Samuël (Samuël, Saul en David), 2 Samuël (David), 1 Koningen (Salomo, Elia), 2 Koningen (Elisa, Wegvoering), Daniël, Esther, Ezra en Nehemia (Terugkeer, Nehemia), Jona. Controle: 2.178 regels in `scripts/bijbel-controle/`, alle geslaagd tegen de Statenvertaling; `node scripts/bijbelreis-check.mjs` zonder meldingen; e2e-tests (navigatie, toegankelijkheid) groen op desktop en telefoon.

Nog niet gedaan: de profeten buiten Jona en Daniël (Jesaja, Jeremia, Amos, Micha), Job, de Psalmen en Spreuken als eigen delen; Nieuwe Testament. De verwijzingen naar het Nieuwe Testament in `cross` zijn uit het hoofd en niet met het script gecontroleerd (alleen Oudtestamentische boeken staan in `public/bijbelreis/bijbel/`).

## Bibliotheek (martijn-ai-workbench)

Herbruikbaar als bouwsteen-kandidaat "Interactieve kinderkaart met reisboek uit inhoudsbestanden": Leaflet lokaal + Natural Earth-ondergrond, inhoud per boek in gewone JS-bestanden met een vast schema, geanimeerde routes, speurtocht met kaart-tikvragen, afstanden vergeleken met Nederland, stempelpaspoort in `localStorage`, Bijbeltekst-lade uit JSON, en twee controlescripts (bronverwijzingen tegen een tekstcorpus; pagina doorlopen in een browser). Hergebruikt uit de bibliotheek: B38 (visuele controle met Playwright), B99 (uitrol vanuit een cloudsessie via GitHub Actions; statische assets niet via de proxy), B53 (kindvriendelijke uitleg met oefenbeurt, als patroon). De kaart voor de bibliotheek is nog niet ingediend (daarvoor is schrijftoegang op `martijn-ai-workbench` nodig).
