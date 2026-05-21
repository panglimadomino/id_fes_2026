"use client";

import { FormEvent, useEffect, useState } from "react";
import { DEFAULT_PUBLIC_PAGE_CONTENT, PublicPageContent } from "@/lib/public-page-content";

type ApiResponse = {
  ok?: boolean;
  error?: string;
  content?: PublicPageContent;
};

export default function PublicPageCmsForm() {
  const [form, setForm] = useState<PublicPageContent>(DEFAULT_PUBLIC_PAGE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      const res = await fetch("/api/admin/public-page-content", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok || !data.ok || !data.content) {
        setIsError(true);
        setMessage(data.error ?? "Gagal memuat konfigurasi halaman public.");
      } else {
        setForm(data.content);
      }
      setLoading(false);
    }
    loadContent();
  }, []);

  function setField<K extends keyof PublicPageContent>(key: K, value: PublicPageContent[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setIsError(false);

    const res = await fetch("/api/admin/public-page-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await res.json().catch(() => ({}))) as ApiResponse;
    setSaving(false);

    if (!res.ok || !data.ok) {
      setIsError(true);
      setMessage(data.error ?? "Gagal menyimpan konfigurasi.");
      return;
    }

    setMessage("Perubahan halaman public berhasil disimpan.");
  }

  return (
    <section className="panel">
      <h3>Form Kelola Halaman Public</h3>
      <p>Edit konten, menu, dan branding public dari panel ini.</p>

      {loading ? (
        <p>Memuat konfigurasi...</p>
      ) : (
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Nama file logo header (bucket idfes-assets)
            <input value={form.logo_filename} onChange={(e) => setField("logo_filename", e.target.value)} required />
          </label>
          <label>
            Nama file background hero (bucket idfes-assets)
            <input value={form.hero_image_filename} onChange={(e) => setField("hero_image_filename", e.target.value)} required />
          </label>

          <label>
            Label menu Beranda
            <input value={form.menu_home_label} onChange={(e) => setField("menu_home_label", e.target.value)} required />
          </label>
          <label>
            Label menu Event
            <input value={form.menu_event_label} onChange={(e) => setField("menu_event_label", e.target.value)} required />
          </label>
          <label>
            Label menu Peraturan
            <input value={form.menu_rules_label} onChange={(e) => setField("menu_rules_label", e.target.value)} required />
          </label>
          <label>
            Label menu Kontak
            <input value={form.menu_contact_label} onChange={(e) => setField("menu_contact_label", e.target.value)} required />
          </label>

          <label>
            Label submenu 1
            <input value={form.submenu_surabaya_label} onChange={(e) => setField("submenu_surabaya_label", e.target.value)} required />
          </label>
          <label>
            Link submenu 1
            <input value={form.submenu_surabaya_href} onChange={(e) => setField("submenu_surabaya_href", e.target.value)} required />
          </label>

          <label>
            Label submenu 2
            <input value={form.submenu_jakarta_label} onChange={(e) => setField("submenu_jakarta_label", e.target.value)} required />
          </label>
          <label>
            Link submenu 2
            <input value={form.submenu_jakarta_href} onChange={(e) => setField("submenu_jakarta_href", e.target.value)} required />
          </label>

          <label>
            Hero badge (atas judul)
            <input value={form.hero_badge} onChange={(e) => setField("hero_badge", e.target.value)} required />
          </label>
          <label>
            Hero title
            <input value={form.hero_title} onChange={(e) => setField("hero_title", e.target.value)} required />
          </label>
          <label>
            Hero subtitle
            <input value={form.hero_subtitle} onChange={(e) => setField("hero_subtitle", e.target.value)} required />
          </label>
          <label>
            Hero line 1
            <input value={form.hero_line1} onChange={(e) => setField("hero_line1", e.target.value)} required />
          </label>
          <label>
            Hero line 2
            <input value={form.hero_line2} onChange={(e) => setField("hero_line2", e.target.value)} required />
          </label>
          <label>
            Hero deskripsi
            <input value={form.hero_desc} onChange={(e) => setField("hero_desc", e.target.value)} required />
          </label>
          <label>
            Tombol CTA label
            <input value={form.hero_cta_label} onChange={(e) => setField("hero_cta_label", e.target.value)} required />
          </label>
          <label>
            Tombol CTA link
            <input value={form.hero_cta_href} onChange={(e) => setField("hero_cta_href", e.target.value)} required />
          </label>

          <label>
            Footer email
            <input value={form.footer_email} onChange={(e) => setField("footer_email", e.target.value)} required />
          </label>
          <label>
            Footer alamat baris 1
            <input value={form.footer_address_line1} onChange={(e) => setField("footer_address_line1", e.target.value)} required />
          </label>
          <label>
            Footer alamat baris 2
            <input value={form.footer_address_line2} onChange={(e) => setField("footer_address_line2", e.target.value)} required />
          </label>
          <label>
            Footer alamat baris 3
            <input value={form.footer_address_line3} onChange={(e) => setField("footer_address_line3", e.target.value)} required />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan Halaman Public"}
          </button>
          {message ? <p className={isError ? "err" : "ok"}>{message}</p> : null}
        </form>
      )}
    </section>
  );
}
