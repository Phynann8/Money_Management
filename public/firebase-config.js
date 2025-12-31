import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "***REMOVED***",
    authDomain: "money-manager-pro-4930f.firebaseapp.com",
    projectId: "money-manager-pro-4930f",
    storageBucket: "money-manager-pro-4930f.firebasestorage.app",
    messagingSenderId: "644015644624",
    appId: "1:644015644624:web:a28fbcc1d70f605021a3d5",
    measurementId: "G-9CY21SJ5S0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
window.auth = getAuth(app);
window.db = getFirestore(app);

console.log('Firebase initialized from external file');
