import type { DocumentData } from "firebase/firestore";
import { doc } from "firebase/firestore";
import {
  getDb,
  getAuthInstance,
  GetUserDevices,
  DeleteDevice,
} from "../utils/firestore";
import { Modal, Box, Typography, Button } from "@mui/material";

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

export default function DeleteDeviceModal({
  currDevice,
  updateDevices,
  open,
  onClose,
  onError,
}: Props) {
  function handleConfirm() {
    DeleteDevice(currDevice!)
      .then(async () => {
        onClose();
        GetUserDevices(
          doc(getDb(), "Users", getAuthInstance().currentUser!.uid),
        ).then((docArr) => {
          updateDevices(docArr);
        });
      })
      .catch((error) => {
        console.error("Error removing device: ", error);
        onClose();
        onError();
      });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", mb: 1 }}>
          Delete {currDevice?.name}?
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          If you delete this device, all data associated with it will be lost.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outlined" color="error" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
