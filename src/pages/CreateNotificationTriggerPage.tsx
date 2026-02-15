import { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  CreateNotificationTrigger,
  GetDevices,
} from "../utils/firestore";
import type { DocumentData } from "firebase/firestore";
import DeviceSelect from "../components/DeviceSelect";
import { Autocomplete, Button, TextField } from "@mui/material";

export default function CreateNotificationTriggerPage() {
  const { notifID } = ( useLocation().state === null || useLocation().state === "" ) ? "" : useLocation().state;
  const hasMounted = useRef(false);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<string[]>([]);
  const [devices, setDevices] = useState<{ id: string; data: DocumentData }[]>(
    [],
  );
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [ uid, setUid] = useState<string>("");

  useEffect(() => {
    console.log(categories);
  }, [categories]);

  useEffect(() => {
    console.log(selectedDevices);
  }, [selectedDevices]);

  
  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // if we are passed an id, we edit that document, not create a new one
          if (notifID !== "") {
            // load selected devices and categories
            const notifRef = doc(db, "Users", user.uid, "NotificationTriggers", notifID);
            const notifSnap = await GetDoc(notifRef.path);
            setCategories(notifSnap!.data.categories);
            setSelectedDevices(notifSnap!.data.selectedDevices);
            const nameInput = document.getElementById("newNotification") as HTMLInputElement;
            nameInput.value = notifSnap!.data.name;
          }

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
          deviceIds.push(dev.id);
        }
      }
    }

    const nameInput = document.getElementById(
      "newNotification",
    ) as HTMLInputElement;
    console.log(deviceIds);
    CreateNotificationTrigger(
      uid,
      nameInput.value,
      selectedDevices,
      categories,
    );
    navigate("/settings/notifications");
  }

  return (
    <>
      <input type="text" id="newNotification" placeholder="New Notification" />

      <DeviceSelect
        devices={devices.map((d) => d.data.name)}
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
        <Button
          id="cancelNewNotification"
          onClick={() => navigate("/settings/notifications")}
        >
          Cancel
        </Button>
        <Button id="createNewNotification" onClick={() => createNotification()}>
          Create
        </Button>
      </div>
    </>
  );
}
