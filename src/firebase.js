import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCsew9Gqk3NLwGyEK2S69SHh7cP9l4o-a0",
  authDomain: "ilha-do-saber-dc098.firebaseapp.com",
  projectId: "ilha-do-saber-dc098",
  databaseURL: "https://ilha-do-saber-dc098-default-rtdb.firebaseio.com",
  storageBucket: "ilha-do-saber-dc098.firebasestorage.app",
  messagingSenderId: "811856651786",
  appId: "1:811856651786:web:c531fd998895ea8155a1f3"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);