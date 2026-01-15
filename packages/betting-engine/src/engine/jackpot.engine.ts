import {
    LedgerEntry,
    Result,
    ErrorCode,
    ErrorCategory,
    createLedgerEntry,
    money,
} from "@predict-guru/platform-core";

export const JACKPOT_USER_ID = "__JACKPOT__";

/* ======================================================
   TYPES
====================================================== */

export type JackpotSplit = "EQUAL" | "PROPORTIONAL";

export interface JackpotPayoutIntent {
    eventId: string;
    winners: string[];
    split: JackpotSplit;
    now: number;
}

/* ======================================================
   ENGINE — JACKPOT PAYOUT
====================================================== */

export function settleJackpotEngine(params: {
    ledger: LedgerEntry[];
    intent: JackpotPayoutIntent;
}): Result<LedgerEntry[]> {

    const { ledger, intent } = params;

    /* ---------------- VALIDATION ---------------- */

    if (!intent.winners || intent.winners.length === 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.jackpot.no_winners",
                retryable: false,
            },
        };
    }

    /* -------------------------------------------------
       STEP 1: READ JACKPOT BALANCE
    -------------------------------------------------- */

    let jackpotBalance = 0;

    for (const e of ledger) {
        if (e.userId === JACKPOT_USER_ID) {
            jackpotBalance += e.realDelta;
        }
    }

    if (jackpotBalance <= 0) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.jackpot.empty",
                retryable: false,
            },
        };
    }

    /* -------------------------------------------------
       STEP 2: CALCULATE SPLIT
    -------------------------------------------------- */

    const payouts = new Map<string, number>();

    if (intent.split === "EQUAL") {
        const perUser = Math.floor(
            jackpotBalance / intent.winners.length
        );

        if (perUser <= 0) {
            return {
                ok: false,
                error: {
                    code: ErrorCode.INVALID_INPUT,
                    category: ErrorCategory.VALIDATION,
                    messageKey: "error.jackpot.too_small",
                    retryable: false,
                },
            };
        }

        for (const u of intent.winners) {
            payouts.set(u, perUser);
        }
    }

    if (intent.split === "PROPORTIONAL") {
        // future-proof hook
        // for now fallback to EQUAL
        const perUser = Math.floor(
            jackpotBalance / intent.winners.length
        );
        for (const u of intent.winners) {
            payouts.set(u, perUser);
        }
    }

    const totalPaid = [...payouts.values()].reduce(
        (a, b) => a + b,
        0
    );

    /* -------------------------------------------------
       STEP 3: EMIT LEDGER ENTRIES
    -------------------------------------------------- */

    const deltas: LedgerEntry[] = [];

    // Debit jackpot
    deltas.push(
        createLedgerEntry({
            userId: JACKPOT_USER_ID,
            type: "WITHDRAW",
            realDelta: money(-totalPaid),
            referenceId: intent.eventId,
            createdAt: intent.now,
        })
    );

    // Credit winners
    for (const [userId, amount] of payouts.entries()) {
        deltas.push(
            createLedgerEntry({
                userId,
                type: "DEPOSIT",
                realDelta: money(amount),
                referenceId: intent.eventId,
                createdAt: intent.now,
            })
        );
    }

    return { ok: true, value: deltas };
}
