import type { ErrorCodes } from "./types";

export abstract class BaseErr<C extends string, T extends ErrorCodes> extends Error {
  constructor(
    public readonly message: `${C}Err${T}: ${string}`,
    public readonly code: T,
  ) {
    super(message);
  }
}
