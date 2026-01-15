import { Wallet, Money } from "../wallet/types";
import { LedgerEntry } from "../ledger/types";
import {
    ZERO_MONEY,
    isLessThan,
    negateMoney
} from "../wallet/money";
import { lockFunds } from "../wallet/lock.service";
import { createLedgerEntry } from "../ledger/ledger.service";
import { Result, ErrorCode, ErrorCategory } from "../errors/types";
import { ensureNotAlreadyApplied } from "../ledger/ledger.guard";
import { isErr } from "../errors/result";
import { ensureAccountActive } from "../identity/account-status.guard";
import { AccountStatus } from "../identity/types";

/* ======================================================
   USER REQUESTS WITHDRAWAL
   Locks funds immediately
====================================================== */
export function requestWithdrawal(params: {
    userId: string;
    userStatus: AccountStatus;        // ✅ ADD
    wallet: Wallet;
    ledger: LedgerEntry[];
    amount: Money;
    referenceId: string;
    now: number;
}): Result<LedgerEntry[]> {

    const {
        userId,
        userStatus,
        wallet,
        ledger,
        amount,
        referenceId,
        now
    } = params;

    /* ---------------- ACCOUNT STATUS GUARD ---------------- */
    const activeCheck = ensureAccountActive({
        userId,
        status: userStatus
    });

    if (isErr(activeCheck)) {
        return { ok: false, error: activeCheck.error };
    }

    /* ---------------- INPUT VALIDATION ---------------- */
    if (!isLessThan(ZERO_MONEY, amount)) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.withdrawal.invalid_amount",
                retryable: false
            }
        };
    }

    /* ---------------- IDEMPOTENCY GUARD ---------------- */
    const guard = ensureNotAlreadyApplied({
        ledger,
        referenceId,
        type: "LOCK"
    });

    if (isErr(guard)) {
        return { ok: false, error: guard.error };
    }

    /* ---------------- LOCK FUNDS ---------------- */
    const lock = lockFunds({ wallet, amount });

    if (isErr(lock)) {
        return { ok: false, error: lock.error };
    }

    /* ---------------- LEDGER ENTRY ---------------- */
    return {
        ok: true,
        value: [
            createLedgerEntry({
                userId,
                type: "LOCK",
                lockedDelta: lock.value.lockedDelta,
                referenceId,
                createdAt: now,
            })
        ]
    };
}

/* ======================================================
   FINANCE APPROVES WITHDRAWAL
   Deducts real balance + unlocks funds
====================================================== */
export function approveWithdrawal(params: {
    actorRole: "FINANCE";             // ✅ ADD
    userId: string;
    ledger: LedgerEntry[];            // ✅ ADD (idempotency)
    amount: Money;
    referenceId: string;
    now: number;
}): Result<LedgerEntry[]> {

    const { actorRole, userId, ledger, amount, referenceId, now } = params;

    /* ---------------- ROLE GUARD ---------------- */
    if (actorRole !== "FINANCE") {
        return {
            ok: false,
            error: {
                code: ErrorCode.UNAUTHORIZED,
                category: ErrorCategory.SECURITY,
                messageKey: "error.withdrawal.not_finance",
                retryable: false
            }
        };
    }

    /* ---------------- IDEMPOTENCY GUARD ---------------- */
    const guard = ensureNotAlreadyApplied({
        ledger,
        referenceId,
        type: "WITHDRAW"
    });

    if (isErr(guard)) {
        return { ok: false, error: guard.error };
    }

    return {
        ok: true,
        value: [
            // Deduct real money
            createLedgerEntry({
                userId,
                type: "WITHDRAW",
                realDelta: negateMoney(amount),
                referenceId,
                createdAt: now,
            }),

            // Unlock funds
            createLedgerEntry({
                userId,
                type: "UNLOCK",
                lockedDelta: negateMoney(amount),
                referenceId,
                createdAt: now,
            })

        ]
    };
}

/* ======================================================
   FINANCE REJECTS WITHDRAWAL
   Unlocks funds only
====================================================== */
export function rejectWithdrawal(params: {
    actorRole: "FINANCE";             // ✅ ADD
    userId: string;
    ledger: LedgerEntry[];            // ✅ ADD
    amount: Money;
    referenceId: string;
    now: number;
}): Result<LedgerEntry[]> {

    const { actorRole, userId, ledger, amount, referenceId, now } = params;

    /* ---------------- ROLE GUARD ---------------- */
    if (actorRole !== "FINANCE") {
        return {
            ok: false,
            error: {
                code: ErrorCode.UNAUTHORIZED,
                category: ErrorCategory.SECURITY,
                messageKey: "error.withdrawal.not_finance",
                retryable: false
            }
        };
    }

    /* ---------------- IDEMPOTENCY GUARD ---------------- */
    const guard = ensureNotAlreadyApplied({
        ledger,
        referenceId,
        type: "UNLOCK"
    });

    if (isErr(guard)) {
        return { ok: false, error: guard.error };
    }

    return {
        ok: true,
        value: [
            createLedgerEntry({
                userId,
                type: "UNLOCK",
                lockedDelta: negateMoney(amount),
                referenceId,
                createdAt: now,
            })

        ]
    };
}
