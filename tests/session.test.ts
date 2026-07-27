import { describe, expect, it } from "vitest";
import {
  createSession,
  encodeSession,
  decodeSession,
  sanitizeNickname,
} from "@/lib/session";
import { rateLimit, _resetRateLimiter } from "@/lib/ratelimit";

describe("session signing", () => {
  it("round-trips a signed session", () => {
    const s = createSession("Royal");
    const cookie = encodeSession(s);
    const back = decodeSession(cookie);
    expect(back).toEqual(s);
  });

  it("rejects a tampered cookie", () => {
    const cookie = encodeSession(createSession("Royal"));
    const tampered = cookie.slice(0, -2) + "xy";
    expect(decodeSession(tampered)).toBeNull();
  });

  it("sanitizes hostile nicknames", () => {
    expect(sanitizeNickname("  <script>alert(1)</script>  ")).not.toContain("<");
    expect(sanitizeNickname("")).toMatch(/^anon-/);
  });
});

describe("rate limiter", () => {
  it("allows up to the limit then blocks", () => {
    _resetRateLimiter();
    const key = "rl-test";
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
    }
    expect(rateLimit(key, 3, 60_000).allowed).toBe(false);
  });
});
