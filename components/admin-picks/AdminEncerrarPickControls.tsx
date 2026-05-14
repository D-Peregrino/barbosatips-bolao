"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  encerrarQuickPickAction,
  type SalvarQuickPickResult,
} from "@/app/admin-picks/actions";

const initial: SalvarQuickPickResult | undefined = undefined;

function EncerrarButtons({ pickId }: { pickId: string }) {
  const [greenState, greenAction] = useFormState(encerrarQuickPickAction, initial);
  const [redState, redAction] = useFormState(encerrarQuickPickAction, initial);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={greenAction} className="inline">
        <input type="hidden" name="pick_id" value={pickId} />
        <input type="hidden" name="resultado" value="green" />
        <EncerrarSubmit label="Green" variant="green" />
      </form>
      <form action={redAction} className="inline">
        <input type="hidden" name="pick_id" value={pickId} />
        <input type="hidden" name="resultado" value="red" />
        <EncerrarSubmit label="Red" variant="red" />
      </form>
      {greenState && !greenState.ok ? (
        <span className="text-xs text-red-400">{greenState.error}</span>
      ) : null}
      {redState && !redState.ok ? (
        <span className="text-xs text-red-400">{redState.error}</span>
      ) : null}
      {(greenState?.ok || redState?.ok) ? (
        <span className="text-xs text-emerald-400">Atualizado.</span>
      ) : null}
    </div>
  );
}

function EncerrarSubmit({
  label,
  variant,
}: {
  label: string;
  variant: "green" | "red";
}) {
  const { pending } = useFormStatus();
  const cls =
    variant === "green"
      ? "border-emerald-500/50 bg-emerald-600/20 text-emerald-200 hover:bg-emerald-600/35"
      : "border-red-500/50 bg-red-600/20 text-red-200 hover:bg-red-600/35";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition disabled:opacity-50 ${cls}`}
    >
      {pending ? "…" : label}
    </button>
  );
}

export function AdminEncerrarPickControls({
  pickId,
  status,
  resultado,
}: {
  pickId: string;
  status: "ativo" | "encerrado";
  resultado: "green" | "red" | null;
}) {
  const fechadaComResultado =
    status === "encerrado" && (resultado === "green" || resultado === "red");

  if (fechadaComResultado) {
    return (
      <span
        className={`text-xs font-bold uppercase ${
          resultado === "green" ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {resultado === "green" ? "Green" : "Red"}
      </span>
    );
  }

  return <EncerrarButtons pickId={pickId} />;
}
