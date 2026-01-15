import type { Transaction } from "firebase-admin/firestore";
import { db, FieldValue } from "../utils/admin";

/* ======================================================
   USER ACTIVITY LOGGER
   ------------------------------------------------------
   - Global collection
   - Append-only
   - Transaction-safe OR fire-and-forget
====================================================== */

export type UserAction =
  | "BET_PLACED"
  | "BET_LOCKED"
  | "BET_SETTLED"
  | "WIN_CREDITED"
  | "LOSS_RECORDED"
  | "REFUND_ISSUED"
  | "WITHDRAWAL_REQUESTED"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_REJECTED"
  | "KYC_SUBMITTED"
  | "KYC_APPROVED"
  | "KYC_REJECTED"
  | "DEPOSIT_REQUESTED"
  | "DEPOSIT_APPROVED"
  | "DEPOSIT_REJECTED"
  | "PHONE_VERIFIED"
  | "BANK_ACCOUNT_DELETED"
  | "BANK_VERIFICATION_SUBMITTED"
  | "UPI_VERIFICATION_SUBMITTED"
  | "UPI_VERIFICATION_APPROVED"
  | "UPI_VERIFICATION_REJECTED";

export interface UserActivityParams {
  userId: string;
  action: UserAction;

  /** Structured refId: ENTITY:ID (eg: DEPOSIT:abc123) */
  referenceId?: string;

  /** Optional helpers for filtering (derived from referenceId) */
  referenceType?: string;        // eg: "DEPOSIT"
  referenceEntityId?: string;    // eg: "abc123"

  marketId?: string;
  amount?: number;
  meta?: Record<string, unknown>;
}

/* ---------------- OVERLOADS ---------------- */

// fire-and-forget
export function logUserActivity(
  params: UserActivityParams
): Promise<void>;

// transactional
export function logUserActivity(
  tx: Transaction,
  params: UserActivityParams
): void;

/* ---------------- IMPLEMENTATION ---------------- */

export function logUserActivity(
  txOrParams: Transaction | UserActivityParams,
  maybeParams?: UserActivityParams
): Promise<void> | void {
  const isTx =
    typeof (txOrParams as Transaction).set === "function";

  const params = isTx
    ? maybeParams!
    : (txOrParams as UserActivityParams);

  const ref = db.collection("userActivityLogs").doc();

  // 🔒 derive structured fields safely
  const [refType, refEntityId] =
    params.referenceId?.split(":") ?? [];

  const payload = {
    userId: params.userId,
    action: params.action,

    referenceId: params.referenceId ?? null,
    referenceType: params.referenceType ?? refType ?? null,
    referenceEntityId:
      params.referenceEntityId ?? refEntityId ?? null,

    marketId: params.marketId ?? null,
    amount: params.amount ?? null,
    meta: params.meta ?? null,

    createdAt: FieldValue.serverTimestamp(), // ✅ authoritative
  };

  if (isTx) {
    (txOrParams as Transaction).set(ref, payload);
    return;
  }

  return ref.set(payload).then(() => {});
}
