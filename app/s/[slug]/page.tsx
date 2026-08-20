import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteFeeding } from "@/app/actions";
import CopyLink from "@/components/CopyLink";
import FeedingForm from "@/components/FeedingForm";
import LocalTime from "@/components/LocalTime";
import PeakClock from "@/components/PeakClock";
import { computeStats, fmtDuration } from "@/lib/stats";
import { getStarter } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/s/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const record = await getStarter(slug);
  if (!record) return { title: "Starter not found", robots: { index: false } };

  return {
    title: record.starter.name,
    description: `Feeding log for ${record.starter.name}, a ${record.starter.hydration}% hydration ${record.starter.flour} sourdough starter.`,
    // A starter's link is its only credential — keep it out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function StarterPage({ params }: PageProps<"/s/[slug]">) {
  const { slug } = await params;
  const record = await getStarter(slug);
  if (!record) notFound();

  const { starter, feedings } = record;
  const stats = computeStats(feedings);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {starter.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {starter.flour} · {starter.hydration}% hydration · {stats.total}{" "}
            {stats.total === 1 ? "feeding" : "feedings"} logged
          </p>
        </div>
        <CopyLink />
      </header>

      <PeakClock lastFedAt={stats.lastFedAt} avgPeak={stats.avgPeak} />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Typical peak"
          value={stats.avgPeak !== null ? fmtDuration(stats.avgPeak) : null}
          note="last 5 feeds"
        />
        <Stat
          label="Typical rise"
          value={stats.avgRise !== null ? `${stats.avgRise.toFixed(1)}×` : null}
          note={stats.bestRise !== null ? `best ${stats.bestRise.toFixed(1)}×` : "last 5 feeds"}
        />
        <Stat
          label="Feeding gap"
          value={
            stats.avgIntervalHours !== null ? fmtDuration(stats.avgIntervalHours) : null
          }
          note="average"
        />
        <Stat
          label="Vigor"
          value={stats.vigor !== null ? `${stats.vigor}` : null}
          note={
            stats.peakTrend === null
              ? "out of 100"
              : stats.peakTrend < -0.25
                ? "trending faster"
                : stats.peakTrend > 0.25
                  ? "trending slower"
                  : "holding steady"
          }
        />
      </section>

      <FeedingForm slug={starter.slug} />

      <section>
        <h2 className="font-display text-xl font-semibold">History</h2>
        {feedings.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Nothing logged yet. The first entry is the hardest.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {feedings.map((f) => (
              <li
                key={f.id}
                className="card flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl px-4 py-3 text-sm"
              >
                <span className="font-medium tabular-nums">
                  <LocalTime iso={f.fed_at} />
                </span>
                <span className="text-muted">{f.ratio}</span>
                {f.peak_hours !== null && (
                  <span className="text-muted">peak {fmtDuration(f.peak_hours)}</span>
                )}
                {f.rise_ratio !== null && (
                  <span className="text-crust">{f.rise_ratio.toFixed(1)}×</span>
                )}
                {f.temp_f !== null && <span className="text-muted">{f.temp_f}°F</span>}
                {f.notes && (
                  <span className="w-full text-muted italic sm:w-auto">{f.notes}</span>
                )}
                <form action={deleteFeeding} className="ml-auto">
                  <input type="hidden" name="slug" value={starter.slug} />
                  <input type="hidden" name="id" value={f.id} />
                  <button
                    type="submit"
                    aria-label="Delete this feeding"
                    className="text-muted transition-colors hover:text-crust"
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string | null;
  note: string;
}) {
  return (
    <div className="card rounded-xl px-4 py-3">
      <p className="label mb-0.5">{label}</p>
      <p className="font-display text-2xl font-semibold tabular-nums">
        {value ?? <span className="text-muted">—</span>}
      </p>
      <p className="mt-0.5 text-[0.7rem] text-muted">{value ? note : "no data yet"}</p>
    </div>
  );
}
