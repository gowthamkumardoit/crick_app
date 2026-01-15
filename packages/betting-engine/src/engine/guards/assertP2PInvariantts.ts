import { Result, ErrorCategory, ErrorCode } from "@predict-guru/platform-core";
import { MarketDoc, BetDoc } from "../../types/market.types";

export function assertP2PInvariants(params: {
    market: MarketDoc;
    bets: BetDoc[];
}): Result<void> {

    const { market, bets } = params;

    if (market.mode !== "P2P") {
        return { ok: true, value: undefined };
    }

    if (bets.length !== 2) {
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

    if (market.stakeAmount == null) {
        return {
            ok: false,
            error: {
                code: ErrorCode.ACTION_NOT_ALLOWED,
                category: ErrorCategory.STATE,
                messageKey: "error.p2p.missing_stake_snapshot",
                retryable: false,
            },
        };
    }

    for (const bet of bets) {
        if (bet.stakeAmount !== market.stakeAmount) {
            return {
                ok: false,
                error: {
                    code: ErrorCode.INVALID_INPUT,
                    category: ErrorCategory.VALIDATION,
                    messageKey: "error.p2p.invalid_stake_amount",
                    retryable: false,
                },
            };
        }
    }

    for (const bet of bets) {
        if (bet.bonusUsed > bet.stakeAmount) {
            return {
                ok: false,
                error: {
                    code: ErrorCode.BONUS_USAGE_LIMIT_EXCEEDED,
                    category: ErrorCategory.MONEY,
                    messageKey: "error.bet.bonus_exceeds_stake",
                    retryable: false,
                },
            };
        }
    }

    if (bets[0].userId === bets[1].userId) {
        return {
            ok: false,
            error: {
                code: ErrorCode.ACTION_NOT_ALLOWED,
                category: ErrorCategory.SECURITY,
                messageKey: "error.p2p.same_user_not_allowed",
                retryable: false,
            },
        };
    }

    return { ok: true, value: undefined };
}
