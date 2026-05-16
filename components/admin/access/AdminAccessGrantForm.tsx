"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  ENTITLEMENTS,
  type EntitlementId,
} from "@/lib/access/entitlement-types";
import {
  grantAccessAction,
  type AccessActionState,
} from "@/app/admin/(panel)/acessos/actions";

const labels: Record<EntitlementId, string> = {
  vip_premium: "VIP Premium",
  bolao_copa: "Bolão Copa",
  discord_ouvinte: "Discord Ouvinte",
  bot_barbosa: "Bot do Barbosa",
  discord_voz: "Discord com Voz",
};

const initialState: AccessActionState = {
  ok: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-pitch-950 transition hover:brightness-105 disabled:opacity-60"
    >
      {pending ? "Concedendo..." : "Conceder acesso"}
    </button>
  );
}

export function AdminAccessGrantForm() {
  const [state, action] = useFormState(grantAccessAction, initialState);

  return (
    <form action={action} className="rounded-2xl border border-gold-400/12 bg-black/40 p-5">
      <h2 className="font-display text-lg font-bold text-white">Conceder acesso manual</h2>
      <p className="mt-1 text-sm text-stone-500">
        Liberação comercial separada para VIP, Bolão ou produtos da Lojinha.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white"
            placeholder="cliente@email.com"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500">
            Acesso
          </span>
          <select
            name="entitlement"
            required
            className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white"
          >
            {ENTITLEMENTS.map((entitlement) => (
              <option key={entitlement} value={entitlement}>
                {labels[entitlement]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500">
            Expira em
          </span>
          <input
            name="expires_at"
            type="datetime-local"
            className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white"
          />
        </label>

        <SubmitButton />
      </div>

      {state.message ? (
        <p className={state.ok ? "mt-4 text-sm text-emerald-300" : "mt-4 text-sm text-red-300"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
