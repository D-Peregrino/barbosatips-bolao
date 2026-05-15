"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { logoutAdminPanelAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type Variant = "header" | "sidebar";

function SairLabel() {
  const { pending } = useFormStatus();
  return <>{pending ? "A sair…" : "Sair"}</>;
}

type Props = {
  variant?: Variant;
  className?: string;
};

/**
 * Encerra sessão Supabase Auth (server action) e redireciona para /admin/login.
 */
export function AdminSairButton({ variant = "header", className }: Props) {
  const isHeader = variant === "header";

  return (
    <form action={logoutAdminPanelAction} className={className}>
      <button
        type="submit"
        className={cn(
          "inline-flex items-center justify-center gap-2 transition disabled:opacity-50",
          isHeader
            ? "rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-stone-400 hover:border-stone-500/40 hover:bg-white/[0.04] hover:text-stone-200"
            : "w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-stone-200 hover:border-red-400/30 hover:bg-red-950/25 hover:text-red-100",
        )}
        aria-label="Sair da conta admin"
      >
        <LogOut className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
        <SairLabel />
      </button>
    </form>
  );
}
