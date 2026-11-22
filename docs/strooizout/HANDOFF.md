# Strooizout voor de buurt — overdracht

**Status (22-11-2026):** afgerond op branch `claude/strooizout-webshop-hfgvr1` (PR #78), klaar voor uitrol. Domein **strooizouthouten.nl** (Theory7, zone in Cloudflare) wordt na de uitrol als custom domain aan de Worker `martijndenbesten` gekoppeld. Geen echte bestellingen, inkooporders, betaalde diensten of berichten.

Functionaliteit, configuratie en livegangchecklist: [README.md](README.md).

## Besluiten van Martijn (22-11) en verwerking

| Besluit | Verwerkt |
| --- | --- |
| Verkoper overal **Denckh** (alleen die naam): Vlierweg 54, Houten · KvK 83176896 · btw NL003791952B15; geen KOR, 21% btw | Standaardinstellingen verkoper_* en btw inclusief 21%; zichtbaar in de voet, de voorwaarden en de privacyverklaring. Postcode niet ingevuld (niet verzonnen); kan desgewenst in *Instellingen › Verkoper › Adres* |
| Inkoopprijs en leverancier leeg laten; marge alleen tonen als er een inkoopprijs is | Waarschuwing ‘inkoopprijs ontbreekt’ verwijderd; inkoop, brutowinst en margekolommen/CSV verschijnen pas als er een inkoopprijs of werkelijke inkoop is |
| Bezorgen alleen binnen de rondweg van Houten, instelbaar | Postcodelijst met uitzonderingen (zie hieronder); melding buiten het gebied: ‘We bezorgen alleen binnen de rondweg van Houten. Op deze postcode kan dat helaas niet, maar je kunt je bestelling wel gratis afhalen.’ Flyer en deeltekst: ‘Bezorgen binnen de rondweg’ |
| Voorwaarden zelf schrijven, kort, Denckh als verkoper, concept | Nieuwe standaardtekst met kopjes (zie hieronder) |
| Eigen domein strooizouthouten.nl | Korte adressen, www → hoofddomein, canonical, robots/sitemap, QR-codes en beelden op `https://strooizouthouten.nl` |

## Te controleren door Martijn

1. **Bezorggebied (te controleren).** Standaard: postcodegebieden 3991–3995 behalve 65 postcodes buiten de rondweg:
   - `niet: 3991` CD CE CG CH CJ CK CL CM CN CP CR CS CT CW CX CZ LA LB LC LD LJ LK LM LN LS LZ MC (o.a. Duwboot, Pakketboot, Diepe Hoon, Draaibrug, Houtensewetering, Veerwagenweg, Heemsteedseweg, Schonauwenseweg);
   - `niet: 3992` AA AB AC AD AE AG AK AL DB DC DD DE DG DH DJ LK LL LM LN LP LR LS LT LV LW LX LZ (o.a. Essenkade, Elzenkade, Meidoornkade, Peppelkade, Waterveste, Hoofdveste, De Staart, Utrechtseweg, Waijensedijk, Oud Wulfseweg, Koedijk, Fortweg, Poort van Wulven);
   - `niet: 3994` AD AE AH AJ AN AV AX MA MC MD MG (o.a. Handboog, Kruisboog, Wijkerweg, Rietdijk, Binnenweg, Kruisweg, Het Bos, Poeldijk, Beusichemseweg, Oostrumsdijkje).

   Bron: PDOK Locatieserver (geometrie ‘Rondweg, Houten’ + middelpunt van alle 1072 postcodes in Houten; 1007 binnen, 65 buiten). Een postcode die over de rondweg loopt telt volgens zijn middelpunt. Aanpassen in *Instellingen › Bezorgen*; de postcodecheck daar laat direct zien of een adres erbinnen valt.
2. **Voorwaarden (concept, wacht op akkoord).** Onderwerpen: wie verkoopt, wat we verkopen, prijzen incl. 21% btw, vooruit bestellen (voorraad vanaf 26 november), afhalen (gratis) en bezorgen (binnen de rondweg, vanaf 2 zakken, € 0,50 per zak), betalen na bestellen (Tikkie of ter plekke/aan de weg), annuleren en terugbrengen, klachten, privacy, contact. Bedrijfsgegevens komen uit de verkopervelden, niet uit de tekst. Let op: ik heb **14 dagen bedenktijd na ontvangst** opgenomen (ongeopende zakken terugbrengen, geld terug), omdat de wettelijke bedenktijd voor online verkoop aan consumenten geldt. Aanpassen in *Instellingen › Voorwaarden*.
3. **Nog invullen in *Instellingen*:** afhaaladres (privé, pas zichtbaar na bevestiging) en eventueel een telefoonnummer.

## Gecontroleerd

| Controle | Resultaat |
| --- | --- |
| `npm run typecheck` | geslaagd |
| `npm test` (hele site) | 544 geslaagd, 1 overgeslagen (bestaand) |
| `tests/strooizout.test.ts` | 63/63, o.a. bezorggebied binnen/buiten de rondweg (Aalsloot binnen, Duwboot en Beusichemseweg buiten), bestelling buiten het gebied geweigerd met de juiste melding, robots/sitemap eigen domein |
| `e2e/strooizout.spec.ts` (desktop + mobiel) | 22/22, incl. postcode buiten de rondweg in het bestelformulier en axe op webshop, aan de weg, privacy, voorwaarden en beheer |
| QR-codes (gerenderd en gedecodeerd) | flyer A5 en WhatsApp-beeld: `https://strooizouthouten.nl`; bord A4: `https://strooizouthouten.nl/aan-de-weg` |
| Beelden | flyer A5, bord A4, delen 1080 en 1200 × 630 opnieuw gemaakt en bekeken (met ‘Op voorraad vanaf donderdag 26 november’ en ‘Bezorgen binnen de rondweg’) |
| Voorwaardenpagina | bekeken op iPhone-formaat |

## Open punten (niet blokkerend)

- **Automatische betaling via QR aan de weg** (Mollie) vraagt een kostenakkoord; tot die tijd bevestigt de verkoper betaling en uitgifte in het beheer (README › Verkoop aan de weg).
- Cloudflare Access voor `/beheer` (gratis, aanbevolen extra slot).

## Volgende stap

Agent: PR #78 mergen, uitrollen (ingebedde variant), productie controleren en een fictieve testbestelling plaatsen en weer verwijderen; daarna Claude in Chrome laten koppelen, domein controleren en de doorverwijzing van het oude adres aanzetten.
