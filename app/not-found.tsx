import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export default function NotFound() {
  return (
    <PublicShell>
      <div className="page-wrap">
        <section className="panel">
          <h1>Halaman Tidak Ditemukan</h1>
          <p>Event atau halaman yang kamu buka tidak tersedia.</p>
          <p>
            <Link href="/">Kembali ke Beranda</Link>
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
