# Notities bij het deel ‘Waar gingen de brieven heen?’ (boek `brieven`, deel `brieven`)

Bijbelgedeelte: de brieven van Paulus (Romeinen tot en met Filemon) en 1 Petrus 1:1. Tien stappen, in de volgorde van de Bijbel.
Geschreven naast de Statenvertaling (`node scripts/sv.mjs`); plaatsen uit OpenBible.info Bible Geocoding Data (CC BY 4.0).

## Bestanden

| Bestand | Wat |
| --- | --- |
| `public/bijbelreis/inhoud/brieven.js` | nieuw: boek `brieven` met één deel `brieven` (10 stappen, speurtocht, afstanden) |
| `public/bijbelreis.html` | één scriptregel ná `nt-handelingen.js` |
| `public/bijbelreis/plaatsen.js` | 6 plaatsen en 71 tussenpunten onder de markering |
| `public/bijbelreis/personen.js` | 6 personen onder de markering; `"brieven"` toegevoegd aan `boek` van `paulus`, `timotheus` en `petrus` |
| `public/bijbelreis/dateringen.js` | `"brieven:brieven": ["historie", true]` |
| `scripts/bijbel-controle/brieven.txt` | 144 controleregels |
| `scripts/bijbel-controle/personen.txt` | 33 controleregels onder de markering |

## Nieuwe plaatsen

| Sleutel | Naam | `c` | Punt | Score | Grond |
| --- | --- | --- | --- | ---: | --- |
| `br_kolosse` | Kolosse | v | 37.7866, 29.2599 | 1000 | Colossae, punt op de tell bij Honaz; één identificatie |
| `br_kreta` | Kreta | v | 35.3097, 24.8933 | 1000 | eiland (punt op het eiland); `t: "gebied"`, zoals Patmos en Malta |
| `br_nikopolis` | Nikopolis | w | 39.0235, 20.7374 | 1000 | Nicopolis in Epirus, zichtbare resten. Toch `w`: de brief (Titus 3:12) zegt niet welk Nikopolis bedoeld is, en er waren meer steden met die naam. Het onderschrift in de Statenvertaling zegt zelfs ‘Nicopolis in Macedonië’ |
| `br_pontus` | Pontus | r | 40.68, 37.83 | 1000 | streek (punt in de streek) |
| `br_kappadocie` | Kappadocië | r | 38.6706, 34.8392 | 1000 | streek (punt in de streek) |
| `br_bithynie` | Bithynië | r | 40.5, 31.0 | 1000 | streek (punt in de streek) |

Hergebruikt: `nt_rome`, `nt_kenchreeen`, `nt_korinthe`, `nt_efeze`, `nt_troas`, `nt_filippi`, `nt_neapolis`, `nt_thessalonica`, `nt_athene`,
`nt4_laodicea`, `nt4_smyrna`, `nt4_pergamus`, `nt_forumappius`, `nt_drietabernen`, `nt_galatie`, `nt_asia`, `nt_macedonie`, `nt_achaje`, `salem`.

De tussenpunten (`br_…` in `BR.W`) zijn geen Bijbelse plaatsen. Op zee zijn ze getoetst aan `geo.json` (de lijn loopt niet over land, op
een enkele kuststrook na: de Straat van Rion is in de ondergrond dichtgetekend). Op land volgen ze bekende Romeinse wegen: de weg van
Efeze langs Smyrna en Pergamus naar Troas, de Via Egnatia, de weg door Thessalië naar Athene en Korinthe, en de Via Appia.

## Routes: wat de brief zelf noemt

Regel: alleen een lijn als de brief zelf een reis noemt mét begin en eind. Alle lijnen hebben `recon: 1`.

| Stap | Lijn | Grond in de tekst |
| --- | --- | --- |
| 1 Romeinen | Kenchreeën → Rome (Febe) | Romeinen 16:1–2: Febe dient de gemeente in Kenchreeën; Rome moet haar ontvangen |
| 1 Romeinen | stippellijn (`later`) Jeruzalem → Rome → naar het westen | Romeinen 15:25–28: eerst Jeruzalem, daarna via Rome naar Spanje |
| 2 Korinthe | Efeze → Troas → Macedonië → Korinthe (Paulus) | 1 Korinthe 16:5–8; 2 Korinthe 2:12–13; 7:5 |
| 6 Kolossenzen | Kolosse → Laodicea (de brief) | Kolossenzen 4:16 |
| 7 Thessalonicenzen | Athene → Thessalonica (Timotheüs) | 1 Thessalonicenzen 3:1–2 |
| 8 Timotheüs | Troas → Rome (Timotheüs moet komen) | 2 Timotheüs 1:17; 4:9, 13, 21 |
| 9 Titus | Kreta → Nikopolis (Titus moet komen) | Titus 1:5; 3:12 |

## Bewust níet getekend

- **Tychikus naar Efeze en Kolosse (Efeze 6:21–22; Kolossenzen 4:7–9).** De opdracht noemde ‘Tychikus naar Kolosse: begin en eind’ als
  voorbeeld. Het eind staat in de tekst, het begin niet: geen van de gevangenschapsbrieven zegt waar Paulus gevangen zat. Rome is de
  gangbare opvatting (en staat in de onderschriften van de Statenvertaling), maar een lijn vanuit Rome zet die opvatting als feit op de
  kaart; het venster bij een `recon`-lijn zegt bovendien ‘De Bijbel noemt alleen waar de reis begon en eindigde’. Daarom staat de
  opvatting in `fact` en `tijdNoot`, en is in stap 6 alleen de weg van de brief van Kolosse naar Laodicea getekend. **Besluit voor de
  redactie.** Wil de redactie de lijn toch: `nt_rome` → over zee (de bestaande `br_`-punten tot `br_ion3`, daarna om de Peloponnesos en
  door de Egeïsche Zee) → `nt_efeze` → de weg door het dal van de Meander → `nt4_laodicea` → `br_kolosse`. De punten in de Egeïsche Zee
  en het Meanderdal zijn dan nog te kiezen en te toetsen.
- **Epafroditus naar Filippi (Filippenzen 2:25–28).** Zelfde reden: het vertrekpunt staat er niet.
- **De weg van de brieven zelf** naar Rome, Korinthe, Galatië, Thessalonica, Efeze (aan Timotheüs), Kreta en de vijf streken van Petrus:
  de tekst noemt geen vertrekpunt of geen bode.
- **Paulus van Efeze naar Macedonië (1 Timotheüs 1:3).** Dat hij uit Efeze vertrok, staat er niet met zoveel woorden.
- **Timotheüs en Titus naar Korinthe (1 Korinthe 4:17; 2 Korinthe 8:16–18).** Wel in de tekst van stap 2 genoemd (Timotheüs); geen lijn,
  om de kaart leesbaar te houden.

## Plaatsen uit de tekst die niet op de kaart staan

- **Spanje** (Romeinen 15:24, 28): buiten het kaartgebied. De stippellijn loopt van Rome naar de westrand; het weetje zegt het erbij.
- **Illyrikum** (Romeinen 15:19) en **Dalmatië** (2 Timotheüs 4:10): streken, niet nodig voor de stappen.
- **Hiërapolis** (Kolossenzen 4:13; OpenBible 1000, 37.9266, 29.1274): alleen genoemd in de beschrijving van Kolosse. Het ligt 12 km van
  Laodicea; een derde label op die plek botst.
- **Babylon** (1 Petrus 5:13): of de stad zelf bedoeld is, is omstreden; alleen in het weetje van stap 10.
- **Milete, Thessalonica en Galatië als reisdoel van anderen** (2 Timotheüs 4:10, 20): niet in de stappen opgenomen.
- De steden van Zuid-Galatië (Antiochië in Pisidië, Ikonium, Lystre, Derbe) lichten in stap 3 niet op: dat zou een keuze zijn in de
  vraag welke gemeenten Paulus bedoelt. Ze staan in het weetje.

## Personen

Nieuw (boek `brieven`): `febe`, `titus`, `tychikus`, `epafroditus`, `onesimus`, `filemon`. Geen familiebanden. Bestaand, met `"brieven"`
toegevoegd: `paulus`, `timotheus`, `petrus`. Geen nieuwe groepsnamen (`Gemeente` en `Mensen` bestonden al).

- **Silvanus** (1 en 2 Thessalonicenzen 1:1; 2 Korinthe 1:19; 1 Petrus 5:12) staat alleen in de lopende tekst, niet in `who`. Hij is
  hoogstwaarschijnlijk dezelfde als Silas (vergelijk 2 Korinthe 1:19 met Handelingen 18:5). Voorstel aan de redactie: `alias: ["Silvanus"]`
  en `"brieven"` bij de bestaande persoon `silas`; dat is een wijziging van een bestaande regel en daarom hier niet gedaan.
- **Mogelijk dubbel met een ander nieuw deel:** Tychikus komt ook voor in Handelingen 20:4. Voegt het deel `nt-paulus3` zelf een persoon
  `tychikus` toe, dan botsen de sleutels; houd dan één persoon aan met beide boeken.
- Bij `titus` staat dat zijn naam niet in Handelingen voorkomt; dat is nagegaan in de controletekst (geen treffer).

## Twijfelpunten

1. **Febe (stap 1).** De brief zegt dat Rome haar moet ontvangen, niet dat zij de brief bracht en ook niet dat ze uit Kenchreeën
   vertrok. De lijn Kenchreeën → Rome rust dus op haar aanbeveling; het weetje zegt dat erbij. Schrappen kan zonder gevolgen voor de
   tekst (dan vervalt ook de eerste regel in `trips`).
2. **De onderschriften in de Statenvertaling.** De controletekst (`data/statenvertaling/`) heeft ze in het laatste vers van de meeste
   brieven, in een gemoderniseerde bewoording (‘Geschreven vanuit Rome …’). Ze zijn later aan de handschriften toegevoegd en kloppen
   niet altijd met de brief zelf (1 Korinthe: ‘vanuit Filippi’, terwijl 16:8 Efeze noemt). Ik citeer ze nergens en noem ze alleen in
   `tijdNoot`. Wie ‘Lees het zelf’ opent bij het slot van een brief, ziet ze wel.
3. **Waar Paulus schreef.** Alleen genoemd als de brief het zelf laat zien (Efeze in 1 Korinthe 16:8; Rome in 2 Timotheüs 1:17). Verder
   als opvatting in `fact`: Korinthe voor Romeinen, Rome voor Filippenzen, Korinthe voor 1 Thessalonicenzen.
4. **Galatië (stap 3).** Noord (de landstreek) of zuid (de provincie): niet gekozen; het punt is het bestaande `nt_galatie`.
5. **Datering.** `tl: [50, 67]` met `["historie", true]`. De ondergrens rust op Gallio (Handelingen 18:12), de bovengrens op de
   overlevering dat Paulus onder Nero stierf. De stappen staan in Bijbelse volgorde, niet in tijdsvolgorde; alle tien tonen dus
   dezelfde ruime periode.
6. **1 Petrus 5:12 (stap 10).** ‘Door Silvanus … heb ik … geschreven’ is letterlijk aangehaald, zonder te kiezen of Silvanus schrijver
   of bode was.
7. **Efeze 1:1.** Dat ‘te Efeze’ in enkele oude handschriften ontbreekt, is weggelaten: de Statenvertaling heeft de woorden.
8. **Kaartvragen.** Alle drie met `loose: 2` (raak binnen 60 km), omdat het kaartbeeld van Rome tot Klein-Azië loopt.
9. **Verwijzing van het deel.** `"Romeinen 1 – Filemon 1; 1 Petrus 1:1"`: zo leest `parseRef` het als bereik over twee boeken plus één
   vers. Op de deelknop staat daardoor ‘Romeinen 1 – Filemon 1’.
10. **Versnummering.** 2 Korinthe 13 heeft in de controletekst 14 verzen, in de HSV 13; het slot van dat hoofdstuk is niet aangehaald.

## Bewust weggelaten

- De inhoud van de brieven (leer, vermaningen): dit deel gaat over waar de brieven heen gingen en wie erbij was.
- De groetenlijsten (Romeinen 16:3–23; Kolossenzen 4:10–15; 2 Timotheüs 4:19–21), op Gajus, Archippus en Karpus na.
- De ‘brief met tranen’ en het aantal bezoeken aan Korinthe (2 Korinthe 2:1–4; 13:1): te veel reconstructie voor één stap.
- Hebreeën, Jakobus, 2 Petrus, de brieven van Johannes en Judas: buiten de opdracht.

## Nog te doen door de integrator

- `app.js`, boekenkast: de Bijbelboeken aan dit boek koppelen (`SAMEN`): `romeinen`, `1korinthe`, `2korinthe`, `galaten`, `efeze`,
  `filippenzen`, `kolossenzen`, `1thessalonicenzen`, `2thessalonicenzen`, `1timotheus`, `2timotheus`, `titus`, `filemon` → `"brieven"`.
  Van 1 Petrus staan alleen 1:1–2 en 5:12–13 in de reis; of `1petrus` ook gekoppeld wordt, is een keuze.
- De kleur `Gemeente: "lila"` staat nu ook in `brieven.js` (zelfde kleur als in `nt-openbaring.js`).

## Controles

`node --check` (4 bestanden), `bijbel-check.py` op `brieven.txt` en `personen.txt` (0 mis), `bijbelreis-personen-check.mjs` (geen fouten),
`vitest run tests/bijbelreis.test.ts` (geslaagd), en `node scripts/bijbelreis-check.mjs desktop` (geen problemen). De stappen met een lijn
zijn ook in de browser bekeken.
