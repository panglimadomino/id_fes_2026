import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-page" id="home">
      <header className="site-header">
        <div className="site-header__inner">
          <a className="brand" href="#home">
            <span className="brand__title">ID Festival 2026</span>
            <span className="brand__sub">Indonesia Domino Festival</span>
          </a>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#events">Events</a>
            <a href="#why">Why Join</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero__overlay" />
        <div className="hero__content">
          <p className="hero__date">22-25 October 2026</p>
          <h1 className="hero__title">A city that plays. A festival that celebrates.</h1>
          <p className="hero__desc">
            Platform multi-event untuk pendaftaran, pairing, dan scoring pertandingan domino.
          </p>
          <div className="hero__cta">
            <Link href="/events/id-fes-2026-jakarta" className="btn btn--light">
              Register Now
            </Link>
            <Link href="/admin" className="btn btn--ghost">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      <main>
        <section className="section section--light" id="about">
          <div className="section__inner two-col">
            <div>
              <h2>Jakarta Domino Festival bukan sekadar pertandingan.</h2>
              <p>
                Ini panggung untuk komunitas dari berbagai daerah, tempat bertemu, bertanding,
                dan merayakan sportivitas domino Indonesia.
              </p>
            </div>
            <div className="feature-list">
              <article>
                <h3>Multi Event</h3>
                <p>Super admin dapat membuat banyak pertandingan dalam satu website.</p>
              </article>
              <article>
                <h3>Flexible Schedule</h3>
                <p>Setiap event punya jadwal pendaftaran, pairing, dan match yang berbeda.</p>
              </article>
              <article>
                <h3>Live Scoring</h3>
                <p>Sistem RR + SE dan progression bracket otomatis saat skor diinput.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section--dark" id="events">
          <div className="section__inner">
            <h2>Event Tracks</h2>
            <div className="tracks">
              <div className="track">Public Registration</div>
              <div className="track">Round Robin Phase</div>
              <div className="track">Single Elimination</div>
              <div className="track">Live Result Board</div>
            </div>
          </div>
        </section>

        <section className="section section--light" id="why">
          <div className="section__inner two-col">
            <div>
              <h2>Why join ID Festival?</h2>
              <p>
                Sistem digital memudahkan peserta daftar, panitia verifikasi, dan pertandingan
                berjalan transparan dari pairing sampai final.
              </p>
            </div>
            <div className="metrics">
              <div>
                <strong>1 Platform</strong>
                <span>Semua event dalam satu dashboard</span>
              </div>
              <div>
                <strong>100% Structured</strong>
                <span>Data peserta, jadwal, skor, dan bracket tertata</span>
              </div>
              <div>
                <strong>Manual Pairing Control</strong>
                <span>Pairing dibuat super admin saat pendaftaran ditutup</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div className="site-footer__inner">
          <div>
            <h3>ID Festival 2026</h3>
            <p>Indonesia Domino Festival - Jakarta 2026</p>
          </div>
          <div>
            <p>
              Public registration:{" "}
              <Link href="/events/id-fes-2026-jakarta">/events/id-fes-2026-jakarta</Link>
            </p>
            <p>
              Admin: <Link href="/admin">/admin</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
