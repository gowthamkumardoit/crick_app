import { LedgerEntry } from "@predict-guru/platform-core";
import { SettlementPreview } from "./preview.types";
import { computePoolPayouts } from "../pool/pool-payout.math";

export function previewPoolSettlement(params: {
    ledger: LedgerEntry[];
    marketId: string;
    winners: string[];
    commissionRate?: number;
    maxMultiplier?: number;
}): SettlementPreview {

    const {
        ledger,
        marketId,
        winners,
        commissionRate = 0,
        maxMultiplier,
    } = params;

    /* ---------------- COLLECT STAKES ---------------- */

    const stakeByUser = new Map<string, number>();

    for (const e of ledger) {
        if (e.type === "LOCK" && e.marketId === marketId) {
            stakeByUser.set(
                e.userId,
                (stakeByUser.get(e.userId) ?? 0) + e.lockedDelta
            );
        }
    }

    const winnerSet = new Set(winners);

    /* ---------------- RAW MATH ---------------- */

    const {
        payouts: rawPayouts,
        commission,
        distributable,
        leftover: rawLeftover,
    } = computePoolPayouts({
        stakeByUser,
        winners: winnerSet,
        commissionRate,
    });

    /* ---------------- APPLY SAME FINALIZATION AS SETTLEMENT ---------------- */

    const finalPayouts: Record<string, number> = {};
    let totalPaid = 0;

    for (const [userId, stake] of stakeByUser) {
        const raw = rawPayouts[userId] ?? 0;

        const cap =
            maxMultiplier != null
                ? Math.floor(stake * maxMultiplier)
                : raw;

        const payout = Math.min(raw, cap);

        finalPayouts[userId] = payout;
        totalPaid += payout;
    }

    // preserve rounding remainder
    let finalLeftover = rawLeftover;

    // add multiplier-cap residue (same as settlement)
    if (maxMultiplier != null) {
        const rawTotalPaid = Object.values(rawPayouts).reduce(
            (s, v) => s + v,
            0
        );

        if (totalPaid < rawTotalPaid) {
            finalLeftover += rawTotalPaid - totalPaid;
        }
    }

    return {
        totalPool: distributable + commission + finalLeftover,
        commission,
        distributable,
        payouts: finalPayouts,
        leftover: finalLeftover,
    };
}
