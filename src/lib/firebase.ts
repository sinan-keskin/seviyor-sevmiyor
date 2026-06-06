import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDulhQlzq-0wzqEjSDdveO2Cxwe07klkTk",
  authDomain: "seviyor-sevmiyor.firebaseapp.com",
  projectId: "seviyor-sevmiyor",
  storageBucket: "seviyor-sevmiyor.firebasestorage.app",
  messagingSenderId: "152898707524",
  appId: "1:152898707524:web:931b8ea85f787451e61c11",
  databaseURL: "https://seviyor-sevmiyor-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);
