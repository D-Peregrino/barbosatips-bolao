"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface AdSlotProps {
  slot:      string;
  format?:  "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
  label?:    boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSlot({
  slot,
  format    = "auto",
  className,
  label     = true,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Só empurra uma vez por montagem
    if (pushed.current) return;

    try {
      if (typeof window !== "undefined") {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (e) {
      // AdSense pode falhar em dev — ignorar
      console.debug("AdSense push failed:", e);
    }
  }, []);

  // Em desenvolvimento, mostra placeholder visual
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        className={cn(
          "ad-slot relative overflow-hidden",
          className,
        )}
      >
        {label && (
          <span className="absolute top-1.5 left-1.5 text-2xs text-neutral-700 uppercase tracking-widest">
            Anúncio
          </span>
        )}
        <span className="text-neutral-800 font-mono text-xs">
          Ad · slot/{slot}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("ad-slot-wrapper overflow-hidden", className)}>
      {label && (
        <p className="text-2xs text-neutral-700 text-center uppercase tracking-widest mb-1">
          Publicidade
        </p>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={siteConfig.adsense.publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
