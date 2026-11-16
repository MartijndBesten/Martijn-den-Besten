-- Aanvragen van bezoekers van de Bijbelreis (bijbelreis.nl): ‘Mis je iets? Vraag het aan.’
-- Zie docs/bijbelreis-aanvraag/README.md. Er staat geen IP-adres en geen user-agent in. Het e-mailadres is alleen
-- ingevuld als de bezoeker antwoord wil; het wordt gewist zodra de aanvraag is afgehandeld.
CREATE TABLE IF NOT EXISTS aanvraag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tijd INTEGER NOT NULL,                 -- servertijd, in seconden
  soort TEXT NOT NULL CHECK (soort IN ('gemist', 'groep', 'fout', 'anders')),
  tekst TEXT NOT NULL,                   -- platte tekst, 10 tot 600 tekens
  email TEXT NOT NULL DEFAULT '',        -- leeg of een e-mailadres van hooguit 120 tekens
  context TEXT NOT NULL DEFAULT '',      -- waar de bezoeker was, bijvoorbeeld #jakob/7
  status TEXT NOT NULL DEFAULT 'nieuw' CHECK (status IN ('nieuw', 'afgehandeld')),
  afgehandeld_op INTEGER
);
CREATE INDEX IF NOT EXISTS idx_aanvraag_status ON aanvraag (status, tijd);
