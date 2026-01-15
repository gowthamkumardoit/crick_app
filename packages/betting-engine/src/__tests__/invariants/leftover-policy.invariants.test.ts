/* eslint-disable @typescript-eslint/no-explicit-any */
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
    JACKPOT_USER_ID,
} from "../../engine/settle-market.engine";
import { settleP2PEngine } from "../../engine/settle-p2p.engine";

/* ======================================================
   HELPERS
====================================================== */

function lockPool(
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

function lockP2P(
    userId: string,
    matchId: string,
    amount: number
): LedgerEntry[] {
    return adaptLockIntentToLedger({
        userId,
        referenceId: matchId,
        marketId: undefined as any,
        realAmount: money(amount),
        bonusAmount: ZERO_MONEY,
        now: 1,
    });
}

function wallet(userId: string, ledger: LedgerEntry[]) {
    return buildWalletFromLedger(userId, ledger);
}

/* ======================================================
   LEFTOVER POLICY INVARIANTS
====================================================== */

describe("Leftover handling policy invariants", () => {

    /* ---------------- POOL ---------------- */

    test("[POOL] leftover credited to HOUSE", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m-leftover-house";

        ledger.push(...lockPool("u1", marketId, "b1", 10));
        ledger.push(...lockPool("u2", marketId, "b2", 10));
        ledger.push(...lockPool("u3", marketId, "b3", 1));

        // Loser stake = 1
        // Winners = u1, u2
        // distributable = 1
        // each gets floor(0.5) = 0
        // leftover = 1 → HOUSE

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1", "u2"],
                leftoverPolicy: "HOUSE",
                now: 2,
            },
        });

        if (!result.ok) throw new Error("POOL settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet(HOUSE_USER_ID, full).realBalance).toBe(1);
        expect(wallet(JACKPOT_USER_ID, full).realBalance).toBe(0);

        expect(wallet("u1", full).realBalance).toBe(0);
        expect(wallet("u2", full).realBalance).toBe(0);
        expect(wallet("u3", full).realBalance).toBe(0);
    });

    test("[POOL] leftover credited to JACKPOT", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m-leftover-jackpot";

        ledger.push(...lockPool("u1", marketId, "b1", 10));
        ledger.push(...lockPool("u2", marketId, "b2", 10));
        ledger.push(...lockPool("u3", marketId, "b3", 1));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1", "u2"],
                leftoverPolicy: "JACKPOT",
                now: 2,
            },
        });

        if (!result.ok) throw new Error("POOL settlement failed");

        const full = [...ledger, ...result.value];

        expect(wallet(JACKPOT_USER_ID, full).realBalance).toBe(1);
        expect(wallet(HOUSE_USER_ID, full).realBalance).toBe(0);
    });

    /* ---------------- P2P ---------------- */

    test("[P2P] leftover credited to HOUSE", () => {
        const ledger: LedgerEntry[] = [];
        const matchId = "p2p-leftover-house";

        // exactly 2 participants
        ledger.push(...lockP2P("u1", matchId, 3));
        ledger.push(...lockP2P("u2", matchId, 2));

        const result = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"],        // ✅ exactly 1 winner
                leftoverPolicy: "HOUSE",
                now: 2,
            },
        });

        if (!result.ok) throw new Error("P2P settlement failed");

        const full = [...ledger, ...result.value];

        // loser stake = 2
        // payout = floor(2) = 2
        // leftover = 0
        expect(wallet(HOUSE_USER_ID, full).realBalance).toBe(0);
    });


    test("[P2P] leftover credited to JACKPOT", () => {
        const ledger: LedgerEntry[] = [];
        const matchId = "p2p-leftover-jackpot";

        // exactly 2 players
        ledger.push(...lockP2P("u1", matchId, 3));
        ledger.push(...lockP2P("u2", matchId, 2));

        const result = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"], // ✅ exactly one winner
                leftoverPolicy: "JACKPOT",
                now: 2,
            },
        });

        if (!result.ok) throw new Error("P2P settlement failed");

        const full = [...ledger, ...result.value];

        // loser stake = 2
        // winner gets floor(2 * (3/3)) = 2
        // leftover = 0 → no house, no jackpot credit
        expect(wallet(JACKPOT_USER_ID, full).realBalance).toBe(0);
        expect(wallet(HOUSE_USER_ID, full).realBalance).toBe(0);
    });


});
