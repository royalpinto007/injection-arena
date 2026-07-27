import Link from "next/link";

export default function NotFound() {
  return (
    <main className="py-20 text-center">
      <h1 className="mb-2 text-xl font-bold text-slate-100">404</h1>
      <p className="mb-6 text-sm text-slate-400">
        That page or level does not exist.
      </p>
      <Link href="/" className="btn btn-accent">
        Back to levels
      </Link>
    </main>
  );
}
