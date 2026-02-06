import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDvIpEnPOxvapXsVwYQEKOcObSHajtoJ3A",
    authDomain: "studio-8473130320-209d7.firebaseapp.com",
    projectId: "studio-8473130320-209d7",
    storageBucket: "studio-8473130320-209d7.firebasestorage.app",
    messagingSenderId: "35590121523",
    appId: "1:35590121523:web:daa8715c602d6aff46db46"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
