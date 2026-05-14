"use client";

import { useCallback, useState, useTransition } from "react";
import { siteConfig } from "@/config/site";
import { submitLeadAction } from "@/lib/leads/actions";
import type { LeadSource } from "@/lib/leads/types";
import { cn } from "@/lib/utils";

export type LeadCaptureFormProps = {
  source: LeadSource;
  variant?: "full" | "compact";
  className?: string;
  /** Após sucesso, esconder formulário e mostrar mensagem */
  dismissOnSuccess?: boolean;
  onSuccess?: () => void;
};

export function LeadCaptureForm({
  source,
  variant = "full",
  className,
  dismissOnSuccess = false,
  onSuccess,
}: LeadCaptureFormProps) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = useCallback(
    (fd: FormData) => {
      setMsg(null);
      const company = String(fd.get("company") ?? "");
      const payload = {
        email: String(fd.get("email") ?? ""),
        name: String(fd.get("name") ?? "") || null,
        favorite_sport: String(fd.get("favorite_sport") ?? "futebol"),
        want_picks: fd.get("want_picks") === "on",
        want_greens: fd.get("want_greens") === "on",
        want_premium_analises: fd.get("want_premium_analises") === "on",
        want_live_alerts: fd.get("want_live_alerts") === "on",
        source,
        company: company || undefined,
      };

      startTransition(async () => {
        const r = await submitLeadAction(payload);
        if (r.ok) {
          setMsg({ type: "ok", text: r.message });
          if (dismissOnSuccess) setDone(true);
          onSuccess?.();
        } else {
          setMsg({ type: "err", text: r.message });
        }
      });
    },
    [dismissOnSuccess, onSuccess, source],
  );

  if (done) {
    return (
      <p className="rounded-xl border border-emerald-500/25 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-100/95">
        {msg?.text ?? "Obrigado."}
      </p>
    );
  }

  const compact = variant === "compact";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className={cn("space-y-4", compact ? "space-y-3" : "space-y-4", className)}
    >
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />

      <div className={cn("grid gap-3", compact ? "sm:grid-cols-1" : "sm:grid-cols-2")}>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none ring-gold-400/0 transition focus:border-gold-400/35 focus:ring-2 focus:ring-gold-400/20"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Nome <span className="font-normal text-zinc-600">(opcional)</span>
          </span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            maxLength={120}
            placeholder="Como te chamas"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400/35 focus:ring-2 focus:ring-gold-400/20"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Esporte favorito
          </span>
          <select
            name="favorite_sport"
            defaultValue="futebol"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400/35 focus:ring-2 focus:ring-gold-400/20"
          >
            {siteConfig.sports.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="rounded-xl border border-white/8 bg-black/30 p-4">
        <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-gold-400/90">
          Quero receber
        </legend>
        <ul className="mt-3 space-y-2.5 text-sm text-zinc-300">
          <li className="flex items-start gap-2">
            <input
              id={`wp-${source}`}
              name="want_picks"
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 rounded border-gold-400/40 bg-black text-amber-500 focus:ring-gold-400/40"
            />
            <label htmlFor={`wp-${source}`} className="cursor-pointer leading-snug">
              Picks rápidas e mercados em destaque
            </label>
          </li>
          <li className="flex items-start gap-2">
            <input
              id={`wg-${source}`}
              name="want_greens"
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 rounded border-gold-400/40 bg-black text-amber-500 focus:ring-gold-400/40"
            />
            <label htmlFor={`wg-${source}`} className="cursor-pointer leading-snug">
              Resumo de greens e performance
            </label>
          </li>
          <li className="flex items-start gap-2">
            <input
              id={`wpr-${source}`}
              name="want_premium_analises"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gold-400/40 bg-black text-amber-500 focus:ring-gold-400/40"
            />
            <label htmlFor={`wpr-${source}`} className="cursor-pointer leading-snug">
              Convites e prévias de análises premium
            </label>
          </li>
          <li className="flex items-start gap-2">
            <input
              id={`wl-${source}`}
              name="want_live_alerts"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gold-400/40 bg-black text-amber-500 focus:ring-gold-400/40"
            />
            <label htmlFor={`wl-${source}`} className="cursor-pointer leading-snug">
              Alertas ao vivo (quando activarmos o canal)
            </label>
          </li>
        </ul>
      </fieldset>

      {msg ? (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            msg.type === "ok"
              ? "border border-emerald-500/30 bg-emerald-950/30 text-emerald-100"
              : "border border-rose-500/30 bg-rose-950/25 text-rose-100",
          )}
        >
          {msg.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-gold-600 to-amber-600 px-4 text-sm font-bold text-pitch-950 shadow-md transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "A enviar…" : "Quero entrar na lista"}
      </button>
      <p className="text-[10px] leading-relaxed text-zinc-600">
        Sem spam — apenas conteúdo BarbosaTips. Podes cancelar a qualquer momento (estrutura de
        descadastro por email virá com o fornecedor de email marketing).
      </p>
    </form>
  );
}
