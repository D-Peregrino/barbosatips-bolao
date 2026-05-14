import type { MarketAgg, SportAgg } from "@/lib/tipsters/aggregate-picks";

type Props = {
  markets: MarketAgg[];
  sports: SportAgg[];
};

export function TipsterLeaderboards({ markets, sports }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="commercial-card-elevated rounded-2xl border p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-cream">Melhores mercados</h2>
        <p className="mt-1 text-xs text-stone-500">Por unidades líquidas (mín. 2 picks encerradas).</p>
        <ul className="mt-4 space-y-2">
          {markets.length === 0 ? (
            <li className="text-sm text-stone-500">Sem amostra suficiente.</li>
          ) : (
            markets.map((m, i) => (
              <li
                key={m.mercado}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-black/30 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gold-400/20 text-xs font-bold text-gold-300">
                    {i + 1}
                  </span>
                  <span className="truncate text-sm font-semibold text-cream">{m.mercado}</span>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <p className="font-mono font-bold text-gold-200">
                    {m.units > 0 ? "+" : ""}
                    {m.units}u
                  </p>
                  <p className="text-stone-500">
                    {m.taxa != null ? `${m.taxa}%` : "—"} · {m.greens}G {m.reds}R
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="commercial-card-elevated rounded-2xl border p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-cream">Melhores esportes</h2>
        <p className="mt-1 text-xs text-stone-500">Por unidades e taxa (mín. 2 picks encerradas).</p>
        <ul className="mt-4 space-y-2">
          {sports.length === 0 ? (
            <li className="text-sm text-stone-500">Sem amostra suficiente.</li>
          ) : (
            sports.map((s, i) => (
              <li
                key={s.esporte}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-black/30 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gold-400/20 text-xs font-bold text-gold-300">
                    {i + 1}
                  </span>
                  <span className="truncate text-sm font-semibold text-cream">{s.label}</span>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <p className="font-mono font-bold text-gold-200">
                    {s.units > 0 ? "+" : ""}
                    {s.units}u
                  </p>
                  <p className="text-stone-500">
                    {s.taxa != null ? `${s.taxa}%` : "—"} · {s.greens}G {s.reds}R
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
