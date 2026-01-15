import { ErrorCategory, ErrorCode, Result } from "../../errors/types";

export function assertRole(
    role: string,
    allowed: string[]
): Result<void> {
    if (!allowed.includes(role)) {
        return {
            ok: false,
            error: {
                code: ErrorCode.UNAUTHORIZED,
                category: ErrorCategory.SECURITY,
                messageKey: "error.role.not_allowed",
                retryable: false
            }
        };
    }
    return { ok: true, value: undefined };
}
