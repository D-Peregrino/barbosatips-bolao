// lib/mocks/copa2026-groupstage.mock.ts
// Copa do Mundo FIFA 2026™ — fase de grupos (calendário alinhado ao comunicado
// oficial da FIFA de 06/12/2025; rankings FIFA ilustrativos para o bolão local).

export type StatusPalpiteJogo = "aberto" | "quase" | "encerrado";

export interface SelecaoCopa2026Mock {
  id: string;
  nome: string;
  bandeira: string;
  /** Posição ilustrativa no ranking FIFA (mock do bolão, sem API). */
  rankingFifa: number;
}

export interface JogoCopa2026Mock {
  id: string;
  grupo: string;
  /** Data local do jogo (AAAA-MM-DD). */
  dataISO: string;
  horario: string;
  estadio: string;
  cidade: string;
  mandanteId: string;
  visitanteId: string;
  status: StatusPalpiteJogo;
}

export const COPA2026_SELECOES: SelecaoCopa2026Mock[] = [
  { id: "mex", nome: "México", bandeira: "🇲🇽", rankingFifa: 14 },
  { id: "rsa", nome: "África do Sul", bandeira: "🇿🇦", rankingFifa: 66 },
  { id: "can", nome: "Canadá", bandeira: "🇨🇦", rankingFifa: 41 },
  { id: "wal", nome: "País de Gales", bandeira: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", rankingFifa: 30 },
  { id: "usa", nome: "Estados Unidos", bandeira: "🇺🇸", rankingFifa: 11 },
  { id: "par", nome: "Paraguai", bandeira: "🇵🇾", rankingFifa: 53 },
  { id: "bra", nome: "Brasil", bandeira: "🇧🇷", rankingFifa: 5 },
  { id: "mar", nome: "Marrocos", bandeira: "🇲🇦", rankingFifa: 13 },
  { id: "cuw", nome: "Curaçao", bandeira: "🇨🇼", rankingFifa: 86 },
  { id: "ger", nome: "Alemanha", bandeira: "🇩🇪", rankingFifa: 8 },
  { id: "eng", nome: "Inglaterra", bandeira: "🇬🇧", rankingFifa: 4 },
  { id: "cro", nome: "Croácia", bandeira: "🇭🇷", rankingFifa: 10 },
  { id: "tun", nome: "Tunísia", bandeira: "🇹🇳", rankingFifa: 32 },
  { id: "jpn", nome: "Japão", bandeira: "🇯🇵", rankingFifa: 18 },
];

const SELECOES_POR_ID: Record<string, SelecaoCopa2026Mock> = Object.fromEntries(
  COPA2026_SELECOES.map((s) => [s.id, s]),
);

export function copa2026SelecaoPorId(id: string): SelecaoCopa2026Mock {
  const s = SELECOES_POR_ID[id];
  if (!s) throw new Error(`[copa2026] Seleção não encontrada: ${id}`);
  return s;
}

/**
 * Jogos divulgados pela FIFA (imprensa oficial, 06/12/2025).
 * CAN–GAL: o anfitrião enfrenta o vencedor da repescagem UEFA (Itália, Irlanda do Norte,
 * País de Gales ou Bósnia); aqui usamos Gales como representante do chaveamento.
 */
export const COPA2026_JOGOS: JogoCopa2026Mock[] = [
  {
    id: "wc-2026-001",
    grupo: "A",
    dataISO: "2026-06-11",
    horario: "13:00",
    estadio: "Mexico City Stadium",
    cidade: "Cidade do México",
    mandanteId: "mex",
    visitanteId: "rsa",
    status: "aberto",
  },
  {
    id: "wc-2026-002",
    grupo: "B",
    dataISO: "2026-06-12",
    horario: "15:00",
    estadio: "Toronto Stadium",
    cidade: "Toronto",
    mandanteId: "can",
    visitanteId: "wal",
    status: "quase",
  },
  {
    id: "wc-2026-003",
    grupo: "C",
    dataISO: "2026-06-12",
    horario: "18:00",
    estadio: "Los Angeles Stadium",
    cidade: "Los Angeles",
    mandanteId: "usa",
    visitanteId: "par",
    status: "aberto",
  },
  {
    id: "wc-2026-004",
    grupo: "D",
    dataISO: "2026-06-13",
    horario: "18:00",
    estadio: "New York New Jersey Stadium",
    cidade: "East Rutherford",
    mandanteId: "bra",
    visitanteId: "mar",
    status: "aberto",
  },
  {
    id: "wc-2026-005",
    grupo: "E",
    dataISO: "2026-06-14",
    horario: "12:00",
    estadio: "Houston Stadium",
    cidade: "Houston",
    mandanteId: "cuw",
    visitanteId: "ger",
    status: "quase",
  },
  {
    id: "wc-2026-006",
    grupo: "L",
    dataISO: "2026-06-17",
    horario: "15:00",
    estadio: "Dallas Stadium",
    cidade: "Arlington",
    mandanteId: "eng",
    visitanteId: "cro",
    status: "aberto",
  },
  {
    id: "wc-2026-007",
    grupo: "F",
    dataISO: "2026-06-20",
    horario: "22:00",
    estadio: "Estádio BBVA",
    cidade: "Monterrey",
    mandanteId: "tun",
    visitanteId: "jpn",
    status: "encerrado",
  },
];

export interface JogoCopa2026Resolvido extends JogoCopa2026Mock {
  mandante: SelecaoCopa2026Mock;
  visitante: SelecaoCopa2026Mock;
}

export function copa2026JogosResolvidos(): JogoCopa2026Resolvido[] {
  return COPA2026_JOGOS.map((j) => ({
    ...j,
    mandante: copa2026SelecaoPorId(j.mandanteId),
    visitante: copa2026SelecaoPorId(j.visitanteId),
  }));
}

export function copa2026JogosPorGrupo(): { grupo: string; jogos: JogoCopa2026Resolvido[] }[] {
  const res = copa2026JogosResolvidos();
  const map = new Map<string, JogoCopa2026Resolvido[]>();
  for (const j of res) {
    const g = j.grupo;
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(j);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true }))
    .map(([grupo, jogos]) => ({ grupo, jogos }));
}

/** v3: calendário FIFA-only; remove dependência de mocks antigos de clubes. */
export const COPA2026_PALPITES_STORAGE_KEY = "barbosatips:copa2026:palpites:v3";

export interface Copa2026PalpitesPersistidos {
  placares: Record<string, { casa: string; fora: string }>;
  confirmado: boolean;
}
