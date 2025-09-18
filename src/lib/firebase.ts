
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// This is a public configuration and is safe to be exposed on the client-side.
// Security is enforced by Firebase Security Rules.
const firebaseConfig = {
  projectId: "studio-6167596920-dbcef",
  appId: "1:1041595331915:web:58281b2d730cd78670a4ce",
  storageBucket: "studio-6167596920-dbcef.firebasestorage.app",
  apiKey: "AIzaSyAGbbOra2xq5gofQglFln0AWKzYZLJSHNk",
  authDomain: "studio-6167596920-dbcef.firebaseapp.com",
  messagingSenderId: "1041595331915"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.error("Firebase initialization error", e);
    throw new Error("Could not initialize Firebase. Please check your configuration.");
  }
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
