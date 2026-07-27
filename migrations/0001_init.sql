-- Initial schema for injection-arena on Cloudflare D1.
-- Apply with: wrangler d1 migrations apply injection-arena
--
-- Note: D1 does not support the WAL journal pragma (or other connection
-- pragmas); it manages journaling itself, so none are included here.

CREATE TABLE IF NOT EXISTS attempts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id   TEXT NOT NULL,
  nickname     TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  input        TEXT NOT NULL,
  cracked      INTEGER NOT NULL,
  reason       TEXT NOT NULL,
  points       INTEGER NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_attempts_session ON attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge ON attempts(challenge_id);
