# De wereld in die tijd — Herodes en de keizers van Rome (rond de geboorte van de Heere Jezus): bronnen en verantwoording

Peildatum: 17 november 2026. Alle webbronnen zijn op die dag geraadpleegd.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/wereld/perioden/geboorte-jezus.json` | de periode (id `geboorte-jezus`, titel “Herodes en de keizers van Rome”) |
| `scripts/bijbelreis-wereld-perzie-rome.py` | bouwt dit bestand en `perzie.json`; `--controle` toetst of ze gelijk zijn aan de bouw |
| `scripts/bijbel-controle/wereld-geboorte-jezus.txt` | 31 controleregels tegen de Statenvertaling: de machthebbers en tijdsaanduidingen die de Bijbel zelf noemt, en elk kort citaat |
| `tests/bijbelreis-wereld-perzie-rome.test.ts` | unittest: datamodel, status + bron, de Heere Jezus alleen in gebeurtenissen, de as zonder jaar 0, Lukas 3:1–2, Mattheüs 2:22 op de kaart, Rome zonder dubbele kleur |

## 1. Keuzes

- **De Heere Jezus** (besluit Martijn, 17-11-2026): **geen levenslijn, geen persoon, geen figuur of pictogram**. Zijn
  geboorte, het terugkeren naar Nazareth, de twaalfjarige in de tempel, de doop met het begin van Zijn werk, en de
  kruisiging en opstanding staan alleen als **gebeurtenis met Bijbelverwijzing**, elk `benaderd` (met een marge; de
  kruisiging als tijdvak zonder jaartal, zie hieronder). Op de
  kaart is dat alleen de gewone stip van een gebeurtenis (bij Bethlehem, Bethabara, Jeruzalem); geen beeld bij de kribbe
  of Golgotha. ‘Over deze tijdlijn’ legt uit waarom er geen lijn is. De unittest en de e2e-test bewaken dat er geen naam,
  lijn of `personenId` voor de Heere Jezus is.
- **De kruisiging en de opstanding zonder jaartal** (besluit Martijn, 21-11-2026): geen ‘30 of 33’ en geen marge. De
  gebeurtenis staat als **tijdvak** op de tijdlijn (een band, zoals Jona in ‘Israël, Juda en Assyrië’): van na de doop
  tot het einde van Pilatus als stadhouder (in het bestand 29–36, de jaren van Pilatus komen uit zijn eigen lijn). Waar
  anders een jaartal staat (onderschrift, lijst, kaartje, ‘Laatst gebeurd’, ‘Hierna’, de schermlezer), staat het veld
  `wanneer`: ‘in de tijd van Pilatus’. Grond: onder Pontius Pilatus (Lukas 23; Johannes 19); Pilatus was stadhouder
  toen Johannes de Doper begon (Lukas 3:1). Koppeling v125 krijgt dezelfde band en omschrijving; v100 (Johannes de Doper
  onthoofd) loopt daarom tot 36 in plaats van tot 33 (‘vóór het laatste Pascha’ had geen eigen grond meer).
- **Terug naar Nazareth** (besluit 21-11-2026): naast de vrees voor Archelaüs ook de waarschuwing in de droom:
  ‘door Goddelijke openbaring vermaand in den droom’ (Mattheüs 2:22).
- **As**: `nchr` van **40 v.Chr. tot 40 n.Chr.** (in het bestand `-40` tot `40`; een negatief jaar is v.Chr., een jaar 0
  bestaat niet). Daarvoor is de kern klein uitgebreid (README §3 en §1). **Startjaar 5 v.Chr.**
- **Titel**: “Herodes en de keizers van Rome”, met als ondertitel “De wereld rond de geboorte van de Heere Jezus …”.
  De langere titel werd op de telefoon in de kop afgekapt.
- **Personen**: alleen machthebbers die de Bijbel zelf noemt (Lukas 2:1–2; 3:1–2; Mattheüs 2:1, 22): Augustus,
  Tiberius, Herodes, Archelaüs, Antipas, Filippus, Lysanias, Cyrenius (Quirinius), Pilatus en Kajafas. Elke lijn is een
  ambt (keizer, koning, viervorst, stadhouder, hogepriester), nooit een leven: geen geboortejaar is verzonnen. Weergave-
  namen kort voor de naamkolom op de telefoon (‘Antipas’, ‘Pilatus’); de volledige naam staat in `alt` en in de rol.
- **Gebieden**: het rijk van Herodes groeit in drie stappen (Josephus) en valt in 4 v.Chr. uiteen in de delen van
  Archelaüs, Antipas (Galilea en Perea, twee losse stukken) en Filippus; Judea wordt in 6 n.Chr. een Romeinse provincie;
  Filippus’ land gaat na 33/34 naar Syrië en vanaf 37 naar Herodes Agrippa I (Handelingen 12), dat van Antipas in 39.
  Daaromheen de Decapolis, Nabatea, Abilene (alleen rond 28/29 n.Chr.), Egypte (tot 30 v.Chr. van Cleopatra) en als
  rand het Romeinse rijk (provincie Syrië, vanaf 30 v.Chr. met Egypte) en het Parthische rijk. Het Romeinse rijk is
  ‘wat overblijft’: een grove vorm min de vorsten en volken die er niet direct onder vielen, zodat niets dubbel gekleurd
  wordt (unittest). Alles `benaderd`, eigen tekening, afgerond op 0,05 graad.
- **Kaart**: een `kader` (Judea en omgeving, 29,9–34,2° N, 33,2–37,6° O) voor het eerste beeld; Rome en Parthië zie je
  bij uitzoomen.
- **Weinig, sterke gegevens**: 11 gebeurtenissen (4 belangrijkste), 10 personen, 11 steden, 13 gebieden met 48 sleutels,
  10 koppelingen.
- **Bewust niet getekend**: Gaza onder Herodes (30–4 v.Chr., los van de rest), het land van Salome, Iturea buiten
  Abilene, Armenië, het westen van het Romeinse rijk, de Parthische inval van 40 v.Chr. Bethlehem, Jericho, Damascus en
  Gadara staan niet als stad op de kaart (te dicht op Jeruzalem en Nazareth voor aanraakdoelen van 24 px op de
  telefoon); Bethlehem en Jericho verschijnen als plek van hun gebeurtenis.

## 2. Per gegeven: bron, status, onzekerheid

### Gebeurtenissen (★ = belangrijk)

| id | jaar | status | bron | onzekerheid |
|---|---|---|---|---|
| herodes-jeruzalem | 37 v.Chr. | historisch | Josephus, Oudheden 17; Wikipedia | benoemd in 40; Jeruzalem 37 (sommigen 36) |
| egypte-romeins | 30 v.Chr. | historisch | Wikipedia ‘Augustus’; Josephus 15.7.3 | — |
| tempelbouw | 19 v.Chr. | benaderd, marge 20–19 | Josephus 15.11.1; Johannes 2:20 | het achttiende jaar van Herodes |
| geboorte ★ | 5 v.Chr. | benaderd, marge 6–4 | Lukas 2:1–7; Mattheüs 2:1 | vóór de dood van Herodes; andere dateringen bestaan |
| herodes-sterft ★ | 4 v.Chr. | benaderd | Mattheüs 2:19; Josephus; Wikipedia | meestal 4 v.Chr.; een minderheid 1 v.Chr. |
| terug-nazareth | 4 v.Chr. | benaderd, marge 4–3 | Mattheüs 2:19–23 | hoe lang in Egypte: onbekend; vrees voor Archelaüs en de waarschuwing in de droom (2:22) |
| judea-provincie | 6 n.Chr. | historisch | Josephus 17.13; Wikipedia | — |
| twaalf-jaar | 8 n.Chr. | benaderd, marge 7–9 | Lukas 2:41–52 | twaalf jaar na ca. 6–4 v.Chr., geen jaar 0 |
| vijftiende-jaar ★ | 28 n.Chr. | benaderd, marge 28–29 | Lukas 3:1–3 | vanaf 14 n.Chr. geteld; vanaf het medekeizerschap (12/13) eerder |
| doop | 28 n.Chr. | benaderd, marge 28–29 | Mattheüs 3:13–17; Lukas 3:21–23 | ‘omtrent dertig jaren oud’ |
| kruisiging ★ | geen jaartal: tijdvak ‘in de tijd van Pilatus’ (band 29–36) | benaderd, geen marge | Lukas 23:1–25; Johannes 19:1–18; Lukas 24:1–7; Lukas 3:1 | de Bijbel noemt geen jaar; na de doop, onder Pilatus |

### Personen

| id | ambt | van | tot | grondslag en onzekerheid |
|---|---|---|---|---|
| augustus | keizer | 27 v.Chr. historisch | 14 n.Chr. historisch, stierf | eretitel Augustus 27 v.Chr.; alleenheerser sinds 31/30 |
| tiberius | keizer | 14 n.Chr. historisch | 37 n.Chr. historisch, stierf | medeheerser vanaf 12/13 n.Chr. |
| herodes | koning | 37 v.Chr. historisch | 4 v.Chr. benaderd, stierf | benoemd 40; dood meestal 4, sommigen 1 v.Chr. |
| archelaus | koning (Mattheüs 2:22; Romeins: etnarch) | 4 v.Chr. benaderd | 6 n.Chr. historisch, **afgezet** | ‘in het tiende jaar’ (Josephus) = 9 jaar op de as zonder jaar 0 (unittest) |
| antipas | viervorst | 4 v.Chr. benaderd | 39 n.Chr. historisch, **afgezet** | door Caligula verbannen |
| filippus | viervorst | 4 v.Chr. benaderd | 34 n.Chr. historisch (marge 33–34), stierf | twintigste jaar van Tiberius (Josephus 18.4.6); niet Filippus de apostel (de halve zin over Markus 6:17 is weg, besluit 21-11-2026) |
| lysanias | viervorst, eerst genoemd | 28 n.Chr. berekend | 28 n.Chr., einde onbekend | alleen Lukas 3:1; inscriptie van Abila uit de tijd van Tiberius |
| cyrenius (Quirinius) | stadhouder (Syrië) | 6 n.Chr. historisch | 6 n.Chr., einde onbekend | **de dateringsvraag rond Lukas 2:2**: zie hieronder |
| pilatus | stadhouder (Judea) | 26 n.Chr. historisch | 36 n.Chr. historisch (marge 36–37), **afgezet** | Pilatussteen (Caesarea, 1961); enkelen: eerder begin |
| kajafas | hogepriester | 18 n.Chr. historisch | 36 n.Chr. historisch, **afgezet** | Josephus 18.2.2 en 18.4.3 |

**Lukas 2:2 en Quirinius.** Josephus noemt een opschrijving van bezittingen in Judea door Quirinius in 6 n.Chr., na het
afzetten van Archelaüs; Lukas verbindt een ‘eerste beschrijving’ onder Cyrenius met de geboorte, in de dagen van
Herodes. De laag zegt dat het een bekende vraag is en noemt kort de antwoorden die uitleggers geven (een eerdere
inschrijving; een eerdere taak van Quirinius in Syrië; ‘eerste’ in de betekenis van ‘vóór die onder Quirinius’), zonder
de Bijbel in twijfel te trekken en zonder een keuze te maken.

### Gebieden

| gebied | sleutels | grondslag |
|---|---|---|
| rome (rood) | −40 · −31 · −30 + Egypte · −24 · −23 · −21 · −20 · 33 · 34 + land van Filippus · 36 · 37 · 40 | berekend: grove vorm min de anderen (script) |
| egypte (lila) | −40 · −31 | Cleopatra; Romeins vanaf 30 v.Chr. |
| hasmoneeen (grijs) | −40 · −38 | Antigonus, 40–37 v.Chr. |
| herodes (terra) | −37 · −31 · −30 kust + Gadara/Hippos · −24 · −23 Trachonitis e.a. · −21 · −20 Paneas · −5 | Josephus 15.7.3, 15.10.1, 15.10.3 |
| archelaus (koraal) | −4 · 5 | Josephus 17.11.4 |
| judea (rood) | 6 · 40 | Josephus; Pilatus |
| antipas (salie) | −4 · 38 | Galilea + Perea (MultiPolygon) |
| filippus (oker) | −4 · 33 | Lukas 3:1; Josephus |
| agrippa (camel) | 37 · 38 · 39 + Galilea en Perea · 40 | Handelingen 12:1; Wikipedia |
| decapolis (teal) | −40 · −31 · −30 zonder Gadara/Hippos · −5 · −4 · 40 | Pompeius 63 v.Chr.; Josephus |
| nabatea (zand) | −40 · 40 | Petra, Bostra, de Negev |
| abilene (bruin) | 28 · 29 | Lukas 3:1 |
| parthie (kobalt) | −40 · 40 | de Eufraat als grens; bouwstenen van Daniël |

De unittest controleert onder meer: in 4 v.Chr. ligt Bethlehem bij Archelaüs en Nazareth bij Antipas (Mattheüs 2:22),
Machérus bij Antipas, Caesarea Filippi bij Filippus, Gadara bij Herodes alleen van 30 tot 5 v.Chr., Caesarea Filippi
pas vanaf 20 v.Chr., Alexandrië pas vanaf 30 v.Chr. Romeins, en geen overlap tussen Rome en de vorsten eromheen.

### Steden

`plaatsId` uit `plaatsen.js`: jeruzalem → `salem`, nazareth → `nt_nazareth`, caesarea → `nt_caesarea`,
caesarea-filippi → `nt_kaesareafilippi`, machaerus → `nt_machaerus`, antiochie → `nt_antiochie`, alexandrie →
`p3_alexandrie`. Uit Pleiades (CC BY 3.0): Gerasa, Abila (Lysaniou), Petra, Ctesiphon; Gadara alleen als controlepunt.

### Koppelingen

v80, v81 (7–5 v.Chr.), v82, v83, v84 (6–4 v.Chr.), v85 (6–4 v.Chr.: wijzen, vlucht, terug naar Nazareth), v86 (7–9
n.Chr.), v87 (28–29 n.Chr.), v100 (28–36 n.Chr., Markus 6 zonder jaartal), v125 (tijdvak ‘in de tijd van Pilatus’, zonder jaartal). Verder dezelfde
dateringen als de `tijd` en `tijdNoot` van die geschiedenissen; de geschiedenissen v118–v135 zelf noemen nog ‘ca. 30 of
33 n.Chr.’ (open punt, zie de voorcontrole van 21-11-2026). v142 (Herodes Agrippa, ca. 43–44) valt na de as.

## 3. Wat een mens inhoudelijk moet nalezen

1. **De teksten over de Heere Jezus** (vijf gebeurtenissen en ‘Over deze tijdlijn’): toon, eerbied, eenvoud.
2. **De zin over Lukas 2:2 en Quirinius**: eerlijk en kort genoeg, zonder de Bijbel in twijfel te trekken?
3. **Herodes † 4 v.Chr.** als hoofdjaartal (met 1 v.Chr. als minderheidsopvatting genoemd).
4. **De grenzen** van Galilea, Perea, de Decapolis, Nabatea en het land van Filippus: eerlijk als grove benadering?
5. ~~Kruisiging en opstanding op de tijdlijn met marge 30–33~~: besloten (21-11-2026), zonder jaartal, ‘in de tijd van Pilatus’.
6. **Herodes Agrippa I** (37–40) als gebied zonder levenslijn: duidelijk genoeg?

## 4. Licenties

- **Statenvertaling**: publiek domein; korte letterlijke citaten tussen ‘…’.
- **Josephus** (vert. Whiston, Wikisource): publiek domein.
- **Wikipedia** (Herod the Great, Herod Archelaus, Herod Antipas, Philip the Tetrarch, Augustus, Tiberius, Pontius
  Pilate, Census of Quirinius, Lysanias, Caiaphas, Decapolis, Nabataean Kingdom): CC BY-SA 4.0; alleen geraadpleegd voor
  jaartallen en de stand van het onderzoek, geen tekst overgenomen.
- **Pleiades** (Gadara, Gerasa, Petra, Abila Lysaniou, Ctesiphon): CC BY 3.0, naamsvermelding in de legenda.
- **Grenzen**: eigen werk. Het boek “Chronologie van de wereldgeschiedenis” is niet gebruikt.

## 5. Controleren

```sh
python3 scripts/bijbelreis-wereld-perzie-rome.py --controle
python3 scripts/bijbel-check.py scripts/bijbel-controle/wereld-geboorte-jezus.txt
npx vitest run tests/bijbelreis-wereld-perzie-rome.test.ts
```
