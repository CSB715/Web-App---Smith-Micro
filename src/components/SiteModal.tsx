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
import { GetDocs, SetDoc } from "../utils/firestore";
import { type DocumentData } from "firebase/firestore";

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

  const [categorization, setCategorization] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<string[]>([]);
  const display_url = url.slice(12, -1);
  useEffect(() => {
    GetDocs("Categorization").then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data.siteURL === url) {
          setCategorization(doc.data.categories);
        }
      });
    });
    GetDocs(
      "Users/7LpcmhJK1QCWn9ETqLN5/userDevices/qJDvxuD7kDWNt5EA6vJp/Overrides",
    ).then((querySnapshot) => {
      let set = false;
      querySnapshot.forEach((doc) => {
        if (doc.data.siteURL === url) {
          setOverrides(doc.data.categories);
          set = true;
        }
      });
      if (!set) {
        setOverrides(categorization);
      }
    });
  }, [open]);

  const handleSave = () => {
    SetDoc(
      `Users/7LpcmhJK1QCWn9ETqLN5/userDevices/qJDvxuD7kDWNt5EA6vJp/Overrides/${display_url}`,
      { siteURL: url, categories: overrides, isFlagged: false },
    );
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpen}>{display_url}</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 id="modal-modal-title">{display_url}</h2>
          <Button onClick={handleClose}>X</Button>
          <a href={url}>visit site</a>
          <p>Original:</p>
          <Autocomplete
            multiple
            disabled
            defaultValue={categorization}
            options={["Shopping", "Entertainment"]}
            renderInput={(params) => <TextField {...params} />}
          />
          <p>My Categories:</p>
          <Autocomplete
            multiple
            value={overrides}
            onChange={(_: any, newValue: Array<string>) => {
              setOverrides(newValue);
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
    </>
  );
}
