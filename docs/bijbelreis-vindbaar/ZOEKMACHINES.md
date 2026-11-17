# Bijbelreis aanmelden bij Google en Bing (stappenplan voor Martijn)

Klaar op de site (gecontroleerd 17-11-2026 op productie):

- `https://bijbelreis.nl/robots.txt` staat alles toe en wijst naar de sitemap.
- `https://bijbelreis.nl/sitemap.xml` bevat 153 adressen: de atlas, `/verhalen`, de lesroutes en alle 150 verhaalpagina’s.
- Elke pagina heeft een titel, beschrijving en canonieke link.

Wat jij nog moet doen: eigendom bevestigen en de sitemap indienen. Dat vraagt je eigen Google- en Microsoft-login, dus
dat kan ik niet voor je doen. Reken op 10 minuten.

## 1. Google Search Console (± 5 minuten)

1. Ga naar https://search.google.com/search-console en log in met het Google-account dat de site moet beheren.
2. **Property toevoegen** → kies **Domein** (links) en vul in: `bijbelreis.nl` (zonder https en zonder www).
   Een domein-property telt `https://`, `www.` en alle pagina’s in één keer mee.
3. Google vraagt om een TXT-record in de DNS. Omdat bijbelreis.nl bij Cloudflare staat, biedt Google meestal een knop
   **‘Verifiëren via Cloudflare’ / ‘Start verification’** aan:
   - Klik erop, log in bij Cloudflare, geef toestemming voor bijbelreis.nl. Google zet het record zelf en verifieert.
   - **Zie je die knop niet?** Kopieer dan de regel `google-site-verification=…` die Google toont, en zet hem in Cloudflare:
     dash.cloudflare.com → bijbelreis.nl → **DNS** → **Records** → **Add record** → Type `TXT`, Name `@`,
     Content: de gekopieerde regel, TTL Auto → **Save**. Terug in Search Console: **Verifiëren** (kan een paar minuten duren).
   - Dit TXT-record verandert niets aan de website of de e-mail; laat het staan (Google controleert het af en toe opnieuw).
4. Links in het menu: **Sitemaps** → vul in `sitemap.xml` (het begin `https://bijbelreis.nl/` staat er al) → **Indienen**.
   Status ‘Geslaagd’ met ±153 ontdekte pagina’s is goed. ‘Kan niet ophalen’ in het eerste uur is normaal; kijk de dag erna.
5. Optioneel, versnelt de eerste opname: bovenaan **URL-inspectie** → `https://bijbelreis.nl/` → **Indexering aanvragen**.
   Doe hetzelfde voor `https://bijbelreis.nl/verhalen`.

## 2. Bing Webmaster Tools (± 3 minuten; Bing voedt ook DuckDuckGo en Ecosia)

1. Ga naar https://www.bing.com/webmasters en log in (Microsoft-, Google- of Facebook-account).
2. Kies **Importeren uit Google Search Console** (rechts) → geef toestemming → vink bijbelreis.nl aan → **Importeren**.
   Bing neemt de verificatie en de sitemap over; er hoeft niets in de DNS.
   - Werkt importeren niet (bijvoorbeeld omdat Google nog niet klaar is): kies links **Handmatig toevoegen** →
     `https://bijbelreis.nl/` → verificatie via **Cloudflare** of via een TXT/CNAME-record zoals bij Google hierboven →
     daarna **Sitemaps** → `https://bijbelreis.nl/sitemap.xml` → **Indienen**.

## 3. Wat je daarna kunt verwachten

- Eerste pagina’s verschijnen meestal binnen enkele dagen tot twee weken; de rest volgt geleidelijk. Er is geen garantie
  dat Google alle 150 verhaalpagina’s opneemt.
- In Search Console zie je na een paar dagen onder **Prestaties** op welke zoekwoorden mensen de site vinden en onder
  **Pagina’s** welke pagina’s zijn opgenomen. Meldingen over ‘Gevonden – momenteel niet geïndexeerd’ zijn in het begin normaal.
- Na een nieuwe uitrol hoef je niets opnieuw in te dienen: de sitemap wordt bij elke build uit de inhoud gemaakt.

## 4. Controle als iets niet lijkt te werken

- `https://bijbelreis.nl/sitemap.xml` moet in de browser een lijst met adressen tonen.
- Een verhaalpagina, bijvoorbeeld `https://bijbelreis.nl/verhaal/26`, moet doorverwijzen naar
  `/verhaal/26-droog-door-de-schelfzee` en de tekst tonen zonder JavaScript.
- Technische achtergrond: `README.md` in deze map.
