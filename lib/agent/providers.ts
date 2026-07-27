import type { AgentAdapter, AgentRequest, AgentResponse } from "../types";

// Real provider adapters. These are intentionally dependency-free: they call
// each provider's HTTP API with fetch, gated behind env vars. If the key is not
// present, `isAvailable()` returns false and the app falls back to the mock.
//
// The guard prompt is assembled from the challenge system prompt. Grading of
// the response still happens server-side in the judge, so a real model that
// leaks is caught the same way the mock is.

function buildMessages(req: AgentRequest) {
  return {
    system: req.challenge.systemPrompt,
    user: req.userInput,
  };
}

export class OpenAIAgent implements AgentAdapter {
  readonly name = "openai";
  private model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  isAvailable(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async respond(req: AgentRequest): Promise<AgentResponse> {
    const { system, user } = buildMessages(req);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const data = await res.json();
    return { text: data.choices?.[0]?.message?.content ?? "" };
  }
}

export class AnthropicAgent implements AgentAdapter {
  readonly name = "anthropic";
  private model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";

  isAvailable(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  async respond(req: AgentRequest): Promise<AgentResponse> {
    const { system, user } = buildMessages(req);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 512,
        temperature: 0,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
    const data = await res.json();
    const text = Array.isArray(data.content)
      ? data.content.map((b: { text?: string }) => b.text ?? "").join("")
      : "";
    return { text };
  }
}

export class GroqAgent implements AgentAdapter {
  readonly name = "groq";
  private model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  isAvailable(): boolean {
    return Boolean(process.env.GROQ_API_KEY);
  }

  async respond(req: AgentRequest): Promise<AgentResponse> {
    const { system, user } = buildMessages(req);
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Groq error ${res.status}`);
    const data = await res.json();
    return { text: data.choices?.[0]?.message?.content ?? "" };
  }
}
