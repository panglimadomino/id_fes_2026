"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { DEFAULT_PUBLIC_PAGE_CONTENT, PublicPageContent } from "@/lib/public-page-content";

type ApiResponse = {
  ok?: boolean;
  error?: string;
  content?: PublicPageContent;
};

type AssetUploadResponse = {
  ok?: boolean;
  error?: string;
  path?: string;
};

export default function PublicPageCmsForm() {
  const [form, setForm] = useState<PublicPageContent>(DEFAULT_PUBLIC_PAGE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<"logo" | "hero" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const heroInputRef = useRef<HTMLInputElement | null>(null);

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

  async function onPickAssetFile(target: "logo" | "hero", file: File | null) {
    if (!file) return;
    setUploadingAsset(target);
    setMessage(null);
    setIsError(false);

    const formData = new FormData();
    formData.append("target", target);
    formData.append("file", file);

    const res = await fetch("/api/admin/public-page-assets/upload", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json().catch(() => ({}))) as AssetUploadResponse;
    setUploadingAsset(null);

    if (!res.ok || !data.ok || !data.path) {
      setIsError(true);
      setMessage(data.error ?? "Gagal upload file asset.");
      return;
    }

    if (target === "logo") setField("logo_filename", data.path);
    if (target === "hero") setField("hero_image_filename", data.path);
    setMessage(`Upload ${target === "logo" ? "logo" : "background hero"} berhasil. Jangan lupa klik Simpan Perubahan.`);
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
          <div className="cms-section">
            <h4>A. Logo Header</h4>
            <p>Nama file logo header dan upload pengganti.</p>
            <div className="cms-asset-row">
              <label>
                Nama file logo header
                <input value={form.logo_filename} onChange={(e) => setField("logo_filename", e.target.value)} required />
              </label>
              <div className="cms-upload-actions">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="cms-file-input"
                  onChange={(e) => onPickAssetFile("logo", e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="cms-upload-btn"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingAsset === "logo"}
                >
                  {uploadingAsset === "logo" ? "Upload Logo..." : "Edit / Upload File Logo"}
                </button>
              </div>
            </div>
          </div>

          <div className="cms-section">
            <h4>B. Hero Section</h4>
            <p>Nama file background hero dan upload pengganti.</p>
            <div className="cms-asset-row">
              <label>
                Nama file background hero
                <input value={form.hero_image_filename} onChange={(e) => setField("hero_image_filename", e.target.value)} required />
              </label>
              <div className="cms-upload-actions">
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="cms-file-input"
                  onChange={(e) => onPickAssetFile("hero", e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="cms-upload-btn"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={uploadingAsset === "hero"}
                >
                  {uploadingAsset === "hero" ? "Upload Hero..." : "Edit / Upload Background Hero"}
                </button>
              </div>
            </div>
            <div className="cms-section__grid">
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
            </div>
          </div>

          <div className="cms-section">
            <h4>C. Navigasi Header</h4>
            <p>Label menu utama dan submenu event.</p>
            <div className="cms-section__grid">
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
            </div>
          </div>

          <div className="cms-section">
            <h4>D. Footer</h4>
            <p>Kontak dan alamat yang tampil di footer website.</p>
            <div className="cms-section__grid">
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
            </div>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan Halaman Public"}
          </button>
          {message ? <p className={isError ? "err" : "ok"}>{message}</p> : null}
        </form>
      )}
    </section>
  );
}
