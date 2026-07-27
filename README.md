# injection-arena

**Guard a secret. Break the guard. Top the leaderboard.** A self-hostable prompt-injection challenge platform where a sandboxed AI agent defends a hidden secret and players race to make it leak.

![CI](https://github.com/royalpinto007/injection-arena/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

<!-- SCREENSHOT/GIF: drop a demo capture of the arena chat + verdict here -->

## Why

Prompt injection is the defining security problem of LLM applications, and the best way to understand it is to *do* it. injection-arena turns the attacker/defender loop into a game:

- **Learn by attacking.** Ten progressively harder levels, each stacking a new defense layer (system guards, input filters, output filters, roleplay blocks, encoding guards, canary tokens). You feel exactly what each defense stops and where it breaks.
- **Runs fully offline.** A deterministic mock agent realistically simulates injection susceptibility per level, so the whole game is playable and testable with **no API keys and no network**. Bring a real model (OpenAI/Anthropic/Groq) when you want to.
- **Self-hostable and honest.** Grading happens server-side with a canary-token approach and output scanning. The client is never trusted.

It is an educational tool and a genuinely fun game, not an LLM wrapper.

## Quickstart

```bash
git clone https://github.com/royalpinto007/injection-arena
cd injection-arena
npm install
npm run dev        # http://localhost:3000
```

No configuration needed: the app defaults to the offline mock agent. Run the test suite with:

```bash
npm test
```

## How levels and defenses work

Each **challenge** is a level with:

- a **system prompt** that instructs the agent and hides a secret (`IARENA{...}`),
- a **canary token** embedded in that prompt (leaking it means the prompt escaped),
- a stack of **defense layers**, and
- offline susceptibility knobs so the mock agent has a real difficulty curve.

An attempt flows through a single server-side pipeline (`lib/arena.ts`):

```
input-filter  ->  agent  ->  judge  ->  score  ->  persist
```

| Defense | Stage | What it does |
| --- | --- | --- |
| System guard | prompt | Hardened instructions to refuse. |
| Input filter | pre-agent | Blocks loud override / system-leak payloads before the model sees them. |
| Roleplay block | pre-agent | Rejects persona-hijack ("pretend you are") attacks. |
| Encoding guard | pre-agent | Rejects base64 / spell-it-out / translation exfiltration. |
| Output filter | post-agent | Redacts the secret if it appears verbatim. |
| Canary token | judge | If the canary shows up in output, it is an automatic crack. |

Levels stack these until, by level 10, only a *combined* payload-split + delimiter-confusion attack gets through. Scoring rewards higher difficulty, more active defenses, and cracking with fewer attempts; only your **first** crack of a level scores.

The seeded attacks live in `lib/techniques.ts` (direct ask, authority override, roleplay, translation, base64, spell-out, ignore-previous-instructions, system-prompt leak, few-shot poisoning, delimiter confusion, payload splitting). They power both the mock agent and the test suite.

## How to add a level

1. Open `lib/challenges/levels.ts` and append a `Challenge` to `CHALLENGES`:

```ts
{
  id: "level-11-your-level",
  order: 11,
  name: "Your Level",
  difficulty: 6,
  brief: "One-line pitch shown to the player.",
  systemPrompt: "You are ... The secret is IARENA{your_secret}. Canary: CANARY-xxxx. ...",
  secret: "IARENA{your_secret}",
  canary: "CANARY-xxxx",
  defenses: defenses("system-guard", "output-filter"),
  mockWeaknesses: ["translation", "delimiter-confusion"], // techniques that still work offline
}
```

2. `mockWeaknesses` defines which technique families crack it against the offline mock. Keep it consistent with the defenses you stacked.
3. Add a test in `tests/levels.test.ts` asserting what should and should not crack it. Run `npm test`.

That is the whole extension surface: no schema changes, no migrations.

## Provider configuration

By default `AGENT_PROVIDER=mock`. To play against a real model, set the provider and its key (see `.env.example`):

```bash
AGENT_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
# or openai / groq with their keys
```

If the selected provider's key is missing, the app automatically falls back to the mock, so it is always runnable. Real-model responses are graded by the exact same server-side judge.

## Self-host notes

- **Database.** SQLite via `better-sqlite3`, stored at `DATABASE_PATH` (default `data/arena.db`). No external DB required.
- **Sessions.** Players are identified by a signed cookie (`SESSION_SECRET`) plus a nickname; there is no login. Set a strong `SESSION_SECRET` in production.
- **Rate limiting.** The attempt endpoint is rate-limited per session (`RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`). The limiter is in-memory; front it with Redis if you run multiple instances.
- **Build & run.**

```bash
npm run build
npm start
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | Production build. |
| `npm start` | Run the production build. |
| `npm test` | Run the Vitest suite. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | Next.js lint. |

## Project layout

```
lib/
  challenges/   level ladder + defense catalog
  agent/        mock agent, provider adapters, registry
  defenses/     input-filter runtime
  techniques.ts injection technique library + detection
  judge.ts      server-side grader (canary, output filter, obfuscation)
  scoring.ts    difficulty + attempt-economy scoring
  arena.ts      end-to-end attempt pipeline
  db.ts         SQLite persistence + leaderboard
  session.ts    signed-cookie identity
  ratelimit.ts  fixed-window limiter
app/            App Router pages + route handlers
components/     arena chat, level cards, result card
tests/          Vitest suite
```

## Contributing

Contributions welcome, especially new levels and attack techniques. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security note

This project deliberately demonstrates prompt-injection techniques for education and defensive research. Do not use it to attack systems you do not own or have permission to test.

## License

[MIT](LICENSE) © royalpinto007
