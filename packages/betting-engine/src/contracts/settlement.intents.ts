import { Money } from "@predict-guru/platform-core";

export type BetOutcome = "WIN" | "LOSS" | "REFUND";

export interface SettlementIntent {
    userId: string;
    referenceId: string; // betId
    outcome: BetOutcome;
    stake: Money;
    payout: Money;      // 0 for LOSS / REFUND
    createdAt: number;
}
