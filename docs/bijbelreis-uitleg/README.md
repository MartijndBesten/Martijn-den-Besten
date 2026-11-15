# Bijbelreis: de gangbare uitleg hoort bij het verhaal (november 2026)

Besluit van Martijn (15-11-2026): “Doe een toets voor alle verhalen over wat er algemeen over gezegd wordt als de Bijbel er onduidelijk over is. Integreer dat. Geen afzonderlijke notitie van maken of vermelden.” Op de vraag hoe dat er moet staan, koos hij: **verweven als deel van het verhaal**.

Dit bestand is de regel én de overdracht. Wie verder schrijft (Claude, Codex of een mens) houdt zich hieraan. Het vervangt op dit ene punt §2 van [`../bijbelreis-niveaus/schrijfwijzer.md`](../bijbelreis-niveaus/schrijfwijzer.md) en de regel over `fact` in [`../bijbelreis-reizen/schrijfopdracht.md`](../bijbelreis-reizen/schrijfopdracht.md).

## 1. De regel

Waar de Bijbeltekst iets openlaat of voor een kind onduidelijk is, en er onder gereformeerde uitleggers een **algemeen aanvaarde uitleg** is, vertelt de atlas die uitleg gewoon mee, als deel van het verhaal.

- Geen “uitleggers zeggen”, “meestal wordt dit uitgelegd als”, “men denkt”, “waarschijnlijk” of “de Bijbel zegt niet … maar”.
- Geen aparte zin, noot, kop of weetje dat zegt dat dit uitleg is.
- Geen zin dat uitleggers verschillen.

**Maatstaf voor ‘algemeen aanvaard’:** de kanttekeningen bij de Statenvertaling, Calvijn en Matthew Henry zeggen in de kern hetzelfde, en de gangbare gereformeerde naslagwerken spreken het niet tegen. Twijfel je of het algemeen is, dan is het dat niet.

**Lopen de meningen echt uiteen** (ook binnen die kring), dan vertel je alleen wat de tekst zegt. Je kiest niet, en je zegt ook niet dat men verschilt. Voorbeelden: wat er met de dochter van Jefta gebeurde, wie in Handelingen 19:5 gedoopt worden, wat de ster van de wijzen was.

## 2. Wat blijft

De regel gaat over de **verteltekst**. Dit verandert niet:

1. **Letterlijke Statenvertaling tussen ‘enkele’ aanhalingstekens** blijft letterlijk; de unittest controleert dat. Uitleg komt nooit tussen ‘ ’.
2. **Niets wat de tekst tegenspreekt** en niets wat de tekst niet kan dragen.
3. **Overlevering en volkstraditie zijn geen uitleg** en blijven weg: namen voor naamloze personen, drie koningen, os en ezel, de appel in het paradijs, legenden over apostelen. Je noemt ze ook niet om ze te weerleggen.
4. **Geen verzonnen details**: geen gevoelens, gesprekken, aantallen, leeftijden of jaartallen die de Bijbel niet geeft.
5. **Geen toepassing** of moraal.
6. **Kaart en tijdlijn houden hun zekerheid.** De zekerheid van een plaats (`c` in `plaatsen.js`), de markering van een gereconstrueerde route (`recon`), de toelichting bij een jaartal (`tijdNoot`, `dateringen.js`) en de bronvermelding van een ligging blijven zoals ze zijn. Dat is een eerder besluit: schattingen op de kaart worden niet als vaststaand feit getoond. In de verteltekst zelf hoef je over die onzekerheid niet uit te weiden.
7. **Vragen** hangen niet af van een uitleg: het goede antwoord staat in de Bijbeltekst zelf.
8. **Voortgang van gebruikers**: geen stap toevoegen, verwijderen of verplaatsen.

## 3. Wat je met bestaande voorbehouden doet

De teksten van vóór dit besluit staan vol voorbehouden. Per geval:

| Wat er staat | Wat je doet |
| --- | --- |
| Een uitleg met voorbehoud (“veel uitleggers zien hierin…”, “wordt meestal uitgelegd als…”) en de uitleg is algemeen aanvaard | Vertel de uitleg zonder voorbehoud. |
| “Uitleggers verschillen over…”, en de meningen lopen echt uiteen | Schrap de zin. Vertel alleen wat de tekst zegt. |
| “De Bijbel zegt niet…”, “dat weten we niet”, “… wordt niet genoemd”, en er is een algemeen aanvaard antwoord | Vertel dat antwoord. |
| Hetzelfde, maar er is geen algemeen aanvaard antwoord | Schrap de zin, tenzij een kind zonder die zin iets verkeerds zou denken dat de tekst tegenspreekt. Zeg dan liever wat er wél staat. |
| “Waarschijnlijk”, “misschien”, “vermoedelijk” in de vertelling | Zelfde afweging: algemeen aanvaard → gewoon vertellen; anders weg. |
| Een weetje over geschiedenis of archeologie (`fs: "h"`) met een eerlijk voorbehoud over een vondst of een jaartal | Laten staan. Dit is geen Bijbeluitleg. |

## 4. De toets per verhaal

Lees het Bijbelgedeelte in de Statenvertaling (`node scripts/sv.mjs "Genesis 32"`) en loop na waar een lezer blijft haken:

- **Wie is dit?** (de Engel des HEEREN, de Man bij de Jabbok, Melchizedek, ‘de zonen Gods’)
- **Wat betekent dit woord, deze naam, dit gebruik?** (Pniël, eerstgeboorterecht, losser, zak en as)
- **Waarom gebeurt dit?** (alleen als de Schrift zelf of de gangbare uitleg het zegt; geen eigen psychologie)
- **Hoe hangt dit samen met de rest van de Bijbel?** (belofte en vervulling, waar het Nieuwe Testament het zelf uitlegt)
- **Waar is dit?** (alleen in woorden; de kaart blijft zoals ze is)

Waar het Nieuwe Testament een geschiedenis zelf uitlegt (Hebreeën 11, Galaten 3 en 4, Handelingen 7, 1 Korinthe 10), is dat de eerste bron.

## 5. Werkbestanden

Per pakket staat in `werk/<pakket>.md` kort wat er is meeverteld, waarom dat algemeen aanvaard is en waar het is nagekeken. Dat is een werkdocument voor wie na ons komt, geen tekst in de app. Eerlijk noteren: **nagekeken bij een bron** (met vindplaats) of **niet nagekeken, uit algemene kennis**.

| Pakket | Geschiedenissen | Reisdelen (`public/bijbelreis/inhoud/`) |
| --- | --- | --- |
| `u01` | 1–20 | `genesis.js` |
| `u02` | 21–36 | `exodus.js`, `leviticus.js`, `numeri.js` |
| `u03` | 37–47 | `jozua.js`, `richteren.js`, `ruth.js` |
| `u04` | 48–59 | `1samuel.js`, `2samuel.js` |
| `u05` | 60–68, 71 | `1koningen.js`, `2koningen.js`, `2kronieken.js` |
| `u06` | 69–70, 72–79, 150 | `jona.js`, `daniel.js`, `esther.js`, `ezra.js`, `profeten.js` |
| `u07` | 80–99 | `nt-jezus-1.js` |
| `u08` | 100–117 | `nt-jezus-2.js` |
| `u09` | 118–133 | `nt-jezus-3.js` |
| `u10` | 134–149 | `nt-handelingen.js`, `brieven.js`, `nt-openbaring.js` |

Een geschiedenis bestaat uit vier teksten: de basis in `public/bijbelreis/geschiedenissen/*.js` (`uitleg`, `betekenis`, `quiz`, `ontdek`) en de niveaus a, b en c in `docs/bijbelreis-niveaus/werk/uit/batch-*.json`. De bestanden `public/bijbelreis/niveaus/{a,b,c}.js` worden daaruit gemaakt met `node scripts/niveaus/samenvoegen.mjs`; bewerk die nooit met de hand.

## 6. Controles

```
node scripts/niveaus/samenvoegen.mjs && node scripts/niveaus-controle.mjs --volledig
node scripts/bijbelreis-personen-check.mjs
npx vitest run
```

Daarna de e2e-tests en de visuele vergelijking zoals in [`../bijbelreis-audit/releases.md`](../bijbelreis-audit/releases.md).

**Wat ‘gecontroleerd’ hier betekent:** een schrijver heeft de toets gedaan en een aparte AI-redacteur heeft de wijzigingen nagelezen tegen de Statenvertaling en tegen de maatstaf van §1. Er heeft geen theoloog naar gekeken. Omdat uitleg nu als vertelling staat, is juist dit onderdeel de moeite waard om door een predikant of ouderling te laten lezen; de werkbestanden in `werk/` zijn daarvoor de ingang.

## 7. Besluiten bij twijfelgevallen (coördinator)

Bij het samenvoegen van de pakketten zorgt de eindredactie dat deze keuzes overal gelijk zijn.

| Onderwerp | Besluit | Grond |
| --- | --- | --- |
| De Engel des HEEREN (Exodus 3; Richteren 6 en 13; Jozua 5:13–15; voor Genesis 32 zie ‘Uitzondering Jakob’) | Overal vertellen: de Engel des HEEREN is de Zoon van God. Eén pakket liet het in Exodus 3 open omdat Matthew Henry daar geen keuze zou maken; de kanttekeningen (‘de HEERE zelf’) en Calvijn (‘de Zoon van God’) zeggen het wel, en elders in de atlas staat het al zo. Consistentie gaat voor. | Kanttekeningen, Calvijn; Hosea 12:4–5; Maleachi 3:1 |
| Mirjam als de zus bij het kistje (Exodus 2:4) | Als feit vertellen. | Kanttekeningen; Numeri 26:59 |
| Reüel en Jethro | Alleen de tekst; geen keuze. | Kanttekeningen en Calvijn verschillen |
| De Man bij de Jabbok (Genesis 32) | Vervallen op 15-11-2026: zie de rij ‘Uitzondering Jakob’ hieronder. | — |
| Basis van geschiedenis 8 (Abrams roeping) | `indeling.js` vereist dat de basis begint met “Dan zegt de HEERE tegen Abram”. Laat die zin staan en voeg erna toe dat God Abram al in Ur had geroepen (Handelingen 7:2–4), zodat basis, b en c gelijk zijn. | Handelingen 7:2–4 |
| **Uitzondering Jakob (Genesis 25–35)** (15-11-2026) | Voor het verhaal van Jakob geldt de regel van §1 níet. Na een preek over Genesis 32 gaf Martijn op 15-11-2026 een eigen opdracht: “Maak onderscheid tussen wat de Bijbeltekst vertelt en een mogelijke uitleg of persoonlijke toepassing. Presenteer interpretaties niet als letterlijk bijbelse feiten.” Daarom staat in de delen `izak` (stap 5–6), `jakob`, `jakob-jabbok` en in geschiedenis 15–17 de navertelling (`txt`, `uitleg`) alleen wat de tekst zegt; uitleg staat apart, in een `fact` met `fs: "u"`, in `betekenis` of in een c-blok, en is herkenbaar als uitleg geformuleerd (“Dit is uitleg: veel christelijke uitleggers, ook de kanttekeningen …”). Dat geldt voor wie de Man bij de Jabbok is (de Zoon van God, volgens de kanttekeningen bij 32:24), de ladder als beeld van Christus (Johannes 1:51–52) en de betekenis van 33:10. Een vergelijking die de tekst niet zelf maakt (‘Wie zijt gij, mijn zoon?’ naast ‘Hoe is uw naam?’) staat alleen als overdenking; de heup krijgt geen symbolische uitleg. Reflectievragen staan in het nieuwe veld `denk`. Buiten Genesis 25–35 blijft §1 gelden. | Opdracht van Martijn (15-11-2026); verantwoording en bronnen in `../bijbelreis-reizen/werk/jakob.verantwoording.md` |
