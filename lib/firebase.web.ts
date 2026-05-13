// Firebase config cho Web (browser)
// Metro bundler tự động dùng file .web.ts thay vì .ts khi build cho web
import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDiYJ009yk0NUNU5y-ywIy0KEit9cRNk2Y",
  authDomain: "momofund-97bc5.firebaseapp.com",
  projectId: "momofund-97bc5",
  storageBucket: "momofund-97bc5.firebasestorage.app",
  messagingSenderId: "711783635774",
  appId: "1:711783635774:web:66f746206c34840b6e6a6f"
};

const app = initializeApp(firebaseConfig);

// Dùng browserLocalPersistence thay vì getReactNativePersistence (không có trên web)
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});

export const db = getFirestore(app);
