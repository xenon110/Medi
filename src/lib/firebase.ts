
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// This is a public configuration and is safe to be exposed on the client-side.
// Security is enforced by Firebase Security Rules.
// NOTE: This is a placeholder and will not work.
// You must replace it with your own Firebase project configuration.
const firebaseConfig: FirebaseOptions = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.error("Firebase initialization error", e);
    // In a dummy setup, we don't want to throw a hard error.
    // We'll just log it and let the app continue.
  }
} else {
  app = getApp();
}

// Dummy initializations - these will not work without a valid config.
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;
const auth = app ? getAuth(app) : null;

export { app, db, storage, auth };
