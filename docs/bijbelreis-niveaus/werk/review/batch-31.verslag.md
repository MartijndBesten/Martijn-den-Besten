# Controleverslag batch 31 (geschiedenissen 155–158)

Tweede lezer, 22-11-2026. Gecontroleerd: de basisrecords in `public/bijbelreis/geschiedenissen/ot-5.js`, de niveauversies in `docs/bijbelreis-niveaus/werk/uit/batch-31.json` en de indeling in `docs/bijbelreis-niveaus/werk/uit/indeling-31.json`. Elke bewering is zin voor zin naast de Statenvertaling (editie 1888, `node scripts/sv.mjs`) gelegd, ook de verwijzingen in `cross`, `betekenis`, `ontdek`, `refs` en `why`.

Uitkomst: 4 inhoudelijke fouten hersteld in de basisrecords, plus 1 kleine precisering en 1 naamverduidelijking; 12 inhoudelijke fouten hersteld in de niveauversies. Alle 12 versies staan op "gecontroleerd".

Controles na afloop:
- `node scripts/niveaus-controle.mjs docs/bijbelreis-niveaus/werk/uit/batch-31.json` → `OK: 4 geschiedenis(sen), 12 versies.`
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/ot-5.txt` → `142 gecontroleerd, 0 mis` (3 regels toegevoegd: 2 Koningen 8:14, 8:15 (deken), 2 Kronieken 29:1).
- `npx vitest run tests/bijbelreis.test.ts` → 28 geslaagd, 2 gefaald; beide de verwachte fouten (indeling van 155–158 nog niet samengevoegd; niveaus 155–158 nog niet samengevoegd). Geen fout over de inhoud van 155–158.
- Indeling (eigen controle met dezelfde regels als de test): alle koppen 2+ woorden, ≤ 42 tekens, zonder eindpunt; elk onderdeel begint letterlijk en uniek aan een zinsbegin in de (gewijzigde) `uitleg`; eerste onderdeel ""; de kaartstappen horen bij de geschiedenis.
- Het JSON-bestand is in dezelfde opmaak als de andere batches gezet (één regel per onderdeel/vraag); de inhoud is daarbij niet veranderd.

## 155 Asa steunt op de HEERE

Basisrecord
- Naam (besluit): ‘Zerah, de Moor’ blijft (Statenvertaling). In de uitleg staat nu ‘Zerah, de Moor (een Cusjiet)’, zodat de lezer de kaarttekst (‘Zerah, de Cusjiet’) herkent. Geen inhoudelijke fout.
- Verder geen fouten gevonden; `betekenis`, `ontdek`, `quiz`, `cross` en `tijdNoot` (uit het reisdeel) kloppen met de verzen.
- Bewust zo: “Dan komt Zerah” na de tien jaar rust volgt de volgorde van de tekst (14:1–9); de tekst zegt niet uitdrukkelijk dat Zerah ná die tien jaar kwam, maar het is gewone verteltaal.

Niveaus
- b: ‘(een Cusjiet)’ toegevoegd zoals in de uitleg. Om onder 1000 tekens te blijven is in de zin van Hanani “op de koning van Syrië en” weggelaten (“want u steunde niet op de HEERE”, 16:7).
- c blok 1 (besluit): “‘Moeder’ betekent hier dus grootmoeder” stond als feit. Nu als uitleg, met de grond: 1 Koningen 15:2 en 15:10 noemen beide ‘Maacha, een dochter van Abisalom’, en volgens 2 Kronieken 11:20–22 was Maächa de moeder van Abia; “daarom wordt ‘moeder’ bij Asa meestal uitgelegd als grootmoeder; met zoveel woorden staat dat er niet”. Tegelijk hersteld: 1 Koningen 15:2 spreekt van de moeder van ‘Abiam’ (zo noemt Koningen de vader van Asa), niet van ‘Abia’.
- c blok 2 (besluit): “Zijn zoon Jehu was ook een profeet” en “Vader en zoon spraken…” stelden als feit dat Jehu, de zoon van Hanani, de zoon van deze ziener is, en dat de Jehu van 1 Koningen 16 en 2 Kronieken 19 dezelfde is. Nu als gangbare lezing benoemd. Kop nu “Jehu, de zoon van Hanani”.
- c vraag 3 vervangen (geen fout, wel herhaling van de vertelling: “Wie werd koning na de dood van Abia?”) door een vraag bij de verdieping: “Hoe noemt 1 Koningen 15 de vader van Asa?” → Abiam (15:8); Abisalom (vader van Maacha) en Rehabeam (vader van Abiam) zijn aantoonbaar fout.
- c: in vraag 1 en in de eigen tekst ‘Maächa’ zoals in de app; binnen citaten ‘Maacha’ (SV). `refs` van blok 1 en 3 aangevuld (1 Koningen 15:8; 2 Kronieken 11:20–22; 14:13; 16:1).
- a: geen fouten. Bewust zo: stap 5 “De vijanden vluchten weg, tot Gerar toe” (14:12–13: zij vluchten, Asa jaagt hen na tot Gerar) is een vereenvoudiging, geen verandering.

## 156 Josafat: de strijd is Gods

Basisrecord
- Kleine precisering: “In het huis van de HEERE bidt Josafat voor de gemeente” kon gelezen worden als ‘namens’; de tekst zegt ‘Josafat stond in de gemeente’ (20:5). Nu “staat Josafat in de gemeente en bidt”.
- Verder geen fouten gevonden.

Niveaus
- a stap 9 en vraag 3: “danken ze de HEERE” → “loven ze de HEERE” (20:26 ‘daar loofden zij den HEERE’; de naam Beracha hangt daaraan).
- a `samen`: zei dat ‘dat de vijanden elkaar ombrachten’ was weggelaten, terwijl stap 7 zegt “Ze vechten tegen elkaar”. Nu: “Bij A staat alleen dat de vijanden tegen elkaar vechten; weggelaten is dat ze elkaar ombrachten…”.
- b: ‘goedertierenheid’ kort uitgelegd (“Zijn goedheid”).
- c blok 1: het citaat ‘dat Hij goed is, dat Zijn weldadigheid is tot in eeuwigheid’ werd aan 2 Kronieken 5:13 én 7:3 toegeschreven en ‘bij de inwijding’ geplaatst. 7:3 heeft ‘goedig’, en 5:13 gaat over het binnenbrengen van de ark. Nu: het citaat bij 5:13 (de ark in de tempel), 7:3 als “met bijna dezelfde woorden” bij de inwijding. “Psalm 136 herhaalt het in elk vers” is nu het letterlijke refrein ‘want Zijn goedertierenheid is in der eeuwigheid’ (nagekeken: alle 26 verzen).

## 157 Hazaël en Jehu

Basisrecord
- `uitleg` (besluit): “De volgende dag doodt Hazaël zijn heer en wordt koning” was stelliger dan 8:15 (‘dat hij een deken nam … dat hij stierf’). Nu volgens de tekst: Hazaël gaat terug en zegt dat de koning zeker zal genezen (8:14); “De volgende dag neemt hij een deken, doopt die in water en spreidt die over het gezicht van de koning, zodat die sterft. Dan wordt Hazaël koning in zijn plaats.” Het ‘hij’ verwijst, zoals in de Statenvertaling, naar Hazaël: de gangbare lezing, niet stelliger dan de tekst.
- `uitleg`: “want hij weet hoeveel kwaad Hazaël Israël zal doen” → “wat voor kwaad” (8:12 ‘wat kwaad’).
- Indeling: het tweede onderdeel (“Jehu wordt gezalfd”) begint nu bij “Later raakt Joram”, zodat de verwonding van Joram niet onder “Elisa huilt in Damascus” valt.
- Bewust zo: `wie` noemt Jonadab, die in de uitleg niet voorkomt (wel in 2 Koningen 10:15–23, binnen de `ref`). De broeders van Ahazia (10:12–14) blijven weg uit de uitleg (inkorting, geen verandering).

Niveaus
- a stap 7: “De wachter op de toren ziet hem al van ver komen” → “ziet Jehu en zijn mannen aankomen” (9:17 ‘zag den hoop van Jehu’).
- a `samen`: “hoe Hazaël zijn heer doodde” (stellig) → “hoe de koning van Syrië stierf (2 Koningen 8:15)”.
- b onderdeel 1: “De volgende dag doodt Hazaël de koning” → zoals de uitleg (“Hazaël gaat terug. De volgende dag spreidt hij een natte deken over het gezicht van de koning, zodat die sterft. Hazaël wordt koning.”); “hoeveel kwaad” → “wat voor kwaad”, ook in vraag 1. Om onder 1000 tekens te blijven is “Zalven betekent: aanwijzen voor een taak van God” vervangen door “zalft Jehu … tot koning” en is de mededeling van Elisa ingekort.
- b vraag 4: het foute antwoord “Het altaar van Baäl in Samaria” was niet aantoonbaar fout (10:26–27 noemen de beelden en het huis, geen altaar). Nu “Het huis van Baäl in Samaria” en “De beelden uit het huis van Baäl”; `why` 10:26–29.
- b vraag 3: het foute antwoord “Omdat Achab hem nog geld schuldig was” (te jolig) → “Omdat Joram de oorlog tegen Syrië verloor”.
- c blok 1: taalfout (“Toen zij zag …, ‘bracht al het koninklijke zaad om’”) → “bracht zij ‘al het koninklijke zaad om’”.
- c blok 3: bij “Jehu, de zoon van Omri” (Zwarte Obelisk) toegevoegd dat Assyrië Israël naar Omri noemde en dat Jehu geen zoon van hem was, om verwarring te voorkomen.
- c vraag 3: “toen de HEERE dit oordeel uitsprak” (onduidelijk welk) → “de last over het bloed van Naboth” (9:25–26).
- Bewust zo: c blok 2 zet 2 Koningen 10:30 en Hosea 1:4 naast elkaar zonder uitleg (uitleggers verklaren dit verschillend).

## 158 Manasse: naar Babel en terug

Basisrecord
- `tl`/`tijd`/`tijdNoot` (besluit): de brede periode van het reisdeel (ca. 715–609 v.Chr., Hizkia tot Josia) vervangen door de regering van Manasse als reconstructie: `tijd: "ca. 697–642 v.Chr. (reconstructie)"`, `tl: [-697, -642]`. De tijdNoot legt de rekensom uit met de grond uit de tijdNoot van het reisdeel `2kronieken:hizkia-josia`: dood van Josia ca. 609 (Babylonische kroniek); Josia 31 jaar (34:1), Amon 2 jaar (33:21) → einde ca. 642; Manasse 55 jaar (33:1) → begin ca. 697; Hizkia in dezelfde chronologie ca. 715 + 29 jaar (29:1) tot ca. 686, dus ongeveer tien jaar samenregering, wat niet in de Bijbel staat; andere schema’s wijken enkele jaren af; de Bijbel dateert de wegvoering naar Babel niet. De zin over de Assyrische opschriften is gebleven.
- `betekenis`: “Zo deed God wat Hij tegen Salomo had gezegd” legde een verband dat de tekst niet zelf legt (2 Kronieken 7:14 gaat over Gods volk). Nu “Dat past bij wat God tegen Salomo had gezegd”.
- Indeling: het derde onderdeel begint nu bij “In zijn benauwdheid” (kop “Manasse bidt en keert terug”), zodat het gebed niet onder “In ketenen naar Babel” valt.
- Bewust zo: ‘heir van de hemel: de zon, de maan en de sterren’ (uitleg met Deuteronomium 4:19) en ‘al is het voor de HEERE’ (33:17).

Niveaus
- a `samen`: “en zich daar vernederde” → “en zich vernederde” (33:12 zegt niet waar).
- a stap 5: “Dan komen de legeroversten…” → “Daarom laat de HEERE de legeroversten … komen” (33:11 ‘Daarom bracht de HEERE’). Geen fout (weglaten mag), maar de oorzaak hoort bij de kern.
- c blok 2: “Ook de wegvoering van Juda gebeurde ‘om de zonden van Manasse’” was ruimer dan 24:3; nu “Toen de HEERE Juda ‘van Zijn aangezicht wegdeed’, was dat ‘om de zonden van Manasse’”. Jeremia 15:4 nu met citaat (‘vanwege Manasse’). De zin over Amon (33:23) is weggelaten: die staat al in `betekenis`.
- c blok 3: datering aangepast aan het besluit (ca. 697–642 v.Chr., reconstructie, samenregering staat niet in de Bijbel); `refs` aangevuld met 33:21 en 34:1.
- c blok 1: de verwijzing naar 2 Koningen 21:10–12 weggehaald, omdat die al in `cross` staat (geen fout).
- b: geen fouten. Bewust zo: “zoals de heidense volken deden. God had dat streng verboden” (33:2; Deuteronomium 18:9–10); wat ‘door het vuur gaan’ precies inhield, wordt niet uitgelegd.

## Fouten in de invoer (kaartteksten), niet door mij hersteld
- Kaartstap `2kronieken:hizkia-josia:5`: “In zijn nood bidt hij” is een vrije weergave van ‘als hij hem benauwde’ (33:12); geen fout (zoals de schrijver al noteerde).
- Kaartstap `2koningen:jehu:0`: “Dan kijkt hij Hazaël lang en strak aan” en “De volgende dag neemt hij een deken…; en Hazaël wordt koning” volgen de tekst; geen fout.
- Geen andere fouten in de kaartteksten gevonden.

## Wat open blijft
Niets binnen deze batch. De indeling (`indeling-31.json`) en de niveaus moeten nog worden samengevoegd; daarna verdwijnen de twee verwachte testfouten voor 155–158.
