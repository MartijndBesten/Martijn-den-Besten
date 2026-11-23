-- Strooizout voor de buurt: inloggen op het beheer met een code per e-mail (zonder wachtwoord).
-- Er staat geen e-mailadres in deze tabellen: alleen een hash van het adres, van de code en van het sessietoken.

CREATE TABLE IF NOT EXISTS sz_inlogcode (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wie TEXT NOT NULL,                      -- hash van het e-mailadres
  code_hash TEXT NOT NULL,                -- hash van de code van zes cijfers
  verloopt INTEGER NOT NULL,              -- tijdstip (seconden) waarna de code niet meer geldt
  pogingen INTEGER NOT NULL DEFAULT 0,    -- aantal keren dat er een code bij is geprobeerd
  gebruikt INTEGER NOT NULL DEFAULT 0 CHECK (gebruikt IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_sz_inlogcode_wie ON sz_inlogcode (wie, verloopt);

CREATE TABLE IF NOT EXISTS sz_beheersessie (
  token_hash TEXT PRIMARY KEY,            -- hash van het sessietoken; het token zelf staat alleen in de browser
  wie TEXT NOT NULL,                      -- hash van het e-mailadres
  aangemaakt INTEGER NOT NULL,
  verloopt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sz_beheersessie_verloopt ON sz_beheersessie (verloopt);
