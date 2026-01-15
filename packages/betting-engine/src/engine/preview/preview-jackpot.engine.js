import { JACKPOT_USER_ID } from "../jackpot.engine";
export function previewJackpotPayout(params) {
    const jackpotBalance = params.ledger
        .filter(e => e.userId === JACKPOT_USER_ID)
        .reduce((s, e) => s + e.realDelta, 0);
    const perUser = Math.floor(jackpotBalance / params.winners.length);
    const payouts = {};
    for (const u of params.winners) {
        payouts[u] = perUser;
    }
    return {
        jackpotBalance,
        payouts,
        totalPaid: perUser * params.winners.length,
    };
}
