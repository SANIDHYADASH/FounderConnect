import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC47Nj6dreE_EI2Mf6YpempxTkVNqe0B0Q",
  authDomain: "co-founder-connect-44be2.firebaseapp.com",
  projectId: "co-founder-connect-44be2",
  storageBucket: "co-founder-connect-44be2.firebasestorage.app",
  messagingSenderId: "665237288207",
  appId: "1:665237288207:web:ded309f03db60c52a97a7a",
  measurementId: "G-3FS6DEDBJ8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);