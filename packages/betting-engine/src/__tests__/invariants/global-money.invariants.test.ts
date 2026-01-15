/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    money,
    ZERO_MONEY,
    buildWalletFromLedger,
} from "@predict-guru/platform-core";

import type { LedgerEntry } from "@predict-guru/platform-core";

import {
    adaptLockIntentToLedger,
} from "../../engine/core-adapter.engine";

import {
    settleMarketEngine,
    HOUSE_USER_ID,
} from "../../engine/settle-market.engine";

import { settleP2PEngine } from "../../engine/settle-p2p.engine";

import { sumRealBalances } from "../helpers/ledgerAssertions.helpers";

/* ======================================================
   HELPERS
====================================================== */

function lock(
    userId: string,
    refId: string,
    marketId: string | undefined,
    amount: number
): LedgerEntry[] {
    return adaptLockIntentToLedger({
        userId,
        referenceId: refId,
        marketId: marketId as any,
        realAmount: money(amount),
        bonusAmount: ZERO_MONEY,
        now: 1,
    });
}

function wallet(userId: string, ledger: LedgerEntry[]) {
    return buildWalletFromLedger(userId, ledger);
}

/* ======================================================
   GLOBAL MONEY CONSERVATION INVARIANTS
====================================================== */

describe("Global money conservation invariants", () => {

    test("[G-POOL] total money conserved in POOL settlement", () => {
        const ledger: LedgerEntry[] = [];
        const marketId = "m-global-pool";

        ledger.push(...lock("u1", marketId, marketId, 100));
        ledger.push(...lock("u2", marketId, marketId, 100));

        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                commissionRate: 0.25, // 25% of loser stake
                now: 2,
            },
        });

        if (!result.ok) throw new Error("POOL settlement failed");

        const full = [...ledger, ...result.value];

        const total = sumRealBalances(
            ["u1", "u2", HOUSE_USER_ID],
            full
        );

        // Only loser stake (100) is distributable
        expect(total).toBe(100);

        // No locked balances remain
        expect(wallet("u1", full).lockedBalance).toBe(0);
        expect(wallet("u2", full).lockedBalance).toBe(0);
    });

    test("[G-P2P] total money conserved in P2P settlement", () => {
        const ledger: LedgerEntry[] = [];
        const matchId = "m-global-p2p";

        ledger.push(...lock("u1", matchId, undefined, 300));
        ledger.push(...lock("u2", matchId, undefined, 200));

        const result = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"],
                commissionRate: 0.2, // 20% of 200 = 40
                now: 2,
            },
        });

        if (!result.ok) throw new Error("P2P settlement failed");

        const full = [...ledger, ...result.value];

        const total = sumRealBalances(
            ["u1", "u2", HOUSE_USER_ID],
            full
        );

        // Only loser stake (200) is distributable
        expect(total).toBe(200);

        // Locked balances always cleared
        expect(wallet("u1", full).lockedBalance).toBe(0);
        expect(wallet("u2", full).lockedBalance).toBe(0);
    });

});
