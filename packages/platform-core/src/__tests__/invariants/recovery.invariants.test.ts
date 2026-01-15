import { buildWalletFromLedger } from "../../wallet/wallet.service";
import { LedgerEntry } from "../../ledger/types";
import { money } from "../../wallet/money";

describe("Recovery invariants", () => {

  test("full ledger replay restores wallet correctly", () => {
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
        type: "BET",
        realDelta: money(-30),
        bonusDelta: money(0),
        lockedDelta: money(0),
        createdAt: 2
      }
    ];

    const wallet = buildWalletFromLedger("u1", ledger);

    expect(wallet.realBalance).toBe(70);
  });

});
