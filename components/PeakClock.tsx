"use client";

import { useNow } from "@/lib/client-hooks";
import { HOUR, fmtDuration, phaseFor } from "@/lib/stats";

const TONE: Record<string, string> = {
  rising: "var(--leaven)",
  peak: "var(--crust)",
  falling: "var(--muted)",
  hungry: "var(--muted)",
  idle: "var(--muted)",
};

export default function PeakClock({
  lastFedAt,
  avgPeak,
}: {
  lastFedAt: string | null;
  avgPeak: number | null;
}) {
  const now = useNow();

  // Until the clock reads on the client, show the frame without the live numbers.
  const hoursSince =
    now !== null && lastFedAt ? (now - Date.parse(lastFedAt)) / HOUR : null;
  const phase = phaseFor(hoursSince, avgPeak);
  const color = TONE[phase.tone];
  const pct = Math.min(phase.progress / 2.5, 1) * 100;

  return (
    <section className="card rounded-2xl p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="label mb-1">Right now</p>
          <h2 className="font-display text-2xl font-semibold" style={{ color }}>
            {now === null ? "…" : phase.label}
          </h2>
        </div>
        {hoursSince !== null && (
          <p className="text-sm text-muted shrink-0">
            fed {fmtDuration(hoursSince)} ago
          </p>
        )}
      </div>

      <p className="mt-2 text-sm text-muted">{now === null ? " " : phase.blurb}</p>

      <div className="mt-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-crust-soft">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${now === null ? 0 : pct}%`, backgroundColor: color }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[0.68rem] uppercase tracking-wider text-muted">
          <span>fed</span>
          <span>peak</span>
          <span>hungry</span>
        </div>
      </div>
    </section>
  );
}
