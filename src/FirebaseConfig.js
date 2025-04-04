import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyJbjrOP_1lfWWNEk6K7W9Iob0wxqgl0w",
  authDomain: "billingwarnet-24b8f.firebaseapp.com",
  projectId: "billingwarnet-24b8f",
  storageBucket: "billingwarnet-24b8f.firebasestorage.app",
  messagingSenderId: "613301377086",
  appId: "1:613301377086:web:a42f79d07a5dced079196f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
