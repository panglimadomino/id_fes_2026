import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ID FES 2026",
  description: "Platform pendaftaran dan manajemen pertandingan multi-event",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
