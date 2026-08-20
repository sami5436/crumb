import type { Feeding } from "./supabase";

export const HOUR = 1000 * 60 * 60;

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Numeric values from the most recent `n` feedings that recorded the field. */
function recent(feedings: Feeding[], key: "peak_hours" | "rise_ratio", n: number) {
  return feedings
    .map((f) => f[key])
    .filter((v): v is number => typeof v === "number")
    .slice(0, n);
}

export type Stats = {
  total: number;
  lastFedAt: string | null;
  avgPeak: number | null;
  avgRise: number | null;
  bestRise: number | null;
  avgIntervalHours: number | null;
  /** Change in average peak time, recent 3 vs. the 3 before. Negative = faster. */
  peakTrend: number | null;
  /** 0–100 blend of how high it rises and how quickly it gets there. */
  vigor: number | null;
};

export function computeStats(feedings: Feeding[]): Stats {
  const peaks = recent(feedings, "peak_hours", 5);
  const rises = recent(feedings, "rise_ratio", 5);
  const allRises = feedings.map((f) => f.rise_ratio).filter((v): v is number => v !== null);

  const avgPeak = peaks.length ? mean(peaks) : null;
  const avgRise = rises.length ? mean(rises) : null;

  const gaps: number[] = [];
  for (let i = 0; i < feedings.length - 1 && i < 8; i++) {
    const gap = (Date.parse(feedings[i].fed_at) - Date.parse(feedings[i + 1].fed_at)) / HOUR;
    if (gap > 0 && gap < 24 * 30) gaps.push(gap);
  }

  const peakSeries = recent(feedings, "peak_hours", 6);
  const peakTrend =
    peakSeries.length >= 6 ? mean(peakSeries.slice(0, 3)) - mean(peakSeries.slice(3, 6)) : null;

  let vigor: number | null = null;
  if (avgRise !== null || avgPeak !== null) {
    // A healthy starter roughly triples and peaks in about 6 hours at room temp.
    const riseScore = avgRise !== null ? Math.min(avgRise / 3, 1) : null;
    const speedScore = avgPeak !== null ? Math.min(6 / avgPeak, 1) : null;
    const parts = [
      riseScore !== null ? { w: 0.6, v: riseScore } : null,
      speedScore !== null ? { w: 0.4, v: speedScore } : null,
    ].filter((p): p is { w: number; v: number } => p !== null);
    const weight = parts.reduce((a, p) => a + p.w, 0);
    vigor = Math.round((parts.reduce((a, p) => a + p.w * p.v, 0) / weight) * 100);
  }

  return {
    total: feedings.length,
    lastFedAt: feedings[0]?.fed_at ?? null,
    avgPeak,
    avgRise,
    bestRise: allRises.length ? Math.max(...allRises) : null,
    avgIntervalHours: gaps.length ? mean(gaps) : null,
    peakTrend,
    vigor,
  };
}

export type Phase = {
  label: string;
  blurb: string;
  /** Fraction of the way through the rise-to-peak window, clamped to 0–1.5. */
  progress: number;
  tone: "rising" | "peak" | "falling" | "hungry" | "idle";
};

/** Where the starter is in its cycle right now, given hours since it was fed. */
export function phaseFor(hoursSince: number | null, avgPeak: number | null): Phase {
  if (hoursSince === null) {
    return {
      label: "Not fed yet",
      blurb: "Log your first feeding to start tracking.",
      progress: 0,
      tone: "idle",
    };
  }
  const peak = avgPeak ?? 6;
  const p = hoursSince / peak;

  if (p < 0.55)
    return {
      label: "Rising",
      blurb: `About ${fmtDuration(peak - hoursSince)} until it peaks.`,
      progress: p,
      tone: "rising",
    };
  if (p < 1.25)
    return {
      label: "At peak",
      blurb: "Domed and bubbly — this is the window to bake with it.",
      progress: p,
      tone: "peak",
    };
  if (p < 2.5)
    return {
      label: "Falling",
      blurb: "Past its peak and deflating. Still fine, just less lift.",
      progress: p,
      tone: "falling",
    };
  return {
    label: "Hungry",
    blurb: "Well past peak. Feed it, or move it to the fridge.",
    progress: p,
    tone: "hungry",
  };
}

export function fmtDuration(hours: number): string {
  const h = Math.max(0, hours);
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    return mins ? `${whole}h ${mins}m` : `${whole}h`;
  }
  return `${Math.round(h / 24)}d`;
}
