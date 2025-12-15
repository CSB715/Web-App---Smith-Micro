import {
  Autocomplete,
  Modal,
  Button,
  Box,
  TextField,
  Checkbox,
} from "@mui/material";
import { useState, useEffect } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {
  ref,
  child,
  get,
  update,
  type DatabaseReference,
} from "firebase/database";
import { db } from "../firebase";

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

interface Site {
  url: string;
  user: DatabaseReference;
}

export default function SiteModal({ url, user }: Site) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [categorization, setCategorization] = useState<DatabaseReference>(
    {} as DatabaseReference
  );
  const [overrides, setOverrides] = useState<DatabaseReference>(
    {} as DatabaseReference
  );
  const key = url.replace(".", ",");

  useEffect(() => {
    get(ref(db, `categorization/${key}`)).then((snapshot) => {
      console.debug("Categorization data:", snapshot.val());
      setCategorization(snapshot.val());
    });

    get(ref(db, `users/1/category_overrides/${key}`)).then((snapshot) => {
      console.debug("Override data:", snapshot.val());
      setOverrides(snapshot.val());
    });
  }, [open]);

  const [myOverrides, setMyOverrides] = useState(overrides.categories);

  const handleSave = () => {
    console.log(myOverrides);
    const updates: Record<string, Array<string>> = {};
    updates[`users/1/category_overrides/${key}/categories`] = myOverrides;
    update(ref(db), updates);
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={handleOpen}>{url}</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">{url}</h2>
          <Button onClick={handleClose}>X</Button>
          <a href="https://www.amazon.com/">visit site</a>
          <p>Original:</p>
          <Autocomplete
            multiple
            disabled
            defaultValue={categorization.categories}
            options={["Shopping", "Entertainment"]}
            renderInput={(params) => <TextField {...params} />}
          />
          <p>My Categories:</p>
          <Autocomplete
            multiple
            defaultValue={overrides.categories}
            onChange={(event: any, newValue: Array<string>) => {
              setMyOverrides(newValue);
            }}
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
          <Button onClick={handleSave}>Save</Button>
        </Box>
      </Modal>
    </div>
  );
}
