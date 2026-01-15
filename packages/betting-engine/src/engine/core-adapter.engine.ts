import {
    LedgerEntry,
    Money,
    createLedgerEntry,
    addMoney,
} from "@predict-guru/platform-core";

/**
 * Thin adapter: intent → ledger entries
 * No business logic.
 */
export function adaptLockIntentToLedger(params: {
    userId: string;
    referenceId: string;
    marketId?: string;
    realAmount: Money;
    bonusAmount: Money;
    now: number;
}): LedgerEntry[] {
    return [
        createLedgerEntry({
            userId: params.userId,
            type: "LOCK",
            lockedDelta: addMoney(params.realAmount, params.bonusAmount),
            referenceId: params.referenceId,
            ...(params.marketId !== undefined
                ? { marketId: params.marketId }
                : {}),
            createdAt: params.now,
        }),
    ];
}

