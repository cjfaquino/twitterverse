// Import the functions you need from the SDKs you need

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_AUTH_PROJECT_ID,
  storageBucket: import.meta.env.VITE_AUTH_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_AUTH_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_AUTH_APP_ID,
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const db = getFirestore();