import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "ID FES 2026",
  description: "Platform pendaftaran dan manajemen pertandingan multi-event",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
