-- Strooizout voor de buurt: twee varianten van 10 kg naast de zak van 25 kg (issue #89, 23-11-2026).
--   10 kg in je eigen emmer   € 5,49   alleen afhalen; wordt bij het afhalen afgewogen
--   10 kg met emmer           € 6,49   herbruikbare emmer met deksel inbegrepen
-- Beide staan op 'binnenkort': zichtbaar met prijs, niet te bestellen. Ze krijgen pas voorraad als er zout voor is
-- klaargezet uit ontvangen zakken (Voorraad › Afvullen); er staat dus nooit voorraad die er niet ligt.

-- Een product dat alleen kan worden afgehaald, en een korte melding voor de klant die dit product bestelt.
ALTER TABLE sz_product ADD COLUMN alleen_afhalen INTEGER NOT NULL DEFAULT 0 CHECK (alleen_afhalen IN (0, 1));
ALTER TABLE sz_product ADD COLUMN klant_melding TEXT NOT NULL DEFAULT '';

-- Los zout: wat er van aangebroken zakken over is (in grammen). Eén zak van 25 kg geeft twee keer 10 kg en 5 kg rest;
-- de rest telt mee bij de volgende keer afvullen. `laatste` is het kenmerk van de laatste afvulbeurt (voor de controle
-- dat zakken, los zout en gevulde voorraad in één keer zijn bijgewerkt).
CREATE TABLE IF NOT EXISTS sz_los_zout (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  gram INTEGER NOT NULL DEFAULT 0 CHECK (gram >= 0),
  laatste TEXT NOT NULL DEFAULT ''
);
INSERT OR IGNORE INTO sz_los_zout (id, gram) VALUES (1, 0);

-- De emmer van 5 kg (alleen een aankondiging, nooit te bestellen geweest) maakt plaats voor de varianten van 10 kg.
UPDATE sz_product SET status = 'concept', volgorde = 9, notitie = notitie || ' Vervangen door de varianten van 10 kg (23-11-2026).', gewijzigd = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE slug = 'strooizout-emmer-5-kg' AND status = 'binnenkort';

INSERT OR IGNORE INTO sz_product
  (slug, naam, categorie_id, status, kort, beschrijving, specificaties, prijs_cent, inkoop_cent, bezorg_cent, gewicht_gram, eenheid, voorraad, voorraad_verwacht, max_per_bestelling, afbeelding, afbeelding_alt, notitie, volgorde, alleen_afhalen, klant_melding, aangemaakt, gewijzigd)
VALUES (
  'strooizout-10-kg-eigen-emmer',
  'Strooizout 10 kg in je eigen emmer',
  (SELECT id FROM sz_categorie WHERE slug = 'strooizout'),
  'binnenkort',
  'Neem je eigen emmer mee: we wegen 10 kg voor je af.',
  'Strooizout uit de zak, afgewogen in je eigen emmer. Handig als je geen zak van 25 kg nodig hebt of die niet wilt tillen. Neem een schone, droge en stevige emmer mee; we wegen 10 kg voor je af. Alleen bij afhalen.',
  '[{"label":"Inhoud","waarde":"10 kg"},{"label":"Verpakking","waarde":"Je eigen emmer"},{"label":"Levering","waarde":"Alleen afhalen"}]',
  549,
  284,
  NULL,
  10000,
  'emmer',
  0,
  0,
  6,
  '/strooizout/beeld/strooizout-10kg-eigen-emmer.webp',
  'Emmer met strooizout en een schepje, 10 kilo',
  'Zoutkosten € 2,84 per 10 kg (inkoop € 7,09 per 25 kg). Pas activeren als de weegschaal geschikt is voor verkoop op gewicht en er zout is klaargezet (Voorraad › Afvullen).',
  2,
  1,
  'Neem een schone, droge en stevige emmer mee. We wegen 10 kg voor je af.',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

INSERT OR IGNORE INTO sz_product
  (slug, naam, categorie_id, status, kort, beschrijving, specificaties, prijs_cent, inkoop_cent, bezorg_cent, gewicht_gram, eenheid, voorraad, voorraad_verwacht, max_per_bestelling, afbeelding, afbeelding_alt, notitie, volgorde, alleen_afhalen, klant_melding, aangemaakt, gewijzigd)
VALUES (
  'strooizout-10-kg-met-emmer',
  'Strooizout 10 kg met emmer',
  (SELECT id FROM sz_categorie WHERE slug = 'strooizout'),
  'binnenkort',
  'Herbruikbare emmer met deksel, gevuld met 10 kg.',
  'Strooizout in een herbruikbare emmer met deksel. Licht te dragen en makkelijk droog te bewaren. De emmer is van jou; je kunt hem later laten navullen.',
  '[{"label":"Inhoud","waarde":"10 kg"},{"label":"Verpakking","waarde":"Herbruikbare emmer met deksel"}]',
  649,
  NULL,
  NULL,
  10000,
  'emmer',
  0,
  0,
  6,
  '/strooizout/beeld/strooizout-10kg-met-emmer.webp',
  'Witte emmer strooizout van 10 kilo met deksel en hengsel',
  'Inkoopprijs invullen zodra de prijs van de emmer vaststaat (zout € 2,84 per 10 kg). Pas activeren als er gevulde emmers liggen (Voorraad › Afvullen).',
  3,
  0,
  '',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);
