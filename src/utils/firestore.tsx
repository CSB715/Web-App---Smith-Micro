// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { get } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc, getDocs, collection, setDoc } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAI737PvEjkSRu0S267zANxBrqMErNLEvU",
  authDomain: "browser-insights-d704b.firebaseapp.com",
  databaseURL: "https://browser-insights-d704b-default-rtdb.firebaseio.com",
  projectId: "browser-insights-d704b",
  storageBucket: "browser-insights-d704b.firebasestorage.app",
  messagingSenderId: "1061503587334",
  appId: "1:1061503587334:web:74b603a406e35964cd1f87",
  measurementId: "G-5RJHEYZFTQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

async function GetDoc(path: string) {
  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
}

async function GetDocs(path: string) {
  const colRef = collection(db, path);
  const colSnap = await getDocs(colRef);
  if (!colSnap.empty) {
    const docsData = colSnap.docs.map((doc) => doc.data());
    return docsData;
  } else {
    console.log("No documents found!");
    return [];
  }
}

async function SetDoc(path: string, data: any) {
  const docRef = doc(db, path);
  await setDoc(docRef, data);
}

export { db, GetDoc, GetDocs, SetDoc };
