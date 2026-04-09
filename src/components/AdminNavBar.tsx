import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";

export default function AdminNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [SearchParams] = useSearchParams();
  const [value, setValue] = useState<string>(location.pathname);

  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const handleNavigate = (newValue: string) => {
    const qName = SearchParams.get("q_name");
    const destination = qName
      ? `${newValue}?q_name=${encodeURIComponent(qName)}`
      : newValue;
    navigate(destination);
  };

  return (
    <BottomNavigation
      showLabels
      value={value}
      onChange={(_, newValue) => handleNavigate(newValue)}
    >
      <BottomNavigationAction
        label="Websites & Classifications"
        value="/admin-dashboard"
      />
      <BottomNavigationAction
        label="Common Overrides"
        value="/admin-dashboard/common-overrides"
      />
    </BottomNavigation>
  );
}
