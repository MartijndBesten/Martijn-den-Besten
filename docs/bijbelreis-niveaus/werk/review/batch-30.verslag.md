# Controleverslag batch 30 (geschiedenissen 151–154)

Tweede lezer, 22-11-2026. Gecontroleerd: de basisrecords in `public/bijbelreis/geschiedenissen/ot-4.js`, de niveauversies in `docs/bijbelreis-niveaus/werk/uit/batch-30.json` en de indeling in `docs/bijbelreis-niveaus/werk/uit/indeling-30.json`. Elke bewering is zin voor zin naast de Statenvertaling (editie 1888, `node scripts/sv.mjs`) gelegd, ook de verwijzingen in `cross`, `betekenis`, `refs` en `why`.

Uitkomst: 9 inhoudelijke fouten hersteld in de basisrecords (plus één verduidelijking van een tijdNoot, volgens besluit), 17 in de niveauversies. Alle 12 versies staan op "gecontroleerd".

Controles na afloop:
- `node scripts/niveaus-controle.mjs docs/bijbelreis-niveaus/werk/uit/batch-30.json` → `OK: 4 geschiedenis(sen), 12 versies.`
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/ot-4.txt` → `169 gecontroleerd, 0 mis` (5 regels toegevoegd/aangescherpt voor de gewijzigde tekst).
- `npx vitest run tests/bijbelreis.test.ts` → 28 geslaagd, 2 gefaald; beide fouten zijn de verwachte (indeling 151–166 nog niet in `indeling.js`; niveaus 151–165 nog niet samengevoegd). Geen fout over de inhoud van 151–154.
- Indeling: alle koppen 2+ woorden, ≤ 42 tekens, zonder eindpunt; elk onderdeel begint letterlijk en uniek aan een zinsbegin in de (gewijzigde) `uitleg`; eerste onderdeel "".

## 151 Het land verdeeld en zes vrijsteden

Basisrecord
- `uitleg`, slotzin: het citaat ‘dat de HEERE God is’ stond als het antwoord van de stammen. Het antwoord (Jozua 22:26–28) is dat het altaar een getuige is ‘tussen ons en tussen ulieden’; ‘dat de HEERE God is’ komt uit de naam die Ruben en Gad het altaar geven (22:34). Nu beide apart.
- `ontdek`: “Dan … noemde de stad naar zijn vader” zou Jakob zijn; de Danieten noemden Lesem naar hun vader Dan (19:47). Nu: “De stam Dan – nam Lesem in en noemde de stad naar zijn stamvader”.

Niveaus
- a: de stap “De HEERE geeft Israël rust. Alles wat Hij beloofd heeft, is gebeurd.” (21:43–45) stond na het altaar (Jozua 22); verplaatst naar zijn plaats na de Levietensteden.
- b: vraag 1 (“Waarom krijgt Kaleb Hebron?”) was niet te beantwoorden uit de b-tekst; de reden (14:14) staat nu in de tekst, in eenvoudige woorden (“omdat hij de HEERE altijd trouw gevolgd heeft”), en het antwoord sluit daarop aan.
- Bewust zo: c noemt Jeremia 7:12 een waarschuwing voor Jeruzalem (het verband, 7:14 en 7:17, draagt dat). De typologie van de vrijsteden (Hebreeën 6:18) blijft weg.

## 152 Ehud en koning Eglon

Basisrecord
- `uitleg`: “Ehud moet een geschenk naar Eglon brengen” → “Door hem stuurt Israël een geschenk naar Eglon” (3:15).
- `uitleg`: “stuurt hij de dragers weg” klopt niet: Ehud ‘geleidde’ de dragers (3:18) en keerde ‘van de gesneden beelden, die bij Gilgal waren’ terug (3:19). Nu: “gaat hij met de dragers mee, maar bij de gesneden beelden bij Gilgal keert hij zelf terug”. Het onderdeel in `indeling-30.json` is aangepast (“Na het geschenk gaat hij”). `ontdek`: “bij de gesneden beelden van Gilgal” → “bij Gilgal”.
- `betekenis`: de verwijzing (Richteren 2:16, 18) droeg niet dat Israël de HEERE verlaat en tot Hem roept; nu (Richteren 2:11–18; 3:9, 15).
- `cross` Richteren 20:16: “Ook later woonden er in Benjamin mannen die links waren” veronderstelde dat Ehud uit Benjamin was, wat het record nergens zegt; het woord ‘Ook’ is weg (de koppeling wordt bij c met verzen uitgelegd).
- `tijdNoot` (besluit): aangevuld met “De Bijbel noemt geen jaar” en dat de tijdlijn alleen die eeuw (1380–1300 v.Chr.) toont, als onzekere reconstructie, geen jaartal uit de Bijbel. `tijd` en `tl` ongewijzigd.

Niveaus
- a: “Nu wordt Eglon … sterk” → “Nu maakt de HEERE Eglon … sterk tegen hen” (3:12). Het woord van Ehud in de verleden tijd zoals 3:28 (“heeft … gegeven”).
- b: vraag 2 (de helpers van Eglon) stond niet in de b-tekst; vervangen door “Welke stad neemt Eglon in?” (3:13). Uitleg van ‘veren’ was “ondiepe plekken in de rivier”; nu “plekken waar je de rivier kunt oversteken”.
- c: de koppeling ‘zoon van Jemini’ = Benjamin rust nu zichtbaar op verzen: 1 Samuël 9:21 (Saul: ‘een zoon van Jemini’ en ‘den stam van Benjamin’ in één vers) en 9:1 (Kis, ‘een man van Benjamin’). De c-vraag (“Wie noemde zichzelf later ook ‘een zoon van Jemini’?” – Saul) hangt niet van die uitleg af.
- c: vraag 3 was dubbelzinnig: “Welke richter was gestorven …?” – ook Othniël was gestorven (3:11). Nu: “Welke richter noemt Richteren 4:1 aan het begin van de geschiedenis van Debora?”
- c: “Richteren 4:1 begint met ‘als Ehud gestorven was’” – het vers eindigt ermee; herschreven.

## 153 Jefta, de richter uit Gilead

Basisrecord
- `quiz` 3: “Van welke koning had Israël … het land bij de Arnon gekregen?” – Israël kreeg het land niet ván Sihon, het nam het in (11:21–22). Nu: “… het land tussen de Arnon en de Jabbok ingenomen?”

Niveaus
- a: “Israël vergeet de HEERE weer” → “verlaat” (10:6).
- b (besluit): “Zij is nooit getrouwd geweest” kleurde ‘zij heeft geen man bekend’ (11:39) in de richting van één uitleg (een leven lang ongehuwd). Nu het letterlijke citaat: “Er staat bij: ‘zij heeft geen man bekend’.” ‘Maagdom’ is eerder in dezelfde alinea uitgelegd. Ook “Zij zegt dat hij moet doen …” → “dat hij met haar moet doen …” (11:36). Om binnen 1000 tekens te blijven zijn enkele zinnen in het eerste onderdeel ingekort, zonder inhoud te wijzigen.
- Bewust zo: a laat de gelofte, de dochter en Efraïm weg (§3), met de verwijzingen en het letterlijke 11:39 in `samen`. In de uitleg (hoofdtekst c) staan gelofte en 11:39 letterlijk, zonder kant te kiezen. Deuteronomium 23:21–22 bij c zonder oordeel over Jefta; Prediker 5:4 blijft weg.

## 154 Davids rijk groeit

Basisrecord
- `uitleg`: “Daarna onderwerpt hij ook Moab, Hadadezer … en Edom”: Hadadezer werd verslagen, niet onderworpen, en van Edom staat er dat alle Edomieten knechten van David werden (8:3, 14). Nu: “verslaat hij ook Moab, Hadadezer, de koning van Zoba, en de Syriërs van Damascus, en alle Edomieten worden zijn knechten.” Onderdeel in `indeling-30.json` aangepast (“Daarna verslaat hij ook”).
- `cross` Genesis 15:18: “David trok met zijn leger tot die rivier (2 Samuël 8:3)” – in 8:3 is niet uit te maken of ‘hij’ David of Hadadezer is. Nu neutraal: “Bij de oorlog met Hadadezer, de koning van Zoba, wordt die rivier genoemd.”

Niveaus
- a: “komen de Filistijnen om tegen hem te strijden” → “Zij zoeken David” (5:17). “wacht tot je een geluid hoort” → “ga om hen heen, en haast je als je een geluid hoort” (5:23–24).
- b: hetzelfde “moet David wachten” → om hen heen trekken en zich haasten (5:23–24). “verslaat … Edom” → “Ook Edom moet hem dienen” (8:14). Vraag 2 (Toï) stond niet in de b-tekst; vervangen door “Wat doet David met het zilver en het goud van de volken?” (8:11). Ingekort om binnen 1000 tekens te blijven (het SV-citaat 5:24 is nu in eigen woorden).
- Bewust zo: c laat open of de Nahas van 1 Samuël 11 de vader van Hanun is.

## Fouten in andere teksten (niet hersteld, buiten deze batch)
- Reisdeel Ehud en Jefta, kaartstap `richteren:ehud-jefta:2`: “Daarna stuurt hij de dragers weg” – de SV zegt ‘geleidde’ (Richteren 3:18).
- Kaartstap `richteren:ehud-jefta:8`: “tamboerijnen” (SV ‘trommelen’, 11:34) en “zij is nooit getrouwd geweest” als weergave van 11:39 (zelfde bezwaar als bij 153 b).

## Op concept gebleven
Niets.
