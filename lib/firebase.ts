import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is complete and we're in the browser
function getFirebaseApp() {
  // Check if we're in browser and have valid config
  if (typeof window === 'undefined') {
    return null;
  }

  const hasConfig = firebaseConfig.apiKey && 
                    firebaseConfig.authDomain && 
                    firebaseConfig.projectId;

  if (!hasConfig) {
    console.warn('⚠️ Firebase not configured. Missing environment variables.');
    return null;
  }

  // Initialize Firebase (only if not already initialized)
  try {
    if (!getApps().length) {
      return initializeApp(firebaseConfig);
    } else {
      return getApps()[0];
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

// Get app instance
const app = getFirebaseApp();

// Initialize Firebase Auth (safely)
export const auth = app ? getAuth(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Auth helper functions - re-export only if available
export { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
export type { User } from 'firebase/auth';
