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

function lock(userId: string, marketId: string, amount: number) {
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

describe("Scenario: POOL rounding edge case", () => {
  test("rounding remainder goes to house", () => {
    const ledger: any[] = [];
    const marketId = "pool-rounding";

    ledger.push(...lock("u1", marketId, 101));
    ledger.push(...lock("u2", marketId, 101));
    ledger.push(...lock("u3", marketId, 101));

    const result = settleMarketEngine({
      ledger,
      intent: {
        marketId,
        mode: "POOL",
        winners: ["u1"],
        commissionRate: 0.1, // 10%
        now: 2,
      },
    });

    if (!result.ok) {
      throw new Error("POOL settlement failed");
    }

    const full = [...ledger, ...result.value];

    const u1 = wallet("u1", full);
    const house = wallet(HOUSE_USER_ID, full);

    // Distributable = floor(202 * 0.9) = 181
    expect(u1.realBalance).toBe(181);

    // Remainder (1) + commission (20) = 21
    expect(house.realBalance).toBe(21);

    expect(u1.lockedBalance).toBe(0);
  });
});
