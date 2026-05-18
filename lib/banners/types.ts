export const BANNER_POSITIONS = [
  "sidebar_left",
  "sidebar_right",
  "home_horizontal",
  "mobile_banner",
] as const;

export type BannerPosition = (typeof BANNER_POSITIONS)[number];

export type BannerPublicitario = {
  id: string;
  titulo: string;
  imagem_url: string;
  link_destino: string;
  posicao: BannerPosition;
  ativo: boolean;
  prioridade: number;
  click_count: number;
  created_at: string;
};

export const BANNER_POSITION_LABELS: Record<BannerPosition, string> = {
  sidebar_left: "Sidebar esquerda",
  sidebar_right: "Sidebar direita",
  home_horizontal: "Home horizontal",
  mobile_banner: "Banner mobile",
};

export function isBannerPosition(value: string): value is BannerPosition {
  return BANNER_POSITIONS.includes(value as BannerPosition);
}
