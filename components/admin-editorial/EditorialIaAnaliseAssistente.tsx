"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy, Sparkles, Wand2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IaAnaliseDraft, IaAnaliseInput, IaTemplateId } from "@/lib/admin-editorial/ai-analise/types";
import { IA_TEMPLATE_OPTIONS } from "@/lib/admin-editorial/ai-analise/types";
import { generateAnaliseDraftLocal } from "@/lib/admin-editorial/ai-analise/generate-local";

const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
const input =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#0a0a0a] shadow-[0_10px_32px_-12px_rgba(212,175,55,.5)] transition enabled:hover:brightness-110 disabled:opacity-45";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#5c4d28]/90 px-4 py-2.5 text-sm font-semibold text-[#E8D48B] transition hover:border-[#C9A227]/55";

export function EditorialIaAnaliseAssistente({
  onApply,
}: {
  onApply: (draft: IaAnaliseDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [jogo, setJogo] = useState("");
  const [campeonato, setCampeonato] = useState("");
  const [mercado, setMercado] = useState("");
  const [odd, setOdd] = useState("");
  const [confianca, setConfianca] = useState(68);
  const [dadosOpcionais, setDadosOpcionais] = useState("");
  const [template, setTemplate] = useState<IaTemplateId>("futebol");
  const [draft, setDraft] = useState<IaAnaliseDraft | null>(null);
  const [err, setErr] = useState("");

  const inputPayload = useMemo(
    (): IaAnaliseInput => ({
      jogo: jogo.trim(),
      campeonato: campeonato.trim(),
      mercado: mercado.trim(),
      odd: odd.trim(),
      confianca,
      dadosOpcionais: dadosOpcionais.trim(),
      template,
    }),
    [jogo, campeonato, mercado, odd, confianca, dadosOpcionais, template],
  );

  const gerar = useCallback(() => {
    setErr("");
    if (!inputPayload.jogo) {
      setErr("Indica o confronto (jogo).");
      return;
    }
    if (!inputPayload.mercado) {
      setErr("Indica o mercado (ex.: over 2.5, moneyline, handicap).");
      return;
    }
    if (!inputPayload.odd) {
      setErr("Indica a odd de referência.");
      return;
    }
    setDraft(generateAnaliseDraftLocal(inputPayload));
  }, [inputPayload]);

  const aplicar = useCallback(() => {
    if (!draft) return;
    onApply(draft);
    setOpen(false);
  }, [draft, onApply]);

  const copiarOpenAi = useCallback(async () => {
    if (!draft) return;
    const blob = JSON.stringify(
      {
        model: draft.openAiFuture.modelSuggestion,
        messages: [
          { role: "system", content: draft.openAiFuture.system },
          { role: "user", content: draft.openAiFuture.user },
        ],
      },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(blob);
    } catch {
      /* noop */
    }
  }, [draft]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          btnPrimary,
          "w-full sm:w-auto",
        )}
      >
        <Wand2 className="h-4 w-4 shrink-0" aria-hidden />
        Gerar análise com IA
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 p-3 pb-6 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editorial-ia-titulo"
        >
          <div className="max-h-[min(92dvh,900px)] w-full max-w-3xl overflow-hidden rounded-2xl border border-[#C9A227]/35 bg-[#0c0b09] shadow-[0_32px_80px_-24px_rgba(0,0,0,.9)]">
            <div className="flex items-start justify-between gap-3 border-b border-[#3d3420]/80 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p
                  id="editorial-ia-titulo"
                  className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white sm:text-xl"
                >
                  <Sparkles className="h-5 w-5 shrink-0 text-[#E8D48B]" aria-hidden />
                  Assistente IA
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Rascunho local (templates + prompts). Sem custo de API — editas tudo antes de gravar.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(min(92dvh,900px)-4.25rem)] overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="ia-jogo" className={label}>
                    Jogo / confronto
                  </label>
                  <input
                    id="ia-jogo"
                    className={input}
                    value={jogo}
                    onChange={(e) => setJogo(e.target.value)}
                    placeholder="ex.: Flamengo x Palmeiras ou Lakers vs Celtics"
                    autoComplete="off"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ia-camp" className={label}>
                    Campeonato
                  </label>
                  <input
                    id="ia-camp"
                    className={input}
                    value={campeonato}
                    onChange={(e) => setCampeonato(e.target.value)}
                    placeholder="ex.: Brasileirão, Wimbledon, NBA regular season"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="ia-mercado" className={label}>
                    Mercado
                  </label>
                  <input
                    id="ia-mercado"
                    className={input}
                    value={mercado}
                    onChange={(e) => setMercado(e.target.value)}
                    placeholder="ex.: over 2.5, ML casa, +1.5 sets"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="ia-odd" className={label}>
                    Odd
                  </label>
                  <input
                    id="ia-odd"
                    className={input}
                    value={odd}
                    onChange={(e) => setOdd(e.target.value)}
                    placeholder="2.05 ou 2,05"
                    inputMode="decimal"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="ia-conf" className={label}>
                    Confiança (0–100)
                  </label>
                  <input
                    id="ia-conf"
                    type="number"
                    min={0}
                    max={100}
                    className={input}
                    value={confianca}
                    onChange={(e) => setConfianca(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <p className={label}>Template editorial</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {IA_TEMPLATE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTemplate(opt.id)}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-left text-sm transition",
                          template === opt.id
                            ? "border-[#C9A227]/70 bg-[#C9A227]/10 text-[#F5E6A8]"
                            : "border-[#3d3420]/80 bg-[#050608] text-zinc-300 hover:border-[#5c4d28]",
                        )}
                      >
                        <span className="font-bold">{opt.label}</span>
                        <span className="mt-0.5 block text-[11px] text-zinc-500">{opt.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ia-extra" className={label}>
                    Dados opcionais
                  </label>
                  <textarea
                    id="ia-extra"
                    className={cn(input, "min-h-[88px] resize-y")}
                    value={dadosOpcionais}
                    onChange={(e) => setDadosOpcionais(e.target.value)}
                    placeholder="Lesões, clima, escalações, linha de arbitragem, modelo de xG, etc."
                    rows={3}
                  />
                </div>
              </div>

              {err ? (
                <p className="mt-3 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                  {err}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className={btnPrimary} onClick={gerar}>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Gerar rascunho
                </button>
                {draft ? (
                  <>
                    <button type="button" className={btnGhost} onClick={aplicar}>
                      Aplicar ao formulário
                    </button>
                    <button type="button" className={btnGhost} onClick={copiarOpenAi}>
                      <Copy className="h-4 w-4" aria-hidden />
                      Copiar payload OpenAI
                    </button>
                  </>
                ) : null}
              </div>

              {draft ? (
                <div className="mt-6 space-y-4 rounded-xl border border-[#3d3420]/70 bg-[#080706]/90 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C9A227]">
                    Pré-visualização
                  </p>
                  <dl className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-[10px] font-bold uppercase text-zinc-500">Título</dt>
                      <dd className="font-semibold text-white">{draft.titulo}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase text-zinc-500">Slug</dt>
                      <dd className="font-mono text-xs text-[#E8D48B]">{draft.slug}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase text-zinc-500">Esporte (hub)</dt>
                      <dd>{draft.esporte}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[10px] font-bold uppercase text-zinc-500">Resumo</dt>
                      <dd className="leading-relaxed">{draft.resumo}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[10px] font-bold uppercase text-zinc-500">SEO description (≤160)</dt>
                      <dd className="text-zinc-400">{draft.seoDescription}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase text-zinc-500">Tags</dt>
                      <dd className="text-xs">{draft.tags}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase text-zinc-500">Categoria</dt>
                      <dd>{draft.categoria}</dd>
                    </div>
                  </dl>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase text-zinc-500">Markdown (estrutura)</p>
                    <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#3d3420]/60 bg-black/50 p-3 text-[11px] leading-relaxed text-zinc-400">
                      {draft.conteudoMarkdown.slice(0, 2800)}
                      {draft.conteudoMarkdown.length > 2800 ? "\n…" : ""}
                    </pre>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
