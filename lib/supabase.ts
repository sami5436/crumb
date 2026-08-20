import { createClient } from "@supabase/supabase-js";

// The publishable key is meant to travel with the client. Row Level Security is
// enabled on crumb_starters / crumb_feedings with no policies attached, so this
// key cannot read or write either table directly — every operation goes through
// a security-definer RPC that requires the starter's secret slug. The literals
// below are fallbacks so a fresh clone runs without setup.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://otanewolymhosqygevig.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_dnJ_ryN1zxBaAq5JMbQS1g_2HWifkIX";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type Feeding = {
  id: string;
  fed_at: string;
  ratio: string;
  temp_f: number | null;
  peak_hours: number | null;
  rise_ratio: number | null;
  notes: string | null;
  created_at: string;
};

export type Starter = {
  slug: string;
  name: string;
  flour: string;
  hydration: number;
  created_at: string;
};

export type StarterRecord = { starter: Starter; feedings: Feeding[] };

export async function getStarter(slug: string): Promise<StarterRecord | null> {
  const { data, error } = await supabase.rpc("crumb_get", { p_slug: slug });
  if (error) throw new Error(error.message);
  return (data as StarterRecord | null) ?? null;
}
