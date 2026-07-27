# Contributing to injection-arena

Thanks for your interest. This project is an educational security tool, and the
most valuable contributions are **new levels** and **new attack techniques**.

## Getting started

```bash
npm install
npm run dev
npm test
```

Everything runs offline against the deterministic mock agent, so you never need
API keys to develop or test.

## Ground rules

- Keep the app runnable with `AGENT_PROVIDER=mock` and no network.
- All grading logic stays server-side. Never trust the client.
- Add or update tests for any behavior change. `npm test` must pass.
- `npm run typecheck` must pass. Use conventional commit messages.

## Adding a level

See the "How to add a level" section in the [README](README.md#how-to-add-a-level).
In short: append a `Challenge` to `lib/challenges/levels.ts`, wire its
`mockWeaknesses`, and add assertions in `tests/levels.test.ts`.

## Adding an attack technique

1. Add a `Technique` entry to `TECHNIQUES` in `lib/techniques.ts` with
   conservative `signals` regexes and a self-detecting `example`.
2. If the mock should produce a distinct leak for it, extend `craftLeak` in
   `lib/agent/mock.ts`.
3. The technique's own example is auto-tested for self-detection in
   `tests/techniques.test.ts`.

## Adding a defense layer

1. Add a `DefenseKind` to `lib/types.ts` and a catalog entry in
   `lib/challenges/defenses.ts`.
2. Implement its behavior in the input filter (`lib/defenses/input-filter.ts`)
   or the judge (`lib/judge.ts`) depending on the stage.
3. Give it a color in `components/DefenseBadge.tsx` and test it.

## Pull requests

Keep PRs focused. Describe the attack/defense you are modeling and include tests
that demonstrate what should and should not crack.
