import type { Metadata } from "next";
import { AdminBolaoPanel } from "@/components/admin/bolao/AdminBolaoPanel";
import { carregarResultadosSalvosBolao } from "@/app/admin/bolao/actions";

/**
 * Painel `/admin/bolao`: resultados oficiais vêm de `public.bolao_resultados_teste`
 * (SSR + `carregarResultadosSalvos` no cliente com a mesma server action / service role).
 */

export const metadata: Metadata = {
  title: "Admin Bolão · Copa 2026",
  description: "Painel administrativo do bolão BarbosaTips.",
};

export const dynamic = "force-dynamic";

export default async function AdminBolaoPage() {
  const res = await carregarResultadosSalvosBolao();
  const initialResultados = res.ok ? res.rows : [];

  return <AdminBolaoPanel initialResultados={initialResultados} />;
}
