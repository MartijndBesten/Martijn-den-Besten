# Controleverslag batch 33 (159, 160, 165, 166)

Tweede lezer, 22-11-2026. Gecontroleerd: de basisrecords in `public/bijbelreis/geschiedenissen/ot-6.js` (159, 160) en `nt-6.js` (165, 166), de niveauversies in `docs/bijbelreis-niveaus/werk/uit/batch-33.json` en de indeling in `indeling-33.json`. Elke bewering is opgezocht in `data/statenvertaling` (`node scripts/sv.mjs`), ook de verwijzingen in `cross`, `betekenis`, `samen` en de C-blokken.

Controles na afloop:
- `node scripts/niveaus-controle.mjs docs/bijbelreis-niveaus/werk/uit/batch-33.json` → OK: 4 geschiedenis(sen), 12 versies.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/ot-6.txt` → 111 gecontroleerd, 0 mis; `nt-6.txt` → 95 gecontroleerd, 0 mis (regels aangepast of toegevoegd waar de tekst veranderde).
- `npx vitest run tests/bijbelreis.test.ts`: alleen de verwachte fouten (indeling 151–166 nog niet samengevoegd; niveaus 151–166 nog niet samengevoegd). Geen andere fouten over 159, 160, 165, 166.
- Indeling: alle koppen 2+ woorden, ≤ 42 tekens, zonder eindteken; elk onderdeel begint letterlijk en uniek aan een zinsbegin van de (gewijzigde) `uitleg`; eerste onderdeel "", stappen bestaan. Inhoudelijk in orde; niets gewijzigd.

Status: alle 12 versies staan op "gecontroleerd".

## 159 — Jeremia moet mee naar Egypte

**Basisrecord (hersteld)**
- `uitleg` en quiz vraag 4: er stond dat Jeremia de stenen verbergt en dat Nebukadnezar zijn troon erop zet. De tekst geeft het bevel (43:9) en zegt: ‘Ik zal zijn troon zetten boven op deze stenen’ (43:10). Nu: Jeremia ‘moet’ de stenen verbergen; God zal de troon van Nebukadnezar erop zetten. De vraag is omgezet naar ‘Wat zou God boven op de verborgen stenen zetten?’ (goed: ‘De troon van Nebukadnezar’).
- `betekenis`: ‘Aan het eind blijft maar één vraag over’ was eigen retoriek; nu ‘zegt de HEERE dat zij zullen weten …’ (44:28).
- Taal: de bijstelling ‘Gedalja met het zwaard, de man die …’ in twee zinnen gezet.

**Niveaus (hersteld)**
- A `samen`: ‘Jeremia verbergt stenen’ → ‘moet stenen verbergen’ (zie boven).
- B: ‘Ismaël neemt de anderen gevangen mee’ (onduidelijk wie) → ‘de mensen van Mizpa’ (41:10).
- C blok 1: ‘hun mannen weten ervan (44:15, 19)’ maakte van de vraag in 44:19 een stelling. Nu: medeweten met 44:15 (letterlijk ‘die wisten’), en de vrouwen vragen ‘zonder onze mannen?’ (44:19). ‘Melecheth des hemels betekent koningin van de hemel’ → ‘wordt meestal vertaald als’ (de kanttekening noemt ook een andere lezing). ‘Ze denken dat het hun goed ging’ → ‘Ze zeggen …’ (44:17–18 zijn hun woorden).
- C blok 2: het verband met Deuteronomium 28:68 was een eigen verbinding; geschrapt. Het blok heet nu ‘Ook in Egypte niet veilig’ en volgt de tekst: wat het volk zegt (42:13–14), het zwaard dat hen in Egypte achterhaalt (42:16), ‘Mijn knecht’ (43:10; 25:9; 27:6), ‘komen en Egypteland slaan’ (43:11), het teken van Farao Hofra (44:29–30).
- C blok 3: ‘Johanan en de zijnen geven hem de schuld van Gods antwoord’ → wat zij letterlijk zeggen (43:3); ‘Zo gaat hij met Jeremia mee’ (verband dat de tekst niet legt) → ‘Nu moet hij met Jeremia mee’ (43:6).

**Bewust zo gelaten**
- Bethlehem: de vraag om gebed (42:1) volgt in de tekst op het halt bij Geruth-Chimham (41:17). De vertelling zegt niet dat het dáár gebeurde; de kaart toont het bij Bethlehem. Aanvaardbaar.
- A noemt de moord op Gedalja in één sobere zin; de andere doden staan in `samen` (§3).
- Namen: Gedalja/Nebukadnezar in eigen tekst, Gedalia/Nebukadrezar in citaten.

**Fout in de invoer (niet door mij hersteld)**
- Kaarttekst `profeten:jeremia-egypte:6` en het personenblad in `inhoud/profeten.js`: ‘Neria’; de Statenvertaling heeft ‘Nerija’ (43:3, 6).

## 160 — Ezra en Nehemia: de muur van Jeruzalem

**Basisrecord (hersteld)**
- `uitleg`: ‘Als de koning ziet dat hij treurig is, bidt Nehemia …’ sloeg de vraag van de koning over; het gebed komt pas na ‘Wat verzoekt gij nu?’ (2:2–4). Nu in die volgorde.
- `uitleg`: ‘De koning geeft hem verlof, brieven en hout’ → ‘verlof en brieven, ook voor hout’ (het hout komt via de brief aan Asaf, 2:8).
- `uitleg`: ‘Ze proberen Nehemia naar het dal Ono te lokken’ volgde op een zin over de bouwers, zodat ‘ze’ op hen leek te slaan → ‘Sanballat en Gesem’ (6:2).
- `betekenis`: ‘(Nehemia 8:11)’ → ‘(Nehemia 8:10–11)’; de Bijbeldata (1888) nummeren Nehemia 8 één vers verder dan gangbare uitgaven, het bereik klopt in beide.
- Quiz vraag 4: fout antwoord ‘In de tempel’ lag te dicht bij het voorstel van Semaja (6:10), die door Sanballat en Tobia gehuurd was (6:12) → ‘In Samaria’.

**Niveaus (hersteld)**
- A `samen`: ‘heel kort’ (gebed in 2:4) staat niet in de tekst → ‘midden in een gesprek met de koning’. Vraag 3: `why` → ‘Nehemia 8:2–4’ (nummering).
- B blok 1: ‘want ze hadden hem gezegd’ (las als: tegen Ezra) → ‘tegen de koning gezegd’ (8:22).
- B blok 2: ‘In Susan schenkt Nehemia de koning wijn in. Hij hoort dat de muur … kapot is’ zette het nieuws (Chisleu, 1:1) en het inschenken (Nisan, 2:1) in één moment → ‘Nehemia is schenker van de koning in Susan. Hij hoort …’. Vraag 1: ‘goede weg’ → ‘rechte weg’ (8:21).
- C blok 2 en vraag 3: verwijzingen naar Nehemia 8 als bereik dat in beide nummeringen klopt (8:17–18; 8:18–19). Blok 3: ‘is dat 458 en 445’ → ‘zijn dat de jaren 458 en 445’.

**Bewust zo gelaten**
- Ref ‘Ezra 7–8; Nehemia 1–4; 6; 8’ en ‘ca. 458–445 v.Chr.’: volgens het besluit. Beide jaartallen staan met grond in de tijdNoot (overgenomen uit de tijdNoot van het reisdeel `ezra:nehemia`), en de tijdNoot zegt dat Nehemia 8 geen jaar noemt.
- ‘kruideniers’ staat in de SV (3:31–32). ‘Jesua is een andere schrijfwijze van Jozua’ (C): algemeen aanvaard, niet uit de invoer.
- B ‘de hele morgen’ (voor ‘van het morgen licht aan tot op den middag’, 8:4) is ingekort om onder de 1000 tekens te blijven.

## 165 — Paulus in Thessalonica, Athene en Korinthe

**Basisrecord (hersteld)**
- `betekenis`: ‘Paulus vraagt niet dat de mensen hem zomaar geloven’ is een motief dat de tekst niet geeft → ‘In Berea ontvangen de mensen het Woord gewillig én onderzoeken ze zelf elke dag de Schriften; daarom …’ (17:11).

**Niveaus (hersteld)**
- A `samen`: ‘de rechter Gallio’ → ‘de aanklacht bij de stadhouder Gallio’ (hij wilde juist geen rechter zijn, 18:15).
- C blok 1: ‘Die woorden staan bij de Griekse dichter Aratus’ (niet uit de Bijbel) → ‘Volgens uitleggers komen die woorden van de Griekse dichter Aratus’ (besluit).

**Bewust zo gelaten**
- ‘via Caesarea en Jeruzalem’ volgt de SV-tekst van 18:22.
- Wie in Kenchreeën zijn hoofd liet scheren (18:18): geen zin en geen vraag, omdat de tekst daarover niet eenduidig is.

## 166 — Paulus in Efeze en het afscheid in Milete

**Basisrecord (hersteld)**
- `uitleg`: ‘Velen die toverkunsten deden’ → ‘Velen die ‘ijdele kunsten’ gepleegd hadden’ (19:19, woorden van de tekst; besluit).
- `uitleg`: ‘het Woord van de Heere’ → ‘het Woord van de Heere Jezus’ (19:10).
- `uitleg`: ‘Ze huilen, vooral omdat …’ → ‘Ze huilen en zijn zeer bedroefd, het meest omdat …’ (20:37–38: het ‘allermeest’ hoort bij ‘zeer bedroefd’).

**Niveaus (hersteld)**
- A: ‘maakt hen sterk in het geloof’ → ‘maakt hen sterk’ (18:23 zegt ‘versterkende’). ‘toverij/toverboeken’ → boeken over ‘ijdele kunsten’; `samen` zegt nu ‘Bij ‘ijdele kunsten’ denken uitleggers aan toverij’; vraag 1 ‘Hun boeken’. ‘Wel twee uur’ → ‘Ongeveer twee uur’ (‘omtrent twee uren’). `samen`: ‘wees niet ongerust’ → ‘ontsteld’; de vergelijking met Elia en Elisa is gekoppeld aan wat Paulus deed (‘viel op hem’, 20:10), zonder te zeggen wat er met Eutychus gebeurde.
- B blok 1: ‘heel Asia hoort’ → ‘allen die in Asia wonen … het Woord van de Heere Jezus’ (19:10); toverboeken → ‘ijdele kunsten (uitleggers denken aan toverij)’; Apollos geschrapt om onder 1000 tekens te blijven. Blok 2: ‘twee uur’ → ‘ongeveer twee uur’.
- C blok 2: ‘Paulus had wel verkondigd …’ gaf de woorden van Demetrius als feit → ‘Volgens Demetrius had Paulus wel gezegd …’ (19:26). ‘De Romeinen noemden de godin Diana, de Grieken Artemis’ → ‘In de Griekse tekst van Handelingen heet zij Artemis; Diana is haar Latijnse naam’.
- C blok 3: ‘vóór de Pinksterdag in Jeruzalem’ → ‘op de Pinksterdag’ (20:16).

**Bewust zo gelaten**
- A ‘Als ze hem optillen, is hij dood.’: dit zegt hetzelfde als ‘werd dood opgenomen’ (20:9), niet meer. Het is sober, en de volgende stappen vertellen meteen ‘zijn ziel is in hem’ en dat ze hem ‘levende’ brengen (20:10–12); `samen` geeft de letterlijke woorden. Geschikt om voor te lezen. Er wordt geen uitleg gekozen (wonder van opwekking of niet).
- ‘Asia’ (niet SV ‘Azië’), zoals in `nt-4.js` en op de kaart.
- In `data/statenvertaling/handelingen.json` staat in 19:28 ‘Groot is de Diana de Efezeren!’ (vermoedelijk tikfout voor ‘der’); de citaten volgen 19:34.

**Fout in de invoer (niet door mij hersteld)**
- De reisdeeltekst in `inhoud/nt-handelingen.js` stelt ‘ijdele kunsten’ zonder voorbehoud gelijk aan toverkunsten en toverboeken; dat is daar niet volgens het besluit voor deze batch.

## Niet gewijzigd
- `tl`, `tijd`, `tijdNoot`, `ref`, `stappen`, `cross` en `ontdek` van alle vier: gecontroleerd en in orde (citaten en verwijzingen kloppen met de SV; jaartallen gelijk aan de reisdelen).
