import { LedgerEntry, LedgerEntryType } from "./types";
import { Result, ErrorCode, ErrorCategory } from "../errors/types";

/**
 * Ensure an action has not already been applied.
 */
export function ensureNotAlreadyApplied(params: {
    ledger: LedgerEntry[];
    referenceId: string;
    type: LedgerEntryType;
}): Result<void> {
    const { ledger, referenceId, type } = params;

    const exists = ledger.some(
        e => e.referenceId === referenceId && e.type === type
    );

    if (exists) {
        return {
            ok: false,
            error: {
                code: ErrorCode.DUPLICATE_REQUEST,
                category: ErrorCategory.SYSTEM,
                messageKey: "error.ledger.duplicate_request",
                retryable: false
            }
        };
    }

    return { ok: true, value: undefined };

}
