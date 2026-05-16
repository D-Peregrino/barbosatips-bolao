import Link from "next/link";
import { PERFORMANCE_PERIODS, type PerformancePeriodId } from "@/lib/picks/performance-periods";
import { cn } from "@/lib/utils";

type Props = {
  active: PerformancePeriodId;
  basePath?: string;
};

export function PerformancePeriodNav({ active, basePath = "/performance" }: Props) {
  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label="Período das estatísticas"
    >
      {PERFORMANCE_PERIODS.map((p) => {
        const isActive = p.id === active;
        const href =
          p.id === "geral" ? basePath : `${basePath}?period=${p.id}`;
        return (
          <Link
            key={p.id}
            href={href}
            className={cn(
              "rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition",
              isActive
                ? "border-amber-500/50 bg-amber-500/15 text-amber-100 shadow-[0_0_24px_-8px_rgba(245,158,11,0.35)]"
                : "border-white/10 bg-black/40 text-zinc-400 hover:border-amber-500/25 hover:text-zinc-200",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}
