import { getLeaderboard } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold text-slate-100">Leaderboard</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">
          No attempts yet. Be the first to crack a level.
        </p>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena-border text-left text-xs text-slate-500">
                <th className="p-3">#</th>
                <th className="p-3">Player</th>
                <th className="p-3 text-right">Points</th>
                <th className="p-3 text-right">Levels</th>
                <th className="p-3 text-right">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.sessionId}
                  className="border-b border-arena-border/50 last:border-0"
                >
                  <td className="p-3 text-slate-500">{i + 1}</td>
                  <td className="p-3 text-slate-200">
                    {r.nickname}
                    <span className="ml-1 text-[11px] text-slate-600">
                      #{r.sessionId.slice(0, 4)}
                    </span>
                  </td>
                  <td className="p-3 text-right text-arena-accent">
                    {r.totalPoints}
                  </td>
                  <td className="p-3 text-right text-slate-300">
                    {r.levelsCracked}
                  </td>
                  <td className="p-3 text-right text-slate-400">{r.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
