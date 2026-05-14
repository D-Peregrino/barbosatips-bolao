"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { BrandShield } from "@/components/brand/BrandShield";
import { LeadCaptureForm } from "@/components/leads/LeadCaptureForm";
import { cn } from "@/lib/utils";

const SESSION_POPUP = "bt_lead_popup_seen_v1";
const SESSION_STICKY = "bt_lead_sticky_dismiss_v1";

/**
 * Popup discreto (tempo + scroll) + barra sticky expansível.
 */
export function LeadIntelligenceMount() {
  const [showPopup, setShowPopup] = useState(false);
  const [stickyOpen, setStickyOpen] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_POPUP)) return;

    const tryOpen = () => {
      if (openedRef.current) return;
      openedRef.current = true;
      setShowPopup(true);
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      if (pct > 0.12) tryOpen();
    };

    timerRef.current = setTimeout(() => {
      tryOpen();
    }, 22000);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closePopup = useCallback(() => {
    if (typeof window !== "undefined") sessionStorage.setItem(SESSION_POPUP, "1");
    setShowPopup(false);
  }, []);

  const dismissSticky = useCallback(() => {
    setStickyDismissed(true);
    setStickyOpen(false);
    sessionStorage.setItem(SESSION_STICKY, "1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_STICKY)) setStickyDismissed(true);
  }, []);

  useEffect(() => {
    if (showPopup && typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_POPUP, "1");
    }
  }, [showPopup]);

  return (
    <>
      {showPopup ? (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] max-md:pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:items-center sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-popup-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
            aria-label="Fechar"
            onClick={closePopup}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gold-400/25 bg-zinc-950/98 p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)] sm:p-8">
            <button
              type="button"
              onClick={closePopup}
              className="absolute right-3 top-3 rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-cream"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <BrandShield size="sm" glow="soft" />
              <div>
                <p id="lead-popup-title" className="font-display text-lg font-bold text-white">
                  Fica por dentro
                </p>
                <p className="text-xs text-zinc-500">Um passo. Sem ruído.</p>
              </div>
            </div>
            <LeadCaptureForm
              source="popup"
              variant="compact"
              onSuccess={() => {
                window.setTimeout(closePopup, 2200);
              }}
            />
          </div>
        </div>
      ) : null}

      {!stickyDismissed && !showPopup ? (
        <div className="fixed bottom-0 left-0 right-0 z-[105] hidden pb-[max(0.5rem,env(safe-area-inset-bottom))] md:block">
          {!stickyOpen ? (
            <button
              type="button"
              onClick={() => setStickyOpen(true)}
              className={cn(
                "mx-auto flex max-w-lg items-center justify-center gap-2 rounded-t-2xl border border-gold-400/25 border-b-0",
                "bg-zinc-950/95 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-200 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.85)] backdrop-blur-md transition hover:bg-zinc-900/95",
              )}
            >
              Receber tips no email
            </button>
          ) : (
            <div className="mx-auto max-w-lg rounded-t-2xl border border-gold-400/25 border-b-0 bg-zinc-950/98 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gold-400/95">Newsletter</p>
                <button
                  type="button"
                  onClick={dismissSticky}
                  className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-300"
                >
                  Não mostrar
                </button>
              </div>
              <LeadCaptureForm source="sticky" variant="compact" dismissOnSuccess />
              <button
                type="button"
                onClick={() => setStickyOpen(false)}
                className="mt-3 w-full py-2 text-center text-xs text-zinc-500 hover:text-zinc-300"
              >
                Fechar painel
              </button>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
