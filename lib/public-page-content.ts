export type PublicPageContent = {
  logo_filename: string;
  hero_image_filename: string;
  menu_home_label: string;
  menu_event_label: string;
  menu_rules_label: string;
  menu_contact_label: string;
  submenu_surabaya_label: string;
  submenu_surabaya_href: string;
  submenu_jakarta_label: string;
  submenu_jakarta_href: string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_line1: string;
  hero_line2: string;
  hero_desc: string;
  hero_cta_label: string;
  hero_cta_href: string;
  footer_email: string;
  footer_address_line1: string;
  footer_address_line2: string;
  footer_address_line3: string;
};

export const DEFAULT_PUBLIC_PAGE_CONTENT: PublicPageContent = {
  logo_filename: "ID FES 2026 LOGO.png",
  hero_image_filename: "ID FES HERO BACKROUND.jpg",
  menu_home_label: "Beranda",
  menu_event_label: "ID Fes 2026",
  menu_rules_label: "Peraturan",
  menu_contact_label: "Kontak",
  submenu_surabaya_label: "Surabaya",
  submenu_surabaya_href: "/events/id-fes-2026-surabaya",
  submenu_jakarta_label: "DKI Jakarta",
  submenu_jakarta_href: "/events/id-fes-2026-jakarta",
  hero_badge: "Coming Soon",
  hero_title: "Jakarta Domino Tournament (Seri 2)",
  hero_subtitle: "Semarak HUT DKI Jakarta ke-499",
  hero_line1: "Turnamen Domino Skala Nasional",
  hero_line2: "Multi Category Tournament",
  hero_desc: "Saatnya para pecinta domino dari berbagai daerah bersaing dalam satu ajang kompetisi bergengsi",
  hero_cta_label: "Daftar Sekarang",
  hero_cta_href: "/events/id-fes-2026-jakarta",
  footer_email: "panitia@idfestival2026.id",
  footer_address_line1: "Jl. Percetakan Negara No.158 NO.158, RT.1/RW.5, Rawasari,",
  footer_address_line2: "Kec. Cemp. Putih, Kota Jakarta Pusat,",
  footer_address_line3: "Daerah Khusus Ibukota Jakarta 10520",
};

export function mergePublicPageContent(input?: Partial<PublicPageContent> | null): PublicPageContent {
  if (!input) return DEFAULT_PUBLIC_PAGE_CONTENT;
  return {
    ...DEFAULT_PUBLIC_PAGE_CONTENT,
    ...input,
  };
}

export function buildPublicAssetUrl(supabaseUrl: string | undefined, objectPath: string): string | null {
  if (!supabaseUrl) return null;
  const normalized = objectPath.trim().replace(/^\/+/, "");
  if (!normalized) return null;
  const encodedPath = normalized
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${supabaseUrl}/storage/v1/object/public/idfes-assets/${encodedPath}`;
}
