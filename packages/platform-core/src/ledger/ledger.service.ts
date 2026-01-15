import { LedgerEntry, LedgerEntryType } from "./types";
import { Money } from "../wallet/types";
import { ZERO_MONEY } from "../wallet/money";


/**
 * Creates a ledger entry.
 * Ledger is APPEND ONLY.
 * Compatible with exactOptionalPropertyTypes.
 */
export function createLedgerEntry(params: {
  userId: string;
  type: LedgerEntryType;

  realDelta?: Money;
  bonusDelta?: Money;
  lockedDelta?: Money;

  referenceId?: string;
  marketId?: string;

  createdAt: number;
}): LedgerEntry {
  return {
    entryId: crypto.randomUUID(),
    userId: params.userId,
    type: params.type,

    realDelta: params.realDelta ?? ZERO_MONEY,
    bonusDelta: params.bonusDelta ?? ZERO_MONEY,
    lockedDelta: params.lockedDelta ?? ZERO_MONEY,

    createdAt: params.createdAt,

    ...(params.referenceId !== undefined
      ? { referenceId: params.referenceId }
      : {}),

    ...(params.marketId !== undefined
      ? { marketId: params.marketId }
      : {}),
  };
}
