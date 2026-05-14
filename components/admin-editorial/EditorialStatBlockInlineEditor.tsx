"use client";

import type { StatBlock } from "@/lib/analises/stat-blocks/types";

const inp =
  "w-full rounded-lg border border-[#3d3420]/90 bg-[#050608] px-3 py-2 text-sm text-white outline-none focus:border-[#C9A227]/50";
const lab = "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500";

type R<T extends StatBlock> = { block: T; onReplace: (_next: StatBlock) => void };

function num(v: string, fallback: number): number {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function int(v: string, fallback: number): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function EditorialStatBlockInlineEditor({ block, onReplace }: { block: StatBlock; onReplace: (_next: StatBlock) => void }) {
  switch (block.kind) {
    case "probability_1x2":
      return <Prob901 block={block} onReplace={onReplace} />;
    case "fair_odd":
      return <Fair901 block={block} onReplace={onReplace} />;
    case "ev_plus":
      return <Ev901 block={block} onReplace={onReplace} />;
    case "form_recent":
      return <Form901 block={block} onReplace={onReplace} />;
    case "h2h":
      return <H2h901 block={block} onReplace={onReplace} />;
    case "expected_goals":
      return <Xg901 block={block} onReplace={onReplace} />;
    case "over_under":
      return <Ou901 block={block} onReplace={onReplace} />;
    case "heatmap_simple":
      return <Heat901 block={block} onReplace={onReplace} />;
    case "compare_chart":
      return <Cmp901 block={block} onReplace={onReplace} />;
    case "confidence_bar":
      return <Conf901 block={block} onReplace={onReplace} />;
    default: {
      const _e: never = block;
      void _e;
      return null;
    }
  }
}

function TitleField({ block, onReplace }: { block: StatBlock; onReplace: (_next: StatBlock) => void }) {
  return (
    <div className="mb-3">
      <label className={lab}>Título do bloco</label>
      <input
        className={inp}
        value={block.title ?? ""}
        onChange={(e) => onReplace({ ...block, title: e.target.value } as StatBlock)}
      />
    </div>
  );
}

function Prob901({ block, onReplace }: R<Extract<StatBlock, { kind: "probability_1x2" }>>) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="sm:col-span-3">
        <TitleField block={block} onReplace={onReplace} />
      </div>
      {(
        [
          ["vitoriaCasa", "Vitória casa", block.vitoriaCasa],
          ["empate", "Empate", block.empate],
          ["vitoriaFora", "Vitória fora", block.vitoriaFora],
        ] as const
      ).map(([k, label, val]) => (
        <div key={k}>
          <label className={lab}>{label} %</label>
          <input
            type="number"
            min={0}
            max={100}
            className={inp}
            value={val}
            onChange={(e) =>
              onReplace({
                ...block,
                [k]: int(e.target.value, val),
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

function Fair901({ block, onReplace }: R<Extract<StatBlock, { kind: "fair_odd" }>>) {
  return (
    <div className="space-y-3">
      <TitleField block={block} onReplace={onReplace} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={lab}>Odd justa</label>
          <input
            className={inp}
            value={String(block.oddJusta)}
            onChange={(e) => onReplace({ ...block, oddJusta: num(e.target.value, block.oddJusta) })}
          />
        </div>
        <div>
          <label className={lab}>Odd mercado (opcional)</label>
          <input
            className={inp}
            value={block.oddMercado != null ? String(block.oddMercado) : ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              onReplace({
                ...block,
                oddMercado: v ? num(v, 0) : undefined,
              });
            }}
          />
        </div>
      </div>
      <div>
        <label className={lab}>Mercado (texto)</label>
        <input
          className={inp}
          value={block.mercado ?? ""}
          onChange={(e) => onReplace({ ...block, mercado: e.target.value })}
        />
      </div>
      <div>
        <label className={lab}>Nota</label>
        <textarea className={inp} rows={2} value={block.nota ?? ""} onChange={(e) => onReplace({ ...block, nota: e.target.value })} />
      </div>
    </div>
  );
}

function Ev901({ block, onReplace }: R<Extract<StatBlock, { kind: "ev_plus" }>>) {
  return (
    <div className="space-y-3">
      <TitleField block={block} onReplace={onReplace} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={lab}>EV %</label>
          <input
            className={inp}
            value={String(block.evPercent)}
            onChange={(e) => onReplace({ ...block, evPercent: num(e.target.value, block.evPercent) })}
          />
        </div>
        <div>
          <label className={lab}>P modelo (0–1)</label>
          <input
            className={inp}
            value={block.probModelo != null ? String(block.probModelo) : ""}
            onChange={(e) =>
              onReplace({
                ...block,
                probModelo: e.target.value.trim() ? num(e.target.value, 0) : undefined,
              })
            }
          />
        </div>
        <div>
          <label className={lab}>P implícita (0–1)</label>
          <input
            className={inp}
            value={block.probImplicita != null ? String(block.probImplicita) : ""}
            onChange={(e) =>
              onReplace({
                ...block,
                probImplicita: e.target.value.trim() ? num(e.target.value, 0) : undefined,
              })
            }
          />
        </div>
      </div>
      <div>
        <label className={lab}>Nota</label>
        <textarea className={inp} rows={2} value={block.nota ?? ""} onChange={(e) => onReplace({ ...block, nota: e.target.value })} />
      </div>
    </div>
  );
}

function Form901({ block, onReplace }: R<Extract<StatBlock, { kind: "form_recent" }>>) {
  return (
    <div className="space-y-3">
      <TitleField block={block} onReplace={onReplace} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={lab}>Sequência casa (WDL)</label>
          <input className={inp} value={block.sequenciaCasa} onChange={(e) => onReplace({ ...block, sequenciaCasa: e.target.value })} />
        </div>
        <div>
          <label className={lab}>Sequência fora (WDL)</label>
          <input className={inp} value={block.sequenciaFora} onChange={(e) => onReplace({ ...block, sequenciaFora: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function H2h901({ block, onReplace }: R<Extract<StatBlock, { kind: "h2h" }>>) {
  const updateLine = (i: number, patch: Partial<(typeof block.linhas)[0]>) => {
    const linhas = block.linhas.map((ln, j) => (j === i ? { ...ln, ...patch } : ln));
    onReplace({ ...block, linhas });
  };
  const add = () => onReplace({ ...block, linhas: [...block.linhas, { resultado: "Casa", placar: "0-0" }] });
  const del = (i: number) => onReplace({ ...block, linhas: block.linhas.filter((_, j) => j !== i) });
  return (
    <div className="space-y-3">
      <TitleField block={block} onReplace={onReplace} />
      {block.linhas.map((ln, i) => (
        <div key={i} className="grid gap-2 rounded-lg border border-[#3d3420]/60 p-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input className={inp} placeholder="Data" value={ln.data ?? ""} onChange={(e) => updateLine(i, { data: e.target.value })} />
          <input className={inp} placeholder="Resultado" value={ln.resultado} onChange={(e) => updateLine(i, { resultado: e.target.value })} />
          <input className={inp} placeholder="Placar" value={ln.placar ?? ""} onChange={(e) => updateLine(i, { placar: e.target.value })} />
          <button type="button" className="rounded-lg border border-red-500/40 px-2 text-xs text-red-300" onClick={() => del(i)}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="rounded-lg border border-[#5c4d28] px-3 py-1.5 text-xs font-semibold text-[#E8D48B]" onClick={add}>
        + Linha
      </button>
    </div>
  );
}

function Xg901({ block, onReplace }: R<Extract<StatBlock, { kind: "expected_goals" }>>) {
  return (
    <div className="space-y-3">
      <TitleField block={block} onReplace={onReplace} />
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["xgCasa", "xG casa", block.xgCasa],
            ["xgFora", "xG fora", block.xgFora],
            ["xgaCasa", "xGA casa", block.xgaCasa],
            ["xgaFora", "xGA fora", block.xgaFora],
          ] as const
        ).map(([k, label, val]) => (
          <div key={k}>
            <label className={lab}>{label}</label>
            <input
              className={inp}
              value={val != null ? String(val) : ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                onReplace({
                  ...block,
                  [k]: v ? num(v, 0) : undefined,
                } as Extract<StatBlock, { kind: "expected_goals" }>);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Ou901({ block, onReplace }: R<Extract<StatBlock, { kind: "over_under" }>>) {
  return (
    <div className="space-y-3">
      <TitleField block={block} onReplace={onReplace} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={lab}>Linha</label>
          <input className={inp} value={String(block.linha)} onChange={(e) => onReplace({ ...block, linha: num(e.target.value, block.linha) })} />
        </div>
        <div>
          <label className={lab}>Over %</label>
          <input
            type="number"
            className={inp}
            value={block.overPercent}
            onChange={(e) => onReplace({ ...block, overPercent: int(e.target.value, block.overPercent) })}
          />
        </div>
        <div>
          <label className={lab}>Under %</label>
          <input
            type="number"
            className={inp}
            value={block.underPercent}
            onChange={(e) => onReplace({ ...block, underPercent: int(e.target.value, block.underPercent) })}
          />
        </div>
      </div>
      <div>
        <label className={lab}>Contexto</label>
        <input className={inp} value={block.contexto ?? ""} onChange={(e) => onReplace({ ...block, contexto: e.target.value })} />
      </div>
    </div>
  );
}

function Heat901({ block, onReplace }: R<Extract<StatBlock, { kind: "heatmap_simple" }>>) {
  const regen = (rows: number, cols: number) => {
    const cells = Array.from({ length: rows * cols }, (_, i) => ((i * 7) % 10) / 12 + 0.25);
    onReplace({ ...block, rows, cols, cells });
  };
  return (
    <div className="space-y-3">
      <TitleField block={block} onReplace={onReplace} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={lab}>Linhas</label>
          <input
            type="number"
            className={inp}
            value={block.rows}
            onChange={(e) => {
              const rows = int(e.target.value, block.rows);
              regen(rows, block.cols);
            }}
          />
        </div>
        <div>
          <label className={lab}>Colunas</label>
          <input
            type="number"
            className={inp}
            value={block.cols}
            onChange={(e) => {
              const cols = int(e.target.value, block.cols);
              regen(block.rows, cols);
            }}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            className="w-full rounded-lg border border-[#C9A227]/40 px-2 py-2 text-xs font-bold text-[#E8D48B]"
            onClick={() => regen(block.rows, block.cols)}
          >
            Regenerar células
          </button>
        </div>
      </div>
      <p className="text-[10px] text-zinc-600">Placeholder até API devolver matriz real.</p>
    </div>
  );
}

function Cmp901({ block, onReplace }: R<Extract<StatBlock, { kind: "compare_chart" }>>) {
  const patchMetric = (i: number, patch: Partial<(typeof block.metricas)[0]>) => {
    const metricas = block.metricas.map((m, j) => (j === i ? { ...m, ...patch } : m));
    onReplace({ ...block, metricas });
  };
  return (
    <div className="space-y-3">
      <TitleField block={block} onReplace={onReplace} />
      {block.metricas.map((m, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-3">
          <input className={inp} value={m.label} onChange={(e) => patchMetric(i, { label: e.target.value })} />
          <input
            type="number"
            className={inp}
            value={m.casa}
            onChange={(e) => patchMetric(i, { casa: int(e.target.value, m.casa) })}
          />
          <input
            type="number"
            className={inp}
            value={m.fora}
            onChange={(e) => patchMetric(i, { fora: int(e.target.value, m.fora) })}
          />
        </div>
      ))}
    </div>
  );
}

function Conf901({ block, onReplace }: R<Extract<StatBlock, { kind: "confidence_bar" }>>) {
  return (
    <div className="space-y-3">
      <TitleField block={block} onReplace={onReplace} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={lab}>Valor (0–100)</label>
          <input
            type="number"
            className={inp}
            value={block.value}
            onChange={(e) => onReplace({ ...block, value: int(e.target.value, block.value) })}
          />
        </div>
        <div>
          <label className={lab}>Subtítulo</label>
          <input className={inp} value={block.subtitulo ?? ""} onChange={(e) => onReplace({ ...block, subtitulo: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
