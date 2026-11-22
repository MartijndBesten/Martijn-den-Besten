# Bijbelreis 4.0: reisniveaus

De Bijbelreis is een hulpmiddel **náást** de eigen Bijbel of kinderbijbel: een atlas met routes, plaatsen, personen, tijdlijn en vragen. De Bijbeltekst zelf zit niet in de app. Bij elke geschiedenis staat waar het in de Bijbel staat (‘Lees in je Bijbel: …’), zodat iedereen zijn eigen vertaling gebruikt.

Er zijn drie niveaus in één app, op één inhoudelijke basis:

| Code | Naam | Schrijfniveau (intern) | Inhoud per geschiedenis |
| --- | --- | --- | --- |
| `a` | Voorlezen | voorlezen aan 4–6 jaar | 4–10 korte stappen om voor te lezen, een tip voor wie voorleest, 2–4 vragen met 2 antwoorden |
| `b` | Zelf lezen | zelf lezen vanaf 7 jaar | een eigen vertelling in 2–4 onderdelen met kop (hooguit 1.000 tekens), 3–5 vragen met 3 antwoorden |
| `c` | Verdiepen | vanaf 11 jaar en volwassenen | de bestaande vertelling, met 1–3 verdiepingsblokken en 2–4 extra vragen |

Alle 166 geschiedenissen (de 150 en de 16 die op 22-11-2026 zijn toegevoegd, zie `docs/BIJBELREIS.md` § Geschiedenissen 151–166) staan op alle drie niveaus: 498 versies, allemaal met status `gecontroleerd`.

**Namen (21-11-2026):** de niveaus heetten eerst Samen ontdekken (4–6 jaar), Zelf op reis (7–10 jaar) en Verder
ontdekken (11+). Sinds 21-11-2026 heten ze Voorlezen, Zelf lezen en Verdiepen, en de app toont geen leeftijden meer: de
Bijbelreis is voor jong en oud (zie [`docs/BIJBELREIS.md`](../BIJBELREIS.md) § Niveaunamen). De kolom ‘Schrijfniveau’
is alleen een richtlijn voor wie schrijft; de inhoud van de niveaus is niet veranderd.

## 1. Hoe de teksten tot stand kwamen

Werkwijze en bestanden: [`OVERDRACHT-4.0.md`](OVERDRACHT-4.0.md) en [`werk/`](werk/). Regels: [`schrijfwijzer.md`](schrijfwijzer.md).

1. **Schrijven.** Per batch van 2–8 geschiedenissen. De schrijver werkt vanuit de Statenvertalingtekst van de geschiedenis (`werk/invoer/`, gemaakt met `scripts/niveaus/invoer.mjs`) en de bestaande gegevens van de app. Twijfels en weglatingen staan in `werk/uit/batch-NN.notities.md`.
2. **Automatische controle** (`scripts/niveaus-controle.mjs`):
   - vorm, lengtes en aantallen;
   - kaartstappen en plaatsen horen bij de geschiedenis;
   - verwijzingen bestaan;
   - geen jaartallen bij a;
   - geen placeholders;
   - elk citaat tussen ‘ ’ staat letterlijk in de verzen van de geschiedenis of in een genoemde verwijzing, met de hoofdletters van de Statenvertaling (HEERE/Heere).
3. **Tweede lezer.** Een aparte redacteur legt elke versie zin voor zin naast de Statenvertaling. Hij herstelt de fouten en zet de versie pas dan op `gecontroleerd`. Per batch staat er een verslag in `werk/review/`. Gemiddeld herstelde de redactie 5 tot 24 inhoudelijke fouten per batch. Voorbeelden:
   - een verkeerde volgorde van gebeurtenissen;
   - een motief of gevoel dat de tekst niet geeft;
   - een fout antwoord dat eigenlijk ook klopte;
   - uitleg die als feit was gebracht.
4. **Eigen steekproeven** op de moeilijkste geschiedenissen, waaronder Sodom, David en Bathseba, en de kruisiging.

**Wat ‘gecontroleerd’ betekent:** automatisch gecontroleerd én door een aparte AI-redacteur nagelezen tegen de Statenvertaling. Er heeft geen theoloog of andere menselijke redacteur naar gekeken. De status `goedgekeurd` is bedoeld voor wanneer de redactie (Martijn) een versie heeft gelezen.

**Bestaande inhoud.** Bij het schrijven kwamen ook fouten in de 3.1-teksten boven. Het herstel staat in [`werk/citaatherstel-verslag.md`](werk/citaatherstel-verslag.md) en [`werk/invoerherstel-verslag.md`](werk/invoerherstel-verslag.md):
- 424 navertelde uitspraken stonden tussen ‘ ’ en staan nu tussen “ ”;
- 135 citaten zijn letterlijk gemaakt of omgezet;
- van 258 gemelde fouten zijn er 122 hersteld; de rest is met reden bewust zo gelaten.

## 2. Inhoudsmodel

```
geschiedenissen/*.js   basis per geschiedenis: titel, ref, stappen, uitleg (vertelling), betekenis, kernwoord, cross, quiz,
                       tijd, tijdNoot, ontdek
niveaus.js             soorten, laden per niveau (BR.niveaus.laad), beginniveau
niveaus/{a,b,c}.js     de teksten per niveau; gegenereerd uit werk/uit/batch-*.json door scripts/niveaus/samenvoegen.mjs
```

- De app laadt alleen het gekozen niveau. Bij wisselen komt het andere bestand erbij.
- Mislukt het laden, dan meldt de app dat eerlijk en biedt hij een uitweg. Bij Voorlezen is dat de vertelling van Zelf lezen, die je kunt voorlezen.
- De Statenvertaling staat alleen in `data/statenvertaling/`, voor de controles; ze wordt niet meegeleverd.

## 3. Voortgang en opslag

Alleen lokaal en zonder persoonsgegevens:

| Sleutel | Inhoud |
| --- | --- |
| `bijbelreis:niveau` | `"a"`, `"b"` of `"c"` |
| `bijbelreis:niveauTip` | eenmalige melding voor wie al onderweg was |
| `bijbelreis:samen:<boek>:<deel>` | beste score Samen speuren (van 6) |
| `bijbelreis:speur:b:<boek>:<deel>` | beste score speurtocht Zelf lezen (van 10) |
| `bijbelreis:best:<boek>:<deel>` | beste score speurtocht Verdiepen; de bestaande sleutel uit 3.x |

- Alle bestaande sleutels blijven ongewijzigd: `gezien`, `best:`, `verhalen`, `laatst`, `huidig` en `welkomWeg`.
- **Eén stempel per geschiedenis** (`verhalen[nr].q`). De score per niveau staat apart in `verhalen[nr].lv`.
- Wisselen van niveau wist niets en telt niets dubbel.
- Het paspoort telt een speurtocht over hetzelfde deel één keer, ook als je die op meer niveaus deed.
- Wie al onderweg was, krijgt automatisch Verdiepen, met één korte melding. Een nieuwe bezoeker begint met Zelf lezen; de keuze staat op de startkaart (‘Hoe wil je lezen?’) en bovenin (‘Hoe wil je op reis?’).

## 4. Wat verschilt per niveau

| Onderdeel | Voorlezen | Zelf lezen | Verdiepen |
| --- | --- | --- | --- |
| Verhalen | per etappe uitklapbaar, groot, zonder zoeken | 150 met zoeken en filters | idem |
| Verhaal | één korte stap per scherm; de kaart volgt; tip voor wie voorleest | eigen vertelling in onderdelen; tijdvak in plaats van jaartal; extra achter ‘Meer weten’ | bestaande vertelling, jaartal met grond, uitklapbare verdieping |
| Reis | één zin per stap en ‘Lees samen: …’; geen jaartallen, weetjes of stappenlijst | volledig | volledig |
| Kaart | alleen de plaatsen van het verhaal en de hoofdroute; eenvoudige pop-up | pop-up zonder bronvermelding, korter | volledig, met de bron van de ligging |
| Wie is wie | de personen van het verhaal | personenkaart; 6 plekken in de reis, de rest uitklapbaar | volledig |
| Tijdlijn | 16 etappes, alleen de huidige uitgeklapt | delen in volgorde, jaartal achter ‘Wanneer was dat?’ | jaartallen met grond |
| Speurtocht | Samen speuren: 6 vragen met 2 antwoorden per boek of deel | kaart-, volgorde- en meerkeuzevragen uit de B-vertellingen | idem, plus verdiepende vragen |
| Paspoort | twee getallen en de gelezen verhalen | volledig | volledig |

Een reisdeel zonder eigen geschiedenis onder de 150 (zoals `ur-kanaan`, Genesis 11:27–12:5) heeft geen A- en B-vragen. Samen speuren gebruikt daar de meerkeuzevragen van het deel zelf, met het goede en één fout antwoord.

Op alle niveaus:
- de dubbele voortgang is weg uit de reisetiket en uit de lijstintro;
- verwijzingen staan als tekst;
- er is geen voorlezen. Dat was gebouwd, maar is op verzoek van Martijn weer weggehaald.

## 5. Bekende beperkingen

- **Versnummers.** De controletekst (editie 1888) nummert in een paar hoofdstukken anders dan bijvoorbeeld de HSV, zoals Exodus 5–6 en Johannes 1 vanaf vers 39. Zie [`OVERDRACHT-4.0.md`](OVERDRACHT-4.0.md) §3.
- **Geen menselijke eindredactie.** Zie §1.
- **Offline.** Er is geen service worker. Na één keer laden kan de browser bestanden uit de cache halen, maar de app werkt niet gegarandeerd zonder verbinding.
