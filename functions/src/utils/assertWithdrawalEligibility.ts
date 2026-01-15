import { HttpsError } from "firebase-functions/v2/https";
import { db } from "../utils/admin";

export async function assertWithdrawalEligibility(userId: string) {
  // ───────── USER ─────────
  const userSnap = await db.doc(`users/${userId}`).get();

  if (!userSnap.exists) {
    throw new HttpsError("not-found", "User not found");
  }

  const user = userSnap.data();
  const verification = user?.verification;

  // ───────── BASIC VERIFICATION ─────────
  if (
    verification?.kycStatus !== "VERIFIED" ||
    verification?.mobileStatus !== "VERIFIED"
  ) {
    throw new HttpsError(
      "failed-precondition",
      "Profile verification required before withdrawal"
    );
  }

  // ───────── PAYOUT METHODS ─────────
  const [bankSnap, upiSnap] = await Promise.all([
    db
      .collection("bankAccounts")
      .where("userId", "==", userId)
      .where("isActive", "==", true)
      .limit(1)
      .get(),

    db
      .collection("upiAccounts")
      .where("userId", "==", userId)
      .where("isActive", "==", true)
      .limit(1)
      .get(),
  ]);

  // ❌ No payout method at all
  if (bankSnap.empty && upiSnap.empty) {
    throw new HttpsError(
      "failed-precondition",
      "Add a verified bank account or UPI ID to process withdrawals"
    );
  }

  // ✅ Eligible if either exists
}
