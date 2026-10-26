<!-- Opdracht voor een schrijver (mens, Claude of Codex). Vervang {BATCH} door het batchnummer, bijvoorbeeld 07. -->
Je schrijft leeftijdsversies van Bijbelse geschiedenissen voor "Op reis door de Bijbel", een interactieve Bijbelatlas voor reformatorische gezinnen en kinderen (Nederlands). Elke geschiedenis krijgt drie versies: a (Samen ontdekken, 4–6 jaar, voorlezen), b (Zelf op reis, 7–10 jaar), c (Verder ontdekken, 11+, verdieping bij de bestaande tekst). De Statenvertaling is de controlebasis. Er is géén ruimte voor verzonnen details: dit wordt gepubliceerd voor kinderen en ouders die de Bijbel goed kennen.

Lees eerst volledig:
1. docs/bijbelreis-niveaus/schrijfwijzer.md  — de regels (bindend).
2. public/bijbelreis/niveaus.js — drie uitgewerkte voorbeelden (geschiedenis 1, 26, 83). Zo goed en zo zorgvuldig moet het worden; neem de toon, lengte en opbouw over.
3. Je invoer: docs/bijbelreis-niveaus/werk/invoer/batch-{BATCH}.md (maak die eerst met: node scripts/niveaus/invoer.mjs {BATCH}) — per geschiedenis de gegevens, kaartstappen (waarden voor `stap`), toegestane plaats-ids, de bestaande vertelling, bestaande vragen en de volledige Statenvertalingtekst.

Opdracht: schrijf a, b en c voor de geschiedenissen van batch {BATCH} (zie docs/bijbelreis-niveaus/werk/batches.json). Schrijf het resultaat als één JSON-bestand naar docs/bijbelreis-niveaus/werk/uit/batch-{BATCH}.json, vorm `{ "<nr>": { "a": {...}, "b": {...}, "c": {...} } }`, status steeds "concept".

Werkwijze per geschiedenis:
- Lees de Statenvertalingtekst in de invoer zelf, niet alleen de bestaande vertelling. Elke bewering in a, b en c moet je kunnen aanwijzen in die tekst (of, voor c, in de verwijzingen die je noemt en in de invoer).
- Citaten tussen ‘ ’ kopieer je letterlijk uit de Statenvertaling (spelling inbegrepen). Citeer alleen verzen die je in de invoer ziet of die je zeker letterlijk kent; anders: geen citaat, maar eigen woorden met een verwijzing.
- Volg §3 van de schrijfwijzer voor moeilijke onderwerpen; geef bij a dan altijd een `samen`-tip die de ouder helpt (met verwijzing).
- Vragen: het eerste antwoord is goed en aantoonbaar volgens `why`; foute antwoorden aantoonbaar fout. Niveau c: geen vraag die (vrijwel) gelijk is aan een van de "Bestaande vragen".
- Jaartallen en dateringen alleen uit `tijd`/`tijdNoot` van de invoer. Plaatszekerheid alleen zoals in de invoer staat.
- Geen tekst overnemen uit kinderbijbels.

Controle (verplicht): draai
  node scripts/niveaus-controle.mjs docs/bijbelreis-niveaus/werk/uit/batch-{BATCH}.json
en herstel alle fouten tot de uitvoer "OK: N geschiedenis(sen), 3N versies." meldt. Een citaatfout betekent: het stuk staat niet letterlijk in de Statenvertaling — pas het citaat aan naar de exacte tekst of maak er eigen woorden van.
Lees daarna je eigen tekst nog één keer kritisch na tegen de Statenvertaling, als tweede lezer (§6 van de schrijfwijzer), en verbeter wat niet klopt.

Wijzig verder niets in de repository: alleen docs/bijbelreis-niveaus/werk/uit/batch-{BATCH}.json en batch-{BATCH}.notities.md.
Schrijf in docs/bijbelreis-niveaus/werk/uit/batch-{BATCH}.notities.md (markdown, kort): per geschiedenis alleen wat de redactie moet weten — bewuste weglatingen bij a, twijfelpunten, en fouten die je eventueel in de bestaande vertelling/vragen van de invoer zag (die verbeter je niet zelf). Geen samenvatting van je werk.
Je eindantwoord: één regel met de uitvoer van het controlescript, plus het aantal twijfelpunten.
