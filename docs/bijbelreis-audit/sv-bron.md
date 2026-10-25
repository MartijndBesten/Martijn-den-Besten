# Nieuwe Bijbeltekst: Statenvertaling editie 1888 (25 oktober 2026)

De Bijbeltekst in `public/bijbelreis/bijbel/<slug>.json` komt nu uit de Statenvertaling, editie 1888 (CC0-transcriptie,
github.com/jajpater/statenvertaling, vergeleken met de GBS-module), omgezet met `scripts/bijbelreis-sv.py`. Dit verslag
beschrijft waarom de bron is vervangen en wat er daarna in de controleregels en in de site is aangepast.

## Waarom de oude bron is vervangen

De oude tekst (getbible.net) leek op de Statenvertaling, maar was het niet zuiver. Drie soorten fouten:

1. **Gemoderniseerde zinnen.** Genesis 2:2 had ‘op de zevende dag’; de SV heeft ‘op den zevenden dag’. Zo ook
   ‘Uit de mond der kinderkens’ (SV: ‘Uit den mond’, Psalm 8:3), ‘voorbij gaan’ (SV: ‘voorbijgaan’, Exodus 12:13),
   ‘meester-dromer’ (SV: ‘meesterdromer’, Genesis 37:19).
2. **Andere of extra woorden.** Markus 14:45 had ‘Rabbi, Rabbi’; de SV heeft één keer ‘Rabbi’. Jeremia 25:1 had
   ‘Nebukadrezar’; de SV heeft ‘Nebukadnezar’. Exodus 32:28 had ‘omtrent drie duizend man’; de SV heeft ‘drie duizend man’.
   Markus 4:40 had ‘Hoe hebt gij geen geloof?’; de SV heeft ‘Hebt gij geen geloof?’.
3. **Engelse versnummering of samengevoegde verzen.** Daniël 5:31 (Darius, 62 jaar) is in de SV Daniël 6:1, en Daniël 6
   telt daardoor 29 verzen. Ook anders in de SV: Exodus 6:1 = SV 5:24 (en Exodus 6 schuift één vers), Jesaja 9:1–21 =
   SV 8:23 en 9:1–20, Micha 5:2 = SV 5:1, Hosea 2, 12 en 14, Haggaï 2, Prediker 5, Job 38–41, Johannes 1:51 = SV 1:52.
   Daarnaast waren verzen samengevoegd: het laatste vers van 62 psalmen (bijv. Psalm 51:20–21), 1 Koningen 22:21–22,
   1 Samuël 24:22–23, Nehemia 8:18–19, Romeinen 7:25–26, Handelingen 19:40–41, 3 Johannes 1:14–15; Openbaring 12:18 ontbrak.

Steekproeven van de nieuwe tekst tegen statenvertaling.net (GBS-tekst) klopten, ook waar die afwijkt van de
Jongbloed-editie op bible.com: Exodus 32:28 zonder ‘omtrent’, 1 Samuël 14:50 ‘Abi-ner’, Markus 14:45 ‘Rabbi’, Exodus 5:24.

## Werkwijze

- Alle controlebestanden (behalve `nt-4.txt`) gedraaid: 235 missers. Per misser is de oude tekst (commit `8d47fd5`)
  naast de nieuwe gelegd en is gezocht in welk vers de regel nu wél past.
- Oude en nieuwe tekst zijn per vers op elkaar gelegd om alle verschuivingen in de nummering te vinden. Daarna zijn
  álle verwijzingen in de site naar die hoofdstukken nagelopen, ook zonder controleregel (`inhoud/*.js`,
  `geschiedenissen/*.js`, `personen.js`, `plaatsen.js`, ook kale verwijzingen tussen haakjes zoals ‘(6:26)’).
- Alle citaten tussen ‘…’ in de site zijn vergeleken met de oude en nieuwe tekst: wat alleen in de oude tekst stond, is
  aangepast. Hetzelfde voor reeksen van vier woorden buiten aanhalingstekens (antwoorden, wie-zei-het).
- Niet gewijzigd (andere agent): `inhoud/nt-handelingen.js`, `inhoud/nt-openbaring.js`, `geschiedenissen/nt-4.js`,
  `plaatsen/nt-4.js`, `scripts/bijbel-controle/nt-4.txt`. Daarin staan geen verwijzingen naar verschoven verzen.
- Stappen, ids en stapsleutels zijn niet gewijzigd.

## Aangepaste verwijzingen in de site

| Was | Wordt | Plek in de site |
| --- | --- | --- |
| Daniël 5:31 | Daniël 6:1 | `inhoud/daniel.js` wie-lijst (Darius, 62 jaar); `personen.js` darius_meder `leeftijd` |
| Daniël 5:31–6:28 | Daniël 6 | `inhoud/daniel.js` stap `daniel:daniel:7` (`ref`) |
| (6:26), (6:28) | (6:27), (6:29) | `inhoud/daniel.js` stap `daniel:daniel:7` (`fact`) |
| Daniël 6:10 | Daniël 6:11 | `inhoud/daniel.js` quiz `why`; `geschiedenissen/ot-3.js` nr 75 (`betekenis`, quiz `why`); kernwoord gebed (`uitleg`, `refs`) |
| Daniël 6:22 | Daniël 6:23 | `inhoud/daniel.js` quiz `why`; `ot-3.js` nr 75 quiz `why` |
| Daniël 6:23 | Daniël 6:24 | `ot-3.js` nr 75 `betekenis` |
| Daniël 6:1 / 6:7 / 6:17 | Daniël 6:2 / 6:8 / 6:18 | `ot-3.js` nr 75 quiz `why` (120 stadhouders, 30 dagen, verzegeld) |
| Daniël 5:30–31 | Daniël 5:30; 6:1 | `ot-3.js` nr 75 `tijdNoot`; `plaatsen.js` dan_medie `d` |
| Daniël 6:8 | Daniël 6:9 | `inhoud/esther.js` `cross` (wet van Meden en Perzen) |
| Exodus 6:20 | Exodus 6:19 | `inhoud/exodus.js` wie-lijst en stap-`fact` (Amram en Jochebed); `ot-1.js` nr 21 (ontdek, `cross`); `personen.js` amram `leeftijd` en commentaar bij jochebed |
| Exodus 6:16 | Exodus 6:15 | `personen.js` levi `leeftijd` (137) |
| Exodus 6:16–20 | Exodus 6:15–19 | `personen.js` levi `vervolg`; `inhoud/genesis.js` stamboom (Levi) |
| Exodus 6:18 | Exodus 6:17 | `personen.js` kehath `leeftijd` (133) |
| Johannes 1:51 | Johannes 1:52 | `inhoud/genesis.js` deel jakob `cross`; `ot-1.js` nr 15 `cross` (Jakobsladder) |
| Johannes 1:35–51 | Johannes 1:35–52 | `inhoud/nt-jezus-1.js` stap ‘De eerste discipelen’ (`ref`); `nt-1.js` nr 89 `ref` |
| Hosea 12:3–4 | Hosea 12:4–5 | `inhoud/genesis.js` deel jakob `cross`; `ot-1.js` nr 17 `cross`; `personen.js` jakob `elders` |
| Hosea 12:4 | Hosea 12:5 | `ot-1.js` nr 17 (tekst ‘weende en smeekte Hem’) |
| Hosea 12:12 | Hosea 12:13 | `ot-1.js` nr 16 `cross` |
| Hosea 2:15 | Hosea 2:14 | `inhoud/jozua.js` stap-`fact` (dal Achor); `ot-2.js` nr 40 `cross` |
| Jesaja 9:2 | Jesaja 9:1 | `inhoud/nt-jezus-1.js` deel nt-galilea `cross` |
| Jesaja 9:4 | Jesaja 9:3 | `inhoud/richteren.js` deel debora `cross`; `ot-2.js` nr 43 `cross` |
| Jesaja 9:6 | Jesaja 9:5 | `inhoud/nt-jezus-1.js` deel nt-geboorte `cross`; `nt-1.js` nr 83 `cross` |
| Jesaja 9:7 | Jesaja 9:6 | `personen.js` david `elders` |
| Micha 5:2 | Micha 5:1 | `inhoud/nt-jezus-1.js` deel nt-geboorte `cross` en stap-`fact`; `nt-1.js` nr 83 (`betekenis`, `cross`), nr 85 (`betekenis`, ontdek-verbanden, quiz `why`) |
| Haggaï 2:23 | Haggaï 2:24 | `personen.js` zerubbabel `elders` (zegelring) |

Niet verschoven en dus ongewijzigd: verwijzingen naar psalmopschriften (Psalm 3:1, 34:1, 51:2, 52:2) en Psalm 51:19,
1 Koningen 22:29–39, 1 Samuël 24 tot vers 21, Johannes 1 tot vers 50, Hosea 11:1, Exodus 5:1–23.

In de controlebestanden zijn dezelfde verschuivingen doorgevoerd (o.a. alle Daniël 6-regels in `daniel.txt`, `ot-3.txt`,
`personen.txt` en `esther.txt`; Exodus 6 in `exodus.txt`, `genesis.txt`, `ot-1.txt`, `personen.txt`; Exodus 6:1 → 5:24;
Hosea, Jesaja, Micha, Johannes 1:52 en Haggaï 2:24), plus Nehemia 8:18 → 8:18–19 en 1 Koningen 18:34 → 18:33–34 (de
vier kruiken staan in de SV in vers 33). De opmerking bovenaan `nt-1.txt` over de SV-nummering is bijgewerkt.
In totaal 237 regels in 20 controlebestanden; de overige aanpassingen zijn alleen woordkeus in de regex (‘de’ → ‘den’,
‘Farao’s’ → `Farao.?s`, ‘legde’ → ‘leide’, ‘tienduizend’ → `tien ?duizend` enz.).

## Gecorrigeerde citaten (letterlijk gelijk aan de SV)

| Plek | Was | Wordt |
| --- | --- | --- |
| `inhoud/daniel.js` `cross`; `ot-3.js` nr 73; `personen.js` daniel | ‘Daniël, de profeet’ | ‘Daniël, den profeet’ (Mattheüs 24:15) |
| `ot-3.js` nr 70 (2×) | ‘…meer dan Jonas is hier!’ | ‘…meer dan Jona is hier!’ (Mattheüs 12:41) |
| `ot-3.js` kernwoord profeet | ‘van den Heilige Geest gedreven’ | ‘van den Heiligen Geest gedreven’ |
| `ot-3.js` nr 69 quizantwoord | Laat ons niet vergaan om de ziel van deze man | Laat ons toch niet vergaan om dezes mans ziel (Jona 1:14) |
| `ot-2.js` nr 43 | ‘den dag der Midianieten’ | ‘ten dage der Midianieten’ (Jesaja 9:3) |
| `inhoud/richteren.js` debora `cross` | ‘Als op de dag van Midian’ | ‘Gelijk ten dage der Midianieten’ |
| `inhoud/richteren.js` stap Simson | ‘Spijs ging uit van de eter, en zoetigheid van de sterke.’ | ‘Spijze ging uit van den eter, en zoetigheid ging uit van den sterke.’ |
| `ot-2.js` kernwoord leven | ‘de adem des levens’ | ‘den adem des levens’ |
| `ot-1.js` nr 18 (2×); `inhoud/genesis.js` stap Jozef | ‘meester-dromer’ | ‘meesterdromer’ |
| `ot-1.js` nr 19 | ‘…een man vinden als deze, in welken…’ | ‘…als dezen, in welken…’ |
| `ot-1.js` nr 25 | ‘…zal Ik ulieden voorbij gaan.’ | ‘…voorbijgaan.’ |
| `inhoud/exodus.js` stap-`fact` | ‘aan alle goden der Egyptenaren’ | ‘aan al de goden der Egyptenaren’ |
| `inhoud/genesis.js` deel abraham | ‘in goede ouderdom’ | ‘in goeden ouderdom’ |
| `inhoud/genesis.js` stap Jozef | ‘…is de Egyptenaren een gruwel’ | ‘…is den Egyptenaren een gruwel’ |
| `nt-1.js` nr 85 | ‘Ik heb Mijn zoon uit Egypte uitgeroepen.’ | ‘…geroepen.’ (Hosea 11:1) |
| `nt-1.js` nr 94 (2×) | ‘Hij doet de storm stilstaan…’ | ‘Hij doet den storm stilstaan…’ |
| `nt-1.js` nr 94 quizantwoord; `inhoud/nt-jezus-1.js` stap | ‘Hoe hebt gij geen geloof?’ | ‘Hebt gij geen geloof?’ (Markus 4:40) |
| `nt-1.js` nr 83; `inhoud/nt-jezus-1.js` (2×) | ‘…Heerser zal zijn in Israel’ | ‘…in Israël’ |
| `nt-2.js` nr 108; `nt-3.js` nr 121; `inhoud/nt-jezus-2.js` | ‘…niet gekomen, om gediend te worden…’ | ‘…niet gekomen om gediend te worden…’ |
| `nt-2.js` nr 114 (2×) | ‘…maar de nederigen geeft Hij genade’ | ‘…maar den nederigen…’ (1 Petrus 5:5) |
| `nt-2.js` nr 114 wie-zei-het | ‘…gelijk de anderen mensen.’ | ‘…gelijk de andere mensen.’ |
| `nt-3.js` nr 118 | ‘Uit de mond der kinderkens…’ | ‘Uit den mond…’ (Psalm 8:3) |
| `nt-3.js` nr 120 (2×) | ‘…noch de ure, in welke…’ | ‘…in dewelke…’ (Mattheüs 25:13) |
| `nt-3.js` nr 123 | ‘Abba, Vader, alle dingen…’ | ‘Abba, Vader! alle dingen…’ |
| `inhoud/nt-jezus-2.js` | ‘…aan Uw rechter hand, en de ander…’ | ‘…aan Uw rechter-, en de ander…’ (Markus 10:37) |
| `inhoud/nt-jezus-3.js` | ‘…dat een van u Mij zal verraden.’ | ‘…dat een van u, Mij zal verraden.’ (Mattheüs 26:21, zo ook statenvertaling.net) |
| `inhoud/nt-jezus-3.js` | ‘…geërgerd worden in deze nacht.’ | ‘…in dezen nacht.’ |
| `inhoud/nt-jezus-3.js` | ‘…dopende in de Naam des Vaders…’ | ‘…in den Naam…’ |
| `inhoud/profeten.js` | ‘…van denwelken geschreven staat: Ziet, Ik zend…’ | ‘…van dewelken geschreven staat: Ziet, Ik zende…’ |
| `inhoud/ezra.js` | ‘op de stoel van Mozes’ | ‘op den stoel van Mozes’ |

## Inhoudelijke correcties

1. **Markus 14:45 — Judas zegt één keer ‘Rabbi’.** `nt-3.js` nr 123: ‘Rabbi, Rabbi’ → ‘Rabbi’ in de uitleg en in het
   goede quizantwoord.
2. **Jeremia 25:1 noemt ‘het eerste jaar van Nebukadnezar’**, niet ‘Nebukadrezar’ (`ot-3.js` nr 73, `tijdNoot`).
3. **Exodus 32:28 noemt ‘drie duizend man’, zonder ‘omtrent’.** ‘ongeveer drieduizend’ → ‘drieduizend’ in
   `inhoud/exodus.js` (deel sinai) en `ot-1.js` nr 30.
4. **‘In nieuwere vertalingen Micha 5:1 / Jesaja 9:5 / Jesaja 9:1’ was onjuist**: de SV heeft dezelfde nummering. Deze
   opmerkingen zijn verwijderd (`nt-1.js` nr 83, `inhoud/nt-jezus-1.js`).

## Gevonden fouten in de nieuwe bron (niet door mij hersteld)

De transcriptie bevat op drie plaatsen Strong-nummers of een afgebroken vers. Dit hoort in `ERRATA` van
`scripts/bijbelreis-sv.py` (tekst volgens statenvertaling.net):

- 2 Kronieken 32:10 staat er als `Zo3541`; moet zijn: ‘Zo zegt Sanherib, de koning van Assyrië: Waarom vertrouwt gij,
  dat gij te Jeruzalem blijft in de vesting?’
- 1 Koningen 3:4: ‘offerde5927 Salomo’ → ‘offerde Salomo’.
- Numeri 19:13: ‘Al wie een dode4191, het dode lichaam’ → ‘Al wie een dode, het dode lichaam’.

Verder zijn er kleine kommaverschillen met statenvertaling.net (bijv. Jona 4:1 ‘Dit verdroot, Jona’, Markus 1:15
‘gelooft, het Evangelie’). De controleregels zijn daar met `,?` neutraal gemaakt; de citaten in de site volgen de gedrukte
tekst zonder die komma.

## Niet aangepakt (buiten deze opdracht)

Ongeveer 560 fragmenten tussen ‘…’ staan niet letterlijk in de SV (oud én nieuw). Het gaat vooral om directe rede in
eigen woorden; dat lag er al vóór de bronwissel. Een paar lijken bedoeld als SV-citaat (bijv. 1 Samuël 17:47, Lukas 22:7).
Een aparte ronde kan die letterlijk maken of de aanhalingstekens weghalen.

## Controles na afloop

- `python3 scripts/bijbel-check.py` op alle 21 controlebestanden behalve `nt-4.txt`: 0 mis (7.579 regels).
- `npx vitest run tests/bijbelreis.test.ts`: 16 geslaagd, 1 overgeslagen.
- `node --check` op alle gewijzigde JS-bestanden: in orde.
- `node scripts/bijbelreis-personen-check.mjs`: 223 fouten, allemaal over namen in `who`/wie-lijsten van Leviticus,
  Joas (2 Koningen), Profeten, NT en Openbaring die niet aan `BR.mensen` gekoppeld zijn. Die stonden er al vóór deze
  wijziging; geen ervan komt uit deze aanpassing (wie-lijsten en `boek` zijn niet aangeraakt).
