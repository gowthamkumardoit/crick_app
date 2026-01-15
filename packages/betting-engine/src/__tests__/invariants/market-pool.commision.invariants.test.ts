import {
    money,
    ZERO_MONEY,
    buildWalletFromLedger,
} from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";

import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";
import {
    settleMarketEngine,
    HOUSE_USER_ID,
} from "../../engine/settle-market.engine";

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
   POOL COMMISSION INVARIANTS
====================================================== */

describe("POOL commission invariants", () => {

    test("house receives commission from loser pool", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m-commission-1";

        ledger.push(...lock("u1", marketId, "b1", 100));
        ledger.push(...lock("u2", marketId, "b2", 100));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                commissionRate: 0.25, // 25% of loser stake (100)
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet(HOUSE_USER_ID, full).realBalance).toBe(25);
        expect(wallet("u1", full).realBalance).toBe(75);
        expect(wallet("u2", full).realBalance).toBe(0);

        expect(wallet("u1", full).lockedBalance).toBe(0);
        expect(wallet("u2", full).lockedBalance).toBe(0);
    });

    test("total money conserved including house", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m-commission-2";

        ledger.push(...lock("u1", marketId, "b1", 200));
        ledger.push(...lock("u2", marketId, "b2", 100));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                commissionRate: 0.25, // 25% of loser stake (100 → 25)
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        const totalDistributed =
            wallet("u1", full).realBalance +
            wallet("u2", full).realBalance +
            wallet(HOUSE_USER_ID, full).realBalance;

        // Only loser stake is distributable
        expect(totalDistributed).toBe(100);
    });

});
