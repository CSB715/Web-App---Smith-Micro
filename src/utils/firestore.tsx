// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  addDoc,
  deleteDoc,
  type DocumentData,
  type DocumentReference,
  getFirestore,
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
export const db = getFirestore(app);
export const auth = getAuth(app);

/* Database Interaction Functions */

export async function GetDoc(path: string) {
  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, data: docSnap.data() };
  } else {
    console.log("No such document!");
    return null;
  }
}

export async function GetDocs(path: string) {
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

export async function SetDoc(path: string, data: any) {
  const docRef = doc(db, path);
  await setDoc(docRef, data);
}

export async function GetDevice(userId: string, deviceId: string) {
  const deviceRef = doc(db, "Users", userId, "Devices", deviceId);
  const deviceSnap = await getDoc(deviceRef);
  if (deviceSnap.exists()) {
    return { id: deviceSnap.id, data: deviceSnap.data() };
  }
  return null;
}

export async function GetDevices(userId: string) {
  const devicesCol = collection(db, "Users", userId, "Devices");
  try {
    const devicesSnap = await getDocs(devicesCol);
    const devicesArr = devicesSnap.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
    return devicesArr;
  } catch (error) {
    console.error("GetDevices error:", error);
    throw error;
  }
}

export async function GetVisits(userId: string, deviceId: string) {
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

export async function GetCategorization(url: string) {
  const catRef = doc(db, "Categorization", url);
  try {
    const catSnap = await getDoc(catRef);
    if (catSnap.exists()) {
      return { id: catSnap.id, data: catSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("GetCategorization error:", error);
    throw error;
  }
}

export async function GetOverride(userId: string, url: string) {
  const overridesCol = doc(db, "Users", userId, "Overrides", url);
  const overridesSnap = await getDoc(overridesCol);
  if (overridesSnap.exists()) {
    return { id: overridesSnap.id, data: overridesSnap.data() };
  }
  return null;
}

export async function WriteOverride(
  userId: string,
  displayURL: string,
  overrides: any,
) {
  const overridesRef = doc(db, "Users", userId, "Overrides", displayURL);
  await setDoc(overridesRef, overrides);
}

export async function GetNotifications(userId: string) {
  const notifsCol = collection(db, "Users", userId, "Notifications");
  const notifsSnap = await getDocs(notifsCol);
  return notifsSnap.docs.map((doc) => ({
    id: doc.id,
    data: doc.data(),
  }));
}

export async function DeleteCollection(path: string) {
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

export async function GetUserDevices(userRef: DocumentReference) {
  const devicesCol = collection(userRef, "Devices");
  const devicesSnap = await getDocs(devicesCol);
  const devicesArr = devicesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return devicesArr;
}

export async function GetUserOverrides(userRef: DocumentReference) {
  const overrideCol = collection(userRef, "Overrides");
  const overridesSnap = await getDocs(overrideCol);
  return overridesSnap;
}

export async function GetUserRef(uid: string) {
  const userDoc = doc(db, "Users", uid);
  const userSnap = await getDoc(userDoc);
  return userSnap.ref;
}

export async function CreateUser(
  email: string,
  password: string,
  phone?: string,
) {
  return createUserWithEmailAndPassword(auth, email, password).then(
    (userCredential) => {
      const userDoc = doc(db, "Users", userCredential.user.uid);
      return setDoc(userDoc, {
        emails: [email],
        phones: phone ? [phone] : [],
      }).then(async () => {
        return await getDoc(userDoc);
      });
    },
  );
}

export async function DeleteUser(path: string) {
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

export function CreateNotificationTrigger(
  uid: string,
  name: string,
  deviceIds: string[],
  categories: string[],
  sites: string[],
  alertType: string,
  notifID: string,
  limit_hr: number,
  limit_min: number
) {
  const docObj = (alertType === "Category") ? {
                                                name: name,
                                                devices: deviceIds,
                                                categories: categories,
                                                time_limit_hr: limit_hr,
                                                time_limit_min: limit_min
                                              }
                                              : {
                                                name: name,
                                                devices: deviceIds,
                                                sites: sites,
                                                time_limit_hr: limit_hr,
                                                time_limit_min: limit_min
                                              };

  if (notifID != "") {
    // For cleanness remove existing notification
    deleteDoc(doc(db, "Users", uid, "NotificationTriggers", notifID));
  }
    
  addDoc(collection(db, "Users", uid, "NotificationTriggers"), docObj);
}

