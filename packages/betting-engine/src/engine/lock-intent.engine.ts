import { Money } from "@predict-guru/platform-core";
import { splitStake } from "./stake-split.engine";
import { LockFundsIntent } from "../contracts/lock.intents";

/**
 * Produces a lock funds intent for core.
 * No side effects.
 */
export function createLockIntent(params: {
    userId: string;
    betId: string;
    stake: Money;
    maxBonusUsage: Money;
    now: number;
}): LockFundsIntent {

    const { realStake, bonusStake } = splitStake({
        stake: params.stake,
        maxBonusUsage: params.maxBonusUsage
    });

    return {
        userId: params.userId,
        referenceId: params.betId,
        realAmount: realStake,
        bonusAmount: bonusStake,
        createdAt: params.now
    };
}
