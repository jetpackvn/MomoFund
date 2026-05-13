// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiYJ009yk0NUNU5y-ywIy0KEit9cRNk2Y",
  authDomain: "momofund-97bc5.firebaseapp.com",
  projectId: "momofund-97bc5",
  storageBucket: "momofund-97bc5.firebasestorage.app",
  messagingSenderId: "711783635774",
  appId: "1:711783635774:web:66f746206c34840b6e6a6f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);