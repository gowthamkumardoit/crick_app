import {
  Money,
  LedgerEntry,
  Result,
  ZERO_MONEY,
  negateMoney,
  createLedgerEntry,
  ErrorCode,
  ErrorCategory,
} from "@predict-guru/platform-core";

/* ================= TYPES ================= */

export type BetOutcome = "WIN" | "LOSE" | "CANCEL";

export interface SettleBetIntent {
  userId: string;
  referenceId: string;
  /** market-level identity */
  outcome: BetOutcome;
  stake: Money;
  winAmount?: Money;
  now: number;
}

/* ================= ADAPTER ================= */

export function settleBetAdapter(
  intent: SettleBetIntent
): Result<LedgerEntry[]> {

  if (intent.outcome === "WIN" && !intent.winAmount) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.bet.win_amount_required",
        retryable: false,
      },
    };
  }

  if (intent.outcome !== "WIN" && intent.winAmount) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.bet.win_amount_not_allowed",
        retryable: false,
      },
    };
  }

  const entries: LedgerEntry[] = [];

  /* ---------------- WIN ---------------- */

  if (intent.outcome === "WIN") {
    // unlock stake
    entries.push(
      createLedgerEntry({
        userId: intent.userId,
        type: "UNLOCK",
        lockedDelta: negateMoney(intent.stake),
        referenceId: intent.referenceId,
        createdAt: intent.now,
      })
    );

    // credit winnings
    entries.push(
      createLedgerEntry({
        userId: intent.userId,
        type: "WIN",
        realDelta: intent.winAmount!,
        referenceId: intent.referenceId,
        createdAt: intent.now,
      })
    );
  }

  /* ---------------- LOSE / CANCEL ---------------- */

  if (intent.outcome === "LOSE" || intent.outcome === "CANCEL") {
    entries.push(
      createLedgerEntry({
        userId: intent.userId,
        type: "UNLOCK",
        lockedDelta: negateMoney(intent.stake),
        referenceId: intent.referenceId,
        createdAt: intent.now,
      })
    );
  }

  return { ok: true, value: entries };
}

