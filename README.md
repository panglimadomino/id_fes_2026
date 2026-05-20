# ID FES Web (Next.js + Supabase)

Scaffold awal web untuk sistem multi-event ID FES.

## Fitur MVP
- Halaman publik pendaftaran: `/events/[slug]`
- API pendaftaran: `POST /api/register`
- Dashboard admin ringkas: `/admin`

## Menjalankan lokal
1. Copy `.env.example` -> `.env.local`
2. Isi:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Install dependency:
   - `npm install`
4. Jalankan dev server:
   - `npm run dev`

## Catatan pairing RR
Pairing RR tetap manual oleh super admin (sesuai kebutuhan), tidak otomatis saat peserta daftar.
Gunakan SQL `004c` dengan `v_generate_now := true` setelah pendaftaran ditutup.

## Deploy Vercel
1. Push folder ini ke repo GitHub
2. Import repo di Vercel
3. Tambahkan environment variables yang sama seperti `.env.local`
4. Deploy
