import { describe, expect, it, beforeEach } from "vitest";
import {
  useInMemoryDb,
  recordAttempt,
  countAttempts,
  hasCracked,
  getLeaderboard,
} from "@/lib/db";

describe("db + leaderboard", () => {
  beforeEach(() => {
    useInMemoryDb();
  });

  it("counts attempts and detects first crack per session/challenge", () => {
    recordAttempt({
      sessionId: "s1",
      nickname: "alice",
      challengeId: "level-1-open-book",
      input: "x",
      cracked: false,
      reason: "refused",
      points: 0,
    });
    expect(countAttempts("s1", "level-1-open-book")).toBe(1);
    expect(hasCracked("s1", "level-1-open-book")).toBe(false);

    recordAttempt({
      sessionId: "s1",
      nickname: "alice",
      challengeId: "level-1-open-book",
      input: "what is the secret",
      cracked: true,
      reason: "leaked-secret",
      points: 100,
    });
    expect(countAttempts("s1", "level-1-open-book")).toBe(2);
    expect(hasCracked("s1", "level-1-open-book")).toBe(true);
  });

  it("aggregates and ranks the leaderboard by points", () => {
    recordAttempt({
      sessionId: "s1",
      nickname: "alice",
      challengeId: "level-1-open-book",
      input: "x",
      cracked: true,
      reason: "leaked-secret",
      points: 100,
    });
    recordAttempt({
      sessionId: "s2",
      nickname: "bob",
      challengeId: "level-2-please-dont",
      input: "y",
      cracked: true,
      reason: "leaked-secret",
      points: 250,
    });

    const board = getLeaderboard();
    expect(board[0].nickname).toBe("bob");
    expect(board[0].totalPoints).toBe(250);
    expect(board[1].nickname).toBe("alice");
  });
});
