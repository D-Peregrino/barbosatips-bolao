"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { siteConfig } from "@/config/site";
import {
  criarQuickPickAction,
  type SalvarQuickPickResult,
} from "@/app/admin-picks/actions";

const initial: SalvarQuickPickResult | undefined = undefined;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "A publicar…" : "Publicar pick"}
    </button>
  );
}

export function AdminQuickPickForm() {
  const [state, formAction] = useFormState(criarQuickPickAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const defaultHorario = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Esporte
          </span>
          <select
            name="esporte"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            defaultValue="futebol"
          >
            {siteConfig.sports.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Campeonato
          </span>
          <input
            name="campeonato"
            type="text"
            placeholder="Ex.: Brasileirão Série A"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Jogo <span className="text-red-400">*</span>
        </span>
        <input
          name="jogo"
          type="text"
          required
          placeholder="Ex.: Flamengo x Palmeiras"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Mercado <span className="text-red-400">*</span>
        </span>
        <input
          name="mercado"
          type="text"
          required
          placeholder="Ex.: Over 2.5 gols / Vitória mandante"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Odd
          </span>
          <input
            name="odd"
            type="text"
            inputMode="decimal"
            placeholder="1,85"
            defaultValue="1.90"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Confiança (%)
          </span>
          <input
            name="confianca"
            type="number"
            min={0}
            max={100}
            defaultValue={72}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Horário do jogo <span className="text-red-400">*</span>
          </span>
          <input
            name="horario_jogo"
            type="datetime-local"
            required
            defaultValue={defaultHorario()}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Justificativa curta
        </span>
        <textarea
          name="justificativa"
          rows={2}
          maxLength={400}
          placeholder="Linha de valor, lesões, ritmo recente…"
          className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
        />
      </label>

      <div className="rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="hidden" name="is_premium" value="0" />
          <input
            type="checkbox"
            name="is_premium"
            value="1"
            className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/40"
          />
          <span>
            <span className="block text-sm font-semibold text-zinc-200">Conteúdo premium</span>
            <span className="mt-0.5 block text-xs text-zinc-500">
              Pick visível na íntegra só para assinantes; visitantes vêem pré-visualização em /picks.
            </span>
          </span>
        </label>
      </div>

      {state && !state.ok ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
          {state.message ?? "Gravado."}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
