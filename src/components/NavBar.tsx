import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import "../styles/NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState<string>(location.pathname);

  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  // const navSx = {
  //   position: "fixed" as const,
  //   bottom: 0,
  //   left: "50%",
  //   transform: "translateX(-50%)",
  //   width: "100%",
  //   zIndex: 1200,
  //   backgroundColor: "background.paper",
  //   borderTop: "1px solid #ccc",
  // };

  return (
    <BottomNavigation
      showLabels
      value={value}
      onChange={(_, newValue) => {
        setValue(newValue);
        navigate(newValue);
      }}
    >
      <BottomNavigationAction label="Notifications" value="/" />
      <BottomNavigationAction label="Summary" value="/summary" />
      <BottomNavigationAction label="History" value="/history" />
      <BottomNavigationAction label="Settings" value="/settings" />
    </BottomNavigation>
  );
}
