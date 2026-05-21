import { NextResponse } from "next/server";
import { getSuperAdminFromSession } from "@/lib/auth/admin-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

function sanitizeFilename(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(req: Request) {
  const admin = await getSuperAdminFromSession();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.formData().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Payload form-data tidak valid." }, { status: 400 });
  }

  const target = String(body.get("target") ?? "");
  const file = body.get("file");

  if (target !== "logo" && target !== "hero") {
    return NextResponse.json({ ok: false, error: "Target upload tidak valid." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "File wajib dipilih." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ ok: false, error: "Ukuran file tidak valid (maks 10MB)." }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ ok: false, error: "Tipe file tidak didukung." }, { status: 400 });
  }

  const folder = target === "logo" ? "logos" : "hero";
  const safeName = sanitizeFilename(file.name);
  const objectPath = `${folder}/${Date.now()}-${safeName}`;

  const supabase = createAdminSupabaseClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from("idfes-assets").upload(objectPath, bytes, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: `Gagal upload file: ${error.message}` }, { status: 400 });
  }

  return NextResponse.json({ ok: true, path: objectPath });
}
