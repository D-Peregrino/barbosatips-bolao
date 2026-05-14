"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { atualizarAnaliseEditorialAction } from "@/app/admin-editorial/actions";
import type { SalvarAnaliseEditorialResult } from "@/lib/admin-editorial/salvar-result";
import { EditorialCapaUpload } from "@/components/admin-editorial/EditorialCapaUpload";
import { EditorialVisualEditor } from "@/components/admin-editorial/EditorialVisualEditor";
import type { AnaliseRow } from "@/lib/analises/types";
import { oddParaNumero } from "@/lib/analises/types";

const resultadoInicial: SalvarAnaliseEditorialResult = { ok: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-6 py-2.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_12px_40px_-12px_rgba(212,175,55,.45)] transition enabled:hover:brightness-110 disabled:opacity-50"
    >
      {pending ? "A gravar…" : "Salvar alterações"}
    </button>
  );
}

const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500";
const input =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";
const textarea =
  "w-full rounded-xl border border-[#3d3420]/90 bg-[#050608] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9A227]/60";

type Props = { initial: AnaliseRow };

export function EditarAnaliseForm({ initial }: Props) {
  const [state, formAction] = useFormState(
    atualizarAnaliseEditorialAction,
    resultadoInicial,
  );

  const erro = state?.ok === false ? state.error : "";
  const slugAnterior = String(initial.slug ?? "").trim().toLowerCase();

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="slug_anterior" value={slugAnterior} />

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
            defaultValue={initial.titulo}
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
            required
            autoComplete="off"
            defaultValue={initial.slug}
          />
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
            defaultValue={initial.campeonato}
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
            defaultValue={initial.time_casa}
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
            defaultValue={initial.time_fora}
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
            defaultValue={
              Number.isFinite(oddParaNumero(initial.odd))
                ? oddParaNumero(initial.odd).toString()
                : ""
            }
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
            defaultValue={String(initial.confianca)}
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
            defaultValue={initial.resumo}
          />
        </div>
      </div>

      <EditorialVisualEditor
        key={`${initial.id}-conteudo`}
        defaultValue={initial.conteudo}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <EditorialCapaUpload key={initial.slug} defaultValue={initial.imagem_capa} />
        <div className="sm:col-span-2">
          <label htmlFor="status" className={label}>
            Estado
          </label>
          <select
            id="status"
            name="status"
            className={input}
            defaultValue={initial.status}
          >
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
