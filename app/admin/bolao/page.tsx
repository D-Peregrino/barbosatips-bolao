import type { Metadata } from "next";
import { AdminBolaoPanel } from "@/components/admin/bolao/AdminBolaoPanel";

/**
 * Painel `/admin/bolao` (cliente: `AdminBolaoPanel`).
 * Após salvar resultado: estado local com retorno do upsert (`flushSync`), depois
 * `carregarResultadosSalvos()` e `carregarRanking()`; toast “Resultado salvo” só após isso.
 * Sem `location.reload()`.
 */

export const metadata: Metadata = {
  title: "Admin Bolão · Copa 2026",
  description: "Painel administrativo do bolão BarbosaTips.",
};

export default function AdminBolaoPage() {
  return <AdminBolaoPanel />;
}
