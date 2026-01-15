/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    money,
    ZERO_MONEY,
    buildWalletFromLedger,
    ErrorCode,
    ErrorCategory,
} from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";

import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";
import { settleMarketEngine } from "../../engine/settle-market.engine";
import { settleP2PEngine } from "../../engine/settle-p2p.engine";

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

/* ======================================================
   CONCURRENCY INVARIANTS
====================================================== */

describe("Settlement concurrency invariants", () => {

    /* --------------------------------------------------
       POOL — RETRY SAFETY AFTER COMMIT
    -------------------------------------------------- */

    test("[I-POOL] settlement retry after commit is rejected", () => {
        let ledger: LedgerEntry[] = [];
        const marketId = "m-race-1";

        /* -------- Arrange -------- */

        ledger.push(...lock("u1", marketId, marketId, 100));
        ledger.push(...lock("u2", marketId, marketId, 100));

        /* -------- First settlement (wins the race) -------- */

        const first = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                now: 2,
            },
        });

        expect(first.ok).toBe(true);
        if (!first.ok) {
            throw new Error("first settlement should succeed");
        }
        ledger = ledger.concat(first.value);

        /* -------- Retry (simulated concurrent retry) -------- */

        const retry = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                now: 3,
            },
        });

        /* -------- Assert -------- */

        expect(retry.ok).toBe(false);
        if (!retry.ok) {
            expect(retry.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
            expect(retry.error.category).toBe(ErrorCategory.STATE);
        }

        const walletU1 = buildWalletFromLedger("u1", ledger);
        const walletU2 = buildWalletFromLedger("u2", ledger);

        expect(walletU1.lockedBalance).toBe(0);
        expect(walletU2.lockedBalance).toBe(0);
        expect(walletU1.realBalance).toBeGreaterThan(0);
        expect(walletU2.realBalance).toBe(0);
    });

    /* --------------------------------------------------
       P2P — RETRY SAFETY AFTER COMMIT
    -------------------------------------------------- */

    test("[I-P2P] settlement retry after commit is rejected", () => {
        let ledger: LedgerEntry[] = [];
        const matchId = "p2p-race-1";

        /* -------- Arrange -------- */

        ledger.push(...lock("u1", matchId, undefined, 100));
        ledger.push(...lock("u2", matchId, undefined, 100));

        /* -------- First settlement -------- */

        const first = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"],
                now: 2,
            },
        });

        expect(first.ok).toBe(true);
        if (!first.ok) {
            throw new Error("first P2P settlement should succeed");
        }
        ledger = ledger.concat(first.value);

        /* -------- Retry -------- */

        const retry = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"],
                now: 3,
            },
        });

        /* -------- Assert -------- */

        expect(retry.ok).toBe(false);
        if (!retry.ok) {
            expect(retry.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
            expect(retry.error.category).toBe(ErrorCategory.STATE);
        }

        const walletU1 = buildWalletFromLedger("u1", ledger);
        const walletU2 = buildWalletFromLedger("u2", ledger);

        expect(walletU1.lockedBalance).toBe(0);
        expect(walletU2.lockedBalance).toBe(0);
        expect(walletU1.realBalance).toBeGreaterThan(0);
        expect(walletU2.realBalance).toBe(0);
    });

});
