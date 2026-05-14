import { z } from "zod";
import { siteConfig } from "@/config/site";
import type { LeadSource } from "@/lib/leads/types";

export const leadSubmitSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(120).optional().nullable(),
  favorite_sport: z
    .string()
    .min(1)
    .refine((s) => siteConfig.sports.some((x) => x.slug === s), "Esporte inválido"),
  want_picks: z.boolean().optional().default(false),
  want_greens: z.boolean().optional().default(false),
  want_premium_analises: z.boolean().optional().default(false),
  want_live_alerts: z.boolean().optional().default(false),
  source: z
    .enum([
      "popup",
      "sticky",
      "inline_analises",
      "inline_picks",
      "newsletter",
      "comunidade",
    ])
    .default("newsletter"),
  /** Honeypot — preenchido = bot */
  company: z.string().optional(),
}).refine(
  (d) =>
    d.want_picks ||
    d.want_greens ||
    d.want_premium_analises ||
    d.want_live_alerts,
  { message: "Selecciona pelo menos um tipo de conteúdo.", path: ["want_picks"] },
);

export type LeadSubmitInput = z.infer<typeof leadSubmitSchema>;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidSportSlug(slug: string): boolean {
  return siteConfig.sports.some((s) => s.slug === slug);
}

export function defaultLeadSource(): LeadSource {
  return "newsletter";
}
