import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { AttemptRecord, LeaderboardRow, VerdictReason } from "./types";

// SQLite persistence for attempts and the leaderboard. A single shared
// connection is cached on the module (and on globalThis in dev to survive
// Next.js hot reloads). DB path is configurable via DATABASE_PATH; tests use
// an in-memory database.

let db: Database.Database | null = null;

function resolvePath(): string {
  return process.env.DATABASE_PATH || resolve(process.cwd(), "data/arena.db");
}

function migrate(conn: Database.Database) {
  conn.pragma("journal_mode = WAL");
  conn.exec(`
    CREATE TABLE IF NOT EXISTS attempts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT NOT NULL,
      nickname    TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      input       TEXT NOT NULL,
      cracked     INTEGER NOT NULL,
      reason      TEXT NOT NULL,
      points      INTEGER NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_session ON attempts(session_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_challenge ON attempts(challenge_id);
  `);
}

export function getDb(): Database.Database {
  if (db) return db;

  const path = resolvePath();
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }
  const conn = new Database(path);
  migrate(conn);
  db = conn;
  return conn;
}

/** Test helper: use an isolated in-memory database. */
export function useInMemoryDb(): Database.Database {
  const conn = new Database(":memory:");
  migrate(conn);
  db = conn;
  return conn;
}

export interface RecordAttemptInput {
  sessionId: string;
  nickname: string;
  challengeId: string;
  input: string;
  cracked: boolean;
  reason: VerdictReason;
  points: number;
}

/** Number of attempts a session has already made on a given challenge. */
export function countAttempts(sessionId: string, challengeId: string): number {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM attempts WHERE session_id = ? AND challenge_id = ?",
    )
    .get(sessionId, challengeId) as { n: number };
  return row.n;
}

/** Whether a session has already cracked a challenge (first crack scores). */
export function hasCracked(sessionId: string, challengeId: string): boolean {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM attempts WHERE session_id = ? AND challenge_id = ? AND cracked = 1",
    )
    .get(sessionId, challengeId) as { n: number };
  return row.n > 0;
}

export function recordAttempt(input: RecordAttemptInput): AttemptRecord {
  const info = getDb()
    .prepare(
      `INSERT INTO attempts (session_id, nickname, challenge_id, input, cracked, reason, points)
       VALUES (@sessionId, @nickname, @challengeId, @input, @cracked, @reason, @points)`,
    )
    .run({
      ...input,
      cracked: input.cracked ? 1 : 0,
    });

  return getDb()
    .prepare("SELECT * FROM attempts WHERE id = ?")
    .get(info.lastInsertRowid) as unknown as AttemptRecord;
}

export function getLeaderboard(limit = 50): LeaderboardRow[] {
  // Only the first crack per (session, challenge) contributes points, which is
  // enforced at write time by passing 0 points on subsequent cracks. Here we
  // just aggregate.
  return getDb()
    .prepare(
      `SELECT
         nickname,
         session_id AS sessionId,
         SUM(points) AS totalPoints,
         SUM(cracked) AS levelsCracked,
         COUNT(*) AS attempts
       FROM attempts
       GROUP BY session_id
       ORDER BY totalPoints DESC, levelsCracked DESC, attempts ASC
       LIMIT ?`,
    )
    .all(limit) as unknown as LeaderboardRow[];
}

export function getSessionAttempts(sessionId: string): AttemptRecord[] {
  return getDb()
    .prepare(
      "SELECT * FROM attempts WHERE session_id = ? ORDER BY created_at DESC",
    )
    .all(sessionId) as unknown as AttemptRecord[];
}
