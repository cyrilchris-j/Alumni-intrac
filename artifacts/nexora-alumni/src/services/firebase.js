import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApRCvGAjcag6CawlAY3XbgJQ4a4PpqzHk",
  authDomain: "onestopalumni.firebaseapp.com",
  projectId: "onestopalumni",
  storageBucket: "onestopalumni.appspot.com",
  messagingSenderId: "92643314841",
  appId: "1:92643314841:web:3b79864ee5ce2cddd4bc08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
