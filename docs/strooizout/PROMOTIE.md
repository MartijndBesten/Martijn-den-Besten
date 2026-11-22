# Strooizout voor de buurt — vindbaarheid en promotie

Stand: 22-11-2026. Er is **niets geplaatst of verstuurd** namens Martijn; alle teksten hieronder liggen klaar.

## 1. Status Google (eerlijk onderscheid)

| Onderdeel | Technisch gereed | Ingediend bij Google | Zichtbaar in zoekresultaten |
| --- | --- | --- | --- |
| Indexeerbare homepage, voorwaarden en privacy op strooizouthouten.nl | ja, na uitrol en koppeling van het domein | nee: Search Console vraagt de login van Martijn | nog niet vast te stellen |
| `robots.txt` en `sitemap.xml` op het eigen domein | ja | nee (sitemap indienen in Search Console) | – |
| Product- en Offer-gegevens (schema.org) met actuele prijs, staffels, voorbestelling, verkoper en retourbeleid | ja; in de HTML van de homepage, uit de database | – (Google leest dit bij het crawlen) | onzeker; Google beslist zelf over rich results |
| Google Merchant Center (gratis productvermeldingen) | voorbereid (verificatiecode in te vullen in het beheer) | nee | – |
| Google Bedrijfsprofiel | niet aangemaakt (zie §4) | nee | – |

Er is geen ranking te garanderen. Lokaal is de concurrentie op ‘strooizout Houten’ wel klein: vooral bouwmarkten buiten Houten.

## 2. Search Console (Martijn of Claude in Chrome, met zijn login)

1. Ga naar search.google.com/search-console › *Property toevoegen* › **Domein** › `strooizouthouten.nl`.
2. Google toont een TXT-record. Zet dat in Cloudflare (zone strooizouthouten.nl › DNS › *Add record* › TXT, naam `@`). Klik daarna op *Verifiëren*. Google biedt soms een automatische Cloudflare-koppeling aan; die mag ook.
3. *Sitemaps* › `https://strooizouthouten.nl/sitemap.xml` indienen.
4. *URL-inspectie* › `https://strooizouthouten.nl/` › *Indexering aanvragen*. Doe hetzelfde voor `/voorwaarden`.
5. Kies alternatief de property ‘URL-voorvoegsel’ met de HTML-tag. Plak dan alleen de code in *Beheer › Instellingen › Google-verificatiecode*; de site zet de meta-tag zelf neer, zonder uitrol.

## 3. Merchant Center (gratis productvermeldingen): advies ‘nog niet’

Wat al klopt:

- prijs, voorraad en verzendgebied staan op de site;
- er is een retourbeleid (14 dagen);
- contactgegevens en bedrijfsadres staan op de site;
- de gestructureerde gegevens kloppen.

Wat schuurt:

- Google eist dat je het product op de site kunt **kopen**, met minstens één gangbare betaalmethode. Waarschijnlijk telt ‘betalen bij afhalen/bezorging’ mee, maar dat kon ik niet woordelijk verifiëren.
- De site spreekt van een **reservering** die je kosteloos kunt annuleren. Dat past slecht bij ‘direct kopen’.
- Lokale voorraad (‘ophalen in de winkel’) vraagt een Bedrijfsprofiel met winkeladres. Dat is er niet.

**Besluit nodig (Martijn):** wordt een bestelling een koop of blijft het een reservering?

- Bij een koop moet de knop volgens de wet duidelijk een **betalingsverplichting** noemen, bijvoorbeeld ‘Bestellen met betalingsverplichting’ (art. 6:230v BW). Daarna kan Merchant Center worden aangevraagd. Stappen: account aanmaken › website verifiëren met de code via het beheer › claimen › verzendregio Nederland op postcodes 3991–3995 › product uit de sitegegevens.
- Bij een reservering: Merchant Center overslaan. De structured data en Search Console doen het meeste werk.

## 4. Google Bedrijfsprofiel (Maps): advies ‘geen tweede profiel’

- Google staat **één profiel per bedrijf** toe. Denckh is de verkoper; een apart profiel voor ‘Strooizout voor de buurt’ op hetzelfde (woon)adres is een duplicaat. Dat kan tot opschorting leiden.
- Een webshop zonder klantcontact op locatie komt niet in aanmerking. Komen klanten afhalen, dan verwacht Google een **zichtbaar adres** (hybride profiel). Het afhaaladres is nu bewust privé.
- **Advies:** heeft Denckh al een Bedrijfsprofiel? Voeg daar de dienst ‘Strooizout (seizoen)’ toe, met servicegebied Houten en een link naar strooizouthouten.nl. Is er nog geen profiel, maak dan alleen een profiel aan als Martijn het afhaaladres openbaar wil maken of uitsluitend als servicegebied (bezorging) werkt.
- Gebruik nooit een fictief adres of fictieve openingstijden.
- Verificatie gaat via Google. Meestal is dat een live video-opname (bedrijfsnaam, materiaal of voorraad, bewijs van beheer), soms telefoon of post. Dat moet Martijn zelf doen.

## 5. Meten (staat in het beheer, *Overzicht › Bezoek en verkoop*)

Er staan geen cookies en geen externe dienst op de site. Per dag worden bezoekers geteld met een code die niet terug te rekenen is, en de site laat zien:

- herkomst;
- bron;
- bestellingen;
- conversie;
- gemiddeld aantal zakken per bestelling;
- verdeling over 1 / 2 / 3 / 4 / 5–9 / 10+ zakken.

De privacyverklaring beschrijft het. Volgens de AP valt analytics met geringe privacygevolgen onder de uitzondering van art. 11.7a Tw.

**Bronnen in links (`?via=…`):**

| Kanaal | Link |
| --- | --- |
| Flyer A5 (QR) | `https://strooizouthouten.nl/?via=flyer` |
| Bord aan de weg (QR) | `https://strooizouthouten.nl/aan-de-weg?via=bord` |
| WhatsApp-deelbeeld (QR) | `https://strooizouthouten.nl/?via=deelbeeld` |
| Deeltekst WhatsApp | `https://strooizouthouten.nl/?via=whatsapp` |
| Knop ‘Deel met je buren’ | `https://strooizouthouten.nl/?via=delen` |
| Facebookbericht | `https://strooizouthouten.nl/?via=facebook` |
| Nextdoor/Hoplr | `https://strooizouthouten.nl/?via=buurtapp` |
| Instagram (bio-link) | `https://strooizouthouten.nl/?via=instagram` |

## 6. Kanalen en plaatsingsregels

| Kanaal | Regels (voor zover te controleren) | Status |
| --- | --- | --- |
| Eigen WhatsApp-contacten en -groepen waar Martijn lid is | Voor ongevraagde commerciële berichten aan personen eist de ACM vooraf toestemming. In een groep: alleen als de beheerder het goed vindt. | tekst klaar; **toestemming Martijn + groepsbeheerder** |
| Buurtpreventie-WhatsApp (WABP) | Bedoeld voor veiligheid, niet voor verkoop | **niet gebruiken** |
| Facebookgroepen in Houten | De groepen zijn besloten; de regels zijn pas te lezen na lid worden. Verkoop kan alleen in groepen met koop-en-verkoopfunctie. | tekst klaar; **eerst regels lezen of beheerder vragen** |
| Nextdoor / Hoplr | Bedrijfspagina gratis; zelfpromotie in de buurtfeed wordt ontmoedigd (Nextdoor). Of ze in Houten actief zijn, kon ik niet controleren. | bedrijfspagina mogelijk; **toestemming Martijn** |
| Marktplaats (zakelijke advertentie) | Standaard gratis of per advertentie; je moet aangeven dat je zakelijk adverteert | optioneel; geen betaalde opties zonder akkoord |
| Houtens Nieuws / Omroep Houten | Over een gratis prikbord of ondernemersrubriek is niets gevonden | persbericht mogelijk (lokaal initiatief); **toestemming Martijn** |
| Flyers in brievenbussen | Respecteer ‘nee/nee’- en ‘nee/ja’-stickers | flyer klaar (`flyer-a5.pdf`) |
| Kleine ondernemers en VvE’s | Persoonlijk benaderen met de flyer of de link | tekst klaar |

## 7. Klaarliggende teksten

**WhatsApp-buurtgroep (kort)**

> Hoi buren! Geen aparte rit naar de bouwmarkt: in Houten kun je strooizout bestellen. 25 kg: 1 zak € 10,49, 2–3 zakken € 9,49, 4 of meer € 8,99 per zak. Samen bestellen is voordeliger, dus wie doet er mee? Gratis afhalen, of bezorgen binnen de rondweg. Op voorraad vanaf donderdag 26 november; reserveren kan nu: https://strooizouthouten.nl/?via=whatsapp

**Samen bestellen (voor een buurtgenoot die voor de straat bestelt)**

> Ik bestel strooizout voor onze straat bij Strooizout voor de buurt in Houten. Vanaf 4 zakken kost een zak van 25 kg € 8,99 in plaats van € 10,49. Laat je vóór [dag] weten hoeveel zakken je wilt? Dan bestel ik in één keer en verdelen we ze hier. Wie geen hele zak nodig heeft, kan er samen eentje delen.

**Facebookgroep (na toestemming van de beheerder)**

> **Strooizout uit je eigen buurt** 🧂❄️
> Dit jaar kun je in Houten zelf strooizout bestellen, zonder aparte rit naar de bouwmarkt. Zakken van 25 kg:
> • 1 zak € 10,49
> • 2–3 zakken € 9,49 per zak
> • 4 of meer € 8,99 per zak
> Gratis afhalen in Houten of laten bezorgen binnen de rondweg (vanaf 2 zakken). Op voorraad vanaf donderdag 26 november; reserveren kan nu.
> Tip: bestel samen met je buren en strooi ook eens bij iemand die dat zelf niet kan.
> 👉 https://strooizouthouten.nl/?via=facebook
> Een initiatief van Denckh, Houten.

Gebruik daarbij het beeld `delen-1200x630.jpg`.

**Instagram/Facebook-pagina (bijschrift bij `delen-1080.jpg`)**

> Strooizout uit je eigen buurt. 25 kg vanaf € 8,99 per zak, gratis afhalen in Houten. Hou je buurt veilig. Strooi bewust. Link in bio. #Houten #strooizout #gladheid

**Kleine ondernemers en VvE’s (persoonlijk bericht of e-mail)**

> Goedemiddag, wij zijn een lokaal initiatief in Houten en verkopen strooizout in zakken van 25 kg, vanaf 4 zakken voor € 8,99 per zak (incl. btw). We bezorgen binnen de rondweg. Voor grotere aantallen maken we graag een afspraak. Bestellen kan via https://strooizouthouten.nl/?via=zakelijk of door te reageren op dit bericht.

## 8. Filmpjes (verticaal, 18 seconden, met muziek)

Drie filmpjes in `docs/strooizout/film/` (1080 × 1920, geschikt voor WhatsApp-status, Instagram/Facebook Reels en Stories, TikTok en YouTube Shorts), elk met een voorbeeldbeeld (`…-voorbeeld.jpg`):

1. **Buren** (`strooizout-film.mp4`): ‘Glad voor de deur?’ → ‘Strooi je eigen stoep’ → ‘en ook bij een buur die dat zelf niet kan.’ (licht aan, de buur zwaait) → ‘Een beetje zout. Een beetje aandacht.’ (meer buren strooien mee, alle paadjes sluiten aan) → eindbeeld.
2. **Fietsers** (`strooizout-film-fiets.mp4`): ‘Glad op de fiets?’ (twee fietsers glijden uit) → ‘Even strooien…’ → ‘…en iedereen blijft overeind.’ (fietsers rijden veilig langs) → eindbeeld.
3. **Opa** (`strooizout-film-opa.mp4`): ‘Glad? Dan blijft opa liever binnen.’ (rollator schiet weg, hondje glijdt uit) → ‘Tenzij iemand even strooit…’ (een buurjongen strooit voor hem uit, opa steekt zijn duim op) → ‘…dan komt opa gewoon op de koffie.’ (oma zwaait vanaf het bankje) → eindbeeld.

- Onder alle drie staat een eigen deuntje dat speciaal hiervoor in code is gemaakt. Er zit geen muziek van anderen in, dus er is geen licentie nodig en de apps zullen het geluid niet blokkeren. Wil je liever muziek uit de bibliotheek van Instagram of TikTok, zet dan bij het plaatsen het oorspronkelijke geluid uit.
- Belangrijke tekst staat buiten de randen waar de apps hun knoppen overheen leggen.
- Er staan geen prijzen in. Zet de actuele prijs zo nodig in het bijschrift.
- Zet de link met herkomst in het bijschrift of de bio, bijvoorbeeld `https://strooizouthouten.nl/?via=film` (of `?via=fietsfilm`), dan is in het beheer te zien wat een filmpje oplevert.

Bijschrift bij film 1: *Glad voor de deur? Strooi je eigen stoep, en ook even bij een buur die dat zelf niet kan. Strooizout per zak van 25 kg, afhalen of bezorgd binnen de rondweg van Houten: strooizouthouten.nl*

Bijschrift bij film 2: *Glad op de fiets? Even strooien, en iedereen blijft overeind. Strooizout per zak van 25 kg, afhalen of bezorgd binnen de rondweg van Houten: strooizouthouten.nl*

Bijschrift bij film 3: *Glad? Dan blijft opa liever binnen. Tenzij iemand even strooit. Strooi ook bij een buur die dat zelf niet kan. Strooizout per zak van 25 kg, afhalen of bezorgd binnen de rondweg van Houten: strooizouthouten.nl*

Plaatsen doet Martijn zelf; er wordt niets namens hem geplaatst.

## 9. Mobiele snelheid

- Homepage: één JavaScript-bundel voor de webshop, het lettertype wordt vooraf geladen en de productbeelden zijn WebP van 15–20 kB.
- Geen externe scripts, geen cookies en geen tracking van derden.
- Lighthouse en de Core Web Vitals worden na de livegang op het definitieve domein gemeten; de uitkomst staat in HANDOFF.md.
