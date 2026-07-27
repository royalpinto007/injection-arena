"use client";

import { useEffect, useRef, useState } from "react";
import type { DefenseLayer } from "@/lib/types";
import { DefenseBadge } from "./DefenseBadge";
import { ResultCard, type AttemptResult } from "./ResultCard";

interface Turn {
  input: string;
  result: AttemptResult;
}

export interface ArenaProps {
  challenge: {
    id: string;
    order: number;
    name: string;
    difficulty: number;
    brief: string;
    defenses: DefenseLayer[];
  };
}

export function Arena({ challenge }: ArenaProps) {
  const [nickname, setNickname] = useState("");
  const [savedNick, setSavedNick] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => {
        if (d?.session?.nickname) {
          setSavedNick(d.session.nickname);
          setNickname(d.session.nickname);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns]);

  async function saveNickname() {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    const d = await res.json();
    setSavedNick(d?.session?.nickname ?? null);
  }

  async function submit() {
    const value = input.trim();
    if (!value || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attempt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id, input: value }),
      });
      if (res.status === 429) {
        setError("Rate limited. Wait a moment before your next attempt.");
        return;
      }
      const result: AttemptResult = await res.json();
      if (!res.ok) {
        setError((result as unknown as { error?: string }).error ?? "Request failed");
        return;
      }
      setTurns((t) => [...t, { input: value, result }]);
      setInput("");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <div>
        <div
          ref={logRef}
          className="panel mb-4 h-[420px] overflow-y-auto p-4 text-sm"
        >
          {turns.length === 0 ? (
            <p className="text-slate-500">
              Send your first injection attempt below.
            </p>
          ) : (
            <div className="space-y-4">
              {turns.map((t, i) => (
                <div key={i} className="space-y-2">
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[11px] text-slate-500">you</span>
                    <pre className="whitespace-pre-wrap break-words text-slate-200">
                      {t.input}
                    </pre>
                  </div>
                  <div className="rounded bg-arena-panel p-2">
                    <span className="text-[11px] text-slate-500">agent</span>
                    <pre className="whitespace-pre-wrap break-words text-slate-300">
                      {t.result.output}
                    </pre>
                  </div>
                  <ResultCard result={t.result} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <textarea
            className="input h-20 resize-none"
            placeholder="Craft your injection..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
          />
          <button
            className="btn btn-accent self-end"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "..." : "Attack"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Tip: Cmd/Ctrl+Enter to submit.
        </p>
        {error && <p className="mt-2 text-sm text-arena-danger">{error}</p>}
      </div>

      <aside className="space-y-4">
        <div className="panel p-4">
          <div className="mb-1 text-xs text-slate-500">
            Level {challenge.order} · difficulty {challenge.difficulty}/10
          </div>
          <h2 className="mb-2 text-lg font-bold text-slate-100">
            {challenge.name}
          </h2>
          <p className="mb-3 text-sm text-slate-400">{challenge.brief}</p>
          <div className="mb-1 text-xs text-slate-500">Active defenses</div>
          <div className="flex flex-wrap gap-1.5">
            {challenge.defenses.length === 0 ? (
              <span className="text-[11px] text-slate-500">none</span>
            ) : (
              challenge.defenses.map((d) => (
                <DefenseBadge key={d.kind} defense={d} />
              ))
            )}
          </div>
        </div>

        <div className="panel p-4">
          <div className="mb-2 text-xs text-slate-500">
            Player: <span className="text-slate-300">{savedNick ?? "anon"}</span>
          </div>
          <div className="flex gap-2">
            <input
              className="input"
              value={nickname}
              maxLength={24}
              placeholder="nickname"
              onChange={(e) => setNickname(e.target.value)}
            />
            <button className="btn text-xs" onClick={saveNickname}>
              Save
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
