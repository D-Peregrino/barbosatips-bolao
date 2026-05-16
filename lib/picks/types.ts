export type QuickPickStatus = "ativo" | "encerrado";

export type QuickPickResultado = "pendente" | "green" | "red" | "void";

export interface QuickPickRow {
  id: string;
  esporte: string;
  campeonato: string;
  jogo: string;
  mercado: string;
  odd: number;
  confianca: number;
  justificativa: string;
  horario_jogo: string;
  status: QuickPickStatus;
  resultado: QuickPickResultado;
  is_premium: boolean;
  created_at: string;
  /** Preenchido ao marcar green/red/void no admin. */
  resolved_at: string | null;
  placar_final: string | null;
  observacao_resultado: string | null;
}

/** Pick ainda sem resultado definitivo (ativa ou encerrada sem G/R/V). */
export function pickPendenteResultado(p: QuickPickRow): boolean {
  if (p.status === "ativo") return true;
  return p.resultado === "pendente";
}

/** Pick com resultado que entra na performance. */
export function pickComResultadoDefinitivo(p: QuickPickRow): boolean {
  return (
    p.status === "encerrado" &&
    (p.resultado === "green" || p.resultado === "red" || p.resultado === "void")
  );
}
