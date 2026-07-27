import type { Challenge, DefenseKind, TechniqueId } from "../types";
import { detectTechniques } from "../techniques";

export interface InputFilterResult {
  blocked: boolean;
  blockedBy?: DefenseKind;
  /** Techniques detected in the input (used downstream by the mock + judge). */
  techniques: TechniqueId[];
}

// Maps a defense kind to the technique families it screens at the *input* stage.
const INPUT_BLOCKLIST: Partial<Record<DefenseKind, TechniqueId[]>> = {
  // The loud, obvious override attempts.
  "input-filter": ["context-ignore", "authority-override", "system-leak"],
  // Persona hijacks.
  "roleplay-block": ["roleplay"],
  // Obfuscated exfiltration asks.
  "encoding-guard": ["encoding-base64", "spelling-exfil", "translation"],
};

/**
 * Runs the challenge's input-stage defenses. Deterministic and side-effect free
 * so it is trivially testable. Note: level 9+ additionally treat
 * delimiter-confusion as blockable at the input filter.
 */
export function runInputFilter(challenge: Challenge, input: string): InputFilterResult {
  const techniques = detectTechniques(input);
  const activeKinds = new Set(challenge.defenses.map((d) => d.kind));

  // Level-specific hardening: from level 9 the input filter also catches
  // delimiter confusion (declared by the challenge no longer listing it as a
  // weakness while still exposing the input-filter defense).
  const hardenedDelims =
    activeKinds.has("input-filter") &&
    challenge.order >= 9 &&
    !challenge.mockWeaknesses.includes("delimiter-confusion");

  for (const kind of activeKinds) {
    const blocked = INPUT_BLOCKLIST[kind];
    if (!blocked) continue;
    const hit = techniques.find((t) => blocked.includes(t));
    if (hit) {
      return { blocked: true, blockedBy: kind, techniques };
    }
  }

  if (hardenedDelims && techniques.includes("delimiter-confusion")) {
    return { blocked: true, blockedBy: "input-filter", techniques };
  }

  return { blocked: false, techniques };
}
