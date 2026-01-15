import { LedgerEntry } from "../ledger/types";
import { Money } from "./types";
import { ZERO_MONEY, addMoney, negateMoney, isLessThan } from "./money";
import { Result, ErrorCode, ErrorCategory } from "../errors/types";

/**
 * Calculate expired bonus amounts and produce ledger burn entries.
 * PURE DOMAIN LOGIC – no DB, no IO.
 */
export function calculateExpiredBonusBurns(params: {
    userId: string;
    ledger: LedgerEntry[];
    now: number;
}): Result<
    {
        amount: Money;
        referenceId: string;
        expiresAt: number;
    }[]
> {
    const { userId, ledger, now } = params;

    // Track bonus grants by reference
    const grants = new Map<
        string,
        { total: Money; used: Money; expiresAt: number }
    >();

    for (const entry of ledger) {
        if (entry.userId !== userId) continue;

        // BONUS GRANT
        if (entry.type === "BONUS_GRANTED" && entry.expiresAt && entry.referenceId) {
            grants.set(entry.referenceId, {
                total: entry.bonusDelta,
                used: ZERO_MONEY,
                expiresAt: entry.expiresAt
            });
        }

        // BONUS USED or BURNED
        if (
            (entry.type === "BONUS_USED" || entry.type === "BONUS_BURNED") &&
            entry.referenceId &&
            grants.has(entry.referenceId)
        ) {
            const grant = grants.get(entry.referenceId)!;
            grant.used = addMoney(grant.used, negateMoney(entry.bonusDelta));
        }
    }

    const burns: {
        amount: Money;
        referenceId: string;
        expiresAt: number;
    }[] = [];

    for (const [referenceId, grant] of grants) {
        if (grant.expiresAt > now) continue;

        const remaining = addMoney(grant.total, negateMoney(grant.used));

        if (isLessThan(ZERO_MONEY, remaining)) {
            burns.push({
                amount: remaining,
                referenceId,
                expiresAt: grant.expiresAt
            });
        }
    }

    return { ok: true, value: burns };
}
