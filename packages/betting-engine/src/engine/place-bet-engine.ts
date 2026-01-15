/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Money,
  ZERO_MONEY,
  isLessThan,
  Result,
  ErrorCategory,
  ErrorCode,
} from "@predict-guru/platform-core";

import { PlaceBetIntent } from "../contracts/bet.intents";

/**
 * Pure betting-engine logic.
 * No wallet mutation, no ledger access.
 * All invariants enforced here.
 */
export function placeBetEngine(params: {
  betId: string;
  userId: string;

  // 🔒 Market snapshot (engine never fetches market)
  market: {
    mode: "POOL" | "P2P";
    stakeAmount?: Money; // required for P2P
  };

  stake: Money;
  maxBonusUsage: Money;
  now: number;
}): Result<PlaceBetIntent> {

  /* ======================================================
     UNIVERSAL INVARIANTS
  ====================================================== */

  // stake must be > 0
  if (!isLessThan(ZERO_MONEY, params.stake)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.bet.invalid_stake",
        retryable: false,
      },
    };
  }

  // bonus usage must not exceed stake
  if (isLessThan(params.stake, params.maxBonusUsage)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.bet.bonus_exceeds_stake",
        retryable: false,
      },
    };
  }

  /* ======================================================
     MODE-SPECIFIC INVARIANTS
  ====================================================== */

  // 🔒 P2P markets require exact stake match
  if (params.market.mode === "P2P") {
    if (!params.market.stakeAmount) {
      return {
        ok: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          category: ErrorCategory.VALIDATION,
          messageKey: "error.bet.missing_market_stake",
          retryable: false,
        },
      };
    }

    if (params.stake !== params.market.stakeAmount) {
      return {
        ok: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          category: ErrorCategory.VALIDATION,
          messageKey: "error.bet.invalid_p2p_stake",
          retryable: false,
        },
      };
    }
  }

  // POOL markets: no fixed stake invariant (by design)

  /* ======================================================
     PRODUCE INTENT (NO SIDE EFFECTS)
  ====================================================== */

  return {
    ok: true,
    value: {
      betId: params.betId,
      userId: params.userId,

      // marketId should be injected by caller if needed downstream
      marketId: undefined as any, // or pass explicitly if required

      stake: params.stake,
      maxBonusUsage: params.maxBonusUsage,
      referenceId: params.betId,
      createdAt: params.now,
    },
  };
}
