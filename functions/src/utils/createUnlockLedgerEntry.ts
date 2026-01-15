// functions/src/utils/createUnlockLedgerEntry.ts

export function createUnlockLedgerEntry(params: {
    userId: string;
    amount: number;
    referenceId: string;
    now: number;
    meta?: Record<string, unknown>;
}) {
    return {
        userId: params.userId,
        type: "UNLOCK",
        amount: params.amount,
        referenceId: params.referenceId,
        createdAt: params.now,
        meta: params.meta ?? {},
    };
}
