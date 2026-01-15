import { LedgerEntry, buildWalletFromLedger } from "@predict-guru/platform-core";

/**
 * Sums real balances for a set of users.
 * Used ONLY for invariants testing.
 */
export function sumRealBalances(
    userIds: string[],
    ledger: LedgerEntry[]
): number {
    return userIds.reduce(
        (sum, userId) =>
            sum + buildWalletFromLedger(userId, ledger).realBalance,
        0
    );
}
