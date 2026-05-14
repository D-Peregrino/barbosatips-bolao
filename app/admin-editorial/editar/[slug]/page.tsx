import Link from "next/link";
import { notFound } from "next/navigation";
import { EditarAnaliseForm } from "@/components/admin-editorial/EditarAnaliseForm";
import { obterAnaliseAdminPorSlug } from "@/lib/analises/admin-queries";

export const metadata = {
  title: "Editar análise · Editorial · BarbosaTips",
};

type Props = { params: { slug: string } };

export default async function AdminEditorialEditarPage({ params }: Props) {
  const a = await obterAnaliseAdminPorSlug(params.slug);
  if (!a) notFound();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050608] px-4 py-10 text-white">
      <div className="relative mx-auto w-full max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
              Editorial
            </p>
            <h1 className="font-serif text-2xl font-bold sm:text-3xl">
              Editar análise
            </h1>
            <p className="mt-1 font-mono text-xs text-zinc-500">{a.slug}</p>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Use a barra dourada acima do campo Conteúdo para inserir markdown; a
              pré-visualização atualiza em tempo real.
            </p>
          </div>
          <Link
            href="/admin-editorial"
            className="text-sm font-medium text-zinc-400 underline-offset-2 hover:text-[#C9A227] hover:underline"
          >
            ← Início editorial
          </Link>
        </div>

        <section className="rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-6 sm:p-8">
          <EditarAnaliseForm key={a.id} initial={a} />
        </section>
      </div>
    </div>
  );
}
