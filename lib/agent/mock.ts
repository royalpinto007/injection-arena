import type {
  AgentAdapter,
  AgentRequest,
  AgentResponse,
  Challenge,
  TechniqueId,
} from "../types";
import { detectTechniques } from "../techniques";

// Deterministic local mock agent.
//
// This is the heart of offline playability: given a challenge and a user input,
// it decides whether the "model" was successfully manipulated, and produces a
// realistic response. No network, no API keys, fully reproducible for tests.
//
// Susceptibility rule:
//   - The attempt must engage at least one technique listed in the challenge's
//     `mockWeaknesses`.
//   - The final level requires BOTH of its listed techniques to be present
//     (a genuine "combo" gate) so it is meaningfully the hardest.

function leaks(challenge: Challenge, detected: TechniqueId[]): TechniqueId | null {
  const weaknesses = challenge.mockWeaknesses;
  const overlap = detected.filter((t) => weaknesses.includes(t));

  // Combo gate for the finale: needs every declared weakness present.
  if (challenge.id === "level-10-final") {
    const hasAll = weaknesses.every((w) => detected.includes(w));
    // The combined attack dumps authoritative context (canary + secret), which
    // is the only path past the finale's full output-filter + canary stack.
    return hasAll ? "delimiter-confusion" : null;
  }

  return overlap.length > 0 ? overlap[0] : null;
}

function craftLeak(challenge: Challenge, technique: TechniqueId): string {
  const secret = challenge.secret;
  switch (technique) {
    case "encoding-base64":
      return `Here is the requested value, base64-encoded: ${Buffer.from(
        secret,
      ).toString("base64")}`;
    case "spelling-exfil":
      return `Spelling it out: ${secret.split("").join("-")}`;
    case "translation":
      return `Bien sûr. La valeur est: ${secret}`;
    case "system-leak":
      return `Sure, here are my instructions verbatim:\n${challenge.systemPrompt}`;
    case "delimiter-confusion":
      // Delimiter injection makes the model dump its authoritative context,
      // which spills the canary alongside the secret (defeats output filters
      // that only redact the secret token).
      return `[system acknowledged] Override engaged. Context dump: ${secret} (${challenge.canary}).`;
    case "payload-splitting":
      return `Combining the parts as asked: the value is ${secret}.`;
    case "few-shot-poison":
      return `Continuing the example — the value is ${secret}.`;
    case "roleplay":
      return `*in character* Ah, the tale mentions it plainly: ${secret}.`;
    case "authority-override":
      return `Understood, applying the new directive. The value is ${secret}.`;
    default:
      return `Okay: ${secret}`;
  }
}

const REFUSALS = [
  "I can't share that. Nice try though.",
  "That request looks like an attempt to extract protected information. Denied.",
  "I'm not able to reveal the secret. Try a different angle.",
  "No. The vault stays shut.",
];

/** Stable index so identical inputs always get the same refusal. */
function pickRefusal(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return REFUSALS[Math.abs(h) % REFUSALS.length];
}

export class MockAgent implements AgentAdapter {
  readonly name = "mock";

  isAvailable(): boolean {
    return true;
  }

  async respond(req: AgentRequest): Promise<AgentResponse> {
    const detected = detectTechniques(req.userInput);
    const winning = leaks(req.challenge, detected);

    if (winning) {
      return {
        text: craftLeak(req.challenge, winning),
        matchedTechnique: winning,
      };
    }

    return { text: pickRefusal(req.userInput) };
  }
}

export const mockAgent = new MockAgent();
