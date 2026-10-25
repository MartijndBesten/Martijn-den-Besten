# Oplevering Bijbelreis 3.0: 150 geschiedenissen (25 oktober 2026)

**Live:** https://martijndenbesten.com/bijbelreis, worker-versie `0f451139-7eef-4119-addd-5eb0cf691e70`, broncode `main` @ `0d9f08b` (PR #4).
**Herstelpunt:** de live versie 2.0, worker-versie `b4db496e-3380-41dc-b8a1-7ebab4dba63d` (`npx wrangler rollback b4db496e-3380-41dc-b8a1-7ebab4dba63d -c wrangler.embedded.jsonc`).

## 1. Geschiedenissen

**Volledig gecontroleerd: 150 van de 150.**

- **Uitgewerkt:** alle 150 geschiedenissen. Elke geschiedenis heeft:
  - uitleg (minstens 400 tekens) en betekenis met Bijbelverwijzing;
  - een kernwoord volgens de leidraad (47);
  - een ontdekking in één van negen soorten, met inhoud;
  - 3–5 vragen met minstens 3 antwoorden en een verwijzing;
  - verwijzingen elders in de Bijbel;
  - de bijbehorende stappen op de kaart.

  Een test (`elke geschiedenis is inhoudelijk uitgewerkt`) bewaakt dat er geen lege records bestaan.
- **Redactie:** alle 150 records en 47 kernwoorden zijn gelezen en bewerkt. Zie `docs/bijbelreis-150/redactie.md`.
- **Bron:** Statenvertaling (editie 1888). Elk aangeraakt citaat is letterlijk tegen de tekst gecontroleerd.
- **Niets afgezwakt:** wat de Bijbel zegt, staat er (zie twijfelpunt 1 in `redactie.md`).

## 2. Personen en relaties

- **Personen:** 281 gecontroleerd.
- **Familiebanden:** 197, elk met een grondslag:
  - 184 staan letterlijk in de Bijbel (b);
  - 13 zijn afgeleid (a), met redenering.

  Elke grondslag heeft een SV-tekst die bestaat (test).
- **Overlevering:** apart vastgelegd, nooit als familieband. Het gaat om 2 personen: Johannes van Patmos en de apostel Johannes.
- **Andreas–Jonas:** afgeleid uit Johannes 1:41–43. In de SV staat ‘zoon van Jonas’ in 1:43.
- **Jozef, man van Maria:** geen vader ingevuld. Mattheüs 1:16 (Jakob) en Lukas 3:23 (‘den zoon van Heli’) staan er allebei bij, zonder keuze.
- **Johannes van Patmos:** een aparte persoon zonder familie. ‘De apostel’ staat er alleen als overlevering bij.
- **Naamgenoten:**
  - Bij 260 plekken met een naamgenoot is per plek vastgelegd wie bedoeld is. Na correctie kloppen ze alle 260.
  - Personen met dezelfde naam delen nooit een boek (test).
  - Zonder boek koppelt de app een naam alleen als precies één persoon zo heet.
- **Weergave:** de personenkaart toont ‘Staat zo in de Bijbel’ of ‘Afgeleid’ (met *), en overlevering als ‘Niet uit de Bijbel’.

Zie `personen-controle.md`.

## 3. Inhoudelijke correcties in deze ronde

| Onderdeel | Aantal | Voorbeelden |
| --- | --- | --- |
| Geschiedenissen: feitelijke correcties | 13 | 126 ‘aan elke kant één’; 34 Mozes én Aäron; 59 Absalom; 123 dienstknecht van de hogepriester |
| Geschiedenissen: betekenis theologisch bijgesteld | 2 | 55, 70 |
| Vragen: dubbelzinnige of jolige antwoorden vervangen | 4 | 15, 60, 61, 73 |
| Vragen: foute antwoorden plausibeler gemaakt | 53 vragen | het goede antwoord was vaak het langste |
| Personen: familieband verwijderd | 1 | Zeruja als dochter van Isaï (2 Samuël 17:25) |
| Personen: teksten verzuiverd | 7 | Patmos, Jozef/Heli, Ahasveros, Johannes (Galaten 2:9), Rachab, Andreas/Jonas (2×) |
| Personen: koppelfouten | 3 | Joas van Juda (65), Ananias (drie mannen), stamboom-koppeling via het verkeerde boek |
| Plaatsen: naam, coördinaat of zekerheid | 16 + 1 nieuw | Golgotha, berg van de verheerlijking en Bergrede betwist; Asdod, Kos; Antipatris nieuw |
| Routes: over zee in plaats van over land | 24 routes (11 NT, 13 OT) | vlucht naar Egypte, Via Appia, Kapernaüm, Jozef naar Egypte, Mozes naar Midian, Dode Zee |
| Ondergrond: oever Meer van Galilea | 1 | Kapernaüm lag ‘in het meer’ |
| Namen in teksten gelijk aan kaart/SV | 33 regels | Lystre, Appiusmarkt, Pergamus, Rhodos, Samothrake, Asdod (Azote) |

## 4. Tests (laatste run, 25 oktober 2026)

| Test | Geslaagd | Mislukt |
| --- | --- | --- |
| Typecheck | ✓ | 0 |
| Unit-tests (vitest, hele site) | 68 (1 overgeslagen: de 150-test zonder vlag) | 0 |
| Bijbelreis-tests met `BIJBELREIS_150=1` | 20 | 0 |
| SV-controleregels (23 bestanden) | 9.574 | 0 |
| Personencheck `--streng` | geen fouten | 0 |
| Doorklikken: alle delen, stappen en 150 geschiedenissen (desktop, telefoon, tablet) | 3 × geen problemen | 0 |
| Playwright e2e: desktop 38, mobiel 38, tablet 18 | 94 | 0 |

De e2e-tests dekken onder meer:
- elke ontdeksoort, echt goed opgelost;
- de vragen;
- naamgenoten;
- de personenkaart;
- de kaart (Toen/Nu, legenda, zekerheid);
- paspoort en voortgang;
- axe (WCAG 2.2 AA).

**Voortgang:** alle 252 stapsleutels van 1.0/2.0 bestaan nog (test). Oude stempels, scores en stempels van geschiedenissen blijven bewaard (e2e op 3 apparaten).

## 5. Kaart

Zie `kaart-3.md`.

- **Gecontroleerd:** 74 NT-plaatsen en alle 71 nieuwe routes, segment voor segment tegen land en zee. De OT-routes zijn met dezelfde check opnieuw nagelopen.
- **Zekerheid NT:** 49 identificeerbaar, 10 waarschijnlijk, 8 betwist (met kandidaten), 4 onbekend en 4 gebieden.
- **Leesbaarheid:**
  - zoom tot 13 voor Jeruzalem;
  - namen botsen niet met andere mogelijke plekken;
  - namen vallen niet buiten beeld;
  - meer ruimte op de telefoon;
  - geen naamloze stippen;
  - begin en eind van elke route met naam.

## 6. Resterende onzekerheden (beslissingen voor Martijn)

- **Redactie:** 8 vragen in `docs/bijbelreis-150/redactie.md`, o.a.:
  - gevoelige geschiedenissen voor 8-jarigen (10, 58);
  - Endor (55);
  - Mattheüs 16:18;
  - zondag/sabbat;
  - de lengte van de uitleg.
- **Personen:**
  - Abimelech en Achis zijn elk één persoon; de Bijbel zegt niet of het telkens dezelfde koning is.
  - Rachab als moeder van Boaz is afgeleid.
  - Zoeken op ‘Jozef’ of ‘Johannes’ toont de geschiedenissen van alle naamgenoten. Dat is zoeken op tekst, geen samenvoeging.
- **Kaart:**
  - Enkele kustplaatsen liggen op de grove kustlijn tot 1 km in zee (coördinaten juist).
  - Voor enkele punten is alleen OpenBible als bron gebruikt (Kos, Hattin, Batanea en enkele routepunten).
  - Voor Jeruzalem is geen stadsplattegrond getekend: de loop van de muren in de 1e eeuw is deels onzeker.
- **Techniek:** GitHub-uitrol slaat over zolang het geheim `CLOUDFLARE_API_TOKEN` ontbreekt. Uitrol gaat handmatig via de embedded worker.

## 7. Publicatie en controle op productie

- **Publicatie:** PR #4, CI groen. De eerste CI-run faalde in de speurtocht-test op mobiel; dezelfde fout zat al in de push-run van 2.0 (run 14). De toen gegeven verklaring (‘muis in plaats van tik’) was onjuist, zie §8.
- **Commit:** squash-merge `0d9f08b` op `main`, gebouwd vanaf `main`.
- **Uitrol:** via de embedded worker (5,2 MB gzip). Worker-versie: `0f451139-7eef-4119-addd-5eb0cf691e70`.
- **Herstelpunt:** `b4db496e-3380-41dc-b8a1-7ebab4dba63d` (2.0).
- **Gecontroleerd op productie (25-10-2026):**
  - nieuwe versie geladen (`app.js?v=a1fe1b8486`);
  - alle 34 scripts geven 200;
  - de gecorrigeerde ondergrond staat live;
  - Playwright `bijbelreis navigatie a11y` tegen https://martijndenbesten.com: **94/94** (desktop, mobiel, tablet);
  - alle 150 geschiedenissen geopend met titel, ontdekking en vragen op desktop, iPhone 13, Pixel 7 en iPad: 4 × 150/150, **0 JavaScript-fouten**.
- **Schermafbeeldingen van productie:** `screenshots/3.0/<apparaat>-start.jpg` en `<apparaat>-v26|v94|v126|v144|v149.jpg`.

## 8. Afronding (25 oktober 2026, avond)

Hercontrole op verzoek van Martijn, na publicatie van `0d9f08b`.

- **CI:**
  - De run op `d269ca6` (PR #4) en de push-run op `main` voor `0d9f08b` (run 17) zijn groen.
  - De push-run op `main` voor 2.0 (`b98275f`, run 14) was rood door dezelfde willekeurige speurtocht-fout; dat was toen niet opgemerkt.
  - `main` heeft geen verplichte checks (geen branchbescherming). De feitelijke poort is de job ‘Typecheck, tests en build’. ‘Deploy naar Cloudflare’ wordt overgeslagen zolang het geheim ontbreekt.
- **Oorzaak van de speurtocht-fout:**
  - De vragen worden geschud met `Math.random`. Als de eerste vraag een kaartvraag was, tikte de test op vaste coördinaten (300,300), terwijl de telefoon nog naar de kaart scrolde: geen reactie.
  - Een muisklik werkt op een touch-apparaat wél zodra de kaart stilstaat. Gemeten: Pixel 7, iPad en desktop, zowel muis als tik.
  - `touchscreen.tap` levert dezelfde gebeurtenissen als Chrome op Android: `pointerdown:touch → touchstart → pointerup → touchend → click:touch`.
- **Tests nu deterministisch:**
  - `Math.random` wordt alleen in de test vastgezet; de vraagvolgorde volgt dan de gegevens.
  - Kaartvraag, meerkeuze en volgorde worden apart getest; voor de laatste twee haalt de test de andere soorten weg uit zijn eigen testgegevens.
  - Bij de kaartvraag tikt de test precies op de plaats (pixel via de Leaflet-projectie) en verwacht ‘Raak!’. Daarna tikt hij ver weg op vrije kaart en verwacht ‘Mis.’ met ‘km ernaast’.
- **Kaartbediening getest op desktop, mobiel en tablet:**
  - zoomknoppen (+0,5 en terug);
  - desktop: slepen met de muis en het muiswiel;
  - telefoon en tablet:
    - één vinger in het reisboek verschuift de kaart niet en toont de hint;
    - knijpen met twee vingers zoomt;
    - op de grote kaart verschuift één vinger de kaart;
  - een plaats aantikken opent het venster met de zekerheid.
- **Fout gevonden en hersteld (app):**
  - Bij de kaart-ontdekking (15 geschiedenissen) stond het doel als marker op de kaart. Een tik op de goede plek opende het venster met de naam en gaf geen ‘Raak!’; zo werd ook het antwoord verraden.
  - Nu zijn plaatsen verborgen en routes niet klikbaar tijdens een kaartvraag (`.quizmode .plaats`).
  - Een open kaartvraag vervalt bij het wisselen van geschiedenis.
  - Beide nieuwe tests falen op `0d9f08b` en slagen met de reparatie. Alle 15 kaart-ontdekkingen zijn raak getest op 3 apparaten.
- **Voortgang:**
  - Echte voortgang opgebouwd in 2.0 (`b98275f`, lokaal): 8 stempels en een speurtocht-score.
  - Overgezet naar 3.0 op desktop, Pixel 7 en iPad: paspoort ‘8 stempels’ en ‘Ruth 9/10’ blijven staan; geen sleutel verloren.
  - Alle 252 sleutels van 2.0 wijzen naar dezelfde stap; alleen Daniël 7 heeft een verwijzing in SV-nummering.
- **Hercontrole van eerdere correcties en koppelingen:** 21/21 in orde. Daaronder:
  - #126, #15, #34, #59, #123;
  - Joas van Juda, Ananias, Andreas/Jonas, Jozef/Heli, Patmos, Zeruja, Nahor;
  - grondslag bij elke band; geen gedeelde naam+boek;
  - namen in HSV/SV-spelling; Kapernaüm op land; routes over land; betwiste plaatsen met kandidaten.
- **Redactie:** `redactie.md` heeft een regel per geschiedenis voor alle 150 (1–150, geen gat).
