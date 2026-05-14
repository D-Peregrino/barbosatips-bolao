export type QuickPickStatus = "ativo" | "encerrado";

export type QuickPickResultado = "green" | "red" | null;

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
  created_at: string;
}
