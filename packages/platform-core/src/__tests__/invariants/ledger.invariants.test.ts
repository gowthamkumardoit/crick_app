import { LedgerEntry } from "../../ledger/types";
import { money } from "../../wallet/money";
import { buildWalletFromLedger } from "../../wallet/wallet.service";
import {
  buildWalletSnapshot,
  reconcileLedger,
} from "../../ledger/ledger-reconciliation";
import { createLedgerEntry } from "../../ledger/ledger.service";


describe("Ledger invariants", () => {
  it("is append-only and replayable", () => {
    const ledger: LedgerEntry[] = [
      {
        entryId: "1",
        userId: "u1",
        type: "DEPOSIT",
        realDelta: money(100),
        bonusDelta: money(0),
        lockedDelta: money(0),
        createdAt: 1,
      },
      {
        entryId: "2",
        userId: "u1",
        type: "WITHDRAW",
        realDelta: money(-30),
        bonusDelta: money(0),
        lockedDelta: money(0),
        createdAt: 2,
      },
    ];

    const wallet1 = buildWalletFromLedger("u1", ledger);
    const wallet2 = buildWalletFromLedger("u1", ledger);

    expect(wallet1).toStrictEqual(wallet2);
  });


  /* --------------------------------------------------
     CASE 1: wallet balances never go negative
  -------------------------------------------------- */
  test("wallet balances never go negative", () => {
    const ledger: LedgerEntry[] = [
      createLedgerEntry({
        userId: "u1",
        type: "DEPOSIT",
        realDelta: money(100),
        createdAt: 1,
      }),
      createLedgerEntry({
        userId: "u1",
        type: "WITHDRAW",
        realDelta: money(-100),
        createdAt: 2,
      }),
    ];

    const wallet = buildWalletSnapshot("u1", ledger);

    expect(wallet.realBalance).toBe(0);
    expect(wallet.lockedBalance).toBe(0);
  });

  /* --------------------------------------------------
     CASE 2: negative real balance is rejected
  -------------------------------------------------- */
  test("negative real balance is rejected", () => {
    const ledger: LedgerEntry[] = [
      createLedgerEntry({
        userId: "u1",
        type: "WITHDRAW",
        realDelta: money(-10),
        createdAt: 1,
      }),
    ];

    const result = reconcileLedger({
      ledger,
      userIds: ["u1"],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.category).toBe("MONEY");
    }
  });

  /* --------------------------------------------------
     CASE 3: global money is conserved
  -------------------------------------------------- */
  test("money conserved across lock and unlock", () => {
    const ledger: LedgerEntry[] = [
      createLedgerEntry({
        userId: "u1",
        type: "LOCK",
        lockedDelta: money(100),
        createdAt: 1,
      }),
      createLedgerEntry({
        userId: "u1",
        type: "UNLOCK",
        lockedDelta: money(-100),
        createdAt: 2,
      }),
    ];

    const result = reconcileLedger({
      ledger,
      userIds: ["u1"],
    });

    expect(result.ok).toBe(true);
  });




  /* --------------------------------------------------
     CASE 4: money creation is rejected
  -------------------------------------------------- */
  test("money creation is rejected", () => {
    const ledger: LedgerEntry[] = [
      createLedgerEntry({
        userId: "u1",
        type: "DEPOSIT",
        realDelta: money(50),
        createdAt: 1,
      }),
    ];

    const result = reconcileLedger({
      ledger,
      userIds: ["u1"],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.category).toBe("SYSTEM");
    }
  });

  test("money conserved across bet and win", () => {
    const ledger: LedgerEntry[] = [
      createLedgerEntry({
        userId: "u1",
        type: "BET",
        realDelta: money(-50),
        lockedDelta: money(50),
        createdAt: 1,
      }),
      createLedgerEntry({
        userId: "u1",
        type: "UNLOCK",
        lockedDelta: money(-50),
        createdAt: 2,
      }),
      createLedgerEntry({
        userId: "u1",
        type: "WIN",
        realDelta: money(50),
        createdAt: 3,
      }),
    ];

    const result = reconcileLedger({
      ledger,
      userIds: ["u1"],
    });

    expect(result.ok).toBe(true);
  });

});
