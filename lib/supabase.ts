import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function isCloudEnabled(): boolean {
  return !!url && !!key;
}

export function getClient() {
  if (!isCloudEnabled()) throw new Error("Supabase not configured");
  return createClient(url, key);
}

export type Row = { id: string; workspace_id: string; payload: Record<string, unknown> };
