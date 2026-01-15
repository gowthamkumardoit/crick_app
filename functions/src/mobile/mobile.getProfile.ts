import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { MOBILE_RUNTIME } from '../config/mobileRuntime';

const db = getFirestore();

/**
 * 📱 MOBILE: Get logged-in user's profile
 * READ ONLY
 */
export const mobileGetProfile = onCall(
  MOBILE_RUNTIME,
  async ({ auth }) => {
    // 🔐 Auth guard
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User not logged in');
    }

    const uid = auth.uid;

    // 🔎 Fetch user document
    const userRef = db.doc(`users/${uid}`);
    const snap = await userRef.get();

    // ❌ User profile not created yet
    if (!snap.exists) {
      console.log('❌ USER DOC NOT FOUND:', uid);
      return null;
    }

    const data = snap.data();

    console.log('✅ USER DOC FOUND:', data);

    // ✅ ALWAYS RETURN AN OBJECT
    return {
      uid,
      name: data?.name ?? '',
      username: data?.username ?? '',
      email: data?.email ?? '',
      phone: data?.phone ?? '',
      photoURL: data?.photoURL ?? '',
      kycStatus: data?.verification?.kycStatus ?? 'PENDING',
    };
  }
);
