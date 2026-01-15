/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    money,
    ZERO_MONEY,
    buildWalletFromLedger,
} from "@predict-guru/platform-core";

import { LedgerEntry } from "@predict-guru/platform-core";
import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";
import {
    settleP2PEngine,
} from "../../engine/settle-p2p.engine";
import { HOUSE_USER_ID } from "../../engine/settle-market.engine";

/* ======================================================
   HELPERS
====================================================== */

function lock(
    userId: string,
    refId: string,
    amount: number
): LedgerEntry[] {
    return adaptLockIntentToLedger({
        userId,
        referenceId: refId,
        realAmount: money(amount),
        bonusAmount: ZERO_MONEY,
        now: 1,
    });
}

function wallet(userId: string, ledger: LedgerEntry[]) {
    return buildWalletFromLedger(userId, ledger);
}

/* ======================================================
   SCENARIO
====================================================== */

describe("Scenario: Basic P2P match lifecycle", () => {
    test("uneven stakes, single winner", () => {
        const ledger: LedgerEntry[] = [];
        const matchId = "p2p-basic";

        ledger.push(...lock("u1", matchId, 300));
        ledger.push(...lock("u2", matchId, 200));

        const result = settleP2PEngine({
            ledger,
            intent: {
                matchId,
                winners: ["u1"],
                commissionRate: 0.2, // 20% of 200 = 40
                now: 2,
            },
        });

        if (!result.ok) {
            throw new Error("P2P settlement failed");
        }

        const full = [...ledger, ...result.value];

        const walletU1 = wallet("u1", full);
        const walletU2 = wallet("u2", full);
        const house = wallet(HOUSE_USER_ID, full);

        // Winner gets ONLY distributable amount
        expect(walletU1.realBalance).toBe(160);

        // Loser loses stake
        expect(walletU2.realBalance).toBe(0);

        // House takes commission
        expect(house.realBalance).toBe(40);

        // No locked balances remain
        expect(walletU1.lockedBalance).toBe(0);
        expect(walletU2.lockedBalance).toBe(0);
    });
});
