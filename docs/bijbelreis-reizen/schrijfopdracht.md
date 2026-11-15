# Schrijfopdracht: een nieuw reisdeel voor de Bijbelreis

Voor wie een nieuw **reisdeel** schrijft (mens, Claude of Codex). Een reisdeel is één reis of verhaallijn op de kaart: 6–10 stappen met plaatsen, routes, personen, een speurtocht en afstanden. De Bijbelreis is een atlas náást de eigen Bijbel of kinderbijbel, voor reformatorische gezinnen. **Alles moet feitelijk zijn en op de Bijbel rusten.**

## 1. Lees eerst

1. `docs/BIJBELREIS.md`: de regels voor de inhoud en het schema van boek, deel, stap, plaats en persoon.
2. `public/bijbelreis/inhoud/2kronieken.js`: een volledig uitgewerkt deel als voorbeeld (toon, lengte, opbouw).
3. `docs/bijbelreis-niveaus/schrijfwijzer.md` §2 en §3: Bijbeltekst, navertelling, uitleg, interpretatie en overlevering uit elkaar houden; moeilijke onderwerpen sober vertellen.
4. `docs/bijbelreis-audit/plaatsen.md`, het begin (Werkwijze): hoe de zekerheid van een plaats wordt gekozen.

## 2. Bronnen

- **De Bijbeltekst**: `node scripts/sv.mjs "Handelingen 17:1–18:22"` toont de Statenvertaling (controletekst, editie 1888) per vers. Lees het hele gedeelte zelf; schrijf niet uit het hoofd.
- **Plaatsen**: `OBI_DATA=<map> python3 -I scripts/reizen/plaats-zoek.py --exact "Thessalonica" "Berea"` zoekt in OpenBible.info Bible Geocoding Data (CC BY 4.0), met Engelse namen. Je krijgt per identificatie een score (0–1000), de moderne naam en `[lat, lng]`.
- **Bestaande plaatsen en personen**: zoek eerst in `public/bijbelreis/plaatsen.js` en `public/bijbelreis/personen.js` en hergebruik wat er is (Jeruzalem is `salem`, Bethlehem is `efrath`, Hebron is `mamre`).

## 3. Regels voor de inhoud

- **Alleen wat de Bijbel zegt** in `txt`: in eigen woorden, tegenwoordige tijd, 4–7 korte zinnen, in de volgorde van de tekst. Geen gevoelens, motieven, aantallen of details die er niet staan. De **eerste zin** moet op zichzelf te begrijpen zijn: de app toont die bij jonge kinderen als enige.
- **Aanhalingstekens**: ‘enkel’ = letterlijk Statenvertaling, exact (ook spelling en hoofdletters, zoals HEERE). “Dubbel” = wat iemand zegt, in eigen woorden. Een unittest controleert elk ‘ ’-citaat.
- **Uitleg en achtergrond** horen in `fact`, met `fs`: `"b"` (ander Bijbelgedeelte, met verwijzing), `"u"` (uitleg van een woord of gewoonte), `"h"` (geschiedenis of archeologie, niet uit de Bijbel). Zeg het erbij als uitleggers verschillen. Geen legendes.
- **Namen** volgens de Herziene Statenvertaling, zoals elders in de app. Eerbiedig: ‘de Heere Jezus’, Hij/Zijn met hoofdletter voor God.
- **Moeilijke onderwerpen** (oorlog, dood, oordeel): sober en eerlijk, zonder gruwelijke details en zonder eigen oordeel dat de tekst niet geeft.
- **Verwijzingen**: gedachtestreepje – in reeksen (`"Handelingen 17:1–9"`). De controletekst nummert in een paar hoofdstukken anders dan de HSV (o.a. Exodus 5–6, Johannes 1 vanaf vers 39, 1 Samuël 21/24, 1 Koningen 5, Hosea, Psalmen met opschrift). Kies daar een reeks die in beide nummeringen klopt.

## 4. Plaatsen en routes

- **Niets verzinnen.** Elke nieuwe plaats krijgt haar coördinaten uit OpenBible. Staat een plaats er niet in, of alleen als streek: zet haar niet als punt op de kaart (of als `c: "r"`, gebied) en noteer het.
- **Zekerheid `c`**, naar de score van de beste identificatie:
  - `v` bij 800 of hoger zonder serieuze tegenkandidaat;
  - `w` bij ongeveer 500–800;
  - `b` bij twee of meer serieuze kandidaten die meer dan ongeveer 3 km uit elkaar liggen (met `alt`);
  - `o` als alleen de streek bekend is of er alleen zwakke voorstellen zijn (het punt is dan illustratief);
  - `r` voor een streek, gebergte of land.
- **Velden**: `n` (naam), `ll`, `c`, `s` (kant van het label: r, l, t of b; kies zo dat labels van buurplaatsen niet botsen), `z` (zoomniveau vanaf waar het label altijd zichtbaar is: grote steden 5–6.5, gewone plaatsen 7.5–9), `t` (stad, berg, water, gebied, put, kamp, altaar, tent), `d` (één of twee zinnen voor kinderen, met verwijzing), `nu` (moderne naam en land), `bron` (verantwoording van de ligging), `alt` (bij `b`).
- **Sleutels** van nieuwe plaatsen en tussenpunten beginnen met het voorvoegsel dat bij je opdracht staat.
- **Routes**: de Bijbel noemt plaatsen, geen wegen: `recon: 1` als alleen begin en eind genoemd zijn. Laat routes over land langs bekende wegen lopen en zeeroutes via tussenpunten op zee (`BR.W`), zodat een lijn niet dwars over land of een eiland loopt. Een tussenpunt mag niet dezelfde sleutel hebben als een plaats.
- **Kaartgebied**: breedte 10–47, lengte 4–60. Wat daarbuiten ligt (bijvoorbeeld Spanje), komt niet op de kaart.

## 5. Personen

- Elke naam in `who` van een stap moet óf een groep of rol zijn (zie `GROEPEN` en `ROLLEN` in `scripts/bijbelreis-personen-check.mjs`), óf gekoppeld zijn aan `BR.mensen` in `personen.js` voor dit boek (`boek: [...]`).
- Bestaat de persoon al, voeg dan zo nodig het boek-id toe aan zijn `boek`-lijst. Twee personen met dezelfde naam mogen nooit hetzelfde boek delen (bijvoorbeeld twee koningen Joram): geef één van beiden dan een onderscheidende naam in `who` (zoals “Joram van Israël”) of laat hem uit `who`.
- Een nieuwe persoon krijgt `n`, `boek`, `kort` en waar de tekst het zegt `v`/`m`/`p` met `basis`, `leeftijd`, `dood`, `vervolg`, `elders`. **Elke** verwijzing in `personen.js` krijgt een regel in `scripts/bijbel-controle/personen.txt`.
- Een nieuwe groepsnaam alleen als het echt nodig is: voeg hem toe bij je markering in `GROEPEN` én meld hem in je eindantwoord (hij moet ook in `GROUPS` in `app.js`; dat doet de integrator).

## 6. Wat je oplevert

Je werkt in je eigen werkmap (git-worktree) op je eigen branch. In de bestanden staan markeringen `// [meer-reizen:<deel-id>] …`. **Zet je regels direct ónder je eigen markering en laat alle markeringsregels en de `//`-regels eronder staan.** Kom niet aan andere delen.

| Wat | Waar |
| --- | --- |
| Het deel (`{ id, n, short, ref, c, init, tijd, tl, tijdNoot, intro, who, stat, cross, ctx, steps, quiz, trips }`) | boekbestand, onder `… deel` |
| Regels voor ‘Wie is wie’ van het boek (`{ n, rol, i, deel }`) | boekbestand, onder `… wie` |
| Kleuren voor nieuwe namen (`Object.assign(BR.personen, { … });`, één regel) | boekbestand, onder `… kleuren` |
| Nieuwe plaatsen (`Object.assign(BR.plaatsen, { … });`) en tussenpunten (`Object.assign(BR.W, { … });`) | `plaatsen.js`, onder `… plaatsen` |
| Personen | `personen.js`, onder `… mensen` |
| Grond van de datering: `"<boek>:<deel-id>": ["historie" of "bijbel", onzeker?],` | `dateringen.js`, onder `… datering` |
| Controleregels voor personen | `scripts/bijbel-controle/personen.txt`, onder je markering |
| Controlebestand voor het deel: één regel `Verwijzing \| regex` per bewering, getal en citaat | nieuw: `scripts/bijbel-controle/<deel-id>.txt` |
| Notities voor de redactie | nieuw: `docs/bijbelreis-reizen/werk/<deel-id>.notities.md` |

Het deel zelf:
- 6–10 stappen; elke stap `ref`, `t`, `stamp` (één kort woord), `at`, waar gereisd wordt `r`, `who`, `txt`, `fs` + `fact`.
- `tijd`, `tl` en `tijdNoot`: zeg eerlijk dat het een reconstructie is en waarop ze rust; noem geen jaartal als vaststaand feit.
- `cross`: 4–6 verwijzingen naar andere Bijbelgedeelten, met één zin erbij.
- `quiz`: ongeveer 3 kaartvragen (`tap`, alleen plaatsen met `c` v of w), 6–8 meerkeuzevragen (`mc`: het eerste antwoord is goed, `why` is de verwijzing, foute antwoorden aantoonbaar fout) en 1 volgordevraag (`ord`).
- `trips`: de reizen voor ‘Hoe ver?’ (`{ n: "Van → Naar", s: stapindex }`, plus `{ n: "Alles …", s: "alles" }`).
- Kleuren: `kobalt`, `terra`, `lila`, `koraal`, `salie`, `boter`, `oker`, `rood` (vijanden en legers), `bruin`, `olijf`, `teal`, `grijs`.

De notities bevatten:
- een tabel van elke nieuwe plaats: sleutel, naam, `c`, punt, score en grond;
- plaatsen uit de tekst die je bewust niet op de kaart zet, met reden;
- twijfelpunten en wat je bewust wegliet.

## 7. Controleren (alles moet slagen)

```sh
node --check public/bijbelreis/inhoud/<boek>.js public/bijbelreis/plaatsen.js public/bijbelreis/personen.js public/bijbelreis/dateringen.js
python3 scripts/bijbel-check.py scripts/bijbel-controle/<deel-id>.txt      # 0 mis
python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt       # 0 mis
node scripts/bijbelreis-personen-check.mjs                                  # Geen fouten.
npx vitest run tests/bijbelreis.test.ts                                     # alles geslaagd
```

Lees daarna je eigen tekst nog één keer als tweede lezer naast de Statenvertaling: klopt elke zin, elke naam, elk getal en de volgorde? Commit dan je werk op je eigen branch (niet pushen), met een korte Nederlandse commitboodschap.
