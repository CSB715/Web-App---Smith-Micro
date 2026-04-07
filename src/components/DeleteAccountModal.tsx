import { DeleteUser } from "../utils/firestore";
import { useNavigate, type NavigateFunction } from "react-router";
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
  uid: string;
  open: boolean;
  onClose: () => void;
  onError: () => void;
};

function onConfirm(uid: string, navigate: NavigateFunction, onClose: () => void, onError: () => void) {
  DeleteUser("Users/" + uid).then(() => {
    onClose();
    navigate("/login", { replace: true });
  })
  .catch((error) => {
    console.log("Error Deleting User " + uid + ": " + error)
    onClose();
    onError();
  });
}

function DeleteAccountModal({ uid, open, onClose, onError }: Props) {
  const navigate = useNavigate();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", mb: 1 }}>
          Delete Account?
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          If you delete your account, all data associated with it will be lost.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outlined" color="error" onClick={() => onConfirm(uid, navigate, onClose, onError)}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default DeleteAccountModal;
