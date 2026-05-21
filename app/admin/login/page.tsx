import { redirect } from "next/navigation";
import AdminLoginForm from "./login-form";
import { getSuperAdminFromSession } from "@/lib/auth/admin-session";
import { PublicShell } from "@/components/public-shell";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getSuperAdminFromSession();
  if (admin) redirect("/admin");

  return (
    <PublicShell>
      <div className="page-wrap admin-login-page">
        <div className="grid">
          <section className="panel admin-login-card">
            <h1>Masuk Super Admin</h1>
            <p>Masukkan email dan kata sandi untuk membuka dashboard admin.</p>
            <AdminLoginForm />
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
