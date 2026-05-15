/** Liquidação de mercados EV+ com placar final (API-Football). */

const FINISHED = new Set(["FT", "AET", "PEN"]);
const VOID_OR_PENDING = new Set(["CANC", "ABD", "PST", "INT", "SUSP", "AWD", "WO"]);

export function isFixtureFinishedForSettlement(statusShort: string): boolean {
  return FINISHED.has(statusShort);
}

export function isFixtureVoid(statusShort: string): boolean {
  return VOID_OR_PENDING.has(statusShort);
}

export type SettlementRow = {
  resultado: string;
  green: boolean;
  lucro: number;
  roi: number;
};

/**
 * Stake unitário = 1. Lucro: green → odd - 1; red → -1.
 * ROI = retorno por unidade apostada (= lucro com stake 1).
 */
export function settleEvMarket(
  mercado: string,
  homeGoals: number,
  awayGoals: number,
  odd: number,
): SettlementRow {
  const h = homeGoals;
  const a = awayGoals;
  let green = false;
  let resultado = "";

  switch (mercado) {
    case "Over 2.5":
      green = h + a > 2;
      resultado = green ? "over" : "under";
      break;
    case "BTTS":
      green = h > 0 && a > 0;
      resultado = green ? "btts_sim" : "btts_nao";
      break;
    case "Home Win":
      green = h > a;
      if (h > a) resultado = "home_win";
      else if (h === a) resultado = "draw";
      else resultado = "away_win";
      break;
    case "Away Win":
      green = a > h;
      if (a > h) resultado = "away_win";
      else if (h === a) resultado = "draw";
      else resultado = "home_win";
      break;
    default:
      resultado = "unknown";
      green = false;
  }

  const lucro = green ? odd - 1 : -1;
  const roi = lucro;
  return { resultado, green, lucro, roi };
}
