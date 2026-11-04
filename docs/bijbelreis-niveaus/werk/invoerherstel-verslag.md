# Verslag invoerherstel: fouten in de bestaande inhoud

Datum: 4 november 2026. Branch: `claude/bijbelreis-4.0`.

## Opdracht en bronnen

Herstel van aantoonbare fouten in de **bestaande** inhoud van "Op reis door de Bijbel" (kaartteksten en deel-intro's in `public/bijbelreis/inhoud/*.js`, geschiedenissen in `public/bijbelreis/geschiedenissen/*.js`, `public/bijbelreis/personen.js`), op basis van wat schrijvers en redacteuren meldden tijdens het maken van de leeftijdsversies.

Gelezen bronnen met meldingen:
- `docs/bijbelreis-niveaus/werk/uit/batch-00.notities.md` t/m `batch-28.notities.md` (alle 29, inclusief batch 25);
- `docs/bijbelreis-niveaus/werk/review/batch-00.verslag.md` t/m `batch-28.verslag.md` (alle 29, inclusief het later toegevoegde verslag van batch 25).

Elke melding is zelf nagekeken in `data/statenvertaling/<boek>.json` (editie 1888). Meldingen die zowel in de notities als in het controleverslag staan, zijn als één regel opgenomen.

## Werkwijze

- Alleen hersteld wat aantoonbaar fout is: een bewering die de tekst niet zegt of tegenspreekt (persoon, volgorde, getal, toegevoegd motief of gevoel, plaats), een verkeerde verwijzing, een fout goed antwoord, of een citaat tussen ‘ ’ dat niet letterlijk Statenvertaling is (ook leestekens).
- Minimale ingrepen: alleen de foute woorden of zin; geen ids, sleutels, coördinaten, routes of structuur gewijzigd. De enige getallen die zijn aangepast, zijn een fout berekend jaartal (geschiedenis 86 en het deel `jezus-1:nt-geboorte`: `tijd` en `tl`).
- Bij interpretatieve kwesties (bijvoorbeeld Achans kinderen, de vrouwen bij het kruis, de volgorde van de opstandingsverslagen) is neutraal en dicht bij de tekst geformuleerd, of de tekst is bewust gelaten en hier genoteerd.
- Woorden en namen die de Herziene Statenvertaling gebruikt (de site volgt voor namen de HSV), zijn niet als fout behandeld, ook als de SV anders heeft (bijv. Reüel, steekvliegen, Bileam, Izebel, Asia, ‘put’ bij Jeremia).
- Veel meldingen over parafrases tussen ‘ ’ waren al opgelost in het eerdere citaatherstel (`citaatherstel-verslag.md`); die staan in de tabel als “al hersteld”. De resterende ‘ ’ in de genoemde kaartstappen zijn nagelopen; daarbij zijn nog twee niet-letterlijke citaten gevonden en hersteld (‘Ga in vrede.’ bij Eli en ‘Leve de koning!’).
- De koppen van de vertelling liggen vast in `public/bijbelreis/indeling.js` (buiten de toegestane bestanden). Waar een zin het letterlijke begin van een onderdeel is, is dat begin behouden.

## Aantallen

- Meldingen bekeken (na samenvoegen van dubbele meldingen): **258**
- Nu hersteld: **122**
- Al eerder hersteld (citaatherstel), niets meer te doen: **42**
- Bewust niet hersteld: **94** (geen aantoonbare fout, HSV-weergave, interpretatief, alleen kaart-id/route, of vastgelegd in `indeling.js`)

## Punten die een besluit of een ander bestand vragen

- **Geschiedenis 67**: “Later wordt Hizkia doodziek.” De SV heeft ‘In die dagen’ (2 Koningen 20:1), en volgens 20:6 moest de bevrijding van Assyrië nog komen. Deze zin is het letterlijke begin van onderdeel 3 in `indeling.js`. Voorstel: “In die dagen wordt Hizkia doodziek.” en in `indeling.js` de kop-begintekst gelijk aanpassen.
- **Geschiedenis 55**: “De volgende dag verliest Israël …” (afleiding uit 28:19 ‘morgen’; uitleggers verschillen). Begin van onderdeel 3 in `indeling.js`; daarom gelaten.
- **Geschiedenis 81**: de droom van Jozef staat vóór Maria’s reis naar Elisabeth. De tekst legt de volgorde niet vast; de onderdelen staan in die volgorde in `indeling.js`.
- **Plaatsen in kaartroutes** (Gabbatha bij `jezus-3:nt-lijden:6`, Jericho en `nt_jordaanvallei` bij `jezus-3:nt-opstanding:5` en `:8`, Jericho bij `jezus-2:nt-feesten-jeruzalem:7`): deze plaatsen staan niet in de tekst en niet in `at`, maar zijn begin- of tussenpunten van gereconstrueerde routes (`recon: 1`). Ze zijn niet gewijzigd (routes/coördinaten vallen buiten deze opdracht). Wie de kaart strakker wil laten aansluiten, kan die routes apart herzien.
- Onbekende plaats-ids in kaartstappen (`mosul`, `sippar`, `olijf`, `jvalley`, `jordanford` e.a.) zijn niet aangeraakt.
- `data/statenvertaling/psalmen.json`: Psalm 34:19 begint met ". " (gemeld in batch 21). Valt buiten deze opdracht.

## Controlebestanden

In `scripts/bijbel-controle/` zijn geen bestaande regels onjuist geworden. Om de nieuwe beweringen controleerbaar te maken, is aan 18 bestanden een blok `# --- Invoerherstel 2026-11-04` toegevoegd (o.a. Deuteronomium 34:10 ‘dien de HEERE gekend had’, 1 Samuël 13:22, 17:18, 17:32, Daniël 3:28, 6:1, 6:11, Ezra 2:65, 3:12, Johannes 19:25, Mattheüs 27:66, Handelingen 9:13–14, 10:12, 12:9). Alle bestanden geven `0 mis`.

## Uitkomst van de controles

- `node --check` op alle bestanden in `geschiedenissen/`, `inhoud/` en `personen.js`: geen fouten.
- `npx vitest run tests/bijbelreis.test.ts`: 29 geslaagd, 1 overgeslagen, 0 gefaald (ook de test “alle 150 geschiedenissen hebben a, b en c …” slaagt nu).
- `node scripts/bijbelreis-personen-check.mjs`: “Geen fouten.”
- `node scripts/bijbelreis-check.mjs`: “Geen problemen gevonden.”
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt`: 1223 gecontroleerd, 0 mis. Alle andere `scripts/bijbel-controle/*.txt`: 0 mis.

## Gewijzigde bestanden

`public/bijbelreis/geschiedenissen/`: ot-1.js, ot-2.js, ot-3.js, nt-1.js, nt-2.js, nt-3.js, nt-4.js.
`public/bijbelreis/inhoud/`: genesis.js, exodus.js, numeri.js, jozua.js, ruth.js, 1samuel.js, 2samuel.js, 1koningen.js, 2koningen.js, daniel.js, esther.js, ezra.js, profeten.js, nt-jezus-1.js, nt-jezus-2.js, nt-jezus-3.js, nt-handelingen.js.
`scripts/bijbel-controle/`: 18 bestanden (alleen toegevoegde regels).
`personen.js` is niet gewijzigd (de melding over ‘Abisaï’ is HSV-spelling). Niets gecommit door mij; een deel van de wijzigingen is tussentijds door de coördinator gecommit (“tussenstand herstel bestaande inhoud”).

## Alle meldingen

Batch = de batch waarin de melding staat (notities en/of controleverslag). “g” = geschiedenis (nummer), kaartstap = sleutel `<boek>:<deel>:<stap>`.

| Batch | Vindplaats | Wat er stond (melding) | Nu / niet hersteld + reden |
|---|---|---|---|
| 00 | g26, kaartstap exodus:uittocht:4 | “Ze schreeuwen tegen Mozes” | “Ze roepen tot de HEERE en zeggen tegen Mozes” (Ex. 14:10–11) |
| 00 | g26, kaartstap exodus:uittocht:5 | “Laten we vluchten,” roepen ze, ‘want de HEERE strijdt voor hen!’ (gemengd, ‘ ’ niet letterlijk) | “Laten we vluchten, want de HEERE strijdt voor hen!” roepen ze. “wielen eraf” niet hersteld: verdedigbare weergave van ‘stiet … weg’ |
| 00 | g83 cross + nt-jezus-1 (cross en kaartstap nt-geboorte) Micha 5:1 | ‘… uit u zal Mij voortkomen’ | ‘… Uit u zal Mij voortkomen’ (SV-hoofdletter), 3 plaatsen |
| 00 | kaartstap jezus-1:nt-geboorte:5 onbekende ids | routepunten | niet hersteld: geen tekstfout; het zijn bestaande routepunten in plaatsen.js |
| 01 | g2/g3, kaartstap genesis:begin:1 | citaat ‘Van de boom der kennis … zult gij niet eten.’ | was al eerder omgezet naar “ ” (citaatherstel); niets meer te doen |
| 01 | kaartstap genesis:begin:1 | “bouwt Hij een vrouw: Eva” en “de slang bedriegt Eva” (naam valt pas in 3:20) | “bouwt Hij een vrouw” / “bedriegt de vrouw” |
| 01 | kaartstap genesis:begin:1 | “God straft de slang, Eva en Adam, maar Hij belooft …” (volgorde: belofte staat in de woorden tot de slang, 3:15) | “God straft de slang, maar Hij belooft … Ook de vrouw en Adam krijgen straf.” |
| 01 | g3 vertelling | belofte (3:15) ná de straf voor vrouw en man | belofte direct na de vloek over de slang; daarna vrouw en man (kop van onderdeel 3 ongewijzigd) |
| 01 | g3 vertelling | “Cherubs met een vlammend zwaard” (3:24 noemt cherubim én een zwaard) | “Cherubs en een vlammend zwaard” |
| 01 | g7 vertelling | parafrase van 11:4 tussen ‘ ’ | was al omgezet naar “ ” (citaatherstel) |
| 01 | kaartstap genesis:abraham:1 en :13 | parafrases ‘Ga uit je land…’, ‘Keer terug.’ | al omgezet naar “ ” (citaatherstel) |
| 01 | kaartstap genesis:begin:5, abraham:0/1/3/4 onbekende ids | | niet hersteld: plaats-ids/routepunten, geen tekst; ids niet wijzigen |
| 01 | g9 Ontdek ‘God hoort’ e.d. | naamsbetekenissen tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 01 | kaartplaats ‘Lachai-Roï’ | SV ‘Lachai-roi’ | niet hersteld: plaatsnaam staat in plaatsen.js (buiten de toegestane bestanden) |
| 02 | g10 vertelling | “waar de mannen boos zijn” (SV ‘boos’ = slecht; nu leesbaar als kwaad/geïrriteerd) | “waar de mannen slecht zijn” |
| 02 | g10 Betekenis | ‘God gedacht aan Abraham’ (woordvolgorde) | al eerder hersteld: “God heeft ‘aan Abraham gedacht’” |
| 02 | kaartstappen genesis:abraham:6, :7, :12, :14, :15, :23; izak:1, izak:6; jakob:0 | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel); resterende ‘ ’ zijn letterlijk |
| 02 | kaartstap genesis:abraham:18 | plaats Gerar bij de geboorte van Izak; “Sara 90” | niet hersteld: Gerar is alleen een kaart-id (ids niet wijzigen; tekst noemt geen plaats); “Sara 90” steunt op 17:17 (‘Sara, negentig jaren oud zijnde, baren?’), niet aantoonbaar fout |
| 02 | g13 vertelling + bestaande vraag 5 | ‘De HEERE zal het voorzien!’ | goed antwoord van vraag 5 nu “De Heere zal het voorzien” (22:14); de vertelling was al hersteld (citaatherstel) |
| 02 | kaartstap genesis:abraham:21 | “Daarna gaan ze terug naar Berseba” | niet hersteld: 22:19 ‘zij gingen samen naar Ber-seba’; ‘ze’ is niet aantoonbaar fout |
| 02 | kaartstap genesis:izak:5 | “Jakob doet mee: hij trekt de kleren van Ezau aan en vellen …” | “Jakob doet mee: zij trekt hem de kleren van Ezau aan en doet vellen … over zijn handen en hals” (27:15–16) |
| 02 | kaartstap genesis:izak:1 | “Jakob woont liever in de tenten” | “Jakob woont in tenten” (25:27) |
| 03 | g16 bestaande vraag 4 | goed antwoord “In zijn plaats gaf men …” (leest als ‘in plaats van hem’; SV ‘te dezer onzer plaatse’) | “In hun woonplaats gaf men de jongste niet vóór de oudste weg” |
| 03 | g16 vertelling en kaartstap genesis:jakob:3 | “elf zonen en een dochter … Als laatste … Jozef” (leest alsof Jozef een twaalfde zoon is) | “De laatste van die elf is Jozef …” (30:22–24) |
| 03 | kaartstap genesis:jakob:1 | “Na een lange reis” | niet hersteld: kleine stijlinvulling, geen tegenspraak met 29:1 |
| 03 | kaartstappen genesis:jakob:4, jozef:1, jozef:2, jozef:4 | parafrases/ingekorte citaten tussen ‘ ’ | al omgezet of letterlijk gemaakt (citaatherstel) |
| 03 | kaartstap genesis:jozef:2 | “zilverstukken” i.p.v. SV ‘zilverlingen’ | niet hersteld: woordkeus, geen inhoudelijke fout |
| 04 | kaartstappen genesis:jozef:9, jakob:12, exodus:mozes:4, :5 | parafrases tussen ‘ ’, ‘Leeft’ met hoofdletter | al omgezet/letterlijk gemaakt (citaatherstel) |
| 04 | kaartstap exodus:mozes:1 | titel “Een mandje in het riet”, “Ze maakt een kistje”, “haalt snel” | niet hersteld: woordkeus/stijl; ‘kistje van biezen’ en ‘mandje’ zijn geen tegenstrijdige zaken, “mandje” komt ook in stempel en vragen terug |
| 04 | kaartstap exodus:mozes:2 | “Mozes groeit op in het paleis” (staat niet in Ex. 2) | zin geschrapt: “Als Mozes groot is, gaat hij …”; “vlucht ver weg” niet hersteld (stijl) |
| 04 | g22 vertelling en Ontdek | “Reüel” (SV 2:18 ‘Rehuël’) | niet hersteld: Reüel is de HSV-spelling die de site gebruikt (ook personen.js) |
| 04 | g23 vertelling | “drie tekenen: … en water uit de rivier wordt bloed” (4:9 kondigt dit alleen aan) | “… en water uit de rivier zal bloed worden” |
| 04 | g23 Ontdek ‘Vier wonderen’ | “Water uit de rivier wordt bloed op het droge land (4:9).” | “Als het volk de eerste twee tekenen niet gelooft, zal water uit de rivier bloed worden op het droge land (4:9).” |
| 05 | kaartstappen exodus:uittocht:0, :3, :7, sinai:1, :2 | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 05 | g24 vertelling, kaartstap exodus:uittocht:1 | “steekvliegen” (SV ‘vermenging van ongedierte’) | niet hersteld: HSV-woord (Ex. 8:21 HSV ‘steekvliegen’) |
| 05 | kaartstap exodus:uittocht:1 | Gosen bij vee en licht | niet hersteld: Israël woonde in Gosen; samenvatting niet aantoonbaar fout |
| 05 | kaartstap exodus:uittocht:2 | “bittere kruiden” (SV ‘bittere saus’) | niet hersteld: HSV-weergave |
| 05 | kaartstap exodus:uittocht:3 | “zeshonderdduizend mannen, en ook vrouwen, kinderen” (12:37 noemt geen vrouwen) | “zeshonderdduizend mannen, behalve de kinderen, en heel veel vee” |
| 05 | kaartstap exodus:sinai:2 | “zijn handen omhoog” (17:11 ‘zijn hand’) | niet hersteld: 17:12 heeft ‘zijn handen’ |
| 05 | algemeen: versnummering Exodus 5–6 | | geen tekstfout; geen wijziging |
| 05 | kaartstap bij 27 (exodus:sinai) | “Veertig jaar lang eet Israël manna” | niet hersteld: geen fout (Ex. 16:35; Jozua 5:12); de schrijver meldde dit zelf als ‘geen fout’ |
| 06 | kaartstappen exodus:sinai:4, :5, :7 | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 06 | g29 vertelling | “een altaar met twaalf kolommen” (24:4: een altaar ‘en twaalf kolommen’) | “een altaar en twaalf kolommen” |
| 06 | kaartstap exodus:sinai:7 | “Mozes bidt” pas na de Levieten (eerdere voorbede 32:11–13 ontbreekt) | niet hersteld: onvolledig, niet fout (32:30–32) |
| 06 | kaartstap exodus:sinai:8 | “Op de eerste dag van het tweede jaar” (40:17: eerste maand, eerste dag) | niet hersteld: de eerste dag van het jaar is de eerste dag van de eerste maand; geen inhoudelijk verschil |
| 07 | kaartstappen leviticus:verzoendag:0, :1; numeri:woestijn:3–6 | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 07 | g33 vertelling | “het volk huilt de hele nacht” (14:1 ‘in dienzelven nacht’) | “het volk huilt die nacht” |
| 07 | g33 vertelling | citaat ‘wij waren als sprinkhanen in onze ogen.’ breekt de SV-zin af met een punt | ‘wij waren als sprinkhanen in onze ogen, alzo waren wij ook in hun ogen.’ (13:33) |
| 07 | g33 vertelling | “zeggen tien van hen” (13:27–28 is het verslag van allen) | niet hersteld: afgeleid uit 13:31 en 14:6–10, niet aantoonbaar fout |
| 07 | g33 Betekenis | Hebreeën 3:19 in andere woordvolgorde | al eerder hersteld (staat nu letterlijk) |
| 07 | kaartstap numeri:woestijn:3 | “Van Hazeroth …” valt buiten de ref | niet hersteld: klopt met Numeri 12:16, geen fout |
| 07 | g34 vertelling | “na veertig jaar weer in Kades” (20:1 noemt geen jaar) | niet hersteld: gangbare afleiding uit 20:22–28 met 33:38; geen tegenspraak met de tekst |
| 07 | kaartstap numeri:woestijn:5 | “Maar Mozes roept boos” (gevoel staat niet in 20:10) | “Maar Mozes roept” |
| 07 | kaartstap numeri:moab:0 (Bileam) + persoon Balak in numeri.js | “Balak … is doodsbang” (22:3: ‘Moab vreesde zeer’) | “Moab is zeer bang voor dit volk. Balak … stuurt boden”; persoon Balak: “Moab vreesde Israël zeer (Numeri 22:3)” |
| 07 | dezelfde kaartstap | “bij de rivier de Eufraat” als feit (22:5 ‘aan de rivier’) | “bij de rivier (meestal uitgelegd als de Eufraat)” |
| 07 | dezelfde kaartstap | “laat Balak hem drie keer vloeken” | “probeert Balak hem drie keer te laten vloeken” |
| 07 | dezelfde kaartstap en g35 vertelling | “Ster” met hoofdletter (SV 24:17 ‘ster’) | “ster” |
| 07 | g35 vertelling | citaat ‘Gij zult dat volk niet vloeken…’ met hoofdletter (22:12 midden in de zin) | ‘gij zult dat volk niet vloeken, want het is gezegend.’ |
| 08 | kaartstap numeri:moab:5 | “die God kende van aangezicht tot aangezicht” (Deut. 34:10: ‘dien de HEERE gekend had’; onderwerp en voorwerp omgedraaid) | “die door de HEERE gekend was van aangezicht tot aangezicht” |
| 08 | kaartstappen numeri:moab:3, :4; jozua:intocht:0 | vrije weergaven tussen ‘ ’ | al omgezet naar “ ” (citaatherstel); “Naftali” is HSV-spelling, niet hersteld |
| 08 | g36 vertelling | ‘… kiest dan het leven.’ (SV ‘Kiest’) | ‘… Kiest dan het leven.’ |
| 08 | kaartstap jozua:intocht:1 | Rachabs belijdenis (2:9) pas ná het neerlaten (2:15) | belijdenis vóór het neerlaten gezet |
| 08 | g37 vertelling | belofte over het koord vóór het neerlaten | niet hersteld: 2:18 spreekt in de toekomende tijd; niet aantoonbaar fout |
| 08 | g38 vertelling en kaartstap jozua:intocht:2 | “heel ver weg, bij de stad Adam” (SV ‘zeer verre van de stad Adam af’) | niet hersteld: interpretatieve kwestie (HSV-lezing); de SV-woorden laten beide lezingen toe |
| 08 | kaartstap numeri:moab:3 | “120 jaar”, “de Jordaan niet over” | niet hersteld: klopt (Deut. 31:2); geen fout |
| 09 | kaartstappen jozua:intocht:3, :4; jozua:land:0, :1, :6; richteren:debora:2–4 | parafrases tussen ‘ ’ | al omgezet naar “ ” of letterlijk gemaakt (citaatherstel) |
| 09 | kaartstap jozua:intocht:4 | “zoals God bevolen had” (in Jozua 6 geeft Jozua het bevel) | niet hersteld: Gods bevel staat in Deut. 20:16–17; de bewering klopt |
| 09 | g40 vertelling | “Achan, zijn kinderen en alles wat hij heeft worden … gestenigd en verbrand” (kiest één lezing van 7:25) | “Achan, zijn kinderen en alles wat hij heeft worden naar het dal Achor gebracht. Daar stenigt Israël hem.” (neutraal, 7:24–25; kop van onderdeel 3 ongewijzigd) |
| 09 | kaartstap jozua:intocht:5 | “Achan, zijn gezin en alles … gestenigd en verbrand” (geen vrouw genoemd; één lezing) | “Achan wordt met zijn zonen en dochters en alles wat hij heeft naar het dal Achor gebracht. Daar stenigt Israël hem.” |
| 09 | g40 vertelling, kaartstap, Ontdek | “door het lot” (SV ‘geraakt’) | niet hersteld: gangbare uitleg van 7:14–18, interpretatief |
| 09 | g40 vertelling | “het kleine Ai” | niet hersteld: 7:3 ‘zij zijn weinige’, Jozua 10:2 |
| 09 | kaartstap jozua:land:0 | “proeven van het brood” (9:14 ‘namen … van hun reiskost’) | “nemen van hun reiskost” |
| 09 | kaartstap jozua:land:0 | “Jozua houdt zijn eed” (9:15: de oversten zwoeren) | “Jozua sluit vrede en een verbond, en de oversten zweren hun.” … “Israël houdt de eed” |
| 09 | g41 bestaande vraag 2 | “Wat vergaten de mannen van Israël te doen?” (‘vergeten’ staat niet in 9:14) | “Wat lieten de mannen van Israël na?” |
| 09 | kaartstap richteren:debora:1 | “zit onder een palmboom” (SV ‘woonde’); Sisera als onderdrukker | niet hersteld: HSV 4:5 heeft ‘zat’; ‘hij’ in 4:3 is niet eenduidig |
| 09 | g42 vertelling | “Debora zegt dat de eer dan naar een vrouw zal gaan” (uitleg van 4:9) | “… dat de eer dan niet voor Barak zal zijn, want de HEERE zal Sisera in de hand van een vrouw verkopen” |
| 09 | g42 bestaande vraag 900 wagens | why Richteren 4:3 (‘hij’ niet eenduidig) | why Richteren 4:13 |
| 09 | g42 Ontdek (wiezei) | ‘Waarom vertoeft zijn wagen te komen?’ | ‘… te komen!’ (5:28) |
| 09 | kaartstap richteren:debora:3 | “Barak stormt van de berg af” | niet hersteld: stijl (‘trok … af’) |
| 10 | g43 vertelling | ‘De HEERE is met u, gij strijdbare held!’ (komma ontbreekt) | ‘De HEERE is met u, gij, strijdbare held!’ (6:12) |
| 10 | kaartstap richteren:debora:5 | ‘De HEERE is vrede.’ en parafrases tussen ‘ ’ | al hersteld (citaatherstel): ‘De Heere is vrede!’; parafrases staan tussen “ ” |
| 10 | kaartstap richteren:debora:8 | “fakkels omhoog” | niet hersteld: kleine stijlinvulling |
| 10 | kaartstap richteren:simson:1 | “want Hij zocht een aanleiding” (SV ‘hij’ = Simson) | niet hersteld: interpretatieve kwestie; HSV leest 14:4 met ‘Hij’ (God), de SV met ‘hij’ |
| 10 | g46 vertelling | “Hij duwt tegen de twee middelste pilaren” (16:29–30 ‘vatte … boog zich met kracht’) | “Hij vat de twee middelste pilaren en buigt zich met kracht” |
| 10 | kaartstap richteren:simson:5 | “in het dal Sorek” (SV ‘beek Sorek’) | niet hersteld: HSV-weergave (‘in het dal Sorek’) |
| 10 | kaartstap richteren:simson:6 | gebed als omschrijving tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 10 | g47 vertelling | “Daar sterven Elimelech en, ongeveer tien jaar later, ook de zonen” (1:4: zij woonden er omtrent tien jaar) | “Daar sterft Elimelech. Ze wonen er ongeveer tien jaar; dan sterven ook de zonen.” |
| 10 | kaartstap ruth:ruth:4 | “doe je mooie kleren aan” (‘mooie’ staat niet in 3:3) | “doe je kleren aan” |
| 10 | kaartstap ruth:ruth:3 | “Boaz komt uit Bethlehem” | niet hersteld: Boaz woonde in Bethlehem (2:4; 4:11); niet fout |
| 11 | kaartstappen 1samuel:samuel:0, :1, :4, :5, :6, :7 | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 11 | kaartstap 1samuel:samuel:0 | ‘Ga in vrede.’ (Eli, 1:17: ‘Ga heen in vrede’) | ‘Ga heen in vrede.’ |
| 11 | kaartstap 1samuel:samuel:1 | ‘Hier ben ik!’ (3:5: ‘Zie, hier ben ik’) | ‘Zie, hier ben ik.’ |
| 11 | kaartstap 1samuel:samuel:2 | ‘de eer is weg uit Israël’ | al omgezet naar “ ” (citaatherstel) |
| 11 | kaartstap 1samuel:samuel:2 | “Israël vecht … bij Afek” (4:1: Israël bij Eben-haezer, de Filistijnen bij Afek) | “Israël trekt ten strijde tegen de Filistijnen, die bij Afek liggen, en verliest.” |
| 11 | kaartstap 1samuel:samuel:3 | “zonder dat iemand stuurt” | niet hersteld: volgt uit 6:7–12 (de proef met de koeien; de vorsten gaan erachter) |
| 11 | kaartstap 1samuel:samuel:4 | ‘Wij hebben tegen de HEERE gezondigd.’ (SV ‘den HEERE’) | al omgezet naar “ ” (citaatherstel) |
| 11 | kaartstap 1samuel:samuel:6 | “koning” in Gods woorden (9:16 ‘voorganger’); “het land Zuf” | niet hersteld: staat nu als eigen woorden tussen “ ”; “land Zuf” is HSV-weergave |
| 11 | g50 vertelling, kaartstap 1samuel:samuel:7 | “door het lot” (10:20–21 ‘geraakt’) | niet hersteld: gangbare uitleg, interpretatief |
| 11 | g50 Ontdek, item ‘Akkers’ | “Zijn beste akkers …” (8:14: de koning neemt de beste akkers van het volk) | “Jullie beste akkers, wijngaarden en olijfgaarden, voor zijn knechten (8:14).” |
| 11 | kaartstap 1samuel:samuel:7 | ‘Leve de koning!’ (10:24: ‘de koning leve!’; gevonden bij de nacontrole van de omgezette citaten) | ‘De koning leve!’ |
| 12 | g51 vertelling | “Als die niet op tijd komt” | niet hersteld: 13:8 zegt zelf ‘doch Samuël kwam niet te Gilgal’ binnen de bestemde tijd; niet aantoonbaar fout |
| 12 | kaartstap 1samuel:saul-david:0 | “In heel Israël hebben alleen Saul en Jonathan een zwaard” (13:22: het volk dat bij hen was) | “Van het volk bij Saul en Jonathan hebben alleen zij tweeën een zwaard.” |
| 12 | kaartstap 1samuel:saul-david:0 | “Ze verslaan twintig man” (14:14 ‘omtrent twintig’) | “ongeveer twintig man” |
| 12 | kaartstappen 1samuel:saul-david (diverse) | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 12 | kaartstap 1samuel:saul-david:2 | “Eliab is lang en sterk” (‘sterk’ staat niet in 16:6–7) | “Eliab is lang.” |
| 12 | kaartstap 1samuel:saul-david:3 | “Isaï stuurt David naar Gibea” (16:19–21 noemt geen plaats) | “Isaï stuurt David naar Saul” |
| 12 | kaartstap 1samuel:saul-david:3 | “verstandig praat” (SV ‘verstandig in zaken’) | niet hersteld: HSV-weergave (‘verstandig in wat hij zegt’) |
| 12 | kaartstap 1samuel:saul-david:4 | “kaas voor hun bevelhebber” (17:18: tien melkkazen aan de oversten) | “kazen voor de oversten” |
| 12 | kaartstap 1samuel:saul-david:4 | ‘Ik ga.’ als citaat (17:32 luidt anders) | ‘Uw knecht zal heengaan en hij zal met dezen Filistijn strijden.’ |
| 12 | kaartstap 1samuel:saul-david:4 | “de Filistijnen vluchten naar Gath en Ekron” | niet hersteld: verdedigbare samenvatting van 17:52 |
| 12 | g52 vertelling | “De eerste steen treft Goliath” (17:49: ‘een steen’) | “De steen treft Goliath” |
| 12 | g53 vertelling | slotzin uit 19:4 valt buiten de ref | niet hersteld: klopt met de tekst; geen fout |
| 12 | kaartstap 1samuel:saul-david:5 | “Twee keer gooit hij zijn speer” | niet hersteld: verdedigbare lezing van 18:11 met 19:10 |
| 12 | g53 bestaande vraag 4 | “harp” (SV ‘snarenspel’) | niet hersteld: HSV-weergave (‘op de harp’) |
| 13 | kaartstap 1samuel:saul-david:5 | citaat 18:7 zonder ‘maar’ | al omgezet naar “ ” (citaatherstel) |
| 13 | kaartstap 1samuel:saul-david:5 | “Hij geeft David zijn mantel … en ze sluiten een verbond” (verbond 18:3 vóór mantel 18:4) | “Ze sluiten een verbond, en hij geeft David zijn mantel, zijn zwaard en zijn boog.” |
| 13 | kaartstap 1samuel:saul-david:6 | “Achis stuurt hem weg” | niet hersteld: steunt op het opschrift van Psalm 34 (‘die hem wegjoeg’) |
| 13 | kaartstappen 1samuel:saul-david:7, :10; 2samuel:david:0–3 | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 13 | kaartstap 1samuel:saul-david:7 | stap omvat ook 1 Samuël 26 maar vertelt die niet | niet hersteld: onvolledig, geen fout |
| 13 | kaartstap 1samuel:saul-david:10 | “De boogschutters treffen Saul” | niet hersteld: interpretatief (‘troffen hem aan’, 31:3; HSV ‘troffen hem’) |
| 13 | g55 vertelling en kaartstap 1samuel:saul-david:10 | “De volgende dag verliest Israël / wordt Israël verslagen” (afleiding uit 28:19 ‘morgen’) | niet hersteld: uitleggers verschillen; de formulering volgt de letterlijke woorden van 28:19. In de vertelling is dit bovendien het begin van een onderdeel (indeling.js) |
| 13 | kaartstap 2samuel:david:3 | “Ze lachen David uit” (5:6: ‘zij spraken’) | “Ze zeggen tegen David” |
| 13 | kaartstap 2samuel:david:3 | “David krijgt een paleis” (5:11: ‘zij bouwden David een huis’) | “zij bouwen een huis voor David” |
| 13 | g56 Ontdek | titel “David werd drie keer gezalfd”, maar het vierde item (Jeruzalem) is geen zalving | titel “David werd drie keer gezalfd en nam Jeruzalem in. Tik op een plaats.” |
| 14 | kaartstap 2samuel:david:7 | “David vast en bidt zeven dagen op de grond” (12:16–18: hij lag de nacht over op de aarde; het kind stierf op de zevende dag) | “David vast en bidt voor het kind, en ligt ’s nachts op de grond. Op de zevende dag sterft het kind.” |
| 14 | g58 vertelling | “probeert David het te verbergen” | niet hersteld: af te leiden uit 11:6–13 en 12:12 (‘in het verborgen gedaan’) |
| 14 | g59 vertelling | “gaat hij de Olijfberg op. De ark stuurt hij terug” (15:24–30: eerst de ark, dan de Olijfberg) | volgorde omgedraaid |
| 14 | kaartstap 2samuel:david:8 | zelfde omgekeerde volgorde; “De priesters willen de ark meenemen” (zij dragen hem al, 15:24) | “De priesters dragen de ark mee, maar David stuurt hem terug … Huilend en op blote voeten klimt hij de Olijfberg op.”; het geparafraseerde citaat stond al tussen “ ” |
| 14 | kaartstap 2samuel:david:9 | “Twee boodschappers rennen naar Mahanaïm” | niet hersteld: volgt uit 17:24, 27 en 18:24; niet fout |
| 14 | kaartstap 1koningen:salomo:1 | “God is blij met die vraag” (3:10: ‘goed in de ogen des Heeren’; gevoel staat er niet) | “Die vraag is goed in de ogen van de Heere.” |
| 14 | g60 veld `wie` | “Salomo, Koningin” (lijkt afgekapt) | niet hersteld: “Koningin” is de vaste groepsnaam die ook in de kaartstap (`who: [“Koningin”, “van Scheba”]`) voor de kleur/chip wordt gebruikt; geen fout |
| 14 | kaartstap 2samuel:david:4 | “Iedereen zingt en speelt” (zingen staat in 1 Kron. 13:8) | niet hersteld: parallelbericht, niet fout |
| 14 | ‘Abisaï’ (bestaande vragen, personen.js) | SV ‘Abisai’ | niet hersteld: HSV-spelling met trema, zoals op de hele site |
| 15 | kaartstappen 1koningen:salomo:3, :4, :7, :8 | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 15 | kaartstap 1koningen:salomo:3 | “tachtigduizend hakken stenen in het gebergte” (SV ‘houwers op het gebergte’) | niet hersteld: HSV 5:15 spreekt van steenhouwers; niet fout |
| 15 | g61 bestaande vraag “Wat hoorde men niet …” | ontkenningsvraag (schrijfwijzer §4) | niet hersteld: vorm, geen inhoudelijke fout |
| 15 | g61 Betekenis | “God kwam echt wonen in de tempel (1 Koningen 8:10–11)” | niet hersteld: geen fout (vergelijk 8:13; 9:3) |
| 15 | kaartstap 1koningen:salomo:7 | offerhoogten voor “Astoreth, Kamos en Molech” (11:7 noemt alleen Kamos en Molech) | niet hersteld: 2 Koningen 23:13 noemt de hoogte die Salomo voor Astoreth bouwde; de bewering klopt met de Bijbel |
| 15 | kaartstap 1koningen:salomo:7, g62 vertelling en vraag | “zijn nieuwe mantel/kleed” (wiens kleed is niet eenduidig in de SV) | niet hersteld: interpretatief; de HSV leest het als de mantel van Ahia; “mantel” is HSV-woord |
| 15 | g62 vertelling | “ga niet met hen om” (11:2) | niet hersteld: minder precies, niet fout |
| 15 | g62 cross 2 Kronieken 10:15 | ‘Deze omwending …’ met hoofdletter | niet hersteld: alleen de beginletter van het citaat; toegestaan volgens de citaatregel |
| 16 | kaartstap 1koningen:elia:3 | “Heel Israël komt naar de berg Karmel, met de 450 profeten van Baäl en de 400 profeten van de Asjera” (18:19–20: Elia vraagt om beide groepen, de tekst zegt niet dat de 400 kwamen; Achab verzamelt) | “Achab roept heel Israël naar de berg Karmel, met de 450 profeten van Baäl.” |
| 16 | g63 vertelling | “roept Elia heel Israël … bij elkaar” (18:19–20: Achab verzamelt hen op verzoek van Elia) | “roept Elia Achab op om heel Israël en de vierhonderdvijftig profeten van Baäl bij elkaar te brengen” (kop van onderdeel 3 ongewijzigd) |
| 16 | kaartstap 1koningen:elia:0 | “hij maakt een Asjerabeeld” (SV ‘een bos’) | niet hersteld: HSV 16:33 ‘Asjerapaal’; gangbare uitleg |
| 16 | g64 vertelling | “met paarden en wagens” (5:9: ‘met zijn paarden en met zijn wagen’) | “met zijn paarden en zijn wagen” |
| 16 | kaartstap 2koningen:joas:0 | “Athalia wil zelf regeren” (motief staat niet in 11:1) | geschrapt: “Zijn moeder Athalia laat de hele koninklijke familie ombrengen.” (dat zij regeert, staat er verderop al, 11:3) |
| 16 | kaartstap 2koningen:joas:2 | “Als hij vol is” (12:10 ‘veel gelds’); geld rechtstreeks aan de bouwlieden, die “zo eerlijk werken” (12:11, 15: aan de opzichters) | “Als er veel geld in zit … Ze geven het aan de opzichters, en die betalen er de timmerlieden … mee. De opzichters handelen zo trouw dat niemand hoeft na te rekenen …” |
| 16 | g65 bestaande vraag 4 | “wat de bouwlieden met het geld deden” | “wat de opzichters met het geld deden” (12:15) |
| 16 | g65 tijdNoot | verwijzing (2 Koningen 11:4; 12:1) voor ‘Athalia nam de macht in het jaar dat Jehu koning werd’ | (2 Koningen 9:27; 11:1–4; 12:1) |
| 16 | kaartstap 2koningen:ballingschap:0 | citaat 17:18 niet letterlijk | al omgezet naar “ ” (citaatherstel) |
| 16 | g67 vertelling | “Later wordt Hizkia doodziek” (20:1 ‘In die dagen’; 20:6: de bevrijding moest nog komen) | niet hersteld: deze zin is het letterlijke begin van een onderdeel in indeling.js (buiten de toegestane bestanden); aanbevolen: “In die dagen wordt Hizkia doodziek.” met gelijke aanpassing in indeling.js |
| 16 | kaartstap 2koningen:ballingschap:3 | “Later wordt hij daar … gedood” (Ninevé) | niet hersteld: 19:36–37 noemt Ninevé direct ervoor; verdedigbaar |
| 16 | kaartstap 2koningen:ballingschap:2 (en g67 vertelling) | Rabsake “zijn bevelhebber” (18:17: Tartan, Rabsaris en Rabsake samen gestuurd) | kaart: “met onder anderen Rabsake”; vertelling: “Zijn gezant Rabsake” |
| 17 | kaartstappen bij 68, 69, 70, 71 (o.a. 2koningen:ballingschap:6, jona:jona:*, profeten:jeremia:*) | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 17 | g69 Ontdek (kaartvraag) | “een schip naar het westen” (richting staat niet in Jona 1:3) | “een schip naar Tarsis” |
| 17 | g69 bestaande vraag | “Hebreeër” (SV ‘Hebreër’) | niet hersteld: eigen tekst in HSV-spelling, geen citaat |
| 17 | g69 cross Psalm 139:9–10 | twee verzen samengevoegd, hoofdletters | al letterlijk gemaakt (citaatherstel) |
| 17 | g71 vertelling, kaarttekst, personen in profeten.js | “uit de put” (SV ‘kuil’) | niet hersteld: HSV-woord (Jeremia 38:6 ‘put’) |
| 17 | kaartstap profeten:jesaja-troost:1 | “Wie heeft het water met zijn hand gemeten” (God met kleine letter) | “met Zijn hand” |
| 17 | kaartstap profeten:jesaja-troost:0 | ‘Zie, hier is uw God!’ (SV 40:9 zonder komma) | ‘Zie hier is uw God!’ |
| 18 | kaartstappen daniel:daniel:2, :4, :7; ezra:terugkeer:0–6 | parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 18 | g73 bestaande vraag 3 | “dan al zijn wijzen” (1:20: ‘al de tovenaars en sterrekijkers’) | “dan al zijn tovenaars en sterrekijkers” |
| 18 | kaartstap daniel:daniel:2 | “De koning vindt hen tien keer zo knap als al zijn tovenaars” (‘knap’ dubbelzinnig, sterrekijkers ontbreken) | “In alles wat de koning hun vraagt, vindt hij hen tien keer wijzer dan al zijn tovenaars en sterrekijkers.” |
| 18 | kaartstap daniel:daniel:4 | “blijven staan” | niet hersteld: volgt uit 3:6, 12 (niet neervallen, niet aanbidden) |
| 18 | kaartstap daniel:daniel:4 | “God heeft Zijn engel gestuurd” als feit van de verteller (3:28: woorden van Nebukadnezar) | “Nebukadnezar zegt later dat God Zijn engel gezonden heeft.” |
| 18 | kaartstap daniel:daniel:7 | “De anderen zijn jaloers” (6:5: zij zochten gelegenheid) | “De anderen zoeken iets tegen hem” |
| 18 | kaartstap daniel:daniel:7 | “hij is 62 jaar” (6:1 ‘omtrent’) | “hij is ongeveer 62 jaar” |
| 18 | kaartstap daniel:daniel:7 (ook in `look`) | “met zijn raam open” (6:11 ‘open vensters’) | “met open vensters” (2 plaatsen) |
| 18 | kaartstap ezra:terugkeer:1 | “7.337 knechten” en “200 zangers” (2:65: knechten en maagden; zangers en zangeressen) | “7.337 knechten en maagden en 200 zangers en zangeressen” |
| 18 | kaartstap ezra:terugkeer:1 | “Zerubbabel en de priester Jesua gaan voorop” | niet hersteld: zij worden als eersten genoemd (2:2); stijl |
| 18 | kaartstap ezra:terugkeer:4 | “Ze maken het volk bang” | niet hersteld: 4:4 ‘beangstigden hen in het bouwen’ |
| 18 | kaartstap ezra:terugkeer:4 | “Later, onder Ahasveros en Arthahsasta” (uitleggers verschillen of dit latere koningen zijn) | neutraal: “Onder Ahasveros en Arthahsasta schrijven ze ook brieven” |
| 18 | g76 Ontdek ‘Wie deed wat?’ | “De oude priesters en Levieten huilden” (3:12 ook de hoofden der vaderen) | “De oude priesters, Levieten en hoofden der vaderen” |
| 19 | g77 vertelling en kaartstap esther:esther:2 | het lot ‘wijst de dertiende dag van Adar aan’ (3:7 noemt alleen de maand; de dag staat in 3:13) | niet hersteld: interpretatief; 3:7 (‘van dag tot dag, en van maand tot maand’) laat deze lezing toe, vergelijk 9:24 |
| 19 | kaartstap esther:esther:2 | “Iedereen moet voor hem knielen” (3:2: de knechten van de koning in de poort) | “Alle knechten van de koning in de poort moeten voor hem knielen.” |
| 19 | kaartstap esther:esther:7 | “Lopers op snelle paarden” (SV ‘snelle kemelen, muildieren’) | niet hersteld: vertaalverschil; HSV 8:10 spreekt van snelle renpaarden |
| 19 | g78 Ontdek | ‘...’ in het citaat van Charbona | ‘…’ |
| 19 | g81 vertelling | droom van Jozef vóór Maria’s reis naar Elisabeth (volgorde staat niet vast) | niet hersteld: de vertelling beweert geen tijdsvolgorde met zoveel woorden, en de onderdelen liggen vast in indeling.js (buiten de toegestane bestanden) |
| 19 | g81 vertelling | “Maria looft God met een lied” (Lukas 1:46 ‘Maria zeide’) | niet hersteld: gangbare benaming (lofzang), vergelijk de review van batch 11 bij Hanna |
| 19 | g85 cross en Ontdek | ‘Israel’ zonder trema in citaten | al hersteld (citaatherstel) |
| 20 | g86 `tijd`/`tl` (en deel jezus-1:nt-geboorte: `tijd`, `tl`, tijdNoot) | “ca. 6–8 n.Chr.”: twaalf jaar na ca. 6–4 v.Chr. is, zonder jaar 0, ca. 7–9 n.Chr. | g86: tijd “ca. 7–9 n.Chr.”, tl [7, 9]; deel: tijd “ca. 7 v.Chr. – 9 n.Chr.”, tl [-7, 9], tijdNoot “ca. 7–9 n.Chr. (er is geen jaar 0)” |
| 20 | kaartstap jezus-1:nt-begin:0 | ‘Bekeert u, want …’ (SV 3:2 ‘Bekeert u; want’) | ‘Bekeert u; want …’ |
| 20 | kaartstap jezus-1:nt-begin:2 | drie parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 20 | kaartstap jezus-1:nt-begin:2 | ‘bij alle woord dat door’ (komma ontbreekt) | ‘bij alle woord, dat door’ (Matth. 4:4) |
| 20 | g89 bestaande vraag 4 | “Wat deden Simon en Andreas toen ze bij het meer geroepen werden?” → “Ze wierpen een net in de zee” (dat deden ze vóór de roeping; daarna verlieten ze hun netten) | “Wat deden Simon en Andreas toen de Heere Jezus hen bij het meer zag?” (Markus 1:16) |
| 20 | kaartstap jezus-1:nt-begin:3 | ‘Koning Israels’ zonder trema | al hersteld (citaatherstel) |
| 20 | kaartstap jezus-1:nt-begin:3 | ‘Wij hebben gevonden den Messias!’ (uitroepteken staat niet in de SV) | ‘Wij hebben gevonden den Messias.’ |
| 20 | kaartstap jezus-1:nt-begin:3 | “Bethsaïda” (SV ‘Bethsaida’) | niet hersteld: HSV-spelling |
| 20 | g89 bestaande vragen en Betekenis | verwijzingen volgens de nummering van 1888 (Joh. 1:42, 43, 46, 49) | niet hersteld: de site en de controles gebruiken de editie van 1888; geen fout in die nummering |
| 20 | g91 vertelling | ‘Indien’ (SV ‘Indiën’) | al hersteld (citaatherstel) |
| 20 | g93 Ontdek | ‘leraar van Israel’ | al hersteld (citaatherstel) |
| 21 | g95 vertelling | “noemt Hem de Zoon van God, de Allerhoogste” (5:7: ‘Zone Gods, des Allerhoogsten’) | “noemt Hem de Zoon van de allerhoogste God” (de kaarttekst citeerde al letterlijk) |
| 21 | kaartstap jezus-1:nt-galilea:5 | citaat 7:4–5 niet letterlijk; ‘Israel’ zonder trema | al omgezet/hersteld (citaatherstel) |
| 21 | g96 bestaande vraag 1 | goed antwoord “Oudsten der Joden” (SV ‘ouderlingen’) | niet hersteld: HSV ‘oudsten van de Joden’; inhoudelijk juist |
| 21 | kaartstap bij 97 (jezus-1:nt-galilea) | drie parafrases tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 21 | kaartstap jezus-1:nt-galilea:7 | “Op een dag” (Matth. 13:1 ‘te dien dage’) | “Op diezelfde dag” |
| 21 | kaartstap bij 100 | citaat 6:16 niet letterlijk | al omgezet naar “ ” (citaatherstel) |
| 21 | g100 vertelling | “Hij is bang dat Johannes … is opgestaan” (angst staat niet in Markus 6:14–16) | “Hij zegt dat Johannes de Doper uit de doden is opgewekt.” |
| 21 | g100 bestaande vraag 1 | “Waarom schrok Herodes …?” | “Wat dacht Herodes toen hij over de Heere Jezus hoorde?” (antwoorden ongewijzigd) |
| 21 | g101 vertelling | “Er blijven twaalf korven met brokken over, want er mag niets verloren gaan” (verkeerd oorzakelijk verband, Joh. 6:12–13) | “De discipelen verzamelen de overgebleven brokken, opdat er niets verloren gaat: twaalf korven vol.” |
| 21 | bijbeldata psalmen.json (Ps. 34:19 begint met ". ") | | niet hersteld: data/bijbeldata valt buiten de opdracht |
| 22 | kaartstap jezus-2:nt-feesten-jeruzalem:1 | ‘Het is sabbat; u mag uw bed niet dragen.’ | al omgezet naar “ ” (citaatherstel) |
| 22 | g102 vertelling, kaartstap jezus-2:nt-feesten-jeruzalem:0 | “vijf zuilengangen” (SV ‘vijf zalen’) | niet hersteld: HSV-weergave (Joh. 5:2 ‘vijf zuilengangen’) |
| 22 | g104 vertelling | “klimt ergens anders over de muur” (10:1 ‘van elders inklimt’) | “klimt van elders in de schaapskooi” |
| 22 | kaartstap jezus-2:nt-feesten-jeruzalem:5 | ‘Indien’, ‘één’ | al hersteld (citaatherstel) |
| 22 | kaartstap jezus-2:nt-feesten-jeruzalem:5 | “zuilengang van Salomo” (SV ‘voorhof’); onbekend id `olijf` | niet hersteld: HSV-weergave; plaats-id niet wijzigen |
| 22 | kaartstap jezus-2:nt-brood-en-berg:4/5 | ‘Wie zeggen de mensen dat Ik ben?’ ingekort | niet hersteld: letterlijk Markus 8:27 (zelfde gebeurtenis) |
| 22 | kaartstap jezus-2:nt-brood-en-berg:5 | ‘Dit zal U geenszins geschieden!’ (SV met punt) | ‘Heere, wees U genadig! dit zal U geenszins geschieden.’ (Matth. 16:22) |
| 22 | titel g107 en kaartstap jezus-2:nt-reis-naar-jeruzalem:7 | “rijke jongeman” (Markus noemt hem niet jong) | niet hersteld: Mattheüs 19:20, 22 noemt hem ‘jongeling’ (zelfde gebeurtenis); onbekende ids `jvalley`/`nt_jordaanvallei` niet gewijzigd |
| 22 | kaartstap bij 109 | ‘Wie was de naaste van die man?’; ‘beerven’ | al omgezet/hersteld (citaatherstel) |
| 23 | g112 vertelling | “De vader gaat naar buiten en smeekt hem: ‘Kind, gij zijt altijd bij mij …’” (dit is het antwoord op het verwijt, 15:28–31) | “… en smeekt hem. Op zijn verwijt antwoordt de vader: ‘Kind, …’” |
| 23 | g112 Ontdek en Betekenis | oudste zoon stellig gelijkgesteld met de Farizeeën | als uitleg benoemd: “Veel uitleggers denken hierbij aan / zien in de boze oudste zoon een beeld van de Farizeeën …” |
| 23 | kaartstap jezus-2:nt-reis-naar-jeruzalem:5 | “tussen Samaria en Galilea door” (SV ‘door het midden van’) | niet hersteld: HSV-weergave (‘langs de grens van’) |
| 23 | g114 vertelling en kaartstap jezus-2:nt-reis-naar-jeruzalem:6 | “durft (zelfs) niet naar de hemel op te kijken” (18:13 ‘wilde … de ogen niet opheffen’; ‘durven’ voegt een motief toe) | “wil (zelfs) zijn ogen niet naar de hemel opheffen” |
| 23 | g115 tijdNoot | ‘het pascha der Joden nabij’ | al letterlijk gemaakt (citaatherstel) |
| 23 | kaartstap jezus-2:nt-feesten-jeruzalem:7 | Jericho als plaats | niet hersteld: Jericho staat niet in de tekst of `at`, alleen als tussenpunt in de gereconstrueerde route (recon) van de doopplaats naar Bethanië (Joh. 10:40; 11:7); routes niet gewijzigd |
| 23 | kaartstap jezus-2:nt-feesten-jeruzalem:6 | “en toch blijft Hij nog twee dagen” (11:6: ‘zo bleef Hij’; ‘toch’ is uitleg) | “De Heere Jezus heeft Martha, Maria en Lazarus lief. Als Hij hoort dat Lazarus ziek is, blijft Hij nog twee dagen waar Hij is.” |
| 23 | g116 vertelling | ‘Heb goeden moed; sta op; Hij roept u.’ leek woorden van de Heere Jezus (Markus 10:49: de omstanders) | “… laat hem roepen. De mensen zeggen tegen hem: ‘Heb goeden moed; sta op; Hij roept u.’” |
| 23 | kaartstap 10 (bij 116) | onbekend plaats-id `jordanford` | niet hersteld: id/route, geen tekst |
| 23 | g117 cross Exodus 22:1 | “wie een schaap stal, moest er vier teruggeven” (voorwaarde ontbreekt) | “wie een schaap stal en het slachtte of verkocht, moest er vier teruggeven” |
| 24 | g119 Betekenis | “Psalm 69:10: ‘De ijver van Uw huis heeft mij verslonden’” (dat zijn de woorden van Johannes 2:17; Ps. 69:10 heeft ‘verteerd’) | “dachten de discipelen eraan ‘dat er geschreven is: De ijver van Uw huis heeft mij verslonden’ (Johannes 2:17; vergelijk Psalm 69:10)” |
| 24 | kaartstap jezus-3:nt-lijdensweek:5 | ‘Indien Ik u niet wasse’ | al hersteld (citaatherstel) |
| 24 | kaartstap jezus-3:nt-lijdensweek:5 | overlap met kaartstap 6 (voorbereiding van het pascha) | niet hersteld: geen fout |
| 24 | kaartstap jezus-3:nt-lijdensweek:7 | “In een hof die Gethsémané heet” (Matth. 26:36 ‘een plaats’) | niet hersteld: ‘hof’ staat in Johannes 18:1 over dezelfde plaats; niet fout |
| 24 | g124 vertelling, kaartstap jezus-3:nt-lijden:1, Ontdek | ‘den Galileeër’ (SV ‘Galileër’) | al hersteld (citaatherstel) |
| 24 | g125 bestaande vraag | “Om oproer en moord” (SV ‘doodslag’) | niet hersteld: HSV-woord (Lukas 23:19 ‘moord’); inhoudelijk gelijk |
| 25 | g126 vertelling | “Zijn moeder, de zuster van Zijn moeder, Maria de vrouw van Klopas, en Maria Magdalena” (legt vier vrouwen vast; Joh. 19:25 laat drie of vier toe) | letterlijk en neutraal: “Bij het kruis staan ‘Zijn moeder en Zijner moeders zuster, Maria, de vrouw van Klopas, en Maria Magdalena’.” |
| 25 | kaartstap jezus-3:nt-lijden:6 | Gabbatha bij de kruisiging | niet hersteld: Gabbatha staat niet in de tekst of in `at`, maar is het beginpunt van de gereconstrueerde route (recon) van de rechterstoel naar Golgotha (Joh. 19:13–17); routes niet gewijzigd |
| 25 | kaartstap jezus-3:nt-lijden:8 | “ze rollen een grote steen voor de ingang” (Matth. 27:60: Jozef) | “Jozef rolt een grote steen voor de ingang” |
| 25 | kaartstap jezus-3:nt-lijden:8 | “laten de overpriesters de steen verzegelen en zetten er een wacht bij” (27:66: zij verzegelden de steen en verzekerden het graf met de wacht) | “verzegelen de overpriesters de steen en verzekeren het graf met de wacht” |
| 25 | g128 vertelling | “De overpriesters hadden het graf laten verzegelen en bewaken” | “De overpriesters hadden de steen verzegeld en het graf met de wacht verzekerd.” |
| 25 | g129 vertelling | Mattheüs 28:9–10 en Johannes 20:1–18 als één tijdsvolgorde; slotzin “Ondertussen …” | de twee verslagen benoemd: “Mattheüs vertelt: …”, “Johannes vertelt over Maria Magdalena bij het graf.”; slotzin “Volgens Mattheüs geven de overpriesters, terwijl de vrouwen op weg zijn, …” (28:11). Koppen in indeling.js ongewijzigd |
| 25 | kaartstap jezus-3:nt-opstanding:3 | “de deuren op slot” (Joh. 20:19 ‘gesloten’) | “de deuren gesloten” |
| 25 | kaartstap jezus-3:nt-opstanding:5 | titel “Ontbijt bij het meer” (SV ‘middagmaal’, 21:12, 15) | niet hersteld: de maaltijd is ’s morgens (21:4) en ‘middagmaal’ betekent in de SV ‘maaltijd’; niet aantoonbaar fout |
| 25 | kaartstap jezus-3:nt-opstanding:5 | Jeruzalem en `nt_jordaanvallei` | niet hersteld: niet in tekst of `at` (dat is alleen nt_meer); het is de gereconstrueerde route (recon) van Jeruzalem naar Galilea (vgl. Matth. 28:7, 16); routes niet gewijzigd |
| 25 | kaartstap jezus-3:nt-opstanding:8 | Jericho en `nt_jordaanvallei` | niet hersteld: niet in tekst of `at` (Olijfberg, Bethanië); gereconstrueerde terugweg (recon) uit Galilea naar Jeruzalem; routes niet gewijzigd |
| 26 | kaartstappen handelingen:nt-gemeente:1, :8 | eigen samenvatting tussen ‘ ’ | al omgezet naar “ ” (citaatherstel) |
| 26 | kaartstap handelingen:nt-gemeente:4 | “Opnieuw voor de raad zegt Petrus: ‘Men moet Gode …’” (5:29: Petrus en de apostelen) | “zeggen Petrus en de apostelen” |
| 26 | g136 vertelling | “dat niet hun eigen kracht hem gezond maakte” (‘hun’ kan op het volk slaan) | “dat Johannes en hij de man niet door eigen kracht gezond maakten, maar dat het geloof in de Naam van Jezus het deed” (3:12, 16; kop van onderdeel 2 ongewijzigd) |
| 26 | g136 Ontdek | “Salomo's voorhof” (rechte apostrof) | “Salomo’s voorhof” |
| 26 | titel g138 | “de eerste die om de Heere Jezus gedood wordt” (traditie) | niet hersteld: de Bijbel spreekt het niet tegen en noemt eerder geen discipel die om Hem gedood werd; titel ongewijzigd gelaten (zie toelichting) |
| 26 | kaartstap handelingen:nt-gemeente:5 | “de Griekssprekende weduwen” als feit (6:1 ‘Grieksen’) | niet hersteld: HSV 6:1 ‘Griekssprekende Joden’ |
| 26 | g140 vertelling | “ze maakt rokken en kleren voor de weduwen” (9:39 zegt niet voor wie) | “ze maakt rokken en kleren” |
| 26 | kaartstap handelingen:nt-gemeente:10 en g140 Ontdek | “die Dorkas voor hen gemaakt had” | “die Dorkas gemaakt had” |
| 26 | g141 vertelling | “vol dieren die een Jood niet mocht eten” (10:12: al de viervoetige dieren) | “vol viervoetige dieren, ook dieren die een Jood niet mocht eten” |
| 26 | kaartstap handelingen:nt-gemeente:12 | “Petrus' voeten” (rechte apostrof) | “Petrus’ voeten” |
| 27 | kaartstap handelingen:nt-gemeente:13 | Rhode “is zo blij dat ze vergeet de deur open te doen” (12:14: ‘deed van blijdschap de voorpoort niet open’) | “het dienstmeisje Rhode doet van blijdschap de deur niet open” |
| 27 | g142 vertelling | “Petrus denkt eerst dat hij droomt” (12:9: ‘meende, dat hij een gezicht zag’) | “Petrus denkt eerst dat hij een gezicht ziet” |
| 27 | g142 vertelling | “laat Herodes zich … als een god toejuichen” | niet hersteld: past bij 12:22–23 (‘omdat hij Gode de eer niet gaf’) |
| 27 | g143 vertelling | “Ananias is bang” (9:13–14 geeft alleen zijn tegenwerping) | “Ananias werpt tegen dat Saulus veel kwaad gedaan heeft” |
| 27 | kaartstap handelingen:nt-paulus:1 | “Ananias is bang, want hij weet …” | “Ananias antwoordt dat hij gehoord heeft hoeveel kwaad Saulus gedaan heeft” |
| 27 | kaartstap handelingen:nt-paulus:0 | citaat ‘van den weg’ (9:2: ‘die van dien weg waren’) | “mannen en vrouwen ‘die van dien weg waren’” |
| 27 | kaartstap handelingen:nt-paulusrome:2 (+ vraag in hetzelfde deel) | “Paulus' zus” (rechte apostrof) | “Paulus’ zus” (2 plaatsen); dezelfde typografie ook hersteld in een cross-tekst van jezus-2 (“Petrus’ belijdenis”) |
| 28 | g148 vertelling en kaartstap handelingen:nt-paulusrome:6 | “de adder bijt zich vast” (SV ‘vatte zijn hand’) | niet hersteld: vertaalverschil; HSV 28:3 ‘beet zich vast in zijn hand’ |
| 28 | kaartstap openbaring:nt-openbaring:3 | “Bileam” (SV Openb. 2:14 ‘Balaäm’) | niet hersteld: HSV-spelling (‘Bileam’) |
| 28 | kaartstap openbaring:nt-openbaring:4 | “Izebel” (SV ‘Jezabel’); “Thyatira” (SV 1:11 ‘Thyatire’) | niet hersteld: HSV-spelling |
| 28 | g149 vertelling, kaartstap openbaring:nt-openbaring:0 | “Asia” (SV ‘Azië’) | niet hersteld: HSV-spelling, ook kaartnaam |
| 28 | g150 vertelling | “een klein kind zal ze leiden” (SV ‘een klein jongske zal ze drijven’) | niet hersteld: parafrase zonder aanhalingstekens, inhoudelijk gelijk |
