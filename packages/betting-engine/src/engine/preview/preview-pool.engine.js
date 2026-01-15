export function previewPoolSettlement(params) {
    const { ledger, marketId, winners, commissionRate, maxMultiplier } = params;
    const winnerSet = new Set(winners);
    const stakeByUser = new Map();
    for (const e of ledger) {
        if (e.type === "LOCK" && e.marketId === marketId) {
            stakeByUser.set(e.userId, (stakeByUser.get(e.userId) ?? 0) + e.lockedDelta);
        }
    }
    let totalWinnerStake = 0;
    let totalLoserStake = 0;
    for (const [u, stake] of stakeByUser) {
        if (winnerSet.has(u))
            totalWinnerStake += stake;
        else
            totalLoserStake += stake;
    }
    const commission = Math.floor(totalLoserStake * (commissionRate ?? 0));
    const distributable = totalLoserStake - commission;
    const payouts = {};
    let paid = 0;
    for (const [u, stake] of stakeByUser) {
        if (!winnerSet.has(u))
            continue;
        let payout = Math.floor((stake / totalWinnerStake) * distributable);
        if (maxMultiplier != null) {
            payout = Math.min(payout, stake * maxMultiplier);
        }
        payouts[u] = payout;
        paid += payout;
    }
    return {
        totalPool: totalLoserStake,
        commission,
        distributable,
        payouts,
        leftover: distributable - paid,
    };
}
