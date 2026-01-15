import { Money } from "../wallet/types";

export type BonusSource =
  | "JOINING"
  | "DEPOSIT"
  | "PROMOTIONAL"
  | "REFERRAL"
  | "MANUAL";

export type LedgerEntryType =
  | "DEPOSIT"
  | "WITHDRAW"
  | "BET"
  | "WIN"
  | "REFUND"
  | "BONUS_GRANTED"
  | "BONUS_USED"
  | "BONUS_BURNED"
  | "BONUS_EXPIRED"
  | "LOCK"
  | "UNLOCK"
  | "ADJUSTMENT";

export interface LedgerEntry {
  entryId: string;
  userId: string;
  type: LedgerEntryType;

  realDelta: Money;
  bonusDelta: Money;
  lockedDelta: Money;

  /** Bonus metadata (only for bonus-related entries) */
  bonusSource?: BonusSource | undefined;
  expiresAt?: number | undefined;

  referenceId?: string | undefined;
  marketId?: string;
  createdAt: number;
}
