"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HelpCircle, Send, X, Youtube } from "lucide-react";
import {
  HOME_ONBOARDING_STEPS,
  type OnboardingCta,
} from "@/lib/onboarding/home-steps";
import {
  readHomeOnboardingState,
  writeHomeOnboardingState,
} from "@/lib/onboarding/storage";
import { cn } from "@/lib/utils";

function CtaButton({ cta }: { cta: OnboardingCta }) {
  const className = cn(
    "inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-wide transition active:scale-[0.99]",
    cta.variant === "telegram" &&
      "bg-[#229ED9] text-white hover:brightness-110",
    cta.variant === "youtube" &&
      "border border-red-500/40 bg-red-950/40 text-red-50 hover:border-red-400/55",
    cta.variant === "gold" &&
      "bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300 text-pitch-950 hover:brightness-105",
    (!cta.variant || cta.variant === "ghost") &&
      "border border-gold-400/25 bg-black/30 text-gold-100 hover:border-gold-300/40",
  );

  const icon =
    cta.variant === "telegram" ? (
      <Send className="h-3.5 w-3.5" aria-hidden />
    ) : cta.variant === "youtube" ? (
      <Youtube className="h-3.5 w-3.5" aria-hidden />
    ) : null;

  if (cta.external) {
    return (
      <a
        href={cta.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {icon}
        {cta.label}
      </a>
    );
  }

  return (
    <Link href={cta.href} className={className}>
      {cta.label}
    </Link>
  );
}

export function HomeOnboarding() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  const step = HOME_ONBOARDING_STEPS[stepIndex];
  const isLast = stepIndex >= HOME_ONBOARDING_STEPS.length - 1;

  const scrollToAnchor = useCallback((anchorId?: string) => {
    if (!anchorId) return;
    const el = document.getElementById(anchorId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("onboarding-spotlight");
    window.setTimeout(() => el.classList.remove("onboarding-spotlight"), 2200);
  }, []);

  useEffect(() => {
    const state = readHomeOnboardingState();
    setHydrated(true);
    if (state === null) {
      setShowPulse(true);
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!reduceMotion) {
        const t = window.setTimeout(() => setOpen(true), 2400);
        return () => window.clearTimeout(t);
      }
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    scrollToAnchor(step?.anchorId);
  }, [open, stepIndex, step?.anchorId, scrollToAnchor]);

  function close(done: boolean) {
    setOpen(false);
    setShowPulse(false);
    writeHomeOnboardingState(done ? "done" : "dismissed");
  }

  function next() {
    if (isLast) {
      close(true);
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  if (!hydrated) return null;

  return (
    <>
      {open ? (
        <div
          className="pointer-events-none fixed inset-0 z-[90] bg-black/25 backdrop-blur-[1px]"
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          "fixed z-[100] flex flex-col gap-2",
          "bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 left-4 sm:left-auto sm:w-[min(100%,22rem)]",
        )}
        role="region"
        aria-label="Guia rápido BarbosaTips"
      >
        {open && step ? (
          <div
            className="pointer-events-auto overflow-hidden rounded-2xl border border-gold-400/20 bg-gradient-to-br from-pitch-900/98 via-black/95 to-pitch-950/98 p-4 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.75)] backdrop-blur-md"
            role="dialog"
            aria-modal="false"
            aria-labelledby="onboarding-title"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400/90">
                  Guia rápido · {stepIndex + 1}/{HOME_ONBOARDING_STEPS.length}
                </p>
                <h2
                  id="onboarding-title"
                  className="mt-1 font-display text-lg font-bold text-cream"
                >
                  {step.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => close(false)}
                className="shrink-0 rounded-lg border border-white/10 p-1.5 text-stone-400 transition hover:text-white"
                aria-label="Fechar guia"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-stone-400">{step.body}</p>

            {step.ctas && step.ctas.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {step.ctas.map((cta) => (
                  <CtaButton key={cta.label} cta={cta} />
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
              <button
                type="button"
                onClick={() => close(false)}
                className="text-[11px] font-semibold text-stone-500 transition hover:text-stone-300"
              >
                Saltar
              </button>
              <div className="flex gap-2">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:border-zinc-500"
                  >
                    Anterior
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={next}
                  className="rounded-lg bg-gold-400/15 border border-gold-400/35 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-gold-100 transition hover:bg-gold-400/25"
                >
                  {isLast ? "Concluir" : "Seguinte"}
                </button>
              </div>
            </div>

            <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
              {HOME_ONBOARDING_STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    i === stepIndex
                      ? "w-5 bg-gold-400/80"
                      : "w-1.5 bg-zinc-700",
                  )}
                />
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (!open) setStepIndex(0);
          }}
          className={cn(
            "pointer-events-auto ml-auto inline-flex min-h-[44px] items-center gap-2 rounded-full border border-gold-400/25 bg-black/80 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-100 shadow-lg backdrop-blur-md transition hover:border-gold-300/45 hover:bg-black/90",
            showPulse && !open && "animate-pulse ring-2 ring-gold-400/30",
          )}
          aria-expanded={open}
        >
          <HelpCircle className="h-4 w-4 text-gold-300" aria-hidden />
          {open ? "Fechar guia" : "Guia · 1 min"}
        </button>
      </div>
    </>
  );
}
