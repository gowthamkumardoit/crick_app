import type { Transaction } from "firebase-admin/firestore";
import { db, FieldValue } from "./admin";

export type DepositStatus = "PENDING" | "APPROVED" | "REJECTED";

export function updateDepositStats(
  tx: Transaction,
  params: {
    from?: DepositStatus;   // undefined = new request
    to: DepositStatus;
    amount?: number;        // required for APPROVED
  }
) {
  const { from, to, amount } = params;

  const ref = db.doc("config/depositStats");

  const updates: Record<string, any> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  /* ================= CREATE ================= */
  if (!from) {
    updates.total = FieldValue.increment(1);
    updates.pending = FieldValue.increment(1);
    updates.todayPending = FieldValue.increment(1);
  }

  /* ================= TRANSITION ================= */
  if (from && from !== to) {
    updates[from.toLowerCase()] = FieldValue.increment(-1);

    // today decrement
    if (from === "PENDING") {
      updates.todayPending = FieldValue.increment(-1);
    }

    updates[to.toLowerCase()] = FieldValue.increment(1);

    // today increment
    if (to === "APPROVED") {
      updates.todayApproved = FieldValue.increment(1);
    } else if (to === "REJECTED") {
      updates.todayRejected = FieldValue.increment(1);
    }
  }

  /* ================= AMOUNT AGGREGATION ================= */
  if (to === "APPROVED") {
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error(
        "updateDepositStats: approved deposits require a valid amount"
      );
    }

    updates.totalApprovedAmount = FieldValue.increment(amount);
  }

  tx.set(ref, updates, { merge: true });
}
