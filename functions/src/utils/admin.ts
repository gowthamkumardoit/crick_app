import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

/**
 * ✅ SAFE Firebase Admin init for:
 * - Firebase Functions Gen-2
 * - Cloud Run
 * - Emulator
 * - CI
 */


if (!getApps().length) {
  initializeApp(); // 👈 NO credentials passed
}

export const db = getFirestore();
export { FieldValue, Timestamp };
