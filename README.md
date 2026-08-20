# Crumb

A feeding log for one jar of sourdough starter.

Most starter "trackers" are just note apps. Crumb assumes you already know how to feed
the thing — what you don't know is *when it's actually ready*. So it records the two
numbers that matter (hours to peak, how far it rose) and works backwards into a live
readout: where your jar is in its cycle right now, and how fast it's been moving lately.

No accounts. Creating a starter mints a private link; that link is the only way back in.

## Stack

- **Next.js 16** (App Router, React 19, Server Actions) + **Tailwind CSS 4**
- **Supabase Postgres** for storage
- Deployed on **Vercel**

## Data model

Two tables — `crumb_starters` and `crumb_feedings` — plus a small stats layer computed
in `lib/stats.ts` at render time (averages over the last five feeds, feeding cadence,
a peak-time trend, and a 0–100 vigor score).

## Security

Both tables have Row Level Security enabled **with no policies attached**, so the
publishable API key cannot read or write either table directly. Every operation goes
through a `security definer` RPC that takes the starter's secret slug as an argument:

| Function | Purpose |
| --- | --- |
| `crumb_create_starter(name, flour, hydration)` | Mints a starter and returns its slug |
| `crumb_get(slug)` | Starter plus its feedings, as JSON |
| `crumb_log_feeding(slug, …)` | Appends a feeding |
| `crumb_delete_feeding(slug, id)` | Removes one feeding |

Input validation (name length, hydration range, peak/rise bounds) lives in the functions,
so it holds no matter what calls them. Starter pages are marked `noindex` — the URL is
the credential.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your own Supabase project, or use the defaults
npm run dev
```

The SQL that sets up the schema is in `supabase/migrations/`.
