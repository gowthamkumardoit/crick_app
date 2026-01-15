import { Wallet, Money } from "./types";
import { ZERO_MONEY, isLessThan, negateMoney, subtractMoney } from "./money";
import { ErrorCategory, ErrorCode, Result } from "../errors/types";

/**
 * Lock funds for pending bet or withdrawal.
 * Produces ledger deltas only.
 */
export function lockFunds(params: {
    wallet: Wallet;
    amount: Money;
}): Result<{ realDelta: Money; bonusDelta: Money; lockedDelta: Money }> {
    const { wallet, amount } = params;

    // Available = real - locked
    const available = subtractMoney(
        wallet.realBalance,
        wallet.lockedBalance
    );

    if (isLessThan(available, amount)) {
        return insufficientBalance();
    }

    return {
        ok: true,
        value: {
            realDelta: ZERO_MONEY,
            bonusDelta: ZERO_MONEY,
            lockedDelta: amount
        }
    };
}

/**
 * Unlock funds (after settle / rejection).
 */
export function unlockFunds(params: {
    amount: Money;
}): Result<{ realDelta: Money; bonusDelta: Money; lockedDelta: Money }> {
    return {
        ok: true,
        value: {
            realDelta: ZERO_MONEY,
            bonusDelta: ZERO_MONEY,
            lockedDelta: negateMoney(params.amount)
        }
    };
}

/* ============== Errors ============== */

function insufficientBalance(): Result<never> {
    return {
        ok: false,
        error: {
            code: ErrorCode.INSUFFICIENT_BALANCE,
            category: ErrorCategory.MONEY,
            messageKey: "error.wallet.insufficient_balance_for_lock",
            retryable: false
        }
    };
}
