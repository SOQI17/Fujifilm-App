import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCJu9nUzg8QGb9MGQKhhi0YMhvCr-XCPI",
  authDomain: "impresoras-orimec.firebaseapp.com",
  projectId: "impresoras-orimec",
  storageBucket: "impresoras-orimec.firebasestorage.app",
  messagingSenderId: "384143277062",
  appId: "1:384143277062:web:273993ed8820a446fc9787"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
