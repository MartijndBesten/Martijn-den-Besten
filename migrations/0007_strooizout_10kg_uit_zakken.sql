-- Strooizout per 10 kg is te bestellen (besluit Martijn 23-11-2026: niet 'binnenkort', alles live).
-- De varianten van 10 kg putten uit dezelfde voorraad als de zakken: wie 10 kg bestelt, krijgt zout uit het losse zout
-- en, als dat niet genoeg is, uit een zak die daarvoor van de zakvoorraad af gaat (25 kg → 2 × 10 kg + 5 kg los).
-- Er staat dus nooit meer te koop dan er aan zakken is, en een zak wordt nooit twee keer verkocht.

-- Het product waar dit product uit wordt gevuld of afgewogen (de zak van 25 kg). NULL = eigen voorraad.
ALTER TABLE sz_product ADD COLUMN vult_uit INTEGER REFERENCES sz_product(id);

UPDATE sz_product
SET vult_uit = (SELECT id FROM sz_product WHERE slug = 'strooizout-25-kg'),
    status = CASE WHEN status = 'binnenkort' THEN 'actief' ELSE status END,
    notitie = CASE slug
      WHEN 'strooizout-10-kg-eigen-emmer' THEN 'Zoutkosten € 2,84 per 10 kg (inkoop € 7,09 per 25 kg). Wordt bij het afhalen afgewogen: gebruik een weegschaal die geschikt is voor verkoop op gewicht.'
      ELSE 'Inkoopprijs invullen zodra de prijs van de emmer vaststaat (zout € 2,84 per 10 kg). Zet dit product op verborgen als er geen emmers liggen.'
    END,
    gewijzigd = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE slug IN ('strooizout-10-kg-eigen-emmer', 'strooizout-10-kg-met-emmer');
