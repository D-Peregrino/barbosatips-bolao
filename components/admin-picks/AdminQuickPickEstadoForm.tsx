"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  guardarEstadoQuickPickAction,
  type SalvarQuickPickResult,
} from "@/app/admin-picks/actions";
import type { QuickPickResultado, QuickPickStatus } from "@/lib/picks/types";

const initial: SalvarQuickPickResult | undefined = undefined;

function SubmitEstado() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
    >
      {pending ? "…" : "Guardar"}
    </button>
  );
}

export function AdminQuickPickEstadoForm({
  pickId,
  status,
  resultado,
}: {
  pickId: string;
  status: QuickPickStatus;
  resultado: QuickPickResultado;
}) {
  const [state, formAction] = useFormState(guardarEstadoQuickPickAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
      <input type="hidden" name="pick_id" value={pickId} />
      <label className="flex flex-col gap-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
        Estado
        <select
          name="status"
          defaultValue={status}
          className="min-w-[110px] rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
        >
          <option value="ativo">ativo</option>
          <option value="encerrado">encerrado</option>
        </select>
      </label>
      <label className="flex flex-col gap-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
        Resultado
        <select
          name="resultado"
          defaultValue={resultado}
          className="min-w-[120px] rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
        >
          <option value="pendente">pendente</option>
          <option value="green">green</option>
          <option value="red">red</option>
          <option value="void">void</option>
        </select>
      </label>
      <SubmitEstado />
      {state && !state.ok ? (
        <span className="text-xs text-red-400">{state.error}</span>
      ) : null}
      {state?.ok ? (
        <span className="text-xs text-emerald-400">{state.message ?? "OK"}</span>
      ) : null}
    </form>
  );
}
