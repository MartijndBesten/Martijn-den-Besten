# Overdracht Bijbelreis 4.0 (reisniveaus)

Voor wie dit werk overneemt (Claude, Codex of een mens). Lees dit eerst, daarna `werk/STATUS.md` en `schrijfwijzer.md`.

- **Werkbranch:** `claude/bijbelreis-4.0`. `main` is 3.1, live sinds 26-10-2026. Het herstelpunt staat in `docs/bijbelreis-audit/releases.md`.
- **Opdracht van Martijn:** Bijbelreis 4.0 helemaal afmaken en publiceren zodra alle controles slagen. Vragen alleen bij een echte blokkade.

## 1. Wat 4.0 is

Er zijn drie reisniveaus in één app:

| Niveau | Leeftijd | Inhoud |
|---|---|---|
| **a · Samen ontdekken** | 4–6 | Korte stappen om voor te lezen, een tip voor de volwassene, vragen met 2 antwoorden |
| **b · Zelf op reis** | 7–10 | Een eigen vertelling in 2–4 onderdelen, vragen met 3 antwoorden |
| **c · Verder ontdekken** | 11+ | De bestaande vertelling met 1–3 verdiepingsblokken en extra vragen |

Doel: alle 150 geschiedenissen op alle drie niveaus, dus **450 versies**.

### Besluiten van Martijn (26-10-2026, na de start van 4.0)

- De Bijbelreis is een **hulpmiddel náást de eigen Bijbel of kinderbijbel**, geen Bijbellezer.
  - De Bijbeltekst zit niet in de app. Verwijzingen staan als tekst: ‘Lees in je Bijbel: Exodus 14’.
  - Iedere vertaling past erbij (SV, HSV, kinderbijbel).
- **Geen voorlezen** met een stem.
- De Statenvertaling blijft alleen de **controlebasis** van de teksten. Ze staat in `data/statenvertaling/`, niet in `public/`.

### Vaste regels

Zie `schrijfwijzer.md` en de opdrachten in `werk/`.

- **Aanhalingstekens:** ‘enkel’ is letterlijke Statenvertaling. “Dubbel” is wat iemand zegt, in eigen woorden.
- **Niets verzinnen:** geen namen, aantallen of gevoelens die niet in de tekst staan.
- **Duidelijk onderscheid:** uitleg, interpretatie en overlevering worden altijd als zodanig benoemd.
- **Jaartallen:** alleen uit `tijd`/`tijdNoot`.
- **Plaatsen:** alleen met de zekerheid die in de gegevens staat.
- **Moeilijke onderwerpen:**
  - sober vertellen;
  - bij a mag iets worden weggelaten, met een tip voor de ouder en een verwijzing;
  - bij b in algemene woorden.

## 2. Wat er al staat (app)

Alles staat op de werkbranch en heeft tests.

### Teksten

- Teksten per niveau staan in `public/bijbelreis/niveaus/{a,b,c}.js`. Die bestanden worden **gegenereerd**; bewerk ze niet met de hand.
- `public/bijbelreis/niveaus.js` laadt alleen het gekozen niveau en laadt bij wisselen het andere erbij.
- De status van een versie is `concept`, `gecontroleerd` of `goedgekeurd`. Alleen bij `concept` ziet de gebruiker de markering ‘Proefversie’.

### Niveaukeuze

- Bij het eerste bezoek vraagt de app ‘Hoe wil je op reis?’.
- Wie al onderweg was, krijgt automatisch c.
- Alleen de keuze wordt opgeslagen (`bijbelreis:niveau`). Wisselen wist niets.

### Voortgang en scores

- Er blijft één stempel per geschiedenis (`verhalen[nr].q`). De score per niveau staat in `verhalen[nr].lv`.
- De speurtocht houdt per niveau een eigen beste score bij:

  | Niveau | Sleutel |
  |---|---|
  | a | `samen:<boek>:<deel>` |
  | b | `speur:b:<boek>:<deel>` |
  | c | `best:<boek>:<deel>` (de bestaande sleutel) |

- Het paspoort telt een deel één keer, ook als je het op meer niveaus deed.

### Scherm per niveau

- **Samen ontdekken:**
  - de verhalen per etappe, uitklapbaar;
  - de reis met één zin per stap en een knop ‘Lees samen’;
  - geen jaartallen, legenda, Bijbelwereld of reset.
- **Zelf op reis:** een eenvoudiger plaatsvenster en Wie is wie met 6 plekken in de reis (de rest uitklapbaar).
- **Verder ontdekken:** alles.
- Op alle niveaus is de dubbele voortgang weg uit de reisetiket en uit de lijst.

### Bestaande inhoud

424 navertelde uitspraken die tussen ‘ ’ stonden, staan nu tussen “ ”.

### Tests

- Unittests in `tests/bijbelreis.test.ts`.
- E2e in `e2e/bijbelreis.spec.ts`, waaronder:
  - migratie vanuit 3.1-opslag;
  - scores per niveau;
  - laadfout;
  - de reis bij Samen ontdekken;
  - geen Bijbeltekst in de app.

## 3. Werkwijze voor de teksten

Alles staat in `docs/bijbelreis-niveaus/werk/`:

| Bestand | Inhoud |
|---|---|
| `batches.json` | 29 batches (00 = de proefverhalen 1, 26, 83) |
| `schrijfopdracht.md` | Opdracht voor de schrijver; vervang `{BATCH}` |
| `controleopdracht.md` | Opdracht voor de tweede lezer; vervang `{BATCH}` |
| `uit/batch-NN.json` | De versies `{nr: {a, b, c}}`; de bron van de app-teksten |
| `uit/batch-NN.notities.md` | Notities van de schrijver: weglatingen, twijfels, fouten in bestaande inhoud |
| `review/batch-NN.verslag.md` | Controleverslag van de tweede lezer |
| `STATUS.md` | Gegenereerd overzicht per batch |
| `citaatherstel.md` | Citaten in de **bestaande** inhoud die niet letterlijk SV zijn (zie §4, taak 3) |
| `invoer/` | Niet in git; opnieuw te maken met het script hieronder |

Per batch:

```sh
node scripts/niveaus/invoer.mjs 07                                      # invoer maken (met SV-tekst als controlebasis)
# schrijver volgt werk/schrijfopdracht.md   → uit/batch-07.json (status concept) + notities
# tweede lezer volgt werk/controleopdracht.md → herstelt, zet status op gecontroleerd + review/batch-07.verslag.md
node scripts/niveaus-controle.mjs docs/bijbelreis-niveaus/werk/uit/batch-07.json   # vormregels en citaten
```

Daarna samenvoegen in de app en alles controleren:

```sh
node scripts/niveaus/samenvoegen.mjs --alleen-gecontroleerd   # → public/bijbelreis/niveaus/{a,b,c}.js + werk/STATUS.md
node scripts/niveaus-controle.mjs                              # alles in de app
node scripts/niveaus-controle.mjs --volledig                   # poort vóór publicatie: 150 × a/b/c, niets op concept
npx vitest run && npm run build && npx playwright test e2e/bijbelreis.spec.ts
```

### Wat het controlescript afdwingt

- **Vorm:** lengtes, aantallen en een geldige `stap` en `plaatsen`.
- **Inhoud:** geen jaartallen bij a, geen placeholders, en de verwijzingen bestaan.
- **Citaten:** elk citaat tussen ‘ ’ staat letterlijk in de verzen van die geschiedenis of in een genoemde verwijzing, met de juiste hoofdletters (HEERE/Heere).
- **Vragen:** op c herhaalt geen vraag een bestaande vraag.

Of de inhoud trouw is, beoordeelt de tweede lezer.

### Bekend

- **Versnummers:** de controletekst is de editie 1888 (transcriptie CC0). Die nummert in een paar hoofdstukken anders dan bijvoorbeeld de HSV.
  - Een vergelijking van de aantallen verzen per hoofdstuk (26-10-2026) wijst op Exodus 5–6 (daar is 5:24 wat elders 6:1 is), Johannes 1 (vanaf vers 39 één verder), Romeinen 7:25–26, Hosea 1–2 en 11–14, Openbaring 12–13, 3 Johannes, Nehemia 7–8 en Haggaï 1–2. Daarnaast de Psalmen, waar het opschrift als vers 1 telt (zoals in SV en HSV).
  - Verwijzingen in die hoofdstukken kunnen voor een lezer met een andere uitgave één vers verschillen.
  - Gebruik daar bij voorkeur een verzenreeks die in beide nummeringen klopt.
  - Een volledige controle tegen een gezaghebbende telling (GBS-SV, HSV) is nog niet gedaan.
- **Betekenis van ‘gecontroleerd’:** automatisch gecontroleerd plus zin voor zin nagelezen door een aparte AI-redacteur. Er heeft geen theoloog of andere mens naar gekeken. Zeg dat eerlijk in de oplevering.

## 4. Nog te doen (in deze volgorde)

Kijk eerst in `werk/STATUS.md` hoe ver het schrijven en controleren is.

1. **Schrijven:** elke batch zonder `uit/batch-NN.json`, of met minder dan 3 versies per geschiedenis.
2. **Controleren:** elke batch zonder `review/batch-NN.verslag.md`. De controleur zet de status op `gecontroleerd`.
3. **Citaatherstel bestaande inhoud** (`werk/citaatherstel.md`, ongeveer 135 regels).
   - Per regel: maak het citaat letterlijk naar de Statenvertaling van de genoemde verzen, of zet het tussen “ ” als het een navertelling is.
   - Bij ‘hoofdletters’: alleen de hoofdletters aanpassen aan de SV.
   - Vindplaatsen:
     - `g<nr>` → `public/bijbelreis/geschiedenissen/*.js`;
     - `<boek>:<deel>[:stap]` → `public/bijbelreis/inhoud/<boek>.js`;
     - kernwoorden en personen → `geschiedenissen/*.js` en `personen.js`.
4. **Fouten in bestaande inhoud** die schrijvers en lezers meldden: zie de kopjes ‘Invoer’ in `uit/*.notities.md` en `review/*.verslag.md`. Herstel alleen wat aantoonbaar fout is tegen de tekst; twijfel noteer je.
   - Voorbeeld: in de kaarttekst `izak:5` trekt Rebekka Jakob de kleren aan, niet Jakob zichzelf (Genesis 27:15–16).
5. **Statenvertaling uit de app:**
   - `git rm -r public/bijbelreis/bijbel`. De kopie in `data/statenvertaling/` blijft voor de controles.
   - Controleer dat `npm run build` en de tests slagen.
   - De map stond er alleen nog zolang de agenten met het oude pad werkten.
6. **Samenvoegen** met `--alleen-gecontroleerd`, dan de controle met `--volledig`. Alle tests moeten slagen.
7. **Visuele baselines** (`scripts/visueel.sh`, vast Playwright-image).
   - Bekijk elk nieuw schermbeeld.
   - Neem pas daarna de baselines over met `--update-snapshots=all`.
8. **Documentatie bijwerken:** `docs/bijbelreis-niveaus/README.md` (nog de proeffase) en de beslissingen.
9. **Opleveren:**
   - PR naar `main`;
   - CI groen;
   - squash-merge;
   - deploy volgens `docs/DEPLOYMENT.md`: embedded Worker vanaf `origin/main`, `npm run build && node scripts/embed-assets.mjs && npx wrangler deploy -c wrangler.embedded.jsonc`;
   - productie controleren en de e2e draaien tegen `E2E_BASE_URL=https://martijndenbesten.com`;
   - de release vastleggen in `docs/bijbelreis-audit/releases.md` (commit, Worker-versie, rollback).
   - **Niet publiceren** bij ontbrekende teksten, versies op concept, gegevensverlies of rode tests.

## 5. Niet doen

- Geen DNS, domeininstellingen, toegangsrechten of beveiliging wijzigen.
- Geen tokens of secrets in de repository.
- Geen force-push.
- Geen Bijbeltekst of voorlezen terug in de app.
- `public/bijbelreis/niveaus/*.js` niet met de hand bewerken.
- Geen opslagsleutels van gebruikers hernoemen of wissen (`bijbelreis:*`).
