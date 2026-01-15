import { Wallet, Money } from "./types";
import { ZERO_MONEY, addMoney, negateMoney, isLessThan } from "./money";
import { ErrorCategory, ErrorCode, Result } from "../errors/types";
import { LedgerEntry } from "../ledger/types";

/**
 * Rebuild wallet state from ledger entries.
 * SINGLE SOURCE OF TRUTH.
 */
export function buildWalletFromLedger(
    userId: string,
    ledger: LedgerEntry[]
): Wallet {
    let realBalance: Money = ZERO_MONEY;
    let bonusBalance: Money = ZERO_MONEY;
    let lockedBalance: Money = ZERO_MONEY;

    for (const entry of ledger) {
        if (entry.userId !== userId) continue;

        realBalance = addMoney(realBalance, entry.realDelta);
        bonusBalance = addMoney(bonusBalance, entry.bonusDelta);
        lockedBalance = addMoney(lockedBalance, entry.lockedDelta);
    }

    return {
        userId,
        realBalance,
        bonusBalance,
        lockedBalance
    };
}

/**
 * Debit wallet for bets / withdrawals.
 * Returns ledger deltas only.
 */
export function debitWallet(params: {
    wallet: Wallet;
    amount: Money;
    source: "REAL" | "BONUS";
}): Result<{ realDelta: Money; bonusDelta: Money }> {
    const { wallet, amount, source } = params;

    if (source === "REAL") {
        if (isLessThan(wallet.realBalance, amount)) {
            return insufficientBalance();
        }

        return {
            ok: true,
            value: {
                realDelta: negateMoney(amount),
                bonusDelta: ZERO_MONEY
            }
        };
    }

    if (isLessThan(wallet.bonusBalance, amount)) {
        return insufficientBonus();
    }

    return {
        ok: true,
        value: {
            realDelta: ZERO_MONEY,
            bonusDelta: negateMoney(amount)
        }
    };
}

/**
 * Credit wallet for wins, refunds, deposits, bonuses, admin credits.
 * Returns ledger deltas only.
 */
export function creditWallet(params: {
    amount: Money;
    target: "REAL" | "BONUS";
}): Result<{ realDelta: Money; bonusDelta: Money }> {
    const { amount, target } = params;

    if (isLessThan(amount, ZERO_MONEY)) {
        return invalidCreditAmount();
    }

    if (target === "REAL") {
        return {
            ok: true,
            value: {
                realDelta: amount,
                bonusDelta: ZERO_MONEY
            }
        };
    }

    return {
        ok: true,
        value: {
            realDelta: ZERO_MONEY,
            bonusDelta: amount
        }
    };
}

/* ================= ERROR HELPERS ================= */

function insufficientBalance(): Result<never> {
    return {
        ok: false,
        error: {
            code: ErrorCode.INSUFFICIENT_BALANCE,
            category: ErrorCategory.MONEY,
            messageKey: "error.wallet.insufficient_balance",
            retryable: false
        }
    };
}

function insufficientBonus(): Result<never> {
    return {
        ok: false,
        error: {
            code: ErrorCode.INSUFFICIENT_BONUS,
            category: ErrorCategory.MONEY,
            messageKey: "error.wallet.insufficient_bonus",
            retryable: false
        }
    };
}

function invalidCreditAmount(): Result<never> {
    return {
        ok: false,
        error: {
            code: ErrorCode.INVALID_INPUT,
            category: ErrorCategory.VALIDATION,
            messageKey: "error.wallet.invalid_credit_amount",
            retryable: false
        }
    };
}
