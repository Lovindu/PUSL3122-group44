// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCoZE1CAKRawJWXIErpYORPq0pTd8-k5zg",
  authDomain: "furniture-app-f835d.firebaseapp.com",
  projectId: "furniture-app-f835d",
  storageBucket: "furniture-app-f835d.firebasestorage.app",
  messagingSenderId: "1053064429418",
  appId: "1:1053064429418:web:0cc9de25561b0a08316f13",
  measurementId: "G-4DKFESCZRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Checks if the current user is an admin
 * @param {string} uid - User ID to check
 * @returns {Promise<boolean>} - True if user is admin, false otherwise
 */
export const checkIfAdmin = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().isAdmin === true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export { app, db, auth, storage };