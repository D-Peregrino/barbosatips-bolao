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
}
