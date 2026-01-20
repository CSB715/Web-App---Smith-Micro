// History Page Component
// STUB
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { db, GetDoc, GetDocs } from "../utils/firestore";
import { use, useEffect, useState } from "react";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import { type DocumentData } from "firebase/firestore";

function History() {
  const [visits, setVisits] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<any[]>([]);
  const nameToIdMap: { [key: string]: string } = {};
  useEffect(() => {
    console.log("rendering");
    GetDocs("Users/7LpcmhJK1QCWn9ETqLN5/userDevices").then((querySnapshot) => {
      let currDevices: any[] = [];
      querySnapshot.forEach((doc) => {
        currDevices.push(doc);
        nameToIdMap[doc.data.deviceName] = doc.id;
      });
      setDevices(currDevices);
      if (selectedDevices.length === 0) {
        setVisits([]);
        return;
      }
      let currVisits: any[] = [];
      const test: { [key: string]: any[] } = {};
      Promise.all(
        selectedDevices.map(async (deviceName: any) => {
          const querySnapshot = await GetDocs(
            `Users/7LpcmhJK1QCWn9ETqLN5/userDevices/${nameToIdMap[deviceName]}/Visits`,
          );
          querySnapshot.forEach((doc) => {
            currVisits.push(doc.data);
            const date = doc.data.startDateTime.toDate();
            const key =
              date.toDateString().slice(4, 7) +
              " " +
              date.getDate() +
              " " +
              date.getFullYear();
            console.log("Visit Key:", key);
            try {
              test[key].push(doc.data);
            } catch {
              test[key] = [doc.data];
            }
          });
        }),
      ).then(() => {
        setVisits(currVisits);
        console.log(test);
      });
    });
  }, [selectedDevices]);
  return (
    <>
      <h1>History Page - Stub</h1>
      {/* History Page Content */}
      <DeviceSelect devices={devices} setSelectedDevices={setSelectedDevices} />
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {visits.map((visit: any, index) => (
          <li key={index}>
            <SiteModal url={visit.siteURL} user_id={"7LpcmhJK1QCWn9ETqLN5"} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default History;
