# Strooizout voor de buurt — overdracht

**Status (22-11-2026, 12:48):** **live op https://martijndenbesten.com/strooizout** (PR #78 gemerged als 00471ba).

- Uitgerold via de ingebedde variant: Worker `martijndenbesten` versie `0010e146-6db2-4f8b-b8d3-1520a757ded7`, `martijndenbesten-www` versie `c1ce1d69-3189-4f77-9b68-f1c32b31327d`. Herstelpunt van daarvoor: `8f62bf48-ccb4-4f15-bab5-96e940e76de2`.
- Migratie 0004 is op productie toegepast. Gecontroleerd: zak 10,49 met staffels 9,49 en 8,99; inkoop 7,09; voorraad 40/40; emmer op ‘binnenkort’.
- Rooktest geslaagd: home, museum, Bijbelreis, beheer, webshop, API (beheer zonder token geeft 401), noindex op het beheer, en de PDF’s en beelden.
- **Nog niet gedaan:** de bestelronde openen (winkel staat op `open: false`), de productietestbestelling, en het koppelen van strooizouthouten.nl. Deze schrijfacties op productie hield het permissiesysteem van de uitrolsessie tegen; zie *Vragen* 11–12. De zone strooizouthouten.nl staat in Cloudflare op `active`.

Functionaliteit, configuratie en livegangchecklist: [README.md](README.md).

## Commerciële versie (opdracht 22-11-2026)

| Onderdeel | Uitgevoerd |
| --- | --- |
| Prijzen 25 kg | 1 zak € 10,49 · 2–3 zakken € 9,49 · 4 of meer € 8,99 per zak, voor alle zakken zodra de drempel is bereikt. Server rekent (twee aanbiedingen in `sz_aanbieding`); opgeslagen per bestelregel met normaalprijs en korting |
| Bestelkaart | drie keuzes 1 / 2 (‘Voordelige keuze’) / 4 (‘Extra voordeel’) met totaal en besparing; standaard 2; ieder aantal via de stepper; totaal met ‘je bespaart’ ten opzichte van losse zakken |
| Boodschap | ‘Strooizout uit je eigen buurt.’ · ‘Hou je buurt veilig. Strooi bewust.’ · ‘Geen aparte rit naar de bouwmarkt. Bestel samen met je buren en houd je stoep veilig.’ · ‘Neem er eentje mee voor je buren.’ |
| Strooi bewust | korte gebruikstip en milieu/huisdieren op de homepage, zonder absolute claims |
| Emmer 5 kg | product ‘Strooizout 5 kg in emmer’, € 7,49, nieuwe status **binnenkort** (zichtbaar, niet te bestellen; server weigert). Eigen voorraad; *Voorraad › Emmers afvullen* boekt zakken af en emmers bij |
| Voorraad | 40 verwacht, inkoop € 7,09 incl. btw ingevuld, waarschuwing bij ≤ 10 te reserveren (instelbaar), label *voorbestelling* + KPI ‘Voorbestellingen open’ |
| Administratie | brutomarge **exclusief btw** (totaal, producten, per product, CSV); inkoopveld heet ‘Inkoopprijs incl. btw’ |
| Marketing | flyer A5, WhatsApp 1080², buurt-app/social 1200 × 630, bord A4 en deeltekst vernieuwd; knop ‘Deel met je buren’ op de homepage |

## Vindbaarheid en meting (opdracht 11, 22-11-2026)

Volledig plan, kanaalregels en klaarliggende teksten: [PROMOTIE.md](PROMOTIE.md).

| Onderdeel | Status |
| --- | --- |
| Titel, beschrijving, H1 | ‘Strooizout kopen in Houten – 25 kg, afhalen of bezorgen’. Metabeschrijving met prijs en bezorging. Regel ‘Strooizout kopen in Houten · 25 kg · afhalen of bezorgen’ boven de H1 ‘Strooizout uit je eigen buurt.’ Voorwaarden en privacy hebben elk een eigen beschrijving |
| robots.txt, sitemap, canonical | Eigen robots.txt en sitemap op strooizouthouten.nl (/, /voorwaarden, /privacy). Canonical op het eigen domein. Beheer, bestelpagina, flyer en ‘aan de weg’ staan op noindex. Geen extra SEO-landingspagina’s |
| Product/Offer (schema.org) | De Worker zet de JSON-LD in de homepage op het eigen domein, met de actuele prijs, staffels (10,49 / 9,49 / 8,99), beschikbaarheid (PreOrder met datum, InStock na ontvangst), verkoper Denckh en retourbeleid. ‘Binnenkort’-producten staan er niet in |
| Open Graph / WhatsApp-voorbeeld | `delen-1200x630.jpg` (75 kB), met titel, beschrijving en alt-tekst |
| Google-verificatie | *Instellingen › Google-verificatiecode*: de site zet de meta-tag zelf, zonder uitrol |
| Search Console / Merchant Center / Bedrijfsprofiel | Hiervoor is de Google-login van Martijn nodig. Merchant Center vraagt eerst een besluit over ‘reservering of koop’. Een tweede Bedrijfsprofiel wordt afgeraden (PROMOTIE.md §3–4) |
| Meting | Cookieloze bezoektelling: per bezoeker per pagina per dag één rij, met een dagelijks wisselende HMAC-code, zonder IP of user-agent. Er wordt gekeken naar herkomst, bron (`?via=` in QR-codes en deellinks), bestellingen met bron, conversie, gemiddeld aantal zakken en bundelverdeling. Te vinden in *Beheer › Overzicht › Bezoek en verkoop*. Privacyverklaring bijgewerkt; de gegevens worden na 400 dagen gewist |

## Marge per product en staffel (exclusief btw)

Inkoop zak € 7,09 incl. = **€ 5,86 excl.** Btw 21% op verkoop en inkoop (voorbelasting).

| Aantal | Prijs incl. | Prijs excl. | Marge per zak | Marge per bestelling | Marge % |
| --- | --- | --- | --- | --- | --- |
| 1 zak | € 10,49 | € 8,67 | € 2,81 | € 2,81 | 32% |
| 2 zakken | € 9,49 | € 7,84 | € 1,98 | € 3,96 | 25% |
| 3 zakken | € 9,49 | € 7,84 | € 1,98 | € 5,94 | 25% |
| 4 zakken | € 8,99 | € 7,43 | € 1,57 | € 6,28 | 21% |
| 10 zakken | € 8,99 | € 7,43 | € 1,57 | € 15,70 | 21% |

Niet meegerekend: tijd, autokosten van bezorgen en betaalkosten. Hele partij van 40 zakken: tussen € 63 (alles bij 4+) en € 112 (alles los) brutomarge.

**Emmer 5 kg, € 7,49 incl. = € 6,19 excl.** Kostprijs excl. btw: zout 1/5 zak € 1,17, emmer + deksel incl. verzending (Jerrycanshop) € 3,05 bij 10 stuks of € 2,48 bij 50, etiket ca. € 0,20. Vulwerk niet in geld gerekend.

| Afname emmers | Kostprijs | Marge per emmer | Hoger dan losse zak (€ 2,81)? |
| --- | --- | --- | --- |
| 10 (proef) | € 4,42 | € 1,77 | **nee** |
| 50 | € 3,85 | € 2,34 | **nee** |
| 80+ (staffel € 1,20/st., onbevestigd) | € 2,67 | € 3,52 | ja |

Conclusie: bij € 7,49 en een proef van 10 haalt de emmer voorwaarde 3 niet. De marge per kilo is wel veel hoger (€ 0,35/kg tegenover € 0,11/kg). Nodig voor een marge van € 2,81: ca. **€ 8,75** (bij 10) of **€ 8,06** (bij 50). Er zijn twee routes: een prijs van € 8,49–8,99, of een grotere afname tegen staffelprijs. Dit is een besluit voor Martijn (vraag 1).

## Emmers (onderzoek 22-11-2026, alleen gelezen, niets besteld)

- **Volume:** de stortdichtheid van strooizout is 1,05–1,25 kg/L (productbladen Q-Salt en Carel Lurvink; Compass ca. 1,2). Voor 5,0 kg is dus 4,0–4,8 L nodig. Een nominale 5 L-emmer werkt alleen als het randvolume ruim groter is.
- **Voordeligst en technisch geschikt: Jerrycanshop 5 L rond wit (E-RN-WI-5) + wit deksel (D-WI-RO-5).**
  - Randvolume 5,8 L, dus 72–82% vulgraad. PP, draagvermogen 8,4 kg volgens de shop.
  - Prijs € 1,98 + € 0,50 excl. Verzending € 6,95 incl., gratis vanaf € 100 incl.
  - Kosten per stuk: € 3,05 bij 10, € 2,48 bij 50.
  - De gegevens komen uit zoekresultaten: de site zelf was vanuit deze omgeving niet bereikbaar. Controleer prijzen en specificaties in de winkelwagen.
- **Nipak 3711.1 + klemdeksel:** randvolume onbekend. Het deksel is ‘niet verzegelbaar’ en mogelijk is de minimale afname 25 stuks. Ca. € 5 per stuk (onbevestigd).
- **Plastibac Qubb 5 L** (België, metalen beugel, deksel inbegrepen, € 2,42): reserveoptie. De verzendkosten naar NL zijn onbekend.
- **Etiket:** Avery L7993-25 weerbestendig, 99 × 68 mm, ca. € 0,20 per stuk (pak van 200 voor € 40,08 excl.).
- **Etikettering:**
  - Vermeld ‘Netto 5 kg’ en vul tot ten minste 5,0 kg.
  - Wie zelf afvult, geldt volgens de GPSR waarschijnlijk als fabrikant. Dan horen naam, adres en contact van Denckh plus een partijnummer op de emmer.
  - Controleer het veiligheidsblad van de zoutleverancier (antiklontermiddel).

## Bezorgtarief: voorstel (tarief niet gewijzigd)

Nu kost bezorgen € 0,50 per zak incl., dat is € 0,41 excl. Bij 2 zakken komt dat neer op € 0,83 excl. per adres. De kosten:

- Een losse rit binnen de rondweg is grofweg 4–6 km heen en terug (schatting).
- Per km: € 0,25 (onbelaste vergoeding 2026). De werkelijke autokosten liggen tussen € 0,26 en € 0,55 per km (ANWB, Homefinance).
- Daarbij komt 10–15 minuten laden en dragen van 50–100 kg.
- Een losse rit kost daarmee € 1,25–2,75 aan auto, plus tijd. In een gebundelde ronde van ongeveer 6 adressen is dat ca. € 0,45–0,95 per adres, plus 5–7 minuten.

**Het huidige tarief is verliesgevend**, ook in gebundelde rondes, zodra je je tijd meerekent. Twee mogelijke routes:

- **Voorstel A, zonder codewijziging:** € 1,00 per zak, vanaf 2 zakken. Instellen in *Instellingen › Bezorgen*. Dat is € 2,00 bij 2 zakken en € 4,00 bij 4.
- **Voorstel B, past beter bij ‘meer zakken per bestelling’:** € 2,50 per adres, vanaf 2 zakken, alleen op vaste bezorgrondes. Bij 4 zakken is dat € 0,63 per zak. Hiervoor is een kleine codewijziging nodig: een bezorgmethode ‘per adres’.

Mijn advies is **B**. Beslissing bij Martijn (vraag 2).

## Marketing

- **Materiaal:**
  - `public/strooizout/flyer-a5.pdf`
  - `delen-1080.jpg` (WhatsApp)
  - `delen-1200x630.jpg` (buurt-app, Facebook, linkvoorbeeld)
  - `bord-a4.pdf`
  - deeltekst op `/flyer`
  - De QR-codes zijn gedecodeerd: `https://strooizouthouten.nl` en `/aan-de-weg`.
- **WhatsApp-tekst:** > Hoi buren! Geen aparte rit naar de bouwmarkt: in Houten kun je strooizout bestellen. 25 kg strooizout: 1 zak € 10,49, 2–3 zakken € 9,49, 4 of meer € 8,99 per zak. Samen bestellen is voordeliger. Gratis afhalen in Houten, of laten bezorgen binnen de rondweg (vanaf 2 zakken) voor € 0,50 per zak. Op voorraad vanaf donderdag 26 november; reserveren kan nu. Bestellen: https://strooizouthouten.nl
- **Doelgroepen en kanaal:**
  - **Straten en buurtapps:** één persoon bestelt 4+ voor de straat. Daar zit de grootste aantallen-winst.
  - **Huishoudens met een oprit:** 2–4 zakken.
  - **Kleine ondernemers met een stoep of parkeerplaats** en **VvE’s:** direct benaderen met de flyer.
- **Groepsbestellingen:** geen extra kortingsstaffel ingevoerd. Op 4+ is de marge € 1,57 per zak; verder zakken kost marge zonder dat het volume dat zeker goedmaakt. Een bestelling is maximaal 20 zakken. Grotere aantallen (VvE) liever op aanvraag, eventueel met gratis bezorging op één adres in plaats van korting.

## Eerdere besluiten (blijven gelden)

| Besluit | Verwerkt |
| --- | --- |
| Verkoper overal **Denckh**: Vlierweg 54, Houten · KvK 83176896 · btw NL003791952B15; geen KOR, 21% btw | Voet, voorwaarden, privacyverklaring |
| Bezorgen alleen binnen de rondweg van Houten, instelbaar | Postcodelijst met uitzonderingen; melding buiten het gebied verwijst naar gratis afhalen |
| Voorwaarden kort, Denckh als verkoper, **concept** | Standaardtekst met kopjes |
| Eigen domein strooizouthouten.nl | Korte adressen, www → hoofddomein, canonical, robots/sitemap, QR-codes |

## Vragen en fysieke controles voor Martijn

1. **Emmerprijs/afname:** bij € 7,49 haalt de proef de margevoorwaarde niet. Kies tussen ca. € 8,49–8,99 of een grotere afname. De emmer blijft tot dan op *binnenkort*.
2. **Bezorgtarief:** voorstel A (€ 1,00 per zak) of B (€ 2,50 per adres, codewijziging). Tot dan € 0,50 per zak.
3. **Fysiek met 1–2 emmers, voordat er 10 besteld worden:**
   - vulproef met weegschaal: 5,0 kg erin, en past het deksel dan nog?
   - deksel sluit ook met korrels op de rand, en na herhaald openen;
   - hengsel dragen en schudden met 5 kg;
   - 1–2 weken vocht en klonteren;
   - hechting van het etiket bij kou en nat weer.
4. **Bezorggebied controleren:** 3991–3995 minus 65 postcodes buiten de rondweg (o.a. Doornkade/Duwboot, Essenkade, Hoofdveste, Fortweg, Beusichemseweg). De lijst staat in README › Bezorggebied.
5. **Voorwaarden (concept) akkoord geven.** Bevat 14 dagen bedenktijd (wettelijk bij online verkoop aan consumenten).
6. **Invullen in *Instellingen*:** het afhaaladres (privé) en eventueel een telefoonnummer.
7. **Inkoopprijs € 7,09** bevestigen zodra de factuur er is (*Producten*).
8. **Reservering of koop?** Voor Google Merchant Center (gratis productvermeldingen) moet een bestelling een echte koop zijn. De knop moet dan wettelijk een betalingsverplichting noemen. Zolang het een kosteloos te annuleren reservering blijft: Merchant Center overslaan.
9. **Google-accounts (login Martijn):** Search Console-domein verifiëren via TXT in Cloudflare, de sitemap indienen en indexering aanvragen (stappen in PROMOTIE.md §2). Bedrijfsprofiel: het bestaande Denckh-profiel uitbreiden in plaats van een tweede profiel aan te maken.
11. **Bestelronde openen** in *Beheer › Bestelrondes › Nieuwe ronde* (bijv. ‘Winter 2026’, zonder sluitdatum). Kan ook door een agent, als Martijn schrijfacties op de productiedatabase toestaat. Daarna een testbestelling met fictieve gegevens plaatsen, annuleren en opruimen.
12. **Domein koppelen.** Kan via Claude in Chrome: Workers › `martijndenbesten` › Domains & Routes › Custom domain `strooizouthouten.nl` en `www.strooizouthouten.nl`. Of via een uitrol met de bijgewerkte `wrangler.embedded.jsonc`, waar beide domeinen nu in staan. Werkt het domein, dan de doorverwijzing aanzetten (`STROOIZOUT_DOORVERWIJZEN = "ja"`) en opnieuw uitrollen.
10. **Promotie plaatsen:** de teksten liggen klaar (PROMOTIE.md §7). Niets plaatsen zonder akkoord van Martijn en, bij groepen, de beheerder.

## Gecontroleerd (22-11-2026)

| Controle | Resultaat |
| --- | --- |
| `npm run typecheck` | geslaagd |
| `tests/strooizout.test.ts` | 65/65. Nieuw getest: prijzen 1/2/3/4/10/20 zakken, staffels server-side en in CSV, emmer niet te bestellen, status ‘binnenkort’, voorbestellingen, afvullen (alleen uit vrije ontvangen zakken; emmers boeken niet op zakken af), lagevoorraadwaarschuwing, marge excl. btw |
| `e2e/strooizout.spec.ts` (desktop + mobiel) | 22/22: standaard 2 zakken, 1 → 3 → 4 zakken, bezorgen, emmer ‘Binnenkort’, delen, ‘Strooi bewust’, bestelroutes, beheer, axe |
| Beelden | flyer A5 (past precies op A5), deelbeelden en bord opnieuw gemaakt en bekeken; QR-codes gedecodeerd |
| Homepage | bekeken op iPhone 13 en desktop 1440 px; geen consolefouten |

## Open punten (niet blokkerend)

- **Automatische betaling via QR aan de weg** (Mollie) vraagt een kostenakkoord. Tot die tijd bevestigt de verkoper betaling en uitgifte.
- Cloudflare Access voor `/beheer` (gratis, aanbevolen).

## Volgende stap

Agent: PR #78 mergen, uitrollen (ingebedde variant), productie controleren met een fictieve testbestelling die daarna weer verwijderd wordt, Claude in Chrome laten koppelen en de doorverwijzing van het oude adres aanzetten. Martijn: vragen 1–2 beslissen en de fysieke emmertest (3) doen.
