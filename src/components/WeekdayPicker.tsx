/** src/components/WeekDayPicker.tsx 
 * component for selecting days of the week, used in CreateNotificationTriggerPage
 */

import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type WeekdayPickerProps = {
    selectedDays: boolean[];
    setSelectedDays: (days :  boolean[]) => void;
};

export default function WeekdayPicker({ selectedDays, setSelectedDays }: WeekdayPickerProps) {

  const selectedValues = days.filter((_, i) => !!selectedDays[i]);

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newSelected: string[],
  ) => {
    const newDays = days.map(d => (newSelected ? newSelected.includes(d) : false));
    setSelectedDays(newDays);
  };

  return (
    <ToggleButtonGroup
      value={selectedValues}
      onChange={handleChange}
      aria-label="weekday picker"
      sx={{ display: 'flex', width: '100%', flexWrap: 'nowrap', overflow: 'hidden' }}
    >
      {days.map((day) => (
        <ToggleButton
          key={day}
          value={day}
          aria-label={day}
          sx={{ flex: '1 1 0%', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {day}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}