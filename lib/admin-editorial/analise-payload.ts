export const ANALISES_ALLOWED_FIELDS = [
  "titulo",
  "slug",
  "resumo",
  "conteudo",
  "campeonato",
  "tag",
  "confianca",
  "status",
  "published_at",
] as const;

type AnaliseAllowedField = (typeof ANALISES_ALLOWED_FIELDS)[number];
type AnalisePayload = Partial<Record<AnaliseAllowedField, unknown>>;

const ANALISES_ALLOWED_FIELD_SET = new Set<string>(ANALISES_ALLOWED_FIELDS);

export function sanitizeAnalisePayload(payload: Record<string, unknown>): AnalisePayload {
  return Object.fromEntries(
    Object.entries(payload).filter(([field]) => ANALISES_ALLOWED_FIELD_SET.has(field)),
  ) as AnalisePayload;
}
