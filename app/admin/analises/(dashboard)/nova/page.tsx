import dynamic from "next/dynamic";
import Link from "next/link";

const AdminNovaAnaliseForm = dynamic(
  () =>
    import("@/components/admin/analises/AdminNovaAnaliseForm").then(
      (m) => m.AdminNovaAnaliseForm,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="py-14 text-center text-sm text-zinc-400">
        A carregar formulário e editor…
      </div>
    ),
  },
);

export const metadata = {
  title: "Nova análise · Admin · BarbosaTips",
};

/**
 * Autenticação: layout (dashboard) redireciona uma única vez para /admin/analises/login
 * se a sessão for inválida. O formulário carrega só no cliente para evitar bloqueio
 * de hidratação / bundle com Tiptap.
 */
export default function AdminNovaAnalisePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050608] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,.22), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
              Admin · Editorial
            </p>
            <h1 className="font-serif text-2xl font-bold sm:text-3xl">
              Nova análise
            </h1>
          </div>
          <Link
            href="/admin/analises"
            className="text-sm font-medium text-zinc-400 underline-offset-2 hover:text-[#C9A227] hover:underline"
          >
            ← Voltar ao painel
          </Link>
        </div>

        <section className="rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-6 sm:p-8">
          <AdminNovaAnaliseForm />
        </section>
      </div>
    </div>
  );
}
