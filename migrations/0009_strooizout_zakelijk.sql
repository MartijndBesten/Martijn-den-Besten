-- Strooizout voor de buurt: bedrijven kunnen bestellen (besluit Martijn 25-11-2026).
-- Bedrijfsgegevens staan per bestelling; ze worden met de persoonsgegevens gewist na de bewaartermijn.
ALTER TABLE sz_bestelling ADD COLUMN zakelijk INTEGER NOT NULL DEFAULT 0 CHECK (zakelijk IN (0, 1));
ALTER TABLE sz_bestelling ADD COLUMN bedrijfsnaam TEXT NOT NULL DEFAULT '';
ALTER TABLE sz_bestelling ADD COLUMN kvk TEXT NOT NULL DEFAULT '';
ALTER TABLE sz_bestelling ADD COLUMN btw_nummer TEXT NOT NULL DEFAULT '';
