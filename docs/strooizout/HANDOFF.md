# Strooizout voor de buurt — overdracht

**Status (22-11-2026, 14:45):** **live op https://strooizouthouten.nl**, met geldig certificaat. Uitgerold:

- PR #78 (00471ba) en #79 (326a19a).
- Worker `martijndenbesten` versie `db0dd005-3a21-4f2d-a041-eaa5e8ef8a1d`. Herstelpunten: `0010e146…` en `8f62bf48…`.
- Custom domains: martijndenbesten.com, strooizouthouten.nl en www.strooizouthouten.nl (www stuurt door naar het hoofddomein).
- De bestelronde ‘Winter 2026’ staat open.
- Bezorgen kost € 2,00 per bezorging.

Gecontroleerd op productie:

- home, museum, Bijbelreis en beheer van martijndenbesten.com werken;
- op het eigen domein: webshop, beheer, robots.txt en sitemap; overige paden sturen door naar /;
- de JSON-LD bevat 10.49.

De testbestelling doet Martijn zelf. De doorverwijzing van martijndenbesten.com/strooizout en /zout naar het eigen domein staat aan (PR #81).

Functionaliteit, configuratie en livegangchecklist: [README.md](README.md).

## 10 kg in eigen emmer en met emmer (issue #89, 23-11-2026)

Gebouwd volgens de actuele opdracht in issue #89: de informatie staat online, bestellen kan pas als het er echt ligt. Beschrijving in [README.md](README.md) › *Strooizout per 10 kg*.

- **Op de site:** productkeuze in de bestelkaart (25 kg zak · 10 kg eigen emmer € 5,49 · 10 kg met emmer € 6,49). De twee varianten staan op ‘binnenkort’: prijs en uitleg zichtbaar, geen bestelknop, de server weigert ze.
- **Voorraad:** alleen via *Voorraad › Afvullen uit zakken* (ontvangen, niet-bestelde zakken; 25 kg → 2 × 10 kg + 5 kg los zout dat meetelt bij de volgende keer). Geen voorraad die er niet ligt, geen dubbele verkoop.
- **Ongewijzigd:** 25 kg met staffels, betaalproces, verkoop aan de weg, bestaande bestellingen.
- **Getest:** unit-tests voor omzetting, restzout, voorraadgrenzen, alleen afhalen, gemengde mandjes, annuleren en de bevestigingsmail; schermtests (desktop en telefoon) voor ‘binnenkort’, bestellen na activeren, gemengd mandje en toegankelijkheid.
- **Nog van Martijn nodig voordat een variant actief wordt** (bewust niet automatisch): ontvangst van de zakken bevestigen en afvullen; voor de eigen emmer een weegschaal die geschikt is voor verkoop op gewicht; voor ‘met emmer’ de emmers zelf en hun inkoopprijs. De voorwaarden (nog steeds concept) hebben een alinea over zout in je eigen emmer gekregen.
- **Mail:** de schakelaar `STROOIZOUT_MAIL` staat in deze wijziging weer op ‘uit’, omdat het verzenddomein nog niet is aangemeld. Zodra dat is gebeurd: schakelaar op ‘aan’, uitrollen en één inlogcode als proef.

## Strooizout 2.0: visuele herontwikkeling (opdracht 22-11-2026)

De frontend van de webshop is opnieuw ontworpen; backend, prijzen, voorraad, betaalstatussen en beheer zijn ongewijzigd. Beschrijving in [README.md](README.md) › *Merk en ontwerp*.

| Onderdeel | Uitgevoerd |
| --- | --- |
| Identiteit | Nachtblauw, ijsblauw, wit en amber alleen voor de koopactie; donkere en lichte vlakken wisselen af |
| Logo | Krachtiger merkteken (dak, deur, S-vormige looproute, drie korrels), leesbaar op 16 px; doorgevoerd in site, favicon, flyer, bord, deelbeelden en productillustraties |
| Hero | Donker, met eigen SVG-illustratie van de zak die meegroeit met het aantal en meebeweegt met de muis; vanafprijs en bestelkaart direct in beeld |
| Bestellen | Eén kaart, twee stappen; prijstreden in één rail; grote plus/min; zetje vlak voor een trede; totaal precies één keer; op een iPhone 13 valt ‘Bestellen’ in het eerste scherm |
| Opgelost uit de schermafbeeldingen | Vaste kop schoof over de inhoud (kop staat niet meer vast); ‘AfhalenBezorgen’ plakte aan elkaar; besparingsteksten liepen over; totaal stond dubbel |
| Beweging | Eén samenhangend systeem in CSS met kleine hulpjes; uit bij ‘minder beweging’ |
| Boodschap | ‘Strooi ook bij een buur die dat zelf niet kan.’ met een straat waarin de route van deur tot deur verschijnt |
| Gemeten | Lighthouse mobiel (lokale build): 97 / 100 / 100 / 100; LCP 2,0 s; CLS 0,01; geen horizontale scroll op 320 px |

**Strooiroute (22-11-2026, wens Martijn):** de animatie van het gestrooide paadje is uitgebreid tot een route over de pagina: vanaf de zak in de hero, langs de drie stappen (die oplichten) naar de deur van de buur, waar de ramen één voor één aangaan. Zie README › *Strooiroute*.

**Licht bij de buren en promotiefilmpje (22-11-2026, wens Martijn):** in de straat op de site gaat het licht nu pas aan waar gestrooid is: de route loopt over de stoep langs alle huizen, takt af naar elke voordeur, en dan gaan deur en ramen aan en stijgt er een hartje op. Daarnaast is er een verticaal promotiefilmpje van 17 seconden in dezelfde stijl (`docs/strooizout/film/strooizout-film.mp4`, zie README › *Promotiefilmpje* en PROMOTIE › *Filmpje*). Zonder geluid of muziek; plaatsen doet Martijn zelf.

**Gerichte verbeteringen (22-11-2026, opdracht Martijn):** (1) betalen gaat overal met een betaalverzoek; contant betalen en ‘betalen bij ontvangst’ zijn weg uit de site, het bestelformulier, de statuspagina, aan de weg, de flyer, de conceptvoorwaarden en de keuzes in het beheer; (2) buurtsectie met ‘Een beetje zout. Een beetje aandacht.’ en zwaaiende buren in de deuropening; (3) de drie kaarten van ‘Zo werkt het’ zijn één compacte regel geworden, de mobiele pagina is ruim een vijfde korter; (4) ‘Strooi bewust’ in drie korte regels, zonder ‘een handje per vierkante meter’; (5) klein label ‘Productillustratie’ bij de zak. Het filmpje eindigt nu met buren die meestrooien tot alle paadjes aansluiten, en met de Denckh-signatuur onderaan. De voorwaarden blijven een concept tot Martijn ze goedkeurt; alleen de alinea over betalen is aangepast.

**Lijn weg, straat in een lus (22-11-2026, opdracht Martijn):** de strooilijn die vanaf boven over de pagina liep is helemaal verwijderd. De animatie in de straat loopt nu vanzelf en rustig, van links naar rechts, en begint na een korte pauze opnieuw (alleen zolang hij in beeld is). De tekst in de voet is netjes gezet: links rechts uitgelijnd, de kleine lettertjes in rustige regels en de bedrijfsgegevens op een eigen regel.

**Muziek en tweede filmpje (22-11-2026, opdracht Martijn):** onder het eerste filmpje staat nu een eigen, in code gemaakt deuntje (geen muziek van anderen). Er is een tweede filmpje bijgekomen met fietsers die uitglijden tot er gestrooid is (`strooizout-film-fiets.mp4`). In het eindbeeld van beide staat ‘binnen de rondweg van Houten’. De eerste versie van de muziek vond Martijn te lief; daarna is hij pittiger gemaakt, en op zijn aanwijzing is het getokkelde, sluipende begin van het fietsfilmpje de stijl van alle drie de filmpjes geworden. De maker (AI) kan de muziek zelf niet beluisteren, alleen meten; Martijn beoordeelt of hij bevalt. Zie README › *Promotiefilmpjes* en PROMOTIE › *Filmpjes*.

**Derde filmpje (22-11-2026, opdracht Martijn):** opa met rollator en hondje, een buurjongen die voor hem uit strooit, opa met zijn duim omhoog, en oma met koffie op het bankje (`strooizout-film-opa.mp4`). Stand van de site: PR #86 (lijn weg, straat in een lus, voettekst) staat live als versie `2b90dc5e` en is op productie gecontroleerd.

**Fietsfilmpje op de site (22-11-2026, opdracht Martijn):** het fietsfilmpje staat op de homepage, als lichte versie (0,6 MB) die pas laadt na een tik op de afspeelknop. Let op de uitrolbundel: 9,53 MB van 10 MB; voor nog een film op de site is opslag buiten de bundel nodig (bijvoorbeeld Cloudflare R2; dat is een nieuwe voorziening en vraagt akkoord van Martijn).

**Bestellen, e-mail en inloggen (22-11-2026, opdracht Martijn):** (1) ‘reserveren’ is overal ‘bestellen’ geworden; (2) na een bestelling krijgt de klant een e-mail met de afhaalcode, Martijn stuurt een Tikkie en daarna wordt er opgehaald of bezorgd (geen betaalkeuze meer in het formulier); (3) inloggen op het beheer kan met een code per e-mail, zonder wachtwoord. Het beheeradres staat als geheim in de Worker en nergens in deze openbare repository. Zie README › *E-mail en inloggen op het beheer*. **Mail (23-11-2026):** Martijn gaf akkoord voor Cloudflare Email Service op strooizouthouten.nl (3.000 mails per maand inbegrepen, daarboven $ 0,35 per 1.000). Het geheim `STROOIZOUT_BEHEER_EMAILS` staat op de Worker. Het verzenddomein moet nog in het Cloudflare-account worden aangemeld (dat kan alleen Martijn in het dashboard); tot dan staat `STROOIZOUT_MAIL` op `uit`.

Het productbeeld is een illustratie. Een echte productfoto van de geleverde zak kan later in het beheer worden geüpload (*Producten › Afbeelding*) en vervangt dan de kleine productafbeeldingen; voor de hero is dan een vrijstaande foto nodig.

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

## Bezorgtarief: € 2,00 per bezorging (besluit Martijn 22-11-2026)

Bezorgen kost nu een vast bedrag van **€ 2,00 per bezorging (per adres)**, vanaf 2 zakken en alleen binnen de rondweg. Het aantal zakken maakt niet uit. In de instellingen heet dit ‘Vast bedrag per bezorging’ (`bezorg_methode = per_adres`, `bezorg_per_adres_cent = 200`). Je kunt dit aanpassen in *Instellingen › Bezorgen*.

- Een bezorging levert € 1,65 excl. btw op.
- Zelf rijden binnen de rondweg kost naar schatting € 1,25–2,75 per losse rit (4–6 km × € 0,25–0,55/km), plus 10–15 minuten.
- In gebundelde rondes is dat ongeveer € 0,45–0,95 per adres.
- Conclusie: kostendekkend in rondes, losse ritten blijven krap. Het vaste bedrag moedigt meer zakken per adres aan.

## Marketing

- **Materiaal:**
  - `public/strooizout/flyer-a5.pdf`
  - `delen-1080.jpg` (WhatsApp)
  - `delen-1200x630.jpg` (buurt-app, Facebook, linkvoorbeeld)
  - `bord-a4.pdf`
  - deeltekst op `/flyer`
  - De QR-codes zijn gedecodeerd: `https://strooizouthouten.nl` en `/aan-de-weg`.
- **WhatsApp-tekst:** > Hoi buren! Geen aparte rit naar de bouwmarkt: in Houten kun je strooizout bestellen. 25 kg strooizout: 1 zak € 10,49, 2–3 zakken € 9,49, 4 of meer € 8,99 per zak. Samen bestellen is voordeliger. Gratis afhalen in Houten, of laten bezorgen binnen de rondweg (vanaf 2 zakken) voor € 2,00. Op voorraad vanaf donderdag 26 november; reserveren kan nu. Bestellen: https://strooizouthouten.nl/?via=whatsapp
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
2. ~~Bezorgtarief~~ — besloten: € 2,00 per bezorging (verwerkt).
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
12. ~~Domein koppelen~~ — gedaan op 22-11-2026: strooizouthouten.nl en www gekoppeld; doorverwijzing van het oude adres staat aan (`STROOIZOUT_DOORVERWIJZEN = "ja"`, PR #81).
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
