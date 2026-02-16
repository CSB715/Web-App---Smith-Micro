import { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  GetDoc,
  db,
  auth,
  CreateNotificationTrigger,
  GetDevices,
} from "../utils/firestore";
import { doc, type DocumentData } from "firebase/firestore";
import DeviceSelect from "../components/DeviceSelect";
import { Autocomplete, Button, FormControl, RadioGroup, TextField, FormControlLabel, Radio } from "@mui/material";

type AlertType = "Site" | "Category";

export default function CreateNotificationTriggerPage() {
  const notifID  = useLocation().state ? (useLocation().state as { notifID: string }).notifID : "";
  const hasMounted = useRef(false);
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [devices, setDevices] = useState<{ id: string; data: DocumentData }[]>(
    [],
  );
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [ uid, setUid] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertType>("Category");

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log(notifID);
          // if we are passed an id, we edit that document, not create a new one
          if (notifID !== "") {
            // load selected devices and categories
            const notifRef = doc(db, "Users", user.uid, "NotificationTriggers", notifID);
            const notifSnap = await GetDoc(notifRef.path);

            setName(notifSnap!.data.name);
            setCategories(notifSnap!.data.categories ? notifSnap!.data.categories : [] );
            setSelectedDevices(notifSnap!.data.devices);
            setSites(notifSnap!.data.sites ? notifSnap!.data.sites : [] );
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
    CreateNotificationTrigger(
      uid,
      nameInput.value,
      selectedDevices,
      categories,
      sites,
      alertType,
      notifID
    );
    navigate("/settings/notifications");
  }

  return (
    <>
      <FormControl>
        <TextField id="newNotification" 
          label="New Notification" 
          variant="outlined" 
          placeholder="New Notification" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        
        <DeviceSelect
          devices={devices.map((d) => d.data.name)}
          selectedDevices={selectedDevices}
          setSelectedDevices={setSelectedDevices}
        />

        <RadioGroup row 
          aria-labelledby="site-or-category"
          name="site-or-category-group"
          value={alertType}
          onChange={(e) => setAlertType(e.target.value as AlertType)}
        >
          <FormControlLabel value="Site" control={<Radio />} label="Site" />
          <FormControlLabel value="Category" control={<Radio />} label="Category" />
        </RadioGroup>

        {alertType === "Category" && (
          <Autocomplete
            multiple
            value={categories}
            onChange={(_: any, newValue: Array<string>) => {
              setCategories(newValue);
            }}
            options={["Shopping", "Entertainment"]}
            renderInput={(params) => <TextField {...params} placeholder="Pick categories"/>}
          />
        )}

        {alertType === "Site" && (
          <Autocomplete
            freeSolo
            multiple
            value={sites}
            onChange={(_: any, newValue: Array<string>) => {
              setSites(newValue);
            }}
            options={[]} /* add site names maybe?  */
            renderInput={(params) => <TextField {...params} placeholder="Enter site URLs"/>}
          />
        )}

        

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
      </FormControl>




    </>
  );
}
