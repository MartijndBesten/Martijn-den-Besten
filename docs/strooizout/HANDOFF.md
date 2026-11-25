# Strooizout voor de buurt — overdracht

## Wijziging 25-11-2026 — gratis bezorgen vanaf 4 zakken en bestellen als bedrijf (opdracht Martijn)

**Status:** gebouwd en getest op branch `claude/strooizout-zakelijk-gratis`; **nog niet gemerged en niet uitgerold**. Migratie `0009_strooizout_zakelijk.sql` moet vóór de uitrol op productie worden toegepast (zie uitrolstappen hieronder; `d1 migrations apply`).

- **Gratis bezorgen vanaf 4 zakken**, voor iedereen (ook bedrijven; bevestigd door Martijn). Nieuwe instelling `bezorg_gratis_vanaf` (standaard 4, `0` = nooit gratis; aan te passen in *Beheer › Instellingen*). `bereken()` in `shared/strooizout.ts` telt zakken via `zakken_per_stuk` (emmers tellen niet mee); de server rekent altijd zelf na. Teksten aangepast: voorwaarden, bestelkeuze Bezorgen (‘Gratis’), flyer, afrekenen. De productkaart toont bewust geen extra regel (die duwde ‘Bestellen’ uit het eerste scherm op 390×664).
- **Bestellen als bedrijf:** keuze Particulier/Bedrijf in het bestelformulier (kaart en stap 2). Bij Bedrijf: bedrijfsnaam (verplicht), KVK (optioneel, 8 cijfers), btw-nummer (optioneel), de naam wordt ‘Contactpersoon’ en er staat ‘Zakelijke bestellingen leveren we binnen 2 dagen.’ Opslag in `sz_bestelling` (`zakelijk`, `bedrijfsnaam`, `kvk`, `btw_nummer`); particulieren krijgen nooit bedrijfsgegevens opgeslagen. Beheer toont bedrijf, KVK en btw bij de bestelling; CSV heeft drie extra kolommen; de bewaartermijn wist ook de bedrijfsgegevens.
- **Voorwaarden/privacy:** zin over bedrijven (levering binnen 2 dagen, geen consumentenbedenktijd) en over de extra gegevens toegevoegd in de standaardtekst. Is de tekst eerder in het beheer overschreven, dan staat de nieuwe zin daar niet automatisch in.
- **Vinkjes onder ‘Bestellen’:** uitlijning hersteld (vinkje staat direct voor zijn tekst); eerste regel is nu ‘Betalen met betaalverzoek of op factuur’.
- **Inhoudelijk nog te bevestigen door Martijn:** (1) het bezorggebied (rondweg Houten) geldt ook voor bedrijven; (2) ‘op factuur’ betekent nu: Martijn stuurt zelf factuur of betaalverzoek via het beheer, er is geen factuurmodule; (3) of een bedrijf ook een apart factuuradres moet kunnen opgeven.
- **Getest:** unit/API 585 (waaronder nieuw: gratis bezorgen op de grens 3/4 zakken, bedrijfsvalidatie, bedrijfsbestelling opgeslagen, zichtbaar in beheer/CSV); e2e `e2e/strooizout.spec.ts` 38/38 (desktop en mobiel, inclusief axe en de balk/knop op 390×664). **Niet getest:** productie en echte D1; de bedrijfsroute is niet als aparte e2e doorlopen (wel API en validatie).

## Stand 23-11-2026 — zo ga je verder (ook met een ander account)

**Live:** https://strooizouthouten.nl (webshop) en https://martijndenbesten.com (hoofdsite; `/strooizout` en `/zout` sturen 301 door naar het eigen domein). Eén Cloudflare Worker `martijndenbesten` (account `c5472db2163a42a463916a6a525d8353`) bedient beide domeinen plus `www.strooizouthouten.nl`. De actuele versie: `npx wrangler deployments list -c wrangler.embedded.jsonc`; vorige versie terugzetten: `npx wrangler rollback <versie-id> -c wrangler.embedded.jsonc`.

**Belangrijk — mergen is niet uitrollen.** De deploy-job in GitHub Actions wordt overgeslagen (secret `CLOUDFLARE_API_TOKEN` staat niet in GitHub; zie [DEPLOYMENT.md](../DEPLOYMENT.md)). Na elke merge naar `main` rol je zelf uit, vanaf actuele `main`:

```sh
git fetch origin main && git checkout main && git pull --ff-only
npx wrangler deployments list -c wrangler.embedded.jsonc            # herstelpunt noteren
npx wrangler d1 migrations list martijndenbesten --remote -c wrangler.embedded.jsonc   # alleen nieuwe migraties toepassen:
npx wrangler d1 migrations apply martijndenbesten --remote -c wrangler.embedded.jsonc
npm ci && npm run build && node scripts/embed-assets.mjs && npx tsc -p worker/tsconfig.embedded.json --noEmit
npx wrangler deploy -c wrangler.embedded.jsonc                       # gzip-bundel moet onder 10 MB blijven (nu ±9,58 MB)
```

Rooktest daarna: `https://martijndenbesten.com/`, `/api/health`, `/bijbelreis` en `https://strooizouthouten.nl/` geven 200; `https://strooizouthouten.nl/api/strooizout/winkel` geeft `open: true` en `mail: true`. Doe op productie **geen testbestellingen** (Martijn test zelf). In een Claude-cloudsessie voegt de netwerkproxy het Cloudflare-token toe: gebruik `CLOUDFLARE_API_TOKEN=proxy`.

**Stand van de code:** alles staat op `main`; er zijn geen open branches die nog nodig zijn. Migraties op productie: t/m `0007_strooizout_10kg_uit_zakken.sql`.

**Staat alleen in Cloudflare, niet in deze repository** (bewust; de repository is openbaar):

| Wat | Waar | Stand |
| --- | --- | --- |
| Geheimen `ADMIN_TOKEN`, `HASH_SECRET`, `STROOIZOUT_BEHEER_EMAILS` | Worker-secrets | gezet; waarden nooit tonen of committen. `STROOIZOUT_BEHEER_EMAILS` = het beheeradres van Martijn (inloggen met e-mailcode + melding bij elke bestelling) |
| Instellingen `afhaal_adres` = Vlierweg 54, Houten · `contact_telefoon` = 06 11 43 13 81 | D1-tabel `sz_instelling` | gezet 23-11 met akkoord van Martijn (nummer mag openbaar, ook als WhatsApp-link). Overige instellingen: standaardwaarden uit `shared/strooizout.ts`; wijzigen via *Beheer › Instellingen* |
| Bestelronde ‘Winter 2026’ | D1 `sz_ronde` | open |
| Verzenddomein strooizouthouten.nl (Email Sending) | Cloudflare-dashboard | aangezet door Martijn; DNS: 3× MX `cf-bounce`, SPF, DKIM `cf-bounce._domainkey`, DMARC `p=reject`. Het API-token mag e-mailinstellingen niet lezen (fout 10000); controle via DNS |
| Email Routing (ontvangen) | Cloudflare | aan voor lyev.nl en bijbelreis.nl; níét voor strooizouthouten.nl |

**Besluiten van Martijn op 23-11-2026** (gelden ook voor een volgende sessie):

- Knop die de bestelling plaatst: **‘Bestellen met betalingsverplichting’** (art. 6:230v lid 3 BW; HR 4-10-2024). Geen andere knop mag de bestelling plaatsen; een e2e-test bewaakt dit.
- Onder de bestelknop twee losse regels (aangepast op verzoek van Martijn, 23-11 middag): ‘Gratis annuleren zolang je bestelling nog niet is afgehaald of bezorgd.’ en ‘Na ontvangst heb je 14 dagen bedenktijd.’ Voorwaarden over herroeping: **niet meer dan wettelijk nodig** (geen eis ‘ongeopend’, wel aansprakelijkheid voor waardevermindering, terugbrengkosten voor de klant, terugbetaling incl. bezorgkosten binnen 14 dagen, modelformulier).
- Tikkie-proces blijft: bestelling ontstaat bij de klik, betalen via betaalverzoek.
- De bestelkaart **start op 1 zak** (geen voorgekozen staffel, geen oud aantal uit het mandje); het zetje ‘nog 1 erbij’ pas vanaf 2.
- 10 kg eigen emmer (€ 5,49, alleen afhalen) en 10 kg met emmer (€ 6,49) zijn te bestellen; ze putten uit de zakvoorraad.
- Teksten voor de klant: de bevestigingstekst (standaard in `shared/strooizout.ts`, aan te passen in *Beheer › Instellingen*) noemt geen bestelronde meer: ‘Bedankt voor je bestelling. Je krijgt een e-mail met je bevestiging en we sturen je een Tikkie op je mobiel.’ De bestelpagina zegt niet meer dat er geen e-mail wordt gestuurd (aangepast na de proefbestelling van Martijn, 23-11).
- Mail staat aan; de klant ziet als bestelnummer alleen de willekeurige afhaalcode (geen volgnummer); Martijn krijgt bij elke bestelling een melding zonder naam/telefoon van de klant.
- Op lage telefoons (390×664) moet ‘Bestellen’ helemaal in het eerste scherm vallen; e2e-test bewaakt dit.
- Vaste balk onderin (telefoon): alleen zichtbaar als de knop ‘Bestellen’ van de bestelkaart uit beeld is, klein (± 55 px), toont prijs en aantal uit de kaart en opent stap 2; nooit tijdens stap 2. De oude mandjesbalk is weg (het mandje zit in de kop). E2e-test bewaakt dit.

**Gerichte verbeteringen 23-11-2026 (middag, opdracht Martijn):**

- **WhatsApp-knop:** staat nu in de hero, direct onder ‘Hou je buurt veilig.’ (‘Vragen? App ons’, doorschijnend met groen icoon, ondergeschikt aan ‘Bestellen’). Verplaatst vanaf ‘Zo werkt het’, niet dubbel: onderaan de site staat weer een gewone link. Op lage telefoons (hoogte ≤ 700 px) neemt de knop de plek van het prijsbolletje in, zodat ‘Bestellen’ in het eerste scherm blijft (de prijs staat direct eronder in de bestelkaart). E2e-test bewaakt plek, grootte en zichtbaarheid bij 390 × 844, 375 × 667 en 390 × 664.
- **Totaalbedrag:** het vette bedrag in de bestelkaart liep met een telanimatie naar de nieuwe waarde en kon daardoor even een tussenbedrag tonen (€ 20,90 bij € 20,98). Het bedrag staat er nu meteen exact (`Bedrag` in `winkel.tsx`). De gekozen leverwijze zit in het mandje (`mandje.tsx`): mandje en bestelpagina rekenen met dezelfde keuze als de kaart. E2e-test: 2 zakken bezorgd is overal € 20,98.
- **Teksten:** bij het e-mailadres ‘Je ontvangt hier je bestelbevestiging en je afhaalcode.’ (afhalen) of ‘Je ontvangt hier je bestelbevestiging.’ (bezorgen); ‘Zo werkt het’: ‘Bestel online · Ontvang je bevestiging · Haal op met je afhaalcode of laat bezorgen’; productknop ‘10 kg in je eigen emmer’.
- **10 kg met emmer:** het label zegt alleen ‘met emmer’. Dat de emmer herbruikbaar is en een deksel heeft staat wel in de productomschrijving (uit issue #89), maar is niet aan een fysiek product getoetst: Martijn bevestigt dat als de emmers er zijn (aanpassen kan in *Beheer › Producten*).
- **Straat:** de animatie loopt ongeveer een vijfde sneller (`useStraatLus`: 7,5 + half/75 s).

**Werkwijze tests:** een pull request die alleen bestanden met ‘strooizout’ in het pad raakt, draait in de CI alleen `e2e/strooizout.spec.ts` (enkele minuten); al het andere en elke push naar `main` draait de volledige reeks. Na het aanpassen van de frontend eerst `npm run build && node scripts/embed-assets.mjs` doen, anders test de lokale Worker de oude build.

**A6-kaartje (hangkaartje aan emmer of zak én flyer):** besteld door Martijn bij Reclameland op 23-11-2026 (niet door een agent besteld). Ontwerp en bestanden: `docs/strooizout/kaartje/` (`strooizout-kaartje-a6-drukklaar-CMYK.pdf` = aangeleverde drukversie: 111 × 154 mm, 3 mm afloop, CMYK, tekst als contouren, geen rasterbeelden, geen snijtekens; QR naar `https://strooizouthouten.nl/?via=kaartje`, zodat het beheer ziet hoeveel bezoek en bestellingen van het kaartje komen). Opnieuw maken: `node scripts/strooizout/kaartje/maak-kaartje.cjs`, daarna in de map `docs/strooizout/kaartje` `python3 -I ../../../scripts/strooizout/kaartje/maak-cmyk.py` (vereist ghostscript); `controleer.cjs` leest de QR uit de pdf (vereist `npm i --no-save jsqr`). Teksten zijn bewust geen prijs of aanbod, zodat het kaartje niet veroudert.

**Nog open (niet blokkerend):**

- Martijn doet later zelf een testbestelling (zijn bericht 23-11); daarmee zijn de bevestigingsmail (met afhaalblok), de beheermelding en de afhaalcode als bestelnummer pas echt te zien. Na annuleren de testbestelling opruimen in D1 (alle `sz_*`-rijen met dat `bestelling_id`) en controleren dat de voorraad klopt.
- Of de proefmail met inlogcode (23-11, ±08:00 UTC) is aangekomen, kan alleen Martijn bevestigen.
- Afspelen van het fietsfilmpje op een echte iPhone (Safari) is niet getest; de server geeft wel correcte 206-antwoorden.
- Bundel ±9,58 van 10 MB: geen extra film of grote beelden in de bundel; daarvoor is opslag buiten de bundel nodig (nieuwe voorziening → kostenakkoord Martijn).
- Weegschaal geschikt voor verkoop op gewicht (eigen emmer) en inkoopprijs van de emmer: Martijn.

**Eerdere stand (22-11-2026):** PR #78/#79 live, custom domains gekoppeld, doorverwijzing aan (PR #81).

Functionaliteit, configuratie en livegangchecklist: [README.md](README.md).

## 10 kg in eigen emmer en met emmer (issue #89, 23-11-2026)

Beschrijving in [README.md](README.md) › *Strooizout per 10 kg*.

- **Op de site:** productkeuze in de bestelkaart (25 kg zak · 10 kg eigen emmer € 5,49 · 10 kg met emmer € 6,49), **alle drie te bestellen** (besluit Martijn 23-11-2026: ‘10 kg emmers is niet binnenkort. Alles live zetten’). Eerst stonden de varianten op ‘binnenkort’ (PR #90); dat is met migratie 0007 omgezet.
- **Voorraad:** de varianten van 10 kg putten uit de zakvoorraad. Bij een bestelling gaat zo nodig een zak van de zakvoorraad af (25 kg → 2 × 10 kg + 5 kg los zout dat meetelt bij de volgende keer), in dezelfde transactie als de bestelling. Geen dubbele verkoop, geen negatieve voorraad. Uitgeven kan pas na ‘Klaargezet bevestigen’ in het beheer.
- **Ongewijzigd:** 25 kg met staffels, betaalproces, verkoop aan de weg, bestaande bestellingen.
- **Getest:** unit-tests voor toewijzing uit zakken, restzout, de laatste zak (ook gelijktijdig), annuleren, klaargezet en uitgifte, zakken zonder voorraadgrens, vooruit afvullen, alleen afhalen, gemengde mandjes en de bevestigingsmail; schermtests (desktop en telefoon) voor bestellen van 10 kg, gemengd mandje, een variant op ‘binnenkort’ en toegankelijkheid.
- **Aandachtspunten voor Martijn (buiten de software):** eigen emmer is verkoop op gewicht en vraagt een weegschaal die daarvoor geschikt is; ‘met emmer’ vraagt dat de emmers er liggen, en de inkoopprijs van de emmer staat nog leeg. Tijdelijk niet leverbaar: product op ‘verborgen’ of ‘binnenkort’ zetten in *Producten*.
- **Mail:** `STROOIZOUT_MAIL` staat op ‘aan’ nu het verzenddomein is aangemeld (PR #92, samen met de filmpjes zonder hoeveelheid).

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

**Bestellen, e-mail en inloggen (22-11-2026, opdracht Martijn):** (1) ‘reserveren’ is overal ‘bestellen’ geworden; (2) na een bestelling krijgt de klant een e-mail met de afhaalcode, Martijn stuurt een Tikkie en daarna wordt er opgehaald of bezorgd (geen betaalkeuze meer in het formulier); (3) inloggen op het beheer kan met een code per e-mail, zonder wachtwoord. Het beheeradres staat als geheim in de Worker en nergens in deze openbare repository. Zie README › *E-mail en inloggen op het beheer*. **Mail (23-11-2026):** Martijn gaf akkoord voor Cloudflare Email Service op strooizouthouten.nl (3.000 mails per maand inbegrepen, daarboven $ 0,35 per 1.000). Het geheim `STROOIZOUT_BEHEER_EMAILS` staat op de Worker. Martijn heeft het verzenddomein in het Cloudflare-dashboard aangemeld; `STROOIZOUT_MAIL` staat daarom op `aan`.

Het productbeeld is een illustratie. Een echte productfoto van de geleverde zak kan later in het beheer worden geüpload (*Producten › Afbeelding*) en vervangt dan de kleine productafbeeldingen; voor de hero is dan een vrijstaande foto nodig.

## Commerciële versie (opdracht 22-11-2026)

| Onderdeel | Uitgevoerd |
| --- | --- |
| Prijzen 25 kg | 1 zak € 9,99 (sinds 23-11-2026, besluit Martijn; was € 10,49) · 2–3 zakken € 9,49 · 4 of meer € 8,99 per zak, voor alle zakken zodra de drempel is bereikt. Server rekent (twee aanbiedingen in `sz_aanbieding`); opgeslagen per bestelregel met normaalprijs en korting |
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
| Product/Offer (schema.org) | De Worker zet de JSON-LD in de homepage op het eigen domein, met de actuele prijs, staffels (9,99 / 9,49 / 8,99), beschikbaarheid (PreOrder met datum, InStock na ontvangst), verkoper Denckh en retourbeleid. ‘Binnenkort’-producten staan er niet in |
| Open Graph / WhatsApp-voorbeeld | `delen-1200x630.jpg` (75 kB), met titel, beschrijving en alt-tekst |
| Google-verificatie | *Instellingen › Google-verificatiecode*: de site zet de meta-tag zelf, zonder uitrol |
| Search Console / Merchant Center / Bedrijfsprofiel | Hiervoor is de Google-login van Martijn nodig. Merchant Center vraagt eerst een besluit over ‘reservering of koop’. Een tweede Bedrijfsprofiel wordt afgeraden (PROMOTIE.md §3–4) |
| Meting | Cookieloze bezoektelling: per bezoeker per pagina per dag één rij, met een dagelijks wisselende HMAC-code, zonder IP of user-agent. Er wordt gekeken naar herkomst, bron (`?via=` in QR-codes en deellinks), bestellingen met bron, conversie, gemiddeld aantal zakken en bundelverdeling. Te vinden in *Beheer › Overzicht › Bezoek en verkoop*. Privacyverklaring bijgewerkt; de gegevens worden na 400 dagen gewist |

## Marge per product en staffel (exclusief btw)

Inkoop zak € 7,09 incl. = **€ 5,86 excl.** Btw 21% op verkoop en inkoop (voorbelasting).

| Aantal | Prijs incl. | Prijs excl. | Marge per zak | Marge per bestelling | Marge % |
| --- | --- | --- | --- | --- | --- |
| 1 zak | € 9,99 | € 8,26 | € 2,40 | € 2,40 | 29% |
| 2 zakken | € 9,49 | € 7,84 | € 1,98 | € 3,96 | 25% |
| 3 zakken | € 9,49 | € 7,84 | € 1,98 | € 5,94 | 25% |
| 4 zakken | € 8,99 | € 7,43 | € 1,57 | € 6,28 | 21% |
| 10 zakken | € 8,99 | € 7,43 | € 1,57 | € 15,70 | 21% |

Niet meegerekend: tijd, autokosten van bezorgen en betaalkosten. Hele partij van 40 zakken: tussen € 63 (alles bij 4+) en € 96 (alles los) brutomarge.

**Werkelijke inkoop (bestelling 23-11-2026, bedragen van Martijn):** 40 × Strooizout 25 kg à € 7,61 excl. = € 304,40, minus € 70,00 korting (1000–1399 kg) plus palletkap € 1,25; verzending € 0,00; btw € 49,48; totaal **€ 285,13 incl. btw** (± € 7,13 per zak incl. btw, palletkap meegerekend). In het beheer bij ronde ‘Winter 2026’ vastgelegd als factuurbedrag (€ 285,13) met een inkoopregel van 40 × € 7,09; de inkoopprijs per zak bij het product (€ 7,09) is ongewijzigd.

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
- **WhatsApp-tekst:** > Hoi buren! Geen aparte rit naar de bouwmarkt: in Houten kun je strooizout bestellen. 25 kg strooizout: 1 zak € 9,99, 2–3 zakken € 9,49, 4 of meer € 8,99 per zak. Samen bestellen is voordeliger. Gratis afhalen in Houten, of laten bezorgen binnen de rondweg (vanaf 2 zakken) voor € 2,00. Op voorraad vanaf donderdag 26 november; reserveren kan nu. Bestellen: https://strooizouthouten.nl/?via=whatsapp
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
5. **Voorwaarden (concept) akkoord geven.** Bevat 14 dagen bedenktijd volgens de wet (art. 6:230o e.v. BW), met modelformulier; annuleren vóór afhalen of bezorgen is gratis (besluit Martijn 23-11-2026: niet meer dan wettelijk nodig).
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
