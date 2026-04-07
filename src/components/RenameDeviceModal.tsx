import type { DocumentData } from "firebase/firestore";
import { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { getDb, getAuthInstance, GetUserDevices } from "../utils/firestore";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";

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

type Props = {
  currDevice: DocumentData | null;
  updateDevices: (data: Array<DocumentData>) => void;
  open: boolean;
  onClose: () => void;
  onError: () => void;
};

export default function RenameDeviceModal({ currDevice, updateDevices, open, onClose, onError }: Props) {
  const [newName, setNewName] = useState("");

  function handleClose() {
    setNewName("");
    onClose();
  }

  function handleConfirm() {
    if (newName.trim() === "") {
      console.log("New device name cannot be empty.");
      return;
    }

    const docRef = doc(getDb(), "Users", getAuthInstance().currentUser!.uid, "Devices", currDevice!.id);
    updateDoc(docRef, { name: newName.trim() })
      .then(async () => {
        handleClose();
        GetUserDevices(doc(getDb(), "Users", getAuthInstance().currentUser!.uid)).then((docArr) => {
          updateDevices(docArr);
        });
      })
      .catch((error) => {
        console.error("Error renaming device: ", error);
        handleClose();
        onError();
      });
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", mb: 2 }}>
          Rename {currDevice?.name}?
        </Typography>
        <TextField
          fullWidth
          placeholder="New Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConfirm();
            }
          }}
          sx={{ mb: 3 }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
