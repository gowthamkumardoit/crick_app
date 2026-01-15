import { Money } from "@predict-guru/platform-core";


/**
 * Intent produced when a user places a bet.
 * No wallet mutation happens here.
 */
export interface PlaceBetIntent {
  betId: string;
  userId: string;
  marketId: string;

  /** Total stake requested */
  stake: Money;

  /** Max bonus allowed for this bet */
  maxBonusUsage: Money;

  /** Reference for idempotency (usually betId) */
  referenceId: string;

  createdAt: number;
}

/**
 * Intent produced when a bet is settled.
 * Payout is calculated by betting engine,
 * applied by platform-core.
 */
export interface SettleBetIntent {
  betId: string;
  userId: string;

  /** Final payout (0 for loss, stake+profit for win, stake for refund) */
  payout: Money;

  /** Reference for idempotent settlement */
  referenceId: string;

  settledAt: number;
}