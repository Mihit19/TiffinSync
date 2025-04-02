import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDak5dGPRmWAeG60yDZ0iBcNcXr0DwcQfA",
  authDomain: "tiffinsync.firebaseapp.com",
  projectId: "tiffinsync",
  storageBucket: "tiffinsync.firebasestorage.app",
  messagingSenderId: "876721855261",
  appId: "1:876721855261:web:b2597ae2a58f5cc7415ff4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);