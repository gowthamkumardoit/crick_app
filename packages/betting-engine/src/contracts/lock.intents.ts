import { Money } from "@predict-guru/platform-core";

/**
 * Intent requesting core to lock funds for a bet.
 * Core validates & applies.
 */
export interface LockFundsIntent {
  userId: string;
  referenceId: string; // betId
  realAmount: Money;
  bonusAmount: Money;
  createdAt: number;
}
