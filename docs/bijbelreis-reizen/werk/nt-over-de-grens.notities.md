# Notities bij het deel `nt-over-de-grens` (Tyrus, Sidon en Dekapolis)

Boek: De Heere Jezus onderweg (`jezus-2`), bestand `public/bijbelreis/inhoud/nt-jezus-2.js`.
Bijbelgedeelte: Markus 7:24–8:26, met Mattheüs 15:21–39 (en 16:1–12 in `fact` en `cross`).
Gelezen in de Statenvertaling (controletekst) met `node scripts/sv.mjs`; plaatsen gezocht in OpenBible.info Bible Geocoding Data.

## Stappen (7)

| # | ref | titel | plaatsen (`at`) | route |
| --- | --- | --- | --- | --- |
| 0 | Markus 7:24–30 | De vrouw uit Syro-Fenicië | tyrus, sidon | og_gennesaret → tyrus (ca. 55 km, recon) |
| 1 | Markus 7:31–37 | Effatha: wordt geopend! | og_dekapolis, nt_meer | tyrus → og_dekapolis → og_oostoever (ca. 105 km, recon) |
| 2 | Mattheüs 15:29–31 | Op de berg bij het meer | nt_meer | geen |
| 3 | Markus 8:1–9 | Zeven broden voor vierduizend | nt_meer, og_dekapolis | geen |
| 4 | Markus 8:10–13 | Een teken uit de hemel? | nt_magdala | og_oostoever → nt_magdala (schip, ca. 14 km, recon) |
| 5 | Markus 8:14–21 | Pas op voor het zuurdesem | nt_meer | nt_magdala → nt_bethsaida (schip, ca. 15 km, recon) |
| 6 | Markus 8:22–26 | De blinde man van Bethsaïda | nt_bethsaida | geen |

## Nieuwe plaatsen

| sleutel | naam | `c` | punt | score OpenBible | grond |
| --- | --- | --- | --- | --- | --- |
| `og_gennesaret` | Gennesaret | r | 32.8606, 35.5072 | 1000 (gebied) | ‘het land Gennesareth’ (Markus 6:53; Mattheüs 14:34) = de vlakte el-Ghuweir (Ginosar). Gebied, geen punt. Het is de laatste plaatsnaam vóór ‘van daar’ in Markus 7:24 en Mattheüs 15:21; daarom begint de eerste route hier. |
| `og_dekapolis` | Dekapolis | r | 32.7167, 35.8 | 1000 (punt in de streek) | Gebied (Mattheüs 4:25; Markus 5:20; 7:31). OpenBible geeft één referentiepunt ten zuidoosten van het meer. |

Tussenpunt in `BR.W`: `og_oostoever` [32.775, 35.647], op de oostoever van het meer aan de kant van Dekapolis. Illustratief: de
Bijbel noemt de plek niet. Het is het eindpunt van de route door Dekapolis (stap 1) en het vertrekpunt van het schip (stap 4).

Hergebruikt: `tyrus`, `sidon`, `nt_meer`, `nt_magdala`, `nt_bethsaida`; als context `nt_kapernaum` en `nt_kaesareafilippi`.
Bestaande regels in `plaatsen.js` zijn niet gewijzigd.

Alle punten en routes zijn getoetst aan de ondergrond (`geo.json`): de landroutes blijven op het land, de twee
scheepsroutes lopen alleen over het meer (plus het laatste stuk over land naar et-Tell). De pagina is lokaal geopend en per
stap bekeken; geen consolemeldingen.

## Plaatsen uit de tekst die bewust niet (als eigen punt) op de kaart staan

- **Dalmanutha** (Markus 8:10). Komt alleen hier voor. OpenBible: ‘another name for Magadan’ (score 414, Majdal of de
  oostkant van het meer); zwak. Mattheüs 15:39 heeft op dezelfde plaats ‘de landpalen van Magdala’. Geen eigen punt (het zou
  op Magdala vallen): `nt_magdala` licht op en de `fact` legt het uit.
- **Syro-Fenicië / Fenicië** (Markus 7:26). OpenBible kent Phoenicia alleen als gebied met hetzelfde referentiepunt als
  Tyrus. Geen eigen gebiedslabel: het zou op Tyrus vallen.
- **Het huis in het gebied van Tyrus en Sidon** (Markus 7:24). De Bijbel noemt geen plaats. De route eindigt bij de stad
  Tyrus omdat de kaart een eindpunt nodig heeft; `fact` van stap 0 zegt dat de lijn alleen naar het gebied wijst.
- **De berg bij het meer** (Mattheüs 15:29) en **de plek van de spijziging van de vierduizend** (‘hier in de woestijn’,
  Markus 8:4). Niet genoemd; geen punt. Stap 2 toont het meer, stap 3 het meer en Dekapolis (vanwege Markus 7:31).
- **Het huis van de vrouw** en **het dorp buiten Bethsaïda** (Markus 8:23, 26): geen eigen punt.

## Twijfelpunten

1. **‘Via Sidon’ staat niet in de Statenvertaling of de HSV.** De opdracht noemde ‘via Sidon naar het gebied van
   Dekapolis’. Markus 7:31 luidt in de Statenvertaling: ‘wederom weggegaan zijnde van de landpalen van Tyrus en Sidon’ (zo
   ook de HSV: ‘uit het gebied van Tyrus en Sidon’). ‘Door Sidon’ is de lezing van andere handschriften (zo o.a. NBG 1951 en
   NBV). Omdat de app de Statenvertaling als basis heeft, loopt de route **niet** via de stad Sidon; Sidon licht wel op in
   stap 0 (het gebied van Tyrus en Sidon). De `fact` van stap 1 noemt de andere lezing in één zin. Wil de redactie de route
   toch langs Sidon, dan volstaat het om in stap 1 `"sidon"` als tweede routepunt op te nemen (en de zin in `fact` aan te
   passen).
2. **Volgorde van Mattheüs 15:29–31.** Markus vertelt na de terugkeer de genezing van de dove man, Mattheüs de genezingen
   op de berg; beide vóór de zeven broden. Welke van de twee eerst was, zegt de Bijbel niet. Het deel volgt Markus en zet
   Mattheüs 15:29–31 vlak voor de spijziging, waar Mattheüs het heeft. Dit staat in `tijdNoot` en in de `fact` van stap 2.
3. **Aan welke kant van het meer was de spijziging van de vierduizend?** Niet genoemd. Markus 7:31 (Dekapolis) en de
   overtocht naar Dalmanutha/Magdala (westoever) wijzen op de oost- of zuidoostkant. Daarom vertrekt het schip in stap 4 van
   `og_oostoever`; `fact` van stap 3 en 4 zeggen dat de Bijbel de plek niet noemt.
4. **Het gesprek over het zuurdesem: in het schip of na aankomst?** Markus 8:14 plaatst het in het schip; Mattheüs 16:5
   zegt ‘als Zijn discipelen op de andere zijde gekomen waren’. De stap volgt Markus (de `ref`). De scheepsroute
   Magdala → Bethsaïda hoort bij deze stap; dat het schip in Bethsaïda aankwam, volgt uit Markus 8:13 en 8:22.
5. **Plaats van het deel in het boek.** Het invoegpunt staat ná `nt-brood-en-berg`, maar in de tijd valt dit deel vóór stap 5
   van dat deel (Caesarea Filippi, Markus 8:27). De intro en de laatste `fact` verwijzen daarom naar ‘het vorige deel’. Als
   het deel ooit verplaatst wordt, moeten die twee zinnen mee veranderen.
6. **Nieuwe rolnamen.** ‘Syro-Fenicische vrouw’, ‘Dove man’ en ‘Blinde man’ staan onder de markering in `GROEPEN` van
   `scripts/bijbelreis-personen-check.mjs`. Het zijn geen groepen maar naamloze personen: ze horen eigenlijk in `ROLLEN` en
   moeten **niet** in `GROUPS` in `app.js` (dan zou de app de naam als groepslabel in kleine letters tonen). Er zijn geen
   nieuwe personen in `personen.js`: het gedeelte noemt geen nieuwe namen.
7. **‘Syro-Fenicische’ of ‘geboren in Syro-Fenicië’.** De Statenvertaling heeft ‘van geboorte uit Syro-fenicië’, de HSV ‘van
   afkomst een Syro-Fenicische’. In de eigen tekst staat neutraal ‘afkomstig uit Syro-Fenicië’; het letterlijke citaat uit de
   Statenvertaling staat alleen in de wie-lijst.
8. **‘Lammen’ (Mattheüs 15:30–31).** De Statenvertaling heeft ‘lammen’, de HSV ‘verminkten’. De stap citeert de
   Statenvertaling letterlijk en gebruikt daarna hetzelfde woord, zonder eigen invulling.
9. **Markus 8:12.** ‘Zo aan dit geslacht een teken gegeven zal worden!’ is een eedformule; de tekst geeft de betekenis weer
   (‘zal geen teken gegeven worden’, zo ook de HSV) zonder aanhalingstekens.
10. **Datering.** Gelijk aan `nt-brood-en-berg` (ca. 29, of 32): na Johannes 6:4, vóór Markus 8:27. In `dateringen.js`:
    `["historie", true]`.
11. **Effatha.** ‘Aramees, de taal die de Joden in die tijd dagelijks spraken’ is de gangbare uitleg (`fs: "u"`).

Let op: de HSV-lezingen in de punten 1, 7, 8 en 9 zijn uit het hoofd aangehaald; de HSV-tekst staat niet in de werkmap en
is hier niet nagekeken. De Statenvertaling is wel vers voor vers gecontroleerd.

## Bewust weggelaten

- De uitleg wie ‘de kinderen’ en ‘de hondekens’ zijn. De tekst zelf geeft alleen Mattheüs 15:24 (‘de verloren schapen van
  het huis Israëls’); dat vers staat in de `fact` van stap 0. Verdere uitleg is interpretatie en staat er niet in.
- Mattheüs 16:2–3 (het rode avond- en morgenrood) en het teken van Jona: alleen als kruisverwijzing (Mattheüs 16:1–12).
- De dochter van de vrouw staat niet in `who`: zij is niet bij het gesprek aanwezig (Markus 7:30).
- Herodes (Markus 8:15) staat niet in `who`: hij wordt alleen genoemd.
- Geen uitspraak over de vraag of de vierduizend heidenen waren, of over de betekenis van de getallen zeven en twaalf: dat
  staat niet in de tekst.

## Controles

- `node --check` op `nt-jezus-2.js`, `plaatsen.js`, `personen.js`, `dateringen.js`: geslaagd.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/nt-over-de-grens.txt`: 105 gecontroleerd, 0 mis.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt`: 1232 gecontroleerd, 0 mis (ongewijzigd).
- `node scripts/bijbelreis-personen-check.mjs`: Geen fouten.
- `npx vitest run tests/bijbelreis.test.ts`: 29 geslaagd, 1 overgeslagen (de bestaande 150-poort).
