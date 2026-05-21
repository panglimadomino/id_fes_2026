"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ReactNode, useEffect, useState } from "react";
import { buildPublicAssetUrl, DEFAULT_PUBLIC_PAGE_CONTENT, PublicPageContent, mergePublicPageContent } from "@/lib/public-page-content";

type TabKey = "home" | "events" | "rules" | "contact";

type PublicShellProps = {
  children: ReactNode;
  activeTab?: TabKey;
};

function navClass(tab: TabKey, activeTab?: TabKey) {
  return tab === activeTab ? "main-nav__active" : "";
}

export function PublicShell({ children, activeTab }: PublicShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [matchesOpen, setMatchesOpen] = useState(false);
  const [content, setContent] = useState<PublicPageContent>(DEFAULT_PUBLIC_PAGE_CONTENT);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const logoUrl = buildPublicAssetUrl(supabaseUrl, content.logo_filename);

  function closeMenu() {
    setMenuOpen(false);
    setMatchesOpen(false);
  }

  function handleEventsClick() {
    setMatchesOpen(true);
  }

  useEffect(() => {
    function syncDropdownWithHash() {
      setMatchesOpen(window.location.hash === "#about");
    }

    syncDropdownWithHash();
    window.addEventListener("hashchange", syncDropdownWithHash);
    return () => window.removeEventListener("hashchange", syncDropdownWithHash);
  }, []);

  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash.includes("type=recovery")) return;
    if (pathname === "/auth/recover") return;
    router.replace(`/auth/recover${hash}`);
  }, [pathname, router]);

  useEffect(() => {
    async function loadPublicContent() {
      if (!supabaseUrl || !supabaseAnonKey) return;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await supabase
        .from("public_page_content")
        .select("content")
        .eq("id", "home")
        .maybeSingle();
      const merged = mergePublicPageContent((data?.content ?? null) as Partial<PublicPageContent> | null);
      setContent(merged);
    }

    loadPublicContent();
  }, [supabaseAnonKey, supabaseUrl]);

  return (
    <div className="public-page">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" href="/" onClick={closeMenu}>
            {logoUrl ? <img className="brand__logo" src={logoUrl} alt="ID Festival 2026 Logo" /> : null}
            <span className="sr-only">ID Festival 2026</span>
          </Link>
          <button
            type="button"
            className={`menu-toggle ${menuOpen ? "menu-toggle--open" : ""}`}
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            id="main-nav"
            className={`main-nav ${menuOpen ? "main-nav--open" : ""}`}
            aria-label="Navigasi utama"
          >
            <Link href="/" className={navClass("home", activeTab)} onClick={closeMenu}>
              {content.menu_home_label}
            </Link>
            <div className={`nav-dropdown ${matchesOpen ? "nav-dropdown--open" : ""}`}>
              <Link
                href="/#about"
                className={`nav-dropdown__link ${activeTab === "events" ? "main-nav__active" : ""}`}
                onClick={handleEventsClick}
              >
                {content.menu_event_label}
              </Link>
              <button
                type="button"
                className="nav-dropdown__toggle"
                aria-expanded={matchesOpen}
                aria-label={matchesOpen ? "Tutup submenu ID Fes 2026" : "Buka submenu ID Fes 2026"}
                onClick={() => setMatchesOpen((prev) => !prev)}
              >
                <span className={`nav-dropdown__caret ${matchesOpen ? "nav-dropdown__caret--open" : ""}`} aria-hidden="true" />
              </button>
              <div className="nav-dropdown__menu">
                <Link href={content.submenu_surabaya_href} onClick={closeMenu}>
                  {content.submenu_surabaya_label}
                </Link>
                <Link href={content.submenu_jakarta_href} onClick={closeMenu}>
                  {content.submenu_jakarta_label}
                </Link>
              </div>
            </div>
            <Link href="/#rules" className={navClass("rules", activeTab)} onClick={closeMenu}>
              {content.menu_rules_label}
            </Link>
            <Link href="/#contact" className={navClass("contact", activeTab)} onClick={closeMenu}>
              {content.menu_contact_label}
            </Link>
            <Link href="/admin/login" className="main-nav__login" onClick={closeMenu}>
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      <main className="public-main">{children}</main>

      <footer className="site-footer" id="contact">
        <div className="site-footer__inner">
          <div className="footer-brand">
            {logoUrl ? <img className="footer-brand__logo" src={logoUrl} alt="ID Festival 2026 Logo" /> : null}
            <p>
              {content.footer_address_line1}
              <br />
              {content.footer_address_line2}
              <br />
              {content.footer_address_line3}
            </p>
            <p>Email: {content.footer_email}</p>
          </div>

          <div className="footer-sitemap">
            <h3>Halaman</h3>
            <div className="footer-sitemap__cols">
              <ul>
                <li>
                  <Link href="/">{content.menu_home_label}</Link>
                </li>
                <li>
                  <Link href="/#about">{content.menu_event_label}</Link>
                </li>
                <li>
                  <Link href={content.submenu_surabaya_href}>{content.submenu_surabaya_label}</Link>
                </li>
                <li>
                  <Link href={content.submenu_jakarta_href}>{content.submenu_jakarta_label}</Link>
                </li>
              </ul>
              <ul>
                <li>
                  <Link href="/#rules">{content.menu_rules_label}</Link>
                </li>
                <li>
                  <Link href="/#events">Jalur Kompetisi</Link>
                </li>
                <li>
                  <Link href="/admin/login">Masuk Admin</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-contact">
            <h3>Kontak</h3>
            <p>
              <a href={`mailto:${content.footer_email}`}>{content.footer_email}</a>
            </p>
            <p>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </p>
            <p>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                TikTok
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

