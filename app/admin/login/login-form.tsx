"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !payload.ok) {
        setError(
          payload.error ??
            "Gagal masuk. Pastikan email/kata sandi benar atau setel ulang password di Supabase Auth.",
        );
        return;
      }

      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label>
        Email super admin
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          required
        />
      </label>
      <label>
        Kata sandi
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
          <button
            type="button"
            className="password-toggle"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
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
      <button type="submit" disabled={loading}>
        {loading ? "Memproses..." : "Masuk"}
      </button>
      {error ? <p className="err">{error}</p> : null}
    </form>
  );
}
