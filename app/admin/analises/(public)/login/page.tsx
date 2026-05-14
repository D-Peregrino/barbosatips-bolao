import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_ANALISES_COOKIE,
  adminAnalisesSessionSecret,
  verifyAdminAnalisesCookieValue,
} from "@/lib/admin/analises-cookie";
import { AdminAnalisesLoginClient } from "@/components/admin/analises/AdminAnalisesLoginClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Análises · Login · BarbosaTips",
};

export default async function AdminAnalisesLoginPage() {
  const senhaAdminConfigurada = Boolean(
    process.env.ADMIN_ANALISES_PASSWORD?.trim(),
  );

  const secret = adminAnalisesSessionSecret();
  if (secret) {
    const token = cookies().get(ADMIN_ANALISES_COOKIE)?.value;
    if (await verifyAdminAnalisesCookieValue(token, secret)) {
      redirect("/admin/analises");
    }
  }

  return <AdminAnalisesLoginClient senhaAdminConfigurada={senhaAdminConfigurada} />;
}
