import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{2,14}$/;

export const mobileUpdateProfile = onCall(
    { region: 'asia-south1' },
    async ({ auth, data }) => {
        if (!auth) {
            throw new HttpsError('unauthenticated', 'Login required');
        }

        const { name, username, photoURL } = data;
        const uid = auth.uid;

        const userRef = db.doc(`users/${uid}`);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            throw new HttpsError('not-found', 'User profile not found');
        }

        const userData = userSnap.data()!;
        const updates: Record<string, any> = {
            updatedAt: FieldValue.serverTimestamp(),
        };

        /* ---------------- NAME ---------------- */
        if (name) {
            updates.name = name;
        }

        /* ---------------- USERNAME RULES ---------------- */
        if (username && username !== userData.username) {
            // ⏳ once per 30 days
            const lastChange = userData.usernameUpdatedAt?.toDate?.();
            if (lastChange) {
                const diffDays =
                    (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
                if (diffDays < 30) {
                    throw new HttpsError(
                        'failed-precondition',
                        'Username can be changed only once every 30 days'
                    );
                }
            }

            // ❌ only numbers
            if (/^\d+$/.test(username)) {
                throw new HttpsError(
                    'invalid-argument',
                    'Username cannot contain only numbers'
                );
            }

            // ❌ invalid format / too long
            if (!USERNAME_REGEX.test(username)) {
                throw new HttpsError(
                    'invalid-argument',
                    'Username must be 3–15 characters, start with a letter, and contain only letters, numbers, or _'
                );
            }

            const usernameRef = db.doc(`usernames/${username.toLowerCase()}`);
            const usernameSnap = await usernameRef.get();

            if (usernameSnap.exists) {
                throw new HttpsError(
                    'already-exists',
                    'Username already taken'
                );
            }

            // ✅ reserve username
            await db.runTransaction(async (tx) => {
                tx.set(usernameRef, { uid });
                if (userData.username) {
                    tx.delete(db.doc(`usernames/${userData.username}`));
                }
                tx.update(userRef, {
                    username,
                    usernameUpdatedAt: FieldValue.serverTimestamp(),
                });
            });

            updates.username = username;
        }

        /* ---------------- PHOTO ---------------- */
        if (photoURL) {
            updates.photoURL = photoURL;
        }

        await userRef.update(updates);

        return {
            name: updates.name ?? userData.name,
            username: updates.username ?? userData.username,
            photoURL: updates.photoURL ?? userData.photoURL,
            email: userData.email,
            phone: userData.phone,
        };
    }
);
