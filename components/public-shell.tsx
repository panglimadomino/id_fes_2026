import Link from "next/link";
import { ReactNode } from "react";

type TabKey = "home" | "about" | "events" | "why" | "contact";

type PublicShellProps = {
  children: ReactNode;
  activeTab?: TabKey;
};

function navClass(tab: TabKey, activeTab?: TabKey) {
  return tab === activeTab ? "main-nav__active" : "";
}

export function PublicShell({ children, activeTab }: PublicShellProps) {
  return (
    <div className="public-page">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" href="/">
            <span className="brand__title">ID Festival 2026</span>
            <span className="brand__sub">Indonesia Domino Festival</span>
          </Link>
          <nav className="main-nav" aria-label="Navigasi utama">
            <Link href="/" className={navClass("home", activeTab)}>
              Beranda
            </Link>
            <Link href="/#about" className={navClass("about", activeTab)}>
              Tentang
            </Link>
            <Link href="/#events" className={navClass("events", activeTab)}>
              Event
            </Link>
            <Link href="/#why" className={navClass("why", activeTab)}>
              Keunggulan
            </Link>
            <Link href="/#contact" className={navClass("contact", activeTab)}>
              Kontak
            </Link>
            <Link href="/admin/login" className="main-nav__login">
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
