"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZERO_MONEY = void 0;
exports.money = money;
exports.addMoney = addMoney;
exports.subtractMoney = subtractMoney;
exports.negateMoney = negateMoney;
exports.isLessThan = isLessThan;
/**
 * Factory to create branded Money.
 * ONLY place where number -> Money casting is allowed.
 */
function money(amount) {
    return amount;
}
/**
 * Zero money constant
 */
exports.ZERO_MONEY = money(0);
/**
 * Add two Money values safely.
 */
function addMoney(a, b) {
    return money(a + b);
}
/**
 * Subtract b from a safely.
 */
function subtractMoney(a, b) {
    return money(a - b);
}
/**
 * Negate a Money value (used for debits).
 */
function negateMoney(a) {
    return money(-a);
}
/**
 * Compare Money values safely.
 */
function isLessThan(a, b) {
    return a < b;
}
