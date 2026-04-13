import type { DocumentSnapshot } from "firebase/firestore";
import {
  DeleteTrigger,
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
  currTrigger: DocumentSnapshot | null;
  open: boolean;
  onClose: () => void;
};

export default function DeleteTriggerModal({
  currTrigger,
  open,
  onClose,
}: Props) {

  function handleConfirm() {
    DeleteTrigger(currTrigger!)
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="del-trigger-modal"
    >
      <Box sx={style}>
        <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", mb: 1 }}>
          Delete {currTrigger?.data()?.name}?
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3, textWrap: "balance" }}>
          If you delete this notification, you will no longer receive alerts for it. Previously recieved alerts will still be visible.
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
