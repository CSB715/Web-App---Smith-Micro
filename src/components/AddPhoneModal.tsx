import { useState } from "react";
import { getAuthInstance, getDb, GetDoc, type UserData } from "../utils/firestore";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
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
  updateUserData: (data: UserData) => void;
  open: boolean;
  onClose: () => void;
  onError: () => void;
};

export default function AddPhoneModal({ updateUserData, open, onClose, onError }: Props) {
  const [newPhone, setNewPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState("");

  function handleClose() {
    setNewPhone("");
    setPhoneError(false);
    setPhoneErrorMessage("");
    onClose();
  }

  function validatePhone() {
    if (!newPhone.trim() || !/^\d{3}-\d{3}-\d{4}$/.test(newPhone.trim())) {
      setPhoneError(true);
      setPhoneErrorMessage("Please enter a valid phone number (xxx-xxx-xxxx).");
      return false;
    } else {
      setPhoneError(false);
      setPhoneErrorMessage("");
    }
    return true;
  }

  function handleConfirm() {
    if (!validatePhone()) {
      return;
    }

    const userDoc = doc(getDb(), "Users", getAuthInstance().currentUser!.uid)
    getDoc(userDoc).then((snap) => {
        updateDoc(snap.ref, { phones: arrayUnion("+1" + newPhone.replace(/-/g, "")) })
        .then(async () => {
            handleClose()
            updateUserData((await GetDoc(snap!.ref.path))!.data as UserData);
        })
        .catch((error) => {
            console.error("Error adding phone number: ", error);
            handleClose();
            onError();
        });
    })
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
          New Phone Number
        </Typography>
        <TextField
          error={phoneError}
          helperText={phoneErrorMessage}
          fullWidth
          placeholder="555-555-5555"
          value={newPhone}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
            let formatted = digits;
            if (digits.length > 6) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
            else if (digits.length > 3) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
            setNewPhone(formatted);
          }}
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
