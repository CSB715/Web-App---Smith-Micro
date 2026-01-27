import { Autocomplete, Modal, Button, Box, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import {
  GetCategorization,
  GetOverride,
  WriteOverride,
  GetDevices,
  auth,
} from "../utils/firestore";
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

export default function SiteModal({
  url,
  userId,
}: {
  url: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [categorization, setCategorization] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<string[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const displayURL = url.slice(12, -1);

  function loadCategorization() {
    GetCategorization(displayURL)
      .then((catData) => {
        if (catData) {
          setCategorization(catData.data.categorization);
        }
      })
      .catch((error) => {
        console.error("Error loading categorization:", error);
      });
  }

  function loadOverides() {
    if (auth.currentUser != null) {
      GetOverride(userId, displayURL)
        .then((overrideData) => {
          if (overrideData) {
            setOverrides(overrideData.data.categories);
          }
        })
        .catch((error) => {
          console.error("Error loading overrides:", error);
        });
    }
  }

  function loadDevices() {
    GetDevices(userId)
      .then((devicesData) => {
        setDevices(devicesData);
      })
      .catch((error) => {
        console.error("loadDevices error:", error);
      });
  }

  useEffect(() => {
    loadCategorization();
    loadDevices();
  }, [open]);

  useEffect(() => {
    loadOverides();
  }, [categorization]); // Load overrides AFTER categorization loads

  const handleSave = () => {
    WriteOverride(userId, displayURL, {
      categories: overrides,
      flaggedFor: [],
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </Box>
      </Modal>
    </>
  );
}
