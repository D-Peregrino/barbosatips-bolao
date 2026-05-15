import type { Metadata } from "next";
import { AdminPanelShell } from "@/components/admin/shell/AdminPanelShell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminEditorialLayout({ children }: { children: React.ReactNode }) {
  return <AdminPanelShell>{children}</AdminPanelShell>;
}
