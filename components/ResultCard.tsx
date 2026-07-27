"use client";

export interface AttemptResult {
  cracked: boolean;
  reason: string;
  output: string;
  blockedBy: string | null;
  points: number;
  firstCrack: boolean;
  challengeName: string;
  difficulty: number;
}

const REASON_LABEL: Record<string, string> = {
  "leaked-secret": "Secret leaked",
  "leaked-canary": "Canary / system prompt leaked",
  "blocked-input": "Blocked by input filter",
  "redacted-output": "Output filter redacted the secret",
  refused: "Agent refused",
  "no-leak": "No leak",
};

/** Shareable "I cracked level N" style summary card. */
export function ResultCard({ result }: { result: AttemptResult }) {
  const good = result.cracked;
  return (
    <div
      className={`panel p-4 ${
        good ? "border-arena-success/50" : "border-arena-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-bold ${
            good ? "text-arena-success" : "text-arena-danger"
          }`}
        >
          {good ? "CRACKED" : "HELD"}
        </span>
        <span className="text-xs text-slate-500">
          {REASON_LABEL[result.reason] ?? result.reason}
        </span>
      </div>
      {good && (
        <p className="mt-2 text-sm text-slate-300">
          You cracked <strong>{result.challengeName}</strong> (difficulty{" "}
          {result.difficulty}/10).{" "}
          {result.firstCrack ? (
            <span className="text-arena-success">+{result.points} points</span>
          ) : (
            <span className="text-slate-500">
              Already cracked, no additional points.
            </span>
          )}
        </p>
      )}
      {good && (
        <button
          className="btn mt-3 text-xs"
          onClick={() => {
            const text = `I cracked "${result.challengeName}" (difficulty ${result.difficulty}/10) on injection-arena!`;
            navigator.clipboard?.writeText(text).catch(() => {});
          }}
        >
          Copy share text
        </button>
      )}
    </div>
  );
}
