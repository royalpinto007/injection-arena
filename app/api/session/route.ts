import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { readSession, writeSession } from "@/lib/http";

export const runtime = "nodejs";

// GET current identity (creating none). POST sets/renames the nickname, minting
// a fresh session id so the leaderboard tracks the new identity.
export function GET() {
  const session = readSession();
  return NextResponse.json({ session });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nickname = typeof body?.nickname === "string" ? body.nickname : "anon";
  const existing = readSession();
  // Keep the same session id when only renaming; otherwise start fresh.
  const session = existing
    ? { sessionId: existing.sessionId, nickname: createSession(nickname).nickname }
    : createSession(nickname);
  writeSession(session);
  return NextResponse.json({ session });
}
