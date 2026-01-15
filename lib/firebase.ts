import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAPP6TPPHhPhAGWJhA8VhTahPvSGDvpT44',
  authDomain: 'core-engine-11e64.firebaseapp.com',
  projectId: 'core-engine-11e64',
  storageBucket: 'core-engine-11e64.appspot.com',
  messagingSenderId: '270145931746',
  appId: '1:270145931746:web:221eedf8e1934a12c411bb',
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

/* ✅ THIS IS CORRECT FOR EXPO */
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'asia-south1');

export default app;
