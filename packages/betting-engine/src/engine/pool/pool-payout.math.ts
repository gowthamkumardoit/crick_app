export function computePoolPayouts(params: {
    stakeByUser: Map<string, number>;
    winners: Set<string>;
    commissionRate: number;
}) {
    const { stakeByUser, winners, commissionRate } = params;

    /* ---------------- VALIDATION ---------------- */

    if (stakeByUser.size === 0) {
        throw new Error("computePoolPayouts: no stakes");
    }

    if (winners.size === 0) {
        throw new Error("computePoolPayouts: no winners");
    }

    if (commissionRate < 0 || commissionRate > 1) {
        throw new Error("computePoolPayouts: invalid commissionRate");
    }

    let totalWinnerStake = 0;
    let totalLoserStake = 0;

    for (const [u, stake] of stakeByUser) {
        if (winners.has(u)) totalWinnerStake += stake;
        else totalLoserStake += stake;
    }

    if (totalWinnerStake <= 0) {
        throw new Error("computePoolPayouts: winner has no stake");
    }

    /* ---------------- PAYOUT MATH ---------------- */

    const distributable = Math.floor(
        totalLoserStake * (1 - commissionRate)
    );

    const commission = totalLoserStake - distributable;

    const payouts: Record<string, number> = {};
    let totalPaid = 0;

    for (const [u, stake] of stakeByUser) {
        if (!winners.has(u)) continue;

        const payout = Math.floor(
            (stake / totalWinnerStake) * distributable
        );

        payouts[u] = payout;
        totalPaid += payout;
    }

    const leftover = distributable - totalPaid;

    return {
        totalLoserStake,
        totalWinnerStake,
        distributable,
        commission,
        payouts,
        leftover,
    };
}
