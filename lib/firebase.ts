// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZyQYf1ZSok07SDk8aPr9nc-t8P-MP_UM",
  authDomain: "gametrader-d3859.firebaseapp.com",
  projectId: "gametrader-d3859",
  storageBucket: "gametrader-d3859.firebasestorage.app",
  messagingSenderId: "78870156231",
  appId: "1:78870156231:web:f1641faf2b62f123cd3fe2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
