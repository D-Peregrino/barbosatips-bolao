import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs-model";
import Link from "next/link";

type Props = {
  items: BreadcrumbItem[];
  /** Se true, o último crumb é só texto (página actual). */
  currentIsLast?: boolean;
  className?: string;
};

/**
 * Breadcrumbs visuais acessíveis (nav + ol) — combinar com JSON-LD BreadcrumbList na página.
 */
export function Breadcrumbs({ items, currentIsLast = true, className }: Props) {
  if (items.length === 0) return null;
  const lastIdx = items.length - 1;

  return (
    <nav aria-label="Trilha de navegação" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-zinc-500">
        {items.map((it, i) => {
          const isLast = i === lastIdx;
          const showLink = !(currentIsLast && isLast);
          return (
            <li key={`${it.path}-${i}`} className="flex items-center gap-1">
              {i > 0 ? (
                <span className="px-1 text-zinc-600" aria-hidden>
                  ›
                </span>
              ) : null}
              {showLink ? (
                <Link
                  href={it.path}
                  className="font-medium text-gold/90 underline-offset-2 hover:text-gold hover:underline"
                >
                  {it.name}
                </Link>
              ) : (
                <span className="font-semibold text-zinc-300">{it.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
