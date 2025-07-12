// firebase/Config.tsx
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBOGPiH7gS1H5clL2kfDTwfCxT9OYmwtuc",
  authDomain: "actividadautonomaejercicio1.firebaseapp.com",
  databaseURL: "https://actividadautonomaejercicio1-default-rtdb.firebaseio.com",
  projectId: "actividadautonomaejercicio1",
  storageBucket: "actividadautonomaejercicio1.firebasestorage.app",
  messagingSenderId: "768278468495",
  appId: "1:768278468495:web:ee37922f302e87a9f51dfa"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export const auth = getAuth(app);
