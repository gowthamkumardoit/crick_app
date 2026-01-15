/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    money,
    ZERO_MONEY,
    buildWalletFromLedger,
} from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";

import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";
import { settleP2PEngine } from "../../engine/settle-p2p.engine";
import { HOUSE_USER_ID } from "../../engine/settle-market.engine";

/* ======================================================
   HELPERS
====================================================== */

function lock(
    userId: string,
    matchId: string,
    betId: string,
    amount: number
): LedgerEntry[] {
    return adaptLockIntentToLedger({
        userId,
        referenceId: matchId, // P2P uses matchId
        marketId: undefined as any, // not used in P2P
        realAmount: money(amount),
        bonusAmount: ZERO_MONEY,
        now: 1,
    });
}

function wallet(userId: string, ledger: LedgerEntry[]) {
    return buildWalletFromLedger(userId, ledger);
}

/* ======================================================
   P2P SETTLEMENT INVARIANTS
====================================================== */

describe("P2P settlement invariants", () => {

    test("[P-1] winner takes loser stake (no commission)", () => {
        const ledger: LedgerEntry[] = [];
        const matchId = "p2p-1";

        ledger.push(...lock("u1", matchId, "b1", 100));
        ledger.push(...lock("u2", matchId, "b2", 100));

        const result = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"],
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet("u1", full).realBalance).toBe(100);
        expect(wallet("u2", full).realBalance).toBe(0);

        expect(wallet("u1", full).lockedBalance).toBe(0);
        expect(wallet("u2", full).lockedBalance).toBe(0);
    });

    test("[P-2] house receives commission from loser stake", () => {
        const ledger: LedgerEntry[] = [];
        const matchId = "p2p-2";

        ledger.push(...lock("u1", matchId, "b1", 200));
        ledger.push(...lock("u2", matchId, "b2", 100));

        const result = settleP2PEngine({
            ledger,
            intent: {
                matchId,
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
    });

    test("[P2P] winner takes loser stake", () => {
        const ledger: LedgerEntry[] = [];
        const matchId = "p2p-htoh";

        ledger.push(...lock("u1", matchId, "b1", 100));
        ledger.push(...lock("u2", matchId, "b2", 100));

        const result = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"], // ✅ exactly one winner
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet("u1", full).realBalance).toBe(100);
        expect(wallet("u2", full).realBalance).toBe(0);
    });


    test("[P-4] locked balances are always cleared", () => {
        const ledger: LedgerEntry[] = [];
        const matchId = "p2p-4";

        ledger.push(...lock("u1", matchId, "b1", 150));
        ledger.push(...lock("u2", matchId, "b2", 150));

        const result = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u2"],
                commissionRate: 0.2,
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        for (const u of ["u1", "u2"]) {
            expect(wallet(u, full).lockedBalance).toBe(0);
        }
    });

    test("[P-5] total money conserved including house", () => {
        const ledger: LedgerEntry[] = [];
        const matchId = "p2p-5";

        ledger.push(...lock("u1", matchId, "b1", 300));
        ledger.push(...lock("u2", matchId, "b2", 200));

        const result = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"],
                commissionRate: 0.2, // 20% of 200 = 40
                now: 2,
            },
        });

        if (!result.ok) throw new Error("settlement failed");

        const full = [...ledger, ...result.value];

        const total =
            wallet("u1", full).realBalance +
            wallet("u2", full).realBalance +
            wallet(HOUSE_USER_ID, full).realBalance;

        // Only loser stake is distributable
        expect(total).toBe(200);
    });

});
