import { Button, Modal, Box, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { GetDevices, getAuthInstance, WriteOverride } from "../utils/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router";
import DeviceSelect from "./DeviceSelect";
import { type Device } from "../utils/models";
import { getModalStyle } from "../utils/modalStyle";

const style = getModalStyle("large");

type Props = {
  closeModal: () => void;
  isOpen: boolean;
  reloadData: () => void;
};

export default function AddFlaggedSiteModal({
  closeModal,
  isOpen,
  reloadData,
}: Props) {
  const navigate = useNavigate();
  const handleClose = () => {
    closeModal();
  };
  const [_, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [siteError, setSiteError] = useState(false);
  const [siteErrorMessage, setSiteErrorMessage] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);

  function validateSite(siteURL: string) {
    if (!siteURL.trim() || !/\S+\.\S+/.test(siteURL.trim())) {
      setSiteError(true);
      setSiteErrorMessage("Please enter a valid web address.");
      return false;
    } else {
      setSiteError(false);
      setSiteErrorMessage("");
    }
    return true;
  }

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
    if (!validateSite(url)) {
      return;
    }
    try {
      const override = {
        category: [],
        flagged_for: selectedDevices
          .filter((d) => d.id !== "__all__")
          .map((d) => d.id),
      };
      await WriteOverride(userId, url, override);
      reloadData();
      handleClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  function useData(userId: string, open: boolean) {
    const [url, setUrl] = useState("");

    useEffect(() => {
      if (!open) return;

      async function load() {
        const devicesData = await GetDevices(userId);
        const normalizedDevices: Device[] = devicesData.map((d) => ({
          id: d.id,
          name: d.data.name,
        }));
        setDevices(normalizedDevices);
      }

      load();
    }, [open, userId]);

    return {
      url,
      setUrl,
    };
  }

  const { url, setUrl } = useData(userId, isOpen);

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="flagged-site-modal-title"
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
          <Typography
            variant="h2"
            id="modal-modal-title"
            sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
          >
            Add Site
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button onClick={handleClose}>X</Button>
          </Box>
        </Box>
        <TextField
          error={siteError}
          helperText={siteErrorMessage}
          aria-labelledby="url-input-text-field"
          placeholder="example.com"
          onChange={(event) => {
            setUrl(event.target.value);
          }}
          sx={{ width: "100%" }}
          slotProps={{
            htmlInput: {
              maxLength: 100,
            }
          }}
        />
        <Typography variant="h3" sx={{ mt: 2, fontSize: "1.2rem" }}>
          Choose devices to flag on:
        </Typography>
        <DeviceSelect
          devices={devices}
          selectedDevices={selectedDevices}
          setSelectedDevices={setSelectedDevices}
        />
        <br />
        <Button
          sx={{ width: "100%" }}
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>
    </Modal>
  );
}
