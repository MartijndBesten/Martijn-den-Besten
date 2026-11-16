-- Bezoekmeting van de Bijbelreis (bijbelreis.nl): één rij per geladen pagina. Zie docs/bijbelreis-bezoek/README.md.
-- Er staat geen IP-adres, geen user-agent, geen cookie en geen account in. `id` maakt de browser per paginalading
-- willekeurig aan (alleen in het geheugen). `bezoeker` is een per dag wisselende HMAC van IP + user-agent + dag met een
-- geheime sleutel: niet terug te rekenen en niet tussen dagen te koppelen; alleen om het aantal verschillende bezoekers
-- per dag te schatten.
CREATE TABLE IF NOT EXISTS bezoek (
  id TEXT PRIMARY KEY,
  dag TEXT NOT NULL,                 -- kalenderdag in Nederland, JJJJ-MM-DD
  begin INTEGER NOT NULL,            -- servertijd van de eerste melding, in seconden
  duur INTEGER NOT NULL DEFAULT 0,   -- seconden dat de pagina zichtbaar was (hooguit vier uur)
  bezoeker TEXT NOT NULL DEFAULT '',
  pagina TEXT NOT NULL CHECK (pagina IN ('atlas', 'boekje')),
  apparaat TEXT NOT NULL CHECK (apparaat IN ('telefoon', 'tablet', 'desktop')),
  herkomst TEXT NOT NULL DEFAULT 'direct', -- alleen de hostnaam van de verwijzende site, of 'direct'
  stappen INTEGER NOT NULL DEFAULT 0 -- aantal reisstappen dat in dit bezoek is geopend
);
CREATE INDEX IF NOT EXISTS idx_bezoek_dag ON bezoek (dag);
