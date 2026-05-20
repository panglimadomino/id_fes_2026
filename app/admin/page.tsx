import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

type EventStats = {
  id: string;
  slug: string;
  name: string;
  status: string;
  reg_close_at: string | null;
};

export default async function AdminPage() {
  const supabase = createAdminSupabaseClient();

  const { data: events, error: eventError } = await supabase
    .from("events")
    .select("id, slug, name, status, reg_close_at")
    .order("created_at", { ascending: false })
    .returns<EventStats[]>();

  if (eventError) {
    throw new Error(eventError.message);
  }

  const eventIds = (events ?? []).map((e) => e.id);
  const regCountByEvent = new Map<string, number>();

  if (eventIds.length > 0) {
    const { data: regs, error: regError } = await supabase
      .from("registrations")
      .select("event_id")
      .in("event_id", eventIds);

    if (regError) {
      throw new Error(regError.message);
    }

    for (const r of regs ?? []) {
      const key = String(r.event_id);
      regCountByEvent.set(key, (regCountByEvent.get(key) ?? 0) + 1);
    }
  }

  return (
    <div className="grid">
      <section className="panel">
        <h1>Admin Dashboard</h1>
        <p>Ringkasan event dan jumlah pendaftar saat ini.</p>
      </section>

      <section className="panel">
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
            {(events ?? []).map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.slug}</td>
                <td>{e.status}</td>
                <td>{e.reg_close_at ?? "-"}</td>
                <td>{regCountByEvent.get(e.id) ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
