import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  indexedDBLocalPersistence,
  getAuth,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with indexedDB persistence for Capacitor native platforms
export const auth = (() => {
  try {
    return Capacitor.isNativePlatform()
      ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
      : getAuth(app);
  } catch {
    return getAuth(app);
  }
})();

// Initialize Cloud Firestore with offline single-tab cache, long-polling & disabled fetch streams for WKWebView
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({}),
  }),
} as any);
