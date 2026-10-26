# Bijbelreis: reisniveaus (proefimplementatie)

| | |
| --- | --- |
| Branch | `claude/bijbelreis-niveaus`, afgesplitst van `claude/bijbelreis-3.1` op `23fea0b` (PR #7) |
| Status | proef ter beoordeling; niet gemerged, niet gepubliceerd |
| Productie | draait ongewijzigd op 3.0 |

Er zijn drie niveaus in één applicatie, op één inhoudelijke basis.

| Code | Naam | Leeftijd | Voor wie |
| --- | --- | --- | --- |
| `a` | Samen ontdekken | 4–6 jaar | kind met ouder of begeleider |
| `b` | Zelf op reis | 7–10 jaar | zelfstandig lezen; standaard voor een nieuwe bezoeker die niet kiest |
| `c` | Verder ontdekken | 11+ | tieners en volwassenen; volledige 3.1-inhoud met verdieping |

De negen voorbeeldteksten staan in [`voorbeeldteksten.md`](voorbeeldteksten.md).

## 1. Inhoudsmodel

```
geschiedenissen/*.js   basis per geschiedenis (ongewijzigd): titel, ref, stappen, uitleg (vertelling),
                       betekenis, kernwoord, cross, quiz, tijd, tijdNoot, ontdek
indeling.js            tussenkoppen voor de bestaande vertelling (3.1)
dateringen.js          grond van de jaartallen (3.1)
niveaus.js             NIEUW: per geschiedenis per niveau een vertelversie
```

`niveaus.js` voegt alleen toe; het vervangt niets in de basis.

```js
BR.niveaus.verhalen[nr] = {
  a: { status, delen: [{ t, stap? }], samen, vragen: [{ q, a: [goed, fout], why }], plaatsen: [id] },
  b: { status, delen: [{ kop, t, stap? }], vragen: [{ q, a: [goed, fout, fout], why }] },
  c: { status, verdieping: [{ kop, t, refs? }], vragen: [...] },   // vertelling = bestaande uitleg
}
```

- **`status`** is `"concept"` (nieuw geschreven, wacht op redactie) of `"goedgekeurd"`. Een conceptversie staat in de app altijd gemarkeerd als ‘Proefversie · nog niet redactioneel gecontroleerd’.
- **`stap`** koppelt een verhaalstap aan een bestaande kaartstap: de kaart volgt mee.
- **`plaatsen`** (alleen bij `a`) bepaalt welke plaatsen de kaart voor jonge kinderen toont. Ligging en zekerheidsteken blijven gelijk.
- **`samen`** is een korte tip voor wie voorleest, achter ‘Voor wie voorleest’.

**Terugval als een versie ontbreekt:**

| Niveau | Bij een ontbrekende versie |
| --- | --- |
| `c` | Altijd volledig: de bestaande vertelling, uitleg, kernwoord, verwijzingen en vragen. |
| `b` | De bestaande vertelling (die in 3.0 al voor 8–14 jaar is geschreven), in onderdelen, met verdieping achter ‘Meer weten’. |
| `a` | Nooit de moeilijkere tekst alsof die passend is. In plaats daarvan staat er: ‘Deze geschiedenis is nog niet bewerkt voor Samen ontdekken’, met een keuze uit de verhalen die al klaar zijn of de 7–10-vertelling om voor te lezen. |

**Automatische controles** (`tests/bijbelreis.test.ts`, ‘reisniveaus’):

- Citaten tussen ‘ ’ staan letterlijk in de Statenvertaling. Getoetst wordt tegen de volledige tekst in `bijbel/*.json`.
- Elke Bijbelverwijzing bestaat.
- Elke kaartstap en elke kaartplaats hoort bij de geschiedenis.
- Antwoorden zijn uniek.
- Samen ontdekken:
  - maximaal 140 tekens per stap;
  - maximaal 3 zinnen per stap;
  - geen jaartallen;
  - precies 2 antwoorden per vraag;
  - een tip voor wie voorleest.
- Zelf op reis:
  - 2–4 onderdelen met kop;
  - samen hooguit 1.000 tekens;
  - 3 antwoorden per vraag.
- Verder ontdekken: verdieping met minstens 2 blokken; vragen met 3 antwoorden.

## 2. Voortgang en opslag

**Nieuwe sleutels** (alleen deze, lokaal, zonder persoonsgegevens):

| Sleutel | Inhoud |
| --- | --- |
| `bijbelreis:niveau` | `"a"`, `"b"` of `"c"` |
| `bijbelreis:niveauTip` | eenmalige melding voor bestaande reizigers |
| `bijbelreis:samen:<nr\|alles>` | beste score bij Samen speuren |

**Bestaande sleutels:**

- De 252 stapsleutels (`gezien`), `best:<boek>:<deel>`, `laatst`, `huidig` en `welkomWeg` veranderen niet.
- **Eén stempel per geschiedenis.** `verhalen[nr].q` blijft de stempel (‘vragen gemaakt’) en de beste score, ongeacht het niveau. Wisselen telt dus niets dubbel en wist niets. De score per niveau staat apart in `verhalen[nr].lv = { a, b, c }`. Zo overschrijft een korte Samen-ronde geen eerdere score.
- **Geen migratie nodig.** Oude opslag blijft geldig. `lv` en de nieuwe sleutels komen er alleen bij.

**Wie wat ziet bij het eerste bezoek na de update:**

| Situatie | Wat er gebeurt |
| --- | --- |
| Nieuwe bezoeker | Een rustige keuze ‘Hoe wil je op reis?’ bovenaan. Wie zonder kiezen een geschiedenis opent, houdt Zelf op reis; de keuze komt dan niet opnieuw. |
| Bestaande reiziger (heeft voortgang, nog geen niveau) | Krijgt automatisch Verder ontdekken. Dat is de volledige inhoud van nu: er verdwijnt niets. Eén korte melding legt uit dat er nu niveaus zijn. |

**Wisselen** gaat via de knop met de niveaunaam in de kop (een klein keuzevenster; Escape sluit het).

## 3. Wat verschilt per niveau

| Onderdeel | Samen ontdekken (4–6) | Zelf op reis (7–10) | Verder ontdekken (11+) |
| --- | --- | --- | --- |
| **Start** | korte kaart: titel + ‘Begin/Verder’; anders keuze uit de klare verhalen | reisetiket met route en etappes | idem |
| **Lijst** | alleen verhalen met een Samen-versie, groot; geen zoeken of filters | 150 met zoeken en filters | idem |
| **Verhaal** | één korte stap per scherm, voortgangsstippen, grote knoppen; de kaart volgt elke stap; ‘Voor wie voorleest’ | B-vertelling (of de bestaande) in onderdelen; tijdvak in plaats van jaartal; alles extra achter ‘Meer weten’ | bestaande vertelling; jaartal met grond; uitklapbare blokken: Uitleg (open), Verdieping, Kernwoord, Kaart, Elders in de Bijbel |
| **Vragen bij verhaal** | 3 vragen × 2 antwoorden, direct na het verhaal | B-vragen (3 antwoorden), anders de bestaande | bestaande + verdiepende vragen |
| **Kaart** | alleen de plaatsen uit het verhaal; alleen de hoofdroute; geen Toen/Nu, legenda of Bijbelwereld; eenvoudige pop-up (naam + hoe zeker) | zoals 3.1, met andere mogelijke plekken | zoals 3.1 |
| **Wie is wie** | de personen van het verhaal, elk met één zin | stamboom en personenkaarten | idem, met ‘Waar staat dat?’ direct open |
| **Tijdlijn** | alleen de volgorde: 16 etappes, ‘Hier ben je nu’ | delen in volgorde; jaartal en grond achter ‘Wanneer was dat?’ | jaartallen met grond, legenda en toelichting |
| **Speurtocht** | Samen speuren: vragen met 2 antwoorden over begrip, uit de klare verhalen | zoals 3.1 (kaart, meerkeuze, volgorde) | idem, plus verdiepende vragen in de pool |
| **Paspoort** | twee getallen, de verhalen als grote tegels, stempelbladen dicht, geen ‘leegmaken’ | zoals 3.1 | idem |

**Bewust gelijk gebleven:**

- de zes onderdelen in de navigatie (hetzelfde voor ouder en kind);
- de geografie en de zekerheidstekens;
- de bestaande inhoud.

**Rust, ook buiten de niveaus:**

- Het reisetiket is compacter: één regel route of stap in plaats van twee extra regels.
- De verdieping in het verhaal staat achter uitklapbare blokken in plaats van een stapel kaarten.

## 4. Testresultaten (26 oktober 2026, lokaal)

| Test | Uitkomst |
| --- | --- |
| Typecheck en unittests (hele site), incl. 6 nieuwe tests voor de reisniveaus (o.a. citaten letterlijk Statenvertaling) | 82 geslaagd, 0 mislukt (1 overgeslagen: 150-controle zonder vlag) |
| Bijbelreis met `BIJBELREIS_150=1` | 32/32 |
| Personencheck `--streng` | geen fouten |
| Doorklikken van alle delen en alle 150 (`bijbelreis-check.mjs`, standaardniveau) | desktop, telefoon en tablet: geen problemen |
| Alle 150 op Samen ontdekken en Verder ontdekken | 3 met Samen-versie, 147 met de duidelijke melding, geen lege pagina, geen scriptfouten |
| Volledige Playwright-suite (desktop, mobiel, tablet, 3D; incl. axe) met 7 nieuwe niveautests | 226 geslaagd, 0 mislukt, 23 overgeslagen (21 visuele buiten het vaste image, 2 alleen-telefoon op desktop) |
| Visuele regressie in het vaste image | 21/21; alle referentiebeelden opnieuw gemaakt en elk bekeken (nieuw: Samen- en Zelf-verhaal op 3 apparaten) |
| Toegankelijkheid (axe, WCAG 2.2 AA) op eerste bezoek, keuzevenster, Samen-verhaal, -vragen, -tijdlijn, -wie, verhaal zonder Samen-versie, Zelf- en Verder-verhaal | geen schendingen |
| Voortgang uit productie (3.0) naar deze proef | desktop, Pixel 7, iPhone SE: stempels, scores en geschiedenissen behouden; automatisch Verder ontdekken met melding |

**Gevonden en opgelost tijdens de controle:**

- **Elke klik bouwde het verhaal opnieuw op.** De bestaande tests vingen dit. De oorzaak: het attribuut `data-niveau` op `body` werd als niveauknop gezien.
- **Routes naar verborgen plaatsen.** Bij Samen ontdekken liep er een route naar een plaats die niet getoond werd (Etham). Zulke routes zijn nu ook verborgen.
- **Lengte.** De Zelf-op-reis-versie van de Schelfzee was bijna even lang als de uitgebreide vertelling. Die is ingekort.

**Screenshots** staan in `screenshots/`:

- `0-keuze.jpg`
- `mobiel-a.jpg`
- `mobiel-b.jpg`
- `mobiel-c.jpg`
- `desktop-niveaus.jpg`

## 5. Voorstel: gecontroleerde uitbreiding naar alle 150

Er komen geen automatisch gegenereerde vereenvoudigingen online. Per geschiedenis:

1. **Concept.** Opstellen per niveau, volgens dit model en de regels hierboven. De status blijft `concept`.
2. **Automatische poort.** De unittests (citaten letterlijk Statenvertaling, verwijzingen, lengte, aantal antwoorden, geen jaartallen bij A, kaartstappen) moeten slagen.
3. **Inhoudelijke controle** door een tweede lezer, met een vaste checklist:
   - trouw aan de tekst;
   - niets toegevoegd wat de Bijbel niet zegt;
   - moeilijke onderwerpen;
   - toon per leeftijd;
   - vragen toetsen begrip.
4. **Redactioneel akkoord** (Martijn). Pas dan wordt de status `goedgekeurd` en verdwijnt de proefmarkering.
5. **Vrijgave.** Een release toont alleen versies met de status `goedgekeurd`. Aanbeveling: een releasecheck die faalt zodra er nog een conceptversie zichtbaar is.

**Volgorde:** in batches van ongeveer 15, per tijdvak, te beginnen met de meest gelezen geschiedenissen (schepping tot Jozef; geboorte tot Pasen).

**Ruwe schatting:** A en B zijn samen ongeveer 1.500 woorden per geschiedenis, plus 6–10 vragen. Een C-verdieping alleen waar die echt iets toevoegt; niet elke geschiedenis heeft die nodig.

**Moeilijke geschiedenissen** krijgen een eigen ronde met extra zorg, bijvoorbeeld de zondvloed, Sodom, het offer van Izak, Jefta, David en Bathseba, de verwerping en de kruisiging. Bij A komt er altijd een tip voor wie voorleest. Sommige geschiedenissen krijgen bij A misschien bewust geen versie: dan geldt de duidelijke melding hierboven.

## 6. Beslissingen voor Martijn

1. **Teksten.** Keur de negen voorbeeldteksten goed, of geef aanwijzingen: toon, lengte en wat er bij A wel of niet in moet.
2. **Bestaande reizigers** krijgen automatisch Verder ontdekken. Akkoord, of liever eenmalig vragen?
3. **Nieuwe bezoeker die niet kiest** krijgt Zelf op reis. Akkoord?
4. **Navigatie bij Samen ontdekken.** Nu blijven de zes onderdelen. Alternatief: bij A alleen Verhalen, Speurtocht en Paspoort.
5. **Voorlezen (spraak).** Niet ingebouwd. De browserstemmen spreken namen als Pi-Hachiroth en ‘HEERE’ wisselend goed uit. Opgenomen audio is wel betrouwbaar, maar kost per verhaal werk. Wens?
6. **Lengte van B.** Mag B langer zijn dan de bestaande vertelling als dat helpt bij het begrip (zie de schepping en de geboorte)?
7. **Kaart bij Verder ontdekken.** Die is nu gelijk aan Zelf op reis; de extra geografie zit in de tekst. Wil je bij 11+ ook kaartextra's, zoals moderne namen of afstanden?
8. **Uitbreiding.** Akkoord met de werkwijze in §5, inclusief de releasecheck op conceptversies?
