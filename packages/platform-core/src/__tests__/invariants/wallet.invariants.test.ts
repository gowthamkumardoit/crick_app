import { LedgerEntry } from "../../ledger/types";
import { money } from "../../wallet/money";
import { buildWalletFromLedger } from "../../wallet/wallet.service";

describe("Wallet invariants", () => {

  test("wallet balances never go negative after applying ledger", () => {
    const ledger: LedgerEntry[] = [
      {
        entryId: "1",
        userId: "u1",
        type: "DEPOSIT",
        realDelta: money(100),
        bonusDelta: money(0),
        lockedDelta: money(0),
        createdAt: 1
      },
      {
        entryId: "2",
        userId: "u1",
        type: "LOCK",
        realDelta: money(0),
        bonusDelta: money(0),
        lockedDelta: money(40),
        createdAt: 2
      },
      {
        entryId: "3",
        userId: "u1",
        type: "UNLOCK",
        realDelta: money(0),
        bonusDelta: money(0),
        lockedDelta: money(-10),
        createdAt: 3
      }
    ];

    const wallet = buildWalletFromLedger("u1", ledger);

    expect(wallet.realBalance).toBeGreaterThanOrEqual(0);
    expect(wallet.bonusBalance).toBeGreaterThanOrEqual(0);
    expect(wallet.lockedBalance).toBeGreaterThanOrEqual(0);

    // 🔒 Locked funds can never exceed real funds
    expect(wallet.lockedBalance).toBeLessThanOrEqual(wallet.realBalance);
  });

});
