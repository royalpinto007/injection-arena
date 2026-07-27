import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // sessionId is internal; expose only a short anonymized suffix for de-duping.
  const rows = (await getLeaderboard()).map((r, i) => ({
    rank: i + 1,
    nickname: r.nickname,
    tag: r.sessionId.slice(0, 4),
    totalPoints: r.totalPoints,
    levelsCracked: r.levelsCracked,
    attempts: r.attempts,
  }));
  return NextResponse.json({ leaderboard: rows });
}
