import type { Transaction } from "firebase-admin/firestore";
import { db, FieldValue } from "./admin";

export type MatchStatus =
  | "UPCOMING"
  | "LIVE"
  | "LOCKED"
  | "SETTLED"
  | "DISABLED";

export function updateMatchStats(
  tx: Transaction,
  params: {
    from?: MatchStatus; // undefined = newly created match
    to: MatchStatus;
  }
) {
  const { from, to } = params;

  const ref = db.doc("config/matchStats");

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  /* ================= CREATE ================= */
  if (!from) {
    updates.total = FieldValue.increment(1);
    updates[to.toLowerCase()] = FieldValue.increment(1);
  }

  /* ================= TRANSITION ================= */
  if (from && from !== to) {
    updates[from.toLowerCase()] = FieldValue.increment(-1);
    updates[to.toLowerCase()] = FieldValue.increment(1);
  }

  tx.set(ref, updates, { merge: true });
}
