// betting-engine/guards/marketOpen.guard.ts

import { ErrorCode, ErrorCategory, Result } from "@predict-guru/platform-core";

export function assertMarketOpen(params: {
    market: {
        status: "OPEN" | "LOCKED" | "SETTLED" | "CANCELLED";
        lockAt: { toMillis(): number };
    };
    now: number;
}): Result<void> {
    const { market, now } = params;

    if (market.status !== "OPEN") {
        return {
            ok: false,
            error: {
                code: ErrorCode.MARKET_LOCKED,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.market.locked",
                retryable: false,
            },
        };
    }

    if (market.lockAt.toMillis() <= now) {
        return {
            ok: false,
            error: {
                code: ErrorCode.MARKET_LOCKED,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.market.locked",
                retryable: false,
            },
        };
    }

    return { ok: true, value: undefined };
}
