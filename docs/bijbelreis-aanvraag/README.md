# Bijbelreis: ‘Mis je iets? Vraag het aan’ (november 2026)

Aanleiding, van Martijn (16-11-2026): “hoe zorgen we ervoor dat ze terugkomen? misschien nog iets in de website bouwen
dat ze een aanvraag kunnen doen voor iets? info@denckh.nl”.

Bezoekers kunnen vragen om een Bijbelgedeelte, verhaal of reis die er nog niet is (denk aan het gedeelte van de preek van
zondag), om iets voor school, club, catechisatie of kerk, of een fout melden. Het is bedoeld als reden om terug te komen:
wie iets aanvraagt, komt kijken of het er is. Elke aanvraag staat in het beheer en gaat ook als e-mail naar
info@denckh.nl. Wie verder bouwt (Claude, Codex of een mens) houdt de grenzen van §3 aan: de site is voor kinderen en
gezinnen.

| Bestand | Wat |
|---|---|
| `public/bijbelreis.html` | Het formulier (`#aanvraagLade`), de regel aan het einde van een deel (`#sMis`) en de ingang onder ‘Voor ouders en leiders’ |
| `public/bijbelreis/app.js` | Openen, controleren en versturen (zoek op ‘aanvraag:’); de knop bij zoeken zonder resultaat |
| `public/bijbelreis/bijbelreis.css` | De opmaak (blok ‘Aanvraag’) |
| `worker/aanvraag.ts` | Neemt de aanvraag aan (`POST /api/aanvraag`), begrenst, bewaart, mailt en geeft het beheer zijn lijst |
| `worker/begrenzing.ts` | De begrenzing per bezoeker in D1, gedeeld met stemmen en ideeën van de hoofdsite |
| `worker/bijbelreis-app.ts`, `worker/bijbelreis.ts` | De Worker van bijbelreis.nl: geeft `/api/aanvraag` door; `bijbelreis.ts` geeft de klasse `EmailMessage` mee |
| `worker/index.ts` | De hoofdsite: `/api/admin/aanvragen` voor het beheer; `/api/aanvraag` alleen in de lokale testopstelling |
| `migrations/0003_aanvraag.sql` | De tabel `aanvraag` |
| `wrangler.bijbelreis.jsonc` | De e-mailbinding `MAIL` (`send_email`, alleen naar info@denckh.nl) |
| `src/pages/Beheer.tsx` | Het onderdeel **Aanvragen bijbelreis.nl** in het beheer van martijndenbesten.com |
| `tests/aanvraag.test.ts`, `e2e/bijbelreis-aanvraag.spec.ts` | De tests |

## 1. Wat de bezoeker ziet

**Ingangen** (geen pop-up, geen onderbreking):

1. **Zoeken zonder resultaat** in Verhalen: onder ‘Niets gevonden voor …’ staat de knop **Vraag dit aan**. Het formulier
   opent met ‘Ik zoek ‘…’ en kan het niet vinden.’ al ingevuld. Dit is de belangrijkste ingang: hier weet de bezoeker al
   wat hij mist.
2. **Onderaan de lijst van Verhalen**: de regel ‘Mis je iets? Vraag het aan’ (wijkt zolang de knop van punt 1 er staat).
3. **Aan het einde van een deel** (de laatste stap, in de stapkaart of het open stapblad): dezelfde regel, klein. In het
   korte stapblad op de telefoon staat hij niet; dat blad blijft even hoog.
4. **Voor ouders en leiders**: ‘Iets missen of melden’, altijd.

Bij **Samen ontdekken** (4–6 jaar) staan ingang 1 tot en met 3 er niet: daar is geen formulier voor jonge kinderen.
Ingang 4 blijft.

**Het formulier** is een blad in de stijl van de andere vensters; op de telefoon vult het het scherm.

- Waar gaat het over? Een Bijbelgedeelte of verhaal dat ik mis · Voor school, club of kerk · Een fout of verbetering ·
  Iets anders.
- Wat wil je vragen? Verplicht, 10 tot 600 tekens, met een teller.
- E-mailadres, als je antwoord wilt. Niet verplicht. Eronder: ‘Alleen om je te antwoorden. Ben je jonger dan 16? Vraag het
  dan aan je vader of moeder.’
- Versturen. Daarna: ‘**Bedankt.** We lezen alles. Kom gerust terug om te kijken of het er staat.’ Geen doorverwijzing.
- Onderaan: ‘Liever mailen? info@denckh.nl’.

Een fout staat bij het veld waar hij over gaat, en de focus gaat erheen. Lukt het versturen niet, dan staat er: ‘Het
versturen lukte niet. Probeer het later nog eens, of mail naar info@denckh.nl.’ De ingevulde tekst blijft staan.

## 2. Wat er bewaard wordt

Eén rij per aanvraag in de tabel `aanvraag`:

| Kolom | Inhoud |
|---|---|
| `id` | Volgnummer |
| `tijd` | Het moment van ontvangst (klok van de server) |
| `soort` | `gemist`, `groep`, `fout` of `anders` |
| `tekst` | Wat de bezoeker schreef, als platte tekst (10–600 tekens). Regeleinden blijven; stuurtekens en onzichtbare tekens gaan eruit. |
| `email` | Leeg, of het adres dat de bezoeker opgaf om antwoord te krijgen |
| `context` | Waar de bezoeker was, als adres binnen de atlas (`#jakob/7`); leeg als dat geen gewone vorm had |
| `status` | `nieuw` of `afgehandeld` |
| `afgehandeld_op` | Het moment van afhandelen |

**Bewaartermijn.**

- Het **e-mailadres** in de database wordt gewist zodra de aanvraag in het beheer op ‘Afgehandeld’ wordt gezet. Antwoord
  dus eerst.
- Een aanvraag verdwijnt **400 dagen** na het afhandelen (of, als hij nooit is afgehandeld, 400 dagen na ontvangst). Dat
  gebeurt vanzelf, af en toe bij een nieuwe aanvraag.
- De **e-mail aan info@denckh.nl** (§6) staat daarna in die postbus, met de tekst en het adres van de bezoeker. Daar
  geldt geen automatische termijn: ruim die berichten zelf op.

De privacytekst onder ‘Voor ouders en leiders’ zegt dit: wat je in het aanvraagformulier schrijft, en je e-mailadres als
je dat invult, wordt bewaard en naar de maker gemaild, alleen om je aanvraag te behandelen en je te antwoorden.

## 3. Wat er bewust niet gebeurt

- **Geen IP-adres en geen user-agent** in de tabel. Voor de begrenzing staat er twee dagen lang een teller per bezoeker
  in `rate_limits`, onder een hash met de geheime sleutel `HASH_SECRET` (IP + dag): niet terug te rekenen en niet tussen
  dagen te koppelen. Zonder sleutel gebruikt de Worker een willekeurig zout dat alleen in zijn geheugen staat.
- **Geen cookie en niets in de opslag van de browser.** Een half ingevulde aanvraag staat alleen in het formulier.
- **Niets extra in de bezoekmeting**: het openen en versturen van het formulier wordt niet geteld.
- **Geen opmaak, geen links.** De tekst van de bezoeker wordt overal als platte tekst getoond; in het beheer wordt niets
  ervan klikbaar gemaakt.
- **Geen nieuwsbrief en geen lijst.** Het e-mailadres dient alleen voor het antwoord op deze ene aanvraag.
- **Geen Bijbeltekst** en geen inhoud: dit is alleen bediening.
- De CSP blijft `default-src 'self'`: het formulier post naar de eigen site, en `mailto:` is een gewone link.

## 4. Misbruik

De route is openbaar. Wat er tegenover staat:

- alleen `POST`, alleen JSON, en alleen van een pagina op hetzelfde adres (`Sec-Fetch-Site`, of `Origin` bij een oudere
  browser);
- de inhoud is hooguit 4 kB en bevat alleen bekende velden met gecontroleerde waarden;
- een **lokveld** (`website`) dat mensen niet zien: wie het invult krijgt ‘gelukt’, maar er wordt niets bewaard, niets
  geteld en niets gemaild;
- per bezoeker hooguit **3 per uur** en **8 per dag**; in totaal hooguit **200 per etmaal**, zodat een stortvloed de
  gedeelde database niet vult. Daarboven krijgt de bezoeker een nette melding met het e-mailadres;
- het e-mailadres van de bezoeker komt alleen in de kopregel `Reply-To` als het de strenge controle doorstaat; het
  onderwerp van de e-mail bestaat uit vaste woorden en het nummer. Regeleinden uit invoer kunnen geen kopregel maken.

Wie buiten een browser om verzoeken stuurt, kan de koppen namaken en binnen deze grenzen aanvragen toevoegen (en dus
e-mails laten sturen, hooguit 200 per etmaal). Wordt dat een probleem: verlaag `TOTAAL_PER_DAG` in `worker/aanvraag.ts`
of haal de binding `MAIL` tijdelijk weg.

## 5. Inzien en afhandelen

`https://martijndenbesten.com/beheer` → inloggen met het beheertoken → **Aanvragen bijbelreis.nl**. Op de knop staat het
aantal nieuwe aanvragen.

- **Nieuw** en **Afgehandeld**, nieuwste eerst (hooguit 200).
- Per aanvraag: nummer, soort, datum, de tekst, waar de bezoeker was (link naar `https://bijbelreis.nl/#…`), en het
  e-mailadres als `mailto:` met het onderwerp ‘Je aanvraag bij de Bijbelreis’.
- **Afgehandeld**: zet de status en wist het e-mailadres. **Verwijderen**: haalt de aanvraag weg (voor reclame).

Rechtstreeks: `GET /api/admin/aanvragen?status=nieuw|afgehandeld` en `POST /api/admin/aanvragen/<id>` met
`{"actie":"afgehandeld"}` of `{"actie":"verwijder"}`, beide met `Authorization: Bearer <beheertoken>`.

## 6. De e-mail naar info@denckh.nl

Besluit van Martijn (16-11-2026): elke aanvraag gaat ook als e-mail naar info@denckh.nl.

| | |
|---|---|
| Van | `Bijbelreis <aanvraag@bijbelreis.nl>` |
| Aan | `info@denckh.nl` (de binding staat alleen dit adres toe) |
| Antwoorden naar | het e-mailadres van de bezoeker, als hij er een opgaf (`Reply-To`); ‘Beantwoorden’ in het mailprogramma gaat dus naar de bezoeker |
| Onderwerp | `Aanvraag #<nummer> - <soort>`, bijvoorbeeld `Aanvraag #12 - gemist gedeelte` (alleen vaste woorden en het nummer) |
| Inhoud | twee versies in één bericht (`multipart/alternative`): de platte tekst als terugval (soort, tijd in Nederlandse tijd, waar de bezoeker was als volledige link, het antwoordadres of ‘Geen e-mailadres opgegeven’, de tekst, de link naar het beheer) en de opgemaakte HTML-versie |

**Wat ervoor nodig is** (in het Cloudflare-account; de code doet dit niet):

1. **Email Routing aan op de zone bijbelreis.nl.** Cloudflare zet daarbij MX- en TXT-records (SPF, DKIM) in de DNS van
   bijbelreis.nl. Het afzenderadres moet bij een domein horen waarvoor dit aanstaat.
2. **info@denckh.nl als geverifieerd bestemmingsadres** (Email Service → Email Routing → Destination Addresses):
   Cloudflare stuurt een bevestigingsmail naar info@denckh.nl; daarin op ‘Verify email address’ klikken.
3. De binding in `wrangler.bijbelreis.jsonc`: `"send_email": [{ "name": "MAIL", "destination_address": "info@denckh.nl" }]`.

Verzenden naar een geverifieerd bestemmingsadres is volgens de documentatie van Cloudflare gratis, ook op het gratis
Workers-plan en ook als alleen Email Routing is ingesteld; het telt niet mee voor verzendlimieten. Bronnen (nagelezen op
16-11-2026): `developers.cloudflare.com/email-service/configuration/send-bindings/`,
`…/email-service/configuration/email-routing-addresses/`, `…/email-service/api/send-emails/workers-api/` en
`…/workers/wrangler/configuration/#email-bindings`.

**Hoe de code verstuurt** (`naAanvraag` in `worker/aanvraag.ts`): eerst op de manier die de documentatie nu aanraadt,
`env.MAIL.send({ from, to, subject, text, html, replyTo })`. Lukt dat niet, dan als ruw bericht met de klasse `EmailMessage`
uit `cloudflare:email` (de oudere manier); `bouwMime` maakt dat bericht zelf, zonder extra pakket, als
`multipart/alternative` met eerst de platte tekst en daarna de HTML. De klasse komt alleen
via `worker/bijbelreis.ts` binnen, omdat die module buiten de Worker-omgeving niet bestaat (tests, hoofdsite).

**Als het (nog) niet is ingesteld.** De melding is bijzaak en raakt de aanvraag nooit:

- ontbreekt de binding `MAIL` (hoofdsite, tests, of de regel is uit de configuratie gehaald), dan gaat er geen e-mail uit;
- mislukt het verzenden (Email Routing staat niet aan, het adres is niet geverifieerd, een storing), dan staat er een
  regel ‘Melding van aanvraag … mislukt’ met de foutcode in de logboeken van de Worker (`observability` staat aan);
- in beide gevallen is de aanvraag gewoon opgeslagen, krijgt de bezoeker ‘Bedankt’ en staat de aanvraag in het beheer.

**Uitrollen met de binding.** De documentatie zegt: “Before you can bind an email address to your Worker, you need to
enable Email Routing and have at least one verified email address.” Wat er gebeurt als je toch uitrolt voordat dat zo is,
staat er niet; reken erop dat `wrangler deploy` dan kan weigeren. Doe dus eerst stap 1 en 2. Moet de site eerder live,
haal dan de regel `send_email` tijdelijk uit `wrangler.bijbelreis.jsonc`: alles werkt dan, alleen zonder e-mail.

**Controleren na het uitrollen:** één aanvraag doen op bijbelreis.nl met een eigen e-mailadres erbij; er komt een e-mail
op info@denckh.nl, en ‘Beantwoorden’ gaat naar het opgegeven adres. Komt er niets: kijk in de logboeken van de Worker
`bijbelreis` naar de foutcode (bijvoorbeeld `E_SENDER_NOT_VERIFIED` of `E_SENDER_DOMAIN_NOT_AVAILABLE`: Email Routing
staat niet aan op bijbelreis.nl; `E_RECIPIENT_NOT_ALLOWED`: het bestemmingsadres klopt niet met de binding).

### De opgemaakte versie (HTML)

Het sjabloon is van Martijn (16-11-2026) en staat letterlijk in `worker/aanvraag-mail.ts`; een unittest vergelijkt de
uitkomst met zijn origineel (`tests/fixtures/aanvraagmail-sjabloon.html`).

| Plaatshouder | Waarde |
| --- | --- |
| `{{NUMMER}}` | het nummer van de aanvraag |
| `{{SOORT}}` | de soort in gewone taal: gemist gedeelte · school, club of kerk · fout of verbetering · iets anders |
| `{{VRAAG}}` | de tekst van de bezoeker; een regeleinde wordt een nieuwe regel |
| `{{VRAAG_KORT}}` | het begin van de tekst op één regel (ongeveer honderd tekens, op een woordgrens): de voorvertoning in de inbox |
| `{{WANNEER}}` | de tijd in Nederland |
| `{{WAAR}}` | de plaats in de atlas, bijvoorbeeld `bijbelreis.nl/#jakob/7` |
| `{{ANTWOORD}}` | het e-mailadres van de aanvrager |

- **Alles wordt ge-escaped.** Er komt nooit ruwe invoer van een bezoeker in de HTML; `<b>` in een vraag staat er als
  tekst. Een waarde die zelf op een plaatshouder lijkt, wordt niet opnieuw ingevuld.
- **Wat vervalt:** zonder plaats de regel ‘Waar’; zonder e-mailadres zowel de knop ‘Antwoorden’ als de regel ‘Antwoord
  naar’. De zoekterm van de bezoeker wordt niet apart bewaard: die staat in de tekst van de aanvraag.
- **De mail laadt niets:** geen afbeeldingen, scripts of lettertypen; alleen de link naar het beheer en de `mailto:`.
- **Licht en donker** volgen het apparaat (`prefers-color-scheme`). Bekeken in Chromium op 390 px breed, in licht en
  donker, met en zonder plaats en e-mailadres en met een lange tekst; **niet** in Apple Mail, Gmail of Outlook zelf.
  Gmail negeert `<style>` in sommige weergaven: daar blijft de lichte versie staan, ook als het toestel donker is.
- Voorbeelden opnieuw maken: bundel een scriptje dat `maakBericht` aanroept (zie de PR bij deze wijziging) en open de
  HTML in een browser.

## 7. Live zetten

1. Migratie op de productiedatabase (alleen een nieuwe tabel):
   `npx wrangler d1 migrations apply martijndenbesten --remote -c wrangler.embedded.jsonc`
2. Email Routing en het bestemmingsadres (§6, stap 1 en 2). Dit is een wijziging in de DNS van bijbelreis.nl en vraagt
   de toestemming van Martijn; hij heeft die op 16-11-2026 gegeven.
3. Eerst de Worker `bijbelreis` uitrollen (formulier, route en e-mail), dan de hoofdsite (het beheeronderdeel).
4. Controle: `curl -i https://bijbelreis.nl/api/aanvraag` geeft 405; een proefaanvraag komt in het beheer en in de
   postbus; daarna in het beheer ‘Verwijderen’.

`HASH_SECRET` staat sinds de bezoekmeting al op de Worker `bijbelreis`.

## 8. Bekende zwaktes

- **Geen bericht terug als het er staat.** De bevestiging zegt ‘kom gerust terug’; er gaat geen automatische e-mail naar
  de bezoeker. Antwoorden doet Martijn zelf, vanuit zijn postbus of het beheer.
- **Een e-mailadres van een kind** is niet te herkennen. De regel onder het veld vraagt jonge bezoekers het aan een ouder
  te vragen; meer dan dat is het niet.
- **De e-mail kan in de spam belanden** bij info@denckh.nl; de aanvraag staat dan nog steeds in het beheer.
- **Gedeelde database** met de hoofdsite (stemmen, ideeën, bezoekmeting). De grens van 200 per etmaal houdt de tabel
  klein, maar elke poging schrijft een teller in `rate_limits`.
- **De eerste manier van verzenden is nieuw** bij Cloudflare (Email Service, bèta). Daarom de tweede manier als vangnet.
  Welke van de twee in productie werkt, is pas te zien na het instellen van Email Routing; de logboeken zeggen het.
- **Niet op een echte iPhone geprobeerd**: het toetsenbord van Safari over het formulier is alleen in Chromium met
  iPhone-maten bekeken.
