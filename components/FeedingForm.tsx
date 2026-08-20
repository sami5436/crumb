"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { logFeeding, type FormState } from "@/app/actions";
import { useIsMounted } from "@/lib/client-hooks";

/** "2026-08-19T14:30" in the browser's own timezone, for <input type="datetime-local">. */
function localInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-crust px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Logging…" : "Log this feeding"}
    </button>
  );
}

export default function FeedingForm({ slug }: { slug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const mounted = useIsMounted();
  const [edited, setEdited] = useState<string | null>(null);

  // The server has no idea what timezone you're in, so it renders the field
  // empty and the browser fills in "now" once hydration is done.
  const fedAt = edited ?? (mounted ? localInputValue(new Date()) : "");

  const [state, action] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await logFeeding(prev, formData);
    if (result.ok) {
      formRef.current?.reset();
      setEdited(null);
    }
    return result;
  }, {});

  return (
    <form ref={formRef} action={action} className="card rounded-2xl p-5 sm:p-6 space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <input
        type="hidden"
        name="fed_at"
        value={fedAt ? new Date(fedAt).toISOString() : ""}
      />

      <h2 className="font-display text-xl font-semibold">Log a feeding</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fed_at_local">
            Fed at
          </label>
          <input
            id="fed_at_local"
            type="datetime-local"
            className="field"
            value={fedAt}
            suppressHydrationWarning
            onChange={(e) => setEdited(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="ratio">
            Ratio (starter:flour:water)
          </label>
          <input
            id="ratio"
            name="ratio"
            className="field"
            defaultValue="1:1:1"
            list="ratios"
            autoComplete="off"
          />
          <datalist id="ratios">
            <option value="1:1:1" />
            <option value="1:2:2" />
            <option value="1:5:5" />
            <option value="1:10:10" />
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="peak_hours">
            Hours to peak
          </label>
          <input
            id="peak_hours"
            name="peak_hours"
            type="number"
            step="0.25"
            min="0.25"
            max="48"
            className="field"
            placeholder="5.5"
          />
        </div>
        <div>
          <label className="label" htmlFor="rise_ratio">
            Rise (× original)
          </label>
          <input
            id="rise_ratio"
            name="rise_ratio"
            type="number"
            step="0.1"
            min="1"
            max="10"
            className="field"
            placeholder="3"
          />
        </div>
        <div>
          <label className="label" htmlFor="temp_f">
            Room temp (°F)
          </label>
          <input
            id="temp_f"
            name="temp_f"
            type="number"
            step="1"
            className="field"
            placeholder="72"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Notes
        </label>
        <input
          id="notes"
          name="notes"
          className="field"
          maxLength={280}
          placeholder="Smelled sharp and acetone-y, thinner than usual"
          autoComplete="off"
        />
      </div>

      {state.error && (
        <p className="text-sm text-crust" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Submit />
        <span className="text-xs text-muted">
          Peak and rise are optional, but they&rsquo;re what the readout learns from.
        </span>
      </div>
    </form>
  );
}
