import {
  Autocomplete,
  Modal,
  Button,
  Box,
  TextField,
  Checkbox,
} from "@mui/material";
import { useState } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

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

const devices = ["MyPC"];

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function BasicModal() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Open Modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">amazon.com</h2>
          <Button onClick={handleClose}>X</Button>
          <a href="https://www.amazon.com/">visit site</a>
          <p>Original:</p>
          <Autocomplete
            disabled
            defaultValue={"Shopping"}
            options={["Shopping", "Entertainment"]}
            renderInput={(params) => <TextField {...params} />}
          />
          <p>My Categories:</p>
          <Autocomplete
            multiple
            options={["Shopping", "Entertainment"]}
            renderInput={(params) => <TextField {...params} />}
          />
          <p>Flagged For Devices</p>
          <Autocomplete
            multiple
            options={["MyPC"]}
            renderOption={(props, option, { selected }) => {
              const { key, ...optionProps } = props;
              return (
                <li key={key} {...optionProps}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option}
                </li>
              );
            }}
            renderInput={(params) => <TextField {...params} />}
          />
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Save</Button>
        </Box>
      </Modal>
    </div>
  );
}
