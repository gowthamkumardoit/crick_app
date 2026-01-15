/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  money,
  buildWalletFromLedger,
  ZERO_MONEY,
} from "@predict-guru/platform-core";

import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";
import { settleMarketEngine } from "../../engine/settle-market.engine";

describe("Scenario: Basic POOL match lifecycle", () => {

  test("two users place bets and one wins", () => {
    const ledger: any[] = [];
    const marketId = "match-1";

    // User A bets 100
    ledger.push(
      ...adaptLockIntentToLedger({
        userId: "u1",
        referenceId: marketId,
        marketId,
        realAmount: money(100),
        bonusAmount: ZERO_MONEY,
        now: 1,
      })
    );

    // User B bets 100
    ledger.push(
      ...adaptLockIntentToLedger({
        userId: "u2",
        referenceId: marketId,
        marketId,
        realAmount: money(100),
        bonusAmount: ZERO_MONEY,
        now: 1,
      })
    );

    // Settle market — u1 wins
    const result = settleMarketEngine({
      ledger,
      intent: {
        marketId,
        mode: "POOL",
        winners: ["u1"],
        commissionRate: 0.2, // 20%
        now: 2,
      },
    });

    if (!result.ok) {
      throw new Error("Settlement failed");
    }

    const fullLedger = [...ledger, ...result.value];

    const walletU1 = buildWalletFromLedger("u1", fullLedger);
    const walletU2 = buildWalletFromLedger("u2", fullLedger);

    // Winner receives loser stake minus commission
    expect(walletU1.realBalance).toBe(80);
    expect(walletU2.realBalance).toBe(0);

    // No locked balances
    expect(walletU1.lockedBalance).toBe(0);
    expect(walletU2.lockedBalance).toBe(0);
  });

});
