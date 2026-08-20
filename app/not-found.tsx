import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24">
      <h1 className="font-display text-3xl font-semibold">No jar here</h1>
      <p className="mt-3 text-muted">
        That link doesn&rsquo;t match a starter. Check the URL, or start a fresh log.
      </p>
      <Link href="/" className="mt-6 inline-block text-crust underline underline-offset-4">
        Start a new starter
      </Link>
    </div>
  );
}
