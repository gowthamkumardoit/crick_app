import { Money } from "@predict-guru/platform-core";
import { isLessThan, subtractMoney } from "@predict-guru/platform-core";

/**
 * Pure stake split logic.
 * No wallet, no ledger, no side effects.
 */
export function splitStake(params: {
    stake: Money;
    maxBonusUsage: Money;
}): {
    realStake: Money;
    bonusStake: Money;
} {

    const bonusStake = isLessThan(params.stake, params.maxBonusUsage)
        ? params.stake
        : params.maxBonusUsage;

    const realStake = subtractMoney(params.stake, bonusStake);

    return {
        realStake,
        bonusStake
    };
}
