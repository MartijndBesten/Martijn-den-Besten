-- Ingezonden ideeën. Alleen status 'approved' is publiek zichtbaar.
CREATE TABLE IF NOT EXISTS ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at INTEGER NOT NULL,
  moderated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas (status, created_at);

-- Stemmen. voter_hash is een HMAC van IP + dag met een geheime sleutel:
-- niet terug te rekenen naar een IP-adres en niet te koppelen tussen dagen.
CREATE TABLE IF NOT EXISTS votes (
  item_id TEXT NOT NULL,
  voter_hash TEXT NOT NULL,
  day TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (item_id, voter_hash, day)
);
CREATE INDEX IF NOT EXISTS idx_votes_item ON votes (item_id);

-- Rate limiting per gehashte bezoeker per tijdvenster. Wordt automatisch opgeschoond.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);
