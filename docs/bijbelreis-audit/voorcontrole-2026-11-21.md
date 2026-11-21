# Voorcontrole ‘De wereld in die tijd’ en de lesroutes (21-11-2026)

Een voorcontrole vóór de inhoudelijke controle door Martijn. Geen herschrijfronde: duidelijke fouten zijn verbeterd, de
rest staat hieronder als korte lijst. Gedaan door de ontwikkelaar (geen theoloog of leerkracht).

## Samenvatting

- **Gecontroleerd**: de zeven perioden (`public/bijbelreis/wereld/perioden/*.json`, ook de teksten in de gebiedssleutels)
  met hun bronbestanden (`docs/bijbelreis-wereld/*-bronnen.md`, vooral het deel ‘door een mens na te lezen’), en de
  lesroutes (`public/bijbelreis/lessen-data.js`, `lessen.js`, `lessen.html`): alle 35 lessen en 105 vragen.
- **Hoe**: elke tekst gelezen; elk citaat ‘…’ opnieuw en strenger nagekeken tegen `data/statenvertaling` (ook
  hoofdletters en leestekens, zonder de bestaande ‘fold’); de verzen achter alle beweringen die op een vers rusten
  opgezocht; alle getallen nagerekend (levensjaren, koningsjaren, maanden, omrekening naar v.Chr.).
  SV-controle van alle controlebestanden: 13.429 regels, 0 mis.
- **Uitkomst**: **28 punten**: **4 verbeterd** (A–D, in de vijf nieuwere perioden) en 24 als vraag of opmerking (1–24). In de lesroutes
  geen fout gevonden: alle 105 vragen en antwoorden kloppen met de Statenvertaling, alle citaten zijn letterlijk.
- **Geen** afbeelding of figuur van God, de Heere Jezus of een engel gevonden. De Heere Jezus staat in ‘Herodes en de
  keizers van Rome’ alleen als gebeurtenis, zonder lijn of figuur (zoals besloten).
- `adam-noach.json` en `daniel-babylon.json` zijn **niet** aangeraakt (ander spoor); wat daar opviel staat in §3.

### Wat Martijn zelf moet beslissen (ja/nee)

**Beantwoord door Martijn op 21-11-2026; verwerkt, zie §5.**

1. **‘Staat in de Bijbel’ bij een geplaatst jaartal.** ‘David verslaat de buurvolken’ (990 v.Chr.) en ‘Jona in Ninevé’
   (793–753 v.Chr.) hebben het label *staat in de Bijbel*, terwijl het jaartal een plaatsing of reconstructie is (zo staat
   het ook in hun eigen toelichting). Zelfde geval bij Daniël (leeuwenkuil, Daniël 3). Mogen deze het label *bij
   benadering* krijgen? (Punt 5, 11, 17.)
2. **Terug naar Nazareth.** De tekst geeft als reden alleen dat Archelaüs koning was en Nazareth ‘veiliger’. Mattheüs 2:22
   noemt ook: Jozef werd ‘door Goddelijke openbaring vermaand in den droom’. Zal ik die waarschuwing in de droom
   toevoegen? (Punt 14.)
3. **Filippus en Markus 6:17.** Er staat dat Filippus de viervorst ‘ook niet de Filippus van Markus 6:17’ is. Dat is de
   gangbare historische uitleg (Josephus), maar de Bijbel maakt dat onderscheid niet. Mag die halve zin weg? (Punt 15.)
4. **Jesaja 40–43.** Bij ‘Troost voor Gods volk’ staat: ‘De troost van hoofdstuk 40–43 is gericht aan het volk in de
   ballingschap, die toen nog moest komen.’ Dat is een uitlegkeuze (voorzegging door Jesaja). Laten staan? (Punt 10.)
5. **Hoofdletter aan het begin van een citaat.** Drie citaten beginnen met een hoofdletter waar de Statenvertaling
   midden in het vers een kleine letter heeft (‘Een en veertig jaren…’, ‘In twee en vijftig dagen’, ‘Op den derden
   dag…’). Mag een hoofdletter aan het begin van een zin blijven staan? (Punt 20.)
6. **Hiram 980–947 v.Chr.** naast 2 Samuël 5:11 (Hiram al bij David kort na Jeruzalem): laten staan zoals nu, met de
   eerlijke opmerking dat het niet goed past? (Punt 7.)
7. **Ahasveros = Xerxes I** als basis voor alle jaartallen van Esther (met ‘als hij Xerxes I is’ erbij): akkoord? (Punt 12.)
8. **Herodes † 4 v.Chr. en de kruisiging ‘30 of 33’** als jaartallen op de tijdlijn (steeds ‘bij benadering’, met de
   andere dateringen genoemd): akkoord? (Punt 16.)
9. **Mozes geboren ‘bij Gosen’ op de kaart.** De Bijbel noemt geen plaats; de gebeurtenis licht op bij Gosen. Akkoord?
   (Punt 3.)

## 1. Verbeterd

| # | Bestand en plek | Stond er | Probleem | Nu | |
|---|---|---|---|---|---|
| A | `mozes.json`, stad Hazeroth (bron in `scripts/bijbelreis-wereld-mozes.py`) | ‘Mirjam en Aäron spreken tegen Mozes.’ met bron Numeri 11:35 | Verkeerde/onvolledige verwijzing: 11:35 noemt alleen de legerplaats; het spreken tegen Mozes staat in Numeri 12:1. | bron Numeri 11:35 en 12:1 | verbeterd |
| B | `mozes.json`, koppeling v34 (Mirjam, Aäron, koperen slang) | ‘Numeri 20–21 speelt in het veertigste jaar na de uittocht: …’ | Schatting als feit: bij Mirjam (Numeri 20:1) staat het jaar er niet bij; elders in dezelfde periode staat terecht ‘waarschijnlijk’. | zin erbij: ‘Bij de dood van Mirjam staat het jaar er niet bij; waarschijnlijk is het hetzelfde jaar.’ | verbeterd |
| C | `israel-assyrie.json`, stad Samaria (`scripts/bijbelreis-wereld-koningen.py`) | ‘Assyrië nam de stad in 722 v.Chr. in.’ | Schatting als feit: de gebeurtenis zelf heeft marge 723–721 en status ‘bij benadering’. | ‘… rond 722 v.Chr. in.’ | verbeterd |
| D | `perzie.json`, stad Jeruzalem (`scripts/bijbelreis-wereld-perzie-rome.py`) | ‘De stad van de herbouwde tempel (515 v.Chr.).’ | Schatting als feit: de gebeurtenis heeft marge 516–515, ‘bij benadering’. | ‘(ca. 515 v.Chr.)’ | verbeterd |

De JSON-bestanden zijn opnieuw gebouwd met de bouwscripts (`--controle`: gelijk aan de bouw).

## 2. De vijf nieuwere perioden: vragen en opmerkingen

### Mozes, Egypte en de woestijnreis (`mozes.json`, `mozes-bronnen.md` §4)

1. **§4.1 rekenkeuze 80,2 en braamstruik op 80**: nagerekend, klopt (Handelingen 7:23 en 7:30: 40 + 40; Exodus 7:7: 80
   en 83; Numeri 33:38–39: Aäron 123 in het 40e jaar). Maanden: manna 80,28, Sinaï 80,33, tabernakel 81,16, vertrek 81,30,
   Aäron 119,5 passen bij de maanden in de tekst. Geen actie.
2. **§4.2 Mirjam**: ‘zijn zuster’ (Exodus 2:4) en één zuster in Numeri 26:59 kloppen. Let op: ‘Zij was ouder dan
   Mozes’ is afgeleid (zij hield de wacht bij het kistje), niet letterlijk. Voorstel: laten staan. Niet veranderd.
3. **Geboorte bij Gosen**: de gebeurtenis ‘Mozes wordt geboren en bewaard’ licht op de kaart op bij Gosen; Exodus 2
   noemt geen plaats. Voorstel: laten (Gosen is waar Israël woonde) of geen plaats. Vraag 9.
4. **Ongebruikte teksten in het bouwscript**: de landstreken (`streek(...)`, regel 44–62) krijgen elk een tekst die niet
   in het JSON-bestand komt en dus nergens te zien is (ook een citaat ‘vlakke velden van Moab’ zonder controle). Geen
   fout voor de gebruiker; opruimen of tonen is een keuze. Niet veranderd.
   Verder §4.3–§4.8 nagelezen: geen fout gevonden (koperen slang zonder plaats, Kaleb vanaf jaar 41 = 40 bij de
   verspieding in het 2e jaar, 85 na 45 jaar: klopt).

### David en Salomo (`david-salomo.json`, `david-salomo-bronnen.md` §3)

5. **‘David verslaat de buurvolken’**: jaar 990 (marge 1003–970) met status `expliciet` (‘staat in de Bijbel’), terwijl
   de eigen opmerking zegt: ‘Het jaartal 990 is een plaatsing’. De unittest legt deze keuze vast, dus niet zelf
   veranderd. Vraag 1.
6. **Rekensommen**: David 30 + 40 (1040–970), Rehabeam 41 + 17 (971–913), Jerobeam 22 jaar, tempel 4e–11e jaar,
   Sisak 5e jaar van Rehabeam: klopt.
7. **§3.3 Hiram 980–947** naast 2 Samuël 5:11: eerlijk benoemd. Vraag 6.
8. **‘Hadad in Edom ook’** (gebied ‘Onder David en Salomo’): 1 Koningen 11:14 noemt Hadad een tegenpartijder ‘van des
   konings zaad in Edom’; dat hij in Edom regeerde, staat er niet. De zin zegt dat ook niet letterlijk. Geen actie, ter
   info.
   §3.1, 3.2, 3.4, 3.5 (gezag, Israël in 1050, Samuël, Egypte): geen Bijbelfout; keuzes voor Martijn zoals beschreven.

### Israël, Juda en Assyrië (`israel-assyrie.json`, `israel-assyrie-bronnen.md` §3)

9. **Citaten en getallen** (Achab 22, Jehu 28, Jerobeam II 41, Hosea 9, Hizkia 29 en het 14e jaar = 701, Menahem
   duizend talenten, beleg van drie jaar, Jesaja 20:1, ‘So, den koning van Egypte’): klopt.
10. **Koppeling v72** (Jesaja): ‘De troost van hoofdstuk 40–43 is gericht aan het volk in de ballingschap, die toen nog
    moest komen.’ Uitlegkeuze. Vraag 4.
11. **‘Jona in Ninevé’ 793–753 als `expliciet`**: ‘in de tijd van Jerobeam II’ staat in de Bijbel, de jaren 793–753 niet
    (Thiele). Zelfde vraag als punt 5. Vraag 1.
    §3.2–3.4 (Elia, Elisa, Pul, Jesaja tot 701): plaatsingen, eerlijk als ‘bij benadering’ aangeduid; geen fout.

### Perzië: Esther, Ezra en Nehemia (`perzie.json`, `perzie-bronnen.md` §3)

12. **Omrekening van de koningsjaren** nagerekend: Darius 2e jaar 520, 4e 518, 6e (Adar) 515; Ahasveros 3e 483, 7e
    (Tebeth) winter 479/478, 12e: 13 Adar = maart 473; Arthahsasta 7e 458, 20e 445, 32e 433 (Nehemia 5:14: twaalf jaar);
    Ezra na vier maanden (Ezra 7:9); muur 25 Elul, 52 dagen: klopt. §3.1 Ahasveros = Xerxes I: vraag 7.
    §3.2–3.5: geen Bijbelfout.

### Herodes en de keizers van Rome (`geboorte-jezus.json`, `geboorte-jezus-bronnen.md` §3)

13. **Teksten over de Heere Jezus** (§3.1): eerbiedig en eenvoudig; geen lijn, geen figuur, geen beeld bij kribbe of
    Golgotha. Lukas 2:2 (§3.2) wordt neutraal behandeld, zonder de Bijbel in twijfel te trekken. Geen actie.
14. **‘Terug uit Egypte, naar Nazareth’**: ‘Omdat Archelaüs koning is in Judea, gaan ze naar Nazareth’ en ‘De kaart laat
    zien waarom Nazareth veiliger was’. Mattheüs 2:22 noemt naast de vrees ook de waarschuwing in de droom. Voorstel:
    ‘… gaan ze, door God in een droom gewaarschuwd, naar Nazareth …’. Vraag 2.
15. **Filippus**: ‘Niet dezelfde als Filippus de apostel, en ook niet de Filippus van Markus 6:17.’ Het tweede deel is
    een historische keuze (Josephus), geen Bijbeltekst. Vraag 3.
16. **Herodes † 4 v.Chr., geboorte ca. 6–4, twaalf jaar 7–9 n.Chr. (geen jaar 0), doop 28/29, kruisiging 30 of 33**:
    rekenkundig juist en steeds ‘bij benadering’. Vraag 8.

## 3. De twee oudere perioden (niet aangeraakt, alleen gemeld)

### Daniël en Babylon (`daniel-babylon.json`)

17. **‘Daniël in de leeuwenkuil’ (538)**: status `expliciet` (‘staat in de Bijbel’), maar de eigen opmerking zegt ‘Het
    jaartal is daarom een plaatsing bij benadering’. Tegenstrijdig; voorstel `benaderd`. Ook de koppeling bij Daniël 3
    (603, `expliciet`) heeft geen jaar in de Bijbel. Vraag 1.
18. **Tikfout**: Nabonidus ‘De Bijbel noemt hem niet bij **name**’ → ‘bij naam’.
19. **Dubbele verwijzing**: Belsazar ‘Daniël 5:2 noemt Nebukadnezar ‘zijn vader’ (Daniël 5:2)’ en Jojachin-gebeurtenis
    ‘Jeremia 52:28 noemt ook ‘het zevende jaar’ (Jeremia 52:28)’: de verwijzing staat er twee keer. Voorstel: één keer.
    Verder geen fout gevonden in getallen en citaten.

### Van Adam tot Noach (`adam-noach.json`)

20. Geen fout gevonden: Genesis 5 nagerekend (onder meer Adam sterft 930 terwijl Lamech al leeft, de vloed 1656, Noach
    nog 350 jaar). Bij Lamech staat het citaat ‘Deze zal ons troosten’ zonder verwijzing erachter (Genesis 5:29); de
    andere periodes zetten de verwijzing altijd achter het citaat. Klein, voorstel: ‘(Genesis 5:29)’ toevoegen.
    Over alle perioden: drie citaten beginnen met een hoofdletter die in de SV klein is (david-salomo Rehabeam
    ‘Een en veertig…’, perzie ‘In twee en vijftig dagen’, daniel/perzie ‘Op den derden dag…’). Vraag 5.

## 4. De lesroutes (`lessen-data.js`, `lessen.js`, `lessen.html`)

21. **Alle 105 vragen** met vers en antwoord nagelezen tegen de Statenvertaling: geen fout. Citaten letterlijk (ook de
    strengere controle met hoofdletters), elke verwijzing binnen het leesgedeelte (unittest). Lees-, toon- en
    printteksten in `lessen.js` en `lessen.html`: rustig en neutraal (‘begin rustig zoals je gewend bent’), geen
    geloofsvraag als toets.
22. **Open punten uit `docs/bijbelreis-samen/BEOORDELING.md`** (‘Voor menselijke eindredactie’, 15 punten) blijven open;
    niets nieuws gevonden dat daar niet al staat.
23. **Kleine vraag**: ‘Hoe vaak liet Elia water over het offer gieten?’ → ‘Drie keer.’ Klopt (1 Koningen 18:34), maar
    het waren elke keer vier kruiken; een kind kan ‘twaalf’ zeggen. Voorstel: in het antwoord ‘(elke keer vier kruiken)’.
    Niet veranderd (keuze).
24. **Tekst ‘de engel’** in de route Advent en Kerst en in vragen (Lukas 1:19, Daniël 6:23, Handelingen 27:23): alleen
    tekst, geen figuur. Geen actie.

## 5. Besluiten van Martijn (21-11-2026) en hoe ze verwerkt zijn

Alle periodebestanden met een bouwscript zijn opnieuw gebouwd (`--controle`: gelijk aan de bouw); `adam-noach.json` is
met de hand bijgewerkt (geen bouwscript). Daarna `node scripts/bijbelreis-wereld.mjs` (register in `ingang.js`).

| # | Besluit | Verwerkt (bestand) |
|---|---|---|
| 1 | Label ‘bij benadering’ in plaats van ‘staat in de Bijbel’ waar het jaartal een plaatsing is | Status `benaderd` voor ‘David verslaat de buurvolken’ (990) in `scripts/bijbelreis-wereld-koningen.py`; ‘Jona in Ninevé’ en de koppelingen v69 en v70 in hetzelfde script; ‘Daniël in de leeuwenkuil’ en de koppelingen v74 (Daniël 3) en v75 in `scripts/bijbelreis-wereld-daniel.py`. De toelichtingen bleven. Unittests aangepast; bronnen: `david-salomo-`, `israel-assyrie-` en `daniel-bronnen.md`. |
| 2 | Terug naar Nazareth: ook de waarschuwing in de droom | Tekst: ‘Omdat Archelaüs koning is in Judea, is Jozef bang om daarheen te gaan; hij wordt ‘door Goddelijke openbaring vermaand in den droom’ (Mattheüs 2:22) en gaat naar Nazareth …’ (`scripts/bijbelreis-wereld-perzie-rome.py`). SV letterlijk gecontroleerd (zonder ‘zijnde’); twee regels erbij in `scripts/bijbel-controle/wereld-geboorte-jezus.txt`. |
| 3 | Filippus: halve zin over Markus 6:17 weg | ‘Niet dezelfde als Filippus de apostel.’ (`bijbelreis-wereld-perzie-rome.py`). |
| 4 | Jesaja 40–43 laten staan | Niet veranderd. |
| 5 | Citaten volgen de SV ook in hoofdletters | ‘een en veertig jaren was Rehabeam oud …’ (koningen-script), ‘in twee en vijftig dagen’ en ‘op den derden dag der maand Adar’ (perzie-rome-script en daniel-script). Bij een nieuwe, strengere controle (hoofdlettergevoelig, alle citaten met verwijzing in alle zeven perioden) kwamen er nog twee vergelijkbare gevallen uit: Arfachsad ‘Twee jaren na den vloed’ (Genesis 11:10, uit PR #70) is nu: Geboren ‘twee jaren na den vloed’ (Genesis 11:10) … (`adam-noach.json`), en Daniël ‘jongelingen’ (Daniël 1:4, waar de SV ‘Jongelingen’ aan het begin van het vers heeft) is geen citaat meer: ‘een van de jongelingen uit Juda (Daniël 1:3–6)’. Daarna: 0 afwijkingen. |
| 6 | Ahasveros = Xerxes I laten zoals het is | Niet veranderd. |
| 7 | Herodes † 4 v.Chr. blijft ‘bij benadering’; de kruisiging en de opstanding zonder jaartal | Herodes ongewijzigd. De gebeurtenis ‘De kruisiging en de opstanding’ heeft geen marge en geen ‘30 of 33’ meer. Ze staat als tijdvak (een band, zoals Jona): van na de doop tot het einde van Pilatus als stadhouder. Nieuw veld `wanneer: "in de tijd van Pilatus"`: dat staat overal waar anders een jaar staat (onderschrift, gebeurtenissenlijst, kaartje met ‘Ga naar deze tijd’, ‘Laatst gebeurd’, ‘Hierna’ zonder ‘over N jaar’, de gebeurtenissen bij Pilatus en de schermlezer) (`public/bijbelreis/wereld/wereld.js`, `wereld.css`; de controle in `kern.js` eist een korte omschrijving zonder cijfers, met `tot` en zonder `marge`). Bron: Lukas 23, Johannes 19:1–18, Lukas 24:1–7, Lukas 3:1. Koppeling v125: dezelfde band en omschrijving. Koppeling v100 (Johannes de Doper) liep tot 33 (‘vóór het laatste Pascha’); zonder kruisigingsjaar heeft dat geen grond meer, dus nu tot 36. Bronverantwoording: `geboorte-jezus-bronnen.md`, veld beschreven in `docs/bijbelreis-wereld/README.md`. Nagekeken op 390 en 1440 breed: geen jaartal bij de kruisiging, geen leeg gat. |
| 8 | Hiram zonder jaartallen | Geen persoon en geen levenslijn meer (de engine kent geen persoon zonder lijn); de bron ‘Hiram I (Josephus/Menander)’ is weg. Hiram staat in de teksten, zoals de Bijbel hem noemt: bij David (gebeurtenis ‘David koning over heel Israël’, nu met 2 Samuël 5:3–11), bij de tempel van Salomo en bij de stad Tyrus (‘eerst voor het huis van David, later voor de tempel van Salomo’) (`bijbelreis-wereld-koningen.py`, `david-salomo-bronnen.md`). |
| 9 | Mozes ‘bij Gosen’ laten staan | Niet veranderd. |
| 10 | Mozes: ongebruikte landstreek-teksten weg | De zes teksten en het argument `tekst` van `streek(...)` zijn weg uit `scripts/bijbelreis-wereld-mozes.py`; `mozes.json` verandert daardoor niet (ze stonden er nooit in). |
| 11 | Evidente verbeteringen | Nabonidus ‘bij name’ is eigen tekst, geen SV-citaat: nu ‘bij naam’. Dubbele verwijzingen: ‘Het boek Daniël noemt Nebukadnezar ‘zijn vader’ (Daniël 5:2)’ en ‘Ook het boek Jeremia noemt ‘het zevende jaar’ (Jeremia 52:28)’ (daniel-script; ‘het boek Jeremia’ omdat Jeremia 51:64 zegt dat de woorden van Jeremia daar eindigen). Lamech: ‘Deze zal ons troosten’ (Genesis 5:29) (`adam-noach.json`). |

**Open (niet in deze ronde)**: de geschiedenissen zelf (`public/bijbelreis/inhoud/nt-jezus-3.js`, v118–v135) noemen
nog ‘ca. 30 of 33 n.Chr.’ als tijd, en `dateringen.js` noemt ‘kruisiging 30 of 33 n.Chr.’ in een opmerking. Besluit 7
ging over de laag ‘De wereld in die tijd’; of het ook voor de geschiedenissen geldt, is een keuze voor Martijn.

## Controles na de wijzigingen

- `python3 scripts/bijbelreis-wereld-mozes.py --controle`, `bijbelreis-wereld-koningen.py --controle`,
  `bijbelreis-wereld-perzie-rome.py --controle`: gelijk aan de bouw.
- SV-controle, alle bestanden in `scripts/bijbel-controle/`: 13.429 gecontroleerd, 0 mis.
- Unit, typecheck en e2e: zie de PR.

Na de besluiten (§5):

- `--controle` van alle vier bouwscripts (koningen, daniel, mozes, perzie-rome): gelijk aan de bouw.
- SV-controle, alle bestanden in `scripts/bijbel-controle/`: 13.468 gecontroleerd, 0 mis. Strengere controle
  (hoofdlettergevoelig) van alle citaten met verwijzing in de zeven perioden: 0 afwijkingen.
- `npx vitest run`: 28 bestanden, 480 geslaagd, 1 overgeslagen; `npm run typecheck`: geen fouten.
- e2e `bijbelreis-wereld.spec.ts` en `a11y.spec.ts` (desktop, mobiel, tablet): 112 geslaagd, 3 overgeslagen.
