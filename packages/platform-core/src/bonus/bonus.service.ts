import { Money } from "../wallet/types";
import { ZERO_MONEY, isLessThan, money } from "../wallet/money";

/**
 * Calculate how much bonus can be used for a contest.
 * Enforces max usage ratio (e.g. 10%).
 */
export function calculateBonusUsage(params: {
    contestAmount: Money;
    availableBonus: Money;
    maxUsageRatio: number; // e.g. 0.1
}): Money {
    const { contestAmount, availableBonus, maxUsageRatio } = params;

    // Guard: invalid ratio
    if (maxUsageRatio <= 0) return ZERO_MONEY;
    if (maxUsageRatio >= 1) return contestAmount;

    // Convert Money -> number explicitly (domain boundary)
    const maxAllowed = money(
        Number(contestAmount) * maxUsageRatio
    );

    // Use the smaller of available bonus or allowed cap
    if (isLessThan(availableBonus, maxAllowed)) {
        return availableBonus;
    }

    return maxAllowed;
}
