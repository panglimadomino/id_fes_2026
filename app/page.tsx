import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export default function HomePage() {
  return (
    <PublicShell activeTab="home">
      <section className="hero">
        <div className="hero__overlay" />
        <div className="hero__content">
          <p className="hero__date">22-25 Oktober 2026</p>
          <h1 className="hero__title">Kota yang bertanding. Festival yang merayakan.</h1>
          <p className="hero__desc">
            Platform multi-event untuk pendaftaran, pairing, dan scoring pertandingan domino.
          </p>
          <div className="hero__cta">
            <Link href="/events/id-fes-2026-jakarta" className="btn btn--light">
              Daftar Sekarang
            </Link>
            <Link href="/admin" className="btn btn--ghost">
              Dashboard Admin
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
                <h3>Jadwal Fleksibel</h3>
                <p>Setiap event punya jadwal pendaftaran, pairing, dan match yang berbeda.</p>
              </article>
              <article>
                <h3>Skor Real-Time</h3>
                <p>Sistem RR + SE dan progression bracket otomatis saat skor diinput.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section--dark" id="events">
          <div className="section__inner">
            <h2>Jalur Kompetisi</h2>
            <div className="tracks">
              <div className="track">Pendaftaran Publik</div>
              <div className="track">Fase Round Robin</div>
              <div className="track">Single Elimination</div>
              <div className="track">Papan Skor Langsung</div>
            </div>
          </div>
        </section>

        <section className="section section--light" id="why">
          <div className="section__inner two-col">
            <div>
              <h2>Kenapa ikut ID Festival?</h2>
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
                <strong>100% Terstruktur</strong>
                <span>Data peserta, jadwal, skor, dan bracket tertata</span>
              </div>
              <div>
                <strong>Kontrol Pairing Manual</strong>
                <span>Pairing dibuat super admin saat pendaftaran ditutup</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
