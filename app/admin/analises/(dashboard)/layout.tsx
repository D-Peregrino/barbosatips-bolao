import { AdminPanelShell } from "@/components/admin/shell/AdminPanelShell";

export default function AdminAnalisesDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelShell>{children}</AdminPanelShell>;
}
