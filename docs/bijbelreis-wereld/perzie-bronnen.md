# De wereld in die tijd — Perzië: Esther, Ezra en Nehemia: bronnen en verantwoording

Peildatum: 17 november 2026. Alle webbronnen zijn op die dag geraadpleegd.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/wereld/perioden/perzie.json` | de periode: as, bronnen, personen, gebeurtenissen, gebieden, steden, koppelingen |
| `scripts/bijbelreis-wereld-perzie-rome.py` | bouwt dit bestand en `geboorte-jezus.json`; hergebruikt de bouwstenen van Perzië uit `scripts/bijbelreis-wereld-daniel.py`; `--controle` toetst of de bestanden gelijk zijn aan de bouw (Python met `shapely`) |
| `scripts/bijbel-controle/wereld-perzie.txt` | 42 controleregels tegen de Statenvertaling: alle jaartellingen uit de Bijbel en elk kort citaat |
| `tests/bijbelreis-wereld-perzie-rome.test.ts` | unittest: datamodel, status + bron overal, verwijzingen, ringen, citaten, de omrekening van de koningsjaren, de aansluiting op Daniël, de kaart |

## 1. Keuzes

- **As**: `vchr`, van **522** (Darius I wordt koning) tot **430** v.Chr. (na de terugkeer van Nehemia naar de koning in
  433 en het tijdperk van Maleachi). **Startjaar 515**: de tempel is klaar, het laatste jaar van “Daniël en Babylon”.
- **Aansluiting op Daniël**: de vorm van Perzië in 522 is precies de sleutel van 515 bij Daniël (zelfde bouwstenen, zelfde
  afronding; de unittest legt dat vast). Darius I, de tempel (515) en Haggaï/Zacharia staan in beide perioden, zodat je
  de overgang ziet. Geschiedenis 76 (Ezra 1–6) blijft bij Daniël gekoppeld: één geschiedenis hoort bij één periode. De
  gebeurtenis ‘De tempel is klaar’ wijst wel naar v76.
- **Omrekening van de koningsjaren**: Babylonisch-Perzische telling. Het jaar waarin een koning begint is zijn
  begin-jaar; zijn eerste jaar begint de lente erna. Het n-de jaar van Darius I (begonnen 522) is dus 522 − n v.Chr.:
  tweede jaar 520 (Haggaï 1:1), vierde 518 (Zacharia 7:1), zesde 516/515 (Ezra 6:15, Adar = voorjaar 515). Zo ook
  Ahasveros = Xerxes I (486): derde jaar 483, zevende 479, twaalfde 474; Arthahsasta = Artaxerxes I (465): zevende 458,
  twintigste 445, 32e 433. De unittest rekent het na.
- **Weinig, sterke gegevens**: 10 gebeurtenissen (5 belangrijkste), 11 personen, 8 steden, 3 gebieden met 10 sleutels,
  3 koppelingen.
- **Gebieden**: Perzië (de vorm van Daniël, plus Thracië 513–480), Juda als kleine Perzische provincie (Jehud), en de
  Griekse steden als context (geen rijk). Eigen grove tekening, afgerond op 0,05 graad; alles `benaderd`.
- **Bewust niet getekend**: de Ionische opstand (499–493), de opstanden in Egypte, Macedonië als vazal, de bezetting van
  Attica door Xerxes (480–479), de eilanden, India na 515.
- **Wat buiten bereik viel**: de Elephantine-papyri (Sanballat als landvoogd van Samaria, 407 v.Chr.) zijn een mooie
  onafhankelijke bevestiging van de tijd van Nehemia, maar zijn hier niet gebruikt (niet met een bron nagekeken).

## 2. Per gegeven: bron, status, onzekerheid

### Gebeurtenissen (★ = belangrijk)

| id | jaar | status | bron | onzekerheid |
|---|---|---|---|---|
| darius-koning | 522 | historisch | Behistun (Livius) | ligging Behistun: Pleiades |
| profeten | 520 | benaderd | Ezra 4:24; 5:1–2; Haggaï 1:1; Zacharia 1:1 | als Darius = Darius I |
| tempel-klaar ★ | 515 | benaderd, marge 516–515 | Ezra 6:15–16 | sommigen 516 |
| marathon | 490 | historisch | Livius; Herodotus 6 | augustus of september; ‘wat er tegelijk gebeurde’ |
| salamis ★ | 480 | historisch | Livius; Herodotus 8 | eind september 480 |
| esther-koningin ★ | 479 | benaderd, marge 479–478 | Esther 2:16–17 | als Ahasveros = Xerxes I |
| purim | 473 | benaderd, marge 474–473 | Esther 3:7; 9:1; 9:26–28 | idem |
| ezra-reis ★ | 458 | benaderd, marge 458–457 | Ezra 7:7–9; Wikipedia ‘Ezra’ | als Arthahsasta = Artaxerxes I; sommigen 398 (Artaxerxes II) |
| nehemia-verlof | 445 | benaderd, marge 445–444 | Nehemia 1:1; 2:1–8 | 445 of 444 (de maanden Chisleu en Nisan in hetzelfde twintigste jaar) |
| muur-klaar ★ | 445 | benaderd, marge 445–444 | Nehemia 4; 6:15 | hetzelfde jaar als het verlof |

### Personen

| id | lijn | van | tot | grondslag en onzekerheid |
|---|---|---|---|---|
| darius-i | koning | 522 historisch | 486 historisch, stierf | Livius (koningslijst: 29 sept. 522 – na 17 nov. 486) |
| xerxes (naam ‘Ahasveros’) | koning | 486 historisch | 465 historisch, stierf | identificatie met Ahasveros: meeste onderzoekers (naam Xšayāršā); oudere tradities: Artaxerxes |
| artaxerxes (naam ‘Arthahsasta’) | koning | 465 historisch | 424 historisch (na de as) | Arthahsasta van Ezra 7 en Nehemia = Artaxerxes I volgens de meeste uitleggers |
| zerubbabel | in Juda, eerst genoemd | 538 benaderd (vóór de as) | 519 benaderd, einde onbekend | Ezra 2:2; Zacharia 4:9 (gezichten in het tweede jaar) |
| jesua (Josua) | hogepriester, eerst genoemd | 538 benaderd | 519 benaderd, einde onbekend | Haggaï en Zacharia schrijven ‘Josua’ |
| haggai | profeet | 520 benaderd | 520 benaderd, einde onbekend | alle data in het tweede jaar van Darius |
| zacharia | profeet | 520 benaderd | 518 benaderd, einde onbekend | Zacharia 7:1 |
| esther | koningin | 479 benaderd (marge 479–478) | 473 benaderd, einde onbekend | Esther 2:16; 9 |
| mordechai | in Susan, eerst genoemd | 479 benaderd | 473 benaderd, einde onbekend | Esther 2:5–7; 10:3 |
| ezra | in Juda, eerst genoemd | 458 benaderd | 445 benaderd, einde onbekend | Ezra 7; Nehemia 8 en 12:36 |
| nehemia | landvoogd | 445 benaderd | 433 berekend, einde onbekend | Nehemia 5:14 (‘zijnde twaalf jaren’); 13:6–7 |

Geen enkel geboortejaar is bekend: geen lijn begint bij een geboorte (de unittest bewaakt dat).

### Gebieden

| gebied | sleutels | grondslag |
|---|---|---|
| perzie (kobalt) | 522 · 514 · 513 + Thracië · 480 · 476 zonder Thracië · 430 | Behistun §6; Herodotus 4.143–144; Wikipedia ‘Skudra’ (513; Eion 476/475; laatste steunpunten ca. 465) |
| jehud (koraal) | 522 · 430 | Nehemia 3 en 7:25–38 (Mizpa, Jericho, Beth-Zur, Keïla) |
| grieken (oker) | 522 · 430 | Herodotus; Livius (Marathon, Salamis); geen rijk |

De unittest legt vast dat Susan, Babel, Jeruzalem, Sardis, Memphis, Persepolis en Ekbatana in elke sleutel binnen Perzië
liggen, Athene en Marathon nooit, Thracië (bij Byzantium) alleen in 513–480, en Jeruzalem in Juda.

### Steden

`plaatsId` uit `plaatsen.js`: susa → `susan`, babylon → `babelst`, ekbatana → `ekbatana`, jeruzalem → `salem`,
sardis → `nt4_sardis`, memphis → `je_nof`, athene → `nt_athene`. Uit Pleiades (CC BY 3.0): Persepolis (29,935 N;
52,890 O). De gebeurtenissen bij Behistun, Marathon en Salamis staan op hun ligging uit Pleiades, zonder eigen stad
(anders liggen de aanraakdoelen op de telefoon te dicht op elkaar). Salamis is het Griekse eiland, niet Salamis op Cyprus.

### Koppelingen

| verhaal | jaar | waarom |
|---|---|---|
| v77 Esther wordt koningin in Susan | 483–479 | Esther 1:3 en 2:16 |
| v78 Esther waagt haar leven | 474–473 | Esther 3:7; 9:1 |
| v79 De Koning komt, en een bode gaat voor Hem uit | 520–430 | Zacharia 1:1; Maleachi zonder jaartal, tot het einde van de as |

Er is geen geschiedenis voor Ezra 7–10 of Nehemia: de gebeurtenissen wijzen naar de kaartstappen `ezra:nehemia:0`, `:2`
en `:5`, en Esther naar `esther:esther:1` en `:7`.

## 3. Wat een mens inhoudelijk moet nalezen

1. **Ahasveros = Xerxes I** als basis voor de jaartallen van Esther (gangbaar, niet zeker; zo staat het ook in v77/v78).
2. **Ezra 458 of 457** en **Nehemia 445 of 444**: de keuze voor 458 en 445 als hoofdjaartal.
3. **Thracië 513–476** en het ‘verdwijnen’ in 476: een grove benadering van een geleidelijk verlies.
4. **De Griekse steden** als één vlak: eerlijk genoeg met de opmerking ‘geen rijk’?
5. **De teksten voor kinderen**, vooral bij Marathon en Salamis (oorlog, kort gehouden).

## 4. Licenties

- **Statenvertaling**: publiek domein; korte letterlijke citaten tussen ‘…’, gecontroleerd met `data/statenvertaling`.
- **Livius.org**: © Livius.org, alle rechten voorbehouden; alleen geraadpleegd, niets overgenomen.
- **Herodotus** (vert. Macaulay, Wikisource): publiek domein.
- **Wikipedia** (Ahasuerus, Ezra, Nehemiah, Skudra, Persepolis): CC BY-SA 4.0; alleen geraadpleegd voor jaartallen en de
  stand van het onderzoek, geen tekst overgenomen.
- **Pleiades** (Persepolis, Behistun, Marathon, Salamis): CC BY 3.0, naamsvermelding in de legenda van de kaart.
- **Grenzen**: eigen werk. Het boek “Chronologie van de wereldgeschiedenis” is niet gebruikt.

## 5. Controleren

```sh
python3 scripts/bijbelreis-wereld-perzie-rome.py --controle                 # JSON gelijk aan de bouw
python3 scripts/bijbel-check.py scripts/bijbel-controle/wereld-perzie.txt   # tegen de Statenvertaling
npx vitest run tests/bijbelreis-wereld-perzie-rome.test.ts
```
