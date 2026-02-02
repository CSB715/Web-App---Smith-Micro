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
import type { DocumentData } from "firebase/firestore";

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
  const [devices, setDevices] = useState<{ id: string; data: DocumentData }[]>(
    [],
  );
  const displayURL = url
    .replace("https://", "")
    .replace("www.", "")
    .split("/")[0];

  function loadCategorization() {
    GetCategorization(displayURL)
      .then((catData) => {
        if (catData) {
          setCategorization(catData.data.categorization);
        } else {
          setCategorization(["Unknown"]);
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
          } else if (categorization && categorization[0] === "Unknown") {
            setOverrides([]);
          } else {
            setOverrides(categorization);
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              borderBottom: "3px solid #000",
              padding: 2,
            }}
          >
            <h2 id="modal-modal-title">{displayURL}</h2>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button onClick={handleClose}>X</Button>
              <a href={url} target="_blank" rel="noopener noreferrer">
                visit site
              </a>
            </Box>
          </Box>
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
          <DeviceSelect
            devices={devices}
            selectedDevices={[]}
            setSelectedDevices={() => {}}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
