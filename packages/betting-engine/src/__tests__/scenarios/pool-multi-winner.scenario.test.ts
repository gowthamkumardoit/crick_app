/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    money,
    ZERO_MONEY,
    buildWalletFromLedger,
} from "@predict-guru/platform-core";

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
    amount: number
) {
    return adaptLockIntentToLedger({
        userId,
        referenceId: marketId,
        marketId,
        realAmount: money(amount),
        bonusAmount: ZERO_MONEY,
        now: 1,
    });
}

function wallet(userId: string, ledger: any[]) {
    return buildWalletFromLedger(userId, ledger);
}

/* ======================================================
   SCENARIO
====================================================== */

describe("Scenario: POOL with multiple winners", () => {
    test("three players, two winners, one loser", () => {
        const ledger: any[] = [];
        const marketId = "pool-multi";

        // All players stake 100
        ledger.push(...lock("u1", marketId, 100));
        ledger.push(...lock("u2", marketId, 100));
        ledger.push(...lock("u3", marketId, 100));

        // u1 and u2 win
        const result = settleMarketEngine({
            ledger,
            intent: {
                marketId,
                mode: "POOL",
                winners: ["u1", "u2"],
                commissionRate: 0.2, // 20% of loser stake
                now: 2,
            },
        });

        if (!result.ok) {
            throw new Error("POOL settlement failed");
        }

        const full = [...ledger, ...result.value];

        const u1 = wallet("u1", full);
        const u2 = wallet("u2", full);
        const u3 = wallet("u3", full);
        const house = wallet(HOUSE_USER_ID, full);

        // Distributable = 100 - 20 = 80 → split between 2 winners
        expect(u1.realBalance).toBe(40);
        expect(u2.realBalance).toBe(40);

        // Loser gets nothing
        expect(u3.realBalance).toBe(0);

        // House takes commission
        expect(house.realBalance).toBe(20);

        // All locks cleared
        expect(u1.lockedBalance).toBe(0);
        expect(u2.lockedBalance).toBe(0);
        expect(u3.lockedBalance).toBe(0);
    });
});
