import { Button, Modal, Box, TextField, Autocomplete, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { WriteOverride, GetDevices, GetCategories, getAuthInstance } from "../utils/firestore";
import { type Override } from "../utils/models";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router";

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

export default function AddFlaggedSiteModal({ closeModal, isOpen } : 
  {closeModal: () => void, isOpen: boolean}) {
  const navigate = useNavigate();
  const handleClose = () => {
    closeModal();
    setCategories([]);
  };
  const [_, setSaving] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await WriteOverride(userId, url, override);
      handleClose();
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
    }, [categories, url]);

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
    useData(userId, isOpen);

  return (
    <Modal
      open={isOpen}
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
          <Typography variant="h2" id="modal-modal-title" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Add Site
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button onClick={handleClose}>X</Button>
          </Box>
        </Box>
        <TextField
          aria-labelledby="url-input-text-field"
          placeholder="www.example.com"
          onChange={(event) => {
            setUrl(event.target.value);
          }}
          sx={{ width: "100%" }}
        />
        <Typography variant="h3" sx={{ mt: 2, fontSize: "1.2rem" }}>
          Add Categories:
        </Typography>
        <Autocomplete
          aria-label="categories-autocomplete"
          aria-labelledby="categories-autocomplete"
          multiple
          value={categories}
          onChange={(_: any, newValue: Array<string>) => {
            setCategories(newValue);
          }}
          options={allCategories}
          renderInput={(params) => <TextField {...params} />}
        />
        <br />
        <Button sx={{ width: "100%" }} variant="contained" color="primary" onClick={handleSave}>Save</Button>
      </Box>
    </Modal>
  );
}
