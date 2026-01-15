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
   PHASE 5 — POOL (PARI-MUTUEL) INVARIANTS
====================================================== */

describe("POOL market settlement invariants (pari-mutuel)", () => {

    test("[M-1] pool conserves money with commission", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m1";

        ledger.push(...lock("u1", marketId, "b1", 100));
        ledger.push(...lock("u2", marketId, "b2", 100));
        ledger.push(...lock("u3", marketId, "b3", 100));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                commissionRate: 0.1,
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet("u1", full).realBalance).toBe(180);
        expect(wallet("u2", full).realBalance).toBe(0);
        expect(wallet("u3", full).realBalance).toBe(0);

        expect(wallet("u1", full).lockedBalance).toBe(0);
        expect(wallet("u2", full).lockedBalance).toBe(0);
        expect(wallet("u3", full).lockedBalance).toBe(0);
    });

    test("[M-2] only winners receive payouts", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m2";

        ledger.push(...lock("u1", marketId, "b4", 100));
        ledger.push(...lock("u2", marketId, "b5", 100));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet("u1", full).realBalance).toBeGreaterThan(0);
        expect(wallet("u2", full).realBalance).toBe(0);
    });

    test("[M-3] no user ends with negative balances", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m3";

        ledger.push(...lock("u1", marketId, "b6", 50));
        ledger.push(...lock("u2", marketId, "b7", 150));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        for (const userId of ["u1", "u2"]) {
            const w = wallet(userId, full);
            expect(w.realBalance).toBeGreaterThanOrEqual(0);
            expect(w.lockedBalance).toBe(0);
            expect(w.bonusBalance).toBeGreaterThanOrEqual(0);
        }
    });

    test("[M-4] payout never exceeds max multiplier", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m4";

        ledger.push(...lock("u1", marketId, "b8", 100));
        ledger.push(...lock("u2", marketId, "b9", 1000));

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
        expect(wallet("u1", full).realBalance).toBeLessThanOrEqual(300);
    });

    test("[M-5] deterministic settlement (effect-idempotent)", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m5";

        ledger.push(...lock("u1", marketId, "b10", 100));
        ledger.push(...lock("u2", marketId, "b11", 100));

        const intent = {
            marketId,
            mode: "POOL" as const,
            winners: ["u1"],
            commissionRate: 0.1,
            now: 2,
        };

        const r1 = settleMarketEngine({ ledger, intent });
        const r2 = settleMarketEngine({ ledger, intent });

        if (!r1.ok || !r2.ok) throw new Error("settlement failed");

        const w1a = wallet("u1", [...ledger, ...r1.value]);
        const w1b = wallet("u1", [...ledger, ...r2.value]);

        expect(w1a).toEqual(w1b);
    });

});
