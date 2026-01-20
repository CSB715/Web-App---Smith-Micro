import { GetDocs } from "../utils/firestore";
import { useEffect, useState } from "react";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";

function History() {
  const [visits, setVisits] = useState<{ [key: string]: any[] }>({});
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<any[]>([]);
  const nameToIdMap: { [key: string]: string } = {};
  useEffect(() => {
    GetDocs("Users/7LpcmhJK1QCWn9ETqLN5/userDevices").then((querySnapshot) => {
      let currDevices: any[] = [];
      querySnapshot.forEach((doc) => {
        currDevices.push(doc);
        nameToIdMap[doc.data.deviceName] = doc.id;
      });
      setDevices(currDevices);
      if (selectedDevices.length === 0) {
        setVisits({});
        return;
      }
      const currVisits: { [key: string]: any[] } = {};
      Promise.all(
        selectedDevices.map(async (deviceName: any) => {
          const querySnapshot = await GetDocs(
            `Users/7LpcmhJK1QCWn9ETqLN5/userDevices/${nameToIdMap[deviceName]}/Visits`,
          );
          querySnapshot.forEach((doc) => {
            const date = doc.data.startDateTime.toDate();
            const key =
              date.toDateString().slice(4, 7) +
              " " +
              date.getDate() +
              " " +
              date.getFullYear();
            try {
              currVisits[key].push(doc.data);
            } catch {
              currVisits[key] = [doc.data];
            }
          });
        }),
      ).then(() => {
        const sorted = Object.fromEntries(
          Object.entries(currVisits).sort(([a], [b]) => {
            return b.localeCompare(a);
          }),
        );
        setVisits(sorted);
      });
    });
  }, [selectedDevices]);
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
                    user_id={"7LpcmhJK1QCWn9ETqLN5"}
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
