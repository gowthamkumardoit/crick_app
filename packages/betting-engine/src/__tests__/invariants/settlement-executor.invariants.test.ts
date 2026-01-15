import {
  executeMarketSettlement,
} from "../../market/market-settlement.executor";

import {
  createLedgerEntry,
  LedgerEntry,
  money,
} from "@predict-guru/platform-core";

describe("Settlement executor invariants", () => {

  const baseIntent = {
    marketId: "m1",
    mode: "POOL" as const,
    winners: ["u1"],
    now: 1,
  };

  test("settlement executes exactly once", () => {
    const ledger: LedgerEntry[] = [
      // user u1 placed a bet (locked funds)
      createLedgerEntry({
        userId: "u1",
        type: "LOCK",
        lockedDelta: money(100),
        marketId: "m1",
        createdAt: 1,
      }),
    ];

    /* ---------- first execution ---------- */

    const first = executeMarketSettlement({
      marketId: "m1",
      marketStatus: "LOCKED",
      ledger,
      intent: baseIntent,
    });

    expect(first.ok).toBe(true);

    const afterFirst = [
      ...ledger,
      ...(first.ok ? first.value : []),
    ];

    /* ---------- second execution (retry) ---------- */

    const second = executeMarketSettlement({
      marketId: "m1",
      marketStatus: "LOCKED",
      ledger: afterFirst,
      intent: baseIntent,
    });

    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.value.length).toBe(0); // idempotent
    }
  });

});
