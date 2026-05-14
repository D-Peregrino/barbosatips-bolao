import { z } from "zod";
import type { StatBlock, StatBlocksPayload } from "@/lib/analises/stat-blocks/types";

const base = z.object({
  id: z.string().min(1).max(80),
  title: z.string().max(120).optional(),
});

const probability1x2 = base.extend({
  kind: z.literal("probability_1x2"),
  vitoriaCasa: z.number().min(0).max(100),
  empate: z.number().min(0).max(100),
  vitoriaFora: z.number().min(0).max(100),
  labelCasa: z.string().max(80).optional(),
  labelFora: z.string().max(80).optional(),
});

const fairOdd = base.extend({
  kind: z.literal("fair_odd"),
  oddJusta: z.number().positive().max(999),
  oddMercado: z.number().positive().max(999).optional(),
  mercado: z.string().max(120).optional(),
  nota: z.string().max(400).optional(),
});

const evPlus = base.extend({
  kind: z.literal("ev_plus"),
  evPercent: z.number().min(-100).max(100),
  probModelo: z.number().min(0).max(1).optional(),
  probImplicita: z.number().min(0).max(1).optional(),
  nota: z.string().max(400).optional(),
});

const formRecent = base.extend({
  kind: z.literal("form_recent"),
  sequenciaCasa: z
    .string()
    .max(24)
    .regex(/^[wdl\?\s]+$/i, "Use W, D, L ou ?"),
  sequenciaFora: z
    .string()
    .max(24)
    .regex(/^[wdl\?\s]+$/i, "Use W, D, L ou ?"),
});

const h2h = base.extend({
  kind: z.literal("h2h"),
  linhas: z
    .array(
      z.object({
        data: z.string().max(40).optional(),
        resultado: z.string().max(120),
        placar: z.string().max(40).optional(),
      }),
    )
    .max(20),
});

const expectedGoals = base.extend({
  kind: z.literal("expected_goals"),
  xgCasa: z.number().min(0).max(9),
  xgFora: z.number().min(0).max(9),
  xgaCasa: z.number().min(0).max(9).optional(),
  xgaFora: z.number().min(0).max(9).optional(),
});

const overUnder = base.extend({
  kind: z.literal("over_under"),
  linha: z.number().min(0).max(20),
  overPercent: z.number().min(0).max(100),
  underPercent: z.number().min(0).max(100),
  contexto: z.string().max(200).optional(),
});

const heatmapSimple = base
  .extend({
    kind: z.literal("heatmap_simple"),
    rows: z.number().int().min(2).max(12),
    cols: z.number().int().min(2).max(12),
    cells: z.array(z.number().min(0).max(1)).max(144),
    labelLinhas: z.string().max(80).optional(),
    labelColunas: z.string().max(80).optional(),
  })
  .superRefine((data, ctx) => {
    const n = data.rows * data.cols;
    if (data.cells.length !== n) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `cells deve ter ${n} valores (rows*cols)`,
        path: ["cells"],
      });
    }
  });

const compareChart = base.extend({
  kind: z.literal("compare_chart"),
  metricas: z
    .array(
      z.object({
        label: z.string().max(80),
        casa: z.number().min(0).max(100),
        fora: z.number().min(0).max(100),
      }),
    )
    .min(1)
    .max(12),
});

const confidenceBar = base.extend({
  kind: z.literal("confidence_bar"),
  value: z.number().min(0).max(100),
  subtitulo: z.string().max(160).optional(),
});

export const statBlockSchema = z.union([
  probability1x2,
  fairOdd,
  evPlus,
  formRecent,
  h2h,
  expectedGoals,
  overUnder,
  heatmapSimple,
  compareChart,
  confidenceBar,
]);

export const statBlocksPayloadSchema = z.array(statBlockSchema).max(24);

export function parseStatBlocksPayload(raw: unknown): StatBlocksPayload {
  if (raw == null) return [];
  if (typeof raw === "string") {
    try {
      return parseStatBlocksPayload(JSON.parse(raw) as unknown);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  const out: StatBlock[] = [];
  for (const item of raw) {
    const r = statBlockSchema.safeParse(item);
    if (r.success) out.push(r.data);
  }
  return out;
}

export function serializeStatBlocksPayload(blocks: StatBlocksPayload): string {
  const parsed = statBlocksPayloadSchema.safeParse(blocks);
  if (!parsed.success) return "[]";
  return JSON.stringify(parsed.data);
}

export const STAT_BLOCK_KIND_OPTIONS: {
  kind: StatBlock["kind"];
  label: string;
  hint: string;
}[] = [
  { kind: "probability_1x2", label: "Probabilidade 1X2", hint: "Vitória / empate / derrota" },
  { kind: "fair_odd", label: "Odd justa", hint: "Justa vs mercado" },
  { kind: "ev_plus", label: "EV+", hint: "Valor esperado aproximado" },
  { kind: "form_recent", label: "Forma recente", hint: "W/D/L por equipa" },
  { kind: "h2h", label: "Últimos confrontos", hint: "Tabela resumida" },
  { kind: "expected_goals", label: "Golos esperados (xG)", hint: "xG a favor / sofridos" },
  { kind: "over_under", label: "Over / Under", hint: "Linha e probabilidades" },
  { kind: "heatmap_simple", label: "Heatmap simples", hint: "Grelha de intensidade" },
  { kind: "compare_chart", label: "Gráfico comparativo", hint: "Métricas lado a lado" },
  { kind: "confidence_bar", label: "Barra de confiança", hint: "0–100%" },
];

export function emptyBlockForKind(kind: StatBlock["kind"], id: string): StatBlock {
  switch (kind) {
    case "probability_1x2":
      return {
        id,
        kind,
        title: "Probabilidade (modelo)",
        vitoriaCasa: 42,
        empate: 28,
        vitoriaFora: 30,
      };
    case "fair_odd":
      return { id, kind, title: "Odd justa", oddJusta: 1.95, oddMercado: 2.1, mercado: "1X2 — vitória casa" };
    case "ev_plus":
      return { id, kind, title: "EV+", evPercent: 3.5, probModelo: 0.52, probImplicita: 0.48 };
    case "form_recent":
      return { id, kind, title: "Forma recente", sequenciaCasa: "WDLWD", sequenciaFora: "LDWWL" };
    case "h2h":
      return {
        id,
        kind,
        title: "Últimos confrontos",
        linhas: [
          { data: "2024-10-12", resultado: "Casa", placar: "2-1" },
          { data: "2024-04-03", resultado: "Empate", placar: "1-1" },
        ],
      };
    case "expected_goals":
      return { id, kind, title: "xG (últimos N)", xgCasa: 1.65, xgFora: 1.12, xgaCasa: 1.1, xgaFora: 1.35 };
    case "over_under":
      return { id, kind, title: "Over / Under 2.5", linha: 2.5, overPercent: 54, underPercent: 46 };
    case "heatmap_simple": {
      const rows = 4;
      const cols = 5;
      const cells = Array.from({ length: rows * cols }, (_, i) => (i % 5) / 10 + 0.35);
      return { id, kind, title: "Mapa de pressão", rows, cols, cells };
    }
    case "compare_chart":
      return {
        id,
        kind,
        title: "Comparativo",
        metricas: [
          { label: "Ataque", casa: 72, fora: 58 },
          { label: "Defesa", casa: 64, fora: 70 },
          { label: "Transições", casa: 55, fora: 68 },
        ],
      };
    case "confidence_bar":
      return { id, kind, title: "Confiança editorial", value: 72, subtitulo: "Leitura de mercado + contexto" };
  }
}
