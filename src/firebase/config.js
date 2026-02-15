import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_3ITEZfHE0oXyiCVfyRP0OxzbxwWdWbg",
    authDomain: "osama-essam-cyper.firebaseapp.com",
    projectId: "osama-essam-cyper",
    storageBucket: "osama-essam-cyper.firebasestorage.app",
    messagingSenderId: "553995758980",
    appId: "1:553995758980:web:bd887a0c58761b2e7801d1",
    measurementId: "G-NFX19L33SJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };
export default app;
