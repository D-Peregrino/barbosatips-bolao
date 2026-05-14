"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { salvarNovaAnaliseEditorialAction } from "@/app/admin-editorial/actions";
import type { SalvarAnaliseEditorialResult } from "@/lib/admin-editorial/salvar-result";
import { siteConfig } from "@/config/site";
import { EditorialCapaUpload } from "@/components/admin-editorial/EditorialCapaUpload";
import { EditorialVisualEditor } from "@/components/admin-editorial/EditorialVisualEditor";

const initial: SalvarAnaliseEditorialResult = { ok: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-6 py-2.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.45)] transition enabled:hover:brightness-110 disabled:opacity-50"
    >
      {pending ? "A gravar…" : "Salvar"}
    </button>
  );
}

const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
const input =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";
const textarea =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";

export function NovaAnaliseFormSimple() {
  const [state, formAction] = useFormState(
    salvarNovaAnaliseEditorialAction,
    initial,
  );

  const erro = state?.ok === false ? state.error : "";

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="titulo" className={label}>
            Título
          </label>
          <input
            id="titulo"
            name="titulo"
            className={input}
            required
            autoComplete="off"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="slug" className={label}>
            Slug (URL)
          </label>
          <input
            id="slug"
            name="slug"
            className={input}
            placeholder="ex.: flamengo-x-palmeiras"
            required
            autoComplete="off"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="esporte" className={label}>
            Esporte (hub público)
          </label>
          <select id="esporte" name="esporte" className={input} defaultValue="futebol">
            {siteConfig.sports.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-zinc-600">
            Usado em rotas como /futebol e /basquete/nba — alinha com o campo esporte das picks.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="campeonato" className={label}>
            Campeonato
          </label>
          <input
            id="campeonato"
            name="campeonato"
            className={input}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="categoria" className={label}>
            Categoria
          </label>
          <input
            id="categoria"
            name="categoria"
            className={input}
            placeholder="ex.: Futebol, NBA, Valor"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="tags" className={label}>
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            className={input}
            placeholder="futebol, over, correct score, valor"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="time_casa" className={label}>
            Time casa
          </label>
          <input
            id="time_casa"
            name="time_casa"
            className={input}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="time_fora" className={label}>
            Time fora
          </label>
          <input
            id="time_fora"
            name="time_fora"
            className={input}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="odd" className={label}>
            Odd
          </label>
          <input
            id="odd"
            name="odd"
            type="text"
            inputMode="decimal"
            className={input}
            placeholder="2.10"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="confianca" className={label}>
            Confiança (0–100)
          </label>
          <input
            id="confianca"
            name="confianca"
            type="number"
            min={0}
            max={100}
            className={input}
            autoComplete="off"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="resumo" className={label}>
            Resumo
          </label>
          <textarea
            id="resumo"
            name="resumo"
            className={textarea}
            rows={3}
          />
        </div>
      </div>

      <EditorialVisualEditor />

      <div className="grid gap-5 sm:grid-cols-2">
        <EditorialCapaUpload />
        <div className="sm:col-span-2 flex flex-col gap-2 rounded-xl border border-[#3d3420]/60 bg-[#080706]/80 px-4 py-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="hidden" name="is_premium" value="0" />
            <input
              type="checkbox"
              name="is_premium"
              value="1"
              className="mt-1 h-4 w-4 rounded border-[#5c4d28] bg-[#050608] text-[#C9A227] focus:ring-[#C9A227]/50"
            />
            <span>
              <span className="block text-sm font-semibold text-[#E8D48B]">
                Conteúdo premium
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                Visível na íntegra apenas para assinantes Premium; outros vêem pré-visualização.
              </span>
            </span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="status" className={label}>
            Estado
          </label>
          <select id="status" name="status" className={input}>
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>
      </div>

      {erro ? (
        <p
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {erro}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <Link
          href="/admin-editorial"
          className="rounded-xl border border-[#5c4d28]/90 px-6 py-2.5 text-sm font-medium text-[#E8D48B] transition hover:border-[#C9A227]/50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
