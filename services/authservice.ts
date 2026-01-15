import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export async function registerUser(email: string, password: string) {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, 'users', res.user.uid), {
    uid: res.user.uid,
    email,
    createdAt: serverTimestamp(),
    wallet: 0,
    bonus: 0,
  });

  return res.user;
}

export async function loginUser(email: string, password: string) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
}

export async function logoutUser() {
  await signOut(auth);
}
