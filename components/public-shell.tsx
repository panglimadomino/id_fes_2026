"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";

type TabKey = "home" | "events" | "rules" | "contact";

type PublicShellProps = {
  children: ReactNode;
  activeTab?: TabKey;
};

function navClass(tab: TabKey, activeTab?: TabKey) {
  return tab === activeTab ? "main-nav__active" : "";
}

export function PublicShell({ children, activeTab }: PublicShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [matchesOpen, setMatchesOpen] = useState(false);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const logoUrl = supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/idfes-assets/${encodeURIComponent("ID FES 2026 LOGO.png")}`
    : null;

  function closeMenu() {
    setMenuOpen(false);
    setMatchesOpen(false);
  }

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
              Beranda
            </Link>
            <div className={`nav-dropdown ${matchesOpen ? "nav-dropdown--open" : ""}`}>
              <button
                type="button"
                className={`nav-dropdown__toggle ${activeTab === "events" ? "main-nav__active" : ""}`}
                aria-expanded={matchesOpen}
                onClick={() => setMatchesOpen((prev) => !prev)}
              >
                Pertandingan
              </button>
              <div className="nav-dropdown__menu">
                <Link href="/events/id-fes-2026-surabaya" onClick={closeMenu}>
                  Surabaya Domino Tournament
                </Link>
                <Link href="/events/id-fes-2026-jakarta" onClick={closeMenu}>
                  Jakarta Domino Tournament
                </Link>
              </div>
            </div>
            <Link href="/#rules" className={navClass("rules", activeTab)} onClick={closeMenu}>
              Peraturan
            </Link>
            <Link href="/#contact" className={navClass("contact", activeTab)} onClick={closeMenu}>
              Kontak
            </Link>
            <Link href="/admin/login" className="main-nav__login" onClick={closeMenu}>
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="site-footer" id="contact">
        <div className="site-footer__inner">
          <div>
            <h3>ID Festival 2026</h3>
            <p>Indonesia Domino Festival - Jakarta 2026</p>
          </div>
          <div>
            <p>
              Pendaftaran publik:{" "}
              <Link href="/events/id-fes-2026-jakarta">/events/id-fes-2026-jakarta</Link>
            </p>
            <p>
              Admin: <Link href="/admin/login">/admin/login</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
