import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  createSession,
  decodeSession,
  encodeSession,
  type Session,
} from "./session";

// Route-handler helpers for reading/writing the signed session cookie.

export function readSession(): Session | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  return decodeSession(raw);
}

/** Returns the current session, creating an anonymous one if none exists. */
export function ensureSession(defaultNickname = "anon"): Session {
  const existing = readSession();
  if (existing) return existing;
  const session = createSession(defaultNickname);
  writeSession(session);
  return session;
}

export function writeSession(session: Session): void {
  cookies().set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
