/** Separa tags por vírgula ou ponto e vírgula; remove vazios e espaços. */
export function tagsAnaliseParaLista(raw: string | undefined | null): string[] {
  return String(raw ?? "")
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}
