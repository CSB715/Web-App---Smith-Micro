import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import "../styles/NavBar.css";

export default function AdminNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState<string>(location.pathname);

  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);


  return (
    <BottomNavigation
      showLabels
      value={value}
      onChange={(_, newValue) => {
        setValue(newValue);
        navigate(newValue);
      }}
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
