# Audit personen versie 3.0: NT, Leviticus, Profeten, Joas en de geschiedenissen (25 oktober 2026)

Gewijzigd: `public/bijbelreis/personen.js`, `scripts/bijbelreis-personen-check.mjs` en `scripts/bijbel-controle/personen.txt`.
Inhoudsbestanden, geschiedenissen en `app.js` zijn niet gewijzigd.

## Resultaat

- **281 personen** (was 196): 266 komen in de reis voor, 15 staan er alleen voor de familie (`boek: []`). Nieuw zijn de
  4 familiepersonen Joram (koning van Juda), Ahazia (koning van Juda), Jonas (vader van Petrus) en Zebedeüs.
- `node scripts/bijbelreis-personen-check.mjs` → **geen fouten** (was 223). Eén waarschuwing blijft: ‘Nahor’ (zie
  `personen.md`). De waarschuwingen over Hananja, Misaël en Azarja zijn weg, want geschiedenis 73 noemt ze nu bij naam.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt` → **1.094 gecontroleerd, 0 mis** (was 650). Dit is
  gecontroleerd tegen de nieuwe SV-bestanden (editie 1888, echte SV-nummering). De oude 650 regels slagen ook nog.
- `npx vitest run tests/bijbelreis.test.ts -t personen` → geslaagd.

## Wijzigingen in het checkscript

- Het script laadt nu ook `geschiedenissen/*.js` (in de volgorde van de HTML, daarna wat nog in de map staat).
- **Nieuwe controle 4**: elke naam in `wie` van een geschiedenis moet te koppelen zijn. Bij een geschiedenis met stappen
  gaat dat via `n`/`alias` binnen de boeken van die stappen (`boek:deel:index`). Een naam die in één boek twee personen
  kan zijn, is een fout. Een naam die per boek een andere persoon is, geeft een waarschuwing. Bij een geschiedenis zonder
  stappen gaat het via de globale naam: de eerste persoon in `personen.js`, zoals `MENS_IDX["*|naam"]`. Meer kandidaten
  geeft dan een waarschuwing. Nu hebben alle geschiedenissen met namen ook stappen.
- Namen uit de geschiedenissen tellen mee voor de waarschuwing ‘boek X, maar de naam staat daar niet’. Daarom staat
  Jesaja nu ook in `openbaring` (geschiedenis 150).
- Een regel in een wie-lijst wordt nu gesplitst op ‘ en ’, ‘, ’ en ‘ / ’ (bijv. ‘Silas, Timotheüs en Lydia’, ‘Saulus / Paulus’).
- Lijst van groepen uitgebreid: Discipelen, Apostelen, Schare, Engelen, Herders, Wijzen, Joden, Ouders, Farizeeën,
  Sadduceeën, Overpriesters, Tollenaars, Handelaars, Moordenaars, Raad, Wachters, Weduwen, Broeders, Reisgenoten,
  Ouderlingen, Bemanning, Eilanders, Gemeente.
- Lijst van rollen uitgebreid: Discipel (de discipel die Jezus liefhad, of de tweede Emmaüsganger; niet ingevuld als Johannes),
  Hoofdman, Overste, Vrouw, Verlamde, Zieke man, Blindgeborene, Wetgeleerde, Waterzuchtige man, Samaritaan, Rijke
  jongeman, Dochter van Herodias, Dienstmaagd, Kreupele, Kamerling, Gevangenbewaarder en Neef.
- **Satan** staat bij de rollen, met de opmerking ‘geen mens’. Hij krijgt geen persoonskaart (zie de vragen hieronder).

## Nieuwe personen

**OT.** Nadab, Abihu, Ithamar (`v: aaron`; Numeri 3:2, Exodus 28:1) · Athalia, Joseba (alias Jozabath, 2 Kronieken
22:11; `v: joram_juda`, `p: jojada`), Jojada (130 jaar, 2 Kronieken 24:15), **Joas van Juda** (`joas_juda`,
`v: ahazia_juda`; 7 jaar, 2 Koningen 11:21), Hazaël · Jeremia, Ebed-Melech, Johanan, Maleachi. De controle op de
geschiedenissen vond nog vier namen: **Abisaï** (`m: zeruja`), **Achitofel**, **Rabsake** en **Hulda**.

**Bestaande personen aangevuld** (`boek`): Mozes (+leviticus, jezus-2), Aäron en Eleazar (+leviticus), Elia (+jezus-2),
Jesaja (+profeten, openbaring), Gedalja, Nebuzaradan en Zerubbabel (+profeten), Zacharia (+profeten). Zacharia: nu
‘de zoon van Berechja, de zoon van Iddo’ (Zacharia 1:1), want `zacharia.json` bestaat nu. Ezra 5:1 (‘zoon van Iddo’) staat
in `elders`. Gedalja kreeg Jeremia 40:13–16 en 41:2 in `vervolg`, Zerubbabel Zacharia 4:9.

**NT.** Jezus, Maria, Jozef (`jozef_nt`), Zacharias, Elisabeth, Johannes de Doper, Gabriël, Simeon (`simeon_nt`), Anna,
Herodes (`herodes`, Mattheüs 2), Herodes Antipas, Herodias, Herodes (Agrippa I) (`herodes_agrippa`), Petrus, Andreas,
Jakobus, Johannes (apostel), Johannes (Openbaring, `johannes_patmos`), Filippus (apostel), Nathanaël, Thomas (alias
Didymus), Judas Iskariot, Nicodemus, Jaïrus, Simon de Farizeeër, Lazarus, Martha, Maria van Bethanië, Zacheüs, Bartimeüs,
Kajafas, Annas, Pilatus, Barabbas, Simon van Cyrene, Jozef van Arimathea, Malchus, Maria Magdalena, Kleopas, Stefanus,
Filippus de evangelist, Barnabas (alias Joses), Ananias en Saffira, Ananias van Damascus, Gamaliël, Paulus (alias Saulus),
Simon de tovenaar, Eneas, Tabitha (alias Dorkas), Cornelius, Rhode, Johannes Markus (alias Markus), Agabus, Elymas
(alias Bar-Jezus), Sergius Paulus, Silas, Timotheüs, Lydia, Felix, Festus, Julius, Aristarchus, Publius en Antipas.
Agrippa II (Handelingen 25–26) staat niet in `who`/`wie` en is daarom niet opgenomen. Hij staat alleen in `elders` van Festus.

## Keuzes bij namen die meer dan één persoon kunnen zijn

| naam | personen (id → boek) |
| --- | --- |
| Herodes | `herodes` → jezus-1 · `herodes_antipas` (n ‘Herodes Antipas’) → jezus-2, jezus-3 · `herodes_agrippa` (alias ‘Herodes (Agrippa I)’) → handelingen |
| Maria | `maria` (moeder) → jezus-1, jezus-3 · `maria_bethanie` (alias ‘Maria’, want de wie-lijst van jezus-2 zegt ‘Martha en Maria’) → jezus-2 · `maria_magdalena` → jezus-3 |
| Johannes | `johannes` (apostel) → jezus-1/2/3, handelingen · `johannes_patmos` → openbaring · `johannes_doper` (n ‘Johannes de Doper’, geen alias ‘Johannes’) |
| Filippus | `filippus` (apostel) → jezus-1, jezus-2 · `filippus_evangelist` (alias ‘Filippus’) → handelingen |
| Ananias | `ananias` (man van Saffira) → handelingen · `ananias_damascus` (n ‘Ananias van Damascus’) → handelingen |
| Simon | alias van `petrus`. Andere Simons hebben een eigen naam (‘Simon de Farizeeër’, ‘Simon van Cyrene’, ‘Simon de tovenaar’) |
| Jozef / Simeon | `jozef_nt`, `simeon_nt` → jezus-1. Die uit Genesis blijven `jozef` en `simeon` (globaal ‘*’ wint de eerste, dus Genesis) |
| Joas | `joas_juda` heeft als n **‘Joas van Juda’** en geen alias ‘Joas’. In 2 Koningen is ‘Joas’ al `joas_israel` (deel Elisa). Met n ‘Joas’ zou die naam in dat boek naar twee personen wijzen. |
| Jezus | `jezus` met alias ‘De Heere Jezus’ (wie-lijst jezus-3) en ‘De Zoon des mensen’ (wie-lijst openbaring; Openbaring 1:13, 17–18) |

## Zorgvuldig vastgelegd

- **Jezus**: `m: "maria"`, geen `v`. `kort` volgt Lukas 1:35 en Mattheüs 1:18–25. Lukas 3:23 staat in `elders` (‘omtrent
  dertig jaren … zijnde (alzo men meende) de zoon van Jozef’). Leeftijd alleen 12 (Lukas 2:42); ‘omtrent dertig’ staat niet als getal.
  `geb` Lukas 2:6–7, `dood` Johannes 19:30, `vervolg` opstanding, hemelvaart en Openbaring 1:17–18. Er is geen afbeeldingsveld
  in het schema; voor Jezus en Gabriël is niets toegevoegd.
- **Jozef (NT)**: geen `v`. Mattheüs 1:16 noemt Jakob als zijn vader, Lukas 3:23 ‘Heli’. Jozef en Maria zijn elkaars `p`,
  Jezus heeft geen `v`. Daarom toont de app Jezus niet als kind van Jozef.
- **Johannes in Openbaring** is een aparte persoon. De Bijbel noemt ‘Zijn dienstknecht Johannes’ (Openbaring 1:1, 4, 9;
  22:8), maar zegt niet welke Johannes. `kort` zegt: ‘volgens de oude overlevering de apostel Johannes’.
- **De discipel die Jezus liefhad**: blijft een rol. Hij is niet ingevuld als Johannes.
- **Maria Magdalena**: alleen Lukas 8:2 (‘zeven duivelen’), het kruis, het graf en Markus 16:9. Zij is niet gelijkgesteld
  aan de zondares uit Lukas 7.
- **Petrus en Andreas**: `v: jonas`. Petrus is ‘Simon, de zoon van Jonas’ (Johannes 1:43; 21:15) en Andreas ‘de broeder
  van Simon Petrus’ (Johannes 1:41). Dat Andreas dezelfde vader heeft, is de gewone lezing van ‘broeder’, maar het staat er
  niet letterlijk. Jakobus en Johannes: `v: zebedeus` (Mattheüs 4:21, letterlijk ‘hun vader Zebedeüs’).
- **Herodes Antipas**: geen `v: herodes`. Dat hij een zoon van Herodes de Grote is, staat niet in de Bijbel (Josephus).
  Herodias en Antipas zijn `p` (Markus 6:17: ‘omdat hij haar getrouwd had’). ‘Historici noemen hem …’ staat als zodanig in
  `kort` bij de drie Herodessen.
- **Athalia**: geen `v`. 2 Koningen 8:26 zegt ‘de dochter van Omri’. Volgens 8:18 was ‘de dochter van Achab’ de vrouw van
  Joram. Ahazia van Juda: `v: joram_juda`, `m: athalia`. Joram–Athalia is niet als `p` gekoppeld, omdat dat alleen uit
  8:18 en 8:26 af te leiden is.
- **Jeremia**: geen `v`. Jeremia 1:1 noemt ‘Hilkia’, maar zegt niet dat dit de hogepriester Hilkia uit 2 Koningen 22 is.
- **Johannes Markus**: Kolossenzen 4:10 (‘Markus, de neef van Barnabas’) en 2 Timotheüs 4:11 staan met de woorden ‘Paulus
  noemt/schrijft’. Dat het evangelie naar Markus van hem is, staat er niet in.
- **Timotheüs**: Eunice en Lois staan alleen in `kort`/`elders` (2 Timotheüs 1:5), niet als personen.
- **Barnabas en Markus**: ‘neef’ alleen als citaat van Kolossenzen 4:10.

## Voor de hoofdagent

1. **`app.js`, wie-lijst**: `wieInfoBoek` koppelt `name.split(/ en /)[0]`. ‘Saulus / Paulus’ en ‘Silas, Timotheüs en Lydia’
   (eerste deel ‘Silas, Timotheüs’) vinden daardoor geen persoon. Splits op `/ en |, | \/ /`, zoals het checkscript.
2. **`app.js`, geschiedenissen**: `renderVerhaal` maakt de chips met `personChip([n])`, en die gebruikt het *huidige* `boek`,
   niet de boeken van de stappen. Het checkscript gaat uit van mensOf(naam, boek van de stap), en zonder stappen van
   `MENS_IDX["*|naam"]`. Pas de app daarop aan, anders koppelen bijv. ‘Maria’ en ‘Johannes’ verkeerd.
3. **`app.js`, `GROUPS`** (regel 15) kent de nieuwe NT-groepen (Discipelen, Schare, Apostelen …) niet. Die chips tonen nu de
   naam plus de tweede waarde, in plaats van alleen het aantal, zoals bij ‘Volk’.
4. **`nt-handelingen.js`, wie-tekst van Johannes**: ‘Later ziet hij op Patmos de Openbaring (Openbaring 1:9)’ stelt de
   overlevering als feit. Openbaring 1:9 noemt alleen ‘Johannes’. Bijvoorbeeld: ‘Volgens de oude overlevering is hij de
   Johannes die op Patmos de Openbaring zag.’
5. **Wie-lijst handelingen, ‘Ananias’ (drie mannen)**: de app koppelt die naam aan de man van Saffira. De Ananias van
   Damascus heeft een eigen naam in `who`. De hogepriester Ananias (23:2) staat niet in `BR.mensen`.
6. **Satan** (jezus-1, stap nt-begin:2, geschiedenis 88) staat bewust niet in `BR.mensen`. Als hij toch een kaart moet krijgen,
   is dat een keuze voor Martijn.
7. **Rabsake** staat er als naam, zoals in de SV. Dat het eigenlijk een titel is, staat niet in `kort`.
