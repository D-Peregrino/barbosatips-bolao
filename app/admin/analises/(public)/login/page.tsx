import { AdminAnalisesLoginClient } from "@/components/admin/analises/AdminAnalisesLoginClient";

export const metadata = {
  title: "Admin Análises · Login · BarbosaTips",
};

/**
 * Login editorial: autenticação desativada temporariamente; sem redirects automáticos.
 */
export default function AdminAnalisesLoginPage() {
  const senhaAdminConfigurada = Boolean(
    process.env.ADMIN_ANALISES_PASSWORD?.trim(),
  );

  return (
    <AdminAnalisesLoginClient senhaAdminConfigurada={senhaAdminConfigurada} />
  );
}
