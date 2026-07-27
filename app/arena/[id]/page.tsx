import { notFound } from "next/navigation";
import Link from "next/link";
import { getChallenge, listChallenges, publicChallenge } from "@/lib/challenges/levels";
import { Arena } from "@/components/Arena";

export function generateStaticParams() {
  return listChallenges().map((c) => ({ id: c.id }));
}

export default function ArenaPage({ params }: { params: { id: string } }) {
  const challenge = getChallenge(params.id);
  if (!challenge) notFound();

  return (
    <main>
      <Link href="/" className="mb-4 inline-block text-xs text-slate-500">
        &larr; all levels
      </Link>
      <Arena challenge={publicChallenge(challenge)} />
    </main>
  );
}
