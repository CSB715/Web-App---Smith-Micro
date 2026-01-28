import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";

export default function NavBar({
  width = 400,
  centered = true,
  position = "fixed",
}: {
  width?: number | string;
  centered?: boolean;
  position?: "fixed" | "absolute" | "relative" | "static" | "sticky";
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState<string>(location.pathname);

  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const navSx = {
    position: position,
    bottom: 0,
    left: centered ? "50%" : 0,
    right: centered ? "auto" : 0,
    transform: centered ? "translateX(-50%)" : "none",
    width: typeof width === "number" ? `${width}px` : width,
    zIndex: 1200,
  };

  return (
    <BottomNavigation
      showLabels
      value={value}
      onChange={(_, newValue) => {
        setValue(newValue);
        navigate(newValue);
      }}
      sx={navSx}
    >
      <BottomNavigationAction label="Notifications" value="/" />
      <BottomNavigationAction label="Summary" value="/summary" />
      <BottomNavigationAction label="History" value="/history" />
      <BottomNavigationAction label="Settings" value="/settings" />
    </BottomNavigation>
  );
}
