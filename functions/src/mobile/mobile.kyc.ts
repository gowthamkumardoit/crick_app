import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * 📱 MOBILE: Submit KYC request
 */
export const mobileSubmitKyc = onCall(
    { region: 'asia-south1' },
    async ({ auth, data }) => {
        if (!auth) {
            throw new HttpsError('unauthenticated', 'Login required');
        }

        const { documentType, documentNumber } = data;

        if (!documentType || !documentNumber) {
            throw new HttpsError('invalid-argument', 'Missing KYC data');
        }

        await db.doc(`verificationRequests/${auth.uid}`).set({
            uid: auth.uid,
            documentType,
            documentNumber,
            source: 'MOBILE',
            status: 'PENDING',
            createdAt: FieldValue.serverTimestamp(),
        });

        return { ok: true };
    }
);
