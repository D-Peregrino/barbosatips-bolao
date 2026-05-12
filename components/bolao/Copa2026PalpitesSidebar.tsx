"use client";

export function Copa2026PalpitesSidebar() {
  return (
    <aside className="w-full shrink-0 space-y-3 lg:w-[280px] xl:w-[300px]">
      <div className="border border-[#1a1a1a] bg-[#0d0d0d] shadow-[0_0_0_1px_rgba(234,179,8,0.12)]">
        <div className="border-b-2 border-yellow-500 bg-[#111] px-3 py-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400">
            Pontuação
          </h2>
        </div>
        <ul className="space-y-2.5 px-3 py-3 text-[11px] leading-snug text-zinc-400">
          <li className="flex gap-2">
            <span className="shrink-0 font-mono font-bold text-yellow-400">3</span>
            <span>
              <span className="font-semibold text-zinc-200">pts</span> — placar exato
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-mono font-bold text-yellow-400">1</span>
            <span>
              <span className="font-semibold text-zinc-200">pt</span> — acertou vencedor
              ou empate
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-mono font-bold text-zinc-500">0</span>
            <span>
              <span className="font-semibold text-zinc-200">pt</span> — erro
            </span>
          </li>
        </ul>
      </div>

      <div className="border border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="border-b-2 border-yellow-500 bg-[#111] px-3 py-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400">
            Regras rápidas
          </h2>
        </div>
        <div className="space-y-2 px-3 py-3 text-[10px] leading-relaxed text-zinc-500">
          <p>
            Palpite por jogo com <span className="text-zinc-300">Salvar Palpite</span>.
            Use <span className="text-yellow-500/90">Confirmar todos</span> ao finalizar
            a rodada.
          </p>
          <p className="border-t border-zinc-800 pt-2 text-zinc-600">
            Status: <span className="text-emerald-400">aberto</span>,{" "}
            <span className="text-yellow-400">quase</span>,{" "}
            <span className="text-zinc-500">encerrado</span>.
          </p>
        </div>
      </div>
    </aside>
  );
}
