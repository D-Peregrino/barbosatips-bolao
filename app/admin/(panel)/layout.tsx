import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_PANEL_COOKIE,
  adminPanelSessionSecret,
  parseAdminPanelCookie,
} from "@/lib/admin/panel-cookie";
import { AdminShellClient } from "@/components/admin/shell/AdminShellClient";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(ADMIN_PANEL_COOKIE)?.value;
  const secret = adminPanelSessionSecret();
  const session = secret ? await parseAdminPanelCookie(token, secret) : null;
  if (!session) {
    redirect("/admin/login?redirect=/admin");
  }

  return <AdminShellClient session={session}>{children}</AdminShellClient>;
}
