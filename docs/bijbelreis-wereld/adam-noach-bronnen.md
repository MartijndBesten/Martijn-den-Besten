# De wereld in die tijd — Van Adam tot Abram: bronnen en verantwoording

Peildatum: 21 november 2026 (Genesis 11 en de Septuagint-getallen). Genesis 5 en de Septuagint/Samaritaanse
Pentateuch bij Genesis 5 zijn op 17 november 2026 gecontroleerd.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/wereld/perioden/adam-noach.json` | de periode (met de hand bijgehouden; geen bouwscript). De id blijft `adam-noach`, zodat `#wereld/adam-noach/<jaar>` en de koppelingen blijven werken. |
| `scripts/bijbel-controle/wereld-adam-noach.txt` | 73 controleregels tegen de Statenvertaling: elk getal waarop de tijdlijn rust en elk kort citaat (`python3 scripts/bijbel-check.py …` → 0 mis) |
| `tests/bijbelreis-wereld.test.ts` | rekent Genesis 5 en Genesis 11:10–32 na, de overlap, de Septuagint-verschillen, de koppelingen en de lijst die meeschuift |

## 1. Besluiten (Martijn, 21-11-2026)

- **Genesis 11 hoort in deze laag**: dezelfde as (‘jaar na de schepping’, Masoretische tekst = Statenvertaling). De titel
  is nu ‘Van Adam tot Abram’; de id bleef `adam-noach`.
- **Terach 130 bij de geboorte van Abram** is de hoofdlijn. Grondslag: Terach werd 205 en stierf in Haran (Genesis 11:32);
  Abram was 75 toen hij uit Haran trok (12:4), ‘nadat zijn vader gestorven was’ (Handelingen 7:4). De lezing ‘zeventig’
  (Genesis 11:26: toen kreeg Terach Abram, Nahor en Haran) staat als opmerking bij Abram, bij de gebeurtenis en in
  ‘Over deze tijdlijn’: dan zou Abram in jaar 1948 geboren zijn.
- **Nahor en Haran** (zonen van Terach) staan er niet in: Genesis 11 geeft voor hen geen getallen.
- **Uitgerekende overlap** mag als feit uit de getallen: bij de geboorte van Abram leven Sem, Arfachsad, Selah, Heber,
  Rehu, Serug en Terach nog (Peleg en Nahor niet; Noach stierf twee jaar eerder). Geen ‘sprak met’ of andere
  ontmoetingen; de unittest zoekt daar ook op.
- **Geen jaartallen v.Chr. voor Genesis 1–11, en Ussher niet noemen.** Het oude informatieblok met Ussher (4004 v.Chr.)
  is vervangen door een korte uitleg waarom er geen jaartal v.Chr. staat (de keuzes bij verder terugrekenen).

## 2. Per gegeven

Vader = leeftijd van de vader bij de geboorte. Totaal = vader-leeftijd bij de eigen zoon + de jaren daarna; dat totaal
staat in Genesis 11 niet zelf (behalve bij Terach) en heeft daarom `leeftijdStatus: "berekend"`.

| persoon | geboren | vader | stierf | leeftijd | verzen |
|---|---|---|---|---|---|
| Sem | 1558 | Noach 502 | 2158 | 100 + 500 = 600 | 5:32; 11:10–11 (al aanwezig) |
| Arfachsad | 1658 | Sem 100 | 2096 | 35 + 403 = 438 | 11:10, 12–13 |
| Selah | 1693 | Arfachsad 35 | 2126 | 30 + 403 = 433 | 11:12, 14–15 |
| Heber | 1723 | Selah 30 | 2187 | 34 + 430 = 464 | 11:14, 16–17 |
| Peleg | 1757 | Heber 34 | 1996 | 30 + 209 = 239 | 11:16, 18–19 |
| Rehu | 1787 | Peleg 30 | 2026 | 32 + 207 = 239 | 11:18, 20–21 |
| Serug | 1819 | Rehu 32 | 2049 | 30 + 200 = 230 | 11:20, 22–23 |
| Nahor | 1849 | Serug 30 | 1997 | 29 + 119 = 148 | 11:22, 24–25 |
| Terach | 1878 | Nahor 29 | 2083 | 205 (staat er) | 11:24, 32 |
| Abram | 2008 | Terach 130 (berekend) | 2183 | 175 (staat er) | 11:26, 32; 12:4; Hand. 7:4; 25:7–8 |

Alle jaren hebben status `berekend`. Namen zoals in `personen.js` (Terach, niet ‘Terah’ zoals de SV-tekst; Nahor is
`nahor_serug`, in deze laag gewoon ‘Nahor’ omdat zijn kleinzoon er niet in staat; Abram is `abraham` met alias Abram).
Eigen woorden in de rollen; letterlijke SV-citaten alleen kort tussen ‘…’ (Genesis 10:21, 10:25, 12:1; Handelingen 7:4).
Voorcontrole 21-11-2026: het citaat bij Arfachsad volgt de Statenvertaling ook in de kleine letter (‘twee jaren na den
vloed’, midden in Genesis 11:10), en Lamech ‘Deze zal ons troosten’ heeft nu de verwijzing (Genesis 5:29) erachter.

Nieuwe gebeurtenissen: Arfachsad geboren (1658, Genesis 11:10), Abram geboren (2008, belangrijk) en Abram trekt uit Haran
na de dood van Terach (2083, belangrijk, verhaal v8). Geen plaats (de laag heeft geen kaart; zie `kaartUitleg`).

Koppelingen (gecontroleerd in `public/bijbelreis/geschiedenissen/ot-1.js`):

| verhaal | jaar | hoe |
|---|---|---|
| v7 De toren van Babel (Genesis 11:1–9) | 1657–2008, `benaderd` | De Bijbel noemt geen jaar. De band loopt van na de zondvloed tot de geboorte van Abram, omdat Genesis het in die volgorde vertelt; de toelichting zegt dat de volgorde van vertellen niet zeker de volgorde van gebeuren is. |
| v8 Abram gaat op weg naar Kanaän (Genesis 11:27–12:20) | 2083, `berekend` | het jaar waarin Terach sterft en Abram (75) uit Haran trekt |

v2, v4, v5 en v6 bleven ongewijzigd.

## 3. Septuagint en Kaïnan (informatieblok, status `historisch`)

- **Bron**: L. C. L. Brenton, *The Septuagint Version of the Old Testament* (1851), Genesis 11, publiek domein,
  https://ebible.org/eng-Brenton/GEN11.htm (geraadpleegd 21-11-2026), met de afwijkende getallen van de Codex
  Alexandrinus in de voetnoten. Ter controle: de tabel in ‘Genealogies of Genesis’ (Wikipedia, Engels),
  https://en.wikipedia.org/wiki/Genealogies_of_Genesis (geraadpleegd 21-11-2026, kolom Septuagint (Lucian)).
- **Getallen** (vader bij de geboorte van de zoon): Arfachsad 135, Kaïnan 130, Selah 130, Heber 134, Peleg 130, Rehu 132,
  Serug 130, Nahor 179 (Alexandrinus: 79), Terach 70. Masoretisch: 35, —, 30, 34, 30, 32, 30, 29, 70. Verschil van de
  zondvloed tot Abram: 880 jaar (Alexandrinus 780); in de unittest nagerekend.
- **Kaïnan** staat ook in Lukas 3:36 (SV: ‘Kaïnan, den zoon van Arfaxad’), niet in Genesis 11:12 en 1 Kronieken 1:24.
  Dat staat er alleen als feit, zonder uitleg over hoe dat te verklaren is.
- **Samaritaanse Pentateuch**: ook hogere getallen, geen Kaïnan (Wikipedia-tabel); alleen in één bijzin genoemd.

## 4. Door een mens na te lezen

1. De zin bij Babel (v7): is ‘Genesis vertelt het na de zondvloed en vóór de geboorte van Abram … Of het ook in die
   volgorde gebeurde, en wanneer precies, staat er niet’ eerlijk en duidelijk genoeg, en is de band 1657–2008 gewenst?
2. De uitleg ‘Abram: Terach 130 of 70?’ (toon, eenvoud, geen theologische discussie).
3. Het Septuagint-blok: kort genoeg voor ‘Over deze tijdlijn’? Getallen uit één uitgave (Brenton) plus Wikipedia, niet
   uit een kritische tekstuitgave nagekeken.
4. Het nieuwe blok ‘Waarom geen jaartal voor Christus?’ (zonder Ussher).
5. Heber leeft uitgerekend nog vier jaar na Abram (2187 tegenover 2183); dat staat alleen in de getallen, niet als tekst.

## 5. Licenties

- Statenvertaling (editie 1888): publiek domein; transcriptie CC0 (`data/statenvertaling`).
- Brenton (1851): publiek domein; alleen getallen gebruikt.
- Wikipedia: CC BY-SA 4.0; alleen getallen gebruikt, geen tekst overgenomen.
- Het boek ‘Chronologie van de wereldgeschiedenis’ is niet gebruikt.
