import NewStarterForm from "@/components/NewStarterForm";

const STEPS = [
  {
    title: "Feed it, log it",
    body: "Thirty seconds after you stir the jar: time, ratio, room temp. That's the whole habit.",
  },
  {
    title: "Mark the peak",
    body: "When it domes and starts to flatten, note the hours and how far it rose. Two numbers.",
  },
  {
    title: "Bake on time",
    body: "Crumb learns your jar's rhythm and tells you which hour it will be at its strongest.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
      <section className="max-w-xl">
        <p className="label">Sourdough, on the record</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08]">
          Your starter has a schedule.
          <br />
          You just haven&rsquo;t written it down.
        </h1>
        <p className="mt-5 text-lg text-muted leading-relaxed">
          Crumb is a feeding log for one jar of sourdough. Record each feed, mark when it
          peaks, and it works out how fast your starter actually moves — so you mix your
          levain at the hour it&rsquo;s strongest, not whenever you remember.
        </p>
      </section>

      <div className="mt-10 max-w-md">
        <NewStarterForm />
      </div>

      <section className="mt-16 border-t border-line/70 pt-10">
        <h2 className="font-display text-xl font-semibold">How it goes</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="font-display text-2xl text-crust">{i + 1}</span>
              <h3 className="mt-1 font-medium">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
