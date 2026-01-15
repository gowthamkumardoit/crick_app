import { approveDeposit } from "../../approval/deposit/deposit.orchestrator";
import { money } from "../../wallet/money";
import { buildWalletFromLedger } from "../../wallet/wallet.service";
import { LedgerEntry } from "../../ledger/types";
import { AccountStatus } from "../../identity/types";

test("deposit affects wallet only after finance approval", () => {
  const ledger: LedgerEntry[] = [];

  const result = approveDeposit({
    actorId: "f1",
    actorRole: "FINANCE",
    ledger,
    userStatus: "ACTIVE" as AccountStatus, // ✅ REQUIRED
    deposit: {
      depositId: "d1",
      userId: "u1",
      amount: money(100),
      source: "UPI",
      status: "REQUESTED",
      requestedAt: 1
    },
    now: 2
  });

  if (!result.ok) {
    throw new Error("deposit approval should succeed");
  }

  const wallet = buildWalletFromLedger("u1", result.value);

  expect(wallet.realBalance).toBe(100);
});

test("frozen user cannot receive deposit even with finance approval", () => {
  const result = approveDeposit({
    actorId: "f1",
    actorRole: "FINANCE",
    ledger: [],
    userStatus: "FROZEN",
    deposit: {
      depositId: "d2",
      userId: "u1",
      amount: money(50),
      source: "UPI",
      status: "REQUESTED",
      requestedAt: 1
    },
    now: 2
  });

  expect(result.ok).toBe(false);
});
