# Notities bij het deel `stammen` (Jozua 13–22)

Boek: Jozua (`public/bijbelreis/inhoud/jozua.js`), deel-id `stammen`, voorvoegsel `st_`. Tien stappen. Geschreven naast de Statenvertaling (controletekst), plaatsen uit OpenBible.info Bible Geocoding Data (CC BY 4.0).

## 1. Nieuwe plaatsen

### Twee steden

| sleutel | naam | `c` | punt | score OpenBible | grond |
| --- | --- | --- | --- | ---: | --- |
| `st_bezer` | Bezer | w | 31.7860, 35.9017 | 442 | Umm el-Amad (24 stemmen), verreweg het meest genoemd; daarnaast Tall Jalul (62), 9 km zuidwestelijk. Onder de grens van 500, maar op dezelfde manier behandeld als Hesbon (433, `w`) en Efraïm (477, `w`) in de audit. Niet gebruikt als kaartvraag. |
| `st_golan` | Golan | w | 32.7811, 35.9347 | 680 | Saham al Jawlan; enige identificatie in OpenBible, de naam bleef bewaard. De sleutel `golan` bestaat al als tussenpunt in `BR.W`. |

### Dertien stamgebieden (`c: "r"`, `t: "gebied"`)

**OpenBible heeft geen punt voor een stamgebied.** De stammen staan daar niet als plaats (alleen streken als Basan, Gilead, Galilea en ‘Mount Ephraim’). Een ‘representatief punt uit OpenBible’ bestaat dus niet. Om toch niets te verzinnen is het label van elk stamgebied gezet op het **middelpunt (gemiddelde van breedte en lengte) van de plaatsen die Jozua bij die stam noemt en die OpenBible met een score van 500 of hoger thuisbrengt**, afgerond op twee decimalen. Alleen plaatsen van het type ‘settlement’ tellen mee; dubbele coördinaten tellen één keer. Er zijn geen grenzen getekend en in `d` staat geen grens als feit. De punten zijn illustratief: ze wijzen de streek aan.

| sleutel | naam | punt | verzen | n | plaatsen (namen van OpenBible) |
| --- | --- | --- | --- | ---: | --- |
| `st_ruben` | Ruben | 31.65, 35.75 | Jozua 13:16–20 | 6 | Aroer 1, Baal-meon, Bamoth-baal, Beth-jeshimoth, Dibon 1, Medeba |
| `st_gad` | Gad | 32.20, 35.69 | 13:25–27; 20:8 | 8 | Beth-haram, Beth-nimrah, Betonim, Debir 3, Mahanaim, Ramoth 3, Succoth 1, Zaphon 1 |
| `st_manasse_oost` | Half Manasse (oost) | 32.74, 36.02 | 13:30–31; 20:8 | 3 | Ashtaroth, Edrei 1, Golan |
| `st_juda` | Juda | 31.50, 34.95 | 15:21–62 | 52 | de stedenlijst van Juda (o.a. Hebron, Debir 1, Lachish, Beersheba 1, Maon, Adullam, Zorah; ook Ekron, Ashdod en Gaza uit 15:45–47) |
| `st_efraim` | Efraïm | 32.02, 35.21 | 16:5–8; 19:50; 20:7; 21:21–22 | 9 | Beth-horon, Upper Beth-horon, Gezer, Janoah 1, Naarah, Taanath-shiloh, Tappuah 1, Shechem, Timnath-heres |
| `st_manasse_west` | Half Manasse (west) | 32.45, 35.25 | 17:7–11 | 8 | Shechem, Tappuah 1, Beth-shan, Ibleam, Dor, En-dor, Taanach, Megiddo |
| `st_benjamin` | Benjamin | 31.86, 35.25 | 18:21–28 | 13 | Jericho 1, Beth-hoglah, Bethel 1, Ophrah 1, Ophni, Geba 4, Gibeon, Ramah 1, Mizpeh 1, Chephirah, Taralah, Jebus, Kiriath-jearim |
| `st_simeon` | Simeon | 31.26, 34.80 | 19:2–8 | 8 | Beersheba 1, Balah, Ezem, Bethul, Ziklag, Beth-marcaboth, Hazar-susah, Beth-lebaoth |
| `st_zebulon` | Zebulon | 32.70, 35.23 | 19:10–15 | 13 | Sarid, Dabbesheth, Jokneam, Chisloth-tabor, Daberath, Japhia, Gath-hepher, Rimmon 3, Hannathon, Kattath, Shimron, Idalah, Bethlehem 2 |
| `st_issaschar` | Issaschar | 32.63, 35.41 | 19:18–22 | 6 | Jezreel 2, Chesulloth, Shunem, Anaharath, Remeth, En-haddah |
| `st_aser` | Aser | 33.01, 35.17 | 19:25–30 | 11 | Allammelech, Amad, Beth-emek, Neiel, Ebron, Hammon 1, Kanah 2, Hosah, Mahalab, Achzib 2, Aphek 1 |
| `st_naftali` | Naftali | 32.89, 35.48 | 19:33–38 | 10 | Heleph, Adami-nekeb, Jabneel 2, Hammath 1, Rakkath, Chinnereth, Hazor 1, Kedesh 5, Yiron, Beth-shemesh 3 |
| `st_dan` | Dan (stamgebied) | 31.88, 34.90 | 19:41–46 | 11 | Zorah, Ir-shemesh, Shaalbim, Aijalon 1, Timnah 1, Ekron, Gibbethon, Baalath 1, Jehud, Bene-berak, Me-jarkon |

Keuzes bij het tellen (ook in `bron` vermeld):

- **Efraïm**: Jericho niet meegeteld. De grens ‘stoot aan Jericho’ (16:7), maar Jericho is een stad van Benjamin (18:21).
- **Half Manasse (west)**: zes van de acht plaatsen lagen volgens 17:11 ‘in Issaschar en in Aser’. Het label staat daardoor wat noordelijk (bij Jibleam). Een beter onderbouwd punt is uit de tekst niet te halen: Jozua 17 geeft voor Manasse geen stedenlijst.
- **Gad**: Hesbon (grenspunt, bij Ruben genoemd in 13:17), Rabba (stad van Ammon) en de zee van Kinnereth niet meegeteld.
- **Aser**: Sidon en Tyrus niet meegeteld (de grens loopt ‘tot aan’ die steden). **Dan**: Jafo niet meegeteld (‘tegenover Jafo’).
- **Half Manasse (oost)**: het streekpunt ‘Bashan’ van OpenBible is hetzelfde punt als Golan (32.7811, 35.9347); daarom hier het middelpunt van de drie genoemde steden.
- `st_juda` heeft `z: 6` (de andere stamgebieden 7.5): anders verdwijnt de naam Juda in het overzicht achter het label van Hebron.

De berekening is te herhalen met de OpenBible-bestanden: per vers de plaatsen met `osises` in het genoemde bereik, beste identificatie op `time_total`.

## 2. Hergebruikte plaatsen

`silo`, `gilgal`, `jericho`, `bethel`, `timnath`, `mamre` (Hebron), `jo_debir`, `salem`, `sichem`, `ri_kedes`, `ramothgilead`, `anathoth`, `sam_bethsan`, `hesbon`, `arnon`, `gilead`, `dan`, `sukkoth`, `megiddo`, `sam_afek`; tussenpunten `sichemvalley`, `ford`, `coast1`, `galil`, `hazor`.

- **Kedes** (`ri_kedes`): hergebruikt zoals opgedragen. De plaats heet daar ‘Kedes-Naftali’, staat op `b` met Khirbet Qedish als andere kandidaat, en de uitleg `d` gaat alleen over Barak (Richteren 4). OpenBible splitst: Kedesh 1 (Jozua 21:32, Tel Kedesh 599) en Kedesh 5 (Jozua 19:37; 20:7, gelijkgesteld aan Kedesh-naphtali, 959; Tel Kedesh 574). Het punt (Tel Kedesh) klopt voor de vrijstad. **Voor de redactie:** overweeg in `d` van `ri_kedes` toe te voegen dat dit ook de vrijstad van Jozua 20:7 is. Ik heb de bestaande regel niet gewijzigd. Niet gebruikt als kaartvraag (`b`).
- **Beth-Sean** (Jozua 17:11, 16) staat op de kaart als ‘Beth-San’ (`sam_bethsan`, de naam uit 1 Samuël 31:10). In het weetje van stap 3 uitgelegd.

## 3. Plaatsen uit de tekst die bewust niet op de kaart staan

- **Het altaar bij de Jordaan** (22:10–11): de tekst zegt alleen ‘aan de grenzen van de Jordaan’. OpenBible koppelt 22:10–11 aan Geliloth (18:17), beste voorstel Araq ed-Deir bij Jeruzalem (352); dat is voor het altaar niet bruikbaar. Geen punt; in het weetje staat dat de plaats onbekend is.
- **Lesem / Laïs** (19:47): is de bestaande plaats `dan`; geen aparte plaats.
- **Kirjath-Sefer**: is Debir (`jo_debir`).
- De honderden steden uit de lijsten (Jozua 15; 18–19; 21) en de grenspunten: niet opgenomen. Een overzichtsdeel wordt daar onleesbaar van; een handvol namen staat in de onthul-blokken.
- **Aroër, Jaëzer, Astharoth, Edreï**: genoemd in tekst of plaatsuitleg, niet als punt in dit deel (`edrei` bestaat; `asterot` is een koningenlaag-plaats uit Genesis 14 en wordt in een deel niet getoond).

## 4. Routes

Alle routes zijn `recon: 1`; de Bijbel noemt alleen begin en eind.

- Stap 2: Hebron → Debir (15:15, ‘van daar toog hij opwaarts’).
- Stap 4: Gilgal → Silo. De tekst zegt niet dat het volk van Gilgal kwam; wel dat het kamp in Gilgal was (10:43; 14:6) en dat de vergadering zich in Silo verzamelde (18:1). In het weetje gezegd. **Twijfelpunt**: wie dit te veel reconstructie vindt, kan de route weghalen zonder de tekst te raken.
- Stap 6: Silo → Timnath-Serah. De tekst zegt alleen dat Jozua de stad bouwde en er ging wonen (19:50). Zelfde kanttekening.
- Stap 9: Silo → land Gilead (22:9), via het Faria-dal en de voorde bij Sukkoth (bestaande tussenpunten). Eindpunt is het gebiedspunt `gilead`.
- Stap 10: Pinehas heen en terug over dezelfde lijn (22:13, 15, 32).
- Stap 5: geen route maar een stippellijn (`later`) van het stamgebied Dan naar de stad Dan, langs Afek, Megiddo en Hazor. Jozua 19:47 noemt geen vertrekpunt; Richteren 18 noemt Zora en Esthaol.

## 5. Personen

- **Nieuw**: `othniel` (Othniël) en `achsa` (Achsa, `v: "kaleb"`), beide `boek: ["jozua"]`, met elf regels in `personen.txt`.
- **Bestaand, boek toegevoegd**: `pinehas` kreeg `"jozua"` in zijn `boek`-lijst.
- **Let op bij samenvoegen**: het deel `ehud-jefta` (Richteren) voegt Othniël mogelijk ook toe. Komt de sleutel `othniel` twee keer voor, dan wint in JavaScript stilzwijgend de laatste en raakt één boek zijn koppeling kwijt (`bijbelreis-personen-check` meldt dat). Voeg dan de `boek`-lijsten samen tot `["jozua", "richteren"]`.
- ‘Othniël, de zoon van Kenaz, de broer van Kaleb’: zo staat het er (15:17); of Othniël of Kenaz de broer van Kaleb is, laat de tekst open. Zo overgenomen, zonder keuze. Kenaz is geen persoon in `BR.mensen`.
- Stamnamen staan **niet** in `who`: Ruben, Gad, Manasse, Simeon, Juda enz. zijn in `BR.mensen` de zonen van Jakob (en ‘Simeon’, ‘Gad’ en ‘Manasse’ zijn naamgenoten in de controle). De stammen staan als `["Volk", "…"]`.
- Geen nieuwe groepsnamen. Gebruikt: Volk, Mannen, Dochters, Oudsten, Levieten, en in de wie-lijst ‘De Levieten’ (staan alle al in `GROEPEN`).

## 6. Datering

`tijd: "ca. 1400 v.Chr."`, `tl: [-1400, -1400]`, `dateringen.js`: `["bijbel", true]`. Grond: Kaleb is 85, 45 jaar na de verspieding (14:7, 10), bij een uittocht ca. 1446 v.Chr. (1 Koningen 6:1). Hoe lang de verdeling duurde en wanneer Jozua 22 speelt, zegt de Bijbel niet; het deel heeft daarom één jaartal en geen eindjaar. Het bestaande deel `land` loopt tot ca. 1375 (ruwe schatting voor de dood van Jozua).

## 7. Twijfelpunten en wat bewust is weggelaten

1. **Stamgebieden zonder OpenBible-punt** (zie §1): de opdracht ging uit van een representatief punt in OpenBible; dat is er niet. De gekozen methode is herleidbaar, maar het blijft een keuze. Alternatief: de stamgebieden niet als plaats opnemen en alleen in de onthul-blokken noemen.
2. **Bezer op `w` met score 442**: aan de onderkant. `o` is ook te verdedigen.
3. **Lengte**: enkele stappen hebben 8–10 zinnen in plaats van 4–7, omdat één stap een of twee hoofdstukken dekt (net als de bestaande Jozua-stappen). De eerste zin staat steeds op zichzelf.
4. **Overlap met het bestaande deel `land`**: stap ‘Kaleb krijgt Hebron’ (14:6–15) en ‘Het land verdeeld’ (13–19) staan daar al. Dit deel herhaalt het verzoek van Kaleb niet en begint bij Jozua 15 met het verdrijven van de Enakieten, Othniël en Achsa. De kaartvragen Silo en (in `land`) Hebron/Sichem overlappen deels; hier is gekozen voor Silo, Timnath-Serah en Ramoth in Gilead.
5. **Weggelaten uit de tekst** (weglaten, niet veranderen): het nog niet veroverde land (13:2–6); Bileam en de vorsten van Midian (13:21–22); Gesur en Maächath (13:13); de grensbeschrijvingen; dat Efraïm en Manasse de Kanaänieten in Gezer, Beth-Sean en andere steden niet verdreven maar schatplichtig maakten (16:10; 17:12–13); dat Achsa haar man aanspoorde en van de ezel sprong (15:18); het aandeel van de andere helft van Manasse (22:7).
6. **‘Jebus’** in het onthul-blok van Benjamin volgt de HSV; de Statenvertaling heeft ‘Jebusi’ (18:28).
7. **‘veertig duizend’** (4:13): of dit getal alleen de tweeënhalve stam betreft, zegt de tekst niet met zoveel woorden; daarom alleen als citaat.
8. **Hebreeën 6:18** (de toevlucht) is niet als kruisverwijzing opgenomen: dat het op de vrijsteden zinspeelt, is uitleg.
9. De bloedwreker als ‘naaste verwant’ (weetje bij stap 7) is woorduitleg; Numeri 35:19 zegt alleen dat de bloedwreker de doodslager mocht doden.

## 8. Controles

`node --check` (vier bestanden), `bijbel-check.py stammen.txt` (0 mis), `bijbel-check.py personen.txt` (0 mis), `bijbelreis-personen-check.mjs` (Geen fouten), `vitest run tests/bijbelreis.test.ts` (geslaagd). Onder zware belasting van de machine liepen twee tests van de reisniveaus (niet door dit deel geraakt) tegen de standaardtijdslimiet van 5 seconden aan; het controlescript zelf slaagt in ongeveer 3 seconden. Het deel is ook in een browser geladen (alle tien stappen, geen consolefouten); zeven stappen zijn als schermafbeelding bekeken.
