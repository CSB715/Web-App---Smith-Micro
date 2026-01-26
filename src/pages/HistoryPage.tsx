import {
  GetDocs,
  auth,
  CreateUser,
  GetUserDevices,
  db,
  GetDevices,
  GetVisits,
} from "../utils/firestore";
import { use, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function History() {
  const hasMounted = useRef(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [visits, setVisits] = useState<{ [key: string]: any[] }>({});
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<any[]>([]);
  const [nameToIdMap, setNameToIdMap] = useState<{ [key: string]: string }>({});

  function getDate(date: Date) {
    return (
      date.toDateString().slice(4, 7) +
      " " +
      date.getDate() +
      " " +
      date.getFullYear()
    );
  }

  function sortVisits(currVisits: { [key: string]: any[] }) {
    const sorted = Object.fromEntries(
      Object.entries(currVisits).sort(([a], [b]) => {
        return b.localeCompare(a);
      }),
    );
    setVisits(sorted);
  }

  function loadDevices() {
    if (userId) {
      GetDevices(userId)
        .then((devicesData) => {
          const map: { [key: string]: string } = {};
          devicesData.forEach((doc) => {
            console.log(doc.data.Name);
            map[doc.data.Name] = doc.id;
          });
          setNameToIdMap(map);
          setDevices(devicesData);
        })
        .catch((error) => {
          console.error("loadDevices error:", error);
        });
    } else {
      console.log("No current user");
      setDevices([]);
    }
  }

  function loadVisits() {
    const currVisits: { [key: string]: any[] } = {};
    Promise.all(
      selectedDevices.map(async (deviceName: any) => {
        console.log("Device Name:", deviceName);
        if (userId) {
          console.log("Devices:", devices);
          console.log("User Id", auth.currentUser?.uid);
          console.log("Mapping:", nameToIdMap);
          console.log("Selected Devices", selectedDevices);
          const deviceId = nameToIdMap[deviceName];
          console.log("Device Id:", deviceId);
          if (!deviceId) {
            console.error(`Device ID not found for device name: ${deviceName}`);
            return;
          }
          try {
            const visitsData = await GetVisits(userId, deviceId);
            visitsData.forEach((doc) => {
              const date = doc.data.startDateTime.toDate();
              const key = getDate(date);
              try {
                currVisits[key].push(doc.data);
              } catch {
                currVisits[key] = [doc.data];
              }
            });
          } catch (error) {
            console.error("Error fetching visits:", error);
          }
        }
      }),
    ).then(() => sortVisits(currVisits));
  }
  /*useEffect(() => {
    CreateUser("user@example.com", "password123", "(111) 111-1111");
  }, []);*/
  useEffect(() => {
    if (!hasMounted.current) {
      signInWithEmailAndPassword(auth, "user@example.com", "password123").then(
        () => {
          // CreateUser("spiderman@example.com", "spiders", "(333) 333-3333").then( () => {
          if (auth.currentUser != null) {
            console.log(auth.currentUser.uid);
            setUserId(auth.currentUser.uid);
            loadDevices();
            loadVisits();
          } else {
            console.log("no user currently signed in");
            navigate("/login", { replace: true });
          }
        },
      );
      hasMounted.current = true;
    }
  }, []);

  useEffect(() => {
    console.log("Mapping1:", nameToIdMap);
    loadVisits();
    console.log("Visits:", visits);
  }, [selectedDevices, nameToIdMap]);

  return (
    <>
      <h1>History Page</h1>
      <DeviceSelect devices={devices} setSelectedDevices={setSelectedDevices} />
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {Object.entries(visits).map(([key, value]) => (
          <li key={key}>
            <h2>{key}</h2>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {value.map((visit: any, index) => (
                <li key={index}>
                  <SiteModal
                    url={visit.siteURL}
                    userId={userId}
                    deviceId={key}
                    devices={devices}
                  />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

export default History;
