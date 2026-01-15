import {
    money,
    ZERO_MONEY,
    buildWalletFromLedger,
} from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";

import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";
import { settleMarketEngine } from "../../engine/settle-market.engine";

/* ======================================================
   HELPERS
====================================================== */

/**
 * IMPORTANT:
 * - referenceId === betId
 * - marketId is explicit and REQUIRED
 */
function lock(
    userId: string,
    marketId: string,
    betId: string,
    amount: number
): LedgerEntry[] {
    return adaptLockIntentToLedger({
        userId,
        referenceId: betId,
        marketId,
        realAmount: money(amount),
        bonusAmount: ZERO_MONEY,
        now: 1,
    });
}

function wallet(userId: string, ledger: LedgerEntry[]) {
    return buildWalletFromLedger(userId, ledger);
}

/* ======================================================
   ROUNDING & LEFTOVER INVARIANTS (PHASE 5.1)
====================================================== */

describe("POOL settlement rounding & leftover invariants", () => {

    test("[R-1] fractional payouts are floored", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m-r1";

        ledger.push(...lock("u1", marketId, "b1", 1));
        ledger.push(...lock("u2", marketId, "b2", 1));
        ledger.push(...lock("u3", marketId, "b3", 1));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1", "u2"],
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet("u1", full).realBalance).toBe(0);
        expect(wallet("u2", full).realBalance).toBe(0);

        expect(wallet("u1", full).lockedBalance).toBe(0);
        expect(wallet("u2", full).lockedBalance).toBe(0);
        expect(wallet("u3", full).lockedBalance).toBe(0);
    });

    test("[R-2] total payouts never exceed distributable pool", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m-r2";

        ledger.push(...lock("u1", marketId, "b1", 1));
        ledger.push(...lock("u2", marketId, "b2", 2));
        ledger.push(...lock("u3", marketId, "b3", 3));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1", "u2"],
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        const paid =
            wallet("u1", full).realBalance +
            wallet("u2", full).realBalance;

        expect(paid).toBeLessThanOrEqual(3);
    });

    test("[R-3] multiplier cap produces leftover pool", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m-r3";

        ledger.push(...lock("u1", marketId, "b1", 10));
        ledger.push(...lock("u2", marketId, "b2", 100));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                maxMultiplier: 3,
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet("u1", full).realBalance).toBe(30);
        expect(wallet("u1", full).lockedBalance).toBe(0);
        expect(wallet("u2", full).realBalance).toBe(0);
    });

    test("[R-4] commission and rounding do not overpay users", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m-r4";

        ledger.push(...lock("u1", marketId, "b1", 2));
        ledger.push(...lock("u2", marketId, "b2", 3));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                commissionRate: 0.33,
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet("u1", full).realBalance).toBeLessThanOrEqual(3);
        expect(wallet("u2", full).realBalance).toBe(0);
    });

});
