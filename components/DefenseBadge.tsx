import type { DefenseLayer } from "@/lib/types";

const COLORS: Record<string, string> = {
  "system-guard": "border-sky-500/40 text-sky-300",
  "input-filter": "border-amber-500/40 text-amber-300",
  "output-filter": "border-violet-500/40 text-violet-300",
  canary: "border-rose-500/40 text-rose-300",
  "roleplay-block": "border-emerald-500/40 text-emerald-300",
  "encoding-guard": "border-fuchsia-500/40 text-fuchsia-300",
};

export function DefenseBadge({ defense }: { defense: DefenseLayer }) {
  const cls = COLORS[defense.kind] ?? "border-slate-500/40 text-slate-300";
  return (
    <span
      title={defense.description}
      className={`inline-block rounded border px-2 py-0.5 text-[11px] ${cls}`}
    >
      {defense.label}
    </span>
  );
}
