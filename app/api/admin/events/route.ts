import { NextResponse } from "next/server";
import { z } from "zod";
import { getSuperAdminFromSession } from "@/lib/auth/admin-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

function makeSlug(source: string) {
  return source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CreateEventSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda -")
    .optional(),
  name: z.string().min(3, "Nama event minimal 3 karakter."),
  description: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  capacity_total: z.number().int().min(0).default(0),
  match_start_at: z.string().nullable().optional(),
  tournament_end_at: z.string().nullable().optional(),
  reg_open_at: z.string().nullable().optional(),
  reg_close_at: z.string().nullable().optional(),
  allow_public_registration: z.boolean().default(true),
  allow_public_live_report: z.boolean().default(true),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  const admin = await getSuperAdminFromSession();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateEventSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Payload tidak valid.";
    return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
  }

  const input = parsed.data;
  const slugBase = input.slug && input.slug.length >= 3 ? input.slug : makeSlug(input.name);
  const finalSlug = slugBase.length >= 3 ? slugBase : `event-${Date.now()}`;
  const regOpenAt = input.reg_open_at ? new Date(input.reg_open_at).toISOString() : null;
  const regCloseAt = input.reg_close_at ? new Date(input.reg_close_at).toISOString() : null;
  const matchStartAt = input.match_start_at ? new Date(input.match_start_at).toISOString() : null;
  const tournamentEndAt = input.tournament_end_at ? new Date(input.tournament_end_at).toISOString() : null;

  if (regOpenAt && regCloseAt && regOpenAt >= regCloseAt) {
    return NextResponse.json(
      { ok: false, error: "Waktu buka registrasi harus lebih awal dari waktu tutup." },
      { status: 400 },
    );
  }
  if (matchStartAt && tournamentEndAt && matchStartAt > tournamentEndAt) {
    return NextResponse.json(
      { ok: false, error: "Tanggal mulai pertandingan harus lebih awal dari tanggal berakhir." },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      slug: finalSlug,
      name: input.name,
      description: input.description ?? null,
      status: input.status,
      allow_public_registration: input.allow_public_registration,
      allow_public_live_report: input.allow_public_live_report,
      reg_open_at: regOpenAt,
      reg_close_at: regCloseAt,
      match_start_at: matchStartAt,
      tournament_end_at: tournamentEndAt,
      capacity_total: input.capacity_total,
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error) {
    const message = error.message.includes("duplicate key")
      ? "Slug sudah dipakai. Gunakan slug lain."
      : error.message;
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const eventId = data.id as string;
  const { error: settingError } = await supabase.from("event_settings").upsert(
    {
      event_id: eventId,
      extra_config: input.meta ?? {},
    },
    { onConflict: "event_id" },
  );

  if (settingError) {
    return NextResponse.json(
      { ok: false, error: `Event dibuat, tapi gagal simpan detail form: ${settingError.message}` },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, id: eventId });
}
