import {
    LedgerEntry,
    Result,
    ErrorCode,
    ErrorCategory,
    createLedgerEntry,
    money,
} from "@predict-guru/platform-core";

import { isP2PSettled } from "./guards/settlement.guard";
import {
    HOUSE_USER_ID,
    JACKPOT_USER_ID,
    LeftoverPolicy,
} from "./settle-market.engine";

/* ======================================================
   TYPES
====================================================== */

export interface SettleP2PIntent {
    matchId: string;
    winners: string[];
    commissionRate?: number;
    leftoverPolicy?: LeftoverPolicy; // 👈 NEW
    now: number;
}

/* ======================================================
   ENGINE — P2P SETTLEMENT (WITH LEFTOVER POLICY)
====================================================== */

export function settleP2PEngine(params: {
    ledger: LedgerEntry[];
    intent: SettleP2PIntent;
}): Result<LedgerEntry[]> {

    const { ledger, intent } = params;

    /* ---------------- VALIDATION ---------------- */

    if (!intent.winners || intent.winners.length === 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.p2p.no_winners",
                retryable: false,
            },
        };
    }
    
    // 🔒 P2P invariant: exactly ONE winner
    if (intent.winners.length !== 1) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.p2p.invalid_winner_count",
                retryable: false,
            },
        };
    }


    /* ---------------- IDEMPOTENCY ---------------- */

    if (isP2PSettled(ledger, intent.matchId)) {
        return {
            ok: false,
            error: {
                code: ErrorCode.ENTITY_ALREADY_PROCESSED,
                category: ErrorCategory.STATE,
                messageKey: "error.p2p.already_settled",
                retryable: false,
            },
        };
    }

    /* -------------------------------------------------
       STEP 1: COLLECT LOCKED STAKES
    -------------------------------------------------- */

    const stakeByUser = new Map<string, number>();

    for (const e of ledger) {
        if (e.type === "LOCK" && e.referenceId === intent.matchId) {
            stakeByUser.set(
                e.userId,
                (stakeByUser.get(e.userId) ?? 0) + e.lockedDelta
            );
        }
    }

    if (stakeByUser.size !== 2) {
        return {
            ok: false,
            error: {
                code: ErrorCode.ACTION_NOT_ALLOWED,
                category: ErrorCategory.STATE,
                messageKey: "error.p2p.invalid_participant_count",
                retryable: false,
            },
        };
    }


    /* -------------------------------------------------
       STEP 2: SPLIT WINNERS / LOSERS
    -------------------------------------------------- */

    const winners = new Set(intent.winners);

    let totalWinnerStake = 0;
    let totalLoserStake = 0;

    for (const [u, stake] of stakeByUser) {
        if (winners.has(u)) totalWinnerStake += stake;
        else totalLoserStake += stake;
    }

    if (totalWinnerStake === 0 || totalLoserStake === 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.p2p.invalid_sides",
                retryable: false,
            },
        };
    }

    const commissionRate = intent.commissionRate ?? 0;
    const commission = Math.floor(totalLoserStake * commissionRate);
    const distributable = totalLoserStake - commission;

    /* -------------------------------------------------
       STEP 3: PAYOUTS
    -------------------------------------------------- */

    const deltas: LedgerEntry[] = [];
    let totalPaidToWinners = 0;

    /* 🏦 HOUSE COMMISSION */
    if (commission > 0) {
        deltas.push(
            createLedgerEntry({
                userId: HOUSE_USER_ID,
                type: "DEPOSIT",
                realDelta: money(commission),
                referenceId: intent.matchId,
                createdAt: intent.now,
            })
        );
    }

    for (const [userId, stake] of stakeByUser) {

        /* 🔓 UNLOCK EVERYONE */
        deltas.push(
            createLedgerEntry({
                userId,
                type: "UNLOCK",
                lockedDelta: money(-stake),
                referenceId: intent.matchId,
                createdAt: intent.now,
            })
        );

        if (!winners.has(userId)) continue;

        const payout = Math.floor(
            (stake / totalWinnerStake) * distributable
        );

        if (payout > 0) {
            totalPaidToWinners += payout;

            deltas.push(
                createLedgerEntry({
                    userId,
                    type: "WIN",
                    realDelta: money(payout),
                    referenceId: intent.matchId,
                    createdAt: intent.now,
                })
            );
        }
    }

    /* -------------------------------------------------
       STEP 4: LEFTOVER HANDLING
    -------------------------------------------------- */

    const leftover =
        distributable - totalPaidToWinners;

    if (leftover > 0) {
        const target =
            intent.leftoverPolicy === "JACKPOT"
                ? JACKPOT_USER_ID
                : HOUSE_USER_ID;

        deltas.push(
            createLedgerEntry({
                userId: target,
                type: "DEPOSIT",
                realDelta: money(leftover),
                referenceId: intent.matchId,
                createdAt: intent.now,
            })
        );
    }


    return { ok: true, value: deltas };
}
