// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "studio-6167596920-dbcef",
  appId: "1:1041595331915:web:58281b2d730cd78670a4ce",
  storageBucket: "studio-6167596920-dbcef.firebasestorage.app",
  apiKey: "AIzaSyAGbbOra2xq5gofQglFln0AWKzYZLJSHNk",
  authDomain: "studio-6167596920-dbcef.firebaseapp.com",
  messagingSenderId: "1041595331915",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
