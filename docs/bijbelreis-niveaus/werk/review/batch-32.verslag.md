# Controleverslag batch 32 (161–164)

Tweede lezer: onafhankelijke redactie van de nieuwe basisrecords in `public/bijbelreis/geschiedenissen/nt-5.js`, de niveauversies in `werk/uit/batch-32.json` en de indeling in `werk/uit/indeling-32.json`. Elke bewering is zin voor zin vergeleken met de Statenvertaling: de invoer `werk/invoer/batch-32.md` en de verwijzingen in C, opgezocht met `node scripts/sv.mjs`.

Controles na de redactie:
- `node scripts/niveaus-controle.mjs docs/bijbelreis-niveaus/werk/uit/batch-32.json` → `OK: 4 geschiedenis(sen), 12 versies.`
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/nt-5.txt` → `199 gecontroleerd, 0 mis`. Regels aangepast of toegevoegd voor Johannes 4:41–42 en 4:52, Markus 7:28–30 en Mattheüs 15:28.
- `npx vitest run tests/bijbelreis.test.ts`: 28 geslaagd, 2 fouten, 1 overgeslagen. De twee fouten zijn verwacht: de indeling van 151–166 en de niveaus van 151 en 161–164 zijn nog niet samengevoegd. Er zijn geen andere fouten over 161–164.
- Indeling opnieuw nagelopen na de wijzigingen in `uitleg`. Elk onderdeel begint letterlijk en uniek op een zinsbegin. Het eerste onderdeel is "". Koppen hebben 2 of meer woorden, ≤ 42 tekens en geen eindpunt of vraagteken. De stappen horen bij de geschiedenis. Niets gewijzigd in `indeling-32.json`.

**Hersteld: 5 inhoudelijke fouten in de basisrecords (B1–B5) en 18 in de niveauversies (N1–N18).** Daarnaast zijn er een paar kleine verbeteringen, apart genoemd. Alle 12 versies staan op "gecontroleerd".

## 161 De Samaritaanse vrouw bij de put

Basisrecord:
- **B1** `uitleg`: “Onderweg hoort hij dat de koorts zijn zoon verliet op het uur dat de Heere Jezus dat zei” legde de conclusie bij de knechten. Zij noemen alleen het uur; de vader ‘bekende dan’ dat het hetzelfde uur was (4:52–53). Nu: “Onderweg hoort hij op welk uur de koorts zijn zoon verliet: het is hetzelfde uur waarop de Heere Jezus dat zei.”
- **B2** `betekenis`: “De Samaritanen zeggen na twee dagen”: ‘na twee dagen’ staat er niet (4:40–42). Nu: “Veel Samaritanen zeggen tegen de vrouw”.
- Klein: “de Messias die komen zal” → “de Messias Die komen zal” (eerbiedige hoofdletter).

Niveaus:
- **N1** A stap 4: “De vrouw weet dat de Christus zal komen, Die God beloofd heeft” legde uitleg in haar kennis. Nu staan eerst haar eigen woorden (“Ik weet dat de Messias komt”, 4:25), daarna de uitleg door de verteller.
- **N2** B: ‘Messias’ werd niet uitgelegd voor een kind van 8. Nu: “de Messias, de beloofde Christus” (4:25). Om binnen 1000 tekens te blijven is elders ingekort (nu 991 tekens).
- **N3** B vraag 2: `why` aangevuld met Johannes 4:29. Dat zij zegt ‘alles, wat ik gedaan heb’, staat daar, niet in 4:18–19.
- **N4** C “Waar en wanneer”: “De vrouw wijst naar ‘dezen berg’”: dat gebaar staat niet in de tekst. Nu: “spreekt over”.
- **N5** C “Waar en wanneer”, volgens het besluit:
  - het zesde uur staat er nu als uitleg: het SV-citaat ‘Het was omtrent de zesde ure’, en daarna “telt men de uren vanaf zonsopgang, dan is dat rond het midden van de dag; niet alle uitleggers rekenen de uren bij Johannes zo”;
  - de kaart toonde Kana als “waarschijnlijke plaats”, maar de invoer noemt Kana ‘betwist’; dat staat er nu;
  - de datering heet nu uitdrukkelijk een reconstructie.
- **N6** C “Joden en Samaritanen”: “Zij vreesden de HEERE en dienden ook hun eigen goden” kon gelezen worden als een uitspraak over de Samaritanen in de tijd van de Heere Jezus. 2 Koningen 17:33 gaat over de volken die de koning van Assyrië daar liet wonen. Nu: “Die ‘vreesden den HEERE, en dienden ook hun goden’”, met ‘in de plaats van de Israëlieten’ (17:24).

Bewust zo gelaten:
- A laat de vijf mannen en het gesprek over aanbidden weg. `samen` noemt beide met verwijzing, zoals §3 vraagt.
- B “Hij weet alles wat zij gedaan heeft”: sober, en steunt op 4:29 en 4:39.
- B “Onderweg hoort hij dat de koorts op dat uur geweken is”: inhoudelijk juist (4:52–53). Kort gehouden vanwege de tekenlimiet.

## 162 De Heere Jezus in de synagoge van Nazareth

Basisrecord: geen inhoudelijke fouten gevonden. `na: 93` blijft, volgens het besluit. De vertelling botst daar niet mee: wat ‘in Kapernaum geschied is’ (4:23) komt in de app al eerder, in 91.

Niveaus:
- **N7** B: “Hij noemt Elia … En Hij noemt Naäman … Die twee kwamen niet uit Israël”. ‘Die twee’ sloeg grammaticaal op Elia en Naäman, en Elia was wel een Israëliet.
  - Nu: “De weduwe en Naäman kwamen niet uit Israël.”
  - Het contrast uit de tekst is toegevoegd: ‘vele weduwen in Israël’ en ‘vele melaatsen’ (4:25–27).
  - Elders ingekort (nu 998 tekens).
- **N8** A stap 5: “Wat hier staat, gebeurt vandaag” → “Vandaag is uitgekomen wat hier geschreven staat”. Lukas 4:21 zegt ‘is … vervuld’, in de voltooide tijd.
- **N9** A `samen`: “van alle melaatsen alleen Naäman” overdreef. Nu: “van de vele melaatsen in Israël” (4:27).
- **N10** C “Wat ‘gezalfd’ betekent”: “Wie in Israël een bijzonder ambt kreeg, werd met olie gezalfd” was te algemeen. Nu: “priesters en koningen …, en soms ook een profeet”, wat past bij de voorbeelden (Leviticus 8:12; 1 Samuël 16:13; 1 Koningen 19:16).
- **N11** C “Waar en wanneer”: “Na deze sabbat ging de Heere Jezus naar Kapernaüm (Lukas 4:31)” suggereerde dat Hij pas hierna in Kapernaüm kwam. Dat botst met de volgorde in de app: 162 staat na 91.
  - Nu: “Lukas vertelt daarna dat Hij naar Kapernaüm ging (Lukas 4:31), maar al in Nazareth spreekt de Heere Jezus over wat ‘in Kapernaum geschied is’ (Lukas 4:23).”
  - Vraag 3 zegt nu ‘volgens Lukas’.
  - De datering heet een reconstructie.
- Klein: in C blok 2 de verwijzing aangevuld tot 1 Koningen 17:1, 9, 15. Dat de weduwe hem te eten gaf, staat in vers 15.

Bewust zo gelaten:
- C noemt niet dat uitleggers verschillen over Mattheüs 13 en Markus 6 (schrijfwijzer §2). De `tijdNoot` noemt het wel.
- Kop “Geen profeet in zijn vaderland” (in B en in de indeling): kleine letter, omdat het een algemeen spreekwoord is, zoals ‘in zijn vaderland’ in de SV (4:24).

## 163 De jongeling van Naïn

Basisrecord: geen inhoudelijke fouten gevonden.

Niveaus:
- **N12** B: de kop “God heeft Zijn volk bezocht” en vraag 3 (“Waarom zeiden de mensen dat God Zijn volk bezocht had?”) steunden op woorden die niet in de B-tekst stonden. Het citaat is aangevuld met ‘en God heeft Zijn volk bezocht’ (7:16).
- **N13** C blok 1: “Hij spreekt met Zijn eigen gezag” was een conclusie van de schrijver. Nu staat er alleen wat de tekst zegt: “Bij Naïn staat niet dat de Heere Jezus bidt. Hij zegt: ‘Jongeling, Ik zeg u, sta op!’” Het contrast met Elia en Elisa (1 Koningen 17:21–22; 2 Koningen 4:33) blijft staan, omdat het een waarneming aan de tekst is.
- Klein:
  - B: ‘schare’ uitgelegd (“een menigte”);
  - C: de datering heet een reconstructie.

Bewust zo gelaten:
- A: “Huil niet” en “Jonge man” staan tussen “ ”, als navertelling om voor te lezen.
- A: “vol ontzag” voor ‘vreze beving hen allen’. Dat past bij kleuters, en het blijft gaan om eerbiedige vrees.
- “Vlak bij Naïn ligt Sunem” komt uit het reisdeel.

## 164 De Kananese vrouw en de dove man

Basisrecord (besluit: Markus en Mattheüs uit elkaar houden):
- **B3** `uitleg`: ‘O vrouw! groot is uw geloof’ (Mattheüs 15:28) stond op de plaats van Markus 7:29. Nu staat Markus eerst: ‘Om dezes woords wil ga heen, de duivel is uit uw dochter uitgevaren’, en thuis ligt de dochter op bed. Daarna volgt apart: “Mattheüs schrijft dat de Heere Jezus tegen haar zegt: ‘O vrouw! groot is uw geloof.’”
- **B4** `uitleg`: de genezingen op de berg staan alleen in Mattheüs (15:29–31), maar stonden zonder bron midden in het verhaal van Markus. Nu: “Mattheüs vertelt dat Hij op een berg bij het meer nog veel zieken geneest.”
- **B5** `betekenis`: “Ze vraagt alleen om de kruimels” staat er niet; zij antwoordt dat ook de hondjes van de kruimels eten (Markus 7:28). Nu staat er dat antwoord, en daarna: “Bij Mattheüs zegt de Heere Jezus tegen haar: ‘groot is uw geloof’”.
- In `nt-5.txt` zijn de regels voor Markus 7:28, 7:29 en 7:30 en voor Mattheüs 15:28 daarop aangepast.

Niveaus:
- **N14** A stap 4: “Wat een groot geloof!” komt uit Mattheüs, maar stond in het verhaal van Markus.
  - A volgt nu Markus 7:29: “Omdat u dat zegt, mag u naar huis gaan.”
  - In `samen` staat Mattheüs 15:28 apart, met bron.
  - De zin over de leer van de Farizeeën is uit `samen` gehaald, om binnen 520 tekens te blijven.
- **N15** C blok 1: “Toch bleef zij vragen” → “Toch kwam zij en aanbad Hem: ‘Heere, help mij!’”. Dat volgt Mattheüs 15:25 letterlijker.
- **N16** C blok 1: “zij hoorde bij de volken die vóór Israël in Kanaän woonden” had geen grond in de tekst. Nu: “uit de volken van Kanaän: ‘Kanaän gewon Sidon, zijn eerstgeborene’ (Genesis 10:15)”.
- **N17** C vraag 3: het foute antwoord “De delen van Dalmanutha” is de naam die Markus voor dezelfde streek gebruikt, en de vertelling noemt Dalmanutha. Daarmee was het een strikvraag. Vervangen door “Het land Gennesaret”.
- **N18** C blok 3: “ten noorden van Galilea” → “ten noordwesten” (de ligging van Tyrus en Sidon).

Bewust zo gelaten:
- De vrouw heeft twee namen. Titel en record noemen haar “Kananese vrouw”, zoals Mattheüs. `wie`, A, B en C noemen haar een Griekse uit Syro-Fenicië, zoals Markus. De vertelling noemt beide namen, met de evangelist erbij.
- “Met de kinderen bedoelt Hij Israël” (B en `samen`): algemeen aanvaarde uitleg, met Mattheüs 15:24, zoals in het reisdeel.
- C citeert ‘Laat haar van U’ letterlijk, zonder het uit te leggen als ‘wegsturen’.
- A en B volgen Markus. Wat uit Mattheüs komt, staat in C blok 1 en C vraag 1 en in `samen` bij A, steeds met de naam Mattheüs erbij.

## Op concept gebleven

Geen. Alle 12 versies (161–164, a/b/c) staan op "gecontroleerd".

## Opmerkingen over invoer en reisdeel (niet zelf gewijzigd, buiten de toegestane bestanden)

- In de `tijdNoot` van de records 161–163 en van het reisdeel is de zin “wie de kruisiging in 33 n.Chr. plaatst, komt ongeveer drie jaar later uit” onduidelijk. Waarschijnlijk is bedoeld dat deze gebeurtenis dan rond 31–32 n.Chr. valt. Voorstel: dat bij een volgende redactie van de dateringen eenduidig maken.
- Het reisdeel (`fact` bij `jezus-1:nt-samaria-nain:0`) zegt zonder voorbehoud “Het zesde uur is ongeveer twaalf uur ’s middags”. Volgens het besluit voor 161 C hoort daar dezelfde nuance bij.
