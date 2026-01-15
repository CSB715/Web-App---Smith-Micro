import { initializeApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";


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
  measurementId: "G-5RJHEYZFTQ"
};
// Initialize Firebase
const app =  initializeApp(firebaseConfig);

// Get a reference to the Realtime Database service
export const db : Database = getDatabase(app);
