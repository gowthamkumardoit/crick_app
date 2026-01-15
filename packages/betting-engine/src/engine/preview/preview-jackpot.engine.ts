import { LedgerEntry } from "@predict-guru/platform-core";
import { JackpotPreview } from "./preview.types";
import { JACKPOT_USER_ID } from "../jackpot.engine";

export function previewJackpotPayout(params: {
    ledger: LedgerEntry[];
    winners: string[];
}): JackpotPreview {

    const jackpotBalance = params.ledger
        .filter(e => e.userId === JACKPOT_USER_ID)
        .reduce((s, e) => s + e.realDelta, 0);

    const perUser = Math.floor(
        jackpotBalance / params.winners.length
    );

    const payouts: Record<string, number> = {};
    for (const u of params.winners) {
        payouts[u] = perUser;
    }

    return {
        jackpotBalance,
        payouts,
        totalPaid: perUser * params.winners.length,
    };
}
