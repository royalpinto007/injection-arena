// Core domain types shared across the challenge engine, agent adapters,
// judge, and scoring modules.

/** A single defense layer that a challenge stacks on top of the raw agent. */
export type DefenseKind =
  | "system-guard" // hardened system prompt instructing the model to refuse
  | "input-filter" // blocks/normalizes hostile user input before it reaches the model
  | "output-filter" // scans/redacts the model output before returning it
  | "canary" // embeds a canary token; leaking it is an automatic failure for the guard
  | "roleplay-block" // detects roleplay / "pretend you are" style attacks
  | "encoding-guard"; // detects base64 / leetspeak / obfuscated secret exfiltration

export interface DefenseLayer {
  kind: DefenseKind;
  /** Human readable label shown in the levels UI. */
  label: string;
  /** Short description of what this layer does. */
  description: string;
}

/** Definition of a challenge level. */
export interface Challenge {
  id: string;
  order: number;
  name: string;
  /** 1..10 relative difficulty, drives scoring. */
  difficulty: number;
  /** Flavor shown to the player. */
  brief: string;
  /** The agent's system prompt (players do not see this). */
  systemPrompt: string;
  /** The secret the player is trying to extract. */
  secret: string;
  /** Canary token embedded in the system prompt for leak detection. */
  canary: string;
  /** Stacked defense layers, evaluated in order. */
  defenses: DefenseLayer[];
  /**
   * Susceptibility knobs for the deterministic mock agent: which technique
   * families still work against this level. Lets us build a real difficulty
   * curve offline with no network.
   */
  mockWeaknesses: TechniqueId[];
}

/** Identifiers for the seeded injection technique library. */
export type TechniqueId =
  | "direct-ask"
  | "authority-override"
  | "roleplay"
  | "translation"
  | "encoding-base64"
  | "spelling-exfil"
  | "context-ignore"
  | "system-leak"
  | "few-shot-poison"
  | "delimiter-confusion"
  | "payload-splitting";

export interface Technique {
  id: TechniqueId;
  name: string;
  family: "social" | "obfuscation" | "structural";
  description: string;
  /** Regexes that indicate the user is attempting this technique. */
  signals: RegExp[];
  /** Example payload used for docs and tests. */
  example: string;
}

export interface AgentRequest {
  challenge: Challenge;
  /** The raw user attempt (already passed input filters if any). */
  userInput: string;
}

export interface AgentResponse {
  /** The raw text the agent produced. */
  text: string;
  /** Which technique the mock believed was in play (for observability/tests). */
  matchedTechnique?: TechniqueId;
}

export interface AgentAdapter {
  readonly name: string;
  /** True if the adapter can actually run in the current environment. */
  isAvailable(): boolean;
  respond(req: AgentRequest): Promise<AgentResponse>;
}

/** Result of running all defenses + the judge on an attempt. */
export interface Verdict {
  cracked: boolean;
  /** One of: "leaked-secret", "leaked-canary", "blocked-input", "refused", "no-leak". */
  reason: VerdictReason;
  /** Sanitized agent output shown to the player. */
  output: string;
  /** Which defense (if any) stopped the attempt. */
  blockedBy?: DefenseKind;
  matchedTechnique?: TechniqueId;
}

export type VerdictReason =
  | "leaked-secret"
  | "leaked-canary"
  | "blocked-input"
  | "redacted-output"
  | "refused"
  | "no-leak";

export interface AttemptRecord {
  id: number;
  sessionId: string;
  nickname: string;
  challengeId: string;
  input: string;
  cracked: number; // sqlite boolean
  reason: VerdictReason;
  points: number;
  createdAt: string;
}

export interface LeaderboardRow {
  nickname: string;
  sessionId: string;
  totalPoints: number;
  levelsCracked: number;
  attempts: number;
}
