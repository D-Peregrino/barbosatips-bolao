import { subDays } from "date-fns";

export type AnalyticsRangePreset = "7d" | "30d" | "90d";

export function rangeBoundsMs(
  preset: AnalyticsRangePreset,
  ref: Date = new Date(),
): { fromMs: number; toMs: number; label: string } {
  const toMs = ref.getTime();
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const fromMs = subDays(ref, days).getTime();
  const label =
    preset === "7d" ? "Últimos 7 dias" : preset === "30d" ? "Últimos 30 dias" : "Últimos 90 dias";
  return { fromMs, toMs, label };
}

export function inRangeMs(ts: number, fromMs: number, toMs: number): boolean {
  return ts >= fromMs && ts <= toMs;
}
