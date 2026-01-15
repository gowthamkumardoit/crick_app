import { LedgerEntry } from "@predict-guru/platform-core";
import { SettlementPreview } from "./preview.types";

export function previewP2PSettlement(params: {
    ledger: LedgerEntry[];
    matchId: string;
    winners: string[];
    commissionRate?: number;
}): SettlementPreview {

    const { ledger, matchId, winners, commissionRate = 0 } = params;

    /* -------------------------------------------------
       STEP 1: COLLECT STAKES (SOURCE OF TRUTH = LEDGER)
    -------------------------------------------------- */

    const stakeByUser = new Map<string, number>();

    for (const e of ledger) {
        if (e.type === "LOCK" && e.referenceId === matchId) {
            stakeByUser.set(
                e.userId,
                (stakeByUser.get(e.userId) ?? 0) + e.lockedDelta
            );
        }
    }

    /* -------------------------------------------------
       STEP 2: P2P INVARIANTS (MUST MATCH SETTLEMENT)
    -------------------------------------------------- */

    // exactly 2 participants
    if (stakeByUser.size !== 2) {
        throw new Error("Invalid P2P preview: participant count");
    }

    // exactly 1 winner
    if (!winners || winners.length !== 1) {
        throw new Error("Invalid P2P preview: winner count");
    }

    const winnerId = winners[0];

    if (!stakeByUser.has(winnerId)) {
        throw new Error("Invalid P2P preview: winner not a participant");
    }

    /* -------------------------------------------------
       STEP 3: COMPUTE HEAD-TO-HEAD PAYOUT
    -------------------------------------------------- */

    let loserStake = 0;

    for (const [userId, stake] of stakeByUser) {
        if (userId !== winnerId) {
            loserStake += stake;
        }
    }

    const commission = Math.floor(loserStake * commissionRate);
    const distributable = loserStake - commission;

    const payouts: Record<string, number> = {
        [winnerId]: distributable,
    };

    return {
        totalPool: loserStake,
        commission,
        distributable,
        payouts,
        leftover: 0, // 🔒 always zero in P2P
    };
}
