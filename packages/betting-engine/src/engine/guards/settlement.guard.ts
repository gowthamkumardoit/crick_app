import { LedgerEntry } from "@predict-guru/platform-core";

/**
 * Returns true if a POOL market is already settled.
 */
export function isPoolSettled(
  ledger: LedgerEntry[],
  marketId: string
): boolean {
  return ledger.some(
    (e) => e.type === "WIN" && e.marketId === marketId
  );
}

/**
 * Returns true if a P2P match is already settled.
 */
export function isP2PSettled(
  ledger: LedgerEntry[],
  matchId: string
): boolean {
  return ledger.some(
    (e) => e.type === "WIN" && e.referenceId === matchId
  );
}
