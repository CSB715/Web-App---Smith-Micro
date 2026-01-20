import SiteModal from "../components/SiteModal";
import { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../utils/firestore";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function BrowserHistory({ user_id }: { user_id: string }) {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  async function Test() {
    const docRef = doc(
      db,
      `Users`,
      "7LpcmhJK1QCWn9ETqLN5",
      "userDevices",
      "qJDvxuD7kDWNt5EA6vJp",
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      console.log("No such document!");
    }
  }
  Test();

  /*useEffect(() => {
    get(ref(db, `users/${user_id}/user_devices`)).then((snapshot) => {
      console.debug("device data:", snapshot.val());
      setDevices(snapshot.val());
    });
  }, []);
  
  useEffect(() => {
    const visitsArray: any[] = [];
    /*selectedDevices.forEach((device_id) => {
      //console.log("selectedDevices:", selectedDevices);
      get(ref(db, `users/${user_id}/user_devices/${device_id}/visits`)).then(
        (snapshot) => {
          console.debug("Categorization data:", snapshot.val());
          const data = snapshot.val();
          console.log("data for device", device_id, ":", data);
          if (!data) {
            return;
          }
          visitsArray.push(
            ...data.filter((_: any, index: number) => index > 0)
          );
          console.log("VisitsArray after device", device_id, ":", visitsArray);
        }
      );
    });
    get(ref(db, `users/${user_id}/user_devices/1/visits`)).then((snapshot) => {
      console.debug("Categorization data:", snapshot.val());
      const data = snapshot.val();
      const visitsArray = data.filter((_: any, index: number) => index > 0);
      setVisits(visitsArray);
      console.log("snapshot:", data);
      console.log("Visits:", visitsArray);
    });
    setVisits(visitsArray);
    console.log("Visits after set:", visits);
  }, [selectedDevices]);

  console.log("selectedDevices render:", selectedDevices);*/
  return (
    <>
      <Autocomplete
        multiple
        //value={devices.map((device) => device)}
        onChange={(_: any, newValue: any[]) => {
          console.log("Selected devices:", newValue);
          /*console.log(
            "Selected device IDs:",
            newValue
              .filter((_, index) => index > 0)
              .map((device) => device.device_id)
          );
          setSelectedDevices(
            newValue
              .filter((_, index) => index > 0)
              .map((device) => device.device_id)
          );*/
          setSelectedDevices(newValue);
        }}
        options={devices.map((device) => device.device_name)}
        //getOptionLabel={(option) => option.device_name}
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option}
            </li>
          );
        }}
        renderInput={(params) => <TextField {...params} />}
      />
      <h2>Site Visits</h2>
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {visits.map((visit: any, index) => (
          <li key={index}>
            <SiteModal url={visit.site} user_id={user_id} />
          </li>
        ))}
      </ul>
    </>
  );
}
