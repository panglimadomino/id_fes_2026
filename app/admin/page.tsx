import Link from "next/link";
import { redirect } from "next/navigation";
import { getSuperAdminFromSession } from "@/lib/auth/admin-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import CreateEventForm from "./create-event-form";

export const dynamic = "force-dynamic";

type EventStats = {
  id: string;
  slug: string;
  name: string;
  status: string;
  reg_close_at: string | null;
};

type AdminView = "dashboard" | "create-event" | "public-page";

type AdminPageProps = {
  searchParams: Promise<{ view?: string }>;
};

function normalizeView(value?: string): AdminView {
  if (value === "create-event") return "create-event";
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

  const admin = await getSuperAdminFromSession();
  if (!admin) redirect("/admin/login");

  let events: EventStats[] = [];
  let regCountByEvent = new Map<string, number>();
  let pageError: string | null = null;

  try {
    const supabase = createAdminSupabaseClient();
    const { data: eventsData, error: eventError } = await supabase
      .from("events")
      .select("id, slug, name, status, reg_close_at")
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

  return (
    <div className="admin-cms">
      <aside className="admin-sidebar">
        <div>
          <h1>Super Admin CMS</h1>
          <p className="admin-sidebar__meta">{admin.email}</p>
        </div>

        <nav className="admin-nav" aria-label="Menu Super Admin">
          {viewLink("dashboard", view, "Dashboard")}
          {viewLink("create-event", view, "Buat Pertandingan")}
          {viewLink("public-page", view, "Kelola Halaman Public")}
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

        {view === "create-event" ? (
          <>
            <section className="panel">
              <h2>Buat Pertandingan</h2>
              <p>CMS form untuk menambah event baru dari dashboard super admin.</p>
            </section>
            <CreateEventForm />
          </>
        ) : null}

        {view === "public-page" ? (
          <>
            <section className="panel">
              <h2>Kelola Halaman Public</h2>
              <p>Kontrol cepat untuk konten publik website.</p>
            </section>

            <section className="admin-public-grid">
              <article className="panel">
                <h3>Branding Assets</h3>
                <p>Bucket: <code>idfes-assets</code></p>
                <p>Logo header: <code>ID FES 2026 LOGO.png</code></p>
                <p>Hero background: <code>ID FES HERO BACKROUND.jpg</code></p>
              </article>

              <article className="panel">
                <h3>Navigasi Public</h3>
                <p>Menu utama: Beranda, ID Fes 2026, Peraturan, Kontak.</p>
                <p>Submenu event: Surabaya, DKI Jakarta.</p>
              </article>

              <article className="panel">
                <h3>Aksi Cepat</h3>
                <p>
                  <Link href="/">Buka Homepage</Link>
                </p>
                <p>
                  <Link href="/events/id-fes-2026-jakarta">Buka Halaman Event Jakarta</Link>
                </p>
              </article>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
