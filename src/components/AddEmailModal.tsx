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
  isAccount: boolean;
  open: boolean;
  onClose: () => void;
  onError: () => void;
};

export default function AddEmailModal({ updateUserData, isAccount, open, onClose, onError }: Props) {
  const [newEmail, setNewEmail] = useState("");

  function handleClose() {
    setNewEmail("");
    onClose();
  }

  function handleConfirm() {
    if (newEmail.trim() === "") {
      console.log("New email cannot be empty.");
      return;
    }

    // TODO: email authentication to new address

    // change the auth email
    if (isAccount) {
        
    }

    // add new email to contact list
    const userDoc = doc(getDb(), "Users", getAuthInstance().currentUser!.uid)
    getDoc(userDoc).then((snap) => {
        updateDoc(snap.ref, { emails: arrayUnion(newEmail) })
        .then(async () => {
            handleClose()
            updateUserData((await GetDoc(snap!.ref.path))!.data as UserData);
        })
        .catch((error) => {
            console.error("Error adding email address: ", error);
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
          New Email Address
        </Typography>
        <TextField
          fullWidth
          placeholder="joesmith@example.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
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
