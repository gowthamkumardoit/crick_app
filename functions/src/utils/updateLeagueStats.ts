import type { Transaction } from "firebase-admin/firestore";
import { db, FieldValue } from "./admin";

export function updateLeagueStats(
    tx: Transaction,
    params: {
        from: "ENABLED" | "DISABLED";
        to: "ENABLED" | "DISABLED";
    }
) {
    const { from, to } = params;

    if (from === to) return;

    const ref = db.doc("config/leagueStats");

    tx.set(
        ref,
        {
            [from.toLowerCase()]: FieldValue.increment(-1),
            [to.toLowerCase()]: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
    );
}
