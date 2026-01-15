import { initializeApp } from 'firebase-admin/app';

initializeApp();

/* 🔐 MOBILE FUNCTIONS */
export * from './mobile/mobile.auth';
export * from './mobile/mobile.profile';
export * from './mobile/mobile.wallet';
export * from './mobile/mobile.kyc';
export * from './mobile/mobile.getProfile';
export * from './mobile/mobile.kycRequest';