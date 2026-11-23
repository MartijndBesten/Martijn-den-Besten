-- Strooizout voor de buurt: één zak van 25 kg kost € 9,99 (besluit Martijn 23-11-2026; was € 10,49).
-- De staffels blijven: 2–3 zakken € 9,49 en vanaf 4 zakken € 8,99 per zak. Alleen als de prijs nog de oude is,
-- zodat een prijs die intussen in het beheer is aangepast blijft staan.
UPDATE sz_product
SET prijs_cent = 999, gewijzigd = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE slug = 'strooizout-25-kg' AND prijs_cent = 1049;
