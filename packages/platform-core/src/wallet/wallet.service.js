"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWalletFromLedger = buildWalletFromLedger;
exports.debitWallet = debitWallet;
exports.creditWallet = creditWallet;
const money_1 = require("./money");
const types_1 = require("../errors/types");
/**
 * Rebuild wallet state from ledger entries.
 * SINGLE SOURCE OF TRUTH.
 */
function buildWalletFromLedger(userId, ledger) {
    let realBalance = money_1.ZERO_MONEY;
    let bonusBalance = money_1.ZERO_MONEY;
    let lockedBalance = money_1.ZERO_MONEY;
    for (const entry of ledger) {
        if (entry.userId !== userId)
            continue;
        realBalance = (0, money_1.addMoney)(realBalance, entry.realDelta);
        bonusBalance = (0, money_1.addMoney)(bonusBalance, entry.bonusDelta);
        lockedBalance = (0, money_1.addMoney)(lockedBalance, entry.lockedDelta);
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
function debitWallet(params) {
    const { wallet, amount, source } = params;
    if (source === "REAL") {
        if ((0, money_1.isLessThan)(wallet.realBalance, amount)) {
            return insufficientBalance();
        }
        return {
            ok: true,
            value: {
                realDelta: (0, money_1.negateMoney)(amount),
                bonusDelta: money_1.ZERO_MONEY
            }
        };
    }
    if ((0, money_1.isLessThan)(wallet.bonusBalance, amount)) {
        return insufficientBonus();
    }
    return {
        ok: true,
        value: {
            realDelta: money_1.ZERO_MONEY,
            bonusDelta: (0, money_1.negateMoney)(amount)
        }
    };
}
/**
 * Credit wallet for wins, refunds, deposits, bonuses, admin credits.
 * Returns ledger deltas only.
 */
function creditWallet(params) {
    const { amount, target } = params;
    if ((0, money_1.isLessThan)(amount, money_1.ZERO_MONEY)) {
        return invalidCreditAmount();
    }
    if (target === "REAL") {
        return {
            ok: true,
            value: {
                realDelta: amount,
                bonusDelta: money_1.ZERO_MONEY
            }
        };
    }
    return {
        ok: true,
        value: {
            realDelta: money_1.ZERO_MONEY,
            bonusDelta: amount
        }
    };
}
/* ================= ERROR HELPERS ================= */
function insufficientBalance() {
    return {
        ok: false,
        error: {
            code: types_1.ErrorCode.INSUFFICIENT_BALANCE,
            category: types_1.ErrorCategory.MONEY,
            messageKey: "error.wallet.insufficient_balance",
            retryable: false
        }
    };
}
function insufficientBonus() {
    return {
        ok: false,
        error: {
            code: types_1.ErrorCode.INSUFFICIENT_BONUS,
            category: types_1.ErrorCategory.MONEY,
            messageKey: "error.wallet.insufficient_bonus",
            retryable: false
        }
    };
}
function invalidCreditAmount() {
    return {
        ok: false,
        error: {
            code: types_1.ErrorCode.INVALID_INPUT,
            category: types_1.ErrorCategory.VALIDATION,
            messageKey: "error.wallet.invalid_credit_amount",
            retryable: false
        }
    };
}
