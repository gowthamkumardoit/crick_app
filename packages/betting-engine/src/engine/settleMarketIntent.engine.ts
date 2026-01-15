import {
    LedgerEntry,
    Result,
    ErrorCode,
    ErrorCategory,
    createLedgerEntry,
    money,
} from "@predict-guru/platform-core";

/* ======================================================
   TYPES
====================================================== */

export interface SettleMarketIntent {
    marketId: string;
    mode: "POOL";
    winners: string[];
    commissionRate?: number;
    maxMultiplier?: number;
    now: number;
}

/* ======================================================
   ENGINE (STEP C.0 — SKELETON)
====================================================== */

export function settleMarketEngineIntent(params: {
    ledger: LedgerEntry[];
    intent: SettleMarketIntent;
}): Result<LedgerEntry[]> {
    const { ledger, intent } = params;

    if (intent.mode !== "POOL") {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.market.invalid_mode",
                retryable: false,
            },
        };
    }

    if (!intent.winners || intent.winners.length === 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.market.no_winners",
                retryable: false,
            },
        };
    }

    // STEP C.0: do nothing yet
    return { ok: true, value: [] };
}
