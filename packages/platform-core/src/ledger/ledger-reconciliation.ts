import {
    LedgerEntry,
} from "../ledger/types";

import {
    Result,
    ErrorCode,
    ErrorCategory,
} from "../errors/types";

/* ======================================================
   TYPES
====================================================== */

export interface WalletSnapshot {
    userId: string;
    realBalance: number;
    lockedBalance: number;
}

/* ======================================================
   LEDGER → WALLET SNAPSHOT
====================================================== */

export function buildWalletSnapshot(
    userId: string,
    ledger: LedgerEntry[]
): WalletSnapshot {

    let real = 0;
    let locked = 0;

    for (const e of ledger) {
        if (e.userId !== userId) continue;

        real += e.realDelta ?? 0;
        locked += e.lockedDelta ?? 0;
    }

    return {
        userId,
        realBalance: real,
        lockedBalance: locked,
    };
}

/* ======================================================
   WALLET INVARIANTS
====================================================== */

export function assertWalletInvariant(
    wallet: WalletSnapshot
): Result<void> {

    if (wallet.realBalance < 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_STATE_TRANSITION,
                category: ErrorCategory.MONEY,
                messageKey: "error.wallet.negative_real_balance",
                retryable: false,
            },
        };
    }

    if (wallet.lockedBalance < 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_STATE_TRANSITION,
                category: ErrorCategory.MONEY,
                messageKey: "error.wallet.negative_locked_balance",
                retryable: false,
            },
        };
    }

    return {
        ok: true,
        value: undefined,
    };

}

/* ======================================================
   GLOBAL MONEY CONSERVATION
====================================================== */

/**
 * Ensures the ledger does not mint or destroy money.
 * HOUSE / JACKPOT are allowed sinks.
 */
export function assertGlobalMoneyInvariant(
    ledger: LedgerEntry[]
): Result<void> {

    let total = 0;

    for (const e of ledger) {
        total += e.realDelta ?? 0;
        total += e.lockedDelta ?? 0;
    }

    if (total !== 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.SYSTEM_ERROR,
                category: ErrorCategory.SYSTEM,
                messageKey: "error.ledger.money_not_conserved",
                retryable: false,
            },
        };
    }

    return {
        ok: true,
        value: undefined,
    };

}

/* ======================================================
   FULL LEDGER RECONCILIATION
====================================================== */

/**
 * Runs all money safety checks.
 * Call after settlement, refunds, or migrations.
 */
export function reconcileLedger(params: {
    ledger: LedgerEntry[];
    userIds: string[];
}): Result<void> {

    const { ledger, userIds } = params;

    /* -------- per-wallet invariants -------- */

    for (const userId of userIds) {
        const wallet = buildWalletSnapshot(userId, ledger);

        const r = assertWalletInvariant(wallet);
        if (!r.ok) return r;
    }

    /* -------- global invariant -------- */

    const g = assertGlobalMoneyInvariant(ledger);
    if (!g.ok) return g;

    return {
        ok: true,
        value: undefined,
    };

}
