"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { PerformancePeriodId } from "@/lib/picks/performance-periods";
import {
  generateAnaliseCtaTelegram,
  generateAnaliseCtaYoutube,
  generateAnaliseResumoPost,
} from "@/lib/social-posts/generate-analise-posts";
import {
  generatePickGreenPost,
  generatePickNovaPost,
  generatePickPerformancePost,
  generatePickRedPost,
  generatePickStreakPost,
} from "@/lib/social-posts/generate-pick-posts";
import type { GerarPostPageData } from "@/lib/social-posts/gerar-post-data";
import {
  perfForPeriod,
  resolveDefaultPick,
} from "@/lib/social-posts/gerar-post-utils";
import type { SocialPostBundle } from "@/lib/social-posts/types";
import { cn } from "@/lib/utils";

type Tab = "picks" | "analises";

type PickTemplate =
  | "pick-green"
  | "pick-red"
  | "pick-nova"
  | "pick-streak"
  | "pick-performance";

type AnaliseTemplate =
  | "analise-resumo"
  | "analise-cta-telegram"
  | "analise-cta-youtube";

const PICK_TEMPLATES: { id: PickTemplate; label: string }[] = [
  { id: "pick-green", label: "Green" },
  { id: "pick-red", label: "Red" },
  { id: "pick-nova", label: "Nova pick" },
  { id: "pick-streak", label: "Streak" },
  { id: "pick-performance", label: "Performance" },
];

const ANALISE_TEMPLATES: { id: AnaliseTemplate; label: string }[] = [
  { id: "analise-resumo", label: "Resumo" },
  { id: "analise-cta-telegram", label: "CTA Telegram" },
  { id: "analise-cta-youtube", label: "CTA YouTube" },
];

const ACCENT_PREVIEW: Record<
  SocialPostBundle["accent"],
  string
> = {
  green: "border-emerald-500/40 bg-emerald-950/40",
  red: "border-red-500/40 bg-red-950/40",
  amber: "border-amber-500/40 bg-amber-950/30",
  gold: "border-amber-400/35 bg-amber-950/25",
  violet: "border-violet-500/35 bg-violet-950/30",
  neutral: "border-zinc-600/40 bg-zinc-900/50",
};

function CopyField({
  label,
  text,
  mono,
}: {
  label: string;
  text: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }, [text]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-black/40">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-300 transition hover:border-gold-400/30 hover:text-white"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden />
          )}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre
        className={cn(
          "max-h-48 overflow-auto whitespace-pre-wrap p-3 text-xs leading-relaxed text-zinc-300",
          mono && "font-mono",
        )}
      >
        {text}
      </pre>
    </div>
  );
}

function PostOutput({ bundle }: { bundle: SocialPostBundle | null }) {
  if (!bundle) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
        Selecciona um modelo e uma fonte para gerar o texto.
      </p>
    );
  }

  const allText = [
    `--- Instagram ---`,
    bundle.instagram,
    "",
    `--- Telegram ---`,
    bundle.telegram,
    "",
    `--- X / Twitter ---`,
    bundle.twitter,
    "",
    `--- Hashtags ---`,
    bundle.hashtags,
  ].join("\n");

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-2xl border p-5 shadow-lg",
          ACCENT_PREVIEW[bundle.accent],
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Preview
        </p>
        {bundle.preview.badge ? (
          <span className="mt-2 inline-block rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-zinc-300">
            {bundle.preview.badge}
          </span>
        ) : null}
        <h3 className="mt-2 font-display text-2xl font-bold text-white">
          {bundle.preview.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">{bundle.preview.subtitle}</p>
      </div>

      <CopyField label="Instagram" text={bundle.instagram} />
      <CopyField label="Telegram" text={bundle.telegram} />
      <CopyField label="X / Twitter" text={bundle.twitter} />
      <CopyField label="Hashtags" text={bundle.hashtags} mono />

      <CopyField label="Pacote completo" text={allText} />
    </div>
  );
}

type Props = {
  data: GerarPostPageData;
};

export function AdminGerarPostPanel({ data }: Props) {
  const [tab, setTab] = useState<Tab>("picks");
  const [pickTemplate, setPickTemplate] = useState<PickTemplate>("pick-green");
  const [analiseTemplate, setAnaliseTemplate] =
    useState<AnaliseTemplate>("analise-resumo");
  const [pickId, setPickId] = useState(
    () => resolveDefaultPick(data.picks, "green")?.id ?? "",
  );
  const [analiseSlug, setAnaliseSlug] = useState(
    () => data.analises[0]?.slug ?? "",
  );
  const [perfPeriod, setPerfPeriod] = useState<PerformancePeriodId>("30d");

  const pickOptions = useMemo(() => data.picks.slice(0, 80), [data.picks]);

  const selectedPick = useMemo(
    () => data.picks.find((p) => p.id === pickId) ?? null,
    [data.picks, pickId],
  );

  const selectedAnalise = useMemo(
    () => data.analises.find((a) => a.slug === analiseSlug) ?? null,
    [data.analises, analiseSlug],
  );

  const bundle = useMemo((): SocialPostBundle | null => {
    const { links } = data;

    if (tab === "picks") {
      if (pickTemplate === "pick-streak") {
        return generatePickStreakPost(perfForPeriod(data, perfPeriod), links);
      }
      if (pickTemplate === "pick-performance") {
        return generatePickPerformancePost(
          perfForPeriod(data, perfPeriod),
          links,
        );
      }
      if (!selectedPick) return null;
      if (pickTemplate === "pick-green")
        return generatePickGreenPost(selectedPick, links);
      if (pickTemplate === "pick-red")
        return generatePickRedPost(selectedPick, links);
      if (pickTemplate === "pick-nova")
        return generatePickNovaPost(selectedPick, links);
    }

    if (tab === "analises") {
      if (analiseTemplate === "analise-resumo") {
        if (!selectedAnalise) return null;
        return generateAnaliseResumoPost(selectedAnalise, links);
      }
      if (analiseTemplate === "analise-cta-telegram") {
        return generateAnaliseCtaTelegram(selectedAnalise, links);
      }
      if (analiseTemplate === "analise-cta-youtube") {
        return generateAnaliseCtaYoutube(selectedAnalise, links);
      }
    }

    return null;
  }, [
    tab,
    pickTemplate,
    analiseTemplate,
    selectedPick,
    selectedAnalise,
    data,
    perfPeriod,
  ]);

  function onPickTemplateChange(id: PickTemplate) {
    setPickTemplate(id);
    if (id === "pick-green") {
      const p = resolveDefaultPick(data.picks, "green");
      if (p) setPickId(p.id);
    } else if (id === "pick-red") {
      const p = resolveDefaultPick(data.picks, "red");
      if (p) setPickId(p.id);
    } else if (id === "pick-nova") {
      const p = resolveDefaultPick(data.picks, "nova");
      if (p) setPickId(p.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["picks", "Picks"],
            ["analises", "Análises"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide transition",
              tab === id
                ? "border-gold-400/40 bg-gold-500/10 text-gold-100"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-600",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <aside className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
          {tab === "picks" ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Modelo
              </p>
              <div className="flex flex-wrap gap-2">
                {PICK_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onPickTemplateChange(t.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs font-semibold transition",
                      pickTemplate === t.id
                        ? "border-gold-400/35 bg-gold-500/10 text-gold-100"
                        : "border-zinc-700 text-zinc-400 hover:text-zinc-200",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {(pickTemplate === "pick-streak" ||
                pickTemplate === "pick-performance") && (
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600">
                    Período métricas
                  </span>
                  <select
                    value={perfPeriod}
                    onChange={(e) =>
                      setPerfPeriod(e.target.value as PerformancePeriodId)
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2.5 text-sm text-white"
                  >
                    <option value="hoje">Hoje</option>
                    <option value="7d">7 dias</option>
                    <option value="30d">30 dias</option>
                    <option value="geral">Geral</option>
                  </select>
                </label>
              )}

              {pickTemplate !== "pick-streak" &&
                pickTemplate !== "pick-performance" && (
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600">
                      Pick
                    </span>
                    <select
                      value={pickId}
                      onChange={(e) => setPickId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2.5 text-sm text-white"
                    >
                      <option value="">— Seleccionar —</option>
                      {pickOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.resultado.toUpperCase()} · {p.jogo.slice(0, 40)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Modelo
              </p>
              <div className="flex flex-wrap gap-2">
                {ANALISE_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAnaliseTemplate(t.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs font-semibold transition",
                      analiseTemplate === t.id
                        ? "border-gold-400/35 bg-gold-500/10 text-gold-100"
                        : "border-zinc-700 text-zinc-400 hover:text-zinc-200",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600">
                  Análise (opcional nos CTAs)
                </span>
                <select
                  value={analiseSlug}
                  onChange={(e) => setAnaliseSlug(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2.5 text-sm text-white"
                >
                  <option value="">— Sem análise ligada —</option>
                  {data.analises.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.titulo.slice(0, 50)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </aside>

        <div>
          <PostOutput bundle={bundle} />
        </div>
      </div>
    </div>
  );
}
