import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBo0V4woZ1MTfjkvG_3Qye45eS8_enWtxs",
  authDomain: "ortho-7cb02.firebaseapp.com",
  projectId: "ortho-7cb02",
  // storageBucket: "ortho-7cb02.firebasestorage.app",
  // messagingSenderId: "140028144454",
  appId: "1:140028144454:web:19b5258fb14d8ad21fd347",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
