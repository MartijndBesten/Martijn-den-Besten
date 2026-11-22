# Strooizout voor de buurt

> **Hou je buurt veilig.** Een initiatief van Denckh. Mini-webshop voor inwoners van Houten op **https://strooizouthouten.nl** (beheer: **/beheer**). Zelfde Worker; intern staan de pagina's onder `/strooizout`, en `martijndenbesten.com/strooizout` blijft werken of verwijst door (zie *Eigen domein*).

Zelfde Worker, zelfde D1-database en zelfde uitrolroute als de rest van martijndenbesten.com. Geen aparte hosting, geen betaalde diensten, geen externe scripts of CDN's.

## Afspraken (bijgewerkt 22-11-2026, commerciële versie)

| Onderwerp | Afspraak | Waar ingesteld |
| --- | --- | --- |
| Prijs 25 kg | 1 zak € 10,49 · 2–3 zakken € 9,49 · 4 of meer € 8,99 per zak, voor alle zakken zodra de drempel is bereikt; incl. 21% btw | Producten › Strooizout › Staffelkorting (twee aanbiedingen: vanaf 2 en vanaf 4) |
| Inkoop 25 kg | € 7,09 per zak incl. btw (voorlopig) | Producten › Inkoopprijs incl. btw |
| Emmer 5 kg | € 7,49 richtprijs; status *binnenkort*: zichtbaar, niet te bestellen | Producten › status; Voorraad › Emmers afvullen |
| Lage voorraad | waarschuwing in het overzicht bij 10 of minder te reserveren | Instellingen › Webshop |
| Btw | 21% inclusief, ook over bezorgkosten; geen KOR | Instellingen › Betalen › Btw |
| Afhalen | gratis, in Houten; volledig adres pas na bevestiging | Instellingen › Ophalen |
| Bezorgen | vanaf 2 zakken, € 2,00 per bezorging (vast bedrag per adres, besluit Martijn 22-11), alleen binnen de rondweg van Houten (postcodelijst, zie *Bezorggebied*) | Instellingen › Bezorgen |
| Voorraad | 40 zakken verwacht, reserveren vooraf (gemarkeerd als *voorbestelling*); uitgeven pas na ontvangst | Voorraad |
| Beschikbaar | ‘Op voorraad vanaf donderdag 26 november’ tot er iets ontvangen is | Instellingen › Webshop |
| Verkoper | Denckh · Vlierweg 54, Houten · KvK 83176896 · btw NL003791952B15 · info@denckh.nl (zoals gepubliceerd op denckh.nl) | Instellingen › Verkoper |

## Commerciële opzet

- **Kernboodschap:** ‘Strooizout uit je eigen buurt.’ Pay-off: ‘Hou je buurt veilig. Strooi bewust.’ Ondertitel: ‘Geen aparte rit naar de bouwmarkt. Bestel samen met je buren en houd je stoep veilig.’
- **Bestelkaart:** drie keuzes (1 zak, 2 zakken ‘Voordelige keuze’, 4 zakken ‘Extra voordeel’) met totaal en besparing ten opzichte van losse zakken; standaard 2 zakken; ieder ander aantal via de stepper. Geen ‘meest gekozen’ zolang er geen verkoopcijfers zijn.
- **Subtiel:** ‘Neem er eentje mee voor je buren.’ onder de knop; ‘Deel met je buren’ (deelmenu van de telefoon, anders WhatsApp).
- **Strooi bewust:** eerst sneeuw ruimen, dan alleen strooien waar nodig, dun strooien; te veel zout schaadt planten, bomen, bodem, slootwater en materialen; bij strenge vorst werkt zout minder; hondenpoten afspoelen. Geen absolute milieuclaims.
- **Emmer 5 kg:** klein aanvullend product onder de bestelkaart, label *Binnenkort*. Pas op *actief* zetten na de vier voorwaarden in HANDOFF.md.
- **Marge** in het beheer exclusief btw (omzet en inkoop allebei zonder btw; Denckh is btw-plichtig, dus inkoop-btw is voorbelasting).
- **Voorbestelling:** een bestelling die is geplaatst terwijl de voorraad nog niet (genoeg) ontvangen was, krijgt in het beheer het label *voorbestelling*.
- **Emmers afvullen** (*Voorraad*): ‘N emmers uit M zakken’. De zakken gaan van ontvangen, verwacht en te reserveren af (alleen uit vrije, ontvangen zakken); de emmers komen erbij als ontvangen voorraad. Een emmer bestellen trekt niets van de zakken af. Losse rest wordt gelogd, niet als voorraad geteld.

## Merk en ontwerp (versie 2, 22-11-2026)

**Logo.** Dak en voordeur met een veilige looproute in de vorm van een S (van Strooizout) en drie strooikorrels. Dik getekend, zodat het ook als favicon van 16 px leesbaar blijft. Bestanden in `public/strooizout/logo/`: `merk.svg`, `merk-op-donker.svg`, `logo-licht.svg/png`, `logo-donker.svg/png`; favicon `icoon.svg`, `icoon-180.png`, `icoon-512.png`. In React: `Merkteken` en `Logo` in `src/strooizout/iconen.tsx`. Het teken staat ook op de zak in de illustraties, de flyer, het bord en de deelbeelden.

**Kleur.** Diep nachtblauw (`#05142a` → `#0b2340`), helder ijsblauw (`#9fd4f7`, `#cfe6f6`), wit, en warm amber (`#ffb547`) alleen voor de koopactie en de strooikorrels. Donkere vlakken (hero, buurtboodschap) wisselen af met lichte (uitleg, bewust strooien, voet). Lettertype Geist.

**Homepage** (`src/strooizout/winkel.tsx`, stijlen in `winter.css`):

- Donkere hero met ‘Strooizout uit je eigen buurt.’, ‘Hou je buurt veilig.’ en de vanafprijs. De kop staat niet vast en schuift dus nooit over de inhoud.
- Productbeeld (`scene.tsx`): eigen SVG-illustratie van de zak op een winterse ondergrond met de gestrooide route uit het logo. De stapel groeit mee met het gekozen aantal (tot 4 zichtbaar) en kantelt licht mee met de muis. Het is een illustratie, geen foto van de geleverde verpakking; dat staat in de voet.
- Eén bestelkaart in twee stappen. Stap 1: prijstreden in één rail (1 zak · 2–3 · 4 of meer), grote plus- en minknop, afhalen of bezorgen, totaal en ‘Bestellen’. Eén zak onder een trede verschijnt een zetje (‘Nog 1 zak erbij en je betaalt € 8,99 per zak’). Stap 2 klapt uit in dezelfde kaart: naam en mobiel nummer (adres alleen bij bezorgen; e-mail en opmerking achter één link). Het totaal staat er altijd precies één keer, direct boven de actieknop.
- Daaronder: één compacte regel ‘Zo werkt het’ (Bestel online · Ontvang je afhaalcode · Haal op of laat bezorgen), de buurtboodschap ‘Een beetje zout. Een beetje aandacht.’ met de ondertekst ‘Strooi ook bij een buur die dat zelf niet kan. En zwaai eens naar elkaar!’ en de straat (met buren die in de deuropening zwaaien), en ‘Strooi bewust’ in drie korte regels. Bij de zak in de hero staat klein ‘Productillustratie’.
- **Betalen** gaat altijd met een betaalverzoek (Tikkie): vooraf op de mobiel, of ter plekke bij afhalen, bezorgen of aan de weg. Contant betalen wordt nergens aangeboden; in het beheer is ‘contant’ ook geen keuze meer bij het registreren van een betaling (de server accepteert de waarde nog wel, voor oude registraties). Betaald wordt een bestelling alleen door een handmatige registratie.

**Straat die vanzelf afspeelt** (`scene.tsx › Straat` en `useStraatLus`): in de buurtsectie loopt de strooiroute rustig over het trottoir langs de huizen. Bij elk huis takt een paadje af naar de voordeur; zodra daar gestrooid is, gaat in dat huis het licht aan (deur, ramen, in een paar deuropeningen een buur die zwaait, en een hartje dat opstijgt). Daarna blijft het eindbeeld vijf seconden staan, dooft uit en begint opnieuw. Alles hangt aan de CSS-variabelen `--straat` (voortgang) en `--aan` (uitdoven) op de tekening; het script zet die alleen zolang de straat in beeld is. Zonder script of bij ‘minder beweging’ staat het eindbeeld er. De eerdere lijn die bij het scrollen vanaf de hero over de pagina liep (`tocht.tsx`) is op verzoek van Martijn verwijderd (22-11-2026).

**Beweging** (`beweging.ts` + CSS, geen animatiebibliotheek): opkomst van de hero, verende schuifjes in de rail en de afhaal/bezorgkeuze, een bedrag dat naar zijn nieuwe waarde loopt, een korte glans bij de beste prijs, onderdelen die in beeld komen bij scrollen, en een vink die zichzelf tekent na een geslaagde bestelling. Alleen `transform` en `opacity`; niets blokkeert een klik. Bij ‘minder beweging’ staat alles uit.

**Gemeten** (lokale build, Lighthouse mobiel): Performance 97, Accessibility 100, Best practices 100, SEO 100; LCP 2,0 s, CLS 0,01, blokkeertijd 150 ms. Geen externe scripts of lettertypen.

In de voet ‘Een initiatief van’ met de officiële Denckh-signatuur (`/bijbelreis/denckh-logo-signature.svg`, donkere variant op lichte voet; niet nagetekend).

## Promotiefilmpjes

Drie verticale filmpjes (1080 × 1920, H.264 met AAC-geluid) in de stijl van de site, in `docs/strooizout/film/`:

- `strooizout-film.mp4` (18,5 s): gladde stoep → de zak strooit je eigen stoep → ook bij de buren, waar het licht aangaat en de buur zwaait → meer buren komen met hun eigen zak naar buiten en alle paadjes sluiten op elkaar aan (‘Een beetje zout. Een beetje aandacht.’) → eindbeeld.
- `strooizout-film-fiets.mp4` (18 s): ‘Glad op de fiets?’ twee fietsers glijden uit op het gladde fietspad → ‘Even strooien…’ de zak strooit het pad, de fietsers stappen weer op → ‘…en iedereen blijft overeind.’ fietsers rijden veilig langs, met een fietsbel en zwaaiende buren → eindbeeld, waar het verkeer over het fietspad blijft rijden.
- `strooizout-film-opa.mp4` (18 s): ‘Glad? Dan blijft opa liever binnen.’ opa met rollator en hondje durft het gladde pad niet op (de rollator schiet weg, het hondje glijdt uit) → ‘Tenzij iemand even strooit…’ een buurjongen komt aangerend en strooit voor hem uit; opa loopt erachteraan met zijn duim omhoog → ‘…dan komt opa gewoon op de koffie.’ bij het bankje zit oma met koffie te zwaaien → eindbeeld.

Het eindbeeld is in alle drie hetzelfde: merk, zak van 25 kg, `strooizouthouten.nl`, ‘Afhalen of bezorgd binnen de rondweg van Houten’ en ‘Een initiatief van’ met de Denckh-signatuur (donkere variant op een licht vlak). Geen prijzen in beeld, zodat de filmpjes bruikbaar blijven als de prijs wijzigt.

**Muziek:** een eigen, speels getokkeld deuntje (pizzicato): een wandelende getokkelde bas, tokkels tegen de tel in en een getokkelde melodie met hier en daar een klokje, op een lichte beat met sleebellen. Het begin is sluipend en in mineur (het is glad), met een glijfluitje en een plof bij een val; zodra er gestrooid wordt gaat hetzelfde getokkel door in majeur. In code gemaakt in `scripts/strooizout/film/muziek.cjs`: geen opname en geen muziek van anderen, dus geen licentie nodig. Elk filmpje heeft een eigen arrangement dat op het beeld is afgestemd. Verloop: de eerste versie (klokjes, rustig) vond Martijn te lief, de tweede (beat en synth) had pit, en het sluipende begin van het fietsfilmpje vond hij het leukst; dat is nu de stijl van alle drie.

**Bron en maken:** `scripts/strooizout/film/film.html`, `fiets.html` en `opa.html` (SVG en HTML; `window.teken(t)` tekent het beeld op tijdstip t), de zak uit `film/zak.svg` (zelfde tekening als in `scene.tsx`). De straat, de lucht, de teksten en het eindbeeld staan in alle drie de pagina's (bewust overgenomen, zodat elke film los te openen is; bij een vierde film is het de moeite waard dat gedeelde stuk eruit te halen). Opnieuw maken: `node scripts/strooizout/maak-film.cjs buurt`, `fiets` of `opa` (Chromium legt elk beeld vast, ffmpeg maakt de mp4 met de muziek). Losse beelden bekijken: `… fiets --stil 2,6.5,14 <map>`. Alleen de muziek vervangen: `… buurt --muziek`. De volledige films staan bewust niet in `public/`: die map gaat mee in de uitrolbundel (grens 10 MB).

**Fietsfilmpje op de site:** op de homepage staat tussen de buurtsectie en ‘Strooi bewust’ het fietsfilmpje (`winkel.tsx › Film`). Eerst is er alleen een startbeeld met een afspeelknop; de video laadt pas na een tik en speelt dan in de pagina (met bediening, geluid aan). Daarvoor is er een lichte versie: `public/strooizout/film/fiets.mp4` (540 × 960, 24 beelden per seconde, minder sneeuw, ongeveer 0,6 MB) met startbeeld `fiets.webp`, te maken met `node scripts/strooizout/maak-film.cjs fiets --web`. De uitrolbundel is daarmee 9,53 MB van de 10 MB (gzip; er is nog ruim 0,7 MB over): een tweede film past er op deze manier niet bij. De Worker die de site zelf serveert beantwoordt deelverzoeken (`Range`, `worker/bereik.ts`); zonder dat speelt een video op een iPhone niet af.

## Voorraad: vier begrippen

- **Verwacht** (`voorraad_verwacht`): totaal ingekocht of onderweg. Klanten kunnen tot dit aantal reserveren.
- **Ontvangen** (`voorraad_ontvangen`): werkelijk binnen. Bevestigen in *Voorraad › Ontvangst bevestigen*.
- **Gereserveerd**: alle niet-geannuleerde bestellingen (`sz_voorraad_mutatie`).
- **Beschikbaar** (`voorraad`) = verwacht − gereserveerd; kan nooit onder nul (`CHECK`), ook niet bij gelijktijdige bestellingen.

Uitgeven (afhalen, bezorgen) en ‘klaar zetten’ kan alleen als er genoeg ontvangen voorraad ligt (ontvangen − uitgegeven). De verwachting kan niet lager dan wat al gereserveerd is; ontvangen niet lager dan wat al uitgegeven is. Meer ontvangen dan verwacht verhoogt de verwachting automatisch.

## Verkoop aan de weg

- **Bord** (`bord-a4.pdf`, A4): logo, ‘Strooizout — 25 kg’, prijs, staffel en een QR-code naar `/strooizout/aan-de-weg`.
- **Route**: aantal kiezen → mobiel nummer → code (bijv. H-4827) met het bedrag. Kanaal `straat`, altijd ophalen, geen bestelronde nodig, maar alleen uit ontvangen voorraad.
- **Uitgifte**: de verkoper zoekt de code in *Afhalen* en kiest ‘ontvangen en uitgeven’: betaling en uitgifte in één transactie, nooit twee keer.
- **Zonder QR**: *Voorraad › Straatverkoop registreren* (aantal + betaalverzoek betaald/pin/nog niet betaald), idempotent.
- **Geen zelfbediening**: er is geen betaalprovider die een betaling betrouwbaar bevestigt. De QR-route geeft dus nooit zelf zakken vrij en zegt nooit ‘betaald’. Laat het bord alleen staan als er iemand bij de zakken is.

**Open punt: automatische QR-betaling.** Betalen-en-meenemen zonder toezicht kan pas met een betaalprovider die per transactie een bevestiging (webhook) geeft, op een zakelijke rekening van Denckh. Bijvoorbeeld Mollie (iDEAL); de tabel `sz_betaling` heeft al `provider`/`provider_ref`. Daarvoor zijn nodig:

- een account en kostenakkoord (transactiekosten);
- een secret met de API-sleutel;
- een betaalpagina die het juiste totaal aanmaakt;
- een webhook die de status bij de provider opvraagt en pas dan ‘betaald’ registreert en de voorraad afboekt.

Een vaste betaal-QR met één bedrag is bewust níet gebruikt: dan kloppen bedragen niet en zijn betalingen niet aan een transactie te koppelen.

## Wat het doet

| Onderdeel | Adres | Toelichting |
| --- | --- | --- |
| Webshop | `/strooizout` | Eén bestelkaart: prijs, staffel, beschikbaarheid, aantal, afhalen/bezorgen, totaal en ‘Bestellen’; daarna naam, mobiel nummer (en adres bij bezorgen) op dezelfde pagina |
| Aan de weg | `/strooizout/aan-de-weg` | QR-route van het bord (zie hierboven) |
| Bestellen | `/strooizout/bestellen` | Eén scherm: aantallen (met staffelhint) → ophalen of bezorgen (adres alleen bij bezorgen, + moment) → naam en mobiel nummer (e-mail optioneel) → betalen → controleregel en ‘Reservering plaatsen’. Op de telefoon een vaste balk met het totaal |
| Bevestiging en bestelpagina | `/strooizout/bestelling#<link>` | Grote **afhaalcode** (bijv. H-4827) met kopiëren, delen en ‘stuur naar mezelf’; status, details, afhaaladres **pas na bevestiging**, annuleren. De persoonlijke link (HMAC) staat in het fragment en gaat niet naar server of statistiek |
| Privacy en voorwaarden | `/strooizout/privacy`, `/strooizout/voorwaarden` | Voorwaarden zijn in het beheer aan te passen |
| Flyer en deelbeelden | `/strooizout/flyer` | A5-flyer (afdrukken), deelbeelden, WhatsApp-tekst; prijzen live uit de webshop |
| Korte link | `/zout` | 301 naar `/strooizout` (met doorverwijzing aan: naar strooizouthouten.nl) |
| Beheer | `/strooizout/beheer` | Overzicht, **afhalen (uitgifte op code)**, bestellingen, bezorgroute, producten, bestelrondes, financiën, instellingen, flyer en delen |

Statische bestanden in `public/strooizout/`: `flyer-a5.pdf`, `bord-a4.pdf` (verkoop aan de weg), `delen-1080.jpg` (WhatsApp), `delen-1200x630.jpg` (buurt-app en linkvoorvertoning), logo's in `logo/`, productillustraties in `beeld/`. Alle QR-adressen staan op één plek: `src/strooizout/qr.tsx` (`DOMEIN` = `https://strooizouthouten.nl`; bord: `/aan-de-weg`). Na een wijziging `node scripts/strooizout/maak-flyer.cjs` opnieuw draaien tegen een lokale server waarin het product nog niet ontvangen is (dan staat ‘Op voorraad vanaf …’ op de beelden).

## Werking in het kort

- **Bestelrondes.** Bestellen kan alleen als er een ronde *open* staat en de sluitdatum niet voorbij is (én de webshop niet tijdelijk gesloten is). Na de migratie staat er **geen** ronde open: de webshop is dus dicht tot de beheerder een ronde start.
- **Reservering, geen betaling.** Een bestelling is een reservering. Betalen bij afhalen/bezorgen of via een handmatige Tikkie; de beheerder registreert betalingen (verplicht vinkje ‘echt ontvangen’). Geen bankgegevens of betaalgeheimen.
- **Gelijktijdigheid.** Ook een moment met een maximum kan niet overboekt raken: de bestelling wordt alleen ingevoegd als er binnen dezelfde transactie nog plek is. Een productwijziging in het beheer overschrijft de live voorraad niet (alleen bij een bewuste voorraadwijziging, en alleen als de stand niet intussen door bestellingen is veranderd; anders een melding). Momenten tellen in Nederlandse tijd en verdwijnen zodra ze voorbij zijn.
- **Server rekent.** De browser stuurt alleen product-ID's en aantallen. Prijs, aanbiedingen, bezorgkosten, voorraad en bezorggebied worden op de server opnieuw bepaald (`shared/strooizout.ts` › `bereken`, `worker/strooizout.ts`).
- **Eén transactie.** Bestelling, regels, voorraadmutaties en logregel in één D1-batch. Voorraad kan nooit onder nul (`CHECK`), ook niet bij gelijktijdige bestellingen. Annuleren geeft voorraad precies één keer terug (B70-recept).
- **Geen dubbele bestellingen.** Elke bestelsessie heeft een idempotentiesleutel (`UNIQUE`); dubbel klikken of opnieuw versturen geeft dezelfde bestelling terug. De knop is ook uitgeschakeld tijdens het versturen.
- **Spam en misbruik.** Alleen vanaf de eigen site (Origin), verborgen veld, minimale invultijd, max. 8 kB per verzoek, begrenzing per (gehasht) IP: 80 pogingen/uur, 20 bestellingen/uur en 60/dag (ruim, omdat buren op mobiel internet vaak één IP-adres delen). Beheer: na 20 mislukte inlogpogingen per uur geblokkeerd.
- **Combinatiepakketten en aanbiedingen zonder programmeren.** Een product met onderdelen is een pakket (voorraad, inkoop, gewicht en bezorgkosten volgen uit de onderdelen). Aanbiedingen: actieprijs per stuk, optioneel vanaf een aantal (staffel) en binnen een periode; de laagste geldige prijs telt.
- **Bezorgen.** Aan/uit, bezorggebied (postcodelijst, zie hieronder), tarief vast per bezorging (standaard € 2,00), per stuk (per product aan te passen) of per kg, meerdere bezorg- en ophaalmomenten met optioneel maximum. Route per wijk/postcode met Google Maps-routelinks (max. 10 adressen per link), Apple Kaarten en Waze per adres, afdrukbare lijst. Geen betaalde route-API.
- **Klantgegevens.** Naam en een **Nederlands mobiel nummer** zijn verplicht (06…, +31 6…, 0031 6…, +31 (0)6…; opgeslagen als 06xxxxxxxx). E-mail is optioneel. Adres (straat, huisnummer, postcode) alleen bij bezorgen, en alleen binnen het ingestelde bezorggebied (te controleren met de postcodecheck in *Instellingen*). Daarbuiten: ‘We bezorgen alleen binnen de rondweg van Houten. Op deze postcode kan dat helaas niet, maar je kunt je bestelling wel gratis afhalen.’
- **Afhaalcode.** Elke bestelling krijgt automatisch een korte code `H-` + 4 cijfers (bij drukte 5). Willekeurig; de `UNIQUE`-index bewaakt botsingen en bij een botsing wordt in dezelfde aanvraag een nieuwe code gekozen (getest met 25 gelijktijdige bestellingen en een geforceerde botsing). De code is **geen sleutel**: publiek opent hij niets; alleen de ingelogde beheerder kan erop zoeken. Na de bewaartermijn wordt de code gewist (en weer vrij).
- **Afhalen/uitgifte.** Tabblad *Afhalen*: code intikken (met of zonder `H-`) → direct aantal zakken, betaalstatus en afhaalstatus. ‘Ontvangen en uitgeven’ registreert de betaling en zet de status in één transactie; een tweede uitgifte (ook gelijktijdig vanaf een andere telefoon) wordt geweigerd met ‘al uitgegeven op …’, en een betaling wordt alleen geboekt als déze uitgifte slaagde.
- **Betaalstatussen.** Openstaand → betaalverzoek verstuurd → betaald → terugbetaald. ‘Verstuurd’ zet de beheerder zelf na het maken van een Tikkie (knoppen om mobiel nummer en openstaand bedrag te kopiëren). ‘Betaald’ en ‘terugbetaald’ volgen uitsluitend uit geregistreerde betalingen met het vinkje ‘echt ontvangen/terugbetaald’; deels betaald blijft openstaand.
- **Staffelkorting.** Standaard: 1 zak € 10,49, 2–3 zakken € 9,49, vanaf 4 zakken € 8,99 per zak voor **alle** zakken (twee aanbiedingen). De bestelkaart toont de keuzes 1/2/4 met besparing, daarna de oorspronkelijke prijs, de korting en het nieuwe totaal. Bezorgkosten blijven apart (€ 2,00 per bezorging). Instelbaar per product in *Producten › Bewerken › Staffelkorting en aanbiedingen* (grens, prijs, optioneel periode). De server rekent opnieuw; per bestelregel worden stukprijs, normale prijs en naam van de korting opgeslagen, per bestelling het kortingsbedrag. *Financiën* en de administratie-export tonen normale prijs, korting en omzet apart.
- **Contact zonder automatische mail.** Er wordt geen e-mail verstuurd. De klant krijgt direct een bevestiging met persoonlijke link; de beheerder kan per bestelling een WhatsApp- of mailbericht met die link openen en zelf versturen.

## Privacy

- Alleen naam, e-mail, telefoon, (bij bezorgen) adres en een optionele opmerking.
- Persoonsgegevens (naam, mobiel nummer, e-mail, adres, opmerkingen, afhaalcode) worden **na de bewaartermijn** gewist: standaard 6 maanden na afgehaald/bezorgd/geannuleerd. Een bestelling die 12 maanden onaangeroerd openstaat, wordt eerst geannuleerd (voorraad terug) en daarna gewist. Bedragen, aantallen en het postcodegebied blijven voor de administratie. Dit draait **dagelijks om 03:17 UTC** (cron-trigger in `wrangler.jsonc`/`wrangler.embedded.jsonc`, gratis), en daarnaast bij het openen van het beheeroverzicht of met *Instellingen › Nu opschonen*.
- Geen persoonsgegevens in logs: het logboek bevat alleen acties en bedragen; foutmeldingen bevatten geen invoer. Getest in `tests/strooizout.test.ts`.
- Het volledige afhaaladres staat alleen in de instellingen en is pas zichtbaar op de bestelpagina van een klant nadat de beheerder de bestelling heeft bevestigd.
- Het mandje staat in de browser (localStorage), het beheertoken alleen in de sessie (sessionStorage).

## Bezorggebied: binnen de rondweg

Instelling *Bezorgen › Bezorggebied* (`bezorg_postcodes`). Per regel: `3991` = heel postcodegebied, `3991 AB` (of `3991 AB AC`) = losse postcodes, een regel die begint met `niet:` sluit uit. Uitzonderingen gaan voor. Standaard:

```
3991, 3992, 3993, 3994, 3995
niet: 3991 CD CE CG … (27 postcodes, o.a. Duwboot, Draaibrug, Veerwagenweg)
niet: 3992 AA AB … (27 postcodes, o.a. Essenkade, Hoofdveste, Fortweg)
niet: 3994 AD AE … (11 postcodes, o.a. Handboog, Rietdijk, Beusichemseweg)
```

Afgeleid op 22-11-2026 uit PDOK Locatieserver: de geometrie van de weg ‘Rondweg, Houten’ en het middelpunt van alle 1072 postcodes in Houten; 1007 liggen binnen de rondweg, 65 erbuiten (die staan op de `niet:`-regels). Beperkingen: een postcode die precies over de rondweg loopt, telt volgens zijn middelpunt; nieuwe postcodes in 3991–3995 vallen automatisch binnen het gebied. Het beheer toont bij elke bezorgbestelling het adres, dus een twijfelgeval zie je vóór het bezorgen. Volledige lijst: `shared/strooizout.ts` › `STANDAARD_INSTELLINGEN.bezorg_postcodes`.

## Eigen domein strooizouthouten.nl

`worker/strooizout-domein.ts` (in beide Worker-ingangen):

- `strooizouthouten.nl/` → webshop; `/beheer`, `/aan-de-weg`, `/bestelling`, `/privacy`, `/voorwaarden`, `/flyer`, `/bestellen` → de bijbehorende pagina;
- `www.strooizouthouten.nl` → 301 naar het hoofddomein; lange adressen (`/strooizout/...`) op het eigen domein → 301 naar de korte vorm;
- `/robots.txt` en `/sitemap.xml` eigen versie; overige paden van martijndenbesten.com → 302 naar `/`;
- canonical en og:url wijzen naar `https://strooizouthouten.nl/...`; de sitemap van martijndenbesten.com bevat de webshop niet meer;
- Worker-variabele `STROOIZOUT_DOORVERWIJZEN = "ja"`: `martijndenbesten.com/strooizout(/pagina)` en `/zout` → 301 naar het eigen domein. Bestanden (PDF, beelden) blijven op het oude adres bereikbaar.

Koppelen: Cloudflare › Workers › `martijndenbesten` › Domains & Routes › Custom domain voor `strooizouthouten.nl` en `www.strooizouthouten.nl` (zone in hetzelfde Cloudflare-account; DNS en certificaat regelt Cloudflare).

## Configuratie en secrets

| Naam | Soort | Nodig | Waarvoor |
| --- | --- | --- | --- |
| `ADMIN_TOKEN` | Worker-secret (bestaat al) | ja | Algemeen beheertoken van de site; geeft ook toegang tot het Strooizout-beheer |
| `STROOIZOUT_TOKEN` | Worker-secret (nieuw, optioneel) | nee | Apart beheertoken (min. 24 tekens) voor alleen de webshop, bijvoorbeeld als een buur meehelpt. Zet met `npx wrangler secret put STROOIZOUT_TOKEN -c wrangler.embedded.jsonc` (of in het Cloudflare-dashboard) |
| `HASH_SECRET` | Worker-secret (bestaat al) | **ja** | HMAC voor de persoonlijke bestellink en het pseudonimiseren van IP-adressen. Ontbreekt hij, dan weigert de webshop bestellingen en bestelpagina's (503, *fail closed*), want anders zijn links te raden. **Niet wijzigen** zolang er lopende bestellingen zijn: bestaande klantlinks werken dan niet meer |
| D1 `martijndenbesten` | binding `DB` (bestaat al) | ja | Migratie `migrations/0004_strooizout.sql` (tabellen `sz_*`) |

Alle overige instellingen (afhaaladres, bezorggebied, tarieven, contact, teksten, voorwaarden, btw, bewaartermijn, open/dicht) staan in de database en zijn in het beheer aan te passen.

**Aanbevolen extra slot:** zet `/strooizout/beheer` en `/api/strooizout/beheer` achter Cloudflare Access (gratis, zie [DEPLOYMENT.md](../DEPLOYMENT.md), stap 4; voeg de twee paden toe aan dezelfde applicatie).

## Livegang (checklist)

1. **Migratie** op productie: `npx wrangler d1 migrations apply martijndenbesten --remote`, daarna controleren dat de tabel er is: `npx wrangler d1 execute martijndenbesten --remote --command "SELECT COUNT(*) FROM sz_product"` (les uit de uitrol van 16-11: eerst de tabel controleren, dan uitrollen).
2. **Uitrollen** via de bestaande route (zie [DEPLOYMENT.md](../DEPLOYMENT.md); op dit moment de ingebedde variant: `npm run deploy:embedded`). Herstelpunt noteren (`npx wrangler deployments list`).
3. **Rooktest**: `/strooizout` 200, `/zout` 301, `/api/strooizout/winkel` 200 met `open: false`, `/api/strooizout/beheer/overzicht` zonder token 401, `/strooizout/beheer` met `X-Robots-Tag: noindex`.
4. **In het beheer**: inloggen → *Instellingen*: afhaaladres (privé), plek (publiek, bijv. ‘Houten’), contactgegevens, bezorggebied controleren, btw-keuze; *Producten*: inkoopprijs strooizout invullen, eventueel echte productfoto uploaden; *Bestelrondes*: ronde starten met sluitdatum; eventueel momenten toevoegen.
5. **Eén eigen proefbestelling** plaatsen en daarna in het beheer annuleren (komt niet in de omzet). Geen bestellingen namens anderen.
6. Flyer printen (`/strooizout/flyer` of `flyer-a5.pdf`) en de deelafbeelding met tekst delen.

Terugdraaien: `npx wrangler rollback <versie-id> -c wrangler.embedded.jsonc`. De `sz_*`-tabellen mogen blijven staan; een oudere versie gebruikt ze niet.

## Bestanden

```
migrations/0004_strooizout.sql        schema + startgegevens (categorieën, strooizout 25 kg actief, sneeuwschep als concept)
shared/strooizout.ts                  prijsregels, validatie, instellingen, statussen (worker én webshop)
worker/strooizout.ts                  publieke API: winkel, bestellen, bestelpagina, annuleren, afbeeldingen
worker/strooizout-beheer.ts           beheer-API: overzicht, bestellingen, route, producten, rondes, momenten, instellingen, CSV, opschonen
worker/strooizout-basis.ts            gedeelde hulp (HTTP, catalogus, pakketten, voorraad, tokens)
strooizout.html + src/strooizout/     eigen Vite-ingang en React-app (eigen uiterlijk, los van de hoofdsite)
src/strooizout/beheer/                beheerdashboard (per tabblad een bestand, lazy geladen)
scripts/postbuild.mjs                 maakt de HTML per route (noindex voor beheer/bestelling/flyer) en de sitemap-regels
scripts/strooizout/                   bron-SVG's van de productillustraties en scripts voor beelden, flyer-PDF en deelbeelden
tests/strooizout.test.ts              65 tests: prijsregels, validatie, API, gelijktijdigheid, rechten, CSV, privacy
e2e/strooizout.spec.ts                bestelroute desktop en telefoon, beheer, CSV, toegankelijkheid (axe)
```

## Beelden en flyer opnieuw maken

```bash
node scripts/strooizout/maak-beelden.cjs                  # productillustraties (SVG → WebP) en icoon
npm run build && npx wrangler dev --local --port 8790 ... # site lokaal, ronde/instellingen naar wens
node scripts/strooizout/maak-flyer.cjs http://localhost:8790   # flyer-a5.pdf en deelbeelden
```

De productafbeeldingen zijn **eigen illustraties**, geen foto's. Upload een echte productfoto via *Producten › Bewerken › Foto uploaden* (in de browser verkleind tot max. 1400 px, opgeslagen in D1, max. 900 kB).

## Mollie (voorbereid, niet actief)

Er is geen betaalprovider gekoppeld. Voorbereid: de betaaltabel `sz_betaling` heeft de velden `provider` en `provider_ref` en de wijze `provider`, de betaalstatus wordt al uitsluitend afgeleid uit geregistreerde betalingen. Een koppeling vraagt: een Mollie-account (kosten per transactie), een secret `MOLLIE_API_KEY`, een endpoint dat een betaling aanmaakt en een webhook die de status bij Mollie opvraagt (nooit de webhookinhoud vertrouwen) en dan een regel in `sz_betaling` schrijft. Niet bouwen zonder kostenakkoord.

## Bekende grenzen

- Geen automatische e-mail of sms; contact loopt via de bestelpagina en handmatige WhatsApp/mail.
- De route is een volgorde op postcode en huisnummer, geen geoptimaliseerde route.
- De btw-instelling is een weergavekeuze; of btw van toepassing is, moet de eigenaar zelf vaststellen.
- De conceptsneeuwschep is niet zichtbaar tot leverancier, prijs, productgegevens en beschikbaarheid bevestigd en ingevuld zijn.
