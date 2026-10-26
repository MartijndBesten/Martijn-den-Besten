# Controleverslag batch 12 (geschiedenissen 51–53)

Ik ben de tweede lezer van deze batch. Elke versie (a, b, c) heb ik zin voor zin vergeleken met de Statenvertaling in de invoer. De verwijzingen buiten de invoer heb ik opgezocht in `public/bijbelreis/bijbel/*.json`: 1 Samuël 10:8, 19:4, 20:42, 21:1–10, 22:10, 23:14–18, 25:2; Exodus 17; Deuteronomium 25:17–19; Jozua 15:55; Psalm 20:8; Handelingen 13:21; 2 Samuël 5:4. Alle citaten in de versies kloppen letterlijk met de SV.

- **Controlescript:** `OK: 3 geschiedenis(sen), 9 versies.`
- **Status:** alle 9 versies staan op `gecontroleerd`. Er is niets op `concept` gebleven.
- **Telling:** 11 inhoudelijke fouten hersteld. Kleine verbeteringen voor leesbaarheid en lengte staan apart vermeld en tellen niet mee.
- **Opmaak:** het JSON-bestand is opnieuw weggeschreven met een inspringing van 2 spaties. Daardoor staan de a-delen nu over meerdere regels verspreid. Aan de structuur is niets veranderd.

## 51 — Saul verworpen, David gezalfd

**Hersteld:**
1. **A, `plaatsen`**: `gibea` is verwijderd (twijfelpunt 2). Gibea komt in de A-tekst niet voor, en 1 Samuël 16 noemt geen plaats voor de harpscène. Nu staat er `["gilgal", "efrath"]`.
2. **B, kop deel 1**: "Saul wacht niet op Samuël" sprak de tekst eronder tegen. Saul wacht namelijk wel zeven dagen (13:8). De kop is nu "Saul wacht niet tot Samuël komt".
3. **B, deel 2**: het citaat ‘gehoorzamen is beter dan slachtoffer’ stond er zonder uitleg. Een kind van 8 leest ‘slachtoffer’ als iemand die iets ergs overkomt. Toegevoegd: "(een offer van een dier)".
4. **B, deel 4 en vraag 5**: de vraag "Waarom kwam David bij koning Saul? → Hij kon goed op de harp spelen" had geen steun in de B-tekst. Daar stond alleen "David wordt zijn harpspeler". Deel 4 vertelt nu dat Sauls knechten iemand zoeken die goed harp speelt, en dat David zo bij Saul komt (16:16–19). Ook de ‘boze geest van de HEERE’ (16:14) staat er nu sober bij, zoals in de bestaande vertelling.
5. **C, blok 1**: "het volk liep weg en de Filistijnen kwamen (13:11–12)" klopte niet. Saul zegt in 13:12 dat de Filistijnen ‘zullen … afkomen’. Het is nu "de Filistijnen zouden naar Gilgal komen".
6. **C, blok 1**: de volgorde was verkeerd. Eerst stond Sauls belijdenis (15:24), daarna "Samuël antwoordt: … (15:22)". Maar 15:22 is het antwoord op 15:20–21 en komt dus vóór 15:24. De volgorde is omgedraaid: "Pas daarna zegt Saul: …".
7. **C, blok 1 en vraag 1**: dat 1 Samuël 10:8 over de gebeurtenis in hoofdstuk 13 gaat, stond er als feit. Tussen die twee ligt 11:14–15, en uitleggers verschillen over het verband. Nu staat er "Veel uitleggers verbinden het wachten in Gilgal met wat Samuël eerder tegen Saul zei". Ook toegevoegd: wat 13:8 zelf zegt, namelijk ‘tot den tijd, dien Samuël bestemd had’. De vraag luidt nu "Hoeveel dagen moest Saul volgens 1 Samuël 10:8 in Gilgal wachten?", met `why` 1 Samuël 10:8.
8. **C, blok 3**: dat het Karmel van 15:12 bij Maon ligt, stond er als feit (twijfelpunt 3). Het is nu "wordt meestal gezien als de stad Karmel bij Maon in Juda (vergelijk Jozua 15:55; 1 Samuël 25:2)". Jozua 15:55 is ook aan `refs` toegevoegd.

**Kleine verbeteringen (niet meegeteld):**
- A, stap 3: "Samuël zegt: Saul heeft niet gedaan …" is nu directe aanspraak: "Samuël zegt tegen Saul: je hebt niet gedaan …".
- B, vraag 4: het foute antwoord "David werd die dag koning in Gibea" is vervangen door "Saul nam David mee naar Gibea". Het oude antwoord lag te dicht bij de tekst "Samuël zalft hem tot koning".
- B is ingekort om binnen 1000 tekens te blijven (nu 999). Daarbij zijn "De Filistijnen staan klaar" en "Koning" voor Saul weggevallen.

**Bewust zo gelaten:**
- Twijfelpunt 1 (A, stap 7, "mensen kijken naar de buitenkant"): als navertelling zonder aanhalingstekens is dit een juiste weergave van 16:7.
- Twijfelpunt 4 (C, "Opmerken betekent hier: aandachtig luisteren"): dit is als woordverklaring gemarkeerd en past bij de parallel met ‘gehoorzamen’ in hetzelfde vers. Het blijft staan.
- A noemt de boze geest niet; `samen` verwijst ernaar met 16:14. Dat past bij §3.

## 52 — David en Goliath

**Hersteld:**

9. **B, vraag 4** ("Wat zou de hele aarde weten, volgens David?"): 17:46 stond nergens in de B-tekst. Toegevoegd in deel 3: "Hij zegt ook: ‘de ganse aarde zal weten, dat Israël een God heeft.’"
10. **C, blok 3 en vraag 4, verzennummering**: de verwijzing "1 Samuël 21:9" voor het zwaard van Goliath klopt alleen in de SV-nummering van de Bijbeldata. In uitgaven met Hebreeuwse nummering, zoals de HSV, is dit 21:10. Daarom staan `why` en de verwijzing in de tekst nu op "1 Samuël 21:9–10", en `refs` op "1 Samuël 21:1–10". Die verwijzingen kloppen in beide nummeringen.

**Kleine verbeteringen (niet meegeteld):**
- C, blok 1: "1 Samuël 17:33" toegevoegd aan `refs`. Het blok citeert dat vers.
- A, `samen`: "waarom is David niet bang?" is nu "waarom durft David naar Goliath te gaan?". De tekst zegt niet dat David niet bang is; 17:32 en 17:37 gaan over zijn moed en vertrouwen.
- B: om binnen 1000 tekens te blijven (nu 997) zijn deel 1 en deel 3 licht herschreven. Er is niets inhoudelijks weggevallen.

**Bewust zo gelaten:**
- Twijfelpunt 5 ("een heel grote soldaat" in plaats van ‘reus’): juist, want ‘reus’ staat niet in 1 Samuël 17.
- Twijfelpunt 6 (C, "In tekeningen wordt David soms als klein jongetje getoond"): dit blijft staan. Het hoort bij het bloktype ‘Wat de tekst zegt en wat niet’, het is voorzichtig geformuleerd ("soms") en de tekst ernaast weerlegt het (17:42; 16:18). Er wordt geen bron of feit over beeldtraditie geclaimd. Wil de redactie geen uitspraken over beeldtraditie, dan kan de zin weg zonder dat het blok iets verliest.
- Twijfelpunt 7 (Saul en ‘Wiens zoon is deze jongeling’): er wordt geen kant gekozen. Dat is in orde.
- B, vraag 1: het antwoord "De HEERE had hem gered van de leeuw en de beer" volgt 17:37 en staat zo in de B-tekst.

## 53 — Jonathan en David

**Hersteld:**

11. **C, blok 3**: "Bij Jonathan zijn dan al duizend man (13:2)" klopte niet. Die duizend man zijn er aan het begin van hoofdstuk 13. Op het moment van de klim zijn er bij Saul nog omtrent zeshonderd (13:15; 14:2), en Jonathan gaat alleen met zijn wapendrager. Nu staat er: "Eerder had Jonathan duizend man bij zich in Gibea (13:2); nu zijn er bij Saul nog omtrent zeshonderd (13:15; 14:2)." 13:15 is aan `refs` toegevoegd.

**Kleine verbeteringen (niet meegeteld):**
- B, deel 3: "spies" heeft de uitleg "(een speer)" gekregen. Een kind van 8 kent ‘spies’ vooral van eten.
- B, deel 2: om ruimte te maken is "een plechtige belofte van trouw" ingekort tot "een plechtige belofte".

**Bewust zo gelaten:**
- A, stap 3, en B (deel 1 en vraag 2) zeggen dat beiden "op handen en voeten" klommen. Letterlijk zegt 14:13 dat Jonathan op handen en voeten klom, ‘en zijn wapendrager hem na’. Dat ‘hem na’ op dezelfde manier is, is een voor de hand liggende lezing. Ik heb het niet veranderd.
- Twijfelpunt 8 ("muziek maken" voor ‘snarenspel’, en ‘speer’ bij A): dat is een getrouwe weergave.
- Twijfelpunt 9 ("Dan laat God alles beven"): aanvaardbare parafrase van 14:15 (‘een beving Gods … het land werd beroerd’).
- A, `samen`: de notities zeggen dat ook Sauls plan met de Filistijnen (18:17, 21, 25) in `samen` staat, maar dat is niet zo. Weglaten bij A is hier geen probleem. Michal wordt genoemd; dat volstaat.
- C, blok 2 citeert 19:4 en 23:17. Die worden ook al genoemd in de laatste zin van de vertelling en in de Betekenis. Het blok voegt wel 20:42 en 23:18 toe en geeft de letterlijke tekst. Het blijft staan.

## Fouten in de bestaande vertelling en kaartteksten (niet zelf hersteld)

De punten die de schrijver al in de notities noemt, heb ik nagelezen. Ze kloppen. Het gaat om:
- 51, vertelling: "niet op tijd komt";
- 51, kaarttekst: "lang en sterk", "naar Gibea" en "verstandig praat";
- 52, kaarttekst: "kaas voor hun bevelhebber" en "‘Ik ga.’";
- 53, vertelling: 19:4 valt buiten de ref;
- 53, kaarttekst: "Twee keer gooit hij zijn speer";
- 53, bestaande vraag 4: "harp".

Zelf vond ik daarnaast:
- **51, kaarttekst stap 0**:
  - "In heel Israël hebben alleen Saul en Jonathan een zwaard": 13:22 gaat over ‘het ganse volk, dat bij Saul en bij Jonathan was’, niet over heel Israël.
  - "Ze verslaan twintig man": in 14:14 staat ‘omtrent twintig mannen’.
  - De zinnen tussen aanhalingstekens (‘Je koningschap zal niet blijven …’, ‘Voor de HEERE maakt het niet uit …’) zijn parafrasen en geen SV-citaten. Dat geldt ook voor de andere kaartteksten. Dit kan een bewuste stijlkeuze voor de kaart zijn, maar het wijkt af van §2 (citaat = letterlijk).
- **52, vertelling**: "De eerste steen treft Goliath" voegt iets toe. 17:49 zegt alleen ‘hij nam een steen daaruit’. ‘De eerste’ suggereert dat er meer stenen geworpen werden of klaarlagen voor gebruik.
- **52, kaarttekst**: "de Filistijnen vluchten naar Gath en Ekron". 17:52 zegt dat Israël hen vervolgde tot aan de poorten van Ekron en dat de gewonden vielen tot aan Gath en Ekron. Dat is een verdedigbare samenvatting, maar niet letterlijk.
