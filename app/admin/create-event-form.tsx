"use client";

import { FormEvent, useState } from "react";

type CreateEventResponse = {
  ok?: boolean;
  error?: string;
  id?: string;
};

export default function CreateEventForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [capacityTotal, setCapacityTotal] = useState(0);
  const [regOpenAt, setRegOpenAt] = useState("");
  const [regCloseAt, setRegCloseAt] = useState("");
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);
  const [allowPublicLiveReport, setAllowPublicLiveReport] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setIsError(false);

    try {
      const payload = {
        name,
        slug,
        description: description.trim() || null,
        status,
        capacity_total: capacityTotal,
        reg_open_at: regOpenAt || null,
        reg_close_at: regCloseAt || null,
        allow_public_registration: allowPublicRegistration,
        allow_public_live_report: allowPublicLiveReport,
      };

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as CreateEventResponse;

      if (!res.ok || !data.ok) {
        setIsError(true);
        setMessage(data.error ?? "Gagal membuat event.");
        return;
      }

      setMessage("Event berhasil dibuat.");
      setName("");
      setSlug("");
      setDescription("");
      setStatus("draft");
      setCapacityTotal(0);
      setRegOpenAt("");
      setRegCloseAt("");
      setAllowPublicRegistration(true);
      setAllowPublicLiveReport(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Nama Event
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Jakarta Domino Tournament Seri 2"
            required
          />
        </label>

        <label>
          Slug Event
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="contoh: id-fes-2026-jakarta"
            required
          />
        </label>

        <label>
          Deskripsi
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ringkasan event"
          />
        </label>

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published" | "archived")}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </label>

        <label>
          Kapasitas Peserta
          <input
            type="number"
            min={0}
            value={capacityTotal}
            onChange={(e) => setCapacityTotal(Number(e.target.value))}
            required
          />
        </label>

        <label>
          Buka Registrasi
          <input type="datetime-local" value={regOpenAt} onChange={(e) => setRegOpenAt(e.target.value)} />
        </label>

        <label>
          Tutup Registrasi
          <input type="datetime-local" value={regCloseAt} onChange={(e) => setRegCloseAt(e.target.value)} />
        </label>

        <label>
          Pendaftaran Publik
          <select
            value={allowPublicRegistration ? "yes" : "no"}
            onChange={(e) => setAllowPublicRegistration(e.target.value === "yes")}
          >
            <option value="yes">Aktif</option>
            <option value="no">Nonaktif</option>
          </select>
        </label>

        <label>
          Live Report Publik
          <select
            value={allowPublicLiveReport ? "yes" : "no"}
            onChange={(e) => setAllowPublicLiveReport(e.target.value === "yes")}
          >
            <option value="yes">Aktif</option>
            <option value="no">Nonaktif</option>
          </select>
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Event"}
        </button>
        {message ? <p className={isError ? "err" : "ok"}>{message}</p> : null}
      </form>
    </section>
  );
}
