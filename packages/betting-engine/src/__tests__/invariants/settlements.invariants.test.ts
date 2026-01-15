import { money, ZERO_MONEY } from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";
import { buildWalletFromLedger } from "@predict-guru/platform-core";

import { settleBetAdapter } from "../../engine/settle-bet.engine";
import { placeBetEngine } from "../../engine/place-bet-engine";
import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";

/* ======================================================
   MARKET SNAPSHOT (POOL)
====================================================== */

const poolMarket = {
    mode: "POOL" as const,
};

/* ======================================================
   HELPERS
====================================================== */

function entryTotalDelta(e: LedgerEntry): number {
    return e.realDelta + e.bonusDelta + e.lockedDelta;
}

function sumCredits(ledger: LedgerEntry[]) {
    return ledger
        .map(entryTotalDelta)
        .filter((v) => v > 0)
        .reduce((a, b) => a + b, 0);
}

function sumDebits(ledger: LedgerEntry[]) {
    return ledger
        .map(entryTotalDelta)
        .filter((v) => v < 0)
        .reduce((a, b) => a + Math.abs(b), 0);
}

function expectConservation(
    ledger: LedgerEntry[],
    expectedWin: number = 0
) {
    expect(sumCredits(ledger) - sumDebits(ledger)).toBe(expectedWin);
}

/* ======================================================
   SETTLE BET INVARIANTS (ATOMIC, PER-USER)
====================================================== */

describe("SettleBetAdapter invariants", () => {

    test("[G-1] WIN conserves money", () => {
        let ledger: LedgerEntry[] = [];

        // place bet
        const intent = placeBetEngine({
            betId: "b1",
            userId: "u1",
            market: poolMarket,
            stake: money(100),
            maxBonusUsage: money(0),
            now: 1,
        });
        if (!intent.ok) throw new Error();

        ledger = ledger.concat(
            adaptLockIntentToLedger({
                userId: "u1",
                referenceId: "b1",
                marketId: "m1",
                realAmount: money(100),
                bonusAmount: ZERO_MONEY,
                now: 1,
            })
        );

        // settle WIN
        const result = settleBetAdapter({
            userId: "u1",
            referenceId: "b1",
            outcome: "WIN",
            stake: money(100),
            winAmount: money(120),
            now: 2,
        });

        if (!result.ok) throw new Error();

        ledger = ledger.concat(result.value);

        expectConservation(ledger, 120);
    });

    test("[G-1] CANCEL unlocks stake with zero net change", () => {
        let ledger: LedgerEntry[] = [];

        const intent = placeBetEngine({
            betId: "b2",
            userId: "u1",
            market: poolMarket,
            stake: money(50),
            maxBonusUsage: money(0),
            now: 1,
        });
        if (!intent.ok) throw new Error();

        ledger = ledger.concat(
            adaptLockIntentToLedger({
                userId: "u1",
                referenceId: "b2",
                marketId: "m2",
                realAmount: money(50),
                bonusAmount: ZERO_MONEY,
                now: 1,
            })
        );

        const result = settleBetAdapter({
            userId: "u1",
            referenceId: "b2",
            outcome: "CANCEL",
            stake: money(50),
            now: 2,
        });

        if (!result.ok) throw new Error();

        ledger = ledger.concat(result.value);

        const wallet = buildWalletFromLedger("u1", ledger);
        expect(wallet.realBalance).toBe(0);
        expect(wallet.lockedBalance).toBe(0);
    });

    test("[W-1] LOSE does not credit winnings", () => {
        let ledger: LedgerEntry[] = [];

        const intent = placeBetEngine({
            betId: "b3",
            userId: "u1",
            market: poolMarket,
            stake: money(50),
            maxBonusUsage: money(0),
            now: 1,
        });
        if (!intent.ok) throw new Error();

        ledger = ledger.concat(
            adaptLockIntentToLedger({
                userId: "u1",
                referenceId: "b3",
                marketId: "m3",
                realAmount: money(50),
                bonusAmount: ZERO_MONEY,
                now: 1,
            })
        );

        const result = settleBetAdapter({
            userId: "u1",
            referenceId: "b3",
            outcome: "LOSE",
            stake: money(50),
            now: 2,
        });

        if (!result.ok) throw new Error();

        ledger = ledger.concat(result.value);

        const wallet = buildWalletFromLedger("u1", ledger);
        expect(wallet.realBalance).toBe(0);
        expect(wallet.lockedBalance).toBe(0);
    });

    test("[B-2] settlement is deterministic / pure function behavior", () => {
        const intent = {
            userId: "u1",
            referenceId: "b4",
            outcome: "WIN" as const,
            stake: money(100),
            winAmount: money(130),
            now: 2,
        };

        const r1 = settleBetAdapter(intent);
        const r2 = settleBetAdapter(intent);

        if (!r1.ok || !r2.ok) {
            throw new Error("settlement failed");
        }

        const w1 = buildWalletFromLedger("u1", r1.value);
        const w2 = buildWalletFromLedger("u1", r2.value);

        expect(w1).toEqual(w2);
    });

    test("[T-2] wallet rebuild from ledger is exact", () => {
        let ledger: LedgerEntry[] = [];

        ledger = ledger.concat(
            adaptLockIntentToLedger({
                userId: "u1",
                referenceId: "b5",
                marketId: "m4",
                realAmount: money(80),
                bonusAmount: ZERO_MONEY,
                now: 1,
            })
        );

        const result = settleBetAdapter({
            userId: "u1",
            referenceId: "b5",
            outcome: "WIN",
            stake: money(80),
            winAmount: money(100),
            now: 2,
        });

        if (!result.ok) throw new Error();

        ledger = ledger.concat(result.value);

        const walletA = buildWalletFromLedger("u1", ledger);
        const walletB = buildWalletFromLedger("u1", [...ledger]);

        expect(walletA).toEqual(walletB);
    });

});
