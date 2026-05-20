import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="panel">
        <h1>ID Festival 2026</h1>
        <p>Platform multi-event untuk pendaftaran, pairing, dan scoring pertandingan domino.</p>
      </section>

      <section className="grid two">
        <div className="panel">
          <h3>Publik</h3>
          <p>Pendaftaran peserta berdasarkan event slug.</p>
          <p>Contoh: <Link href="/events/id-fes-2026-jakarta">/events/id-fes-2026-jakarta</Link></p>
        </div>
        <div className="panel">
          <h3>Admin</h3>
          <p>Ringkasan event, pendaftar, dan kesiapan pairing.</p>
          <p><Link href="/admin">Buka dashboard admin</Link></p>
        </div>
      </section>
    </div>
  );
}
