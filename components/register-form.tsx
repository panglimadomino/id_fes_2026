"use client";

import { useState } from "react";

type Props = { eventSlug: string };

type SubmitState = { ok: boolean; message: string } | null;

const initial = {
  teamName: "",
  provinsi: "",
  kabKota: "",
  athlete1: { fullName: "", wa: "", gender: "LAKI-LAKI", dob: "", age: 0 },
  athlete2: { fullName: "", wa: "", gender: "LAKI-LAKI", dob: "", age: 0 },
};

export function RegisterForm({ eventSlug }: Props) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubmitState>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, ...form }),
      });
      const json = await res.json();

      if (!res.ok) {
        setResult({ ok: false, message: json.error ?? "Gagal mendaftar." });
      } else {
        setResult({ ok: true, message: `Pendaftaran berhasil. Order ID: ${json.orderId}` });
        setForm(initial);
      }
    } catch {
      setResult({ ok: false, message: "Terjadi error jaringan." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel form-grid">
      <h3>Pendaftaran Tim</h3>

      <label>Nama Tim
        <input value={form.teamName} onChange={(e) => setForm((f) => ({ ...f, teamName: e.target.value }))} required />
      </label>
      <label>Provinsi
        <input value={form.provinsi} onChange={(e) => setForm((f) => ({ ...f, provinsi: e.target.value }))} required />
      </label>
      <label>Kab/Kota
        <input value={form.kabKota} onChange={(e) => setForm((f) => ({ ...f, kabKota: e.target.value }))} required />
      </label>

      <h4>Atlet 1</h4>
      <label>Nama
        <input value={form.athlete1.fullName} onChange={(e) => setForm((f) => ({ ...f, athlete1: { ...f.athlete1, fullName: e.target.value } }))} required />
      </label>
      <label>WhatsApp
        <input value={form.athlete1.wa} onChange={(e) => setForm((f) => ({ ...f, athlete1: { ...f.athlete1, wa: e.target.value } }))} required />
      </label>
      <label>Tanggal Lahir
        <input type="date" value={form.athlete1.dob} onChange={(e) => setForm((f) => ({ ...f, athlete1: { ...f.athlete1, dob: e.target.value } }))} required />
      </label>
      <label>Umur
        <input type="number" min={0} max={120} value={form.athlete1.age} onChange={(e) => setForm((f) => ({ ...f, athlete1: { ...f.athlete1, age: Number(e.target.value) } }))} required />
      </label>

      <h4>Atlet 2</h4>
      <label>Nama
        <input value={form.athlete2.fullName} onChange={(e) => setForm((f) => ({ ...f, athlete2: { ...f.athlete2, fullName: e.target.value } }))} required />
      </label>
      <label>WhatsApp
        <input value={form.athlete2.wa} onChange={(e) => setForm((f) => ({ ...f, athlete2: { ...f.athlete2, wa: e.target.value } }))} required />
      </label>
      <label>Tanggal Lahir
        <input type="date" value={form.athlete2.dob} onChange={(e) => setForm((f) => ({ ...f, athlete2: { ...f.athlete2, dob: e.target.value } }))} required />
      </label>
      <label>Umur
        <input type="number" min={0} max={120} value={form.athlete2.age} onChange={(e) => setForm((f) => ({ ...f, athlete2: { ...f.athlete2, age: Number(e.target.value) } }))} required />
      </label>

      <button disabled={loading} type="submit">{loading ? "Menyimpan..." : "Daftar"}</button>

      {result && <p className={result.ok ? "ok" : "err"}>{result.message}</p>}
    </form>
  );
}
