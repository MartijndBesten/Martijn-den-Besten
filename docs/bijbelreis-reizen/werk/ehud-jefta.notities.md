# Notities bij het deel `ehud-jefta` (Richteren 3:7–31; 10:6–12:7)

Boek: Richteren (`public/bijbelreis/inhoud/richteren.js`). Tien stappen: Othniël (0), Ehud en Eglon (1–3, met Samgar in één zin aan het eind van stap 3), Jefta (4–9). Bronnen: Statenvertaling via `scripts/sv.mjs`, namen volgens de Herziene Statenvertaling (nagekeken op herzienestatenvertaling.nl, Richteren 3, 10, 11 en 12), plaatsen uit OpenBible.info Bible Geocoding Data.

## Nieuwe plaatsen

| Sleutel | Naam | `c` | Punt | Score OpenBible | Grond |
| --- | --- | --- | --- | --- | --- |
| `ej_efraim` | Bergland van Efraïm | r | 31.9878, 35.3332 | 465 (Seirah: "hills of Ephraim", punt in de streek) | Gebied. OpenBible kent Seirah/Sehira alleen als streek; dat streekpunt is het ankerpunt. Sehira zelf staat niet als punt op de kaart. |
| `ej_veren` | Veren van de Jordaan | r | 31.8371, 35.5503 | geen eigen plaats in OpenBible | Gebied, geen punt. De tekst zegt alleen "naar Moab" (3:28). Ankerpunt: de bekende oversteekplaats tegenover Jericho (al-Maghtas; in OpenBible het punt van Bethabara, ook gebruikt bij `nt_doopplaats`). |
| `ej_tob` | Land Tob | w | 32.5633, 36.2439 | 651 (et-Taiyibeh) | Duidelijke meerderheid, geen zekerheid; het volgende voorstel scoort 18. |
| `ej_mizpa` | Mizpa in Gilead | o | 32.1185, 35.7770 | 171 (Khirbet Jelad); verder 80, 76, 26 | Alleen zwakke voorstellen; punt illustratief bij het best ondersteunde. |
| `ej_jabbok` | Beek Jabbok | v | 32.1153, 35.5431 | 1000 (Nahr ez-Zarqa) | Zeker; punt bij de monding in de Jordaan. |
| `ej_aroer` | Aroër | o | 31.9702, 35.8713 | 219 (Khirbet Udena); verder 120, 83 | "Aroer 2" (Jozua 13:25; Richteren 11:33). Alleen zwakke voorstellen. |
| `ej_minnith` | Minnith | w | 31.8202, 35.8747 | 551 (Umm el-Hanafish) | Meerderheid, niet zeker; volgende voorstel 18. |
| `ej_abelkeramim` | Abel-Keramim | o | 31.8756, 36.0049 | 236 (Sahab); verder 106, 91, 38 | Alleen zwakke voorstellen. |

Geen nieuwe tussenpunten (`BR.W`). Hergebruikt: `jericho` (de Palmstad), `gilgal`, `jo_debir`, `gilead`, `rabba`, `hesbon`, `arnon`, `ramothgilead` (alleen als routepunt), `sittim`, `salem` en `bethlehemmoab` (context), en de tussenpunten `moab`, `dibon`, `medeba`, `jordanford`.

## Plaatsen uit de tekst die bewust niet (als punt) op de kaart staan

- **Sehira** (3:26; Statenvertaling: Sehirath, HSV: Sehira; de opdracht schreef "Seïrath"). Niet geïdentificeerd; OpenBible geeft alleen de streek. Daarom het gebied `ej_efraim`, met Sehira in de beschrijving en in het weetje van stap 3.
- **De veren van de Jordaan bij Jefta** (12:5–6). De tekst zegt niet waar. Stap 9 licht alleen het bergland van Efraïm en Gilead op; het weetje zegt dat de plek onbekend is. `ej_veren` is alleen voor Ehud gebruikt.
- **Zafon** (12:1). SV en HSV vertalen "naar het noorden" (HSV-voetnoot: "of: naar Zafon"). OpenBible rekent 12:1 wel tot Zaphon (Tell es-Saidiyeh, 523). Niet opgenomen, omdat de hoofdtekst van beide vertalingen geen plaatsnaam heeft.
- **De gesneden beelden bij Gilgal** (3:19, 26): geen eigen punt; `gilgal` licht op.
- **Het huis van Eglon**: de tekst noemt geen stad. In stap 2 lichten `gilgal` en `jericho` op; het weetje zegt dat de stad niet genoemd wordt en dat veel uitleggers aan Jericho denken.
- **Mesopotamië** (3:8), **Kades, de Schelfzee, Edom** (11:16–18) en **Jahza** (11:20; OpenBible 444): alleen genoemd in de terugblik van Jefta of ver buiten het verhaal; niet opgelicht.
- **Aroër aan de Arnon** (11:26; Arair, OpenBible 872): niet als apart punt; `arnon` ligt ernaast. Het staat wel in de beschrijving en de `bron` van `ej_aroer`.
- **De bergen** waar de dochter van Jefta heenging (11:37–38) en **de steden van Gilead** waar Jefta begraven werd (12:7): onbekend.

## Personen

Nieuw in `personen.js` (boek `richteren`): `othniel`, `cusjan` (Cusjan Risjataïm), `eglon`, `ehud`, `samgar`, `jefta`. Geen familiebanden ingevuld:

- Othniël: "zoon van Kenaz, broeder van Kaleb, die jonger was dan hij" (3:9) kan op Othniël of op Kenaz slaan. In ‘Wie is wie’ staat daarom het letterlijke citaat, zonder keuze. Kaleb is niet aan dit boek gekoppeld (hij staat niet in `who`).
- Jefta: zijn vader heet Gilead (11:1); geen aparte persoon aangemaakt.
- De dochter van Jefta heeft in de Bijbel geen naam en staat dus niet in `BR.mensen`. In `who` van stap 8 staat `["Dochters", "de dochter van Jefta"]`: de bestaande groepsnaam ‘Dochters’, zodat de chip "de dochter van Jefta" toont. Geen nieuwe groepsnaam nodig. Ze staat niet in de wie-lijst van het boek (daar moet elke naam gekoppeld zijn).

Geen nieuwe groepsnamen. Gebruikte bestaande groepen en rollen: Volk, Vijanden, Knechten, Oudsten, Broers, Boden, Koning, Dochters, Mannen, Soldaten.

## Twijfelpunten

1. **De gelofte van Jefta (11:30–40).** De `txt` van stap 7 en 8 volgt de tekst, met de kernzinnen letterlijk uit de Statenvertaling ("dat zal des HEEREN zijn, en ik zal het offeren ten brandoffer"; "die aan haar volbracht zijn gelofte, die hij beloofd had"; "om de dochter van Jeftha, den Gileadiet, aan te spreken"). Het weetje van stap 8 noemt beide lezingen met elk hun argument en kiest niet. Let op drie formuleringen:
   - "daar te huilen omdat zij ongetrouwd is" voor "bewene mijn maagdom" (11:37). De HSV vertaalt "omdat ik maagd zal blijven"; dat is hier niet overgenomen, omdat het naar één lezing neigt.
   - "zij is nooit getrouwd geweest" voor "zij heeft geen man bekend" (11:39), in woorden voor kinderen.
   - 11:40 is letterlijk geciteerd ("aan te spreken"), omdat de vertaling van dit woord (aanspreken, of: bezingen/beklagen) zelf deel van de discussie is.
   - Het weetje van stap 7 (Deuteronomium 23:21–23 over geloften) geeft alleen wat de wet zegt; of Jefta's gelofte goed was, laat de tekst van Richteren 11 onbesproken en het weetje ook.
2. **Datering.** Het deel overspant twee tijden: de eerste richters (vóór Debora) en Jefta (na Gideon). `tl: [-1380, -1100]` overlapt daardoor het bestaande deel Debora en Gideon (−1240 tot −1120), en het deel staat in het bestand tussen Debora en Simson. De jaartallen volgen dezelfde reconstructie als de bestaande delen (intocht ca. 1406; Richteren 11:26). In `dateringen.js`: `["bijbel", true]`.
3. **Routes zijn reconstructies** (`recon: 1`), en meerdere eindpunten zijn een gebied of een illustratief punt (bergland van Efraïm, veren van de Jordaan, Mizpa, Aroër, Abel-Keramim). De afstanden bij ‘Hoe ver?’ zijn daar dus alleen een indruk. De route van Eglon (Moab → Palmstad, rood) begint bij het bestaande tussenpunt `moab`; de tekst zegt alleen dat hij optrok en de Palmstad innam.
4. **Stap 0 licht Debir op** (`jo_debir`), de stad die Othniël eerder innam (Jozua 15:15–17; Richteren 1:11–13). De strijd tegen Cusjan Risjataïm heeft in de tekst geen plaats; het weetje zegt dat erbij. Wie dat verwarrend vindt, kan `at: []` met `view: "kanaan"` zetten.
5. **Welk Aroër** in 11:33: het Aroër bij Rabba (zo OpenBible) of het Aroër aan de Arnon. De beschrijving van `ej_aroer` noemt beide.
6. **Mizpa in Gilead**: de HSV schrijft in 11:29 "Mizpe in Gilead" en verder "Mizpa"; de Statenvertaling overal "Mizpa". Op de kaart één plaats, "Mizpa in Gilead".
7. **"Sjibboleth" en "Sibboleth"** staan in HSV-spelling tussen dubbele aanhalingstekens (de Statenvertaling heeft "Schibboleth" en "Sibbolet").
8. **De ‘gesneden beelden’ bij Gilgal** (3:19): afgodsbeelden of een steengroeve; het weetje van stap 2 noemt beide.

## Bewust weggelaten

- De bijzonderheden van de dood van Eglon (3:17b, 3:21–22, 3:24b): alleen dat Ehud hem met het zwaard doodt.
- "De bossen" (gewijde palen, 3:7) en de lijst van goden en volken in 10:6 en 10:11–12: samengevat.
- De terugblik van Jefta in 11:16–18 (Kades, Edom, Moab) en 11:23–25 (Kamos, Balak): samengevat in stap 6; het weetje verwijst naar Numeri 20–21.
- Richteren 12:4b ("Gijlieden zijt vluchtelingen van Efraïm"): de zin wordt verschillend vertaald en uitgelegd; weggelaten.
- De overige richters tussen Gideon en Jefta (Abimelech, Tola, Jaïr) en na Jefta (Ebzan, Elon, Abdon) vallen buiten het gedeelte.

## Controles

`node --check` (4 bestanden), `bijbel-check.py` op `ehud-jefta.txt` (173 regels, 0 mis) en `personen.txt` (0 mis), `bijbelreis-personen-check.mjs` (Geen fouten) en `vitest run tests/bijbelreis.test.ts` (alles geslaagd).
