import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel">
      <h1>Halaman Tidak Ditemukan</h1>
      <p>Event atau halaman yang kamu buka tidak tersedia.</p>
      <p><Link href="/">Kembali ke Beranda</Link></p>
    </section>
  );
}
