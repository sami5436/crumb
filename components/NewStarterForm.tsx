"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createStarter, type FormState } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-crust px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Starting the jar…" : "Start the log"}
    </button>
  );
}

export default function NewStarterForm() {
  const [state, action] = useActionState<FormState, FormData>(createStarter, {});

  return (
    <form action={action} className="card rounded-2xl p-5 sm:p-6 space-y-4">
      <div>
        <label className="label" htmlFor="name">
          What do you call it?
        </label>
        <input
          id="name"
          name="name"
          className="field"
          required
          maxLength={60}
          placeholder="Bread Pitt"
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="flour">
            Flour
          </label>
          <input
            id="flour"
            name="flour"
            className="field"
            defaultValue="bread flour"
            list="flours"
            autoComplete="off"
          />
          <datalist id="flours">
            <option value="bread flour" />
            <option value="all-purpose" />
            <option value="whole wheat" />
            <option value="rye" />
            <option value="spelt" />
            <option value="50/50 rye + AP" />
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="hydration">
            Hydration %
          </label>
          <input
            id="hydration"
            name="hydration"
            type="number"
            className="field"
            defaultValue={100}
            min={50}
            max={200}
            step={5}
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-crust" role="alert">
          {state.error}
        </p>
      )}

      <Submit />
      <p className="text-xs text-muted">
        No account, no email. You get a private link — bookmark it.
      </p>
    </form>
  );
}
