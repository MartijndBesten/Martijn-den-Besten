# Audit personen: `BR.mensen` (25 oktober 2026)

Nieuw: `public/bijbelreis/personen.js` (`BR.mensen`), `scripts/bijbel-controle/personen.txt` (650 regels) en
`scripts/bijbelreis-personen-check.mjs`. Inhoudsbestanden zijn niet gewijzigd.

## Resultaat

- **196 personen**: 185 komen in de reis voor (`who` van stappen of deel-intro's, `wie`-lijsten, Genesis-stamboom), 11 staan
  er alleen om familie te tonen (`boek: []`): Haran, Milka, Bethuël, Asnath, Kehath, Salmon, Zeruja, Manasse (koning),
  Amon, Ahikam, Sealthiël.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt` → **650 gecontroleerd, 0 mis**. Elke familieband
  (v/m/p), elke alias, leeftijd, geboorte/dood en elke verwijzing in `elders`/`vervolg` heeft minstens één regel; de check
  hieronder dwingt dat af voor alle verwijzingen. Ook de citaten in `kort`/`elders` volgen de SV-tekst.
- `node scripts/bijbelreis-personen-check.mjs` → **geen fouten**, 4 waarschuwingen (zie onder).

## Hoe `who`-namen gekoppeld worden

Zoals `app.js` (`MENS_IDX`/`mensOf`): naam = `n` of een `alias`, **alleen binnen de boeken in `boek`**. `boek` bevat daarom
elk bijbelreis-boek waarin de naam in `who`, in de `wie`-lijst (bij ‘Amram en Jochebed’ e.d. telt elke naam) of in de
stamboom (`rijen` en `leeftijden`) staat. Bij gelijke namen ontwart `boek` het:

| naam | personen (id → boek) |
| --- | --- |
| Darius | `darius_meder` → daniel · `darius_pers` → ezra |
| Joas | `joas_abiezriet` (vader van Gideon) → richteren · `joas_israel` (koning) → 2koningen |
| Jerobeam | `jerobeam_1` (zoon van Nebat) → 1koningen · `jerobeam_2` (zoon van Joas, wie-lijst van Jona) → jona |
| Jabin | `jabin_jozua` → jozua · `jabin_richteren` → richteren (Jozua doodde de eerste: Jozua 11:10) |
| Gad | `gad` (zoon van Jakob) → genesis · `gad_ziener` → 2samuel |
| Manasse | `manasse` (zoon van Jozef) → genesis · `manasse_juda` → geen |
| Nahor | `nahor_serug` (opa, alias ‘Nahor (opa)’ zoals de stamboom hem nu noemt) en `nahor` (broer), beide genesis |
| Farao | alleen `necho` (n ‘Farao Necho’, alias ‘Farao’) → 2koningen |

Aliassen uit de Bijbel: Abram, Sarai, Israël, Edom, Zafnath-Paneah, Reüel, Hosea (Jozua), Jerubbaäl, Mara, Esbaäl,
Merib-Baäl, Bath-Sua, Jedid-Jah, Ornan, Eljakim, Jechonia, Chonja, Mattanja, Beltsazar, Sadrach, Mesach, Abed-Nego,
Hadassa, Jozua (Jesua, Haggaï 1:1). Volgorde in het bestand: `nahor_serug` staat vóór `nahor`, zodat ‘Nahor’ in de
stamboom-rij naar de broer gaat.

**Genegeerd** (groepen, staan nooit in `BR.mensen`): Volk, Leger, Soldaten, Spionnen, Priesters, Profeten, Vijanden,
Knechten, Boden, Broers, Familie, Kinderen, Mannen, Mensen, Koningen, Bezoekers, Vrouwen, Oudsten, Arbeiders, Melaatsen,
Lopers, Bouwers, Zeelieden, Raven, Vrienden, Amalek, Filistijnen, Midianieten, Gibeonieten.
**Rollen zonder naam, bewust niet opgenomen:** Farao (Genesis, Exodus), Farao’s dochter, Knecht (Gen 24; de tekst noemt
geen naam), Schenker, Bakker, Losser/De andere losser, Wapendrager, Koningin/De koningin van Scheba, Koning (Jona; 2 Kon 6:26),
Weduwe, Zoon, Jongen, Engel, Meisje/Het meisje uit Israël, Sunamitische. Enige uitzondering: ‘Farao’ in 2 Koningen is
eenduidig de benoemde Farao Necho (2 Koningen 23:29).

## Plekken waar één `who`-naam in één boek twee personen bedoelt

1. **Exodus, ‘Farao’**: `mozes:0` (Exodus 1, de farao die Jozef niet kende) en `uittocht:0/1/4` (de farao van de plagen)
   zijn verschillende koningen: ‘de koning van Egypte stierf’ (Exodus 2:23). Niet gekoppeld (rol), maar de **wie-tekst van
   Farao in exodus.js voegt ze samen** (‘Hij maakte Israël tot slaven en liet de jongetjes in de Nijl gooien. Tien plagen
   lang…’). Graag aanpassen, bijv. ‘Twee farao’s, de Bijbel noemt geen namen: de eerste … stierf (2:23); de tweede …’.
2. **Genesis, ‘Abimelech’** (`abraham:17/20`, Gen 20–21; `izak:2/4`, Gen 26): de Bijbel zegt niet of dit dezelfde koning is
   (ruim 60 jaar ertussen; beide keren met legeroverste Pichol). Eén persoon `abimelech` met beide verbonden in `elders`;
   `kort` zegt ‘een koning Abimelech’.
3. **1 Samuël, ‘Wapendrager’**: `saul-david:0` is die van Jonathan, `saul-david:10` die van Saul. Rol, niet gekoppeld.

## Genealogische twistpunten: wat gekozen is

- **Sara** `v: terach`: Abraham zegt ‘zij is mijns vaders dochter, maar niet mijner moeder dochter’ (Genesis 20:12). Dat
  zijn Abrahams eigen woorden, maar de Bijbel spreekt ze niet tegen.
- **Laban** `v: bethuel` (Genesis 28:5). Genesis 29:5 noemt hem ‘zoon van Nahor’, dus kleinzoon.
- **Jochebed** `v: levi` (‘de dochter van Levi’, Numeri 26:59); Exodus 6:20 noemt haar de tante van Amram, en dat klopt hiermee.
- **Boaz** `m: rachab` (Mattheüs 1:5). Dat dit de Rachab uit Jericho is, is de gangbare lezing maar staat niet letterlijk in
  de tekst. De wie-tekst van Boaz zegt ‘Rachab uit Jericho’.
- **Orpa–Chiljon**: niet als `p` gekoppeld. Het volgt alleen uit Ruth 1:4 + 4:10; dat staat in `kort`.
- **Zeruja** `v: isai` (‘hun zusters waren Zeruja en Abigaïl’, 1 Kronieken 2:13–16). 2 Samuël 17:25 noemt Abigaïl
  ‘dochter van Nahas, zuster van Zeruja’.
- **Abjathar** `v: achimelech` (1 Samuël 22:20). 2 Samuël 8:17 draait het om (‘Achimelech, de zoon van Abjathar’), en
  Markus 2:26 noemt Abjathar bij de toonbroden. Alleen in `elders`.
- **Zedekia** `v: josia` (Jeremia 1:3; 1 Kronieken 3:15; ‘oom’ van Jojachin in 2 Koningen 24:17). 2 Kronieken 36:10 noemt
  hem ‘zijn broeder’, en 1 Kronieken 3:16 noemt nog een Zedekia als zoon van Jojakim.
- **Jojachin**: 18 jaar volgens 2 Koningen 24:8. 2 Kronieken 36:9 (SV) zegt ‘acht jaren’. Alleen 18 is opgenomen.
- **Sealthiël** `v: jojachin` (Mattheüs 1:12; 1 Kronieken 3:17, waar de SV ‘Assir; zijn zoon was Sealthiel’ leest).
  **Zerubbabel** `v: sealthiel` (Ezra 3:2, Haggaï 1:1). 1 Kronieken 3:19 rekent hem tot de kinderen van Pedaja.
- **Belsazar** `v: nebukadnezar`: Daniël 5:2, 11 en 18 zeggen ‘zijn/uw vader Nebukadnezar’. Buiten de Bijbel is hij
  bekend als zoon van Nabonidus (‘vader’ kan voorvader betekenen).
- **Darius de Meder**: Daniël 9:1 noemt hem ‘zoon van Ahasveros’. Dat is een andere Ahasveros dan die uit Esther, en
  daarom niet gekoppeld.
- **Jethro/Reüel**: Numeri 10:29 (‘Hobab, de zoon van Reüel’) is niet verwerkt.
- **Benhadad**: de koning van 2 Koningen 6:24. 2 Koningen 8:7–15 en 13:3 noemen nog een of meer andere koningen
  Benhadad. Er is geen dood opgenomen.
- **Mordechai**: Esther 2:6 (‘die weggevoerd was … met Jechonia’) kan op Mordechai of op Kis slaan. Niet gebruikt.
- **Zacharia**: Ezra 5:1 zegt ‘zoon van Iddo’, Zacharia 1:1 ‘zoon van Berechja, zoon van Iddo’. `zacharia.json` ontbreekt,
  dus dit is niet gecontroleerd en niet gebruikt.

## Waarschuwingen van de check (geen fout)

- ‘Nahor’ heeft in genesis twee personen. De stamboom-rij bedoelt de broer en de app kiest die ook; de opa heet in de
  leeftijdenlijst nu ‘Nahor (opa)’.
- Hananja, Misaël en Azarja hebben `boek: ["daniel"]`, maar de inhoud noemt alleen de groep ‘Vrienden’. Splits ‘Vrienden’
  in `who`/`wie` in de drie namen als ze aanklikbaar moeten worden.

## Voor de hoofdagent

- Exodus: pas de wie-tekst van Farao aan (zie hierboven).
- Abimelech: kies zo nodig of de inhoud het als één of twee koningen vertelt (nu: niet vastgelegd).
- De Bijbelteksten voor Zacharia, Judas, 1 Johannes, 2 Timotheüs en Prediker ontbreken in `public/bijbelreis/bijbel/`. Er
  zijn daarom geen verwijzingen naar die boeken gebruikt (bijv. Judas 14 bij Henoch, 1 Johannes 3:12 bij Kaïn).
- `personen.js` staat al in `bijbelreis.html` (vóór de inhoud) en de app gebruikt `BR.mensen`. Voeg
  `node scripts/bijbelreis-personen-check.mjs` toe aan de vaste controles. Draai na elke inhoudswijziging opnieuw: nieuwe
  `who`-namen zonder persoon of rol geven een fout.
