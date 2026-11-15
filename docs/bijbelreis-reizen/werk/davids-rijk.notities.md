# Notities bij het deel `davids-rijk` (2 Samuël 5:17–25; 8; 10)

Boek: `public/bijbelreis/inhoud/2samuel.js`. Tien stappen. Bronnen: Statenvertaling (controletekst) voor 2 Samuël 5, 8 en 10 en
1 Kronieken 14, 18 en 19; OpenBible.info Bible Geocoding Data voor de plaatsen. Alle controles uit §7 slagen
(`davids-rijk.txt`: 128 regels, 0 mis).

## Nieuwe plaatsen

| Sleutel | Naam | `c` | Punt (lat, lng) | Score OpenBible | Grond |
| --- | --- | --- | --- | --- | --- |
| `dr_refaim` | Dal Refaïm | v | 31.7632, 35.2191 | 1000 | Valley of Rephaim = Wadi el-Ward bij Jeruzalem; een dal, het punt ligt erin (`t: gebied`, zoals het Eikdal). |
| `dr_baalperazim` | Baäl-Perazim | o | 31.7419, 35.1833 | 240 | Alleen zwakke voorstellen: ez-Zuhur 240, Abu Tor 99, Gilo 63. Punt bij het beste voorstel, illustratief. |
| `dr_gezer` | Gezer | v | 31.8592, 34.9192 | 942 | Tel Gezer, geen tegenkandidaat. |
| `dr_zoba` | Zoba | r | 33.9353, 36.1508 | gebied (1000 als streek) | Koninkrijk; OpenBible geeft alleen een plaatsaanduiding in de Bekaa. Grenzen onbekend. |
| `dr_hamath` | Hamath | v | 35.1365, 36.75 | 957 | Hama. `hamath` bestond al als tussenpunt in `BR.W`, daarom een eigen sleutel. |
| `dr_zoutdal` | Zoutdal | b | 31.0505, 35.4063 | 451 | es-Sebkha ten zuiden van de Dode Zee; `alt`: Wadi el-Milh bij Berseba (340), ruim 35 km verder. |
| `dr_medeba` | Medeba | v | 31.7161, 35.7955 | 1000 | Madaba. `medeba` bestond al als tussenpunt in `BR.W`. Alleen in 1 Kronieken 19:7 genoemd. |
| `dr_tob` | Tob | w | 32.5633, 36.2439 | 651 | et-Tayyibeh; het andere voorstel (Iraq el-Amir) scoort 18. |
| `dr_maacha` | Maächa | r | 33.2581, 35.581 | gebied (1000 als streek) | Koninkrijk; het punt van OpenBible ligt bij Abel-Beth-Maächa. |
| `dr_helam` | Helam | o | 32.75, 36.2408 | 335 | Alma in de Hauran; andere voorstellen 128 (tussen Damascus en Hamath) en 84 (Aleppo). Illustratief. |

Nieuw tussenpunt: `dr_gileadweg` [32.2, 35.82] (bocht in de route door Gilead naar Helam).

Hergebruikt: `salem`, `gibeon`, `gath`, `bethlehemmoab` (Velden van Moab, als gebied Moab), `seir` (Seïr/Edom), `damascusst`,
`rabba`, `jericho`, `sichem` (alleen als routepunt) en bestaande tussenpunten.

## Plaatsen uit de tekst die niet op de kaart staan

- **Geba** (5:25). OpenBible houdt het Geba van dit vers voor Gibeon (767; 1 Kronieken 14:16 leest ‘van Gibeon af’); Geba = Jaba
  scoort voor dit vers 101. De lijn begint daarom bij het bestaande `gibeon`; de stap vertelt ‘van Geba af’ en het weetje noemt
  het verschil.
- **De burcht** (5:17): de tekst zegt niet welke. Niet ingevuld (Sion of de vesting bij Adullam, vgl. 23:13–14).
- **Metheg-Amma** (8:1): onbekend (OpenBible 403 via Gath, uit 1 Kronieken 18:1). Geen punt; `gath` licht op en het weetje legt uit waarom.
- **Betah en Berothai / Tibchath en Chun** (8:8; 1 Kronieken 18:8): alleen zwakke of vage voorstellen (Tibchath 454 met een
  onnauwkeurigheid van 44 km; Berothai/Brital 141; Chun/Ras Baalbek 254). Niet op de kaart.
- **De rivier Frath (Eufraat)** (8:3) en ‘de overkant van de rivier’ (10:16): geen punt; de rivier staat op de ondergrond.
- **Beth-Rehob** (10:6): 228 (Bekaa) tegen 165 (Hule-dal); niet op de kaart.
- **Mesopotamië en Syrië-Maächa** (1 Kronieken 19:6): niet opgenomen.
- **Amalek** (8:12): alleen genoemd in de opsomming; `sam_amalek` bestaat, maar licht niet op.

## Routes (alle `recon: 1`)

- Stap 2: Gibeon → Gezer via Beth-Horon en Ajalon (5:25 noemt begin en eind).
- Stap 4: Jeruzalem → Damascus. De tekst noemt Jeruzalem (8:7) en ‘Syrië van Damaskus’ (8:6), geen route. Naar Zoba loopt geen lijn:
  het is een gebied zonder bekende grenzen.
- Stap 5: Hamath → Jeruzalem (de zoon van Thoï), in een andere kleur, zodat ze niet meetelt bij ‘Alles wat David … trok’.
- Stap 8: Jeruzalem → Rabba → Jericho (de knechten), grijs. **Twijfel:** hoofdstuk 10 noemt de stad van Hanun niet. Rabba is gekozen
  omdat het de koninklijke stad van Ammon is (12:26); het weetje zegt dat erbij.
- Stap 9: Jeruzalem → Medeba (Joab). 2 Samuël noemt de stad niet; 1 Kronieken 19:7 zegt dat de koning van Maächa zich voor Medeba
  legerde. Uitleggers verschillen of ‘de stad’ Medeba of Rabba is. De lijn loopt naar Medeba; beide steden lichten op.
- Stap 10: Jeruzalem → over de Jordaan → Helam. Het eindpunt is illustratief (`c: o`).
- Stappen 1, 3, 6 en 7 hebben geen route: de tekst noemt daar geen begin en eind.

## Personen

- Nieuw: `hadadezer`, `thoi`, `hanun`, `sobach` (alle `boek: ["2samuel"]`). Aan `abisai` is `2samuel` toegevoegd.
- **Hanun zonder `v`.** De tekst noemt hem ‘zoon van Nahas’ (10:2; 1 Kronieken 19:1: Nahas, koning van Ammon). Of dat de Nahas van
  1 Samuël 11 is (`nahas`), staat er niet; meestal wordt het aangenomen. Geen familieband gelegd. (De bestaande `nahas` verwijst
  in `vervolg` al naar 2 Samuël 10:2.)
- **Joram, de zoon van Thoï**, staat niet in `who` en is geen persoon: ‘Joram’ is een naamgenoot (`NAAMGENOTEN`) en zou een regel in
  `VERWACHT` vragen. Hij staat wel in de tekst en bij Thoï.
- Josafat (kanselier), Zadok, Achimelech, Seraja en Benaja (8:16–18) staan alleen in de tekst, niet in `who`
  (Josafat zou botsen met de koning uit 2 Kronieken; Zadok en Achimelech staan als toelichting bij de groep Priesters).
- Geen nieuwe groepsnamen. `Filistijnen` en `Edomieten` staan al in `GROEPEN` van het controlescript, maar niet in `GROUPS` in
  `app.js`; ze worden daardoor als gewone naam getoond (dat werkt goed).

## Twijfelpunten en keuzes

1. **Datering.** `tijd: "ca. 1003–990 v.Chr."`, in `dateringen.js` als `["historie", true]` (onzeker). Het beginjaar volgt uit de 33
   jaar in Jeruzalem; het eindjaar 990 is een schatting (de oorlog met Ammon loopt door tot rond de geboorte van Salomo, wiens
   leeftijd bij zijn troonsbestijging niet in de Bijbel staat). De `tijdNoot` zegt dat hoofdstuk 8 een overzicht is en dat de
   volgorde van de oorlogen niet vaststaat. De volgordevraag vraagt daarom naar de volgorde ‘waarin 2 Samuël het vertelt’.
2. **Hoofdstuk 8 en 10.** Sommige uitleggers houden 8:3–8 en 10:15–19 voor dezelfde oorlog. Genoemd in de `tijdNoot`; in ‘Wie is wie’
   en bij de persoon Hadadezer staat daarom geen ‘later’.
3. **8:3 ‘toen hij heen toog’.** Onduidelijk of David of Hadadezer naar de Eufraat optrok. De stap zegt neutraal ‘bij een tocht naar
   de rivier de Eufraat’; het weetje noemt dat uitleggers verschillen.
4. **8:2 (Moab).** Sober verteld met de woorden van de tekst (twee snoeren om te doden, één om in leven te laten), zonder verklaring:
   de tekst geeft geen reden.
5. **8:4 ‘ontzenuwde’.** Weergegeven als ‘maakt hij onbruikbaar’, zonder de bewerking te beschrijven. De koppeling met
   Deuteronomium 17:16 staat in `stat` als uitleg van uitleggers.
6. **8:13.** De Statenvertaling leest hier ‘Syriërs’, terwijl 8:14 over Edom gaat en 1 Kronieken 18:12 en Psalm 60:2 Edomieten
   noemen (met Abisaï en 18.000, respectievelijk Joab en 12.000). De stap volgt 2 Samuël letterlijk; het weetje zet de drie teksten
   naast elkaar zonder ze te harmoniseren.
7. **Verschillen met Kronieken** in getallen zijn genoemd, niet verklaard: 700 en 7.000 ruiters (8:4; 1 Kronieken 18:4); 700 wagens en
   40.000 ruiters tegenover 7.000 wagens en 40.000 man te voet (10:18; 1 Kronieken 19:18).
8. **10:4.** ‘tot aan hun billen’ is weggelaten; er staat ‘hun kleren halverwege afsnijden’.
9. **Omvang van het rijk.** Nergens benoemd. Genesis 15:18 is bewust niet als kruisverwijzing opgenomen, omdat dat een uitspraak over
   de grenzen zou suggereren die de tekst hier niet doet.
10. **Jesaja 28:21** (berg Perazim, dal van Gibeon): als kruisverwijzing met ‘veel uitleggers denken daarbij aan …’.
11. **Namen.** Geschreven naar de Herziene Statenvertaling, uit het hoofd (de HSV-tekst is in de werkmap niet beschikbaar):
    Metheg-Amma, Hadadezer, Rehob, Beth-Rehob, Betah, Berothai, Thoï, Maächa, Ahilud, Sobach. Graag nakijken; elders in de app
    staat één keer ‘Maacha’ zonder trema (`niveaus/c.js`).
12. **Psalm 60:1–2.** Het opschrift staat in de controletekst in vers 1–2; de reeks is zo gekozen dat ze ook klopt als een uitgave
    het opschrift anders nummert.
13. **Titel.** ‘Davids rijk groeit’ is de werktitel uit de opdracht; de teksten zelf zeggen alleen wat er staat (volken worden
    ‘knechten’ en brengen geschenken; bezettingen in Syrië van Damascus en in Edom).

## Visuele controle

De tien stappen zijn lokaal in de browser bekeken (desktop, 1400×900): geen consolefouten, routes over land, labels leesbaar.
Bij stap 1 stond het label van Jeruzalem eerst verborgen achter ‘Dal Refaïm’; daarom staat het label van het dal onder het punt
(`s: "b"`) en dat van Baäl-Perazim links (`s: "l"`), met `zoom: 11`.
