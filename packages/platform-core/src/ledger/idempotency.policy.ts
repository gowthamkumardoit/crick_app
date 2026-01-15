import { LedgerEntry, LedgerEntryType } from "./types";

/**
 * Rules for detecting duplicate ledger actions.
 */
export const IDEMPOTENT_ACTIONS: Record<LedgerEntryType, boolean> = {
    BET: true,
    LOCK: true,
    UNLOCK: true,
    WIN: true,
    WITHDRAW: true,

    BONUS_GRANTED: true,
    BONUS_USED: true,
    BONUS_BURNED: true,
    BONUS_EXPIRED: true,

    DEPOSIT: true,
    REFUND: true,
    ADJUSTMENT: true
};
