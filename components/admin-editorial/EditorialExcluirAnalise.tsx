"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { excluirAnaliseEditorialAction } from "@/app/admin-editorial/actions";
import type { ExcluirAnaliseEditorialResult } from "@/lib/admin-editorial/salvar-result";

const resultadoInicial: ExcluirAnaliseEditorialResult = { ok: true };

function ExcluirButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="rounded-xl border border-red-500/50 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
    >
      {pending ? "A excluir…" : "Excluir definitivamente"}
    </button>
  );
}

type Props = {
  id: string;
  slug: string;
  titulo: string;
};

export function EditorialExcluirAnalise({ id, slug, titulo }: Props) {
  const [aberto, setAberto] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [state, formAction] = useFormState(excluirAnaliseEditorialAction, resultadoInicial);

  const slugOk = confirmSlug.trim().toLowerCase() === slug.trim().toLowerCase();
  const erro = state?.ok === false ? state.error : "";

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-xl border border-red-500/35 px-5 py-2.5 text-sm font-medium text-red-300/90 transition hover:border-red-500/60 hover:text-red-200"
      >
        Excluir análise
      </button>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-red-500/30 bg-red-950/20 p-5">
      <p className="text-sm font-semibold text-red-200">Excluir análise</p>
      <p className="mt-1 text-xs text-zinc-400">
        Esta ação remove <span className="text-zinc-200">{titulo || slug}</span> da base de
        dados. Não pode ser desfeita.
      </p>
      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={id} />
        <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Digite o slug para confirmar: <span className="font-mono text-red-200/90">{slug}</span>
        </label>
        <input
          type="text"
          name="slug_confirm"
          value={confirmSlug}
          onChange={(e) => setConfirmSlug(e.target.value)}
          className="w-full max-w-md rounded-xl border border-red-500/30 bg-[#050608] px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-red-400/60"
          placeholder={slug}
          autoComplete="off"
        />
        {erro ? (
          <p className="text-sm text-red-300" role="alert">
            {erro}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <ExcluirButton disabled={!slugOk} />
          <button
            type="button"
            onClick={() => {
              setAberto(false);
              setConfirmSlug("");
            }}
            className="rounded-xl border border-[#5c4d28]/90 px-5 py-2.5 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            Cancelar
          </button>
        </div>
      </form>
      {!slugOk && confirmSlug.length > 0 ? (
        <p className="mt-2 text-xs text-zinc-500">O slug deve coincidir exactamente.</p>
      ) : null}
    </div>
  );
}
