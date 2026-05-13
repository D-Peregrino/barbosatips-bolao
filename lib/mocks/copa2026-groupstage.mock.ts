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
  /**
   * Início oficial da partida em ISO 8601 (instante absoluto, com offset ou Z).
   * Usado para fechar palpites 15 minutos antes.
   */
  inicioPartidaISO: string;
  estadio: string;
  cidade: string;
  mandanteId: string;
  visitanteId: string;
  status: StatusPalpiteJogo;
  /**
   * Placar oficial após o jogo (null = ainda sem resultado para pontuação do bolão).
   */
  resultadoOficial: { casa: number; fora: number } | null;
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
 *
 * Em `NODE_ENV === "development"`, um jogo fictício é injetado em `copa2026JogosResolvidos`
 * (id `COPA2026_DEV_PALPITE_BLOQUEIO_ID`, fora de `COPA2026_JOGO_IDS` — não persiste no Supabase).
 */
export const COPA2026_DEV_PALPITE_BLOQUEIO_ID = "__dev_palpites_bloqueio__";

export function copa2026DevPalpiteBloqueioAtivo(): boolean {
  return process.env.NODE_ENV === "development";
}

export const COPA2026_JOGOS: JogoCopa2026Mock[] = [
  {
    id: "wc-2026-001",
    grupo: "A",
    dataISO: "2026-06-11",
    horario: "13:00",
    inicioPartidaISO: "2026-06-11T13:00:00-06:00",
    estadio: "Mexico City Stadium",
    cidade: "Cidade do México",
    mandanteId: "mex",
    visitanteId: "rsa",
    status: "aberto",
    resultadoOficial: null,
  },
  {
    id: "wc-2026-002",
    grupo: "B",
    dataISO: "2026-06-12",
    horario: "15:00",
    inicioPartidaISO: "2026-06-12T15:00:00-04:00",
    estadio: "Toronto Stadium",
    cidade: "Toronto",
    mandanteId: "can",
    visitanteId: "wal",
    status: "quase",
    resultadoOficial: null,
  },
  {
    id: "wc-2026-003",
    grupo: "C",
    dataISO: "2026-06-12",
    horario: "18:00",
    inicioPartidaISO: "2026-06-12T18:00:00-07:00",
    estadio: "Los Angeles Stadium",
    cidade: "Los Angeles",
    mandanteId: "usa",
    visitanteId: "par",
    status: "aberto",
    resultadoOficial: null,
  },
  {
    id: "wc-2026-004",
    grupo: "D",
    dataISO: "2026-06-13",
    horario: "18:00",
    inicioPartidaISO: "2026-06-13T18:00:00-04:00",
    estadio: "New York New Jersey Stadium",
    cidade: "East Rutherford",
    mandanteId: "bra",
    visitanteId: "mar",
    status: "aberto",
    resultadoOficial: null,
  },
  {
    id: "wc-2026-005",
    grupo: "E",
    dataISO: "2026-06-14",
    horario: "12:00",
    inicioPartidaISO: "2026-06-14T12:00:00-05:00",
    estadio: "Houston Stadium",
    cidade: "Houston",
    mandanteId: "cuw",
    visitanteId: "ger",
    status: "quase",
    resultadoOficial: null,
  },
  {
    id: "wc-2026-006",
    grupo: "L",
    dataISO: "2026-06-17",
    horario: "15:00",
    inicioPartidaISO: "2026-06-17T15:00:00-05:00",
    estadio: "Dallas Stadium",
    cidade: "Arlington",
    mandanteId: "eng",
    visitanteId: "cro",
    status: "aberto",
    resultadoOficial: null,
  },
  {
    id: "wc-2026-007",
    grupo: "F",
    dataISO: "2026-06-20",
    horario: "22:00",
    inicioPartidaISO: "2026-06-20T22:00:00-06:00",
    estadio: "Estádio BBVA",
    cidade: "Monterrey",
    mandanteId: "tun",
    visitanteId: "jpn",
    status: "encerrado",
    resultadoOficial: { casa: 1, fora: 2 },
  },
];

/** IDs de jogos válidos para validação no servidor (palpites). */
export const COPA2026_JOGO_IDS: ReadonlySet<string> = new Set(
  COPA2026_JOGOS.map((j) => j.id),
);

/** Chaves iniciais de placares (inclui jogo dev só em desenvolvimento). */
export function copa2026PlacaresIniciaisVazios(): Record<
  string,
  { casa: string; fora: string }
> {
  const ids = COPA2026_JOGOS.map((j) => j.id);
  const ordered = copa2026DevPalpiteBloqueioAtivo()
    ? [COPA2026_DEV_PALPITE_BLOQUEIO_ID, ...ids]
    : ids;
  return Object.fromEntries(ordered.map((id) => [id, { casa: "", fora: "" }]));
}

/** Antecedência para fechamento dos palpites em relação ao apito inicial (15 min). */
export const COPA2026_ANTECEDENCIA_PALPITES_MS = 15 * 60 * 1000;

const jogoPorId = new Map(COPA2026_JOGOS.map((j) => [j.id, j]));

/** Instantâneo (epoch ms) em que os palpites fecham para o jogo (início − 15 min). */
export function copa2026InstanteFechamentoPalpitesMs(jogoId: string): number | null {
  if (copa2026DevPalpiteBloqueioAtivo() && jogoId === COPA2026_DEV_PALPITE_BLOQUEIO_ID) {
    return Date.UTC(1999, 5, 1, 12, 0, 0, 0);
  }
  const j = jogoPorId.get(jogoId);
  if (!j?.inicioPartidaISO) return null;
  const kick = Date.parse(j.inicioPartidaISO);
  if (!Number.isFinite(kick)) return null;
  return kick - COPA2026_ANTECEDENCIA_PALPITES_MS;
}

/** true se ainda dá para enviar/editar palpite neste jogo (antes do fechamento). */
export function copa2026PalpitesAbertosParaJogo(
  jogoId: string,
  agoraMs: number = Date.now(),
): boolean {
  const lim = copa2026InstanteFechamentoPalpitesMs(jogoId);
  // Sem ISO válido não podemos fechar por prazo: manter aberto (evita disabled=true em todo o grid).
  if (lim === null) return true;
  return agoraMs < lim;
}

/**
 * Texto curto do tempo até fechar palpites (jogo ainda aberto).
 * Retorna null se já fechou ou se o jogo não existe.
 */
export function copa2026PalpitesTextoTempoRestante(
  jogoId: string,
  agoraMs: number = Date.now(),
): string | null {
  const lim = copa2026InstanteFechamentoPalpitesMs(jogoId);
  if (lim === null) return null;
  const diff = lim - agoraMs;
  if (diff <= 0) return null;

  const minTotal = Math.floor(diff / 60000);
  if (minTotal < 1) return "Fecha em menos de 1 minuto";
  if (minTotal < 60) return `Faltam ${minTotal} min`;

  const h = Math.floor(minTotal / 60);
  const m = minTotal % 60;
  if (h < 24) {
    return m > 0 ? `Faltam ${h} h ${m} min` : `Faltam ${h} h`;
  }

  const dias = Math.floor(h / 24);
  const horas = h % 24;
  if (horas > 0) return `Faltam ${dias} dia${dias > 1 ? "s" : ""} e ${horas} h`;
  return `Faltam ${dias} dia${dias > 1 ? "s" : ""}`;
}

function outcomeMandante(h: number, a: number): "mandante" | "visitante" | "empate" {
  if (h > a) return "mandante";
  if (h < a) return "visitante";
  return "empate";
}

/**
 * Pontuação do bolão após resultado oficial.
 * 3 = placar exato; 1 = vencedor ou empate correto; 0 = erro.
 * `null` = ainda sem resultado oficial.
 */
export function copa2026PontuacaoPalpite(
  jogoId: string,
  palpiteCasa: number | null,
  palpiteFora: number | null,
): null | 0 | 1 | 3 {
  const j = jogoPorId.get(jogoId);
  const ro = j?.resultadoOficial;
  if (!ro) return null;
  const rh = ro.casa;
  const ra = ro.fora;
  if (palpiteCasa === null || palpiteFora === null) return 0;
  if (palpiteCasa === rh && palpiteFora === ra) return 3;
  if (outcomeMandante(palpiteCasa, palpiteFora) === outcomeMandante(rh, ra)) return 1;
  return 0;
}

export interface JogoCopa2026Resolvido extends JogoCopa2026Mock {
  mandante: SelecaoCopa2026Mock;
  visitante: SelecaoCopa2026Mock;
}

function copa2026JogoDevBloqueioResolvido(): JogoCopa2026Resolvido {
  const mandante: SelecaoCopa2026Mock = {
    id: "__dev_blq__",
    nome: "Teste Bloqueado",
    bandeira: "🧪",
    rankingFifa: 999,
  };
  const visitante: SelecaoCopa2026Mock = {
    id: "__dev_enc__",
    nome: "Teste Encerrado",
    bandeira: "🧪",
    rankingFifa: 998,
  };
  return {
    id: COPA2026_DEV_PALPITE_BLOQUEIO_ID,
    grupo: "DEV",
    dataISO: "2000-01-01",
    horario: "12:00",
    inicioPartidaISO: "2000-01-01T12:00:00.000Z",
    estadio: "Simulação local (não grava no banco)",
    cidade: "Desenvolvimento",
    mandanteId: mandante.id,
    visitanteId: visitante.id,
    mandante,
    visitante,
    status: "encerrado",
    resultadoOficial: null,
  };
}

export function copa2026JogosResolvidos(): JogoCopa2026Resolvido[] {
  const base = COPA2026_JOGOS.map((j) => ({
    ...j,
    mandante: copa2026SelecaoPorId(j.mandanteId),
    visitante: copa2026SelecaoPorId(j.visitanteId),
  }));
  if (!copa2026DevPalpiteBloqueioAtivo()) return base;
  return [copa2026JogoDevBloqueioResolvido(), ...base];
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
    .sort(([a], [b]) => {
      if (a === "DEV") return -1;
      if (b === "DEV") return 1;
      return a.localeCompare(b, "en", { numeric: true });
    })
    .map(([grupo, jogos]) => ({ grupo, jogos }));
}

/** v3: calendário FIFA-only; remove dependência de mocks antigos de clubes. */
export const COPA2026_PALPITES_STORAGE_KEY = "barbosatips:copa2026:palpites:v3";

export interface Copa2026PalpitesPersistidos {
  placares: Record<string, { casa: string; fora: string }>;
  confirmado: boolean;
}
