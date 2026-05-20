import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";

const athleteSchema = z.object({
  fullName: z.string().min(2),
  wa: z.string().min(8),
  gender: z.enum(["LAKI-LAKI", "PEREMPUAN"]),
  dob: z.string().min(8),
  age: z.number().int().min(0).max(120),
});

const registrationSchema = z.object({
  eventSlug: z.string().min(3),
  teamName: z.string().min(2),
  provinsi: z.string().min(2),
  kabKota: z.string().min(2),
  athlete1: athleteSchema,
  athlete2: athleteSchema,
});

function makeOrderId() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${stamp}-${rand}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Payload tidak valid", detail: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createPublicSupabaseClient();

    const { data: eventRow, error: eventError } = await supabase
      .from("events")
      .select("id, slug")
      .eq("slug", parsed.data.eventSlug)
      .maybeSingle<{ id: string; slug: string }>();

    if (eventError || !eventRow) {
      return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
    }

    const orderId = makeOrderId();

    const { data: regRow, error: regError } = await supabase
      .from("registrations")
      .insert({
        event_id: eventRow.id,
        order_id: orderId,
        team_name: parsed.data.teamName,
        provinsi: parsed.data.provinsi,
        kab_kota: parsed.data.kabKota,
        payment_status: "pending",
        source: "public_web",
      })
      .select("id")
      .single<{ id: string }>();

    if (regError || !regRow) {
      return NextResponse.json({ error: regError?.message ?? "Gagal membuat registrasi" }, { status: 400 });
    }

    const athletes = [parsed.data.athlete1, parsed.data.athlete2];

    const { error: athleteError } = await supabase.from("registration_athletes").insert(
      athletes.map((a, idx) => ({
        registration_id: regRow.id,
        athlete_no: idx + 1,
        full_name: a.fullName,
        wa: a.wa,
        gender: a.gender,
        dob: a.dob,
        age: a.age,
      }))
    );

    if (athleteError) {
      return NextResponse.json({ error: athleteError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, orderId });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", detail: String(error) }, { status: 500 });
  }
}
