import { LedgerEntry } from "../../ledger/types";
import { money } from "../../wallet/money";
import { buildWalletFromLedger } from "../../wallet/wallet.service";

describe("Bonus invariants", () => {

  test("bonus does not affect real balance unless converted", () => {
    const ledger: LedgerEntry[] = [
      {
        entryId: "1",
        userId: "u1",
        type: "BONUS_GRANTED",
        realDelta: money(0),
        bonusDelta: money(50),
        lockedDelta: money(0),
        createdAt: 1
      }
    ];

    const wallet = buildWalletFromLedger("u1", ledger);

    expect(wallet.realBalance).toBe(0);
    expect(wallet.bonusBalance).toBe(50);
  });

});
