import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCdJvy18zCXazX_wja3cR5P41HqLrRZSBI",
    authDomain: "headstarter-pantry-track-2a4c1.firebaseapp.com",
    projectId: "headstarter-pantry-track-2a4c1",
    storageBucket: "headstarter-pantry-track-2a4c1.appspot.com",
    messagingSenderId: "305735773592",
    appId: "1:305735773592:web:b71c1e1b11cb67e1dacfed"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };