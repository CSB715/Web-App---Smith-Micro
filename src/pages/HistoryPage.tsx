import { auth, GetDevices, GetVisits } from "../utils/firestore";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import { onAuthStateChanged } from "firebase/auth";
import type { DocumentData } from "firebase/firestore";

function History() {
  const hasMounted = useRef(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [visits, setVisits] = useState<{ [key: string]: any[] }>({});
  const [devices, setDevices] = useState<{ id: string; data: DocumentData }[]>(
    [],
  );
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
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
        const allDeviceNames: string[] = mappedDevices.map(
          (device) => device.data.name,
        );
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
            const date = new Date(doc.data.startDateTime.stringValue);
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

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("User signed in:", user.uid);
          setUserId(user.uid);
        } else {
          console.log("no user currently signed in");
          navigate("/login", { replace: true });
        }
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
                  <SiteModal url={visit.siteUrl.stringValue} userId={userId} />
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
