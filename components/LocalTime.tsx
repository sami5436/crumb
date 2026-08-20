"use client";

import { useIsMounted } from "@/lib/client-hooks";

const OPTS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

/** Renders a timestamp in the reader's timezone, not the server's. */
export default function LocalTime({ iso }: { iso: string }) {
  const mounted = useIsMounted();
  const text = new Intl.DateTimeFormat("en-US", {
    ...OPTS,
    ...(mounted ? {} : { timeZone: "UTC" }),
  }).format(new Date(iso));

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
