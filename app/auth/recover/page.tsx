import { PublicShell } from "@/components/public-shell";
import RecoverForm from "./recover-form";

export default function RecoverPage() {
  return (
    <PublicShell>
      <div className="page-wrap admin-login-page">
        <div className="grid">
          <RecoverForm />
        </div>
      </div>
    </PublicShell>
  );
}
