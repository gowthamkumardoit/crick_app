import { Money, Result } from "@predict-guru/platform-core";
import { adaptLockIntentToLedger } from "./core-adapter.engine";
import { assertMarketOpen } from "./guards/marketOpen.guard";
import { placeBetEngine } from "./place-bet-engine";
import { createLockIntent } from "./lock-intent.engine";

export function adaptPlaceBetFlow(params: {
    betId: string;
    userId: string;

    market: {
        id: string;
        status: "OPEN" | "LOCKED" | "SETTLED" | "CANCELLED";
        lockAt: { toMillis(): number };
        mode: "POOL" | "P2P";
        stakeAmount?: Money;
    };

    stake: Money;
    maxBonusUsage: Money;
    now: number;
}): Result<ReturnType<typeof adaptLockIntentToLedger>> {

    /* ---------------- MARKET GUARD ---------------- */

    const guard = assertMarketOpen({
        market: params.market,
        now: params.now,
    });

    if (!guard.ok) return guard;

    /* ---------------- ENGINE ---------------- */

    const betIntent = placeBetEngine({
        betId: params.betId,
        userId: params.userId,
        market: {
            mode: params.market.mode,
            ...(params.market.stakeAmount !== undefined
                ? { stakeAmount: params.market.stakeAmount }
                : {}),
        },
        stake: params.stake,
        maxBonusUsage: params.maxBonusUsage,
        now: params.now,
    });

    if (!betIntent.ok) return betIntent;

    /* ---------------- LOCK INTENT ---------------- */

    const lockIntent = createLockIntent({
        userId: params.userId,
        betId: params.betId,
        stake: params.stake,
        maxBonusUsage: params.maxBonusUsage,
        now: params.now,
    });

    /* ---------------- LEDGER ---------------- */

    return {
        ok: true,
        value: adaptLockIntentToLedger({
            userId: lockIntent.userId,
            referenceId: lockIntent.referenceId,
            realAmount: lockIntent.realAmount,
            bonusAmount: lockIntent.bonusAmount,
            marketId: params.market.id,
            now: params.now, // ✅ THIS is what ledger adapter wants
        }),
    };
}
