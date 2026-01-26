import {
  Autocomplete,
  Modal,
  Button,
  Box,
  TextField,
  Checkbox,
} from "@mui/material";
import { useState, useEffect } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {
  GetCategorizations,
  GetDocs,
  GetOverrides,
  SetDoc,
  WriteOverrides,
} from "../utils/firestore";
import { auth } from "../utils/firestore";
import DeviceSelect from "./DeviceSelect";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function SiteModal({
  url,
  userId,
  deviceId,
  devices,
}: {
  url: string;
  userId: string;
  deviceId: string;
  devices: any;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [categorization, setCategorization] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<string[]>([]);
  const displayURL = url.slice(12, -1);

  function loadCategorization() {
    GetCategorizations().then((catsData) => {
      catsData.forEach((doc) => {
        if (doc.data.siteURL === url) {
          setCategorization(doc.data.categories);
        }
      });
    });
  }

  function loadOverides() {
    if (auth.currentUser != null) {
      GetOverrides(userId, deviceId).then((overridesData) => {
        let set = false;
        overridesData.forEach((doc) => {
          if (doc.data.siteURL === url) {
            setOverrides(doc.data.siteURL);
            set = true;
          }
        });
        if (!set) {
          setOverrides(categorization);
        }
      });
    }
  }
  useEffect(() => {
    /*GetDocs("Categorization").then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data.siteURL === url) {
          setCategorization(doc.data.categories);
        }
      });
    });
    GetDocs(
      "Users/7LpcmhJK1QCWn9ETqLN5/userDevices/qJDvxuD7kDWNt5EA6vJp/Overrides",
    ).then((querySnapshot) => {
      let set = false;
      querySnapshot.forEach((doc) => {
        if (doc.data.siteURL === url) {
          setOverrides(doc.data.categories);
          set = true;
        }
      });
      if (!set) {
        setOverrides(categorization);
      }
    });*/
  }, [open]);

  const handleSave = () => {
    WriteOverrides(userId, deviceId, displayURL, {
      siteURL: url,
      categories: overrides,
      isFlagged: false,
    });
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpen}>{displayURL}</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">{displayURL}</h2>
          <Button onClick={handleClose}>X</Button>
          <a href={url}>visit site</a>
          <p>Original:</p>
          <Autocomplete
            multiple
            disabled
            defaultValue={categorization}
            options={["Shopping", "Entertainment"]}
            renderInput={(params) => <TextField {...params} />}
          />
          <p>My Categories:</p>
          <Autocomplete
            multiple
            value={overrides}
            onChange={(_: any, newValue: Array<string>) => {
              setOverrides(newValue);
            }}
            options={["Shopping", "Entertainment"]}
            renderInput={(params) => <TextField {...params} />}
          />
          <p>Flagged For Devices</p>
          <DeviceSelect devices={devices} setSelectedDevices={() => {}} />
          <Autocomplete
            multiple
            options={["MyPC"]}
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </Box>
      </Modal>
    </>
  );
}
