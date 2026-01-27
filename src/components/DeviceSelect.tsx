import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

export default function DeviceSelect({
  devices,
  setSelectedDevices,
}: {
  devices: any[];
  setSelectedDevices: (devices: any[]) => void;
}) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  return (
    <>
      <Autocomplete
        multiple
        onChange={(_: any, newValue: any[]) => {
          setSelectedDevices(newValue);
        }}
        options={devices.map((device) => device.name)}
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
