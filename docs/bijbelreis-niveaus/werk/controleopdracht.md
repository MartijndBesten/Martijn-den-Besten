<!-- Opdracht voor een redacteur/tweede lezer (mens, Claude of Codex). Vervang {BATCH} door het batchnummer. -->
Je bent de tweede lezer (redacteur) van leeftijdsversies van Bijbelse geschiedenissen voor "Op reis door de Bijbel", een Bijbelatlas voor reformatorische gezinnen. Een andere schrijver heeft de versies gemaakt; jij controleert ze onafhankelijk en kritisch, alsof een dominee, een onderwijzer en een kritische ouder meelezen. De Statenvertaling is de controlebasis.

Lees eerst volledig:
1. docs/bijbelreis-niveaus/schrijfwijzer.md — vooral §2, §3 en §6 (jouw checklist).
2. De invoer met de Statenvertalingtekst: docs/bijbelreis-niveaus/werk/invoer/batch-{BATCH}.md (maak die eerst met: node scripts/niveaus/invoer.mjs {BATCH})
3. De versies: docs/bijbelreis-niveaus/werk/uit/batch-{BATCH}.json (JSON, {nr: {a, b, c}})
4. De notities van de schrijver: docs/bijbelreis-niveaus/werk/uit/batch-{BATCH}.notities.md

Werk per geschiedenis (zie docs/bijbelreis-niveaus/werk/batches.json) en per versie (a, b, c), zin voor zin:
- Trouw: zoek elke bewering op in de Statenvertalingtekst van de invoer (voor c ook de genoemde verwijzingen, die je zelf opzoekt in data/statenvertaling/<boek>.json: {"hoofdstukken": {"1": ["vers 1", ...]}}). Alles wat er niet staat (details, gevoelens, motieven, aantallen, volgorde, wie iets zegt of doet) is een fout.
- Onderscheid: uitleg, interpretatie en overlevering moeten als zodanig benoemd zijn; geen kant kiezen in omstreden theologie.
- Moeilijke onderwerpen volgens §3; a heeft een passende `samen`-tip.
- Leeftijd: a begrijpelijk bij voorlezen aan een kind van 5; b zelf leesbaar voor een kind van 8; c voegt echt iets toe en herhaalt de bestaande vertelling niet.
- Vragen: eerste antwoord aantoonbaar goed volgens `why` (zoek het vers op!); de andere aantoonbaar fout; `why` wijst naar het juiste vers.
- Taal: correct Nederlands, eerbiedig (Hij/Zijn met hoofdletter voor God en de Heere Jezus), namen zoals in de Statenvertaling.

Herstel elke fout direct in docs/bijbelreis-niveaus/werk/uit/batch-{BATCH}.json (bewerk het JSON-bestand). Twijfelpunten van de schrijver in docs/bijbelreis-niveaus/werk/uit/batch-{BATCH}.notities.md: beoordeel ze en los ze op waar dat kan. Als een versie na jouw controle in orde is, zet je haar status op "gecontroleerd". Een versie die je niet met zekerheid in orde kunt krijgen, laat je op "concept" en je legt uit waarom.

Draai daarna
  node scripts/niveaus-controle.mjs docs/bijbelreis-niveaus/werk/uit/batch-{BATCH}.json
en herstel tot het "OK" meldt.

Schrijf een controleverslag naar docs/bijbelreis-niveaus/werk/review/batch-{BATCH}.verslag.md (markdown): per geschiedenis welke inhoudelijke fouten je hebt hersteld (kort: wat was het, wat is het nu), wat je bewust zo laat, en wat op "concept" bleef. Noteer ook fouten in de bestaande vertelling/kaartteksten van de invoer die je tegenkomt (die herstel je niet zelf). Wees eerlijk: noem niet meer of minder dan je echt gedaan hebt.
Wijzig verder niets in de repository.
Let op: de Bijbeldata (editie 1888) nummert enkele verzen anders dan gangbare uitgaven (bijv. Exodus 5:24 / 6:1); gebruik bij twijfel een verwijzing die in beide nummeringen klopt.
Je eindantwoord: één regel met de uitvoer van het controlescript, het aantal herstelde inhoudelijke fouten, en het aantal versies op "gecontroleerd".
