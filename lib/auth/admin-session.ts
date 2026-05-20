import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const ADMIN_SESSION_COOKIE = "idfes_admin_session";

function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}

export function createSupabaseAuthClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseAuthedClient(accessToken: string) {
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getSuperAdminFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const supabaseAuth = createSupabaseAuthClient();
  const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !authData.user) return null;

  const supabaseAuthed = createSupabaseAuthedClient(token);
  const { data: roleRow, error: roleError } = await supabaseAuthed
    .from("user_global_roles")
    .select("role")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (roleError || roleRow?.role !== "super_admin") return null;

  return {
    id: authData.user.id,
    email: authData.user.email ?? "",
    accessToken: token,
  };
}
