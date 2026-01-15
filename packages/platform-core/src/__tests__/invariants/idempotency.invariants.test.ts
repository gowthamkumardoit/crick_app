import { ensureNotAlreadyApplied } from "../../ledger/ledger.guard";
import { LedgerEntry } from "../../ledger/types";
import { ZERO_MONEY } from "../../wallet/money";

describe("Idempotency invariants", () => {

  test("duplicate ledger action is rejected", () => {
    const ledger: LedgerEntry[] = [
      {
        entryId: "1",
        userId: "u1",
        type: "UNLOCK",
        realDelta: ZERO_MONEY,
        bonusDelta: ZERO_MONEY,
        lockedDelta: ZERO_MONEY,
        referenceId: "ref1",
        createdAt: 1
      }
    ];

    const guard = ensureNotAlreadyApplied({
      ledger,
      referenceId: "ref1",
      type: "UNLOCK"
    });

    expect(guard.ok).toBe(false);
  });

});
