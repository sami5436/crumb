"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type FormState = { error?: string; ok?: number };

const num = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function createStarter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { data, error } = await supabase.rpc("crumb_create_starter", {
    p_name: String(formData.get("name") ?? ""),
    p_flour: String(formData.get("flour") ?? ""),
    p_hydration: num(formData.get("hydration")) ?? 100,
  });

  if (error) return { error: error.message };
  redirect(`/s/${data as string}`);
}

export async function logFeeding(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const slug = String(formData.get("slug") ?? "");
  const { error } = await supabase.rpc("crumb_log_feeding", {
    p_slug: slug,
    p_fed_at: String(formData.get("fed_at") ?? "") || null,
    p_ratio: String(formData.get("ratio") ?? ""),
    p_temp_f: num(formData.get("temp_f")),
    p_peak_hours: num(formData.get("peak_hours")),
    p_rise_ratio: num(formData.get("rise_ratio")),
    p_notes: String(formData.get("notes") ?? ""),
  });

  if (error) return { error: error.message };
  revalidatePath(`/s/${slug}`);
  return { ok: Date.now() };
}

export async function deleteFeeding(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  await supabase.rpc("crumb_delete_feeding", {
    p_slug: slug,
    p_id: String(formData.get("id") ?? ""),
  });
  revalidatePath(`/s/${slug}`);
}
