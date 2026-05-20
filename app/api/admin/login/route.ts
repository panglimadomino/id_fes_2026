import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  createSupabaseAuthClient,
  createSupabaseAuthedClient,
} from "@/lib/auth/admin-session";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as LoginPayload;
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email dan kata sandi wajib diisi." },
      { status: 400 },
    );
  }

  const supabaseAuth = createSupabaseAuthClient();
  const { data: signInData, error: signInError } =
    await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError || !signInData.session || !signInData.user) {
    const detail = signInError?.message?.toLowerCase() ?? "";
    const errorMessage =
      detail.includes("invalid login credentials")
        ? "Email atau kata sandi tidak valid."
        : detail.includes("email not confirmed")
          ? "Email belum terverifikasi. Cek inbox lalu verifikasi email dulu."
          : detail.includes("password")
            ? "Kata sandi belum disetel / tidak valid. Silakan reset password di Supabase Auth."
            : "Gagal login. Cek email/kata sandi atau setel ulang password di Supabase Auth.";

    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 401 },
    );
  }

  const supabaseAuthed = createSupabaseAuthedClient(signInData.session.access_token);
  const { data: roleRow, error: roleError } = await supabaseAuthed
    .from("user_global_roles")
    .select("role")
    .eq("user_id", signInData.user.id)
    .maybeSingle();

  if (roleError || roleRow?.role !== "super_admin") {
    return NextResponse.json(
      { ok: false, error: "Akses ditolak. Akun ini bukan super admin." },
      { status: 403 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, signInData.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}
