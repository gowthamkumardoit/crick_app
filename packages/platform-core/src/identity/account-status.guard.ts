import { Result, ErrorCategory, ErrorCode } from "../errors/types";
import { AccountStatus } from "./types"; // wherever this file lives

export function ensureAccountActive(params: {
    userId: string;
    status: AccountStatus;
}): Result<void> {

    if (params.status !== "ACTIVE") {
        return {
            ok: false,
            error: {
                code: ErrorCode.ACCOUNT_FROZEN,
                category: ErrorCategory.SECURITY,
                messageKey: "error.account.not_active",
                retryable: false
            }
        };
    }

    return { ok: true, value: undefined };
}
