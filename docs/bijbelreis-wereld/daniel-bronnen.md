# De wereld in die tijd — Daniël en Babylon: bronnen en verantwoording

Peildatum: 17 november 2026. Alle webbronnen zijn op die dag geraadpleegd.

Dit is de verantwoording van `public/bijbelreis/wereld/perioden/daniel-babylon.json`, de gegevens voor demo 2 van de
laag “De wereld in die tijd”. Het bestand bevat alleen gegevens; de engine (levenslijnen, kaart, tijdlijn) staat in
een ander spoor.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/wereld/perioden/daniel-babylon.json` | de periode: as, bronnen, personen, gebeurtenissen, gebieden, steden, koppelingen |
| `scripts/bijbelreis-wereld-daniel.py` | bouwt het JSON-bestand (teksten, data en de grenzen als bouwstenen); `--controle` toetst of het bestand gelijk is aan de bouw (vraagt Python met `shapely`) |
| `scripts/bijbel-controle/wereld-daniel.txt` | 55 controleregels tegen de Statenvertaling: alle jaartellingen uit de Bijbel en alle korte citaten |
| `tests/bijbelreis-wereld-daniel.test.ts` | unittest: datamodel, status+bron overal, verwijzingen, geldige ringen, steden binnen hun rijk, citaten letterlijk SV |

## 1. Keuzes

- **As**: `vchr`, van **627** tot **515** v.Chr. Begin: de roeping van Jeremia (627/626) en het koningschap van
  Nabopolassar in Babel (626). Einde: de herbouwde tempel (Ezra 6:15, 515). Zo zie je eerst Assyrië verdwijnen en Babel
  opkomen, en aan het eind Perzië als opvolger. **Startjaar 605**: Karkemis en de wegvoering van Daniël.
- **Weinig, maar sterke gegevens**: 12 gebeurtenissen (5 belangrijkste), 14 personen, 13 steden, 7 gebieden met
  36 sleutels, 5 koppelingen naar verhalen.
- **Gebieden** zijn eigen, grove tekeningen langs rivieren, kusten, gebergten en woestijnranden, afgerond op 0,05 graad.
  Er is geen kaart en geen grensdataset overgenomen. Een rijk is opgebouwd uit bouwstenen (in het script), zodat
  bijvoorbeeld het Babylonische deel van Perzië in 539 precies gelijk is aan Babel in 604. Alle sleutels hebben
  `betrouwbaarheid: "benaderd"`; elk gebied heeft een `opmerking` die begint met “Grenzen bij benadering”.
- **Snelle wissels**: waar een rijk in één jaar groter werd, staat een extra sleutel het jaar ervoor met de oude vorm
  (bijv. Perzië 540 = 547, 539 met Babel). Zo groeit een rijk niet over tien jaar “vanzelf” als het in één veldtocht ging.
- **Wat bewust ontbreekt**: Cilicië, Lycië en de kleine koninkrijkjes; Elam vóór 539; het Assyrische kernland ten
  oosten van de Tigris tussen 612 en 539 (niet bekend of het bij Babel of bij de Meden hoorde); de Halys-grens van de
  Meden (alleen bij Herodotus, omstreden); de uitbreiding van Juda onder Josia; Thracië en India onder Darius (na 515 of
  onzeker); Arabië buiten Tayma.

### Velden naast het gedeelde datamodel

Het bestand volgt het datamodel uit de specificatie. Een paar velden zijn toegevoegd (allemaal optioneel voor de engine):

| Veld | Waar | Betekenis |
|---|---|---|
| `lijn` | persoon | wat de lijn toont: `regering`, `leven`, `in Babel` of `profeet` (geen geboorte-tot-dood als die onbekend is) |
| `begin` | persoon.van | hoe de lijn begint: `regering`, `weggevoerd`, `roeping` (nooit `geboren`: geen enkel geboortejaar is bekend) |
| `marge` | gedateerd gegeven | `[vroegst, laatst]` in jaren v.Chr. (eerste getal is het grootste), bijv. `[587, 586]` |
| `opmerking` | overal | korte toelichting op onzekerheid of grondslag (voor een info-knopje) |
| `stap` | gebeurtenis | de kaartstap `boek:deel:index` in de Bijbelreis (uit `tests/bijbelreis-stappen.json`) |
| `tot`, `status`, `opmerking` | koppeling | een verhaal kan een periode beslaan (Ezra 1–6: 538–515) |
| `bron` | overal | één of meer items: een bron-id uit `bronnen` of een Bijbelverwijzing (Statenvertaling) |

Let op voor de engine: de ondergrond `geo.json` loopt tot 53° oosterlengte (reliëf tot 57°). Pasargadae (53,17° O)
ligt net daarbuiten en het Perzische rijk loopt vanaf 530 door tot ongeveer 72° O. De kaart moet daar dus uitzoomen,
het gebied afknippen, of zonder kustlijn tekenen.

## 2. Per gegeven: bron, status, onzekerheid

Statussen: `historisch` = onafhankelijk (buiten de Bijbel) bevestigd; `expliciet` = staat zo in de Bijbel (hier: zonder
jaartal); `berekend` = afgeleid uit Bijbelse getallen; `benaderd` = reconstructie met onzekerheid.

### Gebeurtenissen

| id | jaar | status | bron | onzekerheid |
|---|---|---|---|---|
| val-nineve ★ | 612 | historisch | ABC 3 | maand Abu; dag verloren in de tekst |
| karkemis | 605 | historisch | ABC 5; Jer. 46:2 | — |
| daniel-weggevoerd ★ | 605 | benaderd | Dan. 1:1–6 | “derde jaar van Jojakim” (Dan. 1:1) tegenover “vierde jaar” (Jer. 46:2); gangbare uitleg: andere telling, beide 605. Niet buiten de Bijbel beschreven |
| inname-jeruzalem | 597 | historisch | ABC 5 (2 Addaru, 7e jaar); 2 Kon. 24:10–17; Jer. 52:28 | 2 Kon. 24:12 zegt “achtste jaar” (andere telling) |
| verwoesting-jeruzalem ★ | 586 | benaderd, marge 587–586 | 2 Kon. 25:1–10; Jer. 52:12–14 | 586 of 587; de Babylonische kroniek stopt na jaar 11 van Nebukadnezar |
| dood-nebukadnezar | 562 | historisch | Livius (tijdlijn); 2 Kon. 25:27–30 | genade voor Jojachin omgerekend begin 561 |
| kores-medie | 550 | historisch | ABC 7 ii.1–4 | — |
| sardis | 547 | benaderd, marge 547–540 | Livius; Cahill (Sardis Expedition); Herodotus | lezing “Lydië” in ABC 7 omstreden; Grieks: 546; sommigen later |
| val-babylon ★ | 539 | historisch | ABC 7 iii.12–18; Cyruscilinder; Dan. 5:30 | dood van Belsazar alleen in de Bijbel |
| decreet-kores ★ | 538 | benaderd, marge 539–538 | Ezra 1:1–11; 2 Kron. 36:22–23 | Cyruscilinder als context: noemt Juda/Jeruzalem niet, is niet dit bevel |
| leeuwenkuil | 538 | expliciet, marge 539–536 | Dan. 6 | geen jaar in de Bijbel; “Darius de Meder” omstreden |
| tempel-klaar | 515 | benaderd, marge 516–515 | Ezra 6:15–16 | als Darius = Darius I; sommigen 516 |

★ = `belangrijk: true`.

### Personen (levenslijnen)

| id | lijn | van | tot | grondslag en onzekerheid |
|---|---|---|---|---|
| nabopolassar | regering | 626 historisch (ABC 2, 23 nov.) | 605 historisch (ABC 5) | — |
| nebukadnezar | regering | 605 historisch (ABC 5, 1 Ululu) | 562 historisch | ouder = Nabopolassar (ABC 5: “oudste zoon, kroonprins”) |
| nabonidus | regering | 556 historisch | 539 historisch | einde van zijn leven onbekend |
| belsazar | regering (medeheerser) | 553 benaderd (Versverslag ii.5–6; ABC 7) | 539 benaderd (Dan. 5:30) | Bijbel: “vader” Nebukadnezar; buiten de Bijbel zoon van Nabonidus. Geen `ouder` ingevuld om niet tegen `personen.js` in te gaan |
| kores | regering | 559 benaderd (Herodotus: 29 jaar) | 530 historisch | — |
| cambyses | regering | 530 | 522 | historisch (Livius); ouder = Kores (ABC 7 iii.24) |
| darius-i | regering | 522 historisch | 486 (na de as) | Darius van Ezra = Darius I: algemeen aangenomen |
| darius-meder | regering | 539 benaderd (Dan. 6:1) | 538 benaderd (Dan. 9:1) | identificatie omstreden (Gubaru, Kores zelf, een Meedse vorst); duur onbekend |
| jojakim | regering | 609 benaderd | 598 benaderd | 11 jaar (2 Kon. 23:36); stierf kort vóór begin 597 |
| jojachin | leven (vanaf koningschap) | 598 benaderd | 561 berekend (2 Kon. 25:27), einde onbekend | rantsoenlijsten uit Babel noemen hem (COJS) |
| zedekia | regering | 597 historisch (ABC 5) | 586 benaderd, marge 587–586 | sterfjaar onbekend |
| daniel | in Babel | 605 benaderd, `begin: weggevoerd` | 536 benaderd (Dan. 10:1), einde onbekend | **geen geboortejaar**: de lijn begint bij de wegvoering; Dan. 1:21 als kort citaat |
| jeremia | profeet | 627 berekend (Jer. 1:2) | 586 benaderd, einde onbekend | profeteerde daarna nog in Egypte |
| ezechiel | in Babel | 597 berekend (Ez. 1:2) | 571 berekend (Ez. 29:17) | niet in `personen.js` (`personenId: null`) |

### Gebieden (per sleutel)

| gebied | sleutels | grondslag |
|---|---|---|
| babylonie (terra) | 626 omgeving Babel · 616 Babylonië · 609 tot Haran · 605 + Noord-Syrië · 604 tot ‘de rivier van Egypte’ · 553 · 549 + Tayma · 539 einde | ABC 2, 3, 5, 7; 2 Kon. 24:7; Versverslag |
| assyrie (grijs) | 626 kernland · 613 · 612 rond Haran · 610 einde | ABC 3; west (Syrië/Kanaän) in 626 bewust niet getekend |
| medie (olijf) | 614 · 550 einde | ABC 3 en 7; omvang omstreden (BMCR-bespreking van *Continuity of Empire (?)*, 2003; Livius); alleen het kerngebied rond Ekbatana |
| lydie (oker) | 626 kernland · 560 tot de Halys · 547 einde | Herodotus 1.28 (behalve Lycië en Cilicië), 1.72; Cahill |
| egypte (lila) | 626 · 610 · 609 + Kanaän/Syrië · 606 · 605 Nijl · 525 einde | 2 Kon. 23:29–35; 24:7; Jer. 46:2; ABC 3 en 5; Livius (Cambyses) |
| perzie (kobalt) | 559 Persis · 553 · 550 + Medië · 548 · 547 + Lydië, Cappadocië, Armenië · 540 · 539 + Babel, Elam, Assyrië · 530 + het oosten · 526 · 525 + Egypte · 515 | ABC 7; Cyruscilinder; Behistun §6 (23 landen, 522); Herodotus; Livius. Wanneer Kores het oosten veroverde, is niet bekend: de groei 539→530 is een benadering |
| juda (koraal) | 626 · 586 einde | 2 Kon. 23–25; liggingen uit `plaatsen.js` |

De controle in de unittest legt vast dat Babel in elke sleutel binnen Babylonië ligt, Sardis binnen Lydië (626–547),
Ekbatana binnen Medië, Ninevé en Haran binnen Assyrië, Jeruzalem binnen Juda, Memphis en Saïs binnen Egypte,
Jeruzalem/Tyrus/Karkemis in 609 onder Egypte, Tayma alleen in 549, Susa nooit in Babel, en dat Perzië Ekbatana pas
vanaf 550, Sardis vanaf 547, Babel vanaf 539 en Egypte vanaf 525 bevat.

### Steden

`plaatsId` uit `plaatsen.js` (ligging daaruit overgenomen, de test bewaakt gelijkheid): babylon → `babelst`,
susa → `susan`, ekbatana → `ekbatana`, sardis → `nt4_sardis`, nineve → `ninivest`, harran → `haran`,
karkemis → `karkemis`, jeruzalem → `salem` (de enige Jeruzalem-plaats in `plaatsen.js`; ook de Daniël-stappen
gebruiken hem), tyrus → `tyrus`, memphis → `je_nof`. Zonder `plaatsId`, met ligging uit Pleiades (CC BY 3.0):
Pasargadae (30,195 N; 53,174 O), Saïs (30,967 N; 30,774 O), Tayma (27,622 N; 38,55 O).

### Koppelingen naar verhalen

| verhaal | jaar | waarom |
|---|---|---|
| v71 Jeruzalem verwoest, Jeremia gespaard | 586 | 2 Kon. 25 |
| v73 Daniël en zijn vrienden aan het hof | 605–603 | Dan. 1:1; Dan. 2:1 (tweede jaar van Nebukadnezar) |
| v74 Drie vrienden buigen niet | 603–562 (expliciet, geen jaar) | Dan. 3 noemt geen jaar |
| v75 Daniël in de leeuwenkuil | 539–538 | Dan. 6 onder Darius de Meder |
| v76 Terug naar Jeruzalem: de tempel herbouwd | 538–515 | Ezra 1–6 |

Daniël 5 (het schrift op de muur) heeft geen eigen geschiedenis; de gebeurtenis `val-babylon` wijst naar de kaartstap
`daniel:daniel:6`.

## 3. Wat een mens inhoudelijk moet nalezen

1. **De grenzen** (vooral Medië, Lydië vóór Croesus, het oosten van Perzië en de Levant onder Necho 609–605): zijn ze
   eerlijk genoeg als grove benadering? Renders per sleuteljaar staan in de scratchpad van deze sessie
   (`wereld-daniel/renders/`), niet in de repository.
2. **Jojakim 609 en Jojachin 598** als begin van de regering: omgerekend, niet letterlijk in een bron.
3. **Belsazar vanaf 553**: het Versverslag zegt “toen het derde jaar begon”; die omrekening naar 553 is niet zeker.
4. **Darius de Meder 539–538**: alleen een plaatsing; de Bijbel geeft geen duur.
5. **Kores 559** (via Herodotus) en het oosten van Perzië in 530 (via de lijst van Darius uit 522).
6. **De teksten voor kinderen**: toon en eenvoud (1–2 zinnen per gebeurtenis en per stad).
7. **Het jaartal 586 als hoofdjaartal** voor de verwoesting (de Bijbelreis gebruikt dat al; 587 staat steeds erbij).

## 4. Licenties

- **Statenvertaling**: publiek domein; alleen korte letterlijke citaten tussen ‘…’, gecontroleerd met `data/statenvertaling`.
- **Livius.org** (kronieken, Cyruscilinder, Versverslag, Behistun, tijdlijnen): © Livius.org, alle rechten voorbehouden. Alleen geraadpleegd en
  in eigen woorden samengevat; er is geen tekst overgenomen. De vertalingen zijn van Grayson (1975) en Glassner (2004).
- **Herodotus** (vert. Macaulay, 1890, Wikisource): publiek domein.
- **Sardis Expedition** (Cahill 2010), **BMCR**, **COJS**: alleen geraadpleegd, niets overgenomen.
- **Pleiades** (ligging van Pasargadae, Saïs, Tayma): CC BY 3.0; **naamsvermelding nodig** (“Pleiades”, met link). Staat
  in `bronnen` van het JSON-bestand; de engine moet bronnen met `soort: "dataset"` zichtbaar kunnen tonen.
- **plaatsen.js** (Bijbelreis): liggingen eerder gecontroleerd met OpenBible.info (CC BY 4.0) en Pleiades (CC BY); zie
  `docs/bijbelreis-audit/plaatsen.md`.
- **Grenzen**: eigen werk; geen grensdataset gebruikt. Het boek “Chronologie van de wereldgeschiedenis” is niet gebruikt.
- Encyclopaedia Britannica en Encyclopaedia Iranica waren vanuit deze omgeving niet bereikbaar (HTTP 403) en zijn dus
  **niet** gebruikt.

## 5. Controleren

```sh
python3 scripts/bijbelreis-wereld-daniel.py --controle                    # JSON gelijk aan de bouw
python3 scripts/bijbel-check.py scripts/bijbel-controle/wereld-daniel.txt  # 55 regels tegen de Statenvertaling
npx vitest run tests/bijbelreis-wereld-daniel.test.ts                      # datamodel, verwijzingen, ringen, citaten
```

Grenzen wijzigen: pas de bouwstenen in het script aan, bouw opnieuw (`python3 scripts/bijbelreis-wereld-daniel.py`) en
draai de test.
