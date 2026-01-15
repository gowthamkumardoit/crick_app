export function previewP2PSettlement(params) {
    const { ledger, matchId, winners, commissionRate } = params;
    const winnerSet = new Set(winners);
    const stakeByUser = new Map();
    for (const e of ledger) {
        if (e.type === "LOCK" && e.referenceId === matchId) {
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
        const payout = Math.floor((stake / totalWinnerStake) * distributable);
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
