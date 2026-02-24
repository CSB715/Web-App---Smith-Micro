import { Autocomplete, Modal, Button, Box, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import {
  GetCategorization,
  GetOverride,
  WriteOverride,
  GetDevices,
  GetCategories,
} from "../utils/firestore";
import DeviceSelect from "./DeviceSelect";
import { type Categorization, type Override } from "../utils/models";
import { getDisplayUrl } from "../utils/urls";

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

  const displayUrl = getDisplayUrl(url).replace(/^www\./, ""); // remove www. for better display

  function useSiteMetadata(userId: string, url: string, open: boolean) {
    const [categorization, setCategorization] = useState<Categorization>({
      siteUrl: url,
      category: [],
      is_flagged: false,
    });
    const [override, setOverride] = useState<Override>({
      category: [],
      flagged_for: [],
    });
    const [devices, setDevices] = useState<string[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
      if (!open) return;

      async function load() {
        const catData = await GetCategorization(url);
        const cat = {
          siteUrl: url,
          category: catData?.data.category ?? ["Unknown"],
          is_flagged: catData?.data.is_flagged ?? false,
        };
        setCategorization(cat);

        const override = await GetOverride(userId, url);
        let normalized: Override;
        if (override) {
          normalized = {
            category: override.data.category,
            flagged_for: override.data.flagged_for,
          };
        } else {
          normalized = {
            category: cat.category[0] === "Unknown" ? [] : cat.category,
            flagged_for: [],
          };
        }
        setOverride(normalized);
        const devicesData = await GetDevices(userId);
        const devices: string[] = devicesData.map((d) => d.data.name);
        setDevices(devices);
        const categoriesData = await GetCategories();
        const categories: string[] = categoriesData.map((c) => c.data.label);
        setCategories(categories);
        setSelectedDevices(normalized.flagged_for);
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
      categories,
    };
  }

  const {
    categorization,
    override,
    setOverride,
    devices,
    selectedDevices,
    setSelectedDevices,
    categories,
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
            value={categorization.category}
            options={categories}
            renderInput={(params) => <TextField {...params} />}
          />
          <p>My Categories:</p>
          <Autocomplete
            multiple
            value={override.category}
            onChange={(_: any, newValue: Array<string>) => {
              setOverride({ ...override, category: newValue });
            }}
            options={categories}
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
