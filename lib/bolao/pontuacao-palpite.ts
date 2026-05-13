/**
 * Regras do bolão (placar real vs palpite do participante).
 * 3 = placar exato; 1 = vencedor ou empate correto; 0 = erro ou palpite incompleto.
 */

function resultadoPartida(
  golsCasa: number,
  golsFora: number,
): "mandante" | "visitante" | "empate" {
  if (golsCasa > golsFora) return "mandante";
  if (golsCasa < golsFora) return "visitante";
  return "empate";
}

export function pontuacaoPalpiteContraResultado(
  placarRealCasa: number,
  placarRealFora: number,
  palpiteCasa: number | null,
  palpiteFora: number | null,
): 0 | 1 | 3 {
  if (
    palpiteCasa === null ||
    palpiteFora === null ||
    !Number.isFinite(placarRealCasa) ||
    !Number.isFinite(placarRealFora)
  ) {
    return 0;
  }
  if (palpiteCasa === placarRealCasa && palpiteFora === placarRealFora) return 3;
  if (
    resultadoPartida(palpiteCasa, palpiteFora) ===
    resultadoPartida(placarRealCasa, placarRealFora)
  ) {
    return 1;
  }
  return 0;
}
