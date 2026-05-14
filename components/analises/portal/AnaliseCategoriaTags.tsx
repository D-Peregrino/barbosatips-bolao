import { tagsAnaliseParaLista } from "@/lib/analises/tags";

type Props = {
  categoria: string;
  tags: string;
  /** "card" compacto na grelha; "hero" no destaque */
  variant?: "card" | "hero";
};

/**
 * Categoria + pastilhas de tags (visual preto/dourado BarbosaTips).
 */
export function AnaliseCategoriaTags({
  categoria,
  tags,
  variant = "card",
}: Props) {
  const cat = String(categoria ?? "").trim();
  const lista = tagsAnaliseParaLista(tags);
  if (!cat && lista.length === 0) return null;

  const catClass =
    variant === "hero"
      ? "inline-flex max-w-full items-center rounded-full border border-[#C9A227]/45 bg-[#C9A227]/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#E8D48B]"
      : "inline-flex max-w-full items-center rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E8D48B]";

  const pillClass =
    variant === "hero"
      ? "rounded-md border border-[#5c4d28]/90 bg-[#12100c] px-2 py-0.5 text-[10px] font-medium capitalize text-zinc-300"
      : "rounded border border-[#3d3420]/90 bg-[#0a0908] px-1.5 py-0.5 text-[9px] font-medium capitalize leading-tight text-zinc-400";

  return (
    <div className="flex flex-col gap-2">
      {cat ? (
        <p className="m-0">
          <span className={catClass}>Categoria · {cat}</span>
        </p>
      ) : null}
      {lista.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Tags">
          {lista.map((t) => (
            <li key={t}>
              <span className={pillClass}>{t}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
