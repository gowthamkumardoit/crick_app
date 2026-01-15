import {
    LedgerEntry,
    Result,
    ErrorCode,
    ErrorCategory,
    createLedgerEntry,
    money,
} from "@predict-guru/platform-core";

export interface ResolveWithdrawalIntent {
    withdrawalId: string;
    userId: string;
    action: "APPROVE" | "REJECT";
    now: number;
}

export function resolveWithdrawalEngine(params: {
    ledger: LedgerEntry[];
    intent: ResolveWithdrawalIntent;
}): Result<LedgerEntry[]> {

    const { ledger, intent } = params;

    /* ---------------- FIND REQUEST ---------------- */

    const lock = ledger.find(
        e =>
            e.type === "LOCK" &&
            e.referenceId === intent.withdrawalId &&
            e.userId === intent.userId
    );

    if (!lock) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.withdraw.not_requested",
                retryable: false,
            },
        };
    }

    const amount = lock.lockedDelta;

    /* ---------------- IDEMPOTENCY ---------------- */

    const alreadyResolved = ledger.some(
        e =>
            (e.type === "WITHDRAW" || e.type === "UNLOCK") &&
            e.referenceId === intent.withdrawalId
    );

    if (alreadyResolved) {
        return {
            ok: false,
            error: {
                code: ErrorCode.ENTITY_ALREADY_PROCESSED,
                category: ErrorCategory.STATE,
                messageKey: "error.withdraw.already_resolved",
                retryable: false,
            },
        };
    }

    /* ---------------- RESOLUTION ---------------- */

    if (intent.action === "APPROVE") {
        return {
            ok: true,
            value: [
                createLedgerEntry({
                    userId: intent.userId,
                    type: "WITHDRAW",
                    lockedDelta: money(-amount), // ✅ unlock only
                    referenceId: intent.withdrawalId,
                    createdAt: intent.now,
                }),
            ],
        };
    }

    // REJECT → refund
    return {
        ok: true,
        value: [
            createLedgerEntry({
                userId: intent.userId,
                type: "UNLOCK",
                lockedDelta: money(-amount),
                realDelta: money(amount), // ✅ refund
                referenceId: intent.withdrawalId,
                createdAt: intent.now,
            }),
        ],
    };
}
