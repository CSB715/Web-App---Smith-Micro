import { Autocomplete, Modal, Button, Box, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import {
  GetCategorization,
  GetOverride,
  WriteOverride,
  GetDevices,
} from "../utils/firestore";
import DeviceSelect from "./DeviceSelect";
import { type Override } from "../utils/models";

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
  // const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // setSaving(true);
    try {
      await WriteOverride(userId, displayUrl, override);
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      // setSaving(false);
    }
  };

  function getDisplayUrl(url: string) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  const displayUrl = getDisplayUrl(url);

  function useSiteMetadata(userId: string, url: string, open: boolean) {
    const [categorization, setCategorization] = useState<string[]>([]);
    const [override, setOverride] = useState<Override>({
      categories: [],
      flaggedFor: [],
    });
    const [devices, setDevices] = useState<string[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

    useEffect(() => {
      if (!open) return;

      async function load() {
        const cat = await GetCategorization(url);
        const categories = cat?.data.categories ?? ["Unknown"];
        setCategorization(categories);

        const override = await GetOverride(userId, url);
        let normalized: Override;
        if (override) {
          normalized = {
            categories: override.data.categories,
            flaggedFor: override.data.flaggedFor,
          };
        } else {
          normalized = {
            categories: categories[0] === "Unknown" ? [] : categories,
            flaggedFor: [],
          };
        }
        setOverride(normalized);
        const devicesData = await GetDevices(userId);
        const devices: string[] = devicesData.map((d) => d.data.name);
        setDevices(devices);
      }

      load();
    }, [open, userId, url]);

    return {
      categorization,
      override,
      setOverride,
      devices,
      selectedDevices,
      setSelectedDevices,
    };
  }

  const {
    categorization,
    override,
    setOverride,
    devices,
    selectedDevices,
    setSelectedDevices,
  } = useSiteMetadata(userId, displayUrl, open);

  return (
    <>
      <Button onClick={handleOpen}>{displayUrl}</Button>
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
            <h2 id="modal-modal-title">{displayUrl}</h2>
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
            value={categorization}
            options={["Shopping", "Entertainment"]}
            renderInput={(params) => <TextField {...params} />}
          />
          <p>My Categories:</p>
          <Autocomplete
            multiple
            value={override.categories}
            onChange={(_: any, newValue: Array<string>) => {
              setOverride({ ...override, categories: newValue });
            }}
            options={["Shopping", "Entertainment"]}
            renderInput={(params) => <TextField {...params} />}
          />
          <p>Flagged For Devices:</p>
          <DeviceSelect
            devices={devices}
            selectedDevices={selectedDevices}
            setSelectedDevices={setSelectedDevices}
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
