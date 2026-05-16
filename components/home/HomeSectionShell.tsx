import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type HomeSectionTheme =
  | "neutral"
  | "picks"
  | "performance"
  | "analises"
  | "community";

type Props = {
  theme: HomeSectionTheme;
  kicker: string;
  title: ReactNode;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
  className?: string;
  children: ReactNode;
  /** Secção full-bleed sem container interno */
  bleed?: boolean;
  /** Cabeçalho em container; conteúdo full-bleed (ex.: carrossel horizontal) */
  contentBleed?: boolean;
};

export function HomeSectionHeader({
  kicker,
  title,
  subtitle,
  href,
  linkLabel,
}: Pick<Props, "kicker" | "title" | "subtitle" | "href" | "linkLabel">) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="home-section-kicker">{kicker}</p>
        <h2 className="home-section-title">{title}</h2>
        {subtitle ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-400 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <Link href={href} className="home-section-link shrink-0">
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}

export function HomeSectionShell({
  theme,
  kicker,
  title,
  subtitle,
  href,
  linkLabel,
  id,
  className,
  children,
  bleed = false,
  contentBleed = false,
}: Props) {
  if (contentBleed) {
    return (
      <section
        id={id}
        className={cn("home-section", `home-section--${theme}`, className)}
      >
        <div className="container-site pt-12 sm:pt-16 lg:pt-20">
          <HomeSectionHeader
            kicker={kicker}
            title={title}
            subtitle={subtitle}
            href={href}
            linkLabel={linkLabel}
          />
        </div>
        <div className="pb-12 sm:pb-16 lg:pb-20">{children}</div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className={cn("home-section", `home-section--${theme}`, className)}
    >
      <div className={cn(!bleed && "container-site py-12 sm:py-16 lg:py-20")}>
        <HomeSectionHeader
          kicker={kicker}
          title={title}
          subtitle={subtitle}
          href={href}
          linkLabel={linkLabel}
        />
        {children}
      </div>
    </section>
  );
}
