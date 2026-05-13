import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ADMIN_ANALISES_COOKIE,
  adminAnalisesSessionSecret,
  verifyAdminAnalisesCookieValue,
} from "@/lib/admin/analises-cookie";
import { AdminAnalisesLoginClient } from "@/components/admin/analises/AdminAnalisesLoginClient";

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

  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] bg-[#050608]" />}>
      <AdminAnalisesLoginClient senhaAdminConfigurada={senhaAdminConfigurada} />
    </Suspense>
  );
}
