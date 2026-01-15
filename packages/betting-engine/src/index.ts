// ===== BET PLACEMENT =====
export { placeBetEngine } from "./engine/place-bet-engine";

// ===== SETTLEMENT =====
export { settleMarketEngine, HOUSE_USER_ID } from "./engine/settle-market.engine";
export { settleP2PEngine } from "./engine/settle-p2p.engine";

// ===== PREVIEWS =====
export { previewPoolSettlement } from "./engine/preview/preview-pool.engine";
export { previewP2PSettlement } from "./engine/preview/preview-p2p.engine";
export { previewJackpotPayout } from "./engine/preview/preview-jackpot.engine";

// ===== MARKET LIFECYCLE =====
export type { MarketStatus } from "./market/market-lifecycle";
export {
    transitionMarketStatus,
    canPlaceBet,
    canSettleMarket,
} from "./market/market-lifecycle";

// ===== LEDGER ADAPTER =====
export { adaptLockIntentToLedger } from "./engine/core-adapter.engine";

// ===== WALLET =====
export { requestWithdrawalEngine } from "./engine/withdrawal/request-withdrawal.engine";
export { resolveWithdrawalEngine } from "./engine/withdrawal/resolve-withdrawal.engine";

export { joinP2PEngine } from "./engine/joinP2PEngine";

export { settleBetAdapter } from "./engine/settle-bet.engine";
