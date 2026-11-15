# Notities: Jakob bij de Jabbok (`genesis:jakob-jabbok`)

Genesis 32 vers voor vers (met Genesis 33:1–4 als slot), ingezoomd op het gebied van de Jabbok. Opdracht van de eigenaar
(ingesproken): "Werk Genesis 32 in detail uit … zodat je kan inzoomen en ziet hoe dat verhaal in stappen gaat."
Het deel staat in `public/bijbelreis/inhoud/genesis.js`, direct na `jakob` en vóór `jozef`. Het deel `jakob` is niet
gewijzigd (stappen 5 en 6 vertellen hetzelfde in het kort). Controle: `scripts/bijbel-controle/jakob-jabbok.txt` (93 regels).

## Stappen (vast: bij elke stap hoort een tafereel)

| # | Verwijzing | Titel | Stempel | Kaart |
| --- | --- | --- | --- | --- |
| 0 | Genesis 32:1–2 | Engelen bij Mahanaïm | Mahanaïm | route Gilead → Mahanaïm, zoom 11 |
| 1 | Genesis 32:3–6 | Boden naar Ezau | Boden | boden heen en terug naar Seïr (grijs), overzicht |
| 2 | Genesis 32:7–8 | Jakob vreest zeer | Vrees | Mahanaïm, zoom 12 |
| 3 | Genesis 32:9–12 | Jakob bidt | Gebed | Mahanaïm, zoom 12 |
| 4 | Genesis 32:13–21 | Een geschenk voor Ezau | Geschenk | kort lijntje naar het zuiden (grijs), zoom 12 |
| 5 | Genesis 32:22–23 | Over de Jabbok | Jabbok | Mahanaïm → Pniël, zoom 13 |
| 6 | Genesis 32:24–26 | De worsteling | Worsteling | Pniël, zoom 13 |
| 7 | Genesis 32:27–29 | Een nieuwe naam: Israël | Israël | Pniël, zoom 13 |
| 8 | Genesis 32:30–32 | Pniël: de zon gaat op | Pniël | Pniël, zoom 12 |
| 9 | Genesis 33:1–4 | De ontmoeting met Ezau | Ezau | Ezau komt van het zuiden (bruin), zoom 12 |

Kleur van het deel: `teal` (Jakob is `lila`, Jozef `koraal`). Geschenk en boden: `grijs`; Ezau: `bruin`, zoals in het deel Jakob.

## Plaatsen

Geen nieuwe plaatsen. Hergebruikt: `mahanaim` (w), `pniel` (w), `ej_jabbok` (v), `sukkoth` (w), `gilead` (r), `seir` (r),
`sichem` (v). Gezocht in OpenBible (15-11-2026):

| Naam | OpenBible | Beste score | Punt | Bestaande sleutel |
| --- | --- | --- | --- | --- |
| Mahanaim | Tell edh-Dhahab el-Gharbi | 654 | [32.1857, 35.6867] | `mahanaim` (zelfde punt, w) |
| Penuel | Tell edh-Dhahab esh-Sherqiyeh | 694 | [32.1870, 35.6921] | `pniel` (zelfde punt, w) |
| Jabbok | Zarqa River (monding) | 1000 | [32.1153, 35.5431] | `ej_jabbok` (zelfde punt, v) |
| Succoth 1 | Tell Deir Alla | 600 | [32.1966, 35.6212] | `sukkoth` (w) |
| Mount Seir 1 | Jebel esh-Shera | 775 | [30.1843, 35.3166] | `seir` (gebied, r; punt niet verplaatst) |

Geen plaats verplaatst. Mahanaïm en Pniël liggen ongeveer een halve kilometer uit elkaar, aan weerszijden van een bocht
van de Jabbok (Tulul edh-Dhahab). Daarom zoomen de stappen 5–7 in tot zoom 13.

**Tussenpunten** (geen Bijbelse plaatsen, `BR.W`):

| Sleutel | Punt | Waarom |
| --- | --- | --- |
| `jj_zuid` | [32.166, 35.692] | ruim 2 km ten zuiden van de twee heuvels: de kant waar het geschenk heen gaat en waar Ezau vandaan komt (richting Seïr) |
| `jj_hoogte` | [32.04, 35.73] | de hoogte bij es-Salt, op de weg van de Jabbok naar de hoogvlakte (route van de boden) |

**Niet op de kaart:** de plek van het veer (32:22) en de plek van de ontmoeting (33:1) noemt de Bijbel niet. Galed /
Mizpa uit 31:47–49 staat er niet als punt: OpenBible heeft voor ‘Mizpah 4’ alleen zwakke voorstellen (479, zonder
moderne plaats). Het vertrekpunt is daarom het gebied `gilead`.

## Wat reconstructie is

- Alle routes (`recon: 1`): de Bijbel noemt Gilead, Mahanaïm, Seïr, de Jabbok en Pniël, maar geen wegen.
  - Gilead → Mahanaïm: rechte lijn van het midden van het gebied Gilead naar Mahanaïm.
  - De boden: Mahanaïm → `jj_zuid` → `jj_hoogte` → Medeba → Dibon → Kerak → Seïr en terug, over de hoogvlakte ten
    oosten van de Dode Zee (de latere Koningsweg; dezelfde tussenpunten als elders in de app).
  - Het geschenk en Ezau: een kort lijntje naar en van het zuiden; alleen de richting (de kant van Seïr) is bedoeld.
  - Over de Jabbok: van Mahanaïm naar Pniël (de twee heuvels aan weerszijden van de beek).
- Waar Jakob worstelde: de tekst zegt dat de plaats daarna Pniël heette (32:30); de kaart zet de stappen 6–8 op Pniël.
- De datering ca. 1909 v.Chr. (zie `tijdNoot`): Jozef was ongeveer zes jaar (30:25; 31:41), in de tijdrekening van de
  delen Jakob en Jozef. Dateringsregel: `"genesis:jakob-jabbok": ["bijbel", true]`.
- Landschap van toen: `python3 -I scripts/bijbelreis-toen.py --alleen-controle` meldt geen route van dit deel.

## Meeverteld zonder aparte vermelding (redactieregel 15-11-2026)

Waar de tekst iets openlaat en er een algemeen aanvaarde uitleg is, staat die als gewone vertelling in `fact`.

| Stap | Wat meeverteld is | Grond |
| --- | --- | --- |
| 0, 2, 8 (onthul) | Mahanaïm betekent “twee legers” | de tekst zelf: ‘heirleger’ (32:2) en ‘twee heiren’ (32:7, 10), in het Hebreeuws hetzelfde woord; zo in de gangbare naslagwerken en verklaringen |
| 2 | ‘twee heiren’ is hetzelfde woord als in de naam Mahanaïm | Hebreeuws *machaneh* / *machanayim* |
| 6 | de Man is de Engel van de HEERE, de Zoon van God, in de gedaante van een man | Genesis 32:30 (‘ik heb God gezien’), Hosea 12:4–5 (‘den Engel’); de gereformeerde uitleg (kanttekeningen bij de Statenvertaling, Calvijn, Matthew Henry); de HSV schrijft ‘een Man’ met hoofdletter |
| 7, 8 (onthul) | Israël betekent “strijder met God” of “vorst van God” | de reden in 32:28 (‘vorstelijk gedragen met God’) en Hosea 12:4; de twee gangbare weergaven, zoals ook in het deel Jakob |
| 8, 8 (onthul) | Pniël betekent “aangezicht van God” | de tekst zelf (32:30); zo ook in `plaatsen.js` |
| 5 | de elf kinderen zijn de elf zonen; Dina is er niet bij geteld | 29:31–30:24 en 35:16–18: bij de Jabbok waren er elf zonen en één dochter |
| 8 | ‘zenuw’ is hier een pees | ouder Nederlands: “zenuw” voor pees; de pees op het heupgewricht (32:32) |

Niet meeverteld, omdat de meningen echt uiteenlopen: waarom de Man Zijn naam niet noemt (32:29), wat ‘vorstelijk
gedragen met de mensen’ precies betekent, aan welke kant van de Jabbok Jakob worstelde.

## Twijfelpunten

- **Kanttekeningen bij de Statenvertaling** waren online niet als tekst te raadplegen (de geraadpleegde sites tonen de
  kanttekeningen bij Genesis 32 niet). De uitleg van stap 6 rust daarom op de tekst zelf (32:30; Hosea 12:4–5) en op de
  gereformeerde uitlegtraditie zoals de coördinator die aangaf; een menselijke redacteur kan dit naast de kanttekeningen leggen.
- **‘een man’ / ‘een Man’**: de controletekst (Statenvertaling 1888) heeft ‘een man’ in kleine letter; de tekst in de app
  schrijft ‘een Man’ (zoals de HSV), alleen buiten aanhalingstekens.
- **Datering**: ca. 1909 v.Chr. volgt rekenkundig uit de bestaande delen; de Bijbel zegt niet hoe lang de reis van Gilead
  naar de Jabbok duurde (enkele dagen of weken).
- **De weg van de boden** is lang (ca. 185 km enkele reis) en volledig een reconstructie; Seïr staat als gebied (`r`) op
  het bestaande punt van de app (30.55, 35.55), niet op Jebel esh-Shera.
- **Speurtocht**: de kaartvragen liggen dicht bij elkaar (Mahanaïm en Pniël een halve kilometer); een tik op de ene
  telt ook voor de andere. Dat is bewust zo gelaten: het gaat om het gebied van de Jabbok.
- In stap 4 wordt in `txt` alleen “honderden dieren” genoemd; de getallen staan in het onthulspel en het weetje.
