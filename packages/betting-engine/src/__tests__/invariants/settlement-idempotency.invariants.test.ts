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
        marketId: marketId as any, // intentional for test isolation
        realAmount: money(amount),
        bonusAmount: ZERO_MONEY,
        now: 1,
    });
}

/* ======================================================
   IDEMPOTENCY INVARIANTS
====================================================== */

describe("Settlement idempotency invariants", () => {

    /* --------------------------------------------------
       POOL MARKET IDEMPOTENCY
    -------------------------------------------------- */

    test("[I-POOL] cannot settle POOL market twice", () => {
        let ledger: LedgerEntry[] = [];
        const marketId = "m-idem-1";

        /* -------- Arrange -------- */

        ledger.push(...lock("u1", marketId, marketId, 100));
        ledger.push(...lock("u2", marketId, marketId, 100));

        const first = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                now: 2,
            },
        });

        if (!first.ok) {
            throw new Error("first POOL settlement failed");
        }

        ledger = ledger.concat(first.value);

        const beforeLength = ledger.length;
        const beforeU1 = buildWalletFromLedger("u1", ledger);
        const beforeU2 = buildWalletFromLedger("u2", ledger);

        /* -------- Act (SECOND SETTLEMENT) -------- */

        const second = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1"],
                now: 3,
            },
        });

        /* -------- Assert -------- */

        expect(second.ok).toBe(false);

        if (!second.ok) {
            expect(second.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
        }

        // Ledger must be immutable
        expect(ledger).toHaveLength(beforeLength);

        // Wallets must be unchanged
        const afterU1 = buildWalletFromLedger("u1", ledger);
        const afterU2 = buildWalletFromLedger("u2", ledger);

        expect(afterU1).toEqual(beforeU1);
        expect(afterU2).toEqual(beforeU2);
    });

    /* --------------------------------------------------
       P2P MATCH IDEMPOTENCY
    -------------------------------------------------- */

    test("[I-P2P] cannot settle P2P match twice", () => {
        let ledger: LedgerEntry[] = [];
        const matchId = "p2p-idem-1";

        /* -------- Arrange -------- */

        ledger.push(...lock("u1", matchId, undefined, 100));
        ledger.push(...lock("u2", matchId, undefined, 100));

        const first = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"],
                now: 2,
            },
        });

        if (!first.ok) {
            throw new Error("first P2P settlement failed");
        }

        ledger = ledger.concat(first.value);

        const beforeLength = ledger.length;
        const beforeU1 = buildWalletFromLedger("u1", ledger);
        const beforeU2 = buildWalletFromLedger("u2", ledger);

        /* -------- Act (SECOND SETTLEMENT) -------- */

        const second = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"],
                now: 3,
            },
        });

        /* -------- Assert -------- */

        expect(second.ok).toBe(false);

        if (!second.ok) {
            expect(second.error.category).toBe(ErrorCategory.STATE);
        }

        // Ledger must be immutable
        expect(ledger).toHaveLength(beforeLength);

        // Wallets must be unchanged
        const afterU1 = buildWalletFromLedger("u1", ledger);
        const afterU2 = buildWalletFromLedger("u2", ledger);

        expect(afterU1).toEqual(beforeU1);
        expect(afterU2).toEqual(beforeU2);
    });

});
