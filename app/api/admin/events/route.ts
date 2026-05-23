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

function parseIsoDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseRupiahToNumber(input?: string | null) {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number(digits);
  if (Number.isNaN(value)) return null;
  return value;
}

function inferMimeTypeByPath(path: string): string | null {
  const lower = path.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return null;
}

function extractFileNameFromPath(path: string): string {
  const split = path.split("/").filter(Boolean);
  return decodeURIComponent(split[split.length - 1] ?? path);
}

const IdentitySchema = z.object({
  nama_pertandingan: z.string().optional(),
  tingkatan_pertandingan: z.enum(["Nasional", "Provinsi", "Kabupaten", "Kota"]),
  penyelenggara_pertandingan: z.enum(["PB PORDI", "PENGPROV PORDI", "PENGKAB/PENGKOT PORDI"]),
  provinsi: z.string().nullable().optional(),
  kabupaten_kota: z.string().nullable().optional(),
  tanggal_mulai_pertandingan: z.string().nullable().optional(),
  tanggal_berakhir_pertandingan: z.string().nullable().optional(),
  alamat_tempat_pertandingan: z.string().nullable().optional(),
  link_map_lokasi_pertandingan: z.string().nullable().optional(),
});

const CategorySchema = z.object({
  nomor_pertandingan: z.enum([
    "Ganda - Open Tournament",
    "Tunggal - Open Tournament",
    "Ganda Putra",
    "Ganda Putri",
    "Ganda Campuran",
    "Tunggal Putra",
    "Tunggal Putri",
    "Tunggal Campuran",
  ]),
  jumlah_peserta: z.number().int().min(0).default(0),
  jumlah_babak: z.enum(["Satu Babak", "Dua Babak"]).default("Satu Babak"),
  sistem_babak_pertama: z.enum(["Round Robin/Setengah Kompetisi", "Swiss", "Single Eliminasi/Gugur"]),
  sistem_babak_kedua: z.string().nullable().optional(),
});

const PrizeSchema = z.object({
  juara_i: z.string().nullable().optional(),
  juara_ii: z.string().nullable().optional(),
  juara_iii: z.string().nullable().optional(),
  juara_iv: z.string().nullable().optional(),
  juara_v_viii: z.string().nullable().optional(),
  juara_ix_xvi: z.string().nullable().optional(),
  juara_xvii_xxxii: z.string().nullable().optional(),
});

const RegistrationSchema = z.object({
  tanggal_dibuka_pendaftaran: z.string().nullable().optional(),
  tanggal_ditutup_pendaftaran: z.string().nullable().optional(),
  biaya_pendaftaran: z.string().nullable().optional(),
});

const DocumentsSchema = z.object({
  surat_rekomendasi_organisasi: z.string().nullable().optional(),
  surat_izin_keramaian: z.string().nullable().optional(),
  flayer_1_16_9: z.string().nullable().optional(),
  flayer_2_16_9: z.string().nullable().optional(),
  flayer_3_9_16: z.string().nullable().optional(),
  flayer_4_9_16: z.string().nullable().optional(),
});

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
  meta: z
    .object({
      identity: IdentitySchema,
      kategori: CategorySchema,
      hadiah: PrizeSchema.optional(),
      pendaftaran: RegistrationSchema.optional(),
      dokumen: DocumentsSchema.optional(),
    })
    .optional(),
});

export async function GET(req: Request) {
  const admin = await getSuperAdminFromSession();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") ?? "").trim();
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Slug wajib diisi." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select(
      "id, slug, name, description, status, capacity_total, reg_open_at, reg_close_at, match_start_at, tournament_end_at, allow_public_registration, allow_public_live_report",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (eventError) {
    return NextResponse.json({ ok: false, error: eventError.message }, { status: 400 });
  }

  if (!eventRow) {
    return NextResponse.json({ ok: false, error: "Event tidak ditemukan." }, { status: 404 });
  }

  const [{ data: settingRow, error: settingError }, { data: profileRow, error: profileError }, { data: docsRows, error: docsError }] =
    await Promise.all([
      supabase.from("event_settings").select("extra_config").eq("event_id", eventRow.id).maybeSingle(),
      supabase
        .from("event_profiles")
        .select(
          "tournament_level, organizer_level, province, city, venue_address, venue_map_url, event_start_at, event_end_at, event_number_category, participant_total, round_count, round_one_system, round_two_system, prize_1, prize_2, prize_3, prize_4, prize_5_8, prize_9_16, prize_17_32, registration_open_at, registration_close_at, registration_fee",
        )
        .eq("event_id", eventRow.id)
        .maybeSingle(),
      supabase.from("event_documents").select("doc_type, storage_path").eq("event_id", eventRow.id),
    ]);

  if (settingError) {
    return NextResponse.json({ ok: false, error: settingError.message }, { status: 400 });
  }
  if (profileError) {
    return NextResponse.json({ ok: false, error: profileError.message }, { status: 400 });
  }
  if (docsError) {
    return NextResponse.json({ ok: false, error: docsError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    event: eventRow,
    settings: settingRow?.extra_config ?? {},
    profile: profileRow ?? null,
    documents: docsRows ?? [],
  });
}

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

  const identity = input.meta?.identity;
  const category = input.meta?.kategori;
  const prize = input.meta?.hadiah;
  const registration = input.meta?.pendaftaran;
  const docs = input.meta?.dokumen;

  const regOpenAt = parseIsoDate(registration?.tanggal_dibuka_pendaftaran) ?? parseIsoDate(input.reg_open_at);
  const regCloseAt = parseIsoDate(registration?.tanggal_ditutup_pendaftaran) ?? parseIsoDate(input.reg_close_at);
  const matchStartAt = parseIsoDate(identity?.tanggal_mulai_pertandingan) ?? parseIsoDate(input.match_start_at);
  const tournamentEndAt = parseIsoDate(identity?.tanggal_berakhir_pertandingan) ?? parseIsoDate(input.tournament_end_at);

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
  const eventPayload = {
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
  };

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", finalSlug)
    .maybeSingle();

  if (existingEventError) {
    return NextResponse.json({ ok: false, error: existingEventError.message }, { status: 400 });
  }

  let eventId = "";
  let eventAction: "created" | "updated" = "created";

  if (existingEvent?.id) {
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update(eventPayload)
      .eq("id", existingEvent.id)
      .select("id")
      .single();

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 400 });
    }

    eventId = String(updatedEvent.id);
    eventAction = "updated";
  } else {
    const { data: createdEvent, error: createError } = await supabase
      .from("events")
      .insert({
        ...eventPayload,
        created_by: admin.id,
      })
      .select("id")
      .single();

    if (createError) {
      return NextResponse.json({ ok: false, error: createError.message }, { status: 400 });
    }

    eventId = String(createdEvent.id);
    eventAction = "created";
  }
  const { error: settingError } = await supabase.from("event_settings").upsert(
    {
      event_id: eventId,
      extra_config: input.meta ?? {},
    },
    { onConflict: "event_id" },
  );

  if (settingError) {
    return NextResponse.json(
      { ok: false, error: `Pertandingan tersimpan, tapi gagal simpan detail form: ${settingError.message}` },
      { status: 400 },
    );
  }

  if (identity && category) {
    const { error: profileError } = await supabase.from("event_profiles").upsert(
      {
        event_id: eventId,
        tournament_level: identity.tingkatan_pertandingan,
        organizer_level: identity.penyelenggara_pertandingan,
        province: identity.provinsi ?? null,
        city: identity.kabupaten_kota ?? null,
        venue_address: identity.alamat_tempat_pertandingan ?? null,
        venue_map_url: identity.link_map_lokasi_pertandingan ?? null,
        event_start_at: matchStartAt,
        event_end_at: tournamentEndAt,
        event_number_category: category.nomor_pertandingan,
        participant_total: category.jumlah_peserta,
        round_count: category.jumlah_babak === "Dua Babak" ? 2 : 1,
        round_one_system: category.sistem_babak_pertama,
        round_two_system:
          category.jumlah_babak === "Dua Babak" ? "Single Elimination/Babak Gugur" : null,
        prize_1: parseRupiahToNumber(prize?.juara_i),
        prize_2: parseRupiahToNumber(prize?.juara_ii),
        prize_3: parseRupiahToNumber(prize?.juara_iii),
        prize_4: parseRupiahToNumber(prize?.juara_iv),
        prize_5_8: parseRupiahToNumber(prize?.juara_v_viii),
        prize_9_16: parseRupiahToNumber(prize?.juara_ix_xvi),
        prize_17_32: parseRupiahToNumber(prize?.juara_xvii_xxxii),
        registration_open_at: regOpenAt,
        registration_close_at: regCloseAt,
        registration_fee: parseRupiahToNumber(registration?.biaya_pendaftaran),
      },
      { onConflict: "event_id" },
    );

    if (profileError) {
      return NextResponse.json(
        { ok: false, error: `Pertandingan tersimpan, tapi gagal simpan event_profiles: ${profileError.message}` },
        { status: 400 },
      );
    }
  }

  if (docs) {
    const docRows = [
      { doc_type: "org_recommendation", storage_path: docs.surat_rekomendasi_organisasi },
      { doc_type: "public_permit", storage_path: docs.surat_izin_keramaian },
      { doc_type: "flyer_16_9_1", storage_path: docs.flayer_1_16_9 },
      { doc_type: "flyer_16_9_2", storage_path: docs.flayer_2_16_9 },
      { doc_type: "flyer_9_16_1", storage_path: docs.flayer_3_9_16 },
      { doc_type: "flyer_9_16_2", storage_path: docs.flayer_4_9_16 },
    ].filter((row) => row.storage_path && row.storage_path.trim().length > 0);

    if (docRows.length > 0) {
      const { error: docError } = await supabase.from("event_documents").upsert(
        docRows.map((row) => ({
          event_id: eventId,
          doc_type: row.doc_type,
          storage_bucket: "idfes-assets",
          storage_path: row.storage_path!.trim(),
          file_name: extractFileNameFromPath(row.storage_path!.trim()),
          mime_type: inferMimeTypeByPath(row.storage_path!.trim()),
          uploaded_by: admin.id,
        })),
        { onConflict: "event_id,doc_type" },
      );

      if (docError) {
        return NextResponse.json(
          { ok: false, error: `Pertandingan tersimpan, tapi gagal simpan event_documents: ${docError.message}` },
          { status: 400 },
        );
      }
    }
  }

  return NextResponse.json({ ok: true, id: eventId, action: eventAction, slug: finalSlug });
}
