import type { Transaction } from "firebase-admin/firestore";
import { db, FieldValue } from "../utils/admin";

export type BankVerificationStatus =
    | "PENDING"
    | "VERIFIED"
    | "REJECTED";

export function updateBankVerificationStats(
    tx: Transaction,
    params: {
        from?: BankVerificationStatus;
        to: BankVerificationStatus;
    }
) {
    const { from, to } = params;

    const ref = db.doc("bankVerificationStats/global");

    const updates: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
    };

    // If this is a newly created request
    if (!from) {
        updates.total = FieldValue.increment(1);
        updates.pending = FieldValue.increment(1);
    }

    // Transition handling
    if (from && from !== to) {
        updates[from.toLowerCase()] = FieldValue.increment(-1);
        updates[to.toLowerCase()] = FieldValue.increment(1);
    }

    tx.set(ref, updates, { merge: true });
}
