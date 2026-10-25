# Oplevering Bijbelreis 2.0 (25 oktober 2026)

**Live:** https://martijndenbesten.com/bijbelreis, worker-versie `b4db496e-3380-41dc-b8a1-7ebab4dba63d`, broncode `main` @ `b98275f` (PR #3).
**Herstelpunt:** vorige versie `1e9d3cbc-9e18-43a3-8e59-424504a9156a` (`npx wrangler rollback 1e9d3cbc-9e18-43a3-8e59-424504a9156a -c wrangler.embedded.jsonc`).

## 1. Wat is onderzocht
De live site (vóór-screenshots op iPhone 13, Pixel 7, iPad en desktop), de broncode, alle 14 boeken / 27 delen / 252 stappen,
toegankelijkheid (axe, WCAG 2.2 AA), snelheid, en vergelijkbare producten (`vergelijking.md`). Zie `AUDIT.md`.

## 2. Gevonden problemen (hoofdpunten)
- 10 routes liepen via de top van de berg Sinaï door een sleutelbotsing (Abram, Jakob, de broers van Jozef, Jerobeam, Esther, de vlucht naar Egypte).
- 9 verwijzingen onleesbaar → geen Bijbeltekst-knop bij die stappen.
- Genesis gedateerd ‘ca. 2100–1800 v.Chr.’ inclusief Genesis 1–11.
- Zekerheid van plaatsen niet zichtbaar; Ararat als punt; geen alternatieven bij betwiste plaatsen.
- Telefoon: kaart vangt het scrollen, geen volledig scherm, legenda verborgen, schaalbalk over de knoppen.
- Overlappende labels; plaatsen verspreid over 11 bestanden; geen koppeling van personen; weetjes zonder soort.

## 3. Verbeteringen
Kaart: reliëf, zekerheid (identificeerbaar / waarschijnlijk of betwist / onbekend / gebied) met legenda, kandidaten bij
betwiste plaatsen, Toen/Nu met moderne grenzen, botsingsvrije labels, klikbare routes (reconstructie uitgelegd) en
plaatsen (‘Hier in de reis’), grote kaart en tweevingerbediening op telefoons, 40 px knoppen, safe areas.
Reisboek: welkom en ‘verder waar je was’, kruimelpad met voortgang, diepe link per stap, tijdlijn, boekenkast (66 boeken
met status), personenkaart (familie, gebeurtenissen, plaatsen, verwijzingen), afstand per stap, ‘Wat de Bijbel vertelt’ en
soort weetje (Uit de Bijbel / Uitleg / Historische achtergrond). Techniek: één verwijzingslezer, focusval en focusterugkeer
in vensters, zichtbare toetsenbordfocus op plaatsen, versiehash tegen cachemix, foutmelding als de kaart niet laadt.

## 4. Inhoudelijke correcties
- Genesis: 65 stappen aangepast, o.a. ‘negen’ i.p.v. ‘tien’ generaties Sem–Abram, één rivier uit Eden met vier hoofden,
  Hosea 12:3–4 (SV), gevoelige geschiedenissen nu verteld zoals de Bijbel ze vertelt. Zie `inhoud-genesis.md`.
- Exodus–Ruth: 104 correcties, o.a. Korach (vuur verteerde de 250), Numeri 10:33, Jozua 8, plagen en Gosen. Zie `inhoud-exodus-ruth.md`.
- Samuël–Jona: o.a. 1 Samuël 16:14, 17:39, 2 Samuël 24:1, Daniël 5:31 (SV), volgorde Ezra 4. Zie `inhoud-samuel-jona.md`.
- Plaatsen: 49 coördinaten gecorrigeerd (Berg Hor 66 km, Jona’s hut 20 km, Ziklag 18 km …), 3 plaatsen lagen in het water. Zie `plaatsen.md`.
- Personen: 196 personen met gecontroleerde familieverbanden; twee farao’s in Exodus uit elkaar gehaald. Zie `personen.md`.

## 5. Geslaagde tests
- Statenvertaling: 3.067 controleregels (14 boeken) + 650 (personen), 0 mis.
- `npm run check` (typecheck, unit-tests incl. `tests/bijbelreis.test.ts`, build) groen; CI groen.
- Playwright `bijbelreis navigatie a11y` tegen **productie**: 52/52 (desktop en mobiel).
- `scripts/bijbelreis-check.mjs`: alle delen en stappen zonder fouten. axe: 0 overtredingen.
- Voortgang: alle 252 stapsleutels van 1.0 bestaan nog; e2e bewijst dat oude stempels en scores blijven staan.
- Live: 0 JavaScript-fouten op iPhone, Android, tablet en desktop; eerste weergave 0,43–0,47 s; 760 KB overdracht (was 366 KB; reliëf 330 KB).

## 6. Wat open blijft
- Inhoudelijke beslissingen voor Martijn: genummerd in `inhoud-*.md` en `personen.md` (o.a. woordkeus Numeri 25 / Richteren 16:1, Dina in Genesis 34 met ‘verkracht’ uit de SV, chronologie van de richteren, Darius de Meder).
- Uitrol via GitHub Actions wordt overgeslagen: het geheim `CLOUDFLARE_API_TOKEN` ontbreekt in de repository. Nu handmatig via de embedded worker (4,65 MB gzip).
- Overige bijbelboeken en het Nieuwe Testament als reis: nog niet (in de boekenkast ‘in ontwikkeling’). Uitbreiding naar 150 geschiedenissen wacht op de inhoudsopgave.
- Bibliotheekkaart (martijn-ai-workbench): niet ingediend; geen schrijftoegang in deze sessie.

## 7. Staat het echt live?
Ja. Gecontroleerd op 25-10-2026 tegen https://martijndenbesten.com/bijbelreis: nieuwe versie (`app.js?v=36a019eb8f`),
alle nieuwe bestanden geven 200, e2e 52/52 tegen productie.

## Screenshots (vóór / na)
`screenshots/<apparaat>-start-voor-na.jpg` en `screenshots/<apparaat>-jozef-voor-na.jpg` voor desktop, iphone, android en tablet.
