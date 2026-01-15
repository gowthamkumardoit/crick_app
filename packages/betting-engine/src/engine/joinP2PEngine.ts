import {
  Money,
  ZERO_MONEY,
  isLessThan,
  subtractMoney,
  Result,
  ErrorCategory,
  ErrorCode,
  money,
} from "@predict-guru/platform-core";

/* ======================================================
   INTENT
====================================================== */

export interface P2PJoinIntent {
  joinId: string;
  userId: string;
  matchId: string;
  stakeId: string;
  side: "A" | "B";

  stake: Money;
  maxBonusUsage: Money;

  lock: {
    real: Money;
    bonus: Money;
  };

  createdAt: number;
}

/* ======================================================
   ENGINE
====================================================== */

/**
 * Pure P2P join engine.
 * No Firestore, no ledger writes, no side effects.
 */
export function joinP2PEngine(params: {
  joinId: string;
  userId: string;
  matchId: string;
  stakeId: string;
  side: "A" | "B";

  stakeConfig: {
    amount: Money;
    enabled: boolean;
    maxBonusPercentage?: number;
  };

  wallet: {
    realBalance: Money;
    bonusBalance: Money;
  };

  requestedBonusUsage: Money;
  now: number;
}): Result<P2PJoinIntent> {

  /* ======================================================
     STAKE VALIDATION
  ====================================================== */

  if (!params.stakeConfig.enabled) {
    return {
      ok: false,
      error: {
        code: ErrorCode.ENTITY_NOT_ACTIVE,
        category: ErrorCategory.STATE,
        messageKey: "error.p2p.stake_disabled",
        retryable: false,
      },
    };
  }

  if (!isLessThan(ZERO_MONEY, params.stakeConfig.amount)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.p2p.invalid_stake_amount",
        retryable: false,
      },
    };
  }

  /* ======================================================
     BONUS VALIDATION
  ====================================================== */

  if (isLessThan(params.stakeConfig.amount, params.requestedBonusUsage)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        category: ErrorCategory.VALIDATION,
        messageKey: "error.p2p.bonus_exceeds_stake",
        retryable: false,
      },
    };
  }

  if (params.stakeConfig.maxBonusPercentage != null) {
    const maxBonusAllowed = money(
      Math.floor(
        (Number(params.stakeConfig.amount) *
          params.stakeConfig.maxBonusPercentage) /
          100
      )
    );

    if (isLessThan(maxBonusAllowed, params.requestedBonusUsage)) {
      return {
        ok: false,
        error: {
          code: ErrorCode.BONUS_USAGE_LIMIT_EXCEEDED,
          category: ErrorCategory.LIMIT,
          messageKey: "error.p2p.bonus_exceeds_limit",
          retryable: false,
        },
      };
    }
  }

  /* ======================================================
     WALLET SUFFICIENCY
  ====================================================== */

  const realRequired = subtractMoney(
    params.stakeConfig.amount,
    params.requestedBonusUsage
  );

  if (isLessThan(params.wallet.realBalance, realRequired)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INSUFFICIENT_BALANCE,
        category: ErrorCategory.MONEY,
        messageKey: "error.wallet.insufficient_balance",
        retryable: false,
      },
    };
  }

  if (isLessThan(params.wallet.bonusBalance, params.requestedBonusUsage)) {
    return {
      ok: false,
      error: {
        code: ErrorCode.INSUFFICIENT_BONUS,
        category: ErrorCategory.MONEY,
        messageKey: "error.wallet.insufficient_bonus",
        retryable: false,
      },
    };
  }

  /* ======================================================
     PRODUCE JOIN INTENT
  ====================================================== */

  return {
    ok: true,
    value: {
      joinId: params.joinId,
      userId: params.userId,
      matchId: params.matchId,
      stakeId: params.stakeId,
      side: params.side,

      stake: params.stakeConfig.amount,
      maxBonusUsage: params.requestedBonusUsage,

      lock: {
        real: realRequired,
        bonus: params.requestedBonusUsage,
      },

      createdAt: params.now,
    },
  };
}
