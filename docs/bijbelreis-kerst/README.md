# Bijbelreis: het thema Kerst

Opdracht van Martijn (15-11-2026): "Werk alles voor kerst uit. Vanaf Adam in grote stappen van de geslachtsregister naar Jozef. Dan geboorte van Jezus en stukje totdat Hij 12 jaar is. Zorg dat kerst dus een speciaal onderwerp wordt (kan zijn rond de kerstperiode), moet er ook enigszins anders uitzien. Besteed hier veel tijd aan. Veel details."

Dit bestand is de overdracht: wie verder werkt (Claude, Codex of een mens) begint hier.

## Besluiten van Martijn

| Onderwerp | Besluit | Datum |
| --- | --- | --- |
| Zichtbaarheid | **Extra zichtbaar vanaf Advent tot en met 6 januari. Daarna niet weg, maar op de achtergrond.** | 15-11-2026 |
| Uiterlijk | Het thema moet er "enigszins anders" uitzien dan de rest van de atlas. | 15-11-2026 |
| Raadkoord | "Verwijs als mogelijk en logisch is naar Raadkoord." Bij Kerst: één verwijzing naar het kerstspel van Raadkoord (ook van Denckh), `https://raadkoord.nl/kerst`, bijvoorbeeld onder de inleiding van het thema of na het laatste deel: “Kerstliederen samen raden: Raadkoord Kerst”. Gewone link, `rel="noopener"`, geen target, geen logo. | 15-11-2026 |

Uitwerking van de zichtbaarheid:

- **Advent** begint op de eerste adventszondag: de vierde zondag vóór 25 december, dus de zondag die op 27 november tot en met 3 december valt (2026: 29 november; 2027: 28 november). Bereken dat per jaar; zet geen vaste datum in de code.
- **Extra zichtbaar** (eerste adventszondag t/m 6 januari): een eigen ingang op de startpagina en bovenaan in de boekenkast.
- **Op de achtergrond** (de rest van het jaar): het thema blijft bereikbaar via de boekenkast (onder ‘Thema’s’) en via de diepe links (`#kerst-…`), zonder ingang op de startpagina.
- De datum komt van het apparaat van de bezoeker. Een test moet beide standen kunnen afdwingen (bijvoorbeeld met een vaste klok in Playwright).

## Opbouw

Een eigen boek `kerst` (`public/bijbelreis/inhoud/kerst.js`, `thema: "kerst"`), met de delen in eigen bestanden:

| Bestand | Deel-id | Inhoud |
| --- | --- | --- |
| `inhoud/kerst-1.js` | `kerst-belofte` | De belofte: van Adam tot David |
| `inhoud/kerst-1.js` | `kerst-koningen` | Van David tot Jozef |
| `inhoud/kerst-2.js` | `kerst-aankondiging` | De aankondiging (Lukas 1; Mattheüs 1:18–25) |
| `inhoud/kerst-2.js` | `kerst-geboorte` | De geboorte in Bethlehem (Lukas 2:1–38) |
| `inhoud/kerst-3.js` | `kerst-wijzen` | De wijzen, Egypte en Nazareth (Mattheüs 2) |
| `inhoud/kerst-3.js` | `kerst-twaalf` | Twaalf jaar (Lukas 2:39–52) |

## Vaste regels voor dit thema

- **Alleen wat de Bijbel zegt.** Geen kersttraditie als feit: geen os en ezel, geen drie koningen (de tekst noemt geen aantal en geen koningen), geen herbergier, geen winter of 25 december. De wijzen komen ‘in het huis’ (Mattheüs 2:11). Sinds de regel ‘de gangbare uitleg hoort bij het verhaal’ (`docs/bijbelreis-uitleg/README.md`, 15-11-2026) wordt algemeen aanvaarde uitleg wel meeverteld, zonder voorbehoud: de kribbe als voederbak in een stal (Lukas 2:7, zoals de kanttekeningen, Calvijn en Henry).
- **De Heere Jezus wordt niet afgebeeld**, ook niet als Kind in de kribbe of als jongen van twaalf; God en engelen ook niet. Wat de Bijbel als zichtbaar teken noemt (de ster, het licht), mag.
- **Twee geslachtsregisters** (Mattheüs 1 en Lukas 3): volgens de gangbare lezing (uitlegregel van 15-11-2026) geeft Mattheüs de lijn van Jozef (via Salomo, de koningen) en Lukas de lijn van Maria (via Nathan); Heli is de vader van Maria. Zo verteld in `kerst-koningen` en bij `jozef_nt` in `personen.js`.
- **Sober en eerbiedig**: het eigen uiterlijk is nachtblauw met warm licht en de ster; geen kerstboom, sneeuw, kerstman of versiering.
- Verder gelden de regels van `docs/bijbelreis-reizen/schrijfopdracht.md` en `docs/bijbelreis-taferelen/README.md`.

## Werkwijze en stand

1. Drie schrijvers, elk twee delen, met een controlebestand tegen de Statenvertaling en notities met voorstellen voor de tekenaar (`docs/bijbelreis-reizen/werk/kerst-*.notities.md`).
2. Samenvoegen; personen en plaatsen ontdubbelen.
3. Tekenaars: taferelen bij de stappen.
4. Het eigen uiterlijk en de ingang (zie de besluiten hierboven); het boek heeft delen uit het Oude én het Nieuwe Testament, dus de reiziger (kameel of stip) en de streeknamen moeten per deel kunnen verschillen (`nt` op het deel).
5. Tweede lezer over alle zes delen (verslag: `docs/bijbelreis-reizen/werk/kerst.review.md`).
6. Tests, referentiebeelden, PR, uitrol naar beide adressen, controle op productie, releaselog.
