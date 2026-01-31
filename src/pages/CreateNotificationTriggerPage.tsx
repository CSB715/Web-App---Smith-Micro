import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, CreateNotificationTrigger, GetDevices, type Device } from "../utils/firestore";
import NavBar from "../components/NavBar";
import DeviceSelect from "../components/DeviceSelect";
import { Autocomplete, Button, TextField } from "@mui/material";

async function getDevices(uid: string) {
  const deviceArr : Device[] = [];
  const devices = await GetDevices(uid);
  for (const device of devices) {
    const dev : Device = {id : device.id, name : device.data.data.name}
    deviceArr.push(dev)
  }
  return deviceArr;
}


export default function CreateNotificationTriggerPage() {
  const hasMounted = useRef(false);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<string[]>([])
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [ uid, setUid] = useState<string>("");

  
  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("User signed in:", user.uid);
          setDevices(await getDevices(user.uid));
          setUid(user.uid);

        } else {
          console.log("no user currently signed in");
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, [navigate]);

  function createNotification() {
    const nameInput = document.getElementById("newNotification") as HTMLInputElement;
    console.log("created thing")
    // CreateNotificationTrigger(uid, nameInput.value, selectedDevices, categories);
    navigate("/settings/notifications");
  }

  
  /** 
   * 
   * cancel | create
   * 
   */
  return (
    <>
      <input type="text" id="newNotification" placeholder="New Notification"/>

      <DeviceSelect
        devices={devices}
        selectedDevices={selectedDevices}
        setSelectedDevices={setSelectedDevices}
      />

      <Autocomplete
        multiple
        value={categories}
        onChange={(_: any, newValue: Array<string>) => {
          setCategories(newValue);
        }}
        options={["Shopping", "Entertainment"]}
        renderInput={(params) => <TextField {...params} />}
      />

      <div>
        <Button id="cancelNewNotification" onClick={() => navigate("/settings/notifications")}>Cancel</Button>
        <Button id="createNewNotification" onClick={() => createNotification()}>Create</Button>
      </div>

      <NavBar />
    </>
  )
}