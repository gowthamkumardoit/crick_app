import {
    LedgerEntry,
    Result,
    ErrorCode,
    ErrorCategory,
    createLedgerEntry,
    money,
} from "@predict-guru/platform-core";

import { isPoolSettled } from "./guards/settlement.guard";
import { computePoolPayouts } from "./pool/pool-payout.math";

/* ======================================================
   CONSTANTS
====================================================== */

export const HOUSE_USER_ID = "__HOUSE__";
export const JACKPOT_USER_ID = "__JACKPOT__";

/* ======================================================
   TYPES
====================================================== */

export type LeftoverPolicy = "HOUSE" | "JACKPOT";

export interface SettleMarketIntent {
    marketId: string;
    mode: "POOL";
    winners: string[];
    commissionRate?: number;
    maxMultiplier?: number;
    leftoverPolicy?: LeftoverPolicy;
    now: number;
}

/* ======================================================
   ENGINE — POOL (PARI-MUTUEL)
====================================================== */

export function settleMarketEngine(params: {
    ledger: LedgerEntry[];
    intent: SettleMarketIntent;
}): Result<LedgerEntry[]> {

    const { ledger, intent } = params;

    /* ---------------- VALIDATION ---------------- */

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

    // ✅ Commission bounds invariant
    if (
        intent.commissionRate != null &&
        (intent.commissionRate < 0 || intent.commissionRate > 1)
    ) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.market.invalid_commission_rate",
                retryable: false,
            },
        };
    }

    if (isPoolSettled(ledger, intent.marketId)) {
        return {
            ok: false,
            error: {
                code: ErrorCode.ENTITY_ALREADY_PROCESSED,
                category: ErrorCategory.STATE,
                messageKey: "error.market.already_settled",
                retryable: false,
            },
        };
    }

    /* -------------------------------------------------
       STEP 1: COLLECT STAKES
    -------------------------------------------------- */

    const stakeByUser = new Map<string, number>();

    for (const e of ledger) {
        if (e.type === "LOCK" && e.marketId === intent.marketId) {
            stakeByUser.set(
                e.userId,
                (stakeByUser.get(e.userId) ?? 0) + e.lockedDelta
            );
        }
    }

    if (stakeByUser.size === 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.market.no_bets",
                retryable: false,
            },
        };
    }

    // ✅ Winner must be a participant
    for (const winnerId of intent.winners) {
        if (!stakeByUser.has(winnerId)) {
            return {
                ok: false,
                error: {
                    code: ErrorCode.INVALID_INPUT,
                    category: ErrorCategory.VALIDATION,
                    messageKey: "error.market.winner_not_participant",
                    retryable: false,
                },
            };
        }
    }

    /* -------------------------------------------------
       STEP 2: RAW PAYOUT MATH (PURE)
    -------------------------------------------------- */

    const winners = new Set(intent.winners);

    const {
        payouts: rawPayouts,
        commission,
        leftover: rawLeftover,
    } = computePoolPayouts({
        stakeByUser,
        winners,
        commissionRate: intent.commissionRate ?? 0,
    });

    /* -------------------------------------------------
       STEP 3: APPLY MAX MULTIPLIER (POLICY)
    -------------------------------------------------- */

    const finalPayouts: Record<string, number> = {};
    let totalPaid = 0;

    for (const [userId, stake] of stakeByUser) {
        const raw = rawPayouts[userId] ?? 0;

        const cap =
            intent.maxMultiplier != null
                ? Math.floor(stake * intent.maxMultiplier)
                : raw;

        const payout = Math.min(raw, cap);

        finalPayouts[userId] = payout;
        totalPaid += payout;
    }

    let finalLeftover = rawLeftover;

    if (intent.maxMultiplier != null) {
        const rawTotalPaid = Object.values(rawPayouts).reduce(
            (s, v) => s + v,
            0
        );

        if (totalPaid < rawTotalPaid) {
            finalLeftover += rawTotalPaid - totalPaid;
        }
    }

    /* -------------------------------------------------
       STEP 4: LEDGER WRITES
    -------------------------------------------------- */

    const deltas: LedgerEntry[] = [];

    // Commission → HOUSE
    if (commission > 0) {
        deltas.push(
            createLedgerEntry({
                userId: HOUSE_USER_ID,
                type: "DEPOSIT",
                realDelta: money(commission),
                marketId: intent.marketId,
                createdAt: intent.now,
            })
        );
    }

    // Leftover → policy target
    if (finalLeftover > 0) {
        const target =
            intent.leftoverPolicy === "JACKPOT"
                ? JACKPOT_USER_ID
                : HOUSE_USER_ID;

        deltas.push(
            createLedgerEntry({
                userId: target,
                type: "DEPOSIT",
                realDelta: money(finalLeftover),
                marketId: intent.marketId,
                createdAt: intent.now,
            })
        );
    }

    // Unlock stakes + winnings
    for (const [userId, stake] of stakeByUser) {
        deltas.push(
            createLedgerEntry({
                userId,
                type: "UNLOCK",
                lockedDelta: money(-stake),
                marketId: intent.marketId,
                createdAt: intent.now,
            })
        );

        const payout = finalPayouts[userId] ?? 0;

        if (payout > 0) {
            deltas.push(
                createLedgerEntry({
                    userId,
                    type: "WIN",
                    realDelta: money(payout),
                    marketId: intent.marketId,
                    createdAt: intent.now,
                })
            );
        }
    }

    return { ok: true, value: deltas };
}
