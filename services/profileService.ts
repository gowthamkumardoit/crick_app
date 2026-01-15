import { httpsCallable } from 'firebase/functions';
import { functions } from 'lib/firebase';

/* ---------- TYPES ---------- */

export type UserProfile = {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  kycStatus?: string;
};

/* ---------- GET USER PROFILE ---------- */
/**
 * Used after login / app start
 * Reads profile via Cloud Function
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const getProfile = httpsCallable(functions, 'mobileGetProfile');
  const res = await getProfile();

  console.log('res.data', res.data);
  return res.data as UserProfile;
}

/* ---------- UPDATE PROFILE ---------- */
/**
 * Updates SAFE profile fields only
 */
export async function updateUserProfile(data: {
  name?: string;
  username?: string;
  photoURL?: string;
}) {
  const updateProfile = httpsCallable(functions, 'mobileUpdateProfile');
  await updateProfile(data);
}
