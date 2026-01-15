import { Money } from "../wallet/types";

export type WithdrawalStatus =
    | "REQUESTED"
    | "APPROVED"
    | "REJECTED";

export interface WithdrawalRequest {
    userId: string;
    amount: Money;
    referenceId: string; // withdrawalId
    requestedAt: number;
}
