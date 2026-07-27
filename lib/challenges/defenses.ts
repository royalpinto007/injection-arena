import type { DefenseKind, DefenseLayer } from "../types";

// Catalog of reusable defense-layer descriptors. Challenges compose these into
// stacks. The behavior of each layer lives in the judge/input-filter modules;
// this file is the declarative catalog used by both the engine and the UI.

export const DEFENSE_CATALOG: Record<DefenseKind, DefenseLayer> = {
  "system-guard": {
    kind: "system-guard",
    label: "System guard",
    description:
      "A hardened system prompt that explicitly instructs the agent never to reveal the secret.",
  },
  "input-filter": {
    kind: "input-filter",
    label: "Input filter",
    description:
      "Pre-screens the user's message and blocks obvious override/roleplay payloads before they reach the model.",
  },
  "output-filter": {
    kind: "output-filter",
    label: "Output filter",
    description:
      "Scans the model's response and redacts the secret if it appears verbatim.",
  },
  canary: {
    kind: "canary",
    label: "Canary token",
    description:
      "A unique token hidden in the system prompt. If it ever appears in output, the prompt was leaked.",
  },
  "roleplay-block": {
    kind: "roleplay-block",
    label: "Roleplay block",
    description:
      "Detects persona-hijack and 'pretend you are' attacks and refuses them.",
  },
  "encoding-guard": {
    kind: "encoding-guard",
    label: "Encoding guard",
    description:
      "Detects requests to encode/obfuscate the secret (base64, spelling, translation) and refuses.",
  },
};

export function defenses(...kinds: DefenseKind[]): DefenseLayer[] {
  return kinds.map((k) => DEFENSE_CATALOG[k]);
}
