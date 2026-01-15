import { MarketStatus } from "../market/market-lifecycle";

export interface MarketDoc {
    marketId: string;

    /* ---------- MODE ---------- */
    mode: "POOL" | "P2P";

    /* ---------- STATUS ---------- */
    status: MarketStatus;

    /* ---------- STAKE SNAPSHOT (IMMUTABLE) ---------- */
    stakeId: string;
    stakeAmount: number;      // 👈 authoritative amount
    commissionPct: number;    // 👈 snapshot

    /* ---------- TIMESTAMPS ---------- */
    createdAt: number;
    lockedAt?: number;
    settledAt?: number;

    /* ---------- SETTLEMENT ---------- */
    settlementId?: string;
}
/* ================= BET ================= */

export interface BetDoc {
    betId: string;
    marketId: string;
    userId: string;

    /* ---------- STAKE ---------- */
    stakeAmount: number;   // must === market.stakeAmount
    bonusUsed: number;     // always explicit (0 if none)

    /* ---------- TIMESTAMP ---------- */
    createdAt: number;
}
