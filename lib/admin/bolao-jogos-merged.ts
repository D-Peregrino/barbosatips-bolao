import type {
  JogoCopa2026Mock,
  StatusPalpiteJogo,
} from "@/lib/mocks/copa2026-groupstage.mock";
import { COPA2026_JOGOS } from "@/lib/mocks/copa2026-groupstage.mock";

export type BolaoJogoOverrideRow = {
  jogo_id: string;
  data_iso: string | null;
  horario: string | null;
  status_manual: string | null;
  inicio_partida_iso: string | null;
};

export type JogoAdminMerged = JogoCopa2026Mock & {
  dataISO: string;
  horario: string;
  inicioPartidaISO: string;
  status: StatusPalpiteJogo;
};

export function mergeJogosComOverrides(
  overrides: BolaoJogoOverrideRow[],
): JogoAdminMerged[] {
  const byId = new Map(overrides.map((o) => [o.jogo_id, o]));
  return COPA2026_JOGOS.map((j) => {
    const o = byId.get(j.id);
    const dataISO = (o?.data_iso?.trim() || j.dataISO) as string;
    const horario = (o?.horario?.trim() || j.horario) as string;
    const inicioPartidaISO =
      (o?.inicio_partida_iso?.trim() || j.inicioPartidaISO) as string;
    const st = o?.status_manual?.trim();
    const status: StatusPalpiteJogo =
      st === "aberto" || st === "quase" || st === "encerrado" ? st : j.status;
    return { ...j, dataISO, horario, inicioPartidaISO, status };
  });
}
