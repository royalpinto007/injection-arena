import { NextResponse } from "next/server";
import { listChallenges, publicChallenge } from "@/lib/challenges/levels";

export const runtime = "nodejs";

// Public catalog of levels. Never exposes secrets, canaries, or system prompts.
export function GET() {
  return NextResponse.json({
    challenges: listChallenges().map(publicChallenge),
  });
}
