# Schrijfwijzer reisniveaus

Voor iedereen die een niveauversie van een geschiedenis schrijft of beoordeelt. Voorbeelden van goede versies staan in `public/bijbelreis/niveaus.js` (geschiedenis 1, 26 en 83). Het controlescript `node scripts/niveaus-controle.mjs` controleert de vormregels automatisch. Trouw aan de tekst, toon en moeilijke onderwerpen beoordeelt een tweede lezer.

## 1. De drie niveaus

| | A · Samen ontdekken (4–6) | B · Zelf op reis (7–10) | C · Verder ontdekken (11+) |
|---|---|---|---|
| Wie leest | Een ouder leest voor, het kind kijkt mee | Het kind leest zelf | Het kind leest zelf, zoekt verder |
| Tekst | 4–10 korte stappen; één gedachte per stap | 2–4 onderdelen met een kop; samen 300–1000 tekens | De bestaande vertelling blijft; daaronder 1–3 verdiepingsblokken |
| Vragen | 2–4, twee antwoorden | 3–5, drie antwoorden | 2–4, drie antwoorden; niet dezelfde als de bestaande vragen |
| Extra | `samen`: tip voor wie voorleest; `plaatsen`: de 1–3 plaatsen die de kaart toont | — | Verwijzingen (`refs`) per blok |

Schrijf in de **tegenwoordige tijd**, zoals de bestaande vertellingen ("Mozes strekt zijn hand uit").

### A · Samen ontdekken
- Per stap hoogstens 140 tekens en hoogstens 3 zinnen. Korte zinnen, gewone woorden. Eén gebeurtenis per stap.
- Geen jaartallen en geen grote getallen in cijfers. Schrijf "heel veel wagens" in plaats van "zeshonderd wagens", tenzij het getal de kern is ("twaalf zonen"); schrijf getallen dan in letters.
- Vertel de hoofdlijn in de volgorde van de Bijbel. Laat zijlijnen weg. Weglaten mag, veranderen niet.
- `stap`: koppel een stap aan een kaartstap (een sleutel uit "Kaartstappen" in de invoer) als die stap op een plek in die kaartstap speelt. De kaart springt dan naar die plek. Niet elke stap hoeft een `stap` te hebben.
- `plaatsen`: hooguit 3 ids uit "Toegestane ids", de plaatsen die een jong kind op de kaart moet zien. Hebben de kaartstappen geen plaatsen, laat `plaatsen` dan weg.
- `samen` (hoogstens 520 tekens) is een korte tip voor de volwassene. Kies wat het meest helpt:
  - een moeilijk onderwerp en hoe de Bijbel het vertelt, met een verwijzing;
  - wat er bij A is weggelaten, met de verwijzing, zodat de ouder het zelf kan aanvullen;
  - een bekend misverstand uit prentenboeken of traditie ("een stal wordt niet genoemd");
  - iets om samen aan te wijzen of te bespreken, met een concrete vraag.

  Geen preek en geen toepassing als opdracht aan het kind.
- Vragen: wat een kind van 5 na het voorlezen kan weten. Het goede antwoord staat letterlijk in de stappen. Het foute antwoord is duidelijk fout, maar niet belachelijk.

### B · Zelf op reis
- Leesbaar voor een kind van 8: zinnen van gemiddeld 10–15 woorden, moeilijke woorden kort uitgelegd ("ondertrouwd", "offer", "profeet").
- Koppen: hoogstens 42 tekens, geen punt aan het eind, inhoudelijk ("Een weg door de zee", niet "Deel 2").
- Vertel meer dan A: wie, waar, waarom. Noem plaatsnamen die op de kaart staan.
- Een kort citaat uit de Statenvertaling mag, als het een kernwoord is. Leg het daarna uit als dat nodig is (zie geschiedenis 26).
- Vragen: wisselen tussen wie, wat, waar, waarom en wat eerst. Minstens één vraag naar het waarom of naar een verband. De foute antwoorden zijn geloofwaardig, maar volgens de tekst aantoonbaar fout.

### C · Verder ontdekken
- De hoofdtekst is de bestaande vertelling (`uitleg`). Die verandert niet. De verdieping voegt iets toe wat daar niet staat.
- 1–3 blokken van hoogstens 750 tekens. Kies uit:
  - **Elders in de Bijbel**: verbanden met andere Bijbelgedeelten, met letterlijke citaten en verwijzingen. Herhaal de bestaande `cross`-lijst niet; vul aan of leg uit.
  - **Waar en wanneer**: ligging en zekerheid van de plaatsen (gebruik de zekerheid uit de invoer), en de datering (gebruik alleen `tijdNoot`/`tijd` uit de invoer; verzin geen nieuwe jaartallen).
  - **Achtergrond**: een woord of gebruik uit de tekst (bijvoorbeeld het eerstgeboorterecht, een melaatse, een tollenaar), alleen als het algemeen aanvaard is.
  - **Wat de tekst zegt en wat niet**: details die vaak worden toegevoegd maar niet in de tekst staan.
- `refs`: de Bijbelplaatsen die het blok noemt.
- Vragen gaan over de verdieping of over details uit de tekst, niet over wat al in de bestaande vragen staat.

## 2. Bijbeltekst, uitleg, interpretatie en overlevering

Maak altijd duidelijk wat wat is.

| Soort | Hoe schrijf je het |
|---|---|
| **Bijbeltekst** | Letterlijk citaat tussen ‘ en ’ (Nederlandse enkele aanhalingstekens), exact zoals in de Statenvertaling in de invoer, inclusief spelling (‘HEERE’, ‘den’, ‘zult’). Een citaat mag ingekort worden met … ertussen. Het controlescript vergelijkt elk citaat met de Statenvertaling. |
| **Navertelling** | Gewone tekst die precies volgt wat de Bijbel zegt, in eigen woorden. Geen dialogen, gevoelens, namen of details die niet in de tekst staan. Een gevoel mag alleen als de tekst het noemt of als het onmiskenbaar is ("het volk is bang", Exodus 14:10). |
| **Uitleg** | Een verklaring van een woord of een verband. Zeg erbij als het een uitleg is: "Dat betekent…", "Hiddekel en Frath worden meestal uitgelegd als…". |
| **Interpretatie** | Iets waarover uitleggers verschillen: zeg dat ook. "Veel uitleggers zien hierin…", "Uitleggers verschillen over…". Kies geen kant in theologisch omstreden kwesties. |
| **Overlevering** | Wat uit traditie of prentenboeken komt, benoem je als zodanig: "De os en de ezel komen uit de traditie, niet uit Lukas 2." Nooit als feit vertellen. |

Verder:
- **Verzin niets.** Geen namen voor naamloze personen (de vrouw van Lot, de farao), geen aantallen, geen leeftijden, geen kleuren, geen uitgewerkte gesprekken. Weet je iets niet zeker uit de invoer: laat het weg.
- **Geen tekst uit kinderbijbels.** Neem geen zinnen over uit bestaande kinderbijbels of vertelboeken (bijvoorbeeld Anne de Vries, Vos, Van der Ploeg, Kuijt). Schrijf zelf, vanuit de Statenvertaling.
- **Namen en spelling** volgen de Statenvertaling en de bestaande vertelling: Mozes, Aäron, Mirjam, Jozua, Mattheüs, Nathanaël, Bathseba, de Heere Jezus, de HEERE (in eigen tekst: de HEERE of God; in citaten exact).
- **Eerbiedig taalgebruik.** Voornaamwoorden voor God en de Heere Jezus met een hoofdletter (Hij, Zijn, Hem). Spreek van "de Heere Jezus", niet van "Jezus" alleen, behalve in een citaat of als naam die het Kind krijgt.
- **Geen moraal als goed/fout-vraag.** Vragen toetsen wat er staat en waarom, niet wat het kind zou moeten voelen of doen.

## 3. Moeilijke onderwerpen

De Bijbel vertelt ook over geweld, dood, oordeel en zonde. We verzwijgen dat niet en vergroten het niet uit.

**Algemeen**
- Vertel sober en eerlijk wat er gebeurt, zonder gruwelijke details.
- Laat zien hoe de Bijbel het zelf beoordeelt. Geef geen eigen oordeel dat de tekst niet geeft.

**Niveau A**
- Een gebeurtenis die voor 4–6 jaar ongeschikt is, mag je weglaten als de hoofdlijn er niet door verandert. Noem dan in `samen` wat is weggelaten, met de verwijzing.
- Gaat het hele verhaal over zo'n onderwerp (David en Bathseba, de kruisiging), vertel het dan in eenvoudige, eerbiedige woorden. Geef in `samen` een handreiking voor het gesprek.

**Niveau B**
- Benoem zonde en oordeel duidelijk, in de woorden van de Bijbel:
  - "David nam Bathseba, de vrouw van Uria";
  - "Wat David gedaan had, was kwaad in de ogen van de HEERE".

  Geen seksuele details.
- Benoem dood en geweld feitelijk.

**Per onderwerp**
- **Seksualiteit** (Lot en zijn dochters, Juda en Tamar, Simson, Bathseba):
  - A: niet beschrijven. Noem het in `samen` met de verwijzing.
  - B: in algemene termen ("ze deden iets wat niet mocht; uit hen komen de Moabieten en de Ammonieten voort"), of weglaten als het geen kern is.
- **Oorlog en ban** (Jericho, Ai): vertel wat de tekst zegt. Leg bij C uit dat de Bijbel dit als Gods oordeel over de volken van Kanaän beschrijft (Genesis 15:16; Deuteronomium 9:5). Doe dat zonder het te verzachten of aan te dikken.
- **De dood van kinderen** (de tiende plaag, Bethlehem):
  - A: noem het in één zin of in `samen`.
  - B: sober benoemen.
- **De kruisiging**: eerbiedig en sober. Geen beschrijving van het lijden die de tekst niet geeft. Vertel altijd waarom: Hij gaf Zijn leven (in de woorden van de Bijbel, met een verwijzing).

## 4. Vragen

- Het **eerste antwoord** is het goede. De app schudt de volgorde.
- Antwoorden zijn uniek en ongeveer even lang. Het goede antwoord valt niet op door lengte of precisie.
- `why`: de precieze verwijzing waarop het goede antwoord rust ("Genesis 22:13", "Exodus 14:9–10", meerdere met "; "). Gebruik een gedachtestreepje – voor reeksen, geen gewoon streepje.
- Geen strikvragen, geen "alle bovenstaande", geen ontkenningen ("Wat deed hij niet?").
- Geen vragen waarvan het antwoord afhangt van een vertaling of een omstreden uitleg.

## 5. Formaat

Een kandidaatbestand is JSON: `{ "<nr>": { "a": {…}, "b": {…}, "c": {…} } }`, met de velden zoals in `niveaus.js`. De status van nieuw werk is `"concept"`. Na een geslaagde inhoudelijke controle wordt die `"gecontroleerd"`.

```json
{
  "2": {
    "a": { "status": "concept", "plaatsen": ["eden"], "delen": [{ "t": "…", "stap": "genesis:begin:1" }], "samen": "…", "vragen": [{ "q": "…", "a": ["goed", "fout"], "why": "Genesis 2:7" }] },
    "b": { "status": "concept", "delen": [{ "kop": "…", "t": "…" }], "vragen": [{ "q": "…", "a": ["goed", "fout", "fout"], "why": "…" }] },
    "c": { "status": "concept", "verdieping": [{ "kop": "…", "t": "…", "refs": ["…"] }], "vragen": [{ "q": "…", "a": ["goed", "fout", "fout"], "why": "…" }] }
  }
}
```

Typografie:
- Gebruik ’ voor een apostrof ("Maria’s"). Het controlescript ziet een ’ na een letter niet als sluitend aanhalingsteken.
- Geen dubbele spaties.
- Een tekst eindigt niet op … of ....

## 6. Controle: wat de tweede lezer nakijkt

Per versie:
1. **Trouw**:
   - klopt elke bewering met de Statenvertaling uit de invoer?
   - staat er niets in wat de tekst niet zegt (namen, aantallen, gevoelens, dialogen, motieven)?
   - is de volgorde juist?
2. **Onderscheid**: zijn uitleg, interpretatie en overlevering als zodanig benoemd?
3. **Moeilijke onderwerpen**: past de behandeling bij §3, en heeft A een passende `samen`-tip?
4. **Leeftijd**:
   - A te begrijpen voor een kind van 5 als het wordt voorgelezen;
   - B zelf te lezen voor een kind van 8;
   - C voegt echt iets toe.
5. **Vragen**:
   - het eerste antwoord is aantoonbaar goed volgens `why`;
   - de andere antwoorden zijn aantoonbaar fout;
   - de vraag hoort bij deze geschiedenis.
6. **Verwijzingen**: wijst elke `why` en `refs` naar de verzen waar het over gaat?

Fouten verbeter je direct in het bestand. Daarna draai je het controlescript opnieuw. Wat je niet zeker kunt beoordelen, noteer je in het controleverslag in plaats van het te raden.
