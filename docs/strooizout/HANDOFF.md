# Strooizout voor de buurt — overdracht

**Status (22-11-2026):** gebouwd en getest op branch `claude/strooizout-webshop-hfgvr1`. **Niet gepubliceerd** (opdracht: pas na laatste controle van de configuratie). Geen echte bestellingen, inkooporders, betaalde diensten of berichten.

## Wat er staat

Zie [README.md](README.md) voor functionaliteit, configuratie, secrets en de livegangchecklist.

## Gecontroleerd

| Controle | Resultaat |
| --- | --- |
| `npm run typecheck` | geslaagd |
| `npm test` (Vitest, hele site) | 530 geslaagd, 1 overgeslagen (bestaand) |
| `tests/strooizout.test.ts` | 47/47, 12× achter elkaar herhaald zonder fouten |
| `e2e/strooizout.spec.ts` (desktop + Pixel 7) | 22/22: bestelroute met twee producten en bezorgen, staffel 3 → 4 → 5 zakken, ophalen + annuleren op de telefoon, beheer (afhalen op code, één keer uitgeven, betaalverzoek, betaling, CSV), toegankelijkheid (axe) |
| Volledige e2e-suite (desktop, mobiel, tablet) | 1018 geslaagd, 207 overgeslagen (bestaand); geen regressie op de rest van de site. De 6 Strooizout-fouten in die run kwamen door een schemawijziging tijdens de run en zijn daarna opnieuw gedraaid (22/22) |
| Ingebedde uitrolvariant (`embed-assets` + typecheck + `wrangler deploy --dry-run`) | bouwt; 8,5 MB gzip in totaal (hele site). Let op: de grens voor een Worker is 10 MB (betaald plan); vooral de Bijbelreis neemt ruimte in. Met Static Assets (GitHub Actions) speelt dit niet |
| Onafhankelijke review van de servercode | 6 bevindingen, alle opgelost en getest: voorraad overschreven bij productwijziging, overboeking van momenten, bewaartermijn alleen bij bezoek beheer (nu dagelijkse cron), te raden links zonder `HASH_SECRET` (nu fail closed), werkelijke inkoop over alle rondes, momenten in UTC. Zelf gevonden: dubbele betaling bij uitgifte in dezelfde milliseconde (opgelost) |
| QR-code op deelbeeld en in de gerenderde PDF | gedecodeerd: `https://martijndenbesten.com/strooizout` |
| Schermen | webshop, mandje, bestellen, controle, bevestiging, beheer (alle tabbladen), flyer: desktop 1440 px en Pixel 7 bekeken, geen consolefouten |

## Aanvulling 22-11 (tweede opdracht)

Mobiel nummer verplicht (NL, ook +31), e-mail optioneel, adres alleen bij bezorgen; afhaalcode H-dddd met uitgifte op code (één keer); betaalstatussen openstaand / betaalverzoek verstuurd / betaald / terugbetaald met kopieerknoppen voor nummer en bedrag; staffelkorting vanaf 4 zakken € 8,49 (instelbaar per product); bestellen op één scherm met vaste totaalbalk op de telefoon. Migratie `0004` is aangepast (nog nergens toegepast, dus geen extra migratie nodig). Nieuw: cron-trigger `17 3 * * *` in beide wrangler-configs.

## Open punten voor Martijn

1. **Btw:** ben je voor deze verkoop btw-plichtig (of KOR)? Standaard staat ‘geen btw vermelden’; prijzen zijn eindprijzen. Aan te passen in *Instellingen*.
2. **Afhaaladres, contactgegevens en bezorggebied** invullen/controleren in *Instellingen* (bezorggebied staat op postcodes 3991–3995; controleer of dat het gewenste deel van Houten is).
3. **Inkoopprijs en leverancier** van strooizout 25 kg invullen; zonder inkoopprijs toont het beheer de winst als ‘onvolledig’.
4. **Voorwaarden** zijn een voorzichtige standaardtekst (reservering, betalen bij ontvangst, kosteloos annuleren). Laat ze bij twijfel nakijken.
5. **Cron-trigger:** de uitrol voegt een dagelijkse geplande taak toe aan de Worker (gratis; telt mee in het maximum van 5 cron-triggers per account op het gratis plan).
6. **Publiceren:** volgens de livegangchecklist in README.md, na jouw akkoord op de configuratie.

## Volgende stap

Martijn: punten 1–4 beslissen of invullen (kan ook na uitrol in het beheer). Daarna uitrol volgens de checklist; de agent kan dat uitvoeren zodra er een uitrolroute met Cloudflare-toegang beschikbaar is (in deze cloudsessie geen Cloudflare-token).
