import { Money } from "@predict-guru/platform-core";

export type BetStatus =
  | "PLACED"
  | "LOCKED"
  | "SETTLED"
  | "CANCELLED";

export interface Bet {
  betId: string;
  userId: string;
  marketId: string;
  stake: Money;
  maxBonusUsage: Money;
  status: BetStatus;
  createdAt: number;
}
