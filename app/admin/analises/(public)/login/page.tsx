import { AdminAnalisesLoginClient } from "@/components/admin/analises/AdminAnalisesLoginClient";

export const metadata = {
  title: "Admin Análises · Login · BarbosaTips",
};

/**
 * Login editorial: cookie httpOnly após senha correta (middleware protege o painel).
 */
export default function AdminAnalisesLoginPage() {
  const senhaAdminConfigurada = Boolean(
    process.env.ADMIN_ANALISES_PASSWORD?.trim(),
  );

  return (
    <AdminAnalisesLoginClient senhaAdminConfigurada={senhaAdminConfigurada} />
  );
}
