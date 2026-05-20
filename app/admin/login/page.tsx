import { redirect } from "next/navigation";
import AdminLoginForm from "./login-form";
import { getSuperAdminFromSession } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getSuperAdminFromSession();
  if (admin) redirect("/admin");

  return (
    <div className="page-wrap">
      <div className="grid">
        <section className="panel" style={{ maxWidth: 520 }}>
          <h1>Masuk Super Admin</h1>
          <p>Masukkan email dan kata sandi untuk membuka dashboard admin.</p>
          <AdminLoginForm />
        </section>
      </div>
    </div>
  );
}

