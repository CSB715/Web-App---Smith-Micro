import { useState } from "react";
import { doc, DocumentSnapshot, getDoc } from "firebase/firestore";
import { getDb } from "../utils/firestore";
import { classifyURL } from "../utils/classifier";
import { Modal, Box, Button, Typography, TextField, Stack } from "@mui/material";
import "../styles/Modal.css";

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

async function addSite(closeModal : () => void, url: string, showThisModal : (siteURL: string) => void) {

  // get site Categorization if exists
  let docSnap : DocumentSnapshot = await getDoc(doc(getDb(), "Categorization", url));
  if (!docSnap.exists()) {
    console.log("No categorization found, classifying...");
    classifyURL(url);
    // at this point, the site should be in the database
    docSnap = await getDoc(doc(getDb(), "Categorization", url));
  }

  // close this modal
  closeModal();
  // open site modal
  showThisModal(url);
}

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  openSiteModal: (siteURL: string) => void;
}

export default function AddSiteModal( { isOpen, closeModal, openSiteModal } : Props) {
  const [url, setUrl] = useState("");
  const [siteError, setSiteError] = useState(false);
  const [siteErrorMessage, setSiteErrorMessage] = useState("");


  function validateSite(siteURL : string) {
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


  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      aria-labelledby="flagged-site-modal-title"
    >
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "3px solid #000",
            padding: 2,
          }}
        >
          <Typography variant="h2" id="modal-modal-title" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Add Site
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button onClick={closeModal}>X</Button>
          </Box>
        </Box>
        <TextField
          error={siteError}
          helperText={siteErrorMessage}
          aria-labelledby="url-input-text-field"
          placeholder="www.example.com"
          onChange={(event) => {
            setUrl(event.target.value);
          }}
            sx={{ width: "100%" }}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={closeModal}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (!validateSite(url)) {return;}
            addSite(closeModal, url, openSiteModal);
          }}>Confirm</Button>
        </Stack>
      </Box>
    </Modal>
  );
}