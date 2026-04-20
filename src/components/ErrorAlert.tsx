import { Modal, Box, Typography, Button } from "@mui/material";
import { getModalStyle } from "../utils/modalStyle";

const style = getModalStyle("small");

type Props = {
  open: boolean;
  onClose: () => void;
};

function ErrorAlert({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography sx={{ mb: 3 }}>
          We're sorry, an error occurred. Please try again later.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={onClose}>
            OK
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ErrorAlert;
