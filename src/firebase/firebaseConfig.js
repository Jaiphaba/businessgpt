import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDV1inctqKPIDf112s09NqamYvo4DK9SZQ",
  authDomain: "businessgpt-c259e.firebaseapp.com",
  projectId: "businessgpt-c259e",
  storageBucket: "businessgpt-c259e.firebasestorage.app",
  messagingSenderId: "830153812885",
  appId: "1:830153812885:web:d2014d26ed94664b7d649c",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

// Export all three
export { app, db, auth };