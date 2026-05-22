import { NextResponse } from "next/server";
import { getSuperAdminFromSession } from "@/lib/auth/admin-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const TARGET_MIME_RULES = {
  org_recommendation: new Set(["image/png", "image/jpeg", "application/pdf"]),
  public_permit: new Set(["image/png", "image/jpeg", "application/pdf"]),
  flyer_16_9_1: new Set(["image/png", "image/jpeg"]),
  flyer_16_9_2: new Set(["image/png", "image/jpeg"]),
  flyer_9_16_1: new Set(["image/png", "image/jpeg"]),
  flyer_9_16_2: new Set(["image/png", "image/jpeg"]),
} as const;

type UploadTarget = keyof typeof TARGET_MIME_RULES;

const TARGET_FOLDER: Record<UploadTarget, string> = {
  org_recommendation: "events/documents/rekomendasi",
  public_permit: "events/documents/izin-keramaian",
  flyer_16_9_1: "events/flyers/16-9",
  flyer_16_9_2: "events/flyers/16-9",
  flyer_9_16_1: "events/flyers/9-16",
  flyer_9_16_2: "events/flyers/9-16",
};

function sanitizeFilename(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
}

function isValidTarget(value: string): value is UploadTarget {
  return value in TARGET_MIME_RULES;
}

export async function POST(req: Request) {
  const admin = await getSuperAdminFromSession();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Payload form-data tidak valid." }, { status: 400 });
  }

  const target = String(formData.get("target") ?? "");
  const file = formData.get("file");

  if (!isValidTarget(target)) {
    return NextResponse.json({ ok: false, error: "Target upload dokumen tidak valid." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "File dokumen wajib dipilih." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ ok: false, error: "Ukuran file tidak valid (maks 10MB)." }, { status: 400 });
  }
  if (!TARGET_MIME_RULES[target].has(file.type)) {
    return NextResponse.json({ ok: false, error: "Tipe file tidak didukung untuk dokumen ini." }, { status: 400 });
  }

  const folder = TARGET_FOLDER[target];
  const objectPath = `${folder}/${Date.now()}-${sanitizeFilename(file.name)}`;
  const supabase = createAdminSupabaseClient();
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage.from("idfes-assets").upload(objectPath, bytes, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: `Gagal upload dokumen: ${error.message}` }, { status: 400 });
  }

  return NextResponse.json({ ok: true, path: objectPath });
}
