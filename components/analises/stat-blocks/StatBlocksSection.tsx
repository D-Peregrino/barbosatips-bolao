import type { StatBlocksPayload } from "@/lib/analises/stat-blocks/types";
import { StatBlockView } from "@/components/analises/stat-blocks/StatBlockView";

type Props = {
  blocks: StatBlocksPayload;
  timeCasa: string;
  timeFora: string;
};

/**
 * Secção premium de métricas — preparada para futura hidratação via APIs esportivas.
 */
export function StatBlocksSection({ blocks, timeCasa, timeFora }: Props) {
  if (!blocks.length) return null;

  return (
    <section
      className="mb-10 space-y-4"
      aria-label="Blocos estatísticos"
    >
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C9A227]">Métricas</p>
          <h2 className="font-display text-lg font-bold text-white sm:text-xl">Painel estatístico</h2>
        </div>
        <p className="max-w-xs text-right text-[10px] text-zinc-600">
          Dados editoriais — substitui por feeds oficiais quando integrares API.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((b) => (
          <div key={b.id} className="min-w-0">
            <StatBlockView block={b} timeCasa={timeCasa} timeFora={timeFora} />
          </div>
        ))}
      </div>
    </section>
  );
}
