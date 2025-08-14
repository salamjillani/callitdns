// client/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// Configure auth to force token refresh more frequently
auth.settings = {
  appVerificationDisabledForTesting: false
};

// Set custom token refresh interval (5 minutes instead of default 1 hour)
auth.onAuthStateChanged((user) => {
  if (user) {
    // Force token refresh every 5 minutes to prevent expiration issues
    const refreshInterval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed automatically');
        } else {
          clearInterval(refreshInterval);
        }
      } catch (error) {
        console.error('Auto token refresh failed:', error);
        clearInterval(refreshInterval);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    // Clear interval when user signs out
    const unsubscribe = auth.onAuthStateChanged((newUser) => {
      if (!newUser) {
        clearInterval(refreshInterval);
        unsubscribe();
      }
    });
  }
});

// Only connect to emulators in development
if (import.meta.env.DEV) {
  // Uncomment these lines if you want to use Firebase emulators in development
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;