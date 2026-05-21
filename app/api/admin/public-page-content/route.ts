import { NextResponse } from "next/server";
import { z } from "zod";
import { getSuperAdminFromSession } from "@/lib/auth/admin-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { DEFAULT_PUBLIC_PAGE_CONTENT, mergePublicPageContent } from "@/lib/public-page-content";

const PublicPageContentSchema = z.object({
  logo_filename: z.string().min(1),
  hero_image_filename: z.string().min(1),
  menu_home_label: z.string().min(1),
  menu_event_label: z.string().min(1),
  menu_rules_label: z.string().min(1),
  menu_contact_label: z.string().min(1),
  submenu_surabaya_label: z.string().min(1),
  submenu_surabaya_href: z.string().min(1),
  submenu_jakarta_label: z.string().min(1),
  submenu_jakarta_href: z.string().min(1),
  hero_badge: z.string().min(1),
  hero_title: z.string().min(1),
  hero_subtitle: z.string().min(1),
  hero_line1: z.string().min(1),
  hero_line2: z.string().min(1),
  hero_desc: z.string().min(1),
  hero_cta_label: z.string().min(1),
  hero_cta_href: z.string().min(1),
  footer_email: z.string().min(1),
  footer_address_line1: z.string().min(1),
  footer_address_line2: z.string().min(1),
  footer_address_line3: z.string().min(1),
});

export async function GET() {
  const admin = await getSuperAdminFromSession();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("public_page_content")
    .select("content")
    .eq("id", "home")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: `Gagal membaca public_page_content: ${error.message}` },
      { status: 400 },
    );
  }

  const content = mergePublicPageContent((data?.content ?? null) as Partial<typeof DEFAULT_PUBLIC_PAGE_CONTENT> | null);
  return NextResponse.json({ ok: true, content });
}

export async function PUT(req: Request) {
  const admin = await getSuperAdminFromSession();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = PublicPageContentSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Payload tidak valid.";
    return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
  }

  const content = parsed.data;
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("public_page_content").upsert(
    {
      id: "home",
      content,
      updated_by: admin.id,
    },
    { onConflict: "id" },
  );

  if (error) {
    return NextResponse.json(
      { ok: false, error: `Gagal menyimpan public_page_content: ${error.message}` },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
