import { auth, GetDevices, GetVisits } from "../utils/firestore";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import { signInWithEmailAndPassword } from "firebase/auth";

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
    GetDevices(userId)
      .then((devicesData) => {
        const map: { [key: string]: string } = {};
        devicesData.forEach((doc) => {
          map[doc.data.name] = doc.id;
        });
        setNameToIdMap(map);
        // Map devices to include label property
        const mappedDevices = devicesData.map((doc) => ({
          id: doc.id,
          data: doc.data,
        }));
        setDevices(mappedDevices);
        // Set all devices as selected by default
        const allDeviceNames = mappedDevices.map((device) => device.data.name);
        setSelectedDevices(allDeviceNames);
      })
      .catch((error) => {
        console.error("loadDevices error:", error);
      });
  }

  function loadVisits() {
    const currVisits: { [key: string]: any[] } = {};
    const devicesToLoad = selectedDevices.filter((d) => d !== "Select All");
    Promise.all(
      devicesToLoad.map(async (deviceName: any) => {
        const deviceId = nameToIdMap[deviceName];
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
      }),
    ).then(() => sortVisits(currVisits));
  }

  /*useEffect(() => {
    CreateUser("user@example.com", "password123", "(111) 111-1111");
  }, []);*/

  useEffect(() => {
    if (!hasMounted.current) {
      signInWithEmailAndPassword(auth, "user@example.com", "password123")
        .then(() => {
          if (auth.currentUser != null) {
            console.log("User signed in:", auth.currentUser.uid);
            setUserId(auth.currentUser.uid);
          } else {
            console.log("no user currently signed in");
            navigate("/login", { replace: true });
          }
        })
        .catch((error) => {
          console.error("Sign-in failed:", error.message);
          navigate("/login", { replace: true });
        });
      hasMounted.current = true;
    }
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      loadDevices();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedDevices.length > 0 && Object.keys(nameToIdMap).length > 0) {
      loadVisits();
    } else {
      setVisits({}); // Clear visits when no devices selected
    }
  }, [selectedDevices, nameToIdMap]);

  return (
    <>
      <h1>History Page</h1>
      <DeviceSelect
        devices={devices}
        selectedDevices={selectedDevices}
        setSelectedDevices={setSelectedDevices}
      />
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {Object.entries(visits).map(([key, value]) => (
          <li key={key}>
            <h2>{key}</h2>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {value.map((visit: any, index) => (
                <li key={index}>
                  <SiteModal url={visit.siteURL} userId={userId} />
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
