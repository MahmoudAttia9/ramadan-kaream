// ═══════════════════════════════════════
//  firebase.js — إعداد Firebase
// ═══════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBtHvklnxlP7ZgTvwJrpgMz4cbWiuhq9TM",
    authDomain: "create-project-36d4c.firebaseapp.com",
    projectId: "create-project-36d4c",
    storageBucket: "create-project-36d4c.firebasestorage.app",
    messagingSenderId: "384696044918",
    appId: "1:384696044918:web:f78daf55009be623b1fe57",
    measurementId: "G-PQPQGTP0HB"
};

const fbApp = initializeApp(firebaseConfig);
const db    = getFirestore(fbApp);

export { db, doc, getDoc, setDoc, updateDoc };
