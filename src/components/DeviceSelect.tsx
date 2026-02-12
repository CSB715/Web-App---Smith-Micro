import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

export default function DeviceSelect({
  devices,
  selectedDevices,
  setSelectedDevices,
}: {
  devices: string[];
  selectedDevices: string[];
  setSelectedDevices: (devices: string[]) => void;
}) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const handleChange = (_: any, newValue: any[]) => {
    const hasSelectAll = newValue.includes("Select All");
    const filteredValue = newValue.filter((item) => item !== "Select All");
    const hadSelectAll = selectedDevices.includes("Select All");

    if (hasSelectAll && filteredValue.length === devices.length) {
      // All devices are selected, show "Select All" + all devices
      setSelectedDevices(["Select All", ...devices]);
    } else if (hasSelectAll && !hadSelectAll) {
      // "Select All" was just clicked, select all devices
      setSelectedDevices(["Select All", ...devices]);
    } else if (!hasSelectAll && hadSelectAll) {
      // "Select All" was unchecked, clear everything
      setSelectedDevices([]);
    } else {
      // Individual device was unchecked, remove "Select All" and keep selected devices
      setSelectedDevices(filteredValue);
    }
  };

  return (
    <>
      <Autocomplete
        multiple
        value={selectedDevices}
        onChange={handleChange}
        options={["Select All", ...devices]}
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
    </>
  );
}
