"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Regista o service worker (só produção), modo standalone no &lt;html&gt;,
 * e UI para instalar / dica iOS (Partilhar → Adicionar à Tela de Início).
 */
export function PwaClientMount() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) {
      document.documentElement.classList.add("pwa-standalone");
    }

    const mq = window.matchMedia("(display-mode: standalone)");
    const onMq = () => {
      document.documentElement.classList.toggle("pwa-standalone", mq.matches);
    };
    mq.addEventListener("change", onMq);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const isIos = /iPad|iPhone|iPod/i.test(navigator.userAgent);
    if (isIos && !standalone && !sessionStorage.getItem("pwa-ios-hint-dismissed")) {
      setShowIos(true);
    }

    if (process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }

    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("beforeinstallprompt", onBip);
    };
  }, []);

  const runInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShowAndroid(false);
  }, [deferred]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setShowAndroid(false);
    setShowIos(false);
    sessionStorage.setItem("pwa-ios-hint-dismissed", "1");
  }, []);

  if (dismissed) return null;

  if (showAndroid && deferred) {
    return (
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
          "transition-opacity duration-300 ease-out",
        )}
      >
        <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-gold-400/25 bg-zinc-950/95 p-4 shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-gold-400/95">
              BarbosaTips
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Adicionar à tela inicial</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Instala o portal como app — abre mais rápido e com ecrã completo.
            </p>
            <button
              type="button"
              onClick={() => void runInstall()}
              className="mt-3 min-h-[44px] w-full rounded-xl bg-gradient-to-r from-gold-600 to-amber-600 px-4 text-sm font-bold text-pitch-950 shadow-md transition hover:brightness-110 active:scale-[0.99]"
            >
              Instalar
            </button>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="btn-icon shrink-0 text-zinc-500 hover:text-cream"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  if (showIos) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] motion-safe-transition motion-reduce:transition-none duration-300 ease-out">
        <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-gold-400/20 bg-zinc-950/95 p-4 shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white">Instalar no iPhone / iPad</p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
              Toque em <span className="font-semibold text-zinc-300">Partilhar</span> e depois em{" "}
              <span className="font-semibold text-zinc-300">Adicionar à Tela de Início</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="btn-icon shrink-0 text-zinc-500 hover:text-cream"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
