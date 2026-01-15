import { Result, ErrorCategory, ErrorCode } from "../../errors/types";
import { DepositIntent } from "./deposit.types";
import { ZERO_MONEY, isLessThan } from "../../wallet/money";
import { Money } from "../../wallet/types";

export function requestDeposit(params: {
    depositId: string;
    userId: string;
    amount: Money;
    source: "UPI" | "BANK";
    proofRef?: string;
    now: number;
}): Result<DepositIntent> {

    if (!isLessThan(ZERO_MONEY, params.amount)) {
        return {
            ok: false,
            error: {
                code: ErrorCode.INVALID_INPUT,
                category: ErrorCategory.VALIDATION,
                messageKey: "error.deposit.invalid_amount",
                retryable: false
            }
        };
    }

    const intent: DepositIntent = {
        depositId: params.depositId,
        userId: params.userId,
        amount: params.amount,
        source: params.source,
        status: "REQUESTED",
        requestedAt: params.now,
        ...(params.proofRef ? { proofRef: params.proofRef } : {})
    };

    return {
        ok: true,
        value: intent
    };
}
