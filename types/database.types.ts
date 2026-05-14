// ─── TIPOS DO BANCO DE DADOS (Supabase) ──────────────────────────────────────
// Este arquivo é gerado automaticamente via: npm run db:types
// Mas mantemos a versão manual aqui como referência e fallback

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── ROLES ───────────────────────────────────────────────────────────────────
export type UserRole    = "user" | "tipster" | "admin";
export type TipResult   = "win" | "loss" | "push" | "void" | "pending";
export type TipStatus   = "draft" | "published" | "archived";
export type BolaoStatus = "open" | "closed" | "finished";

// ─── TABELAS ─────────────────────────────────────────────────────────────────

export interface User {
  id:           string;        // UUID (sync com Supabase Auth)
  email:        string;
  username:     string;
  display_name: string | null;
  avatar_url:   string | null;
  role:         UserRole;
  bio:          string | null;
  is_verified:  boolean;
  created_at:   string;
  updated_at:   string;
}

export interface Tip {
  id:           string;
  tipster_id:   string;        // FK → users.id
  esporte:      string;        // "futebol", "basquete", etc.
  liga:         string;        // "brasileirao-serie-a", "nba", etc.
  partida:      string;        // "Flamengo x Corinthians"
  partida_data: string;        // ISO datetime
  mercado:      string;        // "Resultado", "Over/Under", "Ambas marcam"
  selecao:      string;        // "Flamengo vence", "Over 2.5"
  odd:          number;
  stake:        number;        // 1 a 5 (unidades)
  ev:           number | null; // Expected Value %
  resultado:    TipResult;
  status:       TipStatus;
  analise_id:   string | null; // FK → analises.id
  created_at:   string;
  published_at: string | null;
}

export interface Analise {
  id:           string;
  tipster_id:   string;        // FK → users.id
  tip_id:       string | null; // FK → tips.id
  title:        string;
  slug:         string;
  excerpt:      string;
  content:      string;        // Markdown/rich text
  esporte:      string;
  liga:         string;
  tags:         string[];
  meta_title:   string | null;
  meta_desc:    string | null;
  og_image:     string | null;
  views:        number;
  is_premium:   boolean;
  status:       TipStatus;
  created_at:   string;
  published_at: string | null;
}

export interface Bolao {
  id:           string;
  name:         string;
  description:  string | null;
  owner_id:     string;        // FK → users.id
  invite_code:  string;        // Código curto para compartilhar
  max_members:  number | null;
  deadline:     string;        // ISO datetime — limite para palpites
  tips:         string[];      // Array de tip_ids participantes
  status:       BolaoStatus;
  is_public:    boolean;
  prize_desc:   string | null;
  created_at:   string;
  finished_at:  string | null;
}

export interface Palpite {
  id:           string;
  bolao_id:     string;        // FK → boloes.id
  user_id:      string;        // FK → users.id
  palpites:     Record<string, string>; // { tip_id: "win" | "loss" }
  pontos:       number | null; // Calculado ao fechar o bolão
  posicao:      number | null; // Ranking final
  created_at:   string;
  updated_at:   string;
}

export interface TipsterStats {
  user_id:      string;
  total_tips:   number;
  wins:         number;
  losses:       number;
  pushes:       number;
  win_rate:     number;        // %
  roi:          number;        // %
  lucro_total:  number;        // em unidades
  odd_media:    number;
  stake_media:  number;
  updated_at:   string;
}

// ─── TIPOS COMPOSTOS (com joins) ─────────────────────────────────────────────

export interface TipWithTipster extends Tip {
  tipster: Pick<User, "id" | "username" | "display_name" | "avatar_url" | "is_verified">;
}

export interface TipWithAnalise extends Tip {
  analise: Pick<Analise, "id" | "slug" | "title"> | null;
}

export interface AnaliseWithTipster extends Analise {
  tipster: Pick<User, "id" | "username" | "display_name" | "avatar_url">;
  tip: Pick<Tip, "id" | "selecao" | "odd" | "stake" | "resultado"> | null;
}

export interface BolaoWithOwner extends Bolao {
  owner:         Pick<User, "id" | "username" | "display_name" | "avatar_url">;
  member_count:  number;
}

export interface BolaoCompleto extends BolaoWithOwner {
  palpites:      (Palpite & { user: Pick<User, "id" | "username" | "display_name" | "avatar_url"> })[];
  tips_detalhes: TipWithTipster[];
}

export interface TipsterPublico extends User {
  stats:         TipsterStats;
  tips_recentes: Tip[];
}

// ─── TIPOS DE API ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data:    T | null;
  error:   string | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total:   number;
  page:    number;
  perPage: number;
  hasMore: boolean;
}

// ─── TIPOS DE FILTROS ─────────────────────────────────────────────────────────

export interface TipFilters {
  esporte?:   string;
  liga?:      string;
  resultado?: TipResult;
  tipster_id?: string;
  data_de?:   string;
  data_ate?:  string;
  page?:      number;
  per_page?:  number;
}

export interface AnaliseFilters {
  esporte?:   string;
  liga?:      string;
  tag?:       string;
  tipster_id?: string;
  is_premium?: boolean;
  page?:      number;
  per_page?:  number;
}

/** Picks rápidas (`quick_picks` no Supabase). */
export interface QuickPick {
  id:             string;
  esporte:        string;
  campeonato:     string;
  jogo:           string;
  mercado:        string;
  odd:            number;
  confianca:      number;
  justificativa:  string;
  horario_jogo:   string;
  status:         "ativo" | "encerrado";
  resultado:      "pendente" | "green" | "red" | "void";
  created_at:     string;
}
