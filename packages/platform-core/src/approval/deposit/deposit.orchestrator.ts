import { Result, ErrorCode, ErrorCategory } from "../../errors/types";
import { LedgerEntry } from "../../ledger/types";
import { createLedgerEntry } from "../../ledger/ledger.service";
import { ensureNotAlreadyApplied } from "../../ledger/ledger.guard";
import { DepositIntent } from "./deposit.types";
import { isErr } from "../../errors/result";
import { ZERO_MONEY } from "../../wallet/money";
import { ensureAccountActive } from "../../identity/account-status.guard";
import { AccountStatus } from "../../identity/types";

export function approveDeposit(params: {
  actorId: string;
  actorRole: "FINANCE";
  deposit: DepositIntent;
  ledger: LedgerEntry[];
  userStatus: AccountStatus;   // ✅ ADD (freeze / suspend)
  now: number;
}): Result<LedgerEntry[]> {

  /* ---------------- ROLE GUARD ---------------- */
  if (params.actorRole !== "FINANCE") {
    return {
      ok: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        category: ErrorCategory.SECURITY,
        messageKey: "error.deposit.not_finance",
        retryable: false
      }
    };
  }

  /* ---------------- ACCOUNT STATUS GUARD ---------------- */
  const activeCheck = ensureAccountActive({
    userId: params.deposit.userId,
    status: params.userStatus
  });

  if (isErr(activeCheck)) {
    return { ok: false, error: activeCheck.error };
  }

  /* ---------------- IDEMPOTENCY GUARD ---------------- */
  const guard = ensureNotAlreadyApplied({
    ledger: params.ledger, // ✅ FIXED
    referenceId: params.deposit.depositId,
    type: "DEPOSIT"
  });

  if (isErr(guard)) {
    return { ok: false, error: guard.error };
  }

  /* ---------------- LEDGER ENTRY ---------------- */
  return {
    ok: true,
    value: [
      createLedgerEntry({
        userId: params.deposit.userId,
        type: "DEPOSIT",
        realDelta: params.deposit.amount,
        referenceId: params.deposit.depositId,
        createdAt: params.now,
      })

    ]
  };
}
