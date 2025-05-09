// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "pet-adopt-ea6b8.firebaseapp.com",
  projectId: "pet-adopt-ea6b8",
  storageBucket: "pet-adopt-ea6b8.firebasestorage.app",
  messagingSenderId: "383480075084",
  appId: "1:383480075084:web:0bbc27bc1db044e84475e9",
  measurementId: "G-JT361SKFSB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app, '(default)')
//const analytics = getAnalytics(app);