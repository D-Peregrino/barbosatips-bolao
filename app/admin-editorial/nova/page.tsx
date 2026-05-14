import Link from "next/link";
import { NovaAnaliseFormSimple } from "@/components/admin-editorial/NovaAnaliseFormSimple";

export const metadata = {
  title: "Nova análise · Editorial · BarbosaTips",
};

export default function AdminEditorialNovaPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050608] px-4 py-10 text-white">
      <div className="relative mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8D48B]">
              Editorial
            </p>
            <h1 className="font-serif text-2xl font-bold sm:text-3xl">
              Nova análise
            </h1>
          </div>
          <Link
            href="/admin-editorial"
            className="text-sm font-medium text-zinc-400 underline-offset-2 hover:text-[#C9A227] hover:underline"
          >
            ← Início editorial
          </Link>
        </div>

        <section className="rounded-2xl border border-[#3d3420]/90 bg-[#0c0b09]/90 p-6 sm:p-8">
          <NovaAnaliseFormSimple />
        </section>
      </div>
    </div>
  );
}
