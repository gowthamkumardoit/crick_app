import { Money } from "./types";

/**
 * Factory to create branded Money.
 * ONLY place where number -> Money casting is allowed.
 */
export function money(amount: number): Money {
    return amount as Money;
}

/**
 * Zero money constant
 */
export const ZERO_MONEY: Money = money(0);

/**
 * Add two Money values safely.
 */
export function addMoney(a: Money, b: Money): Money {
    return money(a + b);
}

/**
 * Subtract b from a safely.
 */
export function subtractMoney(a: Money, b: Money): Money {
    return money(a - b);
}

/**
 * Negate a Money value (used for debits).
 */
export function negateMoney(a: Money): Money {
    return money(-a);
}

/**
 * Compare Money values safely.
 */
export function isLessThan(a: Money, b: Money): boolean {
    return a < b;
}
