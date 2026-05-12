import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── CLASSNAMES ───────────────────────────────────────────────────────────────

// Merge Tailwind classes sem conflitos
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── FORMATAÇÃO DE DATAS ──────────────────────────────────────────────────────

export function formatDate(date: string | Date, pattern = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

export function formatMatchDate(date: string | Date): string {
  return formatDate(date, "EEE, dd 'de' MMMM • HH:mm");
}

// ─── FORMATAÇÃO DE NÚMEROS ────────────────────────────────────────────────────

export function formatOdd(odd: number): string {
  return odd.toFixed(2);
}

export function formatROI(roi: number): string {
  const sign = roi > 0 ? "+" : "";
  return `${sign}${roi.toFixed(1)}%`;
}

export function formatUnits(units: number): string {
  const sign = units > 0 ? "+" : "";
  return `${sign}${units.toFixed(2)}u`;
}

export function formatWinRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatCurrency(value: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style:    "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

// ─── CORES DE RESULTADO ───────────────────────────────────────────────────────

type TipResult = "win" | "loss" | "push" | "void" | "pending";

export function getResultColor(result: TipResult): string {
  const colors: Record<TipResult, string> = {
    win:     "text-win",
    loss:    "text-loss",
    push:    "text-muted-light",
    void:    "text-muted-light",
    pending: "text-gold",
  };
  return colors[result] ?? "text-muted-light";
}

export function getResultLabel(result: TipResult): string {
  const labels: Record<TipResult, string> = {
    win:     "✓ Green",
    loss:    "✗ Red",
    push:    "= Push",
    void:    "∅ Void",
    pending: "◉ Pendente",
  };
  return labels[result] ?? result;
}

export function getResultBadgeClass(result: TipResult): string {
  const classes: Record<TipResult, string> = {
    win:     "badge-win",
    loss:    "badge-loss",
    push:    "badge-push",
    void:    "badge-push",
    pending: "badge-gold",
  };
  return classes[result] ?? "badge-push";
}

// ─── STAKE VISUAL ─────────────────────────────────────────────────────────────

export function getStakeLabel(stake: number): string {
  return `${stake}U`;
}

export function getStakeDots(stake: number): string {
  return "●".repeat(stake) + "○".repeat(5 - stake);
}

// ─── STRING UTILS ─────────────────────────────────────────────────────────────

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "…";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

// ─── SHARE UTILS ─────────────────────────────────────────────────────────────

export function buildShareUrl(platform: "whatsapp" | "telegram" | "twitter", text: string, url: string): string {
  const encoded = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  const urls = {
    whatsapp: `https://wa.me/?text=${encoded}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encoded}`,
    twitter:  `https://twitter.com/intent/tweet?text=${encoded}&url=${encodedUrl}`,
  };

  return urls[platform];
}

// ─── MISC ─────────────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function generateInviteCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
