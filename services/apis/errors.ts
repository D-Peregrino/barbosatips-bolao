export type SportsErrorCode =
  | "UNKNOWN"
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "NETWORK"
  | "UNAUTHORIZED"
  | "NOT_IMPLEMENTED";

export class SportsDataError extends Error {
  readonly code: SportsErrorCode;

  constructor(message: string, code: SportsErrorCode = "UNKNOWN") {
    super(message);
    this.name = "SportsDataError";
    this.code = code;
  }
}
