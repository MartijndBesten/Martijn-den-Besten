# Verantwoording: Jakob – samenhang, Genesis 33 en uitleg als uitleg (15-11-2026)

Werkdocument, geen tekst in de app. Opdracht van Martijn (15-11-2026, na een preek over Genesis 32), letterlijk in de
brief van de coördinator. Regel: uitzondering ‘Jakob (Genesis 25–35)’ in `../../bijbelreis-uitleg/README.md` §7.
Schrijver en tweede lezer: een AI (Claude). Er heeft geen theoloog of predikant naar gekeken.

Gewijzigd: `public/bijbelreis/inhoud/genesis.js` (deel `izak` stap 5–6, deel `jakob`, deel `jakob-jabbok`),
`public/bijbelreis/geschiedenissen/ot-1.js` (geschiedenis 15 en 17), `public/bijbelreis/indeling.js` (kop van het laatste
onderdeel van 17), `docs/bijbelreis-niveaus/werk/uit/batch-03.json` (17 a/b/c), controlebestanden `jakob-jabbok.txt`,
`genesis.txt`, `ot-1.txt`, tests en e2e (aantal stappen), en de documentatie.

## Per opdrachtpunt

### 1. Vertrek: Genesis 25 en 27 in hun verband
- **Was:** `izak` stap 0–1 (25:19–34) en stap 5 (Genesis 27) vertelden de feiten; stap 6 zei in eigen woorden dat Ezau
  Jakob wilde doden. Het deel `jakob` begon met “Hij is slim, soms te slim” (een oordeel dat de tekst niet geeft).
- **Veranderd:** `izak` stap 5 krijgt in het weetje de tekst zelf: Izak noemt het ‘bedrog’ (27:35), ‘ook zal hij
  gezegend wezen’ (27:33), Ezau over eerstgeboorte en zegen (27:36), en de godsspraak van vóór de geboorte (25:23).
  Stap 6 citeert 27:41 en 27:43 letterlijk en wijst vooruit naar 28:15. De `intro` van `jakob` is herschreven tot de
  hele lijn: bedrog (27:35), vlucht (27:41–45), belofte (28:15), opdracht tot terugkeer (31:3, 13), gebed (32:9–12),
  worsteling (32:24–30), omhelzing (33:4), Bethel (35:1–15). Geschiedenis 15: `betekenis` zegt nu met de tekst wat
  eerst als eigen oordeel stond (“De Bijbel praat het bedrog niet goed” → Izak noemt het ‘bedrog’, 27:35).
- **Bijbelgedeelten:** Genesis 25:19–34; 27; 28:15.

### 2. Bethel: Genesis 28:10–22
- **Was:** `jakob` stap 0 citeerde 28:15 in eigen woorden tussen “ ”; het weetje ging over Abrahams altaar.
- **Veranderd:** 28:15 staat er nu letterlijk (‘Ik ben met u, en Ik zal u behoeden overal, waarheen gij trekken zult,
  en Ik zal u wederbrengen in dit land’), plus de gelofte (28:20–21). Nieuw `onthul`-blok ‘de belofte van Bethel op
  Jakobs reis’: 28:15 → 31:3 en 31:13 → 32:12 → 35:3. Het weetje is uitleg vanuit het Nieuwe Testament (`fs: "u"`), als
  uitleg benoemd: Johannes 1:51–52 en de ladder als beeld van Christus bij Calvijn en Henry; “Genesis 28 zelf legt de
  ladder niet uit.” Kruisverwijzing Johannes 1:52 → 1:51–52 (klopt in SV-1888 én HSV), nu letterlijk aangehaald, en
  “Jezus” → “de Heere Jezus”. Zelfde in geschiedenis 15 (`cross`).
- **Bijbelgedeelten:** Genesis 28:10–22; 31:3, 11–13; 32:12; 35:1–3; Johannes 1:51–52 (SV-1888: 1:52).

### 3. De jaren bij Laban en Gods opdracht om terug te keren: Genesis 29–31
- **Was:** `jakob` stap 1–4 vertelden 29–31; 31:3 stond in eigen woorden tussen “ ”, zonder ‘en tot uw maagschap’.
- **Veranderd:** stap 4 citeert 31:3 letterlijk; het weetje (`fs: "b"`) haalt 31:11–13 aan (‘Ik ben die God van
  Beth-el, alwaar gij het opgerichte teken gezalfd hebt, waar gij Mij een gelofte beloofd hebt’) en verbindt het met
  28:18–22. Nieuwe meerkeuzevraag (31:13). Stap 2 (“Jakob had zijn vader bedrogen … nu wordt hij zelf bedrogen”): alleen
  `fs` van "u" naar "b" (het zijn twee Bijbelplaatsen naast elkaar). Geschiedenis 16 is niet gewijzigd: daar stond
  geen uitleg als feit.
- **Bijbelgedeelten:** Genesis 29–31.

### 4. Terugreis: angst, gebed, voorbereidingen (Genesis 32)
- **Was:** `jakob-jabbok` stap 0–4 volgen 32:1–21 vers voor vers; stap 3 liet al zien dat Jakob Gods woorden herhaalt
  (31:3; 28:14–15). `jakob` stap 5 vertelde hetzelfde nog eens, met de volledige dierenlijst.
- **Veranderd:** `jakob` stap 5 blijft kort, citeert 32:7 letterlijk en verwijst naar het uitgebreide deel; het
  weetje laat zien dat 32:9 en 32:12 teruggrijpen op 31:3 en 28:13–15 (de dierenlijst staat al in `jakob-jabbok`
  stap 4). `jakob-jabbok` stap 0–5 inhoudelijk ongewijzigd. Nieuwe reflectievraag over het gebed (zie onder).
- **Bijbelgedeelten:** Genesis 32:1–23; 31:3; 28:13–15.

### 5. De nacht bij de Jabbok (Genesis 32:22–32)
- **Was:** `jakob-jabbok` stap 6 vertelde als feit: “De Man … is de Engel van de HEERE: de Zoon van God”. Stap 7 gaf de
  betekenis van Israël. Geschiedenis 17 (na u01) gaf alleen de Schriftgegevens, zonder uitleg.
- **Veranderd:**
  - Stap 6 `txt` ongewijzigd (alleen tekst: ‘een Man’, ‘Hij’). Het weetje is nu `fs: "b"`: ‘een man’ (32:24), de
    hoofdletters in de SV, 32:30 en Hosea 12:4 en 12:5 letterlijk (‘den Engel’).
  - Stap 7: het weetje is `fs: "u"`, als uitleg benoemd: “Dit is uitleg: veel christelijke uitleggers, ook de
    kanttekeningen bij de Statenvertaling, zien in deze Man de Zoon van God …”. Nieuw `onthul`-blok ‘Om over na te
    denken’: (a) ‘wie zijt gij, mijn zoon?’ / ‘Ik ben Ezau uw eerstgeborene’ (27:18–19) naast ‘Hoe is uw naam?’
    (32:27), uitdrukkelijk als vergelijking “die Genesis niet zelf maakt”; (b) wat 32:28 als reden geeft, met Hosea
    12:5; (c) “De nieuwe naam betekent niet dat Jakobs leven daarna zonder moeite is” met Genesis 34, 35:16–19 en 37.
  - De heup: alleen wat er staat (32:25, 31–32); geen symbolische uitleg, nergens.
  - `jakob` stap 6: ‘aangezicht van God’ stond ten onrechte tussen enkele aanhalingstekens (geen SV-tekst) → “ ”;
    het weetje verwijst voor de vraag wie de Man is naar `jakob-jabbok`.
  - Geschiedenis 17: `betekenis` noemt ‘een man’, 32:30 en ‘den Engel’ en daarna, als uitleg benoemd, de
    kanttekeningen. Niveau b: één zin “Veel uitleggers zien in de Man de Zoon van God; dat is uitleg.” Niveau c: blok
    ‘Wie is de Man?’ eindigt met de benoemde uitleg; het blok ‘Van Jakob naar Israël’ is vervangen door ‘Om over na te
    denken’ (de naamlijn 25:26 → 27:36 → 32:28 en twee vragen). Niveau a: alleen kindertaal; de `samen`-tip heeft één
    zin uitleg, als uitleg benoemd.
- **Bijbelgedeelten:** Genesis 32:22–32; 27:18–19, 36; 25:26; 34; 35:10, 16–19; 37; Hosea 12:4–5.

### 6. De ontmoeting met Ezau (Genesis 33)
- **Was:** `jakob-jabbok` eindigde bij 33:4; `jakob` stap 7 vatte Genesis 33 samen (“Ezau rent op hem af”: ‘rent’
  staat er niet). Geschiedenis 17 eindigde bij Pniël; Genesis 33 kwam in geen enkele geschiedenis voor.
- **Veranderd:**
  - `jakob-jabbok` heet nu Genesis 32–33 (`ref`), met achteraan stap 10 (33:5–11, ‘Als het aangezicht van God’) en
    stap 11 (33:12–20, ‘Sukkoth en Sichem: een altaar’; Ezau terug naar Seïr in bruin, Jakob Pniël → Sukkoth → Sichem
    in teal, beide `recon: 1`). Stap 9 kreeg een weetje dat 27:41 naast 33:4 legt, en eerlijk zegt dat Genesis 33 niet
    vertelt wat Ezau van gedachten deed veranderen, met Jakobs gebed (32:11) ernaast. Stap 10 legt 33:10 naast 32:30 en
    32:20 (het woord ‘aangezicht’); wat Jakob met 33:10 bedoelt, staat er als uitleg van de kanttekeningen. Nieuw:
    `stat` (33:10), `cross` (35:1–3 in plaats van 33:10; 2 Korinthe 5:18–19 als “geen uitleg van Genesis 33, maar een
    verband dat christenen leggen”), twee meerkeuzevragen (33:10; 33:16–17), kaartvraag Sukkoth, volgordevraag met
    ‘Een altaar bij Sichem’, twee reizen in `trips`, en `bij: "jakob"`.
  - `jakob` stap 7: ‘rent’ → ‘loopt hem tegemoet’; 33:10 en 33:20 letterlijk; het weetje legt 27:41 naast 33:4.
  - `jakob` stap 8 (Bethel): het weetje citeert 35:1 en 35:3, die zelf terugwijzen naar de vlucht en de belofte.
  - Geschiedenis 17: `ref` Genesis 31–33, stap `genesis:jakob:7` erbij, de vertelling loopt door tot Sukkoth en
    Sichem, ontdek-volgorde met ‘Ezau loopt Jakob tegemoet en kust hem’, kruisverwijzing 35:3; kop van het laatste
    onderdeel (`indeling.js`) ‘De Jabbok en de ontmoeting met Ezau’. Niveau a: stap 3 en 4 samengevoegd, nieuwe stap
    bij `genesis:jakob:7`, vraag over 33:4. Niveau b: onderdeel ‘Ezau komt’ (994 tekens totaal); het onderdeel over de
    steenhoop is in het eerste opgegaan; de volgordevraag gebruikt nu Gilead i.p.v. de steenhoop.
- **Bijbelgedeelten:** Genesis 33; 35:1–15; 2 Korinthe 5:18–19; Jozua 24:32.

## Reflectievragen (`denk`)

Deel `jakob`:
1. In Bethel belooft God: ‘Ik ben met u’ (Genesis 28:15). Op welke momenten in Jakobs reis zie je die belofte terugkomen?
2. Ezau zei: ‘ik zal mijn broeder Jakob doden’ (Genesis 27:41). Twintig jaar later loopt hij Jakob tegemoet en kust hem (Genesis 33:4). Wat is er tussen die twee momenten allemaal gebeurd?
3. In Bethel noemt God Zich ‘de God van uw vader Abraham, en de God van Izak’ (Genesis 28:13). In Sichem noemt Jakob zijn altaar ‘De God Israëls is God!’ (Genesis 33:20). Wat is er in de tussentijd veranderd?

Deel `jakob-jabbok`:
1. Jakob bidt met de woorden die God eerder tegen hem zei (Genesis 31:3; 32:9–12). Waarom zou hij dat doen?
2. Jakob vraagt: ‘Geef toch Uw naam te kennen.’ Hij krijgt geen naam, maar wel een zegen (Genesis 32:29). Wat valt je daaraan op?
3. Bij Pniël zegt Jakob: ‘ik heb God gezien van aangezicht tot aangezicht’ (Genesis 32:30). Tegen Ezau zegt hij: ‘als had ik Gods aangezicht gezien’ (Genesis 33:10). Waarom zou hij die woorden gebruiken?
4. Izak vroeg: ‘wie zijt gij, mijn zoon?’ (Genesis 27:18). Bij de Jabbok vraagt de Man: ‘Hoe is uw naam?’ (Genesis 32:27). Wat valt je op als je die twee vragen naast elkaar legt?

Geschiedenis 17, niveau c, blok ‘Om over na te denken’: de vragen 4 en 1 van `jakob-jabbok` in eigen bewoording.

Geen vraag legt een ervaring op (“Wanneer heb jij …”) of stuurt naar één goed antwoord. Een unittest
(`tests/bijbelreis.test.ts`) controleert vorm en letterlijke citaten.

## Dit is uitleg, geen tekst

| Keuze | Waar | Hoe benoemd | Grond (wat werkelijk is nagekeken) |
| --- | --- | --- | --- |
| De Man bij de Jabbok is de Zoon van God | `jakob-jabbok` stap 7 (fact u); geschiedenis 17 `betekenis`, b, c, a-`samen` | “Dit is uitleg: veel christelijke uitleggers, ook de kanttekeningen …” | **Kanttekeningen** Gen. 32:24, dbnl.org/tekst/_sta001stat01_01/_sta001stat01_01_0040.php (15-11-2026): “D. de Sone Gods, die sich in een menschelick lichaem hier vertoonde; gelijckmen afnemen kan uyt vers 28. en de 30.” **Calvijn** Gen. 32:24 (biblehub.com/commentaries/calvin/genesis/32.htm): “not … Satan, or any mortal man, … but God himself”; hij noemt hier niet de Zoon of Christus. **Henry** Gen. 32 (biblehub.com/commentaries/mhcw/genesis/32.htm): laat het open (“Some think … a created angel …; Others think it was … the eternal Word”). Daarom “veel christelijke uitleggers, ook de kanttekeningen”, en niet “alle”. |
| “Die later mens werd” | idem | binnen dezelfde benoemde uitleg | Niet letterlijk in de kanttekening bij 32:24 (die zegt “in een menschelick lichaem”); toegevoegd op aanwijzing van de opdracht, als duiding van ‘de Zoon van God’ vanuit het Nieuwe Testament. |
| De ladder als beeld van Christus | `jakob` stap 0 (fact u); geschiedenis 15 `cross` | “Uitleg vanuit het Nieuwe Testament … christelijke uitleggers, zoals Calvijn en Matthew Henry” | **Johannes 1:51–52** (SV-1888 1:52) letterlijk. **Calvijn** Gen. 28:12 (biblehub): “If, then, we say that the ladder is a figure of Christ, the exposition will not be forced”, met verwijzing naar Joh. 1:51. **Henry** Gen. 28 (biblehub): “He is this ladder …”; “To this vision our Saviour alludes”. **Kanttekeningen** Gen. 28:12 (dbnl _0036): alleen de verwijzing “Iohan. 1.51.”, zonder uitleg van de ladder. |
| Betekenis van 33:10 (‘als had ik Gods aangezicht gezien’) | `jakob-jabbok` stap 10 (fact u) | “Dit is uitleg: de kanttekeningen … verklaren het zo” | **Kanttekeningen** Gen. 33:10 (dbnl _0041): “Als of hy seyde: gelijck de gunste Godes den mensche seer verquickt: alsoo ben ick oock door dese uwe minnelicke [ontvangenisse verquickt]” (het slot is in de geraadpleegde weergave afgekapt). **Henry** Gen. 33:10: Ezau verzoend zien zoals hij God verzoend wilde zien; hij legt niet uitdrukkelijk het verband met Pniël. Het verband met 32:30 en 32:20 is in de tekst gegeven als het woord ‘aangezicht’, niet als uitleg van de bedoeling. |
| Verzoening met God (2 Korinthe 5:18–19) | `jakob-jabbok` `cross` | “Geen uitleg van Genesis 33, maar een verband dat christenen leggen” | Alleen de tekst van 2 Korinthe 5:18–19 (SV). **Niet** in een commentaar nagekeken; daarom uitdrukkelijk als verband en niet als uitleg. |
| Israël = “vorst met God” / “strijder met God” | `jakob` stap 6, `jakob-jabbok` stap 7–8 (onthul) | als betekenis van een naam, met de reden uit 32:28 erbij | **Kanttekeningen** 32:28: “D. Een Vorst Godts, ofte, die princelicke macht heeft met Godt”. **Calvijn** 32:28: “a Prince of God”. **Henry**: “a prince with God”. “Strijder met God” stond al in het deel; niet afzonderlijk nagekeken (gangbare weergave). |
| Pniël = “aangezicht van God”; Sukkoth = “hutten”; El-Elohe-Israël | `jakob`, `jakob-jabbok`, geschiedenis 17 | woordverklaring | Pniël: 32:30 zelf en **kanttekeningen** 32:30 (“D. Godts aensichte”). Sukkoth: 33:17 zelf (‘hutten … daarom noemde hij … Sukkoth’). El-Elohe-Israël: **kanttekeningen** 33:20 (“Hebr. El Elohe Israël”). |
| ‘Wie zijt gij, mijn zoon?’ naast ‘Hoe is uw naam?’ | `jakob-jabbok` stap 7 (onthul), `denk`, geschiedenis 17 c | “Genesis legt die twee vragen niet zelf naast elkaar … een vergelijking om over na te denken” | Geen bron: een overdenking op aanwijzing van de opdracht. Niet als schuldbelijdenis verteld. |
| Wat Ezau van gedachten deed veranderen | `jakob-jabbok` stap 9 | “Genesis 33 vertelt niet …”; alleen Jakobs gebed (32:11) ernaast | Henry ziet er Gods hand in (“God had the hearts of all men in his hands”); dat is bewust niet als feit verteld. |
| De heup | nergens | weggelaten | Calvijn (32:25) geeft een geestelijke uitleg (overwinnen “only by being injured and wounded”); bewust niet opgenomen (opdracht; pastorale zorg: geen “God stuurt lijden om je iets te leren”). |

## Wat niet gewijzigd is
- De stappen 0–9 van `jakob-jabbok` en alle stappen van `jakob` en `izak`: niet verplaatst, niet verwijderd; titels van
  `jakob` gelijk (e2e). Plaatsen, zekerheid en dateringen ongewijzigd; geen nieuwe plaatsen of tussenpunten.
- Geschiedenis 16 en de niveaus van 15 en 16: daar stond geen uitleg als feit.
- Buiten Genesis 25–35 is de regel van `../../bijbelreis-uitleg/README.md` §1 niet aangeraakt.

## Niet nagekeken
- Kanttekeningen bij Hosea 12:4–5 en Johannes 1:51.
- Calvijn en Henry bij 2 Korinthe 5 en Romeinen 5:10.
- De bronnen zijn gelezen via een samenvattend leesprogramma (WebFetch); de aangehaalde zinnen komen uit die
  weergave en zijn niet regel voor regel in een gedrukte uitgave vergeleken.
