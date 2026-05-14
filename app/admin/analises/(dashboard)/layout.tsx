import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_ANALISES_COOKIE,
  adminAnalisesSessionSecret,
  verifyAdminAnalisesCookieValue,
} from "@/lib/admin/analises-cookie";

export const dynamic = "force-dynamic";

/**
 * Painel editorial autenticado (Node). Evita checagem duplicada no middleware Edge,
 * onde variáveis como ADMIN_ANALISES_PASSWORD podem não estar disponíveis no Vercel
 * se não estiverem habilitadas para Edge Functions — o que gerava redirect/login em loop
 * ou carregamento infinito em rotas como /admin/analises/nova.
 */
export default async function AdminAnalisesPainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const secret = adminAnalisesSessionSecret();
  if (!secret) {
    redirect("/admin/analises/login?erro=config");
  }
  const token = cookies().get(ADMIN_ANALISES_COOKIE)?.value;
  if (!(await verifyAdminAnalisesCookieValue(token, secret))) {
    redirect("/admin/analises/login");
  }
  return <>{children}</>;
}
