import {
    Result,
    ErrorCategory,
    ErrorCode,
} from "@predict-guru/platform-core";

export type MatchStatus =
    | "UPCOMING"
    | "LIVE"
    | "LOCKED"
    | "COMPLETED"
    | "CANCELLED";

/**
 * Allowed match lifecycle transitions.
 * This is the single source of truth.
 */
const ALLOWED_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
    UPCOMING: ["LIVE", "CANCELLED"],
    LIVE: ["LOCKED", "CANCELLED"],
    LOCKED: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
};

/**
 * Ensures match status transitions are valid.
 */
export function assertValidMatchTransition(params: {
    from: MatchStatus;
    to: MatchStatus;
}): Result<void> {

    const { from, to } = params;

    // No-op transitions are invalid (prevents silent writes)
    if (from === to) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_STATE_TRANSITION,
                category: ErrorCategory.STATE,
                messageKey: "error.match.same_state_transition",
                retryable: false,
            },
        };
    }

    const allowed = ALLOWED_TRANSITIONS[from] ?? [];

    if (!allowed.includes(to)) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_STATE_TRANSITION,
                category: ErrorCategory.STATE,
                messageKey: "error.match.invalid_transition",
                retryable: false,
            },
        };
    }

    return { ok: true, value: undefined };
}
