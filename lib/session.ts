import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Lightweight per-player identity with no auth. A session id + nickname are
// packed into a signed cookie value so the server can trust the identity
// without a login. The signing secret comes from SESSION_SECRET (falls back to
// a dev-only constant).

export interface Session {
  sessionId: string;
  nickname: string;
}

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
export const COOKIE_NAME = "arena_session";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/** Encodes a session into a signed cookie value: base64(payload).sig */
export function encodeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Verifies and decodes a signed cookie value. Returns null if invalid. */
export function decodeSession(value: string | undefined): Session | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof parsed?.sessionId === "string" && typeof parsed?.nickname === "string") {
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}

/** Creates a fresh session with a random id. */
export function createSession(nickname: string): Session {
  const clean = sanitizeNickname(nickname);
  return { sessionId: randomBytes(12).toString("hex"), nickname: clean };
}

export function sanitizeNickname(nickname: string): string {
  const trimmed = (nickname || "").trim().slice(0, 24);
  const safe = trimmed.replace(/[^\w \-.]/g, "");
  return safe || `anon-${randomBytes(3).toString("hex")}`;
}
