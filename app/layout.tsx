import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "injection-arena",
  description:
    "A self-hostable prompt-injection challenge platform. Guard a secret, break the guard, top the leaderboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-arena-accent no-underline hover:no-underline">
              injection<span className="text-slate-200">-arena</span>
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/">Levels</Link>
              <Link href="/leaderboard">Leaderboard</Link>
              <a
                href="https://github.com/AgentPostmortem/injection-arena"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </nav>
          </header>
          {children}
          <footer className="mt-16 border-t border-arena-border pt-4 text-xs text-slate-500">
            injection-arena is an educational security tool. MIT licensed.
          </footer>
        </div>
      </body>
    </html>
  );
}
