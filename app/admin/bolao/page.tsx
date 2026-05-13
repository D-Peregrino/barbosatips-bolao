import type { Metadata } from "next";
import { AdminBolaoPanel } from "@/components/admin/bolao/AdminBolaoPanel";

export const metadata: Metadata = {
  title: "Admin Bolão · Copa 2026",
  description: "Painel administrativo do bolão BarbosaTips.",
};

export default function AdminBolaoPage() {
  return <AdminBolaoPanel />;
}
