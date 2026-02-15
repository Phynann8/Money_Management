import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from "./config.js";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
window.auth = getAuth(app);
window.db = getFirestore(app);

console.log('Firebase initialized from external file');
