import {
  LedgerEntry,
  Result,
  ErrorCode,
  ErrorCategory,
} from "@predict-guru/platform-core";

import {
  MarketStatus,
  canSettleMarket,
  isSettlementInProgress,
  isFinalMarketState,
} from "./market-lifecycle";
import { settleMarketEngine } from "../engine/settle-market.engine";


/* ======================================================
   TYPES
====================================================== */

export interface ExecuteSettlementParams {
  marketId: string;
  marketStatus: MarketStatus;
  ledger: LedgerEntry[];
  intent: Parameters<typeof settleMarketEngine>[0]["intent"];
}

/* ======================================================
   HELPERS
====================================================== */

/**
 * Deterministic settlement identifier.
 * Must be the SAME across retries.
 */
export function buildSettlementId(marketId: string): string {
  return `SETTLEMENT::${marketId}`;
}

/**
 * Has this settlement already produced ledger entries?
 */
export function isSettlementApplied(
  ledger: LedgerEntry[],
  settlementId: string
): boolean {
  return ledger.some(
    (e) => e.referenceId === settlementId
  );
}

/* ======================================================
   EXECUTOR (IDEMPOTENT)
====================================================== */

export function executeMarketSettlement(
  params: ExecuteSettlementParams
): Result<LedgerEntry[]> {

  const {
    marketId,
    marketStatus,
    ledger,
    intent,
  } = params;

  const settlementId = buildSettlementId(marketId);

  /* --------------------------------------------------
     HARD GUARDS
  -------------------------------------------------- */

  if (isFinalMarketState(marketStatus)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.market.already_final",
        retryable: false,
      },
    };
  }

  if (isSettlementInProgress(marketStatus)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.market.settlement_in_progress",
        retryable: true,
      },
    };
  }

  if (!canSettleMarket(marketStatus)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.market.cannot_settle",
        retryable: false,
      },
    };
  }

  /* --------------------------------------------------
     IDEMPOTENCY CHECK (THE CORE)
  -------------------------------------------------- */

  if (isSettlementApplied(ledger, settlementId)) {
    // 🔒 Settlement already applied — safe no-op
    return {
      ok: true,
      value: [],
    };
  }

  /* --------------------------------------------------
     EXECUTE PURE SETTLEMENT
  -------------------------------------------------- */

  const result = settleMarketEngine({
    ledger,
    intent,
  });

  if (!result.ok) {
    return result;
  }

  /* --------------------------------------------------
     TAG LEDGER ENTRIES (CRITICAL)
  -------------------------------------------------- */

  const tagged: LedgerEntry[] = result.value.map((e) => ({
    ...e,
    referenceId: settlementId,
  }));

  return {
    ok: true,
    value: tagged,
  };
}
