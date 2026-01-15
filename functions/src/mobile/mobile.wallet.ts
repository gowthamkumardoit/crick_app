import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * 📱 MOBILE: Fetch wallet (READ ONLY)
 */
export const mobileGetWallet = onCall(
    { region: 'asia-south1' },
    async ({ auth }) => {
        if (!auth) {
            throw new HttpsError('unauthenticated', 'Login required');
        }

        const snap = await db.doc(`users/${auth.uid}`).get();

        if (!snap.exists) {
            throw new HttpsError('not-found', 'User not found');
        }

        return snap.data()?.wallet;
    }
);
