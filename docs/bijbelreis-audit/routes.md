# Routes op de kaart: meting en drie voorstellen (21-11-2026)

Aanleiding: open punt sinds ‘kaart voorop met kort stapblad’ (telefoon.md §4) en Martijns eerdere opmerking *“De routes
moeten duidelijk zijn. Overzichtelijk.”* De vormgeving is Martijns keuze. Daarom staat er nog niets definitief: de drie
voorstellen zijn een proefschakelaar die je naast elkaar kunt bekijken. Zonder de parameter ziet de site er precies zo
uit als nu.

Bekijken: `https://bijbelreis.nl/bijbelreis?routes=a#nt-paulus/9` (of `b`, `c`; na samenvoegen). Lokaal hetzelfde
achter `npx vite preview`. Goede stappen om te vergelijken: `#abraham/4` (korte route), `#uittocht/5` (zijroute van het
leger), `#nt-paulus/9` (lange reis met veel oude lijnen), `#abraham/10` (zijroute van de koningen).

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

## 3. Code

`app.js`: `RV` (de parameter), `rvTeken()` (na `routeState()` en na een geschiedenis, en na zoomen), `rvLangs()`
(punten om de zoveel pixels langs de lijn), `rvAangekomen()` (B, aan het eind van de reis van de reiziger).
`bijbelreis.css`: alles onder `html[data-routes]` en de klassen `.rv-*`. Weghalen = die blokken schrappen; bij een keuze
wordt de gekozen variant de standaard en verdwijnt de parameter.
