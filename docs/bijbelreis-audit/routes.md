# Routes op de kaart: meting, drie voorstellen en de keuze (21-11-2026)

Aanleiding: open punt sinds ‘kaart voorop met kort stapblad’ (telefoon.md §4) en Martijns eerdere opmerking *“De routes
moeten duidelijk zijn. Overzichtelijk.”* Eerst zijn de routes gemeten en kwamen er drie voorstellen achter een
proefschakelaar (§1–§2, bewaard als geschiedenis). **Martijn koos C · Schijnwerper**; dat is nu de vaste weergave, zonder
parameter (§4). Kort ook in [`docs/BIJBELREIS.md`](../BIJBELREIS.md) § ‘Routes: schijnwerper (21-11-2026)’.

## 1. Wat er nu mis is (gemeten op 390×664 en 1440×900)

1. **De stap valt niet op tussen de oude stappen.** Eerdere stappen staan in dezelfde kleur (45 % dekking, 3 px), ook
   gestippeld en met pijltjes (30 %). Bij Paulus stap 9 beslaan de oude lijnen meer van de kaart dan de stap zelf; je
   moet zoeken welke lijn ‘nu’ is. Na inzoomen ligt de stap vaak buiten beeld en blijven alleen de oude lijnen over.
2. **De rand om de lijn is onzichtbaar.** De omranding (`--halo` #f4ecda, 1,75 px aan elke kant) verschilt 1,09 : 1 van
   het land. Tegen de ondergrond zelf haalt de lijn niet overal 3 : 1 (WCAG 1.4.11): terra op het reliëf van Klein-Azië
   minimaal 1,45 : 1, mediaan 3,8 : 1, 4–6 % van de lijn onder 3 : 1; rood bij de Uittocht en Genesis 14 minimaal
   1,9 : 1. Kobalt (Abraham) haalt overal 4,6 : 1 of meer.
3. **Begin, eind en richting zijn niet te zien.** Er is geen beginteken; het eind ligt onder de kameel. Routes korter dan
   60 km krijgen geen pijltje (Abraham 4: Sichem → Bethel). Met ‘minder beweging’ loopt de kameel niet en blijft alleen
   dat ene pijltje over.
4. **Zijroute lijkt op de hoofdroute.** Bij de Uittocht (stap 5) is het leger van Farao `rood` (#9b3a2f) en het volk
   `terra` (#a3593a): bijna dezelfde kleur, even dik. Het enige verschil is de streep, en die betekent al ‘reconstructie’.
5. **Lijnen door namen.** De lijn van de stap loopt door 3 namen bij Uittocht 5 (Gosen, Sukkoth, Bittermeren), 5 bij
   Abraham 10 en 2 bij Paulus 9 (desktop). Leesbaar door de witte tekstrand, maar onrustig.

Beelden: `scratchpad/routes/nu-*.png` (ook ingezoomd: `nu-*-zoom-*.png`).

## 2. Drie voorstellen (`?routes=a|b|c`)

Alle drie: de lijn van de stap 5,5 px met een witte rand (`--wit`, 2,75 px aan elke kant; C 1,75 px) en bovenop de andere
lijnen; een zijroute (een andere reiziger dan die van het deel, in een stap waar die reiziger ook reist) 3,2 px. Geen
routegegevens of plaatsen veranderd; haltes in C zijn alleen plaatsen uit `plaatsen.js` die al op de kaart staan.

| | A · Heldere lijn | B · Hele reis als spoor | C · Schijnwerper |
|---|---|---|---|
| Wat | Ring om begin (klein) en eind (groot, gevuld), pijlpunten om de 100 px, ook op korte routes. | Wat nog komt dun grijs gestippeld; oude stappen iets sterker (70 %); na aankomst glijdt drie keer een lichtstreep van begin naar eind. | Rest van de reis grijs en zwak (30 %), de stap in kleur met een brede zachte gloed; genummerde haltes 1, 2, 3 … |
| Plus | Richting en begin/eind altijd te zien, ook stil; vertrouwd beeld (routeplanner). | Je ziet waar de reis nog heen gaat; richting zonder extra tekens. | De stap springt er het meest uit; volgorde zonder pijlen; werkt ingezoomd goed. |
| Min | Meer tekens op de kaart; ring raakt soms de naam van begin of eind; oude stappen blijven even sterk. | Streep is in een stilstaand beeld niet te zien; met minder beweging geen extra richting; oude en komende lijnen overlappen op dezelfde weg (blauw en grijze stippen door elkaar). | Bordjes bedekken het plaatsteken (‘?’-ring blijft zichtbaar); dicht bij elkaar (Lystre/Derbe) overlappen ze tot je inzoomt; het eindcijfer ligt onder de reiziger. |
| Nieuwe tekens over een naam (6 stappen, 2 schermen) | 17 keer (telefoon 8, desktop 9; vooral de eindring en pijlen bij Sukkoth en Bittermeren) | geen nieuwe tekens | 1 keer (bordje 1 bij Dan, telefoon); bordjes onderling 1 keer (4 en 5 bij Lystre) |

Contrast (WCAG 1.4.11): de lijnkleuren halen tegen de witte rand 4,85 : 1 (grijs) tot 8,4 : 1 (kobalt), dus overal
≥ 3 : 1 in alle drie de voorstellen. Tegen de ondergrond is het contrast gelijk aan nu (zelfde kleuren); de rand vangt de
donkere stukken op. Nu: 4,22 : 1 tegen `--halo`, maar die rand is niet van het land te onderscheiden.

Laadtijd en beweging (telefoon, processor 4× vertraagd, Paulus 8 → 9, drie keer): beelden per seconde in alle varianten
gelijk (gemiddeld 16,8–18,6 ms per beeld, p95 16,8 ms; één uitschieter in B met p95 33 ms), kaart klaar 1,3–1,8 s in
alle varianten (spreiding binnen de meetruis). Extra elementen op de kaart: A +10 tot +16, B +2 (alleen tijdens de streep),
C +16 tot +18. B volgt ‘minder beweging’: dan geen streep.

Vergelijkingsbeeld: [`screenshots/routes/vergelijking.jpg`](screenshots/routes/vergelijking.jpg) (telefoon en desktop,
vier stappen, nu/A/B/C). In de werksessie ook als `scratchpad/routes/vergelijking.png`, met losse beelden
`va-*`, `vb-*` (ook `vb-*-beweging-*` halverwege de streep), `vc-*`; metingen `meting-*.json`, `meting-overlap.txt`.

## 3. Code (proef, vervallen)

De proef stond achter `?routes=a|b|c` (`RV`, `rvTeken()`, `rvLangs()`, `rvAangekomen()`, CSS onder `html[data-routes]`).
Dat is allemaal weg; de parameter doet niets meer. Zie §4 voor de code van nu.

## 4. Gekozen: C · Schijnwerper (21-11-2026)

C is de standaard. A (ringen en pijlpunten) en B (spoor en lichtstreep) en de oude pijltjes langs de lijn zijn uit de code.
Geen routegegevens, plaatsen of liggingen veranderd.

**Wat er is afgewerkt** (de minpunten uit §2 en de opdracht):

1. **Bordjes naast de plaats, niet erop.** In de proef lag het bordje midden op het plaatsteken. Nu zoekt
   `plaatsHaltes()` (onderdeel van de naamplaatsing, `refreshLabels`) een plek links, boven, onder of rechts van het teken
   (eerst 3 px ervandaan, dan 12 px; ook schuin), die niets raakt: geen plaatsnaam, geen plaatsteken (ook ‘?’ en de
   ringetjes van een andere mogelijke plek), de reiziger, knoppen, het stapblad, ‘Vandaag’-bordjes of een ander bordje.
2. **Botsende bordjes** (Lystre, Derbe en Ikonium bij Paulus): begin en eind gaan voor, daarna op volgorde; past een bordje
   nergens, dan blijft het weg tot je inzoomt (de nummers van de andere blijven kloppen). Samenvoegen (‘4–5’) is niet
   gekozen: zo’n bordje staat bij één plaats en zou zeggen dat beide haltes daar zijn.
3. **Het eindnummer onder de kameel:** staat de reiziger op de plaats, dan zoekt het bordje een plek naast plaats én
   reiziger samen. Bij één plaats in de stap (bijv. de vlucht naar Egypte) geen nummer: ‘1’ alleen zegt niets.
4. **Plaats buiten beeld of onder het stapblad** (na inzoomen): geen bordje, anders stond het nummer bij een andere plaats.
5. **Overzicht van een deel (‘Hele reis’) en een geschiedenis:** rustig. Alle stappen even sterk in hun eigen kleur
   (3,5 px) met een witte rand (een eigen lijn `.rt-rand`, zodat de omranding het brede, onzichtbare klikvlak blijft),
   zonder gloed en zonder nummers. Waarom: daar gaat het om de hele weg en de volgorde van de stappen staat al in de
   stappenlijst; een grijze reis (zoals in een stap) zou het overzicht leeg laten lijken en nummers per stap zouden de kaart
   vol zetten.
6. **Legenda:** ‘De stap van nu’ (dikke lijn met witte rand en gloed), ‘Haltes van de stap, op volgorde’, ‘Grijs: al
   gereisd’, ‘Dun: een ander onderweg, zoals een leger’, ‘Gestreept: reconstructie’. Wat nog komt, staat (zoals in de proef)
   niet op de kaart; daarom geen regel ‘nog te gaan’. Engels in `taal/en.js`.
7. **Minder beweging:** op de kaart loopt dan geen enkele animatie (gemeten met `document.getAnimations()`; de reiziger
   staat meteen op de bestemming). **Contrast** van de lijn tegen haar witte rand (1,75 px aan elke kant): kobalt 8,4,
   lila 7,2, rood 6,8, salie 6,4, oker 6,2, bruin 6,1, koraal 5,9, teal 5,8, olijf 5,7, boter 5,2, terra 5,1, grijs
   4,85 : 1. Oker haalde met de gewone kleur maar 2,5 : 1: de lijn gebruikt nu de donkere variant (`tekstKleur`, oker-diep).
   Het thema Kerst verandert de kaartkleuren niet; de test meet het daar ook (wijzen, oker). De grijze rest van de reis
   (30 %) is bewust zwak: het is achtergrond, de stap zelf is de informatie.
8. **Zijroute** (andere reiziger in een stap waar de reiziger van het deel ook reist; leger van Farao, de koningen bij
   Abraham 10): 3,2 px met witte rand, zonder gloed, onder de lijn van de stap. Het verschil met de stap is daardoor dik
   tegen dun en met tegen zonder gloed, ook waar de kleuren op elkaar lijken (rood en terra).

**Meting na** (telefoon 390×664 en 360×640, tablet 820×1180, desktop 1440×900; `#abraham/4`, `#abraham/10`,
`#uittocht/5`, `#nt-paulus/9`, `#intocht/5`, `#jakob-jabbok/7`, `#kerst-geboorte/2`, `#kerst-wijzen/6`, de overzichten
`#nt-paulus` en `#uittocht`, de geschiedenissen 10, 26 en 144; telefoon en desktop ook twee keer ingezoomd): 0 bordjes
over een naam, een teken, de reiziger of elkaar (in de proef: 1 over een naam, 1 onderling, alle over hun teken). Paulus 9:
op 390 px 1 2 3 4 6 7 te zien en 5 (Ikonium) pas na inzoomen, op 360 px ook 6 pas na inzoomen, op tablet en desktop alle
zeven. Abraham 10: op de telefoon alle zes, op tablet en desktop 4 pas na inzoomen. Een stap zonder route (Intocht 5,
Jakob bij de Jabbok 7) heeft geen gloed en geen bordjes. Beelden in de werksessie: `scratchpad/routes/na/` (ook
`*-zoom-*`, de legenda en de overzichten).

**Code:** `stapTeken()` (na `routeState()` en een geschiedenis: klassen `rt-zij`, `#map.rt-rust`, gloed, witte randen en
de bordjes) en `plaatsHaltes()` (aan het eind van `refreshLabels`) in `app.js`; CSS onder ‘Routes: de schijnwerper’ in
`bijbelreis.css`. Test: `e2e/bijbelreis-routes.spec.ts`.
