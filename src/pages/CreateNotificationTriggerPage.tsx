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
import { doc, Timestamp } from "firebase/firestore";
import DeviceSelect from "../components/DeviceSelect";
import { Autocomplete, Button, FormControl, RadioGroup, TextField, FormLabel, FormGroup, FormControlLabel, Radio, Checkbox, Link } from "@mui/material";
import { NumberField } from '@base-ui/react/number-field';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Device } from "../utils/models";
import WeekdayPicker from "../components/WeekDayPicker";
import "../styles/NumberField.css";
import type { NotificationTrigger } from "../utils/models";
import dayjs, { Dayjs } from "dayjs";

type AlertType = "Site" | "Category";

export default function CreateNotificationTriggerPage() {
  const notifID  = useLocation().state ? (useLocation().state as { notifID: string }).notifID : "";
  const hasMounted = useRef(false);
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [devices, setDevices] = useState<Device[]>(
    [],
  );
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [ uid, setUid] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertType>("Category");
  const [limit_hr, setLimit_Hr] = useState<number>(0);
  const [limit_min, setLimit_Min] = useState<number>(0);
  const [categoriesArr, setCategoriesArr] = useState<string[]>([]);
  const [email, setEmail] = useState<boolean>(false);
  const [text, setText] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Dayjs>(dayjs());
  const [endTime, setEndTime] = useState<Dayjs>(dayjs());

  const [advancedView, setAdvancedView] = useState<boolean>(false);

  async function loadNotificationTrigger(notifID: string, uid: string) {
    // load selected devices and categories
    const notifRef = doc(getDb(), "Users", uid, "NotificationTriggers", notifID);
    const notifSnap = await GetDoc(notifRef.path);

    setName(notifSnap!.data.name);
    setCategories(notifSnap!.data.categories ? notifSnap!.data.categories : [] );
    for (const deviceName of notifSnap!.data.devices) {
      const deviceRef = doc(getDb(), "Users", uid, "Devices", deviceName);
      const deviceSnap = await GetDoc(deviceRef.path);
      if (deviceSnap) {
        setSelectedDevices((prev) => [...prev, { id: deviceSnap.id, name: deviceSnap.data.name }]);
      }
    }
    setSites(notifSnap!.data.sites ? notifSnap!.data.sites : [] );
    setLimit_Hr(notifSnap!.data.time_limit_hr);
    setLimit_Min(notifSnap!.data.time_limit_min);
    setAlertType(notifSnap!.data.categories ? "Category" : "Site");
    setEmail(notifSnap!.data.email ? true : false);
    setText(notifSnap!.data.text ? true : false);
    const nameInput = document.getElementById("newNotification") as HTMLInputElement;
    nameInput.value = notifSnap!.data.name;
    setSelectedDays(notifSnap!.data.days ? notifSnap!.data.days : []);
    setStartTime(dayjs(notifSnap!.data.startTime.toDate()));
    setEndTime(dayjs(notifSnap!.data.endTime.toDate()));
  }

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(getAuthInstance(), async (user) => {
        if (user) {
          // if we are passed an id, we edit that document, not create a new one
          if (notifID !== "") {
            loadNotificationTrigger(notifID, user.uid);
          }

          const devicesData = await GetDevices(user.uid);
          const normalizedDevices = devicesData.map((d) => ({
            id: d.id,
            name: d.data.name,
          }));

          setDevices(normalizedDevices);
          setCategoriesArr(await GetCategoriesArray());
          setUid(user.uid);
        } else {
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, [navigate]);

  function handleCheckEmailBoxChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.checked);
  }

  function handleCheckTextBoxChange(event: React.ChangeEvent<HTMLInputElement>) {
    setText(event.target.checked);
  }

  function createNotification() {
    const nameInput = document.getElementById(
      "newNotification",
    ) as HTMLInputElement;

    const notif : NotificationTrigger = {
      uid : uid,
      name: nameInput.value,
      devices: selectedDevices,
      categories,
      sites,
      alertType,
      notifID,
      limit_hr,
      limit_min,
      email,
      text,
      days: (selectedDays.length > 0) ? selectedDays : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // if empty, default to all
      startTime: Timestamp.fromDate(startTime.toDate()),
      endTime: Timestamp.fromDate(endTime.toDate()),
    }

    CreateNotificationTrigger(notif);
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
          devices={devices}
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
            options={categoriesArr}
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

        <FormControl component="fieldset">
          <FormLabel component="legend">Notify on site and...</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={email} onChange={handleCheckEmailBoxChange} name="option1" />}
              label="Email"
            />
            <FormControlLabel
              control={<Checkbox checked={text} onChange={handleCheckTextBoxChange} name="option2" />}
              label="Text"
            />
          </FormGroup>
        </FormControl>
        <br />

        
        {advancedView && (
          <div>
            <p>Active During:</p>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker 
                label="Start Time"
                value={startTime}
                onChange={(newValue) => setStartTime(dayjs(newValue))} 
              />
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={(newValue) => setEndTime(dayjs(newValue))} 
              />
            </LocalizationProvider>

            <br />

            <WeekdayPicker selectedDays={selectedDays} setSelectedDays={setSelectedDays} />
          </div>
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


      <Link onClick={() => setAdvancedView(!advancedView)}>
        {advancedView ? "Hide Advanced Options" : "Show Advanced Options"}
      </Link>
    </>
  );
}
