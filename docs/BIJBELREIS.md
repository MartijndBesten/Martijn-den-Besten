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
- **Gevoelige verhalen** (geweld, seksualiteit): kort en zonder details; noem ze in ‘Voor ouders en leiders’ als dat nodig is.
- **Routes:** de Bijbel noemt plaatsen, geen wegen. Gebruik `recon: 1` als de Bijbel alleen begin en eind noemt. Volg bekende wegen (kustweg, bergrug, Koningsweg ten oosten van de Jordaan, Eufraatroute).
- **Plaatsen:** `c` eerlijk invullen: `v` (vrij zeker), `w` (waarschijnlijk), `o` (onzeker), `r` (gebied). Coördinaten op de bekende tell of de gangbare identificatie; bij twijfel `o` en dat in `d` uitleggen.

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

## Controleren

- `node --check public/bijbelreis/inhoud/<boek>.js`; open de pagina lokaal (`npx vite preview` of `python3 -m http.server` in `public/`) en kijk in de console: `Bijbelreis: onbekende plaatsen…` betekent een id die niet bestaat.
- Bijbelverwijzingen en getallen: `python3 scripts/bijbel-check.py <controlebestand>` met regels `Exodus 12:37 | zeshonderd duizend` (regex, hoofdletterongevoelig; de Statenvertaling schrijft getallen voluit: ‘vijf en zeventig’, ‘honderd en dertig’).
- Vóór publicatie: `npm run check` (typecheck, tests, build) en `npx playwright test navigatie a11y`.
