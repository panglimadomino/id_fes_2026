import { notFound } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";
import { EventRow } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("events")
    .select("id, slug, name, description, status, reg_open_at, reg_close_at, allow_public_registration")
    .eq("slug", slug)
    .maybeSingle<EventRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const now = new Date();
  const regOpen = data.reg_open_at ? new Date(data.reg_open_at) : null;
  const regClose = data.reg_close_at ? new Date(data.reg_close_at) : null;
  const inWindow = !!regOpen && !!regClose && now >= regOpen && now <= regClose;
  const canRegister = data.status === "published" && data.allow_public_registration && inWindow;

  return (
    <div className="grid">
      <section className="panel">
        <h1>{data.name}</h1>
        <p>{data.description ?? "Tanpa deskripsi"}</p>
        <p><strong>Window:</strong> {data.reg_open_at ?? "-"} s/d {data.reg_close_at ?? "-"}</p>
      </section>

      {canRegister ? (
        <RegisterForm eventSlug={data.slug} />
      ) : (
        <section className="panel">
          <h3>Pendaftaran Ditutup</h3>
          <p>Pendaftaran belum dibuka atau sudah ditutup.</p>
        </section>
      )}
    </div>
  );
}
