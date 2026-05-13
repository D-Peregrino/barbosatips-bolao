import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ADMIN_BOLAO_COOKIE,
  adminBolaoSessionSecret,
  verifyAdminBolaoCookieValue,
} from "@/lib/admin/bolao-cookie";
import { AdminBolaoLoginClient } from "@/components/admin/bolao/AdminBolaoLoginClient";

export const metadata = {
  title: "Admin Bolão · Login",
};

export default async function AdminBolaoLoginPage() {
  const secret = adminBolaoSessionSecret();
  if (secret) {
    const token = cookies().get(ADMIN_BOLAO_COOKIE)?.value;
    if (await verifyAdminBolaoCookieValue(token, secret)) {
      redirect("/admin/bolao");
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050608]" />}>
      <AdminBolaoLoginClient />
    </Suspense>
  );
}
