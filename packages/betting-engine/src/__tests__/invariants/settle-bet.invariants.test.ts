import { money, ZERO_MONEY, buildWalletFromLedger } from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";
import { settleBetAdapter } from "../../engine/settle-bet.engine";
import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";

/* ======================================================
   SETTLE BET INVARIANTS (ATOMIC, PHASE 4)
====================================================== */

describe("Settle bet invariants", () => {

    test("WIN unlocks stake and credits winnings", () => {
        const lockEntries: LedgerEntry[] = adaptLockIntentToLedger({
            userId: "u1",
            referenceId: "b1",
            marketId: "m1",
            realAmount: money(50),
            bonusAmount: ZERO_MONEY,
            now: 0,
        });

        const result = settleBetAdapter({
            userId: "u1",
            referenceId: "b1",
            outcome: "WIN",
            stake: money(50),
            winAmount: money(120),
            now: 1,
        });

        if (!result.ok) throw new Error("should succeed");

        const fullLedger = [...lockEntries, ...result.value];
        const wallet = buildWalletFromLedger("u1", fullLedger);

        expect(wallet.lockedBalance).toBe(0);
        expect(wallet.realBalance).toBe(120);
    });

    test("LOSE clears locked stake only", () => {
        const lockEntries: LedgerEntry[] = adaptLockIntentToLedger({
            userId: "u1",
            referenceId: "b2",
            marketId: "m2",
            realAmount: money(40),
            bonusAmount: ZERO_MONEY,
            now: 0,
        });

        const result = settleBetAdapter({
            userId: "u1",
            referenceId: "b2",
            outcome: "LOSE",
            stake: money(40),
            now: 1,
        });

        if (!result.ok) throw new Error("should succeed");

        const fullLedger = [...lockEntries, ...result.value];
        const wallet = buildWalletFromLedger("u1", fullLedger);

        expect(wallet.lockedBalance).toBe(0);
        expect(wallet.realBalance).toBe(0);
    });

    test("CANCEL unlocks stake without balance change", () => {
        const lockEntries: LedgerEntry[] = adaptLockIntentToLedger({
            userId: "u1",
            referenceId: "b3",
            marketId: "m3",
            realAmount: money(30),
            bonusAmount: ZERO_MONEY,
            now: 0,
        });

        const result = settleBetAdapter({
            userId: "u1",
            referenceId: "b3",
            outcome: "CANCEL",
            stake: money(30),
            now: 1,
        });

        if (!result.ok) throw new Error("should succeed");

        const fullLedger = [...lockEntries, ...result.value];
        const wallet = buildWalletFromLedger("u1", fullLedger);

        expect(wallet.lockedBalance).toBe(0);
        expect(wallet.realBalance).toBe(0);
    });

    test("WIN without winAmount fails", () => {
        const result = settleBetAdapter({
            userId: "u1",
            referenceId: "b4",
            outcome: "WIN",
            stake: money(20),
            now: 1,
        });

        expect(result.ok).toBe(false);
    });

});
