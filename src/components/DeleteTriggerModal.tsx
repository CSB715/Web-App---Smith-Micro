import type { DocumentSnapshot } from "firebase/firestore";
import {
  DeleteTrigger,
} from "../utils/firestore";
import { Modal, Box, Typography, Button } from "@mui/material";
import { getModalStyle } from "../utils/modalStyle";

const style = getModalStyle("small");

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
