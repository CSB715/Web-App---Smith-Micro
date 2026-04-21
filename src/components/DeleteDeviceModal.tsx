import type { DocumentData } from "firebase/firestore";
import { doc } from "firebase/firestore";
import {
  getDb,
  getAuthInstance,
  GetUserDevices,
  DeleteDevice,
} from "../utils/firestore";
import { Modal, Box, Typography, Button } from "@mui/material";
import { getModalStyle } from "../utils/modalStyle";

const style = getModalStyle("small");

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
