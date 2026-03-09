// Settings Page Component
import { useEffect, useRef } from "react";
import "../styles/Page.css";
import { Link, useNavigate } from "react-router";
import { getAuthInstance } from "../utils/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";

const settingsLinks = [
  {
    to: "/settings/flagged-sites",
    label: "Flagged Sites",
    description: "Manage blocked and monitored URLs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
    ),
  },
  {
    to: "/settings/site-categories",
    label: "Site Categories",
    description: "Organise sites into content categories",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: "/settings/notifications",
    label: "Notifications",
    description: "Configure alerts and triggers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    to: "/settings/account",
    label: "Account",
    description: "Manage your profile and devices",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

function Settings() {
  const navigate = useNavigate();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(getAuthInstance(), (user) => {
        if (user) {
        } else {
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, [navigate]);

  return (
    <Box sx={{ py: 3, px: 0 }}>
      <Box sx={{ px: 2.5, mb: 3 }}>


        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0,
              "@keyframes hpulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.4, transform: "scale(0.7)" },
              },
              animation: "hpulse 2.6s ease-in-out infinite",
            }}
          />
          <Typography variant="caption" sx={{ fontFamily: "monospace", letterSpacing: "0.13em", textTransform: "uppercase", color: "primary.main", fontSize: "0.6rem" }}>
            Configuration
          </Typography>
        </Stack>


        <Typography
          variant="h4"
          sx={{ fontWeight: 300, letterSpacing: "-0.02em", mb: 0, "& em": { fontStyle: "italic", color: "primary.main" } }}>
          App Settings
          </Typography>
        
      </Box>

      <Divider sx={{ mb: 3 }} />


      <Paper
        variant="outlined"
        sx={{ borderRadius: 0, borderLeft: "none", borderRight: "none", overflow: "hidden", bgcolor: "background.paper" }}
      >
        {settingsLinks.map((item, idx) => (
          <Box key={item.to}>
            <Box
              component={Link}
              to={item.to}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2.5,
                py: 2,
                textDecoration: "none",
                color: "inherit",
                transition: "background 0.15s ease",
                "&:hover": { bgcolor: "action.hover" },
                "&:hover .settings-chevron": { transform: "translateX(3px)" },
              }}
            >
              <Box
                sx={{
                  width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                  bgcolor: "primary.main", opacity: 0.9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff",
                }}
              >
                {item.icon}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 500, fontSize: "0.9rem", lineHeight: 1.2 }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.primary", opacity: 0.55, fontSize: "0.68rem", fontFamily: "monospace", letterSpacing: "0.03em" }}>
                  {item.description}
                </Typography>
              </Box>

              <Box
                className="settings-chevron"
                sx={{ color: "text.disabled", flexShrink: 0, transition: "transform 0.15s ease" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Box>
            </Box>

            {idx < settingsLinks.length - 1 && <Divider />}
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export default Settings;