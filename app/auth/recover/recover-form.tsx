"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type RecoveryState = "checking" | "ready" | "invalid" | "done";

export default function RecoverForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<RecoveryState>("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    return createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }, []);

  useEffect(() => {
    async function initRecoverySession() {
      if (!supabase) {
        setState("invalid");
        setMessage("Konfigurasi Supabase belum lengkap.");
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (type !== "recovery" || !accessToken || !refreshToken) {
        setState("invalid");
        setMessage(
          "Link reset tidak valid atau sudah kadaluarsa. Kirim ulang email reset password dari Supabase.",
        );
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setState("invalid");
        setMessage(
          "Sesi reset password tidak valid/expired. Klik 'Send password recovery' lagi lalu gunakan email terbaru.",
        );
        return;
      }

      window.history.replaceState({}, document.title, "/auth/recover");
      setState("ready");
      setMessage(null);
    }

    initRecoverySession();
  }, [supabase]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;

    if (password.length < 8) {
      setMessage("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Konfirmasi password tidak sama.");
      return;
    }

    setSaving(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setMessage(error.message || "Gagal memperbarui password.");
      return;
    }

    setState("done");
    setMessage("Password berhasil diperbarui. Silakan login sebagai super admin.");
  }

  return (
    <section className="panel recover-card">
      <h1>Atur Ulang Password</h1>
      <p>Gunakan password baru untuk akun super admin.</p>

      {state === "checking" ? <p>Memvalidasi link recovery...</p> : null}
      {state === "invalid" ? <p className="err">{message}</p> : null}

      {state === "ready" ? (
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Password baru
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                required
              />
            </div>
          </label>
          <label>
            Konfirmasi password baru
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Ulangi password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 102.8 2.8" />
                    <path d="M9.9 4.2A10.6 10.6 0 0112 4c5 0 8.9 3.3 10 8-0.4 1.8-1.4 3.4-2.8 4.7M6.1 6.2C4.1 7.6 2.7 9.6 2 12c1.1 4.7 5 8 10 8 1.5 0 2.9-0.3 4.2-0.9" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12c1.1-4.7 5-8 10-8s8.9 3.3 10 8c-1.1 4.7-5 8-10 8S3.1 16.7 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          <button type="submit" disabled={saving}>
            {saving ? "Memproses..." : "Simpan Password Baru"}
          </button>
          {message ? <p className="err">{message}</p> : null}
        </form>
      ) : null}

      {state === "done" ? (
        <p style={{ marginTop: 12 }}>
          <Link href="/admin/login">Lanjut ke Login Admin</Link>
        </p>
      ) : null}
    </section>
  );
}
