import { getDb, getAuthInstance, GetDevices } from "../utils/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import { onAuthStateChanged } from "firebase/auth";
import { type Device, type Visit } from "../utils/models";
import { onSnapshot } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { getDisplayUrl } from "../utils/urls";

function History() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");

  function sortVisitsByDate(visits: { [key: string]: Visit[] }) {
    return Object.fromEntries(
      Object.entries(visits).sort(([a], [b]) => b.localeCompare(a)),
    );
  }

  function groupVisitsByDate(visits: Visit[]) {
    return visits.reduce<Record<string, Visit[]>>((acc, visit) => {
      const key = visit.startDateTime.toISOString().split("T")[0];
      acc[key] ??= [];
      acc[key].push(visit);
      return acc;
    }, {});
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login", { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  function useData() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [visits, setVisits] = useState<{ [key: string]: Visit[] }>({});
    const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);

    useEffect(() => {
      if (!userId) return;

      async function load() {
        const devicesData = await GetDevices(userId);
        const normalizedDevices = devicesData.map((d) => ({
          id: d.id,
          name: d.data.name,
        }));
        setDevices(normalizedDevices);
        setSelectedDevices(normalizedDevices); // select all by default
      }

      load();
    }, [userId]);

    useEffect(() => {
      // if there are no selected devices we should clear the visits
      if (selectedDevices.length === 0) {
        setVisits({});
        return;
      }

      if (!userId) {
        return;
      }

      const unsubscribes: (() => void)[] = [];

      // Store visits per device safely
      const visitsByDevice: Record<string, Visit[]> = {};

      selectedDevices.forEach((device) => {
        const deviceId = device.id;
        if (!deviceId) return;

        const visitsRef = collection(
          getDb(),
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
    }, [userId, selectedDevices]);

    return { devices, visits, selectedDevices, setSelectedDevices };
  }

  const { devices, visits, selectedDevices, setSelectedDevices } = useData();

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
