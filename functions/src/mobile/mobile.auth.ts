import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { MOBILE_RUNTIME } from '../config/mobileRuntime';

const db = getFirestore();

export const mobileCreateUserProfile = onCall(
  MOBILE_RUNTIME,
  async ({ auth, data }) => {
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }

    const { uid, email } = data;

    if (!uid || !email) {
      throw new HttpsError('invalid-argument', 'Missing uid/email');
    }

    const ref = db.doc(`users/${uid}`);
    const snap = await ref.get();

    // ✅ Idempotent (critical for concurrency)
    if (snap.exists) {
      return { ok: true };
    }

    await ref.set({
      uid,
      email,
      source: 'MOBILE',
      roles: ['USER'],
      wallet: { balance: 0, bonus: 0, locked: 0 },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { ok: true };
  }
);
