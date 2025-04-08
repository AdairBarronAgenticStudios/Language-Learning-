import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBDWmaRVcRGl6cAbLl463Yg4valcoNcSxo",
  authDomain: "language-learning-game-faa94.firebaseapp.com",
  projectId: "language-learning-game-faa94",
  storageBucket: "language-learning-game-faa94.firebasestorage.app",
  messagingSenderId: "778889851280",
  appId: "1:778889851280:web:6f8e921c3e13aac932c315",
  measurementId: "G-937XS9J99V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
