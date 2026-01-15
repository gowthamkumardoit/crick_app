import {
    LedgerEntry,
    Result,
    ErrorCode,
    ErrorCategory,
    createLedgerEntry,
    money,
    buildWalletFromLedger,
} from "@predict-guru/platform-core";

/* ======================================================
   TYPES
====================================================== */

export interface RequestWithdrawalIntent {
    withdrawalId: string;
    userId: string;
    amount: number; // REAL money only
    now: number;
}

/* ======================================================
   ENGINE — WITHDRAWAL REQUEST (LOCK FUNDS)
====================================================== */

export function requestWithdrawalEngine(params: {
    ledger: LedgerEntry[];
    intent: RequestWithdrawalIntent;
}): Result<LedgerEntry[]> {

    const { ledger, intent } = params;

    /* ---------------- VALIDATION ---------------- */

    if (intent.amount <= 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.withdraw.invalid_amount",
                retryable: false,
            },
        };
    }

    /* ---------------- IDEMPOTENCY ---------------- */

    const alreadyRequested = ledger.some(
        e =>
            e.type === "LOCK" &&
            e.referenceId === intent.withdrawalId &&
            e.userId === intent.userId
    );

    if (alreadyRequested) {
        return {
            ok: false,
            error: {
                code: ErrorCode.ENTITY_ALREADY_PROCESSED,
                category: ErrorCategory.STATE,
                messageKey: "error.withdraw.already_requested",
                retryable: false,
            },
        };
    }

    /* ---------------- BALANCE CHECK ---------------- */

    const wallet = buildWalletFromLedger(intent.userId, ledger);

    if (wallet.realBalance < intent.amount) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INSUFFICIENT_BALANCE,
                category: ErrorCategory.MONEY,
                messageKey: "error.withdraw.insufficient_balance",
                retryable: false,
            },
        };
    }

    /* ---------------- LEDGER WRITE ---------------- */

    const deltas: LedgerEntry[] = [
        createLedgerEntry({
            userId: intent.userId,
            type: "LOCK",
            realDelta: money(-intent.amount),
            lockedDelta: money(intent.amount),
            referenceId: intent.withdrawalId,
            createdAt: intent.now,
        }),
    ];

    return { ok: true, value: deltas };
}
