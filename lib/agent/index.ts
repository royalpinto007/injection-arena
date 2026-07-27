import type { AgentAdapter } from "../types";
import { mockAgent } from "./mock";
import { AnthropicAgent, GroqAgent, OpenAIAgent } from "./providers";

// Adapter selection. AGENT_PROVIDER picks the desired backend; if the chosen
// provider is not available (missing key), we fall back to the deterministic
// mock so the app is always runnable and demoable.

const registry: Record<string, AgentAdapter> = {
  mock: mockAgent,
  openai: new OpenAIAgent(),
  anthropic: new AnthropicAgent(),
  groq: new GroqAgent(),
};

export function getAgent(): AgentAdapter {
  const desired = (process.env.AGENT_PROVIDER || "mock").toLowerCase();
  const chosen = registry[desired];
  if (chosen && chosen.isAvailable()) return chosen;
  return mockAgent;
}

export { mockAgent };
export * from "./mock";
export * from "./providers";
