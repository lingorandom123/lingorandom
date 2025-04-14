import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";  // Import Firestore
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyD4utCj8UZlGyRcxLKAKHrV5FVHWxG3gwQ",
authDomain: "lingorandom.firebaseapp.com",
projectId: "lingorandom",
storageBucket: "lingorandom.firebasestorage.app",
messagingSenderId: "668279805831",
appId: "1:668279805831:web:5aaa5a88aad5e8362c6522",
measurementId: "G-5CVH1GDLLL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);  // Optional for analytics
const auth = getAuth(app);  // Firebase Authentication
const storage = getStorage(app);  // Firebase Storage
const db = getFirestore(app);  // Initialize Firestore

// Export auth, storage, and db (Firestore)
export { auth, storage, db };