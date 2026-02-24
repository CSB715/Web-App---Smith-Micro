import { auth, GetDevices } from "../utils/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import { onAuthStateChanged } from "firebase/auth";
import { type Device, type Visit } from "../utils/models";
import { onSnapshot } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { db } from "../utils/firestore";
import { getDisplayUrl } from "../utils/urls";

function History() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  /*const [visits, setVisits] = useState<{ [key: string]: Visit[] }>({});
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [nameToIdMap, setNameToIdMap] = useState<{ [key: string]: string }>({});*/

  function sortVisitsByDate(visits: { [key: string]: Visit[] }) {
    return Object.fromEntries(
      Object.entries(visits).sort(([a], [b]) => b.localeCompare(a)),
    );
  }

  /*async function loadDevices() {
    const devicesData = await GetDevices(userId);

    const normalized: Device[] = devicesData.map((d) => ({
      id: d.id,
      name: d.data.name,
    }));

    const deviceNames = normalized.map((d) => d.name);
    setDevices(deviceNames);
    setSelectedDevices(deviceNames);
    setNameToIdMap(Object.fromEntries(normalized.map((d) => [d.name, d.id])));
  }*/

  function groupVisitsByDate(visits: Visit[]) {
    return visits.reduce<Record<string, Visit[]>>((acc, visit) => {
      const key = visit.startDateTime.toISOString().split("T")[0];
      acc[key] ??= [];
      acc[key].push(visit);
      return acc;
    }, {});
  }

  /*async function loadVisits() {
    const allVisits = await Promise.all(
      selectedDevices.map((device) => GetVisits(userId, nameToIdMap[device])),
    );

    const normalizedVisits = allVisits.flat().map((v) => ({
      id: v.id,
      siteUrl: v.data.siteUrl,
      startDateTime: new Date(v.data.startDateTime),
      endDateTime: new Date(v.data.endDateTime),
    }));

    setVisits(sortVisitsByDate(groupVisitsByDate(normalizedVisits)));
  }*/

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login", { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  /*useEffect(() => {
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
  }, [selectedDevices, nameToIdMap]);*/

  function useData() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [nameToIdMap, setNameToIdMap] = useState<{ [key: string]: string }>(
      {},
    );
    const [visits, setVisits] = useState<{ [key: string]: Visit[] }>({});
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

    useEffect(() => {
      if (!userId) return;

      async function load() {
        const devicesData = await GetDevices(userId);
        const normalizedDevices = devicesData.map((d) => ({
          id: d.id,
          name: d.data.name,
        }));
        const deviceNames = normalizedDevices.map((d) => d.name);
        setDevices(normalizedDevices);
        setSelectedDevices(deviceNames); // select all by default
        setNameToIdMap(
          Object.fromEntries(normalizedDevices.map((d) => [d.name, d.id])),
        );
      }

      load();
    }, [userId]);

    /*useEffect(() => {
      if (!userId) return;

      async function load() {
        const visitsData = await Promise.all(
          selectedDevices.map((device) =>
            GetVisits(userId, nameToIdMap[device]),
          ),
        );
        const normalizedVisits: Visit[] = visitsData.flat().map((v) => ({
          id: v.id,
          siteUrl: getDisplayUrl(v.data.siteUrl).replace(/^www\./, ""), // remove www. for better display
          startDateTime: new Date(v.data.startDateTime),
          endDateTime: new Date(v.data.endDateTime),
        }));
        setVisits(sortVisitsByDate(groupVisitsByDate(normalizedVisits)));
      }

      load();
    }, [userId, selectedDevices]);*/

    useEffect(() => {
      if (
        !userId ||
        selectedDevices.length === 0 ||
        Object.keys(nameToIdMap).length === 0
      ) {
        return;
      }

      const unsubscribes: (() => void)[] = [];

      // Store visits per device safely
      const visitsByDevice: Record<string, Visit[]> = {};

      selectedDevices.forEach((device) => {
        const deviceId = nameToIdMap[device];
        if (!deviceId) return;

        const visitsRef = collection(
          db,
          "Users",
          userId,
          "Devices",
          deviceId,
          "Visits",
        );

        const unsubscribe = onSnapshot(visitsRef, (snapshot) => {
          const deviceVisits: Visit[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            siteUrl: getDisplayUrl(doc.data().siteUrl).replace(/^www\./, ""),
            startDateTime: new Date(doc.data().startDateTime),
            endDateTime: new Date(doc.data().endDateTime),
          }));

          // Replace visits for this device only
          visitsByDevice[deviceId] = deviceVisits;

          // Combine all devices
          const combined = Object.values(visitsByDevice).flat();

          setVisits(sortVisitsByDate(groupVisitsByDate(combined)));
        });

        unsubscribes.push(unsubscribe);
      });

      return () => {
        unsubscribes.forEach((u) => u());
      };
    }, [userId, selectedDevices, nameToIdMap]);

    return { devices, visits, selectedDevices, setSelectedDevices };
  }

  const { devices, visits, selectedDevices, setSelectedDevices } = useData();

  return (
    <>
      <h1>History Page</h1>
      <DeviceSelect
        devices={devices.map((d) => d.name)}
        selectedDevices={selectedDevices}
        setSelectedDevices={setSelectedDevices}
      />
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {Object.entries(visits).map(([key, value]) => (
          <li key={key}>
            <h2>{key}</h2>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {value.map((visit: any) => (
                <li key={visit.id}>
                  <SiteModal url={visit.siteUrl} userId={userId} />
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
