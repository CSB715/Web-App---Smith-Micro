import { Button, Modal, Box, TextField, Autocomplete } from "@mui/material";
import { useEffect, useState } from "react";
import { WriteOverride, GetDevices, GetCategories } from "../utils/firestore";
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

export default function AddFlaggedSiteModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [saving, setSaving] = useState(false);
  saving

  const handleSave = async () => {
    setSaving(true);
    try {
      await WriteOverride(userId, url, override);
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  function useData(userId: string, open: boolean) {
    const [categories, setCategories] = useState<string[]>([]);
    const [url, setUrl] = useState("");
    const [override, setOverride] = useState<Override>({
      category: [],
      flagged_for: [],
    });
    const [devices, setDevices] = useState<string[]>([]);
    const [allCategories, setAllCategories] = useState<string[]>([]);

    useEffect(() => {
      if (!open) return;

      async function load() {
        const devicesData = await GetDevices(userId);
        const devices: string[] = devicesData.map((d) => d.data.name);
        setDevices(devices);
        const categoriesData = await GetCategories();
        const allCategories: string[] = categoriesData.map((c) => c.data.label);
        setAllCategories(allCategories);
      }

      load();
    }, [open, userId]);

    useEffect(() => {
      if (!open) return;

      setOverride({ category: categories, flagged_for: devices });
    }, [categories]);

    return {
      categories,
      setCategories,
      url,
      setUrl,
      override,
      allCategories,
    };
  }

  const { categories, setCategories, url, setUrl, override, allCategories } =
    useData(userId, open);

  return (
    <>
      <Button onClick={handleOpen}>Add Site</Button>
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
            <h2 id="modal-modal-title">Add Site</h2>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button onClick={handleClose}>X</Button>
            </Box>
          </Box>
          <TextField
            defaultValue="www.roblox.com"
            onChange={(event) => {
              setUrl(event.target.value);
            }}
          />
          <p>Add Categories:</p>
          <Autocomplete
            multiple
            value={categories}
            onChange={(_: any, newValue: Array<string>) => {
              setCategories(newValue);
            }}
            options={allCategories}
            renderInput={(params) => <TextField {...params} />}
          />
          <Button onClick={handleSave}>Save</Button>
        </Box>
      </Modal>
    </>
  );
}
