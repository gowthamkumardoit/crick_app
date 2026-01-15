import {
  Result,
  ErrorCode,
  ErrorCategory,
} from "@predict-guru/platform-core";

/* ======================================================
   MARKET STATUS
====================================================== */

/**
 * Canonical lifecycle states for a betting market.
 *
 * RULES:
 * - A market may only move forward.
 * - No state may be skipped.
 * - SETTLED and VOIDED are terminal.
 */
export type MarketStatus =
  | "DRAFT"     // created, not visible
  | "OPEN"      // accepting bets
  | "LOCKED"    // betting closed, match running
  | "SETTLING"  // settlement in progress (idempotent window)
  | "SETTLED"   // final, immutable
  | "VOIDED";   // cancelled & refunded


/* ======================================================
   TRANSITION TABLE (LAW)
====================================================== */

/**
 * This table defines ALL legal state transitions.
 * Any transition not listed here is forbidden.
 */
export const MARKET_TRANSITIONS: Record<
  MarketStatus,
  readonly MarketStatus[]
> = {
  DRAFT:    ["OPEN"],
  OPEN:     ["LOCKED", "VOIDED"],
  LOCKED:   ["SETTLING", "VOIDED"],
  SETTLING: ["SETTLED"],
  SETTLED:  [],
  VOIDED:   [],
};


/* ======================================================
   TRANSITION ENGINE (SINGLE SOURCE OF TRUTH)
====================================================== */

export function transitionMarketStatus(params: {
  marketId: string;
  from: MarketStatus;
  to: MarketStatus;
}): Result<{
  marketId: string;
  status: MarketStatus;
}> {

  const { marketId, from, to } = params;

  const allowed = MARKET_TRANSITIONS[from];

  if (!allowed || !allowed.includes(to)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.market.invalid_transition",
        retryable: false,
      },
    };
  }

  return {
    ok: true,
    value: {
      marketId,
      status: to,
    },
  };
}


/* ======================================================
   HARD GUARDS (USE EVERYWHERE)
====================================================== */

/**
 * Can a user place bets?
 */
export function canPlaceBet(status: MarketStatus): boolean {
  return status === "OPEN";
}

/**
 * Can payouts be previewed?
 */
export function canPreviewSettlement(status: MarketStatus): boolean {
  return status === "OPEN" || status === "LOCKED";
}

/**
 * Can settlement be executed?
 */
export function canSettleMarket(status: MarketStatus): boolean {
  return status === "LOCKED";
}

/**
 * Is market already final?
 */
export function isFinalMarketState(status: MarketStatus): boolean {
  return status === "SETTLED" || status === "VOIDED";
}

/**
 * Is settlement currently running?
 */
export function isSettlementInProgress(status: MarketStatus): boolean {
  return status === "SETTLING";
}


/* ======================================================
   SAFETY ASSERTIONS (OPTIONAL BUT STRONG)
====================================================== */

/**
 * Throws if settlement is attempted illegally.
 * Use this inside settlement engines or Firebase functions.
 */
export function assertMarketCanSettle(
  marketId: string,
  status: MarketStatus
): void {
  if (!canSettleMarket(status)) {
    throw new Error(
      `Market ${marketId} cannot be settled from status ${status}`
    );
  }
}
