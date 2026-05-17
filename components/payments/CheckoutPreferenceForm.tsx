"use client";

import { useState } from "react";

type Props = {
  productCode: string;
  productTitle: string;
  productDescription: string;
  amount: number;
  disabledReason?: string | null;
};

export function CheckoutPreferenceForm({
  productCode,
  productTitle,
  productDescription,
  amount,
  disabledReason,
}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (disabledReason) {
      setError(disabledReason);
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Informe um email válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_code: productCode, email: cleanEmail }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        init_point?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.init_point) {
        throw new Error(data.error || "Não foi possível iniciar o checkout.");
      }
      window.location.href = data.init_point;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="font-display text-xl font-bold text-white">{productTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{productDescription}</p>
        <p className="mt-4 text-sm font-bold text-gold-200">
          R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Email que receberá o acesso
        </span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="voce@email.com"
          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-gold-400/55"
        />
      </label>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {disabledReason ? <p className="text-sm text-amber-200">{disabledReason}</p> : null}

      <button
        type="submit"
        disabled={loading || Boolean(disabledReason)}
        className="inline-flex w-full min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 px-5 text-sm font-bold text-pitch-950 transition hover:brightness-105 disabled:opacity-50"
      >
        {loading ? "Criando checkout..." : "Pagar com Mercado Pago"}
      </button>
    </form>
  );
}
