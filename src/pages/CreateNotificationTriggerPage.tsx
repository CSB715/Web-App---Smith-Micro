import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, CreateNotificationTrigger, GetDevices } from "../utils/firestore";
import NavBar from "../components/NavBar";
import type { DocumentData } from "firebase/firestore";
import DeviceSelect from "../components/DeviceSelect";
import { Autocomplete, Button, TextField } from "@mui/material";


export default function CreateNotificationTriggerPage() {
  const hasMounted = useRef(false);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<string[]>([])
  const [devices, setDevices] = useState<{ id: string; data: DocumentData }[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [ uid, setUid] = useState<string>("");

  
  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setDevices(await GetDevices(user.uid));
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
    const deviceIds = [];
    for (const device of selectedDevices) {
      for (const dev of devices) {
        if (dev.data.name == device) {
          deviceIds.push(dev.id)
        }
      }
    }

    const nameInput = document.getElementById("newNotification") as HTMLInputElement;
    console.log(deviceIds)
    CreateNotificationTrigger(uid, nameInput.value, selectedDevices, categories);
    navigate("/settings/notifications");
  }

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