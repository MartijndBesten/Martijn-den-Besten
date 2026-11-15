# Notities bij het deel `hizkia-josia` (2 Kronieken 29–35)

Boek: 2 Kronieken (`public/bijbelreis/inhoud/2kronieken.js`), na het deel `josafat`. Tien stappen. Controletekst: Statenvertaling via `node scripts/sv.mjs`; het hele gedeelte 29–35 is gelezen. Plaatsen: OpenBible.info Bible Geocoding Data via `scripts/reizen/plaats-zoek.py`.

## Opzet

| # | Stap | Verwijzing | Wat Kronieken toevoegt aan 2 Koningen |
| --- | --- | --- | --- |
| 1 | De deuren gaan weer open | 29:1–19 | reiniging van de tempel (niet in Koningen) |
| 2 | Het lied begint opnieuw | 29:20–36 | offers en gezang (niet in Koningen) |
| 3 | Lopers van Berseba tot Dan | 30:1–12 | uitnodiging voor het Pascha (niet in Koningen) |
| 4 | Het Pascha in de tweede maand | 30:13–27 | Pascha van Hizkia (niet in Koningen) |
| 5 | Sanherib: met ons is de HEERE | 32:1–23 | kort; bronnen afgesloten, toespraak, gebed van Hizkia en Jesaja |
| 6 | Manasse: naar Babel en terug | 33:1–20 | gevangenschap, gebed en terugkeer (niet in Koningen) |
| 7 | Josia reinigt het land | 33:21–34:7 | het achtste en het twaalfde jaar; tot in Naftali |
| 8 | Het wetboek gevonden | 34:8–33 | overlapt met 2 Koningen 22–23 |
| 9 | Het Pascha van Josia | 35:1–19 | uitvoerig (in Koningen drie verzen) |
| 10 | Josia en Necho in het dal van Megiddo | 35:20–27 | Karchemis, de boodschap van Necho, het klaaglied van Jeremia |

De overlap met `2koningen:ballingschap` (stappen ‘Sanherib komt’, ‘De Engel in het legerkamp’, ‘Josia vindt het wetboek’, ‘Josia sneuvelt bij Megiddo’) is klein gehouden: hier staat alleen wat Kronieken zegt; de feiten en getallen uit Koningen (185.000, de dreigbrief, de pilaar) staan er niet opnieuw in, alleen als verwijzing in een weetje.

## Nieuwe plaatsen

| Sleutel | Naam | `c` | Punt | OpenBible | Grond |
| --- | --- | --- | --- | --- | --- |
| `hj_karchemis` | Karchemis | v | 36.8297, 38.0150 | Carchemish = Jerablus, score 880, punt op de tell | Geen tegenkandidaat. Zelfde plek als het contextlabel `karkemis` en het tussenpunt `karkw`. |
| `hj_efraim` | Efraïm | r | 32.05, 35.10 | geen (stamgebied) | Jozua 16:5–10; label tussen Timnath-Serah (Jozua 19:50) en Silo (Shiloh, 1000). |
| `hj_manasse` | Manasse | r | 32.43, 35.10 | geen (stamgebied) | Jozua 17:7–11 (westelijke helft); label tussen Sichem (1000) en Megiddo (1000). |
| `hj_zebulon` | Zebulon | r | 32.78, 35.24 | geen (stamgebied) | Jozua 19:10–16; tussen Sarid (760), Gath-Hefer (789) en Hannathon (847). |
| `hj_aser` | Aser | r | 32.98, 35.15 | geen (stamgebied) | Jozua 19:24–31; tussen Acco (1000) en Achzib (794). |
| `hj_naftali` | Naftali | r | 33.05, 35.45 | geen (stamgebied) | Jozua 19:32–39; bij Hazor (928) en Kedes (599). |
| `hj_simeon` | Simeon | r | 31.30, 34.70 | geen (stamgebied) | Jozua 19:1–9; tussen Berseba (Beersheba 1, 823) en Ziklag. |

Tussenpunten (`BR.W`): `hj_zebw` [32.72, 35.29] en `hj_nafw` [32.97, 35.50]: het eind van de getekende route in Zebulon en in Naftali, net naast het label, zodat de lijn niet door de naam loopt.

De zes stamgebieden zijn **geen punten uit OpenBible**: OpenBible kent de stamgebieden niet als plaats. Ze staan daarom als gebied (`c: "r"`), met het label tussen plaatsen die Jozua 16–19 bij die stam noemt (die plaatsen zijn wél in OpenBible opgezocht; scores hierboven). De ligging van het label is dus illustratief. Schrijft het deel `stammen` eigen stamgebieden, dan kan de integrator deze zes daarmee samenvoegen.

Hergebruikt: `salem`, `berseba`, `dan`, `lachis`, `megiddo`, `babelst`, `bethel` en `sichem` (alleen in routes), `egypte`, en als context `samaria`, `ninivest`, `damascusst`.

### `karkemis` (gevraagd om te controleren)

`karkemis` bestaat, maar is een **contextlabel** (`ctx: 1`): zonder `c`, `t` en `d`, zonder pop-up, en de app telt het niet mee als plaats van een stap. Een tikvraag kan er niet op (die vraagt `c` v of w). Daarom staat hier een volwaardige plaats `hj_karchemis` op dezelfde plek (OpenBible 880). De naam is ‘Karchemis’ (Statenvertaling en HSV in 2 Kronieken 35:20); het contextlabel spelt ‘Karkemis’. De integrator kan kiezen: `karkemis` opwaarderen en `hj_karchemis` laten vervallen, of beide laten staan (ze verschijnen nooit samen: dit deel heeft `karkemis` niet in `ctx`).

## Plaatsen uit de tekst die bewust niet op de kaart staan

| Plaats | Vers | Reden |
| --- | --- | --- |
| Beek Kidron | 29:16; 30:14 | OpenBible 1000 [31.7803, 35.2400], maar op deze schaal valt het punt samen met Jeruzalem. `kidron` bestaat bovendien al als tussenpunt. Staat wel in de tekst. |
| Gihon | 32:30; 33:14 | OpenBible 1000 [31.7729, 35.2364]; zelfde reden. Genoemd in het weetje bij stap 5. |
| Ooststraat, Millo, stad van David, Ofel, Vispoort, het tweede deel | 29:4; 32:5; 33:14; 34:22 | Plekken binnen Jeruzalem; niet te onderscheiden op de kaart. Niet in de tekst genoemd (Hulda ‘woont in Jeruzalem’). |
| Dal van de zoon van Hinnom | 33:6 | Binnen het kaartpunt Jeruzalem; het kinderoffer is niet verteld (zie hieronder). |
| Issaschar | 30:18 | Alleen genoemd bij wie niet gereinigd was; staat in de tekst, zonder label (anders zeven stamlabels). |
| Juda, Benjamin | passim | Het eigen land van de koning; geen label nodig. |
| Assyrië | 30:6; 32; 33:11 | Staat als contextplaats Ninevé (`ninivest`) op de kaart. |
| De Frath (Eufraat) | 35:20 | Rivier in de ondergrond van de kaart. |

## Routes

Alle routes zijn reconstructies (`recon: 1`); de tekst noemt alleen plaatsen.

- **Stap 3, lopers:** Jeruzalem → Bethel → bergrug → Sichem → vlakte van Jizreël → Zebulon. De tekst zegt: ‘van stad tot stad, door het land van Efraïm en Manasse, tot Zebulon toe’ (30:10). Berseba en Dan lichten alleen op als de grenzen van de oproep (30:5); er loopt geen lijn heen, want de tekst zegt niet dat de lopers daar kwamen.
- **Stap 5, knechten van Sanherib:** Lachis → Eikdal → Bethlehem → Jeruzalem (rood). Dit wijkt af van de lijn in `2koningen:ballingschap` (`lachis, sorek, bethlehem, salem`), die een haak naar het noorden maakt. De weg door het Eikdal is een bekende opgang; de integrator kan beide gelijk trekken.
- **Stap 6, Manasse:** Jeruzalem → Damascus → Ribla → Tadmor → Eufraat → Babel, en dezelfde weg terug. Zelfde tussenpunten als de wegvoering in 2 Koningen (omgekeerde volgorde van de heenweg van Nebukadnezar).
- **Stap 7, Josia:** Jeruzalem → Sichem → Jizreël → Naftali en terug (34:7: ‘daarna keerde hij weder naar Jeruzalem’). Simeon ligt in het zuiden; daar loopt geen lijn heen, want de volgorde is onbekend.
- **Stap 10:** Necho van Egypte langs de kust naar Megiddo (rood; zelfde lijn als in 2 Koningen). Josia van Jeruzalem naar Megiddo en terug. Het vervolg van Necho naar Karchemis is een stippellijn (`later`), via Ribla: daar is hij volgens 2 Koningen 23:33 kort daarna.
- **‘Hoe ver?’:** ‘Alles’ telt in de app alleen de routes in de kleur van het deel (lopers, Manasse, Josia), niet de rode legerroutes.

## Personen

Geen nieuwe personen. Het boek-id `2kronieken` is toegevoegd aan de `boek`-lijst van: `hizkia`, `jesaja`, `sanherib`, `manasse_juda`, `amon`, `josia`, `hilkia`, `safan`, `hulda`, `necho`, `jeremia`. Verder is aan die regels niets veranderd; er zijn dus geen nieuwe verwijzingen in `personen.js` en geen nieuwe regels in `personen.txt` nodig.

Geen nieuwe groepsnamen (gebruikt: Priesters, Levieten, Zangers, Volk, Leger, Lopers; rol: Engel).

Kleuren (één regel onder de markering): Manasse bruin, Amon grijs, Hulda koraal, Necho rood. Let op: `BR.personen` werkt op naam, dus ‘Manasse: bruin’ geldt ook als de zoon van Jozef ooit in een `who` komt.

### Eén regel buiten de markeringen: `VERWACHT`

`Manasse` en `Hilkia` staan in `NAAMGENOTEN` van `scripts/bijbelreis-personen-check.mjs`. De controle eist dan per boek een regel in `VERWACHT` (‘leg in VERWACHT vast welke persoon hier bedoeld is’); zonder die regel slaagt §7 niet. Daar is geen markering voor. Ik heb **één nieuwe regel** toegevoegd, direct onder de regel met `"2koningen|Hilkia"`, met een eigen markering in het commentaar:

```js
"2kronieken|Manasse": "manasse_juda", "2kronieken|Hilkia": "hilkia", // [meer-reizen:hizkia-josia] verwacht: …
```

Er is geen bestaande regel gewijzigd. Het alternatief (een andere naam in `who`, zoals ‘Manasse van Juda’) vraagt een alias in `personen.js` en leest slechter.

## Datering

`tijd: "ca. 715–609 v.Chr."`, `tl: [-715, -609]`, `dateringen.js`: `["historie", false]`, gelijk aan `2koningen:ballingschap`.

- Het einde (609 v.Chr., de dood van Josia) is het vastst.
- Het begin is het zwakke punt: 715 v.Chr. volgt uit 2 Koningen 18:13 (veertiende jaar van Hizkia = 701); 2 Koningen 18:1 en 18:9–10 wijzen op ca. 729–726. Dat staat in `tijdNoot`. **Twijfelpunt:** de redactie kan de vlag `onzeker` op `true` zetten; ik heb de lijn van het bestaande deel over dezelfde koningen gevolgd.
- De jaartallen 701, 622 en 609, de naam Thiele, de Babylonische kroniek en de Assyrische lijsten met Manasse (weetje bij stap 6) komen uit algemene vakkennis; ze zijn in deze sessie **niet** in een externe bron nagezocht. Graag door de redactie laten nalopen.

## Twijfelpunten

1. **‘bij Karchemis’ (35:20).** De Statenvertaling zegt ‘om te krijgen tegen Karchemis’; de HSV heeft, voor zover ik weet, ‘bij Karchemis’ (de HSV-tekst was in deze sessie niet beschikbaar om na te zien). De tekst gebruikt ‘bij’; de controleregel toetst de woorden van de Statenvertaling.
2. **Waar stierf Josia?** 2 Kronieken 35:24: ze ‘brachten hem te Jeruzalem; en hij stierf’; 2 Koningen 23:30: ze ‘voerden hem dood … van Megiddo’. De tekst volgt de volgorde van Kronieken zonder ‘daar’ of ‘onderweg’.
3. **Simeon (34:6).** Simeon lag volgens Jozua 19 in het zuiden, in Juda; in 34:6 staat het tussen de noordelijke stammen. Uitleggers verklaren dat verschillend. Het label staat waar Jozua 19 de stam plaatst; de tekst zegt niets over de reden.
4. **Het wetboek.** ‘Veel uitleggers denken aan Deuteronomium’ staat als uitleg (`fs: "u"`), niet als feit.
5. **Zacharia 12:11** (kruisverwijzing): de koppeling met de rouw over Josia staat er als mening van ‘veel uitleggers’.
6. **Stap 7, eerste zin.** De dood van Amon (33:21–25) staat in een bijzin achter ‘Josia wordt koning’, zodat de eerste zin voor jonge kinderen over Josia gaat. De volgorde van de tekst is daar dus licht omgekeerd.
7. **Manasse en Babel.** De Bijbel zegt niet in welk jaar en onder welke Assyrische koning; het weetje zegt dat ook.
8. **‘Manasse regeerde langer dan alle andere koningen’** (`stat`): nagegaan met de regeringsjaren in de Statenvertaling; de naaste zijn Uzzia (52), Jerobeam II en Asa (41), David, Salomo, Joas en Saul (40). Die regels staan in het controlebestand.
9. **Lengte.** Enkele stappen hebben acht zinnen in plaats van zeven (3, 6, 8) en stap 10 tien korte; de citaten tellen mee. Inkorten kan, maar dan valt er een bericht uit de tekst weg.
10. **Boekkop van 2 Kronieken.** `tijd` en `intro` van het boek noemen nog alleen Josafat (‘ca. 853–848 v.Chr.’). Dat is aan de integrator.

## Bewust weggelaten

- De namen van de Levieten (29:12–14) en van de opzieners (31:12–15; 34:12; 35:8–9).
- Hoofdstuk 31, behalve 31:1 en de ‘hopen’ in het weetje bij stap 4: de indeling van priesters en Levieten en de voorraadkamers.
- Hizkia’s ziekte, zijn hoogmoed en de gezanten van Babel (32:24–31): staat uitvoeriger in 2 Koningen 20; in de kruisverwijzing genoemd.
- De muurbouw van Hizkia (32:5) en van Manasse (33:14).
- Dat Manasse zijn zonen door het vuur liet gaan en toverij bedreef (33:6): de tekst zegt wel dat hij kwaad deed, afgoden diende en een beeld in de tempel zette. De redactie kan 33:6 toevoegen; ik heb het bij ‘hoogten, altaren en een gesneden beeld’ gelaten om de stap kort te houden.
- Het verstrooien van het gruis op de graven en het verbranden van de beenderen (34:4–5).
- De getallen van de offers van het volk (29:32–33; 30:24) en van de vorsten (35:8–9).
- De spelling ‘Jehizkia’ van de Statenvertaling in Kronieken: de tekst zegt overal Hizkia.
- De woorden ‘onder de doornen’ (33:11): onduidelijk voor kinderen en verschillend vertaald.

## Controles

```
node --check (2kronieken.js, plaatsen.js, personen.js, dateringen.js)        geslaagd
python3 scripts/bijbel-check.py scripts/bijbel-controle/hizkia-josia.txt      213 gecontroleerd, 0 mis
python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt          1232 gecontroleerd, 0 mis
node scripts/bijbelreis-personen-check.mjs                                     Geen fouten.
npx vitest run tests/bijbelreis.test.ts                                        29 geslaagd, 1 overgeslagen (BIJBELREIS_150, stond al zo)
```

Daarnaast is de pagina lokaal in een browser geopend (stappen 3, 5, 6, 7, 8 en 10): geen consolefouten; routes en labels bekeken en de labels van Manasse, Efraïm, Zebulon en Naftali verschoven zodat ze niet op de lijn of op ‘Jordaan’ staan.
