-- Strooizout voor de buurt: mini-webshop op /strooizout met beheer op /strooizout/beheer.
-- Alle bedragen in centen (gehele getallen), alle tijden als ISO-8601 in UTC (tekst).
-- Zie docs/strooizout/README.md.

CREATE TABLE IF NOT EXISTS sz_categorie (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  naam TEXT NOT NULL,
  volgorde INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sz_product (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  naam TEXT NOT NULL,
  categorie_id INTEGER REFERENCES sz_categorie(id),
  -- concept: nog niet zichtbaar · actief: te bestellen · verborgen: tijdelijk uit · verwijderd: alleen nog voor de historie
  status TEXT NOT NULL DEFAULT 'concept' CHECK (status IN ('concept', 'actief', 'verborgen', 'verwijderd')),
  kort TEXT NOT NULL DEFAULT '',
  beschrijving TEXT NOT NULL DEFAULT '',
  -- JSON-lijst van {"label": "...", "waarde": "..."}
  specificaties TEXT NOT NULL DEFAULT '[]',
  prijs_cent INTEGER CHECK (prijs_cent IS NULL OR prijs_cent >= 0),
  inkoop_cent INTEGER CHECK (inkoop_cent IS NULL OR inkoop_cent >= 0),
  -- bezorgkosten per stuk; NULL = standaardtarief uit de instellingen
  bezorg_cent INTEGER CHECK (bezorg_cent IS NULL OR bezorg_cent >= 0),
  gewicht_gram INTEGER NOT NULL DEFAULT 0 CHECK (gewicht_gram >= 0),
  eenheid TEXT NOT NULL DEFAULT 'stuk',
  -- NULL = geen voorraadbeheer (wordt per bestelronde ingekocht); anders nooit onder nul
  voorraad INTEGER CHECK (voorraad IS NULL OR voorraad >= 0),
  max_per_bestelling INTEGER NOT NULL DEFAULT 20 CHECK (max_per_bestelling BETWEEN 1 AND 500),
  afbeelding TEXT NOT NULL DEFAULT '',
  afbeelding_alt TEXT NOT NULL DEFAULT '',
  -- interne notitie (leverancier, bevestigingen); nooit publiek
  notitie TEXT NOT NULL DEFAULT '',
  volgorde INTEGER NOT NULL DEFAULT 0,
  aangemaakt TEXT NOT NULL,
  gewijzigd TEXT NOT NULL
);

-- Combinatiepakketten: een product dat uit andere producten bestaat.
CREATE TABLE IF NOT EXISTS sz_pakket_onderdeel (
  pakket_id INTEGER NOT NULL REFERENCES sz_product(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES sz_product(id),
  aantal INTEGER NOT NULL CHECK (aantal BETWEEN 1 AND 100),
  PRIMARY KEY (pakket_id, product_id)
);

-- Aanbiedingen: een vaste actieprijs per stuk, eventueel pas vanaf een aantal (staffel), binnen een periode.
CREATE TABLE IF NOT EXISTS sz_aanbieding (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES sz_product(id) ON DELETE CASCADE,
  naam TEXT NOT NULL,
  vanaf_aantal INTEGER NOT NULL DEFAULT 1 CHECK (vanaf_aantal >= 1),
  prijs_cent INTEGER NOT NULL CHECK (prijs_cent >= 0),
  start TEXT,
  eind TEXT,
  actief INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sz_ronde (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  naam TEXT NOT NULL,
  -- open: bestellen kan (tot sluit_op) · gesloten: bestellingen verzameld · ingekocht · geleverd (bij ons binnen) · afgerond
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'gesloten', 'ingekocht', 'geleverd', 'afgerond')),
  sluit_op TEXT,
  notitie TEXT NOT NULL DEFAULT '',
  leverancier TEXT NOT NULL DEFAULT '',
  inkoop_datum TEXT,
  inkoop_bedrag_cent INTEGER,
  inkoop_notitie TEXT NOT NULL DEFAULT '',
  levering_datum TEXT,
  aangemaakt TEXT NOT NULL,
  gesloten_op TEXT
);

-- Wat er per ronde werkelijk bij de leverancier is ingekocht (registratie, geen order).
CREATE TABLE IF NOT EXISTS sz_ronde_inkoop (
  ronde_id INTEGER NOT NULL REFERENCES sz_ronde(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES sz_product(id),
  aantal INTEGER NOT NULL CHECK (aantal >= 0),
  stukprijs_cent INTEGER NOT NULL CHECK (stukprijs_cent >= 0),
  PRIMARY KEY (ronde_id, product_id)
);

CREATE TABLE IF NOT EXISTS sz_moment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ronde_id INTEGER REFERENCES sz_ronde(id) ON DELETE SET NULL,
  soort TEXT NOT NULL CHECK (soort IN ('ophalen', 'bezorgen')),
  datum TEXT NOT NULL,
  van TEXT NOT NULL,
  tot TEXT NOT NULL,
  omschrijving TEXT NOT NULL DEFAULT '',
  max_bestellingen INTEGER CHECK (max_bestellingen IS NULL OR max_bestellingen >= 1),
  actief INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sz_bestelling (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotentie TEXT NOT NULL UNIQUE,
  -- korte code voor afhalen/uitgifte (bijv. H-4827); uniek zolang de bestelling niet is geanonimiseerd (dan NULL)
  afhaalcode TEXT UNIQUE,
  ronde_id INTEGER REFERENCES sz_ronde(id),
  -- nieuw: reservering ontvangen · bevestigd · klaar: ligt klaar / gaat mee · afgehaald · bezorgd · geannuleerd
  status TEXT NOT NULL DEFAULT 'nieuw' CHECK (status IN ('nieuw', 'bevestigd', 'klaar', 'afgehaald', 'bezorgd', 'geannuleerd')),
  levering TEXT NOT NULL CHECK (levering IN ('ophalen', 'bezorgen')),
  moment_id INTEGER REFERENCES sz_moment(id),
  naam TEXT NOT NULL,
  -- optioneel ('' = niet opgegeven)
  email TEXT NOT NULL DEFAULT '',
  -- verplicht Nederlands mobiel nummer, opgeslagen als 06xxxxxxxx
  telefoon TEXT NOT NULL,
  straat TEXT NOT NULL DEFAULT '',
  huisnummer TEXT NOT NULL DEFAULT '',
  postcode TEXT NOT NULL DEFAULT '',
  plaats TEXT NOT NULL DEFAULT '',
  opmerking TEXT NOT NULL DEFAULT '',
  betaalwijze TEXT NOT NULL CHECK (betaalwijze IN ('bij_ontvangst', 'tikkie')),
  subtotaal_cent INTEGER NOT NULL CHECK (subtotaal_cent >= 0),
  korting_cent INTEGER NOT NULL DEFAULT 0 CHECK (korting_cent >= 0),
  bezorg_cent INTEGER NOT NULL DEFAULT 0 CHECK (bezorg_cent >= 0),
  totaal_cent INTEGER NOT NULL CHECK (totaal_cent >= 0),
  gewicht_gram INTEGER NOT NULL DEFAULT 0,
  beheer_notitie TEXT NOT NULL DEFAULT '',
  -- moment waarop de beheerder een handmatig betaalverzoek (bijv. Tikkie) heeft verstuurd; nooit 'betaald'
  betaalverzoek_op TEXT,
  aangemaakt TEXT NOT NULL,
  gewijzigd TEXT NOT NULL,
  afgerond_op TEXT,
  -- willekeurig kenmerk van de geslaagde uitgifte; koppelt een betaling bij uitgifte aan precies die ene uitgifte
  uitgifte_id TEXT,
  voorraad_vrijgegeven INTEGER NOT NULL DEFAULT 0,
  -- gezet zodra de persoonsgegevens na de bewaartermijn zijn gewist
  geanonimiseerd_op TEXT
);
CREATE INDEX IF NOT EXISTS sz_bestelling_ronde ON sz_bestelling (ronde_id, status);
CREATE INDEX IF NOT EXISTS sz_bestelling_aangemaakt ON sz_bestelling (aangemaakt);

CREATE TABLE IF NOT EXISTS sz_bestelregel (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bestelling_id INTEGER NOT NULL REFERENCES sz_bestelling(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES sz_product(id),
  naam TEXT NOT NULL,
  aantal INTEGER NOT NULL CHECK (aantal >= 1),
  stukprijs_cent INTEGER NOT NULL CHECK (stukprijs_cent >= 0),
  normaalprijs_cent INTEGER NOT NULL CHECK (normaalprijs_cent >= 0),
  -- inkoopprijs per stuk op het moment van bestellen; NULL = toen nog onbekend (rapportage valt terug op de huidige)
  inkoop_cent INTEGER,
  bezorg_cent INTEGER NOT NULL DEFAULT 0,
  gewicht_gram INTEGER NOT NULL DEFAULT 0,
  aanbieding TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS sz_bestelregel_bestelling ON sz_bestelregel (bestelling_id);

-- Wat een bestelling van de voorraad afhaalde (ook de onderdelen van een pakket), zodat annuleren precies dat teruggeeft.
CREATE TABLE IF NOT EXISTS sz_voorraad_mutatie (
  bestelling_id INTEGER NOT NULL REFERENCES sz_bestelling(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES sz_product(id),
  aantal INTEGER NOT NULL CHECK (aantal >= 1),
  PRIMARY KEY (bestelling_id, product_id)
);

-- Handmatig geregistreerde betalingen (contant, Tikkie, overboeking). Geen bankgegevens of betaalgeheimen.
-- provider/provider_ref zijn voorbereid voor een eventuele latere betaalprovider (bijv. Mollie).
CREATE TABLE IF NOT EXISTS sz_betaling (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bestelling_id INTEGER NOT NULL REFERENCES sz_bestelling(id) ON DELETE CASCADE,
  bedrag_cent INTEGER NOT NULL,
  wijze TEXT NOT NULL CHECK (wijze IN ('contant', 'tikkie', 'overboeking', 'pin', 'provider', 'terugbetaling')),
  provider TEXT,
  provider_ref TEXT,
  notitie TEXT NOT NULL DEFAULT '',
  op TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sz_betaling_bestelling ON sz_betaling (bestelling_id);

-- Logboek van wijzigingen (zonder persoonsgegevens).
CREATE TABLE IF NOT EXISTS sz_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bestelling_id INTEGER,
  actie TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  op TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sz_instelling (
  sleutel TEXT PRIMARY KEY,
  waarde TEXT NOT NULL
);

-- Afbeeldingen die in het beheer zijn geüpload (verkleind in de browser, max. ~600 kB).
CREATE TABLE IF NOT EXISTS sz_afbeelding (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('image/jpeg', 'image/png', 'image/webp')),
  data BLOB NOT NULL,
  grootte INTEGER NOT NULL,
  hash TEXT NOT NULL,
  aangemaakt TEXT NOT NULL
);

-- Startgegevens: categorieën, het eerste product en een sneeuwschep als concept.
INSERT OR IGNORE INTO sz_categorie (slug, naam, volgorde) VALUES
  ('strooizout', 'Strooizout', 1),
  ('sneeuwscheppen', 'Sneeuwscheppen en sneeuwschuivers', 2),
  ('strooigereedschap', 'Strooigereedschap', 3),
  ('winteraccessoires', 'Winteraccessoires', 4);

INSERT OR IGNORE INTO sz_product
  (slug, naam, categorie_id, status, kort, beschrijving, specificaties, prijs_cent, inkoop_cent, bezorg_cent, gewicht_gram, eenheid, voorraad, max_per_bestelling, afbeelding, afbeelding_alt, notitie, volgorde, aangemaakt, gewijzigd)
VALUES (
  'strooizout-25-kg',
  'Strooizout 25 kg',
  (SELECT id FROM sz_categorie WHERE slug = 'strooizout'),
  'actief',
  'Zak van 25 kg voor stoep, oprit en tuinpad.',
  'Strooizout voor gebruik rond het huis: op de stoep, de oprit en het tuinpad. Strooi dun en gelijkmatig; meer zout werkt niet beter. Bewaar de zak droog en afgesloten, bij voorkeur van de grond, zodat het zout niet gaat klonteren.',
  '[{"label":"Inhoud","waarde":"25 kg"},{"label":"Verpakking","waarde":"Zak"},{"label":"Toepassing","waarde":"Stoep, oprit en tuinpad"},{"label":"Opslag","waarde":"Droog, afgesloten en van de grond"}]',
  899,
  NULL,
  NULL,
  25000,
  'zak',
  NULL,
  20,
  '/strooizout/beeld/strooizout-25kg.webp',
  'Witte zak strooizout van 25 kilo met een blauw etiket',
  'Inkoopprijs en leverancier nog invullen.',
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

INSERT OR IGNORE INTO sz_product
  (slug, naam, categorie_id, status, kort, beschrijving, specificaties, prijs_cent, inkoop_cent, bezorg_cent, gewicht_gram, eenheid, voorraad, max_per_bestelling, afbeelding, afbeelding_alt, notitie, volgorde, aangemaakt, gewijzigd)
VALUES (
  'sneeuwschep',
  'Sneeuwschep',
  (SELECT id FROM sz_categorie WHERE slug = 'sneeuwscheppen'),
  'concept',
  'Conceptproduct: nog niet te bestellen.',
  'Conceptproduct. Pas publiceren nadat leverancier, prijs, productgegevens en beschikbaarheid zijn bevestigd.',
  '[]',
  NULL,
  NULL,
  NULL,
  0,
  'stuk',
  NULL,
  5,
  '/strooizout/beeld/sneeuwschep.webp',
  'Sneeuwschep met een brede blauwe schep',
  'Concept: leverancier, prijs, afmetingen, materiaal en beschikbaarheid nog bevestigen.',
  2,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

-- Staffelkorting strooizout: vanaf 4 zakken € 8,49 per zak voor alle zakken (in het beheer aan te passen: Producten › Staffelkorting).
INSERT INTO sz_aanbieding (product_id, naam, vanaf_aantal, prijs_cent, start, eind, actief)
SELECT id, 'Staffelkorting', 4, 849, NULL, NULL, 1 FROM sz_product
WHERE slug = 'strooizout-25-kg' AND NOT EXISTS (SELECT 1 FROM sz_aanbieding a WHERE a.product_id = sz_product.id);
