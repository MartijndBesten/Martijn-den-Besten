# Strooizout voor de buurt — overdracht

**Status (22-11-2026):** gebouwd en getest op branch `claude/strooizout-webshop-hfgvr1`. **Niet gepubliceerd** (opdracht: pas na laatste controle van de configuratie). Geen echte bestellingen, inkooporders, betaalde diensten of berichten.

## Wat er staat

Zie [README.md](README.md) voor functionaliteit, configuratie, secrets en de livegangchecklist.

## Gecontroleerd

| Controle | Resultaat |
| --- | --- |
| `npm run typecheck` | geslaagd |
| `npm test` (Vitest, hele site) | zie eindrapport in de PR |
| `tests/strooizout.test.ts` | zie eindrapport in de PR |
| `e2e/strooizout.spec.ts` (desktop + Pixel 7) | zie eindrapport in de PR |
| Volledige e2e-suite (desktop, mobiel, tablet) | zie eindrapport in de PR |
| Ingebedde uitrolvariant (`embed-assets` + typecheck + `wrangler deploy --dry-run`) | bouwt; zie bundelgrootte hieronder |
| QR-code op deelbeeld en in de gerenderde PDF | gedecodeerd: `https://martijndenbesten.com/strooizout` |
| Schermen | webshop, mandje, bestellen, controle, bevestiging, beheer (alle tabbladen), flyer: desktop 1440 px en Pixel 7 bekeken, geen consolefouten |

## Open punten voor Martijn

1. **Btw:** ben je voor deze verkoop btw-plichtig (of KOR)? Standaard staat ‘geen btw vermelden’; prijzen zijn eindprijzen. Aan te passen in *Instellingen*.
2. **Afhaaladres, contactgegevens en bezorggebied** invullen/controleren in *Instellingen* (bezorggebied staat op postcodes 3991–3995; controleer of dat het gewenste deel van Houten is).
3. **Inkoopprijs en leverancier** van strooizout 25 kg invullen; zonder inkoopprijs toont het beheer de winst als ‘onvolledig’.
4. **Voorwaarden** zijn een voorzichtige standaardtekst (reservering, betalen bij ontvangst, kosteloos annuleren). Laat ze bij twijfel nakijken.
5. **Publiceren:** volgens de livegangchecklist in README.md, na jouw akkoord op de configuratie.

## Volgende stap

Martijn: punten 1–4 beslissen of invullen (kan ook na uitrol in het beheer). Daarna uitrol volgens de checklist; de agent kan dat uitvoeren zodra er een uitrolroute met Cloudflare-toegang beschikbaar is (in deze cloudsessie geen Cloudflare-token).
