import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(url, anon);

// Server-side client (uses service role for admin ops)
export function createAdminClient() {
  return createClient<Database>(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
