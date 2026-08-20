"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False during SSR and the hydration pass, true afterwards. Use it to gate
 * anything that depends on the browser (timezone, clock, location).
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

let now = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribeToClock(onChange: () => void) {
  listeners.add(onChange);
  if (timer === null) {
    timer = setInterval(() => {
      now = Date.now();
      for (const listener of listeners) listener();
    }, 30_000);
  }
  now = Date.now();
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Wall-clock time that ticks every 30s, or null on the server. */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribeToClock,
    () => now,
    () => null,
  );
}
