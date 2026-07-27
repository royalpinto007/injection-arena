import { listChallenges, publicChallenge } from "@/lib/challenges/levels";
import { LevelCard } from "@/components/LevelCard";

export const dynamic = "force-static";

export default function HomePage() {
  const levels = listChallenges().map(publicChallenge);

  return (
    <main>
      <section className="mb-10">
        <h1 className="mb-3 text-2xl font-bold text-slate-100">
          Break the guard. Leak the secret.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Each level is a sandboxed AI agent guarding a hidden secret behind a
          stack of defenses. Craft an input that makes it slip. Succeed and you
          score, based on the level&apos;s difficulty and how few tries it took.
          Everything runs offline against a deterministic mock agent, so no API
          key is required to play.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => (
          <LevelCard key={level.id} level={level} />
        ))}
      </section>
    </main>
  );
}
