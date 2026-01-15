import { Money } from "../../wallet/types";

export type DepositStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED";

export interface DepositIntent {
  depositId: string;
  userId: string;
  amount: Money;
  source: "UPI" | "BANK";
  proofRef?: string;
  status: DepositStatus;
  requestedAt: number;
  decidedAt?: number;
  decidedBy?: string; // FINANCE userId
}
