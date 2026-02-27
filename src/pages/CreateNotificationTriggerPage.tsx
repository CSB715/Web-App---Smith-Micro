import { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  GetDoc,
  getDb,
  getAuthInstance,
  CreateNotificationTrigger,
  GetDevices,
  GetCategoriesArray,
} from "../utils/firestore";
import { doc, type DocumentData } from "firebase/firestore";
import DeviceSelect from "../components/DeviceSelect";
import { Autocomplete, Button, FormControl, RadioGroup, TextField, FormControlLabel, Radio } from "@mui/material";
import { NumberField } from '@base-ui/react/number-field';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import "../styles/NumberField.css";



type AlertType = "Site" | "Category";

const CATEGORY_ARR = await GetCategoriesArray();

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
  const [limit_hr, setLimit_Hr] = useState<number>(0);
  const [limit_min, setLimit_Min] = useState<number>(0);

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(getAuthInstance(), async (user) => {
        if (user) {
          console.log(notifID);
          // if we are passed an id, we edit that document, not create a new one
          if (notifID !== "") {
            // load selected devices and categories
            const notifRef = doc(getDb(), "Users", user.uid, "NotificationTriggers", notifID);
            const notifSnap = await GetDoc(notifRef.path);

            setName(notifSnap!.data.name);
            setCategories(notifSnap!.data.categories ? notifSnap!.data.categories : [] );
            setSelectedDevices(notifSnap!.data.devices);
            setSites(notifSnap!.data.sites ? notifSnap!.data.sites : [] );
            setLimit_Hr(notifSnap!.data.time_limit_hr);
            setLimit_Min(notifSnap!.data.time_limit_min);
            setAlertType(notifSnap!.data.categories ? "Category" : "Site");
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
      notifID,
      limit_hr,
      limit_min
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
            options={CATEGORY_ARR}
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

        <div className="numberFieldRow">
          <label htmlFor="hours" className="numberFieldLabel">
            Time Limit (hrs)
          </label>
          <NumberField.Root 
            id="hours"
            defaultValue={0} 
            min={0} 
            max={24} 
            value={limit_hr} 
            onValueChange={(value) => setLimit_Hr(value || 0)}
          >
            <NumberField.Group className="numberFieldGroup">
              <NumberField.Input className="numberFieldInput" />
              <div className="numberFieldButtons">
                <NumberField.Increment className="numberFieldButton" >
                  <KeyboardArrowUpIcon fontSize="small" />
                </NumberField.Increment>
                <NumberField.Decrement className="numberFieldButton" >
                  <KeyboardArrowDownIcon fontSize="small" />
                </NumberField.Decrement>
              </div>
            </NumberField.Group>
          </NumberField.Root>

          <label htmlFor="mins" className="numberFieldLabel">
            Time Limit (mins)
          </label>
          <NumberField.Root 
            id="mins"
            defaultValue={0} 
            min={0} 
            max={60} 
            value={limit_min}
            onValueChange={(value) => setLimit_Min(value || 0)}
          >
            <NumberField.Group className="numberFieldGroup">
              <NumberField.Input className="numberFieldInput" /> 
              <div className="numberFieldButtons">
                <NumberField.Increment className="numberFieldButton" >
                  <KeyboardArrowUpIcon fontSize="small" />
                </NumberField.Increment>
                <NumberField.Decrement className="numberFieldButton" >
                  <KeyboardArrowDownIcon fontSize="small" />
                </NumberField.Decrement>
              </div>
            </NumberField.Group>
          </NumberField.Root>
        </div>

        <br />

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
