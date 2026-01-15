/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    money,
    ZERO_MONEY,
    buildWalletFromLedger,
} from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";

import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";
import { settleMarketEngine } from "../../engine/settle-market.engine";
import { settleP2PEngine } from "../../engine/settle-p2p.engine";

import { previewPoolSettlement } from "../../engine/preview/preview-pool.engine";
import { previewP2PSettlement } from "../../engine/preview/preview-p2p.engine";

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
   PREVIEW vs SETTLEMENT INVARIANTS
====================================================== */

describe("Preview vs Settlement invariants", () => {

    /* ---------------- POOL ---------------- */

    test("[POOL] preview payouts match settlement results", () => {
        let ledger: LedgerEntry[] = [];
        const marketId = "m-preview-1";

        ledger.push(...lockPool("u1", marketId, "b1", 100));
        ledger.push(...lockPool("u2", marketId, "b2", 50));
        ledger.push(...lockPool("u3", marketId, "b3", 25));

        const preview = previewPoolSettlement({
            ledger,
            marketId,
            winners: ["u1", "u2"],
            commissionRate: 0.1,
            maxMultiplier: 3,
        });

        const settlement = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1", "u2"],
                commissionRate: 0.1,
                maxMultiplier: 3,
                now: 2,
            },
        });

        if (!settlement.ok) throw new Error("POOL settlement failed");

        ledger = ledger.concat(settlement.value);

        expect(wallet("u1", ledger).realBalance)
            .toBe(preview.payouts["u1"] ?? 0);

        expect(wallet("u2", ledger).realBalance)
            .toBe(preview.payouts["u2"] ?? 0);
    });

    /* ---------------- P2P ---------------- */

    test("[P2P] preview payouts match settlement results", () => {
        let ledger: LedgerEntry[] = [];
        const matchId = "p2p-preview-1";

        // exactly 2 participants
        ledger.push(...lockP2P("u1", matchId, 60));
        ledger.push(...lockP2P("u2", matchId, 40));

        const preview = previewP2PSettlement({
            ledger,
            matchId,
            winners: ["u1"], // ✅ exactly 1 winner
            commissionRate: 0.2,
        });

        const settlement = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"], // ✅ exactly 1 winner
                commissionRate: 0.2,
                now: 2,
            },
        });

        if (!settlement.ok) throw new Error("P2P settlement failed");

        ledger = ledger.concat(settlement.value);

        expect(wallet("u1", ledger).realBalance)
            .toBe(preview.payouts["u1"] ?? 0);

        expect(wallet("u2", ledger).realBalance)
            .toBe(preview.payouts["u2"] ?? 0);
    });


});
