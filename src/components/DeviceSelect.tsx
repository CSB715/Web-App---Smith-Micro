import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Chip from "@mui/material/Chip";
import { type Device } from "../utils/models";

// `DeviceSelect` now works with option objects (the same shape as `Device`)
// so callers can track IDs and names concurrently.

const ALL_ID = "__all__";

export default function DeviceSelect({
  devices,
  selectedDevices,
  setSelectedDevices,
  submitted = false 
}: {
  devices: Device[];
  selectedDevices: Device[];
  setSelectedDevices: (devices: Device[]) => void;
  submitted? : boolean;
}) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const handleChange = (_: any, newValue: Device[]) => {
    const hasSelectAll = newValue.some((opt) => opt.id === ALL_ID);
    const filteredValue = newValue.filter((opt) => opt.id !== ALL_ID);
    const hadSelectAll = selectedDevices.some((opt) => opt.id === ALL_ID);

    if (hasSelectAll && filteredValue.length === devices.length) {
      // show the synthetic "Select All" option plus actual devices
      setSelectedDevices([{ id: ALL_ID, name: "Select All" }, ...devices]);
    } else if (hasSelectAll && !hadSelectAll) {
      // user just clicked "Select All"
      setSelectedDevices([{ id: ALL_ID, name: "Select All" }, ...devices]);
    } else {
      // normal selection change, drop any existing select-all
      setSelectedDevices(filteredValue);
    }
  };

  return (
    <>
      <Autocomplete<Device, true, false, false>
        multiple
        value={selectedDevices}
        onChange={handleChange}
        options={[{ id: ALL_ID, name: "Select All" }, ...devices]}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
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
              {option.name}
            </li>
          );
        }}
        renderValue={(
          value: Device[] | Device,
          getItemProps: (args: { index: number }) => any,
        ) => {
          const items = Array.isArray(value) ? value : [value];
          return items
            .filter((v) => v.id !== ALL_ID)
            .map((option, index) => {
              const itemProps = getItemProps({ index });
              const { key, ...chipProps } = itemProps;
              return <Chip key={key} {...chipProps} label={option.name} />;
            });
        }}
        renderInput={(params) => (
          <TextField {...params} placeholder="Select Devices..." 
            error={submitted && selectedDevices.length === 0} 
            helperText={submitted && selectedDevices.length === 0 ? "Required" : ""} />
        )}
      />
    </>
  );
}
