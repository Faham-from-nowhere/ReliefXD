import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Optional: Add back if needed

const firebaseConfig = {
  apiKey: "AIzaSyBSrx4yyV3bYAQhtB_5F6Hq8LLe579bVPI",
  authDomain: "disaster-coordination-db.firebaseapp.com",
  projectId: "disaster-coordination-db",
  storageBucket: "disaster-coordination-db.firebasestorage.app",
  messagingSenderId: "78268917453",
  appId: "1:78268917453:web:06d178ba7c9d9f42076b84",
  measurementId: "G-35DTFYWZ7L"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);