// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  deleteDoc,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";
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
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function GetDoc(path: string) {
  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, data: docSnap.data() };
  } else {
    console.log("No such document!");
    return null;
  }
}

async function GetDocs(path: string) {
  const colRef = collection(db, path);
  const colSnap = await getDocs(colRef);
  let objects: { id: string; data: DocumentData }[] = [];
  if (!colSnap.empty) {
    colSnap.forEach((doc) => {
      objects.push({ id: doc.id, data: doc.data() });
    });
    return objects;
  } else {
    console.log("No documents found!");
    return [];
  }
}

async function SetDoc(path: string, data: any) {
  const docRef = doc(db, path);
  await setDoc(docRef, data);
}

async function GetDevices(userId: string) {
  const devicesCol = collection(db, "Users", userId, "Devices");
  const devicesSnap = await getDocs(devicesCol);
  const devicesArr = devicesSnap.docs.map((doc) => ({
    id: doc.id,
    data: doc.data(),
  }));
  return devicesArr;
}

async function GetVisits(userId: string, deviceId: string) {
  const visitsCol = collection(
    db,
    "Users",
    userId,
    "Devices",
    deviceId,
    "Visits",
  );
  const visitsSnap = await getDocs(visitsCol);
  const visitsArr = visitsSnap.docs.map((doc) => ({
    id: doc.id,
    data: doc.data(),
  }));
  return visitsArr;
}

async function DeleteCollection(path: string) {
  const col = collection(db, path);
  const snap = await getDocs(col);
  snap.forEach((doc) => {
    deleteDoc(doc.ref);
  });
}

export type UserData = {
  emails?: Array<string> | null;
  phones?: Array<string> | null;
  [key: string]: any;
};

async function GetUserDevices(userRef: DocumentReference) {
  const devicesCol = collection(userRef, "Devices");
  const devicesSnap = await getDocs(devicesCol);
  const devicesArr = devicesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return devicesArr;
}

async function CreateUser(email: string, password: string, phone: string) {
  return createUserWithEmailAndPassword(auth, email, password).then(
    (userCredential) => {
      const userDoc = doc(db, "Users", userCredential.user.uid);
      return setDoc(userDoc, {
        emails: [email],
        phones: [phone],
      }).then(async () => {
        return await getDoc(userDoc);
      });
    },
  );
}

async function DeleteUser(path: string) {
  const userRef = doc(db, path);
  const devices: Array<DocumentData> = await GetUserDevices(userRef);

  for (const device of devices) {
    DeleteCollection(device.ref.path + "Visits");

    DeleteCollection(device.ref.path + "Overrides");

    deleteDoc(device.ref);
  }

  DeleteCollection(path + "/Notifications");

  DeleteCollection(path + "/NotificationTriggers");

  deleteDoc(userRef);

  auth.currentUser?.delete().then(() => {
    if (auth.currentUser == null) {
      console.log();
    }
  });
}

export {
  db,
  auth,
  GetDoc,
  GetDocs,
  SetDoc,
  GetUserDevices,
  DeleteCollection,
  DeleteUser,
  CreateUser,
  GetDevices,
  GetVisits,
};
