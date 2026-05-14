import { redirect } from "next/navigation";

/** Login editorial unificado no painel central (`/admin/login`). */
export default function LegacyAdminAnalisesLoginPage() {
  redirect("/admin/login?redirect=/admin/analises");
}
