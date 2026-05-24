import Link from "next/link";
import { redirect } from "next/navigation";
import { getSuperAdminFromSession } from "@/lib/auth/admin-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import CreateEventForm from "./create-event-form";
import PublicPageCmsForm from "./public-page-cms-form";

export const dynamic = "force-dynamic";

type EventStats = {
  id: string;
  slug: string;
  name: string;
  status: string;
  reg_open_at: string | null;
  reg_close_at: string | null;
};

type AdminView = "dashboard" | "public-page" | "event-create" | "event-agenda" | "event-dashboard";

type AdminPageProps = {
  searchParams: Promise<{ view?: string; slug?: string }>;
};

function normalizeView(value?: string): AdminView {
  if (value === "create-event" || value === "event-create") return "event-create";
  if (value === "event-agenda") return "event-agenda";
  if (value === "event-dashboard") return "event-dashboard";
  if (value === "public-page") return "public-page";
  return "dashboard";
}

function viewLink(target: AdminView, active: AdminView, label: string) {
  return (
    <Link href={`/admin?view=${target}`} className={`admin-nav__item ${active === target ? "is-active" : ""}`}>
      {label}
    </Link>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const view = normalizeView(params.view);
  const editSlug = typeof params.slug === "string" ? params.slug : "";

  const admin = await getSuperAdminFromSession();
  if (!admin) redirect("/admin/login");

  let events: EventStats[] = [];
  let regCountByEvent = new Map<string, number>();
  let pageError: string | null = null;

  try {
    const supabase = createAdminSupabaseClient();
    const { data: eventsData, error: eventError } = await supabase
      .from("events")
      .select("id, slug, name, status, reg_open_at, reg_close_at")
      .order("created_at", { ascending: false })
      .returns<EventStats[]>();

    if (eventError) {
      pageError = eventError.message;
    } else {
      events = eventsData ?? [];
      const eventIds = events.map((e) => e.id);
      if (eventIds.length > 0) {
        const { data: regs, error: regError } = await supabase
          .from("registrations")
          .select("event_id")
          .in("event_id", eventIds);

        if (regError) {
          pageError = regError.message;
        } else {
          for (const r of regs ?? []) {
            const key = String(r.event_id);
            regCountByEvent.set(key, (regCountByEvent.get(key) ?? 0) + 1);
          }
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memuat data admin.";
    pageError = message;
  }

  const totalEvents = events.length;
  const totalPublished = events.filter((e) => e.status === "published").length;
  const totalRegistrations = Array.from(regCountByEvent.values()).reduce((sum, n) => sum + n, 0);
  const isPertandinganView = view === "event-create" || view === "event-agenda" || view === "event-dashboard";
  const selectedEvent = editSlug ? events.find((e) => e.slug === editSlug) ?? null : null;

  function formatDateTime(value: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function formatStatusLabel(status: string) {
    if (!status) return "unknown";
    return status.replaceAll("_", " ");
  }

  return (
    <div className="admin-cms">
      <aside className="admin-sidebar">
        <div>
          <h1>Super Admin CMS</h1>
          <p className="admin-sidebar__meta">{admin.email}</p>
        </div>

        <nav className="admin-nav" aria-label="Menu Super Admin">
          {viewLink("dashboard", view, "Dashboard")}
          {viewLink("public-page", view, "Kelola Halaman Public")}
          <div className="admin-nav__group">
            <div className={`admin-nav__group-title ${isPertandinganView ? "is-active" : ""}`}>Pertandingan</div>
            <div className="admin-nav__sub">
              <Link
                href="/admin?view=event-create"
                className={`admin-nav__subitem ${view === "event-create" ? "is-active" : ""}`}
              >
                Buat Pertandingan
              </Link>
              <Link
                href="/admin?view=event-agenda"
                className={`admin-nav__subitem ${view === "event-agenda" || view === "event-dashboard" ? "is-active" : ""}`}
              >
                Agenda Pertandingan
              </Link>
            </div>
          </div>
        </nav>

        <div className="admin-sidebar__bottom">
          <Link href="/" className="admin-nav__item">
            Lihat Website
          </Link>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="admin-logout-btn">Keluar</button>
          </form>
        </div>
      </aside>

      <main className="admin-content">
        {view === "dashboard" ? (
          <>
            <section className="panel">
              <h2>Dashboard</h2>
              <p>Ringkasan event dan pendaftar untuk monitoring harian.</p>
              {pageError ? (
                <p className="err">
                  Error: {pageError}. Jika ini terjadi di production, cek env `SUPABASE_SERVICE_ROLE_KEY` di Vercel.
                </p>
              ) : null}
            </section>

            <section className="admin-kpi-grid">
              <article className="panel">
                <h3>Total Event</h3>
                <p className="admin-kpi">{totalEvents}</p>
              </article>
              <article className="panel">
                <h3>Event Published</h3>
                <p className="admin-kpi">{totalPublished}</p>
              </article>
              <article className="panel">
                <h3>Total Pendaftar</h3>
                <p className="admin-kpi">{totalRegistrations}</p>
              </article>
            </section>

            <section className="panel">
              <h3>Daftar Event</h3>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Slug</th>
                      <th>Status</th>
                      <th>Reg Close</th>
                      <th>Total Pendaftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={5}>Belum ada event.</td>
                      </tr>
                    ) : (
                      events.map((e) => (
                        <tr key={e.id}>
                          <td>{e.name}</td>
                          <td>{e.slug}</td>
                          <td>{e.status}</td>
                          <td>{e.reg_close_at ?? "-"}</td>
                          <td>{regCountByEvent.get(e.id) ?? 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {view === "event-create" ? (
          <>
            <section className="panel">
              <h2>{editSlug ? "Edit Pertandingan" : "Buat Pertandingan"}</h2>
              <p>
                {editSlug
                  ? `Ubah data pertandingan dengan slug: ${editSlug}`
                  : "CMS form untuk menambah event baru dari dashboard super admin."}
              </p>
            </section>
            <CreateEventForm initialSlug={editSlug} />
          </>
        ) : null}

        {view === "event-agenda" ? (
          <>
            <section className="panel">
              <h2>Agenda Pertandingan</h2>
              <p>Pilih event untuk edit data pertandingan atau masuk ke dashboard event.</p>
            </section>

            <section className="panel">
              {events.length === 0 ? (
                <p>Belum ada agenda pertandingan.</p>
              ) : (
                <div className="admin-event-grid">
                  {events.map((e) => (
                    <article key={e.id} className="admin-event-card">
                      <div className="admin-event-card__head">
                        <h3>{e.name}</h3>
                        <span className={`admin-status-chip is-${e.status.toLowerCase()}`}>
                          {formatStatusLabel(e.status)}
                        </span>
                      </div>
                      <p className="admin-event-card__slug">Slug: {e.slug}</p>
                      <div className="admin-event-card__meta">
                        <span>Buka Reg: {formatDateTime(e.reg_open_at)}</span>
                        <span>Tutup Reg: {formatDateTime(e.reg_close_at)}</span>
                        <span>Total Pendaftar: {regCountByEvent.get(e.id) ?? 0}</span>
                      </div>
                      <div className="admin-event-card__actions">
                        <Link
                          href={`/admin?view=event-dashboard&slug=${encodeURIComponent(e.slug)}`}
                          className="admin-btn-link"
                        >
                          Open Dashboard
                        </Link>
                        <Link
                          href={`/admin?view=event-create&slug=${encodeURIComponent(e.slug)}`}
                          className="admin-btn-link is-secondary"
                        >
                          Edit
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}

        {view === "event-dashboard" ? (
          <>
            <section className="panel">
              <h2>Dashboard Event</h2>
              {selectedEvent ? (
                <p>
                  Event: <strong>{selectedEvent.name}</strong> ({selectedEvent.slug})
                </p>
              ) : (
                <p>Pilih event dari Agenda Pertandingan untuk membuka dashboard event.</p>
              )}
            </section>

            {selectedEvent ? (
              <>
                <section className="admin-kpi-grid">
                  <article className="panel">
                    <h3>Status Event</h3>
                    <p className="admin-kpi admin-kpi--text">{formatStatusLabel(selectedEvent.status)}</p>
                  </article>
                  <article className="panel">
                    <h3>Total Pendaftar</h3>
                    <p className="admin-kpi">{regCountByEvent.get(selectedEvent.id) ?? 0}</p>
                  </article>
                  <article className="panel">
                    <h3>Tutup Registrasi</h3>
                    <p className="admin-kpi admin-kpi--text">{formatDateTime(selectedEvent.reg_close_at)}</p>
                  </article>
                </section>

                <section className="admin-event-grid">
                  <article className="admin-event-card">
                    <h3>Kelola Event</h3>
                    <p>Edit identitas event dan detail pertandingan.</p>
                    <div className="admin-event-card__actions">
                      <Link
                        href={`/admin?view=event-create&slug=${encodeURIComponent(selectedEvent.slug)}`}
                        className="admin-btn-link"
                      >
                        Edit Pertandingan
                      </Link>
                    </div>
                  </article>

                  <article className="admin-event-card">
                    <h3>Peserta & Verifikasi</h3>
                    <p>Menu ini untuk list pendaftar, verifikasi data, dan verifikasi pembayaran.</p>
                    <div className="admin-event-card__actions">
                      <span className="admin-btn-link is-disabled">Segera Dibuat</span>
                    </div>
                  </article>

                  <article className="admin-event-card">
                    <h3>Pairing Group</h3>
                    <p>Menjalankan algoritma pairing per babak sesuai sistem pertandingan.</p>
                    <div className="admin-event-card__actions">
                      <span className="admin-btn-link is-disabled">Segera Dibuat</span>
                    </div>
                  </article>
                </section>
              </>
            ) : (
              <section className="panel">
                <Link href="/admin?view=event-agenda" className="admin-btn-link">
                  Kembali ke Agenda Pertandingan
                </Link>
              </section>
            )}
          </>
        ) : null}

        {view === "public-page" ? (
          <>
            <section className="panel">
              <h2>Kelola Halaman Public</h2>
              <p>Kelola konten halaman public melalui form CMS.</p>
            </section>
            <PublicPageCmsForm />
          </>
        ) : null}
      </main>
    </div>
  );
}
