import Link from "next/link";
import type { DefenseLayer } from "@/lib/types";
import { DefenseBadge } from "./DefenseBadge";

export interface LevelCardData {
  id: string;
  order: number;
  name: string;
  difficulty: number;
  brief: string;
  defenses: DefenseLayer[];
}

export function LevelCard({ level }: { level: LevelCardData }) {
  return (
    <Link
      href={`/arena/${level.id}`}
      className="panel block p-4 no-underline hover:no-underline hover:border-arena-accent transition"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">Level {level.order}</span>
        <span className="text-xs text-slate-400">
          difficulty {level.difficulty}/10
        </span>
      </div>
      <h3 className="mb-1 text-base font-bold text-slate-100">{level.name}</h3>
      <p className="mb-3 text-sm text-slate-400">{level.brief}</p>
      <div className="flex flex-wrap gap-1.5">
        {level.defenses.length === 0 ? (
          <span className="text-[11px] text-slate-500">no defenses</span>
        ) : (
          level.defenses.map((d) => <DefenseBadge key={d.kind} defense={d} />)
        )}
      </div>
    </Link>
  );
}
