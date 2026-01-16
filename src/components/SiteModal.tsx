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
import { ref, get, update } from "firebase/database";
import { db } from "../firebase-old";

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

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function SiteModal({
  url,
  user_id,
}: {
  url: string;
  user_id: string;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [categorization, setCategorization] = useState<{
    categories?: string[];
  }>({});
  const [overrides, setOverrides] = useState<{ categories?: string[] }>({});
  const [myOverrides, setMyOverrides] = useState<string[]>([]);
  const key = url.replace(".", ",");

  /*useEffect(() => {
    get(ref(db, `categorization/${key}`)).then((snapshot) => {
      console.debug("Categorization data:", snapshot.val());
      setCategorization(snapshot.val() || []);
    });

    get(ref(db, `users/${user_id}/category_overrides/${key}`)).then(
      (snapshot) => {
        console.debug("Override data:", snapshot.val());
        const data = snapshot.val();
        setOverrides(data || []);
        setMyOverrides(data?.categories || []);
      }
    );
  }, [open]);*/

  const handleSave = () => {
    console.log(myOverrides);
    const updates: Record<string, Array<string>> = {};
    updates[`users/1/category_overrides/${key}/categories`] = myOverrides;
    //update(ref(db), updates);
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
            onChange={(_: any, newValue: Array<string>) => {
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
