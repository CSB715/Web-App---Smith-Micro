import { auth, GetDevices, GetVisits } from "../utils/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import { onAuthStateChanged } from "firebase/auth";
import { type Device, type Visit } from "../utils/models";

function History() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [visits, setVisits] = useState<{ [key: string]: Visit[] }>({});
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [nameToIdMap, setNameToIdMap] = useState<{ [key: string]: string }>({});

  function sortVisitsByDate(visits: { [key: string]: any[] }) {
    return Object.fromEntries(
      Object.entries(visits).sort(([a], [b]) => {
        return b.localeCompare(a);
      }),
    );
  }

  async function loadDevices() {
    const devicesData = await GetDevices(userId);

    const normalized: Device[] = devicesData.map((d) => ({
      id: d.id,
      name: d.data.name,
    }));

    const deviceNames = normalized.map((d) => d.name);
    setDevices(deviceNames);
    setSelectedDevices(deviceNames);
    setNameToIdMap(Object.fromEntries(normalized.map((d) => [d.name, d.id])));
  }

  function groupVisitsByDate(visits: Visit[]) {
    return visits.reduce<Record<string, Visit[]>>((acc, visit) => {
      const key = visit.startDateTime.toDateString();
      acc[key] ??= [];
      acc[key].push(visit);
      return acc;
    }, {});
  }

  async function loadVisits() {
    const allVisits = await Promise.all(
      selectedDevices.map((device) => GetVisits(userId, nameToIdMap[device])),
    );

    const normalizedVisits = allVisits.flat().map((v) => ({
      id: v.id,
      siteUrl: v.data.siteUrl,
      startDateTime: new Date(v.data.startDateTime),
    }));

    setVisits(sortVisitsByDate(groupVisitsByDate(normalizedVisits)));
  }

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
