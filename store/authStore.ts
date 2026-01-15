import { create } from 'zustand';
import { User } from 'firebase/auth';

/* ---------- TYPES ---------- */
export type BackendKycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type UserProfile = {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  // future-proof
  verification?: {
    kycStatus: BackendKycStatus;
    kycRequestId?: string;
    kycUpdatedAt?: any; // Firebase Timestamp
  };
};

/* ---------- STORE ---------- */
type AuthState = {
  user: User | null;
  profile?: UserProfile;
  isLoggedIn: boolean;

  setUser: (user: User | null) => void;
  setProfile: (profile?: UserProfile) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: undefined,
  isLoggedIn: false,

  setUser: (user) =>
    set({
      user,
      isLoggedIn: !!user,
    }),

  setProfile: (profile) =>
    set({
      profile,
    }),

  clearAuth: () =>
    set({
      user: null,
      profile: undefined,
      isLoggedIn: false,
    }),
}));
