import { Result, ErrorCategory, ErrorCode } from "@predict-guru/platform-core";
import { BetDoc, MarketDoc } from "../../types/market.types";

export function assertP2PParticipantCount(params: {
    market: MarketDoc;
    bets: BetDoc[];
}): Result<void> {

    if (params.market.mode !== "P2P") {
        return { ok: true, value: undefined };
    }

    if (params.bets.length !== 2) {
        return {
            ok: false,
            error: {
                code: ErrorCode.ACTION_NOT_ALLOWED,
                category: ErrorCategory.STATE,
                messageKey: "error.p2p.invalid_participant_count",
                retryable: false,
            },
        };
    }

    return { ok: true, value: undefined };
}
