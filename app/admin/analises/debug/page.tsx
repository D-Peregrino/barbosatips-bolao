import Link from "next/link";
import { cookies } from "next/headers";
import {
  ADMIN_ANALISES_COOKIE,
  adminAnalisesSessionSecret,
  verifyAdminAnalisesCookieValue,
} from "@/lib/admin/analises-cookie";
import { AdminAnalisesDebugClient } from "@/components/admin/analises/AdminAnalisesDebugClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Debug · Admin análises",
  robots: { index: false, follow: false },
};

export default async function AdminAnalisesDebugPage() {
  const adminAnalisesPasswordDefinida = Boolean(
    process.env.ADMIN_ANALISES_PASSWORD?.trim(),
  );

  const secret = adminAnalisesSessionSecret();
  const token = cookies().get(ADMIN_ANALISES_COOKIE)?.value;
  const autenticado =
    Boolean(secret) &&
    (await verifyAdminAnalisesCookieValue(token, secret));

  let statusAutenticacao: string;
  if (!secret) {
    statusAutenticacao =
      "Não autenticado: falta segredo no servidor (defina ADMIN_ANALISES_PASSWORD ou ADMIN_ANALISES_SESSION_SECRET e faça redeploy).";
  } else if (!token) {
    statusAutenticacao =
      "Não autenticado: cookie editorial ausente no pedido ao servidor.";
  } else if (autenticado) {
    statusAutenticacao = "Autenticado: cookie editorial válido (sessão ativa).";
  } else {
    statusAutenticacao =
      "Não autenticado: cookie presente mas inválido ou expirado.";
  }

  const cookieServidor = {
    nome: ADMIN_ANALISES_COOKIE,
    presente_no_pedido: Boolean(token),
    comprimento_valor: token?.length ?? 0,
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050608] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-lg font-semibold text-[#E8D48B]">
          Admin análises debug carregou
        </p>

        <section className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-4 text-sm">
          <h2 className="mb-2 font-semibold text-white">Servidor (RSC)</h2>
          <ul className="list-inside list-disc space-y-1 text-zinc-300">
            <li>
              ADMIN_ANALISES_PASSWORD existe:{" "}
              <strong className="text-white">
                {adminAnalisesPasswordDefinida ? "sim" : "não"}
              </strong>
            </li>
            <li>
              Segredo de assinatura (PASSWORD ou SESSION_SECRET) disponível:{" "}
              <strong className="text-white">{secret ? "sim" : "não"}</strong>
            </li>
            <li>Estado da autenticação editorial: {statusAutenticacao}</li>
            <li>
              Cookie no pedido ao servidor:{" "}
              <pre className="mt-1 inline-block rounded bg-black/50 p-2 text-xs">
                {JSON.stringify(cookieServidor, null, 2)}
              </pre>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-4 text-sm">
          <h2 className="mb-2 font-semibold text-white">Browser (cliente)</h2>
          <p className="text-zinc-400">
            Cookies visíveis em JS e chaves de localStorage (o cookie de sessão
            editorial é httpOnly).
          </p>
          <AdminAnalisesDebugClient />
        </section>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/admin/analises/login"
            className="text-[#C9A227] underline-offset-2 hover:underline"
          >
            Login editorial
          </Link>
          <Link
            href="/admin/analises/nova"
            className="text-[#C9A227] underline-offset-2 hover:underline"
          >
            Nova análise
          </Link>
          <Link
            href="/admin/analises"
            className="text-zinc-400 underline-offset-2 hover:underline"
          >
            Painel
          </Link>
        </div>

        <p className="text-xs text-zinc-500">
          Página temporária de diagnóstico. Remover ou proteger quando o fluxo
          estiver estável.
        </p>
      </div>
    </div>
  );
}
