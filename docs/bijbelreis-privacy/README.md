# Bijbelreis: privacy en veiligheid (controle 17 november 2026)

Gecontroleerd: de bezoekmeting (`public/bijbelreis/bezoek.js`, `worker/bezoek.ts`, `docs/bijbelreis-bezoek/README.md`)
en het aanvraagformulier (`worker/aanvraag.ts`, `worker/begrenzing.ts`, `worker/aanvraag-mail.ts`, het formulier in
`public/bijbelreis.html`, `docs/bijbelreis-aanvraag/README.md`). Uitgangspunt: de site is voor kinderen van 6–14 en
hun ouders. Dit is een technische controle, geen juridisch advies.

## 1. Wat er wordt verzameld, waarom en hoe lang

| Wat | Waarom | Waar | Hoe lang |
|---|---|---|---|
| Voortgang (stempels, scores, niveau, waar je was) | De reis bijhouden | Alleen in de browser (`localStorage` `bijbelreis:*`) | Tot de gebruiker het wist; gaat nergens heen |
| Bezoek: willekeurig id per geladen pagina, dag, duur in beeld, apparaatsoort, hostnaam van de verwijzer, aantal geopende stappen | Hoeveel bezoeken en hoe lang | D1, tabel `bezoek` | 400 dagen |
| Bezoek: hash van IP + browserkenmerk + dag (HMAC met geheime sleutel) | Unieke bezoekers per dag schatten | D1, kolom `bezoeker` | 400 dagen; per dag anders, niet terug te rekenen, niet tussen dagen te koppelen |
| Aanvraag: soort, tekst (10–600 tekens), plaats in de atlas (`#jakob/7`) | De aanvraag behandelen | D1, tabel `aanvraag` | 400 dagen na afhandelen (of na ontvangst als hij nooit wordt afgehandeld) |
| Aanvraag: e-mailadres, **niet verplicht** | Kunnen antwoorden | D1 én de e-mail aan info@denckh.nl | In D1 gewist bij ‘Afgehandeld’; in de postbus tot de maker hem opruimt |
| Begrenzing: teller per hash van IP + dag | Misbruik tegengaan | D1, tabel `rate_limits` | Twee dagen |

Niet verzameld: geen account, geen cookie, geen IP-adres of user-agent in de database, geen land, geen welke-stap, geen
externe dienst of script (de pagina laadt alleen eigen bestanden; Cloudflare Web Analytics staat niet aan: er staat geen
beacon in de HTML van bijbelreis.nl of martijndenbesten.com). ‘Niet volgen’ (DNT/GPC) en robots worden niet geteld.

## 2. Misbruikbeveiliging (gecontroleerd in code, tests en productie)

| Maatregel | Bezoek | Aanvraag |
|---|---|---|
| Alleen POST | ja (GET → 405, productie) | ja (GET → 405, productie) |
| Alleen van de eigen site (`Sec-Fetch-Site`/`Origin`) | ja | ja (vreemde Origin → 403, productie; er wordt dan niets bewaard) |
| Grootte begrensd vóór het inlezen | 300 bytes | 4 kB, alleen JSON |
| Alleen bekende velden, strenge validatie | ja | ja; stuurtekens en onzichtbare tekens eruit; e-mail streng gecontroleerd en ≤ 120 tekens |
| Begrenzing | 300 per IP / 3.000 totaal per 10 minuten (geheugen) | 3 per uur en 8 per dag per bezoeker, 200 per etmaal totaal (D1) |
| Lokveld (honeypot) | — | `website`, buiten beeld, `tabindex=-1`, `aria-hidden`; ingevuld → ‘ok’, niets bewaard |
| E-mail aan de maker | — | Elke waarde ge-escaped (`escHtml`, unittest in `tests/aanvraag-mail.test.ts`); onderwerp alleen vaste woorden; `Reply-To` alleen een gecontroleerd adres; geen afbeeldingen of externe bronnen |
| Beheer | — | Niet op bijbelreis.nl (`/api/admin/…` → 404); alleen op de hoofdsite met beheertoken |
| Antwoorden | altijd 204 (een aftaster leert niets) | `no-store`, `nosniff`, eigen strenge CSP |

## 3. Geschikt voor jonge gebruikers

- Alleen de vraag is verplicht; het e-mailadres niet. Onder het e-mailveld staat al: ‘Alleen om je te antwoorden. Ben je
  jonger dan 16? Vraag het dan aan je vader of moeder.’
- Bij **Voorlezen** staan alleen de ingangen onder ‘Voor ouders en leiders’; geen formulier in de reis.
- De privacytekst onder ‘Voor ouders en leiders’ klopt met wat er gebeurt.

## 4. Aangepast in deze ronde

- **Formulier:** de inleiding zegt nu ook ‘Je naam, adres of telefoonnummer is niet nodig.’ Kinderen schrijven in een
  vrij tekstveld snel hun naam of school; dat hoeft niet en wordt dan ook niet gevraagd (dataminimalisatie).

Verder is er niets gevonden dat een kleine, aantoonbare verbetering nodig had: validatie, begrenzing, lokveld,
escaping en bewaartermijnen zijn in orde en getest.

## 5. Risico’s en voorstellen (niet uitgevoerd: vragen een besluit)

1. **E-mailadres bij een aanvraag die nooit wordt afgehandeld** blijft 400 dagen in D1 staan. Voorstel: het adres
   automatisch wissen na bijvoorbeeld 90 dagen (in `ruimOp`), en de tekst onder ‘Voor ouders en leiders’ daarop
   aanpassen. Besluit van Martijn over de termijn nodig.
2. **De postbus info@denckh.nl** bewaart de tekst en het adres van elke aanvraag zonder termijn. Voorstel: vaste
   gewoonte om meldingen na beantwoorden te verwijderen, of de mail zonder het adres te sturen en alleen in het beheer
   te tonen (dan kan ‘Antwoorden’ niet meer vanuit de mail).
3. **Links in de vraagtekst**: mailprogramma’s maken van een webadres in de tekst vaak zelf een link. Een kwaadwillige
   ‘aanvraag’ kan zo een phishinglink in de inbox van de maker zetten. Laag risico (begrensd, alleen de maker ziet het);
   voorstel: in de mail `://` onklikbaar maken (bijv. `hxxps`), of de maker bewust laten blijven.
4. **De bezoekershash** staat 400 dagen bij elk bezoek. Hij is per dag anders en niet terug te rekenen, maar formeel
   een pseudoniem gegeven. Voorstel: de unieke bezoekers per dag na afloop van de dag in een dagtotaal opslaan en de
   kolom daarna leegmaken. Kleine verbouwing van `bezoekOverzicht`; nu niet gedaan.
5. **CSP** staat `static.cloudflareinsights.com` en `cloudflareinsights.com` toe, maar Cloudflare Web Analytics wordt
   niet gebruikt. Voorstel: die twee uit de CSP halen (strakker). Niet gedaan: de `_headers` zijn gedeeld met de
   hoofdsite, en het is denkbaar dat de toestemming bewust voor later is gezet.
6. **Herkomst van de nieuwe verhaalpagina’s** (`/verhaal/…`, zie `docs/bijbelreis-vindbaar/README.md`): die pagina’s
   meten niets. Wie via Google op een verhaalpagina komt en doorklikt, telt in de atlas als ‘direct’. Om te zien of de
   vindbaarheid werkt, is Google Search Console de plek (geen extra meting nodig).
