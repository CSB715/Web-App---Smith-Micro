import React, { useEffect, useState, type ReactElement } from "react";
import "./App.css";
import { db } from "./firebase-old";
import { ref, child, get, type DatabaseReference } from "firebase/database";

function App() {
  const [user, setUser] = useState<DatabaseReference>({} as DatabaseReference);
  const [dev1, setDev1] = useState<DatabaseReference>({} as DatabaseReference);
  const [dev2, setDev2] = useState<DatabaseReference>({} as DatabaseReference);

  useEffect(() => {
    const path = `users/1`;

    const nodeRef = ref(db, path);
    get(nodeRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.val());
        } else {
          console.debug("No data available at", path);
        }
      })
      .catch((error) => {
        console.error("Realtime DB get() error:", error);
      });

    get(ref(db, `users/1/user_devices/1`)).then((snapshot) => {
      console.debug("Device 1 data:", snapshot.val());
      setDev1(snapshot.val());
    });

    get(ref(db, `users/1/user_devices/2`)).then((snapshot) => {
      console.debug("Device 2 data:", snapshot.val());
      setDev2(snapshot.val());
    });
  }, []);

  return (
    <>
      <div>
        <h2>Browser History</h2>
        <p>Welcome {user.user_primary_email}</p>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <h3>Devices:</h3>
        <ul>
          <li>
            {" "}
            {dev1.device_name} Pairing Code: {dev1.device_pairing_code}
          </li>
          <li>
            {" "}
            {dev2.device_name} Pairing Code: {dev2.device_pairing_code}
          </li>
        </ul>
      </div>
    </>
  );
}

export default App;
