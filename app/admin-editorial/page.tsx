import Link from "next/link";

export const metadata = {
  title: "Admin Editorial · BarbosaTips",
};

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function AdminEditorialPage({ searchParams }: Props) {
  const g = searchParams?.gravado;
  const gravado = g === "1" || (Array.isArray(g) && g[0] === "1");
  const s = searchParams?.slug;
  const slug =
    typeof s === "string" ? s : Array.isArray(s) ? s[0] ?? "" : "";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050608] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        {gravado ? (
          <p className="mb-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Análise gravada
            {slug ? (
              <>
                {" "}
                — slug: <code className="text-emerald-200">{slug}</code>.{" "}
                <Link
                  href={`/analise/${encodeURIComponent(slug)}`}
                  className="font-medium text-emerald-200 underline-offset-2 hover:underline"
                >
                  Ver no site
                </Link>{" "}
                (só se estiver publicada).
              </>
            ) : null}
          </p>
        ) : null}

        <h1 className="font-serif text-3xl font-bold text-[#E8D48B]">
          Admin Editorial BarbosaTips
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Formulário simples; conteúdo em texto; grava na tabela{" "}
          <code className="text-zinc-300">analises</code> (service role no
          servidor).
        </p>

        <Link
          href="/admin-editorial/nova"
          className="mt-8 inline-flex rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-6 py-3 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.45)] transition hover:brightness-110"
        >
          Nova análise
        </Link>

        <p className="mt-10 text-sm text-zinc-500">
          <Link href="/analises" className="text-[#C9A227] hover:underline">
            Ver análises publicadas
          </Link>
        </p>
      </div>
    </div>
  );
}
