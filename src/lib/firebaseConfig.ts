// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlz5lXyUXpDs_HEbI0xPzJ5Ku97FXIG50",
  authDomain: "events-9c7ab.firebaseapp.com",
  projectId: "events-9c7ab",
  storageBucket: "events-9c7ab.firebasestorage.app",
  messagingSenderId: "631623106546",
  appId: "1:631623106546:web:399da02b0d7a95206f756b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore
export default db