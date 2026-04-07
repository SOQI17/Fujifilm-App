import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCJu9nUzg8QGb9MGQKhhi0YMhvCr-XCPI",
  authDomain: "impresoras-orimec.firebaseapp.com",
  projectId: "impresoras-orimec",
  storageBucket: "impresoras-orimec.firebasestorage.app",
  messagingSenderId: "384143277062",
  appId: "1:384143277062:web:273993ed8820a446fc9787"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Anonymous Auth Function
export const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("Logged in as:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Anonymous login failed:", error);
    throw error;
  }
};

export { auth, db };
